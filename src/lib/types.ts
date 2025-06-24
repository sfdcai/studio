
export type Settings = {
  appName: string;
  isDarkMode: boolean;
  // Backend paths
  stagingDir: string;
  archiveDir: string;
  processedDir: string;
  logDir: string;
  dbPath: string;
  // Rclone
  rcloneRemote: string;
  drivePath: string; // This is the destination path on the remote
  // iCloud
  icloudUser: string; // This is the Apple ID
  icloudFolderStructure: string;
  // Processing
  processLimit: number;
  jpgQualityMedium: number;
  jpgQualityLow: number;
  vidCRF1080p: number;
  vidCRF720p: number;
  vidCRF640p: number;
  // AI Settings
  googleAiApiKey: string;
  aiAllowMetadata: boolean;
  aiAllowStats: boolean;
  aiAllowSettings: boolean;
  // Feature Toggles
  compressionEnabled: boolean;
  uploadEnabled: boolean;
};

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
