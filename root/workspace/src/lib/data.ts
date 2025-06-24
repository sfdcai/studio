'use server';

import { notFound } from 'next/navigation';
import { getDb } from './db';

export type MediaFile = {
  id: string
  type: "Image" | "Video"
  originalSize: number
  compressedSize: number
  status: "pending" | "processing" | "success" | "failed"
  camera: string,
  createdDate: string
  lastCompressed: string
  nextCompression: string
  nasBackup: boolean
  googlePhotosBackup: boolean
  icloudUpload: boolean
  fileName: string,
  stagingPath?: string,
  archivePath?: string,
  processedPath?: string,
}

export type LogEntry = {
    id: number;
    file_id: number | null;
    timestamp: string;
    level: 'INFO' | 'ERROR' | 'WARN';
    message: string;
}

export type ProcessingHistoryPoint = {
    name: string;
    processed: number;
    failed: number;
}

function mapRowToMediaFile(row: any): MediaFile {
    return {
        id: row.id.toString(),
        fileName: row.file_name,
        type: row.file_type,
        originalSize: row.original_size_mb,
        compressedSize: row.compressed_size_mb || 0,
        status: row.status,
        camera: row.camera || 'Unknown',
        createdDate: row.created_date,
        lastCompressed: row.last_compressed_date || "N/A",
        nextCompression: row.next_compression_date || "N/A",
        nasBackup: !!row.nas_backup_status,
        googlePhotosBackup: !!row.gphotos_backup_status,
        icloudUpload: !!row.icloud_upload_status,
        stagingPath: row.staging_path,
        archivePath: row.archive_path,
        processedPath: row.processed_path,
    };
}


export async function getMediaFiles(): Promise<MediaFile[]> {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM files ORDER BY created_date DESC');
    return rows.map(mapRowToMediaFile);
}

export async function getMediaFile(id: string): Promise<MediaFile> {
    const db = await getDb();
    const row = await db.get('SELECT * FROM files WHERE id = ?', id);
    
    if (!row) {
        notFound();
    }
    return mapRowToMediaFile(row);
}

export async function getMediaFileByName(filename: string): Promise<MediaFile | null> {
    const db = await getDb();
    const row = await db.get('SELECT * FROM files WHERE file_name = ?', filename);
    if (!row) return null;
    return mapRowToMediaFile(row);
}

export async function getStats(): Promise<{ [key: string]: number }> {
  const db = await getDb();
  const rows = await db.all('SELECT key, value FROM stats');
  const stats: { [key: string]: number } = {};
  for (const row of rows) {
    stats[row.key] = row.value;
  }
  return stats;
}

export async function getAllLogs(limit = 500): Promise<LogEntry[]> {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?', limit);
    return rows as LogEntry[];
}

export async function getLogsForFile(fileId: string): Promise<LogEntry[]> {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM logs WHERE file_id = ? ORDER BY timestamp ASC', fileId);
    return rows as LogEntry[];
}


export async function getProcessingHistory(): Promise<ProcessingHistoryPoint[]> {
    const db = await getDb();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const rows: { day: string, processed: number, failed: number }[] = await db.all(`
        WITH daily_counts AS (
            SELECT
                strftime('%Y-%m-%d', timestamp) AS day,
                SUM(CASE WHEN message LIKE 'SUCCESS: Processing complete%' THEN 1 ELSE 0 END) AS processed,
                SUM(CASE WHEN level = 'ERROR' AND message LIKE 'ERROR: Processing FAILED%' THEN 1 ELSE 0 END) AS failed
            FROM logs
            WHERE timestamp >= ?
            GROUP BY day
        )
        SELECT * FROM daily_counts ORDER BY day ASC;
    `, sevenDaysAgoISO);
    
    // Create a map for quick lookups
    const resultsMap = new Map(rows.map(row => [row.day, row]));

    // Generate date range for the last 7 days
    const history: ProcessingHistoryPoint[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayKey = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const data = resultsMap.get(dayKey) || { processed: 0, failed: 0 };
        
        history.push({
            name: dayName,
            processed: data.processed,
            failed: data.failed,
        });
    }

    return history;
}
