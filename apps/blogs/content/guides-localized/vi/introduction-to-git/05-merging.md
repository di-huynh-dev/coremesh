---
title: "Hợp nhất và giải quyết xung đột"
order: 5
description: Tìm hiểu cách kết hợp các thay đổi từ các nhánh khác nhau và giải quyết xung đột
---

Khi bạn đã hoàn thành công việc trên một nhánh, bạn sẽ muốn kết hợp những thay đổi đó trở lại nhánh chính của mình. Điều này được thực hiện bằng lệnh `git merge`. Trong phần này, chúng ta sẽ khám phá cách hợp nhất các nhánh và xử lý các xung đột khi hợp nhất.

## Hiểu việc hợp nhất

Hợp nhất là quá trình kết hợp các thay đổi từ nhánh này sang nhánh khác. Khi bạn hợp nhất, Git sẽ cố gắng tự động kết hợp các thay đổi. Nếu cùng một phần của tệp không bị thay đổi ở cả hai nhánh, Git sẽ tự động hợp nhất chúng. Nếu có những thay đổi xung đột, Git sẽ thông báo cho bạn và yêu cầu bạn giải quyết chúng.

## Các loại hợp nhất

Git thực hiện hai loại hợp nhất:

### Hợp nhất chuyển tiếp nhanh

Việc hợp nhất chuyển tiếp nhanh xảy ra khi nhánh mục tiêu không có commit mới kể từ khi nhánh của bạn được tạo. Trong trường hợp này, Git chỉ cần di chuyển con trỏ về phía trước. Không có commit mới nào được tạo.

Trước:

```
main    A---B---C
                 \
feature           D---E
```

Sau:

```
main    A---B---C---D---E

feature             D---E
```

### Hợp nhất ba chiều (Hợp nhất đệ quy)

Hợp nhất ba chiều xảy ra khi cả hai nhánh đều phát triển độc lập. Git tạo một "hợp nhất commit" mới kết hợp các thay đổi từ cả hai nhánh.

Trước:

```
main    A---B---C---F
                 \
feature           D---E
```

Sau:

```
main    A---B---C---F---G
                 \     /
feature           D---E
```

Trong đó G là commit hợp nhất.

## Quy trình hợp nhất cơ bản

Để hợp nhất một nhánh vào nhánh hiện tại của bạn:

1. Chuyển sang nhánh bạn muốn sáp nhập vào (thường là `main`):

```bash
git checkout main
```

2. Hợp nhất nhánh tính năng của bạn:

```bash
git merge feature-user-profiles
```

Nếu hợp nhất là hợp nhất chuyển tiếp nhanh, Git sẽ chỉ cập nhật con trỏ nhánh. Nếu đó là hợp nhất ba chiều, Git sẽ tạo một hợp nhất commit mới.

## Hợp nhất tin nhắn commit

Đối với việc hợp nhất ba chiều, Git sẽ mở trình soạn thảo của bạn để tạo thông báo hợp nhất commit. Mặc định thường là đủ:

```
Merge branch 'feature-user-profiles' into main
```

Nhưng bạn có thể cung cấp thêm ngữ cảnh nếu cần.

## Chiến lược hợp nhất

Git đưa ra một số chiến lược hợp nhất cho các tình huống khác nhau:

- `--ff` (mặc định): Thực hiện hợp nhất chuyển tiếp nhanh nếu có thể, nếu không thì tạo hợp nhất commit
- `--no-ff`: Luôn tạo hợp nhất commit, ngay cả khi có thể hợp nhất chuyển tiếp nhanh
- `--ff-only`: Chỉ thực hiện hợp nhất nếu đó là hợp nhất chuyển tiếp nhanh
- `--squash`: Kết hợp tất cả các thay đổi thành một commit mới

Ví dụ về việc buộc hợp nhất commit:

```bash
git merge --no-ff feature-branch
```

Ví dụ về hợp nhất bí:

```bash
git merge --squash feature-branch
git commit -m "Add user profile feature"
```

## Xử lý xung đột hợp nhất

Đôi khi Git không thể tự động hợp nhất các thay đổi vì cả hai nhánh đều sửa đổi cùng một phần của tệp. Điều này được gọi là xung đột hợp nhất.

Khi xảy ra xung đột, Git sẽ cho bạn biết tệp nào bị xung đột:

```
Auto-merging profile.html
CONFLICT (content): Merge conflict in profile.html
Automatic merge failed; fix conflicts and then commit the result.
```

### Hiểu các dấu hiệu xung đột

Git sửa đổi các tệp bị xung đột và thêm các điểm đánh dấu xung đột để hiển thị các phần xung đột:

```html
<<<<<<< HEAD
<h1>User Profile Page</h1>
=======
<h1>Customer Profile</h1>
>>>>>>> feature-user-profiles
```

Những dấu hiệu này có nghĩa là:

- `<<<<<<< HEAD`: Phần bắt đầu của phần xung đột trong nhánh hiện tại của bạn
- `=======`: Dải phân cách giữa những thay đổi xung đột
- `>>>>>>> feature-user-profiles`: Phần cuối của phần xung đột, với những thay đổi từ nhánh bạn đang hợp nhất

### Giải quyết xung đột

Để giải quyết xung đột:

1. Mở (các) tệp bị xung đột trong trình chỉnh sửa của bạn
2. Chỉnh sửa tệp để giải quyết xung đột bằng cách:
   - Lựa chọn một phiên bản
   - Kết hợp cả hai phiên bản
   - Viết một cái gì đó hoàn toàn khác
3. Xóa các điểm đánh dấu xung đột (`<<<<<<<`, `=======`, `>>>>>>>`)
4. Lưu tập tin
5. Giai đoạn tập tin đã giải quyết:

```bash
git add profile.html
```

6. Hoàn tất việc hợp nhất bằng cách cam kết:

```bash
git commit -m "Resolve merge conflict in profile page heading"
```

Git sẽ tạo một commit hợp nhất bao gồm các giải pháp xung đột của bạn.

### Công cụ giải quyết xung đột

Nhiều công cụ có thể giúp bạn giải quyết xung đột hợp nhất:

- Công cụ tích hợp của **Git**: `git mergetool`
- **Visual Studio Code**: Giao diện giải quyết xung đột tích hợp
- **IntelliJ/PyCharm**: Công cụ hợp nhất tích hợp
- **Beyond Compare, P4Merge, v.v.**: Các công cụ tìm khác biệt bên ngoài

Để định cấu hình công cụ hợp nhất:

```bash
git config --global merge.tool vscode
```

Để bắt đầu công cụ hợp nhất đã định cấu hình:

```bash
git mergetool
```

### Hủy bỏ việc hợp nhất

Nếu bạn muốn hủy việc hợp nhất có xung đột:

```bash
git merge --abort
```

Thao tác này sẽ đưa bạn trở lại trạng thái trước khi bắt đầu hợp nhất.

## Phòng bệnh hơn chữa bệnh

Mặc dù Git xử lý việc hợp nhất tốt nhưng tốt hơn hết là tránh những xung đột phức tạp:

- **Giao tiếp với nhóm của bạn**: Biết ai đang làm việc gì
- **Giữ các nhánh tồn tại trong thời gian ngắn**: Hợp nhất thường xuyên để giảm sự phân kỳ
- **Cấu trúc mã của bạn theo mô-đun**: Tách biệt các mối quan tâm để giảm xung đột
- **Kéo từ chính thường xuyên**: Luôn cập nhật chi nhánh của bạn với những thay đổi mới nhất

## Kỹ thuật hợp nhất nâng cao

### Hái anh đào

Đôi khi bạn muốn áp dụng một commit từ nhánh này sang nhánh khác:

```bash
git cherry-pick commit-hash
```

Điều này tạo ra một commit mới trên nhánh hiện tại của bạn với những thay đổi tương tự như commit được chỉ định.

### Rebase như một giải pháp thay thế cho việc hợp nhất

Một cách khác để tích hợp các thay đổi là khởi động lại:

```bash
git checkout feature-branch
git rebase main
```

Điều này sẽ di chuyển nhánh tính năng của bạn bắt đầu từ đầu chính, tạo lịch sử tuyến tính:

Trước:

```
main    A---B---C---F
                 \
feature           D---E
```

Sau:

```
main    A---B---C---F
                     \
feature              D'---E'
```

Trong đó D' và E' là commit được phát lại.

> ⚠️ **Warning**: Không bao giờ rebase các nhánh mà người khác đang làm việc. Việc khởi động lại các thay đổi lịch sử commit, điều này có thể gây ra sự cố cho những người khác sử dụng nhánh.

## Khi nào nên hợp nhất và khi nào nên Rebase

- **Sử dụng hợp nhất khi**:
  - Bạn muốn lưu giữ toàn bộ lịch sử
  - Chi nhánh được chia sẻ với những người khác
  - Bạn muốn ghi lại rằng một nhánh tính năng đã tồn tại
- **Sử dụng rebase khi**:
  - Bạn muốn một lịch sử tuyến tính, rõ ràng hơn
  - Bạn đang làm việc trên một chi nhánh cá nhân
  - Bạn muốn tích hợp những thay đổi mới nhất từ nhánh chính

## Thực tiễn tốt nhất để hợp nhất

- **Xem lại các thay đổi trước khi hợp nhất**: Hiểu những gì bạn đang hợp nhất
- **Test trước và sau khi hợp nhất**: Đảm bảo chức năng không bị hỏng
- **Sử dụng các thông báo commit có ý nghĩa**: Giải thích mục đích của việc hợp nhất
- **Keep hợp nhất tập trung**: Hợp nhất một tính năng tại một thời điểm
- **DXóa các nhánh sau khi hợp nhất**: Giữ kho lưu trữ của bạn sạch sẽ

Với những kỹ năng hợp nhất này, giờ đây bạn đã được trang bị để kết hợp các thay đổi từ các nhánh khác nhau và xử lý mọi xung đột phát sinh. Trong phần tiếp theo, chúng ta sẽ khám phá cách làm việc với các kho lưu trữ từ xa để cộng tác với những kho lưu trữ khác.
