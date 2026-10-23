---
title: "Ví dụ thực tế và các bước tiếp theo"
description: Khám phá cách triển khai CI/CD hoàn chỉnh cho các loại dự án khác nhau và tìm hiểu cách tiếp tục hành trình tự động hóa của bạn.
order: 10
---

Bạn đã tìm hiểu từng phần riêng lẻ của Hành động GitHub, nhưng việc xem chúng khớp với nhau như thế nào trong các dự án thực tế sẽ tạo ra sự khác biệt giữa việc hiểu các khái niệm và khả năng triển khai chúng một cách hiệu quả. CI/CD trong thế giới thực không chỉ là chạy thử nghiệm và triển khai - mà còn là tạo ra các hệ thống có thể xử lý sự phức tạp lộn xộn của quá trình phát triển phần mềm thực tế.

Các loại dự án khác nhau cần các phương pháp tự động hóa khác nhau. React frontend có các yêu cầu khác với API Python, ứng dụng di động hoặc kiến trúc vi dịch vụ đa dịch vụ. Việc hiểu các mẫu này giúp bạn áp dụng các khái niệm đã học vào tình huống cụ thể của mình.

Dưới đây là cách các loại dự án khác nhau thường cấu trúc CI/CD pipeline của chúng:

```
Single Application (React/Node.js):
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Push to main/develop → Trigger Workflow             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
        ┌─────────────────────────────────────────┐
        │            Parallel Quality             │
        │              ┌─────────────┐            │
        │              │    Lint     │            │
        │              └─────────────┘            │
        │              ┌─────────────┐            │
        │              │    Test     │            │
        │              └─────────────┘            │
        │              ┌─────────────┐            │
        │              │ Type Check  │            │
        │              └─────────────┘            │
        └─────────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │      Build      │
                    │   Application   │
                    └─────────────────┘
                               │
                               ▼
    ┌──────────────────────────────────────────────────────────┐
    │                    Deploy Pipeline                       │
    │                                                          │
    │  Dev Environment ──▶ Staging Environment ──▶ Production  │
    │  (auto on develop)   (auto on main)        (manual gate) │
    └──────────────────────────────────────────────────────────┘

Microservices/Monorepo:
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ services/api/  services/web/  services/mobile/      │    │
│  │ packages/shared/                                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │ Detect Changes  │
                    │ (path filtering)│
                    └─────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│ API Service │        │ Web Service │        │Mobile App   │
│             │        │             │        │             │
│ ┌─────────┐ │        │ ┌─────────┐ │        │ ┌─────────┐ │
│ │ Test    │ │        │ │ Test    │ │        │ │ Test    │ │
│ │ Build   │ │        │ │ Build   │ │        │ │ Build   │ │
│ │ Deploy  │ │        │ │ Deploy  │ │        │ │ Deploy  │ │
│ └─────────┘ │        │ └─────────┘ │        │ └─────────┘ │
└─────────────┘        └─────────────┘        └─────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │ Integration     │
                    │ Tests (E2E)     │
                    └─────────────────┘
```

## Ứng dụng React hoàn chỉnh pipeline

Hãy cùng xem xét một ứng dụng React đầy đủ tính năng với công cụ hiện đại, nhiều môi trường và các phương pháp thực hành sẵn sàng cho production:

```yaml
name: React Application CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  CACHE_VERSION: 'v1'

jobs:
  # Quality checks run in parallel for fast feedback
  quality-checks:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # Run multiple quality checks in parallel using step-level parallelism
      - name: Lint code
        run: npm run lint

      - name: Check TypeScript types
        run: npm run type-check

      - name: Check code formatting
        run: npm run format:check

      - name: Run unit tests
        run: npm test -- --coverage --watchAll=false
        env:
          CI: true

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info

  # Build application for different environments
  build:
    runs-on: ubuntu-latest
    needs: quality-checks

    strategy:
      matrix:
        environment: [development, staging, production]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for ${{ matrix.environment }}
        run: npm run build
        env:
          NODE_ENV: production
          REACT_APP_ENV: ${{ matrix.environment }}
          REACT_APP_API_URL: ${{ matrix.environment == 'production' && 'https://api.myapp.com' || matrix.environment == 'staging' && 'https://api.staging.myapp.com' || 'https://api.dev.myapp.com' }}
          REACT_APP_SENTRY_DSN: ${{ secrets[format('SENTRY_DSN_{0}', matrix.environment)] }}
          GENERATE_SOURCEMAP: ${{ matrix.environment != 'production' }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ matrix.environment }}
          path: build/
          retention-days: ${{ matrix.environment == 'production' && 30 || 7 }}

  # End-to-end tests using Playwright
  e2e-tests:
    runs-on: ubuntu-latest
    needs: [quality-checks, build]
    if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download development build
        uses: actions/download-artifact@v4
        with:
          name: build-development
          path: build/

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Start application server
        run: |
          npm install -g serve
          serve -s build -l 3000 &
          # Wait for server to start
          sleep 5

      - name: Run E2E tests
        run: npx playwright test
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  # Deploy to different environments based on branch
  deploy-development:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: development

    steps:
      - name: Download development build
        uses: actions/download-artifact@v4
        with:
          name: build-development
          path: build/

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './build'
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: 'Deploy from GitHub Actions'
          enable-pull-request-comment: false
          enable-commit-comment: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID_DEV }}

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build, e2e-tests]
    if: github.ref == 'refs/heads/main'
    environment: staging

    steps:
      - name: Download staging build
        uses: actions/download-artifact@v4
        with:
          name: build-staging
          path: build/

      - name: Deploy to staging
        run: |
          # Deploy to S3 and invalidate CloudFront
          aws s3 sync build/ s3://${{ secrets.S3_BUCKET_STAGING }}/ --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_STAGING }} --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: us-east-1

      - name: Run smoke tests on staging
        run: |
          # Wait for deployment to propagate
          sleep 30

          # Basic smoke tests
          curl --fail https://staging.myapp.com/
          curl --fail https://staging.myapp.com/health

  deploy-production:
    runs-on: ubuntu-latest
    needs: [build, deploy-staging]
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Download production build
        uses: actions/download-artifact@v4
        with:
          name: build-production
          path: build/

      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          aws s3 sync build/ s3://${{ secrets.S3_BUCKET_PRODUCTION }}/ --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_PRODUCTION }} --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: us-east-1

      - name: Run production smoke tests
        run: |
          sleep 30
          curl --fail https://myapp.com/
          curl --fail https://myapp.com/health

      - name: Send deployment notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed!'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

Ví dụ này minh họa một ứng dụng React hoàn chỉnh pipeline với các kiểm tra chất lượng, xây dựng nhiều môi trường, thử nghiệm từ đầu đến cuối và triển khai lũy tiến thông qua phát triển, môi trường staging và production.

## API Node.js với cơ sở dữ liệu pipeline

Đây là pipeline hoàn chỉnh cho API Node.js bao gồm di chuyển cơ sở dữ liệu và kiểm tra tích hợp:

```yaml
name: Node.js API CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testdb
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb

      - name: Run unit tests
        run: npm test
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb

      - name: Run integration tests
        run: npm run test:integration
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:${{ github.sha }}
            ghcr.io/${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            # Pull latest image
            docker pull ghcr.io/${{ github.repository }}:${{ github.sha }}

            # Run database migrations
            docker run --rm \
              --network app-network \
              -e DATABASE_URL=${{ secrets.DATABASE_URL }} \
              ghcr.io/${{ github.repository }}:${{ github.sha }} \
              npm run migrate

            # Update running container
            docker stop api-production || true
            docker rm api-production || true

            docker run -d \
              --name api-production \
              --network app-network \
              -p 3000:3000 \
              -e NODE_ENV=production \
              -e DATABASE_URL=${{ secrets.DATABASE_URL }} \
              -e JWT_SECRET=${{ secrets.JWT_SECRET }} \
              --restart unless-stopped \
              ghcr.io/${{ github.repository }}:${{ github.sha }}

            # Wait for health check
            sleep 10
            curl --fail http://localhost:3000/health || exit 1
```

## Monorepo với nhiều dịch vụ

Đối với các dự án phức tạp có nhiều dịch vụ, bạn cần phối hợp quy trình công việc phức tạp hơn:

```yaml
name: Monorepo CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Detect which services changed
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      api-changed: ${{ steps.changes.outputs.api }}
      web-changed: ${{ steps.changes.outputs.web }}
      mobile-changed: ${{ steps.changes.outputs.mobile }}
      shared-changed: ${{ steps.changes.outputs.shared }}

    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            api:
              - 'services/api/**'
              - 'packages/shared/**'
            web:
              - 'services/web/**'
              - 'packages/shared/**'
            mobile:
              - 'services/mobile/**'
              - 'packages/shared/**'
            shared:
              - 'packages/shared/**'

  # Test shared packages first since other services depend on them
  test-shared:
    runs-on: ubuntu-latest
    needs: detect-changes
    if: needs.detect-changes.outputs.shared-changed == 'true'

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test --workspace=packages/shared

  # Test and build API service
  test-api:
    runs-on: ubuntu-latest
    needs: [detect-changes, test-shared]
    if: always() && needs.detect-changes.outputs.api-changed == 'true' && (needs.test-shared.result == 'success' || needs.test-shared.result == 'skipped')

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test --workspace=services/api
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb

  # Test web service
  test-web:
    runs-on: ubuntu-latest
    needs: [detect-changes, test-shared]
    if: always() && needs.detect-changes.outputs.web-changed == 'true' && (needs.test-shared.result == 'success' || needs.test-shared.result == 'skipped')

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test --workspace=services/web
      - run: npm run build --workspace=services/web

  # Deploy services that changed and passed tests
  deploy:
    runs-on: ubuntu-latest
    needs: [detect-changes, test-api, test-web]
    if: always() && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy API service
        if: needs.detect-changes.outputs.api-changed == 'true' && needs.test-api.result == 'success'
        run: |
          echo "Deploying API service..."
          # API deployment commands

      - name: Deploy Web service
        if: needs.detect-changes.outputs.web-changed == 'true' && needs.test-web.result == 'success'
        run: |
          echo "Deploying Web service..."
          # Web deployment commands
```

## CI/CD ứng dụng di động có triển khai App Store

Ứng dụng di động có các yêu cầu riêng để xây dựng, ký và phân phối ứng dụng:

```yaml
name: React Native Mobile App

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linting
        run: npm run lint

  build-android:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '11'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Install dependencies
        run: npm ci

      - name: Build Android app
        run: |
          cd android
          ./gradlew assembleRelease
        env:
          MYAPP_UPLOAD_STORE_FILE: ${{ secrets.ANDROID_KEYSTORE_FILE }}
          MYAPP_UPLOAD_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          MYAPP_UPLOAD_STORE_PASSWORD: ${{ secrets.ANDROID_STORE_PASSWORD }}
          MYAPP_UPLOAD_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: android/app/build/outputs/apk/release/

  build-ios:
    runs-on: macos-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install iOS dependencies
        run: |
          cd ios
          pod install

      - name: Build iOS app
        run: |
          cd ios
          xcodebuild -workspace MyApp.xcworkspace \
            -scheme MyApp \
            -configuration Release \
            -destination generic/platform=iOS \
            -archivePath MyApp.xcarchive \
            archive

      - name: Export IPA
        run: |
          cd ios
          xcodebuild -exportArchive \
            -archivePath MyApp.xcarchive \
            -exportOptionsPlist ExportOptions.plist \
            -exportPath build

      - name: Upload IPA
        uses: actions/upload-artifact@v4
        with:
          name: ios-ipa
          path: ios/build/*.ipa
```

## Mở rộng kiến thức CI/CD của bạn

Bây giờ bạn đã hiểu các nguyên tắc cơ bản và đã xem các ví dụ thực tế, đây là các lĩnh vực cần khám phá tiếp theo:

### Cơ sở hạ tầng dưới dạng tích hợp mã

Kết hợp Tác vụ GitHub với các công cụ quản lý cơ sở hạ tầng:

```yaml
name: Infrastructure and Application Deployment

jobs:
  provision-infrastructure:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.5.0

      - name: Terraform Init
        run: terraform init

      - name: Terraform Plan
        run: terraform plan -out=tfplan

      - name: Terraform Apply
        run: terraform apply tfplan

      - name: Output infrastructure details
        run: terraform output -json > infrastructure.json

      - name: Upload infrastructure details
        uses: actions/upload-artifact@v4
        with:
          name: infrastructure-config
          path: infrastructure.json

  deploy-application:
    needs: provision-infrastructure
    runs-on: ubuntu-latest
    steps:
      - name: Download infrastructure config
        uses: actions/download-artifact@v4
        with:
          name: infrastructure-config

      - name: Deploy to provisioned infrastructure
        run: |
          # Use infrastructure.json to get deployment targets
          # Deploy application using the provisioned resources
```

### Chiến lược thử nghiệm nâng cao

Thực hiện các phương pháp thử nghiệm phức tạp:

- **Thử nghiệm hợp đồng**: Đảm bảo khả năng tương thích API giữa các dịch vụ
- **Kiểm tra hiệu suất**: Kiểm tra tải tự động trong CI/CD
- **Kiểm tra bảo mật**: Quét SAST, DAST và phụ thuộc
- **Kiểm tra khả năng truy cập**: Kiểm tra tự động a11y cho các ứng dụng web

### Tích hợp giám sát và quan sát

Kết nối CI/CD pipeline của bạn với các hệ thống giám sát:

```yaml
- name: Create deployment marker
  run: |
    curl -X POST "https://api.datadog.com/api/v1/events" \
      -H "DD-API-KEY: ${{ secrets.DATADOG_API_KEY }}" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Deployment",
        "text": "Deployed version ${{ github.sha }} to production",
        "tags": ["deployment", "production", "github-actions"]
      }'
```

### GitOps và tự động hóa triển khai

Khám phá các mẫu GitOps nơi cấu hình triển khai và cơ sở hạ tầng được quản lý thông qua Git:

- **ArgoCD**: GitOps gốc Kubernetes
- **Flux**: Bộ công cụ CNCF GitOps
- Môi trường **GitHub**: Theo dõi và bảo vệ triển khai nâng cao

### Mô hình doanh nghiệp

Đối với các tổ chức lớn hơn, hãy xem xét:

- **Người chạy tự lưu trữ**: Cơ sở hạ tầng người chạy tùy chỉnh cho khối lượng công việc nhạy cảm
- **Chính sách tổ chức**: Chuẩn hóa quy trình làm việc trên các kho lưu trữ
- **Quản lý chi phí**: Giám sát và tối ưu hóa việc sử dụng tài nguyên CI/CD
- **Tích hợp tuân thủ**: SOC2, ISO27001 và các khung tuân thủ khác

## Những cạm bẫy thường gặp và cách tránh chúng

Khi bạn xây dựng các hệ thống CI/CD phức tạp hơn, hãy chú ý đến những vấn đề phổ biến sau:

### Kỹ thuật quá sớm

Bắt đầu đơn giản và tăng dần độ phức tạp. Một quy trình làm việc cơ bản hoạt động tốt sẽ tốt hơn một quy trình làm việc phức tạp không đáng tin cậy.

### Bỏ qua bảo mật ngay từ đầu

Bảo mật phải được tích hợp ngay từ đầu, không được thêm vào sau này. Hãy thường xuyên xem lại các biện pháp bảo mật ở phần trước.

### Quản lý bí mật kém

Không bao giờ mã hóa bí mật, ngay cả trong kho riêng tư. Sử dụng Bí mật GitHub một cách thích hợp và luân chuyển chúng thường xuyên.

### Kiểm tra không ổn định

Các bài kiểm tra không đáng tin cậy còn tệ hơn là không có bài kiểm tra nào. Đầu tư thời gian vào việc thực hiện các bài kiểm tra mang tính xác định và khắc phục các lỗi không liên tục.

### Vòng phản hồi chậm

Tối ưu hóa để phản hồi nhanh. Các nhà phát triển sẽ biết trong vòng vài phút nếu những thay đổi của họ làm hỏng điều gì đó.

### Thiếu giám sát

Giám sát chính hệ thống CI/CD của bạn. Theo dõi thời gian xây dựng, tỷ lệ thất bại và việc sử dụng tài nguyên để xác định các cơ hội cải tiến.

## Xây dựng kế hoạch học tập

Để tiếp tục cải thiện kỹ năng CI/CD của bạn:

1. **Thực hành với các dự án cá nhân**: Áp dụng những khái niệm này cho các dự án của riêng bạn, ngay cả những dự án đơn giản
2. **Đọc nội dung ngành**: Theo dõi blog DevOps, các buổi tọa đàm hội nghị và nghiên cứu điển hình
3. **EThử nghiệm với Công cụ**: Hãy thử các nền tảng và công cụ CI/CD khác nhau để hiểu điểm mạnh của chúng
4. **Tham gia cộng đồng**: Tham gia vào cộng đồng DevOps và GitHub Actions
5. **Đóng góp cho mã nguồn mở**: Nhiều dự án nguồn mở có CI/CD phức tạp mà bạn có thể học hỏi từ đó

## Cuộc hành trình tiếp tục

CI/CD không phải là đích đến mà là một hành trình cải tiến liên tục. Các nguyên tắc cơ bản bạn đã học ở đây - tự động hóa, thử nghiệm, bảo mật, giám sát - đều có thể áp dụng bất kể bạn sử dụng công cụ cụ thể nào. Công nghệ thay đổi nhưng các nguyên tắc cung cấp phần mềm đáng tin cậy vẫn không đổi.

Bắt đầu với sự tự động hóa đơn giản và dần dần tăng thêm độ phức tạp khi nhu cầu của bạn tăng lên và sự tự tin của bạn tăng lên. Tập trung vào việc giải quyết các vấn đề thực tế hơn là thực hiện các giải pháp phức tạp vì lợi ích riêng của họ. Quan trọng nhất, hãy nhớ rằng CI/CD tồn tại để giúp các nhóm cung cấp phần mềm tốt hơn nhanh hơn - hãy ghi nhớ mục tiêu đó khi bạn thiết kế và cải thiện quá trình tự động hóa của mình.

Khoản đầu tư bạn thực hiện vào việc học CI/CD sẽ mang lại lợi ích trong suốt sự nghiệp của bạn. Những kỹ năng này có giá trị trong các ngành, công nghệ và quy mô nhóm. Cho dù bạn đang làm việc trong một dự án riêng lẻ hay quản lý hoạt động triển khai pipeline cho một tổ chức lớn, việc hiểu cách tự động hóa phân phối phần mềm một cách hiệu quả sẽ giúp bạn trở thành nhà phát triển và thành viên nhóm có giá trị hơn.

Tiếp tục thử nghiệm, tiếp tục học hỏi và tiếp tục cải thiện khả năng tự động hóa của bạn. Hành trình từ triển khai thủ công đến hệ thống CI/CD phức tạp rất bổ ích và các kỹ năng bạn phát triển sẽ phục vụ tốt cho bạn trong suốt sự nghiệp phát triển phần mềm.
