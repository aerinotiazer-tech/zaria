import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../App';
import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Clock, 
  ShoppingBag, 
  ArrowLeft, 
  User, 
  HelpCircle,
  CreditCard
} from 'lucide-react';

export function PageTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { formatPriceC, globalConfig } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const docRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setOrder(docSnap.data());
      } else {
        setOrder(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching order:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-24 pb-32 px-4">
        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-mono">Chargement du reçu...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-24 pb-32 px-4 text-center">
        <h1 className="font-display text-4xl text-black mb-4 uppercase">Commande Introuvable</h1>
        <p className="font-sans text-xs uppercase tracking-widest text-gray-500 max-w-md leading-relaxed mb-8">
          La commande demandée est introuvable ou a été archivée. Si vous pensez qu'il s'agit d'une erreur, contactez notre service client.
        </p>
        <button 
          onClick={() => navigate('/collection')}
          className="border border-black hover:bg-black hover:text-white text-black px-8 py-3.5 text-[10px] uppercase tracking-[0.25em] font-medium transition-all"
        >
          Découvrir nos créations
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="bg-white min-h-screen pt-24 pb-32 select-none text-black"
    >
      <div className="max-w-[700px] mx-auto px-4 sm:px-6">
        
        {/* Header Navigation */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-8 mb-8">
          <div className="space-y-1">
            <h1 className="text-xl font-display uppercase tracking-[0.1em] font-light">
              Reçu de Commande
            </h1>
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-gray-400">
              Commande Enregistrée
            </span>
          </div>
          
          <button 
            type="button"
            onClick={() => navigate('/collection')}
            className="flex items-center gap-1 font-sans text-[10px] uppercase tracking-widest text-[#555] hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Fermer</span>
          </button>
        </div>

        {/* Receipt Container */}
        <div className="border border-neutral-200 p-6 sm:p-10 space-y-8 bg-neutral-50/50">
          
          <div className="flex flex-col sm:flex-row justify-between border-b border-neutral-200 pb-6 gap-4">
            <div>
              <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-1">RÉFÉRENCE DE COMMANDE</span>
              <span className="font-mono text-xs uppercase tracking-widest font-black text-black">
                {order.orderNumber || order.id?.toUpperCase().slice(0, 8)}
              </span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-1">MODE DE RÉCEPTION</span>
              <span className="text-xs uppercase tracking-widest font-bold text-black font-sans">
                {order.orderMode === 'livraison' ? 'Livraison à Domicile' : 'Retrait en Boutique'}
              </span>
            </div>
          </div>

          {/* Delivery & Contacts Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-neutral-200">
            <div className="space-y-1">
              <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold">DESTINATAIRE</span>
              <span className="text-xs uppercase tracking-widest text-[#222] font-semibold block">{order.customerName}</span>
              <span className="text-xs font-mono text-[#555] block">{order.phone}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                {order.orderMode === 'livraison' ? 'ADRESSE DE LIVRAISON' : 'BOUTIQUE DE RETRAIT'}
              </span>
              <p className="text-xs uppercase tracking-wider text-[#444] leading-relaxed max-w-xs block">
                {order.orderMode === 'livraison' ? order.address : order.posName}
              </p>
            </div>
          </div>

          {/* Items Summary list */}
          <div>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-4">ARTICLES RÉSERVÉS</span>
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-xs uppercase tracking-widest pb-3 border-b border-neutral-150/40 last:border-b-0">
                  <div className="flex-1 pr-4">
                    <span className="text-black font-semibold block leading-tight mb-0.5">{item.quantity}x {item.product?.name}</span>
                    {item.instructions && <span className="text-[8px] text-neutral-400 block tracking-widest font-medium">{item.instructions}</span>}
                  </div>
                  <span className="text-neutral-800 font-medium shrink-0">{formatPriceC(item.product?.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-neutral-200 pt-6 space-y-3 text-xs uppercase tracking-widest">
            <div className="flex justify-between text-neutral-500 text-[10px]">
              <span>Sous-total Réel</span>
              <span>{formatPriceC(order.total - (order.orderMode === 'livraison' ? (globalConfig?.deliveryFee || 0) : 0))}</span>
            </div>
            {order.orderMode === 'livraison' && (
              <div className="flex justify-between text-neutral-500 text-[10px]">
                <span>Frais de livraison</span>
                <span>{formatPriceC(globalConfig?.deliveryFee || 0)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t border-neutral-200 font-bold text-black font-sans">
              <span>TOTAL BRUT</span>
              <span>{formatPriceC(order.total)}</span>
            </div>
          </div>

          {/* Validation confirmation banner */}
          <div className="pt-2 border-t border-neutral-200">
            <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-2">VALIDATION DU CLIENT</span>
            <div className="bg-neutral-900 text-white p-4 text-center">
              <span className="block text-[10px] uppercase tracking-[0.2em] font-extrabold mb-1">Règlement à la livraison</span>
              <span className="block text-[9px] uppercase tracking-[0.16em] text-neutral-300 leading-normal font-medium">
                {order.paymentMethod === 'cash' 
                  ? 'Paiement en espèces auprès de notre Chauffeur Privé lors de la remise en mains propres.' 
                  : `Règlement à effectuer par mobile money (${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'MVOLA'}) auprès de notre Chauffeur Privé lors de la réception.`}
              </span>
            </div>
          </div>

        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col gap-3 font-display">
          <a 
            href={`https://wa.me/${globalConfig?.whatsappSupport || '261320000000'}?text=${encodeURIComponent(
              `Bonjour Maison Zaria, je vous contacte à propos de mon reçu de commande ${order.orderNumber || order.id}.\n\nClient: ${order.customerName}\nTéléphone: ${order.phone}\nTotal: ${formatPriceC(order.total)}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full text-center bg-black hover:bg-neutral-900 text-white border border-black uppercase tracking-[0.22em] py-4 hover:opacity-90 transition-all font-semibold text-xs"
          >
            Suivre ma livraison d'Exception sur WhatsApp
          </a>
          
          <button 
            type="button"
            onClick={() => navigate('/collection')}
            className="w-full border border-neutral-200 hover:border-black text-black uppercase tracking-[0.22em] py-4 hover:bg-neutral-50 transition-all font-medium text-xs bg-white animate-fade-in"
          >
            Continuer mes achats
          </button>
        </div>

      </div>
    </motion.div>
  );
}
