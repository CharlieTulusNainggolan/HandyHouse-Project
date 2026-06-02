'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setError("");

      if (!name || !email || !password) {
          setError("Silakan lengkapi semua kolom pendaftaran.");
          return;
      }
      
      if (!terms) {
          setError("Anda harus menyetujui syarat dan ketentuan.");
          return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      const res = await registerUser(formData);

      if (!res.success) {
          setError(res.message || "Gagal melakukan pendaftaran.");
          setLoading(false);
          return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
          router.push("/login");
      }, 2000);
  }

  if (success) {
      return (
          <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-3xl text-center shadow-lg">
             <div className="text-5xl mb-4">🎉</div>
             <h2 className="text-2xl font-black mb-2">Pendaftaran Berhasil!</h2>
             <p className="font-medium text-green-600">Akun Anda telah tersimpan di sistem. Mengarahkan Anda ke Halaman Login...</p>
          </div>
      );
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
         {error && (
             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-bold text-sm text-center">
                 {error}
             </div>
         )}
         
         <div>
           <label className="block text-sm font-semibold text-[#8c3e1e] mb-1.5">Email</label>
           <input 
             type="email" 
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             placeholder="your_email@example.com" 
             className="w-full bg-white px-4 py-3 rounded-xl border border-[#8c3e1e] focus:outline-none focus:ring-2 focus:ring-[#d45d25] transition-all text-slate-800" 
             required 
           />
        </div>

        <div>
           <label className="block text-sm font-semibold text-[#8c3e1e] mb-1.5">Password</label>
           <div className="relative">
             <input 
               type="password" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="••••••••" 
               className="w-full bg-white pl-4 pr-10 py-3 rounded-xl border border-[#8c3e1e] focus:outline-none focus:ring-2 focus:ring-[#d45d25] transition-all text-slate-800" 
               required 
             />
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#8c3e1e] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-80">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
             </svg>
           </div>
        </div>

        <div>
           <label className="block text-sm font-semibold text-[#8c3e1e] mb-1.5">Full Name</label>
           <div className="relative">
             <input 
               type="text" 
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Jane Doe" 
               className="w-full bg-white pl-4 pr-10 py-3 rounded-xl border border-[#8c3e1e] focus:outline-none focus:ring-2 focus:ring-[#d45d25] transition-all text-slate-800" 
               required 
             />
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#8c3e1e] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-80">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
             </svg>
           </div>
        </div>

        <div className="flex items-center space-x-2 py-2">
           <input 
             type="checkbox" 
             id="terms" 
             checked={terms}
             onChange={(e) => setTerms(e.target.checked)}
             className="w-5 h-5 rounded text-[#f97316] accent-[#f97316] border border-[#8c3e1e] focus:ring-[#f97316] cursor-pointer"
           />
           <label htmlFor="terms" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
              I accept the terms of the agreement
           </label>
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-[#f97316] text-white font-bold text-lg py-3.5 mt-2 rounded-xl hover:bg-[#d45d25] transition-colors shadow-md disabled:opacity-70">
           {loading ? "Memproses..." : "Sign up"}
        </button>
     </form>
  );
}

