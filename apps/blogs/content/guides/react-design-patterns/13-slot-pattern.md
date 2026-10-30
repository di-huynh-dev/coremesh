---
title: "Slot Pattern"
description: "Let consumers fill named regions of a component with their own JSX, instead of growing an endless list of configuration props."
order: 13
---

## The problem: a card that knows too much

Most reusable components start small. A `ProfileCard` shows a name and a bio. Then the design team wants an avatar, so we add `avatarUrl`. Then a badge for verified users, so we add `showBadge`. Then one screen needs a "Follow" button and another needs "Message" plus "Block", so we add `primaryActionLabel`, `onPrimaryAction`, `secondaryActions`... A few sprints later the component looks like this:

```tsx
type ProfileCardProps = {
  name: string;
  bio?: string;
  avatarUrl?: string;
  showBadge?: boolean;
  badgeText?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActions?: { label: string; onClick: () => void }[];
  footerText?: string;
  compactHeader?: boolean;
};

export function ProfileCard({
  name,
  bio,
  avatarUrl,
  showBadge,
  badgeText = "Verified",
  primaryActionLabel,
  onPrimaryAction,
  secondaryActions = [],
  footerText,
  compactHeader,
}: ProfileCardProps) {
  return (
    <div className="rounded-lg border">
      <div className={compactHeader ? "p-2" : "p-4"}>
        {avatarUrl && <img src={avatarUrl} alt="" className="size-10 rounded-full" />}
        <h3>{name}</h3>
        {showBadge && <span className="badge">{badgeText}</span>}
      </div>
      {bio && <p className="p-4">{bio}</p>}
      <div className="flex justify-end gap-2 p-4">
        {secondaryActions.map((action) => (
          <button key={action.label} onClick={action.onClick}>
            {action.label}
          </button>
        ))}
        {primaryActionLabel && <button onClick={onPrimaryAction}>{primaryActionLabel}</button>}
      </div>
      {footerText && <small className="p-4">{footerText}</small>}
    </div>
  );
}
```

Every prop is a decision the card makes on behalf of its callers. The card decides that a header holds exactly one image, one title and one badge. It decides that actions are buttons with a label, never a link, never a dropdown. When a new screen needs a tooltip on the badge, someone has to open this file and add yet another prop, and the change risks breaking every other screen that uses it.

This is the "prop soup" smell. In my projects I usually notice it when a component has more boolean props than lines of real layout logic. The component stopped being a layout and became a configuration parser.

## The pattern: let the caller fill the holes

The Slot pattern flips the responsibility. The component owns the **structure** (borders, spacing, where the header sits relative to the footer). The caller owns the **content** of each region. Each region is a "slot": a place where the component renders whatever React node it receives.

The name comes from Web Components and Vue, which have a `<slot>` element. React has no special syntax for it, and it does not need one: JSX elements are plain values, so any prop typed as `ReactNode` can carry a piece of UI. There are three common flavors.

### Step 1: the default slot with `children`

The simplest slot is `children`. The component draws a frame and puts everything inside it:

```tsx
import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
};

export function Card({ children }: CardProps) {
  return <div className="max-w-md rounded-lg border p-4">{children}</div>;
}
```

```tsx
<Card>
  <h3>Huỳnh Tiến Dĩ</h3>
  <p>Frontend developer, writes about React and TypeScript.</p>
</Card>
```

This already removes a lot of props. But a single slot cannot express "this part goes in the header, that part goes in the footer". For that we need more than one hole.

### Step 2: named slots as props

Named slots are just several `ReactNode` props, each mapped to a region:

```tsx
import type { ReactNode } from "react";

type ProfileCardProps = {
  header: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
};

export function ProfileCard({ header, children, actions, footer }: ProfileCardProps) {
  return (
    <article className="w-[540px] rounded-lg border">
      <header className="flex items-center gap-3 border-b bg-amber-50 p-3">{header}</header>
      <div className="p-3">{children}</div>
      {actions && <div className="flex justify-end gap-2 border-t p-3">{actions}</div>}
      {footer && <footer className="border-t bg-emerald-50 p-3 text-sm">{footer}</footer>}
    </article>
  );
}
```

Notice two choices. The main content stays in `children`, because it is the most natural thing to nest. Optional slots render their wrapper only when they have content, so the card never shows an empty bordered strip.

### Step 3: refactor the call sites

Now each screen composes exactly what it needs:

```tsx
import { ProfileCard } from "./ProfileCard";
import { Avatar } from "@/components/Avatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { FollowButton } from "@/features/follow/FollowButton";
import { ProfileMenu } from "@/features/profile/ProfileMenu";

type User = {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  isVerified: boolean;
  joinedAt: string;
};

export function UserProfileCard({ user }: { user: User }) {
  return (
    <ProfileCard
      header={
        <>
          <Avatar src={user.avatarUrl} size="md" />
          <h3 className="font-semibold">{user.name}</h3>
          {user.isVerified && <VerifiedBadge tooltip="Identity confirmed" />}
        </>
      }
      actions={
        <>
          <ProfileMenu userId={user.id} />
          <FollowButton userId={user.id} />
        </>
      }
      footer={`Joined ${user.joinedAt}`}
    >
      <p>{user.bio}</p>
    </ProfileCard>
  );
}
```

The tooltip on the badge, the dropdown menu, the follow logic: none of it touched `ProfileCard`. The card went from ten props to four, and those four describe regions, not features. That is the core benefit: **the component stays closed for modification but open for extension**.

### Step 4 (optional): a slot map for layouts with many regions

When a component has many regions, some teams group them into a single `slots` object. The repo's `SlotsMapLayout` does this for a page shell:

```tsx
import type { ReactNode } from "react";

type PageSlots = {
  sidebar?: ReactNode;
  header?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
};

export function PageLayout({ slots }: { slots: PageSlots }) {
  return (
    <div className="flex gap-12 p-2">
      {slots.sidebar && <aside className="w-60 shrink-0">{slots.sidebar}</aside>}
      <main className="flex-1">
        {slots.header && <header>{slots.header}</header>}
        <section className="mt-3">{slots.content}</section>
        {slots.footer && <footer className="mt-3">{slots.footer}</footer>}
      </main>
    </div>
  );
}
```

The map is handy when you forward slots through several layers, because you pass one object instead of five props. For a component with two or three regions, plain named props read better.

## A second example: a toolbar with start, center and end

Toolbars are a classic slot use case, and the repo's task asks for one. The toolbar only knows the three-column layout; it does not know whether the left side is a back button or a breadcrumb.

```tsx
import type { ReactNode } from "react";

type ToolbarProps = {
  start?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
};

export function Toolbar({ start, center, end }: ToolbarProps) {
  return (
    <div role="toolbar" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b px-4 py-2">
      <div className="flex items-center gap-2 justify-self-start">{start}</div>
      <div className="hidden items-center gap-2 md:flex">{center}</div>
      <div className="flex items-center gap-2 justify-self-end">{end}</div>
    </div>
  );
}
```

```tsx
<Toolbar
  start={<BackButton to="/orders" />}
  center={<OrderStatusFilter value={status} onChange={setStatus} />}
  end={
    <>
      <ExportButton orderIds={selectedIds} />
      <Button variant="primary">New order</Button>
    </>
  }
/>
```

The same `Toolbar` serves the orders page, the settings page and the editor page, each with completely different controls.

### Slots versus compound components

The repo also shows `CardCompound` with `Card.Header`, `Card.Body`, `Card.Actions` (covered in the Compound Components chapter). Both patterns split a component into regions. The difference is who controls the layout:

- With **slots**, the parent component decides where each region goes. The caller cannot put the footer above the header.
- With **compound components**, the caller arranges the sub-components in JSX, and they usually share state through context.

Pick slots when the layout is fixed and the content varies. Pick compound components when the caller needs to reorder parts or when the parts must coordinate state (tabs, accordions, selects).

## In 2026 / React 19

The Slot pattern has aged very well, mostly because it is nothing more than "props can hold JSX". A few things are worth knowing today.

**Slots are the key to mixing Server and Client Components.** A Client Component cannot import a Server Component, but it can receive one as `children` or as any `ReactNode` prop. So a `"use client"` `Sidebar` with collapse state can render a server-fetched `<RecentOrders />` passed through a slot. The server part is rendered on the server and arrives as already-rendered output; the client component just places it. In App Router code, this is how I keep interactive shells small.

**Next.js parallel routes are named slots at the routing level.** A folder like `@analytics` becomes a prop on the parent `layout.tsx`, next to `children`. Same idea, applied by the framework.

**`Children` utilities are legacy.** react.dev lists `Children.map`, `Children.toArray` and `cloneElement` under legacy APIs. Some libraries implement "slots" by scanning `children` for a specific component type. That breaks as soon as the caller wraps a slot in a fragment or a custom component. Explicit props are more robust and type-safe.

**`asChild` is a different "Slot".** Radix and shadcn/ui export a `Slot` component used for the `asChild` prop, which merges props onto the child element (render a `Button` as a `Link`, for example). It shares the name, but solves polymorphism, not layout regions.

**React Compiler is fine with slots.** JSX passed as a prop is a new object each render, which used to defeat `memo`. The compiler memoizes JSX elements automatically when their inputs do not change, so you rarely need to think about it now. `ref` is also a regular prop in React 19, so a slot component can accept `ref` without `forwardRef`.

## When to use it, and when not to

Use slots when:

- The structure is stable but the content differs per screen (cards, modals, page shells, toolbars, empty states).
- You are building a design system component and cannot predict every use case.
- You want a Client Component to render Server Component content.

Avoid or rethink slots when:

- The slot needs data that only the parent has (the current row, the open state). A plain `ReactNode` cannot receive arguments; use a function prop (render prop) such as `renderItem={(item) => ...}` instead.
- The parts must share state or be reordered by the caller. Compound components fit better.
- The component has one fixed look and two call sites. A couple of string props is simpler than a slot API.

## Common pitfalls

1. **Empty wrappers.** Rendering `<footer className="border-t p-3">{footer}</footer>` when `footer` is `undefined` leaves a visible empty strip. Guard the wrapper, not just the content.
2. **Too many slots.** A layout with twelve slots is prop soup with JSX instead of strings. If you keep adding regions, the component probably wants to be split.
3. **Moving a slot between positions.** If a responsive layout renders `center` inside the toolbar on desktop and inside a menu on mobile using different JSX branches, React sees a different tree position and remounts it, losing internal state such as an input's value. Prefer CSS to move it, or keep it at the same position in the tree.
4. **Finding slots by type.** `children.find((child) => child.type === Header)` is brittle and hard to type. Use named props.
5. **Leaking layout into slots.** If every caller has to add `className="p-3"` to their slot content, the padding belongs in the component, not in the slot.

## Exercises

1. **Responsive toolbar.** Build `Toolbar` with `start`, `center` and `end` slots. On small screens, move the `center` content into an overflow menu. Show it on a demo page with at least two different toolbars.
2. **Toast system with slot templates.** Each toast accepts `icon`, `message` and `action` slots. Provide a way to register templates (`success`, `error`, `info`) and a `showToast(template, slots)` function to render them programmatically.
3. **Refactor a prop-heavy modal.** Take a `Modal` with props like `title`, `subtitle`, `confirmText`, `cancelText`, `hideFooter`, `danger` and turn it into `title`, `children` and `footer` slots. Count how many props you removed.
4. **Mix slots and render props.** Build a `DataList<T>` with an `empty` slot (`ReactNode`) and a `renderItem` function prop. Explain in a sentence why one is a slot and the other is not.

## Video and source code

- Video: [React Slot Pattern Explained: The Cleanest Way to Build Flexible Components](https://youtu.be/_LBgDy0j-Os)
- Source code: [day-12 on GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-12)

This chapter is based on Day 12 of the "15 Days of React Design Patterns" series by tapaScript (Tapas Adhikary), adapted to TypeScript and React 19.
