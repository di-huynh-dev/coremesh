---
title: "Cơ sở hạ tầng khóa công khai (PKI)"
description: Hiểu cách PKI thiết lập niềm tin thông qua cơ quan cấp chứng chỉ, chuỗi tin cậy và quản lý vòng đời chứng chỉ.
order: 4
---

Cơ sở hạ tầng khóa công khai (PKI) là khuôn khổ giúp chứng chỉ kỹ thuật số trở nên đáng tin cậy. Nếu không có PKI, bất kỳ ai cũng có thể tạo chứng chỉ tự xưng là "google.com" - PKI giải quyết vấn đề xác minh rằng chứng chỉ thực sự thuộc về người mà nó tuyên bố đại diện.

PKI trả lời câu hỏi cơ bản: **Làm cách nào để tin cậy vào khóa chung mà tôi chưa từng thấy trước đây?**

## Vấn đề tin cậy

Hãy tưởng tượng bạn truy cập `https://bank.com`. Máy chủ xuất trình chứng chỉ có khóa chung. Làm sao bạn biết:

1. Chứng chỉ này thực sự thuộc về Bank.com?
2. Nó không được tạo ra bởi kẻ tấn công?
3. Nó chưa bị thu hồi hoặc giả mạo?

PKI giải quyết vấn đề này thông qua **Zhierarchy of Trust** - các bên thứ ba đáng tin cậy (Cơ quan cấp chứng chỉ) xác nhận tính xác thực của chứng chỉ.

## Thành phần PKI

| thành phần | Vai trò | Ví dụ |
|-----------|------|--------|
| **Root CA** | Neo tin cậy cuối cùng, ký các CA trung gian | DigiCert, Hãy mã hóa |
| **Trung cấp CA** | Cấp chứng chỉ, được ký bởi Root CA | Hãy mã hóa R3 |
| **Chứng chỉ thực thể cuối** | Chứng chỉ máy chủ của bạn | `CN=example.com` |
| **Danh sách thu hồi chứng chỉ (CRL)** | Danh sách các chứng chỉ bị thu hồi | `http://crl.ca.com/revoked.crl` |
| Bộ phản hồi **OCSP** | Trạng thái thu hồi theo thời gian thực | `http://ocsp.ca.com` |

## Chuỗi tin cậy hoạt động như thế nào

```
[Root CA Certificate]        <- Pre-installed in browsers/OS
         |
         | signs
         v
[Intermediate CA Certificate] <- Downloaded with your cert
         |
         | signs
         v
[Your Server Certificate]     <- Proves you are example.com
```

### Tại sao lại là CA trung cấp?

1. **Security**: Khóa riêng của Root CA vẫn ngoại tuyến (air-gapped)
2. **DNgăn chặn thiệt hại**: Trung gian bị xâm phạm có thể bị thu hồi mà không cần thu hồi root
3. **Tính linh hoạt trong hoạt động**: Các sản phẩm trung gian khác nhau cho các mục đích khác nhau

### Xác thực chuỗi chứng chỉ

```bash
# Download and examine the full chain
openssl s_client -connect example.com:443 -showcerts </dev/null 2>/dev/null | \
  grep -E "subject|issuer"

# Output shows the chain:
# subject=CN = example.com
# issuer=C = US, O = Let's Encrypt, CN = R3
# subject=C = US, O = Let's Encrypt, CN = R3
# issuer=C = US, O = Internet Security Research Group, CN = ISRG Root X1
```

```python
import ssl
import socket

def get_certificate_chain(hostname: str, port: int = 443) -> list:
    """Retrieve the certificate chain from a server."""
    context = ssl.create_default_context()
    
    with socket.create_connection((hostname, port)) as sock:
        with context.wrap_socket(sock, server_hostname=hostname) as ssock:
            # Get the certificate chain
            cert = ssock.getpeercert()
            chain = ssock.getpeercert(binary_form=False)
            
            return {
                'subject': dict(x[0] for x in cert['subject']),
                'issuer': dict(x[0] for x in cert['issuer']),
                'valid_from': cert['notBefore'],
                'valid_until': cert['notAfter'],
                'san': cert.get('subjectAltName', []),
            }

# Example
chain = get_certificate_chain('example.com')
print(f"Subject: {chain['subject']}")
print(f"Issuer: {chain['issuer']}")
```

## Cửa hàng ủy thác

Cửa hàng tin cậy là tập hợp các chứng chỉ CA gốc đáng tin cậy. Trình duyệt/HĐH của bạn đi kèm với chứng chỉ gốc được cài đặt sẵn.

### Cửa hàng tin cậy hệ thống

| Hệ thống | Vị trí |
|--------|----------|
| **Linux (Debian/Ubuntu)** | `/etc/ssl/certs/ca-certificates.crt` |
| **Linux (RHEL/CentOS)** | `/etc/pki/tls/certs/ca-bundle.crt` |
| **macOS** | Ứng dụng truy cập chuỗi khóa |
| **Windows** | Trình quản lý chứng chỉ (`certmgr.msc`) |
| **Node.js** | Tích hợp hoặc `NODE_EXTRA_CA_CERTS` env var |
| **Python** | Gói `certifi` hoặc chứng chỉ hệ thống |
| **Java** | `$JAVA_HOME/lib/security/cacerts` |

### Thêm chứng chỉ CA tùy chỉnh

```bash
# Linux (Debian/Ubuntu)
sudo cp my-ca.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates

# Linux (RHEL/CentOS)
sudo cp my-ca.crt /etc/pki/ca-trust/source/anchors/
sudo update-ca-trust

# Docker - add during build
COPY my-ca.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates

# Kubernetes - mount as secret
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: app
      volumeMounts:
        - name: ca-cert
          mountPath: /etc/ssl/certs/my-ca.crt
          subPath: my-ca.crt
  volumes:
    - name: ca-cert
      secret:
        secretName: custom-ca-cert
```

## Thu hồi chứng chỉ

Khi khóa riêng của chứng chỉ bị xâm phạm, chứng chỉ đó phải bị thu hồi. PKI cung cấp hai cơ chế:

### Danh sách thu hồi chứng chỉ (CRL)

```bash
# Find CRL distribution point in certificate
openssl x509 -in cert.pem -noout -text | grep -A 2 "CRL Distribution"

# Download and examine CRL
curl -O http://crl.example.com/ca.crl
openssl crl -in ca.crl -inform DER -text -noout
```

**DHậu quả của CRL:**
- Có thể trở nên lớn (hàng triệu mục)
- Phải tải xuống toàn bộ danh sách
- Được lưu vào bộ nhớ đệm nên việc thu hồi không diễn ra ngay lập tức

### Giao thức trạng thái chứng chỉ trực tuyến (OCSP)

```bash
# Check certificate status via OCSP
openssl ocsp -issuer chain.pem -cert server.pem \
  -url http://ocsp.example.com -resp_text

# Response will show:
# Cert Status: good (or revoked)
```

**OCSP Stapling** - Máy chủ tìm nạp trước phản hồi OCSP và gửi nó cùng với chứng chỉ:

```nginx
# Nginx OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /path/to/chain.pem;
resolver 8.8.8.8 8.8.4.4 valid=300s;
```

## Vòng đời chứng chỉ

```
1. Key Generation     2. CSR Creation     3. CA Signing      4. Deployment
    [Private Key] --> [CSR] -----------> [Certificate] --> [Server]
                           Submit to CA     CA validates
                                           and signs
                                           
5. Monitoring         6. Renewal          7. Revocation (if needed)
   [Check expiry] --> [New cert] ----or-- [CRL/OCSP update]
```

### Tự động hóa vòng đời chứng chỉ

```yaml
# cert-manager for Kubernetes
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: app-cert
  namespace: production
spec:
  secretName: app-tls
  duration: 2160h    # 90 days
  renewBefore: 360h  # Renew 15 days before expiry
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - app.example.com
    - api.example.com
```

```python
# Certificate monitoring script
import ssl
import socket
from datetime import datetime
import smtplib
from email.message import EmailMessage

def check_cert_expiry(hostname: str) -> int:
    """Return days until certificate expires."""
    context = ssl.create_default_context()
    
    with socket.create_connection((hostname, 443)) as sock:
        with context.wrap_socket(sock, server_hostname=hostname) as ssock:
            cert = ssock.getpeercert()
            not_after = datetime.strptime(
                cert['notAfter'], 
                '%b %d %H:%M:%S %Y %Z'
            )
            return (not_after - datetime.utcnow()).days

def alert_expiring_certs(domains: list, threshold_days: int = 30):
    """Alert on certificates expiring soon."""
    expiring = []
    
    for domain in domains:
        try:
            days = check_cert_expiry(domain)
            if days < threshold_days:
                expiring.append((domain, days))
        except Exception as e:
            expiring.append((domain, f"ERROR: {e}"))
    
    if expiring:
        print("Certificates expiring soon:")
        for domain, days in expiring:
            print(f"  {domain}: {days} days")
        # Send alert email, Slack notification, etc.

# Monitor your domains
domains = [
    'example.com',
    'api.example.com',
    'admin.example.com'
]
alert_expiring_certs(domains, threshold_days=30)
```

## Xây dựng PKI riêng

Đối với các dịch vụ nội bộ, bạn có thể muốn Cơ quan cấp chứng chỉ của riêng mình:

### Tạo CA gốc

```bash
# Generate Root CA private key (keep this VERY secure)
openssl genrsa -aes256 -out root-ca.key 4096

# Create Root CA certificate (valid 10 years)
openssl req -x509 -new -nodes -key root-ca.key \
  -sha256 -days 3650 \
  -out root-ca.crt \
  -subj "/C=US/ST=State/L=City/O=MyOrg/CN=MyOrg Root CA"
```

### Tạo CA trung gian

```bash
# Generate Intermediate CA key
openssl genrsa -aes256 -out intermediate-ca.key 4096

# Create CSR for Intermediate CA
openssl req -new -key intermediate-ca.key \
  -out intermediate-ca.csr \
  -subj "/C=US/ST=State/L=City/O=MyOrg/CN=MyOrg Intermediate CA"

# Sign Intermediate CA with Root CA (valid 5 years)
openssl x509 -req -in intermediate-ca.csr \
  -CA root-ca.crt -CAkey root-ca.key \
  -CAcreateserial -days 1825 -sha256 \
  -extfile <(echo "basicConstraints=critical,CA:TRUE,pathlen:0") \
  -out intermediate-ca.crt
```

### Cấp chứng chỉ thực thể cuối

```bash
# Generate server key
openssl genrsa -out server.key 2048

# Create CSR
openssl req -new -key server.key \
  -out server.csr \
  -subj "/CN=internal.example.com"

# Sign with Intermediate CA
openssl x509 -req -in server.csr \
  -CA intermediate-ca.crt -CAkey intermediate-ca.key \
  -CAcreateserial -days 365 -sha256 \
  -extfile <(echo -e "subjectAltName=DNS:internal.example.com,DNS:*.internal.example.com") \
  -out server.crt

# Create full chain
cat server.crt intermediate-ca.crt > server-fullchain.crt
```

### HashiCorp Vault là CA riêng

```bash
# Enable PKI secrets engine
vault secrets enable pki

# Configure maximum TTL
vault secrets tune -max-lease-ttl=87600h pki

# Generate root certificate
vault write pki/root/generate/internal \
  common_name="MyOrg Root CA" \
  ttl=87600h

# Enable intermediate PKI
vault secrets enable -path=pki_int pki
vault secrets tune -max-lease-ttl=43800h pki_int

# Create intermediate CA (signed by root)
vault write pki_int/intermediate/generate/internal \
  common_name="MyOrg Intermediate CA"

# Create a role for issuing certificates
vault write pki_int/roles/internal-servers \
  allowed_domains="internal.example.com" \
  allow_subdomains=true \
  max_ttl=720h

# Issue a certificate
vault write pki_int/issue/internal-servers \
  common_name="app.internal.example.com" \
  ttl=24h
```

## Thực tiễn tốt nhất về bảo mật PKI

### 1. Bảo vệ khóa riêng

```bash
# Set restrictive permissions
chmod 600 private-key.pem
chown root:root private-key.pem

# Use Hardware Security Modules (HSMs) for CA keys
# AWS CloudHSM, Azure Dedicated HSM, or physical HSMs
```

### 2. Sử dụng thời gian tồn tại của chứng chỉ ngắn

```yaml
# Modern best practices
recommended_lifetimes:
  root_ca: 10-20 years  # Rarely rotated
  intermediate_ca: 3-5 years
  server_certificates: 90 days  # Let's Encrypt default
  client_certificates: 24-72 hours  # For automated systems
```

### 3. Triển khai tính minh bạch của chứng chỉ

Nhật ký về tính minh bạch của chứng chỉ (CT) cung cấp các dấu vết kiểm tra công khai:

```bash
# Check if certificate is in CT logs
curl "https://crt.sh/?q=example.com&output=json" | jq
```

### 4. Giám sát các chứng chỉ trái phép

```python
import requests
import json

def check_ct_logs(domain: str) -> list:
    """Check Certificate Transparency logs for a domain."""
    url = f"https://crt.sh/?q={domain}&output=json"
    response = requests.get(url)
    
    if response.status_code == 200:
        certs = response.json()
        return [
            {
                'issuer': cert['issuer_name'],
                'not_before': cert['not_before'],
                'not_after': cert['not_after'],
            }
            for cert in certs[:10]  # Last 10 certificates
        ]
    return []

# Alert on unexpected certificates
certs = check_ct_logs('example.com')
for cert in certs:
    print(f"Cert issued by {cert['issuer']} on {cert['not_before']}")
```

## PKI trong bối cảnh DevOps

### Quản lý chứng chỉ lưới dịch vụ

```yaml
# Istio automatic mTLS with cert rotation
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
spec:
  mtls:
    mode: STRICT

# Certificates automatically:
# - Generated by Istio CA (istiod)
# - Rotated every 24 hours
# - Distributed to sidecars
```

### Ký container image

```bash
# Sign container images with cosign (Sigstore)
cosign generate-key-pair
cosign sign --key cosign.key myregistry/myimage:v1.0

# Verify signature
cosign verify --key cosign.pub myregistry/myimage:v1.0

# Keyless signing with Fulcio CA
cosign sign myregistry/myimage:v1.0  # Uses OIDC identity
```

### Ký Git commit

```bash
# Generate GPG key
gpg --full-generate-key

# Configure Git to sign commits
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# Sign a commit
git commit -S -m "Signed commit"

# Verify signatures
git log --show-signature
```

## Các vấn đề PKI phổ biến

### 1. "Chứng chỉ không đáng tin cậy"

```bash
# Check if root CA is in trust store
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt cert.pem

# Solutions:
# - Add CA to system trust store
# - Include full chain in server config
# - Update ca-certificates package
```

### 2. "Chứng chỉ đã hết hạn"

```bash
# Check certificate dates
openssl x509 -in cert.pem -noout -dates

# Check system time (NTP issues)
date
timedatectl status
```

### 3. "Tên máy chủ không khớp"

```bash
# Check certificate SANs
openssl x509 -in cert.pem -noout -ext subjectAltName

# Ensure connecting hostname matches CN or SAN entry
```

## Tóm tắt

Những điểm chính của PKI:

- **Trust chuỗi** thiết lập tính xác thực - chứng chỉ được tin cậy vì chúng liên kết với CA gốc đáng tin cậy
- **Root CA luôn ngoại tuyến** - trung gian cấp chứng chỉ hàng ngày
- **Vấn đề thu hồi** - sử dụng tính năng ghim OCSP cho trạng thái thời gian thực
- **Tự động hóa vòng đời** - các công cụ như trình quản lý chứng chỉ ngăn chặn tình trạng ngừng hoạt động khi hết hạn
- **Private PKI** dành cho dịch vụ nội bộ - HashiCorp Vault hoặc thiết lập CA thủ công
- **Tuổi thọ ngắn** giảm mức độ phơi nhiễm - 90 ngày hoặc ít hơn đối với chứng chỉ máy chủ
- **Monitor CT log** - phát hiện việc cấp chứng chỉ trái phép

Điều này kết thúc hướng dẫn Những điều cơ bản về Mật mã học. Bây giờ bạn đã hiểu các khối xây dựng của hệ thống bảo mật: mã hóa bảo vệ tính bảo mật, hàm băm đảm bảo tính toàn vẹn, TLS bảo mật dữ liệu khi truyền và PKI thiết lập sự tin cậy.
