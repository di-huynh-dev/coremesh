---
title: "Pub-Sub and Observer"
description: "Let distant components react to events without prop drilling: a typed event bus, a subscription hook, cross-tab broadcasting, and when an observable store fits better."
order: 11
---

## The problem: two components that should not know about each other

An e-commerce page has an "Add to cart" button deep inside a product grid, and a cart badge in the header. They sit in completely different branches of the tree. When the button is clicked, the badge should update.

The first solution most of us write is to lift the state up to the nearest common ancestor and pass it down:

```tsx
import { useState } from "react";

type CartItem = { id: string; name: string };

export function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  function addToCart(item: CartItem) {
    setCartItems((current) => [...current, item]);
  }

  return (
    <>
      <Header cartCount={cartItems.length} />
      <ProductPage onAddToCart={addToCart} />
    </>
  );
}

function ProductPage({ onAddToCart }: { onAddToCart: (item: CartItem) => void }) {
  return <ProductGrid onAddToCart={onAddToCart} />;
}

function ProductGrid({ onAddToCart }: { onAddToCart: (item: CartItem) => void }) {
  return <ProductCard onAddToCart={onAddToCart} />;
}
```

It works, but look at what happened. `ProductPage` and `ProductGrid` now carry a callback they never use, just to pass it along. Every click re-renders `App`, and with it the whole page. And when a third part of the app wants to know about cart additions (a toast, an analytics tracker, a "recently added" drawer), you add one more prop chain. The button and the badge are coupled through every component between them.

Context removes the drilling, but not the coupling to a shared state shape, and every consumer re-renders when the value changes. Sometimes what you really want is simpler: the button announces "something was added", and whoever cares reacts to it.

## The pattern: Observer and Pub-Sub

These two patterns are often used as synonyms. They are related but not the same, and the difference helps you pick the right tool.

**Observer.** A *subject* keeps a list of *observers* and notifies them directly when it changes. Observers know which subject they watch, because they subscribe to it: `store.subscribe(listener)`. A store, a DOM element with `addEventListener`, a `ResizeObserver`: all of these are subjects.

**Pub-Sub (publish/subscribe).** A *broker* (an event bus, a channel) sits in the middle. Publishers send messages on a named *topic*; subscribers listen to topics. Publishers and subscribers do not know about each other at all, only about the broker and the topic name.

In short: Observer is "watch this thing", Pub-Sub is "listen to this kind of message, from anyone". React itself leans on Observer: `useSyncExternalStore`, Redux, Zustand and TanStack Query's cache are all subjects that components subscribe to. Pub-Sub fits fire-and-forget events where the publisher has no state to share, just news.

The cart example above is a good fit for Pub-Sub. Let's build it step by step.

### Step 1: a typed event bus

The repo uses a `Map` of event names to a `Set` of handlers. I keep the same structure but add an event map type, so every topic has a known payload and typos in event names become compile errors.

```tsx
export type AppEvents = {
  "cart:add": { id: string; name: string };
  "notification:show": { kind: "success" | "error" | "warning"; message: string };
};

export type EventName = keyof AppEvents;
export type EventHandler<K extends EventName> = (payload: AppEvents[K]) => void;

type PublishOptions = { broadcast?: boolean };

type HandlerRegistry = { [K in EventName]?: Set<EventHandler<K>> };

const handlers: HandlerRegistry = {};
let crossTabChannel: BroadcastChannel | null = null;

function handlersFor<K extends EventName>(eventName: K): Set<EventHandler<K>> {
  const existing = handlers[eventName];
  if (existing) return existing;
  const created = new Set<EventHandler<K>>();
  handlers[eventName] = created;
  return created;
}

export const eventBus = {
  subscribe<K extends EventName>(eventName: K, handler: EventHandler<K>) {
    handlersFor(eventName).add(handler);
    return () => {
      handlersFor(eventName).delete(handler);
    };
  },

  publish<K extends EventName>(
    eventName: K,
    payload: AppEvents[K],
    { broadcast = true }: PublishOptions = {},
  ) {
    handlersFor(eventName).forEach((handler) => handler(payload));
    if (broadcast) {
      crossTabChannel?.postMessage({ eventName, payload });
    }
  },
};
```

Two design choices to notice. `subscribe` returns its own unsubscribe function, which plugs straight into a `useEffect` cleanup. And `publish` calls handlers synchronously; there is no queue and no replay. If nobody is listening when an event fires, the event is gone.

### Step 2: a hook to subscribe from components

The repo's `useEvent` subscribes in an effect with `[eventName, handler]` as dependencies. Because callers pass an inline arrow function, the handler is a new function on every render, so the hook unsubscribes and resubscribes after every render. It still works, but it is wasteful and easy to get wrong. React 19.2 gives us the right tool for this: `useEffectEvent`, which lets an effect call the latest handler without listing it as a dependency.

```tsx
import { useEffect, useEffectEvent } from "react";
import { eventBus, type EventHandler, type EventName } from "./eventBus";

export function useEvent<K extends EventName>(eventName: K, handler: EventHandler<K>) {
  const onEvent = useEffectEvent(handler);

  useEffect(() => {
    return eventBus.subscribe(eventName, (payload) => onEvent(payload));
  }, [eventName]);
}
```

Now the subscription is created once per event name and always calls the newest handler, so it never sees stale state.

### Step 3: the publisher

```tsx
import { eventBus } from "../lib/eventBus";

type Product = { id: string; name: string };

type AddToCartButtonProps = { product: Product };

export function AddToCartButton({ product }: AddToCartButtonProps) {
  function handleClick() {
    eventBus.publish("cart:add", { id: product.id, name: product.name });
  }

  return <button onClick={handleClick}>Add to cart</button>;
}
```

The button has no props for callbacks and no idea who is listening.

### Step 4: the subscriber

```tsx
import { useState } from "react";
import { useEvent } from "../hooks/useEvent";

type CartItem = { id: string; name: string };

export function CartBadge() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEvent("cart:add", (item) => {
    setItems((current) => [...current, item]);
  });

  return (
    <div>
      <span aria-label="Items in cart">Cart: {items.length}</span>
      <ul>
        {items.map((item, position) => (
          <li key={`${item.id}-${position}`}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

Two small fixes compared to the demo: the functional update `setItems((current) => ...)` never depends on a captured `items`, and the key combines id and position because the same product can be added twice (the demo uses only `item.id`, which produces duplicate keys).

Now `App` is just layout. Adding a toast that reacts to `cart:add` is one more `useEvent` call in the toast component, with zero changes elsewhere.

### Step 5: broadcasting across browser tabs

The repo goes one step further: when a user adds an item in one tab, the other open tabs update too. It uses the `BroadcastChannel` API, which delivers messages to every other context on the same origin listening to the same channel name. The trick is avoiding loops: a message received from another tab must be re-published locally *without* being broadcast again.

```tsx
export function connectCrossTab(channelName = "app-events") {
  if (typeof BroadcastChannel === "undefined" || crossTabChannel) {
    return () => {};
  }

  const channel = new BroadcastChannel(channelName);
  crossTabChannel = channel;

  channel.onmessage = (event: MessageEvent<{ eventName: EventName; payload: unknown }>) => {
    const { eventName, payload } = event.data;
    eventBus.publish(eventName, payload as AppEvents[typeof eventName], { broadcast: false });
  };

  return () => {
    channel.close();
    crossTabChannel = null;
  };
}
```

The demo opens the channel at module load time through a side-effect import in `main.jsx`. I prefer an explicit function called from an effect at the root, so it never runs during server rendering and can be cleaned up:

```tsx
import { useEffect } from "react";
import { connectCrossTab } from "./lib/eventBus";

export function EventBridge() {
  useEffect(() => connectCrossTab(), []);
  return null;
}
```

A `BroadcastChannel` does not receive its own messages, so the originating tab does not get a duplicate. Note that only structured-cloneable data can cross tabs: plain objects yes, functions and class instances no.

## A second example: Observer with `useSyncExternalStore`

The badge above has a weakness. Its state lives inside the subscriber, so a component that mounts later (say, a cart drawer opened after three items were added) starts from zero. Events are news, not state. When multiple components need to *read the current value*, you want the Observer pattern: a store that holds state and notifies subscribers.

React ships a hook built exactly for subscribing to such a subject:

```tsx
import { useSyncExternalStore } from "react";

type CartItem = { id: string; name: string };
type Listener = () => void;

function createCartStore() {
  let items: CartItem[] = [];
  const listeners = new Set<Listener>();

  return {
    getSnapshot: () => items,
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    add(item: CartItem) {
      items = [...items, item];
      listeners.forEach((listener) => listener());
    },
    clear() {
      items = [];
      listeners.forEach((listener) => listener());
    },
  };
}

export const cartStore = createCartStore();

export function useCartItems(): CartItem[] {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getSnapshot);
}
```

Any component can call `useCartItems()` and get the current list, even if it mounted late. `getSnapshot` returns the same array reference until something changes, which is what keeps React from re-rendering needlessly. The third argument is the server snapshot, used during SSR and hydration.

The two patterns also combine well. A common shape in real apps is: the store holds the cart (Observer), and the store also publishes a `cart:add` event on the bus so unrelated features such as analytics or a toast can react without importing the store (Pub-Sub).

If this store looks familiar, it should: it is a tiny Zustand. Zustand, Redux and Jotai all implement Observer on top of `useSyncExternalStore` or an equivalent.

## In 2026 / React 19

- **For shared state, use an observable store, not an event bus.** In my day-to-day work, client state lives in Zustand and server state in TanStack Query. Both are Observer under the hood. I would not rebuild either with events.
- **Pub-Sub is for events, not data.** Toasts, analytics, "session expired, log out everywhere", cross-tab sync, telling a micro-frontend that something happened. These are the cases where a typed bus is still the cleanest answer.
- **`useEffectEvent` is stable since React 19.2.** It is the right way to subscribe with a handler that reads fresh props or state without resubscribing. Before it, people used a ref to store the latest handler.
- **Context vs Pub-Sub.** Context is for values a subtree needs to read (theme, current user, locale). When the value changes, all consumers re-render. A bus delivers a message only to handlers that subscribed to that topic, and causes renders only where a handler sets state.
- **Server Components.** A bus is a client-only singleton. Any component that calls `useEvent` or publishes from an event handler needs `"use client"`. Also, on the server a module-level singleton is shared across requests, so never keep per-user data in it during SSR.

## When to use it, and when not to

Use Pub-Sub when:

- the publisher has news to announce, not state to share;
- several unrelated features react to the same event;
- you need to cross a boundary that props cannot: browser tabs, iframes, micro-frontends, non-React code.

Avoid it when:

- the data has a "current value" that late components need. Use a store;
- a parent and child talk to each other. Props and callbacks are easier to follow;
- you are tempted to use it for everything. A codebase where every interaction is an event is very hard to debug, because "who changed this?" has no answer in the component tree.

## Common pitfalls

1. **Forgetting to unsubscribe.** Every `subscribe` without cleanup is a memory leak and a handler that may set state on an unmounted component. Always return the unsubscribe function from the effect.
2. **Expecting events to be replayed.** A component that mounts after an event fired never sees it. If late subscribers need the data, it is state; put it in a store.
3. **Stale or churning handlers.** Listing an inline handler as an effect dependency resubscribes on every render; leaving it out captures stale state. Use `useEffectEvent`.
4. **Untyped string topics.** `"cart:add"` vs `"cart-add"` is a bug that fails silently. Type the event map.
5. **Broadcast loops.** When you re-publish a message received from another tab, pass a flag that stops it from being broadcast again.

## Exercises

1. **Notification system** (from the repo's task). Build an `eventBus` and `useEvent`, a few publisher buttons that emit notifications, and a `NotificationPanel` subscriber.
2. **Categories and auto-hide** (from the repo's task). Support `success`, `error` and `warning`, add a dismiss button, and auto-hide after a few seconds. Make sure timers are cleared when a notification is dismissed early.
3. **Persistence** (from the repo's task). Store notifications in `localStorage`. Ask yourself: are notifications now events or state? Refactor the panel to read from a small store with `useSyncExternalStore` and keep the bus only for "show this".
4. **Cross-tab logout.** Publish a `session:expired` event and make every open tab redirect to the login page.
5. **Count the renders.** Implement the cart badge three ways: lifted state, context, and the bus. Use the React DevTools Profiler to record which components render on each "Add to cart" click.

## Video and source code

- Video (Day 10): [Pub-Sub vs Observer in React: Deep Dive, Architecture & Working Demo](https://www.youtube.com/watch?v=ociC3llkLHk)
- Source code: [day-10 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-10)

This chapter is based on Day 10 of the "15 Days of React Design Patterns" series by tapaScript (Tapas Adhikary), released under the Apache-2.0 license; thanks to him for the original lesson and demo code.
