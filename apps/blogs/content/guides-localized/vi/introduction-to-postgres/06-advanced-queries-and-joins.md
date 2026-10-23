---
title: "Truy vấn nâng cao và phép JOIN"
description: Tìm hiểu cách kết hợp dữ liệu từ nhiều bảng với các phép nối, truy vấn phụ và cửa sổ hàm
order: 6
---

**TLDR**: Sử dụng INNER JOIN để kết hợp các hàng liên quan từ hai bảng. LEFT JOIN bao gồm tất cả các hàng từ bảng đầu tiên ngay cả khi không có hàng nào khớp. Truy vấn con cho phép bạn lồng các truy vấn. Cửa sổ hàm thực hiện tính toán trên các hàng mà không cần nhóm. CTE làm cho các truy vấn phức tạp có thể đọc được.

Hầu hết các truy vấn thực tế đều cần dữ liệu từ nhiều bảng. Phép JOIN kết hợp các bảng dựa trên mối quan hệ.

## Hiểu phép JOIN

Cho hai bảng:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50)
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(200)
);

INSERT INTO users (id, username) VALUES (1, 'alice'), (2, 'bob'), (3, 'carol');
INSERT INTO posts (user_id, title) VALUES
  (1, 'Alice First Post'),
  (1, 'Alice Second Post'),
  (2, 'Bob Post');
```

Người dùng:
```
 id | username
----+----------
  1 | alice
  2 | bob
  3 | carol
```

Bài viết:
```
 id | user_id | title
----+---------+-------------------
  1 |       1 | Alice First Post
  2 |       1 | Alice Second Post
  3 |       2 | Bob Post
```

## THAM GIA TRONG

Chỉ trả về các hàng phù hợp:

```sql
SELECT users.username, posts.title
FROM users
INNER JOIN posts ON users.id = posts.user_id;
```

Kết quả:
```
 username |       title
----------+-------------------
 alice    | Alice First Post
 alice    | Alice Second Post
 bob      | Bob Post
```

Carol không xuất hiện - cô ấy không có bài viết nào.

Bí danh bảng làm cho truy vấn ngắn hơn:

```sql
SELECT u.username, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id;
```

## THAM GIA TRÁI

Trả về tất cả các hàng từ bảng bên trái, với NULL cho những hàng không khớp:

```sql
SELECT u.username, p.title
FROM users u
LEFT JOIN posts p ON u.id = p.user_id;
```

Kết quả:
```
 username |       title
----------+-------------------
 alice    | Alice First Post
 alice    | Alice Second Post
 bob      | Bob Post
 carol    | NULL
```

Carol xuất hiện mặc dù cô ấy không có bài viết nào.

Tìm người dùng không có bài viết:

```sql
SELECT u.username
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE p.id IS NULL;
```

## QUYỀN THAM GIA

Đối diện với LEFT JOIN - tất cả các hàng từ bảng bên phải:

```sql
SELECT u.username, p.title
FROM posts p
RIGHT JOIN users u ON u.id = p.user_id;
```

Kết quả tương tự như LEFT JOIN với các bảng được hoán đổi. Hầu hết mọi người thích LEFT JOIN vì tính nhất quán.

## THAM GIA BÊN NGOÀI ĐẦY ĐỦ

Tất cả các hàng từ cả hai bảng:

```sql
SELECT u.username, p.title
FROM users u
FULL OUTER JOIN posts p ON u.id = p.user_id;
```

Hiếm khi cần thiết nhưng hữu ích khi tìm các hàng không khớp trong cả hai bảng.

## Nhiều phép JOIN

Phép JOIN nhiều hơn hai bảng:

```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id),
  user_id INTEGER REFERENCES users(id),
  content TEXT
);

INSERT INTO comments (post_id, user_id, content) VALUES
  (1, 2, 'Great post!'),
  (1, 3, 'Thanks for sharing');

SELECT
  p.title AS post_title,
  u.username AS author,
  c.content AS comment,
  cu.username AS commenter
FROM posts p
JOIN users u ON p.user_id = u.id
JOIN comments c ON c.post_id = p.id
JOIN users cu ON c.user_id = cu.id;
```

Kết quả:
```
    post_title    | author | comment           | commenter
------------------+--------+-------------------+-----------
 Alice First Post | alice  | Great post!       | bob
 Alice First Post | alice  | Thanks for sharing| carol
```

## Tự phép JOIN

Phép JOIN một bảng với chính nó:

```sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  manager_id INTEGER REFERENCES employees(id)
);

INSERT INTO employees (name, manager_id) VALUES
  ('CEO', NULL),
  ('VP Sales', 1),
  ('VP Engineering', 1),
  ('Sales Rep', 2),
  ('Developer', 3);

-- Find employees and their managers
SELECT
  e.name AS employee,
  m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

Kết quả:
```
    employee     | manager
-----------------+---------
 CEO             | NULL
 VP Sales        | CEO
 VP Engineering  | CEO
 Sales Rep       | VP Sales
 Developer       | VP Engineering
```

## Truy vấn con

Truy vấn trong truy vấn.

### Truy vấn phụ ở WHERE

```sql
-- Posts by users with more than 5 posts
SELECT title
FROM posts
WHERE user_id IN (
  SELECT user_id
  FROM posts
  GROUP BY user_id
  HAVING COUNT(*) > 5
);
```

### Truy vấn con trong CHỌN

```sql
SELECT
  u.username,
  (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) AS post_count
FROM users u;
```

Kết quả:
```
 username | post_count
----------+------------
 alice    |          2
 bob      |          1
 carol    |          0
```

### Truy vấn con trong TỪ

```sql
SELECT avg_posts.username, avg_posts.post_count
FROM (
  SELECT u.username, COUNT(p.id) AS post_count
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  GROUP BY u.username
) AS avg_posts
WHERE avg_posts.post_count > 0;
```

## Biểu thức bảng chung (CTE)

CTE làm cho các truy vấn phức tạp có thể đọc được. Sử dụng `WITH`:

```sql
WITH user_post_counts AS (
  SELECT u.id, u.username, COUNT(p.id) AS post_count
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  GROUP BY u.id, u.username
)
SELECT * FROM user_post_counts WHERE post_count > 1;
```

Nhiều CTE:

```sql
WITH active_users AS (
  SELECT * FROM users WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
),
recent_posts AS (
  SELECT * FROM posts WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
)
SELECT u.username, COUNT(p.id) AS recent_post_count
FROM active_users u
LEFT JOIN recent_posts p ON u.id = p.user_id
GROUP BY u.username;
```

## Cửa sổ hàm

Thực hiện tính toán trên các hàng liên quan mà không cần GROUP BY.

### ROW_NUMBER

```sql
SELECT
  username,
  created_at,
  ROW_NUMBER() OVER (ORDER BY created_at) AS signup_order
FROM users;
```

Kết quả:
```
 username | created_at          | signup_order
----------+---------------------+--------------
 alice    | 2024-01-01 10:00:00 | 1
 bob      | 2024-01-02 11:00:00 | 2
 carol    | 2024-01-03 12:00:00 | 3
```

### RANK và DENSE_RANK

```sql
SELECT
  username,
  post_count,
  RANK() OVER (ORDER BY post_count DESC) AS rank,
  DENSE_RANK() OVER (ORDER BY post_count DESC) AS dense_rank
FROM (
  SELECT u.username, COUNT(p.id) AS post_count
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  GROUP BY u.username
) user_posts;
```

### PHẦN THAM GIA BỞI

Tính toán trong nhóm:

```sql
SELECT
  p.title,
  u.username,
  p.views,
  AVG(p.views) OVER (PARTITION BY u.id) AS user_avg_views
FROM posts p
JOIN users u ON p.user_id = u.id;
```

Hiển thị lượt xem của từng bài đăng và lượt xem trung bình của người dùng trên tất cả các bài đăng của họ.

### LAG và DẪN

Truy cập các giá trị hàng trước/tiếp theo:

```sql
SELECT
  title,
  created_at,
  LAG(created_at) OVER (ORDER BY created_at) AS prev_post_date,
  LEAD(created_at) OVER (ORDER BY created_at) AS next_post_date
FROM posts;
```

Hữu ích cho việc tính toán thời gian giữa các sự kiện.

## ĐOÀN và ĐOÀN TẤT CẢ

Kết hợp kết quả từ nhiều truy vấn:

```sql
SELECT username AS name, 'user' AS type FROM users
UNION ALL
SELECT title AS name, 'post' AS type FROM posts;
```

`UNION` loại bỏ các bản sao, `UNION ALL` giữ chúng (nhanh hơn).

## Ví dụ thực tế

### Tìm tác giả hàng đầu:

```sql
SELECT
  u.username,
  COUNT(p.id) AS post_count,
  SUM(p.views) AS total_views
FROM users u
JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.username
ORDER BY total_views DESC
LIMIT 10;
```

### Bài viết có nhiều bình luận nhất:

```sql
SELECT
  p.title,
  u.username AS author,
  COUNT(c.id) AS comment_count
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id, p.title, u.username
ORDER BY comment_count DESC
LIMIT 5;
```

### Tóm tắt hoạt động của người dùng:

```sql
WITH user_stats AS (
  SELECT
    u.id,
    u.username,
    COUNT(DISTINCT p.id) AS posts,
    COUNT(DISTINCT c.id) AS comments
  FROM users u
  LEFT JOIN posts p ON p.user_id = u.id
  LEFT JOIN comments c ON c.user_id = u.id
  GROUP BY u.id, u.username
)
SELECT
  username,
  posts,
  comments,
  posts + comments AS total_activity
FROM user_stats
ORDER BY total_activity DESC;
```

Hiểu các phép nối và các kỹ thuật truy vấn nâng cao này cho phép bạn trích xuất chính xác dữ liệu bạn cần. Tiếp theo, chúng ta sẽ khám phá các chỉ mục - cách thực hiện các truy vấn này nhanh chóng ngay cả với hàng triệu hàng.
