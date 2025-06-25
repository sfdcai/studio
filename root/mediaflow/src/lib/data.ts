
import { getDb } from './db';
import { notFound } from 'next/navigation';
import type { MediaFile, LogEntry, ProcessingHistoryPoint } from './types';

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
        nasBackup: !!row.nas_backup_status,
        stagingPath: row.staging_path,
        archivePath: row.archive_path,
        processedPath: row.processed_path,
        errorLog: row.error_log,
    };
}


export async function getMediaFiles(): Promise<MediaFile[]> {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM files ORDER BY created_date DESC');
    return rows.map(mapRowToMediaFile);
}

export async function getFailedMediaFiles(): Promise<MediaFile[]> {
    const db = await getDb();
    const rows = await db.all("SELECT * FROM files WHERE status = 'failed' ORDER BY created_date DESC");
    return rows.map(mapRowToMediaFile);
}

export async function getMediaFile(id: string): Promise<MediaFile | null> {
    const db = await getDb();
    const row = await db.get('SELECT * FROM files WHERE id = ?', id);
    
    if (!row) {
        return null;
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
  
  const totalFilesRow = await db.get("SELECT COUNT(*) as count FROM files");
  stats['total_files'] = totalFilesRow.count;

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
    const sevenDaysAgoISO = sevenDaysAgo.toISOString().split('T')[0] + 'T00:00:00Z';

    const rows: { day: string, processed: number, failed: number }[] = await db.all(`
        WITH daily_logs AS (
            SELECT
                date(last_compressed_date) AS day,
                status
            FROM files
            WHERE last_compressed_date >= ?
        )
        SELECT
            day,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as processed,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
        FROM daily_logs
        GROUP BY day
        ORDER BY day ASC;
    `, sevenDaysAgoISO);
    
    const resultsMap = new Map(rows.map(row => [row.day, row]));

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
