import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const command = 'rclone rc core/stats';
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      // rclone rcd not running is a common case, handle it gracefully
      if (stderr.includes('connection refused')) {
        return NextResponse.json({ status: 'Offline', error: 'Rclone daemon is not running.' });
      }
      // For other errors, return them
      return NextResponse.json({ status: 'Error', error: stderr.trim() }, { status: 500 });
    }
    
    const stats = JSON.parse(stdout);
    return NextResponse.json({ status: 'Online', ...stats });

  } catch (error: any) {
    // This catches errors if the 'rclone' command itself isn't found or exec fails
    if (error.code === 'ENOENT') {
       return NextResponse.json({ status: 'Error', error: "The 'rclone' command was not found." }, { status: 500 });
    }
    // Handle case where rclone rcd is not running
    if (error.stderr && error.stderr.includes('connection refused')) {
        return NextResponse.json({ status: 'Offline', error: 'Rclone daemon is not running.' });
    }
    console.error('Error getting rclone stats:', error);
    return NextResponse.json({ status: 'Error', error: 'Internal server error while fetching rclone stats.' }, { status: 500 });
  }
}
