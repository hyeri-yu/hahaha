import React from 'react';
import { ActivityItem, EQUIPMENT_CONFIG } from '../types';
import { ArrowRight, Check, ChevronRight, Shuffle } from 'lucide-react';

interface TodaySpotlightProps {
  todayActivity: ActivityItem;
  nextActivity: ActivityItem;
  onSelectActivity: (activity: ActivityItem) => void;
  isCompleted: (activityId: number) => boolean;
  onToggleComplete: (activityId: number) => void;
  isTeacherLoggedIn: boolean;
  onShuffleActivities: () => void;
}

export const TodaySpotlight: React.FC<TodaySpotlightProps> = ({
  todayActivity,
  nextActivity,
  onSelectActivity,
  isCompleted,
  onToggleComplete,
  isTeacherLoggedIn,
  onShuffleActivities
}) => {
  const isTodayDone = isCompleted(todayActivity.id);
  const isNextDone = isCompleted(nextActivity.id);

  const todayStyle = EQUIPMENT_CONFIG[todayActivity.equipmentCategory] || EQUIPMENT_CONFIG.barebody;
  const nextStyle = EQUIPMENT_CONFIG[nextActivity.equipmentCategory] || EQUIPMENT_CONFIG.barebody;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          추천 체육놀이
        </h2>
        <button
          onClick={onShuffleActivities}
          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="다른 활동 추천"
        >
          <Shuffle className="w-3 h-3 text-slate-400" />
          <span>다른 놀이</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. 오늘의 체육놀이 */}
        <div
          onClick={() => onSelectActivity(todayActivity)}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            isTodayDone
              ? 'bg-[#F0FDF4] border-emerald-200'
              : 'bg-white hover:bg-[#F8FAFC] border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-[#0284C7] bg-[#E8F6FE] px-2 py-0.5 rounded">
                오늘의 놀이
              </span>
              <span className="text-[11px] text-slate-500">
                {todayActivity.step}단계 {String(todayActivity.stepNumber).padStart(2, '0')}번
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${todayStyle.badgeBg} ${todayStyle.badgeText} ${todayStyle.badgeBorder} inline-flex items-center gap-1`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: todayStyle.dotColor }} />
                <span>{todayStyle.label}</span>
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                PDF {todayActivity.pdf_page}쪽
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
              {todayActivity.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isTeacherLoggedIn && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(todayActivity.id);
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  isTodayDone
                    ? 'bg-emerald-500 text-white'
                    : 'border border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
                title={isTodayDone ? '완료 취소' : '수업 완료 체크'}
              >
                <Check className="w-4 h-4" />
              </button>
            )}

            <span className="text-xs text-slate-400 group-hover:text-slate-700 hidden sm:inline flex items-center">
              자세히 <ChevronRight className="w-3.5 h-3.5 inline" />
            </span>
          </div>
        </div>

        {/* 2. 다음 체육놀이 */}
        <div
          onClick={() => onSelectActivity(nextActivity)}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            isNextDone
              ? 'bg-[#F0FDF4] border-emerald-200'
              : 'bg-white hover:bg-[#F8FAFC] border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                다음 놀이
              </span>
              <span className="text-[11px] text-slate-500">
                {nextActivity.step}단계 {String(nextActivity.stepNumber).padStart(2, '0')}번
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${nextStyle.badgeBg} ${nextStyle.badgeText} ${nextStyle.badgeBorder} inline-flex items-center gap-1`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: nextStyle.dotColor }} />
                <span>{nextStyle.label}</span>
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                PDF {nextActivity.pdf_page}쪽
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
              {nextActivity.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isTeacherLoggedIn && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(nextActivity.id);
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  isNextDone
                    ? 'bg-emerald-500 text-white'
                    : 'border border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
                title={isNextDone ? '완료 취소' : '수업 완료 체크'}
              >
                <Check className="w-4 h-4" />
              </button>
            )}

            <span className="text-xs text-slate-400 group-hover:text-slate-700 hidden sm:inline flex items-center">
              자세히 <ChevronRight className="w-3.5 h-3.5 inline" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
