---
title: "Quản lý tài nguyên và mở rộng quy mô"
description: Tìm hiểu cách tối ưu hóa phân bổ tài nguyên và triển khai các chiến lược mở rộng quy mô hiệu quả trong Kubernetes
order: 8
---

Quản lý tài nguyên hiệu quả là rất quan trọng để chạy các cụm Kubernetes hiệu quả, tiết kiệm chi phí và đáng tin cậy. Trong phần này, chúng ta sẽ tìm hiểu cách phân bổ tài nguyên điện toán cho khối lượng công việc của bạn, triển khai các chiến lược mở rộng quy mô khác nhau và tối ưu hóa hiệu suất tổng thể của cụm.

## Tìm hiểu về quản lý tài nguyên Kubernetes

Kubernetes lên lịch cho pod dựa trên các tài nguyên có sẵn. Khi bạn chỉ định các yêu cầu tài nguyên cho container của mình, bộ lập lịch có thể đưa ra quyết định tốt hơn về việc nên đặt pod của bạn vào nút nào.

### Yêu cầu và giới hạn tài nguyên

Hai điều khiển tài nguyên chính trong Kubernetes là yêu cầu và giới hạn:

- **Requests**: Lượng tài nguyên tối thiểu mà container cần
- **Limits**: Lượng tài nguyên tối đa mà container có thể sử dụng

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
    - name: app
      image: nginx
      resources:
        requests:
          memory: '64Mi'
          cpu: '250m'
        limits:
          memory: '128Mi'
          cpu: '500m'
```

Trong ví dụ này:

- container yêu cầu 64MiB bộ nhớ và 0,25 lõi CPU
- container được giới hạn ở 128MiB bộ nhớ và 0,5 lõi CPU

### Tài nguyên CPU

Tài nguyên CPU được đo bằng đơn vị CPU:

- 1 đơn vị CPU = 1 lõi vật lý hoặc ảo
- Có thể được biểu thị dưới dạng giá trị thập phân
- Thường được chỉ định bằng millicores (m), trong đó 1000m = 1 CPU

Ví dụ:

- `100m` = 0,1 CPU (10% lõi)
- `500m` = 0,5 CPU (50% lõi)
- `2` = 2 CPU (2 lõi đầy đủ)

### Tài nguyên bộ nhớ

Bộ nhớ được đo bằng byte và bạn có thể sử dụng các hậu tố sau:

- `Ki` hoặc `K`: Kibibyte (1024 byte)
- `Mi` hoặc `M`: Mebibyte (1024 Ki)
- `Gi` hoặc `G`: Gibibyte (1024 Mi)
- `Ti` hoặc `T`: Tebibyte (1024 Gi)

Ví dụ:

- `256Mi` = 256 Mebibyte
- `1Gi` = 1 Gibibyte

### Hành vi tài nguyên

Cách Kubernetes xử lý các yêu cầu và giới hạn tài nguyên:

1. **CPU (Tài nguyên có thể nén)**:
   - Nếu container vượt quá giới hạn CPU, nó sẽ bị điều chỉnh nhưng không bị chấm dứt
   - Yêu cầu CPU đảm bảo lượng thời gian CPU tối thiểu
2. **Bộ nhớ (Tài nguyên không thể nén)**:
   - Nếu container vượt quá giới hạn bộ nhớ, nó có thể bị chấm dứt (OOMKilled)
   - Yêu cầu bộ nhớ được sử dụng để lập kế hoạch quyết định

## Các lớp chất lượng dịch vụ (QoS)

Kubernetes chỉ định lớp QoS cho mỗi pod dựa trên thông số tài nguyên của nó:

### Đảm bảo

pod nhận được lớp QoS được đảm bảo khi:

- Mỗi container đều có giới hạn và yêu cầu về bộ nhớ và CPU
- Các giới hạn tương đương với các yêu cầu

```yaml
resources:
  requests:
    memory: '128Mi'
    cpu: '500m'
  limits:
    memory: '128Mi'
    cpu: '500m'
```

Những pod này ít có khả năng bị trục xuất dưới áp lực tài nguyên.

### Có thể nổ

pod nhận được lớp QoS có thể bùng nổ khi:

- Ít nhất một container có bộ yêu cầu bộ nhớ hoặc CPU
- pod không đủ điều kiện là Được đảm bảo

```yaml
resources:
  requests:
    memory: '64Mi'
    cpu: '250m'
  limits:
    memory: '128Mi'
    cpu: '500m'
```

Những pod này có thể bị loại bỏ nếu hệ thống đang chịu áp lực về bộ nhớ và không có pod có mức độ ưu tiên thấp hơn.

### Nỗ lực tốt nhất

pod nhận được lớp BestEffort QoS khi:

- Không có container nào được đặt bất kỳ yêu cầu hoặc giới hạn nào về bộ nhớ hoặc CPU

```yaml
resources: {}
```

Những chiếc pod này là những chiếc đầu tiên bị trục xuất dưới áp lực về tài nguyên.

## Hạn ngạch tài nguyên

Hạn ngạch tài nguyên hạn chế tổng mức tiêu thụ tài nguyên trong một không gian tên:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: '10'
    requests.memory: 20Gi
    limits.cpu: '20'
    limits.memory: 40Gi
    pods: '10'
```

Hạn ngạch này giới hạn không gian tên ở:

- Tổng số yêu cầu là 10 lõi CPU
- Tổng số yêu cầu là 20 GiB bộ nhớ
- Tổng giới hạn 20 lõi CPU
- Tổng giới hạn 40 GiB bộ nhớ
- Tối đa 10 pod

Bạn cũng có thể đặt hạn ngạch cho số lượng đối tượng:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: object-quota
  namespace: team-a
spec:
  hard:
    configmaps: '10'
    persistentvolumeclaims: '5'
    services: '5'
    secrets: '10'
    services.loadbalancers: '1'
```

## Phạm vi giới hạn

Phạm vi giới hạn đặt giới hạn tài nguyên mặc định và thực thi các ràng buộc tối thiểu và tối đa đối với tài nguyên:

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: team-a
spec:
  limits:
    - type: Container
      default:
        cpu: 500m
        memory: 256Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      max:
        cpu: 2
        memory: 2Gi
      min:
        cpu: 50m
        memory: 64Mi
```

Phạm vi giới hạn này:

- Đặt giới hạn mặc định cho container không chỉ định chúng
- Đặt các yêu cầu mặc định cho container không chỉ định chúng
- Thực thi ranh giới tài nguyên tối đa và tối thiểu

## Tự động chia tỷ lệ pod theo chiều ngang

Bộ chia tỷ lệ tự động pod theo chiều ngang (HPA) tự động chia tỷ lệ số lượng pod dựa trên mức sử dụng CPU được quan sát hoặc các số liệu khác.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

HPA này:

- Nhắm mục tiêu triển khai `nginx`
- Duy trì từ 2 đến 10 bản sao
- Nhằm mục đích duy trì mức sử dụng CPU ở mức 70%

### Số liệu tùy chỉnh

Bạn có thể mở rộng quy mô dựa trên số liệu tùy chỉnh bằng cách cài đặt bộ chuyển đổi số liệu:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: queue-processor
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: queue-processor
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Pods
      pods:
        metric:
          name: messages_in_queue
        target:
          type: AverageValue
          averageValue: 100
```

HPA này chia tỷ lệ dựa trên số liệu tùy chỉnh `messages_in_queue`, hướng tới mục tiêu trung bình là 100 tin nhắn trên mỗi pod.

### Số liệu bên ngoài

Bạn cũng có thể mở rộng quy mô dựa trên số liệu từ các hệ thống bên ngoài:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sqs-processor
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sqs-processor
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: External
      external:
        metric:
          name: sqs_messages
          selector:
            matchLabels:
              queue: my-queue
        target:
          type: AverageValue
          averageValue: 30
```

HPA này chia tỷ lệ dựa trên số lượng tin nhắn trong hàng đợi SQS.

## Tự động chia tỷ lệ pod theo chiều dọc

Bộ chia tỷ lệ tự động pod dọc (VPA) điều chỉnh các yêu cầu và giới hạn của CPU và bộ nhớ cho pod:

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: nginx-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  updatePolicy:
    updateMode: Auto
  resourcePolicy:
    containerPolicies:
      - containerName: '*'
        minAllowed:
          cpu: 50m
          memory: 64Mi
        maxAllowed:
          cpu: 1
          memory: 1Gi
        controlledResources: ['cpu', 'memory']
```

VPA này:

- Nhắm mục tiêu triển khai `nginx`
- Tự động cập nhật các yêu cầu tài nguyên của pod
- Đặt ranh giới tài nguyên tối thiểu và tối đa

Các chế độ cập nhật VPA:

- `Auto`: Tự động cập nhật tài nguyên pod, có thể yêu cầu khởi động lại pod
- `Recreate`: Tương tự như Auto nhưng yêu cầu khởi động lại pod
- `Initial`: Chỉ áp dụng cho pod mới
- `Off`: Chỉ đưa ra đề xuất mà không thực hiện thay đổi

> **Lưu ý:** VPA không phải là một phần của Kubernetes tiêu chuẩn và yêu cầu thiết lập bổ sung.

## Tự động chia tỷ lệ cụm

Cluster Autoscaler điều chỉnh kích thước của cụm Kubernetes dựa trên các yêu cầu tài nguyên pod:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-autoscaler-status
  namespace: kube-system
data:
  status: |
    Cluster-autoscaler status at 2023-05-17 12:00:00.
    Cluster is balanced.
    No scale-up required.
    No scale-down candidates.
```

Cluster Autoscaler hoạt động với nhiều nhà cung cấp đám mây:

- AWS EKS
- GKE
- Azure AKS
- DOKS đại dương kỹ thuật số

Trên DigitalOcean, bạn có thể bật tính năng tự động chia tỷ lệ khi tạo cụm hoặc bằng cách sửa đổi nhóm nút hiện có. Chỉ định số lượng nút tối thiểu và tối đa và cụm sẽ tự động mở rộng quy mô dựa trên nhu cầu tài nguyên.

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận được 200 USD tín dụng miễn phí và dùng thử các tính năng tự động mở rộng quy mô cho các cụm Kubernetes.

## Phân tích việc sử dụng tài nguyên

Để tối ưu hóa việc phân bổ tài nguyên, bạn cần hiểu cách ứng dụng của mình sử dụng tài nguyên:

### Xem phân bổ nguồn lực hiện tại

Kiểm tra các yêu cầu và giới hạn tài nguyên cho pod:

```bash
kubectl get pods -o custom-columns=NAME:.metadata.name,REQUESTS:.spec.containers[0].resources.requests,LIMITS:.spec.containers[0].resources.limits
```

Nhận phân bổ tài nguyên cho mỗi nút:

```bash
kubectl describe nodes | grep -A 5 "Allocated resources"
```

### Giám sát việc sử dụng tài nguyên

Sử dụng kubectl để kiểm tra mức sử dụng tài nguyên hiện tại:

```bash
kubectl top nodes
kubectl top pods
```

Để giám sát toàn diện hơn, hãy triển khai các công cụ như:

- Prometheus + Grafana
- Cơ quan dữ liệu
- Di tích mới
- Dynatrace

## Lập kế hoạch nâng cao

### Mối quan hệ nút

Mối quan hệ nút kiểm soát những nút mà pod của bạn có thể chạy dựa trên nhãn nút:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-node-affinity
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: disktype
                operator: In
                values:
                  - ssd
  containers:
    - name: nginx
      image: nginx
```

pod này sẽ chỉ chạy trên các nút có nhãn `disktype=ssd`.

Các loại mối quan hệ nút:

- `requiredDuringSchedulingIgnoredDuringExecution`: Yêu cầu cứng
- `preferredDuringSchedulingIgnoredDuringExecution`: Ưu tiên mềm

### Pod Mối quan hệ và chống mối quan hệ

pod Affinity và Anti-Affinity kiểm soát cách pod được lên lịch so với pod khác:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-pod
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - cache
          topologyKey: 'kubernetes.io/hostname'
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app
                  operator: In
                  values:
                    - web
            topologyKey: 'kubernetes.io/hostname'
  containers:
    - name: web
      image: nginx
```

pod này:

- Phải chạy trên cùng một nút với pod có nhãn `app=cache`
- Thích tránh các nút đã có pod với nhãn `app=web`

### Vết nhơ và sự dung túng

Các nút bị nhiễm độc đánh dấu là không phù hợp với một số pod nhất định, trong khi dung sai cho phép pod chạy trên các nút bị nhiễm độc:

```yaml
# Taint a node
kubectl taint nodes node1 key=value:NoSchedule

# Pod with toleration
apiVersion: v1
kind: Pod
metadata:
  name: nginx-toleration
spec:
  tolerations:
  - key: "key"
    operator: "Equal"
    value: "value"
    effect: "NoSchedule"
  containers:
  - name: nginx
    image: nginx
```

Hiệu ứng vết bẩn:

- `NoSchedule`: pod sẽ không được lên lịch trên nút trừ khi chúng có dung sai phù hợp
- `PreferNoSchedule`: Kubernetes cố gắng tránh lập lịch pod mà không có dung sai phù hợp
- `NoExecute`: pod không có dung sai phù hợp sẽ bị trục xuất nếu đã chạy

### Ràng buộc lan truyền cấu trúc liên kết pod

Các ràng buộc lan truyền cấu trúc liên kết kiểm soát cách pod được phân phối trên các nút:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: topology-spread-pod
  labels:
    app: web
spec:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
      labelSelector:
        matchLabels:
          app: web
    - maxSkew: 1
      topologyKey: kubernetes.io/hostname
      whenUnsatisfiable: ScheduleAnyway
      labelSelector:
        matchLabels:
          app: web
  containers:
    - name: nginx
      image: nginx
```

Điều này đảm bảo pod với nhãn `app=web` được phân bổ đồng đều trên các vùng và nút khả dụng.

## Chiến lược tối ưu hóa tài nguyên

### Kích thước phù hợp container

Thực hiện theo các bước sau để định kích thước chính xác container của bạn:

1. Bắt đầu với những phỏng đoán có cơ sở dựa trên yêu cầu ứng dụng

2. Giám sát việc sử dụng thực tế:

   ```bash
   kubectl top pods
   ```

3. Phân tích số liệu lịch sử bằng Prometheus hoặc các công cụ giám sát khác

4. Điều chỉnh dựa trên mô hình sử dụng được quan sát

### Tỷ lệ yêu cầu so với giới hạn

Một thực tế phổ biến là đặt giới hạn cao hơn yêu cầu để cho phép bùng nổ:

- CPU: Giới hạn = 2 × Yêu cầu (ví dụ: yêu cầu: 250m, giới hạn: 500m)
- Bộ nhớ: Giới hạn = 1,5 × Yêu cầu (ví dụ: yêu cầu: 256Mi, giới hạn: 384Mi)

Cách tiếp cận này:

- Đảm bảo nguồn lực tối thiểu
- Cho phép bùng nổ khi có sẵn tài nguyên
- Ngăn chặn một pod tiêu thụ tất cả tài nguyên

### Sử dụng ngân sách gián đoạn pod

Ngân sách gián đoạn (PDB) pod đảm bảo tính sẵn sàng cao trong thời gian gián đoạn tự nguyện:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: nginx-pdb
spec:
  minAvailable: 2 # or maxUnavailable: 1
  selector:
    matchLabels:
      app: nginx
```

PDB này đảm bảo có sẵn ít nhất 2 pod với nhãn `app=nginx` trong các thời điểm gián đoạn như thoát nút.

### Phát hiện điều tiết CPU

Phát hiện điều chỉnh CPU bằng cách theo dõi số liệu điều chỉnh CPU container:

- Trong Prometheus: `container_cpu_cfs_throttled_seconds_total`
- Nếu container thường xuyên bị điều chỉnh, hãy cân nhắc việc tăng giới hạn CPU của nó

### Tối ưu hóa bộ nhớ

Kỹ thuật tối ưu hóa bộ nhớ:

- Đặt kích thước vùng heap JVM thích hợp cho các ứng dụng Java (ví dụ: `-Xms256m -Xmx512m`)
- Sử dụng container tiết kiệm bộ nhớ (image dựa trên Alpine)
- Giám sát các sự kiện Hết bộ nhớ (OOM)
- Sử dụng initContainers cho các tác vụ thiết lập sử dụng nhiều bộ nhớ

### Thực hiện chính sách tài nguyên

Tạo chính sách tài nguyên toàn diện:

1. Xác định hạn ngạch không gian tên cho các nhóm:

   ```yaml
   apiVersion: v1
   kind: ResourceQuota
   metadata:
     name: team-quota
   spec:
     hard:
       requests.cpu: '10'
       requests.memory: 20Gi
       limits.cpu: '20'
       limits.memory: 40Gi
   ```

2. Đặt giới hạn mặc định với LimitRanges:

   ```yaml
   apiVersion: v1
   kind: LimitRange
   metadata:
     name: default-limits
   spec:
     limits:
       - default:
           cpu: 500m
           memory: 256Mi
         defaultRequest:
           cpu: 100m
           memory: 64Mi
         type: Container
   ```

3. Thiết lập các quy ước đặt tên và chiến lược gắn thẻ rõ ràng

4. Tạo tài liệu và đào tạo cho các nhóm

## Tối ưu hóa chi phí

### Hiệu quả tài nguyên

Thực hiện các chiến lược này để tối ưu hóa chi phí:

1. **Sử dụng khả năng tự động mở rộng quy mô của nút**: Tự động điều chỉnh kích thước cụm dựa trên nhu cầu

2. **Sử dụng phiên bản tại chỗ/có thể ưu tiên**: Dành cho khối lượng công việc không quan trọng hoặc hàng loạt

3. **Thực hiện ngủ đông cụm**: Giảm quy mô trong thời gian ngoài giờ

4. **Hợp nhất các nhóm chưa được sử dụng đúng mức**: Sử dụng các quy tắc đồng dạng để đóng gói pod một cách hiệu quả

### Giám sát và báo cáo tài nguyên

Thiết lập giám sát toàn diện:

1. Giám sát việc sử dụng tài nguyên với Prometheus và Grafana

2. Tạo bảng thông tin hiển thị:

   - Sử dụng cụm
   - Chi phí cho mỗi vùng tên/nhóm
   - Tỷ lệ yêu cầu so với mức sử dụng

3. Thiết lập cảnh báo cho:
   - Hiệu quả tài nguyên thấp
   - Hạn ngạch tiếp cận giới hạn
   - Chi phí bất thường

### Phân bổ chi phí

Thực hiện chiến lược phân bổ chi phí:

1. Sử dụng không gian tên để phân tách nhóm hoặc dự án

2. Gắn nhãn tài nguyên với các trung tâm chi phí:

   ```yaml
   metadata:
     labels:
       cost-center: team-a
       environment: production
       project: website
   ```

3. Sử dụng các công cụ như Kubecost hoặc CloudHealth để phân tích chi phí chi tiết

## Các mẫu chia tỷ lệ nâng cao

### Tỷ lệ dự đoán

Thiết lập quy mô theo lịch trình cho khối lượng công việc có thể dự đoán được:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: predictive-scaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: website
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30
    scaleDown:
      stabilizationWindowSeconds: 300
```

Để mở rộng quy mô dự đoán nâng cao hơn, hãy sử dụng các giải pháp mở rộng quy mô bên ngoài như KEDA (Tự động mở rộng quy mô theo sự kiện Kubernetes).

### Mở rộng quy mô theo sự kiện

KEDA cho phép mở rộng quy mô dựa trên các nguồn sự kiện như hàng đợi, xử lý luồng và thời gian đã lên lịch:

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: rabbitmq-scaler
spec:
  scaleTargetRef:
    name: consumer
    kind: Deployment
  pollingInterval: 15
  cooldownPeriod: 30
  minReplicaCount: 1
  maxReplicaCount: 30
  triggers:
    - type: rabbitmq
      metadata:
        queueName: taskQueue
        host: amqp://user:password@rabbitmq:5672/vhost
        queueLength: '50'
```

Điều này mở rộng quy mô triển khai của người tiêu dùng dựa trên độ dài hàng đợi RabbitMQ.

### Chia tỷ lệ đa chiều

Sử dụng nhiều HPA cho các số liệu khác nhau:

```yaml
# CPU-based HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-cpu-scaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

```yaml
# Custom metric HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-requests-scaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: 1000
```

Việc triển khai sẽ mở rộng quy mô tùy theo HPA nào yêu cầu nhiều bản sao hơn.

## Thực tiễn tốt nhất để quản lý tài nguyên

1. **Luôn đặt các yêu cầu và giới hạn tài nguyên**: Ngăn chặn tình trạng thiếu tài nguyên và các vấn đề ồn ào ở hàng xóm

2. **Aphân tích mức sử dụng thực tế**: Giám sát việc sử dụng tài nguyên và điều chỉnh các yêu cầu cũng như giới hạn cho phù hợp

3. **Triển khai hạn ngạch không gian tên**: Kiểm soát mức tiêu thụ tài nguyên theo nhóm

4. **Đặt giới hạn mặc định với LimitRanges**: Đảm bảo tất cả container đều có giá trị mặc định hợp lý

5. **Sử dụng các lớp QoS thích hợp**: Kết hợp QoS với tầm quan trọng của ứng dụng

6. **Triển khai Ngân sách gián đoạn pod**: Đảm bảo tính sẵn sàng cao trong thời gian gián đoạn

7. **Định cấu hình HPA với số liệu thích hợp**: Chọn số liệu phản ánh chính xác tải ứng dụng

8. **Thiết lập ngưỡng cảnh báo thích hợp**: Được thông báo trước khi các vấn đề về tài nguyên trở nên nghiêm trọng

9. **DQuyết định tài nguyên tài liệu**: Duy trì tài liệu giải thích các lựa chọn tài nguyên

10. **Thường xuyên xem xét và tối ưu hóa**: Quản lý tài nguyên là một quá trình liên tục

## Sử dụng DigitalOcean để quản lý tài nguyên Kubernetes

DigitalOcean Kubernetes cung cấp một nền tảng tiết kiệm chi phí với khả năng tự động điều chỉnh quy mô tích hợp:

- Nút tự động mở rộng quy mô dựa trên yêu cầu tài nguyên pod
- Mô hình định giá đơn giản, minh bạch
- API số liệu tương thích với Prometheus
- Tích hợp các số liệu DOKS vào Datadog, Prometheus và các công cụ giám sát khác

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận tín dụng miễn phí trị giá 200 USD và quản lý hiệu quả tài nguyên trên cụm Kubernetes của bạn.

Trong phần tiếp theo, chúng ta sẽ khám phá việc giám sát và ghi nhật ký vào Kubernetes, những điều cần thiết để duy trì khả năng hiển thị trong các ứng dụng và cơ sở hạ tầng của bạn.
