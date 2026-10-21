import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Tết quê" — sáng mùng Một ở một ngôi nhà ba gian miền quê Bình Định.
 *
 * LỜI THOẠI LÀ MINH HỌA theo phong tục Tết chung. Hãy sửa tên gọi
 * (ông nội / ông ngoại, ba / cha / má…) và lời nói cho đúng kỷ niệm thật.
 */

/** Shared layout: the 3D scene and the collision data both read from here. */
export const TET_LAYOUT = {
  house: { minX: -6, maxX: 6, backZ: -10, frontZ: -4 },
  altar: [0, -9.1] as Vec2,
  teaTable: [-3.6, -6.6] as Vec2,
  grandpa: [-3.6, -7.55] as Vec2,
  grandma: [2.7, -7.6] as Vec2,
  mai: [-5.2, -1.4] as Vec2,
  kumquats: [
    [-2.4, -3.1],
    [2.4, -3.1],
  ] as Vec2[],
  momTable: [5.1, -2.0] as Vec2,
  mom: [4.4, -1.1] as Vec2,
  fire: [8.2, 1.6] as Vec2,
  dad: [7.0, 2.3] as Vec2,
  mat: [-3.0, 3.0] as Vec2,
  cousins: [
    [-3.8, 2.6],
    [-2.2, 3.5],
  ] as Vec2[],
  gateZ: 10,
  neighbor: [0.9, 8.6] as Vec2,
  well: [11.5, -5.5] as Vec2,
};

const L = TET_LAYOUT;

export const tetMap: ExploreMapData = {
  id: "tet-que",
  chapterId: "tet-que",
  title: "Tết quê",
  subtitle: "Sáng mùng Một",
  spawn: [0, 7.4],
  bounds: { min: [-15, -9.6], max: [15, 9.4] },

  npcs: [
    {
      id: "ong",
      activity: "drink",
      name: "Ông",
      at: L.grandpa,
      pose: "sit",
      look: {
        shirt: "#3b3f4a",
        pants: "#2a2a2e",
        hair: "crop",
        hairColor: "#d9d6cf",
        height: 0.93,
        hat: "khan-dong",
        beard: true,
        longShirt: true,
      },
    },
    {
      id: "ba-noi",
      name: "Bà",
      at: L.grandma,
      facing: -0.4,
      look: {
        shirt: "#7a2e3b",
        pants: "#2a2a2e",
        hair: "bun",
        hairColor: "#cfcac0",
        height: 0.9,
        longShirt: true,
      },
    },
    {
      id: "me",
      activity: "talk",
      name: "Mẹ",
      at: L.mom,
      facing: -0.5,
      look: {
        shirt: "#c0392b",
        pants: "#1f2a44",
        hair: "bun",
        hairColor: "#1d1a18",
        longShirt: true,
      },
    },
    {
      id: "cha",
      activity: "stir",
      name: "Cha",
      at: L.dad,
      facing: 0.9,
      look: {
        shirt: "#3e6b8a",
        pants: "#2b2b2b",
        hair: "short",
        hairColor: "#1d1a18",
      },
    },
    {
      id: "em-ho-1",
      activity: "play",
      movement: { kind: "wander", radius: 1.2, speed: 1.4, pause: [1, 3] },
      name: "Em họ",
      at: L.cousins[0],
      facing: 0.6,
      look: {
        shirt: "#e6b33a",
        pants: "#2e4a7a",
        hair: "pigtails",
        hairColor: "#1d1a18",
        height: 0.66,
      },
    },
    {
      id: "em-ho-2",
      activity: "clap",
      name: "Em họ",
      at: L.cousins[1],
      facing: -0.4,
      look: {
        shirt: "#5b8a4a",
        pants: "#3a3a3a",
        hair: "short",
        hairColor: "#1d1a18",
        height: 0.7,
      },
    },
    {
      id: "co-hang-xom",
      activity: "wave",
      name: "Cô hàng xóm",
      at: L.neighbor,
      facing: -2.6,
      look: {
        shirt: "#8e44ad",
        pants: "#2a2a2e",
        hair: "bun",
        hairColor: "#1d1a18",
        hat: "non-la",
        longShirt: true,
      },
    },
  ],

  quests: [
    { id: "thap-huong", label: "Thắp nén hương lên bàn thờ" },
    { id: "chuc-ong", label: "Chúc Tết ông" },
    { id: "chuc-ba", label: "Chúc Tết bà" },
    { id: "mam-ngu-qua", label: "Phụ mẹ bày mâm ngũ quả" },
    { id: "banh-tet", label: "Canh nồi bánh tét cùng cha" },
    { id: "ngam-mai", label: "Ngắm cây mai trước sân" },
  ],

  interactions: [
    {
      id: "altar",
      action: "pray",
      label: "Thắp hương",
      at: [L.altar[0], L.altar[1] + 1.6],
      radius: 1.9,
      focus: L.altar,
      quest: "thap-huong",
      effect: "incense",
      lines: [
        {
          who: "",
          text: "Gian giữa thơm mùi trầm. Trên bàn thờ là di ảnh ông bà tổ tiên, bát hương và đôi đèn.",
        },
        {
          who: "Dĩ",
          text: "(thắp ba nén hương, khấn thầm) Con kính mời ông bà tổ tiên về ăn Tết cùng con cháu.",
        },
        {
          who: "",
          text: "Ba làn khói mảnh bay lên, chậm rãi như năm mới vừa bắt đầu.",
        },
      ],
    },
    {
      id: "talk-ong",
      action: "receive",
      label: "Chúc Tết ông",
      npc: "ong",
      at: [L.grandpa[0] + 0.2, L.grandpa[1] + 1.7],
      radius: 1.8,
      quest: "chuc-ong",
      effect: "lixi-ong",
      reward: "Nhận một bao lì xì đỏ",
      lines: [
        {
          who: "Dĩ",
          text: "Con chúc ông năm mới mạnh khỏe, sống lâu trăm tuổi ạ!",
        },
        {
          who: "Ông",
          text: "Ờ, cháu ngoan. Năm nay ráng học cho giỏi nghe con.",
        },
        { who: "Ông", text: "Lì xì đầu năm nè. Lấy hên cả năm." },
      ],
    },
    {
      id: "talk-ba",
      action: "receive",
      label: "Chúc Tết bà",
      npc: "ba-noi",
      at: L.grandma,
      radius: 1.7,
      quest: "chuc-ba",
      effect: "lixi-ba",
      reward: "Nhận thêm một bao lì xì",
      lines: [
        {
          who: "Dĩ",
          text: "Con chúc bà năm mới an khang, lúc nào cũng vui ạ!",
        },
        {
          who: "Bà",
          text: "Cháu của bà lớn nhanh quá. Mới đó mà cao tới vai bà rồi.",
        },
        { who: "Bà", text: "Cầm lấy, mua sách mà đọc. Đừng để mất nghe con." },
      ],
    },
    {
      id: "talk-me",
      action: "receive",
      label: "Phụ mẹ",
      npc: "me",
      at: L.mom,
      radius: 1.8,
      quest: "mam-ngu-qua",
      effect: "fruit",
      lines: [
        { who: "Mẹ", text: "Con phụ mẹ bưng mâm ngũ quả lên bàn thờ nghe." },
        {
          who: "Mẹ",
          text: "Mãng cầu, sung, dừa, đu đủ, xoài: cầu cho cả nhà vừa đủ xài.",
        },
        { who: "Dĩ", text: "Dạ, để con bưng, con đi chậm thôi!" },
        { who: "", text: "Mâm trái cây được đặt ngay ngắn giữa gian thờ." },
      ],
    },
    {
      id: "talk-cha",
      action: "crouch",
      label: "Canh nồi bánh",
      npc: "cha",
      at: L.dad,
      radius: 1.9,
      quest: "banh-tet",
      effect: "banh-tet",
      lines: [
        {
          who: "Cha",
          text: "Nồi bánh tét này nấu từ chiều ba mươi tới giờ đó con.",
        },
        { who: "Cha", text: "Phải giữ lửa cho đều thì bánh mới rền, mới dẻo." },
        { who: "Dĩ", text: "Con thêm củi nghe cha!" },
        {
          who: "Cha",
          text: "Ừ, đẩy nhẹ vô thôi. Chút nữa vớt bánh, con cắt đòn đầu tiên.",
        },
      ],
    },
    {
      id: "mai",
      action: "point",
      label: "Ngắm mai",
      at: [L.mai[0] + 1.2, L.mai[1] + 1.0],
      radius: 1.8,
      focus: L.mai,
      quest: "ngam-mai",
      effect: "mai",
      lines: [
        { who: "", text: "Cây mai nở vàng đúng sáng mùng Một." },
        { who: "", text: "Người quê hay nói: mai nở đẹp thì cả năm may mắn." },
        { who: "Dĩ", text: "Năm nay chắc là một năm đẹp lắm." },
      ],
    },
    {
      id: "talk-cousins",
      label: "Nói chuyện với em họ",
      npc: "em-ho-1",
      at: [L.mat[0], L.mat[1] + 0.2],
      radius: 1.9,
      lines: [
        { who: "Em họ", text: "Anh Dĩ ơi, ra chơi bầu cua với tụi em đi!" },
        { who: "Dĩ", text: "Đợi anh chúc Tết ông bà xong rồi anh ra nghe." },
        {
          who: "Em họ",
          text: "Nhanh nhanh nha, tụi em giữ chỗ cho anh rồi đó!",
        },
      ],
    },
    {
      id: "talk-neighbor",
      label: "Chào cô hàng xóm",
      npc: "co-hang-xom",
      at: L.neighbor,
      radius: 1.8,
      lines: [
        {
          who: "Cô hàng xóm",
          text: "Chúc Tết cả nhà! Năm mới phát tài phát lộc nghe!",
        },
        { who: "Dĩ", text: "Dạ, con chúc cô năm mới vui vẻ, mạnh khỏe ạ!" },
      ],
    },
  ],

  obstacles: [
    // house walls (front is open, the hall is walkable)
    { kind: "box", min: [-6.3, -10.2], max: [6.3, -9.75] },
    { kind: "box", min: [-6.3, -10.2], max: [-5.75, -4.2] },
    { kind: "box", min: [5.75, -10.2], max: [6.3, -4.2] },
    // front columns
    { kind: "circle", at: [-5.6, -4.1], r: 0.25 },
    { kind: "circle", at: [-1.9, -4.1], r: 0.25 },
    { kind: "circle", at: [1.9, -4.1], r: 0.25 },
    { kind: "circle", at: [5.6, -4.1], r: 0.25 },
    // altar + tea table
    { kind: "box", min: [-1.7, -9.8], max: [1.7, -8.45] },
    { kind: "circle", at: L.teaTable, r: 0.95 },
    { kind: "circle", at: L.grandpa, r: 0.5 },
    { kind: "circle", at: L.grandma, r: 0.45 },
    // yard
    { kind: "circle", at: L.mai, r: 1.0 },
    { kind: "circle", at: L.kumquats[0], r: 0.55 },
    { kind: "circle", at: L.kumquats[1], r: 0.55 },
    { kind: "box", min: [4.4, -2.5], max: [5.8, -1.5] },
    { kind: "circle", at: L.mom, r: 0.4 },
    { kind: "circle", at: L.fire, r: 1.15 },
    { kind: "circle", at: L.dad, r: 0.45 },
    { kind: "circle", at: L.cousins[0], r: 0.35 },
    { kind: "circle", at: L.cousins[1], r: 0.35 },
    { kind: "circle", at: L.neighbor, r: 0.45 },
    { kind: "circle", at: L.well, r: 1.0 },
    // gate pillars
    { kind: "circle", at: [-1.9, 10], r: 0.35 },
    { kind: "circle", at: [1.9, 10], r: 0.35 },
  ],

  extras: [
    {
      id: "nguoi-di-chuc-tet",
      look: {
        shirt: "#c0392b",
        pants: "#2a2a2e",
        hair: "bun",
        longShirt: true,
      },
      at: [-14, 11.6],
      movement: {
        kind: "route",
        points: [
          [14, 11.6],
          [-14, 11.6],
        ],
        speed: 0.9,
        pause: [3, 6],
        ignorePlayer: true,
      },
    },
    {
      id: "xe-dap-cho-mai",
      look: { shirt: "#3e6b8a", pants: "#2b2b2b", hair: "short" },
      at: [15, 12.4],
      bicycle: true,
      movement: {
        kind: "route",
        points: [
          [-15, 12.4],
          [15, 12.4],
        ],
        speed: 2.4,
        pause: [3, 7],
        ignorePlayer: true,
      },
    },
  ],
  animals: [
    {
      id: "cho-nha",
      kind: "dog",
      at: [3.2, 4.4],
      color: "#8a5a2b",
      follow: true,
      movement: { kind: "wander", radius: 3.5, speed: 1.3 },
    },
    {
      id: "meo-hien",
      kind: "cat",
      at: [-5.0, -3.4],
      color: "#f3efe6",
      movement: { kind: "wander", radius: 0.6, speed: 0.35, pause: [6, 12] },
    },
  ],

  intro: [
    {
      who: "",
      text: "Sáng mùng Một. Cả nhà dậy sớm, khói hương thơm từ gian giữa lan ra tới cổng.",
    },
    {
      who: "",
      text: "Hôm nay Dĩ có vài việc nhỏ để làm. Đi quanh nhà, gặp mọi người và đón một cái Tết quê nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Một cái Tết trọn vẹn: khói hương, bao lì xì đỏ, mâm ngũ quả và những lời chúc.",
    },
    {
      who: "",
      text: "Những điều nhỏ ấy, Dĩ mang theo suốt những chặng đường sau này.",
    },
  ],

  sky: {
    top: "#f6d5b3",
    bottom: "#fdf0e2",
    fog: "#f8e6d4",
    sun: "#ffdcae",
    sunIntensity: 3.0,
    ambient: 1.05,
  },
};
