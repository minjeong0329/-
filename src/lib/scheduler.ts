import { Task, UserPreferences, ScheduleBlock, FocusSlot } from '../types';

export interface TimeSlot {
  startMinutes: number; // minutes from 00:00 (e.g. 09:30 = 570)
  endMinutes: number;
}

export interface AutoScheduleResult {
  scheduledTasks: Task[];
  unassignedTasks: Task[];
  scheduleBlocks: ScheduleBlock[];
  totalAvailableMinutes: number;
  totalPlannedMinutes: number;
}

export interface RescheduleDiffItem {
  taskId: string;
  title: string;
  oldStartTime: string | null;
  newStartTime: string | null;
  oldEndTime: string | null;
  newEndTime: string | null;
  isOverflow: boolean;
}

// Convert "HH:mm" to minutes from 00:00
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Convert minutes from 00:00 to "HH:mm"
export function minutesToTime(totalMins: number): string {
  const normalized = Math.max(0, Math.min(1439, totalMins));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Get focus slot category for a given minute
function getSlotForMinute(minute: number): FocusSlot {
  const hour = Math.floor(minute / 60);
  if (hour >= 9 && hour < 12) return 'morning';
  if (hour >= 13 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// Smart Auto Schedule Generator
export function generateAutoSchedule(
  tasks: Task[],
  preferences: UserPreferences,
  targetDate: string
): AutoScheduleResult {
  const wakeMins = timeToMinutes(preferences.wakeTime || '07:30');
  const sleepMins = timeToMinutes(preferences.sleepTime || '23:30');

  // Filter tasks for this date (excluding already completed)
  const candidateTasks = tasks.filter((t) => {
    const isTarget = (t.assignedDate || t.deadlineDate) === targetDate;
    return isTarget && t.status !== 'completed' && t.status !== 'cancelled';
  });

  // Separate fixed vs flexible
  const fixedTasks = candidateTasks.filter((t) => t.isFixed && t.startTime);
  const flexibleTasks = candidateTasks.filter((t) => !t.isFixed || !t.startTime);

  // Build busy intervals from fixed tasks
  const busySlots: TimeSlot[] = fixedTasks.map((t) => {
    const start = timeToMinutes(t.startTime!);
    const duration = t.estimatedMinutes || 30;
    const end = t.endTime ? timeToMinutes(t.endTime) : start + duration;
    return { startMinutes: start, endMinutes: end };
  });

  // Sort busy slots
  busySlots.sort((a, b) => a.startMinutes - b.startMinutes);

  // Compute free slots between wakeTime and sleepTime
  const freeSlots: TimeSlot[] = [];
  let pointer = wakeMins;

  for (const busy of busySlots) {
    if (busy.startMinutes > pointer) {
      freeSlots.push({
        startMinutes: pointer,
        endMinutes: Math.min(busy.startMinutes, sleepMins),
      });
    }
    pointer = Math.max(pointer, busy.endMinutes);
  }

  if (pointer < sleepMins) {
    freeSlots.push({
      startMinutes: pointer,
      endMinutes: sleepMins,
    });
  }

  // Calculate priority score for flexible tasks
  // Score = Importance (high: 30, med: 20, low: 10) + Deadline urgency (up to 30) + Preferred slot match bonus
  const scoredTasks = flexibleTasks.map((task) => {
    let score = 0;
    if (task.importance === 'high') score += 30;
    else if (task.importance === 'medium') score += 20;
    else score += 10;

    // Deadline urgency
    if (task.deadlineTime) {
      const deadlineMins = timeToMinutes(task.deadlineTime);
      const remainingUntilDeadline = deadlineMins - wakeMins;
      if (remainingUntilDeadline > 0) {
        score += Math.max(0, 30 - Math.floor(remainingUntilDeadline / 60));
      }
    }

    return { task: { ...task }, score };
  });

  // Sort tasks by score descending
  scoredTasks.sort((a, b) => b.score - a.score);

  const scheduledTasks: Task[] = [...fixedTasks];
  const unassignedTasks: Task[] = [];
  const scheduleBlocks: ScheduleBlock[] = [];

  // Add fixed task blocks
  fixedTasks.forEach((ft) => {
    scheduleBlocks.push({
      id: `block_fixed_${ft.id}`,
      taskId: ft.id,
      title: ft.title,
      category: ft.category,
      date: targetDate,
      startTime: ft.startTime!,
      endTime: ft.endTime || minutesToTime(timeToMinutes(ft.startTime!) + ft.estimatedMinutes),
      isFixed: true,
      isBreak: false,
      status: ft.status,
    });
  });

  let totalPlannedMinutes = fixedTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

  // Allocate flexible tasks into free slots
  const remainingFreeSlots = freeSlots.map((s) => ({ ...s }));

  for (const { task } of scoredTasks) {
    const requiredMins = task.estimatedMinutes || 30;
    let placed = false;

    for (let i = 0; i < remainingFreeSlots.length; i++) {
      const slot = remainingFreeSlots[i];
      const slotDuration = slot.endMinutes - slot.startMinutes;

      if (slotDuration >= requiredMins) {
        // Place task here
        const taskStartMins = slot.startMinutes;
        const taskEndMins = taskStartMins + requiredMins;

        task.assignedDate = targetDate;
        task.startTime = minutesToTime(taskStartMins);
        task.endTime = minutesToTime(taskEndMins);

        scheduledTasks.push(task);
        scheduleBlocks.push({
          id: `block_${task.id}`,
          taskId: task.id,
          title: task.title,
          category: task.category,
          date: targetDate,
          startTime: task.startTime,
          endTime: task.endTime,
          isFixed: false,
          isBreak: false,
          status: 'scheduled',
        });

        totalPlannedMinutes += requiredMins;

        // Add break buffer if room
        const breakMins = preferences.breakDuration || 5;
        const nextStart = taskEndMins + breakMins;

        if (nextStart < slot.endMinutes) {
          slot.startMinutes = nextStart;
        } else {
          // Slot is exhausted
          remainingFreeSlots.splice(i, 1);
        }

        placed = true;
        break;
      }
    }

    if (!placed) {
      // Cannot fit before sleep time without overloading
      unassignedTasks.push(task);
    }
  }

  // Sort schedule blocks chronologically
  scheduleBlocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const totalAvailableMinutes = freeSlots.reduce((acc, s) => acc + (s.endMinutes - s.startMinutes), 0);

  return {
    scheduledTasks,
    unassignedTasks,
    scheduleBlocks,
    totalAvailableMinutes,
    totalPlannedMinutes,
  };
}

// Reschedule remaining uncompleted tasks when delayed
export function calculateRescheduleDiff(
  tasks: Task[],
  preferences: UserPreferences,
  targetDate: string,
  startFromMinutes?: number
): { diffs: RescheduleDiffItem[]; updatedTasks: Task[] } {
  const now = new Date();
  const currentMinutes = startFromMinutes ?? (now.getHours() * 60 + now.getMinutes());
  // Round up to nearest 5 min boundary + 5 min buffer
  const effectiveStartMinutes = Math.ceil((currentMinutes + 5) / 5) * 5;

  const wakeMins = timeToMinutes(preferences.wakeTime || '07:30');
  const sleepMins = timeToMinutes(preferences.sleepTime || '23:30');

  const dayTasks = tasks.filter((t) => (t.assignedDate || t.deadlineDate) === targetDate);
  const completedTasks = dayTasks.filter((t) => t.status === 'completed');
  const fixedTasks = dayTasks.filter((t) => t.isFixed && t.status !== 'completed');
  const flexibleToReschedule = dayTasks.filter((t) => !t.isFixed && t.status !== 'completed');

  // Busy slots from fixed tasks that are still in the future
  const futureBusySlots: TimeSlot[] = fixedTasks
    .map((t) => {
      const start = timeToMinutes(t.startTime!);
      const duration = t.estimatedMinutes || 30;
      const end = t.endTime ? timeToMinutes(t.endTime) : start + duration;
      return { startMinutes: start, endMinutes: end };
    })
    .filter((s) => s.endMinutes > effectiveStartMinutes);

  futureBusySlots.sort((a, b) => a.startMinutes - b.startMinutes);

  // Free slots from effectiveStartMinutes to sleepMins
  const freeSlots: TimeSlot[] = [];
  let pointer = Math.max(effectiveStartMinutes, wakeMins);

  for (const busy of futureBusySlots) {
    if (busy.startMinutes > pointer) {
      freeSlots.push({
        startMinutes: pointer,
        endMinutes: Math.min(busy.startMinutes, sleepMins),
      });
    }
    pointer = Math.max(pointer, busy.endMinutes);
  }

  if (pointer < sleepMins) {
    freeSlots.push({
      startMinutes: pointer,
      endMinutes: sleepMins,
    });
  }

  // Allocate flexible tasks sequentially
  const diffs: RescheduleDiffItem[] = [];
  const updatedFlexibleTasks: Task[] = [];
  const remainingFreeSlots = freeSlots.map((s) => ({ ...s }));

  for (const task of flexibleToReschedule) {
    const oldStart = task.startTime;
    const oldEnd = task.endTime;
    const requiredMins = task.estimatedMinutes || 30;
    let placed = false;

    for (let i = 0; i < remainingFreeSlots.length; i++) {
      const slot = remainingFreeSlots[i];
      const slotDuration = slot.endMinutes - slot.startMinutes;

      if (slotDuration >= requiredMins) {
        const newStartMins = slot.startMinutes;
        const newEndMins = newStartMins + requiredMins;

        const updatedTask = {
          ...task,
          startTime: minutesToTime(newStartMins),
          endTime: minutesToTime(newEndMins),
          status: 'scheduled' as const,
        };

        updatedFlexibleTasks.push(updatedTask);
        diffs.push({
          taskId: task.id,
          title: task.title,
          oldStartTime: oldStart,
          newStartTime: updatedTask.startTime,
          oldEndTime: oldEnd,
          newEndTime: updatedTask.endTime,
          isOverflow: false,
        });

        const breakMins = preferences.breakDuration || 5;
        const nextStart = newEndMins + breakMins;
        if (nextStart < slot.endMinutes) {
          slot.startMinutes = nextStart;
        } else {
          remainingFreeSlots.splice(i, 1);
        }

        placed = true;
        break;
      }
    }

    if (!placed) {
      diffs.push({
        taskId: task.id,
        title: task.title,
        oldStartTime: oldStart,
        newStartTime: null,
        oldEndTime: oldEnd,
        newEndTime: null,
        isOverflow: true,
      });
      // Task could not fit before bedtime
      updatedFlexibleTasks.push({
        ...task,
        startTime: null,
        endTime: null,
      });
    }
  }

  const allUpdatedTasks = [
    ...tasks.filter((t) => (t.assignedDate || t.deadlineDate) !== targetDate),
    ...completedTasks,
    ...fixedTasks,
    ...updatedFlexibleTasks,
  ];

  return { diffs, updatedTasks: allUpdatedTasks };
}
