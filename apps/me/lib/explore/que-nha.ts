import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Quê nhà" — một buổi sáng sớm ở Cát Nhơn.
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 *
 * The chapter diorama sits at the origin (house at -2.2,-1.65; rice paddy at
 * 3.35,-0.55; walking lane z 2.15). Everything below surrounds it.
 */
export const QUE_NHA_LAYOUT = {
  grandpaBench: [-8.6, -4.6] as Vec2,
  grandpa: [-8.6, -5.25] as Vec2,
  coop: [-11.5, 2.4] as Vec2,
  mom: [-9.0, 1.1] as Vec2,
  kidKite: [1.8, 7.6] as Vec2,
  dad: [10.6, 0.6] as Vec2,
  buffalo: [13.4, -1.8] as Vec2,
  pond: [7.4, 7.4] as Vec2,
  well: [-6.4, 7.2] as Vec2,
  neighbors: [
    [-13.5, -6.2],
    [11.8, -7.4],
  ] as Vec2[],
};
const L = QUE_NHA_LAYOUT;

export const queNhaMap: ExploreMapData = {
  id: "que-nha",
  chapterId: "que-nha",
  title: "Quê nhà",
  subtitle: "Bình minh ở Cát Nhơn",
  spawn: [0, 2.15],
  bounds: { min: [-17, -9], max: [17, 10] },

  npcs: [
    {
      id: "ong",
      activity: "drink",
      name: "Ông",
      at: L.grandpa,
      pose: "sit",
      look: {
        shirt: "#e9e2d0",
        pants: "#3a3a3a",
        hair: "crop",
        hairColor: "#d9d6cf",
        height: 0.93,
        beard: true,
      },
    },
    {
      id: "me",
      activity: "sweep",
      movement: { kind: "wander", radius: 1.4, speed: 0.7, pause: [3, 7] },
      name: "Mẹ",
      at: L.mom,
      facing: -0.8,
      look: {
        shirt: "#5b7f5a",
        pants: "#2a2a2e",
        hair: "bun",
        hat: "non-la",
        longShirt: true,
      },
    },
    {
      id: "ban",
      activity: "play",
      movement: { kind: "wander", radius: 2.2, speed: 1.6, pause: [1, 3] },
      name: "Bạn hàng xóm",
      at: L.kidKite,
      facing: 2.6,
      look: { shirt: "#2e6f8e", pants: "#3a3a3a", hair: "short", height: 0.7 },
    },
    {
      id: "cha",
      activity: "hoe",
      name: "Cha",
      at: L.dad,
      facing: -1.2,
      look: {
        shirt: "#8a6a46",
        pants: "#2b2b2b",
        hair: "short",
        hat: "non-la",
      },
    },
  ],

  quests: [
    { id: "chao-ong", label: "Chào ông buổi sáng" },
    { id: "cho-ga", label: "Phụ mẹ cho gà ăn" },
    { id: "tha-dieu", label: "Thả diều cùng bạn" },
    { id: "ra-dong", label: "Ra đồng với cha" },
    { id: "ao-sen", label: "Ngắm ao sen đầu xóm" },
  ],

  interactions: [
    {
      id: "talk-ong",
      label: "Chào ông",
      npc: "ong",
      at: [L.grandpa[0] + 0.3, L.grandpa[1] + 1.9],
      radius: 1.9,
      quest: "chao-ong",
      lines: [
        { who: "Dĩ", text: "Con chào ông! Ông dậy sớm vậy?" },
        {
          who: "Ông",
          text: "Già rồi, gà gáy là thức. Ngồi đây uống ấm trà, nhìn trời sáng dần cũng vui.",
        },
        {
          who: "Ông",
          text: "Con ra phụ mẹ đi, rồi chiều ông kể chuyện cho nghe.",
        },
      ],
    },
    {
      id: "talk-me",
      action: "crouch",
      label: "Phụ mẹ cho gà ăn",
      npc: "me",
      at: L.mom,
      radius: 1.9,
      quest: "cho-ga",
      effect: "feed",
      lines: [
        {
          who: "Mẹ",
          text: "Con rải lúa cho gà giùm mẹ. Rải đều tay, đừng đổ một chỗ.",
        },
        { who: "Dĩ", text: "Gà ơi, ra ăn nè! Cục cục cục…" },
        {
          who: "",
          text: "Cả bầy gà chạy ùa tới, mổ lúa lách tách quanh chân.",
        },
      ],
    },
    {
      id: "talk-ban",
      action: "point",
      label: "Thả diều",
      npc: "ban",
      at: L.kidKite,
      radius: 1.9,
      quest: "tha-dieu",
      effect: "kite",
      lines: [
        {
          who: "Bạn hàng xóm",
          text: "Dĩ ơi, gió lên rồi! Cầm dây giùm tao, tao chạy cho diều lên.",
        },
        { who: "Dĩ", text: "Chạy đi! Thả dây từ từ thôi…" },
        {
          who: "",
          text: "Con diều giấy chao một vòng rồi vút lên cao, nhỏ dần giữa trời sáng.",
        },
      ],
    },
    {
      id: "talk-cha",
      action: "nod",
      label: "Ra đồng với cha",
      npc: "cha",
      at: L.dad,
      radius: 1.9,
      quest: "ra-dong",
      lines: [
        {
          who: "Cha",
          text: "Ra đây coi nè con. Lúa đang thì con gái, xanh mướt vậy đó.",
        },
        {
          who: "Cha",
          text: "Làm ruộng phải kiên nhẫn. Gieo hôm nay, mấy tháng sau mới gặt.",
        },
        { who: "Dĩ", text: "Dạ. Mai mốt con lớn con phụ cha gặt lúa nghe." },
      ],
    },
    {
      id: "pond",
      action: "point",
      label: "Ngắm ao sen",
      at: [L.pond[0] - 2.6, L.pond[1] - 0.6],
      focus: L.pond,
      radius: 2.0,
      quest: "ao-sen",
      effect: "lotus",
      lines: [
        {
          who: "",
          text: "Ao sen đầu xóm vừa nở mấy bông hồng nhạt, hương thoang thoảng trong sương sớm.",
        },
        { who: "Dĩ", text: "Mai mình rủ tụi bạn ra đây hái đài sen." },
      ],
    },
  ],

  obstacles: [{ kind: "circle", at: L.pond, r: 2.2 }],

  extras: [
    {
      id: "nguoi-dap-xe",
      look: {
        shirt: "#e7e2d6",
        pants: "#3a3a3a",
        hair: "short",
        hat: "non-la",
      },
      at: [-16, 2.75],
      bicycle: true,
      movement: {
        kind: "route",
        points: [
          [16, 2.75],
          [-16, 2.75],
        ],
        speed: 2.6,
        pause: [2, 5],
        ignorePlayer: true,
      },
    },
    {
      id: "ba-ganh-hang",
      look: {
        shirt: "#7a5a8a",
        pants: "#2a2a2e",
        hair: "bun",
        hat: "non-la",
        height: 0.95,
      },
      at: [-7.7, 1.2],
      activity: "carry",
      movement: {
        kind: "route",
        points: [
          [-7.7, -3.6],
          [-7.7, 1.2],
          [-13.5, 1.2],
        ],
        speed: 0.8,
        pause: [2, 4],
      },
    },
  ],
  animals: [
    {
      id: "cho-vang",
      kind: "dog",
      at: [2.2, 4.6],
      follow: true,
      movement: { kind: "wander", radius: 3, speed: 1.4 },
    },
    {
      id: "meo",
      kind: "cat",
      at: [-4.1, 0.75],
      facing: 0.4,
      movement: { kind: "wander", radius: 0.8, speed: 0.4, pause: [6, 12] },
    },
    {
      id: "vit-1",
      kind: "duck",
      at: [4.9, 7.4],
      movement: {
        kind: "route",
        points: [
          [7.4, 4.9],
          [9.9, 7.4],
          [7.4, 9.7],
          [4.9, 7.4],
        ],
        speed: 0.55,
        pause: [0.2, 0.8],
      },
    },
    {
      id: "vit-2",
      kind: "duck",
      at: [7.4, 4.9],
      movement: {
        kind: "route",
        points: [
          [9.9, 7.4],
          [7.4, 9.7],
          [4.9, 7.4],
          [7.4, 4.9],
        ],
        speed: 0.55,
        pause: [0.2, 0.8],
      },
    },
    {
      id: "vit-3",
      kind: "duck",
      at: [9.9, 7.4],
      movement: {
        kind: "route",
        points: [
          [7.4, 9.7],
          [4.9, 7.4],
          [7.4, 4.9],
          [9.9, 7.4],
        ],
        speed: 0.55,
        pause: [0.2, 0.8],
      },
    },
    {
      id: "ga-mai",
      kind: "chicken",
      at: [-10.6, 5.2],
      movement: { kind: "wander", radius: 1.6, speed: 0.6 },
    },
    {
      id: "ga-trong",
      kind: "chicken",
      color: "#c0392b",
      at: [-12.4, 4.4],
      movement: { kind: "wander", radius: 1.6, speed: 0.6 },
    },
    {
      id: "chim-se-1",
      kind: "bird",
      at: [3.4, 6.2],
      movement: { kind: "wander", radius: 2.5, speed: 2.4, pause: [2, 6] },
    },
    {
      id: "chim-se-2",
      kind: "bird",
      at: [-1.8, 7.8],
      movement: { kind: "wander", radius: 2.5, speed: 2.4, pause: [2, 6] },
    },
  ],

  intro: [
    {
      who: "",
      text: "Trời vừa hửng sáng ở Cát Nhơn. Gà gáy, khói bếp bay lên từ mấy mái nhà trong xóm.",
    },
    {
      who: "",
      text: "Đi một vòng quanh xóm, chào mọi người và bắt đầu một ngày ở quê nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Một buổi sáng rất bình thường ở quê: ấm trà của ông, bầy gà của mẹ, con diều và cánh đồng của cha.",
    },
    {
      who: "",
      text: "Sau này đi xa, Dĩ mới hiểu những buổi sáng bình thường ấy quý đến nhường nào.",
    },
  ],

  sky: {
    top: "#f2cfae",
    bottom: "#fbefe2",
    fog: "#f6e2cf",
    sun: "#ffcf9e",
    sunIntensity: 2.8,
    ambient: 1.05,
  },
};
