---
title: "Phòng thủ nhiều lớp"
description: Tìm hiểu cách triển khai các chiến lược bảo mật theo lớp để bảo vệ cơ sở hạ tầng của bạn khỏi nhiều vectơ tấn công.
order: 2
---

phòng thủ nhiều lớp là một chiến lược bảo mật sử dụng nhiều lớp kiểm soát bảo mật trên toàn bộ cơ sở hạ tầng của bạn. Nếu một lớp bị lỗi, các lớp khác vẫn bảo vệ tài sản của bạn. Hãy nghĩ về nó giống như một lâu đài thời trung cổ với hào, tường, tháp và lính canh—mỗi lớp sẽ tăng thêm khả năng bảo vệ.

## Mô hình bảo mật lớp

phòng thủ nhiều lớp thường bao gồm các lớp sau:

```
+-------------------------------------------+
|           Physical Security               |
|  +-------------------------------------+  |
|  |        Network Security             |  |
|  |  +-------------------------------+  |  |
|  |  |       Host Security           |  |  |
|  |  |  +-------------------------+  |  |  |
|  |  |  |  Application Security   |  |  |  |
|  |  |  |  +-------------------+  |  |  |  |
|  |  |  |  |   Data Security   |  |  |  |  |
|  |  |  |  +-------------------+  |  |  |  |
|  |  |  +-------------------------+  |  |  |
|  |  +-------------------------------+  |  |
|  +-------------------------------------+  |
+-------------------------------------------+
```

Mỗi lớp cung cấp khả năng bảo vệ độc lập, do đó kẻ tấn công phải vượt qua nhiều lớp phòng thủ để tiếp cận các tài sản quan trọng của bạn.

## Lớp 1: Bảo mật vật lý

Bảo mật vật lý bảo vệ phần cứng và cơ sở vật chất chứa hệ thống của bạn.

### Cân nhắc về đám mây

Khi sử dụng các nhà cung cấp đám mây, bảo mật vật lý phần lớn là trách nhiệm của họ:

- Kiểm soát truy cập trung tâm dữ liệu
- Xác thực sinh trắc học
- Giám sát 24/7
- Kiểm soát môi trường

### Cân nhắc tại chỗ

Đối với cơ sở hạ tầng tại chỗ:

```bash
# Physical security checklist
- [ ] Locked server rooms with access logs
- [ ] Security cameras at entry points
- [ ] Badge access systems
- [ ] Visitor sign-in procedures
- [ ] Hardware asset tracking
- [ ] Secure disposal of old equipment
```

## Lớp 2: An ninh mạng

An ninh mạng kiểm soát luồng lưu lượng và ngăn chặn truy cập mạng trái phép.

### Tường lửa và nhóm bảo mật

Các nhóm bảo mật hoạt động như tường lửa ảo cho tài nguyên đám mây của bạn. Nguyên tắc chính là **mặc định từ chối**: chặn mọi thứ, sau đó chỉ cho phép những gì cần thiết một cách rõ ràng. Điều này trái ngược với số lượng người định cấu hình chúng (cho phép mọi thứ, sau đó cố gắng chặn lưu lượng truy cập xấu).

Nhóm bảo mật AWS có trạng thái, nghĩa là nếu bạn cho phép lưu lượng truy cập vào trên một cổng thì lưu lượng phản hồi sẽ tự động được phép gửi đi.

```bash
# AWS Security Group - Web Server
aws ec2 create-security-group \
  --group-name web-server-sg \
  --description "Web server security group"

# Allow only necessary ports
aws ec2 authorize-security-group-ingress \
  --group-name web-server-sg \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
# Only allowing HTTPS (443) from any IP
# SSH should be restricted to specific IPs or use bastion hosts

# Deny all other inbound by default
# Security groups have implicit deny - no need to add deny rules
```

**Các lỗi thường gặp:**
- Mở SSH (22) tới 0.0.0.0/0 (toàn bộ internet)
- Sử dụng phạm vi CIDR quá rộng khi biết IP cụ thể
- Để lại các quy tắc kiểm tra tại chỗ sau khi gỡ lỗi

### Phân đoạn mạng

Phân đoạn mạng chia cơ sở hạ tầng của bạn thành các vùng biệt lập. Nếu kẻ tấn công xâm phạm một vùng, chúng không thể dễ dàng di chuyển sang vùng khác. Hãy coi nó giống như các khoang trên một con tàu - một lỗ thủng trong một khoang không thể đánh chìm cả con tàu.

Kiến trúc ba tầng điển hình của **A:**
1. **Mạng con công khai (DMZ)**: Cân bằng tải, máy chủ pháo đài—bề mặt tấn công tối thiểu tiếp xúc với internet
2. **Mạng con ứng dụng riêng tư**: Máy chủ ứng dụng—chỉ có thể nhận lưu lượng truy cập từ mạng con công cộng
3. **Mạng con dữ liệu riêng tư**: Cơ sở dữ liệu—chỉ có thể được truy cập từ mạng con ứng dụng

```hcl
# Terraform: Create separate subnets
resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  
  tags = {
    Name = "Public Subnet"
    Tier = "DMZ"  # Demilitarized Zone - exposed to internet
  }
}

resource "aws_subnet" "private_app" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1a"
  
  tags = {
    Name = "Private App Subnet"
    Tier = "Application"  # No direct internet access
  }
}

resource "aws_subnet" "private_db" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "us-east-1a"
  
  tags = {
    Name = "Private DB Subnet"
    Tier = "Database"  # Most restricted - only app servers can connect
  }
}
```

**Lưu ý:** Mỗi tầng phải có các nhóm bảo mật và ACL mạng riêng. Mạng con cơ sở dữ liệu không được có đường dẫn đến cổng internet.

### Chính sách mạng Kubernetes

Theo mặc định, Kubernetes cho phép tất cả pod giao tiếp với nhau. Điều này thuận tiện nhưng nguy hiểm—một pod bị xâm nhập có thể tấn công bất kỳ pod nào khác trong cụm. Chính sách mạng cho phép bạn triển khai phân đoạn vi mô trong Kubernetes.

**Bắt đầu với chính sách từ chối tất cả**, sau đó cho phép rõ ràng các đường dẫn liên lạc được yêu cầu:

```yaml
# Deny all ingress by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress

---
# Allow specific traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-to-api
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: web
    ports:
    - protocol: TCP
      port: 8080
```

## Lớp 3: Bảo mật máy chủ

Bảo mật máy chủ tăng cường hệ điều hành và cấu hình máy chủ. Ngay cả khi kẻ tấn công vượt qua được an ninh mạng, một máy chủ được bảo mật đúng cách sẽ khiến việc khai thác trở nên khó khăn hơn nhiều. Mục tiêu là giảm bề mặt tấn công và phát hiện sự xâm nhập một cách nhanh chóng.

### Tăng cường hệ điều hành

Mọi dịch vụ chạy trên hệ thống đều là một vectơ tấn công tiềm ẩn. Nguyên tắc của **Cài đặt tối thiểu** có nghĩa là loại bỏ hoặc vô hiệu hóa mọi thứ không được yêu cầu nghiêm ngặt.

```bash
# Disable unnecessary services
# Each disabled service = one less potential vulnerability
systemctl disable bluetooth
systemctl disable cups
systemctl disable avahi-daemon

# Remove unnecessary packages
# telnet and ftp transmit credentials in plain text - never use them
apt purge telnet ftp

# Enable automatic security updates
# Critical for patching known vulnerabilities quickly
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

**Các bước làm cứng bổ sung:**
- Kích hoạt SELinux hoặc AppArmor để kiểm soát truy cập bắt buộc
- Định cấu hình tham số kernel trong `/etc/sysctl.conf` (tắt chuyển tiếp IP, bật cookie đồng bộ)
- Thực hiện mã hóa ổ đĩa cho dữ liệu ở phần còn lại

### Tăng cường SSH

SSH thường là phương thức truy cập từ xa chính nên nó trở thành mục tiêu hàng đầu. Các cài đặt này làm giảm đáng kể nguy cơ truy cập trái phép:

```bash
# /etc/ssh/sshd_config
PermitRootLogin no           # Force use of regular accounts, then sudo
PasswordAuthentication no    # Passwords can be brute-forced; keys cannot
PubkeyAuthentication yes     # Only allow SSH key authentication
MaxAuthTries 3               # Lock out after 3 failed attempts
ClientAliveInterval 300      # Disconnect idle sessions after 5 minutes
ClientAliveCountMax 2        # Allow 2 missed keepalives before disconnect
AllowUsers deploy admin      # Whitelist specific users who can SSH
Protocol 2                   # SSH v1 has known vulnerabilities
```

**Sau khi thực hiện thay đổi:** Chạy `sshd -t` để kiểm tra cấu hình, sau đó chạy `systemctl restart sshd`. Giữ phiên hiện có mở trong khi thử nghiệm để tránh bị khóa!

### Phát hiện xâm nhập dựa trên máy chủ

AIDE (Môi trường phát hiện xâm nhập nâng cao) tạo cơ sở dữ liệu về tổng kiểm tra tệp và quyền. Bất kỳ thay đổi trái phép nào đều kích hoạt cảnh báo. Điều này phát hiện phần mềm độc hại, rootkit và các thay đổi cấu hình trái phép.

```bash
# Install and configure AIDE
apt install aide

# Initialize database
aideinit
# This creates a baseline of all system files

# Check for changes
aide --check
# Compares current state to baseline and reports any modifications
```

**Quan trọng:** AIDE cũng cảnh báo về những thay đổi hợp pháp (cập nhật hệ thống, thay đổi cấu hình). Cập nhật đường cơ sở sau các thay đổi được ủy quyền với `aide --update`.

## Lớp 4: Bảo mật ứng dụng

Bảo mật ứng dụng bảo vệ mã và môi trường thời gian chạy của bạn. Lớp này là nơi các nhà phát triển có quyền kiểm soát trực tiếp nhất—và là nơi bắt nguồn nhiều vi phạm. Xác thực đầu vào, thực hành mã hóa an toàn và bảo vệ thời gian chạy đều có ở đây.

### Thực hành mã hóa an toàn

**SQL Tiêm** vẫn là một trong những lỗ hổng nguy hiểm nhất (luôn nằm trong Top 10 của OWASP). Nó xảy ra khi đầu vào của người dùng được nối trực tiếp vào các truy vấn cơ sở dữ liệu, cho phép kẻ tấn công thực thi các lệnh SQL tùy ý.

Cách khắc phục rất đơn giản: **luôn sử dụng các truy vấn được tham số hóa**. Trình điều khiển cơ sở dữ liệu xử lý việc thoát, khiến việc tiêm không thể thực hiện được.

```python
# Bad: SQL Injection vulnerability
# An attacker could input: 1; DROP TABLE users; --
query = f"SELECT * FROM users WHERE id = {user_input}"

# Good: Parameterized query
# User input is treated as data, never as SQL code
cursor.execute("SELECT * FROM users WHERE id = %s", (user_input,))
```

**Điều này áp dụng cho tất cả các ngôn ngữ:** Sử dụng các câu lệnh đã chuẩn bị sẵn (Java), các truy vấn được tham số hóa (Python, Go) hoặc các phương thức ORM (Django, Rails) để xử lý việc thoát tự động.

### Bảo mật container

container cung cấp khả năng cách ly, nhưng container bị định cấu hình sai có thể làm lộ toàn bộ hệ thống của bạn. Những cách thực hành này tạo ra phòng thủ nhiều lớp trong container của bạn:

```dockerfile
# Use minimal base image
# Alpine is ~5MB vs ~100MB+ for full Ubuntu
# Smaller image = smaller attack surface
FROM alpine:3.18

# Run as non-root user
# If the container is compromised, attacker has limited privileges
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -D appuser

# Copy only necessary files
# Don't copy source code, dev dependencies, or secrets
COPY --chown=appuser:appgroup ./app /app

USER appuser

# Use read-only filesystem where possible
# Prevents attackers from modifying files or installing malware
```

**ACác biện pháp bảo mật container bổ sung:**
- Quét image để tìm lỗ hổng (Trivy, Snyk, Clair)
- Sử dụng image không cần distro cho bề mặt tấn công nhỏ hơn nữa
- Thực hiện giới hạn tài nguyên để ngăn chặn DoS
- Không bao giờ chạy container với `--privileged`

### Tường lửa ứng dụng web (WAF)

WAF kiểm tra lưu lượng HTTP và chặn các yêu cầu độc hại trước khi chúng tiếp cận ứng dụng của bạn. Đây là tuyến phòng thủ cuối cùng của bạn trước các cuộc tấn công web phổ biến như SQL injection, XSS và path traversal.

**WAF hoạt động tốt nhất như một phần phòng thủ theo chiều sâu**—chúng chặn các cuộc tấn công vượt qua các điều khiển khác nhưng không phải là biện pháp bảo vệ duy nhất của bạn.

```yaml
# AWS WAF rule example
Rules:
  - Name: SQLInjectionRule
    Priority: 1  # Lower number = evaluated first
    Action:
      Block: {}  # Block matching requests; could also use Count for monitoring
    Statement:
      SqliMatchStatement:
        FieldToMatch:
          Body: {}  # Inspect request body for SQL injection patterns
        TextTransformations:
          - Priority: 0
            Type: URL_DECODE  # Decode URL-encoded attacks before inspection
```

**Bắt đầu với bộ quy tắc được quản lý** (Quy tắc được quản lý AWS, Bộ quy tắc cốt lõi OWASP) và tùy chỉnh dựa trên nhu cầu cụ thể cũng như các kết quả dương tính giả của ứng dụng của bạn.

## Lớp 5: Bảo mật dữ liệu

Bảo mật dữ liệu bảo vệ tài sản quý giá nhất của bạn—chính là dữ liệu. Nếu kẻ tấn công vi phạm tất cả các lớp khác, mã hóa sẽ đảm bảo chúng vẫn không thể đọc được thông tin nhạy cảm. Lớp này là lớp phòng thủ cuối cùng của bạn.

### Mã hóa ở phần còn lại

Mã hóa ở trạng thái lưu trữ bảo vệ dữ liệu được lưu trữ trên đĩa, cơ sở dữ liệu và bản sao lưu. Ngay cả khi ai đó đánh cắp ổ cứng hoặc truy cập trái phép vào bộ lưu trữ, họ cũng không thể đọc dữ liệu nếu không có khóa mã hóa.

**AWS KMS (Dịch vụ quản lý khóa)** xử lý việc quản lý khóa, xoay vòng và kiểm soát truy cập:

```bash
# Encrypt EBS volumes
aws ec2 create-volume \
  --availability-zone us-east-1a \
  --size 100 \
  --encrypted \
  --kms-key-id alias/my-key  # Use your own KMS key for full control

# Encrypt S3 bucket
aws s3api put-bucket-encryption \
  --bucket my-bucket \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms",
        "KMSMasterKeyID": "alias/my-key"  # All new objects auto-encrypted
      }
    }]
  }'
```

**Tip:** Bật mã hóa mặc định ở cấp tài khoản/tổ chức để các tài nguyên mới được tự động mã hóa.

### Mã hóa trong quá trình chuyển tiếp

Mã hóa khi truyền (TLS/HTTPS) bảo vệ dữ liệu khi dữ liệu di chuyển giữa các hệ thống. Không có nó, bất kỳ ai trên đường dẫn mạng đều có thể đọc lưu lượng truy cập—bao gồm thông tin xác thực, khóa API và dữ liệu nhạy cảm.

**Buộc HTTPS ở mọi nơi** với các chuyển hướng và HSTS (Bảo mật truyền tải nghiêm ngặt HTTP):

```yaml
# Kubernetes: Enforce TLS
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"  # Redirect HTTP to HTTPS
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"  # Even for X-Forwarded-Proto
spec:
  tls:
  - hosts:
    - myapp.example.com
    secretName: tls-secret  # Kubernetes secret containing TLS certificate
```

**Đồng thời mã hóa lưu lượng truy cập nội bộ** (từ dịch vụ đến dịch vụ). Sử dụng mTLS (TLS tương hỗ) trong Kubernetes với lưới dịch vụ như Istio hoặc Linkerd.

### Phân loại dữ liệu

Phân loại dữ liệu theo độ nhạy:

| Phân loại | Ví dụ | Điều khiển |
|----------------|----------|----------|
| công cộng | Tài liệu tiếp thị | Kiểm soát truy cập cơ bản |
| nội bộ | Thư mục nhân viên | Yêu cầu xác thực |
| bí mật | Báo cáo tài chính | Mã hóa + nhật ký truy cập |
| Bị hạn chế | PII, thông tin xác thực | Mã hóa + truy cập nghiêm ngặt + kiểm tra |

## Triển khai phòng thủ nhiều lớp

### Bước 1: Xác định tài sản của bạn

```bash
# Create an asset inventory
Asset Type       | Location        | Sensitivity | Owner
-----------------|-----------------|--------------|---------
Customer DB      | AWS RDS         | Restricted   | Data Team
Web Application  | EKS Cluster     | Confidential | Dev Team
Log Storage      | S3 Bucket       | Internal     | SRE Team
```

### Bước 2: Lập bản đồ các vectơ tấn công

Đối với mỗi nội dung, hãy xác định các đường dẫn tấn công tiềm ẩn:

```
Customer Database Attack Vectors:
1. SQL Injection → Application Layer
2. Stolen Credentials → Network Layer
3. Insider Threat → Host Layer
4. Physical Access → Physical Layer
```

### Bước 3: Triển khai các điều khiển ở mỗi lớp

```yaml
# Security controls matrix
Customer Database:
  Physical:
    - AWS manages data center security
    - Multi-AZ deployment
  Network:
    - Private subnet only
    - Security groups: app servers only
    - No public IP
  Host:
    - Managed RDS (AWS handles patching)
    - Encryption enabled
  Application:
    - Parameterized queries
    - Input validation
    - ORM usage
  Data:
    - Encryption at rest (KMS)
    - Encryption in transit (TLS)
    - Regular backups
```

## Bài học chính

- phòng thủ nhiều lớp sử dụng nhiều lớp bảo mật độc lập
- Không có sự kiểm soát duy nhất nào là một điểm thất bại duy nhất
- Mỗi lớp sẽ có thể phát hiện và phản ứng với các cuộc tấn công
- Thường xuyên kiểm tra từng lớp một cách độc lập và cùng nhau
- Ghi lại các biện pháp kiểm soát của bạn và xem xét chúng định kỳ

## Bài tập thực hành

Lập bản đồ các lớp phòng thủ của cơ sở hạ tầng hiện tại của bạn:

1. Vẽ kiến trúc mạng của bạn
2. Xác định các biện pháp kiểm soát bảo mật ở mỗi lớp
3. Tìm những khoảng trống mà một lỗi điều khiển có thể dẫn đến sự thỏa hiệp
4. Đề xuất các biện pháp kiểm soát bổ sung để giải quyết các khoảng trống
