---
title: "Docker Compose"
description: Chạy nhiều ứng dụng container từ một tệp YAML duy nhất với Docker Compose. Bao gồm các dịch vụ, mạng, volume, cấu hình và bộ lệnh chung.
order: 8
---

Việc quản lý nhiều container theo cách thủ công có thể nhanh chóng trở nên phức tạp. Docker Compose giải quyết vấn đề này bằng cách cho phép bạn xác định và chạy nhiều ứng dụng container bằng một tệp YAML duy nhất. Điều này giúp đơn giản hóa quá trình xây dựng, chạy và kết nối các dịch vụ trong khi vẫn duy trì cấu hình của chúng trong kiểm soát phiên bản.

## Tìm hiểu Docker Compose

Docker Compose là một công cụ để xác định và chạy các ứng dụng Docker đa container. Với Compose, bạn sử dụng tệp YAML để định cấu hình các dịch vụ, mạng và volume của ứng dụng. Sau đó, bằng một lệnh duy nhất, bạn tạo và khởi động tất cả các dịch vụ từ cấu hình của mình.

## Cài đặt Docker Compose

Docker Desktop cho Mac và Windows bao gồm Docker Compose theo mặc định. Đối với Linux, bạn có thể cần cài đặt riêng:

```bash
# For the latest standalone Compose binary
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Docker hiện cũng cung cấp Compose dưới dạng plugin cho Docker CLI (phiên bản mới hơn):

```bash
docker compose version
```

so với

```bash
docker-compose version
```

Cả hai đều hoạt động nhưng chúng tôi sẽ sử dụng `docker-compose` trong hướng dẫn này để đảm bảo khả năng tương thích.

## Tạo một tập tin soạn thảo

Hãy tạo một ứng dụng web đơn giản với frontend, backend và cơ sở dữ liệu bằng Docker Compose.

Tạo một tệp có tên `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Frontend service
  frontend:
    image: nginx:alpine
    ports:
      - '8080:80'
    volumes:
      - ./frontend:/usr/share/nginx/html
    depends_on:
      - backend

  # Backend API service
  backend:
    build: ./backend
    ports:
      - '5000:5000'
    environment:
      - DATABASE_URL=postgres://postgres:password@db:5432/app
    depends_on:
      - db

  # Database service
  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=app

volumes:
  postgres_data:
```

Cấu hình này:

1. Tạo ba dịch vụ: `frontend`, `backend` và `db`
2. Chỉ định container image, ánh xạ cổng, volume và các biến môi trường
3. Xác định sự phụ thuộc giữa các dịch vụ
4. Tạo volume liên tục cho cơ sở dữ liệu

## Khái niệm soạn thảo cốt lõi

### Dịch vụ

Mỗi dịch vụ trong tệp Soạn thư đại diện cho một container. Các dịch vụ được xác định với cấu hình tương tự như tham số lệnh `docker run`.

Các tùy chọn dịch vụ chính bao gồm:

- `image`: Chỉ định image sẽ sử dụng
- `build`: Xây dựng image tùy chỉnh từ Dockerfile
- `ports`: Ánh xạ các cổng container tới các cổng máy chủ
- `volumes`: Gắn kết các thư mục máy chủ hoặc được đặt tên là volume
- `environment`: Đặt biến môi trường
- `depends_on`: Thiết lập các dịch vụ phụ thuộc
- `restart`: Đặt chính sách khởi động lại

### Volume

volume trong Compose hoạt động giống như Docker volume, cho phép dữ liệu tồn tại lâu hơn tuổi thọ của container:

```yaml
volumes:
  postgres_data: # Named volume definition
```

Sau đó, các dịch vụ có thể sử dụng các volume này:

```yaml
services:
  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data # Mount the named volume
      - ./init-scripts:/docker-entrypoint-initdb.d # Bind mount from host
```

### Mạng

Compose tự động tạo mạng mặc định cho ứng dụng của bạn nhưng bạn có thể xác định mạng tùy chỉnh:

```yaml
services:
  backend:
    networks:
      - backend-network
      - db-network

  db:
    networks:
      - db-network

networks:
  backend-network:
  db-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24
```

## Các lệnh Docker Compose cơ bản

### Bắt đầu ứng dụng của bạn

Để bắt đầu tất cả các dịch vụ được xác định trong tệp Soạn của bạn:

```bash
docker-compose up
```

Để chạy ở chế độ tách rời (nền):

```bash
docker-compose up -d
```

### Dừng dịch vụ

Để dừng các dịch vụ đang chạy của bạn:

```bash
docker-compose down
```

Để dừng dịch vụ và xóa volume:

```bash
docker-compose down -v
```

### Xem nhật ký dịch vụ

Để xem nhật ký từ tất cả các dịch vụ:

```bash
docker-compose logs
```

Để theo dõi nhật ký từ các dịch vụ cụ thể:

```bash
docker-compose logs -f backend db
```

### Dịch vụ niêm yết

Để xem trạng thái dịch vụ của bạn:

```bash
docker-compose ps
```

### Thực thi các lệnh trong dịch vụ

Để chạy lệnh một lần trong dịch vụ container:

```bash
docker-compose exec backend python manage.py migrate
```

Hoặc đối với phiên bản container mới:

```bash
docker-compose run --rm backend python manage.py createsuperuser
```

## Ví dụ soạn thư trong thế giới thực

Hãy xem một ví dụ chi tiết hơn về ứng dụng web full-stack:

```yaml
version: '3.8'

services:
  # Reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
      - ./nginx/certs:/etc/nginx/certs
      - ./frontend/build:/usr/share/nginx/html
    depends_on:
      - api
    restart: always

  # React frontend build process
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost/api
    ports:
      - '3000:3000'
    command: npm start

  # Node.js API server
  api:
    build: ./backend
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://postgres:password@db:5432/app
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - db
      - redis
    restart: always

  # PostgreSQL database
  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=app
    ports:
      - '5432:5432'
    restart: always

  # Redis for caching
  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
    ports:
      - '6379:6379'
    restart: always

volumes:
  postgres_data:
  redis_data:
```

Thiết lập này bao gồm:

- Nginx làm proxy ngược phục vụ bản dựng frontend
- Một sự phát triển frontend container với tính năng tải lại nóng
- API container được kết nối với Postgres và Redis
- volume liên tục cho cơ sở dữ liệu và dữ liệu bộ đệm
- Chính sách khởi động lại phù hợp cho dịch vụ

## Biến môi trường trong Compose

Bạn có thể chuyển các biến môi trường cho container theo nhiều cách:

### Biến môi trường nội tuyến

```yaml
services:
  web:
    environment:
      - DEBUG=true
      - API_KEY=myapikey
```

### Sử dụng tệp môi trường

```yaml
services:
  web:
    env_file:
      - .env.web
```

Trong đó `.env.web` chứa:

```
DEBUG=true
API_KEY=myapikey
```

### Sử dụng biến môi trường máy chủ

Bạn cũng có thể sử dụng các biến từ máy chủ của mình:

```yaml
services:
  web:
    environment:
      - API_KEY=${HOST_API_KEY}
```

Sau đó chạy với:

```bash
HOST_API_KEY=myapikey docker-compose up
```

## Dịch vụ mở rộng quy mô

Docker Compose cho phép bạn chạy nhiều phiên bản của một dịch vụ:

```bash
docker-compose up -d --scale worker=3
```

Điều này sẽ bắt đầu ba phiên bản của dịch vụ có tên `worker`.

Trong tệp Soạn thư của bạn, hãy đảm bảo sử dụng các liên kết cổng không xung đột cho các dịch vụ có thể mở rộng:

```yaml
services:
  worker:
    image: my-worker-image
    # Don't bind to a fixed host port if you want to scale
    # ports:
    #   - "8080"  # Only exposes the container port without binding to host
```

## Mở rộng tệp soạn thảo

Đối với các môi trường khác nhau, bạn có thể mở rộng tệp Soạn chính của mình bằng các phần ghi đè:

**docker-compose.yml** (Cấu hình cơ bản):

```yaml
version: '3.8'

services:
  web:
    image: myapp:latest
    build: .
    ports:
      - '8000:8000'
```

**docker-compose.prod.yml** (ghi đè production):

```yaml
version: '3.8'

services:
  web:
    restart: always
    environment:
      - NODE_ENV=production
    ports:
      - '80:8000'
```

Chạy với:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Soạn thảo cho quy trình phát triển

Docker Compose rất tuyệt vời cho môi trường phát triển:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app # Mount current directory to /app in the container
      - /app/node_modules # Volume for node_modules to prevent overwriting
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
    command: npm run dev # Use development command
```

Các tính năng phát triển chính:

- Gắn các thư mục mã để cập nhật trực tiếp
- Ghi đè các lệnh production bằng các lựa chọn thay thế phát triển
- Tạo các biến môi trường dành riêng cho phát triển

## Soạn cho production

Mặc dù Docker Compose chủ yếu là một công cụ phát triển nhưng nó có thể được sử dụng trong production để triển khai đơn giản:

```yaml
version: '3.8'

services:
  app:
    image: mycompany/myapp:${TAG:-latest}
    restart: always
    ports:
      - '80:8000'
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

Lưu ý: Để triển khai production phức tạp hơn, hãy xem xét Docker Swarm hoặc Kubernetes.

## Kiểm tra tình trạng trong Compose

Kiểm tra tình trạng đảm bảo dịch vụ của bạn đang chạy chính xác:

```yaml
services:
  web:
    image: nginx
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Các dịch vụ khác có thể phụ thuộc vào việc kiểm tra sức khỏe này:

```yaml
services:
  backend:
    depends_on:
      web:
        condition: service_healthy
```

## Quản lý bí mật trong Compose

Đối với các cấu hình không nhạy cảm, các biến môi trường hoạt động tốt. Đối với bí mật, hãy xem xét các phương pháp sau:

1. **Local Development**: Sử dụng các tệp `.env` (nhưng không sử dụng commit để kiểm soát phiên bản)

2. **Production**: Sử dụng các công cụ quản lý bí mật bên ngoài và chèn các giá trị khi chạy

Đối với Docker Swarm, bạn có thể sử dụng bí mật Docker:

```yaml
version: '3.8'

services:
  web:
    image: myapp
    secrets:
      - db_password

secrets:
  db_password:
    file: ./db_password.txt
```

## Triển khai bằng Compose cho DigitalOcean

Các tệp Docker Compose hoạt động xuất sắc khi triển khai tới các nhà cung cấp đám mây như DigitalOcean. Bạn có thể thiết lập Droplet có cài đặt Docker và sử dụng tệp Compose để triển khai ứng dụng của mình.

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) và nhận tín dụng miễn phí trị giá 200 USD để triển khai các ứng dụng dựa trên Compose của bạn.

Các bước triển khai:

1. Tạo một Droplet với Docker được cài đặt sẵn (Ứng dụng Docker một cú nhấp chuột)
2. Sao chép tệp dự án của bạn và Soạn tệp vào Droplet
3. Chạy `docker-compose up -d` trên Droplet

## Soạn thông số kỹ thuật và phiên bản

Các tệp Docker Compose đã phát triển qua nhiều phiên bản. Tính đến năm 2023, phiên bản 3.x là phiên bản phổ biến nhất, với phiên bản mới nhất là Thông số Compose:

```yaml
# Modern Compose Specification format
name: myapp
services:
  web:
    image: nginx
```

Các phiên bản chính:

- **Version 1**: Định dạng cũ, không còn được khuyến nghị
- **Version 2**: Đã thêm các mạng có tên và phụ thuộc_on
- **Version 3**: Được thiết kế cho cả Compose và Swarm, với một số hạn chế
- **Compose Spec**: Định dạng mới nhất thống nhất cú pháp trên các nền tảng

## Các phương pháp thực hành tốt nhất cho Docker Compose

1. **Sử dụng kiểm soát phiên bản** cho các tệp Soạn thảo của bạn

2. **Tuân theo cấu trúc dự án nhất quán**:

   ```
   myapp/
   ├── docker-compose.yml
   ├── docker-compose.override.yml
   ├── .env
   ├── service1/
   │   ├── Dockerfile
   │   └── ...
   └── service2/
       ├── Dockerfile
       └── ...
   ```

3. **Tạo riêng Soạn các tệp** cho các môi trường khác nhau

4. **Sử dụng tệp `.env`** cho các biến dành riêng cho môi trường

5. **Đặt chính sách khởi động lại** cho các dịch vụ cần có khả năng phục hồi

6. **Tận dụng kiểm tra tình trạng** cho các dịch vụ quan trọng

7. **Luôn chỉ định phiên bản** cho image (không bao giờ sử dụng `latest` trong production)

8. **DPhụ thuộc dịch vụ tài liệu** sử dụng `depends_on`

9. **Giới hạn đặc quyền container** theo nguyên tắc đặc quyền tối thiểu

10. **Giữ các tệp Soạn thảo của bạn DRY** bằng cách sử dụng các neo và tiện ích mở rộng YAML (đối với các thiết lập phức tạp)

Trong phần tiếp theo, chúng tôi sẽ đề cập đến các phương pháp hay nhất của Docker về bảo mật, hiệu suất và tối ưu hóa tài nguyên.
