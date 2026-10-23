---
title: "Biến và kiểu dữ liệu"
description: Tìm hiểu cách lưu trữ và thao tác các loại dữ liệu khác nhau trong Python
order: 2
---

Các biến là container để lưu trữ giá trị dữ liệu. Trong Python, các biến được tạo khi bạn gán giá trị cho chúng. Không giống như một số ngôn ngữ lập trình khác, Python không yêu cầu bạn khai báo loại biến trước khi sử dụng.

## Tạo biến

Trong Python, bạn tạo một biến bằng cách gán giá trị cho tên:

```python
# Creating different variables
name = "Alice"
age = 30
height = 1.75
is_student = True
```

Lưu ý rằng chúng ta không cần chỉ định loại biến - Python tự động tính toán nó dựa trên giá trị.

## Quy tắc đặt tên biến

Khi đặt tên biến trong Python, hãy làm theo các quy tắc sau:

- Tên biến có thể chứa chữ cái, số và dấu gạch dưới
- Tên biến không thể bắt đầu bằng số
- Tên biến có phân biệt chữ hoa chữ thường (`name` và `Name` là các biến khác nhau)
- Tên biến phải mang tính mô tả và tránh các từ khóa Python (như `print`, `if` hoặc `for`)

```python
# Good variable names
user_name = "bob_smith"
total_count = 42
is_active = True

# Poor variable names (avoid these)
a = "bob_smith"  # Not descriptive
1st_name = "Bob"  # Cannot start with a number (this will cause an error)
print = "Hello"  # Overrides a Python keyword (bad practice)
```

## Các kiểu dữ liệu cơ bản của Python

Python có một số kiểu dữ liệu tích hợp:

### Các loại số

```python
# Integer (whole number)
count = 42
temperature = -5

# Float (decimal number)
height = 1.75
pi = 3.14159

# Complex number (real + imaginary)
complex_num = 3 + 4j
```

#### Các phép toán số

```python
# Basic arithmetic
x = 10
y = 3

print(x + y)   # Addition: 13
print(x - y)   # Subtraction: 7
print(x * y)   # Multiplication: 30
print(x / y)   # Division: 3.3333...
print(x // y)  # Integer division (floor): 3
print(x % y)   # Modulus (remainder): 1
print(x ** y)  # Exponentiation: 1000
```

### Dây

Chuỗi là chuỗi ký tự, được đặt trong dấu ngoặc đơn, dấu ngoặc kép hoặc dấu ngoặc kép:

```python
name = "Alice"
message = 'Hello, Python!'
paragraph = """This is a multi-line
string that can span
across multiple lines."""
```

#### Hoạt động chuỗi

```python
# String concatenation (joining)
first_name = "John"
last_name = "Doe"
full_name = first_name + " " + last_name  # "John Doe"

# String repetition
excited = "Wow" * 3  # "WowWowWow"

# String indexing (accessing characters)
word = "Python"
first_letter = word[0]  # "P"
last_letter = word[-1]  # "n"

# String slicing (extracting parts)
word = "Python"
substring = word[1:4]  # "yth"

# String methods
message = "hello, world!"
print(message.upper())       # "HELLO, WORLD!"
print(message.capitalize())  # "Hello, world!"
print(message.replace("hello", "goodbye"))  # "goodbye, world!"
print(len(message))          # 13 (length of the string)
```

### Boolean

Các giá trị Boolean thể hiện sự thật: `True` hoặc `False`:

```python
is_active = True
is_completed = False

# Boolean operations
print(True and False)  # False
print(True or False)   # True
print(not True)        # False
```

### Loại

`None` thể hiện sự vắng mặt của một giá trị:

```python
result = None

# Checking for None
if result is None:
    print("No result yet")
```

## Chuyển đổi loại

Python cho phép bạn chuyển đổi giữa các loại dữ liệu khác nhau:

```python
# String to int
age_str = "30"
age = int(age_str)  # 30 as an integer

# Int to string
count = 42
count_str = str(count)  # "42" as a string

# String to float
height_str = "1.75"
height = float(height_str)  # 1.75 as a float

# Float to int (truncates decimal part)
price = 9.99
price_int = int(price)  # 9 (decimal part is dropped)
```

## Kiểm tra kiểu dữ liệu

Để kiểm tra loại biến, hãy sử dụng `type()` hàm:

```python
name = "Alice"
age = 30
height = 1.75
is_student = True

print(type(name))       # <class 'str'>
print(type(age))        # <class 'int'>
print(type(height))     # <class 'float'>
print(type(is_student)) # <class 'bool'>
```

## Định dạng chuỗi

Python cung cấp một số cách để định dạng chuỗi:

### Chuỗi F (Python 3.6+)

```python
name = "Alice"
age = 30
message = f"My name is {name} and I am {age} years old."
print(message)  # "My name is Alice and I am 30 years old."

# F-strings with expressions
price = 49.99
quantity = 3
total = price * quantity
print(f"Total cost: ${total:.2f}")  # "Total cost: $149.97"
```

### Phương pháp định dạng

```python
name = "Bob"
age = 25
message = "My name is {} and I am {} years old.".format(name, age)
print(message)  # "My name is Bob and I am 25 years old."

# With named placeholders
message = "My name is {name} and I am {age} years old.".format(name="Charlie", age=35)
print(message)  # "My name is Charlie and I am 35 years old."
```

## Thực hành: Làm việc với các biến và kiểu dữ liệu

Hãy áp dụng những gì chúng ta đã học vào thực tế bằng một chương trình đơn giản:

```python
# A program that calculates age in days, hours, and minutes

# Get user input
name = input("What is your name? ")
age_str = input("How old are you? ")
age = int(age_str)  # Convert string to integer

# Calculate age in different units
days = age * 365
hours = days * 24
minutes = hours * 60

# Create and print the formatted message
message = f"Hi {name}! You are {age} years old.\n"
message += f"That's approximately:\n"
message += f"- {days:,} days\n"
message += f"- {hours:,} hours\n"
message += f"- {minutes:,} minutes"

print(message)
```

Lưu cái này dưới dạng `age_calculator.py` và chạy nó. Bạn sẽ thấy đầu ra như:

```
What is your name? Alice
How old are you? 30
Hi Alice! You are 30 years old.
That's approximately:
- 10,950 days
- 262,800 hours
- 15,768,000 minutes
```

## Các bước tiếp theo

Bây giờ bạn đã hiểu các biến và kiểu dữ liệu cơ bản, bạn đã sẵn sàng bổ sung thêm nhiều chức năng hơn cho chương trình của mình. Trong phần tiếp theo, chúng ta sẽ khám phá luồng điều khiển, cách đưa ra quyết định và lặp lại hành động trong mã của bạn.

Chúc mừng mã hóa!
