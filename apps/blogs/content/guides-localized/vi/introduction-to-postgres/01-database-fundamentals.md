---
title: "Hiểu nguyên tắc cơ bản về cơ sở dữ liệu"
description: 'Nguyên tắc cơ bản về cơ sở dữ liệu dành cho nhà phát triển: cơ sở dữ liệu quan hệ giải quyết vấn đề gì, bảng, hàng và cột ánh xạ tới dữ liệu của bạn như thế nào cũng như lý do tính toàn vẹn và ACID lại quan trọng.'
order: 1
---

**TLDR**: Cơ sở dữ liệu lưu trữ và sắp xếp dữ liệu để các ứng dụng có thể tìm thấy dữ liệu đó một cách nhanh chóng. Cơ sở dữ liệu quan hệ như PostgreSQL sử dụng các bảng có hàng và cột, thực thi mối quan hệ giữa dữ liệu và đảm bảo tính toàn vẹn của dữ liệu. Chúng xử lý quyền truy cập đồng thời, hỗ trợ các truy vấn phức tạp và ngăn ngừa mất dữ liệu tốt hơn các tệp hoặc bộ lưu trữ đơn giản.

Trước khi đi sâu vào PostgreSQL cụ thể, bạn cần hiểu cơ sở dữ liệu giải quyết được những gì và tại sao cơ sở dữ liệu quan hệ lại trở thành tiêu chuẩn cho hầu hết các ứng dụng.

## Cơ sở dữ liệu giải quyết vấn đề gì?

Hãy tưởng tượng việc xây dựng một ứng dụng blog. Bạn có thể lưu trữ bài viết trong tệp văn bản:

```
posts/
  post-1.txt
  post-2.txt
  post-3.txt
```

Điều này hoạt động cho đến khi bạn cần:

- Tìm tất cả bài viết của một tác giả cụ thể
- Hiển thị bài viết được sắp xếp theo ngày
- Đếm xem mỗi bài viết có bao nhiêu bình luận
- Xử lý nhiều người dùng viết bài cùng một lúc
- Đảm bảo bạn không bao giờ mất dữ liệu nếu máy chủ gặp sự cố

Hệ thống tập tin không được xây dựng cho những tác vụ này. Cuối cùng bạn sẽ viết mã tới:

- Phân tích mọi tập tin để tìm kiếm tác giả
- Theo dõi mối quan hệ giữa bài viết và bình luận
- Khóa tập tin để hai người dùng không ghi đè lên những thay đổi của nhau
- Thực hiện cơ chế sao lưu và phục hồi

Cơ sở dữ liệu giải quyết những vấn đề này. Chúng được xây dựng đặc biệt để lưu trữ, truy vấn và quản lý dữ liệu một cách đáng tin cậy.

## Khái niệm cơ sở dữ liệu quan hệ

Cơ sở dữ liệu quan hệ tổ chức dữ liệu dưới dạng bảng, tương tự như bảng tính nhưng có quy tắc nghiêm ngặt.

### Bảng, Hàng và Cột

Một bảng chứa dữ liệu về một loại sự vật. Một hàng đại diện cho một mục. Các cột thể hiện thuộc tính của mục đó.

```
users table:
┌────┬──────────┬─────────────────────┬─────────────────────┐
│ id │ username │ email               │ created_at          │
├────┼──────────┼─────────────────────┼─────────────────────┤
│ 1  │ alice    │ alice@example.com   │ 2024-01-15 10:23:00 │
│ 2  │ bob      │ bob@example.com     │ 2024-01-16 14:45:00 │
│ 3  │ carol    │ carol@example.com   │ 2024-01-17 09:12:00 │
└────┴──────────┴─────────────────────┴─────────────────────┘

posts table:
┌────┬─────────┬────────────────────┬─────────────────────┐
│ id │ user_id │ title              │ created_at          │
├────┼─────────┼────────────────────┼─────────────────────┤
│ 1  │ 1       │ Hello World        │ 2024-01-15 11:00:00 │
│ 2  │ 1       │ PostgreSQL Basics  │ 2024-01-16 10:30:00 │
│ 3  │ 2       │ My First Post      │ 2024-01-17 15:20:00 │
└────┴─────────┴────────────────────┴─────────────────────┘
```

Mỗi bảng có các cột với các kiểu dữ liệu cụ thể. Cột `id` chứa số, `username` chứa văn bản, `created_at` chứa dấu thời gian. Cơ sở dữ liệu thực thi các loại này - bạn không thể vô tình đặt ngày vào cột tên người dùng.

### Khóa chính

Mỗi bảng cần một cách để xác định duy nhất mỗi hàng. Đây là khóa chính.

Trong các ví dụ trên, `id` là khóa chính. Không có hai người dùng có thể có cùng một id. Nếu bạn nói "lấy người dùng có id 1", cơ sở dữ liệu sẽ biết chính xác bạn muốn nói đến hàng nào.

Khóa chính phải là:
- Duy nhất (không trùng lặp)
- Không rỗng (mỗi hàng phải có một hàng)
- Không thay đổi (không thay đổi khóa chính của hàng)

Hầu hết các bảng đều sử dụng số nguyên tăng tự động cho khóa chính nhưng bạn có thể sử dụng các giá trị khác như UUID hoặc khóa tự nhiên (địa chỉ email, mã sản phẩm).

### Khóa ngoại

Các bảng liên kết với nhau thông qua khóa ngoại. các `posts` bảng có một `user_id` cột tham chiếu đến `users` cái bàn `id`.

```
     users                                posts
┌────────────────┐                  ┌──────────────────┐
│ id (PK)        │<─────────────────│ user_id (FK)     │
│ username       │                  │ id (PK)          │
│ email          │                  │ title            │
└────────────────┘                  └──────────────────┘
```

Mối quan hệ này có nghĩa là:
- Mỗi bài viết thuộc về một người dùng
- Người dùng có thể có nhiều bài viết
- Cơ sở dữ liệu có thể xác minh rằng mọi `user_id` trong bài đăng đều trỏ đến người dùng thực

Nếu bạn cố gắng xóa một người dùng có bài đăng, cơ sở dữ liệu có thể ngăn chặn việc đó hoặc xếp tầng xóa các bài đăng liên quan. Điều này duy trì tính toàn vẹn tham chiếu - không có dữ liệu mồ côi.

### Mối quan hệ

Các bảng kết nối theo ba cách:

**One-to-Many**: Một người dùng có nhiều bài đăng. Mối quan hệ phổ biến nhất.

```
User (1) ──────< Posts (many)
```

**Many-to-Many**: Bài viết có nhiều tag, tag áp dụng cho nhiều bài viết. Yêu cầu một bảng phép JOIN.

```
Posts >────┬────< Tags
           │
      post_tags
```

**One-to-One**: Một người dùng có một hồ sơ. Ít phổ biến hơn, đôi khi được sử dụng để chia các bảng lớn.

```
User (1) ────── Profile (1)
```

## Cơ sở dữ liệu quan hệ hoạt động như thế nào

Hiểu nội bộ giúp bạn sử dụng cơ sở dữ liệu một cách hiệu quả.

### Lưu trữ

PostgreSQL lưu trữ dữ liệu trong các tệp trên đĩa. Mỗi cơ sở dữ liệu là một thư mục, mỗi bảng có các tệp chứa các hàng của nó.

```
data/
└── base/
    └── 16384/          # Database ID
        ├── 16385       # Table file
        ├── 16385_fsm   # Free space map
        └── 16385_vm    # Visibility map
```

Dữ liệu được tổ chức trong các trang 8KB. Khi bạn truy vấn một bảng, PostgreSQL sẽ đọc các trang từ đĩa vào bộ nhớ (bộ đệm đệm). Sau đó, các truy vấn sẽ hoạt động với dữ liệu trong bộ nhớ, nhanh hơn nhiều.

Các thay đổi trước tiên được ghi vào Nhật ký ghi trước (WAL), sau đó được áp dụng cho các tệp dữ liệu. Điều này đảm bảo độ bền - ngay cả khi PostgreSQL gặp sự cố khi đang ghi, nó vẫn có thể phát lại WAL để khôi phục.

### Xử lý truy vấn

Khi bạn thực hiện một truy vấn, PostgreSQL:

1. **Parses** SQL để kiểm tra cú pháp
2. **Plans** cách thực hiện nó (sử dụng chỉ mục nào, thứ tự phép JOIN các bảng)
3. **Tối ưu hóa** gói dựa trên số liệu thống kê về dữ liệu của bạn
4. **Ethực thi** kế hoạch và trả về kết quả

```
SQL Query
    │
    ↓
Parser ──→ Parse Tree
    │
    ↓
Planner ──→ Query Plan
    │
    ↓
Executor ──→ Results
```

Người lập kế hoạch thật thông minh. Đối với "tìm tất cả bài viết của người dùng 123", nó có thể:

- Sử dụng chỉ mục trên `user_id` nếu có (nhanh)
- Quét toàn bộ bảng nếu không có chỉ mục (chậm đối với các bảng lớn)

Bạn có thể xem kế hoạch với `EXPLAIN`:

```sql
EXPLAIN SELECT * FROM posts WHERE user_id = 123;
```

Điều này cho thấy truy vấn có hiệu quả hay cần tối ưu hóa.

### Chỉ mục

Chỉ mục là cấu trúc dữ liệu giúp việc tra cứu nhanh chóng. Không có chỉ mục, việc tìm bài viết của người dùng 123 có nghĩa là phải đọc từng hàng.

Với chỉ số trên `user_id`:

```
Index on user_id:
┌────────┬──────────────┐
│ user_id│ row location │
├────────┼──────────────┤
│ 1      │ page 1, row 1│
│ 1      │ page 1, row 2│
│ 2      │ page 2, row 3│
│ 123    │ page 5, row 7│
│ 123    │ page 5, row 8│
└────────┴──────────────┘
```

PostgreSQL nhảy trực tiếp tới các hàng có `user_id = 123`. Đây là sự khác biệt giữa mili giây và phút trên các bảng lớn.

Chỉ mục tăng tốc độ đọc nhưng làm chậm quá trình ghi (chỉ mục phải được cập nhật). Bạn thêm chỉ mục cho các cột mà bạn thường xuyên tìm kiếm, sắp xếp hoặc nối vào.

### Giao dịch

Giao dịch nhóm nhiều hoạt động thành một đơn vị nguyên tử. Hoặc tất cả các hoạt động đều thành công hoặc tất cả đều thất bại.

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

Nếu bản cập nhật thứ hai không thành công (có thể tài khoản 2 không tồn tại), bản cập nhật đầu tiên sẽ quay trở lại. Bạn không bao giờ bị trừ tiền nhưng không được thêm vào.

Giao dịch cung cấp đảm bảo ACID:

- **Atomicity**: Tất cả hoặc không có gì
- **tính nhất quán**: Cơ sở dữ liệu di chuyển từ một cơ sở dữ liệu hợp lệ trạng thái đến người khác
- **Isolation**: Các giao dịch đồng thời không can thiệp
- **Durability**: đã commit thay đổi vẫn tồn tại sau sự cố

Những đảm bảo này giúp cơ sở dữ liệu trở nên đáng tin cậy đối với các dữ liệu quan trọng như hồ sơ tài chính, tài khoản người dùng và inventory.

## PostgreSQL so với cơ sở dữ liệu khác

Hiểu được vị trí phù hợp của PostgreSQL sẽ giúp bạn chọn công cụ phù hợp.

### PostgreSQL và MySQL

Cả hai đều là cơ sở dữ liệu quan hệ nguồn mở phổ biến.

Điểm mạnh của PostgreSQL:
- Tuân thủ các tiêu chuẩn SQL chặt chẽ hơn
- Các tính năng nâng cao hơn (mảng, JSON, tìm kiếm toàn văn)
- Xử lý tốt hơn các truy vấn phức tạp
- Nhiều tùy chọn tiện ích mở rộng hơn

Điểm mạnh của MySQL:
- Thiết lập đơn giản hơn cho các trường hợp sử dụng cơ bản
- Hiệu suất tốt hơn một chút cho khối lượng công việc đọc nhiều đơn giản
- Phổ biến hơn trong các ứng dụng PHP cũ hơn

Đối với các dự án mới, PostgreSQL thường là lựa chọn tốt hơn trừ khi bạn có các yêu cầu cụ thể về MySQL.

### PostgreSQL so với MongoDB (NoSQL)

MongoDB là cơ sở dữ liệu tài liệu lưu trữ các đối tượng giống JSON thay vì các hàng.

Sử dụng MongoDB khi:
- Schema thay đổi liên tục và không thể đoán trước
- Bạn đang lưu trữ các cấu trúc tài liệu thực sự lồng nhau
- Bạn cần chia tỷ lệ theo chiều ngang ra khỏi hộp

Sử dụng PostgreSQL khi:
- Dữ liệu có mối quan hệ rõ ràng
- Bạn cần các truy vấn và kết nối phức tạp
- Tính toàn vẹn dữ liệu là rất quan trọng
- Bạn muốn hệ sinh thái trưởng thành của SQL

Hỗ trợ JSONB của PostgreSQL làm mờ dòng này - bạn có thể lưu trữ các tài liệu JSON linh hoạt trong PostgreSQL trong khi vẫn giữ các tính năng quan hệ cho dữ liệu có cấu trúc.

### PostgreSQL và Redis

Redis là một kho lưu trữ khóa-giá trị trong bộ nhớ.

Redis dành cho:
- Bộ nhớ đệm
- Lưu trữ phiên
- Bộ đếm thời gian thực
- Tin nhắn xuất bản/phụ

PostgreSQL dành cho:
- Lưu trữ dữ liệu liên tục
- Truy vấn phức tạp
- Tính toàn vẹn trong giao dịch

Sử dụng cả hai cùng nhau - Redis cho dữ liệu nhanh tạm thời, PostgreSQL cho dữ liệu quan trọng lâu dài.

## Khi nào nên sử dụng cơ sở dữ liệu quan hệ

Cơ sở dữ liệu quan hệ như PostgreSQL vượt trội khi:

**Data có các mối quan hệ**: Người dùng có bài viết, bài viết có bình luận, bình luận có tác giả. Cơ sở dữ liệu quan hệ mô hình hóa điều này một cách tự nhiên.

**Vấn đề về tính toàn vẹn**: Giao dịch tài chính, tài khoản người dùng, inventory - dữ liệu phải chính xác và nhất quán.

**Cần truy vấn phức tạp**: "Hiển thị cho tôi 10 khách hàng hàng đầu của tháng trước theo tổng giá trị đơn hàng, được nhóm theo khu vực." SQL xử lý việc này một cách khéo léo.

**Nhiều người dùng**: Nhiều người đọc và viết đồng thời. Cơ sở dữ liệu quản lý đồng thời một cách an toàn.

**APhân tích đặc biệt**: Người dùng doanh nghiệp chạy báo cáo. Tính linh hoạt của SQL cho phép họ khám phá dữ liệu mà không cần mã tùy chỉnh.

Chúng không lý tưởng khi:

**Quy mô lớn với các mẫu truy cập đơn giản**: Hàng tỷ hàng chỉ có tra cứu khóa-giá trị. NoSQL có thể đơn giản hơn.

**Lược đồ thay đổi liên tục**: Nếu cấu trúc thay đổi hàng ngày, các kho tài liệu linh hoạt có thể phù hợp hơn (mặc dù JSONB của PostgreSQL sẽ trợ giúp ở đây).

**Hiệu suất ghi cực cao**: Ghi nhật ký hàng triệu sự kiện mỗi giây. Cơ sở dữ liệu chuỗi thời gian được tối ưu hóa cho việc này.

## Chuẩn hóa cơ sở dữ liệu

Chuẩn hóa là tổ chức dữ liệu để giảm sự dư thừa.

Không chuẩn hóa (xấu):

```
orders table:
┌────┬───────────┬────────────────┬────────────────────┐
│ id │ customer  │ customer_email │ products           │
├────┼───────────┼────────────────┼────────────────────┤
│ 1  │ Alice     │ a@example.com  │ Widget, Gadget     │
│ 2  │ Alice     │ a@example.com  │ Thing              │
│ 3  │ Bob       │ b@example.com  │ Widget             │
└────┴───────────┴────────────────┴────────────────────┘
```

Vấn đề:
- Email của Alice bị trùng lặp (nếu thay đổi thì phải cập nhật nhiều hàng)
- Sản phẩm được lưu trữ dưới dạng văn bản (không thể truy vấn từng sản phẩm một cách dễ dàng)
- Không thể thêm sản phẩm nếu không có đơn đặt hàng

Chuẩn hóa (tốt):

```
customers:
┌────┬───────────┬────────────────┐
│ id │ name      │ email          │
├────┼───────────┼────────────────┤
│ 1  │ Alice     │ a@example.com  │
│ 2  │ Bob       │ b@example.com  │
└────┴───────────┴────────────────┘

orders:
┌────┬─────────────┐
│ id │ customer_id │
├────┼─────────────┤
│ 1  │ 1           │
│ 2  │ 1           │
│ 3  │ 2           │
└────┴─────────────┘

products:
┌────┬─────────┐
│ id │ name    │
├────┼─────────┤
│ 1  │ Widget  │
│ 2  │ Gadget  │
│ 3  │ Thing   │
└────┴─────────┘

order_items:
┌──────────┬────────────┐
│ order_id │ product_id │
├──────────┼────────────┤
│ 1        │ 1          │
│ 1        │ 2          │
│ 2        │ 3          │
│ 3        │ 1          │
└──────────┴────────────┘
```

Lợi ích:
- Mỗi phần dữ liệu được lưu trữ một lần
- Dễ dàng cập nhật (thay đổi email của Alice ở một nơi)
- Có thể truy vấn sản phẩm một cách độc lập
- Duy trì tính toàn vẹn dữ liệu

Chuẩn hóa có các mức (1NF, 2NF, 3NF). Ý tưởng chính: đừng lặp lại chính mình. Lưu trữ mỗi sự kiện một lần, tham khảo nó ở nơi khác.

## SQL: Ngôn ngữ của cơ sở dữ liệu quan hệ

SQL (Ngôn ngữ truy vấn có cấu trúc) là cách bạn nói chuyện với cơ sở dữ liệu quan hệ. Nó mang tính chất khai báo - bạn mô tả những gì bạn muốn chứ không phải làm thế nào để có được nó.

Các thao tác SQL cơ bản:

```sql
-- Create a table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data
INSERT INTO users (username, email)
VALUES ('alice', 'alice@example.com');

-- Query data
SELECT username, email FROM users WHERE id = 1;

-- Update data
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- Delete data
DELETE FROM users WHERE id = 1;
```

SQL rất mạnh vì các khái niệm giống nhau có tác dụng xuyên suốt các hoạt động:

- `WHERE` lọc hàng
- `ORDER BY` sắp xếp kết quả
- `JOIN` kết hợp các bảng
- `GROUP BY` tổng hợp dữ liệu

Học SQL một lần, sử dụng nó ở mọi nơi. Cú pháp tương tự trên tất cả các cơ sở dữ liệu quan hệ.

## Hiểu cách luồng dữ liệu

Khi ứng dụng của bạn sử dụng cơ sở dữ liệu:

```
Application                PostgreSQL
    │                          │
    │  1. Connection           │
    ├─────────────────────────→│
    │                          │
    │  2. SQL Query            │
    ├─────────────────────────→│
    │                          │  3. Parse & Plan
    │                          │  4. Execute
    │                          │  5. Fetch Data
    │                          │
    │  6. Results              │
    │←─────────────────────────┤
    │                          │
    │  7. More Queries         │
    ├─────────────────────────→│
    │←─────────────────────────┤
    │                          │
    │  8. Close Connection     │
    ├─────────────────────────→│
```

Các ứng dụng thường:
1. Kết nối với cơ sở dữ liệu (thường sử dụng nhóm kết nối)
2. Gửi truy vấn SQL
3. Kết quả quá trình
4. Đóng kết nối khi hoàn tất

Nhóm kết nối sử dụng lại các kết nối thay vì tạo kết nối mới cho mỗi truy vấn. Điều này nhanh hơn nhiều.

## Điều khoản cơ sở dữ liệu chung

**Schema**: Cấu trúc cơ sở dữ liệu của bạn (bảng nào tồn tại, bảng nào có cột). Đôi khi cũng có nghĩa là một không gian tên trong cơ sở dữ liệu.

**Query**: Yêu cầu dữ liệu (câu lệnh SELECT).

**Transaction**: Một nhóm các hoạt động thực hiện cùng nhau.

**Index**: Cấu trúc dữ liệu để tra cứu nhanh.

**Constraint**: Một quy tắc được cơ sở dữ liệu thực thi (email duy nhất, tên người dùng không rỗng).

**View**: Truy vấn đã lưu trông giống như một bảng.

**Trigger**: Mã chạy tự động khi dữ liệu thay đổi.

**Quy trình lưu trữ**: hàm được lưu trữ trong cơ sở dữ liệu.

Việc hiểu những nguyên tắc cơ bản này sẽ mang lại cho bạn nền tảng để làm việc với PostgreSQL. Tiếp theo, chúng ta sẽ cài đặt PostgreSQL và kết nối với nó, xem các khái niệm này trong thực tế.
