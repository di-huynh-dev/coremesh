---
title: "Quy trình làm việc cộng tác"
order: 7
description: 'Quy trình cộng tác Git phổ biến: tập trung, nhánh tính năng, GitFlow và dựa trên trung kế. Cách chọn một người cho nhóm của bạn và tránh nỗi đau do xung đột hợp nhất.'
---

Làm việc nhóm hiệu quả đòi hỏi nhiều thứ hơn là chỉ biết các lệnh Git. Bạn cần thiết lập quy trình công việc để giúp nhóm của bạn cộng tác suôn sẻ. Trong phần này, chúng ta sẽ khám phá các quy trình làm việc Git phổ biến và các phương pháp hay nhất để cộng tác nhóm.

## Tại sao quy trình làm việc của Git lại quan trọng

Luồng công việc Git xác định cách các thành viên trong nhóm điều phối công việc của họ. Một quy trình làm việc tốt nên:

- Làm cho sự hợp tác có thể dự đoán được và có tổ chức
- Giảm thiểu xung đột hợp nhất và các vấn đề tích hợp
- Hỗ trợ chất lượng mã thông qua đánh giá
- Cho phép phát triển song song
- Duy trì cơ sở mã production ổn định
- Thích ứng với quy mô và nhu cầu của nhóm bạn

## Quy trình công việc Git phổ biến

Có một số quy trình công việc Git đã được thiết lập, mỗi quy trình đều có những ưu điểm riêng. Hãy khám phá những cái phổ biến nhất.

### 1. Quy trình làm việc tập trung

Đây là quy trình làm việc đơn giản nhất, tương tự như các hệ thống kiểm soát phiên bản tập trung cũ hơn:

- Mọi người đều nhân bản từ cùng một kho lưu trữ trung tâm
- Mọi người đều làm việc trên nhánh chính
- Các thay đổi được kéo và đẩy trực tiếp vào main

**AƯu điểm**:

- Đơn giản để hiểu và thực hiện
- Chi nhánh tối thiểu để quản lý
- Hoạt động tốt cho các nhóm rất nhỏ

**DHậu quả**:

- Không có sự cô lập đối với các tính năng hoặc thử nghiệm mới
- Xung đột có thể xảy ra thường xuyên
- Khó duy trì nhánh chính ổn định
- Không mở rộng tốt cho các nhóm lớn hơn

**Khi nào nên sử dụng nó**:
Dành cho các nhóm nhỏ hoặc dự án cá nhân có ít người đóng góp.

Luồng ví dụ:

```bash
git clone https://github.com/team/project.git
git pull origin main  # Get latest changes
# Make your changes
git commit -a -m "Fix login button"
git pull origin main  # Integrate others' changes
git push origin main  # Share your changes
```

### 2. Quy trình làm việc của nhánh tính năng

Một bước tiến so với quy trình làm việc tập trung, trong đó mỗi tính năng hoặc bản sửa lỗi có nhánh riêng:

- Nhánh chính chứa mã ổn định, sẵn sàng cho production
- Nhà phát triển tạo các nhánh tính năng cho công việc mới
- Các thay đổi được hợp nhất trở lại chính khi hoàn tất
- Không có commit trực tiếp tới chính

**AƯu điểm**:

- Các tính năng bị cô lập trong quá trình phát triển
- Chi nhánh chính vẫn ổn định
- Dễ dàng theo dõi các tính năng hơn
- Hỗ trợ đánh giá mã cơ bản qua pull request

**DHậu quả**:

- Yêu cầu thêm kiến thức về Git
- Vẫn có thể dẫn đến các vấn đề tích hợp nếu các nhánh tồn tại quá lâu

**Khi nào nên sử dụng nó**:
Dành cho các nhóm vừa và nhỏ cần tổ chức nhiều hơn quy trình làm việc tập trung.

Luồng ví dụ:

```bash
git checkout main
git pull
git checkout -b feature-user-login
# Make your changes
git add .
git commit -m "Implement user login"
git push -u origin feature-user-login
# Create pull request
# After review and approval, merge to main
```

### 3. Quy trình làm việc của Gitflow

Một mô hình phân nhánh tốt được thiết kế bởi Vincent Driessen:

- **main**: Chỉ chứa mã production
- **develop**: Nhánh tích hợp cho các tính năng
- **feature/\***: Các tính năng mới
- **release/\***: Chuẩn bị phát hành
- **hotfix/\***: Bản sửa lỗi khẩn cấp cho production

**AƯu điểm**:

- Có cấu trúc và tổ chức cao
- Hỗ trợ phát triển song song
- Sự tách biệt rõ ràng giữa phát triển và production
- Quy trình được xác định rõ ràng cho các bản phát hành và bản sửa lỗi nóng

**DHậu quả**:

- Phức tạp hơn để hiểu và làm theo
- Thêm chi phí cho việc quản lý chi nhánh
- Có thể quá phức tạp đối với các dự án nhỏ hơn

**Khi nào nên sử dụng nó**:
Dành cho các nhóm vừa và lớn có bản phát hành theo lịch trình.

Luồng ví dụ:

```bash
# Start a new feature
git checkout develop
git checkout -b feature/user-login

# Complete the feature
git checkout develop
git merge feature/user-login

# Prepare a release
git checkout -b release/1.0.0
# Make release-specific changes

# Finalize the release
git checkout main
git merge release/1.0.0
git tag -a 1.0.0 -m "Version 1.0.0"
git checkout develop
git merge release/1.0.0

# Create a hotfix
git checkout main
git checkout -b hotfix/login-fix
# Fix the issue
git checkout main
git merge hotfix/login-fix
git tag -a 1.0.1 -m "Version 1.0.1"
git checkout develop
git merge hotfix/login-fix
```

### 4. Luồng GitHub

Quy trình làm việc đơn giản hóa được thiết kế để phân phối liên tục:

- Nhánh chính luôn có thể triển khai được
- Tạo các nhánh tính năng từ chính
- Mở pull request sớm để nhận phản hồi
- Hợp nhất vào chính sau khi xem xét mã
- Triển khai ngay sau khi sáp nhập vào chính

**AƯu điểm**:

- Đơn giản hơn Gitflow
- Rất thích hợp cho việc giao hàng liên tục
- Khuyến khích phản hồi sớm thông qua pull request
- Tích hợp tốt với các tính năng của GitHub

**DHậu quả**:

- Ít cấu trúc hơn Gitflow
- Có thể không xử lý nhiều phiên bản trong production

**Khi nào nên sử dụng nó**:
Dành cho các nhóm thực hành phân phối liên tục hoặc bằng ứng dụng web.

Luồng ví dụ:

```bash
git checkout main
git pull
git checkout -b feature-search
# Make your changes
git add .
git commit -m "Add search functionality"
git push -u origin feature-search
# Create a pull request
# After review and automated tests pass, merge to main
# Deploy from main
```

### 5. Phát triển dựa trên thân cây

Chiến lược phân nhánh tối thiểu tập trung vào việc giữ cho nhánh chính (thân cây) luôn có thể phát hành được:

- Các nhánh tính năng tồn tại rất ngắn
- Tích hợp thường xuyên vào chính (ít nhất là hàng ngày)
- Chuyển đổi tính năng để ẩn công việc chưa hoàn thành
- Tập trung mạnh vào thử nghiệm tự động

**AƯu điểm**:

- Giảm thiểu xung đột hợp nhất thông qua tích hợp thường xuyên
- Hỗ trợ tích hợp/triển khai liên tục
- Giảm chi phí chi nhánh
- Lực lượng thực hành phát triển kỷ luật

**DHậu quả**:

- Yêu cầu thử nghiệm phức tạp và CI/CD
- Phụ thuộc nhiều vào việc chuyển đổi tính năng
- Có thể là thách thức đối với các đội ít kinh nghiệm hơn

**Khi nào nên sử dụng nó**:
Dành cho các nhóm giàu kinh nghiệm có phương pháp kiểm tra hiệu quả và CI/CD pipeline.

Luồng ví dụ:

```bash
git checkout main
git pull
git checkout -b small-feature
# Make your changes
# Use feature toggles for incomplete work
git add .
git commit -m "Add first part of user profile"
git pull --rebase origin main
git push origin small-feature
# Create PR, get quick review
# Merge to main the same day
```

## Lựa chọn quy trình làm việc phù hợp

Quy trình làm việc tốt nhất phụ thuộc vào nhu cầu của nhóm bạn:

| Yếu tố                          | Quy trình làm việc được đề xuất          |
| ------------------------------- | ----------------------------- |
| Nhóm nhỏ, dự án đơn giản      | Nhánh tính năng hoặc Luồng GitHub |
| Nhóm trung bình, phát hành thường xuyên   | Dòng chảy Git                       |
| Đội ngũ lớn, giao hàng liên tục | Luồng GitHub hoặc dựa trên trung kế    |
| Dự án nguồn mở             | fork và pull request         |
| Nhiều phiên bản trong production | Dòng chảy Git                       |
| Văn hóa thử nghiệm mạnh mẽ          | Phát triển dựa trên thân cây       |

Hãy nhớ rằng quy trình công việc có thể được điều chỉnh. Nhiều nhóm sử dụng các phương pháp kết hợp lấy các yếu tố từ các quy trình công việc khác nhau.

## Thực tiễn tốt nhất về hợp tác nhóm

Bất kể quy trình làm việc bạn đã chọn là gì, những phương pháp thực hành này đều giúp các nhóm cộng tác hiệu quả:

### Truyền thông

- **Mẫu yêu cầu kéo**: Chuẩn hóa thông tin trong PR
- **Mẫu phát hành**: Xác định thông tin dự kiến cho các báo cáo lỗi và yêu cầu tính năng
- **Chủ sở hữu mã**: Xác định ai chịu trách nhiệm về các phần khác nhau của cơ sở mã
- **Cập nhật trạng thái**: Thông báo cho nhóm về trạng thái chi nhánh

### Chất lượng mã

- **Đánh giá mã**: Yêu cầu ít nhất một lần đánh giá trước khi hợp nhất
- **Thử nghiệm tự động**: Thiết lập CI để chạy thử nghiệm trên PR
- **Linting**: Tự động thực thi kiểu mã
- **Bảo vệ nhánh**: Ngăn chặn việc đẩy trực tiếp tới các nhánh quan trọng

### Tích hợp

- **PRs nhỏ, thường xuyên**: Dễ dàng xem xét hơn và ít có khả năng xung đột hơn
- **Rebase trước khi hợp nhất**: Giữ lịch sử sạch sẽ và tránh hợp nhất commit không cần thiết
- **Squash cam kết**: Kết hợp commit đang thực hiện trước khi hợp nhất
- **Cập nhật các nhánh thường xuyên**: Kéo từ main thường xuyên để giảm xung đột

### Tài liệu

- Tệp **README**: Tài liệu hướng dẫn thiết lập và đóng góp dự án
- **CONTRIBUTING.md**: Giải thích quy trình làm việc của nhóm bạn
- **Thông báo commit ý nghĩa**: Tạo lịch sử hữu ích
- **Quy ước đặt tên chi nhánh**: Làm rõ mục đích của chi nhánh

## Xử lý các thách thức hợp tác chung

### Giải quyết xung đột trong quá trình hợp tác

Khi nhiều thành viên trong nhóm sửa đổi cùng một mã:

1. Giao tiếp với (các) thành viên trong nhóm có liên quan
2. Hiểu rõ sự thay đổi của nhau trước khi giải quyết
3. Cân nhắc ghép đôi để giải quyết những xung đột phức tạp
4. Cập nhật tài liệu nếu xung đột bộc lộ những khu vực không rõ ràng

### Quản lý các chi nhánh hoạt động lâu dài

Đôi khi các nhánh tính năng cần tồn tại trong thời gian dài:

1. Thường xuyên hợp nhất chính vào nhánh tính năng
2. Hãy cân nhắc chia tính năng này thành các PR nhỏ hơn, tăng dần
3. Sử dụng chuyển đổi tính năng để hợp nhất công việc chưa hoàn thành
4. Tạo điểm kiểm tra bằng cách hợp nhất các phần ổn định trở lại phần chính

### Phối hợp các tính năng phụ thuộc

Khi các tính năng phụ thuộc lẫn nhau:

1. Sử dụng tính năng cắt dọc để cung cấp các phần hoàn chỉnh, nhỏ hơn
2. Xem xét phân cấp nhánh tính năng (nhánh từ các nhánh tính năng khác)
3. Sử dụng các PR xếp chồng lên nhau (mỗi PR được xây dựng trên cái trước đó)
4. Phối hợp cẩn thận thứ tự hợp nhất

## Công cụ để cộng tác tốt hơn

Một số công cụ có thể nâng cao khả năng cộng tác trên Git của bạn:

- **GitHub/GitLab/Bitbucket**: pull request, đánh giá, vấn đề
- **Git hook**: Kiểm tra tự động trước commit hoặc đẩy
- Đường ống **CI/CD**: Thử nghiệm và triển khai tự động
- **Công cụ đánh giá mã**: Khả năng đánh giá nâng cao
- **ChatOps**: Tích hợp với các hệ thống trò chuyện như Slack
- **Công cụ quản lý dự án**: Theo dõi tiến trình tính năng

## Kết luận

Cộng tác hiệu quả với Git không chỉ là kiến thức kỹ thuật mà còn là việc thiết lập các quy trình làm việc và thực tiễn giúp nhóm của bạn làm việc cùng nhau suôn sẻ. Bằng cách chọn quy trình làm việc phù hợp và làm theo các phương pháp cộng tác tốt nhất, bạn có thể giúp nhóm của mình cung cấp mã chất lượng cao một cách nhất quán.

Trong phần tiếp theo, chúng ta sẽ khám phá cách điều hướng và sửa đổi lịch sử Git của bạn.
