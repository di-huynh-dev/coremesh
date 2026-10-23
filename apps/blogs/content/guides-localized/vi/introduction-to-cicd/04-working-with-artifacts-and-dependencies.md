---
title: "Làm việc với artifact và các phần phụ thuộc"
description: Tìm hiểu cách quản lý bản dựng artifact, tối ưu hóa việc xử lý phần phụ thuộc và tạo pipeline hiệu quả để chia sẻ dữ liệu giữa các công việc trong quy trình công việc.
order: 4
---

Một trong những khía cạnh khó chịu nhất của CI/CD là xử lý các bản dựng chậm do liên tục tải xuống cùng một phần phụ thuộc hoặc tệ hơn là các bản dựng bị lỗi do kết nối mạng không ổn định trong quá trình cài đặt phần phụ thuộc. Có thể bạn đã sốt ruột chờ đợi khi npm tải xuống hàng trăm gói lần thứ ba trong ngày hôm nay hoặc chứng kiến quá trình triển khai không thành công do sổ đăng ký gói tạm thời không khả dụng.

GitHub Actions cung cấp các công cụ mạnh mẽ để loại bỏ những vấn đề này thông qua bộ nhớ đệm thông minh và quản lý artifact. Khi bạn hiểu cách duy trì kết quả đầu ra của bản dựng và chia sẻ dữ liệu hiệu quả giữa các công việc, quy trình làm việc của bạn sẽ trở nên nhanh hơn, đáng tin cậy hơn và ít gặp phải các lỗi bên ngoài hơn.

## Hiểu thách thức cô lập

Mọi công việc của GitHub Actions đều chạy trong một máy ảo hoàn toàn mới và không có bộ nhớ về các lần thực thi trước đó. Sự tách biệt này mang lại sự nhất quán và ngăn chặn các quy trình công việc can thiệp lẫn nhau, nhưng nó tạo ra một thách thức: làm cách nào để bạn chia sẻ dữ liệu giữa các công việc cần làm việc cùng nhau?

Đây là cách luồng dữ liệu giữa các công việc bị cô lập bằng artifact:

```
Job 1: Build Application
┌─────────────────────────┐
│  Fresh VM Environment   │
│  ┌─────────────────┐    │
│  │ 1. Checkout     │    │
│  │ 2. Install deps │    │
│  │ 3. Run tests    │    │
│  │ 4. Build app    │    │
│  │ 5. Create files │    │
│  └─────────────────┘    │
│           │             │
│           ▼             │
│    ┌─────────────┐      │
│    │   dist/     │      │ ← Build outputs
│    │   reports/  │      │
│    └─────────────┘      │
└─────────────────────────┘
           │
           ▼ Upload Artifact
    ┌─────────────────┐
    │  GitHub Storage │  ← Persistent storage
    │   "build-123"   │
    └─────────────────┘
           │
           ▼ Download Artifact
Job 2: Deploy Application
┌─────────────────────────┐
│  Fresh VM Environment   │  ← Completely new VM
│  ┌─────────────────┐    │
│  │ 1. Checkout     │    │
│  │ 2. Download     │    │
│  │    artifacts    │    │
│  │ 3. Deploy files │    │
│  └─────────────────┘    │
│    ┌─────────────┐      │
│    │   dist/     │      │ ← Same files as Job 1
│    │   reports/  │      │   but in new VM
│    └─────────────┘      │
└─────────────────────────┘
```

Nếu không có artifact, mỗi công việc sẽ phải xây dựng lại mọi thứ từ đầu:

```
Without Artifacts (Inefficient):
Job 1: Test        Job 2: Build       Job 3: Deploy
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ 1. Checkout  │   │ 1. Checkout  │   │ 1. Checkout  │
│ 2. Install   │   │ 2. Install   │   │ 2. Install   │
│ 3. Test      │   │ 3. Build     │   │ 3. Build     │ ← Rebuild again!
└──────────────┘   └──────────────┘   │ 4. Deploy    │
                                      └──────────────┘

With Artifacts (Efficient):
Job 1: Test & Build    Job 2: Deploy
┌──────────────────┐   ┌──────────────┐
│ 1. Checkout      │   │ 1. Download  │
│ 2. Install       │   │    artifacts │
│ 3. Test          │   │ 2. Deploy    │ ← Use existing build
│ 4. Build         │───┤──────────────│
│ 5. Upload        │   └──────────────┘
└──────────────────┘
```

Hãy coi artifact như một cách để bảo toàn các kết quả đầu ra có giá trị trong quá trình xây dựng của bạn - mã được biên dịch, báo cáo thử nghiệm, tài liệu hoặc gói triển khai thể hiện kết quả hữu hình của quá trình tự động hóa của bạn.

## Tạo và sử dụng Build artifact

Hãy bắt đầu với một ví dụ thực tế cho thấy cách tạo và sử dụng bản dựng artifact trong quy trình làm việc thực tế:

```yaml
name: Build and Deploy Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
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

      - name: Build application
        run: npm run build

      # Create a deployment package with everything needed
      - name: Create deployment package
        run: |
          mkdir -p deploy-package
          cp -r dist/* deploy-package/
          cp package.json deploy-package/
          cp package-lock.json deploy-package/

          # Add deployment metadata
          echo "{
            \"version\": \"${{ github.sha }}\",
            \"buildTime\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
            \"branch\": \"${{ github.ref_name }}\"
          }" > deploy-package/build-info.json

      # Upload the complete deployment package
      - name: Upload deployment package
        uses: actions/upload-artifact@v4
        with:
          name: deployment-package
          path: deploy-package/
          retention-days: 30

      # Also upload test results for analysis
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            coverage/
            test-results.xml
          retention-days: 7

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: staging

    steps:
      - name: Download deployment package
        uses: actions/download-artifact@v4
        with:
          name: deployment-package
          path: ./package

      - name: Verify package contents
        run: |
          echo "Deployment package contents:"
          ls -la package/

          echo "Build information:"
          cat package/build-info.json

          # Verify required files exist
          if [ ! -f "package/index.html" ]; then
            echo "Error: Missing index.html in deployment package"
            exit 1
          fi

      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # Your deployment commands would go here
          # rsync -avz package/ user@staging-server:/var/www/app/
```

Quy trình công việc này thể hiện một số khái niệm chính:

- Công việc xây dựng sẽ tạo một gói triển khai hoàn chỉnh với tất cả các tệp cần thiết
- Siêu dữ liệu được bao gồm trong gói để theo dõi những gì đang được triển khai
- artifact khác nhau có thời gian lưu giữ khác nhau tùy theo mục đích của chúng
- Công việc triển khai tải xuống và xác minh gói trước khi triển khai

## Bộ nhớ đệm phụ thuộc thông minh

Bộ nhớ đệm phụ thuộc có thể cải thiện đáng kể hiệu suất của bản dựng, nhưng nó cần phải được thực hiện chính xác để tránh các vấn đề về vô hiệu hóa bộ nhớ đệm hoặc các phần phụ thuộc cũ. Dưới đây là cách triển khai bộ nhớ đệm thông minh:

```yaml
name: Optimized Build with Smart Caching

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          # Built-in npm cache that handles most scenarios
          cache: 'npm'

      # For more complex caching scenarios
      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: node_modules
          # Cache key includes package-lock.json hash
          # When dependencies change, cache automatically invalidates
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
          # Fallback to partial cache matches if exact key not found
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install dependencies
        run: |
          # Only install if node_modules doesn't exist or is outdated
          if [ ! -d "node_modules" ] || [ "package-lock.json" -nt "node_modules/.package-lock.json" ]; then
            echo "Installing dependencies..."
            npm ci
            cp package-lock.json node_modules/.package-lock.json
          else
            echo "Using cached dependencies"
          fi

      # Cache other build artifacts that are expensive to recreate
      - name: Cache build cache
        uses: actions/cache@v3
        with:
          path: .next/cache
          key: ${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
          restore-keys: |
            ${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}-
            ${{ runner.os }}-nextjs-
```

Chìa khóa để lưu vào bộ nhớ đệm hiệu quả là hiểu được những gì thay đổi và khi nào. Bộ đệm của trình quản lý gói (như của npm) sẽ bị vô hiệu khi tệp khóa thay đổi. Bộ nhớ đệm bản dựng có thể cần các khóa phức tạp hơn bao gồm mã băm mã nguồn.

## Xử lý nhiều môi trường

Các dự án thực tế thường cần tạo các bản dựng khác nhau cho các môi trường khác nhau. Đây là cách xử lý việc này một cách hiệu quả:

```yaml
name: Multi-Environment Build

on:
  push:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        environment: [staging, production]
        include:
          - environment: staging
            api_url: https://api.staging.example.com
            debug: true
          - environment: production
            api_url: https://api.example.com
            debug: false

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for ${{ matrix.environment }}
        run: npm run build
        env:
          NODE_ENV: production
          API_URL: ${{ matrix.api_url }}
          DEBUG: ${{ matrix.debug }}

      - name: Upload ${{ matrix.environment }} build
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ matrix.environment }}
          path: dist/
```

Chiến lược ma trận tạo song song các bản dựng riêng biệt cho từng môi trường, với cấu hình dành riêng cho môi trường được áp dụng trong quá trình xây dựng.

## Chia sẻ dữ liệu giữa các quy trình công việc

Đôi khi bạn cần chia sẻ artifact giữa các quy trình công việc khác nhau. Ví dụ: quy trình xây dựng có thể tạo artifact mà quy trình triển khai riêng biệt cần:

```yaml
# build.yml workflow
name: Build Application

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # ... build steps ...

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/
          retention-days: 90
```

```yaml
# deploy.yml workflow
name: Deploy Application

on:
  workflow_dispatch:
    inputs:
      build_sha:
        description: 'Git SHA of build to deploy'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      # Download artifacts from a different workflow run
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-${{ github.event.inputs.build_sha }}
          path: dist/
          run-id: ${{ github.event.inputs.build_sha }}

      # ... deployment steps ...
```

Mẫu này tách biệt các mối quan tâm về xây dựng và triển khai trong khi vẫn đảm bảo bạn có thể triển khai bất kỳ phiên bản nào được xây dựng trước đó.

## Tối ưu hóa bộ nhớ artifact

artifact tiêu tốn dung lượng lưu trữ và có thể ảnh hưởng đến giới hạn sử dụng Tác vụ GitHub của bạn. Dưới đây là cách tối ưu hóa quản lý artifact:

```yaml
- name: Upload artifacts with smart retention
  uses: actions/upload-artifact@v4
  with:
    name: build-artifacts
    path: dist/
    # Keep production builds longer than development builds
    retention-days: ${{ github.ref == 'refs/heads/main' && 90 || 7 }}
    # Compress artifacts to save space
    compression-level: 9

# Clean up old artifacts automatically
- name: Clean up old artifacts
  uses: actions/github-script@v7
  with:
    script: |
      const artifacts = await github.rest.actions.listWorkflowRunArtifacts({
        owner: context.repo.owner,
        repo: context.repo.repo,
        run_id: context.runId
      });

      // Delete artifacts older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      for (const artifact of artifacts.data.artifacts) {
        if (new Date(artifact.created_at) < thirtyDaysAgo) {
          await github.rest.actions.deleteArtifact({
            owner: context.repo.owner,
            repo: context.repo.repo,
            artifact_id: artifact.id
          });
        }
      }
```

## Xử lý các phụ thuộc lớn

Một số dự án có các bộ dữ liệu hoặc bộ phụ thuộc lớn bất thường nên không phù hợp với các chiến lược lưu vào bộ nhớ đệm thông thường. Đây là cách xử lý chúng:

```yaml
- name: Cache large dependencies
  uses: actions/cache@v3
  with:
    path: |
      large-dataset/
      ml-models/
    key: large-deps-${{ hashFiles('data-version.txt') }}
    restore-keys: large-deps-

- name: Download large dependencies if needed
  run: |
    if [ ! -d "large-dataset" ]; then
      echo "Downloading large dataset..."
      wget -O dataset.tar.gz https://example.com/large-dataset.tar.gz
      tar -xzf dataset.tar.gz
      rm dataset.tar.gz
    else
      echo "Using cached large dataset"
    fi
```

Đối với các tệp rất lớn, hãy cân nhắc sử dụng Git LFS hoặc các dịch vụ lưu trữ bên ngoài như AWS S3, sau đó chỉ tải xuống khi cần.

## Gỡ lỗi sự cố artifact

Khi artifact không hoạt động như mong đợi, đây là cách khắc phục sự cố:

```yaml
- name: Debug artifact creation
  run: |
    echo "Files to be uploaded:"
    find dist/ -type f -ls

    echo "Total size:"
    du -sh dist/

- name: Upload with debugging
  uses: actions/upload-artifact@v4
  with:
    name: debug-build
    path: dist/
  continue-on-error: true

- name: Check upload status
  run: |
    if [ $? -eq 0 ]; then
      echo "Artifact upload successful"
    else
      echo "Artifact upload failed"
      ls -la dist/
    fi
```

## Thực tiễn tốt nhất về hiệu suất

Dưới đây là các mẹo thiết thực để giúp quản lý phần phụ thuộc và artifact của bạn nhanh hơn và đáng tin cậy hơn:

**Hoạt động song song artifact**:

```yaml
- name: Upload multiple artifacts in parallel
  uses: actions/upload-artifact@v4
  with:
    name: logs
    path: logs/

- name: Upload test results
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: test-results/
```

**Khóa bộ đệm thông minh**:

```yaml
# Good: includes all relevant files in cache key
key: ${{ runner.os }}-deps-${{ hashFiles('package-lock.json', 'requirements.txt') }}

# Better: includes environment variables that affect dependencies
key: ${{ runner.os }}-deps-${{ env.NODE_VERSION }}-${{ hashFiles('package-lock.json') }}
```

**ATránh đập bộ nhớ đệm**:

```yaml
# Use restore-keys to provide fallback cache options
restore-keys: |
  ${{ runner.os }}-deps-${{ env.NODE_VERSION }}-
  ${{ runner.os }}-deps-
```

Hiểu artifact và quản lý phụ thuộc sẽ biến các quy trình công việc chậm, không đáng tin cậy thành tự động hóa nhanh, có thể dự đoán được. Trong phần tiếp theo, chúng ta sẽ khám phá cách xử lý các biến môi trường và bí mật một cách an toàn, điều này rất quan trọng để xây dựng quy trình công việc hoạt động an toàn trên các môi trường khác nhau.
