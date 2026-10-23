---
title: "Lịch sử Git và du hành thời gian"
order: 8
description: Tìm hiểu cách điều hướng, kiểm tra và sửa đổi lịch sử dự án của bạn
---

Một trong những tính năng mạnh mẽ nhất của Git là theo dõi lịch sử của nó. Trong phần này, chúng ta sẽ khám phá cách điều hướng qua lịch sử dự án của bạn, kiểm tra các thay đổi theo thời gian và thậm chí viết lại lịch sử khi cần thiết.

## Khám phá lịch sử Git của bạn

### Xem lịch sử commit

Lệnh cơ bản để xem lịch sử là:

```bash
git log
```

Điều này hiển thị danh sách commit với:

- Hàm băm SHA-1 (ID commit)
- tác giả
- Ngày
- Tin nhắn commit

Để có cái nhìn nhỏ gọn hơn:

```bash
git log --oneline
```

Điều này hiển thị mỗi commit trên một dòng với hàm băm rút ngắn.

### Trực quan hóa lịch sử chi nhánh

Để xem biểu diễn đồ họa về lịch sử chi nhánh của bạn:

```bash
git log --graph --oneline --all
```

Điều này cho thấy các nhánh và sự hợp nhất có liên quan với nhau như thế nào. Thêm `--decorate` hiển thị các tham chiếu nhánh và thẻ:

```bash
git log --graph --oneline --all --decorate
```

### Lịch sử lọc

Bạn có thể lọc nhật ký để chỉ hiển thị những gì bạn quan tâm:

Theo ngày:

```bash
git log --after="2023-01-01" --before="2023-02-01"
```

Theo tác giả:

```bash
git log --author="Jane Smith"
```

Theo nội dung:

```bash
git log -S"login" # Commits that add or remove the string "login"
```

Theo tập tin:

```bash
git log -- path/to/file.js
```

Theo nội dung tin nhắn:

```bash
git log --grep="fix bug"
```

### Xem các thay đổi trong commit

Để xem những thay đổi được giới thiệu trong mỗi commit:

```bash
git log -p
```

Để có bản tóm tắt thống kê về các thay đổi:

```bash
git log --stat
```

Để xem các thay đổi cho một tệp cụ thể:

```bash
git log -p -- path/to/file.js
```

### Xem commit cụ thể

Để hiển thị một commit:

```bash
git show commit-hash
```

Để xem phiên bản cụ thể của tệp:

```bash
git show commit-hash:path/to/file.js
```

## Thời gian du hành qua mã của bạn

### Kiểm tra các phiên bản trước

Để tạm thời chuyển sang trạng thái trước đó trong dự án của bạn:

```bash
git checkout commit-hash
```

Điều này đưa bạn vào một trạng thái "tách rời", nơi bạn có thể nhìn xung quanh nhưng những thay đổi sẽ không được lưu vào bất kỳ nhánh nào.

Để kiểm tra một tệp cụ thể từ commit trước đó:

```bash
git checkout commit-hash -- path/to/file.js
```

Thao tác này sẽ thêm phiên bản cũ của tệp vào vùng staging của bạn.

### Làm việc với Thẻ

Thẻ được đặt tên tham chiếu đến commit cụ thể, thường được sử dụng cho các bản phát hành:

Tạo một thẻ nhẹ:

```bash
git tag v1.0.0
```

Tạo thẻ chú thích bằng tin nhắn:

```bash
git tag -a v1.0.0 -m "Version 1.0.0 release"
```

Thẻ danh sách:

```bash
git tag
```

Kiểm tra một thẻ:

```bash
git checkout v1.0.0
```

### So sánh các phiên bản khác nhau

Để thấy sự khác biệt giữa hai commit:

```bash
git diff commit1..commit2
```

Để xem sự khác biệt cho một tệp cụ thể:

```bash
git diff commit1..commit2 -- path/to/file.js
```

Để so sánh các nhánh:

```bash
git diff main..feature-branch
```

## Gỡ lỗi với Lịch sử Git

### Tìm lỗi với git bisect

Git bisect sử dụng tìm kiếm nhị phân để tìm ra commit nào đã gây ra lỗi:

```bash
# Start the bisect process
git bisect start

# Mark the current commit as bad
git bisect bad

# Mark a known good commit
git bisect good a1b2c3d4

# Git will checkout a commit halfway between good and bad
# Test your code, then mark it:
git bisect good  # Or git bisect bad

# Continue until Git identifies the first bad commit
# When done, reset to your original branch
git bisect reset
```

Điều này có thể tiết kiệm hàng giờ gỡ lỗi bằng cách thu hẹp chính xác thời điểm lỗi được đưa ra.

### Tìm ai đã thay đổi một dòng

Để xem ai đã sửa đổi lần cuối từng dòng của tệp:

```bash
git blame filename.txt
```

Phần này hiển thị hàm băm commit, tác giả, ngày tháng và nội dung cho mỗi dòng. Nó rất hữu ích để hiểu tại sao mã được viết theo một cách nhất định.

Để biết thêm ngữ cảnh, hãy sử dụng cờ `-C` để phát hiện mã được di chuyển từ các tệp khác:

```bash
git blame -C filename.txt
```

## Khôi phục công việc bị mất

### Sử dụng Relog

Git lưu giữ một bản ghi về vị trí các tham chiếu HEAD và nhánh của bạn trong 30 ngày qua trong reflog:

```bash
git reflog
```

Điều này giúp bạn tìm thấy các hàm băm commit mà bạn có thể đã đánh mất thông qua các thao tác như đặt lại hoặc khởi động lại.

Để khôi phục commit bị mất:

```bash
git checkout -b recovery-branch commit-hash
```

### Khôi phục các nhánh đã xóa

Nếu bạn vô tình xóa một nhánh, bạn có thể khôi phục nó bằng cách sử dụng reflog:

```bash
# Find the commit at the tip of the deleted branch
git reflog

# Create a new branch at that commit
git checkout -b recovered-branch commit-hash
```

### Khôi phục các thay đổi chưa được cam kết

Nếu bạn vô tình loại bỏ các thay đổi với `git checkout -- file`:

1. Kiểm tra xem các thay đổi có trong kho không:

   ```bash
   git stash list
   git stash apply
   ```

2. Trên một số hệ thống, lịch sử cục bộ của IDE có thể đã lưu một bản sao

3. Thật không may, những thay đổi thực sự chưa được thực hiện và chưa được cam kết đã bị loại bỏ không thể được phục hồi bằng Git

## Viết lại lịch sử

> ⚠️ **Warning**: Việc viết lại lịch sử nên được thực hiện một cách thận trọng, đặc biệt nếu commit đã được đẩy vào kho lưu trữ dùng chung.

### Sửa đổi commit cuối cùng

Để sửa đổi commit gần đây nhất của bạn:

```bash
git commit --amend
```

Thao tác này sẽ mở trình chỉnh sửa để thay đổi thông báo commit. Để bao gồm các thay đổi đã đưa vào staging trong commit đã sửa đổi:

```bash
git add .
git commit --amend
```

Để giữ cùng một tin nhắn:

```bash
git commit --amend --no-edit
```

### Sắp xếp lại và sửa đổi commit với Rebase tương tác

Rebase tương tác cho phép bạn sửa đổi một loạt commit:

```bash
git rebase -i HEAD~3  # Modify the last 3 commits
```

Thao tác này sẽ mở trình chỉnh sửa có danh sách commit. Bạn có thể:

- `pick` - giữ commit
- `reword` - thay đổi thông báo commit
- `edit` - dừng và sửa đổi commit
- `squash` - kết hợp với commit trước đó
- `fixup` - kết hợp với commit trước đó, loại bỏ tin nhắn
- `drop` - loại bỏ commit

Ví dụ: để kết hợp ba commit thành một:

```
pick 1a2b3c4 Add user authentication
squash 2b3c4d5 Fix login form styling
squash 3c4d5e6 Add password validation
```

Lưu và đóng trình chỉnh sửa và Git sẽ kết hợp commit.

### Tách commit

Để chia commit thành nhiều commit:

```bash
git rebase -i HEAD~3
# Change "pick" to "edit" for the commit you want to split
# Save and close

# Reset that commit but keep the changes in your working directory
git reset HEAD^

# Now add and commit the changes in smaller logical chunks
git add file1.js
git commit -m "First part of the feature"
git add file2.js
git commit -m "Second part of the feature"

# Continue the rebase
git rebase --continue
```

### Xóa dữ liệu nhạy cảm

Nếu bạn vô tình sử dụng dữ liệu nhạy cảm của đã commit:

```bash
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch path/to/sensitive-file" --prune-empty --tag-name-filter cat -- --all
```

Đối với các kho lưu trữ lớn hơn, hãy cân nhắc sử dụng BFG Repo-Cleaner, cách này nhanh hơn và đơn giản hơn.

> **Quan trọng**: Sau khi xóa dữ liệu nhạy cảm, bạn sẽ cần phải ép buộc các thay đổi. Ngoài ra, hãy lưu ý rằng dữ liệu có thể vẫn tồn tại trong các bản sao của kho lưu trữ của bạn.

## Các phương pháp hay nhất để quản lý lịch sử

### Khi nào nên viết lại lịch sử

**Thời điểm thích hợp để viết lại lịch sử**:

- Trước khi đẩy commit vào kho lưu trữ chung
- Trong một chi nhánh cá nhân chỉ có bạn đang làm việc
- Để dọn dẹp commit của bạn trước khi tạo pull request
- Để xóa thông tin nhạy cảm

**Khi KHÔNG viết lại lịch sử**:

- Sau khi đẩy tới kho lưu trữ được chia sẻ
- Trên các nhánh mà người khác đang làm việc
- Trên `main` hoặc các nhánh quan trọng khác
- Nếu bạn không chắc chắn về việc mình đang làm

### Giữ một lịch sử trong sạch

Lịch sử commit rõ ràng, có ý nghĩa giúp bạn dễ hiểu hơn về quá trình phát triển của dự án:

- Viết tin nhắn commit mô tả
- Làm cho mỗi commit thể hiện một sự thay đổi hợp lý
- Bíp "đang tiến hành" commit trước khi hợp nhất
- Rebase các nhánh tính năng trên `main` trước khi hợp nhất
- Sử dụng các chiến lược hợp nhất để duy trì lịch sử rõ ràng

### Xử lý lịch sử công khai

Đối với các kho lưu trữ công cộng hoặc các nhánh dùng chung:

- Tránh viết lại lịch sử đã bị đẩy
- Sử dụng `git revert` để hoàn tác các thay đổi thay vì viết lại
- Hãy cân nhắc sử dụng pull request để đánh giá thay vì buộc phải xóa lịch sử
- Ghi lại những thay đổi đáng kể trong thông báo và ghi chú phát hành commit

## Kỹ thuật lịch sử nâng cao

### Hái anh đào

Để áp dụng commit cụ thể từ nhánh này sang nhánh khác:

```bash
git cherry-pick commit-hash
```

Điều này tạo ra một commit mới trên nhánh hiện tại của bạn với những thay đổi tương tự như commit được chỉ định.

### Sử dụng Rerere (Tái sử dụng độ phân giải đã ghi)

Nếu bạn thường xuyên gặp phải những xung đột hợp nhất tương tự, tính năng rerere của Git có thể giúp:

```bash
git config --global rerere.enabled true
```

Điều này yêu cầu Git ghi nhớ cách bạn giải quyết xung đột để nó có thể tự động giải quyết vào lần tiếp theo.

### Tạo bản vá

Để tạo tệp vá để chia sẻ các thay đổi mà không cần đẩy vào kho lưu trữ:

```bash
git format-patch -1 HEAD
```

Điều này tạo ra một tệp như `0001-commit-message.patch`.

Để áp dụng một bản vá:

```bash
git apply path/to/file.patch
```

Hoặc để áp dụng và tạo commit:

```bash
git am path/to/file.patch
```

## Kết luận

Tính năng theo dõi lịch sử của Git cung cấp hồ sơ vô giá về quá trình phát triển dự án của bạn. Bằng cách tìm hiểu các công cụ này để khám phá và thao tác lịch sử, bạn có thể hiểu rõ hơn cách mã của mình phát triển theo thời gian, gỡ lỗi các vấn đề hiệu quả hơn và duy trì lịch sử rõ ràng, có ý nghĩa.

Hãy nhớ rằng quyền lực lớn đi kèm với trách nhiệm lớn lao, đặc biệt là khi viết lại lịch sử. Luôn thận trọng khi thay đổi commit đã được chia sẻ với người khác và trao đổi rõ ràng khi bạn cần thực hiện những thay đổi đó.

Trong phần tiếp theo, chúng ta sẽ thảo luận về các phương pháp hay nhất về Git để giúp bạn duy trì quy trình làm việc hiệu quả và năng suất.
