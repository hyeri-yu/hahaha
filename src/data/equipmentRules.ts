import { EquipmentCategory } from '../types';

interface EquipmentMappingRule {
  category: EquipmentCategory;
  name: string;
  secondary: string[];
  materials: string[];
}

// 원본 PDF의 차시별 ‘도구를 이용한 운동’ 활동명과 자료 항목을 기준으로 구성합니다.
// ID 1~30: 1단계, 31~60: 2단계, 61~90: 3단계
export const ACTIVITY_EQUIPMENT_RULES: Record<number, EquipmentMappingRule> = {
  1: { category: 'ball', name: "공", secondary: [], materials: ["다양한 공(고무 공, 스펀지 공, 소프트볼, 비치볼 등) 유아 수만큼"] }, // 1단계 1차시: 공 탐색하기
  2: { category: 'ball', name: "공", secondary: [], materials: ["소프트볼 유아 수만큼, 마스킹 테이프"] }, // 1단계 2차시: 공 던지기
  3: { category: 'ball', name: "공", secondary: [], materials: ["다양한 색의 풍선과 공 여러 개"] }, // 1단계 3차시: 공 차기
  4: { category: 'creative', name: "백업", secondary: [], materials: ["1m 길이 백업(지름 5cm) 유아 수만큼, 다양한 공"] }, // 1단계 4차시: 백업으로 공 치기
  5: { category: 'ball', name: "공", secondary: [], materials: ["소프트볼 유아 수만큼"] }, // 1단계 5차시: 둘이서 공 굴리기
  6: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 유아 수만큼"] }, // 1단계 6차시: 후프 탐색하기
  7: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 유아 수만큼, 색테이프"] }, // 1단계 7차시: 후프에서 걷기와 뛰기
  8: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 유아 수만큼"] }, // 1단계 8차시: 후프 통과하기
  9: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 5~10개, 5개 이어붙인 후프"] }, // 1단계 9차시: 후프 터널 통과하기
  10: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 유아 수만큼"] }, // 1단계 10차시: 후프 자동차 놀이
  11: { category: 'rope', name: "줄", secondary: [], materials: ["줄 유아 수만큼"] }, // 1단계 11차시: 줄 탐색하기
  12: { category: 'rope', name: "줄", secondary: [], materials: ["긴 줄 여러 개"] }, // 1단계 12차시: 줄 위 걷기
  13: { category: 'rope', name: "줄", secondary: [], materials: ["빠져나갈 수 있는 가구나 도구, 긴 줄 여러 개"] }, // 1단계 13차시: 줄 지나가기
  14: { category: 'rope', name: "줄", secondary: [], materials: ["줄 유아 수만큼"] }, // 1단계 14차시: 줄로 다양한 공간 만들어 움직이기
  15: { category: 'rope', name: "줄", secondary: [], materials: ["긴 줄 여러 개"] }, // 1단계 15차시: 연속된 줄 지나가기
  16: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["평균대, 매트"] }, // 1단계 16차시: 평균대 탐색하기
  17: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["평균대"] }, // 1단계 17차시: 평균대 위, 아래 지나가기
  18: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["평균대, 매트"] }, // 1단계 18차시: 평균대에서 기어가기
  19: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["좋아하는 캐릭터나 그림, 평균대"] }, // 1단계 19차시: 평균대에서 지탱하기
  20: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["평균대, 매트, 여러가지 물건"] }, // 1단계 20차시: 평균대에서 물건 잡기
  21: { category: 'mat', name: "매트", secondary: [], materials: ["매트 여러 장"] }, // 1단계 21차시: 매트 탐색하기
  22: { category: 'mat', name: "매트", secondary: [], materials: ["매트 여러 장"] }, // 1단계 22차시: 매트 위에서 점프하기
  23: { category: 'mat', name: "매트", secondary: [], materials: ["매트 여러 장"] }, // 1단계 23차시: 매트에서 옆으로 구르기
  24: { category: 'vaultingBox', name: "뜀틀", secondary: [], materials: ["뜀뜰(1단, 2단), 매트"] }, // 1단계 24차시: 뜀틀 탐색하기
  25: { category: 'vaultingBox', name: "뜀틀", secondary: [], materials: ["뜀틀(1단, 2단), 풍선, 매트"] }, // 1단계 25차시: 뜀틀 위에 기어오르고 뛰어내리기
  26: { category: 'creative', name: "또아리", secondary: [], materials: ["또아리, 콩주머니 여러 개"] }, // 1단계 26차시: 또아리를 얹고 균형잡기
  27: { category: 'creative', name: "기린 그림", secondary: [], materials: ["기린 그림, 나뭇잎 여러 개"] }, // 1단계 27차시: 기린 먹이 주기
  28: { category: 'creative', name: "감각 쿠션", secondary: [], materials: ["마스킹 테이프, 쟁반, 공, 인형, 블록, 종이컵, 감각 쿠션"] }, // 1단계 28차시: 감각 쿠션 건너가기
  29: { category: 'creative', name: "스카프·별똥별", secondary: [], materials: ["스카프 유아 수만큼, 별똥별 여러 개, 목표물"] }, // 1단계 29차시: 별똥별 날리기
  30: { category: 'creative', name: "동물 카드", secondary: [], materials: ["동물카드 8장"] }, // 1단계 30차시: 동물처럼 움직이기
  31: { category: 'ball', name: "공", secondary: [], materials: ["공 유아 수만큼"] }, // 2단계 1차시: 공 튀기기
  32: { category: 'ball', name: "공", secondary: [], materials: ["공 유아 수만큼, 바구니(상자)"] }, // 2단계 2차시: 공 던지고 받기
  33: { category: 'ball', name: "공", secondary: [], materials: ["공 유아 수만큼, 후프, 고정대"] }, // 2단계 3차시: 목적물에 공 던지기
  34: { category: 'creative', name: "하키채", secondary: [], materials: ["하키채 모양 스틱 여러 개, 공 여러 개, 마스킹 테이프"] }, // 2단계 4차시: 하키채로 공 치기
  35: { category: 'ball', name: "공", secondary: [], materials: ["공 여러 개"] }, // 2단계 5차시: 공 전달하기
  36: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 유아 수만큼"] }, // 2단계 6차시: 후프 점프하기
  37: { category: 'hoop', name: "후프", secondary: [], materials: ["블록, 후프 여러 개, 고정대"] }, // 2단계 7차시: 후프 빠져나가기
  38: { category: 'hoop', name: "후프", secondary: [], materials: ["후프, 블록 여러 개"] }, // 2단계 8차시: 후프 징검다리
  39: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 유아 수만큼, 반환점"] }, // 2단계 9차시: 후프 굴리기
  40: { category: 'hoop', name: "후프", secondary: [], materials: ["작은 후프 여러 개"] }, // 2단계 10차시: 후프 사방치기
  41: { category: 'rope', name: "줄", secondary: [], materials: ["블록, 줄 여러 개"] }, // 2단계 11차시: 줄 잡고 스트레칭하기
  42: { category: 'rope', name: "줄", secondary: [], materials: ["긴 줄 여러 개"] }, // 2단계 12차시: 줄로 만든 길 걷기
  43: { category: 'rope', name: "줄", secondary: [], materials: ["긴 줄 여러 개"] }, // 2단계 13차시: 두 줄 뛰어넘기
  44: { category: 'rope', name: "줄", secondary: [], materials: ["줄 유아 수만큼"] }, // 2단계 14차시: 줄로 모양 만들기
  45: { category: 'rope', name: "줄", secondary: [], materials: ["긴 줄 여러 개"] }, // 2단계 15차시: 방사선 줄 뛰어넘기
  46: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["평균대, 매트, 유아가 좋아하는 물건"] }, // 2단계 16차시: 평균대에서 앉아서 걷기
  47: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["큰 천, 매트, 평균대"] }, // 2단계 17차시: 평균대에서 걷기
  48: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["높이가 다른 평균대, 매트"] }, // 2단계 18차시: 평균대 구르고 뛰어넘기
  49: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["평균대, 매트, 후프 여러 개"] }, // 2단계 19차시: 평균대 짚고 높이뛰기
  50: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["블록, 평균대, 매트, 장애물"] }, // 2단계 20차시: 평균대 장애물 건너기
  51: { category: 'mat', name: "매트", secondary: [], materials: ["매트 여러 장"] }, // 2단계 21차시: 매트에 신체 대기
  52: { category: 'mat', name: "매트", secondary: [], materials: ["매트 여러 장"] }, // 2단계 22차시: 매트 배 타기
  53: { category: 'mat', name: "매트", secondary: [], materials: ["매트 여러 장"] }, // 2단계 23차시: 매트에서 앞구르기
  54: { category: 'vaultingBox', name: "뜀틀", secondary: [], materials: ["뜀틀(1단, 2단), 매트"] }, // 2단계 24차시: 뜀틀 위에서 한 발 들고 서기
  55: { category: 'vaultingBox', name: "뜀틀", secondary: [], materials: ["뜀틀(1~3단), 매트, 손바닥 스티커"] }, // 2단계 25차시: 뜀틀 비껴넘기
  56: { category: 'creative', name: "그물망", secondary: [], materials: ["그물망, 가볍고 부드러운 공, 반환점, 바구니"] }, // 2단계 26차시: 그물망으로 공 치기
  57: { category: 'ball', name: "공", secondary: [], materials: ["긴꼬리공, 목표물"] }, // 2단계 27차시: 긴꼬리공 던지고 받기
  58: { category: 'creative', name: "발 바꾸어 뛰기 도구", secondary: [], materials: ["신문지 막대 여러 개, 블록, 발바꾸어 뛰기 운동 도구, 패턴 카드"] }, // 2단계 28차시: 발 바꾸어 뛰기
  59: { category: 'creative', name: "링", secondary: [], materials: ["링, 가벼운 물건(곡식주머니, 양모 공, 리본 공, 종이비행기 등)"] }, // 2단계 29차시: 링 통과하기
  60: { category: 'creative', name: "둘이서 선 따라 걷기", secondary: [], materials: ["담요, 백업, 선 따라 걷기 매트"] }, // 2단계 30차시: 둘이서 선 따라 걷기
  61: { category: 'ball', name: "공", secondary: [], materials: ["공 유아 수만큼"] }, // 3단계 1차시: 몸으로 공 굴리기
  62: { category: 'ball', name: "공", secondary: [], materials: ["공 유아 수만큼, 작은 물건, 바구니"] }, // 3단계 2차시: 발로 공 전달하기
  63: { category: 'ball', name: "공", secondary: [], materials: ["공 여러 개, 마스킹 테이프"] }, // 3단계 3차시: 발목에 공 끼고 선 뛰어넘기
  64: { category: 'ball', name: "공", secondary: [], materials: ["공 유아 수만큼"] }, // 3단계 4차시: 연속하여 공 튀기기
  65: { category: 'creative', name: "피구놀이", secondary: [], materials: ["공"] }, // 3단계 5차시: 피구놀이
  66: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 유아 수만큼"] }, // 3단계 6차시: 후프 밀고 당기기
  67: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 여러 개, 마스킹 테이프"] }, // 3단계 7차시: 지그재그 후프 건너뛰기
  68: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 유아 수만큼"] }, // 3단계 8차시: 후프로 스트레칭하기
  69: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 유아 수만큼"] }, // 3단계 9차시: 몸으로 후프 돌리기
  70: { category: 'hoop', name: "후프", secondary: [], materials: ["후프 유아 수만큼"] }, // 3단계 10차시: 후프 줄넘기
  71: { category: 'rope', name: "줄", secondary: [], materials: ["줄 유아 수만큼"] }, // 3단계 11차시: 줄 사이로 다니기
  72: { category: 'rope', name: "줄", secondary: [], materials: ["미끄럽지 않은 재질의 종이, 긴 줄 여러 개"] }, // 3단계 12차시: 줄 위로, 아래로 지나다니기
  73: { category: 'rope', name: "줄", secondary: [], materials: ["긴 줄"] }, // 3단계 13차시: 줄 통과하기
  74: { category: 'rope', name: "줄", secondary: [], materials: ["줄 넘기 줄 유아수 만큼"] }, // 3단계 14차시: 줄넘기
  75: { category: 'rope', name: "줄", secondary: [], materials: ["긴 줄"] }, // 3단계 15차시: 긴 줄넘기
  76: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["평균대, 매트"] }, // 3단계 16차시: 평균대 위에서 엇갈려 걷기
  77: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["평균대, 매트"] }, // 3단계 17차시: 평균대에서 점프하기
  78: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["평균대, 매트, 후프, 고정대"] }, // 3단계 18차시: 평균대 위에서 후프 통과하기
  79: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["평균대, 매트"] }, // 3단계 19차시: 평균대 뛰어넘기
  80: { category: 'balanceBeam', name: "평균대", secondary: [], materials: ["평균대, 매트, 공"] }, // 3단계 20차시: 평균대에서 공놀이하기
  81: { category: 'mat', name: "매트", secondary: [], materials: ["매트 여러 장, 말아서 끈으로 묶은 매트 1장"] }, // 3단계 21차시: 원통형 매트 위 지나가기
  82: { category: 'mat', name: "매트", secondary: [], materials: ["매트 여러 장"] }, // 3단계 22차시: 매트에서 구르기
  83: { category: 'vaultingBox', name: "뜀틀", secondary: [], materials: ["블록 여러 개, 뜀틀(1단, 2단), 매트"] }, // 3단계 23차시: 뜀틀 뛰어넘기
  84: { category: 'vaultingBox', name: "뜀틀", secondary: [], materials: ["뜀틀, 매트"] }, // 3단계 24차시: 뜀틀 위에서 구르기
  85: { category: 'vaultingBox', name: "뜀틀", secondary: [], materials: ["콘 여러 개, 뜀틀(1단), 매트"] }, // 3단계 25차시: 뜀틀 뛰어넘어 구르기
  86: { category: 'ball', name: "공", secondary: [], materials: ["헝겊 축구판, 공, 반환점"] }, // 3단계 26차시: 구멍에 공 넣기
  87: { category: 'creative', name: "막대", secondary: [], materials: ["막대 여러 개"] }, // 3단계 27차시: 막대 균형잡기
  88: { category: 'creative', name: "발바닥 그림판", secondary: [], materials: ["발바닥 그림판"] }, // 3단계 28차시: 발바닥 그림 보고 뛰기
  89: { category: 'creative', name: "날개 부채", secondary: [], materials: ["자음카드, 날개 부채 여러 개, 가벼운 물체"] }, // 3단계 29차시: 날개 부채 흔들기
  90: { category: 'creative', name: "막대", secondary: [], materials: ["신문지 막대, 공, 바퀴 달린 막대 여러 개"] }, // 3단계 30차시: 바퀴 달린 막대 굴리기
};


/** 기존 화면 및 저장 모듈에서 사용하는 호환 함수 */
export function getEquipmentRule(id: number): EquipmentMappingRule {
  return ACTIVITY_EQUIPMENT_RULES[id] ?? {
    category: 'creative',
    name: '기타 도구',
    secondary: [],
    materials: [],
  };
}
