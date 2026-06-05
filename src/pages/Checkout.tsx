import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Phone, CreditCard, Banknote, Clock, MapPin, Loader2, X } from 'lucide-react';
import { useCart } from '../App';
import { useFirestore } from '../hooks/useFirestore';
import { auth, db } from '../firebase';
import { doc, setDoc, collection } from 'firebase/firestore';

export function PageCheckout() {
  const { cart, getCartTotal, clearCart, formatPriceC, globalConfig, selectedPOS, activeOrder, setActiveOrder, isLoggedIn } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderMode, setOrderMode] = useState<'livraison' | 'emporter'>('livraison');
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('zaria_checkout_name') || '');
  const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem('zaria_checkout_phone') || '');
  const [address, setAddress] = useState(() => localStorage.getItem('zaria_checkout_address') || '');
  const [deliveryTime, setDeliveryTime] = useState('asap');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  
  const { add: addOrder } = useFirestore('orders');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress(`${latitude}, ${longitude}`);
        }
      } catch (e) {
        setAddress(`${latitude}, ${longitude}`);
      } finally {
        setIsLoadingLocation(false);
      }
    }, () => {
      // Don't alert aggressively on auto-fetch, just stop loading
      setIsLoadingLocation(false);
    });
  };

  React.useEffect(() => {
    if (orderMode === 'livraison' && !address && !hasRequestedLocation) {
        setHasRequestedLocation(true);
        handleGetLocation();
    }
  }, [orderMode, address, hasRequestedLocation]);

  const totalDeliveryFee = orderMode === 'livraison' ? (globalConfig?.deliveryFee || 0) : 0;
  const total = getCartTotal() + totalDeliveryFee;
  const isMobileMoney = paymentMethod === 'mvola' || paymentMethod === 'airtel' || paymentMethod === 'omoney';

  const handlePayment = async () => {
    if (cart.length === 0) {
      setError("Votre panier est vide");
      return;
    }
    
    if (!customerName.trim()) {
      setError("Veuillez saisir votre nom complet.");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Veuillez saisir votre numéro de téléphone.");
      return;
    }

    if (orderMode === 'livraison' && !address.trim()) {
      setError("Veuillez saisir votre adresse de livraison.");
      return;
    }

    const isMobileMoney = paymentMethod === 'mvola' || paymentMethod === 'airtel' || paymentMethod === 'omoney';
    if (isMobileMoney && !isLoggedIn) {
      setError("La création d'un compte de membre est obligatoire pour tout règlement par Mobile Money.");
      return;
    }

    setIsProcessing(true);
    setError('');
    
    // Save to localStorage for future use
    localStorage.setItem('zaria_checkout_name', customerName);
    localStorage.setItem('zaria_checkout_phone', phoneNumber);
    localStorage.setItem('zaria_checkout_address', address);
    
    // Simulate payment API call
    setTimeout(async () => {
      try {
        const orderRef = doc(collection(db, 'orders'));
        const orderId = orderRef.id;
        const shortOrderNum = 'CMD-' + Math.floor(100000 + Math.random() * 900000).toString().substring(0, 4);

        let initialStatus = 'pending';
        if (globalConfig?.customStatuses && globalConfig.customStatuses.length > 0) {
           initialStatus = globalConfig.customStatuses[0].id;
        }

        const newOrderData: any = {
           id: orderId,
           orderNumber: shortOrderNum,
           status: initialStatus,
           total: total,
           items: [...cart],
           orderMode: orderMode,
           address: address || '',
           paymentMethod,
           customerName,
           phone: phoneNumber,
           paymentPhone: phoneNumber,
           deliveryTime,
           posId: selectedPOS?.id?.toString() || 'unknown',
           posName: selectedPOS?.name || 'Boutique inconnu',
           timestamp: Date.now()
        };
        
        if (isLoggedIn && auth.currentUser) newOrderData.userId = auth.currentUser.uid;
        
        // Save to firestore with correct ID
        await setDoc(orderRef, newOrderData);
        
        setActiveOrder(newOrderData);
        setConfirmedOrder(newOrderData);
        localStorage.setItem('zaria_active_order', JSON.stringify(newOrderData));
        clearCart();
        setSuccess(true);
      } catch (err) {
        console.error(err);
        setError("Une erreur est survenue lors du paiement. Veuillez réessayer.");
        setIsProcessing(false);
      }
    }, 1500);
  };

  if (success && confirmedOrder) {
    return (
      <div className="bg-white min-h-screen pt-24 pb-32 font-sans select-none animate-fade-in text-black">
        <div className="max-w-[700px] mx-auto px-4 sm:px-6">
          
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8 stroke-[1.2]" />
            </div>
            <h1 className="font-display text-2xl uppercase tracking-[0.15em] text-black">Commande Confirmée</h1>
            <p className="text-xs uppercase tracking-widest text-neutral-500 max-w-md mx-auto leading-relaxed">
              Votre commande <span className="font-mono text-black font-semibold">{confirmedOrder.orderNumber}</span> a été enregistrée avec succès. Notre équipe s'occupe de vos pièces.
            </p>
          </div>

          <div className="border border-neutral-200 p-6 sm:p-10 space-y-8 bg-neutral-50/50">
            <div className="flex flex-col sm:flex-row justify-between border-b border-neutral-200 pb-6 gap-4">
              <div>
                <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-1">RÉFÉRENCE DE COMMANDE</span>
                <span className="font-mono text-xs uppercase tracking-widest font-black text-black">{confirmedOrder.orderNumber}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-1">MODE DE RÉCEPTION</span>
                <span className="text-xs uppercase tracking-widest font-bold text-black font-sans">
                  {confirmedOrder.orderMode === 'livraison' ? 'Livraison à Domicile' : 'Retrait en Boutique'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-neutral-200">
              <div className="space-y-1">
                <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold">DESTINATAIRE</span>
                <span className="text-xs uppercase tracking-widest text-[#222] font-semibold block">{confirmedOrder.customerName}</span>
                <span className="text-xs font-mono text-[#555] block">{confirmedOrder.phone}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                  {confirmedOrder.orderMode === 'livraison' ? 'ADRESSE DE LIVRAISON' : 'BOUTIQUE DE RETRAIT'}
                </span>
                <p className="text-xs uppercase tracking-wider text-[#444] leading-relaxed max-w-xs block">
                  {confirmedOrder.orderMode === 'livraison' ? confirmedOrder.address : confirmedOrder.posName}
                </p>
              </div>
            </div>

            <div>
              <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-4">ARTICLES RÉSERVÉS</span>
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
                {confirmedOrder.items?.map((item: any, idx: number) => (
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

            <div className="border-t border-neutral-200 pt-6 space-y-3 text-xs uppercase tracking-widest">
              <div className="flex justify-between text-neutral-500 text-[10px]">
                <span>Sous-total Réel</span>
                <span>{formatPriceC(confirmedOrder.total - (confirmedOrder.orderMode === 'livraison' ? (globalConfig?.deliveryFee || 0) : 0))}</span>
              </div>
              {confirmedOrder.orderMode === 'livraison' && (
                <div className="flex justify-between text-neutral-500 text-[10px]">
                  <span>Frais de livraison</span>
                  <span>{formatPriceC(globalConfig?.deliveryFee || 0)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-neutral-200 font-bold text-black">
                <span>TOTAL BRUT</span>
                <span>{formatPriceC(confirmedOrder.total)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200">
              <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-2">VALIDATION DE LA COMMANDE</span>
              <div className="bg-neutral-900 text-white p-4 text-center">
                <span className="block text-[10px] uppercase tracking-[0.2em] font-extrabold mb-1">Règlement à la livraison</span>
                <span className="block text-[9px] uppercase tracking-[0.16em] text-neutral-300 leading-normal font-medium">
                  {confirmedOrder.paymentMethod === 'cash' 
                    ? 'Paiement en espèces auprès de notre Chauffeur Privé lors de la remise en mains propres de votre coffret.' 
                    : `Règlement à effectuer par mobile money (${confirmedOrder.paymentMethod.toUpperCase()}) auprès de notre Chauffeur Privé lors de la réception.`}
                </span>
              </div>
            </div>

          </div>

          <div className="mt-8 flex flex-col gap-3 font-display">
            <a 
              href={`https://wa.me/${globalConfig?.whatsappSupport || '261320000000'}?text=${encodeURIComponent(
                `Bonjour Maison Zaria, je viens de valider ma commande ${confirmedOrder.orderNumber}.\n\nClient: ${confirmedOrder.customerName}\nTéléphone: ${confirmedOrder.phone}\nTotal: ${formatPriceC(confirmedOrder.total)}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center bg-black hover:bg-neutral-900 text-white border border-black uppercase tracking-[0.22em] py-4 hover:opacity-90 transition-all font-semibold text-xs"
            >
              Confirmer la commande sur WhatsApp
            </a>
            
            <button 
              onClick={() => navigate('/collection')}
              className="w-full border border-neutral-200 hover:border-black text-black uppercase tracking-[0.22em] py-4 hover:bg-neutral-50 transition-all font-medium text-xs bg-white"
            >
              Retourner aux collections
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-white text-center">
        <h1 className="font-display text-4xl text-black mb-4 uppercase">Paiement Validé</h1>
        <p className="font-sans text-xs uppercase tracking-widest text-gray-500">Votre commande est confirmée et part en préparation.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-32">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-display text-black uppercase tracking-widest">Paiement</h1>
          <button onClick={() => navigate('/collection')} className="p-2 hover:opacity-50 transition-opacity">
             <X className="w-5 h-5 text-black stroke-[1]" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          
          <div className="flex-1 space-y-12">
             <div>
                <h3 className="font-display text-xs uppercase tracking-[0.2em] text-black mb-8">Informations personnelles</h3>
                <div className="space-y-6">
                  <div>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="NOM COMPLET" className="w-full bg-transparent border-0 border-b border-gray-300 py-3 font-sans text-xs uppercase tracking-widest text-black placeholder-gray-400 focus:border-black focus:ring-0 outline-none transition-all" required />
                  </div>
                  <div>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="TÉLÉPHONE" className="w-full bg-transparent border-0 border-b border-gray-300 py-3 font-sans text-xs uppercase tracking-widest text-black placeholder-gray-400 focus:border-black focus:ring-0 outline-none transition-all" required />
                  </div>
                </div>
             </div>

             <div className="border-t border-gray-100 pt-12">
                <h3 className="font-display text-xs uppercase tracking-[0.2em] text-black mb-8">Mode de réception</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setOrderMode('livraison')}
                    className={`flex-1 py-4 text-xs font-sans uppercase tracking-widest transition-colors ${orderMode === 'livraison' ? 'bg-black text-white' : 'border border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}
                  >
                    Livraison à domicile
                  </button>
                  <button 
                    onClick={() => setOrderMode('emporter')}
                    className={`flex-1 py-4 text-xs font-sans uppercase tracking-widest transition-colors ${orderMode === 'emporter' ? 'bg-black text-white' : 'border border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}
                  >
                    Retrait en boutique
                  </button>
                </div>
                
                {orderMode === 'livraison' && (
                  <div className="mt-8 space-y-6">
                    <div className="relative">
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ADRESSE DE LIVRAISON" className="w-full bg-transparent border-0 border-b border-gray-300 py-3 font-sans text-xs uppercase tracking-widest text-black placeholder-gray-400 focus:border-black focus:ring-0 outline-none transition-all pr-10" />
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isLoadingLocation}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-black hover:opacity-50 transition-colors disabled:opacity-30"
                      >
                        {isLoadingLocation ? <Loader2 className="w-4 h-4 animate-spin"/> : <MapPin className="w-4 h-4 stroke-[1]"/>}
                      </button>
                    </div>
                  </div>
                )}
             </div>

             <div className="border-t border-gray-100 pt-12">
                <h3 className="font-display text-xs uppercase tracking-[0.2em] text-black mb-8">Paiement</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-4 cursor-pointer">
                    <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="appearance-none w-4 h-4 rounded-full border border-gray-400 checked:border-black checked:bg-black" />
                    <div className="flex-1">
                      <div className="font-sans text-xs uppercase tracking-widest text-black">À la réception (Espèces)</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-4 bg-[#fffbf0] border border-yellow-250 p-4 cursor-pointer">
                    <input type="radio" name="payment" value="mvola" checked={paymentMethod === 'mvola'} onChange={() => setPaymentMethod('mvola')} className="appearance-none w-4 h-4 rounded-full border-gray-400 checked:border-yellow-650 checked:bg-yellow-500" />
                    <div className="flex-1">
                      <div className="font-sans text-xs uppercase tracking-widest text-yellow-950 font-bold">Mvola (Telma Madagascar)</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 bg-[#fff1f1] border border-red-200 p-4 cursor-pointer">
                    <input type="radio" name="payment" value="airtel" checked={paymentMethod === 'airtel'} onChange={() => setPaymentMethod('airtel')} className="appearance-none w-4 h-4 rounded-full border-gray-400 checked:border-red-650 checked:bg-red-550" />
                    <div className="flex-1">
                      <div className="font-sans text-xs uppercase tracking-widest text-red-950 font-bold">Airtel Money</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 bg-[#fff5f1] border border-orange-200 p-4 cursor-pointer">
                    <input type="radio" name="payment" value="omoney" checked={paymentMethod === 'omoney'} onChange={() => setPaymentMethod('omoney')} className="appearance-none w-4 h-4 rounded-full border-gray-400 checked:border-orange-500 checked:bg-orange-500" />
                    <div className="flex-1">
                      <div className="font-sans text-xs uppercase tracking-widest text-orange-950 font-bold">Orange Money (Madagascar)</div>
                    </div>
                  </label>
                </div>

                {/* Mobile Money Phone Number Input */}
                {(paymentMethod === 'mvola' || paymentMethod === 'omoney' || paymentMethod === 'airtel') && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    {!isLoggedIn ? (
                      <div className="p-5 border border-red-200 bg-red-50 text-red-900 space-y-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                          Compte membre obligatoire
                        </p>
                        <p className="text-[11px] uppercase tracking-widest leading-relaxed text-red-950 font-medium">
                          La création de compte est obligatoire pour tout règlement Mobile Money (Mvola, Airtel, Orange) afin d'assurer le suivi sécurisé de votre commande.
                        </p>
                        <button 
                          type="button"
                          onClick={() => navigate('/connexion?redirect=/checkout')}
                          className="w-full bg-black hover:bg-neutral-900 text-white py-3 px-4 text-[9px] uppercase tracking-[0.2em] font-extrabold transition-all"
                        >
                          Créer un compte ou se connecter
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-4 block">Veuillez confimer le numéro de paiement</div>
                        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="NUMÉRO MADAGASCAR (MVOLA, ORANGE, AIRTEL)" className="w-full bg-transparent border-0 border-b border-gray-300 py-3 font-sans text-xs uppercase tracking-widest text-black placeholder-gray-400 focus:border-black focus:ring-0 outline-none transition-all" required />
                      </>
                    )}
                  </div>
                )}
             </div>
          </div>

          <div className="w-full lg:w-[400px]">
            <div className="bg-gray-50 p-8 sticky top-24">
              <h3 className="font-display text-xs uppercase tracking-[0.2em] text-black mb-8">Votre commande</h3>
              <div className="space-y-4 mb-8">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start font-sans text-xs uppercase tracking-widest">
                    <span className="text-black flex-1 pr-4">{item.quantity}x {item.product.name}</span>
                    <span className="text-black shrink-0">{formatPriceC(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-6 space-y-4 font-sans text-xs uppercase tracking-widest">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total</span>
                  <span>{formatPriceC(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Livraison</span>
                  <span>{formatPriceC(totalDeliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-900 mt-6">
                  <span className="text-black">Total</span>
                  <span className="text-black">{formatPriceC(total)}</span>
                </div>
              </div>

              {error && <div className="mt-8 p-4 bg-red-50 text-red-600 text-xs uppercase tracking-widest">{error}</div>}

              {isMobileMoney && !isLoggedIn ? (
                <button 
                  type="button"
                  onClick={() => navigate('/connexion?redirect=/checkout')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-display uppercase tracking-[0.2em] py-4 mt-8 transition-colors text-xs font-bold"
                >
                  S'inscrire ou se connecter pour payer
                </button>
              ) : (
                <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-black text-white font-display uppercase tracking-[0.2em] py-4 mt-8 hover:bg-gray-900 transition-colors disabled:opacity-50 text-xs"
                >
                  {isProcessing ? 'Traitement...' : 'Payer'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}