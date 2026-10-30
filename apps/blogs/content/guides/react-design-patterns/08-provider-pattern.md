---
title: "Provider Pattern"
description: "Stop prop drilling by putting shared state in a provider and reading it through a typed hook, using React 19's Context as a provider and use()."
order: 8
---

## The problem: props that travel through people who do not care

A theme toggle sounds like the simplest feature in the world. The state lives at the top of the app because both the layout and a button deep in the navbar need it. Then you start passing it down:

```tsx
import { useState, type ReactNode } from "react";

type Theme = "light" | "dark";

export function App() {
  const [theme, setTheme] = useState<Theme>("light");

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return (
    <Layout theme={theme} onToggleTheme={toggleTheme}>
      <Dashboard theme={theme} />
    </Layout>
  );
}

function Layout({ theme, onToggleTheme, children }: {
  theme: Theme;
  onToggleTheme: () => void;
  children: ReactNode;
}) {
  return (
    <div className={`layout layout--${theme}`}>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      {children}
    </div>
  );
}

function Navbar({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <nav className="navbar">
      <span className="navbar__logo">My App</span>
      <ThemeToggleButton theme={theme} onToggleTheme={onToggleTheme} />
    </nav>
  );
}

function ThemeToggleButton({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <button type="button" onClick={onToggleTheme}>
      {theme === "light" ? "Switch to dark" : "Switch to light"}
    </button>
  );
}
```

`Navbar` does not use `theme` or `onToggleTheme` at all. It only forwards them. This is **prop drilling**: intermediate components accept props purely to pass them along. With one value and three levels it is annoying. With a theme, the current user, a locale, feature flags and a brand config, every component in the middle grows a list of props it does not care about, and moving a component to another place in the tree means rewiring all of them.

In the previous chapter we also saw the other side of the problem: a custom hook like `useAuth()` does not share state between components. Two components calling it get two separate users. We need a way to put one value somewhere and let any component below read it directly.

## The pattern: a provider, a context and a hook

React's Context is the mechanism. The Provider pattern is the way we package it so the rest of the app does not have to know about the mechanism:

- A **context** object, the "channel" the value travels through.
- A **provider component** that owns the state and puts it on the channel.
- A **custom hook** that reads from the channel and fails loudly if there is no provider.

Components only ever see the provider and the hook.

### Step 1: create the context with an honest type

```tsx
import { createContext } from "react";

export type Theme = "light" | "dark";

export type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
```

The default value is `null`, and the type says so. You could pass a fake default like `{ theme: "light", toggleTheme: () => {} }`, but then forgetting the provider produces a button that silently does nothing. `null` lets us detect that mistake.

### Step 2: the provider owns the state

```tsx
import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./ThemeContext";

type ThemeProviderProps = {
  initialTheme?: Theme;
  children: ReactNode;
};

export function ThemeProvider({ initialTheme = "light", children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}
```

Note `<ThemeContext value={...}>`. Since React 19 the context object itself can be rendered as the provider. `<ThemeContext.Provider value={...}>` still works and you will see it in older code, but the shorter form is the recommended one going forward.

The effect syncs the theme to the `<html>` element so CSS can react to `[data-theme="dark"]`. That is a legitimate use of an effect: keeping an external system (the DOM outside React) in sync with state.

### Step 3: a hook as the only way in

```tsx
import { use } from "react";
import { ThemeContext } from "./ThemeContext";

export function useTheme() {
  const themeContext = use(ThemeContext);
  if (themeContext === null) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return themeContext;
}
```

`use` is React 19's API for reading a context (or a promise). For context it behaves like `useContext`, with one difference: it may be called inside conditions and loops. Either is fine here. The hook narrows the type from `ThemeContextValue | null` to `ThemeContextValue`, so callers never deal with `null`.

### Step 4: wrap the tree and delete the drilling

```tsx
export function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </ThemeProvider>
  );
}

function Layout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <div className={`layout layout--${theme}`}>
      <Navbar />
      {children}
    </div>
  );
}

function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar__logo">My App</span>
      <ThemeToggleButton />
    </nav>
  );
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme === "light" ? "Switch to dark" : "Switch to light"}
    </button>
  );
}
```

`Navbar` is back to being about the navbar. Components that need the theme ask for it, components that do not are untouched.

## A second example: several providers, loaded data, one entry point

Real apps rarely have one context. The repo combines a theme provider with a brand provider that loads brand settings (name, colors) from an API. Here is a typed version:

```tsx
import { createContext, use, useEffect, useState, type ReactNode } from "react";

export type Brand = { name: string; primaryColor: string; logoUrl: string };

type BrandContextValue = { brand: Brand | null; isLoading: boolean };

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ brandId, children }: { brandId: string; children: ReactNode }) {
  const [loadedBrand, setLoadedBrand] = useState<{ brandId: string; brand: Brand } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/brands/${brandId}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<Brand>)
      .then((brand) => setLoadedBrand({ brandId, brand }))
      .catch(() => undefined);

    return () => controller.abort();
  }, [brandId]);

  const brand = loadedBrand?.brandId === brandId ? loadedBrand.brand : null;

  return <BrandContext value={{ brand, isLoading: brand === null }}>{children}</BrandContext>;
}

export function useBrand() {
  const brandContext = use(BrandContext);
  if (brandContext === null) {
    throw new Error("useBrand must be used inside <BrandProvider>");
  }
  return brandContext;
}
```

Stacking providers in `main.tsx` gets noisy quickly, so I like a single `AppProviders` component as the one place where the app's global context is assembled:

```tsx
import type { ReactNode } from "react";
import { ThemeProvider } from "./theme/ThemeProvider";
import { BrandProvider } from "./brand/BrandProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <BrandProvider brandId="default">{children}</BrandProvider>
    </ThemeProvider>
  );
}
```

```tsx
function BrandedHeader() {
  const { brand, isLoading } = useBrand();
  const { theme } = useTheme();

  if (isLoading || brand === null) return <header className="header header--skeleton" />;

  return (
    <header className={`header header--${theme}`} style={{ borderColor: brand.primaryColor }}>
      <img src={brand.logoUrl} alt={brand.name} />
    </header>
  );
}
```

Order matters only when one provider depends on another. If `BrandProvider` needed the theme, it must be rendered inside `ThemeProvider`, and it would call `useTheme()` itself.

## The Provider pattern in 2026 and React 19

Context is more central than ever, and React 19 made it nicer to use:

- **`<Context value>` as the provider**. Shorter, and `Context.Provider` is planned to be deprecated in a future version, so new code should use the short form.
- **`use(Context)`** reads context and, unlike `useContext`, may be called conditionally, for example after an early return.
- **React Compiler** memoizes the `value` object for you. Without the compiler, `value={{ theme, toggleTheme }}` is a new object every time the provider renders, which re-renders every consumer even when nothing changed. In that case wrap it in `useMemo` and the functions in `useCallback`.
- **Server Components** cannot create or read context. A provider that holds state must live in a file marked `"use client"`. The good news is that a Client Component provider can still receive Server Components as `children`. In Next.js App Router, the usual setup is a `providers.tsx` client file and a server `layout.tsx` that renders `<AppProviders>{children}</AppProviders>`. Pages under it stay Server Components; only the components that call `useTheme()` need to be client.

Context is a transport, not a state manager. It is great for values that change rarely (theme, locale, current user, feature flags, dependency injection like an API client) and for scoped state inside a component family (the compound components from chapter 4). For state that changes often and is read by many components, every update re-renders every consumer of that context, and React has no built-in selector to avoid it. That is when I reach for Zustand, which lets each component subscribe to just the slice it needs. And for server data, TanStack Query already is a provider pattern: one `QueryClientProvider` at the top, a cache shared through context, and hooks to read from it.

## When to use it, and when not to

Use a provider when:

- Many components at different depths need the same value.
- The value is app-wide or section-wide and changes infrequently.
- You want to inject a dependency (API client, analytics, config) so it can be swapped in tests or Storybook by rendering a different provider.
- A group of components must share state, like tabs or accordions.

Avoid it when:

- Only one or two levels separate the source and the consumer. Passing props is clearer.
- The value updates many times per second (pointer position, scroll offset, form input on every keystroke) and many components read it.
- You are reaching for context just to avoid thinking about component structure. Sometimes passing `children` instead of drilling props solves the problem without any context.

## Common pitfalls

1. **A default value that hides missing providers**. Use `null` and a guarding hook so the mistake shows up immediately as a clear error.
2. **One giant context for everything**. Put theme, user, cart and notifications in one value and every change re-renders everything. Split contexts by how often they change, and consider separate contexts for state and for actions.
3. **New `value` objects on every render** without React Compiler. Memoize them, or every consumer re-renders whenever the provider's parent renders.
4. **Providers too high in the tree**. If only the checkout flow needs the cart draft, put the provider around the checkout routes, not around the whole app.
5. **Calling the hook in the provider's own component**. `ThemeProvider` cannot call `useTheme()`, because it is not inside itself. Read from local state there instead.

## Exercises

From the original task:

1. **Auth context**: build `AuthProvider` holding `user` and `isAuthenticated`, with `login()` and `logout()`. Consume it in a `Navbar` and a `Dashboard`, and confirm that logging in from one updates the other (the bug from chapter 7 is gone).
2. **Language context**: store the selected language, expose a toggle, and update visible text across several components. Keep translations in a plain object keyed by language.
3. **Combine them** cleanly in an `AppProviders` component. Decide which one should be on the outside and explain why.

And two of mine:

4. **Split for performance**: turn the auth context into two contexts, one for `user` and one for `login`/`logout`. Use the React DevTools Profiler to compare which components re-render after a login, with and without the split.
5. **Promise in context**: make `BrandProvider` accept a `brandPromise` prop instead of fetching in an effect, store the promise in context, and read it with `use()` inside a `<Suspense>` boundary.

## Video and source code

- Video (Day 07): [Master the Provider Pattern in React](https://www.youtube.com/watch?v=POWMosrdamI)
- Source code: [day-07 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-07)

This chapter is based on Day 07 of tapaScript's "15 Days of React Design Patterns" by Tapas Adhikary, rewritten in TypeScript with extra examples and notes for React 19.
