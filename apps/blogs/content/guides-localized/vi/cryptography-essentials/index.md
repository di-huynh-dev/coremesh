---
title: Khái niệm cơ bản về mật mã
description: 'Nắm vững các nguyên tắc cơ bản về mật mã mà mọi kỹ sư DevOps cần: mã hóa đối xứng và bất đối xứng, thuật toán băm, chứng chỉ TLS/SSL và Cơ sở hạ tầng khóa công khai (PKI).'
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
  - Mật mã học
  - Mã hóa
  - TLS
  - PKI
---

Mật mã là nền tảng của các hệ thống an toàn. Mỗi khi bạn triển khai một ứng dụng qua HTTPS, lưu trữ mật khẩu, ký container image hoặc mã hóa bí mật trong pipeline, bạn đang dựa vào mật mã nguyên thủy. Hiểu cách thức hoạt động của những điều này—và quan trọng hơn, cách chúng có thể thất bại—là điều cần thiết để xây dựng cơ sở hạ tầng an toàn.

Hướng dẫn này bao gồm các khái niệm mật mã mà các kỹ sư DevOps gặp phải hàng ngày. Chúng tôi sẽ không đi sâu vào toán học nhưng sẽ cung cấp cho bạn kiến thức thực tế để đưa ra quyết định bảo mật sáng suốt.

Đến cuối hướng dẫn này, bạn sẽ hiểu khi nào nên sử dụng các loại mã hóa khác nhau, lý do tại sao một số thuật toán băm không an toàn, cách TLS bảo vệ dữ liệu khi truyền và cách PKI thiết lập sự tin cậy.

## Bạn sẽ học được gì

Hướng dẫn này bao gồm các phần sau:

1. Mã hóa - Đối xứng và bất đối xứng, thuật toán phổ biến, quản lý khóa
2. Băm - Xác minh tính toàn vẹn, lưu trữ mật khẩu, chọn thuật toán
3. TLS/SSL - Cách thức hoạt động của HTTPS, loại chứng chỉ, cấu hình sai phổ biến
4. PKI - Cơ quan cấp chứng chỉ, chuỗi tin cậy, vòng đời chứng chỉ

## Tại sao mật mã lại quan trọng đối với DevOps

Hãy xem xét các tình huống thực tế sau:

- Chứng chỉ TLS bị định cấu hình sai gây ra sự cố ngừng hoạt động production
- Các khóa API bị rò rỉ được mã hóa bằng thuật toán yếu sẽ bị kẻ tấn công giải mã
- Vi phạm mật khẩu khiến hàng triệu người dùng bị lộ vì MD5 được sử dụng để băm
- CI/CD pipeline bị xâm phạm do các bí mật không được mã hóa đúng cách khi lưu trữ

Mỗi sự cố này đều có thể được ngăn chặn bằng kiến thức về mật mã thích hợp. Mật mã không chỉ dành cho các chuyên gia bảo mật—nó là năng lực cốt lõi của bất kỳ ai xây dựng và vận hành các hệ thống hiện đại.

## Điều kiện tiên quyết

Hướng dẫn này giả sử bạn có:

- Làm quen với dòng lệnh cơ bản
- Hiểu biết về các khái niệm HTTP/HTTPS
- Kinh nghiệm triển khai các ứng dụng (container, đám mây hoặc truyền thống)

Không cần có kiến thức về mật mã trước đó.

## Hướng dẫn này dành cho ai

Hướng dẫn này được thiết kế cho:

- Kỹ sư DevOps quản lý chứng chỉ và bí mật
- Nhà phát triển triển khai xác thực và bảo vệ dữ liệu
- Kỹ sư nền tảng xây dựng cơ sở hạ tầng an toàn
- Bất cứ ai chuẩn bị cho các cuộc phỏng vấn tập trung vào bảo mật

Hãy xây dựng nền tảng mật mã của bạn!

## Thực hành thực hành

Củng cố những gì bạn học được ở đây với [Trình mô phỏng bắt tay SSL/TLS](/games/ssl-tls-handshake) tương tác, ngay trong trình duyệt của bạn mà không cần thiết lập.
