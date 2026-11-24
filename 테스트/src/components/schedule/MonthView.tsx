import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, CATEGORY_META } from '../../types';
import { sound } from '../../lib/sound';

interface MonthViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  tasks: Task[];
}

export const MonthView: React.FC<MonthViewProps> = ({
  selectedDate,
  onSelectDate,
  tasks,
}) => {
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const d = new Date(selectedDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const { year, month } = currentYearMonth;

  // Calendar dates generation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Prev month navigation
  const handlePrevMonth = () => {
    sound.playClick();
    setCurrentYearMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    sound.playClick();
    setCurrentYearMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Map tasks by date
  const tasksByDate = tasks.reduce((acc, t) => {
    const d = t.assignedDate || t.deadlineDate;
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {} as Record<string, Task[]>);

  const daysLabels = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] shadow-soft space-y-3">
      {/* Header Month / Year controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-[#292D27]">
          {year}년 {month + 1}월
        </h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevMonth}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-[#F4F2E9] text-[#686E63]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-[#F4F2E9] text-[#686E63]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-center">
        {daysLabels.map((lbl, idx) => (
          <span
            key={lbl}
            className={`text-[11px] font-bold py-1 ${
              idx === 0 ? 'text-[#E06C75]' : idx === 6 ? 'text-[#5E81AC]' : 'text-[#858B7E]'
            }`}
          >
            {lbl}
          </span>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-12" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isSelected = dateStr === selectedDate;
          const dayTasks = tasksByDate[dateStr] || [];
          const hasIncomplete = dayTasks.some((t) => t.status !== 'completed');
          const hasCompleted = dayTasks.some((t) => t.status === 'completed');

          return (
            <button
              key={dateStr}
              onClick={() => {
                sound.playClick();
                onSelectDate(dateStr);
              }}
              className={`h-12 flex flex-col items-center justify-center rounded-xl text-xs transition-all relative ${
                isSelected
                  ? 'bg-[#778C59] text-white font-bold shadow-soft'
                  : 'text-[#292D27] hover:bg-[#F4F2E9]'
              }`}
            >
              <span>{dayNum}</span>

              {/* Task Dots */}
              <div className="flex space-x-0.5 mt-1">
                {dayTasks.slice(0, 3).map((t, idx) => {
                  const cat = CATEGORY_META[t.category];
                  return (
                    <span
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: isSelected ? '#FFFFFF' : cat ? cat.dot : '#778C59',
                      }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
