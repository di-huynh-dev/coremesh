---
title: 'React Design Patterns'
description: 'Lộ trình 15 pattern giúp component React vẫn dễ đọc khi codebase lớn dần, viết lại bằng TypeScript và cập nhật theo React 19.'
category:
  name: 'Frontend'
  slug: 'frontend'
publishedAt: '2026-10-30'
updatedAt: '2026-10-30'
tags:
  - React
  - Design Patterns
  - TypeScript
  - React 19
  - Frontend Architecture
adaptedFrom:
  name: '15 Days of React Design Patterns của tapaScript'
  url: 'https://github.com/tapascript/15-days-of-react-design-patterns'
  license: 'Apache-2.0'
  licenseUrl: 'https://github.com/tapascript/15-days-of-react-design-patterns/blob/main/LICENSE'
---

Code React hiếm khi hỏng vì một quyết định tệ. Nó hỏng từ từ: component nhận thêm một prop, thêm một `useEffect`, thêm một cờ boolean, cho đến lúc không ai muốn đụng vào nữa. Design pattern là tên gọi cho những cách refactor chặn được quá trình đó. Biết chúng, bạn sẽ nhận ra vấn đề sớm hơn và trao đổi cách sửa với team chỉ bằng một từ.

Guide này là ghi chép của mình khi học series [15 Days of React Design Patterns](https://github.com/tapascript/15-days-of-react-design-patterns) của Tapas Adhikary (tapaScript), được viết lại thành một khoá học dạng chữ. Mình viết lại từng chương theo cách hiểu của mình, chuyển code sang TypeScript, và bổ sung những gì đã thay đổi với React 19 và React Compiler, vì có vài pattern giờ không còn là lựa chọn mặc định nữa, và hiểu vì sao cũng quan trọng không kém.

## Guide này dành cho ai

Bạn đã làm tính năng bằng React và hook, giờ muốn đi từ "chạy được" sang "dễ sửa". Bạn nên quen với props, state, `useEffect` và TypeScript cơ bản. Không cần framework cụ thể nào, ví dụ chạy như nhau trên Vite hay Next.js.

## Mỗi chương được viết thế nào

Chương nào cũng theo cùng một khung, để bạn đọc lướt hay đọc kỹ đều được:

1. Một đoạn code có "mùi" thật, và vì sao nó gây khó chịu.
2. Áp dụng pattern vào chính đoạn code đó, từng bước một.
3. Một ví dụ thứ hai, khác hẳn ví dụ đầu.
4. Pattern này đứng ở đâu khi đã có React 19.
5. Khi nào nên dùng, khi nào không, và những lỗi hay gặp.
6. Bài tập, cùng video và source code gốc.

Đọc chương, xem video nếu bạn thích học kiểu đó, rồi làm ít nhất một bài tập trước khi sang chương sau. Bài tập mới là chỗ giúp pattern ngấm vào tay.

## Lộ trình học

Các chương đi theo thứ tự của series gốc. Nếu muốn có kế hoạch theo tuần, mình sẽ chia như sau, khoảng 4 đến 6 tiếng mỗi tuần:

### Tuần 1: ghép component

- [Vì sao React cần design pattern](react-design-patterns/01-why-design-patterns)
- [Container và Presenter](react-design-patterns/02-container-presenter)
- [Controlled và Uncontrolled component](react-design-patterns/03-controlled-uncontrolled)
- [Compound Components](react-design-patterns/04-compound-components)

### Tuần 2: chia sẻ logic

- [Render Props](react-design-patterns/05-render-props)
- [Higher-Order Components](react-design-patterns/06-higher-order-components)
- [Custom Hooks](react-design-patterns/07-custom-hooks)
- [Provider](react-design-patterns/08-provider-pattern)

### Tuần 3: state và trải nghiệm người dùng

- [Optimistic UI](react-design-patterns/09-optimistic-ui)
- [State Reducer](react-design-patterns/10-state-reducer)
- [Pub-Sub và Observer](react-design-patterns/11-pub-sub-observer)
- [Các pattern về hiệu năng](react-design-patterns/12-performance-patterns)

### Tuần 4: API linh hoạt và khả năng chịu lỗi

- [Slot](react-design-patterns/13-slot-pattern)
- [Strategy](react-design-patterns/14-strategy-pattern)
- [Facade](react-design-patterns/15-facade-pattern)
- [Error Boundary](react-design-patterns/16-error-boundary)

## Một lời nhắc

Pattern là công cụ, không phải mục tiêu. Điều tốt nhất bạn nhận được từ guide này không phải là dùng đủ mười lăm pattern, mà là nhìn vào một component, gọi đúng tên vấn đề của nó, và chọn thay đổi nhỏ nhất để sửa. Đôi khi thay đổi đó là một pattern. Nhiều khi chỉ là tách một hàm ra.

## Ghi nguồn

Cấu trúc, chủ đề và nhiều ví dụ code trong guide đến từ series mã nguồn mở của tapaScript, giấy phép Apache-2.0. Mỗi chương đều có link tới video và thư mục source tương ứng. Nếu series giúp ích cho bạn, hãy tặng [repository](https://github.com/tapascript/15-days-of-react-design-patterns) một sao và đăng ký [kênh YouTube tapaScript](https://youtube.com/tapasadhikary).
