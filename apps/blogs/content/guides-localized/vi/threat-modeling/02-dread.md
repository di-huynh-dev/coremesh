---
title: "Đánh giá rủi ro DREAD"
description: 'Tìm hiểu cách ưu tiên các mối đe dọa bảo mật bằng mô hình tính điểm DREAD: Thiệt hại, Khả năng tái tạo, Khả năng khai thác, Người dùng bị ảnh hưởng và Khả năng phát hiện.'
order: 2
---

Sau khi xác định được các mối đe dọa bằng STRIDE, bạn cần ưu tiên chúng. Không phải tất cả các mối đe dọa đều như nhau—một số mối đe dọa cần được chú ý ngay lập tức trong khi những mối đe dọa khác có thể được giải quyết sau. DREAD là mô hình đánh giá rủi ro giúp bạn ghi điểm và so sánh các mối đe dọa một cách khách quan.

Từ viết tắt của **D**amage, **R**eproducibility, **E**xploitability, **A**ffected user và **D**khả năng khám phá. Bằng cách cho điểm từng yếu tố, bạn sẽ có được xếp hạng rủi ro bằng số để hướng dẫn việc phân bổ nguồn lực.

## Năm yếu tố TUYỆT VỜI

Mỗi yếu tố thường được tính điểm từ 1-10 (hoặc 0-3 để tính điểm đơn giản):

| Yếu tố | Câu hỏi | Điểm thấp | Điểm cao |
|--------|----------|-----------|------------|
| **Hư hỏng** | Tác động xấu đến mức nào? | Bất tiện nhỏ | Thỏa hiệp hệ thống hoàn chỉnh |
| **Khả năng tái tạo** | Làm thế nào dễ dàng để sinh sản? | Yêu cầu điều kiện hiếm | Hoạt động mọi lúc |
| **Khả năng khai thác** | Làm thế nào dễ dàng để khai thác? | Đòi hỏi kỹ năng chuyên môn | Kịch bản nhóc con có thể làm được |
| **Người dùng bị ảnh hưởng** | Có bao nhiêu người dùng bị ảnh hưởng? | Người dùng đơn | Tất cả người dùng |
| **Khả năng khám phá** | Làm thế nào dễ dàng tìm thấy? | Yêu cầu quyền truy cập mã nguồn | Tài liệu công khai |

## Tiềm năng thiệt hại

Thiệt hại đo lường tác động trong trường hợp xấu nhất nếu mối đe dọa được nhận ra. Xem xét cả tác động kỹ thuật và kinh doanh.

### Chấm điểm sát thương (Thang 1-10)

| Điểm | tác động | Ví dụ |
|-------|--------|----------|
| 1-2 | **Tối thiểu** | Giao diện người dùng trục trặc, hiệu suất giảm nhẹ |
| 3-4 | **Thấp** | Một người dùng gặp bất tiện, dữ liệu không nhạy cảm bị lộ |
| 5-6 | **Trung bình** | Nhiều người dùng bị ảnh hưởng, một số dữ liệu nhạy cảm bị lộ |
| 7-8 | **Cao** | Dịch vụ ngừng hoạt động, dữ liệu tài chính bị lộ, vi phạm quy định |
| 9-10 | **Critical** | Sự xâm phạm hoàn toàn, tất cả dữ liệu bị đánh cắp, phá hủy hoạt động kinh doanh |

### Ví dụ: Ghi điểm sát thương

Hãy xem xét lỗ hổng SQL injection trong các bối cảnh khác nhau:

```yaml
# Same vulnerability, different damage scores

sql_injection_read_only_analytics:
  description: "SQLi in analytics dashboard"
  data_exposed: "Aggregated, non-PII metrics"
  damage_score: 3  # Low - no sensitive data

sql_injection_user_profile:
  description: "SQLi in user profile endpoint"
  data_exposed: "Email, name, preferences"
  damage_score: 6  # Moderate - PII exposed

sql_injection_payment_system:
  description: "SQLi in payment processing"
  data_exposed: "Credit cards, bank accounts, SSN"
  damage_score: 10  # Critical - PCI/financial data
```

## Độ tái lập

Khả năng tái tạo đo lường mức độ tin cậy mà kẻ tấn công có thể kích hoạt lỗ hổng. Một lỗi hoạt động 100% sẽ nguy hiểm hơn một lỗi yêu cầu thời gian cụ thể.

### Khả năng tái lập điểm (Thang 1-10)

| Điểm | Độ tin cậy | Điều kiện |
|-------|-------------|------------|
| 1-2 | **Hiếm** | Yêu cầu điều kiện cuộc đua, phần cứng hoặc thời gian cụ thể |
| 3-4 | **Dkhó** | Cần cấu hình cụ thể hoặc hành động của người dùng |
| 5-6 | **Trung bình** | Hoạt động trong điều kiện chung |
| 7-8 | **Easy** | Hoạt động với thiết lập tối thiểu |
| 9-10 | **Tầm thường** | Đáng tin cậy 100%, không có điều kiện đặc biệt |

### Ví dụ: Khả năng tái tạo điểm

```yaml
race_condition_double_spend:
  description: "Race condition allowing double-spending"
  conditions: "Two requests must hit different servers within 10ms window"
  reproducibility_score: 3  # Difficult - requires precise timing

xss_reflected:
  description: "Reflected XSS in search parameter"
  conditions: "Victim must click malicious link"
  reproducibility_score: 7  # Easy - social engineering required but reliable

xss_stored:
  description: "Stored XSS in user comments"
  conditions: "None - payload persists and executes for all viewers"
  reproducibility_score: 10  # Trivial - works every time
```

## Khả năng khai thác

Khả năng khai thác đo lường mức độ kỹ năng, thời gian và nguồn lực cần thiết để khai thác lỗ hổng. Xem xét các công cụ có sẵn và khai thác công khai.

### Khả năng khai thác tính điểm (Thang 1-10)

| Điểm | Yêu cầu kỹ năng | Tài nguyên |
|-------|---------------|-----------||
| 1-2 | **Expert** | Phát triển khai thác tùy chỉnh, kiến thức giao thức sâu |
| 3-4 | **Nâng cao** | Kỹ năng viết kịch bản, một số kỹ thuật đảo ngược |
| 5-6 | **Trung cấp** | Sử dụng các công cụ hiện có có sửa đổi |
| 7-8 | **Người mới** | Có sẵn công cụ trỏ và nhấp chuột |
| 9-10 | **Không có** | Máy quét tự động, khai thác công khai, không cần kỹ năng |

### Ví dụ: Khả năng khai thác tính điểm

```yaml
buffer_overflow_custom_protocol:
  description: "Stack buffer overflow in proprietary binary protocol"
  exploit_requirements: "Reverse engineering, ROP chain development, ASLR bypass"
  exploitability_score: 2  # Expert - months of work

deserialization_java:
  description: "Java deserialization in API endpoint"
  exploit_requirements: "ysoserial tool available"
  exploitability_score: 7  # Novice - public tools exist

default_credentials:
  description: "Admin panel with admin/admin credentials"
  exploit_requirements: "Web browser"
  exploitability_score: 10  # None - literally type 'admin'
```

## Người dùng bị ảnh hưởng

Người dùng bị ảnh hưởng đo lường số lượng người sẽ bị ảnh hưởng. Hãy xem xét cả nạn nhân trực tiếp và tác động gián tiếp.

### Chấm điểm người dùng bị ảnh hưởng (Thang điểm 1-10)

| Điểm | Phạm vi | Mô tả |
|-------|-------|-------------|
| 1-2 | **Cá nhân** | Một người dùng, một phiên |
| 3-4 | **Nhóm nhỏ** | Vai trò, bộ phận hoặc khu vực cụ thể |
| 5-6 | **Đáng kể** | Phân khúc người dùng lớn, nhiều vai trò |
| 7-8 | **Người dùng nhiều nhất** | Phần lớn cơ sở người dùng |
| 9-10 | **Mọi người** | Tất cả người dùng, đối tác và hệ thống hạ nguồn |

### Ví dụ: Chấm điểm người dùng bị ảnh hưởng

```yaml
account_takeover_targeted:
  description: "Session hijacking via XSS"
  affected: "Individual victims who click malicious links"
  affected_users_score: 3  # Small - one at a time

data_breach_user_table:
  description: "Database dump of user credentials"
  affected: "All registered users (500,000)"
  affected_users_score: 9  # Everyone - all users

supply_chain_attack:
  description: "Compromised npm package"
  affected: "All applications depending on package + their users"
  affected_users_score: 10  # Everyone + downstream
```

## Khả năng khám phá

Khả năng khám phá đo lường mức độ dễ dàng mà kẻ tấn công tìm thấy lỗ hổng. Hãy xem xét những thông tin nào được công bố rộng rãi.

### Khả năng khám phá tính điểm (Thang 1-10)

| Điểm | khả năng hiển thị | Thông tin cần thiết |
|-------|------------|--------------------|
| 1-2 | **Hẩn** | Yêu cầu quyền truy cập mã nguồn, kiến thức nội bộ |
| 3-4 | **Obscure** | Kiến thức ứng dụng sâu sắc, lối đi khác thường |
| 5-6 | **Có thể khám phá** | Máy quét tự động có thể tìm thấy nó |
| 7-8 | **Orõ ràng** | Kiểm tra mờ cơ bản hoặc thủ công cho thấy nó |
| 9-10 | **Công khai** | Được ghi lại trong cơ sở dữ liệu CVE, Shodan hoặc khai thác |

### Ví dụ: Khả năng khám phá tính điểm

```yaml
logic_flaw_payment:
  description: "Business logic flaw in discount calculation"
  discovery_method: "Requires understanding of pricing rules"
  discoverability_score: 3  # Obscure - not found by scanners

sql_injection_login:
  description: "SQLi in login form"
  discovery_method: "Standard automated scanner will find it"
  discoverability_score: 8  # Obvious - scanners detect

known_cve_unpatched:
  description: "CVE-2023-XXXX in Apache Struts"
  discovery_method: "Shodan search, public exploit available"
  discoverability_score: 10  # Public - actively scanned for
```

## Tính điểm DREAD

Cách tiếp cận đơn giản nhất là lấy trung bình năm yếu tố:

```python
def calculate_dread_score(damage, reproducibility, exploitability, 
                          affected_users, discoverability):
    """
    Calculate DREAD risk score.
    Each factor should be scored 1-10.
    Returns average score and risk level.
    """
    total = damage + reproducibility + exploitability + affected_users + discoverability
    average = total / 5
    
    if average >= 8:
        risk_level = "CRITICAL"
    elif average >= 6:
        risk_level = "HIGH"
    elif average >= 4:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    return {
        'score': round(average, 1),
        'risk_level': risk_level,
        'breakdown': {
            'damage': damage,
            'reproducibility': reproducibility,
            'exploitability': exploitability,
            'affected_users': affected_users,
            'discoverability': discoverability
        }
    }

# Example usage
sql_injection_payment = calculate_dread_score(
    damage=10,           # Credit card data exposed
    reproducibility=9,   # Works every time
    exploitability=8,    # sqlmap can exploit automatically
    affected_users=9,    # All customers
    discoverability=7    # Scanner will find it
)

print(sql_injection_payment)
# {'score': 8.6, 'risk_level': 'CRITICAL', 'breakdown': {...}}
```

## Tính điểm DREAD có trọng số

Một số tổ chức đánh giá các yếu tố khác nhau dựa trên mức độ ưu tiên của họ:

```python
def calculate_weighted_dread(damage, reproducibility, exploitability,
                             affected_users, discoverability, weights=None):
    """
    Calculate weighted DREAD score.
    Weights adjust importance of each factor.
    """
    default_weights = {
        'damage': 1.5,          # Prioritize impact
        'reproducibility': 1.0,
        'exploitability': 1.2,  # Prioritize ease of attack
        'affected_users': 1.0,
        'discoverability': 0.8  # Deprioritize (assume attacker finds it)
    }
    weights = weights or default_weights
    
    weighted_sum = (
        damage * weights['damage'] +
        reproducibility * weights['reproducibility'] +
        exploitability * weights['exploitability'] +
        affected_users * weights['affected_users'] +
        discoverability * weights['discoverability']
    )
    
    total_weight = sum(weights.values())
    weighted_average = weighted_sum / total_weight
    
    return round(weighted_average, 1)
```

## DREAD trong thực tế: Ví dụ hoàn chỉnh

Hãy ghi điểm nhiều mối đe dọa và ưu tiên chúng:

```python
# Threat modeling results for e-commerce application
threats = [
    {
        'name': 'SQL Injection in Product Search',
        'stride_category': 'Tampering/Information Disclosure',
        'dread': {
            'damage': 7,           # Product data exposure
            'reproducibility': 9,  # Reliable
            'exploitability': 8,   # Automated tools
            'affected_users': 8,   # All users see products
            'discoverability': 8   # Scanner finds it
        }
    },
    {
        'name': 'CSRF on Password Change',
        'stride_category': 'Spoofing',
        'dread': {
            'damage': 6,           # Account compromise
            'reproducibility': 7,  # Needs user to click link
            'exploitability': 5,   # Some skill needed
            'affected_users': 3,   # Individual targets
            'discoverability': 6   # Manual testing reveals
        }
    },
    {
        'name': 'Exposed Admin Panel',
        'stride_category': 'Information Disclosure',
        'dread': {
            'damage': 9,           # Full admin access
            'reproducibility': 10, # Always accessible
            'exploitability': 6,   # Still needs credentials
            'affected_users': 10,  # Everyone
            'discoverability': 9   # Shodan/directory scan
        }
    },
    {
        'name': 'Missing Rate Limiting on Login',
        'stride_category': 'Elevation of Privilege',
        'dread': {
            'damage': 5,           # Account access
            'reproducibility': 10, # Automated brute force
            'exploitability': 9,   # Script available
            'affected_users': 4,   # Weak password users
            'discoverability': 8   # Easy to detect
        }
    }
]

# Calculate and sort by risk
for threat in threats:
    d = threat['dread']
    threat['risk_score'] = sum(d.values()) / 5

sorted_threats = sorted(threats, key=lambda x: x['risk_score'], reverse=True)

print("Prioritized Threat List:")
print("-" * 60)
for i, threat in enumerate(sorted_threats, 1):
    print(f"{i}. {threat['name']}")
    print(f"   DREAD Score: {threat['risk_score']:.1f}")
    print(f"   Category: {threat['stride_category']}")
    print()
```

Đầu ra:
```
Prioritized Threat List:
------------------------------------------------------------
1. Exposed Admin Panel
   DREAD Score: 8.8
   Category: Information Disclosure

2. SQL Injection in Product Search
   DREAD Score: 8.0
   Category: Tampering/Information Disclosure

3. Missing Rate Limiting on Login
   DREAD Score: 7.2
   Category: Elevation of Privilege

4. CSRF on Password Change
   DREAD Score: 5.4
   Category: Spoofing
```

## Hạn chế của DREAD

Mặc dù hữu ích nhưng DREAD có những hạn chế đã biết:

### Tính chủ quan

Các nhà phân tích khác nhau có thể đánh giá cùng một mối đe dọa một cách khác nhau. Giảm thiểu điều này bằng cách:

- Sử dụng hướng dẫn chấm điểm kèm ví dụ
- Có nhiều người chấm điểm độc lập
- Thảo luận và tính điểm trung bình trong các phiên lập mô hình mối đe dọa

### Tranh cãi về khả năng khám phá

Một số người cho rằng không nên đưa Khả năng khám phá vào vì:

- Bảo mật thông qua sự tối tăm là không đáng tin cậy
- Bạn nên cho rằng kẻ tấn công sẽ tìm thấy lỗ hổng
- Nó khuyến khích việc giấu lỗi hơn là sửa chúng

Microsoft không dùng DREAD một phần vì lý do này. Cân nhắc sử dụng phiên bản sửa đổi:

```python
def calculate_dread_no_discoverability(damage, reproducibility, 
                                        exploitability, affected_users):
    """DREAD without discoverability factor."""
    return (damage + reproducibility + exploitability + affected_users) / 4
```

### Khung bổ sung

Hãy cân nhắc sử dụng DREAD cùng với các framework khác:

- **CVSS**: Tiêu chuẩn ngành để chấm điểm lỗ hổng
- Xếp hạng rủi ro **OWASP**: Đánh giá tác động kinh doanh chi tiết hơn
- **FAIR**: Phân tích rủi ro định lượng với ước tính tài chính

## Tóm tắt

DREAD cung cấp một cách tiếp cận có cấu trúc để ưu tiên các mối đe dọa:

- **Damage**: Trường hợp xấu nhất tệ đến mức nào?
- **Khả năng tái tạo**: Nó có thể được khai thác một cách đáng tin cậy đến mức nào?
- **Khả năng khai thác**: Cần bao nhiêu kỹ năng?
- **Người dùng bị ảnh hưởng**: Có bao nhiêu người bị ảnh hưởng?
- **DKhả năng khám phá**: Tìm nó dễ dàng đến mức nào?

Sử dụng điểm DREAD để:

1. Ưu tiên những mối đe dọa nào cần khắc phục trước
2. Truyền đạt rủi ro cho các bên liên quan
3. Theo dõi việc giảm thiểu rủi ro theo thời gian
4. Phân bổ nguồn lực bảo mật hiệu quả

Trong phần tiếp theo, chúng ta sẽ tìm hiểu phương pháp cây tấn công—một cách tiếp cận trực quan để hiểu cách các mối đe dọa có thể được nhận ra thông qua nhiều đường dẫn.
