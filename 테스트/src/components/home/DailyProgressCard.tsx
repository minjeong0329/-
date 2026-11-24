import React from 'react';
import { CheckCircle2, TrendingUp } from 'lucide-react';

interface DailyProgressCardProps {
  totalCount: number;
  completedCount: number;
  characterName: string;
}

export const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  totalCount,
  completedCount,
  characterName,
}) => {
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-[#E3DFD4] shadow-soft flex items-center justify-between">
      <div className="flex-1 pr-4">
        <div className="flex items-center space-x-1.5 mb-1.5">
          <TrendingUp className="w-4 h-4 text-[#778C59]" />
          <span className="text-xs font-bold text-[#292D27]">오늘의 달성률</span>
          <span className="text-xs font-black text-[#586A41]">{percentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#EFECE3] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#778C59] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-[11px] text-[#686E63] mt-1.5">
          총 {totalCount}개 작업 중 <span className="font-bold text-[#292D27]">{completedCount}개 완료</span>
        </p>
      </div>

      {/* Circular Mini Visual */}
      <div className="w-12 h-12 rounded-full bg-[#EDF4E4] border border-[#B8CE90] flex items-center justify-center shrink-0">
        {percentage === 100 && totalCount > 0 ? (
          <CheckCircle2 className="w-6 h-6 text-[#586A41]" />
        ) : (
          <span className="text-xs font-black text-[#586A41]">{percentage}%</span>
        )}
      </div>
    </div>
  );
};
