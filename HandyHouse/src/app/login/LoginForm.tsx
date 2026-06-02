'use client';

import { useState } from "react";
import { loginUser } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
          const formData = new FormData();
          formData.append("email", email);
          formData.append("password", password);

          const res = await loginUser(formData);

          if (res.success) {
              if (res.role === 'ADMIN') {
                  router.push("/scm");
              } else {
                  router.push("/products");
              }
          } else {
              setError(res.message || "Email atau kata sandi tidak sesuai.");
              setLoading(false);
          }
      } catch (err) {
          setError("Terjadi kesalahan. Silakan coba lagi.");
          setLoading(false);
      }
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
         {error && (
             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-bold text-sm text-center shadow-sm">
                 {error}
             </div>
         )}
         <div>
           <label className="block text-sm font-semibold text-[#8c3e1e] mb-1.5">Email</label>
           <input 
             type="email" 
             name="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             placeholder="charlietulus1@gmail.com" 
             className="w-full bg-[#f4f7fb] px-4 py-3 rounded-xl border border-[#8c3e1e] focus:outline-none focus:ring-2 focus:ring-[#d45d25] transition-all text-slate-800" 
             required 
           />
        </div>
        <div>
           <div className="flex justify-between mb-1.5">
             <label className="block text-sm font-semibold text-[#8c3e1e]">Password</label>
             <a href="#" className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">Forgot password?</a>
           </div>
           <div className="relative">
             <input 
               type="password" 
               name="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="••••••••••••" 
               className="w-full bg-[#f4f7fb] pl-4 pr-10 py-3 rounded-xl border border-[#8c3e1e] focus:outline-none focus:ring-2 focus:ring-[#d45d25] transition-all text-slate-800" 
               required 
             />
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#8c3e1e] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-80">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
             </svg>
           </div>
        </div>
        
        <button 
           type="submit" 
           disabled={loading}
           className="w-full bg-[#f97316] text-white font-bold text-lg py-3.5 mt-2 rounded-xl hover:bg-[#d45d25] transition-colors shadow-md disabled:opacity-70 flex justify-center items-center"
        >
           {loading ? 'Verifying...' : 'Log In'}
        </button>
     </form>
  );
}
