import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Tiểu học" — buổi sáng đầu tuần ở Tiểu học số 1 Cát Nhơn.
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 *
 * The chapter diorama sits at the origin (school building at -0.5,-2.1; flag
 * at -2.6,0.55; notebook desk at -2.85,3.5; walking lane z 2.15). The school
 * yard, classroom, drum, flag ceremony and gate surround it.
 */
export const TIEU_HOC_LAYOUT = {
  gateZ: 8.2,
  mom: [-4.4, 9.6] as Vec2,
  momBike: [-6.3, 9.7] as Vec2,
  stall: [6.4, 10.0] as Vec2,
  vendor: [8.4, 10.05] as Vec2,
  classroom: { minX: -15.6, maxX: -8.6, backZ: -8.6, frontZ: -3.0 },
  teacher: [-12.1, -7.5] as Vec2,
  teacherDesk: [-14.1, -7.3] as Vec2,
  myDesk: [-10.0, -5.4] as Vec2,
  desks: [
    [-14.2, -5.4],
    [-10.0, -5.4],
    [-14.2, -4.1],
    [-10.0, -4.1],
  ] as Vec2[],
  drum: [-6.6, -6.9] as Vec2,
  guard: [-5.0, -7.0] as Vec2,
  flagPole: [11.6, -7.2] as Vec2,
  flagTeacher: [9.5, -6.6] as Vec2,
  lineup: [
    [11.2, -4.8],
    [12.4, -4.8],
    [13.6, -4.8],
    [11.2, -3.6],
    [12.4, -3.6],
    [13.6, -3.6],
  ] as Vec2[],
  friend: [-11.0, 5.0] as Vec2,
  oAnQuan: [-12.2, 7.0] as Vec2,
  jumpRope: [7.4, 5.4] as Vec2,
  shelf: [13.4, 1.0] as Vec2,
  readingBench: [11.5, 1.2] as Vec2,
  notebookDesk: [-2.85, 3.5] as Vec2,
};
const L = TIEU_HOC_LAYOUT;

export const tieuHocMap: ExploreMapData = {
  id: "tieu-hoc",
  chapterId: "tieu-hoc",
  title: "Tiểu học",
  subtitle: "Sáng thứ Hai ở Tiểu học số 1 Cát Nhơn",
  spawn: [1.0, 9.5],
  bounds: { min: [-17, -9.1], max: [17, 10.6] },

  npcs: [
    {
      id: "me",
      name: "Mẹ",
      at: L.mom,
      facing: 1.3,
      look: {
        shirt: "#b85c4a",
        pants: "#2a2a2e",
        hair: "bun",
        hat: "non-la",
        longShirt: true,
      },
    },
    {
      id: "co-chu-nhiem",
      name: "Cô chủ nhiệm",
      at: L.teacher,
      look: {
        shirt: "#f3ead6",
        pants: "#f3ead6",
        hair: "bun",
        hairColor: "#1d1a18",
        longShirt: true,
      },
    },
    {
      id: "bac-bao-ve",
      name: "Bác bảo vệ",
      at: L.guard,
      facing: -1.0,
      look: {
        shirt: "#4d6a52",
        pants: "#2b2b2b",
        hair: "crop",
        hairColor: "#7d7a74",
        height: 0.96,
      },
    },
    {
      id: "co-tong-phu-trach",
      name: "Cô Tổng phụ trách",
      at: L.flagTeacher,
      facing: 0.6,
      look: {
        shirt: "#f4f1ea",
        pants: "#2c3550",
        hair: "short",
        hairColor: "#1d1a18",
      },
    },
    {
      id: "ban-cung-ban",
      name: "Bạn cùng bàn",
      at: L.friend,
      facing: 0.9,
      look: {
        shirt: "#f4f1ea",
        pants: "#2c3550",
        hair: "pigtails",
        hairColor: "#1d1a18",
        height: 0.68,
      },
    },
    {
      id: "co-ban-qua",
      name: "Cô bán quà vặt",
      at: L.vendor,
      facing: -0.5,
      look: {
        shirt: "#7b5b8c",
        pants: "#2a2a2e",
        hair: "bun",
        hat: "non-la",
      },
    },
  ],

  quests: [
    { id: "den-truong", label: "Chào mẹ trước cổng trường" },
    { id: "chao-co", label: "Dự lễ chào cờ đầu tuần" },
    { id: "tap-viet", label: "Học viết những con chữ đầu tiên" },
    { id: "danh-trong", label: "Phụ bác bảo vệ đánh trống ra chơi" },
    { id: "da-cau", label: "Đá cầu với bạn cùng bàn" },
    { id: "doc-truyen", label: "Tự đánh vần cuốn truyện đầu tiên" },
  ],

  interactions: [
    {
      id: "talk-me",
      label: "Chào mẹ",
      npc: "me",
      at: [L.mom[0] + 1.2, L.mom[1] - 0.2],
      radius: 1.8,
      quest: "den-truong",
      reward: "Mẹ thắt lại khăn quàng đỏ cho Dĩ",
      lines: [
        {
          who: "Mẹ",
          text: "Lại đây mẹ thắt lại cái khăn quàng nè. Đi học phải gọn gàng nghe con.",
        },
        { who: "Dĩ", text: "Dạ. Trưa mẹ có đón con không mẹ?" },
        {
          who: "Mẹ",
          text: "Có chớ. Vô lớp nhớ nghe lời cô, chơi với bạn cho vui. Mẹ đứng đây coi con vô nè.",
        },
      ],
    },
    {
      id: "talk-tong-phu-trach",
      label: "Dự lễ chào cờ",
      npc: "co-tong-phu-trach",
      at: [L.flagTeacher[0] + 0.3, L.flagTeacher[1] + 1.3],
      radius: 1.9,
      quest: "chao-co",
      effect: "chao-co",
      lines: [
        {
          who: "Cô Tổng phụ trách",
          text: "Các em xếp hàng ngay ngắn nào. Sắp chào cờ rồi, khăn quàng thắt cho đàng hoàng nghe.",
        },
        { who: "Dĩ", text: "Dạ, em đứng ở hàng lớp Một ạ." },
        {
          who: "",
          text: "Cả sân trường im lặng. Lá cờ đỏ sao vàng được kéo lên chậm rãi, bay phấp phới trong nắng sớm.",
        },
      ],
    },
    {
      id: "talk-chu-nhiem",
      label: "Vào lớp học viết",
      npc: "co-chu-nhiem",
      at: [L.teacher[0], L.teacher[1] + 1.3],
      radius: 1.9,
      quest: "tap-viet",
      effect: "tap-viet",
      reward: "Trang vở đầu tiên được cô khen",
      lines: [
        {
          who: "Cô chủ nhiệm",
          text: "Hôm nay mình tập viết chữ a. Các em cầm bút như cô chỉ, ngồi thẳng lưng nè.",
        },
        { who: "Dĩ", text: "Cô ơi, nét cong này em viết hoài mà nó cứ méo…" },
        {
          who: "Cô chủ nhiệm",
          text: "Không sao. Viết chậm thôi, từng nét một. Coi nè, chữ của em tròn hơn hồi nãy rồi đó.",
        },
        {
          who: "",
          text: "Trên bảng đen hiện lên những con chữ đầu tiên. Dĩ nắn nót chép từng chữ vào vở.",
        },
      ],
    },
    {
      id: "talk-bao-ve",
      label: "Đánh trống ra chơi",
      npc: "bac-bao-ve",
      at: [L.guard[0] - 0.2, L.guard[1] + 1.4],
      radius: 1.9,
      quest: "danh-trong",
      effect: "trong",
      lines: [
        {
          who: "Bác bảo vệ",
          text: "Tới giờ ra chơi rồi đó. Con muốn thử đánh trống không? Ba tiếng thôi nghe.",
        },
        { who: "Dĩ", text: "Dạ muốn! Tùng… tùng… tùng!" },
        {
          who: "",
          text: "Tiếng trống vang khắp sân. Cửa lớp mở ra, tụi nhỏ ùa ra sân như bầy chim sẻ.",
        },
      ],
    },
    {
      id: "talk-ban",
      label: "Đá cầu",
      npc: "ban-cung-ban",
      at: [L.friend[0] + 1.1, L.friend[1] + 0.6],
      radius: 1.9,
      quest: "da-cau",
      effect: "da-cau",
      lines: [
        {
          who: "Bạn cùng bàn",
          text: "Dĩ ơi, ra đá cầu không? Ai để rớt trước thì thua nghe!",
        },
        { who: "Dĩ", text: "Chơi luôn! Chuyền qua đây nè." },
        {
          who: "",
          text: "Quả cầu lông gà nhiều màu bay qua bay lại. Hai đứa cười khúc khích tới khi trống vào lớp.",
        },
      ],
    },
    {
      id: "shelf",
      label: "Mở tủ sách",
      at: [L.shelf[0], L.shelf[1] + 1.4],
      focus: L.shelf,
      radius: 1.9,
      quest: "doc-truyen",
      effect: "truyen",
      lines: [
        {
          who: "",
          text: "Tủ sách nhỏ dưới gốc cây có mấy cuốn truyện cổ tích bìa đã sờn.",
        },
        {
          who: "Dĩ",
          text: "(đánh vần) Ngày… xửa… ngày… xưa… Ơ, mình đọc được rồi nè!",
        },
        {
          who: "",
          text: "Lần đầu tiên Dĩ tự đọc hết một trang truyện mà không cần ai đọc giùm.",
        },
      ],
    },
    {
      id: "notebook",
      label: "Xem trang vở",
      at: [L.notebookDesk[0], 2.25],
      focus: L.notebookDesk,
      radius: 1.8,
      lines: [
        {
          who: "",
          text: "Trang vở ô li với những dòng chữ còn nghiêng ngả, lấm tấm vài vết mực tím.",
        },
        {
          who: "Dĩ",
          text: "Mai mốt mình sẽ viết đẹp như chữ của cô.",
        },
      ],
    },
    {
      id: "talk-ban-qua",
      label: "Ghé gánh quà vặt",
      npc: "co-ban-qua",
      at: [L.vendor[0] - 0.4, L.vendor[1] - 1.2],
      radius: 1.8,
      lines: [
        {
          who: "Cô bán quà vặt",
          text: "Con mua bánh tráng hay cóc dầm nè? Năm trăm một bịch thôi.",
        },
        {
          who: "Dĩ",
          text: "Dạ để trưa tan học con mua, giờ con vô chào cờ đã.",
        },
        { who: "Cô bán quà vặt", text: "Ừ, ngoan ghê. Vô lẹ đi kẻo trễ." },
      ],
    },
  ],

  obstacles: [],

  intro: [
    {
      who: "",
      text: "Sáng thứ Hai. Trước cổng Tiểu học số 1 Cát Nhơn, tụi nhỏ áo trắng khăn quàng đỏ lục tục kéo nhau vô sân.",
    },
    {
      who: "",
      text: "Đây là ngôi trường đầu tiên của Dĩ. Đi một vòng, chào cờ, vào lớp và làm quen với thế giới mới nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Lá cờ đầu tuần, tiếng trống ra chơi, quả cầu lông gà và những con chữ đầu tiên trên bảng đen.",
    },
    {
      who: "",
      text: "Từ một trang vở nhỏ, thế giới của Dĩ bắt đầu rộng ra từng ngày.",
    },
  ],

  sky: {
    top: "#cfe3ec",
    bottom: "#f7f0de",
    fog: "#ecebdc",
    sun: "#fff0cc",
    sunIntensity: 3.0,
    ambient: 1.05,
  },
};
