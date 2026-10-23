---
title: "Nguyên tắc cơ bản về TLS/SSL"
description: Hiểu cách TLS bảo vệ dữ liệu trong quá trình truyền, tìm hiểu về các loại chứng chỉ, bắt tay TLS và các cấu hình sai phổ biến cần tránh.
order: 3
---

Bảo mật lớp vận chuyển (TLS) là giao thức bảo mật HTTPS, bảo vệ dữ liệu khi nó di chuyển giữa máy khách và máy chủ. Mỗi khi bạn nhìn thấy biểu tượng ổ khóa trong trình duyệt của mình, TLS đang mã hóa kết nối của bạn bằng cách sử dụng các nguyên tắc mật mã mà chúng tôi đã đề cập trong các phần trước.

TLS là sự kế thừa của SSL (Lớp cổng bảo mật). Mặc dù "SSL" vẫn được sử dụng phổ biến nhưng tất cả các phiên bản SSL đều không được dùng nữa và không an toàn. Các hệ thống hiện đại sử dụng TLS 1.2 hoặc TLS 1.3.

## Cách thức hoạt động của TLS: Bức tranh lớn

TLS cung cấp ba thuộc tính bảo mật:

| Tài sản | TLS đạt được điều đó như thế nào |
|----------|--------------------|
| **Tính bảo mật** | Mã hóa đối xứng (AES-GCM) |
| **Tính toàn vẹn** | Xác thực HMAC/AEAD |
| **Xác thực** | Chứng chỉ + tiền điện tử bất đối xứng |

Quá trình bắt tay TLS thiết lập các thuộc tính này trước khi bất kỳ dữ liệu ứng dụng nào được trao đổi.

## Bắt tay TLS 1.3

TLS 1.3 đã đơn giản hóa quá trình bắt tay từ 2 lần khứ hồi thành 1:

```
Client                                              Server
  |
  |  1. ClientHello
  |     - Supported TLS versions
  |     - Supported cipher suites
  |     - Client random
  |     - Key share (ECDHE public key)
  |-------------------------------------------------->
  |
  |  2. ServerHello + EncryptedExtensions +
  |     Certificate + CertificateVerify + Finished
  |     - Selected cipher suite
  |     - Server random
  |     - Key share (ECDHE public key)
  |     - Certificate chain
  |     - Signature proving key ownership
  |<--------------------------------------------------
  |
  |  3. Finished
  |     - Client confirmation
  |-------------------------------------------------->
  |
  |  [Application Data - Encrypted]
  |<------------------------------------------------->
```

### Điều gì xảy ra khi bắt tay

1. **Key Exchange**: Máy khách và máy chủ sử dụng ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) để lấy bí mật chung mà không truyền nó
2. **Authentication**: Máy chủ xuất trình chứng chỉ; khách hàng xác minh nó kết nối với một CA đáng tin cậy
3. **Khóa phiên**: Cả hai bên đều lấy khóa mã hóa đối xứng từ bí mật chung
4. **Encryption**: Tất cả dữ liệu tiếp theo được mã hóa bằng AES-GCM hoặc ChaCha20-Poly1305

## Phiên bản TLS

| Phiên bản | Trạng thái | Ghi chú |
|---------|--------|-------|
| **TLS 1.3** | Được đề xuất | Bắt tay 1-RTT nhanh nhất, an toàn nhất |
| **TLS 1.2** | Có thể chấp nhận được | Vẫn an toàn với cấu hình phù hợp |
| **TLS 1.1** | Không được dùng nữa | Bị vô hiệu hóa trong các trình duyệt hiện đại |
| **TLS 1.0** | Không được dùng nữa | Dễ bị THÚ, POODLE |
| **SSL 3.0** | bị hỏng | Không bao giờ sử dụng |
| **SSL 2.0** | bị hỏng | Không bao giờ sử dụng |

### Kiểm tra phiên bản TLS

```bash
# Check what TLS version a server supports
openssl s_client -connect example.com:443 -tls1_3

# Test with specific version
curl -v --tls-max 1.2 https://example.com

# Using nmap for comprehensive scan
nmap --script ssl-enum-ciphers -p 443 example.com
```

## Bộ mật mã

Bộ mật mã xác định các thuật toán được sử dụng cho mỗi TLS hàm:

```
TLS_AES_256_GCM_SHA384
    |    |    |    |
    |    |    |    +-- Hash for key derivation
    |    |    +------- Authentication mode (GCM = AEAD)
    |    +------------ Key size (256-bit)
    +----------------- Encryption algorithm (AES)
```

### Bộ mật mã được đề xuất (TLS 1.3)

TLS 1.3 chỉ cho phép bộ mật mã an toàn:

```
TLS_AES_256_GCM_SHA384        # AES-256 with GCM
TLS_AES_128_GCM_SHA256        # AES-128 with GCM
TLS_CHACHA20_POLY1305_SHA256  # ChaCha20 (mobile-friendly)
```

### Cấu hình bộ mật mã TLS 1.2

```nginx
# Nginx: Strong TLS 1.2 configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers on;
```

## Chứng chỉ

Chứng chỉ là tài liệu kỹ thuật số liên kết khóa công khai với danh tính. Chúng được ký bởi Cơ quan cấp chứng chỉ (CA) để thiết lập sự tin cậy.

### Nội dung chứng chỉ

```bash
# View certificate details
openssl s_client -connect example.com:443 </dev/null 2>/dev/null | \
  openssl x509 -text -noout

# Key information shown:
# - Subject: CN=example.com (who the cert is for)
# - Issuer: CN=Let's Encrypt (who signed it)
# - Validity: Not Before / Not After dates
# - Public Key: RSA or ECDSA public key
# - Signature: CA's signature proving authenticity
# - Extensions: SANs, key usage, etc.
```

### Các loại chứng chỉ

| loại | Xác thực | Trường hợp sử dụng |
|------|------------|----------|
| **DV** (Xác thực tên miền) | Chứng minh kiểm soát miền | Hầu hết các trang web, API |
| **OV** (Tổ chức đã được xác thực) | Chứng minh danh tính tổ chức | Trang web kinh doanh |
| **EV** (Xác thực mở rộng) | Xác minh tổ chức mở rộng | Ngân hàng, trang web có độ tin cậy cao |
| **Wildcard** | `*.example.com` | Nhiều tên miền phụ |
| **SAN/Đa miền** | Nhiều tên miền trong một chứng chỉ | Dịch vụ tổng hợp |

### Hãy mã hóa (Chứng chỉ DV miễn phí)

```bash
# Using certbot
sudo certbot certonly --nginx -d example.com -d www.example.com

# Auto-renewal (usually configured automatically)
sudo certbot renew --dry-run

# Certificate location
ls /etc/letsencrypt/live/example.com/
# cert.pem       - Your certificate
# chain.pem      - Intermediate certificates
# fullchain.pem  - cert.pem + chain.pem (use this)
# privkey.pem    - Private key (keep secret!)
```

## Chuỗi chứng chỉ tin cậy

Chứng chỉ tạo thành một chuỗi từ chứng chỉ của bạn đến CA gốc đáng tin cậy:

```
[Root CA Certificate] (Trusted by browsers/OS)
        |
        | signs
        v
[Intermediate CA Certificate]
        |
        | signs
        v
[Your Server Certificate]
```

### Xác minh chuỗi

```bash
# Check certificate chain
openssl s_client -connect example.com:443 -showcerts </dev/null

# Verify chain manually
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt \
  -untrusted intermediate.crt server.crt
```

## Cấu hình TLS phổ biến

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    # Certificates
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # Protocol versions
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Cipher suites (TLS 1.2)
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;  # Let client choose (TLS 1.3)
    
    # Session caching (performance)
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;  # Better forward secrecy
    
    # OCSP Stapling (faster validation)
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
}
```

### Apache

```apache
<VirtualHost *:443>
    ServerName example.com
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/example.com/privkey.pem
    
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    SSLHonorCipherOrder off
    
    Header always set Strict-Transport-Security "max-age=63072000"
</VirtualHost>
```

### Sự xâm nhập Kubernetes

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    # Use cert-manager for automatic certificates
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    # Force HTTPS
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    # HSTS
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Strict-Transport-Security "max-age=63072000" always;
spec:
  tls:
    - hosts:
        - app.example.com
      secretName: app-tls-secret
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app-service
                port:
                  number: 80
```

## Quản lý chứng chỉ

### Tạo CSR (Yêu cầu ký chứng chỉ)

```bash
# Generate private key and CSR
openssl req -new -newkey rsa:2048 -nodes \
  -keyout server.key \
  -out server.csr \
  -subj "/CN=example.com/O=My Company/C=US"

# View CSR contents
openssl req -in server.csr -text -noout

# Generate with Subject Alternative Names (SANs)
openssl req -new -newkey rsa:2048 -nodes \
  -keyout server.key -out server.csr \
  -subj "/CN=example.com" \
  -addext "subjectAltName=DNS:example.com,DNS:www.example.com,DNS:api.example.com"
```

### Chứng chỉ tự ký (Chỉ dành cho phát triển)

```bash
# Generate self-signed certificate (NOT for production)
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout dev.key \
  -out dev.crt \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

### Luân chuyển chứng chỉ

```python
from datetime import datetime, timedelta
import ssl
import socket

def check_certificate_expiry(hostname: str, port: int = 443) -> dict:
    """Check certificate expiration date."""
    context = ssl.create_default_context()
    
    with socket.create_connection((hostname, port)) as sock:
        with context.wrap_socket(sock, server_hostname=hostname) as ssock:
            cert = ssock.getpeercert()
    
    # Parse expiration date
    not_after = datetime.strptime(
        cert['notAfter'], 
        '%b %d %H:%M:%S %Y %Z'
    )
    
    days_remaining = (not_after - datetime.utcnow()).days
    
    return {
        'hostname': hostname,
        'expires': not_after.isoformat(),
        'days_remaining': days_remaining,
        'needs_renewal': days_remaining < 30
    }

# Example: Monitor certificate expiry
domains = ['example.com', 'api.example.com']
for domain in domains:
    result = check_certificate_expiry(domain)
    if result['needs_renewal']:
        print(f"WARNING: {domain} expires in {result['days_remaining']} days!")
```

## MTLS (TLS tương hỗ)

TLS tiêu chuẩn chỉ xác thực máy chủ. TLS tương hỗ (mTLS) cũng xác thực ứng dụng khách, thường được sử dụng trong:

- Giao tiếp giữa các dịch vụ
- Kiến trúc Zero Trust
- Xác thực API

```
Standard TLS:                    Mutual TLS:
Client --> Server                Client <--> Server
           [cert]                [cert]      [cert]

Only server proves identity      Both prove identity
```

### MTLS trong Lưới dịch vụ (Istio)

```yaml
# Istio PeerAuthentication: Require mTLS for all services
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT  # Require mTLS, reject plaintext
```

## Cấu hình sai TLS phổ biến

### 1. Chứng chỉ đã hết hạn

```bash
# Check expiration
echo | openssl s_client -connect example.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# Set up monitoring/alerts for certificates expiring < 30 days
```

### 2. Thiếu chứng chỉ trung cấp

```bash
# Test chain completeness
openssl s_client -connect example.com:443 </dev/null 2>&1 | \
  grep -i "verify"

# Should show: Verify return code: 0 (ok)
# If not, you may be missing intermediate certs
```

### 3. Cho phép các giao thức/mật mã yếu

```bash
# Test for weak protocols
nmap --script ssl-enum-ciphers -p 443 example.com | \
  grep -E "SSLv|TLSv1.0|TLSv1.1"

# Use SSL Labs for comprehensive testing
# https://www.ssllabs.com/ssltest/
```

### 4. Thiếu tiêu đề HSTS

```bash
# Check for HSTS
curl -sI https://example.com | grep -i strict-transport

# Should return:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 5. Tên máy chủ chứng chỉ không khớp

```bash
# Check certificate matches hostname
openssl s_client -connect example.com:443 </dev/null 2>/dev/null | \
  openssl x509 -noout -subject -ext subjectAltName
```

## Kiểm tra cấu hình TLS

### Phòng thí nghiệm SSL

Tiêu chuẩn vàng cho thử nghiệm TLS: https://www.ssllabs.com/ssltest/

Hướng tới xếp hạng **A+**:
- Chỉ TLS 1.2+
- Bộ mật mã mạnh
- Đã bật HSTS
- Không có lỗ hổng

### Kiểm trasl.sh

```bash
# Comprehensive local testing
git clone https://github.com/drwetter/testssl.sh.git
cd testssl.sh
./testssl.sh example.com
```

## Tóm tắt

Những điểm chính của TLS/SSL:

- **Sử dụng TLS 1.3** khi có thể, TLS 1.2 tối thiểu - tắt tất cả SSL và TLS 1.0/1.1
- **Nhận chứng chỉ từ Let's Encrypt** - miễn phí, tự động, đáng tin cậy
- **Bao gồm chứng chỉ trung gian** - chuỗi không đầy đủ gây ra lỗi xác thực
- **Theo dõi ngày hết hạn** - chứng chỉ hết hạn gây ra ngừng hoạt động
- **Enable HSTS** - buộc trình duyệt luôn sử dụng HTTPS
- **Sử dụng mTLS cho dịch vụ này đến dịch vụ** - đặc biệt là trong môi trường Zero Trust
- **Test với SSL Labs** - hướng tới xếp hạng A+

Trong phần tiếp theo, chúng ta sẽ khám phá PKI (Cơ sở hạ tầng khóa công khai) - khung tin cậy giúp chứng chỉ trở nên có ý nghĩa.
