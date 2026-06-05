import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import { LayoutDashboard, ShoppingBag, List, Users, Car, Package, Settings, Store, Menu, LogOut, Eye, Filter, Clock, Star, Tag, FileText, Sparkles } from 'lucide-react';
import Dashboard from './Dashboard';
import Orders from './Orders';
import Products from './Products';
import POSManager from './POSManager';
import AdminSettings from './Settings';
import UsersAdmin from './Users';
import Reservations from './Reservations';
import Categories from './Categories';
import Collections from './Collections';
import Callbacks from './Callbacks';
import Promos from './Promos';
import Reviews from './Reviews';
import Pages from './Pages';

// Helpers
export const hasPermission = (userRole: string | null, required: string) => {
  if (!userRole) return false;
  if (['super_admin', 'admin'].includes(userRole)) return true;
  if (userRole === 'manager') return ['orders', 'products', 'pos_staff', 'dashboard'].includes(required);
  if (userRole === 'staff') return ['orders', 'dashboard'].includes(required);
  return false;
};

export default function AdminLayout() {
  const { user, role, loadingAuth, logout, selectedPosId, setSelectedPosId, posList, activePOS } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-[#FFC72C] border-t-[#DA291C] rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  if (role === 'viewer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-none shadow-xl max-w-md w-full text-center border border-gray-100">
           <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-black text-gray-900 mb-2">En attente d'approbation</h2>
           <p className="text-gray-500 font-medium mb-6">Votre compte professionnel a été créé avec succès. Veuillez attendre qu'un administrateur valide vos accès avant de pouvoir utiliser l'espace Staff.</p>
           <button onClick={logout} className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-none hover:bg-gray-200 transition-colors w-full">Déconnexion</button>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: "SUIVI & COMMANDES ATELIER",
      items: [
        { name: 'DASHBOARD', path: '/admin', icon: <LayoutDashboard className="w-4 h-4"/>, permission: 'dashboard' },
        { name: 'Commandes d\'Exception', path: '/admin/orders', icon: <ShoppingBag className="w-4 h-4"/>, permission: 'orders' },
        { name: 'Rappels WhatsApp', path: '/admin/callbacks', icon: <Clock className="w-4 h-4"/>, permission: 'orders' },
        { name: 'Avis Clients', path: '/admin/reviews', icon: <Star className="w-4 h-4"/>, permission: 'orders' },
      ].filter(item => hasPermission(role, item.permission))
    },
    {
      title: "CATALOGUE & STYLES",
      items: [
        { name: 'Créations Couture', path: '/admin/products', icon: <List className="w-4 h-4"/>, permission: 'products' },
        { name: 'Catégories', path: '/admin/categories', icon: <List className="w-4 h-4"/>, permission: 'products' },
        { name: 'Collections', path: '/admin/collections', icon: <Sparkles className="w-4 h-4"/>, permission: 'products' },
        { name: 'Codes Prestige', path: '/admin/promos', icon: <Tag className="w-4 h-4"/>, permission: 'products' },
      ].filter(item => hasPermission(role, item.permission))
    },
    {
      title: "SERVICES DE LA MAISON",
      items: [
        { name: 'Salons & Boutiques', path: '/admin/pos', icon: <Store className="w-4 h-4"/>, permission: 'manage_system' },
        { name: 'Artisans & Rôles', path: '/admin/users', icon: <Users className="w-4 h-4"/>, permission: 'manage_system' },
        { name: 'Pages Continents', path: '/admin/pages', icon: <FileText className="w-4 h-4"/>, permission: 'manage_system' },
        { name: 'Paramètres Généraux', path: '/admin/settings', icon: <Settings className="w-4 h-4"/>, permission: 'manage_system' },
      ].filter(item => hasPermission(role, item.permission))
    }
  ].filter(sec => sec.items.length > 0);

  const roleText: any = {
    super_admin: 'Grand Directeur de Maison',
    admin: 'Directeur Général',
    manager: 'Directeur de Salon',
    staff: 'Artisan Couturier',
    editor: 'Directeur Artistique',
    viewer: 'Auditeur de Maison'
  };

  const isGlobalAdmin = ['super_admin', 'admin'].includes(role || '');

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex font-sans text-neutral-900 select-none">
      {/* Sidebar - Zero heavy shadow, strict thin border-r for high-fashion boutique feel */}
      <aside className={`bg-white border-r border-neutral-200/80 w-64 shrink-0 fixed md:relative h-full transition-all duration-300 z-50 rounded-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'} flex flex-col justify-between`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Zara HQ brand */}
          <div className="p-6 border-b border-neutral-100 flex flex-col justify-start relative">
            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 md:hidden p-2 text-neutral-400 hover:text-black">
               <Menu className="w-5 h-5"/>
            </button>
            
            <div className="flex flex-col items-start py-2 w-full">
               <span className="font-display font-medium text-2xl tracking-[0.25em] text-neutral-950 uppercase select-none">
                 ZARIA
               </span>
               <div className="text-[8px] font-mono tracking-[0.3em] text-neutral-450 uppercase mt-0.5">HQ ADMINISTRATEUR</div>
            </div>

            <div className="mt-4 flex items-center justify-between bg-neutral-50 px-3 py-2 border border-neutral-100/70">
              <span className="text-[9px] font-bold text-neutral-700 tracking-[0.1em] uppercase">{roleText[role!] || 'Staff'}</span>
              <span className="text-[8px] font-mono text-neutral-400 tracking-wider">ONLINE</span>
            </div>
          </div>
          
          {/* Navigation with strict vertical spacing and minimal lines */}
          <nav className="p-5 flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar">
            {sections.map(sec => (
              <div key={sec.title} className="space-y-1.5">
                <span className="block text-[8px] font-black text-neutral-400 tracking-[0.3em] uppercase mb-1 px-3">
                  {sec.title}
                </span>
                <div className="flex flex-col gap-1">
                  {sec.items.map(item => {
                     const isActive = location.pathname === item.path;
                     return (
                      <Link 
                        key={item.path} 
                        to={item.path} 
                        onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 transition-all text-[11px] tracking-widest uppercase border-l-2 ${isActive ? 'border-neutral-950 text-neutral-950 font-semibold bg-neutral-50/50' : 'border-transparent text-neutral-400 hover:text-neutral-950 hover:bg-neutral-50/20 group'}`}
                      >
                        <div className={`${isActive ? 'text-neutral-950' : 'text-neutral-300 group-hover:text-neutral-950'} transition-colors shrink-0`}>
                          {item.icon}
                        </div>
                        <span>{item.name}</span>
                      </Link>
                     );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Minimal Footer */}
        <div className="p-5 border-t border-neutral-100 bg-neutral-50/30 flex flex-col gap-2">
           <Link to="/" target="_blank" className="flex items-center gap-2.5 px-3 py-2 text-[10px] tracking-widest font-bold uppercase text-neutral-500 hover:text-neutral-950 transition-colors">
              <Eye className="w-4 h-4 text-neutral-300"/> 
              <span>SITE PUBLIC</span>
           </Link>
           <button 
             onClick={logout}
             className="flex items-center gap-2.5 px-3 py-2 text-[10px] tracking-widest font-bold uppercase text-red-600 hover:bg-neutral-100 transition-all w-full text-left"
           >
              <LogOut className="w-4 h-4 text-red-300"/> 
              <span>DÉCONNEXION</span>
           </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
         <div className="fixed inset-0 bg-neutral-950/20 z-40 md:hidden backdrop-blur-[2px] transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative overflow-hidden">
        {/* Header - Editorial minimal row with thin line */}
        <header className="bg-white border-b border-neutral-150 h-16 flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0 shadow-none">
           <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 focus:outline-none transition-colors rounded-none">
                <Menu className="w-4 h-4 text-neutral-700"/>
              </button>
              
              {/* POS SELECTOR FOR GLOBAL ADMINS */}
              {isGlobalAdmin && (
                <div className="hidden sm:flex items-center gap-2 bg-neutral-50 px-3 py-1.5 border border-neutral-200 rounded-none hover:border-neutral-300 transition-colors">
                  <Filter className="w-3.5 h-3.5 text-neutral-400" />
                  <select 
                    value={selectedPosId}
                    onChange={e => setSelectedPosId(e.target.value)}
                    className="bg-transparent font-bold text-neutral-800 focus:outline-none text-[10px] sm:text-[11px] tracking-widest uppercase appearance-none pr-8 cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .2rem top 50%', backgroundSize: '.6rem auto' }}
                  >
                    <option value="ALL">VUE GLOBALE (HQ INTÉGRAL)</option>
                    {posList.map((pos: any) => (
                      <option key={pos.id} value={pos.id}>{pos.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              )}
              {!isGlobalAdmin && activePOS && (
                <div className="hidden sm:flex bg-neutral-50 text-neutral-700 px-3 py-1.5 border border-neutral-200 font-bold text-[10px] tracking-wider uppercase items-center gap-2">
                  <Store className="w-3.5 h-3.5" /> BOUTIQUE : {activePOS.name.toUpperCase()}
                </div>
              )}
           </div>
           
           <div className="flex items-center gap-4">
               <div className="hidden sm:flex flex-col items-end pr-4 border-r border-neutral-100">
                  <span className="text-[11px] font-bold text-neutral-950 tracking-wide">{user.email?.toLowerCase()}</span>
                  <span className="text-[9px] font-medium text-neutral-400 tracking-wider uppercase">{roleText[role!]}</span>
               </div>
               <div className="w-8 h-8 rounded-none bg-neutral-950 flex items-center justify-center text-white text-xs font-light tracking-widest cursor-default">
                 {user.email?.charAt(0).toUpperCase()}
               </div>
           </div>
        </header>

        {isGlobalAdmin && (
          <div className="sm:hidden p-4 border-b border-neutral-100 bg-white">
            <div className="flex items-center gap-2 bg-neutral-50 p-2 border border-neutral-250 w-full rounded-none">
              <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
              <select 
                value={selectedPosId}
                onChange={e => setSelectedPosId(e.target.value)}
                className="bg-transparent font-bold w-full text-neutral-800 focus:outline-none text-xs appearance-none pr-8 cursor-pointer uppercase tracking-wider"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .2rem top 50%', backgroundSize: '.65rem auto' }}
              >
                <option value="ALL">VUE GLOBALE</option>
                {posList.map((pos: any) => (
                  <option key={pos.id} value={pos.id}>{pos.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {!isGlobalAdmin && activePOS && (
          <div className="sm:hidden px-4 py-2 bg-neutral-50 text-neutral-850 border-b border-neutral-100 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2">
            <Store className="w-3.5 h-3.5 text-neutral-500" /> {activePOS.name.toUpperCase()}
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-[#fafafa] p-4 sm:p-8">
           <Routes>
             <Route path="/" element={<Dashboard />} />
             <Route path="orders" element={<Orders />} />
             <Route path="categories" element={<Categories />} />
             <Route path="collections" element={<Collections />} />
             <Route path="products" element={<Products />} />
             <Route path="pos" element={<POSManager />} />
             <Route path="users" element={<UsersAdmin />} />
             <Route path="settings" element={<AdminSettings />} />
             <Route path="reservations" element={<Reservations />} />
             <Route path="callbacks" element={<Callbacks />} />
             <Route path="promos" element={<Promos />} />
             <Route path="reviews" element={<Reviews />} />
             <Route path="pages" element={<Pages />} />
           </Routes>
        </main>
      </div>
    </div>
  );
}
