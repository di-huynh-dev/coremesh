---
title: "Kết nối mạng trong Linux"
description: Định cấu hình và khắc phục sự cố mạng Linux với ip, ss, ping, traceroute và dig. Bao gồm các giao diện, bảng định tuyến, DNS và chẩn đoán các sự cố kết nối.
order: 8
---

Mạng là một khía cạnh cơ bản của điện toán hiện đại và Linux cung cấp các công cụ mạnh mẽ để cấu hình, giám sát và xử lý sự cố mạng. Cho dù bạn đang thiết lập máy chủ gia đình, định cấu hình máy chủ web trên đám mây hay chỉ đang cố gắng chẩn đoán các sự cố kết nối, hiểu biết về mạng Linux là điều cần thiết.

Trong phần này, chúng ta sẽ khám phá các khái niệm và công cụ mạng trong Linux, từ cấu hình cơ bản đến giám sát và bảo mật nâng cao.

## Khái niệm cơ bản về mạng trong Linux

### Hiểu giao diện mạng

Mọi kết nối mạng trong Linux đều được thực hiện thông qua giao diện mạng. Đây có thể là vật lý (như thẻ Ethernet) hoặc ảo (như đường hầm VPN).

Liệt kê các giao diện mạng:

```bash
ip link show
```

Hoặc sử dụng lệnh cũ hơn:

```bash
ifconfig
```

Quy ước đặt tên chung cho giao diện:

- `eth0`, `eth1`: Tên truyền thống cho giao diện Ethernet
- `enp3s0`, `ens33`: Tên giao diện có thể dự đoán được trong các bản phân phối mới hơn
- `wlan0`, `wlp3s0`: Giao diện không dây
- `lo`: Giao diện loopback (luôn hiện diện)

### Xem cấu hình mạng

Kiểm tra cấu hình địa chỉ IP:

```bash
ip addr show
```

Xem bảng định tuyến:

```bash
ip route show
```

Kiểm tra máy chủ DNS:

```bash
cat /etc/resolv.conf
```

Hiển thị kết nối mạng:

```bash
ss -tuln
```

Các tùy chọn có nghĩa là:

- `t`: Kết nối TCP
- `u`: Kết nối UDP
- `l`: Chỉ hiển thị ổ cắm nghe
- `n`: Không giải quyết tên dịch vụ

## Cấu hình mạng

### Cấu hình tạm thời

Đặt địa chỉ IP tạm thời:

```bash
sudo ip addr add 192.168.1.100/24 dev eth0
```

Đưa giao diện lên hoặc xuống:

```bash
sudo ip link set eth0 up
sudo ip link set eth0 down
```

Thêm một tuyến đường tĩnh:

```bash
sudo ip route add 10.0.0.0/24 via 192.168.1.1
```

Những thay đổi này sẽ không còn tồn tại sau khi khởi động lại.

### Cấu hình cố định

Các tệp cấu hình mạng khác nhau tùy theo phân phối:

#### Debian/Ubuntu

Để thiết lập đơn giản, hãy chỉnh sửa `/etc/network/interfaces`:

```bash
sudo nano /etc/network/interfaces
```

Ví dụ cấu hình IP tĩnh:

```
auto eth0
iface eth0 inet static
    address 192.168.1.100
    netmask 255.255.255.0
    gateway 192.168.1.1
    dns-nameservers 8.8.8.8 8.8.4.4
```

Đối với DHCP:

```
auto eth0
iface eth0 inet dhcp
```

Áp dụng thay đổi:

```bash
sudo systemctl restart networking
```

#### Debian/Ubuntu mới hơn với Netplan

Ubuntu 18.04 và mới hơn sử dụng Netplan. Các tệp cấu hình có trong `/etc/netplan/`:

```bash
sudo nano /etc/netplan/01-netcfg.yaml
```

Cấu hình ví dụ:

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:
      dhcp4: no
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Áp dụng thay đổi:

```bash
sudo netplan apply
```

#### RHEL/CentOS/Fedora

Chỉnh sửa tập tin trong `/etc/sysconfig/network-scripts/`:

```bash
sudo nano /etc/sysconfig/network-scripts/ifcfg-eth0
```

Ví dụ cấu hình IP tĩnh:

```
TYPE=Ethernet
BOOTPROTO=static
IPADDR=192.168.1.100
NETMASK=255.255.255.0
GATEWAY=192.168.1.1
DNS1=8.8.8.8
DNS2=8.8.4.4
DEFROUTE=yes
NAME=eth0
DEVICE=eth0
ONBOOT=yes
```

Đối với DHCP:

```
TYPE=Ethernet
BOOTPROTO=dhcp
NAME=eth0
DEVICE=eth0
ONBOOT=yes
```

Áp dụng thay đổi:

```bash
sudo systemctl restart network
```

#### NetworkManager (Hầu hết các bản phân phối dành cho máy tính để bàn)

NetworkManager cung cấp cả công cụ GUI và dòng lệnh cho cấu hình mạng:

```bash
# Show connections
nmcli connection show

# Show device status
nmcli device status

# Connect to a network
nmcli connection up "Connection Name"

# Create a new connection
nmcli connection add con-name "Home Network" type ethernet ifname eth0 \
  ipv4.method manual ipv4.addresses 192.168.1.100/24 ipv4.gateway 192.168.1.1 \
  ipv4.dns "8.8.8.8 8.8.4.4"
```

### Cấu hình mạng không dây

Kết nối với mạng WiFi:

```bash
# Scan for available networks
sudo iwlist wlan0 scan | grep ESSID

# Connect using NetworkManager
nmcli device wifi list
nmcli device wifi connect "SSID" password "your_password"
```

Sử dụng trực tiếp `wpa_supplicant`:

```bash
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```

Thêm thông tin sau:

```
network={
    ssid="Your_SSID"
    psk="Your_Password"
}
```

Kết nối:

```bash
sudo wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf
sudo dhclient wlan0
```

## Công cụ khắc phục sự cố mạng

### Kiểm tra kết nối

Kiểm tra kết nối cơ bản với `ping`:

```bash
ping google.com
ping -c 4 192.168.1.1
```

Theo dõi các gói tuyến đường đi:

```bash
traceroute google.com
```

Một giải pháp thay thế hoạt động thông qua tường lửa:

```bash
mtr google.com
```

### Khắc phục sự cố DNS

Tra cứu bản ghi DNS:

```bash
dig google.com
dig google.com MX
dig -x 8.8.8.8
```

Truy vấn một máy chủ DNS cụ thể:

```bash
dig @8.8.8.8 google.com
```

Kiểm tra độ phân giải tên máy chủ của hệ thống:

```bash
getent hosts google.com
```

### Phân tích ổ cắm và cổng

Kiểm tra cổng nghe và kết nối:

```bash
ss -tuln
```

Xem các chương trình sử dụng kết nối mạng:

```bash
sudo ss -tulnp
```

Kiểm tra quá trình nào đang sử dụng một cổng cụ thể:

```bash
sudo lsof -i :80
```

### Phân tích lưu lượng mạng

Nắm bắt lưu lượng mạng với `tcpdump`:

```bash
sudo tcpdump -i eth0 -n
```

Lọc lưu lượng theo máy chủ hoặc cổng:

```bash
sudo tcpdump -i eth0 host 192.168.1.100
sudo tcpdump -i eth0 port 80
```

Để có giao diện thân thiện hơn với người dùng, hãy sử dụng Wireshark:

```bash
sudo apt install wireshark    # Debian/Ubuntu
sudo dnf install wireshark    # Fedora/RHEL/CentOS

# Run wireshark (GUI)
sudo wireshark
```

### Giám sát băng thông

Giám sát việc sử dụng băng thông:

```bash
sudo apt install iftop    # Debian/Ubuntu
sudo dnf install iftop    # Fedora/RHEL/CentOS

sudo iftop -i eth0
```

Để có cái nhìn đơn giản hơn:

```bash
sudo apt install nload    # Debian/Ubuntu
sudo dnf install nload    # Fedora/RHEL/CentOS

sudo nload eth0
```

## Dịch vụ mạng

### SSH (shell an toàn)

SSH rất cần thiết cho việc quản trị từ xa các hệ thống Linux.

Kết nối với máy chủ từ xa:

```bash
ssh username@server_ip
```

Sử dụng một cổng khác:

```bash
ssh -p 2222 username@server_ip
```

Sử dụng xác thực khóa:

```bash
ssh -i /path/to/private_key username@server_ip
```

Sao chép tập tin an toàn với `scp`:

```bash
# Copy local file to remote server
scp /path/to/local/file username@server_ip:/path/to/remote/directory

# Copy remote file to local system
scp username@server_ip:/path/to/remote/file /path/to/local/directory

# Copy entire directory recursively
scp -r /path/to/local/directory username@server_ip:/path/to/remote/directory
```

Lưu lượng đường hầm thông qua SSH (chuyển tiếp cổng):

```bash
# Local port forwarding (access remote service locally)
ssh -L 8080:localhost:80 username@server_ip

# Remote port forwarding (make local service available remotely)
ssh -R 8080:localhost:80 username@server_ip

# Dynamic port forwarding (SOCKS proxy)
ssh -D 9090 username@server_ip
```

### Cấu hình máy chủ SSH

Định cấu hình máy chủ SSH bằng cách chỉnh sửa `/etc/ssh/sshd_config`:

```bash
sudo nano /etc/ssh/sshd_config
```

Cài đặt quan trọng:

```
# Change default port
Port 2222

# Disable root login
PermitRootLogin no

# Allow only specific users
AllowUsers user1 user2

# Disable password authentication (use keys only)
PasswordAuthentication no

# Allow only key-based authentication
PubkeyAuthentication yes
```

Sau khi thay đổi, hãy khởi động lại dịch vụ SSH:

```bash
sudo systemctl restart sshd
```

### Máy chủ HTTP/Web

Cài đặt và cấu hình Apache:

```bash
sudo apt install apache2    # Debian/Ubuntu
sudo dnf install httpd      # Fedora/RHEL/CentOS

# Start and enable the service
sudo systemctl start apache2    # Debian/Ubuntu
sudo systemctl enable apache2

sudo systemctl start httpd      # Fedora/RHEL/CentOS
sudo systemctl enable httpd
```

Cài đặt Nginx:

```bash
sudo apt install nginx      # Debian/Ubuntu
sudo dnf install nginx      # Fedora/RHEL/CentOS

# Start and enable the service
sudo systemctl start nginx
sudo systemctl enable nginx
```

Cấu hình Nginx cơ bản (`/etc/nginx/sites-available/default` hoặc `/etc/nginx/conf.d/default.conf`):

```
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### Máy chủ DNS

Cài đặt và cấu hình BIND:

```bash
sudo apt install bind9      # Debian/Ubuntu
sudo dnf install bind       # Fedora/RHEL/CentOS

# Configure BIND
sudo nano /etc/bind/named.conf.local
```

Cấu hình vùng cơ bản:

```
zone "example.com" {
    type master;
    file "/etc/bind/zones/example.com.zone";
};
```

Tạo tập tin vùng:

```bash
sudo mkdir -p /etc/bind/zones
sudo nano /etc/bind/zones/example.com.zone
```

Nội dung tập tin vùng:

```
$TTL    86400
@       IN      SOA     ns1.example.com. admin.example.com. (
                  2025051401 ; Serial
                  3600       ; Refresh
                  1800       ; Retry
                  604800     ; Expire
                  86400      ; Minimum TTL
)
@       IN      NS      ns1.example.com.
@       IN      A       192.168.1.100
www     IN      A       192.168.1.100
ns1     IN      A       192.168.1.100
```

Khởi động lại BIND:

```bash
sudo systemctl restart bind9    # Debian/Ubuntu
sudo systemctl restart named    # Fedora/RHEL/CentOS
```

## An ninh mạng

### Tường lửa

#### UFW (Tường lửa không phức tạp)

UFW là giao diện người dùng thân thiện với người dùng dành cho iptables (Debian/Ubuntu):

```bash
# Install UFW
sudo apt install ufw

# Check status
sudo ufw status

# Enable UFW
sudo ufw enable

# Basic rules
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Allow specific port
sudo ufw allow 8080/tcp

# Allow from specific IP
sudo ufw allow from 192.168.1.100

# Deny a service
sudo ufw deny telnet

# Delete a rule (by number)
sudo ufw status numbered
sudo ufw delete 2
```

#### Tường lửa

Tường lửa là tường lửa mặc định trên Fedora/RHEL/CentOS:

```bash
# Check status
sudo firewall-cmd --state

# List allowed services
sudo firewall-cmd --list-services

# Allow a service
sudo firewall-cmd --add-service=http --permanent

# Allow a port
sudo firewall-cmd --add-port=8080/tcp --permanent

# Apply changes
sudo firewall-cmd --reload
```

#### Iptables

Lệnh iptables trực tiếp (cấp thấp):

```bash
# Allow SSH
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Drop all other incoming traffic
sudo iptables -A INPUT -j DROP

# Save rules
sudo iptables-save | sudo tee /etc/iptables.rules
```

### Dịch vụ mạng an toàn

Hạn chế quyền truy cập SSH:

```bash
# Allow SSH only from specific IP ranges
sudo ufw allow from 192.168.1.0/24 to any port 22
```

Thêm quy tắc tường lửa để hạn chế các nỗ lực kết nối:

```bash
# Using iptables to limit SSH connection attempts
sudo iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --set
sudo iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 -j DROP
```

### Mã hóa mạng

Thiết lập WireGuard VPN (VPN hiện đại, nhanh chóng, an toàn):

```bash
# Install WireGuard
sudo apt install wireguard    # Debian/Ubuntu
sudo dnf install wireguard-tools    # Fedora/RHEL/CentOS

# Generate keys
wg genkey | tee privatekey | wg pubkey > publickey

# Create configuration
sudo nano /etc/wireguard/wg0.conf
```

Cấu hình WireGuard cơ bản:

```
[Interface]
PrivateKey = your_private_key_here
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = peer_public_key_here
AllowedIPs = 10.0.0.2/32
```

Bắt đầu WireGuard:

```bash
sudo wg-quick up wg0
```

Kích hoạt khi khởi động:

```bash
sudo systemctl enable wg-quick@wg0
```

## Chủ đề mạng nâng cao

### Không gian tên mạng

Không gian tên mạng cô lập tài nguyên mạng, tương tự như cách container hoạt động:

```bash
# Create a new network namespace
sudo ip netns add test_ns

# List namespaces
ip netns list

# Execute command in namespace
sudo ip netns exec test_ns ip addr

# Create a virtual Ethernet pair
sudo ip link add veth0 type veth peer name veth1

# Move one end to the namespace
sudo ip link set veth1 netns test_ns

# Configure the interfaces
sudo ip addr add 192.168.100.1/24 dev veth0
sudo ip netns exec test_ns ip addr add 192.168.100.2/24 dev veth1

# Bring up the interfaces
sudo ip link set veth0 up
sudo ip netns exec test_ns ip link set veth1 up
sudo ip netns exec test_ns ip link set lo up
```

### Cầu nối mạng

Tạo cầu nối để kết nối VM hoặc container:

```bash
# Install bridge utilities
sudo apt install bridge-utils    # Debian/Ubuntu
sudo dnf install bridge-utils    # Fedora/RHEL/CentOS

# Create a bridge
sudo ip link add name br0 type bridge
sudo ip link set dev br0 up

# Add interfaces to the bridge
sudo ip link set dev eth0 master br0
sudo ip link set dev eth1 master br0

# Configure the bridge with an IP
sudo ip addr add 192.168.1.100/24 dev br0
```

### Giao diện mạng liên kết

Kết hợp nhiều giao diện mạng để dự phòng hoặc tăng băng thông:

```bash
# Load the bonding module
sudo modprobe bonding

# Create a bond interface
sudo ip link add bond0 type bond
sudo ip link set bond0 up

# Set the bonding mode
echo "active-backup" | sudo tee /sys/class/net/bond0/bonding/mode

# Add interfaces to the bond
sudo ip link set eth0 down
sudo ip link set eth1 down
sudo ip link set eth0 master bond0
sudo ip link set eth1 master bond0
sudo ip link set eth0 up
sudo ip link set eth1 up

# Configure the bond with an IP
sudo ip addr add 192.168.1.100/24 dev bond0
```

### Kiểm soát giao thông

Giới hạn băng thông với `tc` (Kiểm soát lưu lượng):

```bash
# Limit outgoing bandwidth to 1Mbps
sudo tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms

# Remove the limitation
sudo tc qdisc del dev eth0 root
```

## Cấu hình mạng cho môi trường đám mây

Khi chạy Linux trên đám mây, cấu hình mạng thường được xử lý khác nhau.

### Ví dụ: Giọt DigitalOcean

Khi bạn tạo Droplet trên DigitalOcean (sử dụng [liên kết này](https://m.do.co/c/2a9bba940f39) để nhận tín dụng $200), mạng được định cấu hình trước nhưng bạn có thể cần thực hiện các thay đổi:

1. Định cấu hình mạng riêng:

   - Mạng riêng được bật theo mặc định trên Droplets mới
   - Truy cập Droplet của bạn thông qua IP riêng của nó để truyền dữ liệu giữa các Droplets trong cùng khu vực

2. Định cấu hình IP nổi:

   - Chỉ định IP nổi cho Giọt của bạn để có IP công cộng tĩnh có thể dễ dàng di chuyển giữa các Giọt

3. Cấu hình tường lửa:
   - Sử dụng Tường lửa đám mây của DigitalOcean hoặc định cấu hình UFW/iptables trên Droplet của bạn
   - Thiết lập UFW cơ bản cho máy chủ web:

```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

## Ví dụ về mạng thực tế

Hãy áp dụng những gì chúng ta đã học với một số ví dụ thực tế:

### Thiết lập một máy chủ web đơn giản

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Check that it's running
sudo systemctl status nginx

# Configure firewall to allow HTTP traffic
sudo ufw allow 'Nginx HTTP'
sudo ufw status

# Get your public IP
curl ifconfig.me

# Now you can access your web server at http://your_ip_address
```

### Tạo cấu hình SSH an toàn

```bash
# Create backup of original configuration
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Edit SSH config
sudo nano /etc/ssh/sshd_config
```

Thực hiện những thay đổi này:

```
# Use a non-standard port
Port 2222

# Disable root login
PermitRootLogin no

# Disable password authentication
PasswordAuthentication no

# Limit user access
AllowUsers yourusername

# Automatic logout of idle sessions
ClientAliveInterval 300
ClientAliveCountMax 2
```

Áp dụng thay đổi:

```bash
# Check config for errors
sudo sshd -t

# Restart SSH service if no errors
sudo systemctl restart sshd
```

Kiểm tra trước khi đăng xuất:

```bash
# Open a new terminal and try to connect
ssh -p 2222 yourusername@your_server_ip
```

### Thiết lập dịch địa chỉ mạng (NAT)

Định cấu hình máy Linux để chia sẻ kết nối internet của nó:

```bash
# Enable IP forwarding
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward

# Make it permanent
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Configure NAT with iptables
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -A FORWARD -i eth1 -o eth0 -j ACCEPT
sudo iptables -A FORWARD -i eth0 -o eth1 -m state --state RELATED,ESTABLISHED -j ACCEPT

# Save iptables rules
sudo iptables-save | sudo tee /etc/iptables.rules
```

### Thiết lập bộ nhớ đệm DNS

Cải thiện hiệu suất mạng với bộ nhớ đệm DNS:

```bash
# Install dnsmasq
sudo apt install dnsmasq

# Configure dnsmasq
sudo nano /etc/dnsmasq.conf
```

Thêm những dòng này:

```
# Listen on localhost
listen-address=127.0.0.1

# Use Google DNS as upstream
server=8.8.8.8
server=8.8.4.4

# Cache size
cache-size=1000
```

Cấu hình hệ thống để sử dụng máy chủ DNS cục bộ:

```bash
sudo nano /etc/resolv.conf
```

Thay đổi thành:

```
nameserver 127.0.0.1
```

Để làm cho nó vĩnh viễn:

```bash
# For systems using NetworkManager
sudo nano /etc/NetworkManager/NetworkManager.conf
```

Thêm:

```
[main]
dns=dnsmasq
```

Khởi động lại dịch vụ:

```bash
sudo systemctl restart dnsmasq
sudo systemctl restart NetworkManager
```

## Tiến về phía trước

Bây giờ bạn đã có hiểu biết vững chắc về các khái niệm và công cụ mạng Linux. Những kỹ năng này sẽ giúp bạn định cấu hình, giám sát và khắc phục sự cố mạng trên bất kỳ hệ thống Linux nào.

Trong phần tiếp theo, chúng ta sẽ khám phá những điều cơ bản về tập lệnh shell, cho phép bạn tự động hóa các tác vụ và xây dựng các công cụ mạnh mẽ bằng dòng lệnh Linux.

Khả năng kết nối mạng của Linux bao gồm từ cấu hình đơn giản đến các dịch vụ và bảo mật mạng nâng cao. Cho dù bạn đang quản lý một hệ thống hay toàn bộ cơ sở hạ tầng, những kỹ năng kết nối mạng này là một phần quan trọng trong bộ công cụ Linux của bạn.
