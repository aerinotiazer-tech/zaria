import React, { useState, useEffect } from 'react';
import { useAdmin } from './AdminContext';
import { useFirestore } from '../hooks/useFirestore';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Save, Database, CloudLightning, Image as ImageIcon, MapPin, Sparkles, CheckSquare, Square, Download, Activity } from 'lucide-react';
import ImageDropZone from '../components/ImageDropZone';
import { PRODUCTS } from '../App';

export default function AdminSettings() {
  const { role } = useAdmin();
  const { data: configData, loading } = useFirestore('config');
  // Load products list to populate the dropdown selectors and the checkboxes for Studio des Styles look builders
  const { data: products } = useFirestore('products', 'name');
  
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const defaultData = {
      brandName: 'ZARIA',
      whatsappNumber: '+261340000000',
      deliveryFee: 2000,
      isBoutiqueOpen: true,
      enableLiquidGlass: true,
      promoActive: false,
      promoText: '',
      heroTitle1: 'Méga',
      heroTitle2: 'ZARIA',
      heroSubtitle: "Le vêtement le plus attendu de l'année.",
      campaignImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=100",
      femmeImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80",
      hommeImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1400&q=80",
      connexionImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80",
      collectionHeaderImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=82",
      winterHeaderImage: "https://images.unsplash.com/photo-1548123304-9462700a30f3?w=1600&q=85",
      studioTitle: "Le Studio des Styles",
      studioSubtitle: "Associez les silhouettes de nos collections respectives.",
      hotspotHautId: "p5",
      hotspotBasId: "p6",
      hotspotAccessoireId: "p1",
      studioTopIds: ["p5", "p2"],
      studioBottomIds: ["p6", "p1"]
    };

    if (configData && configData.length > 0) {
      setFormData({
        ...defaultData,
        ...configData[0]
      });
    } else if (configData && configData.length === 0 && !loading) {
      setFormData(defaultData);
    }
  }, [configData, loading]);

  const handleImportAllDemoData = async () => {
    if (!window.confirm("IMPORTANT: Cela va importer et synchroniser tous les produits, catégories de démo, collections et points de vente dans votre base Firestore. Continuer ?")) return;
    setSeeding(true);
    try {
      // 1. Categories
      const categoriesToImport = [
        { id: '1', name: 'Femme', icon: '👗', color: 'bg-gray-100', text: 'text-black', order: 1 },
        { id: '2', name: 'Homme', icon: '👔', color: 'bg-gray-100', text: 'text-black', order: 2 },
        { id: '3', name: 'Enfant', icon: '🧸', color: 'bg-gray-100', text: 'text-black', order: 3 },
        { id: '4', name: 'Chaussures', icon: '👠', color: 'bg-gray-100', text: 'text-black', order: 4 },
        { id: '5', name: 'Accessoires', icon: '👜', color: 'bg-gray-100', text: 'text-black', order: 5 },
        { id: '6', name: 'Parfum', icon: '✨', color: 'bg-gray-100', text: 'text-black', order: 6 }
      ];
      for (const cat of categoriesToImport) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }

      // 2. Collections
      const collectionsToImport = [
        { id: 'col1', name: 'Nouvelle Collection ÉTÉ 2026', description: 'Légèreté et élégance inspirées des brises méditerranéennes.', order: 1, isFeatured: true, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80' },
        { id: 'col2', name: 'Essentiels Minimalistes', description: 'Des pièces intemporelles de haute confection adaptées au quotidien.', order: 2, isFeatured: true, image: 'https://images.unsplash.com/photo-1434389678369-182fc23900ca?w=800&q=80' },
        { id: 'col3', name: 'Collection d\'Hiver', description: 'Laines nobles, blazers croisés et manteaux structurés.', order: 3, isFeatured: false, image: 'https://images.unsplash.com/photo-1548123304-9462700a30f3?w=800&q=80' }
      ];
      for (const col of collectionsToImport) {
        await setDoc(doc(db, 'collections', col.id), col);
      }

      // 3. Products
      for (const p of PRODUCTS) {
        await setDoc(doc(db, 'products', p.id), {
          ...p,
          isAvailable: true,
          colorImages: (p as any).colorImages || {}
        });
      }

      // 4. Boutiques / Points Of Sale
      const boutiquesToImport = [
        { id: 'pos1', name: "ZARIA Antananarivo - Ivandry Plaza", address: "Plaza Ivandry, Antananarivo, Madagascar", distance: "0.8 km", status: "Ouvert jusqu'à 18h30", phone: "034 11 222 33", type: "Maison de Couture", lat: -18.878, lng: 47.525, priority: 1, isOpen: true },
        { id: 'pos2', name: "ZARIA Antananarivo - Ankorondrano", address: "Immeuble Standard, Ankorondrano, Antananarivo", distance: "2.1 km", status: "Ouvert jusqu'à 19h", phone: "034 22 345 67", type: "Boutique", lat: -18.892, lng: 47.521, priority: 2, isOpen: true },
        { id: 'pos3', name: "ZARIA Tamatave - Boulevard de la Marne", address: "Boulevard de la Marne, Toamasina, Madagascar", distance: "1.2 km", status: "Ouvert jusqu'à 18h", phone: "032 44 567 89", type: "Boutique", lat: -18.149, lng: 49.402, priority: 3, isOpen: true },
        { id: 'pos4', name: "ZARIA Paris Champs-Élysées", address: "Avenue des Champs-Élysées, Paris", distance: "0.5 km", status: "Ouvert jusqu'à 20h", phone: "01 23 45 67 89", type: "Boutique Principale", lat: 48.868, lng: 2.300, priority: 4, isOpen: true },
        { id: 'pos5', name: "ZARIA Dakar Plateau", address: "Avenue Pompidou, Dakar", distance: "1.2 km", status: "Ouvert jusqu'à 19h", phone: "77 000 00 10", type: "Boutique", lat: 14.673, lng: -17.436, priority: 5, isOpen: true }
      ];
      for (const pos of boutiquesToImport) {
        await setDoc(doc(db, 'points_of_sale', pos.id), pos);
      }

      // 5. Default config
      const configDemo = {
        brandName: 'ZARIA',
        whatsappNumber: '+261340000000',
        deliveryFee: 2000,
        isBoutiqueOpen: true,
        enableLiquidGlass: true,
        promoActive: false,
        promoText: '',
        heroTitle1: 'Méga',
        heroTitle2: 'ZARIA',
        heroSubtitle: "Le vêtement le plus attendu de l'année.",
        campaignImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=100",
        femmeImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80",
        hommeImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1400&q=80",
        connexionImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80",
        collectionHeaderImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=82",
        winterHeaderImage: "https://images.unsplash.com/photo-1548123304-9462700a30f3?w=1600&q=85",
        studioTitle: "Le Studio des Styles",
        studioSubtitle: "Associez les silhouettes de nos collections respectives.",
        hotspotHautId: "p5",
        hotspotBasId: "p6",
        hotspotAccessoireId: "p1",
        studioTopIds: ["p5", "p4", "p2"],
        studioBottomIds: ["p6", "p1", "p3"]
      };
      await setDoc(doc(db, 'config', 'global'), configDemo);
      setFormData(configDemo);
      alert("Toutes les données de démonstration globales ont été injectées correctement !");
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setSeeding(false);
    }
  };

  if (loading || !formData) return <div className="font-bold text-gray-500">Chargement...</div>;

  if (!['super_admin', 'admin'].includes(role || '')) {
    return <div className="p-8 text-center bg-gray-50 text-gray-700 font-bold rounded-none">Accès refusé. Réservé aux administrateurs.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = Number(value);
    }
    
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleToggleTopId = (id: string) => {
    const current = formData.studioTopIds || [];
    const next = current.includes(id) 
      ? current.filter((x: string) => x !== id) 
      : [...current, id];
    setFormData((prev: any) => ({ ...prev, studioTopIds: next }));
  };

  const handleToggleBottomId = (id: string) => {
    const current = formData.studioBottomIds || [];
    const next = current.includes(id) 
      ? current.filter((x: string) => x !== id) 
      : [...current, id];
    setFormData((prev: any) => ({ ...prev, studioBottomIds: next }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (formData.id) {
        const { id, ...dataToUpdate } = formData;
        await updateDoc(doc(db, 'config', id), dataToUpdate);
      } else {
        await setDoc(doc(db, 'config', 'global'), formData);
        setFormData({ ...formData, id: 'global' });
      }
      alert('Paramètres enregistrés avec succès !');
    } catch (e: any) {
      alert("Erreur lors de l'enregistrement : " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl pb-24">
      {/* Settings Top Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Paramètres ZARIA</h1>
          <p className="text-gray-500 font-medium text-xs">Ajustez le lookbook, le catalogue d'hiver, les hotspots de silhouettes et l'ambiance visuelle du site.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-black text-white px-6 py-2.5 rounded-none font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: CORE BUSINESS INFORMATION */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-black text-gray-900 mb-2 border-b border-gray-100 pb-2 flex items-center justify-between">
              <span>Général & Boutique</span>
              <span className="block w-2.5 h-2.5 rounded-full bg-[#DA291C]" />
            </h2>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Nom de la marque</label>
              <input type="text" name="brandName" value={formData.brandName || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 text-sm rounded-none text-gray-900 font-medium focus:border-black outline-none"/>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">WhatsApp Central</label>
              <input type="text" name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 text-sm rounded-none text-gray-900 font-medium focus:border-black outline-none"/>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Livraison de base (Ar)</label>
              <input type="number" name="deliveryFee" value={formData.deliveryFee || 0} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 text-sm rounded-none text-gray-900 font-medium focus:border-black outline-none"/>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-100 bg-gray-50 rounded-none mt-2">
              <input type="checkbox" name="isBoutiqueOpen" checked={formData.isBoutiqueOpen ?? true} onChange={handleChange} className="w-4 h-4 accent-[#DA291C]"/>
              <span className="font-bold text-xs text-gray-700">Prendre les commandes</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-100 bg-gray-50 rounded-none mt-2">
              <input type="checkbox" name="enableLiquidGlass" checked={formData.enableLiquidGlass ?? true} onChange={handleChange} className="w-4 h-4 accent-[#DA291C]"/>
              <span className="font-bold text-xs text-gray-700">Style Liquid Glass (Givré/Premium) 💎</span>
            </label>
          </div>

          {/* EMERGENCY SYSTEM DATA SEEDER CARD */}
          <div className="bg-red-50/50 p-6 border border-red-100 shadow-sm space-y-4">
            <h2 className="font-black text-red-900 mb-2 border-b border-red-100/60 pb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-red-700" />
              <span>Données de Démo & Base</span>
            </h2>
            <p className="text-[11px] text-red-800 font-semibold leading-relaxed">
              Vous avez importé un site vierge ou vidé vos collections Firebase ? Cliquez ci-dessous pour importer d'un coup de baguette magique tous les produits, catégories de démo, points de vente et collections éditables.
            </p>
            <button
              type="button"
              onClick={handleImportAllDemoData}
              disabled={seeding}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 px-4 text-xs uppercase tracking-widest rounded-none transition-colors border-2 border-transparent flex items-center justify-center gap-2 shadow"
            >
              <Download className="w-4 h-4" />
              <span>{seeding ? "Importation générale..." : "Importer tout le Mode Démo"}</span>
            </button>
          </div>

          <div className="bg-white p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-black text-gray-900 mb-2 border-b border-gray-100 pb-2">Bannière Annonce</h2>
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input type="checkbox" name="promoActive" checked={formData.promoActive || false} onChange={handleChange} className="w-4 h-4 accent-[#DA291C]"/>
              <span className="font-bold text-xs text-gray-700">Activer le ruban promo public</span>
            </label>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Message défilant</label>
              <textarea rows={2} name="promoText" value={formData.promoText || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 text-xs rounded-none text-gray-900 font-medium focus:border-black outline-none resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* MID & RIGHT COLUMN: CONFIGURING THE SECTIONS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* INTERACTIVE SHOP THE LOOK MULTI-HOTSPOT CUSTOMIZER */}
          <div className="bg-white p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#DA291C] font-black">Silhouette Interactive</span>
                <h2 className="font-black text-gray-900 text-lg leading-none">Modifier "Shop The Look"</h2>
              </div>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>

            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Associez de vrais produits de votre catalogue aux trois points de survêtement de la silhouette interactive de la page d’accueil.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Hotspot 1: Haut / Blazer */}
              <div className="p-4 bg-gray-50 border border-gray-100 space-y-2">
                <span className="text-[9px] font-mono tracking-wider font-extrabold text-[#DA291C] bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase block w-max">
                  Hotspot Haut
                </span>
                <label className="block text-xs font-black text-gray-700">Pièce du Haut (Veste / Blazer)</label>
                <select 
                  name="hotspotHautId" 
                  value={formData.hotspotHautId || ''} 
                  onChange={handleChange} 
                  className="w-full border border-gray-200 px-3 py-1.5 text-xs focus:ring-0 focus:border-black bg-white rounded-none font-bold"
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price?.toLocaleString()} Ar)</option>
                  ))}
                </select>
                {formData.hotspotHautId && products.find((p: any) => p.id === formData.hotspotHautId) && (
                  <div className="aspect-[3/4.2] overflow-hidden border border-gray-200 mt-2 bg-white">
                    <img src={products.find((p: any) => p.id === formData.hotspotHautId)?.image} alt="Haut hotspot" className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              {/* Hotspot 2: Bas / Pantalon */}
              <div className="p-4 bg-gray-50 border border-gray-100 space-y-2">
                <span className="text-[9px] font-mono tracking-wider font-extrabold text-[#DA291C] bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase block w-max">
                  Hotspot Bas
                </span>
                <label className="block text-xs font-black text-gray-700">Pièce du Bas (Pantalon / Chino)</label>
                <select 
                  name="hotspotBasId" 
                  value={formData.hotspotBasId || ''} 
                  onChange={handleChange} 
                  className="w-full border border-gray-200 px-3 py-1.5 text-xs focus:ring-0 focus:border-black bg-white rounded-none font-bold"
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price?.toLocaleString()} Ar)</option>
                  ))}
                </select>
                {formData.hotspotBasId && products.find((p: any) => p.id === formData.hotspotBasId) && (
                  <div className="aspect-[3/4.2] overflow-hidden border border-gray-200 mt-2 bg-white">
                    <img src={products.find((p: any) => p.id === formData.hotspotBasId)?.image} alt="Bas hotspot" className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              {/* Hotspot 3: Accessoire / Robe */}
              <div className="p-4 bg-gray-50 border border-gray-100 space-y-2">
                <span className="text-[9px] font-mono tracking-wider font-extrabold text-[#DA291C] bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase block w-max">
                  Hotspot Accessoire
                </span>
                <label className="block text-xs font-black text-gray-700">Troisième Pièce (Robe / Accessoire)</label>
                <select 
                  name="hotspotAccessoireId" 
                  value={formData.hotspotAccessoireId || ''} 
                  onChange={handleChange} 
                  className="w-full border border-gray-200 px-3 py-1.5 text-xs focus:ring-0 focus:border-black bg-white rounded-none font-bold"
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price?.toLocaleString()} Ar)</option>
                  ))}
                </select>
                {formData.hotspotAccessoireId && products.find((p: any) => p.id === formData.hotspotAccessoireId) && (
                  <div className="aspect-[3/4.2] overflow-hidden border border-gray-200 mt-2 bg-white">
                    <img src={products.find((p: any) => p.id === formData.hotspotAccessoireId)?.image} alt="Accessoire hotspot" className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STUDIO DES STYLES MIX & MATCH BUILDER AND CATALOG INTEGRATIONS */}
          <div className="bg-white p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#DA291C] font-black">Studio Créateur</span>
                <h2 className="font-black text-gray-900 text-lg leading-none">Modifier "Le Studio des Styles"</h2>
              </div>
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">Titre de la Section</label>
                <input type="text" name="studioTitle" value={formData.studioTitle || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-none text-sm font-medium focus:border-black outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">Sous-titre explicatif</label>
                <input type="text" name="studioSubtitle" value={formData.studioSubtitle || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-none text-sm font-medium focus:border-black outline-none"/>
              </div>
            </div>

            {/* Selecting tops and bottoms list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              {/* LIST OF TOPS FOR SELECTION */}
              <div className="space-y-3">
                <span className="block text-xs font-black uppercase text-gray-700">
                  Sélections des "Hauts / Tops" ({formData.studioTopIds?.length || 0})
                </span>
                <p className="text-[10px] text-gray-400 font-semibold uppercase leading-normal">Cochez les hauts admis dans le Mixer mobile.</p>
                <div className="max-h-56 overflow-y-auto border border-gray-100 rounded bg-gray-50/50 p-2 divide-y divide-gray-100">
                  {products.map((p: any) => {
                    const isChecked = formData.studioTopIds?.includes(p.id) || false;
                    return (
                      <button 
                        key={p.id}
                        type="button"
                        onClick={() => handleToggleTopId(p.id)}
                        className="w-full text-left py-2 px-1 flex items-center gap-3 text-xs hover:bg-gray-100 select-none cursor-pointer"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-black shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <span className="truncate font-semibold text-gray-800">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LIST OF BOTTOMS FOR SELECTION */}
              <div className="space-y-3">
                <span className="block text-xs font-black uppercase text-gray-700">
                  Sélections des "Bas / Robes" ({formData.studioBottomIds?.length || 0})
                </span>
                <p className="text-[10px] text-gray-400 font-semibold uppercase leading-normal">Cochez les bas admis dans le Mixer mobile.</p>
                <div className="max-h-56 overflow-y-auto border border-gray-100 rounded bg-gray-50/50 p-2 divide-y divide-gray-100">
                  {products.map((p: any) => {
                    const isChecked = formData.studioBottomIds?.includes(p.id) || false;
                    return (
                      <button 
                        key={p.id}
                        type="button"
                        onClick={() => handleToggleBottomId(p.id)}
                        className="w-full text-left py-2 px-1 flex items-center gap-3 text-xs hover:bg-gray-100 select-none cursor-pointer"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-black shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <span className="truncate font-semibold text-gray-800">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* EDITORIAL LOOKBOOK PROMO & MAIN MEDIA BANNERS */}
          <div className="bg-white p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#DA291C] font-black">Look & Feel</span>
                <h2 className="font-black text-gray-900 text-lg leading-none">Médiathèque (Bannières du Site)</h2>
              </div>
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>

            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Pour modifier les visuels des différentes bannières du site, glissez-déposez n’importe quelle image ci-dessous ou cliquez pour en charger une. Nos composants convertissent et gèrent le stockage automatiquement !
            </p>

            <div className="space-y-8">
              {/* Campaign main banner */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-none">
                <ImageDropZone
                  value={formData.campaignImage || ''}
                  onChange={(val) => setFormData((prev: any) => ({ ...prev, campaignImage: val }))}
                  label="Image Principale de Campagne (Shop the look interactif)"
                  aspectRatioClassName="aspect-[21/9]"
                />
              </div>

              {/* Winter Special Banner */}
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-none">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[9px] uppercase tracking-widest bg-blue-600 text-white font-mono px-2 py-0.5 rounded font-black">Nouveau</span>
                  <span className="text-xs font-black text-blue-950 uppercase">Bannière de la Page "Collection d'Hiver"</span>
                </div>
                <ImageDropZone
                  value={formData.winterHeaderImage || ''}
                  onChange={(val) => setFormData((prev: any) => ({ ...prev, winterHeaderImage: val }))}
                  aspectRatioClassName="aspect-[21/9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Female Quick Shortcut */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-none">
                  <ImageDropZone
                    value={formData.femmeImage || ''}
                    onChange={(val) => setFormData((prev: any) => ({ ...prev, femmeImage: val }))}
                    label="Bannière Raccourci Femme"
                    aspectRatioClassName="aspect-video"
                  />
                </div>

                {/* Male Quick Shortcut */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-none">
                  <ImageDropZone
                    value={formData.hommeImage || ''}
                    onChange={(val) => setFormData((prev: any) => ({ ...prev, hommeImage: val }))}
                    label="Bannière Raccourci Homme"
                    aspectRatioClassName="aspect-video"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Login Backdrop screen */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-none">
                  <ImageDropZone
                    value={formData.connexionImage || ''}
                    onChange={(val) => setFormData((prev: any) => ({ ...prev, connexionImage: val }))}
                    label="Fond d'écran Connexion Membres"
                    aspectRatioClassName="aspect-video"
                  />
                </div>

                {/* Primary General Catalog Header */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-none">
                  <ImageDropZone
                    value={formData.collectionHeaderImage || ''}
                    onChange={(val) => setFormData((prev: any) => ({ ...prev, collectionHeaderImage: val }))}
                    label="En-Tête de la collection Générale"
                    aspectRatioClassName="aspect-video"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SUPABASE DEPLOYMENT GUIDE */}
          <div className="bg-white p-6 rounded-none border border-emerald-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h2 className="font-black text-gray-900">Extension Supabase (Avenir)</h2>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] tracking-widest uppercase font-black rounded border border-emerald-200">Stable & Préparé</span>
            </div>

            <p className="text-xs font-semibold text-gray-500 leading-relaxed">
              Nous avons configuré une structure de base de données Supabase robuste et complète, prête à l’emploi. La migration gère les produits, les commandes, les rôles des utilisateurs, et les codes promotionnels.
            </p>

            <div className="p-4 bg-emerald-50/50 border border-emerald-100 text-emerald-950 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <CloudLightning className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] uppercase font-bold tracking-wider">État actuel de la configuration</span>
              </div>
              <p className="text-[11px] uppercase tracking-widest leading-relaxed font-semibold">
                Le script de migration SQL stable a été généré avec succès à la racine de votre projet sous <code className="bg-white px-1 py-0.5 border border-emerald-200 text-emerald-800 rounded">/supabase_schema.sql</code>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
