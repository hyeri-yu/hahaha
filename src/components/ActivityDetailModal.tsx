
import React, { useState, useEffect } from 'react';
import { ActivityItem, TeacherUser, EQUIPMENT_CONFIG } from '../types';
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Printer,
  FileText,
  BookOpen,
  Sparkles,
  Video,
  Play,
  ExternalLink,
  Package
} from 'lucide-react';
import { PdfViewer } from './PdfViewer';
import { qrVideoService } from '../services/qrVideoService';

interface ActivityDetailModalProps {
  activity: ActivityItem;
  isOpen: boolean;
  onClose: () => void;
  isCompleted: boolean;
  onToggleComplete: (activityId: number) => void;
  noteText: string;
  onSaveNote: (activityId: number, note: string) => void;
  currentTeacher: TeacherUser | null;
  onOpenAuth: () => void;
  onOpenJsonManager: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onOpenPdfManager?: () => void;
  onOpenVideoManager?: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  isOpen,
  onClose,
  isCompleted,
  onToggleComplete,
  noteText,
  onSaveNote,
  onNavigatePrev,
  onNavigateNext,
  hasPrev,
  hasNext,
  onOpenPdfManager,
  onOpenVideoManager
}) => {
  const [localNote, setLocalNote] = useState(noteText);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState<boolean>(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(false);

  useEffect(() => {
    setLocalNote(noteText);
    setShowVideoPlayer(false);
  }, [noteText, activity.id]);

  if (!isOpen) return null;

  const handleSaveNote = () => {
    onSaveNote(activity.id, localNote);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleNoteChange = (value: string) => {
    setLocalNote(value);
    onSaveNote(activity.id, value);
    setIsSavedNotice(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const equipStyle =
    EQUIPMENT_CONFIG[activity.equipmentCategory] ||
    EQUIPMENT_CONFIG.barebody;

  const objectivesList: string[] =
    activity.objectives && activity.objectives.length > 0
      ? activity.objectives
      : activity.goal
        ? [activity.goal]
        : [];

  const hasVideoUrl = Boolean(activity.videoUrl && activity.videoUrl.trim());
  const embedInfo = qrVideoService.getEmbedUrl(activity.videoUrl);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200/90 overflow-hidden">

        {/* 상단 제목 */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white z-20">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
              <span className="font-semibold text-[#0284C7] bg-[#E8F6FE] px-2 py-0.5 rounded">
                {activity.step}단계 {String(activity.stepNumber).padStart(2, '0')}번
              </span>

              <span>·</span>

              <span
                className={`font-semibold px-2 py-0.5 rounded border ${equipStyle.badgeBg} ${equipStyle.badgeText} ${equipStyle.badgeBorder} inline-flex items-center gap-1`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: equipStyle.dotColor }}
                />
                <span>{equipStyle.label}</span>
              </span>

              <span>·</span>
              <span>{activity.targetAge || `만 ${activity.step + 2}세`}</span>
              <span>·</span>

              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>PDF {activity.pdf_page}쪽</span>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {activity.title}
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="지도안 인쇄"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 스크롤 콘텐츠 */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">

          {/* 1. 활동 목표 및 준비물 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <section className="md:col-span-2 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>활동 목표</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  표준 누리과정 연계
                </span>
              </div>

              {objectivesList.length > 0 ? (
                <ul className="space-y-1.5 pt-1">
                  {objectivesList.map((obj, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#75C9F5] mt-2 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-400 text-xs">
                  활동 목표 준비 중
                </span>
              )}
            </section>

            <section className="p-4 rounded-xl bg-[#FAF6F0]/70 border border-[#E7DFD5] space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-700" />
                <span>사용 도구 & 준비물</span>
              </h3>

              <div className="space-y-2 pt-1 text-xs text-slate-700">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">
                    대표 도구:
                  </span>
                  <span className={`inline-block font-semibold px-2 py-0.5 rounded border ${equipStyle.badgeBg} ${equipStyle.badgeText} ${equipStyle.badgeBorder}`}>
                    {activity.equipmentName || equipStyle.label}
                  </span>
                </div>

                {activity.materials && activity.materials.length > 0 && (
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      상세 준비물:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activity.materials.map((m, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-slate-600"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* 2. 동영상 */}
          <section className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {hasVideoUrl ? (
                  <button
                    type="button"
                    onClick={() => setShowVideoPlayer(!showVideoPlayer)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>활동 동영상 보기</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2 rounded-xl bg-slate-200 text-slate-400 font-medium text-xs sm:text-sm flex items-center gap-2 cursor-not-allowed"
                    >
                      <Video className="w-4 h-4" />
                      <span>활동 동영상 준비 중</span>
                    </button>
                    <span className="text-[11px] text-slate-400">
                      (원본 PDF QR코드 또는 관리자 영상 등록 대기)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasVideoUrl && (
                  <a
                    href={activity.videoUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>새 창에서 영상 열기</span>
                  </a>
                )}

                {onOpenVideoManager && (
                  <button
                    type="button"
                    onClick={onOpenVideoManager}
                    className="text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 cursor-pointer ml-1"
                  >
                    영상 URL 등록/수정
                  </button>
                )}
              </div>
            </div>

            {hasVideoUrl && showVideoPlayer && (
              <div className="pt-2">
                {embedInfo.isEmbeddable && embedInfo.embedUrl ? (
                  <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-md max-w-2xl mx-auto">
                    <iframe
                      src={embedInfo.embedUrl}
                      title={activity.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-2">
                    <p className="text-xs text-slate-600">
                      영상 제공 사이트의 보안 정책으로 웹페이지 내부 임베드가 제한되어 있습니다.
                    </p>
                    <a
                      href={activity.videoUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>외부 사이트에서 동영상 시청하기</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 3. 원본 PDF */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPdfViewer(!showPdfViewer)}
                  className="px-4 py-2.5 rounded-xl bg-[#75C9F5] hover:bg-[#58BCEF] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>
                    원본 활동 자료 보기 (PDF {activity.pdf_page}쪽)
                  </span>
                </button>

                <span className="text-xs text-slate-500 hidden sm:inline">
                  {showPdfViewer
                    ? '현재 활동 쪽이 펼쳐져 있습니다.'
                    : '버튼을 눌러 원본 교재를 확인하세요.'}
                </span>
              </div>

              {onOpenPdfManager && (
                <button
                  type="button"
                  onClick={onOpenPdfManager}
                  className="text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 cursor-pointer"
                >
                  PDF 파일 관리 / 교체
                </button>
              )}
            </div>

            {showPdfViewer && (
              <div className="mt-2">
                <PdfViewer
                  initialPage={activity.pdf_page}
                  activityTitle={`${activity.step}단계 ${activity.stepNumber}번 - ${activity.title}`}
                  onUploadPdf={onOpenPdfManager}
                />
              </div>
            )}
          </section>

          {/* 4. 로그인 없이 사용하는 수업 메모 */}
          <section className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>수업 메모</span>
              </h3>

              <span className="text-[11px] text-slate-400">
                이 브라우저에 자동 저장됩니다.
              </span>
            </div>

            <div className="space-y-2">
              <textarea
                rows={3}
                value={localNote}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="오늘 아이들과 수업한 내용, 난이도 조절 또는 다음 수업 시 유의점을 기록해 보세요."
                className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#75C9F5] resize-y"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-emerald-600">
                  {isSavedNotice && '메모가 저장되었습니다.'}
                </span>

                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  메모 저장
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* 하단 버튼 */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-[#F8FAFC]/50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onNavigatePrev}
              disabled={!hasPrev}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>이전 활동</span>
            </button>

            <button
              onClick={onNavigateNext}
              disabled={!hasNext}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer inline-flex items-center gap-1"
            >
              <span>다음 활동</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleComplete(activity.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isCompleted ? '활동 완료됨' : '활동 완료 체크'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
