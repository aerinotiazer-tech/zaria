import React from 'react';
import { useAdmin } from './AdminContext';
import { useFirestore } from '../hooks/useFirestore';
import { Clock, TrendingUp, ShoppingBag, Car, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { selectedPosId, activePOS } = useAdmin();
  const { data: orders, loading } = useFirestore('orders', 'timestamp');
  const { data: drivers } = useFirestore('drivers');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 bg-white/50 border border-neutral-100">
        <div className="flex items-center gap-3 text-neutral-450 font-mono text-[10px] tracking-[0.2em] uppercase">
          <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent animate-spin rounded-none"></div>
          <span>CHARGEMENT DES COMPAGNIES HQ...</span>
        </div>
      </div>
    );
  }

  // Filter based on POS
  const filteredOrders = selectedPosId === 'ALL' ? orders : orders.filter((o: any) => o.posId === selectedPosId);
  const filteredDrivers = selectedPosId === 'ALL' ? drivers : drivers.filter((d: any) => d.posId === selectedPosId);

  // Stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = filteredOrders.filter((o: any) => new Date(o.createdAt || o.timestamp).getTime() > todayStart.getTime());
  
  const activeOrders = filteredOrders.filter((o: any) => !['completed', 'cancelled'].includes(o.status));
  const revenueToday = todayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const activeDrivers = filteredDrivers.filter((d: any) => d.status === 'available' || d.status === 'delivering');

  const StatCard = ({ title, value, icon, isDark, link, trend }: any) => (
    <Link 
      to={link || '#'} 
      className={`p-6 rounded-none border transition-all block relative group ${
        isDark 
          ? 'bg-neutral-900 border-neutral-950 text-white hover:bg-black' 
          : 'bg-white border-neutral-150 hover:border-neutral-400 text-neutral-900'
      }`}
    >
      <div className="flex justify-between items-start mb-6">
         <h3 className={`text-[9px] font-black tracking-[0.25em] uppercase ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{title}</h3>
         <div className={`${isDark ? 'text-neutral-400' : 'text-neutral-300'}`}>
           {React.cloneElement(icon, { className: "w-4 h-4" })}
         </div>
      </div>
      <p className="text-3xl font-light font-mono tracking-tight">{value}</p>
      {trend && (
        <div className={`mt-3 text-[9px] font-mono tracking-wider ${isDark ? 'text-neutral-500' : 'text-neutral-400'} uppercase`}>
          {trend}
        </div>
      )}
    </Link>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1450px]">
       <div className="border-b border-neutral-200 pb-5">
         <h1 className="text-xl sm:text-2xl font-light text-neutral-950 mb-1 tracking-[0.2em] uppercase">
           {activePOS ? `${activePOS.name.toUpperCase()}` : 'MAISON ZARIA (HQ GLOBAL)'}
         </h1>
         <p className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase font-semibold">SUIVI DES SALONS ET COMMANDES ATELIER</p>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard 
            title="TRAITEMENT EN COURS" 
            value={activeOrders.length} 
            icon={<Clock />}
            isDark={true}
            link="/admin/orders"
            trend={activeOrders.length > 0 ? "Flux de commandes actif" : "Aucune file d'attente"}
          />
          <StatCard 
            title="COMMANDES DU JOUR" 
            value={todayOrders.length} 
            icon={<ShoppingBag />}
            link="/admin/orders"
            trend="Volumes de vente bruts"
          />
          <StatCard 
            title="RECETTES DU JOUR" 
            value={`${revenueToday.toLocaleString()} Ar`} 
            icon={<TrendingUp />}
            trend="Monnaie courante locale"
          />
          <StatCard 
            title="CHAUFFEURS PRIVÉS" 
            value={activeDrivers.length} 
            icon={<Car />}
            link="/admin/drivers"
            trend="Logistique d'exception"
          />
       </div>

       {/* Latest Orders Preview */}
       <div className="bg-white p-6 sm:p-8 rounded-none border border-neutral-150 shadow-none">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
            <h2 className="text-xs font-bold text-neutral-900 tracking-[0.2em] uppercase flex items-center gap-3">
              <span>Commandes Récentes</span>
              <span className="bg-neutral-900 text-white px-2 py-0.5 text-[9px] font-mono">{activeOrders.length}</span>
            </h2>
            <Link to="/admin/orders" className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 hover:text-black uppercase transition-colors flex items-center gap-1">
              <span>VOIR TOUT</span> <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {activeOrders.length === 0 ? (
            <div className="text-center py-16 bg-neutral-50 rounded-none border border-dashed border-neutral-200 text-neutral-400 font-mono text-[10px] tracking-widest uppercase flex flex-col items-center justify-center">
              <AlertCircle className="w-5 h-5 mb-3 text-neutral-300 shrink-0" />
              <span>Aucune commande en cours pour le moment.</span>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
               {activeOrders.slice(0, 5).map((order: any) => {
                 const statusColors: any = {
                   pending: 'border-amber-200 text-amber-900 bg-amber-50/50',
                   accepted: 'border-blue-200 text-blue-950 bg-blue-50/50',
                   preparing: 'border-yellow-200 text-yellow-905 bg-yellow-50/50',
                   delivering: 'border-purple-200 text-purple-950 bg-purple-50/50',
                   completed: 'border-neutral-200 text-neutral-600 bg-neutral-50/30'
                 };
                 return (
                   <div key={order.id} className="py-4 hover:bg-neutral-50/40 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4 px-1">
                     <div className="space-y-1">
                       <div className="flex items-center gap-3">
                         <span className="font-mono text-xs font-semibold text-neutral-950">#{order.orderNumber}</span>
                         <span className="text-[8px] font-mono border border-neutral-200 px-1.5 py-0.5 bg-neutral-50 text-neutral-500 uppercase tracking-widest">{order.type}</span>
                       </div>
                       <p className="text-[10px] tracking-widest text-neutral-400 uppercase font-sans">{order.customerName || 'Client anonyme'}</p>
                     </div>
                     <div className="text-left sm:text-right space-y-1">
                       <p className="font-mono text-xs font-bold text-neutral-950">{order.total?.toLocaleString()} Ar</p>
                       <span className={`text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 border inline-block ${statusColors[order.status] || 'border-neutral-200 text-neutral-500'}`}>
                         {order.status}
                       </span>
                     </div>
                   </div>
                 );
               })}
            </div>
          )}
       </div>
    </div>
  );
}
