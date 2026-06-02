/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import Navbar from "@/components/Navbar";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import { cookies } from "next/headers";
import ProductDetailActions from "./ProductDetailActions";

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  let user: any = null;
  if (token) {
     try { user = JSON.parse(token); } catch(e) {}
  }

  const product = await prisma.product.findUnique({
      where: { id }
  });

  if (!product) {
      notFound();
  }

  let isWished = false;
  if (user) {
      const wish = await prisma.wishlistItem.findUnique({
          where: { userId_productId: { userId: user.id, productId: id } }
      });
      isWished = !!wish;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
       <Navbar />
       
       <div className="max-w-7xl mx-auto px-4 py-8">
           <BackButton />
           <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-200 flex flex-col md:flex-row gap-16 mt-4">
             
             {/* Left: Image Viewer */}
             <div className="flex-1 bg-slate-50 rounded-[2rem] p-10 flex items-center justify-center border border-slate-100">
                <img src={product.imageUrl || ''} alt={product.name} className="w-full max-w-lg object-contain hover:scale-105 transition-transform duration-500 drop-shadow-xl" />
             </div>

             {/* Right: Product Details */}
             <div className="flex-1 flex flex-col justify-center">
                <div className="inline-block bg-orange-100 text-orange-700 text-sm font-black px-4 py-1.5 rounded-xl tracking-wide w-max mb-6">
                    {product.category.replace('_', ' ')}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">{product.name}</h1>
                <p className="text-xl font-bold text-slate-500 mb-8 border-b border-slate-100 pb-8">By {product.brand || 'HandyHouse Authentic'}</p>
                
                <div className="mb-10">
                    <span className="text-5xl font-black text-slate-900 drop-shadow-sm">
                        Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    {product.stockLevel > 0 ? (
                       <p className="text-green-600 font-bold mt-3 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> In Stock ({product.stockLevel} available)</p>
                    ) : (
                       <p className="text-red-500 font-bold mt-3 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Out of Stock</p>
                    )}
                </div>

                <div className="prose text-slate-600 font-medium mb-12">
                   <p className="leading-relaxed text-lg">{product.description}</p>
                </div>

                <ProductDetailActions 
                    productId={product.id} 
                    userId={user?.id || ''} 
                    initialWished={isWished}
                    isAdmin={user?.role === 'ADMIN'}
                />
             </div>
          </div>
       </div>
    </main>
  );
}
