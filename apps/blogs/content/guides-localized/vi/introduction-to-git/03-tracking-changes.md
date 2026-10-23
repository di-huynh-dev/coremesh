---
title: "Theo dõi các thay đổi bằng Git"
order: 3
description: Tìm hiểu cách thực hiện các thay đổi theo giai đoạn, tạo commit và hiểu quy trình làm việc Git
---

Bây giờ bạn đã thiết lập kho lưu trữ Git, đã đến lúc tìm hiểu cách theo dõi các thay đổi đối với tệp của bạn. Phần này bao gồm việc kiểm tra trạng thái, các thay đổi của staging, tạo commit và xem lịch sử của bạn.

## Kiểm tra trạng thái kho lưu trữ

Trước khi thực hiện thay đổi, cách tốt nhất là kiểm tra trạng thái kho lưu trữ của bạn:

```bash
git status
```

Điều này cho thấy tệp nào được theo dõi, không bị theo dõi, sửa đổi hoặc đã đưa vào staging. Đây là một trong những lệnh Git được sử dụng nhiều nhất và cung cấp cho bạn bức tranh rõ ràng về những gì đang diễn ra trong kho lưu trữ của bạn.

## Theo dõi tập tin mới

Khi bạn tạo tệp mới trong kho lưu trữ của mình, Git sẽ không tự động theo dõi chúng. Để bắt đầu theo dõi một tập tin mới:

```bash
git add filename.txt
```

Để thêm nhiều tập tin:

```bash
git add file1.txt file2.txt file3.txt
```

Hoặc để thêm tất cả các tệp trong thư mục hiện tại và các thư mục con của nó:

```bash
git add .
```

Điều này sẽ xử lý các tệp cho commit. Bạn có thể xác minh điều này bằng `git status`, giờ đây sẽ hiển thị các tệp trong phần "Thay đổi thành đã commit".

## Tìm hiểu vùng staging

vùng staging (hoặc "chỉ mục") là một khái niệm quan trọng trong Git. Đây là khu vực chuẩn bị nơi bạn sắp xếp những gì sẽ có trong commit tiếp theo của mình.

Hãy coi nó như một bến bốc hàng nơi bạn chuẩn bị hàng hóa để vận chuyển. Bạn có thể:

- Thêm tệp vào vùng staging (`git add`)
- Xóa tệp khỏi vùng staging (`git reset`)
- Xem lại những gì có trong vùng staging (`git status`)

staging chỉ cho phép bạn commit một số thay đổi trong khi giữ những thay đổi khác cho một commit khác, cho phép bạn tạo commit rõ ràng, hợp lý.

### Staging Các phần của tệp

Đôi khi bạn chỉ muốn thực hiện một số thay đổi trong một tệp chứ không phải tất cả chúng. Bạn có thể làm điều này với:

```bash
git add -p filename.txt
```

Thao tác này sẽ hỏi bạn một cách tương tác những phần ("các phần") của tệp sẽ được chuyển sang giai đoạn, cung cấp cho bạn các tùy chọn như:

- `y`: giai đoạn này
- `n`: đừng diễn đoạn này
- `s`: chia khối thành các khối nhỏ hơn
- `q`: thoát ra, không dàn dựng phần này hoặc bất kỳ phần nào còn lại
- `?`: trợ giúp hiển thị

## Làm commit

Sau khi đã đưa vào staging thay đổi xong, bạn có thể commit đưa chúng vào kho lưu trữ của mình:

```bash
git commit -m "Add initial project files"
```

Cờ `-m` cho phép bạn thêm thông báo commit trực tiếp trên dòng lệnh. Tin nhắn của bạn nên mô tả ngắn gọn những thay đổi trong commit.

Để biết thông báo commit chi tiết hơn, hãy bỏ qua cờ `-m`:

```bash
git commit
```

Thao tác này sẽ mở trình soạn thảo văn bản đã định cấu hình của bạn, nơi bạn có thể viết tin nhắn chi tiết hơn.

### Thực hành tin nhắn commit tốt

Một thông báo commit tốt tuân theo các nguyên tắc sau:

1. Dòng tóm tắt ngắn gọn, mang tính mô tả (50 ký tự trở xuống)
2. Dòng trống tùy chọn, theo sau là lời giải thích chi tiết hơn
3. Viết theo thể mệnh lệnh ("Thêm tính năng", không phải "Thêm tính năng")
4. Giải thích cái gì và tại sao, không phải như thế nào (mã hiển thị như thế nào)

Ví dụ về tin nhắn commit hay:

```
Add user authentication feature

- Implement login/logout functionality
- Set up password hashing with bcrypt
- Add session management

This addresses security requirements in issue #42
```

### Các phím tắt cho staging và Cam kết

Để tạo giai đoạn và commit tất cả các tệp đã sửa đổi trong một bước:

```bash
git commit -a -m "Update configuration files"
```

Cờ `-a` tự động xử lý tất cả các tệp được theo dõi đã sửa đổi (nhưng không phải tệp mới).

## Xem thay đổi

Để xem bạn đã thực hiện những thay đổi nào nhưng chưa có đã đưa vào staging:

```bash
git diff
```

Để xem đã đưa vào staging của bạn có những gì sẽ có trong commit tiếp theo của bạn:

```bash
git diff --staged
```

Các lệnh này hiển thị chính xác các dòng được thêm và xóa, rất hữu ích để xem lại các thay đổi của bạn trước khi thực hiện chúng.

## Xóa tập tin

Để xóa tệp khỏi Git và thư mục làm việc của bạn:

```bash
git rm filename.txt
```

Để xóa một tệp khỏi Git nhưng giữ tệp đó trong thư mục làm việc của bạn (hữu ích cho các tệp bạn vô tình bắt đầu theo dõi):

```bash
git rm --cached filename.txt
```

Đừng quên thêm tệp vào `.gitignore` nếu bạn muốn nó không bị theo dõi.

## Di chuyển và đổi tên tập tin

Để di chuyển hoặc đổi tên một tập tin:

```bash
git mv old_filename.txt new_filename.txt
```

Điều này tương đương với:

```bash
mv old_filename.txt new_filename.txt
git rm old_filename.txt
git add new_filename.txt
```

## Xem lịch sử commit

Để xem lịch sử commit của bạn:

```bash
git log
```

Điều này hiển thị mỗi commit với:

- Tổng kiểm tra SHA-1 (mã định danh duy nhất)
- Tên tác giả và email
- Ngày và giờ
- Tin nhắn commit

Để có cái nhìn ngắn gọn hơn:

```bash
git log --oneline
```

Hoặc để xem các thay đổi trong mỗi commit:

```bash
git log -p
```

Để xem số liệu thống kê cho từng commit:

```bash
git log --stat
```

Để trực quan hóa lịch sử commit bằng biểu đồ:

```bash
git log --graph --oneline --all
```

## Hoàn tác mọi thứ

Git cung cấp một số cách để hoàn tác các thay đổi:

### Sửa đổi commit cuối cùng

Nếu bạn mắc lỗi trong commit gần đây nhất của mình hoặc quên đưa vào một số thay đổi:

```bash
git commit --amend
```

Điều này thay thế cái cuối cùng commit với một cái mới bao gồm cả những thay đổi so với cái trước đó commit và bất kỳ đã đưa vào staging những thay đổi bạn có bây giờ.

### Tập tin hủy tổ chức

Nếu bạn có một tệp đã đưa vào staging nhưng muốn hủy phân đoạn tệp đó:

```bash
git restore --staged filename.txt
```

Trong các phiên bản Git cũ hơn:

```bash
git reset HEAD filename.txt
```

### Loại bỏ các thay đổi

Để loại bỏ các thay đổi trong thư mục làm việc của bạn và hoàn nguyên về phiên bản đã commit cuối cùng:

```bash
git restore filename.txt
```

Trong các phiên bản Git cũ hơn:

```bash
git checkout -- filename.txt
```

> ⚠️ **Warning**: Thao tác này không thể hoàn tác. Mọi thay đổi cục bộ sẽ bị mất.

## Gắn thẻ

Thẻ là các tham chiếu trỏ đến các điểm cụ thể trong lịch sử Git, thường được sử dụng để đánh dấu các phiên bản phát hành.

Để tạo một thẻ nhẹ:

```bash
git tag v1.0.0
```

Để tạo thẻ chú thích kèm theo tin nhắn:

```bash
git tag -a v1.0.0 -m "Version 1.0.0 release"
```

Để liệt kê tất cả các thẻ:

```bash
git tag
```

Để hiển thị thông tin về một thẻ cụ thể:

```bash
git show v1.0.0
```

Bằng cách tìm hiểu các lệnh Git cơ bản này để theo dõi các thay đổi, bạn sẽ có thể duy trì lịch sử rõ ràng và được ghi chép đầy đủ về dự án của mình. Trong phần tiếp theo, chúng ta sẽ khám phá tính năng phân nhánh, cho phép bạn làm việc song song trên nhiều tính năng hoặc sửa lỗi.
