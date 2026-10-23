---
title: "Quản lý bí mật và biến môi trường"
description: Tìm hiểu cách quản lý cấu hình và dữ liệu nhạy cảm một cách an toàn trong quy trình làm việc của GitHub Actions bằng cách sử dụng các biến môi trường, bí mật và các phương pháp hay nhất.
order: 5
---

Mọi nhà phát triển đều vô tình tạo cho đã commit một khóa API hoặc mật khẩu cơ sở dữ liệu để kiểm soát phiên bản tại một thời điểm nào đó. Đó là một trong những sai lầm khiến bạn đau bụng khi nhận ra điều gì đã xảy ra - đặc biệt nếu đó là mật khẩu cơ sở dữ liệu production hoặc khóa AWS có quyền truy cập thanh toán. Nỗi sợ hãi khi cố gắng tìm ra ai có thể đã nhìn thấy nó, thay đổi thông tin xác thực và hy vọng không có thiệt hại nào xảy ra là điều bạn không bao giờ muốn trải qua nữa.

Quy trình làm việc của GitHub Actions cần quyền truy cập vào thông tin nhạy cảm như thông tin xác thực triển khai, khóa API và mật khẩu cơ sở dữ liệu, nhưng họ cũng cần bảo mật thông tin này. Hiểu cách xử lý cấu hình và bí mật đúng cách sẽ bảo vệ ứng dụng, cơ sở hạ tầng và người dùng của bạn trong khi vẫn duy trì tính linh hoạt để triển khai trên các môi trường khác nhau.

## Phổ bảo mật cấu hình

Không phải cấu hình nào cũng nhạy cảm như nhau và việc hiểu được những khác biệt này sẽ giúp bạn chọn cơ chế lưu trữ phù hợp. Cấu hình công khai như phiên bản Node.js, cờ xây dựng hoặc URL tài liệu có thể được lưu trữ dưới dạng biến môi trường đơn giản. Cấu hình bán riêng tư như điểm cuối API nội bộ hoặc tên cơ sở dữ liệu có thể tiết lộ chi tiết kiến trúc nhưng sẽ không gây ra vi phạm bảo mật. Thông tin thực sự nhạy cảm như mật khẩu, khóa API và chứng chỉ phải được lưu trữ dưới dạng bí mật được mã hóa.

GitHub Actions cung cấp các cơ chế khác nhau cho từng mức độ nhạy cảm. Các biến môi trường xử lý cấu hình công khai và bán riêng tư mà bạn không ngại xuất hiện trong nhật ký. GitHub Secrets mã hóa thông tin nhạy cảm và che giấu thông tin đó trong nhật ký, ngăn ngừa việc vô tình bị lộ.

Nguyên tắc chính là các bí mật sẽ không bao giờ xuất hiện trong các tệp quy trình công việc của bạn, ngay cả khi kho lưu trữ của bạn ở chế độ riêng tư. Các tệp quy trình công việc thường được chia sẻ, sao chép sang các kho lưu trữ khác hoặc được đưa vào tài liệu, tạo cơ hội cho việc vô tình bị lộ.

## Sử dụng biến môi trường hiệu quả

Các biến môi trường trong Hành động GitHub hoạt động ở nhiều cấp độ - quy trình công việc, công việc và bước - với các biến cấp độ bước được ưu tiên hơn cấp độ công việc, được ưu tiên hơn cấp độ quy trình làm việc. Hiểu được hệ thống phân cấp này giúp bạn tổ chức cấu hình một cách hợp lý.

Đây là một ví dụ thực tế về quản lý biến môi trường:

```yaml
name: Multi-Environment Deployment

# Workflow-level variables available to all jobs
env:
  NODE_VERSION: '18'
  BUILD_ENVIRONMENT: 'development'

on:
  push:
    branches: [main, develop]
  workflow_dispatch:
    inputs:
      target_environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]

jobs:
  build:
    runs-on: ubuntu-latest

    # Job-level variables can override workflow-level ones
    env:
      BUILD_ENVIRONMENT: ${{ github.ref == 'refs/heads/main' && 'production' || 'development' }}
      API_BASE_URL: ${{ github.ref == 'refs/heads/main' && 'https://api.example.com' || 'https://api.staging.example.com' }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Show build configuration
        run: |
          echo "Node Version: $NODE_VERSION"
          echo "Build Environment: $BUILD_ENVIRONMENT"
          echo "API Base URL: $API_BASE_URL"
          echo "Git Branch: ${{ github.ref_name }}"

      - name: Install dependencies
        run: npm ci

      # Step-level variables have highest precedence
      - name: Build application
        env:
          NODE_ENV: production
          BUILD_ID: ${{ github.run_number }}
          COMMIT_SHA: ${{ github.sha }}
        run: |
          echo "Building with environment: $NODE_ENV"
          echo "Build ID: $BUILD_ID"
          echo "Commit: $COMMIT_SHA"

          # Create build-time configuration
          cat > src/config.js << EOF
          export const config = {
            environment: '$BUILD_ENVIRONMENT',
            apiBaseUrl: '$API_BASE_URL',
            buildId: '$BUILD_ID',
            commitSha: '$COMMIT_SHA'
          };
          EOF

          npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ env.BUILD_ENVIRONMENT }}
          path: dist/
```

Ví dụ này cho thấy cách các biến môi trường có thể được tính toán linh hoạt dựa trên tên nhánh, thông tin đầu vào của người dùng và thông tin ngữ cảnh khác. Cấu hình trở thành một phần của ứng dụng được xây dựng, cho phép hoạt động theo môi trường cụ thể mà không cần mã hóa giá trị.

## Quản lý bí mật được thực hiện đúng

Bí mật GitHub cung cấp bộ lưu trữ được mã hóa cho thông tin nhạy cảm. Bí mật được mã hóa ở trạng thái lưu trữ và chỉ được giải mã khi được truy cập bởi quy trình công việc được ủy quyền. Chúng tự động được ẩn trong nhật ký, vì vậy ngay cả khi bạn vô tình cố in chúng, chúng vẫn xuất hiện dưới dạng `***` thay vì giá trị thực.

Dưới đây là cách sử dụng bí mật đúng cách trong quy trình triển khai:

```yaml
name: Secure Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production # Use environment protection

    steps:
      - uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: production-build
          path: dist/

      - name: Deploy to AWS
        env:
          # Access secrets through the secrets context
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          # Combine secrets with public configuration
          AWS_REGION: us-east-1
          S3_BUCKET: my-app-production
        run: |
          echo "Deploying to AWS S3..."
          echo "Region: $AWS_REGION"
          echo "Bucket: $S3_BUCKET"

          # Configure AWS CLI with credentials
          aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
          aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
          aws configure set region "$AWS_REGION"

          # Sync files to S3
          aws s3 sync dist/ s3://$S3_BUCKET/ --delete

          # Invalidate CloudFront cache
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

      - name: Update database
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          echo "Running database migrations..."
          # Use the database connection securely
          # Never echo the DATABASE_URL directly
          echo "Database connection configured"

          # Run migrations (example)
          # npx prisma migrate deploy

      - name: Send deployment notification
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ Production deployment completed for commit ${{ github.sha }}\"}"
```

Lưu ý cách các bí mật được truy cập thông qua `${{ secrets.SECRET_NAME }}` và được kết hợp với cấu hình công khai. Quy trình làm việc không bao giờ lặp lại trực tiếp các giá trị bí mật và tất cả các hoạt động nhạy cảm đều được chứa trong các bước cần đến chúng.

## Cổng phê duyệt và bảo vệ môi trường

Môi trường GitHub cung cấp một lớp bảo mật bổ sung cho các hoạt động triển khai nhạy cảm. Bạn có thể định cấu hình môi trường để yêu cầu phê duyệt thủ công, hạn chế triển khai ở các nhánh cụ thể hoặc thêm thời gian trễ trước khi tiến hành triển khai.

```yaml
# This job uses environment protection
deploy-production:
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://myapp.com

  steps:
    - name: Deploy to production
      run: echo "Deploying to production..."
```

Để thiết lập bảo vệ môi trường:

1. Chuyển đến Cài đặt kho lưu trữ của bạn → Môi trường
2. Tạo môi trường "production"
3. Thêm người đánh giá cần thiết, những người phải phê duyệt việc triển khai
4. Hạn chế triển khai ở các nhánh cụ thể (như `main`)
5. Thêm các bí mật chỉ có sẵn cho môi trường này

Điều này đảm bảo rằng việc triển khai production không thể xảy ra một cách vô tình và cung cấp dấu vết kiểm tra xem ai đã phê duyệt những hoạt động triển khai nào.

## Cấu hình động dựa trên ngữ cảnh

Đôi khi bạn cần tính toán các giá trị cấu hình dựa trên bối cảnh quy trình làm việc, thông tin Git hoặc các điều kiện bên ngoài. Đây là cách tạo cấu hình động:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Determine deployment configuration
        run: |
          # Set environment based on branch
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            echo "DEPLOY_ENV=production" >> $GITHUB_ENV
            echo "API_URL=https://api.example.com" >> $GITHUB_ENV
            echo "DEBUG_MODE=false" >> $GITHUB_ENV
          elif [ "${{ github.ref }}" = "refs/heads/develop" ]; then
            echo "DEPLOY_ENV=staging" >> $GITHUB_ENV
            echo "API_URL=https://api.staging.example.com" >> $GITHUB_ENV
            echo "DEBUG_MODE=true" >> $GITHUB_ENV
          else
            echo "DEPLOY_ENV=review" >> $GITHUB_ENV
            echo "API_URL=https://api.review.example.com" >> $GITHUB_ENV
            echo "DEBUG_MODE=true" >> $GITHUB_ENV
          fi

          # Create unique deployment identifier
          echo "DEPLOY_ID=${{ github.run_number }}-$(date +%s)" >> $GITHUB_ENV

          # Set feature flags based on environment
          if [ "$DEPLOY_ENV" = "production" ]; then
            echo "FEATURE_NEW_UI=true" >> $GITHUB_ENV
            echo "FEATURE_BETA_API=false" >> $GITHUB_ENV
          else
            echo "FEATURE_NEW_UI=true" >> $GITHUB_ENV
            echo "FEATURE_BETA_API=true" >> $GITHUB_ENV
          fi

      - name: Show computed configuration
        run: |
          echo "Deploy Environment: $DEPLOY_ENV"
          echo "API URL: $API_URL"
          echo "Debug Mode: $DEBUG_MODE"
          echo "Deploy ID: $DEPLOY_ID"
          echo "Feature Flags: NEW_UI=$FEATURE_NEW_UI, BETA_API=$FEATURE_BETA_API"

      - name: Deploy with computed configuration
        run: |
          # Use the dynamically computed values
          echo "Deploying to $DEPLOY_ENV environment..."
          # Your deployment commands would use these environment variables
```

Tệp `GITHUB_ENV` cho phép bạn tạo các biến môi trường trong quá trình thực hiện quy trình công việc mà các bước tiếp theo có thể sử dụng. Điều này cho phép logic cấu hình phức tạp trong khi vẫn giữ các giá trị có sẵn trong suốt quy trình làm việc.

## Xác thực cấu hình

Lỗi cấu hình là nguyên nhân phổ biến gây ra lỗi triển khai. Thêm các bước xác thực để sớm phát hiện sự cố:

```yaml
- name: Validate required configuration
  run: |
    # Check required environment variables
    REQUIRED_VARS="NODE_VERSION API_URL DEPLOY_ENV"
    MISSING_VARS=""

    for var in $REQUIRED_VARS; do
      if [ -z "${!var}" ]; then
        echo "❌ Missing required variable: $var"
        MISSING_VARS="$MISSING_VARS $var"
      else
        echo "✅ $var is configured"
      fi
    done

    if [ -n "$MISSING_VARS" ]; then
      echo "Missing required variables:$MISSING_VARS"
      exit 1
    fi

    # Validate configuration values
    if [[ ! "$API_URL" =~ ^https:// ]]; then
      echo "❌ API_URL must start with https://"
      exit 1
    fi

    if [[ ! "$DEPLOY_ENV" =~ ^(production|staging|development)$ ]]; then
      echo "❌ DEPLOY_ENV must be production, staging, or development"
      exit 1
    fi

    echo "✅ All configuration validation passed"
```

## Thực tiễn tốt nhất về bảo mật

Dưới đây là các phương pháp cần thiết để giữ an toàn cho bí mật của bạn:

**Không bao giờ đăng nhập bí mật**:

```yaml
# Bad - never do this
- name: Debug deployment
  run: echo "Database password is ${{ secrets.DB_PASSWORD }}"

# Good - secrets are automatically masked but don't risk it
- name: Debug deployment
  run: echo "Database connection configured: ✅"
```

**Sử dụng các bí mật dành riêng cho môi trường**:

```yaml
# Instead of one DATABASE_URL secret, use environment-specific ones
DATABASE_URL: ${{ secrets.DATABASE_URL_STAGING }}
# Or
DATABASE_URL: ${{ secrets[format('DATABASE_URL_{0}', env.DEPLOY_ENV)] }}
```

**Xoay vòng bí mật thường xuyên**:

```yaml
# Add secret rotation reminders
- name: Check secret age
  run: |
    echo "⚠️ Remember to rotate secrets regularly"
    echo "Last deployment: $(date)"
    echo "Consider rotating AWS keys, database passwords, and API tokens"
```

**Giới hạn phạm vi bí mật**:
Sử dụng Môi trường GitHub để hạn chế quy trình công việc nào có thể truy cập bí mật nào. Bí mật production chỉ có sẵn cho quy trình triển khai production.

## Khắc phục sự cố về cấu hình

Khi cấu hình không hoạt động như mong đợi, dưới đây là cách chẩn đoán sự cố:

```yaml
- name: Debug configuration (safe values only)
  run: |
    echo "=== Environment Variables ==="
    env | grep -E '^(NODE_|API_|DEPLOY_|GITHUB_)' | sort

    echo "=== GitHub Context ==="
    echo "Repository: ${{ github.repository }}"
    echo "Branch: ${{ github.ref_name }}"
    echo "Event: ${{ github.event_name }}"
    echo "Actor: ${{ github.actor }}"

    echo "=== Computed Values ==="
    echo "Build Environment: $BUILD_ENVIRONMENT"
    echo "Deploy Environment: $DEPLOY_ENV"

    # Check file system for configuration files
    echo "=== Configuration Files ==="
    if [ -f "src/config.js" ]; then
      echo "Config file exists:"
      cat src/config.js
    else
      echo "No config file found"
    fi
```

**Các vấn đề thường gặp và giải pháp**:

- **Variable not set**: Kiểm tra phạm vi (quy trình công việc/công việc/cấp độ bước) và chính tả
- **Quyền truy cập bí mật bị từ chối**: Xác minh bí mật tồn tại và quy trình làm việc có quyền truy cập vào nó
- **ECấu hình dành riêng cho môi trường không hoạt động**: Kiểm tra tên và điều kiện nhánh trong logic của bạn
- **Các giá trị được che trong nhật ký**: Điều này là bình thường đối với các bí mật - chúng đang hoạt động bình thường

Hiểu cấu hình và quản lý bí mật là rất quan trọng để xây dựng quy trình làm việc linh hoạt, an toàn, hoạt động trên các môi trường khác nhau. Trong phần tiếp theo, chúng ta sẽ khám phá các chiến lược triển khai và quản lý môi trường, chỉ ra cách phân phối ứng dụng của bạn một cách an toàn bằng cách sử dụng các kỹ thuật cấu hình mà bạn đã học.
