import Navbar from "@/components/Navbar";
import Link from "next/link";
import prisma from "@/lib/prisma";
import BackButton from "@/components/BackButton";
import WishlistRemoveButton from "./WishlistRemoveButton";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
      redirect('/login');
  }

  const user = JSON.parse(token);

  const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
          userId: user.id
      },
      include: {
          product: true
      },
      orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-200">
       <Navbar />
       
       <div className="max-w-7xl mx-auto px-4 py-8">
           <BackButton />
           <div className="flex items-center gap-4 mb-10 mt-4">
               <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center text-3xl">❤️</div>
               <div>
                   <h1 className="text-4xl font-black text-slate-900">Your Wishlist</h1>
                   <p className="text-slate-500 font-medium">Items you've saved for later.</p>
               </div>
           </div>

           {wishlistItems.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm mt-10">
                   <div className="text-6xl mb-4 text-slate-300">📦</div>
                   <h2 className="text-2xl font-bold text-slate-800 mb-2">Wishlist is Empty</h2>
                   <p className="text-slate-500 mb-6 font-medium">Explore products and add them to your wishlist to see them here.</p>
                   <Link href="/products" className="bg-orange-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-700 shadow-lg">Browse Products</Link>
               </div>
           ) : (
               <div className="space-y-6">
                  {wishlistItems.map((item) => (
                      <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-lg transition-shadow">
                          <img src={item.product.imageUrl || ''} alt={item.product.name} className="w-32 h-32 object-contain bg-slate-50 rounded-2xl p-2 border border-slate-100" />
                          <div className="flex-1 text-center md:text-left">
                              <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.product.name}</h3>
                              <p className="text-slate-500 font-medium mb-4">{item.product.brand}</p>
                              <span className="text-2xl font-black text-slate-900">Rp {item.product.price.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
                               <WishlistRemoveButton userId={user.id} productId={item.product.id} />
                               <Link href={`/products/${item.product.id}`} className="flex-1 md:flex-none bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-center hover:bg-orange-700 transition-colors shadow-lg">
                                   View Details
                               </Link>
                          </div>
                      </div>
                  ))}
               </div>
           )}
       </div>
    </main>
  );
}
