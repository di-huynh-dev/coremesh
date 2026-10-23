---
title: "Tìm hiểu các nguyên tắc cơ bản của Packer"
description: Cách Packer chế tạo máy image. Bao gồm builder, provisioner, bộ xử lý hậu kỳ, quy trình làm việc mà Packer tự động hóa và lý do các mẫu tạo ra image có thể lặp lại.
order: 1
---

**TLDR**: Packer sử dụng các mẫu để tự động hóa máy xây dựng image. Bạn xác định nguồn image, chỉ định cách tùy chỉnh nó bằng provisioner và Packer tạo ra image được định cấu hình cho một hoặc nhiều nền tảng. Nó giống như một hệ thống xây dựng cơ sở hạ tầng.

Trước khi viết các mẫu Packer, bạn cần hiểu Packer nghĩ như thế nào về image và quy trình làm việc mà nó sử dụng để xây dựng chúng.

## Quy trình xây dựng image

Khi bạn xây dựng image theo cách thủ công, bạn thường:

1. Khởi chạy phiên bản cơ sở (Ubuntu, CentOS, v.v.)
2. Kết nối với nó và cài đặt phần mềm
3. Định cấu hình dịch vụ và sao chép tập tin
4. Dọn dẹp các tập tin và lịch sử tạm thời
5. Tắt và tạo ảnh chụp nhanh image
6. Kiểm tra image bằng cách khởi chạy phiên bản mới

Packer tự động hóa quy trình làm việc chính xác này. Mẫu xác định những gì cần xây dựng, builder khởi chạy một phiên bản tạm thời, provisioner tùy chỉnh nó và bộ xử lý hậu xử lý artifact cuối cùng.

Điểm khác biệt chính: Packer thực hiện điều này một cách lặp lại và nhất quán. Chạy cùng một mẫu hai lần, nhận được image giống hệt nhau.

## Thành phần cốt lõi

### Builder

builder chịu trách nhiệm tạo máy và tạo image từ chúng. Mỗi builder dành riêng cho một nền tảng:

- `amazon-ebs`: Tạo AMI cho AWS EC2
- `docker`: Tạo Docker image
- `googlecompute`: Tạo image cho Google Cloud
- `azure-arm`: Tạo image cho Azure
- `virtualbox-iso`: Tạo máy VirtualBox từ ISO
- `vmware-iso`: Tạo VMware image từ ISO

builder biết cách:
- Xác thực với nền tảng
- Khởi chạy một phiên bản xây dựng tạm thời
- Kết nối với phiên bản đó (SSH hoặc WinRM)
- Tạo image từ phiên bản
- Dọn dẹp tài nguyên tạm thời

Bạn có thể sử dụng nhiều builder trong một mẫu để tạo cùng một image cho các nền tảng khác nhau.

### Provisioner

provisioner tùy chỉnh image sau khi builder tạo phiên bản cơ sở. provisioner phổ biến bao gồm:

**Shell**: Chạy lệnh hoặc tập lệnh shell
```hcl
provisioner "shell" {
  inline = [
    "sudo apt-get update",
    "sudo apt-get install -y nginx",
    "sudo systemctl enable nginx"
  ]
}
```

**File**: Sao chép tệp từ máy của bạn sang image
```hcl
provisioner "file" {
  source      = "configs/nginx.conf"
  destination = "/tmp/nginx.conf"
}
```

**ansible**: Chạy Ansible playbook
```hcl
provisioner "ansible" {
  playbook_file = "./playbook.yml"
}
```

provisioner chạy theo thứ tự. Bạn thường:
1. Cập nhật danh sách gói
2. Cài đặt phần mềm
3. Sao chép tập tin cấu hình
4. Định cấu hình dịch vụ
5. Dọn dẹp bộ đệm và nhật ký gói

### Bộ xử lý sau

Bộ xử lý hậu kỳ chạy sau khi image được tạo. Họ có thể:
- Nén image
- Tải lên kho artifact
- Gắn thẻ image
- Tạo bảng kê khai với siêu dữ liệu bản dựng
- Đẩy Docker image vào cơ quan đăng ký

```hcl
post-processor "docker-tag" {
  repository = "mycompany/webapp"
  tags       = ["1.0.0", "latest"]
}
```

Bộ xử lý hậu kỳ là tùy chọn nhưng hữu ích để tích hợp Packer vào pipeline triển khai của bạn.

## Cấu trúc mẫu HCL2

Các mẫu Packer hiện đại sử dụng HCL2 (Ngôn ngữ cấu hình HashiCorp), cùng ngôn ngữ với Terraform:

```hcl
# Variables for reusability
variable "region" {
  type    = string
  default = "us-east-1"
}

# Data sources for dynamic values
data "amazon-ami" "ubuntu" {
  filters = {
    name = "ubuntu/images/hvm-ssd/ubuntu-22.04-*"
  }
  most_recent = true
  owners      = ["099720109477"]
}

# Source defines reusable builder configuration
source "amazon-ebs" "web" {
  ami_name      = "web-server-{{timestamp}}"
  instance_type = "t3.micro"
  region        = var.region
  source_ami    = data.amazon-ami.ubuntu.id

  ssh_username = "ubuntu"
}

# Build brings it all together
build {
  sources = ["source.amazon-ebs.web"]

  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y nginx"
    ]
  }

  post-processor "manifest" {
    output = "manifest.json"
  }
}
```

Mẫu này:
1. Tìm AMI Ubuntu 22.04 mới nhất
2. Khởi chạy phiên bản t3.micro trong us-east-1
3. Cài đặt Nginx
4. Tạo AMI từ phiên bản
5. Lưu siêu dữ liệu bản dựng vào tệp kê khai.json

## Quá trình xây dựng

Khi bạn chạy `packer build template.pkr.hcl`, Packer:

1. **Validates** cú pháp và cấu hình mẫu
2. **Prepares** builder (ví dụ: tìm nguồn AMI)
3. **Launches** phiên bản xây dựng tạm thời
4. **Waits** để có thể truy cập các phiên bản (SSH/WinRM)
5. **Runs** provisioner theo thứ tự
6. Phiên bản **Stops**
7. **Tạo** image từ các phiên bản đã dừng
8. Bộ xử lý hậu **Runs**
9. **Terminates** phiên bản tạm thời
10. **Đầu ra** image ID và artifact

Nếu có lỗi, Packer sẽ tự động dọn sạch các tài nguyên tạm thời.

## Packer so với Docker

Packer có thể xây dựng Docker image, nhưng nó không thể thay thế cho Dockerfiles:

**Dockerfile**: Được xây dựng có mục đích cho container. Nhanh chóng, phân lớp, tối ưu hóa cho các ứng dụng được đóng gói.

**Packer với trình tạo Docker**: Hữu ích khi bạn cần logic cung cấp giống nhau cho cả máy ảo và container. Cũng hữu ích cho các bản dựng nhiều giai đoạn phức tạp hoặc tích hợp với quản lý cấu hình hiện có.

Hầu hết các nhóm sử dụng Dockerfiles cho container và Packer cho VM/cloud image.

## Khi nào nên sử dụng Packer

Packer có ý nghĩa khi:

**Bạn cần khởi chạy phiên bản nhanh**: image được cấu hình sẵn khởi động trong vài giây so với vài phút cấu hình.

**Bạn triển khai trên nhiều đám mây**: Một mẫu xây dựng AWS AMI, GCP image và Azure image.

**Bạn muốn cơ sở hạ tầng bất biến**: Thay vì cập nhật các máy chủ đang chạy, hãy triển khai image mới.

**Bạn có quy trình xây dựng phức tạp**: Cài đặt nhiều ngôn ngữ, biên dịch phần mềm hoặc chạy thử nghiệm mở rộng.

**Tuân thủ yêu cầu các bản kiểm tra**: Các mẫu Packer trong tài liệu kiểm soát phiên bản chính xác có những gì trong mỗi image.

Packer có thể quá mức cần thiết nếu bạn chỉ triển khai container hoặc cơ sở hạ tầng của bạn thay đổi thường xuyên (quản lý cấu hình có thể tốt hơn).

## Tiếp theo là gì

Bây giờ bạn đã hiểu kiến trúc và quy trình làm việc của Packer, chương tiếp theo sẽ đề cập đến việc cài đặt Packer và thiết lập môi trường để xây dựng image đầu tiên của bạn.
