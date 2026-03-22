export type WeddingData = {
  couple: {
    groom: string;
    bride: string;
  };
  headline: string;
  subline: string;
  message: string[];
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
  };
  accounts: {
    holder: string;
    bank: string;
    number: string;
  }[];
  galleryCaption: string;
};

/** 아래 값만 바꿔서 커스터마이즈하세요 */
export const wedding: WeddingData = {
  couple: {
    groom: "이길호",
    bride: "오예린",
  },
  headline: "저희 두 사람이 사랑으로 하나가 됩니다",
  subline: "소중한 걸음으로 축복해 주시면 감사하겠습니다",
  message: [
    "서로 다른 길을 걸어온 두 사람이",
    "이제 같은 방향을 바라보며 걸어가려 합니다.",
    "따뜻한 마음으로 지켜봐 주시면 큰 기쁨이 되겠습니다.",
  ],
  schedule: [
    { label: "예식", datetime: "2025년 5월 23일 토요일 오후 3시 30분" },
    { label: "피로연", datetime: "오후 3시 30분", note: "예식 직후 동일 장소" },
  ],
  venue: {
    name: "더 베르G",
    hall: "가든홀",
    address: "서울특별시 영등포구 국회대로 612 2층",
    mapUrl: "https://map.naver.com/p/entry/place/2070513853",
  },
  accounts: [
    { holder: "이길호", bank: "국민은행", number: "123456-78-901234" },
    { holder: "오예린", bank: "신한은행", number: "110-123-456789" },
  ],
  galleryCaption: "함께한 순간들",
};
