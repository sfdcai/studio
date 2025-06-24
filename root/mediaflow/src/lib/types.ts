
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
