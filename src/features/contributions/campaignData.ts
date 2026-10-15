export type CampaignDetail = {
    id: string;
    title: string;
    subtitle: string;
    image: number;

    category: string;
    
    organization: string;

    raised: number;
    target: number;
    donors: number;
    daysLeft: number;
    followers: number;
  
    beneficiary: string;
    location: string;
    duration: string;
    supportType: string;
  
    story: string;
    goalDescription: string;
  
    goalStats: {
      icon: "restaurant-outline" | "calendar-outline" | "location-outline";
      value: string;
      label: string;
    }[];
  
    gallery: {
      type: "image" | "video";
      source: number;
      duration?: string;
    }[];
  
    updates: CampaignUpdate[];
    transparency: TransparencyReport[];
    donorList: CampaignDonor[];
  };
  export type CampaignUpdate = {
    date: string;
    title: string;
    text: string;
  
    images?: any[];
  
    more?: string;
  
    likes?: number;
    comments?: number;
  };
  
  export type TransparencyReport = {
    phase: string;
    title: string;
    amount: string;
    amountValue: number;
    date: string;

    receiptCount?: number;
    photoCount?: number;

    receipts?: number[];
    actualImages?: number[];

    images?: number[];
  };
  
  export type CampaignDonor = {
    name: string;
  
    amount: string;
  
    time: string;
  
    message?: string;
  };
  export const campaignData: Record<string, CampaignDetail> = {
    "meal": {
      id: "meal",
  
      title: "Bữa cơm sẻ chia",
      subtitle: "Trao bữa ăn ấm áp đến những người khó khăn.",
  
      image: require("../../../assets/campaigns/meals.webp"),
      
      category: "Cộng đồng",
      organization: "Quỹ Vì cộng đồng NOI",
      
      raised: 12000000,
      target: 20000000,
      donors: 238,
      daysLeft: 12,
      followers: 1250,
  
      beneficiary: "Người dân khó khăn",
      location: "Cần Thơ và các tỉnh lân cận",
      duration: "01/10/2026 – 31/12/2026",
      supportType: "Suất ăn miễn phí và nhu yếu phẩm",
  
      story:
        "Mỗi ngày vẫn còn rất nhiều người dân, đặc biệt là trẻ em, người lao động nghèo, người cao tuổi chưa có được một bữa ăn đầy đủ. Những bữa cơm nhỏ có thể không thay đổi được tất cả, nhưng là nguồn động viên lớn giúp họ vượt qua giai đoạn khó khăn.",
  
      goalDescription:
        "Cung cấp 10.000 suất ăn miễn phí cho người dân khó khăn tại Cần Thơ và các tỉnh lân cận trong 3 tháng tới.",
  
      goalStats: [
        {
          icon: "restaurant-outline",
          value: "10.000",
          label: "suất ăn",
        },
        {
          icon: "calendar-outline",
          value: "3",
          label: "tháng triển khai",
        },
        {
          icon: "location-outline",
          value: "Cần Thơ",
          label: "và các tỉnh lân cận",
        },
      ],
  
      gallery: [
        {
          type: "image",
          source: require("../../../assets/campaigns/community.webp"),
        },
        {
          type: "image",
          source: require("../../../assets/campaigns/meals.webp"),
        },
        {
          type: "image",
          source: require("../../../assets/campaigns/books.webp"),
        },
        {
          type: "image",
          source: require("../../../assets/campaigns/garden.webp"),
        },
      ],
  
      updates: [],
      transparency: [],
      donorList: [],
    },
  
    "school": {
      id: "school",
  
      title: "Tủ sách cho em",
      subtitle: "Mang những trang sách mới đến với trẻ em khó khăn.",
  
      image: require("../../../assets/campaigns/books.webp"),
      
      category: "Giáo dục",

      organization: "Quỹ Giáo dục NOI",
      raised: 8500000,
      target: 15000000,
      donors: 126,
      daysLeft: 20,
      followers: 780,
  
      beneficiary: "Học sinh có hoàn cảnh khó khăn",
      location: "Các trường học vùng khó khăn",
      duration: "01/10/2026 – 30/11/2026",
      supportType: "Sách, truyện và đồ dùng học tập",
  
      story:
        "Nhiều em nhỏ vẫn chưa có điều kiện tiếp cận với sách và tài liệu học tập đầy đủ. Chiến dịch Tủ sách cho em mong muốn mang những cuốn sách mới đến gần hơn với các em.",
  
      goalDescription:
        "Xây dựng các tủ sách cộng đồng và trao tặng sách cho học sinh có hoàn cảnh khó khăn.",
  
      goalStats: [
        {
          icon: "restaurant-outline",
          value: "2.000",
          label: "cuốn sách",
        },
        {
          icon: "calendar-outline",
          value: "2",
          label: "tháng triển khai",
        },
        {
          icon: "location-outline",
          value: "Miền Tây",
          label: "khu vực hỗ trợ",
        },
      ],
  
      gallery: [
        {
          type: "image",
          source: require("../../../assets/campaigns/books.webp"),
        },
        {
          type: "image",
          source: require("../../../assets/campaigns/community.webp"),
        },
      ],
  
      updates: [],
      transparency: [],
      donorList: [],
    },
  
    "garden": {
      id: "garden",
  
      title: "Vườn xanh cho trường",
      subtitle: "Cùng tạo không gian xanh cho các em học sinh.",
  
      image: require("../../../assets/campaigns/garden.webp"),
      category: "Môi trường",

      organization: "Quỹ Vì môi trường",
      raised: 6200000,
      target: 10000000,
      donors: 95,
      daysLeft: 15,
      followers: 430,
  
      beneficiary: "Học sinh và nhà trường",
      location: "Cần Thơ",
      duration: "15/09/2026 – 30/11/2026",
      supportType: "Cây xanh và cải tạo khuôn viên",
  
      story:
        "Chiến dịch hướng đến việc cải tạo những khoảng sân còn trống thành không gian xanh, sạch và thân thiện hơn cho học sinh.",
  
      goalDescription:
        "Trồng cây xanh và cải tạo khuôn viên trường học để tạo môi trường học tập gần gũi với thiên nhiên.",
  
      goalStats: [
        {
          icon: "restaurant-outline",
          value: "500",
          label: "cây xanh",
        },
        {
          icon: "calendar-outline",
          value: "2",
          label: "tháng triển khai",
        },
        {
          icon: "location-outline",
          value: "Cần Thơ",
          label: "khu vực thực hiện",
        },
      ],
  
      gallery: [
        {
          type: "image",
          source: require("../../../assets/campaigns/garden.webp"),
        },
        {
          type: "image",
          source: require("../../../assets/campaigns/community.webp"),
        },
      ],
  
      updates: [],
      transparency: [],
      donorList: [],
    },
    elderly: {
      id: "elderly",
    
      title: "Nhịp cầu yêu thương",
    
      subtitle:
        "Hỗ trợ nhu yếu phẩm, chăm sóc sức khỏe cho người già neo đơn.",
    
      category: "Người già",
    
      organization: "Quỹ Vì cộng đồng NOI",
    
      image: require("../../../assets/campaigns/community.webp"),
    
      raised: 28500000,
    
      target: 50000000,
    
      donors: 421,
    
      daysLeft: 18,
    
      followers: 860,
    
      beneficiary:
        "Người cao tuổi neo đơn và có hoàn cảnh khó khăn",
    
      location:
        "Các khu vực cộng đồng cần hỗ trợ",
    
      duration:
        "Trong thời gian chiến dịch diễn ra",
    
      supportType:
        "Nhu yếu phẩm và chăm sóc sức khỏe",
    
      story:
        "Chiến dịch Nhịp cầu yêu thương được thực hiện nhằm hỗ trợ những người cao tuổi neo đơn, có hoàn cảnh khó khăn. Mỗi đóng góp sẽ góp phần mang đến nhu yếu phẩm thiết yếu, sự quan tâm và hỗ trợ chăm sóc sức khỏe.",
    
      goalDescription:
        "Gây quỹ để hỗ trợ nhu yếu phẩm và các hoạt động chăm sóc sức khỏe cho người cao tuổi có hoàn cảnh khó khăn.",
    
      goalStats: [
        {
          icon: "restaurant-outline",
          value: "Nhu yếu phẩm",
          label: "Hỗ trợ thiết yếu",
        },
    
        {
          icon: "calendar-outline",
          value: "18 ngày",
          label: "Thời gian còn lại",
        },
    
        {
          icon: "location-outline",
          value: "Cộng đồng",
          label: "Khu vực hỗ trợ",
        },
      ],
    
      gallery: [],
    
      updates: [
        {
          date: "01/10/2026",
      
          title:
            "Trao nhu yếu phẩm đến người cao tuổi",
      
          text:
            "Đội ngũ thiện nguyện đã trao các phần quà thiết yếu đến những người cao tuổi có hoàn cảnh khó khăn.",
      
            images: [
              require("../../../assets/campaigns/meals.webp"),
              require("../../../assets/campaigns/community.webp"),
              require("../../../assets/campaigns/garden.webp"),
              require("../../../assets/campaigns/books.webp"),
            ],
      
          likes: 86,
          comments: 7,
        },
      
        {
          date: "26/09/2026",
      
          title:
            "Chuẩn bị các phần quà hỗ trợ",
      
          text:
            "Các tình nguyện viên đang phân loại và chuẩn bị nhu yếu phẩm cho đợt hỗ trợ tiếp theo.",
          
            images: [
              require("../../../assets/campaigns/meals.webp"),
              require("../../../assets/campaigns/community.webp"),
              require("../../../assets/campaigns/garden.webp"),
              require("../../../assets/campaigns/books.webp"),
            ],

          likes: 64,
          comments: 5,
        },
      ],
      
      transparency: [
        {
          phase: "Đợt 1",
      
          title:
            "Mua nhu yếu phẩm hỗ trợ",
      
          amount: "8.500.000đ",
      
          amountValue: 8500000,
      
          date: "01/10/2026",
      
          receiptCount: 4,
      
          photoCount: 6,
      
          receipts: [
            require("../../../assets/campaigns/meals.webp"),
            require("../../../assets/campaigns/community.webp"),
            require("../../../assets/campaigns/books.webp"),
          ],
        
          actualImages: [
            require("../../../assets/campaigns/garden.webp"),
            require("../../../assets/campaigns/meals.webp"),
            require("../../../assets/campaigns/community.webp"),
            require("../../../assets/campaigns/books.webp"),
          ],
        },
      
        {
          phase: "Đợt 2",
      
          title:
            "Hỗ trợ chăm sóc sức khỏe",
      
          amount: "5.000.000đ",
      
          amountValue: 5000000,
      
          date: "28/09/2026",
      
          receiptCount: 3,
      
          photoCount: 4,
      
          receipts: [
            require("../../../assets/campaigns/meals.webp"),
            require("../../../assets/campaigns/community.webp"),
            require("../../../assets/campaigns/books.webp"),
          ],
        
          actualImages: [
            require("../../../assets/campaigns/garden.webp"),
            require("../../../assets/campaigns/meals.webp"),
            require("../../../assets/campaigns/community.webp"),
            require("../../../assets/campaigns/books.webp"),
          ],
        },
      ],
      
      donorList: [
        {
          name: "Nguyễn Minh Anh",
      
          amount: "500.000đ",
      
          time: "12 phút trước",
      
          message:
            "Chúc các ông bà luôn mạnh khỏe.",
        },
      
        {
          name: "Nhà hảo tâm ẩn danh",
      
          amount: "1.000.000đ",
      
          time: "35 phút trước",
      
          message:
            "Một chút tấm lòng gửi đến chiến dịch.",
        },
      
        {
          name: "Trần Hoàng Nam",
      
          amount: "300.000đ",
      
          time: "1 giờ trước",
      
          message:
            "Mong chiến dịch lan tỏa được nhiều yêu thương.",
        },
      ],
    },
    flood: {
      id: "flood",
    
      title: "Chung tay sau bão lũ",
    
      subtitle:
        "Hỗ trợ người dân vùng bị ảnh hưởng bởi thiên tai, bão lũ.",
    
      category: "Thiên tai",
    
      organization: "Quỹ Vì cộng đồng NOI",
    
      image: require("../../../assets/campaigns/community.webp"),
    
      raised: 62000000,
    
      target: 100000000,
    
      donors: 892,
    
      daysLeft: 10,
    
      followers: 1520,
    
      beneficiary:
        "Người dân bị ảnh hưởng bởi thiên tai, bão lũ",
    
      location:
        "Các khu vực chịu ảnh hưởng bởi thiên tai",
    
      duration:
        "10 ngày còn lại",
    
      supportType:
        "Nhu yếu phẩm và hỗ trợ khẩn cấp",
    
      story:
        "Chiến dịch Chung tay sau bão lũ hướng đến hỗ trợ người dân tại các khu vực bị ảnh hưởng bởi thiên tai. Nguồn đóng góp được sử dụng cho các nhu cầu thiết yếu và hoạt động hỗ trợ khẩn cấp.",
    
      goalDescription:
        "Huy động nguồn lực để hỗ trợ người dân sớm ổn định cuộc sống sau thiên tai.",
    
      goalStats: [
        {
          icon: "restaurant-outline",
          value: "Khẩn cấp",
          label: "Hỗ trợ thiết yếu",
        },
    
        {
          icon: "calendar-outline",
          value: "10 ngày",
          label: "Thời gian còn lại",
        },
    
        {
          icon: "location-outline",
          value: "Vùng bão lũ",
          label: "Khu vực hỗ trợ",
        },
      ],
    
      gallery: [],
    
      updates: [],
    
      transparency: [],
    
      donorList: [],
    },
    winter: {
      id: "winter",
    
      title: "Sưởi ấm mùa đông",
    
      subtitle:
        "Trao áo ấm, chăn mềm cho trẻ em vùng cao trong mùa đông.",
    
      category: "Trẻ em",
    
      organization: "Quỹ Vì cộng đồng NOI",
    
      image: require("../../../assets/campaigns/community.webp"),
    
      raised: 35000000,
    
      target: 60000000,
    
      donors: 512,
    
      daysLeft: 14,
    
      followers: 980,
    
      beneficiary:
        "Trẻ em có hoàn cảnh khó khăn tại vùng cao",
    
      location:
        "Khu vực vùng cao",
    
      duration:
        "14 ngày còn lại",
    
      supportType:
        "Áo ấm, chăn và vật dụng mùa đông",
    
      story:
        "Sưởi ấm mùa đông là chiến dịch hỗ trợ trẻ em vùng cao trong những tháng thời tiết lạnh. Những phần quà như áo ấm và chăn sẽ giúp các em có điều kiện sinh hoạt tốt hơn.",
    
      goalDescription:
        "Gây quỹ để chuẩn bị áo ấm, chăn và các vật dụng cần thiết cho trẻ em vùng cao.",
    
      goalStats: [
        {
          icon: "restaurant-outline",
          value: "Áo ấm",
          label: "Hình thức hỗ trợ",
        },
    
        {
          icon: "calendar-outline",
          value: "14 ngày",
          label: "Thời gian còn lại",
        },
    
        {
          icon: "location-outline",
          value: "Vùng cao",
          label: "Khu vực hỗ trợ",
        },
      ],
    
      gallery: [],
    
      updates: [],
    
      transparency: [],
    
      donorList: [],
    },
    minh: {
      id: "minh",
    
      title: "Điều trị cho bé Minh",
    
      subtitle:
        "Hỗ trợ chi phí điều trị bệnh tim bẩm sinh cho bé Minh.",
    
      category: "Y tế",
    
      organization: "Chiến dịch cá nhân",
    
      image: require("../../../assets/campaigns/community.webp"),
    
      raised: 46200000,
    
      target: 80000000,
    
      donors: 615,
    
      daysLeft: 20,
    
      followers: 1240,
    
      beneficiary:
        "Bé Minh và gia đình",
    
      location:
        "Việt Nam",
    
      duration:
        "20 ngày còn lại",
    
      supportType:
        "Chi phí điều trị y tế",
    
      story:
        "Chiến dịch được tạo nhằm hỗ trợ chi phí điều trị cho bé Minh. Những khoản đóng góp sẽ giúp gia đình giảm bớt áp lực tài chính trong quá trình điều trị.",
    
      goalDescription:
        "Gây quỹ hỗ trợ chi phí điều trị và các khoản liên quan trong quá trình chăm sóc bé Minh.",
    
      goalStats: [
        {
          icon: "restaurant-outline",
          value: "Y tế",
          label: "Mục đích hỗ trợ",
        },
    
        {
          icon: "calendar-outline",
          value: "20 ngày",
          label: "Thời gian còn lại",
        },
    
        {
          icon: "location-outline",
          value: "Việt Nam",
          label: "Khu vực",
        },
      ],
    
      gallery: [],
    
      updates: [],
    
      transparency: [],
    
      donorList: [],
    },
    home: {
      id: "home",
    
      title: "Mái ấm cho bà Năm",
    
      subtitle:
        "Xây lại căn nhà an toàn, kiên cố cho bà Năm neo đơn.",
    
      category: "Nhà ở",
    
      organization: "Chiến dịch cá nhân",
    
      image: require("../../../assets/campaigns/community.webp"),
    
      raised: 32000000,
    
      target: 70000000,
    
      donors: 280,
    
      daysLeft: 25,
    
      followers: 720,
    
      beneficiary:
        "Bà Năm",
    
      location:
        "Khu vực địa phương",
    
      duration:
        "25 ngày còn lại",
    
      supportType:
        "Hỗ trợ xây dựng nhà ở",
    
      story:
        "Chiến dịch Mái ấm cho bà Năm được tạo nhằm hỗ trợ xây dựng lại căn nhà an toàn và kiên cố hơn cho bà. Mỗi sự đóng góp đều góp phần giúp bà có nơi ở ổn định.",
    
      goalDescription:
        "Gây quỹ để hỗ trợ chi phí vật liệu và xây dựng lại căn nhà.",
    
      goalStats: [
        {
          icon: "restaurant-outline",
          value: "Nhà ở",
          label: "Mục tiêu hỗ trợ",
        },
    
        {
          icon: "calendar-outline",
          value: "25 ngày",
          label: "Thời gian còn lại",
        },
    
        {
          icon: "location-outline",
          value: "Địa phương",
          label: "Khu vực hỗ trợ",
        },
      ],
    
      gallery: [],
    
      updates: [],
    
      transparency: [],
    
      donorList: [],
    },
    children: {
      id: "children",
    
      title: "Bữa ăn cho em nhỏ vùng cao",
    
      subtitle:
        "Hỗ trợ bữa ăn dinh dưỡng hằng ngày cho trẻ em vùng cao.",
    
      category: "Xóa đói",
    
      organization: "Chiến dịch cá nhân",
    
      image: require("../../../assets/campaigns/meals.webp"),
    
      raised: 24000000,
    
      target: 50000000,
    
      donors: 367,
    
      daysLeft: 17,
    
      followers: 940,
    
      beneficiary:
        "Trẻ em có hoàn cảnh khó khăn tại vùng cao",
    
      location:
        "Khu vực vùng cao",
    
      duration:
        "17 ngày còn lại",
    
      supportType:
        "Bữa ăn dinh dưỡng",
    
      story:
        "Chiến dịch Bữa ăn cho em nhỏ vùng cao được thực hiện nhằm góp phần cung cấp những bữa ăn đầy đủ hơn cho trẻ em có hoàn cảnh khó khăn.",
    
      goalDescription:
        "Gây quỹ hỗ trợ các bữa ăn dinh dưỡng cho trẻ em vùng cao.",
    
      goalStats: [
        {
          icon: "restaurant-outline",
          value: "Bữa ăn",
          label: "Hình thức hỗ trợ",
        },
    
        {
          icon: "calendar-outline",
          value: "17 ngày",
          label: "Thời gian còn lại",
        },
    
        {
          icon: "location-outline",
          value: "Vùng cao",
          label: "Khu vực hỗ trợ",
        },
      ],
    
      gallery: [],
    
      updates: [],
    
      transparency: [],
    
      donorList: [],
    },
  };

