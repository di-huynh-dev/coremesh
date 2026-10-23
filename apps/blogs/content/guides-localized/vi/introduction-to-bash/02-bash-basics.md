---
title: "Cơ bản về Bash"
description: 'Thông tin cơ bản về dòng lệnh Bash: giải phẫu nhanh chóng, cấu trúc lệnh, đối số và tùy chọn, biến môi trường, di chuyển hệ thống tệp và các phím tắt phổ biến.'
order: 2
---

Bây giờ bạn đã hiểu Bash là gì, hãy đi sâu vào các lệnh và khái niệm cơ bản sẽ hình thành nền tảng cho các kỹ năng Bash của bạn.

## Giao diện dòng lệnh

Khi làm việc với Bash, bạn sẽ gõ lệnh tại dấu nhắc. Một dấu nhắc Bash điển hình trông như thế này:

```
username@hostname:~$
```

Điều này cho bạn biết:

- tên người dùng của bạn
- Tên máy chủ của máy tính
- Thư mục hiện tại của bạn (~ là viết tắt của thư mục chính của bạn)
- Ký hiệu $ cho biết bạn là người dùng thông thường (một # sẽ cho biết bạn là người dùng root)

## Cấu trúc lệnh cơ bản

Hầu hết các lệnh Bash đều tuân theo cấu trúc này:

```
command [options] [arguments]
```

Ở đâu:

- `command` là tên chương trình bạn muốn chạy
- `options` sửa đổi cách hoạt động của lệnh (thường có tiền tố - hoặc --)
- `arguments` là những gì lệnh hoạt động (như tên tệp)

## Các lệnh Bash thiết yếu

Hãy cùng khám phá một số lệnh được sử dụng thường xuyên nhất:

### Điều hướng hệ thống tập tin

```bash
# Print working directory (shows where you are)
pwd

# List files and directories in the current location
ls

# List with details and hidden files
ls -la

# Change directory
cd /path/to/directory

# Go to home directory
cd

# Go up one directory
cd ..

# Go to previous directory
cd -
```

### Tạo và thao tác tập tin và thư mục

```bash
# Create an empty file
touch new_file.txt

# Create a directory
mkdir new_directory

# Create nested directories
mkdir -p parent/child/grandchild

# Copy a file
cp source.txt destination.txt

# Copy a directory and its contents
cp -r source_dir destination_dir

# Move or rename a file/directory
mv old_name.txt new_name.txt

# Delete a file
rm filename.txt

# Delete a directory and its contents
rm -r directory_name
```

Luôn thận trọng với lệnh `rm`, đặc biệt là với các tùy chọn `-r` (đệ quy) và `-f` (bắt buộc), vì nó xóa vĩnh viễn các tệp mà không gửi chúng vào thùng rác.

### Xem nội dung tập tin

```bash
# Display entire file content
cat file.txt

# Display file with pagination
less file.txt

# Display the first 10 lines
head file.txt

# Display the last 10 lines
tail file.txt

# Display file with line numbers
nl file.txt
```

Khi sử dụng `less`, bạn có thể nhấn:

- `Space` để chuyển tiếp một trang
- `b` để lùi lại một trang
- `/` theo sau là một thuật ngữ để tìm kiếm
- `q` thoát

### Tìm kiếm mọi thứ

```bash
# Search for files and directories
find /path/to/search -name "filename"

# Search for text within files
grep "search_term" file.txt

# Search recursively in all files
grep -r "search_term" /path/to/directory
```

## Chuỗi lệnh và chuyển hướng

Bash cho phép bạn kết hợp các lệnh theo những cách mạnh mẽ:

### Chuỗi lệnh

```bash
# Run command2 only if command1 succeeds
command1 && command2

# Run command2 only if command1 fails
command1 || command2

# Run command2 regardless of whether command1 succeeds
command1 ; command2
```

### Chuyển hướng đầu vào/đầu ra

```bash
# Redirect output to a file (overwrite)
command > output.txt

# Redirect output to a file (append)
command >> output.txt

# Redirect input from a file
command < input.txt

# Redirect stderr to stdout
command 2>&1

# Redirect both stdout and stderr to a file
command > output.txt 2>&1
```

### Ống

Ống cho phép bạn sử dụng đầu ra của một lệnh làm đầu vào cho lệnh khác:

```bash
# Filter the output of ls through grep
ls -la | grep ".txt"

# Count the number of files in a directory
ls | wc -l

# Find a process and display details
ps aux | grep "firefox"
```

## Nhận trợ giúp

Khi bạn gặp khó khăn hoặc cần tìm hiểu về một lệnh:

```bash
# Show the manual page for a command
man ls

# Short help summary
ls --help

# Display a brief description
whatis ls

# Find commands related to a keyword
apropos search
```

## Lịch sử lệnh

Bash theo dõi các lệnh bạn đã gõ:

```bash
# Show command history
history

# Re-run the last command
!!

# Re-run a specific command from history
!123  # Where 123 is the command number from history

# Search history interactively (press Ctrl+R and start typing)
# Press Ctrl+R again to cycle through matches
```

## Hoàn thành lệnh

Bash cung cấp tính năng hoàn thành lệnh để lưu việc gõ:

- Nhấn `Tab` một lần để hoàn thành lệnh hoặc tên tệp nếu không có sự mơ hồ
- Nhấn `Tab` hai lần để hiển thị tất cả các lần hoàn thành có thể

## Ký tự đại diện và Globbing

Ký tự đại diện cho phép bạn chọn nhiều tệp có mẫu:

```bash
# Match any single character
ls ?.txt  # Matches a.txt, b.txt, but not ab.txt

# Match any number of characters
ls *.txt  # Matches all .txt files

# Match a range of characters
ls [a-c]*.txt  # Matches files starting with a, b, or c and ending with .txt
```

## Môi trường Bash của bạn

Môi trường Bash của bạn bao gồm các biến và cài đặt ảnh hưởng đến cách Bash hoạt động:

```bash
# Display all environment variables
env

# Display a specific variable
echo $HOME

# Display your search path
echo $PATH
```

Những điều cơ bản này sẽ giúp bạn bắt đầu với Bash. Thực hành những mệnh lệnh này để xây dựng trí nhớ cơ bắp và chúng sẽ sớm trở thành bản chất thứ hai. Trong phần tiếp theo, chúng ta sẽ đi sâu vào làm việc với các tệp chuyên sâu hơn, một kỹ năng quan trọng để sử dụng Bash hiệu quả.
