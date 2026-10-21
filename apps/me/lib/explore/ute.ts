import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "UTE" — bốn năm ở Đại học Sư phạm Kỹ thuật TP.HCM (Kỹ thuật phần mềm,
 * 09.2020 - 06.2024, GPA 3.34/4).
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 *
 * The chapter diorama sits at the origin (main building at -0.4,-2.1 with its
 * steps, monument at 0,-0.3, desk at -3.4,0.65, backpack at 3.35,3.5; walking
 * lane z 2.15). Lecture hall to the west, library to the east, canteen and
 * motorbike parking along the front.
 */

type CutawayRoom = {
  minX: number;
  maxX: number;
  backZ: number;
  frontZ: number;
  height: number;
  /** Doorway centre on the front wall and its width. */
  doorX: number;
  doorW: number;
};

export const UTE_LAYOUT = {
  hall: {
    minX: -16,
    maxX: -8,
    backZ: -7.4,
    frontZ: -1.4,
    height: 3.4,
    doorX: -9.3,
    doorW: 1.9,
  } satisfies CutawayRoom,
  library: {
    minX: 8,
    maxX: 16,
    backZ: -7.4,
    frontZ: -2.2,
    height: 3.4,
    doorX: 10,
    doorW: 1.9,
  } satisfies CutawayRoom,
  /** Projector screen on the lecture hall's back wall. */
  screen: [-12.4, -7.15] as Vec2,
  podium: [-14.6, -6.3] as Vec2,
  lecturer: [-10.2, -6.2] as Vec2,
  /** Desk rows: centre x, width, row z values. Students sit just behind each row. */
  desks: { x: -13.4, width: 3.6, rows: [-4.8, -3.6, -2.4] },
  readingTable: [11.6, -4.9] as Vec2,
  libraryCounter: [14.6, -4.4] as Vec2,
  librarian: [15.3, -4.4] as Vec2,
  tent: [-3.0, 6.4] as Vec2,
  senior: [-3.0, 5.75] as Vec2,
  board: [6.9, 0.0] as Vec2,
  canteenTable: [10.5, 5.6] as Vec2,
  friends: [
    [9.6, 5.6],
    [11.4, 5.6],
  ] as Vec2[],
  kiosk: [14.6, 4.9] as Vec2,
  parking: { minX: -16, maxX: -10, rows: [4.9, 7.0] },
  roommate: [-8.6, 5.6] as Vec2,
  gateZ: 9.7,
};
const L = UTE_LAYOUT;

export const uteMap: ExploreMapData = {
  id: "ute",
  chapterId: "ute",
  title: "Đại học",
  subtitle: "Bốn năm ở UTE",
  spawn: [0, 8.8],
  bounds: { min: [-17, -9], max: [17, 10] },

  npcs: [
    {
      id: "dan-anh",
      name: "Đàn anh",
      at: L.senior,
      look: {
        shirt: "#2f7fc0",
        pants: "#2b2f3a",
        hair: "short",
        hairColor: "#1d1a18",
      },
    },
    {
      id: "thay",
      name: "Thầy hướng dẫn",
      at: L.lecturer,
      facing: 0.35,
      look: {
        shirt: "#e8e4da",
        pants: "#3a3a44",
        hair: "short",
        hairColor: "#4a4540",
        glasses: true,
      },
    },
    {
      id: "ban-nhom-1",
      name: "Bạn cùng nhóm",
      at: L.friends[0]!,
      pose: "sit",
      facing: Math.PI / 2,
      look: {
        shirt: "#c4553a",
        pants: "#2e3a5a",
        hair: "short",
        glasses: true,
      },
    },
    {
      id: "ban-nhom-2",
      name: "Bạn cùng nhóm",
      at: L.friends[1]!,
      pose: "sit",
      facing: -Math.PI / 2,
      look: {
        shirt: "#e6b33a",
        pants: "#3a3a3a",
        hair: "pigtails",
        hairColor: "#2a201a",
      },
    },
    {
      id: "thu-thu",
      name: "Cô thủ thư",
      at: L.librarian,
      facing: -Math.PI / 2,
      look: {
        shirt: "#7a5c8e",
        pants: "#2a2a2e",
        hair: "bun",
        hairColor: "#2a2420",
        glasses: true,
      },
    },
    {
      id: "ban-cung-phong",
      name: "Bạn cùng phòng",
      at: L.roommate,
      facing: -0.4,
      look: {
        shirt: "#d9822b",
        pants: "#3b4a5a",
        hair: "crop",
      },
    },
  ],

  quests: [
    { id: "nhap-hoc", label: "Làm thủ tục nhập học" },
    { id: "vao-lop", label: "Tìm giảng đường, dự buổi học đầu tiên" },
    { id: "lam-nhom", label: "Họp nhóm làm đồ án" },
    { id: "thu-vien", label: "Ôn thi ở thư viện" },
    { id: "tot-nghiep", label: "Bảo vệ khóa luận, nhận bằng tốt nghiệp" },
  ],

  interactions: [
    {
      id: "talk-dan-anh",
      label: "Làm thủ tục nhập học",
      npc: "dan-anh",
      at: [L.senior[0], L.senior[1] + 1.85],
      radius: 1.9,
      quest: "nhap-hoc",
      effect: "bong-bay",
      reward: "Thẻ sinh viên đầu tiên",
      lines: [
        {
          who: "Đàn anh",
          text: "Chào em, tân sinh viên hả? Ngành gì để anh chỉ chỗ nộp hồ sơ nè.",
        },
        { who: "Dĩ", text: "Dạ, Kỹ thuật phần mềm ạ. Em ở Bình Định mới vô." },
        {
          who: "Đàn anh",
          text: "Ngành anh luôn! Năm nhất cứ học chắc nền tảng, có gì không hiểu thì hỏi anh chị khóa trên nghe.",
        },
      ],
    },
    {
      id: "talk-thay",
      label: "Vào lớp",
      npc: "thay",
      at: [L.lecturer[0] + 0.2, L.lecturer[1] + 1.3],
      radius: 1.9,
      quest: "vao-lop",
      effect: "slides",
      lines: [
        {
          who: "",
          text: "Giảng đường rộng hơn mọi lớp học Dĩ từng ngồi. Máy chiếu bật lên, cả phòng im lặng.",
        },
        {
          who: "Thầy hướng dẫn",
          text: "Lập trình không phải học thuộc cú pháp. Các em học cách chia nhỏ một vấn đề rồi giải từng phần.",
        },
        {
          who: "Thầy hướng dẫn",
          text: "Sai thì sửa, chạy lại. Ai kiên nhẫn với lỗi, người đó đi xa.",
        },
        { who: "Dĩ", text: "(ghi vội vào vở) Kiên nhẫn với lỗi…" },
      ],
    },
    {
      id: "talk-nhom",
      label: "Họp nhóm",
      npc: "ban-nhom-1",
      at: [L.canteenTable[0], L.canteenTable[1] + 1.3],
      radius: 1.9,
      quest: "lam-nhom",
      effect: "do-an",
      lines: [
        {
          who: "Bạn cùng nhóm",
          text: "Dĩ tới rồi! Đồ án môn này nhóm mình làm web quản lý thư viện nha.",
        },
        {
          who: "Dĩ",
          text: "Ok. Mình nhận phần giao diện, mấy bạn lo phần dữ liệu với báo cáo nhé.",
        },
        {
          who: "",
          text: "Laptop mở ra, giấy note dán đầy bàn. Ly trà đá căn tin tan lúc nào không hay.",
        },
      ],
    },
    {
      id: "talk-thu-thu",
      label: "Vào thư viện",
      npc: "thu-thu",
      at: [13.4, L.librarian[1]],
      radius: 1.9,
      quest: "thu-vien",
      effect: "den-doc",
      lines: [
        {
          who: "Cô thủ thư",
          text: "Mùa thi rồi hả em? Bàn đọc trong góc còn trống đó, nhớ giữ trật tự nghe.",
        },
        { who: "Dĩ", text: "Dạ, em cảm ơn cô." },
        {
          who: "",
          text: "Đèn bàn bật lên. Một chồng sách, một cuốn vở, và cả buổi chiều yên tĩnh.",
        },
      ],
    },
    {
      id: "board",
      label: "Xem bảng tin",
      at: [L.board[0], L.board[1] + 1.5],
      focus: L.board,
      radius: 1.9,
      quest: "tot-nghiep",
      effect: "tot-nghiep",
      reward: "Tấm bằng tốt nghiệp",
      lines: [
        {
          who: "",
          text: "Bốn năm trôi qua thật nhanh. Buổi bảo vệ khóa luận kết thúc trong tiếng vỗ tay của cả nhóm.",
        },
        {
          who: "Thầy hướng dẫn",
          text: "Chúc mừng em. Tấm bằng chỉ là điểm bắt đầu thôi, nghề này phải học suốt đời.",
        },
        {
          who: "",
          text: "Trên bảng tin: Kỹ thuật phần mềm · 09.2020 - 06.2024 · GPA 3.34/4.",
        },
        {
          who: "Dĩ",
          text: "Không phải điểm cao nhất, nhưng là bốn năm mình đã cố gắng thật sự.",
        },
      ],
    },
    {
      id: "talk-ban-cung-phong",
      label: "Nói chuyện với bạn cùng phòng",
      npc: "ban-cung-phong",
      at: [L.roommate[0], L.roommate[1] + 1.3],
      radius: 1.9,
      lines: [
        {
          who: "Bạn cùng phòng",
          text: "Ê Dĩ, chiều nay học xong về chung nha. Tối nay tới lượt tui nấu cơm.",
        },
        { who: "Dĩ", text: "Ok. Mà nhớ đừng nấu mì gói nữa nghe!" },
        {
          who: "Bạn cùng phòng",
          text: "Cuối tháng rồi mà ông… Có mì là sang lắm rồi đó.",
        },
      ],
    },
  ],

  obstacles: [],

  intro: [
    {
      who: "",
      text: "Tháng chín năm 2020. Cổng trường Sư phạm Kỹ thuật đông nghẹt tân sinh viên và phụ huynh.",
    },
    {
      who: "",
      text: "Đi một vòng khuôn viên: nhập học, tìm giảng đường, gặp bạn bè và bắt đầu bốn năm đại học.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Giảng đường, thư viện, bàn căn tin và những đêm làm đồ án: bốn năm ở UTE gói lại trong một tấm bằng.",
    },
    {
      who: "",
      text: "Từ người học, Dĩ dần trở thành người tạo ra sản phẩm.",
    },
  ],

  sky: {
    top: "#b9d2dc",
    bottom: "#f4ead6",
    fog: "#e5e6d8",
    sun: "#ffe2b4",
    sunIntensity: 2.7,
    ambient: 1.0,
  },
};
