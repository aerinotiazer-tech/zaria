import React, { useState } from 'react';
import { useAdmin } from './AdminContext';
import { useFirestore } from '../hooks/useFirestore';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import ImageDropZone from '../components/ImageDropZone';

export default function Products() {
  const { role } = useAdmin();
  const { data: products, loading } = useFirestore('products', 'name');
  const { data: categories } = useFirestore('categories', 'order');
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    image: '',
    categoryId: '',
    type: 'clothing',
    badge: '',
    popular: false,
    sizes: '',
    colors: '',
    pointures: '',
    flacons: '',
    isAvailable: true
  });

  if (loading) return <div className="font-bold text-gray-500">Chargement...</div>;

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
      categoryId: categories[0]?.id || '', type: 'clothing',
      badge: '', popular: false, sizes: '', colors: '', pointures: '', flacons: '',
      isAvailable: true 
    });
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
      type: prod.type || 'clothing',
      badge: prod.badge || '',
      popular: prod.popular || false,
      sizes: prod.sizes ? prod.sizes.join(', ') : '',
      colors: prod.colors ? prod.colors.join(', ') : '',
      pointures: prod.pointures ? prod.pointures.join(', ') : '',
      flacons: prod.flacons ? prod.flacons.join(', ') : '',
      isAvailable: prod.isAvailable ?? true
    });
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
        type: formData.type,
        popular: formData.popular,
        isAvailable: formData.isAvailable
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
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Produits</h1>
          <p className="text-gray-500 font-medium">Gestion exhaustive du catalogue.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-none font-medium focus:outline-none focus:border-black"
            />
          </div>
          {['super_admin', 'admin', 'editor'].includes(role || '') && (
            <button onClick={openAddModal} className="bg-black text-white px-4 py-2 rounded-none font-bold flex items-center gap-2 hover:bg-gray-700">
              <Plus className="w-5 h-5" /> Ajouter
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
              <tr className="border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Produit</th>
                <th className="p-4">Type</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-medium">
              {filtered.map((prod: any) => (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {prod.image ? (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 bg-cover bg-center shrink-0" style={{backgroundImage: `url(${prod.image})`}} />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">?</div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 group flex items-center gap-2">
                          {prod.name}
                          {prod.popular && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[9px] uppercase tracking-wider rounded font-bold">Populaire</span>}
                          {prod.badge && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] uppercase tracking-wider rounded font-bold">{prod.badge}</span>}
                        </div>
                        <div className="text-gray-500 text-xs">{categories.find((c:any) => c.id === prod.categoryId)?.name || prod.categoryId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs uppercase tracking-widest text-gray-500">{prod.type}</span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {prod.price?.toLocaleString()} Ar
                    {prod.oldPrice && <span className="block text-xs line-through text-gray-400">{prod.oldPrice?.toLocaleString()} Ar</span>}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleAvailability(prod.id, prod.isAvailable ?? true)}
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${prod.isAvailable !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {prod.isAvailable !== false ? 'Disponible' : 'Rupture'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    {['super_admin', 'editor', 'admin'].includes(role || '') && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(prod)} className="p-2 text-gray-400 hover:text-blue-600 bg-white rounded-lg border border-gray-200"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(prod.id)} className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg border border-gray-200"><Trash2 className="w-4 h-4"/></button>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-black text-xl">{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-sm border border-gray-200">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              {/* Informations Générales */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">Général</h4>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nom du produit</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-none px-4 py-3 font-medium focus:border-black focus:ring-1 focus:ring-[#DA291C] outline-none transition-all"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Prix (Ar)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-200 rounded-none px-4 py-3 font-medium focus:border-black focus:ring-1 focus:ring-[#DA291C] outline-none transition-all"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Ancien Prix (Baré - Optionnel)</label>
                    <input type="number" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="w-full border border-gray-200 rounded-none px-4 py-3 font-medium focus:border-black focus:ring-1 focus:ring-[#DA291C] outline-none transition-all"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
                    <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border border-gray-200 rounded-none px-4 py-3 font-medium focus:border-black focus:ring-1 focus:ring-[#DA291C] outline-none transition-all">
                      <option value="">Sélectionner</option>
                      {categories.map((c:any) => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Type de Produit</label>
                    <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-gray-200 rounded-none px-4 py-3 font-medium focus:border-black focus:ring-1 focus:ring-[#DA291C] outline-none transition-all">
                      <option value="clothing">Vêtements (Tailles)</option>
                      <option value="shoes">Chaussures (Pointures)</option>
                      <option value="perfume">Parfums (Flacons)</option>
                      <option value="accessory">Accessoires</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-none px-4 py-3 font-medium focus:border-black focus:ring-1 focus:ring-[#DA291C] outline-none transition-all resize-none"></textarea>
                </div>

                <div>
                  <ImageDropZone
                    value={formData.image}
                    onChange={val => setFormData({ ...formData, image: val })}
                    label="Image principale du produit"
                    aspectRatioClassName="aspect-[3/4]"
                  />
                </div>
              </div>

              {/* Variables et Options */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">Variables (séparées par des virgules)</h4>
                
                {formData.type === 'clothing' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tailles de vêtement (ex: S, M, L, XL)</label>
                    <input type="text" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full border border-gray-200 rounded-none px-4 py-3 font-medium focus:border-black focus:ring-1 focus:ring-[#DA291C] outline-none transition-all placeholder-gray-300" placeholder="XS, S, M, L, XL"/>
                  </div>
                )}

                {formData.type === 'shoes' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Pointures (ex: 38, 39, 40, 41)</label>
                    <input type="text" value={formData.pointures} onChange={e => setFormData({...formData, pointures: e.target.value})} className="w-full border border-gray-200 rounded-none px-4 py-3 font-medium focus:border-black focus:ring-1 focus:ring-[#DA291C] outline-none transition-all placeholder-gray-300" placeholder="38, 39, 40"/>
                  </div>
                )}

                {formData.type === 'perfume' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tailles de flacon (ex: 50ml, 100ml)</label>
                    <input type="text" value={formData.flacons} onChange={e => setFormData({...formData, flacons: e.target.value})} className="w-full border border-gray-200 rounded-none px-4 py-3 font-medium focus:border-black focus:ring-1 focus:ring-[#DA291C] outline-none transition-all placeholder-gray-300" placeholder="50ml, 100ml"/>
                  </div>
                )}

                {['clothing', 'shoes', 'accessory'].includes(formData.type) && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Couleurs (ex: Rouge, Noir, Bleu)</label>
                    <input type="text" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} className="w-full border border-gray-200 rounded-none px-4 py-3 font-medium focus:border-black focus:ring-1 focus:ring-[#DA291C] outline-none transition-all placeholder-gray-300" placeholder="Rouge, Noir, Bleu"/>
                  </div>
                )}
              </div>

              {/* Mise en Valeur */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">Mise en Valeur & Promotion</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Badge personnalisé (ex: Nouveau, Promotion)</label>
                    <input type="text" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="w-full border border-gray-200 rounded-none px-4 py-3 font-medium focus:border-black focus:ring-1 focus:ring-[#DA291C] outline-none transition-all placeholder-gray-300" placeholder="Nouveau"/>
                  </div>
                  <div className="flex flex-col justify-center gap-3">
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-none">
                      <input type="checkbox" checked={formData.popular} onChange={e => setFormData({...formData, popular: e.target.checked})} className="w-5 h-5 accent-black"/>
                      <span className="font-bold text-gray-700 text-sm">Produit Populaire (Best-sellers)</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-100 bg-gray-50 rounded-none">
                  <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} className="w-5 h-5 accent-black"/>
                  <span className="font-bold text-gray-700">Produit en stock / disponible à la vente</span>
                </label>
              </div>
              
              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors">Enregistrer le Produit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

