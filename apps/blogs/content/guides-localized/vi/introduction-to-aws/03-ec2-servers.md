---
title: "EC2 - Máy chủ ảo đầu tiên của bạn"
description: Khởi chạy máy chủ ảo đầu tiên của bạn trên đám mây và hiểu cách điện toán đám mây thay thế dịch vụ lưu trữ truyền thống.
order: 3
---

Hãy coi EC2 (Đám mây điện toán đàn hồi) như việc thuê một máy tính trong trung tâm dữ liệu của Amazon thay vì mua một chiếc cho văn phòng của bạn. Bạn có một máy chủ ảo trông và hoạt động giống như một máy tính thật nhưng nó tồn tại trên đám mây nơi Amazon xử lý tất cả việc bảo trì vật lý.

## Tại sao nên sử dụng máy chủ ảo?

Lưu trữ web truyền thống đi kèm với những thách thức đáng kể. Thông thường, bạn cần mua trả trước phần cứng đắt tiền, nghĩa là phải đoán trước dung lượng bạn sẽ cần hàng tháng hoặc hàng năm. Khi phần cứng bị lỗi, bạn có trách nhiệm tự sửa chữa hoặc thay thế nó, điều này thường dẫn đến thời gian ngừng hoạt động hàng giờ hoặc hàng ngày. Có lẽ điều khó chịu nhất là bạn phải trả tiền cho máy chủ 24/7 ngay cả khi chúng không hoạt động.

Máy chủ đám mây giải quyết những vấn đề này một cách tinh tế. Bạn có thể bắt đầu với các máy chủ nhỏ, rẻ tiền và phát triển chúng khi nhu cầu của bạn thay đổi. Bạn chỉ trả tiền cho những gì bạn thực sự sử dụng, nghĩa là không phải trả thêm tiền cho dung lượng nhàn rỗi trong thời gian yên tĩnh. Khi phần cứng bị lỗi, AWS sẽ tự động xử lý việc thay thế mà bạn thường không nhận thấy. Quan trọng nhất, bạn có thể tăng công suất trong thời gian bận rộn và giảm bớt khi mọi thứ yên tĩnh, tối ưu hóa cả hiệu suất và chi phí.

## Tìm hiểu các loại phiên bản

AWS cung cấp các "hương vị" khác nhau của máy chủ ảo được gọi là loại phiên bản. Hãy coi chúng giống như những mẫu xe khác nhau - một số thì tiết kiệm, một số khác thì hiệu suất cao.

Để tìm hiểu, bạn sẽ sử dụng các phiên bản **t3.micro** vì chúng:

- Miễn phí cho năm đầu tiên của bạn
- Hoàn hảo cho các trang web nhỏ và thử nghiệm
- Dễ dàng nâng cấp sau này nếu cần

Khi ứng dụng của bạn phát triển, bạn có thể cần:

- **t3.small** để có thêm năng lượng
- **m5.large** cho hiệu suất cân bằng
- **c5.xlarge** dành cho các tác vụ xử lý nặng

Việc đặt tên ban đầu có vẻ khó hiểu, nhưng bạn sẽ quen dần với nó. Hiện tại, chỉ cần nhớ rằng "vi mô" và "nhỏ" là hoàn hảo cho việc học.

## Ra mắt máy chủ đầu tiên của bạn

Hãy tạo máy chủ ảo đầu tiên của bạn. Chúng ta sẽ xây dựng một máy chủ web đơn giản hiển thị thông báo chào mừng.

Trong Bảng điều khiển AWS, điều hướng đến EC2 và nhấp vào "Khởi chạy phiên bản". Bạn sẽ thấy một số tùy chọn:

### Chọn hệ điều hành của bạn

AWS cung cấp máy chủ dựng sẵn image có tên AMI (Amazon Machine image). Đối với hướng dẫn này, hãy chọn **Amazon Linux 2** vì nó:

- Được cài đặt sẵn các công cụ hữu ích
- Nhận cập nhật bảo mật thường xuyên từ Amazon
- Hoạt động tốt với các dịch vụ AWS khác
- Được sử dụng miễn phí

### Chọn kích thước máy chủ của bạn

Chọn **t3.micro** - nó được đánh dấu là "Đủ điều kiện cho bậc miễn phí", nghĩa là bạn sẽ không mất bất kỳ chi phí nào trong năm đầu tiên.

### Định cấu hình cơ bản

Hầu hết các cài đặt mặc định đều hoạt động tốt cho việc học nhưng hãy chú ý đến:

**Cặp khóa**: Đây là cách bạn sẽ kết nối an toàn với máy chủ của mình. Tạo một cặp khóa mới và tải tệp xuống - bạn sẽ cần nó sau này. Hãy coi đây giống như một tập tin mật khẩu đặc biệt.

**Nhóm bảo mật**: Nhóm này hoạt động giống như tường lửa cho máy chủ của bạn. Hiện tại, hãy cho phép:

- SSH (cổng 22) từ địa chỉ IP của bạn để truy cập từ xa
- HTTP (cổng 80) từ mọi nơi cho lưu lượng truy cập web

### Thêm một số mã khởi động

Trong phần "Dữ liệu người dùng", bạn có thể yêu cầu máy chủ của mình chạy lệnh khi nó khởi động lần đầu. Thêm tập lệnh đơn giản này:

```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
echo "<h1>Hello from the Cloud!</h1>" > /var/www/html/index.html
```

Điều này báo cho máy chủ của bạn biết:

1. Cập nhật phần mềm của nó
2. Cài đặt máy chủ web
3. Khởi động máy chủ web
4. Tạo một trang web đơn giản

## Kết nối với máy chủ của bạn

Khi máy chủ của bạn đang chạy (mất vài phút), bạn có thể kết nối với nó từ máy tính của mình.

**Trên Mac hoặc Linux:**

```bash
ssh -i your-key-file.pem ec2-user@your-server-ip
```

**Trên Windows:**
Sử dụng PuTTY hoặc Hệ thống con Windows cho Linux với cùng một lệnh.

Thay thế "your-server-ip" bằng địa chỉ IP thực được hiển thị trong bảng điều khiển EC2.

## Kiểm tra máy chủ web của bạn

Mở trình duyệt web và truy cập địa chỉ IP công cộng của máy chủ của bạn. Bạn sẽ thấy "Xin chào từ đám mây!" hiển thị trên trang.

Chúc mừng! Bạn vừa tạo máy chủ đám mây đầu tiên của mình và xuất bản một trang web.

## Hiểu bảng điều khiển

Bảng điều khiển EC2 hiển thị thông tin quan trọng về máy chủ của bạn:

**Trạng thái thực thể**: Hiển thị xem máy chủ của bạn đang chạy, đã dừng hay đang khởi chạy
**Public IP**: Địa chỉ mọi người sử dụng để truy cập máy chủ của bạn từ internet
**Private IP**: Địa chỉ được sử dụng trong mạng của AWS
**Instance ID**: Mã định danh duy nhất cho máy chủ của bạn (bắt đầu bằng "i-")

## Khái niệm cơ bản về quản lý máy chủ

Không giống như máy chủ vật lý, bạn có thể dễ dàng:

**Stop và Start**: Giống như tắt và bật máy tính nhưng bạn vẫn giữ được dữ liệu của mình
**Terminate**: Xóa vĩnh viễn máy chủ (hãy cẩn thận với điều này!)
**Resize**: Thay đổi sang loại phiên bản mạnh hơn
**Tạo hình ảnh**: Lưu ảnh chụp nhanh máy chủ của bạn để sử dụng lại sau

## Sự kỳ diệu của IP đàn hồi

Theo mặc định, máy chủ của bạn sẽ nhận được một địa chỉ IP khác nhau mỗi khi bạn dừng và khởi động nó. Đối với một trang web thực sự, bạn muốn có một địa chỉ cố định.

Địa chỉ IP đàn hồi giải quyết vấn đề này bằng cách cung cấp cho bạn một IP tĩnh gắn liền với máy chủ của bạn. Chúng miễn phí miễn là chúng được gắn vào máy chủ đang chạy.

## Chi phí này là bao nhiêu

Trong năm đầu tiên, các phiên bản t3.micro được cung cấp miễn phí tới 750 giờ mỗi tháng. Thế là đủ để chạy một máy chủ 24/7 mà không mất phí.

Sau bậc miễn phí, bạn sẽ phải trả khoảng 8-10 USD mỗi tháng cho một máy chủ nhỏ luôn chạy.

## Những lỗi thường gặp của người mới bắt đầu

**Quên dừng máy chủ**: Không giống như dịch vụ lưu trữ chia sẻ, AWS tính phí thời gian chạy. Dừng máy chủ khi bạn không sử dụng chúng.

**Mất tệp khóa**: Nếu bạn mất tệp cặp khóa, bạn không thể truy cập máy chủ của mình. Giữ nó an toàn!

**Mở nhóm bảo mật quá rộng**: Chỉ cho phép truy cập từ địa chỉ IP của bạn trừ khi bạn cần quyền truy cập công khai.

**Không sao lưu dữ liệu**: Máy chủ có thể bị lỗi. Dữ liệu quan trọng phải được lưu trữ riêng (chúng tôi sẽ đề cập đến vấn đề này trong phần lưu trữ).

## Ứng dụng trong thế giới thực

Thiết lập đơn giản này có vẻ cơ bản nhưng nó là nền tảng cho:

- Trang web doanh nghiệp nhỏ
- Môi trường phát triển và thử nghiệm
- Nền tảng học tập
- Dự án cá nhân

Các ứng dụng lớn sử dụng các nguyên tắc giống nhau nhưng có nhiều máy chủ, bộ cân bằng tải và cơ sở dữ liệu hoạt động cùng nhau.

## Các bước tiếp theo

Bây giờ bạn đã có một máy chủ đang chạy, bạn sẽ muốn có một nơi nào đó để lưu trữ các tệp, image và các bản sao lưu. Đó là lúc S3 (Dịch vụ lưu trữ đơn giản) xuất hiện.

S3 giống như có bộ nhớ đám mây không giới hạn mà máy chủ của bạn có thể truy cập ngay lập tức. Nó hoàn hảo cho mọi thứ, từ ảnh hồ sơ người dùng đến bản sao lưu ứng dụng.

Trong phần tiếp theo, bạn sẽ tìm hiểu cách sử dụng S3 và kết nối nó với máy chủ EC2 của mình.
