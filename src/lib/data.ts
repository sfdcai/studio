'use server';

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
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

const mediaDir = path.join(process.cwd(), 'public/media');
const cameras = ["Sony A7III", "Canon R5", "Nikon Z6", "iPhone 14 Pro", "GoPro Hero 11"];

async function hashFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
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

async function syncMediaDirectory() {
    const db = await getDb();
    
    let fileNames: string[];
    try {
        await fsp.access(mediaDir);
        fileNames = await fsp.readdir(mediaDir);
    } catch (error) {
        console.warn("\n\nCould not read media directory. Creating 'public/media'. Please add some image/video files to it.\n\n");
        await fsp.mkdir(mediaDir, { recursive: true });
        return;
    }
    
    for (const fileName of fileNames) {
        const filePath = path.join(mediaDir, fileName);
        try {
            const stats = await fsp.stat(filePath);
            if (!stats.isFile()) continue;

            const fileHash = await hashFile(filePath);
            
            const existing = await db.get('SELECT id FROM files WHERE file_hash = ?', fileHash);
            if (existing) {
                continue; // Skip duplicate
            }

            const fileExtension = path.extname(fileName).toLowerCase();
            const fileType = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension) ? "Image" : "Video";
            const originalSizeMb = parseFloat((stats.size / (1024 * 1024)).toFixed(2));
            const camera = cameras[Math.floor(Math.random() * cameras.length)]; // Still mocking this for now

            await db.run(
                'INSERT INTO files (file_hash, file_name, file_type, original_size_mb, status, camera, created_date, staging_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [fileHash, fileName, fileType, originalSizeMb, 'pending', camera, stats.birthtime.toISOString(), filePath]
            );

        } catch (err) {
            console.error(`Error processing file ${fileName}:`, err);
        }
    }
}


export async function getMediaFiles(): Promise<MediaFile[]> {
    const db = await getDb();
    await syncMediaDirectory();
    
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
