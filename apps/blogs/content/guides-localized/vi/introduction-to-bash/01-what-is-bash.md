---
title: "Bash là gì?"
description: Hiểu Bash là gì, lịch sử của nó và tại sao nó là một công cụ quan trọng đối với các nhà phát triển và quản trị viên hệ thống
order: 1
---

Bash, viết tắt của "Bourne Again shell," không chỉ là một dấu nhắc lệnh. Đó là một trình thông dịch ngôn ngữ lệnh hoàn chỉnh cung cấp giao diện giữa bạn và hệ điều hành.

## Nguồn gốc và lịch sử của Bash

Bash được Brian Fox tạo ra cho Dự án GNU dưới dạng phần mềm thay thế miễn phí cho Bourne shell (sh). Được phát hành vào năm 1989, nó đã phát triển để trở thành shell mặc định cho hầu hết các bản phân phối Linux và macOS (cho đến khi Catalina chuyển sang zsh làm mặc định).

Tên này là một cách chơi chữ trên Bourne shell trước đó, được tạo bởi Stephen Bourne tại Bell Labs vào cuối những năm 1970, biểu thị rằng Bash là phiên bản nâng cao, "tái sinh" của shell trước đó.

## Tại sao Bash lại quan trọng

Vậy tại sao bạn nên quan tâm đến Bash? Có một số lý do thuyết phục:

1. **Ubiquity**: Bash có mặt ở khắp mọi nơi trong thế giới Unix/Linux. Nếu bạn làm việc với máy chủ, cơ sở hạ tầng đám mây hoặc bất kỳ hệ thống dựa trên Unix nào, chắc chắn bạn sẽ gặp phải Bash.

2. **Automation**: Bash cho phép bạn tự động hóa các tác vụ lặp đi lặp lại bằng cách viết các tập lệnh có thể thực thi một loạt lệnh.

3. **Quản trị hệ thống**: Đối với quản trị viên hệ thống, Bash là một công cụ thiết yếu để giám sát hệ thống, quản lý dịch vụ và bảo trì máy chủ.

4. **Quy trình phát triển**: Các nhà phát triển sử dụng Bash để xây dựng phần mềm, chạy thử nghiệm và triển khai ứng dụng.

5. **Customization**: Bash cho phép bạn tùy chỉnh môi trường để phù hợp với quy trình làm việc của mình.

## Bash so với shell khác

Mặc dù Bash là shell phổ biến nhất nhưng nó không phải là chiếc duy nhất. shell phổ biến khác bao gồm:

- **sh** (Bourne shell) - Unix shell gốc
- **zsh** (Z shell) - shell hiện đại hơn với các tính năng nâng cao
- **fish** - shell thân thiện với người dùng, tập trung vào tính tương tác
- **dash** - shell nhẹ thường được sử dụng để viết kịch bản

Bash tạo ra sự cân bằng giữa các tính năng và sự đơn giản, đó là lý do tại sao nó vẫn phổ biến trong nhiều thập kỷ. Nó tương thích với sh đồng thời bổ sung thêm nhiều cải tiến.

## Lệnh Bash đầu tiên của bạn

Hãy chạy một lệnh đơn giản để xác minh rằng bạn đang sử dụng Bash. Mở terminal của bạn và gõ:

```bash
echo $SHELL
```

Lệnh này in đường dẫn đến shell mà bạn hiện đang sử dụng. Nếu bạn thấy `/bin/bash` hoặc thứ gì đó tương tự có chứa "bash" thì bạn đang chạy Bash.

Để kiểm tra phiên bản Bash bạn đang sử dụng, hãy chạy:

```bash
bash --version
```

Điều này sẽ hiển thị số phiên bản và thông tin khác về cài đặt Bash của bạn.

## Chế độ tương tác và tập lệnh

Bash hoạt động ở hai chế độ chính:

1. **Chế độ tương tác**: Khi bạn mở một thiết bị đầu cuối và thấy lời nhắc đang chờ lệnh của bạn, bạn đang sử dụng Bash ở chế độ tương tác. Mỗi lệnh được thực thi ngay khi bạn nhấn Enter.

2. Chế độ **Script**: Khi Bash đọc lệnh từ một tệp (tập lệnh), nó đang chạy ở chế độ tập lệnh. Điều này cho phép bạn viết một loạt lệnh sẽ được thực hiện tuần tự.

Đây là một ví dụ đơn giản về việc tạo và chạy tập lệnh Bash cơ bản:

```bash
# Create a file named hello.sh
echo '#!/bin/bash
echo "Hello, world!"' > hello.sh

# Make it executable
chmod +x hello.sh

# Run it
./hello.sh
```

Tập lệnh này sẽ xuất ra "Xin chào thế giới!" khi được thực thi.

## Terminal so với shell: Tìm hiểu sự khác biệt

Nhiều người mới nhầm lẫn giữa thiết bị đầu cuối và shell, nhưng chúng là những thành phần riêng biệt:

- **terminal** (hoặc trình mô phỏng thiết bị đầu cuối) là một chương trình cung cấp giao diện dựa trên văn bản. Các ví dụ bao gồm Thiết bị đầu cuối Gnome, iTerm2 và Thiết bị đầu cuối Windows.
- **shell** là trình thông dịch lệnh chạy bên trong thiết bị đầu cuối. Bash là một trong những shell như vậy.

Hãy coi thiết bị đầu cuối là cửa sổ và shell là chương trình chạy bên trong cửa sổ đó, diễn giải các lệnh của bạn.

Bây giờ bạn đã hiểu Bash là gì và tại sao nó có giá trị, chúng ta sẵn sàng đi sâu hơn vào những điều cơ bản về Bash trong phần tiếp theo.
