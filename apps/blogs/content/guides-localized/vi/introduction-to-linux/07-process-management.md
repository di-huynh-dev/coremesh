---
title: "Quản lý tiến trình"
description: Tìm hiểu cách giám sát, kiểm soát và tối ưu hóa các quy trình đang chạy trên hệ thống Linux của bạn.
order: 7
---

Hiểu cách quản lý các quy trình là điều cần thiết để quản trị hiệu quả các hệ thống Linux. Cho dù bạn đang khắc phục sự cố sử dụng CPU ở mức cao, xác định rò rỉ bộ nhớ hay chỉ đơn giản là kiểm tra những gì đang chạy trên hệ thống của mình thì kỹ năng quản lý tiến trình là không thể thiếu.

Trong phần này, chúng ta sẽ khám phá cách các quy trình hoạt động trong Linux và tìm hiểu các lệnh để giám sát, kiểm soát và tối ưu hóa chúng.

## Hiểu quy trình Linux

### Một quy trình là gì?

Một tiến trình là một phiên bản đang chạy của một chương trình. Mỗi quá trình có:

- ID tiến trình duy nhất (PID)
- Một tiến trình cha (PPID)
- Bộ nhớ và tài nguyên được phân bổ
- Xử lý trạng thái (đang chạy, đang ngủ, đã dừng, v.v.)
- Chủ sở hữu và quyền

### Vòng đời của quy trình

1. **Creation**: Khi một chương trình được thực thi, kernel sẽ tạo một tiến trình mới
2. **Running**: Quá trình sử dụng thời gian CPU để thực hiện các hướng dẫn
3. **Waiting**: Quá trình có thể chờ tài nguyên hoặc đầu vào
4. **Termination**: Quá trình hoàn thành hoặc kết thúc

### Phân cấp quy trình

Các quy trình Linux tạo thành một cấu trúc cây:

- Quy trình `init` (hoặc `systemd` trên các hệ thống hiện đại) là quy trình đầu tiên có PID 1
- Tất cả các quy trình khác là hậu duệ của quy trình ban đầu này
- Mỗi tiến trình (trừ PID 1) có một tiến trình cha

Xem cây quy trình với:

```bash
pstree
```

Hoặc ở định dạng chi tiết hơn:

```bash
ps f -e
```

## Giám sát quy trình cơ bản

### Lệnh ps

`ps` là lệnh cơ bản nhất để xem các tiến trình:

```bash
ps
```

Điều này chỉ hiển thị các quy trình trong thiết bị đầu cuối hiện tại. Để biết thêm thông tin hữu ích, hãy thêm tùy chọn:

```bash
ps aux
```

Các tùy chọn có nghĩa là:

- `a`: Hiển thị các tiến trình từ tất cả người dùng
- `u`: Hiển thị định dạng chi tiết hướng đến người dùng
- `x`: Bao gồm các quy trình không có thiết bị đầu cuối điều khiển

Các cột phổ biến ở đầu ra:

- `USER`: Chủ sở hữu quy trình
- `PID`: ID tiến trình
- `%CPU`: Mức sử dụng CPU
- `%MEM`: Mức sử dụng bộ nhớ
- `VSZ`: Kích thước bộ nhớ ảo
- `RSS`: Kích thước cài đặt thường trú (bộ nhớ vật lý)
- `TTY`: Terminal liên kết với tiến trình
- `STAT`: Quá trình trạng thái
- `START`: Thời gian bắt đầu
- `TIME`: Thời gian sử dụng CPU
- `COMMAND`: Lệnh có đối số

Các trạng thái quy trình chung:

- `R`: Đang chạy
- `S`: Ngủ (gián đoạn)
- `D`: Giấc ngủ không gián đoạn
- `Z`: Thây ma
- `T`: Đã dừng

Liệt kê các quy trình theo một người dùng cụ thể:

```bash
ps -u username
```

Nhận thông tin chi tiết về một quy trình cụ thể:

```bash
ps -fp PID
```

### Lệnh hàng đầu

`top` cung cấp chế độ xem các quy trình theo thời gian thực năng động:

```bash
top
```

Thông tin chính được hiển thị:

- Tóm tắt hệ thống (thời gian hoạt động, mức tải trung bình, mức sử dụng CPU, mức sử dụng bộ nhớ)
- Danh sách quy trình được sắp xếp theo mức sử dụng CPU theo mặc định

Các lệnh bàn phím `top` hữu ích:

- `q`: Thoát
- `h`: Hiển thị trợ giúp
- `k`: Hủy tiến trình (nhập PID khi được nhắc)
- `r`: Gia hạn quy trình (thay đổi mức độ ưu tiên)
- `f`: Chọn các trường để hiển thị
- `o` hoặc `O`: Thay đổi thứ tự sắp xếp
- `u`: Lọc theo người dùng
- `M`: Sắp xếp theo mức sử dụng bộ nhớ
- `P`: Sắp xếp theo mức sử dụng CPU
- `1`: Chuyển đổi số liệu thống kê lõi CPU riêng lẻ

### Lệnh htop

`htop` là phiên bản cải tiến của `top` với giao diện thân thiện hơn với người dùng:

```bash
# Install if not available
sudo apt install htop    # Debian/Ubuntu
sudo dnf install htop    # Fedora/RHEL/CentOS

# Run htop
htop
```

Ưu điểm của `htop`:

- Đầu ra được mã hóa màu
- Trình bày trực quan về việc sử dụng CPU và bộ nhớ
- Hỗ trợ chuột
- Cuộn ngang và dọc
- Giao diện người dùng trực quan hơn
- Khả năng tích hợp để tìm kiếm, lọc và sắp xếp

Các lệnh bàn phím `htop` chính:

- `F1-F10`: hàm hiển thị ở phía dưới
- `F5`: Chế độ xem dạng cây
- `F6`: Sắp xếp theo các cột khác nhau
- `F9`: Quá trình tiêu diệt
- `/`: Tìm kiếm

### Các trạng thái và thông tin của quy trình

Nhận ảnh chụp nhanh các quy trình hiện tại:

```bash
ps -eo pid,ppid,cmd,%cpu,%mem --sort=-%cpu | head
```

Điều này cho thấy 10 quy trình sử dụng nhiều CPU nhất.

Đối với môi trường hoàn chỉnh của một quy trình:

```bash
cat /proc/PID/environ | tr '\0' '\n'
```

Xem các tập tin đang mở cho một quá trình:

```bash
lsof -p PID
```

Kiểm tra những gì đang sử dụng một tập tin cụ thể:

```bash
lsof /path/to/file
```

Xem giới hạn quy trình:

```bash
cat /proc/PID/limits
```

## Kiểm soát quá trình

### Gửi tín hiệu

Các tiến trình giao tiếp bằng tín hiệu. Các tín hiệu phổ biến bao gồm:

- `SIGTERM` (15): Yêu cầu chấm dứt duyên dáng
- `SIGKILL` (9): Chấm dứt cưỡng bức
- `SIGHUP` (1): Cúp máy, thường dùng để tải lại cấu hình
- `SIGINT` (2): Ngắt (những gì Ctrl+C gửi)
- `SIGSTOP` (19): Tạm dừng quá trình
- `SIGCONT` (18): Tiếp tục quá trình đang tạm dừng

Gửi tín hiệu bằng lệnh `kill`:

```bash
kill PID               # Send SIGTERM
kill -9 PID            # Send SIGKILL
kill -HUP PID          # Send SIGHUP
```

Gửi tín hiệu đến các tiến trình theo tên với `pkill`:

```bash
pkill process_name     # Send SIGTERM
pkill -9 process_name  # Send SIGKILL
```

Gửi tín hiệu đến tất cả các quy trình của người dùng:

```bash
pkill -u username
```

### Quá trình tiền cảnh và nền

Khi chạy lệnh trong terminal:

- Các tiến trình tiền cảnh chiếm thiết bị đầu cuối cho đến khi hoàn thành
- Các tiến trình nền chạy mà không chiếm thiết bị đầu cuối

Chạy lệnh ở chế độ nền bằng cách thêm `&`:

```bash
command &
```

Gửi một tiến trình tiền cảnh đang chạy tới nền:

1. Nhấn `Ctrl+Z` để tạm dừng quá trình
2. Chạy `bg` để tiếp tục ở chế độ nền

Đưa một quá trình nền lên nền trước:

```bash
fg %job_number
```

hoặc đơn giản là:

```bash
fg
```

Liệt kê các công việc nền:

```bash
jobs
```

### Ưu tiên xử lý với nice và renice

Linux sử dụng giá trị độ đẹp từ -20 (mức độ ưu tiên cao nhất) đến 19 (mức độ ưu tiên thấp nhất) để xác định mức độ ưu tiên lập lịch trình.

Bắt đầu một quá trình với một mức độ cụ thể:

```bash
nice -n 10 command     # Start with lower priority
```

Thay đổi tính độc đáo của một tiến trình đang chạy:

```bash
renice 10 -p PID       # Lower priority
```

Chỉ root mới có thể đặt giá trị độ đẹp âm:

```bash
sudo nice -n -10 command     # Start with higher priority
sudo renice -10 -p PID       # Increase priority
```

### Giới hạn tài nguyên với ulimit

Giới hạn tài nguyên mà quy trình có thể sử dụng với `ulimit`:

```bash
# Show all limits
ulimit -a

# Set maximum file size (in KB)
ulimit -f 1000

# Set maximum number of open files
ulimit -n 2048
```

Đặt giới hạn vĩnh viễn trong `/etc/security/limits.conf`.

## Giám sát và quản lý CPU

### Xem thông tin CPU

Nhận thông tin chi tiết về CPU:

```bash
lscpu
```

Hoặc thông tin phần cứng chi tiết hơn:

```bash
sudo dmidecode -t processor
```

Kiểm tra mức tải trung bình của CPU:

```bash
uptime
```

Ba con số hiển thị mức trung bình tải trong 1 phút, 5 phút và 15 phút. Mức tải trung bình gần với số lõi CPU cho biết mức sử dụng tối đa.

### Phân tích hiệu suất CPU

Để phân tích mức sử dụng CPU chi tiết, hãy sử dụng `mpstat`:

```bash
# Install if not available
sudo apt install sysstat    # Debian/Ubuntu
sudo dnf install sysstat    # Fedora/RHEL/CentOS

# Show CPU statistics
mpstat

# Show per-CPU statistics every 2 seconds
mpstat -P ALL 2
```

Để sử dụng CPU theo quy trình cụ thể theo thời gian:

```bash
pidstat 2
```

### Kiểm soát thống đốc CPU

CPU hiện đại hỗ trợ mở rộng tần số. Điều khiển bộ điều tốc CPU:

```bash
# Show current CPU frequency
cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_cur_freq

# Show available governors
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_governors

# Set performance governor (requires root)
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## Giám sát và quản lý bộ nhớ

### Xem thông tin bộ nhớ

Nhận mức sử dụng bộ nhớ cơ bản:

```bash
free -h
```

Điều này cho thấy:

- Tổng bộ nhớ
- Bộ nhớ đã sử dụng
- Bộ nhớ trống
- Bộ nhớ dùng chung
- Bộ đệm/bộ đệm
- Bộ nhớ khả dụng (bộ đệm/bộ nhớ đệm miễn phí + có thể lấy lại)

Để biết thêm thông tin chi tiết về bộ nhớ:

```bash
cat /proc/meminfo
```

### Sử dụng bộ nhớ theo quy trình

Tìm các tiến trình sử dụng nhiều bộ nhớ nhất:

```bash
ps -eo pid,ppid,cmd,%mem --sort=-%mem | head
```

Đối với một quy trình cụ thể:

```bash
pmap PID
```

### Quản lý Hoán đổi

Xem thông tin trao đổi:

```bash
swapon --show
```

Tạo và kích hoạt tệp hoán đổi:

```bash
# Create a 2GB swap file
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent by adding to /etc/fstab
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Điều chỉnh hành vi sử dụng trao đổi:

```bash
# Show current swappiness (0-100, lower means less swap usage)
cat /proc/sys/vm/swappiness

# Set temporarily
sudo sysctl vm.swappiness=10

# Set permanently
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

## Giám sát I/O đĩa

### Thống kê I/O cơ bản

Lệnh `iostat` cung cấp số liệu thống kê I/O của đĩa:

```bash
# Install if not available (part of sysstat)
sudo apt install sysstat    # Debian/Ubuntu
sudo dnf install sysstat    # Fedora/RHEL/CentOS

# Show I/O statistics
iostat

# Show extended stats every 2 seconds
iostat -x 2
```

Các cột chính:

- `r/s`, `w/s`: Đọc và ghi mỗi giây
- `rkB/s`, `wkB/s`: Đọc và ghi kilobyte mỗi giây
- `await`: Thời gian trung bình cho các yêu cầu I/O (mili giây)
- `%util`: Phần trăm thời gian CPU đưa ra yêu cầu I/O

### Vào/ra theo quy trình

Tìm xem tiến trình nào đang thực hiện I/O:

```bash
# Install if not available
sudo apt install iotop    # Debian/Ubuntu
sudo dnf install iotop    # Fedora/RHEL/CentOS

# Run iotop
sudo iotop
```

Đối với hiển thị một lần:

```bash
sudo iotop -b -n 1
```

Kiểm tra số liệu thống kê I/O cho một quy trình cụ thể:

```bash
pidstat -d -p PID 1
```

### Lập lịch vào/ra

Kiểm tra bộ lập lịch I/O hiện tại:

```bash
cat /sys/block/sda/queue/scheduler
```

Thay đổi lịch trình tạm thời:

```bash
echo deadline | sudo tee /sys/block/sda/queue/scheduler
```

Các tùy chọn thường bao gồm:

- `cfq`: Xếp hàng hoàn toàn công bằng
- `deadline`: Lập lịch thời hạn
- `noop`: Không có bộ lập lịch hoạt động
- `mq-deadline`: Bộ lập lịch thời hạn cho nhiều hàng đợi

## Giám sát quy trình mạng

### Xem kết nối mạng

Xem tiến trình nào có kết nối mạng:

```bash
# Show all listening ports and their associated programs
sudo netstat -tulpn

# More modern alternative
sudo ss -tulpn
```

Các tùy chọn chính:

- `t`: Kết nối TCP
- `u`: Kết nối UDP
- `l`: Ổ cắm nghe
- `p`: Hiển thị quá trình sử dụng socket
- `n`: Không phân giải tên máy chủ hoặc tên cổng

### Giám sát lưu lượng mạng theo quy trình

Giám sát lưu lượng mạng theo tiến trình:

```bash
# Install if not available
sudo apt install nethogs    # Debian/Ubuntu
sudo dnf install nethogs    # Fedora/RHEL/CentOS

# Monitor network traffic by process
sudo nethogs
```

Để giám sát mạng toàn diện hơn:

```bash
# Install if not available
sudo apt install iftop    # Debian/Ubuntu
sudo dnf install iftop    # Fedora/RHEL/CentOS

# Monitor traffic on a specific interface
sudo iftop -i eth0
```

## Tự động hóa quy trình và lập kế hoạch

### Chạy quy trình vào thời gian đã lên lịch với cron

Hệ thống cron chạy lệnh vào thời gian đã lên lịch.

Chỉnh sửa crontab của người dùng:

```bash
crontab -e
```

Định dạng crontab:

```
# minute hour day_of_month month day_of_week command
0 2 * * * /path/to/backup.sh
```

Điều này chạy `backup.sh` lúc 2:00 sáng hàng ngày.

Các phím tắt crontab phổ biến:

- `@hourly`: Chạy mỗi giờ một lần
- `@daily`: Chạy mỗi ngày một lần
- `@weekly`: Chạy mỗi tuần một lần
- `@monthly`: Chạy mỗi tháng một lần
- `@reboot`: Chạy khi khởi động

Xem nhật ký cron:

```bash
grep CRON /var/log/syslog
```

### Chạy tác vụ một lần với lúc

Lệnh `at` lên lịch tác vụ một lần:

```bash
# Install if not available
sudo apt install at    # Debian/Ubuntu
sudo dnf install at    # Fedora/RHEL/CentOS

# Schedule a task for 2 hours from now
at now + 2 hours
> /path/to/command
> Ctrl+D

# List scheduled tasks
atq

# Remove a task
atrm job_number
```

### Chạy các quy trình theo lịch trình với bộ tính giờ systemd

Các hệ thống Linux hiện đại sử dụng bộ định thời systemd thay thế cho cron:

```bash
# List active timers
systemctl list-timers

# Create a timer (example)
sudo nano /etc/systemd/system/backup.service
```

Nội dung của tệp dịch vụ:

```
[Unit]
Description=Backup Service

[Service]
Type=oneshot
ExecStart=/path/to/backup.sh

[Install]
WantedBy=multi-user.target
```

Tạo tập tin hẹn giờ:

```bash
sudo nano /etc/systemd/system/backup.timer
```

Nội dung của file hẹn giờ:

```
[Unit]
Description=Run backup daily

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Kích hoạt bộ hẹn giờ:

```bash
sudo systemctl enable --now backup.timer
```

## Quản lý tiến trình nâng cao

### Nhóm kiểm soát quy trình (cgroups)

Các nhóm kiểm soát cho phép giới hạn, tính toán và cách ly việc sử dụng tài nguyên của các nhóm quy trình:

```bash
# Create a new cgroup (on systems with cgroupfs mounted)
sudo mkdir /sys/fs/cgroup/memory/mygroup

# Set memory limit (200MB)
echo 209715200 | sudo tee /sys/fs/cgroup/memory/mygroup/memory.limit_in_bytes

# Add a process to the cgroup
echo PID | sudo tee /sys/fs/cgroup/memory/mygroup/cgroup.procs
```

Trên các hệ thống sử dụng systemd, hãy sử dụng systemd-run:

```bash
# Run a command with memory limit
sudo systemd-run --unit=myservice --property=MemoryLimit=200M /path/to/command
```

### Không gian tên quy trình

Không gian tên cô lập các tiến trình với nhau. Đây là công nghệ đằng sau container.

Chạy một tiến trình trong một không gian tên mới:

```bash
unshare --fork --pid --mount-proc /bin/bash
```

Điều này mang lại cho tiến trình không gian tên PID riêng với ID tiến trình 1 của chính nó.

### Chạy quy trình với tài nguyên cụ thể

Sử dụng lệnh `taskset` để liên kết một tiến trình với các lõi CPU cụ thể:

```bash
# Run on CPU 0
taskset -c 0 command

# Move running process to CPU 1
taskset -pc 1 PID
```

Sử dụng `cpulimit` để hạn chế sử dụng CPU:

```bash
# Install if not available
sudo apt install cpulimit    # Debian/Ubuntu
sudo dnf install cpulimit    # Fedora/RHEL/CentOS

# Limit a process to 50% of one CPU core
cpulimit -p PID -l 50
```

## Ví dụ về quản lý tiến trình thực tế

### Tìm và sửa một quy trình sử dụng nhiều CPU

Giả sử hệ thống của bạn chạy chậm và bạn cần xác định nguyên nhân:

```bash
# Check load average
uptime

# Identify CPU-intensive processes
top -b -n 1 | head -n 20

# Examine a specific process
ps -fp PID

# Check if it's in an infinite loop or stuck
strace -p PID

# If needed, reduce its priority
sudo renice 19 -p PID

# Or terminate if necessary
sudo kill -15 PID
```

### Tìm rò rỉ bộ nhớ

Đối với hệ thống có bộ nhớ trống giảm:

```bash
# Check memory usage
free -h

# Find memory-intensive processes
ps -eo pid,ppid,cmd,%mem --sort=-%mem | head

# Examine detailed memory usage
sudo pmap -x PID | sort -k 3 -n | tail

# Check for memory growth over time
watch -n 10 'ps -o pid,vsz,rss,cmd -p PID'
```

### Khắc phục sự cố chờ I/O cao

Nếu hệ thống của bạn chậm do I/O cao:

```bash
# Check load average and I/O wait
top
# Look for high wa% in CPU stats

# Identify I/O-intensive processes
sudo iotop -o

# Check disk performance
iostat -x 1

# Find which files the process is accessing
sudo lsof -p PID | grep REG
```

### Thiết lập một dịch vụ có giới hạn tài nguyên

Tạo một dịch vụ có giới hạn tài nguyên:

```bash
sudo nano /etc/systemd/system/myapp.service
```

Nội dung tập tin dịch vụ:

```
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=myappuser
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/myapp
Restart=on-failure
# Resource limits
CPUQuota=25%
MemoryLimit=500M
IOWeight=500

[Install]
WantedBy=multi-user.target
```

Kích hoạt và bắt đầu dịch vụ:

```bash
sudo systemctl enable --now myapp
```

## Quản lý tiến trình trên đám mây

Khi chạy Linux trong môi trường đám mây, việc quản lý tiến trình hiệu quả là rất quan trọng để kiểm soát chi phí và đảm bảo hiệu suất.

### Ví dụ về quản lý tiến trình đám mây

Ví dụ: trên DigitalOcean Droplet (sử dụng [liên kết này](https://m.do.co/c/2a9bba940f39) với khoản tín dụng 200 USD):

1. Chọn kích thước giọt phù hợp với khối lượng công việc của bạn
2. Giám sát việc sử dụng tài nguyên để tránh cung cấp quá mức

```bash
# Install monitoring tools
sudo apt update
sudo apt install htop iotop sysstat

# Set up daily resource usage summary
sudo nano /etc/cron.daily/resource-report
```

Nội dung kịch bản:

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
REPORT="/root/resource-reports/report-$DATE.txt"
mkdir -p /root/resource-reports/

echo "System Resource Report for $DATE" > $REPORT
echo "=================================" >> $REPORT

echo -e "\nUptime and Load Averages:" >> $REPORT
uptime >> $REPORT

echo -e "\nMemory Usage:" >> $REPORT
free -h >> $REPORT

echo -e "\nDisk Usage:" >> $REPORT
df -h >> $REPORT

echo -e "\nTop CPU Processes:" >> $REPORT
ps -eo pid,ppid,cmd,%cpu --sort=-%cpu | head -n 10 >> $REPORT

echo -e "\nTop Memory Processes:" >> $REPORT
ps -eo pid,ppid,cmd,%mem --sort=-%mem | head -n 10 >> $REPORT
```

Làm cho tập lệnh có thể thực thi được:

```bash
sudo chmod +x /etc/cron.daily/resource-report
```

Tập lệnh này tạo báo cáo tài nguyên hàng ngày để giúp xác định xu hướng và tối ưu hóa việc sử dụng tài nguyên đám mây của bạn.

## Tiến về phía trước

Bây giờ bạn đã có sự hiểu biết toàn diện về quản lý tiến trình Linux. Những kỹ năng này rất cần thiết để theo dõi tình trạng hệ thống, khắc phục sự cố về hiệu suất và tối ưu hóa việc sử dụng tài nguyên.

Trong phần tiếp theo, chúng ta sẽ khám phá mạng trong Linux, bao gồm cấu hình mạng, xử lý sự cố, bảo mật và hơn thế nữa.

Quản lý tiến trình là kỹ năng cốt lõi của bất kỳ người dùng hoặc quản trị viên Linux nào. Cho dù bạn đang chạy máy trạm cá nhân, máy chủ hay container trên đám mây, việc hiểu cách giám sát và kiểm soát các quy trình sẽ giúp bạn duy trì một hệ thống hoạt động hiệu quả, lành mạnh.
