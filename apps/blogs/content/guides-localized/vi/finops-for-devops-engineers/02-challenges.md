---
title: "Những thách thức chung về chi phí đám mây dành cho nhóm DevOps"
description: Xác định và hiểu các vấn đề chi phí đám mây thường gặp nhất mà nhóm DevOps gặp phải và lý do chúng xảy ra.
order: 2
---

Các nhóm DevOps phải đối mặt với những thách thức đặc biệt về chi phí trên đám mây xuất phát từ sự giao thoa giữa các phương pháp triển khai nhanh chóng, mô hình định giá trên đám mây phức tạp và quy trình tài chính truyền thống. Hiểu được những thách thức này giúp bạn xác định các cơ hội tối ưu hóa chi phí và ngăn ngừa những cạm bẫy thường gặp.

## Cung cấp quá mức: Vấn đề "Chỉ để được an toàn"

Cung cấp quá mức xảy ra khi các nhóm phân bổ nhiều nguồn lực hơn mức cần thiết thực sự, thường là để bảo hiểm cho các vấn đề về hiệu suất. Cách làm này bắt nguồn từ tư duy tại chỗ, trong đó việc bổ sung năng lực đòi hỏi các quy trình mua sắm kéo dài.

### Tại sao việc cung cấp quá mức lại xảy ra

**Sợ các vấn đề về hiệu suất**: Các nhóm thường chọn kích thước phiên bản lớn hơn để tránh tình trạng chậm có thể xảy ra, đặc biệt là đối với các ứng dụng hướng tới khách hàng.

**Thiếu kiến thức xác định kích thước phù hợp**: Nếu không có dữ liệu sử dụng rõ ràng, các nhóm sẽ đưa ra những phỏng đoán có căn cứ và có xu hướng phân bổ quá mức.

**Phương pháp tiếp cận một kích cỡ phù hợp cho tất cả**: Sử dụng cùng một loại phiên bản cho tất cả các môi trường, ngay cả khi quá trình phát triển và staging không cần tài nguyên ở cấp độ production.

Đây là một ví dụ điển hình về việc cung cấp quá mức trong Terraform:

```terraform
# Common over-provisioning pattern
resource "aws_instance" "web" {
  count         = 3
  ami           = "ami-0abcdef1234567890"
  instance_type = "m5.2xlarge"  # Often oversized for actual needs

  tags = {
    Name = "web-server-${count.index}"
    Environment = var.environment
  }
}

# Data volume that's larger than needed
resource "aws_ebs_volume" "data" {
  availability_zone = "us-west-2a"
  size              = 1000  # Often allocated based on worst-case estimates
  type              = "gp3"

  tags = {
    Name = "application-data"
  }
}
```

### Tác động chi phí thực

Cung cấp quá mức các hợp chất một cách nhanh chóng trên các môi trường và nhóm. Một phiên bản production có kích thước quá lớn có thể tốn thêm 200 USD/tháng, nhưng khi được nhân rộng trên các môi trường phát triển, staging và production cho nhiều nhóm, sự lãng phí sẽ trở nên đáng kể.

**ETính toán mẫu:**

- production: 3 x m5.2xlarge ($0,384/giờ) = $829/tháng
- Kích thước phù hợp: 3 x m5.large ($0,096/giờ) = $207/tháng
- **Lãng phí hàng tháng: $622 cho mỗi ứng dụng**

### Xác định việc cung cấp quá mức

Bạn có thể xác định các tài nguyên được cung cấp quá mức bằng cách theo dõi các số liệu sử dụng:

```bash
# AWS CLI command to get EC2 CPU utilization for the last 30 days
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --start-time $(date -d '30 days ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average,Maximum
```

Các tài nguyên luôn chạy ở mức sử dụng CPU dưới 40% là ứng cử viên cho việc định cỡ phù hợp.

## Tài nguyên Zombie: Việc tiêu tốn chi phí tiềm ẩn

Tài nguyên zombie là tài nguyên đám mây tiếp tục chạy và tạo ra các khoản phí rất lâu sau khi cần đến. Những điều này thường là kết quả của quy trình phát triển, thử nghiệm hoặc quá trình dọn dẹp không thành công.

### Các loại tài nguyên Zombie phổ biến

**Môi trường phát triển bị lãng quên**: Môi trường tạm thời được tạo để thử nghiệm và không bao giờ được dọn sạch.

**Orphaned Load Balancers**: Cân bằng tải tiếp tục chạy sau khi phiên bản mục tiêu của chúng bị chấm dứt.

**Khối lượng lưu trữ chưa sử dụng**: EBS volume, nhóm S3 hoặc ảnh chụp nhanh cơ sở dữ liệu không còn được đính kèm với tài nguyên đang hoạt động.

Cơ sở dữ liệu **Idle**: Các phiên bản cơ sở dữ liệu được tạo để thử nghiệm và chạy vô thời hạn.

Dưới đây là ví dụ về cách tích lũy tài nguyên zombie trong quy trình phát triển điển hình:

```bash
# Developer creates a feature branch environment
git checkout -b feature/new-payment-flow
terraform workspace new feature-payment-flow
terraform apply  # Spins up full infrastructure

# Feature gets merged and deployed
git checkout main
git branch -d feature/new-payment-flow

# Terraform workspace and infrastructure remain running
# Monthly cost: $150-500 depending on services
```

### Vấn đề phát hiện Zombie

Zombie rất khó phát hiện vì:

- Họ thường có mức sử dụng tối thiểu, tránh các cảnh báo giám sát cơ bản
- Thẻ tài nguyên có thể không chỉ rõ mục đích hoặc quyền sở hữu của chúng
- Nhóm phát triển có thể sợ xóa tài nguyên mà họ không hiểu đầy đủ

### Triển khai phát hiện Zombie

Chìa khóa để phát hiện zombie là kết hợp siêu dữ liệu tài nguyên với các kiểu sử dụng. Bạn muốn xác định các tài nguyên đang chạy nhưng không thực sự được sử dụng hiệu quả.

Một cách tiếp cận đơn giản tập trung vào hai chỉ số chính:

- **age**: Tài nguyên đã chạy trong thời gian dài
- **Utilization**: Hoạt động của CPU, mạng hoặc ổ đĩa rất thấp

Đây là đoạn mã thực tế giúp xác định các phiên bản EC2 zombie tiềm năng bằng cách kiểm tra các tiêu chí sau:

```python
import boto3
from datetime import datetime, timedelta

def find_zombie_instances():
    """Find EC2 instances that might be zombies based on age and low utilization"""
    ec2 = boto3.client('ec2')
    cloudwatch = boto3.client('cloudwatch')

    # Get all running instances
    instances = ec2.describe_instances(
        Filters=[{'Name': 'instance-state-name', 'Values': ['running']}]
    )

    zombies = []

    for reservation in instances['Reservations']:
        for instance in reservation['Instances']:
            instance_id = instance['InstanceId']
            launch_time = instance['LaunchTime']

            # Check if instance is older than 30 days
            days_running = (datetime.now(launch_time.tzinfo) - launch_time).days
            if days_running > 30:

                # Check average CPU over the last week
                avg_cpu = get_average_cpu_utilization(cloudwatch, instance_id)

                # Flag as potential zombie if very low CPU usage
                if avg_cpu is not None and avg_cpu < 5:
                    zombies.append({
                        'InstanceId': instance_id,
                        'DaysRunning': days_running,
                        'AvgCPU': avg_cpu
                    })

    return zombies

def get_average_cpu_utilization(cloudwatch, instance_id):
    """Get average CPU utilization for an instance over the last 7 days"""
    try:
        response = cloudwatch.get_metric_statistics(
            Namespace='AWS/EC2',
            MetricName='CPUUtilization',
            Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
            StartTime=datetime.now() - timedelta(days=7),
            EndTime=datetime.now(),
            Period=3600,  # 1 hour periods
            Statistics=['Average']
        )

        if response['Datapoints']:
            return sum(dp['Average'] for dp in response['Datapoints']) / len(response['Datapoints'])
        return None
    except Exception as e:
        print(f"Could not get metrics for {instance_id}: {e}")
        return None
```

Tập lệnh này xác định các phiên bản đã chạy hơn 30 ngày với mức sử dụng CPU trung bình dưới 5%. Bạn có thể tùy chỉnh các ngưỡng này dựa trên môi trường của bạn.

Để sử dụng điều này một cách hiệu quả:

1. Chạy nó hàng tuần như một phần của thói quen tối ưu hóa chi phí của bạn
2. Xem lại các trường hợp được gắn cờ trước khi thực hiện hành động - một số trường hợp có thể có mức sử dụng thấp hợp pháp
3. Hãy cân nhắc thêm các bước kiểm tra về việc sử dụng mạng hoặc ổ đĩa để có độ chính xác cao hơn
4. Luôn xác minh với chủ sở hữu tài nguyên trước khi chấm dứt bất kỳ điều gì

## Thiếu phân bổ chi phí: Vấn đề tài khoản dùng chung

Nhiều tổ chức sử dụng tài khoản đám mây được chia sẻ trên nhiều nhóm, dự án hoặc môi trường. Nếu không có sự phân bổ chi phí phù hợp thì sẽ không thể hiểu được nhóm hoặc dự án nào đang thúc đẩy chi phí.

### Tại sao phân bổ chi phí không thành công

**Gắn thẻ không nhất quán**: Các nhóm sử dụng các quy ước gắn thẻ khác nhau hoặc quên gắn thẻ toàn bộ tài nguyên.

**Tài nguyên được chia sẻ**: Các thành phần cơ sở hạ tầng như kết nối mạng hoặc giám sát phục vụ nhiều ứng dụng.

**Resource Sprawl**: Khi các nhóm mở rộng quy mô, việc theo dõi quyền sở hữu tài nguyên ngày càng trở nên khó khăn.

### Tác động kinh doanh

Không có phân bổ chi phí:

- Các nhóm không thể đưa ra quyết định sáng suốt về chi phí tính năng
- Bộ phận tài chính không thể phân bổ chi tiêu trên đám mây cho ngân sách phù hợp
- Những nỗ lực tối ưu hóa chi phí thiếu các ưu tiên rõ ràng
- Trách nhiệm giải trình chi tiêu trên đám mây trở nên phổ biến

### Triển khai phân bổ chi phí hiệu quả

Chiến lược gắn thẻ mạnh mẽ là điều cần thiết để phân bổ chi phí:

```terraform
# Terraform locals for consistent tagging
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    Team        = var.team_name
    Owner       = var.owner_email
    CostCenter  = var.cost_center
    ManagedBy   = "terraform"
    CreatedDate = formatdate("YYYY-MM-DD", timestamp())
  }
}

# Apply tags consistently across all resources
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type

  tags = merge(local.common_tags, {
    Name        = "${var.project_name}-web-${var.environment}"
    Component   = "web-server"
    Billable    = "true"
  })
}

resource "aws_s3_bucket" "assets" {
  bucket = "${var.project_name}-assets-${var.environment}"

  tags = merge(local.common_tags, {
    Component = "static-assets"
    Backup    = "daily"
  })
}
```

### Thực thi thẻ tự động

Sử dụng chính sách của nhà cung cấp đám mây để thực thi các yêu cầu gắn thẻ:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Action": ["ec2:RunInstances"],
      "Resource": ["arn:aws:ec2:*:*:instance/*"],
      "Condition": {
        "Null": {
          "aws:RequestedRegion": "false",
          "ec2:ResourceTag/Project": "true",
          "ec2:ResourceTag/Environment": "true",
          "ec2:ResourceTag/Team": "true"
        }
      }
    }
  ]
}
```

Chính sách IAM này ngăn việc khởi chạy các phiên bản EC2 mà không có thẻ bắt buộc.

## Chi phí phát triển và chẵn lẻ production

Nhiều nhóm phản ánh môi trường production để phát triển và staging, dẫn đến chi phí không cần thiết cho khối lượng công việc không phải production không yêu cầu tài nguyên cấp production.

### Cái bẫy phản chiếu

**Database Sizing**: Chạy cơ sở dữ liệu có kích thước production trong môi trường phát triển
**Triển khai Multi-AZ**: Sử dụng cấu hình có tính sẵn sàng cao trong môi trường một nhà phát triển
**Storage Replication**: Duy trì cài đặt sao lưu và sao chép production trong môi trường thử nghiệm

### Mở rộng môi trường thông minh

Triển khai các cấu hình dành riêng cho môi trường:

```terraform
# Variable-driven resource sizing based on environment
variable "environment_configs" {
  type = map(object({
    instance_type     = string
    min_capacity      = number
    max_capacity      = number
    multi_az          = bool
    backup_retention  = number
  }))

  default = {
    production = {
      instance_type     = "m5.xlarge"
      min_capacity      = 2
      max_capacity      = 10
      multi_az          = true
      backup_retention  = 30
    }
    staging = {
      instance_type     = "m5.large"
      min_capacity      = 1
      max_capacity      = 3
      multi_az          = false
      backup_retention  = 7
    }
    development = {
      instance_type     = "t3.medium"
      min_capacity      = 1
      max_capacity      = 2
      multi_az          = false
      backup_retention  = 1
    }
  }
}

# Use environment-specific configuration
locals {
  config = var.environment_configs[var.environment]
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project}-${var.environment}"
  engine         = "postgres"
  engine_version = "13.7"
  instance_class = "db.${local.config.instance_type}"

  allocated_storage     = local.config.storage_size
  max_allocated_storage = local.config.max_storage_size

  multi_az               = local.config.multi_az
  backup_retention_period = local.config.backup_retention

  tags = local.common_tags
}
```

### Quản lý tài nguyên theo lịch trình

Triển khai lập lịch tự động cho các môi trường không phải production:

```bash
# Bash script to stop non-production resources during off-hours
#!/bin/bash

# Stop development environment instances at 6 PM weekdays
if [[ $(date +%u) -le 5 ]] && [[ $(date +%H) -eq 18 ]]; then
    aws ec2 stop-instances --instance-ids \
        $(aws ec2 describe-instances \
            --filters "Name=tag:Environment,Values=development" \
                     "Name=instance-state-name,Values=running" \
            --query 'Reservations[].Instances[].InstanceId' \
            --output text)
fi

# Start development environment instances at 8 AM weekdays
if [[ $(date +%u) -le 5 ]] && [[ $(date +%H) -eq 8 ]]; then
    aws ec2 start-instances --instance-ids \
        $(aws ec2 describe-instances \
            --filters "Name=tag:Environment,Values=development" \
                     "Name=instance-state-name,Values=stopped" \
            --query 'Reservations[].Instances[].InstanceId' \
            --output text)
fi
```

Cách tiếp cận này có thể giảm 60-70% chi phí môi trường phát triển bằng cách chỉ chạy tài nguyên trong giờ làm việc.
