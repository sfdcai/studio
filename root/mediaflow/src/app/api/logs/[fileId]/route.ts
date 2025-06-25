import { NextResponse } from 'next/server';
import { getLogsForFile } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  const fileId = params.fileId;

  if (!fileId || isNaN(Number(fileId))) {
    return NextResponse.json({ error: 'Invalid file ID.' }, { status: 400 });
  }

  try {
    const logs = await getLogsForFile(fileId);
    return NextResponse.json(logs);
  } catch (error) {
    console.error(`Unexpected error reading logs for file ${fileId}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
