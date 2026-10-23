---
title: "Bắt đầu với tài khoản AWS của bạn"
description: Tạo tài khoản AWS đầu tiên của bạn và học cách tìm đường quanh bảng điều khiển mà không bị lạc. Bao gồm đăng ký, cảnh báo thanh toán, an toàn tài khoản root và khu vực.
order: 1
---

Bắt đầu với AWS có thể có cảm giác giống như bước vào một cửa hàng điện tử khổng lồ, nơi mọi thứ đều có vẻ quan trọng nhưng bạn không chắc chắn về những thứ đó. Bảng điều khiển AWS có hàng trăm dịch vụ và bạn rất dễ cảm thấy choáng ngợp.

Phần này giúp bạn định hướng và xây dựng sự tự tin khi điều hướng AWS mà không bị lạc.

## Tạo tài khoản AWS của bạn

Việc thiết lập tài khoản AWS rất đơn giản nhưng có một số chi tiết quan trọng cần thực hiện ngay từ đầu.

### Những gì bạn sẽ cần

- **Eđịa chỉ email**: Sử dụng địa chỉ bạn kiểm tra thường xuyên (AWS gửi thông báo quan trọng)
- **Số điện thoại**: Để xác minh và bảo mật tài khoản
- **Thẻ tín dụng**: Bắt buộc ngay cả đối với các dịch vụ miễn phí (đừng lo, chúng tôi sẽ chỉ cho bạn cách tránh bị tính phí)

### Chọn tên tài khoản của bạn

Chọn nội dung nào đó có ý nghĩa như "John Smith Personal" hoặc "MyCompany Development". Bạn sẽ thấy tên này trên toàn bộ bảng điều khiển, vì vậy hãy làm cho nó rõ ràng và chuyên nghiệp.

### Lựa chọn kế hoạch hỗ trợ

AWS cung cấp các mức hỗ trợ khác nhau:

- **Hỗ trợ cơ bản**: Miễn phí, bao gồm các câu hỏi về thanh toán và xử lý sự cố cơ bản
- **Hỗ trợ nhà phát triển**: $29/tháng, bao gồm hỗ trợ kỹ thuật
- **Hỗ trợ kinh doanh**: $100+/tháng, cho các ứng dụng production

Đối với việc học, Hỗ trợ cơ bản là hoàn hảo. Bạn luôn có thể nâng cấp sau.

## Tìm hiểu các khu vực AWS

Trước khi bắt đầu tạo bất cứ thứ gì, bạn cần hiểu các vùng. AWS vận hành các trung tâm dữ liệu trên khắp thế giới, được nhóm thành các khu vực như:

- **US East (N. Virginia)**: Thường rẻ nhất, có tính năng mới trước tiên
- **US Tây (Oregon)**: Lựa chọn thay thế tốt cho Miền Đông Hoa Kỳ
- **Europe (Ireland)**: Dành cho người dùng Châu Âu
- **Asia Pacific ( Singapore)**: Dành cho người dùng Châu Á

**Đối với hướng dẫn này, chọn US East (N. Virginia)** vì:

- Hầu hết các ví dụ đều sử dụng vùng này
- Nó thường là rẻ nhất
- Tất cả các dịch vụ đều có sẵn ở đó
- Nhiều hướng dẫn AWS đảm nhận khu vực này

Bạn có thể thay đổi vùng bất cứ lúc nào bằng cách sử dụng menu thả xuống ở góc trên bên phải của bảng điều khiển.

## Cái nhìn đầu tiên của bạn về Bảng điều khiển AWS

Khi bạn đăng nhập lần đầu, bảng điều khiển AWS có vẻ quá tải. Đây là cách hiểu ý nghĩa của nó:

### Menu dịch vụ

Điều hướng chính liệt kê các dịch vụ AWS theo danh mục:

- **Compute**: Máy chủ ảo và hàm không có máy chủ
- **Storage**: Lưu trữ tệp và cơ sở dữ liệu
- **Networking**: Cân bằng tải và phân phối nội dung
- **Database**: Dịch vụ cơ sở dữ liệu được quản lý
- **Security**: Quản lý người dùng và mã hóa

Đừng cố gắng hiểu mọi dịch vụ ngay lập tức. Tập trung vào các dịch vụ cốt lõi mà bạn sẽ học trong hướng dẫn này.

### Thanh tìm kiếm

Cách nhanh nhất để tìm dịch vụ là thanh tìm kiếm ở trên cùng. Bắt đầu nhập "EC2" hoặc "S3" và nó sẽ tìm thấy thứ bạn cần.

### Dịch vụ đã truy cập gần đây

AWS ghi nhớ những dịch vụ nào bạn sử dụng nhiều nhất và hiển thị chúng một cách nổi bật. Điều này giúp điều hướng nhanh hơn khi bạn làm quen với các dịch vụ được sử dụng nhiều nhất.

## Thiết lập trang tổng quan của bạn

Bảng thông tin bảng điều khiển AWS hiển thị tổng quan về tài khoản của bạn. Tùy chỉnh nó để hiển thị thông tin quan trọng với bạn:

### Các tiện ích hữu ích để thêm

- **Service Health**: Hiển thị nếu có bất kỳ dịch vụ AWS nào đang gặp sự cố
- **Billing**: Chi tiêu trong tháng hiện tại của bạn
- **Chi phí và cách sử dụng**: Xu hướng sử dụng của bạn
- **Cố vấn đáng tin cậy**: Đề xuất tối ưu hóa

### Cá nhân hóa trải nghiệm của bạn

- **Ghim các dịch vụ được sử dụng thường xuyên** vào thanh công cụ của bạn
- **Đánh dấu các trang dịch vụ cụ thể** trong trình duyệt của bạn
- **Thiết lập dấu trang trình duyệt** cho các tác vụ thông thường

## Hiểu bảng điều khiển thanh toán

Trước khi tạo bất kỳ tài nguyên nào, hãy làm quen với việc thanh toán. Ngay cả với bậc miễn phí, điều quan trọng là phải hiểu cách tính giá của AWS.

### Các khái niệm thanh toán chính

**Free Tier**: Phụ cấp hào phóng cho tài khoản mới (12 tháng đối với hầu hết các dịch vụ)
**Pay-as-you-go**: Bạn bị tính phí cho những gì bạn thực sự sử dụng
**Giá theo khu vực**: Chi phí thay đổi một chút tùy theo khu vực địa lý
** Định giá dành riêng cho dịch vụ**: Mỗi dịch vụ AWS có mô hình định giá riêng

### Thiết lập cảnh báo thanh toán

Điều này rất quan trọng đối với người mới bắt đầu. Thiết lập thông báo qua email khi hóa đơn của bạn đạt đến:

- **$1**: Nhận thức sớm về mọi khoản phí
- **$10**: Đã đến lúc điều tra nguyên nhân gây ra chi phí
- **$25**: Cần hành động ngay lập tức

Những cảnh báo này giúp bạn kiểm soát và ngăn chặn các hóa đơn bất ngờ.

## AWS CLI: Người bạn dòng lệnh của bạn

Mặc dù bảng điều khiển web rất tốt cho việc học nhưng nhiều tác vụ AWS lại nhanh hơn từ dòng lệnh. AWS cung cấp một công cụ có tên AWS CLI (Giao diện dòng lệnh).

### Tại sao nên sử dụng dòng lệnh?

- **Nhanh hơn cho các tác vụ lặp đi lặp lại**: Tạo nhiều tài nguyên cùng một lúc
- **Automation**: Viết script thiết lập môi trường
- **Learning**: Hiểu bảng điều khiển đang làm gì ở hậu trường
- **Phát triển chuyên nghiệp**: Hầu hết các công việc AWS đều yêu cầu sự quen thuộc với CLI

### AWS CloudShell: Không cần cài đặt

AWS CloudShell cung cấp cho bạn dòng lệnh ngay trong trình duyệt của bạn:

- Nhấp vào biểu tượng CloudShell trong bảng điều khiển AWS
- Đợi một lát để nó tải
- Bạn đã sẵn sàng chạy lệnh AWS

Hãy thử lệnh đơn giản này để xem thông tin tài khoản của bạn:

```bash
aws sts get-caller-identity
```

### Cài đặt CLI trên máy tính của bạn (Tùy chọn)

Nếu bạn thích làm việc trên máy tính của mình:

- **Mac**: `brew install awscli`
- **Windows**: Tải xuống từ trang web AWS
- **Linux**: Thường có sẵn thông qua trình quản lý gói của bạn

## Tổ chức tài nguyên AWS của bạn

Khi bạn bắt đầu tạo tài nguyên, tổ chức trở nên quan trọng. AWS cung cấp một số công cụ để sắp xếp mọi thứ gọn gàng:

### Quy ước đặt tên

Phát triển sớm các mẫu đặt tên nhất quán:

- **EMôi trường-Dịch vụ-Mục đích**: `dev-web-server`
- **Dự án-Môi trường-Dịch vụ**: `blog-prod-database`
- **Date-Project-Resource**: `2025-website-backup`

Những cái tên hay giúp bạn:

- Tìm tài nguyên nhanh chóng
- Hiểu mỗi tài nguyên làm gì
- Xác định các tài nguyên có thể bị xóa

### Chiến lược gắn thẻ

Thẻ là nhãn bạn có thể đính kèm vào tài nguyên AWS. Chúng vô hình với người dùng nhưng giúp bạn sắp xếp và theo dõi chi phí:

**Thẻ chung**:

- `Environment`: đang phát triển, staging, production
- `Project`: ứng dụng hoặc trang web nào
- `Owner`: người tạo hoặc quản lý tài nguyên
- `Cost Center`: phân bổ chi phí kinh doanh

Bắt đầu gắn thẻ tài nguyên từ ngày đầu tiên. Việc thêm thẻ sau này sẽ khó hơn nhiều khi bạn có hàng tá tài nguyên.

## Các biện pháp thực hành tốt nhất về bảo mật ngay từ ngày đầu tiên

Tài khoản AWS của bạn bắt đầu với quyền truy cập quản trị đầy đủ, điều này rất mạnh mẽ nhưng đầy rủi ro. Dưới đây là các bước bảo mật ngay lập tức:

### Kích hoạt xác thực đa yếu tố (MFA)

MFA thêm lớp bảo mật thứ hai vào tài khoản của bạn:

1. Đi tới "Thông tin xác thực bảo mật của tôi" trong menu tài khoản của bạn
2. Kích hoạt MFA bằng ứng dụng như Google Authenticator
3. Kiểm tra thiết lập để đảm bảo nó hoạt động

Bước đơn giản này ngăn chặn hầu hết các hành vi xâm phạm tài khoản.

### Không sử dụng tài khoản root cho công việc hàng ngày

Tài khoản gốc của bạn (tài khoản bạn đã tạo ban đầu) chỉ nên được sử dụng cho:

- Thiết lập tài khoản và thanh toán
- Truy cập khẩn cấp
- Nhiệm vụ hành chính cụ thể

Đối với công việc hàng ngày, bạn sẽ tạo các tài khoản người dùng riêng biệt (được đề cập trong phần tiếp theo).

## Tìm hiểu tài liệu AWS

AWS cung cấp tài liệu phong phú nhưng có thể khiến bạn choáng ngợp. Đây là cách sử dụng nó một cách hiệu quả:

### Các loại tài liệu

**Hướng dẫn bắt đầu**: Hướng dẫn từng bước cho người mới bắt đầu
**Hướng dẫn sử dụng**: Tài liệu tham khảo toàn diện cho từng dịch vụ
**API Tài liệu tham khảo**: Chi tiết kỹ thuật dành cho nhà phát triển
**Thực tiễn tốt nhất**: Khuyến nghị từ các chuyên gia AWS

### Tìm kiếm những gì bạn cần

Bắt đầu với hướng dẫn Bắt đầu, sau đó chuyển sang Hướng dẫn sử dụng để biết thêm chi tiết. Đừng cảm thấy như bạn cần phải đọc mọi thứ - hãy sử dụng tài liệu để trả lời các câu hỏi cụ thể.

### Tài nguyên cộng đồng

Ngoài tài liệu chính thức:

- Diễn đàn **AWS**: Hỏi đáp cộng đồng
- **Stack Overflow**: Câu hỏi lập trình
- **YouTube**: Video hướng dẫn và hướng dẫn
- **Blogs**: Kinh nghiệm và mẹo trong thế giới thực

## Phím tắt và mẹo trên bảng điều khiển

Tăng tốc quy trình làm việc AWS của bạn với các trình tiết kiệm thời gian sau:

### Phím tắt

- **alt + S**: Mở menu dịch vụ
- **/** (dấu gạch chéo lên): Thanh tìm kiếm tiêu điểm
- **Ctrl/Cmd + Click**: Mở liên kết trong tab mới

### Mẹo trình duyệt

- **Đánh dấu các trang dịch vụ được sử dụng thường xuyên**: bảng điều khiển EC2, bảng điều khiển S3, v.v.
- **Sử dụng nhiều tab**: Mở đồng thời nhiều dịch vụ khác nhau
- **Pin tab bảng điều khiển AWS**: Để bạn không bị mất nó trong số các tab khác

### Truy cập di động

AWS có các ứng dụng di động để giám sát và quản lý cơ bản:

- **AWS Console Mobile App**: Nhiệm vụ quản lý cơ bản
- **AWS Quản lý thiết bị IoT**: Dành cho các dự án IoT
- **AMazon WorkSpaces**: Truy cập máy tính để bàn trên nền tảng đám mây

## Những lỗi điều hướng phổ biến cho người mới bắt đầu

### Bị lạc trong danh sách dịch vụ

**Problem**: Cố gắng hiểu mọi dịch vụ cùng một lúc
**Solution**: Trước tiên hãy tập trung vào các dịch vụ cốt lõi trong hướng dẫn này

### Bỏ qua khu vực

**Problem**: Vô tình tạo tài nguyên ở các vùng khác nhau
**Solution**: Luôn kiểm tra khu vực hiện tại của bạn ở góc trên bên phải

### Không sử dụng tìm kiếm

**Problem**: Cuộn qua danh sách dịch vụ dài
**Solution**: Sử dụng thanh tìm kiếm cho mọi thứ

### Quên về việc thanh toán

**Problem**: Không theo dõi chi phí cho đến khi hóa đơn đến
**Solution**: Kiểm tra bảng thông tin thanh toán hàng tuần

## Khi mọi việc diễn ra không như ý muốn

Ngay cả những người dùng AWS có kinh nghiệm đôi khi cũng bối rối hoặc mắc lỗi. Đây là những gì cần làm:

### Không thể tìm thấy tài nguyên

Kiểm tra:

1. **Khu vực chính xác**: Tài nguyên chỉ xuất hiện ở khu vực nơi chúng được tạo
2. **Bộ lọc dịch vụ**: Một số bảng điều khiển có bộ lọc có thể ẩn tài nguyên
3. **Quyền tài khoản**: Đảm bảo bạn có quyền truy cập để xem tài nguyên

### Phí bất ngờ

Kiểm tra:

1. **Bảng thông tin thanh toán**: Xem chính xác những gì đang bị tính phí
2. **Dọn dẹp tài nguyên**: Tìm kiếm các phiên bản đang chạy bị lãng quên
3. **Sử dụng bậc miễn phí**: Xác minh rằng bạn chưa vượt quá giới hạn bậc miễn phí

### Bảng điều khiển không tải

Hãy thử:

1. **Làm mới trang**: Đơn giản nhưng thường hiệu quả
2. **Xóa bộ nhớ đệm của trình duyệt**: Đôi khi dữ liệu được lưu trong bộ nhớ đệm gây ra sự cố
3. **Thử một trình duyệt khác**: Cách ly các sự cố cụ thể của trình duyệt
4. **Kiểm tra AWS Service Health**: Đôi khi các dịch vụ AWS bị ngừng hoạt động

## Lộ trình học tập của bạn

Bây giờ bạn đã cảm thấy thoải mái với những điều cơ bản:

1. **Khám phá bảng điều khiển** mà không bị áp lực phải hiểu mọi thứ
2. **Thiết lập cảnh báo thanh toán** để theo dõi chi phí
3. **Tạo tài nguyên đầu tiên của bạn** theo hướng dẫn này
4. **Thực hành điều hướng** bằng cách tìm các dịch vụ khác nhau
5. **Đánh dấu các trang hữu ích** để truy cập nhanh

## Xây dựng niềm tin

Hãy nhớ rằng mọi chuyên gia AWS đều bắt đầu ở chính xác vị trí hiện tại của bạn. Bảng điều khiển sẽ trở nên quen thuộc với việc sử dụng và bạn sẽ phát triển các kiểu điều hướng cũng như tùy chọn của riêng mình.

Đừng lo lắng về việc ghi nhớ mọi thứ ngay lập tức. Tập trung vào việc hiểu được bức tranh toàn cảnh và biết nơi tìm thông tin khi bạn cần.

## Các bước tiếp theo

Với việc thiết lập tài khoản và xây dựng sự tự tin khi điều hướng, bạn đã sẵn sàng tìm hiểu về bảo mật AWS thông qua Quản lý danh tính và quyền truy cập (IAM).

IAM được cho là dịch vụ AWS quan trọng nhất vì nó kiểm soát quyền truy cập vào mọi thứ khác. Việc hiểu sớm IAM sẽ ngăn chặn các vấn đề bảo mật và giúp bạn tự tin khám phá các dịch vụ khác một cách an toàn.

Mặc dù ban đầu IAM có vẻ phức tạp nhưng các khái niệm cốt lõi lại đơn giản và cần thiết đối với bất kỳ ai nghiêm túc muốn sử dụng AWS một cách hiệu quả.
