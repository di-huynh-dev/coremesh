---
title: "Thực hành tốt và vận hành PostgreSQL trong production"
description: Tìm hiểu cách chạy PostgreSQL một cách đáng tin cậy trong production với tính năng bảo mật, giám sát và bảo trì thích hợp
order: 10
---

**TLDR**: Bảo mật PostgreSQL bằng mật khẩu mạnh, SSL và quyền tối thiểu. Giám sát các số liệu chính (kết nối, tốc độ truy cập bộ đệm, truy vấn chậm). Chạy VACUUM thường xuyên. Lập kế hoạch phát triển với tính năng tổng hợp kết nối và bản sao đọc. Có sổ ghi chép cho các vấn đề phổ biến. Trước tiên hãy kiểm tra các thay đổi trong staging.

Chạy PostgreSQL trong production đòi hỏi nhiều thứ hơn là chỉ biết SQL. Bạn cần các quy trình bảo mật, giám sát, bảo trì và vận hành.

## Bảo mật

### Xác thực

Không bao giờ sử dụng mật khẩu postgres mặc định:

```sql
ALTER USER postgres PASSWORD 'strong_random_password';
```

Tạo người dùng ứng dụng với quyền tối thiểu:

```sql
CREATE USER app_user WITH PASSWORD 'another_strong_password';
GRANT CONNECT ON DATABASE myapp TO app_user;
\c myapp
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### Kết nối SSL/TLS

Chỉnh sửa `postgresql.conf`:

```ini
ssl = on
ssl_cert_file = '/etc/postgresql/server.crt'
ssl_key_file = '/etc/postgresql/server.key'
```

Yêu cầu SSL trong `pg_hba.conf`:

```
hostssl    all    all    0.0.0.0/0    scram-sha-256
```

Khách hàng kết nối với SSL:

```bash
psql "sslmode=require host=db.example.com dbname=myapp user=app_user"
```

### An ninh mạng

Hạn chế quyền truy cập trong `pg_hba.conf`:

```
# Allow only from application servers
host    all    all    10.0.1.0/24    scram-sha-256

# Deny everything else
host    all    all    0.0.0.0/0      reject
```

Sử dụng tường lửa:

```bash
# UFW example
sudo ufw allow from 10.0.1.0/24 to any port 5432
sudo ufw deny 5432
```

### Ghi nhật ký kiểm tra

Đăng nhập các kết nối và lệnh:

```ini
# postgresql.conf
log_connections = on
log_disconnections = on
log_statement = 'mod'  # Log INSERT, UPDATE, DELETE
log_duration = on
```

### Bảo mật cấp hàng

Hạn chế những hàng người dùng có thể truy cập:

```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER,
  content TEXT
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_documents ON documents
  FOR ALL
  TO app_user
  USING (owner_id = current_setting('app.user_id')::INTEGER);

-- In application, set user ID per connection:
SET app.user_id = '123';
SELECT * FROM documents;  -- Only sees user 123's documents
```

## Giám sát

### Số liệu chính

**Số lượng kết nối**:

```sql
SELECT count(*) FROM pg_stat_activity;
SELECT max_connections FROM pg_settings WHERE name = 'max_connections';
```

Cảnh báo nếu kết nối đạt tới max_connections.

**Kích thước cơ sở dữ liệu**:

```sql
SELECT
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;
```

**Kích thước bảng**:

```sql
SELECT
  schemaname AS schema,
  tablename AS table,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

**Tỷ lệ truy cập bộ nhớ đệm** (phải >99%):

```sql
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

Tỷ lệ thấp có nghĩa là bạn cần nhiều bộ nhớ chia sẻ hoặc bộ nhớ hệ thống hơn.

**Truy vấn chạy dài**:

```sql
SELECT
  pid,
  now() - query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE state != 'idle'
  AND now() - query_start > interval '5 minutes'
ORDER BY duration DESC;
```

**Độ trễ sao chép** (nếu sử dụng bản sao):

```sql
-- On replica
SELECT now() - pg_last_xact_replay_timestamp() AS lag;
```

### Công cụ giám sát

**pgAdmin**: GUI có tính năng giám sát tích hợp.

**pg_stat_statements**: Theo dõi hiệu suất truy vấn:

```sql
CREATE EXTENSION pg_stat_statements;

SELECT
  query,
  calls,
  total_exec_time / 1000 AS total_time_seconds,
  mean_exec_time / 1000 AS avg_time_seconds
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

**Prometheus + postgres_exporter**: Thu thập và cảnh báo số liệu.

**Datadog, Relic** mới: Giải pháp giám sát thương mại tích hợp PostgreSQL.

## Điều chỉnh hiệu suất

### Cấu hình

Điều chỉnh `postgresql.conf` dựa trên phần cứng của bạn:

```ini
# Memory (for server with 16GB RAM)
shared_buffers = 4GB              # 25% of RAM
effective_cache_size = 12GB       # 75% of RAM
work_mem = 64MB                   # RAM / max_connections / 4
maintenance_work_mem = 1GB        # For VACUUM, CREATE INDEX

# Connections
max_connections = 200

# Query planning
random_page_cost = 1.1            # Lower for SSD (default 4.0 for HDD)
effective_io_concurrency = 200    # Higher for SSD

# WAL
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB
checkpoint_completion_target = 0.9

# Logging
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_min_duration_statement = 1000 # Log queries slower than 1 second
```

Khởi động lại sau khi thay đổi cấu hình:

```bash
sudo systemctl restart postgresql
```

### Nhóm kết nối

Ứng dụng không nên tạo kết nối mới theo yêu cầu. Sử dụng tổng hợp.

**PgBouncer**:

```bash
# Install
sudo apt install pgbouncer

# Configure /etc/pgbouncer/pgbouncer.ini
[databases]
myapp = host=localhost port=5432 dbname=myapp

[pgbouncer]
listen_addr = *
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25

# Start
sudo systemctl start pgbouncer
```

Các ứng dụng kết nối với cổng 6432 thay vì 5432. PgBouncer sử dụng lại các kết nối cơ sở dữ liệu.

### Hút chân không và phân tích

PostgreSQL cần được bảo trì thường xuyên:

```sql
-- Vacuum recovers space from deleted rows
VACUUM;

-- Vacuum specific table
VACUUM users;

-- Full vacuum (locks table)
VACUUM FULL users;

-- Analyze updates statistics for query planner
ANALYZE;

-- Both together
VACUUM ANALYZE;
```

Bật tính năng tự động hút bụi (bật theo mặc định):

```ini
autovacuum = on
autovacuum_naptime = 1min
autovacuum_vacuum_scale_factor = 0.2
autovacuum_analyze_scale_factor = 0.1
```

Giám sát chân không tự động:

```sql
SELECT
  schemaname,
  tablename,
  last_vacuum,
  last_autovacuum,
  vacuum_count,
  autovacuum_count
FROM pg_stat_user_tables
ORDER BY last_autovacuum;
```

### Lập chỉ mục lại

Xây dựng lại các chỉ mục để lấy lại không gian và cải thiện hiệu suất:

```sql
-- Reindex table
REINDEX TABLE users;

-- Reindex database (takes exclusive locks)
REINDEX DATABASE myapp;

-- Concurrent reindex (PostgreSQL 12+)
REINDEX INDEX CONCURRENTLY idx_users_email;
```

## Lập kế hoạch năng lực

### Dung lượng ổ đĩa

Giám sát việc sử dụng đĩa:

```bash
df -h /var/lib/postgresql
```

Cảnh báo khi đầy 80%. Lên kế hoạch mở rộng dung lượng lưu trữ trước khi đạt 90%.

Tốc độ tăng trưởng cơ sở dữ liệu:

```sql
-- Track database size over time
CREATE TABLE db_size_history (
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  database_name TEXT,
  size_bytes BIGINT
);

-- Run daily
INSERT INTO db_size_history (database_name, size_bytes)
SELECT datname, pg_database_size(datname)
FROM pg_database;

-- View growth
SELECT
  recorded_at::date,
  pg_size_pretty(size_bytes) AS size
FROM db_size_history
WHERE database_name = 'myapp'
ORDER BY recorded_at DESC
LIMIT 30;
```

### Giới hạn kết nối

Nếu bạn nhấn max_connections:

1. **Tăng max_connections** (yêu cầu nhiều bộ nhớ hơn)
2. **Thêm kết nối tổng hợp** (giải pháp tốt hơn)
3. **Tối ưu hóa ứng dụng** để sử dụng ít kết nối hơn

### Đọc bản sao

Tỷ lệ đọc bằng cách thêm bản sao (được đề cập trong phần sao lưu). Ứng dụng gửi các lần đọc tới bản sao, ghi vào chính.

## Tính sẵn sàng cao

### Tự động chuyển đổi dự phòng

Sử dụng các công cụ như **Patroni** hoặc **repmgr** để tự động chuyển đổi dự phòng:

Ví dụ về **Patroni**:

```yaml
# patroni.yml
scope: postgres-cluster
name: node1

restapi:
  listen: 0.0.0.0:8008
  connect_address: node1:8008

etcd:
  hosts: etcd1:2379,etcd2:2379,etcd3:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true

postgresql:
  listen: 0.0.0.0:5432
  connect_address: node1:5432
  data_dir: /var/lib/postgresql/16/main
```

### Cân bằng tải

Sử dụng HAProxy hoặc tương tự để kết nối tuyến đường:

```
# haproxy.cfg
listen postgres
    bind *:5432
    option httpchk
    http-check expect status 200
    default-server inter 3s fall 3 rise 2
    server pg1 pg1:5432 maxconn 100 check port 8008
    server pg2 pg2:5432 maxconn 100 check port 8008 backup
```

## Các sự cố thường gặp về production

### Hiệu suất truy vấn

**Symptom**: Truy vấn chậm

**Chẩn đoán**:
```sql
-- Find slow queries
SELECT query, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Explain specific query
EXPLAIN ANALYZE SELECT ...;
```

**Fix**: Thêm chỉ mục, tối ưu truy vấn, tăng work_mem

### Hết kết nối

**Symptom**: "FATAL: các khe kết nối còn lại được bảo lưu"

**Chẩn đoán**:
```sql
SELECT count(*) FROM pg_stat_activity;
```

**Fix**: Thêm nhóm kết nối, tăng max_connections, đóng các kết nối không hoạt động

### Đĩa đầy

**Symptom**: Cơ sở dữ liệu ngừng chấp nhận ghi

**Chẩn đoán**:
```bash
df -h
```

**Fix**: Xóa bản sao lưu cũ, VACUUM FULL, mở rộng đĩa

### Độ trễ sao chép

**Symptom**: Bản sao kém xa bản chính

**Chẩn đoán**:
```sql
SELECT pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes
FROM pg_stat_replication;
```

**Fix**: Kiểm tra mạng, tăng wal_buffers, nâng cấp phần cứng bản sao

## Thủ tục nâng cấp

### Nâng cấp phiên bản nhỏ

An toàn, thường chỉ:

```bash
sudo apt update
sudo apt upgrade postgresql-16
sudo systemctl restart postgresql
```

Trước tiên hãy thử nghiệm trong staging.

### Nâng cấp phiên bản chính

Yêu cầu pg_upgrade hoặc kết xuất/khôi phục:

```bash
# Install new version
sudo apt install postgresql-17

# Stop both versions
sudo systemctl stop postgresql

# Run pg_upgrade
sudo -u postgres /usr/lib/postgresql/17/bin/pg_upgrade \
  --old-datadir=/var/lib/postgresql/16/main \
  --new-datadir=/var/lib/postgresql/17/main \
  --old-bindir=/usr/lib/postgresql/16/bin \
  --new-bindir=/usr/lib/postgresql/17/bin

# Start new version
sudo systemctl start postgresql@17-main
```

Luôn kiểm tra các bản nâng cấp trong staging và có kế hoạch khôi phục.

## Sách hướng dẫn khắc phục thảm họa

Ghi lại các quy trình từng bước cho:

- Lỗi máy chủ chính
- hỏng dữ liệu
- Vô tình xóa dữ liệu
- Vi phạm an ninh
- Suy giảm hiệu suất

Sổ tay ví dụ:

```
RUNBOOK: Primary Database Server Failure

1. Verify primary is down:
   - Check monitoring alerts
   - Attempt psql connection

2. Promote replica to primary:
   ssh replica-server
   sudo -u postgres pg_ctl promote

3. Update application config:
   - Point database connection to new primary
   - Deploy config change

4. Verify application connectivity:
   - Check application logs
   - Run smoke tests

5. Rebuild old primary as replica:
   - Fix failed server
   - Run pg_basebackup from new primary
   - Configure as replica

6. Post-incident:
   - Document what happened
   - Update runbooks if needed
   - Schedule post-mortem
```

## Danh sách kiểm tra cho production PostgreSQL

- [ ] Mật khẩu mạnh trên tất cả các tài khoản
- [ ] Đã bật mã hóa SSL/TLS
- [ ] Quy tắc tường lửa hạn chế quyền truy cập
- [ ] Sao lưu tự động đang chạy
- [ ] Khôi phục sao lưu được kiểm tra hàng tháng
- [ ] Đã định cấu hình giám sát và cảnh báo
- [ ] Kết nối tổng hợp tại chỗ
- [ ] Đã định cấu hình bản sao
- [ ] Đã bật tính năng tự động hút chân không
- [] pg_stat_statements đã được cài đặt
- [ ] Runbooks được ghi lại
- [ ] Môi trường staging để thử nghiệm
- [ ] Đã thử nghiệm quy trình nâng cấp
- [ ] Kế hoạch khắc phục thảm họa được ghi lại

Chạy PostgreSQL trong production đòi hỏi sự cảnh giác, nhưng với thiết lập và giám sát thích hợp, nó sẽ đáng tin cậy và hoạt động hiệu quả. Bây giờ bạn đã có kiến thức để triển khai PostgreSQL một cách tự tin, từ giai đoạn phát triển đến production.

Hãy tiếp tục học hỏi - PostgreSQL có những tính năng chuyên sâu mà chúng tôi không thể đề cập đến. Khám phá các tiện ích mở rộng (PostGIS cho dữ liệu địa lý, pg_cron cho các công việc đã lên lịch), chiến lược sao chép nâng cao và tối ưu hóa hiệu suất cho khối lượng công việc cụ thể của bạn. Cộng đồng PostgreSQL rất hữu ích - đừng ngần ngại đặt câu hỏi.
