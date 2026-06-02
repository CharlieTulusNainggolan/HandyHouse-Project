'use client';

import { createProduct } from "@/app/actions";
import { useState } from "react";

export default function CreateProductForm() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(formData: FormData) {
      setLoading(true);
      const res = await createProduct(formData);
      setLoading(false);
      if(res.success) {
         setSuccessMsg("Product Listed Successfully!");
      }
  }

  return (
      <div>
         {successMsg && (
             <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl font-bold mb-8 flex items-center">
                <span className="text-2xl mr-3">🎉</span> {successMsg}
             </div>
         )}

         <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                   <input type="text" name="name" placeholder="Bosch Power Drill" className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" required />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Brand</label>
                   <input type="text" name="brand" placeholder="Bosch" className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">SKU (Stock Keeping Unit)</label>
                   <input type="text" name="sku" placeholder="BOSCH-PD-001" className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Price (in IDR)</label>
                   <input type="number" name="price" placeholder="1500000" className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" required />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Stock Level</label>
                   <input type="number" name="stockLevel" placeholder="10" className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" required defaultValue="10" />
                </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                   <select name="category" className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all">
                       <option value="POWER_TOOLS">Power Tools</option>
                       <option value="HAND_TOOLS">Hand Tools</option>
                       <option value="KITCHENWARE">Kitchenware</option>
                       <option value="GARDENING">Gardening</option>
                       <option value="HARDWARE">Hardware</option>
                   </select>
                </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Image URL</label>
               <input type="url" name="imageUrl" placeholder="https://images.unsplash.com/photo-..." className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" required />
            </div>

            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Product Description</label>
               <textarea name="description" rows={5} placeholder="Describe the specifications and usage..." className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" required></textarea>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={loading} className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg disabled:opacity-50">
                   {loading ? 'Publishing...' : 'Publish Listing'}
                </button>
            </div>
         </form>
      </div>
  );
}
