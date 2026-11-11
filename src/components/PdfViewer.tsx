import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  ExternalLink,
  FileText,
  AlertCircle,
  RefreshCw,
  Upload,
  BookOpen,
  Columns,
  Square,
  RotateCcw
} from 'lucide-react';
import { storageService } from '../services/storage';

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export type PageViewMode = 'spread' | 'left' | 'right';

interface PdfViewerProps {
  initialPage: number;
  activityTitle?: string;
  onClose?: () => void;
  pdfUrl?: string;
  onUploadPdf?: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  initialPage = 1,
  activityTitle,
  pdfUrl,
  onUploadPdf
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [numPages, setNumPages] = useState<number>(105);
  // View mode: 'spread' (두 쪽 펼쳐보기), 'left' (왼쪽 1페이지), 'right' (오른쪽 2페이지)
  const [pageViewMode, setPageViewMode] = useState<PageViewMode>('spread');
  // Zoom mode: 'fit-width' | 'fit-page' | 'custom'
  const [zoomMode, setZoomMode] = useState<'fit-width' | 'fit-page' | 'custom'>('fit-width');
  const [customScaleMultiplier, setCustomScaleMultiplier] = useState<number>(1.0); // 1.0 = 100% of fit-width
  const [loading, setLoading] = useState<boolean>(true);
  const [rendering, setRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string>(pdfUrl || '/hahaha_physical_play.pdf');
  const [isCustomPdf, setIsCustomPdf] = useState<boolean>(false);

  // Dimensions
  const [unscaledPageSize, setUnscaledPageSize] = useState<{ width: number; height: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // Sync initialPage when changed
  useEffect(() => {
    if (initialPage && initialPage > 0) {
      setCurrentPage(initialPage);
      // Reset scroll position on new activity / page
      if (containerRef.current) {
        containerRef.current.scrollLeft = 0;
        containerRef.current.scrollTop = 0;
      }
    }
  }, [initialPage]);

  // Check if user uploaded a custom PDF in IndexedDB
  useEffect(() => {
    let active = true;
    const checkCustomPdf = async () => {
      try {
        if (pdfUrl) {
          setResolvedPdfUrl(pdfUrl);
          return;
        }
        const blob = await storageService.getPdfBlob();
        if (blob && active) {
          const objectUrl = URL.createObjectURL(blob);
          setResolvedPdfUrl(objectUrl);
          setIsCustomPdf(true);
        } else if (active) {
          setResolvedPdfUrl('/hahaha_physical_play.pdf');
          setIsCustomPdf(false);
        }
      } catch {
        if (active) {
          setResolvedPdfUrl('/hahaha_physical_play.pdf');
        }
      }
    };
    checkCustomPdf();
    return () => {
      active = false;
    };
  }, [pdfUrl]);

  // Load PDF document using window.pdfjsLib
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadDocument = async () => {
      try {
        if (typeof window === 'undefined') return;

        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        if (!window.pdfjsLib) {
          let attempts = 0;
          while (!window.pdfjsLib && attempts < 20) {
            await new Promise((r) => setTimeout(r, 150));
            attempts++;
          }
        }

        if (!window.pdfjsLib) {
          throw new Error('PDF 뷰어 라이브러리를 불러오지 못했습니다. 대체 뷰어로 전환합니다.');
        }

        const loadingTask = window.pdfjsLib.getDocument(resolvedPdfUrl);
        const doc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);

        // Fetch initial page dimension
        try {
          const firstPage = await doc.getPage(currentPage || 1);
          const vp = firstPage.getViewport({ scale: 1 });
          setUnscaledPageSize({ width: vp.width, height: vp.height });
        } catch {
          // ignore
        }

        setLoading(false);
      } catch (err: any) {
        if (isCancelled) return;
        console.error('PDF load error:', err);
        setError(err.message || 'PDF 파일을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [resolvedPdfUrl]);

  /**
   * Calculate exact scale to guarantee:
   * 1. In 'fit-width':
   *    - In 'spread' mode: the full PDF width matches (containerWidth - 32px safety margin).
   *      Left and right edges are ALWAYS strictly inside the viewport, zero clipping!
   *    - In 'left' / 'right' mode: that single half page matches (containerWidth - 32px),
   *      making that page huge, clear, and perfectly centered with zero clipping!
   * 2. In 'fit-page':
   *    - The entire page fits within both width and height, viewable at a single glance.
   * 3. In 'custom':
   *    - Based on fit-width multiplied by customScaleMultiplier.
   */
  const calculateEffectiveScale = useCallback(
    (
      unscaledWidth: number,
      unscaledHeight: number,
      mode: PageViewMode,
      zMode: 'fit-width' | 'fit-page' | 'custom',
      multiplier: number
    ) => {
      const container = containerRef.current;
      // Account for 16px padding on each side (total 32px) and scrollbar (16px) -> 48px margin
      const availableWidth = Math.max(300, (container?.clientWidth || 800) - 48);
      const availableHeight = Math.max(400, (container?.clientHeight || 650) - 48);

      const viewPortWidth = mode === 'spread' ? unscaledWidth : unscaledWidth / 2;

      let baseScale = availableWidth / viewPortWidth;

      if (zMode === 'fit-page') {
        const scaleByHeight = availableHeight / unscaledHeight;
        baseScale = Math.min(baseScale, scaleByHeight);
      } else if (zMode === 'custom') {
        baseScale = baseScale * multiplier;
      }

      // Bound scale safely to prevent zero or extreme memory spikes
      return Math.max(0.4, Math.min(4.0, +baseScale.toFixed(3)));
    },
    []
  );

  // Render current page onto Canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDocRef.current || !canvasRef.current) return;

      try {
        setRendering(true);
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdfDocRef.current.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const unscaledViewport = page.getViewport({ scale: 1 });
        setUnscaledPageSize({ width: unscaledViewport.width, height: unscaledViewport.height });

        // Calculate scale
        const effectiveScale = calculateEffectiveScale(
          unscaledViewport.width,
          unscaledViewport.height,
          pageViewMode,
          zoomMode,
          customScaleMultiplier
        );

        // Render at device pixel ratio for crystal clear text (max 2 for performance)
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const renderViewport = page.getViewport({ scale: effectiveScale * dpr });

        // Offscreen canvas renders the full PDF page at native aspect ratio
        const offscreen = document.createElement('canvas');
        offscreen.width = Math.floor(renderViewport.width);
        offscreen.height = Math.floor(renderViewport.height);
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) return;

        const renderContext = {
          canvasContext: offCtx,
          viewport: renderViewport
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        // View Mode slicing:
        // 'spread': full width (0 -> offscreen.width)
        // 'left': left half (0 -> width/2)
        // 'right': right half (width/2 -> width)
        let sourceX = 0;
        let sourceY = 0;
        let sourceW = offscreen.width;
        let sourceH = offscreen.height;

        if (pageViewMode === 'left') {
          sourceX = 0;
          sourceW = Math.floor(offscreen.width / 2);
        } else if (pageViewMode === 'right') {
          sourceX = Math.floor(offscreen.width / 2);
          sourceW = Math.ceil(offscreen.width / 2);
        }

        // Exact display dimensions preserving original aspect ratio
        const displayW = Math.floor(sourceW / dpr);
        const displayH = Math.floor(sourceH / dpr);

        canvas.width = sourceW;
        canvas.height = sourceH;
        canvas.style.width = `${displayW}px`;
        canvas.style.height = `${displayH}px`;
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        canvas.style.aspectRatio = `${sourceW} / ${sourceH}`;
        canvas.style.objectFit = 'contain';

        // Clear and draw with exact coordinate bounds
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
          offscreen,
          sourceX,
          sourceY,
          sourceW,
          sourceH,
          0,
          0,
          sourceW,
          sourceH
        );

        setRendering(false);

        // Always reset horizontal scroll to 0 (or center) so user sees the full left-to-right content
        if (containerRef.current) {
          if (zoomMode === 'fit-width' || zoomMode === 'fit-page') {
            containerRef.current.scrollLeft = 0;
          }
        }
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
        setRendering(false);
      }
    },
    [pageViewMode, zoomMode, customScaleMultiplier, calculateEffectiveScale]
  );

  useEffect(() => {
    if (!loading && pdfDocRef.current) {
      renderPage(currentPage);
    }
  }, [currentPage, pageViewMode, zoomMode, customScaleMultiplier, loading, renderPage]);

  // Window resize handler to maintain fit-width/fit-page
  useEffect(() => {
    let timeout: any;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!loading && pdfDocRef.current && (zoomMode === 'fit-width' || zoomMode === 'fit-page')) {
          renderPage(currentPage);
        }
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [loading, zoomMode, currentPage, renderPage]);

  // Page Controls
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      if (containerRef.current) {
        containerRef.current.scrollLeft = 0;
        containerRef.current.scrollTop = 0;
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
      if (containerRef.current) {
        containerRef.current.scrollLeft = 0;
        containerRef.current.scrollTop = 0;
      }
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= numPages) {
      setCurrentPage(val);
      if (containerRef.current) {
        containerRef.current.scrollLeft = 0;
        containerRef.current.scrollTop = 0;
      }
    }
  };

  // Zoom Controls
  const handleZoomIn = () => {
    setZoomMode('custom');
    setCustomScaleMultiplier((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomMode('custom');
    setCustomScaleMultiplier((prev) => Math.max(0.6, +(prev - 0.15).toFixed(2)));
  };

  const handleFitWidth = () => {
    setZoomMode('fit-width');
    setCustomScaleMultiplier(1.0);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  };

  const handleFitPage = () => {
    setZoomMode('fit-page');
    setCustomScaleMultiplier(1.0);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  };

  const handleSelectViewMode = (mode: PageViewMode) => {
    setPageViewMode(mode);
    setZoomMode('fit-width');
    setCustomScaleMultiplier(1.0);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  };

  const handleOpenNewTab = () => {
    window.open(`${resolvedPdfUrl}#page=${currentPage}`, '_blank');
  };

  return (
    <div className="flex flex-col bg-slate-100 rounded-xl border border-slate-200 overflow-hidden text-slate-800 shadow-2xs">
      {/* 1. PDF Viewer Toolbar (Sticky on top with all requested controls) */}
      <div className="bg-white px-3 sm:px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs select-none sticky top-0 z-20 shadow-2xs">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="이전 쪽"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 font-medium px-1">
            <span className="text-slate-500">쪽:</span>
            <input
              type="number"
              min={1}
              max={numPages}
              value={currentPage}
              onChange={handlePageInputChange}
              className="w-12 text-center py-1 rounded border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-[#75C9F5]"
            />
            <span className="text-slate-400">/ {numPages}쪽</span>
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= numPages || loading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="다음 쪽"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Two-page spread vs Single-page (Left / Right) buttons */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleSelectViewMode('spread')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              pageViewMode === 'spread'
                ? 'bg-white text-[#0284C7] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="두 페이지 모두 펼쳐서 전체 보기 (기본값)"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>두 쪽 펼침</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectViewMode('left')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              pageViewMode === 'left'
                ? 'bg-white text-[#0284C7] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="왼쪽 페이지(예: 선생님과 몸 놀이하기)를 화면 가득 크게 보기"
          >
            <Square className="w-3.5 h-3.5" />
            <span>왼쪽 페이지</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectViewMode('right')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              pageViewMode === 'right'
                ? 'bg-white text-[#0284C7] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="오른쪽 페이지(예: 공 탐색하기)를 화면 가득 크게 보기"
          >
            <Square className="w-3.5 h-3.5" />
            <span>오른쪽 페이지</span>
          </button>
        </div>

        {/* Right: Zoom & Fit Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
            title="축소 (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
            title="확대 (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleFitWidth}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
              zoomMode === 'fit-width'
                ? 'bg-[#E8F6FE] text-[#0284C7] border-[#75C9F5] font-semibold'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="너비 맞춤 (좌우 잘림 없이 가로 전체를 뷰어 폭에 맞춤)"
          >
            너비 맞춤
          </button>

          <button
            type="button"
            onClick={handleFitPage}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
              zoomMode === 'fit-page'
                ? 'bg-[#E8F6FE] text-[#0284C7] border-[#75C9F5] font-semibold'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="화면 맞춤 (스크롤 없이 원래 크기로 전체 조망)"
          >
            화면 맞춤
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer ml-1"
            title="새 창에서 원본 열기"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. PDF Viewport Container: Centered flexbox with guaranteed full visibility */}
      <div
        ref={containerRef}
        tabIndex={0}
        className="relative min-h-[580px] max-h-[78vh] overflow-x-auto overflow-y-auto bg-slate-200/80 p-3 sm:p-5 focus:outline-none scroll-smooth select-none cursor-default"
      >
        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 z-20 gap-3">
            <RefreshCw className="w-7 h-7 text-[#75C9F5] animate-spin" />
            <p className="text-xs text-slate-600 font-semibold">
              체육놀이 원본 PDF 자료를 선명하게 렌더링 중입니다...
            </p>
          </div>
        )}

        {/* Error state with fallback iframe */}
        {error ? (
          <div className="w-full flex flex-col items-center justify-center p-6 bg-white rounded-xl text-center shadow-xs">
            <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              내장 PDF 렌더링에 일시적인 지연이 발생했습니다
            </h4>
            <p className="text-xs text-slate-500 mb-4 max-w-md">
              브라우저 내장 뷰어로 직접 열거나 새 창에서 원본 페이지({currentPage}쪽)를 바로 확인하실 수 있습니다.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <a
                href={`${resolvedPdfUrl}#page=${currentPage}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-[#75C9F5] text-white text-xs font-semibold hover:bg-[#58BCEF] transition-colors inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>새 창에서 {currentPage}쪽 열기</span>
              </a>
              <a
                href={resolvedPdfUrl}
                download="hahaha_physical_play.pdf"
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF 파일 다운로드</span>
              </a>
            </div>

            <div className="w-full h-[580px] border border-slate-200 rounded-lg overflow-hidden mt-2">
              <iframe
                src={`${resolvedPdfUrl}#page=${currentPage}`}
                className="w-full h-full border-0"
                title="체육놀이 원본 자료"
              />
            </div>
          </div>
        ) : (
          /* Canvas centering wrapper: min-w-full ensures the item centers in the container and never clips left side */
          <div className="min-w-full min-h-full flex items-start justify-center">
            <div className="relative shadow-xl rounded-md bg-white border border-slate-300 transition-all duration-150 flex items-center justify-center overflow-hidden my-auto">
              {rendering && (
                <div className="absolute top-3 right-3 bg-slate-900/70 text-white text-[11px] px-2.5 py-1 rounded backdrop-blur-xs flex items-center gap-1.5 z-10 shadow-sm">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>페이지 전환 중...</span>
                </div>
              )}
              {/* Canvas strictly adheres to calculated dimensions without horizontal offset or clipping */}
              <canvas
                ref={canvasRef}
                className="block rounded-md shadow-xs"
                style={{
                  display: 'block',
                  margin: '0 auto',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Guide Bar with Reading Tip */}
      <div className="bg-white px-4 py-2.5 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-700">
            {pageViewMode === 'spread'
              ? '두 쪽 펼쳐보기 (가로 전체 중앙 정렬, 좌우 끝 완전 표시)'
              : pageViewMode === 'left'
              ? '왼쪽 페이지 집중 확대 (중앙 정렬)'
              : '오른쪽 페이지 집중 확대 (중앙 정렬)'}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            {zoomMode === 'fit-width'
              ? '너비 맞춤 활성'
              : zoomMode === 'fit-page'
              ? '화면 맞춤 활성'
              : `확대 배율 ${(customScaleMultiplier * 100).toFixed(0)}%`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onUploadPdf && (
            <button
              type="button"
              onClick={onUploadPdf}
              className="text-slate-500 hover:text-slate-800 underline decoration-slate-300 cursor-pointer"
            >
              교재 파일 관리
            </button>
          )}
          <a
            href={resolvedPdfUrl}
            download="hahaha_physical_play.pdf"
            className="text-[#0284C7] hover:underline inline-flex items-center gap-1 font-semibold"
          >
            <Download className="w-3 h-3" />
            <span>PDF 원본 다운로드</span>
          </a>
        </div>
      </div>
    </div>
  );
};
