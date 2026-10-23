---
title: "Lập trình hướng đối tượng"
description: Tìm hiểu các nguyên tắc lập trình hướng đối tượng trong Python
order: 9
---

Lập trình hướng đối tượng (OOP) là một mô hình lập trình tổ chức mã xung quanh các đối tượng, là các thể hiện của các lớp. Python là ngôn ngữ đa mô hình hỗ trợ OOP và cung cấp cách triển khai linh hoạt các nguyên tắc OOP. Trong phần này, bạn sẽ học cách tạo và sử dụng các lớp và đối tượng trong Python.

## Lớp và đối tượng

Một lớp là một bản thiết kế chi tiết để tạo ra các đối tượng. Đối tượng là một thể hiện của một lớp, một thực thể cụ thể dựa trên định nghĩa lớp.

### Xác định một lớp

Đây là một định nghĩa lớp đơn giản:

```python
class Dog:
    """A simple class representing a dog."""

    # Class attribute (shared by all instances)
    species = "Canis familiaris"

    # Initializer / Constructor
    def __init__(self, name, age):
        """Initialize a new Dog object."""
        self.name = name  # Instance attribute
        self.age = age    # Instance attribute

    # Instance method
    def bark(self):
        """Let the dog bark."""
        return f"{self.name} says Woof!"

    # Instance method
    def description(self):
        """Return a description of the dog."""
        return f"{self.name} is {self.age} years old"
```

Các thành phần chính của định nghĩa lớp này:

- Từ khóa `class` theo sau là tên lớp (thường ở dạng CamelCase)
- Một chuỗi tài liệu mô tả lớp
- Thuộc tính lớp được chia sẻ bởi tất cả các phiên bản
- Phương thức `__init__` (hàm tạo) khởi tạo các phiên bản mới
- Các thuộc tính của phiên bản là duy nhất cho mỗi phiên bản
- Các phương thức cá thể xác định hành vi của các đối tượng

### Tạo đối tượng (Instance)

Khi bạn đã xác định một lớp, bạn có thể tạo các thể hiện (đối tượng) của lớp đó:

```python
# Create two dog instances
buddy = Dog("Buddy", 9)
miles = Dog("Miles", 4)

# Access instance attributes
print(buddy.name)  # "Buddy"
print(miles.age)   # 4

# Access class attributes
print(buddy.species)  # "Canis familiaris"
print(miles.species)  # "Canis familiaris"

# Call instance methods
print(buddy.bark())        # "Buddy says Woof!"
print(miles.description())  # "Miles is 4 years old"
```

### Phương thức có tham số

Các phương thức có thể lấy tham số giống như hàm thông thường:

```python
class Dog:
    # Previous code...

    def eat(self, food):
        """Feed the dog."""
        return f"{self.name} is eating {food}"

# Create a dog instance
buddy = Dog("Buddy", 9)

# Call a method with a parameter
print(buddy.eat("dog food"))  # "Buddy is eating dog food"
```

## Kế thừa

Tính kế thừa cho phép bạn tạo một lớp mới kế thừa các thuộc tính và phương thức từ một lớp hiện có.

### Tạo một lớp con

```python
class Dog:
    # Previous Dog class code...

class Bulldog(Dog):
    """A Bulldog, a specific breed of dog."""

    # Override the species class attribute
    species = "Canis familiaris bulldogus"

    def __init__(self, name, age, weight):
        # Call the parent class's __init__ method
        super().__init__(name, age)
        self.weight = weight  # Add a new instance attribute

    # Override the bark method
    def bark(self):
        """Bulldogs have a different bark."""
        return f"{self.name} says Grrrr!"

    # Add a new method
    def snore(self):
        """Bulldogs snore loudly."""
        return f"{self.name} is snoring... ZZZ"
```

### Sử dụng lớp con

```python
# Create a Bulldog instance
rocky = Bulldog("Rocky", 3, 65)

# Access inherited attributes and methods
print(rocky.name)           # "Rocky"
print(rocky.description())  # "Rocky is 3 years old"

# Access overridden attributes and methods
print(rocky.species)  # "Canis familiaris bulldogus"
print(rocky.bark())   # "Rocky says Grrrr!"

# Access new attributes and methods
print(rocky.weight)   # 65
print(rocky.snore())  # "Rocky is snoring... ZZZ"
```

### Đa kế thừa

Python hỗ trợ đa kế thừa, trong đó một lớp có thể kế thừa từ nhiều lớp cha:

```python
class Animal:
    def eat(self):
        return "Eating..."

class CanSwim:
    def swim(self):
        return "Swimming..."

class CanFly:
    def fly(self):
        return "Flying..."

# Inherits from both Animal and CanSwim
class Duck(Animal, CanSwim, CanFly):
    def quack(self):
        return "Quack!"

# Create a Duck instance
donald = Duck()

# Access methods from all parent classes
print(donald.eat())   # "Eating..."
print(donald.swim())  # "Swimming..."
print(donald.fly())   # "Flying..."
print(donald.quack()) # "Quack!"
```

Khi một lớp kế thừa từ nhiều lớp cha, Python sử dụng Thứ tự phân giải phương thức (MRO) để xác định phương thức nào sẽ gọi khi cùng một tên phương thức được sử dụng trong nhiều lớp cha.

## Đóng gói

Đóng gói là gói dữ liệu và các phương thức hoạt động trên dữ liệu đó trong một đơn vị (lớp). Nó cũng liên quan đến việc hạn chế quyền truy cập vào một số thành phần nhất định để ngăn chặn những sửa đổi ngoài ý muốn.

### Thuộc tính và phương thức riêng tư

Python không có các thuộc tính hoặc phương thức riêng thực sự, nhưng nó sử dụng một quy ước: các tên có tiền tố là một dấu gạch dưới được coi là "được bảo vệ" (không có nghĩa là được truy cập trực tiếp) và các tên có tiền tố là dấu gạch dưới kép được viết sai tên để vô tình khó truy cập hơn:

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner            # Public attribute
        self._balance = balance       # Protected attribute
        self.__account_number = "12345"  # Private attribute (name-mangled)

    def deposit(self, amount):
        """Deposit money into the account."""
        if amount > 0:
            self._balance += amount
            return f"Deposited ${amount}. New balance: ${self._balance}"
        return "Invalid deposit amount"

    def withdraw(self, amount):
        """Withdraw money from the account."""
        if 0 < amount <= self._balance:
            self._balance -= amount
            return f"Withdrew ${amount}. New balance: ${self._balance}"
        return "Invalid withdrawal amount"

    def get_balance(self):
        """Get the current balance."""
        return self._balance

    def _service_charge(self):
        """Apply a service charge (protected method)."""
        self._balance -= 5

    def __generate_statement(self):
        """Generate an account statement (private method)."""
        return f"Statement for account {self.__account_number}"
```

### Truy cập thuộc tính

```python
# Create a bank account
account = BankAccount("Alice", 1000)

# Access public attributes and methods
print(account.owner)           # "Alice"
print(account.deposit(500))    # "Deposited $500. New balance: $1500"
print(account.get_balance())   # 1500

# Access protected attributes and methods
# This works, but it's discouraged by convention
print(account._balance)        # 1500
account._service_charge()
print(account.get_balance())   # 1495

# Try to access private attributes and methods
# This will raise an AttributeError
# print(account.__account_number)
# account.__generate_statement()

# But you can still access them using name mangling
print(account._BankAccount__account_number)  # "12345"
print(account._BankAccount__generate_statement())  # "Statement for account 12345"
```

## Người trang trí tài sản

Python cung cấp các trình trang trí thuộc tính để truy cập có kiểm soát vào các thuộc tính. Điều này cho phép bạn xác định các phương thức hoạt động giống như các thuộc tính:

```python
class Temperature:
    def __init__(self, celsius=0):
        self._celsius = celsius

    @property
    def celsius(self):
        """Get the temperature in Celsius."""
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        """Set the temperature in Celsius."""
        if value < -273.15:
            raise ValueError("Temperature below absolute zero is not possible")
        self._celsius = value

    @property
    def fahrenheit(self):
        """Get the temperature in Fahrenheit."""
        return (self._celsius * 9/5) + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        """Set the temperature in Fahrenheit."""
        celsius = (value - 32) * 5/9
        if celsius < -273.15:
            raise ValueError("Temperature below absolute zero is not possible")
        self._celsius = celsius
```

Sử dụng thuộc tính:

```python
# Create a Temperature instance
temp = Temperature(25)

# Access properties like attributes
print(temp.celsius)     # 25
print(temp.fahrenheit)  # 77.0

# Set properties
temp.celsius = 30
print(temp.celsius)     # 30
print(temp.fahrenheit)  # 86.0

temp.fahrenheit = 68
print(temp.celsius)     # 20.0
print(temp.fahrenheit)  # 68.0

# This will raise a ValueError
# temp.celsius = -300
```

## Đa hình

Tính đa hình cho phép các lớp khác nhau được coi là các thể hiện của cùng một lớp thông qua tính kế thừa và ghi đè phương thức hoặc bằng cách triển khai các phương thức giống nhau trong các lớp không liên quan.

### Ghi đè phương thức

Chúng ta đã thấy ghi đè phương thức trong ví dụ Bulldog, trong đó phương thức `bark` bị ghi đè.

### Gõ vịt

Python cũng hỗ trợ "gõ vịt", trong đó loại hoặc lớp của một đối tượng ít quan trọng hơn các phương thức mà nó xác định. "Nếu nó đi như một con vịt và kêu như một con vịt thì đó là một con vịt."

```python
class Duck:
    def quack(self):
        return "Quack!"

    def fly(self):
        return "Flapping wings"

class Person:
    def quack(self):
        return "I'm quacking like a duck!"

    def fly(self):
        return "I'm flapping my arms!"

def make_it_quack_and_fly(thing):
    """Make the thing quack and fly regardless of its type."""
    print(thing.quack())
    print(thing.fly())

# Create instances
duck = Duck()
person = Person()

# Both can quack and fly
make_it_quack_and_fly(duck)    # "Quack!" and "Flapping wings"
make_it_quack_and_fly(person)  # "I'm quacking like a duck!" and "I'm flapping my arms!"
```

## Phương pháp đặc biệt (Phương pháp ma thuật)

Các lớp Python có thể định nghĩa các phương thức đặc biệt, còn được gọi là "phương thức ma thuật" hoặc "phương thức dunder" (phương thức gạch dưới kép), để tùy chỉnh hành vi của các đối tượng.

### Các phương pháp đặc biệt phổ biến

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        """Return a string representation of the vector."""
        return f"Vector({self.x}, {self.y})"

    def __repr__(self):
        """Return a string representation for developers."""
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other):
        """Add two vectors."""
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        """Subtract one vector from another."""
        return Vector(self.x - other.x, self.y - other.y)

    def __eq__(self, other):
        """Check if two vectors are equal."""
        return self.x == other.x and self.y == other.y

    def __abs__(self):
        """Return the magnitude of the vector."""
        return (self.x ** 2 + self.y ** 2) ** 0.5

    def __bool__(self):
        """Return True if the vector's magnitude is non-zero."""
        return abs(self) != 0

    def __len__(self):
        """Return the dimension of the vector."""
        return 2
```

Sử dụng các phương pháp đặc biệt:

```python
# Create vectors
v1 = Vector(3, 4)
v2 = Vector(1, 2)

# __str__ is called by print()
print(v1)  # "Vector(3, 4)"

# __repr__ is called in interactive mode or by repr()
repr(v2)  # "Vector(1, 2)"

# __add__ is called by +
v3 = v1 + v2
print(v3)  # "Vector(4, 6)"

# __sub__ is called by -
v4 = v1 - v2
print(v4)  # "Vector(2, 2)"

# __eq__ is called by ==
print(v1 == v2)  # False
print(v3 == Vector(4, 6))  # True

# __abs__ is called by abs()
print(abs(v1))  # 5.0

# __bool__ is called by bool() or in conditionals
if v1:
    print("v1 is non-zero")  # This will be printed

# __len__ is called by len()
print(len(v1))  # 2
```

## Phương thức tĩnh và phương thức lớp

### Phương thức tĩnh

Các phương thức tĩnh không hoạt động trên các phiên bản và không yêu cầu tham số `self`:

```python
class MathUtils:
    @staticmethod
    def add(a, b):
        return a + b

    @staticmethod
    def multiply(a, b):
        return a * b

# Use static methods without creating an instance
print(MathUtils.add(5, 3))       # 8
print(MathUtils.multiply(5, 3))  # 15

# You can also use them from an instance
math = MathUtils()
print(math.add(5, 3))       # 8
```

### Phương thức lớp

Các phương thức lớp hoạt động trên chính lớp đó và lấy tham số `cls`:

```python
class Person:
    count = 0  # Class attribute to track the number of people

    def __init__(self, name, age):
        self.name = name
        self.age = age
        Person.count += 1

    @classmethod
    def create_adult(cls, name):
        """Create a new person who is an adult (age 18)."""
        return cls(name, 18)

    @classmethod
    def create_child(cls, name):
        """Create a new person who is a child (age 5)."""
        return cls(name, 5)

    @classmethod
    def get_count(cls):
        """Get the number of Person instances created."""
        return cls.count

# Create instances using class methods
adult = Person.create_adult("Alice")
child = Person.create_child("Bob")

print(adult.name, adult.age)  # "Alice 18"
print(child.name, child.age)  # "Bob 5"
print(Person.get_count())     # 2
```

## Các lớp cơ sở trừu tượng

Các lớp cơ sở trừu tượng (ABC) xác định một giao diện chung cho các lớp con của chúng nhưng không thể tự khởi tạo được. Mô-đun `abc` của Python cung cấp các công cụ để tạo ABC:

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        """Calculate the area of the shape."""
        pass

    @abstractmethod
    def perimeter(self):
        """Calculate the perimeter of the shape."""
        pass

    def describe(self):
        """Describe the shape."""
        return f"This shape has an area of {self.area()} square units and a perimeter of {self.perimeter()} units."

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        import math
        return math.pi * self.radius ** 2

    def perimeter(self):
        import math
        return 2 * math.pi * self.radius
```

Sử dụng các lớp cơ sở trừu tượng:

```python
# This would raise TypeError because Shape is abstract
# shape = Shape()

# Create concrete instances
rect = Rectangle(10, 5)
circle = Circle(7)

print(rect.area())       # 50
print(rect.perimeter())  # 30
print(rect.describe())   # "This shape has an area of 50 square units and a perimeter of 30 units."

print(circle.area())       # 153.93804002589985
print(circle.perimeter())  # 43.982297150257104
print(circle.describe())   # "This shape has an area of 153.93804002589985 square units and a perimeter of 43.982297150257104 units."
```

## Ví dụ thực tế: Hệ thống quản lý thư viện

Hãy xây dựng một ví dụ thực tế về Hệ thống quản lý thư viện thể hiện các nguyên tắc OOP:

```python
from datetime import datetime, timedelta
from abc import ABC, abstractmethod

class LibraryItem(ABC):
    """Base class for all library items."""

    def __init__(self, title, item_id):
        self.title = title
        self.item_id = item_id
        self.checked_out = False
        self.due_date = None

    @abstractmethod
    def get_type(self):
        """Return the type of the item."""
        pass

    @abstractmethod
    def get_loan_period(self):
        """Return the loan period in days."""
        pass

    def check_out(self):
        """Check out the item."""
        if self.checked_out:
            return f"{self.title} is already checked out."

        self.checked_out = True
        self.due_date = datetime.now() + timedelta(days=self.get_loan_period())
        return f"{self.title} checked out successfully. Due on {self.due_date.strftime('%Y-%m-%d')}."

    def check_in(self):
        """Check in the item."""
        if not self.checked_out:
            return f"{self.title} is not checked out."

        self.checked_out = False
        self.due_date = None
        return f"{self.title} checked in successfully."

    def is_overdue(self):
        """Check if the item is overdue."""
        if not self.checked_out:
            return False
        return datetime.now() > self.due_date

    def __str__(self):
        status = "Checked out" if self.checked_out else "Available"
        return f"{self.get_type()}: {self.title} ({self.item_id}) - {status}"

class Book(LibraryItem):
    """A book in the library."""

    def __init__(self, title, item_id, author, pages):
        super().__init__(title, item_id)
        self.author = author
        self.pages = pages

    def get_type(self):
        return "Book"

    def get_loan_period(self):
        return 21  # 3 weeks

    def __str__(self):
        base_str = super().__str__()
        return f"{base_str}, Author: {self.author}, Pages: {self.pages}"

class DVD(LibraryItem):
    """A DVD in the library."""

    def __init__(self, title, item_id, director, runtime):
        super().__init__(title, item_id)
        self.director = director
        self.runtime = runtime  # in minutes

    def get_type(self):
        return "DVD"

    def get_loan_period(self):
        return 7  # 1 week

    def __str__(self):
        base_str = super().__str__()
        return f"{base_str}, Director: {self.director}, Runtime: {self.runtime} mins"

class Magazine(LibraryItem):
    """A magazine in the library."""

    def __init__(self, title, item_id, issue, publisher):
        super().__init__(title, item_id)
        self.issue = issue
        self.publisher = publisher

    def get_type(self):
        return "Magazine"

    def get_loan_period(self):
        return 7  # 1 week

    def __str__(self):
        base_str = super().__str__()
        return f"{base_str}, Issue: {self.issue}, Publisher: {self.publisher}"

class Patron:
    """A library patron (user)."""

    def __init__(self, name, patron_id):
        self.name = name
        self.patron_id = patron_id
        self.checked_out_items = []

    def check_out_item(self, item):
        """Check out an item from the library."""
        if item.checked_out:
            return f"Cannot check out {item.title} because it is already checked out."

        item.check_out()
        self.checked_out_items.append(item)
        return f"{self.name} checked out {item.title}."

    def return_item(self, item):
        """Return an item to the library."""
        if item not in self.checked_out_items:
            return f"{self.name} does not have {item.title} checked out."

        item.check_in()
        self.checked_out_items.remove(item)
        return f"{self.name} returned {item.title}."

    def get_checked_out_items(self):
        """Get a list of all checked out items."""
        return self.checked_out_items

    def __str__(self):
        num_items = len(self.checked_out_items)
        return f"Patron: {self.name} ({self.patron_id}), Items Checked Out: {num_items}"

class Library:
    """A library that manages items and patrons."""

    def __init__(self, name):
        self.name = name
        self.items = {}  # Dictionary of item_id -> item
        self.patrons = {}  # Dictionary of patron_id -> patron

    def add_item(self, item):
        """Add an item to the library collection."""
        if item.item_id in self.items:
            return f"Item with ID {item.item_id} already exists."

        self.items[item.item_id] = item
        return f"{item.title} added to the library."

    def add_patron(self, patron):
        """Register a new patron with the library."""
        if patron.patron_id in self.patrons:
            return f"Patron with ID {patron.patron_id} already exists."

        self.patrons[patron.patron_id] = patron
        return f"{patron.name} registered with the library."

    def check_out_item(self, patron_id, item_id):
        """Check out an item to a patron."""
        if patron_id not in self.patrons:
            return f"Patron with ID {patron_id} does not exist."

        if item_id not in self.items:
            return f"Item with ID {item_id} does not exist."

        patron = self.patrons[patron_id]
        item = self.items[item_id]

        return patron.check_out_item(item)

    def return_item(self, patron_id, item_id):
        """Return an item from a patron."""
        if patron_id not in self.patrons:
            return f"Patron with ID {patron_id} does not exist."

        if item_id not in self.items:
            return f"Item with ID {item_id} does not exist."

        patron = self.patrons[patron_id]
        item = self.items[item_id]

        return patron.return_item(item)

    def list_overdue_items(self):
        """List all overdue items."""
        overdue_items = [item for item in self.items.values() if item.is_overdue()]
        return overdue_items

    def __str__(self):
        return f"{self.name} Library - {len(self.items)} items, {len(self.patrons)} patrons"

# Example usage
def main():
    # Create a library
    library = Library("Community")

    # Add some items to the library
    book1 = Book("The Hobbit", "B001", "J.R.R. Tolkien", 295)
    book2 = Book("1984", "B002", "George Orwell", 328)
    dvd1 = DVD("The Matrix", "D001", "The Wachowskis", 136)
    magazine1 = Magazine("National Geographic", "M001", "January 2023", "National Geographic Society")

    print(library.add_item(book1))
    print(library.add_item(book2))
    print(library.add_item(dvd1))
    print(library.add_item(magazine1))

    # Register some patrons
    patron1 = Patron("Alice Smith", "P001")
    patron2 = Patron("Bob Johnson", "P002")

    print(library.add_patron(patron1))
    print(library.add_patron(patron2))

    # Check out and return items
    print(library.check_out_item("P001", "B001"))  # Alice checks out The Hobbit
    print(library.check_out_item("P002", "D001"))  # Bob checks out The Matrix
    print(library.check_out_item("P001", "M001"))  # Alice checks out National Geographic

    print("\nLibrary Items Status:")
    for item in library.items.values():
        print(f"- {item}")

    print("\nPatron Status:")
    for patron in library.patrons.values():
        print(f"- {patron}")
        for item in patron.get_checked_out_items():
            print(f"  * {item.title}")

    print("\nReturning items:")
    print(library.return_item("P001", "B001"))  # Alice returns The Hobbit

    print("\nUpdated Library Items Status:")
    for item in library.items.values():
        print(f"- {item}")

if __name__ == "__main__":
    main()
```

Ví dụ này chứng minh:

1. Các lớp cơ sở trừu tượng với `LibraryItem` là lớp cha cho các loại mục khác nhau
2. Kế thừa với `Book`, `DVD` và `Magazine` kế thừa từ `LibraryItem`
3. Đóng gói với các thuộc tính và phương thức được tổ chức trong các lớp
4. Đa hình với các cách triển khai khác nhau của `get_type` và `get_loan_period`
5. Thành phần với `Library` quản lý bộ sưu tập vật phẩm và khách hàng quen
6. Ghi đè phương thức bằng các phương thức `__str__` được tùy chỉnh cho từng lớp
7. Xác thực tài sản bằng logic đăng ký và đăng ký

## Nguyên tắc thiết kế OOP

Khi bạn trở nên thoải mái hơn với OOP, hãy xem xét các nguyên tắc thiết kế sau:

1. **Nguyên tắc trách nhiệm duy nhất**: Một lớp chỉ nên có một lý do để thay đổi.
2. **Nguyên tắc mở/đóng**: Các lớp phải được mở để mở rộng nhưng đóng để sửa đổi.
3. Nguyên tắc thay thế **Liskov**: Các đối tượng của siêu lớp phải được thay thế bằng các đối tượng của lớp con mà không ảnh hưởng đến tính chính xác của chương trình.
4. **Phân chia giao diện**: Nhiều giao diện cụ thể sẽ tốt hơn một giao diện có mục đích chung.
5. **Đảo ngược phụ thuộc**: Phụ thuộc vào sự trừu tượng hóa, không phụ thuộc vào việc triển khai cụ thể.

Những nguyên tắc này, thường được gọi là RẮN, giúp tạo mã dễ bảo trì, linh hoạt và mạnh mẽ hơn.

## Các bước tiếp theo

Lập trình hướng đối tượng là một mô hình mạnh mẽ có thể giúp bạn tổ chức và cấu trúc mã của mình. Bằng cách tạo các lớp và đối tượng, bạn có thể lập mô hình các thực thể trong thế giới thực và mối quan hệ của chúng, làm cho mã của bạn trở nên trực quan và dễ bảo trì hơn.

Trong phần tiếp theo, chúng tôi sẽ tổng hợp mọi thứ bạn đã học để xây dựng một dự án Python hoàn chỉnh từ đầu đến cuối.

Chúc mừng mã hóa!
