---
title: "Bắt đầu với Linux"
description: Cài đặt Linux và thiết lập môi trường của bạn thông qua nhiều phương pháp khác nhau, bao gồm khởi động kép, máy ảo và nền tảng đám mây.
order: 2
---

Có nhiều cách để bắt đầu sử dụng Linux, từ việc tạo bản cài đặt đầy đủ trên phần cứng của bạn đến khởi động máy chủ đám mây. Trong phần này, chúng tôi sẽ khám phá các lựa chọn của bạn và giúp bạn chọn phương pháp tốt nhất cho nhu cầu của mình.

## Chọn bản phân phối Linux của bạn

Trước khi cài đặt, bạn cần quyết định nên sử dụng bản phân phối Linux nào. Đối với người mới bắt đầu, những bản phân phối này mang lại điểm khởi đầu tốt:

- **Ubfox**: Thân thiện với người dùng với tài liệu tuyệt vời và hỗ trợ cộng đồng
- **Fedora**: Tương đối thân thiện với người dùng trong khi vẫn cập nhật các công nghệ mới nhất
- **Linux Mint**: Giao diện quen thuộc với người dùng Windows với codec đa phương tiện được cài đặt sẵn
- **Pop!\_OS**: Được tối ưu hóa cho các nhà phát triển và nhà sản xuất với cách tiếp cận tối giản, rõ ràng

Đối với hướng dẫn này, chúng tôi sẽ sử dụng **Ubuntu** trong các ví dụ của mình vì nó được sử dụng rộng rãi và được ghi chép đầy đủ nhưng các khái niệm này áp dụng cho hầu hết các bản phân phối.

## Tùy chọn cài đặt

Bạn có một số cách để chạy Linux:

1. **Dual boot**: Cài đặt Linux cùng với hệ điều hành hiện tại của bạn
2. **Cài đặt đầy đủ**: Thay thế hệ điều hành hiện tại của bạn bằng Linux
3. **Máy ảo**: Chạy Linux bên trong hệ điều hành hiện tại của bạn
4. **Linux trên đám mây**: Sử dụng máy chủ Linux trên đám mây
5. **Hệ thống con Windows cho Linux (WSL)**: Chạy Linux trực tiếp trong Windows
6. **Live USB**: Chạy Linux mà không cần cài đặt gì

Chúng ta hãy xem xét từng cách tiếp cận chi tiết hơn.

## Tùy chọn 1: Khởi động kép

Khả năng khởi động kép cho phép bạn chọn giữa Linux và hệ điều hành hiện tại (như Windows) khi bạn khởi động máy tính.

### Ưu điểm:

- Hiệu suất đầy đủ cho cả hai hệ điều hành
- Truy cập vào tất cả các khả năng phần cứng
- Có thể sử dụng một trong hai hệ điều hành bất cứ lúc nào (nhưng không phải đồng thời)

### Nhược điểm:

- Yêu cầu khởi động lại để chuyển đổi giữa các hệ thống
- Thiết lập phức tạp hơn
- Nguy cơ mất dữ liệu nhỏ trong quá trình phân vùng

### Thiết lập khởi động kép cơ bản:

1. Sao lưu tất cả dữ liệu quan trọng trên hệ thống hiện tại của bạn
2. Tải xuống tệp ISO Ubuntu từ [trang web chính thức](https://ubuntu.com/download/desktop)
3. Tạo ổ USB có khả năng khởi động bằng [Rufus](https://rufus.ie/) (Windows) hoặc [Máy khắc](https://www.balena.io/etcher/) (macOS/Linux)
4. Giải phóng dung lượng ổ đĩa bằng cách thu nhỏ phân vùng hiện có của bạn
5. Khởi động từ ổ USB và làm theo lời nhắc cài đặt
6. Chọn "Cài đặt cùng với [hệ điều hành hiện có]" khi được nhắc

Thao tác này sẽ tạo một menu khởi động xuất hiện khi bạn khởi động máy tính, cho phép bạn chọn sử dụng hệ điều hành nào.

## Tùy chọn 2: Máy ảo

Máy ảo (VM) cho phép bạn chạy Linux bên trong hệ điều hành hiện tại của mình.

### Ưu điểm:

- Không cần phân vùng lại ổ đĩa của bạn
- Có thể chạy cùng với hệ điều hành thông thường của bạn
- Dễ dàng tạo, xóa hoặc đặt lại
- Tuyệt vời để thử nghiệm và học tập

### Nhược điểm:

- Chi phí hiệu suất
- Quyền truy cập hạn chế vào phần cứng
- Sử dụng nhiều tài nguyên hệ thống hơn

### Thiết lập máy ảo:

1. Tải và cài đặt phần mềm ảo hóa:

   - [Hộp ảo](https://www.virtualbox.org/) (miễn phí, hoạt động trên Windows, macOS và Linux)
   - [Trình phát máy trạm VMware](https://www.vmware.com/products/workstation-player.html) (miễn phí cho mục đích phi thương mại)

2. Tải xuống tệp ISO Ubuntu

3. Tạo một máy ảo mới:

```
# VirtualBox example commands (if using command line)
VBoxManage createvm --name "Ubuntu" --ostype Ubuntu_64 --register
VBoxManage modifyvm "Ubuntu" --memory 2048 --cpus 2
VBoxManage createhd --filename "Ubuntu.vdi" --size 20000
VBoxManage storagectl "Ubuntu" --name "SATA Controller" --add sata
VBoxManage storageattach "Ubuntu" --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium "Ubuntu.vdi"
```

Hầu hết người dùng sẽ thích giao diện đồ họa hơn, nhưng những lệnh này hiển thị những gì đang diễn ra ở hậu trường.

4. Khởi động VM và chọn tệp ISO của bạn khi được nhắc
5. Làm theo hướng dẫn cài đặt trên màn hình

## Tùy chọn 3: Linux trên đám mây

Các nhà cung cấp đám mây cho phép bạn tạo máy chủ Linux trong vài phút mà không cần phần cứng vật lý.

### Ưu điểm:

- Không có yêu cầu phần cứng cục bộ
- Có thể truy cập từ mọi nơi
- Dễ dàng tăng hoặc giảm quy mô tài nguyên
- Hoàn hảo cho dịch vụ lưu trữ hoặc quản trị máy chủ học tập

### Nhược điểm:

- Chi phí liên tục (mặc dù thường không tốn kém)
- Yêu cầu kết nối internet
- Không lý tưởng cho các ứng dụng máy tính để bàn

### Thiết lập máy chủ Cloud Linux:

DigitalOcean cung cấp một trong những cách đơn giản nhất để bắt đầu với máy chủ Linux:

1. Đăng ký tài khoản DigitalOcean (sử dụng [liên kết này](https://m.do.co/c/2a9bba940f39) để nhận tín dụng $200 trong 60 ngày)
2. Tạo một Droplet mới (thuật ngữ của DigitalOcean dành cho máy chủ ảo)
3. Chọn Ubuntu làm hệ điều hành
4. Chọn gói học tập nhỏ nhất ($4-5/tháng hoặc miễn phí kèm tín chỉ)
5. Chọn khu vực trung tâm dữ liệu gần bạn
6. Thêm khóa SSH của bạn (được khuyến nghị) hoặc chọn xác thực bằng mật khẩu
7. Nhấp vào "Tạo giọt"

Trong vòng một phút, bạn sẽ có một máy chủ Linux đầy đủ chức năng. Kết nối với nó bằng SSH:

```bash
ssh root@your_server_ip
```

Cách tiếp cận này lý tưởng cho việc học quản trị máy chủ hoặc lưu trữ các ứng dụng web.

## Tùy chọn 4: Hệ thống con Windows cho Linux (WSL)

Nếu bạn đang sử dụng Windows 10 hoặc 11, WSL cho phép bạn chạy môi trường Linux mà không cần khởi động kép hoặc máy ảo.

### Ưu điểm:

- Dễ dàng cài đặt qua Windows
- Tích hợp tốt với hệ thống tập tin Windows
- Hiệu suất tốt hơn hầu hết các máy ảo
- Không cần khởi động lại

### Nhược điểm:

- Một số hạn chế với hoạt động ở cấp hệ thống
- Không phải là một hệ thống Linux hoàn chỉnh
- Giải pháp dành riêng cho Windows

### Thiết lập WSL:

1. Mở PowerShell với tư cách Quản trị viên và chạy:

```powershell
wsl --install
```

2. Khởi động lại máy tính của bạn
3. WSL sẽ hoàn tất cài đặt Ubuntu theo mặc định
4. Tạo tên người dùng và mật khẩu khi được nhắc

Bây giờ bạn có thể khởi chạy Ubuntu từ menu Bắt đầu hoặc bằng cách nhập `wsl` vào dấu nhắc lệnh.

## Tùy chọn 5: USB trực tiếp

USB trực tiếp cho phép bạn dùng thử Linux mà không cần cài đặt bất cứ thứ gì trên máy tính của mình.

### Ưu điểm:

- Không có thay đổi nào đối với hệ thống hiện tại của bạn
- Cách tốt để kiểm tra khả năng tương thích
- Hữu ích cho việc sửa chữa và phục hồi máy tính

### Nhược điểm:

- Hiệu suất chậm hơn
- Các thay đổi không còn tồn tại sau khi khởi động lại (trừ khi được định cấu hình kiên trì)
- Chức năng hạn chế đối với một số tác vụ

### Tạo USB trực tiếp:

1. Tải xuống tệp ISO Ubuntu
2. Sử dụng Rufus (Windows) hoặc Etcher (macOS/Linux) để tạo ổ USB có khả năng khởi động
3. Khởi động máy tính của bạn từ ổ USB
4. Chọn "Dùng thử Ubuntu" thay vì "Cài đặt Ubuntu"

Điều này mang lại cho bạn một máy tính để bàn Ubuntu đầy đủ chức năng chạy trực tiếp từ ổ USB.

## Đăng nhập lần đầu và môi trường máy tính để bàn

Sau khi cài đặt, bạn sẽ được chào đón bởi màn hình đăng nhập. Nhập tên người dùng và mật khẩu bạn đã tạo trong quá trình thiết lập.

Ubuntu sử dụng môi trường máy tính để bàn Gnome theo mặc định, bao gồm:

- Một dock ở bên trái (hoặc phía dưới) dành cho các ứng dụng thường xuyên sử dụng
- Tổng quan về hoạt động để truy cập tất cả các ứng dụng
- Khay hệ thống với các thông báo và cài đặt nhanh
- Trình đơn ứng dụng

Các bản phân phối khác có thể sử dụng các môi trường máy tính để bàn khác nhau:

- **KDE Plasma**: Giàu tính năng, có khả năng tùy biến cao
- **XFCE**: Máy tính để bàn truyền thống, nhẹ
- **Cinnamon**: Bố cục truyền thống tương tự như Windows
- **MATE**: Trải nghiệm Gnome 2 cổ điển

Hầu hết các môi trường máy tính để bàn đều có chung các thành phần như bảng điều khiển, menu ứng dụng và khay hệ thống nhưng có thể sắp xếp chúng theo cách khác nhau.

## Các bước cần thiết đầu tiên sau khi cài đặt

Khi bạn đã cài đặt Linux, hãy xem xét các bước quan trọng tiếp theo sau:

### 1. Cập nhật hệ thống của bạn

Mở một thiết bị đầu cuối và chạy:

```bash
sudo apt update
sudo apt upgrade
```

Việc này sẽ cập nhật danh sách gói của bạn và cài đặt phiên bản mới nhất của tất cả các gói.

### 2. Cài đặt phần mềm thiết yếu

Ubuntu bao gồm hầu hết các điều cơ bản, nhưng bạn có thể muốn thêm:

```bash
sudo apt install build-essential git curl wget unzip
```

Đối với các công cụ phát triển, hãy xem xét:

```bash
sudo apt install python3-pip nodejs npm
```

### 3. Định cấu hình cài đặt hệ thống

Mở ứng dụng Cài đặt để:

- Kết nối với mạng Wi-Fi
- Định cấu hình hiển thị
- Thiết lập định dạng ngôn ngữ và khu vực
- Tùy chỉnh ngoại hình

### 4. Khám phá Trình quản lý tệp

Điều hướng qua các tệp của bạn bằng trình quản lý tệp (Nautilus trong Ubuntu). Các địa điểm chính cần khám phá:

- `/home/yourusername` - Tập tin cá nhân của bạn
- `/etc` - File cấu hình hệ thống
- `/usr` - Ứng dụng đã cài đặt

## Khắc phục sự cố cài đặt thường gặp

### Sự cố khởi động

Nếu hệ thống của bạn không khởi động đúng cách:

- Xác minh rằng Khởi động an toàn đã bị tắt trong BIOS/UEFI
- Kiểm tra thứ tự khởi động trong cài đặt BIOS
- Hãy thử tùy chọn khởi động nomodeset cho các vấn đề về đồ họa

### Sự cố Wi-Fi

Nếu Wi-Fi không hoạt động:

- Một số card không dây cần trình điều khiển độc quyền
- Kết nối với Ethernet nếu có thể và chạy:
  ```bash
  sudo ubuntu-drivers autoinstall
  ```
- Kiểm tra trình điều khiển bổ sung trong phần mềm và cập nhật

### Sự cố đồ họa

Đối với vấn đề hiển thị:

- Kiểm tra trình điều khiển bổ sung
- Đối với đồ họa NVIDIA:
  ```bash
  sudo apt install nvidia-driver-xxx
  ```
  (thay thế xxx bằng phiên bản được đề xuất)

## Tiến về phía trước

Bây giờ bạn đã thiết lập và chạy Linux, chúng tôi đã đề cập đến những kiến thức cơ bản về cài đặt để giúp bạn bắt đầu. Trong phần tiếp theo, chúng ta sẽ khám phá giao diện dòng lệnh Linux, nơi bạn sẽ khám phá được sức mạnh thực sự của Linux.

Cho dù bạn đang sử dụng cài đặt trên máy tính để bàn, máy ảo hay máy chủ đám mây, các kỹ năng dòng lệnh bạn học sẽ có thể áp dụng được trên tất cả các môi trường Linux.
