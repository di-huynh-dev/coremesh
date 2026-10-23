---
title: "Cơ bản về SAST"
description: Hiểu cách hoạt động của phân tích tĩnh, các kỹ thuật phân tích khác nhau và những hạn chế của các công cụ SAST.
---

Trước khi đi sâu vào các công cụ cụ thể, bạn cần hiểu cách hoạt động của phân tích tĩnh và những gì nó có thể (và không thể) làm được. Kiến thức này giúp bạn định cấu hình các công cụ một cách hiệu quả, diễn giải kết quả một cách chính xác và đặt ra những kỳ vọng thực tế.

## Phân tích tĩnh hoạt động như thế nào

Phân tích tĩnh kiểm tra mã nguồn mà không thực thi nó. Trình phân tích xây dựng bản trình bày mã của bạn—thường là Cây cú pháp trừu tượng (AST)—và sau đó áp dụng các quy tắc để phát hiện các mẫu biểu thị lỗ hổng.

### Phân tích pipeline

```
Source Code → Parsing → AST → Analysis Engine → Rules → Findings
     │           │         │          │            │         │
     ▼           ▼         ▼          ▼            ▼         ▼
  .java,     Lexical    Tree      Data flow,   Security   Vulnerabilities
  .py, .js   tokens     structure  taint,      patterns   with severity
                                   control flow
```

**Từng bước:**

1. **Parsing** - Chuyển đổi mã nguồn thành mã thông báo, sau đó xây dựng AST
2. **Phân tích ngữ nghĩa** - Giải quyết các loại, phạm vi và tham chiếu ký hiệu
3. **Control Flow Analysis** — Ánh xạ các đường dẫn thực thi khả thi
4. **Phân tích luồng dữ liệu** - Theo dõi cách dữ liệu di chuyển trong chương trình
5. **Pattern Matching** - Áp dụng các quy tắc bảo mật để tìm lỗ hổng
6. **Reporting** - Tạo ra các phát hiện với mức độ nghiêm trọng, vị trí và cách khắc phục

## Các loại phân tích tĩnh

Các công cụ khác nhau sử dụng các kỹ thuật phân tích khác nhau. Hiểu những điều này sẽ giúp bạn chọn công cụ phù hợp.

### Khớp mẫu (Phân tích cú pháp)

Cách tiếp cận đơn giản nhất: tìm kiếm các mẫu mã khớp với các chữ ký xấu đã biết.

```python
# Rule: Detect hardcoded passwords
# Pattern: variable named "password" assigned a string literal

password = "secretpassword123"  # FLAGGED: Hardcoded credential

api_key = "AKIA1234567890ABCDEF"  # FLAGGED: AWS key pattern
```

**Ưu điểm:**
- Thực thi nhanh (khớp chuỗi/regex đơn giản)
- Dễ dàng viết các quy tắc tùy chỉnh
- Tỷ lệ dương tính giả thấp đối với các mẫu đơn giản

**Nhược điểm:**
- Bỏ lỡ các lỗ hổng phức tạp
- Dễ dàng bỏ qua (đổi tên biến, nối chuỗi)
- Không hiểu về luồng dữ liệu

**Tools:** Semgrep (chủ yếu), tập lệnh tùy chỉnh dựa trên grep

### Phân tích luồng dữ liệu

Theo dõi cách dữ liệu di chuyển từ nguồn (đầu vào của người dùng) đến nơi lưu trữ (hàm nguy hiểm).

```python
# Data flow analysis tracks this:

def process_user(request):
    username = request.get('username')     # SOURCE: User input
    
    # Data flows through transformations...
    processed = username.strip()
    lower_name = processed.lower()
    
    # Eventually reaches a dangerous sink
    query = f"SELECT * FROM users WHERE name = '{lower_name}'"  # SINK: SQL
    cursor.execute(query)  # FLAGGED: Tainted data reaches SQL sink
```

Máy phân tích theo dõi "vết nhơ" từ `request.get()` thông qua tất cả các phép biến đổi thành `cursor.execute()`. Nếu không xảy ra quá trình vệ sinh, nó sẽ báo cáo SQL injection.

**Ưu điểm:**
- Phát hiện các lỗ hổng phức tạp trên khắp ranh giới hàm
- Hiểu khi nào dữ liệu được vệ sinh
- Ít âm tính giả hơn so với khớp mẫu

**Nhược điểm:**
- Nhiều kết quả dương tính giả hơn (chất khử trùng không được công nhận)
- Phân tích chậm hơn (phải theo dõi tất cả các đường dẫn)
- Yêu cầu triển khai theo ngôn ngữ cụ thể

**Công cụ:** CodeQL, Củng cố, Checkmarx

### Theo dõi vết bẩn

Một dạng phân tích luồng dữ liệu chuyên dụng để theo dõi cụ thể dữ liệu "bị nhiễm độc" (không đáng tin cậy).

```javascript
// Taint tracking example

// Configuration defines:
// - Sources: req.body, req.query, req.params
// - Sinks: eval(), exec(), innerHTML
// - Sanitizers: DOMPurify.sanitize(), escapeHtml()

function handleRequest(req, res) {
    const userInput = req.body.content;    // TAINTED
    
    // Option A: No sanitization - VULNERABLE
    document.innerHTML = userInput;         // FLAGGED: XSS
    
    // Option B: With sanitization - SAFE
    const clean = DOMPurify.sanitize(userInput);  // Taint removed
    document.innerHTML = clean;             // OK: Input was sanitized
}
```

**Ưu điểm:**
- Theo dõi chính xác dữ liệu không đáng tin cậy
- Hiểu vệ sinh hàm
- Có thể theo dõi qua ranh giới tập tin

**Nhược điểm:**
- Phải cấu hình nguồn, bồn rửa và chất khử trùng
- Không thể theo dõi thông qua mã phản chiếu hoặc mã động
- Phân tích liên thủ tục phức tạp chậm

**Tools:** CodeQL, SonarQube (quy tắc nâng cao)

### Phân tích luồng điều khiển

Kiểm tra các đường dẫn thực thi có thể có thông qua mã của bạn.

```python
def process_payment(user, amount):
    # Control flow analysis builds this graph:
    #
    #     ┌──────────────────┐
    #     │   Start          │
    #     └────────┬─────────┘
    #              │
    #     ┌────────▼─────────┐
    #     │ user.is_admin?   │
    #     └───────┬──┬───────┘
    #         yes │  │ no
    #     ┌───────▼┐ │
    #     │ bypass │ │
    #     │ check  │ │
    #     └───┬────┘ │
    #         │  ┌───▼────────┐
    #         │  │ verify()   │
    #         │  └───┬────────┘
    #         │      │
    #     ┌───▼──────▼────────┐
    #     │ execute_payment() │
    #     └───────────────────┘
    
    if user.is_admin:
        pass  # Admin bypass - potential issue!
    else:
        if not verify_payment(amount):
            raise PaymentError("Verification failed")
    
    execute_payment(user, amount)  # Reached on both paths
```

Phân tích luồng điều khiển có thể phát hiện:
- Mã chết (đường dẫn không thể truy cập)
- Thiếu kiểm tra ủy quyền trên một số đường dẫn nhất định
- Khoảng trống xử lý ngoại lệ

## Hiểu các hạn chế của SAST

Công cụ SAST mạnh mẽ nhưng không hoàn hảo. Hiểu được những hạn chế của chúng sẽ giúp bạn sử dụng chúng một cách hiệu quả.

### Tích cực sai

Kết quả dương tính giả là khi công cụ báo cáo một lỗ hổng mà thực tế không thể khai thác được.

```python
# Common false positive: Framework-provided sanitization

from django.db import connection

def search_users(request):
    name = request.GET.get('name')
    
    # Django's parameterized queries are safe, but some tools still flag this
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT * FROM users WHERE name = %s",  # Safe: parameterized
            [name]
        )
```

**Quản lý kết quả dương tính giả:**

1. **Điều chỉnh các quy tắc của bạn** — Điều chỉnh cài đặt độ nhạy
2. **Thêm nhận xét ngăn chặn** — Đánh dấu các kết quả dương tính giả đã biết
3. **Định cấu hình bộ khử trùng** - Cho công cụ biết về khung của bạn
4. **Xem xét thường xuyên** - Một số "kết quả tích cực sai" thực ra là vấn đề đúng

### Âm tính giả

Kết quả âm tính giả là khi công cụ bỏ sót một lỗ hổng thực sự.

```python
# SAST tools struggle with dynamic code

def execute_dynamic(request):
    func_name = request.GET.get('action')
    
    # Dynamic function lookup - hard to analyze statically
    func = getattr(my_module, func_name)
    func()  # Potential command injection, but SAST may miss it

# Also hard to detect:
# - Vulnerabilities in third-party libraries (SAST only sees your code)
# - Business logic flaws (tool doesn't understand your requirements)
# - Configuration issues (SAST analyzes code, not config files)
```

### Ranh giới phân tích

Các công cụ SAST có giới hạn về những gì chúng có thể phân tích:

| Có thể phân tích | Không thể phân tích |
|-------------|----------------|
| Mã nguồn bạn cung cấp | Phụ thuộc nhị phân |
| Các khung đã biết | Khung tùy chỉnh |
| Cuộc gọi trực tiếp hàm | Phản xạ/công văn động |
| Giá trị thời gian biên dịch | Cấu hình thời gian chạy |
| Đường dẫn mã | Tính chính xác của logic kinh doanh |

## Chọn độ sâu phân tích phù hợp

Các công cụ khác nhau mang lại sự đánh đổi khác nhau:

| Loại công cụ | Tốc độ | Độ chính xác | nỗ lực thiết lập |
|-----------|-------|----------|-------------|
| Khớp mẫu (Semgrep) | Nhanh | Trung bình | Thấp |
| Luồng dữ liệu (SonarQube) | Trung bình | Cao | Trung bình |
| Phân tích ngữ nghĩa (CodeQL) | Chậm | Cao nhất | Cao |

**Đối với hầu hết các nhóm, cách tiếp cận theo lớp hoạt động tốt nhất:**

1. **IDE/Pre-commit** — Khớp mẫu nhanh (Semgrep)
2. **CI Pipeline** — Phân tích toàn diện (SonarQube)
3. **Quét hàng tuần/sâu** — Phân tích ngữ nghĩa (CodeQL) cho các kho lưu trữ quan trọng

## SAST so với kiểm tra bảo mật khác

SAST là một công cụ trong kho vũ khí bảo mật của bạn:

| loại | Khi nào | Nó tìm thấy gì | Hạn chế |
|------|------|---------------|-------------|
| **SAST** | Thời gian biên dịch | Lỗ hổng mã | Bỏ lỡ các vấn đề về thời gian chạy/cấu hình |
| **DAST** | Thời gian chạy | Lỗ hổng triển khai | Cần ứng dụng chạy chậm |
| **SCA** | Thời gian xây dựng | Sự phụ thuộc dễ bị tổn thương | Chỉ những CVE được biết đến |
| **IAST** | Thời gian chạy | Đường dẫn mã thời gian chạy | Yêu cầu thiết bị đo đạc |
| **Quét bí mật** | commit-thời gian | Thông tin đăng nhập bị rò rỉ | Chỉ những mẫu đã biết |

**DAST (Kiểm tra bảo mật ứng dụng động)** kiểm tra ứng dụng đang chạy từ bên ngoài—giống như kẻ tấn công sẽ làm. Nó phát hiện các sự cố mà SAST bỏ sót (máy chủ bị định cấu hình sai, sự cố triển khai) nhưng yêu cầu môi trường được triển khai.

**SCA (Phân tích thành phần phần mềm)** quét các phần phụ thuộc của bạn để tìm các lỗ hổng đã biết. SAST chỉ phân tích mã của bạn chứ không phải thư viện bạn sử dụng.

## Tích hợp SAST vào quy trình làm việc của bạn

Để đạt hiệu quả tối đa, hãy tích hợp SAST ở nhiều điểm:

### 1. IDE nhà phát triển

Nắm bắt các vấn đề khi mã được viết:

```
Developer writes code → IDE plugin highlights issue → Immediate fix
```

**Lợi ích:** Phản hồi nhanh nhất, dễ sửa nhất
**Challenge:** Phải cập nhật các plugin IDE

### 2. Móc trước commit

Ngăn chặn mã dễ bị tấn công là đã commit:

```bash
#!/bin/bash
# .git/hooks/pre-commit

semgrep --config=p/security-audit --error .
if [ \$? -ne 0 ]; then
    echo "Security issues detected. Please fix before committing."
    exit 1
fi
```

**Lợi ích:** Ngăn chặn sự cố khi nhập cơ sở mã
**Thử thách:** Có thể làm chậm commit

### 3. CI/CD pipeline

Chạy quét toàn diện trên mọi pull request:

```yaml
# GitHub Actions example
security-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run SAST
      run: |
        sonar-scanner \\
          -Dsonar.projectKey=my-project \\
          -Dsonar.sources=. \\
          -Dsonar.host.url=\${{ secrets.SONAR_URL }}
```

**Lợi ích:** Nắm bắt các vấn đề trước khi hợp nhất, báo cáo chi tiết
**Challenge:** Thêm thời gian vào CI pipeline

### 4. Quét theo lịch trình

Chạy phân tích sâu định kỳ:

```yaml
# Weekly CodeQL scan
on:
  schedule:
    - cron: '0 3 * * 0'  # Every Sunday at 3 AM
```

**Lợi ích:** Khắc phục sự cố do các bản cập nhật phụ thuộc gây ra
**Thử thách:** Phản hồi bị trì hoãn

## Bài học chính

Trước khi tiếp tục với các công cụ cụ thể, hãy nhớ:

1. **Không có công cụ duy nhất nào nắm bắt được mọi thứ** — Sử dụng SAST cùng với DAST, SCA và xem xét thủ công
2. **Tune cho ngăn xếp của bạn** — Định cấu hình các công cụ để hiểu khung và trình khử trùng của bạn
3. **Bắt đầu với các quy tắc có độ tin cậy cao** — Giảm các kết quả dương tính giả để tạo niềm tin cho nhà phát triển
4. **Shift rời dần** — Thêm plugin IDE và hook pre-commit sau khi tích hợp CI ổn định
5. **Xử lý các phát hiện như nợ công nghệ** — Theo dõi, ưu tiên và khắc phục một cách có hệ thống

Bây giờ hãy bắt tay thực hành với SonarQube, Semgrep và CodeQL.
