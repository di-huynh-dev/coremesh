---
title: "Vì sao React cần design pattern"
description: "Những vấn đề design pattern giải quyết trong codebase React, ôn nhanh mental model của React và bản đồ 15 pattern trong guide này."
order: 1
---

React đặt ra rất ít luật. Component là một hàm, props đi vào, JSX đi ra, còn state nằm ở bất cứ chỗ nào bạn gọi `useState`. Sự tự do đó khiến React dễ bắt đầu, nhưng cũng chính nó làm một codebase React âm thầm trở nên rối. Không có gì trong thư viện ngăn bạn nhét một lần gọi API, ba cụm state của form, một cái modal và một thuật toán sắp xếp vào cùng một component dài 400 dòng. Nó vẫn chạy, vẫn lên production, và sáu tháng sau thì không ai muốn đụng vào.

Design pattern là câu trả lời mà cộng đồng dần thống nhất. Nó không phải framework, cũng không phải bộ luật. Nó là tên gọi cho những "hình dạng" code đã được thử đi thử lại nhiều lần và vẫn đứng vững khi yêu cầu thay đổi. Guide này đi qua 15 pattern, mỗi pattern một chương, với ví dụ TypeScript viết cho React 19.

## Vấn đề: code chạy được nhưng không scale

Đây là một component mà mình đoán dev React nào cũng từng viết ít nhất một lần:

```tsx
import { useEffect, useState } from "react";

type Order = { id: string; total: number; status: "pending" | "paid" | "shipped" };

export function OrdersPage({ customerId }: { customerId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/customers/${customerId}/orders`)
      .then((response) => response.json())
      .then((data: Order[]) => setOrders(data))
      .catch(() => setError("Could not load orders"))
      .finally(() => setLoading(false));
  }, [customerId]);

  const visibleOrders =
    filter === "all" ? orders : orders.filter((order) => order.status === filter);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section>
      <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="shipped">Shipped</option>
      </select>
      <ul>
        {visibleOrders.map((order) => (
          <li key={order.id} onClick={() => { setSelectedId(order.id); setIsDialogOpen(true); }}>
            #{order.id} · {order.total}
          </li>
        ))}
      </ul>
      {isDialogOpen && selectedId && (
        <div role="dialog">
          <p>Order {selectedId}</p>
          <button onClick={() => setIsDialogOpen(false)}>Close</button>
        </div>
      )}
    </section>
  );
}
```

Xét riêng từng dòng thì không có gì sai. Vấn đề nằm ở những gì xảy ra tiếp theo. PM muốn hiện danh sách này trên trang admin nhưng style khác. Một người khác cần cái dialog ở màn hình khác nên copy nguyên khối qua. Thêm một bộ lọc nữa, rồi phân trang, rồi nút "hoàn tác" khi huỷ đơn. Mỗi thay đổi đều nhỏ, nhưng thay đổi nào cũng đụng vào cùng một file, và lần nào cũng có nguy cơ làm hỏng một thứ chẳng liên quan.

Ở những dự án mình từng làm, triệu chứng thường là:

- **Trộn lẫn trách nhiệm.** Gọi API, business rule và markup nằm chung một hàm, nên không test hay tái sử dụng riêng phần nào được.
- **Prop soup.** Một component dùng chung mọc ra cả chục boolean prop (`showHeader`, `isCompact`, `hideFooter`...) vì mỗi chỗ gọi lại cần một biến thể nho nhỏ.
- **Logic lặp lại.** Bộ ba "fetch, loading, error" bị copy qua mười component, mỗi chỗ khác nhau một chút.
- **Prop drilling.** Một giá trị bị truyền qua bốn tầng không hề quan tâm đến nó, chỉ để tới được một component lá.
- **Không rõ ai sở hữu state.** Hai component cùng nghĩ mình nắm một giá trị, rồi dần lệch nhau.
- **UX mong manh.** Một lỗi throw ra là trắng cả trang; một request chậm là UI đứng hình.

Pattern cho mỗi vấn đề trên một lời giải có tên, đã được kiểm chứng. Cái tên quan trọng không kém code: khi đồng đội nói "làm nó thành compound component" hay "đưa cái đó lên provider", cả team đều hình dung được kết quả trông như thế nào.

## Ôn nhanh mental model của React

Mọi pattern trong guide này đều dựa trên vài ý tưởng nền. Nếu bạn nắm chắc những điều dưới đây, phần còn lại sẽ đọc rất trơn.

### Component là hàm của props và state

Component nhận props, đọc state, rồi trả về mô tả của UI. React gọi lại nó mỗi khi input có thể đã đổi. Output chỉ nên phụ thuộc vào những input đó, vì vậy thân hàm phải pure: không fetch, không subscribe, không mutate gì trong lúc render.

```tsx
type GreetingProps = { name: string; unreadCount: number };

export function Greeting({ name, unreadCount }: GreetingProps) {
  return (
    <p>
      Hello {name}, you have {unreadCount} unread messages.
    </p>
  );
}
```

### State gây re-render, ref thì không

`useState` lưu một giá trị mà React theo dõi. Set nó sẽ lên lịch re-render component đó và các component con. `useRef` lưu một "cái hộp" mutable, tồn tại qua các lần render nhưng không kích hoạt render. Chương 3 xây cả một pattern dựa trên khác biệt này.

```tsx
import { useRef, useState } from "react";

export function ClickStats() {
  const [visibleCount, setVisibleCount] = useState(0);
  const silentCount = useRef(0);

  return (
    <button
      onClick={() => {
        silentCount.current += 1;
        setVisibleCount((count) => count + 1);
      }}
    >
      Clicked {visibleCount} times
    </button>
  );
}
```

### Data đi xuống, event đi lên

Component cha truyền data xuống con qua props. Con "nói chuyện" ngược lại bằng cách gọi các hàm mà cha truyền vào. Khi hai component anh em cần chung một giá trị, bạn lift state lên component cha gần nhất của cả hai. Phần lớn pattern về composition thực chất là những cách sắp xếp khéo léo luồng dữ liệu một chiều này.

### Composition thay vì configuration

`children` cũng chỉ là một prop, và JSX cũng chỉ là một giá trị. Bạn có thể truyền element, mảng element, hoặc một hàm trả về element. Đây là nền móng của compound component, slot và render props.

### Effect dùng để đồng bộ với thế giới bên ngoài

`useEffect` chạy sau khi React commit lên màn hình. Nó dành cho việc đồng bộ với những thứ nằm ngoài React: network, timer, browser API, widget của bên thứ ba. Nó không dùng để tính giá trị dẫn xuất từ props hay state; những giá trị đó cứ tính thẳng trong lúc render.

### Hook là đơn vị tái sử dụng

Từ khi có hook, logic tái sử dụng nằm trong các hàm tên `useSomething` gọi những hook khác. Nhiều pattern cũ (HOC, render props) ra đời trước khi có hook. Bạn sẽ thấy mình nhắc chuyện này khá thường xuyên, vì hiểu lý do một pattern cũ tồn tại sẽ cho bạn biết khi nào nó vẫn còn hợp lý.

## Bản đồ 15 pattern

Mình nhóm các pattern theo loại vấn đề chúng giải quyết, thay vì theo thứ tự bài học. Các chương vẫn đi theo thứ tự của series gốc, nhưng bản đồ này là cách mình nghĩ về chúng khi làm việc hằng ngày.

### Component composition

Cách chia nhỏ và lắp ghép component để mỗi mảnh chỉ làm một việc, còn nơi gọi vẫn linh hoạt.

| Pattern | Giải quyết |
| --- | --- |
| Container-Presenter | Gọi API, business logic trộn lẫn với markup |
| Compound Components | Prop soup ở những component có nhiều phần liên quan (modal, tabs, accordion) |
| Slot | Cho phép nơi gọi chèn nội dung vào các vùng có tên trong layout |
| Render Props | Chia sẻ hành vi nhưng để nơi gọi quyết định render gì |
| Higher-Order Component (HOC) | Bọc component để thêm hành vi xuyên suốt (auth, logging) |

### State và logic

State nằm ở đâu, ai sở hữu nó, và chia sẻ logic thế nào mà không làm các component dính chặt vào nhau.

| Pattern | Giải quyết |
| --- | --- |
| Controlled và Uncontrolled | Quyết định React hay DOM nắm giá trị của input |
| Custom Hooks | Logic có state bị lặp ở nhiều component |
| State Reducer | Cho phép người dùng component ghi đè cách nó cập nhật state |
| Provider | Prop drilling cho những giá trị mà nhiều component cần |
| Pub-Sub | Giao tiếp tách rời giữa các phần của app không chung cha |

### UX và khả năng chịu lỗi

Làm app có cảm giác nhanh và sống sót qua lỗi một cách nhẹ nhàng.

| Pattern | Giải quyết |
| --- | --- |
| Optimistic UI | Phải đợi server trả về mới hiện kết quả của một thao tác |
| Error Boundary | Một lỗi render làm sập cả trang |
| Performance patterns | Re-render thừa, list nặng, bundle lớn |

### Kiến trúc

Tổ chức code sao cho yêu cầu mới được "cắm" vào thay vì phải viết lại cái đang có.

| Pattern | Giải quyết |
| --- | --- |
| Strategy | Chuỗi `if/else` hay `switch` ngày càng dài cho các hành vi thay thế được cho nhau |
| Facade | Component gọi trực tiếp vào quá nhiều API và thư viện cấp thấp |

Quay lại `OrdersPage` ở trên, bạn đã có thể thấy chỗ áp dụng được vài pattern: Container-Presenter để tách phần fetch khỏi danh sách, custom hook cho logic gọi API, Compound Component cho dialog, Strategy cho các bộ lọc, và một Error Boundary bọc cả section.

## Pattern là công cụ, không phải mục tiêu

Một lời cảnh báo trước khi bắt đầu. Pattern nào cũng thêm một lớp gián tiếp. Lớp gián tiếp đáng giá khi nó xoá được một nỗi đau thật, và chỉ là chi phí khi không. Một component 30 dòng render một cái card tĩnh không cần container, presenter, context lẫn custom hook. Mình từng thấy codebase mà component nào cũng tách ra ba file "vì pattern bảo thế", và đọc còn khó hơn cái mớ hỗn độn nó thay thế.

Nguyên tắc của mình: dùng pattern khi bạn thật sự cảm thấy cái đau mà nó giải quyết, hoặc khi đang xây thứ dùng chung (design system, thư viện nội bộ) nơi cái đau đó chắc chắn sẽ tới. Còn lại thì cứ viết bản đơn giản, đợi trường hợp sử dụng thứ hai, thứ ba xuất hiện rồi hãy refactor.

Cũng nên nhớ bản thân React vẫn đang thay đổi. React 19 mang tới Actions, `useOptimistic`, `useActionState`, API `use`, `ref` là một prop bình thường, và Context có thể render trực tiếp như một provider. React Compiler giờ lo được phần lớn việc memoize. Server Components thay đổi chuyện code nào được phép dùng state hay context. Mỗi chương đều có mục "In 2026 / React 19" nói thẳng pattern đó đứng ở đâu hôm nay: có cái còn quan trọng hơn trước, có cái gần như đã được hook thay thế, và vài cái giờ đã nằm sẵn trong React.

## Cách đọc guide này

Mỗi chương có cùng một cấu trúc, nên bạn có thể đọc lướt hay đọc kỹ tuỳ ý:

1. **Vấn đề.** Một đoạn code "có mùi" nhỏ, thực tế, và lý do nó gây đau.
2. **Pattern.** Ý tưởng bằng lời đơn giản, rồi refactor từng bước đoạn code đó.
3. **Ví dụ thứ hai.** Một trường hợp thực tế khác, để thấy pattern không gắn chặt với một demo.
4. **In 2026 / React 19.** Pattern hợp với React hiện đại, Server Components và compiler ra sao.
5. **Khi nào nên dùng, khi nào không.** Các đánh đổi.
6. **Lỗi thường gặp.** Những sai lầm mình thấy nhiều nhất.
7. **Bài tập.** Vài task nhỏ để luyện. Hãy làm thật: pattern chỉ thấm khi tay bạn đã viết nó, không phải khi mắt đã đọc nó.
8. **Video và source code.** Link tới bài học gốc.

Toàn bộ code là TypeScript, dùng function component và hook. Mình giả định bạn đã biết React cơ bản (JSX, props, `useState`, `useEffect`) và một ít TypeScript. Nếu bạn mới hơn mức đó, phần ôn tập ở trên là mức tối thiểu; tài liệu chính thức ở react.dev giải thích phần còn lại rất tốt.

Bạn có thể đọc theo thứ tự, đi từ composition đơn giản lên tới kiến trúc. Hoặc nhảy thẳng tới pattern khớp với cái đau bạn đang gặp. Dù đọc kiểu nào, hãy thử mở một dự án thật bên cạnh và tự hỏi ở mỗi chương: "chỗ nào trong code của mình pattern này sẽ giúp được, và chỗ nào thì dùng nó là thừa?"

## Video và source code

Guide này dựa trên series "15 Days of React Design Patterns" của tapaScript, do Tapas Adhikary thực hiện; video và source code (giấy phép Apache-2.0) của anh là nền tảng cho mọi chương ở đây.

- Video (Day 00): [Why React Needs Design Patterns + 10-Min Crash Course](https://www.youtube.com/watch?v=OWi31QoHqNk)
- Source code: [github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-00](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-00)
