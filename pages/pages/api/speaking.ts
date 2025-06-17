import { NextRequest } from 'next/server';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4', // o 'gpt-3.5-turbo' si prefieres
    messages,
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
