---
title: "S3 - Lưu trữ tệp trên đám mây"
description: Lưu trữ tệp, image, bản sao lưu và nội dung tĩnh với bộ nhớ đám mây không giới hạn, đáng tin cậy.
order: 4
---

Dịch vụ lưu trữ đơn giản (S3) giống như có bộ nhớ đám mây không giới hạn mà bất kỳ ứng dụng nào của bạn đều có thể truy cập ngay lập tức. Không giống như các hệ thống tệp truyền thống, S3 được thiết kế cho thời đại internet - nó đáng tin cậy, có thể mở rộng và có thể truy cập được từ mọi nơi trên thế giới.

## Điều gì làm nên sự khác biệt của S3

Lưu trữ tệp truyền thống đã phục vụ chúng ta rất tốt trong nhiều thập kỷ, nhưng nó được thiết kế cho thời gian đơn giản hơn. Bạn mua một ổ cứng có dung lượng hạn chế, sắp xếp các tệp trong các thư mục trên máy tính cụ thể đó và chỉ có thể truy cập các tệp đó từ máy đó. Khi ổ đĩa bị lỗi, bạn sẽ mất dữ liệu trừ khi bạn siêng năng sao lưu.

S3 áp dụng một cách tiếp cận khác biệt cơ bản được thiết kế cho thế giới kết nối của chúng ta. Thay vì bị giới hạn bởi không gian lưu trữ vật lý, bạn có dung lượng gần như không giới hạn và chỉ phải trả cho những gì bạn thực sự sử dụng. Thay vì tổ chức các tệp trong các thư mục truyền thống, S3 lưu trữ tệp dưới dạng "đối tượng" trong "nhóm" có thể truy cập được từ mọi nơi trên internet. Quan trọng nhất, AWS tự động xử lý tất cả các vấn đề về độ tin cậy và sao lưu, với nhiều bản sao dữ liệu của bạn được lưu trữ trên các trung tâm dữ liệu khác nhau.

## Tìm hiểu về nhóm và đối tượng

Hãy nghĩ về S3 như thế này:

**Buckets** = Bộ nhớ container (giống như thư mục Google Drive, nhưng lớn hơn)
**Objects** = Các tệp riêng lẻ (tài liệu, image, video, v.v.)

Mỗi nhóm có một tên duy nhất trên toàn cầu, vì vậy `my-photos` có thể được sử dụng nhưng `my-photos-2025-johnsmith` sẽ hoạt động.

## Tại sao ứng dụng yêu thích S3

Các ứng dụng web sử dụng S3 cho nhiều mục đích:

**Tải lên của người dùng**: Ảnh hồ sơ, tài liệu, tệp đính kèm
**Nội dung tĩnh**: image, tệp CSS, JavaScript cho trang web
**Backups**: Sao lưu cơ sở dữ liệu, file cấu hình
**Data Archives**: Tệp nhật ký, bản ghi cũ
**Content Distribution**: Tệp được nhiều người dùng tải xuống

## Tạo nhóm S3 đầu tiên của bạn

Hãy tạo một nhóm cho một ứng dụng chia sẻ ảnh đơn giản.

Trong bảng điều khiển S3, nhấp vào "Tạo nhóm":

- **Name**: Chọn thứ gì đó độc đáo như `my-photo-app-2025-yourname`
- **Region**: Chọn cùng khu vực với phiên bản EC2 của bạn
- **Settings**: Giữ mặc định ngay bây giờ (chúng ta sẽ sớm thảo luận về bảo mật)

Tên nhóm phải là duy nhất trên toàn cầu trên tất cả các tài khoản AWS, vì vậy hãy sáng tạo!

## Tải tập tin lên

Sau khi vùng lưu trữ của bạn tồn tại, bạn có thể tải tệp lên theo nhiều cách:

**Via Console**: Kéo thả file trực tiếp vào giao diện web
Ứng dụng **Via**: Ứng dụng web của bạn có thể tải tệp lên theo chương trình
**Via Dòng lệnh**: Hữu ích cho việc tải lên hàng loạt và tự động hóa

Hãy thử tải lên bản thử nghiệm image để xem nó hoạt động như thế nào.

## Hiểu URL S3

Mọi đối tượng trong S3 đều có một URL duy nhất:

```
https://my-photo-app-2025-yourname.s3.amazonaws.com/vacation-photo.jpg
```

Theo mặc định, các URL này là riêng tư - chỉ bạn mới có thể truy cập chúng. Bạn có thể đặt các đối tượng cụ thể ở chế độ công khai hoặc giữ mọi thứ ở chế độ riêng tư.

## Lớp lưu trữ: Chọn tùy chọn phù hợp

S3 cung cấp các lớp lưu trữ khác nhau được tối ưu hóa cho các trường hợp sử dụng khác nhau:

### Tiêu chuẩn

- **Tốt nhất cho**: Các tệp được truy cập thường xuyên
- **Cost**: Chi phí lưu trữ cao hơn, chi phí truy cập thấp hơn
- **Trường hợp sử dụng**: Trang web image, dữ liệu ứng dụng đang hoạt động

### Tiêu chuẩn-IA (Truy cập không thường xuyên)

- **Tốt nhất cho**: Các tệp được truy cập ít hơn một lần mỗi tháng
- **Cost**: Chi phí lưu trữ thấp hơn, chi phí truy cập cao hơn
- **Trường hợp sử dụng**: Sao lưu, tập tin khắc phục thảm họa

### Sông băng

- **Tốt nhất cho**: Lưu trữ dài hạn
- **Cost**: Chi phí lưu trữ rất thấp, việc truy xuất mất vài phút đến hàng giờ
- **Trường hợp sử dụng**: Hồ sơ tuân thủ, nhật ký cũ

### Lưu trữ sâu

- **Best for**: Dữ liệu bạn hiếm khi cần
- **Cost**: Chi phí lưu trữ thấp nhất, quá trình truy xuất mất hơn 12 giờ
- **Trường hợp sử dụng**: Bảo quản kỹ thuật số, lưu trữ theo quy định

Đối với người mới bắt đầu, lớp Tiêu chuẩn hoạt động tốt với hầu hết các tệp đang hoạt động.

## Kiểm soát an ninh và truy cập

Bảo mật S3 có nhiều lớp:

### Chính sách nhóm

Kiểm soát ai có thể truy cập vào toàn bộ nhóm của bạn. Ví dụ: bạn có thể cho phép:

- Chỉ các máy chủ ứng dụng của bạn mới tải tệp lên
- Bất kỳ ai tải xuống tệp trong thư mục "công khai"
- Chỉ các tài khoản AWS cụ thể mới có quyền truy cập vào bản sao lưu

### Quyền cấp đối tượng

Kiểm soát quyền truy cập vào các tập tin cá nhân. Hữu ích khi các tệp khác nhau cần mức độ bảo mật khác nhau.

### Tích hợp IAM

Sử dụng các vai trò IAM mà bạn đã tìm hiểu trước đó để cấp cho phiên bản EC2 của bạn quyền truy cập vào S3 mà không cần lưu trữ thông tin xác thực trong mã của bạn.

## Đặt tập tin ở chế độ công khai

Đôi khi bạn muốn các tệp có thể truy cập công khai (như image trên một trang web). Bạn có thể:

1. Công khai các đối tượng cụ thể
2. Tạo chính sách nhóm đặt thư mục ở chế độ công khai
3. Công khai toàn bộ nhóm (hãy cẩn thận!)

Đối với ứng dụng chia sẻ ảnh, bạn có thể đặt ảnh hồ sơ ở chế độ công khai nhưng vẫn giữ an toàn cho ảnh riêng tư.

## Tích hợp S3 với ứng dụng web của bạn

Đây là một ví dụ đơn giản về cách một ứng dụng web có thể sử dụng S3:

```javascript
// When a user uploads a profile picture
app.post('/upload-profile-pic', upload.single('photo'), async (req, res) => {
  // Upload the file to S3
  const result = await uploadToS3(req.file, 'profile-pictures/');

  // Save the S3 URL in your database
  await saveUserProfilePic(req.user.id, result.Location);

  res.json({ success: true, imageUrl: result.Location });
});
```

Dòng chảy này:

1. Người dùng tải lên image thông qua trang web của bạn
2. Máy chủ của bạn nhận được image
3. Máy chủ của bạn tải nó lên S3
4. S3 trả về một URL cố định
5. Bạn lưu URL đó vào cơ sở dữ liệu của bạn
6. Trang web của bạn hiển thị image bằng URL S3

## Quản lý vòng đời

S3 có thể tự động quản lý các tập tin của bạn theo thời gian. Ví dụ:

- Di chuyển tệp sang bộ nhớ rẻ hơn sau 30 ngày
- Lưu trữ file cũ lên Glacier sau 1 năm
- Xóa các tập tin tạm thời sau 7 ngày

Tự động hóa này giúp tiết kiệm tiền và giảm công việc bảo trì.

## Phiên bản vì sự an toàn

Phiên bản S3 tự động giữ nhiều phiên bản của tệp. Nếu ai đó vô tình xóa hoặc ghi đè lên một tập tin, bạn có thể khôi phục phiên bản trước đó.

Điều này đặc biệt có giá trị đối với:

- Tài liệu quan trọng
- Tệp cấu hình
- Sao lưu cơ sở dữ liệu

## Lưu trữ trang web tĩnh

S3 có thể lưu trữ trực tiếp các trang web đơn giản. Nếu bạn có một trang web chỉ có các tệp HTML, CSS và JavaScript (không có mã phía máy chủ), S3 có thể phân phát trang web đó cho khách truy cập.

Điều này là hoàn hảo cho:

- Trang web danh mục đầu tư
- Trang đích
- Ứng dụng một trang
- Trang web tài liệu

## Mạng phân phối nội dung (CDN)

Đối với các trang web có người dùng toàn cầu, S3 có thể hoạt động với CloudFront (CDN của AWS) để phân phát tệp nhanh hơn trên toàn thế giới. CloudFront lưu trữ các tệp S3 của bạn trong các trung tâm dữ liệu trên toàn thế giới.

Lợi ích:

- Tải nhanh hơn cho người dùng ở mọi nơi
- Giảm tải cho nhóm S3 của bạn
- Thường rẻ hơn so với việc phục vụ tất cả lưu lượng truy cập từ S3

## Chi phí truyền dữ liệu

Hiểu chi phí truyền dữ liệu giúp tránh những điều bất ngờ:

**Free**:

- Đang tải lên S3
- Tải xuống trong cùng khu vực AWS
- 100GB lượt tải xuống đầu tiên mỗi tháng

**Paid**:

- Tải xuống internet ngoài mức miễn phí
- Chuyển giữa các khu vực AWS khác nhau

## Các trường hợp sử dụng S3 phổ biến

### Tải lên tệp người dùng

Người dùng tải lên hình ảnh hồ sơ, tài liệu hoặc tệp phương tiện thông qua ứng dụng của bạn.

### Tài sản trang web

Lưu trữ CSS, JavaScript, image và các tệp tĩnh khác mà trang web của bạn cần.

### Sao lưu cơ sở dữ liệu

Tự động sao lưu cơ sở dữ liệu của bạn lên S3 để khắc phục thảm họa.

### Lưu trữ nhật ký

Lưu trữ nhật ký ứng dụng để phân tích và tuân thủ.

### Hồ dữ liệu

Thu thập lượng lớn dữ liệu để phân tích và học máy.

## Thực tiễn tốt nhất cho người mới bắt đầu

### Tổ chức với tiền tố

Vì S3 không có thư mục thực nên hãy sử dụng tiền tố để sắp xếp tệp:

- `users/profile-pics/user123.jpg`
- `uploads/documents/report.pdf`
- `backups/database/2023-11-15.sql`

### Sử dụng tên có ý nghĩa

Chọn tên tệp mô tả và tên nhóm:

- Tốt: `company-marketing-assets`
- Xấu: `bucket1`

### Kế hoạch tăng trưởng

Bắt đầu với cách tổ chức đơn giản nhưng hãy nghĩ đến cách bạn sẽ quản lý hàng nghìn tệp sau này.

### Giám sát chi phí

Thiết lập cảnh báo thanh toán để theo dõi chi phí lưu trữ và truyền tải S3.

### Sao lưu dữ liệu quan trọng

Mặc dù S3 rất đáng tin cậy nhưng hãy cân nhắc việc sao chép giữa các vùng cho các tệp quan trọng.

## Thực tiễn tốt nhất về bảo mật

### Không bao giờ lưu trữ thông tin xác thực trong mã

Sử dụng vai trò IAM thay vì khóa truy cập trong mã ứng dụng của bạn.

### Giới hạn quyền truy cập công cộng

Chỉ công khai các tệp thực sự cần được truy cập công khai.

### Sử dụng HTTPS

Luôn truy cập S3 qua kết nối được mã hóa.

### Đánh giá truy cập thường xuyên

Định kỳ xem xét ai có quyền truy cập vào nhóm và tệp của bạn.

## Khắc phục sự cố thường gặp

### Lỗi "Truy cập bị từ chối"

Kiểm tra:

1. Quyền IAM cho người dùng/vai trò của bạn
2. Chính sách nhóm
3. Quyền cấp đối tượng

### Tốc độ tải lên/tải xuống chậm

Hãy xem xét:

1. Sử dụng cùng khu vực AWS với ứng dụng của bạn
2. Chia các tập tin lớn thành các phần nhỏ hơn
3. Sử dụng CloudFront để tải xuống

### Chi phí cao

Đánh giá:

1. Lựa chọn lớp lưu trữ
2. Các mẫu truyền dữ liệu
3. Các tập tin không sử dụng có thể bị xóa

## Định giá S3 thật đơn giản

Giá S3 có một số thành phần:

- **Storage**: ~$0,023 mỗi GB mỗi tháng đối với lớp Tiêu chuẩn
- **Requests**: ~$0,0004 trên 1.000 yêu cầu
- **Truyền dữ liệu**: 100 GB đầu tiên miễn phí, sau đó ~ 0,09 USD mỗi GB

Đối với các ứng dụng nhỏ, chi phí thường rất thấp - thường dưới 5 USD mỗi tháng.

## Tích hợp với các dịch vụ AWS khác

S3 hoạt động tốt với các dịch vụ AWS khác:

- **Lambda**: Tự động xử lý tệp khi được tải lên
- **CloudFront**: Tăng tốc độ phân phối tệp trên toàn thế giới
- **EC2**: Lưu trữ và phục vụ các tệp cho ứng dụng của bạn
- **RDS**: Lưu trữ bản sao lưu cơ sở dữ liệu
- **CloudWatch**: Giám sát việc sử dụng và thiết lập cảnh báo

## Khi S3 không phải là lựa chọn đúng đắn

S3 rất lý tưởng cho hầu hết các nhu cầu lưu trữ tệp, nhưng hãy xem xét các lựa chọn thay thế cho:

- **Điện toán hiệu năng cao**: Sử dụng EBS cho các tệp cơ sở dữ liệu
- **Cộng tác thời gian thực**: Sử dụng EFS cho hệ thống tệp dùng chung
- **Cập nhật nhỏ thường xuyên**: Sử dụng cơ sở dữ liệu để thay đổi dữ liệu thường xuyên

## Các bước tiếp theo

Giờ đây, bạn có thể lưu trữ tệp một cách đáng tin cậy trong S3, đã đến lúc tổ chức cơ sở hạ tầng mạng của bạn bằng VPC (Đám mây riêng ảo). Mặc dù S3 có thể truy cập được từ mọi nơi trên internet nhưng VPC cho phép bạn tạo các mạng riêng tư, an toàn cho ứng dụng của mình.

Bạn sẽ tìm hiểu cách thiết kế mạng giúp bảo mật cơ sở dữ liệu và máy chủ ứng dụng của bạn trong khi vẫn cho phép chúng truy cập S3 và phục vụ người dùng một cách hiệu quả.
