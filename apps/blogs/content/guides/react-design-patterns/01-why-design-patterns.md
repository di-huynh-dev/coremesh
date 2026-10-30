---
title: "Why React Needs Design Patterns"
description: "The problems patterns solve in real React codebases, a quick refresher of the React mental model, and a map of the 15 patterns in this guide."
order: 1
---

React gives you very few rules. A component is a function, props go in, JSX comes out, and state lives wherever you call `useState`. That freedom is why React is pleasant to start with, and it is also why a React codebase can quietly turn into a mess. Nothing in the library stops you from putting a fetch call, three pieces of form state, a modal, and a sorting algorithm into the same 400-line component. It works, it ships, and six months later nobody wants to touch it.

Design patterns are the answer the community has converged on. They are not a framework and not a rulebook. They are names for shapes of code that have been tried many times and hold up under change. This guide walks through 15 of them, one chapter each, with TypeScript examples written for React 19.

## The problem: code that works but does not scale

Here is a component I suspect every React developer has written at some point:

```tsx
import { useEffect, useState } from "react";

type Order = { id: string; total: number; status: "pending" | "paid" | "shipped" };

export function OrdersPage({ customerId }: { customerId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/customers/${customerId}/orders`)
      .then((response) => response.json())
      .then((data: Order[]) => setOrders(data))
      .catch(() => setError("Could not load orders"))
      .finally(() => setLoading(false));
  }, [customerId]);

  const visibleOrders =
    filter === "all" ? orders : orders.filter((order) => order.status === filter);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section>
      <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="shipped">Shipped</option>
      </select>
      <ul>
        {visibleOrders.map((order) => (
          <li key={order.id} onClick={() => { setSelectedId(order.id); setIsDialogOpen(true); }}>
            #{order.id} · {order.total}
          </li>
        ))}
      </ul>
      {isDialogOpen && selectedId && (
        <div role="dialog">
          <p>Order {selectedId}</p>
          <button onClick={() => setIsDialogOpen(false)}>Close</button>
        </div>
      )}
    </section>
  );
}
```

Nothing here is wrong in isolation. The trouble is what happens next. A product manager asks for the same list on the admin dashboard but with different styling. Someone needs the dialog elsewhere and copies it. A second filter is added, then pagination, then an "undo" for cancelling an order. Each change is small, but every change touches the same file, and every change risks breaking something unrelated.

In codebases I have worked on, the symptoms usually look like this:

- **Mixed responsibilities.** Data fetching, business rules and markup live in one function, so you cannot test or reuse any part alone.
- **Prop soup.** A shared component grows a dozen boolean props (`showHeader`, `isCompact`, `hideFooter`...) because every caller needs a small variation.
- **Duplicated logic.** The same "fetch, loading, error" dance is copy-pasted into ten components with tiny differences.
- **Prop drilling.** A value is passed through four layers that do not care about it, just to reach one leaf.
- **Unclear ownership of state.** Two components both think they own the same value, and they drift out of sync.
- **Fragile UX.** One thrown error blanks the whole page; a slow request freezes the UI.

Patterns give each of these problems a known, named solution. The name matters as much as the code: when a teammate says "make it a compound component" or "lift that into a provider", the whole team knows what the result will look like.

## A quick refresher: the React mental model

Every pattern in this guide leans on a handful of ideas. If these feel solid, the rest of the guide will read easily.

### Components are functions of props and state

A component takes props, reads its state, and returns a description of the UI. React calls it again whenever its inputs might have changed. The output should depend only on those inputs, which is why the function body must stay pure: no fetching, no subscribing, no mutation during render.

```tsx
type GreetingProps = { name: string; unreadCount: number };

export function Greeting({ name, unreadCount }: GreetingProps) {
  return (
    <p>
      Hello {name}, you have {unreadCount} unread messages.
    </p>
  );
}
```

### State triggers a re-render; refs do not

`useState` stores a value React tracks. Setting it schedules a re-render of that component and its children. `useRef` stores a mutable box that survives renders but does not trigger one. Chapter 3 builds a whole pattern on this difference.

```tsx
import { useRef, useState } from "react";

export function ClickStats() {
  const [visibleCount, setVisibleCount] = useState(0);
  const silentCount = useRef(0);

  return (
    <button
      onClick={() => {
        silentCount.current += 1;
        setVisibleCount((count) => count + 1);
      }}
    >
      Clicked {visibleCount} times
    </button>
  );
}
```

### Data flows down, events flow up

A parent passes data to children through props. Children talk back by calling functions the parent passed in. When two siblings need the same value, you lift the state to their closest common parent. Most composition patterns are clever ways to arrange this one-way flow.

### Composition over configuration

`children` is just a prop, and JSX is just a value. You can pass elements, arrays of elements, or functions that return elements. This is the foundation of compound components, slots and render props.

### Effects synchronize with the outside world

`useEffect` runs after React commits to the screen. It is for syncing with things outside React: network, timers, browser APIs, third-party widgets. It is not for deriving values from props or state; compute those during render instead.

### Hooks are the unit of reuse

Since hooks arrived, reusable logic lives in functions named `useSomething` that call other hooks. Many older patterns (HOCs, render props) were invented before hooks existed. You will see me point this out often, because knowing why an old pattern existed tells you when it still makes sense.

## The 15 patterns at a glance

I group the patterns by the kind of problem they solve rather than by the order they were taught. The chapters follow the original series order, but this map is how I think about them day to day.

### Component composition

How to split and assemble components so each piece has one job and callers stay flexible.

| Pattern | Solves |
| --- | --- |
| Container-Presenter | Mixing data fetching and business logic with markup |
| Compound Components | Prop soup on components with several related parts (modal, tabs, accordion) |
| Slot | Letting callers inject content into named regions of a layout |
| Render Props | Sharing behavior while the caller decides what to render |
| Higher-Order Component (HOC) | Wrapping components to add cross-cutting behavior (auth, logging) |

### State and logic

Where state lives, who owns it, and how logic is shared without coupling components together.

| Pattern | Solves |
| --- | --- |
| Controlled and Uncontrolled | Deciding whether React or the DOM owns an input's value |
| Custom Hooks | Duplicated stateful logic across components |
| State Reducer | Letting consumers override how a reusable component updates its state |
| Provider | Prop drilling for values many components need |
| Pub-Sub | Decoupled communication between parts of the app that do not share a parent |

### UX and resilience

Making the app feel fast and survive failures gracefully.

| Pattern | Solves |
| --- | --- |
| Optimistic UI | Waiting for the server before showing the result of an action |
| Error Boundary | One rendering error crashing the whole page |
| Performance patterns | Wasted re-renders, heavy lists, large bundles |

### Architecture

Organizing code so new requirements plug in instead of rewriting what exists.

| Pattern | Solves |
| --- | --- |
| Strategy | Growing `if/else` or `switch` chains for interchangeable behaviors |
| Facade | Components that talk directly to many low-level APIs and libraries |

If you go back to the `OrdersPage` above, you can already spot where several of these would apply: Container-Presenter to separate fetching from the list, a custom hook for the fetch logic, a Compound Component for the dialog, Strategy for the filters, and an Error Boundary around the whole section.

## Patterns are tools, not goals

One warning before we start. Every pattern adds a layer of indirection. Indirection is worth paying for when it removes real pain, and it is pure cost when it does not. A 30-line component that renders a static card does not need a container, a presenter, a context, and a custom hook. I have seen codebases where every component is split into three files "because that is the pattern", and they are harder to read than the mess they replaced.

My rule of thumb: reach for a pattern when you feel the pain it solves, or when you are building something reusable (a design system, a shared library) where that pain is guaranteed to arrive. Otherwise write the simple version and refactor when the second or third use case shows up.

It also helps to know that React itself keeps moving. React 19 brought Actions, `useOptimistic`, `useActionState`, the `use` API, `ref` as a regular prop, and Context that renders directly as a provider. React Compiler can now handle most memoization automatically. Server Components change which code can use state or context at all. Each chapter has an "In 2026 / React 19" section that says honestly how the pattern holds up today: some are more relevant than ever, some are mostly replaced by hooks, and a few are now built into React.

## How to read this guide

Each chapter follows the same structure, so you can skim or dive in as you like:

1. **The problem.** A small, realistic piece of smelly code and why it hurts.
2. **The pattern.** The idea in plain words, then a step-by-step refactor of that code.
3. **A second example.** A different real-world use, so you see the pattern is not tied to one demo.
4. **In 2026 / React 19.** How the pattern fits modern React, Server Components and the compiler.
5. **When to use it, and when not to.** The trade-offs.
6. **Common pitfalls.** Mistakes I see most often.
7. **Exercises.** Small tasks to practice. Do them: patterns stick when your hands have written them, not when your eyes have read them.
8. **Video and source code.** Links to the original lesson.

All code is TypeScript and uses function components and hooks. I assume you know React basics (JSX, props, `useState`, `useEffect`) and a bit of TypeScript. If you are newer than that, the refresher above is the minimum; the official docs at react.dev cover the rest well.

You can read the chapters in order, which builds up from simple composition to architecture. Or you can jump straight to the pattern that matches the pain you have right now. Either way, try to keep a real project open next to the guide and ask, for each chapter, "where in my code would this help, and where would it be overkill?"

## Video and source code

This guide is based on tapaScript's "15 Days of React Design Patterns" series by Tapas Adhikary, whose videos and Apache-2.0 source code are the foundation for every chapter here.

- Video (Day 00): [Why React Needs Design Patterns + 10-Min Crash Course](https://www.youtube.com/watch?v=OWi31QoHqNk)
- Source code: [github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-00](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-00)
