---
title: "Xử lý lỗi và ngoại lệ"
description: Tìm hiểu cách xử lý lỗi và ngoại lệ trong mã Python của bạn
order: 8
---

Cho dù bạn viết mã cẩn thận đến đâu thì lỗi vẫn có thể và sẽ xảy ra. Python cung cấp một cách mạnh mẽ để xử lý các lỗi này thông qua các ngoại lệ. Trong phần này, bạn sẽ học cách dự đoán, nắm bắt và xử lý các ngoại lệ để làm cho chương trình của bạn trở nên linh hoạt hơn.

## Hiểu lỗi và ngoại lệ

Trong Python, có hai loại lỗi chính:

1. **Lỗi cú pháp**: Lỗi này xảy ra khi trình phân tích cú pháp Python không thể hiểu mã của bạn do cú pháp sai. Chúng ngăn cản chương trình của bạn chạy.

2. **Exceptions**: Những điều này xảy ra trong quá trình thực thi chương trình của bạn khi có điều gì đó không mong muốn xảy ra.

### Lỗi cú pháp

Lỗi cú pháp, còn được gọi là lỗi phân tích cú pháp, được phát hiện khi Python cố gắng diễn giải mã của bạn:

```python
# Syntax error: missing closing parenthesis
print("Hello, world!"
```

Điều này sẽ tạo ra một lỗi như:

```
  File "example.py", line 1
    print("Hello, world!"
                        ^
SyntaxError: unexpected EOF while parsing
```

Mũi tên chỉ đến điểm sớm nhất nơi phát hiện lỗi, điểm này không phải lúc nào cũng là điểm thực sự xảy ra lỗi.

### Ngoại lệ

Các ngoại lệ xảy ra trong quá trình thực thi chương trình và có thể xảy ra vì nhiều lý do khác nhau, như cố gắng chia cho 0 hoặc truy cập vào một tệp không tồn tại:

```python
# Exception: division by zero
result = 10 / 0
```

Điều này sẽ tạo ra một lỗi như:

```
Traceback (most recent call last):
  File "example.py", line 1, in <module>
    result = 10 / 0
ZeroDivisionError: division by zero
```

Truy nguyên hiển thị chuỗi các cuộc gọi hàm dẫn đến lỗi, với cuộc gọi gần đây nhất ở dưới cùng.

## Các loại ngoại lệ phổ biến

Python có nhiều ngoại lệ tích hợp. Dưới đây là một số cái phổ biến:

- `ZeroDivisionError`: Tăng lên khi chia cho 0
- `TypeError`: Xảy ra khi một thao tác được áp dụng cho một đối tượng thuộc loại không phù hợp
- `ValueError`: Xảy ra khi hàm nhận được đối số đúng loại nhưng giá trị không phù hợp
- `NameError`: Tăng lên khi không tìm thấy tên cục bộ hoặc tên chung
- `IndexError`: Tăng lên khi chỉ số thứ tự nằm ngoài phạm vi
- `KeyError`: Xảy ra khi không tìm thấy khóa từ điển
- `FileNotFoundError`: Xảy ra khi tệp hoặc thư mục được yêu cầu nhưng không tồn tại
- `IOError`: Tăng lên khi thao tác I/O không thành công
- `ImportError`: Xảy ra khi câu lệnh nhập không tìm thấy mô-đun hoặc tên

Hãy xem một số ví dụ:

```python
# TypeError
result = "42" + 42  # Trying to concatenate a string and an integer

# ValueError
number = int("hello")  # Trying to convert a non-numeric string to an integer

# NameError
print(undefined_variable)  # Using a variable that hasn't been defined

# IndexError
my_list = [1, 2, 3]
item = my_list[10]  # Accessing an index that doesn't exist

# KeyError
my_dict = {"name": "Alice"}
value = my_dict["age"]  # Accessing a key that doesn't exist

# FileNotFoundError
with open("nonexistent_file.txt", "r") as file:
    content = file.read()
```

## Xử lý ngoại lệ bằng thử/ngoại trừ

Để xử lý các ngoại lệ, bạn sử dụng khối `try/except`. Cú pháp cơ bản là:

```python
try:
    # Code that might raise an exception
    result = 10 / 0
except ZeroDivisionError:
    # Code to handle the specific exception
    print("Error: Cannot divide by zero")
```

Bạn có thể xử lý nhiều ngoại lệ bằng cách sử dụng nhiều khối `except` hoặc bằng cách nhóm các ngoại lệ:

```python
# Multiple except blocks
try:
    num = int(input("Enter a number: "))
    result = 10 / num
    print(f"Result: {result}")
except ValueError:
    print("Error: Please enter a valid number")
except ZeroDivisionError:
    print("Error: Cannot divide by zero")

# Grouping exceptions
try:
    num = int(input("Enter a number: "))
    result = 10 / num
    print(f"Result: {result}")
except (ValueError, ZeroDivisionError):
    print("Error: Please enter a valid, non-zero number")
```

## Thu thập thông tin ngoại lệ

Bạn có thể nắm bắt đối tượng ngoại lệ để có thêm thông tin về những gì đã xảy ra:

```python
try:
    num = int(input("Enter a number: "))
    result = 10 / num
    print(f"Result: {result}")
except Exception as e:
    print(f"An error occurred: {type(e).__name__}: {e}")
```

Từ khóa `as` gán đối tượng ngoại lệ cho một biến (trong trường hợp này là `e`), cho phép bạn truy cập vào các thuộc tính của nó.

## Các mệnh đề khác và cuối cùng

Bạn có thể thêm mệnh đề `else` chạy nếu không có ngoại lệ nào được đưa ra và mệnh đề `finally` chạy dù có xảy ra ngoại lệ hay không:

```python
try:
    num = int(input("Enter a number: "))
    result = 10 / num
except ValueError:
    print("Error: Please enter a valid number")
except ZeroDivisionError:
    print("Error: Cannot divide by zero")
else:
    # This runs if no exceptions occur
    print(f"Result: {result}")
finally:
    # This always runs, whether an exception occurred or not
    print("Calculation attempt completed")
```

Mệnh đề `finally` hữu ích cho các hành động dọn dẹp như đóng tệp hoặc giải phóng tài nguyên, bất kể có xảy ra ngoại lệ hay không.

## Sử dụng ngoại lệ để kiểm soát luồng

Mặc dù các ngoại lệ chủ yếu dùng để xử lý lỗi nhưng chúng cũng có thể được sử dụng để kiểm soát luồng trong một số trường hợp nhất định. Cách tiếp cận "Dễ yêu cầu sự tha thứ hơn là sự cho phép" (EAFP) là phổ biến trong Python:

```python
# EAFP approach
try:
    value = my_dict["key"]
    # Use the value...
except KeyError:
    # Handle the case where the key doesn't exist
    value = default_value

# Alternative: "Look before you leap" (LBYL) approach
if "key" in my_dict:
    value = my_dict["key"]
    # Use the value...
else:
    # Handle the case where the key doesn't exist
    value = default_value
```

Cách tiếp cận EAFP có thể sạch hơn và hiệu quả hơn trong nhiều trường hợp, đặc biệt khi việc kiểm tra một điều kiện tốn kém hơn việc xử lý ngoại lệ.

## Đưa ra ngoại lệ

Bạn có thể đưa ra các ngoại lệ trong mã của riêng mình bằng cách sử dụng câu lệnh `raise`:

```python
def divide(a, b):
    if b == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    return a / b

try:
    result = divide(10, 0)
except ZeroDivisionError as e:
    print(f"Error: {e}")
```

## Tạo ngoại lệ tùy chỉnh

Bạn có thể xác định các loại ngoại lệ của riêng mình bằng cách tạo một lớp kế thừa từ `Exception` hoặc một trong các lớp con của nó:

```python
class InvalidAgeError(Exception):
    """Raised when the input age is negative or unreasonably high."""
    pass

def validate_age(age):
    if age < 0:
        raise InvalidAgeError("Age cannot be negative")
    if age > 150:
        raise InvalidAgeError("Age is unreasonably high")
    return age

try:
    user_age = int(input("Enter your age: "))
    validated_age = validate_age(user_age)
    print(f"Your age is {validated_age}")
except ValueError:
    print("Error: Please enter a valid number")
except InvalidAgeError as e:
    print(f"Error: {e}")
```

## Phân cấp ngoại lệ

Các ngoại lệ của Python tạo thành một hệ thống phân cấp, với `BaseException` ở trên cùng. Đây là một cái nhìn đơn giản:

```
BaseException
 ├── SystemExit
 ├── KeyboardInterrupt
 ├── GeneratorExit
 └── Exception
      ├── StopIteration
      ├── ArithmeticError
      │    ├── FloatingPointError
      │    ├── OverflowError
      │    └── ZeroDivisionError
      ├── AssertionError
      ├── AttributeError
      ├── ImportError
      │    └── ModuleNotFoundError
      ├── LookupError
      │    ├── IndexError
      │    └── KeyError
      ├── NameError
      ├── OSError
      │    ├── FileNotFoundError
      │    ├── PermissionError
      │    └── ...
      └── ...
```

Khi xử lý các ngoại lệ, hãy nhớ rằng việc bắt ngoại lệ cha cũng sẽ bắt được tất cả các ngoại lệ con của nó:

```python
try:
    # Some code that might raise various exceptions
    pass
except LookupError:
    # This will catch both IndexError and KeyError
    pass
except OSError:
    # This will catch FileNotFoundError, PermissionError, etc.
    pass
except Exception:
    # This will catch most exceptions
    pass
```

Nói chung, tốt nhất là bạn nên nắm bắt các ngoại lệ cụ thể thay vì sử dụng mệnh đề `except Exception` rộng rãi, vì mệnh đề sau có thể che giấu các lỗi và khiến việc gỡ lỗi trở nên khó khăn hơn.

## Trình quản lý bối cảnh và câu lệnh with

Chúng ta đã thấy câu lệnh `with` cho các thao tác với tệp:

```python
with open("example.txt", "r") as file:
    content = file.read()
```

Đây là ví dụ về trình quản lý bối cảnh, xử lý việc thiết lập (mở tệp) và phân tích (đóng tệp) một cách tự động, ngay cả khi xảy ra ngoại lệ. Trình quản lý bối cảnh là một cách rõ ràng để xử lý tài nguyên và ngoại lệ.

Bạn có thể tạo trình quản lý bối cảnh của riêng mình bằng cách sử dụng mô-đun `contextlib` hoặc xác định một lớp bằng các phương thức `__enter__` và `__exit__`:

```python
from contextlib import contextmanager

@contextmanager
def file_manager(filename, mode):
    try:
        file = open(filename, mode)
        yield file
    finally:
        file.close()

# Using the custom context manager
with file_manager("example.txt", "r") as file:
    content = file.read()
    print(content)
```

## Khẳng định

Khẳng định là một cách để kiểm tra xem các điều kiện có như mong đợi trong quá trình phát triển hay không:

```python
def calculate_average(numbers):
    assert len(numbers) > 0, "Cannot calculate average of empty list"
    return sum(numbers) / len(numbers)

# This will raise an AssertionError
calculate_average([])
```

Các xác nhận chủ yếu là công cụ hỗ trợ gỡ lỗi và có thể bị tắt ở chế độ tối ưu hóa (`python -O`), vì vậy, đừng sử dụng chúng để xác thực đầu vào hoặc thực thi các điều kiện trong mã production.

## Ví dụ thực tế: Trình phân tích cú pháp cấu hình mạnh mẽ

Hãy xây dựng một ví dụ thực tế thể hiện việc xử lý lỗi bằng trình phân tích cú pháp tệp cấu hình:

```python
"""
Config Parser

A module for parsing configuration files with robust error handling.
"""

class ConfigError(Exception):
    """Base class for configuration-related errors."""
    pass

class ConfigParseError(ConfigError):
    """Raised when there's a problem parsing the configuration file."""
    def __init__(self, message, line_number=None, line_content=None):
        self.line_number = line_number
        self.line_content = line_content
        super().__init__(f"{message}" +
                         (f" on line {line_number}" if line_number else "") +
                         (f": '{line_content}'" if line_content else ""))

class ConfigKeyError(ConfigError):
    """Raised when a required key is missing."""
    pass

class ConfigTypeError(ConfigError):
    """Raised when a value has the wrong type."""
    pass

def parse_config_file(file_path):
    """
    Parse a configuration file and return a dictionary of settings.

    The file should have lines in the format "key = value".
    Lines starting with # are treated as comments.

    Args:
        file_path (str): Path to the configuration file

    Returns:
        dict: The parsed configuration

    Raises:
        FileNotFoundError: If the file doesn't exist
        ConfigParseError: If there's a problem parsing the file
    """
    config = {}

    try:
        with open(file_path, 'r') as file:
            for line_number, line in enumerate(file, 1):
                line = line.strip()

                # Skip empty lines and comments
                if not line or line.startswith('#'):
                    continue

                # Parse key-value pairs
                try:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip()

                    # Check for empty key
                    if not key:
                        raise ConfigParseError("Empty key", line_number, line)

                    # Store the key-value pair
                    config[key] = value

                except ValueError:
                    # Couldn't unpack the line into key and value
                    raise ConfigParseError("Invalid format", line_number, line)

        return config

    except FileNotFoundError:
        raise FileNotFoundError(f"Configuration file not found: {file_path}")
    except Exception as e:
        # Catch any other exceptions and re-raise as ConfigParseError
        if not isinstance(e, ConfigError):
            raise ConfigParseError(f"Unexpected error: {e}")
        raise

def get_string(config, key, default=None):
    """Get a string value from the configuration."""
    try:
        return config[key]
    except KeyError:
        if default is not None:
            return default
        raise ConfigKeyError(f"Missing required key: {key}")

def get_int(config, key, default=None):
    """Get an integer value from the configuration."""
    try:
        value = config[key]
        return int(value)
    except KeyError:
        if default is not None:
            return default
        raise ConfigKeyError(f"Missing required key: {key}")
    except ValueError:
        raise ConfigTypeError(f"Value for {key} is not a valid integer: {value}")

def get_float(config, key, default=None):
    """Get a float value from the configuration."""
    try:
        value = config[key]
        return float(value)
    except KeyError:
        if default is not None:
            return default
        raise ConfigKeyError(f"Missing required key: {key}")
    except ValueError:
        raise ConfigTypeError(f"Value for {key} is not a valid float: {value}")

def get_boolean(config, key, default=None):
    """Get a boolean value from the configuration."""
    try:
        value = config[key].lower()
        if value in ('true', 'yes', '1', 'on'):
            return True
        if value in ('false', 'no', '0', 'off'):
            return False
        raise ConfigTypeError(f"Value for {key} is not a valid boolean: {value}")
    except KeyError:
        if default is not None:
            return default
        raise ConfigKeyError(f"Missing required key: {key}")

def main():
    """Main function demonstrating the config parser."""
    config_file = input("Enter configuration file path: ")

    try:
        config = parse_config_file(config_file)
        print("Configuration loaded successfully.")

        # Access configuration values
        try:
            host = get_string(config, "host", default="localhost")
            port = get_int(config, "port", default=8080)
            max_connections = get_int(config, "max_connections")
            timeout = get_float(config, "timeout", default=30.0)
            debug = get_boolean(config, "debug", default=False)

            print("\nConfiguration values:")
            print(f"Host: {host}")
            print(f"Port: {port}")
            print(f"Max Connections: {max_connections}")
            print(f"Timeout: {timeout} seconds")
            print(f"Debug Mode: {'Enabled' if debug else 'Disabled'}")

        except ConfigKeyError as e:
            print(f"Configuration error: {e}")
        except ConfigTypeError as e:
            print(f"Configuration error: {e}")

    except FileNotFoundError as e:
        print(f"Error: {e}")
    except ConfigParseError as e:
        if e.line_number:
            print(f"Error parsing configuration on line {e.line_number}: {e}")
        else:
            print(f"Error parsing configuration: {e}")
    except Exception as e:
        print(f"Unexpected error: {type(e).__name__}: {e}")

if __name__ == "__main__":
    main()
```

Để sử dụng ví dụ này, hãy tạo tệp cấu hình mẫu có tên `config.ini`:

```
# Sample configuration file

host = example.com
port = 443
max_connections = 100
timeout = 5.5
debug = true
```

Ví dụ này chứng minh:

1. Tạo hệ thống phân cấp ngoại lệ tùy chỉnh cho các loại lỗi cụ thể
2. Sử dụng các khối thử/ngoại trừ để xử lý các loại lỗi khác nhau
3. Chuyển đổi dữ liệu đầu vào của người dùng thành loại dữ liệu thích hợp có xử lý lỗi
4. Cung cấp thông báo lỗi hữu ích với thông tin ngữ cảnh
5. Sử dụng các giá trị mặc định khi thích hợp
6. Tuyên truyền và nâng cao các ngoại lệ đúng cách

## Thực tiễn tốt nhất để xử lý ngoại lệ

1. **Be cụ thể**: Nắm bắt các ngoại lệ cụ thể thay vì sử dụng mệnh đề `except` rộng rãi.
2. **Keep khối thử nhỏ**: Chỉ đặt mã có thể gây ra ngoại lệ trong khối thử.
3. **Xử lý các ngoại lệ một cách duyên dáng**: Cung cấp các thông báo lỗi hữu ích và các tùy chọn khôi phục.
4. **DKhông tắt tiếng các ngoại lệ**: Tránh các khối trống ngoại trừ các khối ẩn lỗi.
5. **Sử dụng cuối cùng để dọn dẹp**: Sử dụng cuối cùng để đảm bảo tài nguyên được giải phóng hợp lý.
6. **Sử dụng trình quản lý bối cảnh**: Chúng xử lý việc quản lý tài nguyên và các ngoại lệ một cách rõ ràng.
7. **Tăng lại khi thích hợp**: Tăng lại các ngoại lệ để truyền chúng tới người gọi.
8. **Ghi lại các ngoại lệ**: Trong các ứng dụng lớn hơn, hãy ghi lại các ngoại lệ để gỡ lỗi và giám sát.

## Các bước tiếp theo

Xử lý lỗi là một kỹ năng quan trọng để viết các chương trình Python mạnh mẽ. Bằng cách dự đoán và xử lý các trường hợp ngoại lệ đúng cách, bạn có thể làm cho chương trình của mình trở nên linh hoạt hơn trước các tình huống không mong muốn và cung cấp trải nghiệm người dùng tốt hơn.

Trong phần tiếp theo, chúng ta sẽ khám phá lập trình hướng đối tượng trong Python, phần này sẽ cho phép bạn tạo mã mô-đun, có thể tái sử dụng bằng cách xác định các kiểu của riêng bạn với các lớp và đối tượng.

Chúc mừng mã hóa!
