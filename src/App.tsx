import React, { useState, useEffect, useMemo } from 'react';
import { ActivityItem, EquipmentCategory, TeacherUser, TeacherRecord } from './types';
import { storageService } from './services/storage';
import { Header } from './components/Header';
import { TodaySpotlight } from './components/TodaySpotlight';
import { StageNav } from './components/StageNav';
import { ActivityCard } from './components/ActivityCard';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { JsonDataManagerModal } from './components/JsonDataManagerModal';
import { PdfManagerModal } from './components/PdfManagerModal';
import { VideoManagerModal } from './components/VideoManagerModal';

export default function App() {
  // 1. Core State
  const [activities, setActivities] = useState<ActivityItem[]>(() => storageService.getActivities());
  const [currentTeacher, setCurrentTeacher] = useState<TeacherUser | null>(() => storageService.getCurrentTeacher());
  const [teacherRecord, setTeacherRecord] = useState<TeacherRecord>({
    completedActivityIds: [],
    notes: {},
    lastUpdated: ''
  });

  // 2. Navigation & Filter State
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: 전체 90개, 1: 1단계, 2: 2단계, 3: 3단계
  const [selectedCategory, setSelectedCategory] = useState<'all' | EquipmentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);

  // 3. Modals State
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isJsonManagerOpen, setIsJsonManagerOpen] = useState(false);
  const [isPdfManagerOpen, setIsPdfManagerOpen] = useState(false);
  const [isVideoManagerOpen, setIsVideoManagerOpen] = useState(false);

  // 4. Today's and Next Activity ID
  const [todayOffset, setTodayOffset] = useState<number>(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    return (dayOfYear % 90) + 1;
  });

  // Sync teacher record whenever current teacher changes
  useEffect(() => {
    if (currentTeacher) {
      const record = storageService.getTeacherRecord(currentTeacher.id);
      setTeacherRecord(record);
    } else {
      setTeacherRecord({
        completedActivityIds: [],
        notes: {},
        lastUpdated: ''
      });
      setShowOnlyCompleted(false);
    }
  }, [currentTeacher]);

  // Handler: Teacher Login
  const handleLogin = (user: TeacherUser) => {
    storageService.setCurrentTeacher(user);
    setCurrentTeacher(user);
  };

  // Handler: Teacher Logout
  const handleLogout = () => {
    storageService.setCurrentTeacher(null);
    setCurrentTeacher(null);
  };

  // Handler: Toggle Activity Complete
  const handleToggleComplete = (activityId: number) => {
    if (!currentTeacher) {
      setIsAuthModalOpen(true);
      return;
    }
    storageService.toggleComplete(currentTeacher.id, activityId);
    setTeacherRecord(storageService.getTeacherRecord(currentTeacher.id));
  };

  // Handler: Save Teacher Note
  const handleSaveNote = (activityId: number, note: string) => {
    if (!currentTeacher) {
      setIsAuthModalOpen(true);
      return;
    }
    storageService.saveNote(currentTeacher.id, activityId, note);
    setTeacherRecord(storageService.getTeacherRecord(currentTeacher.id));
  };

  // Handler: Activities update from JSON manager
  const handleActivitiesUpdated = (newActivities: ActivityItem[]) => {
    setActivities(newActivities);
    if (selectedActivity) {
      const refreshed = newActivities.find(a => a.id === selectedActivity.id) || null;
      setSelectedActivity(refreshed);
    }
  };

  // Helper: check completion
  const isActivityCompleted = (id: number) => {
    return teacherRecord.completedActivityIds.includes(id);
  };

  // Helper: check if has note
  const hasActivityNote = (id: number) => {
    return Boolean(teacherRecord.notes[id] && teacherRecord.notes[id].trim());
  };

  // Shuffle Today's Play
  const handleShuffleToday = () => {
    const randomId = Math.floor(Math.random() * activities.length) + 1;
    setTodayOffset(randomId);
  };

  // Find Today and Next activities
  const todayActivity = useMemo(() => {
    return activities.find(a => a.id === todayOffset) || activities[0] || ({} as ActivityItem);
  }, [activities, todayOffset]);

  const nextActivity = useMemo(() => {
    const nextId = todayOffset >= activities.length ? 1 : todayOffset + 1;
    return activities.find(a => a.id === nextId) || activities[1] || ({} as ActivityItem);
  }, [activities, todayOffset]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Step filter (0: 전체 보기)
      if (currentStep !== 0 && activity.step !== currentStep) {
        return false;
      }
      // Equipment category filter (연령 단계와 무관하게 선택한 도구 그룹 모아보기)
      if (selectedCategory !== 'all') {
        if (activity.equipmentCategory !== selectedCategory) {
          return false;
        }
      }
      // Teacher Completed filter
      if (showOnlyCompleted && currentTeacher && !isActivityCompleted(activity.id)) {
        return false;
      }
      // Search filter
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
          activity.secondaryEquipments?.some((s) => s.toLowerCase().includes(query));
        const matchesGoal =
          activity.goal?.toLowerCase().includes(query) ||
          activity.objectives?.some((obj) => obj.toLowerCase().includes(query));
        const matchesMaterials = activity.materials?.some((m) => m.toLowerCase().includes(query));

        if (!matchesTitle && !matchesNumber && !matchesTool && !matchesGoal && !matchesMaterials) {
          return false;
        }
      }
      return true;
    });
  }, [activities, currentStep, selectedCategory, showOnlyCompleted, searchQuery, currentTeacher, teacherRecord]);

  // Counts for Stage Navigation & Equipment Categories
  const stepCounts = useMemo(() => {
    return {
      total: activities.length,
      step1: activities.filter((a) => a.step === 1).length,
      step2: activities.filter((a) => a.step === 2).length,
      step3: activities.filter((a) => a.step === 3).length
    };
  }, [activities]);

  const categoryCounts = useMemo(() => {
    // If a step is selected (1, 2, 3), show count within that step, or across all if 0
    const targetPool = currentStep === 0 ? activities : activities.filter((a) => a.step === currentStep);
    return {
      ball: targetPool.filter((a) => a.equipmentCategory === 'ball').length,
      hoop: targetPool.filter((a) => a.equipmentCategory === 'hoop').length,
      scarf: targetPool.filter((a) => a.equipmentCategory === 'scarf').length,
      stick: targetPool.filter((a) => a.equipmentCategory === 'stick').length,
      rope: targetPool.filter((a) => a.equipmentCategory === 'rope').length,
      balloon: targetPool.filter((a) => a.equipmentCategory === 'balloon').length,
      barebody: targetPool.filter((a) => a.equipmentCategory === 'barebody').length,
      other: targetPool.filter((a) => a.equipmentCategory === 'other').length
    };
  }, [activities, currentStep]);

  // Navigation inside Modal
  const currentModalIndex = useMemo(() => {
    if (!selectedActivity) return -1;
    return activities.findIndex(a => a.id === selectedActivity.id);
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

  const completedCount = teacherRecord.completedActivityIds.length;
  const notesCount = Object.keys(teacherRecord.notes).length;

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#34495E] flex flex-col font-sans">
      {/* 1. Simplified Top Header */}
      <Header
        currentTeacher={currentTeacher}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenJsonManager={() => setIsJsonManagerOpen(true)}
        onOpenPdfManager={() => setIsPdfManagerOpen(true)}
        onOpenVideoManager={() => setIsVideoManagerOpen(true)}
        completedCount={completedCount}
        totalActivities={activities.length}
        currentStep={currentStep}
        onSelectStep={(step) => setCurrentStep(step)}
      />

      {/* 2. Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Short & Clean Introduction */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
            유아 체육놀이 교육 자료실
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            만 3세·4세·5세 발달 단계에 맞춘 90가지 표준 신체활동 지도안 (도구별 8개 그룹 분류 및 영상 연계)
          </p>
        </div>

        {/* 3. Compact Today's and Next Activity */}
        {todayActivity.id && nextActivity.id && (
          <TodaySpotlight
            todayActivity={todayActivity}
            nextActivity={nextActivity}
            onSelectActivity={(act) => setSelectedActivity(act)}
            isCompleted={isActivityCompleted}
            onToggleComplete={handleToggleComplete}
            isTeacherLoggedIn={Boolean(currentTeacher)}
            onShuffleActivities={handleShuffleToday}
          />
        )}

        {/* 4. Stage Navigation & Equipment Category Filter Controls */}
        <StageNav
          currentStep={currentStep}
          onSelectStep={(step) => setCurrentStep(step)}
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => setSelectedCategory(category)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showOnlyCompleted={showOnlyCompleted}
          onToggleShowOnlyCompleted={() => setShowOnlyCompleted(!showOnlyCompleted)}
          isTeacherLoggedIn={Boolean(currentTeacher)}
          stepCounts={stepCounts}
          categoryCounts={categoryCounts}
        />

        {/* 5. Activities Grid (2~3 cols on PC, 1 col on Mobile) */}
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isCompleted={isActivityCompleted(activity.id)}
                hasNote={hasActivityNote(activity.id)}
                isTeacherLoggedIn={Boolean(currentTeacher)}
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

      {/* 6. Clean Minimalist Footer */}
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

      {/* Modals */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          isOpen={Boolean(selectedActivity)}
          onClose={() => setSelectedActivity(null)}
          isCompleted={isActivityCompleted(selectedActivity.id)}
          onToggleComplete={handleToggleComplete}
          noteText={teacherRecord.notes[selectedActivity.id] || ''}
          onSaveNote={handleSaveNote}
          currentTeacher={currentTeacher}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenJsonManager={() => setIsJsonManagerOpen(true)}
          onOpenPdfManager={() => setIsPdfManagerOpen(true)}
          onOpenVideoManager={() => setIsVideoManagerOpen(true)}
          onNavigatePrev={handleModalPrev}
          onNavigateNext={handleModalNext}
          hasPrev={currentModalIndex > 0}
          hasNext={currentModalIndex < activities.length - 1}
        />
      )}

      <TeacherAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentTeacher={currentTeacher}
        onLogin={handleLogin}
        onLogout={handleLogout}
        completedCount={completedCount}
        notesCount={notesCount}
      />

      <JsonDataManagerModal
        isOpen={isJsonManagerOpen}
        onClose={() => setIsJsonManagerOpen(false)}
        activities={activities}
        onActivitiesUpdated={handleActivitiesUpdated}
      />

      <PdfManagerModal
        isOpen={isPdfManagerOpen}
        onClose={() => setIsPdfManagerOpen(false)}
        onPdfUpdated={() => {
          setActivities(storageService.getActivities());
        }}
      />

      <VideoManagerModal
        isOpen={isVideoManagerOpen}
        onClose={() => setIsVideoManagerOpen(false)}
        activities={activities}
        onVideoUpdated={() => {
          const refreshed = storageService.getActivities();
          setActivities(refreshed);
          if (selectedActivity) {
            setSelectedActivity(refreshed.find((a) => a.id === selectedActivity.id) || null);
          }
        }}
      />
    </div>
  );
}
