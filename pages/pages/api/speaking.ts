// pages/api/speaking.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIStream, Message } from '../../lib/openai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextApiRequest) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    const stream = await OpenAIStream(messages as Message[]);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
