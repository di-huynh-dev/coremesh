---
title: Các cổng kiểm soát bảo mật
seoTitle: 'Security Gates: Block Risky Deployments in CI/CD'
description: Triển khai các cổng bảo mật tự động ngăn chặn việc triển khai các lỗ hổng nghiêm trọng, vi phạm chính sách và lỗi bảo mật. Chuyển bảo mật sang trái trong CI/CD pipeline của bạn.
category:
  name: Bảo mật
  slug: security
publishedAt: '2026-02-23'
updatedAt: '2026-02-23'
author:
  name: DevOps Daily Team
  slug: devops-daily-team
tags:
  - Bảo mật
  - DevSecOps
  - CI/CD
  - Cổng kiểm soát chất lượng
  - Thực thi chính sách
---

Cổng bảo mật là các điểm kiểm tra tự động trong CI/CD pipeline của bạn nhằm chặn việc triển khai khi các tiêu chuẩn bảo mật không được đáp ứng. Thay vì phát hiện ra các lỗ hổng trong production, bạn hãy phát hiện sớm ở những nơi có chi phí sửa chữa rẻ hơn và an toàn hơn.

Hướng dẫn này hướng dẫn bạn cách triển khai các cổng bảo mật bằng cách sử dụng chính sách dưới dạng mã, các công cụ thực thi và quét tự động.

## Tại sao cổng bảo mật lại quan trọng

**Không có cổng bảo mật:**
- Lỗ hổng nghiêm trọng đạt tới production
- Bảo mật là điều cần suy nghĩ lại, không phải là một yêu cầu
- Vi phạm tuân thủ được phát hiện trong quá trình kiểm toán
- Không có tiêu chuẩn bảo mật nhất quán

**Với cổng bảo mật:**
- Mã xấu không bao giờ đạt tới production
- Lỗi bảo mật chặn pipeline
- Việc tuân thủ được tự động hóa và liên tục
- Tiêu chuẩn bảo mật rõ ràng được thực thi ở mọi nơi

### Tác động trong thế giới thực

**Target (2013)**: Vi phạm dữ liệu thanh toán đã ảnh hưởng đến hơn 40 triệu khách hàng. Cổng bảo mật kiểm tra thông tin đăng nhập của nhà cung cấp có thể ngăn chặn cuộc tấn công.

**Equifax (2017)**: Lỗ hổng Apache Struts chưa được vá đã làm lộ 147 triệu bản ghi. Việc quét cổng bảo mật để tìm CVE-2017-5638 sẽ chặn quá trình triển khai.

**Capital One (2019)**: Nhóm S3 bị định cấu hình sai làm lộ hơn 100 triệu bản ghi. Các cổng cơ sở hạ tầng dưới dạng mã sẽ phát hiện được lỗ hổng SSRF.

## Bạn sẽ học được gì

Hướng dẫn này bao gồm việc triển khai cổng bảo mật thiết yếu:

1. **[Chính sách dưới dạng Mã](/guides/security-gates/01-policy-as-code)** — OPA, Kyverno và kiểm soát nhập học
2. **[Cổng dễ bị tổn thương](/guides/security-gates/02-vulnerability-gates)** — Lỗi hình thành trên các CVE quan trọng
3. **[Cổng tuân thủ](/guides/security-gates/03-compliance-gates)** — điểm chuẩn CIS, PCI-DSS, SOC 2
4. **[Tích hợp CI/CD](/guides/security-gates/04-cicd-integration)** — Thực thi tự động trong pipeline của bạn

## Các loại cổng bảo mật

```plaintext
Security Gate Categories
├── Vulnerability Gates
│   ├── Critical CVEs → BLOCK
│   ├── High severity → WARN
│   └── Medium/Low → ALLOW
│
├── Policy Gates
│   ├── Container must run as non-root
│   ├── Image must be signed
│   └── No privileged containers
│
├── Compliance Gates
│   ├── CIS Benchmarks
│   ├── PCI-DSS requirements
│   └── SOC 2 controls
│
└── Secret Detection Gates
    ├── API keys → BLOCK
    ├── Passwords → BLOCK
    └── Private keys → BLOCK
```

## So sánh nhanh

| Công cụ | Mục đích | Khi nào nên sử dụng |
|------|---------|-------------|
| **OPA** | Công cụ chính sách chung | Thực thi chính sách phổ quát |
| **Kyverno** | Chính sách Kubernetes | Xác thực dành riêng cho K8 |
| **Trivy** | Quét lỗ hổng | Quét container/IaC |
| **Snyk** | Lỗ hổng + chính sách | Giải pháp thương mại |
| **Checkov** | Quét IaC | Terraform/CloudFormation |
| **Người gác cổng** | Kiểm soát nhập học K8s | Thực thi chính sách OPA trong K8 |

## Mức độ nghiêm trọng của cổng

```yaml
# Example gate configuration
gates:
  vulnerabilities:
    critical: BLOCK    # Stop deployment
    high: WARN         # Allow but notify
    medium: INFO       # Log only
    low: IGNORE        # No action
  
  policies:
    must_have:
      - image_signed
      - no_root_user
      - resource_limits
    severity: BLOCK
  
  compliance:
    frameworks:
      - CIS-1.6
      - PCI-DSS
    failed_checks: BLOCK
```

## Luồng quyết định cổng

```plaintext
Code Commit
  ↓
Build Artifact
  ↓
[Gate 1] Secret Scan
  ├─ PASS → Continue
  └─ FAIL → Block + Notify
       ↓
[Gate 2] Vulnerability Scan  
  ├─ Critical CVE? → BLOCK
  ├─ High severity? → WARN + Continue
  └─ Low/Medium → Continue
       ↓
[Gate 3] Policy Check
  ├─ Signed image? → Continue
  ├─ Runs as root? → BLOCK
  └─ Resource limits? → Continue
       ↓
[Gate 4] Compliance Check
  ├─ CIS pass? → Deploy
  └─ CIS fail? → BLOCK
```

## Ví dụ: Cổng đơn giản

```bash
#!/bin/bash
# Simple security gate script

set -e

echo "🔍 Running security gates..."

# Gate 1: Secret Detection
echo "Gate 1/4: Secret detection"
if gitleaks detect --no-git; then
  echo "✅ No secrets found"
else
  echo "❌ GATE FAILED: Secrets detected!"
  exit 1
fi

# Gate 2: Vulnerability Scan
echo "Gate 2/4: Vulnerability scan"
trivy image --severity CRITICAL,HIGH --exit-code 1 myapp:latest

# Gate 3: Policy Check
echo "Gate 3/4: Policy validation"
conftest test Dockerfile --policy policy/

# Gate 4: SBOM Compliance
echo "Gate 4/4: SBOM generation"
syft myapp:latest -o cyclonedx-json > sbom.json
grype sbom:sbom.json --fail-on critical

echo "✅ All gates passed!"
```

## Thực tiễn tốt nhất

### Bắt đầu đơn giản

Bắt đầu với các cổng có tác động cao, ma sát thấp:

1. **Week 1**: Chỉ phát hiện bí mật
2. **Week 2**: Thêm tính năng chặn CVE quan trọng
3. **Week 3**: Thêm kiểm tra chính sách cơ bản
4. **Week 4**: Thêm tính năng quét tuân thủ

### Cân bằng an ninh và vận tốc

```yaml
# Good: Graduated response
vulnerabilities:
  critical: BLOCK      # Can't deploy
  high: WARN          # Deploy but notify
  medium: INFO        # Log for tracking

# Bad: Too strict
vulnerabilities:
  critical: BLOCK
  high: BLOCK
  medium: BLOCK       # Blocks everything
  low: BLOCK
```

### Biến thất bại thành hành động

**Thông báo lỗi xấu:**
```
Security gate failed
```

**Thông báo lỗi tốt:**
```
❌ Security Gate Failed: Critical Vulnerability

Found: CVE-2024-1234 in base image nginx:1.21
Severity: CRITICAL (CVSS 9.8)
Fix: Update to nginx:1.22 or later

Command to fix:
  docker build --build-arg BASE_IMAGE=nginx:1.22 .

More info: https://nvd.nist.gov/vuln/detail/CVE-2024-1234
```

### Cung cấp cơ chế ghi đè

```yaml
# Allow emergency overrides with approval
gates:
  strict_mode: true
  override:
    enabled: true
    requires_approval: true
    approvers:
      - security-team
      - senior-engineers
    reason_required: true
    audit_log: true
```

## Những cạm bẫy phổ biến

### ❌ Đừng: Cổng mọi thứ ngay lập tức

Bắt đầu với 50 cổng sẽ tạo ra ma sát và lực cản.

### ✅ Nên: Triển khai dần dần

Bắt đầu với 3-5 cổng quan trọng, bổ sung thêm khi nhóm thích nghi.

### ❌ Không: Chặn các vấn đề có mức độ ưu tiên thấp

Chặn các lỗ hổng trung bình/thấp sẽ làm chậm quá trình phát triển.

### ✅ Nên: Sử dụng các hành động dựa trên mức độ nghiêm trọng

Quan trọng → CHẶN, Cao → CẢNH BÁO, Trung bình/Thấp → THÔNG TIN

### ❌ Đừng: Bỏ qua những kết quả tích cực sai

Các đội sẽ vượt qua cổng nếu có quá nhiều cảnh báo sai.

### ✅ Nên: Duy trì danh sách ngăn chặn

Ghi lại và theo dõi các rủi ro được chấp nhận/dương tính giả.

## Các bước tiếp theo

Bắt đầu triển khai cổng bảo mật:

1. **[Chính sách dưới dạng Mã](/guides/security-gates/01-policy-as-code)** - Viết và thực thi các chính sách bảo mật
2. **[Cổng dễ bị tổn thương](/guides/security-gates/02-vulnerability-gates)** — Chặn các CVE quan trọng
3. **[Cổng tuân thủ](/guides/security-gates/03-compliance-gates)** - Tự động kiểm tra tuân thủ
4. **[Tích hợp CI/CD](/guides/security-gates/04-cicd-integration)** - Tích hợp các cổng vào pipeline của bạn

---

**Remember**: Cổng bảo mật không phải để nói "không" — mà là chuyển hướng bảo mật sang bên trái và phát hiện sớm các vấn đề khi chúng dễ sửa chữa hơn và rẻ hơn.
