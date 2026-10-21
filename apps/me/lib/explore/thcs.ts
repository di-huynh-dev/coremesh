import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "THCS" — một ngày đi học ở Trung học cơ sở Cát Nhơn.
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 *
 * The chapter diorama sits at the origin (school building at -0.5,-2.1;
 * banyan at 4.1,0; bicycle at -3.4,0.8; bookcase at -3.8,-0.25; flag at
 * -1.8,0.1; walking lane z 2.15). Bike shed, library, football field and a
 * study-group table surround it.
 */
export const THCS_LAYOUT = {
  gateZ: 8.2,
  neighbor: [3.6, 9.6] as Vec2,
  neighborBike: [5.5, 9.7] as Vec2,
  shed: { minX: 7.4, maxX: 15.6, frontZ: 3.7, backZ: 6.5 },
  bikes: [8.2, 9.0, 9.8, 10.6, 12.2, 13.0, 13.8, 14.6],
  mySlot: [11.4, 5.1] as Vec2,
  library: { minX: -15.6, maxX: -8.6, backZ: -8.6, frontZ: -3.0 },
  librarian: [-12.1, -7.3] as Vec2,
  counter: [-12.1, -6.4] as Vec2,
  readingTable: [-10.0, -4.4] as Vec2,
  readingTable2: [-13.9, -4.4] as Vec2,
  field: { minX: 7.2, maxX: 16.4, minZ: -8.8, maxZ: -1.8 },
  goal: [15.9, -5.3] as Vec2,
  striker: [11.4, -4.2] as Vec2,
  groupTable: [-10.8, 5.4] as Vec2,
  groupMate: [-12.0, 5.4] as Vec2,
  groupMate2: [-10.8, 4.2] as Vec2,
  easel: [-8.7, 4.4] as Vec2,
  mathTeacher: [1.3, 0.35] as Vec2,
  noticeBoard: [-5.2, 6.5] as Vec2,
  canteen: [-15.0, 1.0] as Vec2,
};
const L = THCS_LAYOUT;

export const thcsMap: ExploreMapData = {
  id: "thcs",
  chapterId: "thcs",
  title: "THCS",
  subtitle: "Một ngày ở Trung học cơ sở Cát Nhơn",
  spawn: [-1.5, 9.5],
  bounds: { min: [-17, -9.1], max: [17, 10.6] },

  npcs: [
    {
      id: "ban-cung-xom",
      name: "Bạn cùng xóm",
      at: L.neighbor,
      facing: -1.2,
      look: {
        shirt: "#f4f1ea",
        pants: "#2c3550",
        hair: "short",
        hairColor: "#1d1a18",
        height: 0.86,
      },
    },
    {
      id: "co-thu-thu",
      name: "Cô thủ thư",
      at: L.librarian,
      look: {
        shirt: "#8fb0c8",
        pants: "#2a2a2e",
        hair: "bun",
        hairColor: "#1d1a18",
        glasses: true,
        longShirt: true,
      },
    },
    {
      id: "ban-cung-lop",
      name: "Bạn cùng lớp",
      at: L.striker,
      facing: -1.6,
      look: {
        shirt: "#f4f1ea",
        pants: "#2c3550",
        hair: "crop",
        hairColor: "#1d1a18",
        height: 0.88,
      },
    },
    {
      id: "ban-cung-nhom",
      name: "Bạn cùng nhóm",
      at: L.groupMate,
      facing: Math.PI / 2,
      pose: "sit",
      look: {
        shirt: "#f4f1ea",
        pants: "#2c3550",
        hair: "pigtails",
        hairColor: "#1d1a18",
        height: 0.85,
      },
    },
    {
      id: "thay-toan",
      name: "Thầy dạy Toán",
      at: L.mathTeacher,
      facing: 0.2,
      look: {
        shirt: "#d9e3ea",
        pants: "#3a3a3a",
        hair: "short",
        hairColor: "#2a2622",
        glasses: true,
      },
    },
  ],

  quests: [
    { id: "dap-xe", label: "Đạp xe tới trường cùng bạn" },
    { id: "cat-xe", label: "Dắt xe vào nhà xe" },
    { id: "muon-sach", label: "Mượn sách ở thư viện" },
    { id: "hoc-nhom", label: "Học nhóm dưới gốc bàng" },
    { id: "hoi-thay", label: "Hỏi thầy một bài toán khó" },
    { id: "da-banh", label: "Đá banh giờ ra chơi" },
  ],

  interactions: [
    {
      id: "talk-ban-xom",
      label: "Nói chuyện với bạn cùng xóm",
      npc: "ban-cung-xom",
      at: [L.neighbor[0] - 1.2, L.neighbor[1] - 0.2],
      radius: 1.8,
      quest: "dap-xe",
      lines: [
        {
          who: "Bạn cùng xóm",
          text: "Hú hồn, tưởng trễ rồi chớ! Mai tao qua rủ mày sớm hơn nghe, đạp chung cho vui.",
        },
        {
          who: "Dĩ",
          text: "Ừ. Đoạn đường đê gió ngược đạp mỏi chân ghê, có bạn đạp chung đỡ hơn nhiều.",
        },
        {
          who: "",
          text: "Từ năm lên cấp hai, chiếc xe đạp thành người bạn đồng hành mỗi sáng tới trường.",
        },
      ],
    },
    {
      id: "park",
      label: "Dắt xe vào nhà xe",
      at: [L.mySlot[0], L.shed.frontZ - 0.8],
      focus: L.mySlot,
      radius: 1.9,
      quest: "cat-xe",
      effect: "xe",
      lines: [
        {
          who: "",
          text: "Nhà xe đã gần kín. Còn đúng một chỗ trống giữa hai chiếc xe quen.",
        },
        {
          who: "Dĩ",
          text: "Dựng chân chống, khóa xe lại. Xong! Giờ lên lớp thôi.",
        },
      ],
    },
    {
      id: "talk-thu-thu",
      label: "Mượn sách",
      npc: "co-thu-thu",
      at: [L.librarian[0], L.counter[1] + 1.3],
      radius: 1.9,
      quest: "muon-sach",
      effect: "sach",
      reward: "Mượn được hai cuốn sách",
      lines: [
        {
          who: "Cô thủ thư",
          text: "Em muốn mượn sách gì? Kệ bên kia có truyện, kệ này là sách khoa học nè.",
        },
        {
          who: "Dĩ",
          text: "Dạ, em mượn cuốn về vũ trụ với cuốn truyện này. Em đọc xong trả liền ạ.",
        },
        {
          who: "Cô thủ thư",
          text: "Ừ, mượn được hai tuần. Đọc kỹ nghe, cô thấy em ghé thư viện hoài, giỏi lắm.",
        },
      ],
    },
    {
      id: "talk-nhom",
      label: "Vào học nhóm",
      npc: "ban-cung-nhom",
      at: [L.groupTable[0] - 0.4, L.groupTable[1] + 1.3],
      radius: 1.9,
      quest: "hoc-nhom",
      effect: "nhom",
      lines: [
        {
          who: "Bạn cùng nhóm",
          text: "Dĩ tới rồi! Bài số bốn tụi mình bí quá, giải hoài không ra.",
        },
        {
          who: "Dĩ",
          text: "Để coi… Mình đặt ẩn là x, rồi lập phương trình theo đề nè.",
        },
        {
          who: "Bạn cùng nhóm",
          text: "A, ra rồi! Học nhóm vậy mà hiểu bài hơn ngồi một mình nhiều.",
        },
      ],
    },
    {
      id: "talk-thay-toan",
      label: "Hỏi bài thầy",
      npc: "thay-toan",
      at: [L.mathTeacher[0] + 0.1, 1.8],
      radius: 1.8,
      quest: "hoi-thay",
      lines: [
        {
          who: "Dĩ",
          text: "Thầy ơi, bài hình hôm qua em vẽ thêm đường phụ mà vẫn chưa ra ạ.",
        },
        {
          who: "Thầy dạy Toán",
          text: "Em thử nối hai điểm này coi. Toán không phải học thuộc, mà là tập cách nghĩ.",
        },
        {
          who: "Thầy dạy Toán",
          text: "Cứ hỏi nhiều vào. Thắc mắc nhiều mới là học trò giỏi đó em.",
        },
      ],
    },
    {
      id: "talk-da-banh",
      label: "Ra sân đá banh",
      npc: "ban-cung-lop",
      at: [L.striker[0] - 1.2, L.striker[1] + 0.3],
      radius: 1.9,
      quest: "da-banh",
      effect: "ghi-ban",
      lines: [
        {
          who: "Bạn cùng lớp",
          text: "Dĩ! Đá với tụi tao một trận, thiếu đúng một người nè.",
        },
        { who: "Dĩ", text: "Chuyền đây! Sút nè!" },
        {
          who: "",
          text: "Trái banh lăn qua tay thủ môn, vào lưới. Cả đám hò reo tới khi trống vào lớp.",
        },
      ],
    },
    {
      id: "notice-board",
      label: "Xem bảng tin",
      at: [L.noticeBoard[0], L.noticeBoard[1] + 0.9],
      focus: L.noticeBoard,
      radius: 1.7,
      lines: [
        {
          who: "",
          text: "Bảng tin dán thời khóa biểu, lịch trực nhật và thông báo hội thao của trường.",
        },
        {
          who: "Dĩ",
          text: "Lên cấp hai rồi, môn học nhiều hơn hẳn. Mà môn nào cũng có cái hay riêng.",
        },
      ],
    },
  ],

  obstacles: [],

  intro: [
    {
      who: "",
      text: "Lên cấp hai, Dĩ học ở Trung học cơ sở Cát Nhơn. Mỗi sáng đạp xe theo con đường làng quen thuộc tới trường.",
    },
    {
      who: "",
      text: "Kiến thức nhiều hơn, bạn bè đông hơn. Đi một vòng trường và sống lại một ngày học trò nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Chiếc xe đạp, kệ sách thư viện, những buổi học nhóm và trận banh giờ ra chơi.",
    },
    {
      who: "",
      text: "Những năm cấp hai, Dĩ có thêm nhiều câu hỏi, nhiều ước mơ, và hiểu mình hơn một chút.",
    },
  ],

  sky: {
    top: "#c6dfec",
    bottom: "#f1efe2",
    fog: "#e6eae0",
    sun: "#fff4d8",
    sunIntensity: 3.1,
    ambient: 1.05,
  },
};
