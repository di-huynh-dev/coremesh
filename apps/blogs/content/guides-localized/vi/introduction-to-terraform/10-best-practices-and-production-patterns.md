---
title: "Thực hành tốt và các mẫu triển khai Terraform trong production"
description: Tìm hiểu các mẫu đã được chứng minh để viết mã Terraform có thể bảo trì và vận hành nó một cách an toàn trong production
order: 10
---

**TLDR**: Sử dụng cách đặt tên và tổ chức tệp nhất quán. Phiên bản nhà cung cấp pin. Giữ các mô-đun nhỏ và tập trung. Không bao giờ bí mật commit. Sử dụng nguồn dữ liệu thay vì giá trị mã hóa cứng. Kiểm tra các thay đổi trong dev trước production. Luôn chạy kế hoạch trước khi áp dụng. Ghi lại cơ sở hạ tầng của bạn. Triển khai xác thực tự động trong CI/CD.

Sau khi làm việc với Terraform một thời gian, một số mẫu nhất định xuất hiện giúp mã dễ bảo trì hơn và hoạt động an toàn hơn. Phần này bao gồm các bài thực hành đã học được khi chạy Terraform trong production.

## Mã tổ chức

### Cấu trúc tệp

Sử dụng cách đặt tên tệp nhất quán cho các dự án:

```
terraform/
├── main.tf              # Primary resource definitions
├── variables.tf         # Input variable declarations
├── outputs.tf           # Output declarations
├── providers.tf         # Provider configurations
├── backend.tf           # Backend configuration
├── data.tf              # Data source definitions
├── locals.tf            # Local value definitions
├── versions.tf          # Terraform and provider version constraints
└── README.md            # Documentation
```

Đối với các dự án lớn hơn, hãy chia `main.tf` theo loại tài nguyên:

```
terraform/
├── network.tf           # VPC, subnets, route tables
├── compute.tf           # EC2 instances, ASGs
├── database.tf          # RDS, ElastiCache
├── security.tf          # Security groups, IAM roles
├── monitoring.tf        # CloudWatch alarms, dashboards
├── variables.tf
├── outputs.tf
├── providers.tf
└── backend.tf
```

### Quy ước đặt tên

Sử dụng cách đặt tên nhất quán cho tài nguyên:

```hcl
# Pattern: <resource_type>_<descriptive_name>
resource "aws_vpc" "main" { ... }
resource "aws_subnet" "public_web" { ... }
resource "aws_instance" "web_server" { ... }

# Not: generic names
resource "aws_vpc" "vpc1" { ... }          # Too generic
resource "aws_instance" "server" { ... }   # Not descriptive
```

Sử dụng tên có ý nghĩa trong thẻ:

```hcl
resource "aws_instance" "web" {
  # ...

  tags = {
    Name        = "${var.project}-${var.environment}-web-${count.index + 1}"
    Environment = var.environment
    Project     = var.project
    ManagedBy   = "terraform"
    Component   = "web-tier"
  }
}
```

Điều này giúp dễ dàng xác định tài nguyên trong bảng điều khiển AWS và trong báo cáo chi phí.

## Ghim phiên bản

Luôn ghim các phiên bản Terraform và nhà cung cấp để tránh những thay đổi không mong muốn:

```hcl
terraform {
  required_version = "~> 1.6.0"  # Allow 1.6.x but not 1.7.0

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"  # Allow 5.x but not 6.0
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}
```

Nếu không ghim, việc chạy `terraform init` có thể tải xuống phiên bản nhà cung cấp mới có những thay đổi đáng chú ý.

Toán tử `~>` cho phép thành phần phiên bản ngoài cùng bên phải tăng:

- `~> 1.6.0` khớp với `1.6.1`, `1.6.2`, nhưng không khớp với `1.7.0`
- `~> 1.6` khớp với `1.6.0`, `1.7.0`, nhưng không khớp với `2.0.0`

## Quản lý biến

### Sử dụng xác thực

Bắt lỗi trước khi thay đổi cơ sở hạ tầng:

```hcl
variable "environment" {
  type = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "instance_count" {
  type = number

  validation {
    condition     = var.instance_count > 0 && var.instance_count <= 10
    error_message = "Instance count must be between 1 and 10."
  }
}

variable "cidr_block" {
  type = string

  validation {
    condition     = can(cidrhost(var.cidr_block, 0))
    error_message = "Must be a valid CIDR block."
  }
}
```

### Cung cấp mô tả

Ghi lại công dụng của từng biến:

```hcl
variable "instance_type" {
  description = "EC2 instance type. Use t3.micro for dev/staging, t3.large for prod"
  type        = string
  default     = "t3.micro"
}

variable "backup_retention_days" {
  description = <<-EOT
    Number of days to retain backups.
    Minimum 7 for compliance.
    Recommended: 30 for production, 7 for non-production.
  EOT
  type        = number
  default     = 7

  validation {
    condition     = var.backup_retention_days >= 7
    error_message = "Backup retention must be at least 7 days for compliance."
  }
}
```

### Sử dụng ràng buộc loại

Chỉ định chính xác các loại để sớm phát hiện lỗi:

```hcl
variable "server_config" {
  description = "Server configuration"
  type = object({
    instance_type = string
    disk_size     = number
    ami_id        = string
    tags          = map(string)
  })

  default = {
    instance_type = "t3.micro"
    disk_size     = 20
    ami_id        = "ami-0c55b159cbfafe1f0"
    tags          = {}
  }
}
```

Điều này ngăn chặn việc truyền cấu trúc dữ liệu không chính xác.

## Quản lý tài nguyên

### Sử dụng nguồn dữ liệu

Truy vấn cơ sở hạ tầng hiện có thay vì các giá trị mã hóa cứng:

```hcl
# Good - dynamic
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "web" {
  ami = data.aws_ami.ubuntu.id
  # ...
}

# Bad - hardcoded AMI ID becomes outdated
resource "aws_instance" "web" {
  ami = "ami-0c55b159cbfafe1f0"
  # ...
}
```

### Sử dụng quy tắc vòng đời một cách thích hợp

Bảo vệ các tài nguyên quan trọng:

```hcl
resource "aws_db_instance" "production" {
  identifier = "prod-db"
  # ...

  lifecycle {
    prevent_destroy = true  # Can't accidentally delete production database
  }
}

resource "aws_launch_template" "web" {
  name_prefix = "web-"
  # ...

  lifecycle {
    create_before_destroy = true  # Zero-downtime updates
  }
}
```

### Tránh tính số lượng tài nguyên có trạng thái

Sử dụng `for_each` thay vì `count` cho cơ sở dữ liệu, volume và các tài nguyên có trạng thái khác:

```hcl
# Good - adding/removing items doesn't affect others
variable "databases" {
  type = map(object({
    allocated_storage = number
    instance_class    = string
  }))

  default = {
    users = {
      allocated_storage = 100
      instance_class    = "db.t3.medium"
    }
    orders = {
      allocated_storage = 200
      instance_class    = "db.t3.large"
    }
  }
}

resource "aws_db_instance" "databases" {
  for_each = var.databases

  identifier        = each.key
  allocated_storage = each.value.allocated_storage
  instance_class    = each.value.instance_class
  # ...
}

# Bad - removing the first item renumbers everything
resource "aws_db_instance" "databases" {
  count = length(var.database_names)

  identifier = var.database_names[count.index]
  # ...
}
```

Với `count`, việc xóa cơ sở dữ liệu đầu tiên trong danh sách sẽ khiến Terraform phá hủy và tạo lại tất cả các cơ sở dữ liệu khác.

## Mẫu mô-đun

### Giữ mô-đun nhỏ

Mỗi mô-đun nên làm tốt một việc:

```
# Good - focused modules
modules/
├── vpc/                 # Just networking
├── ec2_instance/        # Just compute
├── rds_database/        # Just database
└── alb/                 # Just load balancing

# Bad - too broad
modules/
└── complete_infrastructure/  # Everything in one module
```

### Sử dụng thành phần mô-đun

Kết hợp các mô-đun nhỏ thành các mẫu lớn hơn:

```hcl
# High-level module that composes smaller modules
module "web_application" {
  source = "./modules/web_application"

  # This module internally uses:
  # - vpc module
  # - ec2_instance module
  # - alb module
  # - rds_database module
}
```

### Phiên bản mô-đun của bạn

Gắn thẻ các mô-đun với phiên bản ngữ nghĩa:

```bash
git tag -a v1.0.0 -m "Initial release"
git tag -a v1.1.0 -m "Added monitoring"
git tag -a v2.0.0 -m "Breaking: changed variable names"
git push --tags
```

Tham khảo các phiên bản cụ thể:

```hcl
module "vpc" {
  source = "git::https://github.com/myorg/terraform-modules.git//vpc?ref=v1.0.0"
  # ...
}
```

Điều này ngăn chặn những thay đổi đột phá ảnh hưởng đến cơ sở hạ tầng hiện có.

## Quản lý trạng thái

### Sử dụng Remote trạng thái có khóa

Không bao giờ sử dụng trạng thái cục bộ cho production. Luôn định cấu hình backend từ xa:

```hcl
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

### Tách trạng thái theo môi trường

Không bao giờ chia sẻ trạng thái giữa các môi trường:

```
state/
├── dev/terraform.tfstate
├── staging/terraform.tfstate
└── prod/terraform.tfstate
```

### Kích hoạt phiên bản trạng thái

Sử dụng phiên bản S3 hoặc tương tự để duy trì lịch sử trạng thái:

```bash
aws s3api put-bucket-versioning \
  --bucket mycompany-terraform-state \
  --versioning-configuration Status=Enabled
```

Điều này cho phép bạn khôi phục sau khi trạng thái bị hỏng.

## Thực hành bảo mật

### Không bao giờ có bí mật commit

Sử dụng các biến môi trường hoặc trình quản lý bí mật:

```hcl
# Good - from environment variable
variable "database_password" {
  type      = string
  sensitive = true
}

# Set via: export TF_VAR_database_password="secret"

# Better - from secret manager
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "prod/database/password"
}

resource "aws_db_instance" "main" {
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
  # ...
}
```

### Sử dụng đặc quyền tối thiểu IAM

Chỉ cấp các quyền cần thiết:

```hcl
data "aws_iam_policy_document" "instance_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "instance" {
  name               = "instance-role"
  assume_role_policy = data.aws_iam_policy_document.instance_assume_role.json
}

# Grant specific permissions, not full access
data "aws_iam_policy_document" "instance" {
  statement {
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.app_data.arn,
      "${aws_s3_bucket.app_data.arn}/*",
    ]
  }
}

resource "aws_iam_role_policy" "instance" {
  name   = "instance-policy"
  role   = aws_iam_role.instance.id
  policy = data.aws_iam_policy_document.instance.json
}
```

### Thẻ đầu ra nhạy cảm

Ngăn chặn bí mật xuất hiện trong nhật ký:

```hcl
output "database_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "database_password" {
  value     = aws_db_instance.main.password
  sensitive = true  # Won't show in console output
}
```

## Kiểm tra và xác nhận

### Sử dụng địa hình fmt

Định dạng mã nhất quán:

```bash
terraform fmt -recursive
```

Thêm phần này vào CI pipeline của bạn:

```bash
terraform fmt -check -recursive || exit 1
```

### Xác thực cấu hình

Kiểm tra lỗi cú pháp:

```bash
terraform validate
```

### Sử dụng tflint

Cài đặt xác nhận bổ sung:

```bash
# Install tflint
brew install tflint  # macOS
# or download from https://github.com/terraform-linters/tflint

# Run it
tflint
```

Định cấu hình tflint trong `.tflint.hcl`:

```hcl
plugin "aws" {
  enabled = true
  version = "0.27.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

rule "terraform_naming_convention" {
  enabled = true
}

rule "terraform_documented_variables" {
  enabled = true
}
```

### Lên kế hoạch trước khi nộp đơn

Luôn xem xét các thay đổi:

```bash
# Save the plan
terraform plan -out=tfplan

# Review it carefully
terraform show tfplan

# Apply the exact plan
terraform apply tfplan
```

Không bao giờ chạy `terraform apply -auto-approve` trong production mà không xem lại kế hoạch trước.

### Thử nghiệm trong quá trình phát triển đầu tiên

Không bao giờ kiểm tra các thay đổi trực tiếp trong production:

1. Áp dụng cho môi trường dev
2. Xác minh mọi thứ hoạt động
3. Áp dụng cho staging
4. Xác minh lại
5. Áp dụng cho production

## Tích hợp CI/CD

Tự động hóa các hoạt động của Terraform để đảm bảo tính nhất quán:

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
      - 'terraform/**'
  push:
    branches: [main]
    paths:
      - 'terraform/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.6.5

      - name: Terraform Format Check
        run: terraform fmt -check -recursive
        working-directory: terraform

      - name: Terraform Init
        run: terraform init
        working-directory: terraform/environments/dev

      - name: Terraform Validate
        run: terraform validate
        working-directory: terraform/environments/dev

      - name: Run tflint
        uses: terraform-linters/setup-tflint@v3
        with:
          tflint_version: latest

      - name: Initialize tflint
        run: tflint --init
        working-directory: terraform/environments/dev

      - name: Run tflint
        run: tflint --recursive
        working-directory: terraform/environments/dev

  plan:
    needs: validate
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2

      - name: Terraform Init
        run: terraform init
        working-directory: terraform/environments/dev

      - name: Terraform Plan
        run: terraform plan -no-color
        working-directory: terraform/environments/dev
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

  apply:
    needs: validate
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2

      - name: Terraform Init
        run: terraform init
        working-directory: terraform/environments/dev

      - name: Terraform Apply
        run: terraform apply -auto-approve
        working-directory: terraform/environments/dev
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

Quy trình công việc này:

- Xác thực định dạng và cú pháp trên mỗi PR
- Chạy kế hoạch PR để cho thấy những gì sẽ thay đổi
- Áp dụng các thay đổi khi hợp nhất vào chính
- Bắt lỗi trước khi chúng đạt tới production

## Tài liệu

### Tệp README

Mọi dự án Terraform đều phải có README:

```markdown
# Production Infrastructure

Terraform configuration for production environment.

## Prerequisites

- Terraform 1.6.x
- AWS CLI configured
- Access to terraform-state S3 bucket

## Usage

\`\`\`bash
cd terraform/environments/prod
terraform init
terraform plan
terraform apply
\`\`\`

## Architecture

- VPC: 10.1.0.0/16
- 3 AZs with public and private subnets
- NAT gateways for private subnet internet access
- Application load balancer for web tier
- RDS Multi-AZ for database

## Variables

See `variables.tf` for all available options.

Required variables:
- `database_password`: Set via `TF_VAR_database_password`

## Outputs

After applying:
- `load_balancer_dns`: Application endpoint
- `database_endpoint`: Database connection string

## Disaster Recovery

State is versioned in S3. To restore:

\`\`\`bash
aws s3api list-object-versions --bucket mycompany-terraform-state --prefix prod/
# Find the version ID you want to restore
aws s3api get-object --bucket mycompany-terraform-state --key prod/terraform.tfstate --version-id VERSION_ID terraform.tfstate
\`\`\`
```

### Tài liệu nội tuyến

Sử dụng nhận xét cho các quyết định không rõ ràng:

```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  # Disable source/dest check for NAT functionality
  source_dest_check = false

  # Use GP3 for better price/performance ratio
  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    iops        = 3000  # GP3 includes 3000 IOPS at base cost
  }

  # User data runs on first boot only
  # For configuration changes, update the AMI instead
  user_data = templatefile("${path.module}/init.sh", {
    environment = var.environment
  })
}
```

## Giám sát và cảnh báo

Theo dõi hoạt động của Terraform:

```hcl
resource "aws_cloudwatch_log_group" "terraform" {
  name              = "/terraform/runs"
  retention_in_days = 30
}

resource "aws_sns_topic" "terraform_alerts" {
  name = "terraform-alerts"
}

resource "aws_cloudwatch_metric_alarm" "state_lock_held" {
  alarm_name          = "terraform-state-lock-held-too-long"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "LockHeldDuration"
  namespace           = "Terraform"
  period              = 3600
  statistic           = "Maximum"
  threshold           = 1800  # 30 minutes

  alarm_actions = [aws_sns_topic.terraform_alerts.arn]
}
```

## Phát hiện trôi dạt

Kiểm tra xem cơ sở hạ tầng có được sửa đổi bên ngoài Terraform hay không:

```bash
# Show differences between state and reality
terraform plan -detailed-exitcode

# Exit code 2 means drift detected
```

Tự động hóa việc này bằng các lần chạy theo lịch trình:

```yaml
# .github/workflows/drift-detection.yml
name: Drift Detection

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  detect-drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2

      - name: Terraform Init
        run: terraform init
        working-directory: terraform/environments/prod

      - name: Detect Drift
        run: terraform plan -detailed-exitcode
        working-directory: terraform/environments/prod
        continue-on-error: true
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Notify on Drift
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Drift detected in production infrastructure!"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Các bước tiếp theo

Bây giờ bạn đã có nền tảng để sử dụng Terraform một cách hiệu quả. Hãy cân nhắc việc khám phá:

- **Terraform Cloud**: Dịch vụ được quản lý với nhiều tính năng hơn
- **Chính sách dưới dạng Code**: Sử dụng Sentinel hoặc OPA để tuân thủ
- **Testing**: Các công cụ như Terratest để kiểm tra cơ sở hạ tầng
- **Mô-đun nâng cao**: Nghiên cứu các mô-đun phổ biến cho các mẫu
- **Đa khu vực**: Chiến lược cho cơ sở hạ tầng toàn cầu

Hệ sinh thái Terraform rất lớn và năng động. Tham gia cộng đồng, đọc tài liệu của nhà cung cấp và tiếp tục học hỏi kinh nghiệm của người khác. Cơ sở hạ tầng dưới dạng mã là một hành trình - những phương pháp thực hành này sẽ giúp bạn xây dựng các hệ thống có thể bảo trì và mở rộng quy mô.
