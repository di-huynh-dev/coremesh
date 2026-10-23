---
title: "Cài đặt và thiết lập PostgreSQL"
description: Cài đặt PostgreSQL trên hệ thống của bạn và kết nối với cơ sở dữ liệu đầu tiên của bạn
order: 2
---

**TLDR**: Cài đặt PostgreSQL từ kho chính thức hoặc trình quản lý gói. Quá trình cài đặt sẽ tạo siêu người dùng `postgres`. Kết nối bằng `psql` (máy khách dòng lệnh) hoặc các công cụ GUI như pgAdmin. Tạo cơ sở dữ liệu với `CREATE DATABASE`, kết nối với `\c database_name` và khám phá bằng các lệnh `\d`.

Việc chạy PostgreSQL rất đơn giản trên hầu hết các nền tảng. Chúng tôi sẽ đề cập đến việc cài đặt, cấu hình ban đầu, kết nối với máy chủ và tạo cơ sở dữ liệu đầu tiên của bạn.

## Cài đặt PostgreSQL

### Trên macOS

Sử dụng Homebrew là phương pháp đơn giản nhất:

```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16
```

Việc này sẽ cài đặt PostgreSQL 16 (thay thế bằng phiên bản bạn muốn) và tự động khởi động nó. Dịch vụ chạy ở chế độ nền và khởi động lại khi khởi động.

Ngoài ra, hãy tải xuống Postgres.app từ [postgresapp.com](https://postgresapp.com) - một ứng dụng macOS độc lập bao gồm PostgreSQL và các công cụ hữu ích.

### Trên Ubuntu/Debian

Kho lưu trữ chính thức của PostgreSQL cung cấp các phiên bản mới nhất:

```bash
# Install prerequisites
sudo apt update
sudo apt install -y postgresql-common

# Add PostgreSQL repository
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh

# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16
```

PostgreSQL tự động khởi động sau khi cài đặt:

```bash
# Check status
sudo systemctl status postgresql

# Start/stop/restart if needed
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql
```

### Trên Red Hat/CentOS/Fedora

```bash
# Install PostgreSQL repository
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-$(rpm -E %{rhel})-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Install PostgreSQL
sudo dnf install -y postgresql16-server postgresql16-contrib

# Initialize database cluster
sudo /usr/pgsql-16/bin/postgresql-16-setup initdb

# Start and enable service
sudo systemctl start postgresql-16
sudo systemctl enable postgresql-16
```

### Trên Windows

Tải xuống trình cài đặt từ [postgresql.org/download/windows](https://www.postgresql.org/download/windows/):

1. Chạy trình cài đặt
2. Chọn thư mục cài đặt (mặc định là được)
3. Chọn các thành phần (Máy chủ PostgreSQL, pgAdmin, Công cụ dòng lệnh)
4. Đặt mật khẩu cho người dùng postgres
5. Chọn cổng (5432 là mặc định)
6. Chọn ngôn ngữ (mặc định là ổn)
7. Hoàn tất cài đặt

Trình cài đặt thiết lập PostgreSQL làm dịch vụ Windows tự động khởi động.

### Sử dụng Docker

Để phát triển hoặc thử nghiệm, Docker cung cấp thiết lập nhanh:

```bash
# Run PostgreSQL container
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=myapp \
  -p 5432:5432 \
  -d postgres:16

# Connect to it
docker exec -it postgres-dev psql -U postgres -d myapp
```

Điều này tạo ra PostgreSQL container với:
- Mật khẩu: `mypassword`
- Cơ sở dữ liệu mặc định: `myapp`
- Tiếp xúc trên cổng 5432

Đối với dữ liệu liên tục, hãy thêm volume:

```bash
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=mypassword \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  -d postgres:16
```

Bây giờ dữ liệu vẫn tồn tại khi khởi động lại container.

## Xác minh cài đặt

Kiểm tra xem PostgreSQL đã được cài đặt và đang chạy chưa:

```bash
# Check version
psql --version

# On Linux/macOS, check if server is running
pg_isready
```

Bạn nên xem:

```
psql (PostgreSQL) 16.1
/tmp:5432 - accepting connections
```

Nếu bạn thấy "chấp nhận kết nối", PostgreSQL đã sẵn sàng.

## Hiểu cấu trúc của PostgreSQL

Sau khi cài đặt, PostgreSQL có:

**postgres user**: Tài khoản siêu người dùng có thể làm bất cứ điều gì. Trên Linux, đây cũng là người dùng hệ thống.

Cơ sở dữ liệu **postgres**: Cơ sở dữ liệu mặc định. Mọi cài đặt PostgreSQL đều có cái này.

**template1 và template0**: Cơ sở dữ liệu mẫu. Cơ sở dữ liệu mới được sao chép từ template1.

**Data thư mục**: Nơi PostgreSQL lưu trữ tất cả các tệp dữ liệu. Trên Linux, thường là `/var/lib/postgresql/16/main` hoặc `/var/lib/pgsql/16/data`.

**Tệp cấu hình**:
- `postgresql.conf`: Cấu hình chính
- `pg_hba.conf`: Quy tắc xác thực ứng dụng khách

## Kết nối với PostgreSQL

### Sử dụng psql (Máy khách dòng lệnh)

`psql` là ứng dụng khách PostgreSQL tiêu chuẩn. Nó mạnh mẽ và có sẵn ở mọi nơi.

Trên Linux, trước tiên hãy chuyển sang người dùng postgres:

```bash
sudo -i -u postgres
psql
```

Trên macOS (cài đặt Homebrew):

```bash
psql postgres
```

Trên Windows, sử dụng SQL shell (psql) từ menu Bắt đầu.

Bạn sẽ thấy lời nhắc:

```
postgres=#
```

Điều này có nghĩa là bạn đã kết nối với cơ sở dữ liệu `postgres` với tư cách là người dùng `postgres`.

### Cơ bản về psql

Hãy thử các lệnh sau:

```sql
-- List all databases
\l

-- Connect to a database
\c postgres

-- List tables in current database
\dt

-- Describe a table
\d table_name

-- List users
\du

-- See current database and user
SELECT current_database(), current_user;

-- Quit psql
\q
```

Các lệnh `\` là các phím tắt psql. Chúng không phải là SQL nhưng chúng giúp việc điều hướng dễ dàng hơn.

### Định dạng chuỗi kết nối

PostgreSQL sử dụng chuỗi kết nối để chỉ định nơi kết nối:

```
postgresql://username:password@hostname:port/database
```

Ví dụ:

```bash
# Local connection
psql postgresql://postgres@localhost/mydb

# Remote connection
psql postgresql://user:pass@db.example.com:5432/production

# Using environment variables
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGDATABASE=mydb
psql  # Uses environment variables
```

## Tạo cơ sở dữ liệu đầu tiên của bạn

Hãy tạo cơ sở dữ liệu cho một ứng dụng blog:

```sql
-- Create database
CREATE DATABASE blog;

-- Connect to it
\c blog

-- Verify you're connected
SELECT current_database();
```

Đầu ra:

```
CREATE DATABASE
You are now connected to database "blog" as user "postgres".
 current_database
------------------
 blog
```

Bây giờ tạo một bảng:

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Kiểm tra xem nó có tồn tại không:

```sql
\dt
```

Đầu ra:

```
        List of relations
 Schema | Name  | Type  |  Owner
--------+-------+-------+----------
 public | posts | table | postgres
```

Chèn một số dữ liệu:

```sql
INSERT INTO posts (title, content)
VALUES
  ('First Post', 'Hello, PostgreSQL!'),
  ('Second Post', 'Learning databases is fun'),
  ('Third Post', 'PostgreSQL is powerful');
```

Truy vấn nó:

```sql
SELECT * FROM posts;
```

Đầu ra:

```
 id |    title     |          content           |         created_at
----+--------------+----------------------------+----------------------------
  1 | First Post   | Hello, PostgreSQL!         | 2024-02-14 10:23:45.123456
  2 | Second Post  | Learning databases is fun  | 2024-02-14 10:23:45.123456
  3 | Third Post   | PostgreSQL is powerful     | 2024-02-14 10:23:45.123456
```

Xin chúc mừng! Bạn đã tạo cơ sở dữ liệu, bảng, dữ liệu được chèn và truy vấn nó.

## Tạo một người không phải là siêu người dùng

Người dùng `postgres` có quyền lực vô hạn. Đối với ứng dụng, tạo người dùng có quyền hạn chế:

```sql
-- Create a new user
CREATE USER blog_app WITH PASSWORD 'secure_password';

-- Grant permissions on database
GRANT CONNECT ON DATABASE blog TO blog_app;

-- Connect to the blog database
\c blog

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO blog_app;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO blog_app;

-- Grant permissions on sequences (for SERIAL columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO blog_app;

-- Make future tables accessible too
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO blog_app;
```

Bây giờ ứng dụng có thể kết nối dưới dạng `blog_app`:

```bash
psql -U blog_app -d blog -h localhost
```

Người dùng này có thể đọc và ghi bảng `posts` nhưng không thể xóa cơ sở dữ liệu hoặc tạo người dùng mới.

## Sử dụng công cụ GUI

Mặc dù `psql` rất lý tưởng cho các tác vụ nhanh nhưng các công cụ GUI giúp trực quan hóa dữ liệu và ghi truy vấn.

### PgAdmin

pgAdmin là GUI PostgreSQL chính thức. Tải xuống từ [pgadmin.org](https://www.pgadmin.org/).

Sau khi cài đặt:

1. Mở pgAdmin
2. Nhấp chuột phải vào "Máy chủ" → "Đăng ký" → "Máy chủ"
3. Tên: "PostgreSQL cục bộ"
4. Máy chủ: localhost
5. Cảng: 5432
6. Tên người dùng: postgres
7. Mật khẩu: mật khẩu của bạn

Bây giờ bạn có thể duyệt cơ sở dữ liệu, chạy truy vấn và xem dữ liệu bảng bằng đồ họa.

### Công cụ khác

**DBeaver**: Công cụ cơ sở dữ liệu phổ quát hỗ trợ nhiều cơ sở dữ liệu. Nguồn mở và miễn phí.

**TablePlus**: máy khách macOS/Windows với giao diện rõ ràng. Cấp miễn phí có sẵn.

**DataGrip**: IDE cơ sở dữ liệu của JetBrains. Được trả tiền nhưng rất mạnh mẽ.

**Postico**: ứng dụng khách PostgreSQL chỉ dành cho macOS. Đơn giản và thanh lịch.

Chọn dựa trên nền tảng và sở thích của bạn. Nhiều nhà phát triển sử dụng cả `psql` cho các tác vụ nhanh và GUI để khám phá.

## Cấu hình cơ bản

Tệp cấu hình chính của PostgreSQL là `postgresql.conf`. Cài đặt chính:

```ini
# Maximum connections (default: 100)
max_connections = 100

# Memory for sorting and queries (default: 4MB)
work_mem = 4MB

# Shared memory for caching (default: 128MB, often too low)
shared_buffers = 256MB

# WAL settings for durability
wal_level = replica

# Logging
log_statement = 'none'  # 'none', 'ddl', 'mod', or 'all'
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
```

Tìm vị trí tập tin:

```sql
SHOW config_file;
```

Trên Linux:

```
/etc/postgresql/16/main/postgresql.conf
```

Sau khi thay đổi cài đặt, tải lại cấu hình:

```bash
sudo systemctl reload postgresql

# Or in psql
SELECT pg_reload_conf();
```

Một số cài đặt yêu cầu khởi động lại hoàn toàn:

```bash
sudo systemctl restart postgresql
```

## Cấu hình xác thực

Tệp `pg_hba.conf` kiểm soát ai có thể kết nối. Các mục trông giống như:

```
# TYPE  DATABASE  USER      ADDRESS         METHOD
local   all       postgres                  peer
host    all       all       127.0.0.1/32    scram-sha-256
host    all       all       ::1/128         scram-sha-256
```

Điều này có nghĩa là:

- Các kết nối cục bộ của `postgres` sử dụng xác thực ngang hàng (Người dùng Unix = người dùng cơ sở dữ liệu)
- Kết nối TCP từ localhost yêu cầu mật khẩu (scram-sha-256)

Để cho phép kết nối từ xa, hãy thêm:

```
host    all       all       0.0.0.0/0       scram-sha-256
```

Và trong `postgresql.conf`, thay đổi:

```ini
listen_addresses = '*'
```

Sau đó tải lại:

```bash
sudo systemctl reload postgresql
```

Hãy cẩn thận cho phép kết nối từ xa. Sử dụng tường lửa và mật khẩu mạnh hoặc tốt hơn là hạn chế ở các địa chỉ IP cụ thể:

```
host    all       all       203.0.113.0/24  scram-sha-256
```

## Biến môi trường

Đặt những thứ này để tránh gõ tham số kết nối:

```bash
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGDATABASE=blog
export PGPASSWORD=mypassword  # Or use .pgpass file for security
```

Thêm vào `~/.bashrc` hoặc `~/.zshrc` của bạn để duy trì hoạt động lâu dài.

Để bảo mật, hãy sử dụng tệp `.pgpass` thay vì `PGPASSWORD`:

```bash
# Create ~/.pgpass
cat > ~/.pgpass << 'EOF'
localhost:5432:blog:postgres:mypassword
EOF

# Make it readable only by you
chmod 0600 ~/.pgpass
```

Bây giờ `psql` tự động sử dụng mật khẩu này.

## Kết nối từ ngôn ngữ lập trình

### Python với psycopg2

```python
import psycopg2

# Connect
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="blog",
    user="blog_app",
    password="secure_password"
)

# Create cursor
cur = conn.cursor()

# Execute query
cur.execute("SELECT * FROM posts")
rows = cur.fetchall()

for row in rows:
    print(row)

# Close
cur.close()
conn.close()
```

### Node.js với pg

```javascript
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'blog',
  user: 'blog_app',
  password: 'secure_password'
});

await client.connect();

const result = await client.query('SELECT * FROM posts');
console.log(result.rows);

await client.end();
```

### Đi với pgx

```go
package main

import (
    "context"
    "fmt"
    "github.com/jackc/pgx/v5"
)

func main() {
    conn, err := pgx.Connect(context.Background(),
        "postgres://blog_app:secure_password@localhost:5432/blog")
    if err != nil {
        panic(err)
    }
    defer conn.Close(context.Background())

    var title string
    err = conn.QueryRow(context.Background(),
        "SELECT title FROM posts WHERE id = $1", 1).Scan(&title)
    if err != nil {
        panic(err)
    }

    fmt.Println(title)
}
```

## Các sự cố cài đặt phổ biến

### Cổng đã được sử dụng

Nếu PostgreSQL không khởi động vì cổng 5432 đang được sử dụng:

```bash
# Find what's using the port
sudo lsof -i :5432

# Or
sudo netstat -nlp | grep 5432
```

Dừng dịch vụ xung đột hoặc định cấu hình PostgreSQL để sử dụng một cổng khác trong `postgresql.conf`:

```ini
port = 5433
```

### Lỗi bị từ chối quyền

Trên Linux, nếu bạn nhận được thông báo "không thể kết nối với máy chủ":

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check you're using the right user
sudo -i -u postgres psql
```

### Xác thực mật khẩu không thành công

Nếu mật khẩu không hoạt động:

1. Kiểm tra `pg_hba.conf` sử dụng `scram-sha-256` hoặc `md5`, không phải `peer` hoặc `ident`
2. Tải lại cấu hình: `sudo systemctl reload postgresql`
3. Đảm bảo bạn đang kết nối qua TCP: `psql -h localhost -U postgres`

### Không thể tạo cơ sở dữ liệu

Nếu "LỖI: quyền bị từ chối tạo cơ sở dữ liệu":

```sql
-- Check your user's permissions
\du

-- Grant createdb permission
ALTER USER your_user CREATEDB;
```

## Khám phá danh mục hệ thống

PostgreSQL lưu trữ siêu dữ liệu về cơ sở dữ liệu của bạn trong các bảng hệ thống:

```sql
-- List all databases
SELECT datname FROM pg_database;

-- List all tables in current database
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- See table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts';

-- Current database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

Những truy vấn này rất hữu ích để hiểu những gì có trong cơ sở dữ liệu của bạn và lượng dung lượng mà nó sử dụng.

## Các bước tiếp theo

Bây giờ bạn đã cài đặt PostgreSQL và có thể kết nối với nó. Bạn đã tạo cơ sở dữ liệu, bảng và chạy các truy vấn cơ bản. Trong phần tiếp theo, chúng ta sẽ tìm hiểu sâu hơn về SQL - ngôn ngữ bạn sử dụng để tương tác với PostgreSQL. Bạn sẽ học cách truy xuất chính xác dữ liệu mình cần, thao tác dữ liệu đó một cách hiệu quả và hiểu cách hoạt động của các truy vấn.
