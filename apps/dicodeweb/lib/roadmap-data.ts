export type RoadmapNode = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  topics: number;
  side: 'left' | 'right';
};

export const roadmapNodes: RoadmapNode[] = [
  {
    id: 1,
    title: 'The Big Picture',
    description: 'Hiểu React là gì, tại sao nó quan trọng và tư duy component-based hoạt động như thế nào.',
    tags: ['React Model', 'Why React', 'Component Tree'],
    topics: 4,
    side: 'left',
  },
  {
    id: 2,
    title: 'Describing UI',
    description: 'Làm chủ JSX, props, conditional rendering và cách mô tả giao diện bằng component.',
    tags: ['JSX', 'Props', 'Conditional Rendering'],
    topics: 6,
    side: 'right',
  },
  {
    id: 3,
    title: 'Bringing React to Life',
    description: 'Thêm tính tương tác với state, event handlers và hiểu vòng đời re-render của React.',
    tags: ['useState', 'Events', 'Re-render'],
    topics: 6,
    side: 'left',
  },
  {
    id: 4,
    title: 'Escaping React',
    description: 'Làm việc với side effects, refs và các trường hợp cần "thoát" khỏi mô hình React thuần túy.',
    tags: ['useEffect', 'useRef', 'Side Effects'],
    topics: 5,
    side: 'right',
  },
  {
    id: 5,
    title: 'Optimizing React',
    description: 'Tối ưu hiệu năng với memoization, lazy loading và tránh re-render không cần thiết.',
    tags: ['useMemo', 'useCallback', 'React.memo'],
    topics: 5,
    side: 'left',
  },
  {
    id: 6,
    title: 'Custom Hooks',
    description: 'Tách logic tái sử dụng thành custom hooks — cách viết React chuyên nghiệp và sạch.',
    tags: ['Custom Hooks', 'Composition', 'Reusability'],
    topics: 4,
    side: 'right',
  },
  {
    id: 7,
    title: 'Rebuilding useHooks',
    description: 'Xây dựng lại 50 custom hooks thực tế từ thư viện useHooks để củng cố toàn diện.',
    tags: ['useHooks', 'Practice', 'Real-world'],
    topics: 10,
    side: 'left',
  },
  {
    id: 8,
    title: 'Concurrent Rendering',
    description: 'Khám phá các tính năng React v19: Transitions, Suspense, useTransition và concurrent mode.',
    tags: ['Transitions', 'Suspense', 'React v19'],
    topics: 5,
    side: 'right',
  },
  {
    id: 9,
    title: 'React on the Server',
    description: 'Server Components, Server Actions và cách React hoạt động trên server với Next.js.',
    tags: ['Server Components', 'Actions', 'Next.js'],
    topics: 5,
    side: 'left',
  },
  {
    id: 10,
    title: 'React Interview Questions',
    description: 'Luyện tập 50+ câu hỏi phỏng vấn kinh điển và 90+ challenges để sẵn sàng chinh phục.',
    tags: ['Interview Prep', 'Challenges', 'Quiz'],
    topics: 8,
    side: 'right',
  },
];

export const phases = [
  { label: 'Cơ bản', range: '1–3', completed: false },
  { label: 'Nền tảng', range: '4–6', completed: false },
  { label: 'Nâng cao', range: '7–9', completed: false },
  { label: 'Tổng cộng', range: '10', completed: false },
];

export const learningPaths = [
  {
    icon: '⚡',
    title: '1 tuần tăng tốc',
    desc: 'Dành cho người cơ bản, tập trung vào cốt lõi React.',
    items: ['6–8h học mỗi ngày', 'Hoàn thành 6 chặng đầu', 'Làm câu hỏi & bài test mỗi chặng'],
    tag: 'Phù hợp: Đã biết JS cơ bản',
    color: '#8BD63F',
  },
  {
    icon: '🛡️',
    title: '1 tháng vững vàng',
    desc: 'Học chắc nền tảng, thực hành đều đặn và kiểm tra toàn diện.',
    items: ['2–3h học mỗi ngày', 'Hoàn thành bộ 12 chặng', 'Làm đủ bài test tổng hợp'],
    tag: 'Phù hợp: Muốn nắm vững React',
    color: '#22C7E8',
  },
  {
    icon: '🚀',
    title: '3 tháng toàn diện',
    desc: 'Học sâu, luyện câu hỏi phỏng vấn và sẵn sàng đi làm Frontend.',
    items: ['1–2h học mỗi ngày', 'Ôn tập qua bài test phỏng vấn', 'Chinh phục toàn bộ câu hỏi'],
    tag: 'Phù hợp: Muốn đi phỏng vấn',
    color: '#FF9533',
  },
];
