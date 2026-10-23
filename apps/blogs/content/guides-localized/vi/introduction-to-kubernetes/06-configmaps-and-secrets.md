---
title: "ConfigMap và Secret"
description: Tìm hiểu cách quản lý cấu hình ứng dụng và dữ liệu nhạy cảm trong Kubernetes
order: 6
---

Các ứng dụng thường yêu cầu cài đặt cấu hình và thông tin nhạy cảm như thông tin đăng nhập đúng vào hàm. Kubernetes cung cấp hai tài nguyên được thiết kế riêng cho mục đích này: ConfigMap cho dữ liệu cấu hình chung và Bí mật cho thông tin nhạy cảm. Trong phần này, chúng ta sẽ khám phá cách tạo, quản lý và sử dụng các tài nguyên này một cách hiệu quả.

## Tìm hiểu ConfigMap và những bí mật

Trước khi đi sâu vào chi tiết, hãy làm rõ mục đích của từng tài nguyên:

- **ConfigMaps** lưu trữ dữ liệu không bí mật theo cặp khóa-giá trị. Chúng lý tưởng cho các cài đặt dành riêng cho môi trường, tệp cấu hình, đối số dòng lệnh, v.v.

- **Secrets** lưu trữ thông tin nhạy cảm như mật khẩu, mã thông báo OAuth và khóa SSH. Chúng tương tự như ConfigMap nhưng được thiết kế đặc biệt cho dữ liệu bí mật.

Cả hai tài nguyên đều tách biệt cấu hình khỏi mã ứng dụng, tuân theo nguyên tắc lưu trữ cấu hình trong môi trường của phương pháp Ứng dụng Mười hai yếu tố.

## Làm việc với ConfigMap

Hãy khám phá cách tạo và sử dụng ConfigMap để cung cấp cấu hình cho các ứng dụng của bạn.

### Tạo ConfigMap

Có nhiều cách để tạo ConfigMap:

#### Từ giá trị theo nghĩa đen

```bash
kubectl create configmap app-config \
  --from-literal=APP_ENV=production \
  --from-literal=APP_DEBUG=false \
  --from-literal=APP_PORT=8080
```

#### Từ tập tin

```bash
# Create a properties file
echo "app.env=production" > app.properties
echo "app.debug=false" >> app.properties
echo "app.port=8080" >> app.properties

# Create ConfigMap from the file
kubectl create configmap app-config --from-file=app.properties
```

#### Từ một thư mục

```bash
# Create a directory with configuration files
mkdir config
echo "This is a config file" > config/config.txt
echo "DB_HOST=localhost" > config/database.env

# Create ConfigMap from the directory
kubectl create configmap app-config --from-file=config/
```

#### Sử dụng YAML

Để kiểm soát nhiều hơn, bạn có thể xác định ConfigMap trong YAML:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: production
  APP_DEBUG: 'false'
  APP_PORT: '8080'
  config.json: |
    {
      "database": {
        "host": "db.example.com",
        "port": 5432
      },
      "cache": {
        "enabled": true,
        "ttl": 300
      }
    }
  nginx.conf: |
    server {
      listen 80;
      server_name example.com;
      
      location / {
        proxy_pass http://backend;
      }
    }
```

Áp dụng cấu hình này với:

```bash
kubectl apply -f app-config.yaml
```

### Đang xem ConfigMap

Liệt kê tất cả ConfigMap trong không gian tên hiện tại:

```bash
kubectl get configmaps
```

Xem chi tiết của một ConfigMap cụ thể:

```bash
kubectl describe configmap app-config
```

Để xem các giá trị thực tế:

```bash
kubectl get configmap app-config -o yaml
```

### Sử dụng ConfigMap trong pod

ConfigMap có thể được sử dụng trong pod theo nhiều cách:

#### Là biến môi trường

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-env-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ['sh', '-c', 'echo $APP_ENV $APP_PORT && sleep 3600']
      env:
        - name: APP_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: APP_ENV
        - name: APP_PORT
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: APP_PORT
```

Bạn cũng có thể tải tất cả các khóa từ ConfigMap dưới dạng biến môi trường:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-env-all-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ['sh', '-c', 'env | grep APP && sleep 3600']
      envFrom:
        - configMapRef:
            name: app-config
```

#### Dưới dạng tệp trong volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-vol-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ['sh', '-c', 'cat /config/config.json && sleep 3600']
      volumeMounts:
        - name: config-volume
          mountPath: /config
  volumes:
    - name: config-volume
      configMap:
        name: app-config
```

Bạn cũng có thể gắn các phím cụ thể:

```yaml
volumes:
  - name: config-volume
    configMap:
      name: app-config
      items:
        - key: config.json
          path: app/config.json
        - key: nginx.conf
          path: nginx/nginx.conf
```

#### Là đối số dòng lệnh

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-arg-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ['echo']
      args: ['$(APP_PORT)']
      env:
        - name: APP_PORT
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: APP_PORT
```

## Làm việc với Bí mật

Bí mật tương tự như ConfigMap nhưng được thiết kế cho dữ liệu bí mật. Kubernetes cung cấp một số biện pháp bảo vệ bổ sung cho Bí mật:

- Bí mật được lưu trữ trong hệ thống tệp tạm thời (tmpfs) trong bộ nhớ, không được ghi vào đĩa
- Etcd mã hóa Bí mật (nếu bật mã hóa)
- Quyền truy cập vào Bí mật có thể bị hạn chế với RBAC

Tuy nhiên, điều quan trọng cần lưu ý là Bí mật được mã hóa theo base64, không được mã hóa theo mặc định. Để mã hóa thực sự ở trạng thái lưu trữ, bạn cần [cấu hình mã hóa](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/).

### Tạo bí mật

Giống như ConfigMap, có nhiều cách để tạo Bí mật:

#### Từ giá trị theo nghĩa đen

```bash
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=s3cr3t
```

#### Từ tập tin

```bash
# Create files with sensitive data
echo -n "admin" > username.txt
echo -n "s3cr3t" > password.txt

# Create Secret from files
kubectl create secret generic db-credentials \
  --from-file=username=username.txt \
  --from-file=password=password.txt
```

#### Sử dụng YAML

Nếu bạn xác định Bí mật trong YAML, bạn cần mã hóa các giá trị trong base64:

```bash
echo -n "admin" | base64
# Output: YWRtaW4=

echo -n "s3cr3t" | base64
# Output: czNjcjN0
```

Sau đó tạo định nghĩa Bí mật:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  username: YWRtaW4=
  password: czNjcjN0
```

Bạn cũng có thể sử dụng trường `stringData`, trường này chấp nhận các chuỗi chưa được mã hóa:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:
  username: admin
  password: s3cr3t
```

### Các loại bí mật

Kubernetes cung cấp các loại tích hợp cho các trường hợp sử dụng Bí mật phổ biến:

- **Opaque** (mặc định): Dữ liệu tùy ý do người dùng xác định
- **kubernetes.io/tls**: Chứng chỉ TLS và khóa riêng
- **kubernetes.io/dockerconfigjson**: Thông tin đăng ký Docker
- **kubernetes.io/service-account-token**: Mã thông báo tài khoản dịch vụ
- **kubernetes.io/basic-auth**: Thông tin xác thực cơ bản
- **kubernetes.io/ssh-auth**: Thông tin xác thực SSH

Ví dụ: để tạo Bí mật TLS:

```bash
kubectl create secret tls tls-secret --cert=path/to/tls.cert --key=path/to/tls.key
```

Đối với thông tin đăng ký Docker:

```bash
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=username \
  --docker-password=password \
  --docker-email=email@example.com
```

### Xem bí mật

Liệt kê tất cả Bí mật trong không gian tên hiện tại:

```bash
kubectl get secrets
```

Xem chi tiết về một Bí mật cụ thể:

```bash
kubectl describe secret db-credentials
```

Để xem các giá trị thực tế (chúng sẽ được mã hóa base64):

```bash
kubectl get secret db-credentials -o yaml
```

Để giải mã một giá trị cụ thể:

```bash
kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 --decode
```

### Sử dụng Bí mật trong pod

Bí mật có thể được sử dụng trong pod tương tự như ConfigMap:

#### Là biến môi trường

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-env-pod
spec:
  containers:
    - name: app
      image: postgres:13
      env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
```

Bạn cũng có thể tải tất cả các khóa từ Bí mật:

```yaml
envFrom:
  - secretRef:
      name: db-credentials
```

#### Dưới dạng tệp trong volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-vol-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ['sh', '-c', 'cat /etc/credentials/username && sleep 3600']
      volumeMounts:
        - name: secret-volume
          mountPath: /etc/credentials
  volumes:
    - name: secret-volume
      secret:
        secretName: db-credentials
```

#### Sử dụng bí mật đăng ký Docker

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: private-image-pod
spec:
  containers:
    - name: app
      image: registry.example.com/private/app:1.0
  imagePullSecrets:
    - name: regcred
```

## Cập nhật ConfigMap và những bí mật

Khi bạn cập nhật ConfigMap hoặc Bí mật, các thay đổi sẽ không tự động được phản ánh trong pod đã sử dụng chúng.

### Biến môi trường

Các biến môi trường được đặt từ ConfigMap hoặc Bí mật chỉ được đánh giá một lần tại thời điểm tạo pod. Để nhận các thay đổi, bạn cần khởi động lại pod.

### Giá đỡ volume

Đối với các tệp được gắn volume, Kubernetes sẽ cập nhật các tệp được gắn trong vòng vài phút. Tuy nhiên, các ứng dụng cần theo dõi các thay đổi hoặc khởi động lại để phát hiện chúng.

### Cập nhật chiến lược

Để cập nhật ứng dụng của bạn khi cấu hình thay đổi:

1. **Sử dụng triển khai với các bản cập nhật luân phiên**:

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
```

2. **Trigger cập nhật bằng cách thay đổi thông số kỹ thuật pod**:

```bash
# Create a new version of the ConfigMap
kubectl create configmap app-config-v2 --from-literal=APP_VERSION=2.0

# Update the deployment to use the new ConfigMap
kubectl set env deployment/app-deployment --from=configmap/app-config-v2
```

3. **Sử dụng ConfigMap bất biến và phiên bản chúng**:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-v2
immutable: true
data:
  APP_VERSION: '2.0'
```

## Quản lý bí mật một cách an toàn

Trong khi Kubernetes Secrets cung cấp chức năng cơ bản để xử lý dữ liệu nhạy cảm thì môi trường production thường yêu cầu các biện pháp bảo mật bổ sung:

### 1. Kích hoạt mã hóa ở phần còn lại

Định cấu hình mã hóa để lưu trữ etcd:

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: <base64-encoded-key>
      - identity: {}
```

### 2. Sử dụng hệ thống quản lý bí mật bên ngoài

Tích hợp với các công cụ quản lý bí mật bên ngoài giúp tăng cường bảo mật. Các tùy chọn bao gồm:

- **HashiCorp Vault**: Sử dụng Trình điều khiển Vault hoặc trình điều khiển CSI
- Trình quản lý bí mật **AWS**: Sử dụng Toán tử bí mật bên ngoài hoặc ASCP
- **Azure Key Vault**: Sử dụng Nhà cung cấp AKV cho Trình điều khiển CSI lưu trữ bí mật
- **Google Secret Manager**: Sử dụng toán tử Trình quản lý bí mật

Ví dụ với Toán tử bí mật bên ngoài:

```yaml
apiVersion: external-secrets.io/v1alpha1
kind: ExternalSecret
metadata:
  name: database-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: db-credentials
  data:
    - secretKey: username
      remoteRef:
        key: database/credentials
        property: username
    - secretKey: password
      remoteRef:
        key: database/credentials
        property: password
```

### 3. Triển khai các biện pháp kiểm soát RBAC

Hạn chế quyền truy cập vào Bí mật bằng Kiểm soát quyền truy cập dựa trên vai trò:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
  namespace: default
rules:
  - apiGroups: ['']
    resources: ['secrets']
    verbs: ['get', 'list']
    resourceNames: ['db-credentials']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-secrets
  namespace: default
subjects:
  - kind: User
    name: jane
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```

### 4. Sử dụng bí mật bị niêm phong

Bí mật bị niêm phong (của Bitnami) cho phép bạn mã hóa bí mật của mình để chúng có thể được lưu trữ an toàn trong git:

```bash
# Install kubeseal
brew install kubeseal  # For macOS

# Encrypt a secret
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=s3cr3t \
  --dry-run=client -o yaml | \
  kubeseal --format yaml > sealed-secret.yaml

# Apply the sealed secret
kubectl apply -f sealed-secret.yaml
```

## Các mẫu phổ biến và trường hợp sử dụng

### Tệp cấu hình cho ứng dụng

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  application.yml: |
    server:
      port: 8080
    spring:
      datasource:
        url: jdbc:postgresql://db:5432/app
        username: ${DB_USER}
        password: ${DB_PASSWORD}
      jpa:
        hibernate:
          ddl-auto: update
---
apiVersion: v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: app
          image: myapp:1.0
          volumeMounts:
            - name: config-volume
              mountPath: /app/config
          env:
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: username
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: password
      volumes:
        - name: config-volume
          configMap:
            name: app-config
```

### Cờ tính năng

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: feature-flags
data:
  ENABLE_NEW_UI: 'true'
  ENABLE_BETA_FEATURES: 'false'
  MAINTENANCE_MODE: 'false'
---
apiVersion: v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  template:
    spec:
      containers:
        - name: app
          image: myapp:1.0
          envFrom:
            - configMapRef:
                name: feature-flags
```

### Cấu hình dành riêng cho môi trường

Tạo ConfigMap cho từng môi trường và chọn môi trường thích hợp dựa trên nhãn:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-dev
  labels:
    env: dev
data:
  APP_ENV: development
  API_URL: http://api-dev
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-prod
  labels:
    env: prod
data:
  APP_ENV: production
  API_URL: http://api
---
apiVersion: v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  template:
    spec:
      containers:
        - name: app
          image: myapp:1.0
          envFrom:
            - configMapRef:
                name: app-config-prod # Change based on environment
```

## Các phương pháp hay nhất cho ConfigMap và Bí mật

1. **Tách cấu hình theo mối quan tâm**: Tạo ConfigMap và Bí mật khác nhau cho các khía cạnh khác nhau của ứng dụng của bạn.

2. **Phiên bản cấu hình của bạn**: Sử dụng quy ước đặt tên bao gồm các phiên bản hoặc dấu thời gian.

3. **Giữ bí mật ở mức tối thiểu**: Chỉ lưu trữ những gì cần giữ bí mật trong Bí mật; sử dụng ConfigMap cho mọi thứ khác.

4. **Xem xét cờ bất biến**: Dành cho các cấu hình không nên thay đổi nếu không triển khai lại.

5. **Sử dụng các khối được chiếu**: Khi bạn cần kết hợp nhiều ConfigMap hoặc Bí mật:

```yaml
volumes:
  - name: all-config
    projected:
      sources:
        - configMap:
            name: app-config
        - secret:
            name: app-secrets
        - configMap:
            name: shared-config
```

6. **Thiết lập các giá trị mặc định**: Giúp ứng dụng của bạn có khả năng phục hồi khi thiếu cấu hình.

7. **Xác thực cấu hình**: Triển khai xác thực để sớm phát hiện các cấu hình sai.

8. **DTài liệu hóa các tùy chọn cấu hình của bạn**: Tạo tài liệu cho tất cả các cài đặt có sẵn.

9. **Audit Truy cập bí mật**: Giám sát và ghi nhật ký quyền truy cập vào cấu hình nhạy cảm.

10. **Xem xét quy trình công việc GitOps**: Sử dụng các công cụ như Flux hoặc ArgoCD với Bí mật được mã hóa.

## Sử dụng DigitalOcean để quản lý cấu hình an toàn

Khi chạy Kubernetes trong môi trường production, việc quản lý cấu hình và bí mật đúng cách càng trở nên quan trọng hơn. DigitalOcean Kubernetes cung cấp một nền tảng đáng tin cậy với các tính năng giúp quản lý cấu hình an toàn:

- Tích hợp với sổ đăng ký container cho image riêng tư
- Hỗ trợ các hệ thống quản lý bí mật bên ngoài
- Etcd được mã hóa để lưu trữ an toàn

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận 200 USD tín dụng miễn phí và tận dụng các tính năng này cho ứng dụng của bạn.

Trong phần tiếp theo, chúng ta sẽ khám phá tính năng lưu trữ liên tục trong Kubernetes, cho phép ứng dụng của bạn lưu trữ dữ liệu ngoài vòng đời container.
