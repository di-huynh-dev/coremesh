---
title: "RDS - Dịch vụ cơ sở dữ liệu được quản lý"
description: Chạy MySQL, PostgreSQL hoặc SQL Server trên AWS RDS mà không cần quản lý máy chủ. Bao gồm việc sao lưu, vá lỗi, thay đổi quy mô, chuyển đổi dự phòng Multi-AZ và chọn lớp phiên bản.
order: 6
---

Vận hành cơ sở dữ liệu cũng giống như bảo trì một chiếc ô tô hiệu suất cao - nó đòi hỏi phải thường xuyên điều chỉnh, giám sát, sao lưu và có kiến thức chuyên môn để giữ cho nó hoạt động trơn tru. Amazon RDS (Dịch vụ cơ sở dữ liệu quan hệ) giống như có một đội kỹ thuật chuyên nghiệp xử lý tất cả công việc bảo trì trong khi bạn tập trung vào việc sử dụng ô tô.

RDS sử dụng các cơ sở dữ liệu phổ biến như MySQL, PostgreSQL và SQL Server, đồng thời xử lý tất cả các công việc hậu trường mà quản trị viên cơ sở dữ liệu thường làm.

## Tại sao nên sử dụng cơ sở dữ liệu được quản lý?

Quản lý cơ sở dữ liệu truyền thống bao gồm:

- Cài đặt và cấu hình phần mềm cơ sở dữ liệu
- Thiết lập sao lưu tự động
- Áp dụng các bản vá bảo mật
- Giám sát hiệu suất và mở rộng quy mô
- Lập kế hoạch khắc phục thảm họa
- Xử lý lỗi phần cứng

RDS tự động xử lý tất cả những việc này, cho phép bạn tập trung vào ứng dụng của mình thay vì bảo trì cơ sở dữ liệu.

## RDS quản lý những gì cho bạn

### Sao lưu tự động

RDS sao lưu cơ sở dữ liệu của bạn hàng ngày và lưu giữ nhật ký giao dịch, cho phép bạn khôi phục về bất kỳ thời điểm nào trong thời gian lưu giữ của mình (tối đa 35 ngày).

### Cập nhật phần mềm

Công cụ cơ sở dữ liệu nhận được các bản vá và cập nhật bảo mật thường xuyên, được áp dụng trong thời gian bảo trì mà bạn kiểm soát.

### Giám sát và cảnh báo

Tính năng giám sát tích hợp theo dõi hiệu suất cơ sở dữ liệu, kết nối và mức sử dụng tài nguyên bằng tích hợp CloudWatch.

### Tính sẵn sàng cao

Triển khai Multi-AZ tự động sao chép cơ sở dữ liệu của bạn sang phiên bản dự phòng ở một trung tâm dữ liệu khác.

### Chia tỷ lệ

Tăng CPU, bộ nhớ hoặc dung lượng lưu trữ với thời gian ngừng hoạt động tối thiểu khi ứng dụng của bạn phát triển.

## Chọn công cụ cơ sở dữ liệu của bạn

RDS hỗ trợ sáu công cụ cơ sở dữ liệu, mỗi công cụ có điểm mạnh khác nhau:

### PostgreSQL (Được khuyến nghị cho người mới bắt đầu)

- **Tốt nhất cho**: Hầu hết các ứng dụng web, phân tích dữ liệu, truy vấn phức tạp
- **Điểm mạnh**: Tính năng phong phú, tuân thủ các tiêu chuẩn xuất sắc, cộng đồng vững mạnh
- **Cost**: Miễn phí (giấy phép nguồn mở)

### MySQL

- **Tốt nhất cho**: Ứng dụng web, hệ thống quản lý nội dung
- **Strengths**: Được sử dụng rộng rãi, nhiều tài liệu và hướng dẫn
- **Cost**: Miễn phí (giấy phép nguồn mở)

### Amazon cực quang

- **Best for**: Các ứng dụng hiệu suất cao cần khả năng tương thích với MySQL/PostgreSQL
- **Strengths**: Hiệu suất tốt hơn so với MySQL/PostgreSQL tiêu chuẩn, các tính năng gốc AWS
- **Cost**: Đắt hơn nhưng hiệu suất trên mỗi đô la tốt hơn

### Máy chủ SQL

- **Tốt nhất cho**: Ứng dụng Windows, phát triển .NET
- **Strengths**: Tích hợp chặt chẽ với Microsoft, quen thuộc với các nhà phát triển Windows
- **Cost**: Yêu cầu giấy phép của Microsoft (đắt tiền)

### Lời tiên tri

- **Tốt nhất cho**: Ứng dụng doanh nghiệp với các khoản đầu tư hiện có của Oracle
- **Strengths**: Các tính năng nâng cao cho các ứng dụng quy mô lớn
- **Cost**: Giấy phép đắt tiền

### MariaDB

- **Tốt nhất cho**: MySQL thay thế với các tính năng nâng cao
- **Strengths**: Tương thích với MySQL với các khả năng bổ sung
- **Cost**: Miễn phí (giấy phép nguồn mở)

## Tìm hiểu các lớp phiên bản RDS

Giống như các phiên bản EC2, RDS sử dụng các "lớp" khác nhau được tối ưu hóa cho các khối lượng công việc khác nhau:

### Hiệu suất ổn định (t3/t4g)

- **Tốt nhất cho**: Phát triển, thử nghiệm, ứng dụng nhỏ
- **Cost**: Tùy chọn chi phí thấp nhất
- **Performance**: Có thể thay đổi (bùng nổ khi cần)
- **Example**: db.t3.micro (đủ điều kiện sử dụng bậc miễn phí)

### Mục đích chung (m5/m6i)

- **Tốt nhất cho**: Hầu hết các ứng dụng production
- **Cost**: Giá cả/hiệu suất cân bằng
- **Performance**: Nhất quán và đáng tin cậy
- **Example**: db.m5.large

### Tối ưu hóa bộ nhớ (r5/r6i)

- **Tốt nhất cho**: Cơ sở dữ liệu trong bộ nhớ, khối lượng công việc phân tích
- **Cost**: Chi phí cao hơn để có nhiều bộ nhớ hơn
- **Performance**: Tỷ lệ bộ nhớ trên CPU cao
- **Example**: db.r5.xlarge

Đối với học tập và các ứng dụng nhỏ, hãy bắt đầu với db.t3.micro (cấp miễn phí) và mở rộng quy mô nếu cần.

## Tạo cơ sở dữ liệu RDS đầu tiên của bạn

Hãy tạo cơ sở dữ liệu PostgreSQL cho một ứng dụng web.

### Lập kế hoạch cơ sở dữ liệu của bạn

Trước khi tạo bất cứ điều gì, hãy xem xét:

- **Bạn sẽ lưu trữ dữ liệu gì**: Tài khoản người dùng, bài đăng trên blog, sản phẩm thương mại điện tử?
- **Bao nhiêu dữ liệu**: Một vài MB hoặc vài GB?
- **Nhu cầu hiệu suất**: Có bao nhiêu người dùng đồng thời?
- **Yêu cầu sao lưu**: Tần suất và thời gian lưu giữ bản sao lưu?

### Cấu hình cơ sở dữ liệu

**Engine**: PostgreSQL (phiên bản mới nhất)
**Lớp phiên bản**: db.t3.micro (cấp miễn phí)
**Storage**: SSD đa dụng 20 GB (cấp miễn phí)
**Multi-AZ**: Tắt để tiết kiệm chi phí (bật trong production)

### Mạng và Bảo mật

**VPC**: Sử dụng VPC tùy chỉnh mà bạn đã tạo trước đó
**Subnet Group**: Đặt trong các mạng con riêng tư (không thể truy cập trực tiếp từ internet)
**Nhóm bảo mật**: Chỉ cho phép truy cập từ máy chủ web của bạn

### Cài đặt cơ sở dữ liệu

**Database Name**: Tạo cơ sở dữ liệu ban đầu (như `webapp_production`)
**Master Tên người dùng**: Chọn một cái gì đó như `dbadmin`
**Mật khẩu chính**: Sử dụng mật khẩu mạnh, duy nhất

## Kết nối với cơ sở dữ liệu của bạn

Khi phiên bản RDS của bạn đang chạy, bạn sẽ cần kết nối với phiên bản đó từ ứng dụng của mình.

### Từ máy tính của bạn (để thử nghiệm)

Nếu bạn muốn kết nối trực tiếp từ máy tính xách tay của mình để thử nghiệm:

```bash
# Install PostgreSQL client
# On Mac: brew install postgresql
# On Ubuntu: sudo apt install postgresql-client

# Connect to your database
psql -h your-database-endpoint.amazonaws.com -U dbadmin -d webapp_production
```

### Từ phiên bản EC2 của bạn

Máy chủ web của bạn sẽ kết nối với cơ sở dữ liệu bằng chuỗi kết nối:

```javascript
// Example Node.js connection
const { Pool } = require('pg');

const pool = new Pool({
  host: 'your-database-endpoint.amazonaws.com',
  port: 5432,
  database: 'webapp_production',
  user: 'webapp_user',
  password: process.env.DB_PASSWORD, // Store password in environment variable
  max: 20, // Maximum number of connections in pool
});
```

### Thực tiễn tốt nhất về kết nối

**Sử dụng nhóm kết nối**: Không tạo kết nối mới cho mọi yêu cầu
**Lưu trữ thông tin xác thực một cách an toàn**: Sử dụng các biến môi trường hoặc AWS Secrets Manager
**Lỗi kết nối xử lý**: Cơ sở dữ liệu có thể tạm thời không khả dụng
**Theo dõi việc sử dụng kết nối**: Quá nhiều kết nối có thể gây ra vấn đề về hiệu suất

## Bảo mật cơ sở dữ liệu

### An ninh mạng

**Private Subnets**: Giữ cơ sở dữ liệu trong các mạng con riêng tư mà không cần truy cập internet trực tiếp
**Nhóm bảo mật**: Chỉ cho phép kết nối từ các nguồn cụ thể (máy chủ web của bạn)
**VPC**: Sử dụng VPC tùy chỉnh của bạn, không phải VPC mặc định

### Kiểm soát truy cập

**Database Users**: Tạo người dùng dành riêng cho ứng dụng với quyền hạn chế
**Mật khẩu mạnh**: Sử dụng mật khẩu dài, phức tạp được lưu trữ an toàn
**SSL/TLS**: Luôn mã hóa các kết nối giữa ứng dụng và cơ sở dữ liệu

### Ví dụ về thiết lập bảo mật

```sql
-- Connect as master user and create application user
CREATE USER webapp_user WITH PASSWORD 'strong_random_password';
CREATE DATABASE webapp_production OWNER webapp_user;

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE webapp_production TO webapp_user;
GRANT USAGE ON SCHEMA public TO webapp_user;
GRANT CREATE ON SCHEMA public TO webapp_user;
```

## Hiểu lưu trữ RDS

RDS cung cấp các loại lưu trữ khác nhau được tối ưu hóa cho các nhu cầu khác nhau:

### SSD mục đích chung (gp2)

- **Tốt nhất cho**: Hầu hết các ứng dụng
- **Performance**: 3 IOPS mỗi GB, có thể bùng nổ lên 3.000 IOPS
- **Cost**: Cân bằng chi phí và hiệu suất
- **Size**: 20 GB đến 64 TB

### SSD IOPS được cung cấp (io1)

- **Tốt nhất cho**: Các ứng dụng chuyên sâu về I/O
- **Performance**: Lên tới 64.000 IOPS, hiệu suất ổn định
- **Cost**: Chi phí cao hơn để đảm bảo hiệu suất
- **Size**: 100 GB đến 64 TB

### Lưu trữ từ tính

- **Tốt nhất cho**: Dữ liệu được truy cập không thường xuyên
- **Performance**: Khoảng 100 IOPS
- **Cost**: Tùy chọn chi phí thấp nhất
- **Size**: 10 GB đến 3 TB

Đối với hầu hết các ứng dụng, SSD Mục đích Chung mang lại sự cân bằng tốt nhất giữa hiệu suất và chi phí.

## Chiến lược sao lưu và phục hồi

### Sao lưu tự động

RDS tự động sao lưu cơ sở dữ liệu của bạn:

- **DẢnh chụp nhanh hàng ngày**: Sao lưu cơ sở dữ liệu hoàn chỉnh
- **Nhật ký giao dịch**: Cho phép khôi phục tại thời điểm
- **Thời gian lưu giữ**: 1-35 ngày (bạn chọn)
- **Cửa sổ sao lưu**: Lên lịch trong thời gian sử dụng thấp

### Ảnh chụp nhanh thủ công

Tạo ảnh chụp nhanh trước những thay đổi lớn:

- **Trước khi triển khai phần mềm**: Dễ dàng khôi phục nếu có sự cố
- **Trước khi di chuyển dữ liệu**: Khôi phục nếu di chuyển không thành công
- **Điểm kiểm tra định kỳ**: An toàn bổ sung ngoài sao lưu tự động

### Phục hồi tại thời điểm

Khôi phục cơ sở dữ liệu của bạn vào bất kỳ lúc nào trong khoảng thời gian lưu giữ bản sao lưu của bạn:

- **AXóa dữ liệu ngẫu nhiên**: Khôi phục về ngay trước khi xảy ra lỗi
- **Khám phá tham nhũng**: Quay trở lại thời điểm dữ liệu được biết là tốt
- **Các kịch bản thử nghiệm**: Tạo bản sao dữ liệu production tại một điểm cụ thể

## Mở rộng cơ sở dữ liệu của bạn

Khi ứng dụng của bạn phát triển, bạn sẽ cần mở rộng quy mô cơ sở dữ liệu của mình:

### Chia tỷ lệ theo chiều dọc (Tăng tỷ lệ)

Tăng sức mạnh cho cơ sở dữ liệu hiện có của bạn:

- **More CPU**: Xử lý nhiều kết nối đồng thời hơn
- **Thêm bộ nhớ**: Thêm nhiều dữ liệu vào bộ nhớ đệm để truy vấn nhanh hơn
- **Lưu trữ nhiều hơn**: Lưu trữ nhiều dữ liệu hơn
- **Mạng tốt hơn**: Xử lý nhiều lưu lượng truy cập hơn

Chia tỷ lệ theo chiều dọc bao gồm thời gian ngừng hoạt động ngắn (thường là vài phút) trong quá trình nâng cấp.

### Đọc bản sao (Tăng tỷ lệ)

Tạo bản sao chỉ đọc của cơ sở dữ liệu của bạn:

- **Giảm tải**: Phân phối các truy vấn đã đọc trên nhiều cơ sở dữ liệu
- **Phân phối địa lý**: Đặt bản sao gần hơn với người dùng
- **Reporting**: Chạy truy vấn phân tích mà không ảnh hưởng đến cơ sở dữ liệu chính
- **Tính sẵn sàng cao**: Nâng cấp bản sao lên chính nếu cơ sở dữ liệu chính bị lỗi

### Khi nào cần chia tỷ lệ

Theo dõi các số liệu này để biết khi nào cần mở rộng quy mô:

- **Mức sử dụng CPU**: Luôn ở mức trên 80%
- **Mức sử dụng bộ nhớ**: Tỷ lệ bộ nhớ khả dụng đã được sử dụng cao
- **Số lượng kết nối**: Đang đạt đến giới hạn kết nối của phiên bản của bạn
- **Hiệu suất truy vấn**: Truy vấn mất nhiều thời gian hơn bình thường

## Triển khai Multi-AZ để có tính sẵn sàng cao

Multi-AZ tạo bản sao dự phòng cho cơ sở dữ liệu của bạn ở một trung tâm dữ liệu khác:

### Multi-AZ hoạt động như thế nào

1. **Sao chép đồng bộ**: Mọi thao tác ghi đều được sao chép sang chế độ chờ ngay lập tức
2. **Tự động chuyển đổi dự phòng**: Nếu lỗi chính, RDS chuyển sang chế độ chờ trong vòng 60-120 giây
3. **Same endpoint**: Ứng dụng của bạn không cần biết về chuyển đổi dự phòng
4. **Tự động phục hồi**: Bản chính bị lỗi được sửa chữa và trở thành bản dự phòng mới

### Khi nào nên sử dụng Multi-AZ

- **Ứng dụng sản xuất**: Trường hợp thời gian ngừng hoạt động gây tốn kém
- **Yêu cầu tuân thủ**: Một số quy định yêu cầu tính sẵn sàng cao
- **Yên tâm**: Ngủ ngon hơn khi biết cơ sở dữ liệu của bạn có thể xử lý lỗi

### Multi-AZ so với Bản sao đã đọc

**Multi-AZ**: Tính sẵn sàng cao, chuyển đổi dự phòng tự động, cùng khu vực
**Read Replicas**: Chia tỷ lệ hiệu suất, quảng bá thủ công, có thể ở các khu vực khác nhau

## Quản lý chi phí cho RDS

### Hiểu giá RDS

Giá RDS bao gồm:

- **Giờ phiên bản**: Dựa trên lớp phiên bản và công cụ
- **Storage**: GB mỗi tháng cho dung lượng lưu trữ được phân bổ
- **I/O request**: Phí cho các hoạt động cơ sở dữ liệu (một số lớp phiên bản bao gồm các khoản phí này)
- **Backups**: Dung lượng lưu trữ vượt quá thời gian lưu giữ bản sao lưu của bạn
- **Truyền dữ liệu**: Di chuyển dữ liệu giữa các vùng hoặc tới internet

### Chiến lược tối ưu hóa chi phí

**Phiên bản có kích thước phù hợp**: Giám sát việc sử dụng và điều chỉnh lớp phiên bản nếu cần
**Phiên bản dự trữ**: commit lên tới 1-3 năm với mức giảm giá đáng kể (tiết kiệm 30-60%)
**Tối ưu hóa lưu trữ**: Không phân bổ quá mức dung lượng lưu trữ mà hãy lập kế hoạch tăng trưởng
**Quản lý sao lưu**: Cân bằng nhu cầu duy trì với chi phí lưu trữ

### Lợi ích của bậc miễn phí

Tài khoản AWS mới nhận được:

- **750 giờ mỗi tháng** của phiên bản db.t2.micro hoặc db.t3.micro
- **20 GB dung lượng lưu trữ** (bất kỳ loại nào)
- **20 GB dung lượng lưu trữ dự phòng**

Điều này đủ để chạy một cơ sở dữ liệu nhỏ 24/7 trong năm đầu tiên của bạn.

## Giám sát cơ sở dữ liệu của bạn

### Giám sát tích hợp

RDS cung cấp khả năng giám sát tự động thông qua CloudWatch:

- **Sử dụng CPU**: Cơ sở dữ liệu của bạn đang hoạt động tốt như thế nào
- **Số lượng kết nối**: Số lượng kết nối đang hoạt động
- **Đọc/ghi IOPS**: Mức độ hoạt động của cơ sở dữ liệu
- **Lưu trữ miễn phí**: Dung lượng ổ đĩa khả dụng

### Thông tin chi tiết về hiệu suất

Giám sát nâng cao cung cấp khả năng hiển thị sâu hơn:

- **Câu lệnh SQL hàng đầu**: Truy vấn nào sử dụng nhiều tài nguyên nhất
- **Sự kiện chờ**: Cơ sở dữ liệu của bạn dành thời gian chờ đợi điều gì
- **Tải cơ sở dữ liệu**: Mẫu hiệu suất tổng thể

### Thiết lập cảnh báo

Tạo cảnh báo CloudWatch cho các số liệu quan trọng:

- **CPU cao**: Cảnh báo khi liên tục trên 80%
- **Low storage**: Cảnh báo khi sắp hết dung lượng
- **Giới hạn kết nối**: Cảnh báo khi đạt đến giới hạn kết nối
- **Lỗi sao lưu**: Thông báo ngay lập tức về các sự cố sao lưu

## Các mẫu cơ sở dữ liệu phổ biến

### Mẫu ứng dụng web

**Architecture**: Máy chủ web trong mạng con công cộng, cơ sở dữ liệu trong mạng con riêng tư
**Security**: Cơ sở dữ liệu chỉ có thể truy cập được từ máy chủ web
**Scaling**: Bắt đầu với quy mô nhỏ, thêm bản sao chỉ có quyền đọc khi lưu lượng truy cập tăng lên
**Backups**: Sao lưu tự động hàng ngày với khả năng lưu giữ trong 7 ngày

### Mẫu phát triển/thử nghiệm

**Architecture**: Phiên bản cơ sở dữ liệu đơn, có thể được chia sẻ giữa các dự án
**Security**: Bảo mật thoải mái để truy cập phát triển dễ dàng hơn
**Scaling**: Tối thiểu - tập trung vào tiết kiệm chi phí
**Backups**: Thời gian lưu giữ ngắn hơn, chụp nhanh thủ công trước những thay đổi lớn

### Mẫu doanh nghiệp

**Architecture**: Multi-AZ chính với bản sao chỉ có quyền đọc
**Security**: Mã hóa khi lưu trữ và đang truyền, kiểm soát truy cập nghiêm ngặt
**Scaling**: Phiên bản dự trữ, chính sách mở rộng tự động
**Backups**: Thời gian lưu giữ mở rộng, bản sao lưu giữa các khu vực

## Khắc phục sự cố thường gặp

### Sự cố kết nối

**Không thể kết nối từ ứng dụng**:

- Kiểm tra nhóm bảo mật cho phép lưu lượng truy cập trên cổng cơ sở dữ liệu
- Xác minh cơ sở dữ liệu có cùng VPC với ứng dụng
- Xác nhận chuỗi kết nối là chính xác

**Quá nhiều kết nối**:

- Triển khai kết nối tổng hợp trong ứng dụng của bạn
- Giám sát và đóng các kết nối không sử dụng
- Hãy cân nhắc nâng cấp lên lớp phiên bản lớn hơn

### Vấn đề về hiệu suất

**Truy vấn chậm**:

- Sử dụng Thông tin chi tiết về hiệu suất để xác định các truy vấn có vấn đề
- Xem lại các chỉ mục cơ sở dữ liệu
- Xem xét các bản sao đọc cho khối lượng công việc đọc nhiều

**Mức sử dụng CPU cao**:

- Tối ưu hóa truy vấn cơ sở dữ liệu
- Thêm chỉ mục thích hợp
- Mở rộng quy mô lên lớp phiên bản lớn hơn

### Sự cố lưu trữ

**Hết dung lượng**:

- Bật tính năng tự động mở rộng quy mô bộ nhớ
- Tăng dung lượng lưu trữ được phân bổ
- Dọn dẹp dữ liệu cũ hoặc thực hiện lưu trữ

## Khi nào không nên sử dụng RDS

Mặc dù RDS rất tốt cho hầu hết các ứng dụng nhưng hãy xem xét các lựa chọn thay thế cho:

### Yêu cầu NoSQL

Sử dụng DynamoDB cho nhu cầu lưu trữ khóa-giá trị hoặc tài liệu

### Nhu cầu hiệu suất cực cao

Cân nhắc việc chạy cơ sở dữ liệu trên EC2 với cấu hình chuyên dụng

### Yêu cầu phần mềm cụ thể

Một số ứng dụng cần cấu hình cơ sở dữ liệu không được RDS hỗ trợ

### Phát triển nhạy cảm với chi phí

Đối với các dự án học tập hoặc dự án rất nhỏ, hãy cân nhắc việc chạy cơ sở dữ liệu trên các phiên bản EC2 nhỏ

## Các bước tiếp theo

Với cơ sở dữ liệu của bạn chạy an toàn trong RDS, bạn đã sẵn sàng tìm hiểu về cách xử lý sự gia tăng lưu lượng truy cập bằng cân bằng tải và tự động thay đổi quy mô. Các dịch vụ này hoạt động cùng với RDS để tạo ra các ứng dụng có thể tự động xử lý các tải khác nhau.

Cơ sở dữ liệu của bạn cung cấp nền tảng để lưu trữ dữ liệu một cách đáng tin cậy, trong khi bộ cân bằng tải và khả năng tự động thay đổi quy mô đảm bảo máy chủ web của bạn có thể xử lý số lượng người dùng mà bạn có, từ hàng chục đến hàng triệu.

Hiểu cách các phần này hoạt động cùng nhau là chìa khóa để xây dựng các ứng dụng vừa có khả năng mở rộng vừa tiết kiệm chi phí.
