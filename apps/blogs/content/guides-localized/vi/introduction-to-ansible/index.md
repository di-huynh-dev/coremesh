---
title: Giới thiệu về Ansible
description: Tìm hiểu cách tự động hóa các tác vụ triển khai và cấu hình máy chủ với Ansible, từ các khái niệm cơ bản đến các phương pháp thực hành sẵn sàng cho production.
category:
  name: DevOps
  slug: devops
publishedAt: '2024-10-24T10:00:00Z'
updatedAt: '2024-10-24T10:00:00Z'
author:
  name: DevOps Daily Team
  slug: devops-daily-team
tags:
  - Ansible
  - Tự động hóa
  - Quản lý cấu hình
  - Hạ tầng dưới dạng mã
  - DevOps
---

Việc quản lý máy chủ theo cách thủ công trở nên bất khả thi khi cơ sở hạ tầng của bạn phát triển. Cho dù bạn đang định cấu hình một máy chủ hay hàng trăm máy chủ, việc thực hiện bằng tay sẽ dẫn đến sự thiếu nhất quán, quên các bước và phải làm việc lặp đi lặp lại hàng giờ đồng hồ. Ansible giải quyết vấn đề này bằng cách cho phép bạn mô tả máy chủ trạng thái mong muốn của mình trong các tệp đơn giản, dễ đọc, sau đó tự động thực hiện điều đó.

Không giống như các công cụ quản lý cấu hình khác yêu cầu các tác nhân chạy trên mọi máy chủ, Ansible hoạt động trên các kết nối SSH mà bạn đã có. Bạn viết "playbook" mô tả những gì bạn muốn thực hiện và Ansible tìm ra cách thực hiện điều đó. Bạn cần cài đặt gói, sao chép tệp, khởi động dịch vụ hoặc quản lý người dùng trên 50 máy chủ? Viết nó một lần, chạy nó ở khắp mọi nơi.

## Bạn sẽ học được gì

Hướng dẫn này đưa bạn từ con số không về kiến thức Ansible đến việc tự tin tự động hóa các tác vụ cơ sở hạ tầng thực tế. Bạn sẽ bắt đầu với các khái niệm cơ bản và tiến tới tổ chức các dự án tự động hóa phức tạp mà nhóm của bạn có thể duy trì và mở rộng.

Đây là những gì chúng tôi sẽ đề cập:

**Bắt đầu**: Cài đặt Ansible và hiểu cách nó kết nối với máy chủ của bạn thông qua SSH. Bạn sẽ chạy lệnh đầu tiên và thấy kết quả ngay lập tức.

Khái niệm **Core**: Tìm hiểu về các tệp inventory (cách Ansible biết máy chủ nào cần quản lý), mô-đun (các khối xây dựng thực hiện công việc thực tế) và playbook (công thức kết hợp các mô-đun thành tự động hóa hữu ích).

**Writing Playbooks**: Tạo tập lệnh tự động hóa đầu tiên của bạn để cài đặt phần mềm, quản lý tệp và định cấu hình dịch vụ. Bạn sẽ thấy cách tiếp cận khai báo của Ansible khiến các tác vụ phức tạp trở nên đơn giản như thế nào.

**Quản lý máy chủ**: Tổ chức các máy chủ của bạn thành các nhóm, sử dụng các biến để xử lý sự khác biệt giữa các môi trường và hoạt động với facts tích hợp sẵn của Ansible về hệ thống của bạn.

**Tự động hóa nâng cao**: Chỉ sử dụng handler để khởi động lại dịch vụ khi cần, mẫu để tạo tệp cấu hình và vai trò để sắp xếp các thành phần tự động hóa có thể sử dụng lại.

**Thực tiễn sản xuất**: Cấu trúc các dự án tự động hóa lớn, xử lý bí mật một cách an toàn và triển khai các mẫu phù hợp với nhóm.

## Tại sao Ansible lại quan trọng

Nếu bạn đã từng dành cả buổi chiều để định cấu hình cùng một phần mềm trên nhiều máy chủ hoặc tự hỏi làm cách nào để đảm bảo môi trường production và staging của bạn luôn giống hệt nhau, thì Ansible sẽ cung cấp giải pháp. Nó biến việc quản lý máy chủ từ quy trình thủ công, dễ xảy ra lỗi thành quy trình tự động hóa đáng tin cậy và có thể lặp lại.

Các nhóm sử dụng Ansible cho:

- **Triển khai ứng dụng**: Đẩy các phiên bản mã mới một cách nhất quán trên các môi trường
- **Quản lý cấu hình**: Giữ cho máy chủ được cấu hình chính xác và phát hiện sự trôi dạt
- **Cung cấp cơ sở hạ tầng**: Thiết lập máy chủ mới từ đầu với mọi thứ họ cần
- **Tuân thủ bảo mật**: Áp dụng các bản cập nhật và cấu hình bảo mật trên toàn bộ nhóm của bạn

Phần tốt nhất? Ansible playbook được viết bằng YAML, một định dạng mà con người có thể đọc được, dễ hiểu, dễ đánh giá và bảo trì. Tự động hóa của bạn trở thành tài liệu về cách cơ sở hạ tầng của bạn hoạt động.

## Điều kiện tiên quyết

Bạn sẽ cần:

- Máy Linux hoặc macOS để chạy Ansible từ (máy tính xách tay của bạn hoạt động tốt)
- Một hoặc nhiều máy chủ Linux mà bạn có thể SSH vào bằng xác thực dựa trên khóa
- Kinh nghiệm dòng lệnh cơ bản và làm quen với SSH
- Hiểu biết về các tác vụ Linux phổ biến như cài đặt gói và chỉnh sửa tệp

Nếu không có sẵn máy chủ, bạn có thể làm theo bằng cách sử dụng máy ảo cục bộ hoặc phiên bản đám mây từ các nhà cung cấp như DigitalOcean, AWS hoặc Google Cloud.

Khi kết thúc hướng dẫn này, bạn sẽ có trải nghiệm thực tế với Ansible và tự tin để bắt đầu tự động hóa các tác vụ cơ sở hạ tầng của riêng mình. Hãy bắt đầu bằng cách cài đặt và kết nối Ansible với máy chủ đầu tiên của bạn.
