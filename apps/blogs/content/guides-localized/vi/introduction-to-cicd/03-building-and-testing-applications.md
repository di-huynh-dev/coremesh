---
title: "Xây dựng và thử nghiệm ứng dụng"
description: Tìm hiểu cách tạo tự động hóa xây dựng và thử nghiệm mạnh mẽ cho các ngôn ngữ và khung lập trình khác nhau bằng cách sử dụng Tác vụ GitHub.
order: 3
---

Không có gì giết chết năng suất của nhà phát triển như các bản dựng bị hỏng và các bài kiểm tra không ổn định. Bạn có thể đã trải qua cảm giác thất vọng về mã được xây dựng hoàn hảo trên máy của mình nhưng lại thất bại một cách bí ẩn trong production hoặc các thử nghiệm vượt qua cục bộ nhưng lại thất bại trong CI mà không có lý do rõ ràng. Những vấn đề này xuất phát từ sự khác biệt giữa môi trường phát triển và xây dựng - các phiên bản Node.js khác nhau, thiếu biến môi trường hoặc các phần phụ thuộc được lưu trong bộ nhớ đệm che giấu các vấn đề thực sự.

GitHub Actions giải quyết những vấn đề này bằng cách cung cấp môi trường sạch sẽ, nhất quán cho mọi bản dựng. Khi quy trình xây dựng của bạn hoạt động giống hệt nhau dù chạy cục bộ hay trong CI, bạn sẽ loại bỏ được vấn đề "hoạt động trên máy của tôi" và xây dựng sự tự tin trong quy trình triển khai của mình.

## Tại sao xây dựng vấn đề nhất quán

Nguyên tắc cơ bản của CI/CD đáng tin cậy là quy trình xây dựng của bạn phải giống hệt nhau ở mọi nơi nó chạy. Điều này có nghĩa là các phần phụ thuộc giống nhau, các biến môi trường giống nhau, các phiên bản công cụ giống nhau và các bước xây dựng giống nhau cho dù bạn đang xây dựng trên máy tính xách tay, trong CI hay trên máy của đồng nghiệp.

Hầu hết các vấn đề về xây dựng đều xuất phát từ sự khác biệt về môi trường. Môi trường phát triển cục bộ của bạn tích lũy các thay đổi theo thời gian - gói chung, tệp cấu hình, biến môi trường - khiến các bản dựng hoạt động cục bộ nhưng không hoạt động ở nơi khác. Môi trường CI sạch sẽ bộc lộ những phần phụ thuộc ẩn này và buộc bạn phải làm cho quy trình xây dựng của mình thực sự có thể tái tạo được.

Khi các bản dựng của bạn nhất quán, bạn sẽ có được sự tự tin rằng những gì vượt qua CI sẽ hoạt động trong production. Sự tự tin này cho phép thực hiện các hoạt động như triển khai tự động và giảm bớt lo lắng khi phát hành.

## Thiết lập bản dựng Node.js đúng cách

Hãy xây dựng một quy trình làm việc Node.js vững chắc thể hiện các phương pháp xây dựng tốt nhất. Quy trình công việc này xử lý việc quản lý phụ thuộc, bộ nhớ đệm, thử nghiệm và xây dựng quá trình tạo artifact theo cách vừa nhanh chóng vừa đáng tin cậy.

```yaml
name: Node.js Application Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Get the code
        uses: actions/checkout@v4

      # Set up Node.js with automatic npm caching
      # The cache speeds up builds by avoiding repeated downloads
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      # Use npm ci instead of npm install for CI environments
      # npm ci is faster and more reliable for automated builds
      - name: Install dependencies
        run: npm ci

      # Run linting before tests to catch style issues early
      - name: Check code style
        run: npm run lint

      # Run tests with coverage reporting
      - name: Run tests
        run: npm test -- --coverage --watchAll=false
        env:
          CI: true

      # Upload coverage results to track code quality over time
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # Build the application for production
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      # Store the build output for deployment jobs
      - name: Save build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist/
          retention-days: 30
```

Quy trình công việc này tách việc kiểm tra và xây dựng thành các công việc khác nhau có thể chạy song song cho đến khi bản dựng cần có kết quả kiểm tra. Các chi tiết chính làm cho nó đáng tin cậy:

- Sử dụng `npm ci` thay vì `npm install` đảm bảo cài đặt phụ thuộc rõ ràng, có thể lặp lại
- Tùy chọn `cache: 'npm'` trong nút thiết lập tăng tốc các bản dựng bằng cách lưu vào bộ đệm các gói đã tải xuống
- Đặt `NODE_ENV=production` cho các bản dựng đảm bảo áp dụng tối ưu hóa production
- Tải lên artifact duy trì kết quả đầu ra của bản dựng cho các công việc triển khai

## Kiểm tra nhiều phiên bản Node.js

Các ứng dụng thực cần hoạt động trên các phiên bản Node.js khác nhau mà người dùng của bạn có thể có. Bản dựng ma trận cho phép bạn kiểm tra nhiều phiên bản một cách hiệu quả:

```yaml
test:
  runs-on: ubuntu-latest

  # Test against multiple Node.js versions
  strategy:
    matrix:
      node-version: [16, 18, 20]

  steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test
```

Chiến lược ma trận tạo ra các công việc riêng biệt cho từng phiên bản Node.js, chạy chúng song song. Điều này giúp phát hiện sớm các vấn đề về khả năng tương thích trong khi vẫn đảm bảo thời gian xây dựng hợp lý.

## Các mẫu xây dựng Python

Các dự án Python có yêu cầu xây dựng riêng nhưng nguyên tắc vẫn giữ nguyên. Sau đây là quy trình làm việc xử lý môi trường ảo, bộ nhớ đệm phụ thuộc và kiểm tra:

```yaml
name: Python Application

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        python-version: ['3.9', '3.10', '3.11']

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python ${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run linting
        run: |
          flake8 src tests
          black --check src tests

      - name: Run tests
        run: |
          pytest tests/ --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

Quy trình làm việc của Python tuân theo các mẫu tương tự - thiết lập môi trường ngôn ngữ, cài đặt các phần phụ thuộc bằng bộ nhớ đệm, chạy kiểm tra chất lượng và thực hiện kiểm tra. Tùy chọn `cache: 'pip'` tăng tốc độ xây dựng bằng cách lưu vào bộ đệm các gói đã tải xuống.

## Bản dựng dựa trên Docker

Một số ứng dụng cần Docker container cho quá trình xây dựng của chúng. GitHub Actions có thể xây dựng và kiểm tra Docker image một cách hiệu quả:

```yaml
name: Docker Build

on: [push, pull_request]

jobs:
  docker:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # Build the Docker image
      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .

      # Test the built image
      - name: Test Docker image
        run: |
          docker run --rm myapp:${{ github.sha }} npm test

      # Save the image for deployment (optional)
      - name: Save Docker image
        run: |
          docker save myapp:${{ github.sha }} | gzip > myapp.tar.gz

      - name: Upload Docker image
        uses: actions/upload-artifact@v4
        with:
          name: docker-image
          path: myapp.tar.gz
```

Quy trình công việc này xây dựng Docker image, chạy thử nghiệm bên trong container để xác minh rằng nó hoạt động chính xác và tùy chọn lưu image dưới dạng artifact để triển khai.

## Xử lý lỗi kiểm thử một cách khéo léo

Các thử nghiệm đôi khi sẽ thất bại và quy trình làm việc của bạn sẽ xử lý các lỗi theo cách cung cấp thông tin hữu ích mà không khiến các nhà phát triển choáng ngợp. Đây là cách làm cho việc kiểm tra thất bại trở nên hữu ích:

```yaml
- name: Run tests with detailed output
  run: |
    npm test -- --verbose --reporter=json --outputFile=test-results.json
  continue-on-error: true
  id: tests

- name: Upload test results
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-results
    path: test-results.json

- name: Comment on PR with test results
  if: failure() && github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '❌ Tests failed. Check the Actions tab for details.'
      })
```

`continue-on-error: true` cho phép quy trình làm việc tiếp tục ngay cả khi kiểm tra thất bại, trong khi `if: always()` đảm bảo kết quả kiểm tra được tải lên bất kể kết quả kiểm tra như thế nào. Nhận xét PR có điều kiện sẽ thông báo cho nhà phát triển về lỗi mà không gửi spam các bản dựng thành công.

## Tối ưu hóa hiệu suất xây dựng

Quá trình xây dựng chậm khiến các nhà phát triển nản lòng và lãng phí tài nguyên CI. Dưới đây là những tối ưu hóa thực tế tạo nên sự khác biệt thực sự:

**Cache phụ thuộc mạnh mẽ**:

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Chạy công việc trong Parallel**:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]

  test:
    runs-on: ubuntu-latest
    steps: [...]

  build:
    runs-on: ubuntu-latest
    needs: [lint, test] # Only build if both pass
    steps: [...]
```

**Bỏ qua công việc không cần thiết**:

```yaml
on:
  push:
    paths-ignore:
      - 'docs/**'
      - '**.md'
  pull_request:
    paths:
      - 'src/**'
      - 'package.json'
```

## Gỡ lỗi lỗi xây dựng

Khi quá trình xây dựng bị lỗi, bạn cần chẩn đoán vấn đề một cách nhanh chóng. Thêm thông tin gỡ lỗi vào quy trình làm việc của bạn:

```yaml
- name: Debug environment
  if: failure()
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Working directory: $(pwd)"
    echo "Directory contents:"
    ls -la
    echo "Environment variables:"
    env | sort
```

Điều kiện `if: failure()` đảm bảo thông tin gỡ lỗi chỉ xuất hiện khi có sự cố, giữ sạch nhật ký xây dựng thành công đồng thời cung cấp thông tin chi tiết để khắc phục sự cố.

## Cân nhắc xây dựng trong thế giới thực

Các bản dựng production thường cần các bước bổ sung ngoài việc biên dịch cơ bản:

**ECấu hình dành riêng cho môi trường**:

```yaml
- name: Build for production
  run: npm run build
  env:
    NODE_ENV: production
    API_URL: https://api.production.com
    FEATURE_FLAGS: '{"newFeature": true}'
```

**ATối ưu hóa tài sản**:

```yaml
- name: Optimize assets
  run: |
    npm run build
    npm run optimize-images
    npm run compress-assets
```

Xác thực **Build**:

```yaml
- name: Validate build output
  run: |
    if [ ! -f "dist/index.html" ]; then
      echo "Build failed: missing index.html"
      exit 1
    fi

    # Check bundle size
    BUNDLE_SIZE=$(stat -c%s dist/main.*.js)
    if [ $BUNDLE_SIZE -gt 1048576 ]; then
      echo "Warning: Bundle size exceeds 1MB"
    fi
```

## Những cân nhắc cụ thể về ngôn ngữ

Các ngôn ngữ lập trình khác nhau có yêu cầu xây dựng khác nhau nhưng các mẫu vẫn nhất quán:

- **Java**: Sử dụng `actions/setup-java` với bộ đệm ẩn Maven hoặc Gradle
- **Go**: Sử dụng `actions/setup-go` với bộ nhớ đệm mô-đun qua `go mod download`
- **Ruby**: Sử dụng `actions/setup-ruby` với bộ nhớ đệm Bundler
- **PHP**: Sử dụng `shivammathur/setup-php` với bộ nhớ đệm của Trình soạn thảo

Điều quan trọng là hiểu trình quản lý gói và hệ thống phân giải phần phụ thuộc trong ngôn ngữ của bạn, sau đó định cấu hình Tác vụ GitHub để lưu vào bộ đệm phù hợp và cài đặt các phần phụ thuộc một cách đáng tin cậy.

Trong phần tiếp theo, chúng ta sẽ khám phá cách xử lý bản dựng artifact và các phần phụ thuộc một cách hiệu quả, bao gồm chia sẻ dữ liệu giữa các công việc và tối ưu hóa hiệu suất quy trình làm việc thông qua các chiến lược bộ nhớ đệm thông minh.
