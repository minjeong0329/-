import React from 'react';
import { Sparkles, Bell, Moon, Sun } from 'lucide-react';
import { CharacterState, UserPreferences } from '../../types';
import { sound } from '../../lib/sound';

interface HeaderProps {
  character: CharacterState;
  preferences: UserPreferences;
  onToggleRestMode: () => void;
  onOpenNotifications: () => void;
  onOpenAiCoach: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  character,
  preferences,
  onToggleRestMode,
  onOpenNotifications,
  onOpenAiCoach,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F8F7F2]/95 backdrop-blur-sm border-b border-[#E8E5D8] px-4 py-3 flex items-center justify-between">
      {/* Brand & Character Level Pill */}
      <div className="flex items-center space-x-2.5">
        <h1 className="text-[17px] font-black tracking-tight text-[#292D27] flex items-center gap-1.5">
          <span className="text-[#778C59]">미루지마!</span>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#D5E5B5] text-[#586A41]">
            MIRUMA
          </span>
        </h1>
      </div>

      {/* Right Controls: Points, AI Button, Rest Mode, Notifications */}
      <div className="flex items-center space-x-1.5">
        {/* AI Assistant Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenAiCoach();
          }}
          className="min-h-[36px] px-2.5 rounded-full bg-[#EDF4E4] border border-[#B8CE90] text-[#586A41] text-xs font-bold flex items-center space-x-1 active:scale-95 transition-all shadow-soft"
          title="미루미 AI 비서 & 1:1 코치 (gemini-3.8-flash)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px]">AI</span>
        </button>

        {/* Points Chip */}
        <div
          className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#F4F2E9] border border-[#E3DFD4] text-xs font-semibold text-[#586A41]"
          title="씨앗 포인트"
        >
          <span>🌱</span>
          <span>{character.totalPoints}P</span>
        </div>

        {/* Rest Mode Toggle Button */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleRestMode();
          }}
          className={`min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center transition-all ${
            preferences.isRestMode
              ? 'bg-[#EAF0F8] text-[#4B6B94] border border-[#B8D0EC]'
              : 'bg-[#F4F2E9] text-[#686E63] hover:text-[#292D27]'
          }`}
          title={preferences.isRestMode ? '휴식 모드 켜짐' : '휴식 모드 전환'}
          aria-label="휴식 모드"
        >
          {preferences.isRestMode ? <Moon className="w-3.5 h-3.5 fill-current" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenNotifications();
          }}
          className="min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center bg-[#F4F2E9] text-[#686E63] hover:text-[#292D27] active:scale-95"
          title="알림 설정 및 내역"
          aria-label="알림"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
