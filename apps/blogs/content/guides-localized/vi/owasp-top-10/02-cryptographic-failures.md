---
title: "A02: Lỗi mật mã"
description: Tìm hiểu cách lỗi mật mã làm lộ dữ liệu nhạy cảm và cách triển khai đúng cách mã hóa, băm và xử lý dữ liệu an toàn trong ứng dụng của bạn.
---

Trước đây được gọi là "Lỗi lộ dữ liệu nhạy cảm", Lỗi mật mã tập trung vào các lỗi liên quan đến mật mã dẫn đến lộ dữ liệu nhạy cảm. Lỗ hổng này nằm ở vị trí thứ 2 trong Top 10 của OWASP vì mật mã không đúng cách đã dẫn đến một số vụ vi phạm dữ liệu nghiêm trọng nhất trong lịch sử.

## Lỗi mật mã là gì?

Lỗi mật mã xảy ra khi ứng dụng:

- **Truyền dữ liệu nhạy cảm ở dạng văn bản rõ ràng** (HTTP, FTP, SMTP không có TLS)
- **Sử dụng thuật toán mã hóa yếu hoặc lỗi thời** (MD5, SHA1, DES)
- **Lưu trữ mật khẩu không chính xác** (văn bản thuần túy, băm đơn giản, muối yếu)
- **Sử dụng khóa mã hóa cứng hoặc yếu**
- **Không thể thực thi mã hóa** (nội dung hỗn hợp, TLS tùy chọn)

Hậu quả bao gồm từ thông tin bị đánh cắp đến việc lộ toàn bộ cơ sở dữ liệu. Khi mật mã không thành công, thường sẽ không có cơ hội thứ hai—một khi dữ liệu bị lộ, nó không thể không bị lộ.

## Các mẫu lỗ hổng phổ biến

### 1. Mật khẩu được lưu trữ không chính xác

Lưu trữ mật khẩu là nơi nhiều ứng dụng bị lỗi. Chúng ta hãy nhìn vào sự tiến triển từ tệ nhất đến tốt nhất:

**Level 0 - Văn bản thuần túy (Không bao giờ làm điều này):**

```javascript
// CATASTROPHIC: Plain text password storage
const user = new User({
  email: req.body.email,
  password: req.body.password  // Stored as-is!
});
```

Nếu cơ sở dữ liệu của bạn bị xâm phạm, mọi mật khẩu sẽ bị xâm phạm ngay lập tức. Người dùng thường sử dụng lại mật khẩu nên hành vi vi phạm này còn mở rộng sang các tài khoản khác của họ.

**Cấp 1 - Băm đơn giản (Vẫn nguy hiểm):**

```javascript
// DANGEROUS: Simple hash without salt
const crypto = require('crypto');
const hashedPassword = crypto.createHash('sha256')
  .update(req.body.password)
  .digest('hex');
```

Điều này dễ bị tấn công bởi bảng cầu vồng. Những kẻ tấn công đã tính toán trước hàm băm cho hàng triệu mật khẩu phổ biến. Việc tra cứu mất một phần nghìn giây.

**Level 2 - Băm bằng muối (Tốt hơn nhưng chưa đủ):**

```javascript
// INSUFFICIENT: SHA-256 with salt
const salt = crypto.randomBytes(16).toString('hex');
const hashedPassword = crypto.createHash('sha256')
  .update(salt + req.body.password)
  .digest('hex');
```

Salting đánh bại bảng cầu vồng, nhưng SHA-256 quá nhanh. Các GPU hiện đại có thể tính toán hàng tỷ hàm băm SHA-256 mỗi giây, khiến các cuộc tấn công vũ phu trở nên khả thi.

**Cấp 3 - Băm mật khẩu hàm (Phương pháp đúng):**

```javascript
// SECURE: Use bcrypt with appropriate cost factor
const bcrypt = require('bcrypt');

// Cost factor of 12 means 2^12 iterations
// Adjust based on your security needs and hardware
const SALT_ROUNDS = 12;

async function hashPassword(plainPassword) {
  // bcrypt automatically generates a salt and includes it in the output
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Usage
const hash = await hashPassword('userPassword123');
// Result: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYE7zNqK7Kxy
// Contains: algorithm version, cost factor, salt, and hash
```

Bcrypt, Argon2 và scrypt được thiết kế để hoạt động chậm và tốn nhiều bộ nhớ, khiến các cuộc tấn công vũ phu trở nên không thực tế. Argon2 là người chiến thắng trong Cuộc thi băm mật khẩu và được đề xuất cho các ứng dụng mới:

```javascript
// RECOMMENDED: Argon2id for new applications
const argon2 = require('argon2');

async function hashPassword(plainPassword) {
  return await argon2.hash(plainPassword, {
    type: argon2.argon2id,  // Hybrid of Argon2i and Argon2d
    memoryCost: 65536,       // 64 MB memory
    timeCost: 3,             // 3 iterations
    parallelism: 4           // 4 parallel threads
  });
}

async function verifyPassword(plainPassword, hashedPassword) {
  return await argon2.verify(hashedPassword, plainPassword);
}
```

### 2. Dữ liệu nhạy cảm khi chuyển tuyến

Dữ liệu được truyền mà không mã hóa có thể bị chặn bởi bất kỳ ai trên đường dẫn mạng.

**Mẫu dễ bị tổn thương:**

```javascript
// VULNERABLE: HTTP API calls
fetch('http://api.example.com/users', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
```

**Triển khai an toàn:**

```javascript
// Server configuration - enforce HTTPS
const express = require('express');
const helmet = require('helmet');

const app = express();

// Helmet adds security headers including HSTS
app.use(helmet());

// Force HTTPS redirect
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// Set secure cookie options
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: true,      // Only send over HTTPS
    httpOnly: true,    // Not accessible via JavaScript
    sameSite: 'strict' // CSRF protection
  }
}));
```

Định cấu hình HSTS (HTTP Strict Transport Security) để đảm bảo trình duyệt luôn sử dụng HTTPS:

```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    
    # HSTS header - browser will refuse HTTP for 1 year
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Modern TLS configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
}
```

### 3. Mã hóa yếu cho dữ liệu ở phần còn lại

Việc mã hóa dữ liệu nhạy cảm ở trạng thái lưu trữ sẽ bảo vệ khỏi vi phạm cơ sở dữ liệu, nhưng chỉ khi được thực hiện đúng cách.

**Mẫu dễ bị tổn thương:**

```javascript
// VULNERABLE: ECB mode preserves patterns in data
const cipher = crypto.createCipher('aes-256-ecb', key);

// VULNERABLE: Hard-coded encryption key
const ENCRYPTION_KEY = 'my-super-secret-key-12345';

// VULNERABLE: Predictable IV (Initialization Vector)
const iv = Buffer.alloc(16, 0);  // All zeros!
```

**Triển khai an toàn:**

```javascript
const crypto = require('crypto');

// Key should come from environment/secrets manager
// Must be 32 bytes for AES-256
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(plainText) {
  // Generate a random IV for each encryption
  // IV doesn't need to be secret, but must be unique
  const iv = crypto.randomBytes(16);
  
  // Use AES-256-GCM (authenticated encryption)
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // GCM provides an authentication tag - store this too
  const authTag = cipher.getAuthTag();
  
  // Return IV + authTag + ciphertext (all needed for decryption)
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    content: encrypted
  };
}

function decrypt(encryptedData) {
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

AES-GCM cung cấp mã hóa xác thực, nghĩa là nó vừa mã hóa dữ liệu vừa xác minh dữ liệu không bị giả mạo. Thẻ xác thực sẽ khiến việc giải mã không thành công nếu bản mã đã bị sửa đổi.

### 4. Quản lý khóa không đúng cách

Mã hóa mạnh nhất sẽ vô giá trị nếu khóa bị xử lý sai.

**Những lỗi thường gặp:**

```javascript
// WRONG: Key in source code
const API_KEY = 'sk-1234567890abcdef';

// WRONG: Key in version control
// .env file committed to git

// WRONG: Same key for all environments
// Production using the same key as development
```

**Quản lý khóa thích hợp:**

```javascript
// Use environment variables at minimum
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY environment variable is required');
}

// Better: Use a secrets manager
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

async function getSecret(secretName) {
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({
    name: `projects/my-project/secrets/${secretName}/versions/latest`
  });
  return version.payload.data.toString();
}

// AWS Secrets Manager example
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getAWSSecret(secretId) {
  const data = await secretsManager.getSecretValue({ SecretId: secretId }).promise();
  return JSON.parse(data.SecretString);
}
```

## Biện pháp phòng ngừa tốt nhất

### 1. Phân loại dữ liệu của bạn

Không phải tất cả dữ liệu đều cần mức độ bảo vệ như nhau. Phân loại dữ liệu theo độ nhạy:

```javascript
// Data classification example
const DataClassification = {
  PUBLIC: 'public',           // Marketing content, public docs
  INTERNAL: 'internal',       // Employee directory, internal docs
  CONFIDENTIAL: 'confidential', // Customer data, financial records
  RESTRICTED: 'restricted'    // PII, payment data, health records
};

// Apply appropriate controls based on classification
function getEncryptionRequirements(classification) {
  switch (classification) {
    case DataClassification.RESTRICTED:
      return {
        atRest: true,
        inTransit: true,
        algorithm: 'aes-256-gcm',
        keyRotation: '30d'
      };
    case DataClassification.CONFIDENTIAL:
      return {
        atRest: true,
        inTransit: true,
        algorithm: 'aes-256-gcm',
        keyRotation: '90d'
      };
    default:
      return {
        atRest: false,
        inTransit: true,  // Always encrypt in transit
        algorithm: null,
        keyRotation: null
      };
  }
}
```

### 2. Sử dụng cấu hình TLS hiện đại

```yaml
# Example: Kubernetes Ingress with modern TLS
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-ssl-protocols: "TLSv1.2 TLSv1.3"
spec:
  tls:
  - hosts:
    - api.example.com
    secretName: api-tls-cert
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 443
```

### 3. Thực hiện xoay phím

Khóa mã hóa phải được luân chuyển thường xuyên. Đây là mẫu để hỗ trợ xoay vòng phím:

```javascript
// Support multiple key versions for rotation
const keys = {
  'v1': Buffer.from(process.env.ENCRYPTION_KEY_V1, 'hex'),
  'v2': Buffer.from(process.env.ENCRYPTION_KEY_V2, 'hex'),  // Current
};
const CURRENT_KEY_VERSION = 'v2';

function encrypt(plainText) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', keys[CURRENT_KEY_VERSION], iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    keyVersion: CURRENT_KEY_VERSION,  // Store which key was used
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
    content: encrypted
  };
}

function decrypt(encryptedData) {
  // Use the key version that was used for encryption
  const key = keys[encryptedData.keyVersion];
  if (!key) {
    throw new Error(`Unknown key version: ${encryptedData.keyVersion}`);
  }
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, 
    Buffer.from(encryptedData.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Re-encrypt data with new key during rotation
async function rotateEncryption(record) {
  if (record.encryptedData.keyVersion !== CURRENT_KEY_VERSION) {
    const plainText = decrypt(record.encryptedData);
    record.encryptedData = encrypt(plainText);
    await record.save();
  }
}
```

## Bài học chính

1. **Sử dụng các chức năng băm mật khẩu** (bcrypt, Argon2) chứ không phải các hàm băm có mục đích chung
2. **EMã hóa dữ liệu khi truyền** - HTTPS ở mọi nơi, không có ngoại lệ
3. **Sử dụng mã hóa xác thực** (AES-GCM) cho dữ liệu ở trạng thái lưu trữ
4. **Không bao giờ khóa mã cứng** - sử dụng các biến môi trường hoặc trình quản lý bí mật
5. **Tạo IVs** duy nhất cho mỗi hoạt động mã hóa
6. **Plan xoay vòng khóa** - bao gồm phiên bản khóa trong dữ liệu được mã hóa
7. **Phân loại dữ liệu của bạn** - áp dụng các điều khiển thích hợp dựa trên độ nhạy
8. **Sử dụng TLS** hiện đại - TLS 1.2+ với bộ mật mã mạnh

Các lỗi về mật mã thường không được phát hiện cho đến khi xảy ra vi phạm. Bằng cách làm theo những biện pháp này, bạn đảm bảo rằng ngay cả khi kẻ tấn công có được quyền truy cập vào bộ lưu trữ của bạn thì dữ liệu vẫn được bảo vệ.
