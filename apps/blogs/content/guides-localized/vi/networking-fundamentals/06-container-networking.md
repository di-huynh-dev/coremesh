---
title: "Mạng container"
description: Hiểu cách Docker và Kubernetes xử lý kết nối mạng, khám phá dịch vụ và liên lạc giữa các container.
order: 6
---

container đã cách mạng hóa cách chúng tôi triển khai các ứng dụng, nhưng chúng cũng đưa ra những vấn đề phức tạp về mạng mới. Hiểu mạng container giúp bạn khắc phục sự cố kết nối, tối ưu hóa hiệu suất và thiết kế các ứng dụng đa container an toàn.

## Điều kiện tiên quyết

- Docker được cài đặt và chạy
- Hiểu biết cơ bản về container và vòng đời của chúng
- Kiến thức cơ bản về mạng từ các phần trước

## Cơ bản về mạng Docker

Khi bạn chạy container, Docker sẽ tự động xử lý kết nối mạng. Nhưng điều gì thực sự đang xảy ra đằng sau hậu trường?

```
Host Machine (192.168.1.100)
│
├── Docker Bridge Network (172.17.0.0/16)
│   │
│   ├── Container 1 (nginx)
│   │   ├── IP: 172.17.0.2
│   │   └── Port: 80 → Host:8080
│   │
│   ├── Container 2 (api)
│   │   ├── IP: 172.17.0.3
│   │   └── Port: 3000 (internal only)
│   │
│   └── Container 3 (db)
│       ├── IP: 172.17.0.4
│       └── Port: 5432 (internal only)
│
└── Host Network Interface
    ├── eth0: 192.168.1.100
    └── docker0: 172.17.0.1 (bridge)

Communication Flow:
Internet → Host:8080 → docker0 → nginx:80
nginx:80 → api:3000 (direct container communication)
api:3000 → db:5432 (direct container communication)
```

Hãy kiểm tra thiết lập mạng mặc định của Docker:

```bash
# List Docker networks
docker network ls

# Inspect the default bridge network
docker network inspect bridge
```

Bạn sẽ thấy đầu ra hiển thị mạng cầu nối có mạng con như `172.17.0.0/16`. Đây là mạng mặc định của Docker nơi container giao tiếp.

### Các loại mạng Docker

**Bridge Network (Mặc định)**: container trên cùng một máy chủ có thể giao tiếp

```bash
# Run containers on default bridge network
docker run -d --name web nginx
docker run -d --name api node:alpine sleep 3600

# Check their IP addresses
docker inspect web | grep IPAddress
docker inspect api | grep IPAddress
```

**Host Network**: container sử dụng trực tiếp mạng của máy chủ

```bash
# Container uses host networking
docker run -d --network host --name host-web nginx

# This container is accessible on the host's IP address
```

**None Network**: container không có quyền truy cập mạng

```bash
# Isolated container with no networking
docker run -d --network none --name isolated alpine sleep 3600
```

## Mạng Docker tùy chỉnh

Mạng cầu nối mặc định có những hạn chế. Mạng tùy chỉnh cung cấp các tính năng và cách ly tốt hơn:

```bash
# Create a custom bridge network
docker network create --driver bridge ecommerce-network

# Inspect the new network
docker network inspect ecommerce-network
```

Chạy container trên mạng tùy chỉnh của bạn:

```bash
# Run containers on the custom network
docker run -d --network ecommerce-network --name frontend nginx
docker run -d --network ecommerce-network --name backend node:alpine sleep 3600
docker run -d --network ecommerce-network --name database postgres:13

# Test connectivity between containers
docker exec frontend ping backend
docker exec backend ping database
```

### Độ phân giải tên container

container trên các mạng tùy chỉnh có thể liên lạc với nhau theo tên:

```bash
# From inside the frontend container
docker exec -it frontend sh
# ping backend    # This works!
# ping database   # This also works!
```

Độ phân giải DNS tự động này không hoạt động trên mạng cầu nối mặc định - bạn cần sử dụng địa chỉ IP hoặc liên kết container.

## Ứng dụng Multi-container

Các ứng dụng thực tế thường liên quan đến nhiều container hoạt động cùng nhau.

### Mạng Docker Compose

Docker Compose tự động tạo mạng cho ứng dụng của bạn:

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    image: nginx
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api

  api:
    image: node:alpine
    command: node server.js
    volumes:
      - ./api:/app
    working_dir: /app
    environment:
      - DATABASE_URL=postgresql://user:pass@database:5432/app
    depends_on:
      - database

  database:
    image: postgres:13
    environment:
      - POSTGRES_DB=app
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Bắt đầu ứng dụng:

```bash
# Start all services
docker-compose up -d

# Check the network Docker Compose created
docker network ls
docker network inspect $(basename $(pwd))_default
```

### Khám phá dịch vụ trong Compose

Các dịch vụ có thể liên lạc với nhau bằng tên dịch vụ:

```javascript
// api/server.js - connecting to database
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://user:pass@database:5432/app',
  // Note: 'database' resolves to the database container
});
```

## Bản đồ và hiển thị cổng

container chạy trong các mạng bị cô lập. Để truy cập chúng từ bên ngoài, bạn cần ánh xạ các cổng:

```bash
# Map container port 8080 to host port 3000
docker run -d -p 3000:8080 --name api-server node:alpine

# Map to specific host interface
docker run -d -p 127.0.0.1:3000:8080 --name local-api node:alpine

# Map to random host port
docker run -d -P --name random-ports nginx
```

Kiểm tra cổng nào được ánh xạ:

```bash
# Show port mappings
docker port api-server

# See all container details including ports
docker ps
```

### Truyền thông nội bộ và bên ngoài

Thiết kế chiến lược cảng của bạn một cách cẩn thận:

```bash
# External services (accessible from outside)
docker run -d -p 80:80 --name web nginx        # Web server
docker run -d -p 443:443 --name web-ssl nginx  # HTTPS

# Internal services (no port mapping needed)
docker run -d --name database postgres         # Database
docker run -d --name cache redis               # Cache
docker run -d --name queue rabbitmq            # Message queue
```

Các dịch vụ nội bộ giao tiếp qua mạng Docker mà không để lộ cổng tới máy chủ.

## Mạng Kubernetes

Mạng Kubernetes phức tạp hơn nhưng cung cấp các tính năng mạnh mẽ cho việc điều phối container.

### Mạng pod

Trong Kubernetes, đơn vị nhỏ nhất là pod, có thể chứa nhiều container:

```yaml
# pod-example.yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-pod
  labels:
    app: web
spec:
  containers:
    - name: nginx
      image: nginx
      ports:
        - containerPort: 80
    - name: app
      image: node:alpine
      command: ['node', 'server.js']
      ports:
        - containerPort: 3000
```

container trong cùng một pod có chung giao diện mạng:

```bash
# Deploy the pod
kubectl apply -f pod-example.yaml

# Get pod IP address
kubectl get pod web-pod -o wide

# Containers in the pod can reach each other via localhost
kubectl exec web-pod -c nginx -- curl localhost:3000
```

### Dịch vụ cân bằng tải

Dịch vụ Kubernetes cung cấp khả năng cân bằng tải và khám phá dịch vụ:

```yaml
# service-example.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx
          ports:
            - containerPort: 80
```

Triển khai và thử nghiệm dịch vụ:

```bash
# Deploy the service and deployment
kubectl apply -f service-example.yaml

# Check service endpoints
kubectl get endpoints web-service

# Test service from another pod
kubectl run test-pod --image=busybox --rm -it -- sh
# wget -qO- http://web-service
```

### Loại dịch vụ

**ClusterIP**: Chỉ dịch vụ nội bộ

```yaml
spec:
  type: ClusterIP # Default, accessible only within cluster
  ports:
    - port: 80
      targetPort: 8080
```

**NodePort**: Có thể truy cập từ bên ngoài cụm

```yaml
spec:
  type: NodePort
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080 # Accessible on any node's IP:30080
```

**LoadBalancer**: Nhà cung cấp đám mây tạo bộ cân bằng tải bên ngoài

```yaml
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 8080
  # Cloud provider creates external load balancer
```

## Chính sách mạng

Kubernetes cho phép các chính sách bảo mật mạng chi tiết:

```yaml
# network-policy-example.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress

---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-to-api
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: web
      ports:
        - protocol: TCP
          port: 8080
```

Áp dụng chính sách mạng:

```bash
# Apply policies
kubectl apply -f network-policy-example.yaml

# Verify policies are active
kubectl get networkpolicies -n production
```

## Mạng lưới dịch vụ

Đối với các kiến trúc vi dịch vụ phức tạp, lưới dịch vụ cung cấp các tính năng mạng nâng cao.

### Lưới dịch vụ Istio

Istio bổ sung proxy sidecar cho mỗi pod để quản lý lưu lượng nâng cao:

```yaml
# istio-example.yaml
apiVersion: v1
kind: Service
metadata:
  name: productpage
spec:
  ports:
    - port: 9080
      name: http
  selector:
    app: productpage

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: productpage-v1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: productpage
      version: v1
  template:
    metadata:
      labels:
        app: productpage
        version: v1
      annotations:
        sidecar.istio.io/inject: 'true' # Enable Istio sidecar
    spec:
      containers:
        - name: productpage
          image: istio/examples-bookinfo-productpage-v1:1.16.2
          ports:
            - containerPort: 9080
```

### Định tuyến lưu lượng truy cập với Istio

Kiểm soát luồng lưu lượng giữa các phiên bản dịch vụ:

```yaml
# virtual-service-example.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: productpage
spec:
  http:
    - match:
        - headers:
            canary:
              exact: 'true'
      route:
        - destination:
            host: productpage
            subset: v2
          weight: 100
    - route:
        - destination:
            host: productpage
            subset: v1
          weight: 90
        - destination:
            host: productpage
            subset: v2
          weight: 10

---
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: productpage
spec:
  host: productpage
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
```

## Khắc phục sự cố mạng container

Khi mạng container không hoạt động, việc khắc phục sự cố có hệ thống sẽ giúp xác định sự cố.

### Gỡ lỗi mạng Docker

Kiểm tra kết nối container:

```bash
# Inspect container network settings
docker inspect container-name | grep -A 20 NetworkSettings

# Test connectivity between containers
docker exec container1 ping container2

# Check if ports are listening
docker exec container-name netstat -tuln

# View container logs for network errors
docker logs container-name
```

### Gỡ lỗi mạng Kubernetes

Gỡ lỗi các sự cố mạng pod:

```bash
# Check pod network configuration
kubectl describe pod pod-name

# Get detailed network information
kubectl get pod pod-name -o yaml | grep -A 10 status

# Test connectivity from within a pod
kubectl exec -it pod-name -- nslookup service-name
kubectl exec -it pod-name -- wget -qO- http://service-name

# Check service endpoints
kubectl get endpoints service-name
```

### Vấn đề về độ phân giải DNS

Các sự cố DNS của container thường gặp:

```bash
# Test DNS resolution in Docker
docker exec container-name nslookup google.com

# Test DNS in Kubernetes
kubectl exec -it pod-name -- nslookup kubernetes.default

# Check DNS configuration
kubectl get configmap coredns -n kube-system -o yaml
```

## Tối ưu hóa hiệu suất

Mạng container có thể ảnh hưởng đến hiệu suất ứng dụng.

### Chi phí không gian tên mạng

Mỗi container có không gian tên mạng riêng, bổ sung thêm một số chi phí:

```bash
# Compare performance with and without network namespace
# Host networking (less overhead)
docker run --network host --rm nginx

# Bridge networking (more overhead but better isolation)
docker run --rm nginx
```

### Nhóm kết nối

container thực hiện nhiều yêu cầu mạng nên sử dụng kết nối tổng hợp:

```javascript
// Node.js example with connection pooling
const http = require('http');

const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
});

const options = {
  hostname: 'api-service',
  port: 8080,
  path: '/data',
  agent: agent,
};
```

### Tác động của chính sách mạng

Chính sách mạng thêm chi phí xử lý:

```bash
# Monitor network policy performance
kubectl top nodes
kubectl describe node node-name | grep -A 5 "System Info"
```

Các chính sách mạng quá mức có thể làm chậm quá trình giao tiếp pod-to-pod.

## Mạng đa cụm

Các tổ chức lớn thường chạy nhiều cụm Kubernetes.

### Liên đoàn cụm

Kết nối nhiều cụm để chuyển đổi dự phòng và phân phối tải:

```yaml
# cluster-federation-example.yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: cross-cluster-gateway
spec:
  selector:
    istio: eastwestgateway
  servers:
    - port:
        number: 15443
        name: tls
        protocol: TLS
      tls:
        mode: ISTIO_MUTUAL
      hosts:
        - '*.local'
```

### Phản ánh dịch vụ

Phản chiếu lưu lượng giữa các cụm để thử nghiệm:

```yaml
# traffic-mirroring-example.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: mirror-traffic
spec:
  http:
    - match:
        - uri:
            prefix: '/api'
      route:
        - destination:
            host: api-service
      mirror:
        host: api-service.test-cluster.local
      mirrorPercentage:
        value: 10.0
```

Trong phần tiếp theo, chúng ta sẽ khám phá mạng đám mây - cách các nhà cung cấp đám mây lớn xử lý mạng trên quy mô lớn và tích hợp với nền tảng container.

Mạng container loại bỏ nhiều vấn đề phức tạp về mạng, nhưng việc hiểu các cơ chế cơ bản sẽ giúp bạn thiết kế các ứng dụng tốt hơn và khắc phục sự cố một cách hiệu quả.

Chúc bạn container vui vẻ!
