import { getMediaFiles, getStats, getProcessingHistory } from '@/lib/data';
import { DashboardClient } from './dashboard-client';

export const revalidate = 0; // Disable caching

const formatBytes = (mb: number) => {
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    if (gb < 1024) return `${gb.toFixed(1)} GB`;
    const tb = gb / 1024;
    return `${tb.toFixed(1)} TB`;
};

export default async function DashboardPage() {
  const data = await getMediaFiles();
  const stats = await getStats();
  const processingHistoryData = await getProcessingHistory();

  const totalFiles = stats.total_files || data.length; // Fallback for older DBs
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
    />
  )
}
