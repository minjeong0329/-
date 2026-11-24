import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Task,
  UserPreferences,
  CharacterState,
  InventoryItem,
  FocusSession,
  DelayEvent,
  RewardTransaction,
  DelayAction,
  DelayReason,
  CharacterExpression,
} from './types';
import {
  storage,
  getTodayString,
  DEFAULT_PREFERENCES,
  DEFAULT_CHARACTER,
} from './lib/storage';
import { evaluateTaskDelay, DelayInterventionProposal } from './lib/delayEngine';
import { calculateRescheduleDiff, RescheduleDiffItem } from './lib/scheduler';
import { sound } from './lib/sound';

// Components
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { Toast, ToastMessage } from './components/common/Toast';
import { MirumiCharacter } from './components/character/MirumiCharacter';
import { SpeechBubble } from './components/character/SpeechBubble';
import { DateHeader } from './components/home/DateHeader';
import { WeeklyStrip } from './components/home/WeeklyStrip';
import { DailyProgressCard } from './components/home/DailyProgressCard';
import { ActiveTaskCard } from './components/home/ActiveTaskCard';
import { TimelineBlock } from './components/home/TimelineBlock';
import { ScheduleViewToggle, ScheduleViewMode } from './components/schedule/ScheduleViewToggle';
import { MonthView } from './components/schedule/MonthView';
import { WeekView } from './components/schedule/WeekView';
import { DayView } from './components/schedule/DayView';
import { TaskModal } from './components/schedule/TaskModal';
import { AutoScheduleModal } from './components/schedule/AutoScheduleModal';
import { FocusTimer } from './components/focus/FocusTimer';
import { BreakTimer } from './components/focus/BreakTimer';
import { DelayInterventionModal } from './components/delay/DelayInterventionModal';
import { RescheduleDiffModal } from './components/delay/RescheduleDiffModal';
import { CharacterRoom } from './components/manager/CharacterRoom';
import { ItemShop } from './components/manager/ItemShop';
import { StatisticsView } from './components/manager/StatisticsView';
import { PreferencesSettings } from './components/manager/PreferencesSettings';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // App Data States
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [character, setCharacter] = useState<CharacterState>(DEFAULT_CHARACTER);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [delayEvents, setDelayEvents] = useState<DelayEvent[]>([]);
  const [rewardTransactions, setRewardTransactions] = useState<RewardTransaction[]>([]);

  // Modals & UI States
  const [scheduleViewMode, setScheduleViewMode] = useState<ScheduleViewMode>('month');
  const [managerSubTab, setManagerSubTab] = useState<'room' | 'shop' | 'stats' | 'settings'>('room');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);
  const [isRescheduleDiffOpen, setIsRescheduleDiffOpen] = useState(false);
  const [rescheduleDiffs, setRescheduleDiffs] = useState<RescheduleDiffItem[]>([]);
  const [tempRescheduledTasks, setTempRescheduledTasks] = useState<Task[]>([]);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(null);

  // Character speech & dynamic state
  const [dynamicExpression, setDynamicExpression] = useState<CharacterExpression>('idle');
  const [customCharacterSpeech, setCustomCharacterSpeech] = useState<string | undefined>(undefined);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // 1. Initial Storage Load
  useEffect(() => {
    const initApp = async () => {
      await storage.init();
      const [prefs, char, tList, inv, sessions, delays, txs] = await Promise.all([
        storage.loadPreferences(),
        storage.loadCharacter(),
        storage.loadTasks(),
        storage.loadInventory(),
        storage.loadFocusSessions(),
        storage.loadDelayEvents(),
        storage.loadRewardTransactions(),
      ]);

      setPreferences(prefs);
      setCharacter(char);
      setTasks(tList);
      setInventory(inv);
      setFocusSessions(sessions);
      setDelayEvents(delays);
      setRewardTransactions(txs);

      if (!prefs.hasCompletedOnboarding) {
        setIsOnboardingOpen(true);
      }

      setIsLoaded(true);
    };

    initApp();
  }, []);

  // Compute Today Tasks & Completion
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => (t.assignedDate || t.deadlineDate) === selectedDate);
  }, [tasks, selectedDate]);

  const completedTodayTasks = useMemo(() => {
    return todayTasks.filter((t) => t.status === 'completed');
  }, [todayTasks]);

  // Compute Next/Active Task for Today
  const activeTask = useMemo<Task | null>(() => {
    if (activeFocusTaskId) {
      const found = tasks.find((t) => t.id === activeFocusTaskId);
      if (found && found.status !== 'completed') return found;
    }
    // Find first uncompleted task for selected date
    const uncompleted = todayTasks.filter((t) => t.status !== 'completed');
    if (uncompleted.length === 0) return null;

    // Prioritize in_progress, then sorted by startTime
    const inProg = uncompleted.find((t) => t.status === 'in_progress');
    if (inProg) return inProg;

    return [...uncompleted].sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    })[0];
  }, [tasks, todayTasks, activeFocusTaskId]);

  // Procrastination Engine evaluation
  const delayProposal = useMemo<DelayInterventionProposal>(() => {
    if (!activeTask || preferences.isRestMode) {
      return {
        isInterventionNeeded: false,
        delayedMinutes: 0,
        stage: 'none',
        recommendedAction: 'start_5min',
        characterExpression: 'idle',
        message: '',
      };
    }
    return evaluateTaskDelay(activeTask, preferences.pressureLevel);
  }, [activeTask, preferences.pressureLevel, preferences.isRestMode]);

  // Update dynamic character expression based on current context
  useEffect(() => {
    if (todayTasks.length > 0 && completedTodayTasks.length === todayTasks.length) {
      setDynamicExpression('daily_goal_achieved');
    } else if (preferences.isRestMode) {
      setDynamicExpression('rest');
    } else if (activeTab === 'focus') {
      setDynamicExpression('focusing');
    } else if (delayProposal.isInterventionNeeded) {
      setDynamicExpression(delayProposal.characterExpression);
    } else if (activeTask) {
      setDynamicExpression('prompt');
    } else {
      setDynamicExpression('idle');
    }
  }, [
    todayTasks.length,
    completedTodayTasks.length,
    preferences.isRestMode,
    activeTab,
    delayProposal.isInterventionNeeded,
    delayProposal.characterExpression,
    activeTask,
  ]);

  // Periodic delay check (every 15s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (delayProposal.stage === 'reason_15m' || delayProposal.stage === 'reschedule_30m') {
        // Pop nudge sound
        sound.playNudge();
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [delayProposal.stage]);

  // XP & Level Progression System
  const awardXpAndPoints = useCallback(async (xp: number, points: number, desc: string, taskId: string | null = null) => {
    sound.playSuccess();
    setCharacter((prev) => {
      let newXp = prev.currentXp + xp;
      let newLevel = prev.level;
      let nextLevelXp = prev.xpToNextLevel;

      while (newXp >= nextLevelXp) {
        newXp -= nextLevelXp;
        newLevel += 1;
        nextLevelXp = Math.round(nextLevelXp * 1.35);
        sound.playLevelUp();
        addToast(`🎉 축하합니다! ${prev.name}가 Lv.${newLevel}로 성장했어요!`, 'success');
      }

      const updated: CharacterState = {
        ...prev,
        level: newLevel,
        currentXp: newXp,
        xpToNextLevel: nextLevelXp,
        totalPoints: prev.totalPoints + points,
      };

      storage.saveCharacter(updated);
      return updated;
    });

    const tx: RewardTransaction = {
      id: `tx_${Date.now()}`,
      taskId,
      source: 'task_complete',
      pointsDelta: points,
      xpDelta: xp,
      timestamp: new Date().toISOString(),
      description: desc,
    };
    setRewardTransactions((prev) => [...prev, tx]);
    await storage.saveRewardTransaction(tx);
    addToast(`+${points}P 씨앗 포인트 획득! (${desc})`, 'success');
  }, [addToast]);

  // Task Complete Toggle with Duplicate Reward Prevention
  const handleToggleComplete = useCallback(async (task: Task) => {
    const isNowCompleted = task.status !== 'completed';
    const updatedTask: Task = {
      ...task,
      status: isNowCompleted ? 'completed' : 'scheduled',
      completedAt: isNowCompleted ? new Date().toISOString() : null,
      actualMinutes: isNowCompleted && task.actualMinutes === 0 ? task.estimatedMinutes : task.actualMinutes,
    };

    // Check duplicate reward protection
    if (isNowCompleted && !task.rewardAwarded) {
      updatedTask.rewardAwarded = true;
      awardXpAndPoints(30, 20, `작업 완료: ${task.title}`, task.id);
    }

    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    await storage.saveTask(updatedTask);
  }, [awardXpAndPoints]);

  // Save Task (Add or Edit)
  const handleSaveTask = async (taskData: Partial<Task>) => {
    const isEditing = tasks.some((t) => t.id === taskData.id);
    let newTask: Task;

    if (isEditing) {
      newTask = { ...tasks.find((t) => t.id === taskData.id)!, ...taskData } as Task;
    } else {
      newTask = taskData as Task;
    }

    setTasks((prev) => {
      const exists = prev.some((t) => t.id === newTask.id);
      return exists ? prev.map((t) => (t.id === newTask.id ? newTask : t)) : [...prev, newTask];
    });

    await storage.saveTask(newTask);
    addToast(isEditing ? '작업이 수정되었습니다.' : '새 작업이 등록되었습니다.', 'success');
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await storage.deleteTask(id);
    addToast('작업이 삭제되었습니다.');
  };

  // Delay Intervention Chosen Action Handler
  const handleDelayAction = (action: DelayAction, reason: DelayReason = 'unspecified') => {
    if (!activeTask) return;

    // Log delay event
    const event: DelayEvent = {
      id: `delay_${Date.now()}`,
      taskId: activeTask.id,
      taskTitle: activeTask.title,
      scheduledStartTime: activeTask.startTime || new Date().toISOString(),
      delayedMinutes: delayProposal.delayedMinutes,
      reason,
      chosenAction: action,
      timestamp: new Date().toISOString(),
    };

    setDelayEvents((prev) => [...prev, event]);
    storage.saveDelayEvent(event);

    if (action === 'start_5min') {
      setActiveFocusTaskId(activeTask.id);
      setActiveTab('focus');
      addToast('🌱 5분 미세 시작 모드로 전환합니다!', 'success');
    } else if (action === 'snooze_5' || action === 'snooze_10' || action === 'snooze_30') {
      const snoozeMins = action === 'snooze_5' ? 5 : action === 'snooze_10' ? 10 : 30;
      const now = new Date();
      now.setMinutes(now.getMinutes() + snoozeMins);
      const newTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const updated = { ...activeTask, startTime: newTime };
      setTasks((prev) => prev.map((t) => (t.id === activeTask.id ? updated : t)));
      storage.saveTask(updated);
      addToast(`시작 시간이 ${snoozeMins}분 뒤(${newTime})로 연기되었습니다.`);
    } else if (action === 'reschedule') {
      const result = calculateRescheduleDiff(tasks, preferences, selectedDate);
      setRescheduleDiffs(result.diffs);
      setTempRescheduledTasks(result.updatedTasks);
      setIsRescheduleDiffOpen(true);
    }
  };

  // Trigger Reschedule Modal
  const handleTriggerReschedule = () => {
    const result = calculateRescheduleDiff(tasks, preferences, selectedDate);
    setRescheduleDiffs(result.diffs);
    setTempRescheduledTasks(result.updatedTasks);
    setIsRescheduleDiffOpen(true);
  };

  // Confirm Reschedule
  const handleConfirmReschedule = async () => {
    setTasks(tempRescheduledTasks);
    for (const t of tempRescheduledTasks) {
      await storage.saveTask(t);
    }
    addToast('남은 일정이 현실적인 시간대로 재배치되었습니다!', 'success');
  };

  // Complete Focus Session
  const handleCompleteFocusSession = async (
    task: Task,
    durationSeconds: number,
    mode: '5min' | '25min' | 'custom'
  ) => {
    const session: FocusSession = {
      id: `session_${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      mode,
      targetMinutes: mode === '5min' ? 5 : mode === '25min' ? 25 : 45,
      actualSeconds: durationSeconds,
      startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      completed: true,
      category: task.category,
    };

    setFocusSessions((prev) => [...prev, session]);
    await storage.saveFocusSession(session);

    // Update actualMinutes on task
    const addedMinutes = Math.max(1, Math.round(durationSeconds / 60));
    const updatedTask = {
      ...task,
      actualMinutes: (task.actualMinutes || 0) + addedMinutes,
    };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    await storage.saveTask(updatedTask);

    // Award XP
    const xp = mode === '5min' ? 15 : mode === '25min' ? 50 : 40;
    const pts = mode === '5min' ? 10 : mode === '25min' ? 30 : 25;
    awardXpAndPoints(xp, pts, `${mode} 집중 세션 달성`, task.id);

    // Prompt break timer
    setIsBreakMode(true);
  };

  // Shop purchase
  const handlePurchaseItem = async (item: InventoryItem) => {
    if (character.totalPoints < item.price) return;

    setCharacter((prev) => {
      const updated = {
        ...prev,
        totalPoints: prev.totalPoints - item.price,
      };
      storage.saveCharacter(updated);
      return updated;
    });

    const updatedInv = inventory.map((i) => (i.id === item.id ? { ...i, isPurchased: true } : i));
    setInventory(updatedInv);
    await storage.saveInventoryItem({ ...item, isPurchased: true });
    addToast(`'${item.name}' 구매 완료! 방 꾸미기에서 착용해 보세요.`, 'success');
  };

  // Equip / Unequip
  const handleToggleEquip = async (item: InventoryItem) => {
    if (item.type === 'accessory') {
      const nextAcc = character.equippedAccessory === item.id ? null : item.id;
      const updated = { ...character, equippedAccessory: nextAcc };
      setCharacter(updated);
      await storage.saveCharacter(updated);
    } else {
      const list = character.equippedRoomItems || [];
      const nextList = list.includes(item.id)
        ? list.filter((id) => id !== item.id)
        : [...list, item.id];
      const updated = { ...character, equippedRoomItems: nextList };
      setCharacter(updated);
      await storage.saveCharacter(updated);
    }
  };

  // Reset Data Handler
  const handleResetData = async () => {
    localStorage.clear();
    setPreferences(DEFAULT_PREFERENCES);
    setCharacter(DEFAULT_CHARACTER);
    setTasks([]);
    setFocusSessions([]);
    setDelayEvents([]);
    setIsOnboardingOpen(true);
    addToast('초기화가 완료되었습니다.');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex flex-col items-center justify-center p-4">
        <MirumiCharacter expression="idle" size={100} />
        <p className="text-xs font-bold text-[#778C59] mt-3 animate-pulse">
          미루지마!(MIRUMA) 로딩 중...
        </p>
      </div>
    );
  }

  return (
    <div className="mobile-app-shell">
      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Header */}
      <Header
        character={character}
        preferences={preferences}
        onToggleRestMode={() => {
          const next = !preferences.isRestMode;
          const updated = { ...preferences, isRestMode: next };
          setPreferences(updated);
          storage.savePreferences(updated);
          addToast(next ? '휴식 모드가 켜졌습니다. 편안하게 쉬세요!' : '휴식 모드가 해제되었습니다.');
        }}
        onOpenNotifications={() => {
          setActiveTab('manager');
          setManagerSubTab('settings');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-2 pb-24 space-y-4 overflow-x-hidden">
        {/* TAB 1: TODAY (HOME) */}
        {activeTab === 'today' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Date Header with quick action buttons */}
            <DateHeader
              selectedDate={selectedDate}
              onAddTask={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              onAutoSchedule={() => setIsAutoScheduleOpen(true)}
            />

            {/* Weekly Navigation Strip */}
            <WeeklyStrip
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
              completionMap={{
                [getTodayString()]: todayTasks.length > 0 ? Math.round((completedTodayTasks.length / todayTasks.length) * 100) : 0,
              }}
            />

            {/* Character & Speech Hero Section */}
            <div className="bg-white p-4 rounded-3xl border border-[#E3DFD4] shadow-soft flex items-center justify-between relative overflow-hidden">
              <div className="flex-1 pr-2">
                <SpeechBubble
                  expression={dynamicExpression}
                  pressureLevel={preferences.pressureLevel}
                  characterName={character.name}
                  activeTaskTitle={activeTask?.title}
                  delayedMinutes={delayProposal.delayedMinutes}
                  customMessage={customCharacterSpeech}
                />
              </div>

              <MirumiCharacter
                expression={dynamicExpression}
                equippedAccessory={character.equippedAccessory}
                size={110}
                onClick={() => {
                  sound.playClick();
                  const wittyQuotes = [
                    '지금 행동하는 5분이 내일의 5시간을 아껴줘요! 🌱',
                    '조금 쉬었다 가도 괜찮아요. 대신 포기만 하지 말기!',
                    '버튼 누르셨나요? 오늘 계획도 멋지게 끝내봐요!',
                    '씨앗 포인트를 모아서 제 방을 예쁘게 꾸며주세요! ✨',
                  ];
                  const randomQuote = wittyQuotes[Math.floor(Math.random() * wittyQuotes.length)];
                  setCustomCharacterSpeech(randomQuote);
                  setTimeout(() => setCustomCharacterSpeech(undefined), 5000);
                }}
              />
            </div>

            {/* Daily Goal Completion Rate */}
            <DailyProgressCard
              totalCount={todayTasks.length}
              completedCount={completedTodayTasks.length}
              characterName={character.name}
            />

            {/* Highlighted Active / Next Task Card */}
            <ActiveTaskCard
              task={activeTask}
              delayedMinutes={delayProposal.delayedMinutes}
              onStartFocus={(t) => {
                setActiveFocusTaskId(t.id);
                setActiveTab('focus');
              }}
              onOpenDelayIntervention={() => setIsDelayModalOpen(true)}
            />

            {/* Chronological Timeline List */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#292D27]">오늘의 일정 타임라인</h3>
                <button
                  onClick={handleTriggerReschedule}
                  className="text-xs font-semibold text-[#778C59] hover:underline"
                >
                  지연 일정 재배치
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl border border-dashed border-[#DDD9CE] text-center space-y-2">
                  <p className="text-xs text-[#858B7E]">오늘 등록된 일정이 없습니다.</p>
                  <button
                    onClick={() => {
                      setTaskToEdit(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="min-h-[40px] px-4 rounded-xl bg-[#778C59] text-white text-xs font-bold shadow-soft"
                  >
                    + 첫 일정 등록하기
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((t) => (
                    <TimelineBlock
                      key={t.id}
                      task={t}
                      onToggleComplete={handleToggleComplete}
                      onSelectTask={(selected) => {
                        setTaskToEdit(selected);
                        setIsTaskModalOpen(true);
                      }}
                      onDeleteTask={handleDeleteTask}
                      onStartFocus={(selected) => {
                        setActiveFocusTaskId(selected.id);
                        setActiveTab('focus');
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE (월간, 주간, 일간 탐색) */}
        {activeTab === 'schedule' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header & View Toggle */}
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-lg font-black text-[#292D27]">일정 관리</h2>
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="min-h-[36px] px-3 rounded-xl bg-[#778C59] text-white text-xs font-bold"
              >
                + 새 작업
              </button>
            </div>

            <ScheduleViewToggle viewMode={scheduleViewMode} onChangeView={setScheduleViewMode} />

            {/* View Switching */}
            {scheduleViewMode === 'month' && (
              <MonthView
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
                tasks={tasks}
              />
            )}

            {scheduleViewMode === 'week' && (
              <WeekView
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
                tasks={tasks}
              />
            )}

            {scheduleViewMode === 'day' && (
              <DayView
                selectedDate={selectedDate}
                tasks={tasks}
                wakeTime={preferences.wakeTime}
                sleepTime={preferences.sleepTime}
                onSelectTask={(selected) => {
                  setTaskToEdit(selected);
                  setIsTaskModalOpen(true);
                }}
              />
            )}
          </div>
        )}

        {/* TAB 3: FOCUS (집중 모드 & 휴식 타이머) */}
        {activeTab === 'focus' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-lg font-black text-[#292D27] pt-1">집중 모드</h2>

            {isBreakMode ? (
              <BreakTimer
                onFinishBreak={() => setIsBreakMode(false)}
                defaultMinutes={preferences.breakDuration}
              />
            ) : (
              <FocusTimer
                activeTask={activeTask}
                onCompleteSession={handleCompleteFocusSession}
                onStartBreak={() => setIsBreakMode(true)}
                onSelectTaskToFocus={() => {
                  setActiveTab('today');
                  addToast('집중할 작업을 목록에서 선택해 주세요.');
                }}
              />
            )}
          </div>
        )}

        {/* TAB 4: MANAGER (캐릭터 룸, 상점, 통계, 설정) */}
        {activeTab === 'manager' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-lg font-black text-[#292D27] pt-1">매니저 센터</h2>

            {/* Subtabs */}
            <div className="flex bg-[#EFECE3] p-1 rounded-xl">
              {[
                { id: 'room' as const, label: '🏡 미루미의 방' },
                { id: 'shop' as const, label: '🛒 씨앗 상점' },
                { id: 'stats' as const, label: '📊 통계 분석' },
                { id: 'settings' as const, label: '⚙️ 설정' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    sound.playClick();
                    setManagerSubTab(st.id);
                  }}
                  className={`flex-1 min-h-[38px] text-[11px] font-bold rounded-lg transition-all ${
                    managerSubTab === st.id
                      ? 'bg-white text-[#292D27] shadow-sm'
                      : 'text-[#686E63]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Subtab Views */}
            {managerSubTab === 'room' && (
              <CharacterRoom
                character={character}
                inventory={inventory}
                onToggleEquip={handleToggleEquip}
              />
            )}

            {managerSubTab === 'shop' && (
              <ItemShop
                character={character}
                inventory={inventory}
                onPurchase={handlePurchaseItem}
              />
            )}

            {managerSubTab === 'stats' && (
              <StatisticsView
                tasks={tasks}
                focusSessions={focusSessions}
                delayEvents={delayEvents}
              />
            )}

            {managerSubTab === 'settings' && (
              <PreferencesSettings
                preferences={preferences}
                onUpdate={(newPrefs) => {
                  const updated = { ...preferences, ...newPrefs };
                  setPreferences(updated);
                  storage.savePreferences(updated);
                  addToast('설정이 저장되었습니다.', 'success');
                }}
                onResetData={handleResetData}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        defaultDate={selectedDate}
      />

      <AutoScheduleModal
        isOpen={isAutoScheduleOpen}
        onClose={() => setIsAutoScheduleOpen(false)}
        tasks={tasks}
        preferences={preferences}
        selectedDate={selectedDate}
        onApplySchedule={async (updatedTasks) => {
          setTasks(updatedTasks);
          for (const t of updatedTasks) {
            await storage.saveTask(t);
          }
          addToast('자동 일정이 성공적으로 반영되었습니다!', 'success');
        }}
      />

      <RescheduleDiffModal
        isOpen={isRescheduleDiffOpen}
        onClose={() => setIsRescheduleDiffOpen(false)}
        diffs={rescheduleDiffs}
        onConfirm={handleConfirmReschedule}
      />

      <DelayInterventionModal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        task={activeTask}
        delayedMinutes={delayProposal.delayedMinutes}
        pressureLevel={preferences.pressureLevel}
        characterName={character.name}
        onAction={handleDelayAction}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={(newPrefs) => {
          const updated = { ...preferences, ...newPrefs };
          setPreferences(updated);
          storage.savePreferences(updated);
          setIsOnboardingOpen(false);
          addToast(`${updated.characterName}와 함께 미루기를 극복해 봐요!`, 'success');
        }}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasActiveTask={activeTask !== null && activeTask.status !== 'completed'}
      />
    </div>
  );
}
