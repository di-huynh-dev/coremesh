import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Chợ quê" — buổi sáng sớm ở chợ làng.
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 *
 * The chapter diorama sits at the origin (three stalls along z -1.9, bánh
 * tráng racks at -3.3,0.55, a gánh hàng at 2.7,0.6, a bicycle at 5,0.75;
 * walking lane z 2.15). Everything below surrounds it.
 */
export const CHO_QUE_LAYOUT = {
  mom: [-1.6, 5.2] as Vec2,
  momBike: [-3.6, 6.1] as Vec2,
  stove: [-9.6, -2.15] as Vec2,
  banhCanCook: [-9.6, -3.2] as Vec2,
  banhCanTable: [-12.3, -1.5] as Vec2,
  banhTrangSeller: [-12.6, 5.2] as Vec2,
  banhTrangTray: [-11.45, 5.0] as Vec2,
  racks: [
    [-15.0, 7.6],
    [-13.2, 8.4],
    [-15.2, 4.6],
  ] as Vec2[],
  fishSeller: [9.6, -3.5] as Vec2,
  basins: [
    [8.75, -2.6],
    [10.45, -2.6],
  ] as Vec2[],
  fruitSeller: [6.9, 6.2] as Vec2,
  fruitTray: [5.85, 6.5] as Vec2,
  ganh: [8.15, 6.3] as Vec2,
  teaGrandpa: [12.9, 4.9] as Vec2,
  teaTable: [13.95, 4.7] as Vec2,
  hall: [12, -7.1] as Vec2,
  gate: [2.5, 9.0] as Vec2,
  houses: [
    [-8.8, -7.4],
    [-14.2, -7.4],
  ] as Vec2[],
};
const L = CHO_QUE_LAYOUT;

export const choQueMap: ExploreMapData = {
  id: "cho-que",
  chapterId: "cho-que",
  title: "Chợ quê",
  subtitle: "Đi chợ sớm cùng mẹ",
  spawn: [0, 2.15],
  bounds: { min: [-17, -9], max: [17, 10] },

  npcs: [
    {
      id: "me",
      name: "Mẹ",
      at: L.mom,
      facing: 0.3,
      look: {
        shirt: "#5b7f5a",
        pants: "#2a2a2e",
        hair: "bun",
        hat: "non-la",
        longShirt: true,
      },
    },
    {
      id: "co-banh-can",
      name: "Cô bán bánh căn",
      at: L.banhCanCook,
      pose: "sit",
      look: {
        shirt: "#c0392b",
        pants: "#2a2a2e",
        hair: "bun",
        hat: "non-la",
      },
    },
    {
      id: "co-banh-trang",
      name: "Cô bán bánh tráng",
      at: L.banhTrangSeller,
      pose: "sit",
      facing: 0.5,
      look: {
        shirt: "#2e6f8e",
        pants: "#2a2a2e",
        hair: "bun",
        hat: "non-la",
        longShirt: true,
      },
    },
    {
      id: "co-ban-ca",
      name: "Cô bán cá",
      at: L.fishSeller,
      pose: "sit",
      look: {
        shirt: "#8a6a46",
        pants: "#3a3a3a",
        hair: "bun",
        hat: "non-la",
      },
    },
    {
      id: "ba-trai-cay",
      name: "Bà bán trái cây",
      at: L.fruitSeller,
      pose: "sit",
      facing: -0.3,
      look: {
        shirt: "#7a2e3b",
        pants: "#2a2a2e",
        hair: "bun",
        hairColor: "#cfcac0",
        height: 0.9,
        hat: "non-la",
        longShirt: true,
      },
    },
    {
      id: "ong",
      name: "Ông",
      at: L.teaGrandpa,
      pose: "sit",
      facing: -0.5,
      look: {
        shirt: "#e9e2d0",
        pants: "#3a3a3a",
        hair: "crop",
        hairColor: "#d9d6cf",
        height: 0.92,
        beard: true,
        glasses: true,
      },
    },
  ],

  quests: [
    { id: "xach-gio", label: "Xách giỏ đi chợ với mẹ" },
    { id: "mua-banh-trang", label: "Mua xấp bánh tráng" },
    { id: "mua-ca", label: "Lựa cá tươi" },
    { id: "mua-trai-cay", label: "Mua trái cây cho bà" },
    { id: "an-banh-can", label: "Ăn sáng bánh căn" },
  ],

  interactions: [
    {
      id: "talk-me",
      label: "Xách giỏ cho mẹ",
      npc: "me",
      at: [L.mom[0] + 0.4, L.mom[1] + 1.3],
      radius: 1.9,
      quest: "xach-gio",
      effect: "gio",
      lines: [
        {
          who: "Mẹ",
          text: "Con xách giỏ giùm mẹ nghe. Đi sát mẹ, chợ đông dễ lạc lắm.",
        },
        {
          who: "Mẹ",
          text: "Hôm nay mua xấp bánh tráng, con cá, ít trái cây. Mua xong mẹ con mình ăn bánh căn.",
        },
        { who: "Dĩ", text: "Dạ! Con nhớ hết rồi, để con xách cho." },
      ],
    },
    {
      id: "talk-banh-trang",
      label: "Mua bánh tráng",
      npc: "co-banh-trang",
      at: [L.banhTrangSeller[0] + 0.6, L.banhTrangSeller[1] + 1.4],
      radius: 1.9,
      quest: "mua-banh-trang",
      effect: "banh-trang",
      lines: [
        {
          who: "Cô bán bánh tráng",
          text: "Bánh tráng nước dừa mới phơi hồi hôm nè con. Nướng lên giòn rụm, thơm phức.",
        },
        {
          who: "Dĩ",
          text: "Cô bán cho con một xấp, mẹ con dặn lựa cái dày dày.",
        },
        {
          who: "Cô bán bánh tráng",
          text: "Ờ, cô lựa cho. Cầm cẩn thận nghe, bể là hết ngon đó.",
        },
      ],
    },
    {
      id: "talk-ca",
      label: "Lựa cá",
      npc: "co-ban-ca",
      at: [L.fishSeller[0], L.fishSeller[1] + 2.2],
      radius: 1.9,
      quest: "mua-ca",
      effect: "ca",
      lines: [
        {
          who: "Cô bán cá",
          text: "Cá mới dưới ghe lên nè, còn nhảy đành đạch luôn. Mua con cá nục kho cho cả nhà ăn nghe.",
        },
        {
          who: "Dĩ",
          text: "Con này mắt trong, mang đỏ, mẹ nói vậy là tươi phải không cô?",
        },
        {
          who: "Cô bán cá",
          text: "Trời, nhỏ xíu mà biết lựa cá ghê! Cô bớt cho mẹ con chút đỉnh.",
        },
      ],
    },
    {
      id: "talk-trai-cay",
      label: "Mua trái cây",
      npc: "ba-trai-cay",
      at: [L.fruitSeller[0] - 0.3, L.fruitSeller[1] + 1.3],
      radius: 1.9,
      quest: "mua-trai-cay",
      effect: "trai-cay",
      lines: [
        {
          who: "Bà bán trái cây",
          text: "Xoài cát, chuối chín cây, mãng cầu… Con mua gì nè?",
        },
        {
          who: "Dĩ",
          text: "Con mua nải chuối với mấy trái xoài về cho bà con ở nhà.",
        },
        {
          who: "Bà bán trái cây",
          text: "Ngoan quá. Bà cho thêm trái xoài nhỏ, ăn đi đường nghe.",
        },
      ],
    },
    {
      id: "talk-banh-can",
      label: "Ăn bánh căn",
      npc: "co-banh-can",
      at: [L.stove[0] + 0.3, L.stove[1] + 1.3],
      radius: 1.9,
      quest: "an-banh-can",
      effect: "banh-can",
      reward: "Một đĩa bánh căn nóng hổi",
      lines: [
        {
          who: "Cô bán bánh căn",
          text: "Ngồi đi con, cô đổ khuôn mới. Đợi chút xíu là chín.",
        },
        {
          who: "",
          text: "Cô mở từng nắp đất, khói bốc lên thơm mùi bột gạo. Mấy cái bánh tròn vàng ruộm nằm gọn trong khuôn.",
        },
        { who: "Dĩ", text: "Chấm nước mắm với xoài băm, ngon nhất chợ luôn!" },
      ],
    },
    {
      id: "talk-ong",
      label: "Chào ông ở quán nước",
      npc: "ong",
      at: [L.teaGrandpa[0] - 0.6, L.teaGrandpa[1] + 1.25],
      radius: 1.8,
      lines: [
        { who: "Dĩ", text: "Con chào ông! Ông ra chợ uống trà hả ông?" },
        {
          who: "Ông",
          text: "Ờ, sáng nào ông cũng ngồi đây một ly trà, nghe người ta nói chuyện mùa màng.",
        },
        {
          who: "Ông",
          text: "Chợ quê nhỏ vậy chớ cái gì cũng có. Đi theo mẹ mà học cách trả giá nghe con.",
        },
      ],
    },
  ],

  obstacles: [],

  intro: [
    {
      who: "",
      text: "Trời còn sương, chợ làng đã đông. Tiếng rao, tiếng cười, mùi bánh căn bay khắp lối đi.",
    },
    {
      who: "",
      text: "Hôm nay Dĩ theo mẹ đi chợ. Xách giỏ cho mẹ rồi đi một vòng mua đồ nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Giỏ đầy bánh tráng, cá tươi, trái cây; bụng no bánh căn. Mẹ con đạp xe về khi nắng vừa lên.",
    },
    {
      who: "",
      text: "Đi chợ cùng mẹ, Dĩ học được cách nhìn, cách hỏi và cách cảm ơn người bán hàng.",
    },
  ],

  sky: {
    top: "#f1dfc0",
    bottom: "#fbf3e4",
    fog: "#f3e8d6",
    sun: "#ffe0b0",
    sunIntensity: 2.8,
    ambient: 1.05,
  },
};
