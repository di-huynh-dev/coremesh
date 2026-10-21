import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Bắt đầu nghề" — văn phòng AMIT Group, chặng Intern & Fresher Frontend
 * (03.2022 - 09.2023).
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật; các
 * nhân vật chỉ là vai trò chung (mentor, PM, designer, tester), không phải
 * người thật cụ thể.
 *
 * The chapter diorama sits at the origin: a room with its left wall at
 * x -5.15, back wall at z -3.45 (desk at -1.3,-1.6, kanban at 3.3,-1.1,
 * round table at -3.6,3.5) and the walking lane along z 2.15. A building
 * core fills the space behind it; the office wraps around on both sides.
 */
export const AMIT_LAYOUT = {
  /** Lift / service core behind the diorama's back wall. */
  core: { minX: -5.6, maxX: 5.6, minZ: -9.2, maxZ: -3.6 },
  /** Glass meeting room (left, back). Wide cut-away opening in the front. */
  meeting: {
    minX: -17,
    maxX: -7.6,
    minZ: -9.2,
    maxZ: -2.6,
    doorMinX: -15.0,
    doorMaxX: -8.8,
  },
  kanban: [-13.6, -9.0] as Vec2,
  retroBoard: [-9.9, -9.0] as Vec2,
  meetingTable: [-12.0, -5.2] as Vec2,
  tester: [-15.3, -7.5] as Vec2,
  pm: [-8.3, -7.6] as Vec2,
  /** Open-plan desks (right, back): [x, z] desk centres. */
  desks: [
    [9.0, -7.2],
    [13.4, -7.2],
    [9.0, -3.6],
    [13.4, -3.6],
  ] as Vec2[],
  myDesk: [9.0, -3.6] as Vec2,
  mentorDesk: [13.4, -3.6] as Vec2,
  mentor: [13.4, -2.65] as Vec2,
  /** Reception (front, centre). */
  reception: [2.6, 6.3] as Vec2,
  hr: [2.6, 5.45] as Vec2,
  /** Design corner (right, front). */
  designScreen: [8.6, 4.4] as Vec2,
  designer: [12.0, 5.2] as Vec2,
  sofa: [8.6, 8.3] as Vec2,
  /** Pantry (left, front): counter along the left wall. */
  counter: { x: -16.65, minZ: 4.4, maxZ: 8.2 },
  coffee: [-16.6, 5.4] as Vec2,
  pantryTables: [
    [-12.4, 7.0],
    [-9.2, 5.6],
  ] as Vec2[],
  /** Balcony (right, front edge of the floor). */
  balcony: { minX: 13.2, maxX: 17.0, minZ: 3.6, maxZ: 9.4 },
  view: [17.6, 6.8] as Vec2,
};
const L = AMIT_LAYOUT;

export const amitMap: ExploreMapData = {
  id: "amit",
  chapterId: "amit",
  title: "Bắt đầu nghề",
  subtitle: "Những ngày đầu ở AMIT Group",
  spawn: [-1.8, 8.0],
  bounds: { min: [-16.7, -8.8], max: [16.6, 9.0] },

  npcs: [
    {
      id: "hr",
      name: "Chị HR",
      at: L.hr,
      look: {
        shirt: "#c9725a",
        pants: "#2f3440",
        hair: "bun",
        hairColor: "#2a1f1a",
      },
    },
    {
      id: "mentor",
      name: "Anh mentor",
      at: L.mentor,
      facing: Math.PI,
      pose: "sit",
      look: {
        shirt: "#3f6f8a",
        pants: "#2b2b2f",
        hair: "short",
        hairColor: "#1d1a18",
        glasses: true,
      },
    },
    {
      id: "designer",
      name: "Bạn designer",
      at: L.designer,
      facing: -0.9,
      look: {
        shirt: "#e0a33a",
        pants: "#38404a",
        hair: "crop",
        hairColor: "#3a2a22",
      },
    },
    {
      id: "tester",
      name: "Anh tester",
      at: L.tester,
      facing: 0.9,
      look: {
        shirt: "#6b8a4e",
        pants: "#2b2b2f",
        hair: "short",
        hairColor: "#1d1a18",
      },
    },
    {
      id: "pm",
      name: "Chị PM",
      at: L.pm,
      facing: -0.9,
      look: {
        shirt: "#8e5a8a",
        pants: "#2a2a2e",
        hair: "bun",
        hairColor: "#1d1a18",
        glasses: true,
      },
    },
  ],

  quests: [
    { id: "ngay-dau", label: "Nhận laptop và thẻ nhân viên" },
    { id: "figma", label: "Dựng component từ bản Figma" },
    { id: "code-review", label: "Code review đầu tiên với anh mentor" },
    { id: "sua-bug", label: "Sửa bug từ vòng QA" },
    { id: "retro", label: "Dán sticky note trong buổi retro" },
  ],

  interactions: [
    {
      id: "talk-hr",
      label: "Nhận đồ ngày đầu",
      npc: "hr",
      at: [L.reception[0], L.reception[1] + 1.05],
      radius: 1.9,
      quest: "ngay-dau",
      effect: "badge",
      reward: "Nhận thẻ nhân viên AMIT Group",
      lines: [
        {
          who: "Chị HR",
          text: "Chào em, Dĩ phải không? Chào mừng em đến với AMIT Group!",
        },
        {
          who: "Chị HR",
          text: "Laptop với thẻ nhân viên của em đây. Bàn của em ở dãy bên phải, ngay cạnh anh mentor.",
        },
        {
          who: "Dĩ",
          text: "Dạ em cảm ơn chị. Ngày đầu đi làm thật sự, em vừa mừng vừa run.",
        },
        { who: "", text: "Chiếc laptop mới đã nằm sẵn trên bàn làm việc của Dĩ." },
      ],
    },
    {
      id: "talk-designer",
      label: "Xem bản Figma",
      npc: "designer",
      at: [L.designer[0] - 1.1, L.designer[1] + 0.8],
      radius: 1.9,
      quest: "figma",
      effect: "ui",
      lines: [
        {
          who: "Bạn designer",
          text: "Bản Figma trang này chốt rồi nè: màu, khoảng cách, trạng thái hover đủ hết.",
        },
        {
          who: "Dĩ",
          text: "Mình tách ra thành component dùng lại được nha: Button, Input, Card. Trang khác cũng xài chung.",
        },
        {
          who: "Bạn designer",
          text: "Vậy là đúng chuẩn chung của team luôn. Đưa lên màn hình lớn coi thử đi!",
        },
        {
          who: "",
          text: "Giao diện dựng từ bản thiết kế hiện lên màn hình lớn, khớp từng chút một.",
        },
      ],
    },
    {
      id: "talk-mentor",
      label: "Nhờ anh mentor review",
      npc: "mentor",
      at: [L.mentor[0], L.mentor[1] + 1.3],
      radius: 1.8,
      quest: "code-review",
      effect: "review",
      reward: "Pull request đầu tiên được approve",
      lines: [
        {
          who: "Anh mentor",
          text: "Anh xem pull request của em rồi. Phần state dùng Zustand vậy là gọn.",
        },
        {
          who: "Anh mentor",
          text: "Còn dữ liệu từ API thì để TanStack Query lo cache với refetch, em khỏi tự viết lại.",
        },
        {
          who: "Dĩ",
          text: "Dạ em sửa liền. Lần sau em tự soát kỹ trước khi gửi review.",
        },
        {
          who: "Anh mentor",
          text: "Tốt. Code review là để cả team học cùng nhau, đừng ngại hỏi nghe em.",
        },
      ],
    },
    {
      id: "talk-tester",
      label: "Nhận bug từ QA",
      npc: "tester",
      at: [L.tester[0] + 1.35, L.tester[1] + 0.2],
      radius: 1.8,
      quest: "sua-bug",
      effect: "bug-done",
      lines: [
        {
          who: "Anh tester",
          text: "Dĩ ơi, vòng QA này anh bắt được một bug: form báo lỗi chưa đúng khi bỏ trống một ô.",
        },
        {
          who: "Dĩ",
          text: "Để em tái hiện lại… đúng rồi anh. Em sửa phần kiểm tra dữ liệu, anh test lại giúp em nha.",
        },
        { who: "Anh tester", text: "Chạy lại rồi, pass! Kéo thẻ qua cột Done đi em." },
        { who: "", text: "Thẻ bug trên bảng kanban được chuyển sang cột Done." },
      ],
    },
    {
      id: "retro",
      label: "Tham gia retro",
      npc: "pm",
      at: [L.retroBoard[0], L.retroBoard[1] + 1.7],
      radius: 1.8,
      quest: "retro",
      effect: "retro",
      lines: [
        {
          who: "Chị PM",
          text: "Cuối sprint rồi, mình retro nha. Mỗi người viết sticky note: điều gì làm tốt, điều gì cần cải thiện.",
        },
        {
          who: "Dĩ",
          text: "Em viết: học được nhiều qua code review. Cần cải thiện: ước lượng task cho sát hơn.",
        },
        {
          who: "Chị PM",
          text: "Hay đó. Sprint sau cả team thử chia task nhỏ hơn nghe.",
        },
        { who: "", text: "Bảng retro kín dần những mảnh giấy nhiều màu." },
      ],
    },
    {
      id: "coffee",
      label: "Pha cà phê",
      at: [L.coffee[0] + 1.45, L.coffee[1]],
      focus: L.coffee,
      radius: 1.8,
      lines: [
        {
          who: "",
          text: "Góc pantry thơm mùi cà phê. Ai đi ngang cũng ghé rót một ly rồi hỏi han đôi câu.",
        },
        { who: "Dĩ", text: "Một ly cà phê sữa đá, rồi quay lại làm tiếp thôi." },
      ],
    },
    {
      id: "balcony",
      label: "Ra ban công",
      at: [15.3, 7.0],
      focus: L.view,
      radius: 1.8,
      lines: [
        {
          who: "",
          text: "Từ ban công nhìn ra, thành phố chiều nay nắng nhẹ, xe cộ nhỏ xíu dưới đường.",
        },
        {
          who: "Dĩ",
          text: "Vừa học trên trường, vừa đi làm ở đây. Mệt mà vui, vì ngày nào cũng học thêm được một chút.",
        },
      ],
    },
  ],

  obstacles: [],

  intro: [
    {
      who: "",
      text: "Tháng 3 năm 2022. Dĩ đến AMIT Group với vai trò Intern Frontend, trong khi vẫn còn là sinh viên.",
    },
    {
      who: "",
      text: "Đi một vòng văn phòng, gặp mọi người và làm quen với công việc thật nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Từ bản Figma đến component, từ code review đến những vòng QA và buổi retro: kiến thức dần thành kinh nghiệm.",
    },
    {
      who: "",
      text: "Từ Intern lên Fresher, AMIT là nơi Dĩ học cách làm việc cùng một đội ngũ.",
    },
  ],

  sky: {
    top: "#e7e8de",
    bottom: "#f6f3ea",
    fog: "#eeebe0",
    sun: "#fff0d6",
    sunIntensity: 2.7,
    ambient: 1.1,
  },
};
