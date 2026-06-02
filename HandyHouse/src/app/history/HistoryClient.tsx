/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { deleteTransaction } from '@/app/actions';

export default function HistoryClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);

  const groupedOrders = orders.reduce((acc: any, order: any) => {
     const validDate = order.updatedAt || order.createdAt || new Date().toISOString();
     const dateKey = new Date(validDate).toISOString().substring(0, 16);
     const groupKey = `${order.userId}-${dateKey}`;
     if (!acc[groupKey]) {
        acc[groupKey] = {
           id: groupKey,
           date: order.createdAt,
           status: order.status,
           items: [],
           orderIds: []
        };
     }
     acc[groupKey].items.push({
        product: order.product,
        quantity: order.quantity,
        status: order.status
     });
     acc[groupKey].orderIds.push(order.id);
     
     if (order.status === 'PROCESSING') acc[groupKey].status = 'PROCESSING';
     return acc;
  }, {});

  const transactionList = Object.values(groupedOrders).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  async function handleDelete(orderIds: string[]) {
    if (!confirm("Hapus riwayat transaksi ini secara permanen?")) return;
    setLoading(true);
    const res = await deleteTransaction(orderIds);
    if (res.success) {
      setOrders(orders.filter((o: any) => !orderIds.includes(o.id)));
    } else {
      alert("Gagal menghapus riwayat.");
    }
    setLoading(false);
  }

  if (transactionList.length === 0) {
     return (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
           <div className="text-6xl mb-4">🛒</div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Riwayat</h3>
           <p className="text-slate-500">Anda belum pernah melakukan pembelian yang berhasil diselesaikan.</p>
        </div>
     );
  }

  return (
    <div className="space-y-6">
      {transactionList.map((tx: any) => {
         const isShipped = tx.status === 'SHIPPED';
         
         return (
           <div key={tx.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
              {/* Header */}
              <div className="flex flex-wrap justify-between items-start mb-6 pb-4 border-b border-slate-100">
                 <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tanggal Transaksi</div>
                    <div className="font-bold text-slate-800">{new Date(tx.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                 </div>
                 <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    {isShipped ? (
                       <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-black flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                          Selesai & Dikirim
                       </span>
                    ) : (
                       <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-black flex items-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          Sedang Diproses Admin
                       </span>
                    )}
                 </div>
              </div>

              {/* Items */}
              <div className="space-y-4 mb-6">
                 {tx.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                             {item.product?.imageUrl ? (
                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                             ) : (
                                <span className="text-2xl">📦</span>
                             )}
                          </div>
                          <div>
                             <div className="font-bold text-slate-800">{item.product?.name}</div>
                             <div className="text-sm font-bold text-slate-500">Rp {item.product?.price.toLocaleString('id-ID')}</div>
                          </div>
                       </div>
                       <div className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg text-slate-700 font-black text-sm">
                          {item.quantity} pcs
                       </div>
                    </div>
                 ))}
              </div>

              {/* Actions */}
              {isShipped && (
                 <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                       disabled={loading} 
                       onClick={() => handleDelete(tx.orderIds)} 
                       className="text-red-500 hover:text-red-700 text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                       Hapus Riwayat
                    </button>
                 </div>
              )}
           </div>
         );
      })}
    </div>
  );
}
