import React, { useState } from 'react';
import { ActivityItem } from '../types';
import { storageService } from '../services/storage';
import { getAllInitialActivities } from '../data/defaultActivities';
import { getEquipmentRule } from '../data/equipmentRules';
import { X, Upload, Download, RotateCcw, Check, FileText, Copy } from 'lucide-react';

interface JsonDataManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
  onActivitiesUpdated: (newActivities: ActivityItem[]) => void;
}

export const JsonDataManagerModal: React.FC<JsonDataManagerModalProps> = ({
  isOpen,
  onClose,
  activities,
  onActivitiesUpdated
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        applyParsedJson(text);
      } catch (err: any) {
        setErrorMessage(`JSON 파일 파싱 실패: ${err.message}`);
        setSuccessMessage(null);
      }
    };
    reader.readAsText(file);
  };

  const applyParsedJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON의 최상위는 배열([ ... ])이어야 합니다.');
      }
      if (parsed.length === 0) {
        throw new Error('배열에 활동 데이터가 없습니다.');
      }

      const normalized: ActivityItem[] = parsed.map((item: any, idx: number) => {
        const id = Number(item.id) || (idx + 1);
        const levelNum = Number(item.level) || Number(item.step) || (id <= 30 ? 1 : id <= 60 ? 2 : 3);
        const step = (levelNum === 1 || levelNum === 2 || levelNum === 3)
          ? (levelNum as 1 | 2 | 3)
          : (id <= 30 ? 1 : id <= 60 ? 2 : 3);

        const seqNum = Number(item.sequence) || Number(item.stepNumber) || ((id - 1) % 30 + 1);
        const stepNumber = seqNum > 30 ? ((seqNum - 1) % 30 + 1) : seqNum;

        const isBody = item.body_activity === true ||
          item.body_activity === 'true' ||
          item.body_activity === 1 ||
          item.body_activity === 'Y' ||
          item.type === 'body_activity' ||
          item.type === 'body' ||
          item.activity_type === 'body_activity';

        const isEquipment = item.equipment_activity === true ||
          item.equipment_activity === 'true' ||
          item.equipment_activity === 1 ||
          item.equipment_activity === 'Y' ||
          item.type === 'equipment_activity' ||
          item.type === 'tool' ||
          item.activity_type === 'equipment_activity';

        const finalType = isEquipment && !isBody ? 'tool' : 'body';

        let objectives: string[] = [];
        if (Array.isArray(item.objectives) && item.objectives.length > 0) {
          objectives = item.objectives.map((o: any) => String(o).trim()).filter(Boolean);
        } else if (typeof item.objectives === 'string' && item.objectives.trim()) {
          objectives = [item.objectives.trim()];
        } else if (Array.isArray(item.objective) && item.objective.length > 0) {
          objectives = item.objective.map((o: any) => String(o).trim()).filter(Boolean);
        } else if (typeof item.objective === 'string' && item.objective.trim()) {
          objectives = [item.objective.trim()];
        } else if (Array.isArray(item.goals) && item.goals.length > 0) {
          objectives = item.goals.map((o: any) => String(o).trim()).filter(Boolean);
        } else if (item.goal && typeof item.goal === 'string' && item.goal.trim()) {
          objectives = [item.goal.trim()];
        }

        if (objectives.length === 0) {
          const defaultItem = getAllInitialActivities().find(a => a.id === id);
          if (defaultItem && defaultItem.objectives) {
            objectives = defaultItem.objectives;
          }
        }

        // 1단계(1~30번): PDF 10~39쪽, 2단계(1~30번): PDF 43~72쪽, 3단계(1~30번): PDF 76~105쪽
        const defaultPdfPage = step === 1 ? 9 + stepNumber : step === 2 ? 42 + stepNumber : 75 + stepNumber;
        const pdfPage = Number(item.pdf_page) || defaultPdfPage;

        const rule = getEquipmentRule(id);
        const category = item.equipmentCategory || rule.category;
        const equipmentName = item.equipmentName || rule.name;
        const secondaryEquipments = item.secondaryEquipments || rule.secondary;
        const materials = Array.isArray(item.materials) && item.materials.length > 0 ? item.materials : rule.materials;

        return {
          id,
          level: levelNum,
          sequence: seqNum,
          step,
          stepNumber,
          pdf_page: pdfPage,
          title: item.title || item.activity_name || `${step}단계 ${stepNumber}번 활동`,
          type: category === 'barebody' ? 'body' : 'tool',
          equipmentCategory: category,
          equipmentName,
          secondaryEquipments,
          materials,
          body_activity: category === 'barebody',
          equipment_activity: category !== 'barebody',
          targetAge: item.targetAge || `만 ${step + 2}세`,
          isDataConnected: true,
          objectives,
          goal: objectives[0] || item.goal || '',
          intro: item.intro && typeof item.intro === 'string' && item.intro.trim() ? item.intro.trim() : undefined,
          method: Array.isArray(item.method) && item.method.length > 0 ? item.method : undefined,
          teacherInteraction: Array.isArray(item.teacherInteraction) && item.teacherInteraction.length > 0 ? item.teacherInteraction : undefined,
          evaluation: Array.isArray(item.evaluation) && item.evaluation.length > 0 ? item.evaluation : undefined,
          safety: Array.isArray(item.safety) && item.safety.length > 0 ? item.safety : undefined,
          thinkingPlus: item.thinkingPlus && typeof item.thinkingPlus === 'string' && item.thinkingPlus.trim() ? item.thinkingPlus.trim() : undefined,
          exerciseKnowledge: item.exerciseKnowledge && typeof item.exerciseKnowledge === 'string' && item.exerciseKnowledge.trim() ? item.exerciseKnowledge.trim() : undefined,
          videoUrl: item.videoUrl || null,
          qrCodeUrl: item.qrCodeUrl || null,
          isVideoReady: Boolean(item.videoUrl && item.videoUrl.trim())
        };
      });

      storageService.saveActivities(normalized);
      onActivitiesUpdated(normalized);
      setSuccessMessage(`총 ${normalized.length}개의 활동 데이터를 적용했습니다.`);
      setErrorMessage(null);
      setJsonInput('');
    } catch (err: any) {
      setErrorMessage(err.message || '유효하지 않은 JSON 형식입니다.');
      setSuccessMessage(null);
    }
  };

  const handleApplyPaste = () => {
    if (!jsonInput.trim()) {
      setErrorMessage('적용할 JSON 텍스트를 입력해주세요.');
      return;
    }
    applyParsedJson(jsonInput);
  };

  const handleDownloadCurrent = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'hahaha_activities_90.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReset = () => {
    if (window.confirm('기본 90개 체육놀이 데이터 목록으로 초기화하시겠습니까?')) {
      const reset = storageService.resetActivities();
      onActivitiesUpdated(reset);
      setSuccessMessage('기본 활동 목록으로 초기화되었습니다.');
      setErrorMessage(null);
    }
  };

  const sampleSchema = `[
  {
    "id": 1,
    "title": "동물 친구들의 신나는 걸음걸이",
    "level": 1,
    "sequence": 1,
    "body_activity": true,
    "equipment_activity": false,
    "objectives": [
      "동물의 움직임을 관찰하고 신체 동작으로 자유롭게 모방한다.",
      "신체 각 부위를 탐색하며 대근육 유연성과 기초 신체조절력을 기른다."
    ]
  }
]`;

  const copySampleSchema = () => {
    navigator.clipboard.writeText(sampleSchema);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-xl border border-slate-200/80 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">
            활동 데이터 관리
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            현재 등록된 활동 {activities.length}개
          </p>
        </div>

        {successMessage && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4 mb-4">
          {/* File upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              JSON 파일 업로드
            </label>
            <label className="border border-slate-200 hover:border-slate-300 rounded-xl p-3 text-center block cursor-pointer bg-[#F8FAFC] transition-colors">
              <span className="text-xs font-medium text-slate-700 block">
                준비한 JSON 파일 선택 (.json)
              </span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Paste Raw JSON */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                JSON 텍스트 직접 입력
              </label>
              <button
                onClick={copySampleSchema}
                className="text-[11px] text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? '복사됨' : '샘플 양식 복사'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="[ { ... } ]"
              className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#75C9F5] resize-none bg-[#F8FAFC]"
            />
            <div className="flex justify-end mt-1.5">
              <button
                onClick={handleApplyPaste}
                className="px-3.5 py-1.5 rounded-lg bg-[#75C9F5] hover:bg-[#58BCEF] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                적용하기
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCurrent}
              className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>JSON 내보내기</span>
            </button>
            <span>·</span>
            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-rose-600 inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
