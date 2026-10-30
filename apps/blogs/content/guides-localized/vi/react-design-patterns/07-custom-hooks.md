---
title: "Custom Hooks: tách logic có state ra khỏi component"
description: "Tách logic có state ra khỏi component thành các hook dùng lại được, có kiểu rõ ràng, đúng Rules of Hooks, và tận dụng những gì React 19 bổ sung."
order: 7
---

## Vấn đề: component ôm đồm mọi thứ

Đây là kiểu component mình gặp rất nhiều trong dự án thật, kể cả code của chính mình hồi mới đi làm. Nó hiển thị danh sách phim, có nút chuyển sang chế độ gọn, và tự lo luôn việc fetch:

```tsx
import { useEffect, useState } from "react";

type Movie = { id: string; title: string; director: string };

export function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/movies")
      .then((response) => response.json())
      .then((result: { movies: Movie[] }) => setMovies(result.movies))
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p>Loading movies...</p>;
  if (errorMessage) return <p role="alert">Error: {errorMessage}</p>;

  return (
    <section>
      <button type="button" onClick={() => setIsCompact((value) => !value)}>
        {isCompact ? "Show details" : "Compact view"}
      </button>
      <ul>
        {movies.map((movie) => (
          <li key={movie.id}>
            {movie.title}
            {!isCompact && <span> by {movie.director}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Xét riêng thì không có gì sai. Vấn đề nằm ở chuyện xảy ra tiếp theo. Nút đổi theme trên header cần đúng logic "lật một giá trị boolean". Trang đạo diễn cần đúng logic "fetch JSON, theo dõi loading và lỗi". Thế là code bị copy, và mỗi bản copy lại khác nhau một chút: bản này quên kiểm tra `response.ok`, bản kia quên reset lỗi khi thử lại. Trong khi đó, muốn đọc `MovieList` thì phải lướt qua bốn cái `useState` và một effect mới tới được phần render phim.

Các chương trước giải quyết chuyện này bằng render props và HOC. Cả hai đều chạy được, nhưng đều thêm wrapper vào cây component. Custom hook cho phép tách logic ra *mà không đổi cây component chút nào*.

## Pattern: một hàm có dùng hook

Hook là hàm cho phép component "móc" vào các tính năng của React như state, effect, context. React có sẵn các hook built-in (`useState`, `useEffect`, `useContext`, `useRef`, `useReducer`, `useActionState`, ...). Còn **custom hook** đơn giản là hàm của bạn, tên bắt đầu bằng `use` và có gọi các hook khác. Định nghĩa chỉ có vậy. Không có API đặc biệt nào để đăng ký nó.

Hai quy tắc áp dụng cho mọi hook, built-in hay tự viết:

1. **Chỉ gọi hook ở cấp cao nhất** của component hoặc của một hook khác. Không gọi trong điều kiện, vòng lặp hay hàm lồng bên trong. React nhận diện từng state dựa vào thứ tự các hook được gọi, nên thứ tự đó phải giống nhau ở mọi lần render.
2. **Chỉ gọi hook từ hàm React**: component hoặc hook khác, không gọi từ hàm tiện ích thường hay từ event handler.

Tiền tố `use` không phải để trang trí. Nhờ nó mà linter (`eslint-plugin-react-hooks`) và React Compiler biết hàm đó tuân theo các quy tắc trên.

### Bước 1: tách phần đơn giản nhất, `useToggle`

```ts
import { useState } from "react";

export function useToggle(initialValue = false) {
  const [isOn, setIsOn] = useState(initialValue);

  function toggle() {
    setIsOn((value) => !value);
  }

  return [isOn, toggle] as const;
}
```

Trả về một tuple (kèm `as const` để TypeScript giữ đúng kiểu) giúp mỗi nơi gọi tự đặt tên giá trị theo ý mình, giống hệt `useState`:

```tsx
const [isCompact, toggleCompact] = useToggle();
const [isDarkMode, toggleDarkMode] = useToggle(true);
```

### Bước 2: tách phần fetch dữ liệu, `useFetch`

Logic fetch lớn hơn nên cần cẩn thận hơn. Có hai điều bản gốc bỏ qua: request có thể về không đúng thứ tự nếu URL đổi liên tục, và component có thể unmount trước khi response về tới.

```ts
import { useEffect, useState } from "react";

type FetchResult<TData> = {
  url: string;
  data: TData | null;
  error: Error | null;
};

export function useFetch<TData>(url: string) {
  const [result, setResult] = useState<FetchResult<TData> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        return response.json() as Promise<TData>;
      })
      .then((data) => setResult({ url, data, error: null }))
      .catch((error: Error) => {
        if (error.name !== "AbortError") setResult({ url, data: null, error });
      });

    return () => controller.abort();
  }, [url]);

  const currentResult = result?.url === url ? result : null;

  return {
    data: currentResult?.data ?? null,
    error: currentResult?.error ?? null,
    isLoading: currentResult === null,
  };
}
```

Thay vì giữ thêm một state `isLoading`, hook ghi nhớ kết quả đang lưu thuộc về URL nào. Nếu URL đã đổi mà response mới chưa về, kết quả cũ coi như hết hạn và hook báo đang loading. `AbortController` hủy request cũ trong cleanup, nên một response chậm của URL cũ không bao giờ ghi đè được kết quả mới hơn.

### Bước 3: component chỉ còn mô tả UI

```tsx
import { useFetch } from "../hooks/useFetch";
import { useToggle } from "../hooks/useToggle";

type Movie = { id: string; title: string; director: string };

export function MovieList() {
  const { data, error, isLoading } = useFetch<{ movies: Movie[] }>("/api/movies");
  const [isCompact, toggleCompact] = useToggle();

  if (isLoading) return <p>Loading movies...</p>;
  if (error) return <p role="alert">Error: {error.message}</p>;

  return (
    <section>
      <button type="button" onClick={toggleCompact}>
        {isCompact ? "Show details" : "Compact view"}
      </button>
      <ul>
        {data?.movies.map((movie) => (
          <li key={movie.id}>
            {movie.title}
            {!isCompact && <span> by {movie.director}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Cây component giữ nguyên như trước, không có wrapper nào. Nhưng giờ `MovieList` đọc từ trên xuống rất mạch lạc: lấy phim, lấy toggle, render. Còn `useFetch` và `useToggle` có thể unit test riêng bằng `renderHook` của Testing Library.

## Ví dụ thứ hai: `useAuth`, và thứ mà hook không chia sẻ

Ví dụ thứ hai trong repo là một hook xác thực. Đây là phiên bản TypeScript:

```ts
import { useState } from "react";

type User = { name: string };

async function requestLogin(username: string, password: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return username && password ? { name: username } : null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  async function login(username: string, password: string) {
    const loggedInUser = await requestLogin(username, password);
    setUser(loggedInUser);
    return loggedInUser !== null;
  }

  function logout() {
    setUser(null);
  }

  return { user, isAuthenticated: user !== null, login, logout };
}
```

```tsx
import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";

export function AuthPanel() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login(credentials.username, credentials.password);
  }

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user?.name}</p>
        <button type="button" onClick={logout}>Log out</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={credentials.username}
        onChange={(event) => setCredentials({ ...credentials, username: event.target.value })}
        required
      />
      <input
        type="password"
        name="password"
        value={credentials.password}
        onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
        required
      />
      <button type="submit">Log in</button>
    </form>
  );
}
```

Giờ tới bài học quan trọng. Đặt `AuthPanel` ở sidebar, và một `Navbar` cũng gọi `useAuth()` ở header. Đăng nhập qua panel. Navbar vẫn báo bạn chưa đăng nhập.

Đây không phải bug của hook. **Custom hook chia sẻ logic, không chia sẻ state.** Mỗi lần gọi `useAuth()` là một lần chạy `useState` riêng, nên mỗi component có một `user` riêng của nó. Đây là hiểu lầm phổ biến nhất về custom hook. Nếu bạn cần một state mà nhiều component cùng thấy, bạn kết hợp hook với một context provider, và đó chính là nội dung chương sau.

## Custom hook ở năm 2026 và React 19

Custom hook là cách mặc định để tái sử dụng logic trong React hiện nay, và điều đó sẽ không đổi. Cái thay đổi là bộ công cụ bạn dùng bên trong hook:

- **React Compiler** (bản ổn định từ cuối năm 2025) tự động memo giá trị và hàm. Trong app có dùng compiler, bạn không cần bọc mọi hàm trả về bằng `useCallback` để giữ nó ổn định nữa. Nếu bạn publish hook cho dự án khác có thể không dùng compiler, thì tham chiếu ổn định vẫn quan trọng.
- **`useEffectEvent`** (ổn định từ React 19.2) giải quyết bài toán kinh điển "effect cần callback mới nhất nhưng không được chạy lại khi callback đổi". Nó rất hợp cho các hook như `useClickOutside(ref, onOutsideClick)`: bọc `onOutsideClick` bằng `useEffectEvent` rồi chỉ subscribe vào document một lần.
- **`useSyncExternalStore`** là công cụ đúng cho các hook đọc dữ liệu từ bên ngoài React: `localStorage`, `matchMedia`, trạng thái online, một store WebSocket. Nó xử lý đúng với concurrent rendering, điều mà cặp `useEffect` cộng `useState` tự viết không phải lúc nào cũng làm được.
- **`use`** đọc một promise hoặc một context trong lúc render. Hook có thể nhận promise do component cha hoặc framework tạo ra và để Suspense lo trạng thái loading, thay vì tự theo dõi `isLoading`. Promise phải được tạo bên ngoài lúc render (hoặc được cache), không tạo mới trong hook ở mỗi lần render.
- **Actions và `useActionState`** bao trọn luồng "submit, hiện trạng thái chờ, lưu kết quả". Form đăng nhập ở trên có thể viết lại để trạng thái chờ và kết quả do React quản lý:

```tsx
import { useActionState } from "react";

type LoginState = { errorMessage: string | null };

export function LoginForm({ onLogin }: { onLogin: (username: string, password: string) => Promise<boolean> }) {
  const [state, submitLogin, isPending] = useActionState(
    async (_previousState: LoginState, formData: FormData): Promise<LoginState> => {
      const isLoggedIn = await onLogin(String(formData.get("username")), String(formData.get("password")));
      return { errorMessage: isLoggedIn ? null : "Wrong username or password" };
    },
    { errorMessage: null },
  );

  return (
    <form action={submitLogin}>
      <input name="username" required />
      <input type="password" name="password" required />
      <button type="submit" disabled={isPending}>{isPending ? "Logging in..." : "Log in"}</button>
      {state.errorMessage && <p role="alert">{state.errorMessage}</p>}
    </form>
  );
}
```

- **Dữ liệu từ server**: một `useFetch` như của mình rất tốt để học, nhưng trong production mình dùng TanStack Query (hoặc tầng dữ liệu của framework). Nó có sẵn cache, gộp request trùng, retry và refetch ngầm, toàn những thứ sớm muộn gì bạn cũng phải tự viết lại.
- **Server Components** không dùng được state hay effect, nên component gọi custom hook có state phải là Client Component (`"use client"`). Ở phía server, nhiều khi bạn không cần hook luôn: một async Server Component có thể `await` dữ liệu trực tiếp.

## Khi nào nên dùng, khi nào không

Nên viết custom hook khi:

- Từ hai component trở lên cần cùng một logic có state.
- Thân component chủ yếu là việc quản lý (state, effect, subscription) và bạn muốn nó đọc như một bản mô tả UI.
- Bạn muốn test logic tách biệt khỏi phần render.
- Bạn bọc một API của trình duyệt (clipboard, storage, media query, intersection observer) để component không phải đụng trực tiếp vào nó.

Không nên viết khi:

- Logic không có state cũng không có effect. Một hàm thường như `formatDuration(minutes)` là đủ. Đặt tên `useFormatDuration` chỉ thêm ràng buộc không cần thiết.
- Nó chỉ được dùng đúng một lần và tách ra cũng không làm component dễ đọc hơn.
- Thứ bạn thật sự cần là state dùng chung khắp cây component. Một mình hook không làm được, bạn cần context hoặc một store (ví dụ Zustand).

## Những lỗi hay gặp

1. **Tưởng state được chia sẻ**. Hai component gọi `useAuth()` sẽ có hai user riêng biệt. Dùng provider hoặc store cho state dùng chung.
2. **Gọi hook có điều kiện**. `if (isEnabled) useFetch(url)` làm hỏng thứ tự gọi. Hãy đưa điều kiện vào trong hook, ví dụ nhận `url: string | null` và bỏ qua việc fetch khi nó là `null`.
3. **Bỏ qua cleanup và race condition**. Effect trong hook phải dọn subscription, timer và request. Nếu không bạn sẽ bị rò rỉ bộ nhớ và response cũ ghi đè response mới.
4. **Hook "vạn năng"**. Một `usePage()` fetch ba thứ, quản lý form và lo luôn analytics thì chỉ là component lộn xộn cũ được dời sang file khác. Giữ mỗi hook tập trung vào một việc rồi kết hợp chúng lại.
5. **Giá trị trả về không ổn định khi không có compiler**. Trả về object hay function mới ở mỗi lần render thì render vẫn ổn, nhưng nếu nơi gọi đưa chúng vào dependency array của effect, effect sẽ chạy lại liên tục. Với React Compiler vấn đề này gần như biến mất; không có compiler thì hãy memo những thứ mà nơi gọi có khả năng phụ thuộc vào.

## Bài tập

Từ bài tập gốc, hãy viết ba hook sau mà không dùng thư viện ngoài, mỗi hook kèm một component demo nhỏ và xử lý các trường hợp biên:

1. **`useLocalStorage(key, initialValue)`**: đồng bộ state với `localStorage`. Xử lý JSON không hợp lệ, storage không khả dụng (chế độ ẩn danh, render phía server), và thay đổi từ tab khác (sự kiện `storage`). Điểm cộng: xây nó trên `useSyncExternalStore`.
2. **`useClipboard()`**: trả về `copy(text)` và cờ `isCopied` tự reset sau hai giây. Xử lý trường hợp Clipboard API không có hoặc bị từ chối, và xóa timer khi unmount.
3. **`useClickOutside(ref, onOutsideClick)`**: gọi callback khi có click hoặc chạm bên ngoài phần tử. Dùng nó để đóng một dropdown. Thử viết cả phiên bản có và không có `useEffectEvent`, rồi để ý xem listener bị gắn lại bao nhiêu lần.

Và hai bài của mình:

4. **`useDebouncedValue(value, delayMs)`**: dùng nó để debounce ô tìm kiếm trước khi truyền từ khóa vào `useFetch`.
5. **Test một hook**: viết test cho `useToggle` và `useFetch` bằng `renderHook`, bao gồm trường hợp URL đổi trước khi response đầu tiên về.

## Video và source code

- Video (Day 06): [Custom Hooks Pattern](https://www.youtube.com/watch?v=fhwvqTry_Vg)
- Source code: [day-06 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-06)

Chương này dựa trên Day 06 của series "15 Days of React Design Patterns" do Tapas Adhikary (tapaScript) thực hiện, được mình viết lại bằng TypeScript, thêm ví dụ và ghi chú cho React 19.
