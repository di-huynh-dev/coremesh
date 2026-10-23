---
title: "Tìm hiểu cơ bản về Docker"
description: Tìm hiểu các khái niệm cơ bản đằng sau Docker container và cách chúng hoạt động
order: 1
---

Docker giới thiệu một sự thay đổi mô hình trong cách chúng tôi nghĩ về việc triển khai ứng dụng. Trước khi đi sâu vào các lệnh và quy trình làm việc, điều quan trọng là phải hiểu các khái niệm cốt lõi khiến Docker trở nên mạnh mẽ.

## Container là gì?

container là các gói nhẹ, độc lập, có thể thực thi được, chứa mọi thứ cần thiết để chạy một ứng dụng: mã, thời gian chạy, công cụ hệ thống, thư viện và cài đặt. Chúng cách ly phần mềm với môi trường xung quanh, đảm bảo hoạt động nhất quán trên các môi trường khác nhau.

Không giống như các máy ảo truyền thống có hệ điều hành đầy đủ, container chia sẻ nhân của hệ thống máy chủ và chỉ đóng gói ứng dụng cũng như các phần phụ thuộc trực tiếp của nó. Điều này làm cho chúng hiệu quả hơn đáng kể về mặt tài nguyên hệ thống.

```
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Container 1 │  │ Container 2 │  │ Container 3 │
├────────────┤  ├────────────┤  ├────────────┤
│    App A    │  │    App B    │  │    App C    │
├────────────┤  ├────────────┤  ├────────────┤
│  Bins/Libs  │  │  Bins/Libs  │  │  Bins/Libs  │
└────────────┘  └────────────┘  └────────────┘
        │              │              │
┌───────┴──────────────┴──────────────┴───────┐
│              Docker Engine                   │
├────────────────────────────────────────────┤
│                Host OS Kernel                │
└────────────────────────────────────────────┘
```

## Kiến trúc Docker

Docker sử dụng kiến trúc client-server bao gồm:

1. **Docker Client**: Giao diện chính bạn sử dụng để tương tác với Docker thông qua các lệnh như `docker build` hoặc `docker run`.

2. **Docker Daemon (dockerd)**: Dịch vụ nền quản lý các đối tượng Docker như image, container, mạng và volume.

3. **Docker Register**: Hệ thống lưu trữ và phân phối cho Docker image. Docker Hub là cơ quan đăng ký công khai mặc định, nhưng bạn cũng có thể sử dụng cơ quan đăng ký riêng tư.

## Các khái niệm chính về Docker

### Image

Docker image là mẫu chỉ đọc có hướng dẫn tạo Docker container. Hãy coi nó như một ảnh chụp nhanh hoặc bản thiết kế chi tiết của một ứng dụng và môi trường của nó. image được xây dựng theo lớp, trong đó mỗi lớp đại diện cho một tập hợp các thay đổi đối với hệ thống tệp.

image được xác định bởi Dockerfile, chứa một loạt hướng dẫn để xây dựng image. Sau khi được xây dựng, image là bất biến, chúng không thay đổi trừ khi bạn xây dựng lại chúng.

### Container

container là phiên bản có thể chạy được của image. Bạn có thể tạo, bắt đầu, dừng, di chuyển hoặc xóa container bằng API Docker hoặc CLI. container được cách ly với nhau và với máy chủ.

### Đăng ký

Cơ quan đăng ký Docker lưu trữ và phân phối Docker image. Docker Hub là cơ quan đăng ký công khai mặc định nhưng nhiều tổ chức vẫn duy trì cơ quan đăng ký riêng cho các ứng dụng độc quyền.

### Volume

volume cung cấp khả năng lưu trữ liên tục cho container. Vì container theo thiết kế là phù du (có nghĩa là dữ liệu bị mất khi container bị xóa), volume cho phép bạn duy trì dữ liệu bên ngoài vòng đời của container.

## Ưu điểm của Docker

Docker cung cấp một số lợi ích khiến nó trở thành nền tảng container hóa hàng đầu:

1. **Consistency**: "Nó hoạt động trên máy của tôi" trở thành "Nó hoạt động trên mọi máy" vì Docker đóng gói ứng dụng và môi trường của nó cùng nhau.

2. **Isolation**: Các ứng dụng và phần phụ thuộc của chúng được cách ly khỏi máy chủ và với nhau, ngăn ngừa xung đột.

3. **Efficiency**: container chia sẻ nhân hệ điều hành máy chủ, khiến chúng nhẹ hơn nhiều so với máy ảo.

4. **Scalability**: container có thể được khởi động và dừng nhanh chóng, khiến chúng trở nên lý tưởng cho các ứng dụng mở rộng quy mô.

5. **Versioning**: Docker image có thể được phiên bản hóa, cho phép bạn theo dõi các thay đổi và quay lại nếu cần.

6. **Reusability**: Docker image có thể được sử dụng lại trên các dự án và môi trường khác nhau.

## Docker so với máy ảo

Mặc dù cả hai công nghệ đều cung cấp khả năng cách ly và ảo hóa nhưng chúng hoạt động khác nhau:

```
┌───────────┐  ┌───────────┐     ┌───────────┐  ┌───────────┐
│    App A   │  │    App B   │     │    App A   │  │    App B   │
├───────────┤  ├───────────┤     ├───────────┤  ├───────────┤
│  Bins/Libs │  │  Bins/Libs │     │  Guest OS  │  │  Guest OS  │
├───────────┴──┴───────────┤     ├───────────┤  ├───────────┤
│      Docker Engine       │     │ Hypervisor │  │ Hypervisor │
├───────────────────────────┤     ├───────────┴──┴───────────┤
│       Host OS Kernel      │     │         Host OS          │
└───────────────────────────┘     └───────────────────────────┘
     Docker Containers                Virtual Machines
```

**Máy Ảo**:

- Chạy một hệ điều hành đầy đủ bao gồm cả kernel
- Bắt đầu chậm hơn
- Chi phí tài nguyên cao hơn
- Cách ly hoàn toàn

**Docker Container**:

- Chia sẻ kernel hệ điều hành máy chủ
- Bắt đầu gần như ngay lập tức
- Chi phí tài nguyên tối thiểu
- Cách ly cấp quy trình

Việc hiểu các khái niệm cơ bản này sẽ giúp bạn hiểu rõ hơn về các khả năng và quy trình làm việc của Docker khi chúng tôi thực hiện qua hướng dẫn này. Trong phần tiếp theo, chúng tôi sẽ cài đặt Docker và chuẩn bị sẵn sàng cho môi trường của bạn bắt đầu hoạt động với container.
