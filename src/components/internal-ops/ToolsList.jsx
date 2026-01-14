import React, { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Wrench, ExternalLink, Plus, X, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const ToolsList = () => {
    const [tools, setTools] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newTool, setNewTool] = useState({ name: '', description: '', link: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('InternalTools')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTools(data || []);
        } catch (error) {
            console.error('Error fetching tools:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTool = async (e) => {
        e.preventDefault();
        if (!newTool.name || !newTool.link) return;

        try {
            const { data, error } = await supabase
                .from('InternalTools')
                .insert([{
                    name: newTool.name,
                    description: newTool.description,
                    link: newTool.link
                }])
                .select();

            if (error) throw error;
            setTools([data[0], ...tools]);
            setNewTool({ name: '', description: '', link: '' });
            setIsAdding(false);
        } catch (error) {
            console.error('Error adding tool:', error);
        }
    };

    const handleDeleteTool = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();

        const originalTools = [...tools];
        setTools(tools.filter(t => t.id !== id));

        try {
            const { error } = await supabase
                .from('InternalTools')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting tool:', error);
            setTools(originalTools);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Tools
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 hover:bg-white/10 rounded-lg text-primary transition-colors"
                >
                    {isAdding ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            {isAdding && (
                <GlassCard className="mb-4 p-4 border-primary/20">
                    <form onSubmit={handleAddTool} className="space-y-3">
                        <input
                            placeholder="Nombre de la herramienta"
                            value={newTool.name}
                            onChange={e => setNewTool({ ...newTool, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary/50 outline-none"
                        />
                        <input
                            placeholder="Descripción corta"
                            value={newTool.description}
                            onChange={e => setNewTool({ ...newTool, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary/50 outline-none"
                        />
                        <input
                            placeholder="Link (https://...)"
                            value={newTool.link}
                            onChange={e => setNewTool({ ...newTool, link: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary/50 outline-none"
                        />
                        <button type="submit" className="w-full bg-primary/20 hover:bg-primary/30 text-primary py-2 rounded-lg text-sm font-medium transition-colors">
                            Guardar
                        </button>
                    </form>
                </GlassCard>
            )}

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {loading && <div className="text-white/50 text-sm">Cargando tools...</div>}

                {tools.map(tool => (
                    <GlassCard key={tool.id} className="p-3 hover:bg-white/10 transition-colors group relative">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-6">
                                <h3 className="font-semibold text-white text-sm">{tool.name}</h3>
                                <p className="text-xs text-gray-500">{tool.description}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <a
                                    href={tool.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10"
                                >
                                    <ExternalLink size={14} />
                                </a>
                                <button
                                    onClick={(e) => handleDeleteTool(tool.id, e)}
                                    className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};
