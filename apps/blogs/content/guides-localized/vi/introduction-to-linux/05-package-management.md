---
title: "Quản lý gói"
description: Cài đặt, cập nhật và gỡ bỏ phần mềm trên Linux bằng apt, dnf, pacman và zypper. Bao gồm các kho lưu trữ, phần phụ thuộc, tìm kiếm và cập nhật hệ thống.
order: 5
---

Một trong những điểm mạnh nhất của Linux là cách nó xử lý việc cài đặt và cập nhật phần mềm thông qua hệ thống quản lý gói. Không giống như Windows hoặc macOS, nơi bạn thường tải xuống trình cài đặt từ các trang web, bản phân phối Linux sử dụng kho lưu trữ gói tập trung chứa hàng nghìn gói phần mềm được định cấu hình sẵn.

Trong phần này, chúng ta sẽ khám phá cách quản lý gói hoạt động và cách sử dụng các trình quản lý gói phổ biến nhất.

## Khái niệm quản lý gói

Trước khi đi sâu vào các trình quản lý gói cụ thể, hãy hiểu một số khái niệm chính:

### Gói là gì?

Một gói là một kho lưu trữ nén có chứa:

- Các tập tin của phần mềm (nhị phân, thư viện, tài liệu)
- Siêu dữ liệu (tên, phiên bản, mô tả)
- Phụ thuộc (yêu cầu các gói khác)
- Kịch bản cài đặt (cấu hình phần mềm trong khi cài đặt)
- Tệp cấu hình

### Kho gói

Kho lưu trữ (hoặc "repos") là các máy chủ lưu trữ các bộ sưu tập gói. Các bản phân phối duy trì các kho lưu trữ chính thức, nhưng các kho lưu trữ của bên thứ ba có thể được thêm vào cho phần mềm bổ sung.

### Phụ thuộc

Hầu hết phần mềm đều dựa vào các thành phần phần mềm khác (thư viện, khung, v.v.). Trình quản lý gói tự động giải quyết các phụ thuộc này, cài đặt mọi gói cần thiết.

### Hoạt động chung

Tất cả các trình quản lý gói đều cung cấp các lệnh để:

- Cài đặt gói
- Xóa gói
- Cập nhật gói
- Tìm kiếm các gói
- Liệt kê các gói đã cài đặt
- Hiển thị thông tin gói

## Hệ thống quản lý gói chính

Các bản phân phối Linux sử dụng các hệ thống quản lý gói khác nhau:

| Định dạng gói | Trình quản lý gói    | Được sử dụng bởi                           |
| -------------- | ------------------ | --------------------------------- |
| .deb           | apt, apt-get, dpkg | Debian, Ubuntu, Linux Mint        |
| .rpm           | ừm, dnf, vòng/phút      | Fedora, RHEL, CentOS, Rocky Linux |
| .pkg.tar.zst   | Pacman             | Arch Linux, Manjaro               |
| .xbps          | xbps               | Linux trống                        |
| (khác nhau)      | bến cảng            | gentoo                            |
| .apk           | apk                | Linux Linux                      |

Chúng ta sẽ tập trung vào các trình quản lý gói được sử dụng rộng rãi nhất: apt, dnf/yum và pacman.

## Trình quản lý gói APT (Debian/Ubuntu)

Công cụ gói nâng cao (APT) được sử dụng bởi các bản phân phối dựa trên Debian như Ubuntu và Linux Mint.

### Cấu hình

Nguồn kho lưu trữ của APT được xác định trong `/etc/apt/sources.list` và các tệp trong thư mục `/etc/apt/sources.list.d/`.

Một mục điển hình trông giống như:

```
deb http://archive.ubuntu.com/ubuntu/ jammy main restricted universe multiverse
```

Điều này chỉ định:

- Loại kho lưu trữ (`deb` cho gói nhị phân)
- URL kho lưu trữ
- Tên mã phân phối (`jammy` cho Ubuntu 22.04)
- Các thành phần kho lưu trữ (chính, bị hạn chế, vũ trụ, đa vũ trụ)

### Các lệnh APT cơ bản

Đầu tiên, cập nhật chỉ mục gói:

```bash
sudo apt update
```

Thao tác này sẽ làm mới danh sách các gói có sẵn nhưng không cài đặt bất cứ thứ gì.

#### Cài đặt gói

Cài đặt một gói:

```bash
sudo apt install package_name
```

Cài đặt nhiều gói:

```bash
sudo apt install package1 package2 package3
```

#### Xóa gói

Xóa một gói:

```bash
sudo apt remove package_name
```

Xóa gói và các tệp cấu hình của nó:

```bash
sudo apt purge package_name
```

Xóa các phụ thuộc không sử dụng:

```bash
sudo apt autoremove
```

#### Gói nâng cấp

Nâng cấp tất cả các gói đã cài đặt:

```bash
sudo apt upgrade
```

Nâng cấp và gỡ bỏ các gói lỗi thời:

```bash
sudo apt full-upgrade
```

Cập nhật và nâng cấp trong một lệnh:

```bash
sudo apt update && sudo apt upgrade
```

#### Tìm kiếm gói

Tìm kiếm các gói:

```bash
apt search keyword
```

Hiển thị chi tiết gói:

```bash
apt show package_name
```

Liệt kê các gói đã cài đặt:

```bash
apt list --installed
```

Kiểm tra xem một gói cụ thể đã được cài đặt chưa:

```bash
apt list --installed | grep package_name
```

### Làm việc với tệp .deb

Đôi khi bạn có thể cần cài đặt trực tiếp tệp .deb:

```bash
sudo apt install ./package.deb
```

Hoặc sử dụng dpkg (công cụ cấp thấp hơn):

```bash
sudo dpkg -i package.deb
sudo apt install -f  # Fix dependencies if needed
```

### Giữ gói (Ngăn chặn cập nhật)

Ngăn chặn gói được nâng cấp:

```bash
sudo apt-mark hold package_name
```

Loại bỏ khoản giữ:

```bash
sudo apt-mark unhold package_name
```

### Thêm kho lưu trữ

Thêm kho lưu trữ bằng cách sử dụng add-apt-repository:

```bash
sudo add-apt-repository ppa:team/repository
sudo apt update
```

### Ví dụ APT thực tế

Hãy cài đặt và định cấu hình máy chủ web Nginx:

```bash
# Update package lists
sudo apt update

# Install Nginx
sudo apt install nginx

# Check the status
sudo systemctl status nginx

# Install some common Nginx add-ons
sudo apt install nginx-extras

# View package information
apt show nginx
```

## Trình quản lý gói DNF/YUM (Fedora/RHEL/CentOS)

Fedora sử dụng DNF (Dandified YUM), trong khi các phiên bản RHEL và CentOS cũ hơn sử dụng YUM. DNF là phiên bản mới hơn với độ phân giải phụ thuộc được cải thiện. Các lệnh rất giống nhau.

### Cấu hình

Cấu hình kho lưu trữ được lưu trữ trong `/etc/yum.repos.d/` dưới dạng tệp `.repo`.

Một tệp repo điển hình chứa:

```
[repository-name]
name=Repository Description
baseurl=http://repo.url/path
enabled=1
gpgcheck=1
gpgkey=http://repo.url/key.asc
```

### Các lệnh DNF/YUM cơ bản

Kiểm tra các bản cập nhật:

```bash
sudo dnf check-update  # DNF
sudo yum check-update  # YUM
```

#### Cài đặt gói

Cài đặt một gói:

```bash
sudo dnf install package_name
sudo yum install package_name
```

#### Xóa gói

Xóa một gói:

```bash
sudo dnf remove package_name
sudo yum remove package_name
```

#### Gói nâng cấp

Cập nhật tất cả các gói:

```bash
sudo dnf upgrade
sudo yum update
```

#### Tìm kiếm gói

Tìm kiếm các gói:

```bash
dnf search keyword
yum search keyword
```

Hiển thị thông tin gói:

```bash
dnf info package_name
yum info package_name
```

Liệt kê các gói đã cài đặt:

```bash
dnf list installed
yum list installed
```

### Làm việc với nhóm

DNF/YUM hỗ trợ các nhóm gói cài đặt nhiều gói liên quan:

```bash
# List available groups
dnf group list
yum groups list

# Install a group
sudo dnf group install "Development Tools"
sudo yum groupinstall "Development Tools"
```

### Quản lý kho lưu trữ

Kích hoạt kho lưu trữ:

```bash
sudo dnf config-manager --enable repository
sudo yum-config-manager --enable repository
```

Thêm một kho lưu trữ:

```bash
sudo dnf config-manager --add-repo=https://repo.url/repo.repo
sudo yum-config-manager --add-repo=https://repo.url/repo.repo
```

### Làm việc với tệp RPM

Cài đặt trực tiếp tệp RPM:

```bash
sudo dnf install ./package.rpm
sudo yum install ./package.rpm
```

Hoặc sử dụng lệnh vòng/phút cấp thấp hơn:

```bash
sudo rpm -i package.rpm
```

### Ví dụ DNF thực tế

Hãy cài đặt và kiểm tra máy chủ web Apache:

```bash
# Check for updates
sudo dnf check-update

# Install Apache
sudo dnf install httpd

# Check information about the package
dnf info httpd

# List installed packages related to Apache
dnf list installed | grep httpd

# Start and enable the service
sudo systemctl start httpd
sudo systemctl enable httpd
```

## Trình quản lý gói Pacman (Arch Linux)

Arch Linux và các phiên bản phái sinh của nó sử dụng trình quản lý gói pacman, được biết đến với tính đơn giản và tốc độ.

### Cấu hình

Cấu hình của Pacman là `/etc/pacman.conf` và thông tin kho lưu trữ là `/etc/pacman.d/mirrorlist`.

### Các lệnh Pacman cơ bản

Đồng bộ hóa cơ sở dữ liệu gói:

```bash
sudo pacman -Sy
```

#### Cài đặt gói

Cài đặt một gói:

```bash
sudo pacman -S package_name
```

Cài đặt nhiều gói:

```bash
sudo pacman -S package1 package2 package3
```

#### Xóa gói

Xóa một gói:

```bash
sudo pacman -R package_name
```

Xóa gói và các phần phụ thuộc của nó:

```bash
sudo pacman -Rs package_name
```

Xóa gói, phần phụ thuộc và tệp cấu hình của nó:

```bash
sudo pacman -Rns package_name
```

#### Gói nâng cấp

Cập nhật tất cả các gói:

```bash
sudo pacman -Syu
```

Các cờ `-Syu` kết hợp:

- `-S`: Đồng bộ hóa các gói
- `-y`: Làm mới cơ sở dữ liệu gói
- `-u`: Nâng cấp các gói đã cài đặt

#### Tìm kiếm gói

Tìm kiếm các gói:

```bash
pacman -Ss keyword
```

Hiển thị thông tin gói:

```bash
pacman -Si package_name
```

Liệt kê các gói đã cài đặt:

```bash
pacman -Q
```

Liệt kê các gói đã cài đặt với chi tiết:

```bash
pacman -Qi package_name
```

### Ví dụ về Pacman thực tế

Hãy cài đặt một trình soạn thảo văn bản và kiểm tra thông tin của nó:

```bash
# Update package database
sudo pacman -Sy

# Install neovim
sudo pacman -S neovim

# Check detailed information
pacman -Qi neovim

# List files installed by the package
pacman -Ql neovim | head
```

## Định dạng gói phổ quát

Trình quản lý gói truyền thống có tính phân phối cụ thể. Các định dạng gói phổ quát nhằm mục đích hoạt động trên nhiều bản phân phối.

### Chụp nhanh

Được phát triển bởi Canonical, snaps là các ứng dụng độc lập bao gồm các phần phụ thuộc:

```bash
# Install snapd
sudo apt install snapd  # On Debian/Ubuntu
sudo dnf install snapd  # On Fedora

# List available snaps
snap find keyword

# Install a snap
sudo snap install package_name

# List installed snaps
snap list

# Update all snaps
sudo snap refresh

# Remove a snap
sudo snap remove package_name
```

### Flatpak

Flatpak nhằm mục đích cung cấp cùng một ứng dụng trên các bản phân phối Linux khác nhau:

```bash
# Install Flatpak
sudo apt install flatpak  # On Debian/Ubuntu
sudo dnf install flatpak  # On Fedora

# Add the Flathub repository
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# Install an application
flatpak install flathub org.application.Name

# Run an application
flatpak run org.application.Name

# List installed applications
flatpak list

# Update all applications
flatpak update

# Remove an application
flatpak uninstall org.application.Name
```

### Hình ảnh ứng dụng

AppImage cung cấp các ứng dụng di động không cần cài đặt:

1. Tải xuống tệp .AppImage
2. Làm cho nó có thể thực thi được: `chmod +x application.AppImage`
3. Chạy nó: `./application.AppImage`

## Biên dịch phần mềm từ nguồn

Đôi khi phần mềm không có sẵn thông qua trình quản lý gói và bạn cần biên dịch phần mềm từ nguồn:

### Quá trình biên soạn cơ bản

```bash
# Install compilation tools
sudo apt install build-essential  # On Debian/Ubuntu
sudo dnf groupinstall "Development Tools"  # On Fedora/RHEL/CentOS

# Download and extract source
wget https://example.com/software-1.0.tar.gz
tar -xzf software-1.0.tar.gz
cd software-1.0

# Configure, build, and install
./configure
make
sudo make install
```

### Ví dụ: Biên dịch một chương trình C đơn giản

Hãy tạo một chương trình "Hello World" đơn giản và biên dịch nó:

```bash
# Create a file named hello.c
echo '#include <stdio.h>
int main() {
    printf("Hello, World!\n");
    return 0;
}' > hello.c

# Compile with gcc
gcc -o hello hello.c

# Run the program
./hello
```

Ví dụ cơ bản này không sử dụng quy trình `./configure` và `make` nhưng thể hiện các nguyên tắc biên dịch.

## Quản lý thư viện

Ứng dụng phụ thuộc vào thư viện (mã chia sẻ). Dưới đây là một số lệnh để quản lý chúng:

```bash
# List shared library dependencies of a binary
ldd /bin/ls

# Configure dynamic linker run-time bindings
sudo ldconfig

# Find which package provides a specific file
# On Debian/Ubuntu:
apt-file search filename

# On Fedora/RHEL/CentOS:
dnf provides */filename
```

## Thực tiễn tốt nhất về quản lý gói

### Luôn cập nhật hệ thống của bạn

Thường xuyên cập nhật hệ thống của bạn để nhận các bản vá bảo mật và sửa lỗi:

```bash
# On Debian/Ubuntu
sudo apt update && sudo apt upgrade

# On Fedora/RHEL/CentOS
sudo dnf upgrade

# On Arch Linux
sudo pacman -Syu
```

### Dọn dẹp hệ thống của bạn

Xóa các gói không sử dụng và làm sạch bộ đệm gói:

```bash
# On Debian/Ubuntu
sudo apt autoremove
sudo apt clean

# On Fedora/RHEL/CentOS
sudo dnf autoremove
sudo dnf clean all

# On Arch Linux
sudo pacman -Rns $(pacman -Qtdq)  # Remove orphaned packages
sudo pacman -Sc  # Clean package cache
```

### Tạo danh sách các gói đã cài đặt

Hữu ích cho việc sao chép thiết lập của bạn trên hệ thống khác:

```bash
# On Debian/Ubuntu
dpkg --get-selections > installed_packages.txt

# On Fedora/RHEL/CentOS
dnf list installed > installed_packages.txt

# On Arch Linux
pacman -Q > installed_packages.txt
```

### Sử dụng ghim phiên bản để ổn định

Ghim các phiên bản gói khi bạn cần sự ổn định:

```bash
# On Debian/Ubuntu
echo "package_name hold" | sudo dpkg --set-selections

# On Fedora/RHEL/CentOS
sudo dnf install package_name-specific_version
sudo dnf versionlock add package_name
```

## Khắc phục sự cố quản lý gói

### Xử lý các gói bị hỏng (Debian/Ubuntu)

Sửa các gói bị hỏng:

```bash
sudo apt --fix-broken install
```

Buộc cấu hình lại gói:

```bash
sudo dpkg-reconfigure package_name
```

### Khắc phục sự cố về kho lưu trữ

Nếu bạn gặp lỗi khóa GPG:

```bash
# On Debian/Ubuntu
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys KEY_ID

# On Fedora/RHEL/CentOS
sudo rpm --import https://repo.url/key.asc
```

### Xử lý xung đột gói

Nếu các gói xung đột:

```bash
# See what would happen without actually installing
apt --simulate install package_name

# Force a specific version
apt install package=version
```

## Thiết lập kho lưu trữ cục bộ

Đối với các môi trường có nhiều hệ thống Linux, việc thiết lập kho lưu trữ cục bộ có thể tiết kiệm băng thông và mang lại khả năng kiểm soát tốt hơn.

### Sử dụng apt-mirror (Debian/Ubuntu)

```bash
# Install apt-mirror
sudo apt install apt-mirror

# Configure in /etc/apt/mirror.list
# Run the mirror process
sudo apt-mirror
```

### Sử dụng createrepo (Fedora/RHEL/CentOS)

```bash
# Install createrepo
sudo dnf install createrepo

# Create the repository structure
sudo mkdir -p /var/www/html/local_repo
sudo cp *.rpm /var/www/html/local_repo/

# Create the repository metadata
sudo createrepo /var/www/html/local_repo
```

## Làm việc với cơ sở hạ tầng đám mây

Khi làm việc với máy chủ đám mây, bạn sẽ thường sử dụng tính năng quản lý gói để thiết lập và bảo trì hệ thống của mình. Nhiều nhà cung cấp đám mây cung cấp image với các gói cài đặt sẵn nhưng bạn sẽ cần cập nhật và cài đặt phần mềm bổ sung.

### Ví dụ về DigitalOcean

DigitalOcean giúp dễ dàng tạo một máy chủ Linux với nhiều bản phân phối khác nhau. Đây là một cách nhanh chóng để bắt đầu:

1. Đăng ký tài khoản DigitalOcean (sử dụng [liên kết này](https://m.do.co/c/2a9bba940f39) để nhận tín dụng $200 trong 60 ngày)
2. Tạo một Droplet (máy chủ ảo) với bản phân phối Linux ưa thích của bạn
3. Kết nối qua SSH và cập nhật hệ thống của bạn:

```bash
# On Ubuntu
sudo apt update && sudo apt upgrade

# On Fedora
sudo dnf upgrade
```

4. Cài đặt các gói cần thiết của bạn:

```bash
# Install a LAMP stack on Ubuntu
sudo apt install apache2 mysql-server php libapache2-mod-php

# Or on Fedora
sudo dnf install httpd mariadb-server php
```

Lợi ích của việc sử dụng cơ sở hạ tầng đám mây là bạn có thể nhanh chóng tạo, sửa đổi và hủy các máy chủ khi cần, sử dụng tính năng quản lý gói để đảm bảo chúng có phần mềm bạn yêu cầu.

## Tiến về phía trước

Bây giờ bạn đã hiểu cách quản lý phần mềm trên các bản phân phối Linux khác nhau. Kiến thức này rất cần thiết để bảo trì hệ thống Linux và cài đặt phần mềm bạn cần.

Trong phần tiếp theo, chúng ta sẽ khám phá cách quản lý người dùng và nhóm, tìm hiểu cách tạo và quản lý tài khoản người dùng, đặt quyền và hiểu các tệp cấu hình liên quan đến người dùng.

Quản lý gói là một kỹ năng cơ bản của Linux giúp nó khác biệt với các hệ điều hành khác. Bằng cách tìm hiểu những công cụ này, bạn đã có được khả năng cài đặt, cập nhật và bảo trì phần mềm một cách hiệu quả trên các bản phân phối Linux khác nhau.
