---
title: "Sao lưu, phục hồi và sao chép"
description: Tìm hiểu cách sao lưu cơ sở dữ liệu PostgreSQL, khôi phục từ bản sao lưu và thiết lập bản sao để có tính sẵn sàng cao
order: 9
---

**TLDR**: Sử dụng `pg_dump` để sao lưu hợp lý các cơ sở dữ liệu riêng lẻ. Sử dụng `pg_basebackup` để sao lưu vật lý của toàn bộ cụm. Kiểm tra việc khôi phục thường xuyên - việc sao lưu sẽ vô ích nếu bạn không thể khôi phục. Thiết lập sao chép phát trực tuyến để có tính sẵn sàng cao. Cho phép khôi phục tại thời điểm bằng tính năng lưu trữ WAL.

Mất dữ liệu là thảm họa. Quy trình sao lưu và phục hồi thích hợp sẽ bảo vệ doanh nghiệp của bạn.

## Sao lưu hợp lý với pg_dump

pg_dump tạo các tập lệnh SQL để tạo lại cơ sở dữ liệu của bạn:

```bash
# Backup entire database
pg_dump dbname > backup.sql

# Backup with custom format (compressed, faster restore)
pg_dump -Fc dbname > backup.dump

# Backup specific tables
pg_dump -t users -t posts dbname > partial.sql

# Exclude specific tables
pg_dump --exclude-table=logs dbname > backup.sql

# Include only data (no schema)
pg_dump --data-only dbname > data.sql

# Include only schema (no data)
pg_dump --schema-only dbname > schema.sql
```

### Khôi phục từ pg_dump

```bash
# Restore SQL format
psql dbname < backup.sql

# Restore custom format
pg_restore -d dbname backup.dump

# Restore to a new database
createdb newdb
pg_restore -d newdb backup.dump

# Restore specific tables
pg_restore -t users -d dbname backup.dump

# Restore with multiple jobs (faster)
pg_restore -j 4 -d dbname backup.dump
```

### Sao lưu tất cả cơ sở dữ liệu

```bash
# Backup all databases in cluster
pg_dumpall > all_databases.sql

# Restore
psql -f all_databases.sql postgres
```

pg_dumpall cũng sao lưu các vai trò và không gian bảng.

## Sao lưu vật lý với pg_basebackup

pg_basebackup sao chép toàn bộ thư mục dữ liệu:

```bash
# Create base backup
pg_basebackup -D /backup/postgres -Ft -z -P

# Options:
# -D: backup directory
# -Ft: tar format
# -z: compress with gzip
# -P: show progress
```

Sao lưu vật lý nhanh hơn đối với cơ sở dữ liệu lớn và cho phép khôi phục tại thời điểm.

### Khôi phục từ bản sao lưu cơ sở

```bash
# Stop PostgreSQL
sudo systemctl stop postgresql

# Restore data directory
rm -rf /var/lib/postgresql/16/main/*
tar -xzf backup.tar.gz -C /var/lib/postgresql/16/main/

# Start PostgreSQL
sudo systemctl start postgresql
```

## Lưu trữ liên tục và khôi phục tại thời điểm (PITR)

Lưu trữ các tệp Nhật ký ghi trước (WAL) để khôi phục vào bất kỳ thời điểm nào.

### Thiết lập lưu trữ WAL

Chỉnh sửa `postgresql.conf`:

```ini
# Enable archiving
wal_level = replica
archive_mode = on
archive_command = 'cp %p /archive/%f'

# Or use a script for remote storage:
# archive_command = 'rsync -a %p user@backup-server:/archive/%f'
```

Khởi động lại PostgreSQL:

```bash
sudo systemctl restart postgresql
```

PostgreSQL hiện sao chép các tệp WAL sang `/archive/`.

### Tạo bản sao lưu cơ sở cho PITR

```bash
# Start backup
psql -c "SELECT pg_start_backup('daily_backup');"

# Copy data directory
rsync -a /var/lib/postgresql/16/main/ /backup/base/

# Stop backup
psql -c "SELECT pg_stop_backup();"
```

Hoặc sử dụng pg_basebackup:

```bash
pg_basebackup -D /backup/base -Ft -z
```

### Khôi phục về thời điểm

```bash
# Stop PostgreSQL
sudo systemctl stop postgresql

# Restore base backup
rm -rf /var/lib/postgresql/16/main/*
tar -xzf /backup/base/base.tar.gz -C /var/lib/postgresql/16/main/

# Create recovery.signal file
touch /var/lib/postgresql/16/main/recovery.signal

# Configure recovery in postgresql.conf
echo "restore_command = 'cp /archive/%f %p'" >> /var/lib/postgresql/16/main/postgresql.auto.conf
echo "recovery_target_time = '2024-02-14 14:30:00'" >> /var/lib/postgresql/16/main/postgresql.auto.conf

# Start PostgreSQL - it will replay WAL files
sudo systemctl start postgresql

# Check recovery
psql -c "SELECT pg_is_in_recovery();"

# Once recovered, remove recovery.signal to exit recovery mode
rm /var/lib/postgresql/16/main/recovery.signal
sudo systemctl restart postgresql
```

## Sao chép trực tuyến

Tạo bản sao đọc để có tính sẵn sàng cao và phân phối tải.

### Thiết lập máy chủ chính

Chỉnh sửa `postgresql.conf`:

```ini
# Connection settings
listen_addresses = '*'
max_wal_senders = 3
wal_level = replica
```

Chỉnh sửa `pg_hba.conf`:

```
# Allow replication connections
host    replication     replicator      replica-ip/32       scram-sha-256
```

Tạo người dùng sao chép:

```sql
CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'secure_password';
```

Khởi động lại PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### Thiết lập máy chủ bản sao

```bash
# Stop PostgreSQL on replica
sudo systemctl stop postgresql

# Remove existing data
rm -rf /var/lib/postgresql/16/main/*

# Create base backup from primary
pg_basebackup -h primary-ip -D /var/lib/postgresql/16/main -U replicator -P -v -R -X stream -C -S replica_slot

# Options:
# -R: create standby.signal and replication config
# -X stream: stream WAL while backing up
# -C -S: create replication slot

# Start replica
sudo systemctl start postgresql

# Verify replication
psql -c "SELECT * FROM pg_stat_replication;" # On primary
psql -c "SELECT pg_is_in_recovery();"         # On replica (should return true)
```

### Quảng bá bản sao lên chính

Nếu chính không thành công:

```bash
# On replica
pg_ctl promote -D /var/lib/postgresql/16/main/

# Or in psql
SELECT pg_promote();
```

Bản sao trở thành bản chính mới và chấp nhận ghi.

## Chiến lược dự phòng

### Sao lưu hàng ngày

```bash
#!/bin/bash
# daily_backup.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR=/backups/$DATE

mkdir -p $BACKUP_DIR

# Dump all databases
pg_dumpall -U postgres | gzip > $BACKUP_DIR/all_databases.sql.gz

# Also dump individual databases
for db in $(psql -U postgres -t -c "SELECT datname FROM pg_database WHERE datistemplate = false AND datname != 'postgres';")
do
    pg_dump -U postgres -Fc $db > $BACKUP_DIR/$db.dump
done

# Cleanup old backups (keep 30 days)
find /backups/ -type d -mtime +30 -exec rm -rf {} \;
```

Chạy hàng ngày với cron:

```
0 2 * * * /usr/local/bin/daily_backup.sh
```

### Sao lưu vào bộ nhớ đám mây

```bash
#!/bin/bash
# backup_to_s3.sh

DATE=$(date +%Y%m%d)
BACKUP_FILE="/tmp/backup_$DATE.dump"

# Create backup
pg_dump -Fc dbname > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://my-backups/postgres/$DATE/

# Cleanup local copy
rm $BACKUP_FILE
```

### Sao lưu gia tăng với WAL-E hoặc pgBackRest

Đối với cơ sở dữ liệu lớn, hãy sử dụng các công cụ hỗ trợ sao lưu gia tăng:

**pgBackRest**:

```bash
# Install
sudo apt install pgbackrest

# Configure /etc/pgbackrest/pgbackrest.conf
[global]
repo1-path=/backup/pgbackrest
repo1-retention-full=4

[mydb]
pg1-path=/var/lib/postgresql/16/main

# Full backup
pgbackrest --stanza=mydb --type=full backup

# Incremental backup
pgbackrest --stanza=mydb --type=incr backup

# Restore
pgbackrest --stanza=mydb restore
```

## Kiểm tra khôi phục

**Critical**: Kiểm tra bản sao lưu của bạn thường xuyên. Các bản sao lưu chưa được kiểm tra là vô giá trị.

```bash
# Monthly restore test
#!/bin/bash

# Create test database
createdb restore_test

# Restore latest backup
pg_restore -d restore_test /backups/latest.dump

# Run basic queries to verify
psql restore_test -c "SELECT COUNT(*) FROM users;"
psql restore_test -c "SELECT COUNT(*) FROM orders;"

# Drop test database
dropdb restore_test

echo "Restore test completed successfully"
```

Lập kế hoạch này hàng tháng và cảnh báo nếu nó thất bại.

## Giám sát nhân rộng

```sql
-- On primary: check replication status
SELECT
  client_addr,
  state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  sync_state
FROM pg_stat_replication;

-- On replica: check replication lag
SELECT
  now() - pg_last_xact_replay_timestamp() AS replication_lag;
```

Cảnh báo nếu độ trễ vượt quá ngưỡng chấp nhận được (ví dụ: 1 phút).

## Kế hoạch khắc phục thảm họa

Ghi lại quy trình khôi phục của bạn:

1. **Xác định loại lỗi**: Phần cứng, hỏng, vô tình xóa, độc hại

2. **Dừng ghi nếu có thể**: Ngăn chặn thiệt hại thêm

3. **Ađánh giá tình trạng mất dữ liệu**: Mất gì? Nó xảy ra khi nào?

4. **Chọn phương thức khôi phục**:
   - Sao lưu gần đây: Khôi phục từ pg_dump
   - Cần vào đúng thời điểm: Sử dụng PITR
   - Lỗi chính: Quảng cáo bản sao

5. **Ethực thi recovery**: Thực hiện theo các bước đã ghi trong tài liệu

6. **Xác minh dữ liệu**: Chạy truy vấn để xác nhận tính toàn vẹn dữ liệu

7. **Tiếp tục hoạt động**: Trỏ ứng dụng vào cơ sở dữ liệu đã khôi phục

8. **Post-mortem**: Ghi lại những gì đã xảy ra và ngăn ngừa tái diễn

## Thực tiễn tốt nhất về sao lưu

**3-2-1 Rule**: 3 bản sao dữ liệu, 2 loại phương tiện khác nhau, 1 bản ngoại vi.

**Tự động hóa mọi thứ**: Tập lệnh, giám sát, cảnh báo.

**Test khôi phục**: Tối thiểu hàng tháng.

**Theo dõi trạng thái sao lưu**: Cảnh báo về lỗi.

**ESao lưu mã hóa**: Đặc biệt đối với dữ liệu nhạy cảm.

**DQuy trình tài liệu**: Vì vậy, bất kỳ ai cũng có thể khôi phục, không chỉ riêng bạn.

**Giữ nhiều phiên bản**: Không ghi đè lên các bản sao lưu ngay lập tức.

**Bộ nhớ sao lưu riêng**: Không sao lưu vào cùng đĩa/máy chủ với cơ sở dữ liệu.

Bản sao lưu bảo vệ khỏi các lỗi phần cứng, lỗi, tác nhân độc hại và lỗi của con người. Hãy coi trọng chúng. Tiếp theo, chúng tôi sẽ đề cập đến các phương pháp hay nhất về production - mọi thứ bạn cần để chạy PostgreSQL một cách đáng tin cậy trong môi trường thực.
