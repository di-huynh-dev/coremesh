---
title: "State Reducer: để người dùng component tự quyết luật đổi state"
description: "Cho phép bên dùng component thay đổi cách state chuyển trạng thái bằng reducer của riêng họ, thay vì thêm một prop cấu hình cho mỗi yêu cầu."
order: 10
---

## Vấn đề: mỗi trường hợp đặc biệt lại thêm một prop

Bạn viết một component `Toggle` nhỏ. Nó bật tắt qua lại và đếm số lần bấm. Ship lên, mọi người dùng thấy ổn, rồi các yêu cầu bắt đầu kéo tới:

- "Cho nó dừng lại sau ba lần bấm được không?"
- "Ở trang onboarding thì chỉ được bật, không được tắt lại."
- "Lúc form đang submit thì bỏ qua click nhé."

Yêu cầu nào cũng hợp lý, và câu trả lời dễ nhất là thêm prop:

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

Đây chính là "prop soup" mà mình đã gặp ở chương compound components, chỉ khác là lần này nó nằm ở phần logic chứ không phải markup. Mỗi luật mới lại chui vào trong component, các tổ hợp thì khó lường (`maxClicks` đi cùng `onlyTurnOn` thì nghĩa là gì?), và người viết `Toggle` trở thành nút cổ chai cho mọi quyết định sản phẩm. Component tự giữ state của nó, điều đó tốt; nhưng nó cũng ôm luôn mọi chính sách thay đổi state đó, và điều này thì không tốt.

## Pattern: component giữ state, bên dùng có thể giữ luật

State Reducer tách hai thứ mà đoạn code trên đang trộn lẫn:

1. **Cơ chế (mechanism)**: state nằm ở đâu, có những sự kiện nào (`toggle`, `reset`), UI phản ứng ra sao.
2. **Chính sách (policy)**: với state hiện tại và một sự kiện, state tiếp theo nên là gì.

Component giữ cơ chế. Chính sách là một hàm reducer `(state, action) => nextState`, component nhận nó qua prop và có sẵn một giá trị mặc định hợp lý. Ai hài lòng với mặc định thì không cần truyền gì. Ai có nhu cầu đặc biệt thì truyền reducer riêng và tự quyết.

Nói cách khác, đây là inversion of control áp dụng cho việc chuyển state. Thay vì component phải đoán trước mọi luật, nó trả quyền quyết định lại cho nơi gọi.

### Bước 1: mô tả state và action bằng type

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

Action có type rõ ràng là thứ khiến pattern này an toàn để public ra ngoài. Reducer của bên dùng có autocomplete cho `action.type`, và TypeScript sẽ báo nếu họ quên return state.

### Bước 2: viết reducer mặc định

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

Một chi tiết nhỏ nhưng có thật: demo gốc tăng bộ đếm bằng `state.clicks++`. Cách này mutate object state cũ, và vì là post-increment nên nó đưa giá trị cũ vào state mới, kết quả là bộ đếm không chạy như bạn nghĩ (lại còn chạy khác đi trong Strict Mode, vì Strict Mode gọi reducer hai lần). Trong reducer, luôn tạo object mới từ `state.clicks + 1`.

### Bước 3: cho component nhận reducer

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

Gọi reducer một lần để tính `next` giúp `onToggle` báo đúng điều sẽ xảy ra. Bản trong repo gọi `onToggle(!on)` vô điều kiện, nên khi reducer tuỳ chỉnh chặn click, component cha vẫn được báo về một thay đổi không hề xảy ra.

### Bước 4: tuỳ chỉnh từ bên ngoài

Luật "dừng sau ba lần bấm" giờ nằm đúng chỗ của nó, ở trang cần nó:

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

Để ý là reducer tuỳ chỉnh chỉ xử lý đúng trường hợp nó quan tâm, phần còn lại giao cho `toggleReducer` được export sẵn. `customToggleReducer` trong repo viết lại toàn bộ switch; cách đó vẫn chạy, nhưng nghĩa là bản tuỳ chỉnh sẽ lặng lẽ bỏ sót mọi action mới mà component thêm sau này (ở đây là `reset`). Export reducer mặc định rồi compose lên trên là cách mình khuyên dùng.

Luật "chỉ được bật" cũng ngắn y như vậy:

```tsx
const onlyTurnOnReducer: ToggleReducer = (state, action) => {
  if (action.type === "toggle" && state.on) {
    return state;
  }
  return toggleReducer(state, action);
};
```

Không thêm prop nào cho `Toggle`. Component không đổi một dòng.

## Ví dụ thứ hai: form provider với validation cắm rút được

Demo thứ hai trong repo kết hợp State Reducer với Provider pattern ở chương trước. Một `FormProvider` giữ state của form bằng `useReducer`, chia sẻ qua context, và nhận prop `reducer` để mỗi form tự mang theo luật validate riêng.

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
        errors.email = "Email không hợp lệ";
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

Component chứa các field không biết gì về luật. Nó chỉ dispatch sự kiện và render lỗi mà reducer tạo ra:

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
      <input name="name" value={state.values.name} onChange={handleChange} placeholder="Tên của bạn" />
      <input name="email" value={state.values.email} onChange={handleChange} placeholder="Email của bạn" />
      {Object.entries(state.errors).map(([field, message]) => (
        <p key={field} role="alert">{message}</p>
      ))}
      <button type="button" onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
}
```

Một trang khắt khe hơn cắm chính sách của riêng nó vào, dùng lại reducer mặc định cho việc cập nhật field rồi thêm luật lên trên:

```tsx
import { defaultFormReducer, FormProvider, type FormReducer } from "./form";
import { ProfileFields } from "./ProfileFields";

const strictFormReducer: FormReducer = (state, action) => {
  const next = defaultFormReducer(state, action);
  if (action.type !== "changeField") return next;

  const errors = { ...next.errors };
  if (action.name === "name" && /\d/.test(action.value)) {
    errors.name = "Tên không được chứa số";
  }
  if (action.name === "email" && action.value && !action.value.endsWith(".com")) {
    errors.email = "Email phải kết thúc bằng .com";
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

Cùng provider, cùng field, hành vi khác nhau. Đây là kiểu mình hay dùng ở các màn hình admin, nơi nhiều form có chung bộ field nhưng mỗi nghiệp vụ lại có luật validate riêng.

## Năm 2026 / React 19

- **Pattern này vẫn sống khoẻ trong các thư viện headless.** Downshift là ví dụ kinh điển với prop `stateReducer`, còn TanStack Table và các thư viện tương tự đưa ra cùng ý tưởng qua controlled state và callback `on*Change`. Nếu bạn viết component headless hoặc component cho design system, đây vẫn là một trong những điểm mở rộng gọn gàng nhất có thể cung cấp.
- **React 19 làm phần provider ngắn hơn.** Bạn có thể render thẳng `<FormContext value={...}>` thay cho `<FormContext.Provider>`, và đọc bằng `use(FormContext)`; khác với `useContext`, `use` có thể gọi trong điều kiện.
- **React Compiler không làm thay đổi pattern.** Reducer chỉ là hàm thuần. Cái Compiler thay đổi là lời khuyên quanh việc memo object `{ state, dispatch }` truyền vào context: bật Compiler rồi thì không cần `useMemo` cho nó nữa.
- **Nó chạy ở client.** `useReducer` và context cần `"use client"`. Trong app dùng Server Components, provider nằm ở ranh giới client, còn reducer có thể là code dùng chung được provider import vào.
- **Biết thêm phương án khác: controlled props.** Đôi khi bên dùng muốn giữ toàn bộ state, chứ không chỉ có tiếng nói trong việc chuyển state. Lúc đó API controlled (`on` cộng `onChange`) đơn giản hơn. State Reducer nằm ở giữa "hoàn toàn uncontrolled" và "hoàn toàn controlled".

## Khi nào nên dùng, khi nào không

Nên dùng khi:

- một component tái sử dụng liên tục nhận yêu cầu tính năng mà thực chất là thay đổi chính sách;
- bạn đang viết thư viện hoặc component cho design system mà nhiều team khác dùng;
- state có nhiều action và luật chuyển giữa chúng khác nhau theo từng màn hình.

Không cần khi:

- component chỉ dùng ở một chỗ. Sửa code trực tiếp là xong;
- một prop boolean thật sự đủ cho nhu cầu;
- bên dùng thực ra muốn giữ state. Khi đó hãy làm component controlled.

## Những lỗi hay gặp

1. **Mutate state trong reducer.** `state.clicks++` hay `errors[name] = ...` trên object cũ làm hỏng cơ chế phát hiện thay đổi của React và khiến bug lúc có lúc không. Luôn return object mới.
2. **Thay thế thay vì compose.** Reducer tuỳ chỉnh chép lại toàn bộ switch sẽ lệch khỏi bản mặc định ngay khi component thêm action mới. Export reducer mặc định và gọi nó.
3. **Side effect trong reducer.** Gửi analytics, gọi API hay lưu `localStorage` trong reducer sẽ chạy hai lần ở Strict Mode và làm reducer không còn thuần. Đặt side effect trong event handler hoặc effect.
4. **Public quá nhiều loại action.** Mỗi action bạn public ra đều thành API. Giữ tập action nhỏ và ổn định, và coi việc đổi tên một action là breaking change.
5. **Báo những thay đổi không xảy ra.** Nếu gọi `onChange` trước khi kiểm tra kết quả của reducer, component cha sẽ nhận được những lần chuyển state mà reducer tuỳ chỉnh đã chặn.

## Bài tập

1. **Form wizard** (từ task của repo). Làm wizard nhiều bước với các action `next`, `prev`, `reset` và một reducer mặc định bên trong. Sau đó cho component cha truyền reducer tuỳ chỉnh: một cái chặn `next` khi bước hiện tại chưa điền xong, một cái tự động lưu dữ liệu khi `next` (việc lưu thật sự đặt ngoài reducer).
2. **Progress bar dùng chung** (từ task của repo). Đưa state của wizard vào một provider để `ProgressBar` và `StepTitle` ở hai nơi khác nhau trên trang đều đọc được.
3. **Sửa bug trong demo.** Lấy `toggleReducer` của repo, viết test bấm ba lần và kỳ vọng `clicks` bằng 3, xem nó fail, rồi sửa.
4. **Accordion có chính sách.** Làm `Accordion` với reducer mặc định cho phép mở nhiều panel. Viết reducer phía bên dùng chỉ cho mở một panel, và một reducer khác không cho đóng panel cuối cùng đang mở.

## Video và source code

- Video (Day 09): [React State Reducer Pattern Explained: Build Powerful & Reusable State Logic](https://youtu.be/vZswuz3NTgs)
- Source code: [day-09 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-09)

Chương này dựa trên Day 09 của series "15 Days of React Design Patterns" của tapaScript (Tapas Adhikary), phát hành theo giấy phép Apache-2.0; cảm ơn anh vì bài giảng và code demo gốc.
