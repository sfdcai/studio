import { NextResponse } from 'next/server';
import { read_file } from '@/tools/file'; // Assuming read_file tool is available here

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;
  const logFilePath = `media/error/${filename}.log`;

  try {
    const fileContent = await read_file(logFilePath);

    if (fileContent.status === 'succeeded') {
      return NextResponse.json({ logContent: fileContent.result });
    } else {
      // Handle specific read_file errors if available, otherwise general error
      const errorMessage = fileContent.error || 'Failed to read log file.';
      console.error(`Error reading log file ${logFilePath}: ${errorMessage}`);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error(`Unexpected error reading log file ${logFilePath}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}