import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

class PythonScriptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PythonScriptError";
  }
}

export async function GET() {
  return NextResponse.json({ message: "Hello from the API!" });
}

export async function POST(request: Request) {
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

    // Ensure the input is properly escaped to prevent command injection
    const escapedInput = inputText.replace(/"/g, '\\"');

    // Execute the Python script with the number of sentences
    const { stdout, stderr } = await execPromise(
      `python summarize.py ${parsedNumSentences} "${escapedInput}"`
    );

    console.error("Python script errors:", stderr);

    if (stderr) {
      return NextResponse.json(
        { error: "Error executing Python script", details: stderr },
        { status: 500 }
      );
    }

    // Extract the actual summary from the output (assuming it comes after "Summary:")
    const summaryMatch = stdout.match(/Summary:\n([\s\S]*)/);
    const summary = summaryMatch ? summaryMatch[1].trim() : "";

    return NextResponse.json({ result: summary, debug: stdout });
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
