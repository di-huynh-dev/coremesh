---
title: "Semgrep"
description: Tìm hiểu Semgrep để quét bảo mật nhanh chóng, có thể tùy chỉnh. Viết các quy tắc tùy chỉnh, sử dụng sổ đăng ký và tích hợp vào CI/CD pipeline của bạn.
---

Semgrep là một công cụ phân tích tĩnh mã nguồn mở, nhanh, có khả năng khớp mẫu vượt trội trên các cơ sở mã. Không giống như các công cụ yêu cầu thiết lập phức tạp, Semgrep chạy nhanh chóng với cấu hình tối thiểu—làm cho nó trở nên lý tưởng cho các hook trước commit và phản hồi CI nhanh.

## Tại sao lại là Semgrep?

Semgrep lấp đầy một vị trí độc đáo:

| tính năng | Semgrep | SAST truyền thống |
|---------|---------|------------------|
| thời gian thiết lập | Phút | Giờ/Ngày |
| Tốc độ quét | Nhanh (khớp mẫu) | Chậm hơn (phân tích sâu) |
| Quy tắc tùy chỉnh | Dễ dàng (YAML) | Phức hợp (độc quyền) |
| Dương tính giả | Thấp hơn (mẫu chính xác) | Cao hơn |
| Độ sâu phân tích | Mẫu + luồng dữ liệu | Luồng dữ liệu đầy đủ |

**Tốt nhất cho:**
- Móc Pre-commit (phản hồi nhanh)
- Thực thi các tiêu chuẩn mã hóa
- Quy tắc bảo mật tùy chỉnh cho khung của bạn
- Nắm bắt các mẫu lỗ hổng phổ biến

## Cài đặt

```bash
# macOS
brew install semgrep

# pip (any platform)
pip install semgrep

# Docker
docker run -v "${PWD}:/src" semgrep/semgrep semgrep --config=auto /src
```

Xác minh cài đặt:

```bash
semgrep --version
# semgrep 1.56.0
```

## Chạy lần quét đầu tiên của bạn

Semgrep có thể tự động phát hiện ngôn ngữ của bạn và áp dụng các quy tắc có liên quan:

```bash
# Scan current directory with auto-detected rules
semgrep --config=auto .

# Use specific rule packs
semgrep --config=p/security-audit .
semgrep --config=p/owasp-top-ten .
semgrep --config=p/python .

# Combine multiple configs
semgrep --config=p/security-audit --config=p/secrets .
```

### Định dạng đầu ra

```bash
# Default: human-readable
semgrep --config=auto .

# JSON for CI/CD processing
semgrep --config=auto --json .

# SARIF for GitHub Code Scanning
semgrep --config=auto --sarif > results.sarif

# JUnit XML for test reporting
semgrep --config=auto --junit-xml > results.xml
```

## Đăng ký quy tắc Semgrep

Semgrep duy trì sổ đăng ký quy tắc được tuyển chọn tại [semgrep.dev/explore](https://semgrep.dev/explore).

### Gói quy tắc phổ biến

| gói | Mô tả | Quy tắc |
|------|-------------|-------|
| `p/security-audit` | Quy tắc bảo mật toàn diện | 500+ |
| `p/owasp-top-ten` | 10 lỗ hổng hàng đầu của OWASP | 100+ |
| `p/secrets` | Phát hiện bí mật được mã hóa cứng | 50+ |
| `p/ci` | Quy tắc được tối ưu hóa cho CI (độ tin cậy cao) | 200+ |
| `p/python` | Quy tắc dành riêng cho Python | 150+ |
| `p/javascript` | Quy tắc JavaScript/TypeScript | 150+ |
| `p/java` | quy tắc Java | 100+ |

```bash
# See all available rules in a pack
semgrep --config=p/security-audit --dry-run .
```

## Viết quy tắc tùy chỉnh

Quy tắc Semgrep được viết bằng YAML. Cú pháp mẫu tương tự như ngôn ngữ đích, giúp viết các quy tắc một cách trực quan.

### Cấu trúc quy tắc cơ bản

```yaml
# my-rules/hardcoded-secrets.yaml
rules:
  - id: hardcoded-api-key
    patterns:
      - pattern: $VAR = "AKIA..."
    message: "Hardcoded AWS access key detected"
    severity: ERROR
    languages:
      - python
      - javascript
    metadata:
      category: security
      cwe: "CWE-798"
      owasp: "A07:2021 - Identification and Authentication Failures"
```

Chạy quy tắc tùy chỉnh của bạn:

```bash
semgrep --config=my-rules/hardcoded-secrets.yaml .
```

### Cú pháp mẫu

Các mẫu Semgrep trông giống như mã mà chúng khớp với nhau:

```yaml
# Match any eval() call
pattern: eval(...)

# Match specific function with arguments
pattern: subprocess.call($CMD, shell=True)

# Match string concatenation in SQL
pattern: cursor.execute("..." + $VAR + "...")
```

**Metabiến:**
- `$VAR` - Khớp với bất kỳ biểu thức đơn nào
- `$...ARGS` - Khớp 0 hoặc nhiều đối số
- `$_` - Khớp mọi thứ (ký tự đại diện)

### Toán tử mẫu

#### Mẫu-hoặc (HOẶC)

Phù hợp với bất kỳ mẫu nào:

```yaml
rules:
  - id: dangerous-exec
    pattern-either:
      - pattern: eval($X)
      - pattern: exec($X)
      - pattern: os.system($X)
    message: "Dangerous code execution function"
    severity: WARNING
    languages: [python]
```

#### Mẫu (VÀ)

Yêu cầu tất cả các mẫu phải khớp:

```yaml
rules:
  - id: sql-injection-flask
    patterns:
      - pattern: cursor.execute($QUERY)
      - pattern-inside: |
          @app.route(...)
          def $FUNC(...):
            ...
    message: "SQL query in Flask route - check for injection"
    severity: WARNING
    languages: [python]
```

#### Mẫu-không (loại trừ)

Loại trừ các mẫu an toàn:

```yaml
rules:
  - id: unparameterized-query
    patterns:
      - pattern: cursor.execute($QUERY)
      - pattern-not: cursor.execute($QUERY, $PARAMS)
    message: "SQL query without parameters - potential injection"
    severity: ERROR
    languages: [python]
```

#### Mẫu bên trong (bối cảnh)

Giới hạn kết quả khớp với bối cảnh mã cụ thể:

```yaml
rules:
  - id: hardcoded-password-in-function
    patterns:
      - pattern: password = "..."
      - pattern-inside: |
          def $FUNC(...):
            ...
    message: "Hardcoded password in function"
    severity: ERROR
    languages: [python]
```

### Ví dụ trong thế giới thực: Quy tắc bảo mật Flask

```yaml
# flask-security.yaml
rules:
  - id: flask-debug-mode
    pattern: app.run(..., debug=True, ...)
    message: "Flask debug mode should not be enabled in production"
    severity: WARNING
    languages: [python]
    metadata:
      category: security
      cwe: "CWE-489"

  - id: flask-secret-key-hardcoded
    patterns:
      - pattern-either:
          - pattern: app.secret_key = "..."
          - pattern: app.config["SECRET_KEY"] = "..."
    message: "Flask secret key should not be hardcoded"
    severity: ERROR
    languages: [python]
    metadata:
      category: security
      cwe: "CWE-798"

  - id: flask-sql-injection
    patterns:
      - pattern-either:
          - pattern: |
              db.execute(f"...{$VAR}...")
          - pattern: |
              db.execute("..." + $VAR + "...")
          - pattern: |
              db.execute("..." % $VAR)
          - pattern: |
              db.execute("...".format($VAR))
      - pattern-not: |
          db.execute($QUERY, $PARAMS)
    message: "Potential SQL injection - use parameterized queries"
    severity: ERROR
    languages: [python]
    metadata:
      category: security
      cwe: "CWE-89"
      owasp: "A03:2021 - Injection"
```

### Theo dõi vết bẩn (Nâng cao)

Semgrep Pro hỗ trợ theo dõi vết bẩn để theo dõi luồng dữ liệu:

```yaml
rules:
  - id: flask-xss
    mode: taint
    pattern-sources:
      - pattern: request.args.get(...)
      - pattern: request.form.get(...)
    pattern-sinks:
      - pattern: return $X
    pattern-sanitizers:
      - pattern: escape($X)
      - pattern: Markup.escape($X)
    message: "User input flows to response without sanitization - XSS risk"
    severity: ERROR
    languages: [python]
```

## Tích hợp CI/CD

### Hành động GitHub

```yaml
# .github/workflows/semgrep.yml
name: Semgrep

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  semgrep:
    runs-on: ubuntu-latest
    container:
      image: semgrep/semgrep
    steps:
      - uses: actions/checkout@v4

      - name: Run Semgrep
        run: semgrep scan --config=p/security-audit --error
        env:
          SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}
```

### Móc trước commit

Thêm vào `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/semgrep/semgrep
    rev: v1.56.0
    hooks:
      - id: semgrep
        args: ['--config', 'p/security-audit', '--error']
```

### CI GitLab

```yaml
# .gitlab-ci.yml
semgrep:
  stage: test
  image: semgrep/semgrep
  script:
    - semgrep scan --config=p/security-audit --error --sarif > semgrep.sarif
  artifacts:
    reports:
      sast: semgrep.sarif
  rules:
    - if: $CI_MERGE_REQUEST_IID
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

## Bỏ qua những kết quả tích cực sai

### Bỏ qua nội tuyến

```python
# Safe use of eval for configuration loading
result = eval(config_string)  # nosemgrep: dangerous-eval

# Or with rule ID
result = eval(config_string)  # nosemgrep: python.lang.security.audit.eval-detected
```

### Bỏ qua cấp độ tệp

Tạo `.semgrepignore`:

```
# Ignore test files
tests/

# Ignore generated code
**/generated/

# Ignore specific files
legacy_code.py

# Ignore patterns
*.min.js
```

### Cấu hình cấp quy tắc

Tạo `semgrep.yaml` trong thư mục gốc dự án của bạn:

```yaml
# semgrep.yaml
rules:
  - id: my-org-rules
    pattern: ...
    paths:
      include:
        - src/
      exclude:
        - src/vendor/
        - src/generated/
```

## Tối ưu hóa hiệu suất

### Nhắm mục tiêu các thư mục cụ thể

```bash
# Only scan source directories
semgrep --config=p/security-audit src/ lib/

# Exclude test directories
semgrep --config=p/security-audit --exclude='**/test/**' .
```

### Quy tắc giới hạn

```bash
# Use high-confidence rules only
semgrep --config=p/ci .

# Exclude slow rules
semgrep --config=p/security-audit --exclude-rule='*taint*' .
```

### Bộ nhớ đệm

Semgrep lưu trữ kết quả giữa các lần chạy:

```bash
# Enable caching (default in CI)
export SEMGREP_SEND_METRICS=off
semgrep --config=p/security-audit --metrics=off .
```

## Semgrep so với các công cụ khác

| Khía cạnh | Semgrep | CodeQL | SonarQube |
|--------|---------|--------|----------|
| Tốc độ | Rất nhanh | Chậm | Trung bình |
| Quy tắc tùy chỉnh | Dễ dàng (YAML) | Phức tạp (QL) | Trung bình |
| Bậc miễn phí | Hào phóng | Miễn phí cho OSS | Phiên bản cộng đồng |
| Phân tích vết bẩn | Chỉ chuyên nghiệp | Có | Có |
| Tích hợp IDE | Có | Bị giới hạn | Có |

**Sử dụng Semgrep khi:**
- Bạn cần phản hồi nhanh ở pre-commit hoặc CI
- Bạn muốn viết các quy tắc tùy chỉnh một cách dễ dàng
- Bạn đang thực thi các tiêu chuẩn mã hóa nhóm

**Sử dụng CodeQL khi:**
- Bạn cần phân tích ngữ nghĩa sâu sắc
- Bạn đang kiểm tra các lỗ hổng phức tạp
- Bạn có thời gian để quét kỹ lưỡng

## Bài học chính

1. **Semgrep nhanh chóng và dễ dàng** — Vài phút để thiết lập, vài giây để chạy
2. Cú pháp **Pattern trực quan** — Các quy tắc trông giống như mã mà chúng khớp với nhau
3. **Đăng ký có hơn 2000 quy tắc** — Bắt đầu với `p/security-audit` hoặc `p/ci`
4. **Tuyệt vời để đăng ký trước** — Đủ nhanh để chạy trên mọi commit
5. **Quy tắc tùy chỉnh rất mạnh mẽ** — Thực thi các tiêu chuẩn bảo mật của nhóm bạn

Tiếp theo, chúng ta sẽ khám phá CodeQL để phân tích ngữ nghĩa sâu sắc và tích hợp GitHub.
