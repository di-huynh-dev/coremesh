---
title: "Performance Patterns"
description: "Memoization, derived state, debounce, throttle, lazy loading, isolation, virtualization, transitions and deferred values, and what React Compiler changes."
order: 12
---

## The problem: a page that gets slower as it grows

Most React performance problems I have seen were not caused by one slow function. They come from a page that slowly collects small mistakes: a list sorted on every keystroke, a total copied into state with an effect, a search that hits the API on every character, a memoized child that re-renders anyway because it receives a new callback each time.

Here is a compressed version of that page:

```tsx
import { memo, useEffect, useState } from "react";

type User = { id: number; name: string; active: boolean };

const UserTable = memo(function UserTable({ users, onSelect }: {
  users: User[];
  onSelect: (id: number) => void;
}) {
  return (
    <ul>
      {users.map((user, index) => (
        <li key={index} onClick={() => onSelect(user.id)}>{user.name}</li>
      ))}
    </ul>
  );
});

export function UsersPage({ allUsers }: { allUsers: User[] }) {
  const [query, setQuery] = useState("");
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    setActiveCount(allUsers.filter((user) => user.active).length);
  }, [allUsers]);

  useEffect(() => {
    fetch(`/api/search?q=${query}`);
  }, [query]);

  const sorted = allUsers.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <p>Active: {activeCount}</p>
      <UserTable users={sorted} onSelect={(id) => console.info(id)} />
    </>
  );
}
```

Every keystroke sorts (and mutates) the whole array, sends a request, and re-renders a 10,000-row table whose `memo` is defeated by the inline `onSelect`. The effect for `activeCount` renders twice for no reason. None of these is dramatic alone; together they make typing feel sticky.

This chapter is a toolbox rather than a single pattern. Part 1 covers useless re-renders and wasted work. Part 2 covers the bigger levers: loading less code, rendering fewer nodes, and telling React what is urgent.

## First, understand when React re-renders

A component re-renders when its state changes, when its parent re-renders, or when a context it reads changes. Props changing is not a separate trigger: children re-render because the parent did, whether or not their props changed.

The repo makes this visible with a render counter:

```tsx
import { useRef, useState } from "react";

function RenderCounter() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return <p>Rendered {renderCount.current} times</p>;
}

export function RenderCounterDemo() {
  const [text, setText] = useState("");
  return (
    <div>
      <RenderCounter />
      <input value={text} onChange={(event) => setText(event.target.value)} />
    </div>
  );
}
```

`RenderCounter` takes no props, yet its number goes up with every keystroke. A render is not a DOM update; React compares the result and usually changes nothing. Re-renders only matter when the component is expensive or there are many of them. Keep that in mind before optimizing anything.

## Part 1: stop useless re-renders

### `memo`: skip a child when its props are the same

```tsx
import { memo, useState } from "react";

const ProfileCard = memo(function ProfileCard({ name }: { name: string }) {
  return <h3>{name}</h3>;
});

export function ProfileEditor() {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
      <ProfileCard name="Tien Di" />
    </div>
  );
}
```

`memo` compares props shallowly with `Object.is`. A string literal is equal every time, so `ProfileCard` skips rendering while you type.

### `useCallback`: keep a function prop stable

The catch with `memo` is that objects and functions created during render are new on every render:

```tsx
import { memo, useCallback, useState } from "react";

const ActionButton = memo(function ActionButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Click me</button>;
});

export function Counter() {
  const [count, setCount] = useState(0);

  const handleChildClick = useCallback(() => {
    console.info("Child clicked");
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((current) => current + 1)}>Increment</button>
      <ActionButton onClick={handleChildClick} />
    </div>
  );
}
```

Without `useCallback`, `ActionButton` would re-render on every increment despite `memo`. `useCallback` alone does nothing useful; it only pays off when the receiver is memoized or the function is an effect dependency.

### `useMemo`: cache an expensive calculation

```tsx
import { useMemo } from "react";

export function SortedUsers({ names }: { names: string[] }) {
  const sortedNames = useMemo(
    () => [...names].sort((a, b) => a.localeCompare(b)),
    [names],
  );

  return (
    <ul>
      {sortedNames.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}
```

Note the `[...names]` copy. `Array.prototype.sort` sorts in place, so `names.sort(...)` silently mutates a prop that belongs to the parent. `toSorted()` is a cleaner modern alternative.

### Derived state: calculate, do not synchronize

If a value can be computed from props or state, compute it during render. Do not copy it into state with an effect.

```tsx
type CartItem = { id: string; price: number };

export function CartTotal({ items }: { items: CartItem[] }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return <h2>Total: {total}</h2>;
}
```

The effect version (`useState` plus `useEffect(() => setTotal(...))`) renders once with a stale total, then again with the right one. The same goes for booleans like `isAdult = age >= 18` and `isValid = name !== "" && email.includes("@")`, which the repo's `MoreExamples` file shows in the wrong form. Derived state is faster, shorter and never out of sync. Add `useMemo` only if the calculation is actually expensive.

### Debouncing: wait until the user stops

Debouncing delays an action until input has been quiet for a while. It is the right tool for search-as-you-type requests.

```tsx
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debounced;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    if (!debouncedQuery) return;
    const controller = new AbortController();
    fetch(`/api/users?q=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal });
    return () => controller.abort();
  }, [debouncedQuery]);

  return <input value={query} onChange={(event) => setQuery(event.target.value)} />;
}
```

The input stays instant because `query` updates on every key; only the request waits. The `AbortController` cancels a request that is no longer relevant. With TanStack Query, you would pass `debouncedQuery` into the query key instead of writing the effect.

### Throttling: at most once per interval

Throttling runs an update at a steady rate while events keep coming. Scroll and resize are the classic cases.

```tsx
import { useEffect, useRef, useState } from "react";

export function useThrottledValue<T>(value: T, interval = 200): T {
  const [throttled, setThrottled] = useState(value);
  const lastRunAt = useRef(0);

  useEffect(() => {
    const wait = Math.max(0, interval - (Date.now() - lastRunAt.current));
    const timeoutId = setTimeout(() => {
      lastRunAt.current = Date.now();
      setThrottled(value);
    }, wait);
    return () => clearTimeout(timeoutId);
  }, [value, interval]);

  return throttled;
}

export function ScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const throttledY = useThrottledValue(scrollY, 200);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <p>Scroll position: {throttledY}</p>;
}
```

This version still sets `scrollY` on every scroll event, so `ScrollPosition` itself renders often; what is throttled is everything that depends on `throttledY`. If even that is too much, throttle the event handler itself, or skip React state and use CSS scroll-driven animations or `IntersectionObserver`.

Rule of thumb: debounce when you only care about the final value, throttle when you need regular updates during the activity.

## Part 2: advanced optimizations

### Lazy loading with `Suspense`

Code that is not needed for the first screen should not be in the first bundle.

```tsx
import { lazy, Suspense, useState } from "react";

const ReportChart = lazy(() => import("./ReportChart"));

export function ReportsPage() {
  const [showChart, setShowChart] = useState(false);

  return (
    <section>
      <button onClick={() => setShowChart((current) => !current)}>
        {showChart ? "Hide chart" : "Show chart"}
      </button>
      <Suspense fallback={<p>Loading chart...</p>}>
        {showChart && <ReportChart />}
      </Suspense>
    </section>
  );
}
```

The repo's demo puts a lazy and a non-lazy version side by side; the console shows that the non-lazy `Heavy` module is evaluated at startup even if you never open it. `lazy` needs a default export, and the `lazy` call must live at module level, not inside a component. In Next.js, route-level splitting is automatic and `next/dynamic` covers component-level cases.

### Component isolation: keep state close to where it is used

The repo's dashboard demo wraps `UserCard` and `Revenue` in `memo` so that `Visitors` updates do not drag them along. Before reaching for `memo`, try moving the state down or passing components as `children`:

```tsx
import { useState, type ReactNode } from "react";

function LiveVisitors() {
  const [visitors, setVisitors] = useState(0);
  return <button onClick={() => setVisitors((current) => current + 1)}>Visitors: {visitors}</button>;
}

function DashboardLayout({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[240px_1fr]">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}

export function Dashboard({ userName, revenue }: { userName: string; revenue: number }) {
  return (
    <DashboardLayout sidebar={<LiveVisitors />}>
      <h2>{userName}</h2>
      <p>Revenue: {revenue}</p>
    </DashboardLayout>
  );
}
```

`LiveVisitors` owns its state, so its updates re-render only itself. Elements passed as `children` are created by the parent, so a stateful layout does not re-create them. This is free, works with or without the Compiler, and is often enough.

### Splitting context

One big context with `user`, `theme`, `cart` and `locale` re-renders every consumer when any field changes. Split it by how often each part changes:

```tsx
import { createContext, use, type ReactNode } from "react";

type Theme = "light" | "dark";
type CartItem = { id: string; price: number };

const ThemeContext = createContext<Theme>("light");
const CartContext = createContext<CartItem[]>([]);

export function AppProviders({ theme, cart, children }: {
  theme: Theme;
  cart: CartItem[];
  children: ReactNode;
}) {
  return (
    <ThemeContext value={theme}>
      <CartContext value={cart}>{children}</CartContext>
    </ThemeContext>
  );
}

export const useTheme = () => use(ThemeContext);
export const useCart = () => use(CartContext);
```

A component that reads only the theme no longer re-renders when the cart changes. For state that changes very often and is read in many places, a store with selectors (Zustand, or `useSyncExternalStore` from the previous chapter) beats context.

### Virtualization: render only what is visible

Rendering 50,000 rows means 50,000 sets of DOM nodes, no matter how well you memoize. Virtualization renders only the rows in the viewport plus a small buffer. The repo uses `react-window` 1.x (`FixedSizeList`). Version 2 changed the API to a `List` with a `rowComponent`:

```tsx
import { List, type RowComponentProps } from "react-window";

type User = { id: number; name: string; email: string };

function UserRow({ index, style, users }: RowComponentProps<{ users: User[] }>) {
  const user = users[index];
  return (
    <div style={style} className="border-b px-3 py-2">
      <strong>{user.name}</strong>
      <span className="ml-2 text-sm">{user.email}</span>
    </div>
  );
}

export function UserList({ users }: { users: User[] }) {
  return (
    <List
      rowComponent={UserRow}
      rowCount={users.length}
      rowHeight={56}
      rowProps={{ users }}
      style={{ height: 600 }}
    />
  );
}
```

Always apply the `style` prop; it positions the row. TanStack Virtual is the other common choice, especially for variable heights or grids. Virtualization costs native find-in-page and needs care for accessibility, so I use it only when lists are truly long.

### `useTransition`: mark an update as non-urgent

Typing must feel instant; updating a big filtered list can wait. `useTransition` lets you say which is which:

```tsx
import { useState, useTransition, type ChangeEvent } from "react";

export function ProductFilter({ products }: { products: string[] }) {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    startTransition(() => setQuery(nextValue));
  }

  const results = products
    .filter((product) => product.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 200);

  return (
    <div>
      <input value={inputValue} onChange={handleChange} />
      {isPending && <span>Updating results...</span>}
      <ul style={{ opacity: isPending ? 0.6 : 1 }}>
        {results.map((product) => <li key={product}>{product}</li>)}
      </ul>
    </div>
  );
}
```

The transition render is interruptible: if another key arrives, React abandons the stale render and starts over. That is different from debouncing, which delays work by a fixed time even on a fast machine.

### `useDeferredValue`: defer a value you do not control

When you receive a value as a prop, or do not want two pieces of state, `useDeferredValue` gives you a "lagging" copy:

```tsx
import { memo, useDeferredValue, useState } from "react";

const ResultsList = memo(function ResultsList({ filter, items }: { filter: string; items: string[] }) {
  const matches = items.filter((item) => item.toLowerCase().includes(filter.toLowerCase())).slice(0, 200);
  return <ul>{matches.map((item) => <li key={item}>{item}</li>)}</ul>;
});

export function DeferredSearch({ items }: { items: string[] }) {
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);
  const isStale = text !== deferredText;

  return (
    <div>
      <input value={text} onChange={(event) => setText(event.target.value)} />
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        <ResultsList filter={deferredText} items={items} />
      </div>
    </div>
  );
}
```

The `memo` on `ResultsList` matters here (or the Compiler does it for you): during the urgent render `deferredText` has not changed, so the expensive list must be able to skip.

### Lists and keys

Several repo demos use the array index as `key`. That is fine for static lists, but when items are inserted, removed or reordered, index keys make React reuse the wrong component instance, which costs extra DOM work and can attach state (an input's text, a checkbox) to the wrong row. Use a stable id from the data.

### Tools

Measure before and after. The React DevTools Profiler shows which components rendered and why, and the "Highlight updates" option makes useless renders visible. Since React 19.2, Chrome DevTools' Performance panel also shows React tracks (Scheduler and Components) so you can see transitions and blocking work on the same timeline as the browser.

## A second example: the search dashboard, fixed

Back to the opening page, with the tools applied:

```tsx
import { useDeferredValue, useState } from "react";
import { List, type RowComponentProps } from "react-window";

type User = { id: number; name: string; active: boolean };

function UserRow({ index, style, users }: RowComponentProps<{ users: User[] }>) {
  return <div style={style}>{users[index].name}</div>;
}

export function UsersPage({ allUsers }: { allUsers: User[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const activeCount = allUsers.filter((user) => user.active).length;
  const visibleUsers = allUsers
    .filter((user) => user.name.toLowerCase().includes(deferredQuery.toLowerCase()))
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <p>Active: {activeCount}</p>
      <List
        rowComponent={UserRow}
        rowCount={visibleUsers.length}
        rowHeight={40}
        rowProps={{ users: visibleUsers }}
        style={{ height: 480 }}
      />
    </>
  );
}
```

Derived instead of synced state, no mutation, a deferred query so typing stays smooth, a virtualized list, and stable ids. If the list came from the server, I would debounce `query` into a TanStack Query key instead of filtering locally. With React Compiler enabled, the filtered and sorted arrays are memoized automatically; without it, wrap them in `useMemo`.

## In 2026 / React Compiler

React Compiler reached 1.0 in October 2025 and is now an easy opt-in for Vite, Next.js and Expo projects. It analyzes components and hooks at build time and inserts memoization for you, at a finer level than hand-written `useMemo` (it can memoize parts of JSX, not just whole values). What that means for this chapter:

- **Mostly gone:** routine `memo`, `useCallback` and `useMemo` for render performance. The inline `onSelect` that broke `memo` in the opening example is handled for you.
- **Still useful as escape hatches:** `useMemo`/`useCallback` when you need to control an effect's dependencies precisely, and when passing values to libraries that compare by reference and are not compiled. The React team advises keeping existing manual memoization in place rather than ripping it out, since removing it can change what the compiled output memoizes.
- **Unchanged:** derived state, debouncing, throttling, lazy loading, context splitting, virtualization, transitions, deferred values and keys. The Compiler skips work; it does not load less code, render fewer DOM nodes, or decide what is urgent.
- **Rules of React matter more.** The Compiler skips components that break the rules, such as mutating props (`names.sort()`), reading refs during render, or conditional hooks. The `eslint-plugin-react-hooks` recommended preset includes the Compiler's diagnostics; turn it on even before enabling the Compiler.

Also worth knowing: React 19.2's `<Activity>` lets you hide part of the UI while keeping its state, and pre-render screens the user is likely to open next.

## When to optimize, and when not to

Optimize when:

- the Profiler shows a specific slow component or a long interaction;
- users feel lag on typing, scrolling or navigation, especially on mid-range phones;
- the bundle for the first page is large and contains code for screens that are not visible.

Do not optimize when:

- you have not measured. Guessing usually targets the wrong component;
- the component is cheap. A `useMemo` around `price * 0.18` costs more than it saves;
- the Compiler already handles it. Adding manual memoization everywhere only adds noise.

## Common pitfalls

1. **`memo` defeated by new props.** Inline objects, arrays and functions break `memo` unless they are memoized (by hand or by the Compiler).
2. **Syncing derived values with effects.** It costs an extra render and creates windows where the UI shows stale data.
3. **Mutating props.** `sort()` and `reverse()` change the parent's array. Use `toSorted()` and `toReversed()`.
4. **Debounce hooks that recreate timers incorrectly.** Every debounce or throttle needs a cleanup that clears its timer, or you get updates after unmount.
5. **Index keys on dynamic lists.** They cause wrong state reuse and extra DOM work when items move.

## Exercises

1. **Fix broken memoization** (from the repo's task). Given a `memo` child receiving `onClick={() => console.log("clicked")}`, make it render only once while the parent's counter increments. Explain why it re-rendered, then fix it with `useCallback`. Finally, enable React Compiler and remove the `useCallback`.
2. **Replace a derived-state anti-pattern** (from the repo's task). Rewrite `useEffect(() => setFiltered(items.filter((i) => i.active)), [items])` as derived state.
3. **Small dashboard** (from the repo's task). Build a search bar with debounce, a scroll tracker with throttle, and a 10,000-user list filtered by search without derived state in effects.
4. **Remove unnecessary memoization** (from the repo's task). In a `ProductCard` that uses `useMemo` for `price * 0.18` and `useCallback` for a log function, remove both and explain when memoization is still required.
5. **Lazy country selector and split context** (from the repo's task). Lazy-load a 250-country dropdown with a custom loader and compare bundle sizes. Split an `AppContext` into user, theme and cart contexts, and show the render difference with the Profiler.
6. **Transition vs debounce.** Implement the same filter with `useTransition` and with a 300 ms debounce. Use CPU throttling in DevTools and describe how each one feels.

## Video and source code

- Video, Part 1 (Day 11): [The Ultimate React Performance Guide (Part 1): Stop Useless Re-Renders!](https://youtu.be/G8Mk6lsSOcw)
- Video, Part 2 (Day 11): [The Ultimate React Performance Guide (Part 2): Advanced Optimizations](https://youtu.be/HJFDXKkz67M)
- Source code: [day-11 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-11)

This chapter is based on Day 11 (Parts 1 and 2) of the "15 Days of React Design Patterns" series by tapaScript (Tapas Adhikary), released under the Apache-2.0 license; thanks to him for the original lessons and demo code.
