import { getMediaFiles } from '@/lib/data';
import { FileExplorerClient } from './files-client';

export default async function FileExplorerPage() {
  const data = await getMediaFiles();

  return (
    <div className="w-full p-4 md:p-8">
       <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">File Explorer</h2>
      </div>
      <FileExplorerClient data={data} />
    </div>
  )
}
