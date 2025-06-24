'use server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export type Prerequisite = {
    name: string;
    command: string;
    status: 'Installed' | 'Not Found';
    helpText: string;
};

const prerequisites: Omit<Prerequisite, 'status'>[] = [
    { name: 'rclone', command: 'rclone', helpText: "Run 'sudo apt-get install rclone' and then 'rclone config'." },
    { name: 'ffmpeg', command: 'ffmpeg', helpText: "Run 'sudo apt-get install ffmpeg'." },
    { name: 'ImageMagick (convert)', command: 'convert', helpText: "Run 'sudo apt-get install imagemagick'." },
    { name: 'ExifTool', command: 'exiftool', helpText: "Run 'sudo apt-get install exiftool'." },
    { name: 'iCloudPD', command: 'icloudpd', helpText: "Run 'pip install --break-system-packages icloudpd'." },
];

export async function getSystemStatus(): Promise<Prerequisite[]> {
    const statusPromises = prerequisites.map(async (p) => {
        try {
            await execAsync(`which ${p.command}`);
            return { ...p, status: 'Installed' as const };
        } catch (error) {
            return { ...p, status: 'Not Found' as const };
        }
    });

    return Promise.all(statusPromises);
}

export async function runManualSync(): Promise<{ ok: boolean; message: string; output?: string; error?: string; }> {
    const scriptPath = path.join(process.cwd(), 'run_all.sh');
    try {
        // We use /bin/bash to ensure the script is executed with bash
        const { stdout, stderr } = await execAsync(`/bin/bash ${scriptPath}`, { cwd: process.cwd() });
        if (stderr) {
            console.warn('Manual sync process produced stderr:', stderr);
            return { ok: true, message: 'Sync completed with warnings. Check the Logs page for details.', output: stdout, error: stderr };
        }
        return { ok: true, message: 'Manual sync completed successfully! Check the File Explorer for new media.', output: stdout };
    } catch (e: any) {
        console.error('Failed to run manual sync:', e);
        // The error object from exec contains stdout and stderr which can be very useful for debugging
        return { ok: false, message: 'The sync script failed to execute.', error: e.stderr || e.stdout || e.message };
    }
}
