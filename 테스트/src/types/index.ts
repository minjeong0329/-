// Core Data Models for MIRUMA

export type Importance = 'high' | 'medium' | 'low';

export type TaskCategory = 'work' | 'study' | 'health' | 'living' | 'personal';

export type TaskStatus = 'scheduled' | 'in_progress' | 'paused' | 'delayed' | 'completed' | 'cancelled';

export type PressureLevel = 'mild' | 'normal' | 'spicy'; // 순한맛, 기본맛, 매운맛

export type FocusSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime: string; // HH:mm
  estimatedMinutes: number;
  actualMinutes: number;
  importance: Importance;
  category: TaskCategory;
  isFixed: boolean; // 고정 일정 여부
  memo: string;
  subtasks: Subtask[];
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
  assignedDate: string | null; // YYYY-MM-DD
  startTime: string | null; // HH:mm
  endTime: string | null; // HH:mm
  rewardAwarded?: boolean; // 중복 보상 방지
}

export interface ScheduleBlock {
  id: string;
  taskId: string | null;
  title: string;
  category: TaskCategory | 'break';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isFixed: boolean;
  isBreak: boolean;
  status: TaskStatus;
}

export interface UserPreferences {
  wakeTime: string; // e.g. "07:30"
  sleepTime: string; // e.g. "23:30"
  preferredFocusSlots: FocusSlot[];
  focusDuration: number; // minutes, e.g. 25
  breakDuration: number; // minutes, e.g. 5
  pressureLevel: PressureLevel;
  characterName: string;
  isRestMode: boolean; // 휴식 모드
  isNotificationsEnabled: boolean;
  hasCompletedOnboarding: boolean;
  geminiApiKey?: string;
  openaiApiKey?: string;
  aiProvider?: 'gemini' | 'openai';
}

export interface AiTaskParsedResult {
  title: string;
  estimatedMinutes: number;
  importance: Importance;
  category: TaskCategory;
  subtasks: string[];
  memo?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'mirumi';
  text: string;
  suggestedAction?: {
    type: 'start_5min' | 'create_task';
    label: string;
    taskData?: Partial<Task>;
  };
  timestamp: string;
}

export interface FocusSession {
  id: string;
  taskId: string | null;
  taskTitle: string;
  mode: '5min' | '25min' | 'custom';
  targetMinutes: number;
  actualSeconds: number;
  startedAt: string;
  endedAt: string;
  completed: boolean;
  category: TaskCategory;
}

export type DelayReason = 
  | 'reluctance'       // 하기 싫어요.
  | 'difficulty'       // 너무 어려워요.
  | 'other_work'       // 다른 일을 하고 있어요.
  | 'need_more_time'   // 시간이 더 필요해요.
  | 'unwell'           // 몸이 좋지 않아요.
  | 'unspecified';

export type DelayAction = 
  | 'start_5min'
  | 'snooze_5'
  | 'snooze_10'
  | 'snooze_30'
  | 'reschedule';

export interface DelayEvent {
  id: string;
  taskId: string;
  taskTitle: string;
  scheduledStartTime: string; // ISO
  delayedMinutes: number;
  reason: DelayReason;
  chosenAction: DelayAction;
  timestamp: string; // ISO
}

export type CharacterExpression = 
  | 'idle'                 // 기본 상태
  | 'prompt'               // 작업 시작 독려
  | 'delay_warning'        // 미루는 상황
  | 'repeated_delay'       // 반복적인 일정 지연
  | 'focusing'             // 집중하는 상황
  | 'completed'            // 작업 완료
  | 'rest'                 // 휴식 및 응원
  | 'daily_goal_achieved'; // 하루 목표 달성

export interface CharacterState {
  name: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  totalPoints: number;
  expressionState: CharacterExpression;
  equippedAccessory: string | null;
  equippedRoomItems: string[];
}

export interface RewardTransaction {
  id: string;
  taskId: string | null;
  source: 'task_complete' | 'focus_5min' | 'focus_25min' | 'focus_custom' | 'item_purchase';
  pointsDelta: number;
  xpDelta: number;
  timestamp: string;
  description: string;
}

export type InventoryItemType = 'accessory' | 'room';
export type InventorySlot = 'head' | 'face' | 'neck' | 'rug' | 'plant' | 'desk' | 'wall' | 'cushion';

export interface InventoryItem {
  id: string;
  name: string;
  type: InventoryItemType;
  slot: InventorySlot;
  price: number;
  isPurchased: boolean;
  description: string;
  icon: string;
}

// Category Meta definitions
export const CATEGORY_META: Record<TaskCategory, { label: string; color: string; bg: string; dot: string }> = {
  work: { label: '업무', color: '#586A41', bg: '#EDF4E4', dot: '#778C59' },
  study: { label: '공부', color: '#4B6B94', bg: '#EAF0F8', dot: '#5E81AC' },
  health: { label: '운동', color: '#B35D43', bg: '#FDF0EB', dot: '#E06C75' },
  living: { label: '생활', color: '#916B2D', bg: '#FAF3E3', dot: '#D08770' },
  personal: { label: '개인', color: '#73508C', bg: '#F3ECF8', dot: '#B48EAD' },
};
