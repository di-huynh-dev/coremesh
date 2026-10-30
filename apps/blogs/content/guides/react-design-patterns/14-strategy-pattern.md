---
title: "Strategy Pattern"
description: "Swap interchangeable behaviors, like login methods or export formats, behind one contract so components never branch on the type again."
order: 14
---

## The problem: one hook, every login method

Imagine an app that started with email and password login. Then sales signed an enterprise customer who needs SSO. Then mobile users asked for one-time passwords. Each new method landed in the same place, because "auth logic goes in `useAuth`":

```tsx
import { useState } from "react";

type LoginType = "password" | "otp" | "sso";

export function useAuth(loginType: LoginType) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(identifier: string, secret?: string) {
    setIsPending(true);
    setError(null);
    try {
      if (loginType === "password") {
        const response = await fetch("/api/login", {
          method: "POST",
          body: JSON.stringify({ email: identifier, password: secret }),
        });
        if (!response.ok) throw new Error("Wrong email or password");
      } else if (loginType === "otp") {
        if (!secret) {
          await fetch("/api/otp/send", { method: "POST", body: JSON.stringify({ phone: identifier }) });
          return;
        }
        const response = await fetch("/api/otp/verify", {
          method: "POST",
          body: JSON.stringify({ phone: identifier, code: secret }),
        });
        if (!response.ok) throw new Error("Invalid code");
      } else if (loginType === "sso") {
        window.location.assign(`/api/sso/start?domain=${identifier.split("@")[1]}`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login failed");
    } finally {
      setIsPending(false);
    }
  }

  return { login, isPending, error };
}
```

It works, and that is the trap. Every new method makes the `if/else` longer. A bug fix in the OTP branch means touching a function that also handles SSO redirects, so the review has to cover all three. You cannot test OTP in isolation, and you cannot ship the SSO code only to enterprise tenants because it is welded into the same function. The repo's day 13 starts from exactly this shape: a `useAuth` that switches on `loginType` with branches for OTP, SSO and magic link.

The smell has a simple name: **behavior selected by conditionals scattered through the code**. The same switch tends to show up again in the login button, the logout flow, the "forgot password" screen.

## The pattern: one contract, many interchangeable implementations

The Strategy pattern comes from the classic Gang of Four book. The idea in plain words:

1. Define **what** needs to happen as a contract (an interface).
2. Write each **how** as a separate implementation of that contract (a strategy).
3. Pick one strategy at runtime and hand it to the code that needs it. That code only talks to the contract.

The component that renders a login button should not care how the login happens. It needs `login()`, `isPending` and `error`. Everything else is a detail of the strategy.

### Step 1: write the contract

```tsx
export type LoginMethod = "password" | "otp" | "sso";

export type AuthStrategy = {
  method: LoginMethod;
  label: string;
  needsSecret: boolean;
  login: (identifier: string, secret?: string) => Promise<void>;
};
```

The contract is a plain object type: no React inside. That is deliberate, and I will come back to why in the React 19 section.

### Step 2: one file per strategy

```tsx
import type { AuthStrategy } from "./types";

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error((await response.text()) || "Request failed");
}

export const passwordStrategy: AuthStrategy = {
  method: "password",
  label: "Email and password",
  needsSecret: true,
  login: (email, password) => postJson("/api/login", { email, password }),
};

export const otpStrategy: AuthStrategy = {
  method: "otp",
  label: "One-time code",
  needsSecret: true,
  login: async (phone, code) => {
    if (!code) return postJson("/api/otp/send", { phone });
    return postJson("/api/otp/verify", { phone, code });
  },
};

export const ssoStrategy: AuthStrategy = {
  method: "sso",
  label: "Company SSO",
  needsSecret: false,
  login: async (email) => {
    const domain = email.split("@")[1] ?? "";
    window.location.assign(`/api/sso/start?domain=${encodeURIComponent(domain)}`);
  },
};
```

Each strategy can be unit tested with a mocked `fetch`, without rendering anything. Adding magic link login is a new object, not a new branch.

### Step 3: a registry instead of `if/else`

```tsx
import type { AuthStrategy, LoginMethod } from "./types";
import { otpStrategy, passwordStrategy, ssoStrategy } from "./strategies";

export const authStrategies = {
  password: passwordStrategy,
  otp: otpStrategy,
  sso: ssoStrategy,
} satisfies Record<LoginMethod, AuthStrategy>;
```

`satisfies Record<LoginMethod, AuthStrategy>` is the TypeScript safety net: if someone adds `"magic"` to `LoginMethod` and forgets to register it, the build fails. The lookup `authStrategies[method]` replaces the whole conditional.

### Step 4: choose once, at the top, with Context

Usually the strategy is decided by configuration: the tenant, an environment variable, a feature flag. We choose it once in a provider:

```tsx
import { createContext, use, useState, useTransition, type ReactNode } from "react";
import { authStrategies } from "./registry";
import type { AuthStrategy, LoginMethod } from "./types";

const AuthStrategyContext = createContext<AuthStrategy | null>(null);

export function AuthProvider({ method, children }: { method: LoginMethod; children: ReactNode }) {
  return <AuthStrategyContext value={authStrategies[method]}>{children}</AuthStrategyContext>;
}

export function useAuth() {
  const strategy = use(AuthStrategyContext);
  if (!strategy) throw new Error("useAuth must be used inside <AuthProvider>");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function login(identifier: string, secret?: string) {
    startTransition(async () => {
      setError(null);
      try {
        await strategy.login(identifier, secret);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Login failed");
      }
    });
  }

  return { label: strategy.label, needsSecret: strategy.needsSecret, login, isPending, error };
}
```

The React state (pending, error) lives in one ordinary hook. The algorithm lives in the strategy. The components become boring, in the best way:

```tsx
import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";

export function LoginForm() {
  const { label, needsSecret, login, isPending, error } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [secret, setSecret] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        login(identifier, needsSecret ? secret : undefined);
      }}
    >
      <h2>{label}</h2>
      <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
      {needsSecret && (
        <input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} />
      )}
      <button disabled={isPending}>{isPending ? "Signing in..." : "Sign in"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

```tsx
<AuthProvider method={tenant.loginMethod}>
  <LoginForm />
</AuthProvider>
```

Switching the whole app from password to SSO is now a one-word change at the root. No component code changes.

### The variant from the video: a hook factory

The repo implements strategies as hooks instead of objects: `useOtpAuth` and `useSsoAuth`, a map `{ otp: useOtpAuth, sso: useSsoAuth }`, and a `createAuthHook(type)` factory. A component then does:

```tsx
function LoginButton({ loginType }: { loginType: "otp" | "sso" }) {
  const useSelectedAuth = createAuthHook(loginType);
  const auth = useSelectedAuth();
  return <button onClick={auth.login}>Login</button>;
}
```

The provider version passes the selected hook itself through Context, and consumers call it. This is a good way to see the pattern, and it works as long as `loginType` never changes while the component is mounted. If it does change, React suddenly sees a different hook with possibly different internal `useState` calls, and the Rules of Hooks break. If you use this variant, at least remount on change with `<LoginButton key={loginType} loginType={loginType} />`. Read the next section before choosing it, though.

## A second example: export formats

Strategy is not only for auth. A very common case in admin dashboards is "export this table". CSV is easy, Excel needs a heavy library, PDF needs another one. Without the pattern, you get a `switch (format)` inside the click handler, and every format's library ends up in the main bundle.

```tsx
import type { OrderRow } from "./types";

export type ExportFormat = "csv" | "xlsx" | "pdf";

export type ExportStrategy = {
  label: string;
  extension: string;
  toBlob: (rows: OrderRow[]) => Promise<Blob>;
};

function toCsv(rows: OrderRow[]) {
  const header = "id,customer,total,status";
  const lines = rows.map((row) => [row.id, row.customer, row.total, row.status].join(","));
  return [header, ...lines].join("\n");
}

export const exportStrategies = {
  csv: {
    label: "CSV",
    extension: "csv",
    toBlob: async (rows) => new Blob([toCsv(rows)], { type: "text/csv" }),
  },
  xlsx: {
    label: "Excel",
    extension: "xlsx",
    toBlob: async (rows) => {
      const { buildWorkbook } = await import("./exporters/xlsx");
      return buildWorkbook(rows);
    },
  },
  pdf: {
    label: "PDF",
    extension: "pdf",
    toBlob: async (rows) => {
      const { buildPdf } = await import("./exporters/pdf");
      return buildPdf(rows);
    },
  },
} satisfies Record<ExportFormat, ExportStrategy>;
```

```tsx
import { useTransition } from "react";
import { exportStrategies, type ExportFormat } from "./exportStrategies";
import type { OrderRow } from "./types";

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportMenu({ rows }: { rows: OrderRow[] }) {
  const [isExporting, startTransition] = useTransition();

  function handleExport(format: ExportFormat) {
    const strategy = exportStrategies[format];
    startTransition(async () => {
      const blob = await strategy.toBlob(rows);
      downloadBlob(blob, `orders.${strategy.extension}`);
    });
  }

  return (
    <div role="menu" aria-busy={isExporting}>
      {(Object.keys(exportStrategies) as ExportFormat[]).map((format) => (
        <button key={format} role="menuitem" disabled={isExporting} onClick={() => handleExport(format)}>
          Export {exportStrategies[format].label}
        </button>
      ))}
    </div>
  );
}
```

Two bonuses come for free. The menu renders itself from the registry, so a new format shows up automatically. And because each strategy loads its library with `import()`, users who only ever export CSV never download the Excel code.

## In 2026 / React 19

**Do not pass hooks around as values.** react.dev has an explicit rule for this, "Never pass around Hooks as regular values", with a sub-rule "Don't dynamically use Hooks". Its reasoning: dynamic hooks hurt local reasoning, make Rules of Hooks violations easy, and React Compiler will not optimize components that do it. The hook factory and "hook in Context" variants fall right into this. They are fine for learning, but for new code I put plain objects or functions in the strategy, and keep one statically called hook (`useAuth`) that owns the React state. That is also closer to the original Strategy pattern, where strategies are just objects implementing an interface.

**If a strategy needs something from React**, such as the router or a query client, inject it. Give the strategy a parameter (`login(identifier, secret, { navigate })`) or make the registry a factory (`createAuthStrategies({ navigate })`) called inside the hook. The strategy stays testable, and the hook call stays static.

**Context as a provider.** In React 19 you render `<AuthStrategyContext value={...}>` directly; `.Provider` still works but is no longer needed. Reading context with `use(Context)` is also allowed, and unlike `useContext` it can be called inside conditions.

**Actions fit strategies nicely.** `useTransition` accepts async functions in React 19, so `isPending` comes from React instead of a manual flag. If your login is a `<form action>`, `useActionState` can wrap `strategy.login` and give you pending state and the last result in one call.

**Server Components boundary.** Strategies that contain functions cannot be passed from a Server Component to a Client Component as props, because functions are not serializable (Server Functions are the exception). Pass the key instead: the server decides `method="sso"` from the tenant, and the client looks up `authStrategies[method]`. The provider and `useAuth` live in a `"use client"` file.

## When to use it, and when not to

Use Strategy when:

- The same operation has several interchangeable implementations (login, payment, export, pricing rules, data sources).
- The choice depends on configuration, environment, tenant or user input.
- You keep finding the same `switch` on a "type" in several files.
- You want to load some implementations lazily.

Skip it when:

- There are only two branches and no sign of a third. An `if` is easier to read than a registry.
- The "strategies" do not share a real contract. Forcing different shapes into one interface creates optional fields everywhere.
- The variation is purely visual. That is usually a prop or a slot, not a strategy.

## Common pitfalls

1. **Leaky contracts.** If the component still checks `if (strategy.method === "sso")`, the abstraction failed. Move the difference into the contract (like `needsSecret`) or into the strategy.
2. **Changing the hook between renders.** With the hook factory variant, a prop change swaps the hook and breaks hook order. Use object strategies, or remount with `key`.
3. **Unregistered strategies.** Without `satisfies Record<...>` or an exhaustive check, a new union member compiles fine and crashes at runtime with `undefined is not a function`.
4. **Strategies that grab global state.** A strategy that reads from a store or `window` directly is hard to test. Pass what it needs as arguments.
5. **Over-abstraction.** One strategy plus an interface plus a registry plus a provider for a single implementation is ceremony. Introduce the pattern when the second real implementation arrives.

## Exercises

Adapted from the repo's task: build an app-level data fetching layer where the user list can come from a REST API, a GraphQL API or in-memory JSON, without changing component code. The data can be mocked.

1. Write three strategies, `restUsers`, `graphqlUsers`, `inMemoryUsers`, each exposing `fetchUsers(): Promise<User[]>` with the same `User` shape.
2. Register them with `satisfies Record<UserSource, UsersStrategy>`.
3. Create a `UsersSourceProvider` that picks the strategy from `import.meta.env.VITE_USER_SOURCE` and a single `useUsers()` hook returning `{ users, isLoading, error }`.
4. Render a `UserList` that uses only `useUsers()`. Switch the env variable and confirm no component file changes.
5. Your own: add a `cachedUsers` strategy that wraps another strategy and memoizes its result for 30 seconds. This is a strategy composed from a strategy.
6. Your own: rewrite the repo's `createAuthHook` version into object strategies and explain in two sentences what changed for React Compiler.

## Video and source code

- Video: [One React Pattern That Makes Your App Instantly Scalable](https://youtu.be/tfZ85e9N8RA)
- Source code: [day-13 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-13)

This chapter is based on Day 13 of the "15 Days of React Design Patterns" series by tapaScript (Tapas Adhikary), adapted to TypeScript and React 19.
