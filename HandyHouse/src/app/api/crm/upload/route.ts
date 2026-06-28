import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ status: 'error', message: 'No file uploaded' }, { status: 400 });
    }

    const crmServiceUrl = process.env.CRM_SERVICE_URL || 'http://localhost:5001';
    
    const forwardData = new FormData();
    const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
    forwardData.append('file', fileBlob, file.name);
    
    const name = formData.get('name');
    if (name) forwardData.append('name', name);

    const response = await fetch(`${crmServiceUrl}/api/crm/upload`, {
      method: 'POST',
      body: forwardData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error proxying CRM upload:', error);
    return NextResponse.json({ status: 'error', message: error.message || 'Proxy error' }, { status: 500 });
  }
}
