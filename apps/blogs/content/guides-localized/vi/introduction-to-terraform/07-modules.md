---
title: "Tổ chức mã với các mô-đun Terraform"
description: Tìm hiểu cách tạo các thành phần cơ sở hạ tầng có thể tái sử dụng bằng các mô-đun và sử dụng các mô-đun cộng đồng
order: 7
---

**TLDR**: Các mô-đun là cấu hình Terraform có thể tái sử dụng. Đặt các tài nguyên liên quan vào một thư mục có các biến và kết quả đầu ra, sau đó gọi mô-đun đó nhiều lần với các đầu vào khác nhau. Sử dụng các mô-đun để tránh lặp lại, thực thi các tiêu chuẩn và chia sẻ mô hình cơ sở hạ tầng giữa các nhóm.

Khi cấu hình Terraform của bạn phát triển, các mô-đun sẽ giúp sắp xếp mã thành các thành phần có thể tái sử dụng. Thay vì sao chép các định nghĩa về cơ sở hạ tầng, hãy đóng gói chúng dưới dạng mô-đun và sử dụng chúng khi cần thiết.

## Mô-đun là gì?

Mỗi cấu hình Terraform là một mô-đun. Các tệp trong thư mục làm việc của bạn tạo thành "mô-đun gốc". Khi bạn tạo các thư mục con có cấu hình riêng, chúng sẽ trở thành "mô-đun con" mà mô-đun gốc có thể gọi.

Một mô-đun chỉ là một thư mục chứa:

- Định nghĩa tài nguyên (tệp `.tf`)
- Khai báo biến (đầu vào)
- Khai báo đầu ra (giá trị trả về)
- Tùy chọn: tài liệu, ví dụ, bài kiểm tra

```
project/
├── main.tf              # Root module
├── variables.tf
├── outputs.tf
└── modules/             # Child modules
    ├── vpc/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── web_server/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

## Tạo mô-đun đầu tiên của bạn

Hãy tạo một mô-đun cho máy chủ web có nhóm bảo mật.

Tạo `modules/web_server/main.tf`:

```hcl
# modules/web_server/main.tf
resource "aws_security_group" "web" {
  name        = "${var.name}-sg"
  description = "Security group for ${var.name}"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from anywhere"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from anywhere"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-sg"
    }
  )
}

resource "aws_instance" "web" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [aws_security_group.web.id]

  user_data = var.user_data

  root_block_device {
    volume_size = var.disk_size
  }

  tags = merge(
    var.tags,
    {
      Name = var.name
    }
  )
}
```

Xác định đầu vào trong `modules/web_server/variables.tf`:

```hcl
# modules/web_server/variables.tf
variable "name" {
  description = "Name for the web server"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where resources will be created"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for the instance"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for the instance"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "disk_size" {
  description = "Root disk size in GB"
  type        = number
  default     = 20
}

variable "user_data" {
  description = "User data script"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
```

Xác định đầu ra trong `modules/web_server/outputs.tf`:

```hcl
# modules/web_server/outputs.tf
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.web.id
}

output "instance_public_ip" {
  description = "Public IP address"
  value       = aws_instance.web.public_ip
}

output "instance_private_ip" {
  description = "Private IP address"
  value       = aws_instance.web.private_ip
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.web.id
}
```

## Sử dụng mô-đun

Bây giờ hãy sử dụng mô-đun này trong cấu hình gốc của bạn:

```hcl
# main.tf
module "web_server" {
  source = "./modules/web_server"

  name          = "production-web"
  vpc_id        = aws_vpc.main.id
  subnet_id     = aws_subnet.public.id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = "t3.small"
  disk_size     = 30

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y nginx
              systemctl start nginx
              EOF

  tags = {
    Environment = "production"
    Project     = "web-app"
  }
}

# Access module outputs
output "web_server_ip" {
  value = module.web_server.instance_public_ip
}
```

Đối số `source` cho Terraform biết nơi tìm mô-đun. Nó có thể là:

- Đường dẫn cục bộ: `./modules/web_server`
- Kho lưu trữ Git: `git::https://github.com/user/terraform-modules.git//web_server?ref=v1.0.0`
- Sổ đăng ký Terraform: `terraform-aws-modules/vpc/aws` (hiển thị sau)
- URL HTTP: `https://example.com/terraform-modules/web_server.zip`

Khi bạn chạy `terraform init`, Terraform sẽ tải xuống và lưu trữ các mô-đun từ các nguồn từ xa.

## Nhiều phiên bản mô-đun

Sử dụng cùng một mô-đun nhiều lần với các cấu hình khác nhau:

```hcl
module "web_server_1" {
  source = "./modules/web_server"

  name          = "web-1"
  vpc_id        = aws_vpc.main.id
  subnet_id     = aws_subnet.public_a.id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  tags = {
    Environment = "dev"
    Role        = "web"
  }
}

module "web_server_2" {
  source = "./modules/web_server"

  name          = "web-2"
  vpc_id        = aws_vpc.main.id
  subnet_id     = aws_subnet.public_b.id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  tags = {
    Environment = "dev"
    Role        = "web"
  }
}

module "api_server" {
  source = "./modules/web_server"

  name          = "api"
  vpc_id        = aws_vpc.main.id
  subnet_id     = aws_subnet.private.id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = "t3.small"

  tags = {
    Environment = "dev"
    Role        = "api"
  }
}
```

Mỗi lệnh gọi mô-đun tạo ra tập hợp tài nguyên riêng.

## Số lượng mô-đun và For_Each

Tạo nhiều phiên bản của toàn bộ mô-đun:

```hcl
variable "web_servers" {
  type = map(object({
    subnet_id     = string
    instance_type = string
  }))

  default = {
    web-1 = {
      subnet_id     = "subnet-abc123"
      instance_type = "t3.micro"
    }
    web-2 = {
      subnet_id     = "subnet-def456"
      instance_type = "t3.micro"
    }
    api = {
      subnet_id     = "subnet-ghi789"
      instance_type = "t3.small"
    }
  }
}

module "servers" {
  for_each = var.web_servers
  source   = "./modules/web_server"

  name          = each.key
  vpc_id        = aws_vpc.main.id
  subnet_id     = each.value.subnet_id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = each.value.instance_type

  tags = {
    Environment = "production"
  }
}

# Access a specific module's output
output "web_1_ip" {
  value = module.servers["web-1"].instance_public_ip
}

# Access all module outputs
output "all_server_ips" {
  value = { for k, v in module.servers : k => v.instance_public_ip }
}
```

## Sử dụng mô-đun công cộng

Sổ đăng ký Terraform lưu trữ hàng nghìn mô-đun cộng đồng. Hãy sử dụng mô-đun AWS VPC phổ biến:

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name = "my-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false

  tags = {
    Environment = "dev"
    Project     = "web-app"
  }
}

# Use module outputs
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  subnet_id     = module.vpc.public_subnets[0]

  vpc_security_group_ids = [aws_security_group.web.id]
}

resource "aws_security_group" "web" {
  name   = "web-sg"
  vpc_id = module.vpc.vpc_id

  # ... rules ...
}
```

Luôn ghim các phiên bản mô-đun để tránh những thay đổi không mong muốn:

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"  # Allow 5.x but not 6.0

  # ...
}
```

Tìm mô-đun tại [đăng ký.terraform.io](https://registry.terraform.io/browse/modules).

## Mô-đun lồng nhau

Các mô-đun có thể gọi các mô-đun khác. Tạo một mô-đun cho một ứng dụng hoàn chỉnh:

```hcl
# modules/web_app/main.tf
module "vpc" {
  source = "../vpc"

  cidr_block = var.vpc_cidr
  name       = "${var.name}-vpc"
  tags       = var.tags
}

module "web_servers" {
  source = "../web_server"

  for_each = var.server_configs

  name          = "${var.name}-${each.key}"
  vpc_id        = module.vpc.vpc_id
  subnet_id     = module.vpc.public_subnet_ids[0]
  ami_id        = var.ami_id
  instance_type = each.value.instance_type

  tags = merge(var.tags, {
    Server = each.key
  })
}

module "database" {
  source = "../rds"

  name             = "${var.name}-db"
  vpc_id           = module.vpc.vpc_id
  subnet_ids       = module.vpc.private_subnet_ids
  instance_class   = var.db_instance_class
  allocated_storage = var.db_allocated_storage

  tags = var.tags
}
```

Mô-đun "web_app" này phối hợp các mô-đun VPC, máy chủ web và cơ sở dữ liệu.

## Thực tiễn tốt nhất về mô-đun

### Giữ các mô-đun tập trung

Mỗi mô-đun nên có một mục đích rõ ràng:

- Tốt: `vpc`, `web_server`, `rds_database`
- Xấu: `entire_infrastructure`

Các mô-đun nhỏ, tập trung sẽ dễ kiểm tra, hiểu và tái sử dụng hơn.

### Ghi lại các mô-đun của bạn

Thêm `README.md` giải thích chức năng của mô-đun, đầu vào và đầu ra bắt buộc:

```markdown
# Web Server Module

Creates an EC2 instance with a security group configured for web traffic.

## Usage

\`\`\`hcl
module "web" {
  source = "./modules/web_server"

  name      = "my-web-server"
  vpc_id    = "vpc-abc123"
  subnet_id = "subnet-def456"
  ami_id    = "ami-0c55b159cbfafe1f0"
}
\`\`\`

## Requirements

- AWS provider >= 5.0
- VPC must already exist
- Subnet must be in the VPC

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| name | Server name | string | - | yes |
| vpc_id | VPC ID | string | - | yes |
| instance_type | Instance type | string | t3.micro | no |

## Outputs

| Name | Description |
|------|-------------|
| instance_id | EC2 instance ID |
| instance_public_ip | Public IP address |
```

### Cung cấp ví dụ

Bao gồm thư mục `examples/` hiển thị cách sử dụng mô-đun:

```
modules/web_server/
├── main.tf
├── variables.tf
├── outputs.tf
├── README.md
└── examples/
    ├── basic/
    │   └── main.tf
    └── complete/
        └── main.tf
```

### Phiên bản mô-đun của bạn

Nếu chia sẻ mô-đun giữa các dự án, hãy phiên bản chúng bằng thẻ Git:

```bash
git tag -a v1.0.0 -m "Initial release"
git push --tags
```

Tham khảo các phiên bản cụ thể:

```hcl
module "web_server" {
  source = "git::https://github.com/yourorg/terraform-modules.git//web_server?ref=v1.0.0"

  # ...
}
```

### Tránh các giá trị được mã hóa cứng

Làm cho các mô-đun có thể định cấu hình bằng các biến thay vì các giá trị mã hóa cứng:

```hcl
# Bad - hardcoded
resource "aws_instance" "web" {
  instance_type = "t3.micro"
  # ...
}

# Good - configurable
resource "aws_instance" "web" {
  instance_type = var.instance_type
  # ...
}
```

### Sử dụng mặc định hợp lý

Cung cấp giá trị mặc định cho các biến tùy chọn:

```hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "disk_size" {
  description = "Root disk size in GB"
  type        = number
  default     = 20

  validation {
    condition     = var.disk_size >= 8 && var.disk_size <= 1000
    error_message = "Disk size must be between 8 and 1000 GB."
  }
}
```

Điều này làm cho các mô-đun dễ sử dụng hơn trong khi vẫn cho phép tùy chỉnh.

## Ví dụ thực tế: Đơn đăng ký hoàn chỉnh

Đây là một thiết lập đa mô-đun thực tế:

```hcl
# Root main.tf
terraform {
  required_version = "~> 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC module
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name = "${var.project}-${var.environment}-vpc"
  cidr = var.vpc_cidr

  azs             = data.aws_availability_zones.available.names
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway   = true
  single_nat_gateway   = var.environment != "prod"
  enable_dns_hostnames = true

  tags = local.common_tags
}

# Web server module
module "web_servers" {
  source = "./modules/web_server"

  for_each = var.web_server_configs

  name          = "${var.project}-${var.environment}-${each.key}"
  vpc_id        = module.vpc.vpc_id
  subnet_id     = module.vpc.public_subnets[each.value.subnet_index]
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = each.value.instance_type

  tags = merge(local.common_tags, {
    Role = "web"
  })
}

# Database module
module "database" {
  source = "./modules/rds"

  identifier        = "${var.project}-${var.environment}-db"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnets
  instance_class    = var.environment == "prod" ? "db.t3.medium" : "db.t3.micro"
  allocated_storage = var.environment == "prod" ? 100 : 20

  allowed_security_groups = [
    for server in module.web_servers : server.security_group_id
  ]

  tags = merge(local.common_tags, {
    Role = "database"
  })
}

# Load balancer module
module "load_balancer" {
  source = "./modules/alb"

  name               = "${var.project}-${var.environment}-alb"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.public_subnets
  target_instance_ids = [
    for server in module.web_servers : server.instance_id
  ]

  tags = merge(local.common_tags, {
    Role = "load-balancer"
  })
}

# Outputs
output "load_balancer_endpoint" {
  description = "Application endpoint"
  value       = "http://${module.load_balancer.dns_name}"
}

output "web_server_ips" {
  description = "Web server IP addresses"
  value       = { for k, v in module.web_servers : k => v.instance_public_ip }
}

output "database_endpoint" {
  description = "Database connection string"
  value       = module.database.endpoint
  sensitive   = true
}
```

Thiết lập này thể hiện:

- Sử dụng mô-đun đăng ký công cộng (VPC)
- Sử dụng các mô-đun cục bộ tùy chỉnh (máy chủ web, cơ sở dữ liệu, bộ cân bằng tải)
- Mô-đun for_each cho nhiều phiên bản
- Truyền đầu ra giữa các mô-đun
- Cấu hình dành riêng cho môi trường
- Gắn thẻ nhất quán trên tất cả các mô-đun

Mô-đun là cách bạn mở rộng quy mô Terraform từ cấu hình đơn giản đến cơ sở hạ tầng phức tạp, có thể bảo trì. Tiếp theo, chúng ta sẽ khám phá việc quản lý nhiều môi trường bằng cùng một mã.
