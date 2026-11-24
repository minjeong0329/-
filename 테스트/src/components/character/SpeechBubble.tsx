import React from 'react';
import { CharacterExpression, PressureLevel } from '../../types';

interface SpeechBubbleProps {
  expression: CharacterExpression;
  pressureLevel: PressureLevel;
  characterName: string;
  activeTaskTitle?: string | null;
  delayedMinutes?: number;
  className?: string;
  customMessage?: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  expression,
  pressureLevel,
  characterName,
  activeTaskTitle,
  delayedMinutes = 0,
  className = '',
  customMessage,
}) => {
  // Determine message based on expression and pressure level
  const getMessage = (): string => {
    if (customMessage) return customMessage;

    const taskName = activeTaskTitle || '다음 할 일';

    switch (expression) {
      case 'idle':
        if (pressureLevel === 'mild') {
          return `오늘도 무리하지 말고, 작은 것부터 차근차근 해봐요! 🌱`;
        } else if (pressureLevel === 'spicy') {
          return `오늘 일정 비워둘 생각은 아니죠? 어서 하나 골라봐요!`;
        }
        return `안녕하세요! 오늘 계획한 일들을 함께 시작해볼까요?`;

      case 'prompt':
        if (pressureLevel === 'mild') {
          return `지금 [${taskName}]을(를) 시작할 시간이에요. 5분만 먼저 시도해봐요!`;
        } else if (pressureLevel === 'spicy') {
          return `[${taskName}] 시작 시간 지났어요! 딴짓은 멈추고 지금 바로 출발!`;
        }
        return `[${taskName}] 시작 시간이에요! 지금 바로 시작해 볼까요?`;

      case 'delay_warning':
        if (pressureLevel === 'mild') {
          return `[${taskName}]이(가) ${delayedMinutes}분 지연 중이에요. 혹시 조금 쉬었다 갈까요?`;
        } else if (pressureLevel === 'spicy') {
          return `벌써 ${delayedMinutes}분이나 흘렀어요! 침대와 이별하고 버튼 누르세요!`;
        }
        return `[${taskName}] 시작이 ${delayedMinutes}분 늦어졌어요. 5분 시작 모드로 시동을 걸어볼까요?`;

      case 'repeated_delay':
        if (pressureLevel === 'mild') {
          return `일정이 계속 미뤄지고 있어요. 오늘 분량을 현실에 맞게 줄여볼까요?`;
        } else if (pressureLevel === 'spicy') {
          return `오늘 밤에 이불 킥 확정입니다! 미룬 일정 자동 재배치라도 먼저 누르세요!`;
        }
        return `일정이 30분 이상 지체되었어요. 지금 일정을 다시 정렬하는 것을 추천해요!`;

      case 'focusing':
        return `쉿! 지금은 [${taskName}]에 깊이 몰입하는 시간이에요. 파이팅! 🎧`;

      case 'completed':
        return `해냈다! 멋지게 완료하셨네요! 씨앗 포인트 획득! 🎉`;

      case 'rest':
        return `열심히 달렸으니 꿀맛 같은 휴식 타임! 기지개 한번 쭉 켜세요 ☕`;

      case 'daily_goal_achieved':
        return `오늘의 모든 목표를 완벽하게 달성했어요! ${characterName}가 격하게 칭찬해요! 👑`;

      default:
        return `작은 한 걸음이 미루기를 이기는 가장 빠른 방법이에요.`;
    }
  };

  return (
    <div className={`relative px-4 py-3 rounded-2xl bg-white border border-[#E3DFD4] shadow-soft max-w-[280px] ${className}`}>
      {/* Little tail pointing down towards Mirumi */}
      <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-b border-r border-[#E3DFD4] transform rotate-45" />

      <p className="text-[13.5px] leading-relaxed font-medium text-[#292D27] relative z-10 break-keep">
        {getMessage()}
      </p>
    </div>
  );
};
