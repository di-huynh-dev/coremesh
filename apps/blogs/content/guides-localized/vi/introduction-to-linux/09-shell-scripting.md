---
title: "Khái niệm cơ bản về kịch bản shell"
description: Tìm hiểu cách tự động hóa các tác vụ và tạo các công cụ mạnh mẽ bằng cách sử dụng tập lệnh Bash shell.
order: 9
---

Viết kịch bản shell là một trong những kỹ năng mạnh mẽ nhất mà bạn có thể phát triển với tư cách là người dùng Linux. Bằng cách tự động hóa các tác vụ lặp đi lặp lại và kết hợp các lệnh thành các tập lệnh có thể sử dụng lại, bạn có thể tiết kiệm thời gian, giảm lỗi và tạo ra các công cụ phức tạp mà không cần sử dụng gì ngoài shell.

Trong phần này, chúng ta sẽ khám phá các nguyên tắc cơ bản của tập lệnh shell, tập trung vào Bash (Bourne Again shell), shell phổ biến nhất trong các bản phân phối Linux.

## Giới thiệu về tập lệnh shell

### Tập lệnh shell là gì?

Tập lệnh shell là một tệp văn bản chứa một loạt lệnh mà shell có thể thực thi. Nó cho phép bạn:

- Tự động hóa các tác vụ lặp đi lặp lại
- Kết hợp nhiều lệnh vào một chương trình
- Tạo tiện ích tùy chỉnh
- Thực hiện các công việc quản trị hệ thống
- Xử lý dữ liệu và tập tin

### Tạo tập lệnh đầu tiên của bạn

Hãy tạo một câu "Xin chào, Thế giới!" đơn giản! kịch bản:

1. Mở trình soạn thảo văn bản:

   ```bash
   nano hello.sh
   ```

2. Nhập văn bản sau:

   ```bash
   #!/bin/bash

   # This is a comment
   echo "Hello, World!"
   ```

3. Lưu tập tin và thoát

4. Làm cho tập lệnh có thể thực thi được:

   ```bash
   chmod +x hello.sh
   ```

5. Chạy tập lệnh:
   ```bash
   ./hello.sh
   ```

### Hiểu về Shebang

Dòng đầu tiên `#!/bin/bash` được gọi là "shebang" hoặc "hashbang". Nó cho hệ thống biết trình thông dịch nào sẽ thực thi tập lệnh. Shebang phổ biến bao gồm:

- `#!/bin/bash` - Bash shell
- `#!/bin/sh` - shell tương thích POSIX
- `#!/usr/bin/python3` - Python 3
- `#!/usr/bin/perl` - Perl

## Biến và kiểu dữ liệu

### Xác định biến

Các biến lưu trữ dữ liệu có thể được tham chiếu và thao tác trong tập lệnh:

```bash
# Assign a value to a variable
name="Alice"

# Use the variable (note the $ prefix)
echo "Hello, $name!"
```

Quy tắc đặt tên biến:

- Có thể bao gồm chữ cái, số và dấu gạch dưới
- Không thể bắt đầu bằng một số
- Phân biệt chữ hoa chữ thường
- Không có khoảng trắng xung quanh dấu bằng

### Biến môi trường

Các biến môi trường có sẵn cho tất cả các quy trình:

```bash
# Display environment variables
echo "Your home directory is: $HOME"
echo "Your username is: $USER"
echo "Your path is: $PATH"

# Set an environment variable for the current session
export MY_VARIABLE="some value"
```

### Thay thế lệnh

Nắm bắt đầu ra của một lệnh trong một biến:

```bash
# Using backticks (older style)
current_date=`date`

# Using $() syntax (preferred)
current_date=$(date)

echo "Current date and time: $current_date"
```

### Biến đặc biệt

Bash cung cấp các biến đặc biệt cho thông tin tập lệnh:

```bash
echo "Script name: $0"
echo "First argument: $1"
echo "Second argument: $2"
echo "All arguments: $@"
echo "Number of arguments: $#"
echo "Process ID: $$"
echo "Exit status of last command: $?"
```

## Đầu vào và đầu ra

### Đối số dòng lệnh

Xử lý các đối số được truyền vào tập lệnh của bạn:

```bash
#!/bin/bash

if [ $# -lt 1 ]; then
    echo "Usage: $0 <name>"
    exit 1
fi

echo "Hello, $1!"
```

Chạy nó với:

```bash
./script.sh Alice
```

### Đọc đầu vào của người dùng

Nhận thông tin đầu vào từ người dùng một cách tương tác:

```bash
#!/bin/bash

echo "What is your name?"
read name

echo "Hello, $name!"
```

Đọc với lời nhắc:

```bash
read -p "Enter your name: " name
```

Đọc mật khẩu (không có tiếng vang):

```bash
read -sp "Enter your password: " password
echo
```

### Chuyển hướng đầu vào và đầu ra

Chuyển hướng đầu ra sang tập tin:

```bash
# Overwrite file
echo "Hello" > file.txt

# Append to file
echo "World" >> file.txt

# Redirect error messages
command 2> errors.log

# Redirect both output and errors
command > output.log 2>&1
```

Đọc đầu vào từ một tập tin:

```bash
while read line; do
    echo "Line: $line"
done < input.txt
```

## Câu lệnh có điều kiện

### Câu lệnh if-else

Đưa ra quyết định trong tập lệnh của bạn:

```bash
#!/bin/bash

age=25

if [ $age -lt 18 ]; then
    echo "You are a minor."
elif [ $age -ge 18 ] && [ $age -lt 65 ]; then
    echo "You are an adult."
else
    echo "You are a senior."
fi
```

### Toán tử so sánh

Đối với số:

- `-eq` - Bằng
- `-ne` - Không bằng
- `-lt` - Nhỏ hơn
- `-le` - Nhỏ hơn hoặc bằng
- `-gt` - Lớn hơn
- `-ge` - Lớn hơn hoặc bằng

Đối với chuỗi:

- `=` hoặc `==` - Bằng
- `!=` - Không bằng
- `-z` - Chuỗi trống
- `-n` - Chuỗi không trống

Đối với các tập tin:

- `-e` - Tệp tồn tại
- `-f` - Tồn tại tệp thông thường
- `-d` - Thư mục tồn tại
- `-r` - Tệp có thể đọc được
- `-w` - Tệp có thể ghi
- `-x` - Tệp có thể thực thi được

### Toán tử logic

Điều kiện kết hợp:

- `&&`-VÀ
- `||` - HOẶC
- `!` - KHÔNG

```bash
if [ $age -ge 18 ] && [ $has_id = "yes" ]; then
    echo "You can enter."
fi

if [ ! -f config.txt ]; then
    echo "Config file missing!"
fi
```

### Báo cáo trường hợp

Một thay thế cho nhiều câu lệnh if-else:

```bash
#!/bin/bash

read -p "Enter a fruit: " fruit

case $fruit in
    "apple")
        echo "Red fruit"
        ;;
    "banana")
        echo "Yellow fruit"
        ;;
    "grape"|"blueberry")
        echo "Purple fruit"
        ;;
    *)
        echo "Unknown fruit"
        ;;
esac
```

## Vòng lặp

### Đối với vòng lặp

Lặp lại danh sách các mục:

```bash
# Loop through a list
for name in Alice Bob Charlie; do
    echo "Hello, $name!"
done

# Loop through a range of numbers
for i in {1..5}; do
    echo "Number: $i"
done

# C-style for loop
for ((i=1; i<=5; i++)); do
    echo "Count: $i"
done

# Loop through files
for file in *.txt; do
    echo "Processing $file"
done
```

### Vòng lặp while

Thực thi lệnh khi điều kiện đúng:

```bash
#!/bin/bash

count=1

while [ $count -le 5 ]; do
    echo "Count: $count"
    ((count++))
done
```

Đọc từng dòng tệp:

```bash
while read line; do
    echo "Line: $line"
done < input.txt
```

### Cho đến vòng lặp

Thực hiện các lệnh cho đến khi điều kiện trở thành đúng:

```bash
#!/bin/bash

count=1

until [ $count -gt 5 ]; do
    echo "Count: $count"
    ((count++))
done
```

### Kiểm soát vòng lặp

Thực hiện vòng điều khiển:

- `break` - Thoát khỏi vòng lặp
- `continue` - Chuyển sang lần lặp tiếp theo

```bash
for i in {1..10}; do
    if [ $i -eq 3 ]; then
        continue  # Skip 3
    fi

    if [ $i -eq 8 ]; then
        break     # Stop at 8
    fi

    echo "Number: $i"
done
```

## Hàm

### Xác định hàm

Nhóm các lệnh thành các đơn vị có thể tái sử dụng:

```bash
#!/bin/bash

# Define a function
greet() {
    echo "Hello, $1!"
}

# Call the function
greet "Alice"
greet "Bob"
```

Cú pháp thay thế:

```bash
function greet {
    echo "Hello, $1!"
}
```

### Giá trị trả về

hàm có thể trả về mã trạng thái:

```bash
is_even() {
    if [ $(($1 % 2)) -eq 0 ]; then
        return 0  # Success (true)
    else
        return 1  # Failure (false)
    fi
}

if is_even 4; then
    echo "4 is even"
fi

if ! is_even 7; then
    echo "7 is not even"
fi
```

Để trả về dữ liệu, hãy sử dụng đầu ra:

```bash
get_square() {
    echo $(($1 * $1))
}

result=$(get_square 5)
echo "Square of 5 is $result"
```

### Phạm vi biến

Các biến trong Bash theo mặc định là toàn cục:

```bash
#!/bin/bash

my_var="global"

my_function() {
    my_var="changed"  # Changes the global variable
    local local_var="local"  # Local to the function
}

echo "Before: $my_var"
my_function
echo "After: $my_var"
echo "Local: $local_var"  # This will be empty
```

Sử dụng `local` để tạo các biến cục bộ hàm.

## Mảng

### Tạo và truy cập mảng

Làm việc với danh sách dữ liệu:

```bash
# Create an array
fruits=("apple" "banana" "cherry")

# Access elements
echo ${fruits[0]}  # First element
echo ${fruits[1]}  # Second element

# All elements
echo ${fruits[@]}

# Number of elements
echo ${#fruits[@]}

# Add an element
fruits+=("orange")

# Iterate through array
for fruit in "${fruits[@]}"; do
    echo "Fruit: $fruit"
done
```

### Mảng kết hợp (Từ điển)

Cặp khóa-giá trị (Bash 4.0+):

```bash
# Declare an associative array
declare -A user

# Assign values
user[name]="Alice"
user[age]=30
user[city]="New York"

# Access elements
echo "Name: ${user[name]}"
echo "Age: ${user[age]}"

# All keys
echo "Keys: ${!user[@]}"

# All values
echo "Values: ${user[@]}"

# Iterate through key-value pairs
for key in "${!user[@]}"; do
    echo "$key: ${user[$key]}"
done
```

## Thao tác chuỗi

### Hoạt động chuỗi

Làm việc với dữ liệu văn bản:

```bash
# String length
string="Hello, World!"
echo ${#string}  # 13

# Substring extraction
echo ${string:7:5}  # "World"

# Replace substring
echo ${string/World/Linux}  # "Hello, Linux!"

# Replace all occurrences
text="apple apple apple"
echo ${text//apple/orange}  # "orange orange orange"

# Remove prefix
echo ${string#Hello, }  # "World!"

# Remove suffix
echo ${string%World!}  # "Hello, "
```

### So sánh chuỗi

```bash
if [ "$string1" = "$string2" ]; then
    echo "Strings are equal"
fi

if [[ "$string" == *"World"* ]]; then
    echo "String contains 'World'"
fi

if [[ "$string" =~ ^Hello ]]; then
    echo "String starts with 'Hello'"
fi
```

## Xử lý lỗi

### Mã thoát

Tập lệnh trả về mã thoát cho biết thành công (0) hoặc thất bại (khác 0):

```bash
#!/bin/bash

# Exit with specific code
if [ ! -f "$1" ]; then
    echo "Error: File not found" >&2
    exit 1
fi

# Process the file
echo "Processing $1..."
exit 0
```

### Kiểm tra lỗi

Kiểm tra lệnh thành công:

```bash
if ! command; then
    echo "Command failed" >&2
    exit 1
fi
```

Sử dụng `set -e` để thoát khi có bất kỳ lỗi nào:

```bash
#!/bin/bash
set -e  # Exit immediately if a command fails
```

### Tín hiệu bẫy

Xử lý gián đoạn tập lệnh:

```bash
#!/bin/bash

# Cleanup function
cleanup() {
    echo "Cleaning up temporary files..."
    rm -f /tmp/tempfile*
    exit 1
}

# Set trap
trap cleanup SIGINT SIGTERM

# Create temp files
touch /tmp/tempfile1 /tmp/tempfile2

# Long-running process
echo "Running... (Press Ctrl+C to interrupt)"
sleep 30

# Normal cleanup
cleanup
```

## Phân tích dòng lệnh

### Xử lý đối số cơ bản

Phân tích đối số theo cách thủ công:

```bash
#!/bin/bash

if [ $# -lt 2 ]; then
    echo "Usage: $0 <source> <destination>"
    exit 1
fi

source=$1
destination=$2

echo "Copying from $source to $destination"
```

### Tùy chọn phân tích cú pháp với getopts

Xử lý các tùy chọn dòng lệnh:

```bash
#!/bin/bash

usage() {
    echo "Usage: $0 [-v] [-f filename] [-n number]"
    exit 1
}

verbose=false
filename=""
number=0

while getopts ":vf:n:" opt; do
    case ${opt} in
        v )
            verbose=true
            ;;
        f )
            filename=$OPTARG
            ;;
        n )
            number=$OPTARG
            ;;
        \? )
            echo "Invalid option: $OPTARG" 1>&2
            usage
            ;;
        : )
            echo "Option -$OPTARG requires an argument." 1>&2
            usage
            ;;
    esac
done
shift $((OPTIND -1))

echo "Verbose: $verbose"
echo "Filename: $filename"
echo "Number: $number"
echo "Remaining arguments: $@"
```

## Ví dụ về kịch bản thực tế

Hãy áp dụng những gì chúng ta đã học được bằng một số tập lệnh hữu ích:

### Tập lệnh sao lưu

```bash
#!/bin/bash

# Configuration
backup_dir="/backup"
source_dir="/home/user/documents"
date_format=$(date +%Y-%m-%d)
backup_file="backup-$date_format.tar.gz"

# Ensure backup directory exists
mkdir -p "$backup_dir"

# Create backup
echo "Creating backup of $source_dir..."
tar -czf "$backup_dir/$backup_file" "$source_dir"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $backup_dir/$backup_file"

    # List existing backups
    echo "Existing backups:"
    ls -lh "$backup_dir"

    # Remove backups older than 30 days
    find "$backup_dir" -name "backup-*.tar.gz" -mtime +30 -delete
else
    echo "Backup failed!" >&2
    exit 1
fi
```

### Tập lệnh giám sát hệ thống

```bash
#!/bin/bash

# Function to display header
print_header() {
    echo "========================================"
    echo "    System Monitoring - $(date)"
    echo "========================================"
}

# Function to check disk usage
check_disk() {
    echo "DISK USAGE:"
    df -h | grep -v "tmpfs" | grep -v "Filesystem"

    # Alert if any partition is over 90% full
    critical=$(df -h | grep -v "tmpfs" | awk '$5 > 90 {print $5 " - " $1}')

    if [ ! -z "$critical" ]; then
        echo "WARNING: The following partitions are nearly full:"
        echo "$critical"
    fi

    echo
}

# Function to check memory usage
check_memory() {
    echo "MEMORY USAGE:"
    free -h
    echo
}

# Function to check load average
check_load() {
    echo "LOAD AVERAGE:"
    uptime

    # Get number of cores
    cores=$(nproc)

    # Get 5-minute load average
    load_5min=$(uptime | awk -F'load average: ' '{print $2}' | awk -F', ' '{print $2}')

    # Check if load exceeds number of cores
    if (( $(echo "$load_5min > $cores" | bc -l) )); then
        echo "WARNING: Load average ($load_5min) exceeds number of cores ($cores)"
    fi

    echo
}

# Function to check running processes
check_processes() {
    echo "TOP 5 CPU-INTENSIVE PROCESSES:"
    ps aux --sort=-%cpu | head -6
    echo

    echo "TOP 5 MEMORY-INTENSIVE PROCESSES:"
    ps aux --sort=-%mem | head -6
    echo
}

# Main function
main() {
    print_header
    check_disk
    check_memory
    check_load
    check_processes

    echo "Report completed at $(date)"
}

# Run the script
main
```

### Tập lệnh xử lý tệp

```bash
#!/bin/bash

# Check arguments
if [ $# -ne 2 ]; then
    echo "Usage: $0 <source_directory> <backup_directory>"
    exit 1
fi

source_dir="$1"
backup_dir="$2"

# Validate directories
if [ ! -d "$source_dir" ]; then
    echo "Error: Source directory does not exist: $source_dir" >&2
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$backup_dir"

# Counter for processed files
processed=0

# Process each text file
for file in "$source_dir"/*.txt; do
    # Skip if no files match
    [ -e "$file" ] || continue

    filename=$(basename "$file")
    echo "Processing: $filename"

    # Create a backup
    cp "$file" "$backup_dir/${filename}.bak"

    # Convert to uppercase and save
    tr '[:lower:]' '[:upper:]' < "$file" > "$backup_dir/${filename}.upper"

    # Count words
    word_count=$(wc -w < "$file")
    echo "  Word count: $word_count" >> "$backup_dir/summary.log"

    ((processed++))
done

echo "Processed $processed files. Summary saved to $backup_dir/summary.log"
```

### Tập lệnh giám sát trang web

```bash
#!/bin/bash

# Configuration
websites=("https://www.example.com" "https://www.google.com" "https://www.github.com")
log_file="/var/log/website_monitor.log"
email="admin@example.com"

# Function to check a website
check_website() {
    local url="$1"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")

    # Get HTTP status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    # Check if status code is 200 (OK)
    if [ "$status_code" -eq 200 ]; then
        echo "[$timestamp] SUCCESS: $url returned status code $status_code" | tee -a "$log_file"
        return 0
    else
        echo "[$timestamp] ERROR: $url returned status code $status_code" | tee -a "$log_file"
        return 1
    fi
}

# Function to send email alert
send_alert() {
    local url="$1"
    local status="$2"

    echo "Website $url is down (Status: $status)" | mail -s "Website Down Alert" "$email"
    echo "Alert sent to $email" | tee -a "$log_file"
}

# Main function
main() {
    echo "Starting website monitoring at $(date)" | tee -a "$log_file"

    for site in "${websites[@]}"; do
        echo "Checking $site..." | tee -a "$log_file"
        if ! check_website "$site"; then
            send_alert "$site" "$status_code"
        fi

        # Sleep between checks to avoid hammering the servers
        sleep 2
    done

    echo "Monitoring completed at $(date)" | tee -a "$log_file"
    echo "-----------------------------------------" | tee -a "$log_file"
}

# Create log file if it doesn't exist
touch "$log_file"

# Run the script
main
```

## Ngoài Bash: shell thay thế

Mặc dù Bash là shell phổ biến nhất nhưng vẫn có các tùy chọn khác:

### Zsh (Z shell)

shell mạnh mẽ với các tính năng được cải tiến:

- Hoàn thành tab tốt hơn
- Sửa lỗi chính tả
- Mở rộng đường dẫn
- Lời nhắc có thể sử dụng theo chủ đề với Oh-My-Zsh

Chuyển đổi tập lệnh Bash thành Zsh:

```bash
#!/bin/zsh

# Most Bash scripts work in Zsh
# Zsh-specific features include:
setopt extended_glob
setopt null_glob

# Array indices start at 1 in Zsh
array=(one two three)
echo ${array[1]}  # Prints "one" in Zsh (would be empty in Bash)
```

### Cá (Tương tác thân thiện shell)

shell thân thiện với người dùng với các tính năng hiện đại:

- Làm nổi bật cú pháp
- Tự động đề xuất
- Cấu hình dựa trên web

Ví dụ về kịch bản cá:

```bash
#!/usr/bin/fish

# Define a function
function greet
    echo "Hello, $argv[1]!"
end

# Call the function
greet "World"

# Fish-specific loop syntax
for i in (seq 1 5)
    echo "Number: $i"
end
```

## Các phương pháp hay nhất về tập lệnh shell

### Tổ chức kịch bản

- Bắt đầu với một shebang (`#!/bin/bash`)
- Thêm khối nhận xét mang tính mô tả ở trên cùng
- Xác định các hằng số và cấu hình ngay từ đầu
- Tạo hàm cho mã có thể sử dụng lại
- Bao gồm `main` hàm để sắp xếp luồng tập lệnh

### Xử lý lỗi

- Kiểm tra mã trả về cho các lệnh
- Sử dụng `set -e` để thoát khi có lỗi
- Cung cấp thông báo lỗi hữu ích kèm theo ngữ cảnh
- Dọn dẹp các tập tin tạm thời bằng bẫy

### Cân nhắc về bảo mật

- Xác thực và vệ sinh đầu vào
- Sử dụng đường dẫn đầy đủ cho các lệnh khi có thể
- Tránh sử dụng `eval` với đầu vào của người dùng
- Đặt quyền hạn chế trên tập lệnh
- Sử dụng các biến chỉ đọc khi thích hợp: `readonly PASSWORD="secret"`

### Hiệu suất

- Giảm thiểu các lệnh bên ngoài trong vòng lặp
- Sử dụng các lệnh tích hợp khi có sẵn
- Sử dụng thay thế quy trình thay vì đường ống khi thích hợp
- Cân nhắc sử dụng mảng thay vì phân tích chuỗi

### Mẫu kịch bản

Đây là mẫu cho một tập lệnh có cấu trúc tốt:

```bash
#!/bin/bash
#
# Script: example.sh
# Description: A template for shell scripts
# Author: Your Name
# Date: 2025-05-17
#
# Usage: ./example.sh [options] <argument>

# Exit on error
set -e

# Script constants
readonly PROGNAME=$(basename "$0")
readonly ARGS=("$@")

# Configuration
config_file="/etc/example.conf"
temp_dir="/tmp/example_$$"

# Function to display usage
usage() {
    cat << EOF
Usage: $PROGNAME [OPTIONS] <argument>

Options:
  -h, --help      Display this help message
  -v, --verbose   Enable verbose output
  -f FILE         Specify input file

Example:
  $PROGNAME -v -f input.txt

EOF
}

# Function to log messages
log() {
    local level="$1"
    shift
    echo "[$level] $*"
}

# Function to clean up temporary files
cleanup() {
    log "INFO" "Cleaning up..."
    rm -rf "$temp_dir"
}

# Set up trap to clean up on exit
trap cleanup EXIT

# Function to process arguments
process_args() {
    # Create temp directory
    mkdir -p "$temp_dir"

    # Process the main argument
    log "INFO" "Processing argument: $1"
    # Main logic here...
}

# Main function
main() {
    # Parse options
    local verbose=false
    local file=""

    while (( $# > 0 )); do
        case "$1" in
            -h|--help)
                usage
                exit 0
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            -f)
                file="$2"
                shift 2
                ;;
            -*)
                log "ERROR" "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                break
                ;;
        esac
    done

    if [[ $verbose == true ]]; then
        log "INFO" "Verbose mode enabled"
    fi

    if [[ -n "$file" ]]; then
        log "INFO" "Using file: $file"
    fi

    # Check for required arguments
    if (( $# < 1 )); then
        log "ERROR" "Missing required argument"
        usage
        exit 1
    fi

    # Process arguments
    process_args "$1"

    log "INFO" "Script completed successfully"
}

# Run the script
main "${ARGS[@]}"
```

## Tập lệnh shell trên đám mây

Các tập lệnh shell cực kỳ có giá trị cho việc tự động hóa đám mây. Dưới đây là ví dụ về cách bạn có thể sử dụng tập lệnh shell trên DigitalOcean Droplet:

1. Đăng ký tài khoản DigitalOcean (sử dụng [liên kết này](https://m.do.co/c/2a9bba940f39) để nhận tín dụng $200 trong 60 ngày)
2. Tạo một giọt mới
3. Tạo tập lệnh tự động hóa này:

```bash
#!/bin/bash
#
# server_setup.sh - Automate web server setup on a new DigitalOcean Droplet
#

set -e

# Configuration
APP_USER="webapp"
DOMAIN="example.com"
REPO_URL="https://github.com/yourusername/your-app.git"

# Log function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Update system and install dependencies
setup_system() {
    log "Updating system packages..."
    apt-get update
    apt-get upgrade -y

    log "Installing dependencies..."
    apt-get install -y nginx nodejs npm certbot python3-certbot-nginx git

    # Enable firewall
    log "Configuring firewall..."
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    ufw --force enable
}

# Create application user
create_user() {
    log "Creating application user..."
    useradd -m -s /bin/bash "$APP_USER"

    log "Setting up deployment directory..."
    mkdir -p /var/www/$DOMAIN
    chown -R "$APP_USER":"$APP_USER" /var/www/$DOMAIN
}

# Configure Nginx
setup_nginx() {
    log "Configuring Nginx..."
    cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root /var/www/$DOMAIN/public;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    nginx -t
    systemctl restart nginx
}

# Deploy application
deploy_app() {
    log "Deploying application..."
    su - "$APP_USER" -c "git clone $REPO_URL /var/www/$DOMAIN"

    log "Installing dependencies and building application..."
    cd /var/www/$DOMAIN
    su - "$APP_USER" -c "cd /var/www/$DOMAIN && npm install && npm run build"

    log "Setting up application service..."
    cat > /etc/systemd/system/webapp.service << EOF
[Unit]
Description=Web Application
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=/var/www/$DOMAIN
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

    systemctl enable webapp
    systemctl start webapp
}

# Setup SSL
setup_ssl() {
    log "Setting up SSL with Let's Encrypt..."
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
}

# Main function
main() {
    log "Starting server setup..."

    setup_system
    create_user
    setup_nginx
    deploy_app
    setup_ssl

    log "Setup completed successfully!"
    log "Your application is now running at https://$DOMAIN"
}

# Check if root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root" >&2
    exit 1
fi

# Run script
main
```

Tập lệnh này tự động hóa toàn bộ quá trình thiết lập máy chủ web với chứng chỉ Nginx, Node.js và SSL.

## Tiến về phía trước

Giờ đây, bạn đã có nền tảng vững chắc về tập lệnh shell, cho phép bạn tự động hóa các tác vụ và tạo các công cụ mạnh mẽ bằng dòng lệnh Linux.

Trong phần tiếp theo, chúng ta sẽ khám phá những điều cơ bản về quản trị hệ thống Linux, bao gồm quản lý người dùng, giám sát hệ thống, sao lưu và bảo mật.

Viết kịch bản shell là một kỹ năng phát triển thông qua thực hành. Bắt đầu với các tập lệnh đơn giản và dần dần xây dựng các tập lệnh phức tạp hơn. Bạn càng tự động hóa nhiều công việc thường ngày thì bạn càng có nhiều thời gian cho công việc mang tính sáng tạo và chiến lược.
