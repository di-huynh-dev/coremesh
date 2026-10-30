---
title: "Strategy Pattern: hoán đổi hành vi"
description: "Gom các cách làm có thể thay thế nhau, như phương thức đăng nhập hay định dạng export, sau một contract để component không phải rẽ nhánh theo type nữa."
order: 14
---

## Vấn đề: một hook gánh mọi kiểu đăng nhập

Thử hình dung một app ban đầu chỉ có đăng nhập bằng email và mật khẩu. Rồi bên sales ký được một khách hàng enterprise cần SSO. Rồi user mobile xin thêm đăng nhập bằng mã OTP. Mỗi kiểu mới đều rơi vào cùng một chỗ, vì "logic auth thì để trong `useAuth`":

```tsx
import { useState } from "react";

type LoginType = "password" | "otp" | "sso";

export function useAuth(loginType: LoginType) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(identifier: string, secret?: string) {
    setIsPending(true);
    setError(null);
    try {
      if (loginType === "password") {
        const response = await fetch("/api/login", {
          method: "POST",
          body: JSON.stringify({ email: identifier, password: secret }),
        });
        if (!response.ok) throw new Error("Sai email hoặc mật khẩu");
      } else if (loginType === "otp") {
        if (!secret) {
          await fetch("/api/otp/send", { method: "POST", body: JSON.stringify({ phone: identifier }) });
          return;
        }
        const response = await fetch("/api/otp/verify", {
          method: "POST",
          body: JSON.stringify({ phone: identifier, code: secret }),
        });
        if (!response.ok) throw new Error("Mã không hợp lệ");
      } else if (loginType === "sso") {
        window.location.assign(`/api/sso/start?domain=${identifier.split("@")[1]}`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Đăng nhập thất bại");
    } finally {
      setIsPending(false);
    }
  }

  return { login, isPending, error };
}
```

Nó chạy được, và cái bẫy nằm ở đó. Mỗi kiểu đăng nhập mới lại làm chuỗi `if/else` dài thêm. Sửa một bug ở nhánh OTP nghĩa là đụng vào một hàm đang xử lý cả redirect SSO, nên người review phải đọc cả ba nhánh. Không test riêng OTP được, cũng không thể chỉ ship code SSO cho tenant enterprise vì nó đã dính chặt vào cùng một hàm. Day 13 của repo bắt đầu đúng từ hình dạng này: một `useAuth` switch theo `loginType` với các nhánh OTP, SSO và magic link.

Mùi này có tên khá đơn giản: **hành vi được chọn bằng điều kiện rải rác khắp code**. Cùng một cái switch thường xuất hiện lại ở nút login, ở luồng logout, ở màn "quên mật khẩu".

## Pattern: một contract, nhiều cách triển khai thay thế được

Strategy pattern đến từ cuốn sách kinh điển của Gang of Four. Nói đơn giản:

1. Định nghĩa **cần làm gì** bằng một contract (interface).
2. Viết mỗi **cách làm** thành một implementation riêng của contract đó (một strategy).
3. Chọn một strategy lúc runtime rồi đưa cho đoạn code cần nó. Đoạn code đó chỉ nói chuyện với contract.

Component render nút đăng nhập không cần quan tâm đăng nhập diễn ra thế nào. Nó cần `login()`, `isPending` và `error`. Mọi thứ khác là chi tiết của strategy.

### Bước 1: viết contract

```tsx
export type LoginMethod = "password" | "otp" | "sso";

export type AuthStrategy = {
  method: LoginMethod;
  label: string;
  needsSecret: boolean;
  login: (identifier: string, secret?: string) => Promise<void>;
};
```

Contract là một object type thuần, không có React bên trong. Đây là chủ ý, mình sẽ giải thích ở phần React 19.

### Bước 2: mỗi strategy một chỗ

```tsx
import type { AuthStrategy } from "./types";

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error((await response.text()) || "Request failed");
}

export const passwordStrategy: AuthStrategy = {
  method: "password",
  label: "Email và mật khẩu",
  needsSecret: true,
  login: (email, password) => postJson("/api/login", { email, password }),
};

export const otpStrategy: AuthStrategy = {
  method: "otp",
  label: "Mã OTP",
  needsSecret: true,
  login: async (phone, code) => {
    if (!code) return postJson("/api/otp/send", { phone });
    return postJson("/api/otp/verify", { phone, code });
  },
};

export const ssoStrategy: AuthStrategy = {
  method: "sso",
  label: "SSO công ty",
  needsSecret: false,
  login: async (email) => {
    const domain = email.split("@")[1] ?? "";
    window.location.assign(`/api/sso/start?domain=${encodeURIComponent(domain)}`);
  },
};
```

Mỗi strategy unit test được bằng một `fetch` giả, không cần render gì cả. Thêm đăng nhập bằng magic link là thêm một object, không phải thêm một nhánh.

### Bước 3: registry thay cho `if/else`

```tsx
import type { AuthStrategy, LoginMethod } from "./types";
import { otpStrategy, passwordStrategy, ssoStrategy } from "./strategies";

export const authStrategies = {
  password: passwordStrategy,
  otp: otpStrategy,
  sso: ssoStrategy,
} satisfies Record<LoginMethod, AuthStrategy>;
```

`satisfies Record<LoginMethod, AuthStrategy>` là lưới an toàn của TypeScript: nếu ai đó thêm `"magic"` vào `LoginMethod` mà quên đăng ký, build sẽ fail. Phép tra `authStrategies[method]` thay thế cho toàn bộ chuỗi điều kiện.

### Bước 4: chọn một lần ở gốc, bằng Context

Thường thì strategy được quyết định bởi cấu hình: tenant, biến môi trường, feature flag. Mình chọn nó một lần trong provider:

```tsx
import { createContext, use, useState, useTransition, type ReactNode } from "react";
import { authStrategies } from "./registry";
import type { AuthStrategy, LoginMethod } from "./types";

const AuthStrategyContext = createContext<AuthStrategy | null>(null);

export function AuthProvider({ method, children }: { method: LoginMethod; children: ReactNode }) {
  return <AuthStrategyContext value={authStrategies[method]}>{children}</AuthStrategyContext>;
}

export function useAuth() {
  const strategy = use(AuthStrategyContext);
  if (!strategy) throw new Error("useAuth must be used inside <AuthProvider>");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function login(identifier: string, secret?: string) {
    startTransition(async () => {
      setError(null);
      try {
        await strategy.login(identifier, secret);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Đăng nhập thất bại");
      }
    });
  }

  return { label: strategy.label, needsSecret: strategy.needsSecret, login, isPending, error };
}
```

State của React (pending, error) nằm trong một hook bình thường. Thuật toán nằm trong strategy. Component trở nên nhàm chán, theo nghĩa tốt nhất:

```tsx
import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";

export function LoginForm() {
  const { label, needsSecret, login, isPending, error } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [secret, setSecret] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        login(identifier, needsSecret ? secret : undefined);
      }}
    >
      <h2>{label}</h2>
      <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
      {needsSecret && (
        <input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} />
      )}
      <button disabled={isPending}>{isPending ? "Đang đăng nhập..." : "Đăng nhập"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

```tsx
<AuthProvider method={tenant.loginMethod}>
  <LoginForm />
</AuthProvider>
```

Chuyển cả app từ mật khẩu sang SSO giờ chỉ là đổi một chữ ở gốc. Không component nào phải sửa.

### Biến thể trong video: hook factory

Repo cài đặt strategy bằng hook thay vì object: `useOtpAuth` và `useSsoAuth`, một map `{ otp: useOtpAuth, sso: useSsoAuth }`, và hàm factory `createAuthHook(type)`. Component sẽ làm như sau:

```tsx
function LoginButton({ loginType }: { loginType: "otp" | "sso" }) {
  const useSelectedAuth = createAuthHook(loginType);
  const auth = useSelectedAuth();
  return <button onClick={auth.login}>Login</button>;
}
```

Bản dùng provider thì truyền chính cái hook đã chọn qua Context, component con lấy ra rồi gọi. Cách này giúp nhìn pattern rất rõ, và chạy ổn miễn là `loginType` không đổi trong lúc component còn mount. Nếu nó đổi, React đột nhiên thấy một hook khác, có thể với số lần gọi `useState` khác, và Rules of Hooks bị phá. Nếu dùng biến thể này, ít nhất hãy mount lại khi đổi bằng `<LoginButton key={loginType} loginType={loginType} />`. Nhưng đọc phần tiếp theo trước khi chọn nó.

## Ví dụ thứ hai: các định dạng export

Strategy không chỉ dành cho auth. Một trường hợp rất hay gặp ở dashboard admin là "export bảng này ra file". CSV thì dễ, Excel cần một thư viện nặng, PDF cần thêm một thư viện khác. Không có pattern, bạn sẽ có một `switch (format)` trong click handler, và thư viện của mọi định dạng đều nằm trong bundle chính.

```tsx
import type { OrderRow } from "./types";

export type ExportFormat = "csv" | "xlsx" | "pdf";

export type ExportStrategy = {
  label: string;
  extension: string;
  toBlob: (rows: OrderRow[]) => Promise<Blob>;
};

function toCsv(rows: OrderRow[]) {
  const header = "id,customer,total,status";
  const lines = rows.map((row) => [row.id, row.customer, row.total, row.status].join(","));
  return [header, ...lines].join("\n");
}

export const exportStrategies = {
  csv: {
    label: "CSV",
    extension: "csv",
    toBlob: async (rows) => new Blob([toCsv(rows)], { type: "text/csv" }),
  },
  xlsx: {
    label: "Excel",
    extension: "xlsx",
    toBlob: async (rows) => {
      const { buildWorkbook } = await import("./exporters/xlsx");
      return buildWorkbook(rows);
    },
  },
  pdf: {
    label: "PDF",
    extension: "pdf",
    toBlob: async (rows) => {
      const { buildPdf } = await import("./exporters/pdf");
      return buildPdf(rows);
    },
  },
} satisfies Record<ExportFormat, ExportStrategy>;
```

```tsx
import { useTransition } from "react";
import { exportStrategies, type ExportFormat } from "./exportStrategies";
import type { OrderRow } from "./types";

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportMenu({ rows }: { rows: OrderRow[] }) {
  const [isExporting, startTransition] = useTransition();

  function handleExport(format: ExportFormat) {
    const strategy = exportStrategies[format];
    startTransition(async () => {
      const blob = await strategy.toBlob(rows);
      downloadBlob(blob, `orders.${strategy.extension}`);
    });
  }

  return (
    <div role="menu" aria-busy={isExporting}>
      {(Object.keys(exportStrategies) as ExportFormat[]).map((format) => (
        <button key={format} role="menuitem" disabled={isExporting} onClick={() => handleExport(format)}>
          Export {exportStrategies[format].label}
        </button>
      ))}
    </div>
  );
}
```

Có hai cái lợi đi kèm miễn phí. Menu tự render từ registry, nên định dạng mới tự xuất hiện. Và vì mỗi strategy tự load thư viện bằng `import()`, user chỉ export CSV sẽ không bao giờ phải tải code Excel.

## Năm 2026 / React 19

**Đừng truyền hook như một giá trị.** react.dev có hẳn một quy tắc cho chuyện này, "Never pass around Hooks as regular values", kèm quy tắc con "Don't dynamically use Hooks". Lý do họ đưa ra: hook dùng kiểu động làm mất khả năng đọc hiểu cục bộ, dễ phá Rules of Hooks, và React Compiler sẽ không tối ưu những component làm vậy. Biến thể hook factory và "để hook trong Context" rơi đúng vào trường hợp này. Dùng để học thì không sao, nhưng với code mới mình để object hoặc function thuần trong strategy, và giữ một hook được gọi tĩnh (`useAuth`) nắm phần state của React. Cách này cũng gần với Strategy pattern gốc hơn, nơi strategy chỉ là object implement một interface.

**Nếu strategy cần thứ gì đó từ React**, như router hay query client, hãy inject vào. Cho strategy thêm tham số (`login(identifier, secret, { navigate })`) hoặc biến registry thành factory (`createAuthStrategies({ navigate })`) và gọi nó bên trong hook. Strategy vẫn test được, lời gọi hook vẫn tĩnh.

**Context dùng trực tiếp làm provider.** Ở React 19 bạn render thẳng `<AuthStrategyContext value={...}>`, `.Provider` vẫn chạy nhưng không còn cần nữa. Đọc context bằng `use(Context)` cũng được, và khác với `useContext`, `use` gọi được trong câu điều kiện.

**Actions rất hợp với strategy.** `useTransition` nhận async function từ React 19, nên `isPending` do React quản lý thay vì một cờ tự set. Nếu login là một `<form action>`, `useActionState` có thể bọc `strategy.login` và trả về cả pending lẫn kết quả gần nhất trong một lần gọi.

**Ranh giới Server Components.** Strategy chứa function không thể truyền từ Server Component xuống Client Component qua props, vì function không serialize được (trừ Server Functions). Hãy truyền key: server quyết định `method="sso"` dựa trên tenant, client tự tra `authStrategies[method]`. Provider và `useAuth` nằm trong file có `"use client"`.

## Khi nào nên dùng, khi nào không

Nên dùng Strategy khi:

- Cùng một thao tác có nhiều cách triển khai thay thế được cho nhau (đăng nhập, thanh toán, export, quy tắc tính giá, nguồn dữ liệu).
- Lựa chọn phụ thuộc vào cấu hình, môi trường, tenant hoặc input của user.
- Bạn cứ gặp lại cùng một cái `switch` theo "type" ở nhiều file.
- Bạn muốn load một số implementation theo kiểu lazy.

Bỏ qua khi:

- Chỉ có hai nhánh và chưa thấy dấu hiệu của nhánh thứ ba. Một câu `if` dễ đọc hơn một registry.
- Các "strategy" không thật sự chung một contract. Ép những hình dạng khác nhau vào một interface sẽ sinh ra field optional khắp nơi.
- Khác biệt chỉ nằm ở giao diện. Thường đó là việc của prop hoặc slot, không phải strategy.

## Những lỗi hay gặp

1. **Contract bị rò.** Nếu component vẫn phải kiểm tra `if (strategy.method === "sso")`, abstraction đã thất bại. Đưa điểm khác biệt vào contract (như `needsSecret`) hoặc vào trong strategy.
2. **Đổi hook giữa các lần render.** Với biến thể hook factory, prop đổi là hook đổi, thứ tự hook vỡ. Dùng strategy dạng object, hoặc mount lại bằng `key`.
3. **Quên đăng ký strategy.** Không có `satisfies Record<...>` hay exhaustive check thì member mới của union vẫn compile bình thường, rồi crash lúc runtime với `undefined is not a function`.
4. **Strategy tự lấy global state.** Strategy đọc thẳng từ store hay `window` rất khó test. Truyền thứ nó cần qua tham số.
5. **Trừu tượng hóa quá sớm.** Một strategy kèm interface, registry, provider cho đúng một implementation chỉ là thủ tục. Hãy đưa pattern vào khi implementation thật thứ hai xuất hiện.

## Bài tập

Chuyển thể từ task của repo: xây một lớp fetch dữ liệu ở tầng app, nơi danh sách user có thể đến từ REST API, GraphQL API hoặc JSON trong bộ nhớ, mà không phải sửa code component. Dữ liệu có thể mock.

1. Viết ba strategy `restUsers`, `graphqlUsers`, `inMemoryUsers`, mỗi cái có `fetchUsers(): Promise<User[]>` trả về cùng hình dạng `User`.
2. Đăng ký chúng với `satisfies Record<UserSource, UsersStrategy>`.
3. Tạo `UsersSourceProvider` chọn strategy từ `import.meta.env.VITE_USER_SOURCE`, và một hook duy nhất `useUsers()` trả về `{ users, isLoading, error }`.
4. Render `UserList` chỉ dùng `useUsers()`. Đổi biến môi trường và kiểm tra rằng không file component nào phải sửa.
5. Bài thêm: viết strategy `cachedUsers` bọc một strategy khác và cache kết quả trong 30 giây. Đây là strategy được ghép từ strategy.
6. Bài thêm: viết lại bản `createAuthHook` của repo thành strategy dạng object, rồi giải thích trong hai câu điều gì thay đổi với React Compiler.

## Video và source code

- Video: [One React Pattern That Makes Your App Instantly Scalable](https://youtu.be/tfZ85e9N8RA)
- Source code: [day-13 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-13)

Chương này dựa trên Day 13 trong series "15 Days of React Design Patterns" của tapaScript (Tapas Adhikary), được mình viết lại bằng TypeScript và cập nhật cho React 19.
