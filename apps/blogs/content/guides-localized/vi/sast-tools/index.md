---
title: Kiểm tra bảo mật ứng dụng tĩnh (SAST)
description: Kiểm thử bảo mật ứng dụng tĩnh (SAST) thành thạo với SonarQube, Semgrep và CodeQL. Tìm hiểu cách phát hiện các lỗ hổng trong mã nguồn trước khi chúng đạt tới production.
category:
  name: Bảo mật
  slug: security
publishedAt: '2025-01-24'
updatedAt: '2025-01-24'
author:
  name: DevOps Daily Team
  slug: devops-daily-team
tags:
  - Bảo mật
  - DevSecOps
  - SAST
  - SonarQube
  - Semgrep
  - CodeQL
---

Kiểm tra bảo mật ứng dụng tĩnh (SAST) phân tích mã nguồn để tìm các lỗ hổng bảo mật mà không cần thực thi ứng dụng. Không giống như thử nghiệm động yêu cầu ứng dụng đang chạy, SAST có thể phát hiện sớm các sự cố trong quá trình phát triển—khi việc khắc phục chúng có chi phí rẻ nhất.

Các công cụ SAST quét cơ sở mã của bạn để tìm các mẫu chỉ ra điểm yếu về bảo mật: SQL injection, tập lệnh chéo trang, bí mật được mã hóa cứng, mật mã không an toàn và hàng trăm lớp lỗ hổng khác. Chúng tích hợp vào IDE, CI/CD pipeline và quy trình xem xét mã của bạn để cung cấp phản hồi bảo mật liên tục.

Hướng dẫn này bao gồm ba công cụ SAST phổ biến nhất, mỗi công cụ có điểm mạnh khác nhau:

- **SonarQube** — Nền tảng bảo mật và chất lượng mã toàn diện
- **Semgrep** — Khớp mẫu nhanh, có thể tùy chỉnh cho các quy tắc bảo mật
- **CodeQL** - Phân tích mã ngữ nghĩa mạnh mẽ từ GitHub

## Bạn sẽ học được gì

Hướng dẫn này bao gồm các phần sau:

1. Nguyên tắc cơ bản của SAST - Cách phân tích tĩnh hoạt động, các loại phân tích, hạn chế
2. SonarQube - Thiết lập, cấu hình, cổng chất lượng và tích hợp CI/CD
3. Semgrep - Viết quy tắc tùy chỉnh, sử dụng sổ đăng ký và tích hợp pipeline
4. CodeQL - Kiến thức cơ bản về ngôn ngữ truy vấn, truy vấn bảo mật và tích hợp GitHub

## Tại sao SAST lại quan trọng đối với DevOps

Hãy xem xét các tình huống sau:

- Lỗ hổng SQL injection chuyển tới production vì không ai nhận thấy việc nối chuỗi
- Thông tin xác thực AWS được mã hóa cứng trong tệp cấu hình nhận đã commit và bị lộ
- Một nhà phát triển cấp dưới sử dụng MD5 để băm mật khẩu mà không biết rằng nó không an toàn
- Lỗ hổng chuyển hướng mở nằm trong cơ sở mã nhiều tháng trước khi được phát hiện

Các công cụ SAST tự động phát hiện những vấn đề này trong quá trình phát triển chứ không phải sau khi triển khai. Họ cung cấp một mạng lưới an toàn phù hợp với nhóm của bạn—mọi commit đều được đánh giá bảo mật kỹ lưỡng như nhau.

## Điều kiện tiên quyết

Hướng dẫn này giả sử bạn có:

- Hiểu biết cơ bản về các lỗ hổng phổ biến (SQL injection, XSS, v.v.)
- Làm quen với CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins)
- Có kinh nghiệm với ít nhất một ngôn ngữ lập trình
- Docker đã được cài đặt (để chạy SonarQube cục bộ)

## Hướng dẫn này dành cho ai

Hướng dẫn này được thiết kế cho:

- Kỹ sư DevOps triển khai bảo mật trong CI/CD pipeline
- Kỹ sư bảo mật đánh giá hoặc triển khai các công cụ SAST
- Các nhà phát triển muốn nắm bắt các vấn đề bảo mật sớm hơn
- Các nhóm xây dựng quy trình thực hành DevSecOps từ đầu

Hãy bắt đầu tìm kiếm lỗ hổng trước khi kẻ tấn công làm điều đó!
