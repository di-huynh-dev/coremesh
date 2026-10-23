---
title: "Biến Bash"
description: Tìm hiểu cách làm việc với các biến để lưu trữ, thao tác và sử dụng dữ liệu trong tập lệnh Bash của bạn
order: 4
---

Các biến rất cần thiết trong bất kỳ ngôn ngữ lập trình nào, kể cả Bash. Chúng cho phép bạn lưu trữ và thao tác dữ liệu, làm cho tập lệnh của bạn linh hoạt và mạnh mẽ hơn. Trong phần này, chúng ta sẽ khám phá cách làm việc với các biến một cách hiệu quả trong Bash.

## Khái niệm cơ bản về biến

Trong Bash, bạn tạo biến bằng cách gán giá trị cho tên:

```bash
# Variable assignment (no spaces around the =)
username="john"
count=42
today=$(date)  # Command substitution
```

Để truy cập giá trị của một biến, hãy thêm tiền tố `$` vào trước biến đó:

```bash
echo $username
echo "The count is $count"
echo "Today is $today"
```

Bạn cũng có thể sử dụng định dạng `${variable}`, định dạng này rất hữu ích khi tên biến nằm liền kề với văn bản khác:

```bash
echo "Hello, ${username}s of the world"  # Without braces, this would look for a variable named "usernames"
```

## Các loại biến và hạn chế

Biến Bash không có kiểu rõ ràng như trong các ngôn ngữ khác. Tuy nhiên, họ có thể lưu trữ:

- Dây: `name="John Doe"`
- Số nguyên: `age=25`
- Mảng: `fruits=("apple" "banana" "cherry")`

Quy tắc đặt tên biến:

- Có thể chứa chữ cái, số và dấu gạch dưới
- Phải bắt đầu bằng một chữ cái hoặc dấu gạch dưới
- Có phân biệt chữ hoa chữ thường (`Name` và `name` là các biến khác nhau)
- Không được chứa dấu cách hoặc ký tự đặc biệt

```bash
# Valid variable names
user_name="john"
_count=5
longVariableName="value"

# Invalid variable names
# 2ndUser="alice"   # Starts with a number
# user-name="bob"   # Contains a hyphen
# my variable="test"  # Contains a space
```

## Làm việc với chuỗi

Chuỗi là chuỗi ký tự và là loại biến phổ biến nhất trong Bash:

```bash
# String concatenation
first_name="John"
last_name="Doe"
full_name="$first_name $last_name"
echo $full_name  # Output: John Doe

# String length
echo ${#full_name}  # Output: 8

# Substring extraction (start at position 0, take 4 characters)
echo ${full_name:0:4}  # Output: John

# String replacement
message="Hello, world!"
echo ${message/world/everyone}  # Output: Hello, everyone!
```

## Làm việc với các con số

Bản thân Bash không hỗ trợ trực tiếp các phép tính số học, nhưng nó cung cấp một số cách để thực hiện các phép tính:

```bash
# Using let
let result=5+7
echo $result  # Output: 12

# Using (( )) for arithmetic expressions
((result = 5 + 7))
echo $result  # Output: 12

# Using $[ ] (older syntax)
result=$[5 + 7]
echo $result  # Output: 12

# Using expr (external command)
result=$(expr 5 + 7)
echo $result  # Output: 12

# Using bc for floating-point calculations
result=$(echo "5.2 + 7.3" | bc)
echo $result  # Output: 12.5
```

Cách tiếp cận phổ biến nhất là sử dụng `(( ))` cho số học số nguyên và `bc` cho các phép toán dấu phẩy động.

## Làm việc với mảng

Bash hỗ trợ các mảng được lập chỉ mục (với các chỉ số bằng số) và, trong các phiên bản mới hơn, các mảng kết hợp (với các chỉ mục chuỗi):

```bash
# Creating an indexed array
fruits=("apple" "banana" "cherry")

# Accessing array elements (zero-indexed)
echo ${fruits[0]}  # Output: apple

# Getting all elements
echo ${fruits[@]}  # Output: apple banana cherry

# Getting array length
echo ${#fruits[@]}  # Output: 3

# Adding elements
fruits+=("orange")
echo ${fruits[@]}  # Output: apple banana cherry orange

# Removing elements
unset fruits[1]
echo ${fruits[@]}  # Output: apple cherry orange
```

Đối với mảng kết hợp (yêu cầu Bash 4.0+):

```bash
# Declare an associative array
declare -A user_info

# Assign values
user_info["name"]="John"
user_info["age"]=30
user_info["city"]="New York"

# Accessing elements
echo ${user_info["name"]}  # Output: John

# Get all keys
echo ${!user_info[@]}  # Output: name age city

# Get all values
echo ${user_info[@]}  # Output: John 30 New York
```

## Phạm vi và xuất khẩu thay đổi

Theo mặc định, các biến trong Bash là cục bộ của phiên shell hiện tại. Để cung cấp chúng cho các tiến trình con (bao gồm cả các tập lệnh bạn gọi), bạn cần xuất chúng:

```bash
# Set a variable
message="Hello from parent"

# Export it
export message

# Now when you run another script, it will have access to the message variable
./another_script.sh
```

Bên trong hàm, theo mặc định, các biến là toàn cục trừ khi được khai báo bằng từ khóa `local`:

```bash
function process_data() {
    # Local variable - only visible within this function
    local temp_value=123

    # Global variable - visible throughout the script
    result="Processed data"
}
```

## Biến đặc biệt

Bash có một số biến tích hợp cung cấp thông tin hữu ích:

```bash
echo $0     # Script name
echo $1     # First argument to the script
echo $2     # Second argument to the script
echo $#     # Number of arguments
echo $@     # All arguments
echo $?     # Exit status of the last command
echo $$     # Process ID of the current shell
echo $USER  # Current username
echo $HOME  # Home directory
echo $PWD   # Current directory
echo $RANDOM # Random number between 0 and 32767
```

## Thao tác và mở rộng biến

Bash cung cấp những cách mạnh mẽ để thao tác các biến:

```bash
filename="document.txt"

# Default values
echo ${undefined_var:-default}  # Use default if undefined_var is not set

# Assign default values
${undefined_var:=default}  # Set undefined_var to default if not set
echo $undefined_var  # Now it's "default"

# Error if not set
# ${required_var:?Error message}  # Exits with error if required_var is not set

# Remove prefix pattern
echo ${filename#doc}  # Output: ument.txt

# Remove suffix pattern
echo ${filename%.txt}  # Output: document

# Replace all occurrences
text="one two one three one"
echo ${text//one/ONE}  # Output: ONE two ONE three ONE
```

## Biến môi trường

Các biến môi trường ảnh hưởng đến hoạt động của shell và các chương trình:

```bash
# Common environment variables
echo $PATH    # Command search path
echo $LANG    # Current language
echo $TERM    # Terminal type
echo $SHELL   # Current shell

# Set an environment variable
export CUSTOM_VAR="my value"
```

Để liệt kê tất cả các biến môi trường:

```bash
env
# or
printenv
```

Để xem tất cả các biến (bao gồm cả những biến không được xuất ra môi trường):

```bash
set
```

## Đọc đầu vào của người dùng

Bạn có thể làm cho tập lệnh của mình có tính tương tác bằng cách đọc thông tin đầu vào từ người dùng:

```bash
# Basic input
echo "What is your name?"
read name
echo "Hello, $name!"

# Read with a prompt
read -p "Enter your age: " age
echo "You are $age years old."

# Read secretly (for passwords)
read -sp "Enter password: " password
echo -e "\nPassword is $password"

# Read with timeout (5 seconds)
read -t 5 -p "Quick, enter something: " input
echo "You entered: $input"

# Read multiple values
read -p "Enter first and last name: " first last
echo "First name: $first, Last name: $last"
```

## Mở rộng biến trong chuỗi

Bash đưa ra nhiều cách khác nhau để đưa các biến vào chuỗi:

```bash
name="John"
age=30

# Double quotes allow variable expansion
echo "Name: $name, Age: $age"  # Output: Name: John, Age: 30

# Single quotes preserve literal text
echo 'Name: $name, Age: $age'  # Output: Name: $name, Age: $age

# Here documents for multi-line strings with variable expansion
cat <<EOT
User Profile:
--------------
Name: $name
Age: $age
EOT
```

Hiểu các biến là rất quan trọng để viết kịch bản Bash hiệu quả. Chúng cho phép bạn tạo các tập lệnh động, có thể tái sử dụng và có thể thích ứng với các đầu vào và điều kiện khác nhau. Trong phần tiếp theo, chúng ta sẽ khám phá các cấu trúc điều khiển cho phép bạn đưa ra quyết định và tạo các vòng lặp trong tập lệnh của mình.
