---
title: "Công cụ Bash phổ biến"
description: Khám phá các công cụ và tiện ích dòng lệnh thiết yếu hoạt động cùng với Bash để nâng cao khả năng tạo tập lệnh của bạn
order: 9
---

Bash trở nên thực sự mạnh mẽ khi được kết hợp với nhiều công cụ dòng lệnh có sẵn trên các hệ thống giống Unix. Trong phần này, chúng ta sẽ khám phá các công cụ phổ biến mà bạn sẽ thường xuyên sử dụng trong tập lệnh Bash để xử lý văn bản, giám sát hệ thống, v.v.

## Công cụ xử lý văn bản

### Grep - Tìm kiếm mẫu

`grep` tìm kiếm các mẫu trong văn bản, khiến việc tìm kiếm nội dung cụ thể trở nên vô giá:

```bash
# Basic pattern search
grep "error" logfile.txt

# Case-insensitive search
grep -i "error" logfile.txt

# Show line numbers
grep -n "error" logfile.txt

# Show only matching filenames
grep -l "error" *.log

# Recursive search in directories
grep -r "function" /path/to/code

# Invert match (show lines that don't match)
grep -v "debug" logfile.txt

# Use regular expressions
grep -E "error|warning" logfile.txt

# Count matching lines
grep -c "error" logfile.txt
```

### Sed - Trình chỉnh sửa luồng

`sed` là một công cụ mạnh mẽ để chuyển đổi văn bản:

```bash
# Replace text (first occurrence in each line)
sed 's/old/new/' file.txt

# Replace all occurrences
sed 's/old/new/g' file.txt

# Replace on specific lines
sed '3s/old/new/' file.txt  # Replace on line 3

# Delete lines
sed '5d' file.txt  # Delete line 5
sed '/pattern/d' file.txt  # Delete lines matching pattern

# Insert text
sed '2i\New line' file.txt  # Insert before line 2
sed '2a\New line' file.txt  # Append after line 2

# Edit files in-place (change the original file)
sed -i 's/old/new/g' file.txt

# Multiple commands
sed -e 's/old/new/g' -e '/pattern/d' file.txt
```

### Awk - Quét và xử lý mẫu

`awk` đặc biệt tốt cho việc xử lý văn bản dựa trên cột:

```bash
# Print specific columns (fields)
awk '{print $1, $3}' file.txt  # Print 1st and 3rd fields

# Use custom field separator
awk -F: '{print $1, $3}' /etc/passwd  # Colon-separated fields

# Filtering with patterns
awk '$3 > 100 {print $1, $3}' data.txt  # Print if 3rd field > 100

# Calculate sum
awk '{sum += $1} END {print "Sum:", sum}' numbers.txt

# Calculate average
awk '{sum += $1; count++} END {print "Average:", sum/count}' numbers.txt

# Built-in variables
# NF: Number of fields, NR: Record number
awk '{print NR, $1, $NF}' file.txt  # Print line number, first field, last field
```

### Cắt - Trích xuất các phần từ dòng

`cut` đơn giản hơn `awk` nhưng tuyệt vời để trích xuất cột đơn giản:

```bash
# Extract by character position
cut -c 1-5 file.txt  # Characters 1 to 5

# Extract by delimiter and field
cut -d "," -f 1,3 data.csv  # Fields 1 and 3 from CSV
cut -d ":" -f 1 /etc/passwd  # First field from passwd file
```

### Sắp xếp - Sắp xếp dòng

`sort` sắp xếp các dòng theo thứ tự cụ thể:

```bash
# Basic sorting
sort file.txt

# Numeric sort
sort -n numbers.txt

# Reverse sort
sort -r file.txt

# Sort by specific field
sort -k 2 file.txt  # Sort by second field
sort -t "," -k 3 data.csv  # Sort CSV by third field

# Remove duplicates (after sorting)
sort -u file.txt
```

### Uniq - Báo cáo hoặc Lọc các dòng lặp lại

`uniq` hoạt động trên đầu vào được sắp xếp để quản lý các dòng lặp lại:

```bash
# Remove duplicate consecutive lines
sort file.txt | uniq

# Count occurrences
sort file.txt | uniq -c

# Show only duplicated lines
sort file.txt | uniq -d

# Show only unique lines (appearing exactly once)
sort file.txt | uniq -u
```

### Tr - Dịch ký tự

`tr` dùng để dịch hoặc xóa ký tự:

```bash
# Replace characters
echo "Hello" | tr 'a-z' 'A-Z'  # Convert to uppercase

# Delete characters
echo "Hello 123" | tr -d '0-9'  # Remove digits

# Squeeze repeated characters
echo "Hello   world" | tr -s ' '  # Reduce multiple spaces to single
```

### Wc - Đếm dòng, từ và ký tự

`wc` rất hữu ích cho việc đếm:

```bash
# Count lines, words, and characters
wc file.txt

# Count only lines
wc -l file.txt

# Count only words
wc -w file.txt

# Count only characters
wc -c file.txt
```

## Công cụ tập tin và thư mục

### Find - Tìm kiếm tập tin

`find` cực kỳ linh hoạt để định vị tệp:

```bash
# Find by name
find /path -name "*.txt"

# Case-insensitive name search
find /path -iname "*.txt"

# Find by type
find /path -type f  # Files only
find /path -type d  # Directories only

# Find by size
find /path -size +10M  # Larger than 10MB
find /path -size -10k  # Smaller than 10KB

# Find by modification time
find /path -mtime -7  # Modified in the last 7 days
find /path -mmin -60  # Modified in the last 60 minutes

# Execute commands on found files
find /path -name "*.log" -exec ls -l {} \;
find /path -name "*.log" -exec rm {} \;

# Find and delete with confirmation
find /path -name "*.tmp" -exec rm -i {} \;
```

### Xargs - Xây dựng và thực thi lệnh

`xargs` nhận đầu vào từ một lệnh và chuyển nó dưới dạng đối số cho lệnh khác:

```bash
# Find and delete files
find /path -name "*.tmp" | xargs rm

# Parallel processing (GNU xargs)
find /path -name "*.jpg" | xargs -P 4 -I {} convert {} {}.png

# Handle filenames with spaces
find /path -name "*.txt" -print0 | xargs -0 grep "pattern"
```

### Rsync - Truyền tệp hiệu quả

`rsync` là công cụ tuyệt vời để sao lưu và đồng bộ hóa tệp:

```bash
# Sync directories
rsync -av source_dir/ destination_dir/

# Remote sync over SSH
rsync -av -e ssh source_dir/ user@remote:destination_dir/

# Dry run (show what would be done)
rsync -av --dry-run source_dir/ destination_dir/

# Exclude patterns
rsync -av --exclude="*.tmp" source_dir/ destination_dir/

# Delete files at destination that don't exist in source
rsync -av --delete source_dir/ destination_dir/
```

## Công cụ thông tin hệ thống

### Ps - Trạng thái tiến trình

`ps` hiển thị các tiến trình đang chạy:

```bash
# Basic process listing
ps

# Detailed process listing
ps -ef

# BSD-style full listing
ps aux

# Filter by process name
ps aux | grep firefox

# Show process hierarchy
ps -ejH
ps axjf  # BSD-style tree
```

### Top/htop - Trình xem quy trình tương tác

`top` và `htop` cung cấp khả năng giám sát hệ thống theo thời gian thực:

```bash
# Basic monitoring
top

# Sort by memory usage (in top)
top -o %MEM

# Batch mode (non-interactive)
top -b -n 1
```

Cài đặt và sử dụng `htop` để có giao diện thân thiện hơn:

```bash
# Install htop (Debian/Ubuntu)
apt install htop

# Install htop (Red Hat/CentOS)
yum install htop

# Run htop
htop
```

### Df - Dung lượng trống trên đĩa

`df` báo cáo mức sử dụng dung lượng ổ đĩa hệ thống tệp:

```bash
# Show all filesystems
df

# Human-readable sizes
df -h

# Show specific filesystem
df -h /home
```

### Du - Sử dụng đĩa

`du` ước tính mức sử dụng dung lượng tệp:

```bash
# Summary of a directory
du -sh /path/to/dir

# List all subdirectories with sizes
du -h --max-depth=1 /path/to/dir

# Sort directories by size
du -h --max-depth=1 /path/to/dir | sort -hr
```

### Miễn phí - Sử dụng bộ nhớ

`free` hiển thị dung lượng bộ nhớ trống và đã sử dụng:

```bash
# Show memory usage
free

# Human-readable format
free -h

# Show in megabytes
free -m
```

### Dmesg - Tin nhắn hệ thống

`dmesg` hiển thị các thông báo liên quan đến kernel:

```bash
# View recent kernel messages
dmesg

# Follow new messages
dmesg -w

# Show human-readable timestamps
dmesg -T
```

## Công cụ mạng

### Curl - Truyền dữ liệu từ URL

`curl` là một công cụ mạnh mẽ để thực hiện các yêu cầu HTTP:

```bash
# Simple GET request
curl https://example.com

# Save output to a file
curl -o output.html https://example.com

# Follow redirects
curl -L https://example.com

# HTTP POST
curl -X POST -d "param1=value1&param2=value2" https://example.com/form

# JSON POST
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://api.example.com

# Authentication
curl -u username:password https://example.com

# Download with progress bar
curl -# -O https://example.com/file.zip
```

### Wget - Trình tải xuống mạng

`wget` là công cụ tuyệt vời để tải tập tin:

```bash
# Download a file
wget https://example.com/file.zip

# Continue interrupted download
wget -c https://example.com/file.zip

# Recursive download
wget -r -np -k https://example.com/

# Download with a different filename
wget -O output.zip https://example.com/file.zip

# Download in background
wget -b https://example.com/file.zip
```

### Ping - Kiểm tra kết nối mạng

`ping` gửi gói ICMP ECHO_REQUEST đến máy chủ mạng:

```bash
# Basic ping
ping google.com

# Limit number of packets
ping -c 5 google.com

# Specify timeout
ping -W 2 google.com
```

### Netstat - Thống kê mạng

`netstat` hiển thị các kết nối mạng và bảng định tuyến:

```bash
# List all TCP connections
netstat -at

# List all listening ports
netstat -ltun

# Show process ID for each connection
netstat -tupl

# Routing table
netstat -r
```

Trên một số hệ thống, `ss` là sự thay thế hiện đại cho `netstat`:

```bash
# List all TCP connections
ss -ta

# List all listening ports
ss -ltn
```

### Nslookup/dig - Tra cứu DNS

Các công cụ này truy vấn máy chủ DNS:

```bash
# Simple DNS lookup with nslookup
nslookup example.com

# Detailed DNS lookup with dig
dig example.com

# Query specific record types
dig MX example.com  # Mail servers
dig NS example.com  # Name servers
```

## Công cụ lưu trữ và nén

### Tar - Lưu trữ tập tin

`tar` tạo và trích xuất các kho lưu trữ:

```bash
# Create tar archive
tar -cf archive.tar file1 file2 dir1

# Create gzipped tar archive
tar -czf archive.tar.gz file1 file2 dir1

# Create bzip2 compressed archive
tar -cjf archive.tar.bz2 file1 file2 dir1

# Extract tar archive
tar -xf archive.tar

# Extract gzipped archive
tar -xzf archive.tar.gz

# Extract to specific directory
tar -xzf archive.tar.gz -C /target/directory

# List contents without extracting
tar -tf archive.tar
```

### Gzip/gunzip - Nén/Giải nén tập tin

`gzip` nén các tệp ở định dạng gzip:

```bash
# Compress file
gzip file.txt  # Creates file.txt.gz and removes original

# Decompress file
gunzip file.txt.gz

# Keep original file when compressing
gzip -c file.txt > file.txt.gz

# Specify compression level (1-9, 9 is best compression)
gzip -9 file.txt
```

### Zip/unzip - Tạo/Giải nén kho lưu trữ ZIP

Định dạng `zip` tương thích rộng rãi trên các nền tảng:

```bash
# Create zip archive
zip archive.zip file1 file2 dir1

# Recursively include directories
zip -r archive.zip dir1 dir2

# Add password protection
zip -e archive.zip file1 file2

# Extract zip archive
unzip archive.zip

# Extract to specific directory
unzip archive.zip -d /target/directory

# List contents without extracting
unzip -l archive.zip
```

## Công cụ ngày và giờ

### Ngày - Hiển thị hoặc đặt ngày và giờ

`date` rất hữu ích cho việc tính toán dấu thời gian và ngày:

```bash
# Current date and time
date

# Format date
date "+%Y-%m-%d %H:%M:%S"  # 2024-05-17 14:30:45

# Format components
date "+Year: %Y, Month: %m, Day: %d"

# Unix timestamp (seconds since epoch)
date +%s

# Convert timestamp to date
date -d @1621234567

# Date arithmetic (GNU date)
date -d "next day"
date -d "last week"
date -d "3 days ago"
date -d "2 months ago"
```

### Cal - Hiển thị lịch

`cal` hiển thị lịch đơn giản:

```bash
# Current month
cal

# Specific month and year
cal 9 2024  # September 2024

# Entire year
cal 2024
```

## So sánh tập tin

### Diff - So sánh các tệp theo từng dòng

`diff` hiển thị sự khác biệt giữa các tệp:

```bash
# Basic comparison
diff file1.txt file2.txt

# Side-by-side comparison
diff -y file1.txt file2.txt

# Ignore whitespace
diff -w file1.txt file2.txt

# Create a patch file
diff -u file1.txt file2.txt > changes.patch
```

### Cmp - So sánh các tệp theo byte

`cmp` hữu ích cho các tệp nhị phân hoặc khi bạn chỉ muốn biết liệu các tệp có khác nhau hay không:

```bash
# Check if files are identical
cmp file1.bin file2.bin

# Show all differences
cmp -l file1.bin file2.bin
```

### Md5sum/sha256sum - Tính tổng kiểm tra

Tổng kiểm tra xác minh tính toàn vẹn của tập tin:

```bash
# Calculate MD5 checksum
md5sum file.iso

# Calculate SHA-256 checksum
sha256sum file.iso

# Verify against a checksum file
sha256sum -c checksums.txt
```

## Giám sát và kiểm soát công việc

### Watch - Chạy lệnh định kỳ

`watch` lặp lại lệnh đều đặn:

```bash
# Run 'ls' every 2 seconds (default)
watch ls -l

# Custom interval (0.5 seconds)
watch -n 0.5 'ls -l'

# Highlight differences between updates
watch -d 'ls -l'
```

### Nohup - Chạy lệnh miễn nhiễm với Hangups

`nohup` chạy lệnh tiếp tục chạy sau khi bạn đăng xuất:

```bash
# Run a command in the background, immune to hangups
nohup long_running_command &

# Redirect output
nohup long_running_command > output.log 2>&1 &
```

### Screen/tmux - Bộ ghép kênh đầu cuối

Những công cụ này cho phép bạn chạy và tách khỏi phiên cuối:

```bash
# Start a new screen session
screen

# Detach from current session (Ctrl+A, then D)

# List sessions
screen -ls

# Reattach to a session
screen -r [session_id]
```

Đối với `tmux`:

```bash
# Start a new tmux session
tmux

# Detach from current session (Ctrl+B, then D)

# List sessions
tmux ls

# Reattach to a session
tmux attach -t [session_id]
```

> **Cần một máy chủ để thực hành các công cụ Bash này?** Nếu bạn muốn có một môi trường chuyên dụng để thử nghiệm các công cụ này, hãy cân nhắc việc thiết lập DigitalOcean Droplet. Các gói cơ bản của họ bắt đầu chỉ với $4/tháng và bạn có thể nhận được khoản tín dụng $200 bằng cách sử dụng liên kết này: [https://m.do.co/c/2a9bba940f39](https://m.do.co/c/2a9bba940f39)

## Kết hợp các công cụ: Ví dụ thực tế

Sức mạnh thực sự của Bash đến từ việc kết hợp những công cụ này. Dưới đây là một số ví dụ thực tế:

### Tìm và thay thế trên nhiều tệp

```bash
# Find all PHP files and replace a string
find . -name "*.php" -type f -exec sed -i 's/old_function/new_function/g' {} \;

# Alternative using grep and xargs
grep -l "old_function" $(find . -name "*.php") | xargs sed -i 's/old_function/new_function/g'
```

### Giám sát việc sử dụng tài nguyên hệ thống

```bash
# Watch system resources
watch -n 2 'ps aux | sort -rk 3 | head -10'  # Top 10 CPU users
watch -n 2 'ps aux | sort -rk 4 | head -10'  # Top 10 memory users
watch -n 5 'df -h'  # Disk usage updates

# Log resource usage over time
while true; do
    date >> resource_log.txt
    echo "==== CPU USAGE ====" >> resource_log.txt
    top -b -n 1 | head -20 >> resource_log.txt
    echo "==== MEMORY USAGE ====" >> resource_log.txt
    free -m >> resource_log.txt
    echo "==== DISK USAGE ====" >> resource_log.txt
    df -h >> resource_log.txt
    echo -e "\n\n" >> resource_log.txt
    sleep 300  # Every 5 minutes
done
```

### Xử lý tệp nhật ký

```bash
# Extract IP addresses from logs and count occurrences
grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' access.log | sort | uniq -c | sort -nr | head -10

# Find all 404 errors
grep ' 404 ' access.log | awk '{print $7}' | sort | uniq -c | sort -nr

# Extract all URLs requested by a specific IP
grep '192\.168\.1\.1' access.log | awk '{print $7}' | sort | uniq -c | sort -nr
```

### Tập lệnh sao lưu có xoay

```bash
#!/bin/bash

# Backup directories
backup_dirs=("/home/user/documents" "/var/www" "/etc")
backup_dest="/mnt/backups"
date_format=$(date +"%Y%m%d")
max_backups=5

# Create backup name
backup_file="backup_${date_format}.tar.gz"

# Create backup
echo "Creating backup: $backup_file"
tar -czf "${backup_dest}/${backup_file}" "${backup_dirs[@]}"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully"
else
    echo "Backup failed"
    exit 1
fi

# Rotate old backups (keep only the most recent max_backups)
echo "Rotating old backups..."
ls -t "${backup_dest}"/backup_*.tar.gz | tail -n +$((max_backups + 1)) | xargs -r rm -f

echo "Backup rotation completed"
```

### Giám sát tính khả dụng của trang web

```bash
#!/bin/bash

# Website to check
website="https://example.com"
check_interval=300  # seconds
log_file="website_monitoring.log"

while true; do
    timestamp=$(date +"%Y-%m-%d %H:%M:%S")

    # Check if the website is responding
    http_status=$(curl -s -o /dev/null -w "%{http_code}" "$website")

    if [ "$http_status" -eq 200 ]; then
        status="UP"
    else
        status="DOWN (HTTP Status: $http_status)"
        # Send alert (example: email)
        echo "Website $website is DOWN at $timestamp" | mail -s "Website Alert" admin@example.com
    fi

    # Log the status
    echo "$timestamp - $website - $status" >> "$log_file"

    # Wait for next check
    sleep "$check_interval"
done
```

Các công cụ và kỹ thuật được đề cập trong phần này sẽ nâng cao đáng kể khả năng viết kịch bản Bash của bạn. Bằng cách kết hợp các công cụ này một cách sáng tạo, bạn có thể giải quyết các vấn đề phức tạp và tự động hóa nhiều tác vụ khác nhau. Trong phần tiếp theo, chúng ta sẽ khám phá các phương pháp hay nhất về cách viết tập lệnh Bash để giúp bạn viết các tập lệnh mạnh mẽ hơn và dễ bảo trì hơn.
