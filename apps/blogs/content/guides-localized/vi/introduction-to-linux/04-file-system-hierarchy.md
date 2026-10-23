---
title: "Phân cấp hệ thống tệp Linux"
description: Hiểu cách tổ chức tệp trong Linux, quyền đối với tệp và cách làm việc với hệ thống tệp Linux một cách hiệu quả.
order: 4
---

Một trong những khái niệm quan trọng nhất cần hiểu trong Linux là hệ thống tệp được cấu trúc như thế nào. Không giống như Windows với các ký tự ổ đĩa (C:, D:, v.v.), Linux sắp xếp tất cả các tệp theo một cấu trúc thư mục phân cấp duy nhất, bắt đầu từ một thư mục gốc duy nhất được chỉ định bằng dấu gạch chéo lên (`/`).

Trong phần này, chúng ta sẽ khám phá cách bố trí hệ thống tệp Linux, hiểu các quyền đối với tệp và tìm hiểu cách điều hướng và quản lý cấu trúc này một cách hiệu quả.

## Tiêu chuẩn phân cấp hệ thống tập tin (FHS)

Hầu hết các bản phân phối Linux đều tuân theo Tiêu chuẩn phân cấp hệ thống tập tin (FHS), tiêu chuẩn này xác định các thư mục chính và nội dung của chúng. Tiêu chuẩn hóa này giúp đảm bảo tính nhất quán trên các hệ thống Linux khác nhau.

Dưới đây là tổng quan về các thư mục quan trọng nhất:

### / (Thư mục gốc)

Thư mục gốc là thư mục cấp cao nhất trong hệ thống phân cấp tệp. Tất cả các thư mục khác đều phân nhánh từ đây, trực tiếp hoặc gián tiếp.

### /bin - Tệp nhị phân người dùng cần thiết

Chứa các chương trình thực thi thiết yếu (nhị phân) cần thiết cho chức năng hệ thống cơ bản, có sẵn cho tất cả người dùng:

```bash
ls -la /bin | head
```

Các chương trình chính ở đây bao gồm shell như `bash` và các tiện ích cốt lõi như `ls`, `cp`, `mv` và `rm`.

### /sbin - Hệ thống nhị phân

Chứa các tệp nhị phân quản trị hệ thống, thường được người dùng root sử dụng:

```bash
ls -la /sbin | head
```

Bao gồm các chương trình bảo trì hệ thống, cấu hình mạng và các tác vụ quản trị khác.

### /etc - Tệp cấu hình

Chứa các tập tin cấu hình toàn hệ thống:

```bash
ls -la /etc | head
```

Các thư mục con và tập tin quan trọng:

- `/etc/passwd`: Thông tin tài khoản người dùng
- `/etc/group`: Định nghĩa nhóm
- `/etc/fstab`: Thông tin gắn kết hệ thống tệp
- `/etc/hosts`: Ánh xạ máy chủ tới IP
- `/etc/ssh/`: Cấu hình SSH
- `/etc/sudoers`: quy tắc truy cập sudo

Hầu hết các tệp ở đây đều là văn bản thuần túy và có thể được chỉnh sửa bằng trình soạn thảo văn bản (mặc dù một số tệp yêu cầu quyền root).

### /home - Thư mục nhà của người dùng

Chứa thư mục con cho mỗi người dùng thông thường, thường được đặt tên theo tên người dùng của họ:

```bash
ls -la /home
```

Thư mục chính của mỗi người dùng (ví dụ: `/home/username/`) lưu trữ các tệp, cấu hình và dữ liệu cá nhân của họ. Khi bạn nhìn thấy dấu ngã (`~`) trong đường dẫn tệp, nó đề cập đến thư mục chính của người dùng hiện tại.

### /root - Trang chủ của người dùng Root

Thư mục chính cho người dùng root (quản trị viên hệ thống):

```bash
ls -la /root
```

Thư mục này tách biệt với thư mục chính của người dùng thông thường vì lý do bảo mật.

### /var - Dữ liệu biến

Chứa các tập tin thay đổi trong quá trình hoạt động của hệ thống:

```bash
ls -la /var
```

Các thư mục con quan trọng:

- `/var/log/`: Tệp nhật ký hệ thống và ứng dụng
- `/var/spool/`: Hàng đợi máy in và thư
- `/var/cache/`: Dữ liệu bộ đệm ứng dụng
- `/var/lib/`: Thông tin biến trạng thái

Các tệp nhật ký trong `/var/log/` đặc biệt hữu ích để khắc phục sự cố:

```bash
ls -la /var/log
```

### /tmp - Tệp tạm thời

Một thư mục có thể ghi trên thế giới cho các tệp tạm thời:

```bash
ls -la /tmp
```

Các tập tin ở đây có thể bị xóa tự động khi hệ thống khởi động lại hoặc sau một khoảng thời gian nhất định.

### /usr - Chương trình người dùng

Chứa phần lớn các chương trình, thư viện, tài liệu và dữ liệu khác của người dùng và hệ thống:

```bash
ls -la /usr
```

Các thư mục con chính:

- `/usr/bin/`: Lệnh của người dùng
- `/usr/sbin/`: Lệnh quản trị hệ thống
- `/usr/lib/`: Thư viện
- `/usr/share/`: Dữ liệu độc lập với kiến trúc
- `/usr/local/`: Phần mềm được cài đặt cục bộ
- `/usr/include/`: Tệp tiêu đề để biên dịch chương trình C

Về mặt lịch sử, `/usr` là viết tắt của "Tài nguyên hệ thống Unix", mặc dù một số người hiện coi nó là "Tài nguyên hệ thống người dùng".

### /opt - Phần mềm tùy chọn

Chứa các gói phần mềm bổ sung:

```bash
ls -la /opt
```

Thường được sử dụng bởi phần mềm thương mại không tuân theo bố cục hệ thống tệp tiêu chuẩn.

### /lib - Thư viện chia sẻ cần thiết

Chứa các thư viện cần thiết cho các chương trình trong `/bin` và `/sbin`:

```bash
ls -la /lib | head
```

Những thư viện này rất cần thiết cho chức năng hệ thống cơ bản.

### /media và /mnt - Điểm gắn kết

Được sử dụng để gắn hệ thống tập tin:

- `/media/`: Dành cho phương tiện di động (ổ USB, CD, v.v.)
- `/mnt/`: Dành cho hệ thống tệp được gắn tạm thời

```bash
ls -la /media
ls -la /mnt
```

### /dev - Tệp thiết bị

Chứa các tập tin thiết bị đại diện cho các thiết bị phần cứng:

```bash
ls -la /dev | head
```

Các tập tin thiết bị quan trọng:

- `/dev/sda`, `/dev/sdb`, v.v.: Đĩa cứng
- `/dev/tty*`: Thiết bị đầu cuối
- `/dev/null`: Loại bỏ tất cả dữ liệu được ghi vào nó
- `/dev/zero`: Cung cấp vô số số 0
- `/dev/random` và `/dev/urandom`: Trình tạo số ngẫu nhiên

### /proc - Thông tin quy trình

Một hệ thống tệp ảo cung cấp thông tin về các quy trình và trạng thái hệ thống:

```bash
ls -la /proc | head
```

Chứa các thư mục được đánh số cho mỗi tiến trình đang chạy, cùng với các tệp đặc biệt có thông tin hệ thống:

```bash
cat /proc/cpuinfo    # CPU information
cat /proc/meminfo    # Memory information
cat /proc/version    # Kernel version
```

### /sys - Thông tin hệ thống

Một hệ thống tệp ảo khác hiển thị thông tin về thiết bị, trình điều khiển và tính năng kernel:

```bash
ls -la /sys | head
```

## Quyền và quyền sở hữu tệp

Linux sử dụng hệ thống cấp phép để kiểm soát ai có thể đọc, ghi hoặc thực thi tệp.

### Hiểu quyền của tệp

Khi bạn liệt kê các tệp bằng `ls -l`, bạn sẽ thấy thông tin về quyền:

```
-rwxrw-r-- 1 user group 4096 Jan 1 12:34 file.txt
```

Các quyền được thể hiện bằng 10 ký tự đầu tiên:

- Vị trí 1: Loại tệp (`-` cho tệp thông thường, `d` cho thư mục, `l` cho liên kết tượng trưng)
- Vị trí 2-4: Quyền của chủ sở hữu (đọc `r`, ghi `w`, thực thi `x`)
- Vị trí 5-7: Quyền của nhóm
- Vị trí 8-10: Quyền của người khác (mọi người khác)

### Biểu diễn số

Quyền cũng có thể được biểu diễn bằng số:

- Đọc (r) = 4
- Viết (w) = 2
- Thực hiện (x) = 1

Thêm các giá trị để có được một chữ số:

- 7 = đọc + ghi + thực thi (4+2+1)
- 6 = đọc + viết (4+2)
- 5 = đọc + thực thi (4+1)
- 4 = chỉ đọc (4)

Một quyền như bộ `chmod 755 file`:

- Chủ sở hữu: 7 (rwx)
- Nhóm: 5 (r-x)
- Khác: 5 (r-x)

### Thay đổi quyền

Sử dụng `chmod` để thay đổi quyền truy cập tệp:

```bash
chmod 755 file.txt    # Set permissions using numeric mode
chmod u+x file.txt    # Add execute permission for user
chmod g-w file.txt    # Remove write permission from group
chmod o=r file.txt    # Set others permission to read-only
chmod a+x file.txt    # Add execute permission for all (user, group, others)
```

Ví dụ về các mẫu quyền phổ biến:

- `chmod 644 file.txt`: Tệp thông thường (người dùng có thể đọc/ghi, người khác có thể đọc)
- `chmod 755 script.sh`: File script (người dùng có thể đọc/ghi/thực thi, người khác có thể đọc/thực thi)
- `chmod 600 private.key`: Tệp khóa riêng (người dùng có thể đọc/ghi, người khác không có quyền truy cập)
- `chmod 775 directory`: Thư mục cộng tác (toàn quyền truy cập cho người dùng/nhóm, đọc/thực thi cho người khác)

### Thay đổi quyền sở hữu

Sử dụng `chown` để thay đổi quyền sở hữu tệp:

```bash
chown user file.txt    # Change the owner
chown user:group file.txt    # Change both owner and group
chown :group file.txt    # Change only the group
```

Sử dụng `chgrp` để chỉ thay đổi nhóm:

```bash
chgrp group file.txt
```

Đối với các thay đổi đệ quy (ảnh hưởng đến thư mục con và nội dung của chúng), hãy thêm tùy chọn `-R`:

```bash
chmod -R 755 directory/
chown -R user:group directory/
```

### Quyền đặc biệt

Ngoài các quyền đọc, ghi và thực thi cơ bản, Linux còn có các quyền đặc biệt:

#### 1. setuid (Đặt ID người dùng)

Khi được đặt trên một tệp thực thi, nó chạy với quyền của chủ sở hữu tệp chứ không phải của người dùng chạy nó.

```bash
chmod u+s file    # Set the setuid bit
chmod 4755 file   # Numeric form (4 represents setuid)
```

Ví dụ: Lệnh `passwd` có quyền setuid, cho phép người dùng thông thường cập nhật file mật khẩu (thuộc sở hữu của root).

#### 2. setgid (Đặt ID nhóm)

Đối với tệp: Khi được thực thi, sẽ chạy với quyền của nhóm tệp.
Đối với thư mục: Các file mới được tạo trong thư mục sẽ kế thừa nhóm của thư mục.

```bash
chmod g+s directory/    # Set the setgid bit
chmod 2755 directory/   # Numeric form (2 represents setgid)
```

#### 3. chút dính

Khi được đặt trên một thư mục, chỉ chủ sở hữu tệp, chủ sở hữu thư mục hoặc người chủ mới có thể xóa hoặc đổi tên các tệp trong đó.

```bash
chmod +t directory/    # Set the sticky bit
chmod 1755 directory/  # Numeric form (1 represents sticky bit)
```

Ví dụ: Thư mục `/tmp` có thiết lập Sticky Bit để ngăn người dùng xóa các tập tin tạm thời của nhau.

## Các loại tệp trong Linux

Linux hỗ trợ một số loại tệp, được biểu thị bằng ký tự đầu tiên trong chuỗi quyền:

- `-`: Tệp thông thường
- `d`: Thư mục
- `l`: Liên kết tượng trưng
- `c`: Thiết bị ký tự
- `b`: Chặn thiết bị
- `p`: Ống được đặt tên
- `s`: Ổ cắm

### Tệp thông thường

Hầu hết các tệp bạn làm việc đều là các tệp thông thường, chứa dữ liệu, văn bản hoặc mã chương trình.

### Thư mục

Thư mục là các tệp đặc biệt chứa danh sách các tệp và thư mục khác.

### Liên kết tượng trưng

Liên kết tượng trưng (symlink) giống như các phím tắt, trỏ đến một tập tin hoặc thư mục khác:

```bash
ln -s target_file link_name    # Create a symbolic link
```

Ví dụ:

```bash
ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/mysite
```

Khi bạn liệt kê một liên kết tượng trưng với `ls -l`, bạn sẽ thấy một cái gì đó như:

```
lrwxrwxrwx 1 user group 8 Jan 1 12:34 link -> target
```

### Liên kết cứng

Liên kết cứng tạo các mục thư mục bổ sung cho cùng một tệp:

```bash
ln target_file link_name    # Create a hard link
```

Liên kết cứng chia sẻ cùng một nút (tham chiếu hệ thống tệp) như tệp gốc. Bạn không thể tạo liên kết cứng tới các thư mục hoặc trên các hệ thống tệp.

## Làm việc với các tập tin ẩn

Trong Linux, bất kỳ tệp hoặc thư mục nào có tên bắt đầu bằng dấu chấm (`.`) đều được coi là ẩn:

```bash
ls -a    # Show all files, including hidden ones
```

Các tập tin và thư mục ẩn phổ biến:

- `.bashrc`: Cấu hình Bash shell
- `.profile`: Đăng nhập cấu hình shell
- `.ssh/`: Khóa SSH và cấu hình
- `.config/`: Cấu hình ứng dụng
- `.cache/`: Dữ liệu được lưu trong bộ nhớ đệm

## Tìm tập tin và thông tin

### Sử dụng `find` với Thuộc tính tệp

Lệnh `find` có thể tìm kiếm dựa trên quyền, quyền sở hữu và các thuộc tính khác:

```bash
# Find files owned by a specific user
find /home -user username

# Find files with specific permissions
find /home -perm 644

# Find files modified in the last 7 days
find /var/log -mtime -7

# Find files larger than 100MB
find / -size +100M
```

### Sử dụng `stat` để biết thông tin tệp

Lệnh `stat` hiển thị thông tin chi tiết về tệp:

```bash
stat file.txt
```

Đầu ra bao gồm thời gian tạo, thời gian sửa đổi, thời gian truy cập, quyền và thông tin inode.

## Tìm hiểu về Inode

Mỗi tệp và thư mục trong Linux được biểu thị bằng một inode (nút chỉ mục), lưu trữ siêu dữ liệu về tệp:

```bash
ls -i file.txt    # Show the inode number
```

Inode chứa:

- Quyền tập tin
- ID chủ sở hữu và nhóm
- Kích thước tệp
- Dấu thời gian (truy cập, sửa đổi, thay đổi)
- Số lượng liên kết cứng
- Con trỏ tới khối dữ liệu

Bản thân tên tệp được lưu trữ trong một mục nhập thư mục trỏ đến inode.

## Quản lý và sử dụng đĩa

### Kiểm tra dung lượng ổ đĩa

Sử dụng `df` để kiểm tra mức sử dụng dung lượng ổ đĩa:

```bash
df -h    # Human-readable sizes
```

### Kiểm tra kích thước thư mục

Sử dụng `du` để kiểm tra kích thước thư mục:

```bash
du -sh directory/    # Summary, human-readable
du -h --max-depth=1 /home    # Show only one level deep
```

### Tìm tập tin lớn

Kết hợp `find` và `sort` để định vị các tệp lớn:

```bash
find /home -type f -size +100M -exec ls -lh {} \; | sort -k 5 -h
```

## Các loại hệ thống tệp

Linux hỗ trợ nhiều loại hệ thống tập tin:

- **ext4**: Mặc định cho nhiều bản phân phối Linux
- **XFS**: Hệ thống tệp hiệu suất cao cho dữ liệu quy mô lớn
- **Btrfs**: Hệ thống tệp hiện đại với các tính năng nâng cao
- **ZFS**: Hệ thống tệp nâng cao với các tính năng toàn vẹn dữ liệu
- **NTFS/FAT32**: Hệ thống tệp Windows (hỗ trợ đọc/ghi thông qua trình điều khiển)

Kiểm tra hệ thống tập tin được gắn với:

```bash
mount
```

## Gắn hệ thống tập tin

Lệnh `mount` gắn hệ thống tệp vào cây thư mục:

```bash
# Mount a USB drive
sudo mount /dev/sdb1 /mnt/usb

# Mount an ISO file
sudo mount -o loop image.iso /mnt/iso

# Mount with specific options
sudo mount -t ext4 -o rw,noatime /dev/sda2 /mnt/data
```

Ngắt kết nối với:

```bash
sudo umount /mnt/usb
```

Để gắn kết liên tục trong các lần khởi động lại, hãy chỉnh sửa `/etc/fstab`.

## Hoạt động tập tin đặc biệt

### Tạo các tệp trống có kích thước cụ thể

Sử dụng `truncate` hoặc `dd`:

```bash
# Create a 100MB empty file
truncate -s 100M file.img

# Alternative with dd
dd if=/dev/zero of=file.img bs=1M count=100
```

### Tạo tập tin thưa thớt

Các tệp thưa chỉ sử dụng dung lượng ổ đĩa cho dữ liệu khác 0:

```bash
# Create a 1GB sparse file
truncate -s 1G sparse.img
```

### Xóa tập tin một cách an toàn

Để xóa các tập tin nhạy cảm một cách an toàn:

```bash
# Install secure deletion tools
sudo apt install secure-delete

# Securely wipe a file
srm sensitive_file.txt

# Alternative using dd
dd if=/dev/urandom of=sensitive_file.txt bs=1M conv=notrunc
rm sensitive_file.txt
```

## Ví dụ thực tế

Hãy xem một số ví dụ thực tế khi làm việc với hệ thống tệp Linux:

### Thiết lập một thư mục dùng chung

Tạo một thư mục nơi các thành viên của nhóm có thể cộng tác:

```bash
# Create the directory
sudo mkdir /opt/shared_project

# Set the group
sudo chgrp developers /opt/shared_project

# Make files inherit the group and give group write permission
sudo chmod 2775 /opt/shared_project

# Verify permissions
ls -ld /opt/shared_project
```

Kết quả `drwxrwsr-x` hiển thị thư mục có thể ghi được theo nhóm và `s` cho biết bit setgid đã được đặt.

### Tạo một tệp cấu hình an toàn

Tạo tệp cấu hình có thông tin nhạy cảm mà chỉ người dùng cụ thể mới có thể truy cập:

```bash
# Create the file
sudo touch /etc/myapp/secret.conf

# Set ownership and restrictive permissions
sudo chown myapp:myapp /etc/myapp/secret.conf
sudo chmod 600 /etc/myapp/secret.conf

# Verify permissions
ls -l /etc/myapp/secret.conf
```

Kết quả `-rw-------` cho thấy chỉ chủ sở hữu mới có thể đọc và ghi file.

### Thiết lập thư mục tạm thời với Sticky Bit

Tạo thư mục trong đó nhiều người dùng có thể tạo tệp nhưng không thể xóa tệp của nhau:

```bash
# Create the directory
sudo mkdir /var/data/temp

# Set permissions with sticky bit
sudo chmod 1777 /var/data/temp

# Verify permissions
ls -ld /var/data/temp
```

Kết quả `drwxrwxrwt` hiển thị thư mục đều có thể ghi được bởi mọi người và `t` cho biết bit dính đã được đặt.

## Tiến về phía trước

Hiểu mô hình cấp phép và phân cấp hệ thống tệp Linux là nền tảng để làm việc hiệu quả với Linux. Kiến thức này sẽ giúp bạn điều hướng hệ thống, khắc phục sự cố và định cấu hình ứng dụng đúng cách.

Trong phần tiếp theo, chúng ta sẽ khám phá cách quản lý gói, tìm hiểu cách cài đặt, cập nhật và xóa phần mềm một cách hiệu quả bằng các trình quản lý gói khác nhau như apt, dnf và yum.

Hệ thống tập tin tạo thành nền tảng của tổ chức hệ thống Linux. Bằng cách tìm hiểu những khái niệm này, bạn đang xây dựng một nền tảng vững chắc cho tất cả những nỗ lực về Linux trong tương lai của mình.
