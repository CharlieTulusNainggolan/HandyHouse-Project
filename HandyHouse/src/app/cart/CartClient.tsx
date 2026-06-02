'use client';

import { useState } from 'react';
import { removeFromCart, checkoutCart } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function CartClient({ cartItems }: { cartItems: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  async function handleRemove(id: string) {
    await removeFromCart(id);
  }

  async function handleCheckout() {
    setLoading(true);
    const res = await checkoutCart();
    setLoading(false);
    if (res.success) {
      alert("Checkout successful! Your order is being processed.");
      router.push('/products');
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl shadow-slate-200/50 mt-8 border border-slate-200">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 font-medium mb-6">Looks like you haven't added any items to your cart yet.</p>
        <button onClick={() => router.push('/products')} className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition-colors">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-8">
      <div className="lg:w-2/3 space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-md border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                 {item.product?.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-2xl">📦</span>
                 )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{item.product.name}</h3>
                <p className="text-sm font-medium text-slate-500">{item.product.category}</p>
                <p className="text-slate-600 mt-2 font-medium">Qty: {item.quantity}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900 mb-2">Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}</p>
              <button onClick={() => handleRemove(item.id)} className="text-red-500 text-sm font-bold hover:text-red-700 underline">Remove</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="lg:w-1/3">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200 sticky top-28">
          <h3 className="text-xl font-black text-slate-800 mb-6">Order Summary</h3>
          <div className="flex justify-between mb-4 text-slate-600 font-medium">
            <span>Subtotal</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between mb-4 text-slate-600 font-medium">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="border-t border-slate-200 pt-4 mt-4 flex justify-between">
            <span className="text-xl font-black text-slate-800">Total</span>
            <span className="text-2xl font-black text-orange-600">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <button 
            disabled={loading}
            onClick={handleCheckout} 
            className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}
