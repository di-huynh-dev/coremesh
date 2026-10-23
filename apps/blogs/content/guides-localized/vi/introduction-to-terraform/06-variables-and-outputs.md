---
title: "Các biến và đầu ra trong Terraform"
description: Tìm hiểu cách tham số hóa cấu hình với các biến đầu vào và hiển thị thông tin với đầu ra
order: 6
---

**TLDR**: Các biến giúp cấu hình có thể tái sử dụng - xác định chúng bằng loại và mặc định, đặt chúng thông qua CLI, tệp hoặc biến môi trường. Đầu ra hiển thị các giá trị sau khi áp dụng - như địa chỉ IP hoặc ID tài nguyên. Sử dụng các quy tắc xác thực để phát hiện lỗi sớm và gắn cờ nhạy cảm để che giấu bí mật.

Các biến và kết quả đầu ra là cách bạn tạo cấu hình Terraform linh hoạt và mang tính thông tin. Các biến cho phép bạn tùy chỉnh hành vi mà không cần thay đổi mã. Đầu ra trích xuất thông tin về các tài nguyên được tạo.

## Biến đầu vào

Các biến tham số hóa cấu hình của bạn để bạn có thể sử dụng nó trong các tình huống khác nhau mà không cần sửa đổi.

### Khai báo biến cơ bản

Khai báo biến bằng khối `variable`:

```hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "instance_count" {
  description = "Number of instances to create"
  type        = number
  default     = 1
}

variable "enable_monitoring" {
  description = "Enable detailed monitoring"
  type        = bool
  default     = false
}
```

Sử dụng các biến trong cấu hình của bạn:

```hcl
resource "aws_instance" "web" {
  count         = var.instance_count
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type
  monitoring    = var.enable_monitoring

  tags = {
    Name = "web-${count.index}"
  }
}
```

### Các loại biến

Terraform hỗ trợ một số loại:

**Các loại nguyên thủy**:

```hcl
variable "string_example" {
  type    = string
  default = "hello"
}

variable "number_example" {
  type    = number
  default = 42
}

variable "bool_example" {
  type    = bool
  default = true
}
```

**Các loại bộ sưu tập**:

```hcl
variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "instance_tags" {
  type = map(string)
  default = {
    Environment = "development"
    Project     = "web-app"
  }
}

variable "allowed_ports" {
  type    = set(number)
  default = [80, 443, 8080]
}
```

**Các loại kết cấu**:

```hcl
variable "server_config" {
  type = object({
    instance_type = string
    disk_size     = number
    enable_backup = bool
  })

  default = {
    instance_type = "t3.micro"
    disk_size     = 20
    enable_backup = false
  }
}

variable "subnet_configs" {
  type = list(object({
    cidr_block        = string
    availability_zone = string
    public            = bool
  }))

  default = [
    {
      cidr_block        = "10.0.1.0/24"
      availability_zone = "us-east-1a"
      public            = true
    },
    {
      cidr_block        = "10.0.2.0/24"
      availability_zone = "us-east-1b"
      public            = false
    }
  ]
}
```

Sử dụng các loại phức tạp:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.server_config.instance_type

  root_block_device {
    volume_size = var.server_config.disk_size
  }

  tags = var.instance_tags
}

resource "aws_subnet" "subnets" {
  for_each = { for idx, subnet in var.subnet_configs : idx => subnet }

  vpc_id                  = aws_vpc.main.id
  cidr_block              = each.value.cidr_block
  availability_zone       = each.value.availability_zone
  map_public_ip_on_launch = each.value.public
}
```

### Đặt giá trị biến

Có một số cách để cung cấp giá trị:

**Dòng lệnh**:

```bash
terraform apply -var="instance_type=t3.large" -var="instance_count=3"
```

**Các tệp biến**:

Tạo `terraform.tfvars`:

```hcl
instance_type   = "t3.large"
instance_count  = 3
enable_monitoring = true

instance_tags = {
  Environment = "production"
  Project     = "web-app"
  Team        = "platform"
}
```

Terraform tự động tải các tệp `terraform.tfvars` và `*.auto.tfvars`.

Đối với cấu hình dành riêng cho môi trường:

```bash
# dev.tfvars
instance_type  = "t3.micro"
instance_count = 1

# prod.tfvars
instance_type  = "t3.large"
instance_count = 5
```

Áp dụng với:

```bash
terraform apply -var-file="dev.tfvars"
terraform apply -var-file="prod.tfvars"
```

**EBiến môi trường**:

```bash
export TF_VAR_instance_type="t3.large"
export TF_VAR_instance_count=3
terraform apply
```

Terraform đọc bất kỳ biến môi trường nào bắt đầu bằng `TF_VAR_`.

**Đầu vào tương tác**:

Nếu một biến không có giá trị mặc định và bạn không cung cấp giá trị, Terraform sẽ nhắc:

```bash
$ terraform apply
var.instance_type
  EC2 instance type

  Enter a value: t3.micro
```

### Mức độ ưu tiên thay đổi

Khi nhiều nguồn cung cấp giá trị, Terraform sử dụng mức độ ưu tiên này (cao nhất đến thấp nhất):

1. Cờ dòng lệnh (`-var`)
2. Tệp `*.auto.tfvars` (thứ tự bảng chữ cái)
3. Tệp `terraform.tfvars`
4. Biến môi trường (`TF_VAR_*`)
5. Giá trị mặc định trong khai báo biến

### Xác thực biến

Thêm quy tắc xác thực để phát hiện lỗi trước khi thay đổi cơ sở hạ tầng:

```hcl
variable "instance_type" {
  type        = string
  description = "EC2 instance type"

  validation {
    condition     = can(regex("^t3\\.", var.instance_type))
    error_message = "Instance type must be from the t3 family."
  }
}

variable "environment" {
  type        = string
  description = "Environment name"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "disk_size" {
  type        = number
  description = "Root disk size in GB"

  validation {
    condition     = var.disk_size >= 20 && var.disk_size <= 1000
    error_message = "Disk size must be between 20 and 1000 GB."
  }
}
```

Nếu xác thực không thành công, Terraform sẽ hiển thị lỗi trước khi thực hiện thay đổi:

```
Error: Invalid value for variable

  on variables.tf line 12:
  12: variable "environment" {

Environment must be dev, staging, or prod.
```

### Biến nhạy cảm

Đánh dấu các biến chứa bí mật:

```hcl
variable "database_password" {
  type        = string
  description = "Database admin password"
  sensitive   = true
}

variable "api_key" {
  type      = string
  sensitive = true
}
```

Terraform sẽ không hiển thị các giá trị này trong nhật ký hoặc đầu ra:

```
# aws_db_instance.main will be created
+ resource "aws_db_instance" "main" {
    + password = (sensitive value)
    ...
  }
```

Vẫn chưa bao giờ commit bí mật kiểm soát phiên bản. Sử dụng các biến môi trường hoặc hệ thống quản lý bí mật.

## Giá trị đầu ra

Đầu ra hiển thị thông tin về cơ sở hạ tầng của bạn sau khi Terraform tạo ra nó.

### Đầu ra cơ bản

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
}

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
```

Sau `terraform apply`, kết quả đầu ra xuất hiện:

```
Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

Outputs:

instance_id = "i-0123456789abcdef"
instance_private_ip = "10.0.1.25"
instance_public_ip = "54.123.45.67"
```

Xem kết quả đầu ra bất cứ lúc nào:

```bash
terraform output
```

Nhận một đầu ra cụ thể:

```bash
terraform output instance_public_ip
```

Nhận định dạng JSON:

```bash
terraform output -json
```

### Đầu ra phức tạp

Bộ sưu tập và cấu trúc đầu ra:

```hcl
resource "aws_instance" "web" {
  count         = 3
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
}

output "all_instance_ids" {
  description = "IDs of all instances"
  value       = aws_instance.web[*].id
}

output "all_instance_ips" {
  description = "Public IPs of all instances"
  value       = aws_instance.web[*].public_ip
}

output "instance_details" {
  description = "Detailed information about instances"
  value = {
    ids         = aws_instance.web[*].id
    public_ips  = aws_instance.web[*].public_ip
    private_ips = aws_instance.web[*].private_ip
  }
}
```

Đầu ra:

```
Outputs:

all_instance_ids = [
  "i-0123456789abcdef",
  "i-0123456789abcdeg",
  "i-0123456789abcdeh",
]

instance_details = {
  "ids" = [
    "i-0123456789abcdef",
    "i-0123456789abcdeg",
    "i-0123456789abcdeh",
  ]
  "private_ips" = [
    "10.0.1.25",
    "10.0.1.26",
    "10.0.1.27",
  ]
  "public_ips" = [
    "54.123.45.67",
    "54.123.45.68",
    "54.123.45.69",
  ]
}
```

### Đầu ra nhạy cảm

Ẩn thông tin nhạy cảm trong đầu ra:

```hcl
resource "aws_db_instance" "main" {
  identifier = "mydb"
  engine     = "postgres"
  password   = var.database_password
  # ... other config ...
}

output "database_endpoint" {
  description = "Database connection endpoint"
  value       = aws_db_instance.main.endpoint
}

output "database_password" {
  description = "Database password"
  value       = aws_db_instance.main.password
  sensitive   = true
}
```

Đầu ra nhạy cảm không xuất hiện ở đầu ra bình thường:

```
Outputs:

database_endpoint = "mydb.abc123.us-east-1.rds.amazonaws.com:5432"
database_password = <sensitive>
```

Truy xuất giá trị một cách rõ ràng:

```bash
terraform output database_password
```

Hoặc với `-json` để phân tích nó:

```bash
terraform output -json database_password | jq -r
```

### Đầu ra từ mô-đun

Đầu ra là cách các mô-đun trả về giá trị. Nếu bạn sử dụng mô-đun VPC:

```hcl
module "vpc" {
  source = "./modules/vpc"

  cidr_block = "10.0.0.0/16"
  name       = "main-vpc"
}

# Use the module's outputs
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = module.vpc.public_subnet_id  # Output from module
}

# Re-export module outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}
```

## Ví dụ thực tế: Cơ sở hạ tầng linh hoạt

Đây là một ví dụ hoàn chỉnh sử dụng các biến và kết quả đầu ra:

```hcl
# variables.tf
variable "environment" {
  description = "Environment name"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod."
  }
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "webapp"
}

variable "instance_configs" {
  description = "Configuration for each instance type"
  type = map(object({
    instance_type = string
    count         = number
    disk_size     = number
  }))

  default = {
    dev = {
      instance_type = "t3.micro"
      count         = 1
      disk_size     = 20
    }
    staging = {
      instance_type = "t3.small"
      count         = 2
      disk_size     = 30
    }
    prod = {
      instance_type = "t3.large"
      count         = 5
      disk_size     = 50
    }
  }
}

variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH"
  type        = list(string)
  default     = []
}

# main.tf
locals {
  config = var.instance_configs[var.environment]
  common_tags = {
    Environment = var.environment
    Project     = var.project
    ManagedBy   = "terraform"
  }
}

resource "aws_security_group" "web" {
  name        = "${var.project}-${var.environment}-sg"
  description = "Security group for ${var.environment}"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  dynamic "ingress" {
    for_each = length(var.allowed_ssh_cidrs) > 0 ? [1] : []
    content {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = var.allowed_ssh_cidrs
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.project}-${var.environment}-sg"
  })
}

resource "aws_instance" "web" {
  count         = local.config.count
  ami           = data.aws_ami.ubuntu.id
  instance_type = local.config.instance_type

  vpc_security_group_ids = [aws_security_group.web.id]
  subnet_id              = aws_subnet.public.id

  root_block_device {
    volume_size = local.config.disk_size
  }

  tags = merge(local.common_tags, {
    Name = "${var.project}-${var.environment}-web-${count.index + 1}"
  })
}

# outputs.tf
output "environment" {
  description = "Deployment environment"
  value       = var.environment
}

output "instance_count" {
  description = "Number of instances created"
  value       = local.config.count
}

output "instance_ids" {
  description = "IDs of all web instances"
  value       = aws_instance.web[*].id
}

output "instance_ips" {
  description = "Public IP addresses"
  value       = aws_instance.web[*].public_ip
}

output "ssh_commands" {
  description = "SSH commands for each instance"
  value = [
    for idx, instance in aws_instance.web :
    "ssh ubuntu@${instance.public_ip}  # ${var.project}-${var.environment}-web-${idx + 1}"
  ]
}

output "load_balancer_endpoint" {
  description = "Load balancer endpoint"
  value       = aws_lb.web.dns_name
  depends_on  = [aws_lb.web]
}
```

Sử dụng nó cho các môi trường khác nhau:

```bash
# Development
terraform apply -var="environment=dev"

# Staging
terraform apply -var="environment=staging" -var="allowed_ssh_cidrs=[\"203.0.113.0/24\"]"

# Production
terraform apply -var-file="prod.tfvars"
```

Trong đó `prod.tfvars` chứa:

```hcl
environment = "prod"
project     = "webapp"

allowed_ssh_cidrs = [
  "203.0.113.0/24",  # Office network
  "198.51.100.0/24"  # VPN network
]
```

Thiết lập này cung cấp cho bạn:

- Số lượng và kích thước phiên bản dành riêng cho môi trường
- Xác thực ngăn ngừa lỗi chính tả trong tên môi trường
- Kiểm soát truy cập SSH linh hoạt
- Đầu ra chi tiết để kết nối với tài nguyên
- Cấu hình có thể tái sử dụng trên nhiều môi trường

Hiểu các biến và kết quả đầu ra cho phép bạn xây dựng các cấu hình Terraform linh hoạt, có thể tái sử dụng. Tiếp theo, chúng ta sẽ khám phá các mô-đun - cách tổ chức và chia sẻ mã Terraform giữa các dự án.
