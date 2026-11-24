import React from 'react';
import { Task, UserPreferences, CATEGORY_META } from '../../types';
import { AutoScheduleResult, generateAutoSchedule } from '../../lib/scheduler';
import { Modal } from '../common/Modal';
import { sound } from '../../lib/sound';
import { Wand2, Clock, Check, AlertCircle } from 'lucide-react';

interface AutoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  preferences: UserPreferences;
  selectedDate: string;
  onApplySchedule: (updatedTasks: Task[]) => void;
}

export const AutoScheduleModal: React.FC<AutoScheduleModalProps> = ({
  isOpen,
  onClose,
  tasks,
  preferences,
  selectedDate,
  onApplySchedule,
}) => {
  if (!isOpen) return null;

  const result: AutoScheduleResult = generateAutoSchedule(tasks, preferences, selectedDate);

  const handleApply = () => {
    sound.playSuccess();
    // Merge scheduled and unassigned tasks with tasks from other dates
    const otherTasks = tasks.filter(
      (t) => (t.assignedDate || t.deadlineDate) !== selectedDate
    );
    const merged = [...otherTasks, ...result.scheduledTasks, ...result.unassignedTasks];
    onApplySchedule(merged);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="자동 일정 설계 결과"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Intro Banner */}
        <div className="bg-[#EDF4E4] p-3.5 rounded-2xl border border-[#B8CE90] flex items-start space-x-3">
          <Wand2 className="w-5 h-5 text-[#586A41] shrink-0 mt-0.5" />
          <div className="text-xs text-[#292D27] leading-relaxed">
            <span className="font-bold text-[#586A41] block mb-0.5">
              생활 리듬 맞춤형 자동 배치
            </span>
            취침 시간({preferences.sleepTime})과 고정 일정을 침범하지 않도록 중요도와 가용 시간에 맞춰 최적으로 재배치했습니다.
          </div>
        </div>

        {/* Schedule Summary Stats */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white p-2.5 rounded-xl border border-[#E3DFD4]">
            <span className="text-[10px] text-[#858B7E] font-medium block">배치된 작업</span>
            <span className="text-sm font-black text-[#586A41]">
              {result.scheduledTasks.length}개
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-[#E3DFD4]">
            <span className="text-[10px] text-[#858B7E] font-medium block">총 계획 소요 시간</span>
            <span className="text-sm font-black text-[#292D27]">
              {Math.floor(result.totalPlannedMinutes / 60)}시간 {result.totalPlannedMinutes % 60}분
            </span>
          </div>
        </div>

        {/* Timeline Preview List */}
        <div>
          <h4 className="text-xs font-bold text-[#292D27] mb-2 flex items-center justify-between">
            <span>추천 타임라인 ({selectedDate})</span>
            <span className="text-[10px] text-[#778C59] font-semibold">미리보기</span>
          </h4>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {result.scheduleBlocks.map((block) => {
              const cat = CATEGORY_META[block.category as keyof typeof CATEGORY_META];
              return (
                <div
                  key={block.id}
                  className="bg-white p-2.5 rounded-xl border border-[#E3DFD4] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat ? cat.dot : '#778C59' }}
                    />
                    <span className="font-bold text-[#292D27] truncate">{block.title}</span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 text-[#686E63] font-semibold text-[11px] ml-2">
                    <Clock className="w-3 h-3 text-[#778C59]" />
                    <span>
                      {block.startTime} ~ {block.endTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unassigned Tasks if any (Exceeded bedtime) */}
        {result.unassignedTasks.length > 0 && (
          <div className="bg-[#FFF9F7] p-3 rounded-xl border border-[#F8C8B9] space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#B35D43]">
              <AlertCircle className="w-4 h-4" />
              <span>미배정 작업 ({result.unassignedTasks.length}개)</span>
            </div>
            <p className="text-[11px] text-[#686E63] leading-tight">
              취침 시간 이전 가용 시간이 부족하여 무리하게 배치하지 않았습니다. 내일로 이월하거나 소요 시간을 조정해 주세요.
            </p>
            <div className="space-y-1 pt-1">
              {result.unassignedTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-white px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#292D27] border border-[#E8E5D8] flex items-center justify-between"
                >
                  <span>{t.title}</span>
                  <span className="text-[10px] text-[#858B7E]">{t.estimatedMinutes}분</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apply & Cancel Buttons */}
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
            onClick={handleApply}
            className="flex-1 min-h-[48px] rounded-xl bg-[#778C59] text-white text-xs font-bold shadow-soft flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>이 일정으로 적용하기</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
