import Navbar from "@/components/Navbar";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = ['POWER_TOOLS', 'HAND_TOOLS', 'KITCHENWARE', 'GARDENING', 'HARDWARE'];
  
  // Get counts per category
  const products = await prisma.product.findMany();
  const getCount = (cat: string) => products.filter(p => p.category === cat).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-200">
       <Navbar />
       
       <div className="bg-slate-900 py-16 px-4">
           <div className="max-w-7xl mx-auto">
               <h1 className="text-5xl font-black text-white mb-4">Shop by Category</h1>
               <p className="text-slate-400 text-lg font-medium max-w-2xl">Find exactly what you need by browsing our specialized departments.</p>
           </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 py-16">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(category => (
                <Link href={`/products?category=${category}`} key={category}>
                   <div className="bg-white border flex items-center gap-6 border-slate-200 rounded-3xl p-8 hover:shadow-2xl hover:border-orange-300 cursor-pointer transition-all hover:-translate-y-2 group">
                      <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-bold text-4xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                         {category === 'POWER_TOOLS' ? '⚡' : category === 'KITCHENWARE' ? '🍳' : category === 'GARDENING' ? '🌻' : category === 'HAND_TOOLS' ? '🔨' : '🔩'}
                      </div>
                      <div>
                         <h4 className="font-black text-2xl text-slate-800 mb-1">{category.replace('_', ' ')}</h4>
                         <p className="text-slate-500 font-medium">{getCount(category)} products available</p>
                      </div>
                   </div>
                </Link>
              ))}
           </div>
       </div>
    </main>
  );
}
