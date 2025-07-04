'use server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import type { Prerequisite } from '@/lib/types';

const execAsync = promisify(exec);

const prerequisitesList: Omit<Prerequisite, 'status' | 'path'>[] = [
    { name: 'ffmpeg', command: 'ffmpeg', helpText: "Run 'sudo apt-get install ffmpeg'." },
    { name: 'ImageMagick (convert)', command: 'convert', helpText: "Run 'sudo apt-get install imagemagick'." },
    { name: 'ExifTool', command: 'exiftool', helpText: "Run 'sudo apt-get install exiftool'." },
];

export async function getSystemStatus(): Promise<Prerequisite[]> {
    const statusPromises = prerequisitesList.map(async (p) => {
        try {
            const { stdout } = await execAsync(`which ${p.command}`);
            return { ...p, status: 'Installed' as const, path: stdout.trim() };
        } catch (error) {
            return { ...p, status: 'Not Found' as const };
        }
    });

    return Promise.all(statusPromises);
}

export async function runProcessing(): Promise<{ ok: boolean; message: string; output?: string; error?: string; }> {
    const scriptPath = path.join(process.cwd(), 'run_all.sh');
    try {
        // We use /bin/bash to ensure the script is executed with bash
        const { stdout, stderr } = await execAsync(`/bin/bash ${scriptPath}`, { cwd: process.cwd() });
        if (stderr) {
            console.warn('Processing script produced stderr:', stderr);
            // Don't treat stderr as a failure, as some tools write warnings here.
            // Let the user see it in the logs.
            return { ok: true, message: 'Processing completed with warnings. Check the Logs page for details.', output: stdout, error: stderr };
        }
        return { ok: true, message: 'Processing completed successfully! Check the File Explorer for new media.', output: stdout };
    } catch (e: any) {
        console.error('Failed to run processing script:', e);
        // The error object from exec contains stdout and stderr which can be very useful for debugging
        return { ok: false, message: `The processing script failed to execute. Looked for script at ${scriptPath}.`, error: e.stderr || e.stdout || e.message };
    }
}
