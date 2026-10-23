---
title: "A04: Thiết kế không an toàn"
description: Tìm hiểu về các lỗ hổng thiết kế không an toàn, sự khác biệt giữa thiết kế an toàn và triển khai an toàn cũng như cách xây dựng tính năng bảo mật cho ứng dụng của bạn ngay từ đầu.
---

Thiết kế không an toàn là một hạng mục mới trong Top 10 OWASP năm 2021, tập trung vào các rủi ro liên quan đến sai sót trong thiết kế và kiến trúc. Điều này khác với các lỗi triển khai—thiết kế không an toàn có nghĩa là ngay cả việc triển khai hoàn hảo một thiết kế có sai sót vẫn không an toàn.

## Thiết kế không an toàn là gì?

Thiết kế không an toàn xảy ra khi các yêu cầu và biện pháp kiểm soát bảo mật không được xem xét trong giai đoạn thiết kế. Đó là sự khác biệt giữa:

- ** Triển khai không an toàn** - Một lỗ hổng trong cách bạn xây dựng nội dung nào đó (ví dụ: SQL injection từ nối chuỗi)
- **Insecure Design** - Một lỗ hổng trong những gì bạn quyết định xây dựng (ví dụ: không giới hạn tốc độ khi thử mật khẩu)

Bạn không thể khắc phục thiết kế không an toàn bằng cách triển khai hoàn hảo. Nếu bạn thiết kế một ngôi nhà không có ổ khóa trên cửa thì việc lắp đặt các cửa một cách hoàn hảo sẽ không làm cho ngôi nhà trở nên an toàn.

## Các mẫu thiết kế không an toàn phổ biến

### 1. Thiếu giới hạn tỷ lệ

**Vấn đề:**

Không giới hạn tốc độ, kẻ tấn công có thể thực hiện số lần thử đoán mật khẩu không giới hạn, mã thông báo cưỡng bức hoặc áp đảo hệ thống của bạn.

```javascript
// INSECURE DESIGN: No rate limiting on login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  
  if (user && await bcrypt.compare(password, user.password)) {
    return res.json({ token: generateToken(user) });
  }
  
  res.status(401).json({ error: 'Invalid credentials' });
});
```

Kẻ tấn công có thể thử hàng triệu kết hợp mật khẩu mà không bị hạn chế.

**Thiết kế an toàn:**

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// Global rate limiter for all requests
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests, please try again later'
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts per window
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
  // Use Redis for distributed rate limiting across multiple servers
  store: new RedisStore({ client: redisClient })
});

// Apply limiters
app.use(globalLimiter);
app.post('/login', authLimiter, loginHandler);
app.post('/forgot-password', authLimiter, forgotPasswordHandler);
```

Đồng thời thực hiện khóa tài khoản sau nhiều lần thất bại:

```javascript
async function loginHandler(req, res) {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  
  // Check if account is locked
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const remainingTime = Math.ceil((user.lockedUntil - new Date()) / 60000);
    return res.status(423).json({
      error: `Account locked. Try again in ${remainingTime} minutes.`
    });
  }
  
  if (user && await bcrypt.compare(password, user.password)) {
    // Reset failed attempts on successful login
    await User.updateOne(
      { _id: user._id },
      { $set: { failedAttempts: 0, lockedUntil: null } }
    );
    return res.json({ token: generateToken(user) });
  }
  
  // Track failed attempts
  if (user) {
    const failedAttempts = (user.failedAttempts || 0) + 1;
    const update = { failedAttempts };
    
    // Lock account after 5 failed attempts
    if (failedAttempts >= 5) {
      update.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
    
    await User.updateOne({ _id: user._id }, { $set: update });
  }
  
  res.status(401).json({ error: 'Invalid credentials' });
}
```

### 2. Mã định danh tài nguyên có thể dự đoán được

**Vấn đề:**

Việc sử dụng các mã định danh tuần tự hoặc có thể dự đoán được sẽ giúp kẻ tấn công dễ dàng liệt kê tài nguyên.

```javascript
// INSECURE DESIGN: Sequential user IDs
// /api/users/1, /api/users/2, /api/users/3...
const user = await User.findById(req.params.id);  // id = 1, 2, 3...

// INSECURE DESIGN: Predictable reset tokens
const resetToken = `reset-${userId}-${Date.now()}`;
```

**Thiết kế an toàn:**

```javascript
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Use UUIDs for resource identifiers
const newUser = new User({
  publicId: uuidv4(),  // 550e8400-e29b-41d4-a716-446655440000
  // ...
});

// Use cryptographically random tokens
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');  // 64 character hex string
}

const resetToken = generateSecureToken();
// Store hashed version of token, send plain version to user
const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
```

### 3. Thiếu xác thực logic nghiệp vụ

**Vấn đề:**

Tin tưởng xác thực phía máy khách hoặc không xác thực các quy tắc kinh doanh trên máy chủ.

```javascript
// INSECURE DESIGN: Trust client-provided price
app.post('/checkout', async (req, res) => {
  const { items, total } = req.body;  // Client sends the total!
  
  await Order.create({
    items,
    total,  // Attacker could send total: 0.01
    userId: req.user.id
  });
});
```

**Thiết kế an toàn:**

```javascript
// SECURE: Calculate total server-side
app.post('/checkout', async (req, res) => {
  const { items } = req.body;
  
  // Fetch current prices from database
  const productIds = items.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  
  // Create price lookup map
  const priceMap = new Map(products.map(p => [p._id.toString(), p.price]));
  
  // Calculate total server-side with validation
  let total = 0;
  for (const item of items) {
    const price = priceMap.get(item.productId);
    if (!price) {
      return res.status(400).json({ error: `Invalid product: ${item.productId}` });
    }
    if (item.quantity < 1 || item.quantity > 100) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }
    total += price * item.quantity;
  }
  
  await Order.create({
    items,
    total,  // Server-calculated, tamper-proof
    userId: req.user.id
  });
});
```

### 4. Chống tự động hóa không đủ

**Vấn đề:**

Không bảo vệ các hoạt động nhạy cảm khỏi sự lạm dụng tự động.

```javascript
// INSECURE DESIGN: No CAPTCHA on registration
app.post('/register', async (req, res) => {
  const user = await User.create(req.body);
  res.json({ success: true });
});
// Bots can create thousands of fake accounts
```

**Thiết kế an toàn:**

```javascript
const axios = require('axios');

async function verifyCaptcha(token) {
  const response = await axios.post(
    'https://www.google.com/recaptcha/api/siteverify',
    null,
    {
      params: {
        secret: process.env.RECAPTCHA_SECRET,
        response: token
      }
    }
  );
  return response.data.success && response.data.score >= 0.5;
}

app.post('/register', async (req, res) => {
  // Verify CAPTCHA first
  const captchaValid = await verifyCaptcha(req.body.captchaToken);
  if (!captchaValid) {
    return res.status(400).json({ error: 'CAPTCHA verification failed' });
  }
  
  const user = await User.create(req.body);
  res.json({ success: true });
});
```

## Nguyên tắc thiết kế an toàn

### 1. Lập mô hình mối đe dọa

Trước khi viết mã, hãy xác định các mối đe dọa tiềm ẩn bằng cách sử dụng các khung như STRIDE:

- **S**poofing - Ai đó có thể mạo danh người dùng không?
- **T**ampering - Dữ liệu có thể được sửa đổi khi đang truyền hoặc ở trạng thái nghỉ không?
- **R**epudiation - Hành động có thể bị từ chối mà không có bằng chứng không?
- Tiết lộ thông tin **I**n - Dữ liệu nhạy cảm có thể bị rò rỉ không?
- **D**enial of Service - Hệ thống có thể bị quá tải không?
- **E**Cấp đặc quyền - Người dùng có thể truy cập trái phép không?

### 2. phòng thủ nhiều lớp

Đừng dựa vào một biện pháp kiểm soát bảo mật duy nhất. Lớp phòng thủ nhiều lớp:

```javascript
// Multiple layers protecting sensitive data
app.get('/api/admin/users', 
  authenticateRequest,     // Layer 1: Must be logged in
  requireRole('admin'),    // Layer 2: Must be admin
  rateLimit({ max: 100 }), // Layer 3: Rate limiting
  validateQuery,           // Layer 4: Input validation
  auditLog,                // Layer 5: Logging for detection
  adminUsersHandler
);
```

### 3. Bảo mật theo mặc định

Cấu hình mặc định phải được bảo mật. Người dùng phải kích hoạt rõ ràng các tính năng rủi ro.

```javascript
// Secure defaults for session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // Default: HTTPS only
    httpOnly: true,      // Default: No JavaScript access
    sameSite: 'strict',  // Default: CSRF protection
    maxAge: 3600000      // Default: 1 hour expiry
  }
};

// Only allow insecure cookies in development
if (process.env.NODE_ENV === 'development') {
  sessionConfig.cookie.secure = false;
}
```

### 4. Thất bại một cách an toàn

Khi xảy ra lỗi, lỗi trong trạng thái an toàn:

```javascript
// INSECURE: Fail open
async function checkPermission(userId, resource) {
  try {
    const hasAccess = await permissionService.check(userId, resource);
    return hasAccess;
  } catch (error) {
    console.error('Permission check failed:', error);
    return true;  // WRONG: Allow access on error
  }
}

// SECURE: Fail closed
async function checkPermission(userId, resource) {
  try {
    const hasAccess = await permissionService.check(userId, resource);
    return hasAccess;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;  // CORRECT: Deny access on error
  }
}
```

## Bài học chính

1. **Thiết kế bảo mật ngay từ đầu** - Việc trang bị thêm bảo mật rất tốn kém và thường không đầy đủ
2. **Thực hiện mô hình hóa mối đe dọa** - Xác định rủi ro trước khi chúng trở thành lỗ hổng
3. **Không bao giờ tin tưởng đầu vào của khách hàng** - Xác thực tất cả phía máy chủ logic nghiệp vụ
4. **Giới hạn tốc độ thực hiện** - Bảo vệ chống lại lực lượng vũ phu và liệt kê
5. **Sử dụng số nhận dạng không thể đoán trước** - UUID và mã thông báo mật mã
6. **Ứng dụng phòng thủ nhiều lớp** - Kiểm soát bảo mật nhiều lớp
7. **Không an toàn** - Từ chối quyền truy cập khi có sự cố
8. **Secure theo mặc định** - Yêu cầu hành động rõ ràng để kích hoạt các tính năng rủi ro

Thiết kế an toàn đòi hỏi phải suy nghĩ như kẻ tấn công trong giai đoạn lập kế hoạch. Nỗ lực đầu tư vào thiết kế an toàn sẽ mang lại lợi ích trong suốt vòng đời của ứng dụng.
