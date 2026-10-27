import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Cội nguồn" — chiều muộn, Dĩ đã lớn trở về quê nhà ở Cát Nhơn.
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 * Chi tiết công việc chỉ lấy từ lib/story.ts (CRM, hơn 10 quốc gia).
 *
 * The chapter diorama sits at the origin (house at -2,-1.7; desk + laptop at
 * -2.6,0.5; suitcase at -3.3,3.5; rice paddy at 3.4,-0.55; walking lane
 * z 2.15). The family yard is to the west, the fields to the east.
 */
export const COI_NGUON_LAYOUT = {
  kitchen: [-10.5, -5.4] as Vec2,
  platform: [-9.6, -1.2] as Vec2,
  dad: [-11.35, -1.2] as Vec2,
  mom: [-7.4, -2.8] as Vec2,
  altar: [-7.2, 0.6] as Vec2,
  laptop: [-2.6, 0.5] as Vec2,
  field: [10.8, -2.3] as Vec2,
  friend: [14.6, 3.4] as Vec2,
  kid: [6.0, 4.8] as Vec2,
  lamps: [
    [-13.6, 1.2],
    [6.8, 1.2],
    [13.0, 1.2],
  ] as Vec2[],
};
const L = COI_NGUON_LAYOUT;

export const coiNguonMap: ExploreMapData = {
  id: "coi-nguon",
  chapterId: "coi-nguon",
  title: "Cội nguồn",
  subtitle: "Chiều muộn, trở về quê nhà",
  spawn: [0.5, 2.4],
  bounds: { min: [-17, -9], max: [17, 10] },

  npcs: [
    {
      id: "cha",
      name: "Cha",
      at: L.dad,
      pose: "sit",
      facing: Math.PI / 2,
      look: {
        shirt: "#7a6a52",
        pants: "#2b2b2b",
        hair: "short",
        hairColor: "#a19c92",
        height: 0.97,
        glasses: true,
      },
    },
    {
      id: "me",
      name: "Mẹ",
      at: L.mom,
      facing: 0.5,
      look: {
        shirt: "#6b4f7a",
        pants: "#2a2a2e",
        hair: "bun",
        hairColor: "#8d8780",
        height: 0.95,
        longShirt: true,
      },
    },
    {
      id: "ban-cu",
      name: "Bạn cũ",
      at: L.friend,
      facing: -1.0,
      look: {
        shirt: "#4f7a5a",
        pants: "#3a3a3a",
        hair: "short",
        hat: "non-la",
      },
    },
    {
      id: "em-nho",
      name: "Em nhỏ hàng xóm",
      at: L.kid,
      facing: 0.5,
      look: {
        shirt: "#e6b33a",
        pants: "#2e4a7a",
        hair: "crop",
        height: 0.7,
      },
    },
  ],

  quests: [
    { id: "don-mam", label: "Phụ mẹ dọn mâm cơm ra hiên" },
    { id: "ke-chuyen", label: "Kể cha nghe chuyện công việc" },
    { id: "thap-huong", label: "Thắp nén hương trước sân" },
    { id: "dong-lua", label: "Dạo bờ ruộng lúc hoàng hôn" },
    { id: "ban-cu", label: "Gặp lại người bạn cũ" },
    { id: "tha-dieu", label: "Thả lại con diều ngày nhỏ" },
  ],

  interactions: [
    {
      id: "talk-me",
      label: "Phụ mẹ dọn cơm",
      npc: "me",
      at: [L.mom[0] + 0.4, L.mom[1] + 1.2],
      radius: 1.9,
      quest: "don-mam",
      effect: "mam-com",
      lines: [
        {
          who: "Mẹ",
          text: "Về tới rồi hả con? Đi đường xa có mệt không? Rửa tay rồi phụ mẹ bưng mâm ra hiên.",
        },
        {
          who: "Dĩ",
          text: "Dạ, con về rồi nè mẹ. Thơm quá, mẹ nấu canh chua hả?",
        },
        {
          who: "Mẹ",
          text: "Ừ, cá mới mua chợ chiều. Ở trong đó chắc ít khi được ăn cơm nhà.",
        },
        {
          who: "",
          text: "Mâm cơm được đặt lên bộ ván ngoài hiên: nồi cơm nóng, tô canh chua, dĩa cá kho và rổ rau.",
        },
      ],
    },
    {
      id: "talk-cha",
      label: "Ngồi với cha",
      npc: "cha",
      at: [L.dad[0] - 0.4, L.dad[1] + 1.6],
      radius: 1.9,
      quest: "ke-chuyen",
      effect: "den",
      lines: [
        {
          who: "Cha",
          text: "Ngồi xuống đây. Công việc trong đó dạo này sao rồi con?",
        },
        {
          who: "Dĩ",
          text: "Dạ ổn cha. Con làm phần mềm CRM, giúp người ta quản lý khách hàng. Giờ có người dùng ở hơn 10 quốc gia rồi.",
        },
        {
          who: "Cha",
          text: "Cha nghe không hiểu hết, nhưng con làm ra cái người ta cần là cha mừng. Giữ sức khỏe nghe. Thôi, bật đèn hiên lên rồi ăn cơm.",
        },
        {
          who: "",
          text: "Dãy bóng đèn vàng sáng lên dọc hiên nhà, ấm áp như những buổi tối ngày xưa.",
        },
      ],
    },
    {
      id: "altar",
      label: "Thắp hương",
      at: [L.altar[0], L.altar[1] + 1.25],
      focus: L.altar,
      radius: 1.8,
      quest: "thap-huong",
      effect: "huong",
      lines: [
        {
          who: "",
          text: "Trang thờ nhỏ trước sân vẫn ở chỗ cũ, bát hương đã ngả màu theo năm tháng.",
        },
        {
          who: "Dĩ",
          text: "(thắp nén hương) Con về rồi. Con vẫn khỏe, vẫn nhớ nhà.",
        },
        { who: "", text: "Khói hương mỏng bay lên giữa trời chiều vàng ruộm." },
      ],
    },
    {
      id: "field",
      label: "Dạo bờ ruộng",
      at: [9.8, 1.0],
      focus: L.field,
      radius: 2.0,
      quest: "dong-lua",
      effect: "co",
      lines: [
        {
          who: "",
          text: "Hoàng hôn trải dài trên cánh đồng. Gió đưa mùi lúa non thơm ngai ngái.",
        },
        {
          who: "Dĩ",
          text: "Đi bao xa, về tới đây mới thấy lòng mình chậm lại.",
        },
        {
          who: "",
          text: "Một đàn cò trắng giật mình bay lên, chao nghiêng qua mặt ruộng.",
        },
      ],
    },
    {
      id: "talk-ban-cu",
      label: "Chào bạn cũ",
      npc: "ban-cu",
      at: [L.friend[0] - 0.9, L.friend[1] - 1.1],
      radius: 1.9,
      quest: "ban-cu",
      lines: [
        {
          who: "Bạn cũ",
          text: "Ê, Dĩ! Về hồi nào mà không nói tao một tiếng?",
        },
        { who: "Dĩ", text: "Mới về chiều nay nè. Mày vẫn làm ruộng hả?" },
        {
          who: "Bạn cũ",
          text: "Ừ. Mày ở thành phố làm máy tính, tao ở quê làm ruộng. Mỗi đứa một nghề.",
        },
        {
          who: "Dĩ",
          text: "Mà hồi nhỏ chăn trâu, thả diều với nhau, tao nhớ hoài.",
        },
      ],
    },
    {
      id: "talk-em",
      label: "Thả diều",
      npc: "em-nho",
      at: [L.kid[0] + 0.4, L.kid[1] + 1.2],
      radius: 1.9,
      quest: "tha-dieu",
      effect: "dieu-bay",
      lines: [
        {
          who: "Em nhỏ hàng xóm",
          text: "Anh Dĩ ơi, con diều này của anh hồi nhỏ phải hông? Em thấy trên gác bếp.",
        },
        {
          who: "Dĩ",
          text: "Trời, con diều cũ của anh! Để anh buộc lại sợi dây, mình thả thử coi.",
        },
        {
          who: "",
          text: "Gió chiều nổi lên. Con diều cũ chao một vòng rồi vút lên cao, y như hồi nào.",
        },
      ],
    },
    {
      id: "laptop",
      label: "Gập laptop",
      at: [L.laptop[0], 2.15],
      focus: L.laptop,
      radius: 1.6,
      lines: [
        {
          who: "",
          text: "Chiếc laptop vẫn mở trên bàn, màn hình còn mấy dòng code dang dở.",
        },
        { who: "Dĩ", text: "Thôi, để mai làm tiếp. Tối nay là của cha mẹ." },
        {
          who: "",
          text: "Dĩ gập máy lại. Ngoài hiên, tiếng chén đũa đã bắt đầu lách cách.",
        },
      ],
    },
  ],

  obstacles: [],

  intro: [
    {
      who: "",
      text: "Chiều muộn ở Cát Nhơn. Sau những năm học và làm việc ở thành phố, Dĩ xách vali về lại quê nhà.",
    },
    {
      who: "",
      text: "Cha mẹ đã già hơn, nhưng ngôi nhà, cánh đồng và con đường làng vẫn đợi. Đi một vòng, gặp lại mọi người nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Mâm cơm ngoài hiên, nén hương trước sân, ánh đèn vàng và con diều cũ trên trời chiều.",
    },
    {
      who: "",
      text: "Đi thêm bao xa, Dĩ vẫn mang theo nhà. Câu chuyện vẫn đang được viết tiếp.",
    },
  ],

  sky: {
    top: "#eeb486",
    bottom: "#fbe2c2",
    fog: "#f2cda6",
    sun: "#ffb26e",
    sunIntensity: 2.6,
    ambient: 0.95,
    hemi: 1.0,
    hemiSky: "#ffd9b0",
  },
};
