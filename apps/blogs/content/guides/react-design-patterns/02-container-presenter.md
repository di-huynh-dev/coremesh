---
title: "Container-Presenter Pattern"
description: "Separate data fetching and business logic from rendering so components become easier to read, test and reuse, and see how the idea maps to hooks and Server Components."
order: 2
---

The Container-Presenter pattern is usually the first pattern people learn, and for good reason: it targets the most common smell in React code, a component that does everything. Fetching, error handling, form state, business rules and markup all live in one function, and every change to one concern risks breaking another.

## The problem: one component, five jobs

Here is a user profile page written the "just make it work" way. It loads a user and their posts, lets you edit the profile inline, and handles loading and error states.

```tsx
import { useEffect, useState } from "react";

type User = { id: number; name: string; email: string; bio: string; avatar?: string };
type Post = { id: number; title: string; content: string; createdAt: string };

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", bio: "" });

  async function loadUser() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users/${userId}`);
      const data: User = await response.json();
      setUser(data);
      setFormData({ name: data.name, email: data.email, bio: data.bio });
    } catch {
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    fetch(`${API_URL}/api/users/${userId}/posts`)
      .then((response) => response.json())
      .then(setPosts);
  }, [userId]);

  async function saveProfile() {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setUser(await response.json());
    setIsEditing(false);
  }

  if (loading) return <div className="spinner">Loading user profile...</div>;
  if (error) return <button onClick={loadUser}>{error}. Try again</button>;
  if (!user) return null;

  return (
    <div className="user-profile">
      <img src={user.avatar ?? "/default-avatar.png"} alt={`${user.name}'s avatar`} />
      {isEditing ? (
        <div>
          <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
          <button onClick={() => setIsEditing(false)}>Cancel</button>
          <button onClick={saveProfile}>Save</button>
        </div>
      ) : (
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <p>{user.bio}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}
      <h2>Recent Posts ({posts.length})</h2>
      {posts.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content.slice(0, 150)}...</p>
        </article>
      ))}
    </div>
  );
}
```

Count the reasons this file would change: the API endpoint moves, the error copy changes, the design team restyles the header, the posts list gets pagination, validation is added to the form. Five unrelated reasons, one file. That is the smell.

The practical costs show up quickly. You cannot render this profile in Storybook without mocking `fetch`. You cannot reuse the posts list on another page because it is welded to this user's fetch. Unit testing "does the header show the bio" requires a fake server. And when a save fails, there is nowhere obvious to put a form error, so it silently does nothing.

## The pattern: split "how it works" from "how it looks"

The idea is simple. Split the component into two kinds:

- **Container**: knows *how things work*. It fetches data, holds server state, calls mutations, and decides what happens on retry. It renders almost nothing itself; it passes data and callbacks down.
- **Presenter**: knows *how things look*. It receives everything through props and renders UI. It may hold purely visual state (is a panel open, what is typed in a draft field), but it never talks to an API.

The contract between them is the props type. Once you write that type, each side can evolve independently.

### Step 1: define the contract

```tsx
export type User = { id: number; name: string; email: string; bio: string; avatar?: string };
export type Post = { id: number; title: string; content: string; createdAt: string };
export type ProfileDraft = Pick<User, "name" | "email" | "bio">;

export type UpdateResult = { ok: true } | { ok: false; error: string };

export type UserProfilePresenterProps = {
  user: User | null;
  posts: Post[];
  loading: boolean;
  error: string | null;
  onUpdateUser: (draft: ProfileDraft) => Promise<UpdateResult>;
  onRetry: () => void;
};
```

Notice `onUpdateUser` returns a result object instead of throwing. The presenter does not need to know about HTTP, it only needs to know whether to close the form or show a message.

### Step 2: the container

```tsx
import { useCallback, useEffect, useState } from "react";
import { UserProfilePresenter } from "./UserProfilePresenter";
import type { Post, ProfileDraft, UpdateResult, User } from "./types";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function UserProfileContainer({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`);
      if (!response.ok) throw new Error(response.statusText);
      setUser(await response.json());
    } catch {
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
    fetch(`${API_URL}/api/users/${userId}/posts`)
      .then((response) => response.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [userId, loadUser]);

  async function updateUser(draft: ProfileDraft): Promise<UpdateResult> {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!response.ok) throw new Error(response.statusText);
      setUser(await response.json());
      return { ok: true };
    } catch {
      return { ok: false, error: "Failed to update profile" };
    }
  }

  return (
    <UserProfilePresenter
      user={user}
      posts={posts}
      loading={loading}
      error={error}
      onUpdateUser={updateUser}
      onRetry={loadUser}
    />
  );
}
```

There is exactly one JSX element here. Everything about the network lives in this file, so swapping `fetch` for TanStack Query or an SDK later touches nothing else.

### Step 3: the presenter

The presenter owns the editing UI state, because "is the form open" and "what is in the draft" are visual concerns. It gets the real data and the save function from props.

```tsx
import { useState } from "react";
import { ErrorMessage } from "../common/ErrorMessage";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { PostsList } from "../post/PostsList";
import { ProfileHeader } from "./ProfileHeader";
import type { ProfileDraft, User, UserProfilePresenterProps } from "./types";

function toDraft(user: User): ProfileDraft {
  return { name: user.name, email: user.email, bio: user.bio };
}

export function UserProfilePresenter({
  user,
  posts,
  loading,
  error,
  onUpdateUser,
  onRetry,
}: UserProfilePresenterProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (loading) return <LoadingSpinner message="Loading user profile..." />;
  if (error) return <ErrorMessage title="Oops! Something went wrong" message={error} onRetry={onRetry} />;
  if (!user) return null;

  function startEditing(currentUser: User) {
    setDraft(toDraft(currentUser));
    setFormError(null);
    setIsEditing(true);
  }

  function changeField(field: keyof ProfileDraft, value: string) {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
    setFormError(null);
  }

  async function save() {
    if (!draft) return;
    const result = await onUpdateUser(draft);
    if (result.ok) setIsEditing(false);
    else setFormError(result.error);
  }

  return (
    <div className="user-profile">
      <ProfileHeader
        user={user}
        draft={isEditing ? draft : null}
        formError={formError}
        onStartEdit={() => startEditing(user)}
        onCancelEdit={() => setIsEditing(false)}
        onFieldChange={changeField}
        onSave={save}
      />
      <PostsList posts={posts} />
    </div>
  );
}
```

I copy the user into the draft when editing starts rather than syncing it with a `useEffect` on every `user` change. That removes an effect and a whole class of "form reset while typing" bugs.

### Step 4: break the presenter into small pieces

Presenters compose well because they only take props. `PostsList`, `LoadingSpinner` and `ErrorMessage` are now reusable anywhere.

```tsx
import type { Post } from "../profile/types";

export function PostsList({ posts }: { posts: Post[] }) {
  return (
    <section className="user-posts">
      <h2>Recent Posts ({posts.length})</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="post-card">
            <h3>{post.title}</h3>
            <p>{post.content.slice(0, 150)}...</p>
            <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString()}</time>
          </article>
        ))
      )}
    </section>
  );
}
```

```tsx
type ErrorMessageProps = { title: string; message: string; onRetry: () => void };

export function ErrorMessage({ title, message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="error-container">
      <h3>{title}</h3>
      <p>{message}</p>
      <button onClick={onRetry}>Try Again</button>
    </div>
  );
}
```

`ProfileHeader` follows the same shape: it takes `user`, `draft`, `formError` and four callbacks, and renders either the read-only view or the form. You can now write a Storybook story for every state (loading, error, read, editing, save failed) by passing plain objects.

## A second example: a product list with a cart

The same split works for a shop page. This time I let the container be a custom hook, which is how I write it most often today.

```tsx
import { useEffect, useMemo, useState } from "react";

export type Product = { id: string; name: string; price: number; category: string };
export type SortKey = "price-asc" | "price-desc" | "name";

export function useProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products", { signal: controller.signal })
      .then((response) => response.json())
      .then(setProducts)
      .catch((reason) => {
        if (reason.name !== "AbortError") setError("Could not load products");
      });
    return () => controller.abort();
  }, []);

  const cartTotal = useMemo(
    () => products.reduce((sum, product) => sum + product.price * (cart[product.id] ?? 0), 0),
    [products, cart],
  );

  function addToCart(productId: string) {
    setCart((current) => ({ ...current, [productId]: (current[productId] ?? 0) + 1 }));
  }

  return { products, error, cart, cartTotal, addToCart };
}
```

```tsx
import { useState } from "react";
import { useProductCatalog, type Product, type SortKey } from "./useProductCatalog";

const comparators: Record<SortKey, (a: Product, b: Product) => number> = {
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

type ProductListPresenterProps = {
  products: Product[];
  cartTotal: number;
  onAddToCart: (productId: string) => void;
};

export function ProductListPresenter({ products, cartTotal, onAddToCart }: ProductListPresenterProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const sortedProducts = [...products].sort(comparators[sortKey]);

  return (
    <section>
      <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
        <option value="name">Name</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
      <ul>
        {sortedProducts.map((product) => (
          <li key={product.id}>
            {product.name} · ${product.price}
            <button onClick={() => onAddToCart(product.id)}>Add to cart</button>
          </li>
        ))}
      </ul>
      <p>Cart total: ${cartTotal.toFixed(2)}</p>
    </section>
  );
}

export function ProductListPage() {
  const { products, error, cartTotal, addToCart } = useProductCatalog();
  if (error) return <p role="alert">{error}</p>;
  return <ProductListPresenter products={products} cartTotal={cartTotal} onAddToCart={addToCart} />;
}
```

`ProductListPage` is now a three-line container. Sorting stays in the presenter because it is a view preference; the cart lives in the hook because it is app state other pages will need.

## In 2026 / React 19

The *idea* of separating logic from rendering is as useful as ever. The *shape* has changed.

- **Custom hooks are the default container.** Dan Abramov, who popularized the original article, added a note back in 2019 saying he no longer recommends splitting components this way dogmatically, because hooks let you extract the logic without an extra component. In practice I write `useUserProfile()` far more often than `UserProfileContainer`. The presenter still benefits from being prop-driven.
- **Server Components are natural containers.** In Next.js App Router, an `async` Server Component can fetch data directly and render a Client Component presenter with plain props. The data code never ships to the browser. Only the interactive presenter needs `"use client"`.

```tsx
import { ProfileView } from "./ProfileView";
import { getUser, getPosts } from "@/lib/users";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
  return <ProfileView user={user} posts={posts} />;
}
```

- **Data libraries absorb most container code.** TanStack Query or SWR already handle loading, error, retry and caching. Your "container" often shrinks to `const query = useQuery(...)`.
- **Mutations can be Actions.** With `useActionState` and `<form action>`, the save flow (pending state, error message) can live in a small hook or Server Function instead of hand-written `try/catch` plus three `useState` calls.
- **React Compiler** handles memoizing callbacks you pass to presenters, so you rarely need `useCallback` just to keep a presenter from re-rendering.

## When to use it, and when not to

Use it when:

- The same UI needs to be driven by different data sources (real API, mock, Storybook, another page).
- A component mixes network code and a lot of markup, and changes to one keep breaking the other.
- You want presenters in a design system that designers and QA can review in isolation.

Skip it when:

- The component is small and used in one place. A 40-line component with one fetch is fine as is.
- A custom hook gives you the same separation with less ceremony.
- You would end up with a container that only forwards props unchanged.

## Common pitfalls

1. **Presenters that sneak in data access.** Once a presenter imports an API client or a global store, it is no longer reusable. Keep imports in presenters to UI components and types.
2. **Containers that render real layout.** If the container has divs, class names and conditional markup, you have just moved the mess. A container should render one presenter, maybe wrapped in a boundary.
3. **Prop explosion.** If a presenter takes 20 props, it is probably several presenters. Split it, or pass a well-typed object.
4. **Syncing props into state with effects.** Copying `user` into local state with `useEffect` causes flicker and lost edits. Initialize the draft on an event (like "start editing") or use a `key` to reset.
5. **Splitting everything by reflex.** Two files per component doubles navigation cost. Apply the pattern where it pays off.

## Exercises

1. Build a `ProductListContainer` (or `useProductCatalog` hook) that handles fetching, cart management and error handling. Build a `ProductListPresenter` that renders products, sort and filter controls, and add-to-cart buttons.
2. Split the presenter into `ProductCard`, `SortFilterControls` and `CartSummary`. Check the success criteria: the container has no layout JSX, presenters have no API calls, and every presenter can render from plain props.
3. Write a Storybook story or a test for each state of `UserProfilePresenter`: loading, error, read-only, editing, save failed.
4. Move the profile data fetching into a Server Component (or TanStack Query) and confirm the presenter did not need to change.

## Video and source code

This chapter is adapted from Day 01 of tapaScript's "15 Days of React Design Patterns" by Tapas Adhikary; watch the video for the live refactor and grab the original code from the repo.

- Video: [React Container-Presenter Pattern | Code Smell to Clean Code](https://youtu.be/1UHbhikwg-s)
- Source code: [github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-01](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-01)
