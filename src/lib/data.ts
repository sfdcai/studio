'use server';

import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';

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
}

// Helper function to simulate backend data that we can't get from the filesystem alone
const cameras = ["Sony A7III", "Canon R5", "Nikon Z6", "iPhone 14 Pro", "GoPro Hero 11"];
const statuses: MediaFile['status'][] = ["success", "processing", "failed", "pending"];

function createMockFileData(id: string, fileExtension: string, createdDate: Date, originalSizeInBytes: number): MediaFile {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const originalSize = parseFloat((originalSizeInBytes / (1024 * 1024)).toFixed(2));
    let compressedSize = 0;
    let lastCompressed = "N/A";
    let nextCompression = "N/A";

    if (status === 'success' || status === 'processing') {
        compressedSize = parseFloat((originalSize * (Math.random() * (0.8 - 0.5) + 0.5)).toFixed(2));
        const lastCompressedDate = new Date(createdDate.getTime() + Math.random() * 1000 * 60 * 60);
        lastCompressed = lastCompressedDate.toISOString();
        nextCompression = new Date(new Date(lastCompressedDate).setFullYear(lastCompressedDate.getFullYear() + 1)).toISOString();
    }
    
    return {
        id,
        type: ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension) ? "Image" : "Video",
        originalSize,
        compressedSize,
        status,
        camera: cameras[Math.floor(Math.random() * cameras.length)],
        createdDate: createdDate.toISOString(),
        lastCompressed,
        nextCompression,
        nasBackup: status === 'success' && Math.random() > 0.2,
        googlePhotosBackup: status === 'success' && Math.random() > 0.4,
        icloudUpload: status === 'success' && Math.random() > 0.8,
    };
}


const mediaDir = path.join(process.cwd(), 'public/media');

export async function getMediaFiles(): Promise<MediaFile[]> {
    let fileNames: string[];
    try {
        fileNames = await fs.promises.readdir(mediaDir);
    } catch (error) {
        console.warn("\n\nCould not read media directory. Please create 'public/media' and add some image/video files to it.\n\n");
        return [];
    }
    
    const mediaFiles = await Promise.all(
        fileNames.map(async (fileName) => {
            const filePath = path.join(mediaDir, fileName);
            const stats = await fs.promises.stat(filePath);
            const id = path.parse(fileName).name;
            const ext = path.parse(fileName).ext.toLowerCase();
            return createMockFileData(id, ext, stats.birthtime, stats.size);
        })
    );

    return mediaFiles.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
}

export async function getMediaFile(id: string): Promise<MediaFile> {
    const files = await getMediaFiles();
    const file = files.find(f => f.id === id);
    if (!file) {
        notFound();
    }
    return file;
}
