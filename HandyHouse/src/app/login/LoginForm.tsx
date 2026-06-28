'use client';

import { useState, useEffect } from "react";
import { loginUser } from "@/app/actions";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface LoginFormProps {
  errorParam?: string;
}

export default function LoginForm({ errorParam }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (errorParam) {
      if (errorParam === "OAuthSessionError") {
        setError("Autentikasi Google gagal. Sesi tidak ditemukan.");
      } else if (errorParam === "OAuthCallbackError") {
        setError("Gagal memproses alur masuk Google. Silakan coba lagi.");
      } else if (typeof errorParam === "string") {
        setError(errorParam);
      }
    }
  }, [errorParam]);

  async function handleGoogleLogin() {
      setError("");
      setLoading(true);
      try {
          await signIn("google", { callbackUrl: "/api/auth/callback-success?mode=login" });
      } catch (err) {
          setError("Gagal menghubungi Google OAuth.");
          setLoading(false);
      }
  }

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
      <div className="space-y-4">
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
               className="w-full bg-[#f97316] text-white font-bold text-lg py-3.5 mt-2 rounded-xl hover:bg-[#d45d25] transition-colors shadow-md disabled:opacity-70 flex justify-center items-center cursor-pointer"
            >
               {loading ? 'Verifying...' : 'Log In'}
            </button>
         </form>

         <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase">Or</span>
            <div className="flex-grow border-t border-slate-200"></div>
         </div>

         <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-base py-3 rounded-xl border border-slate-200 transition-colors shadow-sm flex items-center justify-center gap-3 disabled:opacity-70 cursor-pointer"
         >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
         </button>
      </div>
  );
}
