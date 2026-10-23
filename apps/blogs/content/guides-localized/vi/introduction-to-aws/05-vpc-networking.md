---
title: "VPC - Xây dựng mạng riêng của bạn"
description: Tạo các mạng an toàn, biệt lập trên đám mây và hiểu lý do tại sao mạng tùy chỉnh lại quan trọng.
order: 5
---

Khi bạn bắt đầu sử dụng AWS lần đầu, máy chủ của bạn đã sử dụng "mạng mặc định" mà Amazon thiết lập cho bạn. Điều này hoạt động tốt cho việc học nhưng các ứng dụng thực tế cần các mạng tùy chỉnh được thiết kế để bảo mật, hiệu suất và tổ chức.

Đám mây riêng ảo (VPC) cho phép bạn tạo phần AWS riêng của mình, nơi bạn kiểm soát các quy tắc kết nối mạng, giống như thiết lập mạng công ty trong tòa nhà văn phòng.

## Tại sao mạng tùy chỉnh lại quan trọng

Hãy coi mạng AWS mặc định giống như một tòa nhà chung cư:

- Mọi người đều sử dụng cùng một hành lang
- Bạn không thể kiểm soát ai có quyền truy cập vào những gì
- An ninh dựa vào khóa cửa riêng lẻ
- Khả năng tùy chỉnh bố cục hạn chế

VPC tùy chỉnh giống như sở hữu tòa nhà của riêng bạn:

- Bạn thiết kế sơ đồ mặt bằng
- Bạn kiểm soát ai có thể vào khu vực nào
- Bạn có thể tạo các phần riêng tư và hành lang công cộng
- Bạn quyết định cách các khu vực khác nhau kết nối

## Hiểu cơ bản về mạng

Trước khi đi sâu vào VPC, hãy xem lại một số nguyên tắc cơ bản về mạng:

**Public so với Private**:

- Mạng công cộng kết nối với internet
- Mạng riêng bị cô lập khỏi truy cập internet trực tiếp

**Mạng con**:

- Các phần nhỏ hơn trong một mạng lớn hơn
- Giống như các tầng hoặc cánh khác nhau trong một tòa nhà

Địa chỉ **IP**:

- Địa chỉ duy nhất cho mỗi thiết bị trên mạng
- Địa chỉ riêng (như 10.0.1.5) để sử dụng nội bộ
- Địa chỉ công cộng cho truyền thông internet

## Các thành phần cốt lõi của VPC

Một VPC bao gồm nhiều phần hoạt động cùng nhau:

### Bản thân VPC

Đây là không gian mạng riêng tư của bạn với nhiều địa chỉ IP do bạn kiểm soát. Bạn có thể chọn một cái gì đó như 10.0.0.0/16, cung cấp cho bạn khoảng 65.000 địa chỉ có thể.

### Mạng con

Mạng con chia VPC của bạn thành các phần nhỏ hơn. Bạn thường tạo:

- **Mạng con công khai** dành cho những thứ cần truy cập internet
- **Mạng con riêng** dành cho cơ sở dữ liệu và dịch vụ nội bộ

### Cổng Internet

Đây giống như cửa trước tòa nhà của bạn - nó cho phép lưu lượng truy cập giữa VPC của bạn và internet.

### Bảng lộ trình

Đây giống như các biển báo giao thông cho biết lưu lượng truy cập mạng sẽ đi đâu. Các mạng con khác nhau có thể có các quy tắc định tuyến khác nhau.

### Nhóm bảo mật

Tường lửa ảo kiểm soát lưu lượng ở cấp độ máy chủ. Hãy coi họ như nhân viên bảo vệ cho từng phòng riêng lẻ.

## Lập kế hoạch mạng của bạn

Trước khi tạo bất cứ điều gì, hãy phác thảo thiết kế mạng của bạn. Một ứng dụng web điển hình có thể trông giống như:

```
Internet
    |
Internet Gateway
    |
Load Balancer (Public Subnet)
    |
Web Servers (Private Subnet)
    |
Database (Private Subnet)
```

Thiết kế này giữ cho máy chủ web và cơ sở dữ liệu của bạn ẩn khỏi truy cập internet trực tiếp trong khi vẫn cho phép bộ cân bằng tải của bạn phục vụ lưu lượng truy cập.

## Tạo VPC đầu tiên của bạn

Hãy xây dựng một mạng đơn giản nhưng an toàn cho ứng dụng web.

### Bước 1: Tạo VPC

Trong bảng điều khiển VPC, tạo một VPC mới với:

- **Name**: MyApp-VPC
- **IPv4 CIDR**: 10.0.0.0/16
- **IPv6**: Không cần thiết cho các ứng dụng cơ bản

Điều này cung cấp cho bạn một mạng riêng với 65.000 địa chỉ IP có thể.

### Bước 2: Tạo mạng con

Tạo hai mạng con ở các vùng khả dụng khác nhau để dự phòng:

**Mạng con công khai**:

- **Name**: Mạng con công cộng-A
- **Vùng sẵn có**: us-east-1a
- **IPv4 CIDR**: 10.0.1.0/24 (256 địa chỉ)

**Mạng con riêng**:

- **Name**: Mạng con riêng-A
- **Vùng sẵn có**: us-east-1a
- **IPv4 CIDR**: 10.0.10.0/24 (256 địa chỉ)

### Bước 3: Thiết lập quyền truy cập Internet

Tạo Cổng Internet và gắn nó vào VPC của bạn. Điều này cho phép kết nối internet cho mạng con công cộng của bạn.

### Bước 4: Định cấu hình định tuyến

Tạo các bảng lộ trình xác định cách lưu lượng truy cập:

- **Public Route Table**: Gửi lưu lượng truy cập internet đến Cổng Internet
- **Bảng tuyến đường riêng**: Giữ lưu lượng truy cập nội bộ (hiện tại)

## Nhóm bảo mật so với NACL

AWS cung cấp hai loại bảo mật mạng:

### Nhóm bảo mật (Được khuyến nghị)

- Áp dụng cho từng trường hợp riêng lẻ
- Stateful (tự động cho phép lưu lượng quay trở lại)
- Dễ quản lý và hiểu hơn
- Từ chối mặc định, cho phép rõ ràng những gì bạn cần

### ACL mạng

- Áp dụng cho toàn bộ mạng con
- Không quốc tịch (phải cho phép rõ ràng cả hai hướng)
- Phức tạp hơn nhưng cung cấp khả năng kiểm soát bổ sung
- Tốt cho các yêu cầu tuân thủ

Đối với hầu hết các ứng dụng, Nhóm bảo mật cung cấp đủ mức độ bảo mật với độ phức tạp ít hơn.

## Thiết lập nhóm bảo mật thực tế

Đây là cách bạn có thể định cấu hình nhóm bảo mật cho ứng dụng web:

### Nhóm bảo mật máy chủ web

**Quy tắc nội bộ**:

- HTTP (cổng 80) từ mọi nơi
- HTTPS (cổng 443) từ mọi nơi
- SSH (cổng 22) chỉ từ IP của bạn

**Quy tắc đi**:

- Tất cả lưu lượng truy cập được phép (mặc định)

### Nhóm bảo mật cơ sở dữ liệu

**Quy tắc nội bộ**:

- MySQL (cổng 3306) chỉ từ Nhóm bảo mật máy chủ web
- Không có truy cập internet trực tiếp

Thiết lập này đảm bảo cơ sở dữ liệu của bạn chỉ chấp nhận các kết nối từ máy chủ web của bạn.

## Cổng NAT cho mạng con riêng tư

Đôi khi các máy chủ trong mạng con riêng tư cần truy cập Internet để cập nhật hoặc gọi API bên ngoài, nhưng bạn không muốn chúng có thể truy cập trực tiếp từ Internet.

Cổng NAT hoạt động giống như cửa một chiều:

- Máy chủ riêng có thể thực hiện kết nối gửi đi
- Lưu lượng truy cập Internet không thể bắt đầu kết nối đến máy chủ riêng

Điều này là hoàn hảo cho:

- Cài đặt bản cập nhật phần mềm
- Gọi các API bên ngoài
- Đang tải xuống các phần phụ thuộc của ứng dụng

## Thiết kế Multi-AZ cho độ tin cậy

Đối với các ứng dụng production, hãy phân bổ tài nguyên trên nhiều Vùng sẵn sàng:

**Zone A**:

- Mạng con công cộng A
- Mạng con riêng A
- Máy chủ Web A
- Cơ sở dữ liệu chính

**Zone B**:

- Mạng con công cộng B
- Mạng con riêng B
- Máy chủ web B
- Chế độ chờ cơ sở dữ liệu

Thiết kế này tồn tại sau sự thất bại của toàn bộ trung tâm dữ liệu.

## Các mẫu VPC phổ biến

### Kiến trúc một tầng

Tất cả các tài nguyên trong mạng con công cộng. Đơn giản nhưng kém an toàn.
**Tốt cho**: Trang web tĩnh, ứng dụng đơn giản
**Không lý tưởng cho**: Ứng dụng xử lý dữ liệu nhạy cảm

### Kiến trúc hai tầng

Máy chủ web trong mạng con công cộng, cơ sở dữ liệu trong mạng con riêng tư.
**Tốt cho**: Hầu hết các ứng dụng web
**Security**: Trung bình

### Kiến trúc ba tầng

Cân bằng tải trong mạng con công cộng, máy chủ web trong mạng con riêng tư, cơ sở dữ liệu trong mạng con biệt lập.
**Tốt cho các ứng dụng**: production
**Security**: Cao

## Điểm cuối VPC cho dịch vụ AWS

Theo mặc định, khi phiên bản EC2 của bạn truy cập các dịch vụ AWS như S3, lưu lượng truy cập sẽ đi qua internet. Điểm cuối VPC cho phép bạn truy cập các dịch vụ AWS một cách riêng tư trong VPC của mình.

**Lợi ích**:

- Cải thiện tính bảo mật (lưu lượng truy cập vẫn nằm trong AWS)
- Hiệu suất tốt hơn (không cần đường vòng internet)
- Giảm chi phí truyền dữ liệu

**Điểm cuối chung**:

- S3 để lưu trữ tập tin
- DynamoDB cho cơ sở dữ liệu
- EC2 để quản lý phiên bản

## Kết nối nhiều VPC

Khi ứng dụng của bạn phát triển, bạn có thể cần nhiều VPC để:

- Các môi trường khác nhau (dev, staging, production)
- Các nhóm hoặc dự án khác nhau
- Các vùng khác nhau

VPC Peering kết nối các VPC để chúng có thể giao tiếp riêng tư. Nó giống như việc xây dựng một cây cầu riêng giữa hai tòa nhà.

## Giám sát mạng của bạn

CloudWatch cung cấp chức năng giám sát mạng:

- Nhật ký luồng **VPC**: Xem tất cả lưu lượng truy cập mạng
- **Số liệu ACL mạng**: Giám sát lưu lượng truy cập được phép/từ chối
- **NAT Số liệu cổng**: Theo dõi việc sử dụng và hiệu suất

Nhật ký luồng đặc biệt hữu ích cho việc phân tích bảo mật và khắc phục sự cố kết nối.

## Các vấn đề mạng thường gặp

### Không thể kết nối với phiên bản

Kiểm tra:

1. Nhóm bảo mật cho phép cổng được yêu cầu
2. Bảng lộ trình có các tuyến đường chính xác
3. Phiên bản nằm trong mạng con bên phải
4. NACL cho phép lưu lượng truy cập (nếu được tùy chỉnh)

### Phiên bản không thể truy cập Internet

Kiểm tra:

1. Phiên bản nằm trong mạng con công cộng, hoặc
2. Bảng định tuyến trỏ đến Internet Gateway (công khai) hoặc NAT Gateway (riêng tư)
3. Nhóm bảo mật cho phép lưu lượng truy cập ra ngoài

### Các dịch vụ không thể nói chuyện với nhau

Kiểm tra:

1. Nhóm bảo mật cho phép lưu lượng giữa các dịch vụ
2. Cả hai dịch vụ đều nằm trong cùng một VPC hoặc các VPC được kết nối
3. Độ phân giải DNS đang hoạt động

## Cân nhắc chi phí

Các thành phần VPC có ý nghĩa chi phí khác nhau:

- **VPC, mạng con, bảng định tuyến**: Miễn phí
- **Cổng Internet**: Miễn phí
- **NAT Gateway**: ~$45/tháng cộng với xử lý dữ liệu
- Điểm cuối **VPC**: $7-22/tháng tùy theo loại
- **Truyền dữ liệu**: Thay đổi theo số lượng và đích đến

## Thực tiễn tốt nhất cho người mới bắt đầu

### Bắt đầu đơn giản

Bắt đầu với kiến trúc hai tầng cơ bản và thêm độ phức tạp nếu cần.

### Lập kế hoạch không gian địa chỉ IP

Chọn các khối CIDR không xung đột với mạng văn phòng của bạn hoặc các VPC khác.

### Sử dụng cách đặt tên nhất quán

Đặt tên tài nguyên rõ ràng: "production-Web-Subnet" tốt hơn "Subnet-1".

### Tài liệu thiết kế của bạn

Ghi chú về lý do tại sao bạn đưa ra những lựa chọn nhất định. Tương lai bạn sẽ cảm ơn bạn.

### Kiểm tra quy tắc bảo mật

Xác minh rằng nhóm bảo mật của bạn hoạt động như mong đợi trước khi triển khai ứng dụng.

## Khi nào nên sử dụng VPC tùy chỉnh

**Luôn sử dụng VPC tùy chỉnh cho**:

- Ứng dụng production
- Ứng dụng xử lý dữ liệu nhạy cảm
- Ứng dụng nhiều tầng
- Các ứng dụng yêu cầu bố trí mạng cụ thể

**VPC mặc định phù hợp với**:

- Học tập và thử nghiệm
- Ứng dụng đơn giản, một máy chủ
- Nguyên mẫu nhanh

## Di chuyển từ VPC mặc định

Nếu bạn đã bắt đầu với VPC mặc định và cần chuyển sang VPC tùy chỉnh:

1. Tạo VPC mới của bạn
2. Khởi chạy các phiên bản mới trong VPC mới
3. Di chuyển dữ liệu và cấu hình
4. Cập nhật DNS để trỏ đến phiên bản mới
5. Chấm dứt các trường hợp cũ

Quá trình này tránh thời gian chết và cho phép bạn kiểm tra kỹ lưỡng.

## Các bước tiếp theo

Với việc VPC cung cấp nền tảng mạng an toàn, bạn đã sẵn sàng thêm các dịch vụ cơ sở dữ liệu được quản lý bằng RDS. Cơ sở dữ liệu được hưởng lợi rất nhiều từ bảo mật VPC và bạn sẽ biết cách đặt chúng vào mạng con riêng tư trong khi vẫn cho phép ứng dụng của mình kết nối.

Hiểu biết về mạng giúp bạn trở thành kiến trúc sư đám mây hiệu quả hơn. Các khái niệm bạn đã học ở đây không chỉ áp dụng cho AWS mà còn cho mọi nền tảng đám mây hoặc mạng trung tâm dữ liệu truyền thống.
