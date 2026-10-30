---
title: "Slot Pattern: chừa chỗ cho nội dung"
description: "Cho phép nơi dùng tự lấp các vùng có tên của component bằng JSX, thay vì thêm mãi một danh sách props cấu hình."
order: 13
---

## Vấn đề: một cái card biết quá nhiều

Component tái sử dụng nào lúc đầu cũng nhỏ. Một `ProfileCard` chỉ hiện tên và bio. Rồi team design muốn thêm avatar, mình thêm `avatarUrl`. Rồi cần badge cho user đã xác minh, thêm `showBadge`. Rồi màn này cần nút "Follow", màn kia cần "Message" với "Block", thế là có thêm `primaryActionLabel`, `onPrimaryAction`, `secondaryActions`... Vài sprint sau, component trông như thế này:

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

Mỗi prop là một quyết định mà card đưa ra thay cho nơi dùng. Card quyết định header chỉ có đúng một ảnh, một tiêu đề, một badge. Nó quyết định action luôn là button có label, không bao giờ là link hay dropdown. Khi một màn mới cần tooltip trên badge, ai đó lại phải mở file này thêm prop, và mỗi lần sửa là một lần có thể làm hỏng các màn khác đang dùng chung.

Đây là mùi "prop soup". Ở dự án mình hay nhận ra nó khi một component có số boolean props nhiều hơn số dòng layout thật sự. Lúc đó component không còn là layout nữa, nó thành một cái parser cấu hình.

## Pattern: để nơi dùng tự lấp chỗ trống

Slot pattern đảo lại trách nhiệm. Component giữ phần **cấu trúc** (border, spacing, header nằm đâu so với footer). Nơi dùng giữ phần **nội dung** của từng vùng. Mỗi vùng là một "slot": một chỗ mà component render bất kỳ React node nào nó nhận được.

Cái tên đến từ Web Components và Vue, nơi có hẳn thẻ `<slot>`. React không có cú pháp riêng cho chuyện này, và cũng không cần: JSX element chỉ là giá trị bình thường, nên prop nào có kiểu `ReactNode` cũng chở được một mẩu UI. Có ba dạng hay gặp.

### Bước 1: default slot với `children`

Slot đơn giản nhất là `children`. Component vẽ khung, mọi thứ bên trong do nơi dùng quyết định:

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
  <p>Frontend developer, viết về React và TypeScript.</p>
</Card>
```

Chỉ vậy đã bỏ được khá nhiều props. Nhưng một slot duy nhất thì không diễn đạt được "phần này nằm ở header, phần kia nằm ở footer". Muốn vậy phải có nhiều chỗ trống hơn.

### Bước 2: named slots bằng props

Named slot đơn giản là nhiều prop kiểu `ReactNode`, mỗi prop ứng với một vùng:

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

Có hai lựa chọn đáng để ý. Nội dung chính vẫn để ở `children`, vì đó là thứ lồng vào tự nhiên nhất. Các slot tùy chọn chỉ render wrapper khi có nội dung, nên card không bao giờ hiện một dải border trống.

### Bước 3: refactor nơi dùng

Giờ mỗi màn tự ghép đúng thứ nó cần:

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
          {user.isVerified && <VerifiedBadge tooltip="Đã xác minh danh tính" />}
        </>
      }
      actions={
        <>
          <ProfileMenu userId={user.id} />
          <FollowButton userId={user.id} />
        </>
      }
      footer={`Tham gia từ ${user.joinedAt}`}
    >
      <p>{user.bio}</p>
    </ProfileCard>
  );
}
```

Tooltip trên badge, dropdown menu, logic follow: không cái nào phải đụng vào `ProfileCard`. Card đi từ mười props xuống còn bốn, và bốn props đó mô tả vùng chứ không mô tả tính năng. Đó là lợi ích cốt lõi: **component đóng với việc sửa đổi nhưng mở với việc mở rộng**.

### Bước 4 (tùy chọn): slot map cho layout nhiều vùng

Khi component có nhiều vùng, có team gom hết vào một object `slots`. `SlotsMapLayout` trong repo làm vậy cho khung trang:

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

Slot map tiện khi cần chuyền slot qua nhiều tầng, vì chỉ chuyền một object thay vì năm props. Còn với component hai, ba vùng thì named props đọc dễ hơn.

## Ví dụ thứ hai: toolbar với start, center, end

Toolbar là trường hợp kinh điển của slot, và task trong repo cũng yêu cầu làm một cái. Toolbar chỉ biết layout ba cột, nó không cần biết bên trái là nút back hay breadcrumb.

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
      <Button variant="primary">Tạo đơn</Button>
    </>
  }
/>
```

Cùng một `Toolbar` dùng được cho trang đơn hàng, trang cài đặt, trang editor, mỗi nơi một bộ control khác hẳn nhau.

### Slot hay compound components?

Repo cũng có `CardCompound` với `Card.Header`, `Card.Body`, `Card.Actions` (đã nói ở chương Compound Components). Cả hai pattern đều chia component thành nhiều vùng. Khác nhau ở chỗ ai nắm layout:

- Với **slot**, component cha quyết định vùng nào nằm đâu. Nơi dùng không thể đặt footer lên trên header.
- Với **compound components**, nơi dùng tự sắp các sub-component trong JSX, và chúng thường chia sẻ state qua context.

Chọn slot khi layout cố định còn nội dung thay đổi. Chọn compound components khi nơi dùng cần đổi thứ tự các phần, hoặc khi các phần phải phối hợp state với nhau (tabs, accordion, select).

## Năm 2026 / React 19

Slot pattern già đi rất đẹp, chủ yếu vì nó chẳng có gì hơn ngoài "props chứa được JSX". Có vài điều nên biết ở thời điểm hiện tại.

**Slot là chìa khóa để trộn Server và Client Components.** Một Client Component không import được Server Component, nhưng có thể nhận nó qua `children` hoặc bất kỳ prop `ReactNode` nào. Nên một `Sidebar` có `"use client"` với state thu gọn/mở rộng vẫn render được `<RecentOrders />` fetch dữ liệu trên server, truyền vào qua slot. Phần server được render ở server và gửi xuống dưới dạng kết quả đã render, client component chỉ việc đặt nó vào đúng chỗ. Khi viết App Router, mình dùng cách này để giữ phần shell tương tác càng nhỏ càng tốt.

**Parallel routes của Next.js là named slot ở tầng routing.** Một thư mục như `@analytics` trở thành một prop của `layout.tsx` cha, đứng cạnh `children`. Cùng một ý tưởng, chỉ là framework làm giúp.

**Các tiện ích `Children` đã là legacy.** react.dev xếp `Children.map`, `Children.toArray` và `cloneElement` vào nhóm legacy API. Một số thư viện làm "slot" bằng cách lục `children` để tìm component theo type. Cách đó gãy ngay khi nơi dùng bọc slot trong fragment hay một component riêng. Props tường minh vẫn chắc chắn hơn và type-safe hơn.

**`asChild` là một kiểu "Slot" khác.** Radix và shadcn/ui có export component `Slot` dùng cho prop `asChild`, nó merge props vào element con (ví dụ render `Button` thành `Link`). Trùng tên, nhưng nó giải bài toán polymorphism chứ không phải chia vùng layout.

**React Compiler không có vấn đề gì với slot.** JSX truyền qua prop là object mới mỗi lần render, chuyện này từng làm `memo` mất tác dụng. Compiler tự memoize JSX element khi input không đổi, nên giờ hiếm khi phải bận tâm. `ref` cũng đã là prop bình thường trong React 19, component có slot nhận `ref` mà không cần `forwardRef`.

## Khi nào nên dùng, khi nào không

Nên dùng slot khi:

- Cấu trúc ổn định nhưng nội dung khác nhau theo từng màn (card, modal, khung trang, toolbar, empty state).
- Bạn đang làm component cho design system và không đoán trước được mọi use case.
- Bạn muốn một Client Component render nội dung của Server Component.

Nên tránh hoặc cân nhắc lại khi:

- Slot cần dữ liệu mà chỉ component cha mới có (row hiện tại, trạng thái đóng mở). Một `ReactNode` thuần không nhận được tham số, lúc đó dùng function prop (render prop) kiểu `renderItem={(item) => ...}`.
- Các phần phải chia sẻ state hoặc được nơi dùng sắp lại thứ tự. Compound components hợp hơn.
- Component chỉ có một giao diện cố định và hai chỗ dùng. Vài prop string đơn giản hơn một slot API.

## Những lỗi hay gặp

1. **Wrapper rỗng.** Render `<footer className="border-t p-3">{footer}</footer>` khi `footer` là `undefined` sẽ để lại một dải trống. Hãy kiểm tra ở wrapper, không chỉ ở nội dung.
2. **Quá nhiều slot.** Một layout mười hai slot vẫn là prop soup, chỉ khác là chứa JSX thay vì string. Nếu cứ phải thêm vùng mới, có lẽ component nên được tách ra.
3. **Di chuyển slot giữa các vị trí.** Nếu layout responsive render `center` trong toolbar ở desktop và trong menu ở mobile bằng hai nhánh JSX khác nhau, React thấy vị trí trong cây đã đổi và mount lại, mất luôn state bên trong như giá trị của input. Ưu tiên dùng CSS để di chuyển, hoặc giữ nó ở cùng vị trí trong cây.
4. **Tìm slot theo type.** `children.find((child) => child.type === Header)` dễ vỡ và khó type. Dùng named props.
5. **Để layout rò ra slot.** Nếu nơi dùng nào cũng phải thêm `className="p-3"` vào nội dung slot, thì padding đó thuộc về component chứ không thuộc về slot.

## Bài tập

1. **Toolbar responsive.** Làm `Toolbar` với ba slot `start`, `center`, `end`. Ở màn nhỏ, chuyển nội dung `center` vào một overflow menu. Làm trang demo với ít nhất hai toolbar khác nhau.
2. **Hệ thống toast dùng slot template.** Mỗi toast nhận các slot `icon`, `message`, `action`. Cung cấp cách đăng ký template (`success`, `error`, `info`) và một hàm `showToast(template, slots)` để render bằng code.
3. **Refactor một modal nhiều props.** Lấy một `Modal` có các prop như `title`, `subtitle`, `confirmText`, `cancelText`, `hideFooter`, `danger` và chuyển thành các slot `title`, `children`, `footer`. Đếm xem bỏ được bao nhiêu props.
4. **Kết hợp slot và render prop.** Làm `DataList<T>` có slot `empty` (`ReactNode`) và function prop `renderItem`. Giải thích trong một câu vì sao cái này là slot còn cái kia thì không.

## Video và source code

- Video: [React Slot Pattern Explained: The Cleanest Way to Build Flexible Components](https://youtu.be/_LBgDy0j-Os)
- Source code: [day-12 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-12)

Chương này dựa trên Day 12 trong series "15 Days of React Design Patterns" của tapaScript (Tapas Adhikary), được mình viết lại bằng TypeScript và cập nhật cho React 19.
