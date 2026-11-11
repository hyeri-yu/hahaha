import React from 'react';
import { EquipmentCategory, EQUIPMENT_CONFIG } from '../types';
import { Search, Check } from 'lucide-react';

interface StageNavProps {
  currentStep: number; // 0: 전체, 1: 1단계, 2: 2단계, 3: 3단계
  onSelectStep: (step: number) => void;
  selectedCategory: 'all' | EquipmentCategory;
  onSelectCategory: (category: 'all' | EquipmentCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showOnlyCompleted: boolean;
  onToggleShowOnlyCompleted: () => void;
  isTeacherLoggedIn: boolean;
  stepCounts: {
    total: number;
    step1: number;
    step2: number;
    step3: number;
  };
  categoryCounts: Record<EquipmentCategory, number>;
}

export const StageNav: React.FC<StageNavProps> = ({
  currentStep,
  onSelectStep,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  showOnlyCompleted,
  onToggleShowOnlyCompleted,
  isTeacherLoggedIn,
  stepCounts,
  categoryCounts
}) => {
  const steps = [
    { id: 1, label: '1단계', age: '만 3세', count: stepCounts.step1 },
    { id: 2, label: '2단계', age: '만 4세', count: stepCounts.step2 },
    { id: 3, label: '3단계', age: '만 5세', count: stepCounts.step3 },
    { id: 0, label: '전체', age: '전체 보기', count: stepCounts.total }
  ];

  const categories: Array<{ id: 'all' | EquipmentCategory; label: string; count: number }> = [
    { id: 'all', label: '전체 도구', count: stepCounts.total },
    { id: 'ball', label: '공운동', count: categoryCounts.ball },
    { id: 'hoop', label: '후프운동', count: categoryCounts.hoop },
    { id: 'scarf', label: '스카프 운동', count: categoryCounts.scarf },
    { id: 'stick', label: '막대 운동', count: categoryCounts.stick },
    { id: 'rope', label: '줄 운동', count: categoryCounts.rope },
    { id: 'balloon', label: '풍선 운동', count: categoryCounts.balloon },
    { id: 'barebody', label: '맨몸운동', count: categoryCounts.barebody },
    { id: 'other', label: '기타 도구', count: categoryCounts.other }
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* 1. Main Stage Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`p-3.5 rounded-xl text-left transition-all border cursor-pointer ${
                isActive
                  ? 'bg-white border-[#75C9F5] shadow-xs ring-1 ring-[#75C9F5]'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-sm font-bold ${isActive ? 'text-[#0284C7]' : 'text-slate-900'}`}>
                  {step.label}
                </span>
                <span
                  className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-[#E8F6FE] text-[#0284C7]' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step.count}
                </span>
              </div>
              <div className="text-xs text-slate-500">{step.age}</div>
            </button>
          );
        })}
      </div>

      {/* 2. Controls Bar: 도구별 모아보기 필터 + 교사 완료 필터 + 검색 */}
      <div className="space-y-2.5 pt-1">
        {/* Top: 도구별 분류 필터 바 (파스텔 태그 버튼들) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-700 shrink-0 mr-1">
            도구별 모아보기:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const config = cat.id !== 'all' ? EQUIPMENT_CONFIG[cat.id] : null;

            if (cat.id === 'all') {
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  전체 ({cat.count})
                </button>
              );
            }

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? `${config?.bgClass} ${config?.textClass} ${config?.borderClass} ring-2 ring-offset-1 ring-slate-400 font-bold`
                    : `${config?.badgeBg} ${config?.badgeText} ${config?.badgeBorder} opacity-90 hover:opacity-100`
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: config?.dotColor }}
                />
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75 tabular-nums font-normal">
                  ({cat.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom: Search & Teacher Completed Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs text-slate-500">
            {selectedCategory === 'all'
              ? '연령 단계와 관계없이 모든 도구 활동을 검색할 수 있습니다.'
              : `'${EQUIPMENT_CONFIG[selectedCategory].label}' 활동만 모아보고 있습니다.`}
          </div>

          <div className="flex items-center gap-2">
            {isTeacherLoggedIn && (
              <button
                onClick={onToggleShowOnlyCompleted}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  showOnlyCompleted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${showOnlyCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>완료한 활동</span>
              </button>
            )}

            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="도구명, 활동명 또는 번호 검색"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white border border-slate-200 focus:outline-none focus:border-[#75C9F5] placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
