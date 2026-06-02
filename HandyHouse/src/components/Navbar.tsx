import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { logoutUser } from '@/app/actions';
import NavLinks from './NavLinks';

export default async function Navbar() {
  const cookieStore = await cookies();
  const tokenStr = cookieStore.get('auth-token')?.value;
  let isLoggedIn = false;
  let isAdmin = false;
  let user = null;

  if (tokenStr) {
      try {
          user = JSON.parse(tokenStr);
          isLoggedIn = true;
          isAdmin = user?.role === 'ADMIN';
      } catch (e) {
          console.error("Failed to parse token in Navbar", e);
      }
  }

  return (
    <nav className="w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 transition-all duration-300 top-0 sticky">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white font-extrabold text-2xl">H</span>
            </div>
            <Link href="/"><span className="font-extrabold text-2xl tracking-tight text-slate-900 cursor-pointer">Handy<span className="text-orange-600">House</span></span></Link>
          </div>
          <NavLinks isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
          <div className="flex items-center gap-5">
            {isLoggedIn ? (
              <form action={logoutUser}>
                <button type="submit" className="text-sm font-bold text-slate-700 hover:text-red-600 transition-colors">Log Out</button>
              </form>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors">Log In</Link>
                <Link href="/register" className="bg-slate-900 text-white text-sm px-6 py-2.5 rounded-full font-bold shadow-xl shadow-slate-900/20 hover:bg-orange-600 transition-all hover:-translate-y-0.5">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
