export type Settings = {
  appName: string;
  isDarkMode: boolean;
  // Backend paths
  stagingDir: string;
  archiveDir: string;
  processedDir: string;
  errorDir: string;
  logDir: string;
  dbPath: string;
  // Processing
  processLimit: number;
  jpgQualityMedium: number;
  jpgQualityLow: number;
  vidCRF1080p: number;
  vidCRF720p: number;
  vidCRF640p: number;
  // Feature Toggles
  compressionEnabled: boolean;
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
  fileName: string,
  stagingPath?: string,
  archivePath?: string,
  processedPath?: string,
  errorLog?: string | null,
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
