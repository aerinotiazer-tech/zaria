import React, { useState, useEffect, createContext, useContext, useDeferredValue, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';                
import { db, auth } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, MapPin, Plus, Minus, MessageCircle, Phone, 
  Menu as MenuIcon, X, ArrowRight, ArrowLeft, Shirt, Timer, 
  Gift, Star, Smartphone, ChevronRight, Car, Package, Heart, Trash2, Lock, Search, QrCode, LogOut, Home, Navigation, Bike, CheckCircle, AlertTriangle, RefreshCcw, ShieldAlert, PhoneCall, Clock
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
// @ts-ignore
if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}
import AdminApp from './Admin';
import { useFirestore } from './hooks/useFirestore';
import { PagePrivacy, PageTerms, PageCookies, PageDelivery, PageAbout, PageContact } from './LegalPages';

// --- ROBUST API SIMULATION UTILITY ---
const simulateApiCall = <T,>(data: T, failureRate: number = 0.3, delay: number = 800): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failureRate) {
        reject(new Error("La requête réseau a échoué. Problème de connexion avec le serveur."));
      } else {
        resolve(data);
      }
    }, delay);
  });
};

// --- GLOBAL ERROR COMPONENT ---
function ApiErrorState({ message, onRetry }: { message: string, onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-gray-50 text-black rounded-none flex items-center justify-center mb-6 shadow-sm border border-gray-100 transform -rotate-3">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h3 className="font-black text-2xl text-gray-900 mb-2 uppercase tracking-tight">Oups ! Erreur Serveur</h3>
      <p className="font-bold text-gray-500 mb-8">{message}</p>
      <button 
        onClick={onRetry} 
        className="bg-black text-white px-8 py-4 rounded-none font-black uppercase tracking-wider shadow-none hover:bg-gray-700 hover:scale-105 transition-all border-b border-black border-gray-900 active:border-b-0 active:scale-95  flex gap-3 items-center mx-auto"
      >
        <RefreshCcw className="w-5 h-5" /> Tenter de nouveau
      </button>
    </div>
  );
}

const storeIcon = new L.DivIcon({
  html: `<div style="background-color: #DA291C; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><span style="color: #FFC72C; font-weight: 900; font-family: sans-serif; font-size: 16px;">Z.</span></div>`,
  className: '', iconSize: [32, 32], iconAnchor: [16, 32],
});
const bikeIcon = new L.DivIcon({
  html: `<div style="background-color: #FFC72C; width: 44px; height: 44px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 22px;">🛵</div>`,
  className: '', iconSize: [44, 44], iconAnchor: [22, 22],
});
const homeIcon = new L.DivIcon({
  html: `<div style="background-color: #25D366; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 16px;">📍</div>`,
  className: '', iconSize: [32, 32], iconAnchor: [16, 32],
});

// --- DATA: ZARIA FASHION DRIVEN ---
export const CATEGORIES = [
  { id: 'all', name: 'Tout voir', icon: '✨', color: 'bg-black', text: 'text-white' },
  { id: '1', name: 'Femme', icon: '👗', color: 'bg-gray-100', text: 'text-black' },
  { id: '2', name: 'Homme', icon: '👔', color: 'bg-gray-100', text: 'text-black' },
  { id: '3', name: 'Enfant', icon: '🧸', color: 'bg-gray-100', text: 'text-black' },
  { id: '4', name: 'Chaussures', icon: '👠', color: 'bg-gray-100', text: 'text-black' },
  { id: '5', name: 'Accessoires', icon: '👜', color: 'bg-gray-100', text: 'text-black' },
  { id: '6', name: 'Parfum', icon: '✨', color: 'bg-gray-100', text: 'text-black' }
];

const PROMOS = [
  { id: 'promo1', title: 'Nouvelle Collection ÉTÉ 2026', subtitle: 'Légèreté et élégance', price: 'À partir de 25€', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', color: 'bg-black', text: 'text-white' },
  { id: 'promo2', title: 'Essentiels Minimalistes', subtitle: 'Des pièces intemporelles', tag: 'Nouveau', image: 'https://images.unsplash.com/photo-1434389678369-182fc23900ca?w=800&q=80', color: 'bg-gray-200', text: 'text-black' },
];

export const PRODUCTS = [
  { id: 'p1', name: 'Robe Midi en Lin', description: 'Robe mi-longue en lin respirant avec ceinture à nouer.', price: 49.99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=100', categoryId: '1', badge: 'Best-Seller', popular: true, type: 'clothing', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Beige', 'Noir', 'Kaki'] },
  { id: 'p5', name: 'Blazer Croisé', description: 'Blazer élégant coupe droite, parfait pour le bureau ou une soirée.', price: 79.99, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=100', categoryId: '1', popular: true, type: 'clothing', sizes: ['XS', 'S', 'M', 'L'], colors: ['Gris', 'Marine', 'Noir'] },
  { id: 'p2', name: 'T-shirt Basique Premium', description: '100% coton bio, coupe droite ajustée.', price: 19.99, oldPrice: 24.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=100', categoryId: '2', badge: 'Promotion', popular: true, type: 'clothing', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Blanc', 'Noir', 'Gris chiné'] },
  { id: 'p6', name: 'Pantalon Chino Slim', description: 'Pantalon en coton stretch, coupe slim confortable.', price: 39.99, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=100', categoryId: '2', popular: true, type: 'clothing', sizes: ['36', '38', '40', '42', '44', '46'], colors: ['Beige', 'Bleu', 'Kaki'] },
  { id: 'p3', name: 'Veste en Jean Enfant', description: 'Veste denim robuste et stylée pour les petits.', price: 29.99, image: 'https://images.unsplash.com/photo-1519238396525-4dfb9bc2db53?w=800&q=100', categoryId: '3', popular: false, type: 'clothing', sizes: ['4A', '6A', '8A', '10A', '12A'], colors: ['Bleu Brut', 'Bleu Clair'] },
  { id: 'p7', name: 'Mocassins en Cuir', description: 'Mocassins classiques en cuir véritable pour un look raffiné.', price: 89.99, image: 'https://images.unsplash.com/photo-1614252339460-e14859f13eb6?w=800&q=100', categoryId: '4', popular: false, type: 'shoes', pointures: ['38', '39', '40', '41', '42', '43', '44', '45'], colors: ['Marron', 'Noir'] },
  { id: 'p4', name: 'Sac à Main Minimaliste', description: 'Sac en cuir vegan, format pratique pour le quotidien.', price: 59.99, image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=100', categoryId: '5', popular: true, type: 'accessory', colors: ['Noir', 'Camel', 'Taupe'] },
  { id: 'p8', name: 'Lunettes de Soleil Oversize', description: 'Monture écaille, protection UV400.', price: 24.99, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=100', categoryId: '5', popular: true, type: 'accessory', colors: ['Écaille', 'Noir'] },
  { id: 'p9', name: 'ZARIA Eau Sublimée', description: 'Une fragrance enivrante avec des notes de bois de oud, cèdre blanc et jasmin de nuit. Concentration en élixir précieux.', price: 110.00, image: 'https://images.unsplash.com/photo-1594035910387-fea47727142b?w=800&q=100', categoryId: '6', badge: 'Signature', popular: true, type: 'perfume', flacons: ['50ml', '100ml', '150ml'] }
];

export const RESTAURANTS = [
  { id: 1, country: 'MG', name: "ZARIA Antananarivo - Ivandry Plaza", address: "Plaza Ivandry, Antananarivo, Madagascar", distance: "0.8 km", status: "Ouvert jusqu'à 18h30", phone: "034 11 222 33", type: "Maison de Couture", lat: -18.878, lng: 47.525 },
  { id: 2, country: 'MG', name: "ZARIA Antananarivo - Ankorondrano", address: "Immeuble Standard, Ankorondrano, Antananarivo", distance: "2.1 km", status: "Ouvert jusqu'à 19h", phone: "034 22 345 67", type: "Boutique", lat: -18.892, lng: 47.521 },
  { id: 3, country: 'MG', name: "ZARIA Tamatave - Boulevard de la Marne", address: "Boulevard de la Marne, Toamasina, Madagascar", distance: "1.2 km", status: "Ouvert jusqu'à 18h", phone: "032 44 567 89", type: "Boutique", lat: -18.149, lng: 49.402 },
  { id: 4, country: 'FR', name: "ZARIA Paris Champs-Élysées", address: "Avenue des Champs-Élysées, Paris", distance: "0.5 km", status: "Ouvert jusqu'à 20h", phone: "01 23 45 67 89", type: "Boutique Principale", lat: 48.868, lng: 2.300 },
  { id: 5, country: 'SN', name: "ZARIA Dakar Plateau", address: "Avenue Pompidou, Dakar", distance: "1.2 km", status: "Ouvert jusqu'à 19h", phone: "77 000 00 10", type: "Boutique", lat: 14.673, lng: -17.436 },
];

const COUNTRIES = {
  MG: { id: 'MG', name: 'Madagascar', flag: '🇲🇬', currency: 'MGA', phone: '+261 34 00 000 00', rate: 4800, thresholdAmount: 250000, shortName: 'Madagascar' },
  FR: { id: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', phone: '+33 1 23 45 67 89', rate: 1, thresholdAmount: 50, shortName: 'France' },
  SN: { id: 'SN', name: 'Sénégal', flag: '🇸🇳', currency: 'XOF', phone: '+221 77 000 00 00', rate: 655.957, thresholdAmount: 35000, shortName: 'Sénégal' }
};

interface ProductInfo {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  categoryId: string;
  collectionId?: string;
  material?: string;
  styleNotes?: string;
  sizeGuide?: string;
  badge?: string;
  popular?: boolean;
  type?: string;
  sizes?: string[];
  colors?: string[];
  pointures?: string[];
  flacons?: string[];
  isAvailable?: boolean;
}

type CartItem = { 
  id: string; 
  product: ProductInfo; 
  quantity: number; 
  instructions?: string; 
  selectedAddons?: string[]; 
  basePrice?: number; 
  selectedSize?: string;
  selectedColor?: string;
  selectedPointure?: string;
  selectedFlacon?: string;
};

// --- CONTEXT ---
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: ProductInfo, quantity: number, instructions?: string, selectedAddons?: string[], basePrice?: number, options?: any) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemInfo: (cartItemId: string, updatedProduct: ProductInfo, quantity: number, instructions: string, selectedAddons: string[], basePrice: number, options?: any) => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  selectedProduct: ProductInfo | null;
  editingCartItem: CartItem | null;
  setEditingCartItem: (i: CartItem | null) => void;
  setSelectedProduct: (p: ProductInfo | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (b: boolean) => void;
  lastAdded: string | null;
  country: keyof typeof COUNTRIES;
  setCountry: (c: keyof typeof COUNTRIES) => void;
  formatPriceC: (price: number) => string;
  whatsappLink: string;
  whatsappNumber: string;
  isLoggedIn: boolean;
  setIsLoggedIn: (b: boolean) => void;
  currentUserData: any;
  activeOrder: any;
  setActiveOrder: (order: any) => void;
  clearCart: () => void;
  // Dynamic Global Data
  globalProducts: ProductInfo[];
  globalCategories: any[];
  globalCollections: any[];
  globalConfig: any;
  globalPOS: any[];
  selectedPOS: any | null;
  setSelectedPOS: (pos: any | null) => void;
  userCoords: { lat: number, lng: number } | null;
}
const CartContext = createContext<CartContextType | null>(null);
export const useCart = () => { const ctx = useContext(CartContext); if (!ctx) throw new Error("Missing CartProvider"); return ctx; };

const AppWithRouter = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <AnimatePresence mode="popLayout" onExitComplete={() => window.scrollTo(0, 0)}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<PageHome />} />
                <Route path="/collection" element={<PageCollection />} />
                <Route path="/winter-collection" element={<PageWinterCollection />} />
                <Route path="/product/:productId" element={<PageProductDetail />} />
                <Route path="/boutiques" element={<PageBoutiques />} />
                <Route path="/connexion" element={<PageConnexion />} />
                <Route path="/mon-compte" element={<PageMonCompte />} />
                <Route path="/politique-de-confidentialite" element={<PagePrivacy />} />
                <Route path="/conditions-utilisation" element={<PageTerms />} />
                <Route path="/politique-cookies" element={<PageCookies />} />
                <Route path="/politique-livraison" element={<PageDelivery />} />
                <Route path="/a-propos" element={<PageAbout />} />
                <Route path="/contact" element={<PageContact />} />
                <Route path="/p/:pageKey" element={<PageCustomCMS specificKey="" title="Page" />} />
                <Route path="/checkout" element={<PageCheckout />} />
                <Route path="/tracking/:orderId" element={<PageTracking />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </AnimatePresence>
    </>
  );
};

// --- MAIN APP ---
import { PageCheckout } from './pages/Checkout';
import { PageProductDetail } from './pages/ProductDetail';
import { PageTracking } from './pages/Tracking';
import PageWinterCollection from './pages/WinterCollection';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('zaria_cart');
      if (savedCart) return JSON.parse(savedCart);
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [country, setCountry] = useState<keyof typeof COUNTRIES>('MG');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null); // We will also fetch user doc
  
  useEffect(() => {
    // Dynamically import onAuthStateChanged to avoid bundle size issues early
    import('firebase/auth').then(({ onAuthStateChanged }) => {
       import('./firebase').then(({ auth, db }) => {
         import('firebase/firestore').then(({ doc, getDoc }) => {
            onAuthStateChanged(auth, async (user) => {
              if (user) {
                setIsLoggedIn(true);
                // fetch user data
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                  setCurrentUserData({ uid: user.uid, ...userDoc.data() });
                } else {
                  setCurrentUserData({ uid: user.uid, email: user.email });
                }
              } else {
                setIsLoggedIn(false);
                setCurrentUserData(null);
              }
            });
         });
       });
    });
  }, []);
  const [activeOrder, setActiveOrder] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const savedOrder = localStorage.getItem('zaria_active_order');
      if (savedOrder) return JSON.parse(savedOrder);
    }
    return null;
  });
  const [selectedPOS, setSelectedPOS] = useState<any | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('zaria_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('zaria_active_order', JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem('zaria_active_order');
    }
  }, [activeOrder]);

  // Dynamic Data placeholder logic to fallback while hook is implemented
  const { data: globalProductsData } = useFirestore('products');
  const { data: globalCategoriesData } = useFirestore('categories', 'orderId');
  const { data: globalConfigData } = useFirestore('config', 'brandName');
  const { data: globalPOSData } = useFirestore('points_of_sale', 'name');
  const { data: globalCollectionsData } = useFirestore('collections', 'order');

  const globalProducts = (globalProductsData && globalProductsData.length > 0) ? globalProductsData : PRODUCTS;
  const globalCategories = (globalCategoriesData && globalCategoriesData.length > 0) ? globalCategoriesData : CATEGORIES;
  const globalConfig = (globalConfigData && globalConfigData.length > 0) ? globalConfigData[0] : null;
  const globalPOS = (globalPOSData && globalPOSData.length > 0) ? globalPOSData : RESTAURANTS;
  const globalCollections = (globalCollectionsData && globalCollectionsData.length > 0) ? globalCollectionsData : [];

  // Find nearest POS if not already selected manually when both coords and pos data are available
  useEffect(() => {
    if (!selectedPOS && globalPOS?.length > 0) {
       if (userCoords) {
         const nearest = [...globalPOS].sort((a, b) => {
           if (a.lat === undefined || b.lat === undefined) return 0;
           const distA = Math.sqrt(Math.pow(a.lat - userCoords.lat, 2) + Math.pow(a.lng - userCoords.lng, 2));
           const distB = Math.sqrt(Math.pow(b.lat - userCoords.lat, 2) + Math.pow(b.lng - userCoords.lng, 2));
           return distA - distB;
         })[0];
         if (nearest) setSelectedPOS(nearest);
       } else {
         // Fallback to highest priority/first POS if no location yet
         setSelectedPOS(globalPOS[0]);
       }
    }
  }, [userCoords, selectedPOS, globalPOS]);

  // Read location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserCoords(coords);
      }, (err) => {
        console.warn("Geolocation permission denied", err);
      });
    }
  }, []);

  // Sync activeOrder in real-time
  useEffect(() => {
    if (!activeOrder?.id) return;
    const docRef = doc(db, 'orders', activeOrder.id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
            const serverData = snapshot.data();
            setActiveOrder((prev: any) => ({
                ...prev,
                ...serverData,
                id: snapshot.id
            }));
        }
    }, (err) => {
        console.error("Tracking order error:", err);
    });
    return () => unsubscribe();
  }, [activeOrder?.id]);

  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);

  const addToCart = (product: ProductInfo, quantity: number, instructions: string = '', selectedAddons: string[] = [], basePrice: number = product.price, options: any = {}) => {
    setCart(prev => {
      // Find exact same configuration
      const existing = prev.find(item => {
        if (item.product.id !== product.id) return false;
        if (item.selectedSize !== options.selectedSize) return false;
        if (item.selectedColor !== options.selectedColor) return false;
        if (item.selectedPointure !== options.selectedPointure) return false;
        if (item.selectedFlacon !== options.selectedFlacon) return false;
        const currentAddons = item.selectedAddons || [];
        if (currentAddons.length !== selectedAddons.length) return false;
        return selectedAddons.every(id => currentAddons.includes(id));
      });

      if (existing) {
        return prev.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + quantity, instructions: instructions || item.instructions } : item);
      }
      
      const newItemId = Math.random().toString(36).substring(7);
      return [...prev, { id: newItemId, product, quantity, instructions, selectedAddons, basePrice, ...options }];
    });
    setSelectedProduct(null);
    setLastAdded(`${quantity}x ${product.name}`);
    setTimeout(() => setLastAdded(null), 3000);
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartItemInfo = (cartItemId: string, updatedProduct: ProductInfo, quantity: number, instructions: string, selectedAddons: string[], basePrice: number, options: any = {}) => {
    setCart(prev => prev.map(item => item.id === cartItemId ? {
      ...item,
      product: updatedProduct,
      quantity,
      instructions,
      selectedAddons,
      basePrice,
      ...options
    } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  const formatPriceC = (price: number) => {
    if (country === 'MG') {
      const localPrice = Math.round(price * COUNTRIES.MG.rate);
      return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', minimumFractionDigits: 0 }).format(localPrice).replace("MGA", "Ar").trim();
    }
    if (country === 'SN') {
      const localPrice = Math.ceil((price * COUNTRIES.SN.rate) / 100) * 100;
      return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(localPrice);
    }
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(price);
  };

  const whatsappNumber = globalConfig?.whatsappNumber || COUNTRIES[country].phone;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Bonjour,%20je%20souhaite%20commander.`;

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, updateCartItemInfo, clearCart, getCartCount, getCartTotal, selectedProduct, setSelectedProduct, editingCartItem, setEditingCartItem, isCartOpen, setIsCartOpen, lastAdded, country, setCountry, formatPriceC, whatsappLink, whatsappNumber, isLoggedIn, setIsLoggedIn, currentUserData, activeOrder, setActiveOrder, globalProducts, globalCategories, globalCollections, globalConfig, globalPOS, selectedPOS, setSelectedPOS, userCoords }}>
      <Router>
        <AppWithRouter />
      </Router>
    </CartContext.Provider>
  );
}

// --- PAGE CONNEXION : STANDALONE CHIC GATEWAY PORTAL ---
export function PageConnexion() {
  const { isLoggedIn, setIsLoggedIn, globalConfig } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/mon-compte';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newsletterChecked, setNewsletterChecked] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      navigate(redirectTarget);
    }
  }, [isLoggedIn, navigate, redirectTarget]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const { auth, db } = await import('./firebase');
      const { doc, getDoc, setDoc } = await import('firebase/firestore');
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
           email: result.user.email,
           createdAt: new Date().toISOString(),
           stature: 172,
           chest: 88,
           waist: 68,
           hips: 94,
           addresses: [],
           paymentMethods: [],
           role: (result.user.email === 'aerinotiazer@gmail.com' || result.user.email === 'beidoufadimatou1998@gmail.com') ? 'super_admin' : 'viewer'
        });
      }
      setIsLoggedIn(true);
      navigate(redirectTarget);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur de connexion via Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez saisir votre e-mail de membre et votre mot de passe.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caractères pour des raisons de sécurité.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        // Import Auth functions dynamically or assume they are available if we import them at the top
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const { auth, db } = await import('./firebase');
        const { doc, setDoc } = await import('firebase/firestore');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
           email: userCredential.user.email,
           createdAt: new Date().toISOString(),
           stature: 172,
           chest: 88,
           waist: 68,
           hips: 94,
           addresses: [],
           paymentMethods: [],
           role: (userCredential.user.email === 'aerinotiazer@gmail.com' || userCredential.user.email === 'beidoufadimatou1998@gmail.com') ? 'super_admin' : 'viewer'
        });
      } else {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const { auth } = await import('./firebase');
        await signInWithEmailAndPassword(auth, email, password);
      }
      setIsLoggedIn(true);
      navigate(redirectTarget);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("L'authentification par e-mail n'est pas activée. Veuillez l'activer dans la console Firebase (Authentication > Sign-in method).");
      } else {
        setError(err.message || "Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col pt-16 selection:bg-black selection:text-white">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[85vh]">
        
        {/* Left Visual Cinematic Panel */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-neutral-900 overflow-hidden select-none">
          <img 
            src={globalConfig?.connexionImage || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80"} 
            alt="Zaria Silhouette Collection" 
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/20 to-transparent"></div>
          
          <div className="absolute top-12 left-12">
            <span className="text-[10px] tracking-[0.45em] text-white font-mono block mb-1">HAUTE COUTURE AUTOMNE</span>
            <span className="text-sm font-display text-white italic tracking-widest block font-light">Maison de couture d'Exception</span>
          </div>

          <div className="absolute bottom-16 left-12 right-12 text-white space-y-4">
            <h4 className="font-display text-4xl font-extralight uppercase leading-tight tracking-[0.18em]">
              ZARIA<br />ATELIER
            </h4>
            <div className="w-12 h-[1px] bg-white/40 my-4" />
            <p className="text-white/80 text-[10px] uppercase font-sans tracking-[0.2em] leading-relaxed max-w-sm">
              &ldquo;L'élégance n'est pas de se faire remarquer, c'est de se faire mémoriser.&rdquo; — Giorgio Armani
            </p>
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="lg:col-span-7 flex items-center justify-center py-16 px-6 sm:px-12 md:px-20 bg-white">
          <div className="w-full max-w-lg space-y-10">
            
            {/* Steps & header */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-400 font-mono block">ESPACE CLIENT</span>
              <h1 className="font-display text-3xl uppercase tracking-[0.18em] text-black font-extralight leading-none">
                {isRegisterMode ? "Créer mon Compte" : "Se Connecter"}
              </h1>
              <div className="w-full h-[1px] bg-neutral-100 pt-1" />
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin mx-auto"></div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-medium">
                  Connexion sécurisée en cours...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                <p className="text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
                  {isRegisterMode 
                    ? "Créez votre compte pour mémoriser vos mensurations d'atelier et suivre vos commandes en temps réel."
                    : "Connectez-vous pour accéder à vos mensurations d'atelier et suivre vos livraisons."}
                </p>

                <div className="space-y-6 pt-2">
                  {/* Email Input */}
                  <div className="relative group">
                    <label className="block text-[9px] uppercase tracking-[0.25em] text-gray-400 font-bold mb-1 group-focus-within:text-black transition-colors">
                      Votre Identifiant E-mail
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-neutral-250 py-3 text-xs tracking-widest font-sans uppercase text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-neutral-300"
                      placeholder="ADRESSE@EXEMPLE.COM"
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative group">
                    <label className="block text-[9px] uppercase tracking-[0.25em] text-gray-400 font-bold mb-1 group-focus-within:text-black transition-colors">
                      Votre Mot de Passe
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-neutral-250 py-3 pr-24 text-xs tracking-widest font-sans text-black focus:border-black focus:ring-0 outline-none transition-all"
                        placeholder="••••••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors p-1"
                      >
                        {showPassword ? "Masquer" : "Afficher"}
                      </button>
                    </div>
                    {password && password.length < 6 && (
                      <span className="text-[8px] uppercase tracking-wider text-red-550 mt-1 block">
                        Doit contenir au moins 6 caractères
                      </span>
                    )}
                  </div>
                </div>

                {/* Newsletter Selection */}
                {isRegisterMode && (
                  <div className="flex items-start gap-3 py-2 cursor-pointer select-none" onClick={() => setNewsletterChecked(!newsletterChecked)}>
                    <input 
                      type="checkbox" 
                      checked={newsletterChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded-none border-neutral-300 text-black focus:ring-0 cursor-pointer h-3.5 w-3.5"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-gray-800 font-semibold block leading-tight">
                        S'abonner aux invitations exclusives Zaria
                      </span>
                      <span className="text-[8px] uppercase tracking-widest text-[#999] block leading-normal">
                        Recevez notre lookbook saisonnier imprimé, les invitations privées à la Fashion Week de Paris, et le catalogue exclusif de prévente.
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-l border-red-500 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-red-700 font-semibold leading-relaxed">
                      {error}
                    </p>
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  <button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-neutral-800 transition-all duration-300 py-4 text-[10px] uppercase tracking-[0.3em] font-extrabold flex items-center justify-center gap-2 select-none"
                  >
                    {isRegisterMode ? "Créer mon Compte" : "Se connecter"}
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-white border border-neutral-200 hover:border-black text-black transition-all duration-300 py-4 text-[10px] uppercase tracking-[0.3em] font-bold select-none text-center flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      <path d="M1 1h22v22H1z" fill="none"/>
                    </svg>
                    Continuer avec Google
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      setError('');
                    }}
                    className="w-full border-t border-neutral-100 hover:text-black text-neutral-400 transition-all duration-300 py-4 text-[10px] uppercase tracking-[0.3em] font-bold select-none text-center mt-4"
                  >
                    {isRegisterMode ? "J'ai déjà un compte E-mail" : "Créer un compte E-mail"}
                  </button>
                </div>

                <div className="pt-6 text-center border-t border-neutral-100 flex justify-between items-center text-[8px] tracking-[0.25em] text-[#a4a4a4] font-mono">
                  <span>CONNEXION SÉCURISÉE</span>
                  <span>ATELIER ZARIA</span>
                </div>

              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

// --- PAGE COMPTE : MON ESPACE CLIENT ---
export function PageMonCompte() {
  const { isLoggedIn, setIsLoggedIn, currentUserData, globalProducts, formatPriceC, addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  // Atelier measurement state (could sync with Firebase in a real scenario)
  const [stature, setStature] = useState(172);
  const [chest, setChest] = useState(88);
  const [waist, setWaist] = useState(68);
  const [hips, setHips] = useState(94);
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [bodyShapeAdvice, setBodyShapeAdvice] = useState<string | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  // Address and Payment States
  const [addresses, setAddresses] = useState<any[]>(currentUserData?.addresses || []);
  const [payments, setPayments] = useState<any[]>(currentUserData?.paymentMethods || []);

  const [activeSubTab, setActiveSubTab] = useState<'adresses' | 'paiements' | 'atelier' | 'commandes'>('commandes');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/connexion');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (currentUserData) {
      setAddresses(currentUserData.addresses || []);
      setPayments(currentUserData.paymentMethods || []);
    }
  }, [currentUserData]);

  const handleCalculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculated(true);
    let size = 'M';
    if (chest < 84 && waist < 64) size = 'XS';
    else if (chest < 88 && waist < 68) size = 'S';
    else if (chest < 96 && waist < 76) size = 'M';
    else if (chest < 104 && waist < 84) size = 'L';
    else size = 'XL';

    let advice = "Silhouette harmonieuse. Nos blazers cintrés souligneront idéalement votre tour de taille.";
    if (hips - waist > 28) {
      advice = "Silhouette ajustée au buste. Nous suggérons nos trench-coats fluides et amples pour structurer votre allure.";
    } else if (chest - waist < 14 && hips - waist < 14) {
      advice = "Silhouette moderne. Privilégiez des ceintures pour structurer l'allure de nos robes droites.";
    }

    setTimeout(() => {
      setRecommendedSize(size);
      setBodyShapeAdvice(advice);
      setIsCalculated(false);
    }, 450); 
  };

  const handleFastReorder = (orderId: string) => {
    alert("Produits de la commande " + orderId + " réajoutés au panier.");
    setIsCartOpen(true);
  };

  const vipRecommendations = useMemo(() => {
    if (!globalProducts || globalProducts.length === 0) return [];
    return globalProducts.filter((p: any) => p.isAvailable !== false).slice(0, 3);
  }, [globalProducts]);

  const accountOrders = [
    { id: "Z-812048", date: "02 Mai 2026", total: 470, items: "Blazer structure crêpe x1", status: "En cours de confection" },
    { id: "Z-109485", date: "14 Février 2026", total: 1120, items: "Manteau croisé laine fine x1, Robe midi satinée x1", status: "Livré" }
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center pt-32">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin"></div>
        <span className="text-[10px] tracking-[0.25em] text-gray-400 mt-4 uppercase">Connexion requise...</span>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const { auth } = await import('./firebase');
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      setIsLoggedIn(false);
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white min-h-screen text-black pt-28 pb-32 font-sans selection:bg-black selection:text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        
        {/* Title */}
        <div className="border-b border-neutral-100 pb-10 mb-12 flex flex-col md:flex-row justify-between items-baseline gap-4">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.45em] text-neutral-400 font-mono block uppercase">MON COMPTE</span>
            <h1 className="font-display text-4xl sm:text-5xl uppercase font-light text-black tracking-[0.16em]">
              Mon Espace Client
            </h1>
          </div>
          
          <div className="flex gap-6 items-center">
            {currentUserData && (currentUserData.role === 'super_admin' || currentUserData.role === 'admin' || currentUserData.role === 'SUPER_ADMIN' || currentUserData.role === 'ADMIN') && (
              <button 
                onClick={() => navigate('/admin')}
                className="text-[10px] uppercase font-bold tracking-[0.25em] text-red-600 hover:text-red-800 border bg-red-50 border-red-200 px-4 py-2 hover:border-red-300 transition-all flex items-center gap-1.5"
              >
                Gérer l'application <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-400 hover:text-black border-b border-transparent hover:border-black pb-0.5 transition-all flex items-center gap-1.5"
            >
              Se déconnecter <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side Control Tabs Panel */}
          <div className="space-y-6">
            <div className="bg-neutral-50/70 border border-neutral-100 p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-neutral-100 border border-neutral-200 rounded-full text-black flex items-center justify-center font-display text-lg select-none font-medium">
                {currentUserData?.email ? currentUserData.email.substring(0, 2).toUpperCase() : 'ZC'}
              </div>
              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-neutral-800 font-bold">Membre Client</h4>
                <p className="text-[10px] font-mono text-neutral-400 truncate max-w-[150px]">{currentUserData?.email || 'Chargement...'}</p>
              </div>
              <div className="w-full pt-4 border-t border-neutral-200/50 space-y-2 text-left">
                <div className="flex justify-between text-[9px] uppercase tracking-wider">
                  <span className="text-gray-400">Région :</span>
                  <span className="font-bold text-black font-mono">FRANCE</span>
                </div>
              </div>
            </div>

            {/* Submenu tab navigation list */}
            <div className="flex flex-col border border-neutral-150">
              <button 
                onClick={() => setActiveSubTab('commandes')}
                className={`py-4 px-6 text-left text-[10px] uppercase tracking-[0.2em] font-bold border-b border-neutral-100 transition-colors ${activeSubTab === 'commandes' ? 'bg-black text-white' : 'bg-white hover:bg-neutral-50 text-gray-500'}`}
              >
                Mes Commandes ({accountOrders.length})
              </button>
              <button 
                onClick={() => setActiveSubTab('adresses')}
                className={`py-4 px-6 text-left text-[10px] uppercase tracking-[0.2em] font-bold border-b border-neutral-100 transition-colors ${activeSubTab === 'adresses' ? 'bg-black text-white' : 'bg-white hover:bg-neutral-50 text-gray-500'}`}
              >
                Mes Adresses de Livraison
              </button>
              <button 
                onClick={() => setActiveSubTab('paiements')}
                className={`py-4 px-6 text-left text-[10px] uppercase tracking-[0.2em] font-bold border-b border-neutral-100 transition-colors ${activeSubTab === 'paiements' ? 'bg-black text-white' : 'bg-white hover:bg-neutral-50 text-gray-500'}`}
              >
                Informations de Paiement
              </button>
              <button 
                onClick={() => setActiveSubTab('atelier')}
                className={`py-4 px-6 text-left text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${activeSubTab === 'atelier' ? 'bg-black text-white' : 'bg-white hover:bg-neutral-50 text-gray-500'}`}
              >
                Mensurations Atelier
              </button>
            </div>
          </div>

          {/* Core Content Area */}
          <div className="lg:col-span-3">
            
            {activeSubTab === 'commandes' && (
              <div className="space-y-8 animate-fade-in text-black">
                <h3 className="font-display text-lg uppercase tracking-[0.16em] font-semibold text-black">Historique des commandes</h3>
                <div className="space-y-6">
                  {accountOrders.map(o => (
                    <div key={o.id} className="border border-neutral-200 bg-white p-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 border-b border-neutral-100 pb-4">
                        <div>
                          <p className="font-mono text-xs text-neutral-500 uppercase">Commande {o.id}</p>
                          <p className="text-[10px] font-bold mt-1 tracking-widest">{o.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{formatPriceC(o.total)}</p>
                          <span className="inline-block mt-1 px-2 py-1 bg-neutral-100 text-[9px] uppercase font-bold tracking-widest text-neutral-600">{o.status}</span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600 mb-6">{o.items}</p>
                      <button onClick={() => handleFastReorder(o.id)} className="bg-black text-white px-6 py-2.5 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-neutral-800 transition-colors">
                        Recommander les articles
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === 'adresses' && (
              <div className="space-y-8 animate-fade-in text-black">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-lg uppercase tracking-[0.16em] font-semibold text-black">Adresses de Livraison</h3>
                  <button className="text-[10px] uppercase tracking-widest font-bold underline">Ajouter</button>
                </div>
                {addresses.length === 0 ? (
                  <div className="p-8 border border-neutral-200 bg-neutral-50 text-center">
                    <p className="text-xs uppercase tracking-widest text-neutral-500">Aucune adresse sauvegardée.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr: any, i: number) => (
                       <div key={i} className="border border-neutral-200 p-4">
                         <p className="font-bold text-xs uppercase mb-2">{addr.label || 'Maison'}</p>
                         <p className="text-xs text-neutral-600">{addr.street}</p>
                         <p className="text-xs text-neutral-600">{addr.city}</p>
                       </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSubTab === 'paiements' && (
              <div className="space-y-8 animate-fade-in text-black">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-lg uppercase tracking-[0.16em] font-semibold text-black">Moyens de Paiement</h3>
                  <button className="text-[10px] uppercase tracking-widest font-bold underline">Ajouter</button>
                </div>
                {payments.length === 0 ? (
                  <div className="p-8 border border-neutral-200 bg-neutral-50 text-center">
                    <p className="text-xs uppercase tracking-widest text-neutral-500">Aucun moyen de paiement enregistré.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((pay: any, i: number) => (
                       <div key={i} className="border border-neutral-200 p-4 flex items-center justify-between">
                         <div>
                           <p className="font-bold text-xs uppercase mb-1">{pay.type}</p>
                           <p className="text-xs text-neutral-600">**** **** **** {pay.last4}</p>
                         </div>
                       </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSubTab === 'atelier' && (
              <div className="space-y-12 animate-fade-in text-black">
                <div className="border border-neutral-100 p-6 sm:p-10 space-y-6">
                  <h3 className="font-display text-lg uppercase tracking-[0.16em] font-semibold text-black">Mon Profil de Silhouette</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
                    Saisissez vos mensurations corporelles d'essayage en cabine.
                  </p>
                  {/* ... calculator form logic ... */}
                  <form onSubmit={handleCalculateSize} className="space-y-8 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                      
                      <div className="space-y-2">
                        <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Stature (cm)</label>
                        <input 
                          type="number" 
                          value={stature}
                          onChange={(e) => setStature(Number(e.target.value))}
                          className="w-full bg-neutral-50 border border-neutral-200 py-2.5 px-3 text-xs font-mono text-black outline-none focus:border-black focus:ring-0"
                          min="120" max="220"
                        />
                        <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-mono block">Hauteur totale</span>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Tour Poitrine (cm)</label>
                        <input 
                          type="number" 
                          value={chest}
                          onChange={(e) => setChest(Number(e.target.value))}
                          className="w-full bg-neutral-50 border border-neutral-200 py-2.5 px-3 text-xs font-mono text-black outline-none focus:border-black focus:ring-0"
                          min="60" max="150"
                        />
                        <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-mono block">Au plus fort</span>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Tour de Taille (cm)</label>
                        <input 
                          type="number" 
                          value={waist}
                          onChange={(e) => setWaist(Number(e.target.value))}
                          className="w-full bg-neutral-50 border border-neutral-200 py-2.5 px-3 text-xs font-mono text-black outline-none focus:border-black focus:ring-0"
                          min="50" max="140"
                        />
                        <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-mono block">Au plus creux</span>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Tour de Hanches (cm)</label>
                        <input 
                          type="number" 
                          value={hips}
                          onChange={(e) => setHips(Number(e.target.value))}
                          className="w-full bg-neutral-50 border border-neutral-200 py-2.5 px-3 text-xs font-mono text-black outline-none focus:border-black focus:ring-0"
                          min="65" max="160"
                        />
                        <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-mono block">Fessiers compris</span>
                      </div>

                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isCalculated}
                        className="bg-black text-white hover:bg-neutral-800 transition-all py-4 px-8 text-[11px] uppercase tracking-[0.25em] font-extrabold flex items-center gap-2"
                      >
                        {isCalculated ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Calcul anatomique...
                          </>
                        ) : "Calculer mon Allure Idéale"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sizing calculation feedback */}
                {recommendedSize && (
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="bg-neutral-900 text-white p-6 sm:p-10 border border-neutral-850 space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.3em] text-[#aaa] font-mono block">RÉSULTAT DE L'ALPHABET DESIGN</span>
                        <h4 className="font-display text-xl uppercase tracking-[0.16em]">Votre Allure Idéale Zaria</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] uppercase tracking-widest text-neutral-400 font-mono">Taille suggérée :</span>
                        <span className="bg-white text-black px-4 py-1 text-sm font-extrabold tracking-widest font-mono">
                          TAILLE {recommendedSize}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#dbdbdb] leading-relaxed">
                        {bodyShapeAdvice}
                      </p>
                      
                      <p className="text-[10px] text-neutral-400 font-mono leading-relaxed uppercase">
                        Veuillez noter que ces mesures d'atelier conviennent de manière optimale à nos manteaux d'allonge fluide et robes trapèzes drapées. Pour des blazers super-ajustés, l'allure d'une taille {recommendedSize === 'XS' ? 'XS' : recommendedSize === 'S' ? 'S' : 'M'} restera irréprochable.
                      </p>
                    </div>
                  </motion.div>
                )}

              </div>
            )}

            {activeSubTab === 'commandes' && (
              <div className="space-y-8 animate-fade-in text-black">
                
                {/* Orders summary */}
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="font-display text-md uppercase tracking-[0.2em] font-semibold text-black">Suivi de mes commandes ({accountOrders.length})</h3>
                </div>

                <div className="space-y-6">
                  {accountOrders.map((ord) => (
                    <div key={ord.id} className="p-6 border border-neutral-200 flex flex-col sm:flex-row justify-between gap-6 hover:border-neutral-400 transition-colors bg-neutral-50/20">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-extrabold text-black uppercase">{ord.id}</span>
                          <span className="text-[9px] font-mono text-neutral-400 uppercase">{ord.date}</span>
                        </div>
                        <p className="text-[11px] uppercase tracking-wider text-neutral-600 font-semibold">{ord.items}</p>
                        <p className="text-[10px] uppercase tracking-widest text-[#999] font-sans">Total : <span className="text-black font-semibold">{formatPriceC(ord.total)}</span></p>
                      </div>

                      <div className="sm:text-right flex flex-col justify-between items-start sm:items-end gap-3 min-h-[80px]">
                        <span className="bg-black text-white py-1 px-3 text-[8px] uppercase tracking-widest font-mono font-extrabold">
                          {ord.status}
                        </span>
                        
                        <a 
                          href="https://wa.me/33600000000?text=Bonjour,%20je%20souhaite%20des%20informations%20sur%20ma%2520commande" 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 hover:text-black border-b border-neutral-400 hover:border-black pb-0.5 transition-all text-left"
                        >
                          Service Client & Contact &rarr;
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Secure payments information warning */}
                <div className="bg-neutral-50 p-6 border border-neutral-100/60 text-center text-neutral-400 uppercase text-[9px] tracking-[0.2em] font-mono leading-relaxed mt-10">
                  <span>Tous nos colis sont préparés avec le plus grand soin par nos équipes d'atelier et expédiés sous emballage scellé de protection standard. • ZARIA</span>
                </div>

              </div>
            )}

            {/* Visual Inspiration Mood board */}
            <div className="mt-20 pt-10 border-t border-neutral-100">
              <div className="mb-6">
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#a4a4a4] font-mono block mb-1">INSPIRATIONS PRINCIPALES</span>
                <span className="text-md uppercase font-bold tracking-[0.15em] text-black">Silhouette d'Essayage Sélectionnée</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden group select-none">
                  <img 
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=75" 
                    alt="Inspiration Couture 1" 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-103"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                    <span className="text-[8px] font-mono tracking-widest text-[#ccc] uppercase">MODÈLE ESPRIT INTEMPOREL</span>
                    <h5 className="text-[10px] uppercase font-bold tracking-wider">Le Tailleur Sculpté Lin</h5>
                  </div>
                </div>
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden group select-none">
                  <img 
                    src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=75" 
                    alt="Inspiration Couture 2" 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-103"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                    <span className="text-[8px] font-mono tracking-widest text-[#ccc] uppercase">MATIÈRES RAFFINÉES</span>
                    <h5 className="text-[10px] uppercase font-bold tracking-wider">Le Croisé Laine Brute</h5>
                  </div>
                </div>
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden group select-none">
                  <img 
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=75" 
                    alt="Inspiration Couture 3" 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-103"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                    <span className="text-[8px] font-mono tracking-widest text-[#ccc] uppercase">LIGNES MINIMALES</span>
                    <h5 className="text-[10px] uppercase font-bold tracking-wider">La Silhouette Plissée d'Atelier</h5>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// --- LAYOUT : FRANCHISE HEADER ---
function Layout({ children }: { children: React.ReactNode }) {
  const { 
    getCartCount, getCartTotal, setIsCartOpen, isCartOpen, 
    country, setCountry, formatPriceC, whatsappLink, whatsappNumber,
    cart, activeOrder, globalConfig, globalPOS, 
    selectedPOS, setSelectedPOS, userCoords,
    selectedProduct, setSelectedProduct, lastAdded,
    editingCartItem, setEditingCartItem,
    isLoggedIn, setIsLoggedIn, globalProducts, globalCategories
  } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDept, setActiveDept] = useState<'femme' | 'homme' | 'enfant'>('femme');
  const [isPOSModalOpen, setIsPOSModalOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  
  // Zara exact interactions
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (globalConfig?.seoTitle) {
      document.title = globalConfig.seoTitle;
    }
    if (globalConfig?.seoDesc) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', globalConfig.seoDesc);
    }
  }, [globalConfig]);

  const handleCountrySwitch = () => {
    // Basic confirmation since switching country might imply different prices
    if (cart.length > 0 && !window.confirm("Changer de pays va recalculer votre panier. Continuer ?")) return;
    if (country === 'MG') setCountry('FR');
    else if (country === 'FR') setCountry('SN');
    else setCountry('MG');
  };
  
  const currentCountry = COUNTRIES[country];

  return (
    <div className="flex flex-col min-h-screen pb-24 sm:pb-0 overflow-x-hidden">
      {/* MINIMAL NAV */}
      <header className={`sticky top-0 w-full z-40 transition-all ${globalConfig?.enableLiquidGlass ? 'liquid-glass-navbar shadow-sm' : 'bg-[#fafafa]/90 backdrop-blur-xl border-b border-black/5'}`}>
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <button className="text-black hover:opacity-50 transition-colors flex flex-col gap-[3px] items-start group lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <span className="w-5 h-[1.5px] bg-black block transition-all group-hover:w-4" />
              <span className="w-4 h-[1.5px] bg-black block transition-all group-hover:w-5" />
            </button>
            <Link to="/" className="text-black inline-block -mt-1">
              <span className="font-display font-medium italic text-3xl sm:text-4xl tracking-widest uppercase">
                {globalConfig?.brandName || 'ZARIA'}
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-[10px] font-sans font-medium text-black uppercase tracking-[0.25em]">
            <button className="hover:text-gray-500 transition-colors flex flex-col gap-[3px] items-start group" onClick={() => setIsMobileMenuOpen(true)}>
              <span className="w-5 h-[1.5px] bg-black block transition-all group-hover:w-4" />
              <span className="w-4 h-[1.5px] bg-black block transition-all group-hover:w-5" />
            </button>
            <Link to="/collection" className="hover:text-gray-500 transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black after:transition-all hover:after:w-full">COLLECTION</Link>
            <Link to="/winter-collection" className="text-[#DA291C] hover:text-[#b12117] font-bold transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-[#DA291C] after:transition-all hover:after:w-full flex items-center gap-1">
              COLLECTION D'HIVER <span className="text-[8px] px-1 bg-red-100 text-[#DA291C] font-mono tracking-normal uppercase">New</span>
            </Link>
            <Link to="/boutiques" className="hover:text-gray-500 transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black after:transition-all hover:after:w-full">BOUTIQUES</Link>
          </div>

          <div className="flex items-center gap-5 sm:gap-8 text-[10px] sm:text-[11px] font-sans font-medium text-black uppercase tracking-[0.2em]">
             <button 
               onClick={() => setIsHeaderSearchOpen(true)}
               className="hover:text-gray-500 transition-colors flex items-center gap-2"
             >
               <span className="hidden leading-none sm:inline mt-px">RECHERCHE</span>
               <Search className="w-4 h-4 sm:w-4 sm:h-4 stroke-[1.5]" />
             </button>
             
             <Link to={isLoggedIn ? "/mon-compte" : "/connexion"} className="hidden sm:inline hover:text-gray-500 transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black after:transition-all hover:after:w-full">
               {isLoggedIn ? "COMPTE" : "SE CONNECTER"}
             </Link>
             
             <button className="hover:text-gray-500 transition-colors relative group" onClick={() => setIsCartOpen(true)}>
               <span className="relative z-10 hidden sm:inline leading-none mt-px tracking-widest">PANIER ({getCartCount()})</span>
               <span className="sm:hidden relative z-10 pt-1 block"><ShoppingBag className="w-5 h-5 stroke-[1.5]" /></span>
               {getCartCount() > 0 && <span className="sm:hidden absolute -top-1 -right-2 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold tracking-widest">{getCartCount()}</span>}
             </button>
          </div>
        </div>
      </header>

      {/* SOLID SLIDE-DOWN SEARCH OVERLAY (ZARA STYLE) */}
      <AnimatePresence>
        {isHeaderSearchOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsHeaderSearchOpen(false); setHeaderSearchQuery(''); }}
              className="fixed inset-0 bg-white/20 backdrop-blur-md z-[120]"
            />
            
            <motion.div 
              initial={{ y: "-100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "-100%" }} 
              transition={{ type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.55 }}
              className="fixed inset-x-0 top-0 z-[130] bg-[#fafafa]/98 border-b border-black/5 shadow-2xl px-6 sm:px-12 pt-8 sm:pt-12 pb-16 overflow-y-auto max-h-[90vh] text-black"
            >
              <div className="max-w-[1400px] mx-auto">
                {/* Search input line */}
                <div className="flex items-center justify-between border-b border-black pb-4 mb-10">
                  <input 
                    type="text" 
                    placeholder="RECHERCHER DES PIÈCES, ROBES, BLAZERS..." 
                    value={headerSearchQuery}
                    onChange={(e) => setHeaderSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 py-2 pl-0 pr-8 text-xl sm:text-3xl font-display uppercase tracking-[0.15em] text-black placeholder-neutral-350 focus:ring-0 outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={() => { setIsHeaderSearchOpen(false); setHeaderSearchQuery(''); }} 
                    className="text-black hover:rotate-90 p-2 ml-4 transition-transform duration-300"
                  >
                    <X className="w-6 h-6 stroke-[1]" />
                  </button>
                </div>

                {headerSearchQuery ? (
                  <div>
                    <h4 className="font-display text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-8 font-semibold">
                      Résultats correspondants ({
                        globalProducts.filter((p: any) => 
                          p.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(headerSearchQuery.toLowerCase())) || 
                          (p.badge && p.badge.toLowerCase().includes(headerSearchQuery.toLowerCase()))
                        ).length
                      })
                    </h4>
                    
                    {globalProducts.filter((p: any) => 
                      p.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) || 
                      (p.description && p.description.toLowerCase().includes(headerSearchQuery.toLowerCase())) || 
                      (p.badge && p.badge.toLowerCase().includes(headerSearchQuery.toLowerCase()))
                    ).length === 0 ? (
                      <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans mt-4">Aucune silhouette ou pièce correspondante.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
                        {globalProducts.filter((p: any) => 
                          p.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(headerSearchQuery.toLowerCase())) || 
                          (p.badge && p.badge.toLowerCase().includes(headerSearchQuery.toLowerCase()))
                        ).map((product: any) => (
                          <div 
                            key={product.id}
                            onClick={() => {
                              setIsHeaderSearchOpen(false); 
                              setHeaderSearchQuery('');
                              navigate(`/product/${product.id}`);
                            }}
                            className="cursor-pointer group text-black space-y-2 select-none"
                          >
                            <div className="aspect-[3/4] bg-neutral-100 overflow-hidden relative">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-102" 
                              />
                            </div>
                            <div className="space-y-0.5">
                              <span className="block font-display text-[9px] uppercase tracking-[0.15em] font-medium leading-tight truncate">{product.name}</span>
                              <span className="block font-mono text-[9px] text-[#777]">{formatPriceC(product.price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Searches list */}
                    <div className="space-y-5">
                      <h5 className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#999] font-semibold">Recherches Populaires</h5>
                      <div className="flex flex-col gap-3">
                        {['Robe en lin', 'Blazer Croisé', 'Mocassins Cuir', 'Parfum Signature', 'T-shirt'].map((term) => (
                          <button 
                            key={term}
                            onClick={() => setHeaderSearchQuery(term)}
                            className="text-left font-display text-[15px] hover:text-neutral-400 transition-colors uppercase tracking-[0.15em]"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Curated boxes */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => { setHeaderSearchQuery('Lin'); }} 
                        className="relative aspect-[16/10] group overflow-hidden bg-neutral-100 text-left"
                      >
                        <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80" alt="Robes en Lin" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-103 saturate-50 contrast-110" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
                        <span className="absolute bottom-4 left-4 font-display text-white text-xs uppercase tracking-widest font-black">LE LIN NATUREL</span>
                      </button>

                      <button 
                        onClick={() => { setHeaderSearchQuery('Cuir'); }} 
                        className="relative aspect-[16/10] group overflow-hidden bg-neutral-100 text-left"
                      >
                        <img src="https://images.unsplash.com/photo-1614252339460-e14859f13eb6?w=800&q=80" alt="Mocassins en Cuir" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-103 saturate-50 contrast-110" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
                        <span className="absolute bottom-4 left-4 font-display text-white text-xs uppercase tracking-widest font-black">SOULIERS CUIR</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ZARA SIGNATURE BURGER MENU DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-xs z-[140]"
            />
            
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }} 
              transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }} 
              className="fixed inset-y-0 left-0 w-full sm:w-[480px] z-[150] bg-white text-black flex flex-col p-6 sm:p-10 shadow-2xl overflow-y-auto font-sans"
            >
              <div className="flex justify-between items-center mb-12 shrink-0">
                <span className="font-display italic text-2xl tracking-[0.25em] uppercase font-light text-black">ZARIA</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-black hover:rotate-90 p-2 transition-transform duration-300"
                >
                  <X className="w-6 h-6 stroke-[1]" />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-start space-y-10">
                <div className="space-y-6">
                  <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-[#999]">Rayons / Collections</span>
                  
                  <div className="flex flex-col gap-6">
                    {globalCategories.map((dept: any, idx: number) => {
                      if (dept.id === 'all') return null;
                      return (
                      <motion.div 
                        key={dept.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.05, duration: 0.35 }}
                      >
                        <Link 
                          to={`/collection?category=${dept.id}`} 
                          onClick={() => setIsMobileMenuOpen(false)} 
                          className="font-display text-xl sm:text-2xl text-black font-medium tracking-wider hover:text-neutral-500 hover:pl-2 transition-all block uppercase"
                        >
                          {dept.name}
                        </Link>
                      </motion.div>
                    )})}
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-8 space-y-4">
                  <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-[#999]">L'Atelier</span>
                  <div className="flex flex-col gap-3 text-[10px] tracking-widest font-sans uppercase text-neutral-800">
                    <Link to="/winter-collection" onClick={() => setIsMobileMenuOpen(false)} className="text-[#DA291C] font-bold transition-colors">COLLECTION D'HIVER ❄️</Link>
                    <Link to="/boutiques" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black transition-colors">Nos Boutiques ({currentCountry.name})</Link>
                    <button onClick={() => { setIsMobileMenuOpen(false); setIsCallbackModalOpen(true); }} className="text-left hover:text-black transition-colors uppercase">Besoin d'aide ? Rappel Immédiat</button>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-6 mt-8 flex justify-between items-center text-[9px] uppercase tracking-widest text-neutral-400 shrink-0">
                <button onClick={handleCountrySwitch} className="hover:text-black transition-colors flex items-center gap-2">
                  <span>{currentCountry.flag}</span>
                  <span className="font-bold underline text-neutral-800">{currentCountry.name}</span>
                </button>
                <span className="text-[8px] font-mono">Antananarivo, Madagascar</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AUTH SYSTEM TRANSLATED TO PREMIUM FULL-PAGES */}

      <main className="flex-1 w-full relative z-10">
        {children}
      </main>

      {/* CTAs removed for minimal design */}

      <AnimatePresence>
        {isCallbackModalOpen && (
          <CallbackModal onClose={() => setIsCallbackModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* RETAIL FOOTER */}
      <footer className="bg-white text-black border-t border-gray-200 mt-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-20 flex flex-col md:flex-row justify-between gap-12">
          <div className="flex-1">
             <h4 className="font-display uppercase tracking-widest text-xs mb-8">Navigation</h4>
             <ul className="space-y-4 text-xs tracking-widest font-sans uppercase">
               <li><Link to="/collection" className="text-gray-500 hover:text-black transition-colors">Collection</Link></li>
               <li><Link to="/boutiques" className="text-gray-500 hover:text-black transition-colors">Boutiques</Link></li>
             </ul>
          </div>
          
          <div className="flex-1">
             <h4 className="font-display uppercase tracking-widest text-xs mb-8">Entreprise</h4>
             <ul className="space-y-4 text-xs tracking-widest font-sans uppercase">
               <li><Link to="/a-propos" className="text-gray-500 hover:text-black transition-colors">À Propos</Link></li>
             </ul>
          </div>

          <div className="flex-1">
             <h4 className="font-display uppercase tracking-widest text-xs mb-8">Assistance</h4>
             <ul className="space-y-4 text-xs tracking-widest font-sans uppercase">
               <li><Link to="/contact" className="text-gray-500 hover:text-black transition-colors">Contact</Link></li>
               <li><button onClick={() => setIsCallbackModalOpen(true)} className="text-gray-500 hover:text-black transition-colors uppercase tracking-widest">Aide</button></li>
             </ul>
          </div>

          <div className="flex-[2] md:text-right">
             <div className="mb-6">
                <span className="font-display text-4xl tracking-tighter uppercase">{globalConfig?.brandName || 'ZARIA'}</span>
             </div>
             <p className="font-sans text-xs tracking-widest text-gray-400 uppercase">
                {currentCountry.name}
             </p>
          </div>
        </div>
        <div className="border-t border-gray-100 p-8 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest uppercase text-gray-400 bg-white">
           <div className="flex gap-4 mb-4 md:mb-0 flex-wrap">
              <Link to="/politique-de-confidentialite" className="hover:text-black transition-colors">Confidentialité</Link>
              <Link to="/conditions-utilisation" className="hover:text-black transition-colors">Conditions</Link>
              <Link to="/politique-livraison" className="hover:text-black transition-colors">Livraison</Link>
           </div>
           <p>© {new Date().getFullYear()} ZARIA. TOUS DROITS RÉSERVÉS.</p>
        </div>
      </footer>

      {/* STEP 2 : THE REAL CART DRAWER (VALIDATION) */}
      <AnimatePresence>
        {isCartOpen && <CartDrawer onClose={() => setIsCartOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
        {editingCartItem && (
          <ProductDetailModal 
            product={editingCartItem.product} 
            editCartItem={editingCartItem}
            onClose={() => setEditingCartItem(null)} 
          />
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {lastAdded && (
          <motion.div 
            key={lastAdded}
            initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }} 
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }} 
            exit={{ opacity: 0, y: -20, scale: 0.8, x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-28 sm:top-32 left-1/2 z-[60] bg-gray-900/95 backdrop-blur-md text-white px-6 py-4 rounded-full shadow-none flex items-center gap-4 border-[3px] border-gray-700 pointer-events-none min-w-[280px]"
          >
             <div className="bg-white text-black rounded-full p-1.5 shadow-inner border border-yellow-300">
               <ShoppingBag className="w-5 h-5"/>
             </div>
             <div className="flex flex-col">
               <span className="font-black text-sm uppercase tracking-wide">Panier mis à jour</span>
               <span className="font-bold text-gray-400 text-xs">{lastAdded} ajouté avec succès</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <POSSelectionModal isOpen={isPOSModalOpen} onClose={() => setIsPOSModalOpen(false)} />
      

    </div>
  );
}

function POSSelectionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { globalPOS, selectedPOS, setSelectedPOS, userCoords } = useCart();
  
  const sortedPOS = [...globalPOS].sort((a, b) => {
    if (!userCoords || a.lat === undefined || b.lat === undefined) return 0;
    const distA = Math.sqrt(Math.pow(a.lat - userCoords.lat, 2) + Math.pow(a.lng - userCoords.lng, 2));
    const distB = Math.sqrt(Math.pow(b.lat - userCoords.lat, 2) + Math.pow(b.lng - userCoords.lng, 2));
    return distA - distB;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-8 pb-4">
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Choisir mon boutique</h2>
              <p className="text-gray-500 font-bold text-sm mb-6 uppercase tracking-widest">Le service est optimisé pour votre emplacement actuel.</p>
              
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {sortedPOS.map((pos: any, idx: number) => {
                  const hasCoords = pos.lat !== undefined && pos.lng !== undefined;
                  const dist = (userCoords && hasCoords) ? Math.round(Math.sqrt(Math.pow(pos.lat - userCoords.lat, 2) + Math.pow(pos.lng - userCoords.lng, 2)) * 111) : null;
                  const isNearest = idx === 0 && userCoords && hasCoords;
                  
                  return (
                    <button 
                      key={pos.id} 
                      onClick={() => { setSelectedPOS(pos); onClose(); }}
                      className={`w-full p-4 rounded-none border-2 transition-all flex flex-col items-start gap-1 relative overflow-hidden ${selectedPOS?.id === pos.id ? 'border-black bg-gray-50/50' : 'border-gray-100 hover:border-[#FFC72C] bg-white'}`}
                    >
                      {isNearest && <span className="absolute top-0 right-0 bg-white text-black px-3 py-1 font-black text-[10px] rounded-bl-xl uppercase tracking-tighter shadow-sm">À proximité !</span>}
                      <span className="font-black text-lg text-gray-900 flex items-center gap-2">
                        {pos.name}
                        {selectedPOS?.id === pos.id && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </span>
                      <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5 line-clamp-1 text-left">
                        <MapPin className="w-3 h-3 text-black" /> {pos.address}
                      </span>
                      {dist !== null && <span className="text-[10px] font-black text-black uppercase tracking-widest mt-1">À environ {dist} km de vous</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
               <button onClick={onClose} className="font-black text-xs text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Rester sur le site</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- NEW COMPONENT: CART DRAWER (STEP 2 - VALIDATION) ---
function CartDrawer({ onClose }: { onClose: () => void }) {
  const { cart, getCartTotal, updateQuantity, removeFromCart, clearCart, formatPriceC, addToCart, globalConfig, setEditingCartItem } = useCart();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-white flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 mt-2">
           <h2 className="font-display text-sm tracking-widest uppercase text-black">
             Panier ({cart.length})
           </h2>
           <button onClick={onClose} className="p-1 hover:opacity-50 transition-opacity">
             <X className="w-5 h-5 text-black stroke-[1]" />
           </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
               <p className="font-display text-xs uppercase tracking-widest text-[#111]">Votre panier est vide</p>
               <button onClick={onClose} className="mt-6 border-b border-black text-black text-xs pb-1 uppercase tracking-widest">
                 Continuer vos achats
               </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Items */}
              <div className="space-y-6 border-t border-gray-100 pt-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 border-b border-gray-100 pb-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-32 bg-gray-50 shrink-0">
                         <img src={item.product.image} className="w-full h-full object-cover mix-blend-multiply" alt={item.product.name} />
                      </div>
                      <div className="flex-1 flex flex-col justify-between pt-1">
                         <div className="flex justify-between items-start">
                           <div>
                             <h4 className="font-display text-xs text-black uppercase tracking-widest">{item.product.name}</h4>
                             <p className="text-gray-500 text-xs mt-1">{formatPriceC(item.product.price)}</p>
                           </div>
                           <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-black transition-colors"><X className="w-4 h-4 stroke-[1]"/></button>
                         </div>
                         <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">{item.instructions || 'Taille non spécifiée'}</div>
                         <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center gap-4 text-xs">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-gray-400"><Minus className="w-3 h-3 stroke-[1]"/></button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-gray-400"><Plus className="w-3 h-3 stroke-[1]"/></button>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-gray-100 p-6 shrink-0">
             <div className="flex justify-between items-center mb-6">
                <span className="font-display text-xs tracking-widest uppercase text-gray-500">Total net</span>
                <span className="font-display text-sm tracking-widest uppercase text-black">{formatPriceC(getCartTotal())}</span>
             </div>
             
             <button 
               onClick={() => {
                 onClose();
                 navigate('/checkout');
               }}
               disabled={globalConfig?.isBoutiqueOpen === false}
               className={`w-full py-4 font-display text-xs tracking-[0.2em] uppercase transition-colors ${globalConfig?.isBoutiqueOpen === false ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900 border border-black'}`}
             >
                {globalConfig?.isBoutiqueOpen === false ? (
                  <>Boutique Fermée</>
                ) : (
                  <>Payer</>
                )}
             </button>
             
             {globalConfig?.isBoutiqueOpen === false && (
               <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest">
                 Service momentanément suspendu.
               </p>
             )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// --- HOME & COLLECTION PAGES COMBINED RENDER (Kept exact franchise vibe) ---
function PromoBanner({ globalConfig }: { globalConfig: any }) {
   if (!globalConfig?.promoActive || !globalConfig?.promoText) return null;
   return (
      <div className="bg-black text-white font-sans uppercase tracking-[0.2em] text-[10px] py-3 text-center">
         {globalConfig.promoText}
      </div>
   );
}

function PageHome() {
  const { globalProducts: products, addToCart, setIsCartOpen, formatPriceC, globalConfig } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<'haut' | 'bas' | 'accessoire'>('haut');
  
  // Mix & Match Wardrobe Builder state
  const [selectedTopId, setSelectedTopId] = useState<string>('p5'); // Blazer Croisé
  const [selectedBottomId, setSelectedBottomId] = useState<string>('p6'); // Pantalon Chino Slim
  const [mixMatchSize, setMixMatchSize] = useState<string>('M');
  const [isAddedMixMatch, setIsAddedMixMatch] = useState(false);

  const featured = products?.filter((p: any) => p.isAvailable !== false).slice(0, 4) || [];

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) {
    return (
      <div className="h-[100vh] flex items-center justify-center text-gray-400 bg-white">
        <span className="text-[10px] uppercase tracking-[0.3em] font-sans animate-pulse">Chargement de l'univers ZARIA...</span>
      </div>
    );
  }

  const activeProduct = featured[activeIndex];

  // Dynamic products resolved from actual database/backup list for interactive features
  const hotspotBlazer = (globalConfig?.hotspotHautId && products.find(p => p.id === globalConfig.hotspotHautId)) || products.find(p => p.id === 'p5' || p.name.toLowerCase().includes('blazer')) || products[0];
  const hotspotTrouser = (globalConfig?.hotspotBasId && products.find(p => p.id === globalConfig.hotspotBasId)) || products.find(p => p.id === 'p6' || p.name.toLowerCase().includes('pantalon') || p.name.toLowerCase().includes('chino')) || products[1];
  const hotspotRobe = (globalConfig?.hotspotAccessoireId && products.find(p => p.id === globalConfig.hotspotAccessoireId)) || products.find(p => p.id === 'p1' || p.name.toLowerCase().includes('robe')) || products[0];

  // Resolve current active item for hot spots display
  const activeHotspotItem = 
    activeHotspot === 'haut' ? hotspotBlazer :
    activeHotspot === 'bas' ? hotspotTrouser : hotspotRobe;

  // Wardrobe builder collections (Tops & Bottoms in Studio des Styles)
  const tops = globalConfig?.studioTopIds && Array.isArray(globalConfig.studioTopIds) && globalConfig.studioTopIds.length > 0
    ? products.filter(p => globalConfig.studioTopIds.includes(p.id))
    : products.filter(p => p.id === 'p5' || p.id === 'p2' || p.name.toLowerCase().includes('veste') || p.name.toLowerCase().includes('blazer') || p.name.toLowerCase().includes('t-shirt'));
  
  const bottoms = globalConfig?.studioBottomIds && Array.isArray(globalConfig.studioBottomIds) && globalConfig.studioBottomIds.length > 0
    ? products.filter(p => globalConfig.studioBottomIds.includes(p.id))
    : products.filter(p => p.id === 'p6' || p.id === 'p1' || p.name.toLowerCase().includes('pantalon') || p.name.toLowerCase().includes('robe') || p.name.toLowerCase().includes('chino'));

  const selectedTop = products.find(p => p.id === selectedTopId) || hotspotBlazer;
  const selectedBottom = products.find(p => p.id === selectedBottomId) || hotspotTrouser;

  const handleBuyMixMatch = () => {
    setIsAddedMixMatch(true);
    // Add both selected products to cart
    if (selectedTop) {
      addToCart(selectedTop, 1, `Taille: ${mixMatchSize}`, [mixMatchSize], selectedTop.price);
    }
    if (selectedBottom && selectedBottom.id !== selectedTop?.id) {
      addToCart(selectedBottom, 1, `Taille: ${mixMatchSize}`, [mixMatchSize], selectedBottom.price);
    }
    
    setTimeout(() => {
      setIsAddedMixMatch(false);
      setIsCartOpen(true);
    }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* 01. CINEMATIC INTERACTIVE EDITORIAL LOOKBOOK */}
      <section className="relative w-full h-[100vh] sm:h-[110vh] -mt-16 sm:-mt-20 flex items-center justify-center overflow-hidden bg-[#fafafa]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={activeProduct.image} 
              alt={activeProduct.name} 
              className="absolute inset-0 w-full h-full object-cover object-top" 
            />
            {/* Extremely subtle gradient, avoiding heavy 'black/40' typical vibes. */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
          </motion.div>
        </AnimatePresence>

        {/* Minimal Editorial Badge */}
        <div className="absolute top-28 left-6 sm:left-12 z-20 space-y-2 select-none hidden md:block">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/90 block font-mono">AUTOMNE / HIVER</span>
        </div>

        {/* Center Headline */}
        <div className="absolute bottom-20 sm:bottom-28 left-0 w-full flex flex-col items-center justify-center text-center z-10 px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <h2 className="font-display italic text-6xl sm:text-7xl md:text-9xl text-white font-light tracking-[0.05em] sm:tracking-[0.1em] mb-12 max-w-5xl leading-[0.9] pr-4 sm:pr-8 drop-shadow-sm">
                {activeProduct.name}
              </h2>
              <div className="flex gap-4">
                <Link 
                  to="/collection" 
                  className="inline-block border-b border-white text-white px-8 py-3 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-sans hover:text-white/60 hover:border-white/60 transition-all duration-500"
                >
                  DECOUVRIR LA SILHOUETTE
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Elegant Minimal Counter */}
        <div className="absolute right-6 sm:right-12 bottom-20 sm:bottom-28 z-20 flex select-none text-white font-mono text-[10px] tracking-widest items-center gap-4">
           <span>0{activeIndex + 1}</span>
           <div className="w-10 h-px bg-white/30 relative">
             <motion.div 
               className="absolute inset-y-0 left-0 bg-white"
               initial={{ width: 0 }}
               animate={{ width: "100%" }}
               key={activeIndex}
               transition={{ duration: 5, ease: "linear" }}
             />
           </div>
           <span>0{featured.length}</span>
        </div>

        {/* Minimal Bottom Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-10">
          <motion.div 
            key={activeIndex}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-full bg-white"
          />
        </div>
      </section>

      {/* 02. INTERACTIVE SHOP-THE-LOOK SILHOUETTE HOTSPOTS */}
      <section className="py-24 bg-neutral-50 px-4 sm:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Text & Meta & Details - shown FIRST on desktop, SECOND on mobile */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <span className="text-[10px] tracking-[0.35em] text-gray-400 block uppercase font-mono">01 // ÉDITORIAL DE LA SAISON</span>
          <h3 className="font-display text-3xl sm:text-4xl uppercase text-black font-light tracking-[0.15em] leading-tight">
            Shop the Look <br/>Interactif
          </h3>
          <p className="text-gray-500 font-sans text-[10px] tracking-widest uppercase leading-relaxed max-w-sm pb-4">
            Survolez ou cliquez sur les points lumineux de la silhouette pour révéler les pièces sélectionnées.
          </p>

          {/* Connected Panel Displaying Selected Hotspot Item with Liquid Glass Styling */}
          <AnimatePresence mode="wait">
            {activeHotspotItem && (
              <motion.div
                key={activeHotspot}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`${globalConfig?.enableLiquidGlass ? 'liquid-glass-card shadow-xl' : 'bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl'} p-6 flex gap-6 items-center relative overflow-visible rounded-2xl`}
              >
                {/* Subtle colorful refraction circle background */}
                <span className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-neutral-200/20 blur-2xl pointer-events-none" />
                
                <div className="w-24 shrink-0 overflow-hidden shadow-xl drop-shadow-xl z-20 rounded-lg">
                  <img src={activeHotspotItem.image} alt={activeHotspotItem.name} className="w-full aspect-[3/4.5] object-cover scale-105" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 space-y-2 min-w-0 z-10 pt-2 lg:pt-0">
                  <span className="text-[9px] text-white bg-black/95 px-2.5 py-0.5 tracking-[0.3em] font-mono uppercase inline-block mb-1 rounded-md border border-white/10 shadow-sm">
                    {activeHotspot === 'haut' ? 'VESTE / HAUT' : activeHotspot === 'bas' ? 'BAS / PANTALON' : 'ACCESSOIRES'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-display uppercase tracking-widest text-black font-extrabold truncate">{activeHotspotItem.name}</h4>
                  <p className="text-[10px] font-sans tracking-widest text-gray-500 font-bold">{formatPriceC(activeHotspotItem.price)}</p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      let instructions = 'Taille: M';
                      let options: any = { selectedSize: 'M' };
                      if (activeHotspotItem.sizes) {
                        instructions = `Taille: ${activeHotspotItem.sizes[0]}`;
                        options.selectedSize = activeHotspotItem.sizes[0];
                      }
                      if (activeHotspotItem.colors) {
                        instructions += `, Couleur: ${activeHotspotItem.colors[0]}`;
                        options.selectedColor = activeHotspotItem.colors[0];
                      }
                      addToCart(activeHotspotItem, 1, instructions, [], activeHotspotItem.price, options);
                      setIsCartOpen(true);
                    }}
                    className="text-[9px] uppercase tracking-[0.2em] text-black border-b border-black/80 pb-0.5 hover:text-gray-500 hover:border-gray-300 font-extrabold pt-1 inline-block transition-all"
                  >
                    AJOUTER AU PANIER
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The campaign photo with pulsing markers - shown SECOND on desktop, FIRST on mobile */}
        <div className="lg:col-span-8 relative aspect-[3/4.5] md:aspect-[3/4] lg:aspect-[16/10] bg-[#e5e5e5] overflow-hidden order-1 lg:order-2">
          <img 
            src={globalConfig?.campaignImage || "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=100"} 
            alt="Zaria Campaign" 
            className="absolute inset-0 w-full h-full object-cover object-top filter contrast-[1.05]" 
          />
          <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>

          {/* HOTSPOT 1: Upper Torso (Blazer) */}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setActiveHotspot('haut'); }}
            className="absolute top-[28%] left-[51%] z-30 group -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-0 w-12 h-12 flex items-center justify-center cursor-pointer touch-manipulation"
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${activeHotspot === 'haut' ? 'bg-white' : 'bg-white/40'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 shadow-lg transition-transform ${activeHotspot === 'haut' ? 'bg-white scale-125' : 'bg-white/90 scale-100 group-hover:scale-110'}`}></span>
            </span>
          </button>

          {/* HOTSPOT 2: Legs (Trouser) */}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setActiveHotspot('bas'); }}
            className="absolute top-[62%] left-[49%] z-30 group -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-0 w-12 h-12 flex items-center justify-center cursor-pointer touch-manipulation"
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${activeHotspot === 'bas' ? 'bg-white' : 'bg-white/40'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 shadow-lg transition-transform ${activeHotspot === 'bas' ? 'bg-white scale-125' : 'bg-white/90 scale-100 group-hover:scale-110'}`}></span>
            </span>
          </button>

          {/* HOTSPOT 3: Lower Outfit or Dress */}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setActiveHotspot('accessoire'); }}
            className="absolute top-[48%] left-[53%] z-30 group -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-0 w-12 h-12 flex items-center justify-center cursor-pointer touch-manipulation"
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${activeHotspot === 'accessoire' ? 'bg-white' : 'bg-white/40'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 shadow-lg transition-transform ${activeHotspot === 'accessoire' ? 'bg-white scale-125' : 'bg-white/90 scale-100 group-hover:scale-110'}`}></span>
            </span>
          </button>
        </div>
      </section>

      {/* 03. DOUBLE EDITORIAL SPLITS (EXPANDING BOXES) */}
      <section className="w-full flex flex-col md:flex-row h-[75vh] sm:h-[85vh] border-y border-black/5 select-none overflow-hidden">
        {/* FEMME PANEL */}
        <Link 
          to="/collection"
          className="relative flex-1 group overflow-hidden flex items-center justify-center transition-all duration-[800ms] ease-[0.2,1,0.2,1] hover:flex-[1.25]"
        >
          <img 
            src={globalConfig?.femmeImage || "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80"} 
            alt="Mode Femme Zaria" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-[1.03] filter contrast-[1.02]" 
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors duration-700 mix-blend-overlay" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 transition-transform duration-700 group-hover:-translate-y-2">
            <span className="text-[10px] font-mono shadow-sm px-3 py-1 bg-white/10 backdrop-blur-md uppercase tracking-[0.4em] text-white/90 mb-4 font-light border border-white/20">LA SÉLECTION</span>
            <h3 className="font-display italic text-6xl sm:text-7xl md:text-8xl text-white tracking-[0.05em] sm:tracking-[0.1em] drop-shadow-lg">
              Femme
            </h3>
          </div>
        </Link>

        {/* HOMME PANEL */}
        <Link 
          to="/collection"
          className="relative flex-1 group overflow-hidden flex items-center justify-center transition-all duration-[800ms] ease-[0.2,1,0.2,1] hover:flex-[1.25]"
        >
          <img 
            src={globalConfig?.hommeImage || "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1400&q=80"} 
            alt="Mode Homme Zaria" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-[1.03] filter contrast-[1.02]" 
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors duration-700 mix-blend-overlay" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 transition-transform duration-700 group-hover:-translate-y-2">
            <span className="text-[10px] font-mono shadow-sm px-3 py-1 bg-white/10 backdrop-blur-md uppercase tracking-[0.4em] text-white/90 mb-4 font-light border border-white/20">L'ESSENTIEL</span>
            <h3 className="font-display italic text-6xl sm:text-7xl md:text-8xl text-white tracking-[0.05em] sm:tracking-[0.1em] drop-shadow-lg">
              Homme
            </h3>
          </div>
        </Link>
      </section>

      {/* 04. LE MIX & MATCH CHIC (INTERACTIVE WARDROBE BUILDER) */}
      <section className="py-24 sm:py-32 bg-[#fafafa] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-mono">03 / L'ÉDITION SUR MESURE</span>
            <h3 className="font-display italic text-4xl sm:text-5xl text-black tracking-[0.05em] sm:tracking-[0.1em] font-light">{globalConfig?.studioTitle || 'Le Studio des Styles'}</h3>
            <p className="text-[11px] font-sans text-gray-500 tracking-[0.2em] uppercase leading-relaxed pt-2">
              {globalConfig?.studioSubtitle || 'Associez les silhouettes de nos collections respectives.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left selector panel: Selection column */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-8">
              
              {/* TOPS SELECTION */}
              <div className="space-y-4">
                <span className="text-[10px] tracking-widest uppercase text-black font-semibold border-b border-black pb-1.5 block w-max">
                  Choisissez le Haut
                </span>
                <div className="space-y-3 pt-2">
                  {tops.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedTopId(item.id)}
                      className={`w-full flex items-center p-3 text-left border transition-all ${
                        selectedTopId === item.id ? 'border-black bg-neutral-900 text-white' : 'border-gray-200 bg-white hover:border-gray-400 text-black'
                      }`}
                    >
                      <img src={item.image} alt={item.name} className="w-12 aspect-[3/4] object-cover bg-neutral-100 shrink-0 mr-4" />
                      <div className="min-w-0">
                        <h4 className="text-[11px] uppercase tracking-wider font-semibold truncate">{item.name}</h4>
                        <p className="text-[10px] font-mono opacity-80 mt-1">{formatPriceC(item.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* BOTTOMS SELECTION */}
              <div className="space-y-4 pt-4 lg:pt-0">
                <span className="text-[10px] tracking-widest uppercase text-black font-semibold border-b border-black pb-1.5 block w-max">
                  Choisissez le Bas
                </span>
                <div className="space-y-3 pt-2">
                  {bottoms.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedBottomId(item.id)}
                      className={`w-full flex items-center p-3 text-left border transition-all ${
                        selectedBottomId === item.id ? 'border-black bg-neutral-900 text-white' : 'border-gray-200 bg-white hover:border-gray-400 text-black'
                      }`}
                    >
                      <img src={item.image} alt={item.name} className="w-12 aspect-[3/4] object-cover bg-neutral-100 shrink-0 mr-4" />
                      <div className="min-w-0">
                        <h4 className="text-[11px] uppercase tracking-wider font-semibold truncate">{item.name}</h4>
                        <p className="text-[10px] font-mono opacity-80 mt-1">{formatPriceC(item.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Middle Preview Panel: Cinematic Presentation Canvas */}
            <div className="lg:col-span-5 relative bg-neutral-100 h-[500px] lg:h-auto min-h-[500px] border border-gray-100 overflow-hidden shadow-inner group">
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/20 to-transparent z-40 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent z-40 pointer-events-none" />
              
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full shadow-lg border border-white/10">
                 <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-white">Création en Cours</span>
              </div>
              
              <div className="absolute inset-0 flex flex-col md:flex-row h-full">
                {/* TOP HALF / LEFT HALF */}
                <div className="relative flex-1 md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-white/20 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedTopId}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      src={selectedTop?.image}
                      alt={selectedTop?.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 z-10 bg-gradient-to-t md:bg-gradient-to-r from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-white/70 block mb-1">HAUT SÉLECTIONNÉ</span>
                    <span className="text-white text-xs font-semibold tracking-widest uppercase">{selectedTop?.name}</span>
                  </div>
                </div>
                
                {/* BOTTOM HALF / RIGHT HALF */}
                <div className="relative flex-1 md:w-1/2 h-1/2 md:h-full overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedBottomId}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      src={selectedBottom?.image}
                      alt={selectedBottom?.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 z-10 bg-gradient-to-b md:bg-gradient-to-l from-black/40 to-transparent" />
                  <div className="absolute top-4 right-4 text-right z-20">
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-white/70 block mb-1">BAS SÉLECTIONNÉ</span>
                    <span className="text-white text-xs font-semibold tracking-widest uppercase">{selectedBottom?.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right details & quick buy panel */}
            <div className={`lg:col-span-3 p-6 flex flex-col justify-between font-display ${globalConfig?.enableLiquidGlass ? 'liquid-glass-card shadow-sm' : 'bg-neutral-50 border border-gray-100 shadow-sm'}`}>
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <span className="text-[10px] uppercase tracking-widest text-[#a1a1a1] block mb-1">COMPOSITION SÉLECTIONNÉE</span>
                  <h4 className="text-black uppercase text-sm tracking-widest font-semibold">Silhouette Complète</h4>
                </div>

                <div className="space-y-4 text-xs font-sans tracking-widest text-[#555] uppercase">
                  {selectedTop && (
                    <div className="flex justify-between items-center bg-white/70 p-2.5 border border-gray-100">
                      <span className="truncate pr-4">{selectedTop.name}</span>
                      <span className="font-mono text-black text-[11px] font-semibold shrink-0">{formatPriceC(selectedTop.price)}</span>
                    </div>
                  )}
                  {selectedBottom && selectedBottom.id !== selectedTop?.id && (
                    <div className="flex justify-between items-center bg-white/70 p-2.5 border border-gray-100">
                      <span className="truncate pr-4">{selectedBottom.name}</span>
                      <span className="font-mono text-black text-[11px] font-semibold shrink-0">{formatPriceC(selectedBottom.price)}</span>
                    </div>
                  )}
                </div>

                {/* Size Selector */}
                <div className="space-y-2 font-sans">
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block font-semibold">Taille Silhouette</span>
                  <div className="flex gap-2.5">
                    {['S', 'M', 'L', 'XL'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setMixMatchSize(s)}
                        className={`w-10 h-10 border text-[10px] transition-all flex items-center justify-center font-bold font-mono ${
                          mixMatchSize === s ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black text-black'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Purchase action & total price summary */}
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] uppercase tracking-widest text-[#777] font-sans font-bold">TOTAL SILHOUETTE</span>
                  <span className="text-base font-bold font-mono text-black">
                    {formatPriceC((selectedTop?.price || 0) + (selectedBottom?.id !== selectedTop?.id ? (selectedBottom?.price || 0) : 0))}
                  </span>
                </div>

                <button
                  onClick={handleBuyMixMatch}
                  disabled={isAddedMixMatch}
                  className="w-full bg-black hover:bg-neutral-900 text-white font-sans py-4 font-black uppercase text-xs tracking-[0.25em] transition-all relative flex items-center justify-center gap-2"
                >
                  {isAddedMixMatch ? (
                    <span className="animate-pulse">AJOUT AUX COMPTES CART...</span>
                  ) : (
                    <>
                      <span>ACHETER LA SILHOUETTE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
}

function PageCollection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [activeCollection, setActiveCollection] = useState(searchParams.get('collection') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  useEffect(() => {
    setActiveCategory(searchParams.get('category') || 'all');
    setActiveCollection(searchParams.get('collection') || 'all');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  
  const { globalProducts: products, globalCategories: categories, globalCollections, formatPriceC, globalConfig } = useCart();
  const isLoading = products.length === 0 && categories.length === 0;

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => p.isAvailable !== false).filter((p: any) => {
      let categoryMatch = activeCategory === 'all' ? true : p.categoryId === activeCategory;
      let collectionMatch = activeCollection === 'all' ? true : p.collectionId === activeCollection;
      let searchMatch = true;
      if (deferredSearchQuery.trim() !== '') {
        const query = deferredSearchQuery.toLowerCase();
        searchMatch = p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query));
      }
      return categoryMatch && collectionMatch && searchMatch;
    });
  }, [products, deferredSearchQuery, activeCategory, activeCollection]);

  const updateCategory = (cat: string) => {
    setActiveCategory(cat);
    setActiveCollection('all');
    setSearchQuery('');
    
    const newParams = new URLSearchParams();
    if (cat !== 'all') newParams.set('category', cat);
    setSearchParams(newParams);
  };

  const updateCollection = (col: string) => {
    setActiveCollection(col);
    setActiveCategory('all');
    setSearchQuery('');
    
    const newParams = new URLSearchParams();
    if (col !== 'all') newParams.set('collection', col);
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Cinematic Header Editorial Hero */}
      <div className="relative w-full h-[45vh] flex items-center justify-center bg-neutral-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={globalConfig?.collectionHeaderImage || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=82"} 
            alt="Zaria Seasonal Catalog" 
            className="w-full h-full object-cover object-center filter brightness-[0.45] scale-100 transition-transform duration-[6000ms] hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10"></div>
        </div>
        <div className="relative z-10 text-center max-w-2xl px-6 space-y-4">
          <span className="text-[9px] tracking-[0.45em] text-white/80 block uppercase font-mono font-bold">ZARIA CRÉATION</span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-extralight uppercase tracking-[0.22em] leading-none text-shadow">
            La Collection
          </h1>
          <p className="text-white/70 text-[10px] uppercase tracking-[0.16em] leading-relaxed max-w-lg mx-auto font-sans">
            Des lignes intemporelles et des matières nobles choisies pour façonner une allure élégante en toute simplicité.
          </p>
        </div>
      </div>

      {/* Modern Filter & Search Bar Integration with Liquid Glass components */}
      <div className="sticky top-[64px] bg-white/95 backdrop-blur-md border-b border-gray-100 z-30 shadow-sm py-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 space-y-5">
          
          {/* Section 1: Categories filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.25em] text-gray-400 font-bold uppercase">Parcourir Par Style</span>
            <div className="flex overflow-x-auto hide-scrollbar gap-8 items-center py-1 border-b border-gray-50">
              <button 
                onClick={() => updateCategory('all')} 
                className="relative text-[10px] uppercase tracking-[0.2em] font-bold pb-2 cursor-pointer transition-all shrink-0 select-none block"
              >
                <span className={activeCategory === 'all' && activeCollection === 'all' ? 'text-black' : 'text-gray-400 hover:text-gray-900'}>
                  Tous Les Modèles
                </span>
                {activeCategory === 'all' && activeCollection === 'all' && (
                  <motion.div layoutId="collectionActiveUnderline" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black" />
                )}
              </button>

              {categories.map((cat: any) => (
                <button 
                  key={cat.id} 
                  onClick={() => updateCategory(cat.id)} 
                  className="relative text-[10px] uppercase tracking-[0.2em] font-bold pb-2 cursor-pointer transition-all shrink-0 select-none block"
                >
                  <span className={activeCategory === cat.id ? 'text-black font-black' : 'text-gray-400 hover:text-gray-900'}>
                    {cat.name}
                  </span>
                  {activeCategory === cat.id && (
                    <motion.div layoutId="collectionActiveUnderline" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Collections capsules in majestic frosted Liquid Glass slider */}
          {globalCollections && globalCollections.length > 0 && (
            <div className="flex flex-col gap-2.5 pt-1">
              <span className="text-[10px] tracking-[0.25em] text-gray-400 font-bold uppercase">Créations & Collections Thématiques</span>
              <div className="flex overflow-x-auto hide-scrollbar gap-4 py-1 items-center">
                {globalCollections.map((col: any) => {
                  const isSelected = activeCollection === col.id;
                  return (
                    <button
                      key={col.id}
                      onClick={() => updateCollection(col.id)}
                      className={`relative flex items-center gap-3 px-5 py-2.5 rounded-full overflow-hidden transition-all duration-300 border shrink-0 text-left cursor-pointer group shadow-sm ${
                        isSelected
                          ? 'border-black bg-black text-white scale-[1.02] shadow-md shadow-black/5'
                          : 'border-neutral-200/60 bg-white/40 backdrop-blur-md text-neutral-800 hover:bg-white/80 hover:border-neutral-300'
                      }`}
                    >
                      {/* Subtly colored glowing reflection inside selected collection (Liquid Glass) */}
                      {isSelected && (
                        <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent mix-blend-overlay pointer-events-none animate-pulse"></span>
                      )}
                      
                      {col.image && (
                        <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/20">
                          <img src={col.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold">{col.name}</span>
                        {col.isFeatured && !isSelected && (
                          <span className="text-[7.5px] text-amber-600 font-mono tracking-widest uppercase font-black">Édition Limitée</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Products Grid Content Area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-12">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin"></div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-gray-400">LECTURE DU CATALOGUE ZARIA...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-32 text-center max-w-sm mx-auto space-y-6">
            <span className="text-3xl">🫙</span>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-black font-semibold">Aucun article ne correspond</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider leading-relaxed">
              Nous n'avons pas trouvé de pièces correspondant à votre critère. Explorez une autre catégorie de notre vestonier.
            </p>
            <button 
              onClick={handleClearSearch} 
              className="border border-black text-black px-8 py-3 text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all font-bold block mx-auto"
            >
              Réinitialiser
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredProducts.map((product: any) => (
                <motion.div 
                  layout 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -12 }} 
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
                  key={product.id}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}



function PageBoutiques() {
  const { country, globalPOS, setSelectedPOS, selectedPOS, userCoords } = useCart();
  const currentCountry = COUNTRIES[country];
  
  const displayBoutiques = globalPOS.filter(r => r.country === country || !r.country);
  const defaultCenter: [number, number] = selectedPOS && selectedPOS.lat !== undefined 
    ? [selectedPOS.lat, selectedPOS.lng] 
    : (userCoords ? [userCoords.lat, userCoords.lng] : (displayBoutiques[0] && displayBoutiques[0].lat !== undefined ? [displayBoutiques[0].lat, displayBoutiques[0].lng] : [48.8566, 2.3522]));

  // Luxurious curated photographs to depict high-retail modernist store architectures
  const getBoutiqueImage = (name: string) => {
    if (name.includes("Champs-Élysées")) return "https://images.unsplash.com/photo-1445010694833-07436e524783?w=800&q=70";
    if (name.includes("Marais")) return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=70";
    if (name.includes("Lyon")) return "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=70";
    return "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800&q=70"; // Dakar cozy Warm Resort style
  };

  const handleSelectBoutique = (boutique: any) => {
    setSelectedPOS(boutique);
    const mapElement = document.getElementById("boutique-map-section");
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="bg-white min-h-screen pb-32 pt-24 text-black selection:bg-black selection:text-white">
      {/* Premium Editorial Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
        <div className="space-y-4">
          <span className="text-[10px] tracking-[0.4em] text-gray-400 block uppercase font-mono">03 // ADRESSES ARCHITECTURALES</span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase text-black font-extralight tracking-[0.18em] leading-tight">
            Flagships Zaria
          </h1>
        </div>
        <div>
          <p className="text-gray-500 text-xs tracking-widest uppercase leading-relaxed max-w-md">
            Des espaces conçus comme des havres de sérénité brute, mêlant bois nobles, béton brossé et lin tendu pour accueillir nos collections de haute couture.
          </p>
        </div>
      </div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        
        {/* INTERACTIVE MAP WRAPPED WITH SHADOWS AND OUTLINE */}
        <div id="boutique-map-section" className="bg-neutral-50 h-[55vh] mb-16 relative border border-neutral-200 shadow-xl overflow-hidden group">
           <MapContainer center={defaultCenter} zoom={selectedPOS ? 14 : 11} scrollWheelZoom={false} className="w-full h-full z-10">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <MapUpdater center={defaultCenter} zoom={selectedPOS ? 15 : 12} />
              
              {userCoords && (
                <Marker position={[userCoords.lat, userCoords.lng]}>
                  <Popup className="font-sans text-xs uppercase tracking-widest font-bold">Votre position</Popup>
                </Marker>
              )}
              
              {displayBoutiques.map(pos => (
                <Marker key={pos.id} position={[pos.lat, pos.lng]}>
                  <Popup>
                    <div className="p-2 font-sans text-[11px] uppercase tracking-widest text-black space-y-2">
                       <h4 className="font-extrabold text-black">{pos.name}</h4>
                       <p className="text-gray-500 leading-normal m-0">{pos.address}</p>
                       <p className="text-[9px] font-mono text-gray-400 m-0">{pos.status}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
           </MapContainer>
           
           <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md text-white py-1.5 px-4 text-[9px] uppercase tracking-[0.25em] border border-white/5 font-mono pointer-events-none select-none">
             Boutique Actuelle : {selectedPOS ? selectedPOS.name : 'Veuillez choisir un lieu'}
           </div>
        </div>

        {/* GEOMETRIC ARCHITECTURAL CARDS DIOR-STYLE */}
        <div className="mb-20">
          <div className="border-b border-gray-100 pb-4 mb-8">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-black">
              Explorez nos Maisons de Prêt-à-Porter ({displayBoutiques.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {displayBoutiques.map(r => {
              const isSelected = selectedPOS?.id === r.id;
              return (
                <div 
                  key={r.id} 
                  onClick={() => handleSelectBoutique(r)}
                  className={`group cursor-pointer flex flex-col justify-between border/10 transition-all duration-500 overflow-hidden text-left bg-neutral-50/50 hover:bg-neutral-50 p-4 border ${isSelected ? 'border-black ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-400'}`}
                >
                  <div className="space-y-4">
                    {/* Visual Card Image */}
                    <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden mb-4 border border-neutral-200/20">
                      <img 
                        src={getBoutiqueImage(r.name)} 
                        alt={r.name} 
                        className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                      <div className="absolute bottom-2 left-2 bg-black text-white px-2 py-0.5 tracking-wider text-[8px] font-mono uppercase">
                        {r.status || "Atelier Ouvert"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <span className="text-[8px] font-mono border border-black/10 text-neutral-500 px-1.5 py-0.2 select-none uppercase shrink-0">
                          {r.type || "Boutique"}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400">{r.distance && `~ ${r.distance}`}</span>
                      </div>
                      <h3 className="font-display text-sm uppercase tracking-[0.12em] text-black font-semibold leading-snug">
                        {r.name}
                      </h3>
                      <p className="font-sans text-[10px] uppercase tracking-wider text-gray-500 leading-relaxed min-h-[40px]">
                        {r.address}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 mt-6 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-black font-extrabold group-hover:underline">
                      {isSelected ? 'Maison Sélectionnée' : 'Sélectionner l\'Atelier'}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isSelected ? 'translate-x-1 text-black' : 'text-neutral-400 group-hover:translate-x-1 group-hover:text-black'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- PRODUCT CARD ---
const ProductCard: React.FC<{ product: ProductInfo }> = ({ product }) => {
  const { formatPriceC, addToCart, setIsCartOpen, globalConfig } = useCart();
  const navigate = useNavigate();
  const [quickAddedSize, setQuickAddedSize] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent, size: string, optionType: string = 'Size') => {
    e.stopPropagation();
    let instructions = '';
    let options: any = {};
    if (optionType === 'Size') {
      instructions = `Taille: ${size}`;
      options.selectedSize = size;
    } else if (optionType === 'Pointure') {
      instructions = `Pointure: ${size}`;
      options.selectedPointure = size;
    } else if (optionType === 'Flacon') {
      instructions = `Flacon: ${size}`;
      options.selectedFlacon = size;
    }

    // Default color if applicable
    if (product.colors && product.colors.length > 0) {
      options.selectedColor = product.colors[0];
      instructions += `, Couleur: ${product.colors[0]}`;
    }

    addToCart(product, 1, instructions, [], product.price, options);
    setQuickAddedSize(size);
    setTimeout(() => setQuickAddedSize(null), 2000);
    setIsCartOpen(true);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  // Determine which options to show for quick add
  let quickAddOptions: string[] = [];
  let optionType = 'Size';

  if (product.type === 'clothing') {
    quickAddOptions = product.sizes || [];
    optionType = 'Size';
  } else if (product.type === 'shoes') {
    quickAddOptions = product.pointures || [];
    optionType = 'Pointure';
  } else if (product.type === 'perfume') {
    quickAddOptions = product.flacons || [];
    optionType = 'Flacon';
  }

  // To prevent the UI from overflowing, limit the number of quick options to 5
  const visibleOptions = quickAddOptions.slice(0, 5);

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)} 
      className={`group cursor-pointer flex flex-col overflow-hidden relative h-full select-none transition-all ${
        globalConfig?.enableLiquidGlass 
          ? 'liquid-glass-card p-3 rounded-2xl hover:scale-[1.01]' 
          : 'pt-4 rounded-none'
      }`}
    >
      <div className={`w-full relative aspect-[3/4] bg-neutral-50 overflow-hidden border border-neutral-100/30 transition-all ${
        globalConfig?.enableLiquidGlass ? 'rounded-xl' : 'rounded-none'
      }`}>
        
        {/* Soft elegant image with premium luxury zoom transition */}
        <img 
           src={product.image} 
           alt={product.name} 
           className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1800ms] group-hover:scale-[1.04] ease-out" 
           loading="lazy" 
        />
        
        {/* Fine Parisian vignette overlay */}
        <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/5 transition-all duration-[1200ms]"></div>

        {/* Wishlist Interactive Luxury Heart Button */}
        <button 
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/75 hover:bg-white backdrop-blur-xs rounded-full hover:scale-108 active:scale-95 transition-all text-neutral-800 z-10 shadow-sm border border-neutral-100"
          title="Conserver dans mon vestiaire d'inspiration"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors duration-300 stroke-[1.2] ${isLiked ? 'fill-red-500 text-red-500' : 'text-neutral-900'}`} />
        </button>

        {/* Zara/Chanel style refined Overlay status badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-white/95 text-black border border-neutral-100/40 py-0.5 px-3 text-[8px] uppercase tracking-[0.25em] font-extrabold z-10">
            {product.badge}
          </span>
        )}

        {/* Slide-Up Translucent Quick Size Selector */}
        <div className="absolute bottom-0 inset-x-0 bg-white/70 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center justify-center p-3.5 z-20 border-t border-neutral-100">
          {quickAddedSize ? (
            <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-900 font-extrabold animate-pulse py-1">
              {product.type === 'accessory' ? '✓ RÉSERVE AU PANIER' : `✓ ${optionType === 'Pointure' ? 'Pointure' : optionType === 'Flacon' ? 'Format' : 'Taille'} ${quickAddedSize} réservée`}
            </span>
          ) : (
            <>
              {visibleOptions.length > 0 ? (
                <>
                  <span className="text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] mb-2 block font-extrabold">RÉSERVATION RAPIDE</span>
                  <div className="flex justify-between w-full px-2">
                    {visibleOptions.map((s: string) => (
                      <button
                        key={s}
                        type="button"
                        onClick={(e) => handleQuickAdd(e, s, optionType)}
                        className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-700 hover:text-black hover:font-bold py-1 px-2.5 transition-all outline-none"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(e, 'Unique', 'Unique')}
                  className="w-full text-center text-[10px] uppercase tracking-[0.22em] text-neutral-900 hover:font-bold py-2 font-extrabold transition-all"
                >
                  AJOUT DIRECT AU PANIER
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Refined typography card footer */}
      <div className="mt-4 flex flex-col justify-start pb-4">
        <div className="flex justify-between items-baseline gap-4">
           <h4 className="font-display text-[11px] sm:text-[12px] tracking-widest text-[#1c1c1c] uppercase line-clamp-1 pr-2 font-light group-hover:opacity-70 transition-opacity">
              {product.name}
           </h4>
           <div className="flex items-baseline gap-1 shrink-0">
              {product.oldPrice && (
                <span className="text-[9px] text-[#b3b3b3] line-through mr-1 text-right font-mono">
                  {formatPriceC(product.oldPrice)}
                </span>
              )}
              <span className="font-display text-[11px] sm:text-[12px] tracking-wider text-black font-semibold text-right">
                {formatPriceC(product.price)}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- PRODUCT MODAL ---
const ProductDetailModal: React.FC<{ product: ProductInfo, editCartItem?: CartItem, onClose: () => void }> = ({ product, editCartItem, onClose }) => {
  const { addToCart, updateCartItemInfo, formatPriceC } = useCart();
  const [quantity, setQuantity] = useState(editCartItem?.quantity || 1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(editCartItem?.selectedSize || (product.type === 'clothing' && product.sizes ? product.sizes[0] : undefined));
  const [selectedColor, setSelectedColor] = useState<string | undefined>(editCartItem?.selectedColor || (['clothing', 'accessory', 'shoes'].includes(product.type || '') && product.colors ? product.colors[0] : undefined));
  const [selectedPointure, setSelectedPointure] = useState<string | undefined>(editCartItem?.selectedPointure || (product.type === 'shoes' && product.pointures ? product.pointures[0] : undefined));
  const [selectedFlacon, setSelectedFlacon] = useState<string | undefined>(editCartItem?.selectedFlacon || (product.type === 'perfume' && product.flacons ? product.flacons[0] : undefined));

  useEffect(() => { document.body.style.overflowY = 'hidden'; return () => { document.body.style.overflowY = 'auto'; }; }, []);

  const handleAdd = () => {
    let finalInstructions = [];
    const sizeVal = product.type === 'clothing' ? selectedSize : undefined;
    const colorVal = ['clothing', 'accessory', 'shoes'].includes(product.type || '') ? selectedColor : undefined;
    const pointureVal = product.type === 'shoes' ? selectedPointure : undefined;
    const flaconVal = product.type === 'perfume' ? selectedFlacon : undefined;

    if (sizeVal) finalInstructions.push(`Taille: ${sizeVal}`);
    if (colorVal) finalInstructions.push(`Couleur: ${colorVal}`);
    if (pointureVal) finalInstructions.push(`Pointure: ${pointureVal}`);
    if (flaconVal) finalInstructions.push(`Flacon: ${flaconVal}`);
    
    const instructionsStr = finalInstructions.join(', ');
    const basePrice = editCartItem?.basePrice !== undefined ? editCartItem.basePrice : product.price;
    const options = { 
      selectedSize: sizeVal, 
      selectedColor: colorVal, 
      selectedPointure: pointureVal, 
      selectedFlacon: flaconVal 
    };
    
    if (editCartItem) {
      updateCartItemInfo(editCartItem.id, product, quantity, instructionsStr, [], basePrice, options);
    } else {
      addToCart(product, quantity, instructionsStr, [], basePrice, options);
    }
    onClose();
  };

  const basePriceForRender = editCartItem?.basePrice !== undefined ? editCartItem.basePrice : product.price;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
         initial={{ x: "100%" }} 
         animate={{ x: 0 }} 
         exit={{ x: "100%" }} 
         transition={{ type: "tween", ease: "circOut", duration: 0.4 }} 
         onClick={(e) => e.stopPropagation()} 
         className="w-full sm:max-w-md bg-white h-full flex flex-col relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center text-black hover:opacity-50"><X className="w-6 h-6 stroke-[1]" /></button>
        
        <div className="w-full h-1/2 relative shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
           <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
          <h1 className="font-display font-medium text-2xl uppercase tracking-widest text-black leading-tight mb-2">{product.name}</h1>
          <span className="font-display text-sm tracking-wider text-black mb-8">{formatPriceC(basePriceForRender)}</span>
          <p className="font-sans text-xs text-gray-500 leading-relaxed mb-6 uppercase tracking-widest">{product.description}</p>
          
          <div className="space-y-6">
            {product.type === 'clothing' && product.sizes && (
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-gray-400 mb-3">Sélectionnez la taille</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((size: string) => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 h-10 px-3 flex items-center justify-center border text-xs tracking-widest transition-colors ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-200 text-black hover:border-gray-400'}`}
                    >
                       {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {['clothing', 'accessory', 'shoes'].includes(product.type || '') && product.colors && (
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-gray-400 mb-3">Sélectionnez la couleur</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.colors.map((color: string) => (
                    <button 
                      key={color} 
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 px-4 flex items-center justify-center border text-xs tracking-widest transition-colors ${selectedColor === color ? 'border-black bg-black text-white' : 'border-gray-200 text-black hover:border-gray-400'}`}
                    >
                       {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.type === 'shoes' && product.pointures && (
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-gray-400 mb-3">Sélectionnez la pointure</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.pointures.map((pointure: string) => (
                    <button 
                      key={pointure} 
                      onClick={() => setSelectedPointure(pointure)}
                      className={`min-w-12 h-10 px-2 flex items-center justify-center border text-xs tracking-widest transition-colors ${selectedPointure === pointure ? 'border-black bg-black text-white' : 'border-gray-200 text-black hover:border-gray-400'}`}
                    >
                       {pointure}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {product.type === 'perfume' && product.flacons && (
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-gray-400 mb-3">Format du flacon</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.flacons.map((flacon: string) => (
                    <button 
                      key={flacon} 
                      onClick={() => setSelectedFlacon(flacon)}
                      className={`h-10 px-4 flex items-center justify-center border text-xs tracking-widest transition-colors ${selectedFlacon === flacon ? 'border-black bg-black text-white' : 'border-gray-200 text-black hover:border-gray-400'}`}
                    >
                       {flacon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 shrink-0 flex gap-4">
          <button onClick={handleAdd} className="flex-1 bg-black text-white px-6 py-4 font-display text-xs uppercase tracking-[0.2em] hover:bg-gray-900 transition-colors">
            {editCartItem ? 'Sauvegarder' : 'Ajouter au panier'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- CMS PAGES ---
function PageCustomCMS({ specificKey, title }: { specificKey: string, title: string }) {
  const { pageKey: routeKey } = useParams();
  const targetKey = specificKey || routeKey;
  const { data: pages, loading } = useFirestore('page_content');
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    if (!loading && pages) {
      const found = pages.find((p: any) => p.pageKey === targetKey);
      setPage(found);
    }
  }, [loading, pages, targetKey]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-8">
           <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <div className="bg-white rounded-none p-8 sm:p-16 shadow-none border border-gray-100">
           <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase mb-8 pb-8 border-b border-gray-100">{page?.title || title || (targetKey ? targetKey.toUpperCase() : 'Page')}</h1>
           {loading ? (
             <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
             </div>
           ) : page ? (
             <div className="space-y-8">
                {page.sections?.map((s: any, idx: number) => (
                  <div key={idx}>
                     {s.title && <h2 className="text-xl font-black text-gray-900 mb-3">{s.title}</h2>}
                     {s.question && <h3 className="text-lg font-bold text-gray-900 mb-2">{s.question}</h3>}
                     {s.content && <p className="text-gray-600 font-medium leading-relaxed mb-4">{s.content}</p>}
                     {s.answer && <p className="text-gray-600 font-medium leading-relaxed mb-4">{s.answer}</p>}
                     {s.text && <p className="text-gray-600 font-medium leading-relaxed mb-4">{s.text}</p>}
                  </div>
                ))}
             </div>
           ) : (
             <p className="text-gray-500 font-bold">Aucun contenu disponible pour cette page actuellement.</p>
           )}
        </div>
      </div>
    </div>
  );
}

function CallbackModal({ onClose }: { onClose: () => void }) {
  const { activeOrder, formatPriceC } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'>('idle');
  const [activeTab, setActiveTab] = useState<'tracker' | 'form' | 'policy'>('tracker');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const { addDoc, collection, getFirestore } = await import('firebase/firestore');
      const db = getFirestore();
      await addDoc(collection(db, 'callbacks'), {
        name,
        phone,
        message,
        status: 'pending',
        createdAt: Date.now()
      });
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert("Erreur lors de l'envoi de votre demande de rappel. Veuillez réessayer.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-black"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0, y: 10 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-none p-6 sm:p-12 w-full max-w-2xl relative shadow-2xl overflow-y-auto max-h-[90vh] font-sans selection:bg-black selection:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-black hover:opacity-50 p-1"
        >
          <X className="w-6 h-6 stroke-[1]" />
        </button>

        <div className="border-b border-black pb-4 mb-8">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#999] block mb-1">
            Service clients d'exception
          </span>
          <h3 className="font-display text-lg uppercase tracking-[0.2em] font-bold text-black">
            ZARIA ASSISTANCE & SUPPORT
          </h3>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 mb-8 overflow-x-auto gap-6 sm:gap-12">
          <button 
            onClick={() => setActiveTab('tracker')}
            className={`pb-3 text-[11px] font-display uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'tracker' ? 'font-bold text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            Suivre ma commande
          </button>
          <button 
            onClick={() => setActiveTab('form')}
            className={`pb-3 text-[11px] font-display uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'form' ? 'font-bold text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            Demander un rappel
          </button>
          <button 
            onClick={() => setActiveTab('policy')}
            className={`pb-3 text-[11px] font-display uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'policy' ? 'font-bold text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            Guide & Livraisons
          </button>
        </div>

        {/* Tab content 1: Order Tracker */}
        {activeTab === 'tracker' && (
          <div className="space-y-6 animate-fade-in">
            {activeOrder ? (
              <div className="border border-gray-100 p-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#777] border-b border-gray-100 pb-3">
                  <span>Numéro de réservation</span>
                  <span className="font-mono text-black font-semibold">{activeOrder.id?.slice(0, 8).toUpperCase() || "EC-82A7"}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-display uppercase tracking-widest text-black font-semibold">Statut actuel</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] bg-black text-white px-3 py-1 font-bold">
                       En cours de préparation dans votre Boutique
                    </span>
                  </div>

                  <div className="flex justify-between text-xs uppercase tracking-widest">
                    <span className="text-gray-400">Client</span>
                    <span className="text-black font-medium">{activeOrder.customerName}</span>
                  </div>

                  <div className="flex justify-between text-xs uppercase tracking-widest">
                    <span className="text-gray-400">Boutique</span>
                    <span className="text-black font-semibold">{activeOrder.posName || "ZARIA Madrid"}</span>
                  </div>

                  <div className="flex justify-between text-xs uppercase tracking-widest">
                    <span className="text-gray-400">Total</span>
                    <span className="text-black font-bold">{formatPriceC(activeOrder.total ?? activeOrder.totalPrice ?? 0)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 text-[9px] uppercase tracking-widest text-[#999] leading-relaxed border-l-2 border-black">
                  Présentez ce reçu ou votre e-mail de confirmation lors de votre visite en magasin pour récupérer vos pièces exclusives.
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 leading-relaxed max-w-sm mx-auto">
                  Aucune commande active enregistrée sur cet appareil. Vos réservations de pièces s'afficheront ici en direct après votre confirmation d'achat.
                </p>
                <div className="pt-4">
                  <button 
                    onClick={onClose}
                    className="border border-black text-black px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all font-semibold"
                  >
                    Découvrir la collection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab content 2: Callback Request form */}
        {activeTab === 'form' && (
          <div className="animate-fade-in">
            {status === 'success' ? (
              <div className="text-center py-10 space-y-4">
                <span className="text-emerald-600 block text-sm font-semibold uppercase tracking-widest">
                  ✓ Demande enregistrée avec succès
                </span>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 leading-relaxed max-w-sm mx-auto">
                  Un conseiller du service d'exception ZARIA va vous rappeler sur le numéro fourni.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 leading-relaxed mb-4">
                  Renseignez vos coordonnées afin qu'un conseiller de notre équipe vous contacte sous 24 heures ouvrées.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#777] mb-1">Votre Nom complet</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="EX: JEAN RAKOTO" 
                      required 
                      className="w-full bg-transparent border-0 border-b border-gray-200 py-3 px-0 text-xs font-sans uppercase tracking-widest text-black focus:border-black focus:ring-0 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#777] mb-1">Votre Numéro de téléphone</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="EX: 034 00 000 00" 
                      required 
                      className="w-full bg-transparent border-0 border-b border-gray-200 py-3 px-0 text-xs font-sans uppercase tracking-widest text-black focus:border-black focus:ring-0 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-[#777] mb-1">Votre message / Demande</label>
                  <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="EX: INFORMATIONS SUR LA COLLECTION LIN, DISPONIBILITÉ D'ARTICLE..." 
                    rows={2} 
                    className="w-full bg-transparent border-0 border-b border-gray-200 py-3 px-0 text-xs font-sans uppercase tracking-widest text-black focus:border-black focus:ring-0 outline-none transition-all resize-none"
                    required
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={status === 'loading'} 
                    className="w-full bg-black text-white hover:bg-gray-900 transition-all py-4 text-xs font-display uppercase tracking-[0.25em]"
                  >
                    {status === 'loading' ? 'Envoi en cours...' : 'Planifier le rappel'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab content 3: Guarantees & Policy */}
        {activeTab === 'policy' && (
          <div className="space-y-6 animate-fade-in text-xs uppercase tracking-widest leading-relaxed text-[#777]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-[10px]">
              <div className="space-y-2">
                <h4 className="text-black font-semibold tracking-widest">Envoi & Retraits</h4>
                <p>• Retrait en boutique : Entièrement gratuit sous 2 à 24 heures.</p>
                <p>• Livraison à domicile : Service d'exception express.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-black font-semibold tracking-widest">Retours faciles</h4>
                <p>• Vous disposez de 30 jours à compter de la date d'achat.</p>
                <p>• Les retours s'effectuent directement et gratuitement dans l'une de nos enseignes ZARIA.</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <span className="text-[9px] text-[#999] block mb-2">Canal instantané</span>
              <p className="mb-4">Pour une assistance immédiate, nos stylistes et conseillers personnels sont disponibles en ligne par messagerie instantanée.</p>
              <a 
                href="https://wa.me/34600000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-black px-6 py-2.5 text-[9px] text-black font-semibold tracking-widest hover:bg-black hover:text-white transition-all"
              >
                Nous écrire sur WhatsApp
              </a>
            </div>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}

function ReservationModal({ onClose, selectedPOS, posList }: { onClose: () => void, selectedPOS: any, posList: any[] }) {
  return null;
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [targetPOS, setTargetPOS] = useState(selectedPOS?.id || (posList.length > 0 ? posList[0].id : ''));
  const [status, setStatus] = useState<'idle'|'loading'|'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const { addDoc, collection, getFirestore } = await import('firebase/firestore');
      const db = getFirestore();
      
      const payload = {
        customerName,
        phone,
        date,
        time,
        guests: Number(guests),
        posId: targetPOS,
        status: 'pending',
        createdAt: Date.now()
      };
      
      await addDoc(collection(db, 'reservations'), payload);
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert("Erreur lors de l'envoi de votre réservation. Veuillez réessayer.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-none p-6 sm:p-10 w-full max-w-md relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {status === 'success' ? (
           <div className="text-center py-8">
             <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-2">Réservation reçue !</h3>
             <p className="text-gray-500 font-bold mb-6">Nous vous confirmerons votre rendez-vous très rapidement.</p>
             <button onClick={onClose} className="w-full bg-gray-900 text-white py-4 rounded-none font-black uppercase tracking-widest hover:bg-black transition-colors">
               Fermer
             </button>
           </div>
        ) : (
           <>
             <div className="w-16 h-16 bg-gray-50 text-black rounded-none flex items-center justify-center mb-6">
               <Clock className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Rendez-vous</h3>
             <p className="text-gray-500 font-bold text-sm mb-8">Remplissez ce formulaire pour réserver votre créneau Personal Shopper dans la boutique de votre choix.</p>

             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-xs font-black text-gray-400 tracking-widest uppercase mb-1">Votre Nom</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ex: Jean Rakoto" required className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-none focus:border-black focus:ring-0 font-bold text-gray-900 outline-none transition-colors" />
               </div>
               <div>
                  <label className="block text-xs font-black text-gray-400 tracking-widest uppercase mb-1">Votre Numéro</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="034 00 000 00" required className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-none focus:border-black focus:ring-0 font-bold text-gray-900 outline-none transition-colors" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-black text-gray-400 tracking-widest uppercase mb-1">Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-none focus:border-black focus:ring-0 font-bold text-gray-900 outline-none transition-colors" />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-gray-400 tracking-widest uppercase mb-1">Heure</label>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-none focus:border-black focus:ring-0 font-bold text-gray-900 outline-none transition-colors" />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-black text-gray-400 tracking-widest uppercase mb-1">Personnes</label>
                    <input type="number" min="1" max="20" value={guests} onChange={(e) => setGuests(Number(e.target.value))} required className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-none focus:border-black focus:ring-0 font-bold text-gray-900 outline-none transition-colors" />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-gray-400 tracking-widest uppercase mb-1">Boutique</label>
                    <select value={targetPOS} onChange={(e) => setTargetPOS(e.target.value)} required className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-none focus:border-black focus:ring-0 font-bold text-gray-900 outline-none transition-colors">
                      {posList.map(pos => (
                        <option key={pos.id} value={pos.id}>{pos.name}</option>
                      ))}
                    </select>
                 </div>
               </div>
               
               <button type="submit" disabled={status === 'loading'} className={`w-full text-white py-4 mt-2 rounded-none font-black uppercase text-sm tracking-widest shadow-none transition-all flex items-center justify-center gap-2 ${status === 'loading' ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}>
                 {status === 'loading' ? 'Envoi en cours...' : 'Réserver !'}
               </button>
             </form>
           </>
        )}
      </motion.div>
    </motion.div>
  );
}

function PlatformRatingModal({ onClose }: { onClose: () => void }) {
  return null;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'>('idle');

  const handleSubmit = async () => {
    if (rating === 0) return;
    setStatus('loading');
    try {
      const { addDoc, collection, getFirestore } = await import('firebase/firestore');
      const db = getFirestore();
      
      await addDoc(collection(db, 'reviews'), {
        type: 'platform',
        rating,
        comment,
        createdAt: Date.now()
      });

      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (e) {
      console.error(e);
      setStatus('idle');
      alert("Erreur lors de l'envoi de votre avis. Veuillez réessayer.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-none p-6 sm:p-10 w-full max-w-md shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
         <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5 text-gray-500"/></button>
         
         {status === 'success' ? (
           <div className="text-center py-8">
             <CheckCircle className="w-16 h-16 text-[#25D366] mx-auto mb-4" />
             <h3 className="text-2xl font-black text-gray-900 mb-2">Merci pour votre avis !</h3>
             <p className="text-gray-500 font-bold mb-6">Votre avis compte beaucoup pour nous aider à améliorer ZARIA.</p>
           </div>
         ) : (
           <>
             <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2 text-center">Notez notre App</h3>
             <p className="text-center text-gray-500 font-bold mb-8 text-sm">Que pensez-vous de la plateforme ZARIA ?</p>
             
             <div className="flex flex-col items-center">
               <div className="flex gap-2 mb-8">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button 
                     key={star}
                     onMouseEnter={() => setHoverRating(star)}
                     onMouseLeave={() => setHoverRating(0)}
                     onClick={() => setRating(star)}
                     className="p-1 transition-transform hover:scale-110 active:scale-95"
                   >
                     <Star className={`w-12 h-12 ${star <= (hoverRating || rating) ? 'fill-[#FFC72C] text-white' : 'text-gray-200'}`} />
                   </button>
                 ))}
               </div>
               
               {rating > 0 && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                   <textarea 
                     value={comment}
                     onChange={(e) => setComment(e.target.value)}
                     placeholder="Un commentaire pour nous améliorer ?"
                     className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-4 font-bold text-gray-900 focus:border-black focus:ring-0 mb-6 min-h-[100px] outline-none"
                   />
                   <button 
                     onClick={handleSubmit} 
                     disabled={status === 'loading'}
                     className="w-full bg-black text-white rounded-none py-4 font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg shadow-gray-500/20 active:scale-95"
                   >
                     {status === 'loading' ? 'Envoi...' : 'Envoyer mon avis'}
                   </button>
                 </motion.div>
               )}
             </div>
           </>
         )}
      </motion.div>
    </motion.div>
  );
}
