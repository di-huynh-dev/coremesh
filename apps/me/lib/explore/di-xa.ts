import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Đi xa" — chiều tà ở ga Phù Cát, ngày rời quê vào TP. Hồ Chí Minh.
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 *
 * The chapter diorama sits at the origin (carriage on the track at z -2,
 * platform z -0.6..0.8, suitcase at -2.65,0.95, signpost at 3.5,1; walking
 * lane z 2.15). The track is extended across the whole map and blocked off;
 * the station building, family, vendors and the waiting area surround it.
 */
export const DI_XA_LAYOUT = {
  /** Rails run along x at this z; the strip between minZ/maxZ is off-limits. */
  track: { z: -2, minZ: -3.1, maxZ: -0.95 },
  station: { center: [-11.6, 3.9] as Vec2, width: 7, depth: 3.2 },
  ticketCounter: [-9.4, 6.35] as Vec2,
  ticketSeller: [-9.4, 5.85] as Vec2,
  dad: [-4.4, 5.6] as Vec2,
  mom: [-1.2, 5.8] as Vec2,
  momBag: [-0.5, 5.95] as Vec2,
  /** Where the home-food bag ends up: next to the suitcase on the platform. */
  bagOnPlatform: [-1.95, 1.0] as Vec2,
  /** Door of the diorama carriage (between its 4th and 5th windows). */
  trainDoor: [1.08, -1.0] as Vec2,
  /** Locomotive stops coupled to the east end of the diorama carriage. */
  loco: [6.1, -2] as Vec2,
  staff: [8.6, 1.4] as Vec2,
  stall: [10.2, 6.2] as Vec2,
  vendor: [10.2, 5.35] as Vec2,
  traveller: [13.0, 2.9] as Vec2,
  canopy: { minX: 6.4, maxX: 16.2 },
  lamps: [
    [-16.2, 1.3],
    [-7.0, 1.3],
    [6.0, 1.45],
    [16.4, 1.3],
  ] as Vec2[],
};
const L = DI_XA_LAYOUT;

export const diXaMap: ExploreMapData = {
  id: "di-xa",
  chapterId: "di-xa",
  title: "Đi xa",
  subtitle: "Chiều tà ở ga Phù Cát",
  spawn: [-6.5, 9.0],
  bounds: { min: [-17, -1], max: [17, 10] },

  npcs: [
    {
      id: "ban-ve",
      name: "Cô bán vé",
      at: L.ticketSeller,
      look: {
        shirt: "#2e5b8a",
        pants: "#1f2a44",
        hair: "bun",
        hairColor: "#1d1a18",
      },
    },
    {
      id: "cha",
      name: "Cha",
      at: L.dad,
      facing: 0.3,
      look: {
        shirt: "#8a6a46",
        pants: "#2b2b2b",
        hair: "short",
        hairColor: "#2a2622",
      },
    },
    {
      id: "me",
      name: "Mẹ",
      at: L.mom,
      facing: -0.3,
      look: {
        shirt: "#5b7f5a",
        pants: "#2a2a2e",
        hair: "bun",
        hairColor: "#1d1a18",
        longShirt: true,
      },
    },
    {
      id: "nhan-vien",
      name: "Chú nhân viên nhà ga",
      at: L.staff,
      facing: -0.2,
      look: {
        shirt: "#e4ddc8",
        pants: "#24324e",
        hair: "crop",
        hairColor: "#3a3530",
      },
    },
    {
      id: "co-ban-banh",
      name: "Cô bán bánh",
      at: L.vendor,
      look: {
        shirt: "#b85a3a",
        pants: "#2a2a2e",
        hair: "bun",
        hat: "non-la",
      },
    },
    {
      id: "ban-dong-huong",
      name: "Bạn đồng hương",
      at: L.traveller,
      pose: "sit",
      facing: -0.5,
      look: {
        shirt: "#3f7f8f",
        pants: "#3a3a3a",
        hair: "short",
        height: 0.97,
      },
    },
  ],

  quests: [
    { id: "mua-ve", label: "Mua vé tàu vào TP. Hồ Chí Minh" },
    { id: "loi-cha", label: "Nghe cha dặn dò" },
    { id: "qua-me", label: "Nhận túi đồ ăn mẹ gói" },
    { id: "mua-banh", label: "Mua bánh quê mang theo" },
    { id: "tau-den", label: "Hỏi giờ tàu, chờ tàu vào ga" },
    { id: "len-tau", label: "Lên tàu" },
  ],

  interactions: [
    {
      id: "talk-ban-ve",
      label: "Mua vé tàu",
      npc: "ban-ve",
      at: [L.ticketSeller[0], L.ticketSeller[1] + 1.75],
      radius: 1.9,
      quest: "mua-ve",
      effect: "ve",
      reward: "Tấm vé đi TP. Hồ Chí Minh",
      lines: [
        { who: "Dĩ", text: "Dạ, cô bán cho con một vé vào TP. Hồ Chí Minh ạ." },
        {
          who: "Cô bán vé",
          text: "Vé ngồi chuyến chiều nay nghe. Đi học hả con? Giữ vé cho kỹ, lên tàu soát vé đó.",
        },
        { who: "Dĩ", text: "Dạ, con vào nhập học. Con cảm ơn cô." },
      ],
    },
    {
      id: "talk-cha",
      label: "Nói chuyện với cha",
      npc: "cha",
      at: [L.dad[0], L.dad[1] + 1.3],
      radius: 1.9,
      quest: "loi-cha",
      lines: [
        {
          who: "Cha",
          text: "Vô trong đó tự lo cho mình nghe con. Ăn uống đàng hoàng, đừng thức khuya quá.",
        },
        {
          who: "Cha",
          text: "Học cái gì thì học cho tới nơi tới chốn. Thiếu gì thì gọi về nhà.",
        },
        {
          who: "Dĩ",
          text: "Dạ, con nhớ rồi. Cha ở nhà giữ sức khỏe nghe cha.",
        },
      ],
    },
    {
      id: "talk-me",
      label: "Ôm mẹ",
      npc: "me",
      at: [L.mom[0], L.mom[1] + 1.3],
      radius: 1.9,
      quest: "qua-me",
      effect: "qua-que",
      reward: "Túi đồ ăn mẹ gói",
      lines: [
        {
          who: "Mẹ",
          text: "Mẹ gói cho con ít bánh tráng, hũ ruốc với mấy trái chuối. Vô trong đó đói thì ăn.",
        },
        { who: "Dĩ", text: "Mẹ ơi, nhiều quá… Con mang không hết đâu." },
        {
          who: "",
          text: "Mẹ ôm Dĩ thật lâu, rồi tự tay xách túi đồ đặt cạnh chiếc vali.",
        },
      ],
    },
    {
      id: "talk-co-ban-banh",
      label: "Mua bánh",
      npc: "co-ban-banh",
      at: [L.stall[0], L.stall[1] + 1.3],
      radius: 1.9,
      quest: "mua-banh",
      reward: "Một chục bánh ít lá gai",
      lines: [
        {
          who: "Cô bán bánh",
          text: "Bánh ít lá gai nè con, mới hấp chiều nay. Mua mang vô cho bạn bè ăn thử bánh quê mình.",
        },
        { who: "Dĩ", text: "Dạ, cô lấy cho con một chục." },
        {
          who: "Cô bán bánh",
          text: "Đi đường bình an nghe con. Nhớ quê thì về!",
        },
      ],
    },
    {
      id: "talk-nhan-vien",
      label: "Hỏi giờ tàu",
      npc: "nhan-vien",
      at: [L.staff[0], L.staff[1] + 1.3],
      radius: 1.9,
      quest: "tau-den",
      effect: "tau-den",
      lines: [
        {
          who: "Dĩ",
          text: "Chú ơi, tàu vào TP. Hồ Chí Minh sắp tới chưa chú?",
        },
        {
          who: "Chú nhân viên nhà ga",
          text: "Tới rồi đó con. Nghe còi chưa? Đứng lùi sau vạch vàng nghe.",
        },
        {
          who: "",
          text: "Tiếng còi tàu vang dài. Đầu máy chậm rãi vào ga, phả một làn hơi trắng vào ráng chiều.",
        },
      ],
    },
    {
      id: "board",
      label: "Lên tàu",
      at: [L.trainDoor[0], 1.1],
      focus: L.trainDoor,
      radius: 1.9,
      quest: "len-tau",
      effect: "mo-cua",
      reward: "Hành trình mới bắt đầu",
      lines: [
        {
          who: "",
          text: "Cửa toa mở. Đèn trong toa vàng ấm, người lên người xuống tấp nập.",
        },
        {
          who: "Dĩ",
          text: "(quay lại vẫy tay) Con đi nghe cha, mẹ! Tới nơi con gọi về liền.",
        },
        {
          who: "",
          text: "Tàu lăn bánh. Sân ga nhỏ dần, nhưng cái vẫy tay của cha mẹ thì Dĩ nhớ mãi.",
        },
      ],
    },
    {
      id: "talk-ban-dong-huong",
      label: "Chào bạn đồng hương",
      npc: "ban-dong-huong",
      at: [L.traveller[0] - 0.6, L.traveller[1] + 1.25],
      radius: 1.9,
      lines: [
        {
          who: "Bạn đồng hương",
          text: "Ông cũng vô Sài Gòn học hả? Tui cũng vậy, lần đầu đi xa nhà luôn.",
        },
        { who: "Dĩ", text: "Vậy là có bạn đi chung rồi. Hồi hộp ghê ha." },
        {
          who: "Bạn đồng hương",
          text: "Ừ. Mà nghĩ tới chuyện được học cái mình thích là thấy háo hức lắm.",
        },
      ],
    },
  ],

  // The rail bed: nobody walks on the tracks.
  obstacles: [
    {
      kind: "box",
      min: [-18, L.track.minZ],
      max: [18, L.track.maxZ],
    },
  ],

  intro: [
    {
      who: "",
      text: "Chiều cuối hè, ga Phù Cát nhuộm màu ráng đỏ. Chuyến tàu vào TP. Hồ Chí Minh sắp tới.",
    },
    {
      who: "",
      text: "Hôm nay Dĩ rời quê đi học. Mua vé, chào cha mẹ và chuẩn bị lên đường nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Một tấm vé, một chiếc vali và túi đồ ăn mẹ gói: hành lý có cả một miền quê.",
    },
    {
      who: "",
      text: "Phù Cát lùi dần sau cửa sổ toa tàu. Phía trước là một thành phố mới, một chặng đường mới.",
    },
  ],

  sky: {
    top: "#c98f86",
    bottom: "#f7c99a",
    fog: "#ebb894",
    sun: "#ff9f5c",
    sunIntensity: 2.1,
    ambient: 0.85,
    hemi: 0.9,
    hemiSky: "#f2b9a0",
  },
};
