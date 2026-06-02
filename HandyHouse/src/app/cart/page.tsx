import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CartClient from "./CartClient";

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }
  
  const user = JSON.parse(token);

  const cartItems = await prisma.order.findMany({
    where: {
      userId: user.id,
      status: 'PENDING'
    },
    include: {
      product: true
    }
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-200">
       <Navbar />
       
       <div className="bg-slate-900 py-16 px-4 mb-8">
           <div className="max-w-7xl mx-auto">
               <h1 className="text-5xl font-black text-white mb-4">Your Cart 🛒</h1>
               <p className="text-slate-400 text-lg font-medium max-w-2xl">Review your selected items before checkout.</p>
           </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 pb-20">
          <BackButton />
          <CartClient cartItems={cartItems} />
       </div>
    </main>
  );
}
