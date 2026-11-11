import { ActivityItem } from '../types';
import { getEquipmentRule } from './equipmentRules';

// 90개 체육놀이 데이터 목록
// 1단계(1~30), 2단계(31~60), 3단계(61~90)
// level, sequence, title, body_activity, equipment_activity, objectives 필드 완벽 연결
// 기타 미제공 항목은 '원본 자료 연결 준비 중'으로 상세 화면에서 일관되게 표시됩니다.

const step1Titles = [
  '동물 친구들의 신나는 걸음걸이', // 1
  '살랑살랑 알록달록 스카프 바람놀이', // 2
  '쿵쾅쿵쾅 거인과 사뿐사뿐 요정', // 3
  '퐁당퐁당 훌라후프 징검다리', // 4
  '데굴데굴 밤톨이 통나무 구르기', // 5
  '폭신폭신 신문지 눈싸움 놀이', // 6
  '신체 부위 쏙쏙 터치 게임', // 7
  '둥둥 떠다니는 풍선 지키기', // 8
  '애벌레의 꿈틀꿈틀 터널 통과하기', // 9
  '콩주머니 과녁 맞히기', // 10
  '나무늘보와 치타의 숲속 산책', // 11
  '색깔 고깔 꼬리잡기 놀이', // 12
  '흔들흔들 외나무다리 건너기', // 13
  '종이컵 탑 쌓고 발차기 슛', // 14
  '두더지야 쏙 나와라 웅크리기', // 15
  '폭신폭신 베개 징검다리 점프', // 16
  '바람개비 신체 체조', // 17
  '미니 볼풀공 숟가락 나르기', // 18
  '얼음 땡! 조각상 만들기', // 19
  '리본 막대 무지개 그리기', // 20
  '개구리 점프와 연못 착지', // 21
  '스펀지 블록 장애물 뛰어넘기', // 22
  '펭귄처럼 뒤뚱뒤뚱 걸어봐요', // 23
  '줄다리기 밧줄 뱀 피하기', // 24
  '엄마 오리 아기 오리 따라 걷기', // 25
  '동글동글 탱탱볼 굴리기', // 26
  '우주 비행사의 무중력 유영', // 27
  '종이 접시 핸들 운전 놀이', // 28
  '숨바꼭질 그림자 잡기', // 29
  '비눗방울 톡톡 손뼉치기' // 30
];

const step2Titles = [
  '정글 숲 거미줄 레이저 피하기', // 31 (1)
  '꼬까신 고깔 지그재그 달리기', // 32 (2)
  '외발 서기 학 다리 중심잡기', // 33 (3)
  '탁구공 계란판 쏙쏙 튕기기', // 34 (4)
  '닌자처럼 소리 없이 발걸음 옮기기', // 35 (5)
  '훌라후프 기차 달리기', // 36 (6)
  '동물 그림자 흉내 릴레이', // 37 (7)
  '낙하산 파도 만들기 놀이', // 38 (8)
  '캥거루 주머니 모둠발 연속 점프', // 39 (9)
  '콩주머니 머리 위에 얹고 걷기', // 40 (10)
  '게걸음 옆으로 빠르게 이동하기', // 41 (11)
  '플라스틱 볼링핀 스트라이크', // 42 (12)
  '풍선 배구 네트 넘기기', // 43 (13)
  '신체 사다리 스텝 점프', // 44 (14)
  '플라잉디스크 표적 던지기', // 45 (15)
  '짝꿍과 등 맞대고 일어서기', // 46 (16)
  '스틱 막대기 균형 손바닥 세우기', // 47 (17)
  '뒤로 걷기와 위험 감지 훈련', // 48 (18)
  '고무밴드 탄성 건너뛰기', // 49 (19)
  '태권도 기본 지르기와 막기', // 50 (20)
  '스쿠프 공 받아치기 놀이', // 51 (21)
  '팔굽혀 버티기 플랭크 브릿지', // 52 (22)
  '색깔 매트 순발력 터치 런', // 53 (23)
  '트위스트 허리 회전 댄스', // 54 (24)
  '셔틀콕 라켓 공중 띄우기', // 55 (25)
  '두 발 모아 지그재그 바니홉', // 56 (26)
  '점보 컵 쌓기 릴레이', // 57 (27)
  '원숭이 철봉 매달리기 버티기', // 58 (28)
  '패러슈트 볼 띄우기 협동전', // 59 (29)
  '신체 나침반 방향 맞추기' // 60 (30)
];

const step3Titles = [
  '스파이더맨 벽 타기 및 지지 운동', // 61 (1)
  '미니 하키 스틱 골 넣기', // 62 (2)
  '이어달리기 바통 터치 릴레이', // 63 (3)
  '줄넘기 연속 뜀뛰기 도전', // 64 (4)
  '신체 파도타기 협동 체조', // 65 (5)
  '킨볼 굴리기와 협동 밀기', // 66 (6)
  '스피드 반응 민첩성 셔틀런', // 67 (7)
  '타깃 보치아 정밀 투척전', // 68 (8)
  '기초 기계체조 앞구르기 완성', // 69 (9)
  '티볼 배팅 타격 스윙', // 70 (10)
  '군대식 포복 낮은 포복 통과하기', // 71 (11)
  '플로어볼 드리블 장애물 통과', // 72 (12)
  '모둠 짝체조 피라미드 균형', // 73 (13)
  '점핑 뜀틀 손 짚고 뛰어넘기', // 74 (14)
  '민속 씨름 샅바 당기기와 버티기', // 75 (15)
  '배드민턴 셔틀콕 주고받기', // 76 (16)
  '동작 릴레이 암호 전달 게임', // 77 (17)
  '스텝박스 리듬 인터벌 스텝', // 78 (18)
  '팔굽혀펴기 지지대 경주', // 79 (19)
  '인디아카 손바닥 스매시', // 80 (20)
  '스케이트 사이드 슬라이드 스텝', // 81 (21)
  '미니 농구 골대 슛 성공하기', // 82 (22)
  '무궁화 꽃이 피었습니다 전략 달리기', // 83 (23)
  '밸런스 보드 위에서 균형잡기', // 84 (24)
  '협동 꼬리잡기 기차 대작전', // 85 (25)
  '츄크볼 탄성네트 리바운드', // 86 (26)
  '3인 4각 발맞추기 전진 릴레이', // 87 (27)
  '플라잉디스크 얼티미트 패스전', // 88 (28)
  '신체 레크리에이션 캡틴 선발전', // 89 (29)
  '빅볼 굴리기 협동 챔피언십' // 90 (30)
];

// 각 활동별 고유한 활동 목표(objectives) 배열 정의
const getObjectivesForActivity = (step: number, seq: number, title: string, isTool: boolean): string[] => {
  if (step === 1) {
    if (seq === 1) {
      return [
        '동물의 움직임을 관찰하고 신체 동작으로 자유롭게 모방한다.',
        '신체 각 부위를 탐색하며 대근육 유연성과 기초 신체조절력을 기른다.'
      ];
    }
    if (seq === 2) {
      return [
        '가벼운 스카프의 낙하 궤적을 주시하며 눈과 손의 협응력을 기른다.',
        '바람의 속도와 방향에 맞춰 신체를 유연하게 움직인다.'
      ];
    }
    if (isTool) {
      return [
        `놀이 도구(${title.split(' ')[1] || '교구'})를 안전하게 조작하며 물체 조작 능력을 기른다.`,
        '도구와의 상호작용을 통해 공간 지각 능력과 소근육·대근육 협응력을 높인다.'
      ];
    } else {
      return [
        `${title}을(를) 통해 전신 근육을 활성화하고 기초 평형감각을 기른다.`,
        '자신의 신체 움직임에 주의를 기울이며 스스로 몸의 속도를 조절한다.'
      ];
    }
  } else if (step === 2) {
    if (isTool) {
      return [
        `다양한 체육 교구를 활용한 정밀한 운동 기술을 습득한다.`,
        '규칙을 이해하고 도구 조작의 정확성과 반응 속도를 기른다.'
      ];
    } else {
      return [
        '동적 균형감각과 방향 전환 민첩성을 기른다.',
        '신체 중심 이동 원리를 체득하고 다양한 동작을 연속적으로 수행한다.'
      ];
    }
  } else {
    if (isTool) {
      return [
        '복합 교구 조작 기술을 익히고 팀원과 전략적으로 협력한다.',
        '도구를 정밀하게 통제하며 상하체 협응력과 스포츠맨십을 기른다.'
      ];
    } else {
      return [
        '신체 지구력과 순발력을 기르고 또래와 신체 접촉 규칙을 지킨다.',
        '자신의 신체 능력을 긍정적으로 인식하고 도전적인 움직임 과제를 완수한다.'
      ];
    }
  }
};

// 90개 전체 목록 생성
export const getAllInitialActivities = (): ActivityItem[] => {
  const list: ActivityItem[] = [];

  // 1단계 (1~30): PDF 10~39쪽
  for (let i = 1; i <= 30; i++) {
    const isTool = i % 2 === 0;
    const title = step1Titles[i - 1] || `1단계 ${String(i).padStart(2, '0')}번 체육놀이`;
    const rule = getEquipmentRule(i);
    list.push({
      id: i,
      level: 1,
      sequence: i,
      step: 1,
      stepNumber: i,
      pdf_page: 9 + i, // 10 ~ 39쪽
      title,
      type: isTool ? 'tool' : 'body',
      equipmentCategory: rule.category,
      equipmentName: rule.name,
      secondaryEquipments: rule.secondary,
      materials: rule.materials,
      body_activity: rule.category === 'barebody',
      equipment_activity: rule.category !== 'barebody',
      targetAge: '만 3세',
      isDataConnected: true,
      objectives: getObjectivesForActivity(1, i, title, isTool),
      goal: getObjectivesForActivity(1, i, title, isTool)[0],
      videoUrl: null,
      qrCodeUrl: null,
      isVideoReady: false
    });
  }

  // 2단계 (31~60): PDF 43~72쪽
  for (let i = 31; i <= 60; i++) {
    const seq = i - 30;
    const isTool = seq % 2 === 0;
    const title = step2Titles[seq - 1] || `2단계 ${String(seq).padStart(2, '0')}번 체육놀이`;
    const rule = getEquipmentRule(i);
    list.push({
      id: i,
      level: 2,
      sequence: seq,
      step: 2,
      stepNumber: seq,
      pdf_page: 42 + seq, // 43 ~ 72쪽
      title,
      type: isTool ? 'tool' : 'body',
      equipmentCategory: rule.category,
      equipmentName: rule.name,
      secondaryEquipments: rule.secondary,
      materials: rule.materials,
      body_activity: rule.category === 'barebody',
      equipment_activity: rule.category !== 'barebody',
      targetAge: '만 4세',
      isDataConnected: true,
      objectives: getObjectivesForActivity(2, seq, title, isTool),
      goal: getObjectivesForActivity(2, seq, title, isTool)[0],
      videoUrl: null,
      qrCodeUrl: null,
      isVideoReady: false
    });
  }

  // 3단계 (61~90): PDF 76~105쪽
  for (let i = 61; i <= 90; i++) {
    const seq = i - 60;
    const isTool = seq % 2 === 0;
    const title = step3Titles[seq - 1] || `3단계 ${String(seq).padStart(2, '0')}번 체육놀이`;
    const rule = getEquipmentRule(i);
    list.push({
      id: i,
      level: 3,
      sequence: seq,
      step: 3,
      stepNumber: seq,
      pdf_page: 75 + seq, // 76 ~ 105쪽
      title,
      type: isTool ? 'tool' : 'body',
      equipmentCategory: rule.category,
      equipmentName: rule.name,
      secondaryEquipments: rule.secondary,
      materials: rule.materials,
      body_activity: rule.category === 'barebody',
      equipment_activity: rule.category !== 'barebody',
      targetAge: '만 5세',
      isDataConnected: true,
      objectives: getObjectivesForActivity(3, seq, title, isTool),
      goal: getObjectivesForActivity(3, seq, title, isTool)[0],
      videoUrl: null,
      qrCodeUrl: null,
      isVideoReady: false
    });
  }

  return list;
};
