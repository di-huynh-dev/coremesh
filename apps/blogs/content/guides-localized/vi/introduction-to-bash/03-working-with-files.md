---
title: "Làm việc với tập tin"
description: Tìm hiểu các thao tác với tệp trong Bash để quản lý, tìm kiếm và thao tác các tệp và thư mục một cách hiệu quả
order: 3
---

Thao tác với tệp là trọng tâm khi làm việc với Bash. Hãy khám phá các kỹ thuật nâng cao hơn để làm việc với các tệp và thư mục sẽ giúp bạn sử dụng dòng lệnh hiệu quả hơn nhiều.

## Danh sách tập tin chi tiết và thông tin

Lệnh `ls` có nhiều tùy chọn hữu ích giúp bạn thu thập thông tin về các tệp:

```bash
# List files with detailed information (permissions, size, dates)
ls -l

# List all files including hidden ones (those starting with .)
ls -a

# List files sorted by modification time (newest first)
ls -lt

# List files with human-readable sizes (KB, MB, GB)
ls -lh

# Recursively list all files in a directory and its subdirectories
ls -R
```

Để nhận thông tin cụ thể về một tệp, bạn có thể sử dụng các lệnh sau:

```bash
# Show file type
file document.txt

# Display file status
stat document.txt

# Show file size
du -h document.txt

# Calculate disk usage of directories
du -sh /path/to/directory

# Show total disk usage of current directory
du -sh .
```

## Tạo và chỉnh sửa tập tin

Trong khi `touch` tạo các tệp trống, bạn thường muốn thêm nội dung:

```bash
# Create a file with content
echo "Hello, world!" > hello.txt

# Append to an existing file
echo "New line" >> hello.txt

# Use a command's output as file content
date > timestamp.txt

# Edit a file with a text editor
nano hello.txt  # Simple editor for beginners
vim hello.txt   # More powerful but steeper learning curve
```

> Nếu bạn là người mới sử dụng trình soạn thảo dòng lệnh, `nano` sẽ dễ bắt đầu hơn nhiều so với `vim`. Các lệnh xuất hiện ở cuối màn hình.

## Tìm tập tin và nội dung

Tìm kiếm tập tin hiệu quả là rất quan trọng cho năng suất:

```bash
# Basic file find by name
find /path/to/search -name "*.txt"

# Find files modified in the last 24 hours
find /path/to/search -mtime -1

# Find files larger than 10MB
find /path/to/search -size +10M

# Find and execute a command on each result
find /path/to/search -name "*.txt" -exec echo "Found: {}" \;

# Find files containing specific text (faster than grep + find)
grep -r "search text" /path/to/search
```

Khi xử lý các cấu trúc thư mục lớn, bạn có thể thực hiện tìm kiếm của mình hiệu quả hơn:

```bash
# Ignore case in search
grep -i "search text" file.txt

# Show line numbers where matches occur
grep -n "search text" file.txt

# Count occurrences
grep -c "search text" file.txt

# Show only filenames with matches
grep -l "search text" *.txt
```

## So sánh và khác biệt giữa tệp

So sánh các tập tin là một nhiệm vụ phổ biến:

```bash
# Compare two files
diff file1.txt file2.txt

# Side-by-side comparison
diff -y file1.txt file2.txt

# Compare directories
diff -r dir1 dir2

# Three-way merge comparison
diff3 file1.txt file2.txt file3.txt
```

Để so sánh trực quan hơn, nếu có trên hệ thống của bạn:

```bash
# Visual diff tool
vimdiff file1.txt file2.txt

# Another visual diff tool
meld file1.txt file2.txt
```

## Nén và lưu trữ tệp

Quản lý kho lưu trữ nén là điều cần thiết để quản lý tệp hiệu quả:

```bash
# Create a .tar archive
tar -cf archive.tar file1 file2 directory1

# Create a compressed .tar.gz archive
tar -czf archive.tar.gz file1 file2 directory1

# Extract from a .tar archive
tar -xf archive.tar

# Extract from a compressed .tar.gz archive
tar -xzf archive.tar.gz

# List contents of an archive without extracting
tar -tf archive.tar
```

Để nén một tập tin:

```bash
# Compress a file with gzip
gzip file.txt  # Creates file.txt.gz and removes original

# Decompress a gzip file
gunzip file.txt.gz

# Compress without removing the original
gzip -c file.txt > file.txt.gz
```

## Chuyển tập tin

Khi bạn cần sao chép tập tin giữa các hệ thống:

```bash
# Secure copy from local to remote
scp local_file.txt username@remote_host:/path/to/destination

# Secure copy from remote to local
scp username@remote_host:/path/to/remote_file.txt local_destination

# Secure copy directory (recursive)
scp -r local_directory username@remote_host:/path/to/destination
```

Ngoài ra, bạn có thể sử dụng `rsync` để truyền hiệu quả hơn, đặc biệt đối với các tệp hoặc thư mục lớn:

```bash
# Synchronize directories, only copying changed files
rsync -av source_directory/ destination_directory/

# Remote rsync with SSH
rsync -avz -e ssh source_directory/ username@remote_host:/path/to/destination/
```

> **Cần một máy chủ để thực hành các thao tác tệp?** Nếu bạn muốn thử nghiệm các thao tác tệp từ xa, hãy cân nhắc việc thiết lập DigitalOcean Droplet. Các gói cơ bản của họ bắt đầu chỉ với $4/tháng và bạn có thể nhận được khoản tín dụng $200 để bắt đầu bằng cách sử dụng liên kết này: [https://m.do.co/c/2a9bba940f39](https://m.do.co/c/2a9bba940f39)

## Hoạt động tập tin nâng cao

Một số thao tác tệp chuyên biệt nhưng hữu ích hơn:

```bash
# Split a large file into smaller pieces
split -b 100M large_file.dat chunk_

# Reassemble the pieces
cat chunk_* > large_file_restored.dat

# Create a symbolic link (shortcut)
ln -s target_file link_name

# Create a hard link (multiple references to same inode)
ln target_file link_name

# Count lines, words, and characters in a file
wc file.txt

# Sort file contents
sort file.txt

# Remove duplicate lines (requires sorted input)
sort file.txt | uniq

# Replace text in files
sed 's/old_text/new_text/g' file.txt

# Process text with awk
awk '{print $1}' file.txt  # Print first column
```

## Xử lý các ký tự đặc biệt trong tên tệp

Tên tệp có dấu cách hoặc ký tự đặc biệt có thể phức tạp:

```bash
# Using quotes
cp "file with spaces.txt" destination/

# Using backslash to escape spaces
cp file\ with\ spaces.txt destination/

# Handling files with unusual characters
ls -la | grep -E "\?\\\$\%"
```

## Tập tin và thư mục tạm thời

Đối với các hoạt động cần lưu trữ tạm thời:

```bash
# Create a temporary file
tempfile=$(mktemp)
echo "Working with $tempfile"

# Create a temporary directory
tempdir=$(mktemp -d)
echo "Working with $tempdir"

# Clean up when done
rm "$tempfile"
rmdir "$tempdir"
```

Bằng cách tìm hiểu các thao tác tệp này, bạn sẽ được trang bị tốt để xử lý hầu hết các tác vụ quản lý tệp từ dòng lệnh. Trong phần tiếp theo, chúng ta sẽ khám phá các biến Bash, những biến cần thiết để tạo các tập lệnh phức tạp hơn.
