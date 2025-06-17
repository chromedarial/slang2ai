// pages/api/speaking.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { prompt, history } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        ...history,
        { role: 'user', content: prompt },
      ],
      stream: false,
    });

    res.status(200).json({ response: completion.choices[0].message.content });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
}
