---
title: "Biến và facts"
description: Tìm hiểu cách sử dụng các biến và hệ thống facts để tạo Ansible playbook linh hoạt, năng động, thích ứng với các môi trường và hệ thống khác nhau.
order: 5
---

Các biến biến đổi playbook tĩnh thành tự động hóa linh hoạt thích ứng với các môi trường, máy chủ và tình huống khác nhau. Kết hợp với hệ thống thu thập dữ kiện của Ansible, các biến cho phép bạn viết playbook để đưa ra quyết định thông minh dựa trên đặc điểm hệ thống và cấu hình do người dùng xác định.

## Hiểu mức độ ưu tiên của biến

Ansible đánh giá các biến từ nhiều nguồn, theo thứ tự ưu tiên cụ thể. Hiểu hệ thống phân cấp này sẽ ngăn ngừa sự nhầm lẫn khi cùng một biến được xác định ở nhiều nơi.

### Nguồn biến đổi (Ưu tiên thấp nhất đến cao nhất)

1. Giá trị mặc định của vai trò
2. Biến inventory (group_vars, Host_vars)
3. Biến playbook
4. Biến bổ sung (`-e` trên dòng lệnh)

Các nguồn có mức độ ưu tiên cao hơn sẽ ghi đè các nguồn có mức độ ưu tiên thấp hơn. Đây là cách nó hoạt động trong thực tế:

```yaml
# group_vars/webservers.yml (precedence: 2)
web_port: 80

# In your playbook (precedence: 3)
---
- hosts: webservers
  vars:
    web_port: 8080 # This overrides group_vars
```

Các biến dòng lệnh có mức độ ưu tiên cao nhất:

```bash
# This overrides everything else
ansible-playbook site.yml -e web_port=3000
```

## Xác định các biến theo nhiều cách

### Biến playbook

Xác định các biến trực tiếp trong playbook cho các giá trị cụ thể cho quá trình tự động hóa đó:

```yaml
---
- name: Configure web application
  hosts: webservers
  vars:
    app_name: ecommerce-site
    app_version: '2.1.3'
    database_host: db.internal.com
    cache_enabled: true
    allowed_origins:
      - https://example.com
      - https://www.example.com
      - https://app.example.com

  tasks:
    - name: Deploy application version {{ app_version }}
      git:
        repo: 'https://github.com/company/{{ app_name }}.git'
        dest: '/opt/{{ app_name }}'
        version: '{{ app_version }}'
```

### Tệp biến bên ngoài

Đối với các tập hợp biến lớn hơn, hãy sử dụng các tệp YAML riêng biệt:

```yaml
# vars/app-config.yml
---
application:
  name: customer-portal
  version: '1.4.2'
  port: 8080
  workers: 4

database:
  host: postgres.internal.com
  port: 5432
  name: customer_db
  pool_size: 20

cache:
  enabled: true
  ttl: 3600
  max_memory: 512mb

features:
  user_registration: true
  payment_processing: true
  analytics: false
```

Tải các biến này trong playbook của bạn:

```yaml
---
- name: Deploy customer portal
  hosts: app_servers
  vars_files:
    - vars/app-config.yml
    - vars/secrets.yml

  tasks:
    - name: Configure application
      template:
        src: app.conf.j2
        dest: '/etc/{{ application.name }}/app.conf'
      notify: restart application
```

### Lời nhắc về các biến

Đối với các giá trị nhạy cảm hoặc dành riêng cho môi trường, hãy nhắc người dùng trong quá trình thực thi playbook:

```yaml
---
- name: Database maintenance
  hosts: databases
  vars_prompt:
    - name: maintenance_window
      prompt: 'Enter maintenance window (hours)'
      default: '2'
      private: no

    - name: admin_password
      prompt: 'Enter database admin password'
      private: yes
      encrypt: 'sha512_crypt'
      confirm: yes

  tasks:
    - name: Schedule maintenance
      debug:
        msg: 'Scheduling {{ maintenance_window }} hour maintenance window'
```

Tùy chọn `private: yes` ẩn đầu vào cho các giá trị nhạy cảm. Tùy chọn `encrypt` băm mật khẩu để bảo mật.

## Làm việc với Hệ thống facts

Ansible tự động thu thập thông tin chi tiết về từng hệ thống mà nó quản lý. Các "facts" này có sẵn dưới dạng các biến trong playbook của bạn, cho phép tự động hóa thích ứng với các cấu hình hệ thống khác nhau.

### Khám phá facts có sẵn

Xem tất cả facts cho một hệ thống:

```bash
ansible webservers -m setup | less
```

Lọc facts theo danh mục:

```bash
# Network information
ansible webservers -m setup -a "filter=ansible_default_ipv4"

# Memory information
ansible webservers -m setup -a "filter=ansible_memory_mb"

# Disk information
ansible webservers -m setup -a "filter=ansible_mounts"
```

### Facts thường được sử dụng

Dưới đây là facts bạn sẽ thường xuyên sử dụng trong playbook:

```yaml
tasks:
  - name: Display system information
    debug:
      msg: |
        Hostname: {{ inventory_hostname }}
        FQDN: {{ ansible_fqdn }}
        OS: {{ ansible_distribution }} {{ ansible_distribution_version }}
        Architecture: {{ ansible_architecture }}
        IP Address: {{ ansible_default_ipv4.address }}
        Total Memory: {{ ansible_memory_mb.real.total }}MB
        CPU Cores: {{ ansible_processor_vcpus }}
        Python Version: {{ ansible_python_version }}
```

### Sử dụng facts cho logic có điều kiện

facts cho phép playbook đưa ra quyết định thông minh:

```yaml
tasks:
  - name: Install package manager update (Ubuntu)
    apt:
      update_cache: yes
    when: ansible_distribution == "Ubuntu"

  - name: Install package manager update (CentOS)
    yum:
      name: '*'
      state: latest
    when: ansible_distribution == "CentOS"

  - name: Configure memory-based settings
    lineinfile:
      path: /etc/myapp/config.ini
      regexp: '^max_memory='
      line: 'max_memory={{ (ansible_memory_mb.real.total * 0.8) | int }}MB'
    when: ansible_memory_mb.real.total > 2048
```

### Facts tùy chỉnh

Tạo facts tùy chỉnh cho thông tin dành riêng cho ứng dụng:

```bash
# Create facts directory on target hosts
sudo mkdir -p /etc/ansible/facts.d

# Create a custom fact script
sudo tee /etc/ansible/facts.d/application.fact << 'EOF'
#!/bin/bash
echo '{
  "version": "'$(cat /opt/myapp/VERSION 2>/dev/null || echo "unknown")'",
  "last_deployment": "'$(stat -c %Y /opt/myapp/deployed 2>/dev/null || echo "never")'",
  "database_status": "'$(systemctl is-active postgresql 2>/dev/null || echo "unknown")'"
}'
EOF

sudo chmod +x /etc/ansible/facts.d/application.fact
```

Truy cập facts tùy chỉnh trong playbook:

```yaml
tasks:
  - name: Display application status
    debug:
      msg: |
        App Version: {{ ansible_local.application.version }}
        Last Deployment: {{ ansible_local.application.last_deployment }}
        Database Status: {{ ansible_local.application.database_status }}
```

## Thao tác và bộ lọc biến

Ansible cung cấp các bộ lọc để chuyển đổi các giá trị biến:

### Thao tác chuỗi

```yaml
tasks:
  - name: Work with strings
    debug:
      msg: |
        Original: {{ app_name }}
        Uppercase: {{ app_name | upper }}
        Lowercase: {{ app_name | lower }}
        Title Case: {{ app_name | title }}
        Replace: {{ app_name | replace('-', '_') }}
```

### Danh sách và hoạt động từ điển

```yaml
vars:
  server_list:
    - web1
    - web2
    - web3

  server_config:
    web1: { cpu: 2, memory: 4096 }
    web2: { cpu: 4, memory: 8192 }
    web3: { cpu: 2, memory: 4096 }

tasks:
  - name: List operations
    debug:
      msg: |
        First server: {{ server_list | first }}
        Last server: {{ server_list | last }}
        Random server: {{ server_list | random }}
        Sorted servers: {{ server_list | sort }}
        Server count: {{ server_list | length }}

  - name: Dictionary operations
    debug:
      msg: |
        All servers: {{ server_config.keys() | list }}
        High-memory servers: {{ server_config | dict2items | selectattr('value.memory', '>', 4096) | map(attribute='key') | list }}
```

### Các phép toán

```yaml
vars:
  base_memory: 1024
  cpu_count: '{{ ansible_processor_vcpus }}'

tasks:
  - name: Calculate optimal settings
    set_fact:
      optimal_memory: '{{ (base_memory * cpu_count) | int }}'
      worker_processes: '{{ [cpu_count | int, 8] | min }}'
      cache_size: '{{ (ansible_memory_mb.real.total * 0.1) | int }}'
```

## Kỹ thuật biến nâng cao

### Đăng ký biến

Ghi lại đầu ra của tác vụ để sử dụng trong các tác vụ sau:

```yaml
tasks:
  - name: Check disk usage
    shell: df -h / | tail -1 | awk '{print $5}' | sed 's/%//'
    register: disk_usage
    changed_when: false

  - name: Display disk usage
    debug:
      msg: 'Root filesystem is {{ disk_usage.stdout }}% full'

  - name: Warn about high disk usage
    debug:
      msg: 'WARNING: Disk usage is critically high!'
    when: disk_usage.stdout | int > 90
```

### Cài đặt động facts

Sử dụng `set_fact` để tạo các biến trong quá trình thực thi playbook:

```yaml
tasks:
  - name: Determine deployment strategy
    set_fact:
      deployment_strategy: "{{ 'blue_green' if ansible_memory_mb.real.total > 4096 else 'rolling' }}"
      backup_required: "{{ true if environment == 'production' else false }}"

  - name: Configure based on strategy
    debug:
      msg: 'Using {{ deployment_strategy }} deployment strategy'
```

### Phạm vi thay đổi

Các biến có thể được đặt trong phạm vi máy chủ, nhóm hoặc trên toàn cầu:

```yaml
tasks:
  - name: Set host-specific variable
    set_fact:
      host_role: primary
    when: inventory_hostname == groups['databases'][0]

  - name: Set host-specific variable
    set_fact:
      host_role: secondary
    when: inventory_hostname != groups['databases'][0]

  - name: Configure based on role
    template:
      src: 'database-{{ host_role }}.conf.j2'
      dest: /etc/postgresql/postgresql.conf
```

## Ví dụ thực tế: Cấu hình nhận biết môi trường

Đây là một ví dụ hoàn chỉnh cho thấy các biến và facts phối hợp với nhau như thế nào:

```yaml
---
- name: Deploy application with environment-specific configuration
  hosts: app_servers
  vars:
    app_name: customer-api
    app_repository: 'https://github.com/company/customer-api.git'

  vars_files:
    - 'vars/{{ environment }}.yml'
    - 'vars/secrets-{{ environment }}.yml'

  pre_tasks:
    - name: Validate environment variable
      fail:
        msg: 'Environment must be defined (dev, staging, prod)'
      when: environment is not defined

    - name: Set deployment facts
      set_fact:
        app_user: '{{ app_name }}'
        app_dir: '/opt/{{ app_name }}'
        log_level: "{{ 'info' if environment == 'prod' else 'debug' }}"
        worker_count: "{{ ansible_processor_vcpus if environment == 'prod' else 2 }}"

  tasks:
    - name: Create application user
      user:
        name: '{{ app_user }}'
        system: yes
        shell: /bin/false

    - name: Deploy application code
      git:
        repo: '{{ app_repository }}'
        dest: '{{ app_dir }}'
        version: '{{ app_version }}'
      become_user: '{{ app_user }}'
      notify: restart application

    - name: Generate configuration file
      template:
        src: app.conf.j2
        dest: '{{ app_dir }}/config/app.conf'
        owner: '{{ app_user }}'
        group: '{{ app_user }}'
        mode: '0640'
      notify: restart application

    - name: Configure systemd service
      template:
        src: app.service.j2
        dest: '/etc/systemd/system/{{ app_name }}.service'
      notify:
        - reload systemd
        - restart application

    - name: Ensure application is running
      systemd:
        name: '{{ app_name }}'
        state: started
        enabled: yes
        daemon_reload: yes

  handlers:
    - name: reload systemd
      systemd:
        daemon_reload: yes

    - name: restart application
      systemd:
        name: '{{ app_name }}'
        state: restarted
```

Tệp mẫu hỗ trợ (`templates/app.conf.j2`):

```jinja2
# {{ app_name }} configuration
# Generated by Ansible on {{ ansible_date_time.iso8601 }}

[server]
host = {{ ansible_default_ipv4.address }}
port = {{ app_port | default(8080) }}
workers = {{ worker_count }}
log_level = {{ log_level }}

[database]
host = {{ database.host }}
port = {{ database.port }}
name = {{ database.name }}
user = {{ database.user }}
password = {{ database.password }}

[performance]
max_memory = {{ (ansible_memory_mb.real.total * 0.6) | int }}MB
cache_enabled = {{ cache_enabled | default(true) }}

[environment]
name = {{ environment }}
debug = {{ environment != 'prod' }}
ssl_enabled = {{ ssl_enabled | default(false) }}
```

## Các bước tiếp theo

Các biến và facts cung cấp nền tảng để tạo ra khả năng tự động hóa thông minh, có khả năng thích ứng. Bạn đã học cách xác định các biến từ nhiều nguồn, sử dụng hệ thống facts để ra quyết định và áp dụng các bộ lọc để chuyển đổi dữ liệu.

Trong phần tiếp theo, chúng ta sẽ khám phá handler và thông báo - cách chỉ kích hoạt các hành động khi có thay đổi và điều phối việc quản lý dịch vụ phức tạp trên nhiều hệ thống.

Các kỹ thuật biến đổi mà bạn đã học ở đây cho phép tự động hóa năng động, nhận biết môi trường, giúp Ansible trở nên mạnh mẽ trong việc quản lý cơ sở hạ tầng đa dạng trên quy mô lớn.

Chúc bạn tự động hóa vui vẻ!
