
import React from 'react';
import { ActivityItem, EQUIPMENT_CONFIG } from '../types';
import { Check, ChevronRight, FileText } from 'lucide-react';

interface ActivityCardProps {
  activity: ActivityItem;
  isCompleted: boolean;
  hasNote: boolean;
  isTeacherLoggedIn: boolean;
  onSelect: (activity: ActivityItem) => void;
  onToggleComplete: (e: React.MouseEvent, activityId: number) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isCompleted,
  hasNote,
  isTeacherLoggedIn,
  onSelect,
  onToggleComplete
}) => {
  const equipStyle =
    EQUIPMENT_CONFIG[activity.equipmentCategory] || EQUIPMENT_CONFIG.barebody;

  return (
    <div
      onClick={() => onSelect(activity)}
      className={`group bg-white rounded-xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between ${
        isCompleted
          ? 'border-emerald-200 bg-[#FAFCFA]'
          : 'border-slate-200/80 hover:border-[#75C9F5] hover:shadow-2xs'
      }`}
    >
      <div>
        {/* 활동 번호 및 도구 분류 */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-semibold text-[#0284C7] bg-[#E8F6FE] px-2 py-0.5 rounded">
            {activity.step}단계 {String(activity.stepNumber).padStart(2, '0')}번
          </span>

          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${equipStyle.badgeBg} ${equipStyle.badgeText} ${equipStyle.badgeBorder} inline-flex items-center gap-1`}
            title={`대표 도구: ${activity.equipmentName || equipStyle.label}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: equipStyle.dotColor }}
            />
            <span>{equipStyle.label}</span>
          </span>
        </div>

        {/* 활동 제목 */}
        <div className="mb-2 space-y-1">
          <p className="text-xs text-slate-500 font-medium line-clamp-1">
            {(activity as ActivityItem & { bodyActivityTitle?: string }).bodyActivityTitle || ''}
          </p>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2">
            {activity.title}
          </h3>
        </div>
      </div>

      {/* 자세히 보기 및 교사 기록 */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 group-hover:text-[#0284C7] transition-colors inline-flex items-center gap-0.5">
            자세히 보기 <ChevronRight className="w-3.5 h-3.5" />
          </span>

          {hasNote && (
            <span className="text-[11px] text-slate-400 flex items-center gap-0.5" title="작성된 메모 있음">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>메모</span>
            </span>
          )}
        </div>

        {isTeacherLoggedIn && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(e, activity.id);
            }}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : 'border border-slate-200 text-slate-300 hover:border-slate-400 hover:text-slate-500'
            }`}
            title={isCompleted ? '완료 취소' : '수업 완료 체크'}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
