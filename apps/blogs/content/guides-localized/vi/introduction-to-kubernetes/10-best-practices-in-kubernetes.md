---
title: "Thực tiễn tốt nhất về bảo mật Kubernetes"
description: Bảo mật các cụm và khối lượng công việc Kubernetes của bạn bằng các biện pháp bảo mật toàn diện
order: 10
---

Bảo mật là một khía cạnh quan trọng khi chạy Kubernetes trong môi trường production. Khi việc áp dụng Kubernetes ngày càng phát triển, nó ngày càng trở thành mục tiêu hấp dẫn đối với những kẻ tấn công. Trong phần này, chúng ta sẽ khám phá các biện pháp bảo mật toàn diện để bảo vệ cụm, khối lượng công việc và dữ liệu của bạn.

## Nguyên tắc bảo mật cơ bản trong Kubernetes

Bảo mật Kubernetes nên được tiếp cận từ nhiều góc độ:

1. **Bảo mật cụm**: Bảo mật các nút và mặt phẳng điều khiển Kubernetes
2. **Bảo mật vùng chứa**: Bảo mật container image và thời gian chạy
3. **Bảo mật ứng dụng**: Bảo mật khối lượng công việc đang chạy trong cụm của bạn
4. **Bảo mật mạng**: Kiểm soát lưu lượng trong và ngoài cụm
5. **Bảo mật dữ liệu**: Bảo vệ thông tin nhạy cảm

Chúng ta hãy khám phá từng kích thước này.

## Bảo mật cụm Kubernetes

### Kiểm soát an ninh máy bay

Mặt phẳng điều khiển Kubernetes là một thành phần bảo mật quan trọng. Hãy bảo vệ nó bằng các biện pháp sau:

1. **Sử dụng TLS cho tất cả các giao tiếp API**:

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: kube-apiserver
   spec:
     containers:
       - name: kube-apiserver
         command:
           - kube-apiserver
           - --secure-port=6443
           - --tls-cert-file=/etc/kubernetes/pki/apiserver.crt
           - --tls-private-key-file=/etc/kubernetes/pki/apiserver.key
           - --client-ca-file=/etc/kubernetes/pki/ca.crt
   ```

2. **EBộ điều khiển truy cập máy chủ API có thể bật**:

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: kube-apiserver
   spec:
     containers:
       - name: kube-apiserver
         command:
           - kube-apiserver
           - --enable-admission-plugins=NodeRestriction,PodSecurityPolicy,AlwaysPullImages
   ```

3. **Hạn chế quyền truy cập vào etcd**:

   - Sử dụng TLS cho client etcd và giao tiếp ngang hàng
   - Tường lửa cổng etcd khỏi truy cập không cần thiết
   - Chạy etcd trên các nút chuyên dụng khi có thể

4. **Triển khai các chính sách mạng cho mặt phẳng điều khiển**:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: control-plane-protection
     namespace: kube-system
   spec:
     podSelector:
       matchLabels:
         tier: control-plane
     policyTypes:
       - Ingress
     ingress:
       - from:
           - ipBlock:
               cidr: 10.0.0.0/24 # Admin workstations
         ports:
           - protocol: TCP
             port: 6443 # API server
   ```

### Bảo mật nút

Bảo vệ các nút công nhân của bạn bằng các phương pháp sau:

1. **Luôn cập nhật các nút**:

   - Áp dụng các bản vá bảo mật kịp thời
   - Sử dụng hệ điều hành tối thiểu, cứng cáp image
   - Xem xét các mô hình cơ sở hạ tầng bất biến

2. **Cấu hình kubelet an toàn**:

   ```yaml
   # /var/lib/kubelet/config.yaml
   apiVersion: kubelet.config.k8s.io/v1beta1
   kind: KubeletConfiguration
   authentication:
     anonymous:
       enabled: false
     webhook:
       enabled: true
     x509:
       clientCAFile: /etc/kubernetes/pki/ca.crt
   authorization:
     mode: Webhook
   readOnlyPort: 0
   protectKernelDefaults: true
   ```

3. **Cách ly và phân đoạn nút**:
   - Sử dụng nhóm nút riêng biệt cho các loại khối lượng công việc khác nhau
   - Cô lập các nút cho khối lượng công việc nhạy cảm
   - Áp dụng nhãn và nhãn nút thích hợp

### Xác thực và ủy quyền

Thực hiện kiểm soát truy cập thích hợp:

1. **Sử dụng các phương thức xác thực mạnh**:

   - Chứng chỉ ứng dụng khách X.509
   - OpenID Connect (OIDC) với nhà cung cấp danh tính
   - Tài khoản dịch vụ cho các ứng dụng

2. **Kiểm soát truy cập dựa trên vai trò (RBAC)**:

   Xác định vai trò với các quyền cụ thể:

   ```yaml
   apiVersion: rbac.authorization.k8s.io/v1
   kind: Role
   metadata:
     namespace: default
     name: pod-reader
   rules:
     - apiGroups: ['']
       resources: ['pods']
       verbs: ['get', 'watch', 'list']
   ```

   Ràng buộc vai trò với người dùng hoặc nhóm:

   ```yaml
   apiVersion: rbac.authorization.k8s.io/v1
   kind: RoleBinding
   metadata:
     name: read-pods
     namespace: default
   subjects:
     - kind: User
       name: jane
       apiGroup: rbac.authorization.k8s.io
   roleRef:
     kind: Role
     name: pod-reader
     apiGroup: rbac.authorization.k8s.io
   ```

3. **Tuân theo nguyên tắc đặc quyền tối thiểu**:
   - Cấp quyền tối thiểu cần thiết cho mỗi vai trò
   - Thường xuyên kiểm tra và xem xét các quyền RBAC
   - Sử dụng không gian tên để thực thi sự phân tách

## Bảo mật container và image

### Bảo mật image

Bảo mật container image của bạn:

1. **Sử dụng hình ảnh cơ bản tối thiểu**:

   - Alpine Linux hoặc image không phân phối được
   - Loại bỏ các gói và công cụ không cần thiết

2. **Quét image để tìm lỗ hổng**:

   ```bash
   # Using Trivy
   trivy image nginx:1.21

   # Or in CI/CD pipeline
   trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest
   ```

3. **Triển khai đăng ký image an toàn**:

   - Sử dụng sổ đăng ký riêng
   - Kích hoạt xác thực và ủy quyền
   - Thực thi việc ký và xác minh image bằng Docker Content Trust hoặc Cosign:

   ```bash
   # Sign an image with Cosign
   cosign sign --key cosign.key registry.example.com/myapp:latest

   # Verify an image
   cosign verify --key cosign.pub registry.example.com/myapp:latest
   ```

4. **Tạo và thực thi các chính sách image**:
   ```yaml
   # Using OPA Gatekeeper
   apiVersion: constraints.gatekeeper.sh/v1beta1
   kind: K8sAllowedRepos
   metadata:
     name: require-trusted-repos
   spec:
     match:
       kinds:
         - apiGroups: ['']
           kinds: ['Pod']
     parameters:
       repos:
         - 'registry.example.com/'
         - 'docker.io/bitnami/'
   ```

### Bảo mật thời gian chạy container

Bảo mật thời gian chạy container:

1. **Sử dụng hệ điều hành được tối ưu hóa container**:

   - Hệ điều hành được tối ưu hóa container (Google)
   - Tên lửa chai (AWS)
   - RancherOS hoặc K3OS

2. **Định cấu hình hồ sơ seccomp**:

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: secure-pod
   spec:
     securityContext:
       seccompProfile:
         type: Localhost
         localhostProfile: profiles/restricted.json
     containers:
       - name: app
         image: myapp:1.0
   ```

3. **Sử dụng hộp cát thời gian chạy container**:

   - gVisor
   - Kata container
   - pháo nổ

4. **Triển khai giám sát bảo mật thời gian chạy**:
   - Falco để phát hiện mối đe dọa thời gian chạy
   - Sysdig cho khả năng hiển thị container
   - Aqua Security hoặc Twistlock để bảo vệ toàn diện

## Bảo mật khối lượng công việc

### Bảo mật pod

Áp dụng các biện pháp bảo mật cho pod của bạn:

1. **Sử dụng pod Tiêu chuẩn bảo mật**:

   Kể từ Kubernetes 1.25, Tuyển sinh bảo mật pod cung cấp khả năng thực thi tích hợp các Tiêu chuẩn bảo mật pod, thay thế Chính sách bảo mật pod không còn được dùng nữa:

   ```yaml
   # Namespace-level enforcement
   apiVersion: v1
   kind: Namespace
   metadata:
     name: secure-namespace
     labels:
       pod-security.kubernetes.io/enforce: restricted
       pod-security.kubernetes.io/warn: restricted
       pod-security.kubernetes.io/audit: restricted
   ```

2. **Định cấu hình bối cảnh bảo mật**:

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: secure-pod
   spec:
     securityContext:
       runAsNonRoot: true
       runAsUser: 1000
       runAsGroup: 3000
       fsGroup: 2000
       seccompProfile:
         type: RuntimeDefault
     containers:
       - name: app
         image: myapp:1.0
         securityContext:
           allowPrivilegeEscalation: false
           capabilities:
             drop:
               - ALL
           readOnlyRootFilesystem: true
   ```

3. **Giới hạn khả năng của container**:

   - Bỏ tất cả các khả năng theo mặc định
   - Chỉ thêm các khả năng cần thiết

4. **Định cấu hình giới hạn tài nguyên**:
   ```yaml
   resources:
     requests:
       memory: '64Mi'
       cpu: '250m'
     limits:
       memory: '128Mi'
       cpu: '500m'
   ```

### Bảo mật tài khoản dịch vụ

Bảo mật tài khoản dịch vụ của bạn:

1. **Vô hiệu hóa tính năng tự động gắn mã thông báo tài khoản dịch vụ**:

   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: restricted-sa
   automountServiceAccountToken: false
   ```

2. **Tạo và sử dụng các tài khoản dịch vụ tối thiểu**:

   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: app-sa
   ---
   apiVersion: rbac.authorization.k8s.io/v1
   kind: Role
   metadata:
     name: app-role
   rules:
     - apiGroups: ['']
       resources: ['configmaps']
       verbs: ['get']
       resourceNames: ['app-config']
   ---
   apiVersion: rbac.authorization.k8s.io/v1
   kind: RoleBinding
   metadata:
     name: app-rb
   subjects:
     - kind: ServiceAccount
       name: app-sa
   roleRef:
     kind: Role
     name: app-role
     apiGroup: rbac.authorization.k8s.io
   ```

3. **Sử dụng mã thông báo tài khoản dịch vụ dự kiến**:
   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: token-projected-pod
   spec:
     containers:
       - name: app
         image: myapp:1.0
         volumeMounts:
           - name: token
             mountPath: /var/run/secrets/tokens
     volumes:
       - name: token
         projected:
           sources:
             - serviceAccountToken:
                 path: token
                 expirationSeconds: 3600
                 audience: api
   ```

### Quản lý bí mật

Quản lý đúng thông tin nhạy cảm:

1. **Sử dụng hệ thống quản lý bí mật bên ngoài**:

   - HashiCorp Vault
   - Trình quản lý bí mật AWS
   - Người quản lý bí mật của Google
   - Kho khóa Azure

   Sử dụng toán tử bí mật bên ngoài:

   ```yaml
   apiVersion: external-secrets.io/v1beta1
   kind: ExternalSecret
   metadata:
     name: database-credentials
   spec:
     refreshInterval: '15m'
     secretStoreRef:
       name: vault-backend
       kind: SecretStore
     target:
       name: database-credentials
     data:
       - secretKey: username
         remoteRef:
           key: databases/mysql/credentials
           property: username
       - secretKey: password
         remoteRef:
           key: databases/mysql/credentials
           property: password
   ```

2. **Emã hóa dữ liệu vvD**:

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

3. **Sử dụng các bí mật được niêm phong cho quy trình công việc GitOps**:
   ```bash
   # Encrypt a secret
   kubectl create secret generic db-creds \
     --from-literal=username=admin \
     --from-literal=password=secretpassword \
     --dry-run=client -o yaml | \
     kubeseal --format yaml > sealed-db-creds.yaml
   ```

## An ninh mạng

### Chính sách mạng

Thực hiện phân đoạn mạng:

1. **Chính sách từ chối mặc định**:

   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: default-deny-all
   spec:
     podSelector: {}
     policyTypes:
       - Ingress
       - Egress
   ```

2. **Cho phép giao tiếp cụ thể**:

   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: api-allow
   spec:
     podSelector:
       matchLabels:
         app: api
     policyTypes:
       - Ingress
       - Egress
     ingress:
       - from:
           - podSelector:
               matchLabels:
                 app: frontend
         ports:
           - protocol: TCP
             port: 8080
     egress:
       - to:
           - podSelector:
               matchLabels:
                 app: database
         ports:
           - protocol: TCP
             port: 5432
   ```

3. **Cách ly không gian tên**:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: namespace-isolation
     namespace: production
   spec:
     podSelector: {}
     policyTypes:
       - Ingress
     ingress:
       - from:
           - namespaceSelector:
               matchLabels:
                 purpose: production
   ```

### Vào an toàn

Bảo vệ truy cập bên ngoài:

1. Chấm dứt **TLS**:

   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: secure-ingress
   spec:
     tls:
       - hosts:
           - api.example.com
         secretName: api-tls
     rules:
       - host: api.example.com
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: api-service
                   port:
                     number: 80
   ```

2. **Xác thực bằng Proxy OAuth2**:

   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: oauth-ingress
     annotations:
       nginx.ingress.kubernetes.io/auth-url: 'https://$host/oauth2/auth'
       nginx.ingress.kubernetes.io/auth-signin: 'https://$host/oauth2/start'
   spec:
     # ...
   ```

3. **Tường lửa ứng dụng web (WAF)**:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: waf-protected-ingress
     annotations:
       nginx.ingress.kubernetes.io/enable-modsecurity: 'true'
       nginx.ingress.kubernetes.io/modsecurity-transaction-id: '$request_id'
   spec:
     # ...
   ```

### Bảo mật lưới dịch vụ

Triển khai lưới dịch vụ để tăng cường bảo mật:

1. **Istio với mTLS**:

   ```yaml
   apiVersion: security.istio.io/v1beta1
   kind: PeerAuthentication
   metadata:
     name: default
     namespace: istio-system
   spec:
     mtls:
       mode: STRICT
   ```

2. **Chính sách xác thực và ủy quyền**:
   ```yaml
   apiVersion: security.istio.io/v1beta1
   kind: AuthorizationPolicy
   metadata:
     name: frontend-to-backend
     namespace: default
   spec:
     selector:
       matchLabels:
         app: backend
     rules:
       - from:
           - source:
               principals: ['cluster.local/ns/default/sa/frontend-sa']
         to:
           - operation:
               methods: ['GET']
               paths: ['/api/v1/*']
   ```

## Tuân thủ và kiểm toán

### Ghi nhật ký kiểm tra

Kích hoạt và định cấu hình ghi nhật ký kiểm tra:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kube-apiserver
spec:
  containers:
    - name: kube-apiserver
      command:
        - kube-apiserver
        - --audit-log-path=/var/log/kubernetes/audit.log
        - --audit-log-maxage=30
        - --audit-log-maxbackup=10
        - --audit-log-maxsize=100
        - --audit-policy-file=/etc/kubernetes/audit-policy.yaml
```

Với chính sách như:

```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  # Log pod changes at RequestResponse level
  - level: RequestResponse
    resources:
      - group: ''
        resources: ['pods']
  # Log configmaps and secrets at Metadata level
  - level: Metadata
    resources:
      - group: ''
        resources: ['secrets', 'configmaps']
  # Log nothing else
  - level: None
```

### Quét bảo mật và đo điểm chuẩn

Thường xuyên quét cụm của bạn:

1. Điểm chuẩn Kubernetes **CIS**:

   ```bash
   # Using kube-bench
   kubectl run kube-bench --image=aquasec/kube-bench:latest
   ```

2. **Kubernetes Quản lý tư thế bảo mật (KSPM)**:

   - Kubescape
   - falco
   - Đám mây Prisma

3. **Quét cấu hình**:
   ```bash
   # Using Trivy for configuration scanning
   trivy config --severity HIGH,CRITICAL ./kubernetes/
   ```

### Khung tuân thủ

Phù hợp với tiêu chuẩn ngành:

1. **Bản đồ điều khiển theo tiêu chuẩn**:

   - PCI DSS
   - HIPAA
   - SÓC 2
   - ISO 27001

2. **Thực hiện tuân thủ dưới dạng mã**:
   ```yaml
   # OPA Gatekeeper constraint for PCI requirement 2.2
   apiVersion: constraints.gatekeeper.sh/v1beta1
   kind: K8sRequiredLabels
   metadata:
     name: required-compliance-labels
   spec:
     match:
       kinds:
         - apiGroups: ['']
           kinds: ['Pod']
     parameters:
       labels:
         - key: 'compliance'
           allowedRegex: 'pci|hipaa|sox'
   ```

## Phản hồi bảo mật

### Phản hồi sự cố

Chuẩn bị cho sự cố an ninh:

1. **Tạo kế hoạch ứng phó sự cố**:

   - Thủ tục phát hiện
   - Chiến lược ngăn chặn
   - Quá trình diệt trừ
   - Các bước khôi phục

2. **Thực hiện cơ chế phát hiện**:

   - Giám sát an ninh thời gian chạy
   - Phát hiện bất thường
   - Cảnh báo tương quan

3. **Thực hành chiến lược ngăn chặn**:

   ```bash
   # Isolate a compromised node
   kubectl cordon <node-name>
   kubectl drain <node-name> --ignore-daemonsets

   # Isolate a namespace with network policies
   kubectl apply -f quarantine-policy.yaml
   ```

### Khắc phục tự động

Thiết lập phản hồi tự động:

1. **Pod khởi động lại khi có hoạt động đáng ngờ**:

   ```yaml
   # Falco response using falco-sidekick
   spec:
     alertOutput:
       webhooks:
         - url: 'http://falco-sidekick:2801'
   ```

2. **Cách ly mạng**:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: quarantine
   spec:
     podSelector:
       matchLabels:
         security.kubernetes.io/quarantine: 'true'
     policyTypes:
       - Ingress
       - Egress
   ```

## Tăng cường bảo mật trong DigitalOcean Kubernetes

Dịch vụ DigitalOcean Kubernetes (DOKS) cung cấp một số tính năng bảo mật:

1. **Kiểm soát an ninh mặt phẳng**:

   - Được quản lý và bảo mật bởi DigitalOcean
   - Bản vá bảo mật tự động
   - Mạng riêng cho các nút

2. **Bảo mật nút**:

   - Cập nhật bảo mật thường xuyên
   - image tối thiểu

3. **Bảo mật mạng**:
   - Hỗ trợ chính sách mạng
   - Mạng riêng
   - Tích hợp VPC

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận tín dụng miễn phí trị giá 200 USD và triển khai ứng dụng của bạn trên nền tảng Kubernetes an toàn.

## Bảo mật CI/CD pipeline

Bảo vệ triển khai pipeline của bạn:

1. **Bảo mật môi trường xây dựng**:

   - Sử dụng môi trường xây dựng bị cô lập
   - Triển khai đặc quyền tối thiểu cho hệ thống CI
   - Quét các phần phụ thuộc trong quá trình xây dựng

2. **Triển khai bảo mật GitOps**:

   - Yêu cầu commit đã ký
   - Thực thi đánh giá mã
   - Sử dụng các nhánh được bảo vệ

3. **Thông tin xác thực triển khai an toàn**:
   - Sử dụng thông tin xác thực ngắn hạn
   - Triển khai các tài khoản dịch vụ triển khai cụ thể
   - Hạn chế triển khai ở các không gian tên cụ thể

Ví dụ về quy trình CI/CD an toàn:

```yaml
# GitHub Actions workflow
name: Secure Kubernetes Deployment

on:
  push:
    branches: [main]

jobs:
  scan-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Verify commit signature
        run: git verify-commit HEAD

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to registry
        uses: docker/login-action@v2
        with:
          registry: ${{ secrets.REGISTRY }}
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ secrets.REGISTRY }}/app:${{ github.sha }}

      - name: Scan image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ secrets.REGISTRY }}/app:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          exit-code: '1'
          severity: 'CRITICAL'

      - name: Deploy to Kubernetes
        uses: Azure/k8s-deploy@v1
        with:
          manifests: |
            kubernetes/deployment.yaml
            kubernetes/service.yaml
          images: |
            ${{ secrets.REGISTRY }}/app:${{ github.sha }}
          namespace: production
```

## Danh sách kiểm tra các phương pháp bảo mật tốt nhất

Sử dụng danh sách kiểm tra này để đảm bảo an ninh toàn diện:

### Bảo mật cụm

1. [ ] Mã hóa TLS cho tất cả các giao tiếp trên mặt phẳng điều khiển
1. [ ] RBAC được cấu hình đúng
1. [ ] Đã bật bộ điều khiển truy cập máy chủ API
1. [ ] etcd được mã hóa và bảo mật
1. [ ] Các nút được cập nhật thường xuyên và được củng cố
1. [ ] Kubelet được cấu hình an toàn

### Bảo mật container

1. [ ] image được quét để tìm lỗ hổng
1. [ ] Cơ sở image được thu nhỏ
1. [ ] image đã ký và xác minh
1. [ ] Đăng ký container được bảo mật
1. [ ] Đã triển khai giám sát bảo mật thời gian chạy
1. [ ] Bối cảnh bảo mật được định cấu hình

### Bảo mật khối lượng công việc

1. [ ] Tiêu chuẩn bảo mật pod được thực thi
1. [ ] Tài khoản dịch vụ được quản lý đúng cách
1. [ ] Bí mật được lưu trữ an toàn
1. [ ] Giới hạn tài nguyên được xác định
1. [ ] Người dùng không phải root đã được định cấu hình
1. [ ] Hệ thống tập tin chỉ đọc nếu có thể

### An ninh mạng

1. [ ] Chính sách mạng được triển khai
1. [ ] Chính sách từ chối mặc định được áp dụng
1. [ ] Lưu lượng truy cập vào được bảo mật bằng TLS
1. [ ] Lưới dịch vụ với mTLS (nếu có)
1. [ ] Kiểm soát giao thông lối ra

### Giám sát và kiểm toán

1. [ ] Đã bật ghi nhật ký kiểm tra
1. [ ] Quét bảo mật tự động
1. [ ] Đã thực hiện kiểm tra tuân thủ
1. [ ] Giám sát hoạt động đáng ngờ
1. [ ] Kế hoạch ứng phó sự cố được ghi lại

## Kết luận

Bảo mật Kubernetes yêu cầu cách tiếp cận phòng thủ nhiều lớp, giải quyết nhiều lớp của ngăn xếp. Bằng cách triển khai các phương pháp được nêu trong hướng dẫn này, bạn có thể cải thiện đáng kể tình trạng bảo mật của cụm của mình.

Hãy nhớ rằng bảo mật không phải là nhiệm vụ một lần mà là một quá trình liên tục. Luôn cập nhật các phương pháp bảo mật tốt nhất và lỗ hổng bảo mật ảnh hưởng đến Kubernetes và hệ sinh thái của nó.

Để triển khai production, hãy cân nhắc sử dụng dịch vụ Kubernetes được quản lý như DigitalOcean Kubernetes, dịch vụ này xử lý nhiều khía cạnh bảo mật cho bạn đồng thời giúp bạn linh hoạt triển khai các biện pháp bảo mật bổ sung cho nhu cầu cụ thể của mình.

Trong hướng dẫn toàn diện này, chúng tôi đã đề cập đến các nguyên tắc cơ bản của Kubernetes, từ kiến trúc đến bảo mật. Bây giờ bạn đã có kiến thức để triển khai, quản lý và bảo mật các ứng dụng Kubernetes trong nhiều môi trường khác nhau. Tiếp tục khám phá và thử nghiệm để nâng cao kiến thức chuyên môn của bạn về nền tảng điều phối container mạnh mẽ này.
