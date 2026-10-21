import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Biển quê" — trưa nắng trên bãi biển Phù Cát.
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 *
 * The chapter diorama sits at the origin (basket boats at -2.6,-1.1, net rack
 * at -4.7,0.45, sandcastle at 2.4,0.55; walking lane z 2.15). The sea covers
 * everything north of the shoreline (z < -2.4) and is a data obstacle.
 */
export const BIEN_QUE_LAYOUT = {
  shoreZ: -2.4,
  boatSea: [-7.4, -7.0] as Vec2,
  boatBeach: [-9.5, -1.0] as Vec2,
  fisherman: [-12.6, -1.0] as Vec2,
  fisherman2: [-14.4, -0.1] as Vec2,
  netHeap: [-13.6, -2.0] as Vec2,
  hut: [-13.5, 5.4] as Vec2,
  elder: [-13.5, 5.6] as Vec2,
  vendor: [9.0, 4.2] as Vec2,
  racks: [
    [12.7, 4.9],
    [14.5, 4.9],
  ] as Vec2[],
  kid: [6.0, 7.0] as Vec2,
  castle: [7.3, 6.7] as Vec2,
  shells: [11.2, -1.6] as Vec2,
};
const L = BIEN_QUE_LAYOUT;

export const bienQueMap: ExploreMapData = {
  id: "bien-que",
  chapterId: "bien-que",
  title: "Biển quê",
  subtitle: "Trưa nắng trên bãi biển Phù Cát",
  spawn: [0, 2.6],
  bounds: { min: [-17, -8], max: [17, 10] },

  npcs: [
    {
      id: "chu-ngu-dan",
      name: "Chú ngư dân",
      at: L.fisherman,
      facing: -2.6,
      look: {
        shirt: "#3e6b8a",
        pants: "#2b2b2b",
        hair: "short",
        hat: "non-la",
      },
    },
    {
      id: "bac-ngu-dan",
      name: "Bác ngư dân",
      at: L.fisherman2,
      facing: -2.7,
      look: {
        shirt: "#c9b38a",
        pants: "#3a3a3a",
        hair: "crop",
        hairColor: "#8a8680",
        height: 0.95,
      },
    },
    {
      id: "ong",
      name: "Ông",
      at: L.elder,
      pose: "sit",
      facing: 0.3,
      look: {
        shirt: "#e9e2d0",
        pants: "#3a3a3a",
        hair: "bald",
        hairColor: "#d9d6cf",
        height: 0.92,
        beard: true,
      },
    },
    {
      id: "co-hai-san",
      name: "Cô bán hải sản",
      at: L.vendor,
      facing: 0.2,
      look: {
        shirt: "#d0603e",
        pants: "#2a2a2e",
        hair: "bun",
        hat: "non-la",
        longShirt: true,
      },
    },
    {
      id: "em-nho",
      name: "Em nhỏ",
      at: L.kid,
      facing: 0.7,
      look: {
        shirt: "#f2c14e",
        pants: "#2e6f8e",
        hair: "short",
        height: 0.66,
      },
    },
  ],

  quests: [
    { id: "thuyen-ve", label: "Đón thuyền thúng vào bờ" },
    { id: "keo-luoi", label: "Phụ ngư dân kéo lưới" },
    { id: "phoi-ca", label: "Phụ cô trải cá lên giàn phơi" },
    { id: "nhat-so", label: "Nhặt vỏ sò trên cát ướt" },
    { id: "lau-dai", label: "Đắp lâu đài cát với em nhỏ" },
  ],

  interactions: [
    {
      id: "boat",
      label: "Vẫy thuyền vào bờ",
      at: [L.boatSea[0], -1.9],
      focus: L.boatSea,
      radius: 2.0,
      quest: "thuyen-ve",
      effect: "thuyen-ve",
      lines: [
        {
          who: "",
          text: "Ngoài khơi, một chiếc thuyền thúng chòng chành theo con sóng, đang chèo dần vào bờ.",
        },
        { who: "Dĩ", text: "Chú ơi! Vô chỗ này nè, cát thoải dễ kéo lắm!" },
        {
          who: "",
          text: "Chiếc thúng xoay mấy vòng rồi trườn lên bãi cát. Trong khoang đầy cá nục, cá cơm còn tươi rói.",
        },
      ],
    },
    {
      id: "talk-ngu-dan",
      label: "Kéo lưới",
      npc: "chu-ngu-dan",
      at: [L.fisherman[0] + 0.9, L.fisherman[1] + 1.2],
      radius: 1.9,
      quest: "keo-luoi",
      effect: "luoi-ca",
      lines: [
        {
          who: "Chú ngư dân",
          text: "Dĩ, phụ chú một tay! Kéo đều theo nhịp nghe con: một, hai… kéo!",
        },
        { who: "Dĩ", text: "Nặng quá chú ơi… dô ta!" },
        {
          who: "Bác ngư dân",
          text: "Lưới về rồi! Bữa nay biển thương, cá nhiều lắm đó.",
        },
        {
          who: "",
          text: "Tấm lưới ướt được kéo lên bãi, cá nhảy lách tách bạc trắng cả một khoảng cát.",
        },
      ],
    },
    {
      id: "talk-co",
      label: "Phụ phơi cá",
      npc: "co-hai-san",
      at: [L.vendor[0] + 0.5, L.vendor[1] + 1.9],
      radius: 1.9,
      quest: "phoi-ca",
      effect: "phoi-ca",
      reward: "Một xâu mực nướng thơm lừng",
      lines: [
        {
          who: "Cô bán hải sản",
          text: "Con phụ cô trải cá lên giàn giùm nghe. Nắng gắt vầy, chiều là khô rang.",
        },
        { who: "Dĩ", text: "Dạ, xếp cho thẳng hàng phải không cô?" },
        {
          who: "Cô bán hải sản",
          text: "Ừ, giỏi quá! Cầm xâu mực nướng nè, ăn cho có sức mà chơi.",
        },
      ],
    },
    {
      id: "shells",
      label: "Nhặt vỏ sò",
      at: [L.shells[0], L.shells[1] + 1.2],
      focus: L.shells,
      radius: 1.9,
      quest: "nhat-so",
      effect: "vo-so",
      lines: [
        {
          who: "",
          text: "Sóng vừa rút, để lại trên cát ướt mấy vỏ sò, vỏ ốc đủ màu.",
        },
        {
          who: "Dĩ",
          text: "Con này có sọc hồng nè! Để dành gắn lên lâu đài cát cho đẹp.",
        },
      ],
    },
    {
      id: "talk-em",
      label: "Đắp lâu đài cát",
      npc: "em-nho",
      at: [L.kid[0] - 0.4, L.kid[1] + 1.2],
      radius: 1.9,
      quest: "lau-dai",
      effect: "lau-dai",
      lines: [
        {
          who: "Em nhỏ",
          text: "Anh Dĩ ơi, lâu đài của em cứ bị sóng làm sập hoài à.",
        },
        {
          who: "Dĩ",
          text: "Mình đắp cao lên, đào thêm cái hào xung quanh là sóng hết phá được.",
        },
        {
          who: "",
          text: "Lâu đài cát cao dần lên: có tháp, có hào, có cả lá cờ nhỏ phất phơ trên đỉnh.",
        },
      ],
    },
    {
      id: "talk-ong",
      label: "Ngồi với ông",
      npc: "ong",
      at: [L.elder[0] + 0.4, L.elder[1] + 1.4],
      radius: 1.9,
      lines: [
        {
          who: "Ông",
          text: "Lưới rách thì vá, thuyền hư thì sửa. Người làng biển mình sống vậy đó con.",
        },
        {
          who: "Ông",
          text: "Con thấy biển rộng không? Bên kia chân trời còn nhiều xứ lắm.",
        },
        {
          who: "Dĩ",
          text: "Dạ… mai mốt lớn, con muốn đi thử một lần cho biết.",
        },
      ],
    },
  ],

  obstacles: [
    // the sea: everything north of the shoreline
    { kind: "box", min: [-30, -40], max: [30, -2.75] },
  ],

  intro: [
    {
      who: "",
      text: "Trưa nắng trên biển Phù Cát. Gió thổi lồng lộng, sóng vỗ rì rào, mấy chiếc thuyền thúng nằm phơi mình trên cát.",
    },
    {
      who: "",
      text: "Đi dọc bãi biển, phụ người làng biển một tay và tìm những điều vui nhỏ trên cát nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Thuyền về, lưới đầy cá, giàn cá phơi thơm mùi nắng và một lâu đài cát gắn đầy vỏ sò.",
    },
    {
      who: "",
      text: "Đứng trước biển, đứa trẻ quê lần đầu hiểu ra: thế giới còn rộng lắm.",
    },
  ],

  sky: {
    top: "#9fd3ec",
    bottom: "#eef7f6",
    fog: "#d6edf1",
    sun: "#fff4d6",
    sunIntensity: 3.4,
    ambient: 1.1,
    hemiSky: "#eaf6fb",
  },
};
