---
title: "Thực tiễn tốt nhất về Git"
order: 9
description: 'Các phương pháp thực hành tốt nhất về Git cho công việc hàng ngày: thông báo commit có ý nghĩa, chiến lược phân nhánh, vệ sinh .gitignore, quy trình xem xét mã và giữ lịch sử sạch sẽ theo thời gian.'
---

Mặc dù Git đủ linh hoạt để đáp ứng nhiều quy trình công việc, nhưng việc tuân theo các phương pháp hay nhất đã được thiết lập sẽ giúp bạn tránh được những cạm bẫy phổ biến và làm việc hiệu quả hơn. Phần này phác thảo các phương pháp được đề xuất cho commit, phân nhánh, cộng tác và quản lý kho lưu trữ.

## Các phương pháp hay nhất về commit

### Viết tin nhắn commit có ý nghĩa

Thông báo commit tốt là rất quan trọng để hiểu lịch sử của dự án. Thực hiện theo các hướng dẫn sau:

1. **Sử dụng tâm trạng mệnh lệnh** trong dòng chủ đề:

   - Tốt: "Thêm tính năng xác thực người dùng"
   - Tránh: "Đã thêm tính năng xác thực người dùng" hoặc "Thêm tính năng xác thực người dùng"

2. **Giới hạn dòng chủ đề ở 50 ký tự**

3. **Viết hoa dòng chủ đề và không kết thúc bằng dấu chấm**

4. **Tách chủ đề khỏi nội dung bằng một dòng trống**

5. **Sử dụng phần thân để giải thích cái gì và tại sao, chứ không phải như thế nào**:

   ```
   Add password strength validation

   Increases security by requiring minimum password complexity:
   - At least 8 characters
   - Mix of uppercase, lowercase, and numbers
   - Special characters recommended but not required

   Closes #45
   ```

6. **Các vấn đề tham khảo và yêu cầu kéo** khi thích hợp

### Tạo nguyên tử commit

Mỗi commit phải thể hiện một thay đổi logic duy nhất:

- **Tập trung vào một nhiệm vụ duy nhất** mỗi commit
- **DKhông trộn lẫn các thay đổi không liên quan** trong cùng một commit
- **Eđảm bảo mã hoạt động** sau mỗi commit

Atomic commit giúp dễ dàng hơn:

- Tìm hiểu lịch sử dự án
- Tìm lỗi với `git bisect`
- Những thay đổi cụ thể về Cherry-pick
- Hoàn nguyên các thay đổi mà không ảnh hưởng đến các tính năng khác

### Commit Thường xuyên

commit thường xuyên thay đổi nhỏ thay vì không thường xuyên thay đổi lớn:

- **Lưu công việc của bạn** thường xuyên
- **Thực hiện các cam kết nhỏ, tập trung** thay vì các cam kết lớn, sâu rộng
- **Sử dụng các nhánh riêng** cho công việc đang tiến hành commit

Nếu bạn cần xóa lịch sử của mình trước khi chia sẻ, bạn có thể sử dụng rebase tương tác để xóa commit liên quan.

### Không tạo tệp commit

Tránh cam kết các tệp được tạo hoặc biên dịch:

- Xây dựng artifact
- Mã biên dịch
- Các phần phụ thuộc (ví dụ: node_modules)
- Tệp nhật ký
- Cấu hình dành riêng cho môi trường

Thay vào đó:

- Sử dụng `.gitignore` để loại trừ các tệp này
- Tài liệu cách tạo ra chúng
- Cân nhắc sử dụng Git LFS cho các tệp nhị phân lớn khi cần thiết

## Thực tiễn tốt nhất về phân nhánh

### Giữ các chi nhánh tập trung

Mỗi chi nhánh nên có một mục đích rõ ràng:

- **Các nhánh tính năng** dành cho các tính năng mới
- **Sửa lỗi các nhánh** cho các lỗi cụ thể
- **Tái cấu trúc các nhánh** để cải tiến mã
- **DCác nhánh tài liệu** để cập nhật tài liệu

### Sử dụng cách đặt tên chi nhánh nhất quán

Áp dụng quy ước đặt tên chi nhánh nhất quán:

```
<type>/<description>
```

Ví dụ:

- `feature/user-authentication`
- `bugfix/login-error`
- `hotfix/security-vulnerability`
- `docs/api-documentation`

Điều này giúp dễ dàng hơn để:

- Xác định mục đích chi nhánh trong nháy mắt
- Lọc và tìm kiếm các nhánh
- Tự động hóa quản lý chi nhánh

### Giữ cho các nhánh tồn tại trong thời gian ngắn

Các nhánh tồn tại lâu dài dẫn đến các vấn đề tích hợp:

- **Hợp nhất thường xuyên** quay lại nhánh chính
- **Keep phạm vi tính năng nhỏ** để hoàn thành các nhánh một cách nhanh chóng
- **Chia các tính năng lớn** thành các nhánh nhỏ hơn, tăng dần

### Cập nhật thường xuyên từ Main

Luôn cập nhật các nhánh tính năng của bạn với nhánh chính:

```bash
git checkout feature-branch
git pull --rebase origin main
```

Điều này giúp:

- Phát hiện sớm xung đột
- Đảm bảo những thay đổi của bạn hoạt động với các bản cập nhật gần đây
- Làm cho việc hợp nhất cuối cùng mượt mà hơn

## Thực tiễn tốt nhất về quy trình làm việc

### Kéo trước khi đẩy

Luôn tích hợp những thay đổi của người khác trước khi chia sẻ những thay đổi của bạn:

```bash
git pull origin main
# Resolve any conflicts
git push origin main
```

### Xem lại mã trước khi hợp nhất

Sử dụng pull request hoặc các công cụ đánh giá mã để xem xét các thay đổi trước khi hợp nhất:

- Xác minh chức năng
- Kiểm tra chất lượng mã
- Đảm bảo các bài kiểm tra vượt qua
- Tìm kiếm vấn đề bảo mật

### Kiểm tra tự động

Thiết lập tích hợp liên tục để kiểm tra mã tự động:

- Chạy thử nghiệm mỗi lần đẩy
- Kiểm tra kiểu mã và linting
- Đo phạm vi kiểm tra
- Quét các lỗ hổng bảo mật

### Giữ chi nhánh chính ổn định

Nhánh chính phải luôn ở dạng trạng thái có thể triển khai:

- Không bao giờ commit trực tiếp vào chính
- Chỉ hợp nhất thông qua pull request
- Đảm bảo tất cả các bài kiểm tra đều vượt qua trước khi hợp nhất
- Sửa chữa các bản dựng bị hỏng ngay lập tức

## Quản lý kho lưu trữ

### Sử dụng tệp .gitignore tốt

Tệp `.gitignore` được cấu hình tốt sẽ giữ cho kho lưu trữ của bạn luôn sạch sẽ:

- Sử dụng các mẫu từ [Kho lưu trữ gitignore của GitHub](https://github.com/github/gitignore)
- Bao gồm các mẫu dành riêng cho ngôn ngữ
- Thêm các tệp dành riêng cho IDE và hệ điều hành
- Loại trừ các tệp cấu hình cục bộ
- Bỏ qua bản dựng artifact và các phần phụ thuộc

Ví dụ cho dự án Node.js:

```
# Dependencies
node_modules/
npm-debug.log
yarn-error.log

# Build output
dist/
build/
coverage/

# Environment variables
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db

# IDE files
.idea/
.vscode/
*.sublime-project
*.sublime-workspace
```

### Ghi lại kho lưu trữ của bạn

Duy trì tốt tài liệu:

- **README.md**: Tổng quan về dự án, hướng dẫn thiết lập, ví dụ sử dụng
- **CONTRIBUTING.md**: Hướng dẫn dành cho cộng tác viên
- **CODE_OF_CONDUCT.md**: Kỳ vọng của cộng đồng
- **LICENSE**: Điều khoản pháp lý để sử dụng mã của bạn
- **CHANGELOG.md**: Bản ghi các thay đổi cho từng phiên bản

### Sử dụng thẻ cho bản phát hành

Đánh dấu điểm phát hành bằng thẻ:

```bash
git tag -a v1.0.0 -m "Version 1.0.0 - Initial stable release"
git push origin --tags
```

Sử dụng phiên bản ngữ nghĩa (MAJOR.MINOR.PATCH) trong đó:

- LỚN: Các thay đổi API không tương thích
- NHỎ: Tính năng mới, tương thích ngược
- PATCH: Sửa lỗi, tương thích ngược

### Quản lý tệp lớn một cách thích hợp

Git không được thiết kế cho các tệp nhị phân lớn. Đối với những điều này, hãy xem xét:

- Git LFS (Bộ lưu trữ tệp lớn) để theo dõi các tệp lớn
- Kho lưu trữ artifact bên ngoài dành cho các bản dựng
- Lưu trữ đám mây với các tham chiếu trong mã của bạn

## Thực tiễn tốt nhất về bảo mật

### Đừng bí mật commit

Không bao giờ có thông tin nhạy cảm commit:

- Khóa API
- Mật khẩu
- Mã thông báo riêng
- Chuỗi kết nối
- Chứng chỉ riêng

Thay vào đó:

- Sử dụng biến môi trường
- Sử dụng các công cụ quản lý bí mật
- Lưu trữ các ví dụ với phần giữ chỗ

Nếu bí mật vô tình là đã commit:

- Thay đổi thông tin đăng nhập bị xâm phạm ngay lập tức
- Sử dụng các công cụ như BFG hoặc git-filter-branch để xóa bí mật
- Buộc đẩy để ghi đè lên lịch sử (thận trọng)

### Ký tên commit của bạn

Hãy cân nhắc việc ký commit để xác minh danh tính của bạn:

```bash
git config --global user.signingkey YOUR_GPG_KEY_ID
git config --global commit.gpgsign true
```

Sau đó commit sẽ được ký tự động hoặc sử dụng cờ `-S`:

```bash
git commit -S -m "Implement secure login"
```

### Sử dụng SSH cho kho lưu trữ từ xa

SSH an toàn hơn HTTPS để xác thực:

```bash
git remote add origin git@github.com:username/repository.git
```

## Thực tiễn tốt nhất về hiệu suất

### Giữ kho lưu trữ của bạn gọn gàng

Kho lưu trữ nhỏ hơn sẽ nhanh hơn và dễ quản lý hơn:

- Không có tệp nhị phân lớn commit
- Lưu trữ cành cũ
- Sử dụng bản sao nông cho CI/CD khi có thể
- Hãy xem xét git-filter-repo để xóa các tệp lịch sử lớn

### Sử dụng Git Hook để tự động hóa

Móc Git có thể tự động hóa các tác vụ và thực thi các tiêu chuẩn:

- **pre-commit**: Chạy linters và formatters
- **pre-push**: Chạy thử nghiệm trước khi đẩy
- **commit-msg**: Thực thi các tiêu chuẩn tin nhắn commit
- **post-merge**: Cập nhật các phần phụ thuộc sau khi kéo

Ví dụ móc trước commit:

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running linter..."
npm run lint

if [ $? -ne 0 ]; then
  echo "Linting failed! Fix the errors before committing."
  exit 1
fi

echo "Running tests..."
npm test

if [ $? -ne 0 ]; then
  echo "Tests failed! Fix the failing tests before committing."
  exit 1
fi

exit 0
```

### Sử dụng bí danh Git cho các lệnh chung

Tạo phím tắt cho các lệnh thường dùng:

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```

Bây giờ bạn có thể sử dụng `git co` thay vì `git checkout`, v.v.

Bí danh nâng cao hơn:

```bash
git config --global alias.logline "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```

## Thực tiễn tốt nhất về cộng tác

### Ghi lại quy trình làm việc của bạn

Đảm bảo mọi người trong nhóm hiểu được quy trình làm việc:

- Tạo tệp CONTRIBUTING.md
- Tài liệu quy ước đặt tên nhánh
- Giải thích quá trình xem xét
- Đặt kỳ vọng cho commit và PR

### Truyền đạt về những thay đổi lớn

Thông báo cho nhóm trước khi thực hiện những thay đổi mang tính đột phá:

- Tái cấu trúc lớn
- Thay đổi về giao diện cốt lõi
- Những hướng kiến trúc mới
- Loại bỏ các tính năng

### Cùng nhau giải quyết xung đột

Khi xảy ra xung đột phức tạp:

- Giao tiếp với các nhà phát triển có liên quan
- Xem xét lập trình cặp để giải quyết
- Ghi lại các quyết định giải quyết
- Cập nhật các bài kiểm tra để xác minh tính chính xác

### Cung cấp phản hồi có ý nghĩa

Khi xem xét mã của người khác:

- Hãy mang tính xây dựng và cụ thể
- Giải thích lý do đằng sau những gợi ý
- Tham khảo các phương pháp hay nhất đã được thiết lập
- Cân bằng những lời chỉ trích với phản hồi tích cực

## Những cạm bẫy phổ biến cần tránh

### Buộc đẩy tới các nhánh được chia sẻ

Buộc viết lại lịch sử và có thể làm gián đoạn công việc của người khác:

- **Không bao giờ ép đẩy lên các nhánh chính**
- Sử dụng `--force-with-lease` thay vì `--force` để đảm bảo an toàn
- Giao tiếp trước khi buộc đẩy tới các nhánh tính năng được chia sẻ

### Viết lại lịch sử công cộng

Viết lại lịch sử mà người khác đã lấy sẽ gây ra vấn đề:

- Chỉ các nhánh rebase không được chia sẻ
- Sử dụng `git revert` để hoàn tác các thay đổi trong các nhánh công cộng
- Giao tiếp nếu lịch sử phải được viết lại

### Hợp nhất lớn commit

Việc hợp nhất lớn rất khó để xem xét và gỡ lỗi:

- Hợp nhất từ chính vào chi nhánh của bạn thường xuyên
- Giữ các nhánh tính năng tồn tại trong thời gian ngắn
- Chia những thay đổi lớn thành những PR nhỏ hơn, gia tăng

### Cam kết mã bị hỏng

commit phải thể hiện trạng thái làm việc:

- Chạy thử nghiệm trước khi cam kết
- Sử dụng móc pre-commit để thực thi chất lượng
- Sửa các bài kiểm tra thất bại trước khi đẩy

## Kết luận

Việc làm theo các phương pháp hay nhất về Git này sẽ giúp bạn và nhóm của bạn làm việc hiệu quả hơn, tránh các sự cố thường gặp và duy trì cơ sở mã chất lượng cao. Mặc dù nhu cầu của mỗi nhóm có thể khác nhau một chút nhưng những nguyên tắc này cung cấp nền tảng vững chắc để sử dụng Git hiệu quả.

Hãy nhớ rằng tính nhất quán là chìa khóa, hãy chọn các phương pháp phù hợp với nhóm của bạn và gắn bó với chúng. Ghi lại quy trình làm việc của bạn và đào tạo các thành viên nhóm mới để đảm bảo mọi người đều tuân theo các quy ước giống nhau.

Trong phần tiếp theo, chúng ta sẽ khám phá các kỹ thuật Git nâng cao có thể giúp bạn xử lý các tình huống phức tạp hơn và trở thành người dùng thành thạo Git.
