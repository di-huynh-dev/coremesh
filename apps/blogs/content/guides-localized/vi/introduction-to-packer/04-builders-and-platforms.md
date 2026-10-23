---
title: "Builder và các nền tảng"
description: Tìm hiểu về các Packer builder khác nhau và cách tạo image cho nhiều nền tảng
order: 4
---

**TLDR**: Packer hỗ trợ hơn 30 builder cho các nền tảng khác nhau. Những cái phổ biến là AWS EBS, Docker, Google Computing, Azure và VirtualBox. Bạn có thể sử dụng nhiều builder trong một mẫu để tạo cùng một image cho các nền tảng khác nhau.

builder là plugin biết cách tạo máy image cho các nền tảng cụ thể. Mỗi builder xử lý các chi tiết dành riêng cho nền tảng về việc khởi chạy các phiên bản, kết nối với chúng và tạo image.

## Amazon EBS builder

`amazon-ebs` builder tạo AMI được hỗ trợ bởi EBS:

```hcl
source "amazon-ebs" "example" {
  ami_name      = "my-app-{{timestamp}}"
  instance_type = "t3.micro"
  region        = "us-east-1"
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/*ubuntu-jammy-22.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"]
  }
  ssh_username = "ubuntu"
  
  # Optional: use specific VPC/subnet
  vpc_id    = "vpc-12345678"
  subnet_id = "subnet-87654321"
  
  # Optional: enable EBS encryption
  encrypt_boot = true
  kms_key_id   = "arn:aws:kms:us-east-1:123456789:key/abc-123"
}
```

**Tùy chọn chính**:
- `source_ami` hoặc `source_ami_filter`: AMI cơ sở để bắt đầu từ
- `instance_type`: Loại phiên bản EC2 dành cho tòa nhà
- `ssh_username`: Người dùng kết nối SSH (ubuntu, ec2-user, admin)
- `iam_instance_profile`: Vai trò IAM cho phiên bản bản dựng
- `security_group_ids`: Nhóm bảo mật cho phiên bản bản dựng

## Docker builder

`docker` builder tạo Docker image:

```hcl
source "docker" "nginx" {
  image  = "nginx:alpine"
  commit = true
  
  # Optional: export to tar
  export_path = "nginx-custom.tar"
}

build {
  sources = ["source.docker.nginx"]
  
  provisioner "shell" {
    inline = [
      "apk add --no-cache curl jq"
    ]
  }
  
  post-processor "docker-tag" {
    repository = "mycompany/nginx-custom"
    tags       = ["1.0.0", "latest"]
  }
  
  post-processor "docker-push" {
    login          = true
    login_username = var.docker_username
    login_password = var.docker_password
  }
}
```

**Khi nào nên sử dụng Docker builder**:
- Bạn cần các bước xây dựng phức tạp (biên dịch, cung cấp nhiều giai đoạn)
- Bạn muốn chia sẻ logic cung cấp với các bản dựng VM
- Bạn đang tích hợp với các công cụ quản lý cấu hình hiện có

Đối với những trường hợp đơn giản, Dockerfiles thường tốt hơn.

## Google Tính toán builder

`googlecompute` builder tạo GCE image:

```hcl
source "googlecompute" "example" {
  project_id          = "my-project"
  source_image_family = "ubuntu-2204-lts"
  ssh_username        = "packer"
  zone                = "us-central1-a"
  image_name          = "my-app-{{timestamp}}"
  image_family        = "my-app"
  
  # Use preemptible instance for cost savings
  preemptible = true
  
  # Machine type
  machine_type = "n1-standard-1"
}
```

**Authentication**: Sử dụng khóa JSON của tài khoản dịch vụ hoặc Thông tin xác thực mặc định của ứng dụng.

## Azure CÁNH TAY builder

`azure-arm` builder tạo image được quản lý bởi Azure:

```hcl
source "azure-arm" "example" {
  # Authentication
  client_id       = var.azure_client_id
  client_secret   = var.azure_client_secret
  subscription_id = var.azure_subscription_id
  tenant_id       = var.azure_tenant_id
  
  # Image details
  managed_image_name                = "my-app-{{timestamp}}"
  managed_image_resource_group_name = "packer-images"
  
  # Build configuration
  os_type         = "Linux"
  image_publisher = "Canonical"
  image_offer     = "0001-com-ubuntu-server-jammy"
  image_sku       = "22_04-lts"
  
  # VM size
  vm_size = "Standard_B2s"
  
  # Location
  location = "eastus"
}
```

## DigitalOcean builder

`digitalocean` builder tạo ảnh chụp nhanh Droplet:

```hcl
source "digitalocean" "example" {
  api_token    = var.do_api_token
  image        = "ubuntu-22-04-x64"
  region       = "nyc3"
  size         = "s-1vcpu-1gb"
  snapshot_name = "my-app-{{timestamp}}"
  ssh_username = "root"
}
```

## VirtualBox builder

`virtualbox-iso` builder tạo máy VirtualBox từ ISO:

```hcl
source "virtualbox-iso" "example" {
  guest_os_type = "Ubuntu_64"
  iso_url       = "https://releases.ubuntu.com/22.04/ubuntu-22.04-live-server-amd64.iso"
  iso_checksum  = "sha256:84aeaf7823c8c61baa0ae862d0a06b03409394800000b3235854a6b38eb4856f"
  
  ssh_username = "packer"
  ssh_password = "packer"
  ssh_timeout  = "30m"
  
  shutdown_command = "echo 'packer' | sudo -S shutdown -P now"
  
  vboxmanage = [
    ["modifyvm", "{{.Name}}", "--memory", "2048"],
    ["modifyvm", "{{.Name}}", "--cpus", "2"]
  ]
}
```

## Bản dựng đa nền tảng

Xây dựng cùng một image cho nhiều nền tảng:

```hcl
variable "version" {
  type = string
}

source "amazon-ebs" "app" {
  ami_name      = "myapp-${var.version}-{{timestamp}}"
  instance_type = "t3.micro"
  region        = "us-east-1"
  source_ami_filter {
    filters = {
      name = "ubuntu/images/*ubuntu-jammy-22.04-amd64-server-*"
    }
    most_recent = true
    owners      = ["099720109477"]
  }
  ssh_username = "ubuntu"
}

source "googlecompute" "app" {
  project_id          = "my-project"
  source_image_family = "ubuntu-2204-lts"
  zone                = "us-central1-a"
  image_name          = "myapp-${var.version}-{{timestamp}}"
  ssh_username        = "packer"
}

source "digitalocean" "app" {
  api_token     = var.do_api_token
  image         = "ubuntu-22-04-x64"
  region        = "nyc3"
  size          = "s-1vcpu-1gb"
  snapshot_name = "myapp-${var.version}-{{timestamp}}"
  ssh_username  = "root"
}

build {
  # Build all three platforms
  sources = [
    "source.amazon-ebs.app",
    "source.googlecompute.app",
    "source.digitalocean.app"
  ]
  
  # Shared provisioning for all platforms
  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y nginx"
    ]
  }
  
  # Platform-specific provisioning
  provisioner "shell" {
    only   = ["amazon-ebs.app"]
    inline = ["echo 'Running on AWS' > /tmp/platform.txt"]
  }
  
  provisioner "shell" {
    only   = ["googlecompute.app"]
    inline = ["echo 'Running on GCP' > /tmp/platform.txt"]
  }
}
```

Chạy với:
```bash
packer build -var="version=1.0.0" template.pkr.hcl
```

Packer xây dựng song song tất cả các nền tảng theo mặc định.

## Chọn builder cụ thể

Chỉ xây dựng các nền tảng cụ thể:

```bash
# Build only AWS
packer build -only='amazon-ebs.app' template.pkr.hcl

# Build AWS and GCP
packer build -only='amazon-ebs.app,googlecompute.app' template.pkr.hcl
```

## Truyền thông builder

builder cần giao tiếp với các phiên bản:

**SSH (Linux)**:
- Hầu hết builder đều sử dụng SSH
- Packer tạo khóa tạm thời
- Thời gian chờ mặc định: 5 phút

**WinRM (Windows)**:
- Windows AMI sử dụng WinRM
- Định cấu hình trong dữ liệu người dùng hoặc thông qua AMI nguồn

```hcl
source "amazon-ebs" "windows" {
  ami_name      = "windows-{{timestamp}}"
  instance_type = "t3.medium"
  region        = "us-east-1"
  source_ami_filter {
    filters = {
      name = "Windows_Server-2022-English-Full-Base-*"
    }
    most_recent = true
    owners      = ["amazon"]
  }
  communicator = "winrm"
  winrm_username = "Administrator"
  winrm_use_ssl  = true
  user_data_file = "bootstrap-winrm.ps1"
}
```

## Thực tiễn tốt nhất

**Sử dụng trình xây dựng phù hợp**: EBS cho AWS, docker cho container, ISO builder cho kim loại trần.

**Bắt đầu từ hình ảnh chính thức**: Sử dụng nhà cung cấp image (Canonical, AWS, v.v.) làm image cơ sở.

**Test cục bộ trước tiên**: Sử dụng Docker hoặc VirtualBox builder để kiểm tra việc cung cấp trước khi xây dựng đám mây.

**Parallelize build**: Cho phép Packer xây dựng nhiều nền tảng cùng lúc (hành vi mặc định).

**Tag image đúng**: Bao gồm phiên bản, git commit, ngày xây dựng trong siêu dữ liệu image.

**Dọn dẹp các lỗi**: Sử dụng `packer build -force` để thay thế image hiện có trong quá trình phát triển.

## Tiếp theo là gì

Bây giờ bạn đã hiểu builder, chương tiếp theo sẽ trình bày chuyên sâu về provisioner - các công cụ tùy chỉnh image của bạn.
