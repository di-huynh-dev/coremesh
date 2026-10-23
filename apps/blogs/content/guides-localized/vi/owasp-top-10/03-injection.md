---
title: "A03: Tấn công chèn mã (Injection)"
description: Tìm hiểu về các lỗ hổng tiêm bao gồm SQL injection, chèn NoSQL và chèn lệnh. Hiểu cách kẻ tấn công khai thác những lỗ hổng này và cách ngăn chặn chúng.
---

Tấn công tiêm nhiễm xảy ra khi dữ liệu không đáng tin cậy được gửi đến trình thông dịch như một phần của lệnh hoặc truy vấn. Đây là lỗ hổng số 1 trong Top 10 của OWASP trong nhiều năm và vẫn ở vị trí thứ 3 vào năm 2021 do các lỗ hổng chèn tiếp tục được phát hiện và khai thác.

Vấn đề cơ bản rất đơn giản: ứng dụng không phân biệt giữa mã và dữ liệu. Khi đầu vào của người dùng trở thành một phần của lệnh, kẻ tấn công có thể đưa ra các hướng dẫn của riêng chúng.

## Thuốc tiêm là gì?

Việc tiêm nhiễm xảy ra khi kẻ tấn công có thể chèn hoặc "đưa" nội dung độc hại vào một truy vấn hoặc lệnh được thực thi bởi trình thông dịch. Các loại tiêm phổ biến bao gồm:

- **SQL Tiêm** - Thao tác truy vấn cơ sở dữ liệu
- **NoSQL Tiêm** - Tấn công cơ sở dữ liệu tài liệu như MongoDB
- **Command Tiêm** - Thực thi các lệnh hệ thống
- **LDAP Tiêm** - Thao tác truy vấn dịch vụ thư mục
- **XPath Tiêm** - Tấn công truy vấn tài liệu XML
- **Template Tiêm** - Khai thác các công cụ tạo mẫu phía máy chủ

## SQL injection: Cuộc tấn công cổ điển

SQL injection là cuộc tấn công tiêm chích phổ biến nhất và vẫn được biết đến nhiều nhất.

### Nó hoạt động như thế nào

Hãy xem xét một hình thức đăng nhập đơn giản để kiểm tra thông tin đăng nhập:

```javascript
// VULNERABLE: String concatenation creates SQL injection risk
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // User input directly concatenated into SQL query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  const result = await db.query(query);
  if (result.rows.length > 0) {
    res.json({ success: true, user: result.rows[0] });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

Một nỗ lực đăng nhập bình thường sẽ tạo ra:

```sql
SELECT * FROM users WHERE username = 'alice' AND password = 'secret123'
```

Nhưng kẻ tấn công nhập `' OR '1'='1' --` làm tên người dùng sẽ tạo ra:

```sql
SELECT * FROM users WHERE username = '' OR '1'='1' --' AND password = 'anything'
```

`--` nhận xét phần còn lại của truy vấn và `'1'='1'` luôn đúng, vì vậy điều này trả về TẤT CẢ người dùng. Kẻ tấn công bỏ qua xác thực hoàn toàn.

### Khai thác nguy hiểm hơn

SQL injection không chỉ có chức năng bỏ qua xác thực. Những kẻ tấn công có thể:

**ETrích xuất toàn bộ cơ sở dữ liệu:**

```sql
-- Using UNION to retrieve data from other tables
' UNION SELECT username, password, email FROM users --
```

**Sửa đổi dữ liệu:**

```sql
-- Inject an UPDATE statement
'; UPDATE users SET role = 'admin' WHERE username = 'attacker'; --
```

**DXóa dữ liệu:**

```sql
-- The infamous DROP TABLE
'; DROP TABLE users; --
```

### Phòng ngừa: Truy vấn được tham số hóa

Giải pháp là sử dụng các truy vấn được tham số hóa (còn gọi là câu lệnh đã chuẩn bị sẵn). Chúng tách biệt cấu trúc SQL khỏi dữ liệu:

```javascript
// SECURE: Parameterized query
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // $1 and $2 are placeholders - the database treats them as DATA, not SQL
  const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
  const values = [username, password];
  
  const result = await db.query(query, values);
  if (result.rows.length > 0) {
    res.json({ success: true, user: result.rows[0] });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

Bây giờ, ngay cả khi kẻ tấn công nhập `' OR '1'='1' --` làm tên người dùng, nó vẫn được coi là giá trị chuỗi ký tự:

```sql
SELECT * FROM users WHERE username = ''' OR ''1''=''1'' --' AND password = 'anything'
```

Các ký tự đặc biệt được thoát và truy vấn tìm kiếm người dùng có tên người dùng chính xác (vô nghĩa) đó.

### Sử dụng ORM

ORM (Trình ánh xạ quan hệ đối tượng) thường sử dụng các truy vấn được tham số hóa theo mặc định:

```javascript
// Using Sequelize ORM - parameterized by default
const user = await User.findOne({
  where: {
    username: req.body.username,
    password: req.body.password
  }
});

// Using Prisma ORM
const user = await prisma.user.findFirst({
  where: {
    username: req.body.username,
    password: req.body.password
  }
});
```

Tuy nhiên, hãy chú ý đến các phương thức truy vấn thô có thể đưa nội dung vào lại:

```javascript
// VULNERABLE: Raw query in Sequelize
const users = await sequelize.query(
  `SELECT * FROM users WHERE name = '${req.body.name}'`
);

// SECURE: Raw query with replacements
const users = await sequelize.query(
  'SELECT * FROM users WHERE name = :name',
  {
    replacements: { name: req.body.name },
    type: QueryTypes.SELECT
  }
);
```

## Tiêm NoSQL

Cơ sở dữ liệu NoSQL như MongoDB không tránh khỏi các cuộc tấn công tiêm nhiễm, mặc dù trông chúng có vẻ khác nhau.

### Nó hoạt động như thế nào

Các truy vấn MongoDB sử dụng các đối tượng JavaScript và kẻ tấn công có thể chèn các toán tử:

```javascript
// VULNERABLE: Direct use of request body in query
app.post('/login', async (req, res) => {
  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password
  });
  // ...
});
```

Điều này có vẻ an toàn, nhưng nếu kẻ tấn công gửi:

```json
{
  "username": "admin",
  "password": { "$gt": "" }
}
```

Truy vấn trở thành:

```javascript
User.findOne({ username: "admin", password: { $gt: "" } })
```

Toán tử `$gt: ""` khớp với bất kỳ mật khẩu nào không trống, bỏ qua xác thực!

### Phòng ngừa

**Kiểm tra và xác thực loại:**

```javascript
// SECURE: Validate input types
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Ensure both are strings
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  const user = await User.findOne({ username, password });
  // ...
});
```

**Sử dụng thư viện xác thực:**

```javascript
const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).max(100).required()
});

app.post('/login', async (req, res) => {
  // Validation rejects non-string values and malicious operators
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const { username, password } = value;
  const user = await User.findOne({ username, password });
  // ...
});
```

**Mongoose có vệ sinh:**

```javascript
const mongoSanitize = require('express-mongo-sanitize');

// Middleware removes $ and . from request data
app.use(mongoSanitize());

// Now { "password": { "$gt": "" } } becomes { "password": { "gt": "" } }
// The injection fails
```

## Lệnh tiêm

Việc chèn lệnh xảy ra khi một ứng dụng chuyển đầu vào của người dùng tới hệ thống shell.

### Nó hoạt động như thế nào

```javascript
// VULNERABLE: User input in shell command
const { exec } = require('child_process');

app.get('/ping', (req, res) => {
  const host = req.query.host;
  
  // Dangerous: user controls part of the command
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    res.send(`<pre>${stdout}</pre>`);
  });
});
```

Một yêu cầu bình thường như `/ping?host=google.com` chạy:

```bash
ping -c 4 google.com
```

Nhưng kẻ tấn công có thể xâu chuỗi các lệnh bằng cách sử dụng `;`, `&&`, `||` hoặc backticks:

```
/ping?host=google.com; cat /etc/passwd
```

Điều này chạy:

```bash
ping -c 4 google.com; cat /etc/passwd
```

Kẻ tấn công hiện có thể nhìn thấy nội dung của `/etc/passwd`. Họ có thể chạy bất kỳ lệnh nào mà ứng dụng có quyền thực thi.

### Phòng ngừa

**Tùy chọn 1: Tránh hoàn toàn các lệnh shell**

```javascript
// SECURE: Use execFile with arguments array
const { execFile } = require('child_process');

app.get('/ping', (req, res) => {
  const host = req.query.host;
  
  // Validate the host first
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).send('Invalid hostname');
  }
  
  // execFile doesn't spawn a shell, arguments are passed directly
  execFile('ping', ['-c', '4', host], (error, stdout, stderr) => {
    res.send(`<pre>${stdout}</pre>`);
  });
});
```

`execFile` chạy lệnh trực tiếp mà không có shell, vì vậy các siêu ký tự shell như `;` không có ý nghĩa đặc biệt.

**Tùy chọn 2: Sử dụng các thư viện được xây dựng có mục đích**

```javascript
// Instead of shelling out to ping, use a library
const ping = require('ping');

app.get('/ping', async (req, res) => {
  const host = req.query.host;
  
  // Validate hostname format
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).send('Invalid hostname');
  }
  
  const result = await ping.promise.probe(host);
  res.json(result);
});
```

**Tùy chọn 3: Xác thực danh sách cho phép nghiêm ngặt**

```javascript
// Only allow specific, pre-approved values
const ALLOWED_HOSTS = ['google.com', 'cloudflare.com', '8.8.8.8'];

app.get('/ping', (req, res) => {
  const host = req.query.host;
  
  if (!ALLOWED_HOSTS.includes(host)) {
    return res.status(400).send('Host not allowed');
  }
  
  // Now safe because host is from a known-good list
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    res.send(`<pre>${stdout}</pre>`);
  });
});
```

## Tiêm mẫu

Việc chèn mẫu phía máy chủ (SSTI) xảy ra khi đầu vào của người dùng được nhúng vào các mẫu và được thực thi.

### Nó hoạt động như thế nào

```javascript
// VULNERABLE: User input in template string
const ejs = require('ejs');

app.get('/greet', (req, res) => {
  const name = req.query.name;
  
  // User input becomes part of the template
  const template = `<h1>Hello, ${name}!</h1>`;
  const html = ejs.render(template);
  res.send(html);
});
```

Kẻ tấn công có thể tiêm cú pháp mẫu để thực thi mã:

```
/greet?name=<%= process.env.SECRET_KEY %>
```

### Phòng ngừa

```javascript
// SECURE: Pass user input as data, not part of template
const ejs = require('ejs');

app.get('/greet', (req, res) => {
  const name = req.query.name;
  
  // Template is static, user input is passed as data
  const template = '<h1>Hello, <%= name %>!</h1>';
  const html = ejs.render(template, { name: name });
  res.send(html);
});
```

## Chiến lược phòng ngừa toàn diện

### 1. Lớp xác thực đầu vào

Tạo một phần mềm trung gian xác thực để vệ sinh tất cả đầu vào:

```javascript
const Joi = require('joi');

// Define schemas for each endpoint
const schemas = {
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).max(100).required()
  }),
  
  search: Joi.object({
    query: Joi.string().max(200).required(),
    page: Joi.number().integer().min(1).default(1)
  })
};

// Validation middleware factory
function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    
    // Replace body with validated/sanitized values
    req.body = value;
    next();
  };
}

// Usage
app.post('/login', validate('login'), loginHandler);
app.get('/search', validate('search'), searchHandler);
```

### 2. Tiêu đề bảo mật và chính sách bảo mật nội dung

```javascript
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],  // No inline scripts
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  }
}));
```

### 3. Kiểm thử bảo mật trong CI/CD

Bao gồm thử nghiệm tiêm trong pipeline của bạn bằng cách sử dụng các công cụ SAST như Semgrep với bộ quy tắc Top 10 của OWASP. Bạn cũng có thể chạy thử nghiệm SQL injection tự động trên môi trường staging bằng các công cụ như sqlmap.

## Bài học chính

1. **Không bao giờ ghép nối đầu vào** của người dùng vào các truy vấn hoặc lệnh
2. **Sử dụng các truy vấn được tham số hóa** cho tất cả các hoạt động cơ sở dữ liệu
3. **Xác thực và vệ sinh** tất cả đầu vào trước khi sử dụng
4. **Sử dụng danh sách cho phép** khi có thể thay vì danh sách chặn
5. **Avoid shell command** - sử dụng thư viện hoặc execFile với mảng đối số
6. **Chuyển dữ liệu người dùng vào mẫu**, không nhúng dữ liệu đó vào chuỗi mẫu
7. **Kiểm tra lỗ hổng chèn** trong CI/CD pipeline của bạn
8. **Áp dụng phòng thủ theo chiều sâu** - nhiều lớp bảo vệ

Các cuộc tấn công tiêm nhiễm về mặt khái niệm đơn giản nhưng có thể gây ra hậu quả thảm khốc. Tin vui là chúng cũng có thể ngăn chặn dễ dàng bằng các biện pháp mã hóa an toàn nhất quán.
