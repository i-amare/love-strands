import { NextResponse } from "next/server";
// @ts-ignore
import checkWord from "check-word";

// Initialize dictionary
const words = checkWord("en");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { word } = body;

    if (!word || typeof word !== "string") {
      return NextResponse.json({ valid: false, error: "Invalid input" }, { status: 400 });
    }

    // Check if valid English word (case insensitive)
    const isValid = words.check(word.toLowerCase());

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Word validation error:", error);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
