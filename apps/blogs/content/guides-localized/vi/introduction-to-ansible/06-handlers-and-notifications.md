---
title: "Handler và thông báo"
description: Tìm hiểu cách sử dụng Ansible handler và thông báo để chỉ kích hoạt các hành động khi cần, tạo ra sự tự động hóa hiệu quả và đáng tin cậy.
order: 6
---

handler là một trong những tính năng mạnh mẽ nhất của Ansible để xây dựng hệ thống tự động hóa hiệu quả. Chúng cho phép bạn kích hoạt các hành động - như khởi động lại dịch vụ - chỉ khi thay đổi cấu hình thực sự xảy ra. Cách tiếp cận này ngăn chặn việc khởi động lại dịch vụ không cần thiết và tạo ra khả năng tự động hóa đáng tin cậy hơn để đáp ứng phù hợp với các thay đổi.

## Tìm hiểu handler

handler là những tác vụ đặc biệt chỉ chạy khi được tác vụ khác "thông báo". Không giống như các tác vụ thông thường chạy mọi lúc, handler chạy một lần cho mỗi lần thực thi playbook và chỉ khi được kích hoạt. Điều này làm cho chúng trở nên hoàn hảo cho các hành động sẽ xảy ra sau khi thay đổi cấu hình.

### Cú pháp handler cơ bản

Đây là một ví dụ đơn giản cho thấy cách handler hoạt động:

```yaml
---
- name: Configure web server
  hosts: webservers
  become: yes

  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present

    - name: Copy nginx configuration
      copy:
        src: nginx.conf
        dest: /etc/nginx/nginx.conf
        backup: yes
      notify: restart nginx

    - name: Copy site configuration
      template:
        src: site.conf.j2
        dest: /etc/nginx/sites-available/default
      notify: restart nginx

  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
```

Trong ví dụ này:

1. Hai tác vụ có khả năng kích hoạt handler bằng `notify`
2. handler chỉ chạy một lần, ngay cả khi cả hai tác vụ đều thay đổi
3. handler chạy sau khi hoàn thành mọi tác vụ
4. Nếu không có tác vụ nào kích hoạt thông báo, handler sẽ không chạy

### Khi handler thực thi

handler chạy tại các điểm cụ thể trong quá trình thực thi playbook:

- **Sau khi tất cả nhiệm vụ trong một lần chơi hoàn thành** (hành vi bình thường)
- **Khi được xóa rõ ràng** bằng `meta: flush_handlers`
- **AỞ cuối mỗi khối** khi sử dụng các khối xử lý lỗi

Thời gian này đảm bảo rằng các thay đổi cấu hình hoàn tất trước khi khởi động lại dịch vụ.

## Ví dụ thực tế về handler

### Cấu hình máy chủ web

Đây là một ví dụ thực tế về quản lý cấu hình nginx với nhiều trình kích hoạt tiềm năng:

```yaml
---
- name: Configure nginx web server
  hosts: webservers
  become: yes

  vars:
    nginx_sites:
      - name: api
        port: 8080
        backend: "{{ groups['api_servers'] }}"
      - name: admin
        port: 8081
        backend: "{{ groups['admin_servers'] }}"

  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present

    - name: Configure nginx main settings
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        backup: yes
      notify:
        - validate nginx config
        - restart nginx

    - name: Configure nginx sites
      template:
        src: site.conf.j2
        dest: '/etc/nginx/sites-available/{{ item.name }}'
      loop: '{{ nginx_sites }}'
      notify:
        - validate nginx config
        - restart nginx

    - name: Enable nginx sites
      file:
        src: '/etc/nginx/sites-available/{{ item.name }}'
        dest: '/etc/nginx/sites-enabled/{{ item.name }}'
        state: link
      loop: '{{ nginx_sites }}'
      notify:
        - validate nginx config
        - restart nginx

    - name: Remove default nginx site
      file:
        path: /etc/nginx/sites-enabled/default
        state: absent
      notify:
        - validate nginx config
        - restart nginx

  handlers:
    - name: validate nginx config
      command: nginx -t
      changed_when: false

    - name: restart nginx
      service:
        name: nginx
        state: restarted
```

Lưu ý cách nhiều tác vụ có thể thông báo cho cùng một handler. handler chạy theo thứ tự được xác định, do đó quá trình xác thực diễn ra trước khi khởi động lại.

### Cấu hình cơ sở dữ liệu

handler hoạt động tốt với cấu hình cơ sở dữ liệu yêu cầu khởi động lại dịch vụ:

```yaml
---
- name: Configure PostgreSQL
  hosts: databases
  become: yes
  become_user: postgres

  tasks:
    - name: Configure PostgreSQL settings
      lineinfile:
        path: /etc/postgresql/13/main/postgresql.conf
        regexp: '{{ item.regexp }}'
        line: '{{ item.line }}'
        backup: yes
      loop:
        - { regexp: '^#?shared_buffers', line: 'shared_buffers = {{ shared_buffers }}' }
        - { regexp: '^#?max_connections', line: 'max_connections = {{ max_connections }}' }
        - { regexp: '^#?listen_addresses', line: "listen_addresses = '{{ listen_addresses }}'" }
      notify: restart postgresql

    - name: Configure client authentication
      template:
        src: pg_hba.conf.j2
        dest: /etc/postgresql/13/main/pg_hba.conf
        backup: yes
      notify:
        - validate postgresql config
        - reload postgresql

    - name: Create application database
      postgresql_db:
        name: '{{ app_database }}'
        state: present

    - name: Create application user
      postgresql_user:
        name: '{{ app_user }}'
        password: '{{ app_password }}'
        db: '{{ app_database }}'
        priv: ALL
        state: present

  handlers:
    - name: validate postgresql config
      command: /usr/lib/postgresql/13/bin/postgres --config-file=/etc/postgresql/13/main/postgresql.conf --check-config
      become_user: postgres
      changed_when: false

    - name: restart postgresql
      service:
        name: postgresql
        state: restarted

    - name: reload postgresql
      service:
        name: postgresql
        state: reloaded
```

Ví dụ này hiển thị các loại handler khác nhau: khởi động lại khi có những thay đổi lớn về cấu hình, tải lại để thay đổi xác thực và xác thực để đảm bảo cấu hình là chính xác.

## Kỹ thuật handler nâng cao

### Phụ thuộc handler

Đôi khi handler phải chạy theo một thứ tự cụ thể. Sử dụng `listen` để tạo nhóm handler:

```yaml
tasks:
  - name: Update SSL certificate
    copy:
      src: '{{ item }}'
      dest: '/etc/ssl/certs/'
    loop:
      - server.crt
      - server.key
    notify: ssl certificate updated

handlers:
  - name: validate ssl certificate
    command: openssl x509 -in /etc/ssl/certs/server.crt -text -noout
    listen: ssl certificate updated
    changed_when: false

  - name: restart nginx
    service:
      name: nginx
      state: restarted
    listen: ssl certificate updated

  - name: restart apache
    service:
      name: apache2
      state: restarted
    listen: ssl certificate updated
```

Khi một tác vụ thông báo "chứng chỉ ssl được cập nhật", tất cả handler đang lắng nghe thông báo đó sẽ chạy theo thứ tự.

### Handler có điều kiện

handler có thể bao gồm các điều kiện, khiến chúng chỉ chạy trong các trường hợp cụ thể:

```yaml
handlers:
  - name: restart application
    service:
      name: '{{ app_name }}'
      state: restarted
    when: not maintenance_mode | default(false)

  - name: reload configuration
    command: '{{ app_command }} reload'
    when:
      - app_running is defined
      - app_running.rc == 0
```

### Buộc thực thi handler

Sử dụng `meta: flush_handlers` để chạy handler ngay lập tức thay vì đợi kết thúc lượt chơi:

```yaml
tasks:
  - name: Update database configuration
    template:
      src: postgresql.conf.j2
      dest: /etc/postgresql/13/main/postgresql.conf
    notify: restart postgresql

  - name: Flush handlers to restart database now
    meta: flush_handlers

  - name: Run database migrations (requires running database)
    command: 'python manage.py migrate'
    become_user: '{{ app_user }}'
```

Mẫu này hữu ích khi các tác vụ sau này phụ thuộc vào việc dịch vụ được khởi động lại.

### Xử lý lỗi trong handler

handler có thể bị lỗi, có khả năng khiến hệ thống ở trạng thái không nhất quán. Xử lý việc này bằng cách kiểm tra lỗi thích hợp:

```yaml
handlers:
  - name: restart nginx with validation
    block:
      - name: validate nginx configuration
        command: nginx -t
        changed_when: false

      - name: restart nginx service
        service:
          name: nginx
          state: restarted

    rescue:
      - name: restore nginx configuration backup
        command: cp /etc/nginx/nginx.conf.ansible-backup /etc/nginx/nginx.conf
        ignore_errors: yes

      - name: ensure nginx is running with old config
        service:
          name: nginx
          state: started

      - name: report configuration failure
        fail:
          msg: 'nginx configuration update failed, reverted to backup'
```

## Các mẫu handler trong thế giới thực

### Phối hợp đa dịch vụ

Khi các thay đổi ảnh hưởng đến nhiều dịch vụ, hãy phối hợp khởi động lại chúng một cách hợp lý:

```yaml
---
- name: Update application stack
  hosts: app_servers
  become: yes

  tasks:
    - name: Update application code
      git:
        repo: '{{ app_repository }}'
        dest: '{{ app_directory }}'
        version: '{{ app_version }}'
      notify:
        - restart application
        - restart workers

    - name: Update nginx proxy configuration
      template:
        src: proxy.conf.j2
        dest: /etc/nginx/conf.d/app.conf
      notify: reload nginx

    - name: Update application configuration
      template:
        src: app.conf.j2
        dest: '{{ app_directory }}/config.ini'
      notify:
        - restart application
        - restart workers

  handlers:
    - name: restart application
      service:
        name: '{{ app_name }}'
        state: restarted

    - name: restart workers
      service:
        name: '{{ app_name }}-workers'
        state: restarted

    - name: reload nginx
      service:
        name: nginx
        state: reloaded
```

### Khởi động lại

Đối với các ứng dụng cần khởi động lại nhẹ nhàng, hãy triển khai các mẫu khởi động lại theo từng giai đoạn:

```yaml
---
- name: Rolling restart of web servers
  hosts: webservers
  serial: 1 # Process one host at a time
  become: yes

  tasks:
    - name: Remove server from load balancer
      uri:
        url: 'http://{{ load_balancer_host }}/api/servers/{{ inventory_hostname }}/disable'
        method: POST
      delegate_to: localhost

    - name: Wait for existing connections to drain
      wait_for:
        timeout: 30

    - name: Update application configuration
      template:
        src: app.conf.j2
        dest: /etc/myapp/app.conf
      notify: restart application

    - name: Flush handlers to restart application
      meta: flush_handlers

    - name: Wait for application to be ready
      wait_for:
        port: '{{ app_port }}'
        host: '{{ inventory_hostname }}'
        delay: 5
        timeout: 60

    - name: Add server back to load balancer
      uri:
        url: 'http://{{ load_balancer_host }}/api/servers/{{ inventory_hostname }}/enable'
        method: POST
      delegate_to: localhost

  handlers:
    - name: restart application
      service:
        name: myapp
        state: restarted
```

### Chuỗi xác thực cấu hình

Tạo chuỗi handler xác thực cấu hình trước khi áp dụng các thay đổi:

```yaml
handlers:
  - name: validate and restart services
    block:
      - name: validate nginx configuration
        command: nginx -t
        changed_when: false

      - name: validate ssl certificates
        command: openssl x509 -in {{ item }} -text -noout
        loop:
          - /etc/ssl/certs/server.crt
        changed_when: false

      - name: restart nginx
        service:
          name: nginx
          state: restarted

      - name: verify nginx is responding
        uri:
          url: 'http://{{ ansible_default_ipv4.address }}'
          status_code: 200
        retries: 3
        delay: 5

    rescue:
      - name: restore configuration backups
        command: '{{ item }}'
        loop:
          - cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
          - cp /etc/ssl/certs/server.crt.backup /etc/ssl/certs/server.crt
        ignore_errors: yes

      - name: restart nginx with old configuration
        service:
          name: nginx
          state: restarted

      - name: fail with detailed message
        fail:
          msg: 'Configuration update failed and was rolled back'
```

## Các phương pháp thực hành tốt nhất cho handler

### Đặt tên và tổ chức

Sử dụng tên mô tả và sắp xếp handler một cách hợp lý:

```yaml
handlers:
  # Service management
  - name: restart web server
    service:
      name: nginx
      state: restarted

  - name: reload web server
    service:
      name: nginx
      state: reloaded

  # Configuration validation
  - name: validate web server config
    command: nginx -t
    changed_when: false

  # Application specific
  - name: restart application server
    service:
      name: '{{ app_name }}'
      state: restarted
```

### Handler Hiệu Quả

Ưu tiên tải lại hơn khởi động lại khi có thể:

```yaml
# Better - faster, doesn't interrupt existing connections
- name: reload nginx configuration
  service:
    name: nginx
    state: reloaded

# Use only when reload isn't sufficient
- name: restart nginx service
  service:
    name: nginx
    state: restarted
```

### Kiểm tra hành vi handler

Kiểm tra xem handler có hoạt động chính xác hay không bằng cách thực hiện các thay đổi có chủ ý:

```bash
# Make a change that should trigger handlers
ansible-playbook site.yml --check --diff

# Run the playbook and verify handlers execute
ansible-playbook site.yml -v

# Verify services are running correctly
ansible webservers -m service -a "name=nginx state=started"
```

## Các bước tiếp theo

handler cung cấp nền tảng để tạo ra khả năng tự động hóa phản ứng thông minh với các thay đổi. Bạn đã học cách kích hoạt các hành động có điều kiện, điều phối nhiều dịch vụ và triển khai xử lý lỗi cho các hoạt động quan trọng.

Trong phần tiếp theo, chúng ta sẽ khám phá các mẫu và tệp - cách tạo tệp cấu hình động và quản lý việc triển khai tệp trên cơ sở hạ tầng của bạn.

Các mẫu handler bạn đã học ở đây đảm bảo quá trình tự động hóa của bạn vừa hiệu quả vừa đáng tin cậy, tránh những gián đoạn dịch vụ không cần thiết trong khi vẫn duy trì tính nhất quán của hệ thống.
