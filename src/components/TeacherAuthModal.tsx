import React, { useState } from 'react';
import { TeacherUser } from '../types';
import { SAMPLE_TEACHERS } from '../services/storage';
import { X, LogIn, LogOut, Check } from 'lucide-react';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTeacher: TeacherUser | null;
  onLogin: (user: TeacherUser) => void;
  onLogout: () => void;
  completedCount: number;
  notesCount: number;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  currentTeacher,
  onLogin,
  onLogout,
  completedCount,
  notesCount
}) => {
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [className, setClassName] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = `teacher_${Date.now()}_${name.trim().toLowerCase().replace(/\s+/g, '_')}`;
    const user: TeacherUser = {
      id,
      name: name.trim().endsWith('선생님') ? name.trim() : `${name.trim()} 선생님`,
      institution: institution.trim() || '유아교육기관',
      className: className.trim() || '유아반'
    };

    onLogin(user);
    onClose();
  };

  const handleQuickLogin = (teacher: TeacherUser) => {
    onLogin(teacher);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200/80 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {currentTeacher ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E8F6FE] text-[#0284C7] flex items-center justify-center font-bold text-sm">
                {currentTeacher.name.slice(0, 1)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {currentTeacher.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {currentTeacher.institution} · {currentTeacher.className}
                </p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200/60 mb-4 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/60">
                  <span className="block text-[11px] text-slate-400 mb-0.5">완료한 활동</span>
                  <span className="text-base font-bold text-slate-900 tabular-nums">
                    {completedCount} <span className="text-xs text-slate-400 font-normal">/ 90</span>
                  </span>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/60">
                  <span className="block text-[11px] text-slate-400 mb-0.5">작성한 메모</span>
                  <span className="text-base font-bold text-slate-900 tabular-nums">
                    {notesCount} <span className="text-xs text-slate-400 font-normal">개</span>
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                선생님 개인 진도는 다른 교사에게 공개되지 않습니다.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600 mb-1">
                계정 전환:
              </div>
              <div className="space-y-1 mb-3">
                {SAMPLE_TEACHERS.filter(t => t.id !== currentTeacher.id).map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleQuickLogin(t)}
                    className="w-full p-2 rounded-lg border border-slate-200/70 hover:bg-slate-50 text-left text-xs transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-slate-800">{t.name} ({t.className})</span>
                    <span className="text-slate-400">선택</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                선생님 로그인
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                수업 완료 체크와 개인 메모를 저장할 수 있습니다.
              </p>
            </div>

            <div className="flex rounded-lg bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'quick' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                교사 계정 선택
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'custom' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                직접 입력
              </button>
            </div>

            {activeTab === 'quick' ? (
              <div className="space-y-1.5 mb-4">
                {SAMPLE_TEACHERS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleQuickLogin(t)}
                    className="w-full p-2.5 rounded-lg border border-slate-200/80 hover:border-[#75C9F5] hover:bg-[#F0F9FE]/50 text-left transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-400">{t.institution} · {t.className}</div>
                    </div>
                    <span className="text-xs font-medium text-[#0284C7]">선택</span>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleCustomLogin} className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    교사 성함
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 김민지 선생님"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#75C9F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    소속 기관 (선택)
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="예: 햇살어린이집"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#75C9F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    학급명 (선택)
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="예: 만 3세 풀잎반"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#75C9F5]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-[#75C9F5] hover:bg-[#58BCEF] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  로그인하기
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
