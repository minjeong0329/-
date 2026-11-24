import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { sound } from '../../lib/sound';
import { AiService } from '../../lib/aiService';
import { Task, PressureLevel, AiChatMessage, AiTaskParsedResult, CATEGORY_META } from '../../types';
import { MirumiCharacter } from '../character/MirumiCharacter';
import { Sparkles, Wand2, MessageCircle, Send, KeyRound, Plus, ArrowRight, Clock } from 'lucide-react';

interface AiCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey?: string;
  provider?: 'gemini' | 'openai';
  characterName: string;
  pressureLevel: PressureLevel;
  currentTasks: Task[];
  activeTask?: Task | null;
  selectedDate: string;
  onOpenApiKeyModal: () => void;
  onAddTask: (taskData: Partial<Task>) => void;
  onStart5MinFocus: (task: Task) => void;
}

export const AiCoachModal: React.FC<AiCoachModalProps> = ({
  isOpen,
  onClose,
  apiKey = '',
  provider = 'gemini',
  characterName,
  pressureLevel,
  currentTasks,
  activeTask,
  selectedDate,
  onOpenApiKeyModal,
  onAddTask,
  onStart5MinFocus,
}) => {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'chat'>('breakdown');

  // Breakdown state
  const [naturalText, setNaturalText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<AiTaskParsedResult | null>(null);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([
    {
      id: 'init_msg',
      sender: 'mirumi',
      text: `안녕하세요! ${characterName}예요. 무슨 일 때문에 망설여지시나요? 솔직한 고민을 말씀해 주시면 지금 당장 실천할 수 있는 5분 행동을 알려드릴게요! 🌱`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const hasApiKey = Boolean(apiKey && apiKey.trim());

  // 1. Natural Language Task Breakdown
  const handleBreakdownTask = async () => {
    if (!naturalText.trim()) return;
    if (!hasApiKey) {
      onOpenApiKeyModal();
      return;
    }

    sound.playClick();
    setIsParsing(true);
    setParsedResult(null);

    try {
      const result = await AiService.parseNaturalLanguageTask(naturalText, apiKey, provider);
      setParsedResult(result);
      sound.playSuccess();
    } catch (err: any) {
      alert(`AI 분석 오류: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  // 2. Add Parsed Task to Schedule
  const handleApplyParsedTask = () => {
    if (!parsedResult) return;
    sound.playSuccess();

    onAddTask({
      id: `task_ai_${Date.now()}`,
      title: parsedResult.title,
      estimatedMinutes: parsedResult.estimatedMinutes,
      importance: parsedResult.importance,
      category: parsedResult.category,
      isFixed: false,
      deadlineDate: selectedDate,
      deadlineTime: '18:00',
      assignedDate: selectedDate,
      memo: parsedResult.memo || `AI 자연어 자동 생성 (${naturalText})`,
      subtasks: parsedResult.subtasks.map((st, idx) => ({
        id: `sub_${Date.now()}_${idx}`,
        title: st,
        completed: false,
      })),
      status: 'scheduled',
      completedAt: null,
      createdAt: new Date().toISOString(),
      actualMinutes: 0,
    });

    setNaturalText('');
    setParsedResult(null);
    onClose();
  };

  // 3. Procrastination Chat
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    sound.playClick();
    const userMsg: AiChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput('');

    setIsChatting(true);

    try {
      const { reply, suggestedMicroAction } = await AiService.askMirumiCoach(
        textToSend,
        {
          characterName,
          pressureLevel,
          currentTasks,
          activeTask,
        },
        apiKey,
        provider
      );

      sound.playSuccess();
      const botMsg: AiChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'mirumi',
        text: reply,
        suggestedAction: suggestedMicroAction
          ? {
              type: 'start_5min',
              label: suggestedMicroAction,
            }
          : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'mirumi',
          text: `오류가 발생했어요: ${e.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="미루미 AI 비서 & 코칭"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* No API key alert banner */}
        {!hasApiKey && (
          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#D5E5B5] flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <KeyRound className="w-4 h-4 text-[#778C59] shrink-0" />
              <span className="font-semibold text-[#292D27]">
                Google Gemini API 키(무료)를 등록해 보세요!
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onOpenApiKeyModal();
              }}
              className="min-h-[36px] px-3 rounded-xl bg-[#778C59] text-white text-xs font-bold shrink-0 shadow-soft"
            >
              키 설정
            </button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex bg-[#EFECE3] p-1 rounded-xl">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('breakdown');
            }}
            className={`flex-1 min-h-[38px] text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'breakdown'
                ? 'bg-white text-[#292D27] shadow-sm'
                : 'text-[#686E63]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-[#778C59]" />
            <span>✨ AI 마법 일정 등록</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('chat');
            }}
            className={`flex-1 min-h-[38px] text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-[#292D27] shadow-sm'
                : 'text-[#686E63]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#778C59]" />
            <span>🌱 1:1 미루기 상담</span>
          </button>
        </div>

        {/* TAB 1: Natural Task Breakdown */}
        {activeTab === 'breakdown' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#292D27] block mb-1">
                할 일을 편하게 말하듯 적어보세요
              </label>
              <textarea
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder="예: 내일 오후 3시까지 마케팅 기획서 초안 작성하기. 자료 조사 30분, 피피티 1시간 걸릴 듯"
                rows={3}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E3DFD4] rounded-xl text-xs text-[#292D27] focus:outline-none focus:border-[#778C59] leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleBreakdownTask}
              disabled={isParsing || !naturalText.trim()}
              className="w-full min-h-[44px] rounded-xl bg-[#778C59] text-white text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-95 shadow-soft disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isParsing ? 'AI가 하위 작업으로 쪼개는 중...' : 'AI 분석 및 일정 자동 분해'}</span>
            </button>

            {/* Parsed Result Preview Card */}
            {parsedResult && (
              <div className="bg-white p-3.5 rounded-2xl border border-[#B8CE90] shadow-soft space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#586A41]">
                    분석 완료! 추천 일정 구성
                  </span>
                  <div className="flex items-center space-x-1">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: CATEGORY_META[parsedResult.category]?.bg,
                        color: CATEGORY_META[parsedResult.category]?.color,
                      }}
                    >
                      {CATEGORY_META[parsedResult.category]?.label}
                    </span>
                    <span className="text-[10px] font-semibold text-[#858B7E] flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-[#778C59]" />
                      {parsedResult.estimatedMinutes}분
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-[#292D27]">{parsedResult.title}</h4>

                {parsedResult.memo && (
                  <p className="text-[11px] text-[#686E63]">{parsedResult.memo}</p>
                )}

                {/* Subtasks Checklist */}
                <div>
                  <span className="text-[11px] font-bold text-[#292D27] block mb-1">
                    추천 3단계 하위 작업:
                  </span>
                  <div className="space-y-1">
                    {parsedResult.subtasks.map((st, i) => (
                      <div
                        key={i}
                        className="bg-[#F8F7F2] px-2.5 py-1.5 rounded-lg text-xs text-[#292D27] flex items-center space-x-2 border border-[#E8E5D8]"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#D5E5B5] text-[#586A41] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="truncate">{st}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyParsedTask}
                  className="w-full min-h-[44px] rounded-xl bg-[#586A41] text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-soft active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>이 작업을 일정에 바로 추가하기</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Procrastination Counseling Chat */}
        {activeTab === 'chat' && (
          <div className="space-y-3">
            {/* Quick Prompt Chips */}
            <div>
              <span className="text-[11px] font-semibold text-[#858B7E] block mb-1.5">
                자주 겪는 미루기 고민 (터치 시 질문)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '귀찮아서 손가락 하나 까딱하기 싫어요 🥱',
                  '막막해서 어디서부터 시작할지 몰라요 🥺',
                  '딴짓(유튜브/쇼츠)을 끊기가 힘들어요 📱',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendMessage(chip)}
                    disabled={isChatting}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E3DFD4] text-[11px] font-semibold text-[#292D27] hover:border-[#778C59] active:scale-95 disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Container */}
            <div className="h-56 overflow-y-auto bg-white p-3 rounded-2xl border border-[#E3DFD4] space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'mirumi' && (
                    <MirumiCharacter expression="idle" size={32} className="shrink-0 mt-1" />
                  )}

                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#778C59] text-white rounded-tr-none'
                        : 'bg-[#F4F2E9] text-[#292D27] rounded-tl-none border border-[#E8E5D8]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Suggested Action Button inside chat */}
                    {msg.suggestedAction && activeTask && (
                      <button
                        onClick={() => {
                          sound.playSuccess();
                          onStart5MinFocus(activeTask);
                          onClose();
                        }}
                        className="mt-2 w-full min-h-[32px] px-2.5 rounded-lg bg-[#778C59] text-white text-[11px] font-bold flex items-center justify-center space-x-1 shadow-sm active:scale-95"
                      >
                        <span>{msg.suggestedAction.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    <span className="text-[9px] text-right block mt-1 opacity-70">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isChatting && (
                <div className="flex items-center space-x-2 text-xs text-[#778C59] animate-pulse">
                  <MirumiCharacter expression="focusing" size={28} />
                  <span>{characterName}가 생각 중이에요... 🌱</span>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isChatting && handleSendMessage()}
                placeholder="고민이나 미루는 이유를 입력하세요..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-[#E3DFD4] rounded-xl text-xs text-[#292D27] focus:outline-none focus:border-[#778C59]"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isChatting || !chatInput.trim()}
                className="min-w-[44px] min-h-[44px] rounded-xl bg-[#778C59] text-white flex items-center justify-center active:scale-95 shadow-soft disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
