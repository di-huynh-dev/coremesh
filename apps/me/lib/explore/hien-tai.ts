import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Hiện tại" — một ngày làm việc ở Estuary Solutions (10.2023 - nay).
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật; các
 * nhân vật chỉ là vai trò chung (PM, đồng đội, tester, designer, backend),
 * không phải người thật cụ thể. Số liệu lấy từ phần kinh nghiệm làm việc.
 *
 * The chapter diorama sits at the origin: a room with its left wall at
 * x -5.15, back wall at z -3.45 (desk at -0.5,-1.5, server box at -3.8,0.7,
 * bench at 3.75,1) and the walking lane along z 2.15. A building core fills
 * the space behind it; the office wraps around on both sides.
 */
export const HIEN_TAI_LAYOUT = {
  /** Lift / service core behind the diorama's back wall. */
  core: { minX: -5.6, maxX: 5.6, minZ: -9.2, maxZ: -3.6 },
  /** Glass meeting room (left, back) with a wide cut-away opening. */
  meeting: {
    minX: -17,
    maxX: -7.6,
    minZ: -9.2,
    maxZ: -2.6,
    doorMinX: -15.0,
    doorMaxX: -8.8,
  },
  tv: [-12.0, -9.0] as Vec2,
  meetingTable: [-11.4, -5.2] as Vec2,
  tester: [-15.0, -7.4] as Vec2,
  /** Open-plan bench desk (right, back) and its seats. */
  benchDesk: { x: 11.6, z: -7.4, width: 7.2 },
  seats: [9.0, 11.6, 14.2],
  mySeat: [9.0, -7.4] as Vec2,
  teammate: [14.2, -6.45] as Vec2,
  /** Stand-up board in front of the desks. */
  standupBoard: [11.6, -3.5] as Vec2,
  pm: [13.7, -2.7] as Vec2,
  /** Reception + CRM screen (front, centre). */
  reception: [2.8, 6.4] as Vec2,
  crmScreen: [-2.6, 5.2] as Vec2,
  /** "Global" corner (left, front): world wall + globe. */
  worldWall: [-12.4, 4.0] as Vec2,
  globe: [-12.4, 5.6] as Vec2,
  /** Lounge (right, front): chat demo screen. */
  chatScreen: [8.6, 4.4] as Vec2,
  designer: [12.0, 5.2] as Vec2,
  /** Rooftop terrace (right, front edge). */
  terrace: { minX: 13.2, maxX: 17.0, minZ: 3.6, maxZ: 9.4 },
  coffeeBar: [15.9, 4.3] as Vec2,
  backend: [15.7, 7.9] as Vec2,
};
const L = HIEN_TAI_LAYOUT;

export const hienTaiMap: ExploreMapData = {
  id: "hien-tai",
  chapterId: "hien-tai",
  title: "Hiện tại",
  subtitle: "Một ngày ở Estuary Solutions",
  spawn: [-0.4, 8.0],
  bounds: { min: [-16.7, -8.8], max: [16.6, 9.0] },

  npcs: [
    {
      id: "pm",
      name: "Chị PM",
      at: L.pm,
      facing: -0.8,
      look: {
        shirt: "#2f8f83",
        pants: "#22303a",
        hair: "bun",
        hairColor: "#1d1a18",
        glasses: true,
      },
    },
    {
      id: "dong-doi",
      name: "Đồng đội",
      at: L.teammate,
      facing: Math.PI,
      pose: "sit",
      look: {
        shirt: "#d9d4c4",
        pants: "#2b2f36",
        hair: "short",
        hairColor: "#1d1a18",
      },
    },
    {
      id: "tester",
      name: "Anh tester",
      at: L.tester,
      facing: 0.8,
      look: {
        shirt: "#7a5b8e",
        pants: "#2b2b2f",
        hair: "crop",
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
        shirt: "#e46f4f",
        pants: "#2f3440",
        hair: "pigtails",
        hairColor: "#3a2a22",
      },
    },
    {
      id: "backend",
      name: "Anh backend",
      at: L.backend,
      facing: -1.4,
      look: {
        shirt: "#1f3b4d",
        pants: "#3a3a3a",
        hair: "short",
        hairColor: "#1d1a18",
        longShirt: true,
      },
    },
  ],

  quests: [
    { id: "standup", label: "Daily standup cùng team" },
    { id: "vite", label: "Chuyển build từ Webpack sang Vite" },
    { id: "review-pr", label: "Review PR cho đồng đội" },
    { id: "pagespeed", label: "Đưa PageSpeed từ 30+ lên 98+" },
    { id: "chat", label: "Làm chat real-time với WebSockets" },
    { id: "i18n", label: "Đa ngôn ngữ cho Engage X" },
  ],

  interactions: [
    {
      id: "standup",
      label: "Vào standup",
      npc: "pm",
      at: [L.standupBoard[0] + 0.8, L.standupBoard[1] + 1.6],
      radius: 1.8,
      quest: "standup",
      effect: "standup",
      lines: [
        {
          who: "Chị PM",
          text: "Standup nhanh nha cả team: hôm qua làm gì, hôm nay làm gì, có gì vướng không.",
        },
        {
          who: "Dĩ",
          text: "Hôm qua em làm tiếp module chat. Hôm nay em review PR cho bạn rồi đo lại PageSpeed trang chủ.",
        },
        {
          who: "Chị PM",
          text: "Ok. Vướng gì thì nhắn liền nha, đừng ôm một mình.",
        },
        { who: "", text: "Việc hôm nay của Dĩ được dán lên bảng standup." },
      ],
    },
    {
      id: "vite",
      label: "Chuyển sang Vite",
      at: [L.mySeat[0], L.mySeat[1] + 2.25],
      focus: L.mySeat,
      radius: 1.8,
      quest: "vite",
      effect: "vite",
      reward: "Khởi động nhanh hơn khoảng 70%",
      lines: [
        {
          who: "",
          text: "Mỗi lần khởi động dự án là ngồi chờ Webpack. Sửa một dòng cũng phải đợi hot reload.",
        },
        {
          who: "Dĩ",
          text: "Thử chuyển sang Vite xem sao: cấu hình lại alias, plugin, biến môi trường…",
        },
        {
          who: "",
          text: "Dev server bật lên gần như tức thì. Thời gian khởi động và hot reload giảm khoảng 70%.",
        },
        { who: "Dĩ", text: "Cả team đỡ phải chờ mỗi ngày. Đáng công lắm!" },
      ],
    },
    {
      id: "review-pr",
      label: "Review PR",
      npc: "dong-doi",
      at: [L.teammate[0], L.teammate[1] + 1.3],
      radius: 1.8,
      quest: "review-pr",
      effect: "merged",
      reward: "Review xong một PR",
      lines: [
        {
          who: "Đồng đội",
          text: "Dĩ ơi, review giúp mình PR này với. Mình tách component sang package dùng chung trong monorepo.",
        },
        {
          who: "Dĩ",
          text: "Hướng tách vậy ổn đó. Chỗ này đặt tên rõ hơn chút, thêm type cho props nữa là đẹp.",
        },
        { who: "Đồng đội", text: "Ok, mình sửa liền. Cảm ơn nha, review kỹ ghê!" },
        { who: "", text: "PR được approve và merge gọn gàng." },
      ],
    },
    {
      id: "pagespeed",
      label: "Đo lại PageSpeed",
      npc: "tester",
      at: [L.tester[0] + 1.4, L.tester[1] + 0.2],
      radius: 1.8,
      quest: "pagespeed",
      effect: "pagespeed",
      lines: [
        {
          who: "Anh tester",
          text: "Hồi trước trang chủ chạy PageSpeed chỉ hơn 30 điểm, LCP chậm quá trời.",
        },
        {
          who: "Dĩ",
          text: "Em chuyển sang render lai SSR với ISR, tối ưu LCP, FCP và chống xê dịch layout cho CLS.",
        },
        { who: "Anh tester", text: "Đo lại nè… 98 điểm! Xanh hết luôn." },
        {
          who: "",
          text: "Vòng điểm trên màn hình chuyển sang màu xanh: từ 30+ lên 98+.",
        },
      ],
    },
    {
      id: "chat",
      label: "Thử chat real-time",
      npc: "designer",
      at: [L.designer[0] - 1.1, L.designer[1] + 0.8],
      radius: 1.9,
      quest: "chat",
      effect: "chat",
      lines: [
        {
          who: "Bạn designer",
          text: "Màn hình chat thiết kế xong rồi nè. Tin nhắn phải hiện ngay, không cần tải lại trang.",
        },
        {
          who: "Dĩ",
          text: "Mình nối WebSocket: có tin nhắn hay thông báo mới là đẩy thẳng xuống giao diện liền.",
        },
        {
          who: "Bạn designer",
          text: "Gửi thử nè… bên kia hiện liền luôn. Mượt ghê!",
        },
        {
          who: "",
          text: "Bong bóng tin nhắn và thông báo bật lên theo thời gian thực.",
        },
      ],
    },
    {
      id: "i18n",
      label: "Xem quả địa cầu",
      at: [L.globe[0] + 2.5, L.globe[1] + 0.9],
      focus: L.globe,
      radius: 1.9,
      quest: "i18n",
      effect: "i18n",
      reward: "Engage X sẵn sàng cho hơn 10 quốc gia",
      lines: [
        {
          who: "",
          text: "Engage X chuẩn bị mở rộng ra Đông Nam Á, châu Á - Thái Bình Dương, Bắc Mỹ và Mỹ Latinh.",
        },
        {
          who: "Dĩ",
          text: "Tách chữ ra file ngôn ngữ, định dạng ngày giờ theo từng vùng, giao diện phải chịu được chữ dài ngắn khác nhau.",
        },
        {
          who: "",
          text: "Quả địa cầu sáng lên từng vùng. Engage X sẵn sàng cho hơn 10 quốc gia.",
        },
      ],
    },
    {
      id: "talk-backend",
      label: "Ra sân thượng",
      npc: "backend",
      at: [L.backend[0] - 1.35, L.backend[1] - 0.3],
      radius: 1.8,
      lines: [
        {
          who: "Anh backend",
          text: "Bên anh mở sẵn endpoint đăng nhập rồi. OAuth Google với Microsoft ráp tới đâu rồi em?",
        },
        {
          who: "Dĩ",
          text: "Luồng Google chạy rồi anh, chiều nay em làm nốt Microsoft.",
        },
        {
          who: "",
          text: "Gió trên sân thượng mát rượi. Phía xa, thành phố đang dần lên đèn.",
        },
      ],
    },
  ],

  obstacles: [],

  intro: [
    {
      who: "",
      text: "Từ tháng 10 năm 2023, Dĩ làm việc ở Estuary Solutions, phát triển nền tảng CRM cho hơn 30.000 người dùng mỗi tháng.",
    },
    {
      who: "",
      text: "Một ngày làm việc bắt đầu. Đi một vòng văn phòng, gặp team và làm vài việc quen thuộc nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Build nhanh hơn, trang nhanh hơn, tin nhắn đến ngay và sản phẩm nói được nhiều ngôn ngữ.",
    },
    {
      who: "",
      text: "Từ một ngôi làng ở Cát Nhơn, những dòng code của Dĩ giờ đến với người dùng ở hơn 11 quốc gia.",
    },
  ],

  sky: {
    top: "#dfe7e6",
    bottom: "#f1f4f2",
    fog: "#e6ecea",
    sun: "#fff4e0",
    sunIntensity: 2.7,
    ambient: 1.05,
  },
};
