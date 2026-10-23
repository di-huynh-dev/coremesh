---
title: "IAM - Bảo mật tài khoản AWS của bạn"
description: Tìm hiểu các nguyên tắc cơ bản về bảo mật của AWS và bảo vệ tài khoản của bạn bằng quyền và quyền quản lý người dùng phù hợp.
order: 2
---

Quản lý danh tính và quyền truy cập (IAM) giống như giám đốc an ninh cho một tòa nhà văn phòng lớn. Bạn quyết định ai sẽ lấy chìa khóa phòng nào, ai có thể sử dụng thang máy và ai có quyền truy cập vào các khu vực nhạy cảm.

Mặc dù ban đầu IAM có vẻ phức tạp nhưng việc hiểu sớm về nó là rất quan trọng vì nó kiểm soát quyền truy cập vào mọi thứ khác trong AWS. Hãy làm đúng điều này và bạn sẽ có nền tảng an toàn cho tất cả các dự án trong tương lai của mình.

## Tại sao IAM lại quan trọng

Khi tạo tài khoản AWS, bạn đã nhận được quyền truy cập "root" vào mọi thứ - về cơ bản là các khóa chính cho toàn bộ cơ sở hạ tầng đám mây của bạn. Mặc dù quyền truy cập không giới hạn này thuận tiện cho việc bắt đầu nhưng việc sử dụng nó cho công việc hàng ngày sẽ tạo ra những rủi ro không đáng có. Nó giống như việc sử dụng chìa khóa chính của một tòa nhà cho mọi công việc, từ kiểm tra thư đến truy cập các khu vực nhạy cảm.

Nguyên tắc đơn giản nhưng quan trọng: nếu thông tin xác thực của bạn bị xâm phạm thì kẻ tấn công sẽ có cùng cấp độ truy cập như bạn. Với thông tin đăng nhập gốc, điều đó có nghĩa là bạn có toàn quyền kiểm soát toàn bộ tài khoản AWS của mình, bao gồm khả năng xóa mọi thứ và chịu những khoản phí khổng lồ.

IAM giải quyết vấn đề này bằng cách cho phép bạn tạo người dùng cụ thể với các quyền được giới hạn cẩn thận. Thay vì mọi người đều có khóa chính, bạn chỉ cấp cho mọi người quyền truy cập mà họ cần cho những trách nhiệm cụ thể của họ.

## Tìm hiểu các thành phần IAM

IAM có bốn phần chính hoạt động cùng nhau:

### Người dùng

Những cá nhân (hoặc ứng dụng) cần quyền truy cập AWS. Hãy coi người dùng như thẻ ID nhân viên - mỗi người có thẻ riêng với các quyền cụ thể của mình.

### Nhóm

Bộ sưu tập người dùng cần quyền tương tự. Giống như các phòng ban trong công ty - tất cả nhân viên tiếp thị đều có thể cần quyền truy cập vào các nguồn lực giống nhau.

### Vai trò

Các quyền tạm thời có thể được người dùng hoặc dịch vụ "đảm nhận". Hãy nghĩ về các vai trò như huy hiệu của khách truy cập - bạn có thể tạm thời cấp cho ai đó quyền truy cập mà không cần tạo tài khoản người dùng vĩnh viễn.

### Chính sách

Tài liệu xác định những hành động nào được phép hoặc từ chối. Đây giống như những bản mô tả công việc chi tiết, xác định chính xác những gì ai đó có thể và không thể làm.

## Nguyên lý của đặc quyền tối thiểu

Nguyên tắc vàng của IAM là: **cung cấp cho mọi người những quyền tối thiểu họ cần để thực hiện công việc của mình, không hơn thế nữa**.

Điều này có vẻ hạn chế, nhưng nó:

- Ngăn chặn thiệt hại do tai nạn (không thể xóa những gì bạn không có quyền truy cập)
- Giảm rủi ro bảo mật (tài khoản bị xâm phạm có tác động hạn chế)
- Giúp việc khắc phục sự cố dễ dàng hơn (cần xem xét ít bộ phận chuyển động hơn)
- Tuân theo các phương pháp hay nhất trong ngành

## Tạo người dùng IAM đầu tiên của bạn

Thay vì sử dụng tài khoản root của bạn cho mọi thứ, hãy tạo một người dùng chuyên dụng cho công việc hàng ngày.

### Tại sao phải tạo một người dùng riêng biệt?

Tài khoản root của bạn phải giống như chìa khóa hộp ký gửi an toàn - chỉ được sử dụng cho các nhiệm vụ quan trọng, hiếm gặp như:

- Thay đổi thông tin thanh toán
- Tạo người dùng IAM đầu tiên của bạn
- Khôi phục tài khoản khẩn cấp

Đối với công việc hàng ngày (khởi chạy máy chủ, quản lý tệp, v.v.), hãy sử dụng người dùng IAM chuyên dụng.

### Thiết lập người dùng quản trị

Trong bảng điều khiển IAM, tạo người dùng mới:

- **Username**: Một cái gì đó như "john-admin" hoặc "daily-admin"
- **Loại truy cập**: Cả "Truy cập bảng điều khiển" và "Truy cập theo chương trình"
- **Mật khẩu bảng điều khiển**: Đặt mật khẩu mạnh
- **Permissions**: Hiện tại, hãy đính kèm chính sách "Truy cập quản trị viên"

Điều này mang lại cho bạn một tài khoản người dùng mạnh mẽ để học mà không cần chạm vào tài khoản root của bạn.

## Hiểu chính sách bằng ví dụ thực tế

Các chính sách xác định quyền bằng tài liệu JSON nhưng đừng lo - bạn không cần phải viết JSON để sử dụng IAM một cách hiệu quả. AWS cung cấp các chính sách dựng sẵn cho các tình huống phổ biến.

### Chính sách được xây dựng sẵn chung

AWS cung cấp một số chính sách dựng sẵn bao gồm các tình huống phổ biến, giúp bạn không phải viết lại các tài liệu cấp phép phức tạp ngay từ đầu:

- **ReadOnlyAccess**: Cho phép xem mọi thứ nhưng ngăn chặn mọi thay đổi - hoàn hảo cho kiểm toán viên, thành viên nhóm cấp dưới hoặc công cụ giám sát
- **PowerUserAccess**: Cung cấp khả năng kiểm soát gần như hoàn chỉnh ngoại trừ quản lý người dùng - lý tưởng cho các nhà phát triển và hầu hết công việc hàng ngày
- **AmazonS3FullAccess**: Cấp quyền kiểm soát hoàn toàn các dịch vụ lưu trữ S3 - hữu ích cho các ứng dụng quản lý tải tệp lên
- **AmazonEC2ReadOnlyAccess**: Cho phép xem máy chủ mà không có đặc quyền sửa đổi - tuyệt vời cho các công cụ giám sát và báo cáo

## Xác thực đa yếu tố (MFA)

MFA bổ sung lớp bảo mật thứ hai ngoài mật khẩu. Ngay cả khi ai đó đánh cắp mật khẩu của bạn, họ cũng không thể truy cập vào tài khoản của bạn nếu không có yếu tố thứ hai.

### Thiết lập MFA

Đối với người dùng IAM mới của bạn:

1. Chuyển đến tab thông tin xác thực bảo mật của người dùng
2. Nhấp vào "Quản lý thiết bị MFA"
3. Chọn "Thiết bị MFA ảo"
4. Sử dụng ứng dụng như Google Authenticator hoặc Authy
5. Quét mã QR và nhập hai mã liên tiếp

Giờ đây, thông tin đăng nhập yêu cầu cả mật khẩu và mã từ điện thoại của bạn.

### Tại sao MFA lại quan trọng

- **Ngăn chặn hầu hết các hành vi xâm phạm tài khoản**: Ngay cả khi mật khẩu bị rò rỉ, tài khoản vẫn được bảo mật
- **Được nhiều công ty yêu cầu**: Tiêu chuẩn ngành dành cho các hệ thống nhạy cảm
- Cách thực hành tốt nhất về **AWS**: Được khuyến nghị cho tất cả người dùng có quyền truy cập bảng điều khiển
- **Dễ thiết lập**: Chỉ mất vài phút

## Làm việc với nhóm

Khi bạn thêm nhiều người dùng hơn (đồng đội, ứng dụng, v.v.), các nhóm sẽ giúp việc quản lý quyền dễ dàng hơn nhiều.

### Cấu trúc nhóm ví dụ

**Nhóm phát triển**:

- Có thể tạo và quản lý phiên bản EC2
- Có thể đọc và ghi vào S3
- Có thể xem số liệu CloudWatch
- Không thể sửa đổi thanh toán hoặc tạo người dùng

**Nhóm chỉ đọc**:

- Có thể xem tất cả các tài nguyên
- Không thể thực hiện bất kỳ thay đổi nào
- Tốt cho kiểm toán viên hoặc thành viên nhóm mới

Nhóm quản trị cơ sở dữ liệu ****:

- Có thể quản lý cơ sở dữ liệu RDS
- Có thể xem giám sát liên quan
- Không thể truy cập các dịch vụ khác

### Lợi ích của nhóm

- **Equản lý dễ dàng hơn**: Thay đổi quyền nhóm một lần, ảnh hưởng đến tất cả thành viên
- **Consistency**: Mọi người trong một vai trò đều có quyền như nhau
- **Auditing**: Dễ dàng biết ai có quyền truy cập gì
- **Scalability**: Thêm người dùng mới vào các nhóm hiện có thay vì đặt quyền riêng lẻ

## Hiểu vai trò

Vai trò giống như huy hiệu bảo mật tạm thời mà ứng dụng hoặc người dùng có thể "đeo" để có được các quyền cụ thể.

### Khi nào nên sử dụng vai trò

Phiên bản **EC2**: Thay vì lưu trữ thông tin xác thực trong ứng dụng của bạn, hãy cấp cho phiên bản một vai trò
**Truy cập tài khoản chéo**: Cho phép người dùng từ tài khoản AWS khác truy cập các tài nguyên cụ thể
**Truy cập tạm thời**: Cấp quyền cho ai đó trong thời gian giới hạn
**Service Integration**: Hãy để các dịch vụ AWS thay mặt bạn hoạt động cùng nhau

### Ví dụ: Vai trò EC2 cho quyền truy cập S3

Thay vì điều này (không an toàn):

```javascript
// Don't do this - credentials in code
const s3 = new AWS.S3({
  accessKeyId: 'AKIA...',
  secretAccessKey: 'abc123...',
});
```

Làm điều này (an toàn):

```javascript
// Good - uses role automatically
const s3 = new AWS.S3(); // Uses IAM role attached to EC2 instance
```

Vai trò này cung cấp thông tin xác thực tự động và an toàn.

## Các mẫu IAM phổ biến

### Thiết lập môi trường phát triển

**Người dùng nhà phát triển cá nhân**: Mỗi người có tài khoản người dùng của riêng mình
** Vai trò phát triển được chia sẻ**: Các ứng dụng sử dụng một vai trò với các quyền hạn chế
**Môi trường riêng biệt**: Các chính sách IAM khác nhau dành cho nhà phát triển, staging và production

### Cài đặt ứng dụng production

**Service Roles**: Mỗi thành phần ứng dụng có vai trò riêng với quyền tối thiểu
**Truy cập dịch vụ chéo**: Các vai trò cho phép các dịch vụ giao tiếp an toàn
**Monitoring Access**: Quyền truy cập chỉ đọc cho các hệ thống giám sát và cảnh báo

## Thực tiễn tốt nhất của IAM được thực hiện đơn giản

### Dành cho người dùng cá nhân

1. **Sử dụng mật khẩu mạnh, duy nhất** cho mỗi người dùng
2. **EEnable MFA** trên tất cả người dùng có quyền truy cập bảng điều khiển
3. **Xem xét quyền truy cập thường xuyên**: Xóa các quyền không còn cần thiết
4. **Tách tài khoản cho các mục đích khác nhau**: Không sử dụng AWS công việc cho các dự án cá nhân

### Dành cho ứng dụng

1. **Sử dụng vai trò thay vì người dùng** bất cứ khi nào có thể
2. **Xoay khóa truy cập thường xuyên** nếu bạn phải sử dụng chúng
3. **Không bao giờ nhúng thông tin đăng nhập vào code** hoặc kiểm soát phiên bản
4. **Sử dụng các biến môi trường hoặc quyền truy cập dựa trên vai trò** để cấu hình

### Dành cho tổ chức

1. **Nguyên tắc đặc quyền tối thiểu**: Bắt đầu với các quyền tối thiểu và thêm khi cần
2. **Sử dụng các nhóm cho các quyền chung**: Không đặt quyền cho từng người dùng
3. **Kiểm tra quyền thường xuyên**: Đánh giá xem ai có quyền truy cập vào nội dung gì
4. **Tài khoản AWS riêng** cho các môi trường hoặc nhóm khác nhau

## Khắc phục sự cố IAM

### Lỗi "Truy cập bị từ chối"

Khi bạn gặp lỗi về quyền:

1. **Kiểm tra chính sách**: Người dùng/vai trò có các quyền cần thiết không?
2. **Kiểm tra tài nguyên**: Một số tài nguyên có chính sách truy cập riêng
3. **Kiểm tra hành động**: Đảm bảo bạn đang sử dụng đúng tên quyền
4. **Kiểm tra khu vực**: IAM mang tính toàn cầu nhưng tài nguyên lại dành riêng cho từng vùng

### Công cụ gỡ lỗi quyền

**IAM Policy Simulator**: Kiểm tra xem các quyền cụ thể có hoạt động hay không
**Access Advisor**: Xem những quyền nào người dùng thực sự sử dụng
**CloudTrail**: Nhật ký tất cả các hành động được thực hiện trong tài khoản của bạn

## Ý nghĩa chi phí của IAM

Bản thân IAM là miễn phí, nhưng việc thực hành IAM kém có thể tốn kém:

### IAM ảnh hưởng đến chi phí như thế nào

**Người dùng được cấp phép quá mức** có thể vô tình tạo ra các tài nguyên đắt tiền
**Khóa truy cập không được sử dụng** tạo ra rủi ro bảo mật có thể dẫn đến việc sử dụng trái phép
**Quản lý tài nguyên kém** do quyền sở hữu và trách nhiệm không rõ ràng

### Thực hành IAM tiết kiệm chi phí

- **Xóa quyền sở hữu tài nguyên** thông qua gắn thẻ và quyền phù hợp
- **Dọn dẹp thường xuyên** những người dùng và khóa truy cập không sử dụng
- **Chính sách tự động** ngăn chặn việc tạo tài nguyên đắt tiền
- **Thông báo ngân sách** được định cấu hình để thông báo cho đúng người

## IAM cho các trường hợp sử dụng khác nhau

### Dự án cá nhân

- Tạo một người dùng quản trị cho chính bạn
- Sử dụng vai trò cho các ứng dụng
- Giữ mọi việc đơn giản với các chính sách được xây dựng sẵn

### Đội nhỏ

- Người dùng cá nhân cho mỗi thành viên trong nhóm
- Các nhóm cho các vai trò chung (nhà phát triển, nhà thiết kế, v.v.)
- Vai trò được chia sẻ cho các ứng dụng

### Tổ chức đang phát triển

- Nhiều tài khoản AWS cho các môi trường khác nhau
- Vai trò nhiều tài khoản cho tài nguyên được chia sẻ
- Tự động cung cấp và hủy cung cấp người dùng
- Đánh giá và kiểm tra quyền truy cập thường xuyên

## Những sai lầm phổ biến cần tránh

### Lỗi bảo mật

**Sử dụng tài khoản root cho công việc hàng ngày**: Tạo ra rủi ro không đáng có
**Chia sẻ tài khoản người dùng**: Không thể kiểm tra được
**Quyền quá rộng**: Vi phạm nguyên tắc của đặc quyền tối thiểu
**Không sử dụng MFA**: Khiến tài khoản dễ bị đánh cắp mật khẩu

### Sai lầm quản lý

**Không sử dụng nhóm**: Gây khó khăn cho việc quản lý quyền khi bạn mở rộng quy mô
**Quy ước đặt tên không rõ ràng**: Khó hiểu ai có quyền truy cập gì
**Không ghi lại quyền**: Trong tương lai bạn sẽ không nhớ tại sao ai đó có quyền truy cập
**Bỏ qua quyền truy cập không được sử dụng**: Quyền cũ trở thành rủi ro bảo mật

## Công cụ và tính năng IAM

### Công cụ quản lý quyền truy cập

Trình phân tích truy cập **IAM**: Xác định các tài nguyên được chia sẻ với các thực thể bên ngoài
**Organizations**: Quản lý tập trung nhiều tài khoản AWS
**Đăng nhập một lần (SSO)**: Kết nối với hệ thống nhận dạng công ty
**Control Tower**: Quản trị tự động cho thiết lập nhiều tài khoản

### Công cụ bảo mật

**Báo cáo thông tin xác thực**: Xuất CSV của tất cả người dùng và trạng thái thông tin xác thực của họ
**Access Advisor**: Hiển thị những quyền mà người dùng thực sự sử dụng
**Policy Generator**: Giúp tạo chính sách tùy chỉnh
**IAM Simulator**: Kiểm tra chính sách trước khi áp dụng chúng

## Khi nào cần được trợ giúp

IAM có thể phức tạp đối với các trường hợp sử dụng phức tạp. Hãy cân nhắc việc nhận trợ giúp khi:

- **Quản lý nhiều người dùng**: Các tổ chức có hơn 10 người dùng được hưởng lợi từ kiến thức chuyên môn về quản lý danh tính
- **Yêu cầu tuân thủ**: Các ngành được quản lý thường cần thiết lập IAM chuyên dụng
- **Ứng dụng phức tạp**: Ứng dụng nhiều tầng với nhiều dịch vụ tương tác
- **Sự cố bảo mật**: Nếu bạn nghi ngờ có truy cập trái phép, hãy nhờ chuyên gia trợ giúp ngay lập tức

## Nhìn về phía trước

Khi đã quen với các khái niệm IAM cơ bản, bạn có thể khám phá các tính năng nâng cao:

- **Chính sách tùy chỉnh** dành cho các nhu cầu kinh doanh cụ thể
- **Quyền dựa trên điều kiện** phụ thuộc vào thời gian, địa điểm hoặc các yếu tố khác
- **Federation** với hệ thống nhận dạng bên ngoài
- **Quản lý quyền tự động** sử dụng Cơ sở hạ tầng làm Mã

## Các bước tiếp theo

Với IAM cung cấp nền tảng an toàn, bạn đã sẵn sàng bắt đầu xây dựng cơ sở hạ tầng thực tế. Bước tiếp theo của bạn là khởi chạy máy chủ ảo với EC2, nơi bạn sẽ thấy IAM hoạt động khi bạn kết nối các dịch vụ với nhau một cách an toàn.

Hãy nhớ rằng bảo mật không phải là thiết lập một lần - đó là một hoạt động thường xuyên. Khi bạn tìm hiểu thêm về các dịch vụ AWS, hãy luôn xem xét cách IAM phù hợp với bức tranh và cách duy trì tính bảo mật trong khi kích hoạt chức năng.

Những thói quen bạn xây dựng bây giờ với IAM sẽ phục vụ tốt cho bạn trong suốt hành trình đám mây của mình, cho dù bạn đang xây dựng các dự án cá nhân hay ứng dụng doanh nghiệp.
