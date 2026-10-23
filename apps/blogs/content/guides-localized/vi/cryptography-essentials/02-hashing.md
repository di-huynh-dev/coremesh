---
title: "Thuật toán băm"
description: Hiểu hàm băm mật mã hàm, các thuộc tính của chúng và các trường hợp sử dụng phù hợp bao gồm xác minh tính toàn vẹn và lưu trữ mật khẩu.
order: 2
---

Hàm băm mật mã hàm nhận đầu vào có kích thước bất kỳ và tạo ra đầu ra có kích thước cố định (mã băm hoặc bản tóm tắt). Không giống như mã hóa, băm là hàm ****—bạn không thể khôi phục đầu vào ban đầu từ hàm băm. Điều này làm cho việc băm trở nên cần thiết để xác minh tính toàn vẹn, lưu trữ mật khẩu và chữ ký số.

## Thuộc tính của hàm băm mật mã hàm

Hàm băm an toàn hàm phải có các thuộc tính sau:

| Tài sản | Mô tả | Tại sao nó quan trọng |
|----------|-------------|----------------|
| **DQuyết định** | Đầu vào giống nhau luôn tạo ra đầu ra giống nhau | Bật xác minh |
| **Tính toán nhanh** | Băm nhanh bất kỳ kích thước đầu vào nào | Thực tế cho các tập tin lớn |
| **Pre-image kháng** | Không thể tìm thấy đầu vào từ hàm băm | Bảo vệ dữ liệu gốc |
| **Sức đề kháng thứ hai trước image** | Không thể tìm thấy đầu vào khác nhau có cùng hàm băm | Ngăn chặn sự giả mạo |
| **Chống va chạm** | Khó tìm thấy bất kỳ hai đầu vào nào có cùng hàm băm | Đảm bảo tính độc đáo |
| **Ahiệu ứng tuyết lở** | Thay đổi đầu vào nhỏ = hàm băm hoàn toàn khác | Ẩn mẫu |

### Hiệu ứng tuyết lở

```python
import hashlib

# Tiny change in input = completely different hash
hash1 = hashlib.sha256(b"Hello World").hexdigest()
hash2 = hashlib.sha256(b"Hello World!").hexdigest()  # Added '!'

print(f"'Hello World'  -> {hash1}")
print(f"'Hello World!' -> {hash2}")

# Output:
# 'Hello World'  -> a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e
# 'Hello World!' -> 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
# (Completely different despite one character change)
```

## Thuật toán băm phổ biến

| Thuật toán | Kích thước đầu ra | Trạng thái | Trường hợp sử dụng |
|-----------|-------------|--------|----------|
| **SHA-256** | 256 bit | ✅ Được đề xuất | Mục đích chung, tổng kiểm tra, blockchain |
| **SHA-384** | 384 bit | ✅ An toàn | Yêu cầu bảo mật cao hơn |
| **SHA-512** | 512 bit | ✅ An toàn | Dữ liệu lớn, tối ưu hóa 64-bit |
| **SHA-3** | Biến | ✅ Được đề xuất | Tiêu chuẩn NIST, thiết kế khác với SHA-2 |
| **BLAKE2** | Biến | ✅ Được đề xuất | Nhanh hơn SHA-2, rất an toàn |
| **BLAKE3** | Biến | ✅ Được đề xuất | Nhanh nhất, song song |
| **SHA-1** | 160 bit | ❌ Hỏng | Không bao giờ sử dụng để bảo mật |
| **MD5** | 128 bit | ❌ Hỏng | Không bao giờ sử dụng để bảo mật |

### Tại sao MD5 và SHA-1 bị hỏng

Cả MD5 và SHA-1 đều có các cuộc tấn công va chạm thực tế:

- **MD5**: Có thể tạo ra va chạm trong vài giây trên máy tính xách tay
- **SHA-1**: Cuộc tấn công SHAttered (2017) đã tạo hai tệp PDF khác nhau với cùng hàm băm SHA-1

```python
# ❌ NEVER use for security
md5_hash = hashlib.md5(data).hexdigest()    # Broken
sha1_hash = hashlib.sha1(data).hexdigest()  # Broken

# ✅ Use SHA-256 or better
sha256_hash = hashlib.sha256(data).hexdigest()  # Secure
```

**Note**: MD5 vẫn được chấp nhận cho các mục đích không liên quan đến bảo mật như tổng kiểm tra để phát hiện lỗi dữ liệu (không phải giả mạo độc hại).

## Trường hợp sử dụng 1: Xác minh tính toàn vẹn của tệp

Băm xác minh rằng các tập tin chưa được sửa đổi:

```python
import hashlib

def calculate_file_hash(filepath: str, algorithm: str = 'sha256') -> str:
    """Calculate hash of a file efficiently."""
    hash_func = hashlib.new(algorithm)
    
    with open(filepath, 'rb') as f:
        # Read in chunks for large files
        for chunk in iter(lambda: f.read(8192), b''):
            hash_func.update(chunk)
    
    return hash_func.hexdigest()

def verify_file_integrity(filepath: str, expected_hash: str, 
                          algorithm: str = 'sha256') -> bool:
    """Verify file matches expected hash."""
    actual_hash = calculate_file_hash(filepath, algorithm)
    return actual_hash == expected_hash

# Example: Verifying a downloaded binary
expected = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
if verify_file_integrity("download.tar.gz", expected):
    print("File integrity verified")
else:
    print("WARNING: File may be corrupted or tampered!")
```

### Xác minh dòng lệnh

```bash
# Generate hash
sha256sum myfile.tar.gz > myfile.sha256

# Verify hash
sha256sum -c myfile.sha256
# myfile.tar.gz: OK

# Verify downloaded software
echo "expected_hash_here  terraform.zip" | sha256sum -c -
```

## Trường hợp sử dụng 2: Lưu trữ mật khẩu

**Không bao giờ lưu trữ mật khẩu ở dạng văn bản gốc.** Nhưng việc băm thông thường cũng không đủ—bạn cần các chức năng băm mật khẩu **** được thiết kế đặc biệt để chạy chậm và ngốn bộ nhớ.

### Tại sao việc băm thông thường lại có hại cho mật khẩu

```python
# ❌ BAD: Fast hash allows rapid brute force
import hashlib
password_hash = hashlib.sha256(password.encode()).hexdigest()
# Attacker can try billions of guesses per second!

# ❌ ALSO BAD: Unsalted hash vulnerable to rainbow tables
# Same password = same hash for all users
```

### Băm mật khẩu hàm

| Thuật toán | Trạng thái | Ghi chú |
|-----------|--------|-------|
| **Argon2id** | ✅ Tốt nhất | Người chiến thắng PHC, khó nhớ, được đề xuất |
| **bcrypt** | ✅ Tốt | Đã được thử nghiệm trong trận chiến, giới hạn 72 byte |
| **scrypt** | ✅ Tốt | Bộ nhớ cứng, được sử dụng trong tiền điện tử |
| **PBKDF2** | ✅ Chấp nhận được | Được hỗ trợ rộng rãi, cần độ lặp lại cao |

### Argon2id (Được khuyến nghị)

```python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# Initialize with secure defaults
ph = PasswordHasher(
    time_cost=3,        # Number of iterations
    memory_cost=65536,  # 64 MB memory
    parallelism=4,      # 4 threads
)

def hash_password(password: str) -> str:
    """Hash a password with Argon2id."""
    return ph.hash(password)

def verify_password(password: str, hash: str) -> bool:
    """Verify a password against its hash."""
    try:
        ph.verify(hash, password)
        return True
    except VerifyMismatchError:
        return False

# Example usage
password = "user_secret_password"
hashed = hash_password(password)
print(f"Hash: {hashed}")
# $argon2id$v=19$m=65536,t=3,p=4$...(salt)...$...(hash)...

# Verification
assert verify_password("user_secret_password", hashed) == True
assert verify_password("wrong_password", hashed) == False
```

### Bcrypt (Được hỗ trợ rộng rãi)

```python
import bcrypt

def hash_password_bcrypt(password: str) -> bytes:
    """Hash a password with bcrypt."""
    salt = bcrypt.gensalt(rounds=12)  # 2^12 iterations
    return bcrypt.hashpw(password.encode(), salt)

def verify_password_bcrypt(password: str, hashed: bytes) -> bool:
    """Verify a bcrypt password hash."""
    return bcrypt.checkpw(password.encode(), hashed)

# Example
hashed = hash_password_bcrypt("my_password")
print(f"Hash: {hashed}")
# b'$2b$12$...(salt+hash)...'

assert verify_password_bcrypt("my_password", hashed) == True
```

### Khuyến nghị lưu trữ mật khẩu OWASP

```yaml
# OWASP 2024 recommendations
recommended_algorithms:
  first_choice: argon2id
  argon2id_config:
    memory: 19456  # 19 MiB minimum (46 MiB recommended)
    iterations: 2
    parallelism: 1
  
  second_choice: scrypt
  scrypt_config:
    n: 2^17  # CPU/memory cost
    r: 8     # Block size
    p: 1     # Parallelism
  
  third_choice: bcrypt
  bcrypt_config:
    cost: 10  # Minimum (12+ recommended)
  
  legacy_acceptable: pbkdf2
  pbkdf2_config:
    iterations: 600000  # SHA-256
    # or 210000 for SHA-512
```

## Trường hợp sử dụng 3: Mã xác thực thư (HMAC)

HMAC kết hợp hàm băm với khóa bí mật để cung cấp tính xác thực và tính toàn vẹn:

```python
import hmac
import hashlib

def create_hmac(message: bytes, key: bytes) -> str:
    """Create HMAC-SHA256 for a message."""
    return hmac.new(key, message, hashlib.sha256).hexdigest()

def verify_hmac(message: bytes, key: bytes, expected_mac: str) -> bool:
    """Verify HMAC using constant-time comparison."""
    actual_mac = create_hmac(message, key)
    return hmac.compare_digest(actual_mac, expected_mac)

# Example: Webhook signature verification
secret_key = b"webhook_secret_from_provider"
payload = b'{"event": "payment.completed", "amount": 100}'

# Provider sends this signature in header
signature = create_hmac(payload, secret_key)

# You verify it
if verify_hmac(payload, secret_key, signature):
    print("Webhook is authentic")
else:
    print("WARNING: Invalid webhook signature!")
```

### Phòng chống tấn công theo thời gian

**Luôn sử dụng so sánh thời gian không đổi** để so sánh nhạy cảm về bảo mật:

```python
# ❌ BAD: Vulnerable to timing attack
if actual_hash == expected_hash:  # String comparison leaks timing info
    return True

# ✅ GOOD: Constant-time comparison
import hmac
if hmac.compare_digest(actual_hash, expected_hash):
    return True
```

## Trường hợp sử dụng 4: Bộ nhớ có thể định địa chỉ nội dung

Git, Docker và nhiều hệ thống phân tán sử dụng hàm băm làm mã định danh nội dung:

```python
import hashlib
import json

def content_address(data: bytes) -> str:
    """Generate content-addressable identifier."""
    return f"sha256:{hashlib.sha256(data).hexdigest()}"

# Docker image digests
layer_data = b"... layer tarball ..."
digest = content_address(layer_data)
print(f"Layer digest: {digest}")
# sha256:abc123def456...

# If content changes, digest changes
# If digest is same, content is guaranteed identical
```

### Băm đối tượng Git

```bash
# Git uses SHA-1 (transitioning to SHA-256)
echo "Hello" | git hash-object --stdin
# e965047ad7c57865823c7d992b1d046ea66edf78

# Verify a commit
git cat-file -p HEAD | sha1sum
```

## Băm trong bối cảnh DevOps

### Thông báo container image

```yaml
# Dockerfile: Pin base image by digest (immutable)
FROM nginx@sha256:abc123def456...  # ✅ Reproducible
# FROM nginx:1.25                   # ❌ Tag can change

# Kubernetes: Reference by digest
spec:
  containers:
    - name: app
      image: myregistry/app@sha256:abc123def456...
```

### Tổng kiểm tra artifact

```bash
# Download and verify Terraform
curl -O https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
curl -O https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_SHA256SUMS

# Verify checksum
sha256sum -c terraform_1.6.0_SHA256SUMS --ignore-missing
# terraform_1.6.0_linux_amd64.zip: OK
```

### Vô hiệu hóa bộ đệm

```python
import hashlib
import json

def cache_key(config: dict) -> str:
    """Generate cache key from configuration."""
    # Deterministic JSON serialization
    config_str = json.dumps(config, sort_keys=True)
    return hashlib.sha256(config_str.encode()).hexdigest()[:16]

# Same config = same cache key
config = {"version": "1.0", "features": ["a", "b"]}
key = cache_key(config)
print(f"Cache key: {key}")  # Consistent across runs
```

## Các lỗi băm phổ biến

### 1. Sử dụng MD5/SHA-1 để bảo mật

```python
# ❌ BAD: Broken algorithms
file_hash = hashlib.md5(data).hexdigest()
signature = hashlib.sha1(message).hexdigest()

# ✅ GOOD: SHA-256 or better
file_hash = hashlib.sha256(data).hexdigest()
```

### 2. Băm mật khẩu bằng thuật toán nhanh

```python
# ❌ BAD: Fast hash for passwords
password_hash = hashlib.sha256(password.encode()).hexdigest()

# ✅ GOOD: Purpose-built password hasher
from argon2 import PasswordHasher
password_hash = PasswordHasher().hash(password)
```

### 3. Không sử dụng muối cho mật khẩu

```python
# ❌ BAD: Unsalted (vulnerable to rainbow tables)
hash = sha256(password)

# ✅ GOOD: Salted (Argon2/bcrypt do this automatically)
# Each password gets unique salt, stored with hash
```

### 4. So sánh thời gian không cố định

```python
# ❌ BAD: Timing attack vulnerability
if user_token == stored_token:
    authenticate()

# ✅ GOOD: Constant-time comparison
if hmac.compare_digest(user_token, stored_token):
    authenticate()
```

## Tóm tắt

Những điểm chính của việc băm:

- **Hash hàm là một chiều**—bạn không thể đảo ngược hàm băm để lấy đầu vào ban đầu
- **Sử dụng SHA-256 hoặc tốt hơn** để xác minh tính toàn vẹn—tránh MD5 và SHA-1 để bảo mật
- **Sử dụng các chức năng dành riêng cho mật khẩu** (Argon2id, bcrypt)—không bao giờ băm mật khẩu bằng SHA-256
- **HMAC để xác thực**—kết hợp hàm băm với khóa bí mật
- **So sánh liên tục theo thời gian**—ngăn chặn các cuộc tấn công theo thời gian với `hmac.compare_digest()`
- **Địa chỉ nội dung**—sử dụng hàm băm làm mã định danh bất biến (Docker, Git)

Trong phần tiếp theo, chúng ta sẽ khám phá TLS/SSL—cách kết hợp mã hóa và băm để bảo mật dữ liệu khi truyền.
