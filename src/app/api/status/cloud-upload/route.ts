import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // The command to check rclone daemon status
    const command = 'rclone rc core/stats';
    const { stdout } = await execAsync(command);
    
    // If command succeeds, parse stats and return
    const stats = JSON.parse(stdout);
    return NextResponse.json({ status: 'Online', ...stats });

  } catch (error: any) {
    // If the command fails for any reason, we analyze the error
    const errorMessage = error.stderr || error.message || '';

    // Case 1: rclone command not found
    if (error.code === 'ENOENT' || errorMessage.includes('not found')) {
       return NextResponse.json({ status: 'Error', error: "The 'rclone' command was not found on the system." });
    }
    
    // Case 2: rclone daemon (rcd) is not running
    if (errorMessage.includes('connection refused')) {
        return NextResponse.json({ status: 'Offline', error: 'The rclone remote control daemon is not running.' });
    }

    // Case 3: Any other rclone error
    console.error('An unexpected error occurred while fetching rclone stats:', error);
    return NextResponse.json({
        status: 'Error',
        error: 'An unknown error occurred while checking rclone status. Check server logs for details.',
        details: errorMessage 
    });
  }
}
