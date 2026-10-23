---
title: "Biến và các thực hành tốt"
description: Sử dụng các biến Packer và cấu trúc dự án cho production. Bao gồm các loại biến, mặc định, tệp var, ghi đè thời gian chạy, bố cục thư mục và kiểm tra image.
order: 6
---

**TLDR**: Các biến tạo mẫu có thể tái sử dụng. Xác định chúng bằng các loại và giá trị mặc định, ghi đè chúng khi chạy hoặc bằng các tệp biến. Cấu trúc các dự án với các thư mục rõ ràng, sử dụng kiểm soát phiên bản và triển khai thử nghiệm thích hợp trước khi triển khai image.

Các biến cho phép bạn viết mẫu một lần và sử dụng chúng trong nhiều ngữ cảnh - các vùng, môi trường, phiên bản hoặc nhà cung cấp đám mây khác nhau.

## Xác định biến

```hcl
variable "region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region to build in"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "app_version" {
  type = string
  # No default - must be provided
}

variable "enable_monitoring" {
  type    = bool
  default = true
}

variable "tags" {
  type = map(string)
  default = {
    Environment = "production"
    ManagedBy   = "packer"
  }
}
```

## Sử dụng biến

Các biến tham chiếu với `var.name`:

```hcl
source "amazon-ebs" "app" {
  region        = var.region
  instance_type = var.instance_type
  ami_name      = "myapp-${var.app_version}-{{timestamp}}"
  
  tags = var.tags
}

provisioner "shell" {
  environment_vars = [
    "APP_VERSION=${var.app_version}",
    "MONITORING=${var.enable_monitoring}"
  ]
  script = "scripts/install.sh"
}
```

## Cung cấp các giá trị biến

**Dòng lệnh**:
```bash
packer build -var="region=us-west-2" -var="app_version=1.2.3" template.pkr.hcl
```

**EBiến môi trường**:
```bash
export PKR_VAR_region="us-west-2"
export PKR_VAR_app_version="1.2.3"
packer build template.pkr.hcl
```

**Các tệp biến** (`production.pkrvars.hcl`):
```hcl
region       = "us-east-1"
app_version  = "2.0.0"
instance_type = "t3.small"

tags = {
  Environment = "production"
  Project     = "myapp"
  CostCenter  = "engineering"
}
```

Sử dụng với:
```bash
packer build -var-file="production.pkrvars.hcl" template.pkr.hcl
```

## Biến nhạy cảm

Đánh dấu các biến là nhạy cảm để ẩn chúng khỏi đầu ra:

```hcl
variable "api_token" {
  type      = string
  sensitive = true
}
```

Các giá trị bị ẩn trong đầu ra Packer:
```
==> amazon-ebs.app: Setting API token to <sensitive>
```

## Xác thực biến

Thêm quy tắc xác thực:

```hcl
variable "region" {
  type = string
  validation {
    condition     = contains(["us-east-1", "us-west-2", "eu-west-1"], var.region)
    error_message = "Region must be us-east-1, us-west-2, or eu-west-1."
  }
}

variable "app_version" {
  type = string
  validation {
    condition     = can(regex("^[0-9]+\\.[0-9]+\\.[0-9]+$", var.app_version))
    error_message = "Version must be in semantic versioning format (e.g., 1.2.3)."
  }
}
```

## Biến cục bộ

Tính giá trị từ các biến khác:

```hcl
locals {
  timestamp = formatdate("YYYY-MM-DD-hhmm", timestamp())
  ami_name  = "${var.app_name}-${var.app_version}-${local.timestamp}"
  
  common_tags = merge(
    var.tags,
    {
      BuildDate = local.timestamp
      GitCommit = var.git_commit
    }
  )
}

source "amazon-ebs" "app" {
  ami_name = local.ami_name
  tags     = local.common_tags
}
```

## Cấu trúc dự án

Tổ chức các dự án Packer để bảo trì:

```
packer-templates/
├── builds/
│   ├── web-server/
│   │   ├── template.pkr.hcl
│   │   ├── variables.pkr.hcl
│   │   ├── production.pkrvars.hcl
│   │   ├── staging.pkrvars.hcl
│   │   └── README.md
│   └── database/
│       ├── template.pkr.hcl
│       └── variables.pkr.hcl
├── scripts/
│   ├── install-nginx.sh
│   ├── configure-monitoring.sh
│   └── cleanup.sh
├── files/
│   ├── nginx.conf
│   ├── app.service
│   └── motd
├── ansible/
│   ├── playbook.yml
│   └── roles/
├── Makefile
└── README.md
```

## Makefile cho các tác vụ thông thường

```makefile
.PHONY: init validate fmt build-staging build-prod

init:
	packer init builds/

validate:
	packer validate builds/

fmt:
	packer fmt -recursive .

build-staging:
	packer build \
	  -var-file="builds/web-server/staging.pkrvars.hcl" \
	  builds/web-server/

build-prod:
	packer build \
	  -var-file="builds/web-server/production.pkrvars.hcl" \
	  builds/web-server/

test:
	packer build -only="docker.*" builds/web-server/
```

## Kiểm soát phiên bản

`.gitignore`:
```
# Packer cache
packer_cache/
*.box
*.ova
*.tar.gz

# Build artifacts
manifest.json
output-*/

# Credentials
*.pem
*.key
credentials.json
*.pkrvars.hcl
!example.pkrvars.hcl

# Terraform
.terraform/
*.tfstate
*.tfstate.backup
```

## Đang thử nghiệm image

### Xác thực trước khi xây dựng

```bash
# Validate syntax
packer validate template.pkr.hcl

# Format check
packer fmt -check template.pkr.hcl
```

### Xây dựng thử nghiệm với Docker

Kiểm tra việc cung cấp cục bộ trước khi xây dựng đám mây:

```hcl
source "docker" "test" {
  image  = "ubuntu:22.04"
  commit = true
}

source "amazon-ebs" "prod" {
  # ... AWS configuration
}

build {
  sources = [
    "source.docker.test",
    "source.amazon-ebs.prod"
  ]
  
  # Same provisioners for both
  provisioner "shell" {
    script = "install.sh"
  }
}
```

Chỉ kiểm tra với Docker:
```bash
packer build -only="docker.test" template.pkr.hcl
```

### Kiểm tra sau xây dựng

Khởi chạy một phiên bản và chạy thử nghiệm:

```bash
#!/bin/bash
# test-image.sh

AMI_ID=$(jq -r '.builds[0].artifact_id' manifest.json | cut -d: -f2)

# Launch instance
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t3.micro \
  --query 'Instances[0].InstanceId' \
  --output text)

# Wait for instance
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Get IP
IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

# Run tests
curl -f http://$IP/ || exit 1
ssh ubuntu@$IP 'systemctl is-active nginx' || exit 1

# Cleanup
aws ec2 terminate-instances --instance-ids $INSTANCE_ID

echo "Tests passed!"
```

## Tích hợp CI/CD

### Hành động GitHub

```yaml
name: Build AMI

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Packer
        uses: hashicorp/setup-packer@main
      
      - name: Initialize Packer
        run: packer init builds/
      
      - name: Validate templates
        run: packer validate builds/
      
      - name: Build AMI
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          packer build \
            -var="app_version=${GITHUB_REF#refs/tags/v}" \
            -var-file="production.pkrvars.hcl" \
            builds/web-server/
      
      - name: Upload manifest
        uses: actions/upload-artifact@v3
        with:
          name: manifest
          path: manifest.json
```

### CI GitLab

```yaml
variables:
  PACKER_VERSION: "1.10.0"

stages:
  - validate
  - build

validate:
  stage: validate
  image: hashicorp/packer:${PACKER_VERSION}
  script:
    - packer init builds/
    - packer validate builds/
    - packer fmt -check -recursive .

build-ami:
  stage: build
  image: hashicorp/packer:${PACKER_VERSION}
  only:
    - tags
  script:
    - packer build -var="app_version=$CI_COMMIT_TAG" builds/
  artifacts:
    paths:
      - manifest.json
```

## Thực tiễn tốt nhất về bảo mật

**Không bao giờ có thông tin xác thực commit**: Sử dụng các biến môi trường hoặc quản lý bí mật.

**Sử dụng vai trò IAM**: Đối với các bản dựng AWS, hãy sử dụng cấu hình phiên bản IAM thay vì khóa truy cập khi có thể.

**Emã hóa hình ảnh**: Kích hoạt mã hóa cho AMI và đĩa image:
```hcl
source "amazon-ebs" "encrypted" {
  encrypt_boot = true
  kms_key_id   = var.kms_key_id
}
```

**Quét hình ảnh**: Chạy trình quét bảo mật trên image được tích hợp sẵn trước khi triển khai.

**Quyền tối thiểu**: Phiên bản xây dựng chỉ cần các quyền mà chúng thực sự sử dụng.

**Phiên bản xây dựng an toàn**: Sử dụng mạng con riêng tư và nhóm bảo mật hạn chế quyền truy cập.

## Tối ưu hóa hiệu suất

**Sử dụng các loại phiên bản nhanh hơn**: Thời gian xây dựng là tiền bạc. Sử dụng các phiên bản lớn hơn để xây dựng nhanh hơn.

**Parallelize build**: Xây dựng đồng thời nhiều nền tảng (mặc định).

**Cache phụ thuộc**: Tải xuống các tệp lớn một lần, sử dụng lại trên các bản dựng.

**Dọn dẹp hiệu quả**: Sử dụng `find` với `-delete` thay vì `rm -rf` cho các thư mục lớn.

## Tiếp theo là gì

Bây giờ bạn đã biết cách tạo production-sẵn sàng Packer các mẫu có các biến, thử nghiệm và tích hợp CI/CD. Sử dụng các mẫu này để xây dựng cơ sở hạ tầng có phiên bản, đáng tin cậy image triển khai nhất quán trên các môi trường của bạn.
