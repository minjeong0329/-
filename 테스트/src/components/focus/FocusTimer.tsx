import React, { useState, useEffect, useRef } from 'react';
import { Task, CATEGORY_META } from '../../types';
import { MirumiCharacter } from '../character/MirumiCharacter';
import { sound } from '../../lib/sound';
import { Play, Pause, Square, Check, ArrowRight } from 'lucide-react';

interface FocusTimerProps {
  activeTask: Task | null;
  onCompleteSession: (task: Task, durationSeconds: number, mode: '5min' | '25min' | 'custom') => void;
  onStartBreak: () => void;
  onSelectTaskToFocus: () => void;
}

export type TimerPreset = '5min' | '25min' | 'custom';

const STORAGE_KEY = 'miruma_timer_state';

interface PersistedTimerState {
  targetSeconds: number;
  accumulatedElapsedSeconds: number;
  lastStartEpoch: number | null; // Date.now() when running
  isPaused: boolean;
  mode: TimerPreset;
  taskId: string | null;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  activeTask,
  onCompleteSession,
  onStartBreak,
  onSelectTaskToFocus,
}) => {
  const [mode, setMode] = useState<TimerPreset>('25min');
  const [customMinutes, setCustomMinutes] = useState(45);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [targetSeconds, setTargetSeconds] = useState(25 * 60);

  const accumulatedElapsedRef = useRef<number>(0);
  const lastStartEpochRef = useRef<number | null>(null);

  // Restore timer state on mount (supports background tab and refresh without drift)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: PersistedTimerState = JSON.parse(saved);
        if (state.taskId === (activeTask?.id || null)) {
          setMode(state.mode);
          setTargetSeconds(state.targetSeconds);
          accumulatedElapsedRef.current = state.accumulatedElapsedSeconds;

          if (!state.isPaused && state.lastStartEpoch) {
            const elapsedSinceEpoch = Math.floor((Date.now() - state.lastStartEpoch) / 1000);
            const totalElapsed = state.accumulatedElapsedSeconds + elapsedSinceEpoch;
            const remaining = Math.max(0, state.targetSeconds - totalElapsed);
            setRemainingSeconds(remaining);
            setIsRunning(remaining > 0);
            lastStartEpochRef.current = state.lastStartEpoch;
          } else {
            const remaining = Math.max(0, state.targetSeconds - state.accumulatedElapsedSeconds);
            setRemainingSeconds(remaining);
            setIsRunning(false);
            lastStartEpochRef.current = null;
          }
        }
      }
    } catch {}
  }, [activeTask?.id]);

  // Sync state to localStorage
  const saveStateToStorage = (paused: boolean, currentRem: number) => {
    try {
      const elapsed = targetSeconds - currentRem;
      const state: PersistedTimerState = {
        targetSeconds,
        accumulatedElapsedSeconds: elapsed,
        lastStartEpoch: paused ? null : (lastStartEpochRef.current || Date.now()),
        isPaused: paused,
        mode,
        taskId: activeTask?.id || null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  };

  // Timer tick interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (lastStartEpochRef.current) {
        const elapsedSinceEpoch = Math.floor((Date.now() - lastStartEpochRef.current) / 1000);
        const totalElapsed = accumulatedElapsedRef.current + elapsedSinceEpoch;
        const remaining = Math.max(0, targetSeconds - totalElapsed);
        setRemainingSeconds(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          handleFinishSession(true);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, targetSeconds]);

  // Set preset
  const handleSelectPreset = (newMode: TimerPreset) => {
    sound.playClick();
    setMode(newMode);
    setIsRunning(false);
    lastStartEpochRef.current = null;
    accumulatedElapsedRef.current = 0;

    let total = 25 * 60;
    if (newMode === '5min') total = 5 * 60;
    else if (newMode === 'custom') total = customMinutes * 60;

    setTargetSeconds(total);
    setRemainingSeconds(total);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleStart = () => {
    sound.playSuccess();
    lastStartEpochRef.current = Date.now();
    setIsRunning(true);
    saveStateToStorage(false, remainingSeconds);
  };

  const handlePause = () => {
    sound.playClick();
    if (lastStartEpochRef.current) {
      const elapsed = Math.floor((Date.now() - lastStartEpochRef.current) / 1000);
      accumulatedElapsedRef.current += elapsed;
    }
    lastStartEpochRef.current = null;
    setIsRunning(false);
    saveStateToStorage(true, remainingSeconds);
  };

  const handleFinishSession = (completedNaturally: boolean) => {
    sound.playSuccess();
    setIsRunning(false);
    lastStartEpochRef.current = null;
    const finalElapsed = targetSeconds - remainingSeconds;
    localStorage.removeItem(STORAGE_KEY);

    if (activeTask) {
      onCompleteSession(activeTask, finalElapsed, mode);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setIsRunning(false);
    lastStartEpochRef.current = null;
    accumulatedElapsedRef.current = 0;
    setRemainingSeconds(targetSeconds);
    localStorage.removeItem(STORAGE_KEY);
  };

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const progressRatio = targetSeconds > 0 ? (targetSeconds - remainingSeconds) / targetSeconds : 0;

  const cat = activeTask ? CATEGORY_META[activeTask.category] : null;

  return (
    <div className="space-y-4">
      {/* Active Task Selector or Card */}
      {activeTask ? (
        <div className="bg-white p-3.5 rounded-2xl border border-[#E3DFD4] shadow-soft flex items-center justify-between">
          <div className="truncate pr-3">
            <div className="flex items-center space-x-1.5 mb-1">
              <span
                className="text-[9.5px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: cat?.bg, color: cat?.color }}
              >
                {cat?.label}
              </span>
              <span className="text-[11px] font-semibold text-[#778C59]">집중 진행 중</span>
            </div>
            <h3 className="text-sm font-black text-[#292D27] truncate">{activeTask.title}</h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onSelectTaskToFocus();
            }}
            className="min-h-[36px] px-2.5 rounded-lg bg-[#F4F2E9] text-[11px] font-bold text-[#686E63] shrink-0"
          >
            변경
          </button>
        </div>
      ) : (
        <div
          onClick={() => {
            sound.playClick();
            onSelectTaskToFocus();
          }}
          className="bg-white p-4 rounded-2xl border border-dashed border-[#B8CE90] text-center cursor-pointer hover:bg-[#F8F7F2]"
        >
          <span className="text-xs font-bold text-[#586A41] block">
            + 집중할 작업을 먼저 선택해 주세요
          </span>
          <span className="text-[11px] text-[#858B7E]">등록된 일정 중 하나를 골라 시작할 수 있습니다.</span>
        </div>
      )}

      {/* Preset Mode Tabs */}
      <div className="flex bg-[#EFECE3] p-1 rounded-xl">
        {[
          { id: '5min' as TimerPreset, label: '🌱 5분 시작 (미루기 퇴치)' },
          { id: '25min' as TimerPreset, label: '⏱️ 25분 (표준 뽀모도로)' },
          { id: 'custom' as TimerPreset, label: '⚙️ 맞춤 시간' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPreset(p.id)}
            disabled={isRunning}
            className={`flex-1 min-h-[38px] text-[11.5px] font-bold rounded-lg transition-all ${
              mode === p.id
                ? 'bg-white text-[#292D27] shadow-sm'
                : 'text-[#686E63] disabled:opacity-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom minutes selector if in custom mode */}
      {mode === 'custom' && !isRunning && (
        <div className="flex items-center justify-center space-x-2 bg-white p-2.5 rounded-xl border border-[#E3DFD4]">
          <span className="text-xs font-semibold text-[#686E63]">집중 시간:</span>
          {[15, 30, 45, 60, 90].map((m) => (
            <button
              key={m}
              onClick={() => {
                sound.playClick();
                setCustomMinutes(m);
                setTargetSeconds(m * 60);
                setRemainingSeconds(m * 60);
              }}
              className={`min-h-[32px] px-2.5 rounded-lg text-xs font-bold ${
                customMinutes === m ? 'bg-[#778C59] text-white' : 'bg-[#F4F2E9] text-[#686E63]'
              }`}
            >
              {m}분
            </button>
          ))}
        </div>
      )}

      {/* Main Circular Timer Display */}
      <div className="bg-white p-6 rounded-3xl border border-[#E3DFD4] shadow-lifted flex flex-col items-center relative overflow-hidden">
        {/* Mirumi Character small floating in timer */}
        <div className="mb-2">
          <MirumiCharacter
            expression={isRunning ? 'focusing' : 'idle'}
            size={90}
          />
        </div>

        {/* Circular Ring & Big Digits */}
        <div className="relative w-48 h-48 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#EFECE3"
              strokeWidth="6"
              fill="none"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#778C59"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 * (1 - progressRatio)}
              className="transition-all duration-300"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-[#292D27] tracking-tight tabular-nums">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-[11px] font-bold text-[#778C59] mt-1">
              {isRunning ? '집중 몰입 중' : remainingSeconds === targetSeconds ? '준비 완료' : '일시 정지됨'}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center space-x-3 mt-4 w-full max-w-xs">
          {isRunning ? (
            <button
              onClick={handlePause}
              className="flex-1 min-h-[48px] rounded-2xl bg-[#F4F2E9] border border-[#E3DFD4] text-[#292D27] text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>일시 정지</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex-1 min-h-[48px] rounded-2xl bg-[#778C59] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-soft active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{remainingSeconds < targetSeconds ? '계속하기' : '집중 시작하기'}</span>
            </button>
          )}

          {/* Complete or Reset Button */}
          {remainingSeconds < targetSeconds && (
            <button
              onClick={() => handleFinishSession(false)}
              className="min-h-[48px] px-4 rounded-2xl bg-[#EDF4E4] border border-[#B8CE90] text-[#586A41] text-xs font-bold flex items-center space-x-1 active:scale-95"
              title="지금 세션 완료"
            >
              <Check className="w-4 h-4" />
              <span>완료</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="min-w-[48px] min-h-[48px] rounded-2xl bg-[#F4F2E9] text-[#858B7E] flex items-center justify-center active:scale-95"
            title="초기화"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Break Transition Button */}
        <div className="mt-4 pt-3 border-t border-[#E8E5D8] w-full text-center">
          <button
            onClick={() => {
              sound.playClick();
              onStartBreak();
            }}
            className="text-xs text-[#778C59] font-bold inline-flex items-center space-x-1 hover:underline"
          >
            <span>☕ 5분 휴식 타이머 켜기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
