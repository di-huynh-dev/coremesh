---
title: "Tìm hiểu CI/CD và quy trình làm việc đầu tiên của bạn"
description: Tìm hiểu các nguyên tắc cơ bản của CI/CD và tạo quy trình làm việc Hành động GitHub đầu tiên của bạn để tự động hóa các tác vụ phát triển cơ bản.
order: 1
---

Mọi nhà phát triển đều từng trải qua sự thất vọng khi triển khai bị hỏng, quên chạy thử hoặc mã hoạt động cục bộ nhưng không thành công trong production. Những vấn đề này xuất phát từ việc dựa vào trí nhớ của con người và các quy trình thủ công cho các nhiệm vụ phát triển quan trọng. Khi bạn đang xử lý nhiều tính năng, phải đối mặt với thời hạn và chuyển đổi ngữ cảnh giữa các dự án, bạn rất dễ bỏ qua các bước hoặc mắc lỗi.

Tích hợp liên tục và Triển khai liên tục (CI/CD) giải quyết những vấn đề này bằng cách tự động hóa các tác vụ lặp đi lặp lại, dễ xảy ra lỗi, giúp thu hẹp khoảng cách giữa viết mã và cung cấp giá trị cho người dùng. Thay vì hy vọng bạn nhớ chạy thử nghiệm, kiểm tra chất lượng mã và triển khai chính xác, các hệ thống tự động luôn xử lý các tác vụ này một cách nhất quán.

## Các vấn đề thực sự mà CI/CD giải quyết

Hãy tưởng tượng bạn đang làm việc trong một nhóm nơi các nhà phát triển biến mất trong các nhánh tính năng trong nhiều tuần, sau đó cố gắng hợp nhất mọi thứ cùng một lúc. Việc tích hợp trở thành cơn ác mộng của xung đột, các bài kiểm tra bị hỏng và chỉ trích xem những thay đổi của ai đã phá vỡ điều gì. Ngay cả khi tích hợp thành công, việc triển khai vẫn yêu cầu ai đó phải ghi nhớ hàng chục bước thủ công, thường được thực hiện dưới áp lực và không có chỗ cho sai sót.

Cách tiếp cận truyền thống này tạo ra những trở ngại trong đó việc tích hợp và triển khai trở thành những sự kiện tốn kém, rủi ro mà mọi người đều lo sợ. Các nhóm dành nhiều thời gian đấu tranh cho quá trình phát triển của mình hơn là xây dựng các tính năng. Chất lượng bị ảnh hưởng vì quá trình thử nghiệm diễn ra quá muộn và việc triển khai hiếm đến mức mỗi người đều cảm thấy như đang tung xúc xắc.

CI/CD lật ngược mô hình này bằng cách tích hợp và triển khai thường xuyên, tự động và ít rủi ro. Khi quá trình tích hợp diễn ra nhiều lần trong ngày, xung đột sẽ nhỏ hơn và dễ giải quyết hơn. Khi quá trình triển khai được tự động hóa và được kiểm tra kỹ lưỡng, nó sẽ trở thành một sự kiện không ổn định hơn là một cuộc khủng hoảng.

## Tích hợp liên tục thực sự hoạt động như thế nào

Tích hợp liên tục có nghĩa là các nhà phát triển thường xuyên hợp nhất các thay đổi của họ vào cơ sở mã chính - thường là nhiều lần mỗi ngày thay vì một lần mỗi tuần hoặc mỗi tháng. Mỗi lần hợp nhất sẽ kích hoạt các bản dựng và thử nghiệm tự động nhằm xác minh các thay đổi hoạt động chính xác và không phá vỡ chức năng hiện có.

Đây là cách so sánh quy trình phát triển truyền thống với CI:

```
Traditional Development (Weekly Merges):
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Developer A │    │ Developer B │    │ Developer C │
│ works for   │    │ works for   │    │ works for   │
│ 1 week      │    │ 1 week      │    │ 1 week      │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌─────────────┐
                    │ Integration │
                    │ NIGHTMARE   │  ← Conflicts, broken tests, blame game
                    └─────────────┘

Continuous Integration (Daily Merges):
┌───┐ ┌───┐ ┌───┐    ┌───┐ ┌───┐ ┌───┐    ┌───┐ ┌───┐ ┌───┐
│ A │ │ B │ │ C │    │ A │ │ B │ │ C │    │ A │ │ B │ │ C │
└─┬─┘ └─┬─┘ └─┬─┘    └─┬─┘ └─┬─┘ └─┬─┘    └─┬─┘ └─┬─┘ └─┬─┘
  │     │     │        │     │     │        │     │     │
  └─────┼─────┘        └─────┼─────┘        └─────┼─────┘
        │                    │                    │
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │Auto Test│          │Auto Test│          │Auto Test│  ← Small, easy fixes
   │& Build  │          │& Build  │          │& Build  │
   └─────────┘          └─────────┘          └─────────┘
     Day 1                Day 2                Day 3
```

Điều kỳ diệu xảy ra vì các vấn đề tích hợp tăng theo cấp số nhân theo thời gian. Nếu hai nhà phát triển làm việc riêng trong một ngày thì việc hợp nhất các thay đổi của họ tương đối đơn giản. Nếu họ làm việc riêng trong hai tuần, việc tích hợp sẽ trở nên phức tạp và tốn thời gian hơn nhiều. CI giữ khoản nợ tích hợp này ở mức thấp bằng cách giải quyết các xung đột khi chúng còn mới và có thể quản lý được.

Hệ thống CI tự động của bạn trở thành một mạng lưới an toàn giúp phát hiện các vấn đề trước khi chúng ảnh hưởng đến các thành viên khác trong nhóm. Nó cung cấp phản hồi nhanh chóng về chất lượng mã và giúp duy trì các tiêu chuẩn cao mà không làm chậm tốc độ phát triển.

## Triển khai liên tục trong thực tế

Triển khai liên tục đưa CI đi xa hơn bằng cách tự động phát hành mã vượt qua tất cả các bước kiểm tra chất lượng. Điều này không có nghĩa là mọi thay đổi mã sẽ ngay lập tức đến tay người dùng - điều đó có nghĩa là mã của bạn luôn ở dạng trạng thái có thể triển khai và bạn có thể chọn thời điểm phát hành các tính năng.

Thay vào đó, nhiều nhóm thực hành Phân phối liên tục để duy trì khả năng triển khai tự động tương tự nhưng yêu cầu phê duyệt thủ công đối với các bản phát hành production. Điều quan trọng là phải có các quy trình triển khai tự động, đáng tin cậy giúp loại bỏ lỗi của con người và làm cho các bản phát hành có thể dự đoán được.

## Tạo quy trình làm việc hành động GitHub đầu tiên của bạn

Hãy xây dựng một quy trình làm việc đơn giản thể hiện các khái niệm cốt lõi mà không quá phức tạp. Quy trình công việc của GitHub Actions là các tệp YAML được lưu trữ trong thư mục `.github/workflows` của kho lưu trữ của bạn. Khi GitHub phát hiện các tệp này, nó sẽ tự động chạy chúng dựa trên trình kích hoạt bạn chỉ định.

Tạo `.github/workflows/hello-world.yml` trong kho lưu trữ của bạn:

```yaml
name: Hello World Workflow

# When should this workflow run?
# These triggers respond to common development events
on:
  push:
  pull_request:

# What work should be done?
# Jobs run independently on separate virtual machines
jobs:
  say-hello:
    # Use Ubuntu Linux for consistency and tool availability
    runs-on: ubuntu-latest

    # Steps execute sequentially within each job
    steps:
      # Download your repository's code into the virtual machine
      - name: Get the code
        uses: actions/checkout@v4

      # Run commands just like you would locally
      - name: Say hello
        run: echo "Hello, GitHub Actions!"

      # Access information about this workflow run
      - name: Show context information
        run: |
          echo "Repository: ${{ github.repository }}"
          echo "Branch: ${{ github.ref_name }}"
          echo "Triggered by: ${{ github.event_name }}"
          echo "User: ${{ github.actor }}"
```

Quy trình công việc này giới thiệu các khối xây dựng thiết yếu. `name` cung cấp cho quy trình làm việc của bạn một tiêu đề mô tả xuất hiện trong giao diện của GitHub. Phần `on` xác định trình kích hoạt - sự kiện khiến GitHub thực thi quy trình làm việc của bạn.

Phần `jobs` chứa tác phẩm thực tế. Mỗi công việc chạy trên máy ảo riêng, nghĩa là các công việc có thể chạy song song theo mặc định. Trường `runs-on` chỉ định hệ điều hành - Ubuntu cung cấp môi trường Linux với các công cụ phát triển phổ biến được cài đặt sẵn.

Trong mỗi công việc, `steps` xác định những gì xảy ra tuần tự. Bạn có thể sử dụng các hành động dựng sẵn (như `actions/checkout`) hoặc chạy trực tiếp các lệnh shell. Hành động thanh toán là cần thiết vì nó tải các tệp trong kho lưu trữ của bạn xuống máy ảo trống.

## Tìm hiểu hệ thống ngữ cảnh của GitHub

Quy trình làm việc ở trên thể hiện việc truy cập thông tin ngữ cảnh của GitHub bằng cách sử dụng các biểu thức như `${{ github.repository }}`. Hệ thống ngữ cảnh này cung cấp thông tin mở rộng về việc thực thi quy trình công việc, bao gồm chi tiết kho lưu trữ, sự kiện kích hoạt và thông tin môi trường.

Biểu thức ngữ cảnh làm cho quy trình làm việc trở nên thông minh hơn bằng cách điều chỉnh hành vi dựa trên các điều kiện. Bạn có thể chạy các bước khác nhau cho pull request so với các bước đẩy hoặc thay đổi hành vi dựa trên nhánh nào đã kích hoạt quy trình làm việc. Tính linh hoạt này cho phép tự động hóa tinh vi đáp ứng phù hợp với các tình huống khác nhau.

Cú pháp dấu ngoặc nhọn kép `${{ }}` yêu cầu GitHub đánh giá biểu thức và thay thế kết quả. Tính năng này hoạt động xuyên suốt các tệp quy trình công việc, cho phép cấu hình động thay đổi dựa trên điều kiện thời gian chạy.

## Chạy quy trình công việc đầu tiên của bạn

commit và đẩy tệp quy trình làm việc vào kho lưu trữ của bạn. GitHub tự động phát hiện quy trình làm việc mới và bắt đầu theo dõi các sự kiện kích hoạt. Vì bạn đã định cấu hình quy trình làm việc để chạy khi đẩy, GitHub sẽ thực thi nó ngay lập tức khi bạn đẩy commit.

Điều hướng đến tab "Hành động" trong kho lưu trữ của bạn để xem quy trình thực hiện quy trình làm việc. GitHub cung cấp nhật ký chi tiết hiển thị từng công việc và bước, bao gồm cả kết quả đầu ra từ các lệnh bạn chạy. Bạn có thể mở rộng các bước riêng lẻ để xem chính xác điều gì đã xảy ra và khắc phục mọi sự cố.

Khả năng hiển thị này rất quan trọng để hiểu và gỡ lỗi quy trình công việc. Khi xảy ra sự cố, những nhật ký này sẽ cho bạn biết chính xác sự cố đã xảy ra ở đâu. Khi mọi thứ hoạt động chính xác, nhật ký sẽ xác nhận rằng mỗi bước đã hoàn thành như mong đợi.

## Môi trường thực thi

Mỗi công việc trong quy trình làm việc bắt đầu bằng một máy ảo mới chạy bản cài đặt hệ điều hành sạch. Sự cô lập này đảm bảo các bản dựng có thể tái tạo và ngăn chặn các quy trình công việc can thiệp lẫn nhau. Tuy nhiên, điều đó có nghĩa là mỗi công việc không biết gì về mã hoặc phần phụ thuộc của bạn trừ khi bạn cung cấp chúng một cách rõ ràng.

Hành động `actions/checkout` giải quyết nhu cầu cơ bản nhất bằng cách tải xuống mã kho lưu trữ của bạn. Nếu không có bước này, quy trình làm việc của bạn sẽ chạy trong môi trường trống và không có quyền truy cập vào các tệp dự án của bạn. Bước rõ ràng này có vẻ dư thừa nhưng nó cung cấp quyền kiểm soát phiên bản mã nào của bạn sẽ được sử dụng và cách mã được định cấu hình.

GitHub cung cấp tài nguyên điện toán đáng kể để thực hiện quy trình làm việc. Các kho lưu trữ công khai nhận được số phút không giới hạn, trong khi các kho lưu trữ riêng tư có hạn ngạch hàng tháng dựa trên gói GitHub của bạn. Các máy ảo đủ mạnh cho hầu hết các tác vụ phát triển, bao gồm xây dựng ứng dụng, chạy thử nghiệm và triển khai lên các dịch vụ đám mây.

## Những gì bạn đã hoàn thành

Bạn đã tạo quy trình làm việc Hành động GitHub đang hoạt động và hiểu các khái niệm cơ bản về trình kích hoạt, công việc và các bước. Nền tảng này hỗ trợ mọi thứ khác mà bạn sẽ xây dựng bằng tự động hóa CI/CD.

Quy trình làm việc đơn giản mà bạn tạo có vẻ không ấn tượng nhưng nó thể hiện mô hình cốt lõi hỗ trợ quá trình tự động hóa tinh vi: phản hồi các sự kiện phát triển bằng các tác vụ tự động. Cho dù bạn đang chạy thử nghiệm, xây dựng ứng dụng hay triển khai lên production, bạn sẽ sử dụng cấu trúc cơ bản giống nhau của trình kích hoạt, công việc và các bước.

## Các mẫu quy trình công việc chung

Hầu hết các quy trình công việc đều tuân theo các mẫu có thể nhận biết được dựa trên mục đích của chúng. Quy trình kiểm thử thường kiểm tra mã, thiết lập môi trường thời gian chạy, cài đặt các phần phụ thuộc và chạy kiểm thử. Quy trình triển khai có thể tải xuống bản dựng artifact, định cấu hình môi trường đích và triển khai ứng dụng.

Việc hiểu các mẫu này giúp bạn thiết kế quy trình làm việc mà các nhà phát triển khác sẽ nhận ra và duy trì. Bạn không chỉ viết các tập lệnh tự động hóa - bạn đang tạo cơ sở hạ tầng hỗ trợ quá trình phát triển của nhóm bằng cách sử dụng các quy ước đã được thiết lập.

Trong phần tiếp theo, chúng ta sẽ khám phá các khối xây dựng này chi tiết hơn, bao gồm cấu hình trình kích hoạt nâng cao, các phần phụ thuộc của công việc và thị trường của các hành động được tạo sẵn. Bạn sẽ học cách tạo các quy trình công việc phức tạp hơn để xử lý các tình huống phát triển thực tế.
