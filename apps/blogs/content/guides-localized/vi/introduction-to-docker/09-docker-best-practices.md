---
title: "Thực tiễn tốt nhất về Docker"
description: Tìm hiểu các phương pháp thực hành cần thiết để bảo mật, hiệu quả và khả năng bảo trì khi triển khai Docker của bạn
order: 9
---

Khi Docker trở thành một phần quan trọng trong quy trình phát triển và triển khai của bạn, việc triển khai các biện pháp thực hành tốt nhất sẽ đảm bảo container của bạn được an toàn, hiệu quả và có thể bảo trì. Phần này bao gồm các phương pháp thiết yếu sẽ giúp bạn tránh những cạm bẫy phổ biến và tối ưu hóa việc sử dụng Docker của bạn.

## Thực tiễn tốt nhất về bảo mật

### Sử dụng image chính thức và đã được xác minh

Luôn ưu tiên image chính thức từ Docker Hub hoặc nhà xuất bản đã được xác minh image. Chúng trải qua quá trình quét bảo mật và tuân theo các phương pháp hay nhất:

```bash
docker pull python:3.11-slim
```

Thay vì:

```bash
docker pull random-user/python
```

### Quét image để tìm lỗ hổng

Thường xuyên quét image của bạn để tìm các lỗ hổng bảo mật:

```bash
# Using Docker Scout (integrated into Docker Desktop)
docker scout cves myapp:latest

# Or using third-party tools like Trivy
trivy image myapp:latest
```

### Chạy container với đặc quyền hạn chế

Theo mặc định, container chạy dưới quyền root, điều này gây ra rủi ro bảo mật. Sử dụng người dùng không phải root trong Dockerfiles của bạn:

```dockerfile
FROM node:18-alpine

# Create app directory and a non-root user
WORKDIR /app
RUN addgroup -g 1001 appuser && \
    adduser -u 1001 -G appuser -D appuser

COPY --chown=appuser:appuser . .
RUN npm install

# Switch to non-root user
USER appuser

CMD ["node", "server.js"]
```

### Sử dụng cờ `--security-opt`

Áp dụng các tùy chọn bảo mật khi chạy container:

```bash
docker run --security-opt no-new-privileges --cap-drop=ALL --cap-add=NET_BIND_SERVICE myapp
```

Điều này ngăn chặn việc leo thang đặc quyền và loại bỏ tất cả các khả năng ngoại trừ khả năng liên kết với các cổng đặc quyền.

### Bật tính năng tin cậy nội dung

Ký và xác minh image bằng Docker Content Trust:

```bash
# Enable content trust
export DOCKER_CONTENT_TRUST=1

# Now docker pull/push will verify signatures
docker pull nginx:latest
```

### Sử dụng quản lý bí mật

Không bao giờ mã hóa dữ liệu nhạy cảm trong Dockerfiles hoặc image. Sử dụng các biến môi trường, bí mật Docker hoặc các công cụ quản lý bí mật chuyên dụng:

```dockerfile
# BAD: Hardcoded credentials
RUN echo "password123" > /app/password.txt

# GOOD: Use build args, environment variables, or mount secrets at runtime
```

### Giảm thiểu bề mặt tấn công

Giữ image của bạn ở mức tối thiểu để giảm bề mặt tấn công:

- Sử dụng đế mỏng hoặc đế cao image
- Chỉ cài đặt các gói cần thiết
- Xóa công cụ xây dựng sau khi biên dịch
- Sử dụng các bản dựng nhiều giai đoạn để giảm kích thước image cuối cùng

### Áp dụng giới hạn tài nguyên

Ngăn chặn các cuộc tấn công từ chối dịch vụ bằng cách hạn chế tài nguyên container:

```bash
docker run -d --name myapp \
  --memory="500m" --memory-swap="1g" \
  --cpus="0.5" \
  myapp:latest
```

## Thực tiễn tốt nhất về xây dựng image

### Sử dụng bản dựng nhiều giai đoạn

Bản dựng nhiều giai đoạn giúp image cuối cùng của bạn nhỏ gọn và không bị phụ thuộc vào bản dựng:

```dockerfile
# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

### Tối ưu hóa bộ nhớ đệm lớp

Sắp xếp các hướng dẫn Dockerfile từ thay đổi ít nhất đến thường xuyên nhất để tận dụng bộ nhớ đệm lớp:

```dockerfile
FROM node:18-alpine

# These layers change less frequently
WORKDIR /app
COPY package*.json ./
RUN npm install

# These layers change more frequently
COPY . .
RUN npm run build

CMD ["npm", "start"]
```

### Sử dụng tệp .dockerignore

Tạo tệp `.dockerignore` để ngăn các tệp không cần thiết được thêm vào ngữ cảnh xây dựng:

```
node_modules
npm-debug.log
Dockerfile
.git
.github
.dockerignore
.env*
*.md
```

Điều này tăng tốc độ xây dựng và ngăn không cho đưa các tệp nhạy cảm vào.

### Giảm thiểu số lượng lớp

Kết hợp các lệnh liên quan để giảm số lượng lớp:

```dockerfile
# BAD: Each RUN creates a new layer
RUN apt-get update
RUN apt-get install -y package1
RUN apt-get install -y package2
RUN apt-get clean

# GOOD: One layer for all related operations
RUN apt-get update && \
    apt-get install -y package1 package2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### Ghim các phiên bản cụ thể

Sử dụng các phiên bản cụ thể cho image cơ sở và các phần phụ thuộc:

```dockerfile
# BAD: No specific version
FROM node
RUN npm install express

# GOOD: Pinned versions
FROM node:18.17.1-alpine3.18
RUN npm install express@4.18.2
```

Điều này đảm bảo các bản dựng có thể tái tạo và ngăn chặn những thay đổi không mong muốn.

### Sử dụng đế nhỏ image

Chọn đế nhỏ nhất thích hợp image:

```dockerfile
# Large base image (~940MB)
FROM node:18

# Smaller base image (~180MB)
FROM node:18-alpine
```

Các biến thể Alpine và Slim thường giúp giảm kích thước đáng kể.

## Thực tiễn tốt nhất về thời gian chạy

### Đặt chính sách khởi động lại phù hợp

Định cấu hình container để tự động khởi động lại khi cần:

```bash
docker run -d --restart=unless-stopped myapp
```

Khởi động lại chính sách:

- `no`: Mặc định, container sẽ không tự động khởi động lại
- `on-failure[:max-retries]`: Khởi động lại nếu container thoát với mã khác 0
- `always`: Luôn khởi động lại bất kể trạng thái thoát
- `unless-stopped`: Luôn khởi động lại trừ khi dừng rõ ràng

### Sử dụng Kiểm tra sức khỏe

Thêm kiểm tra sức khỏe để theo dõi sức khỏe container:

```dockerfile
FROM nginx:alpine
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

Hoặc khi chạy container:

```bash
docker run -d --health-cmd="curl -f http://localhost/ || exit 1" \
  --health-interval=30s nginx:alpine
```

### Đặt tên container

Đặt tên cho container của bạn để dễ nhận biết và tham khảo hơn:

```bash
docker run -d --name backend-api myapp:latest
```

### Sử dụng volume cho dữ liệu liên tục

Lưu trữ dữ liệu cần tồn tại trong volume:

```bash
docker run -d --name db \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:13
```

### Đặt giới hạn tài nguyên trong production

Luôn đặt giới hạn bộ nhớ và CPU trong production:

```bash
docker run -d --name production-app \
  --memory="2g" --memory-reservation="1.5g" \
  --cpus="1.5" \
  myapp:latest
```

### Sử dụng Xoay vòng nhật ký

Ngăn container lấp đầy dung lượng ổ đĩa bằng nhật ký:

```bash
docker run -d --name app \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myapp:latest
```

## Các phương pháp hay nhất về phối hợp container

### Sử dụng Docker Compose cho các ứng dụng Multi-container

Docker Compose đơn giản hóa việc quản lý nhiều ứng dụng container:

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - '8000:8000'
    depends_on:
      - db
    restart: always
  db:
    image: postgres:13
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data:
```

### Xem xét các công cụ điều phối cho production

Đối với môi trường production, hãy xem xét các nền tảng điều phối cung cấp các tính năng nâng cao:

- Docker Swarm (đơn giản hơn, tích hợp với Docker)
- Kubernetes (mạnh hơn, tiêu chuẩn ngành)
- Amazon ECS (được quản lý hoàn toàn cho AWS)
- DigitalOcean Kubernetes (Kubernetes đơn giản hóa)

### Triển khai khám phá dịch vụ

Sử dụng cơ chế khám phá dịch vụ để cho phép container tìm thấy nhau:

```yaml
version: '3.8'
services:
  web:
    image: myapp:latest
    environment:
      - DB_HOST=db # Uses the service name for discovery
    depends_on:
      - db
  db:
    image: postgres:13
```

## Thực tiễn tốt nhất về giám sát và ghi nhật ký

### Triển khai giám sát container

Theo dõi tình trạng và hiệu suất của container bằng các công cụ như:

- Prometheus và Grafana
- Cơ quan dữ liệu
- Di tích mới
- cCố vấn

### Tập trung nhật ký

Gửi nhật ký container đến hệ thống ghi nhật ký tập trung:

```bash
docker run -d --name app \
  --log-driver=fluentd \
  --log-opt fluentd-address=localhost:24224 \
  myapp:latest
```

Ngăn xếp ghi nhật ký phổ biến bao gồm:

- Ngăn xếp ELK (Elaticsearch, Logstash, Kibana)
- Graylog
- Loki với Grafana

### Thêm nhãn có ý nghĩa

Sử dụng nhãn để sắp xếp và lọc container của bạn:

```dockerfile
LABEL maintainer="team@example.com" \
      app="backend-api" \
      version="1.2.3" \
      environment="production"
```

Hoặc khi chạy container:

```bash
docker run -d --name app \
  --label environment=production \
  --label team=backend \
  myapp:latest
```

## Thực tiễn tốt nhất về CI/CD

### Tự động hóa tòa nhà image

Triển khai CI/CD pipeline cho tòa nhà image tự động:

```yaml
# GitHub Actions example
name: Build and Push Docker Image
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Run Tests
        run: docker run --rm myapp:${{ github.sha }} npm test
      - name: Push to Registry
        run: |
          docker tag myapp:${{ github.sha }} registry.example.com/myapp:${{ github.sha }}
          docker tag myapp:${{ github.sha }} registry.example.com/myapp:latest
          docker push registry.example.com/myapp:${{ github.sha }}
          docker push registry.example.com/myapp:latest
```

### Triển khai thử nghiệm tự động

Kiểm tra image của bạn như một phần của CI/CD pipeline:

- Kiểm tra đơn vị bên trong container
- Kiểm tra tích hợp với Docker Compose
- Quét bảo mật
- Kiểm tra tuân thủ

### Phiên bản image của bạn đúng cách

Sử dụng chiến lược tạo phiên bản nhất quán:

```bash
# Tag with semantic version and Git hash
docker build -t myapp:1.2.3 -t myapp:1.2.3-abcd123 .
```

## Tài liệu Thực tiễn tốt nhất

### Yêu cầu xây dựng và chạy tài liệu

Tạo một README toàn diện với hướng dẫn xây dựng và chạy:

```markdown
# MyApp Container

## Build

    docker build -t myapp .

## Run

    docker run -d -p 8000:8000 -e DB_HOST=localhost myapp

## Environment Variables

- `DB_HOST`: Database hostname (required)
- `PORT`: Application port (default: 8000)
- `LOG_LEVEL`: Logging level (default: info)
```

### Tài liệu Các phiên bản image

Duy trì nhật ký thay đổi cho image của bạn:

```
# Changelog

## 1.2.0 (2023-05-15)
- Added feature X
- Updated base image to Node.js 18

## 1.1.0 (2023-04-10)
- Fixed security vulnerability in dependency Y
- Optimized build process
```

## Các phương pháp hay nhất về quy trình phát triển

### Sử dụng Docker cho môi trường phát triển

Tạo môi trường phát triển nhất quán với Docker:

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
```

### Sử dụng Bind Mount để phát triển

Gắn mã nguồn của bạn để cập nhật trực tiếp trong quá trình phát triển:

```bash
docker run -d --name dev-env \
  -v $(pwd):/app \
  -p 3000:3000 \
  myapp:dev
```

### Gỡ lỗi bên trong container

Thiết lập khả năng gỡ lỗi trong quá trình phát triển container của bạn:

```dockerfile
# Dockerfile.dev
FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Expose debug port
EXPOSE 3000 9229

# Command with debugging enabled
CMD ["node", "--inspect=0.0.0.0:9229", "index.js"]
```

Sau đó kết nối IDE của bạn với cổng gỡ lỗi.

## Các phương pháp hay nhất về triển khai đám mây

Việc triển khai các ứng dụng Docker lên đám mây đòi hỏi phải cân nhắc thêm:

### Chọn mô hình triển khai phù hợp

Xem xét nhu cầu của bạn khi chọn mô hình triển khai:

- container tự quản lý trên máy ảo
- Các dịch vụ container được quản lý (AWS ECS, Nền tảng ứng dụng DigitalOcean)
- Kubernetes (được quản lý hoặc tự lưu trữ)

### Tối ưu hóa cho lưu trữ đám mây

Sử dụng dịch vụ lưu trữ đối tượng thay vì lưu trữ container cho nội dung tĩnh:

```dockerfile
FROM nginx:alpine
# Instead of copying static assets into the image
RUN apk add --no-cache aws-cli
CMD aws s3 sync s3://mybucket/assets /usr/share/nginx/html/assets && nginx -g 'daemon off;'
```

### Xem xét các dịch vụ được quản lý

Đối với các thành phần phổ biến như cơ sở dữ liệu, hàng đợi tin nhắn và bộ nhớ đệm, hãy cân nhắc sử dụng các dịch vụ được quản lý thay vì container trong production.

### Sử dụng DigitalOcean để đơn giản hóa việc triển khai container

DigitalOcean cung cấp các tùy chọn triển khai container đơn giản hóa để tự động triển khai nhiều phương pháp hay nhất này. [Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận được 200 đô la tín dụng miễn phí và triển khai các ứng dụng được đóng gói của bạn theo các phương pháp hay nhất.

## Các phương pháp hay nhất về hiệu suất và hiệu quả

### Sử dụng BuildKit để xây dựng nhanh hơn

Bật BuildKit để xây dựng nhanh hơn, hiệu quả hơn:

```bash
export DOCKER_BUILDKIT=1
docker build -t myapp .
```

Hoặc trong Docker Compose:

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        BUILDKIT_INLINE_CACHE: 1
```

### Tối ưu hóa thời gian khởi động container

Giảm thiểu thời gian khởi động container để mở rộng quy mô tốt hơn:

- Sử dụng đế nhỏ hơn image
- Tối ưu hóa phần phụ thuộc
- Biên dịch mã trước thời hạn khi có thể
- Sử dụng hệ thống init với khả năng khởi động nhanh

### Thực hiện xử lý tắt máy đúng cách

Đảm bảo ứng dụng của bạn xử lý đúng cách các tín hiệu SIGTERM để tắt máy một cách nhẹ nhàng:

```javascript
// Node.js example
process.on('SIGTERM', () => {
  console.log('Graceful shutdown');
  server.close(() => {
    db.disconnect();
    process.exit(0);
  });
});
```

## Theo kịp các phương pháp hay nhất về Docker

Công nghệ Docker và container phát triển nhanh chóng. Luôn cập nhật bằng cách:

1. Theo dõi blog và tài liệu chính thức của Docker
2. Đăng ký nhận tư vấn bảo mật container
3. Tham gia cộng đồng Docker và Kubernetes
4. Luôn cập nhật công cụ và công cụ Docker của bạn
5. Thường xuyên xem xét và cập nhật Dockerfiles và thực tiễn của bạn

Trong phần tiếp theo, chúng ta sẽ khám phá cách chuẩn bị môi trường Docker của bạn để sử dụng production, bao gồm các cân nhắc về mở rộng quy mô, cân bằng tải và giám sát.
