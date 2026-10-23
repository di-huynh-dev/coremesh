---
title: "Tạo container đầu tiên của bạn"
description: Chạy Docker container đầu tiên của bạn và tìm hiểu các lệnh quan trọng. Bao gồm việc chạy docker, thực thi, ghi nhật ký, dừng, cổng, chế độ tách rời và kiểm tra container trạng thái.
order: 4
---

Bây giờ bạn đã hiểu Docker image, đã đến lúc sử dụng chúng để chạy container. container là một phiên bản có thể chạy được của image, đó là phiên bản bạn thực sự triển khai và sử dụng trong các ứng dụng của mình. Trong phần này, bạn sẽ tìm hiểu cách chạy, quản lý và làm việc với Docker container.

## Chạy container đầu tiên của bạn

Hãy bắt đầu với một container đơn giản bằng máy chủ web nginx image mà bạn đã lấy ở phần trước:

```bash
docker run nginx:latest
```

Chạy lệnh này:

1. Tạo container mới từ nginx:image mới nhất
2. Khởi động container
3. Gắn thiết bị đầu cuối của bạn vào thiết bị xuất chuẩn/thiết bị xuất chuẩn của container

Bạn sẽ thấy nhật ký nginx trong thiết bị đầu cuối của mình:

```
/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
...
```

container này đang chạy ở nền trước. Để dừng nó, nhấn `Ctrl+C`.

## Chạy container ở Chế độ tách rời

Đối với hầu hết các trường hợp, bạn sẽ muốn chạy container ở chế độ nền (chế độ tách rời):

```bash
docker run -d nginx:latest
```

Cờ `-d` báo cho Docker chạy container ở chế độ nền. Docker phản hồi bằng ID container:

```
7d14a361fe7c3a2ad868184c0ac7a112bc2eb2ee424fa6c8a3a52c6c8afb2dfe
```

## Đặt tên container

Theo mặc định, Docker gán tên ngẫu nhiên cho container. Bạn có thể chỉ định tên bằng cờ `--name`:

```bash
docker run -d --name my-nginx nginx:latest
```

Việc sử dụng tên có ý nghĩa sẽ giúp việc tham chiếu container trong các lệnh khác dễ dàng hơn.

## Danh sách đang chạy container

Để xem tất cả container đang chạy:

```bash
docker ps
```

Đầu ra ví dụ:

```
CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS     NAMES
d292c4f70394   nginx:latest   "/docker-entrypoint.…"   9 seconds ago   Up 8 seconds   80/tcp    my-nginx
```

Để xem tất cả container, bao gồm cả những cái đã dừng:

```bash
docker ps -a
```

## Hiển thị các cổng container

container có mạng riêng biệt. Để truy cập các dịch vụ của container từ máy chủ của bạn, bạn cần xuất bản các cổng bằng cờ `-p`:

```bash
docker run -d --name web-server -p 8080:80 nginx:latest
```

Điều này ánh xạ cổng 80 bên trong container sang cổng 8080 trên máy chủ của bạn. Bây giờ bạn có thể truy cập nginx bằng cách truy cập `http://localhost:8080` trong trình duyệt của mình.

Định dạng để ánh xạ cổng là `-p host_port:container_port`.

Bạn có thể ánh xạ nhiều cổng:

```bash
docker run -d --name web-app -p 8080:80 -p 8443:443 nginx:latest
```

## Xem nhật ký container

Để xem nhật ký từ container:

```bash
docker logs my-nginx
```

Để theo dõi liên tục, hãy thêm cờ `-f` (theo dõi):

```bash
docker logs -f my-nginx
```

Điều này truyền phát nhật ký mới khi chúng được tạo. Nhấn `Ctrl+C` để dừng theo dõi.

## Thực thi các lệnh khi chạy container

Đôi khi bạn cần chạy các lệnh bên trong container đang chạy. Sử dụng lệnh `exec` cho việc này:

```bash
docker exec -it my-nginx bash
```

Các cờ `-it` có nghĩa là:

- `-i`: Giữ STDIN mở (tương tác)
- `-t`: Phân bổ TTY giả

Điều này cung cấp cho bạn một bash shell bên trong container nơi bạn có thể chạy các lệnh:

```
root@d292c4f70394:/# ls
bin   dev                  docker-entrypoint.sh  home  lib64  mnt  proc  run   srv  tmp  var
boot  docker-entrypoint.d  etc                   lib   media  opt  root  sbin  sys  usr
```

Gõ `exit` để thoát khỏi container shell.

## Dừng và khởi động container

Để dừng container đang chạy:

```bash
docker stop my-nginx
```

Thao tác này sẽ gửi tín hiệu SIGTERM đến quy trình chính, cho nó thời gian để tắt một cách nhẹ nhàng.

Để buộc dừng ngay lập tức:

```bash
docker kill my-nginx
```

Để khởi động lại container đã dừng:

```bash
docker start my-nginx
```

## Đang khởi động lại container

Docker container có thể được cấu hình để tự động khởi động lại khi chúng thoát hoặc khi Docker khởi động lại. Sử dụng cờ `--restart` khi tạo container:

```bash
docker run -d --restart always --name always-up nginx:latest
```

Khởi động lại chính sách:

- `no`: Không khởi động lại (mặc định)
- `on-failure[:max-retries]`: Chỉ khởi động lại nếu container thoát với trạng thái khác 0
- `always`: Luôn khởi động lại bất kể trạng thái thoát
- `unless-stopped`: Luôn khởi động lại trừ khi dừng rõ ràng

## Biến môi trường

Nhiều container có thể được cấu hình bằng các biến môi trường:

```bash
docker run -d --name custom-nginx -e NGINX_HOST=example.com -e NGINX_PORT=80 nginx:latest
```

Cờ `-e` đặt biến môi trường bên trong container.

## Dọn dẹp container

Để xóa container đã dừng:

```bash
docker rm my-nginx
```

Để buộc xóa container đang chạy:

```bash
docker rm -f my-nginx
```

Để xóa tất cả container đã dừng:

```bash
docker container prune
```

## Sử dụng volume với container

container chỉ là phù du, khi chúng bị xóa, mọi dữ liệu được ghi bên trong container sẽ bị mất. Đối với dữ liệu liên tục, hãy sử dụng volume:

```bash
docker run -d --name nginx-with-data -v nginx-data:/usr/share/nginx/html nginx:latest
```

Điều này tạo ra một volume có tên `nginx-data` và gắn nó vào `/usr/share/nginx/html` bên trong container.

Chúng tôi sẽ đề cập chi tiết hơn về volume trong phần sau.

## Giới hạn tài nguyên container

Bạn có thể giới hạn tài nguyên mà container có thể sử dụng:

```bash
docker run -d --name limited-nginx --cpus 0.5 --memory 512m nginx:latest
```

Điều này giới hạn container sử dụng 50% một lõi CPU và 512 MB bộ nhớ.

## Kiểm tra sức khỏe container

Kiểm tra tình trạng giúp Docker xác định xem container có hoạt động bình thường hay không:

```bash
docker run -d --name healthy-nginx --health-cmd="curl -f http://localhost/ || exit 1" --health-interval=5s nginx:latest
```

Lệnh này chạy lệnh được chỉ định cứ sau 5 giây để kiểm tra xem container có hoạt động tốt hay không.

## Mạng container

container có thể giao tiếp với nhau thông qua mạng Docker. Cách đơn giản nhất là sử dụng mạng cầu nối mặc định:

```bash
docker run -d --name db postgres:13
docker run -d --name web --link db:database -p 8080:80 mywebapp:latest
```

Cờ `--link` tạo liên kết từ web container tới db container, cho phép chúng giao tiếp. Web container có thể truy cập cơ sở dữ liệu bằng tên máy chủ `database`.

Chúng tôi sẽ đề cập đến mạng chi tiết hơn trong phần sau.

## Giám sát việc sử dụng tài nguyên container

Để xem mức sử dụng tài nguyên của container của bạn:

```bash
docker stats
```

Điều này hiển thị luồng trực tiếp về mức sử dụng CPU, bộ nhớ, mạng và ổ đĩa cho mỗi container.

## Ví dụ thực tế: Chạy một trang web WordPress

Hãy kết hợp tất cả lại với một ví dụ thực tế. Lệnh này chạy WordPress container được liên kết với cơ sở dữ liệu MySQL:

```bash
# First, create a network
docker network create wordpress-net

# Run MySQL container
docker run -d --name wordpress-db \
  --network wordpress-net \
  -e MYSQL_ROOT_PASSWORD=my-secret-pw \
  -e MYSQL_DATABASE=wordpress \
  -e MYSQL_USER=wordpress \
  -e MYSQL_PASSWORD=wordpress \
  mysql:5.7

# Run WordPress container
docker run -d --name wordpress-site \
  --network wordpress-net \
  -e WORDPRESS_DB_HOST=wordpress-db \
  -e WORDPRESS_DB_USER=wordpress \
  -e WORDPRESS_DB_PASSWORD=wordpress \
  -e WORDPRESS_DB_NAME=wordpress \
  -p 8080:80 \
  wordpress:latest
```

Sau khi chạy các lệnh này, bạn có thể truy cập trang web WordPress của mình tại http://localhost:8080.

## Môi trường phát triển trên đám mây

Đối với các nhóm phát triển, việc chạy Docker container trên đám mây mang đến một môi trường nhất quán mà mọi người đều có thể truy cập. DigitalOcean cung cấp một nền tảng tuyệt vời cho việc này với các Droplets dựa trên SSD nhanh được tối ưu hóa cho khối lượng công việc container.

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận tín dụng miễn phí trị giá 200 USD và triển khai các ứng dụng trong vùng chứa của bạn lên đám mây.

Trong phần tiếp theo, chúng ta sẽ tìm hiểu cách xây dựng Docker image tùy chỉnh của riêng bạn bằng Dockerfiles.
