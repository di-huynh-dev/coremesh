---
title: "A07: Lỗi nhận dạng và xác thực"
description: Tìm hiểu về các lỗ hổng xác thực, bao gồm mật khẩu yếu, lỗi quản lý phiên và việc nhồi thông tin xác thực. Hiểu cách triển khai xác thực an toàn.
---

Lỗi nhận dạng và xác thực (trước đây là "Xác thực bị hỏng") xảy ra khi các ứng dụng xác nhận không chính xác danh tính của người dùng. Xác thực yếu giống như ổ khóa bị hỏng trên cửa—tất cả các biện pháp bảo mật khác sẽ trở nên vô dụng nếu kẻ tấn công có thể đơn giản giả vờ là người dùng hợp pháp.

## Lỗi xác thực là gì?

Lỗi xác thực xảy ra khi ứng dụng:

- Cho phép các cuộc tấn công tự động như nhồi thông tin xác thực hoặc vũ lực
- Cho phép mật khẩu yếu hoặc mặc định
- Sử dụng quy trình khôi phục thông tin xác thực yếu
- Lưu trữ mật khẩu không chính xác (văn bản thuần túy, hàm băm yếu)
- Thiếu hoặc xác thực đa yếu tố không hiệu quả
- Hiển thị ID phiên trong URL hoặc không xoay chúng
- Không vô hiệu hóa đúng cách các phiên khi đăng xuất

## Các mẫu lỗ hổng phổ biến

### 1. Nhồi thông tin xác thực

**Vấn đề:**

Những kẻ tấn công sử dụng danh sách thông tin đăng nhập bị vi phạm để thử đăng nhập vào các trang web khác, khai thác việc sử dụng lại mật khẩu.

```javascript
// VULNERABLE: No protection against automated attacks
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user.id;
    return res.json({ success: true });
  }
  
  res.status(401).json({ error: 'Invalid credentials' });
});
```

**Triển khai an toàn:**

```javascript
const rateLimit = require('express-rate-limit');

// Rate limit by IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  skipSuccessfulRequests: true,
  standardHeaders: true,
  message: 'Too many login attempts, please try again later'
});

app.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  // Check if account is locked
  if (user?.lockUntil && user.lockUntil > Date.now()) {
    return res.status(423).json({ 
      error: 'Account temporarily locked due to failed attempts' 
    });
  }
  
  if (user && await bcrypt.compare(password, user.password)) {
    // Reset failed attempts
    await User.updateOne({ _id: user._id }, {
      $set: { failedAttempts: 0, lockUntil: null }
    });
    
    // Regenerate session to prevent fixation
    req.session.regenerate((err) => {
      req.session.userId = user.id;
      res.json({ success: true });
    });
    return;
  }
  
  // Track failed attempts per account
  if (user) {
    const attempts = (user.failedAttempts || 0) + 1;
    const update = { failedAttempts: attempts };
    
    if (attempts >= 5) {
      update.lockUntil = Date.now() + 30 * 60 * 1000; // 30 min
    }
    
    await User.updateOne({ _id: user._id }, { $set: update });
  }
  
  // Use consistent response time to prevent user enumeration
  await new Promise(resolve => setTimeout(resolve, 100));
  res.status(401).json({ error: 'Invalid credentials' });
});
```

### 2. Chính sách mật khẩu yếu

**Vấn đề:**

Việc cho phép mật khẩu yếu khiến tài khoản dễ bị xâm phạm.

```javascript
// VULNERABLE: No password requirements
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  // ... password could be "123456"
});
```

**Triển khai an toàn:**

```javascript
const zxcvbn = require('zxcvbn');  // Password strength library

function validatePassword(password, email) {
  const errors = [];
  
  // Length check
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  
  // Check against common passwords using zxcvbn
  const result = zxcvbn(password, [email]);
  if (result.score < 3) {
    errors.push('Password is too weak: ' + result.feedback.warning);
  }
  
  // Check against breached passwords (have-i-been-pwned API)
  // Implementation shown below
  
  return errors;
}

// Check if password appears in known breaches
async function isPasswordBreached(password) {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha1')
    .update(password)
    .digest('hex')
    .toUpperCase();
  
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  
  const response = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`
  );
  const data = await response.text();
  
  return data.includes(suffix);
}

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  const errors = validatePassword(password, email);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  if (await isPasswordBreached(password)) {
    return res.status(400).json({
      error: 'This password has appeared in data breaches. Choose another.'
    });
  }
  
  const hash = await bcrypt.hash(password, 12);
  // ...
});
```

### 3. Quản lý phiên không an toàn

**Vấn đề:**

Quản lý phiên kém có thể cho phép chiếm quyền điều khiển hoặc cố định phiên.

```javascript
// VULNERABLE: Session ID in URL
app.get('/dashboard', (req, res) => {
  res.redirect(`/dashboard?sessionId=${req.session.id}`);
});

// VULNERABLE: Session not regenerated on login
app.post('/login', (req, res) => {
  req.session.userId = user.id;  // Same session ID as before login!
});

// VULNERABLE: Session not invalidated on logout
app.post('/logout', (req, res) => {
  req.session.userId = null;  // Session still exists!
});
```

**Triển khai an toàn:**

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',  // Don't use default name
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600000  // 1 hour
  }
}));

// Regenerate session on login
app.post('/login', async (req, res) => {
  // ... validate credentials ...
  
  // Regenerate session to prevent fixation
  const oldSession = req.session;
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Login failed' });
    
    req.session.userId = user.id;
    req.session.createdAt = Date.now();
    res.json({ success: true });
  });
});

// Properly destroy session on logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    
    res.clearCookie('sessionId');
    res.json({ success: true });
  });
});
```

### 4. Thiếu xác thực đa yếu tố

**Triển khai:**

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Setup TOTP for user
app.post('/mfa/setup', requireAuth, async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `MyApp (${req.user.email})`,
    length: 32
  });
  
  // Store secret temporarily until verified
  await User.updateOne(
    { _id: req.user.id },
    { $set: { mfaPending: secret.base32 } }
  );
  
  // Generate QR code for authenticator app
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  res.json({ 
    qrCode,
    manualCode: secret.base32  // For manual entry
  });
});

// Verify and enable MFA
app.post('/mfa/verify', requireAuth, async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id);
  
  const verified = speakeasy.totp.verify({
    secret: user.mfaPending,
    encoding: 'base32',
    token,
    window: 1  // Allow 30 second clock drift
  });
  
  if (!verified) {
    return res.status(400).json({ error: 'Invalid code' });
  }
  
  // Enable MFA
  await User.updateOne(
    { _id: user._id },
    {
      $set: { mfaSecret: user.mfaPending, mfaEnabled: true },
      $unset: { mfaPending: 1 }
    }
  );
  
  res.json({ success: true });
});

// Login with MFA
app.post('/login', async (req, res) => {
  const { email, password, mfaToken } = req.body;
  const user = await User.findOne({ email });
  
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (user.mfaEnabled) {
    if (!mfaToken) {
      return res.json({ requiresMfa: true });
    }
    
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: mfaToken,
      window: 1
    });
    
    if (!verified) {
      return res.status(401).json({ error: 'Invalid MFA code' });
    }
  }
  
  req.session.regenerate((err) => {
    req.session.userId = user.id;
    res.json({ success: true });
  });
});
```

## Bài học chính

1. **Giới hạn tốc độ triển khai** trên các điểm cuối xác thực
2. **Khóa tài khoản** sau nhiều lần thử thất bại
3. **Yêu cầu mật khẩu mạnh** và kiểm tra cơ sở dữ liệu vi phạm
4. **Tạo lại phiên** khi đăng nhập để ngăn chặn sự cố định
5. **DHủy phiên** hoàn toàn khi đăng xuất
6. **Sử dụng cài đặt cookie an toàn** (httpOnly, safe, SameSite)
7. **Triển khai MFA** đặc biệt dành cho các tài khoản nhạy cảm
8. **Atránh liệt kê người dùng** thông qua các phản hồi và thời gian nhất quán

Xác thực thường là tuyến phòng thủ đầu tiên. Để làm đúng đòi hỏi phải chú ý đến từng chi tiết và hiểu biết về các kiểu tấn công phổ biến.
