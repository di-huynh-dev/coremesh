import type { BlogLocale } from "./types";

// Tool list and FAQs adapted from The DevOps Daily (MIT, see components/tools/LICENSE).
// Titles and taglines are localized; FAQs stay in English like the original pages.

export const TOOL_CATEGORIES = [
  "networking",
  "security",
  "encoding",
  "scheduling",
  "kubernetes",
] as const;
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

export type ToolIcon =
  | "network"
  | "key"
  | "binary"
  | "fingerprint"
  | "clock"
  | "container"
  | "calendar"
  | "hash"
  | "braces";

interface ToolCopy {
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
}

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolEntry {
  slug: string;
  icon: ToolIcon;
  category: ToolCategory;
  keywords: string[];
  copy: Record<BlogLocale, ToolCopy>;
  faqs: ToolFaq[];
}

export const TOOLS: ToolEntry[] = [
  {
    slug: "cidr-calculator",
    icon: "network",
    category: "networking",
    keywords: ["cidr", "subnet", "ip", "vpc", "networking", "calculator"],
    copy: {
      en: {
        title: "CIDR Subnet Calculator",
        shortTitle: "CIDR Calculator",
        tagline:
          "Parse CIDR blocks, compute ranges, split into smaller subnets, and check whether an IP lives inside a network.",
        description:
          "CIDR subnet calculator: network range, subnet mask, broadcast address, usable IPs, subnet splitting and IP membership checks.",
      },
      vi: {
        title: "Tính subnet CIDR",
        shortTitle: "CIDR Calculator",
        tagline:
          "Phân tích dải CIDR, tính dải địa chỉ, chia nhỏ subnet và kiểm tra một IP có nằm trong mạng hay không.",
        description:
          "Công cụ tính subnet CIDR: dải mạng, subnet mask, broadcast, số IP dùng được, chia subnet và kiểm tra IP thuộc mạng.",
      },
    },
    faqs: [
      {
        question: "What does /24 mean in CIDR?",
        answer:
          "A /24 CIDR block has 24 bits of network prefix, leaving 8 bits for hosts. That gives 256 total addresses, of which 254 are usable (the first is the network address, the last is broadcast).",
      },
      {
        question: "How many usable IP addresses does a /16 have?",
        answer:
          "A /16 has 2^16 = 65,536 total addresses. Subtracting the network and broadcast addresses leaves 65,534 usable host addresses. AWS VPCs commonly use /16 as the VPC CIDR.",
      },
      {
        question: "Can I split a CIDR block into smaller subnets?",
        answer:
          "Yes. Use the subnet splitter on this page to divide a parent CIDR into equal-sized children. For example, a /16 can be split into 4 /18 subnets, 16 /20 subnets, and so on.",
      },
      {
        question: "How do I check if an IP is inside a CIDR range?",
        answer:
          "Enter the CIDR block, then paste the IP into the checker. The tool bit-masks the IP with the subnet mask and compares it to the network address to confirm inclusion.",
      },
    ],
  },
  {
    slug: "jwt-decoder",
    icon: "key",
    category: "security",
    keywords: ["jwt", "json web token", "decode", "oauth", "security"],
    copy: {
      en: {
        title: "JWT Decoder",
        shortTitle: "JWT Decoder",
        tagline: "Inspect any JWT in your browser. Nothing is sent to a server.",
        description:
          "JWT decoder that parses the header, payload, and signature in your browser, with human-readable expiry and issued-at.",
      },
      vi: {
        title: "Giải mã JWT",
        shortTitle: "JWT Decoder",
        tagline: "Xem nội dung bất kỳ JWT nào ngay trên trình duyệt. Không gửi gì lên server.",
        description:
          "Giải mã header, payload và signature của JWT trên trình duyệt, hiển thị thời điểm hết hạn và phát hành dễ đọc.",
      },
    },
    faqs: [
      {
        question: "Does this decoder send my JWT to a server?",
        answer:
          "No. Decoding happens entirely in your browser using base64url decoding. Nothing is transmitted.",
      },
      {
        question: "Can a JWT be decoded without the secret?",
        answer:
          "Yes. JWT payloads are base64url-encoded, not encrypted. Anyone with the token can read its header and payload. The signature requires the secret to verify, not to read.",
      },
      {
        question: "What do iat and exp mean?",
        answer:
          "`iat` is the issued-at timestamp (UNIX seconds). `exp` is the expiration timestamp. This decoder shows them in ISO format plus a relative indicator.",
      },
      {
        question: "Why should I never put secrets in a JWT?",
        answer:
          "The payload is not encrypted, just encoded. Anyone who intercepts the token can read every claim. If you need confidentiality, encrypt the payload (JWE) or use opaque tokens.",
      },
    ],
  },
  {
    slug: "base64",
    icon: "binary",
    category: "encoding",
    keywords: ["base64", "encode", "decode", "url encode", "kubernetes secret"],
    copy: {
      en: {
        title: "Base64 and URL Encoder / Decoder",
        shortTitle: "Base64 / URL",
        tagline: "Encode or decode base64 and URL strings in real time.",
        description:
          "Encode or decode base64 and URL-safe strings. Handy for secrets, Kubernetes manifests, and API debugging.",
      },
      vi: {
        title: "Mã hoá / giải mã Base64 và URL",
        shortTitle: "Base64 / URL",
        tagline: "Mã hoá hoặc giải mã chuỗi base64 và URL theo thời gian thực.",
        description:
          "Mã hoá và giải mã chuỗi base64, URL. Tiện cho secret, manifest Kubernetes và debug API.",
      },
    },
    faqs: [
      {
        question: "Is base64 encryption?",
        answer:
          "No. Base64 is an encoding, not a cipher. It is trivially reversible. Never use base64 alone to hide secret data.",
      },
      {
        question: "Why are Kubernetes Secrets base64-encoded?",
        answer:
          "So binary data can round-trip through YAML, which is text. It is not a security feature. Anyone with read access to the Secret can base64-decode the value.",
      },
      {
        question: "What is the difference between base64 and URL encoding?",
        answer:
          "Base64 turns arbitrary bytes into 64 printable characters (A-Z, a-z, 0-9, +, /). URL encoding (percent-encoding) escapes characters that would otherwise have special meaning in a URL.",
      },
    ],
  },
  {
    slug: "uuid-generator",
    icon: "fingerprint",
    category: "security",
    keywords: ["uuid", "guid", "secret", "token", "random", "generator"],
    copy: {
      en: {
        title: "UUID and Secret Generator",
        shortTitle: "UUID / Secret",
        tagline: "Cryptographically secure random identifiers and secrets, generated in your browser.",
        description:
          "Generate UUIDs (v4, v7), random hex tokens, and base64 secrets suitable for Kubernetes secrets or API keys.",
      },
      vi: {
        title: "Tạo UUID và secret",
        shortTitle: "UUID / Secret",
        tagline: "Định danh và secret ngẫu nhiên an toàn về mật mã, tạo ngay trên trình duyệt.",
        description:
          "Tạo UUID (v4, v7), token hex ngẫu nhiên và secret base64 dùng cho Kubernetes secret hoặc API key.",
      },
    },
    faqs: [
      {
        question: "What is the difference between UUID v4 and UUID v7?",
        answer:
          "UUID v4 is fully random. UUID v7 embeds a millisecond timestamp in the first bytes, so IDs sort by creation time. v7 is the better choice for database primary keys because it avoids the B-tree index fragmentation that v4 causes.",
      },
      {
        question: "Are these UUIDs cryptographically secure?",
        answer:
          "Yes. All values are generated with the browser Web Crypto API (crypto.getRandomValues). You should still not use a browser tool to mint secrets that require hardware-backed randomness (HSM).",
      },
      {
        question: "How do I put this into a Kubernetes Secret?",
        answer:
          'Use the "Kube Secret" format. It generates 32 random bytes and base64-encodes them, ready to paste into the data field of a Secret manifest.',
      },
    ],
  },
  {
    slug: "cron-parser",
    icon: "clock",
    category: "scheduling",
    keywords: ["cron", "crontab", "schedule", "kubernetes cronjob"],
    copy: {
      en: {
        title: "Cron Expression Parser",
        shortTitle: "Cron Parser",
        tagline: "Decode cron expressions with the next run times, in your local timezone.",
        description:
          "Cron expression parser that translates schedules into plain English and previews upcoming run times. Validates 5 and 6-field syntax.",
      },
      vi: {
        title: "Đọc biểu thức cron",
        shortTitle: "Cron Parser",
        tagline: "Giải nghĩa biểu thức cron và xem các lần chạy tiếp theo theo múi giờ của bạn.",
        description:
          "Diễn giải lịch cron thành câu dễ hiểu và xem trước các lần chạy sắp tới. Hỗ trợ cú pháp 5 và 6 trường.",
      },
    },
    faqs: [
      {
        question: "What does * * * * * mean?",
        answer:
          'Every minute of every hour of every day. The five fields are minute, hour, day-of-month, month, day-of-week. An asterisk in any field means "any value".',
      },
      {
        question: "How do I run a job every 15 minutes?",
        answer:
          "Use `*/15 * * * *`. The slash introduces a step value; `*/15` means every 15 minutes starting at minute 0.",
      },
      {
        question: "What timezone do the next run times use?",
        answer:
          "Your local timezone, as reported by the browser. If your server runs cron in UTC, remember to adjust before scheduling.",
      },
      {
        question: "Are @daily and 0 0 * * * the same?",
        answer:
          "Yes. `@daily` and `@midnight` are shortcuts for `0 0 * * *`. This parser expands them automatically when computing the next run times.",
      },
    ],
  },
  {
    slug: "k8s-resources",
    icon: "container",
    category: "kubernetes",
    keywords: ["kubernetes", "k8s", "memory", "cpu", "request", "limit", "pod", "sizing"],
    copy: {
      en: {
        title: "Kubernetes Resource Calculator",
        shortTitle: "K8s Resources",
        tagline:
          "Plan Kubernetes requests and limits without guessing. See node-fit, cluster totals, and recommended burst.",
        description:
          "Size CPU and memory requests / limits for a Pod based on workload characteristics, replicas, and headroom.",
      },
      vi: {
        title: "Tính tài nguyên Kubernetes",
        shortTitle: "K8s Resources",
        tagline:
          "Lên kế hoạch requests và limits cho Kubernetes thay vì đoán. Xem độ vừa node, tổng cluster và mức burst khuyến nghị.",
        description:
          "Tính CPU và memory requests / limits cho Pod theo đặc tính workload, số replica và mức dự phòng.",
      },
    },
    faqs: [
      {
        question: "What is the difference between requests and limits?",
        answer:
          "Requests are what Kubernetes guarantees a container. The scheduler uses them to place Pods on nodes. Limits are the hard ceiling; exceeding them for CPU causes throttling, for memory causes an OOMKill.",
      },
      {
        question: "Should I set CPU limits?",
        answer:
          "This is debated. CPU limits cause throttling under load, which can hurt latency even when the node has spare capacity. Many teams set CPU requests but leave limits off.",
      },
      {
        question: "What headroom should I use?",
        answer:
          "A common rule of thumb is 25-50% headroom over measured peak usage. The calculator lets you set a multiplier so you can size from real metrics and add buffer explicitly.",
      },
    ],
  },
  {
    slug: "yaml-json-formatter",
    icon: "braces",
    category: "encoding",
    keywords: ["yaml", "json", "format", "lint", "validator", "converter"],
    copy: {
      en: {
        title: "YAML / JSON Formatter and Linter",
        shortTitle: "YAML / JSON",
        tagline: "Validate, format, and convert YAML and JSON. Browser-only.",
        description:
          "Paste YAML or JSON to validate, pretty-print, and convert between the two. Runs entirely in your browser.",
      },
      vi: {
        title: "Định dạng và kiểm tra YAML / JSON",
        shortTitle: "YAML / JSON",
        tagline: "Kiểm tra, định dạng và chuyển đổi YAML ↔ JSON. Chạy hoàn toàn trên trình duyệt.",
        description:
          "Dán YAML hoặc JSON để kiểm tra, định dạng đẹp và chuyển đổi qua lại. Không gửi dữ liệu đi đâu.",
      },
    },
    faqs: [
      {
        question: "Can I convert JSON to YAML and back?",
        answer:
          "Yes. Pick the target format and the tool will validate the input first, then emit a pretty-printed version in the other format.",
      },
      {
        question: "Does this support YAML anchors or multi-document streams?",
        answer:
          "It supports standard YAML 1.2 features via js-yaml. Multi-document YAML (--- separators) is parsed; only the first document is converted to JSON.",
      },
      {
        question: "Is my data sent anywhere?",
        answer: "No. Parsing and formatting happen entirely in your browser.",
      },
    ],
  },
  {
    slug: "timestamp-converter",
    icon: "calendar",
    category: "scheduling",
    keywords: ["unix timestamp", "epoch", "time converter", "iso 8601", "utc", "date +%s"],
    copy: {
      en: {
        title: "Unix Timestamp Converter",
        shortTitle: "Timestamp",
        tagline: "Epoch to date and back. UTC, local, ISO 8601, and relative time, with a live clock.",
        description:
          "Convert Unix epoch timestamps to and from human-readable dates. Auto-detects seconds vs milliseconds.",
      },
      vi: {
        title: "Chuyển đổi Unix timestamp",
        shortTitle: "Timestamp",
        tagline: "Epoch sang ngày giờ và ngược lại. UTC, giờ địa phương, ISO 8601 và thời gian tương đối.",
        description:
          "Chuyển Unix timestamp sang ngày giờ dễ đọc và ngược lại. Tự nhận biết giây hay mili-giây.",
      },
    },
    faqs: [
      {
        question: "What is a Unix timestamp?",
        answer:
          "The number of seconds since 1970-01-01 00:00:00 UTC (the Unix epoch), ignoring leap seconds. `date +%s` prints the current one.",
      },
      {
        question: "Seconds or milliseconds?",
        answer:
          "Unix tools use seconds (10 digits until the year 2286). JavaScript, Java, and many APIs use milliseconds (13 digits). This tool auto-detects which you pasted by its length.",
      },
      {
        question: "What is the year 2038 problem?",
        answer:
          "A signed 32-bit timestamp overflows on 2038-01-19 03:14:07 UTC. The fix is 64-bit time, which most modern systems already use.",
      },
      {
        question: "Is my input sent to a server?",
        answer: "No. All conversion happens locally in your browser.",
      },
    ],
  },
  {
    slug: "hash-generator",
    icon: "hash",
    category: "security",
    keywords: ["hash", "checksum", "md5", "sha256", "sha1", "sha512", "file integrity"],
    copy: {
      en: {
        title: "Hash and Checksum Generator",
        shortTitle: "Hash / Checksum",
        tagline: "MD5 / SHA hashes of text or a file, plus a checksum verifier. Browser-only.",
        description:
          "Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes of text or a file, and verify a download against an expected checksum.",
      },
      vi: {
        title: "Tạo hash và checksum",
        shortTitle: "Hash / Checksum",
        tagline: "Hash MD5 / SHA cho văn bản hoặc file, kèm kiểm tra checksum. Chạy trên trình duyệt.",
        description:
          "Tạo hash MD5, SHA-1, SHA-256, SHA-384, SHA-512 cho văn bản hoặc file và đối chiếu checksum của bản tải về.",
      },
    },
    faqs: [
      {
        question: "Which hash should I use?",
        answer:
          "Use SHA-256 for integrity and checksums; it is the modern default (`sha256sum`). MD5 and SHA-1 are broken for security but still appear on download pages, so they are here for verification.",
      },
      {
        question: "Can I verify a downloaded file?",
        answer:
          "Yes. Drop the file in, pick the algorithm the project publishes, and paste their expected checksum into the verify box. The file is read locally and never uploaded.",
      },
      {
        question: "Is a hash the same as encryption?",
        answer:
          "No. Hashing is one-way: you cannot recover the input from the hash. Never use a raw hash to store passwords (use bcrypt/argon2 instead).",
      },
      {
        question: "Is my data uploaded anywhere?",
        answer:
          "No. SHA hashing uses the browser Web Crypto API and MD5 runs in JavaScript, both locally. Nothing leaves your machine.",
      },
    ],
  },
];

export function getTool(slug: string) {
  return TOOLS.find((tool) => tool.slug === slug);
}
