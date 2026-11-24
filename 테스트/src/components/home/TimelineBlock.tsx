import React from 'react';
import { Check, Clock, Edit2, Trash2 } from 'lucide-react';
import { Task, CATEGORY_META } from '../../types';
import { sound } from '../../lib/sound';

interface TimelineBlockProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStartFocus: (task: Task) => void;
}

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  task,
  onToggleComplete,
  onSelectTask,
  onDeleteTask,
  onStartFocus,
}) => {
  const cat = CATEGORY_META[task.category] || CATEGORY_META.work;
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-[#F4F2E9]/70 border-[#E8E5D8] opacity-75'
          : 'bg-white border-[#E3DFD4] shadow-soft'
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Checkbox and Title */}
        <div className="flex items-start space-x-3 flex-1 pr-2">
          {/* Custom Checkbox Button with min 44px touch area */}
          <button
            type="button"
            onClick={() => {
              sound.playSuccess();
              onToggleComplete(task);
            }}
            className={`min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center shrink-0`}
            aria-label={isCompleted ? '완료 취소' : '작업 완료'}
          >
            <div
              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-[#778C59] border-[#778C59] text-white'
                  : 'border-[#C4BFB2] hover:border-[#778C59] bg-[#F8F7F2]'
              }`}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>

          <div
            className="flex-1 cursor-pointer"
            onClick={() => {
              sound.playClick();
              onSelectTask(task);
            }}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span
                className="text-[9.5px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: cat.bg, color: cat.color }}
              >
                {cat.label}
              </span>

              {task.startTime && (
                <span className="text-[11px] font-semibold text-[#686E63] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#778C59]" />
                  {task.startTime} ~ {task.endTime || ''}
                </span>
              )}

              <span className="text-[10px] text-[#858B7E] font-medium">
                ({task.estimatedMinutes}분)
              </span>
            </div>

            <h4
              className={`text-sm font-bold text-[#292D27] leading-snug ${
                isCompleted ? 'line-through text-[#858B7E]' : ''
              }`}
            >
              {task.title}
            </h4>

            {task.memo && (
              <p className="text-[11px] text-[#686E63] mt-0.5 line-clamp-1">{task.memo}</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-1 shrink-0">
          {!isCompleted && (
            <button
              onClick={() => {
                sound.playSuccess();
                onStartFocus(task);
              }}
              className="min-h-[36px] px-2.5 rounded-lg bg-[#EDF4E4] text-[#586A41] text-[11px] font-bold active:scale-95"
              title="집중 타이머 시작"
            >
              집중
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onSelectTask(task);
            }}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#858B7E] hover:text-[#292D27] rounded-lg"
            title="수정"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              if (confirm('이 작업을 삭제할까요?')) {
                onDeleteTask(task.id);
              }
            }}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#B35D43]/60 hover:text-[#B35D43] rounded-lg"
            title="삭제"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
