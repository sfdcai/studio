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
  fileName: string
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

export async function getStats(): Promise<{ [key: string]: number }> {
  const db = await getDb();
  const rows = await db.all('SELECT key, value FROM stats');
  const stats: { [key: string]: number } = {};
  for (const row of rows) {
    stats[row.key] = row.value;
  }
  return stats;
}
