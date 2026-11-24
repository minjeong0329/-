import React, { useState } from 'react';
import { UserPreferences, PressureLevel, FocusSlot } from '../../types';
import { MirumiCharacter } from '../character/MirumiCharacter';
import { sound } from '../../lib/sound';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (prefs: Partial<UserPreferences>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [characterName, setCharacterName] = useState('미루미');
  const [wakeTime, setWakeTime] = useState('07:30');
  const [sleepTime, setSleepTime] = useState('23:30');
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [pressureLevel, setPressureLevel] = useState<PressureLevel>('normal');
  const [preferredSlots, setPreferredSlots] = useState<FocusSlot[]>(['morning', 'afternoon']);

  if (!isOpen) return null;

  const toggleSlot = (slot: FocusSlot) => {
    sound.playClick();
    if (preferredSlots.includes(slot)) {
      if (preferredSlots.length > 1) {
        setPreferredSlots(preferredSlots.filter((s) => s !== slot));
      }
    } else {
      setPreferredSlots([...preferredSlots, slot]);
    }
  };

  const handleFinish = () => {
    sound.playSuccess();
    onComplete({
      characterName: characterName.trim() || '미루미',
      wakeTime,
      sleepTime,
      focusDuration,
      breakDuration,
      pressureLevel,
      preferredFocusSlots: preferredSlots,
      hasCompletedOnboarding: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8F7F2] flex flex-col max-w-[430px] mx-auto overflow-y-auto p-5 pb-safe justify-between">
      {/* Top Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-[#778C59] mb-4">
          <span>생활 패턴 맞춤 온보딩</span>
          <span>{step} / 3 단계</span>
        </div>
        <div className="w-full bg-[#E8E5D8] h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-[#778C59] h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step 1: Character Greeting & Name */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in duration-200">
            <MirumiCharacter expression="prompt" size={130} />
            <h2 className="text-xl font-bold text-[#292D27] mt-2">
              반가워요! 당신의 미루기 방지 매니저예요.
            </h2>
            <p className="text-xs text-[#686E63] leading-relaxed max-w-[280px]">
              혼자서 계획 세우고 미루며 자책하는 일은 이제 그만! 앞으로 함께할 캐릭터의 이름을 지어주세요.
            </p>

            <div className="w-full max-w-xs text-left mt-2">
              <label className="text-xs font-semibold text-[#292D27] mb-1 block">매니저 캐릭터 이름</label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                maxLength={10}
                placeholder="예: 미루미"
                className="w-full px-4 py-3 bg-white border border-[#E3DFD4] rounded-xl text-sm font-semibold text-[#292D27] focus:outline-none focus:border-[#778C59]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Wake, Sleep & Focus Session Timing */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center">
              <h2 className="text-lg font-bold text-[#292D27]">생활 리듬을 알려주세요</h2>
              <p className="text-xs text-[#686E63] mt-1">
                무리한 스케줄 대신, 기상과 취침 시간에 맞춰 현실적으로 배치해 드려요.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#686E63] block mb-1">기상 시간</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F8F7F2] border border-[#E3DFD4] rounded-xl text-sm font-semibold text-[#292D27] focus:outline-none focus:border-[#778C59]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#686E63] block mb-1">취침 시간</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F8F7F2] border border-[#E3DFD4] rounded-xl text-sm font-semibold text-[#292D27] focus:outline-none focus:border-[#778C59]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#686E63] block mb-1">선호 집중 시간대 (복수 선택)</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'morning' as FocusSlot, label: '오전 (09~12시)' },
                    { id: 'afternoon' as FocusSlot, label: '오후 (13~18시)' },
                    { id: 'evening' as FocusSlot, label: '저녁 (19~22시)' },
                    { id: 'night' as FocusSlot, label: '심야 (22시 이후)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSlot(s.id)}
                      className={`min-h-[44px] py-2 px-3 text-xs rounded-xl border text-center font-semibold transition-all ${
                        preferredSlots.includes(s.id)
                          ? 'bg-[#EDF4E4] border-[#778C59] text-[#586A41]'
                          : 'bg-[#F8F7F2] border-[#E3DFD4] text-[#686E63]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-[#686E63] block mb-1">집중 세션 (분)</label>
                  <select
                    value={focusDuration}
                    onChange={(e) => setFocusDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F8F7F2] border border-[#E3DFD4] rounded-xl text-xs font-semibold text-[#292D27]"
                  >
                    <option value={15}>15분 (가벼운 시작)</option>
                    <option value={25}>25분 (표준 뽀모도로)</option>
                    <option value={45}>45분 (몰입형)</option>
                    <option value={60}>60분 (장시간)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#686E63] block mb-1">휴식 시간 (분)</label>
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
          </div>
        )}

        {/* Step 3: Pressure Level Selection */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center">
              <h2 className="text-lg font-bold text-[#292D27]">압박 강도를 골라주세요</h2>
              <p className="text-xs text-[#686E63] mt-1">
                나에게 가장 잘 맞는 피드백 스타일을 선택할 수 있어요. (언제든 변경 가능)
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'mild' as PressureLevel,
                  title: '🌱 순한맛 (따뜻한 응원)',
                  desc: '작은 진전도 칭찬하고 부드럽게 시작을 유도합니다.',
                  quote: '"조금씩 시작해볼까요? 5분만 딱 해봐요!"',
                },
                {
                  id: 'normal' as PressureLevel,
                  title: '⚖️ 기본맛 (균형 잡힌 코칭)',
                  desc: '적절한 긴장감을 유지하며 행동을 재촉합니다.',
                  quote: '"지금 안 하면 오늘 밤에 울게 돼요! 지금 출발!"',
                },
                {
                  id: 'spicy' as PressureLevel,
                  title: '🌶️ 매운맛 (재치 있는 잔소리)',
                  desc: '비하 없이 유쾌하고 날카로운 팩트로 정신을 번쩍 들게 합니다.',
                  quote: '"침대랑 결혼하셨나요? 어서 일어나서 버튼 누르세요!"',
                },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    sound.playClick();
                    setPressureLevel(p.id);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    pressureLevel === p.id
                      ? 'bg-[#EDF4E4] border-[#778C59] ring-1 ring-[#778C59]'
                      : 'bg-white border-[#E3DFD4] hover:border-[#B8CE90]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#292D27]">{p.title}</span>
                    <span className="text-xs font-semibold text-[#778C59]">
                      {pressureLevel === p.id && '선택됨'}
                    </span>
                  </div>
                  <p className="text-xs text-[#686E63] mt-1">{p.desc}</p>
                  <p className="text-[11px] font-medium text-[#586A41] bg-white/70 p-2 rounded-lg mt-2 italic">
                    {p.quote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 flex items-center space-x-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setStep(step - 1);
            }}
            className="min-h-[48px] px-5 rounded-2xl bg-[#F4F2E9] border border-[#E3DFD4] text-xs font-bold text-[#686E63] active:scale-95"
          >
            이전
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setStep(step + 1);
            }}
            className="flex-1 min-h-[48px] rounded-2xl bg-[#778C59] text-white text-xs font-bold shadow-soft active:scale-95"
          >
            다음으로
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 min-h-[48px] rounded-2xl bg-[#586A41] text-white text-xs font-bold shadow-soft active:scale-95"
          >
            미루지마 시작하기! 🚀
          </button>
        )}
      </div>
    </div>
  );
};
