import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import prisma from "@/lib/prisma";
import SCMClient from "./SCMClient";

export const dynamic = 'force-dynamic';

export default async function SCManagementPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { supplier: true }
  });

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: true,
      supplier: true
    }
  });

  const suppliers = await prisma.supplier.findMany({
    orderBy: { rating: 'desc' }
  });

  const userOrders = await prisma.order.findMany({
    where: { status: { not: 'PENDING' } },
    orderBy: { createdAt: 'desc' },
    include: {
      product: true,
      user: true
    }
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-200">
       <Navbar />
       
       <div className="bg-slate-900 py-16 px-4 mb-8">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
               <div>
                   <h1 className="text-5xl font-black text-white mb-4">SCM Dashboard 📦</h1>
                   <p className="text-slate-400 text-lg font-medium max-w-2xl">Manage your inventory, procurement, logistics, and analytics.</p>
               </div>
               <div className="flex gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
                     <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Listings</p>
                     <p className="text-2xl font-black text-white">{products.length}</p>
                  </div>
                  <div className="bg-orange-500/20 backdrop-blur-md p-4 rounded-2xl border border-orange-500/30 text-center">
                     <p className="text-orange-200 text-sm font-bold uppercase tracking-wider mb-1">In Stock</p>
                     <p className="text-2xl font-black text-orange-400">{products.filter(p => p.stockLevel > 0).length}</p>
                  </div>
               </div>
           </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 pb-20">
          <BackButton />
          
          <SCMClient initialProducts={products} initialPOs={purchaseOrders} initialSuppliers={suppliers} initialOrders={userOrders} />
       </div>
    </main>
  );
}
