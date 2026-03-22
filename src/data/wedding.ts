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
  headline: string;
  subline: string;
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
  venue: {
    name: string;
    hall?: string;
    address: string;
    mapUrl: string;
    /** 지도 미리보기: 네이버 지도 중심 좌표(WGS84). 네이버 지도에서 장소 기준으로 확인 후 입력 */
    mapPreview?: { lat: number; lng: number };
    /**
     * 네이버 클라우드 플랫폼 Dynamic Map 클라이언트 ID.
     * 설정 시 Open API v3로 실제 지도(살롱드레터형). 없으면 iframe(v5/OSM)만 사용.
     * 배포 시에는 `.env`의 `VITE_NAVER_MAP_CLIENT_ID`로 넣어도 됩니다.
     */
    naverMapClientId?: string;
    /** 스크립트 쿼리 파라미터 이름 — 콘솔에 맞게 `ncpClientId` 또는 `ncpKeyId` */
    naverMapScriptQuery?: "ncpClientId" | "ncpKeyId";
    /** 네이버 지도 「공유 → HTML 태그」의 iframe src — JS 지도 미사용 시 최우선 */
    mapEmbedUrl?: string;
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
  headline: "저희 두 사람이 사랑으로 하나가 됩니다",
  subline: "소중한 걸음으로 축복해 주시면 감사하겠습니다",
  message: [
    "서로 다른 길을 걸어온 두 사람이",
    "이제 같은 방향을 바라보며 걸어가려 합니다.",
    "따뜻한 마음으로 지켜봐 주시면",
    "큰 기쁨이 되겠습니다.",
  ],
  familyPresentation: {
    groomParents: ["이경윤", "장희경"],
    brideParents: ["오성록", "신선이"],
    groomMotherGu: true,
  },
  schedule: [
    { label: "예식", datetime: "2025년 5월 23일 토요일 오후 3시 30분" },
    { label: "피로연", datetime: "오후 6시", note: "서울 영등포구 도림로147길 22 2층 우비공" },
  ],
  venue: {
    name: "더 베르G",
    hall: "가든홀",
    address: "서울특별시 영등포구 국회대로 612 코레일유통사옥 2층",
    mapUrl: "https://map.naver.com/p/entry/place/2070513853",
    /** 당산동3가·국회대로(영등포구청역 쪽). 여의도 국회단지 동쪽 구간과 혼동되지 않도록 경도 ~126.90 */
    mapPreview: { lat: 37.525690, lng: 126.902005 },
    naverMapClientId: "o6g15fands",
    /** 지도가 비면 콘솔 스크립트가 `ncpKeyId=` 형태인지 확인 후 아래 주석 해제 */
    // naverMapScriptQuery: "ncpKeyId",
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
            { holder: "이경윤 (父)", bank: "국민은행", number: "489725-01-011056" },
          ],
        },
      ],
    },
    brideSide: {
      sideTitle: "신부측",
      groups: [
        {
          groupLabel: "신부",
          accounts: [{ holder: "오예린", bank: "카카오뱅크", number: "3333-02-5292878" }],
        },
        {
          groupLabel: "혼주",
          accounts: [
            { holder: "오성록 (父)", bank: "하나은행", number: "151-890628-85907" },
            { holder: "신선이 (母)", bank: "하나은행", number: "149-890539-84107" },
          ],
        },
      ],
    },
  },
  galleryCaption: "함께한 순간들",
};
