---
title: "Khái niệm cơ bản về ngôn ngữ cấu hình Terraform"
description: Tìm hiểu cú pháp, biểu thức HCL, hàm và cách viết cấu hình Terraform có thể bảo trì
order: 3
---

**TLDR**: Terraform sử dụng HCL (Ngôn ngữ cấu hình HashiCorp), trông giống JSON nhưng dễ đọc hơn. Bạn viết các khối (như `resource`, `variable`, `output`) với các đối số và các khối lồng nhau. Sử dụng phép nội suy `${}` để tham chiếu các giá trị khác và hàm tích hợp để thao tác chuỗi, đọc tệp và chuyển đổi dữ liệu.

Ngôn ngữ cấu hình của Terraform (HCL) được thiết kế để con người có thể đọc được trong khi vẫn thân thiện với máy. Hiểu cú pháp và tính năng của nó giúp bạn viết mã cơ sở hạ tầng sạch hơn, dễ bảo trì hơn.

## Cú pháp cơ bản

HCL trông tương tự như JSON nhưng sử dụng cú pháp thoải mái hơn. Đây là một định nghĩa tài nguyên:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "web-server"
    Environment = "production"
  }
}
```

Phá vỡ cú pháp:

- **Blocks** bắt đầu bằng một loại (`resource`), nhãn tùy chọn (`"aws_instance"`, `"web"`) và chứa nội dung trong dấu ngoặc nhọn
- **Arguments** gán giá trị cho tên (`ami = "ami-0c55b159cbfafe1f0"`)
- **Strings** sử dụng dấu ngoặc kép
- **Maps/Objects** sử dụng dấu ngoặc nhọn với các cặp khóa-giá trị
- **Lists** sử dụng dấu ngoặc: `["item1", "item2"]`
- **Comments** sử dụng `#` cho một dòng hoặc `/* */` cho nhiều dòng

## Các loại khối

Terraform có một số loại khối, mỗi loại phục vụ một mục đích cụ thể:

### Khối tài nguyên

Tài nguyên là loại khối chính - chúng xác định các đối tượng cơ sở hạ tầng:

```hcl
resource "resource_type" "local_name" {
  argument1 = "value1"
  argument2 = "value2"

  nested_block {
    nested_argument = "value"
  }
}
```

### Khối biến

Các biến cho phép bạn tham số hóa cấu hình của mình:

```hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}
```

### Khối đầu ra

Đầu ra hiển thị các giá trị sau khi Terraform chạy:

```hcl
output "instance_ip" {
  description = "Public IP of the instance"
  value       = aws_instance.web.public_ip
}
```

### Khối địa phương

Người dân địa phương xác định các giá trị trung gian được sử dụng trong cấu hình của bạn:

```hcl
locals {
  common_tags = {
    Project     = "web-app"
    Environment = "production"
    ManagedBy   = "terraform"
  }

  instance_name = "${var.project}-${var.environment}-web"
}
```

## Biểu thức và nội suy

Bạn có thể tham chiếu các giá trị khác và tính toán các giá trị mới bằng cách sử dụng biểu thức.

### Tài liệu tham khảo

Truy cập các thuộc tính tài nguyên bằng `resource_type.name.attribute`:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type  # Reference a variable
  subnet_id     = aws_subnet.public.id  # Reference another resource
}
```

Các loại tài liệu tham khảo:

- `var.name` - biến đầu vào
- `local.name` - giá trị cục bộ
- `resource_type.name.attribute` - thuộc tính tài nguyên
- `data.data_type.name.attribute` - thuộc tính nguồn dữ liệu
- `module.module_name.output_name` - đầu ra mô-đun

### Nội suy chuỗi

Sử dụng `${}` để nội suy biểu thức thành chuỗi:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "${var.project}-web-${var.environment}"  # Interpolation
  }
}
```

Đối với các tham chiếu đơn giản, bạn có thể bỏ qua cú pháp nội suy:

```hcl
# These are equivalent
subnet_id = aws_subnet.public.id
subnet_id = "${aws_subnet.public.id}"
```

Sử dụng phép nội suy khi kết hợp nhiều giá trị:

```hcl
name = "${var.prefix}-server-${count.index}"
```

### Số học và so sánh

Terraform hỗ trợ các toán tử số học và so sánh cơ bản:

```hcl
locals {
  # Arithmetic
  total_instances = var.web_count + var.api_count
  memory_gb       = var.memory_mb / 1024

  # Comparison
  is_production   = var.environment == "production"
  needs_backup    = var.environment != "development"
  large_instance  = var.cpu_count >= 4
}
```

Các nhà khai thác bao gồm:

- Số học: `+`, `-`, `*`, `/`, `%`
- So sánh: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Hợp lý: `&&`, `||`, `!`

### Biểu thức điều kiện

Sử dụng toán tử bậc ba cho logic điều kiện:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.environment == "production" ? "t3.large" : "t3.micro"

  monitoring    = var.environment == "production" ? true : false
}
```

Cú pháp là `condition ? true_value : false_value`.

## Hàm tích hợp

Terraform cung cấp nhiều hàm để thao tác chuỗi, chuyển đổi dữ liệu và vận hành tệp. Bạn gọi chúng mà không có không gian tên:

```hcl
locals {
  uppercase_name = upper(var.project_name)
  file_content   = file("${path.module}/config.json")
  merged_tags    = merge(var.common_tags, var.specific_tags)
}
```

### Chuỗi hàm

Thao tác và định dạng chuỗi:

```hcl
locals {
  # Change case
  upper_env = upper(var.environment)  # "PRODUCTION"
  lower_env = lower(var.environment)  # "production"

  # Split and join
  name_parts = split("-", "web-app-server")  # ["web", "app", "server"]
  full_name  = join("-", ["web", "app", var.environment])

  # Templates and formatting
  greeting = format("Hello, %s!", var.username)
  padded   = format("%05d", 42)  # "00042"

  # Substring operations
  short_id = substr(var.resource_id, 0, 8)
  trimmed  = trim(var.user_input, " ")
}
```

### Bộ sưu tập hàm

Làm việc với danh sách và bản đồ:

```hcl
locals {
  # Lists
  all_subnets  = concat(var.public_subnets, var.private_subnets)
  unique_zones = distinct(var.availability_zones)
  first_zone   = element(var.availability_zones, 0)
  zone_count   = length(var.availability_zones)

  # Maps
  combined_tags = merge(
    var.common_tags,
    {
      Name = var.instance_name
    }
  )

  tag_keys = keys(var.tags)
  tag_vals = values(var.tags)

  # Lookup with default
  size = lookup(var.instance_sizes, var.environment, "t3.micro")
}
```

### Tệp hàm

Đọc tập tin và đường dẫn:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  # Read a file's content
  user_data = file("${path.module}/scripts/init.sh")
}

locals {
  # Path references
  module_path = path.module  # Path to the current module
  root_path   = path.root    # Path to the root module

  # Read and parse JSON
  config = jsondecode(file("${path.module}/config.json"))

  # Read and parse YAML
  settings = yamldecode(file("${path.module}/settings.yaml"))

  # Template files with variables
  rendered = templatefile("${path.module}/template.tpl", {
    hostname = var.hostname
    port     = var.port
  })
}
```

### Mã hóa hàm

Chuyển đổi giữa các định dạng:

```hcl
locals {
  # JSON encoding/decoding
  json_string = jsonencode({
    name = "web-server"
    port = 8080
  })

  config_object = jsondecode(file("config.json"))

  # YAML encoding/decoding
  yaml_string = yamlencode(var.configuration)

  # Base64 encoding/decoding
  encoded_secret = base64encode(var.api_key)
  decoded_secret = base64decode(var.encoded_value)
}
```

## Khối động

Đôi khi bạn cần tạo các khối lồng nhau lặp đi lặp lại dựa trên dữ liệu. Khối động cho phép bạn thực hiện việc này:

```hcl
resource "aws_security_group" "web" {
  name   = "web-sg"
  vpc_id = aws_vpc.main.id

  # Without dynamic blocks - repetitive
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

  # With dynamic blocks - cleaner
  dynamic "ingress" {
    for_each = var.allowed_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
}

variable "allowed_ports" {
  type    = list(number)
  default = [80, 443, 8080]
}
```

Khối `dynamic` lặp qua một bộ sưu tập. Bên trong khối `content`, bạn truy cập mục hiện tại bằng `block_name.value` (hoặc `block_name.key` cho bản đồ).

Đối với dữ liệu phức tạp hơn:

```hcl
variable "ingress_rules" {
  type = list(object({
    port        = number
    protocol    = string
    cidr_blocks = list(string)
    description = string
  }))

  default = [
    {
      port        = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "HTTP traffic"
    },
    {
      port        = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "HTTPS traffic"
    }
  ]
}

resource "aws_security_group" "web" {
  name   = "web-sg"
  vpc_id = aws_vpc.main.id

  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
      description = ingress.value.description
    }
  }
}
```

## Đối với biểu thức

Chuyển đổi và lọc các bộ sưu tập bằng cách sử dụng các biểu thức:

```hcl
locals {
  # Create a list from another list
  uppercase_names = [for name in var.server_names : upper(name)]

  # Filter a list
  production_servers = [
    for server in var.servers : server
    if server.environment == "production"
  ]

  # Create a map from a list
  server_map = {
    for server in var.servers : server.name => server.ip
  }

  # Transform and filter
  large_instance_names = [
    for name, config in var.instances : name
    if config.size == "large"
  ]
}
```

Ví dụ thực tế:

```hcl
variable "servers" {
  type = list(object({
    name        = string
    environment = string
    size        = string
  }))
}

locals {
  # Get production server names
  prod_names = [
    for s in var.servers : s.name
    if s.environment == "production"
  ]

  # Build tags for each server
  server_tags = {
    for s in var.servers : s.name => {
      Name        = s.name
      Environment = s.environment
      Size        = s.size
      ManagedBy   = "terraform"
    }
  }
}
```

## Ràng buộc kiểu

Chỉ định loại cho các biến để sớm phát hiện lỗi:

```hcl
variable "instance_count" {
  type        = number
  description = "Number of instances to create"
  default     = 1
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  default     = "t3.micro"
}

variable "enable_monitoring" {
  type        = bool
  description = "Enable detailed monitoring"
  default     = false
}

variable "availability_zones" {
  type        = list(string)
  description = "AZs to deploy into"
  default     = ["us-east-1a", "us-east-1b"]
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {}
}

variable "server_config" {
  type = object({
    name = string
    size = string
    port = number
  })
  description = "Server configuration"
}

variable "subnet_configs" {
  type = list(object({
    cidr = string
    az   = string
    name = string
  }))
  description = "Subnet configurations"
}
```

Các loại có sẵn:

- Nguyên thủy: `string`, `number`, `bool`
- Tổ hợp: `list(type)`, `set(type)`, `map(type)`, `object({...})`, `tuple([...])`
- Đặc biệt: `any` (chấp nhận mọi loại)

## Bình luận và tài liệu

Viết bình luận rõ ràng để giải thích các quyết định không rõ ràng:

```hcl
# Create VPC with DNS support enabled
# We need DNS hostnames for RDS endpoints
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true  # Required for RDS
  enable_dns_support   = true

  tags = {
    Name = "main-vpc"
  }
}

/*
  Security group for web tier

  Allows inbound HTTP and HTTPS from anywhere
  Allows outbound traffic to database tier only

  Note: Don't allow SSH (22) from 0.0.0.0/0 in production
*/
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id

  # ... rules ...
}
```

Sử dụng các mô tả biến để ghi lại thông tin đầu vào:

```hcl
variable "instance_type" {
  type        = string
  description = "EC2 instance type. Use t3.micro for dev, t3.medium for prod"
  default     = "t3.micro"
}
```

## Ví dụ thực tế: Xây dựng một máy chủ web

Đây là một ví dụ hoàn chỉnh kết hợp các khái niệm này:

```hcl
# Variables for customization
variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

variable "project" {
  type    = string
  default = "webapp"
}

variable "allowed_ssh_ips" {
  type        = list(string)
  description = "IPs allowed to SSH"
  default     = []
}

# Local values
locals {
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  instance_type = var.environment == "prod" ? "t3.large" : "t3.micro"
  instance_name = "${var.project}-${var.environment}-web"
}

# Security group with dynamic ingress rules
resource "aws_security_group" "web" {
  name        = "${local.instance_name}-sg"
  description = "Security group for ${local.instance_name}"
  vpc_id      = aws_vpc.main.id

  # HTTP and HTTPS for everyone
  dynamic "ingress" {
    for_each = [80, 443]
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow ${ingress.value == 80 ? "HTTP" : "HTTPS"}"
    }
  }

  # SSH only for specified IPs
  dynamic "ingress" {
    for_each = length(var.allowed_ssh_ips) > 0 ? [1] : []
    content {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = var.allowed_ssh_ips
      description = "SSH access"
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.instance_name}-sg"
    }
  )
}

# Web server instance
resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = local.instance_type
  vpc_security_group_ids = [aws_security_group.web.id]
  subnet_id              = aws_subnet.public.id

  user_data = templatefile("${path.module}/init.sh", {
    hostname    = local.instance_name
    environment = var.environment
  })

  tags = merge(
    local.common_tags,
    {
      Name = local.instance_name
    }
  )
}

# Output useful information
output "instance_id" {
  value       = aws_instance.web.id
  description = "ID of the web server instance"
}

output "public_ip" {
  value       = aws_instance.web.public_ip
  description = "Public IP address"
}

output "ssh_command" {
  value       = "ssh ubuntu@${aws_instance.web.public_ip}"
  description = "Command to SSH into the instance"
}
```

Ví dụ này chứng minh:

- Các biến có ràng buộc về kiểu và mặc định
- Giá trị cục bộ cho các giá trị được tính toán và chia sẻ
- Biểu thức có điều kiện cho các cài đặt dành riêng cho môi trường
- Khối động cho cấu hình tài nguyên linh hoạt
- Nội suy chuỗi và hàm
- Hợp nhất bản đồ cho thẻ
- Tệp mẫu cho dữ liệu người dùng
- Xóa kết quả đầu ra với mô tả

Hiểu các tính năng ngôn ngữ này cho phép bạn viết các cấu hình Terraform linh hoạt, có thể bảo trì. Tiếp theo, chúng ta sẽ khám phá sâu hơn các tài nguyên và nguồn dữ liệu, xem cách tạo và truy vấn cơ sở hạ tầng.
