---
title: "Các công cụ FinOps cần thiết cho nhóm DevOps"
description: Khám phá các công cụ dựa trên nền tảng đám mây và của bên thứ ba giúp nhóm DevOps triển khai giám sát, tối ưu hóa và quản trị chi phí hiệu quả.
order: 3
---

Các công cụ phù hợp giúp việc triển khai FinOps trở nên thiết thực và bền vững cho các nhóm DevOps. Phần này đề cập đến cả các công cụ quản lý chi phí dựa trên nền tảng đám mây và các giải pháp chuyên dụng của bên thứ ba tích hợp tốt với quy trình làm việc DevOps hiện có.

## Công cụ quản lý chi phí trên nền tảng đám mây

Mọi nhà cung cấp đám mây lớn đều cung cấp các công cụ quản lý chi phí tích hợp. Chúng tạo thành nền tảng cho bộ công cụ FinOps của bạn và cung cấp khả năng tích hợp trực tiếp với các dịch vụ đám mây.

Trước khi đi sâu vào các công cụ này, bạn nên tìm hiểu bối cảnh về giá cả. Khi đánh giá chi phí phiên bản giữa các nhà cung cấp, [Công cụ so sánh phiên bản của Vantage](https://instances.vantage.sh/) cung cấp tài nguyên tuyệt vời để so sánh giá cả, thông số kỹ thuật và tính khả dụng trên AWS, Azure và GCP. Điều này trở nên vô giá khi đưa ra quyết định đúng quy mô hoặc đánh giá các chiến lược đa đám mây.

### Bộ quản lý chi phí AWS

AWS cung cấp một số công cụ được kết nối với nhau để hiển thị và kiểm soát chi phí:

**AWS Cost Explorer** cung cấp khả năng dự báo và phân tích chi phí chi tiết:

```bash
# Get cost breakdown by service for the last 30 days
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost,UsageQuantity \
  --group-by Type=DIMENSION,Key=SERVICE \
  --output table
```

**AWS Budgets** cho phép kiểm soát chi phí chủ động thông qua các cảnh báo tự động:

```json
{
  "BudgetName": "DevOps-Team-Monthly-Budget",
  "BudgetLimit": {
    "Amount": "5000",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST",
  "CostFilters": {
    "TagKey": ["Team"],
    "TagValue": ["DevOps"]
  },
  "NotificationsWithSubscribers": [
    {
      "Notification": {
        "NotificationType": "ACTUAL",
        "ComparisonOperator": "GREATER_THAN",
        "Threshold": 80,
        "ThresholdType": "PERCENTAGE"
      },
      "Subscribers": [
        {
          "SubscriptionType": "EMAIL",
          "Address": "devops-team@company.com"
        }
      ]
    }
  ]
}
```

**AWS Phát hiện chi phí bất thường** sử dụng máy học để xác định các kiểu chi tiêu bất thường:

```bash
# Create an anomaly detector for your services
aws ce create-anomaly-detector \
  --anomaly-detector AnomalyDetectorArn=string,DimensionKey=SERVICE \
  --dimension-specifications Dimension=SERVICE,Key=EC2-Instance,MatchOptions=EQUALS
```

### Quản lý chi phí Azure

Quản lý chi phí Azure cung cấp các đề xuất tối ưu hóa và theo dõi chi phí toàn diện:

```bash
# Azure CLI command to get cost analysis
az consumption usage list \
  --billing-period-name "202501" \
  --top 10 \
  --output table
```

**Tạo ngân sách trong Azure:**

```bash
# Create a budget with email notifications
az consumption budget create \
  --budget-name "DevOps-Monthly-Budget" \
  --amount 5000 \
  --time-grain Monthly \
  --time-period start-date="2025-01-01" end-date="2025-12-31" \
  --notifications \
    notification-enabled=true \
    notification-operator=GreaterThan \
    notification-threshold=80 \
    contact-emails="devops-team@company.com"
```

### Quản lý chi phí và thanh toán trên đám mây của Google

Các công cụ quản lý chi phí của GCP tập trung vào phân tích thanh toán chi tiết và kiểm soát ngân sách:

```bash
# Export billing data to BigQuery for analysis
gcloud billing accounts list

# Set up budget alerts
gcloud alpha billing budgets create \
  --billing-account=0X0X0X-0X0X0X-0X0X0X \
  --display-name="DevOps Team Budget" \
  --budget-amount=5000USD \
  --threshold-rules-percent=50,90 \
  --threshold-rules-basis=CURRENT_SPEND \
  --notification-channels="projects/PROJECT_ID/notificationChannels/CHANNEL_ID"
```

## Công cụ FinOps chuyên dụng của bên thứ ba

Trong khi các công cụ dựa trên nền tảng đám mây cung cấp nền tảng thì các công cụ chuyên dụng thường cung cấp khả năng tích hợp tốt hơn với quy trình làm việc DevOps và khả năng tối ưu hóa nâng cao hơn.

### Cơ sở hạ tầng: Ước tính chi phí trong CI/CD

Cơ sở hạ tầng cho thấy tác động chi phí của những thay đổi cơ sở hạ tầng trước khi triển khai, khiến cơ sở hạ tầng trở nên vô giá đối với các nhóm DevOps sử dụng cơ sở hạ tầng làm mã.

**Cài đặt và sử dụng cơ bản:**

```bash
# Install Infracost
curl -fsSL https://raw.githubusercontent.com/infracost/infracost/master/scripts/install.sh | sh

# Generate cost estimate for Terraform
infracost breakdown --path terraform/ --format table
```

**Tích hợp với các tác vụ GitHub:**

```yaml
name: Infracost
on: [pull_request]

jobs:
  infracost:
    runs-on: ubuntu-latest
    name: Show cost estimate
    steps:
      - name: Setup Infracost
        uses: infracost/actions/setup@v2
        with:
          api-key: ${{ secrets.INFRACOST_API_KEY }}

      - name: Checkout base branch
        uses: actions/checkout@v3
        with:
          ref: '${{ github.event.pull_request.base.ref }}'

      - name: Generate Infracost cost estimate baseline
        run: |
          infracost breakdown --path=terraform \
                              --format=json \
                              --out-file=/tmp/infracost-base.json

      - name: Checkout PR branch
        uses: actions/checkout@v3

      - name: Generate Infracost diff
        run: |
          infracost diff --path=terraform \
                        --format=json \
                        --compare-to=/tmp/infracost-base.json \
                        --out-file=/tmp/infracost.json

      - name: Post Infracost comment
        run: |
          infracost comment github --path=/tmp/infracost.json \
                                   --repo=$GITHUB_REPOSITORY \
                                   --github-token=${{ github.token }} \
                                   --pull-request=${{ github.event.pull_request.number }} \
                                   --behavior=update
```

### Kubecost: Giám sát chi phí Kubernetes

Đối với các nhóm chạy khối lượng công việc trên Kubernetes, Kubecost cung cấp các đề xuất tối ưu hóa và phân bổ chi phí chi tiết.

**Cài đặt qua Helm:**

```bash
# Add Kubecost Helm repository
helm repo add kubecost https://kubecost.github.io/cost-model/

# Install Kubecost
helm install kubecost kubecost/cost-analyzer \
  --namespace kubecost \
  --create-namespace \
  --set global.prometheus.enabled=false \
  --set global.grafana.enabled=false
```

**Phân bổ chi phí theo không gian tên:**

```bash
# Query costs via Kubecost API
curl -G "http://localhost:9090/model/allocation" \
  -d window=today \
  -d aggregate=namespace \
  -d accumulate=false
```

**ECấu hình Kubecost mẫu để phân bổ chi phí:**

```yaml
# kubecost-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kubecost-cost-model-config
  namespace: kubecost
data:
  CLOUD_PROVIDER_API_KEY: 'YOUR_CLOUD_PROVIDER_KEY'
  CLUSTER_ID: 'production-cluster'
  # Configure custom pricing for on-premises
  CPU_COST_PER_CORE_HOUR: '0.031'
  RAM_COST_PER_GB_HOUR: '0.004'
  # Set allocation method
  ALLOCATION_NODE_SPLIT: 'true'
```

### Thuận lợi: Quản lý chi phí trên nhiều đám mây

Vantage cung cấp khả năng hiển thị chi phí thống nhất trên nhiều nhà cung cấp đám mây, hữu ích cho các tổ chức có chiến lược nhiều đám mây.

**Các tính năng chính dành cho nhóm DevOps:**

- Tự động phát hiện chi phí bất thường
- Tích hợp với Slack và các công cụ giao tiếp khác
- Trang tổng quan tùy chỉnh để theo dõi chi phí theo nhóm cụ thể
- Quyền truy cập API để quản lý chi phí có lập trình

```bash
# Example API call to get cost data
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  "https://api.vantage.sh/v1/costs?provider=aws&start_date=2025-01-01&end_date=2025-01-31"
```

### CloudZero: Thông tin chi phí theo thời gian thực

CloudZero tập trung vào phân bổ chi phí theo thời gian thực và cung cấp phân bổ chi phí tự động mà không cần gắn thẻ thủ công.

**Các tính năng đặc biệt có giá trị đối với DevOps:**

- Phân bổ chi phí tự động bằng cách sử dụng dữ liệu đo từ xa
- Tích hợp với CI/CD pipeline để theo dõi chi phí
- Cảnh báo theo thời gian thực về sự bất thường về chi phí
- Phân tích tác động chi phí cho các bản phát hành tính năng

### Khai thác quản lý chi phí đám mây

Khai thác tích hợp quản lý chi phí với việc triển khai pipeline, cung cấp thông tin chi tiết về chi phí như một phần của quy trình triển khai.

**Ví dụ tích hợp đường ống:**

```yaml
# Harness pipeline step for cost validation
- step:
    type: Plugin
    name: Cost Gate
    identifier: cost_gate
    spec:
      connectorRef: harness_ccm
      image: harness/cost-gate:latest
      settings:
        cost_threshold: 500
        time_period: 30d
        resource_filter: 'environment:production'
```

## Công cụ quản lý chi phí nguồn mở

Một số công cụ nguồn mở cung cấp khả năng quản lý chi phí tích hợp tốt với quy trình làm việc DevOps.

### Cloud Custodian: Quản lý tài nguyên dựa trên chính sách

Cloud Custodian cho phép thực thi chính sách tự động để tối ưu hóa chi phí:

```yaml
# custodian-policy.yml
policies:
  - name: terminate-unused-instances
    resource: ec2
    filters:
      - 'State.Name': running
      - type: metrics
        name: CPUUtilization
        days: 7
        value: 5
        op: less-than
    actions:
      - type: terminate

  - name: stop-after-hours
    resource: ec2
    filters:
      - 'State.Name': running
      - type: offhour
        tag: Schedule
        default_tz: EST
        offhour: 19
    actions:
      - stop
```

**Chính sách giám sát đám mây đang chạy:**

```bash
# Validate policy
custodian validate custodian-policy.yml

# Run in dry-run mode
custodian run --dryrun custodian-policy.yml -s output/

# Execute the policy
custodian run custodian-policy.yml -s output/
```

### Komiser: Khám phá tài nguyên đám mây và phân tích chi phí

Komiser cung cấp khả năng khám phá cơ sở hạ tầng nguồn mở và phân tích chi phí:

```bash
# Install Komiser
wget https://github.com/mlabouardy/komiser/releases/download/2.10.0/komiser_2.10.0_Linux_x86_64.tar.gz
tar -xzf komiser_2.10.0_Linux_x86_64.tar.gz

# Configure for AWS
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY"

# Run Komiser
./komiser start --config=config.toml
```

Cấu hình **Komiser:**

```toml
# config.toml
[aws]
source = "CREDENTIALS_FILE"
regions = ["us-east-1", "us-west-2"]
profile = "default"

[slack]
webhook = "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
channel = "komiser"

[cost]
enabled = true
currency = "USD"
```

## Tiêu chí lựa chọn công cụ

Khi chọn công cụ FinOps cho quy trình làm việc DevOps của bạn, hãy cân nhắc:

**Yêu cầu tích hợp:**

- Nó có hoạt động với CI/CD pipeline hiện tại của bạn không?
- Nó có thể tích hợp với hệ thống giám sát và cảnh báo của bạn không?
- Nó có hỗ trợ cơ sở hạ tầng của bạn dưới dạng công cụ mã không?

**Hỗ trợ mẫu giá:**

- Nó có hiểu mô hình định giá của nhà cung cấp đám mây của bạn không?
- Nó có thể xử lý các trường hợp dự trữ, kế hoạch tiết kiệm và định giá giao ngay không?
- Nó có tính đến khoản giảm giá và tín dụng của doanh nghiệp không?

**Khả năng tự động hóa:**

- Nó có thể tự động tối ưu hóa tài nguyên dựa trên chính sách không?
- Nó có cung cấp quyền truy cập API để tự động hóa tùy chỉnh không?
- Nó có thể tích hợp với quy trình triển khai của bạn không?

**Quy trình làm việc của nhóm:**

- Nó có phù hợp với các công cụ và quy trình hiện có của nhóm bạn không?
- Nó có thể cung cấp thông tin chi tiết về chi phí vào đúng thời điểm trong quy trình làm việc của bạn không?
- Nó có yêu cầu thay đổi quy trình đáng kể không?

Công cụ FinOps tốt nhất dành cho nhóm của bạn giúp cân bằng chức năng với việc tích hợp quy trình làm việc. Bắt đầu với các công cụ dựa trên nền tảng đám mây để có khả năng hiển thị cơ bản, sau đó thêm các công cụ chuyên dụng khi hoạt động FinOps của bạn đã hoàn thiện.
