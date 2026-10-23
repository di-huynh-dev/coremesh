---
title: "Bộ ba CIA"
description: Hiểu về tính bảo mật, tính toàn vẹn và tính sẵn sàng - ba trụ cột của bảo mật thông tin.
order: 1
---

Bộ ba CIA là nền tảng của bảo mật thông tin. Nó cung cấp một khuôn khổ để suy nghĩ về các biện pháp kiểm soát bảo mật và giúp bạn đưa ra quyết định về việc bảo vệ hệ thống và dữ liệu của mình. Mọi biện pháp bảo mật bạn triển khai phải giải quyết một hoặc nhiều trong số ba nguyên tắc này.

## Bộ ba CIA là gì?

Bộ ba CIA bao gồm ba nguyên tắc cơ bản:

- **Confidentiality**: Đảm bảo thông tin chỉ có thể được truy cập bởi những cá nhân được ủy quyền
- **Integrity**: Đảm bảo thông tin chính xác và không bị giả mạo
- **Availability**: Đảm bảo thông tin và hệ thống có thể truy cập được khi cần

Ba nguyên tắc này thường tạo ra sự căng thẳng với nhau. Ví dụ: làm cho dữ liệu có tính sẵn sàng cao có thể làm giảm tính bảo mật hoặc việc kiểm tra tính toàn vẹn mạnh mẽ có thể ảnh hưởng đến tính khả dụng. Kiến trúc bảo mật tốt cân bằng được cả ba điều trên.

## Bảo mật

Tính bảo mật đảm bảo rằng thông tin nhạy cảm được bảo vệ khỏi sự truy cập trái phép. Đây là về việc giữ bí mật bí mật.

### Đe dọa tính bảo mật

- **Vi phạm dữ liệu**: Truy cập trái phép vào cơ sở dữ liệu hoặc hệ thống tệp
- **Tấn công trung gian**: Chặn dữ liệu đang truyền
- **Kỹ thuật xã hội**: Lừa người dùng tiết lộ thông tin
- **Kiểm soát truy cập không đúng cách**: Quyền quá dễ dãi

### Kiểm soát tính bảo mật

#### Mã hóa

Mã hóa biến đổi dữ liệu có thể đọc được thành văn bản mã hóa không thể đọc được và chỉ có thể giải mã được bằng khóa chính xác. Đây là biện pháp bảo vệ chính giúp bạn chống lại hành vi trộm cắp dữ liệu—ngay cả khi kẻ tấn công có quyền truy cập vào tệp của bạn hoặc chặn lưu lượng truy cập mạng, chúng không thể đọc dữ liệu được mã hóa nếu không có khóa giải mã.

**EMã hóa các tập tin ở phần còn lại** bảo vệ dữ liệu được lưu trữ trên đĩa. GPG (GNU Privacy Guard) là một công cụ được sử dụng rộng rãi để mã hóa tệp:

```bash
# Encrypt a file with GPG
gpg --symmetric --cipher-algo AES256 sensitive-data.txt
# This creates sensitive-data.txt.gpg - the original remains unencrypted
# Use --armor flag to create ASCII output for email/text transmission

# Encrypt data in transit with TLS
openssl s_client -connect example.com:443
# This tests the TLS connection and shows certificate details
```

**Tại sao lại là AES256?** AES (Tiêu chuẩn mã hóa nâng cao) với khóa 256-bit được coi là an toàn trước các cuộc tấn công vũ phu. Ngay cả với tất cả sức mạnh tính toán của thế giới, việc phá vỡ AES-256 sẽ mất nhiều thời gian hơn tuổi của vũ trụ.

#### Kiểm soát truy cập

Quyền truy cập tệp là tuyến phòng thủ đầu tiên của bạn trên bất kỳ hệ thống Unix/Linux nào. Họ kiểm soát ai có thể đọc, viết hoặc thực thi tệp. Việc hiểu và định cấu hình đúng các quyền này sẽ ngăn chặn việc truy cập trái phép vào dữ liệu nhạy cảm.

Hệ thống cấp phép sử dụng ba loại: **owner** (u), **group** (g) và **others** (o). Mỗi danh mục có thể có các quyền **read** (4), **write** (2) và **execute** (1).

```bash
# Restrict file access to owner only
chmod 600 /path/to/sensitive-file
# 600 = owner can read/write (6), group and others have no access (0,0)

# Set restrictive directory permissions
chmod 700 /path/to/sensitive-directory
# 700 = owner has full access (7), no access for group/others
# The execute bit on directories means "can enter/list contents"
```

**Các lỗi cấp phép thường gặp:**
- Đặt 777 (có thể ghi trên thế giới) trên bất kỳ tệp hoặc thư mục nào
- Để tất cả người dùng có thể đọc được các cấu hình nhạy cảm (644 thay vì 600)
- Không kiểm tra quyền sau khi giải nén tài liệu lưu trữ

#### Quản lý bí mật

Bí mật được mã hóa cứng là một trong những lỗ hổng bảo mật phổ biến nhất. Khi các bí mật nằm trong mã của bạn, chúng sẽ nằm trong quyền kiểm soát phiên bản, nhật ký, thông báo lỗi và cuối cùng rơi vào tay kẻ tấn công. Thay vào đó, hãy sử dụng trình quản lý bí mật cung cấp khả năng lưu trữ tập trung, kiểm soát quyền truy cập và ghi nhật ký kiểm tra.

```yaml
# Bad: Hardcoded secret
# This will end up in Git history forever, even if you delete it later
database_password: "mysecretpassword"

# Good: Reference from secrets manager
# The actual secret is stored securely and retrieved at runtime
database_password: ${vault:database/credentials#password}
```

**Các trình quản lý bí mật phổ biến bao gồm:**
- **HashiCorp Vault**: Tự lưu trữ, giàu tính năng, tuyệt vời cho doanh nghiệp
- **AWS Secrets Manager**: Dịch vụ được quản lý với tính năng xoay vòng tự động
- **Azure Key Vault**: Dịch vụ bí mật được quản lý của Microsoft
- **SOPS**: Mã hóa bí mật trong tệp, hoạt động với Git

### Ví dụ trong thế giới thực: Bảo vệ khóa API

Hãy xem qua một ví dụ hoàn chỉnh về việc truy xuất và sử dụng khóa API một cách an toàn. Mẫu này giữ bí mật khỏi các tệp môi trường và cơ sở mã của bạn:

```bash
# Retrieve the secret from Vault at runtime
# This creates a short-lived environment variable only for this session
export API_KEY=$(vault kv get -field=api_key secret/myapp)

# Use the API key in your application
# The key never touches disk or appears in your command history
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/data

# For production applications, inject secrets via:
# - Kubernetes Secrets (mounted as files or env vars)
# - AWS Parameter Store with IAM-based access
# - HashiCorp Vault Agent sidecar
```

**Mẹo bảo mật:** Tránh sử dụng `export` trong các tập lệnh shell có thể được ghi lại. Thay vào đó, hãy chuyển bí mật trực tiếp tới lệnh hoặc sử dụng tính năng thay thế quy trình.

## Tính chính trực

Tính toàn vẹn đảm bảo rằng dữ liệu vẫn chính xác, đầy đủ và đáng tin cậy trong suốt vòng đời của nó. Điều này có nghĩa là ngăn chặn các sửa đổi trái phép và phát hiện khi có thay đổi xảy ra.

### Đe dọa tính chính trực

- **Sửa đổi trái phép**: Kẻ tấn công thay đổi dữ liệu hoặc mã
- **Thay đổi ngẫu nhiên**: Lỗi con người làm hỏng dữ liệu
- **Malware**: Phần mềm sửa đổi tập tin hoặc dữ liệu
- **Tấn công trung gian**: Thay đổi dữ liệu đang truyền

### Kiểm soát tính toàn vẹn

#### Tổng kiểm tra và băm

Băm mật mã hàm tạo ra một "dấu vân tay" duy nhất của một tệp. Ngay cả một thay đổi nhỏ cũng tạo ra một hàm băm hoàn toàn khác. Điều này cho phép bạn xác minh rằng các tệp không bị giả mạo trong quá trình tải xuống, lưu trữ hoặc truyền.

**SHA-256** (Thuật toán băm an toàn với đầu ra 256 bit) là tiêu chuẩn hiện tại. Các thuật toán cũ hơn như MD5 và SHA-1 có các lỗ hổng đã biết và nên tránh vì mục đích bảo mật.

```bash
# Generate SHA256 checksum
sha256sum important-file.tar.gz > checksum.txt
# Output looks like: 3a7bd3e2f1c8... important-file.tar.gz

# Verify checksum later
sha256sum -c checksum.txt
# important-file.tar.gz: OK
# If the file was modified, you'll see: FAILED
```

**Khi nào nên sử dụng tổng kiểm tra:**
- Sau khi tải phần mềm về (so sánh với checksum của nhà xuất bản)
- Trước và sau khi chuyển file giữa các hệ thống
- Là một phần của quy trình xác minh dự phòng
- Trong CI/CD pipeline để xác minh tính toàn vẹn của artifact

#### Chữ ký số

Mặc dù tổng kiểm tra xác minh tính toàn vẹn nhưng chúng không chứng minh ai đã tạo tệp. Chữ ký số giải quyết vấn đề này bằng cách kết hợp hàm băm với khóa mật mã. Chữ ký chứng minh cả tính toàn vẹn (tệp chưa thay đổi) và tính xác thực (tệp đến từ nguồn dự kiến).

```bash
# Sign a file with GPG
gpg --armor --detach-sign release.tar.gz
# Creates release.tar.gz.asc containing the signature

# Verify the signature
gpg --verify release.tar.gz.asc release.tar.gz
# Shows: Good signature from "Developer Name <dev@example.com>"
```

**Quan trọng:Xác minh ** chỉ hoạt động nếu bạn tin cậy khóa chung. Luôn xác minh dấu vân tay chính thông qua một kênh đáng tin cậy.

#### Ký Git commit

Git commit chưa được ký chỉ hiển thị ai * tuyên bố* đã tạo ra chúng. Bất kỳ ai cũng có thể mạo danh nhà phát triển khác. commit đã ký bằng mật mã chứng minh danh tính của tác giả, điều này rất quan trọng để tuân thủ và phát hiện các tài khoản bị xâm phạm.

```bash
# Configure Git to sign commits
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_GPG_KEY_ID
# Find your key ID with: gpg --list-secret-keys --keyid-format LONG

# Sign a commit
git commit -S -m "Add new feature"

# Verify signed commits
git log --show-signature
# Shows "Good signature from..." for verified commits
```

**GitHub và GitLab** hiển thị huy hiệu "Đã xác minh" trên commit đã ký, giúp người đánh giá tin tưởng rằng commit là xác thực.

### Ví dụ trong thế giới thực: Xác minh container image

container image là mục tiêu hàng đầu cho các cuộc tấn công chuỗi cung ứng. Kẻ tấn công xâm phạm sổ đăng ký của bạn có thể thay thế image hợp pháp bằng những mã độc hại. Việc ký image cho phép bạn xác minh rằng image chưa bị giả mạo trước khi triển khai chúng.

**Cosign** (một phần của dự án Sigstore) là tiêu chuẩn hiện đại cho việc ký container image:

```bash
# Sign container images with cosign
cosign sign --key cosign.key myregistry.io/myapp:v1.0.0
# This attaches a signature to the image in the registry

# Verify before deployment
cosign verify --key cosign.pub myregistry.io/myapp:v1.0.0
# Fails if signature doesn't match or is missing
```

**Trong Kubernetes**, bạn có thể thực thi xác minh image bằng cách sử dụng các bộ điều khiển tiếp nhận như Kyverno hoặc OPA Gatekeeper, ngăn không cho triển khai mọi image chưa được ký.

## Sẵn có

Tính sẵn sàng đảm bảo rằng hệ thống và dữ liệu có thể truy cập được khi người dùng được ủy quyền cần chúng. Thời gian ngừng hoạt động có thể gây tổn hại tương tự như vi phạm an ninh.

### Các mối đe dọa đối với tính sẵn có

- **DDoS tấn công**: Hệ thống có lưu lượng truy cập quá lớn
- **Lỗi phần cứng**: Đĩa bị treo, mất điện
- **Lỗi phần mềm**: Sự cố và rò rỉ bộ nhớ
- **Ransomware**: Mã hóa dữ liệu và yêu cầu thanh toán

### Kiểm soát tính sẵn có

#### Dự phòng và chuyển đổi dự phòng

Chìa khóa của tính sẵn sàng là loại bỏ các điểm lỗi duy nhất. Nếu bất kỳ thành phần nào có thể phá hủy toàn bộ hệ thống của bạn thì bạn cần có sự dự phòng. Điều này áp dụng cho máy chủ, cơ sở dữ liệu, kết nối mạng và thậm chí cả trung tâm dữ liệu.

**Kubernetes** giúp việc dự phòng trở nên dễ dàng bằng cách cho phép bạn chạy nhiều bản sao ứng dụng của mình. Nếu một pod bị lỗi, lưu lượng sẽ tự động định tuyến đến pod tốt:

```yaml
# Kubernetes deployment with replicas
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3  # Run 3 identical copies for redundancy
  selector:
    matchLabels:
      app: web-app
  template:
    spec:
      containers:
      - name: web
        image: myapp:latest
        resources:  # Resource limits prevent one pod from starving others
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

**Tại sao lại có 3 bản sao?** Với 3 bản sao, bạn có thể mất 1 pod và vẫn có 2 bản sao xử lý. Điều này cũng cho phép cập nhật liên tục mà không có thời gian chết. Đối với các dịch vụ quan trọng, hãy xem xét hơn 5 bản sao trải rộng trên các vùng sẵn sàng.

#### Chiến lược dự phòng

Sao lưu là tuyến phòng thủ cuối cùng của bạn chống lại việc mất dữ liệu. Quy tắc dự phòng **3-2-1** là một tiêu chuẩn ngành đã cứu vô số tổ chức khỏi thảm họa:

- **3** bản sao dữ liệu của bạn (production + 2 bản sao lưu)
- **2** phương tiện lưu trữ khác nhau (ví dụ: đĩa + đám mây)
- **1** sao chép ngoại vi (bảo vệ khỏi thảm họa trên toàn trang web)

```bash
# Example: Backup to S3 with versioning
aws s3 sync /data s3://my-backup-bucket/data --delete
# --delete removes files from S3 that no longer exist locally
# Be careful: this can delete good backups if local data is corrupted!

# Enable versioning for recovery
aws s3api put-bucket-versioning \
  --bucket my-backup-bucket \
  --versioning-configuration Status=Enabled
# Versioning keeps previous versions even after overwrites or deletes
# Critical for recovering from ransomware or accidental deletions
```

**Kiểm tra sao lưu là điều cần thiết.** Các bản sao lưu chưa được kiểm tra không phải là bản sao lưu. Lên lịch thực hiện khôi phục thường xuyên để xác minh các bản sao lưu của bạn thực sự hoạt động.

#### Bảo vệ DDoS

Các cuộc tấn công từ chối dịch vụ phân tán (DDoS) làm tràn lưu lượng truy cập vào hệ thống của bạn, khiến chúng không khả dụng đối với người dùng hợp pháp. Phòng thủ đòi hỏi nhiều lớp:

```bash
# Rate limiting with iptables
iptables -A INPUT -p tcp --dport 80 \
  -m connlimit --connlimit-above 50 -j DROP
# Limits each IP to 50 concurrent connections
# Legitimate users rarely need more than a few connections

# Use a WAF or CDN for additional protection
# Services like Cloudflare, AWS WAF, or Akamai can absorb
# large-scale attacks before traffic reaches your servers
```

Chỉ giới hạn tốc độ ** là không đủ** cho các cuộc tấn công DDoS nghiêm trọng. Các cuộc tấn công lớn có thể vượt quá hàng trăm gigabit mỗi giây—nhiều hơn mức mà hầu hết các tổ chức có thể xử lý. Các dịch vụ bảo vệ DDoS dựa trên đám mây có khả năng ngăn chặn các cuộc tấn công này.

### Ví dụ thực tế: Kiểm tra sức khỏe

Kiểm tra tình trạng cho phép các hệ thống điều phối (như Kubernetes) tự động phát hiện và thay thế các trường hợp không tốt. Điều này biến việc ứng phó sự cố thủ công thành khả năng tự phục hồi tự động.

**Hai loại đầu dò:**
- **Đầu dò sự sống**: Ứng dụng có đang chạy không? Nếu thất bại, Kubernetes sẽ khởi động lại container.
- **Đầu dò sẵn sàng**: Ứng dụng có thể xử lý lưu lượng truy cập không? Nếu không thành công, pod sẽ bị xóa khỏi bộ cân bằng tải nhưng không được khởi động lại.

```yaml
# Kubernetes liveness and readiness probes
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10  # Wait 10s before first check (app startup time)
  periodSeconds: 5         # Check every 5 seconds
  failureThreshold: 3      # Restart after 3 consecutive failures
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5   # Can be ready before liveness starts
  periodSeconds: 3         # Check more frequently for quick traffic routing
```

**Tip:** Điểm cuối `/health` của bạn phải kiểm tra các phần phụ thuộc quan trọng (cơ sở dữ liệu, bộ đệm) để container khởi động lại nếu có vấn đề gì đó về cơ bản bị hỏng. Điểm cuối `/ready` có thể nhẹ nhàng hơn.

## Cân bằng Bộ ba CIA

Ba nguyên tắc thường tạo ra sự đánh đổi:

| Kịch bản | Bảo mật | Tính chính trực | sẵn có | Đánh đổi |
|----------|-----------------|-----------|--------------|----------|
| Trang web công cộng | Thấp | Trung bình | Cao | Ưu tiên thời gian hoạt động hơn là bí mật |
| Hệ thống ngân hàng | Cao | Cao | Cao | Cả ba đều quan trọng, chi phí cao nhất |
| Hồ sơ sức khỏe | Cao | Cao | Trung bình | Quyền riêng tư và độ chính xác khi truy cập 24/7 |
| Wiki nội bộ | Trung bình | Trung bình | Cao | Dễ dàng truy cập cho năng suất |

### Đưa ra quyết định đánh đổi

Khi thiết kế hệ thống, hãy hỏi:

1. **Chúng tôi đang bảo vệ dữ liệu gì?** (Cá nhân, tài chính, công cộng)
2. **Hậu quả của việc vi phạm là gì?** (Pháp lý, uy tín, tài chính)
3. **Ai cần quyền truy cập?** (Mọi người, người dùng được xác thực, vai trò cụ thể)
4. **Thời gian ngừng hoạt động được chấp nhận là bao nhiêu?** (Phút, giờ, ngày)

## Bài học chính

- Bộ ba CIA cung cấp khuôn khổ cho việc ra quyết định về an ninh
- **Confidentiality**: Bảo vệ dữ liệu nhạy cảm thông qua mã hóa và kiểm soát truy cập
- **Integrity**: Đảm bảo độ chính xác của dữ liệu thông qua tổng kiểm tra, chữ ký và dấu vết kiểm tra
- **Aavailability**: Duy trì thời gian hoạt động thông qua dự phòng, sao lưu và giám sát
- Cân bằng cả ba dựa trên trường hợp sử dụng cụ thể và khả năng chấp nhận rủi ro của bạn

## Bài tập thực hành

Phân tích hệ thống bạn làm việc cùng:

1. Xác định dữ liệu quan trọng nhất mà nó xử lý
2. Đánh giá khả năng bảo vệ CIA hiện tại của nó (1-5 cho mỗi)
3. Xác định một cải tiến cho mỗi nguyên tắc
4. Hãy xem xét sự đánh đổi của việc thực hiện những cải tiến đó
