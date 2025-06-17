// pages/api/speaking.ts

import type { NextRequest } from 'next/server';
import { OpenAIStream, Message } from '@/lib/OpenAIStream';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const body = await req.json();
  const messages: Message[] = body.messages;

  if (!messages) {
    return new Response('No messages provided', { status: 400 });
  }

  const stream = await OpenAIStream(messages);
  return new Response(stream);
}

