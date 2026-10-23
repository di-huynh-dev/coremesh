---
title: "Tìm hiểu chuyên sâu về provisioner"
description: Tùy chỉnh Packer image với provisioner. Bao gồm shell, tệp và Ansible provisioner, thứ tự thực thi và nhắm mục tiêu builder cụ thể trong quá trình xây dựng.
order: 5
---

**TLDR**: provisioner cài đặt phần mềm và định cấu hình image của bạn. Những cái phổ biến là tập lệnh shell, tải tệp lên và các công cụ quản lý cấu hình như Ansible. Chúng chạy theo thứ tự và bạn có thể kiểm soát builder nào chúng áp dụng.

provisioner là nơi diễn ra quá trình tùy chỉnh thực tế. Đây là nơi bạn cài đặt các gói, sao chép tệp, định cấu hình dịch vụ và chuẩn bị image để sử dụng production.

## Shell provisioner

provisioner phổ biến nhất. Chạy các lệnh hoặc tập lệnh shell:

**Lệnh nội tuyến**:
```hcl
provisioner "shell" {
  inline = [
    "sudo apt-get update",
    "sudo apt-get install -y nginx redis-server",
    "sudo systemctl enable nginx redis-server"
  ]
}
```

**EKịch bản bên ngoài**:
```hcl
provisioner "shell" {
  script = "scripts/setup-app.sh"
}
```

**Nhiều tập lệnh**:
```hcl
provisioner "shell" {
  scripts = [
    "scripts/install-dependencies.sh",
    "scripts/configure-services.sh",
    "scripts/cleanup.sh"
  ]
}
```

**EBiến môi trường**:
```hcl
provisioner "shell" {
  environment_vars = [
    "APP_VERSION=${var.app_version}",
    "ENVIRONMENT=production"
  ]
  script = "scripts/install-app.sh"
}
```

## Tệp provisioner

Sao chép các tập tin từ máy tính của bạn sang image:

**Tệp đơn**:
```hcl
provisioner "file" {
  source      = "configs/nginx.conf"
  destination = "/tmp/nginx.conf"
}
```

**Thư mục**:
```hcl
provisioner "file" {
  source      = "app/"
  destination = "/tmp/app"
}
```

**Nội dung từ biến**:
```hcl
provisioner "file" {
  content     = templatefile("config.tpl", { db_host = var.db_host })
  destination = "/tmp/config.json"
}
```

Tệp provisioner tải lên các vị trí tạm thời. Sử dụng shell provisioner để di chuyển tệp đến đích cuối cùng:

```hcl
provisioner "file" {
  source      = "app.tar.gz"
  destination = "/tmp/app.tar.gz"
}

provisioner "shell" {
  inline = [
    "sudo tar -xzf /tmp/app.tar.gz -C /opt/",
    "sudo chown -R appuser:appuser /opt/app",
    "rm /tmp/app.tar.gz"
  ]
}
```

## Ansible provisioner

Chạy Ansible playbook so với image:

```hcl
provisioner "ansible" {
  playbook_file = "./playbook.yml"
  extra_arguments = [
    "--extra-vars",
    "ansible_python_interpreter=/usr/bin/python3"
  ]
  ansible_env_vars = [
    "ANSIBLE_HOST_KEY_CHECKING=False"
  ]
}
```

**Khi nào nên sử dụng nhà cung cấp Ansible**:
- Bạn đã có Ansible playbook
- Logic cấu hình phức tạp
- Cần idempotency (chạy nhiều lần)
- Muốn sử dụng vai trò Ansible từ Galaxy

**ESách mẫu** (`playbook.yml`):
```yaml
---
- name: Configure web server
  hosts: default
  become: yes
  tasks:
    - name: Install packages
      apt:
        name:
          - nginx
          - postgresql-client
        state: present
        update_cache: yes
    
    - name: Copy nginx config
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      notify: reload nginx
    
    - name: Enable nginx
      systemd:
        name: nginx
        enabled: yes
  
  handlers:
    - name: reload nginx
      systemd:
        name: nginx
        state: reloaded
```

## Đầu bếp provisioner

Chạy công thức nấu ăn của Chef:

```hcl
provisioner "chef-solo" {
  cookbook_paths = ["cookbooks"]
  run_list       = ["recipe[nginx]", "recipe[app::deploy]"]
  json = {
    nginx = {
      port = 8080
    }
  }
}
```

## Con rối provisioner

Áp dụng bảng kê khai Puppet:

```hcl
provisioner "puppet-masterless" {
  manifest_file = "manifests/default.pp"
  module_paths  = ["modules"]
}
```

## Lệnh và thực thi provisioner

provisioner chạy theo thứ tự được xác định:

```hcl
build {
  sources = ["source.amazon-ebs.web"]
  
  # 1. Update system
  provisioner "shell" {
    inline = ["sudo apt-get update"]
  }
  
  # 2. Install base packages
  provisioner "shell" {
    inline = ["sudo apt-get install -y curl wget git"]
  }
  
  # 3. Copy application files
  provisioner "file" {
    source      = "app/"
    destination = "/tmp/app"
  }
  
  # 4. Run configuration
  provisioner "ansible" {
    playbook_file = "playbook.yml"
  }
  
  # 5. Cleanup
  provisioner "shell" {
    inline = [
      "sudo apt-get clean",
      "sudo rm -rf /tmp/*"
    ]
  }
}
```

## Cung cấp có chọn lọc

**Chạy provisioner trên các trình tạo cụ thể**:
```hcl
provisioner "shell" {
  only = ["amazon-ebs.production"]
  inline = ["echo 'Production specific setup'"]
}
```

**Eloại trừ người xây dựng**:
```hcl
provisioner "shell" {
  except = ["docker.test"]
  inline = ["echo 'Runs on all builders except docker.test'"]
}
```

**Cung cấp có điều kiện**:
```hcl
variable "install_monitoring" {
  type    = bool
  default = true
}

provisioner "shell" {
  inline = [
    var.install_monitoring ? "sudo apt-get install -y datadog-agent" : "echo Skipping monitoring"
  ]
}
```

## Xử lý lỗi

**Tạm dừng khi lỗi**:
```hcl
provisioner "shell" {
  pause_before = "10s"
  inline       = ["some-command"]
}
```

**Timeout**:
```hcl
provisioner "shell" {
  timeout = "30m"
  script  = "scripts/long-running-task.sh"
}
```

**Max thử lại**:
```hcl
provisioner "shell" {
  max_retries = 3
  inline      = ["curl -f https://api.example.com/health"]
}
```

**Tiếp tục với lỗi** (không được khuyến nghị):
```hcl
provisioner "shell" {
  inline = ["command-that-might-fail || true"]
}
```

## Các mẫu chung

### Đợi hệ thống sẵn sàng

```hcl
provisioner "shell" {
  inline = [
    "cloud-init status --wait",  # Wait for cloud-init to finish
    "sudo systemctl is-system-running --wait"  # Wait for system to be fully up
  ]
}
```

### Cài đặt từ Kho lưu trữ gói

```hcl
provisioner "shell" {
  inline = [
    "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -",
    "sudo add-apt-repository 'deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable'",
    "sudo apt-get update",
    "sudo apt-get install -y docker-ce"
  ]
}
```

### Tải xuống và cài đặt nhị phân

```hcl
provisioner "shell" {
  inline = [
    "wget https://releases.example.com/app-${var.version}.tar.gz",
    "sudo tar -xzf app-${var.version}.tar.gz -C /opt/",
    "sudo ln -s /opt/app-${var.version}/bin/app /usr/local/bin/app"
  ]
}
```

### Định cấu hình dịch vụ

```hcl
provisioner "file" {
  source      = "configs/app.service"
  destination = "/tmp/app.service"
}

provisioner "shell" {
  inline = [
    "sudo mv /tmp/app.service /etc/systemd/system/app.service",
    "sudo systemctl daemon-reload",
    "sudo systemctl enable app.service"
  ]
}
```

### Dọn dẹp cho production

```hcl
provisioner "shell" {
  inline = [
    # Clean package manager cache
    "sudo apt-get clean",
    "sudo rm -rf /var/lib/apt/lists/*",
    
    # Remove temporary files
    "sudo rm -rf /tmp/*",
    "sudo rm -rf /var/tmp/*",
    
    # Clear logs
    "sudo find /var/log -type f -exec truncate -s 0 {} \\;",
    
    # Remove bash history
    "rm -f ~/.bash_history",
    "sudo rm -f /root/.bash_history",
    
    # Clear machine ID (important for cloud images)
    "sudo truncate -s 0 /etc/machine-id",
    "sudo rm -f /var/lib/dbus/machine-id"
  ]
}
```

## Thực tiễn tốt nhất

**Sử dụng tập lệnh cho logic phức tạp**: provisioner nội tuyến phù hợp với các lệnh đơn giản. Đối với bất cứ điều gì phức tạp, hãy sử dụng các tập lệnh bên ngoài.

**Make provisioner idempotent**: provisioner phải an toàn để chạy nhiều lần trong quá trình phát triển.

**Test provisioner cục bộ**: Sử dụng Docker builder để kiểm tra logic cung cấp trước khi xây dựng đám mây.

**Các mối quan tâm riêng**: Một provisioner cho mỗi tác vụ logic (cài đặt, định cấu hình, dọn dẹp).

**Sử dụng các biến**: Không mã hóa cứng các phiên bản hoặc URL. Sử dụng các biến để mẫu có thể tái sử dụng được.

**Kiểm tra mã thoát**: Các lệnh shell không thành công khi thoát khác 0. Kiểm tra lệnh cục bộ trước.

**Dọn dẹp kỹ lưỡng**: Xóa bản dựng artifact, bộ nhớ đệm gói và các tệp tạm thời để giảm kích thước image.

## Tiếp theo là gì

provisioner tùy chỉnh image của bạn. Chương tiếp theo đề cập đến các biến và cách tạo mẫu có thể tái sử dụng trên các môi trường và trường hợp sử dụng khác nhau.
