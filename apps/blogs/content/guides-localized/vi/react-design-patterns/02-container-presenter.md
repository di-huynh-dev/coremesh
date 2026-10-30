---
title: "Container-Presenter Pattern: tách logic khỏi giao diện"
description: "Tách gọi API và business logic khỏi phần render để component dễ đọc, dễ test, dễ tái sử dụng, và xem ý tưởng này sống tiếp ra sao với hook và Server Components."
order: 2
---

Container-Presenter thường là pattern đầu tiên mọi người học, và có lý do cả: nó nhắm thẳng vào "mùi" phổ biến nhất trong code React, một component ôm hết mọi việc. Gọi API, xử lý lỗi, state của form, business rule và markup đều nằm trong một hàm, và mỗi lần sửa một mối quan tâm là một lần có nguy cơ làm hỏng mối quan tâm khác.

## Vấn đề: một component, năm việc

Đây là trang profile người dùng viết theo kiểu "chạy được là được". Nó load user và danh sách bài viết, cho sửa profile ngay tại chỗ, và xử lý trạng thái loading lẫn lỗi.

```tsx
import { useEffect, useState } from "react";

type User = { id: number; name: string; email: string; bio: string; avatar?: string };
type Post = { id: number; title: string; content: string; createdAt: string };

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", bio: "" });

  async function loadUser() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users/${userId}`);
      const data: User = await response.json();
      setUser(data);
      setFormData({ name: data.name, email: data.email, bio: data.bio });
    } catch {
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    fetch(`${API_URL}/api/users/${userId}/posts`)
      .then((response) => response.json())
      .then(setPosts);
  }, [userId]);

  async function saveProfile() {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setUser(await response.json());
    setIsEditing(false);
  }

  if (loading) return <div className="spinner">Loading user profile...</div>;
  if (error) return <button onClick={loadUser}>{error}. Try again</button>;
  if (!user) return null;

  return (
    <div className="user-profile">
      <img src={user.avatar ?? "/default-avatar.png"} alt={`${user.name}'s avatar`} />
      {isEditing ? (
        <div>
          <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
          <button onClick={() => setIsEditing(false)}>Cancel</button>
          <button onClick={saveProfile}>Save</button>
        </div>
      ) : (
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <p>{user.bio}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}
      <h2>Recent Posts ({posts.length})</h2>
      {posts.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content.slice(0, 150)}...</p>
        </article>
      ))}
    </div>
  );
}
```

Thử đếm số lý do khiến file này phải sửa: endpoint API đổi, câu thông báo lỗi đổi, team design làm lại phần header, danh sách bài viết cần phân trang, form cần thêm validation. Năm lý do chẳng liên quan gì nhau, dồn vào một file. Đó chính là mùi.

Cái giá thực tế tới rất nhanh. Bạn không render được profile này trong Storybook nếu không mock `fetch`. Bạn không dùng lại được danh sách bài viết ở trang khác vì nó bị hàn chết với lần fetch của user này. Muốn unit test "header có hiện bio không" thì phải dựng server giả. Và khi lưu thất bại, chẳng có chỗ nào rõ ràng để hiện lỗi của form, nên nó im lặng không làm gì.

## Pattern: tách "chạy thế nào" khỏi "trông thế nào"

Ý tưởng rất đơn giản. Chia component ra làm hai loại:

- **Container**: biết *mọi thứ chạy ra sao*. Nó fetch data, giữ server state, gọi mutation, và quyết định chuyện gì xảy ra khi retry. Bản thân nó gần như không render gì; nó chỉ truyền data và callback xuống.
- **Presenter**: biết *mọi thứ trông ra sao*. Nó nhận mọi thứ qua props và render UI. Nó có thể giữ state thuần giao diện (panel đang mở hay đóng, nội dung đang gõ trong bản nháp), nhưng không bao giờ nói chuyện với API.

Hợp đồng giữa hai bên chính là kiểu của props. Viết xong kiểu đó rồi thì mỗi bên có thể thay đổi độc lập.

### Bước 1: định nghĩa hợp đồng

```tsx
export type User = { id: number; name: string; email: string; bio: string; avatar?: string };
export type Post = { id: number; title: string; content: string; createdAt: string };
export type ProfileDraft = Pick<User, "name" | "email" | "bio">;

export type UpdateResult = { ok: true } | { ok: false; error: string };

export type UserProfilePresenterProps = {
  user: User | null;
  posts: Post[];
  loading: boolean;
  error: string | null;
  onUpdateUser: (draft: ProfileDraft) => Promise<UpdateResult>;
  onRetry: () => void;
};
```

Để ý `onUpdateUser` trả về một object kết quả thay vì throw. Presenter không cần biết gì về HTTP, nó chỉ cần biết nên đóng form hay hiện thông báo lỗi.

### Bước 2: container

```tsx
import { useCallback, useEffect, useState } from "react";
import { UserProfilePresenter } from "./UserProfilePresenter";
import type { Post, ProfileDraft, UpdateResult, User } from "./types";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function UserProfileContainer({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`);
      if (!response.ok) throw new Error(response.statusText);
      setUser(await response.json());
    } catch {
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
    fetch(`${API_URL}/api/users/${userId}/posts`)
      .then((response) => response.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [userId, loadUser]);

  async function updateUser(draft: ProfileDraft): Promise<UpdateResult> {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!response.ok) throw new Error(response.statusText);
      setUser(await response.json());
      return { ok: true };
    } catch {
      return { ok: false, error: "Failed to update profile" };
    }
  }

  return (
    <UserProfilePresenter
      user={user}
      posts={posts}
      loading={loading}
      error={error}
      onUpdateUser={updateUser}
      onRetry={loadUser}
    />
  );
}
```

Ở đây đúng một JSX element. Mọi thứ liên quan tới network nằm trong file này, nên sau này đổi `fetch` sang TanStack Query hay một SDK nào đó cũng không đụng tới chỗ khác.

### Bước 3: presenter

Presenter giữ state của phần chỉnh sửa, vì "form đang mở không" và "bản nháp đang có gì" là chuyện giao diện. Data thật và hàm lưu thì nó nhận qua props.

```tsx
import { useState } from "react";
import { ErrorMessage } from "../common/ErrorMessage";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { PostsList } from "../post/PostsList";
import { ProfileHeader } from "./ProfileHeader";
import type { ProfileDraft, User, UserProfilePresenterProps } from "./types";

function toDraft(user: User): ProfileDraft {
  return { name: user.name, email: user.email, bio: user.bio };
}

export function UserProfilePresenter({
  user,
  posts,
  loading,
  error,
  onUpdateUser,
  onRetry,
}: UserProfilePresenterProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (loading) return <LoadingSpinner message="Loading user profile..." />;
  if (error) return <ErrorMessage title="Oops! Something went wrong" message={error} onRetry={onRetry} />;
  if (!user) return null;

  function startEditing(currentUser: User) {
    setDraft(toDraft(currentUser));
    setFormError(null);
    setIsEditing(true);
  }

  function changeField(field: keyof ProfileDraft, value: string) {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
    setFormError(null);
  }

  async function save() {
    if (!draft) return;
    const result = await onUpdateUser(draft);
    if (result.ok) setIsEditing(false);
    else setFormError(result.error);
  }

  return (
    <div className="user-profile">
      <ProfileHeader
        user={user}
        draft={isEditing ? draft : null}
        formError={formError}
        onStartEdit={() => startEditing(user)}
        onCancelEdit={() => setIsEditing(false)}
        onFieldChange={changeField}
        onSave={save}
      />
      <PostsList posts={posts} />
    </div>
  );
}
```

Mình copy user vào bản nháp đúng lúc bắt đầu sửa, thay vì đồng bộ bằng `useEffect` mỗi lần `user` đổi. Làm vậy bớt được một effect và cả một họ bug kiểu "form tự reset khi đang gõ".

### Bước 4: chia presenter thành các mảnh nhỏ

Presenter rất dễ ghép với nhau vì chúng chỉ nhận props. `PostsList`, `LoadingSpinner` và `ErrorMessage` giờ dùng lại được ở bất cứ đâu.

```tsx
import type { Post } from "../profile/types";

export function PostsList({ posts }: { posts: Post[] }) {
  return (
    <section className="user-posts">
      <h2>Recent Posts ({posts.length})</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="post-card">
            <h3>{post.title}</h3>
            <p>{post.content.slice(0, 150)}...</p>
            <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString()}</time>
          </article>
        ))
      )}
    </section>
  );
}
```

```tsx
type ErrorMessageProps = { title: string; message: string; onRetry: () => void };

export function ErrorMessage({ title, message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="error-container">
      <h3>{title}</h3>
      <p>{message}</p>
      <button onClick={onRetry}>Try Again</button>
    </div>
  );
}
```

`ProfileHeader` cũng theo hình dạng đó: nhận `user`, `draft`, `formError` cùng bốn callback, rồi render hoặc phần xem hoặc form. Giờ bạn có thể viết Storybook story cho từng trạng thái (loading, lỗi, xem, đang sửa, lưu thất bại) chỉ bằng cách truyền object thường.

## Ví dụ thứ hai: danh sách sản phẩm kèm giỏ hàng

Cách tách này áp dụng y hệt cho trang bán hàng. Lần này mình để container là một custom hook, cũng là cách mình hay viết nhất hiện nay.

```tsx
import { useEffect, useMemo, useState } from "react";

export type Product = { id: string; name: string; price: number; category: string };
export type SortKey = "price-asc" | "price-desc" | "name";

export function useProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products", { signal: controller.signal })
      .then((response) => response.json())
      .then(setProducts)
      .catch((reason) => {
        if (reason.name !== "AbortError") setError("Could not load products");
      });
    return () => controller.abort();
  }, []);

  const cartTotal = useMemo(
    () => products.reduce((sum, product) => sum + product.price * (cart[product.id] ?? 0), 0),
    [products, cart],
  );

  function addToCart(productId: string) {
    setCart((current) => ({ ...current, [productId]: (current[productId] ?? 0) + 1 }));
  }

  return { products, error, cart, cartTotal, addToCart };
}
```

```tsx
import { useState } from "react";
import { useProductCatalog, type Product, type SortKey } from "./useProductCatalog";

const comparators: Record<SortKey, (a: Product, b: Product) => number> = {
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

type ProductListPresenterProps = {
  products: Product[];
  cartTotal: number;
  onAddToCart: (productId: string) => void;
};

export function ProductListPresenter({ products, cartTotal, onAddToCart }: ProductListPresenterProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const sortedProducts = [...products].sort(comparators[sortKey]);

  return (
    <section>
      <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
        <option value="name">Name</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
      <ul>
        {sortedProducts.map((product) => (
          <li key={product.id}>
            {product.name} · ${product.price}
            <button onClick={() => onAddToCart(product.id)}>Add to cart</button>
          </li>
        ))}
      </ul>
      <p>Cart total: ${cartTotal.toFixed(2)}</p>
    </section>
  );
}

export function ProductListPage() {
  const { products, error, cartTotal, addToCart } = useProductCatalog();
  if (error) return <p role="alert">{error}</p>;
  return <ProductListPresenter products={products} cartTotal={cartTotal} onAddToCart={addToCart} />;
}
```

`ProductListPage` giờ là một container ba dòng. Việc sắp xếp nằm trong presenter vì đó là tuỳ chọn hiển thị; giỏ hàng nằm trong hook vì đó là state của app mà các trang khác sẽ cần.

## Năm 2026 / React 19

*Ý tưởng* tách logic khỏi phần render vẫn hữu ích như xưa. Còn *hình dạng* thì đã khác.

- **Custom hook là container mặc định.** Dan Abramov, người làm bài viết gốc trở nên phổ biến, đã thêm ghi chú từ năm 2019 rằng anh không còn khuyên chia component theo kiểu này một cách máy móc nữa, vì hook cho phép tách logic mà không cần thêm component. Thực tế mình viết `useUserProfile()` nhiều hơn hẳn `UserProfileContainer`. Presenter thì vẫn được lợi khi chỉ phụ thuộc vào props.
- **Server Components là container tự nhiên.** Trong Next.js App Router, một Server Component `async` có thể fetch data trực tiếp rồi render một Client Component làm presenter với props bình thường. Code lấy data không bao giờ bị gửi xuống trình duyệt. Chỉ presenter có tương tác mới cần `"use client"`.

```tsx
import { ProfileView } from "./ProfileView";
import { getUser, getPosts } from "@/lib/users";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
  return <ProfileView user={user} posts={posts} />;
}
```

- **Thư viện data nuốt gần hết code container.** TanStack Query hay SWR đã lo loading, lỗi, retry và cache. "Container" của bạn nhiều khi chỉ còn `const query = useQuery(...)`.
- **Mutation có thể là Action.** Với `useActionState` và `<form action>`, luồng lưu (trạng thái pending, thông báo lỗi) có thể nằm trong một hook nhỏ hoặc Server Function, thay vì `try/catch` viết tay cộng ba lần gọi `useState`.
- **React Compiler** lo việc memoize các callback truyền xuống presenter, nên hiếm khi bạn cần `useCallback` chỉ để presenter khỏi re-render.

## Khi nào nên dùng, khi nào không

Nên dùng khi:

- Cùng một UI cần được "nuôi" bởi nhiều nguồn data khác nhau (API thật, mock, Storybook, trang khác).
- Một component trộn code network với rất nhiều markup, và sửa bên này cứ làm hỏng bên kia.
- Bạn muốn có presenter trong design system để designer và QA review riêng.

Bỏ qua khi:

- Component nhỏ và chỉ dùng ở một chỗ. Một component 40 dòng với một lần fetch để nguyên là ổn.
- Một custom hook cho bạn sự tách bạch tương tự mà ít thủ tục hơn.
- Bạn sẽ có một container chỉ chuyển tiếp props y nguyên.

## Lỗi thường gặp

1. **Presenter lén truy cập data.** Một khi presenter import API client hay global store, nó hết còn tái sử dụng được. Giữ import trong presenter ở mức UI component và type.
2. **Container render layout thật.** Nếu container có div, class name và markup có điều kiện, bạn chỉ vừa dời đống lộn xộn sang chỗ khác. Container nên render một presenter, cùng lắm bọc thêm một boundary.
3. **Bùng nổ props.** Presenter nhận 20 props thì nhiều khả năng nó là vài presenter gộp lại. Tách nó ra, hoặc truyền một object có kiểu rõ ràng.
4. **Đồng bộ props vào state bằng effect.** Copy `user` vào state cục bộ bằng `useEffect` gây nháy UI và mất nội dung đang sửa. Hãy khởi tạo bản nháp trong một event (như "bắt đầu sửa") hoặc dùng `key` để reset.
5. **Theo phản xạ tách mọi thứ.** Mỗi component hai file là gấp đôi công điều hướng. Chỉ áp dụng pattern ở chỗ nó đáng.

## Bài tập

1. Xây `ProductListContainer` (hoặc hook `useProductCatalog`) lo việc fetch, quản lý giỏ hàng và xử lý lỗi. Xây `ProductListPresenter` render sản phẩm, bộ điều khiển sắp xếp và lọc, và nút thêm vào giỏ.
2. Chia presenter thành `ProductCard`, `SortFilterControls` và `CartSummary`. Kiểm tra tiêu chí: container không có JSX layout, presenter không gọi API, presenter nào cũng render được từ props thường.
3. Viết Storybook story hoặc test cho từng trạng thái của `UserProfilePresenter`: loading, lỗi, chỉ xem, đang sửa, lưu thất bại.
4. Chuyển phần fetch data của profile sang Server Component (hoặc TanStack Query) và xác nhận presenter không phải sửa gì.

## Video và source code

Chương này được viết lại từ Day 01 trong series "15 Days of React Design Patterns" của tapaScript (Tapas Adhikary); xem video để theo dõi quá trình refactor trực tiếp và lấy code gốc từ repo.

- Video: [React Container-Presenter Pattern | Code Smell to Clean Code](https://youtu.be/1UHbhikwg-s)
- Source code: [github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-01](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-01)
