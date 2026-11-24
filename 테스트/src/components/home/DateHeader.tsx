import React from 'react';
import { Plus, Wand2 } from 'lucide-react';
import { sound } from '../../lib/sound';

interface DateHeaderProps {
  selectedDate: string; // YYYY-MM-DD
  onAddTask: () => void;
  onAutoSchedule: () => void;
  onOpenAiMagic?: () => void;
}

export const DateHeader: React.FC<DateHeaderProps> = ({
  selectedDate,
  onAddTask,
  onAutoSchedule,
  onOpenAiMagic,
}) => {
  const dateObj = new Date(selectedDate);
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = days[dateObj.getDay()];
  const formattedDate = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 ${dayName}`;

  return (
    <div className="flex items-center justify-between pt-1 pb-2">
      <div>
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#778C59]">TODAY</span>
        <h2 className="text-xl font-black text-[#292D27] tracking-tight">{formattedDate}</h2>
      </div>

      <div className="flex items-center space-x-1.5">
        {onOpenAiMagic && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenAiMagic();
            }}
            className="min-h-[40px] px-2.5 rounded-xl bg-white border border-[#D5E5B5] text-[#586A41] text-xs font-bold flex items-center space-x-1 active:scale-95 transition-all shadow-soft"
            title="AI 자연어 마법 일정 등록"
          >
            <span>✨</span>
            <span>AI 등록</span>
          </button>
        )}

        <button
          onClick={() => {
            sound.playClick();
            onAutoSchedule();
          }}
          className="min-h-[40px] px-2.5 rounded-xl bg-[#EDF4E4] border border-[#B8CE90] text-[#586A41] text-xs font-bold flex items-center space-x-1 active:scale-95 transition-all shadow-soft"
          title="자동 일정 생성"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>자동 배치</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onAddTask();
          }}
          className="min-h-[40px] px-3 rounded-xl bg-[#778C59] text-white text-xs font-bold flex items-center space-x-1 active:scale-95 transition-all shadow-soft"
          title="일정 추가"
        >
          <Plus className="w-4 h-4" />
          <span>추가</span>
        </button>
      </div>
    </div>
  );
};
