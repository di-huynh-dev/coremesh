---
title: "Khái niệm cơ bản về SQL và hoạt động CRUD"
description: Tìm hiểu các lệnh SQL cơ bản để tạo, đọc, cập nhật và xóa dữ liệu trong PostgreSQL
order: 3
---

**TLDR**: Sử dụng SELECT để truy xuất dữ liệu, INSERT để thêm hàng, UPDATE để sửa đổi các hàng hiện có và DELETE để xóa hàng. Lọc bằng WHERE, sắp xếp bằng ORDER BY, giới hạn kết quả bằng LIMIT. Sử dụng hàm (COUNT, SUM, AVG) tổng hợp để tóm tắt dữ liệu. Các hoạt động này bao gồm 90% công việc cơ sở dữ liệu hàng ngày.

SQL (Ngôn ngữ truy vấn có cấu trúc) là cách bạn tương tác với PostgreSQL. Các lệnh cơ bản này cho phép bạn thao tác dữ liệu và truy xuất chính xác những gì bạn cần.

## Điều kiện tiên quyết

Tạo cơ sở dữ liệu thử nghiệm để theo dõi:

```sql
CREATE DATABASE learn_sql;
\c learn_sql

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  age INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## CHỌN: Truy xuất dữ liệu

SELECT tìm nạp dữ liệu từ các bảng. Đây là hoạt động SQL phổ biến nhất.

### CHỌN cơ bản

```sql
-- Get all columns from all rows
SELECT * FROM users;

-- Get specific columns
SELECT username, email FROM users;

-- Get distinct values (no duplicates)
SELECT DISTINCT age FROM users;
```

`*` có nghĩa là "tất cả các cột". Tránh nó trong mã production - chỉ định các cột rõ ràng để rõ ràng và hiệu suất.

### Lọc bằng WHERE

Mệnh đề WHERE lọc những hàng cần trả về:

```sql
-- Users with specific age
SELECT * FROM users WHERE age = 25;

-- Users older than 25
SELECT * FROM users WHERE age > 25;

-- Users between 18 and 30
SELECT * FROM users WHERE age BETWEEN 18 AND 30;

-- Users with names starting with 'A'
SELECT * FROM users WHERE username LIKE 'A%';

-- Multiple conditions with AND
SELECT * FROM users WHERE age > 18 AND age < 65;

-- Either condition with OR
SELECT * FROM users WHERE age < 18 OR age > 65;

-- Check for NULL
SELECT * FROM users WHERE age IS NULL;

-- Check if value in list
SELECT * FROM users WHERE age IN (18, 21, 25, 30);
```

Toán tử phổ biến:

- `=`, `!=` (hoặc `<>`): Bằng, không bằng
- `>`, `<`, `>=`, `<=`: So sánh
- `LIKE`, `ILIKE`: Khớp mẫu (ILIKE không phân biệt chữ hoa chữ thường)
- `IN`: Giá trị trong danh sách
- `BETWEEN`: Giá trị trong một phạm vi
- `IS NULL`, `IS NOT NULL`: Kiểm tra NULL

Ký tự đại diện phù hợp với mẫu:

- `%`: Số lượng ký tự bất kỳ
- `_`: Chính xác một ký tự

```sql
-- Names starting with 'Jo'
SELECT * FROM users WHERE username LIKE 'Jo%';  -- John, Joe, Joanna

-- Names with exactly 4 letters
SELECT * FROM users WHERE username LIKE '____';

-- Emails from gmail.com
SELECT * FROM users WHERE email LIKE '%@gmail.com';
```

### Sắp xếp kết quả

ĐẶT HÀNG THEO sắp xếp kết quả truy vấn:

```sql
-- Sort by age ascending (default)
SELECT * FROM users ORDER BY age;

-- Sort by age descending
SELECT * FROM users ORDER BY age DESC;

-- Sort by multiple columns
SELECT * FROM users ORDER BY age DESC, username ASC;

-- Sort by column position (1-indexed)
SELECT username, age FROM users ORDER BY 2 DESC;
```

### Giới hạn kết quả

LIMIT giới hạn số lượng hàng trả về:

```sql
-- First 10 users
SELECT * FROM users LIMIT 10;

-- Skip first 10, get next 10 (pagination)
SELECT * FROM users OFFSET 10 LIMIT 10;

-- Get oldest 5 users
SELECT * FROM users ORDER BY created_at ASC LIMIT 5;
```

Để phân trang, hãy kết hợp ORDER BY với LIMIT và OFFSET:

```sql
-- Page 1 (rows 1-10)
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 0;

-- Page 2 (rows 11-20)
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 10;

-- Page 3 (rows 21-30)
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20;
```

## CHÈN: Thêm dữ liệu

INSERT thêm hàng mới vào bảng.

### CHÈN cơ bản

```sql
-- Insert one row
INSERT INTO users (username, email, age)
VALUES ('alice', 'alice@example.com', 28);

-- Insert multiple rows at once
INSERT INTO users (username, email, age)
VALUES
  ('bob', 'bob@example.com', 32),
  ('carol', 'carol@example.com', 24),
  ('dave', 'dave@example.com', 19);
```

Bạn không cần phải chỉ định từng cột. Các cột có giá trị mặc định hoặc cho phép NULL có thể được bỏ qua:

```sql
-- id and created_at are set automatically
INSERT INTO users (username, email)
VALUES ('eve', 'eve@example.com');
```

### Trả lại dữ liệu sau khi INSERT

Nhận giá trị của các hàng được chèn bằng RETURNING:

```sql
INSERT INTO users (username, email, age)
VALUES ('frank', 'frank@example.com', 45)
RETURNING id, created_at;
```

Đầu ra:

```
 id |        created_at
----+---------------------------
  6 | 2024-02-14 14:23:11.234
```

Điều này rất hữu ích để nhận ID hoặc dấu thời gian được tạo tự động.

### Xử lý xung đột

Nếu bạn chèn một hàng vi phạm ràng buộc duy nhất:

```sql
-- This fails because alice already exists
INSERT INTO users (username, email)
VALUES ('alice', 'alice2@example.com');
```

Lỗi:

```
ERROR: duplicate key value violates unique constraint "users_username_key"
```

Sử dụng ON CONFLICT để xử lý việc này:

```sql
-- Do nothing if username already exists
INSERT INTO users (username, email, age)
VALUES ('alice', 'alice2@example.com', 29)
ON CONFLICT (username) DO NOTHING;

-- Update the row if it exists
INSERT INTO users (username, email, age)
VALUES ('alice', 'alice-new@example.com', 29)
ON CONFLICT (username)
DO UPDATE SET email = EXCLUDED.email, age = EXCLUDED.age;
```

`EXCLUDED` đề cập đến các giá trị bạn đã cố gắng chèn. Đây là "upsert" - cập nhật nếu tồn tại, chèn nếu không.

## CẬP NHẬT: Sửa đổi dữ liệu

CẬP NHẬT thay đổi các hàng hiện có.

### CẬP NHẬT cơ bản

```sql
-- Update one column
UPDATE users SET age = 29 WHERE username = 'alice';

-- Update multiple columns
UPDATE users SET email = 'newemail@example.com', age = 30
WHERE username = 'bob';

-- Update all rows (be careful!)
UPDATE users SET age = age + 1;
```

Luôn sử dụng WHERE trừ khi bạn thực sự muốn cập nhật mọi hàng. Nếu không có WHERE, UPDATE sẽ ảnh hưởng đến tất cả các hàng trong bảng.

### CẬP NHẬT với các điều kiện

```sql
-- Give everyone under 18 an age of 18
UPDATE users SET age = 18 WHERE age < 18;

-- Update based on another column
UPDATE users SET email = LOWER(email) WHERE email != LOWER(email);

-- Conditional update
UPDATE users
SET age = CASE
  WHEN age < 18 THEN 18
  WHEN age > 65 THEN 65
  ELSE age
END;
```

### Trả về các hàng đã cập nhật

Giống như INSERT, UPDATE hỗ trợ TRẢ LẠI:

```sql
UPDATE users SET age = 33 WHERE username = 'bob'
RETURNING id, username, age;
```

Điều này cho thấy những gì đã thay đổi, hữu ích cho việc ghi nhật ký hoặc xác nhận.

## DELETE: Xóa dữ liệu

DELETE xóa các hàng khỏi bảng.

### XÓA cơ bản

```sql
-- Delete specific user
DELETE FROM users WHERE username = 'alice';

-- Delete users matching criteria
DELETE FROM users WHERE age < 18;

-- Delete all rows (dangerous!)
DELETE FROM users;
```

Không bao giờ chạy DELETE mà không có WHERE trong production trừ khi bạn thực sự muốn làm trống bảng.

### Các mẫu xóa an toàn

Trước khi xóa, hãy kiểm tra những gì sẽ bị ảnh hưởng:

```sql
-- Preview what you'll delete
SELECT * FROM users WHERE age < 18;

-- If that looks right, delete
DELETE FROM users WHERE age < 18;
```

Đối với các bảng quan trọng, thay vào đó hãy sử dụng thao tác xóa mềm:

```sql
-- Add deleted_at column
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- "Delete" by setting timestamp
UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = 5;

-- Query only non-deleted users
SELECT * FROM users WHERE deleted_at IS NULL;
```

Điều này bảo tồn dữ liệu trong khi ẩn nó khỏi các truy vấn thông thường. Bạn có thể phục hồi hoặc xóa vĩnh viễn sau này.

### XÓA với TRẢ LẠI

```sql
DELETE FROM users WHERE age > 65
RETURNING username, email;
```

Hiển thị những gì bạn đã xóa, hữu ích cho nhật ký kiểm tra.

## Tổng hợp hàm

Tổng hợp tính toán các giá trị đơn từ nhiều hàng.

### ĐẾM

Đếm hàng:

```sql
-- Total users
SELECT COUNT(*) FROM users;

-- Users with age set
SELECT COUNT(age) FROM users;

-- Distinct ages
SELECT COUNT(DISTINCT age) FROM users;

-- Users matching criteria
SELECT COUNT(*) FROM users WHERE age >= 18;
```

`COUNT(*)` đếm tất cả các hàng. `COUNT(column)` đếm các giá trị không NULL trong cột đó.

### TỔNG, AVG, MIN, MAX

```sql
-- Total age of all users (not very useful)
SELECT SUM(age) FROM users;

-- Average age
SELECT AVG(age) FROM users;

-- Age range
SELECT MIN(age) AS youngest, MAX(age) AS oldest FROM users;

-- Multiple aggregates
SELECT
  COUNT(*) AS total_users,
  AVG(age) AS avg_age,
  MIN(age) AS min_age,
  MAX(age) AS max_age
FROM users;
```

Đầu ra:

```
 total_users | avg_age | min_age | max_age
-------------+---------+---------+---------
         100 |   32.45 |      18 |      75
```

### NHÓM THEO

GROUP BY nhóm các hàng trước khi tổng hợp:

```sql
-- Count users by age
SELECT age, COUNT(*) AS user_count
FROM users
GROUP BY age
ORDER BY age;
```

Đầu ra:

```
 age | user_count
-----+------------
  18 |          5
  19 |          8
  20 |         12
  21 |         10
```

Bạn chỉ có thể CHỌN các cột trong GROUP BY hoặc được sử dụng với hàm tổng hợp:

```sql
-- Valid
SELECT age, COUNT(*) FROM users GROUP BY age;

-- Valid
SELECT age, username FROM users GROUP BY age, username;

-- Invalid - email not in GROUP BY
SELECT age, email, COUNT(*) FROM users GROUP BY age;
```

### CÓ

WHERE lọc trước khi nhóm. CÓ bộ lọc sau:

```sql
-- Ages with more than 10 users
SELECT age, COUNT(*) AS user_count
FROM users
GROUP BY age
HAVING COUNT(*) > 10;

-- Average age by decade, only decades with 5+ users
SELECT
  (age / 10) * 10 AS decade,
  COUNT(*) AS user_count,
  AVG(age) AS avg_age
FROM users
GROUP BY decade
HAVING COUNT(*) >= 5
ORDER BY decade;
```

Đầu ra:

```
 decade | user_count | avg_age
--------+------------+---------
     20 |         45 |   24.35
     30 |         32 |   34.21
     40 |         18 |   44.56
```

## Chuỗi hàm

Thao tác văn bản trong truy vấn:

```sql
-- Convert to uppercase/lowercase
SELECT UPPER(username), LOWER(email) FROM users;

-- Concatenate strings
SELECT username || ' <' || email || '>' AS full_contact FROM users;

-- String length
SELECT username, LENGTH(username) FROM users;

-- Extract substring
SELECT SUBSTRING(email FROM '[^@]+') AS local_part FROM users;

-- Replace text
SELECT REPLACE(email, '@example.com', '@newdomain.com') FROM users;

-- Trim whitespace
SELECT TRIM(username) FROM users;

-- Check if string contains text
SELECT * FROM users WHERE email LIKE '%gmail%';

-- Case-insensitive search
SELECT * FROM users WHERE username ILIKE 'ALICE';
```

## Ngày và giờ hàm

Làm việc với dấu thời gian:

```sql
-- Current timestamp
SELECT CURRENT_TIMESTAMP;

-- Current date
SELECT CURRENT_DATE;

-- Extract parts
SELECT
  EXTRACT(YEAR FROM created_at) AS year,
  EXTRACT(MONTH FROM created_at) AS month,
  EXTRACT(DAY FROM created_at) AS day
FROM users;

-- Format dates
SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS formatted_date FROM users;

-- Date arithmetic
SELECT created_at, created_at + INTERVAL '7 days' AS week_later FROM users;

-- Age calculation
SELECT AGE(created_at) FROM users;

-- Users created in last 30 days
SELECT * FROM users
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '30 days';

-- Group by month
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS signups
FROM users
GROUP BY month
ORDER BY month;
```

## Bí danh

Sử dụng AS để đặt tên cho cột hoặc bảng có thể đọc được:

```sql
-- Column alias
SELECT username AS user, email AS contact FROM users;

-- Alias without AS (works but less clear)
SELECT username user, email contact FROM users;

-- Table alias (useful for joins, covered later)
SELECT u.username, u.email
FROM users u
WHERE u.age > 25;

-- Alias for expressions
SELECT COUNT(*) AS total_users FROM users;

-- Alias required for complex expressions
SELECT
  age,
  CASE
    WHEN age < 18 THEN 'minor'
    WHEN age < 65 THEN 'adult'
    ELSE 'senior'
  END AS age_group
FROM users;
```

## Biểu thức CASE

Logic có điều kiện trong truy vấn:

```sql
SELECT
  username,
  age,
  CASE
    WHEN age < 18 THEN 'Minor'
    WHEN age < 25 THEN 'Young Adult'
    WHEN age < 65 THEN 'Adult'
    ELSE 'Senior'
  END AS age_category
FROM users;

-- Simple CASE
SELECT
  username,
  CASE age
    WHEN 18 THEN 'Just turned adult'
    WHEN 21 THEN 'Legal drinking age'
    WHEN 65 THEN 'Retirement age'
    ELSE 'Other age'
  END AS age_note
FROM users;

-- CASE in aggregates
SELECT
  COUNT(CASE WHEN age < 18 THEN 1 END) AS minors,
  COUNT(CASE WHEN age >= 18 AND age < 65 THEN 1 END) AS adults,
  COUNT(CASE WHEN age >= 65 THEN 1 END) AS seniors
FROM users;
```

## Xử lý NULL

NULL đại diện cho dữ liệu bị thiếu hoặc không xác định. Nó hoạt động khác với các giá trị khác:

```sql
-- NULLs are not equal to anything, including NULL
SELECT * FROM users WHERE age = NULL;  -- Returns nothing!
SELECT * FROM users WHERE age IS NULL;  -- Correct way

-- NULL in expressions
SELECT 5 + NULL;  -- Returns NULL
SELECT 'Hello ' || NULL;  -- Returns NULL

-- COALESCE: Return first non-NULL value
SELECT username, COALESCE(age, 0) AS age FROM users;

-- NULLIF: Return NULL if two values equal
SELECT NULLIF(age, 0) FROM users;  -- NULL if age is 0, otherwise age

-- Count only non-NULL values
SELECT COUNT(age) FROM users;  -- Excludes NULL ages
SELECT COUNT(*) FROM users;    -- Includes all rows
```

## Ví dụ thực tế

### Báo cáo đăng ký người dùng

```sql
SELECT
  DATE_TRUNC('day', created_at) AS signup_date,
  COUNT(*) AS new_users,
  AVG(age) AS avg_age
FROM users
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY signup_date
ORDER BY signup_date DESC;
```

### Tìm bản sao

```sql
SELECT email, COUNT(*) AS count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
```

### Dọn dẹp dữ liệu

```sql
-- Standardize email addresses
UPDATE users SET email = LOWER(TRIM(email));

-- Fix null ages to 0
UPDATE users SET age = 0 WHERE age IS NULL;

-- Remove old inactive users
DELETE FROM users
WHERE created_at < CURRENT_DATE - INTERVAL '2 years'
  AND deleted_at IS NOT NULL;
```

### Xuất dữ liệu

```sql
-- Get data for CSV export
SELECT
  id,
  username,
  email,
  age,
  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
FROM users
ORDER BY id;
```

## Những lỗi thường gặp

**Quên WHERE trong UPDATE/DELETE**: Điều này ảnh hưởng đến tất cả các hàng. Luôn kiểm tra lại.

So sánh **NULL với =**: Sử dụng `IS NULL`, không phải `= NULL`.

**Không xem xét NULL trong tổng hợp**: `AVG(age)` bỏ qua độ tuổi NULL. Nếu đó không phải là điều bạn muốn, hãy sử dụng `COALESCE`.

**Chọn * trong sản xuất**: Chỉ định các cột. Các bảng thay đổi theo thời gian.

**No ORDER BY để phân trang**: OFFSET/LIMIT không có ORDER BY cho kết quả không thể đoán trước.

**Độ nhạy chữ hoa chữ thường**: PostgreSQL phân biệt chữ hoa chữ thường trong chuỗi. Sử dụng `ILIKE` để khớp không phân biệt chữ hoa chữ thường.

## Kiểm tra truy vấn một cách an toàn

Trước khi chạy cập nhật hoặc xóa trong production:

```sql
-- Wrap in a transaction
BEGIN;
  DELETE FROM users WHERE age < 18;
  -- Check what happened
  SELECT * FROM users;
  -- If wrong, rollback
ROLLBACK;
  -- If correct, commit
  -- COMMIT;
```

Hoặc sử dụng giao dịch chỉ đọc:

```sql
BEGIN TRANSACTION READ ONLY;
  SELECT * FROM users WHERE age < 18;
ROLLBACK;
```

Các thao tác SQL cơ bản này xử lý hầu hết công việc cơ sở dữ liệu hàng ngày. Bạn có thể tạo bảng, thêm dữ liệu, truy vấn, cập nhật và xóa dữ liệu. Tiếp theo, chúng ta sẽ xem xét thiết kế cơ sở dữ liệu - cách cấu trúc các bảng và mối quan hệ để dữ liệu của bạn luôn nhất quán và các truy vấn của bạn luôn nhanh chóng.
