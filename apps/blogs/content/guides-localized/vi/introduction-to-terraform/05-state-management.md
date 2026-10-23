---
title: "Quản lý trạng thái trong Terraform"
description: Tìm hiểu cách Terraform theo dõi cơ sở hạ tầng, quản lý tệp trạng thái và khôi phục sau các sự cố trạng thái
order: 5
---

**TLDR**: Terraform lưu trữ thông tin tài nguyên trong tệp trạng thái (`terraform.tfstate`). Tệp này ánh xạ cấu hình của bạn tới cơ sở hạ tầng thực. Không bao giờ chỉnh sửa nó bằng tay. Sử dụng các lệnh `terraform state` để kiểm tra và sửa đổi trạng thái một cách an toàn. Giữ trạng thái an toàn - nó thường chứa dữ liệu nhạy cảm.

Tệp trạng thái của Terraform là thứ giúp nó hoạt động. Hiểu trạng thái là rất quan trọng vì các sự cố với trạng thái gây ra hầu hết các sự cố Terraform mà bạn sẽ gặp phải.

## Trạng thái là gì?

Khi Terraform tạo một tài nguyên, nó sẽ ghi lại thông tin về tài nguyên đó trong tệp JSON có tên `terraform.tfstate`:

```json
{
  "version": 4,
  "terraform_version": "1.6.5",
  "resources": [
    {
      "mode": "managed",
      "type": "aws_instance",
      "name": "web",
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [
        {
          "attributes": {
            "id": "i-0123456789abcdef",
            "ami": "ami-0c55b159cbfafe1f0",
            "instance_type": "t3.micro",
            "public_ip": "54.123.45.67",
            "private_ip": "10.0.1.25"
          }
        }
      ]
    }
  ]
}
```

trạng thái này nói với Terraform:

- Những tài nguyên nào nó quản lý
- Các thuộc tính hiện tại của những tài nguyên đó
- Sự phụ thuộc giữa các nguồn lực
- Cấu hình nhà cung cấp được sử dụng

Không có trạng thái, Terraform không biết nó đã tạo ra cơ sở hạ tầng gì.

## Tại sao trạng thái lại quan trọng

trạng thái phục vụ một số mục đích:

### Ánh xạ cấu hình vào thực tế

Các tệp `.tf` của bạn mô tả những gì bạn muốn. trạng thái ghi lại những gì thực sự tồn tại. Terraform so sánh chúng để xác định những gì cần thay đổi.

```
Configuration (.tf)          State File             Real Infrastructure
┌────────────────┐          ┌────────────┐         ┌──────────────┐
│ resource       │          │ {          │         │  EC2 Instance│
│ "aws_instance" │  ══════> │   id:      │  ═════> │  i-abc123   │
│ "web" {        │  mapping │   "i-abc123│  tracks │  t3.micro   │
│   type = "t3   │          │   type:    │         │  10.0.1.5   │
│   .micro"      │          │   "t3.micro│         │             │
│ }              │          │ }          │         │             │
└────────────────┘          └────────────┘         └──────────────┘
```

### Hiệu suất

Đối với cơ sở hạ tầng lớn, việc truy vấn mọi tài nguyên từ API nhà cung cấp sẽ chậm. trạng thái lưu trữ thông tin tài nguyên cục bộ.

### Theo dõi siêu dữ liệu

trạng thái lưu trữ siêu dữ liệu như các phần phụ thuộc tài nguyên không hiển thị trong API của nhà cung cấp.

### Phối hợp nhóm

Với trạng thái từ xa, các thành viên trong nhóm có thể xem cơ sở hạ tầng nào tồn tại và tránh xung đột.

## Kiểm tra trạng thái

Xem trạng thái hiện tại của bạn với `terraform show`:

```bash
terraform show
```

Điều này hiển thị tất cả các tài nguyên và thuộc tính hiện tại của chúng:

```
# aws_instance.web:
resource "aws_instance" "web" {
    ami                    = "ami-0c55b159cbfafe1f0"
    instance_type          = "t3.micro"
    id                     = "i-0123456789abcdef"
    public_ip              = "54.123.45.67"
    private_ip             = "10.0.1.25"
    availability_zone      = "us-east-1a"
    # ... more attributes ...
}
```

Liệt kê tất cả các tài nguyên trong trạng thái:

```bash
terraform state list
```

Đầu ra:

```
aws_vpc.main
aws_subnet.public
aws_instance.web
aws_security_group.web
```

Hiển thị chi tiết về một tài nguyên cụ thể:

```bash
terraform state show aws_instance.web
```

Điều này hữu ích cho việc tìm kiếm các giá trị thuộc tính bạn cần tham khảo.

## Hoạt động trạng thái

Terraform cung cấp các lệnh để thao tác trạng thái an toàn. Không bao giờ chỉnh sửa trực tiếp `terraform.tfstate`.

### Di chuyển tài nguyên

Đổi tên tài nguyên trong cấu hình của bạn mà không hủy và tạo lại nó:

```bash
# You renamed this in your .tf file:
# resource "aws_instance" "web" { ... }
# to:
# resource "aws_instance" "web_server" { ... }

# Update state to match
terraform state mv aws_instance.web aws_instance.web_server
```

Bây giờ Terraform biết phiên bản hiện tại tương ứng với tên mới.

Di chuyển tài nguyên giữa các module:

```bash
terraform state mv aws_instance.web module.web_servers.aws_instance.web
```

### Xóa tài nguyên khỏi trạng thái

Xóa tài nguyên khỏi trạng thái mà không hủy tài nguyên:

```bash
terraform state rm aws_instance.web
```

Phiên bản tiếp tục chạy nhưng Terraform không còn theo dõi nó nữa. Điều này rất hữu ích khi:

- Di chuyển tài nguyên sang cấu hình Terraform khác
- Xóa nội dung nào đó khỏi quản lý Terraform
- Sửa lỗi trạng thái bị hỏng

Sau khi xóa, nếu bạn chạy `terraform plan`, Terraform sẽ muốn tạo lại tài nguyên (nó không thấy tài nguyên đó trong trạng thái). Xóa tài nguyên khỏi cấu hình của bạn hoặc nhập lại.

### Nhập tài nguyên hiện có

Thêm cơ sở hạ tầng hiện có vào quản lý Terraform. Tạo cấu hình tài nguyên trước:

```hcl
resource "aws_instance" "existing_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  # Other required properties
}
```

Nhập phiên bản hiện có:

```bash
terraform import aws_instance.existing_server i-0123456789abcdef
```

Terraform thêm phiên bản này vào trạng thái. Chạy `terraform plan` để xem cấu hình của bạn có khớp với tài nguyên thực hay không. Điều chỉnh tệp `.tf` của bạn cho đến khi `plan` không hiển thị thay đổi nào.

Nhập khẩu là tẻ nhạt đối với các tài nguyên phức tạp. Các công cụ như `terraformer` có thể tạo cả lệnh cấu hình và lệnh nhập từ cơ sở hạ tầng hiện có.

### Thay thế tài nguyên

Buộc tái tạo tài nguyên:

```bash
terraform apply -replace="aws_instance.web"
```

Điều này phá hủy và tạo lại tài nguyên ngay cả khi không cần thay đổi. Hữu ích khi:

- Tài nguyên đang ở trạng thái trạng thái không hợp lệ
- Bạn cần kiểm tra quá trình giải trí
- Áp dụng các thay đổi cấu hình mà Terraform không phát hiện được

## Khóa trạng thái

Khi nhiều người làm việc trên cùng một cơ sở hạ tầng, khóa trạng thái sẽ ngăn ngừa xung đột. Nếu bạn chạy `terraform apply` trong khi một đồng đội chạy nó, bạn có thể đồng thời sửa đổi cơ sở hạ tầng, làm hỏng trạng thái.

Khóa trạng thái khiến Terraform có được khóa trước bất kỳ thao tác nào có thể ghi trạng thái. Nếu người khác giữ khóa, Terraform sẽ đợi hoặc thất bại.

Đối với trạng thái cục bộ (một người), không cần khóa. Đối với trạng thái backend từ xa, hầu hết đều hỗ trợ khóa:

```
Developer A               State Lock              Developer B
    │                         │                       │
    │  terraform apply        │                       │
    ├────────────────────────>│                       │
    │  Lock acquired          │                       │
    │<────────────────────────┤                       │
    │  Making changes...      │                       │
    │                         │  terraform apply      │
    │                         │<──────────────────────┤
    │                         │  Lock held by A       │
    │                         ├──────────────────────>│
    │                         │  Waiting...           │
    │  Complete, release lock │                       │
    ├────────────────────────>│                       │
    │                         │  Lock acquired        │
    │                         ├──────────────────────>│
    │                         │  Making changes...    │
```

Nếu Terraform gặp sự cố trong khi thao tác, khóa có thể không mở được. Buộc mở khóa nó:

```bash
terraform force-unlock LOCK_ID
```

Nhận `LOCK_ID` từ thông báo lỗi. Chỉ làm điều này nếu bạn chắc chắn không có ai khác đang chạy Terraform.

## Vị trí lưu trữ trạng thái

Theo mặc định, Terraform lưu trữ trạng thái trong tệp cục bộ `terraform.tfstate`. Điều này phù hợp cho việc học tập cá nhân nhưng có vấn đề:

**Security**: Các tệp trạng thái chứa dữ liệu nhạy cảm (mật khẩu, khóa riêng). Bộ nhớ cục bộ khiến chúng dễ dàng vô tình tạo ra commit.

**Collaboration**: Các thành viên trong nhóm cần có quyền truy cập vào cùng một trạng thái. Truyền các tập tin xung quanh không có quy mô.

**Reliability**: Nếu máy tính xách tay của bạn chết, bạn sẽ mất trạng thái. Phục hồi là đau đớn.

Đối với các đội, hãy sử dụng backend từ xa (được đề cập ở phần sau). Hiện tại, hãy biết rằng trạng thái có thể được lưu trữ:

- Cục bộ (mặc định)
- Trong S3 có DynamoDB để khóa (AWS)
- Trong bộ lưu trữ Azure Blob (Azure)
- Trong Google Cloud Storage (GCP)
- Trong đám mây Terraform
- Trong backend khác (Lãnh sự, etcd, PostgreSQL)

## Sao lưu trạng thái

Terraform tự động sao lưu trạng thái trước khi sửa đổi nó. Khi bạn chạy `apply` hoặc `destroy`, Terraform sẽ tạo `terraform.tfstate.backup` chứa trạng thái trước đó.

Nếu có sự cố xảy ra, bạn có thể khôi phục:

```bash
# Terraform made a bad change and current state is broken
cp terraform.tfstate.backup terraform.tfstate
```

Luôn giữ bản sao lưu khi làm việc với trạng thái. Đối với backend từ xa, nhiều phiên bản trạng thái tự động, cung cấp cho bạn lịch sử của tất cả các thay đổi.

## Dữ liệu nhạy cảm trong trạng thái

Tệp trạng thái chứa mọi thứ về tài nguyên của bạn. Điều này bao gồm:

- Mật khẩu và khóa API
- Khóa riêng
- Chuỗi kết nối cơ sở dữ liệu
- Mọi cấu hình nhạy cảm

Không bao giờ commit trạng thái để kiểm soát phiên bản. Sử dụng `.gitignore`:

```bash
# .gitignore
.terraform/
*.tfstate
*.tfstate.backup
*.tfstate.lock.info
```

Đối với trạng thái từ xa, hãy sử dụng backend hỗ trợ mã hóa:

- S3 với mã hóa phía máy chủ
- Lưu trữ Azure Blob với mã hóa
- Terraform Cloud (được mã hóa theo mặc định)
- Google Cloud Storage có mã hóa

Đánh dấu các đầu ra nhạy cảm để chúng không xuất hiện trong nhật ký:

```hcl
output "database_password" {
  value     = aws_db_instance.main.password
  sensitive = true
}
```

## Các vấn đề và giải pháp phổ biến của trạng thái

### Trạng thái không đồng bộ

Ai đó đã sửa đổi cơ sở hạ tầng bên ngoài Terraform (thông qua bảng điều khiển hoặc CLI). trạng thái không phù hợp với thực tế.

**Solution**: Làm mới trạng thái để đồng bộ với thực tế hiện tại:

```bash
terraform refresh
```

Hoặc sử dụng cách tiếp cận mới hơn:

```bash
terraform apply -refresh-only
```

Điều này cập nhật trạng thái mà không thực hiện thay đổi. Xem lại những gì đã thay đổi, sau đó sửa cấu hình của bạn cho phù hợp.

### Tài nguyên trùng lặp

Terraform cố gắng tạo tài nguyên đã tồn tại.

**Solution**: Nhập tài nguyên hiện có:

```bash
terraform import resource_type.name resource_id
```

### Tham nhũng trạng thái

Tệp trạng thái bị hỏng hoặc JSON không hợp lệ.

**Solution**: Khôi phục từ bản sao lưu:

```bash
cp terraform.tfstate.backup terraform.tfstate
```

Nếu không có bản sao lưu nào, hãy tạo lại trạng thái theo cách thủ công bằng cách nhập tài nguyên hoặc bắt đầu mới (rủi ro).

### Đã xóa trạng thái

Bạn vô tình xóa `terraform.tfstate`.

**Solution**: Nếu bạn có bản sao lưu, hãy khôi phục chúng. Mặt khác:

1. Tạo lại trạng thái theo cách thủ công bằng cách nhập từng tài nguyên
2. Hoặc phá hủy toàn bộ cơ sở hạ tầng và tạo lại bằng `terraform apply`
3. Đối với backend từ xa, khôi phục từ lịch sử phiên bản

Đây là lý do tại sao backend từ xa có phiên bản lại quan trọng.

## Ví dụ thực tế: Quy trình làm việc trạng thái

Đây là một kịch bản thực tế:

```bash
# Create initial infrastructure
terraform init
terraform plan
terraform apply

# Check what you created
terraform state list

# See details about the web server
terraform state show aws_instance.web

# Rename the resource in your .tf file from "web" to "web_server"
# Update state to match
terraform state mv aws_instance.web aws_instance.web_server

# Verify the plan shows no changes
terraform plan

# Someone manually changed the instance type through AWS console
# Detect the drift
terraform plan

# See what changed
terraform refresh

# Fix the drift by reapplying
terraform apply

# Remove the instance from management but keep it running
terraform state rm aws_instance.web_server

# Later, bring it back under management
terraform import aws_instance.web_server i-0123456789abcdef
```

## Hiểu sự phụ thuộc của trạng thái

trạng thái theo dõi các phụ thuộc tài nguyên để Terraform biết thứ tự tạo và phá hủy mọi thứ. Chạy `terraform graph` để hình dung:

```bash
terraform graph | dot -Tpng > graph.png
```

Điều này tạo ra sự trình bày trực quan về các phụ thuộc cơ sở hạ tầng của bạn. Bạn cần cài đặt `graphviz` (`brew install graphviz` trên macOS).

## Phiên bản trạng thái

Terraform trạng thái có số phiên bản. Khi bạn nâng cấp Terraform, việc chạy bất kỳ lệnh nào cũng có thể nâng cấp trạng thái lên phiên bản mới:

```
Upgrading state from version 3 to version 4...
```

Các phiên bản Terraform cũ hơn không thể đọc các định dạng trạng thái mới hơn. Điều này có nghĩa là:

- Phối hợp nâng cấp phiên bản Terraform trong nhóm của bạn
- Ghim các phiên bản Terraform trong cấu hình của bạn
- Thử nghiệm nâng cấp trong quá trình phát triển trước tiên

Ghim phiên bản Terraform:

```hcl
terraform {
  required_version = "~> 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

quản lý trạng thái là một trong những khía cạnh phức tạp nhất của Terraform. Hiểu trạng thái, biết cách kiểm tra nó và cảm thấy thoải mái với các lệnh trạng thái sẽ giúp bạn tránh được nhiều vấn đề. Tiếp theo, chúng ta sẽ xem xét các biến số và kết quả đầu ra - cách tạo cấu hình linh hoạt và hiển thị thông tin hữu ích.
