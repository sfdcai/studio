import { NextRequest, NextResponse } from 'next/server';
import { getMediaFileByName } from '@/lib/data';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

// This handler will serve media files from their absolute paths on the server.
// It acts as a secure proxy, preventing direct filesystem access from the client.
export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename);
    
    // 1. Look up the file in the database to get its path
    const file = await getMediaFileByName(filename);

    if (!file) {
      return new NextResponse('File not found in database', { status: 404 });
    }

    // 2. Determine which version of the file to serve.
    //    Prefer the smaller, processed version if it exists.
    //    Fall back to the archived original, then the staging version.
    const filePath = file.processedPath || file.archivePath || file.stagingPath;

    if (!filePath || !fs.existsSync(filePath)) {
      return new NextResponse('File not found on disk', { status: 404 });
    }

    // 3. Read the file from disk
    const fileBuffer = fs.readFileSync(filePath);

    // 4. Determine the MIME type
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    // 5. Stream the file back to the client
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error(`Failed to serve file ${params.filename}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
