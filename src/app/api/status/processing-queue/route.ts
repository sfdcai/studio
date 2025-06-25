import { run_terminal_command } from 'tools';
import { NextResponse } from 'next/server';
import { read_file } from 'tools';
import path from 'path';

export async function GET() {
  try {
    const processingQueuePath = path.join(process.cwd(), 'media', 'processing_queue');
    const statusFilePath = path.join(process.cwd(), 'media', 'processing_status.json');

    const listFilesResult = await run_terminal_command({ command: `ls ${processingQueuePath}` });
    if (listFilesResult.status !== 'succeeded') {
      console.error('Error listing processing queue files:', listFilesResult.result);
    }

    let currentFile = null;
    try {
      const statusFileContent = await read_file({ path: statusFilePath });
      if (statusFileContent.status === 'succeeded') {
        const statusData = JSON.parse(statusFileContent.file_content);
        if (statusData.currentFile) {
          currentFile = statusData.currentFile;
        }
      }
    } catch (error) {
      console.error('Error reading processing status file:', error);
    }

    let files: string[] = [];
    if (listFilesResult.status === 'succeeded') {
      files = listFilesResult.result.trim().split('\n').filter(fileName => fileName !== '');
    } else {
      // Even if listing files failed, we can still return the currentFile if available
      return NextResponse.json({ error: 'Failed to list processing queue files', details: listFilesResult.result, currentFile }, { status: 500 });
    }

    return NextResponse.json({ files, currentFile });
  } catch (error) {
    console.error('Error getting processing queue status:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}