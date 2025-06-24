import { getMediaFiles } from '@/lib/data';
import { DashboardClient } from './dashboard-client';

export const revalidate = 0; // Disable caching

const processingHistoryData = [
  { name: 'Mon', processed: 20, failed: 1 },
  { name: 'Tue', processed: 35, failed: 2 },
  { name: 'Wed', processed: 45, failed: 0 },
  { name: 'Thu', processed: 30, failed: 5 },
  { name: 'Fri', processed: 50, failed: 1 },
  { name: 'Sat', processed: 60, failed: 3 },
  { name: 'Sun', processed: 55, failed: 2 },
];

const formatBytes = (mb: number) => {
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    if (gb < 1024) return `${gb.toFixed(1)} GB`;
    const tb = gb / 1024;
    return `${tb.toFixed(1)} TB`;
};

export default async function DashboardPage() {
  const data = await getMediaFiles();

  const totalFiles = data.length;
  const storageSaved = data.reduce((sum, file) => {
    if (file.status === 'success' || file.status === 'processing') {
      return sum + (file.originalSize - file.compressedSize);
    }
    return sum;
  }, 0);
  const processingErrors = data.filter(file => file.status === 'failed').length;
  const duplicatesFound = 1287; // This would be calculated on the backend

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
