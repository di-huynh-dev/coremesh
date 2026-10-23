---
title: "Quản lý DNS và tên miền"
description: Cách tên miền phân giải thành địa chỉ IP và quản lý bản ghi DNS cho ứng dụng của bạn.
order: 3
---

DNS dịch tên miền mà con người có thể đọc được thành địa chỉ IP mà máy tính sử dụng để liên lạc. Khi DNS bị hỏng, mọi thứ đều bị hỏng - người dùng không thể truy cập trang web của bạn, các API không thể giao tiếp và các dịch vụ bị lỗi theo những cách khó hiểu. Hiểu DNS giúp bạn khắc phục những sự cố này và đặt cấu hình khám phá dịch vụ đáng tin cậy.

## Điều kiện tiên quyết

- Hiểu về địa chỉ IP từ Phần 2
- Truy cập thiết bị đầu cuối để kiểm tra các lệnh DNS
- Tùy chọn: Tên miền bạn kiểm soát (để cấu hình thực hành)

## Cách hoạt động của độ phân giải DNS

Khi bạn nhập `api.github.com` vào trình duyệt, máy tính của bạn cần tìm địa chỉ IP. Đây là những gì thực sự xảy ra:

1. Kiểm tra bộ đệm cục bộ (máy tính của bạn ghi nhớ các lần tra cứu gần đây)
2. Hỏi máy chủ DNS đã định cấu hình của bạn (thường là ISP của bạn hoặc 8.8.8.8)
3. Máy chủ đó có thể yêu cầu máy chủ DNS gốc cung cấp thông tin `.com`
4. Cuối cùng ai đó trả lại địa chỉ IP như `140.82.112.3`
5. Trình duyệt của bạn kết nối với địa chỉ IP đó

Hãy theo dõi quá trình này:

```bash
# See basic DNS resolution
nslookup api.github.com

# Get more detailed information
dig api.github.com

# Trace the full resolution path
dig +trace api.github.com
```

Tùy chọn `+trace` hiển thị từng bước trong quy trình giải quyết, điều này rất có giá trị trong việc gỡ lỗi các sự cố DNS.

## Các loại bản ghi DNS

DNS lưu trữ các loại thông tin khác nhau bằng cách sử dụng nhiều loại bản ghi khác nhau. Dưới đây là những thứ bạn sẽ gặp thường xuyên nhất:

### A Bản ghi: Địa chỉ IPv4

Bản ghi ánh xạ tên miền tới địa chỉ IPv4:

```bash
# Look up A records
dig api.stripe.com A
```

Bạn sẽ thấy đầu ra như:

```
api.stripe.com.    300    IN    A    54.187.174.169
api.stripe.com.    300    IN    A    54.187.205.235
```

Nhiều bản ghi A cung cấp khả năng cân bằng tải và dự phòng. Máy tính của bạn sẽ thử các địa chỉ IP khác nếu một địa chỉ bị lỗi.

### Bản ghi AAAA: Địa chỉ IPv6

Bản ghi AAAA hoạt động giống như bản ghi A nhưng dành cho IPv6:

```bash
# Check for IPv6 addresses
dig google.com AAAA
```

### Bản ghi CNAME: Bí danh

Bản ghi CNAME tạo bí danh trỏ đến các tên miền khác:

```bash
# Many CDNs use CNAME records
dig www.github.com CNAME
```

Bạn có thể thấy:

```
www.github.com.    3600    IN    CNAME    github.com.
```

Điều này có nghĩa `www.github.com` là bí danh của `github.com`.

### Bản ghi MX: Máy chủ thư

Bản ghi MX chỉ định nơi email sẽ được gửi:

```bash
# Check mail servers
dig github.com MX
```

Đầu ra hiển thị số ưu tiên (thấp hơn = mức ưu tiên cao hơn) và tên máy chủ máy chủ thư.

### Bản ghi TXT: Văn bản tùy ý

Bản ghi TXT lưu trữ thông tin văn bản, thường được sử dụng để xác minh và cấu hình:

```bash
# TXT records often contain verification tokens
dig github.com TXT
```

Bạn sẽ thấy các bản ghi được sử dụng để xác minh miền, chính sách bảo mật email và siêu dữ liệu khác.

## Bộ nhớ đệm DNS và TTL

Phản hồi DNS bao gồm giá trị TTL (Thời gian tồn tại) cho khách hàng biết thời gian lưu thông tin vào bộ đệm:

```bash
# Notice the TTL values in DNS responses
dig api.example.com
```

Tìm kiếm các số như `300` hoặc `3600` trong đầu ra - đây là các giá trị TTL tính bằng giây.

### Tại sao bộ nhớ đệm lại quan trọng

Bộ nhớ đệm DNS cải thiện hiệu suất nhưng có thể gây nhầm lẫn:

- **TTL ngắn (60-300 giây)**: Các thay đổi có hiệu lực nhanh chóng nhưng có nhiều truy vấn DNS hơn
- **Long TTL (3600+ giây)**: Hiệu suất tốt hơn nhưng các thay đổi lan truyền chậm

Khi bạn cập nhật bản ghi DNS, các giá trị cũ được lưu trong bộ nhớ đệm có thể vẫn tồn tại cho đến khi TTL của chúng hết hạn.

### Xóa bộ đệm DNS

Đôi khi bạn cần xóa các mục DNS được lưu trong bộ nhớ cache:

```bash
# Linux: flush systemd-resolved cache
sudo systemd-resolve --flush-caches

# macOS: flush DNS cache
sudo dscacheutil -flushcache

# Windows: flush DNS resolver cache
ipconfig /flushdns
```

## Thiết lập bản ghi DNS

Nếu quản lý một miền, bạn sẽ định cấu hình bản ghi DNS thông qua công ty đăng ký hoặc nhà cung cấp DNS của mình.

### Cấu hình DNS chung

Đây là thiết lập DNS điển hình cho ứng dụng web:

```bash
# Main website
example.com         A      203.0.113.10
www.example.com     CNAME  example.com

# API endpoint
api.example.com     A      203.0.113.20

# Mail servers
example.com         MX     10 mail.example.com
mail.example.com    A      203.0.113.30

# Verification and security
example.com         TXT    "v=spf1 include:_spf.google.com ~all"
```

### Tuyên truyền DNS

Sau khi thay đổi bản ghi DNS, những thay đổi đó cần được phổ biến trên internet. Quá trình này có thể mất từ vài phút đến 48 giờ, tùy thuộc vào giá trị TTL và bộ nhớ đệm.

Kiểm tra sự lan truyền từ các vị trí khác nhau:

```bash
# Check from different DNS servers
dig @8.8.8.8 example.com
dig @1.1.1.1 example.com
dig @208.67.222.222 example.com
```

Các máy chủ DNS khác nhau có thể trả về các kết quả khác nhau trong quá trình truyền bá.

## Khắc phục sự cố DNS

Sự cố DNS thường biểu hiện dưới dạng sự cố kết nối không liên tục và khó chẩn đoán.

### Các sự cố DNS thường gặp

**DDomain hoàn toàn không giải quyết được:**

```bash
# Test basic resolution
nslookup problematic-domain.com
```

Nếu điều này không thành công thì có nghĩa là miền không tồn tại hoặc máy chủ DNS của bạn không thể kết nối với các máy chủ có thẩm quyền.

**Độ phân giải DNS chậm:**

```bash
# Time DNS lookups
time nslookup slow-domain.com
```

Nếu truy vấn DNS mất hơn vài giây, bạn có thể gặp sự cố với máy chủ DNS.

**Kết quả không nhất quán:**

```bash
# Query multiple DNS servers
dig @8.8.8.8 inconsistent-domain.com
dig @1.1.1.1 inconsistent-domain.com
```

Các kết quả khác nhau cho biết sự cố truyền hoặc sự cố máy chủ DNS.

### Cấu hình máy chủ DNS

Kiểm tra máy chủ DNS nào mà hệ thống của bạn sử dụng:

```bash
# Linux/macOS: check resolver configuration
cat /etc/resolv.conf

# Show current DNS settings
systemd-resolve --status
```

Bạn sẽ thấy các mục như:

```
nameserver 8.8.8.8
nameserver 8.8.4.4
```

Nếu bạn gặp sự cố DNS, hãy thử chuyển sang máy chủ DNS khác:

- Google: `8.8.8.8`, `8.8.4.4`
- Đám mây bùng phát: `1.1.1.1`, `1.0.0.1`
- OpenDNS: `208.67.222.222`, `208.67.220.220`

## DNS trong phát triển ứng dụng

Các ứng dụng hiện đại thường sử dụng DNS để khám phá và cấu hình dịch vụ.

### DNS dành riêng cho môi trường

Sử dụng các tên DNS khác nhau cho các môi trường khác nhau:

```bash
# Development
api-dev.example.com     A    10.0.1.100

# Staging
api-staging.example.com A    10.0.2.100

# Production
api.example.com         A    203.0.113.100
```

Điều này cho phép bạn sử dụng cùng một mã ứng dụng trên các môi trường bằng cách chỉ thay đổi cấu hình DNS.

### Chuỗi kết nối cơ sở dữ liệu

Thay vì mã hóa địa chỉ IP, hãy sử dụng tên DNS:

```python
# Instead of hardcoding IP addresses
DATABASE_URL = "postgresql://user:pass@10.0.3.100:5432/app"

# Use DNS names for flexibility
DATABASE_URL = "postgresql://user:pass@db.internal.example.com:5432/app"
```

Điều này giúp việc di chuyển các dịch vụ hoặc thực hiện cân bằng tải trở nên dễ dàng hơn.

### Kiểm tra sức khỏe và DNS

Một số ứng dụng sử dụng DNS để kiểm tra tình trạng:

```bash
# Remove unhealthy servers from DNS
# Healthy servers: api.example.com points to multiple IPs
dig api.example.com A

# If one server fails, remove its A record
# Users automatically use remaining healthy servers
```

## Cân nhắc về bảo mật DNS

Lưu lượng DNS thường không được mã hóa, điều này tạo ra rủi ro bảo mật.

### DNS qua HTTPS (DoH)

Các trình duyệt hiện đại hỗ trợ DNS qua HTTPS, mã hóa các truy vấn DNS:

```bash
# Test DNS over HTTPS
curl -H 'accept: application/dns-json' \
  'https://cloudflare-dns.com/dns-query?name=example.com&type=A'
```

### Lọc và chặn DNS

Một số mạng chặn hoặc chuyển hướng truy vấn DNS:

```bash
# Test if DNS is being filtered
dig @8.8.8.8 blocked-site.example.com
dig @1.1.1.1 blocked-site.example.com
```

Nếu kết quả khác biệt đáng kể thì quá trình lọc DNS có thể đang diễn ra.

## Khám phá dịch vụ và DNS động

Trong môi trường đám mây, địa chỉ IP thay đổi thường xuyên. DNS có thể cung cấp khả năng khám phá dịch vụ động.

### DNS container

Nền tảng container thường cung cấp DNS tích hợp:

```bash
# In Docker, containers can reach each other by name
docker run --name database postgres
docker run --name webapp --link database myapp

# webapp can connect to "database" hostname
```

### DNS Kubernetes

Kubernetes tự động tạo các mục DNS cho các dịch vụ:

```bash
# Services get DNS names automatically
kubectl create service clusterip my-service --tcp=80:8080

# Other pods can reach: my-service.default.svc.cluster.local
```

### Dịch vụ DNS đám mây

Các nhà cung cấp đám mây cung cấp DNS được quản lý tích hợp API:

```bash
# AWS Route 53 health checks
# Automatically remove unhealthy targets from DNS

# Azure Traffic Manager
# Route traffic based on performance or geography

# Google Cloud DNS
# Integrate with load balancers and auto-scaling
```

## Tối ưu hóa hiệu suất DNS

Hiệu suất DNS ảnh hưởng đến khả năng phản hồi của ứng dụng.

### Kết nối tổng hợp và DNS

Các ứng dụng thực hiện nhiều yêu cầu gửi đi nên xem xét việc lưu trữ DNS:

```python
# Python example: cache DNS lookups
import socket
socket.getaddrinfo('api.example.com', 443)  # Cached after first lookup
```

### Tìm nạp trước DNS

Đối với các ứng dụng web, tìm nạp trước DNS cho các tài nguyên bên ngoài:

```html
<!-- Preload DNS for external assets -->
<link rel="dns-prefetch" href="//fonts.googleapis.com" />
<link rel="dns-prefetch" href="//cdn.example.com" />
```

### Giám sát hiệu suất DNS

Giám sát thời gian phân giải DNS như một phần của hiệu suất ứng dụng:

```bash
# Simple DNS timing
time nslookup api.example.com

# More detailed timing with dig
dig api.example.com | grep "Query time"
```

## Kiểm tra DNS cục bộ

Để phát triển, bạn có thể ghi đè DNS cục bộ:

### Tập tin /etc/hosts

Thêm mục bỏ qua DNS để kiểm tra:

```bash
# Edit /etc/hosts (requires sudo)
sudo vim /etc/hosts

# Add test entries
127.0.0.1 local-api.example.com
10.0.1.100 staging-api.example.com
```

Các ứng dụng sẽ sử dụng các ánh xạ này thay vì truy vấn DNS.

### Máy chủ DNS cục bộ

Chạy máy chủ DNS cục bộ để phát triển:

```bash
# dnsmasq provides simple local DNS
# Add to /etc/dnsmasq.conf:
address=/dev.example.com/127.0.0.1
address=/test.example.com/10.0.1.100
```

Điều này cho phép bạn kiểm soát DNS cục bộ linh hoạt hơn.

## Giám sát và cảnh báo DNS

Lỗi DNS có thể rất nhỏ nhưng có sức tàn phá lớn. Theo dõi tình trạng DNS một cách chủ động:

```bash
# Simple DNS monitoring script
#!/bin/bash
DOMAIN="api.example.com"
IP=$(dig +short $DOMAIN | head -n1)
if [ -z "$IP" ]; then
    echo "DNS resolution failed for $DOMAIN"
    # Send alert
fi
```

Giám sát production nên kiểm tra:

- Thời gian phân giải DNS
- Ghi lại tính nhất quán trên nhiều máy chủ DNS
- tuân thủ TTL
- Gia hạn chứng chỉ cho tên miền

Trong phần tiếp theo, chúng ta sẽ tìm hiểu về bảo mật mạng và tường lửa - bảo vệ các kênh liên lạc mà DNS giúp thiết lập.

DNS thường vô hình khi nó hoạt động bình thường, nhưng khi nó bị hỏng thì mọi thứ đều ngừng hoạt động. Đầu tư thời gian để tìm hiểu cấu hình DNS của bạn và chủ động theo dõi nó.

Chúc mừng giải quyết!
