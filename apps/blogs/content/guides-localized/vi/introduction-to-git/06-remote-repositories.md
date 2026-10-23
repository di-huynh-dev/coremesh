---
title: "Làm việc với kho lưu trữ từ xa"
order: 6
description: Tìm hiểu cách sử dụng GitHub, GitLab và các nền tảng khác để cộng tác trên mã
---

Cho đến nay, chúng tôi đã tập trung vào việc sử dụng Git cục bộ. Tuy nhiên, một trong những điểm mạnh nhất của Git là khả năng làm việc với các kho lưu trữ từ xa, cho phép cộng tác với những người khác. Trong phần này, chúng ta sẽ khám phá cách làm việc với các kho lưu trữ từ xa như các kho lưu trữ được lưu trữ trên GitHub, GitLab và Bitbucket.

## Hiểu kho lưu trữ từ xa

Kho lưu trữ từ xa là phiên bản dự án của bạn được lưu trữ trên internet hoặc mạng. Bạn có thể có nhiều kho lưu trữ từ xa, thường có quyền truy cập đọc hoặc đọc/ghi. Kho lưu trữ từ xa rất cần thiết cho:

- Hợp tác với người khác
- Đóng góp cho các dự án nguồn mở
- Sao lưu mã của bạn
- Triển khai ứng dụng của bạn

Các dịch vụ lưu trữ kho lưu trữ từ xa phổ biến bao gồm:

- GitHub
- GitLab
- Bitbucket
- Azure DevOps

## Xem kho lưu trữ từ xa

Để xem bạn đã cấu hình máy chủ từ xa nào:

```bash
git remote
```

Phần này hiển thị tên viết tắt của từng bộ điều khiển từ xa mà bạn đã chỉ định. Nếu bạn sao chép một kho lưu trữ, bạn sẽ thấy `origin` theo mặc định.

Để xem thêm chi tiết:

```bash
git remote -v
```

Điều này hiển thị các URL mà Git đã lưu trữ cho mỗi điều khiển từ xa:

```
origin  https://github.com/username/project.git (fetch)
origin  https://github.com/username/project.git (push)
```

## Thêm kho lưu trữ từ xa

Để thêm kho lưu trữ từ xa mới:

```bash
git remote add <shortname> <url>
```

Ví dụ:

```bash
git remote add origin https://github.com/username/project.git
```

Bạn có thể sử dụng bất kỳ tên viết tắt nào bạn thích thay vì "origin".

## Tìm nạp từ kho lưu trữ từ xa

Để lấy dữ liệu từ kho lưu trữ từ xa:

```bash
git fetch <remote>
```

Thao tác này tải xuống tất cả các nhánh và dữ liệu từ kho lưu trữ từ xa nhưng không hợp nhất nó vào các tệp đang làm việc của bạn. Ví dụ:

```bash
git fetch origin
```

Lệnh này chỉ tải dữ liệu xuống kho lưu trữ cục bộ của bạn; nó không tự động hợp nhất nó với công việc của bạn hoặc sửa đổi những gì bạn đang làm.

## Kéo từ kho lưu trữ từ xa

Để tìm nạp và tự động hợp nhất các thay đổi từ xa:

```bash
git pull <remote> <branch>
```

Ví dụ: để kéo từ nhánh `main` của điều khiển từ xa `origin`:

```bash
git pull origin main
```

Điều này tương đương với:

```bash
git fetch origin
git merge origin/main
```

Nếu bạn đã thiết lập tính năng theo dõi (sẽ nói thêm về điều này sau), bạn chỉ cần sử dụng:

```bash
git pull
```

## Đẩy vào kho lưu trữ từ xa

Sau khi bạn đã tạo commit cục bộ, bạn có thể đẩy chúng vào kho lưu trữ từ xa:

```bash
git push <remote> <branch>
```

Ví dụ:

```bash
git push origin main
```

Nếu không có ai khác đẩy kể từ lần cuối bạn tìm nạp, lần đẩy của bạn sẽ thành công. Nếu người khác đã đẩy trong lúc đó, lần đẩy của bạn sẽ bị từ chối. Trước tiên, bạn cần kéo các thay đổi của chúng, tích hợp chúng với thay đổi của bạn rồi thử đẩy lại.

### Đẩy một chi nhánh mới

Để đẩy một nhánh mới vào kho lưu trữ từ xa:

```bash
git push -u origin feature-branch
```

Cờ `-u` (hoặc `--set-upstream`) thiết lập theo dõi, giúp đơn giản hóa các lệnh đẩy và kéo trong tương lai.

## Làm việc với các chi nhánh từ xa

Các nhánh từ xa là các tham chiếu đến trạng thái của các nhánh trong kho lưu trữ từ xa của bạn. Chúng được đặt tên theo mẫu `<remote>/<branch>`:

- `origin/main`: Nhánh chính trên remote gốc
- `upstream/develop`: Nhánh phát triển trên điều khiển từ xa ngược dòng

Các nhánh theo dõi từ xa này là các tham chiếu cục bộ mà bạn không thể di chuyển; Git tự động di chuyển chúng khi bạn liên lạc với kho lưu trữ từ xa.

### Xem các chi nhánh từ xa

Để xem tất cả các nhánh từ xa:

```bash
git branch -r
```

Để xem cả chi nhánh địa phương và từ xa:

```bash
git branch -a
```

### Thiết lập các nhánh theo dõi

Các nhánh theo dõi là các nhánh cục bộ có mối quan hệ trực tiếp với một nhánh ở xa. Khi bạn sao chép kho lưu trữ, Git sẽ tự động tạo nhánh `main` để theo dõi `origin/main`.

Để tạo một nhánh theo dõi mới:

```bash
git checkout -b feature-branch origin/feature-branch
```

Hoặc viết tắt:

```bash
git checkout --track origin/feature-branch
```

Với các phiên bản Git mới hơn:

```bash
git switch -c feature-branch --track origin/feature-branch
```

Khi bạn đã thiết lập nhánh theo dõi, bạn có thể sử dụng các lệnh đơn giản hóa:

```bash
git pull  # Equivalent to git pull origin feature-branch
git push  # Equivalent to git push origin feature-branch
```

### Xóa các nhánh từ xa

Để xóa một nhánh từ xa:

```bash
git push origin --delete feature-branch
```

Hoặc cú pháp cũ hơn:

```bash
git push origin :feature-branch
```

## Làm việc với GitHub và các nền tảng tương tự

Trong khi Git cung cấp hệ thống kiểm soát phiên bản phân tán, các nền tảng như GitHub, GitLab và Bitbucket bổ sung thêm các tính năng bổ sung:

- Giao diện web cho kho lưu trữ
- Kéo/merge request để xem lại mã
- Theo dõi vấn đề
- Công cụ quản lý dự án
- Hành động/CI cho tự động hóa
- Wiki và tài liệu
- Quét bảo mật mã

### Thiết lập xác thực SSH

HTTPS đơn giản nhưng yêu cầu nhập thông tin xác thực thường xuyên. SSH cung cấp một phương pháp thuận tiện và an toàn hơn:

1. Tạo khóa SSH:

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
```

2. Thêm khóa vào tác nhân SSH của bạn:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

3. Thêm khóa chung vào tài khoản GitHub/GitLab của bạn (trong Cài đặt > Khóa SSH)

4. Kiểm tra kết nối của bạn:

```bash
ssh -T git@github.com
```

5. Cập nhật URL từ xa của bạn để sử dụng SSH:

```bash
git remote set-url origin git@github.com:username/repository.git
```

### Tạo kho lưu trữ trên GitHub

Để tạo kho lưu trữ mới trên GitHub và đẩy kho lưu trữ cục bộ của bạn:

1. Tạo kho lưu trữ trên GitHub (không cần khởi tạo nó)
2. Kết nối kho lưu trữ cục bộ của bạn:

```bash
git remote add origin git@github.com:username/repository.git
```

3. Đẩy mã của bạn:

```bash
git push -u origin main
```

## Làm việc với fork

Khi đóng góp cho các dự án nguồn mở, bạn thường làm việc với fork, bản sao cá nhân của kho lưu trữ của người dùng khác.

### Thiết lập fork

1. fork kho lưu trữ trên GitHub/GitLab (sử dụng giao diện web)
2. Sao chép fork của bạn:

```bash
git clone https://github.com/your-username/project.git
```

3. Thêm kho lưu trữ ban đầu dưới dạng điều khiển từ xa có tên là "ngược dòng":

```bash
git remote add upstream https://github.com/original-owner/project.git
```

### Luôn cập nhật fork của bạn

Để cập nhật fork của bạn với những thay đổi từ kho lưu trữ ban đầu:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

Hoặc ngắn gọn hơn:

```bash
git pull upstream main
```

Sau đó đẩy các thay đổi vào fork của bạn:

```bash
git push origin main
```

## Pull request / merge request

pull request (PR) hoặc merge request (MR) là cách bạn đề xuất thay đổi cho một dự án. Đây là các tính năng giao diện web, không phải lệnh Git.

### Tạo pull request (Quy trình làm việc chung)

1. Tạo một nhánh cho tính năng của bạn:

```bash
git checkout -b feature-user-profiles
```

2. Thực hiện các thay đổi của bạn:

```bash
# Make changes to files
git add changed-files
git commit -m "Implement user profiles feature"
```

3. Đẩy chi nhánh của bạn vào điều khiển từ xa:

```bash
git push origin feature-user-profiles
```

4. Đi tới dịch vụ lưu trữ (GitHub, GitLab, v.v.) và tạo pull request thông qua giao diện web.

### Các phương pháp hay nhất về pull request

- Đặt tiêu đề PR rõ ràng, mang tính mô tả
- Bao gồm chi tiết về những thay đổi trong mô tả
- Tham khảo các vấn đề liên quan với từ khóa như "Sửa lỗi #123"
- Giữ PR tập trung vào một tính năng duy nhất hoặc sửa lỗi
- Sử dụng PR dự thảo cho công việc đang tiến hành
- Trả lời kịp thời để xem xét ý kiến

## Xử lý xung đột trong quy trình làm việc từ xa

Khi nhiều người làm việc trên cùng một cơ sở mã, xung đột có thể xảy ra. Đây là cách xử lý chúng:

1. Hãy thử kéo những thay đổi mới nhất:

```bash
git pull origin main
```

2. Nếu xung đột xảy ra, hãy giải quyết chúng:

   - Chỉnh sửa các tập tin xung đột
   - Sắp xếp các tệp đã giải quyết với `git add`
   - commit sự hợp nhất đã được giải quyết

3. Đẩy các thay đổi của bạn:

```bash
git push origin main
```

Để giảm xung đột:

- Kéo thường xuyên
- Giao tiếp với đồng đội
- Làm việc trên các tệp hoặc phần khác nhau khi có thể
- Giữ commit tập trung và nhỏ gọn

## Các phương pháp hay nhất để cộng tác từ xa

- **Đẩy và kéo thường xuyên**: Luôn đồng bộ hóa với nhóm của bạn
- **Sử dụng các nhánh cho các tính năng**: Giữ nhánh chính sạch sẽ
- **Viết tin nhắn commit hay**: Giúp người khác hiểu những thay đổi của bạn
- **Sử dụng pull request để đánh giá mã**: Nhận phản hồi trước khi hợp nhất
- ** Luôn cập nhật các nhánh địa phương**: Thường xuyên kéo từ thượng nguồn
- **Hiểu mô hình mạng của Git**: Biết cách các kho lưu trữ cục bộ và từ xa tương tác với nhau

Với những kỹ năng lưu trữ từ xa này, giờ đây bạn đã được trang bị để cộng tác hiệu quả với những người khác trong các dự án Git. Trong phần tiếp theo, chúng ta sẽ khám phá các quy trình làm việc cộng tác đã được thiết lập.
