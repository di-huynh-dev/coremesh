export type StoryMemory = { name: string; description: string };

export type Chapter = {
  id: string;
  label: string;
  era: string;
  location: string;
  school?: string;
  period?: string;
  title: string;
  story: string;
  trait: string;
  sky: string;
  ground: string;
  memories: StoryMemory[];
};

/** Real schools and career milestones; rural settings are illustrative memories.
 * Early school dates intentionally remain unspecified. */
export const chapters: Chapter[] = [
  {
    id: "que-nha",
    label: "Quê nhà",
    era: "Thuở ấu thơ",
    location: "Cát Nhơn, Phù Cát",
    title: "Từ một làng nhỏ,\nđi những chặng dài.",
    story:
      "Mình là Dĩ. Hành trình của mình bắt đầu ở Cát Nhơn, trước khi có những dòng code và những ngày sống giữa thành phố. Một miền quê để lớn lên, và để luôn nhớ về.",
    trait: "Hiền lành, từ thuở bé đến bây giờ.",
    sky: "#e8ede0",
    ground: "#a6b481",
    memories: [
      {
        name: "Mái nhà",
        description:
          "Mái ngói, hiên nhà và khoảng sân nhỏ. Một lát cắt của nhịp sống làng quê Việt Nam, nơi câu chuyện này bắt đầu.",
      },
      {
        name: "Cánh diều",
        description:
          "Một cánh diều trên đồng, dành cho khoảng trời trong trẻo của tuổi thơ.",
      },
      {
        name: "Đồng lúa",
        description:
          "Những thửa ruộng xanh, bờ đất và màu nắng quê nhà. Cội nguồn vẫn đi cùng mình qua từng chặng đường.",
      },
    ],
  },
  {
    id: "tet-que",
    label: "Tết quê",
    era: "Những ngày đầu năm",
    location: "Cát Nhơn, Phù Cát",
    title: "Năm mới bắt đầu\ntừ một nồi bánh tét.",
    story:
      "Tết ở quê đến từ rất sớm: nồi bánh tét đỏ lửa trước sân, cành mai vàng nở bên hiên, câu chúc đỏ treo trên cửa. Những ngày đầu năm, cả xóm như chậm lại để sum vầy.",
    trait: "Áo mới, túi lì xì và một nụ cười rất hiền.",
    sky: "#f7e6d2",
    ground: "#a6b481",
    memories: [
      {
        name: "Nồi bánh tét",
        description:
          "Nồi bánh tét đỏ lửa ngoài sân, khói bay lên giữa trời cuối năm. Một hình ảnh quen thuộc của Tết miền Trung.",
      },
      {
        name: "Cây mai",
        description:
          "Mai vàng nở đúng dịp Tết, loài hoa của miền Trung và miền Nam, báo hiệu một năm mới bắt đầu.",
      },
      {
        name: "Câu đối đỏ",
        description:
          "Chữ vàng trên nền đỏ: Chúc mừng năm mới, An khang, Thịnh vượng. Lời chúc treo trước mái nhà.",
      },
    ],
  },
  {
    id: "tieu-hoc",
    label: "Tiểu học",
    era: "Những trang đầu tiên",
    location: "Cát Nhơn, Phù Cát",
    school: "Tiểu học số 1 Cát Nhơn",
    title: "Thế giới rộng hơn\nmột trang vở.",
    story:
      "Tiểu học số 1 Cát Nhơn là chặng đầu tiên trên con đường học tập của mình. Từ những con chữ đầu đời, thế giới dần rộng ra: có trường lớp, có bạn bè, có biết bao điều để học.",
    trait: "Lớn lên từ những điều rất nhỏ.",
    sky: "#eee9d9",
    ground: "#c9bc95",
    memories: [
      {
        name: "Sân trường",
        description:
          "Tiểu học số 1 Cát Nhơn. Màu tường vàng và mái ngói gợi không khí thân thuộc của trường học Việt Nam.",
      },
      {
        name: "Lá cờ",
        description:
          "Lá cờ giữa sân trường, hình ảnh quen thuộc trong ký ức của nhiều thế hệ học trò.",
      },
      {
        name: "Trang vở",
        description:
          "Bắt đầu bằng việc học đọc, học viết. Những kỹ năng đầu tiên mở ra vô số cánh cửa sau này.",
      },
    ],
  },
  {
    id: "trung-thu",
    label: "Trung thu",
    era: "Đêm rằm tháng Tám",
    location: "Xóm nhỏ ở Cát Nhơn",
    title: "Một đêm trăng tròn\nvà ngọn đèn ông sao.",
    story:
      "Rằm tháng Tám, trăng lên tròn sau mái nhà. Dây lồng đèn sáng dọc xóm, đèn ông sao đỏ lắc lư theo bước chân, và mâm bánh nhỏ chờ phá cỗ. Tuổi thơ có những đêm sáng như thế.",
    trait: "Mắt sáng như ngọn đèn trong tay.",
    sky: "#1c2140",
    ground: "#8d9c64",
    memories: [
      {
        name: "Đèn ông sao",
        description:
          "Chiếc đèn ông sao năm cánh, món đồ chơi quen thuộc của trẻ con Việt Nam mỗi dịp Trung thu.",
      },
      {
        name: "Bánh trung thu",
        description:
          "Mâm bánh nướng, bánh dẻo và ấm trà, đợi trăng lên để cùng phá cỗ.",
      },
      {
        name: "Trăng rằm",
        description:
          "Trăng tháng Tám tròn và sáng nhất năm. Trong sa bàn, trăng treo ngay phía sau xóm nhỏ.",
      },
    ],
  },
  {
    id: "mua-he",
    label: "Mùa hè",
    era: "Những khoảng trời tuổi nhỏ",
    location: "Miền quê Cát Nhơn",
    title: "Có một tuổi thơ\nở ngoài trang sách.",
    story:
      "Giữa các chặng đến trường, mình muốn dành một khoảng cho quê nhà. Dòng nước nhỏ, bóng tre, chiếc cầu và cánh đồng: những hình ảnh kể về một tuổi thơ gần với đất, với trời.",
    trait: "Giữ lại một khoảng trời trong trẻo.",
    sky: "#e1eadd",
    ground: "#94ad7a",
    memories: [
      {
        name: "Chiếc cầu",
        description:
          "Một chiếc cầu nhỏ nối hai bờ, được dựng như một lát cắt miền quê.",
      },
      {
        name: "Chú trâu",
        description:
          "Dáng trâu bên đồng, một nét thân thuộc của đời sống nông thôn Việt Nam.",
      },
      {
        name: "Khóm tre",
        description:
          "Những đốt tre, tán lá và bóng mát. Một chút mềm mại, bền bỉ trong không gian tuổi thơ.",
      },
    ],
  },
  {
    id: "bien-que",
    label: "Biển quê",
    era: "Gió biển Phù Cát",
    location: "Miền biển Phù Cát",
    title: "Ở quê có cả\nmột vùng biển xanh.",
    story:
      "Phù Cát không chỉ có đồng lúa mà còn có biển. Những chiếc thuyền thúng tròn nằm trên cát, lưới phơi trong nắng và tiếng sóng vỗ đều. Biển dạy cho đứa trẻ quê một điều: thế giới còn rộng lắm.",
    trait: "Chân đầy cát, tóc đầy gió.",
    sky: "#cfe8f0",
    ground: "#e6d2a2",
    memories: [
      {
        name: "Thuyền thúng",
        description:
          "Thuyền thúng tròn đan bằng tre, hình ảnh rất riêng của các làng biển Bình Định.",
      },
      {
        name: "Lưới cá",
        description:
          "Lưới phơi trên cọc tre sau mỗi chuyến ra khơi, có cả những chiếc phao màu cam.",
      },
      {
        name: "Bãi cát",
        description:
          "Một lâu đài cát, chiếc xô nhỏ và mấy vỏ sò. Trò chơi không cần luật của những ngày hè.",
      },
    ],
  },
  {
    id: "cho-que",
    label: "Chợ quê",
    era: "Buổi sáng ở chợ",
    location: "Chợ làng",
    title: "Chợ quê họp từ\nlúc trời còn sương.",
    story:
      "Chợ làng họp từ sáng sớm: sạp trái cây, sạp vải, sạp cá, những gánh hàng và giàn bánh tráng phơi trong nắng. Đi chợ cùng người lớn là cách một đứa trẻ học về nhịp sống quanh mình.",
    trait: "Tò mò với mọi gánh hàng.",
    sky: "#efe6d6",
    ground: "#b7b08a",
    memories: [
      {
        name: "Sạp chợ",
        description:
          "Sạp trái cây, sạp vải và sạp cá dưới những tấm bạt sọc. Một góc chợ quê được dựng lại theo trí nhớ.",
      },
      {
        name: "Gánh hàng",
        description:
          "Đòn gánh và hai chiếc thúng: cách người quê mang hàng ra chợ từ bao đời nay.",
      },
      {
        name: "Bánh tráng phơi",
        description:
          "Những giàn bánh tráng phơi nắng, đặc sản quen thuộc của Bình Định.",
      },
    ],
  },
  {
    id: "cay-da",
    label: "Cây đa",
    era: "Chiều tan học",
    location: "Đầu làng",
    title: "Dưới gốc đa,\nmột buổi chiều rất dài.",
    story:
      "Tan học, đám trẻ tụ lại dưới gốc đa đầu làng: kẻ ô ăn quan trên đất, tung cầu lên trời, ghé giếng làng uống ngụm nước mát. Những trò chơi đơn giản mà đủ lấp đầy cả một buổi chiều.",
    trait: "Khăn quàng đỏ và đôi chân không chịu ngồi yên.",
    sky: "#f3dcbb",
    ground: "#a6b481",
    memories: [
      {
        name: "Cây đa",
        description:
          "Cây đa đầu làng, nơi hẹn quen thuộc của trẻ con và chỗ nghỉ chân của người đi đồng về.",
      },
      {
        name: "Ô ăn quan",
        description:
          "Mười ô vuông, hai ô quan và một nắm sỏi. Trò chơi dân gian dạy đếm, dạy tính, dạy cả chờ đến lượt.",
      },
      {
        name: "Đá cầu",
        description:
          "Quả cầu lông gà nhiều màu, cứ tung lên là cả đám cùng ngẩng đầu nhìn theo.",
      },
    ],
  },
  {
    id: "thcs",
    label: "THCS",
    era: "Lớn thêm một chút",
    location: "Cát Nhơn, Phù Cát",
    school: "Trung học cơ sở Cát Nhơn",
    title: "Nhiều câu hỏi hơn.\nNhiều ước mơ hơn.",
    story:
      "Tiếp tục học tại Trung học cơ sở Cát Nhơn, mình bước sang một chặng mới ngay trên mảnh đất quen thuộc. Kiến thức nhiều hơn, thế giới nhiều góc nhìn hơn, và mình cũng dần hiểu bản thân hơn.",
    trait: "Vẫn nét hiền lành của cậu học trò quê.",
    sky: "#e6ebe3",
    ground: "#b7bda0",
    memories: [
      {
        name: "Ngôi trường",
        description:
          "Trung học cơ sở Cát Nhơn, chặng thứ hai trong hành trình học tập của Dĩ.",
      },
      {
        name: "Xe đạp",
        description:
          "Chiếc xe đạp gợi nhịp đến trường ở làng quê. Một chi tiết kể chuyện bằng hình ảnh.",
      },
      {
        name: "Tủ sách",
        description:
          "Có những thế giới mở ra khi ta lật trang tiếp theo. Tủ sách đại diện cho việc học và khám phá.",
      },
    ],
  },
  {
    id: "thpt",
    label: "THPT",
    era: "Trước ngưỡng cửa mới",
    location: "Phù Cát",
    school: "THPT số 3 Phù Cát",
    title: "Từ sân trường,\nnhìn về phía xa.",
    story:
      "THPT số 3 Phù Cát là chặng cuối của những năm phổ thông. Mình bắt đầu đeo kính từ cấp 3. Phía trước là những lựa chọn lớn hơn: sẽ học gì, đi đâu và trở thành ai.",
    trait: "Thêm một cặp kính. Vẫn một nét hiền.",
    sky: "#ecdccf",
    ground: "#b6ad8a",
    memories: [
      {
        name: "Cổng trường",
        description:
          "THPT số 3 Phù Cát. Một cánh cổng khép lại tuổi học trò và mở ra hành trình tiếp theo.",
      },
      {
        name: "Bàn học",
        description:
          "Sách vở và khoảng lặng trước những lựa chọn, tượng trưng cho chặng chuẩn bị vào đại học.",
      },
      {
        name: "Cặp kính",
        description:
          "Dĩ bắt đầu cận và đeo kính từ cấp 3. Từ chặng này, cặp kính trở thành nét nhận diện của nhân vật.",
      },
    ],
  },
  {
    id: "di-xa",
    label: "Đi xa",
    era: "Từ Phù Cát đến TP.HCM",
    location: "Một hành trình mới",
    title: "Hành lý có cả\nmột miền quê.",
    story:
      "Từ Phù Cát đến TP.HCM, không gian sống và nhịp sống đều thay đổi. Chuyến đi trong sa bàn là hình ảnh cho bước chuyển ấy: rời nơi quen thuộc, mang theo những gì đã làm nên mình.",
    trait: "Bước ra xa để lớn lên.",
    sky: "#e5e1d8",
    ground: "#b9b3a0",
    memories: [
      {
        name: "Chuyến tàu",
        description:
          "Hình ảnh chuyến tàu tượng trưng cho việc đi xa và bắt đầu đời sinh viên.",
      },
      {
        name: "Chiếc vali",
        description:
          "Một ít đồ đạc, rất nhiều điều chưa biết. Hành lý của người bắt đầu chặng sống mới.",
      },
      {
        name: "Biển chỉ đường",
        description:
          "Từ Phù Cát đến TP.HCM. Hai địa danh nối liền cội nguồn và con đường học tập tiếp theo.",
      },
    ],
  },
  {
    id: "ute",
    label: "Đại học",
    era: "Đời sinh viên",
    location: "TP. Hồ Chí Minh",
    school: "Đại học Sư phạm Kỹ thuật TP.HCM",
    period: "09.2020 - 06.2024",
    title: "Một thành phố mới.\nMột hướng đi rõ hơn.",
    story:
      "Mình theo học Kỹ thuật phần mềm tại Đại học Sư phạm Kỹ thuật TP.HCM, UTE. Bốn năm đại học là chặng kết nối việc học với nghề: hiểu cách phần mềm hoạt động và từng bước tự xây nên sản phẩm.",
    trait: "Từ người học đến người tạo ra.",
    sky: "#e0e9e9",
    ground: "#b3c1b7",
    memories: [
      {
        name: "Khuôn viên UTE",
        description:
          "Đại học Sư phạm Kỹ thuật TP.HCM (UTE). Kỹ thuật phần mềm, 09.2020 - 06.2024, GPA 3.34/4.",
      },
      {
        name: "Giảng đường",
        description:
          "Từ nền tảng lập trình đến cách thiết kế và xây dựng phần mềm. Một chặng học có hướng đi ngày càng rõ ràng.",
      },
      {
        name: "Ba lô",
        description:
          "Vẫn là người từ Cát Nhơn, giờ mang theo sách, laptop và những dự định của đời sinh viên.",
      },
    ],
  },
  {
    id: "goc-hoc",
    label: "Tự học",
    era: "Những điều làm nên tay nghề",
    location: "Một góc nhỏ ở TP.HCM",
    title: "Từng dòng code.\nTừng chút lớn lên.",
    story:
      "Ngoài giảng đường là hành trình tự học. Từ JavaScript đến React và TypeScript, mình từng bước có thêm công cụ để biến ý tưởng thành giao diện, rồi thành một sản phẩm có thể sử dụng.",
    trait: "Kiên nhẫn với từng điều chưa biết.",
    sky: "#d5dee0",
    ground: "#a2aba9",
    memories: [
      {
        name: "Góc học",
        description:
          "Góc học đêm đại diện cho quá trình thực hành và tự học bên ngoài lớp học.",
      },
      {
        name: "Màn hình",
        description:
          "JavaScript, React, TypeScript. Những công cụ trở thành một phần trong công việc làm sản phẩm web.",
      },
      {
        name: "Đèn bàn",
        description:
          "Một quầng sáng nhỏ để tập trung vào vấn đề trước mắt. Hiệu ứng đèn tạo chiều sâu cho bối cảnh buổi tối.",
      },
    ],
  },
  {
    id: "amit",
    label: "Bắt đầu nghề",
    era: "Học từ công việc thật",
    location: "AMIT Group",
    period: "03.2022 - 09.2023",
    title: "Lần đầu xây cùng\nmột đội ngũ.",
    story:
      "Tại AMIT Group, mình bắt đầu với vai trò Intern và Fresher Frontend Developer, song song những năm đại học. Từ bản thiết kế Figma đến giao diện, từ quản lý dữ liệu đến code review, kiến thức dần trở thành kinh nghiệm.",
    trait: "Biết lắng nghe. Không ngừng thực hành.",
    sky: "#e7e8de",
    ground: "#bac1aa",
    memories: [
      {
        name: "Bàn làm việc",
        description:
          "AMIT Group, 03.2022 - 09.2023. Chặng Intern và Fresher Frontend Developer trong thời gian học đại học.",
      },
      {
        name: "Bản thiết kế",
        description:
          "Triển khai UI từ Figma và xây các thành phần dùng lại theo quy chuẩn của đội ngũ.",
      },
      {
        name: "Bảng công việc",
        description:
          "Zustand, TanStack Query, code review và những vòng QA. Công việc thực tế bổ sung cho những gì học ở trường.",
      },
    ],
  },
  {
    id: "hien-tai",
    label: "Hiện tại",
    era: "Software Engineer",
    location: "Estuary Solutions JSC",
    period: "10.2023 - hiện tại",
    title: "Làm sản phẩm.\nNghĩ về con người.",
    story:
      "Ở Estuary Solutions, mình phát triển nền tảng CRM phục vụ hơn 30.000 người dùng mỗi tháng. Công việc mở rộng sang kiến trúc frontend, hiệu năng và quốc tế hóa, đưa sản phẩm đến hơn 11 quốc gia.",
    trait: "Hiền lành trong cách sống. Chỉn chu trong công việc.",
    sky: "#e0e6df",
    ground: "#adb9a8",
    memories: [
      {
        name: "Sản phẩm",
        description:
          "CRM với hơn 30.000 người dùng hoạt động mỗi tháng, cùng tính năng nhắn tin và thông báo thời gian thực.",
      },
      {
        name: "Hệ thống",
        description:
          "React, Next.js, Vite, kiến trúc monorepo và micro-frontend. Nâng hiệu năng PageSpeed từ 30+ lên 98+.",
      },
      {
        name: "Thành phố",
        description:
          "Từ một ngôi làng đến những sản phẩm dùng ở hơn 11 quốc gia. Khoảng cách lớn dần, gốc rễ vẫn ở đó.",
      },
    ],
  },
  {
    id: "coi-nguon",
    label: "Cội nguồn",
    era: "Vẫn là mình, trên đường đi",
    location: "Cát Nhơn trong hành trang",
    title: "Đi thêm bao xa,\nvẫn mang theo nhà.",
    story:
      "Nhìn lại từ hiện tại, mình thấy những ngôi trường, miền quê và từng chặng công việc đều ở trong con người mình hôm nay. Câu chuyện vẫn đang viết tiếp. Còn nơi bắt đầu, mình luôn mang theo.",
    trait: "Huỳnh Tiến Dĩ. Vẫn tiếp tục lớn lên.",
    sky: "#e9e6d8",
    ground: "#aeba8c",
    memories: [
      {
        name: "Hiên nhà",
        description:
          "Sa bàn trở về cùng hình ảnh mái nhà đầu hành trình. Một vòng kể chuyện khép lại, cuộc sống vẫn tiếp diễn.",
      },
      {
        name: "Laptop",
        description:
          "Chiếc laptop bên hiên nhà kết nối công việc ở hiện tại với cội nguồn làng quê.",
      },
      {
        name: "Cánh đồng",
        description:
          "Quê nhà không chỉ là nơi để quay về. Đó còn là những điều mình mang theo trên mọi hành trình.",
      },
    ],
  },
];
