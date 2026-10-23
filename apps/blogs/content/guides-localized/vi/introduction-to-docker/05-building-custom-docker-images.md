---
title: "Xây dựng Docker tùy chỉnh image"
description: Xây dựng Docker image tùy chỉnh với Dockerfiles. Bao gồm TỪ, SAO CHÉP, CHẠY, CMD, ĐIỂM NHẬP, bộ nhớ đệm lớp, bản dựng nhiều giai đoạn và thu nhỏ kích thước image cuối cùng.
order: 5
---

Sử dụng image dựng sẵn từ Docker Hub là một cách tuyệt vời để bắt đầu, nhưng cuối cùng bạn sẽ cần tạo image tùy chỉnh cho các ứng dụng của riêng mình. Đây là nơi Dockerfiles xuất hiện, chúng cung cấp một cách giống như tập lệnh để xác định chính xác cách xây dựng image.

## Hiểu Dockerfiles

Dockerfile là một tệp văn bản chứa hướng dẫn xây dựng Docker image. Mỗi lệnh tạo ra một lớp trong image, lớp này giúp lưu vào bộ nhớ đệm và nâng cao hiệu quả trong quá trình xây dựng.

Hãy bắt đầu với một ví dụ cơ bản cho ứng dụng Node.js đơn giản:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

Hãy chia nhỏ từng hướng dẫn:

- `FROM node:18-alpine`: Bắt đầu với cơ sở Linux Node.js 18 image
- `WORKDIR /app`: Đặt thư mục làm việc bên trong container
- `COPY package*.json ./`: Sao chép package.json và package-lock.json trước (để lưu vào bộ nhớ đệm tốt hơn)
- `RUN npm install`: Chạy npm install để cài đặt các phần phụ thuộc
- `COPY . .`: Sao chép phần còn lại của mã ứng dụng của bạn
- `EXPOSE 3000`: Tài liệu mà container nghe trên cổng 3000
- `CMD ["node", "index.js"]`: Chỉ định lệnh chạy khi container khởi động

## Tạo Dockerfile đầu tiên của bạn

Hãy tạo một ứng dụng web đơn giản với Express.js để minh họa cách xây dựng image tùy chỉnh.

1. Tạo một thư mục dự án và điều hướng đến nó:

```bash
mkdir docker-express-app
cd docker-express-app
```

2. Khởi tạo dự án Node.js và cài đặt Express:

```bash
npm init -y
npm install express
```

3. Tạo một tệp `index.js` đơn giản:

```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from Docker!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

4. Tạo một Dockerfile trong cùng thư mục:

```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# The app binds to port 3000
EXPOSE 3000

# Define the command to run your app
CMD ["node", "index.js"]
```

## Xây dựng Docker image của bạn

Để xây dựng image từ Dockerfile của bạn, hãy sử dụng lệnh `docker build`:

```bash
docker build -t my-express-app .
```

Cờ `-t` gắn thẻ image của bạn bằng tên và `.` chỉ định rằng Dockerfile nằm trong thư mục hiện tại.

Bạn sẽ thấy đầu ra hiển thị từng lệnh đang được thực thi:

```
Sending build context to Docker daemon  4.096kB
Step 1/7 : FROM node:18-alpine
 ---> d483e6f712c5
Step 2/7 : WORKDIR /usr/src/app
 ---> Using cache
 ---> 8d7ab9c161c1
Step 3/7 : COPY package*.json ./
 ---> 65d2a7add184
Step 4/7 : RUN npm install
 ---> Running in 2c75e3941dba
...
```

Sau khi quá trình xây dựng hoàn tất, image của bạn đã sẵn sàng để sử dụng:

```bash
docker images
```

```
REPOSITORY        TAG       IMAGE ID       CREATED         SIZE
my-express-app    latest    8c1a23e0b311   5 seconds ago   173MB
```

## Chạy image tùy chỉnh của bạn

Chạy container từ image mới của bạn:

```bash
docker run -d -p 3000:3000 --name my-app my-express-app
```

Bây giờ bạn có thể truy cập ứng dụng của mình tại http://localhost:3000.

## Hiểu hướng dẫn về Dockerfile

Hãy cùng khám phá các hướng dẫn Dockerfile phổ biến nhất:

### TỪ

Chỉ định cơ sở image. Đây luôn là hướng dẫn đầu tiên.

```dockerfile
FROM ubuntu:22.04
```

Bạn có thể sử dụng image cơ sở tối thiểu như Alpine Linux để giữ cho image của bạn nhỏ gọn:

```dockerfile
FROM alpine:3.16
```

### WORKDIR

Đặt thư mục làm việc cho các hướng dẫn tiếp theo.

```dockerfile
WORKDIR /app
```

Sử dụng `WORKDIR` tốt hơn là sử dụng nhiều lệnh `RUN cd /some/dir`.

### SAO CHÉP và THÊM

Cả hai đều sao chép tệp từ ngữ cảnh xây dựng sang image, nhưng chúng có các khả năng khác nhau:

- `COPY` chỉ cần sao chép các tập tin và thư mục
- `ADD` cũng có thể trích xuất tệp tar và tải xuống tệp từ URL

Cách tốt nhất là sử dụng `COPY` trừ khi bạn đặc biệt cần `ADD`:

```dockerfile
COPY ./app /app
```

Để tải xuống URL, hãy ưu tiên `RUN curl` hoặc `RUN wget` thay vì `ADD` để kiểm soát tốt hơn.

### CHẠY

Thực thi các lệnh và tạo một lớp mới:

```dockerfile
RUN apt-get update && \
    apt-get install -y python3
```

Việc kết hợp các lệnh thành một lệnh `RUN` duy nhất sẽ giảm các lớp và kích thước image.

### ENV

Đặt các biến môi trường:

```dockerfile
ENV NODE_ENV=production \
    PORT=3000
```

Các biến được đặt với `ENV` vẫn tồn tại khi container chạy từ image.

### TIẾP XÚC

Các tài liệu mà cổng container nghe trên:

```dockerfile
EXPOSE 80 443
```

Lưu ý rằng `EXPOSE` chỉ mang tính chất cung cấp thông tin, bạn vẫn cần xuất bản các cổng bằng `-p` khi chạy container.

### CMD và ĐIỂM VÀO

Các hướng dẫn này xác định điều gì sẽ xảy ra khi container khởi động:

- `CMD` cung cấp các đối số mặc định cho container, có thể bị ghi đè
- `ENTRYPOINT` chỉ định tệp thực thi luôn chạy khi container khởi động

Mẫu phổ biến nhất là sử dụng `ENTRYPOINT` cho tệp thực thi và `CMD` cho các đối số mặc định:

```dockerfile
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
```

Điều này cho phép người dùng ghi đè các đối số nhưng vẫn giữ nginx làm quy trình chính.

## Thực tiễn tốt nhất về Dockerfile

### Sử dụng Cơ sở chính thức image

Bắt đầu với image chính thức từ Docker Hub khi có thể. Chúng được duy trì, bảo mật và tuân theo các phương pháp hay nhất.

### Giảm thiểu các lớp

Mỗi hướng dẫn tạo ra một lớp. Kết hợp các lệnh liên quan thành một lệnh `RUN` duy nhất:

```dockerfile
# Good
RUN apt-get update && apt-get install -y \
    package1 \
    package2 \
    package3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Avoid
RUN apt-get update
RUN apt-get install -y package1
RUN apt-get install -y package2
RUN apt-get install -y package3
```

### Hướng dẫn đặt hàng theo độ ổn định

Đặt các hướng dẫn ít thay đổi hơn ở đầu Dockerfile của bạn để tận dụng bộ nhớ đệm:

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Dependencies change less frequently than source code
COPY package*.json ./
RUN npm install

# Source code changes most frequently
COPY . .
```

### Sử dụng .dockerignore

Tạo tệp `.dockerignore` để loại trừ các tệp và thư mục khỏi ngữ cảnh xây dựng:

```
node_modules
npm-debug.log
Dockerfile
.git
.github
.gitignore
.env
.env.*
```

Điều này làm giảm kích thước bối cảnh xây dựng và ngăn không cho đưa các tệp nhạy cảm vào.

### Giữ image nhỏ gọn

Sử dụng image cơ sở nhỏ hơn (các biến thể Alpine thường hoạt động tốt) và xóa các tệp không cần thiết:

```dockerfile
FROM node:18-alpine

# Install dependencies and immediately clean up in the same layer
RUN apk add --no-cache python3 make g++ \
    && npm install \
    && npm cache clean --force
```

### Sử dụng bản dựng nhiều giai đoạn

Bản dựng nhiều giai đoạn cho phép bạn sử dụng nhiều câu lệnh FROM trong Dockerfile của mình. Mỗi câu lệnh FROM bắt đầu một giai đoạn mới có thể sao chép có chọn lọc artifact từ các giai đoạn trước:

```dockerfile
# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Điều này dẫn đến image cuối cùng nhỏ hơn nhiều chỉ với các tệp cần thiết.

## Gắn thẻ và lập phiên bản image

Khi xây dựng image cho production, hãy sử dụng các thẻ cụ thể để tạo phiên bản:

```bash
docker build -t myapp:1.0.0 .
```

Bạn cũng có thể áp dụng nhiều thẻ cho cùng một bản dựng:

```bash
docker build -t myapp:1.0.0 -t myapp:latest .
```

## Làm việc với Cơ quan đăng ký tư nhân

Nếu bạn đang lưu trữ image của mình trong sổ đăng ký riêng tư, bạn cần phải đăng nhập trước khi thực hiện:

```bash
docker login registry.example.com
docker build -t registry.example.com/myapp:1.0.0 .
docker push registry.example.com/myapp:1.0.0
```

Đối với các cơ quan đăng ký container dựa trên đám mây, DigitalOcean container Register cung cấp một nơi riêng tư, an toàn để lưu trữ Docker image của bạn. [Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) và nhận 200 USD tín dụng miễn phí để dùng thử dịch vụ Đăng ký container của họ.

## Ví dụ thực tế: Xây dựng một ứng dụng Full-Stack

Dưới đây là ví dụ về Dockerfile phức tạp hơn cho ứng dụng React với Node.js backend:

```dockerfile
# Build stage for React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build stage for Node.js backend
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=backend-build /app/backend ./
COPY --from=frontend-build /app/frontend/build ./public
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "server.js"]
```

Dockerfile này sử dụng ba giai đoạn:

1. Xây dựng React frontend
2. Chuẩn bị Node.js backend
3. Tạo production image cuối cùng chỉ với các tệp cần thiết

Trong phần tiếp theo, chúng ta sẽ khám phá Docker volume để lưu trữ dữ liệu liên tục.
