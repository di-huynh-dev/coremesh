---
title: "Kiến trúc và thành phần Kubernetes"
description: 'Kiến trúc Kubernetes đã giải thích: các phần mặt phẳng điều khiển (máy chủ API, etcd, bộ lập lịch, trình quản lý bộ điều khiển) và các phần nút công nhân (kubelet, kube-proxy, thời gian chạy).'
order: 1
---

Trước khi đi sâu vào hoạt động của Kubernetes, điều quan trọng là phải hiểu kiến trúc của nó và cách các thành phần khác nhau phối hợp với nhau. Kiến thức này tạo nền tảng cho mọi thứ khác mà bạn sẽ làm với Kubernetes.

## Bức tranh lớn

Về cốt lõi, Kubernetes là một nền tảng để chạy và điều phối khối lượng công việc được đóng gói trong container. Nó trừu tượng hóa cơ sở hạ tầng cơ bản, cho phép bạn mô tả các ứng dụng trạng thái mà bạn mong muốn và Kubernetes hoạt động để duy trì trạng thái đó.

Kubernetes tuân theo kiến trúc client-server với nhiều thành phần hoạt động cùng nhau:

```
┌─────────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster                      │
│                                                             │
│  ┌─────────────┐                 ┌─────────────────────┐    │
│  │             │                 │     Worker Node     │    │
│  │             │                 │  ┌──────────────┐   │    │
│  │   Control   │                 │  │   Pod        │   │    │
│  │    Plane    │◄───────────────►│  │ ┌──────────┐ │   │    │
│  │             │                 │  │ │Container │ │   │    │
│  │             │                 │  │ └──────────┘ │   │    │
│  │             │                 │  └──────────────┘   │    │
│  └─────────────┘                 │                     │    │
│                                  │  ┌──────────────┐   │    │
│                                  │  │kubelet       │   │    │
│                                  │  │kube-proxy    │   │    │
│                                  │  │container     │   │    │
│                                  │  │runtime       │   │    │
│                                  │  └──────────────┘   │    │
│                                  └─────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Thành phần mặt phẳng điều khiển

Mặt phẳng điều khiển là bộ não của Kubernetes. Nó đưa ra các quyết định toàn cầu về cụm, phát hiện và phản hồi các sự kiện. Các thành phần này có thể chạy trên một nút chính hoặc được sao chép trên nhiều nút để có tính sẵn sàng cao.

### Máy chủ kube

Máy chủ API là phần đầu của mặt phẳng điều khiển Kubernetes, hiển thị API Kubernetes. Nó được thiết kế để mở rộng quy mô theo chiều ngang bằng cách triển khai nhiều phiên bản hơn.

```bash
# Example API server interaction using kubectl
kubectl get pods --all-namespaces
```

Khi bạn chạy lệnh này, `kubectl` sẽ giao tiếp với kube-apiserver, sau đó xác thực yêu cầu, truy xuất dữ liệu từ etcd và trả về kết quả.

### V.v.

etcd là một kho lưu trữ khóa-giá trị nhất quán và có tính sẵn sàng cao được sử dụng làm kho lưu trữ dự phòng của Kubernetes cho tất cả dữ liệu cụm. Nó lưu trữ trạng thái hoàn chỉnh của cụm, bao gồm cấu hình, trạng thái và siêu dữ liệu.

```bash
# You typically won't interact with etcd directly, but can using etcdctl
etcdctl get /registry/pods/default/nginx-pod
```

### Lập lịch kube

Bộ lập lịch theo dõi pod mới được tạo chưa được gán cho nút và chọn nút để chúng chạy dựa trên nhiều yếu tố khác nhau:

- Yêu cầu về nguồn lực
- Các hạn chế về phần cứng/phần mềm/chính sách
- Thông số kỹ thuật về ái lực và phản ái lực
- Vị trí dữ liệu
- thời hạn

```yaml
# Example pod with scheduling constraints
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.14
  nodeSelector:
    disktype: ssd # Scheduler will place this on nodes with this label
```

### Quản lý bộ điều khiển kube

Trình quản lý bộ điều khiển chạy các quy trình điều khiển, là các vòng điều khiển theo dõi trạng thái của cụm và thực hiện các thay đổi để di chuyển trạng thái hiện tại về phía trạng thái mong muốn. Ví dụ bao gồm:

- Bộ điều khiển nút: Thông báo và phản hồi khi các nút ngừng hoạt động
- Bộ điều khiển công việc: Theo dõi các đối tượng Công việc đại diện cho các nhiệm vụ một lần
- Bộ điều khiển điểm cuối: Điền đối tượng Điểm cuối với các điểm cuối dịch vụ
- Bộ điều khiển tài khoản & mã thông báo dịch vụ: Tạo tài khoản mặc định và mã thông báo truy cập API

### Trình quản lý bộ điều khiển đám mây

Trình quản lý bộ điều khiển đám mây tích hợp với API của nhà cung cấp đám mây, cho phép cụm của bạn tương tác với tài nguyên của nhà cung cấp đám mây. Nó xử lý logic điều khiển dành riêng cho đám mây cho các dịch vụ, nút và định tuyến.

## Thành phần nút

Các thành phần nút chạy trên mọi nút trong cụm, duy trì pod chạy và cung cấp môi trường thời gian chạy Kubernetes.

### Kubelet

Kubelet là một tác nhân chạy trên mỗi nút. Nó đảm bảo rằng container đang chạy trong pod bằng cách:

- Lấy một bộ PodSpec do máy chủ API cung cấp
- Đảm bảo container được mô tả trong các PodSpec đó đang chạy và hoạt động tốt
- Báo cáo lại mặt phẳng điều khiển về nút và pod trạng thái

```bash
# View kubelet status
systemctl status kubelet
```

### Proxy kube

kube-proxy là một proxy mạng chạy trên mỗi nút, triển khai một phần của khái niệm Dịch vụ Kubernetes. Nó duy trì các quy tắc mạng cho phép giao tiếp mạng tới pod của bạn từ các phiên mạng bên trong hoặc bên ngoài cụm của bạn.

```bash
# kube-proxy typically runs as a DaemonSet
kubectl get pods -n kube-system | grep kube-proxy
```

### Thời gian chạy container

Thời gian chạy container là phần mềm chịu trách nhiệm chạy container. Kubernetes hỗ trợ các thời gian chạy container như Docker, containerd, CRI-O và mọi triển khai Kubernetes CRI (Giao diện thời gian chạy container).

```bash
# Check which container runtime is being used
kubectl get nodes -o wide
```

## Đối tượng Kubernetes

Đối tượng Kubernetes là các thực thể cố định trong hệ thống Kubernetes đại diện cho trạng thái trong cụm của bạn. Họ mô tả:

- Những ứng dụng được đóng gói nào đang chạy (và trên nút nào)
- Các tài nguyên có sẵn cho các ứng dụng đó
- Các chính sách xung quanh cách hoạt động của các ứng dụng đó (chính sách khởi động lại, nâng cấp, khả năng chịu lỗi)

### Pod

Đơn vị có thể triển khai nhỏ nhất trong Kubernetes. pod đại diện cho một tập hợp container đang chạy trên cụm của bạn.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
    - name: nginx
      image: nginx:1.14
      ports:
        - containerPort: 80
```

### Triển khai

Triển khai cung cấp các bản cập nhật khai báo cho pod và ReplicaSet, cho phép bạn mô tả vòng đời của ứng dụng, chẳng hạn như image nào sẽ sử dụng, số lượng pod và cách cập nhật chúng.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
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
          image: nginx:1.14
          ports:
            - containerPort: 80
```

### Dịch vụ

Dịch vụ là một bản tóm tắt xác định một tập logic pod và chính sách để truy cập chúng. Các dịch vụ cho phép truy cập mạng vào một bộ pod.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

### Không gian tên

Không gian tên cung cấp cơ chế tách biệt các nhóm tài nguyên trong một cụm duy nhất. Tên của các tài nguyên cần phải là duy nhất trong một không gian tên, nhưng không phải là duy nhất giữa các không gian tên.

```bash
# List all namespaces
kubectl get namespaces
```

## API Kubernetes

API Kubernetes cho phép bạn truy vấn và thao tác trạng thái của các đối tượng trong hệ thống Kubernetes. Cốt lõi của mặt phẳng điều khiển Kubernetes là máy chủ API và API HTTP mà nó hiển thị.

API được tổ chức thành:

1. **Core Group** (`/api/v1`): Chứa các đối tượng như pod, dịch vụ và nút
2. **Các nhóm được đặt tên** (`/apis/$GROUP_NAME/$VERSION`): Giống như `apps/v1` dành cho Triển khai, StatefulSets, v.v.

Tất cả quyền truy cập API đều thông qua HTTPS, đồng thời máy chủ API xác thực và định cấu hình dữ liệu cho các đối tượng API.

```bash
# Get API resources available in your cluster
kubectl api-resources
```

## Quản lý mang tính tuyên bố và mệnh lệnh

Kubernetes ưa thích cách tiếp cận khai báo: bạn nói với nó những gì bạn muốn (trạng thái mong muốn) và nó tìm ra cách để biến điều đó thành hiện thực. Điều này khác với quản lý mệnh lệnh, trong đó bạn đưa ra các lệnh cụ thể để đạt được trạng thái nhất định.

```bash
# Imperative approach (telling Kubernetes what to do)
kubectl run nginx --image=nginx:1.14

# Declarative approach (describing what you want)
kubectl apply -f nginx-deployment.yaml
```

Cách tiếp cận khai báo được ưa thích vì:

- Việc xem lại, theo dõi các thay đổi và quay lại dễ dàng hơn
- Nó hỗ trợ quy trình công việc GitOps
- Nó làm cho cơ sở hạ tầng trở thành mã có thể

## Sơ đồ kiến trúc cấp cao

Đây là cái nhìn đơn giản về cách các thành phần tương tác:

```
 ┌──────────────┐     │     ┌──────────────┐
 │   kubectl    │     │     │   Developer  │
 └──────┬───────┘     │     └──────┬───────┘
        │             │            │
        │ HTTP        │            │ HTTP
        │ API         │            │ API
        ▼             │            ▼
┌───────────────────────────────────────┐
│                                       │
│            kube-apiserver             │
│                                       │
└─────┬───────────┬────────────┬────────┘
      │           │            │
      ▼           ▼            ▼
┌───────────┐┌─────────┐┌────────────────┐
│    etcd   ││scheduler││controller mgr  │
└───────────┘└─────────┘└────────────────┘
      │           │            │
      └───────────┼────────────┘
                  │
┌─────────────────┼─────────────────┐
│                 │                 │
▼                 ▼                 ▼
┌───────────────────┐  ┌───────────────────┐
│    Worker Node    │  │    Worker Node    │
│ ┌───────────────┐ │  │ ┌───────────────┐ │
│ │    kubelet    │ │  │ │    kubelet    │ │
│ └───────┬───────┘ │  │ └───────┬───────┘ │
│         │         │  │         │         │
│ ┌───────▼───────┐ │  │ ┌───────▼───────┐ │
│ │    Pod(s)     │ │  │ │    Pod(s)     │ │
│ └───────────────┘ │  │ └───────────────┘ │
│                   │  │                   │
│ ┌───────────────┐ │  │ ┌───────────────┐ │
│ │  kube-proxy   │ │  │ │  kube-proxy   │ │
│ └───────────────┘ │  │ └───────────────┘ │
└───────────────────┘  └───────────────────┘
```

## Đường dẫn liên lạc

Hiểu luồng giao tiếp trong Kubernetes giúp chẩn đoán các vấn đề:

1. **kubectl tới API Server**: HTTP được mã hóa TLS
2. Máy chủ **API đến kubelet**: HTTP được mã hóa TLS
3. Máy chủ **API tới Node/pod/Service**: Sử dụng proxy kubectl khi gỡ lỗi
4. **Kubelet tới API Server**: HTTP được mã hóa TLS
5. **Kubelet đến container Runtime**: Sử dụng Giao diện thời gian chạy container (CRI)
6. **Kube-proxy tới API Server**: HTTP được mã hóa TLS
7. Trình quản lý bộ điều khiển ** tới API Server**: HTTP được mã hóa TLS
8. **Scheduler tới API Server**: HTTP được mã hóa TLS

## Thuật ngữ Kubernetes

Khi tiếp tục khám phá Kubernetes, bạn sẽ gặp những thuật ngữ phổ biến sau:

- **Node**: Máy công nhân chạy các ứng dụng được đóng gói
- **Pod**: Đơn vị có thể triển khai nhỏ nhất, bao gồm một hoặc nhiều container
- **Service**: Một bản tóm tắt xác định bộ logic của pod và chính sách để truy cập chúng
- **Volume**: Một thư mục có thể truy cập vào container trong pod
- **Namespace**: Cụm ảo để phân chia tài nguyên cụm
- **Label**: Cặp khóa-giá trị gắn liền với đối tượng để nhận dạng và lựa chọn
- **Annotation**: Siêu dữ liệu không xác định được gắn vào đối tượng
- **StatefulSet**: Quản lý việc triển khai và mở rộng quy mô một bộ pod với sự đảm bảo về thứ tự và tính duy nhất
- **DaemonSet**: Đảm bảo tất cả (hoặc một số) Nút chạy bản sao của pod
- **Job**: Tạo một hoặc nhiều pod chạy đến khi hoàn thành
- **CronJob**: Tạo công việc theo lịch trình dựa trên thời gian
- **Ingress**: Quản lý quyền truy cập bên ngoài vào các dịch vụ, điển hình là HTTP
- **ConfigMap**: Lưu trữ dữ liệu cấu hình không bí mật
- **Secret**: Lưu trữ thông tin nhạy cảm như mật khẩu và mã thông báo

Hiểu kiến trúc Kubernetes không chỉ mang tính học thuật mà còn giúp bạn thiết kế, triển khai và khắc phục sự cố ứng dụng một cách hiệu quả. Trong phần tiếp theo, chúng ta sẽ khám phá cách thiết lập cụm Kubernetes đầu tiên của bạn.
