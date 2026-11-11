import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storage';
import { X, Upload, Check, AlertCircle, RefreshCw, FileText, Trash2, ExternalLink } from 'lucide-react';

interface PdfManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPdfUpdated?: () => void;
}

export const PdfManagerModal: React.FC<PdfManagerModalProps> = ({
  isOpen,
  onClose,
  onPdfUpdated
}) => {
  const [hasCustomPdf, setHasCustomPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string>('hahaha_physical_play.pdf');
  const [fileSize, setFileSize] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkPdfState();
    }
  }, [isOpen]);

  const checkPdfState = async () => {
    try {
      const blob = await storageService.getPdfBlob();
      if (blob) {
        setHasCustomPdf(true);
        setPdfFileName((blob as any).name || '기관 등록 체육놀이 원본 PDF');
        setFileSize(`${(blob.size / 1024 / 1024).toFixed(2)} MB`);
      } else {
        setHasCustomPdf(false);
        setPdfFileName('기본 내장 105쪽 원본 교재 (hahaha_physical_play.pdf)');
        setFileSize('기본 제공');
      }
    } catch {
      setHasCustomPdf(false);
    }
  };

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setStatusMsg({ type: 'error', text: 'PDF 형식의 파일(.pdf)만 등록할 수 있습니다.' });
      return;
    }

    try {
      setIsProcessing(true);
      await storageService.savePdfBlob(file);
      setStatusMsg({ type: 'success', text: `원본 PDF '${file.name}'이(가) 성공적으로 등록되었습니다.` });
      await checkPdfState();
      if (onPdfUpdated) onPdfUpdated();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'PDF 저장 중 문제가 발생했습니다: ' + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm('기본 내장 원본 PDF로 복원하시겠습니까?')) {
      await storageService.clearPdfBlob();
      setStatusMsg({ type: 'success', text: '기본 내장 체육놀이 PDF로 복원되었습니다.' });
      await checkPdfState();
      if (onPdfUpdated) onPdfUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8F6FE] text-[#0284C7] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                체육놀이 원본 PDF 관리
              </h3>
              <p className="text-xs text-slate-500">
                모든 90개 활동에서 공통으로 열리는 단일 PDF 파일 설정
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600 leading-relaxed">
          {/* Current Connected PDF Info */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/70 space-y-2">
            <span className="font-semibold text-slate-700 block text-xs">
              현재 연결된 PDF 자료
            </span>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-[#0284C7] shrink-0" />
                <div className="truncate">
                  <span className="font-medium text-slate-900 block truncate">
                    {pdfFileName}
                  </span>
                  <span className="text-[11px] text-slate-400">{fileSize}</span>
                </div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded font-medium shrink-0 ${
                hasCustomPdf ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {hasCustomPdf ? '기관 전용 등록본' : '기본 내장본'}
              </span>
            </div>
          </div>

          {/* Page Mapping Guide */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-xs space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-3.5 h-3.5" />
              활동별 PDF 쪽 번호 자동 매핑 기준
            </span>
            <p className="text-[11px] leading-relaxed text-amber-800/90 pl-5">
              · <strong>1단계 (1~30번)</strong>: PDF 10~39쪽<br />
              · <strong>2단계 (1~30번)</strong>: PDF 43~72쪽<br />
              · <strong>3단계 (1~30번)</strong>: PDF 76~105쪽
            </p>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-[#75C9F5] hover:bg-[#58BCEF] text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>새로운 원본 PDF 등록 (1회 등록으로 전 활동 적용)</span>
            </button>

            <div className="flex items-center gap-2 pt-1">
              {hasCustomPdf && (
                <button
                  onClick={handleResetToDefault}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>기본 PDF로 복원</span>
                </button>
              )}

              <a
                href="/hahaha_physical_play.pdf"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>현재 파일 확인</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-[#F8FAFC] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
