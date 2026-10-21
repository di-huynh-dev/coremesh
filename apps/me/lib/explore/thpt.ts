import type { ExploreMapData, Vec2 } from "./types";

/**
 * Map "THPT" — một buổi chiều cuối năm lớp 12 ở THPT số 3 Phù Cát.
 * LỜI THOẠI LÀ MINH HỌA. Sửa tên gọi và lời nói theo kỷ niệm thật.
 * (Chi tiết có thật: Dĩ bắt đầu đeo kính từ cấp 3, sau này học Kỹ thuật
 * phần mềm tại Đại học Sư phạm Kỹ thuật TP.HCM.)
 *
 * The chapter diorama sits at the origin (school building at -0.5,-2.1;
 * flag at 2.2,-0.2; study desk at -3.2,0.65; "ƯỚC MƠ · UTE" board at
 * 3.5,0.95; glasses table at -3.2,3.4; walking lane z 2.15).
 */
export const THPT_LAYOUT = {
  gateZ: 8.2,
  classroom: { minX: 8.6, maxX: 15.6, backZ: -8.6, frontZ: -3.0 },
  teacher: [12.1, -7.5] as Vec2,
  teacherDesk: [14.2, -7.3] as Vec2,
  desks: [
    [10.0, -5.4],
    [14.2, -5.4],
    [10.0, -4.1],
    [14.2, -4.1],
  ] as Vec2[],
  myDesk: [14.2, -4.1] as Vec2,
  nurse: [-12.4, -6.8] as Vec2,
  nurseTable: [-10.9, -7.2] as Vec2,
  eyeChart: [-14.8, -7.4] as Vec2,
  infirmary: { minX: -16.2, maxX: -8.8, z: -9.0 },
  bikes: [-16.0, -15.2, -14.4, -13.6, -12.8, -12.0, -11.2],
  bikeZ: -1.7,
  steps: { minX: -14.0, maxX: -8.4, z: 3.6 },
  classmatesBack: [-13.0, -11.9, -10.8, -9.7] as number[],
  classmatesFront: [-12.4, -11.3, -10.2] as number[],
  photographer: [-11.2, 7.4] as Vec2,
  tripod: [-11.2, 6.7] as Vec2,
  bench: [11.0, 5.4] as Vec2,
  bestFriend: [10.65, 5.5] as Vec2,
  flameTree: [12.7, 6.6] as Vec2,
  itTeacher: [2.0, 1.0] as Vec2,
  studyDesk: [-3.2, 0.65] as Vec2,
};
const L = THPT_LAYOUT;

export const thptMap: ExploreMapData = {
  id: "thpt",
  chapterId: "thpt",
  title: "THPT",
  subtitle: "Mùa hè cuối cấp ở THPT số 3 Phù Cát",
  spawn: [0, 6.2],
  bounds: { min: [-17, -9.1], max: [17, 7.8] },

  npcs: [
    {
      id: "co-chu-nhiem",
      name: "Cô chủ nhiệm",
      at: L.teacher,
      look: {
        shirt: "#c8d9e8",
        pants: "#c8d9e8",
        hair: "bun",
        hairColor: "#1d1a18",
        glasses: true,
        longShirt: true,
      },
    },
    {
      id: "co-y-te",
      name: "Cô y tế",
      at: L.nurse,
      facing: 0.3,
      look: {
        shirt: "#f7f6f2",
        pants: "#f7f6f2",
        hair: "bun",
        hairColor: "#1d1a18",
        longShirt: true,
      },
    },
    {
      id: "thay-tin",
      name: "Thầy dạy Tin học",
      at: L.itTeacher,
      facing: 0.2,
      look: {
        shirt: "#d9e3ea",
        pants: "#3a3a3a",
        hair: "short",
        hairColor: "#2a2622",
      },
    },
    {
      id: "ban-than",
      name: "Bạn thân",
      at: L.bestFriend,
      pose: "sit",
      look: {
        shirt: "#f4f1ea",
        pants: "#2c3550",
        hair: "short",
        hairColor: "#1d1a18",
        height: 0.95,
      },
    },
    {
      id: "tho-chup-anh",
      name: "Anh thợ chụp ảnh",
      at: L.photographer,
      facing: Math.PI,
      look: {
        shirt: "#8a6a46",
        pants: "#2b2b2b",
        hair: "short",
        hairColor: "#1d1a18",
      },
    },
  ],

  quests: [
    { id: "nghe-co-dan", label: "Nghe cô chủ nhiệm dặn dò" },
    { id: "kham-mat", label: "Đo mắt ở phòng y tế" },
    { id: "chon-nganh", label: "Hỏi thầy về ngành học" },
    { id: "nguyen-vong", label: "Điền nguyện vọng đại học" },
    { id: "on-thi", label: "Ôn thi cùng bạn thân" },
    { id: "ky-yeu", label: "Chụp ảnh kỷ yếu với cả lớp" },
  ],

  interactions: [
    {
      id: "talk-chu-nhiem",
      label: "Gặp cô chủ nhiệm",
      npc: "co-chu-nhiem",
      at: [L.teacher[0], L.teacher[1] + 1.3],
      radius: 1.9,
      quest: "nghe-co-dan",
      effect: "de-cuong",
      lines: [
        {
          who: "Cô chủ nhiệm",
          text: "Dĩ, mấy bữa nay cô để ý em nheo mắt nhìn bảng hoài. Ngồi cuối lớp có thấy rõ không em?",
        },
        {
          who: "Dĩ",
          text: "Dạ… chữ trên bảng em thấy hơi nhòe nhòe ạ.",
        },
        {
          who: "Cô chủ nhiệm",
          text: "Vậy ghé phòng y tế đo mắt liền đi. Còn đề cương ôn thi đây, ôn từ từ, đừng thức khuya quá nghe.",
        },
      ],
    },
    {
      id: "talk-y-te",
      label: "Đo mắt",
      npc: "co-y-te",
      at: [L.nurse[0] - 0.1, L.nurse[1] + 1.3],
      radius: 1.9,
      quest: "kham-mat",
      effect: "kinh",
      reward: "Cặp kính đầu tiên",
      lines: [
        {
          who: "Cô y tế",
          text: "Em che một mắt lại, đọc bảng chữ từ trên xuống cho cô nghe.",
        },
        {
          who: "Dĩ",
          text: "E… F, P… mấy dòng dưới em chịu, mờ quá cô ơi.",
        },
        {
          who: "Cô y tế",
          text: "Em cận rồi đó. Đeo kính vô thử coi, có khác không?",
        },
        {
          who: "",
          text: "Dĩ đeo cặp kính đầu tiên. Mọi thứ bỗng rõ nét lạ thường: từng chiếc lá, từng con chữ trên bảng.",
        },
      ],
    },
    {
      id: "talk-thay-tin",
      label: "Hỏi thầy về ngành học",
      npc: "thay-tin",
      at: [L.itTeacher[0], 2.25],
      radius: 1.8,
      quest: "chon-nganh",
      lines: [
        {
          who: "Thầy dạy Tin học",
          text: "Giờ Tin học em hay ở lại vọc máy hoài. Em tính thi ngành gì chưa?",
        },
        {
          who: "Dĩ",
          text: "Dạ, em muốn học cách làm ra phần mềm, mà còn phân vân chưa biết chọn ngành nào.",
        },
        {
          who: "Thầy dạy Tin học",
          text: "Thử tìm hiểu ngành Kỹ thuật phần mềm coi. Học để tự tay làm ra những thứ người ta dùng mỗi ngày.",
        },
      ],
    },
    {
      id: "study-desk",
      label: "Điền phiếu nguyện vọng",
      at: [L.studyDesk[0], 2.2],
      focus: L.studyDesk,
      radius: 1.8,
      quest: "nguyen-vong",
      effect: "nguyen-vong",
      lines: [
        {
          who: "",
          text: "Tờ phiếu đăng ký xét tuyển nằm trên bàn học. Ô nguyện vọng một vẫn còn để trống.",
        },
        {
          who: "Dĩ",
          text: "(nắn nót) Đại học Sư phạm Kỹ thuật TP.HCM… ngành Kỹ thuật phần mềm.",
        },
        {
          who: "",
          text: "Chỉ là một dòng chữ nhỏ, mà mở ra cả một hướng đi.",
        },
      ],
    },
    {
      id: "talk-ban-than",
      label: "Ngồi với bạn thân",
      npc: "ban-than",
      at: [L.bestFriend[0] + 0.15, L.bestFriend[1] + 1.3],
      radius: 1.9,
      quest: "on-thi",
      effect: "phuong",
      lines: [
        {
          who: "Bạn thân",
          text: "Còn có mấy tháng nữa là thi rồi. Tao lo quá mày ơi.",
        },
        {
          who: "Dĩ",
          text: "Tao cũng lo. Mà mình ôn chung, chỗ nào không hiểu thì hỏi nhau, sợ gì.",
        },
        {
          who: "Bạn thân",
          text: "Ừ. Mai mốt mỗi đứa đi một nơi, nhớ giữ liên lạc nghe mày.",
        },
        {
          who: "",
          text: "Gió thổi qua, hoa phượng rơi đỏ cả ghế đá. Mùa hè cuối cùng của tuổi học trò.",
        },
      ],
    },
    {
      id: "talk-chup-anh",
      label: "Chụp ảnh kỷ yếu",
      npc: "tho-chup-anh",
      at: [L.photographer[0] + 1.3, L.photographer[1]],
      radius: 1.9,
      quest: "ky-yeu",
      effect: "ky-yeu",
      reward: "Một tấm ảnh kỷ yếu của cả lớp",
      lines: [
        {
          who: "Anh thợ chụp ảnh",
          text: "Cả lớp đứng sát vô! Bạn đeo kính ơi, ra đứng hàng sau giữa nè.",
        },
        { who: "Dĩ", text: "Dạ! Tụi mày cười lên coi!" },
        { who: "Anh thợ chụp ảnh", text: "Một, hai, ba… cười!" },
        {
          who: "",
          text: "Tách! Cả lớp được giữ lại trong một tấm ảnh, trước khi mỗi đứa đi một ngả.",
        },
      ],
    },
  ],

  obstacles: [],

  intro: [
    {
      who: "",
      text: "Những tháng cuối năm lớp 12 ở THPT số 3 Phù Cát. Hoa phượng bắt đầu đỏ, bảng đếm ngược ngày thi treo trong lớp.",
    },
    {
      who: "",
      text: "Phía trước là những lựa chọn lớn: học gì, đi đâu, trở thành ai. Đi một vòng sân trường lần cuối nhé.",
    },
  ],
  outro: [
    {
      who: "",
      text: "Một cặp kính mới, một tờ nguyện vọng, một tấm ảnh kỷ yếu và những lời hẹn dưới gốc phượng.",
    },
    {
      who: "",
      text: "Cánh cổng trường cấp 3 khép lại, và con đường từ Phù Cát vào Sài Gòn bắt đầu.",
    },
  ],

  sky: {
    top: "#f0cfae",
    bottom: "#fcefdc",
    fog: "#f4e0cb",
    sun: "#ffc98e",
    sunIntensity: 2.8,
    ambient: 1.0,
  },
};
