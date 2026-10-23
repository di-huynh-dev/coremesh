---
title: "A01: Kiểm soát truy cập bị hỏng"
description: Tìm hiểu về các lỗ hổng kiểm soát truy cập bị hỏng, cách kẻ tấn công khai thác chúng và các phương pháp hay nhất để ngăn chặn truy cập trái phép vào ứng dụng của bạn.
---

Kiểm soát truy cập bị hỏng đã tăng từ vị trí thứ năm trong Top 10 OWASP 2017 để trở thành **#1 rủi ro bảo mật ứng dụng web nghiêm trọng nhất** vào năm 2021. Điều này không có gì đáng ngạc nhiên—kiểm soát truy cập xác định ai có thể làm gì trong ứng dụng của bạn và nếu sai sẽ gây ra hậu quả nghiêm trọng.

## Kiểm soát truy cập bị hỏng là gì?

Kiểm soát truy cập thực thi chính sách sao cho người dùng không thể hành động ngoài quyền dự định của họ. Khi kiểm soát truy cập bị hỏng, kẻ tấn công có thể:

- **Xem dữ liệu của người dùng khác** - Truy cập các bản ghi mà họ không nên xem
- **Sửa đổi dữ liệu** - Thay đổi hồ sơ, bài đăng hoặc cài đặt của người khác
- **Thực hiện các hành động đặc quyền** - Quản trị viên hàm không có quyền quản trị viên
- **DXóa tài nguyên** - Xóa nội dung của người khác

Hãy nghĩ về nó giống như một hệ thống thẻ chìa khóa khách sạn bị hỏng—thẻ của bạn chỉ có thể mở được phòng của bạn, nhưng một lỗ hổng cho phép bạn truy cập vào bất kỳ phòng nào trong tòa nhà.

## Các mẫu lỗ hổng phổ biến

### 1. Tham chiếu đối tượng trực tiếp không an toàn (IDOR)

IDOR xảy ra khi một ứng dụng sử dụng dữ liệu đầu vào do người dùng cung cấp để truy cập trực tiếp vào các đối tượng mà không cần kiểm tra ủy quyền thích hợp.

**Ví dụ dễ bị tổn thương:**

Hãy tưởng tượng một điểm cuối API truy xuất hóa đơn của người dùng:

```javascript
// VULNERABLE: No authorization check!
app.get('/api/invoices/:invoiceId', async (req, res) => {
  const invoice = await Invoice.findById(req.params.invoiceId);
  res.json(invoice);
});
```

Vấn đề ở đây rất rõ ràng khi bạn nhìn thấy nó: bất kỳ người dùng được xác thực nào cũng có thể yêu cầu BẤT KỲ hóa đơn nào bằng cách thay đổi tham số `invoiceId`. Người dùng A có thể truy cập hóa đơn của Người dùng B bằng cách đoán hoặc tăng ID.

**Triển khai an toàn:**

```javascript
// SECURE: Verify the invoice belongs to the requesting user
app.get('/api/invoices/:invoiceId', async (req, res) => {
  const invoice = await Invoice.findById(req.params.invoiceId);
  
  // First, check if the invoice even exists
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  
  // Then verify the requesting user owns this invoice
  // req.user is set by authentication middleware
  if (invoice.userId !== req.user.id) {
    // Return 404 instead of 403 to avoid revealing that the resource exists
    return res.status(404).json({ error: 'Invoice not found' });
  }
  
  res.json(invoice);
});
```

Thông tin chi tiết quan trọng là **authentication không được ủy quyền**. Chỉ vì ai đó đã đăng nhập không có nghĩa là họ có thể truy cập mọi thứ. Mọi yêu cầu phải xác minh người dùng có quyền truy cập vào tài nguyên cụ thể đó.

### 2. Nâng cao đặc quyền

Tăng đặc quyền xảy ra khi người dùng có quyền truy cập vào hàm hoặc dữ liệu dành riêng cho các cấp đặc quyền cao hơn.

**Horizontal Escalation** - Truy cập tài nguyên của người dùng khác ở cùng cấp đặc quyền (như ví dụ IDOR ở trên).

**Vertical Escalation** - Đạt được các đặc quyền cao hơn, chẳng hạn như người dùng thông thường truy cập chức năng quản trị viên.

**Ví dụ dễ bị tổn thương:**

```javascript
// VULNERABLE: Only checks if user is logged in, not their role
app.delete('/api/admin/users/:userId', isAuthenticated, async (req, res) => {
  await User.delete(req.params.userId);
  res.json({ message: 'User deleted' });
});
```

Điểm cuối này sử dụng phần mềm trung gian xác thực nhưng không xác minh người dùng có đặc quyền quản trị viên. Bất kỳ người dùng đăng nhập nào cũng có thể xóa người dùng khác!

**Triển khai an toàn:**

```javascript
// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  // isAuthenticated middleware already verified the user
  // Now check their role
  if (req.user.role !== 'admin') {
    // Log the attempt - this could be an attack
    logger.warn('Unauthorized admin access attempt', {
      userId: req.user.id,
      attemptedAction: 'delete_user',
      targetUserId: req.params.userId,
      ip: req.ip
    });
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// SECURE: Chain both authentication AND authorization middleware
app.delete('/api/admin/users/:userId', isAuthenticated, requireAdmin, async (req, res) => {
  await User.delete(req.params.userId);
  res.json({ message: 'User deleted' });
});
```

### 3. Thiếu kiểm soát truy cập cấp độ hàm

Điều này xảy ra khi ứng dụng không hạn chế đúng cách quyền truy cập vào một số trang hoặc hàm nhất định. Một lỗi phổ biến là ẩn các liên kết quản trị trong giao diện người dùng nhưng không bảo vệ các điểm cuối thực tế.

**Mẫu dễ bị tổn thương:**

```javascript
// Frontend "security" - just hiding the button
{user.isAdmin && <button onClick={deleteAllUsers}>Delete All Users</button>}

// Backend has no protection - security through obscurity doesn't work!
app.post('/api/danger/delete-all-users', async (req, res) => {
  await User.deleteMany({});
  res.json({ message: 'All users deleted' });
});
```

Những kẻ tấn công không sử dụng giao diện người dùng của bạn—chúng gửi yêu cầu trực tiếp tới API của bạn. Nếu điểm cuối tồn tại và không được bảo vệ, họ sẽ tìm thấy nó.

**Triển khai an toàn:**

```javascript
// Defense in depth: protect BOTH frontend and backend

// Backend protection is mandatory
app.post('/api/admin/delete-all-users', 
  isAuthenticated,      // Must be logged in
  requireAdmin,         // Must be an admin
  requireMFA,           // Sensitive action - require MFA confirmation
  rateLimit({ max: 1, windowMs: 60000 }), // Rate limit dangerous operations
  async (req, res) => {
    // Log this action for audit purposes
    logger.info('Admin initiated user deletion', {
      adminId: req.user.id,
      timestamp: new Date().toISOString()
    });
    
    await User.deleteMany({});
    res.json({ message: 'All users deleted' });
  }
);
```

## Biện pháp phòng ngừa tốt nhất

### 1. Từ chối theo mặc định

Bắt đầu với mọi thứ bị khóa và cấp quyền truy cập một cách rõ ràng. Điều này trái ngược với việc cho phép mọi thứ và cố gắng chặn các hành động cụ thể.

```javascript
// Create a permission system that denies by default
const permissions = {
  'invoice:read': ['user', 'admin', 'accountant'],
  'invoice:create': ['user', 'admin', 'accountant'],
  'invoice:delete': ['admin', 'accountant'],
  'user:delete': ['admin'],
  'settings:modify': ['admin']
};

function hasPermission(userRole, action) {
  // If the action isn't defined, deny by default
  const allowedRoles = permissions[action];
  if (!allowedRoles) {
    logger.warn(`Undefined permission requested: ${action}`);
    return false;
  }
  return allowedRoles.includes(userRole);
}

// Middleware using the permission system
const requirePermission = (action) => (req, res, next) => {
  if (!hasPermission(req.user.role, action)) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  next();
};

// Usage
app.delete('/api/invoices/:id', 
  isAuthenticated, 
  requirePermission('invoice:delete'),
  deleteInvoiceHandler
);
```

### 2. Sử dụng tài liệu tham khảo gián tiếp

Thay vì hiển thị ID cơ sở dữ liệu (thường là tuần tự), hãy sử dụng các tham chiếu không thể đoán được.

```javascript
// Instead of /api/users/1, /api/users/2, etc.
// Use UUIDs: /api/users/550e8400-e29b-41d4-a716-446655440000

const { v4: uuidv4 } = require('uuid');

// When creating resources
const newInvoice = new Invoice({
  publicId: uuidv4(),  // Use this in URLs
  userId: req.user.id,
  amount: req.body.amount
});

// When querying, use the public ID
app.get('/api/invoices/:publicId', async (req, res) => {
  const invoice = await Invoice.findOne({ 
    publicId: req.params.publicId,
    userId: req.user.id  // Still verify ownership!
  });
  // ...
});
```

Việc sử dụng UUID khiến không thể liệt kê tài nguyên bằng cách tăng ID. Tuy nhiên, **đây không phải là sự thay thế cho việc kiểm tra ủy quyền thích hợp**—nó là một lớp bảo vệ bổ sung.

### 3. Triển khai bảo mật cấp hàng

Nhiều cơ sở dữ liệu hỗ trợ bảo mật cấp hàng (RLS), thực thi kiểm soát truy cập ở cấp cơ sở dữ liệu. Điều này cung cấp phòng thủ nhiều lớp—ngay cả khi mã ứng dụng của bạn có lỗi, cơ sở dữ liệu sẽ không trả về dữ liệu trái phép.

```sql
-- PostgreSQL Row Level Security Example

-- Enable RLS on the invoices table
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create a policy: users can only see their own invoices
-- current_user_id() is a function that returns the authenticated user's ID
CREATE POLICY user_invoices ON invoices
  FOR SELECT
  USING (user_id = current_user_id());

-- Admins can see all invoices
CREATE POLICY admin_all_invoices ON invoices
  FOR ALL
  USING (current_user_role() = 'admin');
```

Khi bật RLS, ngay cả khi mã ứng dụng của bạn quên lọc theo ID người dùng, cơ sở dữ liệu sẽ tự động áp dụng hạn chế.

### 4. Tập trung logic kiểm soát truy cập

Đừng phân tán việc kiểm tra ủy quyền trong toàn bộ cơ sở mã của bạn. Tập trung chúng để giảm nguy cơ mắc sai lầm.

```javascript
// access-control.js - Centralized authorization
class AccessControl {
  static async canAccessInvoice(user, invoiceId) {
    if (user.role === 'admin') return true;
    
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return false;
    
    // User can access their own invoices
    if (invoice.userId === user.id) return true;
    
    // Accountants can access invoices from their assigned companies
    if (user.role === 'accountant') {
      return user.assignedCompanies.includes(invoice.companyId);
    }
    
    return false;
  }
  
  static async canDeleteUser(actor, targetUserId) {
    // Only admins can delete users
    if (actor.role !== 'admin') return false;
    
    // Admins cannot delete themselves (prevent lockout)
    if (actor.id === targetUserId) return false;
    
    // Super admins cannot be deleted by regular admins
    const target = await User.findById(targetUserId);
    if (target?.role === 'super_admin' && actor.role !== 'super_admin') {
      return false;
    }
    
    return true;
  }
}

// Usage in route handlers
app.get('/api/invoices/:id', isAuthenticated, async (req, res) => {
  if (!await AccessControl.canAccessInvoice(req.user, req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  }
  // ... fetch and return invoice
});
```

## Kiểm tra kiểm soát truy cập bị hỏng

### Danh sách kiểm tra kiểm tra thủ công

Khi kiểm tra ứng dụng của bạn, hãy thử các kiểu tấn công phổ biến sau:

1. Kiểm tra **IDOR**: Thay đổi ID tài nguyên trong URL và nội dung yêu cầu
2. **Kiểm tra vai trò**: Truy cập điểm cuối của quản trị viên với tư cách là người dùng thông thường
3. Kiểm tra phương pháp **HTTP**: Thử DELETE/PUT trên các tài nguyên mà bạn chỉ có thể NHẬN
4. **Thao tác tham số**: Sửa đổi ID người dùng, tham số vai trò trong yêu cầu
5. **Force Browsing**: Truy cập URL trực tiếp mà không cần thông qua UI

### Kiểm tra tự động

Bao gồm các bài kiểm tra kiểm soát truy cập trong bộ kiểm tra của bạn:

```javascript
// Example test using Jest
describe('Invoice Access Control', () => {
  test('users cannot access other users invoices', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const invoice = await createInvoice({ userId: user1.id });
    
    // User2 tries to access User1's invoice
    const response = await request(app)
      .get(`/api/invoices/${invoice.id}`)
      .set('Authorization', `Bearer ${user2.token}`);
    
    // Should return 404 (not 403, to avoid revealing existence)
    expect(response.status).toBe(404);
  });
  
  test('regular users cannot access admin endpoints', async () => {
    const regularUser = await createTestUser({ role: 'user' });
    
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${regularUser.token}`);
    
    expect(response.status).toBe(403);
  });
});
```

## Bài học chính

1. **Authentication ≠ Authorization**: Đăng nhập không cấp quyền truy cập vào mọi thứ
2. **Deny theo mặc định**: Bắt đầu cấp quyền hạn chế và rõ ràng
3. **Xác thực theo mọi yêu cầu**: Đừng cho rằng các lần kiểm tra trước đó là đủ
4. **Thực thi phía máy chủ**: Không bao giờ chỉ dựa vào các hạn chế phía máy khách
5. **Sử dụng tham chiếu gián tiếp**: UUID khó đoán hơn ID tuần tự
6. **Thử nghiệm rộng rãi**: Bao gồm các thử nghiệm kiểm soát truy cập trong bộ thử nghiệm tự động của bạn
7. **Lỗi ghi nhật ký**: Vi phạm kiểm soát truy cập có thể chỉ ra một cuộc tấn công

Kiểm soát truy cập bị hỏng là lỗ hổng số 1 vì có lý do - rất dễ mắc sai lầm và gây thiệt hại nghiêm trọng khi bị khai thác. Hãy dành thời gian để thiết kế hệ thống ủy quyền của bạn một cách cẩn thận và kiểm tra nó một cách kỹ lưỡng.
