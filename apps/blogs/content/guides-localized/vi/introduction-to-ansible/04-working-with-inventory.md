---
title: "Làm việc với inventory"
description: Tìm hiểu cách tổ chức và quản lý nhiều máy chủ bằng cách sử dụng các tệp, nhóm và cấu hình dành riêng cho máy chủ lưu trữ Ansible inventory.
order: 4
---

Khi cơ sở hạ tầng của bạn phát triển, việc liệt kê các máy chủ theo cách thủ công trong các lệnh đặc biệt trở nên không thực tế. Hệ thống inventory của Ansible cung cấp một cách có cấu trúc để tổ chức các máy chủ, xác định nhóm và quản lý các môi trường khác nhau. Bạn sẽ học cách tạo cấu hình inventory linh hoạt có quy mô từ một vài máy chủ đến hàng trăm máy chủ.

## Hiểu cấu trúc inventory

Các tệp inventory xác định máy chủ nào Ansible quản lý và cách kết nối với chúng. Bạn có thể tổ chức các máy chủ thành các nhóm logic, đặt tham số kết nối và xác định các biến áp dụng cho các máy chủ hoặc nhóm cụ thể.

### Các định dạng inventory cơ bản

Ansible hỗ trợ cả định dạng INI và YAML inventory. Hãy bắt đầu với định dạng INI vì nó được sử dụng phổ biến hơn:

```ini
# Basic inventory.ini
[webservers]
web1.example.com
web2.example.com
web3.example.com

[databases]
db1.example.com
db2.example.com

[monitoring]
monitor.example.com
```

Điều này tạo ra ba nhóm: `webservers`, `databases` và `monitoring`. Mỗi nhóm chứa một hoặc nhiều máy chủ.

### Thêm chi tiết kết nối

Máy chủ thực sự cần thông tin kết nối. Thêm các chi tiết này vào inventory của bạn:

```ini
[webservers]
web1 ansible_host=192.168.1.10 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/web_key
web2 ansible_host=192.168.1.11 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/web_key
web3 ansible_host=192.168.1.12 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/web_key

[databases]
db-primary ansible_host=192.168.1.20 ansible_user=postgres ansible_port=2222
db-replica ansible_host=192.168.1.21 ansible_user=postgres ansible_port=2222

[loadbalancers]
lb1 ansible_host=10.0.1.5 ansible_user=admin
```

Đây là những gì các tham số này làm:

- `ansible_host`: Địa chỉ IP hoặc tên máy chủ thực tế để kết nối
- `ansible_user`: Tên người dùng SSH cho kết nối
- `ansible_ssh_private_key_file`: Đường dẫn đến khóa riêng SSH
- `ansible_port`: Cổng SSH (mặc định là 22)

Việc sử dụng bí danh (như `web1`, `db-primary`) giúp playbook của bạn dễ đọc hơn so với việc sử dụng trực tiếp địa chỉ IP.

## Biến nhóm và biến chủ

Thay vì lặp lại chi tiết kết nối, hãy sử dụng các biến để đặt tham số chung cho các nhóm hoặc máy chủ riêng lẻ.

### Nhóm biến

Tạo thư mục `group_vars` và thêm các tệp YAML được đặt tên theo nhóm của bạn:

```bash
mkdir -p group_vars
```

Tạo `group_vars/webservers.yml`:

```yaml
---
ansible_user: ubuntu
ansible_ssh_private_key_file: ~/.ssh/web_servers_key
web_port: 80
nginx_worker_processes: 2
ssl_enabled: false
```

Tạo `group_vars/databases.yml`:

```yaml
---
ansible_user: postgres
ansible_port: 2222
db_port: 5432
max_connections: 100
shared_buffers: 256MB
```

Bây giờ inventory của bạn trở nên sạch sẽ hơn nhiều:

```ini
[webservers]
web1 ansible_host=192.168.1.10
web2 ansible_host=192.168.1.11
web3 ansible_host=192.168.1.12

[databases]
db-primary ansible_host=192.168.1.20
db-replica ansible_host=192.168.1.21
```

### Biến máy chủ

Đối với cài đặt dành riêng cho máy chủ, hãy tạo thư mục `host_vars`:

```bash
mkdir -p host_vars
```

Tạo `host_vars/db-primary.yml`:

```yaml
---
db_role: primary
backup_enabled: true
replication_user: replicator
```

Tạo `host_vars/db-replica.yml`:

```yaml
---
db_role: replica
backup_enabled: false
primary_host: db-primary
```

Các biến này tự động có sẵn trong playbook khi nhắm mục tiêu các máy chủ cụ thể.

## Tạo hệ thống phân cấp nhóm

Các nhóm có thể chứa các nhóm khác, tạo ra các hệ thống phân cấp giúp quản lý dễ dàng hơn.

### Nhóm phụ huynh và trẻ em

```ini
[webservers]
web1 ansible_host=192.168.1.10
web2 ansible_host=192.168.1.11

[api_servers]
api1 ansible_host=192.168.1.15
api2 ansible_host=192.168.1.16

[databases]
db1 ansible_host=192.168.1.20
db2 ansible_host=192.168.1.21

# Create parent groups
[frontend:children]
webservers

[backend:children]
api_servers
databases

[production:children]
frontend
backend
```

Bây giờ bạn có thể nhắm mục tiêu các cấp độ khác nhau:

- `ansible all -m ping`: Tất cả máy chủ
- `ansible frontend -m shell -a "uptime"`: Chỉ máy chủ web
- `ansible backend -m shell -a "df -h"`: Máy chủ và cơ sở dữ liệu API
- `ansible production -m setup`: Mọi thứ trong production

### Tách môi trường

Tổ chức các môi trường khác nhau bằng cách sử dụng hệ thống phân cấp nhóm:

```ini
[web-prod]
web-prod-1 ansible_host=10.0.1.10
web-prod-2 ansible_host=10.0.1.11

[web-staging]
web-staging-1 ansible_host=10.0.2.10

[web-dev]
web-dev-1 ansible_host=192.168.1.10

[db-prod]
db-prod-primary ansible_host=10.0.1.20
db-prod-replica ansible_host=10.0.1.21

[db-staging]
db-staging-1 ansible_host=10.0.2.20

# Environment groupings
[production:children]
web-prod
db-prod

[staging:children]
web-staging
db-staging

[development:children]
web-dev
```

Tạo các tệp biến tương ứng cho từng môi trường trong `group_vars/`:

`group_vars/production.yml`:

```yaml
---
environment: production
log_level: warn
debug_mode: false
ssl_required: true
backup_retention_days: 30
```

`group_vars/staging.yml`:

```yaml
---
environment: staging
log_level: info
debug_mode: true
ssl_required: false
backup_retention_days: 7
```

## Phạm vi và mẫu động

Đối với số lượng lớn các máy chủ tương tự, hãy sử dụng các mẫu để tránh các định nghĩa lặp lại:

```ini
[webservers]
web[01:05].prod.example.com

[databases]
db[a:c].prod.example.com ansible_user=postgres

[workers]
worker-[001:100].example.com
```

Điều này tạo ra:

- `web01.prod.example.com` đến `web05.prod.example.com`
- `dba.prod.example.com`, `dbb.prod.example.com`, `dbc.prod.example.com`
- `worker-001.example.com` đến `worker-100.example.com`

## Kỹ thuật inventory nâng cao

### Nhiều tệp inventory

Chia inventory lớn thành nhiều tệp để tổ chức tốt hơn:

```bash
inventories/
├── production/
│   ├── hosts.ini
│   └── group_vars/
│       ├── webservers.yml
│       └── databases.yml
└── staging/
    ├── hosts.ini
    └── group_vars/
        ├── webservers.yml
        └── databases.yml
```

Chỉ định thư mục inventory khi chạy playbook:

```bash
ansible-playbook -i inventories/production/ web-setup.yml
ansible-playbook -i inventories/staging/ web-setup.yml
```

### Sử dụng định dạng YAML inventory

Đối với inventory phức tạp, định dạng YAML mang lại sự linh hoạt hơn:

```yaml
# inventory.yml
all:
  children:
    webservers:
      hosts:
        web1:
          ansible_host: 192.168.1.10
          nginx_worker_processes: 4
        web2:
          ansible_host: 192.168.1.11
          nginx_worker_processes: 2
      vars:
        ansible_user: ubuntu
        web_port: 80

    databases:
      hosts:
        db-primary:
          ansible_host: 192.168.1.20
          db_role: primary
        db-replica:
          ansible_host: 192.168.1.21
          db_role: replica
      vars:
        ansible_user: postgres
        db_port: 5432

    production:
      children:
        webservers:
        databases:
      vars:
        environment: prod
        ssl_enabled: true
```

### Kết nối địa phương

Đối với các tác vụ chạy trên máy điều khiển của bạn, hãy thêm nó vào inventory:

```ini
[control]
localhost ansible_connection=local

[webservers]
web1 ansible_host=192.168.1.10
web2 ansible_host=192.168.1.11
```

Điều này cho phép bạn chạy các tác vụ cục bộ (như tạo tệp cấu hình) như một phần của playbook:

```yaml
- name: Generate deployment report
  hosts: control
  tasks:
    - name: Create deployment summary
      copy:
        content: |
          Deployment completed at {{ ansible_date_time.iso8601 }}
          Hosts updated: {{ groups['webservers'] | length }}
        dest: ./deployment-report.txt
```

## Kiểm tra inventory của bạn

Trước khi chạy playbook, hãy xác minh cấu hình inventory của bạn:

```bash
# List all hosts
ansible-inventory --list

# List hosts in specific group
ansible-inventory --list --limit webservers

# Show host variables
ansible-inventory --host web1

# Graph group relationships
ansible-inventory --graph
```

Kiểm tra kết nối với các nhóm khác nhau:

```bash
# Test all hosts
ansible all -m ping

# Test specific environment
ansible production -m ping

# Test specific group
ansible webservers -m ping
```

## Ví dụ thực tế: Thiết lập đa môi trường

Dưới đây là ví dụ hoàn chỉnh cho thấy cách cấu trúc inventory cho nhiều môi trường:

```ini
# inventories/production/hosts.ini
[web-servers]
web-prod-1 ansible_host=10.0.1.10
web-prod-2 ansible_host=10.0.1.11
web-prod-3 ansible_host=10.0.1.12

[api-servers]
api-prod-1 ansible_host=10.0.1.15
api-prod-2 ansible_host=10.0.1.16

[db-servers]
db-prod-primary ansible_host=10.0.1.20
db-prod-replica1 ansible_host=10.0.1.21
db-prod-replica2 ansible_host=10.0.1.22

[load-balancers]
lb-prod-1 ansible_host=10.0.1.5
lb-prod-2 ansible_host=10.0.1.6

[frontend:children]
web-servers
load-balancers

[backend:children]
api-servers
db-servers

[production:children]
frontend
backend
```

playbook tương ứng sử dụng cấu trúc này:

```yaml
---
- name: Deploy frontend components
  hosts: frontend
  become: yes
  tasks:
    - name: Update frontend applications
      git:
        repo: '{{ app_repository }}'
        dest: '{{ app_directory }}'
        version: '{{ app_version }}'
      when: inventory_hostname in groups['web-servers']

- name: Configure load balancers
  hosts: load-balancers
  become: yes
  tasks:
    - name: Update upstream servers
      template:
        src: upstream.conf.j2
        dest: /etc/nginx/conf.d/upstream.conf
      notify: reload nginx

- name: Database maintenance
  hosts: db-servers
  become: yes
  tasks:
    - name: Run database backups
      shell: pg_dump {{ database_name }} | gzip > /backups/{{ inventory_hostname }}-{{ ansible_date_time.date }}.sql.gz
      when: backup_enabled | default(false)
```

## Các bước tiếp theo

Bây giờ bạn đã hiểu cách tổ chức máy chủ bằng tệp Ansible inventory, tạo hệ thống phân cấp nhóm và quản lý các biến trên các môi trường khác nhau. Nền tảng này cho phép bạn mở rộng quy mô tự động hóa từ các máy chủ đơn lẻ đến cơ sở hạ tầng đa môi trường phức tạp.

Trong phần tiếp theo, chúng ta sẽ tìm hiểu sâu hơn về các biến và facts - cách làm cho playbook của bạn linh hoạt và đáp ứng với các cấu hình và môi trường hệ thống khác nhau.

Các mẫu inventory bạn đã học ở đây sẽ hỗ trợ quá trình tự động hóa ngày càng phức tạp khi cơ sở hạ tầng của bạn phát triển và playbook của bạn trở nên phức tạp hơn.

Chúc mừng tổ chức!
