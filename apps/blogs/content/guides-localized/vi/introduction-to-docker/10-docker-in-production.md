---
title: "Docker trong môi trường production"
description: Tìm hiểu cách chuẩn bị, triển khai và duy trì Docker container trong môi trường production
order: 10
---

Việc chuyển Docker từ giai đoạn phát triển sang production đòi hỏi phải lập kế hoạch và xem xét cẩn thận các yếu tố như hiệu suất, độ tin cậy, bảo mật và khả năng mở rộng. Phần này bao gồm các phương pháp cần thiết để chạy Docker trong môi trường production và giới thiệu các nền tảng điều phối container có thể giúp quản lý các ứng dụng được chứa trong bộ chứa của bạn trên quy mô lớn.

## Danh sách kiểm tra mức độ sẵn sàng của production

Trước khi triển khai Docker lên production, hãy đảm bảo bạn đã giải quyết các lĩnh vực chính sau:

### Tối ưu hóa container

- image có kích thước tối thiểu và có bề mặt tấn công hạn chế
- Bản dựng nhiều giai đoạn được sử dụng để giảm kích thước image cuối cùng
- Người dùng không phải root được định cấu hình cho container
- Giới hạn tài nguyên được đặt cho CPU và bộ nhớ
- Đã thực hiện kiểm tra sức khỏe
- Xử lý tắt máy duyên dáng tại chỗ

### Cân nhắc về bảo mật

- Quét bảo mật container là một phần của pipeline
- Tất cả image đều sử dụng thẻ phiên bản cụ thể (không bao giờ `latest`)
- Đã triển khai phân đoạn mạng phù hợp
- Quản lý bí mật tại chỗ (không có bí mật được mã hóa cứng)
- Các bản vá bảo mật được áp dụng kịp thời
- Đã triển khai các công cụ bảo mật thời gian chạy container

### Tính sẵn sàng cao

- Dịch vụ được thiết kế để mở rộng quy mô theo chiều ngang
- Cấu hình cân bằng tải
- Dữ liệu liên tục được quản lý đúng cách với volume
- Tự động khởi động lại container được định cấu hình
- Có sẵn quy trình sao lưu và khôi phục dữ liệu

### Giám sát và ghi nhật ký

- Hệ thống ghi nhật ký tập trung được triển khai
- container và giám sát máy chủ tại chỗ
- Cấu hình cảnh báo cho các ngưỡng quan trọng
- Tích hợp giám sát hiệu suất ứng dụng

## Nền tảng điều phối container

Đối với hầu hết khối lượng công việc production, bạn sẽ muốn sử dụng nền tảng điều phối container thay vì quản lý Docker container riêng lẻ.

### Bầy Docker

Docker Swarm là giải pháp điều phối và phân cụm gốc của Docker. Nó dễ thiết lập hơn các lựa chọn thay thế như Kubernetes và hoạt động tốt cho các hoạt động triển khai nhỏ hơn.

Để khởi tạo một Swarm:

```bash
docker swarm init --advertise-addr <MANAGER-IP>
```

Để triển khai một dịch vụ cho Swarm:

```bash
docker service create --name web --replicas 3 -p 80:80 nginx:alpine
```

Các tính năng chính của Docker Swarm:

- Tích hợp với Docker
- Thiết lập và quản lý đơn giản
- Cập nhật và khôi phục
- Quản lý bí mật
- Cân bằng tải
- Mở rộng quy mô dịch vụ

**Example Docker Stack file** (tương tự Docker Compose nhưng dành cho Swarm):

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - '80:80'
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost']
      interval: 30s
      timeout: 10s
      retries: 3

  api:
    image: myapi:1.2.0
    ports:
      - '8000:8000'
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    secrets:
      - db_password
    environment:
      - DB_HOST=db
      - DB_USER=admin

  db:
    image: postgres:13
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    deploy:
      placement:
        constraints: [node.role == manager]

volumes:
  db-data:

secrets:
  db_password:
    external: true
```

Để triển khai ngăn xếp:

```bash
docker stack deploy -c docker-stack.yml myapp
```

### Kubernetes

Kubernetes đã trở thành tiêu chuẩn công nghiệp cho việc điều phối container. Nó cung cấp nhiều tính năng nâng cao hơn Docker Swarm nhưng độ phức tạp tăng lên.

Định nghĩa pod đơn giản trong Kubernetes:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.21-alpine
      ports:
        - containerPort: 80
      resources:
        limits:
          memory: '128Mi'
          cpu: '500m'
      livenessProbe:
        httpGet:
          path: /
          port: 80
        initialDelaySeconds: 3
        periodSeconds: 3
```

Các tính năng chính của Kubernetes:

- Lập kế hoạch nâng cao và tự động phục hồi
- Tự động chia tỷ lệ pod theo chiều ngang
- Chính sách xâm nhập và mạng
- StatefulSets dành cho các ứng dụng có trạng thái
- ConfigMap và những bí mật
- RBAC để kiểm soát truy cập
- Hệ sinh thái và công cụ mở rộng

### Dịch vụ container được quản lý

Nhiều nhà cung cấp đám mây cung cấp dịch vụ container được quản lý nhằm giảm chi phí hoạt động:

- **Amazon ECS/EKS**: Dịch vụ container của AWS (ECS là độc quyền, EKS là Kubernetes)
- **Google Kubernetes Engine (GKE)**: Kubernetes được quản lý trên Google Cloud
- **Azure Kubernetes Service (AKS)**: Kubernetes được quản lý trên Azure
- **DigitalOcean Kubernetes**: Dịch vụ Kubernetes đơn giản hóa
- **DigitalOcean App Platform**: PaaS cho các ứng dụng được đóng gói

Các dịch vụ này xử lý phần lớn việc quản lý cơ sở hạ tầng cho bạn, cho phép bạn tập trung vào các ứng dụng của mình.

## Chiến lược triển khai

Cách bạn triển khai các bản cập nhật cho container sẽ ảnh hưởng đến tính khả dụng và tính ổn định của ứng dụng của bạn.

### Cập nhật cuộn

Các bản cập nhật liên tục thay thế các phiên bản cũ bằng phiên bản mới:

```bash
# Docker Swarm
docker service update --image myapp:2.0 --update-parallelism 1 --update-delay 30s myapp

# Kubernetes
kubectl set image deployment/myapp container=myapp:2.0
```

### Triển khai xanh lam

Triển khai xanh lam bao gồm việc chạy hai môi trường giống hệt nhau, chuyển đổi lưu lượng khi phiên bản mới sẵn sàng:

1. Triển khai phiên bản mới bên cạnh phiên bản hiện có
2. Kiểm tra phiên bản mới
3. Chuyển đổi lưu lượng truy cập từ cũ sang mới
4. Giữ phiên bản cũ chạy tạm thời để khôi phục nhanh nếu cần

### Triển khai Canary

Việc triển khai Canary định tuyến một tỷ lệ nhỏ lưu lượng truy cập sang phiên bản mới trước khi triển khai đầy đủ:

1. Triển khai phiên bản mới với dung lượng tối thiểu
2. Định tuyến một tỷ lệ nhỏ lưu lượng truy cập đến nó
3. Giám sát các vấn đề
4. Tăng dần lưu lượng truy cập lên phiên bản mới
5. Hoàn tất quá trình triển khai nếu không có vấn đề gì phát sinh

## Mẫu có tính sẵn sàng cao

### Khám phá dịch vụ

Trong môi trường container động, khám phá dịch vụ giúp các ứng dụng tìm thấy nhau:

- Docker Swarm tự động cung cấp dịch vụ khám phá dựa trên DNS
- Kubernetes cung cấp tài nguyên Dịch vụ và CoreDNS
- Có thể sử dụng các công cụ của bên thứ ba như Consul hoặc etcd

### Cân bằng tải

Phân phối lưu lượng giữa nhiều phiên bản container:

- **EBộ cân bằng tải bên ngoài**: HAProxy, NGINX, bộ cân bằng tải đám mây
- **Cân bằng tải nội bộ**: Được tích hợp vào các nền tảng điều phối như Dịch vụ Kubernetes

Ví dụ cấu hình cân bằng tải NGINX:

```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Kiểm tra sức khỏe và ngắt mạch

Thực hiện kiểm tra tình trạng để phát hiện và loại bỏ container không lành mạnh:

```dockerfile
HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD curl -f http://localhost/health || exit 1
```

Đối với vi dịch vụ, hãy triển khai ngắt mạch để xử lý lỗi một cách khéo léo:

```yaml
# Istio circuit breaker configuration example
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: api-circuit-breaker
spec:
  host: api
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 10
        maxRequestsPerConnection: 10
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
```

## Chia tỷ lệ container trong production

### Chia tỷ lệ theo chiều ngang

Tăng số lượng phiên bản container để xử lý nhiều tải hơn:

```bash
# Docker Swarm
docker service scale web=5

# Kubernetes
kubectl scale deployment web --replicas=5
```

### Chia tỷ lệ dọc

Phân bổ nhiều tài nguyên hơn cho mỗi container:

```yaml
# Kubernetes example
resources:
  requests:
    memory: '256Mi'
    cpu: '500m'
  limits:
    memory: '512Mi'
    cpu: '1000m'
```

### Tự động điều chỉnh tỷ lệ

Định cấu hình chia tỷ lệ tự động dựa trên số liệu:

```yaml
# Kubernetes Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-autoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## Lưu trữ trong production

### Lưu trữ liên tục

Đối với dữ liệu phải tồn tại khi khởi động lại và di dời container:

```yaml
# Kubernetes PersistentVolumeClaim
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

### Lớp lưu trữ

Các ứng dụng khác nhau có yêu cầu lưu trữ khác nhau:

- **Block storage**: Dành cho cơ sở dữ liệu và ứng dụng cần truy cập có độ trễ thấp
- **Lưu trữ tệp**: Để chia sẻ quyền truy cập trên nhiều container
- **Lưu trữ đối tượng**: Dành cho volume lớn dữ liệu phi cấu trúc

### Sao lưu và khắc phục thảm họa

Sao lưu thường xuyên là điều cần thiết:

```bash
# Example database backup script for a container
docker exec db-container pg_dump -U postgres mydb > backup_$(date +%Y%m%d).sql
```

Hãy cân nhắc sử dụng ảnh chụp nhanh lưu trữ để khôi phục tại một thời điểm.

## Giám sát production

### Số liệu container

Theo dõi các số liệu chính của container:

- Mức sử dụng CPU và bộ nhớ
- Vào/ra mạng
- Vào/ra đĩa
- Trạng thái và sức khỏe của container

Các công cụ giám sát phổ biến:

- Prometheus và Grafana
- Cơ quan dữ liệu
- Di tích mới
- hệ thống

Ví dụ về cấu hình Prometheus để giám sát Docker:

```yaml
scrape_configs:
  - job_name: 'docker'
    static_configs:
      - targets: ['localhost:9323']
```

### Ghi nhật ký

Tập trung nhật ký từ tất cả container:

```bash
# Example Docker run with logging configuration
docker run --log-driver=fluentd \
  --log-opt fluentd-address=fluentd-host:24224 \
  --log-opt tag=docker.{{.Name}} \
  myapp:latest
```

Ngăn xếp ghi nhật ký phổ biến:

- ELK (Elaticsearch, Logstash, Kibana)
- Graylog
- Loki với Grafana

### Giám sát hiệu suất ứng dụng (APM)

Triển khai theo dõi để theo dõi hiệu suất ứng dụng:

- Jaeger
- Zipkin
- APM cơ quan dữ liệu
- APM di tích mới

## Bảo mật trong production

### Bảo mật thời gian chạy

Giám sát và thực thi bảo mật khi chạy:

- Giám sát hành vi container
- Giám sát hoạt động mạng
- Giám sát tính toàn vẹn của tập tin
- Giám sát quá trình

Các công cụ như Falco có thể giúp:

```yaml
# Falco rule example
- rule: Terminal shell in container
  desc: A shell was spawned in a container
  condition: container.id != "" and proc.name = bash
  output: 'Shell spawned in container (container=%container.name)'
  priority: WARNING
```

### Quét image trong CI/CD

Tự động quét bảo mật trước khi triển khai:

```yaml
# GitHub Actions example with Trivy
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          format: 'table'
          exit-code: '1'
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'
```

### An ninh mạng

Áp dụng phân đoạn mạng và bảo mật:

```yaml
# Kubernetes Network Policy example
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-policy
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: backend
      ports:
        - protocol: TCP
          port: 5432
```

## Tuân thủ và quản trị

### Chính sách đăng ký image

Thực thi các chính sách mà image có thể được triển khai:

- Yêu cầu image từ các cơ quan đăng ký đáng tin cậy
- Thực thi việc ký và xác minh
- Chặn image có lỗ hổng nghiêm trọng

### Chiến lược gắn thẻ

Triển khai chiến lược gắn thẻ nhất quán:

- Sử dụng phiên bản ngữ nghĩa
- Bao gồm thông tin xây dựng
- Cân nhắc sử dụng thông báo để có tính bất biến

```bash
docker tag myapp:latest myapp:1.2.3-$(git rev-parse --short HEAD)
```

### Quản lý tài liệu và thay đổi

Duy trì tài liệu về môi trường được chứa trong container của bạn:

- Sơ đồ kiến trúc
- Thủ tục triển khai
- Hướng dẫn khắc phục sự cố
- Nhật ký thay đổi

## Triển khai đám mây với DigitalOcean

DigitalOcean cung cấp nền tảng thân thiện với người dùng để chạy khối lượng công việc container trong production:

- **DigitalOcean Kubernetes**: Dịch vụ Kubernetes được quản lý
- **DigitalOcean App Platform**: PaaS cho các ứng dụng được đóng gói
- **Droplets với Docker**: Máy chủ Docker tự quản lý

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận được 200 USD tín dụng miễn phí và tự tin triển khai các ứng dụng Docker của bạn lên production.

## Lập kế hoạch khắc phục thảm họa

### Phục hồi container

Lập kế hoạch cho các tình huống thất bại khác nhau:

- Lỗi container → Tự động khởi động lại
- Lỗi máy chủ → Người soạn nhạc lên lịch lại container
- Dữ liệu bị hỏng → Khôi phục từ bản sao lưu

### Triển khai đa khu vực

Đối với các ứng dụng quan trọng, hãy xem xét triển khai trên nhiều vùng:

- Triển khai tới nhiều trung tâm/khu vực dữ liệu
- Thực hiện cân bằng tải toàn cầu
- Sao chép dữ liệu giữa các vùng

## Tối ưu hóa chi phí

### Sử dụng tài nguyên

Giám sát và tối ưu hóa việc sử dụng tài nguyên:

- Phân bổ tài nguyên container đúng kích cỡ
- Sử dụng tính năng tự động điều chỉnh để phù hợp với nhu cầu
- Xem xét các phiên bản tại chỗ cho khối lượng công việc không quan trọng

Ví dụ kiểm tra tối ưu hóa tài nguyên:

```bash
# Find containers with excessive resource allocation
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### Tối ưu hóa lưu trữ image

Tối ưu hóa chi phí lưu trữ image:

- Thường xuyên dọn dẹp image không sử dụng
- Triển khai chính sách lưu giữ image
- Sử dụng đế tối thiểu image

```bash
# Clean up unused images
docker image prune -a --filter "until=24h"
```

## Học hỏi và cải tiến liên tục

Hệ sinh thái container phát triển nhanh chóng. Luôn cập nhật bằng cách:

1. **Atham dự các sự kiện trong ngành** như DockerCon và KubeCon
2. **Theo dõi blog và bản tin** về công nghệ container
3. **Tham gia diễn đàn cộng đồng** và các nhóm thảo luận
4. **Xem xét kiến trúc của bạn** định kỳ dựa trên các phương pháp hay nhất
5. **Thử nghiệm các công nghệ mới** đang được phát triển trước production

## Suy nghĩ cuối cùng

Chạy Docker trong production yêu cầu lập kế hoạch cẩn thận và chú ý đến từng chi tiết, nhưng lợi ích rất đáng kể: tính nhất quán được cải thiện, triển khai đơn giản hóa, sử dụng tài nguyên tốt hơn và khả năng mở rộng cao hơn.

Bắt đầu với khối lượng công việc đơn giản khi bạn xây dựng sự tự tin và chuyên môn của mình. Khi kiến thức về container của nhóm bạn ngày càng phát triển, bạn có thể dần dần giải quyết các hoạt động triển khai phức tạp hơn.

Hãy nhớ rằng việc container hóa là một phương tiện để đạt được mục đích cuối cùng, cung cấp các ứng dụng đáng tin cậy, an toàn và có thể mở rộng cho người dùng của bạn. Luôn đặt các yêu cầu của ứng dụng và nhu cầu của người dùng làm trọng tâm trong chiến lược container của bạn.

Chúng tôi hy vọng hướng dẫn này đã cung cấp cho bạn nền tảng vững chắc cho hành trình Docker của bạn. Chúc bạn container vui vẻ!
