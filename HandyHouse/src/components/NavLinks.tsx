'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLinks({ isLoggedIn, isAdmin }: { isLoggedIn: boolean, isAdmin: boolean }) {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || (pathname?.startsWith(path + '/') ?? false);
    return `text-sm font-bold transition-colors ${isActive ? 'text-orange-600' : 'text-slate-600 hover:text-orange-600'}`;
  };

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  return (
    <div className="hidden md:flex space-x-6 items-center bg-slate-100/50 px-6 py-2 rounded-full border border-slate-200">
      <Link href="/" className={getLinkClass('/')}>Home</Link>
      <Link href="/products" className={getLinkClass('/products')}>Products</Link>
      <Link href="/categories" className={getLinkClass('/categories')}>Categories</Link>
      {isLoggedIn && !isAdmin && (
        <>
          <Link href="/wishlist" className={getLinkClass('/wishlist')}>Wishlist</Link>
          <Link href="/cart" className={getLinkClass('/cart')}>Cart</Link>
          <Link href="/history" className={getLinkClass('/history')}>Purchases</Link>
        </>
      )}
      {isAdmin && (
         <>
           <Link href="/scm" className={getLinkClass('/scm')}>SCM Dashboard</Link>
         </>
      )}
    </div>
  );
}
