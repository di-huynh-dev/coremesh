---
title: "Hàm trong Python"
description: Tạo các khối mã có thể tái sử dụng để làm cho chương trình của bạn có tổ chức và mô-đun hơn
order: 4
---

hàm là các khối mã có thể tái sử dụng được thiết kế để thực hiện một tác vụ cụ thể. Chúng giúp bạn sắp xếp mã, làm cho mã có thể tái sử dụng nhiều hơn và chia các vấn đề phức tạp thành các phần nhỏ hơn, dễ quản lý hơn.

## Xác định và gọi hàm

Dưới đây là cách xác định hàm đơn giản trong Python:

```python
# Define a function
def greet():
    print("Hello, world!")

# Call the function
greet()  # Output: Hello, world!
```

hàm này không nhận bất kỳ tham số nào hoặc trả về bất kỳ giá trị nào. Hãy xem xét các ví dụ phức tạp hơn.

## Tham số và đối số

Tham số là các biến được liệt kê trong định nghĩa hàm. Đối số là các giá trị bạn chuyển tới hàm khi gọi nó.

```python
# Function with parameters
def greet_person(name):
    print(f"Hello, {name}!")

# Call the function with an argument
greet_person("Alice")  # Output: Hello, Alice!
greet_person("Bob")    # Output: Hello, Bob!
```

hàm có thể có nhiều tham số:

```python
def describe_pet(animal_type, pet_name):
    print(f"I have a {animal_type} named {pet_name}.")

describe_pet("dog", "Rex")  # Output: I have a dog named Rex.
describe_pet("cat", "Whiskers")  # Output: I have a cat named Whiskers.
```

### Giá trị tham số mặc định

Bạn có thể chỉ định giá trị mặc định cho tham số, được sử dụng khi không cung cấp đối số:

```python
def greet_person(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet_person("Alice")  # Output: Hello, Alice!
greet_person("Bob", "Hi")  # Output: Hi, Bob!
```

### Đối số từ khóa

Bạn có thể sử dụng tên tham số khi gọi hàm để làm cho mã của bạn dễ đọc hơn và chỉ định các đối số theo bất kỳ thứ tự nào:

```python
def describe_pet(animal_type, pet_name):
    print(f"I have a {animal_type} named {pet_name}.")

# Using keyword arguments
describe_pet(animal_type="hamster", pet_name="Harry")
describe_pet(pet_name="Harry", animal_type="hamster")  # Same result, different order
```

## Giá trị trả về

hàm có thể trả về các giá trị bằng câu lệnh `return`:

```python
def add_numbers(a, b):
    return a + b

sum_result = add_numbers(5, 3)
print(sum_result)  # Output: 8
```

hàm có thể trả về nhiều giá trị dưới dạng một bộ dữ liệu:

```python
def get_dimensions():
    return 1920, 1080

width, height = get_dimensions()
print(f"Width: {width}, Height: {height}")  # Output: Width: 1920, Height: 1080
```

Nếu hàm không trả về một giá trị một cách rõ ràng thì nó sẽ ngầm trả về `None`:

```python
def no_return():
    print("This function doesn't return anything.")

result = no_return()
print(result)  # Output: None
```

## Phạm vi biến

Các biến được xác định bên trong hàm có phạm vi cục bộ, có nghĩa là chúng chỉ có thể truy cập được trong hàm đó:

```python
def my_function():
    local_var = "I'm local"
    print(local_var)  # This works

my_function()
# print(local_var)  # This would cause an error because local_var is not defined outside the function
```

Các biến được xác định bên ngoài bất kỳ hàm nào đều có phạm vi toàn cục:

```python
global_var = "I'm global"

def my_function():
    print(global_var)  # You can access global variables inside functions

my_function()  # Output: I'm global
```

Nếu bạn muốn sửa đổi biến toàn cục bên trong hàm, bạn cần sử dụng từ khóa `global`:

```python
counter = 0

def increment_counter():
    global counter  # Tell Python we want to use the global counter
    counter += 1
    print(f"Counter: {counter}")

increment_counter()  # Output: Counter: 1
increment_counter()  # Output: Counter: 2
```

## Tài liệu

Chuỗi tài liệu (chuỗi tài liệu) giải thích chức năng của hàm. Chúng giúp các nhà phát triển khác (và cả bạn trong tương lai) hiểu mã của bạn:

```python
def calculate_area(length, width):
    """
    Calculate the area of a rectangle.

    Args:
        length (float): The length of the rectangle.
        width (float): The width of the rectangle.

    Returns:
        float: The area of the rectangle.
    """
    return length * width

# You can access the docstring
print(calculate_area.__doc__)
```

## \*args và \*\*kwargs

Python cho phép bạn xác định hàm có thể chấp nhận số lượng đối số thay đổi:

### \*args (Đối số vị trí)

```python
def sum_all(*args):
    """Sum all the numbers passed to the function."""
    total = 0
    for num in args:
        total += num
    return total

print(sum_all(1, 2, 3))  # Output: 6
print(sum_all(1, 2, 3, 4, 5))  # Output: 15
```

### \*\*kwargs (Đối số từ khóa)

```python
def print_info(**kwargs):
    """Print information about a person."""
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=30, city="New York")
# Output:
# name: Alice
# age: 30
# city: New York
```

## Lambda hàm

Lambda hàm là hàm nhỏ, ẩn danh được xác định bằng từ khóa `lambda`:

```python
# Regular function
def add(a, b):
    return a + b

# Equivalent lambda function
add_lambda = lambda a, b: a + b

print(add(5, 3))       # Output: 8
print(add_lambda(5, 3))  # Output: 8
```

Lambda hàm thường được sử dụng với hàm như `map()`, `filter()`, và `sorted()`:

```python
# Using lambda with map
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
print(squared)  # Output: [1, 4, 9, 16, 25]

# Using lambda with filter
even_numbers = list(filter(lambda x: x % 2 == 0, numbers))
print(even_numbers)  # Output: [2, 4]

# Using lambda with sorted
people = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "Charlie", "age": 35}
]
sorted_people = sorted(people, key=lambda person: person["age"])
print(sorted_people)
# Output: [{'name': 'Bob', 'age': 25}, {'name': 'Alice', 'age': 30}, {'name': 'Charlie', 'age': 35}]
```

## Đệ quy

hàm có thể gọi chính nó, được gọi là đệ quy. Điều này rất hữu ích để giải quyết các vấn đề có thể được chia thành các vấn đề con tương tự nhỏ hơn:

```python
def factorial(n):
    """Calculate the factorial of a number using recursion."""
    # Base case
    if n == 0 or n == 1:
        return 1
    # Recursive case
    else:
        return n * factorial(n - 1)

print(factorial(5))  # Output: 120 (5 * 4 * 3 * 2 * 1)
```

Hãy cẩn thận với đệ quy, vì nó có thể dẫn đến tràn ngăn xếp nếu độ sâu đệ quy quá cao. Python giới hạn độ sâu đệ quy để ngăn chặn điều này.

## Ví dụ thực tế: Bộ chuyển đổi nhiệt độ

Hãy xây dựng một bộ chuyển đổi nhiệt độ thực tế bằng hàm:

```python
def celsius_to_fahrenheit(celsius):
    """
    Convert Celsius to Fahrenheit.

    Args:
        celsius (float): Temperature in Celsius.

    Returns:
        float: Temperature in Fahrenheit.
    """
    return (celsius * 9/5) + 32

def fahrenheit_to_celsius(fahrenheit):
    """
    Convert Fahrenheit to Celsius.

    Args:
        fahrenheit (float): Temperature in Fahrenheit.

    Returns:
        float: Temperature in Celsius.
    """
    return (fahrenheit - 32) * 5/9

def kelvin_to_celsius(kelvin):
    """
    Convert Kelvin to Celsius.

    Args:
        kelvin (float): Temperature in Kelvin.

    Returns:
        float: Temperature in Celsius.
    """
    return kelvin - 273.15

def celsius_to_kelvin(celsius):
    """
    Convert Celsius to Kelvin.

    Args:
        celsius (float): Temperature in Celsius.

    Returns:
        float: Temperature in Kelvin.
    """
    return celsius + 273.15

def convert_temperature(value, from_unit, to_unit):
    """
    Convert a temperature from one unit to another.

    Args:
        value (float): The temperature value to convert.
        from_unit (str): The unit to convert from ('C', 'F', or 'K').
        to_unit (str): The unit to convert to ('C', 'F', or 'K').

    Returns:
        float: The converted temperature.
    """
    # First convert to Celsius as an intermediate step
    if from_unit == 'C':
        celsius = value
    elif from_unit == 'F':
        celsius = fahrenheit_to_celsius(value)
    elif from_unit == 'K':
        celsius = kelvin_to_celsius(value)
    else:
        raise ValueError("From unit must be 'C', 'F', or 'K'")

    # Then convert from Celsius to the target unit
    if to_unit == 'C':
        return celsius
    elif to_unit == 'F':
        return celsius_to_fahrenheit(celsius)
    elif to_unit == 'K':
        return celsius_to_kelvin(celsius)
    else:
        raise ValueError("To unit must be 'C', 'F', or 'K'")

# Main program
def main():
    print("Temperature Converter")
    print("---------------------")
    print("Units: 'C' for Celsius, 'F' for Fahrenheit, 'K' for Kelvin")

    try:
        value = float(input("Enter the temperature value: "))
        from_unit = input("Enter the unit to convert from (C/F/K): ").upper()
        to_unit = input("Enter the unit to convert to (C/F/K): ").upper()

        result = convert_temperature(value, from_unit, to_unit)
        print(f"{value} {from_unit} = {result:.2f} {to_unit}")

    except ValueError as e:
        print(f"Error: {e}")

# Only run the main function if this file is run directly (not imported)
if __name__ == "__main__":
    main()
```

Lưu cái này dưới dạng `temperature_converter.py` và chạy nó. Ví dụ này thể hiện một số khái niệm chính:

1. Định nghĩa hàm với các tham số và giá trị trả về
2. Tài liệu
3. Thành phần hàm (hàm gọi hàm khác)
4. Xử lý lỗi với ngoại lệ
5. Mẫu `if __name__ == "__main__"` (xem thêm về điều này trong phần mô-đun)

## Các bước tiếp theo

hàm là khối xây dựng cơ bản trong lập trình Python. Bằng cách tìm hiểu hàm, bạn đã thực hiện một bước quan trọng trong việc viết mã có tổ chức hơn, có thể tái sử dụng và dễ bảo trì hơn.

Trong phần tiếp theo, chúng ta sẽ khám phá các cấu trúc dữ liệu của Python, bao gồm danh sách, bộ dữ liệu, từ điển và bộ, những cấu trúc này sẽ cho phép bạn làm việc với các bộ sưu tập dữ liệu hiệu quả hơn.

Chúc mừng mã hóa!
