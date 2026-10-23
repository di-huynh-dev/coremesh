---
title: "Cân bằng tải và tự động chia tỷ lệ"
description: Xử lý lưu lượng truy cập tăng đột biến một cách linh hoạt bằng cách phân phối tải và tự động điều chỉnh công suất.
order: 7
---

Hãy tưởng tượng trang web của bạn đột nhiên trở nên phổ biến - có thể bạn được giới thiệu trên mạng xã hội hoặc một trang tin tức liên kết đến nội dung của bạn. Nếu không có kế hoạch phù hợp, thành công này có thể làm sập trang web của bạn khi hàng nghìn người dùng cố gắng truy cập nó cùng một lúc.

Cân bằng tải và tự động điều chỉnh quy mô giải quyết vấn đề này bằng cách tự động phân bổ lưu lượng truy cập trên nhiều máy chủ và bổ sung thêm dung lượng khi cần. Nó giống như có một hệ thống quản lý giao thông thông minh mở thêm làn đường trong giờ cao điểm.

## Sự cố với máy chủ đơn

Dịch vụ lưu trữ web truyền thống thường sử dụng một máy chủ để xử lý tất cả lưu lượng truy cập:

- **Một điểm lỗi**: Nếu máy chủ gặp sự cố, toàn bộ trang web của bạn sẽ ngừng hoạt động
- **Dung lượng hạn chế**: Một máy chủ chỉ có thể xử lý rất nhiều người dùng
- **Tài nguyên bị lãng phí**: Trong thời gian yên tĩnh, bạn phải trả tiền cho dung lượng không được sử dụng
- **Không linh hoạt**: Không thể dễ dàng bổ sung thêm năng lượng trong thời gian bận rộn

## Cân bằng tải giải quyết vấn đề này như thế nào

Bộ cân bằng tải hoạt động như một nhân viên lễ tân thông minh tại một nhà hàng đông khách:

- **Phân phối khách hàng**: Gửi mỗi khách truy cập đến máy chủ ít bận rộn nhất
- **Kiểm tra sức khỏe**: Biết máy chủ nào đang hoạt động và máy chủ nào không
- **Trải nghiệm liền mạch**: Người dùng không biết họ đang được chuyển hướng đến các máy chủ khác nhau
- **Xử lý lỗi**: Nếu một máy chủ bị lỗi, lưu lượng truy cập sẽ tự động chuyển sang các máy chủ khỏe mạnh

## Hiểu tự động chia tỷ lệ

Tự động mở rộng quy mô giống như có một nhà hàng kỳ diệu có thể thêm hoặc xóa bảng ngay lập tức dựa trên quy mô đám đông:

- **Mở rộng**: Thêm nhiều máy chủ hơn khi lưu lượng truy cập tăng
- **Scale in**: Xóa máy chủ khi lưu lượng truy cập giảm
- **Tối ưu hóa chi phí**: Chỉ thanh toán cho những gì bạn cần tại bất kỳ thời điểm nào
- **Automatic**: Không cần can thiệp thủ công

## Các loại cân bằng tải

AWS cung cấp ba loại cân bằng tải cho các nhu cầu khác nhau:

### Cân bằng tải ứng dụng (ALB)

- **Tốt nhất cho**: Ứng dụng web, lưu lượng HTTP/HTTPS
- **Features**: Định tuyến thông minh dựa trên URL, tên máy chủ hoặc tiêu đề
- **Example**: Gửi yêu cầu `/api/*` tới máy chủ API, mọi thứ khác đến máy chủ web

### Cân bằng tải mạng (NLB)

- **Tốt nhất cho**: Ứng dụng hiệu suất cao, lưu lượng TCP/UDP
- **Features**: Độ trễ cực thấp, xử lý hàng triệu yêu cầu mỗi giây
- **Example**: Máy chủ chơi game, ứng dụng IoT

### Cân bằng tải cổ điển

- **Tốt nhất cho**: Các ứng dụng kế thừa (không được khuyến nghị cho các dự án mới)
- **Tính năng**: Cân bằng tải cơ bản
- **Note**: Loại bỏ dần để chuyển sang ALB và NLB

Đối với các ứng dụng web, Cân bằng tải ứng dụng hầu như luôn là lựa chọn phù hợp.

## Tạo cân bằng tải đầu tiên của bạn

Hãy thiết lập bộ cân bằng tải cho ứng dụng web có thể xử lý lưu lượng truy cập tăng đột biến một cách linh hoạt.

### Lập kế hoạch thiết lập của bạn

Trước khi tạo bất cứ thứ gì, hãy nghĩ về:

- **Thông thường bạn cần bao nhiêu máy chủ**: Bắt đầu với 2 để dự phòng
- **Lưu lượng truy cập cao nhất của bạn là bao nhiêu**: Có bao nhiêu máy chủ trong thời gian bận rộn
- **Người dùng của bạn ở đâu**: Một khu vực hoặc toàn cầu
- **Loại lưu lượng truy cập**: Trang web, lệnh gọi API, tải xuống tệp

### Cấu hình cân bằng tải

**Type**: Cân bằng tải ứng dụng
**Scheme**: Kết nối Internet (người dùng có thể truy cập nó từ web)
**Subnets**: Đặt trong các mạng con công cộng trên nhiều vùng khả dụng
**Security**: Cho phép HTTP (cổng 80) và HTTPS (cổng 443) từ mọi nơi

### Nhóm mục tiêu

Các nhóm mục tiêu xác định máy chủ nào nhận được lưu lượng truy cập:

- **Name**: máy chủ web-nhóm mục tiêu
- **Protocol**: HTTP trên cổng 80
- **Health check**: Kiểm tra điểm cuối `/health` cứ sau 30 giây
- **Ngưỡng khỏe mạnh**: 2 lần kiểm tra thành công liên tiếp
- **Ngưỡng không tốt**: 5 lần kiểm tra thất bại liên tiếp

## Hiểu về kiểm tra sức khỏe

Kiểm tra tình trạng giống như bác sĩ thường xuyên kiểm tra bệnh nhân - họ đảm bảo chỉ những máy chủ khỏe mạnh mới nhận được lưu lượng truy cập.

### Điều gì tạo nên một máy chủ khỏe mạnh?

Kiểm tra sức khỏe tốt sẽ xác minh:

- **Máy chủ web đang chạy**: Có thể phản hồi các yêu cầu HTTP
- **Ứng dụng đang hoạt động**: Không chỉ máy chủ web mà cả ứng dụng thực tế của bạn
- **Kết nối cơ sở dữ liệu**: Ứng dụng có thể giao tiếp với cơ sở dữ liệu không
- **Phụ thuộc quan trọng**: Bất kỳ dịch vụ bên ngoài nào mà ứng dụng của bạn cần

### Ví dụ về điểm cuối kiểm tra tình trạng

```javascript
// Simple health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await database.query('SELECT 1');

    // Check critical services
    const checks = {
      database: 'healthy',
      timestamp: new Date().toISOString(),
      server: process.env.SERVER_ID,
    };

    res.status(200).json(checks);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});
```

## Thiết lập tự động chia tỷ lệ

Nhóm Auto Scaling (ASG) tự động quản lý các bộ sưu tập phiên bản EC2:

### Tùy chọn cấu hình chính

**Kích thước tối thiểu**: Luôn duy trì ít nhất số lượng máy chủ này chạy
**Kích thước tối đa**: Không bao giờ vượt quá số lượng máy chủ này (bảo vệ chi phí)
**DDung lượng mong muốn**: Bạn muốn bao nhiêu máy chủ chạy bình thường
**Chính sách mở rộng quy mô**: Quy tắc về thời điểm thêm hoặc xóa máy chủ

### Cấu hình ví dụ

Đối với một ứng dụng web nhỏ:

- **Minimum**: 2 máy chủ (để dự phòng)
- **Maximum**: 10 máy chủ (bảo vệ chi phí)
- **Desired**: 2 máy chủ (hoạt động bình thường)

Thiết lập này đảm bảo bạn luôn có dự phòng nhưng sẽ không vô tình tạo ra các tài nguyên đắt tiền.

## Chính sách mở rộng quy mô: Khi nào cần thêm hoặc xóa máy chủ

### Chia tỷ lệ dựa trên CPU

Cách tiếp cận phổ biến nhất - quy mô dựa trên mức sử dụng CPU của máy chủ:

- **Tăng quy mô**: Thêm máy chủ khi CPU trung bình > 70% trong 5 phút
- **Scale in**: Xóa máy chủ khi CPU trung bình < 30% trong 10 phút

### Chia tỷ lệ dựa trên yêu cầu

Quy mô dựa trên lưu lượng truy cập đến:

- **Mở rộng**: Thêm máy chủ khi yêu cầu trên mỗi máy chủ > 1000/phút
- **Scale in**: Xóa máy chủ khi yêu cầu trên mỗi máy chủ < 200/phút

### Chia tỷ lệ theo lịch trình

Nếu bạn biết thời điểm lưu lượng truy cập tăng đột biến:

- **Giờ làm việc**: Tăng quy mô lúc 8 giờ sáng, giảm quy mô lúc 6 giờ chiều
- **Seasonal**: Tăng công suất trong mùa mua sắm nghỉ lễ
- **Events**: Tăng quy mô trước khi ra mắt sản phẩm hoặc chiến dịch tiếp thị

## Mẫu khởi chạy: Bản thiết kế cho máy chủ mới

Khi tự động chia tỷ lệ thêm máy chủ, nó cần biết cách định cấu hình chúng. Các mẫu khởi chạy giống như các công thức chỉ định:

### Cấu hình máy chủ

**Loại phiên bản**: Kích thước máy chủ cần tạo
**Nhóm bảo mật**: Áp dụng quy tắc tường lửa nào
**IAM Role**: Máy chủ nên có những quyền gì
**Key Pair**: Cách truy cập máy chủ để khắc phục sự cố

### Cài đặt ứng dụng

**User Data Script**: Các lệnh chạy khi máy chủ khởi động lần đầu
**Cài đặt ứng dụng**: Tải xuống và cài đặt ứng dụng của bạn
**Configuration**: Kết nối cơ sở dữ liệu, đặt biến môi trường
**Service Startup**: Khởi động ứng dụng và máy chủ web của bạn

### Tập lệnh dữ liệu người dùng mẫu

```bash
#!/bin/bash
# Update the system
yum update -y

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install your application
cd /home/ec2-user
# Your application setup commands here
npm install
npm start
```

## Tích hợp Load Balancer với Auto Scaling

Điều kỳ diệu xảy ra khi bộ cân bằng tải và khả năng tự động điều chỉnh quy mô hoạt động cùng nhau:

1. **Lưu lượng truy cập tăng**: Nhiều người dùng truy cập trang web của bạn hơn
2. **Máy chủ bận rộn**: Mức sử dụng CPU tăng trên các máy chủ của bạn
3. **Trình kích hoạt mở rộng quy mô tự động**: Thêm máy chủ mới dựa trên chính sách mở rộng quy mô của bạn
4. **Bộ cân bằng tải thích ứng**: Tự động bắt đầu gửi lưu lượng truy cập đến các máy chủ mới
5. **Traffic phân phối**: Tải trải đều trên tất cả các máy chủ khỏe mạnh

Khi lưu lượng truy cập giảm, quá trình sẽ tự động đảo ngược.

## Chứng chỉ SSL/TLS cho HTTPS

Các trang web hiện đại cần HTTPS để bảo mật và SEO. AWS khiến việc này trở nên dễ dàng:

### Trình quản lý chứng chỉ AWS

Chứng chỉ SSL miễn phí để sử dụng với bộ cân bằng tải:

- **Tự động gia hạn**: Không bao giờ lo lắng về chứng chỉ hết hạn
- **Cài đặt dễ dàng**: Gắn vào cân bằng tải chỉ bằng vài cú nhấp chuột
- **DXác thực tên miền**: Chứng minh bạn sở hữu tên miền

### Thiết lập HTTPS

1. **Yêu cầu chứng chỉ**: Sử dụng Trình quản lý chứng chỉ để yêu cầu chứng chỉ cho miền của bạn
2. **Validate domain**: Chứng minh quyền sở hữu thông qua DNS hoặc email
3. **Đính kèm bộ cân bằng tải**: Định cấu hình trình nghe HTTPS bằng chứng chỉ của bạn
4. **Chuyển hướng HTTP sang HTTPS**: Buộc tất cả lưu lượng truy cập sử dụng kết nối an toàn

## Định tuyến dựa trên đường dẫn

Cân bằng tải nâng cao có thể định tuyến lưu lượng truy cập dựa trên đường dẫn URL:

### Ví dụ về quy tắc định tuyến

**Lưu lượng truy cập trang web** (`/`): Gửi tới máy chủ web
**API Traffic** (`/api/*`): Gửi tới máy chủ API
**Admin Panel** (`/admin/*`): Gửi đến máy chủ quản trị
**Tệp tĩnh** (`/static/*`): Gửi đến máy chủ tệp

Điều này cho phép bạn tối ưu hóa các phần khác nhau của ứng dụng một cách độc lập.

## Giám sát ứng dụng quy mô của bạn

Theo dõi cách ứng dụng của bạn hoạt động khi tải:

### Các số liệu chính cần theo dõi

**Request Count**: Ứng dụng của bạn xử lý bao nhiêu yêu cầu
**Thời gian phản hồi**: Ứng dụng của bạn phản hồi nhanh như thế nào
**Tỷ lệ lỗi**: Tỷ lệ phần trăm yêu cầu không thành công
**Server Count**: Có bao nhiêu máy chủ đang chạy
**CPU Sử dụng**: Máy chủ của bạn đang hoạt động tốt như thế nào

### Thiết lập cảnh báo

Nhận thông báo khi có điều cần chú ý:

- **Tỷ lệ lỗi cao**: Cảnh báo khi có hơn 1% yêu cầu không thành công
- **Thời gian phản hồi chậm**: Cảnh báo khi thời gian phản hồi trung bình vượt quá 2 giây
- **Sự kiện mở rộng**: Nhận thông báo khi máy chủ được thêm hoặc xóa
- **Lỗi kiểm tra sức khỏe**: Cảnh báo ngay lập tức khi máy chủ không hoạt động

## Chiến lược tối ưu hóa chi phí

Mở rộng quy mô có thể tiết kiệm tiền nhưng cấu hình kém có thể làm tăng chi phí:

### Thực tiễn tốt nhất để kiểm soát chi phí

**Phiên bản có kích thước phù hợp**: Sử dụng loại phiên bản nhỏ nhất đáp ứng nhu cầu hiệu năng của bạn
**AQuy mô tích cực**: Loại bỏ máy chủ nhanh chóng khi lưu lượng truy cập giảm
**Chia tỷ lệ theo lịch**: Giảm tỷ lệ trong khoảng thời gian yên tĩnh có thể dự đoán được
**Phiên bản Spot**: Sử dụng dung lượng giảm giá cho khối lượng công việc không quan trọng

### Giám sát chi phí

**Thiết lập cảnh báo thanh toán**: Nhận thông báo khi chi phí vượt quá mong đợi
**Theo dõi sự kiện chia tỷ lệ**: Hiểu yếu tố kích hoạt quy mô
**Xem lại việc sử dụng**: Đảm bảo rằng các phiên bản được chia tỷ lệ thực sự cần thiết
**Tối ưu hóa thường xuyên**: Điều chỉnh chính sách mở rộng quy mô dựa trên mô hình sử dụng thực tế

## Các mẫu chia tỷ lệ phổ biến

### Mẫu ứng dụng web

**Architecture**: Cân bằng tải → Nhiều máy chủ web → Cơ sở dữ liệu
**Scaling**: Chia tỷ lệ máy chủ web dựa trên CPU hoặc số lượng yêu cầu
**Database**: Sử dụng bản sao chỉ có quyền đọc để chia tỷ lệ các lần đọc cơ sở dữ liệu
**Sessions**: Lưu trữ dữ liệu phiên ở vị trí được chia sẻ (không phải trên các máy chủ riêng lẻ)

### Mẫu dịch vụ API

**Architecture**: Cân bằng tải → Máy chủ API → Cơ sở dữ liệu
**Scaling**: Chia tỷ lệ dựa trên tốc độ yêu cầu và thời gian phản hồi
**Caching**: Sử dụng Redis hoặc Memcached để giảm tải cơ sở dữ liệu
**Giới hạn tỷ lệ**: Bảo vệ khỏi lạm dụng và tăng đột biến

### Mẫu vi dịch vụ

**Architecture**: Nhiều bộ cân bằng tải cho các dịch vụ khác nhau
**Scaling**: Mỗi dịch vụ có quy mô độc lập
**Khám phá dịch vụ**: Các dịch vụ tìm thấy nhau một cách linh hoạt
**Complexity**: Phức tạp hơn nhưng linh hoạt hơn

## Xử lý phiên và trạng thái

Khi bạn có nhiều máy chủ, bạn cần xử lý phiên của người dùng một cách cẩn thận:

### Ứng dụng phi trạng thái (Được khuyến nghị)

Thiết kế ứng dụng để bất kỳ máy chủ nào cũng có thể xử lý mọi yêu cầu:

- **Lưu trữ dữ liệu phiên bên ngoài**: Cơ sở dữ liệu, Redis hoặc DynamoDB
- **Sử dụng mã thông báo**: Mã thông báo JWT chứa thông tin người dùng
- **ATránh trạng thái phía máy chủ**: Không lưu trữ dữ liệu người dùng trong bộ nhớ máy chủ

### Phiên cố định (Không được khuyến nghị)

Buộc người dùng luôn truy cập cùng một máy chủ:

- **Pros**: Thiết kế ứng dụng đơn giản hơn
- **Cons**: Giảm hiệu quả của bộ cân bằng tải, làm phức tạp việc mở rộng quy mô

## Phục hồi thảm họa và đa khu vực

Để có độ tin cậy tối đa, hãy xem xét triển khai trên nhiều vùng:

### Đa vùng sẵn sàng so với nhiều vùng

**Multi-AZ**: Nhiều trung tâm dữ liệu trong cùng một khu vực địa lý

- **Bảo vệ chống lại**: Lỗi trung tâm dữ liệu đơn lẻ
- **Latency**: Giữa các vùng rất thấp
- **Cost**: Chi phí bổ sung tối thiểu

**Đa vùng**: Tài nguyên ở các khu vực địa lý hoàn toàn khác nhau

- **Bảo vệ chống lại**: Thảm họa khu vực, yêu cầu tuân thủ
- **Latency**: Cao hơn giữa các khu vực
- **Cost**: Cao hơn đáng kể do sao chép dữ liệu

## Kiểm tra ứng dụng quy mô của bạn

Trước khi dựa vào tính năng tự động chia tỷ lệ trong production, hãy kiểm tra kỹ lưỡng:

### Kiểm tra tải

Mô phỏng lưu lượng truy cập cao để xác minh công việc mở rộng quy mô:

- **Tăng dần**: Tăng tải từ từ để kích hoạt chia tỷ lệ
- **Tăng đột ngột**: Kiểm tra tốc độ phản hồi của quy mô đối với các đợt bùng phát lưu lượng truy cập
- **Tải liên tục**: Xác minh độ ổn định của hệ thống khi chịu tải cao kéo dài

### Kiểm tra lỗi

Kiểm tra cách hệ thống của bạn xử lý lỗi máy chủ:

- **Chấm dứt máy chủ**: Chấm dứt máy chủ để kiểm tra kiểm tra tình trạng và thay thế
- **Lỗi một phần**: Kiểm tra với một số máy chủ hoạt động tốt và một số máy chủ khác bị lỗi
- **Lỗi cơ sở dữ liệu**: Đảm bảo ứng dụng xử lý các sự cố kết nối cơ sở dữ liệu

## Những sai lầm phổ biến cần tránh

### Lỗi cấu hình

**Mở rộng quy mô quá mạnh**: Thêm máy chủ nhanh hơn mức chúng có thể khởi động
**Health kiểm tra quá nghiêm ngặt**: Đánh dấu các máy chủ khỏe mạnh là không lành mạnh
**Nhóm bảo mật**: Không cho phép bộ cân bằng tải nói chuyện với máy chủ
**Độ dính phiên**: Sử dụng phiên cố định khi không cần thiết

### Giám sát sai lầm

**Bỏ qua số liệu**: Không xem cách thức thực hiện chia tỷ lệ trong thực tế
**Alert mệt mỏi**: Quá nhiều cảnh báo bị bỏ qua
**Không giám sát chi phí**: Chi phí mở rộng vượt quá tầm kiểm soát
**Thử nghiệm không đầy đủ**: Giả sử việc chia tỷ lệ sẽ hoạt động mà không cần thử nghiệm

## Các bước tiếp theo

Với việc ứng dụng của bạn hiện có thể tự động xử lý lưu lượng truy cập, bạn cần có khả năng hiển thị cách thức hoạt động của ứng dụng. Giám sát CloudWatch cung cấp cho bạn thông tin chi tiết cần thiết để tối ưu hóa hiệu suất, phát hiện sớm sự cố và hiểu hành vi của người dùng.

Việc giám sát đặc biệt quan trọng đối với các ứng dụng được thay đổi quy mô vì các sự cố có thể nhân lên trên nhiều máy chủ và bạn cần phân biệt giữa các sự kiện mở rộng quy mô thông thường và các sự cố thực tế.

Trong phần tiếp theo, bạn sẽ học cách thiết lập tính năng giám sát toàn diện để giúp bạn tự tin về tình trạng và hiệu suất của ứng dụng đã mở rộng quy mô của mình.
