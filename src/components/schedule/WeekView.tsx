import React from 'react';
import { Task, CATEGORY_META } from '../../types';
import { sound } from '../../lib/sound';

interface WeekViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  tasks: Task[];
}

export const WeekView: React.FC<WeekViewProps> = ({
  selectedDate,
  onSelectDate,
  tasks,
}) => {
  const current = new Date(selectedDate);
  const dayOfWeek = current.getDay();
  const monday = new Date(current);
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(current.getDate() + diffToMonday);

  const weekDates = [];
  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    weekDates.push({
      dateStr,
      dayNum: d.getDate(),
      dayName: dayNames[i],
      isSelected: dateStr === selectedDate,
    });
  }

  const tasksByDate = tasks.reduce((acc, t) => {
    const d = t.assignedDate || t.deadlineDate;
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-3">
      {weekDates.map((item) => {
        const dayTasks = tasksByDate[item.dateStr] || [];

        return (
          <div
            key={item.dateStr}
            onClick={() => {
              sound.playClick();
              onSelectDate(item.dateStr);
            }}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              item.isSelected
                ? 'bg-white border-[#778C59] ring-1 ring-[#778C59] shadow-soft'
                : 'bg-white/80 border-[#E3DFD4] hover:bg-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  item.isSelected ? 'bg-[#778C59] text-white' : 'bg-[#EFECE3] text-[#686E63]'
                }`}>
                  {item.dayName} {item.dayNum}일
                </span>
                <span className="text-xs text-[#858B7E] font-medium">
                  {dayTasks.length}개 작업
                </span>
              </div>
            </div>

            {/* Task list for this day */}
            {dayTasks.length === 0 ? (
              <p className="text-[11px] text-[#A6ABA0] italic py-1">등록된 일정이 없습니다.</p>
            ) : (
              <div className="space-y-1.5">
                {dayTasks.map((t) => {
                  const cat = CATEGORY_META[t.category];
                  const isCompleted = t.status === 'completed';
                  return (
                    <div
                      key={t.id}
                      className={`text-xs p-2 rounded-xl flex items-center justify-between ${
                        isCompleted ? 'bg-[#F4F2E9] text-[#858B7E] line-through' : 'bg-[#F8F7F2] text-[#292D27]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat ? cat.dot : '#778C59' }}
                        />
                        <span className="font-semibold truncate">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-[#858B7E] shrink-0 font-medium ml-2">
                        {t.startTime || `${t.estimatedMinutes}분`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
