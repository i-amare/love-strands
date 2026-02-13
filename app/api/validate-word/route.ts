// import englishWords from "an-array-of-english-words";
import { NextResponse } from 'next/server';
import fs from 'node:fs';
import wordListPath from 'word-list';

const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');
const wordSet = new Set(wordArray.map((word) => word.toUpperCase()));
const MIN_WORD_LENGTH = 4;

type ValidateWordPayload = {
  word?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ValidateWordPayload;
  const normalizedWord = payload.word?.trim().toUpperCase() ?? '';
  const isValid =
    normalizedWord.length >= MIN_WORD_LENGTH && wordSet.has(normalizedWord);

  return NextResponse.json({ valid: isValid });
}
