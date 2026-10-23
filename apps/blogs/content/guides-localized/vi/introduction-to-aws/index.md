---
title: Giới thiệu về AWS
description: Tìm hiểu AWS từng bước bằng cách xây dựng ứng dụng đám mây thực sự. Bao gồm IAM, EC2, S3, VPC, RDS, cân bằng tải, Lambda, CloudWatch và kiểm soát chi phí.
category:
  name: AWS
  slug: aws
publishedAt: '2025-05-28T10:00:00Z'
updatedAt: '2025-05-28T10:00:00Z'
author:
  name: DevOps Daily Team
  slug: devops-daily-team
tags:
  - AWS
  - Điện toán đám mây
  - Hạ tầng
  - Cơ bản
---

Nếu bạn từng thắc mắc làm thế nào các công ty như Netflix, Airbnb hoặc Spotify xử lý hàng triệu người dùng mà trang web của họ không bị sập, thì câu trả lời thường liên quan đến điện toán đám mây. Amazon Web Services (AWS) là nền tảng đám mây phổ biến nhất, hỗ trợ một phần lớn Internet.

Nhưng ban đầu AWS có thể khiến bạn cảm thấy choáng ngợp. Với hàng trăm dịch vụ và tùy chọn cấu hình vô tận, bạn phải bắt đầu từ đâu?

Hướng dẫn này có một cách tiếp cận khác. Thay vì cố gắng tìm hiểu mọi thứ, bạn sẽ tìm hiểu các dịch vụ cốt lõi quan trọng nhất bằng cách xây dựng một ứng dụng web thực sự từ đầu. Cuối cùng, bạn sẽ hiểu các phần khớp với nhau như thế nào và cảm thấy tự tin khi tự mình khám phá AWS.

## Những gì bạn sẽ xây dựng

Trong suốt hướng dẫn này, bạn sẽ tạo một ứng dụng web hoàn chỉnh bao gồm:

- Một trang web có thể xử lý hàng ngàn khách truy cập
- Cơ sở dữ liệu để lưu trữ thông tin người dùng
- Lưu trữ tệp cho image và tài liệu
- Tự động mở rộng quy mô khi lưu lượng truy cập tăng
- Giám sát để biết khi nào có sự cố
- Bảo mật để bảo vệ dữ liệu người dùng của bạn

Quan trọng nhất, bạn sẽ hiểu tại sao mỗi phần tồn tại và cách chúng hoạt động cùng nhau.

## Hướng dẫn này khác biệt như thế nào

Thay vì nhảy thẳng vào các lệnh kỹ thuật, mỗi phần sẽ giải thích:

- **Tại sao** bạn cần từng dịch vụ
- **Khi** bạn sẽ sử dụng nó trong các ứng dụng thực tế
- **How** nó so sánh với dịch vụ lưu trữ truyền thống
- **** chi phí bao nhiêu và cách tránh những điều bất ngờ

Bạn sẽ thấy rất nhiều ví dụ nhưng trước tiên chúng được giải thích bằng tiếng Anh đơn giản.

## Những gì bạn cần để bắt đầu

Trước khi đi sâu vào, hãy đảm bảo bạn có:

- Máy tính **A** có truy cập internet (Windows, Mac hoặc Linux đều hoạt động)
- Thẻ tín dụng **A** để tạo tài khoản AWS (đừng lo, chúng tôi sẽ sử dụng các dịch vụ miễn phí)
- **Kiến thức web cơ bản** - bạn nên biết trang web, cơ sở dữ liệu và máy chủ là gì
- **Sẵn sàng thử nghiệm** - điện toán đám mây được học tốt nhất bằng cách thực hành

Bạn không cần kinh nghiệm lập trình, mặc dù nó có ích. Khi hiển thị mã, chúng tôi sẽ giải thích từng bước chức năng của nó.

## Giới thiệu về chi phí AWS

AWS có bậc miễn phí rộng rãi bao gồm hầu hết những gì bạn sẽ học trong hướng dẫn này. Tài khoản mới nhận được:

- 750 giờ máy chủ cơ bản mỗi tháng (đủ để chạy một máy chủ 24/7)
- 5GB dung lượng lưu trữ tập tin
- 750 giờ lưu trữ cơ sở dữ liệu
- 1 triệu yêu cầu tới hàm không có máy chủ

Chúng tôi sẽ đánh dấu rõ ràng khi nào điều gì đó tốn tiền và chỉ cho bạn cách tránh các khoản phí không mong muốn.

## Con đường học tập

Hướng dẫn này tuân theo một tiến trình hợp lý:

1. **Thiết lập tài khoản của bạn** và tìm hiểu bảng điều khiển AWS
2. **Thông tin cơ bản về bảo mật** - bảo vệ tài khoản của bạn ngay từ ngày đầu
3. **Máy chủ đầu tiên của bạn** - khởi chạy máy ảo trên đám mây
4. **Lưu trữ tệp** - xử lý image, tài liệu và bản sao lưu
5. **Networking** - kết nối dịch vụ an toàn
6. **Databases** - lưu trữ và truy xuất dữ liệu một cách đáng tin cậy
7. **Mở rộng** - tự động xử lý nhiều người dùng hơn
8. **Monitoring** - biết điều gì đang xảy ra trong ứng dụng của bạn
9. **Going serverless** - chạy mã mà không cần quản lý máy chủ
10. **Quản lý chi phí** - giữ cho hóa đơn của bạn có thể dự đoán được

Mỗi phần được xây dựng dựa trên những phần trước nhưng bạn cũng có thể chuyển sang các chủ đề cụ thể nếu cần.

## Một lời động viên

Điện toán đám mây có vẻ phức tạp nhưng hãy nhớ rằng mọi chuyên gia đều bắt đầu chính xác như bạn hiện tại. Các khái niệm trở nên rõ ràng hơn khi bạn làm việc với chúng và AWS cung cấp tài liệu tuyệt vời khi bạn cần thêm chi tiết.

Đừng lo lắng về việc hiểu mọi thứ ngay lập tức. Trước tiên hãy tập trung vào bức tranh lớn, sau đó đi sâu hơn vào các lĩnh vực mà bạn quan tâm nhất.

Sẵn sàng để bắt đầu hành trình đám mây của bạn? Hãy bắt đầu bằng việc thiết lập tài khoản AWS của bạn và làm quen với những điều cơ bản.

## Thực hành thực hành

Củng cố những gì bạn học được ở đây với [Trình mô phỏng AWS VPC](/games/aws-vpc-simulator) tương tác, ngay trong trình duyệt của bạn mà không cần thiết lập.
