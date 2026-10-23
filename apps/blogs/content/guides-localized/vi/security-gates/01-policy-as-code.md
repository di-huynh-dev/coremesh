---
title: "Chính sách dưới dạng Mã"
description: Viết và thực thi các chính sách bảo mật bằng OPA, Kyverno và Conftest. Tự động xác thực chính sách trong kiểm soát nhập học CI/CD và Kubernetes.
---

Chính sách dưới dạng Mã cho phép bạn xác định các yêu cầu bảo mật dưới dạng mã, phiên bản kiểm soát chúng và thực thi chúng một cách tự động. Thay vì các tài liệu PDF mà không ai đọc, bạn viết các chính sách thực thi để chặn những thay đổi không tuân thủ.

## Tại sao Chính sách lại là Quy tắc?

### Quản lý chính sách truyền thống

```plaintext
📄 Security Policy Document (v3.pdf)
- Containers must not run as root
- All images must be scanned
- Resource limits are required

❌ Problems:
- Nobody reads 50-page PDFs
- No enforcement
- Violations found in audits
- Manual checking
```

### Chính sách dưới dạng Mã

```rego
package kubernetes.admission

deny[msg] {
  input.request.kind.kind == "Pod"
  container := input.request.object.spec.containers[_]
  container.securityContext.runAsNonRoot != true
  msg := sprintf("Container %v must set runAsNonRoot=true", [container.name])
}
```

✅ **Lợi ích:**
- Thực thi tự động
- Phiên bản được kiểm soát
- Có thể kiểm tra được
- Ngăn chặn vi phạm trước khi triển khai

## So sánh công cụ

| Công cụ | Tốt nhất cho | Đường cong học tập | Bản địa K8 |
|------|----------|----------------|------------|
| **OPA** | Chính sách chung | Trung bình | Không (cần Người gác cổng) |
| **Kyverno** | Kubernetes | Thấp | Có |
| **Conftest** | CI/CD | Thấp | Không |
| **jsChính sách** | Chính sách JavaScript | Thấp | Có |
| **Kubewarden** | Chính sách WebAssugging | Trung bình | Có |

## Đại lý chính sách mở (OPA)

### Cài đặt

```bash
# Download OPA
curl -L -o opa https://openpolicyagent.org/downloads/latest/opa_linux_amd64
chmod +x opa
sudo mv opa /usr/local/bin/

# Verify
opa version
```

### Viết chính sách

**Ngôn ngữ chính sách Rego:**

```rego
package docker.security

# Deny if image not from trusted registry
deny[msg] {
  input.image
  not startswith(input.image, "ghcr.io/myorg/")
  msg := sprintf("Image %v not from trusted registry", [input.image])
}

# Deny if running as root
deny[msg] {
  input.user == "root"
  msg := "Container must not run as root"
}

# Require resource limits
deny[msg] {
  not input.resources.limits.memory
  msg := "Memory limit required"
}
```

### Chính sách kiểm tra

**Đầu vào (test-pod.json):**
```json
{
  "image": "nginx:latest",
  "user": "root",
  "resources": {}
}
```

**Chạy OPA:**
```bash
opa eval -i test-pod.json -d policy.rego "data.docker.security.deny"

# Output
[
  "Image nginx:latest not from trusted registry",
  "Container must not run as root",
  "Memory limit required"
]
```

### Kiểm tra đơn vị

**policy_test.rego:**
```rego
package docker.security

test_deny_untrusted_image {
  deny[msg] with input as {"image": "nginx:latest"}
  msg == "Image nginx:latest not from trusted registry"
}

test_allow_trusted_image {
  count(deny) == 0 with input as {"image": "ghcr.io/myorg/app:v1"}
}

test_deny_root_user {
  deny[msg] with input as {"user": "root"}
  msg == "Container must not run as root"
}
```

**Chạy thử nghiệm:**
```bash
opa test policy.rego policy_test.rego -v
```

## Conftest (Tích hợp CI/CD)

Conftest sử dụng chính sách OPA để kiểm tra các tệp cấu hình.

### Cài đặt

```bash
# Using binary
curl -L https://github.com/open-policy-agent/conftest/releases/latest/download/conftest_linux_amd64.tar.gz | tar xz
sudo mv conftest /usr/local/bin/

# Verify
conftest --version
```

### Chính sách Dockerfile

**policy/dockerfile.rego:**
```rego
package main

import future.keywords

# Deny if no USER instruction
deny[msg] {
  input[_].Cmd == "from"
  not has_user_instruction
  msg := "Dockerfile must set USER (cannot run as root)"
}

has_user_instruction {
  input[_].Cmd == "user"
}

# Deny if using latest tag
deny[msg] {
  input[_].Cmd == "from"
  val := input[_].Value
  contains(val[_], ":latest")
  msg := "Do not use ':latest' tag. Pin specific versions."
}

# Deny if missing HEALTHCHECK
deny[msg] {
  input[_].Cmd == "from"
  not has_healthcheck
  msg := "Dockerfile must include HEALTHCHECK instruction"
}

has_healthcheck {
  input[_].Cmd == "healthcheck"
}
```

### Kiểm tra tệp Docker

```bash
conftest test Dockerfile

# Output
FAIL - Dockerfile - main - Dockerfile must set USER (cannot run as root)
FAIL - Dockerfile - main - Do not use ':latest' tag. Pin specific versions.
FAIL - Dockerfile - main - Dockerfile must include HEALTHCHECK instruction

3 tests, 0 passed, 0 warnings, 3 failures
```

### Chính sách kê khai Kubernetes

**policy/kubernetes.rego:**
```rego
package main

# Require resource limits
deny[msg] {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.resources.limits
  msg := sprintf("Container %s must have resource limits", [container.name])
}

# Require security context
deny[msg] {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.securityContext.runAsNonRoot
  msg := sprintf("Container %s must set runAsNonRoot=true", [container.name])
}

# Deny privileged containers
deny[msg] {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  container.securityContext.privileged == true
  msg := sprintf("Container %s cannot be privileged", [container.name])
}

# Require read-only root filesystem
deny[msg] {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.securityContext.readOnlyRootFilesystem
  msg := sprintf("Container %s must use read-only root filesystem", [container.name])
}
```

### Bản kê khai thử nghiệm

```bash
conftest test deployment.yaml

# Test multiple files
conftest test k8s/*.yaml

# Custom policy path
conftest test --policy ./security-policies deployment.yaml
```

## Kyverno (Bản địa Kubernetes)

Chính sách của Kyverno là tài nguyên Kubernetes — dễ viết hơn Rego.

### Cài đặt

```bash
kubectl create -f https://github.com/kyverno/kyverno/releases/latest/download/install.yaml

# Verify
kubectl get pods -n kyverno
```

### Chính sách: Yêu cầu Nhãn

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-team-label
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "Label 'team' is required"
        pattern:
          metadata:
            labels:
              team: "?*"
```

### Chính sách: Không cho phép đặc quyền

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-privileged
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-privileged
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "Privileged containers are not allowed"
        pattern:
          spec:
            containers:
              - securityContext:
                  privileged: false
```

### Chính sách: Yêu cầu chữ ký image

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-image-signature
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-signature
      match:
        any:
          - resources:
              kinds:
                - Pod
      verifyImages:
        - imageReferences:
            - "ghcr.io/myorg/*"
          attestors:
            - count: 1
              entries:
                - keyless:
                    subject: "https://github.com/myorg/*"
                    issuer: "https://token.actions.githubusercontent.com"
                    rekor:
                      url: https://rekor.sigstore.dev
```

### Chính sách kiểm tra

```bash
# Apply policy
kubectl apply -f policy.yaml

# Test with a pod
kubectl run test --image=nginx --dry-run=server

# Should fail with policy violation
Error from server: admission webhook "validate.kyverno.svc" denied the request:

resource Pod/default/test was blocked due to the following policies:

require-labels:
  check-team-label: 'validation error: Label ''team'' is required'
```

## Tích hợp hành động GitHub

```yaml
name: Policy Validation

on: [push, pull_request]

jobs:
  conftest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Conftest
        run: |
          curl -L https://github.com/open-policy-agent/conftest/releases/latest/download/conftest_linux_amd64.tar.gz | tar xz
          sudo mv conftest /usr/local/bin/
      
      - name: Test Dockerfile
        run: conftest test Dockerfile --policy policy/
      
      - name: Test Kubernetes manifests
        run: conftest test k8s/*.yaml --policy policy/
      
      - name: Test Terraform
        run: |
          terraform init
          terraform plan -out=tfplan
          terraform show -json tfplan > plan.json
          conftest test plan.json --policy policy/terraform/
```

## Tích hợp CI GitLab

```yaml
stages:
  - policy

policy-check:
  stage: policy
  image: openpolicyagent/conftest:latest
  script:
    - conftest test Dockerfile --policy policy/
    - conftest test k8s/*.yaml --policy policy/
  only:
    - merge_requests
    - main
```

## Thực tiễn tốt nhất

### Bắt đầu với Cảnh báo

```rego
# Start with warnings, not denials
warn[msg] {
  input.image
  not startswith(input.image, "ghcr.io/myorg/")
  msg := sprintf("Image %v not from trusted registry", [input.image])
}

# Convert to deny after team adapts
# deny[msg] { ... }
```

### Tổ chức chính sách

```
policy/
├── dockerfile/
│   ├── security.rego
│   └── best-practices.rego
├── kubernetes/
│   ├── security.rego
│   ├── resources.rego
│   └── networking.rego
└── terraform/
    ├── aws.rego
    └── security-groups.rego
```

### Chính sách tài liệu

```rego
package kubernetes.security

# METADATA
# title: Container Security Context
# description: Ensures containers run with secure settings
# custom:
#   severity: high
#   frameworks:
#     - CIS-1.6
#     - PCI-DSS

deny[msg] {
  # Check logic here
}
```

### Kiểm tra mọi thứ

```bash
# Run policy tests
opa test policy/ -v

# Test coverage
opa test policy/ --coverage
```

## Khắc phục sự cố

### Chính sách không kích hoạt

```bash
# Debug OPA evaluation
opa eval -i input.json -d policy.rego --explain full "data.main.deny"

# Check Kyverno policy status
kubectl describe clusterpolicy require-labels
```

### Tích cực sai

```rego
# Add exceptions
deny[msg] {
  input.kind == "Pod"
  not is_exception
  # ... validation logic
}

is_exception {
  input.metadata.namespace == "kube-system"
}

is_exception {
  input.metadata.annotations["policy-exception"] == "approved"
}
```

## Các bước tiếp theo

- **[Cổng dễ bị tổn thương](./02-vulnerability-gates)** - Chặn các CVE quan trọng trong pipeline của bạn
- **[Cổng tuân thủ](./03-compliance-gates)** — Tự động kiểm tra CIS, PCI-DSS
- **[Tích hợp CI/CD](./04-cicd-integration)** - Tích hợp pipeline hoàn chỉnh

---

**Bài học rút ra**: Bắt đầu với 3-5 chính sách quan trọng, sử dụng cảnh báo trước, sau đó chuyển sang từ chối. Kiểm tra các chính sách như mã.
