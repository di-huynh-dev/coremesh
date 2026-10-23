---
title: "Giao diện dòng lệnh Linux"
description: Các lệnh đầu cuối Linux cần thiết để làm quen với dòng lệnh. Bao gồm ls, cd, cp, mv, grep, pipe, chuyển hướng và đọc các trang man.
order: 3
---

Mặc dù giao diện đồ họa người dùng (GUI) đã giúp Linux dễ truy cập hơn nhưng giao diện dòng lệnh (CLI) vẫn là cách mạnh mẽ nhất để tương tác với hệ thống Linux của bạn. Trong phần này, chúng ta sẽ khám phá thiết bị đầu cuối và tìm hiểu các lệnh thiết yếu sẽ hình thành nền tảng cho các kỹ năng Linux của bạn.

## Tại sao nên sử dụng dòng lệnh?

Bạn có thể thắc mắc tại sao bạn lại sử dụng dòng lệnh khi có sẵn giao diện đồ họa. Có một số lý do thuyết phục:

- **Efficiency**: Nhiều tác vụ được thực hiện bằng lệnh nhanh hơn so với việc nhấp qua menu
- **Automation**: Bạn có thể tạo tập lệnh để tự động hóa các tác vụ lặp đi lặp lại
- **Truy cập từ xa**: Quản lý máy chủ không có GUI bằng SSH
- **Hiệu quả tài nguyên**: Công cụ CLI sử dụng ít tài nguyên hệ thống hơn
- **Precision**: Các lệnh giúp bạn kiểm soát chính xác các hoạt động
- **Documentation**: Việc ghi lại và chia sẻ hướng dẫn dòng lệnh dễ dàng hơn

Ngay cả khi bạn chủ yếu sử dụng GUI, việc biết cách sử dụng dòng lệnh sẽ nâng cao đáng kể trải nghiệm Linux của bạn.

## Mở Terminal

Có một số cách để truy cập thiết bị đầu cuối:

- **Phím tắt bàn phím**: Nhấn `Ctrl+Alt+T` trong hầu hết các môi trường máy tính để bàn
- **Menu ứng dụng**: Tìm "Terminal" hoặc "Console"
- **Nhấp chuột phải**: Một số môi trường máy tính để bàn cung cấp "Mở Terminal tại đây" khi nhấp chuột phải vào trình quản lý tệp
- **Search**: Nhập "terminal" trong tìm kiếm hệ thống

Khi thiết bị đầu cuối mở ra, bạn sẽ thấy lời nhắc thường hiển thị tên người dùng, tên máy tính và thư mục hiện tại của bạn, theo sau là biểu tượng `$` (hoặc `#` nếu bạn là người dùng root).

Ví dụ:

```
username@hostname:~$
```

`~` đại diện cho thư mục chính của bạn, đó là `/home/yourusername`.

## Thông tin cơ bản về shell

Chương trình diễn giải các lệnh của bạn được gọi là "shell." shell phổ biến nhất là Bash (Bourne Again shell), nhưng những loại khác như Zsh và Fish cũng rất phổ biến.

### Cấu trúc lệnh

Hầu hết các lệnh Linux đều tuân theo cấu trúc cơ bản này:

```bash
command [options] [arguments]
```

- **command**: Chương trình hoặc hành động bạn muốn chạy
- **options**: Cờ sửa đổi cách chạy lệnh (thường có tiền tố là `-` hoặc `--`)
- **arguments**: Lệnh tác động lên điều gì (tệp, thư mục, v.v.)

Hãy cùng khám phá một số lệnh thiết yếu, được sắp xếp theo chức năng.

## Điều hướng hệ thống tập tin

### 1. In thư mục làm việc

Lệnh `pwd` hiển thị vị trí hiện tại của bạn trong hệ thống tệp:

```bash
pwd
```

Ví dụ đầu ra:

```
/home/username
```

### 2. Liệt kê tập tin và thư mục

Lệnh `ls` liệt kê các tệp và thư mục:

```bash
ls
```

Các tùy chọn phổ biến:

- `ls -l`: Định dạng dài với các chi tiết (quyền, kích thước, ngày tháng)
- `ls -a`: Hiển thị các tệp ẩn (những tệp bắt đầu bằng dấu chấm)
- `ls -h`: Kích thước tệp con người có thể đọc được (KB, MB, GB)
- `ls -R`: Liệt kê đệ quy các thư mục con

Kết hợp các lựa chọn:

```bash
ls -lah
```

Điều này hiển thị tất cả các tệp bao gồm cả tệp ẩn, ở định dạng dài với kích thước mà con người có thể đọc được.

### 3. Thay đổi thư mục

Lệnh `cd` thay đổi thư mục hiện tại của bạn:

```bash
cd /path/to/directory
```

Các phím tắt hữu ích:

- `cd ~`: Chuyển đến thư mục chính của bạn
- `cd ..`: Đi lên một thư mục
- `cd -`: Trở về thư mục trước đó
- `cd`: Không có đối số, chuyển đến thư mục chính

Ví dụ:

```bash
cd /etc           # Go to the etc directory
cd ~/Documents    # Go to Documents in your home
cd ../..          # Go up two directories
```

## Quản lý tập tin

### 1. Tạo tập tin và thư mục

Tạo một thư mục với `mkdir`:

```bash
mkdir my_directory
mkdir -p parent/child/grandchild    # Create parent directories as needed
```

Tạo một tệp trống với `touch`:

```bash
touch file.txt
touch file1.txt file2.txt file3.txt    # Create multiple files
```

### 2. Sao chép tập tin và thư mục

Sao chép bằng `cp`:

```bash
cp source.txt destination.txt    # Copy a file
cp -r source_dir destination_dir    # Copy a directory recursively
```

### 3. Di chuyển và đổi tên

Lệnh `mv` xử lý cả việc di chuyển và đổi tên:

```bash
mv old_name.txt new_name.txt    # Rename a file
mv file.txt /path/to/directory/    # Move a file
mv dir1 dir2    # Move (or rename) a directory
```

### 4. Xóa tập tin và thư mục

Xóa file bằng `rm`:

```bash
rm file.txt    # Remove a file
rm -r directory    # Remove a directory and its contents
rm -i file.txt    # Ask for confirmation before removing
```

> **⚠️ Cảnh báo:** Không giống như xóa tệp trong GUI, lệnh `rm` không di chuyển các mục vào thùng rác. Việc xóa là ngay lập tức và thường không thể phục hồi được. Đặc biệt cẩn thận với `rm -rf`, tính năng này sẽ xóa các thư mục theo cách đệ quy mà không yêu cầu xác nhận.

Xóa các thư mục trống bằng `rmdir`:

```bash
rmdir empty_directory
```

## Xem nội dung tập tin

### 1. Hiển thị toàn bộ nội dung tệp

Hiển thị nội dung file với `cat`:

```bash
cat file.txt
cat file1.txt file2.txt    # Display multiple files
```

### 2. Xem tập tin lớn

Đối với các tệp lớn, hãy sử dụng `less` cho phép cuộn:

```bash
less large_file.txt
```

Điều hướng trong `less`:

- `Space` hoặc `Page Down`: Trang tiếp theo
- `b` hoặc `Page Up`: Trang trước
- `/pattern`: Tìm kiếm tiếp theo "mẫu"
- `n`: Kết quả tìm kiếm tiếp theo
- `q`: Thoát

### 3. Hiển thị tập tin bắt đầu hoặc kết thúc

Hiển thị 10 dòng đầu tiên với `head`:

```bash
head file.txt
head -n 20 file.txt    # Show first 20 lines
```

Hiển thị 10 dòng cuối cùng với `tail`:

```bash
tail file.txt
tail -n 20 file.txt    # Show last 20 lines
tail -f log_file.txt    # Follow the file (show updates in real-time)
```

Tùy chọn `-f` cực kỳ hữu ích để theo dõi tệp nhật ký.

## Tìm tập tin và nội dung

### 1. Tìm tệp theo tên

Sử dụng `find` để tìm kiếm tệp theo hệ thống phân cấp thư mục:

```bash
find /path/to/search -name "filename"
find . -name "*.txt"    # Find all .txt files in current directory and subdirectories
find /home -type d -name "Downloads"    # Find directories named "Downloads"
```

### 2. Tìm kiếm văn bản trong tệp

Sử dụng `grep` để tìm kiếm các mẫu trong tệp:

```bash
grep "search_term" file.txt
grep -i "case insensitive" file.txt    # Ignore case
grep -r "search in all files" .    # Search recursively in current directory
```

### 3. Xác định vị trí tệp trong cơ sở dữ liệu

Để tìm kiếm nhanh hơn, `locate` sử dụng cơ sở dữ liệu dựng sẵn:

```bash
locate filename.txt
```

Cập nhật cơ sở dữ liệu định vị với:

```bash
sudo updatedb
```

## Làm việc với tập tin văn bản

### 1. Trình soạn thảo văn bản đơn giản

Chỉnh sửa tệp văn bản với `nano` (thân thiện với người mới bắt đầu):

```bash
nano file.txt
```

Các lệnh nano chính:

- `Ctrl+O`: Lưu tập tin
- `Ctrl+X`: Thoát
- `Ctrl+G`: Trợ giúp

Để chỉnh sửa nâng cao hơn, hãy thử `vim` hoặc `emacs`:

```bash
vim file.txt
```

### 2. Chuyển hướng đầu ra

Lưu đầu ra lệnh vào một tệp có `>` (ghi đè) hoặc `>>` (nối thêm):

```bash
ls -l > file_list.txt
echo "Add this line" >> notes.txt
```

### 3. Lệnh đường ống

Kết nối các lệnh với `|` để sử dụng đầu ra của một lệnh làm đầu vào của lệnh khác:

```bash
ls -la | grep "Dec"    # List files modified in December
cat file.txt | sort    # Sort the contents of file.txt
cat file.txt | grep "pattern" | wc -l    # Count lines containing "pattern"
```

## Kiểm soát thực thi lệnh

### 1. Chạy nhiều lệnh

Chạy lệnh tuần tự với `;`:

```bash
mkdir new_dir; cd new_dir; touch file.txt
```

Chỉ chạy lệnh thứ hai nếu lệnh đầu tiên thành công với `&&`:

```bash
mkdir new_dir && cd new_dir
```

Chỉ chạy lệnh thứ hai nếu lệnh đầu tiên không thành công với `||`:

```bash
ping -c 1 google.com || echo "Internet connection failed"
```

### 2. Quy trình nền

Chạy lệnh trong nền với `&`:

```bash
long_running_command &
```

### 3. Lịch sử lệnh

Xem các lệnh đã sử dụng trước đó với `history`:

```bash
history
history | grep "find"    # Search for previous find commands
```

Chạy lại lệnh trước đó:

- `!!`: Lệnh cuối cùng
- `!n`: Số lệnh n từ lịch sử
- `!string`: Lệnh gần đây nhất bắt đầu bằng "chuỗi"

### 4. Hoàn thành tab

Sử dụng phím `Tab` để:

- Hoàn thành các lệnh và tên tập tin
- Hiển thị những sự hoàn thành có thể xảy ra khi không rõ ràng

Điều này giúp tiết kiệm việc gõ và ngăn ngừa lỗi chính tả.

## Hiểu đầu ra lệnh

### 1. Trạng thái thoát

Kiểm tra thành công hay thất bại của lệnh cuối cùng với `echo $?`:

```bash
ls /existing_dir
echo $?    # Outputs 0 for success

ls /nonexistent_dir
echo $?    # Outputs non-zero value for failure
```

### 2. Thông tin lệnh

Nhận trợ giúp về lệnh với tùy chọn `--help` hoặc `man` (thủ công):

```bash
ls --help
man ls
```

### 3. Xem thư mục trong khi bảo tồn bối cảnh

Sử dụng `tree` để trực quan hóa cấu trúc thư mục (cài đặt bằng `sudo apt install tree` nếu cần):

```bash
tree
tree -L 2    # Limit to 2 levels deep
```

## Ví dụ thực tế

Dưới đây là một số ví dụ thực tế kết hợp nhiều lệnh:

Tìm tất cả các tệp .txt trong thư mục chính của bạn và sao chép chúng vào thư mục sao lưu:

```bash
mkdir -p ~/backup
find ~/ -name "*.txt" -type f -exec cp {} ~/backup \;
```

Đếm số từ trong tất cả các tệp văn bản trong thư mục hiện tại:

```bash
find . -name "*.txt" -exec wc -w {} \; | awk '{ sum += $1 } END { print sum }'
```

Tìm 5 tệp lớn nhất trong thư mục chính của bạn:

```bash
find ~/ -type f -exec du -h {} \; | sort -rh | head -n 5
```

Giám sát tệp nhật ký trong thời gian thực, đánh dấu các thông báo lỗi:

```bash
tail -f /var/log/syslog | grep --color=auto "error"
```

## Mẹo tăng năng suất dòng lệnh

### 1. Phím tắt

- `Ctrl+C`: Ngắt/hủy lệnh hiện tại
- `Ctrl+Z`: Tạm dừng quá trình hiện tại (tiếp tục với `fg`)
- `Ctrl+D`: Thoát shell hiện tại
- `Ctrl+L`: Xóa màn hình (giống lệnh `clear`)
- `Ctrl+A`: Di chuyển con trỏ về đầu dòng
- `Ctrl+E`: Di chuyển con trỏ đến cuối dòng
- `Ctrl+U`: Xóa từ con trỏ đến đầu dòng
- `Ctrl+K`: Xóa từ con trỏ đến cuối dòng
- `Ctrl+R`: Tìm kiếm lịch sử lệnh

### 2. Bí danh lệnh

Tạo lối tắt cho các lệnh được sử dụng thường xuyên bằng cách thêm chúng vào tệp `~/.bashrc` của bạn:

```bash
# Add these lines to ~/.bashrc
alias ll='ls -la'
alias update='sudo apt update && sudo apt upgrade'
```

Sau khi chỉnh sửa, hãy chạy `source ~/.bashrc` để áp dụng các thay đổi.

### 3. Định cấu hình lời nhắc của bạn

Tùy chỉnh lời nhắc của bạn bằng cách sửa đổi biến `PS1` trong tệp `~/.bashrc` của bạn:

```bash
# Example colorful prompt with username, hostname, and current directory
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
```

## Tiến về phía trước

Bây giờ bạn đã học được các công cụ dòng lệnh thiết yếu hình thành nên nền tảng tương tác của hệ thống Linux. Khi thực hành, các lệnh này sẽ trở thành bản chất thứ hai, cho phép bạn làm việc hiệu quả trong mọi môi trường Linux.

Trong phần tiếp theo, chúng ta sẽ tìm hiểu chi tiết về hệ thống phân cấp hệ thống tệp Linux, hiểu mục đích và nội dung của các thư mục chính như `/etc`, `/var`, `/usr`, v.v.

Hãy nhớ rằng dòng lệnh là một kỹ năng phát triển theo thời gian. Đừng lo lắng về việc ghi nhớ mọi tùy chọn cho mỗi lệnh, thay vào đó, hãy tập trung tìm hiểu các khái niệm cốt lõi và sử dụng hệ thống trợ giúp (`man`, `--help`) để khám phá thêm khi cần.
