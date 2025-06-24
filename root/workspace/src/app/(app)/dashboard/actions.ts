'use server';
import { exec } from 'child_process';
import { promisify } from 'util';

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
            // The `which` command is a standard way to check if a command exists in the system's PATH.
            await execAsync(`which ${p.command}`);
            return { ...p, status: 'Installed' as const };
        } catch (error) {
            // If `which` fails, it means the command was not found.
            return { ...p, status: 'Not Found' as const };
        }
    });

    return Promise.all(statusPromises);
}

    