---
title: "Hiểu các nguyên tắc cơ bản của Terraform"
description: Tìm hiểu các khái niệm cốt lõi đằng sau Terraform và cách nó quản lý cơ sở hạ tầng dưới dạng mã
order: 1
---

**TLDR**: Terraform sử dụng các tệp cấu hình khai báo để mô tả cơ sở hạ tầng. Bạn viết những gì bạn muốn (tài nguyên, thuộc tính của chúng) và Terraform tìm ra cách tạo hoặc sửa đổi chúng. Nó theo dõi mọi thứ trong tệp trạng thái và sử dụng các nhà cung cấp để giao tiếp với các dịch vụ đám mây và API khác nhau.

Trước khi viết bất kỳ mã Terraform nào, bạn cần hiểu nó nghĩ như thế nào về cơ sở hạ tầng. Cách tiếp cận của Terraform khác với việc cung cấp tập lệnh hoặc thủ công và hiểu được những khác biệt này sẽ giúp bạn sử dụng nó một cách hiệu quả.

## Cách tiếp cận khai báo

Khi bạn viết tập lệnh shell để tạo cơ sở hạ tầng, bạn chỉ định các bước chính xác: đầu tiên tạo mạng này, sau đó tạo máy chủ này, sau đó định cấu hình nó. Đây là lập trình bắt buộc - bạn cho hệ thống biết cách thực hiện mọi việc.

Terraform hoạt động khác nhau. Bạn mô tả kết quả cuối cùng mà bạn mong muốn và Terraform tìm ra cách đạt được điều đó. Đây là lập trình khai báo. Thay vì viết:

```bash
# Imperative approach - step by step
aws ec2 create-vpc --cidr-block 10.0.0.0/16
aws ec2 create-subnet --vpc-id vpc-12345 --cidr-block 10.0.1.0/24
aws ec2 run-instances --subnet-id subnet-67890 --image-id ami-abc123
```

Bạn viết cấu hình Terraform mô tả trạng thái mong muốn:

```hcl
# Declarative approach - describe what you want
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}

resource "aws_instance" "web" {
  ami           = "ami-abc123"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id
}
```

Sự khác biệt trở nên quan trọng hơn khi bạn chạy Terraform lần thứ hai. Tập lệnh có thể cố gắng tạo tài nguyên trùng lặp hoặc không thành công. Terraform kiểm tra những gì đã tồn tại, so sánh nó với cấu hình của bạn và chỉ thực hiện những thay đổi cần thiết.

Điều này làm cho Terraform trở nên bình thường - chạy nó nhiều lần với cùng một cấu hình sẽ tạo ra kết quả tương tự. Bạn không cần các tập lệnh khác nhau để tạo tài nguyên thay vì cập nhật chúng.

## Cách Terraform theo dõi cơ sở hạ tầng

Terraform cần nhớ cơ sở hạ tầng mà nó đã tạo để có thể quản lý các bản cập nhật và xóa. Nó thực hiện điều này thông qua tệp trạng thái.

Khi bạn chạy Terraform lần đầu tiên, nó sẽ tạo các tài nguyên và ghi lại thông tin chi tiết về chúng trong `terraform.tfstate`:

```
Local Terraform Files          Cloud Provider (AWS)          Terraform State File
┌─────────────────┐           ┌─────────────────┐           ┌──────────────────┐
│  main.tf        │           │                 │           │ terraform.tfstate│
│  ─────────      │           │  ╔══════════╗   │           │ ──────────────── │
│  resource       │  apply    │  ║ EC2      ║   │   tracks  │ {                │
│  "aws_instance" │  ───────> │  ║ Instance ║   │  <──────  │   "aws_instance":│
│  "web" {        │           │  ║ i-abc123 ║   │           │   {id: "i-abc123"│
│    ...          │           │  ╚══════════╝   │           │    type: "t3..." │
│  }              │           │                 │           │   }              │
└─────────────────┘           └─────────────────┘           └──────────────────┘
```

Lần tới khi bạn chạy Terraform, nó:

1. Đọc các tập tin cấu hình của bạn để xem những gì bạn muốn
2. Đọc tệp trạng thái để xem những gì hiện đang tồn tại
3. Truy vấn cơ sở hạ tầng thực tế để xác minh tệp trạng thái là chính xác
4. Tính toán những gì cần thay đổi
5. Hiển thị cho bạn kế hoạch thay đổi trước khi thực hiện chúng

Sự so sánh ba chiều này (trạng thái mong muốn, trạng thái được ghi lại, trạng thái thực tế) là điều giúp Terraform an toàn và có thể dự đoán được.

## Nhà cung cấp: Hệ thống plugin của Terraform

Bản thân Terraform không biết cách tạo máy chủ AWS hoặc giọt DigitalOcean. Kiến thức đó tồn tại trong các nhà cung cấp - các plugin triển khai các loại tài nguyên cho các nền tảng cụ thể.

Khi bạn viết:

```hcl
terraform {
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
```

Bạn đang yêu cầu Terraform tải xuống plugin nhà cung cấp AWS. Nhà cung cấp này biết cách chuyển các định nghĩa tài nguyên của Terraform thành các lệnh gọi API AWS.

Có nhà cung cấp cho:

- Nền tảng đám mây (AWS, Azure, Google Cloud, DigitalOcean)
- Dịch vụ cơ sở hạ tầng (Cloudflare, Datadog, PagerDuty)
- Kiểm soát phiên bản (GitHub, GitLab)
- Cơ sở dữ liệu (PostgreSQL, MySQL)
- Kubernetes và container
- Và hàng trăm thứ khác

Quy trình làm việc Terraform giống nhau hoạt động trên tất cả các nhà cung cấp. Học nó một lần, sử dụng nó ở mọi nơi.

## Tài nguyên: Các khối xây dựng

Tài nguyên là khái niệm quan trọng nhất trong Terraform. Tài nguyên là bất cứ thứ gì bạn muốn tạo hoặc quản lý - máy ảo, cơ sở dữ liệu, bản ghi DNS, cảnh báo giám sát.

Mỗi tài nguyên đều có một loại và một tên:

```hcl
resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server-01"
  }
}
```

Phá vỡ điều này:

- `resource` - từ khóa chỉ khối tài nguyên
- `"aws_instance"` - loại tài nguyên (do nhà cung cấp AWS xác định)
- `"web_server"` - tên bạn chọn để tham khảo tài nguyên này
- Mọi thứ trong dấu ngoặc nhọn - đối số cấu hình tài nguyên

Loại tài nguyên xác định những đối số nào có sẵn. `aws_instance` cần có AMI và loại phiên bản. `aws_s3_bucket` cần có tên nhóm. Tài liệu của nhà cung cấp cho bạn biết những gì cần thiết và những gì là tùy chọn.

## Tham chiếu giữa các tài nguyên

Nguồn lực thường phụ thuộc vào nhau. Một máy chủ cần một mạng. Bản ghi DNS cần có địa chỉ IP của máy chủ. Terraform xử lý việc này thông qua các tài liệu tham khảo.

Bạn tham chiếu các thuộc tính của tài nguyên bằng `resource_type.resource_name.attribute`:

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id  # Reference the VPC's ID
  cidr_block = "10.0.1.0/24"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id  # Reference the subnet's ID

  tags = {
    Name = "web-server"
  }
}

resource "aws_eip" "web_ip" {
  instance = aws_instance.web.id  # Reference the instance's ID
  domain   = "vpc"
}
```

Terraform phân tích các tài liệu tham khảo này để xây dựng biểu đồ phụ thuộc. Nó biết rằng nó phải tạo VPC trước mạng con, mạng con trước phiên bản và phiên bản trước IP đàn hồi. Khi bạn chạy `terraform apply`, nó sẽ tự động tạo các tài nguyên theo đúng thứ tự.

Nếu bạn xóa VPC khỏi cấu hình của mình, Terraform biết rằng họ cần xóa IP đàn hồi, sau đó là phiên bản, mạng con, rồi đến VPC - theo thứ tự phụ thuộc ngược lại.

## Quy trình làm việc của Terraform

Làm việc với Terraform tuân theo một mẫu nhất quán:

1. **Write** - Tạo hoặc sửa đổi các tệp cấu hình `.tf`
2. **Initialize** - Chạy `terraform init` để tải xuống các nhà cung cấp cần thiết
3. **Plan** - Chạy `terraform plan` để xem Terraform sẽ tạo ra những thay đổi gì
4. **Review** - Kiểm tra kế hoạch để xác minh nó phù hợp với ý định của bạn
5. **Apply** - Chạy `terraform apply` để thực hiện các thay đổi
6. **Verify** - Kiểm tra xem tài nguyên đã được tạo chính xác chưa

Quy trình công việc này vẫn giữ nguyên cho dù bạn đang tạo một hay hàng trăm tài nguyên, làm việc một mình hay theo nhóm, quản lý AWS hay bất kỳ nhà cung cấp nào khác.

Bước lập kế hoạch là đặc biệt quan trọng. Nó cho bạn thấy chính xác điều gì sẽ thay đổi trước khi mọi thứ thực sự thay đổi:

```
Terraform will perform the following actions:

  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      + ami                    = "ami-0c55b159cbfafe1f0"
      + instance_type          = "t3.micro"
      + subnet_id              = "subnet-abc123"
      ...
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

Không bao giờ chạy `terraform apply` mà không xem lại kế hoạch trước. Luôn kiểm tra những gì đang được tạo, sửa đổi hoặc hủy bỏ.

## Cấu hình tập tin và cấu trúc thư mục

Terraform đọc tất cả các tệp `.tf` trong thư mục hiện tại và coi chúng như một cấu hình lớn. Điều này có nghĩa là bạn có thể sắp xếp mã của mình theo cách hợp lý:

```
infrastructure/
├── main.tf          # Main resource definitions
├── variables.tf     # Input variables
├── outputs.tf       # Output values
├── providers.tf     # Provider configuration
└── terraform.tfstate  # State file (created by Terraform)
```

Hoặc giữ mọi thứ trong một tệp:

```
infrastructure/
└── main.tf          # Everything in one file
```

Terraform không quan tâm. Sử dụng bất kỳ tổ chức nào giúp bạn hiểu cấu hình. Các dự án nhỏ hơn thường bắt đầu bằng một tệp. Khi độ phức tạp tăng lên, việc chia thành nhiều tệp sẽ cải thiện khả năng đọc.

## Hiểu cơ sở hạ tầng bất biến

Terraform khuyến khích cơ sở hạ tầng bất biến - thay thế tài nguyên thay vì sửa đổi chúng. Điều này khác với quản trị hệ thống truyền thống nơi bạn cập nhật máy chủ tại chỗ.

Nếu bạn cần thay đổi cấu hình của máy chủ, bạn không đăng nhập SSH và sửa đổi tệp. Thay vào đó, bạn:

1. Cập nhật cấu hình Terraform của bạn
2. Chạy địa hình áp dụng
3. Terraform tạo một máy chủ mới với cấu hình mới
4. Chuyển lưu lượng truy cập sang máy chủ mới
5. Phá hủy máy chủ cũ

Cách tiếp cận này làm giảm độ lệch (các máy chủ dần trở nên khác biệt với nhau), giúp việc khôi phục dễ dàng hơn (chỉ cần áp dụng cấu hình cũ) và làm rõ cấu hình hiện tại thực sự là gì (tất cả đều nằm trong kiểm soát phiên bản).

Không phải mọi tài nguyên đều hoạt động theo cách này. Việc thay đổi một số thuộc tính sẽ gây ra sự thay thế, trong khi những thuộc tính khác có thể được cập nhật tại chỗ. Đầu ra kế hoạch của Terraform cho bạn thấy đó là:

```
  # aws_instance.web must be replaced
-/+ resource "aws_instance" "web" {
      ~ ami           = "ami-old123" -> "ami-new456"  # forces replacement
        instance_type = "t3.micro"
    }
```

Biểu tượng `-/+` có nghĩa là Terraform sẽ phá hủy và tạo lại tài nguyên này. Biểu tượng `~` có nghĩa là nó sẽ cập nhật tại chỗ.

## Nguồn dữ liệu: Đọc cơ sở hạ tầng hiện có

Đôi khi bạn cần tham khảo cơ sở hạ tầng mà Terraform không quản lý. Nguồn dữ liệu cho phép bạn truy vấn các tài nguyên hiện có:

```hcl
# Look up the latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical's AWS account

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}

# Use it in a resource
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id  # Reference the data source
  instance_type = "t3.micro"
}
```

Nguồn dữ liệu bắt đầu bằng `data` thay vì `resource`. Chúng không tạo ra bất kỳ thứ gì - chúng chỉ truy vấn và trả về thông tin mà bạn có thể sử dụng trong cấu hình của mình.

Điều này hữu ích cho:

- Tìm AMI hoặc container image mới nhất
- Tham chiếu các VPC hoặc mạng được tạo bên ngoài Terraform
- Tra cứu thông tin tài khoản hoặc chi tiết khu vực
- Tích hợp với cơ sở hạ tầng hiện có

Hiểu những nguyên tắc cơ bản này - cấu hình khai báo, quản lý trạng thái, nhà cung cấp, tài nguyên và quy trình làm việc cơ bản - mang lại cho bạn nền tảng để bắt đầu viết mã Terraform thực tế. Trong phần tiếp theo, chúng tôi sẽ cài đặt Terraform và tạo cơ sở hạ tầng đầu tiên của bạn.
