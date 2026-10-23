---
title: "Vai trò và tổ chức"
description: Tìm hiểu cách tổ chức tự động hóa Ansible bằng cách sử dụng các vai trò - các thành phần có thể chia sẻ, tái sử dụng giúp quản lý cơ sở hạ tầng phức tạp có thể duy trì được.
order: 8
---

Khi quá trình tự động hóa Ansible của bạn phát triển, việc quản lý mọi thứ trong một playbook sẽ trở nên khó sử dụng. Vai trò cung cấp một cách có cấu trúc để sắp xếp các tác vụ, biến, tệp và mẫu thành các thành phần có thể sử dụng lại. Hãy coi các vai trò như các khối xây dựng mà bạn có thể kết hợp để tạo ra sự tự động hóa cơ sở hạ tầng tinh vi trong khi vẫn giữ mọi thứ ngăn nắp và có thể bảo trì được.

## Hiểu vai trò Ansible

Vai trò là một cấu trúc thư mục được xác định trước để nhóm các thành phần tự động hóa có liên quan. Thay vì có playbook khổng lồ với hàng trăm tác vụ, bạn tạo các vai trò tập trung xử lý các trách nhiệm cụ thể như "thiết lập máy chủ web" hoặc "cấu hình cơ sở dữ liệu".

### Cấu trúc thư mục vai trò

Mọi vai trò đều tuân theo bố cục thư mục tiêu chuẩn:

```
roles/
├── webserver/
│   ├── tasks/
│   │   └── main.yml
│   ├── handlers/
│   │   └── main.yml
│   ├── templates/
│   │   ├── nginx.conf.j2
│   │   └── site.conf.j2
│   ├── files/
│   │   └── ssl/
│   ├── vars/
│   │   └── main.yml
│   ├── defaults/
│   │   └── main.yml
│   ├── meta/
│   │   └── main.yml
│   └── README.md
```

Mỗi thư mục phục vụ một mục đích cụ thể:

- **tasks/**: Logic tự động hóa chính
- **handlers/**: Khởi động lại dịch vụ và thông báo handler
- **templates/**: Mẫu Jinja2 cho tệp cấu hình
- **files/**: Tệp tĩnh để sao chép vào máy chủ đích
- **vars/**: Biến theo vai trò cụ thể (mức độ ưu tiên cao)
- **defaults/**: Giá trị biến mặc định (mức độ ưu tiên thấp)
- **meta/**: Siêu dữ liệu vai trò và các phần phụ thuộc

## Tạo vai trò đầu tiên của bạn

### Tạo cấu trúc vai trò

Sử dụng `ansible-galaxy` để tạo cấu trúc thư mục chuẩn:

```bash
# Create a new role
ansible-galaxy init roles/webserver

# View the created structure
tree roles/webserver
```

Điều này tạo ra tất cả các thư mục và tập tin giữ chỗ mà bạn cần.

### Xây dựng vai trò máy chủ web

Hãy tạo một vai trò máy chủ web hoàn chỉnh. Bắt đầu với tệp nhiệm vụ chính:

```yaml
# roles/webserver/tasks/main.yml
---
- name: Include OS-specific variables
  include_vars: '{{ ansible_os_family }}.yml'
  tags: always

- name: Update package cache
  package:
    update_cache: yes
  when: ansible_os_family == "Debian"
  tags: packages

- name: Install web server packages
  package:
    name: '{{ webserver_packages }}'
    state: present
  tags: packages

- name: Create web user
  user:
    name: '{{ webserver_user }}'
    system: yes
    shell: /bin/false
    home: '{{ webserver_document_root }}'
  tags: user

- name: Create web directories
  file:
    path: '{{ item }}'
    state: directory
    owner: '{{ webserver_user }}'
    group: '{{ webserver_user }}'
    mode: '0755'
  loop:
    - '{{ webserver_document_root }}'
    - '{{ webserver_log_dir }}'
    - /etc/{{ webserver_service }}/sites-available
    - /etc/{{ webserver_service }}/sites-enabled
  tags: directories

- name: Configure web server
  template:
    src: '{{ webserver_service }}.conf.j2'
    dest: '/etc/{{ webserver_service }}/{{ webserver_service }}.conf'
    backup: yes
  notify: restart webserver
  tags: configuration

- name: Configure default site
  template:
    src: default-site.conf.j2
    dest: '/etc/{{ webserver_service }}/sites-available/default'
    backup: yes
  notify: restart webserver
  tags: configuration

- name: Enable default site
  file:
    src: '/etc/{{ webserver_service }}/sites-available/default'
    dest: '/etc/{{ webserver_service }}/sites-enabled/default'
    state: link
  notify: restart webserver
  tags: configuration

- name: Start and enable web server
  service:
    name: '{{ webserver_service }}'
    state: started
    enabled: yes
  tags: service
```

### Xác định các biến mặc định

Đặt mặc định hợp lý trong `roles/webserver/defaults/main.yml`:

```yaml
---
# Default web server configuration
webserver_service: nginx
webserver_user: www-data
webserver_document_root: /var/www/html
webserver_log_dir: /var/log/nginx
webserver_port: 80
webserver_ssl_port: 443

# Performance settings
webserver_worker_processes: '{{ ansible_processor_vcpus }}'
webserver_worker_connections: 1024
webserver_keepalive_timeout: 65

# Security settings
webserver_server_tokens: off
webserver_ssl_protocols:
  - TLSv1.2
  - TLSv1.3

# Default packages for different OS families
webserver_packages:
  - '{{ webserver_service }}'

# SSL configuration
webserver_ssl_enabled: false
webserver_ssl_certificate: /etc/ssl/certs/server.crt
webserver_ssl_certificate_key: /etc/ssl/private/server.key

# Site configuration
webserver_sites: []
```

### Các biến dành riêng cho hệ điều hành

Xử lý các hệ điều hành khác nhau bằng các tệp biến cụ thể:

```yaml
# roles/webserver/vars/Debian.yml
---
webserver_packages:
  - nginx
  - nginx-common
  - nginx-core

webserver_service: nginx
webserver_user: www-data
webserver_config_dir: /etc/nginx
```

```yaml
# roles/webserver/vars/RedHat.yml
---
webserver_packages:
  - nginx
  - nginx-mod-ssl

webserver_service: nginx
webserver_user: nginx
webserver_config_dir: /etc/nginx
```

### Tạo mẫu vai trò

Thêm mẫu cho tập tin cấu hình:

```jinja2
# roles/webserver/templates/nginx.conf.j2
user {{ webserver_user }};
worker_processes {{ webserver_worker_processes }};
pid /run/nginx.pid;

events {
    worker_connections {{ webserver_worker_connections }};
    use epoll;
    multi_accept on;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout {{ webserver_keepalive_timeout }};
    types_hash_max_size 2048;
    server_tokens {{ webserver_server_tokens }};

    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log {{ webserver_log_dir }}/access.log main;
    error_log {{ webserver_log_dir }}/error.log warn;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Virtual host configurations
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

### Thêm handler

Xác định handler trong `roles/webserver/handlers/main.yml`:

```yaml
---
- name: restart webserver
  service:
    name: '{{ webserver_service }}'
    state: restarted

- name: reload webserver
  service:
    name: '{{ webserver_service }}'
    state: reloaded

- name: validate webserver config
  command: '{{ webserver_service }} -t'
  changed_when: false
```

## Sử dụng vai trò trong playbook

### Cách sử dụng vai trò cơ bản

Áp dụng vai trò cho máy chủ trong playbook của bạn:

```yaml
---
- name: Configure web servers
  hosts: webservers
  become: yes

  roles:
    - webserver
    - firewall
    - monitoring
```

### Các biến và tham số vai trò

Chuyển các biến cho các vai trò để tùy chỉnh:

```yaml
---
- name: Configure specialized web servers
  hosts: webservers
  become: yes

  roles:
    - role: webserver
      webserver_port: 8080
      webserver_ssl_enabled: true
      webserver_sites:
        - name: api
          server_name: api.example.com
          document_root: /var/www/api
        - name: admin
          server_name: admin.example.com
          document_root: /var/www/admin
          auth_required: true
```

### Ứng dụng vai trò có điều kiện

Áp dụng vai trò có điều kiện dựa trên đặc điểm của máy chủ:

```yaml
---
- name: Configure servers based on their purpose
  hosts: all
  become: yes

  roles:
    - role: common
      tags: always

    - role: webserver
      when: "'webservers' in group_names"

    - role: database
      when: "'databases' in group_names"

    - role: loadbalancer
      when: "'loadbalancers' in group_names"
```

## Phụ thuộc vai trò

### Xác định sự phụ thuộc

Chỉ định các phụ thuộc vai trò trong `roles/webserver/meta/main.yml`:

```yaml
---
galaxy_info:
  role_name: webserver
  author: Your Name
  description: Web server configuration role
  license: MIT
  min_ansible_version: 2.9

  platforms:
    - name: Ubuntu
      versions:
        - focal
        - jammy
    - name: Debian
      versions:
        - bullseye
        - bookworm

  galaxy_tags:
    - web
    - nginx
    - server

dependencies:
  - role: common
    tags: common

  - role: firewall
    firewall_rules:
      - port: '{{ webserver_port }}'
        protocol: tcp
        source: any
      - port: '{{ webserver_ssl_port }}'
        protocol: tcp
        source: any
    when: firewall_enabled | default(true)

  - role: ssl_certificates
    ssl_domains: '{{ webserver_ssl_domains | default([]) }}'
    when: webserver_ssl_enabled
```

Các phần phụ thuộc chạy trước chính vai trò đó, đảm bảo đáp ứng các điều kiện tiên quyết.

### Thứ tự thực hiện vai trò

Hiểu thứ tự thực hiện sẽ giúp ích cho các phụ thuộc vai trò phức tạp:

1. Sự phụ thuộc của sự phụ thuộc (đệ quy)
2. Sự phụ thuộc của vai trò
3. Nhiệm vụ vai trò
4. Vai trò handler (sau khi hoàn thành tất cả nhiệm vụ)

## Mẫu vai trò nâng cao

### Bao gồm vai trò được tham số hóa

Bao gồm các vai trò một cách linh hoạt với các tham số khác nhau:

```yaml
---
- name: Configure multiple applications
  hosts: appservers
  become: yes

  tasks:
    - name: Configure each application
      include_role:
        name: webapp
      vars:
        app_name: '{{ item.name }}'
        app_port: '{{ item.port }}'
        app_version: '{{ item.version }}'
        app_database: '{{ item.database }}'
      loop:
        - name: api
          port: 8080
          version: '2.1.0'
          database: api_db
        - name: admin
          port: 8081
          version: '1.5.2'
          database: admin_db
        - name: worker
          port: 8082
          version: '3.0.1'
          database: worker_db
```

### Vai trò có nhiều điểm vào

Tạo vai trò với các điểm vào khác nhau cho các tình huống khác nhau:

```yaml
# roles/database/tasks/main.yml
---
- name: Include installation tasks
  include_tasks: install.yml
  when: database_action == 'install' or database_action == 'configure'

- name: Include configuration tasks
  include_tasks: configure.yml
  when: database_action == 'configure'

- name: Include backup tasks
  include_tasks: backup.yml
  when: database_action == 'backup'

- name: Include maintenance tasks
  include_tasks: maintenance.yml
  when: database_action == 'maintenance'
```

Sử dụng nó với các hành động khác nhau:

```yaml
roles:
  - role: database
    database_action: install

  - role: database
    database_action: backup
```

### Kiểm tra và xác nhận vai trò

Thêm các tác vụ xác thực để đảm bảo thực hiện vai trò thành công:

```yaml
# roles/webserver/tasks/validate.yml
---
- name: Validate web server is responding
  uri:
    url: 'http://{{ ansible_default_ipv4.address }}:{{ webserver_port }}'
    method: GET
    status_code: 200
  register: webserver_health_check
  retries: 3
  delay: 5
  until: webserver_health_check.status == 200

- name: Validate SSL configuration
  uri:
    url: 'https://{{ ansible_default_ipv4.address }}:{{ webserver_ssl_port }}'
    method: GET
    status_code: 200
    validate_certs: no
  when: webserver_ssl_enabled
  register: ssl_health_check
  retries: 3
  delay: 5

- name: Report validation results
  debug:
    msg: |
      Web server validation completed:
      - HTTP response: {{ webserver_health_check.status }}
      - SSL response: {{ ssl_health_check.status | default('N/A - SSL not enabled') }}
```

Bao gồm xác nhận trong các nhiệm vụ chính của bạn:

```yaml
# roles/webserver/tasks/main.yml
- name: Run validation checks
  include_tasks: validate.yml
  when: webserver_validate | default(true)
  tags: validate
```

## Tổ chức nhiều vai trò

### Cấu trúc dự án

Tổ chức các dự án lớn hơn với nhiều vai trò:

```
ansible-infrastructure/
├── inventories/
│   ├── production/
│   │   ├── hosts.yml
│   │   └── group_vars/
│   └── staging/
│       ├── hosts.yml
│       └── group_vars/
├── roles/
│   ├── common/
│   ├── webserver/
│   ├── database/
│   ├── loadbalancer/
│   ├── monitoring/
│   └── backup/
├── playbooks/
│   ├── site.yml
│   ├── webservers.yml
│   ├── databases.yml
│   └── maintenance.yml
├── group_vars/
│   ├── all.yml
│   ├── webservers.yml
│   └── databases.yml
├── host_vars/
└── ansible.cfg
```

### Playbook trên toàn trang web

Tạo một playbook chính điều phối tất cả các vai trò:

```yaml
# playbooks/site.yml
---
- name: Configure all infrastructure
  hosts: all
  become: yes

  pre_tasks:
    - name: Update package cache
      package:
        update_cache: yes
      when: ansible_os_family == "Debian"

    - name: Gather service facts
      service_facts:

  roles:
    - role: common
      tags: [common, always]

- name: Configure web servers
  hosts: webservers
  become: yes

  roles:
    - role: webserver
      tags: [webserver, web]

    - role: ssl_certificates
      when: ssl_enabled | default(false)
      tags: [ssl, web]

- name: Configure database servers
  hosts: databases
  become: yes

  roles:
    - role: database
      tags: [database, db]

    - role: backup
      tags: [backup, db]

- name: Configure load balancers
  hosts: loadbalancers
  become: yes

  roles:
    - role: loadbalancer
      tags: [loadbalancer, lb]

- name: Configure monitoring on all hosts
  hosts: all
  become: yes

  roles:
    - role: monitoring
      tags: [monitoring, observe]

  post_tasks:
    - name: Verify all services are running
      service_facts:

    - name: Generate deployment report
      template:
        src: deployment-report.j2
        dest: /tmp/deployment-{{ ansible_date_time.date }}.txt
      delegate_to: localhost
      run_once: true
```

### Playbook theo vai trò cụ thể

Tạo playbook tập trung cho các hoạt động cụ thể:

```yaml
# playbooks/webservers.yml
---
- name: Manage web servers
  hosts: webservers
  become: yes

  vars_prompt:
    - name: maintenance_mode
      prompt: 'Enable maintenance mode? (yes/no)'
      default: 'no'
      private: no

  pre_tasks:
    - name: Enable maintenance page
      copy:
        src: maintenance.html
        dest: '{{ webserver_document_root }}/maintenance.html'
      when: maintenance_mode == "yes"

  roles:
    - role: webserver
      webserver_maintenance_mode: "{{ maintenance_mode == 'yes' }}"

  post_tasks:
    - name: Remove maintenance page
      file:
        path: '{{ webserver_document_root }}/maintenance.html'
        state: absent
      when: maintenance_mode == "no"
```

## Chia sẻ và sử dụng lại vai trò

### Thiên hà Ansible

Chia sẻ vai trò với cộng đồng thông qua Ansible Galaxy:

```bash
# Search for roles
ansible-galaxy search nginx

# Install a role from Galaxy
ansible-galaxy install geerlingguy.nginx

# Install roles from requirements file
echo "geerlingguy.nginx" > requirements.yml
ansible-galaxy install -r requirements.yml
```

### Tệp yêu cầu

Xác định các phụ thuộc vai trò trong `requirements.yml`:

```yaml
---
# From Ansible Galaxy
- name: geerlingguy.nginx
  version: '3.1.4'

- name: geerlingguy.postgresql
  version: '3.4.2'

# From Git repositories
- name: custom-role
  src: https://github.com/company/ansible-custom-role.git
  version: main

# From local filesystem
- name: internal-role
  src: /path/to/local/role
```

Cài đặt tất cả các yêu cầu:

```bash
ansible-galaxy install -r requirements.yml --roles-path roles/
```

## Các phương pháp hay nhất để phát triển vai trò

### Nguyên tắc thiết kế vai trò

1. **Trách nhiệm duy nhất**: Mỗi vai trò phải xử lý một khía cạnh cụ thể của cấu hình hệ thống
2. **Idempotency**: Các vai trò phải an toàn để chạy nhiều lần
3. **Flexibility**: Sử dụng các biến và mặc định để làm cho vai trò có thể thích ứng
4. **DDocumentation**: Bao gồm các tệp README toàn diện

### Quản lý biến

Sử dụng quy ước đặt tên biến rõ ràng:

```yaml
# Good: Prefixed and descriptive
nginx_worker_processes: 4
nginx_ssl_enabled: true
nginx_sites_configuration:
  - name: example
    port: 80

# Avoid: Generic names that might conflict
worker_processes: 4
ssl_enabled: true
sites: []
```

### Vai trò thử nghiệm

Kiểm tra vai trò bằng cách sử dụng phân tử hoặc xác thực đơn giản playbook:

```yaml
# tests/test.yml
---
- name: Test webserver role
  hosts: test_servers
  become: yes

  roles:
    - role: webserver
      webserver_ssl_enabled: true

  post_tasks:
    - name: Verify nginx is running
      service:
        name: nginx
        state: started
      check_mode: yes
      register: nginx_status

    - name: Assert nginx is running
      assert:
        that:
          - nginx_status is not changed
        fail_msg: 'nginx is not running'
```

## Các bước tiếp theo

Các vai trò biến Ansible từ một công cụ tự động hóa đơn giản thành một nền tảng cơ sở hạ tầng dưới dạng mã mạnh mẽ. Bạn đã học cách tạo các thành phần tự động hóa được tổ chức tốt, có thể tái sử dụng, có thể chia sẻ và kết hợp để quản lý cơ sở hạ tầng phức tạp.

Trong phần tiếp theo, chúng ta sẽ khám phá các phương pháp hay nhất về production - bảo mật, thử nghiệm, tích hợp CI/CD và các mẫu giúp tự động hóa Ansible trở nên đáng tin cậy và có thể duy trì trong môi trường doanh nghiệp.

Tổ chức dựa trên vai trò mà bạn đã học ở đây cung cấp nền tảng để mở rộng quy mô tự động hóa Ansible trên các cơ sở hạ tầng lớn, phức tạp trong khi vẫn duy trì sự rõ ràng và khả năng tái sử dụng.
