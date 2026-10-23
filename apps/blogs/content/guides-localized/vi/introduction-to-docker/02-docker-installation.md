---
title: "Cài đặt Docker"
description: Cài đặt Docker trên Ubuntu, macOS và Windows từng bước. Bao gồm thiết lập kho lưu trữ, Docker Desktop, xác minh cài đặt và các tác vụ sau cài đặt bắt buộc.
order: 2
---

Trước khi có thể bắt đầu xây dựng và chạy container, bạn cần cài đặt Docker trên hệ thống của mình. Phần này hướng dẫn bạn cài đặt Docker trên các hệ điều hành khác nhau và xác minh cài đặt của bạn.

## Điều kiện tiên quyết

- Quyền truy cập quản trị hoặc sudo trên hệ thống của bạn
- Một hệ điều hành được hỗ trợ (Linux, macOS hoặc Windows)
- Kết nối Internet để tải xuống các gói Docker

## Cài đặt Docker trên Ubuntu

Việc cài đặt Docker trên Ubuntu rất đơn giản. Chúng tôi sẽ cài đặt Docker Community Edition (CE), phiên bản này hoàn hảo cho các nhà phát triển cá nhân và nhóm nhỏ.

Trước tiên, hãy cập nhật chỉ mục gói của bạn và cài đặt các gói tiên quyết:

```bash
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
```

Tiếp theo, thêm khóa GPG chính thức của Docker:

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

Thêm kho Docker vào nguồn APT:

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Bây giờ, hãy cập nhật lại chỉ mục gói của bạn và cài đặt Docker:

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

Sau khi cài đặt, dịch vụ Docker sẽ tự động khởi động. Xác minh nó đang chạy:

```bash
sudo systemctl status docker
```

## Cài đặt Docker trên macOS

Docker Desktop cho Mac cung cấp gói dễ cài đặt bao gồm mọi thứ bạn cần.

1. Hãy ghé thăm [Trang tải xuống Docker Desktop cho Mac](https://www.docker.com/products/docker-desktop)
2. Tải xuống tệp .dmg
3. Bấm đúp vào tệp .dmg để mở trình cài đặt
4. Kéo biểu tượng Docker vào thư mục Ứng dụng
5. Mở Docker từ thư mục Ứng dụng của bạn

Docker Desktop chạy ngầm một máy ảo nhẹ để cung cấp chức năng Linux container trên macOS.

## Cài đặt Docker trên Windows

Đối với các phiên bản Windows 10/11 Professional, Enterprise hoặc Education có khả năng Hyper-V:

1. Hãy ghé thăm [Trang tải xuống Docker Desktop cho Windows](https://www.docker.com/products/docker-desktop)
2. Tải xuống trình cài đặt
3. Chạy trình cài đặt và làm theo lời nhắc
4. Khởi động Docker Desktop từ menu Bắt đầu

Đối với phiên bản Windows Home hoặc các hệ thống không có Hyper-V, Docker Desktop hiện sử dụng WSL 2 (Hệ thống con Windows cho Linux 2):

1. Cài đặt WSL 2 bằng cách làm theo [hướng dẫn của Microsoft](https://docs.microsoft.com/en-us/windows/wsl/install)
2. Tải xuống và cài đặt Docker Desktop
3. Đảm bảo Docker được định cấu hình để sử dụng WSL 2 backend trong Cài đặt

## Các bước sau khi cài đặt cho Linux

Trên Linux, bạn có thể muốn thêm người dùng của mình vào nhóm `docker` để chạy các lệnh Docker mà không cần `sudo`:

```bash
sudo usermod -aG docker $USER
```

Sau khi chạy lệnh này, hãy đăng xuất và đăng nhập lại để những thay đổi có hiệu lực.

## Chạy Docker trên đám mây

Nếu không muốn cài đặt Docker cục bộ, bạn có thể sử dụng môi trường phát triển dựa trên đám mây. DigitalOcean's Droplets cung cấp nền tảng tuyệt vời để chạy Docker.

Bạn có thể nhanh chóng tạo ra một Droplet được cài đặt sẵn Docker bằng ứng dụng One-Click Docker của họ. [Nhận 200 đô la tín dụng miễn phí khi bạn đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để kiểm tra các ứng dụng Docker của bạn trên đám mây.

## Xác minh cài đặt của bạn

Bất kể hệ điều hành của bạn là gì, hãy xác minh cài đặt của bạn bằng cách chạy lệnh sau:

```bash
docker --version
```

Bạn sẽ thấy đầu ra tương tự như:

```
Docker version 24.0.7, build afdd53b4e3
```

Để xác minh rằng Docker có thể kéo image và chạy container, hãy thử chạy container "hello-world":

```bash
docker run hello-world
```

Nếu thành công, bạn sẽ thấy thông báo cho biết cài đặt của bạn đang hoạt động chính xác:

```
Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

## Các thành phần Docker đã được cài đặt

Khi bạn cài đặt Docker, bạn sẽ nhận được:

1. **Docker daemon (dockerd)**: Quá trình nền liên tục quản lý các đối tượng Docker
2. **Docker client (docker)**: Công cụ dòng lệnh cho phép bạn tương tác với Docker
3. **Docker Compose**: Công cụ xác định và chạy nhiều ứng dụng container
4. **Docker content Trust**: Tính năng ký và xác minh container image

## Cập nhật Docker

Cách tốt nhất là luôn cập nhật Docker để hưởng lợi từ các bản vá bảo mật và tính năng mới:

- **Linux**: Cập nhật bằng trình quản lý gói của bạn (ví dụ: `sudo apt update && sudo apt upgrade`)
- **macOS/Windows**: Docker Desktop thường thông báo cho bạn khi có bản cập nhật

## Khắc phục sự cố cài đặt thường gặp

Nếu Docker không hoạt động sau khi cài đặt, hãy thử các bước sau:

1. Đảm bảo daemon Docker đang chạy:

   ```bash
   sudo systemctl status docker
   ```

2. Kiểm tra xem người dùng của bạn có quyền chạy Docker (Linux):

   ```bash
   groups | grep docker
   ```

3. Khởi động lại dịch vụ Docker:

   ```bash
   sudo systemctl restart docker
   ```

4. Đối với Docker Desktop, hãy kiểm tra yêu cầu hệ thống và khởi động lại ứng dụng

Bây giờ bạn đã cài đặt và xác minh Docker, bạn đã sẵn sàng bắt đầu làm việc với Docker container và image trong phần tiếp theo.
