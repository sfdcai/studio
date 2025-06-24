'use server';

import { getDb } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { revalidatePath } from 'next/cache';

export async function runProcessingJob(): Promise<{ success: boolean; message: string; processedCount: number }> {
  try {
    const db = await getDb();
    const settings = await getSettings();

    const pendingFiles = await db.all("SELECT * FROM files WHERE status = 'pending'");

    if (pendingFiles.length === 0) {
      return { success: true, message: 'No pending files to process.', processedCount: 0 };
    }

    let processedCount = 0;

    for (const file of pendingFiles) {
      const originalSize = file.original_size_mb;
      // Simulate compression based on the initial compression setting
      const compressedSize = originalSize * (1 - settings.compression / 100);
      
      const now = new Date();
      const nextCompressionDate = new Date();
      // For simplicity, let's just set it to 1 year from now.
      // The logic could be expanded to use year1Compression, etc.
      nextCompressionDate.setFullYear(nextCompressionDate.getFullYear() + 1);

      await db.run(
        `UPDATE files SET 
          status = ?, 
          compressed_size_mb = ?, 
          last_compressed_date = ?, 
          next_compression_date = ?, 
          nas_backup_status = ?, 
          gphotos_backup_status = ?, 
          icloud_upload_status = ? 
        WHERE id = ?`,
        [
          'success',
          parseFloat(compressedSize.toFixed(2)),
          now.toISOString(),
          nextCompressionDate.toISOString(),
          1, // true
          1, // true
          settings.icloudSync ? 1 : 0, // true if enabled
          file.id
        ]
      );
      processedCount++;
    }

    // Revalidate paths to refresh data on the client
    revalidatePath('/dashboard');
    revalidatePath('/files');
    revalidatePath('/logs');
    revalidatePath('/files/[id]', 'layout'); // Revalidate all file detail pages


    return { success: true, message: `Successfully processed ${processedCount} files.`, processedCount };
  } catch (error) {
    console.error("Failed to run processing job:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to process files: ${errorMessage}`, processedCount: 0 };
  }
}
