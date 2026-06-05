import React, { useState } from 'react';
import { useAdmin } from './AdminContext';
import { useFirestore } from '../hooks/useFirestore';
import { Search, Plus, Edit2, Trash2, X, List as ListIcon, Download, AlertCircle } from 'lucide-react';
import { doc, updateDoc, deleteDoc, addDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CATEGORIES } from '../App';

export default function Categories() {
  const { role } = useAdmin();
  const { data: categories, loading } = useFirestore('categories', 'order');
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    order: 0
  });

  const handleImportDemos = async () => {
    if (!window.confirm("Importer les catégories par défaut dans la base de données ?")) return;
    setIsImporting(true);
    try {
      for (const c of CATEGORIES) {
        if (c.id === 'all') continue;
        await setDoc(doc(db, 'categories', c.id), { name: c.name, order: Number(c.id) });
      }
      alert("Catégories importées avec succès !");
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) return <div className="text-gray-500 font-bold flex items-center gap-2"><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> Chargement...</div>;

  const filtered = categories.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer cette catégorie ? Attention, vérifiez que plus aucun produit n'y est lié.") && ['super_admin', 'editor', 'admin'].includes(role || '')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (e: any) {
        alert("Erreur: " + e.message);
      }
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', order: categories.length + 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      order: cat.order || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        order: Number(formData.order)
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), payload);
      } else {
        await addDoc(collection(db, 'categories'), payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2 tracking-tight">Catégories</h1>
          <p className="text-gray-500 font-medium text-sm">Organisez vos produits pour faciliter la navigation.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Rechercher Catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
          {['super_admin', 'admin', 'editor'].includes(role || '') && (
            <>
              {categories.length === 0 && (
                <button onClick={handleImportDemos} disabled={isImporting} className="bg-white text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 border border-gray-200 shadow-sm transition-all text-sm">
                  <Download className="w-4 h-4" /> {isImporting ? '...' : 'Démos'}
                </button>
              )}
              <button onClick={openAddModal} className="bg-black text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 shadow-sm transition-all text-sm">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Ajouter</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
             <thead className="bg-white/90 backdrop-blur border-b border-gray-100 uppercase text-xs font-bold text-gray-400 tracking-widest sticky top-0 z-10">
               <tr>
                 <th className="p-4 sm:p-5 w-24 text-center">Ordre</th>
                 <th className="p-4 sm:p-5">Nom de la Catégorie</th>
                 <th className="p-4 sm:p-5 text-right w-32">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50 text-sm font-medium">
               {filtered.map((cat: any) => (
                 <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors group">
                   <td className="p-4 sm:p-5 text-center">
                     <span className="font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block text-xs border border-gray-200">{cat.order}</span>
                   </td>
                   <td className="p-4 sm:p-5">
                     <div className="font-bold text-gray-900 text-base flex items-center gap-2">
                       <ListIcon className="w-4 h-4 text-gray-300" />
                       {cat.name}
                     </div>
                   </td>
                   <td className="p-4 sm:p-5">
                     {['super_admin', 'editor', 'admin'].includes(role || '') && (
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(cat)} className="p-2 text-gray-400 hover:text-black bg-white hover:bg-gray-100 rounded-lg transition-colors" title="Modifier"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-400 hover:text-red-700 bg-white hover:bg-red-50 rounded-lg transition-colors" title="Supprimer"><Trash2 className="w-4 h-4"/></button>
                        </div>
                     )}
                   </td>
                 </tr>
               ))}
               
               {filtered.length === 0 && (
                 <tr>
                   <td colSpan={3}>
                     <div className="p-16 text-center flex flex-col items-center justify-center text-gray-500">
                       <AlertCircle className="w-12 h-12 mb-4 text-gray-300" />
                       <p className="font-bold text-lg">Aucune catégorie trouvée.</p>
                     </div>
                   </td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="font-extrabold text-xl tracking-tight text-gray-900">{editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-gray-50/50">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nom de la catégorie *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400" placeholder="Ex: Accessoires..."/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Ordre d'affichage *</label>
                  <input required type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" placeholder="1"/>
                  <span className="text-xs font-semibold text-gray-400 mt-1.5 block">Un nombre plus petit apparaîtra en premier (ex: 1, 2, 3...)</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
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
