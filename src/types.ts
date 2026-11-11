export type EquipmentCategory =
  | 'ball' // 공운동 (하늘색)
  | 'hoop' // 후프운동 (연두색)
  | 'scarf' // 스카프 운동 (연분홍색)
  | 'stick' // 막대 운동 (연노란색)
  | 'rope' // 줄 운동 (연보라색)
  | 'balloon' // 풍선 운동 (민트색)
  | 'barebody' // 맨몸운동 (연회색)
  | 'other'; // 기타 도구 운동 (밝은 베이지색)

export interface EquipmentStyle {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
}

export const EQUIPMENT_CONFIG: Record<EquipmentCategory, EquipmentStyle> = {
  ball: {
    label: '공운동',
    bgClass: 'bg-[#EBF7FF]',
    textClass: 'text-[#0369A1]',
    borderClass: 'border-[#BAE6FD]',
    badgeBg: 'bg-[#E0F2FE]',
    badgeText: 'text-[#0284C7]',
    badgeBorder: 'border-[#BAE6FD]',
    dotColor: '#0284C7'
  },
  hoop: {
    label: '후프운동',
    bgClass: 'bg-[#F2FBEF]',
    textClass: 'text-[#2E7D32]',
    borderClass: 'border-[#C8E6C9]',
    badgeBg: 'bg-[#E8F8E5]',
    badgeText: 'text-[#2E7D32]',
    badgeBorder: 'border-[#C8E6C9]',
    dotColor: '#4CAF50'
  },
  scarf: {
    label: '스카프 운동',
    bgClass: 'bg-[#FDF2F4]',
    textClass: 'text-[#BE185D]',
    borderClass: 'border-[#FBCFE8]',
    badgeBg: 'bg-[#FCE7F3]',
    badgeText: 'text-[#BE185D]',
    badgeBorder: 'border-[#FBCFE8]',
    dotColor: '#EC4899'
  },
  stick: {
    label: '막대 운동',
    bgClass: 'bg-[#FEFCE8]',
    textClass: 'text-[#A16207]',
    borderClass: 'border-[#FEF08A]',
    badgeBg: 'bg-[#FEF9C3]',
    badgeText: 'text-[#A16207]',
    badgeBorder: 'border-[#FEF08A]',
    dotColor: '#EAB308'
  },
  rope: {
    label: '줄 운동',
    bgClass: 'bg-[#F5F3FF]',
    textClass: 'text-[#6D28D9]',
    borderClass: 'border-[#DDD6FE]',
    badgeBg: 'bg-[#EDE9FE]',
    badgeText: 'text-[#6D28D9]',
    badgeBorder: 'border-[#DDD6FE]',
    dotColor: '#8B5CF6'
  },
  balloon: {
    label: '풍선 운동',
    bgClass: 'bg-[#F0FDFA]',
    textClass: 'text-[#0F766E]',
    borderClass: 'border-[#99F6E4]',
    badgeBg: 'bg-[#CCFBF1]',
    badgeText: 'text-[#0F766E]',
    badgeBorder: 'border-[#99F6E4]',
    dotColor: '#14B8A6'
  },
  barebody: {
    label: '맨몸운동',
    bgClass: 'bg-[#F1F5F9]',
    textClass: 'text-[#475569]',
    borderClass: 'border-[#CBD5E1]',
    badgeBg: 'bg-[#E2E8F0]',
    badgeText: 'text-[#475569]',
    badgeBorder: 'border-[#CBD5E1]',
    dotColor: '#64748B'
  },
  other: {
    label: '기타 도구 운동',
    bgClass: 'bg-[#FAF6F0]',
    textClass: 'text-[#854D0E]',
    borderClass: 'border-[#E7DFD5]',
    badgeBg: 'bg-[#F5EFE6]',
    badgeText: 'text-[#854D0E]',
    badgeBorder: 'border-[#E7DFD5]',
    dotColor: '#D97706'
  }
};

export interface ActivityItem {
  id: number; // 1 to 90
  level: number; // 1, 2, 3
  sequence: number; // 1 to 30 (단계 내 순번) 또는 전체 순번
  step: 1 | 2 | 3; // 1단계, 2단계, 3단계
  stepNumber: number; // 1 to 30
  title: string; // 활동 제목
  type?: 'body' | 'tool'; // 구버전 호환용

  // 새로운 도구별 분류
  equipmentCategory: EquipmentCategory; // 주된 도구 분류
  equipmentName?: string; // 주된 도구 이름 (예: "훌라후프", "볼풀공", "풍선")
  secondaryEquipments?: string[]; // 보조 도구 (예: ["매트", "바구니"])

  body_activity?: boolean;
  equipment_activity?: boolean;
  targetAge?: string; // e.g. "만 3세", "만 4세", "만 5세"
  isDataConnected?: boolean;
  pdf_page: number; // 원본 PDF 연결 페이지 (1단계: 10~39, 2단계: 43~72, 3단계: 76~105)

  // 1. 활동 목표 (JSON objectives 배열)
  objectives?: string[]; // 활동 목표 배열
  goal?: string; // 단일 문자열 호환

  // 2~9 상세 항목 (JSON에 없으면 '원본 자료 연결 준비 중' 표시)
  materials?: string[]; // 2. 준비물
  intro?: string; // 3. 도입
  method?: string[]; // 4. 활동 방법
  teacherInteraction?: string[]; // 5. 교사 상호작용 및 발문
  evaluation?: string[]; // 6. 평가
  safety?: string[]; // 7. 안전 유의사항
  thinkingPlus?: string; // 8. 생각 더하기
  exerciseKnowledge?: string; // 9. 운동지식 더하기
  
  // 10. 관련 영상 및 QR코드 (미확인시 '영상 준비 중' 표시)
  videoUrl?: string | null; // 실제 영상 주소 (유튜브, 비메오, mp4 등)
  qrCodeUrl?: string | null; // QR코드 이미지 URL 또는 추출된 URL
  isVideoReady?: boolean; // 영상 준비 여부
}

export interface TeacherUser {
  id: string;
  name: string;
  institution?: string; // 어린이집/유치원 이름
  className?: string; // 반 이름 (예: 햇살반, 풀잎반)
}

export interface TeacherRecord {
  completedActivityIds: number[];
  notes: Record<number, string>; // activityId -> note text
  lastUpdated: string;
}
