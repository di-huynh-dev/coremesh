---
title: "Higher-Order Components: bọc component bằng logic dùng chung"
description: "Từ higher-order function đến HOC: bọc component bằng logic dùng chung, khai báo kiểu đúng cách và biết HOC còn hợp ở đâu trong React 19."
order: 6
---

## Vấn đề: màn hình nào cũng tự fetch dữ liệu

Giả sử mình có một app phim nhỏ với hai view. `MovieList` hiển thị danh sách tên phim, `MovieAnalytics` hiển thị tổng số phim và điểm trung bình. Cả hai cần cùng một danh sách phim từ cùng một API. Cách viết thẳng nhất là nhét việc fetch vào từng component:

```tsx
import { useEffect, useState } from "react";

type Movie = { id: string; title: string; year: number; rating: number };

export function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/movies")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch movies");
        return response.json() as Promise<Movie[]>;
      })
      .then(setMovies)
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p>Loading movies...</p>;
  if (errorMessage) return <p role="alert">Error: {errorMessage}</p>;

  return (
    <ul>
      {movies.map((movie) => (
        <li key={movie.id}>{movie.title} ({movie.year})</li>
      ))}
    </ul>
  );
}
```

`MovieAnalytics` cũng nhận y nguyên 20 dòng state, effect, xử lý loading và lỗi, rồi mới tới bốn dòng thật sự quan trọng. Một component lẽ ra chỉ để "hiển thị thống kê" lại dành phần lớn thân hàm cho chuyện gọi mạng. Khi đường dẫn API đổi, hoặc team quyết định mọi thông báo lỗi phải đi qua toast, bạn sửa hai file. Có năm màn hình thì sửa năm file.

Điều mình thật sự muốn là: "cho mình một component chỉ biết hiển thị phim, rồi bọc nó bằng một thứ biết cách tải phim." Trước khi nói đến component, nhìn cùng ý tưởng đó với hàm thường sẽ dễ hiểu hơn.

## Trước hết: higher-order function

Higher-order function (HOF) là hàm nhận một hàm làm tham số, trả về một hàm, hoặc cả hai. Bạn dùng chúng hằng ngày: `Array.prototype.map`, `filter`, `setTimeout` đều nhận hàm. Loại mà mình quan tâm ở đây là loại **trả về một phiên bản "nâng cấp" của chính hàm bạn đưa vào**:

```ts
export function withTiming<TArgs extends unknown[], TResult>(
  task: (...args: TArgs) => TResult,
  label: string,
) {
  return (...args: TArgs): TResult => {
    const startedAt = performance.now();
    const result = task(...args);
    console.info(`${label} took ${(performance.now() - startedAt).toFixed(1)}ms`);
    return result;
  };
}

function sortByRating(movies: { rating: number }[]) {
  return [...movies].sort((a, b) => b.rating - a.rating);
}

export const timedSortByRating = withTiming(sortByRating, "sortByRating");
```

`sortByRating` không biết gì về đo thời gian. `withTiming` không biết gì về phim. Ghép lại, bạn có một hàm làm được cả hai, và `withTiming` dùng lại được cho bất kỳ hàm nào khác. Các helper debounce, throttle, retry, memoize đều có hình dạng này.

## Pattern: higher-order component

Higher-order component (HOC) là đúng ý tưởng đó nhưng áp dụng cho component: **một hàm nhận vào một component và trả về một component mới**, component mới này render component gốc kèm thêm hành vi hoặc thêm props. Theo quy ước, tên bắt đầu bằng `with`.

### Bước 1: giữ cho component hiển thị thật "ngốc"

Gỡ phần fetch ra. Mỗi component chỉ khai báo nó cần gì qua props:

```tsx
export type Movie = { id: string; title: string; year: number; rating: number };

type MovieListProps = { data: Movie[] };

export function MovieList({ data }: MovieListProps) {
  return (
    <ul>
      {data.map((movie) => (
        <li key={movie.id}>{movie.title} ({movie.year})</li>
      ))}
    </ul>
  );
}
```

```tsx
import type { Movie } from "./MovieList";

type MovieAnalyticsProps = { data: Movie[] };

export function MovieAnalytics({ data }: MovieAnalyticsProps) {
  const averageRating =
    data.length === 0 ? 0 : data.reduce((sum, movie) => sum + movie.rating, 0) / data.length;

  return (
    <dl>
      <dt>Total movies</dt>
      <dd>{data.length}</dd>
      <dt>Average rating</dt>
      <dd>{averageRating.toFixed(1)}</dd>
    </dl>
  );
}
```

Giờ hai component này test rất dễ, đưa lên Storybook với dữ liệu giả cũng dễ.

### Bước 2: viết HOC

```tsx
import { useEffect, useState, type ComponentType } from "react";

export function withDataFetching<TProps extends { data: unknown }>(
  WrappedComponent: ComponentType<TProps>,
  url: string,
) {
  function WithDataFetching(props: Omit<TProps, "data">) {
    const [data, setData] = useState<TProps["data"] | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
      const controller = new AbortController();

      fetch(url, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error(`Request failed with ${response.status}`);
          return response.json() as Promise<TProps["data"]>;
        })
        .then(setData)
        .catch((error: Error) => {
          if (error.name !== "AbortError") setErrorMessage(error.message);
        });

      return () => controller.abort();
    }, []);

    if (errorMessage) return <p role="alert">Error: {errorMessage}</p>;
    if (data === null) return <p>Loading...</p>;

    const injectedProps = { ...props, data } as TProps;
    return <WrappedComponent {...injectedProps} />;
  }

  const wrappedName = WrappedComponent.displayName ?? WrappedComponent.name ?? "Component";
  WithDataFetching.displayName = `withDataFetching(${wrappedName})`;

  return WithDataFetching;
}
```

Vài chi tiết đáng chú ý:

- `TProps extends { data: unknown }` có nghĩa là "mình chỉ bọc được những component có nhận prop `data`".
- Component trả về nhận `Omit<TProps, "data">`, nên nơi gọi không cần (và cũng không được) tự truyền `data`. Việc đó là trách nhiệm của HOC.
- `AbortController` hủy request nếu component bị unmount, đồng thời giúp việc Strict Mode chạy effect hai lần không gây rắc rối.
- `displayName` giúp React DevTools hiện `withDataFetching(MovieList)` thay vì một wrapper vô danh.

### Bước 3: bọc một lần, ở cấp module

```tsx
import { withDataFetching } from "./withDataFetching";
import { MovieList } from "./MovieList";
import { MovieAnalytics } from "./MovieAnalytics";

const MovieListWithData = withDataFetching(MovieList, "/api/movies");
const MovieAnalyticsWithData = withDataFetching(MovieAnalytics, "/api/movies");

export function MoviesPage() {
  return (
    <main className="movies-page">
      <MovieListWithData />
      <MovieAnalyticsWithData />
    </main>
  );
}
```

Mỗi component được bọc có sẵn phần xử lý loading và lỗi, còn component hiển thị thì chỉ tập trung vào việc hiển thị. Lưu ý là hai component được bọc vẫn gửi hai request riêng. HOC chia sẻ *logic*, không chia sẻ *dữ liệu*. Muốn dùng chung chính dữ liệu đó thì cần một lớp cache (TanStack Query, SWR) hoặc Provider pattern ở chương 8.

## Ví dụ thứ hai: chỗ HOC vẫn còn đất diễn, error boundary

Fetch dữ liệu là ví dụ kinh điển để học, nhưng ở năm 2026 bạn hiếm khi viết nó thành HOC. Một ví dụ hợp lý hơn cho HOC là bọc component trong error boundary. Trong React 19, error boundary vẫn phải là class component, vì chưa có hook nào tương đương `componentDidCatch`. Một HOC giúp phần còn lại của codebase vẫn giữ được function component:

```tsx
import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  fallback: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
};

type ErrorBoundaryState = { hasError: boolean };

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

type ErrorBoundaryOptions = Omit<ErrorBoundaryProps, "children">;

export function withErrorBoundary<TProps extends object>(
  WrappedComponent: ComponentType<TProps>,
  options: ErrorBoundaryOptions,
) {
  function WithErrorBoundary(props: TProps) {
    return (
      <ErrorBoundary {...options}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  const wrappedName = WrappedComponent.displayName ?? WrappedComponent.name ?? "Component";
  WithErrorBoundary.displayName = `withErrorBoundary(${wrappedName})`;

  return WithErrorBoundary;
}
```

```tsx
export const SafeRevenueChart = withErrorBoundary(RevenueChart, {
  fallback: <p>The chart could not be displayed.</p>,
  onError: (error) => console.error("RevenueChart crashed", error),
});
```

HOC này không thêm prop nào cả, nó chỉ thêm một lớp bọc. Đây là kiểu HOC sạch nhất: props vào thế nào thì props ra thế ấy, nên khai báo kiểu đơn giản và không lo trùng tên prop. Package `react-error-boundary` khá phổ biến cũng có helper `withErrorBoundary` dựa trên đúng ý tưởng này.

## HOC ở năm 2026 và React 19

Nói thẳng: HOC vẫn được hỗ trợ, nhưng với việc chia sẻ logic có state thì custom hook đã thay thế nó từ nhiều năm trước. `withDataFetching` trở thành `useFetch(url)` (hoặc tốt hơn là `useQuery` của TanStack Query), và component gọi trực tiếp. Không wrapper, không inject prop, không phải vật lộn với generic. Tài liệu React hiện nay dạy custom hook cho việc tái sử dụng logic, và bạn sẽ chủ yếu gặp HOC trong code cũ như `connect` của Redux.

HOC vẫn có chỗ đứng khi phần "nâng cấp" là về *bọc*, không phải về *dữ liệu*:

- **`memo`** bản chất là một hàm nhận component và trả về component mới. Cùng hình dạng với HOC.
- **Error boundary**, như ví dụ trên, vì không có hook nào cho nó.
- **Tích hợp thư viện** như `observer` của MobX, bọc component để theo dõi những gì nó đọc.
- **Wrapper dùng chung cho nhiều route**, ví dụ chặn theo feature flag hay boundary cho analytics, khi mà gọi hook ở từng page sẽ rất lặp.

React 19 thay đổi vài chi tiết thực tế:

- **`ref` là prop bình thường** với function component. HOC nào spread `{...props}` vào component được bọc giờ sẽ tự động chuyển `ref` đi tiếp, nên màn `forwardRef` lằng nhằng bên trong HOC không còn cần nữa.
- **React Compiler** tự memo component và giá trị. Nó không đổi cách HOC hoạt động, nhưng bỏ đi một lý do cũ để phải tự tay dùng `memo`.
- **Server Components**: một HOC có dùng `useState` hay `useEffect` sẽ tạo ra Client Component, và module của nó cần `"use client"`. Bạn không thể dùng nó để thêm hành vi phía client cho một async Server Component. Với những việc phía server như kiểm tra quyền hay tải dữ liệu, hãy làm trực tiếp trong Server Component, layout hoặc route handler thay vì bọc.

## Khi nào nên dùng, khi nào không

Nên dùng HOC khi:

- Bạn cần bọc nhiều component bằng cùng một phần tử ngoài hoặc boundary (error boundary, chặn theo feature flag, analytics, `observer`).
- Bạn tích hợp với thư viện mà API chính thức của nó là HOC.
- Bạn đang bảo trì codebase đã dùng HOC nhất quán, và viết lại lúc này không đáng.

Không nên dùng khi:

- Bạn đang chia sẻ logic có state. Hãy viết custom hook.
- Bạn cần inject nhiều props từ nhiều HOC. Chồng `withA(withB(withC(Page)))` lên nhau sẽ khiến bạn không biết prop nào từ đâu ra.
- Component được bọc cần kiểm soát *cách* dùng dữ liệu được inject ở từng nơi gọi. Hook hoặc render props cho nơi gọi nhiều quyền kiểm soát hơn.

## Những lỗi hay gặp

1. **Tạo HOC bên trong lúc render**. Viết `const Wrapped = withDataFetching(MovieList, url)` trong thân component sẽ tạo ra một kiểu component hoàn toàn mới ở mỗi lần render. React sẽ unmount rồi mount lại nó mỗi lần, vứt hết state. Luôn áp dụng HOC ở cấp module.
2. **Trùng tên prop**. Nếu HOC inject `data` và nơi gọi cũng truyền `data`, một trong hai sẽ âm thầm thắng tùy thứ tự spread. Dùng `Omit` trong kiểu để việc trùng trở thành lỗi lúc compile, và chọn tên prop cụ thể.
3. **Thiếu `displayName`**. DevTools toàn `Anonymous` hoặc `WithDataFetching` mà không biết component bên trong là gì thì debug rất mệt.
4. **Mất static property**. Nếu component được bọc có gắn static (ví dụ một hàm `preload`), kết quả của HOC sẽ không có chúng, trừ khi bạn tự copy sang.
5. **Wrapper hell**. Năm HOC lồng nhau là năm lớp thêm vào cây component, cộng với những prop không rõ nguồn gốc. Khi thấy tình trạng này, thường đã đến lúc chuyển logic sang hook.

## Bài tập

1. **`withUserDataAndPermissions`** (từ bài tập gốc): dựng một khu admin gồm `ProfilePage`, `AdminPanel` và `ReportsPage`. HOC tải thông tin user (dùng object tĩnh là được), inject prop `user` và `hasPermission`, nhận quyền cần thiết làm tham số. `ProfilePage` luôn hiển thị, `AdminPanel` cần quyền `"admin"`, `ReportsPage` cần quyền `"reports"`. Nếu không đủ quyền thì hiện thông báo "Access denied". Khai báo kiểu sao cho component được bọc bắt buộc phải nhận các prop được inject.
2. **`withFeatureFlag`**: viết một HOC nhận tên flag và một fallback, chỉ render component được bọc khi flag đang bật. HOC này không inject prop nào, nên giữ props bên ngoài giống hệt bên trong.
3. **Chuyển sang hook**: viết lại `withDataFetching` thành `useFetch(url)`, rồi refactor `MovieList` và `MovieAnalytics` để gọi nó. So sánh hai phiên bản trong DevTools.
4. **Khởi động với HOF**: viết `withRetry(task, attempts)` cho hàm async và dùng nó bọc lời gọi fetch phim.

## Video và source code

- Video (Day 05): [Master Higher Order Functions & Components in React](https://youtu.be/spDQ4oCKSPY)
- Source code: [day-05 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-05)

Chương này dựa trên Day 05 của series "15 Days of React Design Patterns" do Tapas Adhikary (tapaScript) thực hiện, được mình viết lại bằng TypeScript, thêm ví dụ và ghi chú cho React 19.
