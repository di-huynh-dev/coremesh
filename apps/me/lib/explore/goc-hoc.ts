import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Góc tự học" — một đêm ở phòng trọ TP.HCM.
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 * (Chặng tự học JavaScript → React → TypeScript là thật; mọi chi tiết khác
 * chỉ để minh họa.)
 *
 * The chapter diorama at the origin IS Dĩ's room (floor x -5.25..5.25,
 * z -3.55..1.45; desk at -1,-1.6; chair at -1.2,-0.05; bookcase at -4.1,-2.1;
 * plant at 3.2,-1.5; bed at 3.6,0.45; window with skyline on the back wall).
 * The map closes it with a front wall (cut away while inside) and adds the
 * row of rented rooms and the alley outside.
 */
export const GOC_HOC_LAYOUT = {
  room: {
    minX: -5.3,
    maxX: 5.3,
    backZ: -3.5,
    frontZ: 1.55,
    height: 3.8,
    doorX: 0.8,
    doorW: 2.0,
  },
  /** Neighbouring rooms of the dãy trọ, left and right of Dĩ's room. */
  rowZ: { back: -3.6, front: 1.5 },
  desk: [-1.0, -1.6] as Vec2,
  /** World positions of things on the diorama's desk. */
  lampShade: [-2.63, 1.82, -1.75] as [number, number, number],
  monitorScreen: [-1.55, 1.81, -1.7] as [number, number, number],
  laptopScreen: [-0.15, 1.449, -1.65] as [number, number, number],
  deskTopY: 1.14,
  bed: [3.6, 0.45] as Vec2,
  window: [1.3, -3.3] as Vec2,
  cat: [4.3, -3.17] as Vec2,
  kettleShelf: [6.6, 1.8] as Vec2,
  neighbor: [-8.6, 2.4] as Vec2,
  neighborTable: [-7.75, 2.25] as Vec2,
  landlady: [-13.5, 6.2] as Vec2,
  gateX: -16.8,
  cart: [10.5, 5.6] as Vec2,
  vendor: [10.5, 4.85] as Vec2,
  streetLamps: [
    [-11.5, 8.9],
    [3.2, 8.9],
  ] as Vec2[],
  southWallZ: 9.6,
};
const L = GOC_HOC_LAYOUT;

export const gocHocMap: ExploreMapData = {
  id: "goc-hoc",
  chapterId: "goc-hoc",
  title: "Góc tự học",
  subtitle: "Một đêm ở phòng trọ",
  spawn: [-3.5, 5.2],
  bounds: { min: [-17, -3.3], max: [17, 9] },

  npcs: [
    {
      id: "anh-phong-ben",
      name: "Anh phòng bên",
      at: L.neighbor,
      pose: "sit",
      facing: 0.5,
      look: {
        shirt: "#4a5a7a",
        pants: "#3a3a3a",
        hair: "short",
        glasses: true,
      },
    },
    {
      id: "chu-hu-tieu",
      name: "Chú bán hủ tiếu",
      at: L.vendor,
      look: {
        shirt: "#d9d4c0",
        pants: "#3a3a44",
        hair: "crop",
        hairColor: "#3a3530",
      },
    },
    {
      id: "co-chu-tro",
      name: "Cô chủ trọ",
      at: L.landlady,
      facing: 0.4,
      look: {
        shirt: "#9a4a5a",
        pants: "#2a2a2e",
        hair: "bun",
        hairColor: "#2a2420",
        height: 0.95,
      },
    },
  ],

  quests: [
    { id: "bat-den", label: "Bật đèn bàn" },
    { id: "hello-world", label: "Viết dòng code đầu tiên" },
    { id: "pha-cafe", label: "Pha ly cà phê khuya" },
    { id: "sua-bug", label: "Sửa bug lúc nửa đêm" },
    { id: "an-khuya", label: "Ăn khuya hủ tiếu gõ" },
    { id: "push-code", label: "Đẩy code lên GitHub, ngắm phố đêm" },
  ],

  interactions: [
    {
      id: "lamp",
      label: "Bật đèn bàn",
      at: [-3.1, -0.45],
      focus: [L.lampShade[0], L.lampShade[2]],
      radius: 1.8,
      quest: "bat-den",
      effect: "den",
      lines: [
        {
          who: "",
          text: "Mười giờ đêm. Bạn cùng phòng đã ngủ, cả dãy trọ chỉ còn tiếng quạt máy.",
        },
        { who: "Dĩ", text: "(bật đèn bàn) Học thêm một chút nữa thôi." },
        {
          who: "",
          text: "Quầng sáng vàng vừa đủ cho một cuốn sách và một bàn phím.",
        },
      ],
    },
    {
      id: "code",
      label: "Ngồi vào bàn code",
      at: [0, -0.55],
      focus: [L.monitorScreen[0], L.monitorScreen[2]],
      radius: 1.8,
      quest: "hello-world",
      effect: "hello",
      lines: [
        {
          who: "Dĩ",
          text: "Bài đầu tiên trong tài liệu JavaScript: in ra một dòng chữ.",
        },
        {
          who: "",
          text: 'Dĩ gõ chậm từng ký tự: console.log("Hello, world!");',
        },
        {
          who: "",
          text: "Màn hình hiện lên: Hello, world! Một dòng chữ nhỏ thôi, mà vui cả buổi tối.",
        },
      ],
    },
    {
      id: "window",
      label: "Đẩy code, nhìn ra cửa sổ",
      at: [2.0, -2.4],
      focus: L.window,
      radius: 1.8,
      quest: "push-code",
      effect: "push",
      lines: [
        { who: "Dĩ", text: "Xong rồi. Đẩy code lên GitHub thôi." },
        {
          who: "",
          text: "git push origin main. Một ô vuông xanh nhỏ hiện lên trên trang GitHub.",
        },
        {
          who: "",
          text: "Ngoài cửa sổ, thành phố vẫn sáng đèn. Con mèo trên bậu cửa lim dim nhìn theo.",
        },
        {
          who: "Dĩ",
          text: "Hôm nay JavaScript, rồi tới React, TypeScript. Từng bước một.",
        },
      ],
    },
    {
      id: "roommate",
      label: "Nhìn bạn cùng phòng",
      at: [2.1, 1.05],
      focus: L.bed,
      radius: 1.7,
      lines: [
        {
          who: "Bạn cùng phòng",
          text: "(nói mớ) Ừm… Dĩ… tắt đèn ngủ đi… mai còn học sớm…",
        },
        { who: "Dĩ", text: "(nói nhỏ) Ừ, xíu nữa thôi. Ngủ ngon." },
      ],
    },
    {
      id: "kettle",
      label: "Pha cà phê",
      at: [L.kettleShelf[0], L.kettleShelf[1] + 1.2],
      focus: L.kettleShelf,
      radius: 1.9,
      quest: "pha-cafe",
      effect: "cafe",
      lines: [
        {
          who: "",
          text: "Đầu hành lang có cái ấm siêu tốc chung của cả dãy trọ.",
        },
        {
          who: "Dĩ",
          text: "Một ly cà phê gói cho tỉnh, thêm ly mì để dành lúc nửa đêm.",
        },
        { who: "", text: "Hơi nước bốc lên, thơm lừng cả hành lang." },
      ],
    },
    {
      id: "talk-anh-phong-ben",
      label: "Hỏi anh phòng bên",
      npc: "anh-phong-ben",
      at: [-8.0, 3.6],
      radius: 1.9,
      quest: "sua-bug",
      effect: "fix",
      lines: [
        {
          who: "Anh phòng bên",
          text: "Chưa ngủ hả Dĩ? Mặt nhăn vậy chắc lại dính bug rồi.",
        },
        {
          who: "Dĩ",
          text: "Dạ, cái nút bấm hoài không chạy. Em dò cả tiếng rồi mà chưa ra.",
        },
        {
          who: "Anh phòng bên",
          text: "Đọc kỹ thông báo lỗi, rồi console.log từng bước. Bug nào cũng có đường lần ra hết.",
        },
        {
          who: "",
          text: "Gần một giờ sáng, Dĩ tìm ra: gõ sai tên một biến. Màn hình laptop chuyển sang màu xanh.",
        },
      ],
    },
    {
      id: "talk-chu-hu-tieu",
      label: "Ăn khuya",
      npc: "chu-hu-tieu",
      at: [L.cart[0], L.cart[1] + 1.3],
      radius: 1.9,
      quest: "an-khuya",
      reward: "Một tô hủ tiếu nóng",
      lines: [
        {
          who: "",
          text: "Cốc cốc cốc… tiếng gõ của xe hủ tiếu vang trong hẻm.",
        },
        {
          who: "Chú bán hủ tiếu",
          text: "Một tô như mọi khi hả con? Học khuya vậy thì ăn cho có sức.",
        },
        { who: "Dĩ", text: "Dạ, chú cho con thêm ít hẹ nha." },
      ],
    },
    {
      id: "talk-co-chu-tro",
      label: "Chào cô chủ trọ",
      npc: "co-chu-tro",
      at: [L.landlady[0], L.landlady[1] + 1.25],
      radius: 1.9,
      lines: [
        {
          who: "Cô chủ trọ",
          text: "Dĩ hả? Mười một giờ cô khóa cổng nghe. Đi ăn khuya thì về sớm.",
        },
        { who: "Dĩ", text: "Dạ, con nhớ rồi cô." },
        {
          who: "Cô chủ trọ",
          text: "Học thì học, mà giữ sức khỏe. Đêm nào cũng thấy đèn phòng con sáng.",
        },
      ],
    },
  ],

  obstacles: [],

  intro: [
    {
      who: "",
      text: "Một đêm ở phòng trọ TP.HCM. Ngoài hẻm, xe hủ tiếu gõ vừa đi ngang.",
    },
    {
      who: "",
      text: "Sau giờ học trên lớp là giờ tự học. Bật đèn, mở máy và viết những dòng code đầu tiên nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Từ một dòng Hello, world! tới JavaScript, React, rồi TypeScript: tay nghề lớn lên từ những đêm như thế.",
    },
    {
      who: "",
      text: "Không đêm nào thay đổi tất cả. Chỉ là mỗi đêm, tiến thêm một chút.",
    },
  ],

  sky: {
    top: "#141a33",
    bottom: "#2b3358",
    fog: "#1d2440",
    sun: "#9fb4ff",
    sunIntensity: 0.8,
    ambient: 0.5,
    hemi: 0.45,
    hemiSky: "#5d6aa0",
  },
};
