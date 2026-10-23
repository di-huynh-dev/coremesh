---
title: "Pod và container trong Kubernetes"
description: Tìm hiểu cách làm việc với pod, đơn vị có thể triển khai cơ bản trong Kubernetes
order: 3
---

Bây giờ bạn đã thiết lập và chạy cụm Kubernetes, đã đến lúc hiểu và làm việc với pod và container. pod là đơn vị có thể triển khai nhỏ nhất trong Kubernetes và là khối xây dựng cho tất cả khối lượng công việc.

## Tìm hiểu pod

pod là một nhóm gồm một hoặc nhiều container có bộ nhớ dùng chung, tài nguyên mạng và thông số kỹ thuật về cách chạy container. pod về bản chất là phù du, chúng không được thiết kế để tồn tại lâu dài. Khi pod bị xóa và thay thế, mọi dữ liệu không được lưu trữ trong bộ lưu trữ liên tục sẽ bị mất.

container trong pod:

- Chia sẻ cùng một không gian tên mạng (địa chỉ IP và không gian cổng)
- Có thể giao tiếp với nhau bằng `localhost`
- Có thể chia sẻ dung lượng lưu trữ volume

```
┌──────────────────────────────────────┐
│                 Pod                  │
│                                      │
│  ┌────────────┐     ┌────────────┐   │
│  │            │     │            │   │
│  │ Container 1│     │ Container 2│   │
│  │            │     │            │   │
│  └────────────┘     └────────────┘   │
│                                      │
│           Shared Volumes             │
│                                      │
└──────────────────────────────────────┘
```

## Tạo pod đầu tiên của bạn

Hãy tạo một pod đơn giản chạy máy chủ web NGINX. Tạo một tệp có tên `nginx-pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.21
      ports:
        - containerPort: 80
```

YAML này định nghĩa:

- Phiên bản API và loại tài nguyên
- Siêu dữ liệu bao gồm tên và nhãn của pod
- Thông số kỹ thuật với một container sử dụng nginx:1.21 image
- container hiển thị cổng 80

Áp dụng cấu hình này cho cụm của bạn:

```bash
kubectl apply -f nginx-pod.yaml
```

## Xem và quản lý pod

Kiểm tra xem pod của bạn có đang chạy không:

```bash
kubectl get pods
```

Bạn sẽ thấy đầu ra như:

```
NAME        READY   STATUS    RESTARTS   AGE
nginx-pod   1/1     Running   0          42s
```

Để biết thêm thông tin chi tiết:

```bash
kubectl describe pod nginx-pod
```

Lệnh này hiển thị chi tiết pod bao gồm:

- Hiện trạng và điều kiện
- Thông tin container
- Các sự kiện liên quan đến pod

## Truy cập pod của bạn

Có một số cách để truy cập và tương tác với pod của bạn:

### Chuyển tiếp cổng

Chuyển tiếp một cổng cục bộ tới cổng của pod:

```bash
kubectl port-forward nginx-pod 8080:80
```

Bây giờ bạn có thể truy cập NGINX bằng cách truy cập `http://localhost:8080` trong trình duyệt của mình.

### Truy cập shell

Thực thi các lệnh bên trong container:

```bash
# Run a command
kubectl exec nginx-pod -- ls /usr/share/nginx/html

# Get an interactive shell
kubectl exec -it nginx-pod -- /bin/bash
```

### Xem nhật ký

Kiểm tra nhật ký container:

```bash
kubectl logs nginx-pod

# Follow logs in real-time
kubectl logs -f nginx-pod
```

## Multi-container pod

Mặc dù nhiều pod chỉ chứa một container duy nhất, nhưng vẫn có những trường hợp sử dụng hợp lệ cho nhiều container trong pod. Hãy tạo một pod với hai container:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  containers:
    - name: web
      image: nginx:1.21
      ports:
        - containerPort: 80
      volumeMounts:
        - name: shared-data
          mountPath: /usr/share/nginx/html

    - name: content-generator
      image: alpine:3.14
      command: ['/bin/sh', '-c']
      args:
        - while true; do
          echo "<h1>The current date is $(date)</h1>" > /data/index.html;
          sleep 10;
          done
      volumeMounts:
        - name: shared-data
          mountPath: /data

  volumes:
    - name: shared-data
      emptyDir: {}
```

pod này có:

1. Một trang web container chạy NGINX
2. Trình tạo nội dung container cập nhật index.html cứ sau 10 giây
3. Một volume được chia sẻ trong đó cả container đều có thể truy cập vào cùng một tệp

Áp dụng cấu hình:

```bash
kubectl apply -f multi-container-pod.yaml
```

Sau khi pod đang chạy, bạn có thể chuyển tiếp cổng và xem nội dung được làm mới:

```bash
kubectl port-forward multi-container-pod 8080:80
```

Các mẫu phổ biến cho multi-container pod bao gồm:

- **Sidecar**: Tăng cường container chính (như thêm ghi nhật ký)
- **ambassador**: Lưu lượng mạng proxy đến/từ container chính
- **Adapter**: Chuyển đổi đầu ra của container chính

## Vòng đời pod

pod trải qua nhiều giai đoạn trong suốt vòng đời của chúng:

1. **Pending**: pod đã được chấp nhận nhưng container chưa chạy
2. **Running**: Ít nhất một container đang chạy
3. **Succeeded**: Tất cả container đã kết thúc thành công
4. **Failed**: Ít nhất một container đã kết thúc do lỗi
5. **Unknown**: Không thể xác định trạng thái của pod

Bạn có thể thấy pha của pod với:

```bash
kubectl get pod nginx-pod -o wide
```

### Chính sách khởi động lại container

Trường `restartPolicy` xác định điều gì xảy ra khi container thoát:

- **Always** (mặc định): Luôn khởi động lại container
- **OnFailure**: Chỉ khởi động lại nếu container thoát với mã khác 0
- **Never**: Không bao giờ khởi động lại container

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: task-pod
spec:
  restartPolicy: OnFailure
  containers:
    - name: task
      image: alpine:3.14
      command: ['sh', '-c', 'echo "Task completed"; exit 0']
```

## Ban đầu container

Khởi tạo container chạy và hoàn tất trước khi ứng dụng container khởi động. Chúng hữu ích cho các tác vụ thiết lập:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-pod
spec:
  initContainers:
    - name: init-service
      image: alpine:3.14
      command: ['sh', '-c', 'until nslookup database; do echo waiting for database; sleep 2; done;']

  containers:
    - name: app
      image: nginx:1.21
```

Trong ví dụ này, init container chờ dịch vụ có tên "cơ sở dữ liệu" có thể phân giải được trước khi NGINX container chính khởi động.

## Yêu cầu và giới hạn tài nguyên

Chỉ định các yêu cầu và giới hạn tài nguyên cho container:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-pod
spec:
  containers:
    - name: app
      image: nginx:1.21
      resources:
        requests:
          memory: '64Mi'
          cpu: '250m'
        limits:
          memory: '128Mi'
          cpu: '500m'
```

Cấu hình này:

- Yêu cầu 64MiB bộ nhớ và 0,25 lõi CPU
- Giới hạn container ở mức 128MiB bộ nhớ và 0,5 lõi CPU

Các yêu cầu tài nguyên giúp bộ lập lịch đặt pod trên các nút có đủ tài nguyên, đồng thời các giới hạn ngăn container sử dụng quá nhiều tài nguyên.

## Biến môi trường và ConfigMap

Truyền các biến môi trường cho container của bạn:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: env-pod
spec:
  containers:
    - name: app
      image: nginx:1.21
      env:
        - name: ENVIRONMENT
          value: 'production'
        - name: LOG_LEVEL
          value: 'info'
```

Để có cấu hình phức tạp hơn, hãy sử dụng ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  ENVIRONMENT: 'production'
  LOG_LEVEL: 'info'
  app.properties: |
    property1=value1
    property2=value2
---
apiVersion: v1
kind: Pod
metadata:
  name: configmap-pod
spec:
  containers:
    - name: app
      image: nginx:1.21
      envFrom:
        - configMapRef:
            name: app-config
      volumeMounts:
        - name: config-volume
          mountPath: /config
  volumes:
    - name: config-volume
      configMap:
        name: app-config
```

## Kiểm tra sức khỏe

Kubernetes hỗ trợ ba loại kiểm tra tình trạng:

1. **Liveness Probe**: Xác định xem container có chạy đúng không
2. **Readiness Probe**: Xác định xem container có sẵn sàng nhận lưu lượng truy cập hay không
3. **Startup Probe**: Xác định khi nào container đã khởi động thành công

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: healthcheck-pod
spec:
  containers:
    - name: app
      image: nginx:1.21
      ports:
        - containerPort: 80
      livenessProbe:
        httpGet:
          path: /
          port: 80
        initialDelaySeconds: 3
        periodSeconds: 10
      readinessProbe:
        httpGet:
          path: /
          port: 80
        initialDelaySeconds: 5
        periodSeconds: 5
```

pod này có:

- Một đầu dò độ sống để kiểm tra xem NGINX có phản hồi ở đường dẫn gốc hay không
- Một thăm dò sẵn sàng để xác định khi nào nó có thể nhận được lưu lượng truy cập

## Bối cảnh bảo mật

Kiểm soát cài đặt bảo mật cho pod và container:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: security-context-pod
spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
  containers:
    - name: app
      image: nginx:1.21
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop:
            - ALL
```

Cấu hình này:

- Chạy các quy trình pod dưới dạng ID người dùng 1000 và ID nhóm 3000
- Đặt quyền truy cập tệp cho các giá treo volume với ID nhóm 2000
- Ngăn chặn leo thang đặc quyền
- Loại bỏ tất cả các khả năng của Linux

## Mối quan hệ và phản đối mối quan hệ

Kiểm soát nơi pod được lên lịch:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: affinity-pod
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
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app
                  operator: In
                  values:
                    - nginx
            topologyKey: kubernetes.io/hostname
  containers:
    - name: app
      image: nginx:1.21
```

pod này:

- Yêu cầu lập lịch trên các nút có nhãn `disktype=ssd`
- Thích tránh các nút đã có pod với nhãn `app=nginx`

## Dung sai và vết nhơ

Cho phép pod lên lịch trên các nút bị nhiễm độc:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: toleration-pod
spec:
  tolerations:
    - key: 'dedicated'
      operator: 'Equal'
      value: 'gpu'
      effect: 'NoSchedule'
  containers:
    - name: app
      image: tensorflow/tensorflow:latest-gpu
```

pod này có thể được lên lịch trên các nút có `dedicated=gpu:NoSchedule` bị hư hỏng.

## Ngân sách gián đoạn pod

Bảo vệ ứng dụng của bạn trong thời gian gián đoạn tự nguyện:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: nginx-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: nginx
```

PodDisruptionBudget này đảm bảo rằng có ít nhất 2 pod có nhãn `app=nginx` trong quá trình bảo trì nút.

## Các phương pháp thực hành tốt nhất cho pod

1. **Sử dụng bộ điều khiển thay vì nhóm thô**: Việc tạo pod trực tiếp chủ yếu là để thử nghiệm. Trong production, hãy sử dụng Triển khai, StatefulSets hoặc DaemonSets.

2. **Keep pod tập trung**: Thực hiện theo nguyên tắc trách nhiệm duy nhất.

3. **Đặt các yêu cầu và giới hạn tài nguyên**: Luôn chỉ định những tài nguyên mà pod của bạn cần.

4. **Triển khai kiểm tra tình trạng**: Sử dụng thăm dò để giúp Kubernetes quản lý pod của bạn.

5. **Sử dụng nhãn và chú thích**: Nhãn cho phép lựa chọn và chú thích thêm siêu dữ liệu hữu ích.

6. **DKhông đặt ứng dụng trạng thái trong nhóm**: Sử dụng volume liên tục cho dữ liệu trạng thái.

7. **Đặt chính sách khởi động lại phù hợp**: Chọn dựa trên nhu cầu ứng dụng của bạn.

8. **Xác định bối cảnh bảo mật pod**: Giảm bề mặt tấn công của các ứng dụng của bạn.

## Sử dụng DigitalOcean để chạy Kubernetes pod

DigitalOcean Kubernetes cung cấp nền tảng được tối ưu hóa để chạy pod của bạn với các tính năng như:

- Nhóm nút tự động chia tỷ lệ
- Tích hợp cân bằng tải
- Chặn lưu trữ cho volume liên tục
- Đăng ký container cho image của bạn

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận 200 USD tín dụng miễn phí và bắt đầu triển khai pod của bạn trên nền tảng Kubernetes sẵn sàng cho production.

Trong phần tiếp theo, chúng ta sẽ khám phá Triển khai và ReplicaSet, giúp bạn quản lý nhiều phiên bản pod và xử lý các bản cập nhật một cách linh hoạt.
