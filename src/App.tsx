
import React, { useState, useMemo } from 'react';
import { ActivityItem, EquipmentCategory, TeacherRecord } from './types';
import { storageService } from './services/storage';
import { Header } from './components/Header';
import { StageNav } from './components/StageNav';
import { ActivityCard } from './components/ActivityCard';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { JsonDataManagerModal } from './components/JsonDataManagerModal';
import { PdfManagerModal } from './components/PdfManagerModal';
import { VideoManagerModal } from './components/VideoManagerModal';

const createEmptyRecord = (): TeacherRecord => ({
  completedActivityIds: [],
  notes: {},
  lastUpdated: new Date().toISOString()
});

export default function App() {
  // 1. 기본 데이터 및 로컬 활동 기록
  const [activities, setActivities] = useState<ActivityItem[]>(
    () => storageService.getActivities()
  );

  const [teacherRecord, setTeacherRecord] = useState<TeacherRecord>(
    () => storageService.getLocalRecord()
  );

  // 2. 검색 및 필터 상태
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] =
    useState<'all' | EquipmentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);

  // 3. 모달 상태
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityItem | null>(null);
  const [isJsonManagerOpen, setIsJsonManagerOpen] = useState(false);
  const [isPdfManagerOpen, setIsPdfManagerOpen] = useState(false);
  const [isVideoManagerOpen, setIsVideoManagerOpen] = useState(false);

  // 4. 로컬 기록 새로고침
  const refreshLocalRecord = () => {
    setTeacherRecord(storageService.getLocalRecord());
  };

  // 5. 활동 완료 체크 및 취소
  const handleToggleComplete = (activityId: number) => {
    storageService.toggleLocalComplete(activityId);
    refreshLocalRecord();
  };

  // 6. 활동 메모 저장
  const handleSaveNote = (activityId: number, note: string) => {
    storageService.saveLocalNote(activityId, note);
    refreshLocalRecord();
  };

  // 7. 활동 데이터 업데이트
  const handleActivitiesUpdated = (newActivities: ActivityItem[]) => {
    setActivities(newActivities);

    if (selectedActivity) {
      const refreshed =
        newActivities.find(a => a.id === selectedActivity.id) || null;
      setSelectedActivity(refreshed);
    }
  };

  // 8. 활동 완료 여부 확인
  const isActivityCompleted = (id: number) => {
    return teacherRecord.completedActivityIds.includes(id);
  };

  // 9. 활동 메모 여부 확인
  const hasActivityNote = (id: number) => {
    return Boolean(
      teacherRecord.notes[id] && teacherRecord.notes[id].trim()
    );
  };

  // 10. 활동 목록 필터링
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      if (currentStep !== 0 && activity.step !== currentStep) {
        return false;
      }

      if (
        selectedCategory !== 'all' &&
        activity.equipmentCategory !== selectedCategory
      ) {
        return false;
      }

      if (
        showOnlyCompleted &&
        !teacherRecord.completedActivityIds.includes(activity.id)
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();

        const matchesTitle = activity.title.toLowerCase().includes(query);

        const matchesNumber =
          String(activity.stepNumber).includes(query) ||
          String(activity.id).includes(query) ||
          String(activity.sequence).includes(query) ||
          `${activity.step}단계`.includes(query);

        const matchesTool =
          activity.equipmentName?.toLowerCase().includes(query) ||
          activity.secondaryEquipments?.some((s) =>
            s.toLowerCase().includes(query)
          );

        const matchesGoal =
          activity.goal?.toLowerCase().includes(query) ||
          activity.objectives?.some((obj) =>
            obj.toLowerCase().includes(query)
          );

        const matchesMaterials =
          activity.materials?.some((m) =>
            m.toLowerCase().includes(query)
          );

        if (
          !matchesTitle &&
          !matchesNumber &&
          !matchesTool &&
          !matchesGoal &&
          !matchesMaterials
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    activities,
    currentStep,
    selectedCategory,
    showOnlyCompleted,
    searchQuery,
    teacherRecord
  ]);

  // 11. 단계별 활동 개수
  const stepCounts = useMemo(() => {
    return {
      total: activities.length,
      step1: activities.filter((a) => a.step === 1).length,
      step2: activities.filter((a) => a.step === 2).length,
      step3: activities.filter((a) => a.step === 3).length
    };
  }, [activities]);

  // 12. 도구별 활동 개수
  const categoryCounts = useMemo(() => {
    const targetPool = currentStep === 0
      ? activities
      : activities.filter((a) => a.step === currentStep);

    return {
      ball: targetPool.filter((a) => a.equipmentCategory === 'ball').length,
      hoop: targetPool.filter((a) => a.equipmentCategory === 'hoop').length,
      rope: targetPool.filter((a) => a.equipmentCategory === 'rope').length,
      balanceBeam: targetPool.filter((a) => a.equipmentCategory === 'balanceBeam').length,
      mat: targetPool.filter((a) => a.equipmentCategory === 'mat').length,
      vaultingBox: targetPool.filter((a) => a.equipmentCategory === 'vaultingBox').length,
      creative: targetPool.filter((a) => a.equipmentCategory === 'creative').length
    };
  }, [activities, currentStep]);

  // 13. 상세보기 모달 내 활동 이동
  const currentModalIndex = useMemo(() => {
    if (!selectedActivity) return -1;

    return activities.findIndex(
      a => a.id === selectedActivity.id
    );
  }, [activities, selectedActivity]);

  const handleModalPrev = () => {
    if (currentModalIndex > 0) {
      setSelectedActivity(activities[currentModalIndex - 1]);
    }
  };

  const handleModalNext = () => {
    if (currentModalIndex < activities.length - 1) {
      setSelectedActivity(activities[currentModalIndex + 1]);
    }
  };

  // 14. 활동 기록 통계
  const completedCount = teacherRecord.completedActivityIds.length;

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#34495E] flex flex-col font-sans">

      {/* 상단 헤더 */}
      <Header
        currentTeacher={null}
        onOpenAuth={() => {}}
        onOpenJsonManager={() => setIsJsonManagerOpen(true)}
        onOpenPdfManager={() => setIsPdfManagerOpen(true)}
        onOpenVideoManager={() => setIsVideoManagerOpen(true)}
        completedCount={completedCount}
        totalActivities={activities.length}
        currentStep={currentStep}
        onSelectStep={(step) => setCurrentStep(step)}
      />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* 사이트 제목 및 소개 */}
        <div className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            <span className="text-[#38A9E8]">하</span>
            <span className="text-[#F28B9B]">루에 </span>
            <span className="text-[#38A9E8]">하</span>
            <span className="text-[#F5A623]">나씩 </span>
            <span className="text-[#38A9E8]">하</span>
            <span className="text-[#65B88A]">는 </span>
            <span className="text-[#38A9E8]">하하하</span>
            <span className="text-[#A58AD4]">놀이 체육 </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mb-1">
            매일 하나씩, 아이들과 신나게 움직이는 유아 놀이 체육
          </p>

          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
            자료 출처: 「다 함께 운동놀이」 원본 자료를 바탕으로
            수업에 활용하기 쉽도록 구성한 교육 자료 사이트입니다.
          </p>
        </div>

        {/* 단계별 및 도구별 분류 */}
        <StageNav
          currentStep={currentStep}
          onSelectStep={(step) => setCurrentStep(step)}
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => setSelectedCategory(category)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showOnlyCompleted={showOnlyCompleted}
          onToggleShowOnlyCompleted={() =>
            setShowOnlyCompleted(!showOnlyCompleted)
          }
          isTeacherLoggedIn={true}
          stepCounts={stepCounts}
          categoryCounts={categoryCounts}
        />

        {/* 활동 목록 */}
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isCompleted={isActivityCompleted(activity.id)}
                hasNote={hasActivityNote(activity.id)}
                isTeacherLoggedIn={true}
                onSelect={(act) => setSelectedActivity(act)}
                onToggleComplete={(e, id) => {
                  e.stopPropagation();
                  handleToggleComplete(id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-10 text-center border border-slate-200/80">
            <h4 className="text-sm font-semibold text-slate-800 mb-1">
              검색 조건과 일치하는 활동이 없습니다
            </h4>

            <p className="text-xs text-slate-500 mb-3">
              다른 도구를 선택하시거나 검색어를 변경해 보세요.
            </p>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowOnlyCompleted(false);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium cursor-pointer"
            >
              필터 초기화
            </button>
          </div>
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-white border-t border-slate-200/60 py-6 px-4 sm:px-6 text-xs text-slate-400 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-semibold text-slate-700">
            하하하 체육놀이
          </div>

          <div className="text-[11px] text-slate-400 text-center sm:text-right">
            유아교육기관 교사를 위한 체육놀이 교육 자료실
          </div>
        </div>
      </footer>

      {/* 활동 상세보기 모달 */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          isOpen={Boolean(selectedActivity)}
          onClose={() => setSelectedActivity(null)}
          isCompleted={isActivityCompleted(selectedActivity.id)}
          onToggleComplete={handleToggleComplete}
          noteText={teacherRecord.notes[selectedActivity.id] || ''}
          onSaveNote={handleSaveNote}
          currentTeacher={null}
          onOpenAuth={() => {}}
          onOpenJsonManager={() => setIsJsonManagerOpen(true)}
          onOpenPdfManager={() => setIsPdfManagerOpen(true)}
          onOpenVideoManager={() => setIsVideoManagerOpen(true)}
          onNavigatePrev={handleModalPrev}
          onNavigateNext={handleModalNext}
          hasPrev={currentModalIndex > 0}
          hasNext={currentModalIndex < activities.length - 1}
        />
      )}

      {/* 활동 데이터 관리 */}
      <JsonDataManagerModal
        isOpen={isJsonManagerOpen}
        onClose={() => setIsJsonManagerOpen(false)}
        activities={activities}
        onActivitiesUpdated={handleActivitiesUpdated}
      />

      {/* PDF 관리 */}
      <PdfManagerModal
        isOpen={isPdfManagerOpen}
        onClose={() => setIsPdfManagerOpen(false)}
        onPdfUpdated={() => {
          setActivities(storageService.getActivities());
        }}
      />

      {/* 영상 관리 */}
      <VideoManagerModal
        isOpen={isVideoManagerOpen}
        onClose={() => setIsVideoManagerOpen(false)}
        activities={activities}
        onVideoUpdated={() => {
          const refreshed = storageService.getActivities();
          setActivities(refreshed);

          if (selectedActivity) {
            setSelectedActivity(
              refreshed.find((a) => a.id === selectedActivity.id) || null
            );
          }
        }}
      />
    </div>
  );
}
