---
title: "Chỉ mục và hiệu suất truy vấn"
description: Tìm hiểu cách tạo chỉ mục và tối ưu hóa các truy vấn PostgreSQL để có hiệu suất tốt hơn
order: 7
---

**TLDR**: Lập chỉ mục tăng tốc truy vấn bằng cách tạo cấu trúc tra cứu được sắp xếp. Tạo chỉ mục trên các cột bạn thường xuyên tìm kiếm, lọc hoặc phép JOIN. Sử dụng EXPLAIN để xem các kế hoạch truy vấn. Quá nhiều chỉ mục làm chậm quá trình ghi. Lập chỉ mục các khóa ngoại và cột mệnh đề WHERE.

Không có chỉ mục, PostgreSQL quét toàn bộ bảng để tìm hàng. Với các chỉ mục, nó nhảy trực tiếp đến các hàng phù hợp.

## Hiểu chỉ mục

Chỉ mục giống như chỉ mục của một cuốn sách - thay vì đọc từng trang để tìm "PostgreSQL", bạn kiểm tra chỉ mục để biết chính xác trang nào đề cập đến nó.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert 1 million users
INSERT INTO users (email)
SELECT 'user' || n || '@example.com'
FROM generate_series(1, 1000000) n;

-- Without index: slow (scans all rows)
SELECT * FROM users WHERE email = 'user500000@example.com';

-- Create index
CREATE INDEX idx_users_email ON users(email);

-- With index: fast (direct lookup)
SELECT * FROM users WHERE email = 'user500000@example.com';
```

## Các loại chỉ mục

### Cây B (Mặc định)

Tốt cho hầu hết các trường hợp sử dụng:

```sql
CREATE INDEX idx_users_created_at ON users(created_at);

-- Works for:
SELECT * FROM users WHERE created_at = '2024-01-01';
SELECT * FROM users WHERE created_at > '2024-01-01';
SELECT * FROM users WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';
SELECT * FROM users ORDER BY created_at;
```

### Băm

Chỉ dành cho so sánh bình đẳng:

```sql
CREATE INDEX idx_users_email_hash ON users USING HASH (email);

-- Fast
SELECT * FROM users WHERE email = 'alice@example.com';

-- Doesn't use index
SELECT * FROM users WHERE email LIKE 'alice%';
```

Hiếm khi cần thiết - Cây B cũng hoạt động vì sự bình đẳng.

### GIN (Chỉ số đảo ngược tổng quát)

Đối với tìm kiếm toàn văn bản, mảng, JSONB:

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  tags TEXT[],
  metadata JSONB
);

CREATE INDEX idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX idx_posts_metadata ON posts USING GIN (metadata);

-- Fast array queries
SELECT * FROM posts WHERE tags @> ARRAY['postgres'];

-- Fast JSONB queries
SELECT * FROM posts WHERE metadata @> '{"status": "published"}';
```

### GiST (Cây tìm kiếm tổng quát)

Đối với dữ liệu hình học, tìm kiếm toàn văn, các loại phạm vi:

```sql
CREATE INDEX idx_posts_title_search ON posts USING GiST (to_tsvector('english', title));

-- Full-text search
SELECT * FROM posts WHERE to_tsvector('english', title) @@ to_tsquery('postgres');
```

## GIẢI THÍCH: Tìm hiểu kế hoạch truy vấn

GIẢI THÍCH cho thấy cách PostgreSQL thực hiện các truy vấn:

```sql
EXPLAIN SELECT * FROM users WHERE email = 'user500000@example.com';
```

Không có chỉ mục:
```
Seq Scan on users  (cost=0.00..18334.00 rows=1 width=45)
  Filter: (email = 'user500000@example.com')
```

"Quét Seq" có nghĩa là quét từng hàng. Chi phí cao.

Với chỉ số:
```
Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 width=45)
  Index Cond: (email = 'user500000@example.com')
```

"Quét chỉ mục" - sử dụng chỉ mục. Chi phí thấp hơn nhiều.

### GIẢI THÍCH PHÂN TÍCH

Thực tế chạy truy vấn và hiển thị thời gian thực:

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user500000@example.com';
```

Đầu ra:
```
Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 width=45) (actual time=0.028..0.029 rows=1 loops=1)
  Index Cond: (email = 'user500000@example.com')
Planning Time: 0.123 ms
Execution Time: 0.053 ms
```

Hiển thị chi phí ước tính và thời gian thực hiện thực tế.

## Khi nào cần tạo chỉ mục

Tạo chỉ mục cho:

**Khóa ngoại**:
```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

**Cột trong mệnh đề WHERE**:
```sql
-- If you frequently query:
SELECT * FROM orders WHERE status = 'pending';
-- Create:
CREATE INDEX idx_orders_status ON orders(status);
```

**Cột trong điều kiện THAM GIA**:
```sql
-- For:
SELECT * FROM orders o JOIN customers c ON o.customer_id = c.id;
-- Create:
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

**Các cột theo thứ tự BY**:
```sql
-- For:
SELECT * FROM posts ORDER BY created_at DESC;
-- Create:
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

## Chỉ số tổng hợp

Lập chỉ mục nhiều cột:

```sql
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);

-- Uses index efficiently
SELECT * FROM posts WHERE user_id = 123 ORDER BY created_at;

-- Also uses index (leftmost column)
SELECT * FROM posts WHERE user_id = 123;

-- Doesn't use index (missing leftmost column)
SELECT * FROM posts WHERE created_at > '2024-01-01';
```

Thứ tự cột quan trọng. Đặt các cột được sử dụng trong WHERE trước các cột chỉ được sử dụng trong ORDER BY.

## Chỉ mục một phần

Chỉ lập chỉ mục một số hàng:

```sql
-- Only index active users
CREATE INDEX idx_active_users ON users(email) WHERE deleted_at IS NULL;

-- Or only pending orders
CREATE INDEX idx_pending_orders ON orders(customer_id) WHERE status = 'pending';
```

Chỉ mục nhỏ hơn, nhanh hơn khi bạn thường xuyên truy vấn một tập hợp con.

## Chỉ mục duy nhất

Thực thi tính duy nhất và tăng tốc độ tra cứu:

```sql
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Equivalent to UNIQUE constraint
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
```

## Bảo trì chỉ mục

### Xem chỉ mục

```sql
-- List indexes on a table
\d users

-- Or:
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users';
```

### Thả chỉ mục

```sql
DROP INDEX idx_users_email;
```

### Lập chỉ mục lại

Xây dựng lại các chỉ mục (hiếm khi cần thiết):

```sql
REINDEX TABLE users;
REINDEX INDEX idx_users_email;
```

## Kỹ thuật tối ưu hóa truy vấn

### Sử dụng chỉ mục một cách khôn ngoan

```sql
-- Bad - function prevents index use
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';

-- Good - index on expression
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';

-- Or better - store lowercase
UPDATE users SET email = LOWER(email);
CREATE INDEX idx_users_email ON users(email);
SELECT * FROM users WHERE email = 'alice@example.com';
```

### Tránh CHỌN *

```sql
-- Slower
SELECT * FROM posts;

-- Faster
SELECT id, title FROM posts;
```

Chỉ tìm nạp các cột cần thiết sẽ giảm việc truyền dữ liệu.

### Sử dụng GIỚI HẠN

```sql
-- Without LIMIT, fetches all rows
SELECT * FROM posts ORDER BY created_at DESC;

-- With LIMIT, stops after 10
SELECT * FROM posts ORDER BY created_at DESC LIMIT 10;
```

### Chỉ số bao phủ

Bao gồm tất cả các cột cần thiết trong chỉ mục:

```sql
CREATE INDEX idx_posts_user_title ON posts(user_id) INCLUDE (title);

-- Index-only scan - doesn't touch table
SELECT title FROM posts WHERE user_id = 123;
```

## Các vấn đề về hiệu suất chung

### Truy vấn N+1

Xấu (trong mã ứng dụng):

```python
# Fetch users
users = query("SELECT * FROM users")

# For each user, fetch posts
for user in users:
    posts = query("SELECT * FROM posts WHERE user_id = ?", user.id)
```

Điều này chạy N+1 truy vấn (1 cho người dùng, N cho mỗi bài đăng của người dùng).

Tốt:

```python
# One query with JOIN
results = query("""
    SELECT u.*, p.*
    FROM users u
    LEFT JOIN posts p ON p.user_id = u.id
""")
```

### Mệnh đề WHERE không hiệu quả

```sql
-- Bad - scans all rows
SELECT * FROM posts WHERE EXTRACT(YEAR FROM created_at) = 2024;

-- Good - uses index
SELECT * FROM posts
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
```

### Thiếu chỉ mục trên khóa ngoại

Luôn lập chỉ mục các khóa ngoại:

```sql
ALTER TABLE posts ADD CONSTRAINT fk_posts_user
  FOREIGN KEY (user_id) REFERENCES users(id);

CREATE INDEX idx_posts_user_id ON posts(user_id);
```

## Giám sát hiệu suất truy vấn

### Pg_stat_statements

Theo dõi các truy vấn chậm:

```sql
CREATE EXTENSION pg_stat_statements;

-- View slowest queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Tự động giải thích

Đăng nhập kế hoạch truy vấn chậm:

```sql
-- In postgresql.conf or via SQL
SET auto_explain.log_min_duration = 1000;  -- Log queries over 1 second
SET auto_explain.log_analyze = true;
```

## Chiến lược lập chỉ mục thực tế

1. **Start không có chỉ mục** (ngoại trừ khóa chính và các ràng buộc duy nhất)
2. **Profile truy vấn thực** sử dụng EXPLAIN ANALYZE
3. **Thêm chỉ mục cho các truy vấn chậm** trên các cột ở WHERE, JOIN, ORDER BY
4. **Theo dõi việc sử dụng chỉ mục**:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

Các chỉ mục có `idx_scan = 0` không bao giờ được sử dụng - hãy cân nhắc việc bỏ chúng.

5. **Cân bằng hiệu suất đọc và ghi** - chỉ mục tăng tốc độ đọc nhưng làm chậm quá trình ghi

Việc lập chỉ mục phù hợp có thể biến truy vấn 10 giây thành truy vấn 10 mili giây. Tiếp theo, chúng ta sẽ khám phá các giao dịch - cách giữ dữ liệu nhất quán khi nhiều thao tác phải thành công hoặc thất bại cùng nhau.
