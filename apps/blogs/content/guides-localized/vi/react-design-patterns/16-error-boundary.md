---
title: "Error Boundary: khoanh vùng lỗi trong UI"
description: "Giữ lỗi render trong đúng phần UI bị hỏng, hiện fallback có nút thử lại, và để phần còn lại của app vẫn chạy bình thường."
order: 16
---

## Vấn đề: một widget hỏng, cả trang trắng

Hãy nghĩ dashboard như một cái cây. Gốc là app, bên dưới là layout, trong layout có card thông tin user và một widget thống kê. Giờ giả sử API thống kê bắt đầu trả về `null` cho một field mà widget đang chờ:

```tsx
type Stats = { visitorsToday: number; conversionRate: number };

function StatsWidget({ stats }: { stats: Stats }) {
  return (
    <div className="rounded border p-2">
      <h2 className="text-2xl">Thống kê</h2>
      <p>Lượt truy cập hôm nay: {stats.visitorsToday.toLocaleString()}</p>
      <p>Tỉ lệ chuyển đổi: {(stats.conversionRate * 100).toFixed(1)}%</p>
    </div>
  );
}

export function Dashboard({ stats }: { stats: Stats }) {
  return (
    <div className="flex gap-3">
      <UserProfile />
      <StatsWidget stats={stats} />
    </div>
  );
}
```

Khi `stats.visitorsToday` là `null`, `toLocaleString` ném ra `TypeError` ngay trong lúc render. Từ React 16, một lỗi xảy ra khi render mà không ai bắt sẽ unmount **toàn bộ** cây React. User không thấy một card thống kê bị lỗi nằm cạnh card profile vẫn chạy. Họ thấy một trang trắng. Profile, thanh điều hướng, nút đăng xuất: mất hết, chỉ vì một chiếc lá bị hỏng.

Phản xạ đầu tiên là bọc `try/catch`, nhưng không ăn thua:

```tsx
export function Dashboard({ stats }: { stats: Stats }) {
  try {
    return (
      <div className="flex gap-3">
        <UserProfile />
        <StatsWidget stats={stats} />
      </div>
    );
  } catch {
    return <p>Có lỗi xảy ra</p>;
  }
}
```

`Dashboard` chỉ tạo ra element `<StatsWidget />`, nó không gọi hàm đó. React render `StatsWidget` sau, nằm ngoài khối `try` này. `try/catch` trong một component chỉ bắt được lỗi trong code của chính component đó, không bao giờ bắt được lỗi của component con. Mình cần một thứ bọc được cả một **cây con**.

## Pattern: một component bắt lỗi của mọi thứ bên dưới

Error boundary là một component bắt các lỗi xảy ra khi render bất kỳ component nào nằm dưới nó trong cây, rồi render fallback thay cho cây con đó. Mọi thứ bên ngoài boundary vẫn chạy bình thường. Có thể xem nó là khối `catch` của UI, nhưng viết theo kiểu khai báo và chỉ áp dụng cho một nhánh của cây.

### Bước 1: viết boundary

Error boundary đến giờ vẫn phải là class component, vì nó dựa vào hai lifecycle method của class:

- `static getDerivedStateFromError(error)` chạy trong pha render. Nó trả về state mới để lần render tiếp theo hiện fallback.
- `componentDidCatch(error, info)` chạy sau khi commit. Đây là chỗ cho side effect như ghi log. `info.componentStack` cho biết những component nào liên quan.

```tsx
import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";

export type ErrorFallbackProps = {
  error: Error;
  reset: () => void;
};

type ErrorBoundaryProps = {
  fallback: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

function toError(value: unknown) {
  return value instanceof Error ? value : new Error(String(value));
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onError?.(toError(error), info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { fallback: Fallback, children } = this.props;

    if (error) return <Fallback error={error} reset={this.reset} />;
    return children;
  }
}
```

Fallback là một component chứ không phải element tĩnh, nên nó hiện được thông báo lỗi và nút thử lại. Prop `onError` giữ quyết định ghi log ở bên ngoài boundary.

### Bước 2: fallback có nút thử lại

```tsx
import type { ErrorFallbackProps } from "./ErrorBoundary";

export function WidgetError({ error, reset }: ErrorFallbackProps) {
  return (
    <div role="alert" className="rounded border border-red-600 p-2">
      <p className="font-semibold">Không tải được widget này.</p>
      <p className="text-sm text-gray-500">{error.message}</p>
      <button onClick={reset} className="mt-2 bg-yellow-400 px-2 py-1 text-black">
        Thử lại
      </button>
    </div>
  );
}
```

Thử lại hoạt động thế nào? Khi boundary hiện fallback, React đã unmount các component con bị lỗi. Gọi `reset` xóa lỗi, nên lần render tiếp theo sẽ mount lại component con từ đầu, với state và effect mới. Bản trong repo có thêm `retryKey` tăng lên sau mỗi lần thử lại và dùng làm `key`, cách đó có ích khi bạn muốn ép mount lại từ bên ngoài, còn với trường hợp cơ bản thì xóa state là đủ.

Thử lại chỉ giúp với lỗi nhất thời: request chập chờn, race condition. Nếu cùng một props gây ra cùng một lỗi, component con lại ném lỗi và fallback quay lại. Vậy cũng được, ít ra là trung thực. Với lỗi dữ liệu, hãy kết hợp thử lại với fetch lại (xem ví dụ thứ hai).

### Bước 3: đặt boundary có chủ đích

Giờ dashboard bọc phần có rủi ro:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WidgetError } from "@/components/WidgetError";
import { reportError } from "@/lib/monitoring";

export function Dashboard({ stats }: { stats: Stats }) {
  return (
    <div className="flex gap-3">
      <UserProfile />
      <ErrorBoundary
        fallback={WidgetError}
        onError={(error, info) => reportError(error, { componentStack: info.componentStack })}
      >
        <StatsWidget stats={stats} />
      </ErrorBoundary>
    </div>
  );
}
```

Nếu widget thống kê crash, profile vẫn nằm trên màn hình và user có nút "Thử lại" ngay chỗ thống kê.

Bài học trong repo gọi đây là "pattern để áp dụng error boundary", và câu hỏi cốt lõi là **độ mịn**. Mình thường nghĩ theo ba tầng:

1. **Boundary ở gốc** bọc cả app. Phương án cuối cùng, hiện thông báo toàn trang kiểu "Có lỗi xảy ra, hãy tải lại". Nó chặn được trang trắng.
2. **Boundary theo route** bọc từng trang. Trang báo cáo crash thì không nên kéo sidebar và thanh điều hướng chết theo.
3. **Boundary theo widget** bọc những phần độc lập và có rủi ro: embed của bên thứ ba, biểu đồ, bất cứ thứ gì render dữ liệu mà bạn không kiểm soát hoàn toàn.

Quá ít boundary thì một bug làm mất cả trang. Quá nhiều thì màn hình đầy những ô lỗi bé tí, và mỗi cái đều tốn code. Một quy tắc dễ nhớ: đặt boundary ở chỗ mà user vẫn còn làm được việc gì đó có ích với phần còn lại của màn hình.

### Những gì boundary không bắt được

Phần này quan trọng không kém phần nó bắt được. Error boundary **không** bắt lỗi trong:

- Event handler, ví dụ một `onClick` ném lỗi. Handler không chạy trong lúc render, nên lỗi ở đó không làm hỏng UI hiện tại. Dùng `try/catch` ở đó.
- Code bất đồng bộ chạy ngoài pha render, như callback của `setTimeout` hay `.then` của promise trong effect.
- Server-side rendering.
- Chính component boundary. Lỗi trong fallback sẽ đi lên boundary cha gần nhất.

Phần React 19 bên dưới có nói tới hai ngoại lệ quan trọng mà giờ đã đi tới được boundary.

## Ví dụ thứ hai: widget dữ liệu với Suspense và TanStack Query

Repo minh họa bằng một widget ném lỗi ngẫu nhiên. Trong app thật, phần lớn lỗi widget mình gặp đến từ dữ liệu: API trả 500, timeout, dữ liệu sai hình dạng. Khi fetch dữ liệu theo kiểu Suspense, lỗi và loading trở thành hai boundary bọc cùng một component: `Suspense` cho "chưa xong", `ErrorBoundary` cho "thất bại".

Ở đây mình dùng package `react-error-boundary`, chính react.dev cũng gợi ý dùng nó để khỏi tự viết class, kết hợp với `useSuspenseQuery` của TanStack Query:

```tsx
import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { QueryErrorResetBoundary, useSuspenseQuery } from "@tanstack/react-query";
import { fetchRevenue } from "@/api/reports";

function RevenueChart({ range }: { range: "7d" | "30d" }) {
  const { data } = useSuspenseQuery({
    queryKey: ["revenue", range],
    queryFn: () => fetchRevenue(range),
  });

  return <LineChart points={data.points} />;
}

function RevenueError({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : "Lỗi không xác định";
  return (
    <div role="alert" className="rounded border border-red-600 p-3">
      <p>Không có dữ liệu doanh thu: {message}</p>
      <button onClick={resetErrorBoundary}>Tải lại biểu đồ</button>
    </div>
  );
}

export function RevenueCard({ range }: { range: "7d" | "30d" }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary FallbackComponent={RevenueError} onReset={reset} resetKeys={[range]}>
          <Suspense fallback={<ChartSkeleton />}>
            <RevenueChart range={range} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

Có ba thứ xảy ra ở đây mà bản tự viết chưa làm:

- `onReset={reset}` báo TanStack Query xóa query bị lỗi, nên "Tải lại biểu đồ" thật sự fetch lại chứ không ném lại lỗi đang nằm trong cache.
- `resetKeys={[range]}` tự reset boundary khi user chuyển từ 7 ngày sang 30 ngày. Thiếu nó, lỗi cũ sẽ nằm lì trên màn hình cho khoảng thời gian mới.
- `RevenueChart` không có nhánh loading hay error nào. Nó chỉ mô tả trường hợp suôn sẻ.

Với lỗi trong event handler, cùng package đó có `useErrorBoundary`. Gọi `showBoundary(error)` trong `catch` sẽ chuyển lỗi lên boundary gần nhất, nên một cú click "Export" thất bại cũng hiện được cùng fallback như lỗi render:

```tsx
import { useErrorBoundary } from "react-error-boundary";

export function ExportReportButton({ reportId }: { reportId: string }) {
  const { showBoundary } = useErrorBoundary();

  async function handleExport() {
    try {
      await exportReport(reportId);
    } catch (error) {
      showBoundary(error);
    }
  }

  return <button onClick={handleExport}>Export</button>;
}
```

## Năm 2026 / React 19

**Vẫn là class, và vậy cũng ổn.** react.dev nói thẳng là hiện chưa có cách viết error boundary bằng function component. Thực tế gần như không ai tự viết class nữa: `react-error-boundary` lo phần thử lại, reset keys và cả hook ở trên. Mình vẫn nghĩ nên tự viết class một lần như mình vừa làm, để thư viện không còn là phép màu.

**Actions và `use` đều báo lỗi lên boundary.** Ở React 19, nếu function truyền vào `startTransition` ném lỗi hoặc trả về promise bị reject, lỗi đó được boundary gần nhất hiển thị. Promise đọc bằng `use(promise)` mà bị reject cũng vậy. Nên với Actions, một mutation async thất bại có thể hiện qua boundary thay vì một state `error` tự quản lý. Còn khi bạn muốn hiện lỗi ngay trong form, hãy trả lỗi về như state từ `useActionState` thay vì throw.

**Hook xử lý lỗi ở tầng root.** `createRoot` và `hydrateRoot` nhận `onCaughtError` (lỗi đã được boundary bắt), `onUncaughtError` (lỗi không boundary nào bắt) và `onRecoverableError`. Đây là chỗ gọn nhất để đẩy mọi lỗi về công cụ monitoring, thay vì lặp lại `onError` ở từng boundary.

**Stack dễ đọc hơn khi dev.** `captureOwnerStack()` trả về owner stack, cho biết component nào đã tạo ra component bị lỗi, chứ không chỉ vị trí của nó trong cây. Hàm này chỉ có ở môi trường development, nên hãy kiểm tra trước khi gọi và đừng trông vào nó trong log production.

**Server Components và Next.js.** Error boundary dùng state của class, nên boundary phải là Client Component (`"use client"`). Nó vẫn bọc được Server Component truyền vào qua children. Trong Next.js App Router, phần lớn thời gian bạn có boundary nhờ quy ước file: file `error.tsx` đặt cạnh `page.tsx` trở thành boundary cho route segment đó, và nó cũng phải là Client Component. `global-error.tsx` đóng vai boundary ở gốc.

## Khi nào nên dùng, khi nào không

Nên dùng error boundary:

- Luôn có ở gốc, để crash không bao giờ đồng nghĩa với trang trắng.
- Quanh từng route, để một trang không làm hỏng điều hướng.
- Quanh các widget độc lập và component của bên thứ ba, nhất là những thứ render dữ liệu từ xa.
- Cùng với `Suspense` cho dữ liệu fetch bằng `use` hoặc thư viện hỗ trợ Suspense.

Đừng dựa vào nó cho:

- Lỗi validation và những thất bại đã lường trước ("email đã được dùng"). Đó là trạng thái bình thường, hiện ngay tại chỗ.
- Lỗi trong event handler hay timer, trừ khi bạn chủ động chuyển lên bằng `showBoundary`.
- Che giấu bug. Boundary giữ cho app dùng được, nó không sửa được gì cả. Luôn ghi log những gì nó bắt.

## Những lỗi hay gặp

1. **Chỉ có một boundary toàn cục.** Nó chặn được trang trắng, nhưng lỗi nào cũng thay cả giao diện bằng fallback. Thêm boundary theo route và theo widget.
2. **Thử lại mà không fetch lại.** Reset boundary trong khi cache vẫn giữ lỗi thì chỉ hiện lại fallback. Hãy reset cả nguồn dữ liệu (`QueryErrorResetBoundary`, một promise mới, một key mới).
3. **Quên reset khi điều hướng.** Boundary kẹt ở trạng thái lỗi sau khi user đổi route hay đổi bộ lọc sẽ hiện lỗi cũ. Dùng `resetKeys` hoặc một `key` gắn với route.
4. **Fallback cũng ném lỗi.** Nếu fallback đọc `error.response.data.message` mà `response` là undefined, chính fallback crash và lỗi nổi lên boundary cha. Giữ fallback thật đơn giản.
5. **Nuốt lỗi trong im lặng.** Boundary không có `onError` và root không có `onCaughtError` sẽ biến bug production thành những ô "Thử lại" không ai thấy.

## Bài tập

Task của repo, chỉnh lại một chút:

1. Làm trang sản phẩm với ba phần: Chi tiết sản phẩm, Đánh giá và Gợi ý. Bọc mỗi phần trong error boundary riêng với thông báo fallback riêng.
2. Cho một phần ném lỗi ngẫu nhiên. Thêm nút "Thử lại" chỉ render lại đúng phần bị lỗi, không tải lại trang và không dùng một boundary toàn cục duy nhất.
3. Bonus: ghi log component stack bằng `componentDidCatch`, và cho mỗi phần một nội dung fallback khác nhau.

Bài mình thêm:

4. Thay boundary tự viết bằng `react-error-boundary`, rồi chuyển phần ghi log sang `createRoot(..., { onCaughtError, onUncaughtError })`. So sánh code ghi log nằm ở đâu trước và sau.
5. Chuyển phần Đánh giá sang fetch theo kiểu Suspense (`use` hoặc `useSuspenseQuery`) và đảm bảo "Thử lại" thật sự gửi request mới.

## Video và source code

- Video: [This One React Pattern Can Save Your App From Crashing](https://youtu.be/0qxF4jb-eUg)
- Source code: [day-15 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-15)

Chương này dựa trên Day 15 trong series "15 Days of React Design Patterns" của tapaScript (Tapas Adhikary), được mình viết lại bằng TypeScript và cập nhật cho React 19.
