---
title: "Performance Patterns: tối ưu hiệu năng React"
description: "Memoization, derived state, debounce, throttle, lazy loading, isolation, virtualization, transition, deferred value, và React Compiler thay đổi những gì."
order: 12
---

## Vấn đề: trang càng lớn càng chậm

Phần lớn các vấn đề hiệu năng React mình từng gặp không đến từ một hàm chậm duy nhất. Chúng đến từ một trang tích tụ dần những lỗi nhỏ: một danh sách bị sort lại sau mỗi phím gõ, một con số tổng được copy vào state bằng effect, ô tìm kiếm gọi API theo từng ký tự, một component con đã `memo` mà vẫn re-render vì lần nào cũng nhận callback mới.

Đây là phiên bản rút gọn của một trang như vậy:

```tsx
import { memo, useEffect, useState } from "react";

type User = { id: number; name: string; active: boolean };

const UserTable = memo(function UserTable({ users, onSelect }: {
  users: User[];
  onSelect: (id: number) => void;
}) {
  return (
    <ul>
      {users.map((user, index) => (
        <li key={index} onClick={() => onSelect(user.id)}>{user.name}</li>
      ))}
    </ul>
  );
});

export function UsersPage({ allUsers }: { allUsers: User[] }) {
  const [query, setQuery] = useState("");
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    setActiveCount(allUsers.filter((user) => user.active).length);
  }, [allUsers]);

  useEffect(() => {
    fetch(`/api/search?q=${query}`);
  }, [query]);

  const sorted = allUsers.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <p>Active: {activeCount}</p>
      <UserTable users={sorted} onSelect={(id) => console.info(id)} />
    </>
  );
}
```

Mỗi phím gõ lại sort (và mutate) toàn bộ mảng, gửi một request, và re-render một bảng 10.000 dòng mà `memo` của nó bị vô hiệu hoá bởi `onSelect` inline. Effect cho `activeCount` khiến component render hai lần không lý do. Riêng từng lỗi thì chẳng có gì to tát; cộng lại thì gõ phím thấy rõ cảm giác bị "dính".

Chương này là một hộp đồ nghề hơn là một pattern đơn lẻ. Phần 1 xử lý re-render thừa và công việc lãng phí. Phần 2 nói về những đòn bẩy lớn hơn: tải ít code hơn, render ít node hơn, và cho React biết việc nào gấp.

## Trước hết, hiểu khi nào React re-render

Một component re-render khi state của nó đổi, khi component cha re-render, hoặc khi context nó đọc thay đổi. Props thay đổi không phải là một nguyên nhân riêng: con re-render vì cha đã render, bất kể props có đổi hay không.

Repo minh hoạ điều này bằng một bộ đếm render:

```tsx
import { useRef, useState } from "react";

function RenderCounter() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return <p>Đã render {renderCount.current} lần</p>;
}

export function RenderCounterDemo() {
  const [text, setText] = useState("");
  return (
    <div>
      <RenderCounter />
      <input value={text} onChange={(event) => setText(event.target.value)} />
    </div>
  );
}
```

`RenderCounter` không nhận prop nào, nhưng con số vẫn tăng theo từng phím gõ. Render không có nghĩa là cập nhật DOM; React so sánh kết quả và thường chẳng thay đổi gì. Re-render chỉ đáng lo khi component nặng hoặc có rất nhiều component như vậy. Nhớ điều này trước khi tối ưu bất cứ thứ gì.

## Phần 1: chặn re-render thừa

### `memo`: bỏ qua component con khi props không đổi

```tsx
import { memo, useState } from "react";

const ProfileCard = memo(function ProfileCard({ name }: { name: string }) {
  return <h3>{name}</h3>;
});

export function ProfileEditor() {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
      <ProfileCard name="Tiến Dĩ" />
    </div>
  );
}
```

`memo` so sánh props nông bằng `Object.is`. Một string literal lần nào cũng bằng nhau, nên `ProfileCard` bỏ qua render trong lúc bạn gõ.

### `useCallback`: giữ prop dạng function ổn định

Cái bẫy của `memo` là object và function tạo ra trong lúc render thì lần nào cũng mới:

```tsx
import { memo, useCallback, useState } from "react";

const ActionButton = memo(function ActionButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Bấm thử</button>;
});

export function Counter() {
  const [count, setCount] = useState(0);

  const handleChildClick = useCallback(() => {
    console.info("Child clicked");
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((current) => current + 1)}>Tăng</button>
      <ActionButton onClick={handleChildClick} />
    </div>
  );
}
```

Không có `useCallback`, `ActionButton` sẽ re-render sau mỗi lần tăng dù đã có `memo`. Bản thân `useCallback` không làm được gì; nó chỉ có ích khi bên nhận đã được memo hoặc function đó là dependency của effect.

### `useMemo`: cache một phép tính nặng

```tsx
import { useMemo } from "react";

export function SortedUsers({ names }: { names: string[] }) {
  const sortedNames = useMemo(
    () => [...names].sort((a, b) => a.localeCompare(b)),
    [names],
  );

  return (
    <ul>
      {sortedNames.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}
```

Để ý phần copy `[...names]`. `Array.prototype.sort` sort tại chỗ, nên `names.sort(...)` âm thầm mutate một prop thuộc về component cha. `toSorted()` là lựa chọn hiện đại gọn hơn.

### Derived state: tính ra, đừng đồng bộ

Nếu một giá trị tính được từ props hoặc state, hãy tính nó ngay trong lúc render. Đừng copy vào state bằng effect.

```tsx
type CartItem = { id: string; price: number };

export function CartTotal({ items }: { items: CartItem[] }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return <h2>Tổng: {total}</h2>;
}
```

Phiên bản dùng effect (`useState` cộng `useEffect(() => setTotal(...))`) render một lần với tổng cũ, rồi render lần nữa với tổng đúng. Tương tự với các boolean như `isAdult = age >= 18` hay `isValid = name !== "" && email.includes("@")`, file `MoreExamples` trong repo cho thấy chúng ở dạng sai. Derived state nhanh hơn, ngắn hơn và không bao giờ lệch. Chỉ thêm `useMemo` khi phép tính thật sự nặng.

### Debouncing: đợi người dùng ngừng tay

Debounce trì hoãn một hành động cho tới khi input im lặng được một khoảng. Đây là công cụ đúng cho kiểu tìm kiếm gõ tới đâu gọi API tới đó.

```tsx
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debounced;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    if (!debouncedQuery) return;
    const controller = new AbortController();
    fetch(`/api/users?q=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal });
    return () => controller.abort();
  }, [debouncedQuery]);

  return <input value={query} onChange={(event) => setQuery(event.target.value)} />;
}
```

Input vẫn phản hồi tức thì vì `query` cập nhật theo từng phím; chỉ có request là phải chờ. `AbortController` huỷ request không còn liên quan. Nếu dùng TanStack Query, bạn đưa `debouncedQuery` vào query key thay vì tự viết effect.

### Throttling: tối đa một lần mỗi khoảng thời gian

Throttle cho phép cập nhật đều đặn theo nhịp trong lúc sự kiện vẫn liên tục bắn ra. Scroll và resize là trường hợp kinh điển.

```tsx
import { useEffect, useRef, useState } from "react";

export function useThrottledValue<T>(value: T, interval = 200): T {
  const [throttled, setThrottled] = useState(value);
  const lastRunAt = useRef(0);

  useEffect(() => {
    const wait = Math.max(0, interval - (Date.now() - lastRunAt.current));
    const timeoutId = setTimeout(() => {
      lastRunAt.current = Date.now();
      setThrottled(value);
    }, wait);
    return () => clearTimeout(timeoutId);
  }, [value, interval]);

  return throttled;
}

export function ScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const throttledY = useThrottledValue(scrollY, 200);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <p>Vị trí scroll: {throttledY}</p>;
}
```

Phiên bản này vẫn set `scrollY` sau mỗi sự kiện scroll, nên bản thân `ScrollPosition` vẫn render thường xuyên; thứ được throttle là mọi thứ phụ thuộc vào `throttledY`. Nếu vậy vẫn nhiều, hãy throttle ngay event handler, hoặc bỏ React state và dùng CSS scroll-driven animation hay `IntersectionObserver`.

Quy tắc dễ nhớ: debounce khi bạn chỉ quan tâm giá trị cuối cùng, throttle khi cần cập nhật đều đặn trong suốt quá trình.

## Phần 2: tối ưu nâng cao

### Lazy loading với `Suspense`

Code không cần cho màn hình đầu tiên thì không nên nằm trong bundle đầu tiên.

```tsx
import { lazy, Suspense, useState } from "react";

const ReportChart = lazy(() => import("./ReportChart"));

export function ReportsPage() {
  const [showChart, setShowChart] = useState(false);

  return (
    <section>
      <button onClick={() => setShowChart((current) => !current)}>
        {showChart ? "Ẩn biểu đồ" : "Hiện biểu đồ"}
      </button>
      <Suspense fallback={<p>Đang tải biểu đồ...</p>}>
        {showChart && <ReportChart />}
      </Suspense>
    </section>
  );
}
```

Demo trong repo đặt bản lazy và bản không lazy cạnh nhau; console cho thấy module `Heavy` không lazy được evaluate ngay lúc khởi động dù bạn chưa từng mở nó. `lazy` cần default export, và lời gọi `lazy` phải nằm ở cấp module, không đặt trong component. Với Next.js, việc tách code theo route là tự động, còn `next/dynamic` lo phần tách theo component.

### Component isolation: giữ state gần nơi dùng nó

Demo dashboard trong repo bọc `UserCard` và `Revenue` trong `memo` để các cập nhật của `Visitors` không kéo chúng theo. Trước khi với tới `memo`, hãy thử đẩy state xuống thấp hoặc truyền component qua `children`:

```tsx
import { useState, type ReactNode } from "react";

function LiveVisitors() {
  const [visitors, setVisitors] = useState(0);
  return <button onClick={() => setVisitors((current) => current + 1)}>Lượt truy cập: {visitors}</button>;
}

function DashboardLayout({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[240px_1fr]">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}

export function Dashboard({ userName, revenue }: { userName: string; revenue: number }) {
  return (
    <DashboardLayout sidebar={<LiveVisitors />}>
      <h2>{userName}</h2>
      <p>Doanh thu: {revenue}</p>
    </DashboardLayout>
  );
}
```

`LiveVisitors` tự giữ state, nên các cập nhật của nó chỉ re-render chính nó. Element truyền qua `children` được tạo ở component cha, nên layout có state cũng không tạo lại chúng. Cách này miễn phí, chạy tốt dù có hay không có Compiler, và nhiều khi là đủ.

### Tách context

Một context lớn chứa `user`, `theme`, `cart` và `locale` sẽ re-render mọi consumer khi bất kỳ field nào đổi. Hãy tách theo tần suất thay đổi của từng phần:

```tsx
import { createContext, use, type ReactNode } from "react";

type Theme = "light" | "dark";
type CartItem = { id: string; price: number };

const ThemeContext = createContext<Theme>("light");
const CartContext = createContext<CartItem[]>([]);

export function AppProviders({ theme, cart, children }: {
  theme: Theme;
  cart: CartItem[];
  children: ReactNode;
}) {
  return (
    <ThemeContext value={theme}>
      <CartContext value={cart}>{children}</CartContext>
    </ThemeContext>
  );
}

export const useTheme = () => use(ThemeContext);
export const useCart = () => use(CartContext);
```

Component chỉ đọc theme sẽ không còn re-render khi giỏ hàng đổi. Với state thay đổi rất thường xuyên và được đọc ở nhiều nơi, một store có selector (Zustand, hoặc `useSyncExternalStore` ở chương trước) tốt hơn context.

### Virtualization: chỉ render phần đang nhìn thấy

Render 50.000 dòng nghĩa là 50.000 cụm DOM node, memo khéo đến đâu cũng vậy. Virtualization chỉ render những dòng nằm trong viewport cộng một chút dự phòng. Repo dùng `react-window` 1.x (`FixedSizeList`). Phiên bản 2 đổi API sang `List` với `rowComponent`:

```tsx
import { List, type RowComponentProps } from "react-window";

type User = { id: number; name: string; email: string };

function UserRow({ index, style, users }: RowComponentProps<{ users: User[] }>) {
  const user = users[index];
  return (
    <div style={style} className="border-b px-3 py-2">
      <strong>{user.name}</strong>
      <span className="ml-2 text-sm">{user.email}</span>
    </div>
  );
}

export function UserList({ users }: { users: User[] }) {
  return (
    <List
      rowComponent={UserRow}
      rowCount={users.length}
      rowHeight={56}
      rowProps={{ users }}
      style={{ height: 600 }}
    />
  );
}
```

Luôn gắn prop `style`; nó quyết định vị trí của dòng. TanStack Virtual là lựa chọn phổ biến còn lại, nhất là khi chiều cao thay đổi hoặc cần dạng lưới. Virtualization làm mất tính năng tìm trong trang của trình duyệt và cần chú ý thêm về accessibility, nên mình chỉ dùng khi danh sách thật sự dài.

### `useTransition`: đánh dấu cập nhật không gấp

Gõ phím phải tức thì; cập nhật một danh sách lọc lớn thì đợi được. `useTransition` giúp bạn nói rõ cái nào là cái nào:

```tsx
import { useState, useTransition, type ChangeEvent } from "react";

export function ProductFilter({ products }: { products: string[] }) {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    startTransition(() => setQuery(nextValue));
  }

  const results = products
    .filter((product) => product.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 200);

  return (
    <div>
      <input value={inputValue} onChange={handleChange} />
      {isPending && <span>Đang cập nhật kết quả...</span>}
      <ul style={{ opacity: isPending ? 0.6 : 1 }}>
        {results.map((product) => <li key={product}>{product}</li>)}
      </ul>
    </div>
  );
}
```

Lần render trong transition có thể bị ngắt: nếu một phím mới tới, React bỏ lần render đã cũ và làm lại. Điều này khác với debounce, vốn trì hoãn công việc một khoảng cố định kể cả trên máy nhanh.

### `useDeferredValue`: trì hoãn một giá trị bạn không kiểm soát

Khi bạn nhận giá trị qua prop, hoặc không muốn giữ hai state, `useDeferredValue` cho bạn một bản sao "chạy sau":

```tsx
import { memo, useDeferredValue, useState } from "react";

const ResultsList = memo(function ResultsList({ filter, items }: { filter: string; items: string[] }) {
  const matches = items.filter((item) => item.toLowerCase().includes(filter.toLowerCase())).slice(0, 200);
  return <ul>{matches.map((item) => <li key={item}>{item}</li>)}</ul>;
});

export function DeferredSearch({ items }: { items: string[] }) {
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);
  const isStale = text !== deferredText;

  return (
    <div>
      <input value={text} onChange={(event) => setText(event.target.value)} />
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        <ResultsList filter={deferredText} items={items} />
      </div>
    </div>
  );
}
```

`memo` trên `ResultsList` quan trọng ở đây (hoặc Compiler làm thay bạn): trong lần render gấp, `deferredText` chưa đổi, nên danh sách nặng phải có khả năng bỏ qua render.

### Danh sách và key

Nhiều demo trong repo dùng index của mảng làm `key`. Với danh sách tĩnh thì không sao, nhưng khi item được thêm, xoá hay đổi thứ tự, key là index khiến React dùng lại nhầm instance của component, tốn thêm công cập nhật DOM và có thể gắn state (chữ trong input, checkbox) vào nhầm dòng. Hãy dùng id ổn định từ dữ liệu.

### Công cụ

Đo trước và sau khi tối ưu. Profiler của React DevTools cho biết component nào đã render và vì sao, còn tuỳ chọn "Highlight updates" làm lộ ra những lần render thừa. Từ React 19.2, panel Performance của Chrome DevTools còn hiển thị các track của React (Scheduler và Components), nên bạn thấy được transition và công việc gây block trên cùng timeline với trình duyệt.

## Ví dụ thứ hai: sửa lại trang tìm kiếm

Quay lại trang ở đầu chương, lần này áp dụng các công cụ:

```tsx
import { useDeferredValue, useState } from "react";
import { List, type RowComponentProps } from "react-window";

type User = { id: number; name: string; active: boolean };

function UserRow({ index, style, users }: RowComponentProps<{ users: User[] }>) {
  return <div style={style}>{users[index].name}</div>;
}

export function UsersPage({ allUsers }: { allUsers: User[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const activeCount = allUsers.filter((user) => user.active).length;
  const visibleUsers = allUsers
    .filter((user) => user.name.toLowerCase().includes(deferredQuery.toLowerCase()))
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <p>Active: {activeCount}</p>
      <List
        rowComponent={UserRow}
        rowCount={visibleUsers.length}
        rowHeight={40}
        rowProps={{ users: visibleUsers }}
        style={{ height: 480 }}
      />
    </>
  );
}
```

Derived state thay cho state đồng bộ bằng effect, không mutate, query được defer để gõ vẫn mượt, danh sách được virtualize, và key ổn định. Nếu danh sách đến từ server, mình sẽ debounce `query` rồi đưa vào query key của TanStack Query thay vì lọc ở client. Khi bật React Compiler, các mảng đã lọc và sort được memo tự động; không có Compiler thì bọc chúng trong `useMemo`.

## Năm 2026 / React Compiler

React Compiler đạt 1.0 vào tháng 10/2025 và giờ bật lên khá dễ cho các dự án Vite, Next.js và Expo. Nó phân tích component và hook lúc build rồi tự chèn memoization, ở mức chi tiết hơn `useMemo` viết tay (nó có thể memo từng phần JSX, không chỉ cả một giá trị). Với chương này, điều đó có nghĩa là:

- **Phần lớn không còn cần:** `memo`, `useCallback`, `useMemo` viết theo thói quen để tối ưu render. Cái `onSelect` inline làm hỏng `memo` ở ví dụ đầu chương sẽ được xử lý giúp bạn.
- **Vẫn hữu ích như lối thoát:** `useMemo`/`useCallback` khi cần kiểm soát chính xác dependency của effect, và khi truyền giá trị cho thư viện so sánh theo tham chiếu mà không được compile. Team React khuyên giữ nguyên memoization thủ công đang có thay vì gỡ bỏ hàng loạt, vì gỡ đi có thể làm thay đổi những gì bản compile memo.
- **Không đổi:** derived state, debounce, throttle, lazy loading, tách context, virtualization, transition, deferred value và key. Compiler giúp bỏ qua công việc; nó không giúp tải ít code hơn, render ít DOM node hơn, hay quyết định việc nào gấp.
- **Rules of React càng quan trọng.** Compiler bỏ qua những component vi phạm luật, như mutate props (`names.sort()`), đọc ref trong lúc render, hay gọi hook có điều kiện. Preset recommended của `eslint-plugin-react-hooks` đã có sẵn các chẩn đoán của Compiler; hãy bật nó lên kể cả khi chưa bật Compiler.

Cũng nên biết thêm: `<Activity>` trong React 19.2 cho phép ẩn một phần UI mà vẫn giữ state của nó, và render trước những màn hình người dùng có khả năng mở tiếp.

## Khi nào nên tối ưu, khi nào không

Nên tối ưu khi:

- Profiler chỉ ra một component chậm cụ thể hoặc một tương tác kéo dài;
- người dùng thấy lag khi gõ, scroll hoặc chuyển trang, đặc biệt trên điện thoại tầm trung;
- bundle của trang đầu tiên lớn và chứa code của những màn hình chưa hiển thị.

Không nên tối ưu khi:

- bạn chưa đo. Đoán mò thường nhắm sai component;
- component nhẹ. Một `useMemo` bọc `price * 0.18` tốn nhiều hơn là tiết kiệm;
- Compiler đã lo rồi. Thêm memoization thủ công khắp nơi chỉ thêm nhiễu.

## Những lỗi hay gặp

1. **`memo` bị vô hiệu bởi props mới.** Object, mảng và function inline làm hỏng `memo` trừ khi chúng được memo (bằng tay hoặc bởi Compiler).
2. **Đồng bộ giá trị dẫn xuất bằng effect.** Tốn thêm một lần render và tạo ra khoảng thời gian UI hiển thị dữ liệu cũ.
3. **Mutate props.** `sort()` và `reverse()` thay đổi mảng của component cha. Dùng `toSorted()` và `toReversed()`.
4. **Hook debounce xử lý timer sai.** Mọi debounce hay throttle đều cần cleanup để huỷ timer, nếu không sẽ có cập nhật sau khi unmount.
5. **Key là index trên danh sách động.** Gây dùng lại nhầm state và tốn thêm công cập nhật DOM khi item di chuyển.

## Bài tập

1. **Sửa memoization bị hỏng** (từ task của repo). Cho một component con có `memo` nhận `onClick={() => console.log("clicked")}`, làm sao để nó chỉ render một lần trong khi counter của cha tăng liên tục. Giải thích vì sao nó re-render, sửa bằng `useCallback`. Cuối cùng bật React Compiler và bỏ `useCallback` đi.
2. **Thay anti-pattern derived state** (từ task của repo). Viết lại `useEffect(() => setFiltered(items.filter((i) => i.active)), [items])` thành derived state.
3. **Dashboard nhỏ** (từ task của repo). Làm thanh tìm kiếm có debounce, scroll tracker có throttle, và danh sách 10.000 user lọc theo từ khoá mà không đồng bộ state bằng effect.
4. **Gỡ memoization không cần thiết** (từ task của repo). Trong một `ProductCard` dùng `useMemo` cho `price * 0.18` và `useCallback` cho hàm log, bỏ cả hai và giải thích khi nào memoization vẫn cần.
5. **Lazy country selector và tách context** (từ task của repo). Lazy-load dropdown 250 quốc gia với loader tuỳ chỉnh và so sánh kích thước bundle. Tách `AppContext` thành context cho user, theme và cart, rồi dùng Profiler cho thấy khác biệt về số lần render.
6. **Transition hay debounce.** Cài đặt cùng một bộ lọc bằng `useTransition` và bằng debounce 300 ms. Bật CPU throttling trong DevTools và mô tả cảm giác của từng cách.

## Video và source code

- Video, Part 1 (Day 11): [The Ultimate React Performance Guide (Part 1): Stop Useless Re-Renders!](https://youtu.be/G8Mk6lsSOcw)
- Video, Part 2 (Day 11): [The Ultimate React Performance Guide (Part 2): Advanced Optimizations](https://youtu.be/HJFDXKkz67M)
- Source code: [day-11 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-11)

Chương này dựa trên Day 11 (Part 1 và Part 2) của series "15 Days of React Design Patterns" của tapaScript (Tapas Adhikary), phát hành theo giấy phép Apache-2.0; cảm ơn anh vì bài giảng và code demo gốc.
