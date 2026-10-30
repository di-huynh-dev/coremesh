---
title: "Facade Pattern: một cửa vào cho logic rối"
description: "Giấu nhiều hook và business rule sau một custom hook trả về giá trị sẵn sàng cho UI, để component chỉ còn việc render."
order: 15
---

## Vấn đề: component phải tự điều phối mọi thứ

Một trang dashboard hiếm khi chỉ cần một loại dữ liệu. Nó cần biết user đã đăng nhập chưa, user là ai, được phép làm gì, và tính năng nào đang bật cho họ. Mỗi thứ đã có hook riêng, nên component gọi hết:

```tsx
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { usePermissions } from "@/hooks/usePermissions";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export function Dashboard() {
  const { isAuthenticated, logout } = useAuth();
  const { user, isLoading: isUserLoading } = useUser();
  const { permissions, isLoading: isPermissionsLoading } = usePermissions();
  const { flags } = useFeatureFlags();

  if (isUserLoading || isPermissionsLoading) return <p>Đang tải...</p>;
  if (!isAuthenticated) return <p>Vui lòng đăng nhập</p>;

  const canEdit =
    permissions?.includes("EDIT_DASHBOARD") && user?.status === "active" && !user?.isReadOnlyTenant;
  const showBeta = flags?.enableBetaDashboard === true && user?.plan !== "free";

  return (
    <div>
      <h1>Xin chào {user?.name}</h1>
      {canEdit && <button>Chỉnh sửa dashboard</button>}
      {showBeta && <p>Đã bật tính năng beta</p>}
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}
```

Nhìn riêng thì không có gì đáng lo. Rắc rối bắt đầu khi một component thứ hai, ví dụ header, cũng cần `canEdit`. Ai đó copy biểu thức qua, quên mất điều kiện `isReadOnlyTenant`, và giờ header hiện nút sửa trong khi dashboard lại ẩn. Business rule ("ai được sửa") đang sống trong file JSX, bị nhân bản và lệch dần nhau.

Còn những cái giá âm thầm hơn. Component biết hình dạng bên trong của bốn hook khác nhau: permissions là mảng string, flags nằm lồng trong `flags`, hai hook báo loading riêng. Đổi tên một field là phải đi lùng khắp các trang. Test dashboard thì phải mock bốn module chỉ để kiểm tra một cái nút có hiện hay không.

## Pattern: một cửa chính cho cả hệ thống phức tạp

Facade là một interface đơn giản đặt trước một hệ thống con phức tạp. Thuật ngữ này cũng đến từ cuốn sách của Gang of Four, và hình ảnh của nó là mặt tiền tòa nhà: khách chỉ thấy một lối vào gọn gàng, không thấy đường ống bên trong.

Trong React, facade gần như luôn là một **custom hook**:

1. Gọi các hook cấp thấp hơn.
2. Kết hợp và suy ra giá trị từ chúng (trạng thái loading, quy tắc phân quyền, flag).
3. Chỉ trả về đúng thứ UI cần, bằng ngôn ngữ của UI: `canEditDashboard` chứ không phải `permissions`.

Component khi đó chỉ còn một dependency và không còn business logic.

### Bước 1: giữ nguyên các hook cấp thấp

Mỗi hook bên dưới chỉ làm một việc. Trong repo chúng là mock rất nhỏ, còn trong app thật có thể là wrapper quanh TanStack Query hay một store Zustand. Kiểu của chúng:

```tsx
export type User = {
  id: string;
  name: string;
  status: "active" | "suspended";
  plan: "free" | "pro" | "enterprise";
  isReadOnlyTenant: boolean;
};

export type Permission = "EDIT_DASHBOARD" | "VIEW_BILLING" | "MANAGE_USERS";

export declare function useAuth(): { isAuthenticated: boolean; logout: () => void };
export declare function useUser(): { user: User | undefined; isLoading: boolean };
export declare function usePermissions(): { permissions: Permission[] | undefined; isLoading: boolean };
export declare function useFeatureFlags(): { flags: { enableBetaDashboard?: boolean } | undefined };
```

Mình không đụng vào chúng. Facade nằm ở tầng trên.

### Bước 2: viết facade hook

```tsx
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { usePermissions } from "@/hooks/usePermissions";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export type DashboardView =
  | { status: "loading" }
  | { status: "signed-out" }
  | {
      status: "ready";
      userName: string;
      canEditDashboard: boolean;
      showBetaDashboard: boolean;
      logout: () => void;
    };

export function useDashboardFacade(): DashboardView {
  const { isAuthenticated, logout } = useAuth();
  const { user, isLoading: isUserLoading } = useUser();
  const { permissions, isLoading: isPermissionsLoading } = usePermissions();
  const { flags } = useFeatureFlags();

  if (isUserLoading || isPermissionsLoading) return { status: "loading" };
  if (!isAuthenticated || !user) return { status: "signed-out" };

  const hasEditPermission = permissions?.includes("EDIT_DASHBOARD") ?? false;
  const canEditDashboard = hasEditPermission && user.status === "active" && !user.isReadOnlyTenant;
  const showBetaDashboard = (flags?.enableBetaDashboard ?? false) && user.plan !== "free";

  return {
    status: "ready",
    userName: user.name,
    canEditDashboard,
    showBetaDashboard,
    logout,
  };
}
```

Có ba quyết định đáng nói:

- **Mọi hook được gọi trước bất kỳ early return nào.** Facade vẫn là hook, nên Rules of Hooks vẫn áp dụng. Các câu `if` đứng sau tất cả lời gọi hook.
- **Giá trị trả về là một discriminated union.** Component không thể đọc `userName` khi `status` đang là `"loading"`, và TypeScript bắt buộc điều đó. Bản trong repo trả về các field phẳng (`isLoading`, `isAuthenticated`, `user`), dùng union là một nâng cấp nhỏ để loại bỏ những trạng thái không thể xảy ra.
- **UI nhận một cái tên, không nhận cả object user.** Nếu component chỉ render tên thì nó chỉ nên nhận tên.

### Bước 3: component chỉ còn việc render

```tsx
import { useDashboardFacade } from "@/features/dashboard/useDashboardFacade";

export function Dashboard() {
  const view = useDashboardFacade();

  if (view.status === "loading") return <p>Đang tải...</p>;
  if (view.status === "signed-out") return <p>Vui lòng đăng nhập</p>;

  return (
    <div>
      <h1>Xin chào {view.userName}</h1>
      {view.canEditDashboard && <button>Chỉnh sửa dashboard</button>}
      {view.showBetaDashboard && <p>Đã bật tính năng beta</p>}
      <button onClick={view.logout}>Đăng xuất</button>
    </div>
  );
}
```

So danh sách import: bốn hook còn một. Quy tắc phân quyền nằm đúng một chỗ. Test `Dashboard` chỉ cần mock một hook với ba trạng thái đơn giản. Test quy tắc thì dùng `renderHook` gọi `useDashboardFacade` rồi kiểm tra các giá trị boolean, không cần DOM.

### Những quy tắc mình theo khi viết facade

Bài học trong repo có liệt kê vài quy tắc cho facade trong React. Theo cách mình hiểu:

1. **Trả về giá trị sẵn sàng cho UI, không trả dữ liệu thô.** `hasDiscount`, không phải `cart.discounts.length > 0`.
2. **Không có JSX.** Facade trả về dữ liệu và function. Render là việc của component.
3. **Giấu nguồn dữ liệu.** Component không cần biết `userName` đến từ REST, từ store hay từ cookie.
4. **Giữ các hook cấp thấp tái sử dụng được.** Facade ghép chúng lại chứ không thay thế. Tính năng khác vẫn có thể gọi thẳng `usePermissions`.
5. **Mỗi màn hình hoặc tính năng một facade, không phải một facade cho cả app.**

## Ví dụ thứ hai: trang chi tiết đơn hàng với TanStack Query

Facade phát huy tác dụng rõ nhất khi hệ thống con là server cache. Ở công ty mình dùng TanStack Query khá nhiều, và một trang chi tiết thường cần hai query cộng một mutation. Không có facade, trang phải tự xoay xở với ba cờ loading và logic invalidate.

```tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelOrder, fetchCustomer, fetchOrder } from "@/api/orders";

const statusLabels = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
} as const;

type OrderStatus = keyof typeof statusLabels;

export function useOrderDetailsFacade(orderId: string) {
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => fetchOrder(orderId),
  });

  const customerId = orderQuery.data?.customerId;
  const customerQuery = useQuery({
    queryKey: ["customers", customerId],
    queryFn: () => fetchCustomer(customerId!),
    enabled: Boolean(customerId),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders", orderId] }),
  });

  const order = orderQuery.data;
  const status = order?.status as OrderStatus | undefined;

  return {
    isLoading: orderQuery.isPending || (Boolean(customerId) && customerQuery.isPending),
    error: orderQuery.error ?? customerQuery.error,
    title: order ? `Đơn hàng #${order.code}` : "",
    statusLabel: status ? statusLabels[status] : "",
    customerName: customerQuery.data?.fullName ?? "",
    totalText: order ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total) : "",
    canCancel: status === "pending" || status === "paid",
    isCancelling: cancelMutation.isPending,
    cancel: () => cancelMutation.mutate(),
  };
}
```

```tsx
export function OrderDetailsPage({ orderId }: { orderId: string }) {
  const order = useOrderDetailsFacade(orderId);

  if (order.isLoading) return <OrderSkeleton />;
  if (order.error) return <ErrorState message={order.error.message} />;

  return (
    <section>
      <h1>{order.title}</h1>
      <p>{order.statusLabel}</p>
      <p>Khách hàng: {order.customerName}</p>
      <p>Tổng tiền: {order.totalText}</p>
      {order.canCancel && (
        <button disabled={order.isCancelling} onClick={order.cancel}>
          {order.isCancelling ? "Đang hủy..." : "Hủy đơn"}
        </button>
      )}
    </section>
  );
}
```

Trang không biết gì về query key, dependent query hay cache invalidation. Nếu sau này backend trả luôn thông tin khách hàng trong response của đơn hàng, mình xóa query thứ hai trong facade và trang không phải đổi một dòng nào.

## Năm 2026 / React 19

**Facade là một custom hook bình thường.** Bài học trong repo có đặt câu hỏi "facade có phải một React hook bình thường không?", và câu trả lời là có. Không có API đặc biệt nào. Thứ làm nó thành facade là vai trò: nó gom và chuyển đổi, và là thứ duy nhất component nói chuyện cùng.

**React Compiler gỡ bớt phần lớn việc memoize thủ công.** Facade kiểu cũ hay bọc object trả về trong `useMemo` và mọi function trong `useCallback`, để các consumer có `memo` không bị re-render. Khi bật React Compiler, giá trị suy ra và object trả về được memoize tự động khi input không đổi. Giờ mình viết facade như code bình thường và chỉ memoize tay khi profiler bảo cần.

**Actions cũng nên nằm sau facade.** Nếu mutation là một form submit, facade có thể bọc nó bằng `useActionState` hoặc `useTransition` rồi trả ra `isPending` và `submit`. `useOptimistic` cũng hợp: facade trả về danh sách optimistic, component không cần biết có hai danh sách.

**Server Components thay đổi chỗ đặt một số facade.** Facade dạng hook chỉ chạy trong Client Component. Với App Router, phần lớn việc "ghép user, permissions và flags" có thể làm ở server bằng một async function thuần, thường nằm trong module data access layer có `import "server-only"`. Server Component `await` nó rồi truyền props sẵn sàng cho UI xuống. Vẫn là pattern đó, chỉ là không có hook: facade trở thành `getDashboardView()`. Bản hook thì giữ cho state và tương tác phía client.

**Selector là facade thu nhỏ.** Với Zustand hay `select` của TanStack Query, trả về một lát dữ liệu đã suy ra (`useCartStore((state) => state.items.length > 0)`) chính là một facade nhỏ, lại còn giới hạn re-render vào đúng thứ component đọc.

## Khi nào nên dùng, khi nào không

Nên dùng facade khi:

- Một component gọi ba hook trở lên chỉ để tính vài cái cờ.
- Cùng một business rule (phân quyền, tính giá, nhãn trạng thái) xuất hiện ở nhiều component.
- Bạn muốn component dễ test và dễ đọc với người mới vào codebase.
- Nguồn dữ liệu có khả năng thay đổi (REST sang GraphQL, client sang server).

Bỏ qua khi:

- Component chỉ dùng một hook và hiển thị dữ liệu nguyên trạng. Bọc `useUser` trong `useUserFacade` để trả về y hệt chỉ thêm một file mà không thêm giá trị.
- Các consumer cần những tập dữ liệu rất khác nhau. Một facade khổng lồ ai cũng gọi sẽ khiến mọi consumer subscribe vào mọi nguồn.

## Những lỗi hay gặp

1. **God facade.** Một `useAppFacade` trả về bốn mươi field chỉ là global store đi đường vòng. Nguồn nào đổi thì mọi consumer đều re-render. Hãy tách theo màn hình hoặc tính năng.
2. **Trả dữ liệu thô "phòng khi cần".** Trả `user` và `permissions` bên cạnh `canEdit` là mời component tự tính lại quy tắc. Chỉ trả về thứ UI đang dùng.
3. **Phá Rules of Hooks bằng early return.** Trả `{ status: "loading" }` trước khi gọi các hook còn lại sẽ làm thứ tự hook thay đổi giữa các lần render. Gọi hết hook trước, suy ra giá trị sau.
4. **Che giấu waterfall.** Facade nối các request phụ thuộc nhau có thể làm trang chậm mà không ai để ý, vì component nhìn rất gọn. Kiểm tra tab Network, prefetch hoặc fetch song song khi có thể.
5. **Để JSX trong facade.** Trả `<Badge />` từ hook là trói nó vào một thiết kế. Trả `badgeVariant: "warning"` và để component render.

## Bài tập

Từ danh sách task của repo:

1. **Profile facade.** Tạo `useProfileFacade` kết hợp thông tin user, phần trăm hoàn thiện hồ sơ và trạng thái tài khoản. Chỉ trả về field sẵn sàng cho UI như `isProfileComplete`, `completionText`, `canEditProfile`.
2. **Shopping cart facade.** Kết hợp danh sách sản phẩm trong giỏ, cách tính giá và logic giảm giá. Trả về `totalPrice`, `hasDiscount` và `checkout()`.
3. **Notifications facade (nâng cao).** Fetch thông báo, nhóm theo loại và trả về `unreadCount`. UI không bao giờ được đụng vào mảng thông báo thô.

Bài mình thêm:

4. Viết lại `useDashboardFacade` để trả về discriminated union như ở trên, và viết test `renderHook` cho từng trạng thái.
5. Chuyển các quy tắc của dashboard vào một hàm server-only `getDashboardView()` và render trang bằng Server Component. Ghi lại những phần nào vẫn cần hook phía client.

## Video và source code

- Video: [One React Pattern That Instantly Cleans Up Messy Components](https://youtu.be/25IKfl9jR7A)
- Source code: [day-14 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-14)

Chương này dựa trên Day 14 trong series "15 Days of React Design Patterns" của tapaScript (Tapas Adhikary), được mình viết lại bằng TypeScript và cập nhật cho React 19.
