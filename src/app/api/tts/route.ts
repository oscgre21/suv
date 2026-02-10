import { NextResponse } from 'next/server';
import { generateSpeech } from '@/ai/flows/tts-flow';

export async function POST(req: Request) {
  const { text } = await req.json();
  const audio = await generateSpeech(text);
  return NextResponse.json(audio);
}
