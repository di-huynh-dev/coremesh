---
title: "Kỹ thuật Git nâng cao"
order: 10
description: Tìm hiểu các tính năng Git mạnh mẽ cho các quy trình và tình huống phức tạp
---

Khi bạn trở nên thành thạo hơn với Git, bạn sẽ gặp phải những tình huống đòi hỏi những kỹ thuật nâng cao hơn. Phần này bao gồm các tính năng Git mạnh mẽ có thể giúp bạn xử lý các tình huống và quy trình công việc phức tạp.

## Kỹ thuật Rebasing nâng cao

### Rebase tương tác với Fixup

Khi bạn cần thực hiện các thay đổi đối với commit trước đó, bạn có thể sử dụng tùy chọn sửa lỗi:

```bash
# Make your changes
git add .
git commit --fixup commit-hash

# Then rebase to incorporate the fixup
git rebase -i --autosquash HEAD~5
```

Cờ `--autosquash` tự động di chuyển bản sửa lỗi commit bên cạnh commit mà họ đang sửa và đánh dấu chúng là `fixup`.

### Rebase trên một căn cứ khác

Đôi khi bạn cần di chuyển một nhánh từ cơ sở này sang cơ sở khác:

```bash
git rebase --onto new-base old-base feature-branch
```

Điều này sẽ khởi động lại commit giữa `old-base` và `feature-branch` lên `new-base`.

Ví dụ: Di chuyển một nhánh từ nhánh tính năng này sang nhánh tính năng khác:

```bash
# Before:
#  main
#    |
#    A---B---C feature-1
#         \
#          D---E---F feature-2

git rebase --onto main feature-1 feature-2

# After:
#  main
#    |
#    A---D'---E'---F' feature-2
#    |
#    B---C feature-1
```

### Bảo toàn sự hợp nhất trong quá trình Rebase

Theo mặc định, việc khởi động lại làm phẳng hợp nhất commit. Để duy trì cấu trúc hợp nhất:

```bash
git rebase -i --rebase-merges HEAD~10
```

Điều này hữu ích khi bạn muốn giữ bối cảnh hợp nhất trong lịch sử của mình.

## Ngăn chặn các kỹ thuật nâng cao

### Tích trữ các tập tin cụ thể

Để chỉ lưu trữ các tệp cụ thể:

```bash
git stash push -m "Work on login component" src/components/Login.js
```

### Tạo một nhánh từ Stash

Nếu bạn muốn áp dụng stash cho một nhánh mới:

```bash
git stash branch new-branch stash@{1}
```

Điều này tạo ra một nhánh mới bắt đầu từ commit nơi stash được tạo, áp dụng stash và loại bỏ nó nếu thành công.

### Quản lý nhiều Stash

Khi bạn có nhiều kho lưu trữ, bạn có thể:

Liệt kê tất cả các kho với thông tin chi tiết:

```bash
git stash list --stat
```

Hiển thị nội dung của một stash cụ thể:

```bash
git stash show -p stash@{2}
```

Áp dụng một stash cụ thể mà không xóa nó:

```bash
git stash apply stash@{2}
```

Xóa một kho cụ thể:

```bash
git stash drop stash@{2}
```

### Lưu trữ các tập tin không bị theo dõi

Theo mặc định, `git stash` chỉ lưu các tệp được theo dõi. Để bao gồm các tập tin không bị theo dõi:

```bash
git stash -u
```

Để bao gồm cả các tệp bị bỏ qua:

```bash
git stash -a
```

## Mô-đun con và cây con

### Làm việc với các mô-đun con

Các mô-đun con cho phép bạn bao gồm các kho lưu trữ Git khác trong kho lưu trữ của mình:

Thêm một mô-đun con:

```bash
git submodule add https://github.com/username/library.git lib/library
```

Khởi tạo các mô-đun con sau khi nhân bản:

```bash
git submodule init
git submodule update
```

Hoặc sao chép với các mô-đun con trong một bước:

```bash
git clone --recurse-submodules https://github.com/username/project.git
```

Cập nhật tất cả các mô-đun con:

```bash
git submodule update --remote
```

### Cây con Git

Cây con là một giải pháp thay thế cho các mô-đun con hợp nhất các kho lưu trữ bên ngoài vào một thư mục con:

Thêm một cây con:

```bash
git subtree add --prefix=lib/library https://github.com/username/library.git main --squash
```

Cập nhật cây con:

```bash
git subtree pull --prefix=lib/library https://github.com/username/library.git main --squash
```

Đóng góp trở lại kho lưu trữ ban đầu:

```bash
git subtree push --prefix=lib/library https://github.com/username/library.git contribution-branch
```

### Mô-đun con vs Cây con

| tính năng             | mô-đun con               | Cây con           |
| ------------------- | ------------------------ | ------------------ |
| Lưu trữ             | Chỉ tham khảo          | Bản sao đầy đủ của mã  |
| Đường cong học tập      | Dốc hơn                  | Nhẹ nhàng hơn            |
| Theo dõi sự phụ thuộc | Phiên bản rõ ràng         | Có thể ít rõ ràng hơn  |
| Cập nhật             | Hướng dẫn sử dụng                   | Có thể dễ dàng hơn      |
| Những thay đổi bên ngoài    | Cần sự cho phép rõ ràng | Có thể sửa đổi cục bộ |
| Tốt nhất cho            | Thư viện của bên thứ ba    | Tách dự án  |

## Viết lại lịch sử

### Lọc lịch sử kho lưu trữ

Để viết lại lịch sử mở rộng, hãy sử dụng git-filter-repo (sự thay thế hiện đại cho git-filter-branch):

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove a file from all of history
git filter-repo --path path/to/large-file.bin --invert-paths
```

Điều này hữu ích cho:

- Xóa các tập tin lớn
- Xóa thông tin nhạy cảm
- Trích xuất thư mục con vào kho lưu trữ riêng của nó

### Tách một kho lưu trữ

Để trích xuất thư mục con vào kho lưu trữ mới:

```bash
git filter-repo --subdirectory-filter path/to/subdirectory
```

Điều này viết lại lịch sử như thể thư mục con vốn là thư mục gốc của kho lưu trữ.

### Kết hợp kho lưu trữ

Để hợp nhất lịch sử của nhiều kho lưu trữ:

```bash
# Add the other repository as a remote
git remote add other-repo https://github.com/username/other-repo.git
git fetch other-repo

# Merge with the allow-unrelated-histories flag
git merge other-repo/main --allow-unrelated-histories

# Resolve any conflicts
git commit
```

## Chiến lược hợp nhất nâng cao

### Hợp nhất bạch tuộc

Khi sáp nhập nhiều hơn hai chi nhánh cùng một lúc:

```bash
git merge branch1 branch2 branch3
```

Điều này tạo ra một commit hợp nhất duy nhất với nhiều cha mẹ. Nó chỉ hoạt động nếu không có xung đột.

### Hợp nhất với các tùy chọn chiến lược

Git cung cấp một số chiến lược hợp nhất với các tùy chọn có thể tùy chỉnh:

Chiến lược đệ quy với thuật toán kiên nhẫn (xử lý tốt hơn các thay đổi phức tạp):

```bash
git merge feature-branch -s recursive -X patience
```

Bỏ qua các thay đổi về khoảng trắng trong quá trình hợp nhất:

```bash
git merge feature-branch -X ignore-space-change
```

Ưu tiên một bên trong xung đột:

```bash
git merge feature-branch -X ours  # Keep our version in conflicts
```

Hoặc:

```bash
git merge feature-branch -X theirs  # Use their version in conflicts
```

## Ref và Refspecs

### Hiểu tài liệu tham khảo Git

Git sử dụng tài liệu tham khảo (refs) để trỏ đến commit:

- `HEAD`: commit hiện tại bạn đang làm việc
- `refs/heads/main`: Nhánh chính
- `refs/tags/v1.0.0`: Thẻ có tên v1.0.0
- `refs/remotes/origin/main`: Nhánh chính trên remote gốc

Bạn có thể sử dụng các tham chiếu tượng trưng để tham khảo commit:

```bash
HEAD~3  # Three commits before HEAD
main^2  # The second parent of the main branch tip (for merge commits)
v1.0.0^{} # The commit object that the tag points to
```

### Sử dụng Refspecs cho hoạt động từ xa

Refspecs xác định ánh xạ giữa các tham chiếu từ xa và cục bộ:

```bash
git fetch origin +refs/heads/*:refs/remotes/origin/*
```

Điều này tìm nạp tất cả các nhánh từ nguồn gốc và lưu trữ chúng dưới dạng các nhánh theo dõi từ xa.

Để chỉ tìm nạp các nhánh cụ thể:

```bash
git fetch origin main:refs/remotes/origin/main develop:refs/remotes/origin/develop
```

### Tạo tham chiếu tùy chỉnh

Bạn có thể thiết lập các thông số giới thiệu tùy chỉnh trong cấu hình git của mình:

```bash
[remote "origin"]
    url = https://github.com/username/repo.git
    fetch = +refs/heads/*:refs/remotes/origin/*
    fetch = +refs/pull/*/head:refs/remotes/origin/pr/*
```

Với cấu hình này, `git fetch` cũng sẽ tìm nạp tất cả pull request từ GitHub.

## Móc Git

### Tạo móc Git hữu ích

Móc Git là các tập lệnh chạy tự động trên các sự kiện Git nhất định. Chúng được lưu trữ trong thư mục `.git/hooks`.

Móc Pre-commit để ngăn chặn việc cam kết các tệp lớn:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for files larger than 5MB
large_files=$(find . -type f -size +5M -not -path "./.git/*")

if [ -n "$large_files" ]; then
  echo "Error: Attempting to commit large files:"
  echo "$large_files"
  echo "Please remove these files or add them to .gitignore"
  exit 1
fi

exit 0
```

Móc commit-msg để thực thi các quy ước thông báo commit:

```bash
#!/bin/bash
# .git/hooks/commit-msg

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# Check if the message follows conventional commits format
if ! echo "$commit_msg" | grep -qE '^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+'; then
  echo "Error: Commit message does not follow the conventional commits format."
  echo "Example: feat(auth): add login functionality"
  exit 1
fi

exit 0
```

### Chia sẻ quan điểm với nhóm của bạn

Móc Git không được sao chép khi kho lưu trữ được sao chép. Để chia sẻ hook:

1. Lưu trữ hook trong một thư mục trong kho lưu trữ của bạn:

   ```
   project/
   ├── .git/
   └── git-hooks/
       ├── pre-commit
       ├── commit-msg
       └── ...
   ```

2. Thiết lập tập lệnh để cài đặt hook:

   ```bash
   #!/bin/bash
   # setup-hooks.sh

   cp git-hooks/* .git/hooks/
   chmod +x .git/hooks/*
   ```

3. Ghi lại quá trình trong README của bạn

Ngoài ra, hãy sử dụng công cụ như Husky cho các dự án npm để quản lý hook trong pack.json.

## Làm việc với các bản vá

### Tạo và áp dụng các bản vá

Các bản vá cho phép bạn chia sẻ các thay đổi mà không cần kho lưu trữ từ xa chung:

Tạo bản vá cho commit cuối cùng:

```bash
git format-patch -1 HEAD
```

Tạo bản vá cho nhiều loại commit:

```bash
git format-patch main..feature-branch
```

Áp dụng một bản vá:

```bash
git apply path/to/0001-commit-message.patch
```

Áp dụng và tạo commit:

```bash
git am path/to/0001-commit-message.patch
```

### Tạo chuỗi bản vá

Đối với một loạt các thay đổi liên quan:

```bash
git format-patch -o patches/ main..feature-branch --cover-letter
```

Điều này tạo ra một loạt các tệp vá lỗi có thư xin việc mà bạn có thể chỉnh sửa để giải thích toàn bộ chuỗi.

## Thuộc tính Git

### Tùy chỉnh hành vi của Git bằng các thuộc tính

Thuộc tính Git, được xác định trong `.gitattributes`, kiểm soát cách Git xử lý các loại tệp khác nhau:

```
# .gitattributes
*.txt text
*.jpg binary
*.sh text eol=lf
*.bat text eol=crlf
```

Điều này đảm bảo:

- Các tệp văn bản có kết thúc dòng được chuẩn hóa
- Tệp JPG được coi là nhị phân
- Các tập lệnh shell luôn sử dụng phần cuối của LF (dành cho Unix)
- Các tệp hàng loạt luôn sử dụng phần cuối CRLF (dành cho Windows)

### Xác định các chiến lược khác biệt và hợp nhất tùy chỉnh

Đối với các loại tệp cụ thể:

```
*.png diff=image
*.docx diff=word
```

Bạn sẽ cần định cấu hình các trình điều khiển khác biệt này:

```bash
git config diff.image.textconv exiftool
git config diff.word.textconv docx2txt
```

Bây giờ `git diff` sẽ hiển thị những khác biệt có ý nghĩa đối với các loại tệp này.

## Gói và lưu trữ

### Tạo kho lưu trữ Git di động

Bundle tạo một tệp duy nhất chứa tất cả commit và các tài liệu tham khảo:

```bash
git bundle create repo.bundle HEAD main
```

Để sao chép từ một gói:

```bash
git clone repo.bundle -b main new-repo
```

Điều này rất hữu ích để truyền dữ liệu Git mà không cần kết nối mạng.

### Tạo kho lưu trữ mã của bạn

Để tạo một kho lưu trữ ZIP cho dự án của bạn:

```bash
git archive --format=zip HEAD > project.zip
```

Để lưu trữ một thẻ cụ thể:

```bash
git archive --format=zip v1.0.0 > project-v1.0.0.zip
```

Để bao gồm các mô-đun con:

```bash
git submodule foreach --recursive 'git archive --prefix=$path/ --format=zip HEAD > $PWD/submodule-$name.zip'
```

## Cấu hình nâng cao

### Định cấu hình Git cho năng suất

Một số cài đặt cấu hình hữu ích:

```bash
# Auto-correct typos in Git commands
git config --global help.autocorrect 20

# Show branch names in commit logs
git config --global log.decorate true

# Cache credentials
git config --global credential.helper cache

# Set a global .gitignore
git config --global core.excludesfile ~/.gitignore_global

# Use delta for improved diffs
git config --global core.pager "delta"

# Automatically prune deleted remote branches on fetch/pull
git config --global fetch.prune true
```

### Bí danh cho quy trình làm việc nâng cao

Thiết lập bí danh phức tạp:

```bash
# Undo the last commit but keep changes staged
git config --global alias.uncommit 'reset --soft HEAD^'

# Interactive rebase for cleanup
git config --global alias.cleanup 'rebase -i @{upstream}'

# Visualize log with graph
git config --global alias.graph 'log --graph --oneline --decorate --all'

# Show all configs
git config --global alias.aliases 'config --get-regexp ^alias\.'

# Clean up merged branches
git config --global alias.clean-branches '!git branch --merged | grep -v "\*" | xargs -n 1 git branch -d'
```

## Nội bộ Git

### Hiểu đối tượng Git

Git lưu trữ bốn loại đối tượng:

1. **Blob**: Nội dung của tệp
2. **Tree**: Danh sách thư mục, chứa các đốm màu và các cây khác
3. **Commit**: Trỏ tới cây, có siêu dữ liệu
4. **Tag**: Một đối tượng trỏ đến một commit cụ thể

Bạn có thể kiểm tra các đối tượng này:

```bash
# View a blob
git cat-file -p blob_hash

# View a tree
git cat-file -p tree_hash

# View a commit
git cat-file -p commit_hash

# View an object's type
git cat-file -t object_hash
```

### Tài liệu tham khảo Git

Tài liệu tham khảo (ref) là con trỏ tới commit. Chúng được lưu trữ trong `.git/refs/`:

- Chi nhánh: `.git/refs/heads/`
- Thẻ: `.git/refs/tags/`
- Chi nhánh từ xa: `.git/refs/remotes/`

Xem commit một điểm tham chiếu đến:

```bash
git rev-parse main
git rev-parse HEAD
git rev-parse --verify v1.0.0
```

### Tập lệnh tùy chỉnh sử dụng lệnh hệ thống nước Git

Các lệnh "sửa ống nước" cấp thấp của Git có thể được sử dụng để xây dựng các công cụ tùy chỉnh:

Tập lệnh để tìm các đối tượng lớn trong kho Git của bạn:

```bash
#!/bin/bash
# find-large-objects.sh

# Create a temporary pack
git gc --quiet --prune=now

# Find the 10 largest objects
git verify-pack -v .git/objects/pack/*.idx |
  grep -v chain |
  sort -k3nr |
  head -10 |
  while read hash type size remainder; do
    if [ $size -gt 100000 ]; then
      echo "$size bytes: $(git cat-file -t $hash) $hash"
      git rev-list --all --objects | grep $hash | sed 's/^.*\t//'
    fi
  done
```

## Git cho quy trình làm việc chuyên biệt

### Monorepos với Git

Để quản lý monorepos lớn:

- Sử dụng kiểm tra thưa thớt để làm việc với các tập hợp con của repo:

  ```bash
  git clone --no-checkout https://github.com/username/monorepo.git
  cd monorepo
  git sparse-checkout set path/to/subdirectory1 path/to/subdirectory2
  git checkout main
  ```

- Xem xét việc sao chép một phần để giảm kích thước tải xuống:

  ```bash
  git clone --filter=blob:none https://github.com/username/monorepo.git
  ```

- Sử dụng các công cụ như Git LFS cho các tệp nhị phân lớn

### Git để tích hợp/triển khai liên tục

Trong CI/CD pipeline, tối ưu hóa hoạt động Git:

- Sử dụng bản sao nông để tăng tốc quá trình:

  ```bash
  git clone --depth 1 https://github.com/username/repo.git
  ```

- Chỉ lấy các nhánh cần thiết:

  ```bash
  git fetch origin $CI_COMMIT_REF_NAME
  ```

- Sử dụng chức năng tích hợp của Git để kiểm tra các thay đổi trong các thư mục cụ thể:
  ```bash
  if git diff --name-only HEAD~1 HEAD | grep -q "^frontend/"; then
    run_frontend_tests
  fi
  ```

### Git cho Khoa học dữ liệu và ML

Đối với các dự án khoa học dữ liệu:

- Sử dụng Git LFS cho các tệp và bộ dữ liệu mô hình lớn
- Xem xét các công cụ như DVC (Kiểm soát phiên bản dữ liệu) để tạo phiên bản dữ liệu và mô hình ML
- Tạo các hook để ngăn chặn việc chuyển dữ liệu nhạy cảm hoặc các tệp lớn không bị theo dõi
- Sử dụng quy ước đặt tên nhánh phản ánh các thử nghiệm (ví dụ: `experiment/feature-selection-1`)

## Kết luận

Các kỹ thuật Git nâng cao này cung cấp các công cụ mạnh mẽ để xử lý các tình huống phức tạp và tối ưu hóa quy trình làm việc của bạn. Mặc dù bạn có thể không cần tất cả các tính năng này ngay lập tức nhưng việc hiểu chúng sẽ giúp bạn giải quyết các vấn đề đầy thách thức về kiểm soát phiên bản khi chúng phát sinh.

Hãy nhớ rằng Git rất linh hoạt và có khả năng mở rộng. Khi bạn cảm thấy thoải mái hơn với các tính năng nâng cao này, bạn có thể kết hợp và tùy chỉnh chúng để tạo ra quy trình làm việc hoàn toàn phù hợp với nhu cầu của bạn và của nhóm bạn.

Kỹ năng quan trọng nhất là biết khi nào nên sử dụng những kỹ thuật tiên tiến này. Bắt đầu với những điều cơ bản và dần dần kết hợp các tính năng mạnh mẽ hơn này khi bạn gặp phải những tình huống cần đến chúng.
EOF
