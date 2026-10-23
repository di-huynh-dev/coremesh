---
title: "Luồng điều khiển"
description: Đưa ra quyết định và kiểm soát luồng thực thi các chương trình Python của bạn
order: 3
---

Luồng điều khiển là cách chúng tôi điều khiển đường dẫn thực thi của chương trình dựa trên các điều kiện và vòng lặp. Trong phần này, bạn sẽ tìm hiểu cách sử dụng các câu lệnh điều kiện, vòng lặp và toán tử so sánh để kiểm soát cách thực thi mã Python của bạn.

## Toán tử so sánh

Trước khi đi sâu vào các câu lệnh có điều kiện, hãy tìm hiểu các toán tử so sánh trong Python:

```python
# Equal to
print(5 == 5)   # True
print("a" == "b")  # False

# Not equal to
print(5 != 10)  # True

# Greater than
print(10 > 5)   # True

# Less than
print(5 < 10)   # True

# Greater than or equal to
print(10 >= 10) # True

# Less than or equal to
print(5 <= 5)   # True
```

## Câu lệnh có điều kiện

Câu lệnh có điều kiện cho phép chương trình của bạn đưa ra quyết định dựa trên các điều kiện.

### Câu lệnh if

Câu lệnh `if` thực thi một khối mã nếu một điều kiện được chỉ định là đúng:

```python
# Basic if statement
temperature = 28

if temperature > 25:
    print("It's a hot day!")
    print("Don't forget to stay hydrated.")

print("This line always executes")
```

Lưu ý rằng trong Python, khối mã trong câu lệnh `if` được thụt lề. Python sử dụng thụt lề để xác định các khối mã.

### Câu lệnh If-Else

Câu lệnh `if-else` thực thi một khối mã nếu điều kiện là đúng và khối mã khác nếu điều kiện đó sai:

```python
# if-else statement
temperature = 15

if temperature > 25:
    print("It's a hot day!")
    print("Don't forget to stay hydrated.")
else:
    print("It's not very hot today.")
    print("Enjoy the cooler weather!")

print("This line always executes")
```

### Câu lệnh If-Elif-Else

Câu lệnh `elif` (viết tắt của "else if") cho phép bạn kiểm tra nhiều điều kiện:

```python
# if-elif-else statement
temperature = 15

if temperature > 30:
    print("It's very hot!")
    print("Stay hydrated and avoid direct sun.")
elif temperature > 20:
    print("It's a warm day.")
    print("Perfect for outdoor activities.")
elif temperature > 10:
    print("It's a bit cool today.")
    print("You might want a light jacket.")
else:
    print("It's cold!")
    print("Don't forget your coat.")

print("This line always executes")
```

Các điều kiện được kiểm tra theo thứ tự. Khi một điều kiện là đúng, khối mã của nó sẽ được thực thi và các điều kiện còn lại sẽ bị bỏ qua.

### Câu lệnh điều kiện lồng nhau

Bạn cũng có thể lồng các câu điều kiện vào nhau:

```python
# Nested if statements
temperature = 25
is_raining = False

if temperature > 20:
    print("It's warm outside.")

    if is_raining:
        print("But it's raining, take an umbrella!")
    else:
        print("And it's not raining, enjoy the sunshine!")
else:
    print("It's cold outside.")

    if is_raining:
        print("And it's raining, better stay inside.")
    else:
        print("But at least it's not raining.")
```

### Biểu thức điều kiện (Toán tử bậc ba)

Python có một cách nhỏ gọn để viết các câu lệnh if-else đơn giản:

```python
# Ternary operator
age = 20
status = "adult" if age >= 18 else "minor"
print(status)  # "adult"
```

Điều này tương đương với:

```python
if age >= 18:
    status = "adult"
else:
    status = "minor"
```

## Toán tử logic

Toán tử logic kết hợp các câu lệnh có điều kiện:

```python
# and - both conditions must be true
temp = 25
is_sunny = True

if temp > 20 and is_sunny:
    print("It's a warm, sunny day!")

# or - at least one condition must be true
if temp > 30 or is_sunny:
    print("Either it's very hot or it's sunny, or both!")

# not - inverts a condition
if not is_sunny:
    print("It's not sunny today.")
else:
    print("It's sunny today!")
```

Bạn có thể kết hợp nhiều toán tử logic:

```python
temp = 25
is_sunny = True
is_weekend = False

if temp > 20 and (is_sunny or is_weekend):
    print("Good day for outdoor activities!")
```

## Vòng lặp

Vòng lặp cho phép bạn thực thi một khối mã nhiều lần.

### Đối với vòng lặp

Đối với các vòng lặp lặp qua một chuỗi (như danh sách, bộ dữ liệu hoặc chuỗi):

```python
# Iterating over a range of numbers
for i in range(5):  # 0, 1, 2, 3, 4
    print(i)

# Iterating over a string
for char in "Python":
    print(char)

# Iterating over a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(f"I like {fruit}s")

# Using range with start, stop, and step
for i in range(2, 10, 2):  # 2, 4, 6, 8
    print(i)
```

### Vòng lặp while

Vòng lặp while thực thi một khối mã miễn là điều kiện còn đúng:

```python
# Basic while loop
count = 1
while count <= 5:
    print(count)
    count += 1  # Don't forget to update the condition, or you'll have an infinite loop!

# Breaking out of a while loop
count = 1
while True:  # Infinite loop
    print(count)
    count += 1
    if count > 5:
        break  # Exit the loop when count exceeds 5
```

### Câu lệnh điều khiển vòng lặp

Python cung cấp các câu lệnh để kiểm soát luồng vòng lặp:

```python
# break - exits the loop entirely
for i in range(10):
    if i == 5:
        break  # Exit the loop when i equals 5
    print(i)  # Prints 0, 1, 2, 3, 4

# continue - skips the current iteration and continues with the next
for i in range(10):
    if i % 2 == 0:
        continue  # Skip even numbers
    print(i)  # Prints 1, 3, 5, 7, 9

# else clause in loops - executes after the loop completes normally (not via break)
for i in range(5):
    print(i)
else:
    print("Loop completed successfully")

# When a break occurs, the else clause doesn't execute
for i in range(5):
    if i == 3:
        break
    print(i)
else:
    print("This won't print because the loop was exited with a break")
```

## Ví dụ thực tế: Trò chơi đoán số đơn giản

Hãy kết hợp những khái niệm này lại với nhau trong một trò chơi đoán số đơn giản:

```python
import random

# Generate a random number between 1 and 100
secret_number = random.randint(1, 100)
attempts = 0
max_attempts = 7

print("Welcome to the Number Guessing Game!")
print(f"I'm thinking of a number between 1 and 100. You have {max_attempts} attempts.")

while attempts < max_attempts:
    # Get user input
    try:
        guess_str = input("Enter your guess: ")
        guess = int(guess_str)
    except ValueError:
        print("Please enter a valid number.")
        continue

    # Increment attempt counter
    attempts += 1

    # Check the guess
    if guess < secret_number:
        print(f"Too low! You have {max_attempts - attempts} attempts left.")
    elif guess > secret_number:
        print(f"Too high! You have {max_attempts - attempts} attempts left.")
    else:
        print(f"Congratulations! You guessed the number in {attempts} attempts.")
        break

# This executes if the loop completes without a break (player didn't guess correctly)
else:
    print(f"Sorry, you've run out of attempts. The number was {secret_number}.")

print("Thanks for playing!")
```

Lưu cái này dưới dạng `number_guessing_game.py` và chạy nó. Ví dụ này kết hợp nhiều khái niệm mà chúng tôi đã đề cập:

1. Câu lệnh có điều kiện (`if`, `elif`, `else`)
2. Vòng lặp (`while`)
3. Câu lệnh điều khiển vòng lặp (`break`, `continue`)
4. Xử lý ngoại lệ (`try`/`except`)
5. Đầu vào và đầu ra
6. Chuyển đổi loại (`int()`)

## Các bước tiếp theo

Bây giờ bạn đã hiểu luồng điều khiển trong Python, bạn có các công cụ để tạo các chương trình có thể đưa ra quyết định và lặp lại hành động. Trong phần tiếp theo, chúng ta sẽ khám phá hàm, các khối mã có thể tái sử dụng giúp chương trình của bạn trở nên mô-đun hơn và dễ bảo trì hơn.

Chúc mừng mã hóa!
