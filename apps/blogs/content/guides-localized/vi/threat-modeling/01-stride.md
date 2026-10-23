---
title: "Phân loại mối đe dọa STRIDE"
description: 'Tìm hiểu phương pháp STRIDE để phân loại một cách có hệ thống các mối đe dọa bảo mật: Giả mạo, Giả mạo, Từ chối, Tiết lộ thông tin, Từ chối dịch vụ và Nâng cao đặc quyền.'
order: 1
---

STRIDE là khung phân loại mối đe dọa được phát triển tại Microsoft vào cuối những năm 1990. Nó cung cấp một cách có hệ thống để suy nghĩ về các loại mối đe dọa bảo mật khác nhau, đảm bảo bạn không bỏ qua các vectơ tấn công phổ biến trong quá trình phân tích bảo mật.

Từ viết tắt của sáu loại mối đe dọa: **S**poofing, **T**ampering, **R**epudiation, **I**nformation Disclosure, **D**enial dịch vụ và **E**leo đặc quyền. Mỗi danh mục ánh xạ tới một thuộc tính bảo mật mà bạn muốn bảo vệ.

## Sáu loại mối đe dọa

| Đe dọa | Tài sản bảo mật | Mô tả |
|--------|------------------|-------------|
| **S**poofing | Xác thực | Giả vờ là ai đó hoặc cái gì khác |
| **T**ampering | Tính chính trực | Sửa đổi dữ liệu hoặc mã mà không được phép |
| **R**epudiation | Chống chối bỏ | Từ chối một hành động đã xảy ra |
| Tiết lộ thông tin **I**n | Bảo mật | Tiết lộ thông tin cho các bên trái phép |
| **D**enial dịch vụ | sẵn có | Làm cho hệ thống không khả dụng |
| **E**Nâng đặc quyền | Ủy quyền | Đạt được khả năng vượt quá những gì được phép |

## Giả mạo

Các mối đe dọa giả mạo liên quan đến kẻ tấn công giả vờ là ai đó hoặc thứ gì đó không phải là họ. Điều này vi phạm thuộc tính **authentication** trong hệ thống của bạn.

### Các cuộc tấn công giả mạo phổ biến

- **Giả mạo danh tính**: Sử dụng thông tin xác thực bị đánh cắp để mạo danh người dùng hợp pháp
- **IP giả mạo**: Giả mạo địa chỉ IP nguồn trong các gói mạng
- **Email giả mạo**: Gửi email có địa chỉ người gửi giả mạo
- **DNS giả mạo**: Chuyển hướng tra cứu tên miền đến máy chủ độc hại
- **ARP giả mạo**: Đầu độc các bảng ARP để chặn lưu lượng mạng

### Ví dụ thực tế: Chiếm quyền điều khiển phiên

Hãy xem xét một ứng dụng web lưu trữ mã thông báo phiên trong cookie:

```python
# Vulnerable: Session token without proper validation
@app.route('/dashboard')
def dashboard():
    session_token = request.cookies.get('session_id')
    # No validation of token origin or integrity
    user = get_user_from_session(session_token)
    return render_template('dashboard.html', user=user)
```

Kẻ tấn công chiếm được mã thông báo phiên (thông qua XSS, đánh hơi mạng hoặc phần mềm độc hại) có thể mạo danh nạn nhân bằng cách gửi yêu cầu có mã thông báo bị đánh cắp.

### Giảm thiểu việc giả mạo

```python
# Better: Bind sessions to additional factors
@app.route('/dashboard')
def dashboard():
    session_token = request.cookies.get('session_id')
    session_data = validate_session(session_token)
    
    # Verify session is bound to this client
    if session_data['ip'] != request.remote_addr:
        log_security_event('Session IP mismatch', session_data)
        abort(403)
    
    if session_data['user_agent'] != request.headers.get('User-Agent'):
        log_security_event('Session UA mismatch', session_data)
        abort(403)
    
    return render_template('dashboard.html', user=session_data['user'])
```

**Các biện pháp giảm nhẹ chính:**
- Xác thực đa yếu tố (MFA)
- Xác thực dựa trên chứng chỉ
- Liên kết phiên với IP/tác nhân người dùng
- Thời gian tồn tại của phiên ngắn với mã thông báo làm mới

## Giả mạo

Các mối đe dọa giả mạo liên quan đến việc sửa đổi trái phép dữ liệu hoặc mã. Điều này vi phạm thuộc tính **integrity**.

### Các cuộc tấn công giả mạo phổ biến

- **Man-in-the-middle (MITM)**: Chặn và sửa đổi dữ liệu đang truyền
- ** Giả mạo tham số**: Sửa đổi các trường biểu mẫu ẩn hoặc tham số URL
- **SQL SQL**: Thay đổi truy vấn cơ sở dữ liệu
- ** Giả mạo tệp**: Sửa đổi tệp cấu hình hoặc tệp nhị phân
- ** Giả mạo bộ nhớ**: Thay đổi chương trình trạng thái khi chạy

### Ví dụ trong thế giới thực: Thao túng giá

Các ứng dụng thương mại điện tử thường truyền dữ liệu về giá qua các trường biểu mẫu ẩn:

```html
<!-- Vulnerable: Price in hidden field -->
<form action="/checkout" method="POST">
    <input type="hidden" name="price" value="99.99">
    <input type="hidden" name="product_id" value="12345">
    <button type="submit">Buy Now</button>
</form>
```

Kẻ tấn công có thể sửa đổi trường ẩn bằng các công cụ dành cho nhà phát triển trình duyệt:

```javascript
// Attacker modifies price before submission
document.querySelector('input[name="price"]').value = '0.01';
```

### Giảm nhẹ cho việc giả mạo

```python
# Better: Server-side price lookup
@app.route('/checkout', methods=['POST'])
def checkout():
    product_id = request.form.get('product_id')
    
    # Never trust client-provided prices
    product = Product.query.get(product_id)
    if not product:
        abort(404)
    
    # Use server-side price
    price = product.current_price
    
    # Optional: Verify with digital signature
    expected_signature = hmac.new(
        SECRET_KEY, 
        f"{product_id}:{price}".encode(),
        hashlib.sha256
    ).hexdigest()
    
    return process_order(product_id, price)
```

**Các biện pháp giảm nhẹ chính:**
- Xác thực đầu vào trên tất cả dữ liệu người dùng
- Chữ ký số/HMAC cho dữ liệu nhạy cảm
- TLS cho dữ liệu đang truyền
- Giám sát tính toàn vẹn của tệp (AIDE, Tripwire)
- Ký mã và xác minh

## Từ chối

Các mối đe dọa từ chối liên quan đến việc người dùng phủ nhận họ đã thực hiện một hành động khi không có cách nào để chứng minh điều ngược lại. Điều này vi phạm thuộc tính **không thoái thác**.

### Các kịch bản từ chối phổ biến

- Người dùng tuyên bố họ không mua hàng
- Quản trị viên từ chối xóa các tập tin quan trọng
- Kẻ tấn công che dấu vết bằng cách xóa nhật ký
- Nhà phát triển khẳng định họ không đẩy mã độc

### Ví dụ thực tế: Thiếu dấu vết kiểm tra

```python
# Vulnerable: No audit logging
@app.route('/admin/delete-user/<user_id>', methods=['POST'])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    db.session.delete(user)
    db.session.commit()
    return redirect('/admin/users')
```

Nếu không ghi nhật ký, sẽ không có cách nào để xác định ai đã xóa người dùng hoặc khi điều đó xảy ra.

### Giảm nhẹ cho việc bác bỏ

```python
# Better: Comprehensive audit logging
@app.route('/admin/delete-user/<user_id>', methods=['POST'])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    
    # Log before the action
    audit_log.info(
        'User deletion initiated',
        extra={
            'action': 'DELETE_USER',
            'target_user_id': user_id,
            'target_username': user.username,
            'admin_id': current_user.id,
            'admin_ip': request.remote_addr,
            'timestamp': datetime.utcnow().isoformat(),
            'request_id': request.headers.get('X-Request-ID')
        }
    )
    
    # Soft delete preserves evidence
    user.deleted_at = datetime.utcnow()
    user.deleted_by = current_user.id
    db.session.commit()
    
    return redirect('/admin/users')
```

**Các biện pháp giảm nhẹ chính:**
- Ghi nhật ký kiểm tra toàn diện
- Lưu trữ nhật ký giả mạo (chỉ bổ sung, đã ký)
- Chữ ký số cho các giao dịch quan trọng
- Tổng hợp nhật ký tập trung
- Xem xét và cảnh báo nhật ký thường xuyên

## Công bố thông tin

Các mối đe dọa tiết lộ thông tin liên quan đến việc tiết lộ dữ liệu nhạy cảm cho các bên trái phép. Điều này vi phạm thuộc tính **confidentiality**.

### Các vectơ tiết lộ thông tin chung

- **Thông báo lỗi**: Dấu vết ngăn xếp tiết lộ đường dẫn nội bộ
- Phản hồi **API**: Tìm nạp quá mức các trường nhạy cảm
- **Logs**: Vô tình ghi lại mật khẩu hoặc mã thông báo
- **Metadata**: Dữ liệu EXIF trong image, lịch sử Git
- **Tấn công theo thời gian**: Suy ra dữ liệu từ thời gian phản hồi

### Ví dụ trong thế giới thực: Lỗi dài dòng

```python
# Vulnerable: Detailed error messages in production
@app.route('/login', methods=['POST'])
def login():
    try:
        user = User.query.filter_by(email=request.form['email']).first()
        if not user:
            raise Exception(f"User {request.form['email']} not found in database")
        if not check_password(request.form['password'], user.password_hash):
            raise Exception(f"Invalid password for user {user.id}")
        return login_user(user)
    except Exception as e:
        # Leaks whether email exists and internal user IDs
        return str(e), 401
```

### Giảm nhẹ việc tiết lộ thông tin

```python
# Better: Generic error messages
@app.route('/login', methods=['POST'])
def login():
    user = User.query.filter_by(email=request.form['email']).first()
    
    # Use constant-time comparison to prevent timing attacks
    if not user or not user.check_password(request.form['password']):
        # Log details server-side, return generic message to client
        app.logger.warning(
            'Failed login attempt',
            extra={'email': request.form['email'], 'ip': request.remote_addr}
        )
        # Same message whether user exists or password is wrong
        return {'error': 'Invalid credentials'}, 401
    
    return login_user(user)
```

**Các biện pháp giảm nhẹ chính:**
- Thông báo lỗi chung trong production
- Nguyên lý truy cập dữ liệu của đặc quyền tối thiểu
- Mã hóa dữ liệu nhạy cảm khi lưu trữ và truyền tải
- Che dấu dữ liệu trong nhật ký
- Quét bí mật thường xuyên trong mã/cấu hình

## Từ chối dịch vụ

Các mối đe dọa từ chối dịch vụ (DoS) khiến hệ thống không khả dụng đối với người dùng hợp pháp. Điều này vi phạm thuộc tính **availability**.

### Các vectơ tấn công DoS phổ biến

- **Dựa trên khối lượng**: Ngập do lưu lượng truy cập (lũ UDP, khuếch đại)
- **Dựa trên giao thức**: Khai thác điểm yếu của giao thức (lũ SYN)
- **Lớp ứng dụng**: Các hoạt động tốn kém (regex DoS, bom zip)
- **Cạn kiệt tài nguyên**: Bộ mô tả bộ nhớ, đĩa, tệp
- **Độ phức tạp của thuật toán**: Hoạt động O(n²) với đầu vào lớn

### Ví dụ trong thế giới thực: ReDoS (DoS biểu thức chính quy)

```python
# Vulnerable: Catastrophic backtracking regex
import re

# This regex has exponential time complexity with certain inputs
email_pattern = re.compile(r'^([a-zA-Z0-9]+)+@example.com$')

@app.route('/validate-email')
def validate_email():
    email = request.args.get('email')
    # Malicious input: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa!'
    # This can hang the server for minutes
    if email_pattern.match(email):
        return 'Valid'
    return 'Invalid'
```

### Giảm nhẹ cho việc từ chối dịch vụ

```python
# Better: Safe regex with timeout
import re
import signal
from functools import wraps

# Use non-backtracking pattern
email_pattern = re.compile(r'^[a-zA-Z0-9]+@example\.com$')

def timeout(seconds):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            signal.alarm(seconds)
            try:
                return func(*args, **kwargs)
            finally:
                signal.alarm(0)
        return wrapper
    return decorator

@app.route('/validate-email')
@timeout(1)  # Kill if takes more than 1 second
def validate_email():
    email = request.args.get('email', '')[:255]  # Limit input length
    if email_pattern.match(email):
        return 'Valid'
    return 'Invalid'
```

**Các biện pháp giảm nhẹ chính:**
- Giới hạn tốc độ và điều tiết
- Giới hạn kích thước đầu vào
- Hết thời gian cho các hoạt động tốn kém
- Cơ sở hạ tầng tự động mở rộng quy mô
- Dịch vụ bảo vệ CDN và DDoS
- Bộ ngắt mạch cho các dịch vụ hạ nguồn

## Nâng cao đặc quyền

Các mối đe dọa nâng cao đặc quyền (EoP) liên quan đến việc đạt được các khả năng vượt quá những gì được cho phép. Điều này vi phạm thuộc tính **authorization**.

### Các cuộc tấn công EoP phổ biến

- ** Leo thang đặc quyền**: Người dùng bình thường có được quyền quản trị viên
- **IDOR**: Truy cập tài nguyên của người dùng khác bằng cách thay đổi ID
- **Path traversal**: Thoát khỏi các thư mục dự định
- **Container escape**: Thoát khỏi sự cô lập container
- Thao tác **JWT**: Giả mạo mã thông báo có xác nhận quyền sở hữu cao

### Ví dụ trong thế giới thực: Tham chiếu đối tượng trực tiếp không an toàn (IDOR)

```python
# Vulnerable: No ownership verification
@app.route('/api/documents/<doc_id>')
@login_required
def get_document(doc_id):
    # User can access ANY document by changing the ID
    document = Document.query.get(doc_id)
    if not document:
        abort(404)
    return document.to_dict()
```

Kẻ tấn công có thể liệt kê ID tài liệu để truy cập vào tệp của người dùng khác:

```bash
# Attacker iterates through document IDs
for i in {1..10000}; do
    curl "https://api.example.com/documents/$i" -H "Cookie: session=attacker_session"
done
```

### Giảm nhẹ để nâng cao đặc quyền

```python
# Better: Verify ownership
@app.route('/api/documents/<doc_id>')
@login_required
def get_document(doc_id):
    document = Document.query.get(doc_id)
    
    if not document:
        abort(404)
    
    # Verify the current user owns this document
    if document.owner_id != current_user.id:
        # Log potential attack
        app.logger.warning(
            'IDOR attempt detected',
            extra={
                'user_id': current_user.id,
                'requested_doc_id': doc_id,
                'doc_owner_id': document.owner_id
            }
        )
        abort(403)
    
    return document.to_dict()

# Even better: Use UUIDs instead of sequential IDs
# and scope queries to the current user
@app.route('/api/documents/<uuid:doc_id>')
@login_required
def get_document_v2(doc_id):
    document = Document.query.filter_by(
        id=doc_id,
        owner_id=current_user.id
    ).first_or_404()
    return document.to_dict()
```

**Các biện pháp giảm nhẹ chính:**
- Luôn xác minh ủy quyền, không chỉ xác thực
- Phạm vi truy vấn cơ sở dữ liệu tới người dùng hiện tại
- Sử dụng UUID thay vì ID tuần tự
- Triển khai kiểm soát truy cập dựa trên vai trò (RBAC)
- Kiểm tra đặc quyền thường xuyên
- Tăng cường container và VM

## Áp dụng STRIDE trong thực tế

Khi phân tích một hệ thống, hãy xem xét từng thành phần và hỏi:

1. **Spoofing**: Kẻ tấn công có thể giả vờ là thành phần hoặc người dùng này không?
2. **Tampering**: Dữ liệu truyền qua đây có thể được sửa đổi không?
3. **Repudiation**: Các hành động ở đây có thể bị từ chối mà không có bằng chứng không?
4. **Tiết lộ thông tin**: Dữ liệu nhạy cảm có thể bị rò rỉ từ đây không?
5. **DTừ chối dịch vụ**: Thành phần này có thể bị quá tải không?
6. **ENâng đặc quyền**: Có thể bỏ qua các biện pháp kiểm soát truy cập ở đây không?

### Sải bước trên mỗi phần tử

Các thành phần hệ thống khác nhau dễ bị tấn công bởi các danh mục STRIDE khác nhau:

| Yếu tố | S | T | R | tôi | D | E |
|---------|---|---|---|---|---|---|
| Thực thể bên ngoài | ✓ | | ✓ | | | |
| Quy trình | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Kho dữ liệu | | ✓ | ? | ✓ | ✓ | |
| Luồng dữ liệu | | ✓ | | ✓ | ✓ | |

Ma trận này giúp bạn tập trung phân tích—các quy trình dễ bị tổn thương đối với tất cả sáu loại, trong khi các luồng dữ liệu chủ yếu liên quan đến giả mạo, tiết lộ và tính khả dụng.

## Tóm tắt

STRIDE cung cấp một khuôn khổ toàn diện để xác định các mối đe dọa:

- **Spoofing** → Tăng cường xác thực
- **Tampering** → Bảo vệ tính toàn vẹn
- **Repudiation** → Thực hiện ghi nhật ký kiểm tra
- **Công bố thông tin** → Đảm bảo bí mật
- **DTừ chối dịch vụ** → Duy trì tính khả dụng
- **ENâng đặc quyền** → Thực thi ủy quyền

Trong phần tiếp theo, chúng ta sẽ tìm hiểu cách ưu tiên các mối đe dọa này bằng hệ thống tính điểm DREAD.
