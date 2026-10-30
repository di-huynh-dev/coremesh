---
title: "Controlled and Uncontrolled Components: ai nắm giá trị của input"
description: "Quyết định ai sở hữu giá trị của input, React state hay DOM, chọn một nguồn sự thật cho mỗi form, và xem form Actions của React 19 thay đổi lựa chọn này ra sao."
order: 3
---

Input nào trên trang cũng đang giữ một giá trị. Câu hỏi chương này trả lời là: ai là nguồn sự thật (source of truth) của giá trị đó? Hoặc React state nắm nó và DOM chỉ hiển thị (controlled), hoặc DOM nắm nó và React đọc ra khi cần (uncontrolled). Cả hai đều hợp lệ. Bug xuất hiện khi trộn hai kiểu một cách tuỳ tiện trong cùng một form.

## Vấn đề: một form, hai nguồn sự thật

Đây là một form feedback mà mình đã gặp đủ các biến thể. Tên và email giữ trong state. Ô message, do một người khác thêm vào sau, thì đọc qua ref.

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

Nó chạy, nhưng hãy nhìn cái giá phải trả. Muốn reset form phải dùng hai cơ chế khác nhau: `setName("")` cho vài field và `messageRef.current.value = ""` cho field còn lại. Muốn hiện số ký tự của message theo thời gian thực thì phải chuyển đổi nó trước. Validation báo lỗi theo hai kiểu: `alert` cho hai field, focus cho field thứ ba. Và ai đọc code cũng phải dò từng field xem giá trị thật sự nằm ở đâu. Form này không sai, nó thiếu nhất quán, và chính sự thiếu nhất quán làm cho lần sửa tiếp theo trở nên rủi ro.

## Pattern: mỗi form chọn một chủ sở hữu

Trước khi refactor, cần hiểu cho chính xác hai công cụ.

### State và ref

`useState` giữ một giá trị React theo dõi. Đổi nó thì component re-render, nên UI luôn phản ánh đúng giá trị. `useRef` giữ một object mutable mà `.current` tồn tại qua các lần render, nhưng đổi nó không làm gì re-render cả.

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

Bấm "Increment ref" năm lần, màn hình không đổi gì. Bấm "Increment state" một lần, ref count nhảy lên 5, vì lần re-render đó cuối cùng mới đọc tới nó. Toàn bộ khác biệt nằm ở đây: state dành cho giá trị UI hiển thị, ref dành cho giá trị UI không cần phản ứng theo, và cho các handle tới DOM node (focus, scroll, đo kích thước).

Với nền tảng đó, hai pattern là:

- **Controlled component**: `value` của input lấy từ state, và `onChange` cập nhật state đó. React là nguồn sự thật duy nhất. Bạn có ngay validation tức thì, UI dẫn xuất (bộ đếm, nút disabled) và reset bằng code.
- **Uncontrolled component**: input tự giữ giá trị trong DOM. Bạn đặt giá trị ban đầu bằng `defaultValue` và đọc giá trị hiện tại khi cần, qua ref hoặc qua `FormData` lúc submit. Ít code hơn, ít re-render hơn, nhưng giữa các lần đọc thì React không "biết" giá trị là gì.

### Refactor 1: controlled hoàn toàn

Một object state giữ cả form. Ref vẫn được dùng, nhưng chỉ cho đúng việc ref giỏi: chuyển focus.

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

Để ý những gì đã trở nên dễ: bộ đếm ký tự và nút disabled mỗi thứ một dòng, validation là một hàm pure có thể unit test, còn reset chỉ là `setFeedback(emptyFeedback)`. Thuộc tính `name` trên mỗi field kiêm luôn vai trò key trong object state, nên một `handleChange` phục vụ được mọi input.

### Refactor 2: uncontrolled hoàn toàn

Giờ đi theo hướng ngược lại. Không có state nào cho giá trị; DOM giữ chúng và mình đọc ra lúc submit.

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

Bạn có thể đi thêm một bước, bỏ luôn ref, để API `FormData` của trình duyệt gom giá trị theo `name`:

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

Bản này không re-render lần nào khi người dùng gõ, và validation có sẵn của trình duyệt (`required`, `type="email"`) lo các kiểm tra đơn giản. Với form đăng nhập hay đăng ký nhận tin, thường chừng đó là đủ.

## Ví dụ thứ hai: component hỗ trợ cả hai chế độ

Pattern này còn quan trọng hơn khi bạn viết component dùng chung. Input gốc của trình duyệt cho nơi gọi tự chọn: truyền `value` thì là controlled, truyền `defaultValue` thì là uncontrolled. Component tốt trong design system cũng làm y vậy. Đây là một bộ tăng giảm số lượng chạy được cả hai kiểu.

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

Stepper đầu tiên tự quản lý chính nó. Stepper thứ hai do component cha điều khiển, cha có thể giới hạn giá trị, đồng bộ với store giỏ hàng, hay tính tạm tính. Các thư viện như Radix UI và Ant Design theo đúng quy ước `value` / `defaultValue` / `onChange` này, nên rất đáng học cách tự xây. Một quy tắc: component không nên chuyển qua lại giữa controlled và uncontrolled trong suốt vòng đời của nó; React cảnh báo chuyện này với input gốc là có lý do.

## Năm 2026 / React 19

React 19 đã đẩy mặc định của form khá rõ về phía uncontrolled.

- **Form Actions.** Bạn có thể truyền một hàm vào `<form action={...}>`. React gọi nó với `FormData` khi submit, bọc trong một transition, và khi action thành công thì tự reset các field uncontrolled. Không cần `preventDefault`, không cần ref.
- **`useActionState`** cho bạn kết quả lần chạy gần nhất của action (lỗi, thông báo thành công) và cờ `isPending`. Trả về giá trị đã submit từ action rồi dùng làm `defaultValue` để giữ lại những gì người dùng đã gõ khi validation thất bại.
- **`useFormStatus`** từ `react-dom` cho phép nút submit nằm sâu trong form đọc `pending` mà không cần prop drilling.

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

- **`ref` là prop bình thường.** Function component nhận `ref` trực tiếp, nên bọc một `TextField` tuỳ biến không còn cần `forwardRef`. Callback ref giờ cũng có thể trả về hàm cleanup.
- **Server Components.** Input controlled cần state, nên cần `"use client"`. Một form uncontrolled dùng Server Function làm action có thể render từ Server Component và vẫn hoạt động trước khi JavaScript tải xong.
- **Thư viện form.** React Hook Form về cốt lõi là uncontrolled và đăng ký input qua ref, đó là lý do nó vẫn nhanh với form rất lớn. Các thư viện như TanStack Form thì nghiêng về controlled. Hiểu pattern này giúp bạn biết mình đánh đổi gì khi chọn thư viện.

Input controlled vẫn là công cụ đúng cho phản hồi tức thì: tìm kiếm khi đang gõ, input có định dạng (tiền tệ, số điện thoại), các field phụ thuộc nhau, và bất cứ thứ gì UI phải phản ánh theo từng phím gõ.

## Khi nào dùng kiểu nào

Controlled hợp khi:

- UI phản ứng theo giá trị ngay lúc gõ (thông báo validation, bộ đếm, xem trước, bật tắt nút).
- Giá trị cần định dạng, mask, hoặc dẫn xuất từ field khác.
- Giá trị phải được set bằng code (reset về data từ server, "điền từ profile").

Uncontrolled hợp khi:

- Bạn chỉ cần giá trị lúc submit (đăng nhập, liên hệ, đăng ký nhận tin).
- Form lớn và re-render theo từng phím gõ gây chậm.
- Bạn dùng form Actions hoặc thư viện như React Hook Form.
- Bạn tích hợp widget không phải React tự quản lý DOM của nó (input file thì luôn là uncontrolled).

## Lỗi thường gặp

1. **Trộn hai chế độ trong một form**, như ví dụ ban đầu. Mỗi form chọn một chủ sở hữu, và chỉ dùng ref bên cạnh state controlled cho các việc mệnh lệnh như focus.
2. **Một input đổi chế độ giữa chừng.** `value={user?.name}` lúc đầu là `undefined` (uncontrolled) rồi thành string (controlled), và React cảnh báo. Hãy dùng `value={user?.name ?? ""}`.
3. **Set `value` mà không có `onChange`.** Input thành chỉ đọc. Dùng `defaultValue` nếu bạn chỉ muốn giá trị ban đầu, hoặc thêm `readOnly` nếu đúng là ý đó.
4. **Mong đổi ref thì UI cập nhật.** Ghi vào `ref.current` không bao giờ gây re-render. Nếu màn hình cần hiển thị nó, nó thuộc về state.
5. **Mong `defaultValue` chạy theo props.** Nó chỉ được đọc lúc mount. Muốn nạp lại form uncontrolled với data mới, hãy đổi `key` của nó.

## Bài tập

1. Làm form liên hệ (tên, email, tiêu đề, nội dung) theo ba cách: controlled, uncontrolled dùng ref, và uncontrolled dùng `FormData` không cần ref.
2. Viết một bảng so sánh ngắn bằng Markdown cho ba phiên bản: phong cách code, validation, reset, độ dễ đọc và độ phức tạp.
3. Làm lại form liên hệ bằng `<form action>` và `useActionState` của React 19, giữ lại giá trị đã gõ khi validation phía server thất bại.
4. Biến `QuantityStepper` thành một `TagInput` hỗ trợ cả `value` lẫn `defaultValue`, rồi kiểm tra cả hai chế độ trong một trang demo nhỏ.

## Video và source code

Chương này được viết lại từ Day 02 trong series "15 Days of React Design Patterns" của tapaScript (Tapas Adhikary), nơi anh giải thích state và ref cùng màn refactor form feedback trên video.

- Video: [React Design Patterns || Controlled & Uncontrolled Forms](https://youtu.be/jPMCouXondI)
- Source code: [github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-02](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-02)
