---
title: "Hàm trong Bash"
description: Tìm hiểu cách tạo và sử dụng hàm để sắp xếp các tập lệnh Bash của bạn thành các thành phần mô-đun, có thể tái sử dụng
order: 6
---

hàm rất cần thiết để viết các tập lệnh Bash có tổ chức và có thể bảo trì. Chúng cho phép bạn nhóm các lệnh thành các khối có thể tái sử dụng, làm cho tập lệnh của bạn sạch hơn và mang tính mô-đun hơn. Trong phần này, chúng ta sẽ khám phá cách xác định, sử dụng và quản lý hàm trong Bash.

## Thông tin cơ bản về hàm

Bash hàm là một khối mã có thể tái sử dụng được thiết kế để thực hiện một tác vụ cụ thể. Đây là cú pháp cơ bản:

```bash
function_name() {
    # Commands
}
```

Ngoài ra, bạn có thể sử dụng từ khóa `function`:

```bash
function function_name {
    # Commands
}
```

Cả hai kiểu đều có chức năng tương đương, nhưng dạng đầu tiên dễ mang theo hơn trên các shell khác nhau.

Đây là một ví dụ đơn giản về hàm có lời chào:

```bash
say_hello() {
    echo "Hello, world!"
}

# Call the function
say_hello
```

## Hàm với các thông số

hàm có thể chấp nhận các tham số được truy cập bằng các tham số vị trí tương tự như cách các tập lệnh truy cập các đối số dòng lệnh:

```bash
greet() {
    echo "Hello, $1!"
}

# Call with an argument
greet "John"  # Output: Hello, John!
```

Bạn có thể truy cập nhiều tham số:

```bash
print_info() {
    echo "Name: $1"
    echo "Age: $2"
    echo "Occupation: $3"
}

# Call with multiple arguments
print_info "Jane" "30" "Engineer"
```

Bên trong hàm, bạn có thể sử dụng các tham số đặc biệt:

- `$1, $2, $3, ...` cho các thông số riêng lẻ
- `$@` cho tất cả các tham số dưới dạng các chuỗi riêng biệt
- `$*` cho tất cả các tham số dưới dạng một chuỗi
- `$#` cho số lượng tham số

Ví dụ sử dụng các tham số đặc biệt sau:

```bash
function process_args() {
    echo "Number of arguments: $#"
    echo "All arguments: $@"

    echo "Processing each argument:"
    for arg in "$@"; do
        echo "- $arg"
    done
}

# Call the function with multiple arguments
process_args apple banana cherry
```

## Giá trị trả về

Không giống như hàm trong nhiều ngôn ngữ lập trình, Bash hàm không trả về các giá trị bằng câu lệnh `return` theo nghĩa truyền thống. Thay vào đó, họ có thể:

1. Trả về trạng thái thoát (một số từ 0 đến 255)
2. Giá trị đầu ra có thể được ghi lại
3. Đặt biến toàn cục

### Sử dụng trạng thái thoát:

```bash
is_even() {
    if (( $1 % 2 == 0 )); then
        return 0  # Success (true in Bash)
    else
        return 1  # Failure (false in Bash)
    fi
}

# Call and check the result
if is_even 42; then
    echo "42 is even"
else
    echo "42 is odd"
fi
```

### Sử dụng đầu ra lệnh:

```bash
get_square() {
    echo $(( $1 * $1 ))
}

# Capture the output
result=$(get_square 5)
echo "The square of 5 is $result"
```

### Sử dụng các biến toàn cục:

```bash
calculate_area() {
    # Set a global variable
    area=$(( $1 * $2 ))
}

# Call the function
calculate_area 4 5
echo "The area is $area"
```

## Biến cục bộ

Theo mặc định, các biến được xác định trong hàm là biến toàn cục và có thể được truy cập từ bất kỳ đâu trong tập lệnh. Để tạo một biến cục bộ cho hàm, hãy sử dụng từ khóa `local`:

```bash
global_function() {
    variable="This is a global variable"
}

local_function() {
    local variable="This is a local variable"
    echo "Inside function: $variable"
}

# Call the functions
local_function
echo "After local_function: $variable"  # Variable is not set

global_function
echo "After global_function: $variable"  # Shows "This is a global variable"
```

Sử dụng các biến cục bộ là một cách thực hành tốt để tránh các tác dụng phụ ngoài ý muốn và xung đột tên.

## Thư viện hàm

Đối với các dự án lớn hơn, bạn có thể muốn sắp xếp hàm có liên quan thành các tệp thư viện có thể được lấy nguồn thành nhiều tập lệnh:

```bash
# File: math_functions.sh
add() {
    echo $(( $1 + $2 ))
}

subtract() {
    echo $(( $1 - $2 ))
}

multiply() {
    echo $(( $1 * $2 ))
}

divide() {
    if [ $2 -eq 0 ]; then
        echo "Error: Division by zero"
        return 1
    fi
    echo $(( $1 / $2 ))
}
```

Sau đó, bạn có thể lấy nguồn tệp này trong tập lệnh chính của mình:

```bash
#!/bin/bash

# Load the function library
source math_functions.sh
# or
. math_functions.sh  # Shorthand form

# Use the functions
sum=$(add 5 3)
product=$(multiply 4 7)

echo "Sum: $sum"
echo "Product: $product"
```

## Hàm đệ quy

Bash hỗ trợ hàm đệ quy (hàm tự gọi mình), mặc dù chúng không được sử dụng phổ biến do hạn chế về hiệu suất:

```bash
factorial() {
    if [ $1 -le 1 ]; then
        echo 1
    else
        local prev=$(factorial $(( $1 - 1 )))
        echo $(( $1 * prev ))
    fi
}

result=$(factorial 5)
echo "Factorial of 5 is $result"
```

Hãy cẩn thận với đệ quy trong Bash vì nó có thể nhanh chóng dẫn đến các vấn đề về hiệu suất với đầu vào lớn.

## Phạm vi hàm

hàm có thể truy cập các biến từ phạm vi cha, nhưng theo mặc định, các biến được xác định trong hàm là toàn cục trừ khi được khai báo bằng `local`:

```bash
# Global variable
name="Global"

demonstrate_scope() {
    # Access global variable
    echo "Inside function, name is: $name"

    # Change global variable
    name="Changed inside function"

    # Create local variable
    local age=30
    echo "Inside function, age is: $age"
}

# Call the function
demonstrate_scope
echo "After function, name is: $name"
echo "After function, age is: $age"  # This will be empty
```

## Hàm Quá tải và đối số mặc định

Bash không hỗ trợ nạp chồng hàm theo nghĩa truyền thống (có nhiều hàm có cùng tên nhưng tham số khác nhau). Tuy nhiên, bạn có thể mô phỏng các đối số mặc định:

```bash
greet() {
    local name=${1:-"Guest"}  # Default to "Guest" if $1 is not provided
    echo "Hello, $name!"
}

# Different calls
greet "John"    # Output: Hello, John!
greet           # Output: Hello, Guest!
```

## Biến hàm và hàm ẩn danh

Bash thực sự không có hàm ẩn danh, nhưng bạn có thể gán hàm cho một biến và sau đó thực thi nó:

```bash
# Assign a function to a variable (Bash 4.3+)
greet='() { echo "Hello, $1!"; }'

# Create the function
eval "$greet"

# Call the function
greet "World"
```

Điều này hơi tiên tiến và không được sử dụng phổ biến trong các tập lệnh hàng ngày.

## Ví dụ thực tế về hàm

Hãy xem một số ví dụ thực tế về hàm mà bạn có thể thấy hữu ích:

### Ghi nhật ký hàm

```bash
# Colors for log levels
readonly LOG_RED='\033[0;31m'
readonly LOG_YELLOW='\033[0;33m'
readonly LOG_GREEN='\033[0;32m'
readonly LOG_BLUE='\033[0;34m'
readonly LOG_NONE='\033[0m'

# Log a message with a timestamp and log level
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")

    case "$level" in
        "ERROR")
            echo -e "${LOG_RED}[ERROR]${LOG_NONE} $timestamp - $message"
            ;;
        "WARN")
            echo -e "${LOG_YELLOW}[WARN]${LOG_NONE} $timestamp - $message"
            ;;
        "INFO")
            echo -e "${LOG_GREEN}[INFO]${LOG_NONE} $timestamp - $message"
            ;;
        "DEBUG")
            echo -e "${LOG_BLUE}[DEBUG]${LOG_NONE} $timestamp - $message"
            ;;
        *)
            echo "$timestamp - $message"
            ;;
    esac
}

# Usage
log "INFO" "Script started"
log "DEBUG" "Processing argument: $1"
log "WARN" "Config file not found, using defaults"
log "ERROR" "Failed to connect to server"
```

### Xác nhận hành động hàm

```bash
# Ask for confirmation before proceeding
confirm() {
    local prompt="$1"
    local default="${2:-Y}"

    local prompt_options
    if [ "$default" = "Y" ]; then
        prompt_options="[Y/n]"
        default="Y"
    else
        prompt_options="[y/N]"
        default="N"
    fi

    while true; do
        read -p "$prompt $prompt_options: " choice
        choice=${choice:-$default}

        case "$choice" in
            [Yy]*)
                return 0
                ;;
            [Nn]*)
                return 1
                ;;
            *)
                echo "Please answer yes or no."
                ;;
        esac
    done
}

# Usage
if confirm "Are you sure you want to delete this file?"; then
    echo "Deleting file..."
    # rm file.txt
else
    echo "Operation cancelled"
fi
```

### Thử lại hàm

```bash
# Retry a command multiple times before giving up
retry() {
    local cmd="$1"
    local max_attempts=${2:-3}
    local delay=${3:-5}
    local attempt=1

    until $cmd; do
        if (( attempt == max_attempts )); then
            log "ERROR" "Command failed after $max_attempts attempts: $cmd"
            return 1
        fi

        log "WARN" "Command failed, attempt $attempt/$max_attempts. Retrying in $delay seconds..."
        ((attempt++))
        sleep $delay
    done

    return 0
}

# Usage
retry "ping -c 1 google.com" 5 2
```

> **Cần một máy chủ để thực hành tập lệnh Bash của bạn?** Nếu bạn đang tìm kiếm một môi trường đáng tin cậy, giá cả phải chăng để kiểm tra tập lệnh Bash của mình, hãy cân nhắc sử dụng DigitalOcean Droplet. Bạn có thể nhận được 200 đô la tín dụng miễn phí để bắt đầu bằng cách đăng ký tại [https://m.do.co/c/2a9bba940f39](https://m.do.co/c/2a9bba940f39)

### Sao lưu hàm

```bash
# Create a timestamped backup of a file or directory
backup() {
    local source="$1"
    local timestamp=$(date +"%Y%m%d_%H%M%S")

    if [ ! -e "$source" ]; then
        log "ERROR" "Source does not exist: $source"
        return 1
    fi

    local target="${source}_${timestamp}.bak"

    if [ -d "$source" ]; then
        # Directory backup
        cp -r "$source" "$target"
    else
        # File backup
        cp "$source" "$target"
    fi

    if [ $? -eq 0 ]; then
        log "INFO" "Created backup: $target"
        return 0
    else
        log "ERROR" "Failed to create backup of $source"
        return 1
    fi
}

# Usage
backup "/path/to/important/file.txt"
```

## Các phương pháp hay nhất về hàm

Để viết hàm hiệu quả và có thể bảo trì:

1. **Hãy giữ hàm tập trung**: Mỗi hàm nên làm một việc và làm tốt việc đó.

2. **Sử dụng tên mô tả**: Tên hàm phải chỉ rõ chức năng của chúng.

3. **DTài liệu về các chức năng của bạn**: Thêm nhận xét giải thích mục đích, tham số và giá trị trả về.

4. **Sử dụng các biến cục bộ**: Ngăn chặn các tác dụng phụ ngoài ý muốn bằng cách bản địa hóa các biến của bạn.

5. **Kiểm tra đầu vào**: Xác thực các tham số để sớm phát hiện lỗi.

6. **Trả lại mã thoát thích hợp**: Sử dụng các giá trị trả về để biểu thị thành công hay thất bại.

7. **Xử lý lỗi một cách duyên dáng**: Đừng cho rằng thao tác sẽ thành công.

8. **Tổ chức các chức năng liên quan**: Nhóm hàm liên quan với nhau hoặc trong các tệp thư viện.

9. **Tuân theo một phong cách nhất quán**: Thiết lập và tuân theo các quy ước đặt tên và định dạng.

10. **Kiểm tra các chức năng của bạn**: Xác minh rằng hàm hoạt động như mong đợi với các đầu vào khác nhau.

hàm là một công cụ mạnh mẽ để sắp xếp các tập lệnh Bash của bạn. Bằng cách chia mã của bạn thành hàm được xác định rõ ràng, bạn có thể tạo các tập lệnh dễ đọc, dễ bảo trì và có thể sử dụng lại hơn. Trong phần tiếp theo, chúng ta sẽ khám phá các quyền và thực thi tập lệnh, điều này rất quan trọng để đảm bảo tập lệnh của bạn có thể chạy đúng cách trong các môi trường khác nhau.
