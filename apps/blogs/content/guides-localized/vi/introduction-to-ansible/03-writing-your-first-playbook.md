---
title: "Viết playbook đầu tiên của bạn"
description: Xây dựng hoàn chỉnh, production-sẵn sàng playbook với việc xử lý lỗi, điều kiện và cấu trúc phù hợp.
order: 3
---

Bây giờ bạn đã hiểu các khái niệm cơ bản của Ansible, hãy xây dựng một playbook hoàn chỉnh thể hiện các mẫu trong thế giới thực. Bạn sẽ tạo playbook để thiết lập máy chủ web với khả năng xử lý lỗi thích hợp, cấu hình bảo mật và tính linh hoạt để hoạt động trên các môi trường khác nhau.

## Lập kế hoạch cho playbook của bạn

Trước khi viết bất kỳ mã nào, hãy nghĩ về những gì bạn muốn đạt được. Ví dụ playbook của chúng tôi sẽ:

- Cài đặt và cấu hình nginx
- Thiết lập tường lửa với các quy tắc phù hợp
- Tạo một trang chỉ mục tùy chỉnh
- Xử lý các hệ điều hành khác nhau
- Bao gồm kiểm tra lỗi thích hợp
- Đủ linh hoạt cho các môi trường khác nhau

Cách tiếp cận này - lập kế hoạch trước khi mã hóa - ngăn playbook trở thành tập hợp các nhiệm vụ vô tổ chức.

## Xây dựng cấu trúc cơ bản

Tạo một tệp mới có tên `web-setup.yml`:

```yaml
---
- name: Set up web server with security configurations
  hosts: webservers
  become: yes
  gather_facts: yes

  vars:
    web_user: www-data
    web_port: 80
    allowed_ports:
      - 22
      - 80
      - 443

  tasks:
    - name: Update package cache (Debian/Ubuntu)
      apt:
        update_cache: yes
        cache_valid_time: 3600
      when: ansible_os_family == "Debian"

    - name: Install nginx web server
      package:
        name: nginx
        state: present
```

Lưu ý một số cải tiến so với các ví dụ cơ bản:

- `gather_facts: yes` cho phép thu thập dữ kiện một cách rõ ràng
- Mô-đun `package` hoạt động trên các bản phân phối Linux khác nhau
- Điều kiện `when` khiến nhiệm vụ có điều kiện
- `cache_valid_time` ngăn chặn các cập nhật bộ đệm không cần thiết

## Thêm logic có điều kiện

Các bản phân phối Linux khác nhau đòi hỏi những cách tiếp cận khác nhau. Hãy xử lý nhiều hệ điều hành:

```yaml
- name: Install firewall (Ubuntu/Debian)
  apt:
    name: ufw
    state: present
  when: ansible_os_family == "Debian"

- name: Install firewall (CentOS/RHEL)
  yum:
    name: firewalld
    state: present
  when: ansible_os_family == "RedHat"

- name: Configure ufw firewall rules (Ubuntu/Debian)
  ufw:
    rule: allow
    port: '{{ item }}'
    proto: tcp
  loop: '{{ allowed_ports }}'
  when: ansible_os_family == "Debian"

- name: Enable ufw firewall (Ubuntu/Debian)
  ufw:
    state: enabled
  when: ansible_os_family == "Debian"
```

Mệnh đề `when` sử dụng Ansible facts để xác định họ hệ điều hành. Điều này làm cho playbook của bạn hoạt động trên các bản phân phối Linux khác nhau mà không cần sửa đổi.

## Triển khai xử lý lỗi

Tự động hóa trong thế giới thực cần xử lý lỗi mạnh mẽ. Hãy thêm kiểm tra để đảm bảo cấu hình của chúng tôi thành công:

```yaml
- name: Start nginx service
  service:
    name: nginx
    state: started
    enabled: yes
  register: nginx_service_result

- name: Verify nginx is responding
  uri:
    url: 'http://{{ ansible_default_ipv4.address }}:{{ web_port }}'
    method: GET
    status_code: 200
  register: nginx_response
  retries: 3
  delay: 5
  until: nginx_response.status == 200

- name: Display service status
  debug:
    msg: 'Nginx is running and responding on port {{ web_port }}'
  when: nginx_response.status == 200
```

Trình tự này:

1. Bắt đầu nginx và đăng ký kết quả
2. Kiểm tra nginx phản hồi các yêu cầu HTTP
3. Thử lại bài kiểm tra tối đa 3 lần với độ trễ 5 giây
4. Chỉ hiển thị thành công khi xác minh thành công

Từ khóa `register` ghi lại đầu ra của tác vụ để sử dụng trong các tác vụ sau này. Mệnh đề `until` lặp lại nhiệm vụ cho đến khi đáp ứng được điều kiện.

## Tạo nội dung động

Thay vì tạo các tệp tĩnh, hãy tạo nội dung dựa trên thông tin hệ thống:

```yaml
- name: Create custom index page
  copy:
    content: |
      <!DOCTYPE html>
      <html>
      <head>
          <title>{{ inventory_hostname }} - Web Server</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .info { background-color: #f0f0f0; padding: 20px; border-radius: 5px; }
          </style>
      </head>
      <body>
          <h1>Web Server Information</h1>
          <div class="info">
              <p><strong>Hostname:</strong> {{ inventory_hostname }}</p>
              <p><strong>IP Address:</strong> {{ ansible_default_ipv4.address }}</p>
              <p><strong>Operating System:</strong> {{ ansible_distribution }} {{ ansible_distribution_version }}</p>
              <p><strong>Total Memory:</strong> {{ ansible_memory_mb.real.total }}MB</p>
              <p><strong>Processor Count:</strong> {{ ansible_processor_vcpus }}</p>
              <p><strong>Server Status:</strong> Online and Running</p>
          </div>
          <p><em>Last updated: {{ ansible_date_time.iso8601 }}</em></p>
      </body>
      </html>
    dest: /var/www/html/index.html
    owner: '{{ web_user }}'
    group: '{{ web_user }}'
    mode: '0644'
  notify: reload nginx
```

Tác vụ này tạo một trang HTML động bằng Ansible facts. Lệnh `notify` kích hoạt handler khi tệp thay đổi.

## Thêm handler

handler chỉ chạy khi được tác vụ khác thông báo và chỉ chạy một lần, ngay cả khi được thông báo nhiều lần. Chúng hoàn hảo để khởi động lại dịch vụ sau khi thay đổi cấu hình:

```yaml
handlers:
  - name: reload nginx
    service:
      name: nginx
      state: reloaded

  - name: restart nginx
    service:
      name: nginx
      state: restarted
```

Đặt handler ở cùng mức thụt lề với `tasks`. Chúng chạy sau khi tất cả tác vụ hoàn thành, đảm bảo dịch vụ chỉ khởi động lại một lần ngay cả khi nhiều tệp cấu hình thay đổi.

## Thêm xác thực trước tác vụ

Trước khi thực hiện thay đổi, hãy xác nhận rằng hệ thống đáp ứng các yêu cầu:

```yaml
pre_tasks:
  - name: Check if system has sufficient memory
    fail:
      msg: 'System requires at least 1GB RAM, but only has {{ ansible_memory_mb.real.total }}MB'
    when: ansible_memory_mb.real.total < 1024

  - name: Verify SSH connectivity
    ping:

  - name: Check disk space
    shell: df / | tail -1 | awk '{print $5}' | sed 's/%//'
    register: disk_usage
    changed_when: false

  - name: Fail if disk usage is too high
    fail:
      msg: 'Root filesystem is {{ disk_usage.stdout }}% full. Need at least 20% free space.'
    when: disk_usage.stdout|int > 80
```

Các tác vụ trước chạy trước các tác vụ thông thường và có thể ngăn việc thực thi playbook nếu các điều kiện không được đáp ứng. Lệnh `changed_when: false` ngăn lệnh shell được đánh dấu là một thay đổi.

## Playbook hoàn chỉnh

Đây là playbook đầy đủ với tất cả các thành phần:

```yaml
---
- name: Set up web server with security configurations
  hosts: webservers
  become: yes
  gather_facts: yes

  vars:
    web_user: www-data
    web_port: 80
    allowed_ports:
      - 22
      - 80
      - 443

  pre_tasks:
    - name: Check system requirements
      fail:
        msg: 'System requires at least 1GB RAM'
      when: ansible_memory_mb.real.total < 1024

    - name: Verify connectivity
      ping:

  tasks:
    - name: Update package cache (Debian/Ubuntu)
      apt:
        update_cache: yes
        cache_valid_time: 3600
      when: ansible_os_family == "Debian"

    - name: Install required packages
      package:
        name: '{{ item }}'
        state: present
      loop:
        - nginx
        - ufw
      when: ansible_os_family == "Debian"

    - name: Configure firewall rules
      ufw:
        rule: allow
        port: '{{ item }}'
        proto: tcp
      loop: '{{ allowed_ports }}'
      when: ansible_os_family == "Debian"

    - name: Enable firewall
      ufw:
        state: enabled
      when: ansible_os_family == "Debian"

    - name: Start and enable nginx
      service:
        name: nginx
        state: started
        enabled: yes
      register: nginx_start

    - name: Create custom index page
      copy:
        content: |
          <!DOCTYPE html>
          <html>
          <head>
              <title>{{ inventory_hostname }} - Web Server</title>
              <style>
                  body { font-family: Arial, sans-serif; margin: 40px; }
                  .info { background-color: #f0f0f0; padding: 20px; border-radius: 5px; }
              </style>
          </head>
          <body>
              <h1>{{ inventory_hostname }} Web Server</h1>
              <div class="info">
                  <p><strong>IP:</strong> {{ ansible_default_ipv4.address }}</p>
                  <p><strong>OS:</strong> {{ ansible_distribution }} {{ ansible_distribution_version }}</p>
                  <p><strong>Memory:</strong> {{ ansible_memory_mb.real.total }}MB</p>
                  <p><strong>Status:</strong> Online</p>
              </div>
              <p><em>Configured by Ansible on {{ ansible_date_time.iso8601 }}</em></p>
          </body>
          </html>
        dest: /var/www/html/index.html
        owner: '{{ web_user }}'
        group: '{{ web_user }}'
        mode: '0644'
      notify: reload nginx

    - name: Verify web server is responding
      uri:
        url: 'http://{{ ansible_default_ipv4.address }}:{{ web_port }}'
        method: GET
        status_code: 200
      register: web_check
      retries: 3
      delay: 5
      until: web_check.status == 200

    - name: Display success message
      debug:
        msg: 'Web server successfully configured at http://{{ ansible_default_ipv4.address }}'

  handlers:
    - name: reload nginx
      service:
        name: nginx
        state: reloaded

  post_tasks:
    - name: Run final verification
      uri:
        url: 'http://{{ ansible_default_ipv4.address }}'
        return_content: yes
      register: final_check

    - name: Confirm deployment
      debug:
        msg: 'Deployment complete. Server is responding correctly.'
      when: final_check.status == 200
```

## Chạy và kiểm tra playbook của bạn

Thực thi playbook của bạn với các tùy chọn bổ sung để có đầu ra tốt hơn:

```bash
# Run with verbose output to see detailed information
ansible-playbook web-setup.yml -v

# Run in check mode to see what would change
ansible-playbook web-setup.yml --check

# Run and limit to specific hosts
ansible-playbook web-setup.yml --limit web1

# Run with step-by-step confirmation
ansible-playbook web-setup.yml --step
```

Tùy chọn `--step` yêu cầu xác nhận trước mỗi tác vụ, hữu ích cho việc kiểm tra hoặc khi bạn muốn kiểm soát cẩn thận việc thực thi.

## Khắc phục sự cố thường gặp

Khi playbook không hoạt động như mong đợi, hãy sử dụng các kỹ thuật gỡ lỗi sau:

### Thêm đầu ra gỡ lỗi

Chèn các tác vụ gỡ lỗi để kiểm tra các biến:

```yaml
- name: Debug system information
  debug:
    var: ansible_facts
  when: debug_mode is defined
```

Chạy với: `ansible-playbook web-setup.yml -e debug_mode=true`

### Sử dụng thẻ để thực thi có chọn lọc

Thêm thẻ để chỉ chạy các phần cụ thể của playbook của bạn:

```yaml
- name: Install packages
  package:
    name: nginx
    state: present
  tags:
    - packages
    - install

- name: Configure firewall
  ufw:
    rule: allow
    port: 80
  tags:
    - security
    - firewall
```

Chỉ chạy các tác vụ tường lửa: `ansible-playbook web-setup.yml --tags firewall`

### Xử lý lỗi nhiệm vụ

Một số tác vụ có thể thất bại theo những cách bạn có thể khôi phục sau:

```yaml
- name: Attempt to install optional package
  package:
    name: htop
    state: present
  ignore_errors: yes
  register: htop_install

- name: Report optional package status
  debug:
    msg: "htop installation: {{ 'successful' if htop_install.failed == false else 'failed (not critical)' }}"
```

Lệnh `ignore_errors: yes` tiếp tục thực thi playbook ngay cả khi tác vụ thất bại.

## Các bước tiếp theo

Bạn đã xây dựng một playbook toàn diện thể hiện nhiều tính năng mạnh mẽ của Ansible. playbook này bao gồm xác thực, xử lý lỗi, hỗ trợ đa nền tảng và xác minh - các mẫu bạn sẽ sử dụng trong tự động hóa production.

Trong phần tiếp theo, chúng ta sẽ khám phá cách tổ chức nhiều máy chủ bằng cách sử dụng các tệp, nhóm và biến inventory. Bạn sẽ học cách quản lý các môi trường khác nhau và mở rộng quy mô tự động hóa của mình trên các cơ sở hạ tầng lớn hơn.

Phương pháp tiếp cận có cấu trúc mà bạn đã học ở đây - lập kế hoạch, triển khai xử lý lỗi và kiểm tra kỹ lưỡng - sẽ phục vụ tốt cho bạn khi chúng ta giải quyết các tình huống phức tạp hơn.

Chúc bạn cấu hình vui vẻ!
