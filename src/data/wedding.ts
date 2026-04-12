export type GiftAccountRow = {
  holder: string;
  bank: string;
  number: string;
};

export type GiftAccountGroup = {
  /** 예: 신랑, 신부, 혼주 */
  groupLabel: string;
  accounts: GiftAccountRow[];
};

export type GiftAccountSide = {
  /** 예: 신랑측, 신부측 */
  sideTitle: string;
  groups: GiftAccountGroup[];
};

export type WeddingData = {
  couple: {
    groom: string;
    bride: string;
  };
  /** 맨 위에 크게 보이는 결혼식 날짜 */
  hero: {
    dateLine: string;
    timeLine?: string;
  };
  /** 히어로 이름 아래 한 줄 문구 */
  headline: string;
  message: string[];
  /** Invitation 인사말 아래 혼주 소개 (부·모 이름 순) */
  familyPresentation: {
    groomParents: [string, string];
    brideParents: [string, string];
    /** true면 신랑 어머니 이름 앞에 「故」 */
    groomMotherGu?: boolean;
  };
  schedule: {
    label: string;
    datetime: string;
    note?: string;
  }[];
  calendarDate: {
    year: number;
    month: number;
    day: number;
    weekday: string;
  };
  venue: {
    name: string;
    hall?: string;
    address: string;
    mapUrl: string;
    /** 지도 미리보기: 위·경도 (VITE_NCPMAP_KEY_ID 있으면 NCP JS 지도, 없으면 OSM iframe 또는 mapEmbedUrl) */
    mapPreview?: { lat: number; lng: number };
    /** 네이버 지도 「공유 → HTML 태그」의 iframe src URL — 있으면 이 값을 우선 사용 */
    mapEmbedUrl?: string;
  };
  directions: {
    venueLabel: string;
    roadAddress: string;
    phone?: string;
    sections: {
      title: string;
      lines: string[];
    }[];
  };
  giftAccounts: {
    groomSide: GiftAccountSide;
    brideSide: GiftAccountSide;
  };
  galleryCaption: string;
};

/** 아래 값만 바꿔서 커스터마이즈하세요 */
export const wedding: WeddingData = {
  couple: {
    groom: "이길호",
    bride: "오예린",
  },
  hero: {
    dateLine: "2025년 5월 23일 토요일",
    timeLine: "오후 3시 30분",
  },
  headline: "따스한 봄날, 결혼합니다",
  message: [
    "서로 다른 길을 걸어온 두 사람이",
    "이제 같은 방향을 바라보며 걸어가려 합니다.",
    "따뜻한 마음으로 지켜봐 주시면",
    "더없는 기쁨으로 간직하겠습니다.",
  ],
  familyPresentation: {
    groomParents: ["이경윤", "장희경"],
    brideParents: ["오성록", "신선이"],
    groomMotherGu: true,
  },
  schedule: [
    { label: "예식", datetime: "2025년 5월 23일 토요일 오후 3시 30분" },
  ],
  calendarDate: {
    year: 2026,
    month: 5,
    day: 23,
    weekday: "토요일",
  },
  venue: {
    name: "더 베르G",
    hall: "가든홀",
    address:
      "서울특별시 영등포구 국회대로 612\n코레일유통사옥 2층",
    mapUrl: "https://map.naver.com/p/entry/place/2070513853",
    /** 당산동3가·국회대로(영등포구청역 쪽). 여의도 국회단지 동쪽 구간과 혼동되지 않도록 경도 ~126.90 */
    mapPreview: { lat: 37.525690, lng: 126.902005 },
  },
  directions: {
    venueLabel: "더베르G",
    roadAddress: "서울시 영등포구 국회대로 612 코레일유통사옥 2층 더베르G",
    phone: "02.2088.5272",
    sections: [
      {
        title: "지하철 이용 시",
        lines: [
          "2호선·5호선 영등포구청역 4번 출구에서 566m (도보 약 7분)",
          "영등포구청역 5번 출구 우리은행 앞 셔틀버스 상시 운행"
        ],
      },
      {
        title: "버스 이용 시",
        lines: [
          "서울시립청소년 문화센터[19-439]: 간선 660",
          "하이서울유스호스텔[19-127]: 일반 5",
          "신화병원[19-121]: 좌석700, 간선 605·661, 간선 760, 지선 5616·5714",
          "삼환아파트[19-125]: 직행 9030, 직행 8000",
        ],
      },
      {
        title: "자가용 이용 시",
        lines: ["네비게이션 [더베르G] 검색", "국회대로 612 2층 / 당산동 3가 2-7"],
      },
      {
        title: "셔틀버스 안내",
        lines: ["영등포구청역 5번 출구 우리은행 앞 ↔ 더베르G 주차장 입구 좌측"],
      },
    ],
  },
  giftAccounts: {
    groomSide: {
      sideTitle: "신랑측",
      groups: [
        {
          groupLabel: "신랑",
          accounts: [{ holder: "이길호", bank: "신한은행", number: "110-331-059140" }],
        },
        {
          groupLabel: "혼주",
          accounts: [
            { holder: "이경윤 (父)", bank: "국민은행", number: "489725-01-011506" },
          ],
        },
      ],
    },
    brideSide: {
      sideTitle: "신부측",
      groups: [
        {
          groupLabel: "신부",
          accounts: [{ holder: "오예린", bank: "하나은행", number: "348-890588-60207" }],
        },
        {
          groupLabel: "혼주",
          accounts: [
            { holder: "오성록 (父)", bank: "하나은행", number: "149-890539-84107" },
            { holder: "신선이 (母)", bank: "하나은행", number: "151-890628-85907" },
          ],
        },
      ],
    },
  },
  galleryCaption: "함께한 순간들",
};
