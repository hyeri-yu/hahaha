import React, { useState } from 'react';
import { ActivityItem } from '../types';
import { storageService } from '../services/storage';
import {
  X,
  Video,
  Play,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Search,
  RefreshCw
} from 'lucide-react';
import { qrVideoService } from '../services/qrVideoService';

interface VideoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
  onVideoUpdated: () => void;
}

export const VideoManagerModal: React.FC<VideoManagerModalProps> = ({
  isOpen,
  onClose,
  activities,
  onVideoUpdated
}) => {
  const [search, setSearch] = useState('');
  const [filterStep, setFilterStep] = useState<number>(0); // 0: all
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [editingUrl, setEditingUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleExportVideoUrls = () => {
    try {
      const overrides = storageService.getVideoOverrides();
      const payload = {
        exportedAt: new Date().toISOString(),
        sourcePdf: '/hahaha_physical_play.pdf',
        videoUrls: overrides
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hahaha-video-urls.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: `현재 저장된 영상 주소 ${Object.keys(overrides).length}개를 JSON 파일로 내보냈습니다.` });
    } catch (error: any) {
      setStatusMessage({ type: 'error', text: '영상 주소 내보내기에 실패했습니다: ' + (error?.message || '알 수 없는 오류') });
    }
  };

  if (!isOpen) return null;

  const filteredList = activities.filter((act) => {
    if (filterStep !== 0 && act.step !== filterStep) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchNum = String(act.id).includes(q) || String(act.stepNumber).includes(q);
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchTool = act.equipmentName?.toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchTool) return false;
    }
    return true;
  });

  const handleStartEdit = (act: ActivityItem) => {
    setSelectedActivityId(act.id);
    setEditingUrl(act.videoUrl || '');
    setStatusMessage(null);
  };

  const handleSaveUrl = (activityId: number) => {
    try {
      storageService.setVideoOverride(activityId, editingUrl.trim() || null);
      setStatusMessage({ type: 'success', text: `${activityId}번 활동의 영상 URL이 저장되었습니다.` });
      setSelectedActivityId(null);
      onVideoUpdated();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: '저장 실패: ' + e.message });
    }
  };

  const handleDeleteUrl = (activityId: number) => {
    if (window.confirm('등록된 영상 URL을 삭제하시겠습니까?')) {
      storageService.setVideoOverride(activityId, null);
      setStatusMessage({ type: 'success', text: `${activityId}번 활동 영상 URL이 초기화되었습니다.` });
      setSelectedActivityId(null);
      onVideoUpdated();
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // 배포된 원본 PDF를 기준으로 QR URL을 추출합니다.
  // 브라우저 IndexedDB에 남아 있는 과거 PDF를 잘못 스캔하지 않도록 합니다.
  const handleAutoScanPdfForQrCodes = async () => {
    if (!window.pdfjsLib) {
      alert('PDF 라이브러리가 로드되지 않았습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.');
      return;
    }

    try {
      setIsScanning(true);
      setStatusMessage(null);

      const loadingTask = window.pdfjsLib.getDocument('/hahaha_physical_play.pdf');
      const doc = await loadingTask.promise;
      const newOverrides: Record<number, string> = {};
      let scannedCount = 0;

      for (const act of activities) {
        const pageNumber = Number(act.pdf_page);
        if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > doc.numPages) continue;
        scannedCount++;
        const qrUrl = await qrVideoService.scanPageForQrCode(doc, pageNumber);
        if (qrUrl && /^https?:\/\//i.test(qrUrl)) {
          newOverrides[act.id] = qrUrl.trim();
        }
      }

      const foundCount = Object.keys(newOverrides).length;
      if (foundCount > 0) {
        storageService.setMultipleVideoOverrides(newOverrides);
        const saved = storageService.getVideoOverrides();
        const verifiedCount = Object.keys(newOverrides).filter((id) => saved[Number(id)] === newOverrides[Number(id)]).length;
        if (verifiedCount !== foundCount) {
          throw new Error(`추출 ${foundCount}개 중 ${verifiedCount}개만 저장 확인되었습니다.`);
        }
        onVideoUpdated();
        setStatusMessage({
          type: 'success',
          text: `배포 PDF ${scannedCount}쪽을 확인했고, QR 영상 주소 ${verifiedCount}개를 이 브라우저에 저장했습니다. 다른 방문자에게 공개하려면 아래 JSON 내보내기 후 배포 데이터에 반영해야 합니다.`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `배포 PDF의 활동 페이지 ${scannedCount}쪽을 확인했지만 QR 영상 주소를 찾지 못했습니다. 자동 추출 결과가 0개이므로 임의의 주소는 등록하지 않았습니다.`
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'QR코드 스캔 또는 저장 중 오류: ' + (err?.message || '알 수 없는 오류') });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                활동별 동영상 및 QR코드 영상 관리자
              </h3>
              <p className="text-xs text-slate-500">
                90개 활동별 실제 동영상(유튜브, 비메오, 웹 영상) URL 등록 및 관리
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Top Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStep(0)}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                filterStep === 0 ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'
              }`}
            >
              전체 (90)
            </button>
            <button
              onClick={() => setFilterStep(1)}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                filterStep === 1 ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'
              }`}
            >
              1단계 (30)
            </button>
            <button
              onClick={() => setFilterStep(2)}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                filterStep === 2 ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'
              }`}
            >
              2단계 (30)
            </button>
            <button
              onClick={() => setFilterStep(3)}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                filterStep === 3 ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'
              }`}
            >
              3단계 (30)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto scan button */}
            <button
              onClick={handleExportVideoUrls}
              className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="현재 브라우저에 저장된 영상 URL을 JSON 파일로 내보내기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>영상 주소 내보내기</span>
            </button>
            <button
              onClick={handleAutoScanPdfForQrCodes}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              title="연결된 PDF 원본 각 페이지의 QR코드를 자동 감지하여 URL 추출"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'QR코드 추출 중...' : 'PDF QR코드 자동 추출'}</span>
            </button>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="활동 검색..."
                className="w-full pl-7 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 flex items-center gap-2 text-xs font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-3">
            {filteredList.map((act) => {
              const isEditing = selectedActivityId === act.id;
              const hasVideo = Boolean(act.videoUrl && act.videoUrl.trim());

              return (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    hasVideo ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-slate-200/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#0284C7] bg-[#E8F6FE] px-2 py-0.5 rounded shrink-0">
                        {act.step}단계 {String(act.stepNumber).padStart(2, '0')}번
                      </span>
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {act.title}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        (PDF {act.pdf_page}쪽)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                          hasVideo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {hasVideo ? '영상 연결됨' : '영상 준비 중'}
                      </span>

                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(act)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{hasVideo ? '수정' : '등록'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* URL display or Editing input */}
                  {isEditing ? (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="url"
                        value={editingUrl}
                        onChange={(e) => setEditingUrl(e.target.value)}
                        placeholder="동영상 URL 입력 (예: https://www.youtube.com/watch?v=... 또는 mp4 주소)"
                        className="flex-1 w-full text-xs p-2 rounded-lg border border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                      />
                      <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleSaveUrl(act.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>저장</span>
                        </button>
                        {hasVideo && (
                          <button
                            onClick={() => handleDeleteUrl(act.id)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs cursor-pointer"
                            title="URL 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedActivityId(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs cursor-pointer"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : hasVideo ? (
                    <div className="mt-2 pt-2 border-t border-slate-100/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-md font-mono text-indigo-700">
                        {act.videoUrl}
                      </span>
                      <a
                        href={act.videoUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0284C7] hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
                      >
                        <Play className="w-3 h-3" />
                        <span>영상 열기</span>
                      </a>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-[#F8FAFC] flex items-center justify-between text-xs text-slate-500">
          <span>확인되지 않은 URL은 임의로 생성하지 않으며 '영상 준비 중'으로 표기됩니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
