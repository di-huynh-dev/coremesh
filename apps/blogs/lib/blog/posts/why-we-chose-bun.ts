import { BlogPostSource } from "../types";

export const whyWeChoseBunPost: BlogPostSource = {
  slug: "why-we-chose-bun",
  title: "Why We Chose Bun Over npm for This Boilerplate",
  excerpt:
    "Exploring the performance benefits and developer experience improvements that made Bun our package manager of choice.",
  category: "Engineering",
  date: "January 5, 2025",
  readingTime: 5,
  level: "Intermediate",
  tags: ["bun", "performance", "tools"],
  image:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
  author: {
    name: "Yuval Avidani",
  },
  content: `When building a modern web development boilerplate, every decision matters. The choice of package manager might seem small, but it impacts every developer who uses your template. Here's why we chose Bun.

Speed That Actually Matters

Bun installs packages up to 30x faster than npm. This isn't just a benchmark number — it's time saved on every install, every CI run, every new developer onboarding. When you run bun install, you'll notice the difference immediately.

In our testing, a fresh install of this boilerplate's dependencies takes about 2 seconds with Bun, compared to over 30 seconds with npm. That's not a typo.

Native TypeScript Support

Bun runs TypeScript natively without any compilation step. This means faster development server startup, quicker test runs, and a simpler toolchain. No more waiting for tsc or dealing with complex build configurations just to run your code.

Built-in Bundler and Test Runner

Instead of juggling multiple tools, Bun includes a bundler and test runner out of the box. This reduces dependencies, simplifies configuration, and ensures all your tools work together seamlessly.

The Developer Experience

Beyond raw performance, Bun focuses on developer experience. The CLI is intuitive, error messages are helpful, and the documentation is excellent. It feels like a tool built by developers who understand the daily frustrations of JavaScript development.

Making the Switch

If you're coming from npm or yarn, the transition is smooth. Bun is compatible with existing package.json files and node_modules. You can start using it today without changing your project structure.

The future of JavaScript tooling is fast, and Bun is leading the way.`,
  contentHtml: `
<p>When building a modern web development boilerplate, every decision matters. The choice of package manager might seem small, but it impacts every developer who uses your template. Here's why we chose Bun.</p>

<h2>Speed That Actually Matters</h2>

<p>Bun installs packages up to 30x faster than npm. This isn't just a benchmark number — it's time saved on every <code>install</code>, every CI run, every new developer onboarding.</p>

<p>When you run <code>bun install</code>, you'll notice the difference immediately. In our testing, a fresh install of this boilerplate's dependencies takes about <strong>2 seconds</strong> with Bun, compared to over <strong>30 seconds</strong> with npm.</p>

<p>That's not a typo.</p>

<h2>Native TypeScript Support</h2>

<p>Bun runs TypeScript natively without any compilation step. This means faster development server startup, quicker test runs, and a simpler toolchain.</p>

<p>No more waiting for tsc or dealing with complex build configurations just to run your code.</p>

<h2>Built-in Bundler and Test Runner</h2>

<p>Instead of juggling multiple tools, Bun includes a bundler and test runner out of the box. This reduces dependencies, simplifies configuration, and ensures all your tools work together seamlessly.</p>

<blockquote>
  <p>"The best tool is the one that gets out of your way and lets you focus on building."</p>
</blockquote>

<h2>The Developer Experience</h2>

<p>Beyond raw performance, Bun focuses on developer experience. The CLI is intuitive, error messages are helpful, and the documentation is excellent.</p>

<p>It feels like a tool built by developers who understand the daily frustrations of JavaScript development.</p>

<h2>Making the Switch</h2>

<p>If you're coming from npm or yarn, the transition is smooth. Bun is compatible with existing <code>package.json</code> files and <code>node_modules</code>. You can start using it today without changing your project structure.</p>

<p>The future of JavaScript tooling is fast, and Bun is leading the way.</p>
`,
  translations: {
    vi: {
      title: "Vì sao chúng tôi chọn Bun thay vì npm cho boilerplate này",
      excerpt:
        "Khám phá lợi ích về tốc độ và trải nghiệm phát triển khiến Bun trở thành công cụ quản lý gói mà chúng tôi chọn.",
      content: `Khi xây dựng một boilerplate web hiện đại, mọi quyết định đều có ảnh hưởng. Công cụ quản lý gói có vẻ là chi tiết nhỏ, nhưng nó chạm đến trải nghiệm của mọi lập trình viên sử dụng template này. Đây là lý do chúng tôi chọn Bun.

Tốc độ tạo ra khác biệt rõ rệt

Bun có thể cài đặt package nhanh hơn npm nhiều lần. Điều đó không chỉ là con số benchmark, mà là thời gian tiết kiệm ở mỗi lần cài đặt, mỗi pipeline CI và mỗi lần onboarding.

Trong thử nghiệm của chúng tôi, một lần cài đặt mới bộ phụ thuộc của boilerplate chỉ mất khoảng 2 giây với Bun, trong khi npm mất hơn 30 giây.

Hỗ trợ TypeScript nguyên bản

Bun chạy TypeScript trực tiếp mà không cần bước biên dịch riêng. Điều này giúp khởi động dev server nhanh hơn, chạy test nhanh hơn và giảm độ phức tạp của toolchain.

Không còn phải chờ tsc hay cấu hình build phức tạp chỉ để chạy code.

Bundler và test runner tích hợp

Thay vì ghép nhiều công cụ với nhau, Bun mang sẵn bundler và test runner. Điều này giảm phụ thuộc, đơn giản hóa cấu hình và làm cho toàn bộ hệ thống hoạt động gọn gàng hơn.

Trải nghiệm phát triển tốt hơn

Ngoài tốc độ thô, Bun còn chú trọng trải nghiệm lập trình viên. CLI dễ dùng, thông báo lỗi rõ ràng và tài liệu rất dễ theo dõi.

Chuyển đổi cũng khá nhẹ nhàng

Nếu bạn đến từ npm hoặc yarn, việc chuyển sang Bun rất dễ. Bun tương thích với package.json và node_modules hiện có, nên bạn có thể bắt đầu ngay mà không phải đổi cấu trúc dự án.

Tương lai của tooling JavaScript là nhanh hơn, và Bun đang dẫn đầu xu hướng đó.`,
      contentHtml: `
<p>Khi xây dựng một boilerplate web hiện đại, mọi quyết định đều có ảnh hưởng. Công cụ quản lý gói có vẻ là chi tiết nhỏ, nhưng nó chạm đến trải nghiệm của mọi lập trình viên sử dụng template này. Đây là lý do chúng tôi chọn Bun.</p>

<h2>Tốc độ tạo ra khác biệt rõ rệt</h2>

<p>Bun có thể cài đặt package nhanh hơn npm nhiều lần. Điều đó không chỉ là con số benchmark, mà là thời gian tiết kiệm ở mỗi lần cài đặt, mỗi pipeline CI và mỗi lần onboarding.</p>

<p>Trong thử nghiệm của chúng tôi, một lần cài đặt mới bộ phụ thuộc của boilerplate chỉ mất khoảng <strong>2 giây</strong> với Bun, trong khi npm mất hơn <strong>30 giây</strong>.</p>

<h2>Hỗ trợ TypeScript nguyên bản</h2>

<p>Bun chạy TypeScript trực tiếp mà không cần bước biên dịch riêng. Điều này giúp khởi động dev server nhanh hơn, chạy test nhanh hơn và giảm độ phức tạp của toolchain.</p>

<p>Không còn phải chờ tsc hay cấu hình build phức tạp chỉ để chạy code.</p>

<h2>Bundler và test runner tích hợp</h2>

<p>Thay vì ghép nhiều công cụ với nhau, Bun mang sẵn bundler và test runner. Điều này giảm phụ thuộc, đơn giản hóa cấu hình và làm cho toàn bộ hệ thống hoạt động gọn gàng hơn.</p>

<blockquote>
  <p>"Công cụ tốt nhất là công cụ giúp bạn tập trung vào việc xây dựng sản phẩm."</p>
</blockquote>

<h2>Trải nghiệm phát triển tốt hơn</h2>

<p>Ngoài tốc độ thô, Bun còn chú trọng trải nghiệm lập trình viên. CLI dễ dùng, thông báo lỗi rõ ràng và tài liệu rất dễ theo dõi.</p>

<h2>Chuyển đổi cũng khá nhẹ nhàng</h2>

<p>Nếu bạn đến từ npm hoặc yarn, việc chuyển sang Bun rất dễ. Bun tương thích với package.json và node_modules hiện có, nên bạn có thể bắt đầu ngay mà không phải đổi cấu trúc dự án.</p>

<p>Tương lai của tooling JavaScript là nhanh hơn, và Bun đang dẫn đầu xu hướng đó.</p>
`,
    },
  },
};
