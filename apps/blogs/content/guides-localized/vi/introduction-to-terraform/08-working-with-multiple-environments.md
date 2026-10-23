---
title: "Quản lý nhiều môi trường với Terraform"
description: Tìm hiểu các chiến lược xử lý quá trình phát triển, cơ sở hạ tầng staging và production với cùng mã Terraform
order: 8
---

**TLDR**: Sử dụng không gian làm việc để phân tách môi trường đơn giản bằng mã dùng chung. Đối với các thiết lập phức tạp, hãy sử dụng các thư mục riêng biệt với các mô-đun dùng chung và các tệp biến dành riêng cho môi trường. Không bao giờ chia sẻ tệp trạng thái giữa các môi trường. Mã cấu trúc để các môi trường bị cô lập nhưng chia sẻ các mẫu chung thông qua các mô-đun.

Hầu hết các dự án đều cần nhiều môi trường - phát triển để thử nghiệm các thay đổi, staging để thử nghiệm tích hợp và production để thử nghiệm lưu lượng truy cập trực tiếp. Terraform cung cấp một số cách tiếp cận để quản lý các môi trường này.

## Không gian làm việc: Tách môi trường đơn giản

Không gian làm việc Terraform cho phép bạn duy trì nhiều tệp trạng thái từ cùng một cấu hình. Mỗi không gian làm việc có trạng thái riêng.

### Hiểu không gian làm việc

Theo mặc định, bạn làm việc trong không gian làm việc "mặc định". Tạo thêm không gian làm việc cho các môi trường khác:

```bash
# List workspaces
terraform workspace list

# Create new workspace
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch between workspaces
terraform workspace select dev
terraform workspace select prod

# Show current workspace
terraform workspace show
```

Khi bạn chuyển đổi không gian làm việc, Terraform sẽ sử dụng tệp trạng thái khác. Điều này cho phép bạn tạo cùng một cơ sở hạ tầng trong nhiều môi trường.

### Sử dụng không gian làm việc hiện tại trong cấu hình

Tham chiếu tên không gian làm việc hiện tại trong cấu hình của bạn:

```hcl
locals {
  environment = terraform.workspace

  # Environment-specific settings
  instance_count = terraform.workspace == "prod" ? 5 : 1
  instance_type  = terraform.workspace == "prod" ? "t3.large" : "t3.micro"
}

resource "aws_instance" "web" {
  count         = local.instance_count
  ami           = data.aws_ami.ubuntu.id
  instance_type = local.instance_type

  tags = {
    Name        = "web-${terraform.workspace}-${count.index}"
    Environment = terraform.workspace
  }
}

output "environment" {
  value = "Deployed to ${terraform.workspace}"
}
```

Triển khai đến các môi trường khác nhau:

```bash
# Deploy to dev
terraform workspace select dev
terraform apply

# Deploy to prod
terraform workspace select prod
terraform apply
```

### Giới hạn không gian làm việc

Không gian làm việc hoạt động tốt trong các tình huống đơn giản nhưng có những hạn chế:

**Cùng backend**: Tất cả các không gian làm việc đều sử dụng cùng một backend. Bạn không thể có nhà phát triển trong một tài khoản AWS và nhà sản xuất ở tài khoản khác.

**Dễ mắc lỗi**: Chuyển sang không gian làm việc sai và chạy `apply` có thể sửa đổi sai môi trường.

**Cấu hình ngầm định**: Không gian làm việc nào có nghĩa là môi trường nào không rõ ràng từ mã.

**Không cách ly**: Tất cả các không gian làm việc đều có chung mã và backend. Một thay đổi xấu ảnh hưởng đến tất cả các môi trường.

Đối với các hệ thống production, các giới hạn về không gian làm việc thường đẩy các nhóm tiến tới việc tách biệt dựa trên thư mục.

## Môi trường dựa trên thư mục

Một cách tiếp cận mạnh mẽ hơn: các thư mục riêng biệt cho từng môi trường, chia sẻ mã thông qua các mô-đun.

### Cấu trúc thư mục

```
terraform/
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── web_server/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── database/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── environments/
    ├── dev/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── terraform.tfvars
    │   └── backend.tf
    ├── staging/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── terraform.tfvars
    │   └── backend.tf
    └── prod/
        ├── main.tf
        ├── variables.tf
        ├── terraform.tfvars
        └── backend.tf
```

Mỗi thư mục môi trường có thư mục riêng:

- Tệp trạng thái (backend riêng)
- Giá trị biến
- Cấu hình nhà cung cấp

Nhưng tất cả đều sử dụng cùng một mô-đun, giữ cho các mô hình cơ sở hạ tầng nhất quán.

### Ví dụ: Môi trường phát triển

```hcl
# environments/dev/main.tf
terraform {
  required_version = "~> 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "dev"
      ManagedBy   = "terraform"
      Project     = var.project
    }
  }
}

module "vpc" {
  source = "../../modules/vpc"

  cidr_block         = var.vpc_cidr
  availability_zones = var.availability_zones
  name              = "${var.project}-dev"
}

module "web_servers" {
  source = "../../modules/web_server"

  count = var.web_server_count

  name          = "${var.project}-dev-web-${count.index}"
  vpc_id        = module.vpc.vpc_id
  subnet_id     = module.vpc.public_subnets[count.index % length(module.vpc.public_subnets)]
  ami_id        = var.web_server_ami
  instance_type = var.web_server_instance_type
}

module "database" {
  source = "../../modules/database"

  identifier        = "${var.project}-dev-db"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnets
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
}
```

Các biến phát triển trong `environments/dev/terraform.tfvars`:

```hcl
# environments/dev/terraform.tfvars
project            = "webapp"
aws_region         = "us-east-1"
availability_zones = ["us-east-1a", "us-east-1b"]

vpc_cidr = "10.0.0.0/16"

web_server_count         = 1
web_server_instance_type = "t3.micro"
web_server_ami           = "ami-0c55b159cbfafe1f0"

db_instance_class    = "db.t3.micro"
db_allocated_storage = 20
```

### Ví dụ: Môi trường production

production sử dụng cùng một mô-đun nhưng có cấu hình khác nhau:

```hcl
# environments/prod/main.tf
terraform {
  required_version = "~> 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "prod/terraform.tfstate"  # Different state file
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "prod"
      ManagedBy   = "terraform"
      Project     = var.project
    }
  }
}

# Same modules, different configurations
module "vpc" {
  source = "../../modules/vpc"

  cidr_block         = var.vpc_cidr
  availability_zones = var.availability_zones
  name              = "${var.project}-prod"
}

module "web_servers" {
  source = "../../modules/web_server"

  count = var.web_server_count

  name          = "${var.project}-prod-web-${count.index}"
  vpc_id        = module.vpc.vpc_id
  subnet_id     = module.vpc.public_subnets[count.index % length(module.vpc.public_subnets)]
  ami_id        = var.web_server_ami
  instance_type = var.web_server_instance_type
}

module "database" {
  source = "../../modules/database"

  identifier        = "${var.project}-prod-db"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnets
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage

  # Production-specific settings
  multi_az               = true
  backup_retention_period = 7
  deletion_protection    = true
}
```

Các biến production trong `environments/prod/terraform.tfvars`:

```hcl
# environments/prod/terraform.tfvars
project            = "webapp"
aws_region         = "us-east-1"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

vpc_cidr = "10.1.0.0/16"

web_server_count         = 5
web_server_instance_type = "t3.large"
web_server_ami           = "ami-0c55b159cbfafe1f0"

db_instance_class    = "db.t3.medium"
db_allocated_storage = 100
```

### Làm việc với môi trường dựa trên thư mục

Triển khai cho từng môi trường riêng biệt:

```bash
# Deploy development
cd environments/dev
terraform init
terraform plan
terraform apply

# Deploy production
cd ../prod
terraform init
terraform plan
terraform apply
```

Mỗi môi trường được cách ly hoàn toàn:

- Tách các tệp trạng thái
- Có thể có các tài khoản AWS khác nhau (sử dụng thông tin xác thực của nhà cung cấp khác nhau)
- Hoạt động áp dụng độc lập
- Không có nguy cơ vô tình ảnh hưởng sai môi trường

## Tài nguyên dành riêng cho môi trường

Đôi khi các môi trường cần các tài nguyên cơ bản khác nhau. Sử dụng các điều kiện hoặc cấu hình riêng biệt:

```hcl
# Only create in production
resource "aws_cloudwatch_alarm" "high_cpu" {
  count = var.environment == "prod" ? 1 : 0

  alarm_name          = "high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 80

  alarm_actions = [aws_sns_topic.alerts[0].arn]
}

# SNS topic only in production
resource "aws_sns_topic" "alerts" {
  count = var.environment == "prod" ? 1 : 0
  name  = "infrastructure-alerts"
}
```

Hoặc tốt hơn, hãy làm rõ điều này trong mã dành riêng cho môi trường:

```hcl
# environments/prod/monitoring.tf
resource "aws_cloudwatch_alarm" "high_cpu" {
  # Production monitoring configuration
}

resource "aws_sns_topic" "alerts" {
  # Production alerting configuration
}
```

Development và staging không có các tệp này, điều này làm cho sự khác biệt trở nên rõ ràng.

## Cấu hình được chia sẻ với Terragrunt

Terragrunt là một công cụ bổ sung thêm chức năng cho Terraform, đặc biệt hữu ích để quản lý nhiều môi trường.

Cài đặt Terragrunt:

```bash
# macOS
brew install terragrunt

# Linux
wget https://github.com/gruntwork-io/terragrunt/releases/download/v0.54.0/terragrunt_linux_amd64
chmod +x terragrunt_linux_amd64
sudo mv terragrunt_linux_amd64 /usr/local/bin/terragrunt
```

Cấu trúc với Terragrunt:

```
terraform/
├── modules/
│   └── web_server/
│       └── main.tf
├── terragrunt.hcl  # Root configuration
└── environments/
    ├── dev/
    │   └── terragrunt.hcl
    ├── staging/
    │   └── terragrunt.hcl
    └── prod/
        └── terragrunt.hcl
```

Root `terragrunt.hcl` với cấu hình được chia sẻ:

```hcl
# terragrunt.hcl
remote_state {
  backend = "s3"
  config = {
    bucket         = "mycompany-terraform-state"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

`terragrunt.hcl` dành riêng cho môi trường:

```hcl
# environments/dev/terragrunt.hcl
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../modules//web_server"
}

inputs = {
  environment   = "dev"
  instance_type = "t3.micro"
  instance_count = 1
}
```

```hcl
# environments/prod/terragrunt.hcl
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../modules//web_server"
}

inputs = {
  environment   = "prod"
  instance_type = "t3.large"
  instance_count = 5
}
```

Sử dụng Terragrunt thay vì Terraform:

```bash
cd environments/dev
terragrunt plan
terragrunt apply
```

Terragrunt giảm sự trùng lặp trong khi vẫn cách ly môi trường.

## Tài liệu tham khảo đa môi trường

Đôi khi các môi trường cần tham chiếu lẫn nhau (nhà phát triển cần ID VPC sản phẩm để kết nối VPC). Sử dụng các nguồn dữ liệu có tham chiếu trạng thái rõ ràng.

Trong production, xuất ID VPC:

```hcl
# environments/prod/outputs.tf
output "vpc_id" {
  value = module.vpc.vpc_id
}
```

Trong quá trình phát triển, hãy đọc trạng thái của sản phẩm:

```hcl
# environments/dev/main.tf
data "terraform_remote_state" "prod" {
  backend = "s3"
  config = {
    bucket = "mycompany-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_vpc_peering_connection" "dev_to_prod" {
  vpc_id      = module.vpc.vpc_id
  peer_vpc_id = data.terraform_remote_state.prod.outputs.vpc_id

  tags = {
    Name = "dev-to-prod-peering"
  }
}
```

Sử dụng điều này một cách tiết kiệm. Quá nhiều tham chiếu đa môi trường tạo ra sự liên kết chặt chẽ.

## Chọn một cách tiếp cận

**Sử dụng không gian làm việc khi:**

- Địa hình học tập
- Thiết lập đơn giản với môi trường giống hệt nhau
- Tất cả môi trường trong cùng một tài khoản/đăng ký AWS
- Đội ngũ nhỏ và phối hợp dễ dàng

**Sử dụng tính năng phân tách dựa trên thư mục khi:**

- Môi trường ở các tài khoản khác nhau
- production cần kiểm soát truy cập nghiêm ngặt
- Môi trường khác nhau đáng kể
- Nhiều thành viên trong nhóm làm việc trên cơ sở hạ tầng
- Bạn cần sự cách ly mạnh mẽ giữa các môi trường

Hầu hết các hệ thống production đều được hưởng lợi từ việc phân tách dựa trên thư mục. Cấu trúc bổ sung ngăn ngừa sai sót và làm rõ sự khác biệt giữa các môi trường.

## Ví dụ thực tế: Hoàn tất thiết lập đa môi trường

Đây là cấu trúc thư mục thực tế:

```
terraform/
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── database/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── environments/
    ├── dev/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   ├── backend.tf
    │   └── terraform.tfvars
    ├── staging/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   ├── backend.tf
    │   └── terraform.tfvars
    └── prod/
        ├── main.tf
        ├── variables.tf
        ├── outputs.tf
        ├── backend.tf
        ├── terraform.tfvars
        └── monitoring.tf  # Production-only resources
```

Mỗi môi trường độc lập nhưng sử dụng các mô-đun dùng chung. Các thay đổi đối với mô-đun lan truyền tới tất cả các môi trường, nhưng mỗi môi trường sẽ kiểm soát thời điểm áp dụng những thay đổi đó.

Hiểu cách quản lý môi trường giúp bạn mở rộng quy mô Terraform từ một môi trường thử nghiệm duy nhất sang thiết lập đa môi trường sẵn sàng cho production. Tiếp theo, chúng tôi sẽ đề cập đến backend từ xa và cộng tác nhóm - cách làm việc trên Terraform với nhiều người một cách an toàn.
