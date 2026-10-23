---
title: "Tạo và quản lý kho lưu trữ"
order: 2
description: Tìm hiểu cách tạo kho Git mới và sao chép kho lưu trữ hiện có
---

Với Git được cài đặt và định cấu hình, bạn đã sẵn sàng bắt đầu làm việc với các kho lưu trữ. Phần này đề cập đến việc tạo kho lưu trữ, tìm hiểu quy trình làm việc Git cơ bản và tạo commit đầu tiên của bạn.

## Tạo kho lưu trữ Git

Bạn có thể tạo kho lưu trữ Git theo hai cách: khởi tạo kho lưu trữ mới hoặc sao chép kho lưu trữ hiện có.

### Khởi tạo một kho lưu trữ mới

Để tạo kho lưu trữ Git mới trong thư mục dự án của bạn:

1. Điều hướng đến thư mục dự án của bạn:

```bash
cd /path/to/your/project
```

2. Khởi tạo kho lưu trữ:

```bash
git init
```

Điều này tạo ra một thư mục con `.git` chứa tất cả các tệp kho lưu trữ cần thiết – bộ xương của kho lưu trữ Git của bạn.

Sau khi chạy lệnh này, bạn sẽ thấy kết quả tương tự như:

```
Initialized empty Git repository in /path/to/your/project/.git/
```

Các tập tin hiện có của bạn không được theo dõi tự động. Để bắt đầu theo dõi chúng, bạn sẽ cần thêm và commit chúng (được đề cập trong phần tiếp theo).

### Nhân bản một kho lưu trữ hiện có

Nếu bạn muốn lấy bản sao của kho lưu trữ Git hiện có, hãy sử dụng lệnh `git clone`:

```bash
git clone https://github.com/username/repository.git
```

Thao tác này sẽ tạo một thư mục có tên kho lưu trữ, khởi tạo thư mục `.git` bên trong nó, tải xuống tất cả dữ liệu kho lưu trữ và kiểm tra bản sao hoạt động của phiên bản mới nhất.

Để sao chép kho lưu trữ vào một thư mục có tên khác:

```bash
git clone https://github.com/username/repository.git my-project
```

Git hỗ trợ một số giao thức truyền tải:

- HTTPS: `https://github.com/username/repository.git`
- SSH: `git@github.com:username/repository.git`
- Giao thức Git: `git://github.com/username/repository.git`

SSH thường được sử dụng để phát triển vì nó cho phép xác thực an toàn mà không cần nhập thông tin xác thực mỗi lần.

## Cấu trúc kho lưu trữ

Sau khi khởi tạo kho lưu trữ, Git tạo một thư mục `.git` ẩn chứa mọi thứ Git cần để theo dõi dự án của bạn:

- `config`: Cấu hình dành riêng cho kho lưu trữ
- `HEAD`: Tham chiếu đến nhánh hiện tại
- Thông tin `index`: vùng staging
- `objects/`: Cơ sở dữ liệu về tất cả các tệp của bạn và commit
- `refs/`: Con trỏ tới các đối tượng commit (nhánh, thẻ, v.v.)

Nhìn chung, bạn sẽ không tương tác trực tiếp với các tệp này nhưng việc hiểu những gì đang diễn ra ở hậu trường có thể giúp bạn sử dụng Git hiệu quả hơn.

## Tệp .gitignore

Nhiều dự án chứa các tệp mà Git không nên theo dõi, chẳng hạn như:

- Xây dựng artifact
- Thư mục phụ thuộc
- Các tập tin môi trường có bí mật
- Tệp cấu hình dành riêng cho người dùng
- Tệp nhật ký

Bạn có thể yêu cầu Git bỏ qua các tệp này bằng cách tạo tệp `.gitignore`:

```bash
touch .gitignore
```

Chỉnh sửa tệp này để chỉ định mẫu cho tệp bạn muốn bỏ qua:

```
# Compiled files
*.class
*.o
*.pyc

# Logs
*.log
log/

# Build directories
build/
dist/

# Environment-specific files
.env
.env.local
node_modules/
```

Git sẽ không theo dõi bất kỳ tệp nào khớp với các mẫu này. Bản thân tệp `.gitignore` thường phải được Git theo dõi.

## Hiểu trạng thái kho lưu trữ

Mọi tệp trong thư mục làm việc của bạn có thể ở một trong hai trạng thái: được theo dõi hoặc không bị theo dõi.

Các tệp được theo dõi là các tệp mà Git biết. Họ có thể là:

- Chưa sửa đổi: khớp với commit cuối cùng
- Đã sửa đổi: đã thay đổi kể từ commit cuối cùng
- đã đưa vào staging: được đánh dấu để chuyển sang commit tiếp theo của bạn

Các tệp không bị theo dõi là mọi thứ khác – bất kỳ tệp nào trong thư mục làm việc không có trong ảnh chụp nhanh cuối cùng của bạn và không có trong vùng staging của bạn.

Khi bạn chỉnh sửa tệp, Git sẽ xem chúng như đã được sửa đổi. Sau đó, bạn thực hiện các thay đổi này và commit đã đưa vào staging thay đổi và chu trình lặp lại.

## Tóm tắt quy trình làm việc Git cơ bản

Dưới đây là bản tóm tắt nhanh về quy trình làm việc Git cơ bản:

1. Sửa đổi tệp trong thư mục làm việc của bạn
2. Giai đoạn thực hiện các thay đổi bạn muốn đưa vào commit tiếp theo của mình
3. commit đã đưa vào staging thay đổi, tạo ảnh chụp nhanh trong lịch sử kho lưu trữ của bạn

Bây giờ bạn đã hiểu cách tạo kho lưu trữ, hãy chuyển sang theo dõi các thay đổi và tạo commit trong phần tiếp theo.
