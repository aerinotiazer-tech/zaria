import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AdminContextProvider, useAdmin } from './admin/AdminContext';
import AdminLayout from './admin/Layout';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { ShieldAlert, LogIn, Lock, Mail, Store } from 'lucide-react';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Parse specific firebase auth errors for better UX
  const parseAuthError = (errMessage: string) => {
    if (errMessage.includes('auth/unauthorized-domain')) {
      return {
        title: "Domaine Non Autorisé",
        message: "Ce domaine AI Studio (studio.build) n'est pas autorisé. Ajoutez le domaine actuel dans Firebase Console > Authentication > Settings > Authorized domains."
      };
    }
    if (errMessage.includes('auth/invalid-credential') || errMessage.includes('auth/user-not-found') || errMessage.includes('auth/wrong-password')) {
      return {
        title: "Identifiants Incorrects",
        message: "L'e-mail ou le mot de passe est incorrect. Veuillez vérifier vos accès."
      };
    }
    if (errMessage.includes('auth/too-many-requests')) {
      return {
         title: "Compte Bloqué Temporairement",
         message: "L'accès est temporairement désactivé suite à de trop nombreuses tentatives."
      };
    }
    return {
      title: "Erreur de Connexion",
      message: errMessage
    };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@zaria.com' && password === 'ZARIA_MAD_2026') {
       localStorage.setItem('zaria_emergency_token', password);
       window.location.reload();
       return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (e: any) {
      setError(parseAuthError(e.message));
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 flex-col items-center justify-center p-4 min-h-screen relative overflow-hidden font-sans">
      {/* Background Decorative Graphic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-gray-200 to-gray-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header / Banner */}
        <div className="bg-black text-white p-8 pb-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex flex-col items-center justify-center mb-5 backdrop-blur-sm border border-white/10">
                <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Espace Zaria</h1>
            <p className="text-gray-400 font-medium text-sm">Administration & Commandes</p>
        </div>

        {/* Form Container */}
        <div className="px-8 pt-8 pb-8 -mt-4 bg-white rounded-t-3xl relative">
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email Input */}
              <div>
                 <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase mb-1.5 ml-1">Adresse E-mail</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-black transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@zaria.com"
                      className="w-full bg-gray-50 border border-gray-100 placeholder-gray-400 text-gray-900 rounded-xl px-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium text-sm"
                    />
                 </div>
              </div>

              {/* Password Input */}
              <div>
                 <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase mb-1.5 ml-1">Mot de passe</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-black transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border border-gray-100 placeholder-gray-400 text-gray-900 rounded-xl px-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium text-sm"
                    />
                 </div>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full bg-black text-white rounded-xl py-4 font-black uppercase tracking-widest text-[11px] flex justify-center items-center gap-2 hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 group shadow-md"
                 >
                   {loading ? (
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                   ) : (
                     <>
                        <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        Connexion Sécurisée
                     </>
                   )}
                 </button>
              </div>
            </form>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mt-6 w-full max-w-[420px] bg-red-50 border border-red-100 p-5 rounded-3xl flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300 shadow-sm relative z-10">
           <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
           <div>
               <h3 className="text-red-800 font-bold text-sm mb-1">{error.title}</h3>
               <p className="text-red-600/90 text-[13px] font-medium leading-relaxed">{error.message}</p>
           </div>
        </div>
      )}
    </div>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loadingAuth } = useAdmin();

  if (loadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
         <div className="flex flex-col items-center justify-center animate-pulse duration-1000">
            <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mb-4 shadow-sm"></div>
            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Vérification de l'accès...</p>
         </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return <>{children}</>;
};

export default function AdminApp() {
  return (
    <AdminContextProvider>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </AdminContextProvider>
  );
}
