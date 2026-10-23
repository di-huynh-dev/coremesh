---
title: "Bài tập thực hành"
description: Áp dụng các phương pháp STRIDE, DREAD và tấn công cây bằng các bài tập thực hành. Thực hành lập mô hình mối đe dọa trên các tình huống thực tế.
order: 4
---

Lý thuyết trở thành kỹ năng thông qua thực hành. Phần này cung cấp các bài tập thực hành để áp dụng các phương pháp lập mô hình mối đe dọa mà bạn đã học. Mỗi bài tập bao gồm một tình huống, câu hỏi hướng dẫn và giải pháp mẫu.

## Bài tập 1: Phân tích STRIDE của REST API

### Kịch bản

Bạn đang xem xét tính bảo mật của API REST mới cho ứng dụng quản lý tác vụ. API có các điểm cuối này:

```
POST   /api/auth/login          - Authenticate user
POST   /api/auth/register       - Create new account
GET    /api/tasks               - List user's tasks
POST   /api/tasks               - Create a task
PUT    /api/tasks/:id           - Update a task
DELETE /api/tasks/:id           - Delete a task
GET    /api/tasks/:id/share     - Get share link for task
POST   /api/users/:id/avatar    - Upload profile picture
```

### Nhiệm vụ của bạn

Áp dụng STRIDE cho từng điểm cuối. Đối với mỗi loại mối đe dọa, hãy xác định ít nhất một lỗ hổng tiềm ẩn.

### Câu hỏi hướng dẫn

1. **Spoofing**: Làm thế nào kẻ tấn công có thể mạo danh người dùng khác?
2. **Tampering**: Dữ liệu nào có thể bị sửa đổi độc hại?
3. **Repudiation**: Hành động nào thiếu dấu vết kiểm tra thích hợp?
4. **Tiết lộ thông tin**: Dữ liệu nhạy cảm có thể bị rò rỉ ở đâu?
5. **DTừ chối dịch vụ**: Điểm cuối nào có thể bị quá tải?
6. **ETăng đặc quyền**: Làm cách nào người dùng có thể truy cập dữ liệu của người khác?

### Giải pháp mẫu

<details>
<summary>Nhấp để xem giải pháp</summary>

```yaml
stride_analysis:
  spoofing:
    - endpoint: POST /api/auth/login
      threat: "Credential stuffing with leaked passwords"
      mitigation: "Rate limiting, MFA, breach detection"
    
    - endpoint: GET /api/tasks/:id/share
      threat: "Share links could be guessed or brute-forced"
      mitigation: "Use UUIDs, add authentication tokens"

  tampering:
    - endpoint: PUT /api/tasks/:id
      threat: "Modify task ID in request to change others' tasks"
      mitigation: "Server-side ownership verification"
    
    - endpoint: POST /api/users/:id/avatar
      threat: "Upload malicious file (XSS in SVG, webshell)"
      mitigation: "Validate file type, sanitize, serve from separate domain"

  repudiation:
    - endpoint: DELETE /api/tasks/:id
      threat: "No audit log - user claims they didn't delete task"
      mitigation: "Log all destructive operations with user ID, IP, timestamp"
    
    - endpoint: PUT /api/tasks/:id
      threat: "Changes not tracked - no history of modifications"
      mitigation: "Implement version history or change log"

  information_disclosure:
    - endpoint: GET /api/tasks
      threat: "API returns more fields than UI needs (over-fetching)"
      mitigation: "Use DTOs, only return necessary fields"
    
    - endpoint: POST /api/auth/login
      threat: "Different error messages reveal if email exists"
      mitigation: "Generic 'invalid credentials' message"

  denial_of_service:
    - endpoint: POST /api/auth/register
      threat: "Mass account creation depletes resources"
      mitigation: "CAPTCHA, rate limiting, email verification"
    
    - endpoint: POST /api/users/:id/avatar
      threat: "Upload huge files to fill storage"
      mitigation: "File size limits, quota per user"

  elevation_of_privilege:
    - endpoint: GET /api/tasks/:id
      threat: "IDOR - change task ID to access others' tasks"
      mitigation: "Verify task.owner_id == current_user.id"
    
    - endpoint: PUT /api/tasks/:id
      threat: "Modify task ownership via request body"
      mitigation: "Ignore owner_id in request, use authenticated user"
```

</details>

## Bài tập 2: So sánh điểm DREAD

### Kịch bản

Trình quét bảo mật của bạn đã tìm thấy những lỗ hổng này. Cho điểm từng điểm bằng cách sử dụng DREAD và xác định điểm nào cần khắc phục trước.

**Vulnerability A**: SQL injection trong tính năng tìm kiếm quản trị viên (yêu cầu đăng nhập quản trị viên)

**Vulnerability B**: XSS được lưu trữ trong phần bình luận công khai

**Vulnerability C**: CSRF về chức năng thay đổi email

**Vulnerability D**: Dữ liệu nhạy cảm trong tham số URL (được đăng nhập vào nhật ký truy cập)

### Nhiệm vụ của bạn

Cho điểm từng lỗ hổng (1-10) về Thiệt hại, Khả năng tái tạo, Khả năng khai thác, Người dùng bị ảnh hưởng và Khả năng phát hiện. Tính điểm trung bình và xếp hạng chúng.

### Câu hỏi hướng dẫn

Đối với mỗi lỗ hổng, hãy hỏi:
- Tác động trong trường hợp xấu nhất là gì?
- Việc khai thác đáng tin cậy đến mức nào?
- Cần có những kỹ năng/công cụ gì?
- Có bao nhiêu người dùng có thể bị ảnh hưởng?
- Làm thế nào dễ dàng để khám phá?

### Giải pháp mẫu

<details>
<summary>Nhấp để xem giải pháp</summary>

```python
vulnerabilities = {
    'A - SQL Injection (Admin)': {
        'damage': 10,           # Full database access
        'reproducibility': 9,   # Reliable once found
        'exploitability': 5,    # Requires admin access first
        'affected_users': 10,   # All users' data at risk
        'discoverability': 3,   # Hidden behind admin auth
        'average': 7.4
    },
    'B - Stored XSS (Public)': {
        'damage': 6,            # Session hijacking, phishing
        'reproducibility': 10,  # Works every time
        'exploitability': 8,    # Easy to exploit
        'affected_users': 8,    # All visitors to that page
        'discoverability': 7,   # Scanner might find it
        'average': 7.8
    },
    'C - CSRF (Email Change)': {
        'damage': 7,            # Account takeover via password reset
        'reproducibility': 8,   # Needs user to click link
        'exploitability': 6,    # Moderate skill needed
        'affected_users': 4,    # Individual targets
        'discoverability': 5,   # Manual testing reveals
        'average': 6.0
    },
    'D - Sensitive URLs': {
        'damage': 5,            # Data exposure in logs
        'reproducibility': 10,  # Always logged
        'exploitability': 3,    # Need access to logs
        'affected_users': 6,    # Users who used that feature
        'discoverability': 4,   # Need to review logs
        'average': 5.6
    }
}

# Priority Order:
# 1. B - Stored XSS (7.8) - High impact, public-facing
# 2. A - SQL Injection (7.4) - Devastating but limited access
# 3. C - CSRF Email (6.0) - Targeted account takeover
# 4. D - Sensitive URLs (5.6) - Lower immediate risk
```

**Reasoning**:
- XSS được lưu trữ được ưu tiên vì nó hiển thị công khai và ảnh hưởng đến tất cả khách truy cập
- SQL injection nghiêm trọng nhưng yêu cầu quyền truy cập của quản trị viên trước
- CSRF được nhắm mục tiêu (mỗi nạn nhân một lần)
- Ghi nhật ký URL là mối lo ngại về quyền riêng tư nhưng yêu cầu quyền truy cập nhật ký

</details>

## Bài tập 3: Xây dựng cây tấn công

### Kịch bản

Công ty của bạn lưu trữ thông tin thanh toán của khách hàng. Xây dựng cây tấn công cho mục tiêu: **"Đánh cắp dữ liệu thẻ tín dụng"**

Kiến trúc hệ thống:
- Ứng dụng web (React frontend, Node.js backend)
- Cơ sở dữ liệu PostgreSQL với dữ liệu thẻ được mã hóa
- Khóa mã hóa được lưu trữ trong AWS Secrets Manager
- Nhân viên truy cập qua VPN
- Tích hợp bộ xử lý thanh toán của bên thứ ba

### Nhiệm vụ của bạn

Tạo cây tấn công có ít nhất 3 cách tiếp cận cấp cao và 2 cấp độ phân rã. Bao gồm các cổng AND/OR.

### Câu hỏi hướng dẫn

1. Các cách khác nhau để truy cập dữ liệu là gì?
2. Với mỗi cách tiếp cận, cần thực hiện những bước nào?
3. Những bước nào TẤT CẢ phải được hoàn thành (VÀ) so với những bước thay thế (HOẶC)?
4. Các hành động nguyên tử ở cấp độ lá là gì?

### Giải pháp mẫu

<details>
<summary>Nhấp để xem giải pháp</summary>

```
Goal: Steal Credit Card Data
 OR
 |
 |-- [1] Compromise Web Application
 |   OR
 |   |-- [1.1] Exploit Application Vulnerability
 |   |   AND
 |   |   |-- Find RCE/SQLi vulnerability
 |   |   |-- Establish persistence
 |   |   |-- Access encrypted data
 |   |   |-- Obtain decryption key (see branch 3)
 |   |
 |   |-- [1.2] Steal Session Tokens
 |       AND
 |       |-- Inject XSS payload
 |       |-- Victim (admin) visits page
 |       |-- Exfil session cookie
 |       |-- Access admin panel
 |       |-- Export card data
 |
 |-- [2] Compromise Cloud Infrastructure
 |   OR
 |   |-- [2.1] Steal AWS Credentials
 |   |   OR
 |   |   |-- Find leaked keys in Git
 |   |   |-- Phish developer with AWS access
 |   |   |-- Exploit SSRF to access metadata service
 |   |
 |   |-- [2.2] Exploit Misconfiguration
 |       OR
 |       |-- Public S3 bucket with backups
 |       |-- Overly permissive IAM role
 |       |-- Unencrypted RDS snapshot
 |
 |-- [3] Obtain Encryption Keys
 |   OR
 |   |-- [3.1] Access AWS Secrets Manager
 |   |   AND
 |   |   |-- Obtain AWS credentials (see 2.1)
 |   |   |-- Have secretsmanager:GetSecretValue permission
 |   |
 |   |-- [3.2] Memory Dump
 |   |   AND
 |   |   |-- Get shell on application server
 |   |   |-- Dump process memory
 |   |   |-- Extract keys from memory
 |   |
 |   |-- [3.3] Social Engineering
 |       AND
 |       |-- Identify key custodian
 |       |-- Craft pretext (urgent audit, compliance)
 |       |-- Custodian shares access
 |
 |-- [4] Insider Threat
 |   OR
 |   |-- [4.1] Malicious Employee
 |   |   AND
 |   |   |-- Employee has database access
 |   |   |-- Employee has key access
 |   |   |-- Employee exports data
 |   |
 |   |-- [4.2] Compromised Employee
 |       AND
 |       |-- Target employee with access
 |       |-- Compromise their workstation (malware)
 |       |-- Pivot to internal systems
 |
 |-- [5] Third-Party Compromise
     AND
     |-- Payment processor is breached
     |-- Your transactions are in breach scope
     |-- Data includes your customers
```

**Phân tích**:
- Kiểm soát quan trọng: Quyền truy cập AWS Secrets Manager (xuất hiện trong nhiều đường dẫn)
- Đường dẫn rẻ nhất: Nhóm S3 công khai (nếu bị định cấu hình sai)
- Rất có thể: Lừa đảo + chuỗi đánh cắp thông tin xác thực
- Khó bảo vệ nhất: Sự thỏa hiệp của bên thứ ba (kiểm soát hạn chế)

</details>

## Bài tập 4: Mô hình mối đe dọa đầy đủ

### Kịch bản

Bạn đang thiết kế một tính năng mới: **Xác thực hai yếu tố (2FA) qua SMS**.

Dòng chảy:
1. Người dùng nhập tên người dùng/mật khẩu
2. Nếu hợp lệ server gửi mã 6 số qua SMS
3. Người dùng nhập mã trong vòng 5 phút
4. Nếu hợp lệ, phiên được tạo

### Nhiệm vụ của bạn

Thực hiện một mô hình mối đe dọa hoàn chỉnh:
1. Vẽ sơ đồ luồng dữ liệu đơn giản
2. Áp dụng STRIDE cho từng thành phần
3. Ghi điểm các mối đe dọa hàng đầu với DREAD
4. Xây dựng cây tấn công cho "Bỏ qua 2FA"
5. Đề xuất biện pháp giảm thiểu

### Giải pháp mẫu

<details>
<summary>Nhấp để xem giải pháp</summary>

**1. Sơ đồ luồng dữ liệu**

```
[User Browser] ---(1. username/password)---> [Auth Service]
                                                   |
                                           (2. generate code)
                                                   |
                                                   v
                                             [SMS Gateway]
                                                   |
                                           (3. SMS with code)
                                                   |
                                                   v
                                            [User's Phone]
                                                   |
[User Browser] <---(4. enter code)---
       |
       +--(5. code)---> [Auth Service] ---(verify)---> [Session Created]
```

**2. Phân tích STRIDE**

| thành phần | Đe dọa | Danh mục | Mô tả |
|-----------|--------|----------|-------------|
| Dịch vụ xác thực | Mã vũ lực | EoP | Thử tất cả mã 1M |
| Dịch vụ xác thực | Tái sử dụng mã | giả mạo | Sử dụng cùng một mã hai lần |
| Cổng SMS | trao đổi SIM | giả mạo | Kẻ tấn công nhận được SMS |
| Cổng SMS | đánh chặn | Tiết lộ thông tin | tấn công SS7 |
| Điện thoại người dùng | Phần mềm độc hại | giả mạo | Ứng dụng đọc SMS |
| Tạo mã | Có thể dự đoán được | giả mạo | RNG yếu |
| Phiên | cố định | giả mạo | ID phiên đặt trước |
| Nhật ký | Mã trong nhật ký | Tiết lộ thông tin | Ops có thể xem mã |

**3. Điểm DREAD**

```
Threat: SIM Swap Attack
D: 8 (full account takeover)
R: 7 (carrier social engineering works)
E: 5 (requires research on target)
A: 3 (targeted individuals)
D: 6 (known attack vector)
Average: 5.8 - HIGH

Threat: Brute Force Code
D: 8 (account takeover)
R: 10 (deterministic)
E: 9 (simple script)
A: 10 (any user)
D: 8 (obvious attack)
Average: 9.0 - CRITICAL

Threat: Code Logged
D: 6 (insider access to accounts)
R: 10 (always logged if not prevented)
E: 3 (need log access)
A: 10 (all users)
D: 2 (need insider access)
Average: 6.2 - HIGH
```

**4. Cây tấn công: Bỏ qua 2FA**

```
Goal: Bypass SMS 2FA
 OR
 |-- Brute Force Code
 |   AND
 |   |-- Know username/password
 |   |-- No rate limiting
 |   |-- Try 1,000,000 combinations
 |
 |-- Intercept SMS
 |   OR
 |   |-- SIM Swap
 |   |   AND
 |   |   |-- Know target's phone number
 |   |   |-- Social engineer carrier
 |   |
 |   |-- SS7 Attack
 |   |   AND
 |   |   |-- Access to SS7 network
 |   |   |-- Intercept SMS in transit
 |   |
 |   |-- Malware on Phone
 |       AND
 |       |-- Trick user to install app
 |       |-- App has SMS permission
 |       |-- Exfil code to attacker
 |
 |-- Bypass Implementation
 |   OR
 |   |-- Race Condition
 |   |   AND
 |   |   |-- Submit code and change password simultaneously
 |   |   |-- 2FA check is skipped
 |   |
 |   |-- Predictable Codes
 |       AND
 |       |-- Weak random number generator
 |       |-- Predict next code
 |
 |-- Social Engineering
     AND
     |-- Call support as victim
     |-- Claim lost phone
     |-- Support disables 2FA
```

**5. Giảm nhẹ**

| Đe dọa | Giảm nhẹ | Ưu tiên |
|--------|------------|----------|
| vũ lực | Giới hạn tỷ lệ: 3 lần thử, thời gian chờ theo cấp số nhân | P0 |
| vũ lực | Khóa mã sau 5 lần thất bại | P0 |
| trao đổi SIM | Cung cấp khóa TOTP/khóa phần cứng thay thế | P1 |
| SS7 | Khuyến khích 2FA dựa trên ứng dụng | P1 |
| Mã được ghi lại | Không bao giờ đăng nhập mã, sử dụng hệ thống kiểm tra riêng | P1 |
| Điều kiện cuộc đua | Giao dịch nguyên tử cho luồng xác thực | P0 |
| Có thể dự đoán được | Sử dụng RNG bảo mật bằng mật mã | P0 |
| Kỹ thuật xã hội | Yêu cầu xác minh bổ sung để tắt 2FA | P1 |

</details>

## Bài tập 5: Đánh giá mô hình mối đe dọa

### Kịch bản

Xem lại mô hình mối đe dọa này để triển khai Kubernetes. Tìm những gì còn thiếu hoặc không chính xác.

```yaml
system: Customer API
components:
  - name: API Gateway (Kong)
    threats:
      - type: DoS
        description: "Rate limiting protects against DoS"
        status: mitigated
  
  - name: Customer Service (Pod)
    threats:
      - type: Tampering
        description: "JWT tokens prevent tampering"
        status: mitigated
  
  - name: PostgreSQL (StatefulSet)
    threats:
      - type: Information Disclosure
        description: "Database is encrypted at rest"
        status: mitigated
```

### Nhiệm vụ của bạn

Xác định các lỗ hổng trong mô hình mối đe dọa này:
1. Những danh mục STRIDE nào bị thiếu cho mỗi thành phần?
2. Những mối đe dọa cụ thể nào của Kubernetes không được giải quyết?
3. Các trạng thái "giảm nhẹ" có chính xác không?

### Giải pháp mẫu

<details>
<summary>Nhấp để xem giải pháp</summary>

Đã tìm thấy **Gaps**:

Cổng **API (Kong)**:
- Thiếu: Giả mạo (bỏ qua xác thực)
- Thiếu: Tiết lộ thông tin (lỗi dài dòng)
- Thiếu: Độ cao đặc quyền (hiển thị API quản trị viên)
- DoS "giảm nhẹ" quá tự tin - giới hạn tốc độ giúp ích nhưng không ngăn chặn được các cuộc tấn công tinh vi

**Dịch vụ khách hàng**:
- Thiếu: Giả mạo (Thỏa hiệp bí mật JWT)
- Thiếu: Từ chối (không đề cập đến nhật ký kiểm tra)
- Thiếu: Tiết lộ thông tin (nhật ký, thông báo lỗi)
- Thiếu: DoS (không đề cập đến giới hạn tài nguyên)
- Thiếu: EoP (thoát container, RBAC)
- Riêng JWT không ngăn được việc giả mạo dữ liệu khác (cơ sở dữ liệu, tệp)

**PostgreSQL**:
- Thiếu: Giả mạo (đánh cắp thông tin xác thực)
- Thiếu: Giả mạo (SQL injection từ ứng dụng)
- Thiếu: DoS (cạn kiệt tài nguyên, truy vấn chậm)
- Thiếu: EoP (đặc quyền của người dùng cơ sở dữ liệu)
- Mã hóa ở trạng thái lưu trữ không bảo vệ dữ liệu đang truyền hoặc khỏi quyền truy cập ở cấp ứng dụng

**Kubernetes-Các mối đe dọa cụ thể không được giải quyết**:
- Khai thác thoát / kernel container
- RBAC cấu hình sai
- Quản lý bí mật (thông tin đăng nhập được lưu trữ như thế nào?)
- Chính sách mạng (giao tiếp pod-to-pod)
- Lỗ hổng image
- Chuỗi cung ứng (cơ sở tin cậy image)
- Thỏa hiệp nút
- bảo mật vvd
- Lạm dụng mã thông báo tài khoản dịch vụ

**Mô hình mối đe dọa đã được khắc phục**:

```yaml
system: Customer API
components:
  - name: API Gateway (Kong)
    threats:
      - type: Spoofing
        description: "Authentication bypass via misconfigured plugins"
        status: needs_review
      - type: DoS
        description: "Volumetric attacks may exceed rate limits"
        status: partially_mitigated
        mitigation: "Rate limiting + WAF + CDN"
      - type: EoP
        description: "Admin API exposed to internet"
        status: open
        mitigation: "Bind admin to localhost, use NetworkPolicy"
  
  - name: Customer Service (Pod)
    threats:
      - type: Spoofing
        description: "JWT secret stored in Kubernetes Secret"
        status: needs_review
        mitigation: "Rotate secrets, use external secrets manager"
      - type: Repudiation
        description: "No structured audit logging"
        status: open
      - type: EoP
        description: "Container runs as root, no securityContext"
        status: open
        mitigation: "runAsNonRoot, drop capabilities, read-only rootfs"
  
  - name: PostgreSQL
    threats:
      - type: Information Disclosure
        description: "Encryption at rest enabled"
        status: mitigated
      - type: Information Disclosure  
        description: "Traffic between app and DB unencrypted"
        status: open
        mitigation: "Enable SSL, verify certificates"
      - type: Tampering
        description: "App uses parameterized queries"
        status: needs_verification
  
  - name: Kubernetes Cluster
    threats:
      - type: EoP
        description: "Default service accounts have cluster access"
        status: needs_review
      - type: Information Disclosure
        description: "etcd not encrypted"
        status: open
```

</details>

## Danh sách kiểm tra tự đánh giá

Sau khi hoàn thành các bài tập này, hãy xác minh rằng bạn có thể:

- [ ] Áp dụng tất cả sáu danh mục STRIDE cho các thành phần hệ thống
- [ ] Đánh giá các mối đe dọa một cách nhất quán bằng cách sử dụng các yếu tố DREAD
- [ ] Xây dựng cây tấn công bằng logic AND/OR thích hợp
- [ ] Xác định các nút quan trọng trong cây tấn công
- [ ] Kết hợp các phương pháp để phân tích toàn diện
- [ ] Phát hiện những lỗ hổng trong các mô hình mối đe dọa hiện có
- [ ] Đề xuất các biện pháp giảm thiểu ưu tiên

## Các bước tiếp theo

Bây giờ bạn đã thực hành lập mô hình mối đe dọa:

1. **Áp dụng cho hệ thống của riêng bạn**: Chọn một dịch vụ bạn duy trì và đe dọa mô hình hóa nó
2. **Tham gia nhóm của bạn**: Mô hình mối đe dọa hoạt động tốt nhất dưới dạng bài tập hợp tác
3. **Biến nó thành thói quen**: Đưa mô hình mối đe dọa vào đánh giá thiết kế
4. **Xác thực bằng thử nghiệm**: Sử dụng các phát hiện để hướng dẫn thử nghiệm thâm nhập
5. **Theo dõi theo thời gian**: Cập nhật các mô hình mối đe dọa khi hệ thống phát triển

## Đọc thêm

- [Mô hình hóa mối đe dọa OWASP](https://owasp.org/www-community/Threat_Modeling) - Hướng dẫn toàn diện
- [Công cụ lập mô hình mối đe dọa của Microsoft](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool) - Công cụ và tài liệu miễn phí
- [Lập mô hình mối đe dọa: Thiết kế bảo mật](https://www.amazon.com/Threat-Modeling-Designing-Adam-Shostack/dp/1118809998) - Cuốn sách dứt khoát của Adam Shostack
- [Giấy sải bước/DREAD](https://shostack.org/resources/threat-modeling) - Giấy gốc của Microsoft
