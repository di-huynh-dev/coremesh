---
title: "Cổng kiểm tra tuân thủ"
description: Thực thi các yêu cầu quy định và tiêu chuẩn bảo mật trong CI/CD pipeline
---

Cổng tuân thủ đảm bảo cơ sở hạ tầng và ứng dụng đáp ứng các yêu cầu quy định (Tiêu chuẩn PCI-DSS, SOC 2, HIPAA, CIS) trước khi triển khai.

## Tổng quan

Tuân thủ quy định là bắt buộc đối với các ngành như:

- **Finance**: PCI-DSS (dữ liệu thẻ thanh toán), SOX (báo cáo tài chính)
- **Healthcare**: HIPAA (dữ liệu bệnh nhân), HITRUST
- **Chính phủ**: FedRAMP, NIST SP 800-53
- **General**: SOC 2 (kiểm soát bảo mật), ISO 27001

### Tác động trong thế giới thực

**Vi phạm mục tiêu (2013)**
- Những kẻ tấn công đã xâm nhập thông qua thông tin đăng nhập của nhà thầu HVAC
- Không thể phân đoạn mạng theo yêu cầu PCI-DSS
- 40 triệu thẻ tín dụng bị xâm phạm
- **Cost**: tiền phạt 18,5 triệu USD + 202 triệu USD tiền bồi thường
- **Prevention**: Các cổng tuân thủ phân đoạn mạng sẽ chặn việc triển khai

**Capital One Breach (2019)**
- AWS WAF bị định cấu hình sai cho phép tấn công SSRF
- Kiểm soát điểm chuẩn của CIS AWS Foundation không thành công
- 100 triệu hồ sơ khách hàng bị đánh cắp
- **Cost**: tiền phạt OCC 80 triệu USD + vụ kiện tập thể 190 triệu USD
- **Prevent**: Quét tuân thủ IaC sẽ phát hiện các quy tắc tường lửa bị định cấu hình sai

## Khung tuân thủ

### Điểm chuẩn CIS

Các tiêu chuẩn bảo mật được đồng thuận trong ngành dành cho:

- **Hệ điều hành**: Linux, Windows, macOS
- **Cloud**: AWS, Azure, GCP, Kubernetes
- **Cơ sở dữ liệu**: MySQL, PostgreSQL, MongoDB
- **Ứng dụng**: Docker, NGINX, Apache

**Cấp độ:**
- **Level 1**: Bảo mật cơ bản (sẵn sàng cho production)
- **Cấp 2**: Phòng thủ nhiều lớp (môi trường bảo mật cao)

### PCI-DSS 4.0

Tiêu chuẩn bảo mật dữ liệu ngành thẻ thanh toán:

- **Yêu cầu 1-2**: Phân đoạn mạng và cấu hình tường lửa
- **Yêu cầu 3-4**: Mã hóa dữ liệu khi lưu trữ và đang truyền
- **Yêu cầu 6**: Phát triển ứng dụng an toàn
- **Yêu cầu 8**: Xác thực mạnh (MFA)
- **Yêu cầu 10**: Ghi nhật ký và giám sát

### SÓC 2

Tiêu chí dịch vụ ủy thác của AICPA:

- **Security**: Bảo vệ chống truy cập trái phép
- **Aavailability**: Thời gian hoạt động và độ tin cậy của hệ thống
- **Tính toàn vẹn trong xử lý**: Xử lý đầy đủ, hợp lệ, kịp thời
- **Confidentiality**: Bảo vệ dữ liệu vượt xa bảo mật
- **Privacy**: Thu thập, sử dụng, lưu giữ, tiết lộ PII

## Kiểm tra tuân thủ IaC

### Cài đặt

```bash
# Install with pip
pip install checkov

# Or use Docker
docker pull bridgecrew/checkov
```

### Cách sử dụng cơ bản

```bash
# Scan Terraform
checkov -d /path/to/terraform --framework terraform

# Scan Kubernetes YAML
checkov -f k8s-deployment.yaml --framework kubernetes

# Scan Dockerfile
checkov -f Dockerfile --framework dockerfile

# Fail on high severity only
checkov -d . --check HIGH,CRITICAL --compact --quiet
```

### Quét cụ thể theo tuân thủ

```bash
# CIS AWS Foundations Benchmark
checkov -d . --framework terraform --check CKV_AWS_*

# PCI-DSS compliance
checkov -d . --compact --check POLICY_COMPLIANCE_PCI

# HIPAA compliance
checkov -d . --compact --check POLICY_COMPLIANCE_HIPAA

# SOC 2 controls
checkov -d . --compact --check POLICY_COMPLIANCE_SOC2
```

### Ví dụ về vi phạm Terraform

```hcl
# FAIL: CKV_AWS_18 - S3 bucket without access logging
resource "aws_s3_bucket" "data" {
  bucket = "company-data"
  # Missing: logging configuration
}

# PASS: Fixed with logging
resource "aws_s3_bucket" "data" {
  bucket = "company-data"
}

resource "aws_s3_bucket_logging" "data" {
  bucket = aws_s3_bucket.data.id
  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "s3-access-logs/"
}
```

```hcl
# FAIL: CKV_AWS_19 - S3 bucket encryption disabled
resource "aws_s3_bucket" "data" {
  bucket = "company-data"
}

# PASS: Fixed with encryption
resource "aws_s3_bucket" "data" {
  bucket = "company-data"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

## Ví dụ về hành động GitHub

```yaml
name: Compliance Gate

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  compliance-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Checkov for Terraform
        uses: bridgecrewio/checkov-action@master
        with:
          directory: terraform/
          framework: terraform
          output_format: sarif
          output_file_path: reports/checkov.sarif
          soft_fail: false  # Fail build on violations
          check: HIGH,CRITICAL
      
      - name: Upload results to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: reports/checkov.sarif
      
      - name: Run Checkov for Kubernetes
        run: |
          pip install checkov
          checkov -d k8s/ --framework kubernetes --compact --quiet
```

## Ví dụ CI GitLab

```yaml
compliance-gate:
  stage: security
  image: bridgecrew/checkov:latest
  script:
    - checkov -d terraform/ --framework terraform --compact --output-file-path console,results.json
    - checkov -d k8s/ --framework kubernetes --compact
  artifacts:
    reports:
      sast: results.json
    paths:
      - results.json
  only:
    - merge_requests
    - main
```

## Bảo mật băng ghế dự bị Docker

Trình kiểm tra tự động CIS Docker Benchmark:

```bash
# Clone Docker Bench Security
git clone https://github.com/docker/docker-bench-security.git
cd docker-bench-security

# Run checks
sudo sh docker-bench-security.sh

# Run specific checks
sudo sh docker-bench-security.sh -c container_images

# Export results
sudo sh docker-bench-security.sh -l /tmp/docker-bench.log
```

### Tích hợp CI/CD

```yaml
name: Docker CIS Benchmark

on: [push, pull_request]

jobs:
  docker-bench:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t myapp:test .
      
      - name: Run Docker Bench Security
        run: |
          docker run --rm \
            --net host \
            --pid host \
            --userns host \
            --cap-add audit_control \
            -v /var/lib:/var/lib \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v /etc:/etc \
            docker/docker-bench-security
```

## Điểm chuẩn CIS Kubernetes

### Băng ghế kube

```bash
# Install kube-bench
curl -L https://github.com/aquasecurity/kube-bench/releases/download/v0.7.0/kube-bench_0.7.0_linux_amd64.tar.gz -o kube-bench.tar.gz
tar -xvf kube-bench.tar.gz

# Run as job in cluster
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml

# View results
kubectl logs -f job/kube-bench

# Run specific version
kube-bench run --benchmark cis-1.8
```

### Ví dụ về vi phạm Kubernetes

```yaml
# FAIL: Pod running as root
apiVersion: v1
kind: Pod
metadata:
  name: insecure-pod
spec:
  containers:
  - name: app
    image: nginx
    # Missing: securityContext with runAsNonRoot

# PASS: Fixed with security context
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
  - name: app
    image: nginx
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

## Chính sách tuân thủ tùy chỉnh

### Chính sách OPA dành cho phân đoạn mạng PCI-DSS

```rego
# pci-dss-network.rego
package terraform.pci_dss

import rego.v1

# PCI-DSS Requirement 1.3: Prohibit direct public access to cardholder data
deny contains msg if {
    resource := input.resource.aws_security_group[_]
    rule := resource.ingress[_]
    
    # Check if allows 0.0.0.0/0 access
    rule.cidr_blocks[_] == "0.0.0.0/0"
    
    # Check if accessing sensitive ports (database)
    rule.from_port <= 3306
    rule.to_port >= 3306
    
    msg := sprintf("Security group '%s' allows public access to MySQL port 3306 (PCI-DSS 1.3 violation)", [resource.name])
}

# PCI-DSS Requirement 8.3: Implement MFA for remote access
deny contains msg if {
    resource := input.resource.aws_iam_user[_]
    not resource.force_destroy
    not has_mfa_device(resource.name)
    
    msg := sprintf("IAM user '%s' does not have MFA enabled (PCI-DSS 8.3 violation)", [resource.name])
}

has_mfa_device(user_name) if {
    input.resource.aws_iam_user_mfa_device[_].user == user_name
}
```

Sử dụng với Checkov:

```bash
checkov -d terraform/ --external-checks-dir ./policies/
```

## Báo cáo tuân thủ

### Tạo báo cáo tuân thủ

```bash
#!/bin/bash
# compliance-report.sh

set -e

REPORT_DIR="reports/$(date +%Y-%m-%d)"
mkdir -p "$REPORT_DIR"

echo "Running compliance scans..."

# Terraform compliance
echo "[1/4] Scanning Terraform..."
checkov -d terraform/ --framework terraform \
  --output json > "$REPORT_DIR/terraform-compliance.json"

# Kubernetes compliance
echo "[2/4] Scanning Kubernetes..."
checkov -d k8s/ --framework kubernetes \
  --output json > "$REPORT_DIR/k8s-compliance.json"

# Docker compliance
echo "[3/4] Scanning Dockerfiles..."
checkov -f Dockerfile --framework dockerfile \
  --output json > "$REPORT_DIR/docker-compliance.json"

# Generate summary
echo "[4/4] Generating summary..."
python3 << EOF
import json
import os

report_dir = "$REPORT_DIR"
frameworks = ['terraform', 'k8s', 'docker']

print("\\n=== Compliance Summary ===")
for fw in frameworks:
    with open(f"{report_dir}/{fw}-compliance.json") as f:
        data = json.load(f)
        summary = data.get('summary', {})
        passed = summary.get('passed', 0)
        failed = summary.get('failed', 0)
        print(f"{fw.upper()}: {passed} passed, {failed} failed")
EOF

echo "\nReports saved to: $REPORT_DIR"
```

### Tải lên Trang tổng quan tuân thủ

```bash
#!/bin/bash
# upload-compliance.sh

REPORT_FILE="$1"
COMPLIANCE_API="https://compliance.company.com/api/reports"

curl -X POST "$COMPLIANCE_API" \
  -H "Authorization: Bearer $COMPLIANCE_TOKEN" \
  -H "Content-Type: application/json" \
  --data @"$REPORT_FILE"
```

## Quản lý ngoại lệ

### Ngoại lệ tạm thời khi hết hạn

```yaml
# .checkov.yaml
soft-fail: true  # Don't fail build, just report

skip-check:
  - CKV_AWS_18  # S3 access logging
    # Reason: Legacy bucket, migration scheduled
    # Approved by: security-team@company.com
    # Expires: 2025-06-01
    # Jira: SEC-1234
```

### Kiểm tra hết hạn ngoại lệ tự động

```python
#!/usr/bin/env python3
# check-exceptions.py

import yaml
from datetime import datetime

with open('.checkov.yaml') as f:
    config = yaml.safe_load(f)

skipped_checks = config.get('skip-check', [])
expired = []

for check in skipped_checks:
    if isinstance(check, dict) and 'expires' in check:
        expires = datetime.strptime(check['expires'], '%Y-%m-%d')
        if expires < datetime.now():
            expired.append(check)

if expired:
    print("ERROR: Expired compliance exceptions found:")
    for check in expired:
        print(f"  - {check}")
    exit(1)

print("All compliance exceptions are valid.")
```

## Thực tiễn tốt nhất

### 1. Chuyển trái tuân thủ

```
Development → PR → Build → Deploy
     ↓         ↓      ↓       ↓
  IDE check  Gate   Gate   Audit
```

- **IDE**: Móc Pre-commit có Checkov
- **PR**: Quét tự động trong CI
- **Build**: Chặn các vi phạm nghiêm trọng
- **Deploy**: Giám sát tuân thủ thời gian chạy

### 2. Triển khai lũy tiến

```yaml
# Week 1-2: Report-only mode
checkov -d . --soft-fail

# Week 3-4: Block critical only
checkov -d . --check HIGH,CRITICAL

# Week 5+: Full enforcement
checkov -d . --compact
```

### 3. Kiểm toán thường xuyên

```yaml
# cronjob-compliance-audit.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: compliance-audit
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: checkov
            image: bridgecrew/checkov:latest
            command:
            - sh
            - -c
            - |
              checkov -d /workspace --framework terraform --output json > /reports/$(date +%Y-%m-%d).json
              # Upload to central compliance dashboard
              curl -X POST "$COMPLIANCE_API/upload" -H "Authorization: Bearer $TOKEN" --data @/reports/$(date +%Y-%m-%d).json
          restartPolicy: OnFailure
```

### 4. Tuân thủ như kho lưu trữ mã

```
compliance/
├── policies/
│   ├── pci-dss.rego
│   ├── soc2.rego
│   └── hipaa.rego
├── exceptions/
│   ├── exceptions.yaml
│   └── README.md
├── reports/
│   └── .gitkeep
└── scripts/
    ├── check-exceptions.py
    ├── generate-report.sh
    └── upload-compliance.sh
```

## Số liệu cần theo dõi

- **Điểm tuân thủ**: Tỷ lệ phần trăm kiểm tra được thông qua
- **Thời gian khắc phục**: Thời gian trung bình từ khi phát hiện vi phạm đến khi khắc phục
- **Tỷ lệ ngoại lệ**: Phần trăm séc có ngoại lệ được phê duyệt
- **AKiểm tra Tần suất**: Tần suất chạy quét tuân thủ

## Khắc phục sự cố

### "Quá nhiều kết quả tích cực sai"

**Problem**: Checkov gắn cờ các tài nguyên không áp dụng.

**Solution**: Sử dụng chú thích bỏ qua trong IaC:

```hcl
# Skip specific check for this resource
resource "aws_s3_bucket" "public_assets" {
  #checkov:skip=CKV_AWS_18:Public assets bucket doesn't need logging
  bucket = "public-assets"
}
```

### "Quét tuân thủ mất quá nhiều thời gian"

**Problem**: Checkov quét khối CI pipeline.

**Solution**: Chỉ quét các tệp đã thay đổi:

```bash
# Get changed files
CHANGED_FILES=$(git diff --name-only origin/main)

# Scan only changed .tf files
for file in $CHANGED_FILES; do
  if [[ $file == *.tf ]]; then
    checkov -f "$file"
  fi
done
```

### "Các yêu cầu tuân thủ xung đột"

**Problem**: PCI-DSS và SOC 2 có các yêu cầu mã hóa khác nhau.

**Solution**: Sử dụng các chính sách dành riêng cho khung:

```bash
# PCI-DSS environment
checkov -d . --framework terraform --check POLICY_COMPLIANCE_PCI

# SOC 2 environment
checkov -d . --framework terraform --check POLICY_COMPLIANCE_SOC2
```

## Các bước tiếp theo

- [Tích hợp CI/CD](/guides/security-gates/04-cicd-integration) - Ví dụ pipeline hoàn chỉnh
- Chính sách [Chính sách dưới dạng Mã](/guides/security-gates/01-policy-as-code) - OPA và Kyverno
- [Cổng dễ bị tổn thương](/guides/security-gates/02-vulnerability-gates) - Quét CVE
