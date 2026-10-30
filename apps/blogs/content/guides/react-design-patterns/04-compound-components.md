---
title: "Compound Components"
description: "Replace prop soup with a family of components that share state through context, like Modal.Header or Accordion.Item, and use it safely with React 19 and RSC."
order: 4
---

Some UI pieces are not one component but a small family: a modal has a header, a body and a footer; tabs have a list, triggers and panels; an accordion has items that open and close. The naive way to build these is one big component configured by props. The Compound Components pattern builds them the way HTML builds `<select>` and `<option>`: several components that only make sense together and share state behind the scenes.

## The problem: prop soup

Here is a modal that started simple and grew one prop at a time.

```tsx
import type { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  body: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  showCloseButton?: boolean;
  hideFooter?: boolean;
  headerIcon?: ReactNode;
  footerAlign?: "left" | "right" | "space-between";
  onClose: () => void;
};

export function Modal({
  isOpen,
  title,
  subtitle,
  body,
  primaryAction,
  secondaryAction,
  showCloseButton = true,
  hideFooter = false,
  headerIcon,
  footerAlign = "right",
  onClose,
}: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-container" role="dialog" aria-modal="true">
        <header className="modal-header">
          {headerIcon}
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
          {showCloseButton && <button onClick={onClose}>Close</button>}
        </header>
        <div className="modal-body">{body}</div>
        {!hideFooter && (
          <footer className={`modal-footer align-${footerAlign}`}>
            {secondaryAction}
            {primaryAction}
          </footer>
        )}
      </div>
    </div>
  );
}
```

Every new design request adds another prop. Want a header with a badge next to the title? New prop. Want two rows in the footer? New prop. Want the body to come before the header on mobile? You cannot, the order is hard-coded. The component has become a configuration language with its own undocumented grammar, and every caller pays for every option, even ones they never use.

This is "prop soup": the parent decides the structure, and callers can only toggle flags. The more callers you have, the worse it gets, because each one wants a small variation and the only way to add one is another prop.

## The pattern: let callers compose the structure

Compound components flip control. The parent component provides shared state and behavior. Child components render the pieces. The caller arranges the pieces in JSX however they like:

```tsx
<Modal isOpen={isOpen} onClose={close}>
  <Modal.Header>...</Modal.Header>
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>...</Modal.Footer>
</Modal>
```

Two ingredients make it work: `children` for layout freedom, and context for sharing state between the parent and whichever children need it.

### Step 1: structural subcomponents

The simplest version only uses `children`. Each subcomponent is a styled wrapper.

```tsx
import type { ReactNode } from "react";

type SlotProps = { children: ReactNode; className?: string };

function ModalHeader({ children, className = "" }: SlotProps) {
  return <header className={`modal-header ${className}`}>{children}</header>;
}

function ModalBody({ children, className = "" }: SlotProps) {
  return <div className={`modal-body ${className}`}>{children}</div>;
}

function ModalFooter({ children, className = "" }: SlotProps) {
  return <footer className={`modal-footer ${className}`}>{children}</footer>;
}
```

Already the header with a badge, the two-row footer and the custom order are free: callers write whatever JSX they need inside each piece.

### Step 2: share state with context

A close button inside the header needs `onClose`, but we do not want callers to pass it again. The root puts it in context; any piece can read it.

```tsx
import { createContext, use, type ReactNode } from "react";

type ModalContextValue = { onClose: () => void; titleId: string };

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext(componentName: string) {
  const context = use(ModalContext);
  if (!context) throw new Error(`<${componentName}> must be used inside <Modal>`);
  return context;
}
```

The guard turns a confusing `undefined` crash into a clear message when someone renders `Modal.Close` outside a modal.

### Step 3: the root and the attached parts

```tsx
import { useId, type ReactNode } from "react";

type ModalRootProps = { isOpen: boolean; onClose: () => void; children: ReactNode };

function ModalRoot({ isOpen, onClose, children }: ModalRootProps) {
  const titleId = useId();
  if (!isOpen) return null;

  return (
    <ModalContext value={{ onClose, titleId }}>
      <div className="modal-backdrop" onClick={onClose}>
        <div
          className="modal-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalContext>
  );
}

function ModalTitle({ children }: { children: ReactNode }) {
  const { titleId } = useModalContext("Modal.Title");
  return <h2 id={titleId}>{children}</h2>;
}

function ModalClose({ children = "Close" }: { children?: ReactNode }) {
  const { onClose } = useModalContext("Modal.Close");
  return <button type="button" onClick={onClose}>{children}</button>;
}

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Title: ModalTitle,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
});
```

`Object.assign` gives TypeScript a correct type for `Modal.Header` and friends without declaring an interface by hand. Note also the accessibility win: `Modal.Title` wires `aria-labelledby` automatically, something the old prop-based version never did.

### Step 4: using it

```tsx
import { useState } from "react";
import { Modal } from "./Modal";

export function DeleteProjectButton({ projectName }: { projectName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Delete project</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header>
          <Modal.Title>Delete {projectName}?</Modal.Title>
          <span className="badge">Irreversible</span>
        </Modal.Header>
        <Modal.Body>
          <p>All environments and deploy history will be removed.</p>
        </Modal.Body>
        <Modal.Footer className="justify-between">
          <Modal.Close>Cancel</Modal.Close>
          <button className="danger" onClick={() => setIsOpen(false)}>
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
```

There is no `showCloseButton`, `hideFooter` or `footerAlign`. You show a close button by rendering one, hide the footer by not rendering it, and align it with a class.

## A second example: an accordion with shared state

The modal mostly shares callbacks. An accordion shows the stronger form of the pattern, where the parent owns state that coordinates siblings. A simple version where every item keeps its own `isOpen` works, but you cannot express "only one open at a time". Lifting that state into the root fixes it.

```tsx
import { createContext, use, useId, useState, type ReactNode } from "react";

type AccordionContextValue = {
  isOpen: (itemId: string) => boolean;
  toggle: (itemId: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<string | null>(null);

function useAccordion() {
  const context = use(AccordionContext);
  if (!context) throw new Error("Accordion parts must be used inside <Accordion>");
  return context;
}

function useItemId() {
  const itemId = use(AccordionItemContext);
  if (!itemId) throw new Error("Use Accordion.Trigger and Accordion.Panel inside <Accordion.Item>");
  return itemId;
}

type AccordionProps = { children: ReactNode; allowMultiple?: boolean };

function AccordionRoot({ children, allowMultiple = false }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  function toggle(itemId: string) {
    setOpenIds((current) => {
      if (current.includes(itemId)) return current.filter((id) => id !== itemId);
      return allowMultiple ? [...current, itemId] : [itemId];
    });
  }

  return (
    <AccordionContext value={{ isOpen: (itemId) => openIds.includes(itemId), toggle }}>
      <div className="accordion">{children}</div>
    </AccordionContext>
  );
}

function AccordionItem({ children }: { children: ReactNode }) {
  const itemId = useId();
  return (
    <AccordionItemContext value={itemId}>
      <div className="accordion-item">{children}</div>
    </AccordionItemContext>
  );
}

function AccordionTrigger({ children }: { children: ReactNode }) {
  const { isOpen, toggle } = useAccordion();
  const itemId = useItemId();
  return (
    <button
      className="accordion-title"
      aria-expanded={isOpen(itemId)}
      aria-controls={`${itemId}-panel`}
      onClick={() => toggle(itemId)}
    >
      {children}
    </button>
  );
}

function AccordionPanel({ children }: { children: ReactNode }) {
  const { isOpen } = useAccordion();
  const itemId = useItemId();
  if (!isOpen(itemId)) return null;
  return <div id={`${itemId}-panel`} className="accordion-content">{children}</div>;
}

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
});
```

```tsx
import { Accordion } from "./Accordion";

export function PatternFaq() {
  return (
    <Accordion>
      <Accordion.Item>
        <Accordion.Trigger>What is the Compound Components pattern?</Accordion.Trigger>
        <Accordion.Panel>
          A parent and its children cooperate through shared state while the caller controls the layout.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Trigger>Why use it?</Accordion.Trigger>
        <Accordion.Panel>It keeps modals, tabs, menus and accordions flexible without prop soup.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
```

There are two levels of context here: the root shares "which items are open", each item shares "who am I". The trigger and panel do not receive any props about state, yet they stay in sync. Switching to multi-open is one prop on the root, and the caller can put an icon, a badge or a subtitle inside any trigger without the accordion knowing.

## In 2026 / React 19

Compound components are, if anything, more common today than when the pattern was named. Headless libraries such as Radix UI, React Aria, Base UI and Ark UI are built on it, and shadcn/ui copies Radix's compound APIs straight into your codebase. A few things have changed in how you write it:

- **`<Context value>` instead of `<Context.Provider>`.** In React 19 a context object can be rendered directly as a provider, as in the examples above. `Context.Provider` still works but is on its way out.
- **`use(Context)`.** The `use` API reads context like `useContext`, and unlike hooks it can be called inside conditions. Either works for this pattern.
- **Prefer context over `React.Children` and `cloneElement`.** Older implementations walked `children` and injected props with `cloneElement`. That breaks as soon as a caller wraps a part in a `<div>` or a custom component. The React docs list both APIs as legacy. Context works at any depth.
- **Server Components boundary.** Any part that uses state or context needs `"use client"`, which usually means the whole family lives in a client module. Also, dotting into a client component from a Server Component (`<Modal.Header>` where `Modal` is imported into a server file) is not supported by RSC, because only the exported names cross the boundary. Libraries like Radix avoid this by exporting each part by name (`Root`, `Trigger`, `Content`). If your compound component must be used from Server Components, export named parts (`ModalRoot`, `ModalHeader`) as well as, or instead of, the attached properties.
- **Native platform features.** For modals, the `<dialog>` element with `showModal()` now makes the rest of the page inert, closes on Escape and renders in the top layer, all for free. A compound `Modal` built on `<dialog>` is much less code than one built on divs.
- **React Compiler** can memoize the context value object for you, which mostly removes the old advice to wrap it in `useMemo` by hand.

## When to use it, and when not to

Use it when:

- A component has several related regions that callers want to arrange or customize.
- Siblings must coordinate state (tabs and panels, accordion items, menu items and keyboard focus).
- You are building a design system or shared library used by many teams.

Skip it when:

- The component has one fixed layout and two or three props. A simple `<Badge tone="success">` does not need `Badge.Icon`.
- Callers should not be able to change the structure, for example a legally required consent banner.
- You need it consumed directly from Server Components and do not want to manage named exports.

## Common pitfalls

1. **Forgetting the context guard.** Without a clear error, a part rendered outside its root crashes with "cannot read properties of null", far from the real mistake.
2. **Relying on child order or type checks.** Code like `children.find((child) => child.type === ModalHeader)` breaks with wrappers, fragments and memoized components. Use context and let each part render itself.
3. **One giant context for everything.** If the root shares fast-changing values (hover position, input text) with every part, all parts re-render together. Split contexts by how often they change.
4. **No controlled mode.** Real apps need to open an accordion item from a URL or close a modal after a save. Offer `value` / `defaultValue` / `onValueChange` on the root, as in the previous chapter.
5. **Over-nesting.** Five levels of `Card.Header.Title.Icon` is a sign the family is too granular. Keep parts to what callers actually customize.

## Exercises

1. Build a `Card` with `Card.Header`, `Card.Body` and `Card.Footer`.
2. Add `Card.Image` and use it in three layouts (top image, side image, image in the footer). Compare the JSX with a single `Card` that takes ten props.
3. Build `Tabs` with `Tabs.List`, `Tabs.Trigger` and `Tabs.Panel`, sharing the active tab through context. Add arrow-key navigation between triggers.
4. Give `Accordion` a controlled mode (`value` and `onValueChange`) so the open item can be synced with the URL hash.
5. Rebuild `Modal` on top of the native `<dialog>` element and remove the manual backdrop click and Escape handling where the browser now does it for you.

## Video and source code

This chapter is adapted from Day 03 of tapaScript's "15 Days of React Design Patterns" by Tapas Adhikary; the video walks through the prop-soup modal and the accordion step by step.

- Video: [React Compound Components Pattern Explained (Build Flexible UI Without Prop Soup)](https://youtu.be/LglWulOqh6k)
- Source code: [github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-03](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-03)
