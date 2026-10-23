---
title: "Đối số dòng lệnh"
description: Tìm hiểu cách chấp nhận và xử lý các đối số dòng lệnh để tạo tập lệnh Bash linh hoạt và thân thiện với người dùng
order: 8
---

Đối số dòng lệnh cho phép người dùng chuyển thông tin tới tập lệnh của bạn khi họ chạy tập lệnh đó. Học cách xử lý những đối số này một cách hiệu quả sẽ giúp tập lệnh của bạn linh hoạt và thân thiện hơn với người dùng. Trong phần này, chúng ta sẽ khám phá cách chấp nhận, xác thực và xử lý các đối số trong tập lệnh Bash.

## Xử lý đối số cơ bản

Trong Bash, các đối số dòng lệnh có thể truy cập được thông qua các biến đặc biệt:

- `$0`: Tên của chính tập lệnh
- `$1`, `$2`, `$3`, v.v.: Đối số thứ nhất, thứ hai, thứ ba, v.v.
- `$@`: Tất cả các đối số dưới dạng các chuỗi riêng biệt
- `$*`: Tất cả các đối số dưới dạng một chuỗi
- `$#`: Số lượng đối số

Đây là một ví dụ đơn giản:

```bash
#!/bin/bash

echo "Script name: $0"
echo "First argument: $1"
echo "Second argument: $2"
echo "Number of arguments: $#"
echo "All arguments: $@"
```

Nếu bạn lưu cái này dưới dạng `args.sh` và chạy nó với:

```bash
./args.sh hello world
```

Bạn sẽ nhận được đầu ra như:

```
Script name: ./args.sh
First argument: hello
Second argument: world
Number of arguments: 2
All arguments: hello world
```

## Kiểm tra các đối số bắt buộc

Để đảm bảo tập lệnh của bạn nhận được các đối số cần thiết, bạn có thể kiểm tra `$#`:

```bash
#!/bin/bash

if [ $# -lt 2 ]; then
    echo "Error: Not enough arguments"
    echo "Usage: $0 <source> <destination>"
    exit 1
fi

source_file=$1
destination_file=$2

echo "Copying from $source_file to $destination_file"
# cp "$source_file" "$destination_file"
```

Tập lệnh này yêu cầu ít nhất hai đối số và thoát ra kèm theo thông báo lỗi nếu chúng không được cung cấp.

## Lặp lại thông qua các đối số

Bạn có thể xử lý tất cả các đối số bằng một vòng lặp:

```bash
#!/bin/bash

echo "Processing all arguments:"

# Method 1: Using $@
for arg in "$@"; do
    echo "- $arg"
done

# Method 2: Using a counter
echo "Processing with index:"
for ((i=1; i<=$#; i++)); do
    arg=${!i}
    echo "$i: $arg"
done
```

## Chuyển đối số

Lệnh `shift` di chuyển các vị trí đối số xuống dưới, do đó `$2` trở thành `$1`, `$3` trở thành `$2`, v.v.

```bash
#!/bin/bash

echo "Before shift: $1 $2 $3"

shift

echo "After shift: $1 $2 $3"

# Shift multiple positions
shift 2

echo "After shift 2: $1 $2 $3"
```

Điều này rất hữu ích để xử lý từng đối số một:

```bash
#!/bin/bash

echo "Processing arguments:"

while [ $# -gt 0 ]; do
    echo "- $1"
    shift
done
```

## Giá trị mặc định cho đối số

Bạn có thể cung cấp các giá trị mặc định cho các đối số tùy chọn:

```bash
#!/bin/bash

# Default values
output_file=${2:-"output.txt"}

echo "Input file: $1"
echo "Output file: $output_file"
```

Cú pháp `${variable:-default}` có nghĩa là "sử dụng giá trị của `variable` nếu nó được đặt, nếu không thì sử dụng `default`".

## Đối số được đặt tên và cờ

Đối với các tập lệnh phức tạp hơn, bạn có thể muốn hỗ trợ các đối số hoặc cờ được đặt tên:

```bash
#!/bin/bash

verbose=false
output_file="output.txt"

# Parse options
while getopts ":vo:" option; do
    case $option in
        v)
            verbose=true
            ;;
        o)
            output_file=$OPTARG
            ;;
        \?)
            echo "Error: Invalid option -$OPTARG"
            exit 1
            ;;
        :)
            echo "Error: Option -$OPTARG requires an argument"
            exit 1
            ;;
    esac
done

# Skip processed options to access remaining arguments
shift $((OPTIND - 1))

# Now $1 is the first non-option argument
input_file=$1

if [ -z "$input_file" ]; then
    echo "Error: Input file is required"
    echo "Usage: $0 [-v] [-o output_file] input_file"
    exit 1
fi

# Use the arguments
echo "Input file: $input_file"
echo "Output file: $output_file"
echo "Verbose mode: $verbose"

if $verbose; then
    echo "Running in verbose mode"
fi
```

Kịch bản này chấp nhận:

- `-v`: Cờ để bật chế độ dài dòng
- `-o file`: Tùy chọn chỉ định tệp đầu ra
- Đối số tệp đầu vào bắt buộc

Bạn sẽ chạy nó như sau:

```bash
./script.sh -v -o custom.txt input.txt
```

## Sử dụng getopt để phân tích tùy chọn nâng cao

Để phân tích cú pháp tùy chọn phức tạp hơn, đặc biệt với các tùy chọn dài (như `--verbose`), bạn có thể sử dụng lệnh `getopt`:

```bash
#!/bin/bash

# Define default values
verbose=false
output_file="output.txt"
count=1

# Define help function
show_help() {
    echo "Usage: $0 [options] input_file"
    echo "Options:"
    echo "  -v, --verbose       Enable verbose output"
    echo "  -o, --output FILE   Specify output file (default: output.txt)"
    echo "  -c, --count NUMBER  Specify count (default: 1)"
    echo "  -h, --help          Show this help message"
}

# Parse options
TEMP=$(getopt -o "vo:c:h" --long "verbose,output:,count:,help" -n "$0" -- "$@")
if [ $? -ne 0 ]; then
    echo "Error: Invalid options"
    show_help
    exit 1
fi

# Reset positional parameters
eval set -- "$TEMP"

# Process options
while true; do
    case "$1" in
        -v|--verbose)
            verbose=true
            shift
            ;;
        -o|--output)
            output_file="$2"
            shift 2
            ;;
        -c|--count)
            count="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        --)
            shift
            break
            ;;
        *)
            echo "Error: Internal error!"
            exit 1
            ;;
    esac
done

# Check for required input file
if [ $# -lt 1 ]; then
    echo "Error: Input file is required"
    show_help
    exit 1
fi

input_file="$1"

# Use the arguments
echo "Input file: $input_file"
echo "Output file: $output_file"
echo "Count: $count"
echo "Verbose mode: $verbose"

if $verbose; then
    echo "Running in verbose mode"
fi
```

Tập lệnh này xử lý cả tùy chọn ngắn (`-v`, `-o`) và tùy chọn dài (`--verbose`, `--output`). Bạn có thể chạy nó với:

```bash
./script.sh --verbose --output=custom.txt --count=5 input.txt
# or
./script.sh -v -o custom.txt -c 5 input.txt
```

## Xác thực đối số

Luôn xác thực thông tin đầu vào của người dùng để ngăn ngừa lỗi hoặc sự cố bảo mật:

```bash
#!/bin/bash

# Check if the number of arguments is correct
if [ $# -ne 2 ]; then
    echo "Error: Expected exactly 2 arguments"
    echo "Usage: $0 <age> <name>"
    exit 1
fi

age=$1
name=$2

# Validate age (must be a number)
if ! [[ "$age" =~ ^[0-9]+$ ]]; then
    echo "Error: Age must be a number"
    exit 1
fi

# Validate name (must be alphabetic)
if ! [[ "$name" =~ ^[a-zA-Z]+$ ]]; then
    echo "Error: Name must contain only letters"
    exit 1
fi

echo "Hello, $name! You are $age years old."
```

## Ví dụ thực tế

Hãy xem xét một số ví dụ thực tế về xử lý đối số dòng lệnh:

### Ví dụ 1: Tập lệnh xử lý tệp

```bash
#!/bin/bash

show_usage() {
    echo "Usage: $0 [options] input_file [input_file2 ...]"
    echo "Options:"
    echo "  -o, --output FILE   Output file (default: output.txt)"
    echo "  -f, --format FMT    Output format: text, csv, json (default: text)"
    echo "  -v, --verbose       Enable verbose mode"
    echo "  -h, --help          Show this help message"
}

# Default values
output_file="output.txt"
format="text"
verbose=false

# Parse options
while [ $# -gt 0 ]; do
    case "$1" in
        -o|--output)
            if [ -z "$2" ] || [ "${2:0:1}" = "-" ]; then
                echo "Error: Option $1 requires an argument"
                exit 1
            fi
            output_file="$2"
            shift 2
            ;;
        --output=*)
            output_file="${1#*=}"
            shift
            ;;
        -f|--format)
            if [ -z "$2" ] || [ "${2:0:1}" = "-" ]; then
                echo "Error: Option $1 requires an argument"
                exit 1
            fi
            format="$2"
            shift 2
            ;;
        --format=*)
            format="${1#*=}"
            shift
            ;;
        -v|--verbose)
            verbose=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        --)
            shift
            break
            ;;
        -*)
            echo "Error: Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            break
            ;;
    esac
done

# Check for input files
if [ $# -lt 1 ]; then
    echo "Error: No input files specified"
    show_usage
    exit 1
fi

# Validate format
case "$format" in
    text|csv|json)
        # Valid format
        ;;
    *)
        echo "Error: Invalid format: $format"
        echo "Valid formats: text, csv, json"
        exit 1
        ;;
esac

# Process files
echo "Processing files: $@"
echo "Output file: $output_file"
echo "Format: $format"
if $verbose; then
    echo "Verbose mode enabled"
fi

# Create or truncate the output file
> "$output_file"

# Process each input file
for file in "$@"; do
    if [ ! -f "$file" ]; then
        echo "Warning: File not found: $file"
        continue
    fi

    if $verbose; then
        echo "Processing file: $file"
    fi

    # Example processing
    case "$format" in
        text)
            echo "--- Content of $file ---" >> "$output_file"
            cat "$file" >> "$output_file"
            echo "" >> "$output_file"
            ;;
        csv)
            # Example: Convert spaces to commas
            cat "$file" | tr ' ' ',' >> "$output_file"
            ;;
        json)
            # Example: Wrap in JSON format
            echo "{ \"filename\": \"$file\", \"content\": \"" >> "$output_file"
            # Escape quotes and backslashes
            cat "$file" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' >> "$output_file"
            echo "\" }" >> "$output_file"
            ;;
    esac
done

echo "Done! Output saved to $output_file"
```

Tập lệnh này xử lý nhiều tệp đầu vào và xuất chúng ở các định dạng khác nhau.

### Ví dụ 2: Tập lệnh sao lưu

```bash
#!/bin/bash

show_usage() {
    echo "Creates a backup of specified directories"
    echo "Usage: $0 [options] [directory1 directory2 ...]"
    echo "Options:"
    echo "  -d, --destination DIR  Backup destination directory (default: ./backup)"
    echo "  -n, --name NAME        Backup name (default: backup-YYYYMMDD)"
    echo "  -z, --compress         Compress the backup with gzip"
    echo "  -e, --exclude PATTERN  Exclude files/dirs matching PATTERN (can be used multiple times)"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "If no directories are specified, the current directory will be backed up."
}

# Default values
backup_dest="./backup"
backup_name="backup-$(date +%Y%m%d)"
compress=false
exclude_patterns=()

# Parse options
while [ $# -gt 0 ]; do
    case "$1" in
        -d|--destination)
            backup_dest="$2"
            shift 2
            ;;
        -n|--name)
            backup_name="$2"
            shift 2
            ;;
        -z|--compress)
            compress=true
            shift
            ;;
        -e|--exclude)
            exclude_patterns+=("$2")
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        -*)
            echo "Error: Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            break
            ;;
    esac
done

# If no directories specified, use current directory
if [ $# -eq 0 ]; then
    directories=(".")
else
    directories=("$@")
fi

# Create destination directory if it doesn't exist
mkdir -p "$backup_dest"

# Build tar command
tar_cmd="tar -cf $backup_dest/$backup_name.tar"

# Add exclude patterns
for pattern in "${exclude_patterns[@]}"; do
    tar_cmd="$tar_cmd --exclude='$pattern'"
done

# Add source directories
for dir in "${directories[@]}"; do
    tar_cmd="$tar_cmd '$dir'"
done

# Execute tar command
echo "Creating backup..."
eval $tar_cmd

# Compress if requested
if $compress; then
    echo "Compressing backup..."
    gzip "$backup_dest/$backup_name.tar"
    echo "Backup created: $backup_dest/$backup_name.tar.gz"
else
    echo "Backup created: $backup_dest/$backup_name.tar"
fi
```

Tập lệnh này tạo bản sao lưu của các thư mục được chỉ định với nhiều tùy chọn khác nhau.

## Các phương pháp thực hành tốt nhất cho đối số dòng lệnh

Khi thiết kế giao diện dòng lệnh của tập lệnh:

1. **Cung cấp thông tin sử dụng hữu ích**: Bao gồm tùy chọn `--help` và hướng dẫn sử dụng rõ ràng.

2. **Tuân theo các quy ước**: Sử dụng các định dạng tùy chọn tiêu chuẩn (`-s` cho các tùy chọn ngắn, `--long` cho các tùy chọn dài).

3. **Be nhất quán**: Nếu `-o` yêu cầu một đối số, hãy làm cho tất cả các tùy chọn tương tự nhất quán.

4. **Cung cấp các giá trị mặc định hợp lý**: Tạo các đối số tùy chọn thực sự tùy chọn với các giá trị mặc định hợp lý.

5. **Validate input**: Kiểm tra xem các đối số có giá trị phù hợp hay không trước khi sử dụng chúng.

6. **Xử lý lỗi một cách duyên dáng**: Đưa ra thông báo lỗi rõ ràng khi đối số bị thiếu hoặc không hợp lệ.

7. **Hỗ trợ các thành ngữ phổ biến**: Nếu tập lệnh của bạn yêu cầu đường dẫn tệp, hãy hỗ trợ `-` có nghĩa là stdin/stdout.

8. **DTài liệu giao diện của bạn**: Trong cả thông báo sử dụng và nhận xét, hãy giải thích chức năng của từng tùy chọn.

9. **Các trường hợp cạnh thử nghiệm**: Đảm bảo tập lệnh của bạn xử lý chính xác các đầu vào bất thường.

Bằng cách học cách xử lý đối số dòng lệnh, bạn có thể tạo các tập lệnh vừa mạnh mẽ vừa thân thiện với người dùng. Trong phần tiếp theo, chúng ta sẽ khám phá các công cụ và tiện ích Bash phổ biến giúp nâng cao hơn nữa khả năng viết kịch bản của bạn.
