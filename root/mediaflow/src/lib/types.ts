export type Settings = {
  appName: string;
  isDarkMode: boolean;
  stagingDir: string;
  archiveDir: string;
  processedDir: string;
  logDir: string;
  dbPath: string;
  rcloneRemote: string;
  drivePath: string;
  icloudUser: string;
  icloudFolderStructure: string;
  processLimit: number;
  jpgQualityMedium: number;
  jpgQualityLow: number;
  vidCRF1080p: number;
  vidCRF720p: number;
  vidCRF640p: number;
  googleAiApiKey: string;
  aiAllowMetadata: boolean;
  aiAllowStats: boolean;
  aiAllowSettings: boolean;
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

export type Prerequisite = {
    name: string;
    command: string;
    status: 'Installed' | 'Not Found';
    path?: string;
    helpText: string;
};
