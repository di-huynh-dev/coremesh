---
title: "Lambda - Mã tự chạy"
description: Hiểu điện toán serverless và thời điểm sử dụng hàm chạy mà không cần quản lý máy chủ.
order: 9
---

Hãy tưởng tượng bạn có thể chạy mã mà không phải lo lắng về máy chủ, hệ điều hành hoặc mở rộng quy mô. Đó chính xác là những gì AWS Lambda thực hiện - bạn viết hàm, tải nó lên và AWS sẽ xử lý mọi việc khác.

## Máy tính không có máy chủ là gì?

Mặc dù có tên như vậy nhưng "không có máy chủ" không có nghĩa là không có máy chủ. Nó có nghĩa là bạn không cần phải nghĩ về chúng. AWS quản lý tất cả cơ sở hạ tầng trong khi bạn tập trung vào mã của mình.

Đây là điều khiến Lambda trở nên đặc biệt:

- **Không có máy chủ để quản lý** - AWS xử lý mọi thứ
- **Tự động chia tỷ lệ** - từ 0 đến hàng nghìn yêu cầu ngay lập tức
- **Pay per use** - bạn chỉ thanh toán khi mã của bạn chạy
- **Event-driven** - mã chạy để phản hồi lại trình kích hoạt

## Khi nào bạn nên sử dụng Lambda?

Lambda hoạt động tốt nhất cho các nhiệm vụ:

- Chạy thỉnh thoảng (không liên tục)
- Hoàn thành nhanh chóng (dưới 15 phút)
- Phản hồi các sự kiện (tải lên tệp, thay đổi cơ sở dữ liệu, yêu cầu web)
- Không cần kết nối liên tục

**Trường hợp sử dụng Lambda tốt:**

- Đang xử lý image đã tải lên
- Gửi thông báo qua email
- Chạy báo cáo theo lịch trình
- Xử lý việc gửi biểu mẫu liên hệ
- Kết nối các dịch vụ khác nhau

**Không lý tưởng cho Lambda:**

- Máy chủ web luôn chạy
- Tính toán dài hạn
- Ứng dụng cần lưu trữ liên tục
- Ứng dụng trò chuyện hoặc trò chuyện thời gian thực

## Tìm hiểu mô hình Lambda

Các máy chủ truyền thống hoạt động như thế này:

1. Bạn thuê một máy chủ
2. Cài đặt ứng dụng của bạn
3. Giữ nó hoạt động 24/7
4. Xử lý tất cả việc bảo trì và mở rộng quy mô

Lambda hoạt động khác nhau:

1. Bạn viết hàm
2. Tải nó lên AWS
3. AWS chỉ chạy nó khi cần
4. Bạn chỉ trả tiền cho thời gian thực hiện

## Lambda hàm đầu tiên của bạn

Hãy tạo một hàm đơn giản để xử lý việc gửi biểu mẫu liên hệ.

Trong bảng điều khiển Lambda, tạo hàm mới:

- Chọn "Tác giả từ đầu"
- Đặt tên là "process-contact-form"
- Chọn Python 3.9 làm thời gian chạy

Đây là hàm cơ bản:

```python
def lambda_handler(event, context):
    # Get form data from the event
    name = event.get('name', 'Anonymous')
    email = event.get('email', 'No email provided')
    message = event.get('message', 'No message')

    # Process the submission (in reality, you'd save to database or send email)
    print(f"New contact from {name} ({email}): {message}")

    # Return a response
    return {
        'statusCode': 200,
        'body': f'Thank you {name}! We received your message.'
    }
```

hàm này:

1. Nhận dữ liệu từ biểu mẫu liên hệ
2. Trích xuất tên, email và tin nhắn
3. Ghi nhật ký thông tin
4. Trả lại tin nhắn cảm ơn

## Lambda hàm hoạt động như thế nào

Mỗi Lambda hàm đều có hai phần chính:

**The Handler**: Đây là hàm chính của bạn mà AWS gọi. Nó nhận được:

- `event`: Dữ liệu về nguyên nhân đã kích hoạt hàm
- `context`: Thông tin về môi trường thời gian chạy

**Phản hồi**: hàm của bạn trả lại dữ liệu cho bất kỳ thứ gì được gọi.

## Kích hoạt Lambda hàm

Lambda hàm không tự chạy - chúng cần có trình kích hoạt. Các tác nhân kích hoạt phổ biến bao gồm:

**API Gateway**: Tạo URL web chạy hàm của bạn
Sự kiện **S3**: Chạy khi tệp được tải lên hoặc bị xóa
**CloudWatch Events**: Chạy theo lịch hoặc khi dịch vụ AWS thay đổi
**DynamoDB**: Chạy khi bản ghi cơ sở dữ liệu thay đổi

## Thiết lập API Web

Một trong những cách sử dụng phổ biến nhất của Lambda là tạo API web. Đây là cách nó hoạt động:

1. Tạo Lambda hàm để xử lý các yêu cầu
2. Sử dụng API Gateway để tạo URL web
3. Khi ai đó truy cập URL, Lambda sẽ chạy hàm của bạn
4. hàm của bạn xử lý yêu cầu và trả về phản hồi

Điều này là hoàn hảo cho:

- Biểu mẫu liên hệ
- Đăng ký người dùng
- API xử lý dữ liệu
- Ứng dụng di động backend

## Hiểu về khởi đầu nguội

Khi Lambda không chạy hàm của bạn gần đây, nó cần một chút thời gian để "khởi động" - đây được gọi là khởi động nguội. Nó thường mất vài trăm mili giây.

Đối với hầu hết các ứng dụng, điều này không thành vấn đề. Nhưng nếu bạn cần phản hồi nhanh liên tục, bạn có thể:

- Sử dụng "Đồng thời được cung cấp" để giữ ấm cho hàm
- Chọn thời gian chạy nhanh hơn như Node.js hoặc Python
- Tối ưu hóa mã của bạn để bắt đầu nhanh chóng

## Định giá Lambda thật đơn giản

Giá Lambda có hai phần:

1. **Requests**: 0,20 USD trên một triệu yêu cầu (rất rẻ)
2. **Thời gian tính toán**: Dựa trên thời gian thực hiện và phân bổ bộ nhớ

Đối với việc học tập và các ứng dụng nhỏ, chi phí là tối thiểu. Hầu hết những người mới bắt đầu chi ít hơn 1$ mỗi tháng.

Bậc miễn phí bao gồm:

- 1 triệu yêu cầu mỗi tháng
- Thời gian tính toán 400.000 GB-giây

## Biến môi trường và cấu hình

Lambda hàm thường cần cấu hình - URL cơ sở dữ liệu, khóa API hoặc cài đặt thay đổi giữa các môi trường.

Sử dụng các biến môi trường cho việc này:

- `DATABASE_URL`: Chuỗi kết nối cho cơ sở dữ liệu của bạn
- `API_KEY`: Thông tin xác thực cho các dịch vụ bên ngoài
- `ENVIRONMENT`: Cho dù bạn đang trong quá trình phát triển hay production

Mã của bạn có thể đọc các giá trị này mà không cần mã hóa chúng.

## Xử lý lỗi và gỡ lỗi

Khi Lambda hàm bị lỗi, AWS cung cấp một số công cụ gỡ lỗi:

**CloudWatch Logs**: Mọi hàm đều tự động đăng nhập vào CloudWatch
**X-Ray Tracing**: Hiển thị cách các yêu cầu chảy qua ứng dụng của bạn
**Error Metrics**: Theo dõi tỷ lệ thành công và mẫu lỗi

Đối với người mới bắt đầu, Nhật ký CloudWatch là quan trọng nhất - chúng hiển thị những gì hàm của bạn đã in và mọi thông báo lỗi.

## Các mẫu Lambda phổ biến

**Xử lý tệp**: Khi ai đó tải tệp lên S3, Lambda có thể:

- Thay đổi kích thước image
- Trích xuất siêu dữ liệu
- Quét virus
- Chuyển đổi định dạng

**Data Transformation**: Lambda có thể dọn dẹp và xử lý dữ liệu:

- Chuyển đổi CSV sang JSON
- Xác thực việc gửi biểu mẫu
- Thống kê tổng hợp
- Dọn dẹp cơ sở dữ liệu

**Integration**: Lambda kết nối các dịch vụ khác nhau:

- Gửi thông báo Slack
- Cập nhật nhiều cơ sở dữ liệu
- Đồng bộ dữ liệu giữa các hệ thống
- Kích hoạt các dịch vụ AWS khác

## Thực tiễn tốt nhất cho người mới bắt đầu

**Keep hàm small**: Mỗi hàm sẽ làm tốt một việc
**Sử dụng các biến môi trường**: Không cấu hình mã hóa cứng
**Xử lý lỗi một cách duyên dáng**: Trả về các thông báo lỗi có ý nghĩa
**Ghi thông tin quan trọng**: Sử dụng câu lệnh in để gỡ lỗi
**Kiểm tra cục bộ khi có thể**: Nhiều ngôn ngữ cho phép bạn chạy mã Lambda cục bộ

## Những hạn chế cần biết về

Lambda có một số hạn chế:

- **Thời gian chạy tối đa 15 phút**: Đối với các tác vụ dài hơn, hãy sử dụng EC2
- **512MB đến bộ nhớ 10GB**: Chọn dựa trên nhu cầu của bạn
- **Không có bộ lưu trữ liên tục**: Sử dụng S3 hoặc cơ sở dữ liệu cho dữ liệu
- **Độ trễ khởi động nguội**: Yêu cầu đầu tiên có thể chậm hơn

## Giám sát hàm của bạn

AWS cung cấp tính năng giám sát tích hợp cho Lambda:

- **Số lần gọi**: Tần suất hàm của bạn chạy
- **Duration**: Mỗi lần thực hiện mất bao lâu
- **Tỷ lệ lỗi**: Phần trăm thực thi không thành công
- **Throttles**: Khi AWS giới hạn hàm của bạn

Dữ liệu này giúp bạn hiểu cách sử dụng và tối ưu hóa hiệu suất.

## Ví dụ trong thế giới thực: Xử lý image

Nhiều trang web cần thay đổi kích thước image đã tải lên. Đây là cách Lambda khiến việc này trở nên dễ dàng:

1. Người dùng tải ảnh lên S3
2. S3 kích hoạt Lambda hàm
3. Lambda tải xuống image
4. Lambda tạo phiên bản hình thu nhỏ
5. Lambda lưu hình thu nhỏ trở lại S3
6. Website hiển thị image được tối ưu hóa

Toàn bộ quá trình này chạy tự động mà không cần quản lý máy chủ.

## Các bước tiếp theo

Lambda mở ra những khả năng kiến trúc mới nhưng mạnh mẽ nhất khi kết hợp với các dịch vụ AWS khác. Bạn có thể sử dụng Lambda với:

- **API Gateway** dành cho API web
- **S3** để xử lý tệp
- **DynamoDB** để lưu trữ dữ liệu
- **SES** để gửi email

Điều quan trọng là phải hiểu khi nào serverless có ý nghĩa so với các máy chủ truyền thống. Sử dụng Lambda cho các tác vụ chạy trong thời gian ngắn, theo sự kiện và EC2 cho các ứng dụng luôn chạy.

Trong phần cuối cùng của chúng tôi, bạn sẽ tìm hiểu về cách quản lý chi phí trên tất cả các dịch vụ này để đảm bảo hóa đơn AWS của bạn luôn ở mức hợp lý và có thể dự đoán được.
