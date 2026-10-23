---
title: "Quyền và thực thi tập lệnh"
description: Tìm hiểu cách đặt quyền phù hợp, làm cho tập lệnh có thể thực thi được và hiểu các cách khác nhau để chạy tập lệnh Bash
order: 7
---

Hiểu cách đặt quyền và thực thi các tập lệnh Bash đúng cách là điều quan trọng đối với bất kỳ người viết tập lệnh nào. Trong phần này, chúng ta sẽ khám phá mọi thứ bạn cần biết về quyền tập lệnh, phương pháp thực thi và ý nghĩa bảo mật của các phương pháp khác nhau.

## Thông tin cơ bản về quyền truy cập tệp

Trong các hệ thống giống Unix, mọi tệp và thư mục đều có một bộ quyền xác định ai có thể đọc, viết hoặc thực thi nó. Các quyền này được chia thành ba loại:

- **Owner**: Người dùng đã tạo tệp
- **Group**: Một nhóm người dùng có các đặc quyền cụ thể
- **Khác**: Những người khác

Mỗi danh mục có thể có ba quyền có thể có:

- **Read (r)**: Cho phép xem nội dung file
- **Write (w)**: Cho phép sửa đổi file
- **Execute (x)**: Cho phép chạy file dưới dạng chương trình

## Xem quyền của tệp

Để xem các quyền của tệp, hãy sử dụng lệnh `ls -l`:

```bash
ls -l script.sh
```

Đầu ra sẽ trông giống như thế này:

```
-rw-r--r-- 1 user group 1024 May 17 10:30 script.sh
```

Mười ký tự đầu tiên thể hiện loại tệp và quyền:

- Ký tự đầu tiên: Loại tệp (`-` cho tệp thông thường, `d` cho thư mục)
- Ký tự 2-4: Quyền của chủ sở hữu (`rw-` có nghĩa là đọc và ghi, không thực thi)
- Ký tự 5-7: Quyền của nhóm (`r--` có nghĩa là chỉ đọc)
- Ký tự 8-10: Quyền khác (`r--` có nghĩa là chỉ đọc)

## Thay đổi quyền đối với tệp

Để làm cho tập lệnh có thể thực thi được, bạn cần thêm quyền thực thi. Lệnh `chmod` được sử dụng để thay đổi quyền truy cập tệp:

```bash
# Add execute permission for the owner only
chmod u+x script.sh

# Add execute permission for everyone
chmod +x script.sh

# Set specific permissions (read/write/execute for owner, read/execute for group and others)
chmod 755 script.sh
```

Ký hiệu số (như `755`) thể hiện các quyền ở định dạng bát phân:

- Chữ số đầu tiên (`7`): Quyền của chủ sở hữu (4=đọc + 2=ghi + 1=thực thi)
- Chữ số thứ hai (`5`): Quyền của nhóm (4=đọc + 0=không ghi + 1=thực thi)
- Chữ số thứ ba (`5`): Quyền khác (4=đọc + 0=không ghi + 1=thực thi)

Các mẫu quyền phổ biến cho tập lệnh:

- `700`: Chỉ chủ sở hữu mới có thể đọc, viết và thực thi (hạn chế nhất)
- `755`: Chủ sở hữu có thể đọc, viết và thực thi; nhóm và những người khác có thể đọc và thực thi
- `775`: Chủ sở hữu và nhóm có thể đọc, viết và thực thi; những người khác có thể đọc và thực thi
- `777`: Mọi người đều có thể đọc, viết và thực thi (kém an toàn nhất, tránh nếu có thể)

## Tạo tập lệnh có thể thực thi được

Để một tập lệnh có thể thực thi được, bạn cần hai thứ:

1. Quyền thực thi, như chúng ta vừa thảo luận
2. Một dòng shebang thích hợp ở đầu tập lệnh

Dòng shebang chỉ định trình thông dịch nào sẽ thực thi tập lệnh:

```bash
#!/bin/bash
# The rest of your script...
```

Điều này yêu cầu hệ thống sử dụng `/bin/bash` để diễn giải tập lệnh.

shell hoặc trình thông dịch khác nhau có thể được chỉ định:

```bash
#!/bin/sh        # POSIX-compliant shell
#!/usr/bin/env bash  # Find bash in PATH (more portable)
#!/usr/bin/python    # Python script
#!/usr/bin/perl      # Perl script
```

Cách tiếp cận `#!/usr/bin/env` đặc biệt hữu ích cho tính di động trên các hệ thống khác nhau, vì nó tìm kiếm trình thông dịch trong PATH của người dùng.

## Các cách khác nhau để thực thi tập lệnh Bash

Có một số cách để thực thi tập lệnh Bash, mỗi cách có ý nghĩa khác nhau:

### 1. Thực thi trực tiếp (yêu cầu quyền thực thi)

```bash
./script.sh
```

Điều này chạy tập lệnh dưới dạng tệp thực thi. Tập lệnh phải có quyền thực thi và dòng shebang xác định trình thông dịch.

### 2. Sử dụng bash rõ ràng

```bash
bash script.sh
```

Điều này gọi rõ ràng trình thông dịch bash trên tệp tập lệnh. Tập lệnh không cần quyền thực thi và dòng shebang bị bỏ qua vì bạn đang chỉ định trực tiếp trình thông dịch.

### 3. Nguồn tập lệnh

```bash
source script.sh
# or
. script.sh  # Shorthand notation
```

Điều này thực thi tập lệnh trong môi trường shell hiện tại thay vì trong một hệ thống con mới. Điều này có nghĩa là:

- Các biến được đặt trong tập lệnh vẫn có sẵn sau khi tập lệnh kết thúc
- Lệnh `exit` trong tập lệnh sẽ thoát shell hiện tại của bạn
- Tập lệnh không cần quyền thực thi

Phương pháp này thường được sử dụng để tải hàm hoặc các biến môi trường.

## Bối cảnh thực thi tập lệnh

Hiểu bối cảnh thực thi tập lệnh của bạn là điều quan trọng:

### Subshell so với shell hiện tại

Khi bạn chạy tập lệnh bằng `./script.sh` hoặc `bash script.sh`, tập lệnh sẽ chạy trong một shell con:

- Các biến được đặt trong tập lệnh không khả dụng sau khi tập lệnh kết thúc
- Các thay đổi đối với thư mục làm việc không ảnh hưởng đến shell gốc
- Lệnh `exit` chỉ thoát khỏi tập lệnh chứ không thoát khỏi phiên cuối của bạn

Khi bạn tạo tập lệnh bằng `source script.sh` hoặc `. script.sh`, tập lệnh đó sẽ chạy trong shell hiện tại:

- Các biến vẫn có sẵn
- Thay đổi thư mục vẫn tồn tại
- Lệnh `exit` sẽ thoát shell hiện tại của bạn

Đây là một minh chứng đơn giản:

```bash
# Create a test script
cat > test_vars.sh << 'EOF'
#!/bin/bash
TEST_VAR="This is a test"
echo "Inside script: TEST_VAR=$TEST_VAR"
cd /tmp
echo "Inside script: PWD=$PWD"
EOF

chmod +x test_vars.sh

# Run as executable
./test_vars.sh
echo "After running: TEST_VAR=$TEST_VAR"
echo "After running: PWD=$PWD"

# Source the script
source test_vars.sh
echo "After sourcing: TEST_VAR=$TEST_VAR"
echo "After sourcing: PWD=$PWD"
```

### Biến môi trường và các lớp con

Theo mặc định, khi bạn tạo một biến trong shell, biến đó là cục bộ của shell đó và không được truyền cho các tiến trình con:

```bash
MY_VAR="Hello"
bash -c 'echo $MY_VAR'  # Output: (empty)
```

Để cung cấp một biến cho các tiến trình con, bạn cần xuất biến đó:

```bash
export MY_VAR="Hello"
bash -c 'echo $MY_VAR'  # Output: Hello
```

## Chạy tập lệnh ở các chế độ khác nhau

Bạn có thể kiểm soát cách Bash diễn giải và thực thi tập lệnh của mình bằng các tùy chọn đặc biệt:

### Chế độ gỡ lỗi

Để chạy tập lệnh ở chế độ gỡ lỗi, in từng lệnh trước khi thực thi:

```bash
bash -x script.sh
```

Ngoài ra, bạn có thể bật gỡ lỗi cho các phần của tập lệnh của mình:

```bash
#!/bin/bash

# Regular execution
echo "This is normal output"

# Start debugging
set -x
echo "This command is shown before execution"
for i in {1..3}; do
    echo "Loop iteration $i"
done
# Stop debugging
set +x

echo "Back to normal output"
```

### Chế độ xử lý lỗi

Bash cung cấp một số chế độ để xử lý lỗi:

```bash
# Exit immediately if a command fails
set -e

# Treat unset variables as an error
set -u

# Exit if any command in a pipe fails (not just the last one)
set -o pipefail

# Combine all three
set -euo pipefail
```

Bạn có thể thêm các cài đặt này vào đầu tập lệnh để xử lý lỗi hiệu quả hơn.

## Tìm và sử dụng thông dịch viên

Hệ thống cần tìm trình thông dịch của bạn (như `/bin/bash`) để thực thi tập lệnh của bạn. Điều này có thể khác nhau giữa các hệ thống, đó là lý do tại sao phương pháp `#!/usr/bin/env` lại hữu ích:

```bash
#!/usr/bin/env bash
```

Thao tác này sẽ tìm kiếm PATH của người dùng cho `bash`, giúp tập lệnh của bạn dễ mang theo hơn.

Để tìm vị trí của thông dịch viên:

```bash
which bash
# or
type -P bash
```

## Quyền thực thi tập lệnh trong thực tế

Hãy kết hợp tất cả những điều này lại với một ví dụ thực tế:

```bash
#!/bin/bash

# First, create a simple script
cat > hello.sh << 'EOF'
#!/bin/bash
echo "Hello from a shell script!"
current_time=$(date)
echo "Current time: $current_time"
EOF

# Check initial permissions
echo "Initial permissions:"
ls -l hello.sh

# Try to execute without execute permission
echo -e "\nTrying to execute without execute permission:"
./hello.sh 2>&1 || echo "Failed to execute"

# Add execute permission
echo -e "\nAdding execute permission:"
chmod +x hello.sh
ls -l hello.sh

# Execute with direct method
echo -e "\nExecuting with ./hello.sh:"
./hello.sh

# Execute by calling bash
echo -e "\nExecuting with bash hello.sh:"
bash hello.sh

# Create a script to demonstrate sourcing
cat > vars.sh << 'EOF'
#!/bin/bash
TEST_VAR="This variable was set in the script"
echo "Inside script: TEST_VAR is set"
EOF

chmod +x vars.sh

# Execute normally
echo -e "\nExecuting vars.sh normally:"
./vars.sh
echo "After normal execution, TEST_VAR='$TEST_VAR'"

# Source the script
echo -e "\nSourceing vars.sh:"
source vars.sh
echo "After sourcing, TEST_VAR='$TEST_VAR'"
```

## Cân nhắc về bảo mật

Khi làm việc với các quyền của tập lệnh, hãy lưu ý những điều cần cân nhắc về bảo mật sau:

1. **ATránh 777 quyền**: Không cấp cho mọi người quyền truy cập ghi vào tập lệnh của bạn vì điều này cho phép bất kỳ ai sửa đổi chúng.

2. **Hãy cẩn thận với setuid/setgid**: Các quyền đặc biệt này (được đặt bằng `chmod u+s` hoặc `chmod g+s`) cho phép tập lệnh chạy với các đặc quyền của chủ sở hữu hoặc nhóm. Điều này có thể gây ra rủi ro bảo mật.

3. **Xem xét cài đặt umask**: Quyền mặc định cho các tệp mới được xác định bởi giá trị umask của bạn. Giá trị điển hình là `022`, có nghĩa là các tệp mới nhận được quyền `644` (rw-r--r--).

4. **Hãy cẩn thận với việc chèn đường dẫn**: Khi thực thi các lệnh trong tập lệnh, đặc biệt là với `eval` hoặc khi sử dụng các biến trong đường dẫn, hãy cẩn thận với các cuộc tấn công chèn đường dẫn tiềm ẩn.

5. **Kiểm tra nguồn tập lệnh**: Trước khi thực thi các tập lệnh được tải xuống từ internet, hãy xem lại chúng để đảm bảo chúng không chứa mã độc.

6. **Sử dụng môi trường bị hạn chế**: Đối với các tập lệnh nhạy cảm, hãy cân nhắc sử dụng shell hoặc container bị hạn chế để hạn chế thiệt hại tiềm ẩn.

## Chạy tập lệnh khi khởi động hệ thống

Để tự động chạy tập lệnh khi hệ thống của bạn khởi động:

### Sử dụng cron

```bash
# Edit your crontab
crontab -e

# Add a line to run a script at reboot
@reboot /path/to/script.sh
```

### Sử dụng systemd (trên các bản phân phối Linux hiện đại)

Tạo một tệp dịch vụ systemd:

```bash
sudo nano /etc/systemd/system/myscript.service
```

Thêm nội dung:

```
[Unit]
Description=My Bash Script Service
After=network.target

[Service]
Type=simple
ExecStart=/path/to/script.sh
User=yourusername

[Install]
WantedBy=multi-user.target
```

Kích hoạt và bắt đầu dịch vụ:

```bash
sudo systemctl enable myscript.service
sudo systemctl start myscript.service
```

## Khắc phục sự cố về quyền

Các vấn đề phổ biến liên quan đến quyền và giải pháp của họ:

### "Quyền bị từ chối" khi cố gắng thực thi

```bash
# Make the script executable
chmod +x script.sh

# Check if the filesystem allows execution (some network filesystems don't)
# If necessary, copy to a local filesystem

# Check if the script has DOS line endings
file script.sh  # Look for "CRLF" in the output
dos2unix script.sh  # Convert if needed
```

### Lỗi "Không tìm thấy lệnh"

```bash
# Make sure the shebang path is correct
which bash
# Edit the script if necessary to use the correct path

# Use the env approach for better portability
#!/usr/bin/env bash
```

### Tập lệnh chạy khác nhau khi được thực thi so với khi có nguồn gốc

```bash
# Remember: sourced scripts run in the current shell environment
# Check for differences in environment variables, working directory, etc.

# Add debugging to see what's happening
set -x
```

Hiểu các quyền của tập lệnh và phương thức thực thi là điều cơ bản để làm việc hiệu quả với Bash. Với kiến thức này, bạn sẽ có thể tạo các tập lệnh có thể được thực thi một cách đáng tin cậy trên các môi trường khác nhau và bởi những người dùng khác nhau. Trong phần tiếp theo, chúng ta sẽ khám phá cách xử lý các đối số dòng lệnh trong tập lệnh của bạn, làm cho chúng linh hoạt và thân thiện hơn với người dùng.
