import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { sound } from '../../lib/sound';
import { AiService } from '../../lib/aiService';
import { KeyRound, Check, ExternalLink, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey?: string;
  currentProvider?: 'gemini' | 'openai';
  onSaveKey: (key: string, provider: 'gemini' | 'openai') => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey = '',
  currentProvider = 'gemini',
  onSaveKey,
}) => {
  const [apiKey, setApiKey] = useState(currentKey);
  const [provider, setProvider] = useState<'gemini' | 'openai'>(currentProvider || 'gemini');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: '먼저 API 키를 입력해 주세요.' });
      return;
    }
    sound.playClick();
    setTesting(true);
    setTestResult(null);

    const result = await AiService.testApiKey(apiKey, provider);
    setTesting(false);
    setTestResult(result);
    if (result.success) {
      sound.playSuccess();
    }
  };

  const handleSave = () => {
    sound.playSuccess();
    onSaveKey(apiKey.trim(), provider);
    onClose();
  };

  const handleRemove = () => {
    if (confirm('저장된 API 키를 삭제하시겠습니까?')) {
      sound.playClick();
      setApiKey('');
      setTestResult(null);
      onSaveKey('', provider);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI 서비스 API 키 설정"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Intro Banner */}
        <div className="bg-[#EDF4E4] p-3.5 rounded-2xl border border-[#B8CE90] flex items-start space-x-3">
          <KeyRound className="w-5 h-5 text-[#586A41] shrink-0 mt-0.5" />
          <div className="text-xs text-[#292D27] leading-relaxed">
            <span className="font-bold text-[#586A41] block mb-0.5">
              나만의 AI 비서 연결하기
            </span>
            Google Gemini(추천) 또는 OpenAI API 키를 입력하면, 자연어 일정 자동 분해 및 미루미 1:1 맞춤 코칭을 무제한으로 이용할 수 있습니다.
          </div>
        </div>

        {/* Provider Selector */}
        <div>
          <label className="text-xs font-bold text-[#292D27] block mb-1.5">
            AI 제공자 선택
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'gemini' as const, label: 'Google Gemini', badge: '무료 추천' },
              { id: 'openai' as const, label: 'OpenAI (ChatGPT)', badge: '유료 키' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setProvider(p.id);
                  setTestResult(null);
                }}
                className={`min-h-[44px] p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  provider === p.id
                    ? 'bg-[#EDF4E4] border-[#778C59] ring-1 ring-[#778C59]'
                    : 'bg-white border-[#E3DFD4] text-[#686E63]'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-[#292D27] block">{p.label}</span>
                  <span className="text-[10px] text-[#778C59] font-semibold">{p.badge}</span>
                </div>
                {provider === p.id && <Check className="w-4 h-4 text-[#778C59]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Free API Key Guide Box */}
        {provider === 'gemini' && (
          <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E3DFD4] space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-[#586A41]">
              <span>💡 1분 만에 무료 Gemini API 키 받는 방법</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-[#778C59] hover:underline"
              >
                <span>Google AI Studio 열기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[#686E63] text-[11px] leading-snug">
              <li>구글 계정으로 Google AI Studio에 접속합니다.</li>
              <li>파란색 <strong>'Create API key'</strong> 버튼을 클릭합니다.</li>
              <li>생성된 키를 복사하여 아래 입력창에 붙여넣기만 하면 끝! (카드 등록 불필요)</li>
            </ol>
          </div>
        )}

        {/* API Key Input */}
        <div>
          <label className="text-xs font-bold text-[#292D27] block mb-1">
            {provider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E3DFD4] rounded-xl text-xs font-mono text-[#292D27] focus:outline-none focus:border-[#778C59] pr-20"
            />
            {apiKey && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-2 top-2 px-2 py-1 text-[10px] font-semibold text-[#B35D43] bg-[#FDF0EB] rounded-lg"
              >
                삭제
              </button>
            )}
          </div>
        </div>

        {/* Connection Test Button & Feedback */}
        <div>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !apiKey.trim()}
            className="w-full min-h-[40px] rounded-xl bg-[#F4F2E9] border border-[#E3DFD4] text-xs font-bold text-[#586A41] flex items-center justify-center space-x-1.5 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? '연결 확인 중...' : 'API 키 연결 테스트'}</span>
          </button>

          {testResult && (
            <div
              className={`mt-2 p-2.5 rounded-xl text-xs font-medium flex items-start space-x-1.5 ${
                testResult.success
                  ? 'bg-[#EDF4E4] text-[#586A41] border border-[#B8CE90]'
                  : 'bg-[#FFF9F7] text-[#B35D43] border border-[#F8C8B9]'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Security & Privacy Notice */}
        <div className="flex items-center space-x-1.5 text-[11px] text-[#858B7E] pt-1">
          <ShieldCheck className="w-4 h-4 text-[#778C59] shrink-0" />
          <span>입력하신 API 키는 내 기기(브라우저 저장소)에만 안전하게 보관됩니다.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-4 rounded-xl bg-[#F4F2E9] border border-[#E3DFD4] text-xs font-bold text-[#686E63]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 min-h-[48px] rounded-xl bg-[#778C59] text-white text-xs font-bold shadow-soft flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>API 키 저장하기</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
