import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClientCard } from '../components/clients/ClientCard';
import { ClientModal } from '../components/clients/ClientModal';
import { Plus, Search, Users } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('Clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching clients:', error);
        } else {
            setClients(data || []);
        }
        setLoading(false);
    };

    const handleCreateClient = async (e) => {
        e.preventDefault();
        const form = e.target;
        const newClient = {
            name: form.name.value,
            email: form.email.value || null,
            phone: form.phone.value || null,
            website: form.website.value || null,
            service_type: form.service_type.value || null,
            amount_charged: form.amount_charged.value || 0,
            notes: '',
        };

        try {
            const { data, error } = await supabase
                .from('Clients')
                .insert([newClient])
                .select();

            if (error) throw error;

            setClients([data[0], ...clients]);
            setIsCreating(false);
        } catch (error) {
            alert('Error al crear cliente: ' + error.message);
        }
    };

    const handleUpdateClient = (updatedClient) => {
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
        setSelectedClient(updatedClient); // Keep modal open with fresh data if needed, or close it. 
        // Logic in modal closes it, so we just update list.
        // Actually, setSelectedClient updates the modal prop if open.
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in relative z-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Cartera de Clientes</h2>
                    <p className="text-gray-400">Administra a tus clientes activos y sus archivos</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(212,0,255,0.3)] transition-all"
                >
                    <Plus size={20} />
                    Nuevo Cliente
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary/50 outline-none transition-colors"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Cargando clientes...</div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                    <Users size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">No se encontraron clientes</p>
                    {search && <button onClick={() => setSearch('')} className="text-primary hover:underline mt-2">Limpiar búsqueda</button>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClients.map(client => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onClick={() => setSelectedClient(client)}
                        />
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedClient && (
                <ClientModal
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                    onUpdate={handleUpdateClient}
                />
            )}

            {/* Create Modal (Simple version inline) */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsCreating(false)}>
                    <GlassCard className="w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4">Agregar Nuevo Cliente</h3>
                        <form onSubmit={handleCreateClient} className="space-y-4">
                            <input name="name" placeholder="Nombre (Empresa o Persona)" required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary/50" />
                            <input name="email" type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary/50" />
                            <input name="phone" placeholder="Teléfono" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary/50" />
                            <input name="website" placeholder="Sitio Web" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary/50" />
                            <div className="flex gap-4">
                                <input name="service_type" placeholder="Servicio" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary/50" />
                                <input name="amount_charged" type="number" placeholder="Cobro ($)" className="w-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary/50" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                                <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium shadow-[0_0_15px_rgba(212,0,255,0.3)]">Crear Cliente</button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
