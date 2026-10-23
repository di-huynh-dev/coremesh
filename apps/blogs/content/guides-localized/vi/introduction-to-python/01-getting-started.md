---
title: "Bắt đầu với Python"
description: Thiết lập môi trường Python và viết chương trình đầu tiên của bạn
order: 1
---

Trước khi có thể bắt đầu viết mã bằng Python, bạn cần thiết lập môi trường phát triển của mình. Phần này sẽ hướng dẫn bạn cài đặt Python, chọn trình soạn thảo mã và viết chương trình Python đầu tiên của bạn.

## Cài đặt Python

Python có hai phiên bản chính: Python 2 và Python 3. Python 2 đã hết hạn sử dụng vào năm 2020, vì vậy chúng tôi sẽ sử dụng Python 3 trong suốt hướng dẫn này.

### Dành cho Windows

1. Hãy ghé thăm [Trang tải xuống Python](https://www.python.org/downloads/)
2. Tải xuống trình cài đặt Python 3 mới nhất cho Windows
3. Chạy trình cài đặt và đảm bảo chọn hộp có nội dung "Thêm Python vào PATH"
4. Nhấp vào "Cài đặt ngay"

Bạn có thể xác minh cài đặt của mình bằng cách mở Dấu nhắc lệnh và gõ:

```bash
python --version
```

Bạn sẽ thấy nội dung giống như `Python 3.11.x` (phiên bản chính xác có thể khác).

### Dành cho macOS

macOS thường được cài đặt sẵn Python nhưng có thể là phiên bản cũ hơn. Để cài đặt phiên bản mới nhất:

1. Cài đặt [Homebrew](https://brew.sh/) nếu bạn chưa có
2. Mở Terminal và chạy:

```bash
brew install python
```

Xác minh cài đặt của bạn:

```bash
python3 --version
```

### Dành cho Linux

Hầu hết các bản phân phối Linux đều được cài đặt sẵn Python. Để đảm bảo bạn có phiên bản mới nhất, hãy chạy:

```bash
# For Debian/Ubuntu
sudo apt update
sudo apt install python3 python3-pip

# For Fedora
sudo dnf install python3 python3-pip

# For Arch Linux
sudo pacman -S python python-pip
```

Xác minh cài đặt của bạn:

```bash
python3 --version
```

## Chọn Trình soạn thảo mã

Mặc dù bạn có thể viết mã Python bằng bất kỳ trình soạn thảo văn bản nào, nhưng việc sử dụng trình soạn thảo mã chuyên dụng hoặc IDE (Môi trường phát triển tích hợp) sẽ giúp trải nghiệm mã hóa của bạn trở nên thú vị hơn nhiều. Dưới đây là một số tùy chọn phổ biến:

### Mã Visual Studio (Mã VS)

VS Code là trình soạn thảo mã nhẹ, miễn phí và mạnh mẽ với sự hỗ trợ Python tuyệt vời.

1. Tải xuống và cài đặt [Mã VS](https://code.visualstudio.com/)
2. Mở Mã VS và cài đặt tiện ích mở rộng Python từ thị trường Tiện ích mở rộng

### PyCharm

PyCharm là một IDE Python chuyên dụng với các tính năng mạnh mẽ.

1. Tải xuống và cài đặt [Phiên bản cộng đồng PyCharm](https://www.jetbrains.com/pycharm/download/) (miễn phí)
2. Làm theo hướng dẫn cài đặt cho hệ điều hành của bạn

### Máy tính xách tay Jupyter

Để mã hóa tương tác và phân tích dữ liệu:

```bash
pip install notebook
```

Sau đó chạy:

```bash
jupyter notebook
```

## Chương trình Python đầu tiên của bạn

Bây giờ bạn đã cài đặt Python và trình soạn thảo mã sẵn sàng, hãy viết chương trình Python đầu tiên của bạn.

1. Mở trình soạn thảo mã của bạn
2. Tạo một tệp mới có tên `hello.py`
3. Nhập mã sau đây:

```python
# This is a comment - it doesn't affect the code
print("Hello, Python world!")  # This prints a message to the screen

# Let's add a little more to our first program
name = input("What's your name? ")  # Get input from the user
print(f"Nice to meet you, {name}!")  # Use an f-string to include the name in our message
```

4. Lưu tập tin
5. Chạy chương trình:
   - Trong Mã VS: Nhấp chuột phải vào trình chỉnh sửa và chọn "Chạy tệp Python trong Terminal"
   - Trong PyCharm: Nhấp chuột phải và chọn "Chạy 'xin chào'"
   - Trong Terminal/Dấu nhắc lệnh: Điều hướng đến thư mục chứa tệp của bạn và chạy `python hello.py`

Bạn sẽ thấy "Xin chào, thế giới Python!" được in ra, theo sau là lời nhắc hỏi tên của bạn. Sau khi nhập tên của bạn, bạn sẽ thấy lời chào được cá nhân hóa.

## Tìm hiểu về shell tương tác Python

Python cung cấp shell tương tác (hoặc REPL - Vòng lặp Đọc-Đánh giá-In) nơi bạn có thể chạy trực tiếp các lệnh Python.

Để truy cập nó:

- Trên Windows: Mở Dấu nhắc Lệnh và gõ `python`
- Trên macOS/Linux: Mở Terminal và gõ `python3`

Bạn sẽ thấy một cái gì đó như:

```
Python 3.11.0 (main, Oct 24 2022, 18:26:48)
[GCC 11.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

Bây giờ bạn có thể gõ trực tiếp mã Python và xem kết quả ngay lập tức:

```python
>>> 2 + 2
4
>>> print("Hello from the interactive shell!")
Hello from the interactive shell!
>>> name = "Developer"
>>> print(f"Hello, {name}!")
Hello, Developer!
```

shell tương tác rất phù hợp để thử nghiệm các đoạn mã nhỏ, thử nghiệm với Python và học ngôn ngữ.

## Các bước tiếp theo

Bây giờ bạn đã thiết lập xong môi trường Python và viết chương trình đầu tiên của mình, bạn đã sẵn sàng tìm hiểu sâu hơn về lập trình Python. Trong phần tiếp theo, chúng ta sẽ khám phá các biến và kiểu dữ liệu, nền tảng của bất kỳ chương trình Python nào.

Chúc mừng mã hóa!
