import { AiTaskParsedResult, PressureLevel, Task, TaskCategory, Importance } from '../types';

export class AiService {
  private static defaultGeminiModel = 'gemini-3.8-flash';

  /**
   * Test API key validity with a minimal ping
   */
  public static async testApiKey(
    apiKey: string,
    provider: 'gemini' | 'openai' = 'gemini'
  ): Promise<{ success: boolean; message: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'API 키가 입력되지 않았습니다.' };
    }

    try {
      if (provider === 'gemini') {
        // Try gemini-3.8-flash first, then fallback to gemini-2.5-flash / gemini-1.5-flash if needed
        const models = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
        let lastErr = '';

        for (const model of models) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Hello, respond with OK' }] }],
            }),
          });

          if (response.ok) {
            AiService.defaultGeminiModel = model;
            return { success: true, message: `Google Gemini (${model}) API 연결 성공! 정상 작동합니다.` };
          } else {
            const errData = await response.json().catch(() => ({}));
            lastErr = errData.error?.message || `HTTP ${response.status} 오류`;
          }
        }

        return { success: false, message: `Gemini API 연결 실패: ${lastErr}` };
      } else {
        // OpenAI test
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey.trim()}` },
        });

        if (!response.ok) {
          return { success: false, message: `OpenAI API 인증 실패 (상태 코드: ${response.status})` };
        }

        return { success: true, message: 'OpenAI API 연결 성공! 정상 작동합니다.' };
      }
    } catch (e: any) {
      return { success: false, message: `네트워크 또는 연결 오류: ${e.message}` };
    }
  }

  /**
   * Parse natural language input into structured task with subtasks
   */
  public static async parseNaturalLanguageTask(
    userInput: string,
    apiKey: string,
    provider: 'gemini' | 'openai' = 'gemini'
  ): Promise<AiTaskParsedResult> {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API 키가 설정되지 않았습니다. 매니저 설정에서 API 키를 등록해 주세요.');
    }

    const systemPrompt = `당신은 일정 관리 앱 '미루지마!(MIRUMA)'의 AI 비서입니다.
사용자가 자연어로 말한 할 일 내용을 분석하여, 사용자가 미루지 않고 행동할 수 있도록 작은 단위의 하위 작업(subtasks)을 포함한 JSON 형식으로 반환하세요.

응답 형식: 반드시 마크다운 백틱 없이 순수한 JSON 객체만 반환해야 합니다.
{
  "title": "요약된 간결한 작업명 (20자 이내)",
  "estimatedMinutes": 예상소요시간(분 단위 숫자, 15, 25, 30, 45, 60 등),
  "importance": "high" | "medium" | "low",
  "category": "work" | "study" | "health" | "living" | "personal",
  "subtasks": ["1단계: 5분 안에 할 수 있는 초소형 시작 행동", "2단계: 본 작업 핵심", "3단계: 마무리 및 검토"],
  "memo": "작업 수행에 도움되는 팁 또는 요약"
}`;

    const prompt = `${systemPrompt}\n\n사용자 입력: "${userInput}"`;

    let rawText = '';

    if (provider === 'gemini') {
      const models = [AiService.defaultGeminiModel, 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
      let succeeded = false;
      let lastErr = '';

      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            succeeded = true;
            AiService.defaultGeminiModel = model;
            break;
          } else {
            const err = await response.json().catch(() => ({}));
            lastErr = err.error?.message || `Gemini (${model}) 요청 실패`;
          }
        } catch (e: any) {
          lastErr = e.message;
        }
      }

      if (!succeeded) {
        throw new Error(lastErr || 'Gemini 요청 실패');
      }
    } else {
      // OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userInput },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI 요청 실패 (${response.status})`);
      }

      const data = await response.json();
      rawText = data.choices?.[0]?.message?.content || '';
    }

    try {
      // Clean JSON in case markdown block surrounds it
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const validCategories: TaskCategory[] = ['work', 'study', 'health', 'living', 'personal'];
      const category: TaskCategory = validCategories.includes(parsed.category) ? parsed.category : 'work';

      const validImportances: Importance[] = ['high', 'medium', 'low'];
      const importance: Importance = validImportances.includes(parsed.importance) ? parsed.importance : 'medium';

      return {
        title: parsed.title || userInput.slice(0, 20),
        estimatedMinutes: Number(parsed.estimatedMinutes) || 30,
        importance,
        category,
        subtasks: Array.isArray(parsed.subtasks) && parsed.subtasks.length > 0 ? parsed.subtasks : ['5분 동안 자료 및 도구 준비하기'],
        memo: parsed.memo || '',
      };
    } catch {
      return {
        title: userInput.slice(0, 25),
        estimatedMinutes: 30,
        importance: 'medium',
        category: 'work',
        subtasks: ['5분 동안 시작 준비하기'],
        memo: userInput,
      };
    }
  }

  /**
   * 1:1 Procrastination Counseling Dialogue with Mirumi Persona
   */
  public static async askMirumiCoach(
    userQuestion: string,
    context: {
      characterName: string;
      pressureLevel: PressureLevel;
      currentTasks: Task[];
      activeTask?: Task | null;
    },
    apiKey: string,
    provider: 'gemini' | 'openai' = 'gemini'
  ): Promise<{ reply: string; suggestedMicroAction?: string }> {
    if (!apiKey || !apiKey.trim()) {
      return {
        reply: `앗! 아직 API 키가 등록되지 않았어요. 설정(⚙️) 메뉴에서 무료 Google Gemini API 키를 입력해 주시면 저와 실시간으로 1:1 맞춤 대화를 나눌 수 있답니다! 지금은 딱 5분만 먼저 시도해 보세요! 🌱`,
        suggestedMicroAction: '5분 미세 시작 타이머 켜기',
      };
    }

    const { characterName, pressureLevel, activeTask } = context;

    let toneInstruction = '';
    if (pressureLevel === 'mild') {
      toneInstruction = '다정하고 따뜻한 격려체 (~해요, ~해볼까요?). 작은 노력도 칭찬하고 죄책감을 덜어주며 5분 미세 시작을 권장.';
    } else if (pressureLevel === 'spicy') {
      toneInstruction = '인격 비하 없이 날카롭고 유쾌한 팩트 폭격 (~하셨나요?, ~입니다!). 미룬 대가를 유머러스하게 지적하고 즉각적인 행동을 강력히 재촉.';
    } else {
      toneInstruction = '균형 잡힌 친절한 코칭 (~하세요, ~입니다). 공감과 긴장감을 적절히 배합.';
    }

    const activeTaskInfo = activeTask
      ? `현재 진행해야 할 작업: "${activeTask.title}" (${activeTask.estimatedMinutes}분 예정, 상태: ${activeTask.status})`
      : '현재 예정된 특정 긴급 작업 없음';

    const systemPrompt = `당신은 모바일 일정 관리 앱 '미루지마!'의 전속 캐릭터 매니저 '${characterName}'입니다. (사용 AI 모델: gemini-3.8-flash)
당신은 사용자가 일을 미루는 심리적 이유(두려움, 귀찮음, 막막함, 완벽주의)를 꿰뚫어보고, 지금 당장 5분 안에 실행할 수 있는 초소형 1단계 행동(Micro-action)을 제시해야 합니다.

캐릭터 말투 스타일:
${toneInstruction}

상황 정보:
${activeTaskInfo}

응답 규칙:
1. 답변은 3~4문장으로 모바일 화면에서 한눈에 읽히도록 간결하게 작성하세요.
2. 마지막에는 반드시 사용자가 '지금 1분 안에 누르거나 행동할 수 있는 초소형 1단계 행동'을 따옴표로 명확히 짚어주세요.
3. 반환 형식: 순수 텍스트로 친근하게 답변하세요.`;

    let reply = '';

    if (provider === 'gemini') {
      const models = [AiService.defaultGeminiModel, 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
      let succeeded = false;
      let lastErr = '';

      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { parts: [{ text: `${systemPrompt}\n\n사용자의 고민/질문: "${userQuestion}"` }] },
              ],
              generationConfig: { temperature: 0.7 },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            succeeded = true;
            AiService.defaultGeminiModel = model;
            break;
          } else {
            const err = await response.json().catch(() => ({}));
            lastErr = err.error?.message || `Gemini (${model}) 요청 실패`;
          }
        } catch (e: any) {
          lastErr = e.message;
        }
      }

      if (!succeeded) {
        throw new Error(lastErr || 'Gemini 요청 실패');
      }
    } else {
      // OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuestion },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI 요청 실패 (${response.status})`);
      }

      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || '';
    }

    return {
      reply: reply.trim(),
      suggestedMicroAction: '5분 미세 시작 모드로 시동 걸기',
    };
  }
}
