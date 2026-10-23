---
title: "Viết mẫu đầu tiên của bạn"
description: Tạo mẫu Packer hoàn chỉnh để xây dựng máy chủ web AMI
order: 3
---

**TLDR**: Mẫu Packer xác định nguồn (cơ sở image), bản dựng (nội dung cần tạo), provisioner (cách tùy chỉnh) và bộ xử lý hậu kỳ (việc cần làm với kết quả). Chúng tôi sẽ xây dựng AWS AMI có cài đặt Nginx.

Hãy xây dựng một cái gì đó thực tế: một máy chủ web AMI sẵn sàng phục vụ lưu lượng truy cập ngay khi nó khởi chạy.

## Mục tiêu

Chúng tôi sẽ tạo Amazon Machine image (AMI) dựa trên Ubuntu 22.04 với:
- Gói hệ thống được cập nhật
- Máy chủ web Nginx được cài đặt và cấu hình
- Trang index.html tùy chỉnh
- Nginx được thiết lập để khởi động khi khởi động

Sau đó, AMI này có thể khởi chạy các phiên bản EC2 phục vụ ngay lưu lượng truy cập web mà không cần bất kỳ cấu hình bổ sung nào.

## Cấu trúc mẫu

Tạo một tệp có tên `web-server.pkr.hcl`:

```hcl
packer {
  required_version = ">= 1.8.0"
  required_plugins {
    amazon = {
      version = ">= 1.2.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# Variables make the template reusable
variable "region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

# Data source finds the latest Ubuntu AMI
data "amazon-ami" "ubuntu" {
  filters = {
    name                = "ubuntu/images/*ubuntu-jammy-22.04-amd64-server-*"
    root-device-type    = "ebs"
    virtualization-type = "hvm"
  }
  most_recent = true
  owners      = ["099720109477"] # Canonical
  region      = var.region
}

# Source defines the builder configuration
source "amazon-ebs" "nginx" {
  ami_name      = "nginx-web-server-{{timestamp}}"
  instance_type = var.instance_type
  region        = var.region
  source_ami    = data.amazon-ami.ubuntu.id
  ssh_username  = "ubuntu"

  tags = {
    Name        = "nginx-web-server"
    Environment = "production"
    CreatedBy   = "packer"
  }
}

# Build executes the image creation
build {
  sources = ["source.amazon-ebs.nginx"]

  # Update package lists
  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get upgrade -y"
    ]
  }

  # Install Nginx
  provisioner "shell" {
    inline = [
      "sudo apt-get install -y nginx",
      "sudo systemctl enable nginx"
    ]
  }

  # Copy custom configuration
  provisioner "file" {
    source      = "files/index.html"
    destination = "/tmp/index.html"
  }

  # Move file to final location
  provisioner "shell" {
    inline = [
      "sudo mv /tmp/index.html /var/www/html/index.html",
      "sudo chown www-data:www-data /var/www/html/index.html"
    ]
  }

  # Clean up
  provisioner "shell" {
    inline = [
      "sudo apt-get clean",
      "sudo rm -rf /tmp/*",
      "sudo rm -rf /var/tmp/*"
    ]
  }

  # Save build metadata
  post-processor "manifest" {
    output = "manifest.json"
    strip_path = true
  }
}
```

## Hiểu từng phần

### Khối Packer

```hcl
packer {
  required_version = ">= 1.8.0"
  required_plugins {
    amazon = {
      version = ">= 1.2.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}
```

Điều này chỉ định:
- Yêu cầu phiên bản Packer tối thiểu
- Các plugin cần thiết và phiên bản của chúng
- Tải xuống plugin từ đâu

Packer sẽ tự động tải xuống plugin khi bạn chạy `packer init`.

### Biến

```hcl
variable "region" {
  type    = string
  default = "us-east-1"
}
```

Các biến làm cho mẫu có thể tái sử dụng được. Bạn có thể ghi đè mặc định:
```bash
packer build -var="region=us-west-2" web-server.pkr.hcl
```

### Nguồn dữ liệu

```hcl
data "amazon-ami" "ubuntu" {
  filters = {
    name = "ubuntu/images/*ubuntu-jammy-22.04-amd64-server-*"
  }
  most_recent = true
  owners      = ["099720109477"]
}
```

Nguồn dữ liệu tìm nạp thông tin tại thời điểm xây dựng. Điều này tìm thấy Ubuntu 22.04 AMI mới nhất để image cơ sở của bạn luôn cập nhật. Không có ID AMI được mã hóa cứng nào trở nên lỗi thời.

### Khối nguồn

```hcl
source "amazon-ebs" "nginx" {
  ami_name      = "nginx-web-server-{{timestamp}}"
  instance_type = "t3.micro"
  region        = var.region
  source_ami    = data.amazon-ami.ubuntu.id
  ssh_username  = "ubuntu"
}
```

Nguồn xác định cấu hình builder có thể tái sử dụng:
- `ami_name`: Tên của AMI kết quả (dấu thời gian đảm bảo tính duy nhất)
- `instance_type`: Loại phiên bản sử dụng để xây dựng
- `source_ami`: AMI cơ sở để bắt đầu từ
- `ssh_username`: Cách Packer kết nối với phiên bản

### Khối xây dựng

```hcl
build {
  sources = ["source.amazon-ebs.nginx"]
  # provisioners...
}
```

Việc xây dựng liên kết mọi thứ lại với nhau. Nó tham chiếu các nguồn và định nghĩa provisioner.

### Provisioner

provisioner chạy theo thứ tự:

1. **Cập nhật hệ thống**:
```hcl
provisioner "shell" {
  inline = [
    "sudo apt-get update",
    "sudo apt-get upgrade -y"
  ]
}
```

2. **Cài đặt phần mềm**:
```hcl
provisioner "shell" {
  inline = [
    "sudo apt-get install -y nginx",
    "sudo systemctl enable nginx"
  ]
}
```

3. **Sao chép tập tin**:
```hcl
provisioner "file" {
  source      = "files/index.html"
  destination = "/tmp/index.html"
}
```

4. **Configure**:
```hcl
provisioner "shell" {
  inline = [
    "sudo mv /tmp/index.html /var/www/html/index.html"
  ]
}
```

## Tạo tập tin hỗ trợ

Tạo trang chỉ mục tùy chỉnh:

```bash
mkdir -p files
```

`files/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Packer-Built Server</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>Hello from Packer!</h1>
    <p>This server was built automatically using Packer</p>
</body>
</html>
```

## Xây dựng image

Khởi tạo plugin:
```bash
packer init web-server.pkr.hcl
```

Xác thực mẫu:
```bash
packer validate web-server.pkr.hcl
```

Định dạng mẫu:
```bash
packer fmt web-server.pkr.hcl
```

Xây dựng image:
```bash
packer build web-server.pkr.hcl
```

Packer sẽ:
1. Tìm Ubuntu AMI mới nhất
2. Khởi chạy phiên bản t3.micro
3. Đợi nó sẵn sàng
4. Chạy tất cả provisioner
5. Dừng phiên bản
6. Tạo AMI
7. Gắn thẻ AMI
8. Chấm dứt phiên bản tạm thời
9. Xuất ID AMI mới

## Xây dựng đầu ra

Bạn sẽ thấy đầu ra như:
```
amazon-ebs.nginx: output will be in this color.

==> amazon-ebs.nginx: Prevalidating any provided VPC information
==> amazon-ebs.nginx: Prevalidating AMI Name: nginx-web-server-1702334567
==> amazon-ebs.nginx: Found Image ID: ami-0c7217cdde317cfec
==> amazon-ebs.nginx: Creating temporary keypair: packer_657a2f87
==> amazon-ebs.nginx: Creating temporary security group for this instance: packer_657a2f88
==> amazon-ebs.nginx: Launching a source AWS instance...
==> amazon-ebs.nginx: Waiting for instance to become ready...
==> amazon-ebs.nginx: Using SSH communicator to connect: 3.80.45.123
==> amazon-ebs.nginx: Waiting for SSH to become available...
==> amazon-ebs.nginx: Connected to SSH!
==> amazon-ebs.nginx: Provisioning with shell script: /tmp/packer-shell123456789
==> amazon-ebs.nginx: Stopping the source instance...
==> amazon-ebs.nginx: Waiting for the instance to stop...
==> amazon-ebs.nginx: Creating AMI nginx-web-server-1702334567 from instance i-0abc123def456
==> amazon-ebs.nginx: Waiting for AMI to become ready...
==> amazon-ebs.nginx: Terminating the source AWS instance...
==> amazon-ebs.nginx: Deleting temporary security group...
==> amazon-ebs.nginx: Deleting temporary keypair...
Build 'amazon-ebs.nginx' finished after 8 minutes 32 seconds.

==> Wait completed after 8 minutes 32 seconds

==> Builds finished. The artifacts of successful builds are:
--> amazon-ebs.nginx: AMIs were created:
us-east-1: ami-0abcdef123456789
```

ID AMI ở cuối là image mới của bạn.

## Đang thử nghiệm image

Khởi chạy một phiên bản từ AMI mới của bạn:
```bash
aws ec2 run-instances \
  --image-id ami-0abcdef123456789 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-groups your-security-group
```

Sau khi chạy, hãy truy cập IP công khai của phiên bản. Bạn sẽ thấy dòng chữ "Xin chào từ Packer!" tùy chỉnh của mình. trang ngay lập tức - không cần cấu hình.

## Các vấn đề chung

**Build hết thời gian chờ SSH**: Nhóm bảo mật phải cho phép SSH (cổng 22) từ IP của Packer.

Tên **AMI đã tồn tại**: Tên AMI phải là duy nhất. Mẫu `{{timestamp}}` hàm giúp đảm bảo điều này.

**Provisioner không thành công**: Kiểm tra đầu ra provisioner một cách cẩn thận. shell provisioner không thành công nếu bất kỳ lệnh nào thoát ra với trạng thái khác 0.

**Quyền bị từ chối**: Thông tin xác thực AWS cần có quyền IAM thích hợp cho các hoạt động EC2 và AMI.

## Tiếp theo là gì

Bạn đã xây dựng được AMI đầu tiên của mình! Chương tiếp theo khám phá các builder khác nhau và cách tạo image cho nhiều nền tảng từ cùng một mẫu.
