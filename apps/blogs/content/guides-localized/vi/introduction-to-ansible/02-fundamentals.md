---
title: "Nguyên tắc cơ bản về Ansible"
description: 'Hiểu các khái niệm cốt lõi của Ansible: mô-đun, playbook, tác vụ và cách chúng phối hợp với nhau để tự động hóa cơ sở hạ tầng.'
order: 2
---

Ansible hoạt động thông qua ba khái niệm cốt lõi khớp với nhau như các khối xây dựng. Hiểu những khái niệm này sẽ giúp bạn suy nghĩ theo "Thuật ngữ Ansible" và viết tự động hóa vừa mạnh mẽ vừa có thể bảo trì.

## Mô-đun: Các khối xây dựng

Mô-đun là công cụ của Ansible để hoàn thành công việc. Mỗi mô-đun xử lý một loại tác vụ cụ thể, như cài đặt gói, sao chép tệp hoặc quản lý dịch vụ. Hãy coi các mô-đun như hàm chuyên biệt, biết cách thực hiện các thay đổi cụ thể cho hệ thống.

### Khám phá các mô-đun có sẵn

Ansible bao gồm hàng trăm mô-đun. Chúng ta hãy xem xét một số điều cần thiết:

```bash
# Get help for any module
ansible-doc apt
ansible-doc copy
ansible-doc service
```

Lệnh `ansible-doc` hiển thị tài liệu chi tiết, bao gồm các tham số và ví dụ cho từng mô-đun.

### Sử dụng mô-đun trong lệnh đặc biệt

Bạn đã sử dụng các mô-đun trong các lệnh đặc biệt. Dưới đây là nhiều ví dụ hơn:

```bash
# Install a package using the apt module
ansible webservers -m apt -a "name=nginx state=present" --become

# Copy a file using the copy module
ansible webservers -m copy -a "src=./index.html dest=/var/www/html/index.html" --become

# Start a service using the service module
ansible webservers -m service -a "name=nginx state=started enabled=yes" --become
```

Mỗi mô-đun có các tham số khác nhau (`-a` chỉ định các đối số). Mô-đun `apt` cần `name` và `state`, trong khi `copy` cần `src` và `dest`.

### Tính bình thường của mô-đun

Một trong những tính năng chính của Ansible là tính tạm thời - chạy cùng một mô-đun nhiều lần sẽ tạo ra cùng một kết quả mà không gây ra sự cố. Nếu một gói đã được cài đặt, mô-đun `apt` sẽ không thử cài đặt lại gói đó.

Kiểm tra điều này bằng cách chạy cùng một lệnh hai lần:

```bash
ansible webservers -m apt -a "name=nginx state=present" --become
```

Lần đầu tiên hiển thị `"changed": true`, nhưng các lần chạy tiếp theo hiển thị `"changed": false` vì nginx đã được cài đặt.

## Nhiệm vụ: Kết hợp các module với Logic

Nhiệm vụ kết hợp các mô-đun với logic bổ sung như điều kiện, vòng lặp và xử lý lỗi. Mặc dù các lệnh đặc biệt hữu ích cho các thao tác nhanh nhưng các tác vụ lại mang lại cấu trúc và tính linh hoạt cao hơn.

Một nhiệm vụ bao gồm:

- Một mô-đun để chạy
- Các thông số cho mô-đun đó
- Siêu dữ liệu tùy chọn như tên và điều kiện

Đây là giao diện của một tác vụ ở định dạng YAML:

```yaml
- name: Install nginx web server
  apt:
    name: nginx
    state: present
  become: yes
```

Tác vụ này sử dụng mô-đun `apt` với các tham số cụ thể và bao gồm tên mô tả. Lệnh `become: yes` chạy tác vụ với đặc quyền sudo.

## Playbook: Điều phối nhiều tác vụ

playbook là các tệp YAML chứa một hoặc nhiều "lượt phát". Mỗi vở kịch xác định:

- Máy chủ nào sẽ nhắm mục tiêu
- Những nhiệm vụ cần chạy trên các máy chủ đó
- Cách thực hiện các tác vụ đó (với đặc quyền nào, theo thứ tự nào)

### Playbook đầu tiên của bạn

Tạo một tệp có tên `webserver.yml`:

```yaml
---
- name: Configure web servers
  hosts: webservers
  become: yes

  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present

    - name: Start and enable nginx
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Copy index page
      copy:
        src: ./index.html
        dest: /var/www/html/index.html
        mode: '0644'
```

playbook này chứa một lần chơi với ba nhiệm vụ. Nó nhắm mục tiêu nhóm `webservers` từ inventory của bạn và chạy tất cả các tác vụ với đặc quyền nâng cao.

### Chạy playbook của bạn

Đầu tiên, tạo một tệp HTML đơn giản cho tác vụ sao chép:

```bash
echo "<h1>Hello from Ansible!</h1>" > index.html
```

Sau đó chạy playbook:

```bash
ansible-playbook webserver.yml
```

Ansible sẽ thực thi từng tác vụ theo thứ tự, hiển thị kết quả cho từng máy chủ. Bạn sẽ thấy đầu ra cho biết liệu mỗi tác vụ có thực hiện thay đổi hay tìm thấy hệ thống đã có trong trạng thái mong muốn hay không.

### Hiểu cấu trúc playbook

Hãy chia nhỏ cấu trúc playbook:

```yaml
--- # YAML document start marker
- name: Configure web servers # Play name (descriptive)
  hosts: webservers # Target host group
  become: yes # Run tasks with sudo

  tasks: # List of tasks to execute
    - name: Install nginx # Task name (descriptive)
      apt: # Module name
        name: nginx # Module parameters
        state: present
```

Điểm đánh dấu ba dấu gạch ngang (`---`) bắt đầu tài liệu YAML. Vấn đề thụt lề trong YAML - sử dụng dấu cách, không phải tab và nhất quán với khoảng cách.

## Các biến: Làm cho playbook trở nên linh hoạt

Các giá trị mã hóa cứng trong playbook khiến chúng khó sử dụng lại. Các biến giải quyết vấn đề này bằng cách cho phép bạn xác định các giá trị riêng biệt với các tác vụ sử dụng chúng.

### Xác định các biến trong playbook

Thêm biến trực tiếp vào playbook của bạn:

```yaml
---
- name: Configure web servers
  hosts: webservers
  become: yes

  vars:
    web_package: nginx
    web_service: nginx
    web_port: 80

  tasks:
    - name: Install web server
      apt:
        name: '{{ web_package }}'
        state: present

    - name: Start web service
      service:
        name: '{{ web_service }}'
        state: started
        enabled: yes
```

Các biến sử dụng dấu ngoặc nhọn đôi (`{{ variable_name }}`) khi được tham chiếu trong các tác vụ.

### Sử dụng biến từ tệp

Để tổ chức tốt hơn, hãy lưu trữ các biến trong các tệp riêng biệt. Tạo `group_vars/webservers.yml`:

```yaml
---
web_package: nginx
web_service: nginx
document_root: /var/www/html
admin_email: admin@example.com
```

Ansible tự động tải các biến từ các thư mục `group_vars/` dựa trên các nhóm inventory của bạn. Bất kỳ máy chủ nào trong nhóm `webservers` sẽ có quyền truy cập vào các biến này.

## Facts: Khám phá thông tin hệ thống

Ansible tự động thu thập "facts" về từng hệ thống mà nó quản lý - thông tin như địa chỉ IP, chi tiết hệ điều hành, bộ nhớ và dung lượng ổ đĩa. Các facts này có sẵn dưới dạng các biến trong playbook của bạn.

### Đang xem facts

Xem tất cả facts cho máy chủ:

```bash
ansible webservers -m setup
```

Điều này tạo ra một đầu ra JSON lớn với thông tin hệ thống. Bạn có thể lọc facts cụ thể:

```bash
# Show only memory information
ansible webservers -m setup -a "filter=ansible_memory_mb"

# Show only network information
ansible webservers -m setup -a "filter=ansible_default_ipv4"
```

### Sử dụng facts trong playbook

facts có sẵn dưới dạng các biến trong playbook của bạn:

```yaml
- name: Display system information
  debug:
    msg: '{{ inventory_hostname }} has {{ ansible_memory_mb.real.total }}MB of RAM and runs {{ ansible_distribution }} {{ ansible_distribution_version }}'
```

Mô-đun `debug` in các thông báo, giúp nó hữu ích cho việc khắc phục sự cố và hiển thị thông tin.

## Đặt tất cả lại với nhau

Đây là playbook hoàn chỉnh hơn thể hiện các khái niệm này:

```yaml
---
- name: Configure web servers with system-specific settings
  hosts: webservers
  become: yes

  vars:
    web_packages:
      - nginx
      - ufw

  tasks:
    - name: Update package cache
      apt:
        update_cache: yes

    - name: Install web server packages
      apt:
        name: '{{ web_packages }}'
        state: present

    - name: Configure firewall for web traffic
      ufw:
        rule: allow
        port: '{{ item }}'
      loop:
        - '22'
        - '80'
        - '443'

    - name: Create index page with system info
      copy:
        content: |
          <h1>Web Server Info</h1>
          <p>Hostname: {{ inventory_hostname }}</p>
          <p>OS: {{ ansible_distribution }} {{ ansible_distribution_version }}</p>
          <p>Memory: {{ ansible_memory_mb.real.total }}MB</p>
        dest: /var/www/html/index.html
        mode: '0644'

    - name: Ensure nginx is running
      service:
        name: nginx
        state: started
        enabled: yes
```

playbook này chứng tỏ:

- Biến (cả giá trị đơn giản và danh sách)
- Vòng lặp (từ khóa `loop` với ufw)
- facts (thông tin hệ thống trong nội dung HTML)
- Nhiều mô-đun làm việc cùng nhau

## Thực tiễn tốt nhất cho tổ chức

Khi playbook của bạn phát triển, hãy làm theo các phương pháp tổ chức sau:

### Sử dụng tên mô tả

Mỗi trò chơi và nhiệm vụ phải có tên mô tả rõ ràng:

```yaml
# Good
- name: Install nginx web server package

# Less helpful
- name: Install package
```

### Nhiệm vụ liên quan đến nhóm

Sắp xếp các nhiệm vụ một cách hợp lý trong các lượt chơi:

```yaml
tasks:
  # Package installation tasks
  - name: Update package cache
    apt:
      update_cache: yes

  - name: Install required packages
    apt:
      name: '{{ required_packages }}'
      state: present

  # Configuration tasks
  - name: Copy nginx configuration
    template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf

  # Service management tasks
  - name: Start and enable services
    service:
      name: '{{ item }}'
      state: started
      enabled: yes
    loop: '{{ services_to_start }}'
```

### Kiểm tra playbook của bạn

Trước khi chạy playbook trên các hệ thống production, hãy kiểm tra chúng trong môi trường an toàn. Sử dụng cờ `--check` để xem điều gì sẽ thay đổi nếu không thực hiện thay đổi thực tế:

```bash
ansible-playbook webserver.yml --check
```

Chế độ "chạy thử" này hiển thị những gì Ansible sẽ làm mà không thực sự làm việc đó.

## Các bước tiếp theo

Bây giờ bạn đã hiểu các khối xây dựng cốt lõi của Ansible: mô-đun, tác vụ, playbook, biến và facts. Những khái niệm này tạo thành nền tảng cho tất cả tự động hóa Ansible.

Trong phần tiếp theo, chúng ta sẽ đi sâu hơn vào cách viết playbook hiệu quả, bao gồm xử lý lỗi, điều kiện và tổ chức các quy trình làm việc tự động hóa phức tạp.

Các mẫu bạn đã học ở đây - kết hợp các mô-đun thành các nhiệm vụ, sắp xếp các nhiệm vụ vào playbook và sử dụng các biến để linh hoạt - sẽ phục vụ tốt cho bạn khi chúng ta khám phá các tính năng Ansible nâng cao hơn.

Chúc bạn tự động hóa vui vẻ!
