import React from 'react';
import { sound } from '../../lib/sound';

export type ScheduleViewMode = 'month' | 'week' | 'day';

interface ScheduleViewToggleProps {
  viewMode: ScheduleViewMode;
  onChangeView: (mode: ScheduleViewMode) => void;
}

export const ScheduleViewToggle: React.FC<ScheduleViewToggleProps> = ({
  viewMode,
  onChangeView,
}) => {
  const modes: { id: ScheduleViewMode; label: string }[] = [
    { id: 'month', label: '월간' },
    { id: 'week', label: '주간' },
    { id: 'day', label: '일간' },
  ];

  return (
    <div className="flex bg-[#EFECE3] p-1 rounded-xl">
      {modes.map((m) => {
        const isActive = viewMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => {
              sound.playClick();
              onChangeView(m.id);
            }}
            className={`flex-1 min-h-[36px] text-xs font-bold rounded-lg transition-all ${
              isActive
                ? 'bg-white text-[#292D27] shadow-sm'
                : 'text-[#686E63] hover:text-[#292D27]'
            }`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
};
