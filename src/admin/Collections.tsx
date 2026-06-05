import React, { useState } from 'react';
import { useAdmin } from './AdminContext';
import { useFirestore } from '../hooks/useFirestore';
import { Search, Plus, Edit2, Trash2, X, List as ListIcon, Download, AlertCircle, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { doc, updateDoc, deleteDoc, addDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ImageDropZone from '../components/ImageDropZone';

// Lookbook style collections demo data for seeding
export const DEMO_COLLECTIONS = [
  { id: 'col1', name: 'Nouvelle Collection ÉTÉ 2026', description: 'Légèreté et élégance inspirées des brises méditerranéennes.', order: 1, isFeatured: true, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80' },
  { id: 'col2', name: 'Essentiels Minimalistes', description: 'Des pièces intemporelles de haute confection adaptées au quotidien.', order: 2, isFeatured: true, image: 'https://images.unsplash.com/photo-1434389678369-182fc23900ca?w=800&q=80' },
  { id: 'col3', name: 'Collection d\'Hiver', description: 'Laines nobles, blazers croisés et manteaux structurés.', order: 3, isFeatured: false, image: 'https://images.unsplash.com/photo-1548123304-9462700a30f3?w=800&q=80' }
];

export default function Collections() {
  const { role } = useAdmin();
  const { data: collectionsList, loading } = useFirestore('collections', 'order');
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 0,
    isFeatured: false
  });

  const handleImportDemos = async () => {
    if (!window.confirm("Importer les collections de démo (Été, Minimalistes, Hiver) dans la base de données ?")) return;
    setIsImporting(true);
    try {
      for (const c of DEMO_COLLECTIONS) {
        await setDoc(doc(db, 'collections', c.id), {
          name: c.name,
          description: c.description,
          order: c.order,
          isFeatured: c.isFeatured,
          image: c.image
        });
      }
      alert("Collections de démonstration importées avec succès !");
    } catch (e: any) {
      alert("Erreur lors de l'import: " + e.message);
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-500 font-bold flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        Chargement des collections...
      </div>
    );
  }

  const filtered = collectionsList.filter((c: any) => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer cette collection ? Attention, vérifiez les associations de produits.") && ['super_admin', 'editor', 'admin'].includes(role || '')) {
      try {
        await deleteDoc(doc(db, 'collections', id));
      } catch (e: any) {
        alert("Erreur: " + e.message);
      }
    }
  };

  const openAddModal = () => {
    setEditingCollection(null);
    setFormData({ name: '', description: '', image: '', order: collectionsList.length + 1, isFeatured: false });
    setIsModalOpen(true);
  };

  const openEditModal = (col: any) => {
    setEditingCollection(col);
    setFormData({
      name: col.name || '',
      description: col.description || '',
      image: col.image || '',
      order: col.order || 0,
      isFeatured: col.isFeatured || false
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

      if (editingCollection) {
        await updateDoc(doc(db, 'collections', editingCollection.id), payload);
      } else {
        await addDoc(collection(db, 'collections'), payload);
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
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2 tracking-tight">Collections</h1>
          <p className="text-gray-500 font-medium text-sm">Créez des univers thématiques et éditoriaux indépendants des catégories.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Rechercher une collection..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
          {['super_admin', 'admin', 'editor'].includes(role || '') && (
            <>
              {collectionsList.length === 0 && (
                <button onClick={handleImportDemos} disabled={isImporting} className="bg-white text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 border border-gray-200 shadow-sm transition-all text-sm">
                  <Download className="w-4 h-4" /> {isImporting ? 'En cours' : 'Démos'}
                </button>
              )}
              <button onClick={openAddModal} className="bg-black text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 shadow-sm transition-all text-sm">
                <Plus className="w-4 h-4" /> <span>Créer</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid of collections styled with Liquid Glass details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item: any) => (
          <div 
            key={item.id} 
            className="group relative bg-white border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-[400px]"
          >
            {/* Image section */}
            <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8 opacity-40 mb-2" />
                  <span className="text-[10px] tracking-widest font-black uppercase">Pas de visuel</span>
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-1.5">
                <span className="bg-black/80 backdrop-blur-md text-white px-2.5 py-1 text-[10px] font-mono rounded-lg border border-white/10">
                  Ordre: {item.order}
                </span>
                {item.isFeatured && (
                  <span className="bg-yellow-400 text-black px-2.5 py-1 text-[10px] uppercase font-black rounded-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-black" /> En Avant
                  </span>
                )}
              </div>
            </div>

            {/* Content section */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 mb-1.5 uppercase tracking-tight line-clamp-1">{item.name}</h3>
                <p className="text-xs font-medium text-gray-500 line-clamp-3 leading-relaxed">{item.description || "Aucune description fournie pour cette collection d'exception."}</p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4 bg-white">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">ID: {item.id ? `${item.id.substring(0, 8)}...` : 'n/a'}</span>
                {['super_admin', 'editor', 'admin'].includes(role || '') && (
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(item)} className="p-2 text-gray-400 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-700 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"><Trash2 className="w-4 h-4"/></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full bg-white border border-gray-200/50 p-16 rounded-2xl text-center flex flex-col items-center justify-center text-gray-500">
            <AlertCircle className="w-12 h-12 mb-4 text-gray-300" />
            <p className="font-extrabold text-lg text-gray-800">Aucune collection disponible.</p>
            <p className="text-xs font-semibold text-gray-400 mt-1">Créez votre première collection ou chargez les démos par défaut.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="font-extrabold text-xl tracking-tight text-gray-900">{editingCollection ? 'Modifier la Collection' : 'Nouvelle Collection'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-gray-50/50 overflow-y-auto flex-1">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nom de la collection *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400" placeholder="Ex: Capsule Lin d'Été"/>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Description Éditoriale</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400 resize-none" placeholder="Présentation poétique de l'univers de cette collection..."/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Ordre d'affichage *</label>
                    <input required type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" placeholder="1"/>
                  </div>
                  <div className="flex items-end">
                    <label className="w-full flex items-center gap-3 cursor-pointer p-3 border border-gray-200 bg-gray-50 hover:bg-gray-100/50 rounded-xl transition-all">
                      <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 accent-black text-black rounded focus:ring-black"/>
                      <span className="font-bold text-xs text-gray-700">Mettre en avant</span>
                    </label>
                  </div>
                </div>

                <div>
                  <ImageDropZone
                    value={formData.image}
                    onChange={val => setFormData({ ...formData, image: val })}
                    label="Image de couverture de la collection"
                    aspectRatioClassName="aspect-[16/9]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
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
