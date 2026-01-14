import React, { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Copy, Key, FileCode, Palette, Plus, X, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const SharedAssets = () => {
    const [activeTab, setActiveTab] = useState('prompts');
    const [assets, setAssets] = useState([]);
    const [copiedId, setCopiedId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newAsset, setNewAsset] = useState({ title: '', content: '', link: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAssets();
    }, [activeTab]);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('SharedAssets')
                .select('*')
                .eq('type', activeTab)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAssets(data || []);
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAsset = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('SharedAssets')
                .insert([{
                    type: activeTab,
                    title: newAsset.title,
                    content: newAsset.content,
                    link: newAsset.link
                }])
                .select();

            if (error) throw error;
            setAssets([data[0], ...assets]);
            setIsAdding(false);
            setNewAsset({ title: '', content: '', link: '' });
        } catch (error) {
            console.error('Error adding asset:', error);
        }
    };

    const handleDeleteAsset = async (id, e) => {
        e.preventDefault(); // Prevent copy or other actions
        e.stopPropagation();

        // Optimistic UI update
        const originalAssets = [...assets];
        setAssets(assets.filter(a => a.id !== id));

        try {
            const { error } = await supabase
                .from('SharedAssets')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting asset:', error);
            setAssets(originalAssets); // Revert on failure
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Shared Assets
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 hover:bg-white/10 rounded-lg text-primary transition-colors"
                >
                    {isAdding ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('prompts')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'prompts' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2"><FileCode size={16} /> Prompts</div>
                </button>
                <button
                    onClick={() => setActiveTab('passwords')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'passwords' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2"><Key size={16} /> Passwords</div>
                </button>
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'templates' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2"><Palette size={16} /> Templates</div>
                </button>
            </div>

            {isAdding && (
                <GlassCard className="mb-4 p-4 border-primary/20">
                    <form onSubmit={handleAddAsset} className="space-y-3">
                        <input
                            placeholder={activeTab === 'passwords' ? "Servicio" : "Título"}
                            value={newAsset.title}
                            onChange={e => setNewAsset({ ...newAsset, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary/50 outline-none"
                            required
                        />
                        {activeTab !== 'templates' && (
                            <textarea
                                placeholder={activeTab === 'passwords' ? "Usuario / Contraseña" : "Contenido del Prompt..."}
                                value={newAsset.content}
                                onChange={e => setNewAsset({ ...newAsset, content: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary/50 outline-none h-20 resize-none"
                                required
                            />
                        )}
                        {activeTab === 'templates' && (
                            <input
                                placeholder="Link (https://...)"
                                value={newAsset.link}
                                onChange={e => setNewAsset({ ...newAsset, link: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary/50 outline-none"
                                required
                            />
                        )}
                        <button type="submit" className="w-full bg-primary/20 hover:bg-primary/30 text-primary py-2 rounded-lg text-sm font-medium transition-colors">
                            Guardar
                        </button>
                    </form>
                </GlassCard>
            )}

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar flex-1">
                {loading && <div className="text-white/50 text-sm">Cargando...</div>}

                {!loading && activeTab === 'prompts' && assets.map(item => (
                    <GlassCard key={item.id} className="p-4 hover:bg-white/10 transition-colors group relative">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2">{item.content}</p>
                            </div>
                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={(e) => handleDeleteAsset(item.id, e)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleCopy(item.content, item.id)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                                >
                                    <Copy size={16} className={copiedId === item.id ? "text-green-500" : ""} />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {!loading && activeTab === 'passwords' && assets.map(item => (
                    <GlassCard key={item.id} className="p-4 hover:bg-white/10 transition-colors group relative">
                        <div className="flex justify-between items-center gap-4">
                            <div>
                                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-400 font-mono bg-black/30 px-2 py-1 rounded inline-block">
                                    {item.content}
                                </p>
                            </div>
                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={(e) => handleDeleteAsset(item.id, e)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleCopy(item.content, item.id)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                                >
                                    <Copy size={16} className={copiedId === item.id ? "text-green-500" : ""} />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {!loading && activeTab === 'templates' && assets.map(item => (
                    <GlassCard key={item.id} className="p-4 hover:bg-white/10 transition-colors group relative">
                        <div className="flex justify-between items-center gap-4">
                            <div>
                                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                    Abrir en navegador
                                </a>
                            </div>
                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={(e) => handleDeleteAsset(item.id, e)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};
