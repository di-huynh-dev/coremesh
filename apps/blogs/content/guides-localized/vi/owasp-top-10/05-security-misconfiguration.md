---
title: "A05: Cấu hình sai bảo mật"
description: Tìm hiểu về các lỗ hổng bảo mật do cấu hình sai, các lỗi thường gặp khi định cấu hình ứng dụng và cơ sở hạ tầng cũng như cách triển khai cấu hình bảo mật.
---

Bảo mật Cấu hình sai là một trong những lỗ hổng phổ biến nhất và thường dễ khai thác nhất. Nó xảy ra khi cài đặt bảo mật không được xác định, triển khai hoặc duy trì đúng cách. Ngay cả những cấu hình sai nhỏ cũng có thể dẫn đến vi phạm nghiêm trọng.

## Cấu hình sai bảo mật là gì?

Cấu hình sai bảo mật có thể xảy ra ở bất kỳ cấp độ nào của ngăn xếp ứng dụng:

- **Dịch vụ mạng** - Mở cổng không cần thiết, quy tắc tường lửa yếu
- **Platform/Framework** - Cấu hình mặc định, bật các tính năng không cần thiết
- **Máy chủ ứng dụng** - Thông báo lỗi dài dòng, danh sách thư mục
- **Database** - Thông tin xác thực mặc định, quyền quá mức
- **Dịch vụ đám mây** - Nhóm S3 công khai, vai trò IAM quá dễ dãi

Thách thức là các ứng dụng hiện đại có nhiều điểm cấu hình và mỗi điểm đều tiềm ẩn một lỗ hổng.

## Các mẫu cấu hình sai phổ biến

### 1. Thông tin xác thực mặc định

**Vấn đề:**

Nhiều hệ thống có tên người dùng và mật khẩu mặc định được ghi lại công khai.

```yaml
# VULNERABLE: Default credentials in docker-compose
services:
  database:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres  # Default!
```

**Cấu hình bảo mật:**

```yaml
# SECURE: Use secrets management
services:
  database:
    image: postgres:14
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    external: true  # Managed outside docker-compose
```

Luôn thay đổi thông tin đăng nhập mặc định cho:

- Cơ sở dữ liệu (PostgreSQL, MySQL, MongoDB)
- Môi giới tin nhắn (RabbitMQ, Redis)
- Bảng quản trị (WordPress, phpMyAdmin)
- Thiết bị mạng (router, switch)
- Dịch vụ đám mây (tài khoản root AWS)

### 2. Thông báo lỗi dài dòng

**Vấn đề:**

Thông báo lỗi chi tiết giúp kẻ tấn công hiểu được hệ thống của bạn.

```javascript
// VULNERABLE: Stack trace exposed to users
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,  // Reveals internal paths and code structure!
    query: req.query   // Might contain sensitive data
  });
});
```

Những kẻ tấn công học:

- Phiên bản khung và thư viện
- Đường dẫn file và cấu trúc thư mục
- Lược đồ cơ sở dữ liệu từ lỗi SQL
- Điểm cuối API nội bộ

**Cấu hình bảo mật:**

```javascript
// SECURE: Generic errors in production, detailed in development
app.use((err, req, res, next) => {
  // Log full error for debugging
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.path,
    method: req.method
  });
  
  // Return generic message in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'An unexpected error occurred',
      requestId: req.id  // For support reference
    });
  } else {
    // Detailed errors in development
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});
```

### 3. Các dịch vụ và tính năng không cần thiết

**Vấn đề:**

Mọi tính năng được kích hoạt đều là một bề mặt tấn công tiềm năng.

```nginx
# VULNERABLE: Unnecessary features enabled
server {
    listen 80;
    
    # Directory listing enabled
    autoindex on;
    
    # Server version exposed
    server_tokens on;
    
    location /admin {
        # Admin panel accessible from internet
    }
}
```

**Cấu hình bảo mật:**

```nginx
# SECURE: Minimal, hardened configuration
server {
    listen 443 ssl http2;
    
    # Hide server version
    server_tokens off;
    
    # Disable directory listing
    autoindex off;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Admin panel - internal only
    location /admin {
        allow 10.0.0.0/8;  # Internal network only
        deny all;
    }
}
```

### 4. Cấu hình sai đám mây

**Vấn đề:**

Dịch vụ đám mây mặc định thuận tiện chứ không phải bảo mật.

```hcl
# VULNERABLE: Public S3 bucket
resource "aws_s3_bucket" "data" {
  bucket = "company-data"
}

resource "aws_s3_bucket_acl" "data" {
  bucket = aws_s3_bucket.data.id
  acl    = "public-read"  # Anyone can read!
}
```

**Cấu hình bảo mật:**

```hcl
# SECURE: Private bucket with encryption
resource "aws_s3_bucket" "data" {
  bucket = "company-data"
}

resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  versioning_configuration {
    status = "Enabled"
  }
}
```

### 5. Thiếu tiêu đề bảo mật

**Vấn đề:**

Trình duyệt có các tính năng bảo mật phải được kích hoạt rõ ràng.

```javascript
// VULNERABLE: No security headers
app.get('/', (req, res) => {
  res.send('<html>...</html>');
});
```

**Cấu hình bảo mật:**

```javascript
const helmet = require('helmet');

// Helmet sets many security headers automatically
app.use(helmet());

// Customize as needed
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
}));
```

## Thực tiễn tốt nhất về quản lý cấu hình

### 1. Cơ sở hạ tầng dưới dạng mã

Xác định cấu hình trong mã do phiên bản kiểm soát, không phải cài đặt thủ công:

```yaml
# Kubernetes deployment with security context
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: api
        image: api:latest
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
              - ALL
        resources:
          limits:
            cpu: "500m"
            memory: "256Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"
```

### 2. Quét cấu hình

Sử dụng các công cụ để phát hiện cấu hình sai trước khi triển khai:

```bash
# Scan Terraform for security issues
checkov -d ./terraform/

# Scan Kubernetes manifests
kubesec scan deployment.yaml

# Scan Docker images
trivy image myapp:latest

# Scan CloudFormation
cfn-lint template.yaml
cfn_nag_scan --input-path template.yaml
```

### 3. Tách môi trường

Development và production nên có cấu hình khác nhau:

```javascript
// config/index.js
const configs = {
  development: {
    debug: true,
    logLevel: 'debug',
    cors: { origin: '*' },
    rateLimit: { max: 1000 }
  },
  production: {
    debug: false,
    logLevel: 'warn',
    cors: { origin: 'https://myapp.com' },
    rateLimit: { max: 100 }
  }
};

module.exports = configs[process.env.NODE_ENV || 'development'];
```

## Bài học chính

1. **Thay đổi tất cả thông tin xác thực mặc định** ngay sau khi cài đặt
2. **Vô hiệu hóa các tính năng không cần thiết** - mọi tính năng đều là bề mặt tấn công
3. **Sử dụng thông báo lỗi chung** trong production
4. **Triển khai tiêu đề bảo mật** bằng cách sử dụng các công cụ như Mũ bảo hiểm
5. **Cấu hình quét** bằng các công cụ tự động (Checkov, tfsec)
6. **Sử dụng Cơ sở hạ tầng làm Code** để có cấu hình nhất quán, có thể xem lại
7. **Môi trường riêng biệt** - production sẽ hạn chế hơn
8. **Xem lại thường xuyên** - cấu hình trôi theo thời gian

Cấu hình sai về bảo mật có thể được ngăn chặn bằng các quy trình và tự động hóa phù hợp. Điều quan trọng là coi cấu hình như mã và tuân theo mức độ nghiêm ngặt tương tự như mã ứng dụng.
