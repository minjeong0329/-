import React, { useState } from 'react';
import { UserPreferences, PressureLevel, FocusSlot } from '../../types';
import { sound } from '../../lib/sound';
import { ShieldCheck, Info, Sparkles, KeyRound } from 'lucide-react';

interface PreferencesSettingsProps {
  preferences: UserPreferences;
  onUpdate: (prefs: Partial<UserPreferences>) => void;
  onResetData: () => void;
  onOpenApiKeyModal: () => void;
}

export const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({
  preferences,
  onUpdate,
  onResetData,
  onOpenApiKeyModal,
}) => {
  const [characterName, setCharacterName] = useState(preferences.characterName);
  const [wakeTime, setWakeTime] = useState(preferences.wakeTime);
  const [sleepTime, setSleepTime] = useState(preferences.sleepTime);
  const [focusDuration, setFocusDuration] = useState(preferences.focusDuration);
  const [breakDuration, setBreakDuration] = useState(preferences.breakDuration);
  const [pressureLevel, setPressureLevel] = useState<PressureLevel>(preferences.pressureLevel);
  const [isNotifEnabled, setIsNotifEnabled] = useState(preferences.isNotificationsEnabled);

  const hasApiKey = Boolean(preferences.geminiApiKey?.trim() || preferences.openaiApiKey?.trim());

  const handleSave = () => {
    sound.playSuccess();
    onUpdate({
      characterName: characterName.trim() || '미루미',
      wakeTime,
      sleepTime,
      focusDuration,
      breakDuration,
      pressureLevel,
      isNotificationsEnabled: isNotifEnabled,
    });
  };

  const handleRequestNotification = async () => {
    sound.playClick();
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setIsNotifEnabled(true);
        onUpdate({ isNotificationsEnabled: true });
        new Notification('미루지마!(MIRUMA)', {
          body: '알림이 성공적으로 활성화되었습니다! 지연 시 캐릭터가 알려드려요.',
          icon: '/favicon.svg',
        });
      } else {
        setIsNotifEnabled(false);
        onUpdate({ isNotificationsEnabled: false });
        alert('브라우저 알림 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.');
      }
    } else {
      alert('이 브라우저는 웹 알림 API를 지원하지 않습니다.');
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* AI API Key Section */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#778C59]" />
            <h3 className="text-sm font-bold text-[#292D27]">AI 비서 연동 (gemini-3.8-flash)</h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              hasApiKey ? 'bg-[#EDF4E4] text-[#586A41]' : 'bg-[#FAF9F5] text-[#858B7E] border border-[#E3DFD4]'
            }`}
          >
            {hasApiKey ? '연동됨 ✓' : '미연동'}
          </span>
        </div>

        <p className="text-xs text-[#686E63] leading-relaxed">
          Google Gemini API 키를 등록하면 자연어 일정 자동 분해 및 미루미 1:1 맞춤 코칭을 무료로 사용할 수 있습니다.
        </p>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenApiKeyModal();
          }}
          className="w-full min-h-[44px] rounded-xl bg-[#F4F2E9] border border-[#E3DFD4] text-xs font-bold text-[#586A41] flex items-center justify-center space-x-1.5 active:scale-95"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{hasApiKey ? 'API 키 변경 또는 삭제' : '무료 Gemini API 키 등록하기 (1분 소요)'}</span>
        </button>
      </div>

      {/* Character Profile Section */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] space-y-3">
        <h3 className="text-sm font-bold text-[#292D27]">캐릭터 및 피드백 강도</h3>
        <div>
          <label className="text-xs font-semibold text-[#686E63] block mb-1">캐릭터 이름</label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8F7F2] border border-[#E3DFD4] rounded-xl text-sm font-semibold text-[#292D27]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#686E63] block mb-1">미루기 개입 압박 강도</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mild' as PressureLevel, label: '🌱 순한맛' },
              { id: 'normal' as PressureLevel, label: '⚖️ 기본맛' },
              { id: 'spicy' as PressureLevel, label: '🌶️ 매운맛' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setPressureLevel(p.id);
                }}
                className={`min-h-[44px] py-2 px-2 text-xs rounded-xl border font-bold transition-all ${
                  pressureLevel === p.id
                    ? 'bg-[#EDF4E4] border-[#778C59] text-[#586A41]'
                    : 'bg-[#F8F7F2] border-[#E3DFD4] text-[#686E63]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Routine & Time Settings */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] space-y-3">
        <h3 className="text-sm font-bold text-[#292D27]">생활 패턴 및 타이머</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#686E63] block mb-1">기상 시간</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F7F2] border border-[#E3DFD4] rounded-xl text-xs font-semibold text-[#292D27]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#686E63] block mb-1">취침 시간</label>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F7F2] border border-[#E3DFD4] rounded-xl text-xs font-semibold text-[#292D27]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#686E63] block mb-1">집중 세션 지속 시간</label>
            <select
              value={focusDuration}
              onChange={(e) => setFocusDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#F8F7F2] border border-[#E3DFD4] rounded-xl text-xs font-semibold text-[#292D27]"
            >
              <option value={15}>15분</option>
              <option value={25}>25분 (뽀모도로)</option>
              <option value={45}>45분</option>
              <option value={60}>60분</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#686E63] block mb-1">휴식 시간</label>
            <select
              value={breakDuration}
              onChange={(e) => setBreakDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#F8F7F2] border border-[#E3DFD4] rounded-xl text-xs font-semibold text-[#292D27]"
            >
              <option value={5}>5분</option>
              <option value={10}>10분</option>
              <option value={15}>15분</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications & System Limitations Notice */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] space-y-3">
        <h3 className="text-sm font-bold text-[#292D27]">알림 및 백그라운드 안내</h3>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#292D27]">브라우저 웹 푸시 알림</span>
          <button
            onClick={handleRequestNotification}
            className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isNotifEnabled
                ? 'bg-[#EDF4E4] text-[#586A41] border border-[#B8CE90]'
                : 'bg-[#F4F2E9] text-[#686E63] border border-[#E3DFD4]'
            }`}
          >
            {isNotifEnabled ? '알림 활성화됨 ✓' : '알림 허용하기'}
          </button>
        </div>

        {/* Clear explanation of web notification boundaries */}
        <div className="p-3 rounded-xl bg-[#F4F2E9] border border-[#E8E5D8] text-[11px] text-[#686E63] leading-relaxed flex items-start space-x-2">
          <Info className="w-4 h-4 text-[#778C59] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#292D27] mb-0.5">푸시 알림 및 백그라운드 지원 범위</p>
            <p>
              MIRUMA는 개인정보 보호를 위해 외부 유료 서버로 일정을 전송하지 않고 브라우저 IndexedDB에 로컬 저장됩니다.
              앱이 완전히 종료된 상태의 예약 푸시는 서버 인프라 없이 보장할 수 없으며, 탭이 열려 있거나 백그라운드 실행 중일 때 정확하게 작동합니다.
              스마트폰을 강제로 잠그거나 타사 앱을 차단하는 기능은 지원하지 않습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full min-h-[48px] rounded-2xl bg-[#778C59] text-white text-xs font-bold shadow-soft active:scale-95"
      >
        설정 저장하기
      </button>

      {/* Danger Zone: Reset Data */}
      <div className="pt-2 border-t border-[#E8E5D8] flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (confirm('모든 일정 및 캐릭터 데이터를 초기화하시겠습니까?')) {
              onResetData();
            }
          }}
          className="text-xs text-[#B35D43] underline font-medium p-2"
        >
          데이터 초기화 및 온보딩 다시하기
        </button>
      </div>
    </div>
  );
};
