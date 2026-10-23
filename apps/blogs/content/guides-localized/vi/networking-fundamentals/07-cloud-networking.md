---
title: "Mạng đám mây"
description: Tìm hiểu về Đám mây riêng ảo, nhóm bảo mật và mô hình mạng gốc đám mây trên AWS, Azure và Google Cloud.
order: 7
---

Mạng đám mây cung cấp khả năng trừu tượng hóa mạnh mẽ trên cơ sở hạ tầng mạng vật lý, nhưng đi kèm với sức mạnh lớn là sự phức tạp. Hiểu cách các nhà cung cấp đám mây xử lý mạng sẽ giúp bạn thiết kế các ứng dụng an toàn, có thể mở rộng và khắc phục sự cố kết nối trong môi trường đám mây.

## Điều kiện tiên quyết

- Hiểu biết cơ bản về địa chỉ IP và mạng con
- Làm quen với ít nhất một nhà cung cấp đám mây lớn (AWS, Azure hoặc GCP)
- Kiến thức về tường lửa và các khái niệm an ninh mạng

## Đám mây riêng ảo (VPC)

VPC là mạng riêng của bạn trên đám mây - tách biệt với các khách hàng khác nhưng được kết nối với Internet khi bạn cần.

```
AWS VPC (10.0.0.0/16)
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  Availability Zone A              │         Availability Zone B       │
│  ┌─────────────────────────────┐  │  ┌─────────────────────────────┐  │
│  │     Public Subnet           │  │  │     Public Subnet           │  │
│  │     10.0.1.0/24             │  │  │     10.0.2.0/24             │  │
│  │  ┌─────────┐ ┌─────────┐    │  │  │  ┌─────────┐ ┌─────────┐    │  │
│  │  │   ALB   │ │   NAT   │    │  │  │  │   ALB   │ │   NAT   │    │  │
│  │  │10.0.1.10│ │10.0.1.20│    │  │  │  │10.0.2.10│ │10.0.2.20│    │  │
│  │  └─────────┘ └─────────┘    │  │  │  └─────────┘ └─────────┘    │  │
│  └─────────────────────────────┘  │  └─────────────────────────────┘  │
│  ┌─────────────────────────────┐  │  ┌─────────────────────────────┐  │
│  │     Private Subnet          │  │  │     Private Subnet          │  │
│  │     10.0.10.0/24            │  │  │     10.0.20.0/24            │  │
│  │  ┌─────────┐ ┌─────────┐    │  │  │  ┌─────────┐ ┌─────────┐    │  │
│  │  │  Web-1  │ │  API-1  │    │  │  │  │  Web-2  │ │  API-2  │    │  │
│  │  │10.0.10.1│ │10.0.10.2│    │  │  │  │10.0.20.1│ │10.0.20.2│    │  │
│  │  └─────────┘ └─────────┘    │  │  │  └─────────┘ └─────────┘    │  │
│  └─────────────────────────────┘  │  └─────────────────────────────┘  │
│  ┌─────────────────────────────┐  │  ┌─────────────────────────────┐  │
│  │     Database Subnet         │  │  │     Database Subnet         │  │
│  │     10.0.100.0/28           │  │  │     10.0.100.16/28          │  │
│  │  ┌─────────┐                │  │  │  ┌─────────┐                │  │
│  │  │  RDS    │                │  │  │  │  RDS    │                │  │
│  │  │Primary  │                │  │  │  │Replica  │                │  │
│  │  └─────────┘                │  │  │  └─────────┘                │  │
│  └─────────────────────────────┘  │  └─────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            Internet Gateway
                                    │
                                    ▼
                                Internet

Traffic Flow:
Internet > Internet Gateway > Public Subnet (ALB) > Private Subnet (Apps) > Database Subnet (RDS)
Private Subnet > NAT Gateway > Internet Gateway > Internet (for outbound)
```

Hãy tạo một VPC cơ bản để hiểu các khái niệm:

```bash
# Create a VPC with CLI
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications \
  'ResourceType=vpc,Tags=[{Key=Name,Value=demo-vpc}]'

# Create subnets within the VPC
aws ec2 create-subnet --vpc-id vpc-12345678 --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a --tag-specifications \
  'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet-1a}]'

aws ec2 create-subnet --vpc-id vpc-12345678 --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b --tag-specifications \
  'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet-1b}]'
```

Điều này tạo ra một VPC có hai mạng con ở các vùng sẵn sàng khác nhau để có tính sẵn sàng cao.

### Các loại mạng con

**Mạng con công khai**: Có quyền truy cập internet trực tiếp qua Cổng Internet

```bash
# Create internet gateway
aws ec2 create-internet-gateway --tag-specifications \
  'ResourceType=internet-gateway,Tags=[{Key=Name,Value=demo-igw}]'

# Attach to VPC
aws ec2 attach-internet-gateway --vpc-id vpc-12345678 --internet-gateway-id igw-87654321

# Create route table for public subnet
aws ec2 create-route-table --vpc-id vpc-12345678 --tag-specifications \
  'ResourceType=route-table,Tags=[{Key=Name,Value=public-rt}]'

# Add route to internet gateway
aws ec2 create-route --route-table-id rtb-11111111 \
  --destination-cidr-block 0.0.0.0/0 --gateway-id igw-87654321
```

**Private Subnets**: Không có quyền truy cập internet trực tiếp, sử dụng NAT cho lưu lượng truy cập đi

```bash
# Create NAT gateway in public subnet
aws ec2 create-nat-gateway --subnet-id subnet-public --allocation-id eipalloc-12345

# Create route table for private subnet
aws ec2 create-route-table --vpc-id vpc-12345678 --tag-specifications \
  'ResourceType=route-table,Tags=[{Key=Name,Value=private-rt}]'

# Route private traffic through NAT gateway
aws ec2 create-route --route-table-id rtb-22222222 \
  --destination-cidr-block 0.0.0.0/0 --nat-gateway-id nat-12345678
```

## Nhóm bảo mật so với ACL mạng

Các nhà cung cấp đám mây cung cấp nhiều lớp bảo mật mạng.

### Nhóm bảo mật (Trạng thái)

Các nhóm bảo mật hoạt động giống như tường lửa được gắn vào các phiên bản riêng lẻ:

```bash
# Create security group for web servers
aws ec2 create-security-group --group-name web-servers \
  --description "Security group for web servers" --vpc-id vpc-12345678

# Allow HTTP and HTTPS traffic
aws ec2 authorize-security-group-ingress --group-id sg-web12345 \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress --group-id sg-web12345 \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Allow SSH from management subnet only
aws ec2 authorize-security-group-ingress --group-id sg-web12345 \
  --protocol tcp --port 22 --cidr 10.0.100.0/24
```

Các nhóm bảo mật có trạng thái - nếu bạn cho phép lưu lượng truy cập vào thì lưu lượng quay lại sẽ tự động được cho phép.

### ACL mạng (Không trạng thái)

ACL mạng cung cấp tính năng lọc cấp mạng con:

```bash
# Create custom network ACL
aws ec2 create-network-acl --vpc-id vpc-12345678

# Add rules (must specify both inbound and outbound)
aws ec2 create-network-acl-entry --network-acl-id acl-12345678 \
  --rule-number 100 --protocol tcp --port-range From=80,To=80 \
  --cidr-block 0.0.0.0/0 --rule-action allow

# Add corresponding outbound rule for stateless operation
aws ec2 create-network-acl-entry --network-acl-id acl-12345678 \
  --rule-number 100 --protocol tcp --port-range From=32768,To=65535 \
  --cidr-block 0.0.0.0/0 --rule-action allow --egress
```

ACL mạng không có trạng thái - bạn phải cho phép rõ ràng cả hai hướng lưu lượng truy cập.

## Cân bằng tải đám mây

Các nhà cung cấp đám mây cung cấp dịch vụ cân bằng tải được quản lý.

### Cân bằng tải ứng dụng (AWS)

Cân bằng tải ứng dụng hoạt động ở Lớp 7 và có thể định tuyến dựa trên nội dung:

```bash
# Create application load balancer
aws elbv2 create-load-balancer --name demo-alb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-alb12345

# Create target group
aws elbv2 create-target-group --name web-targets \
  --protocol HTTP --port 80 --vpc-id vpc-12345678 \
  --health-check-path /health

# Register targets
aws elbv2 register-targets --target-group-arn arn:aws:elasticloadbalancing:... \
  --targets Id=i-instance1,Port=80 Id=i-instance2,Port=80

# Create listener
aws elbv2 create-listener --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

### Tính năng cân bằng tải nâng cao

Định tuyến lưu lượng truy cập dựa trên thuộc tính yêu cầu:

```json
{
  "Type": "forward",
  "ForwardConfig": {
    "TargetGroups": [
      {
        "TargetGroupArn": "arn:aws:elasticloadbalancing:...:targetgroup/api-v1/...",
        "Weight": 90
      },
      {
        "TargetGroupArn": "arn:aws:elasticloadbalancing:...:targetgroup/api-v2/...",
        "Weight": 10
      }
    ]
  },
  "Conditions": [
    {
      "Field": "path-pattern",
      "Values": ["/api/*"]
    }
  ]
}
```

Cấu hình này gửi 90% lưu lượng truy cập API tới v1 và 10% đến v2 để triển khai dần dần.

## Mạng nhiều đám mây

Các tổ chức thường sử dụng nhiều nhà cung cấp đám mây để dự phòng hoặc cho các dịch vụ cụ thể.

```
Multi-Cloud Architecture

┌───────────────────────────────────────────────────────────────┐
│                       Internet                                │
└────────────────────┬──────────────────┬───────────────────────┘
                     │                  │
┌────────────────────▼────────────────┐ │ ┌─────────────────────▼───────────┐
│        AWS (us-east-1)              │ │ │         Azure (eastus)          │
│ ┌─────────────────────────────────┐ │ │ │  ┌───────────────────────────┐  │
│ │     VPC (10.1.0.0/16)           │ │ │ │  │     VNet (10.2.0.0/16)    │  │
│ │  ┌─────────┐ ┌─────────┐        │ │ │ │  │  ┌─────────┐ ┌─────────┐  │  │
│ │  │   ALB   │ │   EC2   │        │ │ │ │  │  │   ALB   │ │   VM    │  │  │
│ │  │         │ │ Web App │        │ │ │ │  │  │         │ │ Web App │  │  │
│ │  └─────────┘ └─────────┘        │ │ │ │  │  └─────────┘ └─────────┘  │  │
│ └─────────────────────────────────┘ │ │ │  └───────────────────────────┘  │
└──────────────┬──────────────────────┘ │ └──────────────┬──────────────────┘
               │                        │                │
               │      VPN Tunnel        │                │
               │  (IPSec/Site-to-Site)  │                │
               └────────────────────────┼────────────────┘
                                        │
              ┌─────────────────────────▼──────────────────┐
              │                  GCP (us-central1)         │
              │ ┌───────────────────────────────────────┐  │
              │ │                VPC (10.3.0.0/16)      │  │
              │ │  ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │
              │ │  │   LB    │ │   GKE   │ │Database │  │  │
              │ │  │         │ │Cluster  │ │(Global) │  │  │
              │ │  └─────────┘ └─────────┘ └─────────┘  │  │
              │ └───────────────────────────────────────┘  │
              └────────────────────────────────────────────┘

Connectivity Matrix:
AWS ←→ Azure: VPN Gateway (IPSec)
AWS ←→ GCP:   Cloud Interconnect
Azure ←→ GCP: ExpressRoute + Cloud Interconnect
All ←→ Users: Global DNS (Route 53/Traffic Manager/Cloud DNS)
```

### Kết nối VPN

Kết nối VPC của bạn với các nhà cung cấp đám mây:

```bash
# AWS: Create VPN gateway
aws ec2 create-vpn-gateway --type ipsec.1

# Create customer gateway (representing your on-premises or other cloud)
aws ec2 create-customer-gateway --type ipsec.1 \
  --public-ip 203.0.113.12 --bgp-asn 65000

# Create VPN connection
aws ec2 create-vpn-connection --type ipsec.1 \
  --customer-gateway-id cgw-12345678 --vpn-gateway-id vgw-87654321
```

### Ngang hàng VPC

Kết nối các VPC trong cùng một nhà cung cấp đám mây:

```bash
# Create peering connection between VPCs
aws ec2 create-vpc-peering-connection \
  --vpc-id vpc-12345678 --peer-vpc-id vpc-87654321

# Accept the peering connection
aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id pcx-12345678

# Update route tables to enable communication
aws ec2 create-route --route-table-id rtb-11111111 \
  --destination-cidr-block 10.1.0.0/16 --vpc-peering-connection-id pcx-12345678
```

## Dịch vụ DNS đám mây

Các nhà cung cấp đám mây cung cấp dịch vụ DNS được quản lý với các tính năng nâng cao.

### Định tuyến nâng cao Route 53 (AWS)

Định tuyến dựa trên sức khỏe sẽ tự động loại bỏ các điểm cuối không lành mạnh:

```json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.example.com",
        "Type": "A",
        "SetIdentifier": "primary",
        "TTL": 60,
        "ResourceRecords": [{ "Value": "203.0.113.10" }],
        "HealthCheckId": "12345678-1234-1234-1234-123456789012"
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.example.com",
        "Type": "A",
        "SetIdentifier": "secondary",
        "TTL": 60,
        "ResourceRecords": [{ "Value": "203.0.113.20" }],
        "HealthCheckId": "87654321-4321-4321-4321-210987654321",
        "Failover": "SECONDARY"
      }
    }
  ]
}
```

### Định tuyến định vị địa lý

Định tuyến người dùng đến trung tâm dữ liệu gần nhất:

```bash
# Create records for different geographic locations
aws route53 change-resource-record-sets --hosted-zone-id Z12345678 --change-batch '{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.example.com",
        "Type": "A",
        "SetIdentifier": "US-East",
        "GeoLocation": {"ContinentCode": "NA"},
        "TTL": 300,
        "ResourceRecords": [{"Value": "203.0.113.10"}]
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.example.com",
        "Type": "A",
        "SetIdentifier": "Europe",
        "GeoLocation": {"ContinentCode": "EU"},
        "TTL": 300,
        "ResourceRecords": [{"Value": "203.0.113.20"}]
      }
    }
  ]
}'
```

## Mạng container trên đám mây

Nền tảng đám mây cung cấp mạng chuyên dụng cho container.

### Mạng AWS EKS

EKS sử dụng plugin Amazon VPC CNI cho mạng pod:

```yaml
# aws-node-daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: aws-node
  namespace: kube-system
spec:
  template:
    spec:
      containers:
        - name: aws-node
          image: amazon/amazon-k8s-cni:v1.11.4
          env:
            - name: AWS_VPC_K8S_CNI_VETHPREFIX
              value: eni
            - name: AWS_VPC_ENI_MTU
              value: '9001'
            - name: AWS_VPC_K8S_CNI_LOG_LEVEL
              value: DEBUG
```

Mỗi pod nhận được một địa chỉ IP từ phạm vi mạng con VPC của bạn:

```bash
# Check pod IP addresses
kubectl get pods -o wide

# Pods can be reached directly from other VPC resources
aws ec2 describe-instances --filters "Name=private-ip-address,Values=10.0.1.100"
```

### Lưới dịch vụ trên đám mây

Các nhà cung cấp đám mây cung cấp dịch vụ lưới dịch vụ được quản lý:

```yaml
# AWS App Mesh virtual service
apiVersion: appmesh.k8s.aws/v1beta2
kind: VirtualService
metadata:
  name: productpage
  namespace: bookinfo
spec:
  awsName: productpage
  provider:
    virtualRouter:
      virtualRouterRef:
        name: productpage-router
```

## Giám sát mạng đám mây

Các nhà cung cấp đám mây cung cấp khả năng giám sát và ghi nhật ký mạng rộng rãi.

### Nhật ký luồng VPC

Nắm bắt lưu lượng mạng để phân tích:

```bash
# Enable VPC Flow Logs
aws ec2 create-flow-logs --resource-type VPC --resource-ids vpc-12345678 \
  --traffic-type ALL --log-destination-type cloud-watch-logs \
  --log-group-name VPCFlowLogs

# Query flow logs
aws logs filter-log-events --log-group-name VPCFlowLogs \
  --filter-pattern '[version, account, eni, source, destination, srcport, destport="22", protocol="6", packets, bytes, windowstart, windowend, action="REJECT", flowlogstatus]'
```

Truy vấn này tìm thấy các lần thử kết nối SSH bị từ chối.

### Thông tin chi tiết về mạng CloudWatch

Giám sát hiệu suất ứng dụng trên các ranh giới mạng:

```bash
# Create network insights path
aws ec2 create-network-insights-path \
  --source i-instance1 --destination i-instance2 \
  --protocol tcp --destination-port 443

# Analyze the path
aws ec2 start-network-insights-analysis --network-insights-path-id nip-12345678
```

## Tối ưu hóa chi phí đám mây

Mạng đám mây có thể tạo ra chi phí đáng kể.

### Chi phí truyền dữ liệu

Hiểu cách hoạt động của giá truyền dữ liệu:

```bash
# Same AZ: Usually free
# Same region, different AZ: ~$0.01/GB
# Different regions: ~$0.02/GB
# Internet egress: ~$0.09/GB (first 1TB free per month)
```

Tối ưu hóa bằng cách:

- Giữ các dịch vụ liên quan trong cùng một AZ khi có thể
- Sử dụng CloudFront hoặc CDN khác cho nội dung tĩnh
- Nén dữ liệu trước khi truyền

### Các lựa chọn thay thế cổng NAT

NAT Gateway tính phí xử lý dữ liệu:

```bash
# Instead of NAT Gateway for all traffic
# Use VPC endpoints for AWS services
aws ec2 create-vpc-endpoint --vpc-id vpc-12345678 \
  --service-name com.amazonaws.us-east-1.s3 \
  --route-table-ids rtb-11111111

# This allows direct access to S3 without NAT Gateway costs
```

## Khắc phục sự cố mạng đám mây

Các sự cố mạng đám mây yêu cầu gỡ lỗi có hệ thống.

### Kiểm tra kết nối

Kiểm tra kết nối từng bước:

```bash
# 1. Can the instance reach the internet?
curl -I http://google.com

# 2. Can it reach other instances in the VPC?
ping 10.0.1.100

# 3. Are security groups allowing the traffic?
aws ec2 describe-security-groups --group-ids sg-12345678

# 4. Are network ACLs blocking traffic?
aws ec2 describe-network-acls --network-acl-ids acl-12345678

# 5. Is the route table configured correctly?
aws ec2 describe-route-tables --route-table-ids rtb-11111111
```

### Phân tích nhật ký dòng chảy

Sử dụng nhật ký lưu lượng để hiểu các mẫu lưu lượng truy cập:

```bash
# Analyze rejected connections
aws logs filter-log-events --log-group-name VPCFlowLogs \
  --filter-pattern '[version, account, eni, source, destination, srcport, destport, protocol, packets, bytes, windowstart, windowend, action="REJECT", flowlogstatus]' \
  --start-time $(date -d '1 hour ago' +%s)000
```

### Kiểm tra tình trạng cân bằng tải

Gỡ lỗi lỗi kiểm tra tình trạng cân bằng tải:

```bash
# Check target health
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:...

# Review load balancer logs
aws s3 ls s3://my-alb-logs/AWSLogs/123456789012/elasticloadbalancing/us-east-1/
```

## Kiến trúc đa vùng

Thiết kế các ứng dụng trải rộng trên nhiều vùng địa lý.

### Sao chép cơ sở dữ liệu

Thiết lập sao chép cơ sở dữ liệu liên vùng:

```bash
# RDS read replica in different region
aws rds create-db-instance-read-replica \
  --db-instance-identifier replica-west \
  --source-db-instance-identifier arn:aws:rds:us-east-1:123456789012:db:primary-db \
  --db-instance-class db.r5.large
```

### Cân bằng tải toàn cầu

Sử dụng Tuyến 53 để phân phối lưu lượng truy cập toàn cầu:

```json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "app.example.com",
        "Type": "A",
        "SetIdentifier": "us-east-1",
        "Latency": "us-east-1",
        "TTL": 60,
        "ResourceRecords": [{ "Value": "203.0.113.10" }]
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "app.example.com",
        "Type": "A",
        "SetIdentifier": "us-west-2",
        "Latency": "us-west-2",
        "TTL": 60,
        "ResourceRecords": [{ "Value": "203.0.113.20" }]
      }
    }
  ]
}
```

## Thực tiễn tốt nhất về bảo mật

Bảo mật mạng đám mây yêu cầu nhiều lớp bảo vệ.

### Phân đoạn mạng

Sử dụng nhiều VPC để cách ly:

```bash
# Production VPC: 10.0.0.0/16
# Staging VPC: 10.1.0.0/16
# Development VPC: 10.2.0.0/16
# Management VPC: 10.3.0.0/16

# Connect with peering or transit gateway as needed
```

### Nguyên lý của đặc quyền tối thiểu

Chỉ cho phép truy cập mạng cần thiết:

```bash
# Instead of allowing all traffic from a subnet
aws ec2 authorize-security-group-ingress --group-id sg-12345678 \
  --protocol tcp --port 5432 --cidr 10.0.0.0/24

# Allow only from specific security group
aws ec2 authorize-security-group-ingress --group-id sg-db12345 \
  --protocol tcp --port 5432 --source-group sg-app12345
```

Trong phần tiếp theo, chúng ta sẽ khám phá các công cụ giám sát và khắc phục sự cố mạng giúp bạn duy trì khả năng hiển thị đối với cơ sở hạ tầng mạng tại chỗ và đám mây của mình.

Mạng đám mây cung cấp các khả năng mạnh mẽ nhưng độ phức tạp tăng theo quy mô. Bắt đầu đơn giản, ghi lại kiến trúc của bạn và dần dần thêm các tính năng nâng cao khi nhu cầu của bạn tăng lên.

Chúc bạn kết nối mạng đám mây vui vẻ!
