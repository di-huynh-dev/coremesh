---
title: "Tìm hiểu nguyên tắc cơ bản của Git"
order: 1
description: 'Giải thích các nguyên tắc cơ bản về Git: kiểm soát phiên bản phân tán, cây làm việc, vùng staging và kho lưu trữ, cùng với ba trạng thái tệp và cấu hình đầu tiên của bạn.'
---

Git là một hệ thống kiểm soát phiên bản phân tán giúp bạn theo dõi các thay đổi trong mã của mình, cộng tác với những người khác và duy trì lịch sử dự án của bạn. Cho dù bạn đang làm việc một mình hay là thành viên của nhóm, Git đều cung cấp các công cụ mạnh mẽ để quản lý cơ sở mã của bạn một cách hiệu quả.

Hướng dẫn này sẽ giới thiệu cho bạn các khái niệm cốt lõi của Git và chỉ cho bạn cách sử dụng nó trong quy trình làm việc hàng ngày của bạn. Cuối cùng, bạn sẽ hiểu cách theo dõi các thay đổi, tạo kho lưu trữ và sử dụng các lệnh Git thiết yếu.

## Git là gì?

Git là hệ thống kiểm soát phiên bản phân tán do Linus Torvalds tạo ra vào năm 2005. Không giống như các hệ thống kiểm soát phiên bản tập trung, Git cung cấp cho mỗi nhà phát triển một bản sao hoàn chỉnh của kho lưu trữ, bao gồm cả lịch sử đầy đủ của nó. Điều này có nghĩa là bạn có thể làm việc ngoại tuyến, commit thay đổi cục bộ và đồng bộ hóa với kho lưu trữ từ xa khi cần.

Các đặc điểm chính của Git bao gồm:

- **Tốc độ và hiệu quả**: Git được thiết kế để xử lý các dự án ở mọi quy mô với tốc độ
- **Tính toàn vẹn dữ liệu**: Git sử dụng hàm băm SHA-1 để đảm bảo tính toàn vẹn dữ liệu
- **Quy trình làm việc phân tán**: Mọi người đều có bản sao đầy đủ của kho lưu trữ
- **Khả năng phân nhánh**: Git làm cho các hoạt động phân nhánh và hợp nhất trở nên đơn giản và nhanh chóng

## Git hoạt động như thế nào

Để hiểu Git, bạn cần biết cách nó theo dõi các tệp của bạn:

### Ba trạng thái

Các tệp trong Git trải qua ba trạng thái chính:

1. **Modified (đã sửa đổi)**: Bạn đã thay đổi file nhưng chưa commit
2. **Staged (đã đưa vào staging)**: Bạn đã đánh dấu một tệp đã sửa đổi để đi vào commit tiếp theo của mình
3. **Committed (đã commit)**: Các thay đổi của bạn được lưu trữ an toàn trong cơ sở dữ liệu cục bộ của bạn

Các trạng thái này tương ứng với ba phần chính của dự án Git:

- **Thư mục làm việc**: Nơi bạn sửa đổi tệp
- **Vùng staging** (hoặc chỉ mục): Nơi bạn chuẩn bị những gì bạn sẽ làm commit tiếp theo
- Kho lưu trữ **Git**: Nơi Git lưu trữ dữ liệu và lịch sử dự án của bạn

### Ảnh chụp nhanh, không phải sự khác biệt

Thay vì lưu trữ sự khác biệt giữa các tệp (như nhiều hệ thống kiểm soát phiên bản khác), Git lưu trữ ảnh chụp nhanh của toàn bộ dự án của bạn. Khi bạn commit, Git sẽ chụp "bức ảnh" về giao diện của các tệp của bạn và lưu trữ tham chiếu đến ảnh chụp nhanh đó.

Để đạt hiệu quả, nếu một tệp không bị thay đổi, Git sẽ không lưu trữ lại tệp đó mà chỉ liên kết đến tệp giống hệt trước đó mà nó đã lưu trữ.

## Cài đặt Git

Trước khi có thể bắt đầu sử dụng Git, bạn cần cài đặt nó trên hệ thống của mình.

### Trên Ubuntu/Debian

```bash
sudo apt update
sudo apt install git
```

### Trên macOS

Bạn có thể cài đặt Git qua Homebrew:

```bash
brew install git
```

Hoặc tải xuống trình cài đặt từ [Trang web Git](https://git-scm.com/download/mac).

### Trên Windows

Tải xuống và cài đặt Git từ [Trang web Git](https://git-scm.com/download/win).

### Xác minh cài đặt của bạn

Để xác minh rằng Git đã được cài đặt chính xác, hãy chạy:

```bash
git --version
```

Điều này sẽ hiển thị phiên bản Git đã cài đặt, như `git version 2.34.1`.

## Định cấu hình Git

Sau khi cài đặt Git, bạn nên đặt danh tính của mình. Thông tin này sẽ được đính kèm vào commit của bạn.

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Bạn cũng có thể đặt trình soạn thảo văn bản ưa thích của mình:

```bash
git config --global core.editor "vim"  # Or nano, emacs, etc.
```

Để kiểm tra cài đặt cấu hình của bạn:

```bash
git config --list
```

### Cấp độ cấu hình

Git có ba cấp độ cấu hình:

- `--system`: Áp dụng cho tất cả người dùng trên hệ thống và tất cả kho lưu trữ của họ
- `--global`: Áp dụng cho tất cả các kho lưu trữ cho người dùng hiện tại
- `--local`: Dành riêng cho kho lưu trữ hiện tại (mặc định)

Ví dụ: để đặt địa chỉ email dành riêng cho kho lưu trữ:

```bash
git config --local user.email "project-specific@example.com"
```

Bây giờ bạn đã cài đặt và định cấu hình Git, bạn đã sẵn sàng bắt đầu sử dụng nó cho các dự án của mình.
