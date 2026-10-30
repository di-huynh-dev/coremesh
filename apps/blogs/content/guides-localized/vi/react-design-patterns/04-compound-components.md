---
title: "Compound Components: thoát khỏi prop soup"
description: "Thay prop soup bằng một họ component chia sẻ state qua context như Modal.Header hay Accordion.Item, và dùng an toàn với React 19 lẫn RSC."
order: 4
---

Có những mảnh UI không phải một component mà là cả một gia đình nhỏ: modal có header, body và footer; tabs có danh sách, trigger và panel; accordion có các item đóng mở. Cách làm ngây thơ là viết một component to được cấu hình bằng props. Compound Components thì xây chúng theo cách HTML xây `<select>` và `<option>`: nhiều component chỉ có nghĩa khi đi cùng nhau và chia sẻ state ở phía sau.

## Vấn đề: prop soup

Đây là một modal khởi đầu rất đơn giản rồi lớn dần lên, mỗi lần thêm một prop.

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

Mỗi yêu cầu design mới lại thêm một prop. Muốn header có badge cạnh tiêu đề? Thêm prop. Muốn footer có hai hàng? Thêm prop. Muốn trên mobile body nằm trước header? Không được, thứ tự đã bị code cứng. Component đã biến thành một ngôn ngữ cấu hình với ngữ pháp riêng không ai viết tài liệu, và nơi gọi nào cũng phải gánh mọi tuỳ chọn, kể cả những cái nó không bao giờ dùng.

Đó là "prop soup": component cha quyết định cấu trúc, nơi gọi chỉ được bật tắt cờ. Càng nhiều nơi gọi càng tệ, vì nơi nào cũng muốn một biến thể nho nhỏ và cách duy nhất để thêm là thêm prop.

## Pattern: để nơi gọi tự ghép cấu trúc

Compound components đảo ngược quyền điều khiển. Component cha cung cấp state và hành vi dùng chung. Các component con render từng mảnh. Nơi gọi sắp xếp các mảnh trong JSX theo ý mình:

```tsx
<Modal isOpen={isOpen} onClose={close}>
  <Modal.Header>...</Modal.Header>
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>...</Modal.Footer>
</Modal>
```

Có hai nguyên liệu: `children` để tự do bố cục, và context để chia sẻ state giữa cha và những component con nào cần tới.

### Bước 1: các subcomponent về cấu trúc

Bản đơn giản nhất chỉ dùng `children`. Mỗi subcomponent là một lớp bọc có style.

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

Chỉ vậy thôi là header có badge, footer hai hàng hay thứ tự tuỳ biến đều có sẵn: nơi gọi viết JSX gì mình cần vào trong từng mảnh.

### Bước 2: chia sẻ state bằng context

Nút đóng nằm trong header cần `onClose`, nhưng mình không muốn nơi gọi phải truyền lại lần nữa. Root đặt nó vào context; mảnh nào cũng đọc được.

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

Đoạn kiểm tra này biến một lỗi `undefined` khó hiểu thành thông báo rõ ràng khi ai đó render `Modal.Close` bên ngoài modal.

### Bước 3: root và các mảnh gắn kèm

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

`Object.assign` cho TypeScript kiểu chính xác của `Modal.Header` và các mảnh còn lại mà không phải tự khai báo interface. Để ý thêm cái lợi về accessibility: `Modal.Title` tự nối `aria-labelledby`, điều mà bản dùng props cũ chưa từng làm.

### Bước 4: sử dụng

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

Không còn `showCloseButton`, `hideFooter` hay `footerAlign`. Muốn có nút đóng thì render nó, muốn ẩn footer thì đừng render, muốn căn lề thì thêm class.

## Ví dụ thứ hai: accordion có state dùng chung

Modal chủ yếu chia sẻ callback. Accordion cho thấy dạng mạnh hơn của pattern, khi component cha sở hữu state để điều phối các component anh em. Bản đơn giản cho mỗi item tự giữ `isOpen` cũng chạy, nhưng không diễn đạt được "mỗi lúc chỉ mở một item". Đưa state đó lên root là giải quyết được.

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

Ở đây có hai tầng context: root chia sẻ "những item nào đang mở", mỗi item chia sẻ "mình là ai". Trigger và panel không nhận prop nào về state mà vẫn khớp với nhau. Chuyển sang cho mở nhiều item chỉ là một prop trên root, và nơi gọi có thể đặt icon, badge hay subtitle vào bất kỳ trigger nào mà accordion không cần biết.

## Năm 2026 / React 19

Compound components giờ còn phổ biến hơn cả lúc pattern này được đặt tên. Các thư viện headless như Radix UI, React Aria, Base UI và Ark UI đều xây trên nó, và shadcn/ui copy thẳng API compound của Radix vào codebase của bạn. Cách viết thì có vài thay đổi:

- **`<Context value>` thay cho `<Context.Provider>`.** Từ React 19, object context có thể render trực tiếp như một provider, như các ví dụ ở trên. `Context.Provider` vẫn chạy nhưng đang trên đường bị loại bỏ.
- **`use(Context)`.** API `use` đọc context giống `useContext`, và khác với hook, nó gọi được trong điều kiện. Với pattern này dùng cái nào cũng được.
- **Ưu tiên context thay vì `React.Children` và `cloneElement`.** Các cách cài đặt cũ duyệt qua `children` rồi chèn props bằng `cloneElement`. Cách đó vỡ ngay khi nơi gọi bọc một mảnh trong `<div>` hay một component tuỳ biến. Tài liệu React xếp cả hai API này vào nhóm legacy. Context thì hoạt động ở mọi độ sâu.
- **Ranh giới Server Components.** Mảnh nào dùng state hay context đều cần `"use client"`, thường nghĩa là cả gia đình nằm trong một module client. Ngoài ra, RSC không hỗ trợ "chấm" vào một client component từ Server Component (`<Modal.Header>` khi `Modal` được import vào file server), vì chỉ những tên được export mới đi qua ranh giới. Các thư viện như Radix né chuyện này bằng cách export từng mảnh theo tên (`Root`, `Trigger`, `Content`). Nếu compound component của bạn phải dùng từ Server Components, hãy export các mảnh theo tên (`ModalRoot`, `ModalHeader`), kèm theo hoặc thay cho các thuộc tính gắn kèm.
- **Tính năng có sẵn của nền tảng.** Với modal, thẻ `<dialog>` cùng `showModal()` giờ tự làm phần còn lại của trang thành inert, đóng khi bấm Escape và render ở top layer, hoàn toàn miễn phí. Một `Modal` compound xây trên `<dialog>` ít code hơn nhiều so với xây trên div.
- **React Compiler** có thể tự memoize object value của context, nên lời khuyên cũ là tự bọc nó trong `useMemo` gần như không còn cần.

## Khi nào nên dùng, khi nào không

Nên dùng khi:

- Component có nhiều vùng liên quan mà nơi gọi muốn sắp xếp hay tuỳ biến.
- Các component anh em phải phối hợp state (tabs và panel, các item của accordion, menu item và focus bàn phím).
- Bạn đang xây design system hay thư viện dùng chung cho nhiều team.

Bỏ qua khi:

- Component có một layout cố định và hai ba props. Một `<Badge tone="success">` đơn giản không cần `Badge.Icon`.
- Nơi gọi không được phép đổi cấu trúc, ví dụ một banner xin đồng ý bắt buộc theo quy định pháp lý.
- Bạn cần dùng nó trực tiếp từ Server Components và không muốn quản lý các named export.

## Lỗi thường gặp

1. **Quên kiểm tra context.** Không có thông báo lỗi rõ ràng, một mảnh render ngoài root sẽ crash với "cannot read properties of null", ở chỗ cách xa lỗi thật.
2. **Dựa vào thứ tự hay kiểu của children.** Code kiểu `children.find((child) => child.type === ModalHeader)` vỡ khi gặp wrapper, fragment hay component đã memo. Hãy dùng context và để mỗi mảnh tự render.
3. **Một context khổng lồ cho mọi thứ.** Nếu root chia sẻ các giá trị đổi liên tục (vị trí hover, nội dung đang gõ) cho mọi mảnh, tất cả sẽ re-render cùng nhau. Tách context theo tần suất thay đổi.
4. **Không có chế độ controlled.** App thật cần mở một item accordion theo URL hay đóng modal sau khi lưu. Hãy cho root nhận `value` / `defaultValue` / `onValueChange`, như chương trước.
5. **Lồng quá sâu.** Năm tầng `Card.Header.Title.Icon` là dấu hiệu gia đình bị chia quá vụn. Chỉ giữ những mảnh mà nơi gọi thật sự tuỳ biến.

## Bài tập

1. Làm một `Card` với `Card.Header`, `Card.Body` và `Card.Footer`.
2. Thêm `Card.Image` và dùng nó trong ba layout (ảnh trên, ảnh bên cạnh, ảnh ở footer). So sánh JSX với một `Card` duy nhất nhận mười props.
3. Làm `Tabs` với `Tabs.List`, `Tabs.Trigger` và `Tabs.Panel`, chia sẻ tab đang active qua context. Thêm điều hướng bằng phím mũi tên giữa các trigger.
4. Cho `Accordion` một chế độ controlled (`value` và `onValueChange`) để item đang mở đồng bộ được với hash trên URL.
5. Làm lại `Modal` trên thẻ `<dialog>` gốc và bỏ phần tự xử lý click backdrop và phím Escape ở những chỗ trình duyệt đã làm thay bạn.

## Video và source code

Chương này được viết lại từ Day 03 trong series "15 Days of React Design Patterns" của tapaScript (Tapas Adhikary); video đi từng bước qua cái modal prop soup và accordion.

- Video: [React Compound Components Pattern Explained (Build Flexible UI Without Prop Soup)](https://youtu.be/LglWulOqh6k)
- Source code: [github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-03](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-03)
