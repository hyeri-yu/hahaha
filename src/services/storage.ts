import { ActivityItem, TeacherRecord, TeacherUser, EquipmentCategory } from '../types';
import { getAllInitialActivities } from '../data/defaultActivities';
import { getEquipmentRule } from '../data/equipmentRules';
import { VIDEO_URLS } from '../data/videoUrls';

const STORAGE_KEYS = {
  CURRENT_TEACHER: 'hahaha_current_teacher_user',
  ACTIVITIES_DATA: 'hahaha_custom_activities_v1',
  RECORDS_PREFIX: 'hahaha_records_teacher_',
  PRESET_TEACHERS: 'hahaha_known_teachers',
  VIDEO_OVERRIDES: 'hahaha_custom_video_overrides'
};

// 기본 데모 교사 프로필
export const SAMPLE_TEACHERS: TeacherUser[] = [
  { id: 'teacher_sunshine', name: '김햇살 선생님', institution: '햇살유치원', className: '만 3세 해오름반' },
  { id: 'teacher_sky', name: '이하늘 선생님', institution: '새싹어린이집', className: '만 4세 푸른반' },
  { id: 'teacher_star', name: '박별아 선생님', institution: '꿈나무유치원', className: '만 5세 은하수반' }
];

export const storageService = {
  // 1. 교사 인증 관리 (Firebase 연동 전 로컬 안전 격리)
  getCurrentTeacher(): TeacherUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_TEACHER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentTeacher(user: TeacherUser | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TEACHER, JSON.stringify(user));
      // 저장된 교사 목록에도 추가
      this.addKnownTeacher(user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TEACHER);
    }
  },

  getKnownTeachers(): TeacherUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESET_TEACHERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return SAMPLE_TEACHERS;
  },

  addKnownTeacher(user: TeacherUser): void {
    try {
      const known = this.getKnownTeachers();
      if (!known.some(t => t.id === user.id)) {
        known.push(user);
        localStorage.setItem(STORAGE_KEYS.PRESET_TEACHERS, JSON.stringify(known));
      }
    } catch {
      // ignore
    }
  },

  // 2. 교사별 진도 및 메모 (교사 ID별 철저 분리)
  getTeacherRecord(teacherId: string): TeacherRecord {
    try {
      const key = `${STORAGE_KEYS.RECORDS_PREFIX}${teacherId}`;
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return {
      completedActivityIds: [],
      notes: {},
      lastUpdated: new Date().toISOString()
    };
  },

  saveTeacherRecord(teacherId: string, record: TeacherRecord): void {
    try {
      const key = `${STORAGE_KEYS.RECORDS_PREFIX}${teacherId}`;
      record.lastUpdated = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(record));
    } catch (e) {
      console.error('Failed to save teacher record', e);
    }
  },

  toggleComplete(teacherId: string, activityId: number): boolean {
    const record = this.getTeacherRecord(teacherId);
    const index = record.completedActivityIds.indexOf(activityId);
    let isNowCompleted = false;
    if (index >= 0) {
      record.completedActivityIds.splice(index, 1);
      isNowCompleted = false;
    } else {
      record.completedActivityIds.push(activityId);
      isNowCompleted = true;
    }
    this.saveTeacherRecord(teacherId, record);
    return isNowCompleted;
  },

  saveNote(teacherId: string, activityId: number, note: string): void {
    const record = this.getTeacherRecord(teacherId);
    if (!note.trim()) {
      delete record.notes[activityId];
    } else {
      record.notes[activityId] = note;
    }
    this.saveTeacherRecord(teacherId, record);
  },

  // 3. 90개 활동 데이터 (JSON 불러오기/연결 관리)
  getActivities(): ActivityItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES_DATA);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // JSON 데이터 구조 정규화 (objectives, level, sequence, body_activity, equipment_activity)
          return parsed.map((item: any, idx: number) => {
            const id = Number(item.id) || (idx + 1);
            const levelNum = Number(item.level) || Number(item.step) || (id <= 30 ? 1 : id <= 60 ? 2 : 3);
            const step = (levelNum === 1 || levelNum === 2 || levelNum === 3) ? (levelNum as 1 | 2 | 3) : 1;
            const seqNum = Number(item.sequence) || Number(item.stepNumber) || ((id - 1) % 30 + 1);
            const stepNumber = seqNum > 30 ? ((seqNum - 1) % 30 + 1) : seqNum;

            // body_activity & equipment_activity 구분
            const isBody = item.body_activity === true ||
              item.body_activity === 'true' ||
              item.body_activity === 1 ||
              item.body_activity === 'Y' ||
              item.type === 'body_activity' ||
              item.type === 'body' ||
              item.activity_type === 'body_activity';

            const isEquipment = item.equipment_activity === true ||
              item.equipment_activity === 'true' ||
              item.equipment_activity === 1 ||
              item.equipment_activity === 'Y' ||
              item.type === 'equipment_activity' ||
              item.type === 'tool' ||
              item.activity_type === 'equipment_activity';

            const finalType = isEquipment && !isBody ? 'tool' : 'body';

            // objectives 배열 추출
            let objectives: string[] = [];
            if (Array.isArray(item.objectives) && item.objectives.length > 0) {
              objectives = item.objectives.map((o: any) => String(o).trim()).filter(Boolean);
            } else if (typeof item.objectives === 'string' && item.objectives.trim()) {
              objectives = [item.objectives.trim()];
            } else if (Array.isArray(item.objective) && item.objective.length > 0) {
              objectives = item.objective.map((o: any) => String(o).trim()).filter(Boolean);
            } else if (typeof item.objective === 'string' && item.objective.trim()) {
              objectives = [item.objective.trim()];
            } else if (Array.isArray(item.goals) && item.goals.length > 0) {
              objectives = item.goals.map((o: any) => String(o).trim()).filter(Boolean);
            } else if (item.goal && typeof item.goal === 'string' && item.goal.trim() && !item.goal.includes('데이터 연결 필요')) {
              objectives = [item.goal.trim()];
            }

            // 만약 목표가 비어있으면 초기 90개 표준 목표와 매핑
            if (objectives.length === 0) {
              const defaultItem = getAllInitialActivities().find(a => a.id === id);
              if (defaultItem && defaultItem.objectives) {
                objectives = defaultItem.objectives;
              }
            }

            // pdf_page 계산 (1단계 1~30: 10~39쪽, 2단계 1~30: 43~72쪽, 3단계 1~30: 76~105쪽)
            const defaultPdfPage = step === 1 ? 9 + stepNumber : step === 2 ? 42 + stepNumber : 75 + stepNumber;
            const pdfPage = Number(item.pdf_page) || defaultPdfPage;

            // 도구 규칙 확인
            const rule = getEquipmentRule(id);
            const category: EquipmentCategory = rule.category;
            const equipmentName = item.equipmentName || rule.name;
            const secondaryEquipments = item.secondaryEquipments || rule.secondary;
            const materials = Array.isArray(item.materials) && item.materials.length > 0 ? item.materials : rule.materials;

            // 관리자 영상 URL 오버라이드 확인
            const videoOverrides = this.getVideoOverrides();
            const overriddenVideo = videoOverrides[id];
            const finalVideoUrl =
              (typeof overriddenVideo === 'string' && overriddenVideo.trim() ? overriddenVideo.trim() : null) ||
              VIDEO_URLS[id] ||
              (typeof item.videoUrl === 'string' && item.videoUrl.trim() ? item.videoUrl.trim() : null);
            const isVideoReady = Boolean(finalVideoUrl && finalVideoUrl.trim());

            return {
              id,
              level: levelNum,
              sequence: seqNum,
              step,
              stepNumber,
              pdf_page: pdfPage,
              title: item.title || item.activity_name || `${step}단계 ${stepNumber}번 체육놀이`,
              type: 'tool',
              equipmentCategory: category,
              equipmentName,
              secondaryEquipments,
              materials,
              body_activity: false,
              equipment_activity: true,,
              targetAge: item.targetAge || `만 ${step + 2}세`,
              isDataConnected: true,
              objectives,
              goal: objectives[0] || item.goal || '',
              intro: item.intro && typeof item.intro === 'string' && item.intro.trim() ? item.intro.trim() : undefined,
              method: Array.isArray(item.method) && item.method.length > 0 ? item.method : undefined,
              teacherInteraction: Array.isArray(item.teacherInteraction) && item.teacherInteraction.length > 0 ? item.teacherInteraction : undefined,
              evaluation: Array.isArray(item.evaluation) && item.evaluation.length > 0 ? item.evaluation : undefined,
              safety: Array.isArray(item.safety) && item.safety.length > 0 ? item.safety : undefined,
              thinkingPlus: item.thinkingPlus && typeof item.thinkingPlus === 'string' && item.thinkingPlus.trim() ? item.thinkingPlus.trim() : undefined,
              exerciseKnowledge: item.exerciseKnowledge && typeof item.exerciseKnowledge === 'string' && item.exerciseKnowledge.trim() ? item.exerciseKnowledge.trim() : undefined,
              videoUrl: finalVideoUrl,
              qrCodeUrl: item.qrCodeUrl || finalVideoUrl,
              isVideoReady
            };
          });
        }
      }
    } catch (e) {
      console.error('Failed to load stored activities, falling back to initial data', e);
    }
    // 사용자 지정 활동 데이터가 없어도 기본 활동 90개에 영상 주소를 연결합니다.
    return getAllInitialActivities().map((activity) => {
      const videoOverrides = this.getVideoOverrides();
      const overriddenVideo = videoOverrides[activity.id];
      const videoUrl =
        (typeof overriddenVideo === 'string' && overriddenVideo.trim() ? overriddenVideo.trim() : null) ||
        VIDEO_URLS[activity.id] ||
        activity.videoUrl ||
        null;

      return {
        ...activity,
        videoUrl,
        qrCodeUrl: activity.qrCodeUrl || videoUrl,
        isVideoReady: Boolean(videoUrl)
      };
    });
  },

  // 4. 원본 체육놀이 PDF 파일 IndexedDB 관리 (공통 단일 PDF 보관)
  async savePdfBlob(file: File | Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('hahaha_pdf_db', 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('pdf_store')) {
          db.createObjectStore('pdf_store');
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction('pdf_store', 'readwrite');
        const store = tx.objectStore('pdf_store');
        store.put(file, 'global_activity_pdf');
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getPdfBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('hahaha_pdf_db', 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('pdf_store')) {
          db.createObjectStore('pdf_store');
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction('pdf_store', 'readonly');
        const store = tx.objectStore('pdf_store');
        const getReq = store.get('global_activity_pdf');
        getReq.onsuccess = () => {
          db.close();
          resolve(getReq.result || null);
        };
        getReq.onerror = () => {
          db.close();
          resolve(null);
        };
      };
      request.onerror = () => resolve(null);
    });
  },

  async clearPdfBlob(): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open('hahaha_pdf_db', 1);
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction('pdf_store', 'readwrite');
        const store = tx.objectStore('pdf_store');
        store.delete('global_activity_pdf');
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
      };
      request.onerror = () => resolve();
    });
  },

  // 5. 활동별 영상 URL 관리자 오버라이드
  getVideoOverrides(): Record<number, string> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VIDEO_OVERRIDES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  setVideoOverride(activityId: number, url: string | null): void {
    try {
      const overrides = this.getVideoOverrides();
      if (url && url.trim()) {
        overrides[activityId] = url.trim();
      } else {
        delete overrides[activityId];
      }
      localStorage.setItem(STORAGE_KEYS.VIDEO_OVERRIDES, JSON.stringify(overrides));
    } catch (e) {
      console.error('Failed to set video override', e);
    }
  },

  setMultipleVideoOverrides(newOverrides: Record<number, string>): void {
    try {
      const current = this.getVideoOverrides();
      const updated = { ...current, ...newOverrides };
      localStorage.setItem(STORAGE_KEYS.VIDEO_OVERRIDES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to set multiple video overrides', e);
    }
  },

  saveActivities(activities: ActivityItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES_DATA, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to save activities data', e);
      throw e;
    }
  },

  resetActivities(): ActivityItem[] {
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES_DATA);
    localStorage.removeItem(STORAGE_KEYS.VIDEO_OVERRIDES);
    // 사용자 지정 활동 데이터가 없어도 기본 활동 90개에 영상 주소를 연결합니다.
    return getAllInitialActivities().map((activity) => {
      const videoOverrides = this.getVideoOverrides();
      const overriddenVideo = videoOverrides[activity.id];
      const videoUrl =
        (typeof overriddenVideo === 'string' && overriddenVideo.trim() ? overriddenVideo.trim() : null) ||
        VIDEO_URLS[activity.id] ||
        activity.videoUrl ||
        null;

      return {
        ...activity,
        videoUrl,
        qrCodeUrl: activity.qrCodeUrl || videoUrl,
        isVideoReady: Boolean(videoUrl)
      };
    });
  }
};
