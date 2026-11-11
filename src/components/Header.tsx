import React from 'react';
import { TeacherUser } from '../types';
import { User, LogIn, Database, Check, BookOpen, Video } from 'lucide-react';

interface HeaderProps {
  currentTeacher: TeacherUser | null;
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
  currentTeacher,
  onOpenAuth,
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
        {/* Left: Clean Brand Logo */}
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
                하하하 체육놀이
              </span>
              <span className="text-[11px] text-slate-400 block font-normal leading-none mt-0.5">
                유아 체육놀이 교육 자료실
              </span>
            </div>
          </button>
        </div>

        {/* Center: Stage quick navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => onSelectStep(1)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1단계
          </button>
          <button
            onClick={() => onSelectStep(2)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2단계
          </button>
          <button
            onClick={() => onSelectStep(3)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3단계
          </button>
          <button
            onClick={() => onSelectStep(0)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              currentStep === 0
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            전체 90개
          </button>
        </nav>

        {/* Right: Clean Actions */}
        <div className="flex items-center gap-2">
          {/* Video Manager */}
          <button
            onClick={onOpenVideoManager}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="활동별 동영상 및 QR코드 URL 관리"
          >
            <Video className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">영상 관리</span>
          </button>

          {/* PDF Book Manager */}
          <button
            onClick={onOpenPdfManager}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="체육놀이 원본 PDF 자료 관리"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0284C7]" />
            <span className="hidden sm:inline">PDF 원본</span>
          </button>

          {/* JSON Data Management */}
          <button
            onClick={onOpenJsonManager}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="90개 활동 JSON 데이터 관리"
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">데이터</span>
          </button>

          {/* Teacher Auth / Profile */}
          {currentTeacher ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 text-xs font-medium text-slate-700 transition-all cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[#E8F6FE] text-[#0284C7] flex items-center justify-center font-bold text-[10px]">
                {currentTeacher.name.slice(0, 1)}
              </div>
              <span className="font-semibold text-slate-800">{currentTeacher.name}</span>
              <span className="text-[11px] text-slate-400 tabular-nums">
                ({completedCount}/{totalActivities})
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#75C9F5] hover:bg-[#58BCEF] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
