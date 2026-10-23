---
title: "Cài đặt và thiết lập"
description: Cài đặt Packer trên macOS, Linux và Windows, thiết lập PATH của bạn và định cấu hình thông tin xác thực builder cục bộ hoặc đám mây. Xác minh cài đặt với phiên bản Packer.
order: 2
---

**TLDR**: Tải xuống tệp nhị phân Packer cho hệ điều hành của bạn, thêm nó vào PATH và xác minh bằng `packer version`. Đối với đám mây builder, hãy định cấu hình thông tin xác thực. Đối với builder cục bộ như Docker, hãy cài đặt phần mềm cần thiết.

Packer được phân phối dưới dạng nhị phân đơn. Không có quá trình cài đặt phức tạp, không có sự phụ thuộc để quản lý. Tải xuống, xác minh và bạn đã sẵn sàng xây dựng image.

## Cài đặt Packer

### MacOS

Sử dụng Homebrew (được khuyến nghị):
```bash
brew tap hashicorp/tap
brew install hashicorp/tap/packer
```

Cài đặt thủ công:
```bash
# Download the latest version
wget https://releases.hashicorp.com/packer/1.10.0/packer_1.10.0_darwin_amd64.zip

# Unzip
unzip packer_1.10.0_darwin_amd64.zip

# Move to /usr/local/bin
sudo mv packer /usr/local/bin/

# Verify
packer version
```

### Linux

Sử dụng trình quản lý gói (Ubuntu/Debian):
```bash
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install packer
```

Cài đặt thủ công:
```bash
# Download
wget https://releases.hashicorp.com/packer/1.10.0/packer_1.10.0_linux_amd64.zip

# Unzip
unzip packer_1.10.0_linux_amd64.zip

# Move to PATH
sudo mv packer /usr/local/bin/

# Verify
packer version
```

### Cửa sổ

Sử dụng sô cô la:
```powershell
choco install packer
```

Cài đặt thủ công:
1. Tải xuống gói Windows từ https://www.packer.io/downloads
2. Giải nén vào một thư mục (ví dụ: `C:\packer`)
3. Thêm thư mục đó vào biến môi trường PATH của bạn
4. Mở cửa sổ PowerShell mới và xác minh: `packer version`

### Xác minh cài đặt

Bất kể hệ điều hành của bạn:
```bash
packer version
```

Bạn sẽ thấy đầu ra như:
```
Packer v1.10.0
```

## Thiết lập thông tin xác thực trên đám mây

Để xây dựng image trên nền tảng đám mây, Packer cần có thông tin xác thực.

### AWS

Packer sử dụng chuỗi thông tin xác thực AWS tiêu chuẩn. Thiết lập thông tin đăng nhập bằng cách sử dụng:

**AWS CLI**:
```bash
aws configure
```

Hoặc tạo `~/.aws/credentials`:
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
```

Hoặc sử dụng các biến môi trường:
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
```

Quyền **IAM**: Người dùng AWS của bạn cần có quyền để:
- Khởi chạy phiên bản EC2
- Tạo AMI
- Tạo EBS volume và ảnh chụp nhanh
- Mô tả các trường hợp, AMI và mạng con
- Tạo và đính kèm các nhóm bảo mật

### Đám mây của Google

Tạo một tài khoản dịch vụ và tải xuống khóa JSON:
```bash
# Set the service account key location
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"

# Or specify in your Packer template
source "googlecompute" "example" {
  account_file = "/path/to/key.json"
  project_id   = "your-project-id"
  # ...
}
```

### Azure

Tạo một dịch vụ chính:
```bash
az ad sp create-for-rbac --name packer-sp
```

Đặt biến môi trường:
```bash
export ARM_CLIENT_ID="service-principal-app-id"
export ARM_CLIENT_SECRET="service-principal-password"
export ARM_SUBSCRIPTION_ID="your-subscription-id"
export ARM_TENANT_ID="your-tenant-id"
```

### Đại dương kỹ thuật số

Tạo mã thông báo API trong tài khoản DigitalOcean của bạn, sau đó:
```bash
export DIGITALOCEAN_API_TOKEN="your-api-token"
```

## Thiết lập builder cục bộ

### Docker

Để xây dựng Docker image, hãy cài đặt Docker:

**macOS/Windows**: Tải xuống Docker Desktop từ docker.com

**Linux**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group
sudo usermod -aG docker $USER
```

Xác minh Docker đang chạy:
```bash
docker ps
```

### Hộp ảo

Đối với VirtualBox builder:

**macOS**: `brew install --cask virtualbox`

**Linux**: Tải xuống từ virtualbox.org hoặc sử dụng trình quản lý gói của bạn

**Windows**: Tải xuống từ virtualbox.org

Packer sẽ giao tiếp với VirtualBox thông qua các công cụ CLI của nó.

## Tạo mẫu đầu tiên của bạn

Tạo một thư mục cho các mẫu Packer của bạn:
```bash
mkdir ~/packer-templates
cd ~/packer-templates
```

Tạo một ví dụ Docker đơn giản (`docker-test.pkr.hcl`):
```hcl
packer {
  required_plugins {
    docker = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/docker"
    }
  }
}

source "docker" "ubuntu" {
  image  = "ubuntu:22.04"
  commit = true
}

build {
  sources = ["source.docker.ubuntu"]

  provisioner "shell" {
    inline = [
      "apt-get update",
      "apt-get install -y curl"
    ]
  }

  post-processor "docker-tag" {
    repository = "my-ubuntu"
    tags       = ["latest"]
  }
}
```

Khởi tạo plugin Packer:
```bash
packer init docker-test.pkr.hcl
```

Thao tác này sẽ tải xuống plugin Docker được chỉ định trong mẫu.

## Xác thực mẫu

Trước khi xây dựng, hãy xác thực cú pháp mẫu của bạn:
```bash
packer validate docker-test.pkr.hcl
```

Xác thực thành công trả về:
```
The configuration is valid.
```

Nếu có lỗi, Packer sẽ hiển thị chính xác lỗi ở đâu và lỗi gì.

## Mẫu định dạng

Packer bao gồm một trình định dạng như `terraform fmt`:
```bash
packer fmt docker-test.pkr.hcl
```

Điều này tiêu chuẩn hóa thụt lề, khoảng cách và thứ tự. Chạy nó trước khi đưa mẫu vào kiểm soát phiên bản.

## Thực tiễn tốt nhất về thiết lập môi trường

**Sử dụng kiểm soát phiên bản**: Giữ các mẫu trong Git cùng với mã cơ sở hạ tầng của bạn.

**Thông tin xác thực riêng biệt**: Không bao giờ mã hóa thông tin xác thực cứng trong các mẫu. Sử dụng biến môi trường hoặc tệp thông tin xác thực.

**Use .gitignore**: Loại trừ các tệp nhạy cảm:
```
# .gitignore
*.pem
*.key
credentials.json
*.box
*.ova
manifest.json
packer_cache/
```

Phiên bản plugin **Pin**: Chỉ định phiên bản plugin chính xác trong các mẫu để đảm bảo tính nhất quán:
```hcl
required_plugins {
  amazon = {
    version = "= 1.2.8"
    source  = "github.com/hashicorp/amazon"
  }
}
```

**Sử dụng Makefile hoặc scripts**: Gói các lệnh phổ biến:
```makefile
.PHONY: validate fmt build

validate:
	packer validate .

fmt:
	packer fmt -recursive .

build:
	packer build -force .
```

## Khắc phục sự cố cài đặt

**"Packer: không tìm thấy lệnh"**: Tệp nhị phân không có trong PATH của bạn. Xác minh vị trí và thêm nó vào PATH.

**Quyền bị từ chối**: Trên Linux/macOS, đảm bảo tệp nhị phân có thể thực thi được: `chmod +x /path/to/packer`

**Name xung đột với Packer.io**: Một số bản phân phối Linux có công cụ tên là `packer` để tạo tệp Zip. Mã nhị phân Packer của HashiCorp sẽ được ưu tiên. Kiểm tra: `which packer` và `packer version`.

**Lỗi tải xuống plugin**: Kiểm tra kết nối Internet và tường lửa của bạn. Packer tải xuống plugin từ các bản phát hành GitHub.

## Tiếp theo là gì

Môi trường của bạn đã sẵn sàng. Chương tiếp theo đi sâu vào việc viết mẫu Packer thực sự đầu tiên của bạn để xây dựng máy chủ web image.
