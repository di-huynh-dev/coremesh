---
title: "Làm việc với tài nguyên và nguồn dữ liệu"
description: Tìm hiểu cách tạo tài nguyên cơ sở hạ tầng và truy vấn cơ sở hạ tầng hiện có bằng nguồn dữ liệu
order: 4
---

**TLDR**: Tài nguyên tạo và quản lý cơ sở hạ tầng (máy chủ, cơ sở dữ liệu, mạng). Nguồn dữ liệu truy vấn cơ sở hạ tầng hiện có mà không cần quản lý nó. Sử dụng các phụ thuộc tài nguyên để kiểm soát thứ tự tạo. Áp dụng các quy tắc vòng đời để ngăn chặn việc vô tình xóa hoặc kiểm soát hành vi cập nhật.

Tài nguyên là trái tim của Terraform - chúng đại diện cho các thành phần cơ sở hạ tầng mà bạn muốn tạo và quản lý. Nguồn dữ liệu cho phép bạn tham khảo thông tin về cơ sở hạ tầng hiện có. Hiểu cả hai là chìa khóa để xây dựng cấu hình thực sự.

## Tạo tài nguyên

Khối tài nguyên khai báo một phần cơ sở hạ tầng cần tạo. Cú pháp chung là:

```hcl
resource "provider_type" "local_name" {
  argument1 = "value1"
  argument2 = "value2"
}
```

Hãy tạo một ví dụ hoàn chỉnh với phiên bản VPC, mạng con và EC2 trên AWS:

```hcl
# VPC to isolate our resources
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "main-vpc"
  }
}

# Public subnet in the VPC
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet"
  }
}

# Internet gateway for external access
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main-igw"
  }
}

# Route table for public internet access
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "public-rt"
  }
}

# Associate route table with subnet
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Security group
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Allow web traffic"
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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "web-sg"
  }
}

# EC2 instance
resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]

  tags = {
    Name = "web-server"
  }
}
```

Khi bạn chạy `terraform apply`, Terraform sẽ tạo các tài nguyên này theo đúng thứ tự dựa trên sự phụ thuộc của chúng.

## Hiểu sự phụ thuộc tài nguyên

Terraform tự động xác định thứ tự tạo tài nguyên bằng cách phân tích tài liệu tham khảo. Trong ví dụ của chúng tôi:

```
aws_vpc.main
    ↓
    ├── aws_subnet.public
    │       ↓
    │   aws_instance.web ← aws_security_group.web
    │
    └── aws_internet_gateway.main
            ↓
        aws_route_table.public
            ↓
        aws_route_table_association.public
```

VPC phải tồn tại trước khi tạo mạng con hoặc cổng internet. Mạng con phải tồn tại trước khi tạo cá thể. Terraform tự động xử lý việc này.

Đôi khi bạn cần các phần phụ thuộc rõ ràng mà Terraform không thể suy ra. Sử dụng `depends_on`:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id

  # Explicit dependency - make sure internet gateway exists
  depends_on = [aws_internet_gateway.main]
}
```

Sử dụng `depends_on` một cách tiết kiệm. Terraform thường tìm ra các phụ thuộc một cách chính xác. Bạn cần nó khi:

- Tài nguyên có sự phụ thuộc ẩn mà Terraform không thể phát hiện
- Một hệ thống bên ngoài cần thời gian để sẵn sàng
- Bạn cần kiểm soát thứ tự tạo vì lý do hợp lý

## Thuộc tính tài nguyên

Sau khi Terraform tạo tài nguyên, nó sẽ hiển thị các thuộc tính mà bạn có thể tham khảo. Một số thuộc tính bạn cung cấp (như `cidr_block`), một số thuộc tính khác do nhà cung cấp đặt (như `id`).

Kiểm tra tài liệu của nhà cung cấp để xem các thuộc tính có sẵn. Đối với phiên bản AWS:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id
}

# Reference the instance's attributes
output "instance_id" {
  value = aws_instance.web.id  # Set by AWS
}

output "private_ip" {
  value = aws_instance.web.private_ip  # Set by AWS
}

output "public_ip" {
  value = aws_instance.web.public_ip  # Set by AWS
}

output "instance_type" {
  value = aws_instance.web.instance_type  # What we set
}
```

## Nguồn dữ liệu: Truy vấn cơ sở hạ tầng hiện có

Nguồn dữ liệu cho phép bạn tìm nạp thông tin về các tài nguyên tồn tại bên ngoài cấu hình Terraform của bạn. Họ không tạo hay sửa đổi bất cứ điều gì - họ chỉ truy vấn.

Cú pháp cho nguồn dữ liệu:

```hcl
data "provider_type" "local_name" {
  # Query parameters
}
```

Các trường hợp sử dụng phổ biến:

### Tìm AMI

Thay vì mã hóa cứng ID AMI, hãy tự động tìm phiên bản mới nhất:

```hcl
# Find the latest Ubuntu 22.04 AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical's AWS account ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Use it in a resource
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id  # Always the latest
  instance_type = "t3.micro"
}
```

Điều này đảm bảo bạn luôn sử dụng Ubuntu image mới nhất mà không cần cập nhật thủ công.

### Tham chiếu các VPC hiện có

Nếu VPC của bạn được tạo bên ngoài Terraform:

```hcl
# Find VPC by tag
data "aws_vpc" "main" {
  tags = {
    Name = "main-vpc"
  }
}

# Find subnets in that VPC
data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }

  tags = {
    Tier = "public"
  }
}

# Use the VPC and subnets
resource "aws_security_group" "web" {
  vpc_id = data.aws_vpc.main.id

  # ... rules ...
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  subnet_id     = data.aws_subnets.public.ids[0]
}
```

### Lấy thông tin tài khoản và khu vực

```hcl
# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Get current region
data "aws_region" "current" {}

# Get available availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Use them
locals {
  account_id = data.aws_caller_identity.current.account_id
  region     = data.aws_region.current.name
  azs        = data.aws_availability_zones.available.names
}

output "deployment_info" {
  value = "Deploying in account ${local.account_id}, region ${local.region}"
}
```

### Đọc dữ liệu bên ngoài

Nguồn dữ liệu `local_file` đọc các tệp cục bộ:

```hcl
data "local_file" "ssh_key" {
  filename = "${path.module}/keys/id_rsa.pub"
}

resource "aws_key_pair" "deployer" {
  key_name   = "deployer-key"
  public_key = data.local_file.ssh_key.content
}
```

## Vòng đời tài nguyên

Kiểm soát cách Terraform xử lý các cập nhật tài nguyên bằng các quy tắc vòng đời.

### Ngăn chặn xóa

Bảo vệ các tài nguyên quan trọng khỏi việc vô tình xóa:

```hcl
resource "aws_db_instance" "production" {
  identifier        = "prod-db"
  engine            = "postgres"
  instance_class    = "db.t3.medium"
  allocated_storage = 100

  lifecycle {
    prevent_destroy = true  # Terraform will error if you try to destroy this
  }
}
```

Nếu ai đó cố gắng phá hủy tài nguyên này, Terraform sẽ từ chối:

```
Error: Instance cannot be destroyed

  on main.tf line 10:
  10: resource "aws_db_instance" "production" {

Resource aws_db_instance.production has lifecycle.prevent_destroy set, but
the plan calls for this resource to be destroyed.
```

### Tạo trước khi hủy

Một số tài nguyên không thể ngừng hoạt động trong quá trình cập nhật. Tạo sự thay thế trước:

```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  lifecycle {
    create_before_destroy = true  # New instance before deleting old one
  }
}
```

Khi bạn thay đổi AMI, Terraform:

1. Tạo một phiên bản mới với AMI mới
2. Cập nhật các tham chiếu để trỏ đến phiên bản mới
3. Xóa phiên bản cũ

Nếu không có cài đặt này, Terraform sẽ xóa trước (gây ra thời gian ngừng hoạt động) sau đó mới tạo.

### Bỏ qua các thay đổi

Đôi khi các hệ thống bên ngoài sửa đổi tài nguyên bên ngoài Terraform. Ngăn Terraform hoàn nguyên những thay đổi này:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }

  lifecycle {
    ignore_changes = [
      tags["LastModified"],  # Ignore changes to specific tag
      user_data,             # Ignore user_data modifications
    ]
  }
}
```

Hoặc bỏ qua mọi thay đổi:

```hcl
lifecycle {
  ignore_changes = all
}
```

Điều này rất hữu ích khi:

- Tự động hóa bên ngoài thêm thẻ
- Tự động điều chỉnh tỷ lệ sửa đổi một số thuộc tính nhất định
- Bạn đang dần áp dụng Terraform cho cơ sở hạ tầng hiện có

### Thay thế được kích hoạt bởi

Buộc thay thế khi giá trị cụ thể thay đổi:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  lifecycle {
    replace_triggered_by = [
      aws_security_group.web.id  # Replace instance if security group changes
    ]
  }
}
```

## Đếm và For_Each: Nhiều trường hợp

Tạo nhiều tài nguyên tương tự bằng `count` hoặc `for_each`.

### Sử dụng Đếm

Tạo một số lượng tài nguyên cố định:

```hcl
resource "aws_instance" "web" {
  count = 3

  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id

  tags = {
    Name = "web-${count.index}"  # web-0, web-1, web-2
  }
}

# Access specific instances
output "first_instance_ip" {
  value = aws_instance.web[0].public_ip
}

# Access all instances
output "all_instance_ips" {
  value = aws_instance.web[*].public_ip
}
```

`count.index` cung cấp cho bạn số lần lặp hiện tại (bắt đầu từ 0).

### Sử dụng For_Each

Tạo tài nguyên dựa trên bản đồ hoặc tập hợp, đặt cho mỗi tài nguyên một cái tên có ý nghĩa:

```hcl
variable "instances" {
  type = map(object({
    instance_type = string
    ami           = string
  }))

  default = {
    web = {
      instance_type = "t3.micro"
      ami           = "ami-0c55b159cbfafe1f0"
    }
    api = {
      instance_type = "t3.small"
      ami           = "ami-0c55b159cbfafe1f0"
    }
    worker = {
      instance_type = "t3.medium"
      ami           = "ami-0c55b159cbfafe1f0"
    }
  }
}

resource "aws_instance" "server" {
  for_each = var.instances

  ami           = each.value.ami
  instance_type = each.value.instance_type
  subnet_id     = aws_subnet.public.id

  tags = {
    Name = each.key  # "web", "api", or "worker"
  }
}

# Access specific instance
output "web_server_ip" {
  value = aws_instance.server["web"].public_ip
}

# Access all instances
output "all_server_ips" {
  value = { for k, v in aws_instance.server : k => v.public_ip }
}
```

Với `for_each`:

- `each.key` là khóa bản đồ hoặc giá trị cài đặt
- `each.value` là giá trị bản đồ (đối với các bộ, giống như `each.key`)

`for_each` nhìn chung tốt hơn `count` vì:

- Tài nguyên có tên có ý nghĩa thay vì số
- Thêm/xóa các mục không đánh số lại mọi thứ
- Ý định rõ ràng hơn

Sử dụng `count` khi bạn chỉ cần N tài nguyên giống hệt nhau. Sử dụng `for_each` khi mỗi tài nguyên được cấu hình khác nhau.

## Ví dụ thực tế: Ứng dụng nhiều tầng

Đây là một ví dụ hoàn chỉnh về việc kết hợp các tài nguyên, nguồn dữ liệu và các khái niệm sau:

```hcl
# Find latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Get available AZs
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "main-vpc"
  }
}

# Create subnets in multiple AZs
resource "aws_subnet" "public" {
  for_each = toset(slice(data.aws_availability_zones.available.names, 0, 2))

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${index(data.aws_availability_zones.available.names, each.value) + 1}.0/24"
  availability_zone       = each.value
  map_public_ip_on_launch = true

  tags = {
    Name = "public-${each.value}"
  }
}

# Security groups for different tiers
resource "aws_security_group" "web" {
  name   = "web-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "app" {
  name   = "app-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]  # Only from web tier
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Launch template for web servers
resource "aws_launch_template" "web" {
  name_prefix   = "web-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  vpc_security_group_ids = [aws_security_group.web.id]

  user_data = base64encode(<<-EOF
              #!/bin/bash
              yum update -y
              yum install -y httpd
              systemctl start httpd
              systemctl enable httpd
              echo "<h1>Web Server</h1>" > /var/www/html/index.html
              EOF
  )

  lifecycle {
    create_before_destroy = true
  }
}

# Auto-scaling group
resource "aws_autoscaling_group" "web" {
  desired_capacity    = 2
  max_size            = 4
  min_size            = 1
  vpc_zone_identifier = [for s in aws_subnet.public : s.id]

  launch_template {
    id      = aws_launch_template.web.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "web-server"
    propagate_at_launch = true
  }
}
```

Ví dụ này chứng minh:

- Sử dụng nguồn dữ liệu để tìm AMI và vùng sẵn sàng
- Tạo nhiều mạng con với `for_each`
- Thiết lập nhóm bảo mật với quyền truy cập theo từng tầng
- Sử dụng mẫu khởi chạy cho các phiên bản có thể mở rộng
- Quy tắc vòng đời để cập nhật không có thời gian ngừng hoạt động

Hiểu các tài nguyên và nguồn dữ liệu sẽ cung cấp cho bạn nền tảng cho mọi cơ sở hạ tầng. Tiếp theo, chúng ta sẽ khám phá quản lý trạng thái - cách Terraform theo dõi những gì nó đã tạo và cách xử lý trạng thái một cách an toàn.
