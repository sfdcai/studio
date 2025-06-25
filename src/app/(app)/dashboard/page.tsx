import { getMediaFiles, getStats, getProcessingHistory, getFailedMediaFiles } from '@/lib/data';
import { DashboardClient } from './dashboard-client';
import { getSystemStatus } from './actions';

export const revalidate = 0; // Disable caching

const formatBytes = (mb: number) => {
    if (!mb || mb < 0) return '0.0 MB';
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    if (gb < 1024) return `${gb.toFixed(1)} GB`;
    const tb = gb / 1024;
    return `${tb.toFixed(1)} TB`;
};

export default async function DashboardPage() {
  let data = [];
  let stats: any = {};
  let processingHistoryData = [];
  let prerequisites = [];
  let failedFiles = [];

  try {
      [data, stats, processingHistoryData, prerequisites, failedFiles] = await Promise.all([
        getMediaFiles(),
        getStats(),
        getProcessingHistory(),
        getSystemStatus(),
        getFailedMediaFiles(),
      ]);
  } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Render the client with empty/default data on error
      // This prevents the page from crashing if the DB is not ready
      return (
          <DashboardClient
              totalFiles={0}
              storageSaved={formatBytes(0)}
              duplicatesFound={0}
              processingErrors={0}
              filesByCategoryData={[]}
              processingHistoryData={[]}
              prerequisites={await getSystemStatus()}
              failedFiles={[]}
          />
      );
  }

  // Use the stats table as the source of truth, with fallbacks.
  const totalFiles = stats.total_files || data.length;
  const storageSaved = stats.storage_saved_mb || 0;
  const processingErrors = stats.processing_errors || 0;
  const duplicatesFound = stats.duplicates_found || 0;

  const filesByCategory = data.reduce((acc, file) => {
    const { type } = file;
    const categoryName = type === 'Image' ? 'Images' : 'Videos';
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filesByCategoryData = Object.entries(filesByCategory).map(([name, files]) => ({ name, files }));

  return (
    <DashboardClient
        totalFiles={totalFiles}
        storageSaved={formatBytes(storageSaved)}
        duplicatesFound={duplicatesFound}
        processingErrors={processingErrors}
        filesByCategoryData={filesByCategoryData}
        processingHistoryData={processingHistoryData}
        prerequisites={prerequisites}
        failedFiles={failedFiles}
    />
  )
}
