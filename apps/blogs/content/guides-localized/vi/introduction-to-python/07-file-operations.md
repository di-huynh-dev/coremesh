---
title: "Thao tác với tệp"
description: Tìm hiểu cách đọc và ghi vào tệp bằng Python
order: 7
---

Làm việc với các tập tin là một nhiệm vụ phổ biến trong lập trình. Python cung cấp những cách đơn giản và hiệu quả để đọc và ghi vào tệp. Trong phần này, bạn sẽ tìm hiểu cách làm việc với tệp văn bản và tệp nhị phân cũng như các định dạng như CSV và JSON.

## Thông tin cơ bản về I/O tệp

### Mở và đóng tập tin

Cách cơ bản nhất để làm việc với các tệp trong Python là sử dụng `open()` hàm tích hợp sẵn:

```python
# Open a file for reading
file = open('example.txt', 'r')  # 'r' for read mode

# Do something with the file...
content = file.read()
print(content)

# Close the file when you're done
file.close()
```

Tuy nhiên, cách làm này yêu cầu bạn phải nhớ đóng file, điều này có thể dễ xảy ra lỗi. Thay vào đó, tốt hơn hết bạn nên sử dụng câu lệnh `with`, câu lệnh này sẽ tự động đóng tệp khi bạn hoàn tất:

```python
# Using 'with' (recommended approach)
with open('example.txt', 'r') as file:
    content = file.read()
    print(content)

# The file is automatically closed when the 'with' block ends
```

### Chế độ tập tin

`open()` hàm lấy tham số chế độ chỉ định cách bạn muốn sử dụng tệp:

- `'r'`: Chế độ đọc (mặc định)
- `'w'`: Chế độ ghi (tạo tệp mới hoặc cắt bớt tệp hiện có)
- `'a'`: Chế độ Append (thêm nội dung vào cuối file)
- `'x'`: Chế độ tạo độc quyền (không thành công nếu tệp đã tồn tại)
- `'b'`: Chế độ nhị phân (được sử dụng với các chế độ khác, ví dụ: `'rb'` để đọc nhị phân)
- `'t'`: Chế độ văn bản (mặc định, được sử dụng với các chế độ khác, ví dụ: `'rt'` để đọc văn bản)
- `'+'`: Chế độ cập nhật (cho phép cả đọc và ghi)

```python
# Read a text file
with open('example.txt', 'r') as file:
    content = file.read()

# Write to a text file (creates or overwrites the file)
with open('output.txt', 'w') as file:
    file.write('Hello, world!')

# Append to a text file
with open('log.txt', 'a') as file:
    file.write('New entry: ' + str(datetime.datetime.now()) + '\n')

# Read a binary file
with open('image.jpg', 'rb') as file:
    binary_data = file.read()

# Write to a binary file
with open('copy.jpg', 'wb') as file:
    file.write(binary_data)
```

## Đọc tập tin

Có một số cách để đọc nội dung của một tập tin:

### Đọc toàn bộ tập tin

```python
# Read the entire file as a single string
with open('example.txt', 'r') as file:
    content = file.read()
    print(content)
```

### Đọc từng dòng

```python
# Read the file line by line
with open('example.txt', 'r') as file:
    for line in file:
        print(line, end='')  # The line already includes a newline character
```

### Đọc tất cả các dòng vào danh sách

```python
# Read all lines into a list
with open('example.txt', 'r') as file:
    lines = file.readlines()
    print(lines)  # ['First line\n', 'Second line\n', 'Third line\n']

# Process the list of lines
for line in lines:
    print(line.strip())  # Strip removes whitespace, including newlines
```

### Đọc số tiền cụ thể

```python
# Read a specific number of characters
with open('example.txt', 'r') as file:
    first_10_chars = file.read(10)
    print(first_10_chars)

    # Read the next 10 characters
    next_10_chars = file.read(10)
    print(next_10_chars)
```

### Đọc từng dòng bằng `readline()`

```python
# Read lines one at a time using readline()
with open('example.txt', 'r') as file:
    line1 = file.readline()
    line2 = file.readline()
    print(line1, end='')
    print(line2, end='')
```

## Ghi vào tập tin

### Viết chuỗi

```python
# Write a string to a file
with open('output.txt', 'w') as file:
    file.write('Hello, world!\n')
    file.write('This is a second line.\n')
```

### Viết nhiều dòng

```python
# Write multiple lines at once
lines = ['First line\n', 'Second line\n', 'Third line\n']
with open('output.txt', 'w') as file:
    file.writelines(lines)
```

### Nối vào tập tin

```python
# Append to a file
with open('log.txt', 'a') as file:
    file.write('Log entry at ' + str(datetime.datetime.now()) + '\n')
```

## Làm việc với đường dẫn tệp

Khi làm việc với file, bạn thường xuyên phải thao tác với đường dẫn của file. Mô-đun `os.path` của Python cung cấp hàm cho việc này:

```python
import os

# Join path components
path = os.path.join('folder', 'subfolder', 'file.txt')
print(path)  # 'folder/subfolder/file.txt' on Unix, 'folder\\subfolder\\file.txt' on Windows

# Get the directory name
dirname = os.path.dirname(path)
print(dirname)  # 'folder/subfolder'

# Get the file name
filename = os.path.basename(path)
print(filename)  # 'file.txt'

# Split into directory and file
dir_path, file_name = os.path.split(path)
print(dir_path, file_name)  # 'folder/subfolder', 'file.txt'

# Check if a path exists
exists = os.path.exists('example.txt')
print(exists)  # True or False

# Check if it's a file
is_file = os.path.isfile('example.txt')
print(is_file)  # True or False

# Check if it's a directory
is_dir = os.path.isdir('folder')
print(is_dir)  # True or False

# Get the absolute path
abs_path = os.path.abspath('example.txt')
print(abs_path)
```

Đối với các hoạt động đường dẫn tệp nâng cao hơn, mô-đun `pathlib` mới hơn cung cấp cách tiếp cận hướng đối tượng:

```python
from pathlib import Path

# Create a Path object
path = Path('folder') / 'subfolder' / 'file.txt'
print(path)

# Check if it exists
print(path.exists())

# Get parts of the path
print(path.parent)  # The parent directory
print(path.name)    # The file name
print(path.stem)    # The file name without extension
print(path.suffix)  # The file extension

# Create directories
path.parent.mkdir(parents=True, exist_ok=True)

# List all .txt files in a directory
txt_files = list(Path('folder').glob('*.txt'))
for file in txt_files:
    print(file)
```

## Làm việc với các định dạng tệp phổ biến

### Tệp CSV

CSV (Giá trị được phân tách bằng dấu phẩy) là định dạng phổ biến cho dữ liệu dạng bảng. Mô-đun `csv` của Python giúp bạn dễ dàng làm việc với các tệp CSV:

```python
import csv

# Write data to a CSV file
data = [
    ['Name', 'Age', 'City'],
    ['Alice', 30, 'New York'],
    ['Bob', 25, 'Los Angeles'],
    ['Charlie', 35, 'Chicago']
]

with open('people.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerows(data)

# Read data from a CSV file
with open('people.csv', 'r', newline='') as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)

# Using column names with DictReader and DictWriter
data = [
    {'Name': 'Alice', 'Age': 30, 'City': 'New York'},
    {'Name': 'Bob', 'Age': 25, 'City': 'Los Angeles'},
    {'Name': 'Charlie', 'Age': 35, 'City': 'Chicago'}
]

# Write data using DictWriter
with open('people_dict.csv', 'w', newline='') as file:
    fieldnames = ['Name', 'Age', 'City']
    writer = csv.DictWriter(file, fieldnames=fieldnames)

    writer.writeheader()  # Write the header row
    writer.writerows(data)

# Read data using DictReader
with open('people_dict.csv', 'r', newline='') as file:
    reader = csv.DictReader(file)
    for row in reader:
        print(row['Name'], row['Age'], row['City'])
```

### Tệp JSON

JSON (Ký hiệu đối tượng JavaScript) là một định dạng phổ biến để lưu trữ và trao đổi dữ liệu có cấu trúc. Mô-đun `json` của Python giúp bạn dễ dàng làm việc với JSON:

```python
import json

# Python data (a dictionary)
data = {
    'name': 'Alice',
    'age': 30,
    'city': 'New York',
    'languages': ['Python', 'JavaScript', 'Go'],
    'is_developer': True
}

# Write JSON to a file
with open('person.json', 'w') as file:
    json.dump(data, file, indent=4)  # indent for pretty-printing

# Read JSON from a file
with open('person.json', 'r') as file:
    loaded_data = json.load(file)
    print(loaded_data)
    print(loaded_data['name'])
    print(loaded_data['languages'][0])

# Convert Python object to JSON string
json_string = json.dumps(data, indent=4)
print(json_string)

# Parse JSON string to Python object
parsed_data = json.loads(json_string)
print(parsed_data)
```

## Xử lý lỗi khi làm việc với tệp

Khi làm việc với các tập tin, có thể xảy ra nhiều lỗi khác nhau. Điều quan trọng là phải xử lý những lỗi này để làm cho mã của bạn mạnh mẽ hơn:

```python
try:
    with open('non_existent_file.txt', 'r') as file:
        content = file.read()
        print(content)
except FileNotFoundError:
    print("The file doesn't exist.")
except PermissionError:
    print("You don't have permission to read this file.")
except IsADirectoryError:
    print("This is a directory, not a file.")
except Exception as e:
    print(f"An error occurred: {e}")
```

## Làm việc với các tệp tạm thời

Đối với các tệp tạm thời chỉ cần tồn tại trong thời gian ngắn, mô-đun `tempfile` của Python rất hữu ích:

```python
import tempfile

# Create a temporary file
with tempfile.TemporaryFile('w+') as temp:
    # Write to the temporary file
    temp.write('Hello, temporary world!')

    # Go back to the beginning of the file
    temp.seek(0)

    # Read from the temporary file
    content = temp.read()
    print(content)

# The file is automatically deleted when the 'with' block ends

# Create a named temporary file
with tempfile.NamedTemporaryFile('w+') as named_temp:
    print(f"Temporary file name: {named_temp.name}")
    named_temp.write('This is a named temporary file.')
    named_temp.seek(0)
    print(named_temp.read())

# Create a temporary directory
with tempfile.TemporaryDirectory() as temp_dir:
    print(f"Temporary directory: {temp_dir}")
    # Use the temporary directory...
```

## Nén tập tin

`gzip`, `zipfile` của Python và các mô-đun khác cho phép bạn làm việc với các tệp nén:

### Làm việc với tệp gzip

```python
import gzip

# Write compressed data
with gzip.open('data.txt.gz', 'wt') as f:
    f.write('Hello, compressed world!')

# Read compressed data
with gzip.open('data.txt.gz', 'rt') as f:
    content = f.read()
    print(content)
```

### Làm việc với kho lưu trữ ZIP

```python
import zipfile

# Create a ZIP archive
with zipfile.ZipFile('archive.zip', 'w') as zip_file:
    # Add files to the archive
    zip_file.write('example.txt')
    zip_file.write('data.csv')

# Extract all files from a ZIP archive
with zipfile.ZipFile('archive.zip', 'r') as zip_file:
    zip_file.extractall('extracted_files')

# List the contents of a ZIP archive
with zipfile.ZipFile('archive.zip', 'r') as zip_file:
    print(zip_file.namelist())

# Read a specific file from a ZIP archive
with zipfile.ZipFile('archive.zip', 'r') as zip_file:
    with zip_file.open('example.txt') as file:
        content = file.read()
        print(content)
```

## Ví dụ thực tế: Trình phân tích tệp nhật ký

Hãy tạo một ví dụ thực tế để phân tích tệp nhật ký để trích xuất thông tin hữu ích:

```python
"""
Log File Analyzer

This script analyzes a log file to extract information about errors
and generate a report.
"""

import re
import csv
from datetime import datetime
from collections import Counter
from pathlib import Path

def parse_log_line(line):
    """Parse a log line and extract timestamp, level, and message."""
    # Example log format: [2023-05-21 14:23:45] [ERROR] Failed to connect to database
    pattern = r'\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] \[(\w+)\] (.+)'
    match = re.match(pattern, line)

    if match:
        timestamp_str, level, message = match.groups()
        timestamp = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
        return {
            'timestamp': timestamp,
            'level': level,
            'message': message
        }

    return None

def analyze_log_file(log_file_path):
    """Analyze the log file and return statistics."""
    # Check if the file exists
    log_path = Path(log_file_path)
    if not log_path.exists():
        return None

    # Initialize counters and data structures
    level_counts = Counter()
    errors = []
    first_timestamp = None
    last_timestamp = None

    # Process the log file
    with open(log_path, 'r') as file:
        for line_num, line in enumerate(file, 1):
            line = line.strip()
            if not line:
                continue

            parsed = parse_log_line(line)
            if not parsed:
                print(f"Warning: Could not parse line {line_num}: {line}")
                continue

            # Update first and last timestamps
            if first_timestamp is None or parsed['timestamp'] < first_timestamp:
                first_timestamp = parsed['timestamp']
            if last_timestamp is None or parsed['timestamp'] > last_timestamp:
                last_timestamp = parsed['timestamp']

            # Update level counter
            level_counts[parsed['level']] += 1

            # Store errors for the report
            if parsed['level'] == 'ERROR':
                errors.append({
                    'timestamp': parsed['timestamp'],
                    'message': parsed['message'],
                    'line_number': line_num
                })

    # Return the analysis results
    return {
        'total_lines': line_num,
        'level_counts': level_counts,
        'errors': sorted(errors, key=lambda x: x['timestamp']),
        'start_time': first_timestamp,
        'end_time': last_timestamp,
        'duration': last_timestamp - first_timestamp if first_timestamp and last_timestamp else None
    }

def generate_report(analysis, output_dir):
    """Generate reports based on the log analysis."""
    if not analysis:
        print("No analysis data to report.")
        return

    # Create output directory if it doesn't exist
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Generate text summary
    with open(output_path / 'summary.txt', 'w') as file:
        file.write("Log Analysis Summary\n")
        file.write("===================\n\n")

        file.write(f"Total lines processed: {analysis['total_lines']}\n")
        file.write(f"Time span: {analysis['start_time']} to {analysis['end_time']}\n")
        file.write(f"Duration: {analysis['duration']}\n\n")

        file.write("Log Level Counts:\n")
        for level, count in analysis['level_counts'].items():
            file.write(f"  {level}: {count}\n")

        error_count = len(analysis['errors'])
        file.write(f"\nTotal Errors: {error_count}\n")

    # Generate CSV file with errors
    if analysis['errors']:
        with open(output_path / 'errors.csv', 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Timestamp', 'Message', 'Line Number'])

            for error in analysis['errors']:
                writer.writerow([
                    error['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
                    error['message'],
                    error['line_number']
                ])

    print(f"Reports generated in {output_path}")

def main():
    """Main function to run the log analyzer."""
    print("Log File Analyzer")
    print("================")

    log_file = input("Enter the path to the log file: ")
    output_dir = input("Enter the output directory for reports: ")

    print(f"\nAnalyzing log file: {log_file}...")
    analysis = analyze_log_file(log_file)

    if analysis:
        print("Analysis complete.")
        generate_report(analysis, output_dir)
    else:
        print(f"Error: Could not analyze log file '{log_file}'.")

if __name__ == "__main__":
    main()
```

Để sử dụng ví dụ này, bạn sẽ cần tệp nhật ký ở định dạng `[YYYY-MM-DD HH:MM:SS] [LEVEL] Message`. Bạn có thể tạo tệp nhật ký mẫu hoặc điều chỉnh tập lệnh cho phù hợp với định dạng nhật ký của mình.

Ví dụ này chứng minh:

1. Đọc và xử lý tệp văn bản theo dòng
2. Sử dụng biểu thức chính quy để phân tích văn bản có cấu trúc
3. Ghi đầu ra sang các định dạng tệp khác nhau (văn bản và CSV)
4. Làm việc với đường dẫn tệp bằng mô-đun `pathlib`
5. Xử lý lỗi đối với các thao tác với tệp
6. Sử dụng mô-đun `datetime` để làm việc với dấu thời gian
7. Tạo báo cáo dựa trên phân tích tệp

## Các bước tiếp theo

Bây giờ bạn đã hiểu rõ về các thao tác với tệp trong Python. Bạn có thể đọc và ghi vào các tệp ở nhiều định dạng khác nhau, xử lý lỗi một cách khéo léo và làm việc với các đường dẫn tệp trên các hệ điều hành khác nhau.

Trong phần tiếp theo, chúng ta sẽ khám phá cách xử lý lỗi sâu hơn, cách dự đoán, nắm bắt và xử lý các ngoại lệ để làm cho chương trình Python của bạn mạnh mẽ hơn và thân thiện với người dùng hơn.

Chúc mừng mã hóa!
