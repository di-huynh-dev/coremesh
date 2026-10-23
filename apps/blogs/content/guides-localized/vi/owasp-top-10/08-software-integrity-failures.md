---
title: "A08: Lỗi toàn vẹn dữ liệu và phần mềm"
description: Tìm hiểu về các lỗi liên quan đến tính toàn vẹn của dữ liệu và phần mềm, bao gồm CI/CD pipeline không an toàn, các bản cập nhật không được ký và quá trình khử tuần tự hóa không đáng tin cậy. Hiểu cách xác minh tính toàn vẹn của mã và dữ liệu.
---

Lỗi về tính toàn vẹn của phần mềm và dữ liệu liên quan đến mã và cơ sở hạ tầng không bảo vệ khỏi các hành vi vi phạm tính toàn vẹn. Đây là một hạng mục mới trong Top 10 OWASP năm 2021, kết hợp quá trình khử tuần tự không an toàn với những lo ngại về an ninh chuỗi cung ứng.

## Thất bại về tính toàn vẹn là gì?

Lỗi toàn vẹn xảy ra khi:

- Các ứng dụng dựa vào plugin, thư viện hoặc mô-đun từ các nguồn không đáng tin cậy
- CI/CD pipeline không xác minh tính toàn vẹn của mã trước khi triển khai
- Chức năng tự động cập nhật tải xuống các bản cập nhật mà không cần xác minh chữ ký
- Các đối tượng hoặc dữ liệu được giải tuần tự hóa từ các nguồn không đáng tin cậy

Khi tính toàn vẹn bị xâm phạm, kẻ tấn công có thể đưa mã độc vào chuỗi cung ứng phần mềm của bạn.

## Các mẫu lỗ hổng phổ biến

### 1. Quá trình khử lưu huỳnh không an toàn

**Vấn đề:**

Việc giải tuần tự hóa dữ liệu không đáng tin cậy có thể dẫn đến việc thực thi mã từ xa.

```javascript
// VULNERABLE: Deserializing user-controlled data
app.post('/api/import', (req, res) => {
  // User sends serialized JavaScript object
  const data = eval('(' + req.body.data + ')');  // DANGEROUS!
  // ...
});

// VULNERABLE: Deserializing YAML without restrictions
const yaml = require('js-yaml');
app.post('/config', (req, res) => {
  const config = yaml.load(req.body.yaml);  // Can execute code!
});
```

Trình phân tích cú pháp YAML với sự hỗ trợ đầy đủ tính năng có thể khởi tạo đối tượng và gọi hàm tạo, dẫn đến thực thi mã.

**Triển khai an toàn:**

```javascript
// SECURE: Use JSON for data interchange
app.post('/api/import', (req, res) => {
  try {
    const data = JSON.parse(req.body.data);  // Safe
    // Validate the structure
    if (!validateSchema(data)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
});

// SECURE: Use safe YAML loading
const yaml = require('js-yaml');
app.post('/config', (req, res) => {
  try {
    // safeLoad only parses basic types, no code execution
    const config = yaml.load(req.body.yaml, { schema: yaml.SAFE_SCHEMA });
  } catch (e) {
    return res.status(400).json({ error: 'Invalid YAML' });
  }
});
```

### 2. Phụ thuộc không đáng tin cậy

**Vấn đề:**

Cài đặt các gói từ cơ quan đăng ký công cộng mà không cần xác minh.

```bash
# VULNERABLE: Installing without verification
npm install some-random-package

# VULNERABLE: Using unverified CDN scripts
<script src="https://cdn.example.com/library.js"></script>
```

**Thực hành bảo mật:**

```bash
# Use lock files with integrity hashes
npm ci  # Installs from lock file, verifies integrity

# Verify package signatures
npm audit signatures
```

Đối với tập lệnh CDN, hãy sử dụng Tính toàn vẹn của nguồn phụ (SRI):

```html
<!-- SECURE: Verify script integrity -->
<script 
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>
```

### 3. CI/CD không an toàn pipeline

**Vấn đề:**

CI/CD pipeline không xác minh tính toàn vẹn của mã có thể triển khai mã độc.

```yaml
# VULNERABLE: No code signing or verification
name: Deploy
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run build
      - run: ./deploy.sh  # Deploys whatever was built
```

**Bảo mật pipeline:**

```yaml
# SECURE: Verify commits and artifacts
name: Deploy
on:
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      # Verify GPG signature on commits
      - name: Verify commit signature
        run: |
          git verify-commit HEAD || {
            echo "Commit is not signed!"
            exit 1
          }
      
      # Lock file verification
      - name: Install dependencies
        run: npm ci  # Strict installation from lock file
      
      # Security scan before build
      - name: Security audit
        run: npm audit --audit-level=high

  build:
    needs: verify
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      
      # Sign the artifact
      - name: Sign artifact
        run: |
          cosign sign-blob --key cosign.key dist/app.js
      
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
      
      # Verify artifact signature before deploy
      - name: Verify artifact
        run: |
          cosign verify-blob --key cosign.pub dist/app.js
      
      - run: ./deploy.sh
```

### 4. Tự động cập nhật chưa được ký

**Vấn đề:**

Cơ chế tự động cập nhật không xác minh chữ ký có thể cài đặt các bản cập nhật độc hại.

```javascript
// VULNERABLE: Download and execute without verification
async function checkForUpdates() {
  const response = await fetch('https://updates.example.com/latest');
  const update = await response.json();
  
  if (update.version > currentVersion) {
    const binary = await fetch(update.downloadUrl);
    // Install without verification!
    await installUpdate(binary);
  }
}
```

**Triển khai an toàn:**

```javascript
const crypto = require('crypto');

// Public key for update verification
const UPDATE_PUBLIC_KEY = process.env.UPDATE_PUBLIC_KEY;

async function checkForUpdates() {
  const response = await fetch('https://updates.example.com/latest');
  const update = await response.json();
  
  if (update.version > currentVersion) {
    // Download the update
    const binaryResponse = await fetch(update.downloadUrl);
    const binary = await binaryResponse.buffer();
    
    // Download the signature
    const sigResponse = await fetch(update.signatureUrl);
    const signature = await sigResponse.text();
    
    // Verify signature
    const verify = crypto.createVerify('SHA256');
    verify.update(binary);
    
    if (!verify.verify(UPDATE_PUBLIC_KEY, signature, 'base64')) {
      console.error('Update signature verification failed!');
      return;
    }
    
    // Verify checksum
    const hash = crypto.createHash('sha256').update(binary).digest('hex');
    if (hash !== update.checksum) {
      console.error('Update checksum mismatch!');
      return;
    }
    
    // Now safe to install
    await installUpdate(binary);
  }
}
```

## An ninh chuỗi cung ứng

### Hóa đơn vật liệu phần mềm (SBOM)

Tạo SBOM để theo dõi tất cả các thành phần trong phần mềm của bạn:

```bash
# Generate SBOM using Syft
syft packages dir:. -o spdx-json > sbom.json

# Generate SBOM for container
syft packages docker:myapp:latest -o cyclonedx-json > sbom.json
```

### Ký container image

Ký container image để đảm bảo tính toàn vẹn:

```bash
# Sign with Cosign
cosign sign --key cosign.key myregistry/myapp:v1.0.0

# Verify before deploying
cosign verify --key cosign.pub myregistry/myapp:v1.0.0
```

Thực thi xác minh chữ ký trong Kubernetes:

```yaml
# Kyverno policy to require signed images
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-image-signature
spec:
  validationFailureAction: enforce
  rules:
  - name: verify-signature
    match:
      resources:
        kinds:
        - Pod
    verifyImages:
    - imageReferences:
      - "myregistry/*"
      attestors:
      - entries:
        - keys:
            publicKeys: |
              -----BEGIN PUBLIC KEY-----
              ...
              -----END PUBLIC KEY-----
```

## Bài học chính

1. **Không bao giờ giải tuần tự hóa dữ liệu không đáng tin cậy** - sử dụng JSON, tránh eval
2. **Sử dụng tệp khóa** và xác minh tính toàn vẹn của gói
3. **Mã ký hiệu và tạo phẩm** trong CI/CD pipeline của bạn
4. **Xác minh chữ ký** trước khi triển khai hoặc cài đặt bản cập nhật
5. **Tạo SBOMs** để theo dõi chuỗi cung ứng phần mềm của bạn
6. **Sử dụng tính toàn vẹn của nguồn phụ** cho các tập lệnh được lưu trữ trên CDN
7. **Sign container image** và thực thi xác minh
8. **Yêu cầu cam kết đã ký** đối với các kho lưu trữ nhạy cảm

Các cuộc tấn công chuỗi cung ứng phần mềm ngày càng tinh vi. Việc xây dựng xác minh tính toàn vẹn trong quá trình phát triển và triển khai của bạn là điều cần thiết để bảo vệ.
