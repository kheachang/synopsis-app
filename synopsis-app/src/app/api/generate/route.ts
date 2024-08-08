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
    const { inputText } = await request.json();

    const escapedInput = inputText.replace(/"/g, '\\"');

    const { stdout, stderr } = await execPromise(
      `python summarize.py "${escapedInput}"`
    );

    if (stderr) {
      throw new PythonScriptError(stderr);
    }

    return NextResponse.json({ result: stdout.trim() });
  } catch (error: unknown) {
    console.error("API route error:", error);

    if (error instanceof PythonScriptError) {
      return NextResponse.json(
        { error: "Python Script Error", details: error.message },
        { status: 500 }
      );
    } else if (error instanceof Error) {
      return NextResponse.json(
        { error: "Internal Server Error", details: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "Unknown Error", details: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
