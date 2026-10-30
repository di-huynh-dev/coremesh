---
title: "Controlled and Uncontrolled Components"
description: "Decide who owns an input's value, React state or the DOM, pick one source of truth per form, and see how React 19 form Actions change the trade-off."
order: 3
---

Every input on a page holds a value. The question this chapter answers is: who is the source of truth for that value? Either React state owns it and the DOM just displays it (controlled), or the DOM owns it and React reads it when needed (uncontrolled). Both are valid. Mixing them carelessly inside one form is where bugs come from.

## The problem: a form with two sources of truth

Here is a feedback form I have seen variations of many times. Name and email are kept in state. The message field, added later by someone else, is read through a ref.

```tsx
import { useRef, useState, type FormEvent } from "react";

export function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name) {
      alert("Name required");
      return;
    }
    if (!email.includes("@")) {
      alert("Valid email required");
      return;
    }
    if (!messageRef.current?.value) {
      messageRef.current?.focus();
      return;
    }
    console.log("Submitted", { name, email, message: messageRef.current.value });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
      <textarea ref={messageRef} placeholder="Your message" />
      <button type="submit">Send Feedback</button>
    </form>
  );
}
```

It works, but look at what it costs. Resetting the form needs two different mechanisms: `setName("")` for some fields and `messageRef.current.value = ""` for another. You cannot show a live character count for the message without converting it. Validation reports errors in two different ways, an `alert` for two fields and a focus for the third. And anyone reading the code has to figure out, field by field, where the value actually lives. The form is not wrong, it is inconsistent, and inconsistency is what makes the next change risky.

## The pattern: pick one owner per form

Before refactoring, it helps to be precise about the two tools.

### State vs refs

`useState` holds a value React tracks. Changing it re-renders the component, so the UI always reflects it. `useRef` holds a mutable object whose `.current` survives renders, but changing it does not re-render anything.

```tsx
import { useRef, useState } from "react";

export function RenderDemo() {
  const [stateCount, setStateCount] = useState(0);
  const refCount = useRef(0);

  return (
    <div>
      <p>State count: {stateCount}</p>
      <p>Ref count (stale until next render): {refCount.current}</p>
      <button onClick={() => setStateCount((count) => count + 1)}>Increment state</button>
      <button onClick={() => { refCount.current += 1; }}>Increment ref</button>
    </div>
  );
}
```

Click "Increment ref" five times and nothing changes on screen. Click "Increment state" once and the ref count jumps to 5, because the re-render finally read it. That is the whole difference: state is for values the UI shows, refs are for values the UI does not need to react to, and for handles to DOM nodes (focus, scroll, measure).

With that in mind, the two patterns are:

- **Controlled component**: the input's `value` comes from state, and `onChange` updates that state. React is the single source of truth. You get instant validation, derived UI (counters, disabled buttons), and programmatic reset for free.
- **Uncontrolled component**: the input keeps its own value in the DOM. You set an initial `defaultValue` and read the current value when you need it, through a ref or through `FormData` on submit. Less code, fewer re-renders, but React does not "know" the value between reads.

### Refactor 1: fully controlled

One state object holds the whole form. Refs are still used, but only for what refs are good at: moving focus.

```tsx
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

type Feedback = { name: string; email: string; message: string };
type FieldName = keyof Feedback;

const emptyFeedback: Feedback = { name: "", email: "", message: "" };

function validate(feedback: Feedback): FieldName | null {
  if (!feedback.name.trim()) return "name";
  if (!feedback.email.includes("@")) return "email";
  if (!feedback.message.trim()) return "message";
  return null;
}

export function ControlledFeedbackForm() {
  const [feedback, setFeedback] = useState<Feedback>(emptyFeedback);
  const [invalidField, setInvalidField] = useState<FieldName | null>(null);
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFeedback((current) => ({ ...current, [name]: value }));
    setInvalidField(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstInvalid = validate(feedback);
    if (firstInvalid) {
      setInvalidField(firstInvalid);
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }
    console.log("Submitted", feedback);
    setFeedback(emptyFeedback);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input
        name="name"
        ref={(node) => { fieldRefs.current.name = node; }}
        value={feedback.name}
        onChange={handleChange}
        aria-invalid={invalidField === "name"}
        placeholder="Name"
      />
      <input
        name="email"
        type="email"
        ref={(node) => { fieldRefs.current.email = node; }}
        value={feedback.email}
        onChange={handleChange}
        aria-invalid={invalidField === "email"}
        placeholder="Email"
      />
      <textarea
        name="message"
        ref={(node) => { fieldRefs.current.message = node; }}
        value={feedback.message}
        onChange={handleChange}
        aria-invalid={invalidField === "message"}
        placeholder="Your message"
      />
      <p>{feedback.message.length} / 500</p>
      <button type="submit" disabled={feedback.message.length > 500}>
        Send Feedback
      </button>
    </form>
  );
}
```

Notice what became easy: the character counter and the disabled button are one line each, validation is a pure function you can unit test, and reset is `setFeedback(emptyFeedback)`. The `name` attribute on each field doubles as the key into the state object, so one `handleChange` serves every input.

### Refactor 2: fully uncontrolled

Now the opposite direction. No state for values at all; the DOM holds them and we read them on submit.

```tsx
import { useRef, type FormEvent } from "react";

export function UncontrolledFeedbackForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = nameRef.current?.value ?? "";
    const email = emailRef.current?.value ?? "";
    const message = messageRef.current?.value ?? "";

    if (!name.trim()) return nameRef.current?.focus();
    if (!email.includes("@")) return emailRef.current?.focus();
    if (!message.trim()) return messageRef.current?.focus();

    console.log("Submitted", { name, email, message });
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input ref={nameRef} placeholder="Name" />
      <input ref={emailRef} type="email" placeholder="Email" />
      <textarea ref={messageRef} placeholder="Your message" />
      <button type="submit">Send Feedback</button>
    </form>
  );
}
```

You can go one step further and drop the refs, letting the browser's `FormData` API collect values by `name`:

```tsx
import type { FormEvent } from "react";

export function UncontrolledSignupForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "");
    const email = String(formData.get("email") ?? "");
    console.log("Signup", { username, email });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" required placeholder="Username" />
      <input name="email" type="email" required placeholder="Email" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

This version re-renders zero times while the user types, and the browser's built-in validation (`required`, `type="email"`) does the simple checks. For a login or newsletter form, that is often all you need.

## A second example: a component that supports both modes

The pattern matters even more when you build reusable components. Native inputs let the caller choose: pass `value` and it is controlled, pass `defaultValue` and it is uncontrolled. Good design-system components do the same. Here is a quantity stepper that works either way.

```tsx
import { useState } from "react";

function useControllableState<T>(controlledValue: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  function setValue(next: T) {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }

  return [value, setValue] as const;
}

type QuantityStepperProps = {
  value?: number;
  defaultValue?: number;
  onChange?: (quantity: number) => void;
  min?: number;
  max?: number;
};

export function QuantityStepper({ value, defaultValue = 1, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  const [quantity, setQuantity] = useControllableState(value, defaultValue, onChange);

  return (
    <div role="group" aria-label="Quantity">
      <button onClick={() => setQuantity(Math.max(min, quantity - 1))} disabled={quantity <= min}>
        -
      </button>
      <output>{quantity}</output>
      <button onClick={() => setQuantity(Math.min(max, quantity + 1))} disabled={quantity >= max}>
        +
      </button>
    </div>
  );
}
```

```tsx
import { useState } from "react";
import { QuantityStepper } from "./QuantityStepper";

export function CartLine() {
  const [quantity, setQuantity] = useState(2);
  return (
    <>
      <QuantityStepper defaultValue={1} />
      <QuantityStepper value={quantity} onChange={setQuantity} max={5} />
      <p>Subtotal: {quantity * 19}</p>
    </>
  );
}
```

The first stepper manages itself. The second is driven by its parent, which can clamp, sync with a cart store, or compute a subtotal. Libraries like Radix UI and Ant Design follow exactly this `value` / `defaultValue` / `onChange` convention, which is why it is worth learning to build. One rule: a component should not switch between controlled and uncontrolled during its lifetime; React warns about this for native inputs for a reason.

## In 2026 / React 19

React 19 shifted the default for forms noticeably toward uncontrolled.

- **Form Actions.** You can pass a function to `<form action={...}>`. React calls it with the `FormData` on submit, wraps it in a transition, and, when the action succeeds, automatically resets uncontrolled fields. No `preventDefault`, no refs.
- **`useActionState`** gives you the action's last result (errors, a success message) and an `isPending` flag. Return the submitted values from the action and use them as `defaultValue` to keep what the user typed when validation fails.
- **`useFormStatus`** from `react-dom` lets a submit button deep inside the form read `pending` without prop drilling.

```tsx
import { useActionState } from "react";

type ContactState = { error: string | null; values: { email: string; message: string } };

async function sendContact(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const email = String(formData.get("email") ?? "");
  const message = String(formData.get("message") ?? "");
  if (!email.includes("@")) return { error: "Please enter a valid email", values: { email, message } };
  await fetch("/api/contact", { method: "POST", body: formData });
  return { error: null, values: { email: "", message: "" } };
}

const initialState: ContactState = { error: null, values: { email: "", message: "" } };

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(sendContact, initialState);

  return (
    <form action={formAction}>
      <input name="email" type="email" defaultValue={state.values.email} placeholder="Email" />
      <textarea name="message" defaultValue={state.values.message} placeholder="Message" />
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={isPending}>{isPending ? "Sending..." : "Send"}</button>
    </form>
  );
}
```

- **`ref` is a regular prop.** Function components receive `ref` directly, so wrapping a custom `TextField` no longer needs `forwardRef`. Callback refs can also return a cleanup function.
- **Server Components.** Controlled inputs need state, so they need `"use client"`. An uncontrolled form with a Server Function as its action can render from a Server Component and still work before JavaScript loads.
- **Form libraries.** React Hook Form is uncontrolled at its core and registers inputs by ref, which is why it stays fast on huge forms. Libraries like TanStack Form lean controlled. Knowing this pattern tells you what you trade when picking one.

Controlled inputs are still the right tool for live feedback: search-as-you-type, formatted inputs (currency, phone), dependent fields, and anything the UI must reflect on every keystroke.

## When to use which

Controlled fits when:

- The UI reacts to the value while typing (validation messages, counters, previews, enabling buttons).
- Values are formatted, masked or derived from other fields.
- The value must be set programmatically (reset to server data, "fill from profile").

Uncontrolled fits when:

- You only need the values on submit (login, contact, newsletter).
- The form is large and per-keystroke re-renders hurt.
- You use form Actions or a library like React Hook Form.
- You integrate non-React widgets that manage their own DOM (file inputs are always uncontrolled).

## Common pitfalls

1. **Mixing modes in one form**, as in the original example. Pick one owner per form, and use refs alongside controlled state only for imperative tasks like focus.
2. **Switching a single input between modes.** `value={user?.name}` starts as `undefined` (uncontrolled) and becomes a string (controlled), and React warns. Use `value={user?.name ?? ""}`.
3. **Setting `value` without `onChange`.** The input becomes read-only. Use `defaultValue` if you just want an initial value, or add `readOnly` if that is the intent.
4. **Expecting a ref change to update the UI.** Writing to `ref.current` never re-renders. If the screen should show it, it belongs in state.
5. **Expecting `defaultValue` to follow prop changes.** It is read only on mount. To reload an uncontrolled form with new data, change its `key`.

## Exercises

1. Build a contact form (name, email, subject, message) three ways: controlled, uncontrolled with refs, and uncontrolled with `FormData` and no refs.
2. Write a short Markdown comparison table of the three versions: code style, validation, reset, readability and complexity.
3. Rebuild the contact form with React 19 `<form action>` and `useActionState`, keeping typed values when server validation fails.
4. Turn `QuantityStepper` into a `TagInput` that supports both `value` and `defaultValue`, and verify both modes in a small demo page.

## Video and source code

This chapter is adapted from Day 02 of tapaScript's "15 Days of React Design Patterns" by Tapas Adhikary, which walks through state vs refs and the feedback form refactor on video.

- Video: [React Design Patterns || Controlled & Uncontrolled Forms](https://youtu.be/jPMCouXondI)
- Source code: [github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-02](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-02)
