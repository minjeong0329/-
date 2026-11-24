import React from 'react';
import { sound } from '../../lib/sound';

interface WeeklyStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  completionMap?: Record<string, number>; // date -> 0~100 percentage
}

export const WeeklyStrip: React.FC<WeeklyStripProps> = ({
  selectedDate,
  onSelectDate,
  completionMap = {},
}) => {
  const current = new Date(selectedDate);
  const dayOfWeek = current.getDay(); // 0 is Sun
  // Calculate Monday of current week
  const monday = new Date(current);
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(current.getDate() + diffToMonday);

  const weekDays = [];
  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    weekDays.push({
      dateStr,
      dayNum: d.getDate(),
      dayName: dayNames[i],
      isToday: dateStr === new Date().toISOString().slice(0, 10),
      isSelected: dateStr === selectedDate,
      completionRate: completionMap[dateStr] ?? 0,
    });
  }

  return (
    <div className="flex items-center justify-between bg-white px-2 py-2.5 rounded-2xl border border-[#E3DFD4] shadow-soft">
      {weekDays.map((item) => (
        <button
          key={item.dateStr}
          onClick={() => {
            sound.playClick();
            onSelectDate(item.dateStr);
          }}
          className={`flex-1 min-h-[48px] py-1.5 flex flex-col items-center justify-center rounded-xl transition-all relative ${
            item.isSelected
              ? 'bg-[#778C59] text-white font-bold shadow-soft'
              : 'text-[#686E63] hover:bg-[#F4F2E9]'
          }`}
        >
          <span className={`text-[10px] font-medium ${item.isSelected ? 'text-[#D5E5B5]' : 'text-[#858B7E]'}`}>
            {item.dayName}
          </span>
          <span className="text-sm font-bold mt-0.5">{item.dayNum}</span>

          {/* Completion indicator dot */}
          <div className="mt-1 flex space-x-0.5 h-1 items-center">
            {item.completionRate > 0 && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  item.isSelected
                    ? 'bg-white'
                    : item.completionRate >= 100
                    ? 'bg-[#778C59]'
                    : 'bg-[#F0AA95]'
                }`}
              />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
