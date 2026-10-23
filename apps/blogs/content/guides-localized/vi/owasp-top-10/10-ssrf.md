---
title: "A10: Giả mạo yêu cầu phía máy chủ (SSRF)"
description: Tìm hiểu về các lỗ hổng Giả mạo yêu cầu phía máy chủ, cách kẻ tấn công khai thác chúng để truy cập tài nguyên nội bộ và các chiến lược ngăn chặn hiệu quả.
---

Giả mạo yêu cầu phía máy chủ (SSRF) xảy ra khi một ứng dụng có thể bị lừa thực hiện các yêu cầu đến các đích đến ngoài ý muốn. Sự bổ sung mới này vào Top 10 OWASP năm 2021 phản ánh mức độ phổ biến ngày càng tăng của các kiến trúc đám mây trong đó SSRF có thể có sức tàn phá đặc biệt.

## SSRF là gì?

Lỗ hổng SSRF xảy ra khi một ứng dụng:

- Tìm nạp tài nguyên từ xa dựa trên URL do người dùng cung cấp
- Không xác nhận hoặc vệ sinh điểm đến
- Cho phép truy cập vào các tài nguyên nội bộ cần được bảo vệ

Trong môi trường đám mây, SSRF có thể truy cập các dịch vụ siêu dữ liệu, API nội bộ và các tài nguyên khác chỉ được bảo vệ bởi ranh giới mạng.

## Các kịch bản SSRF phổ biến

### 1. Tính năng xem trước URL

**Vấn đề:**

Nhiều ứng dụng tìm nạp URL để tạo bản xem trước hoặc hình thu nhỏ.

```javascript
// VULNERABLE: Fetches any URL without validation
app.post('/api/preview', async (req, res) => {
  const { url } = req.body;
  
  // Attacker could provide: http://169.254.169.254/latest/meta-data/
  const response = await fetch(url);
  const html = await response.text();
  
  res.json({ preview: extractPreview(html) });
});
```

Kẻ tấn công có thể yêu cầu các URL nội bộ như:

- `http://169.254.169.254/latest/meta-data/` - Siêu dữ liệu AWS (thông tin xác thực!)
- `http://localhost:8080/admin` - Giao diện quản trị nội bộ
- `http://10.0.0.5:5432/` - Cơ sở dữ liệu nội bộ
- `file:///etc/passwd` - Truy cập tệp cục bộ

**Tác động:**

Trong AWS, dịch vụ siêu dữ liệu tại `169.254.169.254` có thể trả về thông tin xác thực IAM:

```json
{
  "AccessKeyId": "AKIAIOSFODNN7EXAMPLE",
  "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "Token": "..."
}
```

Với những thông tin xác thực này, kẻ tấn công có thể truy cập tài nguyên AWS của bạn.

### 2. Tích hợp Webhook

**Vấn đề:**

Cho phép người dùng định cấu hình URL webhook.

```javascript
// VULNERABLE: Sends data to user-provided URL
app.post('/api/webhooks', async (req, res) => {
  const { url, secret } = req.body;
  
  // Save webhook configuration
  await Webhook.create({ url, secret, userId: req.user.id });
  
  res.json({ success: true });
});

// Later, when event occurs:
async function triggerWebhooks(event) {
  const webhooks = await Webhook.find({ event: event.type });
  
  for (const webhook of webhooks) {
    // Could hit internal services!
    await fetch(webhook.url, {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }
}
```

### 3. Nhập tệp từ URL

**Vấn đề:**

Nhập tệp từ URL do người dùng cung cấp.

```javascript
// VULNERABLE: Imports file from any URL
app.post('/api/import', async (req, res) => {
  const { fileUrl } = req.body;
  
  const response = await fetch(fileUrl);
  const data = await response.json();
  
  await processImport(data);
  res.json({ success: true });
});
```

## Chiến lược phòng ngừa

### 1. Xác thực URL bằng danh sách cho phép

Cách tiếp cận an toàn nhất là chỉ cho phép các điểm đến cụ thể, nổi tiếng:

```javascript
const ALLOWED_DOMAINS = [
  'api.trusted-service.com',
  'cdn.example.com'
];

function isAllowedUrl(urlString) {
  try {
    const url = new URL(urlString);
    
    // Only allow HTTPS
    if (url.protocol !== 'https:') {
      return false;
    }
    
    // Check against allowlist
    return ALLOWED_DOMAINS.includes(url.hostname);
  } catch (e) {
    return false;
  }
}

app.post('/api/preview', async (req, res) => {
  const { url } = req.body;
  
  if (!isAllowedUrl(url)) {
    return res.status(400).json({ error: 'URL not allowed' });
  }
  
  const response = await fetch(url);
  // ...
});
```

### 2. Chặn mạng nội bộ

Khi bạn phải chấp nhận các URL tùy ý, hãy chặn các địa chỉ nội bộ:

```javascript
const ipaddr = require('ipaddr.js');
const dns = require('dns').promises;

// IP ranges that should never be accessed
const BLOCKED_RANGES = [
  'loopback',     // 127.0.0.0/8
  'private',      // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
  'linkLocal',    // 169.254.0.0/16 (AWS metadata!)
  'uniqueLocal',  // fc00::/7
  'reserved'
];

async function isBlockedAddress(hostname) {
  try {
    // Resolve hostname to IP addresses
    const addresses = await dns.resolve(hostname);
    
    for (const address of addresses) {
      const parsed = ipaddr.parse(address);
      const range = parsed.range();
      
      if (BLOCKED_RANGES.includes(range)) {
        return true;
      }
    }
    
    return false;
  } catch (e) {
    // If we can't resolve, block it
    return true;
  }
}

async function validateUrl(urlString) {
  const url = new URL(urlString);
  
  // Block non-HTTP protocols
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Invalid protocol');
  }
  
  // Block file:// URLs
  if (url.protocol === 'file:') {
    throw new Error('File URLs not allowed');
  }
  
  // Check if hostname resolves to blocked IP
  if (await isBlockedAddress(url.hostname)) {
    throw new Error('Internal addresses not allowed');
  }
  
  return url;
}
```

### 3. Tắt chuyển hướng

Kẻ tấn công có thể bỏ qua xác thực URL bằng cách sử dụng chuyển hướng:

```javascript
// VULNERABLE: Follows redirects
// Attacker's URL redirects to http://169.254.169.254/
const response = await fetch(url);  // Follows redirect!

// SECURE: Disable redirects and handle manually
const response = await fetch(url, { redirect: 'manual' });

if (response.status >= 300 && response.status < 400) {
  const redirectUrl = response.headers.get('location');
  // Validate the redirect URL before following
  await validateUrl(redirectUrl);
}
```

### 4. Sử dụng dịch vụ proxy

Định tuyến các yêu cầu bên ngoài thông qua proxy chuyên dụng để thực thi các chính sách bảo mật:

```javascript
// Instead of direct fetch, use a secure proxy
async function secureFetch(url) {
  const response = await fetch('http://secure-proxy.internal/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  
  return response;
}
```

Dịch vụ proxy có thể:

- Xác thực URL dựa trên danh sách chặn
- Giải quyết DNS trong môi trường được kiểm soát
- Chặn truy cập vào mạng nội bộ
- Giới hạn kích thước và loại phản hồi
- Ghi lại tất cả các yêu cầu kiểm tra

### 5. AWS IMDSv2

Nếu sử dụng AWS, hãy yêu cầu IMDSv2 để bảo vệ chống lại SSRF:

```hcl
# Terraform: Require IMDSv2
resource "aws_instance" "example" {
  ami           = "ami-12345678"
  instance_type = "t3.micro"

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"  # Require session tokens
    http_put_response_hop_limit = 1           # Prevent container breakout
  }
}
```

Với IMDSv2, việc truy cập siêu dữ liệu cần có mã thông báo phiên:

```bash
# IMDSv2 requires a PUT request to get a token first
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Then use the token to access metadata
curl "http://169.254.169.254/latest/meta-data/" \
  -H "X-aws-ec2-metadata-token: $TOKEN"
```

Các yêu cầu GET đơn giản (như các yêu cầu từ SSRF) sẽ không hoạt động.

## Kiểm tra SSRF

### Kiểm tra thủ công

Hãy thử các tải trọng này trong tham số URL:

```
http://127.0.0.1/
http://localhost/
http://169.254.169.254/latest/meta-data/
http://[::1]/
http://0.0.0.0/
http://2130706433/  (decimal IP for 127.0.0.1)
http://0x7f.0x0.0x0.0x1/  (hex IP)
http://internal-service.local/
file:///etc/passwd
```

### Quét tự động

Sử dụng các công cụ như Burp Suite hoặc OWASP ZAP để kiểm tra lỗ hổng SSRF trong quá trình đánh giá bảo mật.

## Bài học chính

1. **Sử dụng danh sách cho phép** khi có thể - chỉ cho phép các điểm đến nổi tiếng
2. **Chặn các dải IP nội bộ** - 127.0.0.0/8, 169.254.0.0/16, 10.0.0.0/8, v.v.
3. **Validate sau khi phân giải DNS** - tên máy chủ có thể phân giải thành IP nội bộ
4. **Vô hiệu hóa chuyển hướng tự động** - xác thực các mục tiêu chuyển hướng
5. **Sử dụng IMDSv2 trên AWS** - bảo vệ dịch vụ siêu dữ liệu
6. **Triển khai phân đoạn mạng** - giới hạn những gì máy chủ có thể truy cập
7. **Sử dụng proxy cho các yêu cầu bên ngoài** - tập trung các biện pháp kiểm soát bảo mật
8. **Nhật ký và giám sát** - theo dõi các yêu cầu gửi đi để phát hiện các điểm bất thường

SSRF đặc biệt nguy hiểm trong môi trường đám mây nơi các biện pháp bảo vệ ở cấp độ mạng thường là biện pháp bảo vệ chính cho các dịch vụ nội bộ. phòng thủ nhiều lớp là cần thiết.
