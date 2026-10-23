---
title: "Hiểu nguyên tắc FinOps"
description: Tìm hiểu các nguyên tắc cốt lõi của FinOps và cách chúng áp dụng vào quy trình làm việc DevOps thực tế để tối ưu hóa chi phí.
order: 1
---

FinOps hoạt động dựa trên ba nguyên tắc cơ bản phù hợp một cách tự nhiên với thực tiễn DevOps. Hiểu những nguyên tắc này sẽ giúp bạn thực hiện tối ưu hóa chi phí theo những cách nâng cao thay vì cản trở quy trình công việc kỹ thuật của bạn.

## Ba trụ cột của FinOps

### Khả năng hiển thị: Bạn không thể tối ưu hóa những gì bạn không thể thấy

Hóa đơn trên đám mây nổi tiếng là khó hiểu. Một hóa đơn AWS có thể bao gồm hàng trăm dịch vụ trên nhiều khu vực với mức phí thay đổi theo giờ, bậc sử dụng và mức độ cam kết. Nếu không có tầm nhìn rõ ràng về những yếu tố thúc đẩy chi phí thì việc tối ưu hóa sẽ chỉ là phỏng đoán.

Đối với các nhóm DevOps, khả năng hiển thị có nghĩa là:

- **Theo dõi chi phí cấp tài nguyên**: Biết chi phí của từng dịch vụ, môi trường và tính năng
- **Giám sát chi phí theo thời gian thực**: Tìm hiểu chi tiêu khi nó diễn ra, không phải vài tuần sau
- **Phân bổ chi phí**: Kết nối chi tiêu trên đám mây với các nhóm, dự án hoặc doanh nghiệp cụ thể hàm

Đây là khả năng hiển thị tốt trong thực tế:

```bash
# Example: Using AWS CLI to get daily cost breakdown by service
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-15 \
  --granularity DAILY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

Lệnh này hiển thị chi phí hàng ngày được chia nhỏ theo dịch vụ AWS, giúp bạn nhanh chóng xác định xu hướng và mức tăng đột biến.

### Tối ưu hóa: Cải tiến liên tục cho chi tiêu trên đám mây

Tối ưu hóa trong FinOps không phải là dự án chỉ thực hiện một lần - đó là một quá trình liên tục nhằm tìm kiếm và loại bỏ lãng phí đồng thời nâng cao hiệu quả. Điều này hoàn toàn phù hợp với các nguyên tắc cải tiến và tự động hóa liên tục của DevOps.

Cơ hội tối ưu hóa đám mây thường rơi vào ba loại:

1. **Right-sizing**: Dung lượng tài nguyên phù hợp với nhu cầu thực tế
2. **Lập lịch tài nguyên**: Tắt các tài nguyên không phải production khi không cần thiết
3. **Tối ưu hóa cam kết**: Sử dụng phiên bản dự trữ, gói tiết kiệm hoặc phiên bản giao ngay một cách thích hợp

Dưới đây là ví dụ về tự động điều chỉnh kích thước phù hợp bằng Terraform và AWS:

```terraform
# Terraform configuration that adjusts instance size based on utilization metrics
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "ec2-high-cpu-${var.instance_name}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"

  dimensions = {
    InstanceId = aws_instance.web.id
  }

  alarm_actions = [aws_sns_topic.scaling_alerts.arn]
}

# Auto Scaling Group that responds to the alarm
resource "aws_autoscaling_group" "web" {
  name                = "web-asg"
  vpc_zone_identifier = var.subnet_ids
  target_group_arns   = [aws_lb_target_group.web.arn]
  health_check_type   = "ELB"

  min_size         = 1
  max_size         = 10
  desired_capacity = 2

  launch_template {
    id      = aws_launch_template.web.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "web-server"
    propagate_at_launch = true
  }
}
```

Cấu hình này tự động điều chỉnh quy mô tài nguyên dựa trên nhu cầu, đảm bảo bạn không phải trả tiền cho dung lượng không sử dụng.

### Quản trị: Lan can không cần gác cổng

Quản trị trong FinOps có nghĩa là thiết lập các chính sách và biện pháp kiểm soát nhằm ngăn chặn những bất ngờ về chi phí trong khi vẫn duy trì tốc độ phát triển. Không giống như quản trị CNTT truyền thống, quản trị FinOps phải được tự động hóa và không bị chặn bất cứ khi nào có thể.

Quản trị hiệu quả bao gồm:

- **Cảnh báo ngân sách**: Thông báo tự động khi chi tiêu đạt đến giới hạn
- **Kiểm soát chi phí**: Ngăn chặn việc vô tình triển khai các tài nguyên đắt tiền
- **Chính sách gắn thẻ**: Đảm bảo tài nguyên có thể được phân bổ và quản lý hợp lý
- **Quy trình phê duyệt**: Yêu cầu xem xét các thay đổi có chi phí cao

Dưới đây là ví dụ về triển khai quản trị chi phí trong CI/CD pipeline:

```yaml
# GitHub Actions workflow that includes cost estimation
name: Infrastructure Deployment
on:
  pull_request:
    paths: ['terraform/**']

jobs:
  cost-estimate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Infracost
        uses: infracost/actions/setup@v2
        with:
          api-key: ${{ secrets.INFRACOST_API_KEY }}

      - name: Generate cost estimate
        run: |
          cd terraform
          infracost breakdown --path . --format json --out-file /tmp/infracost.json

      - name: Check cost increase
        run: |
          # Fail if monthly cost increase exceeds $500
          COST_INCREASE=$(jq -r '.diffTotalMonthlyCost' /tmp/infracost.json)
          if (( $(echo "$COST_INCREASE > 500" | bc -l) )); then
            echo "Cost increase of $COST_INCREASE exceeds threshold"
            exit 1
          fi

      - name: Post cost comment
        uses: infracost/actions/comment@v1
        with:
          path: /tmp/infracost.json
          behavior: update
```

Quy trình công việc này tự động ước tính tác động chi phí của những thay đổi về cơ sở hạ tầng và chặn các hoạt động triển khai vượt quá ngưỡng xác định.

## Mô hình hoạt động FinOps

FinOps tuân theo mô hình hoạt động ba giai đoạn lặp lại liên tục:

### Giai đoạn thông báo: Xây dựng nhận thức

Giai đoạn cung cấp thông tin tập trung vào việc tạo ra sự minh bạch về chi phí và xây dựng nhận thức về tổ chức. Đối với các nhóm DevOps, điều này có nghĩa là:

- Thiết lập bảng điều khiển giám sát chi phí
- Triển khai gắn thẻ tài nguyên thích hợp
- Lập báo cáo phân bổ chi phí
- Thiết lập các chỉ số cơ bản

### Giai đoạn tối ưu hóa: Hành động

Khi bạn đã có khả năng hiển thị, giai đoạn tối ưu hóa bao gồm việc thực hiện các hành động cụ thể để giảm chi phí:

- Định cỡ phù hợp các nguồn lực chưa được sử dụng đúng mức
- Loại bỏ chất thải và tài nguyên không sử dụng
- Thực hiện tối ưu hóa chi phí tự động
- Đàm phán mức giá tốt hơn với các nhà cung cấp đám mây

### Giai đoạn vận hành: Thiết lập các hoạt động liên tục

Giai đoạn vận hành đưa tối ưu hóa chi phí vào các hoạt động thông thường:

- Đánh giá chi phí thường xuyên và chu kỳ tối ưu hóa
- Kiểm soát và quản lý chi phí tự động
- Những thay đổi về văn hóa tạo nên thói quen nhận thức về chi phí
- Cải tiến liên tục các hoạt động FinOps

## Mức độ trưởng thành của FinOps

Các tổ chức thường tiến triển qua ba cấp độ trưởng thành:

**Crawl**: Hiển thị chi phí cơ bản và tối ưu hóa thủ công

- Báo cáo chi phí hàng tháng
- Dọn dẹp tài nguyên thủ công
- Triển khai gắn thẻ cơ bản

**Walk**: Tối ưu hóa tự động và quản lý chi phí chủ động

- Giám sát chi phí theo thời gian thực
- Lập kế hoạch tài nguyên tự động
- Phân bổ chi phí theo nhóm hoặc dự án

**Run**: Tối ưu hóa nâng cao và văn hóa nhận biết chi phí

- Mô hình dự đoán chi phí
- Tối ưu hóa tự động ở quy mô
- Cân nhắc chi phí trong tất cả các quyết định kỹ thuật

Hầu hết các tổ chức đều bắt đầu ở cấp độ thu thập thông tin và dần dần xây dựng khả năng. Điều quan trọng là đạt được tiến bộ ổn định thay vì cố gắng thực hiện mọi thứ cùng một lúc.

## Căn chỉnh FinOps với các giá trị DevOps

FinOps chia sẻ các giá trị cốt lõi với DevOps:

- **Collaboration**: Phá vỡ rào cản giữa kỹ thuật và tài chính
- **Automation**: Sử dụng các công cụ để loại bỏ các quy trình thủ công
- **Measurement**: Đưa ra quyết định dựa trên dữ liệu thay vì giả định
- **Cải tiến liên tục**: Lặp lại và cải tiến theo thời gian
- **Trách nhiệm chung**: Khiến mọi người phải chịu trách nhiệm về kết quả

Những giá trị được chia sẻ này làm cho FinOps trở thành một phần mở rộng tự nhiên của các hoạt động DevOps chứ không phải là một gánh nặng bổ sung.
