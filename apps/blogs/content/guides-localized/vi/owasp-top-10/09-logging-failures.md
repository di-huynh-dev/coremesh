---
title: "A09: Lỗi giám sát và ghi nhật ký bảo mật"
description: Tìm hiểu về tầm quan trọng của việc ghi nhật ký và giám sát bảo mật, các lỗi thường gặp khiến các cuộc tấn công không bị phát hiện và cách triển khai khả năng quan sát bảo mật hiệu quả.
---

Lỗi giám sát và ghi nhật ký bảo mật xảy ra khi không thể phát hiện, báo cáo hoặc cảnh báo các vi phạm do không thể ghi nhật ký, phát hiện, giám sát hoặc phản hồi không đầy đủ. Nếu không ghi nhật ký thích hợp, kẻ tấn công có thể tồn tại trong hệ thống của bạn mà không bị phát hiện trong nhiều tháng.

## Tại sao việc ghi nhật ký lại quan trọng

Các nghiên cứu cho thấy thời gian trung bình để phát hiện vi phạm là hơn 200 ngày. Trong thời gian này, kẻ tấn công có thể:

- Lọc dữ liệu nhạy cảm
- Thiết lập quyền truy cập liên tục
- Di chuyển ngang qua mạng của bạn
- Che dấu vết của họ

Việc ghi nhật ký và giám sát thích hợp có thể giảm thời gian phát hiện từ vài tháng xuống còn vài phút.

## Lỗi ghi nhật ký phổ biến

### 1. Ghi nhật ký không đầy đủ

**Vấn đề:**

Không ghi nhật ký các sự kiện liên quan đến bảo mật.

```javascript
// VULNERABLE: No logging of authentication events
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user.id;
    return res.json({ success: true });
  }
  
  res.status(401).json({ error: 'Invalid credentials' });
  // Failed login attempt not logged!
});
```

**Triển khai an toàn:**

```javascript
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'auth-service' },
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console()
  ]
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const clientIP = req.ip;
  const userAgent = req.get('User-Agent');
  
  const user = await User.findOne({ email });
  
  if (user && await bcrypt.compare(password, user.password)) {
    securityLogger.info('Successful login', {
      event: 'LOGIN_SUCCESS',
      userId: user.id,
      email: email,
      ip: clientIP,
      userAgent: userAgent
    });
    
    req.session.userId = user.id;
    return res.json({ success: true });
  }
  
  securityLogger.warn('Failed login attempt', {
    event: 'LOGIN_FAILURE',
    email: email,
    ip: clientIP,
    userAgent: userAgent,
    reason: user ? 'invalid_password' : 'user_not_found'
  });
  
  res.status(401).json({ error: 'Invalid credentials' });
});
```

### 2. Dữ liệu nhạy cảm trong nhật ký

**Vấn đề:**

Ghi nhật ký thông tin nhạy cảm có thể bị lộ.

```javascript
// VULNERABLE: Logging sensitive data
logger.info('User registered', {
  email: user.email,
  password: user.password,  // NEVER log passwords!
  creditCard: user.creditCard  // NEVER log payment info!
});

// VULNERABLE: Logging full request bodies
app.use((req, res, next) => {
  logger.info('Request', { body: req.body });  // Could contain passwords!
  next();
});
```

**Triển khai an toàn:**

```javascript
// Sensitive fields to redact
const SENSITIVE_FIELDS = [
  'password', 'token', 'secret', 'creditCard', 
  'ssn', 'apiKey', 'authorization'
];

function redactSensitive(obj, depth = 0) {
  if (depth > 10 || !obj || typeof obj !== 'object') return obj;
  
  const redacted = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitive(value, depth + 1);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

// Request logging middleware with redaction
app.use((req, res, next) => {
  logger.info('Request', {
    method: req.method,
    path: req.path,
    query: redactSensitive(req.query),
    body: redactSensitive(req.body),
    ip: req.ip
  });
  next();
});
```

### 3. Không có cảnh báo về hoạt động đáng ngờ

**Vấn đề:**

Nhật ký tồn tại nhưng không ai theo dõi chúng.

```javascript
// Logs are written but never reviewed
securityLogger.warn('5 failed login attempts from same IP');
// ... nobody sees this until months later during incident investigation
```

**Triển khai an toàn:**

```javascript
// Alert on suspicious patterns
const alertThresholds = {
  failedLogins: { count: 5, windowMinutes: 15 },
  suspiciousIPs: { count: 10, windowMinutes: 60 }
};

async function checkAndAlert(event, metadata) {
  const redis = require('redis');
  const client = redis.createClient();
  
  if (event === 'LOGIN_FAILURE') {
    const key = `failed_logins:${metadata.ip}`;
    const count = await client.incr(key);
    await client.expire(key, 15 * 60);  // 15 minute window
    
    if (count >= alertThresholds.failedLogins.count) {
      await sendAlert({
        severity: 'high',
        title: 'Multiple failed login attempts',
        message: `${count} failed attempts from ${metadata.ip}`,
        metadata
      });
    }
  }
}

async function sendAlert(alert) {
  // Send to Slack
  await fetch(process.env.SLACK_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `[${alert.severity.toUpperCase()}] ${alert.title}\n${alert.message}`
    })
  });
  
  // Also send to PagerDuty for critical alerts
  if (alert.severity === 'critical') {
    await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routing_key: process.env.PAGERDUTY_KEY,
        event_action: 'trigger',
        payload: {
          summary: alert.title,
          severity: alert.severity,
          source: 'security-service'
        }
      })
    });
  }
}
```

## Những gì cần đăng nhập

### Sự kiện bảo mật cần luôn đăng nhập

```javascript
const SECURITY_EVENTS = {
  // Authentication
  LOGIN_SUCCESS: 'info',
  LOGIN_FAILURE: 'warn',
  LOGOUT: 'info',
  PASSWORD_CHANGE: 'info',
  PASSWORD_RESET_REQUEST: 'info',
  MFA_ENABLED: 'info',
  MFA_DISABLED: 'warn',
  
  // Authorization
  ACCESS_DENIED: 'warn',
  PRIVILEGE_ESCALATION_ATTEMPT: 'error',
  
  // Data Access
  SENSITIVE_DATA_ACCESS: 'info',
  BULK_DATA_EXPORT: 'warn',
  
  // System
  ADMIN_ACTION: 'info',
  CONFIG_CHANGE: 'warn',
  API_KEY_CREATED: 'info',
  API_KEY_REVOKED: 'info'
};

function logSecurityEvent(event, metadata) {
  const level = SECURITY_EVENTS[event] || 'info';
  
  securityLogger[level](`Security Event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...metadata
  });
  
  // Check if this event should trigger an alert
  checkAndAlert(event, metadata);
}
```

### Thực tiễn tốt nhất về định dạng nhật ký

```javascript
// Structured logging for easy querying
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "warn",
  "event": "LOGIN_FAILURE",
  "service": "auth-service",
  "traceId": "abc123",
  "context": {
    "userId": null,
    "email": "attacker@example.com",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "geoLocation": "Unknown",
    "reason": "invalid_password"
  }
}
```

## Ghi nhật ký tập trung

Gửi nhật ký đến hệ thống tập trung để phân tích:

```javascript
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const esTransport = new ElasticsearchTransport({
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL,
    auth: {
      username: process.env.ES_USER,
      password: process.env.ES_PASSWORD
    }
  },
  indexPrefix: 'security-logs'
});

const logger = winston.createLogger({
  transports: [
    esTransport,
    new winston.transports.Console()
  ]
});
```

## Bài học chính

1. **Ghi lại các sự kiện liên quan đến bảo mật** - xác thực, ủy quyền, truy cập dữ liệu
2. **Không bao giờ ghi lại dữ liệu nhạy cảm** - mật khẩu, mã thông báo, PII
3. **Sử dụng ghi nhật ký có cấu trúc** - định dạng JSON để phân tích cú pháp dễ dàng
4. **Tập trung nhật ký** - tổng hợp từ tất cả các dịch vụ
5. **Thiết lập cảnh báo** - không chỉ thu thập nhật ký, hãy theo dõi chúng
6. **Bao gồm bối cảnh** - IP, tác nhân người dùng, ID theo dõi để tương quan
7. **Bảo vệ nhật ký của bạn** - nhật ký cũng là mục tiêu
8. **Kiểm tra khả năng giám sát của bạn** - xác minh cảnh báo hoạt động trước khi bạn cần chúng

Ghi nhật ký và giám sát hiệu quả là tuyến phòng thủ cuối cùng của bạn. Khi việc ngăn chặn không thành công, việc phát hiện sẽ cho bạn cơ hội ứng phó trước khi thiệt hại leo thang.
