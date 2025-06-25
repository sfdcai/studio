import { NextResponse } from 'next/server';
import { getSettings } from '@/app/(app)/settings/actions';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const settings = await getSettings();
    const stagingDir = settings.stagingDir;

    // Command to count files in the staging directory
    const command = `find ${stagingDir} -type f | wc -l`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error('Error counting files in staging directory:', stderr);
      return NextResponse.json({ error: 'Failed to get processing queue status.' }, { status: 500 });
    }

    const fileCount = parseInt(stdout.trim(), 10);
    
    return NextResponse.json({ fileCount });
  } catch (error) {
    console.error('Error getting processing queue status:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
