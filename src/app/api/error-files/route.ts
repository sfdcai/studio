import { run_terminal_command } from 'tools';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const command = 'ls media/error';
    const commandResponse = await run_terminal_command(command);

    if (commandResponse.status !== 'succeeded') {
      console.error(`Error listing error files: ${commandResponse.result}`);
      return NextResponse.json(
        { message: 'Failed to list error files', error: commandResponse.result },
        { status: 500 }
      );
    }

    const fileNames = commandResponse.result.split('\n').filter(name => name.trim() !== '');

    return NextResponse.json({ fileNames });
  } catch (error) {
    console.error('Error in /api/error-files:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred', error: (error as Error).message },
      { status: 500 }
    );
  }
}