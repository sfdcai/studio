import { NextResponse } from 'next/server';
import { run_terminal_command } from '@/lib/tool-wrapper';

export async function GET() {
  try {
    const command = 'rclone rc core/stats';
    const result = await run_terminal_command(command);

    console.log('rclone rc core/stats result:', result); // Log the result for debugging

    if (result.status === 'succeeded') {
      try {
        const stats = JSON.parse(result.result || '{}');
        return NextResponse.json(stats); // Return the parsed stats
      } catch (parseError) {
        return NextResponse.json({ error: 'Failed to parse rclone stats output', details: result.result }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Failed to get rclone stats', details: result.result }, { status: 500 });
    }
  } catch (error) {
    console.error('Error getting rclone stats:', error);
    return NextResponse.json({ error: 'Internal server error while fetching rclone stats' }, { status: 500 });
  }
}