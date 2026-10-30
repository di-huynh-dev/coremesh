---
title: "Render Props: để người gọi tự quyết định giao diện"
description: "Chia sẻ logic có state bằng cách để component giữ hành vi còn người gọi quyết định render gì, và render props còn chỗ đứng ra sao trong React 19."
order: 5
---

## Vấn đề: hai component, một bộ não copy-paste

Giả sử mình có một dashboard với hai widget nhỏ. Một cái hiển thị vị trí marker ô tô trên khung bản đồ, cái còn lại hiển thị marker xe máy. Cả hai đều cần theo dõi con trỏ chuột trong một vùng và in ra tọa độ. Phiên bản đầu tiên thường trông như thế này:

```tsx
import { useState, type MouseEvent } from "react";

export function CarTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    setPosition({ x: event.clientX, y: event.clientY });
  }

  return (
    <div className="tracker-area" onMouseMove={handlePointerMove}>
      <p>Car is at ({position.x}, {position.y})</p>
    </div>
  );
}

export function BikeTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    setPosition({ x: event.clientX, y: event.clientY });
  }

  return (
    <div className="tracker-area" onMouseMove={handlePointerMove}>
      <p>Bike is at ({position.x}, {position.y})</p>
    </div>
  );
}
```

Khác biệt thật sự chỉ nằm ở đúng một dòng JSX. Phần còn lại, từ state, event handler đến thẻ bọc ngoài, đều bị lặp. Với hai component thì chưa sao. Nhưng tới ngày có người yêu cầu đổi sang tọa độ tương đối thay vì tọa độ viewport, hoặc cần throttle cho đỡ re-render, hoặc chuyển từ mouse event sang pointer event để chạy được trên màn hình cảm ứng, thì bạn phải nhớ sửa từng bản copy. Và mỗi lần sửa, các bản copy lại lệch nhau thêm một chút.

Vấn đề sâu hơn là hai component này đang trộn hai mối quan tâm: *cách* theo dõi con trỏ (hành vi) và *hiển thị gì* với kết quả đó (giao diện). Hành vi thì giống hệt, giao diện thì khác. Điều mình muốn là viết hành vi một lần, rồi cho mỗi nơi sử dụng tự cắm giao diện của riêng nó vào.

## Pattern: trả quyền render lại cho người gọi

Render prop là một prop có giá trị là một hàm trả về JSX. Component giữ logic sẽ gọi hàm đó với dữ liệu nội bộ của nó, và cái hàm trả về chính là thứ hiện lên màn hình. Nói đơn giản: "State để mình lo, bạn chỉ cần nói mình vẽ gì với nó."

### Bước 1: tách phần hành vi dùng chung

Gom state và handler vào một component duy nhất, thêm prop `render` có kiểu rõ ràng:

```tsx
import { useState, type MouseEvent, type ReactNode } from "react";

export type PointerPosition = {
  x: number;
  y: number;
};

type PointerTrackerProps = {
  render: (position: PointerPosition) => ReactNode;
};

export function PointerTracker({ render }: PointerTrackerProps) {
  const [position, setPosition] = useState<PointerPosition>({ x: 0, y: 0 });

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    setPosition({ x: event.clientX, y: event.clientY });
  }

  return (
    <div className="tracker-area" onMouseMove={handlePointerMove}>
      {render(position)}
    </div>
  );
}
```

Kiểu `(position: PointerPosition) => ReactNode` chính là hợp đồng. Nó nói rõ cho mọi nơi sử dụng biết họ nhận được dữ liệu gì và phải trả lại cái gì.

### Bước 2: để mỗi nơi gọi tự quyết định UI

```tsx
import { PointerTracker } from "./PointerTracker";

export function VehicleDashboard() {
  return (
    <section className="dashboard">
      <PointerTracker
        render={(position) => (
          <p>Car is at ({position.x}, {position.y})</p>
        )}
      />
      <PointerTracker
        render={({ x, y }) => (
          <p className="bike-label">Bike is at ({x}, {y})</p>
        )}
      />
    </section>
  );
}
```

`CarTracker` và `BikeTracker` biến mất. Giờ sửa logic theo dõi chỉ cần làm ở một chỗ, còn thêm phương tiện thứ ba chỉ tốn ba dòng JSX.

### Bước 3: dùng `children` làm hàm render

Prop không bắt buộc phải tên là `render`. Một biến thể rất phổ biến là dùng chính `children`, đọc tự nhiên hơn vì hàm nằm giữa thẻ mở và thẻ đóng:

```tsx
import { useState, type MouseEvent, type ReactNode } from "react";
import type { PointerPosition } from "./PointerTracker";

type PointerAreaProps = {
  children: (position: PointerPosition) => ReactNode;
};

export function PointerArea({ children }: PointerAreaProps) {
  const [position, setPosition] = useState<PointerPosition>({ x: 0, y: 0 });

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    setPosition({ x: event.clientX, y: event.clientY });
  }

  return (
    <div className="tracker-area" onMouseMove={handlePointerMove}>
      {children(position)}
    </div>
  );
}
```

```tsx
<PointerArea>
  {({ x, y }) => <p>Car is at ({x}, {y})</p>}
</PointerArea>
```

Cách này hay được gọi là "function as children". Khi khai báo `children` là một hàm, TypeScript sẽ báo lỗi nếu ai đó truyền JSX thường vào, và đó chính là điều mình muốn: component này không thể chạy nếu thiếu hàm.

## Ví dụ thứ hai: list giữ việc chọn, không giữ markup

Theo dõi con trỏ là ví dụ để học. Một chỗ thực tế hơn mà render props thật sự có ích là component list xử lý hành vi như chọn item và điều hướng bằng bàn phím, còn mỗi màn hình render item theo kiểu của riêng nó. Ở chỗ làm mình dùng Ant Design khá nhiều, và cột của `Table` nhận một hàm `render` cho từng ô cũng vì đúng lý do này: table lo sort và phân trang, bạn lo một ô trông ra sao.

```tsx
import { useState, type KeyboardEvent, type ReactNode } from "react";

type ItemRenderState<TItem> = {
  item: TItem;
  isSelected: boolean;
  isActive: boolean;
  select: () => void;
};

type SelectableListProps<TItem> = {
  items: TItem[];
  getKey: (item: TItem) => string;
  onSelectionChange?: (selectedKeys: string[]) => void;
  renderItem: (state: ItemRenderState<TItem>) => ReactNode;
  renderEmpty?: () => ReactNode;
};

export function SelectableList<TItem>({
  items,
  getKey,
  onSelectionChange,
  renderItem,
  renderEmpty,
}: SelectableListProps<TItem>) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  function toggleSelection(key: string) {
    const nextKeys = selectedKeys.includes(key)
      ? selectedKeys.filter((selectedKey) => selectedKey !== key)
      : [...selectedKeys, key];
    setSelectedKeys(nextKeys);
    onSelectionChange?.(nextKeys);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, items.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === " " && items[activeIndex]) {
      event.preventDefault();
      toggleSelection(getKey(items[activeIndex]));
    }
  }

  if (items.length === 0) {
    return renderEmpty ? renderEmpty() : null;
  }

  return (
    <ul role="listbox" aria-multiselectable tabIndex={0} onKeyDown={handleKeyDown}>
      {items.map((item, index) => {
        const key = getKey(item);
        return (
          <li key={key} role="option" aria-selected={selectedKeys.includes(key)}>
            {renderItem({
              item,
              isSelected: selectedKeys.includes(key),
              isActive: index === activeIndex,
              select: () => toggleSelection(key),
            })}
          </li>
        );
      })}
    </ul>
  );
}
```

Giờ hai màn hình khác nhau có thể dùng chung toàn bộ logic bàn phím và chọn item:

```tsx
type Movie = { id: string; title: string; year: number };

export function MoviePicker({ movies }: { movies: Movie[] }) {
  return (
    <SelectableList
      items={movies}
      getKey={(movie) => movie.id}
      renderEmpty={() => <p>No movies yet.</p>}
      renderItem={({ item, isSelected, isActive, select }) => (
        <button
          type="button"
          className={isActive ? "movie-row movie-row--active" : "movie-row"}
          onClick={select}
        >
          {isSelected ? "[x]" : "[ ]"} {item.title} ({item.year})
        </button>
      )}
    />
  );
}
```

Để ý hai điểm. Component này là generic, nên `item` được suy ra đúng kiểu `Movie` mà không cần ép kiểu. Và nó nhận nhiều hơn một render prop (`renderItem`, `renderEmpty`), một cách gọn gàng để mở ra nhiều "slot", mỗi slot đều nhận được dữ liệu nội bộ.

## Render props ở năm 2026 và React 19

Nói thật: nếu bạn viết code mới hôm nay, custom hook thường là công cụ tốt hơn để chia sẻ logic. Pointer tracker khi viết thành hook sẽ là:

```tsx
import { useState, type MouseEvent } from "react";

export function usePointerPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: MouseEvent<HTMLElement>) {
    setPosition({ x: event.clientX, y: event.clientY });
  }

  return { position, handlePointerMove };
}
```

Hook đưa dữ liệu thẳng vào thân component, JSX không bị lồng thêm tầng nào, và bạn có thể kết hợp nhiều hook mà không phải xây một kim tự tháp các hàm. Đó là lý do hook (chương 7) đã thay thế phần lớn render props kể từ React 16.8.

Nhưng render props chưa chết. Chúng vẫn hợp lý khi component cần kiểm soát *ở đâu* và *khi nào* UI của người gọi được render, chứ không chỉ đưa dữ liệu ra:

- **List, table và virtualizer**: component quyết định có những dòng nào và bọc từng dòng, người gọi chỉ vẽ một dòng. `renderItem`, hàm `render` của cột và các API tương tự xuất hiện ở khắp nơi.
- **Thư viện form**: `Controller` của React Hook Form nhận prop `render`, còn `Field` của TanStack Form nhận một hàm children. Thư viện lo state và việc nối dây của field, bạn lo cái input.
- **Headless UI component** truyền state nội bộ (đang mở, đang active, đang được chọn) vào một hàm children để bạn style dựa trên đó.

Vài chi tiết của thời React 19 nên biết:

- **React Compiler**: một lời phàn nàn cũ về render props là arrow function viết inline sẽ là một hàm mới ở mỗi lần render, làm `memo` ở component nhận nó mất tác dụng. Khi bật React Compiler, các hàm inline đó được memo tự động nếu đầu vào không đổi, nên bạn hiếm khi phải tự bọc `useCallback`.
- **Server Components**: một hàm không thể được serialize để gửi từ Server Component sang Client Component. Component dùng render prop có giữ state, nên nó là Client Component (`"use client"`), và code truyền hàm vào cũng phải chạy ở client. Nếu bạn gặp lỗi kiểu không thể truyền function cho Client Component thì thường là vì vậy. Ngược lại, `children` dạng JSX thường *có thể* truyền từ Server Component, và đó thường là thiết kế tốt hơn khi người gọi không cần dữ liệu nội bộ.
- **`ref` là một prop**: từ React 19, function component nhận `ref` như một prop bình thường, nên component render prop muốn lộ ra phần tử gốc không cần `forwardRef` nữa.

## Khi nào nên dùng, khi nào không

Nên dùng render props khi:

- Component phải quyết định cấu trúc bao quanh UI của người gọi (item của list, ô của table, portal, overlay có định vị).
- Bạn muốn mở ra nhiều vùng tùy biến, vùng nào cũng truy cập được state nội bộ.
- Bạn đang viết component cho thư viện và muốn người dùng tự mang markup của họ.

Không nên dùng khi:

- Bạn chỉ cần chia sẻ dữ liệu hoặc hành vi. Custom hook đơn giản hơn, phẳng hơn và dễ test hơn.
- Người gọi không cần dữ liệu nội bộ nào. Hãy truyền `children` thường hoặc một prop slot nhận JSX.
- Bạn sắp phải lồng ba bốn render props vào nhau. "Kim tự tháp callback" đó chính là vấn đề mà hook sinh ra để giải quyết.

## Những lỗi hay gặp

1. **Gọi hook bên trong hàm render**. Hàm bạn truyền vào `render` được gọi trong lúc `PointerTracker` render, nhưng nó không phải component. Gọi `useState` trong đó sẽ gắn state vào tracker theo cách React không theo dõi ổn định được, và linter sẽ báo vi phạm Rules of Hooks. Nếu phần được render cần state riêng, hãy render một component thật từ hàm đó: `render={(position) => <CarLabel position={position} />}`.
2. **Khai báo kiểu render prop là `any` hoặc `Function`**. Như vậy là mất luôn ý nghĩa của hợp đồng. Hãy khai báo kiểu cho cả tham số lẫn giá trị trả về (`ReactNode`).
3. **Quên `key` khi render list từ render prop**. Trong `SelectableList`, key nằm ở thẻ `li` mà list sở hữu, không phải ở thứ người gọi trả về.
4. **Truyền hàm render qua ranh giới server/client**. Giữ phía người gọi trong Client Component, hoặc thiết kế lại API để nhận JSX.
5. **Tổng quát hóa quá đà**. Một component có sáu render props, mỗi cái nhận cả chục tham số, khó dùng hơn hai component đơn giản. Hãy bắt đầu với một render prop và chỉ thêm khi thật sự có nơi gọi thứ hai cần đến.

## Bài tập

1. **Toggle bằng render props** (từ bài tập gốc): viết component `Toggle` giữ state `isOpen` và gọi `children({ isOpen, open, close, toggle })`. Dùng nó một lần để render một mục accordion và một lần cho công tắc "Hiện mật khẩu".
2. **Tọa độ tương đối**: sửa `PointerTracker` để trả về tọa độ tương đối so với chính vùng của nó (gợi ý: `event.currentTarget.getBoundingClientRect()`). Kiểm tra rằng cả nhãn ô tô và xe máy đều nhận thay đổi mà không phải đụng vào chúng.
3. **Viết lại bằng hook**: cài đặt `useToggle` và `usePointerPosition`, rồi refactor các nơi gọi. Ghi lại xem bạn thấy phiên bản nào dễ đọc hơn và vì sao.
4. **Thêm `renderEmpty` và `renderFooter`** cho `SelectableList`, trong đó footer nhận số lượng item đang được chọn.

## Video và source code

- Video (Day 04): [Master the Render Props Pattern in React](https://youtu.be/tIdJj0n1mg4)
- Source code: [day-04 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-04)

Chương này dựa trên Day 04 của series "15 Days of React Design Patterns" do Tapas Adhikary (tapaScript) thực hiện, được mình viết lại bằng TypeScript, thêm ví dụ và ghi chú cho React 19.
