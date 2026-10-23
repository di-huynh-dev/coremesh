---
title: Giới thiệu về Terraform
description: Tìm hiểu cách quản lý cơ sở hạ tầng dưới dạng mã bằng Terraform, từ các khái niệm cơ bản đến cấu hình sẵn sàng cho production
category:
  name: địa hình
  slug: terraform
publishedAt: '2025-04-28'
updatedAt: '2025-04-28'
author:
  name: DevOps Daily Team
  slug: devops-daily-team
tags:
  - Terraform
  - Hạ tầng dưới dạng mã
  - IaC
  - DevOps
  - Đám mây
  - Tự động hóa
---

Quản lý cơ sở hạ tầng thông qua bảng điều khiển web và cấu hình thủ công không có quy mô lớn. Khi cơ sở hạ tầng của bạn phát triển, việc nhấp qua bảng thông tin để tạo tài nguyên trở nên tốn thời gian và dễ xảy ra lỗi. Bạn kết thúc với những thay đổi không có giấy tờ, môi trường không nhất quán và không có hồ sơ rõ ràng về việc ai đã thay đổi cái gì và khi nào.

Terraform giải quyết vấn đề này bằng cách cho phép bạn xác định cơ sở hạ tầng của mình bằng mã. Bạn mô tả các tài nguyên bạn cần - máy chủ, cơ sở dữ liệu, mạng, bản ghi DNS - trong các tệp cấu hình đơn giản. Terraform sau đó tạo, cập nhật hoặc xóa các tài nguyên đó để phù hợp với mô tả của bạn. Cần phát triển cơ sở hạ tầng giống hệt nhau ở một khu vực mới? Chỉ cần áp dụng cấu hình tương tự. Bạn muốn theo dõi những thay đổi theo thời gian? Định nghĩa cơ sở hạ tầng của bạn nằm trong phần kiểm soát phiên bản cùng với mã ứng dụng của bạn.

Không giống như các công cụ dành riêng cho đám mây như AWS CloudFormation hoặc Azure Resource Manager, Terraform hoạt động trên nhiều nhà cung cấp. Bạn có thể sử dụng quy trình làm việc tương tự để quản lý AWS, Google Cloud, DigitalOcean, Kubernetes và hàng trăm dịch vụ khác. Tính nhất quán này giúp làm việc với môi trường nhiều đám mây dễ dàng hơn và giảm thời gian học tập khi áp dụng các dịch vụ mới.

## Bạn sẽ học được gì

Hướng dẫn này đưa bạn từ con số không về kiến thức Terraform đến việc tự tin xây dựng cơ sở hạ tầng thực sự. Chúng tôi sẽ đề cập đến cả các nguyên tắc cơ bản và các mẫu bạn cần để sử dụng production.

**Bắt đầu**: Hiểu Terraform làm gì và hoạt động như thế nào. Cài đặt Terraform và xác minh thiết lập của bạn trên các hệ điều hành khác nhau.

Các khái niệm **Core**: Tìm hiểu về các nhà cung cấp, tài nguyên và cách tiếp cận khai báo khiến Terraform khác với kịch bản. Xem cách Terraform theo dõi cơ sở hạ tầng trạng thái.

Ngôn ngữ cấu hình ****: Viết cấu hình Terraform đầu tiên của bạn bằng HCL (Ngôn ngữ cấu hình HashiCorp). Hiểu các khối tài nguyên, đối số và cách tham chiếu các tài nguyên khác.

**Quản lý tài nguyên**: Tạo cơ sở hạ tầng đám mây thực tế. Tìm hiểu quy trình làm việc áp dụng kế hoạch để ngăn chặn những thay đổi vô tình. Xem cách Terraform phát hiện sự sai lệch giữa mã của bạn và cơ sở hạ tầng thực.

**State Management**: Hiểu tệp trạng thái của Terraform và lý do nó quan trọng. Tìm hiểu cách kiểm tra trạng thái, di chuyển tài nguyên và khôi phục sau các sự cố trạng thái.

**Variables và Outputs**: Làm cho cấu hình của bạn có thể sử dụng lại được với các biến đầu vào. Trích xuất thông tin hữu ích với kết quả đầu ra. Xem cách truyền dữ liệu giữa các mô-đun Terraform.

**Modules**: Sắp xếp mã cơ sở hạ tầng của bạn thành các thành phần có thể tái sử dụng. Sử dụng các mô-đun từ Sổ đăng ký Terraform và tạo mô-đun của riêng bạn.

**Nhiều môi trường**: Quản lý cơ sở hạ tầng phát triển, staging và production với cùng một mã. Sử dụng không gian làm việc và các biến dành riêng cho môi trường.

**Remote Backends**: Lưu trữ trạng thái từ xa để cộng tác nhóm. Thiết lập khóa trạng thái để tránh xung đột. Sử dụng Đám mây Terraform hoặc S3 backend.

**Mẫu sản xuất**: Cấu trúc các dự án Terraform lớn. Xử lý bí mật một cách an toàn. Thực hiện kiểm tra tự động cho mã cơ sở hạ tầng. Tìm hiểu khi nào nên phân chia cấu hình và khi nào nên giữ chúng lại với nhau.

## Tại sao các nhóm sử dụng Terraform

Các tổ chức áp dụng Terraform vì việc quản lý cơ sở hạ tầng thủ công trở nên không bền vững khi hệ thống phát triển. Các trường hợp sử dụng phổ biến bao gồm:

**Môi trường có thể tái tạo**: Tạo các thiết lập staging và production giống hệt nhau. Tạo các môi trường hoàn chỉnh để thử nghiệm và phá bỏ chúng khi hoàn tất.

**Khôi phục thảm họa**: Định nghĩa cơ sở hạ tầng là kế hoạch khôi phục của bạn. Xây dựng lại toàn bộ môi trường từ mã nếu cần.

**Tuân thủ và kiểm tra**: Xem chính xác cơ sở hạ tầng nào tồn tại và thời điểm nó thay đổi. Xem xét những thay đổi về cơ sở hạ tầng trước khi chúng xảy ra.

**Cộng tác nhóm**: Mã cơ sở hạ tầng trong kiểm soát phiên bản có nghĩa là pull request, đánh giá mã và quy trình phê duyệt rõ ràng đối với các thay đổi cơ sở hạ tầng.

**Chiến lược đa đám mây**: Sử dụng cùng một công cụ trên AWS, Azure, GCP và các nhà cung cấp khác. Tránh bị khóa nhà cung cấp và tìm hiểu một công cụ thay vì nhiều công cụ.

## Điều kiện tiên quyết

Để theo dõi hiệu quả, bạn sẽ cần:

- Trải nghiệm dòng lệnh cơ bản trên Linux, macOS hoặc Windows
- Tài khoản của nhà cung cấp đám mây (AWS, DigitalOcean hoặc Google Cloud hoạt động tốt cho việc học)
- Làm quen với các khái niệm cơ sở hạ tầng cơ bản như máy ảo và mạng
- Trình soạn thảo văn bản để ghi tập tin cấu hình

Bạn không cần kinh nghiệm lập trình, mặc dù nó có ích. Ngôn ngữ cấu hình của Terraform là ngôn ngữ khai báo - bạn mô tả những gì bạn muốn chứ không phải cách tạo nó.

Nếu bạn đang làm theo các ví dụ, hãy nhớ rằng việc tạo tài nguyên đám mây có thể phát sinh chi phí. Hầu hết các ví dụ trong hướng dẫn này đều sử dụng các bậc miễn phí hoặc tài nguyên tối thiểu có giá vài xu mỗi giờ. Luôn nhớ tiêu hủy các tài nguyên bạn tạo ra cho việc học.

Đến cuối hướng dẫn này, bạn sẽ hiểu cách Terraform hoạt động, cách viết mã cơ sở hạ tầng có thể bảo trì và cách tránh những cạm bẫy phổ biến. Bạn sẽ sẵn sàng sử dụng Terraform cho các dự án thực tế và đủ hiểu biết để tìm hiểu sâu hơn về các chủ đề nâng cao.

Mỗi phần được xây dựng dựa trên những phần trước với các ví dụ thực tế và tình huống thực tế. Hãy bắt đầu bằng cách hiểu Terraform thực sự làm gì và nó nghĩ như thế nào về cơ sở hạ tầng.
