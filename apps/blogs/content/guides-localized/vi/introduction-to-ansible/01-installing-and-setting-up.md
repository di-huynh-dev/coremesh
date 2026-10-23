---
title: "Cài đặt và thiết lập Ansible"
description: Cài đặt Ansible trên hệ thống của bạn và thiết lập kết nối đầu tiên của bạn với các máy chủ từ xa.
order: 1
---

Việc thiết lập và chạy Ansible rất đơn giản. Không giống như các công cụ quản lý cấu hình khác, bạn chỉ cần cài đặt Ansible trên một máy (được gọi là "nút điều khiển") - máy chủ bạn quản lý không cần cài đặt bất kỳ phần mềm đặc biệt nào.

## Cài đặt Ansible

Phương pháp cài đặt phụ thuộc vào hệ điều hành và sở thích của bạn. Dưới đây là những cách tiếp cận đáng tin cậy nhất:

### Trên macOS với Homebrew

Nếu bạn đang sử dụng macOS, Homebrew cung cấp cách cài đặt đơn giản nhất:

```bash
brew install ansible
```

Việc này sẽ cài đặt phiên bản ổn định mới nhất cùng với tất cả các phụ thuộc cần thiết.

### Trên Ubuntu/Debian

Đối với hệ thống Ubuntu và Debian, hãy sử dụng kho lưu trữ gói chính thức:

```bash
# Add the Ansible PPA for the latest version
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository --yes --update ppa:ansible/ansible

# Install Ansible
sudo apt install ansible
```

PPA đảm bảo bạn nhận được các phiên bản gần đây thay vì các gói cũ hơn trong kho mặc định.

### Sử dụng pip (Phổ quát)

Nếu bạn thích trình quản lý gói của Python hoặc cần các tính năng mới nhất:

```bash
# Install using pip3
pip3 install ansible

# Or install in a virtual environment (recommended)
python3 -m venv ansible-env
source ansible-env/bin/activate
pip install ansible
```

Sử dụng môi trường ảo sẽ ngăn ngừa xung đột với các gói Python khác trên hệ thống của bạn.

### Xác minh cài đặt của bạn

Kiểm tra xem Ansible đã được cài đặt đúng chưa:

```bash
ansible --version
```

Bạn sẽ thấy đầu ra hiển thị phiên bản Ansible, phiên bản Python và vị trí tệp cấu hình. Một cái gì đó như:

```
ansible [core 2.14.2]
  config file = None
  configured module search path = ['/home/user/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python3/dist-packages/ansible
  ansible collection location = /home/user/.ansible/collections:/usr/share/ansible/collections
  executable location = /usr/bin/ansible
  python version = 3.10.6
```

## Chuẩn bị máy chủ của bạn

Ansible kết nối với các máy chủ từ xa bằng SSH, vì vậy bạn sẽ cần quyền truy cập SSH vào các máy bạn muốn quản lý. Đây là cách thiết lập điều này đúng cách:

### Xác thực khóa SSH

Xác thực mật khẩu hoạt động nhưng khóa SSH an toàn hơn và thuận tiện hơn cho việc tự động hóa. Nếu bạn chưa thiết lập khóa SSH:

```bash
# Generate a new SSH key pair
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy your public key to the target server
ssh-copy-id user@server-ip-address
```

Thay thế `user` bằng tên người dùng bạn sẽ sử dụng trên máy chủ từ xa và `server-ip-address` bằng địa chỉ IP hoặc tên máy chủ của máy chủ của bạn.

### Kiểm tra quyền truy cập SSH

Xác minh bạn có thể kết nối mà không cần nhập mật khẩu:

```bash
ssh user@server-ip-address
```

Nếu cách này hoạt động mà không cần nhắc nhập mật khẩu thì bạn đã sẵn sàng sử dụng Ansible.

## Lệnh Ansible đầu tiên của bạn

Ansible có thể chạy các lệnh riêng lẻ trên các máy chủ mà không cần ghi bất kỳ tệp cấu hình nào. Chế độ "đặc biệt" này hoàn hảo cho các tác vụ nhanh và kiểm tra kết nối.

### Kiểm tra kết nối

Hãy xác minh Ansible có thể truy cập máy chủ của bạn:

```bash
ansible all -i "server-ip-address," -u user -m ping
```

Phá vỡ lệnh này:

- `all` yêu cầu Ansible nhắm mục tiêu tất cả các máy chủ
- `-i "server-ip-address,"` chỉ định IP máy chủ của bạn (dấu phẩy rất quan trọng đối với các máy chủ đơn lẻ)
- `-u user` chỉ định tên người dùng SSH
- `-m ping` sử dụng mô-đun ping của Ansible để kiểm tra kết nối

Nếu thành công, bạn sẽ thấy kết quả như sau:

```
server-ip-address | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
```

Điều này xác nhận Ansible có thể kết nối với máy chủ của bạn và thực thi các lệnh.

### Chạy lệnh hệ thống

Hãy thử chạy một lệnh đơn giản trên máy chủ từ xa của bạn:

```bash
ansible all -i "server-ip-address," -u user -m shell -a "uptime"
```

Điều này thực thi lệnh `uptime` và trả về kết quả. Bạn sẽ thấy máy chủ đã chạy được bao lâu và tải hiện tại của nó.

## Tạo tệp inventory đầu tiên của bạn

Việc gõ chi tiết máy chủ vào mỗi lệnh sẽ trở nên tẻ nhạt một cách nhanh chóng. Các tệp inventory giải quyết vấn đề này bằng cách xác định máy chủ của bạn ở định dạng có thể sử dụng lại.

Tạo một tệp có tên `inventory.ini`:

```ini
[webservers]
web1 ansible_host=192.168.1.10 ansible_user=ubuntu
web2 ansible_host=192.168.1.11 ansible_user=ubuntu

[databases]
db1 ansible_host=192.168.1.20 ansible_user=ubuntu
```

inventory này xác định hai nhóm: `webservers` với hai máy chủ và `databases` với một máy chủ. Mỗi máy chủ có một bí danh (như `web1`) và chi tiết kết nối.

Bây giờ bạn có thể chạy lệnh đối với các nhóm hoặc máy chủ riêng lẻ:

```bash
# Ping all servers
ansible all -i inventory.ini -m ping

# Ping only web servers
ansible webservers -i inventory.ini -m ping

# Ping a specific host
ansible web1 -i inventory.ini -m ping
```

## Thiết lập tệp cấu hình

Thay vì chỉ định tệp inventory mỗi lần, hãy tạo tệp `ansible.cfg` trong thư mục làm việc của bạn:

```ini
[defaults]
inventory = inventory.ini
host_key_checking = False
remote_user = ubuntu
```

Cấu hình này:

- Đặt tệp inventory mặc định
- Tắt tính năng kiểm tra khóa máy chủ SSH (hữu ích cho môi trường động)
- Đặt người dùng từ xa mặc định

Bây giờ bạn có thể chạy các lệnh đơn giản hơn:

```bash
# These commands now work without specifying inventory or user
ansible all -m ping
ansible webservers -m shell -a "df -h"
```

## Các sự cố kết nối phổ biến

Nếu bạn gặp vấn đề, đây là những giải pháp phổ biến nhất:

### Kết nối SSH bị từ chối

```
server-ip-address | UNREACHABLE! => {
    "changed": false,
    "msg": "Failed to connect to the host via ssh",
    "unreachable": true
}
```

Kiểm tra xem:

- Địa chỉ IP của máy chủ là chính xác
- SSH đang chạy trên máy chủ (thường là cổng 22)
- Khóa SSH của bạn được cấu hình đúng
- Quy tắc tường lửa cho phép kết nối SSH

### Không tìm thấy Python

```
server-ip-address | FAILED! => {
    "changed": false,
    "module_stderr": "/bin/sh: 1: /usr/bin/python: not found",
    "msg": "The module failed to execute correctly"
}
```

Một số bản phân phối Linux hiện đại không bao gồm Python theo mặc định. Cài đặt nó:

```bash
# On the remote server
sudo apt update && sudo apt install python3

# Or specify Python 3 in your inventory
web1 ansible_host=192.168.1.10 ansible_user=ubuntu ansible_python_interpreter=/usr/bin/python3
```

### Quyền bị từ chối

Nếu bạn cần chạy các lệnh yêu cầu quyền truy cập sudo, hãy thêm cờ `--become`:

```bash
ansible all -m shell -a "apt update" --become
```

Hoặc định cấu hình quyền truy cập sudo trong inventory của bạn:

```ini
[webservers]
web1 ansible_host=192.168.1.10 ansible_user=ubuntu ansible_become=true
```

## Các bước tiếp theo

Bây giờ bạn đã cài đặt Ansible và có thể kết nối với máy chủ của mình. Bạn đã chạy các lệnh đặc biệt và tạo các tệp inventory cơ bản. Trong phần tiếp theo, chúng ta sẽ khám phá các khái niệm cơ bản của Ansible: mô-đun, playbook và cách chúng phối hợp với nhau để tự động hóa các tác vụ phức tạp.

Nền tảng bạn đã xây dựng ở đây - kết nối SSH phù hợp và quản lý inventory - hỗ trợ mọi thứ khác mà bạn sẽ làm với Ansible.

Chúc bạn cấu hình vui vẻ!
