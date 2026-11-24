import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, Importance, Subtask } from '../../types';
import { Modal } from '../common/Modal';
import { sound } from '../../lib/sound';
import { Plus, Trash2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  taskToEdit?: Task | null;
  defaultDate: string; // YYYY-MM-DD
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(defaultDate);
  const [deadlineTime, setDeadlineTime] = useState('18:00');
  const [startTime, setStartTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [importance, setImportance] = useState<Importance>('medium');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [isFixed, setIsFixed] = useState(false);
  const [memo, setMemo] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDeadlineDate(taskToEdit.deadlineDate || defaultDate);
      setDeadlineTime(taskToEdit.deadlineTime || '18:00');
      setStartTime(taskToEdit.startTime || '');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 30);
      setImportance(taskToEdit.importance || 'medium');
      setCategory(taskToEdit.category || 'work');
      setIsFixed(taskToEdit.isFixed || false);
      setMemo(taskToEdit.memo || '');
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDeadlineDate(defaultDate);
      setDeadlineTime('18:00');
      setStartTime('');
      setEstimatedMinutes(30);
      setImportance('medium');
      setCategory('work');
      setIsFixed(false);
      setMemo('');
      setSubtasks([]);
    }
  }, [taskToEdit, defaultDate, isOpen]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    sound.playClick();
    setSubtasks([
      ...subtasks,
      { id: `sub_${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    sound.playClick();
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('작업 제목을 입력해 주세요.');
      return;
    }
    sound.playSuccess();
    onSave({
      id: taskToEdit ? taskToEdit.id : `task_${Date.now()}`,
      title: title.trim(),
      deadlineDate,
      deadlineTime,
      startTime: startTime || null,
      assignedDate: deadlineDate,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      importance,
      category,
      isFixed,
      memo: memo.trim(),
      subtasks,
      status: taskToEdit ? taskToEdit.status : 'scheduled',
      completedAt: taskToEdit ? taskToEdit.completedAt : null,
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString(),
      actualMinutes: taskToEdit ? taskToEdit.actualMinutes : 0,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? '작업 수정' : '새 일정 추가'}
    >
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="text-xs font-bold text-[#292D27] block mb-1">
            작업명 <span className="text-[#E06C75]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 보고서 초안 작성하기"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E3DFD4] rounded-xl text-sm font-semibold text-[#292D27] focus:outline-none focus:border-[#778C59]"
          />
        </div>

        {/* Category & Importance */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#292D27] block mb-1">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full px-3 py-2 bg-white border border-[#E3DFD4] rounded-xl text-xs font-semibold text-[#292D27]"
            >
              <option value="work">💼 업무</option>
              <option value="study">📚 공부</option>
              <option value="health">🏃 운동</option>
              <option value="living">🏠 생활</option>
              <option value="personal">🎨 개인</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#292D27] block mb-1">중요도</label>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value as Importance)}
              className="w-full px-3 py-2 bg-white border border-[#E3DFD4] rounded-xl text-xs font-semibold text-[#292D27]"
            >
              <option value="high">🔴 높음 (우선 처리)</option>
              <option value="medium">🟡 보통</option>
              <option value="low">🟢 낮음</option>
            </select>
          </div>
        </div>

        {/* Deadline & Estimated Minutes */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#292D27] block mb-1">마감 날짜</label>
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E3DFD4] rounded-xl text-xs font-semibold text-[#292D27]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#292D27] block mb-1">마감 시간</label>
            <input
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E3DFD4] rounded-xl text-xs font-semibold text-[#292D27]"
            />
          </div>
        </div>

        {/* Duration & Start Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#292D27] block mb-1">예상 소요 시간</label>
            <select
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-[#E3DFD4] rounded-xl text-xs font-semibold text-[#292D27]"
            >
              <option value={15}>15분</option>
              <option value={25}>25분</option>
              <option value={30}>30분</option>
              <option value={45}>45분</option>
              <option value={60}>1시간</option>
              <option value={90}>1시간 30분</option>
              <option value={120}>2시간</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#292D27] block mb-1">
              시작 시각 (지정 시 고정)
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E3DFD4] rounded-xl text-xs font-semibold text-[#292D27]"
            />
          </div>
        </div>

        {/* Fixed schedule toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E3DFD4]">
          <div>
            <span className="text-xs font-bold text-[#292D27] block">고정 일정 여부</span>
            <span className="text-[11px] text-[#686E63]">회의, 약속 등 변경 불가능한 일정</span>
          </div>
          <input
            type="checkbox"
            checked={isFixed}
            onChange={(e) => setIsFixed(e.target.checked)}
            className="w-5 h-5 accent-[#778C59] cursor-pointer"
          />
        </div>

        {/* Subtasks */}
        <div>
          <label className="text-xs font-bold text-[#292D27] block mb-1">
            하위 작업 (작은 덩어리로 쪼개기)
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
              placeholder="하위 작업 입력 후 추가"
              className="flex-1 px-3 py-1.5 bg-white border border-[#E3DFD4] rounded-xl text-xs text-[#292D27]"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="min-h-[36px] px-3 bg-[#EDF4E4] text-[#586A41] rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>추가</span>
            </button>
          </div>

          {subtasks.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-[#E8E5D8] text-xs"
                >
                  <span className="text-[#292D27] truncate pr-2">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-[#B35D43]/60 hover:text-[#B35D43]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Memo */}
        <div>
          <label className="text-xs font-bold text-[#292D27] block mb-1">세부 메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            placeholder="필요한 링크, 참고사항 등"
            className="w-full px-3 py-2 bg-white border border-[#E3DFD4] rounded-xl text-xs text-[#292D27] focus:outline-none focus:border-[#778C59]"
          />
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full min-h-[48px] rounded-2xl bg-[#778C59] text-white text-xs font-bold shadow-soft active:scale-95 transition-all"
        >
          {taskToEdit ? '수정 내용 저장' : '작업 등록하기'}
        </button>
      </div>
    </Modal>
  );
};
