import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test the database connection by fetching a simple count
    const productCount = await prisma.product.count();
    const supplierCount = await prisma.supplier.count();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        products: productCount,
        suppliers: supplierCount,
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to the database',
      error: error.message
    }, { status: 500 });
  }
}
