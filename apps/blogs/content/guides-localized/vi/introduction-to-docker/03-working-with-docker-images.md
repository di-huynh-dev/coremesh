---
title: "Làm việc với Docker image"
description: Tìm hiểu cách tìm, kéo, quản lý và hiểu Docker image
order: 3
---

Docker image là nền tảng của container. Chúng là các mẫu chỉ đọc chứa mã ứng dụng, thư viện, công cụ, phần phụ thuộc và các tệp khác cần thiết để chạy ứng dụng. Trong phần này, bạn sẽ tìm hiểu cách làm việc với Docker image một cách hiệu quả.

## Tìm hiểu Docker image

Docker image có một số đặc điểm quan trọng:

1. **Layered**: image bao gồm nhiều lớp, mỗi lớp đại diện cho một tập hợp các thay đổi của hệ thống tệp.
2. **Immutable**: Sau khi được xây dựng, image sẽ không thay đổi. Để cập nhật ứng dụng, bạn tạo image mới.
3. **Tagged**: image được xác định bằng thẻ để theo dõi các phiên bản khác nhau.
4. **Shareable**: image có thể được lưu trữ trong sổ đăng ký và chia sẻ với người khác.

## Quy ước đặt tên Docker image

Docker image tuân theo quy ước đặt tên tiêu chuẩn:

```
[registry/][username/]repository[:tag]
```

Ví dụ:

- `ubuntu:20.04`: Ubuntu image có thẻ 20.04
- `nginx:latest`: Máy chủ web Nginx với thẻ "mới nhất" mặc định
- `docker.io/mysql:8.0`: MySQL 8.0 từ Docker Hub
- `gcr.io/tensorflow/tensorflow`: TensorFlow image từ Cơ quan đăng ký Google container

Nếu bạn không chỉ định thẻ, Docker sẽ giả sử bạn muốn thẻ `:latest`.

## Tìm Docker image

Docker Hub là cơ quan đăng ký công khai mặc định nơi bạn có thể tìm thấy hàng nghìn image. Bạn có thể tìm kiếm image trực tiếp trên [Trung tâm Docker](https://hub.docker.com/) hoặc sử dụng dòng lệnh:

```bash
docker search nginx
```

Lệnh này trả về danh sách image liên quan đến Nginx:

```
NAME                              DESCRIPTION                                     STARS  OFFICIAL  AUTOMATED
nginx                             Official build of Nginx.                        16904  [OK]
...
```

## Kéo Docker image

Để tải xuống image từ sổ đăng ký, hãy sử dụng lệnh `docker pull`:

```bash
docker pull nginx:latest
```

Điều này kéo phiên bản mới nhất của Nginx image chính thức. Đầu ra hiển thị Docker đang tải xuống từng lớp của image:

```
latest: Pulling from library/nginx
a603fa5e3b41: Pull complete
c39e1cda007e: Pull complete
90cfefba13f5: Pull complete
a38226fb7aba: Pull complete
5df5e7804d47: Pull complete
f9334680720f: Pull complete
Digest: sha256:2ab30d6ac53580a6db8b657abf0f68d75360ff5cc1670a85acb5bd85ba1b19c0
Status: Downloaded newer image for nginx:latest
docker.io/library/nginx:latest
```

## Docker niêm yết image

Để xem image bạn đã kéo, hãy chạy:

```bash
docker images
```

Hoặc sử dụng lệnh mới hơn:

```bash
docker image ls
```

Đầu ra hiển thị tất cả image có sẵn của bạn:

```
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
nginx         latest    c919045c4c2b   5 days ago      142MB
ubuntu        20.04     54c9d81cbb44   2 weeks ago     72.8MB
hello-world   latest    feb5d9fea6a5   5 months ago    13.3kB
```

## Lớp và bộ đệm image

Một trong những tính năng mạnh mẽ nhất của Docker là kiến trúc dựa trên lớp của nó. Mỗi lệnh trong Dockerfile sẽ tạo một lớp mới.

Để xem các lớp trong image, hãy sử dụng:

```bash
docker history nginx:latest
```

Đầu ra:

```
IMAGE          CREATED      CREATED BY                                      SIZE      COMMENT
c919045c4c2b   5 days ago   /bin/sh -c #(nop)  CMD ["nginx" "-g" "daemon…   0B
<missing>      5 days ago   /bin/sh -c #(nop)  STOPSIGNAL SIGQUIT           0B
<missing>      5 days ago   /bin/sh -c #(nop)  EXPOSE 80                    0B
<missing>      5 days ago   /bin/sh -c #(nop)  ENTRYPOINT ["/docker-entr…   0B
...
```

Khi xây dựng hoặc kéo image, Docker lưu trữ các lớp để nâng cao hiệu quả. Điều này làm cho các bản dựng tiếp theo và kéo nhanh hơn nhiều.

## Thẻ và phiên bản image

Thẻ giúp bạn quản lý các phiên bản khác nhau của cùng một image. Bạn có thể thêm các thẻ bổ sung vào image hiện có:

```bash
docker tag nginx:latest mywebserver:v1
```

Điều này tạo ra một tham chiếu đến cùng một image với tên và thẻ khác.

Để xác minh thẻ mới:

```bash
docker images
```

```
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
nginx         latest    c919045c4c2b   5 days ago      142MB
mywebserver   v1        c919045c4c2b   5 days ago      142MB
```

Lưu ý rằng cả image đều có cùng ID image vì chúng trỏ đến cùng một nội dung.

## Quản lý dung lượng ổ đĩa

Docker image có thể tiêu tốn dung lượng ổ đĩa đáng kể. Để xem tổng dung lượng được Docker sử dụng:

```bash
docker system df
```

Để xóa image không sử dụng:

```bash
docker image prune
```

Thao tác này sẽ loại bỏ image "lủng lẳng" (những thứ không có thẻ và không được sử dụng bởi bất kỳ container nào).

Để dọn dẹp mạnh mẽ hơn, loại bỏ tất cả image không sử dụng:

```bash
docker image prune -a
```

## Kiểm tra image

Để biết thông tin chi tiết về image:

```bash
docker image inspect nginx:latest
```

Điều này trả về một đối tượng JSON với thông tin mở rộng về image, bao gồm các lớp, cấu hình, biến môi trường, v.v.

## Sử dụng image chính thức và cộng đồng

Docker Hub cung cấp hai loại image chính:

1. **Hình ảnh chính thức**: Được duy trì bởi Docker, Inc. hoặc bởi nhà cung cấp phần mềm, tuân theo các biện pháp thực hành tốt nhất. Các ví dụ bao gồm `nginx`, `ubuntu` và `node`.

2. **Hình ảnh cộng đồng**: Được tạo và duy trì bởi người dùng hoặc tổ chức cá nhân. Định dạng của họ là `username/image-name`.

Để sử dụng production, hãy ưu tiên image chính thức hoặc cộng đồng image được duy trì tốt với tài liệu tốt và cập nhật thường xuyên.

## Đa nền tảng image

Docker hiện đại hỗ trợ image được xây dựng cho các kiến trúc CPU khác nhau. Để xem image hỗ trợ nền tảng nào:

```bash
docker manifest inspect nginx:latest
```

Khi bạn kéo image, Docker sẽ tự động chọn phiên bản phù hợp với kiến trúc hệ thống của bạn.

## Lưu và tải image

Bạn có thể lưu image vào tệp tarball để truyền ngoại tuyến:

```bash
docker save nginx:latest -o nginx.tar
```

Để tải image đã lưu:

```bash
docker load -i nginx.tar
```

Điều này rất hữu ích để chuyển image sang môi trường có khe hở không khí hoặc cho mục đích sao lưu.

## Sử dụng sổ đăng ký DigitalOcean container

Đối với môi trường nhóm hoặc khối lượng công việc production, hãy cân nhắc sử dụng sổ đăng ký riêng như DigitalOcean container Register để lưu trữ và chia sẻ image tùy chỉnh của bạn một cách an toàn.

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) và nhận 200 USD tín dụng miễn phí để dùng thử dịch vụ Đăng ký container của họ.

## Các bước tiếp theo

Bây giờ bạn đã hiểu cách làm việc với Docker image, bạn đã sẵn sàng bắt đầu chạy container từ những image này. Trong phần tiếp theo, chúng tôi sẽ đề cập đến cách tạo và quản lý Docker container.
