import React, { useState } from 'react';
import { useAdmin } from './AdminContext';
import { useFirestore } from '../hooks/useFirestore';
import { Search, MapPin, Phone, Check, ChevronDown, Clock, Filter, AlertCircle, ShoppingBag } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Orders() {
  const { selectedPosId } = useAdmin();
  const { data: orders, loading } = useFirestore('orders', 'timestamp', undefined, 100); // Last 100 orders
  
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [search, setSearch] = useState('');

  if (loading) {
    return <div className="text-gray-500 font-bold flex items-center gap-2"><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> Chargement des commandes...</div>;
  }

  // Filter logic
  let filtered = selectedPosId === 'ALL' ? orders : orders.filter((o: any) => o.posId === selectedPosId);
  
  if (filterStatus === 'active') {
    filtered = filtered.filter((o: any) => !['completed', 'cancelled'].includes(o.status));
  } else if (filterStatus !== 'all') {
    filtered = filtered.filter((o: any) => o.status === filterStatus);
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((o: any) => 
      o.orderNumber?.toString().includes(s) || 
      o.customerName?.toLowerCase().includes(s) ||
      o.phone?.includes(s)
    );
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (e: any) {
      alert("Erreur: " + e.message);
    }
  };

  const statusMap: any = {
    pending: { label: 'En attente', color: 'bg-yellow-50 text-yellow-800 border-yellow-250 bg-yellow-50' },
    preparing: { label: 'En confection', color: 'bg-orange-50 text-orange-900 border-orange-255 bg-orange-50' },
    completed: { label: 'Terminée', color: 'bg-emerald-50 text-emerald-850 border-emerald-250 bg-emerald-50' },
    cancelled: { label: 'Annulée', color: 'bg-red-50 text-red-850 border-red-255 bg-red-50' }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-light text-neutral-950 mb-2 tracking-[0.1em] uppercase">Commandes d'Exception</h1>
          <p className="text-gray-550 font-medium text-xs uppercase tracking-widest">Suivi d'Atelier, confection et haute couture en temps réel.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="N° Commande, Client, Téléphone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-200 rounded-none text-xs tracking-wider focus:outline-none focus:border-black transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-550 pointer-events-none" />
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-10 py-2.5 bg-white border border-neutral-200 rounded-none text-xs tracking-widest font-bold focus:outline-none focus:border-black transition-all appearance-none cursor-pointer uppercase"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
            >
              <option value="active">En Atelier</option>
              <option value="all">Toutes</option>
              <option value="pending">En attente</option>
              <option value="completed">Livrées</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-none border border-dashed border-neutral-150 text-gray-550 font-mono text-xs tracking-wider flex flex-col items-center shadow-none">
            <AlertCircle className="w-12 h-12 mb-4 text-gray-300" />
            Aucune commande correspondante.
          </div>
        ) : filtered.map((order: any) => {
          const statusInfo = statusMap[order.status] || { label: order.status, color: 'bg-white text-gray-800 border-neutral-200 bg-neutral-50' };
          
          return (
            <div key={order.id} className="bg-white rounded-none border border-neutral-150 overflow-hidden flex flex-col lg:flex-row transition-all hover:border-neutral-400">
              <div className="flex-1 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-neutral-150">
                 <div className="flex flex-wrap items-center gap-3 mb-4">
                   <h3 className="font-light text-xl text-neutral-950 tracking-tight">#{order.orderNumber}</h3>
                   <span className={`px-2.5 py-1 select-none rounded-none bg-white text-[9px] font-bold text-black uppercase tracking-widest border border-neutral-200`}>
                     {statusInfo.label}
                   </span>
                   <span className="px-2 py-1 bg-neutral-50 text-neutral-600 rounded-none text-[9px] uppercase font-bold tracking-widest border border-neutral-150">
                     {order.orderMode === 'livraison' ? 'Livraison Couture' : 'Retrait Salon'}
                   </span>
                   <div className="ml-auto text-[10px] font-mono text-gray-500 flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 border border-neutral-150">
                     <Clock className="w-3.5 h-3.5 text-neutral-450"/>
                     {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-neutral-50/55 p-4 border border-neutral-150/60">
                   <div>
                     <p className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Phone className="w-3 h-3"/> Client Couture</p>
                     <p className="font-light text-neutral-950 text-base">{order.customerName || 'Anonyme'}</p>
                     <p className="text-xs font-mono tracking-wider text-black mt-1">{order.phone}</p>
                   </div>
                   <div>
                     <p className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3"/> {order.orderMode === 'livraison' ? 'Adresse de réception' : 'Salon de Retrait'}</p>
                     <p className="text-xs font-medium text-neutral-700 leading-snug line-clamp-2">{order.orderMode === 'livraison' ? order.address : order.posName}</p>
                     {selectedPosId === 'ALL' && <p className="mt-2 inline-block px-2 py-0.5 bg-white text-black text-[9px] font-bold tracking-widest border border-neutral-200 uppercase">Salon : {order.posName}</p>}
                   </div>
                 </div>
                 
                 {order.items && order.items.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-neutral-150 text-xs text-neutral-600 font-mono tracking-wider flex items-center gap-2">
                     <ShoppingBag className="w-4 h-4 text-neutral-400" />
                     <span className="line-clamp-1">{order.items.length} création(s) : {order.items.map((i:any) => `${i.quantity}x ${i.name}`).join(', ')}</span>
                   </div>
                 )}
              </div>
              
              <div className="flex flex-col gap-4 lg:w-72 shrink-0 bg-neutral-50/45 p-5 lg:p-6 justify-between border-t lg:border-t-0 border-neutral-150">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Check className="w-3 h-3" /> Statut de Confection</p>
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          className="w-full pl-3 pr-8 py-2.5 bg-black text-white rounded-none text-[10px] tracking-widest font-bold uppercase focus:outline-none appearance-none cursor-pointer transition-all"
                        >
                          <option value="pending">En attente d'atelier</option>
                          <option value="preparing">En confection</option>
                          <option value="completed">Création Livrée / Prise</option>
                          <option value="cancelled">Annuler la commande</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-neutral-200 flex items-center justify-between">
                     <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Total Prestige</span>
                     <p className="font-light text-xl tracking-tight text-neutral-950">{order.total?.toLocaleString()} <span className="text-[10px] text-neutral-500 font-mono leading-none ml-1">Ar</span></p>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
