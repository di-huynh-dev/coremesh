---
title: "Kết nối mạng trong Docker"
description: Tìm hiểu cách định cấu hình giao tiếp giữa container và mạng bên ngoài
order: 7
---

Mạng Docker cho phép container giao tiếp với nhau và với thế giới bên ngoài. Hiểu khả năng kết nối mạng của Docker là điều cần thiết để xây dựng các ứng dụng đa container. Trong phần này, chúng ta sẽ khám phá các loại mạng của Docker, cách định cấu hình chúng và các phương pháp hay nhất cho giao tiếp container.

## Thông tin cơ bản về mạng Docker

Docker cung cấp một số trình điều khiển mạng, mỗi trình điều khiển có các khả năng khác nhau:

1. **bridge**: Trình điều khiển mạng mặc định. container có thể giao tiếp với nhau trên cùng một mạng cầu nối.
2. **host**: Loại bỏ cách ly mạng giữa container và máy chủ. container sử dụng trực tiếp mạng của máy chủ.
3. **none**: Vô hiệu hóa tất cả kết nối mạng cho container.
4. **overlay**: Kết nối nhiều trình nền Docker trên các máy chủ, cho phép các dịch vụ Swarm giao tiếp.
5. **macvlan**: Gán địa chỉ MAC cho container, làm cho nó xuất hiện dưới dạng thiết bị vật lý trên mạng của bạn.
6. **ipvlan**: Tương tự macvlan nhưng sử dụng địa chỉ IP thay vì địa chỉ MAC.
7. **plugin mạng tùy chỉnh**: Cho phép bạn sử dụng các plugin mạng của bên thứ ba.

## Liệt kê các mạng Docker

Để xem tất cả các mạng trên hệ thống của bạn:

```bash
docker network ls
```

Đầu ra ví dụ:

```
NETWORK ID     NAME      DRIVER    SCOPE
7ddf8d0d099a   bridge    bridge    local
69f9f6aa8de7   host      host      local
aabb90487e7c   none      null      local
```

## Mạng cầu nối mặc định

Khi bạn cài đặt Docker, nó sẽ tạo một mạng cầu nối mặc định có tên `bridge`. Trừ khi bạn chỉ định khác, container mới sẽ kết nối với mạng này.

Kiểm tra mạng lưới cầu:

```bash
docker network inspect bridge
```

Điều này trả về một đối tượng JSON có thông tin chi tiết về mạng, bao gồm thông tin mạng con và container được kết nối.

## Tạo mạng cầu nối tùy chỉnh

Mạng cầu nối mặc định phù hợp với các thiết lập đơn giản, nhưng mạng cầu nối tùy chỉnh mang lại một số lợi thế:

- Độ phân giải DNS tự động giữa container
- Cách ly tốt hơn
- container có thể được kết nối và ngắt kết nối khỏi mạng một cách nhanh chóng

Để tạo mạng cầu tùy chỉnh:

```bash
docker network create my-network
```

Bạn có thể chỉ định các tùy chọn bổ sung:

```bash
docker network create --driver bridge \
  --subnet 172.18.0.0/16 \
  --gateway 172.18.0.1 \
  my-custom-network
```

## Kết nối container với mạng

### Tại container Sáng tạo

Để khởi động container được kết nối với một mạng cụ thể:

```bash
docker run -d --name web --network my-network nginx:latest
```

### Thêm container đang chạy vào mạng

Để kết nối container hiện có với mạng:

```bash
docker network connect my-network db
```

### Xóa container khỏi Mạng

Để ngắt kết nối container khỏi mạng:

```bash
docker network disconnect my-network db
```

## Độ phân giải tên container

Một trong những tính năng mạnh mẽ nhất của mạng cầu nối tùy chỉnh là độ phân giải DNS tự động. container trên cùng một mạng tùy chỉnh có thể liên lạc với nhau bằng tên container của chúng.

Hãy chứng minh bằng một ví dụ đơn giản:

```bash
# Create a network
docker network create app-network

# Start a container
docker run -d --name db --network app-network postgres:13

# Start another container and connect to the first one using its name
docker run -d --name web --network app-network -p 8080:80 nginx:latest
```

Giờ đây, bên trong `web` container, bạn có thể kết nối với `db` container bằng tên máy chủ `db`:

```bash
docker exec -it web bash
ping db
```

Ping sẽ thành công, cho thấy container có thể phân giải lẫn nhau theo tên.

## Sử dụng Mạng Máy chủ

Đôi khi, bạn muốn container chia sẻ ngăn xếp mạng của máy chủ, loại bỏ hoàn toàn việc cách ly mạng:

```bash
docker run -d --name host-nginx --network host nginx:latest
```

Trong trường hợp này, container sử dụng trực tiếp địa chỉ IP và cổng của máy chủ. Nếu nginx lắng nghe trên cổng 80 bên trong container, nó sẽ có sẵn trên cổng 80 của máy chủ. Điều này có nghĩa là bạn không cần sử dụng ánh xạ cổng.

Mạng máy chủ rất hữu ích cho:

- Hiệu suất tối đa (không có chi phí mạng)
- Khi container cần xử lý nhiều loại cổng
- Khi container cần truy cập vào các dịch vụ mạng cục bộ

**Note**: Trình điều khiển mạng máy chủ chỉ hoạt động trên máy chủ Linux.

## Sử dụng mạng Không có

Để cách ly tối đa, bạn có thể tắt kết nối mạng cho container:

```bash
docker run -d --name isolated --network none alpine sleep infinity
```

container này chỉ có giao diện loopback và không thể giao tiếp với thế giới bên ngoài hoặc container khác.

## Bản đồ cổng

Đối với container trên mạng cầu nối, cần có ánh xạ cổng để giúp các dịch vụ có thể truy cập được từ Docker bên ngoài:

```bash
docker run -d --name web -p 8080:80 nginx:latest
```

Điều này ánh xạ cổng 80 trong container sang cổng 8080 trên máy chủ.

Bạn cũng có thể chỉ định IP máy chủ để liên kết với:

```bash
docker run -d --name web -p 127.0.0.1:8080:80 nginx:latest
```

Điều này chỉ hiển thị cổng trên localhost chứ không hiển thị trên tất cả các giao diện máy chủ.

Đối với một cổng máy chủ ngẫu nhiên, hãy sử dụng:

```bash
docker run -d --name web -p 127.0.0.1::80 nginx:latest
```

Docker chỉ định một cổng có sẵn ngẫu nhiên. Để xem cổng nào đã được chỉ định:

```bash
docker port web
```

## Kiểm tra và khắc phục sự cố mạng

Để xem container nào được kết nối với mạng:

```bash
docker network inspect my-network
```

Đối với container có vấn đề về kết nối, bạn có thể xem cài đặt mạng của họ:

```bash
docker inspect --format='{{json .NetworkSettings}}' web | jq
```

Điều này sử dụng `jq` để định dạng đầu ra JSON (cài đặt nó nếu bạn không có nó).

## Ví dụ về giao tiếp container-to-container

Hãy xây dựng một ví dụ thực tế với ứng dụng web kết nối với cơ sở dữ liệu:

```bash
# Create a network
docker network create webapp-network

# Start a MongoDB container
docker run -d \
  --name mongo \
  --network webapp-network \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Start a Node.js application that connects to MongoDB
docker run -d \
  --name nodeapp \
  --network webapp-network \
  -p 3000:3000 \
  -e MONGO_URL=mongodb://admin:password@mongo:27017/myapp \
  myapp:latest
```

Trong ví dụ này:

1. Cả container đều tham gia `webapp-network`
2. Ứng dụng Node.js sử dụng `mongo` làm tên máy chủ để kết nối với MongoDB
3. Chỉ ứng dụng Node.js mới hiển thị cổng tới máy chủ

## Kết nối mạng Docker với Compose

Docker Compose đơn giản hóa việc kết nối mạng cho các ứng dụng đa container. Chúng tôi sẽ đề cập sâu hơn về vấn đề này trong phần tiếp theo nhưng đây là bản xem trước về cách hoạt động của mạng trong Compose:

```yaml
version: '3'
services:
  web:
    image: nginx:latest
    ports:
      - '8080:80'
  db:
    image: postgres:13
    environment:
      POSTGRES_PASSWORD: example
```

Khi bạn chạy `docker-compose up`, Soạn tự động:

1. Tạo mạng mặc định cho bố cục
2. Kết nối tất cả các dịch vụ với mạng này
3. Thiết lập độ phân giải tên giữa các dịch vụ

## Mạng lớp phủ cho giao tiếp nhiều máy chủ

Nếu bạn đang chạy Docker ở chế độ Swarm (một cụm máy chủ Docker), mạng lớp phủ cho phép container trên các máy chủ khác nhau giao tiếp như thể chúng ở trên cùng một máy chủ:

```bash
# Initialize a swarm
docker swarm init

# Create an overlay network
docker network create --driver overlay my-overlay-network

# Create a service using this network
docker service create \
  --name my-service \
  --network my-overlay-network \
  --replicas 2 \
  nginx:latest
```

## Đưa các dịch vụ container ra thế giới bên ngoài

Đối với các ứng dụng production, bạn thường cần hiển thị các dịch vụ cho máy khách bên ngoài. Dưới đây là các mẫu phổ biến:

### Ánh xạ cổng trực tiếp

Cách tiếp cận đơn giản nhất là lập bản đồ cổng, như chúng ta đã thấy:

```bash
docker run -d -p 80:80 -p 443:443 --name web nginx:latest
```

### Sử dụng proxy ngược

Đối với các thiết lập phức tạp hơn, proxy ngược như Nginx hoặc Traefik có thể định tuyến lưu lượng truy cập đến container khác nhau:

```bash
# Create a network
docker network create proxy-network

# Run backend services
docker run -d --name api1 --network proxy-network myapi:latest
docker run -d --name api2 --network proxy-network myotherapi:latest

# Run the reverse proxy
docker run -d \
  --name nginx-proxy \
  --network proxy-network \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx:latest
```

Với cấu hình như:

```nginx
server {
    listen 80;

    location /api1 {
        proxy_pass http://api1:8000;
    }

    location /api2 {
        proxy_pass http://api2:8000;
    }
}
```

## Cân nhắc về an ninh mạng

Khi thiết kế mạng Docker, hãy xem xét các phương pháp bảo mật tốt nhất sau:

1. **Sử dụng mạng cầu nối tùy chỉnh** để cách ly tốt hơn giữa các nhóm container.

2. **Giới hạn các cổng tiếp xúc** chỉ ở những gì cần thiết.

3. **Sử dụng giao diện máy chủ-riêng tư** khi có thể:

   ```bash
   docker run -d -p 127.0.0.1:8080:80 --name web nginx:latest
   ```

4. **Xóa mạng cầu nối mặc định** khỏi container không cần truy cập bên ngoài.

5. **Triển khai chính sách mạng** nếu sử dụng Kubernetes hoặc Docker Enterprise.

## Cân nhắc hiệu suất mạng

Đối với các ứng dụng có hiệu suất mạng rất quan trọng:

1. **Sử dụng mạng máy chủ** khi cần hiệu suất tối đa:

   ```bash
   docker run -d --network host --name fast-app my-performance-app
   ```

2. **Xem xét trình điều khiển không cầu nối** như macvlan để có hiệu suất gần như nguyên bản.

3. **Enable IPv6** nếu môi trường của bạn hỗ trợ nó:

   ```bash
   docker network create --ipv6 --subnet fd00::/80 ipv6-network
   ```

4. **Điều chỉnh cài đặt MTU** cho container của bạn nếu làm việc trong môi trường có MTU không chuẩn:
   ```bash
   docker network create --opt com.docker.network.driver.mtu=1400 lowmtu-network
   ```

## Chạy container trên đám mây

Khi triển khai các ứng dụng được đóng gói lên đám mây, kết nối mạng là một yếu tố quan trọng cần cân nhắc. DigitalOcean cung cấp các tính năng mạng mạnh mẽ cho các ứng dụng dựa trên container, bao gồm các mạng riêng giữa các Droplets.

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận 200 USD tín dụng miễn phí và triển khai các ứng dụng container được nối mạng của bạn trong môi trường sẵn sàng cho production.

## Công cụ khắc phục sự cố mạng

Khi gỡ lỗi các sự cố mạng, các lệnh này rất hữu ích:

```bash
# Check network connectivity from inside a container
docker exec -it container-name ping other-container

# Examine container network interfaces
docker exec -it container-name ip addr show

# Trace network path
docker exec -it container-name traceroute other-container

# Analyze network traffic
docker exec -it container-name tcpdump -i eth0
```

Đối với container không cài đặt các công cụ này, bạn có thể sử dụng container khắc phục sự cố mạng:

```bash
docker run --rm -it --network container:target-container nicolaka/netshoot
```

Điều này mang lại cho bạn container với các công cụ mạng chia sẻ không gian tên mạng của container mục tiêu.

## Dọn dẹp mạng

Để xóa mạng không sử dụng:

```bash
docker network rm my-network
```

Để xóa tất cả các mạng không sử dụng:

```bash
docker network prune
```

Trong phần tiếp theo, chúng ta sẽ khám phá Docker Compose, giúp đơn giản hóa việc quản lý nhiều ứng dụng container bao gồm cả cấu hình mạng của chúng.
