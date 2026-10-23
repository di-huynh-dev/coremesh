---
title: "Khái niệm cơ bản về quản trị hệ thống Linux"
description: Tìm hiểu các tác vụ quản trị hệ thống thiết yếu bao gồm bảo trì, giám sát, bảo mật và khắc phục sự cố.
order: 10
---

Quản trị hệ thống là nghệ thuật và khoa học nhằm giữ cho hệ thống máy tính hoạt động trơn tru, an toàn và hiệu quả. Với tư cách là quản trị viên hệ thống Linux, bạn sẽ chịu trách nhiệm cài đặt, cấu hình, bảo trì và khắc phục sự cố của máy chủ và máy trạm Linux.

Trong phần cuối cùng của hướng dẫn Linux này, chúng ta sẽ khám phá những kỹ năng và kiến thức cần thiết để quản trị hệ thống hiệu quả.

## Giám sát và hiệu suất hệ thống

### Giám sát tài nguyên hệ thống

#### Sử dụng CPU

Giám sát việc sử dụng CPU bằng các công cụ sau:

```bash
# Overall CPU usage
top
htop
uptime

# Detailed CPU statistics
mpstat -P ALL 2
```

Các số liệu chính cần theo dõi:

- Thời gian của người dùng: Thời gian chạy các quy trình của người dùng
- Thời gian hệ thống: Thời gian dành cho hoạt động của kernel
- IO wait: Thời gian chờ đợi các thao tác I/O
- Thời gian nhàn rỗi: Dung lượng CPU chưa sử dụng

#### Sử dụng bộ nhớ

Giám sát bộ nhớ với:

```bash
# Overview of memory usage
free -h

# Detailed memory information
cat /proc/meminfo

# Process memory usage
ps aux --sort=-%mem | head
```

Số liệu chính:

- Tổng số so với bộ nhớ khả dụng
- Trao đổi cách sử dụng
- Bộ nhớ đệm/bộ nhớ đệm (có thể được lấy lại nếu cần)

#### Sử dụng đĩa

Giám sát dung lượng ổ đĩa và I/O:

```bash
# Disk space
df -h

# Directory sizes
du -sh /var/*

# Disk I/O
iostat -xz 2
```

Số liệu chính:

- Dung lượng đĩa sẵn có
- Cách sử dụng nút: `df -i`
- Hoạt động đọc/ghi mỗi giây
- Tỷ lệ sử dụng đĩa

#### Sử dụng mạng

Giám sát lưu lượng mạng:

```bash
# Basic network interface statistics
ip -s link

# Network traffic by interface
iftop -i eth0

# Network connections
ss -tuln
```

### Ghi nhật ký hệ thống

#### Tạp chí hệ thống

Các hệ thống hiện đại sử dụng tạp chí systemd:

```bash
# View all logs
journalctl

# View kernel messages
journalctl -k

# View logs for a specific service
journalctl -u nginx.service

# View logs since yesterday
journalctl --since="yesterday"

# Follow logs in real-time
journalctl -f
```

#### Nhật ký truyền thống

Các tệp nhật ký truyền thống có trong `/var/log/`:

```bash
# System messages
less /var/log/syslog     # Debian/Ubuntu
less /var/log/messages   # RHEL/CentOS

# Authentication logs
less /var/log/auth.log   # Debian/Ubuntu
less /var/log/secure     # RHEL/CentOS

# Kernel logs
dmesg
```

#### Xoay vòng nhật ký

Định cấu hình xoay vòng nhật ký để quản lý tệp nhật ký:

```bash
# Configuration in
ls -l /etc/logrotate.d/

# Example rotation configuration for a custom application
cat > /etc/logrotate.d/myapp << EOF
/var/log/myapp/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 myapp myapp
    sharedscripts
    postrotate
        systemctl reload myapp
    endscript
}
EOF
```

### Công cụ giám sát tự động

Để giám sát toàn diện, hãy xem xét các công cụ sau:

#### Prometheus và Grafana

Một ngăn xếp giám sát và trực quan hóa mạnh mẽ:

```bash
# Install Prometheus (example for Ubuntu)
apt-get update
apt-get install -y prometheus prometheus-node-exporter

# Install Grafana
apt-get install -y apt-transport-https software-properties-common
add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
apt-get update
apt-get install -y grafana

# Start and enable services
systemctl enable prometheus prometheus-node-exporter grafana-server
systemctl start prometheus prometheus-node-exporter grafana-server
```

Sau đó định cấu hình Grafana (http://localhost:3000) để sử dụng Prometheus làm nguồn dữ liệu.

#### Nagios/Icinga

Hệ thống giám sát cổ điển về tính khả dụng của dịch vụ và máy chủ:

```bash
# Install Icinga2 (Nagios successor)
apt-get install -y icinga2 icinga2-ido-mysql icingaweb2
```

Thực hiện theo thiết lập dựa trên web tại http://localhost/icingaweb2/

## Quản lý và bảo trì hệ thống

### Cập nhật hệ thống

Việc cập nhật hệ thống là rất quan trọng để đảm bảo tính bảo mật và ổn định:

#### Debian/Ubuntu

```bash
# Update package lists
sudo apt update

# Apply updates
sudo apt upgrade

# Full distribution upgrade
sudo apt dist-upgrade

# Automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

#### RHEL/CentOS/Fedora

```bash
# Update all packages
sudo dnf upgrade

# Apply only security updates
sudo dnf upgrade --security

# Automatic updates
sudo dnf install dnf-automatic
sudo systemctl enable --now dnf-automatic.timer
```

### Quản lý dịch vụ với systemd

Các hệ thống Linux hiện đại sử dụng systemd để quản lý các dịch vụ:

```bash
# List all services
systemctl list-units --type=service

# Check service status
systemctl status nginx

# Start, stop, restart services
systemctl start nginx
systemctl stop nginx
systemctl restart nginx

# Enable/disable at boot
systemctl enable nginx
systemctl disable nginx

# View service logs
journalctl -u nginx
```

Định cấu hình dịch vụ systemd tùy chỉnh:

```bash
# Create a custom service
cat > /etc/systemd/system/myapp.service << EOF
[Unit]
Description=My Custom Application
After=network.target

[Service]
Type=simple
User=myapp
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/node /opt/myapp/server.js
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd to recognize the new service
systemctl daemon-reload

# Enable and start the service
systemctl enable --now myapp
```

### Quản lý các tác vụ theo lịch trình

#### Công việc định kỳ

Lên lịch các tác vụ thường xuyên với cron:

```bash
# Edit user crontab
crontab -e

# System-wide cron directories
ls -la /etc/cron.{daily,hourly,weekly,monthly}
```

Ví dụ về các mục crontab:

```
# Run at 3:30 AM every day
30 3 * * * /path/to/backup.sh

# Run every 15 minutes
*/15 * * * * /path/to/check.sh

# Run on the first of every month
0 0 1 * * /path/to/monthly-report.sh
```

#### Bộ hẹn giờ hệ thống

Thay thế hiện đại cho cron:

```bash
# Create a timer unit
cat > /etc/systemd/system/backup.timer << EOF
[Unit]
Description=Daily backup timer

[Timer]
OnCalendar=*-*-* 03:30:00
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Create the matching service unit
cat > /etc/systemd/system/backup.service << EOF
[Unit]
Description=Daily backup service

[Service]
Type=oneshot
ExecStart=/path/to/backup.sh

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the timer
systemctl daemon-reload
systemctl enable --now backup.timer

# List active timers
systemctl list-timers
```

### Quá trình khởi động hệ thống

Hiểu quá trình khởi động giúp khắc phục sự cố:

1. **BIOS/UEFI**: Kiểm tra phần cứng ban đầu
2. **Boot Loader** (GRUB): Tải kernel
3. **Khởi tạo hạt nhân**: Tải trình điều khiển và gắn kết hệ thống tập tin gốc
4. **Khởi tạo hệ thống**: Đưa hệ thống đến trạng thái mong muốn

#### Cấu hình bộ tải khởi động

Định cấu hình GRUB:

```bash
# Edit GRUB configuration
sudo nano /etc/default/grub

# Apply changes
sudo update-grub
```

Khởi động vào chế độ cứu hộ:

1. Khởi động lại hệ thống
2. Tại menu GRUB, chọn "Tùy chọn nâng cao"
3. Chọn tùy chọn chế độ khôi phục hoặc chế độ một người dùng

### Quản lý lưu trữ

#### Quản lý hệ thống tập tin

Kiểm tra và sửa chữa hệ thống tập tin:

```bash
# Check filesystem
sudo fsck /dev/sda1

# Check at next boot
sudo touch /forcefsck

# Tune filesystem parameters
sudo tune2fs -c 30 /dev/sda1  # Check every 30 mounts
```

#### Quản lý phân vùng đĩa

Làm việc với các phân vùng đĩa:

```bash
# List partitions
sudo fdisk -l

# Create/modify partitions
sudo fdisk /dev/sdb

# Create filesystem
sudo mkfs.ext4 /dev/sdb1

# Add to fstab for auto-mounting
echo "/dev/sdb1 /mnt/data ext4 defaults 0 2" | sudo tee -a /etc/fstab
```

#### Quản lý logic volume (LVM)

LVM cung cấp khả năng quản lý lưu trữ linh hoạt:

```bash
# Create physical volume
sudo pvcreate /dev/sdc

# Create volume group
sudo vgcreate data_vg /dev/sdc

# Create logical volume
sudo lvcreate -n data_lv -L 10G data_vg

# Create filesystem
sudo mkfs.ext4 /dev/data_vg/data_lv

# Mount filesystem
sudo mkdir -p /mnt/data
echo "/dev/data_vg/data_lv /mnt/data ext4 defaults 0 2" | sudo tee -a /etc/fstab
sudo mount /mnt/data

# Extend logical volume
sudo lvextend -L +5G /dev/data_vg/data_lv
sudo resize2fs /dev/data_vg/data_lv
```

### Chiến lược sao lưu hệ thống

Thực hiện chiến lược sao lưu toàn diện:

#### Sao lưu cấp tệp

Sử dụng `rsync` để sao lưu gia tăng hiệu quả:

```bash
# Basic local backup
rsync -av --delete /source/directory/ /backup/directory/

# Remote backup
rsync -avz --delete -e ssh /source/directory/ user@remote:/backup/directory/

# Incremental backups with hard links
rsync -av --delete --link-dest=/backup/daily.1 /source/ /backup/daily.0
```

#### Hình ảnh đĩa

Tạo hệ thống hoàn chỉnh image:

```bash
# Create an image of a partition
sudo dd if=/dev/sda1 of=/path/to/sda1.img bs=4M status=progress

# Compress the image
sudo dd if=/dev/sda1 bs=4M | gzip > /path/to/sda1.img.gz

# Restore from an image
gunzip -c /path/to/sda1.img.gz | sudo dd of=/dev/sda1 bs=4M status=progress
```

#### Tự động hóa dự phòng và luân chuyển

Thực hiện sơ đồ luân chuyển dự phòng:

```bash
#!/bin/bash
# Simple backup rotation script

BACKUP_DIR="/backup"
SOURCE_DIR="/data"
DATE=$(date +%Y-%m-%d)
DAY_OF_WEEK=$(date +%u)  # 1-7, Monday is 1

# Create daily backup
rsync -av --delete "$SOURCE_DIR/" "$BACKUP_DIR/daily.$DAY_OF_WEEK/"

# Create weekly backup on Sunday
if [ "$DAY_OF_WEEK" = "7" ]; then
    WEEK_NUM=$(date +%U)
    WEEK_OF_MONTH=$((WEEK_NUM % 4 + 1))
    rsync -av --delete "$SOURCE_DIR/" "$BACKUP_DIR/weekly.$WEEK_OF_MONTH/"
fi

# Create monthly backup on the 1st
if [ "$(date +%d)" = "01" ]; then
    MONTH=$(date +%m)
    rsync -av --delete "$SOURCE_DIR/" "$BACKUP_DIR/monthly.$MONTH/"
fi
```

## An ninh và tăng cường

### Cập nhật và vá lỗi hệ thống

Luôn cập nhật các bản cập nhật bảo mật:

```bash
# RHEL/CentOS: List security updates
dnf updateinfo list security

# Apply security updates
dnf update --security

# Debian/Ubuntu: Enable automatic security updates
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### Chính sách người dùng và mật khẩu

Thực thi mật khẩu mạnh:

```bash
# Install password quality checking
apt install libpam-pwquality

# Edit PAM configuration
nano /etc/security/pwquality.conf
```

Thêm các cài đặt này:

```
minlen = 12
minclass = 3
maxrepeat = 3
gecoscheck = 1
enforce_for_root
```

Định cấu hình lão hóa mật khẩu:

```bash
# Set maximum password age
chage -M 90 username

# Force password change on next login
chage -d 0 username

# Check current aging policy
chage -l username
```

### Cấu hình tường lửa

Cấu hình tường lửa máy chủ:

#### UFW (Ubuntu/Debian)

```bash
# Install UFW
apt install ufw

# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH
ufw allow ssh

# Allow web server
ufw allow 80/tcp
ufw allow 443/tcp

# Allow specific IP address
ufw allow from 192.168.1.100

# Enable firewall
ufw enable
```

#### Tường lửa (RHEL/CentOS/Fedora)

```bash
# Check status
firewall-cmd --state

# Allow services
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

# Allow port
firewall-cmd --permanent --add-port=8080/tcp

# Reload to apply changes
firewall-cmd --reload
```

### Tăng cường SSH

Truy cập SSH an toàn:

```bash
# Edit SSH configuration
nano /etc/ssh/sshd_config
```

Cài đặt được đề xuất:

```
# Use SSH protocol 2
Protocol 2

# Change default port (optional)
Port 2222

# Disable root login
PermitRootLogin no

# Use key authentication only
PasswordAuthentication no
PubkeyAuthentication yes

# Limit users who can log in
AllowUsers user1 user2

# Idle timeout (5 minutes)
ClientAliveInterval 300
ClientAliveCountMax 0

# Disable empty passwords
PermitEmptyPasswords no

# Disable X11 forwarding if not needed
X11Forwarding no
```

Khởi động lại SSH sau khi thay đổi:

```bash
systemctl restart sshd
```

### Quyền tập tin và thư mục

Quyền kiểm tra và sửa lỗi:

```bash
# Find world-writable files
find / -type f -perm -o+w -ls 2>/dev/null

# Find SUID/SGID binaries
find / -type f \( -perm -4000 -o -perm -2000 \) -ls 2>/dev/null

# Fix permissions for sensitive files
chmod 600 /etc/shadow
chmod 640 /etc/gshadow
chmod 644 /etc/passwd
chmod 644 /etc/group
```

### Kiểm tra an ninh

Sử dụng các công cụ quét bảo mật:

#### Lynis

Công cụ kiểm tra bảo mật toàn diện:

```bash
# Install Lynis
apt install lynis

# Run a system audit
lynis audit system

# View detailed report
cat /var/log/lynis.log
```

#### OpenSCAP

Kiểm tra tuân thủ bảo mật:

```bash
# Install OpenSCAP
dnf install openscap-scanner scap-security-guide

# Run a scan with RHEL8 profile
oscap xccdf eval --profile xccdf_org.ssgproject.content_profile_pci-dss \
  --results scan-results.xml --report report.html \
  /usr/share/xml/scap/ssg/content/ssg-rhel8-ds.xml
```

#### Phát hiện xâm nhập với Tripwire

Giám sát tính toàn vẹn của tập tin:

```bash
# Install Tripwire
apt install tripwire

# Initialize database
sudo tripwire --init

# Check for changes
sudo tripwire --check
```

### Kiểm tra hệ thống với Auditd

Giám sát các cuộc gọi hệ thống và các sự kiện bảo mật:

```bash
# Install audit daemon
apt install auditd

# Add rules for file access monitoring
cat >> /etc/audit/rules.d/audit.rules << EOF
-w /etc/passwd -p wa -k passwd_changes
-w /etc/shadow -p wa -k shadow_changes
-w /etc/sudoers -p wa -k sudoers_changes
EOF

# Restart auditd
systemctl restart auditd

# Search for events
ausearch -k passwd_changes
```

## Khắc phục sự cố và khôi phục

### Sự cố khởi động

#### Chế độ cứu hộ

Khởi động vào chế độ cứu hộ:

1. Khởi động lại và ngắt GRUB
2. Chọn "Tùy chọn nâng cao"
3. Chọn chế độ khôi phục
4. Tại menu khôi phục, chọn "root shell"

Sửa chữa các sự cố khởi động thường gặp:

```bash
# Rebuild initramfs
update-initramfs -u

# Reinstall GRUB
grub-install /dev/sda
update-grub

# Check and repair filesystem
fsck -f /dev/sda1
```

#### Shell khẩn cấp

Nếu bạn không thể khởi động bình thường:

```bash
# Boot with emergency parameter
# At GRUB prompt, press 'e' to edit
# Add 'systemd.unit=emergency.target' to the kernel line
# Press Ctrl+X to boot

# Remount root filesystem as read-write
mount -o remount,rw /
```

### Phục hồi tập tin

Khôi phục tập tin đã xóa:

```bash
# Install testdisk and photorec
apt install testdisk

# Run testdisk for partition recovery
testdisk /dev/sda

# Run photorec for file recovery
photorec /dev/sda
```

### Sự cố tài nguyên hệ thống

#### Mức sử dụng CPU cao

Chẩn đoán CPU cao:

```bash
# Find CPU-intensive processes
top -c

# Get process details
ps aux | grep PID

# Check if I/O related
iostat -xz 1

# Trace system calls
strace -p PID
```

#### Vấn đề về bộ nhớ

Chẩn đoán các vấn đề về bộ nhớ:

```bash
# Check memory usage
free -h
vmstat 1

# Find memory-hungry processes
ps aux --sort=-%mem | head

# Check for memory leaks
valgrind --leak-check=full /path/to/program
```

#### Sự cố về dung lượng ổ đĩa

Tìm các tập tin và thư mục lớn:

```bash
# Find directories using the most space
du -h --max-depth=1 /var | sort -hr

# Find large files
find / -type f -size +100M -exec ls -lh {} \; | sort -k5 -rh

# Find old log files
find /var/log -name "*.log" -mtime +30
```

### Phân tích sự cố hạt nhân

Phân tích sự cố hệ thống:

```bash
# Install crash analysis tools
apt install linux-crashdump kdump-tools

# Configure kdump
dpkg-reconfigure kdump-tools

# Enable crash dump collection
systemctl enable kdump

# Analyze a crash dump
crash /usr/lib/debug/vmlinux /var/crash/dump_file
```

### Khắc phục sự cố mạng

Chẩn đoán sự cố mạng:

```bash
# Check network interface status
ip link
ip addr

# Test connectivity
ping -c 4 google.com

# Trace network path
traceroute google.com

# Check listening services
ss -tuln

# Capture network traffic
tcpdump -i eth0 -n
```

Khắc phục sự cố DNS:

```bash
# Test DNS resolution
dig google.com

# Check name servers
cat /etc/resolv.conf

# Flush DNS cache (systemd-resolved)
systemd-resolve --flush-caches
```

## Tài liệu hệ thống

### Hệ thống inventory

Bảo trì hệ thống inventory:

```bash
# Operating system information
lsb_release -a || cat /etc/os-release

# Kernel version
uname -a

# Hardware information
lshw -short
dmidecode

# Installed software
dpkg -l > installed_packages.txt  # Debian/Ubuntu
rpm -qa > installed_packages.txt  # RHEL/CentOS/Fedora
```

### Quản lý cấu hình

Cấu hình hệ thống tài liệu:

```bash
# Create a backup of important configuration files
tar -czf config_backup.tar.gz /etc/ssh /etc/nginx /etc/fstab /etc/passwd /etc/group

# Document network configuration
ip addr > network_config.txt
ip route >> network_config.txt
cat /etc/netplan/* >> network_config.txt  # Ubuntu
cat /etc/network/interfaces >> network_config.txt  # Debian

# Document systemd services
systemctl list-unit-files --state=enabled > enabled_services.txt
```

### Quản lý thay đổi

Thực hiện nhật ký thay đổi:

```bash
# Create a simple change log file
cat > /root/CHANGELOG.txt << EOF
# System Change Log

## $(date +%Y-%m-%d) - Initial Setup
- Installed base OS
- Configured network
- Set up users

## $(date +%Y-%m-%d) - Security Hardening
- Configured firewall
- Secured SSH
- Implemented automatic updates
EOF
```

## Quản trị hệ thống nâng cao

### Quản lý lưu trữ với ZFS

ZFS cung cấp các tính năng lưu trữ nâng cao:

```bash
# Install ZFS
apt install zfsutils-linux

# Create a zpool
zpool create tank /dev/sdb /dev/sdc

# Create a ZFS dataset
zfs create tank/data

# Enable compression
zfs set compression=lz4 tank/data

# Create a snapshot
zfs snapshot tank/data@backup-$(date +%Y%m%d)

# List snapshots
zfs list -t snapshot

# Restore from a snapshot
zfs rollback tank/data@backup-20250517
```

### Container hóa với Docker

Chạy các ứng dụng trong container:

```bash
# Install Docker
apt-get update
apt-get install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get install docker-ce docker-ce-cli containerd.io

# Start and enable Docker
systemctl enable --now docker

# Run a container
docker run --name nginx -d -p 80:80 nginx

# List containers
docker ps

# Stop a container
docker stop nginx

# Remove a container
docker rm nginx
```

### Ảo hóa với KVM

Lưu trữ máy ảo với KVM:

```bash
# Check if your CPU supports virtualization
egrep -c '(vmx|svm)' /proc/cpuinfo

# Install KVM
apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virt-manager

# Add user to libvirt group
usermod -aG libvirt $(whoami)
usermod -aG kvm $(whoami)

# Start and enable libvirt
systemctl enable --now libvirtd

# Create a virtual machine from command line
virt-install --name ubuntu-vm --ram 2048 --vcpus 2 --disk path=/var/lib/libvirt/images/ubuntu-vm.qcow2,size=20 --os-type linux --os-variant ubuntu20.04 --network bridge=virbr0 --graphics none --console pty,target_type=serial --location 'http://archive.ubuntu.com/ubuntu/dists/focal/main/installer-amd64/' --extra-args 'console=ttyS0,115200n8'
```

### Quản lý cấu hình với Ansible

Tự động cấu hình trên nhiều máy chủ:

```bash
# Install Ansible
apt install ansible

# Create inventory file
cat > /etc/ansible/hosts << EOF
[webservers]
web1.example.com
web2.example.com

[dbservers]
db1.example.com
db2.example.com
EOF

# Create a simple playbook
cat > webserver.yml << EOF
---
- hosts: webservers
  become: yes
  tasks:
    - name: Install Nginx
      apt:
        name: nginx
        state: present
        update_cache: yes

    - name: Start Nginx
      service:
        name: nginx
        state: started
        enabled: yes
EOF

# Run the playbook
ansible-playbook webserver.yml
```

## Quản lý Linux trên đám mây

Chạy Linux trên đám mây yêu cầu những cân nhắc cụ thể:

### Ví dụ về DigitalOcean

Quản lý máy chủ Linux trên DigitalOcean:

1. Tạo một Droplet (sử dụng [liên kết này](https://m.do.co/c/2a9bba940f39) để nhận tín dụng $200 trong 60 ngày)

2. Bảo mật và tối ưu hóa máy chủ đám mây:

```bash
#!/bin/bash
# cloud_server_setup.sh - Initial setup for a new cloud server

# Update system
apt update && apt upgrade -y

# Set timezone
timedatectl set-timezone UTC

# Install essential packages
apt install -y fail2ban ufw unattended-upgrades logwatch

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable

# Secure SSH
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Set up automatic security updates
cat > /etc/apt/apt.conf.d/10periodic << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

# Configure fail2ban
cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
EOF
systemctl restart fail2ban

# Set up logwatch
cat > /etc/cron.daily/00logwatch << EOF
#!/bin/bash
/usr/sbin/logwatch --output mail --mailto root --detail high
EOF
chmod +x /etc/cron.daily/00logwatch

# Set up minimal monitoring
apt install -y prometheus-node-exporter
systemctl enable --now prometheus-node-exporter

echo "Server initial setup complete!"
```

3. Tạo bản sao lưu thường xuyên của máy chủ đám mây của bạn:

```bash
#!/bin/bash
# cloud_backup.sh - Backup script for cloud server data

# Configuration
BACKUP_DIR="/var/backups/server"
TIMESTAMP=$(date +%Y-%m-%d-%H%M)
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Create database dumps
if command -v mysql &>/dev/null; then
    mkdir -p "$BACKUP_DIR/mysql"
    databases=$(mysql -e "SHOW DATABASES;" | grep -Ev "(Database|information_schema|performance_schema)")
    for db in $databases; do
        mysqldump --single-transaction "$db" | gzip > "$BACKUP_DIR/mysql/$db-$TIMESTAMP.sql.gz"
    done
fi

# Backup important directories
dirs_to_backup=(
    "/etc"
    "/var/www"
    "/home"
    "/opt/myapp"
)

for dir in "${dirs_to_backup[@]}"; do
    if [ -d "$dir" ]; then
        dir_name=$(echo "$dir" | sed 's/^\///' | sed 's/\//_/g')
        tar -czf "$BACKUP_DIR/$dir_name-$TIMESTAMP.tar.gz" "$dir"
    fi
done

# Remove old backups
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR/mysql" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Create backup report
echo "Backup completed at $(date)" > "$BACKUP_DIR/backup-report-$TIMESTAMP.txt"
du -sh "$BACKUP_DIR"/* >> "$BACKUP_DIR/backup-report-$TIMESTAMP.txt"

# Optional: Copy backups to an external location
# rsync -avz --delete "$BACKUP_DIR/" user@backup-server:/path/to/backups/
```

### Các phương pháp hay nhất dành riêng cho đám mây

1. **Cơ sở hạ tầng bất biến**: Coi máy chủ là đồ dùng một lần; tái tạo thay vì sửa chữa
2. **Configuration Management**: Sử dụng các công cụ như Ansible để tự động cấu hình
3. **Monitoring**: Triển khai giám sát toàn diện tài nguyên đám mây
4. **Security**: Thực hiện theo các phương pháp hay nhất về bảo mật đám mây, bao gồm quyền truy cập tối thiểu và phân đoạn mạng
5. **Backups**: Sao lưu tự động, ngoại vi cho dữ liệu quan trọng
6. **Scaling**: Thiết kế hệ thống theo quy mô theo chiều ngang

## Suy nghĩ cuối cùng và các bước tiếp theo

Chúc mừng! Bạn đã hoàn thành phần giới thiệu toàn diện của chúng tôi về Linux. Đây là những gì bạn đã học được:

1. **Linux Khái niệm cơ bản**: Hiểu Linux là gì và nó hoạt động như thế nào
2. **Cài đặt và thiết lập**: Chạy Linux trên hệ thống của bạn
3. **Dòng lệnh**: Học các lệnh đầu cuối thiết yếu
4. **File System**: Điều hướng và quản lý tệp cũng như quyền
5. **Package Management**: Cài đặt và cập nhật phần mềm
6. **User Management**: Tạo và quản lý tài khoản người dùng
7. **Quản lý quy trình**: Kiểm soát các chương trình đang chạy
8. **Networking**: Định cấu hình và xử lý sự cố mạng
9. **Shell Scripting**: Tự động hóa các tác vụ bằng tập lệnh
10. **Quản trị hệ thống**: Duy trì và bảo mật hệ thống Linux

### Đi đâu từ đây

Để tiếp tục hành trình Linux của bạn, hãy cân nhắc khám phá:

1. **Certification**: Theo đuổi các chứng chỉ Linux như RHCSA, LFCS hoặc CompTIA Linux+
2. **Cloud Computing**: Tìm hiểu cách triển khai Linux trong AWS, Azure hoặc Google Cloud
3. **DevOps**: Khám phá CI/CD, Cơ sở hạ tầng dưới dạng mã và khả năng chứa trong vùng chứa
4. **Cybersecurity**: Tìm hiểu sâu hơn về bảo mật và tăng cường Linux
5. **Bản phân phối chuyên dụng**: Dùng thử các bản phân phối tập trung vào bảo mật như Kali hoặc CentOS cho máy chủ

### Tiếp tục học tập

Hệ sinh thái Linux không ngừng phát triển. Luôn cập nhật bằng cách:

1. Theo dõi các trang tin tức và blog về Linux
2. Tham gia vào cộng đồng và diễn đàn Linux
3. Đóng góp cho các dự án nguồn mở
4. Thực hành kỹ năng của bạn với các dự án thực tế
5. Dạy người khác những gì bạn đã học

Khi bạn trở nên thành thạo hơn với Linux, bạn sẽ khám phá ra rằng nó không chỉ là một hệ điều hành mà còn là một bộ công cụ và triết lý mạnh mẽ có thể biến đổi cách tiếp cận của bạn với máy tính và giải quyết vấn đề.

Cảm ơn bạn đã làm theo hướng dẫn này và chúc may mắn trên hành trình Linux của bạn!
