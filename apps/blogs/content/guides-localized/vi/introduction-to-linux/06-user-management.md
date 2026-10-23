---
title: "Quản lý người dùng và nhóm"
description: Tìm hiểu cách tạo và quản lý người dùng và nhóm, kiểm soát quyền truy cập bằng quyền và định cấu hình môi trường người dùng trên hệ thống Linux.
order: 6
---

Linux là một hệ điều hành nhiều người dùng, được thiết kế từ đầu để cho phép nhiều người dùng làm việc đồng thời. Hiểu cách quản lý người dùng và nhóm là điều cần thiết để quản trị hệ thống, bảo mật và cộng tác hiệu quả.

Trong phần này, chúng ta sẽ khám phá cách tạo và quản lý người dùng, làm việc với nhóm, định cấu hình xác thực và thiết lập môi trường người dùng.

## Nguyên tắc cơ bản về người dùng và nhóm

### Người dùng

Tài khoản người dùng đại diện cho một thực thể (một người hoặc dịch vụ) có thể truy cập hệ thống. Mỗi người dùng có:

- Tên người dùng duy nhất
- ID người dùng dạng số (UID)
- Một nhóm sơ cấp
- Một tập hợp tùy chọn của các nhóm thứ cấp
- Một thư mục nhà
- Đăng nhập shell

### Nhóm

Các nhóm tổ chức những người dùng có nhu cầu tương tự. Mỗi nhóm có:

- Tên nhóm độc đáo
- ID nhóm số (GID)
- Danh sách người dùng thành viên

Nhóm đơn giản hóa việc quản lý quyền bằng cách cho phép bạn gán quyền cho nhiều người dùng cùng một lúc.

## Các tập tin chính liên quan đến người dùng

Trước khi đi sâu vào các lệnh, hãy hiểu các tệp quan trọng lưu trữ thông tin người dùng và nhóm:

### /etc/passwd

Tệp này chứa thông tin cơ bản về mỗi người dùng:

```bash
cat /etc/passwd | head -5
```

Mỗi dòng theo định dạng này:

```
username:x:UID:GID:comment:home_directory:shell
```

Ví dụ:

```
alice:x:1000:1000:Alice Smith:/home/alice:/bin/bash
```

`x` chỉ ra rằng mật khẩu được lưu trữ trong `/etc/shadow`.

### /etc/bóng

Tệp này chứa thông tin mật khẩu được mã hóa và chỉ có root mới có thể đọc được:

```bash
sudo cat /etc/shadow | head -5
```

Mỗi dòng theo định dạng này:

```
username:encrypted_password:last_change:min_age:max_age:warn_period:inactive_period:expiration_date:reserved
```

Trường mật khẩu được mã hóa có thể là `!` hoặc `*` nếu tài khoản bị khóa.

### /etc/nhóm

Tệp này xác định các nhóm trên hệ thống:

```bash
cat /etc/group | head -5
```

Mỗi dòng theo định dạng này:

```
group_name:x:GID:user_list
```

Ví dụ:

```
developers:x:1001:alice,bob,charlie
```

### /etc/gshadow

Tệp này chứa mật khẩu nhóm được mã hóa (nếu có) và chỉ có root mới có thể đọc được:

```bash
sudo cat /etc/gshadow | head -5
```

## Lệnh quản lý người dùng

### Xem thông tin người dùng

Nhận thông tin về người dùng hiện tại:

```bash
id
```

Nhận thông tin về một người dùng cụ thể:

```bash
id username
```

Hiển thị ai hiện đang đăng nhập:

```bash
who
```

Hiển thị thông tin đăng nhập chi tiết:

```bash
w
```

Hiển thị lần đăng nhập cuối cùng của người dùng:

```bash
last
```

### Tạo người dùng

Tạo người dùng mới:

```bash
sudo useradd username
```

Điều này tạo ra một người dùng cơ bản với các cài đặt tối thiểu. Thông thường, bạn sẽ muốn có nhiều lựa chọn hơn:

```bash
sudo useradd -m -d /home/username -s /bin/bash -c "Full Name" username
```

Tùy chọn:

- `-m`: Tạo thư mục chính
- `-d`: Chỉ định đường dẫn thư mục chính
- `-s`: Chỉ định thông tin đăng nhập shell
- `-c`: Thêm nhận xét (thường là tên đầy đủ của người dùng)
- `-G`: Thêm vào nhóm bổ sung

Một lệnh thân thiện hơn với người dùng là `adduser` (trên các hệ thống dựa trên Debian), có tính tương tác:

```bash
sudo adduser username
```

Đặt hoặc thay đổi mật khẩu của người dùng:

```bash
sudo passwd username
```

### Sửa đổi người dùng

Sửa đổi người dùng hiện tại:

```bash
sudo usermod [options] username
```

Các tùy chọn phổ biến:

- `-c`: Thay đổi trường bình luận
- `-d`: Thay đổi thư mục chính
- `-g`: Thay đổi nhóm chính
- `-G`: Đặt nhóm bổ sung
- `-s`: Thay đổi thông tin đăng nhập shell
- `-L`: Khóa tài khoản
- `-U`: Mở khóa tài khoản

Ví dụ:

```bash
# Change a user's shell
sudo usermod -s /bin/bash username

# Add a user to supplementary groups
sudo usermod -aG sudo,docker username
```

Tùy chọn `-a` với `-G` sẽ thêm vào các nhóm hiện có thay vì thay thế chúng.

### Xóa người dùng

Xóa người dùng:

```bash
sudo userdel username
```

Xóa người dùng và thư mục chính của họ:

```bash
sudo userdel -r username
```

### Tài khoản người dùng hết hạn

Đặt thời hạn tài khoản:

```bash
sudo usermod -e YYYY-MM-DD username
```

Buộc thay đổi mật khẩu vào lần đăng nhập tiếp theo:

```bash
sudo chage -d 0 username
```

Xem thông tin lão hóa tài khoản:

```bash
sudo chage -l username
```

## Lệnh quản lý nhóm

### Tạo nhóm

Tạo một nhóm mới:

```bash
sudo groupadd groupname
```

Với một GID cụ thể:

```bash
sudo groupadd -g 1005 groupname
```

### Sửa đổi nhóm

Sửa đổi một nhóm:

```bash
sudo groupmod [options] groupname
```

Các tùy chọn phổ biến:

- `-g`: Thay đổi GID
- `-n`: Thay đổi tên nhóm

Ví dụ:

```bash
# Rename a group
sudo groupmod -n new_name old_name
```

### Xóa nhóm

Xóa một nhóm:

```bash
sudo groupdel groupname
```

### Quản lý thành viên nhóm

Thêm người dùng vào nhóm:

```bash
sudo usermod -aG groupname username
```

Xóa người dùng khỏi nhóm:

```bash
sudo gpasswd -d username groupname
```

Liệt kê các nhóm mà người dùng thuộc về:

```bash
groups username
```

Thay đổi nhóm chính của người dùng:

```bash
sudo usermod -g groupname username
```

## Lệnh sudo

Lệnh `sudo` cho phép người dùng thông thường thực thi các lệnh với đặc quyền nâng cao.

### Hiểu sudo

Khi người dùng sử dụng `sudo`, họ tạm thời được cấp quyền của người dùng khác (thường là root) để thực thi một lệnh cụ thể. Điều này cung cấp một dấu vết kiểm tra và giới hạn thời gian dành cho các đặc quyền nâng cao.

Cách sử dụng cơ bản:

```bash
sudo command_to_run
```

Chạy lệnh với tư cách người dùng cụ thể:

```bash
sudo -u username command_to_run
```

Mở shell gốc:

```bash
sudo -i
```

### Định cấu hình quyền truy cập sudo

Cấu hình sudo nằm trong `/etc/sudoers` và các tệp trong `/etc/sudoers.d/`. Luôn chỉnh sửa các tệp này bằng `visudo` để tránh lỗi cú pháp:

```bash
sudo visudo
```

Một mục sudo cơ bản:

```
username ALL=(ALL:ALL) ALL
```

Điều này cho phép `username` chạy bất kỳ lệnh nào với tư cách bất kỳ người dùng nào trên bất kỳ máy chủ nào.

Để cấp quyền truy cập mà không yêu cầu mật khẩu:

```
username ALL=(ALL:ALL) NOPASSWD: ALL
```

Để giới hạn các lệnh cụ thể:

```
username ALL=(ALL:ALL) /usr/bin/apt, /usr/bin/systemctl restart apache2
```

Cấp quyền truy cập sudo cho tất cả thành viên của nhóm:

```
%sudo ALL=(ALL:ALL) ALL
```

### Hiểu cú pháp Sudoers

Cú pháp là:

```
user_list host_list=(user_list:group_list) command_list
```

- `user_list`: Người dùng hoặc nhóm (có tiền tố %) áp dụng quy tắc
- `host_list`: Máy chủ áp dụng quy tắc
- `user_list:group_list`: Người dùng/nhóm lệnh có thể được chạy dưới dạng
- `command_list`: Các lệnh có thể được thực thi

## Giới hạn người dùng và kiểm soát tài nguyên

Linux cung cấp các cách để hạn chế tài nguyên người dùng:

### /etc/security/limits.conf

Tệp này kiểm soát giới hạn tài nguyên cho người dùng và nhóm:

```bash
cat /etc/security/limits.conf
```

Mục ví dụ:

```
# Limit number of processes
username hard nproc 100

# Limit file size
@developers soft fsize 1000000
```

Các loại giới hạn:

- `soft`: Người dùng có thể điều chỉnh đến giới hạn cứng
- `hard`: Giá trị tối đa, chỉ có thể điều chỉnh bằng root

Nguồn lực có thể bị hạn chế:

- `nproc`: Số lượng tiến trình
- `nofile`: Số lượng file đang mở
- `fsize`: Kích thước tệp tối đa
- `cpu`: thời gian CPU
- `as`: Không gian địa chỉ (bộ nhớ)

### Kế toán quy trình

Để theo dõi hoạt động của người dùng, hãy cài đặt tính năng kế toán quy trình:

```bash
# On Debian/Ubuntu
sudo apt install acct

# On Fedora/RHEL/CentOS
sudo dnf install psacct
```

Bắt đầu dịch vụ:

```bash
sudo systemctl enable --now acct
```

Xem tóm tắt sử dụng lệnh:

```bash
sudo sa
```

Xem hoạt động của người dùng:

```bash
sudo lastcomm username
```

## Hệ thống xác thực

Linux sử dụng Mô-đun xác thực có thể cắm (PAM) để xác thực linh hoạt:

### Cấu hình PAM

Các tệp cấu hình PAM có trong `/etc/pam.d/`:

```bash
ls -l /etc/pam.d/
```

Mỗi tệp cấu hình xác thực cho một dịch vụ khác nhau.

### Chính sách mật khẩu

Đặt chính sách mật khẩu trong `/etc/security/pwquality.conf` hoặc `/etc/pam.d/common-password`:

```bash
# View password quality configuration
cat /etc/security/pwquality.conf
```

Cài đặt chung:

- `minlen`: Độ dài mật khẩu tối thiểu
- `minclass`: Các lớp ký tự tối thiểu (chữ thường, chữ hoa, chữ số, đặc biệt)
- `maxrepeat`: Ký tự lặp lại tối đa
- `reject_username`: Từ chối mật khẩu chứa tên người dùng
- `enforce_for_root`: Áp dụng chính sách cho người dùng root

### Kiểm soát truy cập đăng nhập

Định cấu hình hạn chế đăng nhập trong `/etc/security/access.conf`:

```bash
sudo nano /etc/security/access.conf
```

Quy tắc ví dụ:

```
- : ALL EXCEPT root : cron
+ : admins : ALL
- : ALL : ALL
```

Điều này từ chối quyền truy cập cron vào tất cả ngoại trừ root, cho phép nhóm quản trị viên từ mọi nơi và từ chối tất cả các quyền truy cập khác.

## Xác thực khóa SSH

Khóa SSH cung cấp xác thực an toàn mà không cần mật khẩu:

### Tạo khóa SSH

Tạo cặp khóa:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Hoặc với RSA:

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

### Thêm khóa vào máy chủ

Sao chép khóa chung của bạn vào máy chủ từ xa:

```bash
ssh-copy-id username@remote_host
```

Hoặc bằng tay:

```bash
cat ~/.ssh/id_ed25519.pub | ssh username@remote_host "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### Cấu hình máy chủ SSH

Định cấu hình cài đặt SSH trong `/etc/ssh/sshd_config`:

```bash
sudo nano /etc/ssh/sshd_config
```

Cài đặt bảo mật phổ biến:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
```

Sau khi thay đổi, hãy khởi động lại dịch vụ SSH:

```bash
sudo systemctl restart sshd
```

## Cấu hình môi trường người dùng

### Môi trường toàn hệ thống

Các biến môi trường toàn hệ thống được đặt trong một số tệp:

- `/etc/environment`: Cặp KEY=VALUE đơn giản
- `/etc/profile`: Được thực thi để đăng nhập shell
- `/etc/profile.d/*.sh`: Tập lệnh được thực thi theo hồ sơ
- `/etc/bash.bashrc`: Được thực thi cho bash tương tác không đăng nhập shell

### Môi trường người dùng

Cấu hình môi trường dành riêng cho người dùng:

- `~/.profile`: Được thực thi để đăng nhập shell
- `~/.bashrc`: Được thực thi cho bash tương tác không đăng nhập shell
- `~/.bash_profile` hoặc `~/.bash_login`: Thay thế cho `.profile` cho bash

Thêm các biến môi trường cá nhân trong `~/.bashrc`:

```bash
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Cài đặt người dùng mặc định

Thư mục `/etc/skel/` chứa các tệp được sao chép vào thư mục chính của người dùng mới:

```bash
ls -la /etc/skel/
```

Tùy chỉnh các tệp này để cung cấp cấu hình mặc định cho người dùng mới.

### Mặc định tài khoản người dùng

Tệp `/etc/login.defs` kiểm soát mặc định cho tài khoản người dùng:

```bash
cat /etc/login.defs
```

Cài đặt quan trọng:

- `PASS_MAX_DAYS`: Tuổi mật khẩu tối đa
- `PASS_MIN_DAYS`: Tuổi mật khẩu tối thiểu
- `PASS_WARN_AGE`: Ngày cảnh báo hết hạn mật khẩu
- `UID_MIN`, `UID_MAX`: Phạm vi dành cho ID người dùng thông thường
- `GID_MIN`, `GID_MAX`: Phạm vi dành cho ID nhóm thông thường
- `CREATE_HOME`: Có tạo thư mục chính hay không
- `UMASK`: Quyền tạo tệp mặc định

Cài đặt mặc định cho `useradd` nằm trong `/etc/default/useradd`:

```bash
cat /etc/default/useradd
```

## Ví dụ thực tế

Hãy cùng xem qua một số tình huống quản lý người dùng trong thế giới thực:

### Thành lập nhóm phát triển

Tạo nhóm phát triển có quyền truy cập chung vào thư mục dự án:

```bash
# Create a developers group
sudo groupadd developers

# Create the project directory
sudo mkdir -p /opt/projects/web-app

# Set ownership and permissions
sudo chown root:developers /opt/projects/web-app
sudo chmod 2775 /opt/projects/web-app

# Create a user and add to the group
sudo useradd -m -s /bin/bash -c "Sarah Developer" sarah
sudo usermod -aG developers sarah

# Set password for the new user
sudo passwd sarah
```

Thư mục sẽ có các quyền sau:

- quyền sở hữu nhóm của `developers`
- quyền truy cập ghi nhóm
- bit setgid (2) để đảm bảo các file mới trong thư mục kế thừa nhóm `developers`

### Thiết lập người dùng bị hạn chế

Tạo người dùng có quyền truy cập hạn chế:

```bash
# Create restricted shell directory
sudo mkdir /home/restricted
sudo cp /bin/bash /home/restricted/rbash
sudo chmod 755 /home/restricted/rbash

# Create a user with restricted shell
sudo useradd -m -d /home/guest -s /home/restricted/rbash guest

# Create a bin directory with allowed commands
sudo mkdir /home/guest/bin
sudo ln -s /bin/ls /home/guest/bin/
sudo ln -s /bin/cat /home/guest/bin/

# Set ownership
sudo chown -R guest:guest /home/guest/bin

# Add to .bashrc to restrict PATH
echo 'PATH=$HOME/bin' | sudo tee -a /home/guest/.bashrc
echo 'export PATH' | sudo tee -a /home/guest/.bashrc
sudo chown guest:guest /home/guest/.bashrc
```

Điều này tạo ra một người dùng bị hạn chế, người chỉ có thể chạy các lệnh `ls` và `cat`.

### Thiết lập người dùng dịch vụ

Tạo người dùng không đăng nhập để chạy dịch vụ:

```bash
# Create user without home directory or login shell
sudo useradd --system --no-create-home --shell /usr/sbin/nologin appservice

# Create application directory
sudo mkdir -p /var/www/app
sudo chown appservice:appservice /var/www/app

# Create systemd service file
sudo tee /etc/systemd/system/app.service > /dev/null << 'EOF'
[Unit]
Description=My Application Service
After=network.target

[Service]
User=appservice
Group=appservice
WorkingDirectory=/var/www/app
ExecStart=/usr/bin/python3 /var/www/app/app.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
```

Điều này tạo ra một người dùng hệ thống có thể chạy một dịch vụ nhưng không thể đăng nhập một cách tương tác.

### Thiết lập hạn ngạch đĩa

Giới hạn dung lượng ổ đĩa mà người dùng có thể sử dụng:

```bash
# Install quota tools
sudo apt install quota

# Enable quotas in /etc/fstab for the user partition
# Add usrquota to the mount options, e.g.:
# UUID=xxxx / ext4 defaults,usrquota 0 1

# Remount the file system
sudo mount -o remount /

# Create quota files and turn on quotas
sudo quotacheck -cum /
sudo quotaon /

# Set quota for a user (soft limit: 500MB, hard limit: 550MB)
sudo setquota -u username 500000 550000 0 0 /
```

Kiểm tra việc sử dụng hạn ngạch:

```bash
sudo quota -u username
```

## Quản lý người dùng môi trường đám mây

Khi làm việc với máy chủ đám mây, bạn thường cần thiết lập người dùng. Đây là cách thực hiện trên DigitalOcean Droplet:

1. Tạo một Droplet mới (sử dụng [liên kết này](https://m.do.co/c/2a9bba940f39) với khoản tín dụng $200)
2. Kết nối với quyền root
3. Tạo người dùng không phải root với đặc quyền sudo:

```bash
# Create user
adduser newuser

# Add to sudo group on Ubuntu
usermod -aG sudo newuser

# Add to wheel group on CentOS/RHEL
# usermod -aG wheel newuser

# Create SSH directory and set permissions
mkdir -p /home/newuser/.ssh
chmod 700 /home/newuser/.ssh

# Add your public key
echo "your_public_key_here" > /home/newuser/.ssh/authorized_keys
chmod 600 /home/newuser/.ssh/authorized_keys
chown -R newuser:newuser /home/newuser/.ssh

# Test that you can log in as the new user
# ssh newuser@your_server_ip
```

Quá trình này tạo ra một người dùng an toàn, không phải root, có thể thực thi các lệnh quản trị bằng sudo.

## Tiến về phía trước

Bây giờ bạn đã hiểu cách tạo và quản lý người dùng và nhóm, kiểm soát quyền truy cập bằng quyền, định cấu hình xác thực và thiết lập môi trường người dùng. Những kỹ năng này rất cần thiết để duy trì các hệ thống Linux an toàn và được tổ chức tốt.

Trong phần tiếp theo, chúng ta sẽ khám phá cách quản lý quy trình, tìm hiểu cách giám sát, kiểm soát và tối ưu hóa các quy trình chạy trên hệ thống Linux của bạn.

Quản lý người dùng và nhóm là nền tảng cho thiết kế nhiều người dùng của Linux. Cho dù bạn đang quản lý hệ thống cá nhân hay máy chủ doanh nghiệp, những khái niệm và lệnh này sẽ giúp bạn duy trì tính bảo mật, tổ chức và hiệu quả.
