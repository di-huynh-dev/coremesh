---
title: "Nguyên tắc cơ bản về mã hóa"
description: Tìm hiểu mã hóa đối xứng và bất đối xứng, hiểu các thuật toán phổ biến như AES và RSA, đồng thời nắm vững các phương pháp hay nhất về quản lý khóa.
order: 1
---

Mã hóa chuyển đổi dữ liệu có thể đọc được (văn bản gốc) thành dữ liệu không thể đọc được (văn bản mã hóa) và chỉ có thể đảo ngược được bằng khóa chính xác. Đây là công cụ chính để bảo vệ tính bảo mật của dữ liệu—đảm bảo rằng ngay cả khi dữ liệu bị chặn hoặc bị đánh cắp, dữ liệu đó vẫn vô dụng đối với những kẻ tấn công.

Có hai loại mã hóa cơ bản: **Đối xứng** (một khóa cho cả mã hóa và giải mã) và **aĐối xứng** (các khóa riêng biệt để mã hóa và giải mã). Mỗi loại đều có trường hợp sử dụng riêng biệt và hiểu được thời điểm sử dụng, điều này rất quan trọng đối với thiết kế hệ thống an toàn.

## Mã hóa đối xứng

Mã hóa đối xứng sử dụng cùng một khóa cho cả mã hóa và giải mã. Nó nhanh chóng và hiệu quả, lý tưởng cho việc mã hóa lượng lớn dữ liệu.

### Nó hoạt động như thế nào

```
Plaintext + Key → [Encryption Algorithm] → Ciphertext
Ciphertext + Key → [Decryption Algorithm] → Plaintext
```

Tính bảo mật phụ thuộc hoàn toàn vào việc giữ bí mật khóa. Nếu kẻ tấn công lấy được khóa, chúng có thể giải mã tất cả dữ liệu được mã hóa bằng khóa đó.

### Các thuật toán đối xứng phổ biến

| Thuật toán | Kích thước phím | Trạng thái | Trường hợp sử dụng |
|-----------|----------|--------|----------|
| **AES-256** | 256 bit | ✅ Được đề xuất | Mục đích chung, tiêu chuẩn chính phủ |
| **AES-128** | 128 bit | ✅ An toàn | Nhanh hơn AES-256, vẫn rất an toàn |
| **ChaCha20** | 256 bit | ✅ Được đề xuất | Triển khai phần mềm/di động/nhúng |
| **3DES** | 168 bit | ⚠️ Không dùng nữa | Chỉ các hệ thống cũ |
| **DES** | 56 bit | ❌ Hỏng | Không bao giờ sử dụng |
| **RC4** | Biến | ❌ Hỏng | Không bao giờ sử dụng |

### AES (Tiêu chuẩn mã hóa nâng cao)

AES là tiêu chuẩn vàng cho mã hóa đối xứng. Được NIST áp dụng vào năm 2001, nó được sử dụng ở mọi nơi—từ HTTPS đến mã hóa ổ đĩa cho đến lưu trữ đám mây.

```python
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os

# High-level API (recommended for most use cases)
def encrypt_with_fernet(plaintext: bytes) -> tuple[bytes, bytes]:
    """Encrypt data using Fernet (AES-128-CBC + HMAC)."""
    key = Fernet.generate_key()
    f = Fernet(key)
    ciphertext = f.encrypt(plaintext)
    return ciphertext, key

def decrypt_with_fernet(ciphertext: bytes, key: bytes) -> bytes:
    """Decrypt Fernet-encrypted data."""
    f = Fernet(key)
    return f.decrypt(ciphertext)

# Example usage
message = b"Sensitive configuration data"
encrypted, key = encrypt_with_fernet(message)
decrypted = decrypt_with_fernet(encrypted, key)
assert decrypted == message
```

### Chặn chế độ mật mã

AES là mật mã khối—nó mã hóa các khối có kích thước cố định (128 bit). Để mã hóa dữ liệu lớn hơn một khối, bạn cần có chế độ hoạt động ****:

| Chế độ | Mô tả | Trường hợp sử dụng |
|------|-------------|----------|
| **GCM** | Chế độ Galois/Bộ đếm | ✅ Khuyến nghị - mã hóa được xác thực |
| **CBC** | Chuỗi khối mật mã | Phổ biến nhưng yêu cầu MAC riêng |
| **CTR** | Chế độ đếm | Có thể song song hóa, cần MAC |
| **ECB** | Sách mã điện tử | ❌ Không bao giờ sử dụng - tiết lộ các mẫu |

**Luôn sử dụng mã hóa xác thực** (như GCM) để cung cấp cả tính bảo mật và tính toàn vẹn:

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def encrypt_aes_gcm(plaintext: bytes, associated_data: bytes = b"") -> tuple[bytes, bytes, bytes]:
    """
    Encrypt using AES-256-GCM (authenticated encryption).
    Returns: (ciphertext, key, nonce)
    """
    key = AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(key)
    
    # Nonce must be unique for each encryption with the same key
    # 96 bits (12 bytes) is recommended for GCM
    nonce = os.urandom(12)
    
    # Associated data is authenticated but not encrypted
    ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data)
    
    return ciphertext, key, nonce

def decrypt_aes_gcm(ciphertext: bytes, key: bytes, nonce: bytes, 
                    associated_data: bytes = b"") -> bytes:
    """Decrypt AES-256-GCM ciphertext."""
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, associated_data)
```

### Vấn đề của ECB

Chế độ ECB mã hóa từng khối một cách độc lập, hiển thị các mẫu trong bản rõ:

```
Original Image:     ECB Encrypted:      CBC/GCM Encrypted:
███░░░███            ▓▓▓░░░▓▓▓           ▒█░▓▒█░▓▒
█████████            ▓▓▓▓▓▓▓▓▓           ░▓█▒░▓█▒░
███░░░███            ▓▓▓░░░▓▓▓           ▓░▒█▓░▒█▓
(Pattern visible)    (Pattern visible)   (Random - secure)
```

Đây là lý do tại sao ** không bao giờ nên sử dụng ECB** cho dữ liệu thực.

## Mã hóa bất đối xứng

Mã hóa bất đối xứng sử dụng cặp khóa ****: khóa chung (được chia sẻ công khai) và khóa riêng (được giữ bí mật). Dữ liệu được mã hóa bằng khóa chung chỉ có thể được giải mã bằng khóa riêng và ngược lại.

### Nó hoạt động như thế nào

```
Encryption:  Plaintext + Public Key  → Ciphertext
Decryption:  Ciphertext + Private Key → Plaintext

Signing:     Message + Private Key → Signature
Verification: Message + Signature + Public Key → Valid/Invalid
```

Điều này giải quyết vấn đề phân phối khóa ****—bạn có thể chia sẻ khóa chung của mình với bất kỳ ai mà không ảnh hưởng đến bảo mật.

### Các thuật toán bất đối xứng phổ biến

| Thuật toán | Kích thước phím | Trạng thái | Trường hợp sử dụng |
|-----------|----------|--------|----------|
| **RSA** | Hơn 2048 bit | ✅ An toàn | Mã hóa, chữ ký, trao đổi khóa |
| **ECDSA** | Hơn 256 bit | ✅ Được đề xuất | Chữ ký số (nhỏ hơn, nhanh hơn) |
| **Ed25519** | 256 bit | ✅ Được đề xuất | Chữ ký (hiện đại, nhanh chóng) |
| **ECDH** | Hơn 256 bit | ✅ Được đề xuất | Trao đổi khóa |
| **DSA** | Hơn 2048 bit | ⚠️ Không dùng nữa | Chỉ chữ ký kế thừa |

### Ví dụ về RSA

```python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization

def generate_rsa_keypair():
    """Generate a 2048-bit RSA key pair."""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()
    return private_key, public_key

def rsa_encrypt(plaintext: bytes, public_key) -> bytes:
    """Encrypt data with RSA public key."""
    return public_key.encrypt(
        plaintext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

def rsa_decrypt(ciphertext: bytes, private_key) -> bytes:
    """Decrypt data with RSA private key."""
    return private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

# Example usage
private_key, public_key = generate_rsa_keypair()

message = b"Secret message for recipient"
encrypted = rsa_encrypt(message, public_key)
decrypted = rsa_decrypt(encrypted, private_key)

assert decrypted == message
```

### Chữ ký số với Ed25519

Ed25519 là thuật toán chữ ký hiện đại nhanh hơn và an toàn hơn chữ ký RSA:

```python
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

def generate_signing_keypair():
    """Generate Ed25519 signing key pair."""
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    return private_key, public_key

def sign_message(message: bytes, private_key) -> bytes:
    """Sign a message with Ed25519 private key."""
    return private_key.sign(message)

def verify_signature(message: bytes, signature: bytes, public_key) -> bool:
    """Verify an Ed25519 signature."""
    try:
        public_key.verify(signature, message)
        return True
    except Exception:
        return False

# Example: Signing a container image digest
private_key, public_key = generate_signing_keypair()

image_digest = b"sha256:abc123def456..."
signature = sign_message(image_digest, private_key)

# Anyone with the public key can verify
is_valid = verify_signature(image_digest, signature, public_key)
print(f"Signature valid: {is_valid}")  # True
```

## Đối xứng và bất đối xứng: Khi nào nên sử dụng cái nào

| Khía cạnh | đối xứng | Bất đối xứng |
|--------|-----------|------------|
| **Tốc độ** | Nhanh (1000x+) | Chậm |
| **Quản lý khóa** | Phức hợp (bí mật chung) | Dễ dàng hơn (công khai/riêng tư) |
| **Kích thước khóa** | 128-256 bit | Hơn 2048 bit |
| **Trường hợp sử dụng** | Mã hóa dữ liệu hàng loạt | Trao đổi khóa, chữ ký |

### Mã hóa lai

Trong thực tế, các hệ thống sử dụng mã hóa **hybrid**: mã hóa bất đối xứng để trao đổi khóa đối xứng, sau đó mã hóa đối xứng cho dữ liệu thực tế.

```
1. Alice generates random AES key (symmetric)
2. Alice encrypts data with AES key
3. Alice encrypts AES key with Bob's RSA public key (asymmetric)
4. Alice sends: encrypted data + encrypted AES key
5. Bob decrypts AES key with his RSA private key
6. Bob decrypts data with AES key
```

Đây chính xác là cách TLS hoạt động (được đề cập trong Phần 3).

## Các phương pháp hay nhất về quản lý khóa

Mã hóa chỉ mạnh bằng khả năng quản lý khóa của bạn. Dưới đây là những thực hành cần thiết:

### 1. Không bao giờ khóa mã cứng

```python
# ❌ BAD: Key in source code
ENCRYPTION_KEY = "super_secret_key_123"

# ✅ GOOD: Key from environment/secrets manager
import os
ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY')

# ✅ BETTER: Use a secrets manager
from aws_secretsmanager import get_secret
ENCRYPTION_KEY = get_secret('app/encryption-key')
```

### 2. Sử dụng dẫn xuất khóa hàm (KDF)

Khi lấy khóa từ mật khẩu, hãy sử dụng KDF thích hợp:

```python
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
import os
import base64

def derive_key_from_password(password: str, salt: bytes = None) -> tuple[bytes, bytes]:
    """Derive a secure encryption key from a password."""
    if salt is None:
        salt = os.urandom(16)
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # 256 bits for AES-256
        salt=salt,
        iterations=600000,  # OWASP recommended minimum
    )
    
    key = kdf.derive(password.encode())
    return key, salt

# Store the salt alongside encrypted data
password = "user_master_password"
key, salt = derive_key_from_password(password)
```

### 3. Xoay phím thường xuyên

```yaml
# Example: AWS KMS key rotation policy
Resources:
  EncryptionKey:
    Type: AWS::KMS::Key
    Properties:
      EnableKeyRotation: true  # Automatic annual rotation
      KeyPolicy:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              AWS: !Sub 'arn:aws:iam::${AWS::AccountId}:root'
            Action: 'kms:*'
            Resource: '*'
```

### 4. Sử dụng Mô-đun bảo mật phần cứng (HSM) cho khóa có giá trị cao

Đối với hệ thống production xử lý dữ liệu nhạy cảm:

- **AWS KMS** / **Cloud KMS** / **Azure Key Vault** dành cho khối lượng công việc trên đám mây
- **HashiCorp Vault** dành cho nhiều đám mây hoặc tại chỗ
- **HPhần cứng HSMs** (Luna, nCipher) cho yêu cầu bảo mật cao nhất

## Các lỗi mã hóa phổ biến

### 1. Sử dụng mã hóa mà không cần xác thực

```python
# ❌ BAD: AES-CBC without MAC (vulnerable to padding oracle attacks)
cipher = Cipher(algorithms.AES(key), modes.CBC(iv))

# ✅ GOOD: AES-GCM (authenticated encryption)
aesgcm = AESGCM(key)
ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data)
```

### 2. Tái sử dụng Nonces/IV

```python
# ❌ BAD: Static nonce
NONCE = b"static_nonce"  # Catastrophic for GCM!

# ✅ GOOD: Random nonce for each encryption
nonce = os.urandom(12)
```

### 3. Tạo khóa yếu

```python
# ❌ BAD: Predictable key
import random
key = bytes([random.randint(0, 255) for _ in range(32)])

# ✅ GOOD: Cryptographically secure random
import os
key = os.urandom(32)

# ✅ ALSO GOOD: Library-provided generation
from cryptography.fernet import Fernet
key = Fernet.generate_key()
```

## Mã hóa trong bối cảnh DevOps

### Mã hóa bí mật trong CI/CD

```yaml
# GitHub Actions: Using encrypted secrets
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy with encrypted credentials
        env:
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}  # Decrypted at runtime
        run: ./deploy.sh
```

### Mã hóa dữ liệu ở phần còn lại

```bash
# AWS S3 bucket with server-side encryption
aws s3 cp sensitive-file.txt s3://my-bucket/ \
  --sse aws:kms \
  --sse-kms-key-id alias/my-key

# Kubernetes secrets encryption at rest
# In kube-apiserver configuration:
--encryption-provider-config=/etc/kubernetes/encryption-config.yaml
```

### SOPS dành cho GitOps

```yaml
# Encrypted with SOPS (secrets shown in plaintext for example)
# Actual file would have encrypted values
database:
    password: ENC[AES256_GCM,data:abc123...]
    host: ENC[AES256_GCM,data:def456...]
sops:
    kms:
        - arn:aws:kms:us-east-1:123456789:key/abc-123
    encrypted_suffix: _encrypted
```

## Tóm tắt

Những điểm chính của mã hóa:

- **Mã hóa đối xứng** (AES-256-GCM) cho dữ liệu số lượng lớn—nhanh nhưng yêu cầu trao đổi khóa an toàn
- **Amã hóa đối xứng** (RSA, ECDSA) để trao đổi khóa và chữ ký—giải quyết vấn đề phân phối
- **Luôn sử dụng mã hóa xác thực** (chế độ GCM)—không bao giờ mã hóa mà không bảo vệ tính toàn vẹn
- **Không bao giờ sử dụng lại nonces/IVs**—thảm họa đối với mật mã luồng và GCM
- **Sử dụng quản lý khóa thích hợp**—trình quản lý bí mật, KDF cho mật khẩu, luân chuyển thường xuyên
- **Atránh các thuật toán không được dùng nữa**—không có chế độ DES, 3DES, RC4 hoặc ECB

Trong phần tiếp theo, chúng ta sẽ khám phá tính năng băm—hàm một chiều được sử dụng để xác minh tính toàn vẹn và lưu trữ mật khẩu.
