import React, { useState, useMemo } from 'react';
import { useCart } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Sparkles, Filter } from 'lucide-react';

export default function PageWinterCollection() {
  const { globalProducts: products, globalCategories: categories, formatPriceC, globalConfig, addToCart, setIsCartOpen } = useCart();
  const [activeFilter, setActiveFilter] = useState<'all' | 'clothing' | 'shoes' | 'accessory'>('all');

  // Curate products that fit a Cozy Winter ambiance:
  // - Either they have a badge labeled "Hiver", "Winter", "Chaud", "Cozy"
  // - Or they belong to categories that sound wintery, or name matches winter elements (pull, manteau, veste, bottes, laine)
  // - Or they are popular clothing/shoes/accessories
  const winterProducts = useMemo(() => {
    return products.filter((p: any) => {
      // Must be available
      if (p.isAvailable === false) return false;

      const name = p.name?.toLowerCase() || '';
      const desc = p.description?.toLowerCase() || '';
      const badge = p.badge?.toLowerCase() || '';
      
      const hasWinterKeywords = 
        name.includes('veste') || name.includes('manteau') || name.includes('blazer') || name.includes('pull') || name.includes('laine') || name.includes('sweat') || name.includes('chaud') || name.includes('pantalon') || name.includes('bottes') || name.includes('sombre') || name.includes('cozy') || name.includes('cuir') ||
        desc.includes('laine') || desc.includes('chaud') || desc.includes('manteau') || desc.includes('hiver') || desc.includes('velours') || desc.includes('doublé');

      const hasWinterBadge = 
        badge.includes('hiver') || badge.includes('winter') || badge.includes('cozy') || badge.includes('luxe') || badge.includes('chic') || badge.includes('nouveau');

      // Return items matching these winter vibes
      return hasWinterKeywords || hasWinterBadge;
    });
  }, [products]);

  // Filter based on selected sub-type (Clothing, Shoes, etc.)
  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') return winterProducts;
    return winterProducts.filter((p: any) => p.type === activeFilter);
  }, [winterProducts, activeFilter]);

  const headerImage = globalConfig?.winterHeaderImage || "https://images.unsplash.com/photo-1548123304-9462700a30f3?w=1600&q=85";

  return (
    <div className="bg-neutral-950 text-white min-h-screen pb-32 selection:bg-white selection:text-black">
      {/* Editorial Winter Parallax Hero Banner */}
      <div className="relative w-full h-[65vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={headerImage} 
            alt="Zaria Winter Collection" 
            className="w-full h-full object-cover object-center filter brightness-[0.4] contrast-105 scale-100 transition-transform duration-[8000ms] hover:scale-103"
            referrerPolicy="no-referrer"
          />
          {/* Ambient cool blue/silver soft gradient styling */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-black/40"></div>
          
          {/* Cozy Snowflake Atmosphere */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 text-center max-w-3xl px-6 space-y-6">
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-white/30"></span>
            <span className="text-[10px] tracking-[0.5em] text-white/90 uppercase font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" /> ÉDITION LIMITÉE HIVERNALE
            </span>
            <span className="h-px w-6 bg-white/30"></span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl text-white font-extralight uppercase tracking-[0.25em] leading-none mb-2">
            Collection Hiver
          </h1>
          
          <p className="text-gray-300 text-[11px] sm:text-xs uppercase tracking-[0.2em] leading-relaxed max-w-xl mx-auto font-sans font-light">
            Silhouettes épurées, lainages d'exception et drapés d'une élégance absolue. Affrontez les saisons froides avec une allure souveraine.
          </p>
        </div>

        {/* Elegant scroll anchor indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[9px] font-mono tracking-[0.3em] uppercase">Découvrir les silhouettes</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white to-transparent animate-bounce"></div>
        </div>
      </div>

      {/* Styled Winter Category filter rail */}
      <div className="sticky top-[64px] bg-neutral-950/90 backdrop-blur-md border-b border-white/10 z-30 shadow-2xl py-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase tracking-[0.25em] font-mono">
            <Filter className="w-3.5 h-3.5 text-white/70" />
            <span>Filtres :</span>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-8 items-center py-1">
            {[
              { id: 'all', label: 'Toutes les Silhouettes' },
              { id: 'clothing', label: 'Vestes & Tricots' },
              { id: 'shoes', label: 'Chaussures & Bottes' },
              { id: 'accessory', label: 'Accessoires Chauds' }
            ].map((f) => (
              <button 
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className="relative text-[10px] uppercase tracking-[0.2em] font-bold pb-1 cursor-pointer transition-all shrink-0 select-none block"
              >
                <span className={activeFilter === f.id ? 'text-white font-black' : 'text-gray-500 hover:text-white/80'}>
                  {f.label}
                </span>
                {activeFilter === f.id && (
                  <motion.div layoutId="winterActiveLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
                )}
              </button>
            ))}
          </div>
          
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest hidden md:block">
            {filteredProducts.length} ARTICLES SÉLECTIONNÉS
          </div>
        </div>
      </div>

      {/* Grid listing */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-16">
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto space-y-6">
            <p className="text-4xl">❄️</p>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-white font-semibold">Bientôt disponible</h3>
            <p className="text-xs text-gray-400 uppercase tracking-wider leading-relaxed">
              Les ateliers finalisent les dernières pièces d'exception de ce vestiaire d'hiver. Repassez très bientôt.
            </p>
            <Link to="/collection" className="inline-block mt-4 text-[10px] uppercase font-bold tracking-[0.2em] bg-white text-black px-6 py-3 hover:bg-neutral-200 transition-colors">
              Retourner à la Collection Générale
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p: any, idx: number) => (
                <motion.div 
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className="group flex flex-col bg-neutral-900 border border-white/5 overflow-hidden shadow-lg hover:border-white/20 transition-all p-3"
                >
                  {/* Photo Frame */}
                  <Link to={`/product/${p.id}`} className="relative aspect-[3/4] bg-neutral-800 overflow-hidden block">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-105 filter brightness-[0.9] contrast-[1.03]"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Status/Badge Cover Overlays */}
                    {p.badge && (
                      <span className="absolute top-4 left-4 text-[9px] uppercase tracking-[0.2em] bg-white text-black font-mono font-black px-2.5 py-1 z-10 shadow-md">
                        {p.badge}
                      </span>
                    )}

                    {/* Dark sleek gradient hover bottom strip */}
                    <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Link>

                  {/* Meta Frame */}
                  <div className="pt-5 pb-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-4">
                        <Link to={`/product/${p.id}`} className="text-xs sm:text-sm font-display text-white font-medium hover:text-gray-300 transition-colors tracking-wider uppercase truncate flex-1">
                          {p.name}
                        </Link>
                        <span className="text-xs sm:text-sm font-mono text-gray-300 font-bold tracking-tight shrink-0">
                          {formatPriceC(p.price)}
                        </span>
                      </div>
                      
                      {/* Short Description */}
                      <p className="text-[10px] text-gray-400 font-sans tracking-wide leading-relaxed line-clamp-2">
                        {p.description || "Un indispensable du vestiaire d'hiver, façonné dans de belles matières structurantes."}
                      </p>
                    </div>

                    <div className="pt-5 border-t border-white/5 mt-4 flex items-center justify-between gap-3">
                      <Link 
                        to={`/product/${p.id}`} 
                        className="text-[9px] font-mono uppercase tracking-[0.25em] text-gray-400 hover:text-white transition-colors py-1 inline-flex items-center gap-1 shrink-0"
                      >
                        Détails <ChevronRight className="w-3 h-3" />
                      </Link>
                      
                      <button
                        type="button"
                        onClick={() => {
                          let instructions = 'Taille: M';
                          let options: any = { selectedSize: 'M' };
                          if (p.sizes && p.sizes.length > 0) {
                            instructions = `Taille: ${p.sizes[0]}`;
                            options.selectedSize = p.sizes[0];
                          }
                          if (p.colors && p.colors.length > 0) {
                            instructions += `, Couleur: ${p.colors[0]}`;
                            options.selectedColor = p.colors[0];
                          }
                          addToCart(p, 1, instructions, [], p.price, options);
                          setIsCartOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-white text-black font-bold text-[9px] uppercase tracking-[0.16em] hover:bg-neutral-200 transition-all shadow duration-300 inline-flex items-center gap-1.5 shrink-0"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Prendre</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
