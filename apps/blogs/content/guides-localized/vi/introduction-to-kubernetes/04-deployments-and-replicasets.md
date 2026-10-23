---
title: "Deployment và ReplicaSet"
description: Tìm hiểu các tài nguyên khối lượng công việc quản lý vòng đời, mở rộng quy mô và cập nhật pod
order: 4
---

Mặc dù pod là các khối xây dựng cơ bản trong Kubernetes, nhưng bạn hiếm khi tạo trực tiếp các pod riêng lẻ trong môi trường production. Thay vào đó, bạn sử dụng các tính năng trừu tượng hóa ở cấp độ cao hơn để quản lý việc tạo, chia tỷ lệ và cập nhật pod. Phổ biến nhất trong số này là Triển khai và ReplicaSet.

## Tìm hiểu về triển khai và ReplicaSet

Khi bạn tạo Triển khai, Kubernetes sẽ tạo một ReplicaSet bên trong, sau đó tạo và quản lý pod của bạn. Hệ thống phân cấp này cung cấp một số lợi ích:

```
┌───────────────────┐
│    Deployment     │
│                   │
│  ┌───────────────┐│
│  │  ReplicaSet   ││
│  │               ││
│  │ ┌─────┐┌─────┐││
│  │ │ Pod ││ Pod │││
│  │ └─────┘└─────┘││
│  └───────────────┘│
└───────────────────┘
```

- **Deployments** cung cấp các bản cập nhật khai báo cho ReplicaSet và cho phép cập nhật từng đợt và khôi phục
- **ReplicaSets** đảm bảo số lượng bản sao pod được chỉ định luôn chạy

Mặc dù bạn có thể trực tiếp tạo ReplicaSet, nhưng nhìn chung, bạn nên sử dụng Triển khai trừ khi bạn cần điều phối cập nhật tùy chỉnh.

## Tạo triển khai đầu tiên của bạn

Hãy tạo một Triển khai đơn giản cho máy chủ web NGINX. Tạo một tệp có tên `nginx-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.21
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 250m
              memory: 256Mi
```

YAML này định nghĩa:

- Triển khai có tên là "nginx-deployment"
- Ba bản sao pod
- Mẫu pod có NGINX container

Áp dụng cấu hình này cho cụm của bạn:

```bash
kubectl apply -f nginx-deployment.yaml
```

## Quản lý triển khai

### Xem triển khai

Kiểm tra trạng thái triển khai của bạn:

```bash
kubectl get deployments
```

Bạn sẽ thấy đầu ra như:

```
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           45s
```

Các cột chỉ ra:

- `READY`: Số lượng bản sao có sẵn / tổng số bản sao mong muốn
- `UP-TO-DATE`: Số lượng bản sao được cập nhật lên mẫu pod mới nhất
- `AVAILABLE`: Số lượng bản sao có sẵn cho người dùng

Để biết thêm thông tin chi tiết:

```bash
kubectl describe deployment nginx-deployment
```

### Đang xem ReplicaSet

Kiểm tra ReplicaSet được tạo bởi Triển khai của bạn:

```bash
kubectl get replicasets
```

Đầu ra:

```
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-66b6c48dd5   3         3         3       10m
```

### Đang xem pod

Xem tất cả pod do Triển khai quản lý:

```bash
kubectl get pods -l app=nginx
```

## Triển khai mở rộng quy mô

Bạn có thể dễ dàng mở rộng quy mô số lượng pod trong Triển khai.

### Chia tỷ lệ bằng kubectl

```bash
kubectl scale deployment nginx-deployment --replicas=5
```

### Mở rộng quy mô bằng cách chỉnh sửa triển khai

Bạn cũng có thể chỉnh sửa Triển khai trực tiếp:

```bash
kubectl edit deployment nginx-deployment
```

Thao tác này sẽ mở cấu hình Triển khai trong trình chỉnh sửa mặc định của bạn. Thay đổi trường `replicas` thành số bạn muốn, lưu và thoát.

### Chia tỷ lệ khai báo

Cách tiếp cận thuần Kubernetes nhất là cập nhật tệp YAML của bạn và áp dụng lại nó:

```yaml
# Modified nginx-deployment.yaml
spec:
  replicas: 5 # Changed from 3 to 5
```

Sau đó áp dụng các thay đổi:

```bash
kubectl apply -f nginx-deployment.yaml
```

## Cập nhật triển khai

Một trong những lợi ích chính của Triển khai là khả năng cập nhật ứng dụng của bạn một cách khai báo và kiểm soát quá trình triển khai.

### Cập nhật container image

Hãy cập nhật phiên bản NGINX của chúng tôi từ 1.21 lên 1.22:

```bash
kubectl set image deployment/nginx-deployment nginx=nginx:1.22
```

Ngoài ra, hãy chỉnh sửa tệp YAML và cập nhật phiên bản image, sau đó áp dụng:

```yaml
# Modified nginx-deployment.yaml
containers:
  - name: nginx
    image: nginx:1.22 # Changed from 1.21 to 1.22
```

```bash
kubectl apply -f nginx-deployment.yaml
```

### Xem buổi giới thiệu

Theo dõi tiến độ triển khai:

```bash
kubectl rollout status deployment/nginx-deployment
```

Đằng sau hậu trường, Kubernetes:

1. Tạo ReplicaSet mới với mẫu pod được cập nhật
2. Tăng dần quy mô ReplicaSet mới trong khi thu nhỏ quy mô cũ
3. Giữ cả ReplicaSet nhưng đặt số lượng bản sao của cái cũ về 0

Bạn có thể thấy điều này bằng cách kiểm tra ReplicaSet:

```bash
kubectl get replicasets
```

Đầu ra:

```
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-66b6c48dd5   0         0         0       30m
nginx-deployment-78cd7c7774   5         5         5       2m
```

## Chiến lược triển khai

Việc triển khai hỗ trợ hai chiến lược triển khai:

### Chiến lược RollingUpdate (Mặc định)

Chiến lược `RollingUpdate` dần thay thế pod cũ bằng chiến lược mới:

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1 # Maximum number of pods that can be unavailable during the update
      maxSurge: 1 # Maximum number of pods that can be created over the desired number
```

Lợi ích của `RollingUpdate`:

- Không cập nhật thời gian ngừng hoạt động
- Kiểm soát tốc độ triển khai
- Tự động khôi phục nếu kiểm tra tình trạng không thành công

### Tái tạo chiến lược

Chiến lược `Recreate` chấm dứt tất cả pod hiện có trước khi tạo chiến lược mới:

```yaml
spec:
  strategy:
    type: Recreate
```

Điều này gây ra thời gian ngừng hoạt động nhưng đảm bảo không có hai phiên bản nào chạy đồng thời. Điều này có thể quan trọng đối với một số ứng dụng có phiên bản không tương thích.

## Lịch sử triển khai và khôi phục

Kubernetes theo dõi các bản sửa đổi Triển khai của bạn, cho phép khôi phục về trạng thái trước đó.

### Xem lịch sử triển khai

```bash
kubectl rollout history deployment/nginx-deployment
```

Đầu ra:

```
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
```

Để biết thêm chi tiết về một bản sửa đổi cụ thể:

```bash
kubectl rollout history deployment/nginx-deployment --revision=2
```

### Quay lại bản sửa đổi trước đó

Nếu bản cập nhật gây ra sự cố, bạn có thể khôi phục:

```bash
# Roll back to the previous revision
kubectl rollout undo deployment/nginx-deployment

# Roll back to a specific revision
kubectl rollout undo deployment/nginx-deployment --to-revision=1
```

### Tạm dừng và tiếp tục triển khai

Bạn có thể tạm dừng triển khai để kiểm tra phiên bản mới trước khi tiếp tục:

```bash
# Pause the rollout
kubectl rollout pause deployment/nginx-deployment

# Resume the rollout
kubectl rollout resume deployment/nginx-deployment
```

## Kiểm soát hành vi triển khai

Tinh chỉnh cách Triển khai của bạn hoạt động với các trường này:

### PhútSẵn sàngGiây

Đợi một thời gian nhất định sau khi pod sẵn sàng trước khi xem xét nó có sẵn:

```yaml
spec:
  minReadySeconds: 10 # Wait 10 seconds after a pod is ready
```

### Sửa đổiLịch sửGiới hạn

Kiểm soát số lượng ReplicaSet cũ được giữ lại cho mục đích khôi phục:

```yaml
spec:
  revisionHistoryLimit: 5 # Keep 5 old ReplicaSets (default is 10)
```

### Tiến độHạn chótGiây

Đặt thời gian chờ cho tiến độ triển khai:

```yaml
spec:
  progressDeadlineSeconds: 600 # Consider deployment failed if it takes more than 600 seconds
```

## Các mẫu triển khai nâng cao

Ngoài việc triển khai cơ bản, Kubernetes còn hỗ trợ các chiến lược triển khai phức tạp:

### Triển khai Xanh-Xanh

Chạy hai môi trường giống hệt nhau (xanh dương và xanh lục) và chuyển đổi lưu lượng bằng cách cập nhật Dịch vụ:

1. Triển khai phiên bản mới (màu xanh lá cây) cùng với phiên bản cũ (màu xanh):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
        - name: myapp
          image: myapp:v2
```

2. Kiểm tra môi trường xanh

3. Chuyển bộ chọn Dịch vụ để trỏ đến triển khai xanh:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: green # Changed from "blue" to "green"
  ports:
    - port: 80
      targetPort: 8080
```

### Triển khai Canary

Chuyển dần lưu lượng truy cập sang phiên bản mới:

1. Triển khai phiên bản ổn định với hầu hết các bản sao:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-stable
spec:
  replicas: 9 # 90% of traffic
  selector:
    matchLabels:
      app: myapp
      version: stable
  template:
    metadata:
      labels:
        app: myapp
        version: stable
    spec:
      containers:
        - name: myapp
          image: myapp:v1
```

2. Triển khai phiên bản canary với ít bản sao hơn:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-canary
spec:
  replicas: 1 # 10% of traffic
  selector:
    matchLabels:
      app: myapp
      version: canary
  template:
    metadata:
      labels:
        app: myapp
        version: canary
    spec:
      containers:
        - name: myapp
          image: myapp:v2
```

3. Tạo một Dịch vụ chọn tất cả pod có nhãn "app: myapp":

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp # Selects both stable and canary pods
  ports:
    - port: 80
      targetPort: 8080
```

4. Tăng dần các bản sao hoàng yến trong khi giảm các bản sao ổn định.

Để phân chia lưu lượng truy cập phức tạp hơn, hãy cân nhắc sử dụng lưới dịch vụ như Istio.

## ReplicaSet ở độ sâu

Mặc dù Triển khai là cách được khuyến nghị để quản lý pod nhưng việc hiểu ReplicaSet sẽ giúp khắc phục sự cố và các trường hợp đặc biệt.

### Tạo ReplicaSet trực tiếp

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-replicaset
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.21
```

### Các loại bộ chọn ReplicaSet

ReplicaSet hỗ trợ hai loại bộ chọn:

1. **matchLabels**: Bộ chọn dựa trên đẳng thức đơn giản

```yaml
selector:
  matchLabels:
    app: nginx
    environment: production
```

2. **matchExpressions**: Bộ chọn dựa trên tập hợp phức tạp hơn

```yaml
selector:
  matchExpressions:
    - key: app
      operator: In
      values:
        - nginx
        - web
    - key: environment
      operator: NotIn
      values:
        - development
```

Các toán tử bao gồm `In`, `NotIn`, `Exists` và `DoesNotExist`.

## StatefulSets cho các ứng dụng có trạng thái

Đối với các ứng dụng trạng thái như cơ sở dữ liệu, hãy sử dụng StatefulSets thay vì Triển khai:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: 'postgres'
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:14
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: postgres-data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: postgres-data
      spec:
        accessModes: ['ReadWriteOnce']
        resources:
          requests:
            storage: 10Gi
```

StatefulSets cung cấp:

- Số nhận dạng mạng ổn định, duy nhất (`postgres-0`, `postgres-1`, v.v.)
- Lưu trữ ổn định, liên tục
- Triển khai và mở rộng quy mô theo thứ tự, duyên dáng
- Cập nhật theo thứ tự, tự động

## DaemonSets cho hoạt động cấp nút

DaemonSets đảm bảo bản sao của pod chạy trên các nút đã chọn:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      containers:
        - name: fluentd
          image: fluentd:v1.10
```

Các trường hợp sử dụng bao gồm:

- Đại lý giám sát nút
- Thu thập nhật ký
- Plugin mạng
- Plugin lưu trữ

## Công việc và CronJobs để xử lý hàng loạt

Đối với các tác vụ một lần hoặc theo lịch trình, hãy sử dụng Jobs và CronJobs:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: batch-job
spec:
  completions: 5
  parallelism: 2
  template:
    spec:
      containers:
        - name: batch-processor
          image: batch-processor:v1
      restartPolicy: OnFailure
```

Đối với công việc theo lịch trình:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-cleanup
spec:
  schedule: '0 0 * * *' # Midnight every day
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: cleanup
              image: cleanup:v1
          restartPolicy: OnFailure
```

## Thực tiễn tốt nhất để triển khai

1. **Đặt các yêu cầu và giới hạn tài nguyên**: Đảm bảo pod của bạn có sự phân bổ tài nguyên phù hợp để đảm bảo độ tin cậy.

2. **Triển khai kiểm tra tình trạng**: Thêm các đầu dò hoạt động và mức độ sẵn sàng để triển khai mạnh mẽ.

3. **Sử dụng chiến lược cập nhật hợp lý**: Định cấu hình `maxSurge` và `maxUnavailable` dựa trên nhu cầu ứng dụng của bạn.

4. **Quản lý lịch sử sửa đổi**: Đặt `revisionHistoryLimit` thích hợp để tránh lãng phí tài nguyên.

5. **Gắn nhãn mọi thứ một cách hiệu quả**: Sử dụng các nhãn nhất quán, có ý nghĩa cho tài nguyên của bạn.

6. **Kiểm tra các bản cập nhật trước khi sản xuất**: Sử dụng môi trường staging để xác minh các bản cập nhật trước khi triển khai production.

7. **Triển khai phân phối lũy tiến**: Xem xét triển khai canary cho các ứng dụng quan trọng.

8. **DQuy trình khôi phục tài liệu**: Đảm bảo nhóm của bạn biết cách khôi phục các hoạt động triển khai có vấn đề.

## Sử dụng DigitalOcean để triển khai Kubernetes

DigitalOcean Kubernetes cung cấp nền tảng đáng tin cậy để chạy Triển khai của bạn với các tính năng như:

- Tự động thay đổi quy mô nhóm nút để xử lý khối lượng công việc khác nhau
- Tích hợp cân bằng tải cho các dịch vụ
- container Đăng ký để lưu trữ image của bạn một cách an toàn

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) và nhận 200 USD tín dụng miễn phí để triển khai các ứng dụng của bạn trên nền tảng Kubernetes sẵn sàng cho production.

Trong phần tiếp theo, chúng ta sẽ khám phá Mạng và Dịch vụ Kubernetes, cho phép giao tiếp giữa các ứng dụng của bạn và thế giới bên ngoài.
