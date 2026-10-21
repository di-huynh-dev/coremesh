import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Cây đa" — buổi chiều tan học dưới gốc đa đầu làng.
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 *
 * The chapter diorama sits at the origin (small banyan at -3.2,-1.7, bench at
 * -2.6,0.35, village gate at 2.7,-2.9, ô ăn quan board at 0.9,0.35, well at
 * 4.6,0.35; walking lane z 2.15). Everything below surrounds it.
 */
export const CAY_DA_LAYOUT = {
  bigBanyan: [-11.6, -4.4] as Vec2,
  shrine: [-13.6, -2.4] as Vec2,
  elder: [-9.7, -2.5] as Vec2,
  bags: [-8.4, -3.5] as Vec2,
  /** The diorama's ô ăn quan board. */
  board: [0.9, 0.35] as Vec2,
  boardKid: [0.9, -0.6] as Vec2,
  /** The diorama's well. */
  well: [4.6, 0.35] as Vec2,
  wellGirl: [5.75, -0.2] as Vec2,
  buckets: [
    [6.6, -1.2],
    [7.9, -1.2],
  ] as Vec2[],
  cauKid: [9.4, -2.4] as Vec2,
  cauFriend: [12.2, -2.0] as Vec2,
  rope: [8.8, 6.3] as Vec2,
  ropeKid: [7.1, 6.3] as Vec2,
  ropeFriend: [10.5, 6.3] as Vec2,
  marbles: [-8.4, 6.2] as Vec2,
  marbleKids: [
    [-9.7, 5.6],
    [-7.2, 5.3],
  ] as Vec2[],
  gate: [2.7, -2.9] as Vec2,
  buffalo: [15.0, -3.0] as Vec2,
  houses: [
    [14.8, -6.6],
    [-14.4, 6.6],
    [14.6, 7.0],
  ] as Vec2[],
};
const L = CAY_DA_LAYOUT;

export const cayDaMap: ExploreMapData = {
  id: "cay-da",
  chapterId: "cay-da",
  title: "Cây đa đầu làng",
  subtitle: "Chiều tan học",
  spawn: [-3.8, 2.15],
  bounds: { min: [-17, -9], max: [17, 10] },

  npcs: [
    {
      id: "ong",
      name: "Ông",
      at: L.elder,
      pose: "sit",
      facing: 0.4,
      look: {
        shirt: "#d9cfb8",
        pants: "#3a3a3a",
        hair: "bald",
        hairColor: "#d9d6cf",
        height: 0.92,
        beard: true,
        hat: "khan-dong",
      },
    },
    {
      id: "ban-quan",
      name: "Bạn nhỏ",
      at: L.boardKid,
      pose: "sit",
      look: {
        shirt: "#f3efe6",
        pants: "#2e4a7a",
        hair: "short",
        height: 0.7,
      },
    },
    {
      id: "chi-gieng",
      name: "Chị hàng xóm",
      at: L.wellGirl,
      facing: -1.3,
      look: {
        shirt: "#8e44ad",
        pants: "#2a2a2e",
        hair: "bun",
        height: 0.85,
        longShirt: true,
      },
    },
    {
      id: "ban-cau",
      name: "Bạn đá cầu",
      at: L.cauKid,
      facing: 1.35,
      look: {
        shirt: "#f3efe6",
        pants: "#3a3a3a",
        hair: "crop",
        height: 0.72,
      },
    },
    {
      id: "ban-day",
      name: "Bạn nhảy dây",
      at: L.ropeKid,
      facing: Math.PI / 2,
      look: {
        shirt: "#e86a33",
        pants: "#2e4a7a",
        hair: "pigtails",
        height: 0.68,
      },
    },
  ],

  quests: [
    { id: "chao-ong", label: "Chào ông dưới gốc đa" },
    { id: "o-an-quan", label: "Chơi một ván ô ăn quan" },
    { id: "da-cau", label: "Đá cầu với bạn" },
    { id: "nhay-day", label: "Quay dây cho bạn nhảy" },
    { id: "gieng", label: "Phụ chị kéo nước giếng" },
    { id: "ban-bi", label: "Bắn bi một lượt" },
  ],

  interactions: [
    {
      id: "talk-ong",
      label: "Chào ông",
      npc: "ong",
      at: [L.elder[0] + 0.5, L.elder[1] + 1.3],
      radius: 1.9,
      quest: "chao-ong",
      reward: "Ông cho một cục kẹo gừng",
      lines: [
        { who: "Dĩ", text: "Con chào ông! Ông ngồi hóng mát hả ông?" },
        {
          who: "Ông",
          text: "Ờ. Cây đa này có từ hồi ông còn nhỏ hơn con. Trưa nắng cỡ nào gốc đa cũng mát.",
        },
        {
          who: "Ông",
          text: "Chơi thì chơi, nhớ về trước khi mặt trời lặn nghe. Cầm cục kẹo nè.",
        },
      ],
    },
    {
      id: "talk-quan",
      label: "Chơi ô ăn quan",
      npc: "ban-quan",
      at: [L.board[0] + 0.1, L.board[1] + 1.3],
      radius: 2.0,
      quest: "o-an-quan",
      effect: "soi",
      lines: [
        {
          who: "Bạn nhỏ",
          text: "Dĩ ơi, vô ăn quan đi! Tao kẻ ô rồi, sỏi đủ hết nè.",
        },
        {
          who: "Dĩ",
          text: "Tao rải bên này… ăn luôn ô quan của mày rồi nghe!",
        },
        {
          who: "",
          text: "Hết ván, hai đứa ngồi đếm sỏi: mười hai viên với chín viên. Thua thì chơi ván nữa.",
        },
      ],
    },
    {
      id: "talk-cau",
      label: "Đá cầu",
      npc: "ban-cau",
      at: [L.cauKid[0] - 0.3, L.cauKid[1] + 1.3],
      radius: 1.9,
      quest: "da-cau",
      effect: "cau",
      lines: [
        {
          who: "Bạn đá cầu",
          text: "Đá cầu nè Dĩ! Tâng cho cao, đừng để rớt nghe.",
        },
        { who: "Dĩ", text: "Coi tao nè… một, hai, ba… lên!" },
        {
          who: "",
          text: "Quả cầu lông gà vút lên cao hơn cả ngọn tre, cả đám ngửa cổ nhìn theo.",
        },
      ],
    },
    {
      id: "talk-day",
      label: "Quay dây",
      npc: "ban-day",
      at: [L.ropeKid[0] - 0.4, L.ropeKid[1] + 1.3],
      radius: 1.9,
      quest: "nhay-day",
      effect: "day",
      lines: [
        {
          who: "Bạn nhảy dây",
          text: "Thiếu một người quay dây, Dĩ quay phụ tụi mình đi!",
        },
        { who: "Dĩ", text: "Được! Đếm nè: một, hai… nhảy!" },
        {
          who: "",
          text: "Sợi dây vun vút, tiếng đếm rộn ràng. Không ai chịu vấp trước.",
        },
      ],
    },
    {
      id: "talk-gieng",
      label: "Phụ kéo nước",
      npc: "chi-gieng",
      at: [L.wellGirl[0] + 0.55, L.wellGirl[1] + 1.45],
      radius: 1.9,
      quest: "gieng",
      effect: "nuoc",
      lines: [
        {
          who: "Chị hàng xóm",
          text: "Dĩ phụ chị kéo gàu nước với. Hai thùng lận, chị kéo một mình mỏi tay.",
        },
        { who: "Dĩ", text: "Để em! Kéo từ từ cho khỏi đổ… lên rồi nè!" },
        {
          who: "",
          text: "Nước giếng làng trong vắt, mát lạnh. Hai thùng đầy ắp, chị gánh về nấu cơm chiều.",
        },
      ],
    },
    {
      id: "ban-bi",
      label: "Bắn bi",
      at: [L.marbles[0] + 0.2, L.marbles[1] + 1.4],
      focus: L.marbles,
      radius: 1.9,
      quest: "ban-bi",
      effect: "bi",
      lines: [
        {
          who: "",
          text: "Mấy đứa trẻ ngồi chồm hổm quanh vòng tròn kẻ trên đất, mỗi đứa một viên bi ve.",
        },
        { who: "Dĩ", text: "Nhắm kỹ nè… búng!" },
        {
          who: "",
          text: "Cạch! Viên bi lăn trúng, văng ra khỏi vòng. Cả đám la lên một tiếng.",
        },
      ],
    },
    {
      id: "cong-lang",
      label: "Ngắm cổng làng",
      at: [L.gate[0], L.gate[1] + 1.55],
      focus: L.gate,
      radius: 1.8,
      lines: [
        {
          who: "",
          text: "Qua cổng làng là con đường đất dẫn ra đồng. Chiều nào người lớn cũng theo lối này đi làm về.",
        },
        {
          who: "Dĩ",
          text: "Mai mốt lớn lên, mình cũng đi qua cái cổng này để đi xa. Mà đi đâu cũng nhớ đường về.",
        },
      ],
    },
  ],

  obstacles: [],

  intro: [
    {
      who: "",
      text: "Trống tan trường vừa dứt. Đám trẻ ôm cặp chạy ùa ra gốc đa đầu làng.",
    },
    {
      who: "",
      text: "Còn lâu mới tối. Đi một vòng, chơi với các bạn cho trọn buổi chiều nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Nắng tắt dần sau lũy tre. Sỏi được cất vào túi, cầu được giắt lên cành đa, ai về nhà nấy.",
    },
    {
      who: "",
      text: "Những buổi chiều dưới gốc đa dạy Dĩ biết chờ đến lượt, biết thua, và biết rủ nhau chơi tiếp.",
    },
  ],

  sky: {
    top: "#f3cfa2",
    bottom: "#fbeedc",
    fog: "#f3dcbb",
    sun: "#ffc68e",
    sunIntensity: 2.6,
    ambient: 1.0,
  },
};
