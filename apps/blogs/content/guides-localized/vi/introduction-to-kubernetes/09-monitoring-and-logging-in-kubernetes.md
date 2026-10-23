---
title: "Giám sát và ghi nhật ký trong Kubernetes"
description: Triển khai khả năng quan sát toàn diện với các chiến lược giám sát, ghi nhật ký và khắc phục sự cố hiệu quả
order: 9
---

Duy trì khả năng hiển thị trong cụm và ứng dụng Kubernetes của bạn là điều cần thiết để đảm bảo độ tin cậy, hiệu suất và bảo mật. Trong phần này, chúng ta sẽ tìm hiểu cách triển khai các giải pháp giám sát và ghi nhật ký hiệu quả cũng như các chiến lược khắc phục sự cố trong môi trường Kubernetes của bạn.

## Hiểu khả năng quan sát trong Kubernetes

Khả năng quan sát bao gồm ba trụ cột chính:

1. **Monitoring**: Thu thập và phân tích các số liệu về hiệu suất và tình trạng hệ thống của bạn
2. **Logging**: Ghi lại và lưu trữ nhật ký sự kiện từ các ứng dụng và cơ sở hạ tầng của bạn
3. **Tracing**: Theo dõi các yêu cầu khi chúng truyền qua hệ thống phân tán của bạn

Cùng với nhau, những điều này cung cấp cái nhìn toàn diện về hành vi và trạng thái của cụm của bạn.

## Kiến trúc giám sát Kubernetes

Kubernetes hiển thị số liệu thông qua một số thành phần:

### Máy chủ số liệu

Máy chủ số liệu là một công cụ tổng hợp dữ liệu sử dụng tài nguyên trên toàn cụm nhằm thu thập các số liệu về CPU và bộ nhớ từ kubelet. Đó là một giải pháp đo lường trong bộ nhớ nhẹ, ngắn hạn.

```bash
# Install Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify installation
kubectl get deployment metrics-server -n kube-system

# Use Metrics Server
kubectl top nodes
kubectl top pods --all-namespaces
```

Metrics Server hỗ trợ các tính năng như:

- Bộ chia tỷ lệ tự động pod ngang (HPA)
- Bộ chia tỷ lệ tự động pod dọc (VPA)
- lệnh hàng đầu kubectl

### Số liệu kube-trạng thái

kube-trạng thái-metrics lắng nghe máy chủ API Kubernetes và tạo số liệu về trạng thái của các đối tượng Kubernetes.

```bash
# Install kube-state-metrics
kubectl apply -f https://github.com/kubernetes/kube-state-metrics/tree/main/examples/standard

# Example metrics
# - kube_pod_status_phase
# - kube_deployment_status_replicas
# - kube_node_status_condition
```

### CCố vấn

container Advisor (cAdvisor) được tích hợp vào kubelet và cung cấp các số liệu hiệu suất và mức sử dụng tài nguyên khi chạy container.

### Ngăn xếp giám sát Prometheus và Kubernetes

Để giám sát toàn diện, nhiều tổ chức sử dụng Prometheus Operator và các thành phần liên quan, thường là một phần của Ngăn xếp giám sát Kubernetes (trước đây gọi là Prometheus Operator hoặc kube-prometheus):

```bash
# Clone the repository
git clone https://github.com/prometheus-operator/kube-prometheus.git
cd kube-prometheus

# Create the namespace and CRDs
kubectl create -f manifests/setup

# Wait for the CRDs to be created
until kubectl get servicemonitors --all-namespaces ; do sleep 1; done

# Create the monitoring stack components
kubectl create -f manifests/
```

Cài đặt này:

- Nhà điều hành Prometheus
- Phiên bản Prometheus
- Trình quản lý cảnh báo
- Grafana
- Trình xuất nút
- số liệu kube-trạng thái
- Bảng điều khiển và cảnh báo được cấu hình sẵn

## Thiết lập Prometheus và Grafana

Hãy cùng khám phá thiết lập chi tiết hơn của Prometheus và Grafana để theo dõi:

### Thiết lập Prometheus cơ bản

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: prometheus
  namespace: monitoring
spec:
  serviceAccountName: prometheus
  serviceMonitorSelector:
    matchLabels:
      team: frontend
  resources:
    requests:
      memory: 400Mi
  enableAdminAPI: false
```

### Tạo ServiceMonitor

ServiceMonitor xác định cách Prometheus khám phá và thu thập các dịch vụ:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: example-app
  namespace: monitoring
  labels:
    team: frontend
spec:
  selector:
    matchLabels:
      app: example-app
  endpoints:
    - port: web
      interval: 30s
      path: /metrics
```

### Thiết lập Grafana

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
        - name: grafana
          image: grafana/grafana:9.3.6
          ports:
            - containerPort: 3000
              name: http
          volumeMounts:
            - mountPath: /var/lib/grafana
              name: grafana-storage
            - mountPath: /etc/grafana/provisioning/datasources
              name: grafana-datasources
              readOnly: true
      volumes:
        - name: grafana-storage
          persistentVolumeClaim:
            claimName: grafana-pvc
        - name: grafana-datasources
          configMap:
            name: grafana-datasources
```

Tạo ConfigMap cho nguồn dữ liệu Grafana:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
  namespace: monitoring
data:
  prometheus.yaml: |-
    apiVersion: 1
    datasources:
    - name: Prometheus
      type: prometheus
      url: http://prometheus-operated:9090
      access: proxy
      isDefault: true
```

## Số liệu Prometheus cần thiết

Khi theo dõi Kubernetes, hãy tập trung vào các số liệu chính sau:

### Số liệu nút

- `node_cpu_seconds_total`: Mức sử dụng CPU
- `node_memory_MemAvailable_bytes`: Bộ nhớ khả dụng
- `node_filesystem_avail_bytes`: Dung lượng đĩa trống
- `node_network_transmit_bytes_total` và `node_network_receive_bytes_total`: I/O mạng

### Số liệu tài nguyên Kubernetes

- `kube_pod_container_resource_requests` và `kube_pod_container_resource_limits`: Phân bổ tài nguyên
- `kube_pod_container_status_restarts_total`: container khởi động lại
- `kube_pod_container_status_waiting_reason`: pod đang chờ trạng thái
- `kube_deployment_spec_replicas` và `kube_deployment_status_replicas_available`: Trạng thái triển khai

### Số liệu ứng dụng

- `http_requests_total`: Tổng số yêu cầu HTTP (có nhãn cho mã trạng thái, phương thức, v.v.)
- `http_request_duration_seconds`: Độ trễ yêu cầu
- `application_memory_usage_bytes`: Sử dụng bộ nhớ ứng dụng
- `application_database_connections`: Số lượng kết nối cơ sở dữ liệu

## Tạo bảng điều khiển hiệu quả

Thiết kế bảng điều khiển Grafana hữu ích bao gồm:

1. **HTổ chức cấp bậc**:

   - Tổng quan về cụm
   - Không gian tên/chế độ xem ứng dụng
   - Chi tiết pod/container

2. **Các thành phần bảng điều khiểnKey**:

   - Sử dụng tài nguyên (CPU, bộ nhớ, đĩa, mạng)
   - Số liệu ứng dụng (yêu cầu, độ trễ, tỷ lệ lỗi)
   - Kubernetes trạng thái (pod đang chạy, trạng thái triển khai)
   - Cảnh báo và sự cố

3. **ETrực quan hóa hiệu quả**:
   - Sử dụng các loại biểu đồ thích hợp
   - Thêm ngưỡng và đường tham chiếu
   - Bao gồm các truyền thuyết và tài liệu
   - Tạo các biến mẫu để lọc

Đoạn mã JSON của trang tổng quan mẫu:

```json
{
  "panels": [
    {
      "title": "CPU Usage",
      "type": "graph",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "sum(rate(container_cpu_usage_seconds_total{namespace=\"$namespace\",pod=~\"$pod\"}[5m])) by (pod)",
          "legendFormat": "{{pod}}",
          "refId": "A"
        }
      ],
      "yaxes": [
        {
          "format": "percentunit",
          "label": "CPU Usage"
        }
      ],
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      }
    }
  ],
  "templating": {
    "list": [
      {
        "name": "namespace",
        "type": "query",
        "datasource": "Prometheus",
        "query": "label_values(kube_namespace_labels, namespace)"
      },
      {
        "name": "pod",
        "type": "query",
        "datasource": "Prometheus",
        "query": "label_values(kube_pod_info{namespace=\"$namespace\"}, pod)"
      }
    ]
  }
}
```

## Thiết lập cảnh báo

Định cấu hình cảnh báo để thông báo cho bạn về các vấn đề tiềm ẩn:

### Quy tắc của Prometheus AlertManager

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: kubernetes-apps
  namespace: monitoring
  labels:
    prometheus: k8s
    role: alert-rules
spec:
  groups:
    - name: kubernetes-apps
      rules:
        - alert: KubePodCrashLooping
          expr: rate(kube_pod_container_status_restarts_total{job="kube-state-metrics"}[15m]) * 60 * 5 > 0
          for: 15m
          labels:
            severity: critical
          annotations:
            summary: 'Pod {{ $labels.namespace }}/{{ $labels.pod }} is crash looping'
            description: 'Pod {{ $labels.namespace }}/{{ $labels.pod }} is restarting {{ printf "%.2f" $value }} times every 5 minutes.'
```

### Cấu hình Trình quản lý cảnh báo

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: main
  namespace: monitoring
spec:
  replicas: 3
  configSecret: alertmanager-config
```

Định cấu hình AlertManager với ConfigMap:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: alertmanager-config
  namespace: monitoring
stringData:
  alertmanager.yaml: |-
    global:
      resolve_timeout: 5m
      slack_api_url: 'http[s]://hooks[.]slack[.]com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'

    route:
      group_by: ['namespace', 'alertname']
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 12h
      receiver: 'slack-notifications'
      routes:
      - match:
          severity: critical
        receiver: 'slack-critical'

    receivers:
    - name: 'slack-notifications'
      slack_configs:
      - channel: '#alerts'
        title: '[{{ .Status | toUpper }}] {{ .CommonLabels.alertname }}'
        text: "{{ range .Alerts }}{{ .Annotations.description }}\n{{ end }}"

    - name: 'slack-critical'
      slack_configs:
      - channel: '#critical-alerts'
        title: '[CRITICAL] {{ .CommonLabels.alertname }}'
        text: "{{ range .Alerts }}{{ .Annotations.description }}\n{{ end }}"
```

## Đăng nhập Kubernetes

Kubernetes không cung cấp giải pháp ghi nhật ký toàn cụm tích hợp. Thay vào đó, có một số mẫu phổ biến:

### Ghi nhật ký cấp nút

Cách tiếp cận đơn giản nhất trong đó các ứng dụng ghi nhật ký vào thiết bị xuất chuẩn/thiết bị xuất chuẩn, được ghi lại bởi thời gian chạy container:

```bash
# View logs for a pod
kubectl logs nginx-pod

# View logs for a specific container in a pod
kubectl logs nginx-pod -c nginx

# Follow logs (stream in real-time)
kubectl logs -f nginx-pod

# Show logs from the previous container instance
kubectl logs nginx-pod --previous
```

### Đăng nhập bằng DaemonSet

Triển khai tác nhân ghi nhật ký trên mỗi nút để thu thập và chuyển tiếp nhật ký:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: logging
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      tolerations:
        - key: node-role.kubernetes.io/master
          effect: NoSchedule
      containers:
        - name: fluentd
          image: fluent/fluentd:v1.14-1
          volumeMounts:
            - name: varlog
              mountPath: /var/log
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
            - name: config
              mountPath: /fluentd/etc
      volumes:
        - name: varlog
          hostPath:
            path: /var/log
        - name: varlibdockercontainers
          hostPath:
            path: /var/lib/docker/containers
        - name: config
          configMap:
            name: fluentd-config
```

### Ngăn xếp EFK/ELK

Một ngăn xếp ghi nhật ký phổ biến bao gồm:

- **Elasticsearch**: Để lưu trữ và tìm kiếm nhật ký
- **Fluentd/Logstash**: Để thu thập và xử lý nhật ký
- **Kibana**: Để hiển thị và phân tích nhật ký

```yaml
# Elasticsearch StatefulSet (simplified)
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
  namespace: logging
spec:
  serviceName: elasticsearch
  replicas: 3
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
        - name: elasticsearch
          image: docker.elastic.co/elasticsearch/elasticsearch:7.17.3
          env:
            - name: discovery.type
              value: single-node
          ports:
            - containerPort: 9200
              name: rest
            - containerPort: 9300
              name: inter-node
          volumeMounts:
            - name: data
              mountPath: /usr/share/elasticsearch/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ['ReadWriteOnce']
        resources:
          requests:
            storage: 20Gi
```

### Loki

Grafana Loki là một giải pháp thay thế nhẹ cho Elaticsearch, được thiết kế dành riêng cho nhật ký:

```yaml
# Loki configuration (simplified)
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: loki
  namespace: logging
spec:
  serviceName: loki
  replicas: 1
  selector:
    matchLabels:
      app: loki
  template:
    metadata:
      labels:
        app: loki
    spec:
      containers:
        - name: loki
          image: grafana/loki:2.7.0
          ports:
            - containerPort: 3100
              name: http
          volumeMounts:
            - name: config
              mountPath: /etc/loki
            - name: data
              mountPath: /data
      volumes:
        - name: config
          configMap:
            name: loki-config
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ['ReadWriteOnce']
        resources:
          requests:
            storage: 10Gi
```

## Ghi nhật ký có cấu trúc

Triển khai tính năng ghi nhật ký có cấu trúc trong ứng dụng của bạn để có khả năng tìm kiếm tốt hơn:

### Ví dụ về ghi nhật ký JSON

```python
# Python example with json logging
import logging
import json
import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "path": record.pathname,
            "function": record.funcName,
            "line": record.lineno
        }

        if hasattr(record, 'request_id'):
            log_record["request_id"] = record.request_id

        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_record)

# Set up the logger
logger = logging.getLogger("my-app")
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Usage
logger.info("Processing order", extra={"request_id": "abc-123"})
```

Đầu ra:

```json
{
  "timestamp": "2023-05-17T12:34:56.789012",
  "level": "INFO",
  "message": "Processing order",
  "logger": "my-app",
  "path": "/app/main.py",
  "function": "process_order",
  "line": 42,
  "request_id": "abc-123"
}
```

## Truy tìm phân tán

Đối với các kiến trúc vi dịch vụ phức tạp, tính năng theo dõi phân tán giúp bạn hiểu các luồng yêu cầu:

### Thiết lập Jaeger

```yaml
# Jaeger all-in-one deployment (for development)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
  namespace: tracing
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
        - name: jaeger
          image: jaegertracing/all-in-one:1.35
          ports:
            - containerPort: 6831
              name: jaeger-thrift
            - containerPort: 16686
              name: web
```

### Thiết bị ứng dụng

Sử dụng OpenTelemetry để trang bị cho ứng dụng của bạn:

```javascript
// Node.js example with OpenTelemetry
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

// Configure the tracer
const provider = new NodeTracerProvider();

const exporter = new JaegerExporter({
  serviceName: 'my-service',
  endpoint: 'http://jaeger-collector:14268/api/traces',
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

// Register auto-instrumentations
registerInstrumentations({
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

// Your application code follows
const express = require('express');
const app = express();

app.get('/api/orders', (req, res) => {
  // This request is automatically traced
  res.json({ orders: [] });
});

app.listen(3000);
```

## Tích hợp số liệu, ghi nhật ký và theo dõi

Để có khả năng quan sát toàn diện, hãy tích hợp cả ba trụ cột:

1. **ID tương quan**: Bao gồm ID yêu cầu trong nhật ký, số liệu và dấu vết
2. **Service Mesh**: Sử dụng Istio hoặc Linkerd để có khả năng quan sát tích hợp
3. **Dashboards**: Tạo trang tổng quan hợp nhất liên kết số liệu với nhật ký và dấu vết

Ví dụ về mối tương quan trong ứng dụng Node.js:

```javascript
app.use((req, res, next) => {
  // Generate or extract request ID
  const requestId = req.headers['x-request-id'] || uuid.v4();
  req.requestId = requestId;

  // Add to response headers
  res.setHeader('x-request-id', requestId);

  // Set up correlation for logging
  req.log = logger.child({ requestId });

  // Add to tracing span
  const span = tracer.getCurrentSpan();
  if (span) {
    span.setAttribute('request_id', requestId);
  }

  next();
});
```

## Khắc phục sự cố Kubernetes

### Công cụ khắc phục sự cố phổ biến

```bash
# Check pod status
kubectl get pods

# Describe pod for events and details
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>

# Check node status
kubectl describe node <node-name>

# Check resource usage
kubectl top pods
kubectl top nodes

# Execute commands in containers
kubectl exec -it <pod-name> -- /bin/sh

# View network policies
kubectl get networkpolicies
```

### Khắc phục sự cố pod

Đối với pod bị kẹt trong trạng thái đang chờ xử lý:

1. Kiểm tra nguồn lực không đủ:
   ```bash
   kubectl describe pod <pod-name> | grep -A 10 Events
   ```
2. Xác minh ràng buộc PVC (nếu sử dụng volume):
   ```bash
   kubectl get pvc
   ```
3. Kiểm tra bộ chọn nút hoặc vết bẩn:
   ```bash
   kubectl get pod <pod-name> -o yaml | grep -A 10 nodeSelector
   ```

Đối với CrashLoopBackOff:

1. Kiểm tra nhật ký container:
   ```bash
   kubectl logs <pod-name>
   ```
2. Kiểm tra giới hạn tài nguyên bị vượt quá:
   ```bash
   kubectl describe pod <pod-name> | grep -A 3 Limits
   ```
3. Kiểm tra đầu dò độ sống:
   ```bash
   kubectl get pod <pod-name> -o yaml | grep -A 10 livenessProbe
   ```

### Sử dụng Gỡ lỗi container

Trong Kubernetes 1.18+, bạn có thể đính kèm container gỡ lỗi vào pod đang chạy:

```bash
kubectl debug -it <pod-name> --image=busybox --target=<container-name>
```

### Tạo gỡ lỗi pod

Tạo pod tạm thời để gỡ lỗi:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: debug-pod
spec:
  containers:
    - name: debug
      image: nicolaka/netshoot
      command:
        - sleep
        - '3600'
  restartPolicy: Never
```

### Gỡ lỗi mạng

Đối với các sự cố mạng:

```bash
# Check services
kubectl get services

# Check endpoints
kubectl get endpoints <service-name>

# Test DNS resolution
kubectl run -it --rm debug --image=busybox -- nslookup kubernetes.default

# Test connectivity
kubectl run -it --rm debug --image=nicolaka/netshoot -- curl -v <service-name>

# Check network policies
kubectl get networkpolicies
```

## Giám sát cấp cụm

Ngoài giám sát ứng dụng, hãy triển khai giám sát cấp cụm:

### Giám sát mặt phẳng điều khiển

Giám sát các thành phần mặt phẳng điều khiển:

- máy chủ kube
- v.v.
- lập lịch kube
- quản lý bộ điều khiển kube

Số liệu chính:

- Độ trễ yêu cầu máy chủ API
- thay đổi lãnh đạo etcd
- Trình lập lịch trình đang chờ xử lý pod
- Độ dài hàng đợi của trình quản lý bộ điều khiển

### Lập kế hoạch năng lực nguồn lực

Theo dõi xu hướng để lập kế hoạch cho năng lực trong tương lai:

- Xu hướng sử dụng CPU/bộ nhớ của nút
- Tăng trưởng sử dụng lưu trữ
- Sử dụng băng thông mạng
- Yêu cầu tài nguyên so với mức sử dụng thực tế

### Ghi nhật ký kiểm tra

Kích hoạt tính năng ghi nhật ký kiểm tra Kubernetes để giám sát bảo mật:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kube-apiserver
spec:
  containers:
    - name: kube-apiserver
      command:
        - kube-apiserver
        - --audit-log-path=/var/log/audit.log
        - --audit-log-maxage=30
        - --audit-log-maxbackup=10
        - --audit-policy-file=/etc/kubernetes/audit-policy.yaml
      volumeMounts:
        - mountPath: /etc/kubernetes/audit-policy.yaml
          name: audit
          readOnly: true
        - mountPath: /var/log/audit.log
          name: audit-log
          readOnly: false
  volumes:
    - name: audit
      hostPath:
        path: /etc/kubernetes/audit-policy.yaml
        type: File
    - name: audit-log
      hostPath:
        path: /var/log/audit.log
        type: FileOrCreate
```

Với tệp chính sách kiểm toán:

```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  - level: Metadata
    resources:
      - group: ''
        resources: ['pods', 'services']
  - level: RequestResponse
    resources:
      - group: ''
        resources: ['secrets', 'configmaps']
```

## Giám sát chi phí

Theo dõi chi phí Kubernetes của bạn bằng các công cụ như:

- Kubecost
- Sức khỏe đám mây
- Prometheus + bảng điều khiển tùy chỉnh

Các số liệu chính cần theo dõi:

- Phân bổ chi phí theo không gian tên
- Tài nguyên nhàn rỗi
- Hiệu quả tài nguyên (yêu cầu so với mức sử dụng)
- Chi phí volume liên tục

## Sử dụng DigitalOcean để giám sát Kubernetes

DigitalOcean Kubernetes giúp việc giám sát trở nên dễ dàng với:

- Máy chủ số liệu tích hợp
- Tích hợp tự nhiên với các công cụ giám sát phổ biến
- Prometheus và Grafana được quản lý được cung cấp dưới dạng tiện ích bổ sung
- Tổng hợp nhật ký đơn giản với các công cụ hiện có

[Đăng ký với DigitalOcean](https://m.do.co/c/2a9bba940f39) để nhận tín dụng miễn phí trị giá 200 USD và triển khai giám sát hiệu quả cho các ứng dụng Kubernetes của bạn.

## Thực tiễn tốt nhất để theo dõi và ghi nhật ký Kubernetes

1. **Bắt đầu với những điều cần thiết**: Trước tiên hãy tập trung vào các số liệu và nhật ký chính
2. **Sử dụng nhãn nhất quán**: Ghi nhãn phù hợp giúp lọc và cảnh báo hiệu quả
3. **Triển khai cả giám sát hộp trắng và hộp đen**: Giám sát cả bên trong và bên ngoài
4. **Tạo cảnh báo có ý nghĩa**: Tập trung vào các cảnh báo có tín hiệu cao, có thể hành động
5. **Giữ lại nhật ký một cách thích hợp**: Cân bằng chi phí lưu trữ với nhu cầu tuân thủ
6. **Sử dụng ghi nhật ký có cấu trúc**: Làm cho nhật ký dễ tìm kiếm và phân tích hơn
7. **Giới hạn tốc độ triển khai cho nhật ký**: Ngăn chặn tình trạng ngập nhật ký
8. **Định cấu hình xoay vòng nhật ký thích hợp**: Quản lý dung lượng ổ đĩa trên các nút
9. **DGhi lại chiến lược giám sát của bạn**: Đảm bảo các thành viên trong nhóm hiểu cách thiết lập
10. **Thường xuyên xem xét và tinh chỉnh**: Nhu cầu giám sát phát triển cùng với ứng dụng của bạn

Trong phần tiếp theo, chúng ta sẽ khám phá các phương pháp hay nhất về bảo mật Kubernetes để đảm bảo các cụm và khối lượng công việc của bạn vẫn được bảo vệ trước các mối đe dọa.
