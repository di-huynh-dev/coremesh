---
title: "Nguyên tắc cơ bản và giao thức mạng"
description: 'Cách các ứng dụng giao tiếp qua mạng: mô hình OSI, TCP và UDP, địa chỉ IP, cổng và độ phân giải DNS được giải thích bằng các ví dụ về đường cong và tcpdump có thể theo dõi.'
order: 1
---

Khi ứng dụng của bạn kết nối với cơ sở dữ liệu, phục vụ lưu lượng truy cập web hoặc gọi API bên ngoài, ứng dụng đó sẽ sử dụng các giao thức mạng để di chuyển dữ liệu một cách đáng tin cậy giữa các hệ thống. Hiểu các giao thức này giúp bạn khắc phục sự cố, tối ưu hóa hiệu suất và thiết kế hệ thống phân tán tốt hơn.

## Điều kiện tiên quyết

- Một máy tính có quyền truy cập thiết bị đầu cuối
- Làm quen cơ bản với các lệnh chạy

## Ứng dụng thực sự giao tiếp như thế nào

Ứng dụng của bạn không trực tiếp "nói chuyện" với máy chủ cơ sở dữ liệu. Thay vào đó, dữ liệu được đóng gói, đánh địa chỉ và gửi qua nhiều thiết bị mạng trước khi đến đích. Hãy nghĩ về việc này giống như việc gửi một lá thư - nó phải trải qua các cơ sở phân loại và nhân viên bưu điện trước khi đến nơi.

```
┌─────────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────┐
│Your Computer│────│Router 1 │────│Router 2 │────│GitHub Server│
│             │    │         │    │         │    │             │
│   curl      │    │ ISP     │    │Internet │    │ api.github  │
│   command   │    │Gateway  │    │Backbone │    │    .com     │
└─────────────┘    └─────────┘    └─────────┘    └─────────────┘
```

Khi bạn chạy `curl https://api.github.com`, đây là điều thực sự xảy ra:

1. Máy tính của bạn tra cứu địa chỉ IP cho `api.github.com`
2. Nó thiết lập kết nối đến địa chỉ IP đó trên cổng 443
3. Nó gửi yêu cầu HTTP qua kết nối TLS được mã hóa
4. Máy chủ của GitHub xử lý yêu cầu và gửi lại phản hồi
5. Máy tính của bạn nhận và hiển thị dữ liệu

Mỗi bước liên quan đến các giao thức mạng khác nhau hoạt động cùng nhau.

## Ngăn xếp mạng trong thực tế

Mạng thường được giải thích bằng bảy lớp của mô hình OSI, nhưng bạn thực sự chỉ cần hiểu một vài lớp chính để khắc phục sự cố thực tế:

**Lớp mạng (IP)**: Nhận dữ liệu đến đúng máy bằng địa chỉ IP
**Lớp truyền tải (TCP/UDP)**: Đảm bảo phân phối và xử lý các cổng đáng tin cậy
**Lớp ứng dụng (HTTP/SSH/DNS)**: Các giao thức mà ứng dụng của bạn thực sự sử dụng

Khi gỡ lỗi các sự cố mạng, bạn thường làm việc từ dưới lên thông qua các lớp này. Bạn có thể truy cập địa chỉ IP không? Cổng có mở không? Ứng dụng có phản hồi chính xác không?

## Mô hình OSI là gì?

Mô hình OSI (Kết nối hệ thống mở) là một khung khái niệm tiêu chuẩn hóa hàm của hệ thống viễn thông hoặc máy tính thành bảy lớp trừu tượng. Nó giúp hiểu các giao thức mạng khác nhau tương tác như thế nào.

| Lớp | Tên              | Mô tả                                          |
| ----- | ----------------- | ---------------------------------------------------- |
| 7     | ứng dụng       | Giao diện người dùng và các giao thức ứng dụng (HTTP, FTP) |
| 6     | Trình bày      | Dịch định dạng dữ liệu (mã hóa, nén)    |
| 5     | Phiên           | Thiết lập, quản lý và kết thúc các kết nối     |
| 4     | Vận chuyển         | Truyền dữ liệu đáng tin cậy (TCP, UDP)                    |
| 3     | Mạng           | Định tuyến và đánh địa chỉ (IP)                          |
| 2     | Liên kết dữ liệu         | Địa chỉ vật lý (địa chỉ MAC)                  |
| 1     | thể chất          | Truyền dữ liệu vật lý (cáp, tín hiệu)      |
| 0     | Giao diện mạng | Phần cứng và trình điều khiển cho giao diện mạng          |

Mô hình OSI là một khung lý thuyết. Trong thực tế, hầu hết các giao thức không nằm gọn trong một lớp. Ví dụ: HTTP hoạt động ở lớp ứng dụng nhưng dựa vào TCP ở lớp vận chuyển.

Mô hình OSI rất hữu ích để hiểu cách các giao thức khác nhau tương tác với nhau nhưng bạn không cần phải ghi nhớ nó. Tập trung vào các khía cạnh thực tế của mạng lưới áp dụng cho công việc của bạn.

## Địa chỉ IP và cổng

Mọi giao tiếp mạng đều cần hai thông tin: nơi gửi dữ liệu (địa chỉ IP) và dịch vụ nào sẽ xử lý dữ liệu đó (số cổng).

Hãy kiểm tra những gì hiện đang chạy trên máy của bạn:

```bash
# See what services are listening for connections
netstat -tuln
```

Bạn sẽ thấy đầu ra như thế này:

```
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp   0      0      0.0.0.0:22              0.0.0.0:*               LISTEN
tcp   0      0      127.0.0.1:5432          0.0.0.0:*               LISTEN
tcp   0      0      :::80                   :::*                    LISTEN
```

Điều này hiển thị SSH đang nghe trên cổng 22 cho tất cả các địa chỉ IP (`0.0.0.0`), PostgreSQL đang nghe trên cổng 5432 nhưng chỉ dành cho các kết nối cục bộ (`127.0.0.1`) và máy chủ web nghe trên cổng 80 cho cả IPv4 và IPv6.

Dưới đây là các cổng phổ biến nhất bạn sẽ gặp phải:

```bash
22   # SSH - secure shell access
53   # DNS - domain name resolution
80   # HTTP - web traffic
443  # HTTPS - encrypted web traffic
3306 # MySQL database
5432 # PostgreSQL database
6379 # Redis cache
8080 # Alternative HTTP port (common in development)
```

## TCP vs UDP: Độ tin cậy và tốc độ

Mạng cung cấp hai cách chính để gửi dữ liệu, mỗi cách được tối ưu hóa cho các trường hợp sử dụng khác nhau.

### TCP: Giao hàng được đảm bảo

TCP đảm bảo dữ liệu của bạn đến theo thứ tự và không có lỗi. Nó giống như thư được chứng nhận - bạn nhận được xác nhận rằng nó đã được gửi.

Hãy xem hoạt động của TCP bằng cách thực hiện một yêu cầu HTTP:

```bash
# Make a request and see the full conversation
curl -v http://httpbin.org/get
```

Bạn sẽ thấy thiết lập kết nối (bắt tay TCP), yêu cầu HTTP và phản hồi. TCP tự động xử lý tất cả các chi tiết về độ tin cậy.

TCP hoàn hảo cho:

- Ứng dụng web (HTTP/HTTPS)
- Kết nối cơ sở dữ liệu
- Chuyển tập tin
- Bất kỳ tình huống nào mất dữ liệu sẽ là một vấn đề

### UDP: Nhanh nhưng không đảm bảo

UDP nhanh hơn vì nó không xác minh việc phân phối. Nó giống như thư thông thường - thường được gửi tới đó nhưng không có xác nhận.

DNS thường sử dụng UDP vì nó nhanh và việc mất một truy vấn không phải là vấn đề nghiêm trọng:

```bash
# DNS lookup uses UDP by default
dig google.com
```

UDP hoạt động tốt cho:

- Truy vấn DNS (có thể dễ dàng thử lại nếu cần)
- Truyền phát video (thà mất một vài khung hình còn hơn là bị trễ)
- Chơi game trong thời gian thực (tốc độ quan trọng hơn dữ liệu hoàn hảo)
- Giám sát số liệu (đôi khi mất điểm dữ liệu là có thể chấp nhận được)

## Kiểm tra kết nối mạng

Trước khi đi sâu vào gỡ lỗi dành riêng cho ứng dụng, hãy kiểm tra kết nối mạng cơ bản.

### Khả năng tiếp cận cơ bản

```bash
# Test if you can reach a host at all
ping google.com
```

Nếu ping không thành công, bạn gặp sự cố kết nối cơ bản - kết nối Internet của bạn bị hỏng hoặc có sự cố định tuyến.

### Độ phân giải DNS

```bash
# Check if domain names resolve to IP addresses
nslookup github.com
```

Nếu điều này không thành công nhưng ping tới địa chỉ IP vẫn hoạt động (như `ping 8.8.8.8`), bạn có vấn đề về DNS.

### Kết nối cổng

```bash
# Test if a specific service is reachable
telnet github.com 443
```

Nếu kết nối thành công, bạn sẽ nhận được lời nhắc trống. Nhập một vài ký tự và nhấn Enter - bạn sẽ thấy lỗi từ máy chủ HTTPS, lỗi này xác nhận cổng đang mở và phản hồi.

Để kiểm tra rõ ràng hơn, hãy sử dụng netcat nếu có:

```bash
# Test port connectivity with timeout
nc -zv github.com 443
```

## HTTP: Giao thức truyền thông của Web

HTTP hỗ trợ hầu hết các ứng dụng web. Hiểu cách thức hoạt động của nó giúp bạn gỡ lỗi các vấn đề về API và tối ưu hóa hiệu suất.

Hãy kiểm tra một cuộc hội thoại HTTP hoàn chỉnh:

```bash
# See exactly what your browser sends and receives
curl -v https://httpbin.org/json
```

Điều này hiển thị yêu cầu HTTP đầy đủ:

```http
GET /json HTTP/1.1
Host: httpbin.org
User-Agent: curl/7.68.0
Accept: */*
```

Và câu trả lời:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 429

{
  "slideshow": {
    "author": "Yours Truly",
    "title": "Sample Slide Show"
  }
}
```

### HTTPS: HTTP có mã hóa

HTTPS sử dụng TLS để mã hóa kết nối. Bạn có thể kiểm tra chi tiết chứng chỉ:

```bash
# Check SSL certificate information
openssl s_client -connect github.com:443 -servername github.com
```

Điều này hiển thị chi tiết chứng chỉ, phương thức mã hóa và liệu kết nối có an toàn hay không.

## DNS: Dịch tên thành địa chỉ

DNS dịch tên miền mà con người có thể đọc được thành địa chỉ IP. Nếu không có nó, bạn sẽ cần nhớ `142.250.80.14` thay vì `google.com`.

### DNS hoạt động như thế nào

Khi bạn truy cập `api.stripe.com`, máy tính của bạn:

1. Kiểm tra bộ đệm cục bộ của nó để tìm địa chỉ IP
2. Hỏi máy chủ DNS đã được định cấu hình của bạn (thường là của ISP)
3. Máy chủ đó có thể truy vấn các máy chủ DNS có thẩm quyền
4. Cuối cùng trả về địa chỉ IP cho máy tính của bạn
5. Máy tính của bạn kết nối với địa chỉ IP đó

### Kiểm tra độ phân giải DNS

```bash
# Basic DNS lookup
nslookup api.stripe.com

# More detailed information
dig api.stripe.com

# See the full resolution path
dig +trace api.stripe.com
```

Các loại bản ghi DNS khác nhau phục vụ các mục đích khác nhau:

```bash
# IPv4 address
dig api.stripe.com A

# IPv6 address
dig api.stripe.com AAAA

# Mail servers
dig stripe.com MX

# Text records (often used for verification)
dig stripe.com TXT
```

## Khám phá đường dẫn mạng

Dữ liệu của bạn không đi thẳng đến đích. Nó nhảy qua nhiều bộ định tuyến và thiết bị mạng.

```bash
# See the path your data takes
traceroute google.com
```

Mỗi dòng hiển thị một bộ định tuyến (hoặc "hop") khác nhau chuyển tiếp gói của bạn:

```
1  192.168.1.1 (192.168.1.1)  1.234 ms
2  10.0.0.1 (10.0.0.1)  12.345 ms
3  isp-router.example.com (203.0.113.1)  23.456 ms
```

Điều này cực kỳ hữu ích để chẩn đoán nơi xảy ra sự cố mạng. Nếu các gói bắt đầu bị mất ở bước nhảy 5, bạn biết vấn đề là ở bộ định tuyến hoặc phân đoạn mạng cụ thể đó.

## Giao diện mạng và định tuyến

Máy tính của bạn có thể có nhiều giao diện mạng - ethernet, WiFi, kết nối VPN, mạng Docker, v.v.

```bash
# List all network interfaces
ip addr show
```

Bạn sẽ thấy các giao diện như:

```
1: lo: <LOOPBACK,UP,LOWER_UP>
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP>
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP>
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
```

Bảng định tuyến xác định giao diện nào sẽ được sử dụng cho các đích khác nhau:

```bash
# View routing table
ip route show
```

Tìm tuyến đường `default` - đây là nơi các gói đi khi không có tuyến đường cụ thể nào tồn tại:

```
default via 192.168.1.1 dev eth0
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100
```

## Quy trình xử lý sự cố thực tế

Khi kết nối mạng không thành công, hãy thực hiện các bước sau một cách có hệ thống:

### Bước 1: Kiểm tra kết nối cơ bản

```bash
# Can you reach the internet at all?
ping 8.8.8.8
```

Nếu điều này không thành công, hãy kiểm tra kết nối mạng, cáp hoặc WiFi của bạn.

### Bước 2: Kiểm tra DNS

```bash
# Does DNS work?
nslookup google.com
```

Nếu DNS không thành công nhưng ping ở Bước 1 vẫn hoạt động thì cấu hình DNS của bạn bị hỏng.

### Bước 3: Kiểm tra dịch vụ cụ thể

```bash
# Is the service you're trying to reach actually running?
telnet api.example.com 443
```

Nếu điều này không thành công thì dịch vụ đã ngừng hoạt động hoặc tường lửa đang chặn quyền truy cập.

### Bước 4: Kiểm tra nhật ký ứng dụng

Nếu kết nối cơ bản hoạt động nhưng ứng dụng của bạn vẫn không thể kết nối, hãy kiểm tra nhật ký dành riêng cho ứng dụng để tìm thông báo lỗi như "hết thời gian kết nối" hoặc "kết nối bị từ chối".

## Cân nhắc hiệu suất mạng

Các giao thức khác nhau có các đặc tính hiệu suất khác nhau ảnh hưởng đến ứng dụng của bạn.

### Chi phí kết nối

TCP yêu cầu bắt tay ba bước trước khi gửi dữ liệu:

1. Khách hàng: "Tôi muốn kết nối" (SYN)
2. Máy chủ: "OK, tôi đã sẵn sàng" (SYN-ACK)
3. Khách hàng: "Tuyệt vời, hãy bắt đầu" (ACK)

Điều này làm tăng thêm độ trễ cho mọi kết nối mới. Đối với các ứng dụng hiệu suất cao, hãy xem xét:

- Nhóm kết nối để sử dụng lại các kết nối hiện có
- Yêu cầu HTTP/2 để ghép kênh qua một kết nối
- Kết nối liên tục cho các dịch vụ được sử dụng thường xuyên

### Băng thông và độ trễ

Đây là những vấn đề khác nhau đòi hỏi các giải pháp khác nhau:

```bash
# Measure latency (how long for a single packet)
ping -c 10 api.example.com

# Measure bandwidth (how much data can transfer)
# This requires iperf3 running on both ends
iperf3 -c iperf.example.com
```

Độ trễ cao khiến ứng dụng có cảm giác chậm, trong khi băng thông thấp sẽ hạn chế lượng dữ liệu bạn có thể truyền.

## Các bước tiếp theo

Bây giờ bạn đã hiểu các giao thức cơ bản hỗ trợ giao tiếp mạng. Những khái niệm này áp dụng cho dù bạn đang gỡ lỗi một vấn đề phát triển cục bộ, tối ưu hóa hiệu suất API hay thiết kế hệ thống phân tán.

Trong phần tiếp theo, chúng ta sẽ đi sâu vào địa chỉ IP và mạng con - nền tảng để tổ chức và bảo mật cơ sở hạ tầng mạng của bạn.

Khi bạn gặp sự cố kết nối, hãy nhớ bắt đầu với những điều cơ bản: Bạn có thể ping máy chủ không? DNS có giải quyết được không? Cổng có mở không? Hầu hết các vấn đề về mạng đều bắt nguồn từ những nguyên tắc cơ bản này.

Chúc bạn kết nối mạng vui vẻ!
