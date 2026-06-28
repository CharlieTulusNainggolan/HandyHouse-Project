import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToMinIO } from '@/lib/minio';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || 'application/octet-stream';
    const fileName = file.name;

    // Use erp-bucket explicitly as required by the user
    const url = await uploadFileToMinIO(fileName, buffer, mimeType, 'erp-bucket');

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      message: '✅ File berhasil diunggah ke MinIO!',
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in API upload route:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
