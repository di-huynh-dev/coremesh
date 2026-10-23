---
title: "Làm việc với Docker volume"
description: Dữ liệu liên tục trên container khởi động lại với Docker volume. Các bìa được đặt tên so với volume ẩn danh, liên kết gắn kết, tmpfs, bản sao lưu và các cạm bẫy phổ biến.
order: 6
---

container về bản chất là phù du, mọi dữ liệu được ghi bên trong container sẽ bị mất khi container bị xóa. Đối với các ứng dụng cần lưu trữ dữ liệu, Docker cung cấp volume. volume là cơ chế ưu tiên để duy trì dữ liệu được tạo bởi Docker container.

## Hiểu các tùy chọn lưu trữ Docker

Docker cung cấp một số tùy chọn lưu trữ:

1. **Volumes**: Bộ lưu trữ do Docker quản lý bên ngoài hệ thống tệp của container
2. **Bind mounts**: Gắn tệp hoặc thư mục từ máy chủ vào container
3. **tmpfs mounts**: Lưu trữ dữ liệu trong bộ nhớ của hệ thống máy chủ (dễ bay hơi)

volume là phương pháp được đề xuất vì chúng:

- Được quản lý hoàn toàn bởi Docker
- Bị cô lập khỏi hệ thống tập tin của máy chủ
- Có thể sao lưu và khôi phục dễ dàng
- Hoạt động trên cả Linux và Windows container
- Có thể được chia sẻ an toàn hơn giữa nhiều container

## Tạo và quản lý volume

### Tạo volume

Để tạo volume có tên:

```bash
docker volume create my-data
```

Điều này tạo ra một volume tồn tại độc lập với bất kỳ container nào.

### Niêm yết volume

Để xem tất cả volume hiện có:

```bash
docker volume ls
```

Đầu ra ví dụ:

```
DRIVER    VOLUME NAME
local     my-data
```

### Kiểm tra volume

Để biết thông tin chi tiết về volume:

```bash
docker volume inspect my-data
```

Điều này trả về một đối tượng JSON có thông tin về volume:

```json
[
  {
    "CreatedAt": "2023-05-16T22:44:35Z",
    "Driver": "local",
    "Labels": {},
    "Mountpoint": "/var/lib/docker/volumes/my-data/_data",
    "Name": "my-data",
    "Options": {},
    "Scope": "local"
  }
]
```

### Loại bỏ volume

Để xóa volume:

```bash
docker volume rm my-data
```

Để xóa tất cả volume không sử dụng:

```bash
docker volume prune
```

## Sử dụng volume với container

Bạn đính kèm volume vào container bằng cờ `-v` hoặc `--mount` khi chạy container.

### Sử dụng volume có tên

```bash
docker run -d --name nginx-with-data -v my-data:/usr/share/nginx/html nginx:latest
```

Lệnh này:

1. Sử dụng (hoặc tạo nếu nó không tồn tại) volume có tên `my-data`
2. Gắn nó vào `/usr/share/nginx/html` bên trong container
3. Mọi dữ liệu được ghi vào đường dẫn đó trong container đều được lưu trữ trong volume

### Sử dụng cờ `--mount`

Cú pháp `--mount` mới hơn cung cấp một giải pháp thay thế rõ ràng hơn:

```bash
docker run -d --name nginx-with-data --mount source=my-data,target=/usr/share/nginx/html nginx:latest
```

Cả hai cách tiếp cận đều có tác dụng như nhau, nhưng `--mount` có cú pháp rõ ràng hơn cho các cấu hình phức tạp hơn.

## Ví dụ thực tế với volume

### Ví dụ 1: Cơ sở dữ liệu liên tục

Hãy chạy MySQL container với bộ lưu trữ dữ liệu liên tục:

```bash
# Create a volume for MySQL data
docker volume create mysql-data

# Run MySQL with the volume
docker run -d \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=my-secret-pw \
  -e MYSQL_DATABASE=myapp \
  -e MYSQL_USER=myuser \
  -e MYSQL_PASSWORD=mypassword \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0
```

Bây giờ, ngay cả khi bạn xóa container, dữ liệu cơ sở dữ liệu của bạn sẽ vẫn còn trong `mysql-data` volume:

```bash
# Remove the container
docker rm -f mysql-db

# Create a new container using the same volume
docker run -d \
  --name mysql-db-new \
  -e MYSQL_ROOT_PASSWORD=my-secret-pw \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0
```

container mới sẽ có tất cả dữ liệu từ dữ liệu trước đó.

### Ví dụ 2: Ứng dụng web có cấu hình

Đối với máy chủ web có cấu hình tùy chỉnh:

```bash
# Create volumes for content and configuration
docker volume create web-content
docker volume create web-config

# Run nginx with both volumes
docker run -d \
  --name web-server \
  -p 8080:80 \
  -v web-content:/usr/share/nginx/html \
  -v web-config:/etc/nginx/conf.d \
  nginx:latest
```

Bây giờ bạn có thể điền nội dung và cấu hình của mình vào volume này.

## Sử dụng Bind Mount để phát triển

Trong quá trình phát triển, việc gắn các thư mục mã cục bộ vào container để chỉnh sửa theo thời gian thực thường rất hữu ích:

```bash
docker run -d \
  --name dev-environment \
  -p 3000:3000 \
  -v $(pwd):/app \
  node:18-alpine \
  sh -c "cd /app && npm install && npm start"
```

Thao tác này sẽ gắn thư mục hiện tại của bạn vào thư mục `/app` trong container.

Đối với Windows PowerShell, hãy sử dụng:

```powershell
docker run -d `
  --name dev-environment `
  -p 3000:3000 `
  -v ${PWD}:/app `
  node:18-alpine `
  sh -c "cd /app && npm install && npm start"
```

## Volume chỉ đọc

Để tăng cường bảo mật, bạn có thể gắn volume ở dạng chỉ đọc:

```bash
docker run -d \
  --name secure-nginx \
  -v web-content:/usr/share/nginx/html:ro \
  -p 8080:80 \
  nginx:latest
```

Hậu tố `:ro` làm cho volume chỉ đọc trong container.

## Trình điều khiển volume cho bộ nhớ từ xa

Docker hỗ trợ nhiều trình điều khiển volume khác nhau cho phép lưu trữ dữ liệu trên các hệ thống từ xa:

```bash
# Create a volume using a specific driver
docker volume create --driver=rexray/ebs \
  --opt size=10 \
  --opt volumetype=gp2 \
  remote-storage

# Use the volume with a container
docker run -d \
  --name remote-data-app \
  -v remote-storage:/data \
  myapp:latest
```

Ví dụ này sử dụng trình điều khiển rexray/ebs để tạo Amazon EBS volume.

## Sao lưu và khôi phục với volume

Bạn có thể sao lưu volume bằng cách chạy container tạm thời:

```bash
# Backup
docker run --rm \
  -v mysql-data:/source:ro \
  -v $(pwd):/backup \
  alpine:latest \
  tar czvf /backup/mysql-backup.tar.gz -C /source .
```

Và khôi phục bản sao lưu sang volume mới:

```bash
# Create a new volume
docker volume create mysql-data-restored

# Restore the backup
docker run --rm \
  -v mysql-data-restored:/target \
  -v $(pwd):/backup \
  alpine:latest \
  sh -c "tar xzvf /backup/mysql-backup.tar.gz -C /target"
```

## Dữ liệu volume container

Một mẫu khác là tạo container dành riêng để lưu trữ dữ liệu volume, sau đó gắn volume của nó vào container khác:

```bash
# Create a data container
docker create \
  --name data-container \
  -v data-volume:/data \
  alpine:latest \
  /bin/true

# Use volumes from the data container
docker run -d \
  --name app1 \
  --volumes-from data-container \
  myapp:latest
```

Ưu điểm là bạn có thể quản lý volume liên quan cùng nhau.

## Quản lý vòng đời volume

volume không tự động bị xóa khi container bị xóa, đây thường là điều bạn muốn đối với dữ liệu liên tục. Tuy nhiên, bạn có thể sử dụng cờ `--rm` với tùy chọn `-v` để xóa volume ẩn danh khi container bị xóa:

```bash
docker run --rm -v /data alpine:latest echo "This container creates and removes an anonymous volume"
```

Đối với volume có tên, bạn cần xóa chúng theo cách thủ công như minh họa trước đó.

## Chia sẻ volume giữa container

Nhiều container có thể sử dụng cùng một volume:

```bash
# Create a shared volume
docker volume create shared-data

# Run container 1
docker run -d \
  --name app1 \
  -v shared-data:/data \
  myapp:latest

# Run container 2
docker run -d \
  --name app2 \
  -v shared-data:/data \
  myapp:latest
```

Cả container đều có quyền truy cập vào cùng một dữ liệu trong volume.

## Lưu trữ volume dựa trên đám mây

Khi chạy container trên đám mây, bạn có thể sử dụng các giải pháp volume dành riêng cho nền tảng. Block Storage của DigitalOcean cung cấp volume dựa trên SSD có thể được gắn vào Droplets chạy Docker của bạn.

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận được 200 USD tín dụng miễn phí và dùng thử dịch vụ Block Storage của họ với các ứng dụng được đóng gói trong vùng chứa của bạn.

## Gắn kết tmpfs cho dữ liệu nhạy cảm

Đối với dữ liệu nhạy cảm mà bạn không muốn lưu giữ, bạn có thể sử dụng giá trị gắn kết tmpfs để lưu trữ dữ liệu trong bộ nhớ của máy chủ:

```bash
docker run -d \
  --name secure-app \
  --tmpfs /app/secrets:rw,noexec,nosuid,size=10M \
  myapp:latest
```

Điều này tạo ra một mount tmpfs tại `/app/secrets` với các tùy chọn cụ thể:

- `rw`: Truy cập đọc-ghi
- `noexec`: Không thể thực thi các tệp nhị phân từ giá trị gắn kết này
- `nosuid`: Không thể thực thi các tệp nhị phân setuid
- `size=10M`: Giới hạn kích thước ở mức 10MB

## Thực tiễn tốt nhất cho Docker volume

1. **Sử dụng các tập được đặt tên**: volume được đặt tên dễ theo dõi và quản lý hơn volume ẩn danh.

2. **DTài liệu volume sử dụng**: Theo dõi volume nào được sử dụng cho mục đích gì.

3. **Sao lưu dữ liệu quan trọng**: Thường xuyên sao lưu dữ liệu quan trọng volume.

4. **Xem xét quyền truy cập chỉ đọc**: Khi container chỉ cần đọc dữ liệu, hãy gắn volume ở dạng chỉ đọc để tăng cường bảo mật.

5. **Set volume owner**: Đối với các ứng dụng chạy với tư cách người dùng không phải root, hãy đảm bảo quyền thích hợp đối với dữ liệu volume:

   ```bash
   docker run --rm -v my-data:/data alpine chown -R 1000:1000 /data
   ```

6. **Sử dụng nhãn volume**: Thêm siêu dữ liệu vào volume với nhãn:

   ```bash
   docker volume create --label project=myapp --label environment=production app-data
   ```

7. **Tách dữ liệu khỏi ứng dụng**: Việc tách này cho phép bạn cập nhật ứng dụng mà không ảnh hưởng đến dữ liệu.

Trong phần tiếp theo, chúng tôi sẽ đề cập đến mạng Docker để cho phép liên lạc giữa container.
