import { ActivityItem, EquipmentCategory } from '../types';

interface EquipmentMappingRule {
  category: EquipmentCategory;
  name: string;
  secondary?: string[];
  materials?: string[];
}

// 90개 활동 정밀 도구 매핑 기준
// 1단계(1~30), 2단계(31~60), 3단계(61~90)
export const ACTIVITY_EQUIPMENT_RULES: Record<number, EquipmentMappingRule> = {
  // === 1단계 (만 3세) ===
  1: { category: 'barebody', name: '맨몸', secondary: [], materials: ['편안한 운동복'] },
  2: { category: 'scarf', name: '스카프', secondary: ['바구니'], materials: ['알록달록 실크 스카프', '수거 바구니'] },
  3: { category: 'barebody', name: '맨몸', secondary: [], materials: ['음악 재생기'] },
  4: { category: 'hoop', name: '훌라후프', secondary: ['미끄럼방지 패드'], materials: ['소형 훌라후프 6~8개', '바닥 고정 테이프'] },
  5: { category: 'barebody', name: '맨몸 (매트)', secondary: ['안전매트'], materials: ['유아용 안전 롤매트'] },
  6: { category: 'other', name: '신문지', secondary: ['바구니'], materials: ['재활용 신문지', '수거함 바구니'] },
  7: { category: 'barebody', name: '맨몸', secondary: [], materials: ['신체 부위 그림카드'] },
  8: { category: 'balloon', name: '풍선', secondary: ['부채'], materials: ['알록달록 라텍스 풍선', '유아용 부채'] },
  9: { category: 'other', name: '플레이터널', secondary: ['매트'], materials: ['접이식 천 터널', '바닥 매트'] },
  10: { category: 'other', name: '콩주머니', secondary: ['과녁판'], materials: ['색동 콩주머니', '바닥 원형 과녁판'] },
  11: { category: 'barebody', name: '맨몸', secondary: [], materials: ['동물 머리띠'] },
  12: { category: 'other', name: '색깔 고깔(콘)', secondary: ['꼬리 끈'], materials: ['소형 마커콘', '벨크로 꼬리 벨트'] },
  13: { category: 'other', name: '평균대(외나무다리)', secondary: ['매트'], materials: ['스펀지 소프트 평균대', '보호 매트'] },
  14: { category: 'other', name: '종이컵', secondary: ['소프트볼'], materials: ['대형 종이컵 30개', '폭신한 스펀지볼'] },
  15: { category: 'barebody', name: '맨몸', secondary: [], materials: ['징 또는 탬버린'] },
  16: { category: 'other', name: '스펀지 쿠션/베개', secondary: ['매트'], materials: ['폭신한 쿠션 블록 6개'] },
  17: { category: 'barebody', name: '맨몸 (바람개비)', secondary: ['바람개비'], materials: ['종이 바람개비'] },
  18: { category: 'ball', name: '볼풀공', secondary: ['숟가락/국자'], materials: ['색깔 볼풀공 50개', '유아용 국자', '바구니'] },
  19: { category: 'barebody', name: '맨몸', secondary: [], materials: ['신나는 동요 음원'] },
  20: { category: 'stick', name: '리본 막대', secondary: ['음원'], materials: ['체조용 손잡이 리본 막대'] },
  21: { category: 'barebody', name: '맨몸', secondary: ['연못 시트'], materials: ['연못 모양 바닥 시트'] },
  22: { category: 'other', name: '스펀지 블록', secondary: ['매트'], materials: ['EVA 소프트 블록 10개'] },
  23: { category: 'barebody', name: '맨몸', secondary: [], materials: ['얼음 빙판 바닥 표시 테이프'] },
  24: { category: 'rope', name: '줄 (밧줄)', secondary: ['매트'], materials: ['부드러운 면 밧줄(5m)'] },
  25: { category: 'barebody', name: '맨몸', secondary: [], materials: ['오리 인형/모자'] },
  26: { category: 'ball', name: '탱탱볼', secondary: ['바구니'], materials: ['소형 고무 탱탱볼 20개'] },
  27: { category: 'barebody', name: '맨몸', secondary: [], materials: ['우주 배경 음악'] },
  28: { category: 'other', name: '종이 접시', secondary: ['신호등 카드'], materials: ['두꺼운 종이 접시', '신호등 색깔 카드'] },
  29: { category: 'barebody', name: '맨몸 (그림자)', secondary: ['조명'], materials: ['프로젝터 또는 자연광'] },
  30: { category: 'other', name: '비눗방울', secondary: [], materials: ['무독성 비눗방울 놀이 세트'] },

  // === 2단계 (만 4세) ===
  31: { category: 'rope', name: '고무줄/끈 (레이저)', secondary: ['고깔'], materials: ['형광 고무줄', '고깔 지지대'] },
  32: { category: 'other', name: '고깔(콘)', secondary: ['바닥 마커'], materials: ['컬러 트래픽 콘 8개'] },
  33: { category: 'barebody', name: '맨몸', secondary: [], materials: ['초시계', '중심잡기 매트'] },
  34: { category: 'ball', name: '탁구공', secondary: ['계란판'], materials: ['컬러 탁구공 30개', '종이 계란판'] },
  35: { category: 'barebody', name: '맨몸', secondary: [], materials: ['방울 소리 센서/종'] },
  36: { category: 'hoop', name: '훌라후프', secondary: ['끈'], materials: ['중형 훌라후프 10개'] },
  37: { category: 'barebody', name: '맨몸', secondary: [], materials: ['동물 동작 카드'] },
  38: { category: 'other', name: '낙하산(파라슈트)', secondary: ['음악'], materials: ['유아용 12인 파라슈트'] },
  39: { category: 'barebody', name: '맨몸 (점프)', secondary: ['마커'], materials: ['발자국 바닥 스티커'] },
  40: { category: 'other', name: '콩주머니', secondary: ['라인 테이프'], materials: ['컬러 콩주머니 20개'] },
  41: { category: 'barebody', name: '맨몸', secondary: [], materials: ['바닥 라인 테이프'] },
  42: { category: 'ball', name: '볼링공 (볼링핀)', secondary: ['볼링핀'], materials: ['플라스틱 볼링핀 10개', '미니 볼링공 2개'] },
  43: { category: 'balloon', name: '풍선', secondary: ['간이 네트'], materials: ['풍선 10개', '체육실 간이 네트'] },
  44: { category: 'rope', name: '사다리 (스피드 래더)', secondary: [], materials: ['바닥 민첩성 스텝 사다리'] },
  45: { category: 'other', name: '플라잉디스크', secondary: ['타깃 바구니'], materials: ['소프트 EVA 원반', '원형 타깃'] },
  46: { category: 'barebody', name: '맨몸 (짝운동)', secondary: ['매트'], materials: ['2인 안전 매트'] },
  47: { category: 'stick', name: '스틱 막대기', secondary: [], materials: ['스펀지 체육 스틱 20개'] },
  48: { category: 'barebody', name: '맨몸', secondary: ['호루라기'], materials: ['안전 호루라기'] },
  49: { category: 'rope', name: '고무줄 (탄성 밴드)', secondary: ['지지대'], materials: ['유아용 소프트 탄성 밴드'] },
  50: { category: 'barebody', name: '맨몸 (태권도)', secondary: ['미트'], materials: ['타격 핸드 미트'] },
  51: { category: 'ball', name: '스쿠프 & 볼', secondary: ['스쿠프'], materials: ['스쿠프 라켓 4쌍', '구멍 뚫린 플라스틱 공'] },
  52: { category: 'barebody', name: '맨몸', secondary: ['체조 매트'], materials: ['개인용 체조 매트'] },
  53: { category: 'other', name: '색깔 매트', secondary: ['신호 깃발'], materials: ['4색 스펀지 조각 매트'] },
  54: { category: 'barebody', name: '맨몸 (댄스)', secondary: ['신나는 음악'], materials: ['리듬 체육 음원'] },
  55: { category: 'stick', name: '라켓 (셔틀콕)', secondary: ['셔틀콕'], materials: ['빅 라켓 4개', '대형 셔틀콕'] },
  56: { category: 'barebody', name: '맨몸', secondary: ['라인 테이프'], materials: ['지그재그 바닥 가이드'] },
  57: { category: 'other', name: '점보 컵 (스피드스택스)', secondary: [], materials: ['대형 스피드스택스 컵 세트'] },
  58: { category: 'other', name: '철봉 (늑목/사다리)', secondary: ['안전 매트'], materials: ['유아용 실내 철봉대', '도톰한 낙하 방지 매트'] },
  59: { category: 'ball', name: '패러슈트 & 볼', secondary: ['패러슈트'], materials: ['파라슈트 1개', '볼풀공 100개'] },
  60: { category: 'barebody', name: '맨몸', secondary: ['동서남북 마커'], materials: ['방향 지시 화살표 카드'] },

  // === 3단계 (만 5세) ===
  61: { category: 'barebody', name: '맨몸 (벽 지지)', secondary: ['클라이밍 벽/매트'], materials: ['벽면 지지대', '안전 완충 매트'] },
  62: { category: 'stick', name: '하키 스틱', secondary: ['미니 골대', '퍽/볼'], materials: ['소프트 플라스틱 하키 스틱 6개', '안전 볼', '미니 골대'] },
  63: { category: 'stick', name: '이어달리기 바통', secondary: ['고깔'], materials: ['소프트 컬러 바통 4개'] },
  64: { category: 'rope', name: '줄넘기', secondary: [], materials: ['길이 조절용 유아 줄넘기'] },
  65: { category: 'barebody', name: '맨몸 (협동 체조)', secondary: ['매트'], materials: ['다인용 대형 매트'] },
  66: { category: 'ball', name: '킨볼 (대형 볼)', secondary: [], materials: ['지름 84cm 킨볼 공'] },
  67: { category: 'barebody', name: '맨몸 (셔틀런)', secondary: ['마커 콘'], materials: ['반환점 콘', '음원'] },
  68: { category: 'ball', name: '보치아 공', secondary: ['표적구'], materials: ['유아용 소프트 보치아 공 세트'] },
  69: { category: 'barebody', name: '맨몸 (앞구르기)', secondary: ['경사 매트'], materials: ['삼각 경사 매트', '체조 보조 쿠션'] },
  70: { category: 'stick', name: '티볼 배트', secondary: ['배팅 티', '안전구'], materials: ['우레탄 배트', '배팅 티대', '스펀지 야구공'] },
  71: { category: 'barebody', name: '맨몸 (포복)', secondary: ['장애물 네트'], materials: ['낮은 그물 네트', '바닥 매트'] },
  72: { category: 'stick', name: '플로어볼 스틱', secondary: ['플로어볼', '콘'], materials: ['플로어볼 스틱 6개', '구멍볼 4개'] },
  73: { category: 'barebody', name: '맨몸 (짝체조)', secondary: ['안전 매트'], materials: ['체조 매트 4장'] },
  74: { category: 'other', name: '뜀틀', secondary: ['발판', '착지 매트'], materials: ['소프트 4단 뜀틀', '구름판', '착지 안전 매트'] },
  75: { category: 'other', name: '씨름 샅바', secondary: ['원형 매트'], materials: ['유아용 컬러 샅바', '원형 씨름 매트'] },
  76: { category: 'stick', name: '배드민턴 라켓', secondary: ['빅 셔틀콕', '간이 네트'], materials: ['숏 배드민턴 라켓 4개', '점보 셔틀콕'] },
  77: { category: 'barebody', name: '맨몸', secondary: [], materials: ['암호 동작 카드'] },
  78: { category: 'other', name: '스텝박스', secondary: ['신나는 음악'], materials: ['높이 조절 에어로빅 스텝박스'] },
  79: { category: 'barebody', name: '맨몸', secondary: ['매트'], materials: ['팔굽혀펴기 유아 지지 매트'] },
  80: { category: 'other', name: '인디아카', secondary: ['네트'], materials: ['깃털 인디아카 공 4개'] },
  81: { category: 'other', name: '슬라이드 보드(스케이트)', secondary: ['덧신'], materials: ['미끄럼 시트', '부직포 덧신'] },
  82: { category: 'ball', name: '농구공', secondary: ['미니 농구 골대'], materials: ['유아용 3호 농구공', '이동식 미니 골대'] },
  83: { category: 'barebody', name: '맨몸', secondary: [], materials: ['출발선 및 결승선 테이프'] },
  84: { category: 'other', name: '밸런스 보드', secondary: ['매트'], materials: ['목재 또는 플라스틱 워블 보드'] },
  85: { category: 'barebody', name: '맨몸 (기차놀이)', secondary: ['꼬리 띠'], materials: ['팀별 색깔 조끼'] },
  86: { category: 'ball', name: '츄크볼 (리바운더)', secondary: ['반사 네트', '핸드볼'], materials: ['기울기 조절 네트', '소프트 핸드볼'] },
  87: { category: 'rope', name: '발목 묶기 끈 (3인4각)', secondary: ['고깔'], materials: ['벨크로 다리 밴드 6쌍'] },
  88: { category: 'other', name: '플라잉디스크', secondary: ['팀 조끼'], materials: ['얼티미트 규격 소프트 원반'] },
  89: { category: 'barebody', name: '맨몸', secondary: ['팀 깃발'], materials: ['선장 모자', '팀 깃발'] },
  90: { category: 'ball', name: '빅볼 (대형 짐볼)', secondary: ['결승점 콘'], materials: ['지름 65cm 짐볼 4개'] }
};

export const getEquipmentRule = (activityId: number): EquipmentMappingRule => {
  return (
    ACTIVITY_EQUIPMENT_RULES[activityId] || {
      category: 'barebody',
      name: '맨몸',
      secondary: [],
      materials: ['편안한 운동복']
    }
  );
};
