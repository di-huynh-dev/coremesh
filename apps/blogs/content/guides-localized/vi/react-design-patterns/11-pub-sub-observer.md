---
title: "Pub-Sub và Observer: giao tiếp giữa các component ở xa nhau"
description: "Cho các component ở xa nhau phản ứng với sự kiện mà không prop drilling: event bus có type, hook subscribe, broadcast giữa các tab, và khi nào nên dùng store."
order: 11
---

## Vấn đề: hai component lẽ ra không nên biết nhau

Một trang thương mại điện tử có nút "Thêm vào giỏ" nằm sâu trong lưới sản phẩm, và một cart badge trên header. Chúng nằm ở hai nhánh hoàn toàn khác nhau của cây component. Khi bấm nút, badge phải cập nhật.

Giải pháp đầu tiên đa số chúng ta viết là đưa state lên component cha chung gần nhất rồi truyền xuống:

```tsx
import { useState } from "react";

type CartItem = { id: string; name: string };

export function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  function addToCart(item: CartItem) {
    setCartItems((current) => [...current, item]);
  }

  return (
    <>
      <Header cartCount={cartItems.length} />
      <ProductPage onAddToCart={addToCart} />
    </>
  );
}

function ProductPage({ onAddToCart }: { onAddToCart: (item: CartItem) => void }) {
  return <ProductGrid onAddToCart={onAddToCart} />;
}

function ProductGrid({ onAddToCart }: { onAddToCart: (item: CartItem) => void }) {
  return <ProductCard onAddToCart={onAddToCart} />;
}
```

Chạy được, nhưng nhìn lại xem chuyện gì đã xảy ra. `ProductPage` và `ProductGrid` giờ phải cầm một callback mà chúng chẳng dùng, chỉ để chuyền tiếp. Mỗi lần bấm, `App` re-render, kéo theo cả trang. Và khi một phần thứ ba của app cũng muốn biết có món vừa được thêm vào giỏ (một toast, một tracker analytics, một drawer "vừa thêm"), bạn lại kéo thêm một chuỗi prop nữa. Nút bấm và badge bị dính chặt với nhau qua mọi component nằm giữa.

Context bỏ được drilling, nhưng không bỏ được việc phụ thuộc vào một cấu trúc state chung, và mọi consumer đều re-render khi value thay đổi. Nhiều khi thứ bạn thật sự cần đơn giản hơn nhiều: nút bấm thông báo "có món vừa được thêm", ai quan tâm thì tự phản ứng.

## Pattern: Observer và Pub-Sub

Hai pattern này hay bị dùng như từ đồng nghĩa. Chúng có liên quan nhưng không giống nhau, và hiểu được chỗ khác biệt giúp bạn chọn đúng công cụ.

**Observer.** Một *subject* giữ danh sách các *observer* và báo trực tiếp cho chúng khi có thay đổi. Observer biết mình đang theo dõi subject nào, vì chính nó subscribe vào subject đó: `store.subscribe(listener)`. Một store, một DOM element với `addEventListener`, một `ResizeObserver`: tất cả đều là subject.

**Pub-Sub (publish/subscribe).** Có một *broker* (event bus, channel) đứng giữa. Publisher gửi message lên một *topic* có tên; subscriber lắng nghe topic. Publisher và subscriber hoàn toàn không biết nhau, chúng chỉ biết broker và tên topic.

Tóm lại: Observer là "theo dõi cái này", còn Pub-Sub là "nghe loại message này, ai gửi cũng được". Bản thân React nghiêng về Observer: `useSyncExternalStore`, Redux, Zustand hay cache của TanStack Query đều là subject để component subscribe vào. Pub-Sub hợp với các sự kiện kiểu bắn rồi quên, khi publisher không có state để chia sẻ mà chỉ có tin để báo.

Ví dụ giỏ hàng ở trên rất hợp với Pub-Sub. Mình làm từng bước.

### Bước 1: event bus có type

Repo dùng một `Map` từ tên sự kiện tới một `Set` các handler. Mình giữ nguyên cấu trúc đó nhưng thêm một type mô tả các sự kiện, để mỗi topic có payload xác định và gõ sai tên sự kiện thành lỗi lúc compile.

```tsx
export type AppEvents = {
  "cart:add": { id: string; name: string };
  "notification:show": { kind: "success" | "error" | "warning"; message: string };
};

export type EventName = keyof AppEvents;
export type EventHandler<K extends EventName> = (payload: AppEvents[K]) => void;

type PublishOptions = { broadcast?: boolean };

type HandlerRegistry = { [K in EventName]?: Set<EventHandler<K>> };

const handlers: HandlerRegistry = {};
let crossTabChannel: BroadcastChannel | null = null;

function handlersFor<K extends EventName>(eventName: K): Set<EventHandler<K>> {
  const existing = handlers[eventName];
  if (existing) return existing;
  const created = new Set<EventHandler<K>>();
  handlers[eventName] = created;
  return created;
}

export const eventBus = {
  subscribe<K extends EventName>(eventName: K, handler: EventHandler<K>) {
    handlersFor(eventName).add(handler);
    return () => {
      handlersFor(eventName).delete(handler);
    };
  },

  publish<K extends EventName>(
    eventName: K,
    payload: AppEvents[K],
    { broadcast = true }: PublishOptions = {},
  ) {
    handlersFor(eventName).forEach((handler) => handler(payload));
    if (broadcast) {
      crossTabChannel?.postMessage({ eventName, payload });
    }
  },
};
```

Hai quyết định thiết kế đáng để ý. `subscribe` trả về chính hàm unsubscribe, cắm thẳng được vào cleanup của `useEffect`. Còn `publish` gọi handler đồng bộ; không có hàng đợi, không có replay. Nếu lúc sự kiện bắn ra không ai nghe thì sự kiện đó mất luôn.

### Bước 2: hook để subscribe từ component

`useEvent` trong repo subscribe trong một effect với dependency `[eventName, handler]`. Vì nơi gọi truyền vào arrow function inline, handler là hàm mới sau mỗi lần render, nên hook unsubscribe rồi subscribe lại sau mỗi lần render. Vẫn chạy, nhưng lãng phí và dễ sai. React 19.2 có đúng công cụ cho việc này: `useEffectEvent`, cho phép effect gọi handler mới nhất mà không cần liệt kê nó trong dependency.

```tsx
import { useEffect, useEffectEvent } from "react";
import { eventBus, type EventHandler, type EventName } from "./eventBus";

export function useEvent<K extends EventName>(eventName: K, handler: EventHandler<K>) {
  const onEvent = useEffectEvent(handler);

  useEffect(() => {
    return eventBus.subscribe(eventName, (payload) => onEvent(payload));
  }, [eventName]);
}
```

Giờ mỗi tên sự kiện chỉ tạo subscription một lần, và nó luôn gọi handler mới nhất nên không bao giờ thấy state cũ.

### Bước 3: publisher

```tsx
import { eventBus } from "../lib/eventBus";

type Product = { id: string; name: string };

type AddToCartButtonProps = { product: Product };

export function AddToCartButton({ product }: AddToCartButtonProps) {
  function handleClick() {
    eventBus.publish("cart:add", { id: product.id, name: product.name });
  }

  return <button onClick={handleClick}>Thêm vào giỏ</button>;
}
```

Nút bấm không có prop callback nào và không biết ai đang nghe.

### Bước 4: subscriber

```tsx
import { useState } from "react";
import { useEvent } from "../hooks/useEvent";

type CartItem = { id: string; name: string };

export function CartBadge() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEvent("cart:add", (item) => {
    setItems((current) => [...current, item]);
  });

  return (
    <div>
      <span aria-label="Số món trong giỏ">Giỏ hàng: {items.length}</span>
      <ul>
        {items.map((item, position) => (
          <li key={`${item.id}-${position}`}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

Hai chỗ sửa nhỏ so với demo: functional update `setItems((current) => ...)` không phụ thuộc vào `items` bị capture, và key kết hợp id với vị trí vì cùng một sản phẩm có thể được thêm hai lần (demo chỉ dùng `item.id`, nên sinh ra key trùng).

Giờ `App` chỉ còn là layout. Muốn thêm một toast phản ứng với `cart:add` thì chỉ cần một lần gọi `useEvent` trong component toast, không đụng gì ở chỗ khác.

### Bước 5: broadcast giữa các tab trình duyệt

Repo còn đi thêm một bước: khi người dùng thêm món ở một tab, các tab khác đang mở cũng cập nhật theo. Nó dùng API `BroadcastChannel`, API này gửi message tới mọi context khác cùng origin đang nghe cùng tên channel. Mẹo nằm ở chỗ tránh vòng lặp: message nhận từ tab khác phải được publish lại ở local *mà không* broadcast tiếp.

```tsx
export function connectCrossTab(channelName = "app-events") {
  if (typeof BroadcastChannel === "undefined" || crossTabChannel) {
    return () => {};
  }

  const channel = new BroadcastChannel(channelName);
  crossTabChannel = channel;

  channel.onmessage = (event: MessageEvent<{ eventName: EventName; payload: unknown }>) => {
    const { eventName, payload } = event.data;
    eventBus.publish(eventName, payload as AppEvents[typeof eventName], { broadcast: false });
  };

  return () => {
    channel.close();
    crossTabChannel = null;
  };
}
```

Demo mở channel ngay khi module được load, qua một import có side effect trong `main.jsx`. Mình thích một hàm tường minh được gọi từ effect ở root hơn, để nó không bao giờ chạy lúc server render và có thể cleanup:

```tsx
import { useEffect } from "react";
import { connectCrossTab } from "./lib/eventBus";

export function EventBridge() {
  useEffect(() => connectCrossTab(), []);
  return null;
}
```

Một `BroadcastChannel` không nhận message do chính nó gửi, nên tab gốc không bị nhận trùng. Lưu ý chỉ dữ liệu structured-cloneable mới đi qua được giữa các tab: object thường thì được, function và instance của class thì không.

## Ví dụ thứ hai: Observer với `useSyncExternalStore`

Badge ở trên có một điểm yếu. State của nó nằm trong subscriber, nên component mount muộn hơn (ví dụ một cart drawer được mở sau khi đã thêm ba món) sẽ bắt đầu từ số 0. Sự kiện là tin tức, không phải state. Khi nhiều component cần *đọc giá trị hiện tại*, thứ bạn cần là Observer: một store giữ state và báo cho subscriber.

React có sẵn một hook làm đúng việc subscribe vào subject như vậy:

```tsx
import { useSyncExternalStore } from "react";

type CartItem = { id: string; name: string };
type Listener = () => void;

function createCartStore() {
  let items: CartItem[] = [];
  const listeners = new Set<Listener>();

  return {
    getSnapshot: () => items,
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    add(item: CartItem) {
      items = [...items, item];
      listeners.forEach((listener) => listener());
    },
    clear() {
      items = [];
      listeners.forEach((listener) => listener());
    },
  };
}

export const cartStore = createCartStore();

export function useCartItems(): CartItem[] {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getSnapshot);
}
```

Component nào cũng có thể gọi `useCartItems()` và nhận danh sách hiện tại, kể cả khi mount muộn. `getSnapshot` trả về cùng một tham chiếu mảng cho tới khi có thay đổi, chính điều này giúp React không re-render thừa. Tham số thứ ba là snapshot phía server, dùng khi SSR và hydrate.

Hai pattern này kết hợp với nhau cũng rất tốt. Một cách tổ chức hay gặp trong app thật: store giữ giỏ hàng (Observer), đồng thời store publish sự kiện `cart:add` lên bus để các tính năng không liên quan như analytics hay toast phản ứng mà không cần import store (Pub-Sub).

Nếu thấy store này quen quen thì đúng rồi: nó là một Zustand thu nhỏ. Zustand, Redux hay Jotai đều cài đặt Observer trên `useSyncExternalStore` hoặc thứ tương đương.

## Năm 2026 / React 19

- **State dùng chung thì dùng store có thể observe, đừng dùng event bus.** Trong công việc hằng ngày, client state của mình nằm ở Zustand, server state nằm ở TanStack Query. Cả hai bên dưới đều là Observer. Mình sẽ không dựng lại chúng bằng sự kiện.
- **Pub-Sub dành cho sự kiện, không phải dữ liệu.** Toast, analytics, "session hết hạn, đăng xuất mọi nơi", đồng bộ giữa các tab, báo cho một micro-frontend rằng có chuyện vừa xảy ra. Đây là những chỗ một bus có type vẫn là câu trả lời gọn nhất.
- **`useEffectEvent` đã stable từ React 19.2.** Đây là cách đúng để subscribe với handler cần đọc props hay state mới nhất mà không phải subscribe lại. Trước đó mọi người dùng ref để giữ handler mới nhất.
- **Context hay Pub-Sub.** Context dành cho giá trị mà một cây con cần đọc (theme, user hiện tại, locale). Khi value đổi, mọi consumer re-render. Bus chỉ giao message cho các handler đã subscribe topic đó, và chỉ gây render ở nơi handler set state.
- **Server Components.** Bus là singleton chỉ dành cho client. Component nào gọi `useEvent` hoặc publish từ event handler đều cần `"use client"`. Thêm nữa, ở server một singleton cấp module được dùng chung giữa các request, nên đừng bao giờ giữ dữ liệu riêng của từng user trong đó khi SSR.

## Khi nào nên dùng, khi nào không

Nên dùng Pub-Sub khi:

- publisher có tin cần báo, chứ không có state cần chia sẻ;
- nhiều tính năng không liên quan cùng phản ứng với một sự kiện;
- bạn cần vượt qua ranh giới mà props không với tới: tab trình duyệt, iframe, micro-frontend, code không phải React.

Nên tránh khi:

- dữ liệu có "giá trị hiện tại" mà component mount muộn cũng cần. Hãy dùng store;
- cha và con nói chuyện với nhau. Props và callback dễ theo dõi hơn;
- bạn có ý định dùng nó cho mọi thứ. Một codebase mà mọi tương tác đều là sự kiện thì rất khó debug, vì câu hỏi "ai đã đổi cái này?" không còn câu trả lời trong cây component.

## Những lỗi hay gặp

1. **Quên unsubscribe.** Mỗi lần `subscribe` mà không cleanup là một lần rò rỉ bộ nhớ, và một handler có thể set state trên component đã unmount. Luôn return hàm unsubscribe từ effect.
2. **Mong sự kiện được phát lại.** Component mount sau khi sự kiện đã bắn sẽ không bao giờ thấy nó. Nếu subscriber đến muộn vẫn cần dữ liệu thì đó là state; hãy đưa vào store.
3. **Handler cũ hoặc subscribe liên tục.** Liệt kê handler inline trong dependency của effect thì subscribe lại mỗi lần render; bỏ ra thì bị capture state cũ. Dùng `useEffectEvent`.
4. **Topic là string không có type.** `"cart:add"` với `"cart-add"` là loại bug fail trong im lặng. Hãy định nghĩa type cho các sự kiện.
5. **Vòng lặp broadcast.** Khi publish lại message nhận từ tab khác, truyền một cờ để nó không bị broadcast tiếp.

## Bài tập

1. **Hệ thống notification** (từ task của repo). Viết `eventBus` và `useEvent`, vài nút publisher bắn notification, và một subscriber `NotificationPanel`.
2. **Phân loại và tự ẩn** (từ task của repo). Hỗ trợ `success`, `error`, `warning`, thêm nút đóng, và tự ẩn sau vài giây. Đảm bảo timer được huỷ khi notification bị đóng sớm.
3. **Lưu trữ** (từ task của repo). Lưu notification vào `localStorage`. Tự hỏi: giờ notification là sự kiện hay state? Refactor panel đọc từ một store nhỏ qua `useSyncExternalStore`, và chỉ giữ bus cho việc "hiển thị cái này".
4. **Đăng xuất giữa các tab.** Publish sự kiện `session:expired` và cho mọi tab đang mở chuyển về trang đăng nhập.
5. **Đếm số lần render.** Làm cart badge theo ba cách: lift state, context và bus. Dùng Profiler của React DevTools ghi lại component nào render sau mỗi lần bấm "Thêm vào giỏ".

## Video và source code

- Video (Day 10): [Pub-Sub vs Observer in React: Deep Dive, Architecture & Working Demo](https://www.youtube.com/watch?v=ociC3llkLHk)
- Source code: [day-10 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-10)

Chương này dựa trên Day 10 của series "15 Days of React Design Patterns" của tapaScript (Tapas Adhikary), phát hành theo giấy phép Apache-2.0; cảm ơn anh vì bài giảng và code demo gốc.
