---
title: "Thiết kế cơ sở dữ liệu và mô hình hóa lược đồ"
description: Tìm hiểu cách thiết kế lược đồ cơ sở dữ liệu, tạo mối quan hệ và chuẩn hóa dữ liệu một cách hiệu quả
order: 4
---

**TLDR**: Thiết kế lược đồ bằng cách xác định các thực thể (người dùng, sản phẩm, đơn đặt hàng) và mối quan hệ của chúng. Sử dụng khóa chính để xác định các hàng duy nhất và khóa ngoại để liên kết các bảng. Chuẩn hóa dữ liệu để tránh trùng lặp và bất thường. Tạo lược đồ (không gian tên) để sắp xếp các bảng. Thiết kế tốt sẽ ngăn chặn các vấn đề về dữ liệu trước khi chúng xảy ra.

Thiết kế cơ sở dữ liệu xác định cách bạn lập mô hình dữ liệu của ứng dụng. Thiết kế tốt giúp truy vấn hiệu quả và ngăn chặn sự không nhất quán của dữ liệu. Thiết kế tồi dẫn đến truy vấn chậm, dữ liệu trùng lặp và các lỗi khó khắc phục.

## Suy nghĩ về các thực thể và các mối quan hệ

Bắt đầu bằng cách xác định "những thứ" mà ứng dụng của bạn theo dõi. Chúng trở thành những cái bàn.

Đối với một blog:
- Người dùng (người viết bài)
- Bài viết (nội dung người dùng tạo)
- Bình luận (phản hồi cho bài viết)
- Thẻ (danh mục bài viết)

Mỗi thực thể trở thành một bảng. Mối quan hệ giữa chúng xác định cấu trúc lược đồ của bạn.

## Khóa chính

Mỗi bảng cần có khóa chính - một cột (hoặc các cột) xác định duy nhất mỗi hàng.

### Số nguyên tự động tăng

Cách tiếp cận phổ biến nhất:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL
);
```

`SERIAL` là viết tắt của số nguyên tăng tự động. PostgreSQL tự động tạo ra các giá trị:

```sql
INSERT INTO users (username) VALUES ('alice');  -- id=1
INSERT INTO users (username) VALUES ('bob');    -- id=2
INSERT INTO users (username) VALUES ('carol');  -- id=3
```

Đơn giản và hiệu quả. Hoạt động cho hầu hết các bảng.

### UUID

Đối với hệ thống phân tán hoặc khi bạn không muốn có ID tuần tự:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL
);
```

UUID là duy nhất trên toàn cầu, vì vậy các máy chủ khác nhau có thể tạo ID mà không cần phối hợp. Sự đánh đổi là chúng lớn hơn (16 byte so với 4) và ít thân thiện với con người hơn.

### Chìa khóa tự nhiên

Đôi khi số nhận dạng trong thế giới thực hoạt động:

```sql
CREATE TABLE countries (
  code CHAR(2) PRIMARY KEY,  -- ISO country code: US, UK, FR
  name VARCHAR(100) NOT NULL
);
```

Chỉ sử dụng các phím tự nhiên khi chúng thực sự ổn định và độc đáo. Địa chỉ email có vẻ duy nhất nhưng mọi người thay đổi chúng. Mã sản phẩm hoạt động nếu chúng không bao giờ thay đổi.

## Khóa ngoại

Khóa ngoại liên kết các bảng với nhau và thực thi tính toàn vẹn tham chiếu.

### Mối quan hệ một-nhiều

Một người dùng có nhiều bài viết:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT
);
```

`REFERENCES users(id)` tạo khóa ngoại. PostgreSQL thực thi rằng mọi `user_id` trong bài đăng đều trỏ đến một người dùng thực:

```sql
-- This works - user 1 exists
INSERT INTO posts (user_id, title) VALUES (1, 'My Post');

-- This fails - user 999 doesn't exist
INSERT INTO posts (user_id, title) VALUES (999, 'Invalid');
```

Lỗi:

```
ERROR: insert or update on table "posts" violates foreign key constraint
```

### Hành động khóa ngoại

Kiểm soát điều gì xảy ra khi các hàng được tham chiếu thay đổi:

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL
);
```

Tùy chọn cho `ON DELETE`:

- `CASCADE`: Xóa bài viết khi xóa người dùng
- `SET NULL`: Đặt `user_id` thành NULL (phải cho phép NULL)
- `SET DEFAULT`: Đặt thành giá trị mặc định
- `RESTRICT` (mặc định): Ngăn chặn xóa nếu bài viết tồn tại
- `NO ACTION`: Giống như GIỚI HẠN

Tương tự cho `ON UPDATE`:

```sql
REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT
```

Chọn dựa trên mô hình dữ liệu của bạn:

```sql
-- Blog comments should disappear with posts
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT
);

-- Orders shouldn't be deleted when products change
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER
);
```

### Mối quan hệ nhiều-nhiều

Bài viết có nhiều tag, tag áp dụng cho nhiều bài viết. Sử dụng bảng nối:

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

Bảng `post_tags` liên kết các bài đăng và thẻ. Khóa chính của nó là khóa tổng hợp - sự kết hợp của cả hai ID phải là duy nhất.

Truy vấn bài viết với một thẻ cụ thể:

```sql
SELECT p.*
FROM posts p
JOIN post_tags pt ON p.id = pt.post_id
WHERE pt.tag_id = 5;
```

Nhận tất cả các thẻ cho một bài viết:

```sql
SELECT t.*
FROM tags t
JOIN post_tags pt ON t.id = pt.tag_id
WHERE pt.post_id = 10;
```

### Mối quan hệ một-một

Ít phổ biến hơn nhưng đôi khi hữu ích:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL
);

CREATE TABLE user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url VARCHAR(500)
);
```

Mỗi người dùng có nhiều nhất một hồ sơ. `user_id` vừa là khóa chính vừa là khóa ngoại.

Sử dụng từng cái một cho:
- Tách các bảng lớn để đạt hiệu suất
- Dữ liệu liên quan tùy chọn không phải hàng nào cũng cần
- Thực hiện các mẫu kế thừa

## Chuẩn hóa

Chuẩn hóa tổ chức dữ liệu để tránh dư thừa và bất thường.

### Dạng bình thường đầu tiên (1NF)

Mỗi cột chứa các giá trị nguyên tử (không thể chia được). Không có nhóm lặp lại.

Xấu:

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(100),
  products TEXT  -- "Widget, Gadget, Thing"
);
```

Vấn đề:
- Không thể truy vấn từng sản phẩm
- Không thể theo dõi số lượng
- Khó cập nhật thông tin sản phẩm

Tốt:

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(100)
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_name VARCHAR(100),
  quantity INTEGER
);
```

### Dạng thông thường thứ hai (2NF)

Không phụ thuộc một phần. Các cột không có khóa phụ thuộc vào toàn bộ khóa chính.

Xấu (đối với các phím tổng hợp):

```sql
CREATE TABLE order_items (
  order_id INTEGER,
  product_id INTEGER,
  product_name VARCHAR(100),  -- Depends only on product_id, not order_id
  quantity INTEGER,
  PRIMARY KEY (order_id, product_id)
);
```

`product_name` chỉ phụ thuộc vào `product_id` chứ không phụ thuộc vào key đầy đủ.

Tốt:

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE order_items (
  order_id INTEGER,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER,
  PRIMARY KEY (order_id, product_id)
);
```

### Dạng thông thường thứ ba (3NF)

Không có sự phụ thuộc bắc cầu. Các cột không có khóa chỉ phụ thuộc vào khóa chính.

Xấu:

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER,
  customer_name VARCHAR(100),  -- Depends on customer_id, not order id
  customer_email VARCHAR(255)
);
```

`customer_name` và `customer_email` phụ thuộc vào `customer_id`, `id`. Đó là một sự phụ thuộc bắc cầu.

Tốt:

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id)
);
```

### Khi nào cần phi chuẩn hóa

Đôi khi sao chép là ổn cho hiệu suất:

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  customer_name VARCHAR(100),  -- Denormalized for quick display
  total_amount DECIMAL(10, 2)  -- Calculated value cached here
);
```

Không chuẩn hóa khi:
- Phép JOIN quá chậm
- Dữ liệu ít khi thay đổi (tên khách hàng không thay đổi thường xuyên)
- Hiệu suất đọc quan trọng hơn hiệu suất ghi

Luôn cố ý không chuẩn hóa chứ không phải vô tình.

## Lược đồ (Không gian tên)

Các lược đồ PostgreSQL tổ chức các bảng thành các không gian tên. Đừng nhầm lẫn điều này với "lược đồ cơ sở dữ liệu" (cấu trúc bảng).

### Tạo lược đồ

```sql
-- Create schemas for different parts of your app
CREATE SCHEMA auth;
CREATE SCHEMA blog;
CREATE SCHEMA analytics;

-- Create tables in schemas
CREATE TABLE auth.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL
);

CREATE TABLE blog.posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL,
  title VARCHAR(200)
);

CREATE TABLE analytics.pageviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  url VARCHAR(500)
);
```

Truy vấn với tiền tố lược đồ:

```sql
SELECT * FROM auth.users;
SELECT * FROM blog.posts;
```

### Đường dẫn tìm kiếm

PostgreSQL tìm kiếm các lược đồ theo thứ tự. Đường dẫn tìm kiếm mặc định là `public`:

```sql
-- Show current search path
SHOW search_path;
-- "$user", public

-- Set search path
SET search_path TO auth, blog, public;

-- Now queries check auth first, then blog, then public
SELECT * FROM users;  -- Finds auth.users
```

Đặt mặc định cho cơ sở dữ liệu:

```sql
ALTER DATABASE mydb SET search_path TO auth, blog, public;
```

Sử dụng lược đồ để:
- Sắp xếp các bảng liên quan
- Mối quan tâm riêng biệt (auth, ứng dụng cốt lõi và phân tích)
- Cấp quyền cho mỗi lược đồ
- Tránh xung đột tên

## Ví dụ về lược đồ thực tế

Đây là một lược đồ thương mại điện tử hoàn chỉnh:

```sql
-- Customer management
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products catalog
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id INTEGER REFERENCES categories(id)
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders and fulfillment
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Addresses (one customer can have multiple addresses)
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  street VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50),
  country VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE
);

-- Reviews
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (product_id, customer_id)  -- One review per product per customer
);
```

Lược đồ này chứng tỏ:
- Một-nhiều (khách hàng có nhiều đơn hàng)
- Nhiều-nhiều (đơn hàng có nhiều sản phẩm thông qua order_items)
- Tự tham khảo (danh mục có thể có danh mục chính)
- Các ràng buộc về tính toàn vẹn dữ liệu
- Giá trị được tính toán (tổng_số tiền đặt hàng)

## Sơ đồ cơ sở dữ liệu

Trực quan hóa các mối quan hệ:

```
customers                orders                  products
┌──────────┐           ┌──────────┐            ┌──────────┐
│id (PK)   │<────┐     │id (PK)   │       ┌───>│id (PK)   │
│email     │     │     │customer──┼───────┘    │name      │
│name      │     └─────┤   _id(FK)│            │price     │
└──────────┘           └──────────┘            └──────────┘
                             │                       ▲
                             │                       │
                             ▼                       │
                       order_items                   │
                       ┌──────────┐                  │
                       │id (PK)   │                  │
                       │order_id  │                  │
                       │  (FK)    │                  │
                       │product_id├──────────────────┘
                       │  (FK)    │
                       │quantity  │
                       │unit_price│
                       └──────────┘
```

Hãy vẽ những thứ này trước khi viết SQL. Họ làm rõ các mối quan hệ và nắm bắt sớm các vấn đề về thiết kế.

## Các mẫu thiết kế chung

### Cột kiểm tra

Theo dõi ai đã thay đổi cái gì và khi nào:

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- Update updated_at automatically with a trigger (covered later)
```

### Xóa mềm

Giữ các bản ghi đã xóa:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50),
  deleted_at TIMESTAMP
);

-- "Delete" users
UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = 5;

-- Query only active users
SELECT * FROM users WHERE deleted_at IS NULL;
```

### Phiên bản

Theo dõi những thay đổi theo thời gian:

```sql
CREATE TABLE document_versions (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL,
  version INTEGER NOT NULL,
  title VARCHAR(200),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  UNIQUE (document_id, version)
);

-- Get latest version
SELECT * FROM document_versions
WHERE document_id = 10
ORDER BY version DESC
LIMIT 1;
```

### Hiệp hội đa hình

Một bảng tham chiếu nhiều bảng:

```sql
-- Comments on posts or photos
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  commentable_type VARCHAR(50),  -- 'post' or 'photo'
  commentable_id INTEGER,
  content TEXT
);

-- Query comments on a post
SELECT * FROM comments
WHERE commentable_type = 'post' AND commentable_id = 5;
```

Điều này vi phạm các ràng buộc khóa ngoại (không thể tham chiếu nhiều bảng). Thay vào đó, hãy xem xét các bảng riêng biệt hoặc sử dụng các tính năng kế thừa.

## Thiết kế những kiểu mẫu chống đối cần tránh

**God Tables**: Bảng có hơn 50 cột. Chia thành các bảng liên quan.

**Entity-Attribution-Value (EAV)**: Lưu trữ khóa-giá trị chung trong SQL. Thay vào đó, hãy sử dụng JSONB hoặc bám vào các cột có cấu trúc.

**Quá nhiều phép JOIN**: Nếu truy vấn cần hơn 10 liên kết, hãy xem xét lại thiết kế của bạn hoặc không chuẩn hóa.

**Sử dụng quá nhiều NULL**: NULL có nghĩa là "không xác định" chứ không phải "không" hoặc "trống". Xác định ý nghĩa rõ ràng.

**Đặt tên kém**: Sử dụng tên rõ ràng, nhất quán. `user_id` chứ không phải `uid`. `created_at` chứ không phải `cr_dt`.

## Lập kế hoạch cho lược đồ của bạn

Trước khi viết TẠO BẢNG:

1. **List các thực thể**: Ứng dụng của bạn quản lý những đối tượng nào?
2. **Xác định các thuộc tính**: Mỗi thực thể có những thuộc tính gì?
3. **DXác định mối quan hệ**: Các thực thể có liên quan như thế nào?
4. **Chọn khóa chính**: Tự nhiên hay thay thế?
5. **Thêm khóa ngoại**: Thực thi các mối quan hệ
6. **Normalize**: Xóa trùng lặp
7. **Xem xét việc không chuẩn hóa**: Chỉ dành cho các nhu cầu về hiệu suất đã được chứng minh
8. **Thêm ràng buộc**: Thực thi các quy tắc dữ liệu
9. Chỉ mục **Plan**: Dành cho các truy vấn phổ biến (sẽ đề cập sau)

Thiết kế tốt ở phía trước sẽ ngăn chặn việc di chuyển đau đớn về sau. Hãy dành thời gian để làm cho nó đúng.

Tiếp theo, chúng ta sẽ khám phá chi tiết các loại dữ liệu và ràng buộc - cách chọn loại phù hợp cho các cột của bạn và thực thi các quy tắc chất lượng dữ liệu ở cấp cơ sở dữ liệu.
