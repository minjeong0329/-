import React, { useState, useEffect } from 'react';
import { MirumiCharacter } from '../character/MirumiCharacter';
import { sound } from '../../lib/sound';
import { Play, Pause, ArrowRight, RotateCcw } from 'lucide-react';

interface BreakTimerProps {
  onFinishBreak: () => void;
  defaultMinutes?: number;
}

export const BreakTimer: React.FC<BreakTimerProps> = ({
  onFinishBreak,
  defaultMinutes = 5,
}) => {
  const [seconds, setSeconds] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          sound.playSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#E3DFD4] shadow-lifted flex flex-col items-center text-center space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EAF0F8] text-[#4B6B94]">
          마음 챙김 휴식 모드
        </span>
      </div>

      <MirumiCharacter expression="rest" size={110} />

      <div>
        <h3 className="text-base font-black text-[#292D27]">숨을 깊게 들이마시고 쉬어가요</h3>
        <p className="text-xs text-[#686E63] mt-1">
          휴식을 잘 취해야 다음 집중 세션에서 최고의 몰입을 발휘할 수 있어요.
        </p>
      </div>

      {/* Break Countdown Digits */}
      <div className="text-4xl font-black text-[#4B6B94] tracking-tight tabular-nums py-2">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2 w-full max-w-xs">
        <button
          onClick={() => {
            sound.playClick();
            setIsRunning(!isRunning);
          }}
          className="flex-1 min-h-[44px] rounded-xl bg-[#F4F2E9] border border-[#E3DFD4] text-xs font-bold text-[#292D27] flex items-center justify-center space-x-1"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? '일시 정지' : '계속 쉬기'}</span>
        </button>

        <button
          onClick={() => {
            sound.playSuccess();
            onFinishBreak();
          }}
          className="flex-1 min-h-[44px] rounded-xl bg-[#778C59] text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-soft active:scale-95"
        >
          <span>휴식 끝, 집중으로!</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
