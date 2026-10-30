---
title: "Facade Pattern"
description: "Hide several hooks and their business rules behind one custom hook that returns UI-ready values, so components only render."
order: 15
---

## The problem: a component that orchestrates everything

A dashboard page rarely needs just one piece of data. It needs to know whether the user is signed in, who they are, what they are allowed to do, and which features are switched on for them. Each of those already has its own hook, so the component calls all of them:

```tsx
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { usePermissions } from "@/hooks/usePermissions";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export function Dashboard() {
  const { isAuthenticated, logout } = useAuth();
  const { user, isLoading: isUserLoading } = useUser();
  const { permissions, isLoading: isPermissionsLoading } = usePermissions();
  const { flags } = useFeatureFlags();

  if (isUserLoading || isPermissionsLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return <p>Please sign in</p>;

  const canEdit =
    permissions?.includes("EDIT_DASHBOARD") && user?.status === "active" && !user?.isReadOnlyTenant;
  const showBeta = flags?.enableBetaDashboard === true && user?.plan !== "free";

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      {canEdit && <button>Edit dashboard</button>}
      {showBeta && <p>Beta features enabled</p>}
      <button onClick={logout}>Sign out</button>
    </div>
  );
}
```

On its own this looks harmless. The trouble starts when a second component, say the header, also needs `canEdit`. Someone copies the expression, forgets the `isReadOnlyTenant` check, and now the header shows an edit button the dashboard hides. Business rules ("who can edit") are living in JSX files, duplicated and drifting apart.

There are quieter costs too. The component knows the internal shape of four different hooks: that permissions are an array of strings, that flags are nested under `flags`, that two of the hooks report loading separately. Rename one field and you hunt through every page. Testing the dashboard means mocking four modules just to check that a button shows up.

## The pattern: one front door to a messy subsystem

A facade is a simple interface in front of a complex subsystem. The term also comes from the Gang of Four book, and the picture is a building's front: visitors see one clean entrance, not the plumbing.

In React, the facade is almost always a **custom hook** that:

1. Calls the lower-level hooks.
2. Combines and derives their values (loading state, permission rules, flags).
3. Returns only what the UI needs, in the vocabulary of the UI: `canEditDashboard`, not `permissions`.

The component then has one dependency and zero business logic.

### Step 1: keep the low-level hooks as they are

Each underlying hook has one job. In the repo they are tiny mocks; in a real app they might wrap TanStack Query or a Zustand store. Their types:

```tsx
export type User = {
  id: string;
  name: string;
  status: "active" | "suspended";
  plan: "free" | "pro" | "enterprise";
  isReadOnlyTenant: boolean;
};

export type Permission = "EDIT_DASHBOARD" | "VIEW_BILLING" | "MANAGE_USERS";

export declare function useAuth(): { isAuthenticated: boolean; logout: () => void };
export declare function useUser(): { user: User | undefined; isLoading: boolean };
export declare function usePermissions(): { permissions: Permission[] | undefined; isLoading: boolean };
export declare function useFeatureFlags(): { flags: { enableBetaDashboard?: boolean } | undefined };
```

We do not touch them. The facade sits on top.

### Step 2: write the facade hook

```tsx
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { usePermissions } from "@/hooks/usePermissions";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export type DashboardView =
  | { status: "loading" }
  | { status: "signed-out" }
  | {
      status: "ready";
      userName: string;
      canEditDashboard: boolean;
      showBetaDashboard: boolean;
      logout: () => void;
    };

export function useDashboardFacade(): DashboardView {
  const { isAuthenticated, logout } = useAuth();
  const { user, isLoading: isUserLoading } = useUser();
  const { permissions, isLoading: isPermissionsLoading } = usePermissions();
  const { flags } = useFeatureFlags();

  if (isUserLoading || isPermissionsLoading) return { status: "loading" };
  if (!isAuthenticated || !user) return { status: "signed-out" };

  const hasEditPermission = permissions?.includes("EDIT_DASHBOARD") ?? false;
  const canEditDashboard = hasEditPermission && user.status === "active" && !user.isReadOnlyTenant;
  const showBetaDashboard = (flags?.enableBetaDashboard ?? false) && user.plan !== "free";

  return {
    status: "ready",
    userName: user.name,
    canEditDashboard,
    showBetaDashboard,
    logout,
  };
}
```

Three decisions are worth pointing out:

- **All hooks are called before any early return.** The facade is still a hook, so the Rules of Hooks apply. The `if` statements come after every hook call.
- **The return value is a discriminated union.** The component cannot read `userName` while `status` is `"loading"`, and TypeScript enforces that. The repo's version returns flat fields (`isLoading`, `isAuthenticated`, `user`); the union is a small upgrade that removes impossible states.
- **The UI gets a name, not a user object.** If the component only renders the name, it should only receive the name.

### Step 3: the component just renders

```tsx
import { useDashboardFacade } from "@/features/dashboard/useDashboardFacade";

export function Dashboard() {
  const view = useDashboardFacade();

  if (view.status === "loading") return <p>Loading...</p>;
  if (view.status === "signed-out") return <p>Please sign in</p>;

  return (
    <div>
      <h1>Welcome {view.userName}</h1>
      {view.canEditDashboard && <button>Edit dashboard</button>}
      {view.showBetaDashboard && <p>Beta features enabled</p>}
      <button onClick={view.logout}>Sign out</button>
    </div>
  );
}
```

Compare the import lists: four hooks became one. The permission rule lives in exactly one place. A test for `Dashboard` mocks one hook with three plain states. A test for the rule renders `useDashboardFacade` with `renderHook` and checks booleans, no DOM involved.

### Facade rules I follow

The lesson in the repo lists a few rules for facades in React. In my own words:

1. **Expose UI-ready values, not raw data.** `hasDiscount`, not `cart.discounts.length > 0`.
2. **No JSX.** A facade returns data and functions. Rendering stays in components.
3. **Hide where data comes from.** The component should not know whether `userName` came from a REST call, a store or a cookie.
4. **Keep the low-level hooks reusable.** The facade composes them; it does not replace them. Other features can still call `usePermissions` directly.
5. **One facade per screen or feature, not one for the whole app.**

## A second example: an order detail page with TanStack Query

Facades shine when the subsystem is a server cache. At work I use TanStack Query a lot, and a detail page often needs two queries plus a mutation. Without a facade, the page juggles three loading flags and invalidation logic.

```tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelOrder, fetchCustomer, fetchOrder } from "@/api/orders";

const statusLabels = {
  pending: "Waiting for payment",
  paid: "Paid",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const;

type OrderStatus = keyof typeof statusLabels;

export function useOrderDetailsFacade(orderId: string) {
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => fetchOrder(orderId),
  });

  const customerId = orderQuery.data?.customerId;
  const customerQuery = useQuery({
    queryKey: ["customers", customerId],
    queryFn: () => fetchCustomer(customerId!),
    enabled: Boolean(customerId),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders", orderId] }),
  });

  const order = orderQuery.data;
  const status = order?.status as OrderStatus | undefined;

  return {
    isLoading: orderQuery.isPending || (Boolean(customerId) && customerQuery.isPending),
    error: orderQuery.error ?? customerQuery.error,
    title: order ? `Order #${order.code}` : "",
    statusLabel: status ? statusLabels[status] : "",
    customerName: customerQuery.data?.fullName ?? "",
    totalText: order ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total) : "",
    canCancel: status === "pending" || status === "paid",
    isCancelling: cancelMutation.isPending,
    cancel: () => cancelMutation.mutate(),
  };
}
```

```tsx
export function OrderDetailsPage({ orderId }: { orderId: string }) {
  const order = useOrderDetailsFacade(orderId);

  if (order.isLoading) return <OrderSkeleton />;
  if (order.error) return <ErrorState message={order.error.message} />;

  return (
    <section>
      <h1>{order.title}</h1>
      <p>{order.statusLabel}</p>
      <p>Customer: {order.customerName}</p>
      <p>Total: {order.totalText}</p>
      {order.canCancel && (
        <button disabled={order.isCancelling} onClick={order.cancel}>
          {order.isCancelling ? "Cancelling..." : "Cancel order"}
        </button>
      )}
    </section>
  );
}
```

The page knows nothing about query keys, dependent queries or cache invalidation. If the backend later returns the customer inside the order response, I delete the second query in the facade and the page does not change at all.

## In 2026 / React 19

**A facade is a normal custom hook.** The repo's lesson asks "is a facade a normal React hook?", and the answer is yes. There is no special API. What makes it a facade is its role: it aggregates and translates, and it is the only thing the component talks to.

**React Compiler removes most memoization chores.** Older facades often wrapped the returned object in `useMemo` and every function in `useCallback`, so that consumers wrapped in `memo` would not re-render. With React Compiler enabled, derived values and returned objects are memoized automatically when their inputs are unchanged. I write facades as plain code now and only reach for manual memoization when profiling says so.

**Actions belong behind the facade too.** If a mutation is a form submit, the facade can wrap it with `useActionState` or `useTransition` and expose `isPending` and `submit`. `useOptimistic` fits as well: the facade returns the optimistic list, and the component never learns there are two lists.

**Server Components change where some facades live.** A hook facade only runs in Client Components. In the App Router, much of the "combine user, permissions and flags" work can happen on the server in a plain async function, often in a data access layer module marked with `import "server-only"`. The Server Component awaits it and passes UI-ready props down. Same pattern, no hooks: the facade becomes `getDashboardView()`. Keep the hook version for client-side state and interactions.

**Selectors are facades in miniature.** With Zustand or TanStack Query's `select`, returning a derived slice (`useCartStore((state) => state.items.length > 0)`) is a small facade that also limits re-renders to what the component actually reads.

## When to use it, and when not to

Use a facade when:

- A component calls three or more hooks just to compute a handful of flags.
- The same business rule (permissions, pricing, status labels) appears in several components.
- You want components that are easy to test and to read for someone new to the codebase.
- The data source is likely to change (REST to GraphQL, client to server).

Skip it when:

- A component uses one hook directly and shows its data as is. Wrapping `useUser` in `useUserFacade` that returns the same thing adds a file and no value.
- Different consumers need very different subsets. One huge facade that everybody calls makes every consumer subscribe to every source.

## Common pitfalls

1. **The god facade.** `useAppFacade` that returns forty fields is a global store with extra steps. Every consumer re-renders when any source changes. Split by screen or feature.
2. **Leaking raw data "just in case".** Returning `user` and `permissions` next to `canEdit` invites components to compute their own rules again. Return only what the UI uses today.
3. **Breaking the Rules of Hooks with early returns.** Returning `{ status: "loading" }` before calling the remaining hooks changes hook order between renders. Call every hook first, derive after.
4. **Hiding waterfalls.** A facade that chains dependent requests can make a page slow without anyone noticing, because the component looks simple. Check the network tab, and prefetch or fetch in parallel where possible.
5. **Putting JSX in the facade.** Returning `<Badge />` from a hook couples it to one design. Return `badgeVariant: "warning"` and let the component render.

## Exercises

From the repo's task list:

1. **Profile facade.** Create `useProfileFacade` that combines user details, profile completion percentage and account status. Expose only UI-ready fields such as `isProfileComplete`, `completionText` and `canEditProfile`.
2. **Shopping cart facade.** Combine cart items, price calculation and discount logic. Expose `totalPrice`, `hasDiscount` and `checkout()`.
3. **Notifications facade (advanced).** Fetch notifications, group them by type and expose `unreadCount`. The UI must never touch the raw notification array.

My additions:

4. Rewrite `useDashboardFacade` so it returns a discriminated union like the one above, and write a `renderHook` test for each state.
5. Move the dashboard rules into a server-only `getDashboardView()` function and render the page as a Server Component. Note which parts still need a client hook.

## Video and source code

- Video: [One React Pattern That Instantly Cleans Up Messy Components](https://youtu.be/25IKfl9jR7A)
- Source code: [day-14 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-14)

This chapter is based on Day 14 of the "15 Days of React Design Patterns" series by tapaScript (Tapas Adhikary), adapted to TypeScript and React 19.
