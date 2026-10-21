import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Mùa hè" — một buổi trưa hè ở miền quê Cát Nhơn.
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 *
 * The chapter diorama sits at the origin (stream at x 2.9 with a little
 * bridge at z -0.8, buffalo at -3.15,0.6; walking lane z 2.15). The stream is
 * extended north and south across the whole map; a plank bridge crosses it
 * at z 7.5 and the lane causeway crosses it at z 2.15.
 */
export const MUA_HE_LAYOUT = {
  river: { x: 2.9, half: 1.05 },
  bridgeZ: 7.5,
  grandpa: [-12.2, -4.6] as Vec2,
  bed: [-14.1, -4.9] as Vec2,
  hammock: [-7.5, -7.0] as Vec2,
  herder: [-9.4, 5.0] as Vec2,
  buffalo: [-11.7, 5.4] as Vec2,
  girl: [0.9, 5.4] as Vec2,
  fisher: [5.2, -6.4] as Vec2,
  cart: [9.7, 0.4] as Vec2,
  vendor: [8.5, 0.3] as Vec2,
  kite: [12.5, -5.5] as Vec2,
};
const L = MUA_HE_LAYOUT;
const RX0 = L.river.x - L.river.half;
const RX1 = L.river.x + L.river.half;

export const muaHeMap: ExploreMapData = {
  id: "mua-he",
  chapterId: "mua-he",
  title: "Mùa hè ở quê",
  subtitle: "Trưa hè bên sông",
  spawn: [-0.6, 2.15],
  bounds: { min: [-17, -9], max: [17, 10] },

  npcs: [
    {
      id: "ong",
      name: "Ông",
      at: L.grandpa,
      pose: "sit",
      facing: 0.4,
      look: {
        shirt: "#ece5d2",
        pants: "#3a3a3a",
        hair: "crop",
        hairColor: "#d9d6cf",
        height: 0.93,
        beard: true,
      },
    },
    {
      id: "ban-chan-trau",
      name: "Bạn chăn trâu",
      at: L.herder,
      facing: 0.5,
      look: {
        shirt: "#d9a441",
        pants: "#3a3a3a",
        hair: "short",
        height: 0.7,
        hat: "non-la",
      },
    },
    {
      id: "em-hang-xom",
      name: "Em hàng xóm",
      at: L.girl,
      facing: 1.2,
      look: {
        shirt: "#e07a8a",
        pants: "#2e4a7a",
        hair: "pigtails",
        height: 0.66,
      },
    },
    {
      id: "ban-cau-ca",
      name: "Bạn câu cá",
      at: L.fisher,
      pose: "sit",
      facing: -Math.PI / 2,
      look: {
        shirt: "#3f7f9a",
        pants: "#4a3a2a",
        hair: "crop",
        height: 0.72,
      },
    },
    {
      id: "chu-ca-rem",
      name: "Chú bán cà rem",
      at: L.vendor,
      facing: 0.5,
      look: {
        shirt: "#f1ede2",
        pants: "#2b2b2b",
        hair: "short",
        hat: "non-la",
      },
    },
  ],

  quests: [
    { id: "bong-tre", label: "Hóng mát dưới bóng tre với ông" },
    { id: "nghe-ve", label: "Nằm võng nghe ve kêu" },
    { id: "chan-trau", label: "Dắt trâu cùng bạn" },
    { id: "thuyen-giay", label: "Thả thuyền giấy xuống sông" },
    { id: "cau-ca", label: "Câu cá bên bờ sông" },
    { id: "ca-rem", label: "Mua cây cà rem giữa trưa" },
  ],

  interactions: [
    {
      id: "talk-ong",
      label: "Ngồi với ông",
      npc: "ong",
      at: [L.grandpa[0] + 0.4, L.grandpa[1] + 1.3],
      radius: 1.9,
      quest: "bong-tre",
      lines: [
        { who: "Dĩ", text: "Ông ơi, trưa nắng quá, con vô ngồi với ông nghe." },
        {
          who: "Ông",
          text: "Ừ, vô đây. Bụi tre này mát nhất xóm, gió sông thổi lên rì rào cả trưa.",
        },
        {
          who: "Ông",
          text: "Hồi ông nhỏ cũng trốn ngủ trưa ra đây y như tụi con vậy đó.",
        },
      ],
    },
    {
      id: "hammock",
      label: "Nằm võng",
      at: [L.hammock[0], L.hammock[1] + 1.4],
      focus: L.hammock,
      radius: 1.9,
      quest: "nghe-ve",
      effect: "vong",
      lines: [
        {
          who: "",
          text: "Chiếc võng mắc giữa hai gốc cây, đong đưa theo gió. Trên cao, tiếng ve kêu râm ran không dứt.",
        },
        { who: "Dĩ", text: "Nằm một chút thôi… ve kêu nghe buồn ngủ ghê." },
        {
          who: "",
          text: "Võng kẽo kẹt, nắng trưa lọt qua kẽ lá thành từng đốm nhỏ.",
        },
      ],
    },
    {
      id: "talk-chan-trau",
      label: "Dắt trâu",
      npc: "ban-chan-trau",
      at: [L.herder[0] + 0.5, L.herder[1] + 1.2],
      radius: 1.9,
      quest: "chan-trau",
      effect: "trau-theo",
      lines: [
        {
          who: "Bạn chăn trâu",
          text: "Dĩ ơi, tao đi tắm sông chút. Mày dắt con trâu đi giùm tao một vòng nghe!",
        },
        { who: "Dĩ", text: "Nó có húc tao không đó?" },
        {
          who: "Bạn chăn trâu",
          text: "Hiền khô hà. Mày đi trước, nó tự đi theo à.",
        },
        {
          who: "",
          text: "Con trâu khịt mũi một cái rồi lững thững đi theo sau lưng Dĩ.",
        },
      ],
    },
    {
      id: "talk-em",
      label: "Thả thuyền giấy",
      npc: "em-hang-xom",
      at: [L.girl[0] - 0.4, L.girl[1] + 1.2],
      radius: 1.9,
      quest: "thuyen-giay",
      effect: "thuyen-giay",
      lines: [
        {
          who: "Em hàng xóm",
          text: "Anh Dĩ xếp thuyền giấy giùm em đi. Em xếp hoài mà nó cứ bị chìm.",
        },
        {
          who: "Dĩ",
          text: "Gấp đôi tờ giấy, gấp hai góc xuống… rồi mở bụng ra nè.",
        },
        {
          who: "",
          text: "Mấy chiếc thuyền giấy trắng được thả xuống, trôi chầm chậm theo dòng nước dưới chân cầu.",
        },
      ],
    },
    {
      id: "talk-cau-ca",
      label: "Câu cá",
      npc: "ban-cau-ca",
      at: [L.fisher[0] + 0.7, L.fisher[1] + 1.2],
      radius: 1.9,
      quest: "cau-ca",
      effect: "ca-can",
      reward: "Một con cá rô đồng",
      lines: [
        {
          who: "Bạn câu cá",
          text: "Suỵt! Nói nhỏ thôi, cá nó nghe là nó chạy.",
        },
        { who: "Dĩ", text: "Phao nhúc nhích kìa… giật đi, giật đi!" },
        {
          who: "",
          text: "Cần câu cong vút. Một con cá rô quẫy tung bọt nước, lấp lánh dưới nắng trưa.",
        },
      ],
    },
    {
      id: "talk-ca-rem",
      label: "Mua cà rem",
      npc: "chu-ca-rem",
      at: [L.vendor[0] + 0.2, L.vendor[1] + 1.3],
      radius: 1.9,
      quest: "ca-rem",
      reward: "Một cây cà rem đậu xanh",
      lines: [
        {
          who: "",
          text: "Leng keng, leng keng… tiếng chuông xe cà rem vang khắp xóm.",
        },
        {
          who: "Chú bán cà rem",
          text: "Cà rem đây! Đậu xanh, sầu riêng, sữa dừa nè con.",
        },
        {
          who: "Dĩ",
          text: "Chú lấy con một cây đậu xanh. Nắng muốn chảy luôn cây cà rem!",
        },
      ],
    },
  ],

  obstacles: [
    // the stream (flat water) north of the lane, between the lane and the
    // plank bridge, and south of the bridge
    { kind: "box", min: [RX0, -14], max: [RX1, 1.45] },
    { kind: "box", min: [RX0, 2.85], max: [RX1, L.bridgeZ - 1.1] },
    { kind: "box", min: [RX0, L.bridgeZ + 1.1], max: [RX1, 14] },
  ],

  intro: [
    {
      who: "",
      text: "Trưa hè ở quê. Nắng vàng rực, tiếng ve kêu râm ran trên mấy hàng cây ven sông.",
    },
    {
      who: "",
      text: "Người lớn ngủ trưa, còn đám trẻ thì trốn ra bờ sông. Đi một vòng xem hôm nay có gì vui nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Thuyền giấy, con cá rô, cây cà rem và chú trâu hiền: một mùa hè chẳng cần gì nhiều mà vẫn đầy ắp.",
    },
    {
      who: "",
      text: "Có những bài học không nằm trong trang sách, mà nằm ở dòng sông, bóng tre và cánh đồng quê nhà.",
    },
  ],

  sky: {
    top: "#b9def0",
    bottom: "#f4f6e6",
    fog: "#e2efe4",
    sun: "#fff0c4",
    sunIntensity: 3.3,
    ambient: 1.1,
  },
};
