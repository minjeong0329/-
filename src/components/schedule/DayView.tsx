import React from 'react';
import { Task, CATEGORY_META } from '../../types';
import { sound } from '../../lib/sound';
import { Clock } from 'lucide-react';

interface DayViewProps {
  selectedDate: string; // YYYY-MM-DD
  tasks: Task[];
  wakeTime: string; // e.g. "07:30"
  sleepTime: string; // e.g. "23:30"
  onSelectTask: (task: Task) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  tasks,
  wakeTime,
  sleepTime,
  onSelectTask,
}) => {
  const dayTasks = tasks.filter(
    (t) => (t.assignedDate || t.deadlineDate) === selectedDate
  );

  // Sort tasks by startTime
  const sortedTasks = [...dayTasks].sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  // Hours array from 7am to 24pm
  const hours = Array.from({ length: 18 }, (_, i) => i + 7);

  return (
    <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] shadow-soft space-y-4">
      <div className="flex items-center justify-between border-b border-[#E8E5D8] pb-2">
        <h3 className="text-sm font-bold text-[#292D27]">시간대별 상세 타임라인</h3>
        <span className="text-xs text-[#778C59] font-semibold">
          활동 시간: {wakeTime} ~ {sleepTime}
        </span>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#858B7E]">
          이 날짜에 배정된 일정이 없습니다. 상단의 자동 배치를 실행해 보세요!
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedTasks.map((task) => {
            const cat = CATEGORY_META[task.category] || CATEGORY_META.work;
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTask(task);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  isCompleted
                    ? 'bg-[#F4F2E9]/60 border-[#E8E5D8] opacity-75'
                    : 'bg-[#F8F7F2] border-[#E3DFD4] hover:border-[#778C59]'
                }`}
              >
                {/* Time Indicator */}
                <div className="w-16 shrink-0 text-left">
                  <div className="text-xs font-black text-[#586A41]">
                    {task.startTime || '미지정'}
                  </div>
                  <div className="text-[10px] text-[#858B7E]">
                    {task.endTime ? `~ ${task.endTime}` : `${task.estimatedMinutes}분`}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 mb-0.5">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: cat.bg, color: cat.color }}
                    >
                      {cat.label}
                    </span>
                    {task.isFixed && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#E5E5E5] text-[#555]">
                        고정
                      </span>
                    )}
                  </div>
                  <h4
                    className={`text-xs font-bold text-[#292D27] truncate ${
                      isCompleted ? 'line-through text-[#858B7E]' : ''
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.memo && (
                    <p className="text-[10px] text-[#686E63] truncate mt-0.5">{task.memo}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
