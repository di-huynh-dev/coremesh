---
title: "Higher-Order Components"
description: "From higher-order functions to HOCs: wrap components with shared logic, type them properly, and know where HOCs still belong in React 19."
order: 6
---

## The problem: every screen fetches its own data

Say we have a small movie app with two views. `MovieList` shows titles, `MovieAnalytics` shows the total count and the average rating. Both need the same list of movies from the same API. The straightforward version puts the fetching inside each component:

```tsx
import { useEffect, useState } from "react";

type Movie = { id: string; title: string; year: number; rating: number };

export function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/movies")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch movies");
        return response.json() as Promise<Movie[]>;
      })
      .then(setMovies)
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p>Loading movies...</p>;
  if (errorMessage) return <p role="alert">Error: {errorMessage}</p>;

  return (
    <ul>
      {movies.map((movie) => (
        <li key={movie.id}>{movie.title} ({movie.year})</li>
      ))}
    </ul>
  );
}
```

`MovieAnalytics` gets the exact same 20 lines of state, effect, loading and error handling, followed by four lines that actually matter. The component that is supposed to "show analytics" spends most of its body on networking. When the API path changes, or you decide every error message should go through a toast, you edit two files. With five screens you edit five.

What we really want is: "give me a component that only knows how to display movies, and wrap it with something that knows how to load them." Before we get to components, it helps to look at the same idea with plain functions.

## First, higher-order functions

A higher-order function (HOF) is a function that takes a function as an argument, returns a function, or both. You use them every day: `Array.prototype.map`, `filter` and `setTimeout` all take functions. The interesting kind for us is the one that **returns an enhanced version of the function you give it**:

```ts
export function withTiming<TArgs extends unknown[], TResult>(
  task: (...args: TArgs) => TResult,
  label: string,
) {
  return (...args: TArgs): TResult => {
    const startedAt = performance.now();
    const result = task(...args);
    console.info(`${label} took ${(performance.now() - startedAt).toFixed(1)}ms`);
    return result;
  };
}

function sortByRating(movies: { rating: number }[]) {
  return [...movies].sort((a, b) => b.rating - a.rating);
}

export const timedSortByRating = withTiming(sortByRating, "sortByRating");
```

`sortByRating` knows nothing about timing. `withTiming` knows nothing about movies. Combined, you get a function that does both, and you can reuse `withTiming` for any other function. Debounce, throttle, retry and memoize helpers all follow this shape.

## The pattern: a higher-order component

A higher-order component (HOC) is the same idea applied to components: **a function that takes a component and returns a new component** that renders the original one with extra behavior or extra props. By convention the name starts with `with`.

### Step 1: keep the presentational components dumb

Strip the fetching out. Each component just declares what it needs through props:

```tsx
export type Movie = { id: string; title: string; year: number; rating: number };

type MovieListProps = { data: Movie[] };

export function MovieList({ data }: MovieListProps) {
  return (
    <ul>
      {data.map((movie) => (
        <li key={movie.id}>{movie.title} ({movie.year})</li>
      ))}
    </ul>
  );
}
```

```tsx
import type { Movie } from "./MovieList";

type MovieAnalyticsProps = { data: Movie[] };

export function MovieAnalytics({ data }: MovieAnalyticsProps) {
  const averageRating =
    data.length === 0 ? 0 : data.reduce((sum, movie) => sum + movie.rating, 0) / data.length;

  return (
    <dl>
      <dt>Total movies</dt>
      <dd>{data.length}</dd>
      <dt>Average rating</dt>
      <dd>{averageRating.toFixed(1)}</dd>
    </dl>
  );
}
```

These are now trivial to test and to render in Storybook with fake data.

### Step 2: write the HOC

```tsx
import { useEffect, useState, type ComponentType } from "react";

export function withDataFetching<TProps extends { data: unknown }>(
  WrappedComponent: ComponentType<TProps>,
  url: string,
) {
  function WithDataFetching(props: Omit<TProps, "data">) {
    const [data, setData] = useState<TProps["data"] | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
      const controller = new AbortController();

      fetch(url, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error(`Request failed with ${response.status}`);
          return response.json() as Promise<TProps["data"]>;
        })
        .then(setData)
        .catch((error: Error) => {
          if (error.name !== "AbortError") setErrorMessage(error.message);
        });

      return () => controller.abort();
    }, []);

    if (errorMessage) return <p role="alert">Error: {errorMessage}</p>;
    if (data === null) return <p>Loading...</p>;

    const injectedProps = { ...props, data } as TProps;
    return <WrappedComponent {...injectedProps} />;
  }

  const wrappedName = WrappedComponent.displayName ?? WrappedComponent.name ?? "Component";
  WithDataFetching.displayName = `withDataFetching(${wrappedName})`;

  return WithDataFetching;
}
```

A few details worth calling out:

- `TProps extends { data: unknown }` says "I can only wrap components that accept a `data` prop".
- The returned component accepts `Omit<TProps, "data">`, so callers do not have to (and cannot) pass `data` themselves. The HOC is responsible for it.
- The `AbortController` cancels the request if the component unmounts, which also keeps React's Strict Mode double effect run from causing trouble.
- `displayName` makes React DevTools show `withDataFetching(MovieList)` instead of an anonymous wrapper.

### Step 3: wrap once, at module level

```tsx
import { withDataFetching } from "./withDataFetching";
import { MovieList } from "./MovieList";
import { MovieAnalytics } from "./MovieAnalytics";

const MovieListWithData = withDataFetching(MovieList, "/api/movies");
const MovieAnalyticsWithData = withDataFetching(MovieAnalytics, "/api/movies");

export function MoviesPage() {
  return (
    <main className="movies-page">
      <MovieListWithData />
      <MovieAnalyticsWithData />
    </main>
  );
}
```

Each wrapped component gets its own loading and error handling for free, and the presentational components stay focused on display. Note that the two wrapped components still make two separate requests. The HOC shares *logic*, not *data*. Sharing the actual data is a job for a cache (TanStack Query, SWR) or for the Provider pattern in chapter 8.

## A second example: where HOCs still shine, error boundaries

Data fetching is the classic teaching example, but in 2026 you would rarely write it as a HOC. A better example of a HOC that still makes sense is wrapping a component in an error boundary. Error boundaries in React 19 still have to be class components, because there is no hook equivalent of `componentDidCatch`. A HOC lets the rest of your codebase stay in function components:

```tsx
import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  fallback: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
};

type ErrorBoundaryState = { hasError: boolean };

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

type ErrorBoundaryOptions = Omit<ErrorBoundaryProps, "children">;

export function withErrorBoundary<TProps extends object>(
  WrappedComponent: ComponentType<TProps>,
  options: ErrorBoundaryOptions,
) {
  function WithErrorBoundary(props: TProps) {
    return (
      <ErrorBoundary {...options}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  const wrappedName = WrappedComponent.displayName ?? WrappedComponent.name ?? "Component";
  WithErrorBoundary.displayName = `withErrorBoundary(${wrappedName})`;

  return WithErrorBoundary;
}
```

```tsx
export const SafeRevenueChart = withErrorBoundary(RevenueChart, {
  fallback: <p>The chart could not be displayed.</p>,
  onError: (error) => console.error("RevenueChart crashed", error),
});
```

This HOC adds no props at all, it only adds a wrapper. That is the cleanest kind of HOC: the props in are the props out, so typing is simple and there are no name collisions. The popular `react-error-boundary` package ships a `withErrorBoundary` helper built on the same idea.

## HOCs in 2026 and React 19

Here is the honest status: HOCs are still supported, but for sharing stateful logic, custom hooks replaced them years ago. `withDataFetching` becomes `useFetch(url)` (or better, `useQuery` from TanStack Query), and the component calls it directly. No wrapper, no prop injection, no generic gymnastics. The React docs today teach custom hooks for logic reuse, and you will mostly meet HOCs in older code like Redux's `connect`.

HOCs still have a place when the enhancement is about *wrapping*, not about *data*:

- **`memo`** is itself a function that takes a component and returns a new one. Same shape as a HOC.
- **Error boundaries**, as shown above, because there is no hook for them.
- **Library integrations** such as MobX's `observer`, which wraps a component to track what it reads.
- **Cross-cutting wrappers** applied to many routes at once, like a feature flag gate or an analytics boundary, where calling a hook in each page would be repetitive.

React 19 changes a few practical details:

- **`ref` is a regular prop** for function components. A HOC that spreads `{...props}` onto the wrapped component now passes `ref` through automatically, so the old `forwardRef` dance inside HOCs is no longer needed.
- **React Compiler** memoizes components and values automatically. It does not change how HOCs work, but it removes one old reason to reach for `memo` by hand.
- **Server Components**: a HOC that uses `useState` or `useEffect` produces a Client Component, and its module needs `"use client"`. You cannot use it to add client behavior to an async Server Component. For server-side concerns like auth checks or data loading, do the work directly in the Server Component, layout or route handler instead of wrapping.

## When to use it, and when not to

Use a HOC when:

- You need to wrap many components with the same outer element or boundary (error boundary, feature gate, analytics, `observer`).
- You are integrating with a library that exposes a HOC as its official API.
- You are maintaining a codebase that already uses HOCs consistently, and rewriting is not worth it right now.

Avoid a HOC when:

- You are sharing stateful logic. Write a custom hook.
- You need to inject several props from several HOCs. Stacking `withA(withB(withC(Page)))` makes it hard to know where a prop comes from.
- The wrapped component needs to control *how* the injected data is used per call site. Hooks or render props give callers more control.

## Common pitfalls

1. **Creating the HOC inside a render**. `const Wrapped = withDataFetching(MovieList, url)` inside a component body creates a brand new component type on every render. React unmounts and remounts it each time, throwing away all state. Always apply HOCs at module level.
2. **Prop collisions**. If the HOC injects `data` and the caller also passes `data`, one silently wins depending on spread order. Use `Omit` in the types so collisions become compile errors, and pick specific names.
3. **Missing `displayName`**. DevTools full of `Anonymous` or `WithDataFetching` with no hint of the inner component makes debugging painful.
4. **Lost static properties**. If the wrapped component has statics (for example a `preload` function attached to it), the HOC result does not have them unless you copy them over.
5. **Wrapper hell**. Five nested HOCs means five extra layers in the tree and props whose origin is a mystery. When you notice this, it is usually time to convert the logic to hooks.

## Exercises

1. **`withUserDataAndPermissions`** (from the original task): build an admin area with `ProfilePage`, `AdminPanel` and `ReportsPage`. The HOC loads a user (a static object is fine), injects `user` and `hasPermission` props, and takes the required permission as an argument. `ProfilePage` always renders, `AdminPanel` requires `"admin"`, `ReportsPage` requires `"reports"`. Show an "Access denied" message otherwise. Type it so that wrapped components must accept the injected props.
2. **`withFeatureFlag`**: write a HOC that takes a flag name and a fallback, and renders the wrapped component only when the flag is on. This one injects no props, so keep the outer props identical to the inner ones.
3. **Convert to a hook**: rewrite `withDataFetching` as `useFetch(url)` and refactor `MovieList` and `MovieAnalytics` to call it. Compare the two versions in DevTools.
4. **HOF warm-up**: implement `withRetry(task, attempts)` for async functions and use it to wrap the movie fetch.

## Video and source code

- Video (Day 05): [Master Higher Order Functions & Components in React](https://youtu.be/spDQ4oCKSPY)
- Source code: [day-05 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-05)

This chapter is based on Day 05 of tapaScript's "15 Days of React Design Patterns" by Tapas Adhikary, rewritten in TypeScript with extra examples and notes for React 19.
