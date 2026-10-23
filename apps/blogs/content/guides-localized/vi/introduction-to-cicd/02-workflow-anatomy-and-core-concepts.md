---
title: "Cấu trúc workflow và các khái niệm cốt lõi"
description: Đi sâu vào cấu trúc quy trình làm việc, trình kích hoạt, công việc và thị trường hành động của GitHub Action để xây dựng tính năng tự động hóa mạnh mẽ.
order: 2
---

Hiểu cách các quy trình công việc của GitHub Action khớp với nhau cũng giống như học ngữ pháp của tự động hóa. Khi bạn nắm bắt được cách các quy trình công việc, công việc, các bước và hành động phối hợp với nhau, bạn có thể thể hiện rõ ràng các ý tưởng tự động hóa phức tạp và xây dựng các hệ thống mà các nhà phát triển khác có thể dễ dàng hiểu và duy trì.

Thông tin chi tiết quan trọng là GitHub Actions phản ánh cách bạn suy nghĩ một cách tự nhiên về các nhiệm vụ phát triển. Bạn có các mục tiêu cấp cao (như "triển khai ứng dụng"), được chia thành các giai đoạn hợp lý (như "xây dựng", "kiểm tra", "triển khai"), sau đó chia thành các hành động cụ thể (như "cài đặt phần phụ thuộc", "chạy thử nghiệm", "tải tệp lên"). Hệ thống phân cấp này làm cho quy trình làm việc trở nên trực quan khi bạn hiểu cấu trúc.

## Quy trình làm việc thực tế được cấu trúc như thế nào

Mọi quy trình công việc của GitHub Action đều tuân theo một hệ thống phân cấp có thể dự đoán được, phản ánh các quy trình phát triển thực tế. Ở trên cùng, bạn có quy trình làm việc phản hồi các sự kiện cụ thể. Trong quy trình làm việc đó, bạn xác định các công việc đại diện cho các giai đoạn chính của công việc. Mỗi công việc bao gồm các bước thực hiện các nhiệm vụ riêng lẻ.

Đây là cấu trúc phân cấp:

```
Workflow: "Build and Deploy Application"
├── Triggers: [push, pull_request, schedule]
├── Environment Variables: NODE_VERSION=18
│
├── Job: "quality-check" (runs-on: ubuntu-latest)
│   ├── Step: "Checkout code"
│   ├── Step: "Setup Node.js"
│   ├── Step: "Install dependencies"
│   ├── Step: "Run tests"
│   └── Step: "Run linting"
│
├── Job: "build" (needs: quality-check)
│   ├── Step: "Checkout code"
│   ├── Step: "Setup Node.js"
│   ├── Step: "Install dependencies"
│   ├── Step: "Build application"
│   └── Step: "Upload artifacts"
│
└── Job: "deploy" (needs: build)
    ├── Step: "Download artifacts"
    ├── Step: "Deploy to staging"
    └── Step: "Run smoke tests"
```

Và đây là cách các công việc có thể chạy song song hoặc theo trình tự:

```
Parallel Execution (default):
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    Job A    │  │    Job B    │  │    Job C    │
│   (tests)   │  │   (lint)    │  │   (build)   │
└─────────────┘  └─────────────┘  └─────────────┘
      │                │                │
      └────────────────┼────────────────┘
                       │
              ┌─────────────┐
              │   Finish    │
              │  Together   │
              └─────────────┘

Sequential Execution (with needs):
┌─────────────┐
│    Job A    │
│   (tests)   │
└─────────────┘
      │
      ▼
┌─────────────┐
│    Job B    │
│   (build)   │  ← waits for Job A
└─────────────┘
      │
      ▼
┌─────────────┐
│    Job C    │
│  (deploy)   │  ← waits for Job B
└─────────────┘
```

Hãy xem xét quy trình làm việc thể hiện những khái niệm này trong thực tế:

```yaml
name: Build and Deploy Application

# Control exactly when this workflow runs
# Precision here prevents wasted resources and noise
on:
  push:
    # Only run for important branches
    branches: [main, develop]
    # Ignore documentation changes that don't affect the build
    paths-ignore:
      - '**.md'
      - 'docs/**'

  pull_request:
    branches: [main]
    # Only run when code actually changes
    paths:
      - 'src/**'
      - 'package.json'
      - 'package-lock.json'

  # Allow manual execution with parameters
  workflow_dispatch:
    inputs:
      environment:
        description: 'Where to deploy'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]

# Configuration that applies to all jobs
env:
  NODE_VERSION: '18'

jobs:
  # First job: validate code quality
  quality-check:
    runs-on: ubuntu-latest

    # This job creates outputs that other jobs can use
    outputs:
      tests-passed: ${{ steps.test.outputs.passed }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check code style
        run: npm run lint

      - name: Run tests
        id: test
        run: |
          npm test
          echo "passed=true" >> $GITHUB_OUTPUT

  # Second job: build the application
  # This only runs if quality checks pass
  build:
    runs-on: ubuntu-latest
    needs: quality-check
    # Skip build if it's just a documentation change
    if: needs.quality-check.outputs.tests-passed == 'true'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      # Save the build output for other jobs
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: application-build
          path: dist/

  # Third job: deploy if everything worked
  deploy:
    runs-on: ubuntu-latest
    needs: [quality-check, build]
    # Only deploy from main branch or manual triggers
    if: github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch'

    steps:
      - uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: application-build
          path: dist/

      - name: Deploy to environment
        run: |
          echo "Deploying to ${{ github.event.inputs.environment || 'staging' }}"
          # Your deployment commands would go here
```

Ví dụ này cho thấy các công việc phụ thuộc lẫn nhau như thế nào bằng cách sử dụng từ khóa `needs`, tạo pipeline trong đó các giai đoạn sau chỉ chạy nếu các giai đoạn trước đó thành công. Các điều kiện `if` thể hiện cách đặt công việc có điều kiện dựa trên ngữ cảnh như tên chi nhánh hoặc kết quả công việc trước đó.

## Trình kích hoạt quy trình làm việc

Trình kích hoạt quy trình làm việc xác định thời điểm GitHub thực hiện tự động hóa của bạn. Hiểu về trình kích hoạt giúp bạn xây dựng quy trình công việc hiệu quả để chạy khi cần mà không lãng phí tài nguyên hoặc tạo ra tiếng ồn.

Trình kích hoạt đẩy tạo thành xương sống của tích hợp liên tục, chạy bất cứ khi nào ai đó đẩy commit đến các nhánh được chỉ định. Tuy nhiên, bạn có thể tinh chỉnh chúng để tránh những hoạt động không cần thiết. Bộ lọc `paths` đảm bảo quy trình công việc chỉ chạy khi các tệp có liên quan thay đổi, trong khi `branches` hạn chế thực thi ở các nhánh quan trọng.

Trình kích hoạt pull request cho phép quy trình đánh giá mã chạy khi nhà phát triển đề xuất thay đổi. Các quy trình công việc này thường tập trung vào thử nghiệm và xác thực hơn là triển khai, giúp duy trì chất lượng mã trước khi các thay đổi đến các nhánh chính.

Trình kích hoạt `workflow_dispatch` cho phép thực hiện quy trình làm việc thủ công thông qua giao diện của GitHub. Điều này tỏ ra vô giá đối với các quy trình triển khai hoặc nhiệm vụ bảo trì cần sự phê duyệt của con người. Hệ thống đầu vào cho phép bạn thu thập thông số từ người dùng, giúp quy trình làm việc thủ công trở nên linh hoạt và có thể tái sử dụng.

Trình kích hoạt lịch trình sử dụng cú pháp cron để thực thi theo thời gian, cho phép thực hiện các hoạt động như xây dựng hàng đêm để kiểm tra các phần phụ thuộc mới hoặc tạo báo cáo thường xuyên. Những quy trình công việc này giúp nắm bắt các vấn đề môi trường không xuất hiện trong quá trình phát triển thông thường.

## Sự phụ thuộc công việc và thực thi song song

Theo mặc định, tất cả công việc trong quy trình làm việc đều chạy song song, tối đa hóa hiệu quả bằng cách sử dụng đồng thời nhiều máy ảo. Điều này hoạt động tốt khi các công việc độc lập, nhưng quy trình làm việc thực tế thường cần thực hiện tuần tự trong đó các công việc sau này phụ thuộc vào việc hoàn thành thành công các công việc trước đó.

Từ khóa `needs` tạo ra sự phụ thuộc rõ ràng giữa các công việc. Khi bạn chỉ định `needs: quality-check`, công việc đó sẽ đợi công việc kiểm tra chất lượng hoàn tất trước khi bắt đầu. Nếu phần phụ thuộc không thành công thì công việc phụ thuộc sẽ bị bỏ qua trừ khi bạn ghi đè hành vi này bằng các biểu thức điều kiện.

Sự phụ thuộc của công việc cũng cho phép luồng dữ liệu đi qua đầu ra. Các công việc có thể tạo đầu ra bằng tệp `GITHUB_OUTPUT` và các công việc khác có thể truy cập các giá trị này bằng cách sử dụng các biểu thức như `needs.quality-check.outputs.tests-passed`. Điều này tạo ra các kênh liên lạc cho phép công việc chia sẻ thông tin và đưa ra quyết định dựa trên kết quả trước đó.

Hãy xem xét ý nghĩa hiệu quả của cơ cấu công việc của bạn. Việc chạy thử nghiệm và xây dựng song song giúp tiết kiệm thời gian nhưng bạn có thể muốn tránh các công việc triển khai tốn kém nếu thử nghiệm thất bại. Điều quan trọng là cân bằng tốc độ với hiệu quả tài nguyên.

## Hệ sinh thái thị trường hành động

GitHub Actions có được phần lớn sức mạnh từ thị trường - một tập hợp các thành phần tự động hóa được xây dựng sẵn để xử lý các tác vụ thông thường. Thay vì viết tập lệnh shell cho mọi thao tác, bạn có thể sử dụng các hành động đã được kiểm tra, duy trì để cung cấp giao diện nhất quán và xử lý các trường hợp khó khăn.

Hành động quan trọng nhất là `actions/checkout`, tải mã kho lưu trữ của bạn xuống máy ảo của quy trình làm việc. Nếu không có hành động này, quy trình làm việc sẽ chạy trong môi trường trống và không có quyền truy cập vào tệp dự án của bạn. Hành động này tự động xử lý xác thực, cấu hình git và các tình huống thanh toán khác nhau.

Các hành động thiết lập dành riêng cho ngôn ngữ như `actions/setup-node`, `actions/setup-python` hoặc `actions/setup-java` cài đặt môi trường thời gian chạy và định cấu hình chuỗi công cụ. Những hành động này cung cấp môi trường nhất quán trên các hệ điều hành khác nhau và xử lý các chi tiết như bộ nhớ đệm của trình quản lý gói.

Khi chọn các hành động từ thị trường, hãy ưu tiên những hành động được GitHub hoặc các tổ chức nổi tiếng duy trì. Kiểm tra tài liệu của hành động, số liệu thống kê sử dụng và tần suất cập nhật. Các hành động phổ biến với bảo trì tích cực thường là những lựa chọn an toàn hơn so với những hành động ít người biết đến hoặc bị bỏ rơi.

## Phiên bản hành động để ổn định

Luôn chỉ định rõ ràng các phiên bản hành động thay vì sử dụng các nhánh mặc định. Các thẻ phiên bản như `@v4` đảm bảo quy trình công việc của bạn vẫn ổn định ngay cả khi người bảo trì hành động đưa ra các thay đổi đột phá. Thẻ phiên bản chính thường nhận được các bản sửa lỗi đồng thời tránh làm hỏng các thay đổi.

Đối với các quy trình làm việc nhạy cảm về bảo mật, hãy cân nhắc việc ghim các hành động vào các hàm băm commit cụ thể thay vì thẻ phiên bản. Điều này ngăn chặn các cuộc tấn công chuỗi cung ứng trong đó mã độc có thể được đưa vào thông qua các bản cập nhật hành động, mặc dù việc này yêu cầu bảo trì nhiều hơn để nhận được các bản sửa lỗi bảo mật.

Hiểu phiên bản hành động giúp bạn cân bằng sự ổn định với việc nhận bản cập nhật. Hầu hết các nhóm sử dụng thẻ phiên bản chính để thuận tiện cho việc sửa lỗi tự động đồng thời tránh chi phí bảo trì khi ghim commit.

## Biến môi trường và bối cảnh

GitHub cung cấp thông tin ngữ cảnh mở rộng thông qua các biến và biểu thức môi trường tích hợp sẵn. Ngữ cảnh này giúp quy trình làm việc đưa ra quyết định thông minh và cung cấp thông tin hữu ích trong nhật ký và thông báo.

Ngữ cảnh bao gồm các chi tiết về kho lưu trữ, sự kiện kích hoạt, người dùng đã khởi tạo nó và môi trường thực thi hiện tại. Bạn có thể sử dụng thông tin này để tùy chỉnh hành vi của quy trình làm việc, chẳng hạn như bật chế độ gỡ lỗi cho pull request hoặc chọn mục tiêu triển khai dựa trên tên nhánh.

Biến môi trường hoạt động ở nhiều phạm vi trong quy trình công việc. Các biến cấp độ quy trình công việc có sẵn cho tất cả các công việc, các biến cấp độ công việc có sẵn cho tất cả các bước trong công việc đó và các biến cấp độ bước chỉ có sẵn cho bước cụ thể đó. Phạm vi này giúp tổ chức cấu hình và ngăn ngừa xung đột giữa các biến.

## Xử lý lỗi và kiểm soát quy trình làm việc

Hiểu cách GitHub Actions xử lý lỗi là rất quan trọng để xây dựng quy trình làm việc đáng tin cậy. Theo mặc định, nếu bất kỳ bước nào trong công việc bị lỗi thì toàn bộ công việc sẽ dừng lại và được đánh dấu là không thành công. Hành vi không nhanh này ngăn cản luồng công việc tiếp tục với trạng thái không hợp lệ.

Từ khóa `continue-on-error` ở cấp độ bước cho phép tiến trình công việc tiếp tục ngay cả khi bước đó không thành công. Điều này hữu ích cho các bước như tải lên kết quả kiểm tra mà không làm dừng quy trình làm việc nếu chúng gặp sự cố. Tuy nhiên, hãy sử dụng điều này một cách cẩn thận để tránh che giấu những thất bại quan trọng.

Điều kiện cấp độ công việc sử dụng câu lệnh `if` cho phép bạn kiểm soát thời điểm công việc chạy dựa trên sự thành công hay thất bại của công việc trước đó. Điều này cho phép các mẫu như chạy công việc dọn dẹp ngay cả khi quá trình xây dựng không thành công hoặc gửi các thông báo khác nhau dựa trên kết quả của quy trình làm việc.

## Xây dựng quy trình làm việc trực quan

Khi làm việc với GitHub Actions, bạn sẽ phát triển các mô hình tư duy về các mẫu phổ biến. Quy trình làm việc CI điển hình tuân theo mô hình thanh toán, môi trường thiết lập, cài đặt các phần phụ thuộc, chạy thử nghiệm và xây dựng artifact. Quy trình triển khai thường tuân theo tải xuống artifact, triển khai vào môi trường và xác minh các mẫu triển khai.

Những mô hình này tồn tại vì chúng phản ánh quá trình phát triển phần mềm tự nhiên. Việc hiểu và làm theo các mẫu đã thiết lập giúp các nhà phát triển khác hiểu và duy trì quy trình làm việc của bạn dễ dàng hơn. Bạn không chỉ viết tự động hóa - bạn đang mã hóa các hoạt động phát triển của nhóm mình theo cách có thể duy trì được.

Cấu trúc phân cấp của quy trình làm việc, công việc và các bước phù hợp với cách bạn chia nhỏ các nhiệm vụ phức tạp một cách tự nhiên. Sự liên kết giữa cấu trúc của công cụ và suy nghĩ của con người làm cho GitHub Actions trở nên trực quan khi bạn nắm được các khái niệm cốt lõi.

Trong phần tiếp theo, chúng ta sẽ áp dụng các khái niệm này để xây dựng và thử nghiệm các ứng dụng thực, tập trung vào các quy trình công việc thực tế xử lý các phần phụ thuộc, bộ đệm và tối ưu hóa bản dựng cho các ngôn ngữ lập trình và khung khác nhau.
