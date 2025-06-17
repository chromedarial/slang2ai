// lib/openai.ts

export type Message = {
  role: 'user' | 'system' | 'assistant';
  content: string;
};

export async function OpenAIStream(messages: Message[]) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OpenAI API key');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(await response.text());
  }

  return response.body;
}
