'use server';

import { getDb } from '@/lib/db';
import { getSettings, type Settings } from '@/lib/settings';
import { revalidatePath } from 'next/cache';

// --- Realistic Simulation Helpers ---
// In a real app, these functions would execute shell commands (ffmpeg, rclone, exiftool, etc.)

/**
 * Simulates compressing a file based on settings.
 * @returns The new compressed size in MB.
 */
async function simulateCompression(originalSize: number, compressionQuality: number): Promise<number> {
    console.log(`Simulating compression for file of size ${originalSize}MB with quality ${compressionQuality}%...`);
    // Simulate a delay to represent work being done
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500)); 
    
    // Simulate a potential failure (e.g., unsupported codec)
    if (Math.random() < 0.05) { // 5% chance of failure
        throw new Error("Simulated compression error: Unsupported file codec.");
    }

    // Calculate a new size based on the compression setting
    const compressionFactor = 1 - (compressionQuality / 110); // Make it a bit more realistic
    const compressedSize = originalSize * compressionFactor;

    console.log(`Simulated compression finished. New size: ${compressedSize.toFixed(2)}MB`);
    return parseFloat(compressedSize.toFixed(2));
}

/**
 * Simulates backing up a file to a NAS location.
 */
async function simulateNasBackup(fileName: string, nasPath: string): Promise<void> {
    console.log(`Simulating backup of ${fileName} to NAS path: ${nasPath}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Backup of ${fileName} to NAS successful.`);
}

/**
 * Simulates uploading a file to a Google Drive / Photos location.
 */
async function simulateGPhotosUpload(fileName: string, drivePath: string): Promise<void> {
    console.log(`Simulating upload of ${fileName} to Google Drive path: ${drivePath}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`Upload of ${fileName} to Google Drive successful.`);
}

/**
 * Simulates uploading a file to iCloud.
 */
async function simulateICloudUpload(fileName: string): Promise<void> {
    console.log(`Simulating upload of ${fileName} to iCloud...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Upload of ${fileName} to iCloud successful.`);
}

/**
 * Processes a single file through the entire pipeline, updating the database at each step.
 */
async function processFile(file: any, db: any, settings: Settings) {
    try {
        await db.run('UPDATE files SET status = ? WHERE id = ?', ['processing', file.id]);
        
        // Step 1: Compression
        const compressedSizeMb = await simulateCompression(file.original_size_mb, settings.compression);
        const now = new Date();
        const nextCompressionDate = new Date();
        nextCompressionDate.setFullYear(now.getFullYear() + 1);

        await db.run(
            'UPDATE files SET compressed_size_mb = ?, last_compressed_date = ?, next_compression_date = ? WHERE id = ?',
            [compressedSizeMb, now.toISOString(), nextCompressionDate.toISOString(), file.id]
        );

        // Step 2: NAS Backup (assumed to always happen)
        await simulateNasBackup(file.file_name, settings.nasPath);
        await db.run('UPDATE files SET nas_backup_status = 1 WHERE id = ?', [file.id]);

        // Step 3: Google Photos Upload (assumed to always happen)
        await simulateGPhotosUpload(file.file_name, settings.drivePath);
        await db.run('UPDATE files SET gphotos_backup_status = 1 WHERE id = ?', [file.id]);

        // Step 4: iCloud Sync (only if enabled in settings)
        let icloudStatus = 0;
        if (settings.icloudSync) {
            await simulateICloudUpload(file.file_name);
            icloudStatus = 1;
        }
        await db.run('UPDATE files SET icloud_upload_status = ? WHERE id = ?', [icloudStatus, file.id]);

        // Step 5: Finalize status to success
        await db.run('UPDATE files SET status = ? WHERE id = ?', ['success', file.id]);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error(`Failed to process file ${file.file_name} (ID: ${file.id}):`, errorMessage);
        await db.run('UPDATE files SET status = ? WHERE id = ?', ['failed', file.id]);
    }
}


export async function runProcessingJob(): Promise<{ success: boolean; message: string; processedCount: number, failedCount: number }> {
    const db = await getDb();
    const settings = await getSettings();
    const pendingFiles = await db.all("SELECT * FROM files WHERE status = 'pending' LIMIT ?", [settings.dailyLimit || 1000]);

    if (pendingFiles.length === 0) {
        return { success: true, message: 'No pending files to process.', processedCount: 0, failedCount: 0 };
    }

    console.log(`Found ${pendingFiles.length} pending files. Starting processing job...`);

    let processedCount = 0;
    let failedCount = 0;

    // Process each file sequentially
    for (const file of pendingFiles) {
        await processFile(file, db, settings);
        const finalStatusRow = await db.get('SELECT status FROM files WHERE id = ?', file.id);
        if (finalStatusRow && finalStatusRow.status === 'success') {
            processedCount++;
        } else {
            failedCount++;
        }
    }
    
    let message = `Processing job complete. Successfully processed ${processedCount} files.`;
    if (failedCount > 0) {
        message += ` ${failedCount} files failed.`;
    }

    console.log(message);

    // Revalidate paths to refresh data on the client
    revalidatePath('/dashboard');
    revalidatePath('/files');
    revalidatePath('/logs');
    revalidatePath('/files/[id]', 'layout'); 

    return { success: true, message, processedCount, failedCount };
}
