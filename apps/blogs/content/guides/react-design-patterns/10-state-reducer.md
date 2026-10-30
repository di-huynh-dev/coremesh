---
title: "State Reducer"
description: "Let consumers change how a component's state transitions work by passing their own reducer, instead of adding one more config prop per request."
order: 10
---

## The problem: one more prop for every special case

You build a small `Toggle` component. It flips between on and off and counts clicks. It ships, people like it, and then the requests start coming in:

- "Can it stop toggling after three clicks?"
- "On the onboarding page it should only turn on, never back off."
- "Can it ignore clicks while the form is submitting?"

Each request is reasonable, and the easy answer is a new prop:

```tsx
import { useState } from "react";

type ToggleProps = {
  maxClicks?: number;
  onlyTurnOn?: boolean;
  disabledWhileSubmitting?: boolean;
  isSubmitting?: boolean;
  onToggle?: (on: boolean) => void;
};

export function Toggle({
  maxClicks,
  onlyTurnOn,
  disabledWhileSubmitting,
  isSubmitting,
  onToggle,
}: ToggleProps) {
  const [on, setOn] = useState(false);
  const [clicks, setClicks] = useState(0);

  function handleClick() {
    if (maxClicks !== undefined && clicks >= maxClicks) return;
    if (onlyTurnOn && on) return;
    if (disabledWhileSubmitting && isSubmitting) return;
    setOn(!on);
    setClicks(clicks + 1);
    onToggle?.(!on);
  }

  return (
    <button onClick={handleClick}>
      {on ? "ON" : "OFF"} (clicks: {clicks})
    </button>
  );
}
```

This is the same "prop soup" smell we saw with compound components, but on the logic side instead of the markup side. Every new rule lives inside the component, the combinations are hard to reason about (what does `maxClicks` plus `onlyTurnOn` mean?), and the author of `Toggle` becomes the bottleneck for every product decision. The component owns its state, which is good, but it also owns every possible policy for changing that state, which is not.

## The pattern: the component owns the state, the consumer can own the rules

The State Reducer pattern splits two things that the code above mixes:

1. **Mechanism**: where state lives, which events exist (`toggle`, `reset`), and how the UI reacts.
2. **Policy**: given the current state and an event, what the next state should be.

The component keeps the mechanism. The policy is a reducer function, `(state, action) => nextState`, and the component accepts it as a prop with a sensible default. Consumers who are happy with the default pass nothing. Consumers with special needs pass a reducer and decide for themselves.

It is inversion of control applied to state transitions. Instead of the component guessing every rule up front, it hands the decision back to the caller.

### Step 1: describe state and actions as types

```tsx
export type ToggleState = {
  on: boolean;
  clicks: number;
};

export type ToggleAction = { type: "toggle" } | { type: "reset" };

export type ToggleReducer = (
  state: ToggleState,
  action: ToggleAction,
) => ToggleState;

export const initialToggleState: ToggleState = { on: false, clicks: 0 };
```

Typed actions are what make the pattern safe to expose. The consumer's reducer gets autocomplete for `action.type`, and TypeScript complains if they forget to return a state.

### Step 2: write the default reducer

```tsx
export const toggleReducer: ToggleReducer = (state, action) => {
  switch (action.type) {
    case "toggle":
      return { on: !state.on, clicks: state.clicks + 1 };
    case "reset":
      return initialToggleState;
  }
};
```

A small but real detail: the original demo increments with `state.clicks++`. That mutates the previous state object and, because it is a post-increment, puts the old value into the new state, so the counter does not move the way you expect (and behaves differently under Strict Mode, which calls reducers twice). In a reducer, always build a new object from `state.clicks + 1`.

### Step 3: let the component accept a reducer

```tsx
import { useReducer } from "react";

type ToggleProps = {
  reducer?: ToggleReducer;
  onToggle?: (on: boolean) => void;
};

export function Toggle({ reducer = toggleReducer, onToggle }: ToggleProps) {
  const [state, dispatch] = useReducer(reducer, initialToggleState);

  function handleToggle() {
    const next = reducer(state, { type: "toggle" });
    dispatch({ type: "toggle" });
    if (next.on !== state.on) {
      onToggle?.(next.on);
    }
  }

  return (
    <div>
      <button
        onClick={handleToggle}
        className={state.on ? "bg-green-600" : "bg-red-500"}
      >
        {state.on ? "ON" : "OFF"} (clicks: {state.clicks})
      </button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
}
```

Calling the reducer once to compute `next` lets `onToggle` report what will actually happen. The repo's version calls `onToggle(!on)` unconditionally, so when a custom reducer blocks the click, the parent is told about a change that never happened.

### Step 4: customize from the outside

The "stop after three clicks" rule now lives where it belongs, in the page that wants it:

```tsx
import { Toggle, toggleReducer, type ToggleReducer } from "./Toggle";

const limitedToggleReducer: ToggleReducer = (state, action) => {
  if (action.type === "toggle" && state.clicks >= 3) {
    return state;
  }
  return toggleReducer(state, action);
};

export function SettingsPage() {
  return (
    <Toggle
      reducer={limitedToggleReducer}
      onToggle={(on) => console.info("notifications", on)}
    />
  );
}
```

Notice the custom reducer handles only the case it cares about and delegates everything else to the exported `toggleReducer`. The repo's `customToggleReducer` rewrites the whole switch, which works but means the custom version silently loses any new action the component adds later (here, `reset`). Exporting the default reducer and composing on top of it is the version I recommend.

The "only turn on" rule is just as short:

```tsx
const onlyTurnOnReducer: ToggleReducer = (state, action) => {
  if (action.type === "toggle" && state.on) {
    return state;
  }
  return toggleReducer(state, action);
};
```

No new props on `Toggle`. The component did not change at all.

## A second example: a form provider with pluggable validation

The repo's second demo combines the State Reducer pattern with the Provider pattern from the previous chapter. A `FormProvider` holds form state with `useReducer`, exposes it through context, and accepts a `reducer` prop so each form can bring its own validation rules.

```tsx
import { createContext, use, useReducer, type Dispatch, type ReactNode } from "react";

export type FormValues = { name: string; email: string };

export type FormState = {
  values: FormValues;
  errors: Partial<Record<keyof FormValues, string>>;
};

export type FormAction =
  | { type: "changeField"; name: keyof FormValues; value: string }
  | { type: "reset" };

export type FormReducer = (state: FormState, action: FormAction) => FormState;

export const initialFormState: FormState = {
  values: { name: "", email: "" },
  errors: {},
};

export const defaultFormReducer: FormReducer = (state, action) => {
  switch (action.type) {
    case "changeField": {
      const errors = { ...state.errors };
      if (action.name === "email" && !action.value.includes("@")) {
        errors.email = "Invalid email address";
      } else {
        delete errors[action.name];
      }
      return {
        values: { ...state.values, [action.name]: action.value },
        errors,
      };
    }
    case "reset":
      return initialFormState;
  }
};

type FormContextValue = {
  state: FormState;
  dispatch: Dispatch<FormAction>;
};

const FormContext = createContext<FormContextValue | null>(null);

type FormProviderProps = {
  reducer?: FormReducer;
  children: ReactNode;
};

export function FormProvider({ reducer = defaultFormReducer, children }: FormProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialFormState);
  return <FormContext value={{ state, dispatch }}>{children}</FormContext>;
}

export function useFormContext(): FormContextValue {
  const context = use(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used inside <FormProvider>");
  }
  return context;
}
```

The fields component knows nothing about the rules. It only dispatches events and renders whatever errors the reducer produced:

```tsx
import type { ChangeEvent } from "react";
import { useFormContext, type FormValues } from "./form";

export function ProfileFields() {
  const { state, dispatch } = useFormContext();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch({
      type: "changeField",
      name: event.target.name as keyof FormValues,
      value: event.target.value,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <input name="name" value={state.values.name} onChange={handleChange} placeholder="Your name" />
      <input name="email" value={state.values.email} onChange={handleChange} placeholder="Your email" />
      {Object.entries(state.errors).map(([field, message]) => (
        <p key={field} role="alert">{message}</p>
      ))}
      <button type="button" onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
}
```

A stricter page plugs in its own policy, reusing the default for the field update and adding rules on top:

```tsx
import { defaultFormReducer, FormProvider, type FormReducer } from "./form";
import { ProfileFields } from "./ProfileFields";

const strictFormReducer: FormReducer = (state, action) => {
  const next = defaultFormReducer(state, action);
  if (action.type !== "changeField") return next;

  const errors = { ...next.errors };
  if (action.name === "name" && /\d/.test(action.value)) {
    errors.name = "Name cannot contain numbers";
  }
  if (action.name === "email" && action.value && !action.value.endsWith(".com")) {
    errors.email = "Email must end with .com";
  }
  return { ...next, errors };
};

export function SignupPage() {
  return (
    <FormProvider reducer={strictFormReducer}>
      <ProfileFields />
    </FormProvider>
  );
}
```

Same provider, same fields, different behavior. This is the shape I reach for in admin screens where several forms share the same fields but each team has its own validation rules.

## In 2026 / React 19

- **The pattern is alive and well in headless libraries.** Downshift is the classic example with its `stateReducer` prop, and TanStack Table and similar libraries offer the same idea through controlled state and `on*Change` callbacks. If you build headless or design-system components, this is still one of the cleanest extension points you can offer.
- **React 19 makes the provider half shorter.** You can render `<FormContext value={...}>` directly instead of `<FormContext.Provider>`, and read it with `use(FormContext)`, which, unlike `useContext`, can also be called conditionally.
- **React Compiler does not change the pattern.** Reducers are plain functions. What the Compiler does change is the advice around memoizing the context value object `{ state, dispatch }`: with the Compiler on, you no longer need `useMemo` for it.
- **It is client-side.** `useReducer` and context need `"use client"`. In a Server Components app, the provider sits at the client boundary and the reducer can be shared code imported by it.
- **Know the alternative: controlled props.** Sometimes the consumer wants the whole state, not just a say in transitions. Then a controlled API (`on` plus `onChange`) is simpler. State Reducer sits between "fully uncontrolled" and "fully controlled".

## When to use it, and when not to

Use it when:

- a reusable component keeps getting feature requests that are really policy changes;
- you are building a library or design-system component used by teams you do not control;
- the state has several actions and the rules for moving between them vary by screen.

Skip it when:

- the component is used in one place. Just change the code;
- a single boolean prop truly covers the need;
- the consumer actually wants to own the state. Make the component controlled instead.

## Common pitfalls

1. **Mutating state inside the reducer.** `state.clicks++` or `errors[name] = ...` on the previous object breaks React's change detection and makes bugs appear only sometimes. Always return a new object.
2. **Replacing instead of composing.** A custom reducer that copies the entire switch drifts from the default as soon as the component adds an action. Export the default reducer and call it.
3. **Side effects in reducers.** Logging to analytics, calling APIs or saving to `localStorage` inside the reducer runs twice in Strict Mode and makes the reducer impure. Do side effects in event handlers or effects.
4. **Leaking too many action types.** Every action you expose becomes public API. Keep the action set small and stable, and treat renaming one as a breaking change.
5. **Reporting changes that did not happen.** If you call `onChange` before checking the reducer's result, the parent hears about transitions the custom reducer blocked.

## Exercises

1. **Form wizard** (from the repo's task). Build a multi-step wizard with `next`, `prev` and `reset` actions and an internal default reducer. Then let the parent pass a custom reducer that blocks `next` when the current step is incomplete, and another that auto-saves step data on `next` (keep the saving itself outside the reducer).
2. **Shared progress bar** (from the repo's task). Put the wizard state in a provider so a `ProgressBar` and a `StepTitle` in different parts of the page can both read it.
3. **Fix the demo bug.** Take the repo's `toggleReducer`, write a test that clicks three times and expects `clicks` to be 3, watch it fail, then fix it.
4. **Accordion with a policy.** Build an `Accordion` whose default reducer allows many open panels. Write a consumer reducer that keeps only one panel open, and another that prevents the last open panel from closing.

## Video and source code

- Video (Day 09): [React State Reducer Pattern Explained: Build Powerful & Reusable State Logic](https://youtu.be/vZswuz3NTgs)
- Source code: [day-09 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-09)

This chapter is based on Day 09 of the "15 Days of React Design Patterns" series by tapaScript (Tapas Adhikary), released under the Apache-2.0 license; thanks to him for the original lesson and demo code.
