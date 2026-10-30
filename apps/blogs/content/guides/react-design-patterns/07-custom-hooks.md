---
title: "Custom Hooks"
description: "Pull stateful logic out of components into reusable, typed hooks, follow the Rules of Hooks, and use what React 19 adds to the toolbox."
order: 7
---

## The problem: components that do everything

Here is a component I see a lot in real projects, mine included in the early days. It shows a list of movies, has a button to toggle a compact view, and does the fetching itself:

```tsx
import { useEffect, useState } from "react";

type Movie = { id: string; title: string; director: string };

export function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/movies")
      .then((response) => response.json())
      .then((result: { movies: Movie[] }) => setMovies(result.movies))
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p>Loading movies...</p>;
  if (errorMessage) return <p role="alert">Error: {errorMessage}</p>;

  return (
    <section>
      <button type="button" onClick={() => setIsCompact((value) => !value)}>
        {isCompact ? "Show details" : "Compact view"}
      </button>
      <ul>
        {movies.map((movie) => (
          <li key={movie.id}>
            {movie.title}
            {!isCompact && <span> by {movie.director}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Nothing here is wrong in isolation. The problem is what happens next. The theme switcher in the header needs the same "flip a boolean" logic. The directors page needs the same "fetch JSON, track loading and error" logic. So the code gets copied, and each copy is slightly different: one forgets `response.ok`, another forgets to clear the error on retry. Meanwhile, reading `MovieList` means scrolling past four `useState` calls and an effect before you reach the part that renders movies.

Previous chapters solved this with render props and HOCs. Both work, but both add wrappers to the component tree. Custom hooks let us extract the logic *without changing the tree at all*.

## The pattern: a function that uses hooks

A hook is a function that lets a component "hook into" React features like state, effects and context. React ships built-in ones (`useState`, `useEffect`, `useContext`, `useRef`, `useReducer`, `useActionState`, ...). A **custom hook** is simply your own function whose name starts with `use` and that calls other hooks. That is the entire definition. There is no special API to register it.

Two rules apply to every hook, built-in or custom:

1. **Only call hooks at the top level** of a component or another hook. Not inside conditions, loops, or nested functions. React identifies each piece of state by the order in which hooks are called, so the order must be the same on every render.
2. **Only call hooks from React functions**: components or other hooks, not from regular utilities or event handlers.

The `use` prefix is not decoration. It is how the linter (`eslint-plugin-react-hooks`) and React Compiler know a function follows these rules.

### Step 1: extract the simplest piece, `useToggle`

```ts
import { useState } from "react";

export function useToggle(initialValue = false) {
  const [isOn, setIsOn] = useState(initialValue);

  function toggle() {
    setIsOn((value) => !value);
  }

  return [isOn, toggle] as const;
}
```

Returning a tuple (with `as const` so TypeScript keeps the exact types) lets each caller name the values as they like, just like `useState`:

```tsx
const [isCompact, toggleCompact] = useToggle();
const [isDarkMode, toggleDarkMode] = useToggle(true);
```

### Step 2: extract the data fetching, `useFetch`

The fetching logic is bigger, so it deserves more care. Two things the original version ignored: requests can finish out of order if the URL changes quickly, and the component can unmount before the response arrives.

```ts
import { useEffect, useState } from "react";

type FetchResult<TData> = {
  url: string;
  data: TData | null;
  error: Error | null;
};

export function useFetch<TData>(url: string) {
  const [result, setResult] = useState<FetchResult<TData> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        return response.json() as Promise<TData>;
      })
      .then((data) => setResult({ url, data, error: null }))
      .catch((error: Error) => {
        if (error.name !== "AbortError") setResult({ url, data: null, error });
      });

    return () => controller.abort();
  }, [url]);

  const currentResult = result?.url === url ? result : null;

  return {
    data: currentResult?.data ?? null,
    error: currentResult?.error ?? null,
    isLoading: currentResult === null,
  };
}
```

Instead of a separate `isLoading` state, the hook remembers which URL the stored result belongs to. If the URL changed and the new response has not arrived yet, the result is stale and we report loading. The `AbortController` cancels the old request in the cleanup, so a slow response for an old URL can never overwrite a newer one.

### Step 3: the component becomes a description of the UI

```tsx
import { useFetch } from "../hooks/useFetch";
import { useToggle } from "../hooks/useToggle";

type Movie = { id: string; title: string; director: string };

export function MovieList() {
  const { data, error, isLoading } = useFetch<{ movies: Movie[] }>("/api/movies");
  const [isCompact, toggleCompact] = useToggle();

  if (isLoading) return <p>Loading movies...</p>;
  if (error) return <p role="alert">Error: {error.message}</p>;

  return (
    <section>
      <button type="button" onClick={toggleCompact}>
        {isCompact ? "Show details" : "Compact view"}
      </button>
      <ul>
        {data?.movies.map((movie) => (
          <li key={movie.id}>
            {movie.title}
            {!isCompact && <span> by {movie.director}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

The component tree is identical to before, no wrappers. But now `MovieList` reads top to bottom: get movies, get a toggle, render. And `useFetch` and `useToggle` can be unit tested on their own with `renderHook` from Testing Library.

## A second example: `useAuth`, and what hooks do not share

The repo's second example is an authentication hook. Here it is in TypeScript:

```ts
import { useState } from "react";

type User = { name: string };

async function requestLogin(username: string, password: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return username && password ? { name: username } : null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  async function login(username: string, password: string) {
    const loggedInUser = await requestLogin(username, password);
    setUser(loggedInUser);
    return loggedInUser !== null;
  }

  function logout() {
    setUser(null);
  }

  return { user, isAuthenticated: user !== null, login, logout };
}
```

```tsx
import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";

export function AuthPanel() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login(credentials.username, credentials.password);
  }

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user?.name}</p>
        <button type="button" onClick={logout}>Log out</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={credentials.username}
        onChange={(event) => setCredentials({ ...credentials, username: event.target.value })}
        required
      />
      <input
        type="password"
        name="password"
        value={credentials.password}
        onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
        required
      />
      <button type="submit">Log in</button>
    </form>
  );
}
```

Now the important lesson. Put `AuthPanel` in the sidebar and a `Navbar` that also calls `useAuth()` in the header. Log in through the panel. The navbar still says you are logged out.

That is not a bug in the hook. **Custom hooks share logic, not state.** Every call to `useAuth()` runs its own `useState`, so every component gets its own private `user`. This is the single most common misunderstanding about custom hooks. If you need one piece of state visible to many components, you combine a hook with a context provider, which is exactly the next chapter.

## Custom hooks in 2026 and React 19

Custom hooks are the default way to reuse logic in React today, and that is not changing. What has changed is the set of tools you use inside them:

- **React Compiler** (stable since late 2025) memoizes values and functions automatically. Inside an app that uses the compiler, you no longer need to wrap every returned function in `useCallback` to keep it stable. If you publish hooks to other projects that might not use the compiler, stable references still matter.
- **`useEffectEvent`** (stable in React 19.2) solves the classic "my effect needs the latest callback but should not re-run when it changes" problem. It is perfect for hooks like `useClickOutside(ref, onOutsideClick)`: wrap `onOutsideClick` in `useEffectEvent` and subscribe to the document once.
- **`useSyncExternalStore`** is the right primitive for hooks that read from something outside React: `localStorage`, `matchMedia`, online status, a WebSocket store. It handles concurrent rendering correctly, which a hand-rolled `useEffect` plus `useState` does not always do.
- **`use`** reads a promise or a context during render. A hook can accept a promise created by a parent or a framework and let Suspense handle the loading state, instead of tracking `isLoading` by hand. The promise has to be created outside render (or cached), not inside the hook on every render.
- **Actions and `useActionState`** cover the "submit, show pending, store result" flow. The login form above can be rewritten so the pending state and the result come from React:

```tsx
import { useActionState } from "react";

type LoginState = { errorMessage: string | null };

export function LoginForm({ onLogin }: { onLogin: (username: string, password: string) => Promise<boolean> }) {
  const [state, submitLogin, isPending] = useActionState(
    async (_previousState: LoginState, formData: FormData): Promise<LoginState> => {
      const isLoggedIn = await onLogin(String(formData.get("username")), String(formData.get("password")));
      return { errorMessage: isLoggedIn ? null : "Wrong username or password" };
    },
    { errorMessage: null },
  );

  return (
    <form action={submitLogin}>
      <input name="username" required />
      <input type="password" name="password" required />
      <button type="submit" disabled={isPending}>{isPending ? "Logging in..." : "Log in"}</button>
      {state.errorMessage && <p role="alert">{state.errorMessage}</p>}
    </form>
  );
}
```

- **Server data**: a `useFetch` like ours is great for learning, but in production I reach for TanStack Query (or the framework's data layer). It adds caching, deduplication, retries and background refetching, all things you would eventually rebuild by hand.
- **Server Components** cannot use state or effects, so a component that calls a stateful custom hook must be a Client Component (`"use client"`). On the server, you often do not need the hook at all: an async Server Component can `await` the data directly.

## When to use it, and when not to

Write a custom hook when:

- Two or more components need the same stateful logic.
- A component's body is mostly bookkeeping (state, effects, subscriptions) and you want it to read like a description of the UI.
- You want to test logic separately from rendering.
- You are wrapping a browser API (clipboard, storage, media queries, intersection observer) so components do not deal with it directly.

Do not write one when:

- The logic has no state and no effects. A plain function such as `formatDuration(minutes)` is enough. Naming it `useFormatDuration` only adds rules you do not need.
- It would be used exactly once and extracting it does not make the component clearer.
- You actually need shared state across the tree. A hook alone will not do it; you need context or a store (Zustand, for example).

## Common pitfalls

1. **Expecting shared state**. Two components calling `useAuth()` get two separate users. Use a provider or a store for shared state.
2. **Calling hooks conditionally**. `if (isEnabled) useFetch(url)` breaks the call order. Move the condition inside the hook instead, for example accept `url: string | null` and skip fetching when it is `null`.
3. **Ignoring cleanup and races**. Effects inside hooks must clean up subscriptions, timers and requests. Otherwise you get memory leaks and stale responses overwriting fresh ones.
4. **God hooks**. A `usePage()` that fetches three things, manages a form and handles analytics is just the old messy component moved to another file. Keep hooks focused and compose them.
5. **Unstable return values without the compiler**. Returning a new object or function every render is fine for rendering, but if callers put them in an effect dependency array, the effect re-runs every time. With React Compiler this mostly goes away; without it, memoize what callers are likely to depend on.

## Exercises

From the original task, build these three hooks without external libraries, each with a small demo component and proper edge case handling:

1. **`useLocalStorage(key, initialValue)`**: keep state in sync with `localStorage`. Handle invalid JSON, the storage being unavailable (private mode, server rendering), and changes made in another tab (the `storage` event). Bonus: build it on `useSyncExternalStore`.
2. **`useClipboard()`**: return `copy(text)` and an `isCopied` flag that resets after two seconds. Handle the Clipboard API being unavailable or rejecting, and clear the timer on unmount.
3. **`useClickOutside(ref, onOutsideClick)`**: call the callback when a click or touch happens outside the element. Use it to close a dropdown. Try writing it with and without `useEffectEvent` and notice how often the listener is re-attached.

And two of mine:

4. **`useDebouncedValue(value, delayMs)`**: use it to debounce a search input before passing the query to `useFetch`.
5. **Test a hook**: write tests for `useToggle` and `useFetch` with `renderHook`, including the case where the URL changes before the first response arrives.

## Video and source code

- Video (Day 06): [Custom Hooks Pattern](https://www.youtube.com/watch?v=fhwvqTry_Vg)
- Source code: [day-06 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-06)

This chapter is based on Day 06 of tapaScript's "15 Days of React Design Patterns" by Tapas Adhikary, rewritten in TypeScript with extra examples and notes for React 19.
