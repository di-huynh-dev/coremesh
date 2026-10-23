---
title: "Nguyên lý của đặc quyền tối thiểu"
description: Tìm hiểu cách triển khai các biện pháp kiểm soát truy cập tối thiểu để giảm bề mặt tấn công của bạn và hạn chế thiệt hại tiềm ẩn.
order: 3
---

Nguyên tắc của đặc quyền tối thiểu (PoLP) nêu rõ rằng mọi người dùng, quy trình hoặc hệ thống chỉ nên có các quyền tối thiểu cần thiết để thực hiện hàm của họ. Khái niệm đơn giản này là một trong những biện pháp kiểm soát bảo mật mạnh mẽ nhất mà bạn có thể triển khai.

## Tại sao đặc quyền tối thiểu lại quan trọng

Khi quyền quá rộng:

- **Bề mặt tấn công lớn hơn**: Nhiều đường dẫn hơn cho kẻ tấn công khai thác
- **Bán kính vụ nổ lớn hơn**: Tài khoản bị xâm phạm có thể gây nhiều sát thương hơn
- ** Khó kiểm toán**: Quá nhiều quyền để theo dõi hiệu quả
- **Vấn đề tuân thủ**: Vi phạm các yêu cầu quy định

## Triển khai đặc quyền tối thiểu

### Chính sách IAM: Bắt đầu bằng Từ chối

AWS IAM tuân theo mô hình từ chối ngầm: người dùng không có quyền cho đến khi được cấp rõ ràng. Điều quan trọng là phải chống lại sự cám dỗ cấp quyền rộng rãi "để đề phòng".

**Thực hành tốt:** Hãy cụ thể về các hành động và nguồn lực. Chính sách này chỉ cho phép đọc từ một nhóm S3 cụ thể:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3ReadSpecificBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",    // Read individual objects
        "s3:ListBucket"    // List bucket contents
        // Note: No write, delete, or admin permissions
      ],
      "Resource": [
        "arn:aws:s3:::my-app-assets",     // Bucket itself (for ListBucket)
        "arn:aws:s3:::my-app-assets/*"    // Objects in bucket (for GetObject)
      ]
    }
  ]
}
```

**Thực hành xấu** - điều này cấp cho quản trị viên S3 quyền truy cập đầy đủ vào mọi nhóm trong tài khoản:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",     // Every S3 action including DeleteBucket!
      "Resource": "*"       // Every bucket in the account
      // An attacker with this access could delete all your data
    }
  ]
}
```

**Tác động thực sự:** Năm 2019, vụ vi phạm của Capital One đã làm lộ hơn 100 triệu hồ sơ, một phần là do vai trò IAM quá dễ dãi trên các phiên bản EC2.

### Kubernetes RBAC

Kiểm soát truy cập dựa trên vai trò (RBAC) Kubernetes cho phép bạn xác định chính xác những hành động mà mỗi tài khoản dịch vụ có thể thực hiện. Nguyên tắc là như nhau: bắt đầu không có gì, chỉ thêm những gì cần thiết.

**Các khái niệm chính:**
- **Role**: Xác định quyền (hành động nào trên tài nguyên nào)
- **RoleBinding**: Cấp vai trò cho tài khoản người dùng/dịch vụ
- **ClusterRole/ClusterRoleBinding**: Tương tự, nhưng trên toàn cụm thay vì trong phạm vi không gian tên

```yaml
# Role with minimal permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: production  # Role only applies in this namespace
rules:
- apiGroups: [""]         # Core API group
  resources: ["pods"]     # Only pods, not secrets, configmaps, etc.
  verbs: ["get", "list", "watch"]  # Read-only, no create/delete
- apiGroups: [""]         
  resources: ["pods/log"] # Allow reading pod logs
  verbs: ["get"]          # But not streaming (no watch)

---
# Bind role to specific service account
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: production
subjects:
- kind: ServiceAccount
  name: monitoring-sa
  namespace: production
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### Quyền cơ sở dữ liệu

Thông tin xác thực cơ sở dữ liệu là mục tiêu hàng đầu của những kẻ tấn công. Nếu ứng dụng của bạn sử dụng tài khoản cơ sở dữ liệu có đầy đủ quyền quản trị viên thì lỗ hổng SQL injection sẽ trở nên nghiêm trọng. Thay vào đó, hãy tạo người dùng có mục đích cụ thể với quyền tối thiểu.

**Nguyên tắc:** Ứng dụng của bạn có thể chỉ cần CHỌN, CHÈN và CẬP NHẬT trên các bảng cụ thể. Nó hầu như không bao giờ cần DROP, ALTER hoặc truy cập vào bảng quản trị.

```sql
-- Create a read-only user for reporting
-- This user can only read data, never modify it
CREATE USER reporting_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE myapp TO reporting_user;  -- Can connect
GRANT USAGE ON SCHEMA public TO reporting_user;      -- Can see schema
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting_user;  -- Read-only

-- Create an app user with limited write access
-- Only the specific tables and operations the app needs
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE myapp TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON users, orders, products TO app_user;
-- Note: No DELETE permission (use soft deletes in app logic)
-- Note: No access to audit_logs, admin_settings tables
-- Note: No TRUNCATE, DROP, or ALTER permissions
```

**Tách biệt người dùng cho các hàm:** khác nhau. Mỗi bảng thông tin báo cáo, tác vụ nền và ứng dụng chính phải có người dùng cơ sở dữ liệu riêng với các quyền thích hợp.

### Quyền của tệp Linux

Quyền của tệp Linux là biện pháp bảo vệ đầu tiên của bạn chống lại việc leo thang đặc quyền. Kẻ tấn công xâm phạm ứng dụng của bạn sẽ không thể đọc các tệp cấu hình nhạy cảm hoặc sửa đổi các tệp thực thi.

**Số giấy phép được giải thích:**
- Chữ số đầu tiên: Quyền của chủ sở hữu
- Chữ số thứ hai: Quyền của nhóm
- Chữ số thứ ba: Quyền của người khác
- Giá trị: 4=đọc, 2=ghi, 1=thực thi (cộng lại với nhau)

```bash
# Application files - read/execute only
# 555 = r-xr-xr-x (everyone can read/execute, nobody can modify)
chmod 555 /opt/myapp/bin/*

# Configuration files - read only by app user
# 400 = r-------- (only owner can read, nobody else)
chmod 400 /opt/myapp/config/secrets.yml
chown appuser:appgroup /opt/myapp/config/secrets.yml

# Log directory - write only where needed
# 755 = rwxr-xr-x (owner full access, others can read/traverse)
chmod 755 /var/log/myapp
# 644 = rw-r--r-- (owner can write, others can only read)
chmod 644 /var/log/myapp/*.log
```

**Các lỗi thường gặp:** Đặt 777 trên các thư mục để "thuận tiện", để lại các bí mật có thể đọc được trên thế giới hoặc chạy các ứng dụng với quyền root.

### Bối cảnh bảo mật container

container thừa hưởng nhiều đặc quyền mặc định mà hầu hết các ứng dụng không cần. Bối cảnh bảo mật hạn chế rõ ràng những gì container có thể thực hiện, hạn chế thiệt hại nếu nó bị xâm phạm.

**Giải thích cài đặt khóa:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:          # Pod-level settings apply to all containers
    runAsNonRoot: true      # Kubernetes will reject containers trying to run as root
    runAsUser: 1000         # Run as specific non-root UID
    runAsGroup: 1000        # Run as specific GID
    fsGroup: 1000           # Group for volume ownership
  containers:
  - name: app
    image: myapp:latest
    securityContext:                   # Container-specific settings
      allowPrivilegeEscalation: false  # Prevent sudo, setuid, etc.
      readOnlyRootFilesystem: true     # Can't write to container filesystem
      capabilities:
        drop:                          # Remove Linux capabilities
          - ALL                        # Drop everything, then add back only what's needed
    volumeMounts:
    - name: tmp               # Writable volume for temp files
      mountPath: /tmp
    - name: cache             # Writable volume for cache
      mountPath: /app/cache
  volumes:
  - name: tmp
    emptyDir: {}
  - name: cache
    emptyDir: {}
```

## Quyền truy cập đúng lúc (JIT)

Thay vì cấp quyền vĩnh viễn, hãy cấp quyền truy cập tạm thời khi cần:

```bash
# Example: Temporary AWS credentials
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/AdminRole \
  --role-session-name "emergency-access" \
  --duration-seconds 3600

# Access expires after 1 hour
```

### Triển khai JIT với Teleport

```yaml
# Teleport role with access requests
kind: role
version: v5
metadata:
  name: developer
spec:
  allow:
    logins: ["{{internal.logins}}"]
    node_labels:
      env: ["dev", "staging"]
    request:
      roles: ["production-access"]
      thresholds:
        - approve: 1
          deny: 1
```

## Tài khoản dịch vụ và nhận dạng khối lượng công việc

Mỗi ứng dụng phải có bản sắc riêng:

```yaml
# Kubernetes: Dedicated service account per app
apiVersion: v1
kind: ServiceAccount
metadata:
  name: payment-service
  namespace: production
  annotations:
    # AWS IAM role for service account
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/PaymentServiceRole

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
spec:
  template:
    spec:
      serviceAccountName: payment-service
      automountServiceAccountToken: true
      containers:
      - name: payment
        image: payment-service:latest
```

## Quyền kiểm tra

Thường xuyên xem xét và thu hồi các quyền không cần thiết:

```bash
# AWS: Find unused IAM credentials
aws iam generate-credential-report
aws iam get-credential-report --output text --query Content | base64 -d

# AWS: Analyze IAM policies
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:user/developer \
  --action-names s3:DeleteBucket
```

### Kiểm tra RBAC Kubernetes

```bash
# List all cluster role bindings
kubectl get clusterrolebindings -o wide

# Find overly permissive bindings
kubectl get clusterrolebindings -o json | jq '
  .items[] | 
  select(.roleRef.name == "cluster-admin") | 
  {name: .metadata.name, subjects: .subjects}
'

# Check what a service account can do
kubectl auth can-i --list --as=system:serviceaccount:default:my-sa
```

## Những lỗi đặc quyền tối thiểu thường gặp

### Sai lầm 1: Tài khoản dịch vụ dùng chung

```yaml
# Bad: Multiple apps sharing one service account
serviceAccountName: shared-sa

# Good: Dedicated service account per app
serviceAccountName: order-service-sa
```

### Sai lầm 2: Quyền ký tự đại diện

```json
// Bad: Wildcard actions
"Action": "ec2:*"

// Good: Specific actions
"Action": [
  "ec2:DescribeInstances",
  "ec2:StartInstances",
  "ec2:StopInstances"
]
```

### Sai lầm 3: Không xác định phạm vi tài nguyên

```json
// Bad: All resources
"Resource": "*"

// Good: Specific resources
"Resource": [
  "arn:aws:s3:::my-bucket",
  "arn:aws:s3:::my-bucket/*"
]
```

### Sai lầm 4: Quyền truy cập quản trị viên vĩnh viễn

```bash
# Bad: Developer has permanent admin
aws iam attach-user-policy \
  --user-name developer \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Good: Require role assumption with MFA
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/AdminRole \
  --serial-number arn:aws:iam::123456789012:mfa/developer \
  --token-code 123456
```

## Bài học chính

- Bắt đầu với quyền không có và chỉ thêm những gì cần thiết
- Tạo danh tính riêng cho từng ứng dụng/dịch vụ
- Sử dụng thông tin xác thực tạm thời thay vì quyền truy cập vĩnh viễn
- Thường xuyên kiểm tra và thu hồi các quyền không sử dụng
- Phạm vi quyền đối với các tài nguyên cụ thể, không phải ký tự đại diện
- Thực hiện phân chia nhiệm vụ cho các hoạt động nhạy cảm

## Bài tập thực hành

Xem lại các quyền trong môi trường của bạn:

1. Liệt kê tất cả người dùng/vai trò IAM có quyền truy cập cấp quản trị viên
2. Xác định tài khoản dịch vụ được chia sẻ giữa các ứng dụng
3. Tìm chính sách sử dụng quyền ký tự đại diện (*)
4. Tạo kế hoạch giảm quyền mà không phá vỡ chức năng
