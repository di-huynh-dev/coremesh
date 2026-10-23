---
title: "Cân bằng tải và tính sẵn sàng cao"
description: Phân phối lưu lượng truy cập trên nhiều máy chủ và xử lý lỗi một cách khéo léo để duy trì độ tin cậy của dịch vụ.
order: 5
---

Điểm duy nhất của ứng dụng bị lỗi sẽ giết chết. Khi máy chủ web duy nhất của bạn gặp sự cố, mọi người đều nhận được trang lỗi. Khi cơ sở dữ liệu của bạn ngừng hoạt động, toàn bộ ứng dụng của bạn sẽ ngừng hoạt động. Các kỹ thuật cân bằng tải và tính sẵn sàng cao sẽ phân phối lưu lượng truy cập và loại bỏ các điểm lỗi đơn lẻ này.

## Điều kiện tiên quyết

- Hiểu biết về các nguyên tắc cơ bản của mạng và tường lửa
- Truy cập vào nhiều máy chủ hoặc container để thử nghiệm
- Kiến thức cấu hình máy chủ web cơ bản

## Tại sao cân bằng tải lại quan trọng

Hãy bắt đầu với một ví dụ đơn giản. Bạn có một máy chủ web xử lý tất cả lưu lượng truy cập của mình:

```
Internet Users                Single Web Server
     │                            │
┌────▼────┐                  ┌────▼────┐
│ User 1  │                  │         │
└─────────┘                  │ nginx   │
┌─────────┐                  │ :80     │
│ User 2  │─────────────────►│         │
└─────────┘                  │ CPU:95% │
┌─────────┐                  │ Memory: │
│ User 3  │                  │ 4GB/4GB │
└─────────┘                  └─────────┘
┌─────────┐                      │
│ User N  │                      ▼
└─────────┘                 ❌ OVERLOADED
```

Khi lưu lượng truy cập tăng lên, máy chủ này sẽ trở nên quá tải. Cân bằng tải giải quyết vấn đề này bằng cách phân phối yêu cầu trên nhiều máy chủ:

```
Internet Users            Load Balancer           Backend Servers
     │                        │                        │
┌────▼────┐              ┌────▼────┐              ┌────▼────┐
│ User 1  │              │         │              │ nginx-1 │
└─────────┘              │ nginx   │              │ :8080   │
┌─────────┐              │ LB      │──────────────┤ CPU:30% │
│ User 2  │──────────────┤ :80     │              └─────────┘
└─────────┘              │         │              ┌─────────┐
┌─────────┐              │ Routes  │──────────────│ nginx-2 │
│ User 3  │              │ Traffic │              │ :8080   │
└─────────┘              │ Evenly  │              │ CPU:25% │
┌─────────┐              └─────────┘              └─────────┘
│ User N  │                                       ┌─────────┐
└─────────┘                                       │ nginx-3 │
                                                  │ :8080   │
                                                  │ CPU:35% │
                                                  └─────────┘
```

Kiểm tra các kết nối hiện tại đến máy chủ của bạn:

```bash
# Check current connections to your server
netstat -an | grep :80 | grep ESTABLISHED | wc -l
```

### Các loại cân bằng tải

**Layer 4 (Lớp truyền tải)**: Phân phối dựa trên địa chỉ IP và cổng

```bash
# Client connects to load balancer IP:80
# Load balancer forwards to backend servers
# 192.168.1.10:80 → 10.0.1.100:8080
# 192.168.1.10:80 → 10.0.1.101:8080
```

**Layer 7 (Lớp ứng dụng)**: Phân phối dựa trên nội dung như tiêu đề hoặc URL HTTP

```bash
# Route based on URL path
# /api/* → API servers (10.0.1.100-102)
# /static/* → Static file servers (10.0.2.100-102)
# /* → Web application servers (10.0.1.200-202)
```

## Thiết lập cân bằng tải cơ bản

### Cân bằng tải nginx

nginx tạo ra bộ cân bằng tải HTTP tuyệt vời. Đây là một cấu hình cơ bản:

```nginx
# /etc/nginx/sites-available/load-balancer
upstream backend_servers {
    server 10.0.1.100:8080;
    server 10.0.1.101:8080;
    server 10.0.1.102:8080;
}

server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kích hoạt và kiểm tra cấu hình:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/load-balancer \
           /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Test load balancing
curl -H "Host: app.example.com" http://your-load-balancer
```

### Cấu hình HAProxy

HAProxy cung cấp các tính năng cân bằng tải nâng cao hơn:

```bash
# /etc/haproxy/haproxy.cfg
global
    daemon

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend web_frontend
    bind *:80
    default_backend web_servers

backend web_servers
    balance roundrobin
    option httpchk GET /health
    server web1 10.0.1.100:8080 check
    server web2 10.0.1.101:8080 check
    server web3 10.0.1.102:8080 check
```

Bắt đầu HAProxy và kiểm tra:

```bash
# Test configuration
sudo haproxy -f /etc/haproxy/haproxy.cfg -c

# Start HAProxy
sudo systemctl start haproxy

# Check status
echo "show stat" | sudo socat stdio /var/lib/haproxy/stats
```

## Thuật toán cân bằng tải

Các thuật toán khác nhau phân phối lưu lượng truy cập theo những cách khác nhau:

### Vòng Robin

Yêu cầu đi đến từng máy chủ theo thứ tự:

```nginx
upstream backend {
    server server1.example.com;
    server server2.example.com;
    server server3.example.com;
}
```

Yêu cầu 1 → server1, Yêu cầu 2 → server2, Yêu cầu 3 → server3, Yêu cầu 4 → server1...

### Robin vòng có trọng số

Một số máy chủ nhận được nhiều lưu lượng truy cập hơn:

```nginx
upstream backend {
    server server1.example.com weight=3;
    server server2.example.com weight=2;
    server server3.example.com weight=1;
}
```

Trong số 6 yêu cầu: 3 đến server1, 2 đến server2, 1 đến server3.

### Ít kết nối nhất

Yêu cầu mới gửi đến máy chủ có ít kết nối hoạt động nhất:

```nginx
upstream backend {
    least_conn;
    server server1.example.com;
    server server2.example.com;
    server server3.example.com;
}
```

### Băm IP

Các yêu cầu từ cùng một IP luôn đến cùng một máy chủ:

```nginx
upstream backend {
    ip_hash;
    server server1.example.com;
    server server2.example.com;
    server server3.example.com;
}
```

Điều này duy trì mối quan hệ phiên mà không yêu cầu lưu trữ phiên chia sẻ.

## Kiểm tra sức khỏe

Bộ cân bằng tải chỉ nên gửi lưu lượng truy cập đến các máy chủ hoạt động tốt.

### Kiểm tra tình trạng HTTP

Định cấu hình điểm cuối kiểm tra tình trạng trong ứng dụng của bạn:

```python
# Simple health check endpoint
from flask import Flask, jsonify
import psycopg2

app = Flask(__name__)

@app.route('/health')
def health_check():
    try:
        # Check database connection
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        cursor.close()
        conn.close()

        return jsonify({'status': 'healthy'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 503
```

Định cấu hình bộ cân bằng tải để sử dụng điểm cuối này:

```nginx
upstream backend {
    server 10.0.1.100:8080;
    server 10.0.1.101:8080;
    server 10.0.1.102:8080;
}

# nginx doesn't have built-in health checks in the free version
# Use nginx Plus or external monitoring
```

HAProxy đã tích hợp tính năng kiểm tra sức khỏe:

```bash
backend web_servers
    option httpchk GET /health
    http-check expect status 200
    server web1 10.0.1.100:8080 check inter 5s
    server web2 10.0.1.101:8080 check inter 5s
    server web3 10.0.1.102:8080 check inter 5s
```

### Kiểm tra tình trạng TCP

Đối với các dịch vụ không phải HTTP, hãy sử dụng kiểm tra tình trạng TCP:

```bash
backend database_servers
    mode tcp
    option tcp-check
    server db1 10.0.1.200:5432 check port 5432
    server db2 10.0.1.201:5432 check port 5432
```

## Chấm dứt SSL

Bộ cân bằng tải có thể xử lý mã hóa SSL, giảm tải trên máy chủ backend.

### Chấm dứt SSL tại Load Balancer

```nginx
server {
    listen 443 ssl http2;
    server_name app.example.com;

    ssl_certificate /etc/ssl/certs/app.example.com.crt;
    ssl_certificate_key /etc/ssl/private/app.example.com.key;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

### Truyền qua SSL

Đôi khi bạn muốn mã hóa đầu cuối:

```nginx
stream {
    upstream backend_ssl {
        server 10.0.1.100:443;
        server 10.0.1.101:443;
    }

    server {
        listen 443;
        proxy_pass backend_ssl;
        proxy_ssl on;
    }
}
```

## Cơ sở dữ liệu có tính sẵn sàng cao

Cơ sở dữ liệu yêu cầu xem xét đặc biệt để có tính sẵn sàng cao.

### Đọc bản sao

Phân phối các truy vấn đọc trên nhiều bản sao cơ sở dữ liệu:

```python
# Database connection routing
import random

WRITE_DB = "postgresql://user:pass@primary-db:5432/app"
READ_DBS = [
    "postgresql://user:pass@replica1-db:5432/app",
    "postgresql://user:pass@replica2-db:5432/app",
    "postgresql://user:pass@replica3-db:5432/app"
]

def get_db_connection(read_only=False):
    if read_only:
        return random.choice(READ_DBS)
    else:
        return WRITE_DB
```

### Chuyển đổi dự phòng sơ cấp/thứ cấp

Triển khai chuyển đổi dự phòng tự động cho cơ sở dữ liệu ghi:

```bash
# PostgreSQL streaming replication setup
# Primary server: postgresql.conf
wal_level = replica
max_wal_senders = 3
wal_keep_segments = 64

# Secondary server: recovery.conf
standby_mode = 'on'
primary_conninfo = 'host=primary-db port=5432 user=replicator'
```

Sử dụng các công cụ như Patroni để tự động chuyển đổi dự phòng:

```yaml
# patroni.yml
scope: postgres-cluster
name: postgres-node1

restapi:
  listen: 0.0.0.0:8008
  connect_address: 10.0.1.100:8008

postgresql:
  listen: 0.0.0.0:5432
  connect_address: 10.0.1.100:5432
  data_dir: /var/lib/postgresql/data

bootstrap:
  dcs:
    postgresql:
      parameters:
        wal_level: replica
        hot_standby: 'on'
        max_wal_senders: 5
```

## Cân bằng tải container

Môi trường container có những cân nhắc cân bằng tải riêng.

### Cân bằng tải Docker Swarm

Docker Swarm cung cấp tính năng cân bằng tải tích hợp:

```bash
# Create a service with multiple replicas
docker service create --name web-service \
  --replicas 3 \
  --publish 80:8080 \
  nginx

# Swarm automatically load balances between replicas
curl http://swarm-manager-ip
```

### Dịch vụ Kubernetes

Dịch vụ Kubernetes cung cấp cân bằng tải cho pod:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
  type: LoadBalancer

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
        - name: web
          image: nginx
          ports:
            - containerPort: 8080
```

Triển khai và thử nghiệm:

```bash
# Apply configuration
kubectl apply -f web-service.yaml

# Check service status
kubectl get services

# Test load balancing
kubectl get endpoints web-service
```

## Cân bằng tải toàn cầu

Đối với các ứng dụng có người dùng trên toàn thế giới, hãy phân phối lưu lượng truy cập theo địa lý.

### Cân bằng tải toàn cầu dựa trên DNS

Sử dụng DNS để định tuyến người dùng đến trung tâm dữ liệu gần nhất:

```bash
# Route53 geolocation routing example
app.example.com A 54.230.1.1    # US East
app.example.com A 54.230.2.1    # US West
app.example.com A 54.230.3.1    # Europe
app.example.com A 54.230.4.1    # Asia
```

### Cân bằng tải CDN

Mạng phân phối nội dung cung cấp cân bằng tải toàn cầu:

```bash
# CloudFlare configuration
# Users connect to nearest edge location
# Edge locations route to healthy origin servers
```

## Giám sát hiệu suất cân bằng tải

Theo dõi các số liệu chính để đảm bảo cân bằng tải của bạn hoạt động hiệu quả.

### Giám sát nginx

Kích hoạt mô-đun trạng thái nginx:

```nginx
server {
    listen 8080;
    server_name localhost;

    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
```

Kiểm tra trạng thái:

```bash
curl http://localhost:8080/nginx_status
```

### Thống kê HAProxy

Kích hoạt trang thống kê HAProxy:

```bash
# Add to haproxy.cfg
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 5s
    stats admin if TRUE
```

Xem thống kê tại `http://your-server:8404/stats`

### Số liệu ứng dụng

Giám sát số liệu cấp ứng dụng:

```python
# Track requests per backend server
import time
from collections import defaultdict

request_counts = defaultdict(int)
response_times = defaultdict(list)

def track_request(server, response_time):
    request_counts[server] += 1
    response_times[server].append(response_time)

def get_stats():
    return {
        'request_counts': dict(request_counts),
        'avg_response_times': {
            server: sum(times) / len(times)
            for server, times in response_times.items()
        }
    }
```

## Khắc phục sự cố về cân bằng tải

### Phân phối lưu lượng truy cập không đồng đều

Kiểm tra xem các yêu cầu có được phân bổ đồng đều hay không:

```bash
# Monitor backend server logs
tail -f /var/log/nginx/access.log | grep "backend_server_ip"

# Check connection counts per server
netstat -an | grep :8080 | grep ESTABLISHED | wc -l
```

### Sự cố liên tục của phiên

Nếu người dùng đăng xuất ngẫu nhiên, dữ liệu phiên có thể không được chia sẻ:

```bash
# Solution 1: Use sticky sessions (ip_hash)
upstream backend {
    ip_hash;
    server server1.example.com;
    server server2.example.com;
}

# Solution 2: Use shared session storage
# Configure Redis for session storage
```

### Kiểm tra sức khỏe không thành công

Nếu máy chủ hoạt động tốt được đánh dấu là không hoạt động:

```bash
# Check health check endpoint manually
curl -I http://backend-server:8080/health

# Review health check configuration
# Ensure timeouts are appropriate for your application
```

## Lập kế hoạch khắc phục thảm họa

Tính sẵn sàng cao vượt ra ngoài khả năng cân bằng tải để hoàn thành quá trình khắc phục thảm họa.

### Triển khai đa khu vực

Triển khai ứng dụng trên nhiều vùng địa lý:

```bash
# Primary region: us-east-1
# Secondary region: us-west-2
# Tertiary region: eu-west-1

# DNS failover routes traffic to healthy regions
```

### Sao chép dữ liệu

Đảm bảo dữ liệu được sao chép giữa các khu vực:

```bash
# Database replication
# File storage replication
# Configuration management
```

### Chuyển đổi dự phòng tự động

Thực hiện các thủ tục chuyển đổi dự phòng tự động:

```bash
#!/bin/bash
# Simple failover script
PRIMARY_HEALTH_URL="http://primary.example.com/health"
SECONDARY_HEALTH_URL="http://secondary.example.com/health"

if ! curl -f $PRIMARY_HEALTH_URL; then
    echo "Primary unhealthy, switching DNS to secondary"
    # Update DNS records to point to secondary
    aws route53 change-resource-record-sets --hosted-zone-id Z123 --change-batch file://failover.json
fi
```

Trong phần tiếp theo, chúng ta sẽ khám phá mạng container - cách Docker và Kubernetes xử lý cân bằng tải và khám phá dịch vụ trong môi trường được chứa trong container.

Cân bằng tải không chỉ đơn thuần là phân phối lưu lượng. Đó là việc tạo ra các hệ thống có khả năng phục hồi tốt, xử lý lỗi một cách khéo léo và cung cấp hiệu suất ổn định cho người dùng của bạn.

Chúc bạn cân bằng tải vui vẻ!
