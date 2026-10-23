---
title: "CloudWatch - Giám sát ứng dụng của bạn"
description: Giữ cho ứng dụng của bạn luôn hoạt động tốt bằng tính năng giám sát, cảnh báo và hiểu biết sâu sắc về hiệu suất cũng như mức sử dụng.
order: 8
---

Chạy ứng dụng mà không có giám sát cũng giống như lái một chiếc ô tô không có bảng điều khiển - bạn có thể ổn trong một thời gian, nhưng khi có sự cố xảy ra, bạn sẽ không biết cho đến khi quá muộn. CloudWatch là dịch vụ giám sát của AWS cung cấp cho bạn khả năng hiển thị mọi thứ đang diễn ra trong cơ sở hạ tầng đám mây của bạn.

Hãy coi CloudWatch như hệ thống theo dõi sức khỏe cho ứng dụng của bạn, giống như một công cụ theo dõi sức khỏe cho trang web của bạn, theo dõi các dấu hiệu quan trọng và cảnh báo cho bạn khi có điều gì đó không ổn.

## Tại sao vấn đề giám sát

Nếu không có sự giám sát thích hợp, bạn có thể phát hiện ra vấn đề khi:

- Người dùng phàn nàn về hiệu suất chậm
- Trang web của bạn gặp sự cố trong thời gian lưu lượng truy cập cao điểm
- Bạn nhận được hóa đơn AWS cao bất ngờ
- Các vấn đề bảo mật không bị phát hiện trong nhiều tuần

Với sự giám sát tốt, bạn có thể:

- **Phát hiện sự cố trước khi người dùng nhận ra chúng**
- **Hiểu cách sử dụng** để tối ưu hóa chi phí và hiệu suất
- **Phản hồi nhanh** các vấn đề với thông tin chi tiết
- **Đưa ra quyết định dựa trên dữ liệu** về mở rộng quy mô và tối ưu hóa

## Tìm hiểu các thành phần CloudWatch

CloudWatch có một số phần hoạt động cùng nhau:

### Số liệu

Các phép đo số theo thời gian, như:

- **Sử dụng CPU**: Máy chủ của bạn đang hoạt động tốt như thế nào
- **Lưu lượng mạng**: Lượng dữ liệu đang được truyền
- **Số yêu cầu**: Có bao nhiêu người đang sử dụng ứng dụng của bạn
- **Tỷ lệ lỗi**: Tần suất xảy ra sự cố

### Nhật ký

Bản ghi dựa trên văn bản về những gì đang xảy ra trong ứng dụng của bạn:

- **Nhật ký ứng dụng**: Mã của bạn đang làm gì
- **Nhật ký máy chủ web**: Những trang nào người dùng truy cập
- **Nhật ký hệ thống**: Sự kiện hệ điều hành
- **Nhật ký cơ sở dữ liệu**: Hiệu suất và lỗi truy vấn

### Báo động

Thông báo được kích hoạt khi số liệu vượt qua ngưỡng:

- **Ethông báo qua email**: Nhận thông báo về sự cố ngay lập tức
- Thông báo **SMS**: Cảnh báo quan trọng được gửi tới điện thoại của bạn
- **Hành động tự động**: Tự động mở rộng quy mô hoặc khởi động lại dịch vụ

### Trang tổng quan

Hiển thị trực quan tình trạng hệ thống của bạn:

- **Biểu đồ thời gian thực**: Xem nhanh hiệu suất hiện tại
- **HXu hướng lịch sử**: Hiểu các mô hình theo thời gian
- **Chế độ xem tùy chỉnh**: Tập trung vào các số liệu quan trọng với bạn

## Số liệu mà AWS tự động thu thập

Hầu hết các dịch vụ AWS đều tự động gửi số liệu tới CloudWatch:

### Số liệu của phiên bản EC2

- **CPUUtilization**: Phần trăm CPU đang được sử dụng
- **NetworkIn/NetworkOut**: Lượng truyền dữ liệu
- **DiskReadOps/DiskWriteOps**: Hoạt động lưu trữ
- **StatusCheckFailed**: Phiên bản có hoạt động tốt không

### Chỉ số cân bằng tải

- **RequestCount**: Tổng số yêu cầu
- **TargetResponseTime**: Thời gian phản hồi mất bao lâu
- **HTTPCode_Target_2XX_Count**: Yêu cầu thành công
- **HTTPCode_Target_5XX_Count**: Yêu cầu lỗi máy chủ

### Số liệu cơ sở dữ liệu RDS

- **CPUUtilization**: Mức sử dụng CPU của máy chủ cơ sở dữ liệu
- **DatabaseConnections**: Số lượng kết nối đang hoạt động
- **ReadLatency/WriteLatency**: Thời gian phản hồi của cơ sở dữ liệu
- **FreeStorageSpace**: Dung lượng đĩa trống

### Số liệu lưu trữ S3

- **BucketSizeBytes**: Lượng dữ liệu bạn đang lưu trữ
- **NumberOfObjects**: Số lượng tệp trong nhóm
- **AllRequests**: Tổng số yêu cầu đối với nhóm của bạn

## Số liệu ứng dụng tùy chỉnh

Ngoài các số liệu dịch vụ AWS, bạn nên theo dõi các số liệu cụ thể cho ứng dụng của mình:

### Số liệu kinh doanh

- **Đăng ký người dùng**: Có bao nhiêu người đăng ký
- **Hoàn thành đơn hàng**: Giao dịch thương mại điện tử thành công
- **Lượt xem trang**: Nội dung nào phổ biến
- **Sử dụng tính năng**: Phần nào trong ứng dụng của bạn được sử dụng nhiều nhất

### Số liệu hiệu suất

- **Thời gian phản hồi**: Ứng dụng của bạn phản hồi nhanh như thế nào
- **Tỷ lệ lỗi**: Tỷ lệ phần trăm yêu cầu không thành công
- **Thời gian truy vấn cơ sở dữ liệu**: Hoạt động cơ sở dữ liệu mất bao lâu
- **Queue lengths**: Có bao nhiêu tác vụ đang chờ xử lý

### Ví dụ: Thêm số liệu tùy chỉnh vào ứng dụng của bạn

```javascript
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

// Function to send metrics to CloudWatch
async function recordMetric(metricName, value, unit = 'Count') {
  try {
    await cloudwatch
      .putMetricData({
        Namespace: 'MyApp/Custom',
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: unit,
            Timestamp: new Date(),
          },
        ],
      })
      .promise();
  } catch (error) {
    console.error('Failed to send metric:', error);
  }
}

// Record business metrics
app.post('/users/register', async (req, res) => {
  try {
    await createUser(req.body);
    await recordMetric('UserRegistrations', 1);
    res.json({ success: true });
  } catch (error) {
    await recordMetric('RegistrationErrors', 1);
    res.status(500).json({ error: error.message });
  }
});
```

## Thiết lập cảnh báo CloudWatch đầu tiên của bạn

Cảnh báo sẽ thông báo cho bạn khi số liệu cho thấy có vấn đề. Hãy tạo một cảnh báo về việc sử dụng CPU cao:

### Lập kế hoạch báo thức của bạn

**Điều cần giám sát**: Mức sử dụng CPU của phiên bản EC2
**Threshold**: Cảnh báo khi CPU vượt quá 80%
**Duration**: Chỉ cảnh báo nếu ở mức cao trong hơn 5 phút (tránh cảnh báo sai)
**Action**: Gửi email thông báo

### Cấu hình cảnh báo

**Metric**: Sử dụng CPU AWS/EC2
**Statistic**: Trung bình (trong khoảng thời gian 5 phút)
**Threshold**: Lớn hơn 80%
**Ethời gian đánh giá**: 2 (phải cao trong tổng cộng 10 phút)
**Thiếu dữ liệu**: Coi như không vi phạm (giả sử là khỏe mạnh)

### Cài đặt thông báo

Tạo chủ đề SNS (Dịch vụ thông báo đơn giản) để xử lý thông báo:

- **Tên chủ đề**: cảnh báo quan trọng
- **Subscribers**: Địa chỉ email của bạn
- **Confirmation**: Kiểm tra email của bạn và xác nhận đăng ký

## Nhật ký CloudWatch để giám sát ứng dụng

Nhật ký cung cấp thông tin chi tiết về những gì đang xảy ra trong ứng dụng của bạn:

### Các loại nhật ký cần thu thập

**Nhật ký ứng dụng**: Đầu ra ứng dụng của bạn

```javascript
console.log('User logged in:', { userId: 123, timestamp: new Date() });
console.error('Database connection failed:', error.message);
```

**Nhật ký máy chủ web**: Yêu cầu và phản hồi HTTP

```
127.0.0.1 - - [28/May/2025:10:00:00 +0000] "GET /api/users HTTP/1.1" 200 1234
```

**Nhật ký hệ thống**: Sự kiện hệ điều hành

```
May 28 10:00:00 ip-10-0-1-100 kernel: Out of memory: Kill process 1234
```

### Thiết lập bộ sưu tập nhật ký

Cài đặt tác nhân CloudWatch trên phiên bản EC2 của bạn để tự động gửi nhật ký:

```bash
# Download and install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

Định cấu hình tác nhân để thu thập nhật ký ứng dụng của bạn:

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/myapp/application.log",
            "log_group_name": "MyApp/Application",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```

## Phân tích nhật ký bằng CloudWatch Insights

CloudWatch Logs Insights cho phép bạn tìm kiếm và phân tích nhật ký của mình:

### Truy vấn nhật ký phổ biến

**Tìm lỗi trong giờ qua**:

```
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 20
```

**Đếm yêu cầu theo mã trạng thái**:

```
fields @timestamp, status
| filter @timestamp > now() - 1h
| stats count() by status
```

**Tìm các truy vấn cơ sở dữ liệu chậm**:

```
fields @timestamp, query_time, query
| filter query_time > 1000
| sort query_time desc
```

### Sử dụng thông tin chi tiết để khắc phục sự cố

Khi người dùng báo cáo vấn đề:

1. **Kiểm tra nhật ký lỗi** vào khoảng thời gian xảy ra sự cố
2. **Tìm mẫu** trong thông báo lỗi
3. **Tương quan với số liệu** để hiểu hệ thống trạng thái
4. **Theo dõi nguyên nhân gốc** bằng thông tin nhật ký chi tiết

## Tạo bảng điều khiển hữu ích

Trang tổng quan cung cấp cái nhìn tổng quan về tình trạng hệ thống của bạn:

### Các tiện ích bảng điều khiển cần thiết

**Tổng quan về tình trạng hệ thống**:

- Mức sử dụng CPU EC2 trên tất cả các phiên bản
- Số lượng yêu cầu cân bằng tải và thời gian phản hồi
- CPU cơ sở dữ liệu và số lượng kết nối
- Tỷ lệ lỗi trên tất cả các dịch vụ

**Hiệu suất ứng dụng**:

- Số liệu ứng dụng tùy chỉnh (đăng ký người dùng, đơn đặt hàng, v.v.)
- Phân vị thời gian phản hồi (thứ 50, 95, 99)
- Tỷ lệ lỗi theo điểm cuối hoặc tính năng
- Độ dài hàng đợi và thời gian xử lý

**Chi phí cơ sở hạ tầng**:

- Chi phí ước tính hàng tháng
- Xu hướng sử dụng tài nguyên
- Mức tăng sử dụng bộ nhớ
- Số lượng truyền dữ liệu

### Các phương pháp hay nhất về trang tổng quan

**Đơn giản hóa**: Không chứa quá nhiều trang tổng quan với quá nhiều số liệu
**Sử dụng tên có ý nghĩa**: "Hiệu suất máy chủ web" tốt hơn "Bảng điều khiển 1"
**Số liệu liên quan đến nhóm**: Đặt các số liệu cơ sở dữ liệu, số liệu máy chủ web lại với nhau
**Đặt phạm vi thời gian thích hợp**: 24 giờ qua cho bảng điều khiển hoạt động, 30 ngày qua để phân tích xu hướng

## Chiến lược giám sát cho các kịch bản khác nhau

### Giám sát ứng dụng nhỏ

**Tập trung vào những điều cơ bản**:

- Tình trạng máy chủ (CPU, bộ nhớ, đĩa)
- Lỗi ứng dụng
- Trải nghiệm người dùng (thời gian phản hồi)
- Giám sát chi phí cơ bản

**Cảnh báo đơn giản**:

- Mức sử dụng CPU/bộ nhớ cao
- Lỗi ứng dụng tăng đột biến
- Không có dịch vụ

### Giám sát ứng dụng đang phát triển

**Thêm chi tiết**:

- Theo dõi số liệu kinh doanh
- Hiệu suất theo tính năng/điểm cuối
- Giám sát hiệu suất cơ sở dữ liệu
- Phân tích hành vi người dùng

**ECảnh báo nâng cao**:

- Ngưỡng tùy chỉnh dựa trên dữ liệu lịch sử
- Cảnh báo dự đoán cho các vấn đề có xu hướng
- Tích hợp với các công cụ trò chuyện nhóm

### Giám sát ứng dụng production

**Phạm vi bao phủ toàn diện**:

- Giám sát toàn ngăn xếp (frontend tới cơ sở dữ liệu)
- Giám sát sự kiện bảo mật
- Ghi nhật ký tuân thủ và kiểm tra
- Thông tin chi tiết về tối ưu hóa hiệu suất

**Cảnh báo nâng cao**:

- Phát hiện bất thường cho các mẫu bất thường
- Cảnh báo tổng hợp kết hợp nhiều số liệu
- Hành động khắc phục tự động
- Thủ tục báo cáo cho các vấn đề quan trọng

## Quản lý chi phí thông qua giám sát

Bản thân CloudWatch cũng có chi phí nhưng việc giám sát tốt có thể tiết kiệm tiền về tổng thể:

### Chi phí CloudWatch

**Metrics**: 0,30 USD mỗi chỉ số mỗi tháng (miễn phí 10 chỉ số đầu tiên)
**Logs**: 0,50 USD mỗi GB được tiêu thụ, 0,03 USD mỗi GB được lưu trữ
**Alarms**: 0,10 USD mỗi cảnh báo mỗi tháng (miễn phí 10 cảnh báo đầu tiên)
**Dashboards**: 3,00 USD mỗi trang tổng quan mỗi tháng (miễn phí 3 trang tổng quan đầu tiên)

### Tối ưu hóa chi phí thông qua giám sát

**Tài nguyên có kích thước phù hợp**: Sử dụng số liệu CPU và bộ nhớ để tối ưu hóa kích thước phiên bản
**Hiệu suất tự động mở rộng quy mô**: Giám sát các sự kiện mở rộng quy mô để điều chỉnh chính sách
**Tối ưu hóa lưu trữ**: Theo dõi việc sử dụng bộ nhớ để triển khai các chính sách vòng đời
**Phát hiện tài nguyên không sử dụng**: Xác định các tài nguyên nhàn rỗi có thể bị chấm dứt

## Giám sát an ninh

Giám sát các sự kiện liên quan đến bảo mật để phát hiện các vấn đề tiềm ẩn:

### Số liệu bảo mật quan trọng

**Số lần đăng nhập không thành công**: Các mẫu xác thực bất thường
**Hoạt động API bất thường**: Việc sử dụng dịch vụ không mong muốn
**Mẫu lưu lượng mạng**: Lượng truyền dữ liệu bất thường
**Thay đổi mẫu truy cập**: Người dùng truy cập tài nguyên mới

### Ví dụ giám sát an ninh

```javascript
// Log security events
app.post('/login', async (req, res) => {
  try {
    const user = await authenticateUser(req.body);

    // Log successful login
    console.log('Successful login', {
      userId: user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    // Log failed login attempt
    console.log('Failed login attempt', {
      email: req.body.email,
      ip: req.ip,
      error: error.message,
      timestamp: new Date(),
    });

    await recordMetric('FailedLogins', 1);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

## Khắc phục sự cố với CloudWatch

Khi xảy ra sự cố, CloudWatch sẽ giúp bạn hiểu điều gì đã xảy ra:

### Phương pháp khắc phục sự cố có hệ thống

1. **Kiểm tra bảng thông tin**: Xem nhanh tình trạng hệ thống tổng thể
2. **Xem lại cảnh báo**: Xem điều gì đã kích hoạt và khi nào
3. **Ekiểm tra số liệuamine**: Tìm kiếm mối tương quan giữa các hệ thống khác nhau
4. **Nhật ký tìm kiếm**: Tìm thông tin chi tiết về các sự kiện cụ thể
5. **Trace timeline**: Hiểu chuỗi các sự kiện dẫn đến sự cố

### Các mẫu vấn đề thường gặp

**Lưu lượng truy cập tăng đột ngột**:

- Số lượng yêu cầu cân bằng tải tăng lên
- Mức sử dụng CPU EC2 tăng lên
- Số lượng kết nối cơ sở dữ liệu tăng lên
- Thời gian đáp ứng có thể tăng lên

**Vấn đề về hiệu suất cơ sở dữ liệu**:

- Mức sử dụng CPU cơ sở dữ liệu cao
- Thời gian phản hồi truy vấn tăng lên
- Tỷ lệ lỗi ứng dụng tăng
- Sự cạn kiệt của nhóm kết nối

**Rò rỉ bộ nhớ**:

- Mức sử dụng bộ nhớ tăng dần theo thời gian
- Cuối cùng dẫn đến lỗi hết bộ nhớ
- Khởi động lại ứng dụng tạm thời khắc phục sự cố

## Cảnh báo mệt mỏi và các phương pháp hay nhất

Quá nhiều cảnh báo có thể tệ hơn là quá ít:

### Tránh cảnh giác mệt mỏi

**Đặt ngưỡng có ý nghĩa**: Cảnh báo cơ sở về tác động thực tế, không phải con số tùy ý
**Sử dụng khoảng thời gian thích hợp**: Không cảnh báo khi có đột biến ngắn nhưng giải quyết nhanh chóng
**Triển khai leo thang**: Bắt đầu bằng cảnh báo, chuyển lên cảnh báo quan trọng
**Đánh giá thường xuyên**: Điều chỉnh ngưỡng dựa trên kinh nghiệm

### Thiết kế cảnh báo hiệu quả

**Thông báo rõ ràng, có thể thực hiện được**: "CPU cơ sở dữ liệu ở mức cao, kiểm tra truy vấn chậm" so với "cảnh báo CPU"
**Bao gồm ngữ cảnh**: Liên kết tới các trang tổng quan hoặc sổ sách chạy có liên quan
**Sự khẩn cấp phù hợp**: Cảnh báo quan trọng về việc ngừng dịch vụ, cảnh báo về cơ hội tối ưu hóa
**Kiểm tra cảnh báo của bạn**: Xác minh rằng chúng hoạt động và tiếp cận đúng người

## Tích hợp với các dịch vụ khác

CloudWatch hoạt động tốt với các dịch vụ AWS khác:

### Tích hợp mở rộng quy mô tự động

Các chỉ số CloudWatch tự động kích hoạt các chính sách tự động mở rộng quy mô

### Tích hợp Lambda

Lambda hàm có thể xử lý các sự kiện và số liệu CloudWatch

### Tích hợp SNS

Gửi thông báo tới email, SMS hoặc ứng dụng trò chuyện

### Tích hợp quản lý hệ thống

Tự động phản hồi với cảnh báo CloudWatch

## Giám sát Tóm tắt các phương pháp hay nhất

### Bắt đầu đơn giản

- Bắt đầu với các số liệu hệ thống cơ bản (CPU, bộ nhớ, mạng)
- Thêm dần các số liệu dành riêng cho ứng dụng
- Tập trung vào các số liệu cho thấy tác động của người dùng

### Hãy nhất quán

- Sử dụng quy ước đặt tên nhất quán cho số liệu và nhật ký
- Chuẩn hóa bố cục bảng điều khiển giữa các nhóm
- Ghi lại ý nghĩa của cảnh báo và cách phản hồi

### Kế hoạch tăng trưởng

- Giám sát thiết kế phù hợp với ứng dụng của bạn
- Xem xét chi phí khi việc sử dụng giám sát tăng lên
- Thường xuyên xem xét và tối ưu hóa thiết lập giám sát

## Các bước tiếp theo

Với tính năng giám sát toàn diện được áp dụng, bạn đã sẵn sàng khám phá điện toán serverless với Lambda. CloudWatch tích hợp liền mạch với Lambda, cung cấp số liệu và nhật ký chi tiết cho hàm không có máy chủ của bạn.

Các kỹ năng giám sát bạn học được ở đây áp dụng cho tất cả các dịch vụ AWS và sẽ giúp bạn tạo dựng niềm tin vào các ứng dụng đám mây của mình. Cho dù bạn đang chạy máy chủ truyền thống hay hàm không có máy chủ, thì việc giám sát tốt là điều cần thiết để có được các ứng dụng hiệu suất, đáng tin cậy.

Hãy nhớ rằng giám sát không phải là thiết lập một lần - đó là một hoạt động liên tục được cải thiện theo trải nghiệm và giúp bạn xây dựng các ứng dụng tốt hơn theo thời gian.
