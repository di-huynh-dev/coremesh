---
title: "Cài đặt và thiết lập Terraform"
description: Cài đặt Terraform trên hệ thống của bạn và tạo cơ sở hạ tầng đầu tiên của bạn
order: 2
---

**TLDR**: Tải xuống tệp nhị phân Terraform cho hệ điều hành của bạn, thêm nó vào PATH và chạy `terraform version` để xác minh. Thiết lập thông tin đăng nhập cho nhà cung cấp đám mây của bạn. Tạo một thư mục chứa tệp `.tf`, chạy `terraform init`, sau đó là `terraform plan` và `terraform apply` để tạo cơ sở hạ tầng.

Việc chạy Terraform rất đơn giản - đó là một tệp nhị phân duy nhất không có phần phụ thuộc. Thách thức thường là định cấu hình xác thực với nhà cung cấp đám mây của bạn, chúng tôi sẽ đề cập đến các nền tảng phổ biến nhất.

## Cài đặt Terraform

Terraform hoạt động trên Linux, macOS và Windows. Chọn phương pháp phù hợp với quy trình làm việc của bạn.

### Trên macOS với Homebrew

Đối với người dùng macOS, Homebrew cung cấp cách cài đặt dễ dàng nhất:

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

Việc này sẽ cài đặt phiên bản mới nhất và thiết lập cập nhật tự động thông qua Homebrew.

### Trên Linux

Đối với Debian/Ubuntu:

```bash
# Add HashiCorp's GPG key
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

# Add the HashiCorp repository
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list

# Install Terraform
sudo apt update && sudo apt install terraform
```

Đối với Red Hat/CentOS/Fedora:

```bash
# Add HashiCorp repository
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo

# Install Terraform
sudo yum install terraform
```

### Cài đặt thủ công (Tất cả nền tảng)

Nếu bạn thích cài đặt thủ công hoặc sử dụng Windows:

1. Tải xuống gói thích hợp từ [terraform.io/downloads](https://terraform.io/downloads)
2. Trích xuất kho lưu trữ
3. Di chuyển nhị phân terraform vào một thư mục trong hệ thống của bạn PATH

Trên Linux/macOS:

```bash
# Download (replace with current version)
wget https://releases.hashicorp.com/terraform/1.6.5/terraform_1.6.5_linux_amd64.zip

# Extract
unzip terraform_1.6.5_linux_amd64.zip

# Move to PATH
sudo mv terraform /usr/local/bin/

# Verify
terraform version
```

Trên Windows, giải nén tệp zip và thêm thư mục chứa `terraform.exe` vào biến môi trường PATH của bạn thông qua Thuộc tính hệ thống.

### Xác minh cài đặt

Kiểm tra xem Terraform đã được cài đặt chính xác chưa:

```bash
terraform version
```

Bạn sẽ thấy đầu ra như:

```
Terraform v1.6.5
on linux_amd64
```

Số phiên bản có thể khác nhau, nhưng việc thấy kết quả này xác nhận rằng Terraform đã sẵn sàng để sử dụng.

## Thiết lập thông tin xác thực của nhà cung cấp đám mây

Terraform cần thông tin xác thực để tạo tài nguyên trong nhà cung cấp đám mây của bạn. Chúng tôi sẽ đề cập đến AWS, DigitalOcean và Google Cloud - mẫu thiết lập tương tự đối với các nhà cung cấp khác.

### Thông tin xác thực AWS

Nhà cung cấp AWS cần có khóa truy cập để xác thực. Tạo người dùng IAM có quyền truy cập theo chương trình nếu bạn chưa có:

1. Đi tới Bảng điều khiển AWS → IAM → Người dùng → Thêm người dùng
2. Kích hoạt "Truy cập theo chương trình"
3. Đính kèm các chính sách phù hợp (bắt đầu với AdministratorAccess để tìm hiểu, sử dụng các chính sách hạn chế hơn cho production)
4. Lưu ID khóa truy cập và khóa truy cập bí mật

Định cấu hình thông tin xác thực bằng AWS CLI:

```bash
# Install AWS CLI if needed
# On macOS: brew install awscli
# On Linux: sudo apt install awscli or sudo yum install awscli

# Configure credentials
aws configure
```

Nhập khóa truy cập, khóa bí mật, vùng mặc định (như `us-east-1`) và định dạng đầu ra (sử dụng `json`).

Điều này tạo ra các tệp `~/.aws/credentials` và `~/.aws/config` mà Terraform tự động sử dụng.

Ngoài ra, hãy đặt các biến môi trường:

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### Thông tin xác thực DigitalOcean

DigitalOcean sử dụng mã thông báo API thay vì cặp khóa:

1. Chuyển đến Bảng điều khiển DigitalOcean → API → Tạo mã thông báo mới
2. Đặt tên cho nó và kích hoạt cả phạm vi đọc và ghi
3. Copy token ngay (không xem lại được)

Đặt nó làm biến môi trường:

```bash
export DIGITALOCEAN_TOKEN="your-api-token"
```

Hoặc chỉ định nó trực tiếp trong cấu hình Terraform của bạn (kém an toàn hơn):

```hcl
provider "digitalocean" {
  token = "your-api-token"  # Don't commit this to version control
}
```

### Thông tin xác thực trên Google Cloud

Đối với Google Cloud, hãy tạo tài khoản dịch vụ:

1. Đi tới Google Cloud Console → IAM & Quản trị viên → Tài khoản dịch vụ
2. Tạo tài khoản dịch vụ với vai trò phù hợp
3. Tạo và tải xuống tệp khóa JSON

Đặt đường dẫn tệp thông tin xác thực:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/keyfile.json"
```

Hoặc tham chiếu nó trong cấu hình của bạn:

```hcl
provider "google" {
  credentials = file("/path/to/keyfile.json")
  project     = "your-project-id"
  region      = "us-central1"
}
```

## Tạo cơ sở hạ tầng đầu tiên của bạn

Hãy tạo một DigitalOcean Droplet đơn giản để xem quy trình làm việc hoàn chỉnh. Ví dụ này hoạt động với tài khoản dùng thử miễn phí.

### Thiết lập dự án

Tạo một thư mục cho dự án Terraform của bạn:

```bash
mkdir terraform-learn
cd terraform-learn
```

Tạo một tệp có tên `main.tf`:

```hcl
terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

resource "digitalocean_droplet" "web" {
  image  = "ubuntu-22-04-x64"
  name   = "web-1"
  region = "nyc3"
  size   = "s-1vcpu-1gb"
}

output "droplet_ip" {
  value = digitalocean_droplet.web.ipv4_address
}
```

Cấu hình này:

- Khai báo nhà cung cấp DigitalOcean là nhà cung cấp phụ thuộc
- Định cấu hình nhà cung cấp bằng mã thông báo API từ một biến
- Tạo một Droplet 1GB chạy Ubuntu 22.04 ở New York
- Xuất địa chỉ IP của Droplet sau khi tạo

### Khởi tạo Terraform

Tải xuống nhà cung cấp cần thiết:

```bash
terraform init
```

Bạn sẽ thấy Terraform tải xuống plugin nhà cung cấp DigitalOcean:

```
Initializing the backend...

Initializing provider plugins...
- Finding digitalocean/digitalocean versions matching "~> 2.0"...
- Installing digitalocean/digitalocean v2.34.1...
- Installed digitalocean/digitalocean v2.34.1

Terraform has been successfully initialized!
```

Điều này tạo ra một thư mục `.terraform` chứa plugin nhà cung cấp và tệp `.terraform.lock.hcl` khóa các phiên bản của nhà cung cấp.

### Lập kế hoạch thay đổi

Hãy xem Terraform sẽ làm gì trước khi thực sự thực hiện:

```bash
terraform plan -var="do_token=$DIGITALOCEAN_TOKEN"
```

Terraform cho bạn thấy kế hoạch thực hiện:

```
Terraform will perform the following actions:

  # digitalocean_droplet.web will be created
  + resource "digitalocean_droplet" "web" {
      + backups              = false
      + created_at           = (known after apply)
      + disk                 = (known after apply)
      + id                   = (known after apply)
      + image                = "ubuntu-22-04-x64"
      + ipv4_address         = (known after apply)
      + ipv4_address_private = (known after apply)
      + ipv6                 = false
      + locked               = (known after apply)
      + memory               = (known after apply)
      + monitoring           = false
      + name                 = "web-1"
      + price_hourly         = (known after apply)
      + price_monthly        = (known after apply)
      + region               = "nyc3"
      + size                 = "s-1vcpu-1gb"
      + status               = (known after apply)
      + urn                  = (known after apply)
      + vcpus                = (known after apply)
      + volume_ids           = (known after apply)
      + vpc_uuid             = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + droplet_ip = (known after apply)
```

Hãy xem xét điều này một cách cẩn thận. `+` có nghĩa là tạo một tài nguyên mới. Các thuộc tính hiển thị `(known after apply)` sẽ được điền sau khi tài nguyên được tạo.

### Áp dụng các thay đổi

Nếu kế hoạch có vẻ ổn, hãy tạo cơ sở hạ tầng:

```bash
terraform apply -var="do_token=$DIGITALOCEAN_TOKEN"
```

Terraform hiển thị kế hoạch tương tự và yêu cầu xác nhận:

```
Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value:
```

Nhập `yes` và nhấn Enter. Terraform tạo ra Droplet:

```
digitalocean_droplet.web: Creating...
digitalocean_droplet.web: Still creating... [10s elapsed]
digitalocean_droplet.web: Still creating... [20s elapsed]
digitalocean_droplet.web: Creation complete after 30s [id=123456789]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

Outputs:

droplet_ip = "143.198.123.45"
```

Droplet của bạn hiện đang chạy. Kiểm tra bảng điều khiển của DigitalOcean để xem nó.

### Xác minh trạng thái

Terraform đã tạo tệp `terraform.tfstate` theo dõi các tài nguyên mà nó quản lý:

```bash
terraform show
```

Điều này hiển thị trạng thái hiện tại ở định dạng có thể đọc được, hiển thị tất cả các chi tiết tài nguyên.

### Sửa đổi cơ sở hạ tầng

Hãy thêm thẻ vào Droplet. Chỉnh sửa `main.tf`:

```hcl
resource "digitalocean_droplet" "web" {
  image  = "ubuntu-22-04-x64"
  name   = "web-1"
  region = "nyc3"
  size   = "s-1vcpu-1gb"
  tags   = ["web", "production"]  # Add this line
}
```

Lập kế hoạch và áp dụng sự thay đổi:

```bash
terraform plan -var="do_token=$DIGITALOCEAN_TOKEN"
terraform apply -var="do_token=$DIGITALOCEAN_TOKEN"
```

Terraform phát hiện sửa đổi:

```
  # digitalocean_droplet.web will be updated in-place
  ~ resource "digitalocean_droplet" "web" {
        id     = "123456789"
        name   = "web-1"
      ~ tags   = [
          + "production",
          + "web",
        ]
        # (other attributes unchanged)
    }

Plan: 0 to add, 1 to change, 0 to destroy.
```

Biểu tượng `~` biểu thị bản cập nhật tại chỗ. Điều này sẽ không tạo lại Droplet, chỉ sửa đổi nó.

### Dọn dẹp

Khi bạn thử nghiệm xong, hãy hủy tài nguyên để tránh bị tính phí:

```bash
terraform destroy -var="do_token=$DIGITALOCEAN_TOKEN"
```

Terraform hiển thị những gì nó sẽ xóa:

```
  # digitalocean_droplet.web will be destroyed
  - resource "digitalocean_droplet" "web" {
      - id     = "123456789" -> null
      - image  = "ubuntu-22-04-x64" -> null
      - name   = "web-1" -> null
      - region = "nyc3" -> null
      - size   = "s-1vcpu-1gb" -> null
      - tags   = ["production", "web"] -> null
        # (other attributes omitted)
    }

Plan: 0 to add, 0 to change, 1 to destroy.

Do you really want to destroy all resources?
  Terraform will destroy all your managed infrastructure, as shown above.
  There is no undo. Only 'yes' will be accepted to confirm.

  Enter a value:
```

Gõ `yes` để xác nhận. Terraform xóa Droplet.

## Hiểu những gì vừa xảy ra

Bạn đã hoàn thành toàn bộ quy trình làm việc của Terraform:

1. **Viết cấu hình** mô tả cơ sở hạ tầng mong muốn
2. **Initialized** để tải xuống các nhà cung cấp cần thiết
3. **Planned** để xem trước các thay đổi trước khi thực hiện chúng
4. **Applied** để tạo cơ sở hạ tầng thực tế
5. **Modified (đã sửa đổi)** cơ sở hạ tầng hiện có bằng cách thay đổi cấu hình
6. **DĐã phá hủy tài nguyên** khi không còn cần thiết

Quy trình làm việc tương tự này áp dụng cho mọi nhà cung cấp và mọi quy mô. Cho dù bạn đang quản lý một tài nguyên hay hàng nghìn tài nguyên thì quy trình vẫn nhất quán.

## Các vấn đề thiết lập thường gặp

### Cài đặt plugin nhà cung cấp không thành công

Nếu `terraform init` không thể tải xuống nhà cung cấp:

```bash
# Clear the plugin cache and try again
rm -rf .terraform
terraform init
```

Kiểm tra kết nối internet và cài đặt tường lửa của bạn. Mạng công ty đôi khi chặn sổ đăng ký Terraform.

### Lỗi xác thực

Nếu bạn thấy "xác thực không thành công" hoặc "trái phép":

- Xác minh thông tin đăng nhập là chính xác
- Kiểm tra xem các biến môi trường có được đặt trong phiên shell hiện tại của bạn không
- Đảm bảo tài khoản đám mây của bạn đang hoạt động và đã bật tính năng thanh toán
- Xác nhận tài khoản dịch vụ hoặc người dùng IAM của bạn có các quyền cần thiết

Đối với AWS, thông tin xác thực kiểm tra:

```bash
aws sts get-caller-identity
```

Điều này sẽ trả về thông tin người dùng của bạn nếu thông tin xác thực hoạt động.

### Xung đột tệp trạng thái

Nếu bạn thấy "tệp trạng thái bị khóa" hoặc lỗi tương tự thì có thể ai đó đang chạy Terraform trong cùng thư mục hoặc lần chạy trước đó bị lỗi. Chúng tôi sẽ đề cập chi tiết về khóa trạng thái sau.

## Bảo mật thiết lập của bạn

Trước khi tiếp tục, hãy hiểu những điều cơ bản về bảo mật sau:

**Không bao giờ có thông tin đăng nhập commit để kiểm soát phiên bản**. Sử dụng các biến môi trường hoặc tệp thông tin xác thực bên ngoài thư mục dự án của bạn.

**DKhông commit `terraform.tfstate`** để kiểm soát phiên bản. Nó chứa thông tin nhạy cảm về cơ sở hạ tầng của bạn. Sử dụng tệp `.gitignore`:

```bash
# Create .gitignore
cat > .gitignore << EOF
.terraform/
*.tfstate
*.tfstate.backup
.terraform.lock.hcl
EOF
```

**Sử dụng các biến cho các giá trị nhạy cảm**. Đánh dấu chúng là nhạy cảm để chúng không xuất hiện trong nhật ký:

```hcl
variable "database_password" {
  type      = string
  sensitive = true
}
```

Chúng tôi sẽ đề cập đến nhiều biện pháp bảo mật hơn sau này, nhưng những điều cơ bản này giúp ngăn ngừa những lỗi phổ biến.

## Các bước tiếp theo

Bây giờ bạn đã cài đặt Terraform và đã tạo cơ sở hạ tầng đầu tiên của mình. Bạn đã xem quy trình làm việc cơ bản và hiểu cách Terraform theo dõi trạng thái. Trong phần tiếp theo, chúng ta sẽ tìm hiểu sâu hơn về ngôn ngữ cấu hình - cách viết tài nguyên, sử dụng biểu thức và sắp xếp mã của bạn.
