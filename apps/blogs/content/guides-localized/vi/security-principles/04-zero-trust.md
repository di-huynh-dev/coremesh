---
title: "Kiến trúc Zero Trust"
description: Hiểu cách tiếp cận "không bao giờ tin tưởng, luôn xác minh" đối với kiến trúc bảo mật hiện đại.
order: 4
---

Zero Trust là mô hình bảo mật dựa trên nguyên tắc "không bao giờ tin tưởng, luôn xác minh". Không giống như bảo mật dựa trên vành đai truyền thống giả định mọi thứ bên trong mạng đều an toàn, Zero Trust coi mọi yêu cầu đều có khả năng độc hại—bất kể yêu cầu đó đến từ đâu.

## Vấn đề với bảo mật ngoại vi

Các mô hình bảo mật truyền thống giả định:

- Chu vi mạng được an toàn
- Lưu lượng truy cập nội bộ đáng tin cậy
- Quyền truy cập VPN cấp sự tin cậy hoàn toàn

Cách tiếp cận này thất bại vì:

- Công việc từ xa làm mờ chu vi
- Tài nguyên đám mây tồn tại bên ngoài mạng truyền thống
- Những kẻ tấn công vi phạm vành đai di chuyển tự do
- Mối đe dọa nội bộ là có thật

## Nguyên tắc Zero Trust

### 1. Xác minh rõ ràng

Luôn xác thực và ủy quyền dựa trên tất cả dữ liệu có sẵn:

- Danh tính người dùng
- Tình trạng thiết bị
- Vị trí
- Dịch vụ hoặc khối lượng công việc
- Phân loại dữ liệu
- Phát hiện bất thường

### 2. Sử dụng quyền truy cập đặc quyền tối thiểu

Giới hạn quyền truy cập với quyền truy cập vừa đủ và đúng lúc (JIT/JEA):

- Truy cập có giới hạn thời gian
- Chính sách thích ứng dựa trên rủi ro
- Kiểm soát bảo vệ dữ liệu

### 3. Giả sử vi phạm

Giảm thiểu bán kính vụ nổ và khả năng tiếp cận phân khúc:

- Phân khúc vi mô
- Mã hóa đầu cuối
- Giám sát liên tục
- Tự động phát hiện mối đe dọa

## Triển khai Zero Trust

### Truy cập dựa trên danh tính

Trong Zero Trust, **identity là chu vi mới**. Thay vì tin tưởng vào lưu lượng truy cập vì nó đến từ bên trong mạng, mọi yêu cầu đều phải chứng minh ai (hoặc cái gì) đang thực hiện yêu cầu đó. Điều này áp dụng cho cả người dùng và dịch vụ.

**JWT (Mã thông báo Web JSON)** là cách tiêu chuẩn để mang thông tin nhận dạng. Mã thông báo chứa các xác nhận quyền sở hữu về người dùng/dịch vụ và được ký bằng mật mã nên không thể giả mạo.

```yaml
# Example: OAuth2/OIDC authentication for services
# This Istio configuration requires valid JWTs for all requests
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: jwt-auth
  namespace: production
spec:
  selector:
    matchLabels:
      app: api-gateway       # Apply to pods with this label
  jwtRules:
  - issuer: "https://auth.example.com"              # Who issued the token
    jwksUri: "https://auth.example.com/.well-known/jwks.json"  # Public keys to verify signature
    audiences:
    - "api.example.com"      # Token must be intended for this audience
```

**Quan trọng:** Xác thực (bạn là ai?) tách biệt với ủy quyền (bạn có thể làm gì?). Cấu hình này chỉ xác minh danh tính—bạn vẫn cần các chính sách ủy quyền.

### Xác thực dịch vụ với dịch vụ (mTLS)

Trong kiến trúc microservices, các dịch vụ liên tục giao tiếp với nhau. Nếu không có xác thực, mọi dịch vụ bị xâm nhập đều có thể gọi bất kỳ dịch vụ nào khác. **mTLS (TLS chung)** giải quyết vấn đề này bằng cách yêu cầu cả hai bên của mọi kết nối phải xuất trình chứng chỉ.

**MTLS hoạt động như thế nào:**
1. Dịch vụ A kết nối với Dịch vụ B
2. Dịch vụ B xuất trình chứng chỉ của mình (giống như HTTPS)
3. Dịch vụ A cũng xuất trình chứng chỉ của mình (phần "hỗ trợ")
4. Cả hai dịch vụ đều xác minh chứng chỉ của nhau trước khi liên lạc

```yaml
# Istio: Enforce mTLS for all services
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default            # Apply as default policy
  namespace: production    # In this namespace
spec:
  mtls:
    mode: STRICT           # Reject any non-mTLS connections
    # PERMISSIVE mode allows both mTLS and plain text (useful during migration)

---
# Authorization policy
# Even with mTLS, we must explicitly allow which services can talk to each other
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: payment-service-policy
  namespace: production
spec:
  selector:
    matchLabels:
      app: payment-service   # Apply to payment service pods
  action: ALLOW
  rules:
  - from:
    - source:
        principals:          # Only these identities can call payment-service
        - "cluster.local/ns/production/sa/order-service"      # Order service
        - "cluster.local/ns/production/sa/checkout-service"   # Checkout service
        # Any other service trying to call payment-service is blocked!
    to:
    - operation:
        methods: ["POST"]
        paths: ["/api/v1/payments"]
```

### Phân đoạn vi mô

Phân đoạn mạng truyền thống tạo ra các vùng lớn (như "production" hoặc "DMZ"). **Micro-segmentation** thực hiện điều này hơn nữa bằng cách tạo các vành đai bảo mật riêng lẻ xung quanh mỗi khối lượng công việc. Ngay cả khi kẻ tấn công xâm phạm một dịch vụ, chúng cũng không thể di chuyển sang các dịch vụ khác.

**Đây là phòng thủ nhiều lớp được áp dụng cho lớp mạng.** Mỗi dịch vụ khai báo rõ ràng những gì nó có thể giao tiếp—mọi thứ khác đều bị chặn theo mặc định.

```yaml
# Kubernetes Network Policy for micro-segmentation
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: database          # This policy applies to database pods
  policyTypes:
  - Ingress                  # Control incoming traffic
  - Egress                   # Control outgoing traffic
  ingress:
  # Only backend pods can connect to the database
  - from:
    - podSelector:
        matchLabels:
          app: backend       # Only pods with app=backend label
    ports:
    - protocol: TCP
      port: 5432             # PostgreSQL port only
  egress:
  # Database only needs DNS - no external connections!
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53               # DNS only
  # Note: No egress to internet - if DB is compromised, it can't phone home
```

**Impact:** Nếu kẻ tấn công khai thác lỗ hổng trong trang web frontend của bạn, chúng không thể truy cập trực tiếp vào cơ sở dữ liệu. Trước tiên, họ cần phải xâm phạm dịch vụ backend, dịch vụ này có xác thực và ủy quyền riêng.

### Tin cậy thiết bị

Zero Trust mở rộng ra ngoài vị trí mạng đến tình trạng thiết bị. Người dùng hợp pháp trên thiết bị bị xâm nhập vẫn có nguy cơ. **DDevice Trust** xác minh rằng bản thân thiết bị đáp ứng các yêu cầu bảo mật trước khi cấp quyền truy cập.

**Điều này đặc biệt quan trọng đối với:**
- Nhân viên từ xa sử dụng thiết bị cá nhân
- Chính sách BYOD (Mang theo thiết bị của riêng bạn)
- Nhà thầu và quyền truy cập của bên thứ ba
- Quyền truy cập đặc quyền vào các hệ thống nhạy cảm

```yaml
# Example: Conditional access policy
# User must pass all these checks before accessing resources
device_requirements:
  - os_minimum_version:          # Old OS versions have unpatched vulnerabilities
      windows: "10.0.19041"      # Windows 10 2004 or later
      macos: "11.0"
  - disk_encryption: required    # Protects data if device is lost/stolen
  - screen_lock: required        # Prevents unauthorized physical access
  - antivirus:                   # Basic malware protection
      enabled: true
      definitions_max_age_days: 7  # Must have recent definitions
  - firewall: enabled            # Network-level protection on the device
```

**Công cụ triển khai sự tin cậy của thiết bị:**
- **Truy cập có điều kiện của Microsoft Intune / Azure AD**
- **Google BeyondCorp / Truy cập theo ngữ cảnh**
- **Okta Thiết bị tin cậy**
- **Kolide** (để khắc phục dựa trên Slack)

### Xác minh liên tục

Bảo mật truyền thống xác minh danh tính một lần khi đăng nhập, sau đó tin cậy phiên này trong nhiều giờ hoặc nhiều ngày. Zero Trust lật cái này: **xác minh theo mọi yêu cầu**. Phiên có thể bị tấn công, thiết bị có thể bị xâm phạm giữa phiên và hành vi của người dùng có thể cho thấy việc chiếm đoạt tài khoản.

**Xác minh liên tục bao gồm:**
- Xác thực mã thông báo theo mọi yêu cầu
- Phân tích hành vi (mẫu truy cập bất thường)
- Kiểm tra tình trạng thiết bị theo thời gian thực
- Phát hiện sự bất thường dựa trên vị trí và thời gian

```python
# Example: Session validation middleware
class ZeroTrustMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, request):
        # Step 1: Verify token on every request (not just at login)
        token = request.headers.get('Authorization')
        if not await self.validate_token(token):
            return Response(status=401)
        
        # Step 2: Behavioral analysis - does this look like the real user?
        if await self.detect_anomaly(request):
            await self.alert_security_team(request)  # Don't just block - investigate
            return Response(status=403)
        
        # Step 3: Is the device still compliant? (not just at enrollment)
        device_id = request.headers.get('X-Device-ID')
        if not await self.check_device_compliance(device_id):
            return Response(status=403, body="Device not compliant")
        
        return await self.app(request)
    
    async def detect_anomaly(self, request):
        """Detect suspicious behavior that might indicate compromised credentials"""
        user = request.user
        current_location = request.geo_location
        last_location = await self.get_last_location(user)
        
        # Impossible travel: User in NYC, then Tokyo 10 minutes later?
        if self.is_impossible_travel(last_location, current_location):
            return True
        
        # Unusual access time: Developer accessing prod at 3am?
        if not self.is_normal_access_time(user):
            return True
        
        return False
```

**Xem xét hiệu suất:** Xác minh liên tục sẽ bổ sung thêm chi phí. Sử dụng bộ nhớ đệm một cách khôn ngoan (tuân thủ thiết bị bộ đệm trong vài phút chứ không phải hàng giờ) và kiểm tra thiết kế để không mở được các tài nguyên không quan trọng trong thời gian ngừng hoạt động.

## Zero Trust cho CI/CD pipeline

CI/CD pipeline là các mục tiêu có giá trị cao—chúng có quyền truy cập production và có thể triển khai mã tùy ý. Áp dụng các nguyên tắc Zero Trust ở đây: không có thông tin xác thực lâu dài, ủy quyền rõ ràng và ghi nhật ký kiểm tra.

**Các nguyên tắc chính cho CI/CD Zero Trust:**
- Sử dụng thông tin đăng nhập ngắn hạn, tự động xoay vòng
- Xác thực pipeline bằng mã thông báo OIDC thay vì bí mật tĩnh
- Giới hạn những gì mỗi quy trình công việc có thể triển khai và ở đâu
- Yêu cầu phê duyệt để triển khai production

```yaml
# GitHub Actions with OIDC authentication
# No static AWS credentials stored in GitHub!
name: Deploy
on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    # Authenticate using OIDC - no stored credentials
    - uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
        aws-region: us-east-1
    
    # Verify artifacts before deployment
    - name: Verify container signature
      run: |
        cosign verify \
          --key cosign.pub \
          ${{ env.REGISTRY }}/${{ env.IMAGE }}:${{ github.sha }}
    
    - name: Deploy to EKS
      run: kubectl apply -f k8s/
```

## Kiến trúc mạng Zero Trust

```
TRADITIONAL MODEL:              ZERO TRUST MODEL:

+-------------------+           +-------------------+
|     INTERNET      |           |     INTERNET      |
+--------+----------+           +--------+----------+
         |                               |
    +----v----+                    +-----v-----+
    | Firewall|                    |  Identity |
    +----+----+                    |   Proxy   |
         |                         +-----+-----+
+--------v----------+                    |
|  Trusted Network  |             +------v------+
|                   |             |   Policy    |
|  +---+ +---+ +---+|             |   Engine    |
|  | A | | B | | C ||             +------+------+
|  +---+ +---+ +---+|                    |
|  (all can talk)   |          +---------+---------+
+-------------------+          |         |         |
                             +-v-+     +-v-+     +-v-+
                             | A |     | B |     | C |
                             +---+     +---+     +---+
                             (isolated, verified)
```

## Danh sách kiểm tra triển khai Zero Trust

```bash
# Identity
- [ ] Strong authentication (MFA) for all users
- [ ] Service-to-service authentication (mTLS)
- [ ] Short-lived credentials and tokens
- [ ] Regular access reviews

# Device
- [ ] Device health verification
- [ ] Endpoint detection and response (EDR)
- [ ] Mobile device management (MDM)
- [ ] Certificate-based device identity

# Network
- [ ] Micro-segmentation
- [ ] Encrypted traffic (TLS everywhere)
- [ ] No implicit trust based on network location
- [ ] Software-defined perimeter

# Application
- [ ] Per-request authorization
- [ ] Input validation
- [ ] Secure API design
- [ ] Runtime application self-protection (RASP)

# Data
- [ ] Data classification
- [ ] Encryption at rest and in transit
- [ ] Data loss prevention (DLP)
- [ ] Access logging and monitoring

# Visibility
- [ ] Centralized logging
- [ ] User and entity behavior analytics (UEBA)
- [ ] Security information and event management (SIEM)
- [ ] Continuous monitoring and alerting
```

## Những lỗi Zero Trust thường gặp

### Sai lầm 1: Coi nó như một sản phẩm

Zero Trust là một chiến lược, không phải là một sản phẩm bạn có thể mua. Nó yêu cầu:

- Thay đổi văn hóa
- Cập nhật quy trình
- Nhiều công nghệ làm việc cùng nhau

### Sai lầm 2: Triển khai Big Bang

Đừng cố gắng thực hiện mọi thứ cùng một lúc:

```
Phase 1: Identity
  → Implement strong authentication
  → Add MFA everywhere
  
Phase 2: Device
  → Device health checks
  → Endpoint security
  
Phase 3: Network
  → Micro-segmentation
  → mTLS between services
  
Phase 4: Data
  → Classification
  → DLP implementation
```

### Sai lầm 3: Bỏ qua trải nghiệm người dùng

Bảo mật không được khiến công việc trở nên bất khả thi:

- Triển khai SSO để giảm ma sát
- Sử dụng xác thực dựa trên rủi ro
- Cung cấp thông báo lỗi rõ ràng
- Có quy trình hỗ trợ cho các trường hợp khó khăn

## Bài học chính

- Zero Trust có nghĩa là "không bao giờ tin tưởng, luôn xác minh"
- Danh tính là vành đai mới, không phải mạng
- Mọi yêu cầu truy cập phải được xác thực, ủy quyền và mã hóa
- Giả sử vi phạm và giảm thiểu bán kính vụ nổ
- Thực hiện tăng dần, bắt đầu bằng danh tính
- Giám sát liên tục là điều cần thiết cho Zero Trust

## Bài tập thực hành

Đánh giá mức độ sẵn sàng Zero Trust hiện tại của bạn:

1. Ánh xạ các phương thức xác thực hiện tại của bạn cho người dùng và dịch vụ
2. Xác định vị trí mạng cấp độ tin cậy ngầm
3. Xem lại phân đoạn mạng của bạn (hoặc thiếu phân đoạn đó)
4. Tạo một kế hoạch theo từng giai đoạn để thực hiện các nguyên tắc Zero Trust
5. Xác định những chiến thắng nhanh chóng có thể được thực hiện ngay lập tức
