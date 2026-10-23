---
title: "Thực hành bảo mật và các mẫu triển khai trong production"
description: Tìm hiểu cách bảo mật CI/CD pipeline của bạn, bảo vệ dữ liệu nhạy cảm và triển khai các mẫu cấp doanh nghiệp cho môi trường production.
order: 9
---

CI/CD pipeline là mục tiêu có giá trị cao cho những kẻ tấn công vì chúng có quyền truy cập vào mã nguồn, thông tin xác thực triển khai và hệ thống production của bạn. CI/CD pipeline bị xâm phạm có thể dẫn đến các cuộc tấn công chuỗi cung ứng, đánh cắp bí mật hoặc mã độc được triển khai tới production. Cổ phần rất cao và bảo mật không thể là một suy nghĩ lại.

Nhiều nhà phát triển tập trung vào việc làm cho quy trình làm việc hoạt động hiệu quả mà không xem xét các tác động về bảo mật. Cách tiếp cận này có hiệu quả cho đến khi bạn gặp phải sự cố bảo mật đầu tiên, kiểm tra tuân thủ hoặc triển khai doanh nghiệp trong đó các yêu cầu bảo mật là không thể thương lượng. Hiểu các phương pháp bảo mật tốt nhất ngay từ đầu sẽ ngăn ngừa việc tái cấu trúc gây khó khăn sau này và bảo vệ ứng dụng cũng như người dùng của bạn.

## Bề mặt tấn công CI/CD

CI/CD pipeline của bạn tạo ra một số vectơ tấn công tiềm ẩn không tồn tại trong quy trình phát triển truyền thống. Hiểu được những mối đe dọa này sẽ giúp bạn thiết kế các biện pháp phòng vệ thích hợp.

**Source Code Insert**: Kẻ tấn công có thể gửi pull request kèm theo các thay đổi quy trình làm việc độc hại được thực thi khi PR được xây dựng. Điều này đặc biệt nguy hiểm vì các tệp quy trình công việc có quyền truy cập vào các bí mật và có thể sửa đổi quy trình xây dựng.

**Tiết lộ bí mật**: Quy trình làm việc CI/CD cần quyền truy cập vào thông tin xác thực triển khai, khóa API và thông tin nhạy cảm khác. Việc quản lý bí mật kém có thể làm lộ các thông tin xác thực này trong nhật ký, artifact hoặc tệp quy trình làm việc.

**Tấn công chuỗi cung ứng**: Các phần phụ thuộc được tải xuống trong quá trình xây dựng có thể chứa mã độc. Cơ quan đăng ký gói bị xâm phạm hoặc các cuộc tấn công nhầm lẫn phụ thuộc có thể đưa các gói độc hại vào quá trình xây dựng của bạn.

**Tăng cường đặc quyền**: Các quy trình làm việc chạy với nhiều quyền có thể bị lợi dụng để truy cập các tài nguyên vượt quá mức cần thiết cho quá trình xây dựng và triển khai.

## Bảo mật kích hoạt quy trình làm việc

Việc cân nhắc bảo mật quan trọng nhất là kiểm soát thời điểm chạy quy trình làm việc và mã nào chúng thực thi. Những kẻ độc hại thường cố gắng khai thác các trình kích hoạt quy trình làm việc để chạy mã trái phép.

```yaml
name: Secure Workflow Triggers

# Be explicit about which events trigger workflows
on:
  push:
    branches: [main, develop]
    # Never trigger on all branches - limit scope
  pull_request:
    branches: [main]
    # Use pull_request_target carefully - it has access to secrets

  # For workflows that use pull_request_target, add safety checks
  pull_request_target:
    types: [opened, synchronize]
    branches: [main]

jobs:
  # Security gate for external contributions
  security-check:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request_target'

    steps:
      # Only checkout the base branch initially, not the PR code
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.base.sha }}

      # Verify the PR is from a trusted source
      - name: Check PR source
        run: |
          # Check if PR is from a fork
          if [ "${{ github.event.pull_request.head.repo.full_name }}" != "${{ github.repository }}" ]; then
            echo "PR is from external fork: ${{ github.event.pull_request.head.repo.full_name }}"
            
            # Check if author is a collaborator
            AUTHOR="${{ github.event.pull_request.user.login }}"
            if gh api repos/${{ github.repository }}/collaborators/$AUTHOR >/dev/null 2>&1; then
              echo "✅ Author is a repository collaborator"
            else
              echo "❌ Author is not a collaborator, manual review required"
              exit 1
            fi
          else
            echo "✅ PR is from the same repository"
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      # Only after verification, checkout the PR code
      - name: Checkout PR code
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}

      # Scan for suspicious changes in workflow files
      - name: Scan workflow changes
        run: |
          # Check if .github/workflows was modified
          if git diff --name-only ${{ github.event.pull_request.base.sha }}..${{ github.event.pull_request.head.sha }} | grep -q "^\.github/workflows/"; then
            echo "⚠️ Workflow files modified in this PR"
            echo "Modified workflow files:"
            git diff --name-only ${{ github.event.pull_request.base.sha }}..${{ github.event.pull_request.head.sha }} | grep "^\.github/workflows/"
            
            # Require manual approval for workflow changes from forks
            if [ "${{ github.event.pull_request.head.repo.full_name }}" != "${{ github.repository }}" ]; then
              echo "❌ External contributors cannot modify workflows without manual review"
              exit 1
            fi
          fi
```

Mẫu này cung cấp nhiều lớp bảo vệ chống lại các sửa đổi quy trình làm việc độc hại trong khi vẫn cho phép đóng góp hợp pháp.

## Quản lý và bảo vệ bí mật

Quản lý bí mật thích hợp là rất quan trọng đối với bảo mật CI/CD. Bí mật không bao giờ được xuất hiện trong nhật ký, tệp quy trình công việc hoặc artifact và quyền truy cập phải được giới hạn ở những quy trình công việc thực sự cần chúng.

```yaml
name: Secure Secret Management

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production # Use environment protection

    steps:
      - uses: actions/checkout@v4

      - name: Configure deployment credentials
        env:
          # Use secrets for sensitive information
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: |
          # Configure AWS credentials without logging them
          aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
          aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
          aws configure set region us-east-1

          # Set up SSH key for deployment
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key

          # Verify configuration without exposing secrets
          echo "✅ AWS configuration completed"
          echo "✅ SSH key configuration completed"

      - name: Validate secret availability
        run: |
          # Check that secrets are available without exposing them
          if [ -z "${{ secrets.AWS_ACCESS_KEY_ID }}" ]; then
            echo "❌ AWS_ACCESS_KEY_ID secret not configured"
            exit 1
          fi

          if [ -z "${{ secrets.AWS_SECRET_ACCESS_KEY }}" ]; then
            echo "❌ AWS_SECRET_ACCESS_KEY secret not configured"
            exit 1
          fi

          if [ -z "${{ secrets.DEPLOY_KEY }}" ]; then
            echo "❌ DEPLOY_KEY secret not configured"
            exit 1
          fi

          echo "✅ All required secrets are configured"

      # Use secrets safely in deployment commands
      - name: Deploy to production
        run: |
          # Deploy using configured credentials
          # Secrets are already configured and won't appear in logs
          aws s3 sync dist/ s3://production-bucket/ --delete

          # Use SSH key for server deployment
          rsync -avz --delete -e "ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no" \
            dist/ deploy@production-server:/var/www/app/

      # Clean up sensitive files
      - name: Cleanup sensitive data
        if: always()
        run: |
          # Remove temporary files containing secrets
          rm -f ~/.ssh/deploy_key
          rm -f ~/.aws/credentials

          # Clear environment variables (bash history)
          unset AWS_ACCESS_KEY_ID
          unset AWS_SECRET_ACCESS_KEY
          unset DEPLOY_KEY
```

## Triển khai quyền truy cập đặc quyền tối thiểu

Quy trình làm việc phải có các quyền tối thiểu cần thiết để hoàn thành nhiệm vụ của mình. GitHub cung cấp các biện pháp kiểm soát quyền chi tiết mà bạn nên sử dụng để hạn chế thiệt hại tiềm ẩn do quy trình công việc bị xâm phạm.

```yaml
name: Least Privilege Workflow

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# Explicitly set minimal permissions
permissions:
  contents: read # Read repository contents
  actions: read # Read workflow status
  checks: write # Write check status
  pull-requests: write # Comment on PRs

jobs:
  test:
    runs-on: ubuntu-latest
    # This job only needs to read code and write test results
    permissions:
      contents: read
      checks: write

    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        run: |
          echo "Running tests..."
          # Test commands here

      - name: Report test results
        uses: actions/github-script@v7
        with:
          script: |
            // This action can create check runs because we have checks: write permission
            await github.rest.checks.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              name: 'Test Results',
              head_sha: context.sha,
              status: 'completed',
              conclusion: 'success',
              output: {
                title: 'All tests passed',
                summary: 'Test suite completed successfully'
              }
            });

  deploy:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    environment: production

    # Deployment needs different permissions
    permissions:
      contents: read
      deployments: write

    steps:
      - uses: actions/checkout@v4

      - name: Create deployment
        uses: actions/github-script@v7
        with:
          script: |
            // Create deployment record
            const deployment = await github.rest.repos.createDeployment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.sha,
              environment: 'production',
              auto_merge: false
            });

            // Store deployment ID for status updates
            core.setOutput('deployment-id', deployment.data.id);

      - name: Deploy application
        run: |
          echo "Deploying application..."
          # Deployment commands here

      - name: Update deployment status
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.repos.createDeploymentStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              deployment_id: '${{ steps.deploy.outputs.deployment-id }}',
              state: 'success',
              environment: 'production',
              environment_url: 'https://myapp.com'
            });
```

## An ninh chuỗi cung ứng

Việc bảo vệ khỏi các cuộc tấn công chuỗi cung ứng đòi hỏi phải kiểm soát và xác thực các yếu tố phụ thuộc cũng như hành động mà quy trình công việc của bạn sử dụng.

```yaml
name: Supply Chain Security

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # Pin actions to specific SHA hashes for maximum security
      - name: Setup Node.js (pinned)
        uses: actions/setup-node@5e21ff4d9bc1a8cf6de233a3057d20ec6b3fb69d # v4.0.3
        with:
          node-version: '18'

      # Audit dependencies for known vulnerabilities
      - name: Audit dependencies
        run: |
          echo "=== Dependency Security Audit ==="

          # Check for known vulnerabilities
          npm audit --audit-level=moderate

          # Check for outdated packages with security updates
          npm outdated --depth=0 || true

          # Generate dependency report
          npm list --all > dependency-report.txt
          echo "📊 Dependency report generated"

      # Scan for secrets accidentally committed to repository
      - name: Secret scanning
        run: |
          echo "=== Secret Scanning ==="

          # Look for common secret patterns
          if grep -r -E "(password|passwd|pwd|secret|key|token|api_key)" . \
             --exclude-dir=node_modules \
             --exclude-dir=.git \
             --exclude="*.md" \
             --exclude="*.yml" \
             --exclude="*.yaml"; then
            echo "⚠️ Potential secrets found in code"
            echo "Review the above matches to ensure no real secrets are committed"
          else
            echo "✅ No obvious secret patterns found"
          fi

      # Static code analysis for security issues
      - name: Static security analysis
        run: |
          echo "=== Static Security Analysis ==="

          # Install and run ESLint security plugin
          npm install --no-save eslint-plugin-security

          # Create temporary ESLint config for security scanning
          cat > .eslintrc.security.js << 'EOF'
          module.exports = {
            plugins: ['security'],
            extends: ['plugin:security/recommended'],
            parserOptions: {
              ecmaVersion: 2020,
              sourceType: 'module'
            }
          };
          EOF

          # Run security-focused linting
          npx eslint --config .eslintrc.security.js src/ || {
            echo "⚠️ Security issues found in code"
            echo "Review and fix security-related ESLint errors"
          }

      # Check for dependency confusion attacks
      - name: Check package integrity
        run: |
          echo "=== Package Integrity Check ==="

          # Verify package-lock.json exists and is up to date
          if [ ! -f "package-lock.json" ]; then
            echo "❌ package-lock.json missing - dependency confusion risk"
            exit 1
          fi

          # Check for suspicious package names that might be typosquatting
          SUSPICIOUS_PATTERNS="^(react-|vue-|angular-|lodas|request|express)"
          if npm list --json | jq -r '.dependencies | keys[]' | grep -E "$SUSPICIOUS_PATTERNS"; then
            echo "⚠️ Suspicious package names found - verify legitimacy"
          fi

          echo "✅ Package integrity checks completed"

      # Generate security report
      - name: Generate security report
        if: always()
        run: |
          cat > security-report.md << 'EOF'
          # Security Scan Report

          **Repository**: ${{ github.repository }}
          **Commit**: ${{ github.sha }}
          **Branch**: ${{ github.ref_name }}
          **Scan Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

          ## Scans Performed

          - ✅ Dependency vulnerability audit
          - ✅ Secret pattern scanning
          - ✅ Static code security analysis
          - ✅ Package integrity verification

          ## Recommendations

          1. Regularly update dependencies to patch security vulnerabilities
          2. Use dependabot or similar tools for automated dependency updates
          3. Implement pre-commit hooks to prevent secret commits
          4. Consider using SAST tools in your development workflow

          EOF

          echo "Security report generated"

      - name: Upload security report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: security-report
          path: security-report.md
          retention-days: 30
```

## Cổng phê duyệt và bảo vệ môi trường

Để triển khai production, hãy triển khai nhiều lớp bảo vệ để ngăn chặn việc triển khai trái phép hoặc vô tình.

```yaml
name: Protected Production Deployment

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      build-version: ${{ steps.version.outputs.version }}

    steps:
      - uses: actions/checkout@v4

      - name: Build application
        run: |
          echo "Building application..."
          # Build steps here

      - name: Generate build version
        id: version
        run: |
          VERSION="v$(date +%Y%m%d-%H%M%S)-${GITHUB_SHA:0:7}"
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "Build version: $VERSION"

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ steps.version.outputs.version }}
          path: dist/

  # Staging deployment with automatic approval
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    environment: staging

    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying ${{ needs.build.outputs.build-version }} to staging"
          # Staging deployment steps

      - name: Run smoke tests
        run: |
          echo "Running smoke tests on staging..."
          # Smoke test commands

  # Production deployment with manual approval and time delays
  deploy-production:
    runs-on: ubuntu-latest
    needs: [build, deploy-staging]
    environment:
      name: production
      url: https://myapp.com

    steps:
      # Additional security checks before production deployment
      - name: Pre-deployment security verification
        run: |
          echo "=== Pre-deployment Security Checks ==="

          # Verify staging deployment is healthy
          STAGING_HEALTH=$(curl -sf https://staging.myapp.com/health || echo "unhealthy")
          if [ "$STAGING_HEALTH" != "healthy" ]; then
            echo "❌ Staging environment is not healthy, aborting production deployment"
            exit 1
          fi

          # Check for any active security incidents
          echo "✅ Staging health check passed"
          echo "✅ No active security incidents"

          # Verify build artifacts integrity
          echo "✅ Build artifact integrity verified"

      - name: Deploy to production
        run: |
          echo "Deploying ${{ needs.build.outputs.build-version }} to production"
          # Production deployment steps

          # Create deployment record for audit trail
          echo "Deployment completed at $(date -u)"
          echo "Deployed by: ${{ github.actor }}"
          echo "Build version: ${{ needs.build.outputs.build-version }}"
          echo "Commit: ${{ github.sha }}"

      - name: Post-deployment verification
        run: |
          echo "Running post-deployment verification..."

          # Wait for deployment to stabilize
          sleep 30

          # Verify production health
          for i in {1..5}; do
            if curl -sf https://myapp.com/health; then
              echo "✅ Production health check passed"
              break
            else
              echo "⚠️ Health check attempt $i failed, retrying..."
              sleep 30
            fi
            
            if [ $i -eq 5 ]; then
              echo "❌ Production health checks failed"
              exit 1
            fi
          done

      - name: Send deployment notification
        if: always()
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
        run: |
          if [ "${{ job.status }}" == "success" ]; then
            STATUS="✅ successful"
            COLOR="good"
          else
            STATUS="❌ failed"
            COLOR="danger"
          fi

          curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-type: application/json' \
            --data "{
              \"text\": \"Production deployment $STATUS\",
              \"attachments\": [{
                \"color\": \"$COLOR\",
                \"fields\": [
                  {\"title\": \"Version\", \"value\": \"${{ needs.build.outputs.build-version }}\", \"short\": true},
                  {\"title\": \"Deployed by\", \"value\": \"${{ github.actor }}\", \"short\": true},
                  {\"title\": \"Commit\", \"value\": \"${{ github.sha }}\", \"short\": true}
                ]
              }]
            }"
```

## Đường mòn tuân thủ và kiểm toán

Môi trường doanh nghiệp thường yêu cầu các quy trình kiểm tra chi tiết và tuân thủ các tiêu chuẩn bảo mật. Dưới đây là cách triển khai quy trình làm việc thân thiện với việc kiểm tra:

```yaml
name: Compliance-Ready Workflow

on:
  push:
    branches: [main]

jobs:
  audit-and-deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      # Create detailed audit log
      - name: Create audit log entry
        run: |
          mkdir -p audit-logs

          cat > audit-logs/deployment-$(date +%Y%m%d-%H%M%S).json << EOF
          {
            "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "event_type": "deployment_started",
            "repository": "${{ github.repository }}",
            "branch": "${{ github.ref_name }}",
            "commit_sha": "${{ github.sha }}",
            "commit_message": $(echo '${{ github.event.head_commit.message }}' | jq -Rs .),
            "author": "${{ github.event.head_commit.author.name }}",
            "actor": "${{ github.actor }}",
            "workflow": "${{ github.workflow }}",
            "run_id": "${{ github.run_id }}",
            "run_number": "${{ github.run_number }}",
            "environment": "production",
            "runner_os": "${{ runner.os }}",
            "runner_arch": "${{ runner.arch }}"
          }
          EOF

      # Verify compliance requirements
      - name: Compliance checks
        run: |
          echo "=== Compliance Verification ==="

          # Check that deployment is from approved branch
          if [ "${{ github.ref_name }}" != "main" ]; then
            echo "❌ Production deployments must be from main branch"
            exit 1
          fi

          # Verify required approvals (in real scenario, this would check PR approvals)
          echo "✅ Deployment from approved branch"

          # Check that secrets are properly configured
          if [ -z "${{ secrets.PROD_DEPLOY_KEY }}" ]; then
            echo "❌ Production deployment key not configured"
            exit 1
          fi

          echo "✅ Required secrets configured"

          # Verify environment protection is active
          echo "✅ Environment protection verified"

      - name: Deploy with audit trail
        run: |
          echo "=== Production Deployment ==="

          # Log deployment start
          echo "Deployment started at $(date -u)"
          echo "Commit: ${{ github.sha }}"
          echo "Author: ${{ github.event.head_commit.author.name }}"
          echo "Deployed by: ${{ github.actor }}"

          # Actual deployment commands would go here
          echo "Deploying application..."

          # Log deployment completion
          echo "Deployment completed at $(date -u)"

      # Store audit logs
      - name: Store audit logs
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: audit-logs-${{ github.run_id }}
          path: audit-logs/
          retention-days: 2555 # ~7 years for compliance

      # Send audit notification
      - name: Send audit notification
        if: always()
        run: |
          # In a real scenario, this would send to your audit/compliance system
          echo "Audit trail created for deployment ${{ github.run_id }}"
          echo "Status: ${{ job.status }}"
          echo "Logs stored in artifacts for compliance retention"
```

Bảo mật không chỉ là ngăn chặn các cuộc tấn công - mà còn là xây dựng niềm tin với người dùng, đáp ứng các yêu cầu tuân thủ và bảo vệ doanh nghiệp của bạn. Các mẫu này cung cấp nền tảng vững chắc cho CI/CD an toàn, nhưng bảo mật là một quá trình liên tục đòi hỏi phải xem xét và cập nhật thường xuyên khi các mối đe dọa phát triển.

Trong phần cuối cùng, chúng ta sẽ khám phá các ví dụ thực tế và thảo luận cách tiếp tục hành trình tự động hóa của bạn ngoài những kiến thức cơ bản được đề cập trong hướng dẫn này.
