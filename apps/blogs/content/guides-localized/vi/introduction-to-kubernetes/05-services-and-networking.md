---
title: "Dịch vụ và mạng"
description: Tìm hiểu cách hiển thị các ứng dụng và cho phép liên lạc trong và ngoài cụm Kubernetes của bạn
order: 5
---

Bây giờ bạn đã hiểu cách triển khai và quản lý các ứng dụng trong Kubernetes bằng cách sử dụng Triển khai, hãy khám phá cách bật giao tiếp mạng đến và giữa các ứng dụng đó. Dịch vụ Kubernetes cung cấp các điểm cuối ổn định cho pod, trong khi các tính năng mạng khác quản lý định tuyến lưu lượng, cân bằng tải và truy cập bên ngoài.

## Tìm hiểu mạng Kubernetes

Kubernetes triển khai mô hình mạng phẳng trong đó tất cả pod có thể giao tiếp với nhau mà không cần NAT. Mạng này phải đáp ứng các yêu cầu sau:

- Tất cả container có thể giao tiếp với tất cả container khác mà không cần NAT
- Tất cả các nút có thể giao tiếp với tất cả container mà không cần NAT
- Địa chỉ IP của container giống nhau bất kể nó được xem từ nút nào

Việc triển khai cụ thể mô hình mạng này tùy thuộc vào plugin mạng mà cụm của bạn sử dụng.

## Dịch vụ cơ bản

Dịch vụ là một bản tóm tắt xác định một tập logic pod và chính sách để truy cập chúng. Vì pod là phù du (chúng có thể được tạo và hủy bất kỳ lúc nào) nên địa chỉ IP của chúng thay đổi. Các dịch vụ cung cấp điểm cuối ổn định để kết nối với pod luôn thay đổi này.

```
┌─────────────────────────────────────┐
│           Service (ClusterIP)       │
│              10.96.0.10             │
└───────────────┬─────────────────────┘
                │
                │ load balances to
                │
      ┌─────────┼─────────┬───────────────┐
      │         │         │               │
┌─────▼─────┐ ┌─▼───────┐ ┌─▼────────┐    │
│    Pod    │ │   Pod   │ │   Pod    │    │
│  10.1.0.4 │ │ 10.1.0.5│ │ 10.1.0.6 │    │
└───────────┘ └─────────┘ └──────────┘    │
      ▲         ▲            ▲            │
      └─────────┴────────────┴────────────┘
                Selected by
             app=myapp labels
```

## Tạo dịch vụ đầu tiên của bạn

Hãy tạo một dịch vụ để hiển thị triển khai NGINX từ phần trước. Tạo một tệp có tên `nginx-service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - port: 80 # Port exposed by the service
      targetPort: 80 # Port the container accepts traffic on
  type: ClusterIP # Default service type
```

Áp dụng cấu hình này:

```bash
kubectl apply -f nginx-service.yaml
```

## Loại dịch vụ

Kubernetes cung cấp một số loại dịch vụ cho các yêu cầu tiếp xúc khác nhau:

1. **ClusterIP (mặc định)**: Hiển thị dịch vụ trên IP nội bộ trong cụm. Chỉ có thể truy cập từ trong cụm.

2. **NodePort**: Hiển thị dịch vụ trên IP của mỗi nút tại một cổng tĩnh. Có thể truy cập từ bên ngoài cụm bằng `<NodeIP>:<NodePort>`.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080 # Optional: specify port (default: 30000-32767)
  type: NodePort
```

3. **LoadBalancer**: Hiển thị dịch vụ ra bên ngoài bằng cách sử dụng bộ cân bằng tải của nhà cung cấp đám mây.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-lb
spec:
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
  type: LoadBalancer
```

4. **ExternalName**: Ánh xạ dịch vụ tới nội dung của trường `externalName` (ví dụ: `foo.bar.example.com`) bằng cách trả về bản ghi CNAME.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-service
spec:
  type: ExternalName
  externalName: api.example.com
```

## Quản lý dịch vụ

### Xem dịch vụ

Liệt kê tất cả các dịch vụ trong cụm của bạn:

```bash
kubectl get services
```

Bạn sẽ thấy đầu ra như:

```
NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
kubernetes      ClusterIP   10.96.0.1       <none>        443/TCP   22h
nginx-service   ClusterIP   10.96.145.78    <none>        80/TCP    10m
```

Để biết thêm chi tiết:

```bash
kubectl describe service nginx-service
```

### Dịch vụ kiểm tra

Bạn có thể kiểm tra dịch vụ của mình từ trong cụm bằng cách tạo pod tạm thời:

```bash
kubectl run test-nginx --image=alpine --rm -it -- sh
```

Khi ở trong container:

```bash
# Install curl
apk add --no-cache curl

# Test the service by name
curl nginx-service

# Test the service by cluster IP
curl 10.96.145.78
```

## Khám phá dịch vụ

Kubernetes cung cấp hai cách chính để pod khám phá các dịch vụ:

### Biến môi trường

Kubernetes đưa các biến môi trường cho các dịch vụ đang hoạt động vào pod mới. Đối với dịch vụ có tên `nginx-service`, các biến này bao gồm:

```
NGINX_SERVICE_SERVICE_HOST=10.96.145.78
NGINX_SERVICE_SERVICE_PORT=80
```

### DNS

Kubernetes có máy chủ DNS tích hợp cung cấp bản ghi cho các dịch vụ và pod. Các dịch vụ có thể truy cập được thông qua tên của chúng trong cùng một không gian tên:

```
nginx-service.default.svc.cluster.local
```

Ở đâu:

- `nginx-service` là tên dịch vụ
- `default` là không gian tên
- `svc.cluster.local` là miền cụm

Trong cùng một không gian tên, bạn có thể chỉ cần sử dụng `nginx-service`.

## Cấu hình cổng

Dịch vụ có thể hiển thị nhiều cổng:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: multi-port-service
spec:
  selector:
    app: my-app
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: https
      port: 443
      targetPort: 8443
```

Khi sử dụng nhiều cổng, việc đặt tên cho chúng trở nên quan trọng để tạo sự rõ ràng, đặc biệt là trong cấu hình Ingress.

## Điểm cuối dịch vụ

Điểm cuối được Kubernetes tự động tạo và cập nhật để theo dõi IP pod nào mà dịch vụ sẽ hướng lưu lượng truy cập đến:

```bash
kubectl get endpoints nginx-service
```

Đầu ra:

```
NAME            ENDPOINTS                                   AGE
nginx-service   10.244.0.12:80,10.244.0.13:80,10.244.0.14:80   15m
```

Bạn cũng có thể tạo các dịch vụ mà không cần bộ chọn bằng cách xác định điểm cuối theo cách thủ công. Điều này hữu ích để hướng lưu lượng truy cập đến các dịch vụ bên ngoài hoặc IP cụ thể:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  ports:
    - port: 5432
---
apiVersion: v1
kind: Endpoints
metadata:
  name: external-db # Must match service name
subsets:
  - addresses:
      - ip: 192.168.1.1
    ports:
      - port: 5432
```

## Mối quan hệ của phiên

Theo mặc định, các dịch vụ định tuyến từng kết nối tới backend pod ngẫu nhiên. Nếu bạn cần độ ổn định của kết nối (gửi cùng một ứng dụng khách đến cùng một pod), hãy sử dụng mối quan hệ phiên:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-sticky
spec:
  selector:
    app: nginx
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800 # 3 hours
  ports:
    - port: 80
      targetPort: 80
```

## Dịch vụ không đầu

Nếu bạn cần quyền truy cập DNS trực tiếp vào từng pod riêng lẻ (ví dụ: đối với StatefulSets), hãy tạo một dịch vụ không có đầu bằng cách đặt `clusterIP: None`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
```

Với dịch vụ không có đầu, các truy vấn DNS trả về trực tiếp địa chỉ IP của tất cả pod, thay vì IP cụm của dịch vụ.

## Chính sách lưu lượng bên ngoài

Kiểm soát cách định tuyến lưu lượng truy cập bên ngoài đến các nút và pod:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - port: 80
  type: LoadBalancer
  externalTrafficPolicy: Local
```

Có hai lựa chọn:

- **Cluster** (mặc định): Lưu lượng truy cập có thể được định tuyến đến pod trên bất kỳ nút nào
- **Local**: Lưu lượng truy cập chỉ đến pod trên nút đã nhận được yêu cầu, bảo toàn địa chỉ IP nguồn của máy khách

## Tài nguyên xâm nhập

Trong khi Dịch vụ hiển thị các ứng dụng trong cụm hoặc sử dụng bộ cân bằng tải trên đám mây, tài nguyên Ingress cung cấp định tuyến HTTP và HTTPS phức tạp hơn:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nginx-service
                port:
                  number: 80
```

Để sử dụng tài nguyên Ingress, bạn cần có bộ điều khiển Ingress chạy trong cụm của mình. Các tùy chọn phổ biến bao gồm:

- Bộ điều khiển xâm nhập NGINX
- traefik
- HAProxy
- Kong
- Istio

## Tính năng xâm nhập

Tài nguyên xâm nhập hỗ trợ các tính năng khác nhau thông qua các chú thích dành riêng cho bộ điều khiển:

### Chấm dứt TLS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress
spec:
  tls:
    - hosts:
        - myapp.example.com
      secretName: myapp-tls
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nginx-service
                port:
                  number: 80
```

Bí mật TLS phải chứa dữ liệu `tls.crt` và `tls.key`:

```bash
kubectl create secret tls myapp-tls --cert=path/to/cert.crt --key=path/to/key.key
```

### Định tuyến dựa trên đường dẫn

Định tuyến các đường dẫn khác nhau đến các dịch vụ khác nhau:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-ingress
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /app
            pathType: Prefix
            backend:
              service:
                name: app-service
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 8080
```

### Lưu trữ ảo dựa trên tên

Lưu trữ nhiều tên miền trên cùng một IP:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: name-based-ingress
spec:
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app-service
                port:
                  number: 80
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 8080
```

## Chính sách mạng

Theo mặc định, tất cả pod trong cụm Kubernetes có thể giao tiếp với bất kỳ pod nào khác. Chính sách mạng hạn chế giao tiếp này, tương tự như tường lửa:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-network-policy
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: backend
      ports:
        - protocol: TCP
          port: 5432
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: monitoring
      ports:
        - protocol: TCP
          port: 5000
```

Chính sách này:

- Áp dụng cho pod có nhãn `app: database`
- Chỉ cho phép lưu lượng truy cập đến từ pod với nhãn `app: backend` trên cổng 5432
- Chỉ cho phép lưu lượng truy cập đi vào không gian tên giám sát trên cổng 5000

Lưu ý rằng Chính sách mạng chỉ được thực thi nếu cụm của bạn sử dụng plugin mạng hỗ trợ chúng (như Calico, Cilium, v.v.).

## DNS trong Kubernetes

Kubernetes bao gồm một máy chủ DNS (CoreDNS) mà tất cả pod có thể sử dụng để khám phá dịch vụ.

### Bản ghi DNS cho dịch vụ

Đối với dịch vụ có tên `nginx-service` trong không gian tên `default`:

- Bản ghi **A/AAAA**: `nginx-service.default.svc.cluster.local` phân giải thành IP cụm của dịch vụ
- Bản ghi **SRV**: `_http._tcp.nginx-service.default.svc.cluster.local` cho các cổng được đặt tên

### DNS cho pod

pod nhận bản ghi A/AAAA ở định dạng:
`pod-ip-address.namespace.pod.cluster.local`

Ví dụ: `10-244-1-10.default.pod.cluster.local`

### Tùy chỉnh DNS

Bạn có thể tùy chỉnh cài đặt DNS của pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: custom-dns-pod
spec:
  containers:
    - name: app
      image: nginx
  dnsPolicy: 'None'
  dnsConfig:
    nameservers:
      - 8.8.8.8
    searches:
      - example.com
    options:
      - name: ndots
        value: '5'
```

Chính sách DNS:

- **ClusterFirst** (mặc định): Chuyển tiếp đến máy chủ DNS cụm, quay lại cài đặt DNS của nút
- **Default**: Sử dụng cài đặt DNS của nút
- **None**: Sử dụng cài đặt DNS tùy chỉnh được chỉ định trong `dnsConfig`
- **ClusterFirstWithHostNet**: Dành cho pod sử dụng mạng máy chủ

## Tích hợp lưới dịch vụ

Để có các tính năng mạng nâng cao hơn, hãy cân nhắc sử dụng lưới dịch vụ như Istio, Linkerd hoặc Consul:

- **Kiểm soát lưu lượng chi tiết**: Triển khai Canary, thử nghiệm A/B
- **Mutual TLS**: Mã hóa tự động giữa các dịch vụ
- **Observability**: Số liệu, nhật ký và dấu vết chi tiết
- **Xác thực và ủy quyền**: Bảo mật giữa các dịch vụ

## Dịch vụ LoadBalancer trên DigitalOcean

Khi bạn triển khai dịch vụ LoadBalancer trên DigitalOcean Kubernetes, dịch vụ này sẽ tự động cung cấp Trình cân bằng tải DigitalOcean:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
  annotations:
    service.beta.kubernetes.io/do-loadbalancer-protocol: 'http'
    service.beta.kubernetes.io/do-loadbalancer-algorithm: 'round_robin'
    service.beta.kubernetes.io/do-loadbalancer-redirect-http-to-https: 'true'
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
```

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận được 200 USD tín dụng miễn phí và dễ dàng cung cấp bộ cân bằng tải cho các dịch vụ Kubernetes của bạn.

## Thực tiễn tốt nhất cho dịch vụ và kết nối mạng

1. **Sử dụng tên dịch vụ có ý nghĩa**: Chọn tên mô tả phản ánh mục đích của dịch vụ.

2. **Tận dụng bộ chọn nhãn một cách hiệu quả**: Đảm bảo bộ chọn dịch vụ khớp chính xác với nhãn pod của bạn.

3. **Chọn loại dịch vụ phù hợp**: Sử dụng ClusterIP cho các dịch vụ nội bộ, NodePort để phát triển và LoadBalancer cho các dịch vụ bên ngoài production.

4. **Triển khai chính sách mạng**: Tuân theo nguyên tắc đặc quyền tối thiểu cho giao tiếp pod.

5. **Sử dụng Ingress cho lưu lượng HTTP**: Khi hiển thị nhiều dịch vụ ra bên ngoài, Ingress cung cấp mức sử dụng tài nguyên hiệu quả hơn nhiều dịch vụ LoadBalancer.

6. **Xem xét nhu cầu về mối quan hệ dịch vụ**: Sử dụng mối quan hệ phiên khi khách hàng cần kết nối nhất quán với cùng một pod.

7. **Điểm cuối dịch vụ giám sát**: Kiểm tra xem số lượng pod dự kiến có xuất hiện dưới dạng điểm cuối hay không.

8. **DPhương pháp khám phá dịch vụ tài liệu**: Đảm bảo nhóm của bạn biết cách khám phá và sử dụng dịch vụ.

9. **Lưu ý đến chi phí cân bằng tải**: Trong môi trường đám mây, các dịch vụ LoadBalancer thường phát sinh phí.

10. **Atránh tạo dịch vụ sớm**: Đợi cho đến khi pod của bạn ổn định trước khi sử dụng chúng.

Trong phần tiếp theo, chúng ta sẽ khám phá ConfigMap và Bí mật, giúp bạn quản lý dữ liệu cấu hình và thông tin nhạy cảm cho ứng dụng của mình.
