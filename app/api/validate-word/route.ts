// import englishWords from "an-array-of-english-words";
import { NextResponse } from "next/server";

// const wordSet = new Set((englishWords as string[]).map((word) => word.toUpperCase()));
const MIN_WORD_LENGTH = 3;

type ValidateWordPayload = {
  word?: string;
};

export async function POST(request: Request) {
  // const payload = (await request.json()) as ValidateWordPayload;
  // const normalizedWord = payload.word?.trim().toUpperCase() ?? "";
  // const isValid = normalizedWord.length >= MIN_WORD_LENGTH && wordSet.has(normalizedWord);

  const ranNum = Math.round(Math.random()*100)
  const isValid = ranNum > 40

  return NextResponse.json({ valid: isValid });
}
