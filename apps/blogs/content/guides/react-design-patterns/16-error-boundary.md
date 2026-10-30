---
title: "Error Boundary"
description: "Contain rendering errors to the part of the UI that failed, show a useful fallback with retry, and keep the rest of the app working."
order: 16
---

## The problem: one broken widget, one blank page

Think of a dashboard as a tree. At the root there is the app, below it a layout, and inside the layout a user profile card and a stats widget. Now imagine the stats API starts returning `null` for a field the widget expects:

```tsx
type Stats = { visitorsToday: number; conversionRate: number };

function StatsWidget({ stats }: { stats: Stats }) {
  return (
    <div className="rounded border p-2">
      <h2 className="text-2xl">Stats</h2>
      <p>Visitors today: {stats.visitorsToday.toLocaleString()}</p>
      <p>Conversion: {(stats.conversionRate * 100).toFixed(1)}%</p>
    </div>
  );
}

export function Dashboard({ stats }: { stats: Stats }) {
  return (
    <div className="flex gap-3">
      <UserProfile />
      <StatsWidget stats={stats} />
    </div>
  );
}
```

When `stats.visitorsToday` is `null`, `toLocaleString` throws a `TypeError` during render. Since React 16, an error thrown while rendering that nobody catches unmounts the **entire** React tree. The user does not see a broken stats card next to a working profile. They see a white page. The profile, the navigation, the sign out button: all gone, because one leaf failed.

The first instinct is a `try/catch`, but it does not help:

```tsx
export function Dashboard({ stats }: { stats: Stats }) {
  try {
    return (
      <div className="flex gap-3">
        <UserProfile />
        <StatsWidget stats={stats} />
      </div>
    );
  } catch {
    return <p>Something went wrong</p>;
  }
}
```

`Dashboard` only creates the element `<StatsWidget />`, it does not call the function. React renders `StatsWidget` later, outside this `try` block. A `try/catch` in a component only catches errors in that component's own code, never in its children. We need something that wraps a **subtree**.

## The pattern: a component that catches errors below it

An error boundary is a component that catches errors thrown while rendering any component below it in the tree, then renders a fallback instead of that subtree. Everything outside the boundary keeps working. It is the UI equivalent of a `catch` block, but declarative and scoped to a branch of the tree.

### Step 1: write the boundary

Error boundaries still have to be class components, because they rely on two class lifecycle methods:

- `static getDerivedStateFromError(error)` runs during render. It returns new state so the next render shows the fallback.
- `componentDidCatch(error, info)` runs after the commit. It is the place for side effects such as logging. `info.componentStack` tells you which components were involved.

```tsx
import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";

export type ErrorFallbackProps = {
  error: Error;
  reset: () => void;
};

type ErrorBoundaryProps = {
  fallback: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

function toError(value: unknown) {
  return value instanceof Error ? value : new Error(String(value));
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onError?.(toError(error), info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { fallback: Fallback, children } = this.props;

    if (error) return <Fallback error={error} reset={this.reset} />;
    return children;
  }
}
```

The fallback is a component rather than a static element, so it can show the error message and a retry button. The `onError` prop keeps logging decisions out of the boundary itself.

### Step 2: a fallback with retry

```tsx
import type { ErrorFallbackProps } from "./ErrorBoundary";

export function WidgetError({ error, reset }: ErrorFallbackProps) {
  return (
    <div role="alert" className="rounded border border-red-600 p-2">
      <p className="font-semibold">This widget could not load.</p>
      <p className="text-sm text-gray-500">{error.message}</p>
      <button onClick={reset} className="mt-2 bg-yellow-400 px-2 py-1 text-black">
        Try again
      </button>
    </div>
  );
}
```

How does retry work? When the boundary shows the fallback, React has already unmounted the failed children. Calling `reset` clears the error, so the next render mounts the children again from scratch, with fresh state and effects. The repo's version adds a `retryKey` that increments on each retry and is used as a `key`; that is useful when you also want to force a remount from outside, but for the basic case clearing the state is enough.

Retry only helps with transient errors: a flaky request, a race. If the same props cause the same crash, the child throws again and the fallback comes back. That is fine, it is honest. For data errors, combine retry with refetching (see the second example).

### Step 3: place boundaries deliberately

Now the dashboard wraps the risky part:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WidgetError } from "@/components/WidgetError";
import { reportError } from "@/lib/monitoring";

export function Dashboard({ stats }: { stats: Stats }) {
  return (
    <div className="flex gap-3">
      <UserProfile />
      <ErrorBoundary
        fallback={WidgetError}
        onError={(error, info) => reportError(error, { componentStack: info.componentStack })}
      >
        <StatsWidget stats={stats} />
      </ErrorBoundary>
    </div>
  );
}
```

If the stats widget crashes, the profile stays on screen and the user gets a "Try again" button where the stats used to be.

The lesson in the repo calls this "the pattern to apply error boundaries", and the core question is **granularity**. I usually think in three layers:

1. **Root boundary** around the whole app. A last resort with a full-page "Something went wrong, reload" message. It prevents the white screen.
2. **Route boundary** around each page. A crash on the reports page should not take down the sidebar and navigation.
3. **Widget boundaries** around independent, risky pieces: third-party embeds, charts, anything rendering data you do not fully control.

Too few boundaries and one bug hides a whole page. Too many and the screen fills with tiny error boxes, and you pay for each one in code. A good rule: put a boundary where the user can still do something useful with the rest of the screen.

### What boundaries do not catch

This matters as much as what they catch. An error boundary does **not** catch errors in:

- Event handlers, such as an `onClick` that throws. Handlers do not run during rendering, so a throw there leaves the current UI intact. Use `try/catch` there.
- Async code that runs outside rendering, such as `setTimeout` callbacks or a promise `.then` in an effect.
- Server-side rendering.
- The boundary component itself. An error in the fallback goes to the next boundary up.

The React 19 section covers two important exceptions that do reach boundaries now.

## A second example: data widgets with Suspense and TanStack Query

The repo demonstrates a widget that randomly throws. In real apps, most errors I see in widgets come from data: a 500 from the API, a timeout, an unexpected shape. With Suspense-based data fetching, errors and loading become two boundaries around the same component: `Suspense` for "not ready yet", `ErrorBoundary` for "failed".

Here I use the `react-error-boundary` package, which react.dev itself points to so you do not have to write the class, together with TanStack Query's `useSuspenseQuery`:

```tsx
import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { QueryErrorResetBoundary, useSuspenseQuery } from "@tanstack/react-query";
import { fetchRevenue } from "@/api/reports";

function RevenueChart({ range }: { range: "7d" | "30d" }) {
  const { data } = useSuspenseQuery({
    queryKey: ["revenue", range],
    queryFn: () => fetchRevenue(range),
  });

  return <LineChart points={data.points} />;
}

function RevenueError({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return (
    <div role="alert" className="rounded border border-red-600 p-3">
      <p>Revenue data is unavailable: {message}</p>
      <button onClick={resetErrorBoundary}>Reload chart</button>
    </div>
  );
}

export function RevenueCard({ range }: { range: "7d" | "30d" }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary FallbackComponent={RevenueError} onReset={reset} resetKeys={[range]}>
          <Suspense fallback={<ChartSkeleton />}>
            <RevenueChart range={range} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

Three things happen here that the hand-written version did not do:

- `onReset={reset}` tells TanStack Query to clear the failed query, so "Reload chart" really refetches instead of re-throwing the cached error.
- `resetKeys={[range]}` resets the boundary automatically when the user switches from 7 days to 30 days. Without it, the old error would stay on screen for the new range.
- `RevenueChart` has no loading or error branches at all. It only describes the happy path.

For errors in event handlers, the same package offers `useErrorBoundary`. Calling `showBoundary(error)` inside a `catch` forwards the error to the nearest boundary, so a failed "Export" click can show the same fallback as a render error:

```tsx
import { useErrorBoundary } from "react-error-boundary";

export function ExportReportButton({ reportId }: { reportId: string }) {
  const { showBoundary } = useErrorBoundary();

  async function handleExport() {
    try {
      await exportReport(reportId);
    } catch (error) {
      showBoundary(error);
    }
  }

  return <button onClick={handleExport}>Export</button>;
}
```

## In 2026 / React 19

**Still a class, and that is fine.** react.dev says plainly that there is currently no way to write an error boundary as a function component. In practice almost nobody writes the class anymore: `react-error-boundary` covers retry, reset keys and the hook above. I still think it is worth writing the class once, like we did, so the library is not magic.

**Actions and `use` report to boundaries.** In React 19, if the function passed to `startTransition` throws or returns a rejected promise, the error is shown by the nearest error boundary. The same goes for a promise read with `use(promise)` that rejects. So with Actions, a failing async mutation can surface through the boundary instead of a hand-rolled `error` state. When you want inline form errors instead, return them as state from `useActionState` rather than throwing.

**Root-level error hooks.** `createRoot` and `hydrateRoot` accept `onCaughtError` (errors caught by a boundary), `onUncaughtError` (errors no boundary caught) and `onRecoverableError`. This is the cleanest place to send everything to your monitoring tool in one spot, instead of repeating `onError` on every boundary.

**Better stacks in development.** `captureOwnerStack()` returns the owner stack, which shows which components created the failing one, not only where it sits in the tree. It is development-only, so guard calls to it and never rely on it in production logs.

**Server Components and Next.js.** An error boundary uses class state, so the boundary must be a Client Component (`"use client"`). It can still wrap Server Components passed as children. In the Next.js App Router you mostly get boundaries from the file convention: an `error.tsx` file next to a `page.tsx` becomes the boundary for that route segment, and it must be a Client Component too. `global-error.tsx` acts as the root boundary.

## When to use it, and when not to

Use error boundaries:

- Always at the root, so a crash never means a blank page.
- Around routes, so one page cannot break navigation.
- Around independent widgets and third-party components, especially those rendering remote data.
- Together with `Suspense` for data fetched with `use` or Suspense-enabled libraries.

Do not rely on them for:

- Validation errors and expected failures ("email already taken"). Those are normal states, show them inline.
- Errors in event handlers or timers, unless you forward them explicitly with `showBoundary`.
- Hiding bugs. A boundary keeps the app usable, it does not fix anything. Always log what it catches.

## Common pitfalls

1. **One global boundary only.** It prevents the white screen, but any error still replaces the whole UI with a fallback. Add route and widget boundaries.
2. **Retry that does not refetch.** Resetting the boundary while the cache still holds the error just shows the fallback again. Reset the data source too (`QueryErrorResetBoundary`, a new promise, a new key).
3. **Forgetting reset on navigation.** A boundary that stays in the error state after the user changes route or filter shows stale errors. Use `resetKeys` or a `key` tied to the route.
4. **Throwing in the fallback.** If the fallback reads `error.response.data.message` and `response` is undefined, the fallback itself crashes and the error bubbles to a parent boundary. Keep fallbacks dumb.
5. **Swallowing errors silently.** A boundary with no `onError` and no root `onCaughtError` turns production bugs into invisible "Try again" boxes.

## Exercises

The repo's task, slightly adapted:

1. Build a product page with three sections: Product details, Reviews and Recommendations. Wrap each section in its own error boundary with its own fallback message.
2. Make one section throw randomly. Add a "Retry" button that re-renders only the failed section, without refreshing the page and without a single global boundary.
3. Bonus: log the component stack with `componentDidCatch`, and give each section a different fallback text.

My additions:

4. Replace your hand-written boundary with `react-error-boundary`, then move logging to `createRoot(..., { onCaughtError, onUncaughtError })`. Compare where the logging code lives before and after.
5. Turn the Reviews section into a Suspense-based fetch (`use` or `useSuspenseQuery`) and make sure "Retry" actually performs a new request.

## Video and source code

- Video: [This One React Pattern Can Save Your App From Crashing](https://youtu.be/0qxF4jb-eUg)
- Source code: [day-15 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-15)

This chapter is based on Day 15 of the "15 Days of React Design Patterns" series by tapaScript (Tapas Adhikary), adapted to TypeScript and React 19.
