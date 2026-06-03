import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronDown, ChevronUp, Check, Info, HelpCircle } from 'lucide-react';
import { useCart } from '../App';

export function PageProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { globalProducts, addToCart, formatPriceC } = useCart();
  
  const product = globalProducts.find(p => p.id === productId);

  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedPointure, setSelectedPointure] = useState<string | undefined>(undefined);
  const [selectedFlacon, setSelectedFlacon] = useState<string | undefined>(undefined);
  const [isAdded, setIsAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ transformOrigin: 'center' });

  // Sync state when product loads
  useEffect(() => {
    if (product) {
      // Taille ONLY for clothing (habits)
      setSelectedSize(product.type === 'clothing' && product.sizes && product.sizes.length > 0 ? (product.sizes.includes('M') ? 'M' : product.sizes[0]) : undefined);
      // Couleur for clothing (habits), accessories (accessoires), shoes (chaussures)
      setSelectedColor((['clothing', 'accessory', 'shoes'].includes(product.type || '')) && product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
      // Pointure ONLY for shoes
      setSelectedPointure(product.type === 'shoes' && product.pointures && product.pointures.length > 0 ? product.pointures[0] : undefined);
      // Flacon ONLY for perfume
      setSelectedFlacon(product.type === 'perfume' && product.flacons && product.flacons.length > 0 ? product.flacons[0] : undefined);
    }
  }, [product]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  const recommendations = useMemo(() => {
    if (!product) return [];
    let list = globalProducts.filter((p: any) => p.categoryId === product.categoryId && p.id !== product.id && p.isAvailable !== false);
    if (list.length < 4) {
      const remaining = globalProducts.filter((p: any) => p.id !== product.id && p.isAvailable !== false && p.categoryId !== product.categoryId);
      list = [...list, ...remaining];
    }
    return list.slice(0, 4);
  }, [globalProducts, product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <h2 className="font-display text-2xl uppercase tracking-widest text-black mb-4">Pièce introuvable</h2>
        <p className="text-gray-500 font-sans text-xs uppercase tracking-widest mb-8">Cet article n'est pas disponible ou n'existe pas.</p>
        <Link to="/collection" className="border border-black text-black px-8 py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    let finalInstructions = [];
    let options: any = {};
    
    if (product.type === 'clothing' && selectedSize) {
      finalInstructions.push(`Taille: ${selectedSize}`);
      options.selectedSize = selectedSize;
    }
    if (['clothing', 'accessory', 'shoes'].includes(product.type || '') && selectedColor) {
      finalInstructions.push(`Couleur: ${selectedColor}`);
      options.selectedColor = selectedColor;
    }
    if (product.type === 'shoes' && selectedPointure) {
      finalInstructions.push(`Pointure: ${selectedPointure}`);
      options.selectedPointure = selectedPointure;
    }
    if (product.type === 'perfume' && selectedFlacon) {
      finalInstructions.push(`Flacon: ${selectedFlacon}`);
      options.selectedFlacon = selectedFlacon;
    }
    
    const instructionsStr = finalInstructions.join(', ');
    addToCart(product, 1, instructionsStr, [], product.price, options);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="bg-white min-h-screen pt-24 pb-32">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4 stroke-[1]" /> Retour
        </button>

        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24">
          
          {/* Left Column: Vertical Image Showcase */}
          <div className="flex-1">
            <div 
              onMouseMove={handleMouseMove}
              className="aspect-[3/4] w-full bg-gray-50 overflow-hidden relative group cursor-crosshair"
            >
              <motion.img 
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                style={zoomStyle}
                transition={{ duration: 0.8 }}
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.5]"
              />
              {product.badge && (
                <span className="absolute top-6 left-6 bg-white/95 text-black border border-black/5 py-1.5 px-4 text-[9px] uppercase tracking-[0.2em] font-semibold">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Dynamic Floating Specs */}
          <div className="w-full lg:w-[450px] shrink-0">
            <div className="sticky top-28 space-y-10">
              
              {/* Main Title & Price */}
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-medium tracking-[0.15em] text-black uppercase leading-tight mb-4">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-4 mt-2">
                  <span className="font-display text-lg tracking-wider text-black">
                    {formatPriceC(product.price)}
                  </span>
                  {product.oldPrice && (
                    <span className="font-display text-sm tracking-wider text-gray-400 line-through">
                      {formatPriceC(product.oldPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description styled precisely like ZARA */}
              <div className="border-t border-gray-100 pt-6">
                <p className="font-sans text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
                  {product.description || "Édition limitée confectionnée avec soin. Pièce fluide et élégante aux finitions minimalistes, pensée pour dessiner une silhouette moderne et intemporelle."}
                </p>
              </div>

              <div className="space-y-6">
                {/* Sizes Selection (For Clothing / Habits ONLY) */}
                {product.type === 'clothing' && product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs uppercase tracking-widest">
                      <span className="text-gray-400">Sélectionner la taille</span>
                      <button 
                        onClick={() => setShowSizeGuide(true)} 
                        className="text-black hover:opacity-50 transition-all underline decoration-1 text-[10px]"
                      >
                        Guide des tailles
                      </button>
                    </div>
                
                    <div className="grid grid-cols-4 gap-2">
                      {product.sizes.map((size) => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`py-3 border text-xs tracking-widest transition-all rounded-none font-sans uppercase ${
                              isSelected 
                                ? 'bg-black border-black text-white font-bold' 
                                : 'border-gray-200 text-black hover:border-black'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Colors Selection (For Clothing / Habits, Accessoires, and Chaussures ONLY) */}
                {['clothing', 'accessory', 'shoes'].includes(product.type || '') && product.colors && product.colors.length > 0 && (
                  <div className="space-y-4">
                    <span className="block text-xs uppercase tracking-widest text-gray-400">Sélectionner la couleur</span>
                    <div className="grid grid-cols-3 gap-2">
                      {product.colors.map((color) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`py-3 border text-[10px] tracking-widest transition-all rounded-none font-sans uppercase truncate ${
                              isSelected 
                                ? 'bg-black border-black text-white font-bold' 
                                : 'border-gray-200 text-black hover:border-black'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pointure Selection (For Shoes / Chaussures ONLY) */}
                {product.type === 'shoes' && product.pointures && product.pointures.length > 0 && (
                  <div className="space-y-4">
                    <span className="block text-xs uppercase tracking-widest text-[#777]">Sélectionner la pointure</span>
                    <div className="grid grid-cols-4 gap-2">
                      {product.pointures.map((pointure) => {
                        const isSelected = selectedPointure === pointure;
                        return (
                          <button
                            key={pointure}
                            onClick={() => setSelectedPointure(pointure)}
                            className={`py-3 border text-xs tracking-widest transition-all rounded-none font-sans uppercase ${
                              isSelected 
                                ? 'bg-black border-black text-white font-bold' 
                                : 'border-gray-200 text-black hover:border-black'
                            }`}
                          >
                            {pointure}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Flacon Selection (For Parfum ONLY) */}
                {product.type === 'perfume' && product.flacons && product.flacons.length > 0 && (
                  <div className="space-y-4">
                    <span className="block text-xs uppercase tracking-widest text-gray-400">Format du flacon</span>
                    <div className="grid grid-cols-3 gap-2">
                      {product.flacons.map((flacon) => {
                        const isSelected = selectedFlacon === flacon;
                        return (
                          <button
                            key={flacon}
                            onClick={() => setSelectedFlacon(flacon)}
                            className={`py-3 border text-xs tracking-widest transition-all rounded-none font-sans uppercase ${
                              isSelected 
                                ? 'bg-black border-black text-white font-bold' 
                                : 'border-gray-200 text-black hover:border-black'
                            }`}
                          >
                            {flacon}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Add to Basket Action */}
              <div className="pt-4">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-5 text-xs font-display uppercase tracking-[0.25em] transition-all rounded-none flex items-center justify-center gap-3 ${
                    isAdded 
                      ? 'bg-green-600 text-white' 
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2]" /> Ajouté au panier
                    </>
                  ) : (
                    'Ajouter au panier'
                  )}
                </button>
              </div>

              {/* Expandable Technical Details (Composition, Origin) */}
              <div className="border-t border-gray-200 pt-6 space-y-1">
                
                {/* Composition */}
                <div className="border-b border-gray-100 pb-4">
                  <button 
                    onClick={() => toggleSection('composition')} 
                    className="w-full flex justify-between items-center text-left py-2 font-display text-[11px] uppercase tracking-[0.2em] text-black hover:opacity-75 transition-opacity"
                  >
                    <span>Composition & Entretien</span>
                    {openSection === 'composition' ? <ChevronUp className="w-4 h-4 stroke-[1]" /> : <ChevronDown className="w-4 h-4 stroke-[1]" />}
                  </button>
                  {openSection === 'composition' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-4 text-[10px] font-sans tracking-widest uppercase text-gray-500 leading-relaxed space-y-3"
                    >
                      <p>Tissu principal : 100% Lin biologique de qualité supérieure.</p>
                      <p>Nous travaillons avec des programmes de suivi pour garantir le respect des normes sociales, environnementales et de sécurité de nos vêtements.</p>
                      <p className="border-l-2 border-black pl-3 text-black font-semibold">Prendre soin de vos vêtements, c'est prendre soin de l'environnement. Laver à basse température et programmer des essorages doux.</p>
                    </motion.div>
                  )}
                </div>

                {/* Shipping info */}
                <div className="border-b border-gray-100 pb-4">
                  <button 
                    onClick={() => toggleSection('shipping')} 
                    className="w-full flex justify-between items-center text-left py-2 font-display text-[11px] uppercase tracking-[0.2em] text-black hover:opacity-75 transition-opacity"
                  >
                    <span>Envoi & Retours</span>
                    {openSection === 'shipping' ? <ChevronUp className="w-4 h-4 stroke-[1]" /> : <ChevronDown className="w-4 h-4 stroke-[1]" />}
                  </button>
                  {openSection === 'shipping' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-4 text-[10px] font-sans tracking-widest uppercase text-gray-500 leading-relaxed space-y-2"
                    >
                      <p>Livraison standard à domicile sous 2 à 4 jours ouvrés.</p>
                      <p>Le retrait dans n'importe quelle boutique ZARIA est entièrement gratuit.</p>
                      <p>Vous disposez d'un délai de 30 jours à compter de la date d'expédition pour retourner vos articles gratuitement.</p>
                    </motion.div>
                  )}
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Dynamic Premium Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-32 pt-20 border-t border-neutral-100">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] tracking-[0.35em] text-[#a4a4a4] uppercase font-mono block">RECOMMANDATIONS</span>
                <h3 className="font-display text-2xl uppercase text-black tracking-[0.15em] font-light">Vous aimerez aussi</h3>
              </div>
              <Link 
                to="/collection" 
                className="text-[10px] uppercase font-bold tracking-[0.25em] text-black border-b border-black pb-1 hover:opacity-50 transition-opacity"
              >
                Voir toute la collection &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((item: any) => (
                <div 
                  key={item.id}
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="group cursor-pointer flex flex-col pt-2 overflow-hidden relative select-none"
                >
                  <div className="w-full relative aspect-[3/4] bg-neutral-50 overflow-hidden border border-neutral-100/10 mb-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {item.badge && (
                      <span className="absolute top-3 left-3 bg-white/95 text-black border border-black/5 py-0.5 px-2.5 text-[8px] uppercase tracking-widest font-semibold">
                        {item.badge}
                      </span>
                    )}

                    <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out py-3 text-center border-t border-gray-100">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-black font-extrabold">EXPLORER L'ARTICLE</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-[11px] uppercase tracking-wider text-black font-semibold truncate group-hover:opacity-75 transition-opacity">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono">
                      {formatPriceC(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Size Guide Modal Overlay */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 sm:p-12 max-w-md w-full relative rounded-none text-black selection:bg-black selection:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowSizeGuide(false)} 
              className="absolute top-4 right-4 text-black hover:opacity-50"
            >
              <ArrowLeft className="w-5 h-5 stroke-[1]" />
            </button>
            <h3 className="font-display text-sm uppercase tracking-[0.25em] mb-8 text-black border-b border-black pb-4">GUIDE DES TAILLES</h3>
            <div className="space-y-4 text-[10px] font-sans uppercase tracking-[0.15em] text-gray-500">
              <div className="flex justify-between border-b border-gray-100 pb-2 text-black font-bold">
                <span>Taille</span>
                <span>Poitrine (cm)</span>
                <span>Taille (cm)</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>S</span>
                <span>86 - 90</span>
                <span>66 - 70</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>M</span>
                <span>90 - 94</span>
                <span>70 - 74</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>L</span>
                <span>94 - 100</span>
                <span>74 - 80</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>XL</span>
                <span>100 - 106</span>
                <span>80 - 86</span>
              </div>
            </div>
            <p className="mt-8 text-[9px] font-sans uppercase tracking-widest text-[#777] leading-relaxed">
              Si vous hésitez entre deux tailles, nous vous conseillons de choisir la taille la plus grande pour une coupe plus fluide.
            </p>
          </motion.div>
        </div>
      )}

    </div>
  );
}
