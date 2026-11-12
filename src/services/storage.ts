
import { ActivityItem, TeacherRecord, TeacherUser, EquipmentCategory } from '../types';
import { getAllInitialActivities } from '../data/defaultActivities';
import { getEquipmentRule } from '../data/equipmentRules';
import { VIDEO_URLS } from '../data/videoUrls';

const STORAGE_KEYS = {
  CURRENT_TEACHER: 'hahaha_current_teacher_user',
  ACTIVITIES_DATA: 'hahaha_custom_activities_v1',
  RECORDS_PREFIX: 'hahaha_records_teacher_',
  PRESET_TEACHERS: 'hahaha_known_teachers',
  VIDEO_OVERRIDES: 'hahaha_custom_video_overrides',
  LOCAL_RECORD: 'hahaha_local_activity_record_v1'
};

// 기본 데모 교사 프로필
export const SAMPLE_TEACHERS: TeacherUser[] = [
  { id: 'teacher_sunshine', name: '김햇살 선생님', institution: '햇살유치원', className: '만 3세 해오름반' },
  { id: 'teacher_sky', name: '이하늘 선생님', institution: '새싹어린이집', className: '만 4세 푸른반' },
  { id: 'teacher_star', name: '박별아 선생님', institution: '꿈나무유치원', className: '만 5세 은하수반' }
];

const createEmptyRecord = (): TeacherRecord => ({
  completedActivityIds: [],
  notes: {},
  lastUpdated: new Date().toISOString()
});

export const storageService = {
  // 1. 기존 교사 인증 관리 기능 유지
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

  // 2. 기존 교사별 진도 및 메모 기능 유지
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
    return createEmptyRecord();
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

  // 3. 로그인 없이 사용하는 공용 로컬 활동 기록
  // 최초 이용 시 현재 로그인된 교사의 기록만 복사합니다.
  // 기존 교사별 기록은 삭제하거나 변경하지 않습니다.
  getLocalRecord(): TeacherRecord {
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.LOCAL_RECORD);

      if (savedData) {
        const parsed = JSON.parse(savedData);

        return {
          completedActivityIds: Array.isArray(parsed.completedActivityIds)
            ? parsed.completedActivityIds
            : [],
          notes: parsed.notes && typeof parsed.notes === 'object'
            ? parsed.notes
            : {},
          lastUpdated: parsed.lastUpdated || new Date().toISOString()
        };
      }

      // 새 저장 공간이 없을 때 기존 로그인 교사의 기록을 복사
      const currentTeacher = this.getCurrentTeacher();

      if (currentTeacher) {
        const oldRecord = this.getTeacherRecord(currentTeacher.id);
        const migratedRecord: TeacherRecord = {
          completedActivityIds: [...oldRecord.completedActivityIds],
          notes: { ...oldRecord.notes },
          lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(
          STORAGE_KEYS.LOCAL_RECORD,
          JSON.stringify(migratedRecord)
        );

        return migratedRecord;
      }
    } catch (e) {
      console.error('Failed to load local activity record', e);
    }

    return createEmptyRecord();
  },

  saveLocalRecord(record: TeacherRecord): void {
    try {
      const updatedRecord: TeacherRecord = {
        completedActivityIds: [...record.completedActivityIds],
        notes: { ...record.notes },
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(
        STORAGE_KEYS.LOCAL_RECORD,
        JSON.stringify(updatedRecord)
      );
    } catch (e) {
      console.error('Failed to save local activity record', e);
    }
  },

  // 활동 완료 체크 및 취소
  toggleLocalComplete(activityId: number): boolean {
    const record = this.getLocalRecord();
    const index = record.completedActivityIds.indexOf(activityId);
    let isNowCompleted = false;

    if (index >= 0) {
      record.completedActivityIds.splice(index, 1);
    } else {
      record.completedActivityIds.push(activityId);
      isNowCompleted = true;
    }

    this.saveLocalRecord(record);
    return isNowCompleted;
  },

  // 활동 메모 저장
  saveLocalNote(activityId: number, note: string): void {
    const record = this.getLocalRecord();

    if (!note.trim()) {
      delete record.notes[activityId];
    } else {
      record.notes[activityId] = note;
    }

    this.saveLocalRecord(record);
  },

  // 4. 90개 활동 데이터 관리
  getActivities(): ActivityItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES_DATA);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any, idx: number) => {
            const id = Number(item.id) || (idx + 1);
            const levelNum = Number(item.level) || Number(item.step) || (id <= 30 ? 1 : id <= 60 ? 2 : 3);
            const step = (levelNum === 1 || levelNum === 2 || levelNum === 3)
              ? (levelNum as 1 | 2 | 3)
              : 1;
            const seqNum = Number(item.sequence) || Number(item.stepNumber) || ((id - 1) % 30 + 1);
            const stepNumber = seqNum > 30 ? ((seqNum - 1) % 30 + 1) : seqNum;

            const isBody =
              item.body_activity === true ||
              item.body_activity === 'true' ||
              item.body_activity === 1 ||
              item.body_activity === 'Y' ||
              item.type === 'body_activity' ||
              item.type === 'body' ||
              item.activity_type === 'body_activity';

            const isEquipment =
              item.equipment_activity === true ||
              item.equipment_activity === 'true' ||
              item.equipment_activity === 1 ||
              item.equipment_activity === 'Y' ||
              item.type === 'equipment_activity' ||
              item.type === 'tool' ||
              item.activity_type === 'equipment_activity';

            const finalType = isEquipment && !isBody ? 'tool' : 'body';

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
            } else if (
              item.goal &&
              typeof item.goal === 'string' &&
              item.goal.trim() &&
              !item.goal.includes('데이터 연결 필요')
            ) {
              objectives = [item.goal.trim()];
            }

            if (objectives.length === 0) {
              const defaultItem = getAllInitialActivities().find(a => a.id === id);

              if (defaultItem && defaultItem.objectives) {
                objectives = defaultItem.objectives;
              }
            }

            const defaultPdfPage =
              step === 1 ? 9 + stepNumber :
              step === 2 ? 42 + stepNumber :
              75 + stepNumber;

            const pdfPage = Number(item.pdf_page) || defaultPdfPage;

            const rule = getEquipmentRule(id);
            const category: EquipmentCategory = rule.category;
            const equipmentName = item.equipmentName || rule.name;
            const secondaryEquipments = item.secondaryEquipments || rule.secondary;
            const materials =
              Array.isArray(item.materials) && item.materials.length > 0
                ? item.materials
                : rule.materials;

            const videoOverrides = this.getVideoOverrides();
            const overriddenVideo = videoOverrides[id];

            const finalVideoUrl =
              (typeof overriddenVideo === 'string' && overriddenVideo.trim()
                ? overriddenVideo.trim()
                : null) ||
              VIDEO_URLS[id] ||
              (typeof item.videoUrl === 'string' && item.videoUrl.trim()
                ? item.videoUrl.trim()
                : null);

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
              equipment_activity: true,
              targetAge: item.targetAge || `만 ${step + 2}세`,
              isDataConnected: true,
              objectives,
              goal: objectives[0] || item.goal || '',
              intro: item.intro && typeof item.intro === 'string' && item.intro.trim()
                ? item.intro.trim()
                : undefined,
              method: Array.isArray(item.method) && item.method.length > 0 ? item.method : undefined,
              teacherInteraction: Array.isArray(item.teacherInteraction) && item.teacherInteraction.length > 0
                ? item.teacherInteraction
                : undefined,
              evaluation: Array.isArray(item.evaluation) && item.evaluation.length > 0
                ? item.evaluation
                : undefined,
              safety: Array.isArray(item.safety) && item.safety.length > 0
                ? item.safety
                : undefined,
              thinkingPlus: item.thinkingPlus && typeof item.thinkingPlus === 'string' && item.thinkingPlus.trim()
                ? item.thinkingPlus.trim()
                : undefined,
              exerciseKnowledge: item.exerciseKnowledge && typeof item.exerciseKnowledge === 'string' && item.exerciseKnowledge.trim()
                ? item.exerciseKnowledge.trim()
                : undefined,
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

    return getAllInitialActivities().map((activity) => {
      const videoOverrides = this.getVideoOverrides();
      const overriddenVideo = videoOverrides[activity.id];

      const videoUrl =
        (typeof overriddenVideo === 'string' && overriddenVideo.trim()
          ? overriddenVideo.trim()
          : null) ||
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

  // 5. 원본 체육놀이 PDF 파일 IndexedDB 관리
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

  // 6. 활동별 영상 URL 관리자 오버라이드
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

    return getAllInitialActivities().map((activity) => {
      const videoOverrides = this.getVideoOverrides();
      const overriddenVideo = videoOverrides[activity.id];

      const videoUrl =
        (typeof overriddenVideo === 'string' && overriddenVideo.trim()
          ? overriddenVideo.trim()
          : null) ||
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
