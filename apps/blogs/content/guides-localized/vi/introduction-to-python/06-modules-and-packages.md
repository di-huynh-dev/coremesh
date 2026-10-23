---
title: "Mô-đun và gói"
description: Tìm hiểu cách sắp xếp mã của bạn thành các mô-đun và gói có thể sử dụng lại
order: 6
---

Khi các dự án Python của bạn phát triển, bạn sẽ cần các cách để sắp xếp mã của mình thành các thành phần có thể quản lý và tái sử dụng. Hệ thống mô-đun và gói của Python giúp bạn đạt được điều này bằng cách cho phép bạn chia mã thành các tệp và thư mục riêng biệt.

## Mô-đun

Một mô-đun chỉ đơn giản là một tệp Python (có phần mở rộng `.py`) chứa các định nghĩa và câu lệnh Python. Tên mô-đun là tên tệp không có phần mở rộng.

### Sử dụng các mô-đun tích hợp

Python đi kèm với một thư viện mô-đun tiêu chuẩn phong phú. Hãy xem cách sử dụng chúng:

```python
# Import the entire module
import math

# Now we can use functions from the math module
print(math.sqrt(16))  # 4.0
print(math.pi)        # 3.141592653589793

# Import specific items from a module
from random import randint, choice

# Now we can use these functions directly
print(randint(1, 10))       # Random integer between 1 and 10
fruits = ['apple', 'banana', 'cherry']
print(choice(fruits))       # Random item from the list

# Import a module with an alias
import datetime as dt

# Now we can use the shortened name
current_time = dt.datetime.now()
print(current_time)
```

### Tạo mô-đun của riêng bạn

Hãy tạo một mô-đun đơn giản để hiểu cách thức hoạt động của nó:

1. Tạo một tệp có tên `calculator.py` với nội dung sau:

```python
"""
A simple calculator module.

This module provides basic arithmetic functions.
"""

def add(a, b):
    """Add two numbers and return the result."""
    return a + b

def subtract(a, b):
    """Subtract b from a and return the result."""
    return a - b

def multiply(a, b):
    """Multiply two numbers and return the result."""
    return a * b

def divide(a, b):
    """Divide a by b and return the result."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

# Constants
PI = 3.14159
E = 2.71828

# This code only runs when this file is executed directly
if __name__ == "__main__":
    print("Testing the calculator module")
    print(f"2 + 3 = {add(2, 3)}")
    print(f"5 - 2 = {subtract(5, 2)}")
    print(f"3 * 4 = {multiply(3, 4)}")
    print(f"10 / 2 = {divide(10, 2)}")
```

2. Bây giờ hãy tạo một tệp khác có tên `use_calculator.py` trong cùng thư mục:

```python
# Import our calculator module
import calculator

# Use functions from our module
result = calculator.add(10, 5)
print(f"10 + 5 = {result}")

result = calculator.subtract(10, 5)
print(f"10 - 5 = {result}")

# Use constants from our module
print(f"The value of PI is approximately {calculator.PI}")
```

Khi bạn chạy `use_calculator.py`, nó sẽ nhập và sử dụng hàm cũng như các hằng số từ mô-đun `calculator.py` của bạn.

### Mẫu `if __name__ == "__main__"`

Bạn có thể đã nhận thấy mẫu này trong mô-đun máy tính:

```python
if __name__ == "__main__":
    # Code here only runs when this file is executed directly
```

Khi Python chạy một tệp, nó sẽ đặt biến đặc biệt `__name__` thành `"__main__"` nếu tệp đang được chạy trực tiếp. Nếu tệp đang được nhập dưới dạng mô-đun, `__name__` được đặt thành tên của mô-đun.

Mẫu này cho phép bạn bao gồm mã chỉ chạy khi tệp được thực thi trực tiếp chứ không phải khi tệp được nhập dưới dạng mô-đun. Đó là mẫu phổ biến cho các mô-đun có thể được nhập và chạy dưới dạng tập lệnh.

### Đường dẫn tìm kiếm mô-đun

Khi bạn nhập một mô-đun, Python sẽ tìm kiếm nó ở các vị trí sau:

1. Thư mục chứa script đang chạy
2. Thư mục thư viện chuẩn Python
3. Các thư mục được liệt kê trong biến môi trường `PYTHONPATH`
4. Thư mục mặc định phụ thuộc vào cài đặt

Bạn có thể xem danh sách đầy đủ các thư mục tìm kiếm Python bằng cách in `sys.path`:

```python
import sys
print(sys.path)
```

## Gói

Gói là một thư mục chứa các mô-đun Python và tệp `__init__.py` đặc biệt. Các gói cho phép bạn tổ chức các mô-đun liên quan thành cấu trúc phân cấp.

### Tạo một gói

Hãy tạo một gói đơn giản để hiểu khái niệm:

1. Tạo một thư mục có tên `mathutils`
2. Bên trong `mathutils`, tạo một tệp trống có tên `__init__.py`
3. Tạo hai tệp mô-đun bên trong `mathutils`:

`mathutils/basic.py`:

```python
"""Basic math operations."""

def add(a, b):
    return a + b

def subtract(a, b):
    return a - b
```

`mathutils/advanced.py`:

```python
"""Advanced math operations."""

import math

def square_root(x):
    return math.sqrt(x)

def power(base, exponent):
    return base ** exponent
```

4. Cuối cùng, tạo một tệp có tên `use_package.py` bên ngoài thư mục `mathutils`:

```python
# Import specific modules from the package
from mathutils import basic, advanced

# Use functions from the modules
result = basic.add(10, 5)
print(f"10 + 5 = {result}")

result = advanced.power(2, 8)
print(f"2^8 = {result}")

# Alternative import syntax
import mathutils.basic
import mathutils.advanced

result = mathutils.basic.subtract(10, 5)
print(f"10 - 5 = {result}")

result = mathutils.advanced.square_root(16)
print(f"√16 = {result}")
```

Khi bạn chạy `use_package.py`, nó sẽ nhập các mô-đun từ gói `mathutils` của bạn.

### Tệp `__init__.py`

Tệp `__init__.py` phục vụ một số mục đích:

1. Nó đánh dấu một thư mục là gói Python
2. Nó có thể khởi tạo gói khi được nhập
3. Nó có thể thiết lập các biến cấp gói
4. Nó có thể hiển thị các mô-đun cụ thể hoặc hàm trực tiếp ở cấp gói

Hãy sửa đổi tệp `mathutils/__init__.py` của chúng tôi để hiển thị trực tiếp hàm ở cấp gói:

```python
"""Math utilities package."""

# Import specific functions from modules
from .basic import add, subtract
from .advanced import square_root, power

# Define package-level variables
__version__ = '0.1.0'
__author__ = 'Your Name'
```

Bây giờ bạn có thể nhập hàm trực tiếp từ gói:

```python
# Import functions directly from the package
from mathutils import add, square_root

result = add(10, 5)
print(f"10 + 5 = {result}")

result = square_root(16)
print(f"√16 = {result}")

# You can also check package information
import mathutils
print(f"mathutils version: {mathutils.__version__}")
print(f"mathutils author: {mathutils.__author__}")
```

### Không gian tên và phạm vi

Hiểu không gian tên và phạm vi rất quan trọng khi làm việc với các mô-đun và gói:

- **Namespace**: Ánh xạ từ tên đến đối tượng. Các không gian tên khác nhau có thể cùng tồn tại ở những thời điểm khác nhau, trong các mô-đun riêng biệt, hàm hoặc các lớp.
- **Scope**: Vùng văn bản của chương trình Python nơi không gian tên có thể truy cập trực tiếp.

Khi bạn sử dụng mô-đun, mỗi mô-đun có không gian tên riêng, giúp tránh xung đột khi đặt tên:

```python
# Module 1: math_operations.py
def add(a, b):
    return a + b

# Module 2: string_operations.py
def add(s1, s2):
    return s1 + s2

# Using both modules
import math_operations
import string_operations

print(math_operations.add(2, 3))           # 5
print(string_operations.add("Hello, ", "World!"))  # "Hello, World!"
```

Nếu không có mô-đun, bạn sẽ có xung đột đặt tên với hai `add` hàm.

## Các mô-đun thư viện tiêu chuẩn phổ biến

Thư viện chuẩn của Python rất phong phú. Dưới đây là một số module thường được sử dụng:

### `datetime` - Ngày và Giờ

```python
from datetime import datetime, timedelta

# Get current date and time
now = datetime.now()
print(f"Current datetime: {now}")

# Create a specific date
new_year = datetime(2025, 1, 1)
print(f"New Year: {new_year}")

# Format a date
formatted = now.strftime("%Y-%m-%d %H:%M:%S")
print(f"Formatted: {formatted}")

# Parse a date string
date_string = "2025-05-21 14:30:00"
parsed_date = datetime.strptime(date_string, "%Y-%m-%d %H:%M:%S")
print(f"Parsed: {parsed_date}")

# Date arithmetic
tomorrow = now + timedelta(days=1)
print(f"Tomorrow: {tomorrow}")

one_week_ago = now - timedelta(weeks=1)
print(f"One week ago: {one_week_ago}")
```

### `random` - Số ngẫu nhiên

```python
import random

# Random float between 0 and 1
print(random.random())

# Random integer in range
print(random.randint(1, 100))

# Random choice from a sequence
fruits = ['apple', 'banana', 'cherry']
print(random.choice(fruits))

# Shuffle a list in place
numbers = list(range(1, 11))
random.shuffle(numbers)
print(numbers)

# Random sample without replacement
print(random.sample(range(1, 51), 6))  # 6 random numbers from 1-50
```

### `os` và `os.path` - Giao diện hệ điều hành

```python
import os

# Current working directory
print(os.getcwd())

# List directory contents
print(os.listdir('.'))

# Join path components properly
path = os.path.join('folder', 'subfolder', 'file.txt')
print(path)

# Check if a file exists
exists = os.path.exists('example.txt')
print(f"File exists: {exists}")

# File information
if os.path.exists('example.txt'):
    size = os.path.getsize('example.txt')
    print(f"File size: {size} bytes")

    mod_time = os.path.getmtime('example.txt')
    print(f"Last modified: {datetime.fromtimestamp(mod_time)}")

# Create a directory
# os.mkdir('new_directory')

# Delete a file
# os.remove('unnecessary_file.txt')
```

### `json` - Mã hóa và giải mã JSON

```python
import json

# Python dictionary
person = {
    'name': 'Alice',
    'age': 30,
    'city': 'New York',
    'languages': ['Python', 'JavaScript', 'Go'],
    'is_developer': True
}

# Convert to JSON string
json_string = json.dumps(person, indent=4)
print(json_string)

# Convert JSON string back to Python object
decoded = json.loads(json_string)
print(decoded['name'])
print(decoded['languages'][0])

# Write JSON to a file
with open('person.json', 'w') as f:
    json.dump(person, f, indent=4)

# Read JSON from a file
with open('person.json', 'r') as f:
    loaded_person = json.load(f)
    print(loaded_person)
```

## Gói của bên thứ ba

Hệ sinh thái của Python bao gồm hàng nghìn gói của bên thứ ba cho nhiều mục đích khác nhau. Bạn có thể cài đặt chúng bằng pip, trình cài đặt gói của Python.

Dưới đây là một số gói bên thứ ba phổ biến:

- **requests**: Yêu cầu HTTP được đơn giản hóa
- **numpy**: Điện toán số
- **pandas**: Phân tích và xử lý dữ liệu
- **matplotlib**: Trực quan hóa dữ liệu
- **flask**: Phát triển web
- **django**: Khung web
- **pygame**: Phát triển trò chơi
- **pillow**: Xử lý image
- **tensorflow**: Học máy

Để cài đặt gói của bên thứ ba, hãy sử dụng pip:

```bash
pip install requests
```

Sau đó, bạn có thể sử dụng gói trong mã Python của mình:

```python
import requests

# Make an HTTP GET request
response = requests.get('https://api.github.com')
print(f"Status code: {response.status_code}")

# Get the response data as JSON
data = response.json()
print(f"API endpoints: {len(data)}")
```

## Môi trường ảo

Khi làm việc trên nhiều dự án Python, bạn có thể cần các phiên bản gói khác nhau cho từng dự án. Môi trường ảo giải quyết vấn đề này bằng cách tạo môi trường biệt lập cho từng dự án.

### Tạo môi trường ảo

```bash
# For Python 3.3+
python -m venv myenv

# Activate the virtual environment
# On Windows:
myenv\Scripts\activate
# On macOS/Linux:
source myenv/bin/activate

# Install packages in the virtual environment
pip install requests

# When you're done, deactivate the environment
deactivate
```

### Sử dụng `requirements.txt`

Bạn có thể liệt kê các phần phụ thuộc của dự án trong tệp `requirements.txt`:

```
requests==2.28.1
numpy==1.23.4
pandas==1.5.1
```

Sau đó cài đặt tất cả các phụ thuộc cùng một lúc:

```bash
pip install -r requirements.txt
```

## Ví dụ thực tế: Ứng dụng thời tiết

Hãy xây dựng một ứng dụng thời tiết nhỏ thể hiện cách sử dụng các mô-đun, gói và thư viện của bên thứ ba:

```python
"""
Weather App

This script retrieves and displays current weather information
for a specified city using the OpenWeatherMap API.
"""

import os
import json
import datetime
import requests

def get_api_key():
    """Get API key from environment variable or config file."""
    # First, try to get the API key from an environment variable
    api_key = os.environ.get('OPENWEATHERMAP_API_KEY')

    # If not found, try to load from a config file
    if not api_key:
        try:
            with open('config.json', 'r') as f:
                config = json.load(f)
                api_key = config.get('api_key')
        except (FileNotFoundError, json.JSONDecodeError):
            pass

    return api_key

def get_weather(city, api_key):
    """Get current weather for the specified city."""
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        'q': city,
        'appid': api_key,
        'units': 'metric'  # Use metric units (Celsius)
    }

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise an exception for HTTP errors
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        if response.status_code == 404:
            print(f"City '{city}' not found. Please check the spelling.")
        else:
            print(f"HTTP error occurred: {http_err}")
    except requests.exceptions.RequestException as err:
        print(f"Error occurred: {err}")

    return None

def display_weather(weather_data):
    """Display the weather information in a formatted way."""
    if not weather_data:
        return

    # Extract relevant information
    city = weather_data['name']
    country = weather_data['sys']['country']
    temp = weather_data['main']['temp']
    feels_like = weather_data['main']['feels_like']
    description = weather_data['weather'][0]['description']
    humidity = weather_data['main']['humidity']
    wind_speed = weather_data['wind']['speed']
    timestamp = weather_data['dt']

    # Convert timestamp to datetime
    dt = datetime.datetime.fromtimestamp(timestamp)
    formatted_date = dt.strftime("%A, %B %d, %Y")
    formatted_time = dt.strftime("%I:%M %p")

    # Display the information
    print("\nCurrent Weather")
    print("==============")
    print(f"Location: {city}, {country}")
    print(f"Date: {formatted_date}")
    print(f"Time: {formatted_time}")
    print(f"Temperature: {temp}°C (Feels like: {feels_like}°C)")
    print(f"Conditions: {description.capitalize()}")
    print(f"Humidity: {humidity}%")
    print(f"Wind Speed: {wind_speed} m/s")

def main():
    """Main function to run the weather app."""
    print("Weather App")
    print("-----------")

    # Get API key
    api_key = get_api_key()
    if not api_key:
        print("Error: API key not found.")
        print("Please set the OPENWEATHERMAP_API_KEY environment variable")
        print("or create a config.json file with your API key.")
        return

    # Get city from user
    city = input("Enter city name: ")

    # Get and display weather
    weather_data = get_weather(city, api_key)
    display_weather(weather_data)

if __name__ == "__main__":
    main()
```

Để sử dụng ứng dụng này:

1. Đăng ký key API miễn phí tại [Bản đồ thời tiết mở](https://openweathermap.org/api)
2. Đặt biến môi trường `OPENWEATHERMAP_API_KEY` bằng khóa API của bạn hoặc
3. Tạo một tệp có tên `config.json` với nội dung sau:

```json
{
  "api_key": "your_api_key_here"
}
```

Ví dụ này chứng minh:

1. Nhập và sử dụng các mô-đun thư viện tiêu chuẩn (`os`, `json`, `datetime`)
2. Sử dụng gói của bên thứ ba (`requests`)
3. Sắp xếp mã vào hàm
4. Mẫu `if __name__ == "__main__"`
5. Xử lý lỗi với thử ngoại trừ
6. Làm việc với các biến môi trường và tệp cấu hình

## Các bước tiếp theo

Bây giờ bạn đã hiểu cách sử dụng và tạo các mô-đun cũng như gói trong Python, điều này rất cần thiết để xây dựng các dự án lớn hơn, có tổ chức hơn. Trong phần tiếp theo, chúng ta sẽ khám phá các thao tác với tệp, cách đọc và ghi vào tệp trong Python.

Chúc mừng mã hóa!
