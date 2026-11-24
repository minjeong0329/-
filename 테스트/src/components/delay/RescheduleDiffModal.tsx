import React from 'react';
import { RescheduleDiffItem } from '../../lib/scheduler';
import { Modal } from '../common/Modal';
import { sound } from '../../lib/sound';
import { ArrowRight, Clock, Check, AlertTriangle } from 'lucide-react';

interface RescheduleDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  diffs: RescheduleDiffItem[];
  onConfirm: () => void;
}

export const RescheduleDiffModal: React.FC<RescheduleDiffModalProps> = ({
  isOpen,
  onClose,
  diffs,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const overflowCount = diffs.filter((d) => d.isOverflow).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="일정 자동 재배치 비교"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Comparison Notice */}
        <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E3DFD4] text-xs text-[#686E63] leading-relaxed">
          지연된 작업과 남은 일정을 현재 시각을 기준으로 재조정했습니다. 완료된 작업과 고정 일정은 유지됩니다.
        </div>

        {/* Diff Comparison List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {diffs.map((diff) => (
            <div
              key={diff.taskId}
              className={`p-3 rounded-xl border text-xs ${
                diff.isOverflow
                  ? 'bg-[#FFF9F7] border-[#F8C8B9]'
                  : 'bg-white border-[#E3DFD4]'
              }`}
            >
              <div className="font-bold text-[#292D27] mb-1.5">{diff.title}</div>

              {diff.isOverflow ? (
                <div className="flex items-center space-x-1.5 text-[#B35D43] font-semibold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>취침 시간 초과로 오늘 배치 불가 (내일로 권장)</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="text-[#858B7E] line-through flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {diff.oldStartTime || '미지정'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#778C59]" />
                  <span className="font-bold text-[#586A41] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#778C59]" />
                    {diff.newStartTime} ~ {diff.newEndTime}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Overflow alert */}
        {overflowCount > 0 && (
          <p className="text-[11px] text-[#B35D43] bg-[#FDF0EB] p-2.5 rounded-lg border border-[#F8C8B9]">
            ⚠️ {overflowCount}개 작업이 취침 시간 이후로 밀려 오늘 시간표에서 제외되었습니다.
          </p>
        )}

        {/* Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-4 rounded-xl bg-[#F4F2E9] border border-[#E3DFD4] text-xs font-bold text-[#686E63]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playSuccess();
              onConfirm();
              onClose();
            }}
            className="flex-1 min-h-[48px] rounded-xl bg-[#778C59] text-white text-xs font-bold shadow-soft flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>재배치 일정 승인 및 적용</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
