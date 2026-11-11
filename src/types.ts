
export type EquipmentCategory =
  | 'ball'
  | 'hoop'
  | 'rope'
  | 'balanceBeam'
  | 'mat'
  | 'vaultingBox'
  | 'creative';

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
    label: '공',
    bgClass: 'bg-[#EBF7FF]',
    textClass: 'text-[#0369A1]',
    borderClass: 'border-[#BAE6FD]',
    badgeBg: 'bg-[#E0F2FE]',
    badgeText: 'text-[#0284C7]',
    badgeBorder: 'border-[#BAE6FD]',
    dotColor: '#0284C7'
  },
  hoop: {
    label: '후프',
    bgClass: 'bg-[#F2FBEF]',
    textClass: 'text-[#2E7D32]',
    borderClass: 'border-[#C8E6C9]',
    badgeBg: 'bg-[#E8F8E5]',
    badgeText: 'text-[#2E7D32]',
    badgeBorder: 'border-[#C8E6C9]',
    dotColor: '#4CAF50'
  },
  rope: {
    label: '줄',
    bgClass: 'bg-[#F5F3FF]',
    textClass: 'text-[#6D28D9]',
    borderClass: 'border-[#DDD6FE]',
    badgeBg: 'bg-[#EDE9FE]',
    badgeText: 'text-[#6D28D9]',
    badgeBorder: 'border-[#DDD6FE]',
    dotColor: '#8B5CF6'
  },
  balanceBeam: {
    label: '평균대',
    bgClass: 'bg-[#FEFCE8]',
    textClass: 'text-[#A16207]',
    borderClass: 'border-[#FEF08A]',
    badgeBg: 'bg-[#FEF9C3]',
    badgeText: 'text-[#A16207]',
    badgeBorder: 'border-[#FEF08A]',
    dotColor: '#EAB308'
  },
  mat: {
    label: '매트',
    bgClass: 'bg-[#F0FDFA]',
    textClass: 'text-[#0F766E]',
    borderClass: 'border-[#99F6E4]',
    badgeBg: 'bg-[#CCFBF1]',
    badgeText: 'text-[#0F766E]',
    badgeBorder: 'border-[#99F6E4]',
    dotColor: '#14B8A6'
  },
  vaultingBox: {
    label: '뜀틀',
    bgClass: 'bg-[#FDF2F4]',
    textClass: 'text-[#BE185D]',
    borderClass: 'border-[#FBCFE8]',
    badgeBg: 'bg-[#FCE7F3]',
    badgeText: 'text-[#BE185D]',
    badgeBorder: 'border-[#FBCFE8]',
    dotColor: '#EC4899'
  },
  creative: {
    label: '창의적인 운동도구',
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
  id: number;
  level: number;
  sequence: number;
  step: 1 | 2 | 3;
  stepNumber: number;
  title: string;
  type?: 'body' | 'tool';

  equipmentCategory: EquipmentCategory;
  equipmentName?: string;
  secondaryEquipments?: string[];

  body_activity?: boolean;
  equipment_activity?: boolean;
  targetAge?: string;
  isDataConnected?: boolean;
  pdf_page: number;

  objectives?: string[];
  goal?: string;

  materials?: string[];
  intro?: string;
  method?: string[];
  teacherInteraction?: string[];
  evaluation?: string[];
  safety?: string[];
  thinkingPlus?: string;
  exerciseKnowledge?: string;

  videoUrl?: string | null;
  qrCodeUrl?: string | null;
  isVideoReady?: boolean;
}

export interface TeacherUser {
  id: string;
  name: string;
  institution?: string;
  className?: string;
}

export interface TeacherRecord {
  completedActivityIds: number[];
  notes: Record<number, string>;
  lastUpdated: string;
}
