
import React from 'react';
import { Database, BookOpen, Video } from 'lucide-react';

interface HeaderProps {
  currentTeacher: any;
  onOpenAuth: () => void;
  onOpenJsonManager: () => void;
  onOpenPdfManager: () => void;
  onOpenVideoManager: () => void;
  completedCount: number;
  totalActivities: number;
  currentStep: number;
  onSelectStep: (step: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenJsonManager,
  onOpenPdfManager,
  onOpenVideoManager,
  completedCount,
  totalActivities,
  currentStep,
  onSelectStep
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* 왼쪽: 로고 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectStep(0)}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#75C9F5] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              하
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight group-hover:text-[#0284C7] transition-colors">
                하하하 놀이 체육
              </span>
              <span className="text-[11px] text-slate-400 block font-normal leading-none mt-0.5">
                유아 놀이 체육 교육 자료실
              </span>
            </div>
          </button>
        </div>

        {/* 가운데: 단계별 바로가기 */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-xl border border-slate-200/60">
          {[1, 2, 3, 0].map((step) => (
            <button
              key={step}
              onClick={() => onSelectStep(step)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                currentStep === step
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {step === 0 ? '전체 90개' : `${step}단계`}
            </button>
          ))}
        </nav>

        {/* 오른쪽: 관리 메뉴 및 활동 현황 */}
        <div className="flex items-center gap-1 sm:gap-2">

          <button
            onClick={onOpenVideoManager}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="활동별 동영상 및 QR코드 URL 관리"
          >
            <Video className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">영상 관리</span>
          </button>

          <button
            onClick={onOpenPdfManager}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="놀이 체육 원본 PDF 자료 관리"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0284C7]" />
            <span className="hidden sm:inline">PDF 원본</span>
          </button>

          <button
            onClick={onOpenJsonManager}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="90개 활동 JSON 데이터 관리"
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">데이터</span>
          </button>

          {/* 활동 완료 현황 */}
          <div className="ml-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#E8F6FE] text-[#0284C7]">
            <span className="text-xs font-semibold whitespace-nowrap">
              <span className="hidden sm:inline">활동 완료 </span>
              {completedCount}/{totalActivities}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
};
