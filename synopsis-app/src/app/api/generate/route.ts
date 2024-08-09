import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import summarize from "../../../summarize";

const execPromise = promisify(exec);

export async function GET() {
  return NextResponse.json({ message: "Hello from the API!" });
}

export async function POST(request: NextRequest) {
  try {
    const { inputText, numSentences } = await request.json();

    if (!inputText || typeof inputText !== "string") {
      return NextResponse.json(
        { error: "Invalid input text" },
        { status: 400 }
      );
    }

    const parsedNumSentences = parseInt(numSentences, 10);
    if (isNaN(parsedNumSentences) || parsedNumSentences < 1) {
      return NextResponse.json(
        { error: "Invalid number of sentences" },
        { status: 400 }
      );
    }

    // Use the JavaScript summarize function
    const summary = await summarize(inputText, parsedNumSentences);

    return NextResponse.json({ result: summary });
  } catch (error) {
    console.error("API route error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Internal server error", details: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        {
          error: "Internal server error",
          details: "An unknown error occurred",
        },
        { status: 500 }
      );
    }
  }
}
