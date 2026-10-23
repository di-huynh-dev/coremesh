---
title: "Giám sát và khắc phục sự cố mạng"
description: Các công cụ và kỹ thuật để chẩn đoán sự cố mạng, theo dõi hiệu suất và duy trì tình trạng mạng.
order: 8
---

Các sự cố mạng thường không được phát hiện cho đến khi chúng làm hỏng một thứ gì đó quan trọng. Khả năng giám sát tốt sẽ phát hiện sự cố trước khi người dùng nhận thấy chúng, đồng thời khắc phục sự cố có hệ thống giúp bạn khắc phục sự cố nhanh chóng khi chúng xảy ra.

## Điều kiện tiên quyết

- Hiểu biết về các nguyên tắc cơ bản của mạng từ các phần trước
- Truy cập vào hệ thống Linux/Unix để chạy các công cụ chẩn đoán
- Làm quen cơ bản với các tệp nhật ký và quản trị hệ thống

## Công cụ giám sát mạng cần thiết

Hãy bắt đầu với những công cụ cơ bản mà mọi nhà phát triển nên biết.

### Ping: Kiểm tra kết nối cơ bản

ping gửi các gói ICMP để kiểm tra xem máy chủ có thể truy cập được không:

```bash
# Basic connectivity test
ping google.com

# Send specific number of packets
ping -c 4 google.com

# Measure packet loss and latency patterns
ping -c 100 -i 0.1 your-server.com
```

Tìm kiếm các mẫu ở đầu ra:

```
64 bytes from google.com (172.217.12.14): icmp_seq=1 ttl=55 time=12.3 ms
64 bytes from google.com (172.217.12.14): icmp_seq=2 ttl=55 time=11.8 ms
64 bytes from google.com (172.217.12.14): icmp_seq=3 ttl=55 time=45.2 ms
```

Thời gian phản hồi tăng đột ngột (như gói thứ ba) thường cho thấy tình trạng tắc nghẽn mạng hoặc độ trễ xử lý.

### Traceroute: Khám phá đường dẫn

traceroute hiển thị các gói đường đi để đến đích:

```bash
# See the route to a destination
traceroute google.com

# Use UDP instead of ICMP (some firewalls block ICMP)
traceroute -U google.com

# Show IP addresses without DNS resolution for faster results
traceroute -n google.com
```

Mỗi dòng đại diện cho một bước nhảy của bộ định tuyến:

```
1  192.168.1.1 (192.168.1.1)  1.234 ms  1.123 ms  1.456 ms
2  10.0.0.1 (10.0.0.1)  12.345 ms  11.234 ms  13.456 ms
3  * * *
4  203.0.113.1 (203.0.113.1)  23.456 ms  22.345 ms  24.567 ms
```

`* * *` ở dòng 3 có nghĩa là bộ định tuyến không phản hồi các gói theo dõi (phổ biến vì lý do bảo mật), nhưng lưu lượng truy cập vẫn đi qua nó.

### Netstat: Phân tích kết nối

netstat hiển thị các kết nối mạng đang hoạt động và dịch vụ nghe:

```bash
# Show all TCP and UDP connections
netstat -tuln

# Show connections with process information
netstat -tulnp

# Show only established connections
netstat -tln | grep ESTABLISHED

# Monitor connections in real-time
watch 'netstat -tuln | grep :80'
```

Hiểu đầu ra giúp chẩn đoán các sự cố kết nối:

```
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program
tcp   0      0      0.0.0.0:22              0.0.0.0:*               LISTEN      1234/sshd
tcp   0      0      127.0.0.1:5432          0.0.0.0:*               LISTEN      5678/postgres
tcp   0      52     192.168.1.100:22        203.0.113.50:45678      ESTABLISHED 1234/sshd
```

### Ss: Thống kê ổ cắm hiện đại

ss là sự thay thế hiện đại cho netstat với hiệu suất tốt hơn:

```bash
# Show all sockets
ss -tuln

# Show established TCP connections
ss -t state established

# Show connections to specific port
ss -tn dport = :80

# Show process information
ss -tlnp
```

ss cung cấp thông tin chi tiết hơn và chạy nhanh hơn trên các hệ thống bận rộn.

## Giám sát cấp ứng dụng

Giám sát mạng mở rộng ra ngoài kết nối cơ bản đến hiệu suất ứng dụng.

### Giám sát thời gian phản hồi HTTP

Giám sát hiệu suất ứng dụng web:

```bash
# Measure HTTP response times
curl -w "@curl-format.txt" -o /dev/null -s http://your-api.com/health

# Create curl-format.txt with timing information
echo 'time_namelookup:  %{time_namelookup}\n
time_connect:     %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer: %{time_pretransfer}\n
time_redirect:    %{time_redirect}\n
time_starttransfer: %{time_starttransfer}\n
time_total:       %{time_total}\n' > curl-format.txt
```

Điều này phân tích thời gian dành cho các yêu cầu HTTP:

```
time_namelookup:  0.003
time_connect:     0.012
time_appconnect:  0.045
time_pretransfer: 0.046
time_redirect:    0.000
time_starttransfer: 0.123
time_total:       0.125
```

### Giám sát kết nối cơ sở dữ liệu

Giám sát kết nối và hiệu suất cơ sở dữ liệu:

```bash
# PostgreSQL connection monitoring
#!/bin/bash
DB_HOST="db.example.com"
DB_PORT="5432"
DB_NAME="app_production"

# Test basic connectivity
nc -zv $DB_HOST $DB_PORT

# Test application-level connectivity
psql "postgresql://user:pass@$DB_HOST:$DB_PORT/$DB_NAME" -c "SELECT 1;"

# Monitor active connections
psql "postgresql://user:pass@$DB_HOST:$DB_PORT/$DB_NAME" -c "
SELECT count(*) as active_connections,
       state,
       client_addr
FROM pg_stat_activity
WHERE state = 'active'
GROUP BY state, client_addr;"
```

### Tình trạng kết nối TCP

Giám sát trạng thái và lỗi kết nối TCP:

```bash
# Count connections by state
ss -tan | awk 'NR>1 {++S[$1]} END {for (a in S) print a,S[a]}'

# Monitor TCP retransmissions (sign of network problems)
netstat -s | grep -i retrans

# Watch for connection errors
dmesg | grep -i "tcp\|network"
```

## Giám sát mạng dựa trên nhật ký

Nhật ký hệ thống và ứng dụng chứa thông tin mạng có giá trị.

### Phân tích nhật ký hệ thống

Tìm kiếm các thông báo liên quan đến mạng trong nhật ký hệ thống:

```bash
# Check for network interface errors
dmesg | grep -i "network\|eth\|link"

# Monitor authentication failures (potential attacks)
grep "Failed password" /var/log/auth.log | tail -20

# Check for firewall blocks
grep "BLOCK" /var/log/ufw.log | tail -20

# Monitor DNS resolution issues
grep "resolve" /var/log/syslog | tail -20
```

### Mẫu nhật ký ứng dụng

Giám sát nhật ký ứng dụng để phát hiện các sự cố mạng:

```bash
# Web server logs - look for error patterns
tail -f /var/log/nginx/error.log | grep -E "(timeout|refused|unreachable)"

# Application logs - database connection issues
tail -f /var/log/app/application.log | grep -E "(connection.*failed|timeout|refused)"

# API response time monitoring
tail -f /var/log/nginx/access.log | awk '$NF > 1000 {print $0}' # Slow requests > 1 second
```

### Phân tích nhật ký có cấu trúc

Đối với các ứng dụng tạo nhật ký có cấu trúc:

```bash
# Parse JSON logs for network metrics
tail -f app.log | jq 'select(.response_time_ms > 1000) | {timestamp, endpoint, response_time_ms}'

# Monitor error rates
tail -f app.log | jq -r 'select(.level == "ERROR" and .message | contains("network")) | .timestamp + " " + .message'
```

## Giám sát hiệu suất mạng

Hiểu hiệu suất mạng giúp tối ưu hóa ứng dụng và xác định các điểm nghẽn.

### Kiểm tra băng thông

Đo băng thông có sẵn:

```bash
# iperf3 - requires server on remote end
iperf3 -c iperf.example.com

# Test download speed
wget -O /dev/null http://speedtest.example.com/100MB.bin

# Test with curl and measure time
time curl -o /dev/null http://example.com/largefile.zip
```

### Giám sát độ trễ

Theo dõi các mẫu độ trễ theo thời gian:

```bash
# Continuous latency monitoring
#!/bin/bash
TARGET="api.example.com"
LOG_FILE="/var/log/latency-monitor.log"

while true; do
    LATENCY=$(ping -c 1 $TARGET | grep 'time=' | awk -F'time=' '{print $2}' | awk '{print $1}')
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    echo "$TIMESTAMP $TARGET $LATENCY" >> $LOG_FILE
    sleep 60
done
```

### Thống kê giao diện mạng

Giám sát hiệu suất giao diện mạng:

```bash
# Interface statistics
cat /proc/net/dev

# Detailed interface information
ip -s link show

# Monitor interface errors
watch 'cat /proc/net/dev | grep -E "(eth0|wlan0)"'

# Network interface utilization
vnstat -i eth0 -l  # Live monitoring
vnstat -i eth0 -d  # Daily statistics
```

## Giám sát mạng tự động

Thiết lập giám sát tự động để chủ động nắm bắt vấn đề.

```
Network Monitoring Architecture

┌─────────────────────────────────────────────────────────────────────────┐
│                           Monitoring Infrastructure                     │
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐      │
│  │   Prometheus    │    │    Grafana      │    │  AlertManager   │      │
│  │   (Metrics)     │    │  (Dashboards)   │    │   (Alerts)      │      │
│  │                 │    │                 │    │                 │      │
│  │  ┌─────────────┐│    │  ┌─────────────┐│    │  ┌─────────────┐│      │
│  │  │Network      ││    │  │Latency      ││    │  │Email        ││      │
│  │  │Metrics DB   ││    │  │Dashboard    ││    │  │Slack        ││      │
│  │  └─────────────┘│    │  └─────────────┘│    │  │PagerDuty    ││      │
│  └─────────────────┘    └─────────────────┘    │  └─────────────┘│      │
│           ▲                        ▲           └─────────────────┘      │
│           │                        │                     ▲              │
│           │                        └─────────────────────┘              │
│           │                                                             │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────────────────┐
│                          Target Infrastructure                          │
│                                                                         │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│ │   Web-1     │  │   API-1     │  │Database-1   │  │Load Balancer│      │
│ │             │  │             │  │             │  │             │      │
│ │┌───────────┐│  │┌───────────┐│  │┌───────────┐│  │┌───────────┐│      │
│ ││node_export││  ││node_export││  ││node_export││  ││blackbox   ││      │
│ ││:9100      ││  ││:9100      ││  ││:9100      ││  ││exporter   ││      │
│ │└───────────┘│  │└───────────┘│  │└───────────┘│  ││:9115      ││      │
│ │             │  │             │  │             │  │└───────────┘│      │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
│        │                │                │                │             │
│        ▼                ▼                ▼                ▼             │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │                    Network Metrics                                  │ │
│ │                                                                     │ │
│ │ • Interface utilization (rx/tx bytes)                               │ │
│ │ • Connection counts (established, time_wait)                        │ │
│ │ • Packet loss and error rates                                       │ │
│ │ • Latency measurements (ping, HTTP response time)                   │ │
│ │ • DNS resolution time                                               │ │
│ │ • SSL certificate expiration                                        │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

Monitoring Flow:
1. Exporters collect metrics from infrastructure
2. Prometheus scrapes and stores metrics
3. Grafana visualizes metrics in dashboards
4. AlertManager sends notifications when thresholds exceeded
5. Engineers respond to alerts and fix issues
```

### Tập lệnh kiểm tra sức khỏe đơn giản

```bash
#!/bin/bash
# network-health-check.sh

SERVICES=(
    "google.com:80"
    "api.example.com:443"
    "db.example.com:5432"
)

ALERT_EMAIL="ops@example.com"
LOG_FILE="/var/log/network-health.log"

check_service() {
    local host_port=$1
    local host=${host_port%:*}
    local port=${host_port#*:}

    if nc -zv $host $port 2>/dev/null; then
        echo "$(date): $host_port OK" >> $LOG_FILE
        return 0
    else
        echo "$(date): $host_port FAILED" >> $LOG_FILE
        echo "Network check failed for $host_port" | mail -s "Network Alert" $ALERT_EMAIL
        return 1
    fi
}

for service in "${SERVICES[@]}"; do
    check_service $service
done
```

Chạy tập lệnh này cứ sau 5 phút qua cron:

```bash
# Add to crontab
*/5 * * * * /usr/local/bin/network-health-check.sh
```

### Giám sát mạng Prometheus

Để giám sát phức tạp hơn, hãy sử dụng Prometheus với node_exporter:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
    metrics_path: /metrics
    scrape_interval: 5s
```

Số liệu mạng truy vấn:

```bash
# Network bytes received
rate(node_network_receive_bytes_total[5m])

# Network errors
rate(node_network_receive_errs_total[5m])

# TCP connection states
node_netstat_Tcp_CurrEstab
```

## Khắc phục sự cố mạng

Khi xảy ra sự cố mạng, việc khắc phục sự cố có hệ thống sẽ tiết kiệm thời gian.

```
Network Troubleshooting Flow

Problem: "I can't connect to the application!"
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│ Step 1: Physical/Link Layer                                    │
│ ┌─────────────────┐    ┌─────────────────┐                     │
│ │ Check cables    │    │ Check WiFi      │                     │
│ │ ip link show    │    │ iwconfig        │                     │
│ └─────────────────┘    └─────────────────┘                     │
└─────────────────────────┬──────────────────────────────────────┘
                          │ ✓ Links are UP
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ Step 2: Network Layer (IP)                                     │
│ ┌─────────────────┐    ┌─────────────────┐                     │
│ │ ping gateway    │    │ ping 8.8.8.8    │                     │
│ │ ping 192.168.1.1│    │ (test internet) │                     │
│ └─────────────────┘    └─────────────────┘                     │
└─────────────────────────┬──────────────────────────────────────┘
                          │ ✓ IP routing works
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ Step 3: DNS Resolution                                         │
│ ┌─────────────────┐    ┌─────────────────┐                     │
│ │ nslookup        │    │ dig             │                     │
│ │ app.example.com │    │ app.example.com │                     │
│ └─────────────────┘    └─────────────────┘                     │
└─────────────────────────┬──────────────────────────────────────┘
                          │ ✓ DNS resolves correctly
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ Step 4: Transport Layer (Ports)                                │
│ ┌─────────────────┐    ┌─────────────────┐                     │
│ │ telnet host 80  │    │ nc -zv host 443 │                     │
│ │ (test HTTP)     │    │ (test HTTPS)    │                     │
│ └─────────────────┘    └─────────────────┘                     │
└─────────────────────────┬──────────────────────────────────────┘
                          │ ✓ Ports are open
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ Step 5: Application Layer                                      │
│ ┌─────────────────┐    ┌─────────────────┐                     │
│ │ curl -I         │    │ Check app logs  │                     │
│ │ http://app.com  │    │ /var/log/app    │                     │
│ └─────────────────┘    └─────────────────┘                     │
└─────────────────────────┬──────────────────────────────────────┘
                          │
                          ▼
                    Problem Found!

Common Issues by Layer:
┌─────────────┬─────────────────────────────────────────────────────┐
│ Layer       │ Common Problems                                     │
├─────────────┼─────────────────────────────────────────────────────┤
│ Physical    │ Cable unplugged, WiFi disconnected                  │
│ Network     │ Wrong IP, gateway down, routing misconfigured       │
│ DNS         │ Wrong nameserver, domain expired, propagation delay │
│ Transport   │ Firewall blocking, service not listening            │
│ Application │ App crashed, misconfigured, database connection     │
└─────────────┴─────────────────────────────────────────────────────┘
```

### Phương pháp khắc phục sự cố mô hình OSI

Làm việc thông qua các lớp mạng một cách có hệ thống:

**Lớp 1 (Vật lý)**: Cáp có được kết nối không? WiFi có hoạt động không?

```bash
# Check interface status
ip link show

# Check for hardware errors
dmesg | grep -i "link\|cable\|phy"
```

**Layer 2 (Liên kết dữ liệu)**: Bạn có thể kết nối với các máy khác trên cùng một mạng không?

```bash
# Check ARP table
arp -a

# Test local network connectivity
ping 192.168.1.1  # Gateway
```

**Layer 3 (Mạng)**: Bạn có thể truy cập các mạng từ xa không?

```bash
# Check routing
ip route show

# Test internet connectivity
ping 8.8.8.8
```

**Layer 4 (Transport)**: Các cổng có mở và các dịch vụ có phản hồi không?

```bash
# Test specific ports
telnet example.com 80
nc -zv example.com 443
```

**Layer 7 (Ứng dụng)**: Ứng dụng có hoạt động chính xác không?

```bash
# Test application endpoints
curl -I http://api.example.com/health
```

### Các vấn đề và giải pháp mạng thường gặp

Vấn đề về độ phân giải của **DNS:**

```bash
# Symptoms: Can ping IP but not hostname
ping 8.8.8.8  # Works
ping google.com  # Fails

# Troubleshooting
nslookup google.com
dig google.com

# Check DNS configuration
cat /etc/resolv.conf

# Try different DNS servers
nslookup google.com 8.8.8.8
```

** Chặn lưu lượng truy cập bằng tường lửa:**

```bash
# Symptoms: Connection timeouts or immediate refusal
telnet example.com 80  # Hangs or "Connection refused"

# Check local firewall
sudo ufw status
sudo iptables -L

# Check remote firewall (if you have access)
# Test from different source IPs
```

**Tắc nghẽn mạng:**

```bash
# Symptoms: High latency, packet loss
ping -c 100 example.com | grep "packet loss"

# Check interface utilization
vnstat -i eth0 -l

# Monitor for retransmissions
netstat -s | grep -i retrans
```

Các vấn đề về **SSL/TLS:**

```bash
# Test SSL connectivity
openssl s_client -connect example.com:443

# Check certificate validity
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
```

## Giám sát an ninh mạng

Giám sát các vấn đề bảo mật và các cuộc tấn công.

### Giám sát xác thực không thành công

```bash
# SSH brute force attempts
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -nr

# Web authentication failures
grep "401\|403" /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -nr
```

### Phát hiện quét cổng

```bash
# Monitor for port scanning attempts
netstat -an | grep SYN_RECV | wc -l

# Detect connection attempts to closed ports
grep "Connection attempt" /var/log/messages
```

### Giám sát tấn công DDoS

```bash
# Monitor connection counts by IP
netstat -ntu | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr | head -20

# Monitor request rates in web logs
tail -f /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -nr
```

## Đường cơ sở và cảnh báo về hiệu suất

Thiết lập đường cơ sở hiệu suất để phát hiện sự bất thường.

### Tạo đường cơ sở hiệu suất

```bash
# Collect baseline network metrics
#!/bin/bash
BASELINE_FILE="/var/log/network-baseline.log"

# Collect metrics for a week during normal operations
echo "$(date): Latency to google.com: $(ping -c 5 google.com | tail -1 | awk -F'/' '{print $5}')" >> $BASELINE_FILE
echo "$(date): DNS resolution time: $(time nslookup google.com 2>&1 | grep real | awk '{print $2}')" >> $BASELINE_FILE
echo "$(date): HTTP response time: $(curl -w '%{time_total}' -o /dev/null -s http://api.example.com)" >> $BASELINE_FILE
```

### Ngưỡng cảnh báo

Thiết lập cảnh báo dựa trên độ lệch so với đường cơ sở:

```bash
# Alert if latency exceeds baseline by 50%
BASELINE_LATENCY=20  # milliseconds
CURRENT_LATENCY=$(ping -c 1 google.com | grep 'time=' | awk -F'time=' '{print $2}' | awk '{print $1}' | cut -d'.' -f1)

if [ $CURRENT_LATENCY -gt $((BASELINE_LATENCY * 150 / 100)) ]; then
    echo "High latency detected: ${CURRENT_LATENCY}ms" | mail -s "Network Alert" ops@example.com
fi
```

## Công cụ khắc phục sự cố nâng cao

Đối với các sự cố mạng phức tạp, các công cụ chuyên dụng sẽ cung cấp thông tin chuyên sâu hơn.

### Tcpdump: Chụp gói

Chụp và phân tích các gói mạng:

```bash
# Capture packets on specific interface
sudo tcpdump -i eth0

# Capture HTTP traffic
sudo tcpdump -i eth0 port 80

# Capture and save to file
sudo tcpdump -i eth0 -w network-capture.pcap

# Filter by host
sudo tcpdump -i eth0 host api.example.com

# Show packet contents
sudo tcpdump -i eth0 -A port 80
```

### Wireshark: Phân tích gói

Để phân tích gói chi tiết, hãy sử dụng Wireshark (công cụ GUI) hoặc tshark (dòng lệnh):

```bash
# Analyze saved packet capture
tshark -r network-capture.pcap

# Filter HTTP requests
tshark -r network-capture.pcap -Y http.request

# Extract timing information
tshark -r network-capture.pcap -T fields -e frame.time -e tcp.analysis.ack_rtt
```

### Strace: Theo dõi cuộc gọi hệ thống

Gỡ lỗi hành vi mạng ứng dụng:

```bash
# Trace network system calls for a process
strace -e trace=network -p <pid>

# Trace a command's network activity
strace -e trace=network curl http://example.com

# Save trace to file for analysis
strace -e trace=network -o network-trace.log -p <pid>
```

Trong phần tiếp theo, chúng ta sẽ khám phá tự động hóa mạng - cách quản lý cấu hình, triển khai và giám sát mạng bằng cách sử dụng cơ sở hạ tầng làm nguyên tắc mã.

Giám sát và xử lý sự cố mạng là những kỹ năng sẽ được cải thiện khi thực hành. Bắt đầu với các công cụ cơ bản, nâng cao hiểu biết của bạn về hành vi mạng thông thường và dần dần bổ sung tính năng giám sát phức tạp hơn khi cơ sở hạ tầng của bạn phát triển.

Chúc bạn khắc phục được sự cố!
