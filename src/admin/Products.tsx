import React, { useState } from 'react';
import { useAdmin } from './AdminContext';
import { useFirestore } from '../hooks/useFirestore';
import { Search, Plus, Edit2, Trash2, X, Download, Filter } from 'lucide-react';
import { doc, updateDoc, deleteDoc, addDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ImageDropZone from '../components/ImageDropZone';
import { PRODUCTS } from '../App';

export default function Products() {
  const { role } = useAdmin();
  const { data: products, loading } = useFirestore('products', 'name');
  const { data: categories } = useFirestore('categories', 'order');
  const { data: collections } = useFirestore('collections', 'order');
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    image: '',
    categoryId: '',
    collectionId: '',
    material: '',
    styleNotes: '',
    sizeGuide: '',
    type: 'clothing',
    badge: '',
    popular: false,
    sizes: '',
    colors: '',
    pointures: '',
    flacons: '',
    isAvailable: true
  });

  const [colorImages, setColorImages] = useState<Record<string, string>>({});

  const handleImportDemos = async () => {
    if (!window.confirm("Importer tous les produits, catégories, collections et boutiques de démonstration dans la base de données ?")) return;
    setIsImporting(true);
    try {
      // 1. Import Categories
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

      // 2. Import Collections
      const collectionsToImport = [
        { id: 'col1', name: 'Nouvelle Collection ÉTÉ 2026', description: 'Légèreté et élégance inspirées des brises méditerranéennes.', order: 1, isFeatured: true, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80' },
        { id: 'col2', name: 'Essentiels Minimalistes', description: 'Des pièces intemporelles de haute confection adaptées au quotidien.', order: 2, isFeatured: true, image: 'https://images.unsplash.com/photo-1434389678369-182fc23900ca?w=800&q=80' },
        { id: 'col3', name: 'Collection d\'Hiver', description: 'Laines nobles, blazers croisés et manteaux structurés.', order: 3, isFeatured: false, image: 'https://images.unsplash.com/photo-1548123304-9462700a30f3?w=800&q=80' }
      ];
      for (const col of collectionsToImport) {
        await setDoc(doc(db, 'collections', col.id), col);
      }

      // 3. Import Products
      for (const p of PRODUCTS) {
        await setDoc(doc(db, 'products', p.id), {
          ...p,
          isAvailable: true,
          colorImages: {}
        });
      }

      // 4. Import Points Of Sale
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

      // 5. Default Configuration
      const configDemo = {
        brandName: 'ZARIA',
        whatsappNumber: '+261340000000',
        deliveryFee: 2000,
        isBoutiqueOpen: true,
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

      alert("Toutes les données de démonstration globales ont été importées avec succès !");
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setIsImporting(false);
    }
  };


  if (loading) return <div className="text-gray-500 font-bold flex items-center gap-2"><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> Chargement...</div>;

  const filtered = products.filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase()));

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'products', id), { isAvailable: !current });
    } catch (e: any) {
      alert("Erreur: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer ce produit ?") && ['super_admin', 'editor', 'admin'].includes(role || '')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (e: any) {
        alert("Erreur: " + e.message);
      }
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ 
      name: '', description: '', price: '', oldPrice: '', image: '', 
      categoryId: categories[0]?.id || '', collectionId: '', material: '', styleNotes: '', sizeGuide: '', type: 'clothing',
      badge: '', popular: false, sizes: '', colors: '', pointures: '', flacons: '',
      isAvailable: true 
    });
    setColorImages({});
    setIsModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price?.toString() || '',
      oldPrice: prod.oldPrice?.toString() || '',
      image: prod.image || '',
      categoryId: prod.categoryId || '',
      collectionId: prod.collectionId || '',
      material: prod.material || '',
      styleNotes: prod.styleNotes || '',
      sizeGuide: prod.sizeGuide || '',
      type: prod.type || 'clothing',
      badge: prod.badge || '',
      popular: prod.popular || false,
      sizes: prod.sizes ? prod.sizes.join(', ') : '',
      colors: prod.colors ? prod.colors.join(', ') : '',
      pointures: prod.pointures ? prod.pointures.join(', ') : '',
      flacons: prod.flacons ? prod.flacons.join(', ') : '',
      isAvailable: prod.isAvailable ?? true
    });
    setColorImages(prod.colorImages || {});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image,
        categoryId: formData.categoryId,
        collectionId: formData.collectionId,
        material: formData.material,
        styleNotes: formData.styleNotes,
        sizeGuide: formData.sizeGuide,
        type: formData.type,
        popular: formData.popular,
        isAvailable: formData.isAvailable,
        colorImages: colorImages
      };

      if (formData.oldPrice) payload.oldPrice = Number(formData.oldPrice);
      if (formData.badge) payload.badge = formData.badge;

      if (formData.type === 'clothing') {
        payload.sizes = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
        payload.colors = formData.colors.split(',').map(s => s.trim()).filter(Boolean);
      } else if (formData.type === 'shoes') {
        payload.pointures = formData.pointures.split(',').map(s => s.trim()).filter(Boolean);
        payload.colors = formData.colors.split(',').map(s => s.trim()).filter(Boolean);
      } else if (formData.type === 'perfume') {
        payload.flacons = formData.flacons.split(',').map(s => s.trim()).filter(Boolean);
      } else if (formData.type === 'accessory') {
        payload.colors = formData.colors.split(',').map(s => s.trim()).filter(Boolean);
      }

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), payload);
      } else {
        await addDoc(collection(db, 'products'), payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-1 lg:mb-2 tracking-tight">Produits</h1>
          <p className="text-gray-500 font-medium text-sm">Gestion exhaustive de votre catalogue.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Rechercher Produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm transition-all text-sm"
            />
          </div>
          {['super_admin', 'admin', 'editor'].includes(role || '') && (
            <>
              {products.length === 0 && (
                <button onClick={handleImportDemos} disabled={isImporting} className="bg-white text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 border border-gray-200 shadow-sm transition-all text-sm">
                  <Download className="w-4 h-4" /> {isImporting ? '...' : 'Démos'}
                </button>
              )}
              <button onClick={openAddModal} className="bg-black text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 shadow-sm transition-all text-sm">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Ajouter</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100/50 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 z-10">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                <th className="p-4 sm:p-5">Produit</th>
                <th className="p-4 sm:p-5">Type / Catégorie</th>
                <th className="p-4 sm:p-5">Prix</th>
                <th className="p-4 sm:p-5 text-center">Statut</th>
                <th className="p-4 sm:p-5 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium">
              {filtered.map((prod: any) => (
                <tr key={prod.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-4 sm:p-5">
                    <div className="flex items-center gap-4">
                      {prod.image ? (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 bg-cover bg-center shrink-0 shadow-sm border border-black/5" style={{backgroundImage: `url(${prod.image})`}} />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-black/5 text-gray-400 text-xs font-bold tracking-widest">?</div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2 text-base leading-tight mb-1">
                          <span className="line-clamp-1">{prod.name}</span>
                          {prod.popular && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[9px] uppercase tracking-wider rounded font-bold shrink-0">Bestseller</span>}
                          {prod.badge && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] uppercase tracking-wider rounded font-bold shrink-0">{prod.badge}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-widest w-fit border border-gray-200">{prod.type}</span>
                      <span className="text-gray-500 text-xs font-semibold mt-1 truncate max-w-[120px]">{categories.find((c:any) => c.id === prod.categoryId)?.name || prod.categoryId}</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5">
                    <div className="font-black text-gray-900 text-sm whitespace-nowrap">
                      {prod.price?.toLocaleString()} Ar
                    </div>
                    {prod.oldPrice && <span className="block text-xs font-bold line-through text-gray-400 mt-0.5 whitespace-nowrap">{prod.oldPrice?.toLocaleString()} Ar</span>}
                  </td>
                  <td className="p-4 sm:p-5 text-center">
                    <button 
                      onClick={() => toggleAvailability(prod.id, prod.isAvailable ?? true)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${prod.isAvailable !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                      title="Changer disponibilité"
                    >
                      {prod.isAvailable !== false ? 'En Stock' : 'Rupture'}
                    </button>
                  </td>
                  <td className="p-4 sm:p-5">
                    {['super_admin', 'editor', 'admin'].includes(role || '') && (
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(prod)} className="p-2 text-gray-400 hover:text-black bg-white hover:bg-gray-100 rounded-lg transition-colors" title="Modifier"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(prod.id)} className="p-2 text-red-400 hover:text-red-700 bg-white hover:bg-red-50 rounded-lg transition-colors" title="Supprimer"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="font-extrabold text-xl tracking-tight text-gray-900">{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8 bg-gray-50/50 flex-1">
              {/* Informations Générales */}
              <div className="space-y-5 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">Informations Générales</h4>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nom du produit *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400" placeholder="Ex: T-shirt Essentiel"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Prix (Ar) *</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-black text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" placeholder="0"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Ancien Prix</label>
                    <input type="number" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-500 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" placeholder="Prix barré (optionnel)"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Catégorie *</label>
                    <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white">
                      <option value="">Sélectionner</option>
                      {categories.map((c:any) => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Collection (Optionnel)</label>
                    <select value={formData.collectionId} onChange={e => setFormData({...formData, collectionId: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white">
                      <option value="">Aucune (Générale)</option>
                      {collections.map((col: any) => (
                        <option key={col.id} value={col.id}>{col.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Type *</label>
                    <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white">
                      <option value="clothing">Vêtements (Tailles)</option>
                      <option value="shoes">Chaussures (Pointures)</option>
                      <option value="perfume">Parfums (Flacons)</option>
                      <option value="accessory">Accessoires</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Description complète</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none placeholder-gray-400" placeholder="Décrivez le produit..."></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Matières & Composition</label>
                    <input type="text" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400" placeholder="Ex: 100% Coton enduit"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Conseil de Style</label>
                    <input type="text" value={formData.styleNotes} onChange={e => setFormData({...formData, styleNotes: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400" placeholder="Ex: Portez le croisé avec un bermuda"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Guide des Tailles conseillé</label>
                    <input type="text" value={formData.sizeGuide} onChange={e => setFormData({...formData, sizeGuide: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400" placeholder="Ex: Coupe droite, prenez votre taille"/>
                  </div>
                </div>

                <div>
                  <ImageDropZone
                    value={formData.image}
                    onChange={val => setFormData({ ...formData, image: val })}
                    label="Photo principale"
                    aspectRatioClassName="aspect-[3/4]"
                  />
                </div>
              </div>

              {/* Variables et Options */}
              <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">Variantes (séparées par une virgule)</h4>
                
                {formData.type === 'clothing' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Tailles disponibles</label>
                    <input type="text" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-300" placeholder="XS, S, M, L, XL"/>
                  </div>
                )}

                {formData.type === 'shoes' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Pointures</label>
                    <input type="text" value={formData.pointures} onChange={e => setFormData({...formData, pointures: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-300" placeholder="38, 39, 40"/>
                  </div>
                )}

                {formData.type === 'perfume' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Tailles de flacon</label>
                    <input type="text" value={formData.flacons} onChange={e => setFormData({...formData, flacons: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-300" placeholder="50ml, 100ml"/>
                  </div>
                )}

                {['clothing', 'shoes', 'accessory'].includes(formData.type) && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Couleurs</label>
                    <input type="text" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-300" placeholder="Beige, Noir, Kaki"/>
                  </div>
                )}

                {['clothing', 'shoes', 'accessory'].includes(formData.type) && formData.colors && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3.5">
                    <span className="block text-xs font-black text-gray-500 uppercase tracking-widest">Photos par couleur (Liaison variable-image)</span>
                    <p className="text-[11px] text-gray-400 font-semibold">Fournissez une URL d'image pour chaque couleur pour changer automatiquement de photo principale sur la fiche produit :</p>
                    {formData.colors.split(',').map(s => s.trim()).filter(Boolean).map(color => (
                      <div key={color} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                        <span className="text-xs font-black text-gray-700 w-24 truncate text-right shrink-0">{color} :</span>
                        <input 
                          type="text" 
                          placeholder="Ex: https://images.unsplash.com/... (URL d'image)" 
                          value={colorImages[color] || ''} 
                          onChange={e => setColorImages({...colorImages, [color]: e.target.value})}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/50"
                        />
                        {colorImages[color] ? (
                          <div className="w-8 h-10 rounded-md bg-cover bg-center shrink-0 border border-gray-200" style={{backgroundImage: `url(${colorImages[color]})`}} />
                        ) : (
                          <div className="w-8 h-10 rounded-md bg-gray-50 flex items-center justify-center shrink-0 border border-dashed border-gray-200 text-[9px] text-gray-400">Vide</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mise en Valeur */}
              <div className="space-y-5 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">Visibilité & Marketing</h4>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Badge personnalisé</label>
                  <input type="text" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-300" placeholder="Ex: Nouveau, Promo..."/>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex-1 flex items-center gap-3 cursor-pointer p-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-colors">
                    <input type="checkbox" checked={formData.popular} onChange={e => setFormData({...formData, popular: e.target.checked})} className="w-4 h-4 accent-black text-black rounded focus:ring-black"/>
                    <span className="font-bold text-gray-700 text-sm">Best-seller Populaire</span>
                  </label>

                  <label className="flex-1 flex items-center gap-3 cursor-pointer p-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-colors">
                    <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} className="w-4 h-4 accent-black text-black rounded focus:ring-black"/>
                    <span className="font-bold text-gray-700 text-sm">Produit en stock</span>
                  </label>
                </div>
              </div>
              
              {/* Fake spacer so bottom bar doesn't overlap long forms */}
              <div className="h-6"></div>
              
              <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-0 p-4 sm:p-6 bg-white/90 backdrop-blur border-t border-gray-100 flex gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[11px] rounded-xl hover:bg-gray-200 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-black text-white font-bold uppercase tracking-wider text-[11px] rounded-xl hover:bg-gray-900 transition-colors shadow-md">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

