---
title: "Thiết lập cụm Kubernetes"
description: Tìm hiểu các cách khác nhau để tạo và định cấu hình cụm Kubernetes để phát triển và production
order: 2
---

Với sự hiểu biết vững chắc về kiến trúc Kubernetes, bạn đã sẵn sàng thiết lập một cụm. Phần này bao gồm nhiều tùy chọn khác nhau để tạo cụm Kubernetes, từ môi trường phát triển cục bộ đến các thiết lập sẵn sàng cho production.

## Tùy chọn cụm Kubernetes

Có một số cách để chạy Kubernetes, tùy thuộc vào nhu cầu của bạn:

1. **Cụm phát triển cục bộ**: Tùy chọn nhẹ cho máy của bạn
2. **Cụm tự quản lý**: Toàn quyền kiểm soát cơ sở hạ tầng của bạn
3. **Dịch vụ Kubernetes được quản lý**: Mặt phẳng điều khiển do nhà cung cấp đám mây quản lý
4. Bản phân phối **Kubernetes**: Các gói được nhà cung cấp hỗ trợ với các tính năng bổ sung

Hãy khám phá từng tùy chọn, bắt đầu với cách đơn giản nhất.

## Cụm phát triển địa phương

Để học hỏi và phát triển, bạn có thể chạy Kubernetes trên máy cục bộ của mình.

### Minikube

Minikube là một triển khai Kubernetes nhẹ giúp tạo VM trên máy cục bộ của bạn và triển khai một cụm đơn giản với một nút duy nhất.

#### Điều kiện tiên quyết

- 2 CPU trở lên
- 2GB bộ nhớ trống
- 20GB dung lượng đĩa trống
- container hoặc trình quản lý máy ảo (Docker, Hyperkit, VirtualBox, v.v.)

#### Cài đặt

Đối với macOS có Homebrew:

```bash
brew install minikube
```

Đối với Windows có Chocolatey:

```bash
choco install minikube
```

Đối với Linux:

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

#### Bắt đầu một cụm

Bắt đầu một cụm Minikube cơ bản:

```bash
minikube start
```

Hoặc tùy chỉnh với nhiều tài nguyên hơn:

```bash
minikube start --cpus 4 --memory 8192 --disk-size 50g
```

Minikube cung cấp bảng điều khiển để trực quan hóa:

```bash
minikube dashboard
```

### Loại (Kubernetes TRONG Docker)

Kind chạy các cụm Kubernetes bên trong Docker container, giúp thiết lập các cụm thử nghiệm nhanh chóng và dễ dàng.

#### Cài đặt

Đối với macOS có Homebrew:

```bash
brew install kind
```

Đối với Windows có Chocolatey:

```bash
choco install kind
```

Đối với Linux:

```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

#### Tạo một cụm

Tạo một cụm Loại cơ bản:

```bash
kind create cluster --name my-cluster
```

Đối với cụm nhiều nút, tạo tệp cấu hình `kind-config.yaml`:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
```

Sau đó tạo cụm với:

```bash
kind create cluster --config kind-config.yaml
```

### Máy tính để bàn Docker

Docker Desktop cho Mac và Windows bao gồm tùy chọn Kubernetes có thể dễ dàng kích hoạt từ cài đặt.

1. Mở tùy chọn Docker Desktop
2. Chuyển đến tab Kubernetes
3. Kiểm tra "Kích hoạt Kubernetes"
4. Nhấp vào "Áp dụng & Khởi động lại"

Đây là một trong những cách đơn giản nhất để bắt đầu nếu bạn đã sử dụng Docker Desktop.

## Cụm production tự quản lý

Đối với khối lượng công việc production, bạn có thể thiết lập và quản lý cụm Kubernetes của riêng mình.

### Kubeadm

kubeadm là công cụ khởi động cụm Kubernetes chính thức. Nó xử lý việc thiết lập mặt phẳng điều khiển và các nút công nhân.

#### Điều kiện tiên quyết

- Nhiều máy Linux (ảo hoặc vật lý)
- 2 GB RAM trở lên cho mỗi máy
- 2 CPU trở lên trên mỗi máy
- Kết nối mạng đầy đủ giữa tất cả các máy trong cụm
- đặc quyền sudo trên tất cả các máy
- Đã cài đặt thời gian chạy container (Docker, containerd, CRI-O)

#### Các bước cài đặt

1. Đầu tiên, cài đặt kubeadm trên tất cả các nút:

```bash
# Update package list
sudo apt-get update

# Install prerequisites
sudo apt-get install -y apt-transport-https ca-certificates curl

# Add Kubernetes repository key
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg

# Add Kubernetes repository
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list

# Update package list again
sudo apt-get update

# Install kubelet, kubeadm, and kubectl
sudo apt-get install -y kubelet kubeadm kubectl

# Pin their version to prevent auto-updates
sudo apt-mark hold kubelet kubeadm kubectl
```

2. Trên nút mặt phẳng điều khiển, khởi tạo cụm:

```bash
sudo kubeadm init --pod-network-cidr=192.168.0.0/16
```

3. Thiết lập quyền truy cập kubectl:

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

4. Cài đặt tiện ích bổ sung mạng pod (ví dụ với Calico):

```bash
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
```

5. Tham gia các nút công nhân vào cụm bằng cách sử dụng mã thông báo từ đầu ra init kubeadm:

```bash
sudo kubeadm join <control-plane-IP>:6443 --token <token> --discovery-token-ca-cert-hash <hash>
```

### Kubespray

Kubespray sử dụng Ansible để tự động hóa việc triển khai và cấu hình cụm Kubernetes theo cách phức tạp hơn kubeadm.

```bash
# Clone the Kubespray repository
git clone https://github.com/kubernetes-sigs/kubespray.git
cd kubespray

# Install dependencies
pip install -r requirements.txt

# Copy the sample inventory and customize it
cp -rfp inventory/sample inventory/mycluster

# Update the inventory file with your servers
vi inventory/mycluster/inventory.ini

# Deploy Kubernetes with Ansible
ansible-playbook -i inventory/mycluster/inventory.ini cluster.yml -b
```

## Dịch vụ Kubernetes được quản lý

Các dịch vụ được quản lý chuyển giao việc quản lý mặt phẳng điều khiển cho các nhà cung cấp đám mây, cho phép bạn tập trung vào các ứng dụng của mình.

### Kubernetes DigitalOcean (DOKS)

DigitalOcean cung cấp dịch vụ Kubernetes được quản lý giúp đơn giản hóa việc thiết lập và bảo trì. [Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận được 200 USD tín dụng miễn phí để dùng thử DOKS.

Bạn có thể tạo một cụm thông qua giao diện người dùng web hoặc sử dụng công cụ CLI của họ, doctl:

```bash
# Install doctl
brew install doctl  # For macOS

# Authenticate with DigitalOcean
doctl auth init

# Create a Kubernetes cluster
doctl kubernetes cluster create my-cluster \
  --region nyc1 \
  --size s-2vcpu-4gb \
  --count 3
```

### Amazon EKS (Dịch vụ Kubernetes đàn hồi)

Amazon EKS là dịch vụ Kubernetes được quản lý bởi AWS. Bạn có thể tạo cụm thông qua Bảng điều khiển quản lý AWS, AWS CLI hoặc eksctl:

```bash
eksctl create cluster \
  --name my-cluster \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 4
```

### Công cụ Kubernetes của Google (GKE)

GKE là dịch vụ Kubernetes được quản lý của Google Cloud, thường được coi là một trong những dịch vụ hoàn thiện nhất:

```bash
gcloud container clusters create my-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-standard-2
```

### Dịch vụ Azure Kubernetes (AKS)

Sản phẩm Kubernetes được quản lý của Microsoft:

```bash
az aks create \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys
```

## Phân phối Kubernetes

Một số nhà cung cấp đóng gói Kubernetes với các công cụ và hỗ trợ bổ sung:

- **Red Hat OpenShift**: Nền tảng Kubernetes dành cho doanh nghiệp với các công cụ tập trung vào hoạt động và nhà phát triển
- **Rancher**: Nền tảng quản lý container hoàn chỉnh
- **VMware Tanzu Kubernetes Grid**: Thời gian chạy Kubernetes sẵn sàng cho doanh nghiệp
- **k3s**: Phân phối Kubernetes nhẹ cho biên và IoT

## Truy cập cụm của bạn

Cho dù bạn chọn tùy chọn nào, bạn sẽ tương tác với cụm của mình bằng kubectl, công cụ dòng lệnh Kubernetes.

### Cài đặt kubectl

Đối với macOS:

```bash
brew install kubectl
```

Đối với Windows có Chocolatey:

```bash
choco install kubernetes-cli
```

Đối với Linux:

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### Cấu hình kubectl

kubectl sử dụng tệp cấu hình (kubeconfig) được đặt tại `~/.kube/config` theo mặc định.

Đối với các cụm cục bộ, lệnh thiết lập thường tự động cấu hình kubectl. Đối với các cụm từ xa, bạn sẽ cần tải xuống kubeconfig:

```bash
# Example with DigitalOcean
doctl kubernetes cluster kubeconfig save my-cluster

# Example with AWS EKS
aws eks update-kubeconfig --name my-cluster --region us-west-2

# Example with GKE
gcloud container clusters get-credentials my-cluster --zone us-central1-a
```

### Xác minh quyền truy cập cụm

Đảm bảo kubectl có thể giao tiếp với cụm của bạn:

```bash
kubectl cluster-info
```

Bạn sẽ thấy địa chỉ mặt phẳng điều khiển Kubernetes và thông tin CoreDNS.

Kiểm tra các nút trong cụm của bạn:

```bash
kubectl get nodes
```

Điều này sẽ hiển thị tất cả các nút trong cụm của bạn với trạng thái, vai trò và phiên bản của chúng.

## Cấu hình cụm

### Thiết lập cụm có tính sẵn sàng cao

Đối với production, thiết lập tính sẵn sàng cao là rất quan trọng. Điều này thường bao gồm:

- Nhiều nút mặt phẳng điều khiển
- Nhiều nút công nhân
- Cụm etcd bên ngoài
- Cân bằng tải cho máy chủ API

Nếu bạn đang sử dụng kubeadm, hãy khởi tạo bằng:

```bash
kubeadm init --control-plane-endpoint "LOAD_BALANCER_DNS:LOAD_BALANCER_PORT" \
    --upload-certs \
    --pod-network-cidr=192.168.0.0/16
```

Sau đó tham gia các nút mặt phẳng điều khiển bổ sung với:

```bash
kubeadm join LOAD_BALANCER_DNS:LOAD_BALANCER_PORT \
    --token <token> \
    --discovery-token-ca-cert-hash <hash> \
    --control-plane \
    --certificate-key <certificate-key>
```

### Nhãn nút và vết bẩn

Tùy chỉnh cách pod được lên lịch cho các nút có nhãn và vết bẩn.

Thêm nhãn vào một nút:

```bash
kubectl label nodes worker-1 disktype=ssd
```

Thêm một vết bẩn để tránh khối lượng công việc nhất định:

```bash
kubectl taint nodes worker-2 dedicated=gpu:NoSchedule
```

### Kiểm soát truy cập dựa trên vai trò (RBAC)

Định cấu hình RBAC để kiểm soát quyền truy cập vào tài nguyên cụm của bạn:

Tạo một vai trò:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
  - apiGroups: ['']
    resources: ['pods']
    verbs: ['get', 'watch', 'list']
```

Tạo ràng buộc vai trò:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
  - kind: User
    name: jane
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### Tiện ích mạng

Kubernetes cần plugin container Network Interface (CNI) để xử lý mạng pod:

- **Calico**: Cung cấp chính sách mạng và mạng
- **Flannel**: Mạng lớp phủ đơn giản
- **Cilium**: Kết nối mạng nâng cao với eBPF
- **Weave Net**: Mạng Docker nhiều máy chủ

Cài đặt Calico với:

```bash
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
```

## Nâng cấp cụm

Kubernetes phát hành phiên bản mới thường xuyên. Nâng cấp bao gồm các bước sau:

1. Nâng cấp mặt phẳng điều khiển
2. Nâng cấp nút công nhân
3. Nâng cấp tiện ích bổ sung cụm

Đối với cụm kubeadm:

```bash
# Control plane
sudo apt-get update
sudo apt-get install -y kubeadm=1.24.0-00
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v1.24.0

# Worker nodes
kubectl drain worker-1 --ignore-daemonsets
sudo apt-get update
sudo apt-get install -y kubelet=1.24.0-00 kubectl=1.24.0-00
sudo systemctl restart kubelet
kubectl uncordon worker-1
```

Đối với các dịch vụ được quản lý, việc nâng cấp thường chỉ cần một vài cú nhấp chuột trong giao diện người dùng hoặc một lệnh CLI đơn giản.

## Sao lưu và khắc phục thảm họa

Thường xuyên sao lưu các thành phần quan trọng của cụm của bạn:

- dữ liệu vvd
- volume liên tục
- Cấu hình

Sao lưu vvd:

```bash
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save snapshot.db
```

## Chọn phương án đúng

Khi chọn giải pháp Kubernetes, hãy xem xét các yếu tố sau:

- **Yêu cầu chuyên môn**: Các dịch vụ được quản lý yêu cầu ít kiến thức chuyên môn về Kubernetes hơn
- **Cost**: Tự quản lý có thể rẻ hơn nhưng đòi hỏi nhiều nỗ lực vận hành hơn
- **Control**: Tự quản lý cung cấp nhiều quyền kiểm soát hơn đối với cấu hình
- **Scalability**: Tất cả các giải pháp đều có thể mở rộng quy mô nhưng với mức độ nỗ lực khác nhau
- **Integration**: Xem xét mức độ tích hợp với các công cụ hiện có của bạn

Đối với nhiều nhóm, việc bắt đầu với một dịch vụ được quản lý như DigitalOcean Kubernetes ([Nhận 200 đô la tín dụng miễn phí](https://m.do.co/c/2a9bba940f39)) mang lại sự cân bằng tốt giữa tính đơn giản và khả năng trong quá trình học tập.

Trong phần tiếp theo, chúng ta sẽ khám phá cách làm việc với pod và container, các đơn vị triển khai cơ bản trong Kubernetes.
