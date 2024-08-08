import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET() {
  return NextResponse.json({ message: 'Hello from the API!' });
}

export async function POST(request: Request) {
  console.log('post called')
  try {
    const { inputText } = await request.json();
    
    // Ensure the input is properly escaped to prevent command injection
    const escapedInput = inputText.replace(/"/g, '\\"');
    
    console.log('escapedinput', escapedInput)

    console.log('Executing Python script...');
    // Execute the Python script
    const { stdout, stderr } = await execPromise(`python summarize.py "${escapedInput}"`);

    if (stderr) {
      console.error('Python script error:', stderr);
      return NextResponse.json({ error: 'Error executing Python script' }, { status: 500 });
    }

    console.log('Python script output:', stdout);
    return NextResponse.json({ result: stdout.trim() });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
