---
title: "Khái niệm cơ bản về phân nhánh"
order: 4
description: Tạo và quản lý các nhánh Git để phát triển song song. Bao gồm nhánh git, thanh toán, chuyển đổi, các tính năng cô lập và mô hình tinh thần đằng sau con trỏ nhánh.
---

Một trong những tính năng mạnh mẽ nhất của Git là hệ thống phân nhánh của nó. Các nhánh cho phép bạn tách khỏi dòng phát triển chính và làm việc trên các tính năng hoặc bản sửa lỗi khác nhau một cách riêng biệt mà không ảnh hưởng đến cơ sở mã chính.

## Hiểu các nhánh

Một nhánh trong Git chỉ đơn giản là một con trỏ di chuyển nhẹ tới commit. Nhánh mặc định trong Git được gọi là `main` (trước đây là `master`). Mỗi khi bạn commit, con trỏ nhánh sẽ tự động di chuyển về phía commit mới nhất của bạn.

Hãy coi các nhánh là không gian làm việc riêng biệt, nơi bạn có thể phát triển các tính năng một cách độc lập trước khi hợp nhất chúng lại với nhau.

## Tại sao nên sử dụng chi nhánh?

Các nhánh phục vụ một số mục đích quan trọng:

- **Isolation**: Phát triển các tính năng mới mà không ảnh hưởng đến cơ sở mã ổn định
- **EExperimentation**: Thử nghiệm ý tưởng mà không cần cam kết
- **Phát triển song song**: Nhiều nhà phát triển có thể làm việc đồng thời trên các tính năng khác nhau
- **Organization**: Tách công việc theo tính năng, sửa lỗi hoặc phát hành

## Tạo chi nhánh

Để tạo một chi nhánh mới:

```bash
git branch feature-login
```

Điều này tạo ra một con trỏ nhánh mới tại commit hiện tại của bạn nhưng không chuyển sang nó. Để tạo một nhánh và chuyển sang nhánh đó ngay lập tức:

```bash
git checkout -b feature-login
```

Lệnh trên tương đương với:

```bash
git branch feature-login
git checkout feature-login
```

Với các phiên bản Git mới hơn (2.23+), bạn có thể sử dụng cú pháp trực quan hơn:

```bash
git switch -c feature-login
```

## Chi nhánh niêm yết

Để xem tất cả các chi nhánh địa phương:

```bash
git branch
```

Nhánh hiện tại sẽ được đánh dấu bằng dấu hoa thị (\*).

Để xem tất cả các nhánh, bao gồm cả các nhánh từ xa:

```bash
git branch -a
```

Để xem commit cuối cùng trên mỗi nhánh:

```bash
git branch -v
```

## Chuyển đổi giữa các chi nhánh

Để chuyển sang một chi nhánh hiện có:

```bash
git checkout branch-name
```

Hoặc với cú pháp mới hơn:

```bash
git switch branch-name
```

Khi bạn chuyển nhánh, Git sẽ cập nhật các tệp trong thư mục làm việc của bạn để khớp với ảnh chụp nhanh của nhánh bạn đã chuyển sang. Điều này có nghĩa là thư mục làm việc của bạn sẽ trông khác sau khi chuyển nhánh.

### Chuyển đổi với những thay đổi chưa được cam kết

Nếu bạn có những thay đổi không được cam kết khi cố gắng chuyển nhánh, Git sẽ:

1. Cho phép bạn chuyển đổi nếu những thay đổi không xung đột với các tệp trong nhánh mục tiêu
2. Ngăn bạn chuyển đổi nếu các thay đổi sẽ bị ghi đè

Nếu bạn muốn chuyển nhánh nhưng chưa sẵn sàng với commit những thay đổi của mình, bạn có thể sử dụng tính năng stash của Git:

```bash
git stash save "Work in progress on feature X"
git checkout other-branch
```

Để lấy lại các thay đổi của bạn sau này:

```bash
git checkout original-branch
git stash pop
```

## Làm việc với các chi nhánh

Sau khi tạo một nhánh, bạn làm việc với nó giống như mọi môi trường Git khác:

1. Thực hiện thay đổi đối với tập tin của bạn
2. Thay đổi giai đoạn với `git add`
3. commit thay đổi với `git commit`

Mỗi commit trên nhánh của bạn được xây dựng dựa trên cái trước đó, tạo ra một dòng phát triển riêng.

### Ví dụ về quy trình làm việc của chi nhánh

Đây là quy trình làm việc điển hình với các nhánh:

```bash
# Create and switch to a feature branch
git checkout -b feature-user-profiles

# Make changes and commit them
echo "<h1>User Profile</h1>" > profile.html
git add profile.html
git commit -m "Add user profile page"

# Make more changes
echo "<div class='profile-content'></div>" >> profile.html
git add profile.html
git commit -m "Add content container to profile page"

# Switch back to main branch when done
git checkout main
```

## Quy ước đặt tên chi nhánh

Sử dụng quy ước đặt tên nhánh nhất quán giúp giữ cho kho lưu trữ của bạn được ngăn nắp:

- **Các nhánh đặc trưng**: `feature/feature-name` hoặc `feature-name`
- **Sửa lỗi nhánh**: `bugfix/issue-description` hoặc `fix-issue-description`
- **Phát hành các nhánh**: `release/version-number`
- **Các nhánh sửa lỗi**: `hotfix/issue-description`

Chọn một quy ước phù hợp với nhóm của bạn và tuân theo nó.

## Hình dung các nhánh

Để xem biểu diễn đồ họa của cấu trúc nhánh của bạn:

```bash
git log --graph --oneline --all
```

Lệnh này hiển thị biểu đồ dựa trên văn bản về lịch sử commit của bạn trên tất cả các nhánh.

Để có cái nhìn tập trung hơn về chi nhánh hiện tại và mối quan hệ của nó với các chi nhánh khác:

```bash
git log --graph --oneline --all --decorate
```

## Xóa chi nhánh

Sau khi sáp nhập một nhánh, bạn thường muốn xóa nó để giữ kho lưu trữ của mình sạch sẽ:

```bash
git branch -d feature-login
```

Nếu nhánh chưa được sáp nhập hoàn toàn, Git sẽ ngăn việc xóa nhánh đó. Để buộc xóa một nhánh chưa hợp nhất:

```bash
git branch -D feature-login
```

> ⚠️ **Warning**: Buộc xóa một nhánh sẽ loại bỏ mọi công việc chưa được hợp nhất, vì vậy hãy cẩn thận.

## Đổi tên chi nhánh

Để đổi tên chi nhánh bạn đang làm việc:

```bash
git branch -m new-branch-name
```

Để đổi tên một chi nhánh mà bạn hiện không sử dụng:

```bash
git branch -m old-branch-name new-branch-name
```

## Di chuyển giữa commit

Các nhánh trỏ đến commit, nhưng đôi khi bạn muốn kiểm tra trực tiếp một commit cụ thể:

```bash
git checkout commit-hash
```

Điều này sẽ đưa bạn vào trạng thái "tách rời", nơi bạn không thuộc bất kỳ chi nhánh nào. Điều này rất hữu ích để kiểm tra các phiên bản cũ của mã của bạn.

Để tạo một nhánh mới từ trạng thái này:

```bash
git checkout -b new-branch-name
```

## Commit tạm thời có Stash

Đôi khi bạn cần chuyển nhánh nhưng chưa sẵn sàng để commit thay đổi. Tính năng lưu trữ của Git cho phép bạn lưu tạm thời các thay đổi mà không cần thực hiện:

```bash
git stash
```

Để áp dụng stash gần đây nhất và xóa nó khỏi danh sách stash:

```bash
git stash pop
```

Để liệt kê tất cả các stash:

```bash
git stash list
```

Để áp dụng một stash cụ thể:

```bash
git stash apply stash@{2}
```

Stash rất hữu ích để nhanh chóng chuyển đổi ngữ cảnh mà không tạo commit không cần thiết.

## Thực tiễn tốt nhất để phân nhánh

- **Giữ các nhánh tập trung**: Mỗi nhánh phải đại diện cho một tính năng hoặc một bản sửa lỗi duy nhất
- **Hợp nhất thường xuyên từ main**: Cập nhật các nhánh tính năng của bạn với các thay đổi từ chính để giảm xung đột hợp nhất
- **DXóa các nhánh đã hợp nhất**: Giữ kho lưu trữ của bạn sạch sẽ bằng cách xóa các nhánh sau khi hợp nhất
- **Sử dụng tên mô tả**: Tên chi nhánh phải cho biết công việc đang được thực hiện
- **Branch từ base** thích hợp: Tạo các nhánh từ điểm bắt đầu thay đổi

Với những kiến thức cơ bản về phân nhánh này, giờ đây bạn đã được trang bị để làm việc song song trên nhiều tính năng mà không ảnh hưởng đến cơ sở mã chính của mình. Trong phần tiếp theo, chúng ta sẽ khám phá cách hợp nhất các nhánh và giải quyết xung đột.
