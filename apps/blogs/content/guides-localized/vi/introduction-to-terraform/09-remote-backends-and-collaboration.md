---
title: "Backend từ xa và cộng tác nhóm"
description: Tìm hiểu cách lưu trữ Terraform trạng thái từ xa và làm việc an toàn với các nhóm bằng cách sử dụng khóa và kiểm soát phiên bản trạng thái
order: 9
---

**TLDR**: Lưu trữ trạng thái từ xa (S3, Azure Blob, GCS, Terraform Cloud) để các nhóm chia sẻ cùng một trạng thái. Bật khóa trạng thái để ngăn sửa đổi đồng thời. Giữ dữ liệu nhạy cảm được mã hóa. Sử dụng kiểm soát phiên bản cho các tệp cấu hình (không phải trạng thái). Triển khai quy trình phê duyệt các thay đổi của production.

Khi làm việc một mình, các tệp trạng thái cục bộ hoạt động tốt. Đối với các nhóm, backend từ xa rất cần thiết cho sự cộng tác, bảo mật và độ tin cậy.

## Tại sao backend từ xa lại quan trọng

trạng thái cục bộ tạo ra các vấn đề trên quy mô lớn:

**Không cộng tác**: Các thành viên trong nhóm không thể biết cơ sở hạ tầng nào tồn tại hoặc những thay đổi mà người khác đang thực hiện.

**Dễ bị mất**: Nếu máy tính xách tay của ai đó bị lỗi, tệp trạng thái sẽ biến mất. Việc tái tạo nó rất khó khăn và dễ xảy ra lỗi.

**Không khóa**: Hai người chạy `terraform apply` đồng thời làm hỏng trạng thái.

**H Khó bảo mật**: Các tệp trạng thái chứa dữ liệu nhạy cảm. Việc giữ chúng an toàn trên từng máy tính xách tay là điều khó khăn.

**Không có lịch sử**: Bạn không thể thấy điều gì đã thay đổi khi hoặc quay lại trạng thái trước đó.

backend từ xa giải quyết những vấn đề này bằng cách lưu trữ trạng thái tập trung bằng tính năng khóa, mã hóa và lập phiên bản.

## S3 backend (AWS)

backend từ xa phổ biến nhất sử dụng AWS S3 để lưu trữ và DynamoDB để khóa.

### Đang thiết lập S3 backend

Tạo nhóm S3 cho trạng thái:

```bash
aws s3api create-bucket \
  --bucket mycompany-terraform-state \
  --region us-east-1

# Enable versioning for state history
aws s3api put-bucket-versioning \
  --bucket mycompany-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket mycompany-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket mycompany-terraform-state \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

Tạo bảng DynamoDB để khóa:

```bash
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

Định cấu hình backend trong mã Terraform của bạn:

```hcl
# backend.tf
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

Khởi tạo để di chuyển trạng thái cục bộ hiện có:

```bash
terraform init

# Terraform asks if you want to copy existing state to S3
# Type 'yes' to migrate
```

trạng thái của bạn hiện được lưu trữ từ xa. Các thành viên trong nhóm có thể truy cập nó bằng cách định cấu hình cùng một backend.

### S3 backend với các môi trường khác nhau

Sử dụng các tệp trạng thái khác nhau cho từng môi trường:

```hcl
# environments/dev/backend.tf
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

```hcl
# environments/prod/backend.tf
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

Điều này giúp tách biệt các trạng thái môi trường trong khi sử dụng cùng một nhóm.

### Khóa trạng thái bằng DynamoDB

Khi ai đó chạy `terraform apply`, Terraform sẽ nhận được khóa trong DynamoDB. Các hoạt động khác chờ cho đến khi khóa được nhả ra.

```
Developer A                DynamoDB Lock Table          Developer B
    │                            │                          │
    │ terraform apply            │                          │
    ├───────────────────────────>│                          │
    │ Lock acquired              │                          │
    │<───────────────────────────┤                          │
    │ Making changes...          │  terraform apply         │
    │                            │<─────────────────────────┤
    │                            │ Lock held by A           │
    │                            ├─────────────────────────>│
    │                            │ Waiting for lock...      │
    │ Changes complete           │                          │
    ├───────────────────────────>│                          │
    │ Lock released              │                          │
    │                            ├─────────────────────────>│
    │                            │ Lock acquired            │
    │                            │<─────────────────────────┤
    │                            │ Making changes...        │
```

Nếu Terraform gặp sự cố, khóa có thể không mở được. Buộc mở khóa:

```bash
terraform force-unlock LOCK_ID
```

Nhận `LOCK_ID` từ thông báo lỗi. Chỉ làm điều này nếu bạn chắc chắn không có ai khác đang chạy Terraform.

## Azure backend

Đối với cơ sở hạ tầng dựa trên Azure, hãy sử dụng Azure Blob Storage:

```bash
# Create resource group
az group create --name terraform-state-rg --location eastus

# Create storage account
az storage account create \
  --name mycompanytfstate \
  --resource-group terraform-state-rg \
  --location eastus \
  --sku Standard_LRS \
  --encryption-services blob

# Create container
az storage container create \
  --name tfstate \
  --account-name mycompanytfstate
```

Định cấu hình backend:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "mycompanytfstate"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}
```

Azure tự động xử lý việc khóa thông qua hợp đồng thuê blob.

## Google Cloud backend

Đối với GCP:

```bash
# Create bucket
gsutil mb gs://mycompany-terraform-state

# Enable versioning
gsutil versioning set on gs://mycompany-terraform-state
```

Định cấu hình backend:

```hcl
terraform {
  backend "gcs" {
    bucket = "mycompany-terraform-state"
    prefix = "prod"
  }
}
```

GCS tự động cung cấp khóa.

## Đám mây địa hình

Terraform Cloud (trước đây là Terraform Enterprise) là dịch vụ được quản lý bởi HashiCorp. Nó cung cấp trạng thái từ xa, khóa, giao diện người dùng web và tích hợp CI/CD.

### Thiết lập đám mây Terraform

Tạo tài khoản tại [app.terraform.io](https://app.terraform.io).

Tạo một tổ chức và không gian làm việc thông qua giao diện người dùng web.

Tạo mã thông báo API:

```bash
terraform login
```

Điều này tạo ra `~/.terraform.d/credentials.tfrc.json` bằng mã thông báo của bạn.

Định cấu hình backend:

```hcl
terraform {
  cloud {
    organization = "mycompany"

    workspaces {
      name = "production"
    }
  }
}
```

Khởi tạo và di chuyển trạng thái:

```bash
terraform init
```

Đám mây Terraform cung cấp:

- Giao diện người dùng web để xem tài nguyên và trạng thái
- Thực thi từ xa (chạy trong Terraform Cloud, không chạy cục bộ)
- Chính sách dưới dạng mã với Sentinel
- Dự toán chi phí
- Đăng ký mô-đun riêng
- Kiểm soát truy cập nhóm
- Chạy lịch sử và nhật ký kiểm tra

Đối với các nhóm, Terraform Cloud đơn giản hóa việc cộng tác một cách đáng kể.

## Thực tiễn tốt nhất về kiểm soát phiên bản

Lưu trữ cấu hình Terraform trong Git, nhưng không bao giờ lưu trữ tệp hoặc thông tin xác thực commit trạng thái.

### .gitignore

Luôn sử dụng `.gitignore` thích hợp:

```gitignore
# Local state files
*.tfstate
*.tfstate.*

# Crash log files
crash.log
crash.*.log

# Exclude override files
override.tf
override.tf.json
*_override.tf
*_override.tf.json

# CLI configuration
.terraformrc
terraform.rc

# Variable files with secrets
*.tfvars
!example.tfvars

# Lock file (some teams commit this, others don't)
# .terraform.lock.hcl

# Terraform cache
.terraform/
.terraform.lock.info
```

### Commit làm gì

commit:

- Tệp cấu hình `*.tf`
- `*.tfvars.example` với các biến ví dụ
- Tài liệu `README.md`
- Mã mô-đun
- Kịch bản tự động hóa

Đừng commit:

- Các tệp `*.tfstate` trạng thái
- Tệp `*.tfvars` có giá trị thực
- Thông tin xác thực hoặc khóa API
- Thư mục `.terraform/`

### Tệp biến ví dụ

Cung cấp một ví dụ cho thấy những biến nào là cần thiết:

```hcl
# terraform.tfvars.example
aws_region         = "us-east-1"
environment        = "production"
instance_type      = "t3.large"
database_password  = "CHANGE_ME"
allowed_ssh_cidrs  = ["YOUR_IP/32"]
```

Các thành viên trong nhóm sao chép mã này vào `terraform.tfvars` và điền vào các giá trị thực (không phải là đã commit).

## Quy trình làm việc nhóm

Thiết lập quy trình làm việc để cộng tác an toàn:

### Quy trình làm việc pull request

1. **Tạo nhánh** để thay đổi cơ sở hạ tầng
2. **Thực hiện thay đổi** sang cấu hình Terraform
3. **Run `terraform plan`** và lưu kết quả đầu ra
4. **Tạo yêu cầu kéo** với đầu ra kế hoạch
5. **Nhóm đánh giá** những thay đổi
6. **Merge** sau khi được phê duyệt
7. **Apply** những thay đổi trong nhánh chính

Tự động hóa việc này với CI/CD:

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.6.5

      - name: Terraform Init
        run: terraform init
        working-directory: environments/prod

      - name: Terraform Format
        run: terraform fmt -check
        working-directory: environments/prod

      - name: Terraform Validate
        run: terraform validate
        working-directory: environments/prod

      - name: Terraform Plan
        if: github.event_name == 'pull_request'
        run: terraform plan -no-color
        working-directory: environments/prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve
        working-directory: environments/prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

Quy trình công việc này:

- Chạy `plan` trên pull request (thay đổi bản xem trước)
- Chạy `apply` khi hợp nhất vào chính (áp dụng các thay đổi)
- Hiển thị các thay đổi về cơ sở hạ tầng trong pull request
- Yêu cầu phê duyệt trước khi thay đổi xảy ra

### Các phương pháp hay nhất về khóa trạng thái

**Không bao giờ ép buộc mở khóa trừ khi cần thiết**. Hãy kiểm tra với đội trước.

**Keep áp dụng short**. Chạy lâu áp dụng khóa giữ lâu hơn.

**Sử dụng không gian làm việc hoặc thư mục riêng** cho các môi trường để tránh xung đột khóa.

**Giám sát ổ khóa bị kẹt**. Nếu máy tính xách tay của ai đó bị hỏng giữa chừng, hãy mở khóa theo cách thủ công.

## Kiểm soát truy cập

Kiểm soát ai có thể sửa đổi cơ sở hạ tầng:

### Chính sách IAM của AWS

Tạo chính sách IAM cho Terraform:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::mycompany-terraform-state"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::mycompany-terraform-state/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/terraform-locks"
    }
  ]
}
```

Đính kèm phần này với người dùng IAM hoặc vai trò chạy Terraform.

Đối với production, hãy sử dụng các vai trò IAM riêng biệt với các quyền chặt chẽ hơn và yêu cầu MFA.

### Nhóm đám mây Terraform

Terraform Cloud cung cấp khả năng kiểm soát truy cập theo nhóm:

- **Read**: Xem lượt chạy và trạng thái
- **Plan**: Chạy kế hoạch nhưng không áp dụng
- **Write**: Chạy kế hoạch và áp dụng
- **Admin**: Quản lý cài đặt không gian làm việc

Chỉ định các thành viên trong nhóm quyền thích hợp dựa trên vai trò của họ.

## Di chuyển trạng thái giữa backend

Chuyển từ một backend sang người khác rất đơn giản:

```hcl
# Change backend configuration
terraform {
  backend "s3" {
    bucket = "new-bucket"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}
```

Chạy init để di chuyển:

```bash
terraform init -migrate-state
```

Terraform sao chép trạng thái sang backend mới. Xác minh việc di chuyển:

```bash
terraform plan
```

Nếu kế hoạch không có thay đổi thì việc di chuyển đã thành công.

## Xử lý dữ liệu nhạy cảm

Tệp trạng thái chứa thông tin nhạy cảm. Bảo vệ họ:

**Encrypt trạng thái ở phần còn lại**: Sử dụng mã hóa S3, mã hóa Azure hoặc Terraform Cloud (được mã hóa theo mặc định).

**Encrypt trạng thái đang chuyển tiếp**: Sử dụng HTTPS để truy cập S3/Azure/GCS.

**Hạn chế truy cập**: Sử dụng chính sách IAM để giới hạn người có thể đọc trạng thái.

**Sử dụng các biến nhạy cảm**: Đánh dấu các bí mật là nhạy cảm để chúng không xuất hiện trong nhật ký:

```hcl
variable "database_password" {
  type      = string
  sensitive = true
}
```

**Xem xét quản lý bí mật bên ngoài**: Lưu trữ bí mật trong AWS Secrets Manager, Vault hoặc tương tự:

```hcl
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "prod/database/password"
}

resource "aws_db_instance" "main" {
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
  # ...
}
```

## Ví dụ thực tế: Hoàn tất thiết lập backend từ xa

Đây là ví dụ đầy đủ về S3 backend và quy trình làm việc của nhóm:

```hcl
# bootstrap/main.tf - Run this once to create the backend
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
  region = "us-east-1"
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "mycompany-terraform-state"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

output "s3_bucket_name" {
  value = aws_s3_bucket.terraform_state.id
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.terraform_locks.name
}
```

Sau khi tạo cơ sở hạ tầng backend, hãy định cấu hình nó trong mã Terraform chính của bạn:

```hcl
# environments/prod/backend.tf
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

backend từ xa và quy trình làm việc nhóm phù hợp là những điều giúp Terraform khả thi để sử dụng production. Tiếp theo, chúng tôi sẽ đề cập đến các phương pháp và mẫu tốt nhất để duy trì các dự án Terraform quy mô lớn.
