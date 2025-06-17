import type { NextApiRequest, NextApiResponse } from 'next';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mode } = req.body;

  const prompts: Record<string, string> = {
    interview: 'Act as a job interviewer. Start the interview with a relevant question.',
    meeting: 'We are in a business meeting. Start by presenting a report or idea.',
    casual: 'Start a casual English conversation with a friendly tone.',
    resume: 'Continue the previous conversation naturally.',
  };

  const systemPrompt = prompts[mode] || prompts['casual'];

  try {
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: 'Please start the conversation.',
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await completion.json();

    if (data.choices?.[0]?.message?.content) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'Invalid response from OpenAI API', details: data });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to OpenAI', details: error });
  }
}
