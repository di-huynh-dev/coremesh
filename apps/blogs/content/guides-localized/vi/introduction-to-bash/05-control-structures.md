---
title: "Cấu trúc điều khiển"
description: Tìm hiểu cách ra quyết định và lặp trong Bash với các điều kiện và vòng lặp để tạo tập lệnh động
order: 5
---

Cấu trúc điều khiển là thành phần thiết yếu của bất kỳ ngôn ngữ lập trình nào, cho phép bạn kiểm soát luồng thực thi trong tập lệnh của mình. Trong phần này, chúng ta sẽ khám phá các câu lệnh và vòng lặp có điều kiện của Bash cho phép bạn đưa ra quyết định và lặp lại hành động.

## Câu lệnh có điều kiện

Câu lệnh có điều kiện cho phép tập lệnh của bạn đưa ra quyết định dựa trên các điều kiện nhất định.

### Câu lệnh if-else

Cú pháp cơ bản của câu lệnh `if` trong Bash:

```bash
if [ condition ]; then
    # Commands to execute if condition is true
fi
```

Thêm mệnh đề `else`:

```bash
if [ condition ]; then
    # Commands for true condition
else
    # Commands for false condition
fi
```

Đối với nhiều điều kiện, hãy sử dụng `elif` (nếu không):

```bash
if [ condition1 ]; then
    # Commands for condition1
elif [ condition2 ]; then
    # Commands for condition2
else
    # Commands for all other cases
fi
```

Đây là một ví dụ thực tế để kiểm tra xem một tệp có tồn tại hay không:

```bash
#!/bin/bash

filename="config.txt"

if [ -f "$filename" ]; then
    echo "$filename exists."
else
    echo "$filename does not exist."
    echo "Creating $filename..."
    touch "$filename"
fi
```

### Điều kiện kiểm tra

Dấu ngoặc vuông `[ ]` trong các ví dụ trên thực chất là cách viết tắt của lệnh `test`. Dưới đây là một số điều kiện thử nghiệm phổ biến:

**Kiểm tra tệp:**

```bash
[ -f file ]  # True if file exists and is a regular file
[ -d dir ]   # True if dir exists and is a directory
[ -e file ]  # True if file exists (any type)
[ -r file ]  # True if file exists and is readable
[ -w file ]  # True if file exists and is writable
[ -x file ]  # True if file exists and is executable
[ -s file ]  # True if file exists and has size greater than zero
```

**Kiểm tra chuỗi:**

```bash
[ -z string ]      # True if string is empty
[ -n string ]      # True if string is not empty
[ string1 = string2 ]  # True if strings are equal
[ string1 != string2 ] # True if strings are not equal
```

**So sánh số nguyên:**

```bash
[ int1 -eq int2 ]  # Equal to
[ int1 -ne int2 ]  # Not equal to
[ int1 -lt int2 ]  # Less than
[ int1 -le int2 ]  # Less than or equal to
[ int1 -gt int2 ]  # Greater than
[ int1 -ge int2 ]  # Greater than or equal to
```

**Toán tử logic:**

```bash
[ condition1 -a condition2 ]  # AND (both must be true)
[ condition1 -o condition2 ]  # OR (at least one must be true)
[ ! condition ]               # NOT (negation)
```

### Cú pháp thử nghiệm hiện đại

Bash cũng cung cấp cấu trúc `[[ ]]`, mạnh hơn `[ ]` truyền thống:

```bash
if [[ condition ]]; then
    # Commands
fi
```

Ưu điểm của `[[ ]]` bao gồm:

- Không cần trích dẫn các biến để xử lý khoảng trắng
- Hỗ trợ các toán tử bổ sung như `&&` và `||` cho logic AND và OR
- Khớp mẫu với toán tử `=~` cho biểu thức chính quy

Ví dụ sử dụng `[[ ]]`:

```bash
#!/bin/bash

filename="my document.txt"

# No need to quote $filename with [[ ]]
if [[ -f $filename && -r $filename ]]; then
    echo "$filename exists and is readable."
fi

# Regular expression matching
email="user@example.com"
if [[ $email =~ [a-z]+@[a-z]+\.[a-z]+ ]]; then
    echo "$email is a valid email format."
fi
```

### Kiểm tra số học với (( ))

Để so sánh bằng số, bạn có thể sử dụng cấu trúc `(( ))`, cho phép cú pháp toán học tự nhiên hơn:

```bash
if (( expression )); then
    # Commands
fi
```

Ví dụ:

```bash
#!/bin/bash

age=25

if (( age >= 18 )); then
    echo "Adult"
else
    echo "Minor"
fi

# You can use variables without $
if (( age * 2 > 40 )); then
    echo "Double your age is greater than 40"
fi
```

### Trường hợp Tuyên bố

Câu lệnh `case` cung cấp một cách rõ ràng hơn để khớp nhiều giá trị:

```bash
case $variable in
    pattern1)
        # Commands for pattern1
        ;;
    pattern2)
        # Commands for pattern2
        ;;
    *)
        # Default case (like else)
        ;;
esac
```

Ví dụ:

```bash
#!/bin/bash

fruit="apple"

case $fruit in
    "apple")
        echo "It's an apple."
        ;;
    "banana" | "plantain")
        echo "It's a banana or plantain."
        ;;
    "orange" | "tangerine")
        echo "It's a citrus fruit."
        ;;
    *)
        echo "Unknown fruit."
        ;;
esac
```

## Vòng lặp

Vòng lặp cho phép bạn lặp lại lệnh nhiều lần.

### Cho vòng lặp

Cú pháp cơ bản cho vòng lặp `for`:

```bash
for variable in list; do
    # Commands using $variable
done
```

Ví dụ:

```bash
# Loop through a list of strings
for fruit in apple banana orange; do
    echo "I like $fruit"
done

# Loop through an array
fruits=("apple" "banana" "orange")
for fruit in "${fruits[@]}"; do
    echo "Processing $fruit"
done

# Loop through a range of numbers
for i in {1..5}; do
    echo "Number: $i"
done

# Loop with step value (Bash 4.0+)
for i in {1..10..2}; do  # Increment by 2
    echo "Odd number: $i"
done

# C-style for loop
for ((i=0; i<5; i++)); do
    echo "Count: $i"
done
```

### Vòng lặp while

Vòng lặp `while` thực thi miễn là điều kiện còn đúng:

```bash
while [ condition ]; do
    # Commands
done
```

Ví dụ:

```bash
# Simple counter
count=1
while [ $count -le 5 ]; do
    echo "Count: $count"
    ((count++))
done

# Reading lines from a file
while read line; do
    echo "Line: $line"
done < input.txt

# Infinite loop (requires explicit break)
while true; do
    echo "Press q to quit"
    read -n 1 input
    if [ "$input" = "q" ]; then
        break
    fi
done
```

### Cho đến khi vòng lặp

Vòng lặp `until` tương tự như `while`, nhưng chạy cho đến khi một điều kiện trở thành đúng:

```bash
until [ condition ]; do
    # Commands
done
```

Ví dụ:

```bash
count=1
until [ $count -gt 5 ]; do
    echo "Count: $count"
    ((count++))
done
```

### Kiểm soát vòng lặp

Bash cung cấp các câu lệnh để kiểm soát việc thực hiện vòng lặp:

```bash
# Skip the current iteration
for i in {1..10}; do
    if (( i % 2 == 0 )); then
        continue  # Skip even numbers
    fi
    echo "Odd number: $i"
done

# Exit the loop entirely
for i in {1..100}; do
    echo "Number: $i"
    if [ $i -eq 5 ]; then
        break  # Stop at 5
    fi
done
```

## Kết hợp các cấu trúc điều khiển

Bạn có thể lồng các cấu trúc điều khiển để tạo logic phức tạp hơn:

```bash
#!/bin/bash

# Check all files in current directory
for file in *; do
    if [ -f "$file" ]; then
        echo "$file is a regular file"

        if [ -x "$file" ]; then
            echo "  and it's executable"
        elif [ -r "$file" ]; then
            echo "  and it's readable"
        fi

        # Get file extension
        filename=$(basename "$file")
        extension="${filename##*.}"

        case $extension in
            "txt")
                echo "  Text file detected"
                ;;
            "sh")
                echo "  Shell script detected"
                ;;
            *)
                echo "  Unknown file type"
                ;;
        esac
    elif [ -d "$file" ]; then
        echo "$file is a directory"
    fi
done
```

## Xử lý lỗi

Sử dụng các câu lệnh có điều kiện để xử lý lỗi:

```bash
#!/bin/bash

# Attempt to create a directory
mkdir -p /tmp/test_dir

# Check the exit status
if [ $? -eq 0 ]; then
    echo "Directory created successfully"
else
    echo "Failed to create directory"
    exit 1  # Exit with error status
fi
```

Bạn cũng có thể sử dụng toán tử `||` để xử lý lỗi:

```bash
# If mkdir fails, execute the second command
mkdir /tmp/test_dir || echo "Failed to create directory"

# More complex handling
mkdir /tmp/test_dir || { echo "Failed to create directory"; exit 1; }
```

Tương tự, sử dụng `&&` để chỉ thực thi lệnh nếu lệnh trước đó thành công:

```bash
# Change to the directory only if it was created successfully
mkdir /tmp/test_dir && cd /tmp/test_dir
```

## Ví dụ thực tế

Hãy kết hợp mọi thứ lại với nhau bằng một số ví dụ thực tế:

### Xử lý tập tin trong một thư mục

```bash
#!/bin/bash

# Process all text files in the current directory
for file in *.txt; do
    # Skip if no txt files exist
    if [ "$file" = "*.txt" ]; then
        echo "No text files found."
        break
    fi

    echo "Processing $file..."

    # Skip empty files
    if [ ! -s "$file" ]; then
        echo "  Skipping empty file"
        continue
    fi

    # Count lines, words, and characters
    lines=$(wc -l < "$file")
    words=$(wc -w < "$file")
    chars=$(wc -c < "$file")

    echo "  Lines: $lines"
    echo "  Words: $words"
    echo "  Characters: $chars"
done
```

### Menu tương tác

```bash
#!/bin/bash

while true; do
    clear
    echo "--------------------------"
    echo "       System Menu       "
    echo "--------------------------"
    echo "1. Show date and time"
    echo "2. Show system uptime"
    echo "3. Show logged-in users"
    echo "4. Check disk space"
    echo "5. Exit"
    echo
    read -p "Enter your choice [1-5]: " choice

    case $choice in
        1)
            echo
            date
            ;;
        2)
            echo
            uptime
            ;;
        3)
            echo
            who
            ;;
        4)
            echo
            df -h
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid option. Please try again."
            ;;
    esac

    echo
    read -p "Press Enter to continue..."
done
```

Với các cấu trúc điều khiển này, bạn có thể tạo các tập lệnh linh hoạt, phản hồi nhanh để đưa ra quyết định và xử lý các tình huống khác nhau một cách hiệu quả. Trong phần tiếp theo, chúng ta sẽ khám phá hàm, cho phép bạn sắp xếp mã của mình thành các khối có thể sử dụng lại.
