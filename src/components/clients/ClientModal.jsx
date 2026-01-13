import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Trash2, Download, ExternalLink, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const ClientModal = ({ client, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({ ...client });
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (client?.id) {
            fetchFiles();
        }
    }, [client]);

    const fetchFiles = async () => {
        const { data, error } = await supabase
            .from('ClientFiles')
            .select('*')
            .eq('client_id', client.id)
            .order('created_at', { ascending: false });

        if (!error) setFiles(data || []);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('Clients')
                .update({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    website: formData.website,
                    service_type: formData.service_type,
                    amount_charged: formData.amount_charged,
                    notes: formData.notes
                })
                .eq('id', client.id);

            if (error) throw error;
            onUpdate({ ...client, ...formData });
            onClose();
        } catch (error) {
            console.error('Error updating client:', error);
            alert('Error al guardar cambios');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${client.id}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('client-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('client-assets')
                .getPublicUrl(filePath);

            // Save reference to DB
            const { data: dbData, error: dbError } = await supabase
                .from('ClientFiles')
                .insert([{
                    client_id: client.id,
                    file_name: file.name,
                    file_url: publicUrl,
                    file_type: file.type,
                    file_size: file.size
                }])
                .select();

            if (dbError) throw dbError;

            setFiles([dbData[0], ...files]);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error al subir archivo. Asegúrate de que el bucket "client-assets" exista en Supabase.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (fileId, fileName) => {
        if (!confirm('¿Eliminar este archivo?')) return;

        try {
            // Delete from DB (The trigger/RLS logic might not delete from storage automatically, handle with care or manually)
            // Ideally we delete from storage first if we know the path. 
            // Since we stored publicUrl, we might need to reconstruct path or just delete DB reference for now.
            // Let's just delete DB reference for simplicity in this mvp.
            const { error } = await supabase
                .from('ClientFiles')
                .delete()
                .eq('id', fileId);

            if (error) throw error;
            setFiles(files.filter(f => f.id !== fileId));
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-[#0f0f13] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Detalles del Cliente</h2>
                        <p className="text-gray-400 text-sm">Gestiona la información y archivos</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left Column: Client Info Form */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Información General</h3>
                            <form id="edit-client-form" onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                                    <input
                                        type="text" name="name" value={formData.name} onChange={handleChange} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                                        <input
                                            type="email" name="email" value={formData.email || ''} onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                                        <input
                                            type="text" name="phone" value={formData.phone || ''} onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Sitio Web</label>
                                    <input
                                        type="url" name="website" value={formData.website || ''} onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Servicio</label>
                                        <input
                                            type="text" name="service_type" value={formData.service_type || ''} onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Cobrado ($)</label>
                                        <input
                                            type="number" name="amount_charged" value={formData.amount_charged || ''} onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Notas</label>
                                    <textarea
                                        name="notes" value={formData.notes || ''} onChange={handleChange} rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none resize-none"
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        {/* Right Column: Files */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <h3 className="text-lg font-semibold text-white">Archivos y Documentos</h3>
                                <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                    {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                                    <span>Subir</span>
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                </label>
                            </div>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {files.length === 0 && (
                                    <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-xl">
                                        <FileText size={40} className="mx-auto text-gray-600 mb-3" />
                                        <p className="text-gray-500 text-sm">No hay archivos subidos</p>
                                    </div>
                                )}

                                {files.map(file => (
                                    <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                                <FileText size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{file.file_name}</p>
                                                <p className="text-gray-500 text-xs">{new Date(file.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={file.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Descargar/Ver"
                                            >
                                                <Download size={16} />
                                            </a>
                                            <button
                                                onClick={() => handleDeleteFile(file.id, file.file_name)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="edit-client-form"
                        className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(212,0,255,0.3)] transition-all"
                        disabled={saving}
                    >
                        {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        Guardar Cambios
                    </button>
                </div>

            </div>
        </div>
    );
};
