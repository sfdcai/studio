import { NextResponse } from 'next/server';
import { getFailedMediaFiles } from '@/lib/data';

export async function GET() {
  try {
    const files = await getFailedMediaFiles();
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching failed files:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred while fetching failed files.' },
      { status: 500 }
    );
  }
}
