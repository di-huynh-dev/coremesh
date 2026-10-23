---
title: "An ninh mạng và tường lửa"
description: Bảo vệ lưu lượng mạng, kiểm soát quyền truy cập và thực hiện các chính sách bảo mật mà không phá vỡ chức năng.
order: 4
---

An ninh mạng là việc kiểm soát ai có thể giao tiếp với cái gì, khi nào và bằng cách nào. Các chính sách bảo mật tốt sẽ bảo vệ ứng dụng của bạn trong khi vẫn cho phép lưu lượng truy cập hợp pháp được lưu chuyển. Chính sách bảo mật kém có thể khiến bạn dễ bị tổn thương hoặc phá vỡ chức năng theo những cách khó hiểu.

## Điều kiện tiên quyết

- Hiểu biết về địa chỉ IP và cổng từ các phần trước
- Truy cập thiết bị đầu cuối với đặc quyền sudo cho cấu hình tường lửa
- Hiểu biết cơ bản về các mẫu giao tiếp của ứng dụng của bạn

## Nguyên tắc cơ bản về an ninh mạng

Mọi kết nối mạng đều có ba thuộc tính chính mà bạn có thể kiểm soát:

1. **Source**: Lưu lượng truy cập đến từ đâu?
2. **Destination**: Nó đang cố gắng đi đâu?
3. **Protocol/Port**: Đây là loại giao tiếp gì?

Hãy xem những kết nối nào hiện đang tồn tại trên hệ thống của bạn:

```bash
# Show all network connections
netstat -tuln

# Show connections with process information
sudo netstat -tulnp
```

Điều này cho thấy những dịch vụ nào đang nghe và những kết nối nào đang hoạt động. Mỗi dòng thể hiện một sự cân nhắc về khả năng bảo mật.

### Tư thế bảo mật mặc định

Hầu hết các hệ thống đều bắt đầu với mạng tương đối mở. Hãy kiểm tra trạng thái tường lửa hiện tại của bạn:

```bash
# Ubuntu/Debian firewall status
sudo ufw status

# CentOS/RHEL firewall status
sudo firewall-cmd --list-all

# Raw iptables rules (Linux)
sudo iptables -L
```

Nếu bạn thấy các quy tắc "không hoạt động" hoặc tối thiểu thì hệ thống của bạn có thể đang chấp nhận tất cả các kết nối theo mặc định.

## Các loại và công cụ tường lửa

### Tường lửa dựa trên máy chủ

Tường lửa dựa trên máy chủ chạy trên các máy chủ riêng lẻ và kiểm soát lưu lượng truy cập đến/từ máy cụ thể đó.

**UFW (Ubuntu/Debian):**

```bash
# Enable the firewall
sudo ufw enable

# Allow SSH access (important - don't lock yourself out!)
sudo ufw allow ssh

# Allow specific ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow from specific IP addresses
sudo ufw allow from 192.168.1.100 to any port 22
```

Tường lửa ** (CentOS/RHEL):**

```bash
# Check current zones and rules
sudo firewall-cmd --list-all

# Allow specific services
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Allow specific ports
sudo firewall-cmd --permanent --add-port=8080/tcp

# Reload configuration
sudo firewall-cmd --reload
```

### Tường lửa dựa trên mạng

Tường lửa mạng kiểm soát lưu lượng giữa các phân đoạn mạng. Các nhà cung cấp đám mây cung cấp những thứ này dưới dạng nhóm bảo mật hoặc ACL mạng.

Ví dụ về Nhóm bảo mật **AWS:**

```bash
# Allow HTTP traffic from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id sg-12345678 \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Allow database access only from application servers
aws ec2 authorize-security-group-ingress \
  --group-id sg-database \
  --protocol tcp \
  --port 5432 \
  --source-group sg-application
```

## Cấu hình tường lửa thực tế

Hãy cấu hình chính sách tường lửa máy chủ web điển hình:

### Thiết lập máy chủ web

Bắt đầu với chính sách từ chối tất cả, sau đó cho phép rõ ràng lưu lượng truy cập cần thiết:

```bash
# Reset firewall to defaults
sudo ufw --force reset

# Default policies: deny incoming, allow outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (adjust port if you use non-standard)
sudo ufw allow 22/tcp

# Allow web traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable the firewall
sudo ufw enable
```

Kiểm tra xem máy chủ web của bạn có còn hoạt động sau khi kích hoạt tường lửa hay không.

### Bảo mật máy chủ cơ sở dữ liệu

Máy chủ cơ sở dữ liệu cần các chính sách hạn chế hơn:

```bash
# Allow database connections only from application servers
sudo ufw allow from 10.0.1.0/24 to any port 5432

# Allow SSH from management network only
sudo ufw allow from 10.0.100.0/24 to any port 22

# Deny everything else (default policy)
sudo ufw default deny incoming
```

### Cấu hình máy chủ ứng dụng

Máy chủ ứng dụng thường cần thực hiện các kết nối gửi đi:

```bash
# Allow inbound connections from load balancer
sudo ufw allow from 10.0.2.0/24 to any port 8080

# Outbound connections are allowed by default
# But you can restrict them if needed:
sudo ufw default deny outgoing
sudo ufw allow out 53      # DNS
sudo ufw allow out 80      # HTTP
sudo ufw allow out 443     # HTTPS
sudo ufw allow out 5432    # Database
```

## Phân đoạn mạng

Phân đoạn chia mạng của bạn thành các vùng có chính sách bảo mật khác nhau.

```
                           Internet
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                    DMZ (10.0.1.0/24)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │Load Balancer│  │ Web Server  │  │ Web Server  │         │
│  │10.0.1.10    │  │10.0.1.20    │  │10.0.1.21    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────┬──────────────────────────────────────┘
                      │ Firewall Rules:
                      │ ✓ HTTP/HTTPS from Internet
                      │ ✓ Limited access to Internal
                      ▼
┌────────────────────────────────────────────────────────────┐
│                Internal Zone (10.0.2.0/24)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │API Server   │  │App Server   │  │App Server   │         │
│  │10.0.2.10    │  │10.0.2.20    │  │10.0.2.21    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────┬──────────────────────────────────────┘
                      │ Firewall Rules:
                      │ ✓ Access from DMZ only
                      │ ✓ Specific ports to Secure Zone
                      ▼
┌───────────────────────────────────────────────────────────┐
│                 Secure Zone (10.0.3.0/24)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Database     │  │File Server  │  │Backup       │        │
│  │10.0.3.10    │  │10.0.3.20    │  │10.0.3.30    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                           │
│  Firewall Rules:                                          │
│  ✓ Access from Internal Zone only                         │
│  ✓ Management access from Admin network                   │
│  ✗ No direct Internet access                              │
└───────────────────────────────────────────────────────────┘
```

### Vùng mạng cơ bản

**DMZ (Khu phi quân sự)**: Máy chủ công khai

```bash
# DMZ subnet: 10.0.1.0/24
# - Web servers
# - Load balancers
# - Reverse proxies
# Allow: Internet → DMZ (ports 80, 443)
# Allow: DMZ → Internal (specific ports only)
```

**Internal Zone**: Máy chủ ứng dụng

```bash
# Internal subnet: 10.0.2.0/24
# - Application servers
# - API services
# - Microservices
# Allow: DMZ → Internal (application ports)
# Deny: Internet → Internal
```

**Vùng bảo mật**: Dữ liệu và quản lý

```bash
# Secure subnet: 10.0.3.0/24
# - Database servers
# - File servers
# - Management tools
# Allow: Internal → Secure (specific ports)
# Allow: Management → Secure (SSH, monitoring)
# Deny: DMZ → Secure, Internet → Secure
```

### Thực hiện phân đoạn

Sử dụng mạng con và quy tắc tường lửa để thực thi phân đoạn:

```bash
# Allow web servers to reach app servers
sudo ufw allow from 10.0.1.0/24 to 10.0.2.0/24 port 8080

# Allow app servers to reach databases
sudo ufw allow from 10.0.2.0/24 to 10.0.3.0/24 port 5432

# Deny direct web-to-database connections
sudo ufw deny from 10.0.1.0/24 to 10.0.3.0/24
```

## Bảo mật container

Môi trường container cần cân nhắc bảo mật đặc biệt.

### Bảo mật mạng Docker

Theo mặc định, Docker container có thể liên lạc với nhau một cách tự do:

```bash
# Create isolated networks for different applications
docker network create --driver bridge app1-network
docker network create --driver bridge app2-network

# Run containers on isolated networks
docker run --network app1-network --name app1-web nginx
docker run --network app1-network --name app1-db postgres

docker run --network app2-network --name app2-web nginx
docker run --network app2-network --name app2-db postgres
```

container trên các mạng khác nhau không thể giao tiếp trừ khi được kết nối rõ ràng.

### Chính sách mạng Kubernetes

Kubernetes cho phép các chính sách mạng chi tiết:

```yaml
# NetworkPolicy: Allow only specific pod-to-pod communication
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

Áp dụng các chính sách sau:

```bash
# Apply network policies
kubectl apply -f network-policies.yaml

# Verify policies are active
kubectl get networkpolicies -n production
```

## Xác thực dịch vụ với dịch vụ

Chỉ an ninh mạng thôi là chưa đủ. Các dịch vụ nên xác thực lẫn nhau.

### Khóa API và mã thông báo

Các dịch vụ có thể xác thực bằng khóa API:

```bash
# Service A calls Service B with authentication
curl -H "Authorization: Bearer $API_TOKEN" \
  http://service-b.internal.com/api/data
```

### TLS tương hỗ (mTLS)

Đối với môi trường có độ bảo mật cao, hãy sử dụng TLS chung trong đó cả máy khách và máy chủ đều xác thực:

```bash
# Client provides certificate to server
curl --cert client.pem --key client-key.pem \
  --cacert ca.pem \
  https://secure-service.internal.com/api
```

### Lưới dịch vụ

Các công cụ lưới dịch vụ như Istio cung cấp mTLS tự động:

```yaml
# Istio: Require mTLS for all service communication
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: require-mtls
  namespace: production
spec:
  mtls:
    mode: STRICT
```

## Giám sát và ghi nhật ký

Chính sách bảo mật chỉ có hiệu quả nếu bạn giám sát chúng.

### Giám sát kết nối

Giám sát các kết nối đang hoạt động để phát hiện các mẫu bất thường:

```bash
# Watch active connections in real-time
watch 'netstat -tuln | grep ESTABLISHED'

# Log connection attempts
sudo ufw logging on
tail -f /var/log/ufw.log
```

### Nỗ lực kết nối không thành công

Kết nối không thành công thường cho thấy các cuộc tấn công hoặc cấu hình sai:

```bash
# Check for blocked connections in UFW logs
sudo grep "BLOCK" /var/log/ufw.log

# Look for patterns in failed attempts
sudo grep "DPT=22" /var/log/ufw.log | grep "BLOCK"
```

### Giám sát cấp ứng dụng

Giám sát ứng dụng của bạn để phát hiện lỗi xác thực:

```bash
# Web server access logs
tail -f /var/log/nginx/access.log | grep "401\|403"

# Application logs
tail -f /var/log/app/auth.log | grep "FAILED"
```

## Những lỗi bảo mật phổ biến

### Quy tắc quá dễ dãi

Tránh các quy tắc cho phép truy cập quá nhiều:

```bash
# Bad: Allow everything from internal network
sudo ufw allow from 10.0.0.0/8

# Better: Allow specific services from specific subnets
sudo ufw allow from 10.0.1.0/24 to any port 8080
sudo ufw allow from 10.0.2.0/24 to any port 5432
```

### Quên các quy tắc gửi đi

Đừng quên rằng các dịch vụ bị xâm phạm có thể tạo kết nối ra ngoài:

```bash
# Consider restricting outbound connections
sudo ufw default deny outgoing

# Then explicitly allow needed outbound traffic
sudo ufw allow out 53   # DNS
sudo ufw allow out 80   # HTTP
sudo ufw allow out 443  # HTTPS
```

### Không kiểm tra các thay đổi

Luôn kiểm tra các thay đổi của tường lửa trước khi áp dụng chúng cho production:

```bash
# Test firewall rules in a non-production environment first
# Use automation to apply consistent rules across environments

# Keep a rollback plan ready
sudo ufw disable  # Emergency rollback command
```

## Các mẫu bảo mật nâng cao

### Mạng Zero Trust

Zero Trust cho rằng không có vị trí mạng nào đáng tin cậy:

```bash
# Every connection requires authentication
# Even "internal" services verify each request
# Network location grants no implicit access
```

### Phòng thủ nhiều lớp

Kiểm soát bảo mật nhiều lớp:

1. **Tường lửa mạng**: Kiểm soát lưu lượng giữa các phân đoạn
2. **Tường lửa máy chủ**: Kiểm soát lưu lượng đến các máy chủ riêng lẻ
3. **Xác thực ứng dụng**: Xác minh mọi yêu cầu
4. **Encryption**: Bảo vệ dữ liệu khi truyền
5. **Monitoring**: Phát hiện các mẫu bất thường

### Giới hạn tỷ lệ

Bảo vệ chống lạm dụng với giới hạn tỷ lệ:

```bash
# nginx rate limiting example
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
        }
    }
}
```

## Nhóm bảo mật đám mây

Các nhà cung cấp đám mây cung cấp bảo mật mạng như một dịch vụ:

### Nhóm bảo mật AWS

Các nhóm bảo mật hoạt động như tường lửa ảo:

```bash
# Create security group
aws ec2 create-security-group \
  --group-name web-servers \
  --description "Security group for web servers"

# Add rules
aws ec2 authorize-security-group-ingress \
  --group-id sg-12345678 \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-12345678 \
  --protocol tcp --port 443 --cidr 0.0.0.0/0
```

### ACL mạng

ACL mạng cung cấp tính năng lọc cấp mạng con:

```bash
# Network ACLs are stateless (must allow both inbound and outbound)
# Security groups are stateful (return traffic is automatically allowed)
```

## Khắc phục sự cố bảo mật

### Kết nối bị từ chối so với thời gian chờ kết nối

Các thông báo lỗi khác nhau cho biết các vấn đề khác nhau:

```bash
# Connection refused: Service is reachable but not listening on port
telnet server.com 80
# Immediate "Connection refused" = firewall allows, service unavailable

# Connection timeout: Firewall blocking or network unreachable
telnet server.com 80
# Hangs then times out = firewall blocking or routing problem
```

### Kiểm tra quy tắc tường lửa

Xác minh quy tắc hoạt động như mong đợi:

```bash
# Test from allowed source
ssh user@allowed-ip "curl -I http://your-server"

# Test from blocked source
ssh user@blocked-ip "curl -I http://your-server"

# Check firewall logs for blocked attempts
sudo tail -f /var/log/ufw.log
```

Trong phần tiếp theo, chúng ta sẽ khám phá cân bằng tải và tính sẵn sàng cao - phân phối lưu lượng truy cập trên nhiều máy chủ trong khi vẫn duy trì ranh giới bảo mật.

An ninh mạng là tìm kiếm sự cân bằng phù hợp giữa bảo vệ và chức năng. Bắt đầu với các chính sách hạn chế và chỉ cho phép lưu lượng truy cập mà ứng dụng của bạn cần một cách rõ ràng.

Chúc mừng bảo mật!
