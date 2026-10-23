---
title: "Các kiểu dữ liệu và ràng buộc trong PostgreSQL"
description: Tìm hiểu các kiểu dữ liệu của PostgreSQL và cách sử dụng các ràng buộc để thực thi tính toàn vẹn dữ liệu
order: 5
---

**TLDR**: Chọn loại dữ liệu thích hợp cho từng cột - INTEGER cho số nguyên, TEXT cho chuỗi, TIMESTAMP cho ngày. Sử dụng các ràng buộc (NOT NULL, UNIQUE, CHECK, FOREIGN KEY) để thực thi các quy tắc dữ liệu ở cấp cơ sở dữ liệu. Các ràng buộc ngăn chặn dữ liệu không hợp lệ vào cơ sở dữ liệu.

PostgreSQL cung cấp nhiều kiểu dữ liệu và các tùy chọn ràng buộc. Việc lựa chọn chính xác sẽ ngăn ngừa lỗi và cải thiện hiệu suất.

## Các loại số

### Số nguyên

```sql
CREATE TABLE products (
  id SERIAL,              -- Auto-incrementing 4-byte int (1 to 2 billion)
  small_count SMALLINT,   -- 2 bytes (-32K to 32K)
  regular_count INTEGER,  -- 4 bytes (-2B to 2B)
  big_count BIGINT        -- 8 bytes (-9 quintillion to 9 quintillion)
);
```

sử dụng:
- `SMALLINT` cho số lượng dưới 32.000
- `INTEGER` cho hầu hết các mục đích
- `BIGINT` cho số lượng lớn hoặc khi số nguyên có thể tăng rất lớn
- `SERIAL`, `BIGSERIAL` để tự động tăng khóa chính

### Số thập phân

```sql
CREATE TABLE finances (
  price DECIMAL(10, 2),        -- Exactly 10 digits, 2 after decimal: 12345678.90
  precise_value NUMERIC(15, 5), -- Same as DECIMAL
  approx_value REAL,           -- 4-byte floating point (6 decimal digits precision)
  scientific DOUBLE PRECISION  -- 8-byte floating point (15 decimal digits)
);
```

sử dụng:
- `DECIMAL`/`NUMERIC` kiếm tiền (giá trị chính xác)
- `REAL`/`DOUBLE PRECISION` để tính toán khoa học (xấp xỉ)

Không bao giờ sử dụng dấu phẩy động cho tiền tệ - lỗi làm tròn tích lũy.

## Các loại ký tự

```sql
CREATE TABLE texts (
  fixed_code CHAR(5),          -- Always 5 characters, padded with spaces
  variable_name VARCHAR(100),  -- Up to 100 characters
  unlimited_text TEXT          -- Unlimited length
);
```

sử dụng:
- `CHAR(n)` cho mã có độ dài cố định (mã quốc gia, cờ trạng thái)
- `VARCHAR(n)` khi bạn muốn giới hạn độ dài
- `TEXT` cho hầu hết văn bản (không có sự khác biệt về hiệu suất so với VARCHAR)

PostgreSQL xử lý cả ba một cách hiệu quả. `TEXT` thường là lựa chọn đơn giản nhất.

## Các loại ngày và giờ

```sql
CREATE TABLE events (
  event_date DATE,                    -- Just the date: 2024-02-14
  event_time TIME,                    -- Just the time: 14:30:00
  event_timestamp TIMESTAMP,          -- Date and time: 2024-02-14 14:30:00
  event_timestamptz TIMESTAMPTZ,      -- With timezone: 2024-02-14 14:30:00-05
  duration INTERVAL                   -- Time span: 2 days 3 hours
);
```

**Luôn sử dụng `TIMESTAMPTZ`** cho dấu thời gian. Nó lưu trữ theo UTC và tự động chuyển đổi sang múi giờ địa phương.

```sql
-- Set timezone
SET timezone = 'America/New_York';

INSERT INTO events (event_timestamptz)
VALUES ('2024-02-14 14:30:00');  -- Interpreted as New York time

-- Query returns in current timezone
SELECT event_timestamptz FROM events;
-- 2024-02-14 14:30:00-05

-- Change timezone
SET timezone = 'Europe/London';
SELECT event_timestamptz FROM events;
-- 2024-02-14 19:30:00+00  -- Same moment, different display
```

## Kiểu Boolean

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- Query
SELECT * FROM users WHERE is_active = TRUE;
SELECT * FROM users WHERE NOT email_verified;
```

Lưu trữ TRUE, FALSE hoặc NULL.

## Các loại JSON

PostgreSQL vượt trội về JSON:

```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  data JSON,      -- Text storage, slower
  metadata JSONB  -- Binary storage, faster, supports indexing
);

INSERT INTO documents (metadata)
VALUES ('{"name": "John", "age": 30, "tags": ["developer", "postgres"]}');

-- Query JSON
SELECT metadata->>'name' AS name FROM documents;
SELECT * FROM documents WHERE metadata->>'age' = '30';
SELECT * FROM documents WHERE metadata @> '{"tags": ["postgres"]}';
```

Sử dụng `JSONB` cho:
- Lược đồ linh hoạt
- Cấu trúc dữ liệu lồng nhau
- Phản hồi API
- Dữ liệu cấu hình

## Các kiểu mảng

PostgreSQL hỗ trợ mọi loại mảng:

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  tags TEXT[],
  view_counts INTEGER[]
);

INSERT INTO posts (title, tags, view_counts)
VALUES ('PostgreSQL Guide', ARRAY['database', 'tutorial'], ARRAY[100, 150, 200]);

-- Query arrays
SELECT * FROM posts WHERE 'database' = ANY(tags);
SELECT * FROM posts WHERE tags @> ARRAY['database'];
```

Hữu ích cho các danh sách ngắn nhưng hãy xem xét các bảng riêng biệt cho các mối quan hệ phức tạp.

## Loại UUID

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER,
  data JSONB
);
```

UUID là số nhận dạng duy nhất toàn cầu 128 bit. Tốt cho hệ thống phân tán.

## Ràng buộc

Các ràng buộc thực thi các quy tắc dữ liệu.

### KHÔNG NULL

Yêu cầu một giá trị:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  bio TEXT  -- Can be NULL
);

-- This fails
INSERT INTO users (bio) VALUES ('My bio');
-- ERROR: null value in column "username" violates not-null constraint
```

Tạo các cột KHÔNG NULL trừ khi NULL có ý nghĩa rõ ràng ("không xác định" chứ không phải "trống").

### ĐỘC ĐÁO

Ngăn chặn trùng lặp:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE
);

-- This fails
INSERT INTO users (username, email) VALUES ('alice', 'alice@example.com');
INSERT INTO users (username, email) VALUES ('alice', 'different@example.com');
-- ERROR: duplicate key value violates unique constraint
```

Tạo các ràng buộc duy nhất nhiều cột:

```sql
CREATE TABLE enrollments (
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  UNIQUE (student_id, course_id)  -- Each student can enroll once per course
);
```

### KIỂM TRA

Xác thực dữ liệu:

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  discount_percent INTEGER CHECK (discount_percent BETWEEN 0 AND 100)
);

-- This fails
INSERT INTO products (name, price, stock) VALUES ('Widget', -10.00, 5);
-- ERROR: new row violates check constraint "products_price_check"
```

Kiểm tra phức tạp:

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  CHECK (end_date >= start_date)
);
```

### MẶC ĐỊNH

Đặt giá trị mặc định:

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Status and views use defaults
INSERT INTO posts (title) VALUES ('My Post');
```

### KHÓA CHÍNH

Xác định duy nhất các hàng:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50)
);

-- Equivalent to:
CREATE TABLE users (
  id SERIAL NOT NULL UNIQUE,
  username VARCHAR(50)
);
```

Khóa chính tổng hợp:

```sql
CREATE TABLE order_items (
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  PRIMARY KEY (order_id, product_id)
);
```

### KHÓA NGOÀI

Duy trì tính toàn vẹn tham chiếu (được đề cập trong phần trước):

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

## Cột được tạo

Các giá trị được tính toán:

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  price DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(4, 3) NOT NULL DEFAULT 0.075,
  total_price DECIMAL(10, 2) GENERATED ALWAYS AS (price * (1 + tax_rate)) STORED
);

INSERT INTO products (price) VALUES (100.00);
SELECT * FROM products;
-- price: 100.00, tax_rate: 0.075, total_price: 107.50
```

Sử dụng cho các giá trị luôn được tính từ các cột khác.

## Thay đổi bảng

Thêm các ràng buộc vào các bảng hiện có:

```sql
-- Add NOT NULL
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Add UNIQUE
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Add CHECK
ALTER TABLE products ADD CONSTRAINT positive_price CHECK (price >= 0);

-- Add DEFAULT
ALTER TABLE posts ALTER COLUMN status SET DEFAULT 'draft';

-- Add column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Drop constraint
ALTER TABLE users DROP CONSTRAINT users_email_key;

-- Rename column
ALTER TABLE users RENAME COLUMN phone TO phone_number;

-- Change column type
ALTER TABLE users ALTER COLUMN age TYPE SMALLINT;
```

## Chọn đúng loại

- **IDs**: `SERIAL` hoặc `BIGSERIAL` để tự động tăng, `UUID` cho hệ thống phân tán
- **Money**: `DECIMAL(10, 2)` hoặc độ chính xác thích hợp
- **Văn bản ngắn**: `TEXT` hoặc `VARCHAR(n)` nếu bạn muốn giới hạn
- **Văn bản dài**: `TEXT`
- **Dấu thời gian**: `TIMESTAMPTZ`
- **Flags**: `BOOLEAN`
- **Dữ liệu linh hoạt**: `JSONB`
- **Số nguyên nhỏ**: `SMALLINT` nếu phạm vi bị giới hạn, nếu không thì `INTEGER`

## Các mẫu chung

### Xác thực email:

```sql
ALTER TABLE users ADD CONSTRAINT valid_email
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
```

### Các ràng buộc giống như enum:

```sql
ALTER TABLE orders ADD CONSTRAINT valid_status
  CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
```

### Số điện thoại:

```sql
-- Store as text, enforce format
ALTER TABLE users ADD CONSTRAINT valid_phone
  CHECK (phone ~ '^\+?[1-9]\d{1,14}$');
```

Các ràng buộc phát hiện lỗi sớm trước khi chúng làm hỏng dữ liệu của bạn. Sử dụng chúng một cách tự do. Tiếp theo, chúng ta sẽ khám phá các truy vấn và phép nối nâng cao - cách truy xuất dữ liệu từ nhiều bảng một cách hiệu quả.
