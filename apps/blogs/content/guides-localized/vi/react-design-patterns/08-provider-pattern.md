---
title: "Provider Pattern: dừng prop drilling bằng context"
description: "Dừng prop drilling bằng cách đặt state dùng chung vào provider và đọc qua một hook có kiểu rõ ràng, dùng Context làm provider và use() của React 19."
order: 8
---

## Vấn đề: props đi qua những component chẳng quan tâm

Nút đổi theme nghe như tính năng đơn giản nhất trên đời. State nằm ở đỉnh app vì cả layout lẫn một cái nút nằm sâu trong navbar đều cần nó. Rồi bạn bắt đầu truyền xuống:

```tsx
import { useState, type ReactNode } from "react";

type Theme = "light" | "dark";

export function App() {
  const [theme, setTheme] = useState<Theme>("light");

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return (
    <Layout theme={theme} onToggleTheme={toggleTheme}>
      <Dashboard theme={theme} />
    </Layout>
  );
}

function Layout({ theme, onToggleTheme, children }: {
  theme: Theme;
  onToggleTheme: () => void;
  children: ReactNode;
}) {
  return (
    <div className={`layout layout--${theme}`}>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      {children}
    </div>
  );
}

function Navbar({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <nav className="navbar">
      <span className="navbar__logo">My App</span>
      <ThemeToggleButton theme={theme} onToggleTheme={onToggleTheme} />
    </nav>
  );
}

function ThemeToggleButton({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <button type="button" onClick={onToggleTheme}>
      {theme === "light" ? "Switch to dark" : "Switch to light"}
    </button>
  );
}
```

`Navbar` hoàn toàn không dùng `theme` hay `onToggleTheme`. Nó chỉ chuyển tiếp. Đây chính là **prop drilling**: các component ở giữa nhận props chỉ để truyền tiếp xuống dưới. Với một giá trị và ba tầng thì mới chỉ hơi phiền. Nhưng khi có theme, user hiện tại, ngôn ngữ, feature flag và cấu hình thương hiệu, mọi component ở giữa đều phình ra một danh sách props mà nó chẳng quan tâm, và muốn dời một component sang chỗ khác trong cây là phải nối dây lại toàn bộ.

Ở chương trước mình cũng đã thấy mặt còn lại của vấn đề: custom hook như `useAuth()` không chia sẻ state giữa các component. Hai component gọi nó sẽ có hai user riêng. Mình cần một cách để đặt một giá trị ở một chỗ, và cho bất kỳ component nào bên dưới đọc trực tiếp.

## Pattern: một provider, một context và một hook

Context của React là cơ chế. Provider pattern là cách mình đóng gói cơ chế đó để phần còn lại của app không cần biết đến nó:

- Một object **context**, "kênh" mà giá trị đi qua.
- Một **provider component** giữ state và đặt nó lên kênh.
- Một **custom hook** đọc từ kênh và báo lỗi rõ ràng nếu không có provider.

Các component chỉ nhìn thấy provider và hook.

### Bước 1: tạo context với kiểu trung thực

```tsx
import { createContext } from "react";

export type Theme = "light" | "dark";

export type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
```

Giá trị mặc định là `null`, và kiểu cũng nói rõ như vậy. Bạn có thể truyền một default giả như `{ theme: "light", toggleTheme: () => {} }`, nhưng khi đó nếu quên bọc provider, bạn sẽ có một cái nút bấm vào không có gì xảy ra mà cũng chẳng báo lỗi. Dùng `null` giúp mình phát hiện được lỗi đó.

### Bước 2: provider giữ state

```tsx
import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./ThemeContext";

type ThemeProviderProps = {
  initialTheme?: Theme;
  children: ReactNode;
};

export function ThemeProvider({ initialTheme = "light", children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}
```

Để ý `<ThemeContext value={...}>`. Từ React 19, chính object context có thể được render như provider. `<ThemeContext.Provider value={...}>` vẫn chạy và bạn sẽ còn gặp nó trong code cũ, nhưng dạng ngắn mới là cách được khuyến nghị từ giờ.

Effect đồng bộ theme lên thẻ `<html>` để CSS phản ứng theo `[data-theme="dark"]`. Đây là cách dùng effect hợp lệ: giữ cho một hệ thống bên ngoài (phần DOM nằm ngoài React) đồng bộ với state.

### Bước 3: hook là cửa vào duy nhất

```tsx
import { use } from "react";
import { ThemeContext } from "./ThemeContext";

export function useTheme() {
  const themeContext = use(ThemeContext);
  if (themeContext === null) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return themeContext;
}
```

`use` là API của React 19 để đọc context (hoặc promise). Với context, nó hoạt động giống `useContext`, chỉ khác một điểm: nó được phép gọi trong điều kiện và vòng lặp. Ở đây dùng cái nào cũng được. Hook thu hẹp kiểu từ `ThemeContextValue | null` về `ThemeContextValue`, nên nơi gọi không bao giờ phải xử lý `null`.

### Bước 4: bọc cây component và xóa phần drilling

```tsx
export function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </ThemeProvider>
  );
}

function Layout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <div className={`layout layout--${theme}`}>
      <Navbar />
      {children}
    </div>
  );
}

function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar__logo">My App</span>
      <ThemeToggleButton />
    </nav>
  );
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme === "light" ? "Switch to dark" : "Switch to light"}
    </button>
  );
}
```

`Navbar` quay về đúng vai trò của một navbar. Component nào cần theme thì tự hỏi, component nào không cần thì không bị đụng tới.

## Ví dụ thứ hai: nhiều provider, dữ liệu tải từ API, một điểm vào

App thật hiếm khi chỉ có một context. Repo kết hợp theme provider với một brand provider tải cấu hình thương hiệu (tên, màu) từ API. Đây là phiên bản có kiểu:

```tsx
import { createContext, use, useEffect, useState, type ReactNode } from "react";

export type Brand = { name: string; primaryColor: string; logoUrl: string };

type BrandContextValue = { brand: Brand | null; isLoading: boolean };

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ brandId, children }: { brandId: string; children: ReactNode }) {
  const [loadedBrand, setLoadedBrand] = useState<{ brandId: string; brand: Brand } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/brands/${brandId}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<Brand>)
      .then((brand) => setLoadedBrand({ brandId, brand }))
      .catch(() => undefined);

    return () => controller.abort();
  }, [brandId]);

  const brand = loadedBrand?.brandId === brandId ? loadedBrand.brand : null;

  return <BrandContext value={{ brand, isLoading: brand === null }}>{children}</BrandContext>;
}

export function useBrand() {
  const brandContext = use(BrandContext);
  if (brandContext === null) {
    throw new Error("useBrand must be used inside <BrandProvider>");
  }
  return brandContext;
}
```

Xếp chồng provider trong `main.tsx` sẽ rối rất nhanh, nên mình thích gom vào một component `AppProviders`, là nơi duy nhất lắp ráp toàn bộ context dùng chung của app:

```tsx
import type { ReactNode } from "react";
import { ThemeProvider } from "./theme/ThemeProvider";
import { BrandProvider } from "./brand/BrandProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <BrandProvider brandId="default">{children}</BrandProvider>
    </ThemeProvider>
  );
}
```

```tsx
function BrandedHeader() {
  const { brand, isLoading } = useBrand();
  const { theme } = useTheme();

  if (isLoading || brand === null) return <header className="header header--skeleton" />;

  return (
    <header className={`header header--${theme}`} style={{ borderColor: brand.primaryColor }}>
      <img src={brand.logoUrl} alt={brand.name} />
    </header>
  );
}
```

Thứ tự chỉ quan trọng khi provider này phụ thuộc provider kia. Nếu `BrandProvider` cần theme, nó phải được render bên trong `ThemeProvider` và tự gọi `useTheme()`.

## Provider pattern ở năm 2026 và React 19

Context giờ còn quan trọng hơn trước, và React 19 khiến nó dễ dùng hơn:

- **`<Context value>` làm provider**. Ngắn gọn hơn, và `Context.Provider` đã được lên kế hoạch deprecate ở phiên bản sau, nên code mới nên dùng dạng ngắn.
- **`use(Context)`** đọc context và, khác với `useContext`, có thể gọi có điều kiện, ví dụ sau một lệnh return sớm.
- **React Compiler** tự memo object `value` cho bạn. Không có compiler thì `value={{ theme, toggleTheme }}` là một object mới mỗi khi provider render, khiến mọi consumer re-render dù chẳng có gì thay đổi. Trường hợp đó hãy bọc nó bằng `useMemo` và các hàm bằng `useCallback`.
- **Server Components** không tạo được cũng không đọc được context. Provider giữ state phải nằm trong file có `"use client"`. Tin tốt là một provider dạng Client Component vẫn nhận được Server Component qua `children`. Với Next.js App Router, cách làm quen thuộc là một file client `providers.tsx` và một `layout.tsx` phía server render `<AppProviders>{children}</AppProviders>`. Các page bên dưới vẫn là Server Component; chỉ component nào gọi `useTheme()` mới cần là client.

Context là phương tiện vận chuyển, không phải công cụ quản lý state. Nó rất hợp cho giá trị ít thay đổi (theme, ngôn ngữ, user hiện tại, feature flag, inject dependency như API client) và cho state trong phạm vi một nhóm component (compound components ở chương 4). Còn với state thay đổi thường xuyên và được nhiều component đọc, mỗi lần cập nhật sẽ re-render mọi consumer của context đó, và React không có selector built-in để tránh. Lúc đó mình dùng Zustand, cho phép mỗi component chỉ subscribe phần state nó cần. Còn với dữ liệu từ server, TanStack Query bản thân nó đã là một provider pattern: một `QueryClientProvider` ở trên cùng, cache được chia sẻ qua context, và các hook để đọc.

## Khi nào nên dùng, khi nào không

Nên dùng provider khi:

- Nhiều component ở các độ sâu khác nhau cần cùng một giá trị.
- Giá trị áp dụng cho cả app hoặc cả một khu vực, và ít thay đổi.
- Bạn muốn inject một dependency (API client, analytics, config) để thay được trong test hoặc Storybook bằng cách render một provider khác.
- Một nhóm component phải chia sẻ state, như tabs hay accordion.

Không nên dùng khi:

- Nguồn và nơi dùng chỉ cách nhau một hai tầng. Truyền props rõ ràng hơn.
- Giá trị cập nhật nhiều lần mỗi giây (vị trí con trỏ, vị trí cuộn, input của form ở mỗi lần gõ phím) và có nhiều component đọc nó.
- Bạn dùng context chỉ để khỏi phải nghĩ về cấu trúc component. Nhiều khi truyền `children` thay vì drill props đã giải quyết được vấn đề mà không cần context nào.

## Những lỗi hay gặp

1. **Giá trị mặc định che mất việc thiếu provider**. Dùng `null` và một hook có kiểm tra để lỗi lộ ra ngay với thông báo rõ ràng.
2. **Một context khổng lồ cho mọi thứ**. Gom theme, user, giỏ hàng và thông báo vào một value thì mỗi thay đổi sẽ re-render tất cả. Hãy tách context theo tần suất thay đổi, và cân nhắc tách riêng context cho state và context cho action.
3. **Object `value` mới ở mỗi lần render** khi không có React Compiler. Hãy memo nó, nếu không mọi consumer sẽ re-render mỗi khi component cha của provider render.
4. **Đặt provider quá cao trong cây**. Nếu chỉ luồng checkout cần bản nháp giỏ hàng, hãy đặt provider quanh các route checkout, không phải quanh cả app.
5. **Gọi hook ngay trong component provider**. `ThemeProvider` không gọi được `useTheme()`, vì nó không nằm bên trong chính nó. Ở đó hãy đọc từ state cục bộ.

## Bài tập

Từ bài tập gốc:

1. **Auth context**: viết `AuthProvider` giữ `user` và `isAuthenticated`, có `login()` và `logout()`. Dùng nó trong `Navbar` và `Dashboard`, rồi kiểm tra rằng đăng nhập ở một bên thì bên kia cập nhật theo (bug ở chương 7 đã biến mất).
2. **Language context**: lưu ngôn ngữ đang chọn, cung cấp hàm chuyển đổi, và cập nhật chữ hiển thị trên nhiều component. Giữ bản dịch trong một object thường, key theo ngôn ngữ.
3. **Kết hợp cả hai** một cách gọn gàng trong component `AppProviders`. Quyết định cái nào nên nằm ngoài và giải thích vì sao.

Và hai bài của mình:

4. **Tách để tối ưu hiệu năng**: chia auth context thành hai context, một cho `user` và một cho `login`/`logout`. Dùng Profiler trong React DevTools để so sánh những component nào re-render sau khi đăng nhập, có tách và không tách.
5. **Promise trong context**: cho `BrandProvider` nhận prop `brandPromise` thay vì fetch trong effect, lưu promise vào context, rồi đọc nó bằng `use()` bên trong một boundary `<Suspense>`.

## Video và source code

- Video (Day 07): [Master the Provider Pattern in React](https://www.youtube.com/watch?v=POWMosrdamI)
- Source code: [day-07 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-07)

Chương này dựa trên Day 07 của series "15 Days of React Design Patterns" do Tapas Adhikary (tapaScript) thực hiện, được mình viết lại bằng TypeScript, thêm ví dụ và ghi chú cho React 19.
