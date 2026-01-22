const LONGCAT_API_KEY = 'ak_2Yp4WA49w88C76U1bl0qD3cx6Y68l';
const LONGCAT_API_URL = 'https://api.longcat.chat/openai/v1/chat/completions';
const MODEL = 'LongCat-Flash-Chat';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LongCatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const sendMessageToLongCat = async (
  messages: ChatMessage[],
  maxTokens: number = 2000,
  temperature: number = 0.7
): Promise<LongCatResponse> => {
  const response = await fetch(LONGCAT_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LONGCAT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.error?.message || error.message || 'Failed to get response from AI');
  }

  return await response.json();
};

