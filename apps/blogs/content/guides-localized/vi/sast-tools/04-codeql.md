---
title: "CodeQL"
description: Master CodeQL để phân tích mã ngữ nghĩa sâu. Tìm hiểu ngôn ngữ truy vấn, chạy truy vấn bảo mật và tích hợp với GitHub Advanced Security.
---

CodeQL là công cụ phân tích mã ngữ nghĩa của GitHub. Không giống như các công cụ dựa trên mẫu, CodeQL xử lý mã dưới dạng dữ liệu—bạn truy vấn mã bằng ngôn ngữ chuyên biệt để tìm các lỗ hổng phức tạp mà các công cụ đơn giản hơn bỏ sót.

## CodeQL hoạt động như thế nào

CodeQL hoạt động theo hai giai đoạn:

```
1. Database Creation
   Source Code → CodeQL Extractor → CodeQL Database
   
2. Query Execution
   CodeQL Database + Queries → Results
```

**Database Creation** phân tích mã của bạn thành cơ sở dữ liệu quan hệ có chứa:
- Các nút Cây cú pháp trừu tượng (AST)
- Thông tin luồng dữ liệu
- Biểu đồ luồng điều khiển
- Nhập thông tin
- Biểu đồ cuộc gọi

**Thực thi truy vấn** chạy truy vấn QL dựa trên cơ sở dữ liệu này để tìm mẫu.

## Cài đặt

### CodeQL CLI

```bash
# macOS
brew install codeql

# Download from GitHub
# https://github.com/github/codeql-cli-binaries/releases

# Verify installation
codeql --version
# CodeQL command-line toolchain release 2.16.0
```

### Gói truy vấn tiêu chuẩn

```bash
# Download standard libraries and queries
codeql pack download codeql/python-queries
codeql pack download codeql/javascript-queries
codeql pack download codeql/java-queries
```

## Tạo cơ sở dữ liệu CodeQL

Trước khi chạy truy vấn, bạn phải tạo cơ sở dữ liệu từ mã nguồn của mình:

```bash
# Python project
codeql database create ./codeql-db \\
  --language=python \\
  --source-root=./src

# JavaScript/TypeScript project
codeql database create ./codeql-db \\
  --language=javascript \\
  --source-root=.

# Java project (requires build)
codeql database create ./codeql-db \\
  --language=java \\
  --command='mvn clean compile'
```

**Lưu ý:** Các ngôn ngữ được biên dịch (Java, C++, Go) yêu cầu CodeQL để tuân thủ quá trình xây dựng. Các ngôn ngữ được thông dịch (Python, JavaScript) không cần lệnh xây dựng.

## Chạy truy vấn bảo mật

### Sử dụng gói truy vấn

```bash
# Run all security queries for Python
codeql database analyze ./codeql-db \\
  codeql/python-queries:codeql-suites/python-security-extended.qls \\
  --format=sarif-latest \\
  --output=results.sarif

# Run specific query
codeql database analyze ./codeql-db \\
  codeql/python-queries:Security/CWE-089/SqlInjection.ql \\
  --format=sarif-latest \\
  --output=sql-injection.sarif
```

### Bộ truy vấn

| Suite | Mô tả | Trường hợp sử dụng |
|-------|-------------|----------|
| `security-extended.qls` | Truy vấn bảo mật toàn diện | Kiểm toán bảo mật sâu |
| `security-and-quality.qls` | Bảo mật + chất lượng mã | Quét CI chung |
| `code-scanning.qls` | Mặc định quét mã GitHub | kiểm tra quan hệ công chúng |

## Hiểu ngôn ngữ QL

QL là ngôn ngữ truy vấn hướng đối tượng, khai báo. Tìm hiểu kiến thức cơ bản giúp bạn hiểu kết quả truy vấn và viết truy vấn tùy chỉnh.

### Cấu trúc truy vấn cơ bản

```ql
/**
 * @name Find calls to eval
 * @description Detects calls to the eval function
 * @kind problem
 * @problem.severity warning
 * @id py/call-to-eval
 */

import python

from Call call, Name name
where
  call.getFunc() = name and
  name.getId() = "eval"
select call, "Call to eval() detected"
```

Các thành phần **Query:**

- `import python` - Nhập thư viện chuẩn Python
- `from ... where ... select` - Cấu trúc truy vấn giống SQL
- `@kind problem` - Truy vấn tạo ra kết quả kiểu cảnh báo
- `@problem.severity` - cảnh báo, lỗi hoặc khuyến nghị

### Tìm SQL injection (Python)

```ql
/**
 * @name SQL injection vulnerability
 * @description User input flows to SQL query without sanitization
 * @kind path-problem
 * @problem.severity error
 * @id py/sql-injection
 */

import python
import semmle.python.dataflow.new.DataFlow
import semmle.python.dataflow.new.TaintTracking
import semmle.python.Concepts

module SqlInjectionConfig implements DataFlow::ConfigSig {
  predicate isSource(DataFlow::Node source) {
    source instanceof RemoteFlowSource
  }

  predicate isSink(DataFlow::Node sink) {
    exists(SqlExecution sql | sql.getSql() = sink)
  }
}

module SqlInjectionFlow = TaintTracking::Global<SqlInjectionConfig>;

from SqlInjectionFlow::PathNode source, SqlInjectionFlow::PathNode sink
where SqlInjectionFlow::flowPath(source, sink)
select sink.getNode(), source, sink, "SQL injection from $@", source.getNode(), "user input"
```

Truy vấn này:
1. Xác định nguồn (đầu vào của người dùng từ các yêu cầu HTTP)
2. Xác định phần chìm (thực thi SQL hàm)
3. Sử dụng tính năng theo dõi vết bẩn để tìm đường dẫn từ nguồn đến bồn chứa
4. Báo cáo lỗ hổng với đường dẫn luồng dữ liệu

### Các khái niệm QL phổ biến

**Các lớp và vị từ:**

```ql
// Class representing function calls
class DangerousCall extends Call {
  DangerousCall() {
    this.getFunc().(Name).getId() in ["eval", "exec", "compile"]
  }
}

// Predicate (reusable condition)
predicate isUserInput(Expr e) {
  exists(Call call | 
    call.getFunc().(Attribute).getName() = "get" and
    call.getFunc().(Attribute).getObject().(Name).getId() in ["request", "args", "form"] and
    call = e
  )
}
```

**Luồng dữ liệu:**

```ql
// Track data from source to sink
from DataFlow::Node source, DataFlow::Node sink
where
  source instanceof RemoteFlowSource and
  sink = any(Call c | c.getFunc().(Name).getId() = "eval").getAnArg() and
  DataFlow::localFlow(source, sink)
select sink, "User input flows to eval"
```

## Tích hợp quét mã GitHub

Cách dễ nhất để sử dụng CodeQL là thông qua tính năng Quét mã miễn phí của GitHub.

### Bật quét mã

1. Đi tới kho lưu trữ của bạn trên GitHub
2. Nhấp vào **Security** > **Quét mã**
3. Nhấp vào **Thiết lập quét mã**
4. Chọn **Phân tích CodeQL**
5. Xem lại và quy trình làm việc của commit

### Quy trình làm việc mặc định

```yaml
# .github/workflows/codeql.yml
name: "CodeQL"

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly on Monday

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: ['python', 'javascript']

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: +security-and-quality

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{ matrix.language }}"
```

### Truy vấn tùy chỉnh trong CI

Thêm truy vấn của riêng bạn vào phân tích:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: ${{ matrix.language }}
    queries: +security-and-quality
    # Add custom query pack
    packs: my-org/my-custom-queries@1.0.0
```

Hoặc tham khảo các truy vấn địa phương:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: python
    queries: ./codeql/custom-queries/
```

## Viết truy vấn tùy chỉnh

### Cấu trúc gói truy vấn

```
my-queries/
├── qlpack.yml          # Pack metadata
├── codeql-suites/
│   └── my-suite.qls    # Query suite definition
└── src/
    └── security/
        ├── HardcodedCredentials.ql
        └── InsecureRandomness.ql
```

**qlpack.yml:**

```yaml
name: my-org/my-queries
version: 1.0.0
dependencies:
  codeql/python-all: "*"
```

Bộ **Query (my-suite.qls):**

```yaml
- queries: .
- include:
    kind: problem
- include:
    kind: path-problem
```

### Ví dụ: Phát hiện bí mật được mã hóa cứng

```ql
/**
 * @name Hardcoded credentials
 * @description Credentials should not be hardcoded in source code
 * @kind problem
 * @problem.severity error
 * @precision high
 * @id py/hardcoded-credentials
 * @tags security
 *       external/cwe/cwe-798
 */

import python

predicate isCredentialVariable(Name name) {
  name.getId().toLowerCase().regexpMatch(".*\\b(password|passwd|pwd|secret|api_key|apikey|token|auth)\\b.*")
}

from Assign assign, Name target, StrConst value
where
  assign.getATarget() = target and
  assign.getValue() = value and
  isCredentialVariable(target) and
  value.getText().length() > 4  // Ignore empty/short strings
select assign, "Potential hardcoded credential in variable '" + target.getId() + "'"
```

### Kiểm tra truy vấn của bạn

CodeQL hỗ trợ kiểm tra đơn vị cho các truy vấn:

```
my-queries/
└── test/
    └── security/
        ├── HardcodedCredentials/
        │   ├── test.py           # Test code
        │   └── HardcodedCredentials.expected  # Expected results
```

**test.py:**

```python
# Test file for hardcoded credentials detection

password = "secret123"  # $result
api_key = "AKIA1234567890ABCDEF"  # $result

username = "admin"  # Safe - not a credential variable
safe_value = get_password_from_vault()  # Safe - not a string literal
```

**Chạy thử nghiệm:**

```bash
codeql test run my-queries/test/
```

## Thực tiễn tốt nhất

### 1. Bắt đầu với Truy vấn Chuẩn

Các truy vấn tích hợp của CodeQL đã được kiểm tra kỹ lưỡng. Chỉ tùy chỉnh khi bạn có nhu cầu cụ thể.

### 2. Sử dụng truy vấn đường dẫn cho luồng dữ liệu

Truy vấn đường dẫn (`@kind path-problem`) hiển thị luồng dữ liệu hoàn chỉnh từ nguồn đến phần chìm, giúp dễ hiểu và khắc phục các lỗ hổng hơn.

### 3. Điều chỉnh cơ sở mã của bạn

Loại trừ mã được tạo và thư mục nhà cung cấp:

```yaml
# codeql-config.yml
paths-ignore:
  - node_modules
  - vendor
  - "**/*.generated.py"
```

### 4. Cơ sở dữ liệu bộ đệm

Việc tạo cơ sở dữ liệu CodeQL rất tốn kém. Lưu trữ nó trong CI:

```yaml
- name: Cache CodeQL database
  uses: actions/cache@v3
  with:
    path: .codeql-db
    key: codeql-${{ hashFiles('**/*.py') }}
```

### 5. Xem lại cảnh báo một cách có hệ thống

Quét mã GitHub hiển thị cảnh báo trong tab Bảo mật. Phân loại chúng:
- **Dismiss** kèm theo lý do nếu dương tính giả
- **Tạo vấn đề** cho các lỗ hổng thực sự
- **Fix trong PR** để sửa lỗi dễ dàng

## CodeQL so với các công cụ khác

| tính năng | CodeQL | Semgrep | SonarQube |
|---------|--------|---------|----------|
| Độ sâu phân tích | sâu nhất | Dựa trên mẫu | sâu |
| Tốc độ | Chậm | Nhanh | Trung bình |
| Quy tắc tùy chỉnh | Phức tạp (QL) | Dễ dàng (YAML) | Trung bình |
| Luồng dữ liệu | Tuyệt vời | Chỉ chuyên nghiệp | Tốt |
| Miễn phí cho các repo riêng tư | Đã trả tiền | Bị giới hạn | Cộng đồng Ed |
| Tích hợp GitHub | Bản địa | Tốt | Tốt |

**Sử dụng CodeQL khi:**
- Bạn cần tìm những lỗ hổng phức tạp
- Bạn đang sử dụng GitHub và muốn tích hợp gốc
- Bạn có thời gian để phân tích kỹ lưỡng (quét hàng tuần)
- Bạn đang kiểm tra mã quan trọng về bảo mật

## Giá bảo mật nâng cao của GitHub

- **Free** cho các kho lưu trữ công cộng
- **Paid** dành cho kho riêng (giấy phép GitHub Advanced Security)
- Bao gồm: Quét mã, Quét bí mật, Đánh giá phụ thuộc

## Khắc phục sự cố

### Tạo cơ sở dữ liệu không thành công

```bash
# Verbose output for debugging
codeql database create ./codeql-db \\
  --language=python \\
  --source-root=. \\
  --verbosity=progress
```

### Hết thời gian truy vấn

```bash
# Increase timeout (default 5 minutes)
codeql database analyze ./codeql-db \\
  codeql/python-queries:codeql-suites/python-security-extended.qls \\
  --timeout=1800  # 30 minutes
```

### Quá nhiều kết quả

```bash
# Limit to high-precision queries
codeql database analyze ./codeql-db \\
  codeql/python-queries:codeql-suites/python-security-extended.qls \\
  --sarif-add-snippets \\
  --threads=4
```

## Bài học chính

1. **CodeQL là phân tích sâu nhất** — Tốt nhất để tìm các lỗ hổng phức tạp
2. **Tạo cơ sở dữ liệu là một bước riêng biệt** — Lập kế hoạch cho thời gian xây dựng
3. **QL mạnh mẽ nhưng phức tạp** — Bắt đầu với các truy vấn tiêu chuẩn
4. Tích hợp **GitHub liền mạch** — Miễn phí cho nguồn mở
5. **Kết hợp với các công cụ nhanh hơn** — Sử dụng Semgrep cho tiền commit, CodeQL để quét sâu hàng tuần

Giờ đây, bạn đã có bộ công cụ SAST toàn diện: SonarQube để hiển thị trên toàn nền tảng, Semgrep để có các quy tắc tùy chỉnh nhanh và CodeQL để phân tích ngữ nghĩa sâu. Xếp lớp các công cụ này để phát hiện các lỗ hổng ở mọi giai đoạn phát triển.
