---
title: "Optimistic UI"
description: "Show the result of a user action before the server confirms it, and roll back cleanly when it fails, using React 19's useOptimistic and Actions."
order: 9
---

## The problem: a UI that waits for the network

Picture a like button on a post. The user taps it and nothing happens for half a second, then the counter finally ticks up. On a fast office network nobody notices. On a phone with a weak signal, the user taps again because they think the first tap was lost, and now you have two requests in flight.

The usual first version looks like this:

```tsx
import { useState } from "react";

type LikeButtonProps = {
  postId: number;
  initialLikes: number;
};

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isSaving, setIsSaving] = useState(false);

  async function handleLike() {
    setIsSaving(true);
    try {
      const result = await sendLikeToServer(postId);
      setLikes(result.likes);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button onClick={handleLike} disabled={isSaving}>
      {isSaving ? "Saving..." : `Like (${likes})`}
    </button>
  );
}
```

Nothing is wrong with it functionally. The problem is that the UI is honest to a fault: it refuses to show anything until the server agrees. For actions that almost always succeed (likes, toggles, adding a comment, reordering a list), that honesty costs a lot of perceived speed. The "fix" many of us wrote before React 19 was to bump the counter manually, keep a copy of the old value, and restore it in `catch`. That works for one click. With three quick clicks and one failure in the middle, the manual rollback restores the wrong snapshot and the counter drifts away from the truth.

## The pattern: show the expected result, keep the real state separate

Optimistic UI means you render what you expect the server to say, immediately, while the request runs in the background. The important part is not the "show it early" bit; it is keeping two values apart:

- the **committed state**: what the server has confirmed;
- the **optimistic state**: committed state plus the pending changes you are betting on.

When the request succeeds, you update the committed state and the optimistic layer disappears because it now matches. When it fails, you simply drop the pending change. There is nothing to "undo" by hand, because you never touched the committed value.

React 19 gives us exactly this split with `useOptimistic`:

```tsx
const [optimisticValue, addOptimistic] = useOptimistic(committedValue, reducer);
```

`optimisticValue` equals `committedValue` whenever no Action is pending. While an Action (a function running inside `startTransition`, or passed to a form's `action` prop) is in progress, it equals the result of applying your pending updates through `reducer`. When the Action finishes, React throws the optimistic layer away and renders whatever `committedValue` is at that point.

### Step 1: separate committed and optimistic state

```tsx
import { startTransition, useOptimistic, useState } from "react";

type LikeButtonProps = {
  postId: number;
  initialLikes: number;
};

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (currentLikes: number, delta: number) => currentLikes + delta,
  );

  return <button>Like ({optimisticLikes})</button>;
}
```

The reducer form matters here. If the committed `likes` changes while a request is pending (another like comes back from the server, for example), React re-runs the reducer on top of the new committed value, so the pending `+1` stays applied to fresh data instead of an old snapshot.

### Step 2: run the optimistic update inside an Action

```tsx
type LikeResponse = { likes: number };

async function sendLikeToServer(postId: number): Promise<LikeResponse> {
  const response = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  if (!response.ok) {
    throw new Error("Like request failed");
  }
  return response.json();
}

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [error, setError] = useState<string | null>(null);
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (currentLikes: number, delta: number) => currentLikes + delta,
  );

  function handleLike() {
    setError(null);
    startTransition(async () => {
      addOptimisticLike(1);
      try {
        const result = await sendLikeToServer(postId);
        startTransition(() => {
          setLikes(result.likes);
        });
      } catch {
        setError("Could not save your like. Please try again.");
      }
    });
  }

  return (
    <div>
      <button onClick={handleLike}>Like ({optimisticLikes})</button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
```

Walk through what happens:

1. `addOptimisticLike(1)` runs inside the transition, so the button shows `likes + 1` on the very next frame.
2. The request runs. During that time the optimistic value is held.
3. On success, we write the server's number into the committed state. The inner `startTransition` is there because state updates after an `await` are not automatically part of the surrounding transition in React 19; wrapping them keeps the commit and the end of the optimistic layer in the same render, with no flicker.
4. On failure we only set an error. The Action ends, React drops the `+1`, and the counter falls back to the committed `likes`. No manual rollback.

Notice I store what the server returns (`result.likes`) rather than doing `setLikes(prev => prev + 1)`. The server is the source of truth; if two people liked the post at the same time, the server count is right and my local arithmetic is not.

### A note on the repo's demo

tapaScript's source renders two buttons: one calls `addOptimisticLike` directly from `onClick`, the other wraps the call in `startTransition`. The comparison is the lesson. In the first case React logs "An optimistic state update occurred outside a Transition or Action" and the optimistic value reverts almost immediately, because nothing is holding it. Optimistic updates only live as long as an Action is pending.

## A second example: optimistic comments with a form Action

Likes are a number. Comments are a list, and a list needs a temporary identity for the item that the server has not created yet. This is also the case where form Actions shine, because `<form action>` already runs inside a transition, so you do not need `startTransition` at all.

```tsx
import { useOptimistic, useState } from "react";

type Comment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  isSending?: boolean;
};

type CommentListProps = {
  postId: number;
  initialComments: Comment[];
};

async function createComment(postId: number, body: string): Promise<Comment> {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!response.ok) {
    throw new Error("Comment request failed");
  }
  return response.json();
}

export function CommentList({ postId, initialComments }: CommentListProps) {
  const [comments, setComments] = useState(initialComments);
  const [error, setError] = useState<string | null>(null);
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (current: Comment[], pending: Comment) => [...current, pending],
  );

  async function submitComment(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    setError(null);
    addOptimisticComment({
      id: `pending-${crypto.randomUUID()}`,
      author: "You",
      body,
      createdAt: new Date().toISOString(),
      isSending: true,
    });

    try {
      const saved = await createComment(postId, body);
      setComments((current) => [...current, saved]);
    } catch {
      setError("Your comment was not posted. Please try again.");
    }
  }

  return (
    <section>
      <ul>
        {optimisticComments.map((comment) => (
          <li key={comment.id} aria-busy={comment.isSending}>
            <strong>{comment.author}</strong>: {comment.body}
            {comment.isSending && <small> Sending...</small>}
          </li>
        ))}
      </ul>
      {error && <p role="alert">{error}</p>}
      <form action={submitComment}>
        <textarea name="body" required />
        <button type="submit">Post comment</button>
      </form>
    </section>
  );
}
```

A few details worth calling out:

- The temporary item gets a `pending-` id so its `key` never collides with a real one. When the server responds, the real comment (with its real `id` and `createdAt`) lands in `comments`, and the pending one disappears because the Action is over.
- `isSending` lets you style the pending row differently. I usually lower its opacity and hide actions like "Edit" or "Delete" on it, since those need a real id.
- React resets an uncontrolled form after a successful Action, so the textarea clears itself.
- If you need the submit button to show a pending state, put it in a child component and use `useFormStatus`, or switch to `useActionState` when the Action also needs to return a result such as a validation message.

## In 2026 / React 19

Optimistic UI is not new, but how we write it in React is. Where things stand now:

- **`useOptimistic` + Actions is the built-in path.** Before React 19 you either hand-rolled the snapshot and rollback logic or delegated it to a data library. Now the core primitive is in React, and it composes with `<form action>`, `useActionState` and `useFormStatus`.
- **Server Functions.** In Next.js and other RSC frameworks, the Action you pass to a form can be a Server Function (`"use server"`). The optimistic part still lives in a Client Component, because `useOptimistic` is a hook and needs `"use client"`. A common shape is a Server Component that fetches the list, and a small client component that owns the form and the optimistic layer.
- **TanStack Query still has its own story.** If your data lives in the Query cache, optimistic updates usually go through the mutation: either render `mutation.variables` while `isPending` (the simpler approach), or update the cache in `onMutate` and restore it in `onError`. I use the Query approach when the same data appears in several places on the screen, because updating the cache updates all of them; `useOptimistic` is local to one component tree.
- **The committed value must change for the optimistic one to "stick".** This is the mental model shift: `useOptimistic` does not persist anything. If your success path forgets to update the real state (or revalidate the server data), the UI reverts after the Action ends, even though the request succeeded.

## When to use it, and when not to

Use optimistic UI when:

- the action succeeds almost all the time (likes, bookmarks, toggles, reordering, sending a chat message);
- the user can easily see and understand a rollback;
- you can predict the server result well enough to render it.

Avoid it, or be careful, when:

- the action is expensive or irreversible (payments, placing an order, deleting an account). Show a real pending state instead;
- the server computes values you cannot guess (a price after discounts, a generated slug);
- failure is common, for example when validation happens only on the server. Flashing a result and then taking it away feels worse than waiting.

## Common pitfalls

1. **Calling the optimistic setter outside an Action.** You get a console error and the value snaps back immediately. Wrap it in `startTransition` or call it from a form/Action prop.
2. **Not updating the committed state on success.** The optimistic value is temporary by design. Set state, revalidate, or refresh the router after the request succeeds.
3. **Silent failures.** React drops the optimistic change for you, but it does not tell the user why their comment vanished. Always surface an error (a toast, an inline message) and keep the input so they can retry.
4. **Weak temporary ids.** Using the array index or `Date.now()` as the key for pending items causes key collisions and remounts when the real item arrives. Use a clearly separate id such as `pending-<uuid>`.
5. **Stacking optimistic updates without a reducer.** If you pass a plain value instead of a reducer, several quick clicks overwrite each other. With a reducer, each pending action is applied in order.

## Exercises

1. **Optimistic comments with a fake server** (from the repo's task). Use a fake API (json-server or MSW) for `GET /api/posts/:id/comments`. Show the new comment immediately with a "Sending..." label, replace it with the server item (real `id` and `createdAt`) on success, and remove it with an error toast on failure.
2. **Make failures visible.** Make your fake server fail 20% of the time, like the repo's demo does. Then click the like button five times quickly and check that the final number matches the server count.
3. **Toggle, not counter.** Turn the like button into a like/unlike toggle with `useOptimistic(isLiked, (_, next: boolean) => next)`. What should happen if the user clicks twice before the first request returns?
4. **Compare with TanStack Query.** Rebuild the comment list with `useMutation` and render `mutation.variables` while pending. Write down which version is easier to keep in sync when the same comment count also appears in a header.

## Video and source code

- Video (Day 08): [MASTER Optimistic UI Pattern in React 19 || useOptimistic Hook](https://youtu.be/x03yX-yNxas)
- Source code: [day-08 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-08)

This chapter is based on Day 08 of the "15 Days of React Design Patterns" series by tapaScript (Tapas Adhikary), released under the Apache-2.0 license; thanks to him for the original lesson and demo code.
