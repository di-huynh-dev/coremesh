---
title: "Giao dịch và kiểm soát đồng thời"
description: Tìm hiểu cách sử dụng các giao dịch để duy trì tính nhất quán của dữ liệu và xử lý truy cập cơ sở dữ liệu đồng thời một cách an toàn
order: 8
---

**TLDR**: Bao gồm các hoạt động liên quan trong giao dịch với BEGIN/commit. Giao dịch đảm bảo tất cả các hoạt động cùng thành công hoặc tất cả đều thất bại. PostgreSQL cung cấp đảm bảo ACID. Sử dụng các mức cách ly thích hợp để cân bằng tính nhất quán và hiệu suất. Xử lý bế tắc một cách khéo léo.

Giao dịch đảm bảo dữ liệu luôn nhất quán ngay cả khi nhiều thao tác xảy ra đồng thời hoặc xảy ra lỗi.

## Giao dịch là gì?

Giao dịch là một chuỗi các hoạt động được thực hiện dưới dạng một đơn vị:

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

Cả hai bản cập nhật đều xảy ra hoặc không xảy ra. Không chuyển nhượng một phần.

## Các lệnh giao dịch cơ bản

```sql
-- Start transaction
BEGIN;

-- Do work
INSERT INTO users (username, email) VALUES ('alice', 'alice@example.com');
INSERT INTO posts (user_id, title) VALUES (1, 'First Post');

-- If everything worked:
COMMIT;

-- If something went wrong:
-- ROLLBACK;
```

### Khôi phục khi có lỗi

```sql
BEGIN;
  INSERT INTO users (username, email) VALUES ('bob', 'bob@example.com');
  INSERT INTO users (username, email) VALUES ('bob', 'duplicate@example.com');  -- Fails (duplicate username)
ROLLBACK;  -- Undo the first INSERT too
```

PostgreSQL tự động khôi phục nếu xảy ra lỗi và bạn không xử lý.

## Thuộc tính axit

Giao dịch cung cấp đảm bảo ACID:

### Tính nguyên tử

Mọi hoạt động đều thành công hoặc tất cả đều thất bại. Không thực hiện một phần.

```sql
BEGIN;
  UPDATE inventory SET quantity = quantity - 5 WHERE product_id = 1;
  INSERT INTO orders (product_id, quantity) VALUES (1, 5);
COMMIT;
```

Nếu một trong hai câu lệnh không thành công, cả hai đều quay trở lại. inventory và các đơn hàng luôn được đồng bộ hóa.

### Tính nhất quán

Cơ sở dữ liệu di chuyển từ một hợp lệ trạng thái đến cái khác. Các ràng buộc được thực thi.

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- Total balance unchanged:
SELECT SUM(balance) FROM accounts;  -- Same before and after
```

### Cách ly

Các giao dịch đồng thời không can thiệp lẫn nhau.

```sql
-- Transaction 1
BEGIN;
  SELECT balance FROM accounts WHERE id = 1;  -- Sees 500
  -- ... do something ...
COMMIT;

-- Transaction 2 (running simultaneously)
BEGIN;
  UPDATE accounts SET balance = 1000 WHERE id = 1;
COMMIT;

-- Transaction 1 doesn't see Transaction 2's changes until it commits
```

### Độ bền

Khi đã commit, các thay đổi vẫn tồn tại ngay cả khi hệ thống gặp sự cố.

```sql
BEGIN;
  INSERT INTO critical_data (value) VALUES ('important');
COMMIT;
-- Power failure here
-- On restart, the insert is still there
```

PostgreSQL ghi vào Nhật ký ghi trước (WAL) trước khi xác nhận commit, đảm bảo độ bền.

## Mức độ cô lập

Kiểm soát cách các giao dịch nhìn thấy những thay đổi của nhau. Đánh đổi giữa tính nhất quán và tính đồng thời.

### Đọc không cam kết

Không được hỗ trợ trong PostgreSQL (được coi là Đọc đã commit). Cho phép đọc bẩn trong cơ sở dữ liệu khác.

### Đọc đã commit (Mặc định)

Chỉ thấy các thay đổi của đã commit. Mức độ phổ biến nhất.

```sql
-- Transaction 1
BEGIN;
  UPDATE products SET price = 100 WHERE id = 1;
  -- Not committed yet

-- Transaction 2
BEGIN;
  SELECT price FROM products WHERE id = 1;  -- Sees old price
  -- Wait for Transaction 1 to commit
  SELECT price FROM products WHERE id = 1;  -- Now sees 100
COMMIT;
```

### Đọc lặp lại

Các truy vấn sẽ thấy một ảnh chụp nhanh nhất quán từ khi bắt đầu giao dịch.

```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;
  SELECT balance FROM accounts WHERE id = 1;  -- Sees 500

-- Another transaction updates the balance to 1000 and commits

  SELECT balance FROM accounts WHERE id = 1;  -- Still sees 500 (snapshot)
COMMIT;
```

Ngăn chặn các lần đọc không lặp lại nhưng có thể gây ra lỗi tuần tự hóa:

```sql
-- Transaction 1
BEGIN ISOLATION LEVEL REPEATABLE READ;
  SELECT * FROM products WHERE id = 1;
  UPDATE products SET stock = stock - 1 WHERE id = 1;
  -- Transaction 2 modified this row
COMMIT;  -- ERROR: could not serialize access
```

### Có thể tuần tự hóa

Sự cô lập mạnh mẽ nhất. Các giao dịch được thực hiện như thể chúng chạy lần lượt.

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
  -- ... operations ...
COMMIT;
```

Ngăn chặn mọi sự bất thường nhưng gây ra nhiều lỗi tuần tự hóa hơn. Sử dụng khi tính nhất quán là rất quan trọng.

Đặt mức mặc định:

```sql
ALTER DATABASE mydb SET default_transaction_isolation TO 'repeatable read';
```

## Điểm lưu

Hoàn trả một phần trong các giao dịch:

```sql
BEGIN;
  INSERT INTO users (username) VALUES ('alice');

  SAVEPOINT before_posts;

  INSERT INTO posts (user_id, title) VALUES (1, 'Post 1');
  INSERT INTO posts (user_id, title) VALUES (1, 'Post 2');  -- Might fail

  -- If post insert fails, rollback to savepoint
  ROLLBACK TO before_posts;

  -- User insert still committed
COMMIT;
```

Hữu ích cho các hoạt động phức tạp trong đó một số bộ phận có thể thất bại trong khi những bộ phận khác thành công.

## Xử lý truy cập đồng thời

### Khóa cấp hàng

CHỌN ĐỂ CẬP NHẬT khóa các hàng:

```sql
BEGIN;
  SELECT * FROM inventory WHERE product_id = 1 FOR UPDATE;
  -- Other transactions wait here
  UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 1;
COMMIT;
```

Ngăn chặn hai giao dịch giảm cùng một lúc inventory.

### Các loại khóa

```sql
-- Exclusive lock (blocks all other locks)
SELECT * FROM products WHERE id = 1 FOR UPDATE;

-- Shared lock (blocks FOR UPDATE but allows FOR SHARE)
SELECT * FROM products WHERE id = 1 FOR SHARE;

-- Skip locked rows
SELECT * FROM queue WHERE processed = false FOR UPDATE SKIP LOCKED LIMIT 10;

-- Error if rows are locked
SELECT * FROM products WHERE id = 1 FOR UPDATE NOWAIT;
```

ĐỂ CẬP NHẬT BỎ QUA LOCKED rất phù hợp cho hàng đợi công việc - mỗi công nhân nhận được các hàng khác nhau.

### Khóa tư vấn

Khóa cấp ứng dụng sử dụng số tùy ý:

```sql
-- Try to acquire lock 1234
SELECT pg_try_advisory_lock(1234);

-- Do work
UPDATE shared_resource SET value = value + 1;

-- Release lock
SELECT pg_advisory_unlock(1234);
```

Hữu ích cho việc phối hợp giữa các ứng dụng.

## Bế tắc

Hai giao dịch chờ đợi lẫn nhau:

```sql
-- Transaction 1
BEGIN;
  UPDATE products SET price = 100 WHERE id = 1;
  -- Waiting for Transaction 2

-- Transaction 2
BEGIN;
  UPDATE products SET price = 200 WHERE id = 2;
  UPDATE products SET price = 150 WHERE id = 1;  -- Waits for Transaction 1

-- Transaction 1 continues
  UPDATE products SET price = 250 WHERE id = 2;  -- Waits for Transaction 2
  -- DEADLOCK
```

PostgreSQL phát hiện bế tắc và hủy bỏ một giao dịch:

```
ERROR: deadlock detected
DETAIL: Process 1234 waits for ShareLock on transaction 5678; blocked by process 5678.
```

Xử lý mã ứng dụng:

```python
try:
    execute_transaction()
except DeadlockError:
    retry_transaction()
```

Ngăn chặn bế tắc bằng cách truy cập tài nguyên theo thứ tự nhất quán:

```sql
-- Always update products in ID order
BEGIN;
  UPDATE products SET price = 100 WHERE id IN (1, 2, 5) ORDER BY id;
COMMIT;
```

## Giao dịch dài hạn

Tránh giữ các giao dịch ở trạng thái mở:

```sql
-- Bad
BEGIN;
  SELECT * FROM products;
  -- User thinks for 10 minutes
  UPDATE products SET ...;
COMMIT;
```

Giao dịch dài:
- Chặn các giao dịch khác
- Ngăn chặn chân không dọn dẹp hàng chết
- Giữ khóa lâu hơn mức cần thiết

Giữ giao dịch ngắn gọn:

```sql
-- Good
SELECT * FROM products;
-- Let user decide

-- When ready:
BEGIN;
  UPDATE products SET ...;
COMMIT;
```

## Các mô hình giao dịch thực tế

### Chuyển tiền

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100
  WHERE id = 1 AND balance >= 100;

  IF NOT FOUND THEN
    ROLLBACK;
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  UPDATE accounts SET balance = balance + 100
  WHERE id = 2;
COMMIT;
```

### Xử lý các mục trong hàng đợi

```sql
BEGIN;
  -- Lock and get next item
  SELECT * FROM queue
  WHERE processed = false
  ORDER BY created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  -- Process item
  -- ... do work ...

  -- Mark processed
  UPDATE queue SET processed = true WHERE id = ...;
COMMIT;
```

Nhiều công nhân có thể xử lý các mục khác nhau cùng một lúc.

### Máy đếm nguyên tử

```sql
BEGIN;
  UPDATE statistics
  SET view_count = view_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE page_id = 123;
COMMIT;
```

## Thực tiễn tốt nhất về giao dịch

**Giữ giao dịch ngắn**: Nhận khóa, thực hiện công việc, commit. Không giữ các giao dịch trong khi người dùng nhập hoặc lệnh gọi API bên ngoài.

**Lỗi xử lý**: Luôn có cách xử lý lỗi khôi phục khi không thành công.

**Sử dụng mức cách ly thích hợp**: Đọc đã commit trong hầu hết các trường hợp, Đọc lặp lại hoặc Có thể tuần tự hóa khi cần.

**Atránh các giao dịch lồng nhau**: PostgreSQL không hỗ trợ các giao dịch lồng nhau thực sự. Thay vào đó hãy sử dụng điểm lưu trữ.

**Thử lại lỗi tuần tự hóa**: Khi sử dụng Đọc lặp lại hoặc Có thể tuần tự hóa, hãy thử lại các xung đột.

**Index khóa ngoại**: Giúp tránh tình trạng chờ khóa trong khi cập nhật.

**Khóa màn hình chờ**:

```sql
SELECT
  pid,
  usename,
  pg_blocking_pids(pid) AS blocked_by,
  query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;
```

Giao dịch giữ cho dữ liệu của bạn nhất quán ngay cả khi truy cập đồng thời và không thành công. Tiếp theo, chúng tôi sẽ đề cập đến việc sao lưu và phục hồi - cách bảo vệ dữ liệu của bạn và khôi phục dữ liệu khi cần.
