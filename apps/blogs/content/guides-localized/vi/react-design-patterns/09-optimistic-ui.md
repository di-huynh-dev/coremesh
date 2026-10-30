---
title: "Optimistic UI: hiển thị kết quả trước khi server xác nhận"
description: "Hiển thị kết quả thao tác ngay lập tức, rollback gọn gàng khi request lỗi, với useOptimistic và Actions của React 19."
order: 9
---

## Vấn đề: UI ngồi chờ network

Hãy nghĩ tới nút like dưới một bài viết. Người dùng bấm, nửa giây không có gì xảy ra, rồi số like mới nhích lên. Ngồi mạng công ty thì chẳng ai để ý. Nhưng trên điện thoại sóng yếu, người dùng sẽ bấm thêm lần nữa vì tưởng lần đầu bị nuốt, và thế là có hai request cùng chạy.

Phiên bản đầu tiên thường trông như này:

```tsx
import { useState } from "react";

type LikeButtonProps = {
  postId: number;
  initialLikes: number;
};

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isSaving, setIsSaving] = useState(false);

  async function handleLike() {
    setIsSaving(true);
    try {
      const result = await sendLikeToServer(postId);
      setLikes(result.likes);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button onClick={handleLike} disabled={isSaving}>
      {isSaving ? "Saving..." : `Like (${likes})`}
    </button>
  );
}
```

Về chức năng thì không sai. Vấn đề là UI "thật thà" quá mức: nó không chịu hiển thị gì cho tới khi server đồng ý. Với những thao tác gần như lúc nào cũng thành công (like, toggle, thêm comment, sắp xếp lại danh sách), sự thật thà đó làm app có cảm giác chậm hẳn. Trước React 19, cách "chữa" mà nhiều người (trong đó có mình) hay viết là tự tăng số lên, giữ bản sao giá trị cũ rồi khôi phục trong `catch`. Bấm một lần thì ổn. Bấm nhanh ba lần mà lần giữa bị lỗi thì đoạn rollback tự viết sẽ khôi phục sai snapshot, và con số lệch dần khỏi sự thật.

## Pattern: hiển thị kết quả mong đợi, tách riêng state thật

Optimistic UI nghĩa là render ngay cái mà bạn đoán server sẽ trả về, trong khi request chạy ở nền. Điểm mấu chốt không nằm ở chuyện "hiển thị sớm", mà ở việc tách bạch hai giá trị:

- **committed state**: thứ server đã xác nhận;
- **optimistic state**: committed state cộng với những thay đổi đang chờ mà bạn "đặt cược" là sẽ thành công.

Khi request thành công, bạn cập nhật committed state và lớp optimistic biến mất vì giờ hai bên đã khớp. Khi request lỗi, bạn chỉ việc bỏ thay đổi đang chờ đi. Không có gì phải "undo" bằng tay, vì bạn chưa hề đụng vào committed state.

React 19 cung cấp đúng sự tách bạch này qua `useOptimistic`:

```tsx
const [optimisticValue, addOptimistic] = useOptimistic(committedValue, reducer);
```

`optimisticValue` bằng `committedValue` khi không có Action nào đang chạy. Trong lúc một Action (hàm chạy bên trong `startTransition`, hoặc truyền vào prop `action` của form) đang diễn ra, nó bằng kết quả của việc áp các update đang chờ qua `reducer`. Khi Action kết thúc, React bỏ lớp optimistic đi và render `committedValue` tại thời điểm đó.

### Bước 1: tách committed state và optimistic state

```tsx
import { startTransition, useOptimistic, useState } from "react";

type LikeButtonProps = {
  postId: number;
  initialLikes: number;
};

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (currentLikes: number, delta: number) => currentLikes + delta,
  );

  return <button>Like ({optimisticLikes})</button>;
}
```

Dạng reducer ở đây quan trọng. Nếu `likes` (committed) thay đổi trong lúc request còn đang chờ, ví dụ một lượt like khác vừa được server trả về, React sẽ chạy lại reducer trên giá trị committed mới. Nhờ vậy cái `+1` đang chờ luôn được áp lên dữ liệu mới nhất chứ không phải một snapshot cũ.

### Bước 2: chạy optimistic update bên trong một Action

```tsx
type LikeResponse = { likes: number };

async function sendLikeToServer(postId: number): Promise<LikeResponse> {
  const response = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  if (!response.ok) {
    throw new Error("Like request failed");
  }
  return response.json();
}

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [error, setError] = useState<string | null>(null);
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (currentLikes: number, delta: number) => currentLikes + delta,
  );

  function handleLike() {
    setError(null);
    startTransition(async () => {
      addOptimisticLike(1);
      try {
        const result = await sendLikeToServer(postId);
        startTransition(() => {
          setLikes(result.likes);
        });
      } catch {
        setError("Không lưu được lượt like. Bạn thử lại nhé.");
      }
    });
  }

  return (
    <div>
      <button onClick={handleLike}>Like ({optimisticLikes})</button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
```

Đi qua từng bước:

1. `addOptimisticLike(1)` chạy trong transition, nên ngay frame tiếp theo nút đã hiển thị `likes + 1`.
2. Request chạy. Trong suốt thời gian đó giá trị optimistic được giữ nguyên.
3. Khi thành công, mình ghi con số server trả về vào committed state. `startTransition` bên trong là vì ở React 19, state update nằm sau `await` không tự động thuộc về transition bao ngoài; bọc lại giúp việc commit state và việc bỏ lớp optimistic xảy ra trong cùng một lần render, không bị nháy.
4. Khi lỗi, mình chỉ set error. Action kết thúc, React bỏ cái `+1`, số like quay về `likes` đã commit. Không cần rollback thủ công.

Để ý là mình lưu giá trị server trả về (`result.likes`) thay vì `setLikes(prev => prev + 1)`. Server mới là nguồn sự thật; nếu hai người cùng like một lúc thì số của server đúng, còn phép cộng ở client thì không.

### Một lưu ý về demo trong repo

Source của tapaScript render hai nút: một nút gọi `addOptimisticLike` thẳng trong `onClick`, nút còn lại bọc trong `startTransition`. Chính sự so sánh đó là bài học. Ở nút đầu, React log lỗi "An optimistic state update occurred outside a Transition or Action" và giá trị optimistic gần như quay về ngay lập tức, vì không có gì giữ nó lại. Optimistic update chỉ sống chừng nào còn một Action đang chờ.

## Ví dụ thứ hai: comment optimistic với form Action

Like là một con số. Comment là một danh sách, và danh sách cần một định danh tạm cho item mà server chưa tạo ra. Đây cũng là chỗ form Action phát huy tác dụng: `<form action>` vốn đã chạy trong transition, nên không cần `startTransition` nữa.

```tsx
import { useOptimistic, useState } from "react";

type Comment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  isSending?: boolean;
};

type CommentListProps = {
  postId: number;
  initialComments: Comment[];
};

async function createComment(postId: number, body: string): Promise<Comment> {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!response.ok) {
    throw new Error("Comment request failed");
  }
  return response.json();
}

export function CommentList({ postId, initialComments }: CommentListProps) {
  const [comments, setComments] = useState(initialComments);
  const [error, setError] = useState<string | null>(null);
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (current: Comment[], pending: Comment) => [...current, pending],
  );

  async function submitComment(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    setError(null);
    addOptimisticComment({
      id: `pending-${crypto.randomUUID()}`,
      author: "Bạn",
      body,
      createdAt: new Date().toISOString(),
      isSending: true,
    });

    try {
      const saved = await createComment(postId, body);
      setComments((current) => [...current, saved]);
    } catch {
      setError("Comment chưa được đăng. Bạn thử lại nhé.");
    }
  }

  return (
    <section>
      <ul>
        {optimisticComments.map((comment) => (
          <li key={comment.id} aria-busy={comment.isSending}>
            <strong>{comment.author}</strong>: {comment.body}
            {comment.isSending && <small> Đang gửi...</small>}
          </li>
        ))}
      </ul>
      {error && <p role="alert">{error}</p>}
      <form action={submitComment}>
        <textarea name="body" required />
        <button type="submit">Đăng comment</button>
      </form>
    </section>
  );
}
```

Vài chi tiết đáng nói:

- Item tạm có id dạng `pending-...` để `key` không bao giờ trùng với id thật. Khi server phản hồi, comment thật (có `id` và `createdAt` thật) được thêm vào `comments`, còn item tạm biến mất vì Action đã xong.
- `isSending` cho phép style riêng dòng đang chờ. Mình hay giảm opacity và ẩn các nút như "Sửa" hay "Xoá" trên dòng đó, vì mấy thao tác này cần id thật.
- React tự reset form uncontrolled sau khi Action thành công, nên textarea tự trống.
- Nếu muốn nút submit hiển thị trạng thái pending, tách nó ra component con và dùng `useFormStatus`, hoặc chuyển sang `useActionState` khi Action cần trả về kết quả, ví dụ thông báo validate.

## Năm 2026 / React 19

Optimistic UI không phải khái niệm mới, nhưng cách viết nó trong React thì đã khác. Tình hình hiện tại:

- **`useOptimistic` + Actions là con đường có sẵn.** Trước React 19 bạn hoặc tự viết logic snapshot và rollback, hoặc giao cho thư viện data. Giờ primitive cốt lõi nằm ngay trong React, và nó kết hợp tự nhiên với `<form action>`, `useActionState` và `useFormStatus`.
- **Server Functions.** Trong Next.js và các framework RSC khác, Action truyền vào form có thể là một Server Function (`"use server"`). Phần optimistic vẫn phải nằm trong Client Component, vì `useOptimistic` là hook và cần `"use client"`. Cách tổ chức hay gặp: một Server Component fetch danh sách, và một client component nhỏ giữ form cùng lớp optimistic.
- **TanStack Query vẫn có cách riêng.** Nếu data nằm trong cache của Query, optimistic update thường đi qua mutation: hoặc render `mutation.variables` khi `isPending` (cách đơn giản), hoặc cập nhật cache trong `onMutate` rồi khôi phục trong `onError`. Ở dự án mình hay chọn cách của Query khi cùng một dữ liệu xuất hiện ở nhiều chỗ trên màn hình, vì cập nhật cache là cập nhật tất cả; còn `useOptimistic` chỉ có tác dụng trong một cây component.
- **Committed value phải thay đổi thì optimistic value mới "ở lại".** Đây là chỗ cần đổi tư duy: `useOptimistic` không lưu gì cả. Nếu nhánh thành công quên cập nhật state thật (hoặc revalidate dữ liệu server), UI sẽ quay về giá trị cũ khi Action kết thúc, dù request thực ra đã thành công.

## Khi nào nên dùng, khi nào không

Nên dùng optimistic UI khi:

- thao tác gần như luôn thành công (like, bookmark, toggle, sắp xếp lại, gửi tin nhắn chat);
- người dùng dễ nhìn thấy và hiểu được khi có rollback;
- bạn đoán được kết quả server đủ chính xác để render.

Nên tránh, hoặc cẩn thận, khi:

- thao tác tốn kém hoặc không thể đảo ngược (thanh toán, đặt hàng, xoá tài khoản). Hãy hiển thị trạng thái pending thật sự;
- server tính ra giá trị mà bạn không đoán được (giá sau giảm giá, slug được sinh tự động);
- lỗi xảy ra thường xuyên, ví dụ khi validate chỉ có ở server. Hiện kết quả rồi rút lại còn tệ hơn bắt người dùng chờ.

## Những lỗi hay gặp

1. **Gọi optimistic setter ngoài Action.** Console báo lỗi và giá trị bật về ngay. Bọc trong `startTransition` hoặc gọi từ form/Action prop.
2. **Không cập nhật committed state khi thành công.** Giá trị optimistic vốn là tạm thời. Hãy set state, revalidate hoặc refresh router sau khi request thành công.
3. **Lỗi im lặng.** React tự bỏ thay đổi optimistic, nhưng không nói cho người dùng biết vì sao comment của họ biến mất. Luôn hiển thị lỗi (toast, thông báo inline) và giữ lại nội dung để họ thử lại.
4. **Id tạm yếu.** Dùng index hoặc `Date.now()` làm key cho item đang chờ dễ gây trùng key và remount khi item thật tới. Hãy dùng id tách biệt rõ ràng như `pending-<uuid>`.
5. **Chồng nhiều optimistic update mà không có reducer.** Nếu truyền giá trị thẳng thay vì reducer, vài lần bấm nhanh sẽ ghi đè lên nhau. Có reducer thì mỗi action đang chờ được áp theo đúng thứ tự.

## Bài tập

1. **Comment optimistic với fake server** (từ task của repo). Dùng fake API (json-server hoặc MSW) cho `GET /api/posts/:id/comments`. Hiển thị comment mới ngay lập tức với nhãn "Đang gửi...", thay bằng item từ server (có `id` và `createdAt` thật) khi thành công, và xoá nó kèm toast lỗi khi thất bại.
2. **Làm lỗi hiện rõ.** Cho fake server lỗi ngẫu nhiên 20% số request như demo trong repo. Bấm nút like năm lần thật nhanh và kiểm tra con số cuối cùng có khớp với server không.
3. **Toggle thay vì counter.** Biến nút like thành toggle like/unlike với `useOptimistic(isLiked, (_, next: boolean) => next)`. Điều gì nên xảy ra nếu người dùng bấm hai lần trước khi request đầu tiên trả về?
4. **So sánh với TanStack Query.** Viết lại danh sách comment bằng `useMutation` và render `mutation.variables` khi đang pending. Ghi lại xem phiên bản nào dễ giữ đồng bộ hơn khi số comment còn hiển thị ở header.

## Video và source code

- Video (Day 08): [MASTER Optimistic UI Pattern in React 19 || useOptimistic Hook](https://youtu.be/x03yX-yNxas)
- Source code: [day-08 trên GitHub](https://github.com/tapascript/15-days-of-react-design-patterns/tree/main/day-08)

Chương này dựa trên Day 08 của series "15 Days of React Design Patterns" của tapaScript (Tapas Adhikary), phát hành theo giấy phép Apache-2.0; cảm ơn anh vì bài giảng và code demo gốc.
