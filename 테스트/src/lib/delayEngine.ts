import {
  Task,
  DelayReason,
  DelayAction,
  DelayEvent,
  PressureLevel,
  CharacterExpression
} from '../types';

export interface DelayInterventionProposal {
  isInterventionNeeded: boolean;
  delayedMinutes: number;
  stage: 'none' | 'prompt' | 'nudge_5m' | 'reason_15m' | 'reschedule_30m';
  recommendedAction: DelayAction;
  characterExpression: CharacterExpression;
  message: string;
}

// Check current time against task schedule to detect procrastination
export function evaluateTaskDelay(
  task: Task | null,
  pressureLevel: PressureLevel
): DelayInterventionProposal {
  if (!task || !task.assignedDate || !task.startTime || task.status === 'completed' || task.status === 'in_progress') {
    return {
      isInterventionNeeded: false,
      delayedMinutes: 0,
      stage: 'none',
      recommendedAction: 'start_5min',
      characterExpression: 'idle',
      message: '',
    };
  }

  const now = new Date();
  const [startHour, startMin] = task.startTime.split(':').map(Number);
  const scheduledDate = new Date(`${task.assignedDate}T${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`);

  const diffMs = now.getTime() - scheduledDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 0) {
    // Has not reached start time yet
    return {
      isInterventionNeeded: false,
      delayedMinutes: 0,
      stage: 'none',
      recommendedAction: 'start_5min',
      characterExpression: 'idle',
      message: '',
    };
  }

  // Stage 4: 30 minutes or more delayed -> Propose rescheduling
  if (diffMinutes >= 30) {
    return {
      isInterventionNeeded: true,
      delayedMinutes: diffMinutes,
      stage: 'reschedule_30m',
      recommendedAction: 'reschedule',
      characterExpression: 'repeated_delay',
      message: pressureLevel === 'spicy'
        ? `벌써 ${diffMinutes}분이나 밀렸어요! 이대로 두면 오늘 일정 다 터집니다. 남은 일정을 재배치할까요?`
        : `시작 예정 시각보다 ${diffMinutes}분이 지났어요. 현실적인 완주를 위해 일정을 새로 정렬해 볼까요?`,
    };
  }

  // Stage 3: 15 minutes or more delayed -> Ask delay reason and propose 5-min start
  if (diffMinutes >= 15) {
    return {
      isInterventionNeeded: true,
      delayedMinutes: diffMinutes,
      stage: 'reason_15m',
      recommendedAction: 'start_5min',
      characterExpression: 'delay_warning',
      message: pressureLevel === 'spicy'
        ? `${diffMinutes}분째 시작을 못하고 있어요! 무슨 일인지 이유를 골라주면 해결책을 드릴게요.`
        : `${diffMinutes}분 동안 시작이 멈춰있어요. 무엇 때문에 망설여지는지 알려주시면 도와드릴게요!`,
    };
  }

  // Stage 2: 5 minutes or more delayed -> Light character nudge
  if (diffMinutes >= 5) {
    return {
      isInterventionNeeded: true,
      delayedMinutes: diffMinutes,
      stage: 'nudge_5m',
      recommendedAction: 'start_5min',
      characterExpression: 'delay_warning',
      message: pressureLevel === 'spicy'
        ? `시작 시간에서 5분이 훌쩍 지났어요! 스마트폰 그만 보고 딱 5분만 시작해봐요!`
        : `시작한 지 5분이 지났어요. 가볍게 5분 모드로 첫 걸음을 떼볼까요?`,
    };
  }

  // Stage 1: Just reached start time (0-4 minutes) -> Friendly prompt
  return {
    isInterventionNeeded: false,
    delayedMinutes: diffMinutes,
    stage: 'prompt',
    recommendedAction: 'start_5min',
    characterExpression: 'prompt',
    message: `[${task.title}]을(를) 시작할 시간입니다!`,
  };
}

// Tailored solution based on chosen delay reason
export interface ReasonSolution {
  title: string;
  description: string;
  actionText: string;
  actionType: DelayAction;
}

export const REASON_SOLUTIONS: Record<DelayReason, ReasonSolution> = {
  reluctance: {
    title: '5분 미세 시작법 추천',
    description: '뇌는 시작할 때 가장 큰 에너지를 써요. 딱 5분만 하고 그만둬도 괜찮습니다. 5분만 켜볼까요?',
    actionText: '5분만 해보기',
    actionType: 'start_5min',
  },
  difficulty: {
    title: '작업 쪼개기 제안',
    description: '너무 방대해서 막막할 때는 첫 번째 하위 작업 1개만 끝낸다고 생각해요. 체크리스트를 확인해봐요.',
    actionText: '하위 작업으로 시작하기',
    actionType: 'start_5min',
  },
  other_work: {
    title: '단기 연기 모드',
    description: '현재 하고 계신 긴급한 작업을 먼저 매듭짓고, 15분 뒤에 다시 상기시켜 드릴게요.',
    actionText: '10분 뒤 다시 알림',
    actionType: 'snooze_10',
  },
  need_more_time: {
    title: '예상 시간 조정 및 일정 밀기',
    description: '충분한 시간을 확보할 수 있도록 소요 시간을 30분 늘리고 뒷일정을 자동으로 재배치합니다.',
    actionText: '일정 자동 재배치',
    actionType: 'reschedule',
  },
  unwell: {
    title: '휴식 모드 전환',
    description: '건강과 컨디션이 최우선이에요! 무리한 일정을 멈추고 오늘은 가벼운 작업만 남기거나 푹 쉬어요.',
    actionText: '오늘 일정 휴식 전환',
    actionType: 'reschedule',
  },
  unspecified: {
    title: '가벼운 5분 시작',
    description: '준비 운동하듯 5분만 타이머를 돌려보세요.',
    actionText: '5분 시작',
    actionType: 'start_5min',
  },
};
