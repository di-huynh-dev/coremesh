---
title: "Lưu trữ bền vững trong Kubernetes"
description: Tìm hiểu cách quản lý dữ liệu liên tục cho các ứng dụng có trạng thái bằng tùy chọn lưu trữ Kubernetes
order: 7
---

container theo thiết kế là phù du, khi pod bị xóa hoặc lên lịch lại, dữ liệu nội bộ của nó sẽ bị mất. Tuy nhiên, hầu hết các ứng dụng cần lưu trữ dữ liệu ngoài vòng đời container. Kubernetes cung cấp một số khái niệm trừu tượng để quản lý bộ nhớ liên tục cho ứng dụng của bạn. Trong phần này, chúng ta sẽ khám phá cách sử dụng volume, volume liên tục và các lớp lưu trữ để quản lý dữ liệu trạng thái.

## Tìm hiểu kiến trúc lưu trữ Kubernetes

Kubernetes có kiến trúc lưu trữ phân lớp với một số thành phần chính:

1. **Volumes**: Sự trừu tượng hóa lưu trữ cơ bản nhất, gắn liền với vòng đời pod
2. **Persistent volume (PV)**: Tài nguyên lưu trữ trên toàn cụm tồn tại độc lập với pod
3. **Khiếu nại volume liên tục (PVC)**: Yêu cầu lưu trữ của người dùng bị ràng buộc với volume liên tục
4. **Lớp lưu trữ**: Xác định các loại lưu trữ với các đặc điểm khác nhau

Hãy cùng khám phá chi tiết từng thành phần này.

## Các loại volume cơ bản

Kubernetes hỗ trợ nhiều loại volume gắn trực tiếp vào pod. Sau đây là một số loại thường được sử dụng:

### TrốngDir

`emptyDir` volume được tạo khi pod được gán cho một nút và tồn tại miễn là pod chạy trên nút đó. Khi pod bị xóa, dữ liệu trong `emptyDir` cũng bị xóa.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pd
spec:
  containers:
    - name: test-container
      image: nginx
      volumeMounts:
        - mountPath: /cache
          name: cache-volume
  volumes:
    - name: cache-volume
      emptyDir: {}
```

Các trường hợp sử dụng cho `emptyDir`:

- Không gian trống cho các tập tin tạm thời
- Lưu trữ điểm kiểm tra cho các tính toán dài
- Bộ nhớ dùng chung cho container trong cùng pod

### Đường dẫn máy chủ

`hostPath` volume gắn tệp hoặc thư mục từ hệ thống tệp của nút máy chủ vào pod của bạn.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-hostpath
spec:
  containers:
    - name: test-container
      image: nginx
      volumeMounts:
        - mountPath: /test-data
          name: test-volume
  volumes:
    - name: test-volume
      hostPath:
        path: /data
        type: Directory
```

Trường `type` có thể là:

- `DirectoryOrCreate`: Tạo thư mục nếu nó không tồn tại
- `Directory`: Thư mục phải tồn tại
- `FileOrCreate`: Tạo một tệp trống nếu nó không tồn tại
- `File`: Tệp phải tồn tại
- `Socket`: Ổ cắm UNIX phải tồn tại
- `CharDevice`: Phải tồn tại thiết bị ký tự
- `BlockDevice`: Thiết bị chặn phải tồn tại

> ⚠️ **Warning**: `hostPath` volume gây ra rủi ro bảo mật vì chúng cho phép pod truy cập vào hệ thống tệp máy chủ. Sử dụng thận trọng trong môi trường production.

### ConfigMap và bí mật

Như chúng tôi đã đề cập ở phần trước, ConfigMap và Secrets có thể được gắn dưới dạng volume để cung cấp dữ liệu cấu hình và thông tin nhạy cảm cho pod.

### Các loại volume cơ bản khác

Kubernetes hỗ trợ nhiều loại volume khác cho nhiều trường hợp sử dụng khác nhau:

- `downwardAPI`: Hiển thị dữ liệu pod và container cho các ứng dụng
- `projected`: Ánh xạ một số nguồn volume vào cùng một thư mục
- `csi`: Giao diện lưu trữ container dành cho plugin lưu trữ của bên thứ ba
- volume dành riêng cho nhà cung cấp đám mây: `awsElasticBlockStore`, `azureDisk`, `gcePersistentDisk`

## Volume liên tục và các xác nhận quyền sở hữu

Đối với dữ liệu cần tồn tại khi pod khởi động lại và lên lịch lại, Kubernetes cung cấp Persistent volume (PV) và Persistent volume Claims (PVC).

### Volume liên tục (PV)

PersistentVolume là một phần lưu trữ do quản trị viên cung cấp hoặc được cung cấp động bằng Lớp lưu trữ. Nó tồn tại độc lập với mọi pod.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-example
spec:
  capacity:
    storage: 10Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: /data/pv-example
```

Các trường chính trong PersistentVolume:

- **capacity**: Dung lượng lưu trữ khả dụng
- **volumeMode**: Hệ thống tệp (mặc định) hoặc Chặn
- **accessModes**: Cách gắn volume
  - `ReadWriteOnce` (RWO): volume có thể được gắn dưới dạng đọc-ghi bởi một nút duy nhất
  - `ReadOnlyMany` (ROX): volume có thể được gắn ở chế độ chỉ đọc bởi nhiều nút
  - `ReadWriteMany` (RWX): volume có thể được gắn dưới dạng đọc-ghi bởi nhiều nút
- **persistentVolumeReclaimPolicy**: Điều gì xảy ra khi yêu cầu được đưa ra
  - `Retain`: Thu hồi thủ công (mặc định)
  - `Delete`: Tự động xóa PV và bộ nhớ
  - `Recycle`: Xóa cơ bản (không dùng nữa)
- **storageClassName**: Tên của StorageClass để cung cấp động
- Các tham số dành riêng cho volume (ví dụ: `hostPath`, `nfs`, v.v.)

### Tuyên bố volume liên tục (PVC)

PersistentVolumeClaim là yêu cầu lưu trữ của người dùng. Nó tương tự như pod ở chỗ pod tiêu thụ tài nguyên nút và PVC tiêu thụ tài nguyên PV.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-example
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
```

Khi bạn tạo PVC, Kubernetes sẽ tìm thấy PV phù hợp dựa trên:

- Chế độ truy cập
- Kích thước
- Lớp lưu trữ
- Chế độ volume
- Bộ chọn

### Sử dụng PVC trong pod

Sau khi có PVC, bạn có thể sử dụng nó trong pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pvc-pod-example
spec:
  containers:
    - name: app
      image: nginx
      volumeMounts:
        - mountPath: '/usr/share/nginx/html'
          name: mypd
  volumes:
    - name: mypd
      persistentVolumeClaim:
        claimName: pvc-example
```

## Lớp lưu trữ

StorageClass cho phép cung cấp động Persistent volume. Thay vì cung cấp trước các PV, quản trị viên có thể xác định các lớp lưu trữ và cho phép Kubernetes tạo các PV theo yêu cầu.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
  fsType: ext4
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: Immediate
```

Các trường chính trong StorageClass:

- **provisioner**: Plugin volume để sử dụng
- Thông số ****: Dành riêng cho provisioner
- **reclaimPolicy**: Điều gì xảy ra với PV khi PVC bị xóa
- **allowVolumeExpansion**: Liệu PVC có thể được mở rộng hay không
- **volumeBindingMode**:
  - `Immediate`: Liên kết xảy ra ngay lập tức (mặc định)
  - `WaitForFirstConsumer`: Việc liên kết bị trì hoãn cho đến khi pod sử dụng PVC được tạo

### Sử dụng lớp lưu trữ

Để sử dụng StorageClass, hãy tham chiếu nó trong PVC của bạn:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: fast-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: fast
```

Nếu bạn không chỉ định StorageClass thì StorageClass mặc định sẽ được sử dụng (nếu có).

## Cung cấp động

Với StorageClasses, bạn có thể cung cấp động volume liên tục. Điều này có nghĩa là:

1. Bạn tạo một StorageClass xác định loại lưu trữ
2. Người dùng tạo PVC yêu cầu lưu trữ từ lớp đó
3. Kubernetes tự động cung cấp PV phù hợp

Quy trình công việc này thuận tiện hơn nhiều so với việc tạo PV thủ công, đặc biệt là trong môi trường đám mây.

## Giải pháp lưu trữ chung

Hãy cùng khám phá một số giải pháp lưu trữ phổ biến được sử dụng với Kubernetes:

### Bộ nhớ cục bộ

Bộ nhớ cục bộ đề cập đến các đĩa hoặc thư mục được gắn trên các nút cụ thể. Mặc dù điều này mang lại hiệu suất cao nhưng lại thiếu tính di động vì pod chỉ có thể chạy trên các nút có bộ lưu trữ đính kèm.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: local-pv
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  storageClassName: local-storage
  local:
    path: /mnt/disks/ssd1
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values:
                - worker-node-1
```

### Lưu trữ NFS

Hệ thống tệp mạng (NFS) cung cấp bộ nhớ dùng chung có thể được gắn bởi nhiều nút.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nfs-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  nfs:
    server: nfs-server.example.com
    path: '/exports'
```

### Nhà cung cấp đám mây

Mỗi nhà cung cấp đám mây đều cung cấp các tùy chọn lưu trữ riêng:

#### AWS EBS

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-sc
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  fsType: ext4
  encrypted: 'true'
```

#### Đĩa Azure

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: azure-disk
provisioner: kubernetes.io/azure-disk
parameters:
  storageaccounttype: Premium_LRS
  kind: Managed
```

#### Đĩa liên tục của Google

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gce-pd
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-standard
  fstype: ext4
```

#### Lưu trữ khối DigitalOcean

DigitalOcean Kubernetes bao gồm StorageClass tự động cung cấp Bộ lưu trữ khối DigitalOcean volume:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: do-block-storage
  annotations:
    storageclass.kubernetes.io/is-default-class: 'true'
provisioner: dobs.csi.digitalocean.com
parameters:
  fstype: ext4
```

Để sử dụng StorageClass này, chỉ cần tạo PVC mà không chỉ định tên StorageClass:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: do-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận 200 USD tín dụng miễn phí và thử tích hợp Block Storage với Kubernetes.

## StatefulSets với bộ lưu trữ liên tục

StatefulSets lý tưởng cho các ứng dụng yêu cầu số nhận dạng mạng duy nhất, ổn định, lưu trữ liên tục ổn định cũng như triển khai và mở rộng quy mô theo thứ tự. Khi được sử dụng với PVC, chúng cung cấp giải pháp hoàn chỉnh cho các ứng dụng có trạng thái.

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
          image: postgres:13
          ports:
            - containerPort: 5432
              name: postgres
          volumeMounts:
            - name: pgdata
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: pgdata
      spec:
        accessModes: ['ReadWriteOnce']
        storageClassName: 'standard'
        resources:
          requests:
            storage: 10Gi
```

Trường `volumeClaimTemplates` tự động tạo PVC cho mỗi pod trong StatefulSet. Khi pod được lên lịch lại, chúng sẽ gắn lại vào cùng một PVC và do đó có cùng một dữ liệu.

## Ảnh chụp nhanh volume

Kubernetes cho phép bạn tạo ảnh chụp nhanh của volume cho mục đích sao lưu hoặc di chuyển.

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: data-snapshot
spec:
  volumeSnapshotClassName: csi-hostpath-snapclass
  source:
    persistentVolumeClaimName: pvc-example
```

Để khôi phục từ ảnh chụp nhanh:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-from-snapshot
spec:
  dataSource:
    name: data-snapshot
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

## Mở rộng volume liên tục

Một số nhà cung cấp dịch vụ lưu trữ cho phép bạn mở rộng PVC mà không làm gián đoạn ứng dụng:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: expandable-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi # Initial size
  storageClassName: expandable-storage
```

Để mở rộng nó:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: expandable-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi # Increased size
  storageClassName: expandable-storage
```

StorageClass phải có `allowVolumeExpansion: true` để hoạt động.

## Cấu trúc liên kết volume

Trong các cụm nhiều vùng, bạn có thể muốn giới hạn volume ở các vùng cụ thể. Cấu trúc liên kết volume cho phép điều này:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: topology-aware-storage
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-standard
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
  - matchLabelExpressions:
      - key: failure-domain.beta.kubernetes.io/zone
        values:
          - us-central1-a
          - us-central1-b
```

## Mẫu lưu trữ nâng cao

### ĐọcWriteMany (RWX) volume

Đối với các ứng dụng cần quyền truy cập chung vào cùng một volume từ nhiều pod, hãy sử dụng các giải pháp lưu trữ hỗ trợ chế độ truy cập ReadWriteMany:

- **NFS**: Hệ thống tệp mạng
- **CephFS**: Hệ thống tập tin phân tán của Ceph
- **GlusterFS**: Hệ thống tệp mạng có thể mở rộng
- **Azure File**: Chia sẻ tệp SMB
- **AWS EFS**: Hệ thống tệp đàn hồi

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: shared-pvc
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 10Gi
  storageClassName: nfs-storage
```

### Volume phù du

Để lưu trữ gắn liền với vòng đời của pod nhưng linh hoạt hơn `emptyDir`, hãy sử dụng volume tạm thời:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-ephemeral
spec:
  containers:
    - name: test-container
      image: nginx
      volumeMounts:
        - mountPath: /test
          name: ephemeral-volume
  volumes:
    - name: ephemeral-volume
      ephemeral:
        volumeClaimTemplate:
          metadata:
            labels:
              type: ephemeral
          spec:
            accessModes: ['ReadWriteOnce']
            storageClassName: 'fast-storage'
            resources:
              requests:
                storage: 1Gi
```

### Di chuyển dữ liệu

Để di chuyển dữ liệu giữa các cụm hoặc lớp lưu trữ:

1. Tạo một VolumeSnapshot của PVC gốc
2. Tạo PVC mới trong môi trường đích, tham chiếu ảnh chụp nhanh
3. Tạo di chuyển pod sao chép dữ liệu

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: data-migration
spec:
  containers:
    - name: migrator
      image: alpine
      command: ['sh', '-c', 'cp -rv /source/* /destination/']
      volumeMounts:
        - name: source-volume
          mountPath: /source
        - name: destination-volume
          mountPath: /destination
  volumes:
    - name: source-volume
      persistentVolumeClaim:
        claimName: source-pvc
    - name: destination-volume
      persistentVolumeClaim:
        claimName: destination-pvc
  restartPolicy: Never
```

## Chiến lược sao lưu và khôi phục

Kubernetes không cung cấp giải pháp sao lưu tích hợp nhưng bạn có thể triển khai một số phương pháp:

### 1. Ảnh chụp nhanh volume

Như đã đề cập trước đó, hãy sử dụng API ảnh chụp nhanh volume để tạo ảnh chụp nhanh theo thời điểm của volume.

### 2. Sao lưu cấp ứng dụng

Đối với cơ sở dữ liệu và các ứng dụng có trạng thái khác, hãy sử dụng các công cụ sao lưu dành riêng cho ứng dụng:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
spec:
  schedule: '0 1 * * *' # Daily at 1:00 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: postgres:13
              command:
                - /bin/sh
                - -c
                - pg_dump -h postgres -U postgres -d mydb | gzip > /backup/mydb-$(date +%Y%m%d).sql.gz
              env:
                - name: PGPASSWORD
                  valueFrom:
                    secretKeyRef:
                      name: postgres-credentials
                      key: password
              volumeMounts:
                - name: backup-volume
                  mountPath: /backup
          volumes:
            - name: backup-volume
              persistentVolumeClaim:
                claimName: backup-pvc
          restartPolicy: OnFailure
```

### 3. Giải pháp sao lưu bên ngoài

Một số công cụ được thiết kế đặc biệt để sao lưu Kubernetes:

- **Velero**: Sao lưu và di chuyển tài nguyên Kubernetes và volume
- **Kasten K10**: Được xây dựng nhằm mục đích sao lưu Kubernetes và khắc phục thảm họa
- **Trilios**: Bảo vệ dữ liệu cho các ứng dụng Kubernetes

## Cân nhắc về hiệu suất

Khi thiết kế hiệu năng lưu trữ trong Kubernetes:

1. **Chọn loại lưu trữ phù hợp**: SSD cho IOPS cao, HDD cho thông lượng cao
2. **Xem xét lưu trữ cục bộ** cho các ứng dụng nhạy cảm với độ trễ
3. **Sử dụng bộ nhớ đệm volume** cho dữ liệu được truy cập thường xuyên
4. **Đặt các yêu cầu và giới hạn tài nguyên phù hợp** cho pod liên quan đến lưu trữ
5. **Sử dụng QoS** thích hợp cho lưu lượng lưu trữ
6. **Giám sát số liệu lưu trữ** để xác định tắc nghẽn

## Thực tiễn tốt nhất để lưu trữ Kubernetes

1. **Lên kế hoạch để duy trì dữ liệu**: Quyết định dữ liệu nào cần tồn tại pod khởi động lại

2. **Sử dụng bộ lưu trữ phù hợp cho công việc**: Kết hợp các đặc điểm lưu trữ với yêu cầu ứng dụng

3. **Xác định chính xác các yêu cầu tài nguyên**: Yêu cầu những gì bạn cần để tránh cung cấp quá mức

4. **Triển khai giám sát chủ động**: Theo dõi các vấn đề về hiệu suất và dung lượng lưu trữ

5. **Kế hoạch sao lưu và phục hồi**: Triển khai và kiểm tra các quy trình sao lưu

6. **Xem xét cách tiếp cận đa vùng**: Phân phối lưu trữ trên các vùng khả dụng

7. **Sử dụng nhãn và chú thích**: Sắp xếp và mô tả tài nguyên lưu trữ của bạn

8. **Các kịch bản lỗi thử nghiệm**: Xác minh rằng ứng dụng của bạn có thể khôi phục sau lỗi lưu trữ

9. **DKiến trúc lưu trữ tài liệu**: Duy trì tài liệu rõ ràng về thiết lập lưu trữ của bạn

10. **Thực hiện bảo mật thích hợp**: Sử dụng mã hóa cho dữ liệu nhạy cảm

## DigitalOcean volume dành cho Kubernetes

DigitalOcean giúp dễ dàng cung cấp và quản lý bộ nhớ liên tục cho các cụm Kubernetes của bạn. DigitalOcean volume cung cấp:

- Lưu trữ khối dựa trên SSD
- Mã hóa tự động ở phần còn lại
- Ảnh chụp nhanh volume tự động
- Tích hợp Kubernetes liền mạch thông qua trình điều khiển CSI

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận tín dụng miễn phí trị giá 200 USD và thử các giải pháp lưu trữ của họ với các ứng dụng Kubernetes của bạn.

Trong phần tiếp theo, chúng ta sẽ khám phá cách quản lý tài nguyên Kubernetes, bao gồm cách tối ưu hóa tài nguyên điện toán của cụm và triển khai các chiến lược mở rộng quy mô hiệu quả.
