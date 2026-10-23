---
title: "Giám sát, gỡ lỗi và tối ưu hóa"
description: Tìm hiểu cách khắc phục sự cố của quy trình làm việc không thành công, tối ưu hóa hiệu suất CI/CD và duy trì các hệ thống tự động hóa đáng tin cậy.
order: 8
---

Không có gì khó chịu hơn một quy trình làm việc hôm qua hoạt động hoàn hảo nhưng hôm nay lại thất bại một cách bí ẩn, đặc biệt là khi bạn đang cố sửa một lỗi nghiêm trọng hoặc triển khai một tính năng khẩn cấp. Các thông báo lỗi khó hiểu, các bản dựng bị treo vĩnh viễn và các lỗi gián đoạn chỉ xảy ra trong CI khiến quy trình gỡ lỗi giống như giải các câu đố với những mảnh ghép còn thiếu.

Sự khác biệt giữa hệ thống CI/CD có thể bảo trì và vấn đề đau đầu liên tục là khả năng quan sát, chiến lược gỡ lỗi và thực hành tối ưu hóa tốt. Khi bạn hiểu cách chẩn đoán sự cố nhanh chóng và duy trì quy trình làm việc hiệu quả, bạn sẽ tốn ít thời gian hơn để đấu tranh với quá trình tự động hóa và có nhiều thời gian hơn để xây dựng các tính năng.

## Xây dựng khả năng quan sát vào quy trình làm việc

Bước đầu tiên để gỡ lỗi là có đủ thông tin để hiểu chuyện gì đang xảy ra. Không thể khắc phục hiệu quả các quy trình làm việc bị lỗi âm thầm hoặc cung cấp thông báo lỗi mơ hồ.

Đây là luồng thông tin gỡ lỗi bạn cần:

```
Workflow Execution with Observability:

┌─────────────────────────────────────────────────────┐
│                  Workflow Start                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Environment Logging                         │    │
│  │ - OS, Architecture, Node version            │    │
│  │ - Git branch, commit, repository            │    │
│  │ - Environment variables                     │    │
│  │ - System resources (memory, disk)           │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────┐
│                   Job Execution                    │
│                                                    │
│  Step 1: Setup ──┐                                 │
│                  │ ✅ Success                      │
│                  └─▶ Log: "Node.js 18 installed"   │
│                                                    │
│  Step 2: Install ──┐                               │
│                    │ ❌ Failure                    │
│                    └─▶ Logs: "npm ERR! 404..."     │
│                       ├─▶ Debug Info:              │
│                       │   • Network connectivity   │
│                       │   • npm cache status       │
│                       │   • package.json validity  │
│                       └─▶ Error Context:           │
│                           • Exit code: 1           │
│                           • Failed command         │
│                           • Suggested fixes        │
└────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                Artifact Collection                  │
│  ┌─────────────────────────────────────────────┐    │
│  │ Always Collected (even on failure):         │    │
│  │ - Test results and coverage reports         │    │
│  │ - Build logs and error outputs              │    │
│  │ - System information and diagnostics        │    │
│  │ - Performance metrics and timing data       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│              Notification & Reporting               │
│                                                     │
│  Success Path:           Failure Path:              │
│  ┌─────────────┐        ┌─────────────────────────┐ │
│  │ ✅ Slack    │        │ ❌ Detailed Slack Alert  │ │
│  │ "Deployed!" │        │ • What failed           │ │
│  └─────────────┘        │ • Error message         │ │
│                         │ • Link to logs          │ │
│                         │ • Suggested actions     │ │
│                         └─────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

Dưới đây là cách xây dựng khả năng quan sát vào quy trình công việc của bạn:

```yaml
name: Observable Workflow

on:
  push:
    branches: [main]

env:
  # Enable detailed logging for debugging
  ACTIONS_STEP_DEBUG: ${{ vars.ENABLE_DEBUG_LOGGING || 'false' }}

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # Log environment information for debugging
      - name: Environment information
        run: |
          echo "=== Environment Information ==="
          echo "Runner OS: ${{ runner.os }}"
          echo "Runner Architecture: ${{ runner.arch }}"
          echo "GitHub Event: ${{ github.event_name }}"
          echo "Branch: ${{ github.ref_name }}"
          echo "Commit: ${{ github.sha }}"
          echo "Repository: ${{ github.repository }}"
          echo "Workflow: ${{ github.workflow }}"
          echo "Job: ${{ github.job }}"
          echo "Run ID: ${{ github.run_id }}"
          echo "Run Number: ${{ github.run_number }}"

          echo "=== System Information ==="
          uname -a
          df -h
          free -h

          echo "=== Environment Variables ==="
          env | grep -E '^(GITHUB_|RUNNER_|NODE_|NPM_)' | sort

      - name: Setup Node.js with detailed logging
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      # Validate environment before proceeding
      - name: Validate environment
        run: |
          echo "=== Validation Checks ==="

          # Check Node.js installation
          echo "Node.js version: $(node --version)"
          echo "NPM version: $(npm --version)"

          # Check if package.json exists
          if [ ! -f "package.json" ]; then
            echo "❌ package.json not found"
            exit 1
          else
            echo "✅ package.json found"
          fi

          # Check if lockfile exists
          if [ ! -f "package-lock.json" ]; then
            echo "⚠️ package-lock.json not found, this might cause dependency issues"
          else
            echo "✅ package-lock.json found"
          fi

      # Install dependencies with detailed output
      - name: Install dependencies
        run: |
          echo "=== Installing Dependencies ==="

          # Show what we're about to install
          echo "Dependencies to install:"
          npm list --depth=0 --json 2>/dev/null || echo "No existing dependencies"

          # Install with detailed logging
          npm ci --verbose

          # Verify installation
          echo "Installed dependencies:"
          npm list --depth=0

      # Run tests with comprehensive error reporting
      - name: Run tests
        id: tests
        run: |
          echo "=== Running Tests ==="

          # Run tests with detailed output
          if npm test -- --verbose --reporters=default,jest-junit; then
            echo "✅ All tests passed"
            echo "test-status=passed" >> $GITHUB_OUTPUT
          else
            echo "❌ Tests failed"
            echo "test-status=failed" >> $GITHUB_OUTPUT
            
            # Capture additional debugging information
            echo "=== Test Failure Debug Info ==="
            echo "Exit code: $?"
            
            # Show recent logs if they exist
            if [ -d "coverage" ]; then
              echo "Coverage files:"
              ls -la coverage/
            fi
            
            exit 1
          fi
        env:
          JEST_JUNIT_OUTPUT_DIR: ./test-results
          JEST_JUNIT_OUTPUT_NAME: junit.xml

      # Always upload test results, even on failure
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-${{ github.run_id }}
          path: |
            test-results/
            coverage/
          retention-days: 7

      # Build with error handling
      - name: Build application
        run: |
          echo "=== Building Application ==="

          # Check available disk space before building
          echo "Available disk space:"
          df -h

          # Run build with error handling
          if npm run build; then
            echo "✅ Build successful"
            
            # Show build output information
            if [ -d "dist" ]; then
              echo "Build output:"
              ls -la dist/
              echo "Total build size: $(du -sh dist/ | cut -f1)"
            fi
          else
            echo "❌ Build failed"
            
            # Capture build failure information
            echo "=== Build Failure Debug Info ==="
            echo "Exit code: $?"
            echo "Available memory: $(free -h)"
            echo "Available disk space: $(df -h)"
            
            # Check for common build issues
            if [ ! -d "node_modules" ]; then
              echo "⚠️ node_modules directory missing"
            fi
            
            exit 1
          fi

      # Generate workflow summary
      - name: Generate workflow summary
        if: always()
        run: |
          echo "## Workflow Summary" >> $GITHUB_STEP_SUMMARY
          echo "- **Status**: ${{ job.status }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Tests**: ${{ steps.tests.outputs.test-status }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Duration**: $(date -d @$(($(date +%s) - ${{ github.event.head_commit.timestamp && github.event.head_commit.timestamp || github.event.created_at }})) -u +%H:%M:%S)" >> $GITHUB_STEP_SUMMARY
          echo "- **Commit**: [${{ github.sha }}](${{ github.event.head_commit.url }})" >> $GITHUB_STEP_SUMMARY

          if [ "${{ job.status }}" != "success" ]; then
            echo "## Debugging Information" >> $GITHUB_STEP_SUMMARY
            echo "Check the workflow logs for detailed error information." >> $GITHUB_STEP_SUMMARY
            echo "Artifacts with test results and logs are available for download." >> $GITHUB_STEP_SUMMARY
          fi
```

Quy trình công việc này cung cấp thông tin ghi nhật ký và gỡ lỗi mở rộng, giúp chẩn đoán sự cố khi chúng xảy ra dễ dàng hơn nhiều.

## Gỡ lỗi các lỗi quy trình làm việc phổ biến

Các loại lỗi khác nhau đòi hỏi các phương pháp gỡ lỗi khác nhau. Dưới đây là những vấn đề thường gặp nhất và cách giải quyết chúng:

### Lỗi cài đặt phụ thuộc

```yaml
- name: Debug dependency issues
  if: failure()
  run: |
    echo "=== Dependency Debug Information ==="

    # Check npm cache
    echo "NPM cache info:"
    npm cache verify

    # Check for permission issues
    echo "NPM configuration:"
    npm config list

    # Check network connectivity
    echo "Network connectivity test:"
    curl -I https://registry.npmjs.org/ || echo "NPM registry unreachable"

    # Check package.json validity
    echo "Package.json validation:"
    node -e "console.log('package.json is valid JSON')" < package.json || echo "Invalid package.json"

    # Check for conflicting global packages
    echo "Global packages:"
    npm list -g --depth=0

    # Clear cache and retry
    echo "Clearing NPM cache..."
    npm cache clean --force
```

### Xây dựng thất bại

```yaml
- name: Debug build failures
  if: failure()
  run: |
    echo "=== Build Debug Information ==="

    # Check build configuration
    echo "Build scripts in package.json:"
    cat package.json | jq '.scripts'

    # Check for missing environment variables
    echo "Required environment variables:"
    echo "NODE_ENV: ${NODE_ENV:-'not set'}"
    echo "CI: ${CI:-'not set'}"

    # Check memory usage
    echo "Memory usage:"
    free -h

    # Check for large files that might cause issues
    echo "Large files in project:"
    find . -type f -size +10M -not -path './node_modules/*' | head -10

    # Try building with more memory
    echo "Attempting build with increased memory:"
    NODE_OPTIONS="--max_old_space_size=4096" npm run build || echo "Build still failed with more memory"
```

### Kiểm tra thất bại

```yaml
- name: Debug test failures
  if: failure()
  run: |
    echo "=== Test Debug Information ==="

    # Run tests with maximum verbosity
    echo "Running tests with debug output:"
    npm test -- --verbose --no-coverage --detectOpenHandles --forceExit || true

    # Check for test environment issues
    echo "Test environment:"
    echo "NODE_ENV: ${NODE_ENV:-'not set'}"
    echo "CI: ${CI:-'not set'}"

    # Check for port conflicts
    echo "Checking for port usage:"
    netstat -tulpn 2>/dev/null | grep :300 || echo "No processes on port 3000"

    # Check test configuration
    if [ -f "jest.config.js" ]; then
      echo "Jest configuration:"
      cat jest.config.js
    fi
```

## Chiến lược tối ưu hóa hiệu suất

Quy trình làm việc chậm khiến các nhà phát triển nản lòng và lãng phí tài nguyên CI. Dưới đây là cách tối ưu hóa hiệu suất quy trình làm việc:

### Tối ưu hóa bộ nhớ đệm phụ thuộc

```yaml
name: Optimized Workflow

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # Multi-layer caching strategy
      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: |
            ~/.npm
            node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      # Cache build outputs
      - name: Cache build output
        uses: actions/cache@v3
        with:
          path: |
            .next/cache
            dist/
          key: ${{ runner.os }}-build-${{ hashFiles('src/**/*', 'package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-build-

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          # Built-in cache for additional speed
          cache: 'npm'

      # Only install if cache miss
      - name: Install dependencies
        run: |
          if [ ! -d "node_modules" ]; then
            echo "Cache miss, installing dependencies..."
            npm ci
          else
            echo "Using cached dependencies"
            # Verify cache integrity
            npm list > /dev/null || {
              echo "Cache corrupted, reinstalling..."
              rm -rf node_modules
              npm ci
            }
          fi
```

### Thực hiện công việc song song

```yaml
name: Parallel Optimized Workflow

on:
  push:
    branches: [main]

jobs:
  # Run these jobs in parallel to save time
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  # Only build if all checks pass
  build:
    needs: [lint, test, type-check]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

### Thực thi quy trình làm việc có chọn lọc

```yaml
name: Smart Execution Workflow

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      src-changed: ${{ steps.filter.outputs.src }}
      docs-changed: ${{ steps.filter.outputs.docs }}
      config-changed: ${{ steps.filter.outputs.config }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            src:
              - 'src/**'
              - 'package*.json'
            docs:
              - 'docs/**'
              - '*.md'
            config:
              - '.github/**'
              - 'config/**'

  test:
    needs: changes
    if: needs.changes.outputs.src-changed == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: echo "Running tests because src changed"

  docs:
    needs: changes
    if: needs.changes.outputs.docs-changed == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build docs
        run: echo "Building docs because docs changed"
```

## Giám sát và cảnh báo quy trình làm việc

Hệ thống CI/CD production cần giám sát để phát hiện sự cố trước khi chúng ảnh hưởng đến năng suất của nhà phát triển:

```yaml
name: Monitored Production Workflow

on:
  push:
    branches: [main]
  schedule:
    # Run health check daily at 9 AM UTC
    - cron: '0 9 * * *'

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # Track workflow execution time
      - name: Record start time
        run: echo "START_TIME=$(date +%s)" >> $GITHUB_ENV

      - name: Deploy application
        run: |
          echo "Deploying application..."
          # Your deployment steps here
          sleep 30  # Simulate deployment time

      # Calculate and report execution time
      - name: Report execution metrics
        if: always()
        run: |
          END_TIME=$(date +%s)
          DURATION=$((END_TIME - START_TIME))

          echo "Workflow execution time: ${DURATION} seconds"

          # Send metrics to monitoring system
          curl -X POST "${{ secrets.METRICS_ENDPOINT }}" \
            -H "Content-Type: application/json" \
            -d "{
              \"workflow\": \"${{ github.workflow }}\",
              \"job\": \"${{ github.job }}\",
              \"duration\": $DURATION,
              \"status\": \"${{ job.status }}\",
              \"repository\": \"${{ github.repository }}\",
              \"branch\": \"${{ github.ref_name }}\",
              \"commit\": \"${{ github.sha }}\",
              \"run_id\": \"${{ github.run_id }}\"
            }" || echo "Failed to send metrics"

      # Send alerts on failure
      - name: Send failure alert
        if: failure()
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
        run: |
          curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-type: application/json' \
            --data "{
              \"text\": \"🚨 Deployment failed in ${{ github.repository }}\",
              \"attachments\": [{
                \"color\": \"danger\",
                \"fields\": [
                  {\"title\": \"Branch\", \"value\": \"${{ github.ref_name }}\", \"short\": true},
                  {\"title\": \"Commit\", \"value\": \"${{ github.sha }}\", \"short\": true},
                  {\"title\": \"Run\", \"value\": \"${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\", \"short\": false}
                ]
              }]
            }"

      # Send success notification for main branch deployments
      - name: Send success notification
        if: success() && github.ref == 'refs/heads/main'
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
        run: |
          curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-type: application/json' \
            --data "{
              \"text\": \"✅ Deployment successful for ${{ github.repository }}\",
              \"attachments\": [{
                \"color\": \"good\",
                \"fields\": [
                  {\"title\": \"Commit\", \"value\": \"${{ github.sha }}\", \"short\": true},
                  {\"title\": \"Duration\", \"value\": \"${DURATION}s\", \"short\": true}
                ]
              }]
            }"
```

## Số liệu và phân tích hiệu suất

Theo dõi các số liệu chính để xác định các cơ hội tối ưu hóa:

```yaml
name: Performance Analysis

on:
  push:
    branches: [main]

jobs:
  analyze-performance:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Get full history for comparison

      - name: Analyze workflow performance
        run: |
          echo "=== Workflow Performance Analysis ==="

          # Analyze recent workflow runs
          echo "Recent workflow performance:"
          gh api repos/${{ github.repository }}/actions/workflows/${{ github.workflow }}/runs \
            --jq '.workflow_runs[0:5] | .[] | "\(.created_at) - \(.conclusion) - \(.run_started_at) to \(.updated_at)"'

          # Analyze job durations
          echo "Job duration analysis:"
          gh api repos/${{ github.repository }}/actions/runs/${{ github.run_id }}/jobs \
            --jq '.jobs[] | "\(.name): \(.started_at) to \(.completed_at)"'

          # Check for performance regressions
          echo "Checking for performance regressions..."

          # Compare with previous successful run
          PREVIOUS_RUN=$(gh api repos/${{ github.repository }}/actions/workflows/${{ github.workflow }}/runs \
            --jq '.workflow_runs[] | select(.conclusion == "success") | .id' | head -2 | tail -1)

          if [ -n "$PREVIOUS_RUN" ]; then
            echo "Comparing with run $PREVIOUS_RUN"
            # Add comparison logic here
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Generate performance report
        run: |
          cat > performance-report.md << 'EOF'
          # Workflow Performance Report

          **Run ID**: ${{ github.run_id }}
          **Workflow**: ${{ github.workflow }}
          **Commit**: ${{ github.sha }}
          **Branch**: ${{ github.ref_name }}

          ## Performance Metrics

          - **Total Duration**: TBD
          - **Queue Time**: TBD
          - **Execution Time**: TBD

          ## Recommendations

          - Consider caching strategies for dependency installation
          - Evaluate parallel job execution opportunities
          - Monitor for external service latency issues

          EOF

          echo "Performance report generated"

      - name: Upload performance report
        uses: actions/upload-artifact@v4
        with:
          name: performance-report
          path: performance-report.md
```

## Khắc phục sự cố liên tục

Lỗi liên tục là thách thức lớn nhất để gỡ lỗi. Đây là một cách tiếp cận có hệ thống:

```yaml
name: Flaky Test Detection

on:
  schedule:
    # Run multiple times to detect flaky tests
    - cron: '0 */4 * * *'

jobs:
  flaky-test-detection:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        attempt: [1, 2, 3, 4, 5]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests (attempt ${{ matrix.attempt }})
        id: test-run
        run: |
          echo "Running test attempt ${{ matrix.attempt }}"
          npm test -- --verbose --json --outputFile=test-results-${{ matrix.attempt }}.json
        continue-on-error: true

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-attempt-${{ matrix.attempt }}
          path: test-results-${{ matrix.attempt }}.json

  analyze-flaky-tests:
    needs: flaky-test-detection
    runs-on: ubuntu-latest
    if: always()

    steps:
      - name: Download all test results
        uses: actions/download-artifact@v4
        with:
          pattern: test-results-attempt-*
          merge-multiple: true

      - name: Analyze test consistency
        run: |
          echo "=== Flaky Test Analysis ==="

          # Analyze test results across all attempts
          for i in {1..5}; do
            if [ -f "test-results-$i.json" ]; then
              echo "Attempt $i results:"
              cat test-results-$i.json | jq -r '.success'
            fi
          done

          echo "Tests that failed in some attempts but not others are potentially flaky"
```

Khả năng quan sát tốt, thực hành gỡ lỗi và tối ưu hóa hiệu suất tạo nên sự khác biệt giữa CI/CD giúp nhóm của bạn phát triển nhanh và CI/CD làm mọi người chậm lại. Đầu tư thời gian để làm cho quy trình làm việc của bạn có thể sửa lỗi và hiệu quả - điều này sẽ mang lại lợi ích về lâu dài.

Trong phần tiếp theo, chúng ta sẽ khám phá các phương pháp bảo mật tốt nhất và mẫu production để đảm bảo quá trình tự động hóa của bạn không chỉ nhanh và đáng tin cậy mà còn an toàn và phù hợp với môi trường doanh nghiệp.
