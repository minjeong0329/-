import React, { useState } from 'react';
import { Task, DelayReason, DelayAction, PressureLevel } from '../../types';
import { REASON_SOLUTIONS, ReasonSolution } from '../../lib/delayEngine';
import { MirumiCharacter } from '../character/MirumiCharacter';
import { Modal } from '../common/Modal';
import { sound } from '../../lib/sound';
import { Clock, Play, RefreshCw, Moon, ArrowRight } from 'lucide-react';

interface DelayInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  delayedMinutes: number;
  pressureLevel: PressureLevel;
  characterName: string;
  onAction: (action: DelayAction, reason?: DelayReason) => void;
  onOpenAiCoach?: () => void;
}

export const DelayInterventionModal: React.FC<DelayInterventionModalProps> = ({
  isOpen,
  onClose,
  task,
  delayedMinutes,
  pressureLevel,
  characterName,
  onAction,
  onOpenAiCoach,
}) => {
  const [selectedReason, setSelectedReason] = useState<DelayReason | null>(null);

  if (!isOpen || !task) return null;

  const reasons: { id: DelayReason; label: string; icon: string }[] = [
    { id: 'reluctance', label: '하기 싫어요.', icon: '😮‍💨' },
    { id: 'difficulty', label: '너무 어려워요.', icon: '🧗' },
    { id: 'other_work', label: '다른 일을 하고 있어요.', icon: '🏃' },
    { id: 'need_more_time', label: '시간이 더 필요해요.', icon: '⏳' },
    { id: 'unwell', label: '몸이 좋지 않아요.', icon: '🤒' },
  ];

  const currentSolution: ReasonSolution | null = selectedReason
    ? REASON_SOLUTIONS[selectedReason]
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${characterName}의 미루기 감지 개입`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Character & Speech card */}
        <div className="flex items-center space-x-3 bg-white p-3.5 rounded-2xl border border-[#E3DFD4]">
          <MirumiCharacter
            expression={delayedMinutes >= 30 ? 'repeated_delay' : 'delay_warning'}
            size={70}
            className="shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FDF0EB] text-[#B35D43]">
                {delayedMinutes}분 지연 감지
              </span>
            </div>
            <p className="text-xs font-semibold text-[#292D27] leading-snug">
              {pressureLevel === 'spicy'
                ? `[${task.title}]이(가) ${delayedMinutes}분째 멈춰있어요! 스마트폰 잠시 내려두고 이유를 골라보세요.`
                : `[${task.title}] 시작이 망설여지시나요? 이유를 선택하시면 최적의 행동을 제안해 드릴게요.`}
            </p>
          </div>
        </div>

        {/* Reasons Picker */}
        <div>
          <h4 className="text-xs font-bold text-[#292D27] mb-2">
            솔직한 이유를 골라주세요
          </h4>
          <div className="grid grid-cols-1 gap-1.5">
            {reasons.map((r) => {
              const isSelected = selectedReason === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedReason(r.id);
                  }}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#EDF4E4] border-[#778C59] text-[#586A41] ring-1 ring-[#778C59]'
                      : 'bg-white border-[#E3DFD4] text-[#292D27] hover:bg-[#F8F7F2]'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </span>
                  {isSelected && <span className="text-[10px] text-[#778C59] font-bold">선택됨</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Solution Card if reason selected */}
        {currentSolution && (
          <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#D5E5B5] space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center space-x-1 text-xs font-bold text-[#586A41]">
              <span>💡</span>
              <span>{currentSolution.title}</span>
            </div>
            <p className="text-xs text-[#686E63] leading-relaxed">
              {currentSolution.description}
            </p>
            <button
              onClick={() => {
                sound.playSuccess();
                onAction(currentSolution.actionType, selectedReason!);
                onClose();
              }}
              className="w-full min-h-[44px] rounded-xl bg-[#778C59] text-white text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-95 shadow-soft"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{currentSolution.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Snooze Options */}
        <div className="pt-1 border-t border-[#E8E5D8]">
          <span className="text-[11px] font-semibold text-[#858B7E] block mb-2">
            다른 방식으로 미루기 / 조정
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '5분 뒤', action: 'snooze_5' as DelayAction },
              { label: '10분 뒤', action: 'snooze_10' as DelayAction },
              { label: '30분 뒤', action: 'snooze_30' as DelayAction },
            ].map((s) => (
              <button
                key={s.action}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onAction(s.action, selectedReason || 'unspecified');
                  onClose();
                }}
                className="min-h-[40px] px-2 py-1.5 rounded-xl bg-white border border-[#E3DFD4] text-xs font-semibold text-[#686E63] active:scale-95 text-center"
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onAction('reschedule', selectedReason || 'unspecified');
              onClose();
            }}
            className="w-full mt-2 min-h-[40px] rounded-xl bg-[#F4F2E9] border border-[#E3DFD4] text-xs font-bold text-[#686E63] flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>오늘 남은 일정 자동 재배치</span>
          </button>

          {onOpenAiCoach && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenAiCoach();
                onClose();
              }}
              className="w-full mt-2 min-h-[40px] rounded-xl bg-[#EDF4E4] border border-[#B8CE90] text-xs font-bold text-[#586A41] flex items-center justify-center space-x-1.5 active:scale-95 shadow-soft"
            >
              <span>✨</span>
              <span>{characterName} AI에게 1:1 극복 코칭 받기</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
