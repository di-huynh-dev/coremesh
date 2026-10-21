import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "Trung thu" — đêm rằm tháng Tám trong xóm nhỏ ở Cát Nhơn.
 * LỜI THOẠI LÀ MINH HỌA theo phong tục Trung thu chung. Sửa tên gọi và lời
 * nói theo kỷ niệm thật.
 *
 * The chapter diorama sits at the origin (house at -2.4,-2.75; moon high at
 * -0.6,-4.1; mooncake table at 2.2,0.2; lion head at -4.3,0.35; walking lane
 * z 2.15). Everything below surrounds it.
 */
export const TRUNG_THU_LAYOUT = {
  /** Lantern posts along the south side of the village road. */
  postsZ: 3.55,
  postsWest: [-15.6, -12.6, -9.6, -6.9],
  postsEast: [6.9, 9.6, 12.6, 15.6],
  dad: [-11.1, 4.6] as Vec2,
  ladder: [-12.35, 4.05] as Vec2,
  banyan: [-12.9, -5.9] as Vec2,
  grandpa: [-9.6, -3.0] as Vec2,
  feast: [-4.9, 6.9] as Vec2,
  mom: [-6.75, 6.35] as Vec2,
  kid: [3.3, 6.3] as Vec2,
  pond: [7.7, 7.3] as Vec2,
  lion: [8.9, -3.1] as Vec2,
  drum: [13.3, -3.0] as Vec2,
  drummer: [12.1, -3.45] as Vec2,
  stall: [13.4, 7.0] as Vec2,
  vendor: [11.3, 7.15] as Vec2,
  houses: [
    [-7.4, -7.5],
    [9.2, -7.5],
  ] as Vec2[],
  /** Moon of the diorama (x, y, z of its centre). */
  moon: [-0.6, 5.5, -4.1] as [number, number, number],
};
const L = TRUNG_THU_LAYOUT;

export const trungThuMap: ExploreMapData = {
  id: "trung-thu",
  chapterId: "trung-thu",
  title: "Trung thu",
  subtitle: "Đêm rằm tháng Tám",
  spawn: [0, 2.15],
  bounds: { min: [-17, -9], max: [17, 10] },

  npcs: [
    {
      id: "ong",
      name: "Ông",
      at: L.grandpa,
      pose: "sit",
      facing: 0.45,
      look: {
        shirt: "#e9e2d0",
        pants: "#3a3a3a",
        hair: "crop",
        hairColor: "#d9d6cf",
        height: 0.92,
        beard: true,
      },
    },
    {
      id: "cha",
      name: "Cha",
      at: L.dad,
      facing: -0.5,
      look: {
        shirt: "#3e6b8a",
        pants: "#2b2b2b",
        hair: "short",
      },
    },
    {
      id: "me",
      name: "Mẹ",
      at: L.mom,
      facing: 1.1,
      look: {
        shirt: "#7a2e3b",
        pants: "#2a2a2e",
        hair: "bun",
        longShirt: true,
      },
    },
    {
      id: "ban",
      name: "Bạn nhỏ",
      at: L.kid,
      facing: -0.5,
      look: {
        shirt: "#e6b33a",
        pants: "#2e4a7a",
        hair: "pigtails",
        height: 0.68,
      },
    },
    {
      id: "chu-lan",
      name: "Chú múa lân",
      at: L.drummer,
      facing: 0.5,
      look: {
        shirt: "#c0392b",
        pants: "#f2b632",
        hair: "short",
        hat: "khan-dong",
      },
    },
    {
      id: "co-ban-den",
      name: "Cô bán lồng đèn",
      at: L.vendor,
      facing: 0.4,
      look: {
        shirt: "#5b7f5a",
        pants: "#2a2a2e",
        hair: "bun",
        hat: "non-la",
        longShirt: true,
      },
    },
  ],

  quests: [
    { id: "treo-den", label: "Phụ cha treo đèn lồng dọc xóm" },
    { id: "nghe-chuyen", label: "Nghe ông kể chuyện chú Cuội" },
    { id: "mua-lan", label: "Mời đoàn lân vào xóm" },
    { id: "ruoc-den", label: "Rước đèn cùng các bạn" },
    { id: "pha-co", label: "Phá cỗ cùng mẹ" },
  ],

  interactions: [
    {
      id: "talk-cha",
      label: "Phụ cha treo đèn",
      npc: "cha",
      at: [L.dad[0] + 0.5, L.dad[1] + 1.3],
      radius: 1.9,
      quest: "treo-den",
      effect: "lanterns",
      lines: [
        {
          who: "Cha",
          text: "Con đưa cha mấy cái lồng đèn đó. Treo cho đều, từ đầu xóm tới cuối xóm.",
        },
        { who: "Dĩ", text: "Cái đỏ trước, cái vàng sau nghe cha!" },
        {
          who: "",
          text: "Từng chiếc lồng đèn bật sáng, dọc con đường làng ấm lên một màu cam đỏ.",
        },
      ],
    },
    {
      id: "talk-ong",
      label: "Nghe ông kể chuyện",
      npc: "ong",
      at: [L.grandpa[0] + 0.5, L.grandpa[1] + 1.3],
      radius: 1.9,
      quest: "nghe-chuyen",
      effect: "cuoi",
      lines: [
        {
          who: "Ông",
          text: "Ngồi xuống đây con. Thấy cái bóng đen đen trên mặt trăng không?",
        },
        {
          who: "Ông",
          text: "Đó là chú Cuội ngồi gốc cây đa. Lỡ tưới nước bẩn, cây bay lên trời, Cuội níu rễ bay theo luôn.",
        },
        {
          who: "Dĩ",
          text: "Con thấy rồi! Trên trăng cũng có cây đa giống đầu làng mình nè ông!",
        },
        {
          who: "Ông",
          text: "Ờ, vậy nên đêm rằm, chị Hằng với chú Cuội cũng ngó xuống coi tụi nhỏ rước đèn đó.",
        },
      ],
    },
    {
      id: "talk-lan",
      label: "Mời đoàn lân",
      npc: "chu-lan",
      at: [L.drummer[0] - 0.2, L.drummer[1] + 1.35],
      radius: 1.9,
      quest: "mua-lan",
      effect: "lan",
      lines: [
        {
          who: "Dĩ",
          text: "Chú ơi, nhà con có mâm cỗ rồi. Chú cho lân vô xóm múa nghe!",
        },
        {
          who: "Chú múa lân",
          text: "Được luôn! Tụi bây đứng xa xa ra, lân nhảy là không biết đường đâu nghe.",
        },
        {
          who: "",
          text: "Tùng tùng cắc, tùng tùng cắc… Tiếng trống nổi lên, con lân lắc đầu, chớp mắt, nhảy tưng tưng giữa sân.",
        },
      ],
    },
    {
      id: "talk-ban",
      label: "Rước đèn",
      npc: "ban",
      at: [L.kid[0] - 0.6, L.kid[1] + 1.2],
      radius: 1.9,
      quest: "ruoc-den",
      effect: "parade",
      lines: [
        {
          who: "Bạn nhỏ",
          text: "Dĩ ơi, tụi nhỏ xếp hàng rước đèn rồi kìa! Đèn ông sao của Dĩ đâu?",
        },
        { who: "Dĩ", text: "Đây nè! Mình đi vòng quanh xóm một vòng nghe." },
        {
          who: "",
          text: "Cả đám vừa đi vừa hát: “Tết Trung thu rước đèn đi chơi…”. Những ngọn đèn lắc lư nối nhau dọc đường làng.",
        },
      ],
    },
    {
      id: "talk-me",
      label: "Phá cỗ cùng mẹ",
      npc: "me",
      at: [L.mom[0] + 0.3, L.mom[1] + 1.35],
      radius: 1.9,
      quest: "pha-co",
      effect: "pha-co",
      reward: "Được miếng bánh nướng nhân thập cẩm",
      lines: [
        {
          who: "Mẹ",
          text: "Trăng lên cao rồi, gọi cả nhà ra phá cỗ nè con.",
        },
        {
          who: "Mẹ",
          text: "Bánh nướng cắt làm tám, ai cũng có phần. Con bưng ra cho ông trước nghe.",
        },
        {
          who: "Dĩ",
          text: "Dạ! Còn con chó làm bằng trái bưởi nữa, đẹp quá mẹ ơi.",
        },
      ],
    },
    {
      id: "talk-co",
      label: "Ghé sạp lồng đèn",
      npc: "co-ban-den",
      at: [L.vendor[0] - 0.2, L.vendor[1] + 1.3],
      radius: 1.8,
      lines: [
        {
          who: "Cô bán lồng đèn",
          text: "Đèn cá chép, đèn ông sao, đèn kéo quân đủ hết nè. Con lựa cái nào?",
        },
        {
          who: "Dĩ",
          text: "Con có đèn ông sao rồi cô. Con đứng coi đèn kéo quân quay thôi.",
        },
        {
          who: "Cô bán lồng đèn",
          text: "Ừ, coi đi. Bóng mấy ông lính cứ chạy vòng vòng hoài, tụi nhỏ coi không biết chán.",
        },
      ],
    },
    {
      id: "pond",
      label: "Ngắm trăng dưới ao",
      at: [L.pond[0] - 0.4, L.pond[1] - 2.55],
      focus: L.pond,
      radius: 1.9,
      lines: [
        {
          who: "",
          text: "Mặt ao phẳng lặng, ôm trọn một vầng trăng tròn. Gió thổi qua, trăng dưới nước vỡ ra rồi lại tròn.",
        },
        { who: "Dĩ", text: "Trên trời một cái trăng, dưới ao một cái trăng." },
      ],
    },
  ],

  obstacles: [{ kind: "circle", at: L.pond, r: 1.75 }],

  intro: [
    {
      who: "",
      text: "Rằm tháng Tám. Trăng lên tròn sau mái nhà, tiếng trống lân đâu đó đã vọng tới đầu xóm.",
    },
    {
      who: "",
      text: "Đi một vòng quanh xóm: treo đèn, nghe chuyện, rước đèn và chờ phá cỗ nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Đèn sáng dọc đường làng, trống lân rộn ràng, mâm cỗ đã phá, trăng vẫn tròn trên đầu.",
    },
    {
      who: "",
      text: "Sau này ở thành phố, mỗi lần thấy trăng rằm, Dĩ lại nhớ ánh đèn ông sao đỏ của đêm nay.",
    },
  ],

  sky: {
    top: "#1c2140",
    bottom: "#3b3f6e",
    fog: "#262b4f",
    sun: "#b9c4ff",
    sunIntensity: 0.8,
    ambient: 0.5,
    hemi: 0.45,
    hemiSky: "#5d6aa0",
  },
};
