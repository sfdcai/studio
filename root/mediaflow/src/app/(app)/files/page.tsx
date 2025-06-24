import { getMediaFiles } from '@/lib/data';
import { FileExplorerClient } from './files-client';

export const revalidate = 0; // Disable caching

export default async function FileExplorerPage() {
  let data = [];
  try {
      data = await getMediaFiles();
  } catch (error) {
    console.error("Failed to load file explorer data:", error);
    // On error, render the client with an empty array.
  }

  return (
    <div className="w-full p-4 md:p-8">
       <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">File Explorer</h2>
      </div>
      <FileExplorerClient data={data} />
    </div>
  )
}
