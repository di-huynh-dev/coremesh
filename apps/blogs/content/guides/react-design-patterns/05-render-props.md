---
title: "Render Props"
description: "Share stateful logic by letting a component own the behavior while the caller decides what to render, plus where render props still fit in React 19."
order: 5
---

## The problem: two components, one copy-pasted brain

Imagine a dashboard with two small widgets. One shows where a car marker is on a map panel, the other shows a bike marker. Both need to follow the pointer inside a box and print the coordinates. The first version usually looks like this:

```tsx
import { useState, type MouseEvent } from "react";

export function CarTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    setPosition({ x: event.clientX, y: event.clientY });
  }

  return (
    <div className="tracker-area" onMouseMove={handlePointerMove}>
      <p>Car is at ({position.x}, {position.y})</p>
    </div>
  );
}

export function BikeTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    setPosition({ x: event.clientX, y: event.clientY });
  }

  return (
    <div className="tracker-area" onMouseMove={handlePointerMove}>
      <p>Bike is at ({position.x}, {position.y})</p>
    </div>
  );
}
```

The only real difference is one line of JSX. Everything else, the state, the event handler, the wrapper element, is duplicated. That is fine for two components. It stops being fine the day someone asks for relative coordinates instead of viewport coordinates, or wants to throttle the updates, or switches from mouse events to pointer events so touch works. Now you have to remember every copy, and the copies drift apart a little more with each fix.

The deeper issue is that the two components mix two concerns: *how* to track the pointer (behavior) and *what* to show with the result (presentation). The behavior is identical, the presentation is different. We want to write the behavior once and let each caller plug in its own presentation.

## The pattern: hand the rendering back to the caller

A render prop is a prop whose value is a function that returns JSX. The component that owns the logic calls that function with its internal data, and whatever the function returns ends up on the screen. In plain words: "I will handle the state, you tell me what to draw with it."

### Step 1: extract the shared behavior

Move the state and the handler into a single component and give it a typed `render` prop:

```tsx
import { useState, type MouseEvent, type ReactNode } from "react";

export type PointerPosition = {
  x: number;
  y: number;
};

type PointerTrackerProps = {
  render: (position: PointerPosition) => ReactNode;
};

export function PointerTracker({ render }: PointerTrackerProps) {
  const [position, setPosition] = useState<PointerPosition>({ x: 0, y: 0 });

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    setPosition({ x: event.clientX, y: event.clientY });
  }

  return (
    <div className="tracker-area" onMouseMove={handlePointerMove}>
      {render(position)}
    </div>
  );
}
```

The type `(position: PointerPosition) => ReactNode` is the contract. It tells every caller exactly what data they get and what they must give back.

### Step 2: let each caller decide the UI

```tsx
import { PointerTracker } from "./PointerTracker";

export function VehicleDashboard() {
  return (
    <section className="dashboard">
      <PointerTracker
        render={(position) => (
          <p>Car is at ({position.x}, {position.y})</p>
        )}
      />
      <PointerTracker
        render={({ x, y }) => (
          <p className="bike-label">Bike is at ({x}, {y})</p>
        )}
      />
    </section>
  );
}
```

`CarTracker` and `BikeTracker` disappear. Fixing the tracking logic now happens in one place, and adding a third vehicle is three lines of JSX.

### Step 3: use `children` as the render function

The prop does not have to be called `render`. A very common variant uses `children`, which reads more naturally because the function sits between the opening and closing tags:

```tsx
import { useState, type MouseEvent, type ReactNode } from "react";
import type { PointerPosition } from "./PointerTracker";

type PointerAreaProps = {
  children: (position: PointerPosition) => ReactNode;
};

export function PointerArea({ children }: PointerAreaProps) {
  const [position, setPosition] = useState<PointerPosition>({ x: 0, y: 0 });

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    setPosition({ x: event.clientX, y: event.clientY });
  }

  return (
    <div className="tracker-area" onMouseMove={handlePointerMove}>
      {children(position)}
    </div>
  );
}
```

```tsx
<PointerArea>
  {({ x, y }) => <p>Car is at ({x}, {y})</p>}
</PointerArea>
```

This is sometimes called "function as children". Typing `children` as a function means TypeScript will complain if someone passes plain JSX, which is exactly what you want: the component cannot work without the function.

## A second example: a list that owns selection, not markup

Pointer tracking is a teaching example. A more realistic place where render props earn their keep is a list component that handles behavior like selection and keyboard navigation, while each screen renders items its own way. At work I use Ant Design a lot, and its `Table` columns accept a `render` function per cell for the same reason: the table owns sorting and pagination, you own what a cell looks like.

```tsx
import { useState, type KeyboardEvent, type ReactNode } from "react";

type ItemRenderState<TItem> = {
  item: TItem;
  isSelected: boolean;
  isActive: boolean;
  select: () => void;
};

type SelectableListProps<TItem> = {
  items: TItem[];
  getKey: (item: TItem) => string;
  onSelectionChange?: (selectedKeys: string[]) => void;
  renderItem: (state: ItemRenderState<TItem>) => ReactNode;
  renderEmpty?: () => ReactNode;
};

export function SelectableList<TItem>({
  items,
  getKey,
  onSelectionChange,
  renderItem,
  renderEmpty,
}: SelectableListProps<TItem>) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  function toggleSelection(key: string) {
    const nextKeys = selectedKeys.includes(key)
      ? selectedKeys.filter((selectedKey) => selectedKey !== key)
      : [...selectedKeys, key];
    setSelectedKeys(nextKeys);
    onSelectionChange?.(nextKeys);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, items.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === " " && items[activeIndex]) {
      event.preventDefault();
      toggleSelection(getKey(items[activeIndex]));
    }
  }

  if (items.length === 0) {
    return renderEmpty ? renderEmpty() : null;
  }

  return (
    <ul role="listbox" aria-multiselectable tabIndex={0} onKeyDown={handleKeyDown}>
      {items.map((item, index) => {
        const key = getKey(item);
        return (
          <li key={key} role="option" aria-selected={selectedKeys.includes(key)}>
            {renderItem({
              item,
              isSelected: selectedKeys.includes(key),
              isActive: index === activeIndex,
              select: () => toggleSelection(key),
            })}
          </li>
        );
      })}
    </ul>
  );
}
```

Two different screens can now share all of that keyboard and selection logic:

```tsx
type Movie = { id: string; title: string; year: number };

export function MoviePicker({ movies }: { movies: Movie[] }) {
  return (
    <SelectableList
      items={movies}
      getKey={(movie) => movie.id}
      renderEmpty={() => <p>No movies yet.</p>}
      renderItem={({ item, isSelected, isActive, select }) => (
        <button
          type="button"
          className={isActive ? "movie-row movie-row--active" : "movie-row"}
          onClick={select}
        >
          {isSelected ? "[x]" : "[ ]"} {item.title} ({item.year})
        </button>
      )}
    />
  );
}
```

Notice two things. The component is generic, so `item` is correctly typed as `Movie` without any casts. And it accepts more than one render prop (`renderItem`, `renderEmpty`), which is a nice way to expose several "slots" that each receive internal data.

## Render props in 2026 and React 19

Let me be honest: if you are writing new code today, a custom hook is usually the better tool for sharing logic. The pointer tracker becomes:

```tsx
import { useState, type MouseEvent } from "react";

export function usePointerPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: MouseEvent<HTMLElement>) {
    setPosition({ x: event.clientX, y: event.clientY });
  }

  return { position, handlePointerMove };
}
```

The hook gives you the data directly in the component body, no extra nesting in JSX, and you can combine several hooks without building a pyramid of functions. That is why hooks (chapter 7) replaced most render props after React 16.8.

Render props are not dead though. They still make sense when the component needs to control *where* and *when* the caller's UI is rendered, not just hand over data:

- **Lists, tables and virtualizers**: the component decides which rows exist and wraps each one, the caller draws a row. `renderItem`, column `render` functions and similar APIs are everywhere.
- **Form libraries**: React Hook Form's `Controller` takes a `render` prop, and TanStack Form's `Field` takes a children function. The library owns field state and wiring, you own the input.
- **Headless UI components** that pass internal state (open, active, selected) to a children function so you can style based on it.

A few React 19 era details are worth knowing:

- **React Compiler**: one old complaint about render props was that an inline arrow function is a new function on every render, which breaks `memo` on the receiving component. With React Compiler enabled, those inline functions are memoized automatically when their inputs do not change, so you rarely need to wrap them in `useCallback` yourself.
- **Server Components**: a function cannot be serialized and sent from a Server Component to a Client Component. A render-prop component holds state, so it is a Client Component (`"use client"`), and the code that passes the function must also run on the client. If you see an error about passing functions to Client Components, this is usually why. Plain `children` JSX, on the other hand, *can* be passed from a Server Component, which is often the better design when the caller does not need internal data.
- **`ref` as a prop**: since React 19, function components receive `ref` as a normal prop, so a render-prop component that wants to expose its root element no longer needs `forwardRef`.

## When to use it, and when not to

Use render props when:

- The component must decide the structure around the caller's UI (list items, table cells, portals, positioned overlays).
- You want to expose several customizable areas, each with access to internal state.
- You are building a library component and want consumers to bring their own markup.

Avoid render props when:

- You only need to share data or behavior. A custom hook is simpler, flatter and easier to test.
- The caller does not need any internal data. Pass plain `children` or a slot prop with JSX instead.
- You would end up nesting three or four render props inside each other. That "callback pyramid" is the exact problem hooks were designed to solve.

## Common pitfalls

1. **Calling hooks inside the render function**. The function you pass to `render` is called while `PointerTracker` renders, but it is not a component. Calling `useState` inside it attaches that state to the tracker in a way React cannot track reliably, and the linter flags it as a Rules of Hooks violation. If the rendered piece needs its own state, render a real component from the function: `render={(position) => <CarLabel position={position} />}`.
2. **Typing the render prop as `any` or `Function`**. You lose the whole point of the contract. Type both the argument and the return value (`ReactNode`).
3. **Forgetting `key` when rendering lists of render-prop output**. In the `SelectableList`, the key goes on the `li` that the list owns, not on whatever the caller returns.
4. **Passing a render function across a server/client boundary**. Keep the caller in a Client Component or redesign the API to accept JSX.
5. **Over-generalizing**. A component with six render props and a dozen arguments for each is harder to use than two simple components. Start with one render prop and add more only when a real second caller needs it.

## Exercises

1. **Toggle with render props** (from the original task): build a `Toggle` component that owns an `isOpen` state and calls `children({ isOpen, open, close, toggle })`. Use it once to render an accordion section and once to render a "Show password" switch.
2. **Relative coordinates**: change `PointerTracker` so it reports coordinates relative to its own box (hint: `event.currentTarget.getBoundingClientRect()`). Confirm that both the car and bike labels pick up the change without being touched.
3. **Rewrite as a hook**: implement `useToggle` and `usePointerPosition` and refactor your callers. Write down which version you find easier to read and why.
4. **Add `renderEmpty` and `renderFooter`** to `SelectableList`, with the footer receiving the number of selected items.

## Video and source code

- Video (Day 04): [Master the Render Props Pattern in React](https://youtu.be/tIdJj0n1mg4)
- Source code: [day-04 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-04)

This chapter is based on Day 04 of tapaScript's "15 Days of React Design Patterns" by Tapas Adhikary, rewritten in TypeScript with extra examples and notes for React 19.
