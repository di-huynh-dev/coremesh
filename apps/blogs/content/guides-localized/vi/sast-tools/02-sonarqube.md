---
title: "SonarQube"
description: Thiết lập SonarQube để phân tích bảo mật và chất lượng mã toàn diện. Tìm hiểu cấu hình, cổng chất lượng và tích hợp CI/CD.
---

SonarQube là một nền tảng nguồn mở để kiểm tra bảo mật và chất lượng mã liên tục. Nó phân tích mã nguồn để tìm lỗi, lỗ hổng và mùi mã trên hơn 30 ngôn ngữ lập trình, khiến nó trở thành lựa chọn phổ biến cho DevSecOps pipeline dành cho doanh nghiệp.

## Kiến trúc SonarQube

SonarQube bao gồm ba thành phần chính:

```
+------------------+      +------------------+      +------------------+
|   SonarScanner   | ---> |   SonarQube      | ---> |    Database      |
|   (CI Runner)    |      |   Server         |      |   (PostgreSQL)   |
+------------------+      +------------------+      +------------------+
      Analyzes             Processes                Stores
      source code          results                  history
```

- **SonarScanner** - Chạy trong CI/CD pipeline của bạn, phân tích mã, gửi kết quả đến máy chủ
- **SonarQube Server** - Giao diện web, API, công cụ quy tắc và công cụ tính toán
- **Database** - PostgreSQL, Oracle hoặc SQL Server (không nhúng H2 cho production)

## Thiết lập SonarQube với Docker

Cách nhanh nhất để bắt đầu là với Docker:

```bash
# Create a network for SonarQube and PostgreSQL
docker network create sonarnet

# Start PostgreSQL database
docker run -d --name sonar-postgres \\
  --network sonarnet \\
  -e POSTGRES_USER=sonar \\
  -e POSTGRES_PASSWORD=sonar_password \\
  -e POSTGRES_DB=sonarqube \\
  -v sonar_postgres_data:/var/lib/postgresql/data \\
  postgres:15-alpine

# Start SonarQube server
docker run -d --name sonarqube \\
  --network sonarnet \\
  -p 9000:9000 \\
  -e SONAR_JDBC_URL=jdbc:postgresql://sonar-postgres:5432/sonarqube \\
  -e SONAR_JDBC_USERNAME=sonar \\
  -e SONAR_JDBC_PASSWORD=sonar_password \\
  -v sonar_data:/opt/sonarqube/data \\
  -v sonar_extensions:/opt/sonarqube/extensions \\
  -v sonar_logs:/opt/sonarqube/logs \\
  sonarqube:lts-community
```

**Quan trọng:** Đợi 1-2 phút để SonarQube khởi chạy, sau đó truy cập `http://localhost:9000`.

Thông tin đăng nhập mặc định: `admin` / `admin` (thay đổi ngay sau lần đăng nhập đầu tiên).

### Cài đặt Docker Compose

Để thiết lập dễ bảo trì hơn, hãy sử dụng Docker Compose:

```yaml
# docker-compose.yml
version: '3.8'

services:
  sonarqube:
    image: sonarqube:lts-community
    container_name: sonarqube
    depends_on:
      - db
    ports:
      - "9000:9000"
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://db:5432/sonarqube
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: sonar_password
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
    ulimits:
      nofile:
        soft: 65536
        hard: 65536

  db:
    image: postgres:15-alpine
    container_name: sonar-postgres
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: sonar_password
      POSTGRES_DB: sonarqube
    volumes:
      - postgresql_data:/var/lib/postgresql/data

volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  postgresql_data:
```

Bắt đầu với `docker compose up -d`.

## Định cấu hình dự án đầu tiên của bạn

### Bước 1: Tạo dự án trong SonarQube

1. Đăng nhập vào SonarQube tại `http://localhost:9000`
2. Nhấp vào **Tạo dự án** > **Thủ công**
3. Nhập khóa dự án (ví dụ: `my-webapp`) và tên hiển thị
4. Chọn **Locally** cho phương pháp phân tích (để thiết lập ban đầu)
5. Tạo mã thông báo và lưu nó một cách an toàn

### Bước 2: Tạo sonar-project.properties

Trong thư mục gốc dự án của bạn, hãy tạo một tệp cấu hình:

```properties
# sonar-project.properties

# Required: Unique project identifier
sonar.projectKey=my-webapp

# Optional but recommended
sonar.projectName=My Web Application
sonar.projectVersion=1.0.0

# Source code location (relative to this file)
sonar.sources=src

# Test code location
sonar.tests=tests

# Exclude files from analysis
sonar.exclusions=**/node_modules/**,**/vendor/**,**/*.min.js

# Language-specific settings (for Python example)
sonar.python.version=3.11

# Coverage report location (if using coverage tools)
sonar.python.coverage.reportPaths=coverage.xml
```

### Bước 3: Chạy máy quét

Cài đặt và chạy SonarScanner:

```bash
# Install SonarScanner (macOS)
brew install sonar-scanner

# Or download from sonarqube.org and add to PATH

# Run the scan
sonar-scanner \\
  -Dsonar.host.url=http://localhost:9000 \\
  -Dsonar.token=your_generated_token
```

Sau khi quá trình quét hoàn tất, hãy xem kết quả trên giao diện web SonarQube.

## Hiểu số liệu SonarQube

SonarQube phân loại vấn đề thành nhiều loại:

### Loại vấn đề

| loại | Mô tả | Ví dụ |
|------|-------------|---------|
| **Bug** | Mã rõ ràng là sai | Hủy bỏ tham chiếu con trỏ null |
| **Lỗ hổng** | Điểm yếu về bảo mật | SQL injection, XSS |
| **Mã mùi** | Vấn đề về khả năng bảo trì | Mã trùng lặp, phương thức dài |
| **Điểm truy cập bảo mật** | Cần xem xét thủ công | Địa chỉ IP được mã hóa cứng |

### Mức độ nghiêm trọng

| Mức độ nghiêm trọng | Mô tả |
|----------|-------------|
| **Trình chặn** | Phải khắc phục ngay |
| **Critical** | Tác động lớn, khắc phục sớm |
| **Major** | Vấn đề quan trọng |
| **Minor** | Tác động thấp |
| **Info** | Chỉ mang tính thông tin |

### Số liệu chính

```
+-----------------------------------------------+
|            Quality Gate: PASSED               |
+-----------------------------------------------+
|  Bugs: 3          Vulnerabilities: 1          |
|  Code Smells: 47  Security Hotspots: 5        |
+-----------------------------------------------+
|  Coverage: 78%    Duplications: 2.3%          |
+-----------------------------------------------+
```

- **Coverage** - Tỷ lệ phần trăm mã được kiểm tra
- **Duplications** — Tỷ lệ khối mã trùng lặp
- **Technical Debt** — Thời gian ước tính để khắc phục tất cả các lỗi mã

## Cổng chất lượng

Cổng chất lượng xác định các tiêu chuẩn chất lượng tối thiểu cho dự án của bạn. Nếu mã không thành công ở cổng thì quá trình xây dựng sẽ không thành công.

### Cổng chất lượng mặc định

Cổng chất lượng "Sonar way" mặc định của SonarQube yêu cầu:

- Không có lỗi mới
- Không có lỗ hổng mới
- Tất cả các điểm nóng bảo mật đã được xem xét
- Độ bao phủ mã trên mã mới >= 80%
- Trùng lặp mã mới < 3%

### Tạo cổng chất lượng tùy chỉnh

1. Đi tới **Quality Gates** trong giao diện người dùng SonarQube
2. Nhấp vào **Tạo**
3. Thêm điều kiện:

```
Condition: Coverage on New Code
Operator: is less than
Value: 80%
Status: Error
```

Ví dụ về cổng chất lượng tùy chỉnh cho các dự án tập trung vào bảo mật:

| tình trạng | Toán tử | Giá trị | Trạng thái |
|-----------|----------|-------|--------|
| Lỗi mới | lớn hơn | 0 | Lỗi |
| Lỗ hổng mới | lớn hơn | 0 | Lỗi |
| Đã xem xét các điểm truy cập bảo mật mới | ít hơn | 100% | Lỗi |
| Bảo hiểm mã mới | ít hơn | 70% | Cảnh báo |

## Tích hợp CI/CD

### Hành động GitHub

```yaml
# .github/workflows/sonarqube.yml
name: SonarQube Analysis

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for blame information

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies and run tests
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
          pytest --cov=src --cov-report=xml

      - name: SonarQube Scan
        uses: SonarSource/sonarqube-scan-action@v5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

### CI GitLab

```yaml
# .gitlab-ci.yml
sonarqube-check:
  stage: test
  image: sonarsource/sonar-scanner-cli:latest
  variables:
    SONAR_USER_HOME: "${CI_PROJECT_DIR}/.sonar"
    GIT_DEPTH: "0"
  cache:
    key: "${CI_JOB_NAME}"
    paths:
      - .sonar/cache
  script:
    - sonar-scanner
        -Dsonar.projectKey=${CI_PROJECT_PATH_SLUG}
        -Dsonar.host.url=${SONAR_HOST_URL}
        -Dsonar.token=${SONAR_TOKEN}
  allow_failure: true
  rules:
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

### Jenkins pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        SONAR_TOKEN = credentials('sonar-token')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build & Test') {
            steps {
                sh 'mvn clean verify'
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'mvn sonar:sonar'
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
```

## Quy tắc bảo mật Tìm hiểu sâu

SonarQube bao gồm các quy tắc bảo mật mở rộng dựa trên các tiêu chuẩn OWASP, CWE và SANS.

### Danh mục lỗ hổng

| Danh mục | CWE | Quy tắc ví dụ |
|----------|-----|-------------|
| tiêm | CWE-89 | Các truy vấn SQL không dễ bị tấn công |
| XSS | CWE-79 | Phản hồi HTTP không dễ bị tấn công bởi XSS |
| CSRF | CWE-352 | Các yêu cầu phía máy chủ không dễ bị giả mạo |
| Bí mật được mã hóa cứng | CWE-798 | Thông tin xác thực không nên được mã hóa cứng |
| Tiền điện tử yếu | CWE-327 | Các thuật toán mã hóa phải an toàn |

### Xem báo cáo bảo mật

1. Điều hướng đến dự án của bạn trong SonarQube
2. Nhấp vào **Báo cáo bảo mật** ở menu bên trái
3. Xem báo cáo theo:
   - **OWASP Top 10** — Phân loại theo rủi ro OWASP 2021
   - **CWE Top 25** — Điểm yếu phần mềm nguy hiểm nhất
   - **Điểm truy cập bảo mật** — Mã yêu cầu xem xét bảo mật thủ công

### Tùy chỉnh quy tắc bảo mật

```
Administration > Quality Profiles > [Your Profile] > Activate More Rules
```

Lọc theo:
- **Tag:** bảo mật, lỗ hổng, cwe-top-25
- **Loại:** Lỗ hổng bảo mật, Điểm truy cập bảo mật
- **Mức độ nghiêm trọng:Trình chặn **, Quan trọng

## Thực tiễn tốt nhất

### 1. Bắt đầu với Cổng chất lượng mặc định

Cổng "Sonar way" của SonarQube được hiệu chỉnh tốt. Chỉ tùy chỉnh sau khi hiểu được nhu cầu của dự án của bạn.

### 2. Tập trung vào mã mới

Đừng cố gắng khắc phục tất cả các vấn đề cũ cùng một lúc. Phương pháp "Sạch như bạn viết mã" của SonarQube tập trung vào việc giữ cho mã mới luôn sạch sẽ.

### 3. Thường xuyên xem xét các điểm truy cập bảo mật

Điểm phát sóng không phải là lỗ hổng đã được xác nhận—chúng cần có sự đánh giá của con người. Lên lịch đánh giá hàng tuần.

### 4. Tích hợp với pull request

Khối hợp nhất không đạt cổng chất lượng. Điều này ngăn chặn các lỗ hổng mới xâm nhập vào nhánh chính.

### 5. Loại trừ Mã đã Tạo

Đừng lãng phí thời gian phân tích các tệp được tạo tự động:

```properties
# sonar-project.properties
sonar.exclusions=**/generated/**,**/migrations/**,**/*.min.js
```

## Phiên bản SonarQube

| tính năng | cộng đồng | Nhà phát triển | Doanh nghiệp |
|---------|-----------|-----------|------------|
| Giá | miễn phí | Đã trả tiền | Đã trả tiền |
| Ngôn ngữ | 19+ | 24+ | 30+ |
| Phân tích chi nhánh | Chỉ chính | Tất cả các chi nhánh | Tất cả các chi nhánh |
| Trang trí PR | Không | Có | Có |
| Độ sâu SAST | Cơ bản | Nâng cao | Nâng cao |
| Quản lý danh mục đầu tư | Không | Không | Có |

Phiên bản Cộng đồng là đủ cho hầu hết các dự án nguồn mở. Phiên bản dành cho nhà phát triển bổ sung thêm tính năng phân tích chi nhánh và tích hợp PR cần thiết cho quy trình làm việc của doanh nghiệp.

## Khắc phục sự cố

### Các vấn đề chung

**Scanner không thể kết nối với máy chủ:**
```bash
# Check server is running
curl -s http://localhost:9000/api/system/status | jq

# Verify token is valid
curl -u your_token: http://localhost:9000/api/projects/search
```

**Hết bộ nhớ trong khi phân tích:**
```bash
# Increase scanner memory
export SONAR_SCANNER_OPTS="-Xmx2048m"
sonar-scanner
```

**Phân tích mất quá nhiều thời gian:**
```properties
# Limit scope in sonar-project.properties
sonar.exclusions=**/test/**,**/docs/**
sonar.cpd.exclusions=**/test/**
```

## Bài học chính

1. **SonarQube cung cấp phân tích toàn diện** — Lỗi, lỗ hổng, mùi mã và phạm vi bảo hiểm trong một nền tảng
2. **Cổng chất lượng thực thi các tiêu chuẩn** — Chặn các hoạt động hợp nhất không đáp ứng yêu cầu bảo mật của bạn
3. Tích hợp **CI/CD là điều cần thiết** — Tự động phân tích trên mọi commit
4. **Tập trung vào mã mới** — Đừng để bị choáng ngợp bởi các vấn đề cũ
5. **Đánh giá các điểm truy cập bảo mật** — Những điểm này yêu cầu sự đánh giá của con người chứ không phải các bản sửa lỗi tự động

Tiếp theo, chúng ta sẽ khám phá Semgrep để quét bảo mật nhanh chóng, có thể tùy chỉnh.
