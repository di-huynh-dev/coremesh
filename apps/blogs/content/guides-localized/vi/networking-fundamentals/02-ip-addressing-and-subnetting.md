---
title: "Địa chỉ IP và mạng con"
description: Lập kế hoạch và quản lý không gian địa chỉ IP cho các ứng dụng, container và cơ sở hạ tầng đám mây.
order: 2
---

Địa chỉ IP có thể trông đơn giản nhưng việc lập kế hoạch địa chỉ phù hợp sẽ giúp bạn tránh phải đau đầu khi cơ sở hạ tầng của bạn phát triển. Cho dù bạn đang thiết lập môi trường phát triển, thiết kế kiến trúc đám mây hay khắc phục sự cố kết nối, việc hiểu cách hoạt động của địa chỉ IP sẽ tiết kiệm thời gian và ngăn ngừa xung đột.

## Điều kiện tiên quyết

- Hiểu biết về mạng cơ bản từ Phần 1
- Truy cập thiết bị đầu cuối để kiểm tra các lệnh
- Không cần dụng cụ đặc biệt

## Cấu trúc địa chỉ IP

Địa chỉ IPv4 như `192.168.1.100` đại diện cho một số 32 bit được chia thành bốn phần. Nhưng có nhiều cấu trúc hơn những gì bạn thấy.

Hãy kiểm tra cấu hình IP hiện tại của bạn:

```bash
# Show your network interfaces and IP addresses
ip addr show
```

Bạn sẽ thấy đầu ra như:

```
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic eth0
```

Phần `/24` rất quan trọng - nó cho bạn biết bao nhiêu địa chỉ xác định mạng so với các máy chủ riêng lẻ.

### Hiểu mặt nạ mạng con

Ký hiệu `/24` có nghĩa là 24 bit đầu tiên xác định mạng, để lại 8 bit cho địa chỉ máy chủ:

- Phần mạng: `10.0.2` (24 bit đầu tiên)
- Phần máy chủ: `.15` (8 bit cuối)
- Địa chỉ máy chủ có sẵn: `10.0.2.1` đến `10.0.2.254`

Bạn mất hai địa chỉ trong mỗi mạng con:

- Địa chỉ mạng: `10.0.2.0` (xác định chính mạng đó)
- Địa chỉ quảng bá: `10.0.2.255` (gửi tới tất cả các máy chủ trên mạng)

### Kích thước mạng con phổ biến

Kích thước mạng con khác nhau cung cấp cho bạn số lượng địa chỉ máy chủ khác nhau:

```bash
/24 = 254 usable host addresses (common for small networks)
/16 = 65,534 usable host addresses (medium networks)
/8  = 16,777,214 usable host addresses (very large networks)
```

Sử dụng máy tính mạng con để xác minh phép toán của bạn:

```bash
# Install ipcalc if available
sudo apt install ipcalc

# Calculate subnet information
ipcalc 192.168.1.0/24
```

## Địa chỉ IP riêng tư và công cộng

Không phải tất cả các địa chỉ IP đều có thể truy cập được từ internet. Ba phạm vi được dành riêng cho mục đích sử dụng cá nhân:

### Tư nhân hạng A: 10.0.0.0/8

Điều này mang lại cho bạn hơn 16 triệu địa chỉ, hoàn hảo cho các tổ chức lớn:

```bash
# Example: Enterprise network design
10.1.0.0/16    # New York office (65k addresses)
10.2.0.0/16    # London office (65k addresses)
10.3.0.0/16    # Cloud infrastructure (65k addresses)
```

### Riêng loại B: 172.16.0.0/12

Docker sử dụng phạm vi này theo mặc định:

```bash
# Check Docker's network configuration
docker network ls
docker network inspect bridge
```

Bạn sẽ thấy Docker gán các địa chỉ như `172.17.0.0/16` cho giao tiếp container.

### Riêng tư loại C: 192.168.0.0/16

Hầu hết các bộ định tuyến gia đình đều sử dụng phạm vi này:

```bash
# Common home network setups
192.168.1.0/24   # Main network
192.168.2.0/24   # Guest network
192.168.100.0/24 # IoT devices
```

## Dịch địa chỉ mạng (NAT)

Địa chỉ riêng không thể giao tiếp trực tiếp với internet. NAT giải quyết vấn đề này bằng cách dịch giữa địa chỉ riêng và địa chỉ công cộng.

```
Private Network (192.168.1.0/24)      │      Internet
                                      │
┌─────────────┐                       │    ┌─────────────┐
│ Laptop      │                       │    │ Google      │
│192.168.1.100│────┐                  │    │8.8.8.8      │
└─────────────┘    │                  │    └─────────────┘
                   │   ┌──────────┐   │           ▲
┌─────────────┐    └───│ Router/  │───┼───────────┘
│ Phone       │        │ NAT      │   │
│192.168.1.101│────────│Gateway   │   │
└─────────────┘        │          │   │
                       │Public IP:│   │
                       │203.0.113.│   │
                       │50        │   │
                       └──────────┘   │

NAT Translation Table:
Internal IP:Port    ←→    External IP:Port
192.168.1.100:5000  ←→    203.0.113.50:12345
192.168.1.101:3000  ←→    203.0.113.50:12346
```

Khi máy tính xách tay có IP `192.168.1.100` của bạn thực hiện yêu cầu web:

1. Yêu cầu của bạn: `192.168.1.100:5000 → google.com:443`
2. Bộ định tuyến dịch: `203.0.113.50:12345 → google.com:443`
3. Phản hồi: `google.com:443 → 203.0.113.50:12345`
4. Bộ định tuyến dịch ngược lại: `google.com:443 → 192.168.1.100:5000`

Kiểm tra địa chỉ IP công cộng của bạn:

```bash
# See your public IP as the internet sees it
curl ifconfig.me
```

Địa chỉ này có thể khác với địa chỉ IP cục bộ của bạn được hiển thị bởi `ip addr show`.

## Mạng con thực tế

Giả sử bạn đang thiết lập cơ sở hạ tầng và cần tổ chức các loại máy chủ khác nhau. Bắt đầu với `10.0.0.0/16`, bạn có thể chia nó như thế này:

```
Main Network: 10.0.0.0/16 (65,536 addresses)
│
├── Web Servers: 10.0.1.0/24 (254 addresses)
│   ├── 10.0.1.1 - nginx-1
│   ├── 10.0.1.2 - nginx-2
│   └── 10.0.1.3 - nginx-3
│
├── App Servers: 10.0.2.0/24 (254 addresses)
│   ├── 10.0.2.1 - api-1
│   ├── 10.0.2.2 - api-2
│   └── 10.0.2.3 - api-3
│
├── Databases: 10.0.3.0/27 (30 addresses)
│   ├── 10.0.3.1 - postgres-primary
│   ├── 10.0.3.2 - postgres-replica
│   └── 10.0.3.3 - redis-cache
│
└── Management: 10.0.4.0/26 (62 addresses)
    ├── 10.0.4.1 - monitoring
    ├── 10.0.4.2 - logging
    └── 10.0.4.3 - backup
```

Cách tiếp cận này cung cấp cho mỗi loại dịch vụ phân đoạn mạng riêng, giúp đưa ra các chính sách bảo mật và khắc phục sự cố.

### Mạng con có độ dài thay đổi

Bạn không cần phải tạo tất cả các mạng con có cùng kích thước. Điều chỉnh dựa trên nhu cầu thực tế của bạn:

```bash
# Large subnet for development machines
10.0.10.0/24   # 254 addresses

# Small subnet for production databases
10.0.20.0/28   # 14 addresses

# Medium subnet for staging environment
10.0.30.0/26   # 62 addresses
```

## Quy hoạch mạng đám mây

Môi trường đám mây yêu cầu lập kế hoạch IP cẩn thận để tránh xung đột và cho phép kết nối giữa các dịch vụ.

### Ví dụ về AWS VPC

Đây là cách bạn có thể thiết kế AWS VPC:

```bash
# Main VPC: 10.0.0.0/16 (65,536 total addresses)

# Public subnets (for load balancers, NAT gateways)
10.0.1.0/24    # us-east-1a public (254 addresses)
10.0.2.0/24    # us-east-1b public (254 addresses)

# Private subnets (for application servers)
10.0.10.0/24   # us-east-1a private (254 addresses)
10.0.20.0/24   # us-east-1b private (254 addresses)

# Database subnets (highly restricted access)
10.0.100.0/28  # us-east-1a database (14 addresses)
10.0.100.16/28 # us-east-1b database (14 addresses)
```

Thiết kế này cung cấp nhiều vùng khả dụng trong khi vẫn tách biệt các tầng khác nhau.

### Cân nhắc về nhiều đám mây

Nếu bạn đang sử dụng nhiều nhà cung cấp đám mây hoặc kết nối với mạng tại chỗ, hãy tránh các dải IP chồng chéo:

```bash
# AWS environment
10.1.0.0/16

# Azure environment
10.2.0.0/16

# Google Cloud environment
10.3.0.0/16

# On-premises office
10.10.0.0/16
```

Điều này ngăn xung đột định tuyến khi bạn thiết lập kết nối VPN giữa các môi trường.

## Quy hoạch mạng container

Nền tảng container tự động tạo mạng nhưng hiểu được địa chỉ sẽ giúp khắc phục sự cố.

### Mạng Docker

Docker tạo một số mạng theo mặc định:

```bash
# List Docker networks
docker network ls

# Examine the default bridge network
docker network inspect bridge
```

Bạn sẽ thấy Docker thường sử dụng `172.17.0.0/16` cho mạng cầu nối mặc định. Khi bạn chạy container, chúng sẽ nhận được địa chỉ từ phạm vi này.

Tạo mạng tùy chỉnh để tổ chức tốt hơn:

```bash
# Create a network for a specific application
docker network create --subnet=10.5.0.0/16 ecommerce-network

# Run containers on the custom network
docker run --network ecommerce-network --name web nginx
docker run --network ecommerce-network --name db postgres
```

container trên cùng một mạng có thể giao tiếp bằng cách sử dụng tên container làm tên máy chủ.

### Mạng Kubernetes

Kubernetes sử dụng mạng phức tạp hơn nhưng vẫn áp dụng các nguyên tắc tương tự:

```bash
# See pod network assignments
kubectl get pods -o wide

# Check node network configuration
kubectl describe node <node-name>
```

Kubernetes thường sử dụng không gian địa chỉ lớn như `10.244.0.0/16` cho mạng pod.

## Khắc phục sự cố về địa chỉ IP

### Giải quyết xung đột

Khi hai thiết bị có cùng địa chỉ IP, bạn sẽ thấy kết nối không liên tục:

```bash
# Test for IP conflicts
ping 192.168.1.100
arping 192.168.1.100

# Check ARP table for inconsistencies
arp -a
```

Nếu bạn thấy các địa chỉ MAC khác nhau cho cùng một IP thì bạn có xung đột.

### Sự cố DHCP

DHCP tự động gán địa chỉ IP, nhưng có thể bị lỗi:

```bash
# Force a new DHCP lease
sudo dhclient -r  # Release current lease
sudo dhclient     # Request new lease

# Check current lease information
cat /var/lib/dhcp/dhclient.leases
```

### Sự cố định tuyến

Đôi khi bạn có thể truy cập một số mạng nhưng không thể truy cập các mạng khác:

```bash
# Check your routing table
ip route show

# Add a temporary route if needed
sudo ip route add 10.5.0.0/16 via 192.168.1.1
```

Bảng định tuyến hiển thị nơi các gói đi đến các mạng đích khác nhau.

## Phát hiện chồng chéo mạng

Trước khi kết nối các mạng mới, hãy kiểm tra sự chồng chéo:

```bash
# Show all your current network routes
ip route show

# Look for conflicts before adding VPN or new segments
# For example, if you see 192.168.1.0/24 locally,
# don't use the same range for a VPN connection
```

Mạng chồng chéo gây ra sự nhầm lẫn về định tuyến và các vấn đề kết nối.

## Khái niệm cơ bản về IPv6

Việc áp dụng IPv6 đang ngày càng tăng, đặc biệt là trong môi trường đám mây. Địa chỉ hoạt động khác nhau:

```bash
# Check IPv6 configuration
ip -6 addr show

# Test IPv6 connectivity
ping6 google.com
```

Địa chỉ IPv6 dài hơn nhiều (`2001:db8:85a3::8a2e:370:7334`) nhưng các khái niệm mạng con thì tương tự nhau. Điểm khác biệt chính là IPv6 cung cấp rất nhiều địa chỉ mà bạn không cần phải cẩn thận trong việc bảo tồn.

## Tài liệu mạng

Khi cơ sở hạ tầng của bạn phát triển, hãy ghi lại việc phân bổ IP của bạn:

```bash
# Keep a simple text file or spreadsheet:
# Network Plan for Production Environment
#
# 10.0.0.0/16 - Main VPC
# ├── 10.0.1.0/24 - Public subnet AZ-a (load balancers)
# ├── 10.0.2.0/24 - Public subnet AZ-b (load balancers)
# ├── 10.0.10.0/24 - Private subnet AZ-a (app servers)
# ├── 10.0.20.0/24 - Private subnet AZ-b (app servers)
# └── 10.0.100.0/28 - Database subnet (restricted access)
```

Điều này ngăn ngừa xung đột và giúp các thành viên mới trong nhóm hiểu được thiết kế mạng của bạn.

## Cân nhắc về hiệu suất

Thiết kế mạng ảnh hưởng đến hiệu suất theo những cách tinh tế:

### Miền phát sóng

Mạng con lớn hơn tạo ra miền quảng bá lớn hơn:

```bash
# Small subnet: 10.0.1.0/28 (14 hosts)
# - Less broadcast traffic
# - Better performance
# - Easier to troubleshoot

# Large subnet: 10.0.1.0/22 (1022 hosts)
# - More broadcast traffic
# - Potential performance issues
# - Harder to isolate problems
```

### Truyền thông giữa các mạng con

Giao tiếp trong cùng một mạng con thường nhanh hơn:

```bash
# Same subnet: Direct communication
# 192.168.1.10 → 192.168.1.20 (fast)

# Different subnets: Requires routing
# 192.168.1.10 → 192.168.2.20 (slightly slower)
```

Điều này quan trọng đối với các ứng dụng hiệu suất cao, nơi mỗi mili giây đều có giá trị.

Trong phần tiếp theo, chúng ta sẽ khám phá quản lý tên miền và DNS - cách dịch tên ứng dụng của bạn sang địa chỉ IP mà bạn vừa học cách lập kế hoạch và quản lý.

Lập kế hoạch tốt sẽ ngăn ngừa hầu hết các vấn đề về địa chỉ IP trước khi chúng xảy ra. Hãy dành thời gian để thiết kế không gian địa chỉ của bạn một cách hợp lý, tránh trùng lặp và ghi lại các quyết định của bạn.

Chúc mừng subnet!
