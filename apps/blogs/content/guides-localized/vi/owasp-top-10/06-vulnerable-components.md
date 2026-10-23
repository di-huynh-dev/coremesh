---
title: "A06: Thành phần có lỗ hổng và lỗi thời"
description: Tìm hiểu về những rủi ro khi sử dụng các thành phần có lỗ hổng đã biết, cách xác định chúng và các chiến lược để giữ an toàn cho các phần phụ thuộc của bạn.
---

Các ứng dụng hiện đại phụ thuộc nhiều vào các thành phần của bên thứ ba—khung, thư viện và mô-đun giúp đẩy nhanh quá trình phát triển. Nhưng những thành phần này có thể chứa lỗ hổng và kẻ tấn công chủ động nhắm mục tiêu vào các lỗ hổng đã biết trong các thư viện phổ biến.

## Các thành phần dễ bị tổn thương là gì?

Lỗ hổng này xảy ra khi:

- Bạn sử dụng các thành phần có lỗ hổng bảo mật đã biết
- Bạn không biết phiên bản của các thành phần bạn sử dụng (cả trực tiếp và bắc cầu)
- Bạn không quét lỗ hổng thường xuyên
- Bạn không cập nhật thành phần kịp thời
- Nhà phát triển không kiểm tra tính tương thích của các thư viện đã cập nhật

Một phần phụ thuộc dễ bị tổn thương duy nhất có thể làm tổn hại đến toàn bộ ứng dụng của bạn, ngay cả khi mã của riêng bạn hoàn hảo.

## Tác động trong thế giới thực

Một số vi phạm lớn nhất đã khai thác các thành phần dễ bị tổn thương:

- **Log4Shell (2021)** - Một lỗ hổng trong Log4j ảnh hưởng đến hàng triệu ứng dụng Java trên toàn thế giới
- **Equifax Breach (2017)** - Apache Struts chưa được vá đã dẫn đến 147 triệu bản ghi bị lộ
- **npm luồng sự kiện (2018)** - Mã độc hại được đưa vào gói npm phổ biến

## Xác định các thành phần dễ bị tổn thương

### Đánh giá phụ thuộc thủ công

Bắt đầu bằng cách hiểu những gì bạn đang sử dụng:

```bash
# Node.js - List all dependencies
npm list --all

# Python - List installed packages
pip list
pip freeze > requirements.txt

# Go - List modules
go list -m all
```

### Quét lỗ hổng tự động

**Node.js với npm:**

```bash
# Built-in audit
npm audit

# Get JSON output for CI/CD
npm audit --json

# Auto-fix where possible
npm audit fix
```

**Sử dụng Snyk:**

```bash
# Install Snyk CLI
npm install -g snyk

# Test for vulnerabilities
snyk test

# Monitor project for new vulnerabilities
snyk monitor
```

**Python với sự an toàn:**

```bash
# Install safety
pip install safety

# Check dependencies
safety check -r requirements.txt
```

**Đi với goulncheck:**

```bash
# Install govulncheck
go install golang.org/x/vuln/cmd/govulncheck@latest

# Scan your project
govulncheck ./...
```

## Chiến lược quản lý sự phụ thuộc

### 1. Khóa quản lý tập tin

Tệp khóa đảm bảo cài đặt nhất quán trên các môi trường:

```bash
# Node.js - package-lock.json
npm ci  # Clean install from lock file

# Python - pip with hashes
pip install --require-hashes -r requirements.txt

# Go - go.sum provides checksums
go mod verify
```

Ví dụ về các phần phụ thuộc được ghim bằng hàm băm:

```txt
# requirements.txt with hashes
requests==2.28.1 \
    --hash=sha256:7c5599b102feddaa661c826c56ab4fee28bfd17f5abca1ebbe3e7f19d7c97983
django==4.1.5 \
    --hash=sha256:8e1f8e2e5d2b6f7f8c9d0c3b4a5e6f7a8b9c0d1e2f3a4b5c6d7e8f9
```

### 2. Cập nhật phụ thuộc tự động

Định cấu hình Dependabot hoặc Renovate để tự động tạo PR cho các bản cập nhật:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
    # Group minor/patch updates
    groups:
      production-dependencies:
        patterns:
          - "*"
        exclude-patterns:
          - "*-dev"
        update-types:
          - "minor"
          - "patch"
```

### 3. Tích hợp CI/CD

Chặn triển khai khi tìm thấy lỗ hổng:

```yaml
# GitHub Actions example
name: Security Scan
on: [push, pull_request]

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=high
        
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

### 4. Đánh giá trước khi thêm phụ thuộc

Trước khi thêm phần phụ thuộc mới, hãy cân nhắc:

```markdown
## Dependency Evaluation Checklist

- [ ] Is it actively maintained? (Check last commit date)
- [ ] How many open issues/PRs? (Indicates maintainer responsiveness)
- [ ] Does it have security policies? (SECURITY.md)
- [ ] What's the download count? (npm, PyPI stats)
- [ ] Are there known vulnerabilities? (Snyk, npm audit)
- [ ] What dependencies does it pull in? (Transitive dependencies)
- [ ] Can we implement this ourselves? (Reduce dependencies)
- [ ] Is there a more secure alternative?
```

## Ứng phó với các lỗ hổng

### 1. Đánh giá tác động

Không phải tất cả các lỗ hổng đều yêu cầu hành động ngay lập tức:

```javascript
// Example: Vulnerability in a dev dependency
// Usually lower priority than production dependencies

// Example: Vulnerability requires specific conditions
// If those conditions don't apply to your usage, risk is lower
```

### 2. Cập nhật hoặc giảm nhẹ

```bash
# Option 1: Update the vulnerable package
npm update vulnerable-package

# Option 2: If update breaks things, try a specific version
npm install vulnerable-package@2.3.4

# Option 3: If no fix available, consider alternatives
npm uninstall vulnerable-package
npm install secure-alternative
```

### 3. Tài liệu được chấp nhận

Nếu bạn không thể khắc phục ngay một lỗ hổng, hãy ghi lại nó:

```json
// .snyk file for Snyk
{
  "ignore": {
    "SNYK-JS-LODASH-567746": {
      "*": {
        "reason": "Not exploitable - we don't use affected function",
        "expires": "2024-06-01"
      }
    }
  }
}
```

## Bài học chính

1. **Biết sự phụ thuộc của bạn** - Duy trì inventory của tất cả các thành phần
2. **Scan thường xuyên** - Tự động quét lỗ hổng trong CI/CD
3. **Cập nhật kịp thời** - Vá các lỗ hổng đã biết một cách nhanh chóng
4. **Sử dụng tệp khóa** - Đảm bảo các bản dựng nhất quán, có thể tái tạo
5. **Tự động cập nhật** - Sử dụng Dependabot hoặc Renovate
6. **EĐánh giá trước khi thêm** - Cân nhắc tính bảo mật khi chọn phụ thuộc
7. **Giám sát liên tục** - Các lỗ hổng mới được phát hiện hàng ngày
8. **Có quy trình cập nhật** - Tạo thói quen cập nhật phụ thuộc

Chuỗi cung ứng phần mềm chỉ mạnh bằng mắt xích yếu nhất của nó. Việc coi quản lý phần phụ thuộc là một quy trình quan trọng về bảo mật là điều cần thiết cho bảo mật ứng dụng hiện đại.
