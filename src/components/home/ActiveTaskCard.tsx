import React from 'react';
import { Play, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Task, CATEGORY_META } from '../../types';
import { sound } from '../../lib/sound';

interface ActiveTaskCardProps {
  task: Task | null;
  delayedMinutes?: number;
  onStartFocus: (task: Task) => void;
  onOpenDelayIntervention: () => void;
}

export const ActiveTaskCard: React.FC<ActiveTaskCardProps> = ({
  task,
  delayedMinutes = 0,
  onStartFocus,
  onOpenDelayIntervention,
}) => {
  if (!task) {
    return (
      <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-dashed border-[#DDD9CE] text-center">
        <p className="text-xs font-medium text-[#858B7E]">현재 예정된 긴급 작업이 없습니다.</p>
        <p className="text-[11px] text-[#A6ABA0] mt-0.5">새 일정을 등록하거나 자동 배치를 실행해 보세요!</p>
      </div>
    );
  }

  const cat = CATEGORY_META[task.category] || CATEGORY_META.work;
  const isDelayed = delayedMinutes > 0;

  return (
    <div
      className={`p-4 rounded-2xl border shadow-lifted transition-all ${
        isDelayed
          ? 'bg-[#FFF9F7] border-[#F8C8B9] ring-1 ring-[#F0AA95]'
          : 'bg-white border-[#E3DFD4]'
      }`}
    >
      {/* Top Tag Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: cat.bg, color: cat.color }}
          >
            {cat.label}
          </span>
          {task.isFixed && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5E5E5] text-[#555]">
              고정 일정
            </span>
          )}
          {isDelayed && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDF0EB] text-[#B35D43] flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{delayedMinutes}분 지연</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 text-xs text-[#686E63] font-medium">
          <Clock className="w-3.5 h-3.5 text-[#778C59]" />
          <span>{task.startTime || '시간 미지정'}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-black text-[#292D27] leading-tight mb-1">
        {task.title}
      </h3>

      {task.memo && (
        <p className="text-xs text-[#686E63] line-clamp-1 mb-3">{task.memo}</p>
      )}

      {/* Subtasks Progress if any */}
      {task.subtasks.length > 0 && (
        <div className="mb-3 text-[11px] text-[#686E63]">
          하위 작업 {task.subtasks.filter((s) => s.completed).length} / {task.subtasks.length} 완료
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-1">
        {isDelayed && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenDelayIntervention();
            }}
            className="min-h-[44px] px-3 rounded-xl bg-[#FDF0EB] border border-[#F8C8B9] text-[#B35D43] text-xs font-bold active:scale-95 transition-all"
          >
            미루기 해결
          </button>
        )}

        <button
          onClick={() => {
            sound.playSuccess();
            onStartFocus(task);
          }}
          className="flex-1 min-h-[44px] rounded-xl bg-[#778C59] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-soft active:scale-95 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>지금 바로 시작하기</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
