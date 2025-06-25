import { run_terminal_command } from 'tools';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const command = 'tail -n 50 media/logs/processing.log';
    const result: any = await run_terminal_command(command);

    if (result.status === 'succeeded') {
      return NextResponse.json({ logContent: result.output });
    } else {
      console.error('Error reading log file:', result.stderr);
      return NextResponse.json({ error: 'Failed to read log file' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read log file' }, { status: 500 });
  }
}