import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import HistoryClient from './HistoryClient';

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) redirect('/login');
  
  const user = JSON.parse(token);

  const pastOrders = await prisma.order.findMany({
    where: { 
      userId: user.id,
      status: { not: 'PENDING' }
    },
    orderBy: { createdAt: 'desc' },
    include: { product: true }
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Riwayat Pembelian</h1>
        <p className="text-slate-500 mb-8">Lihat status pesanan dan riwayat belanja Anda sebelumnya.</p>
        
        <HistoryClient initialOrders={pastOrders} />
      </div>
    </main>
  );
}
