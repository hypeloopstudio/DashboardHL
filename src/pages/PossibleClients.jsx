import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { GlassCard } from '../components/ui/GlassCard'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Plus, Instagram, RefreshCw } from 'lucide-react'
import { KanbanBoard } from '../components/kanban/KanbanBoard'

export default function PossibleClients() {
    const [url, setUrl] = useState('')
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null })

    useEffect(() => {
        fetchClients()

        const channel = supabase
            .channel('possible_clients_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'PosiblesClientes' }, () => {
                fetchClients()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchClients = async () => {
        try {
            const { data, error } = await supabase
                .from('PosiblesClientes')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setClients(data || [])
        } catch (error) {
            console.error('Error fetching clients:', error)
        } finally {
            setLoading(false)
        }
    }

    // Extraer username del link de Instagram
    const extractUsernameFromUrl = (url) => {
        if (!url) return null
        const match = url.match(/(?:instagram\.com|instagr\.am)\/([A-Za-z0-9_.]+)/)
        return match ? match[1] : null
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        if (!url) return

        setAdding(true)
        try {
            if (!url.includes('instagram.com') && !url.includes('instagr.am')) {
                alert('El link debe ser de Instagram')
                return
            }

            const username = extractUsernameFromUrl(url)

            if (!username) {
                alert('No se pudo extraer el nombre de usuario del link')
                return
            }

            const { data, error } = await supabase
                .from('PosiblesClientes')
                .insert([{
                    instagram_url: url,
                    username: username,
                    status: 'Sin contactar'
                }])
                .select()

            if (error) throw error

            if (data && data.length > 0) {
                setClients([data[0], ...clients])
            }

            setUrl('')
        } catch (error) {
            alert('Error al agregar: ' + error.message)
        } finally {
            setAdding(false)
        }
    }

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;
        const clientId = draggableId; // UUID is a string, do not parse

        // Optimistic update
        const originalClients = [...clients];
        const updatedClients = clients.map(client =>
            client.id === clientId
                ? { ...client, status: newStatus }
                : client
        );

        setClients(updatedClients);

        try {
            const { error } = await supabase
                .from('PosiblesClientes')
                .update({ status: newStatus })
                .eq('id', clientId)

            if (error) throw error
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar estado');
            setClients(originalClients); // Revert on error
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteDialog({ isOpen: true, id })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.id) return

        try {
            const { error } = await supabase
                .from('PosiblesClientes')
                .delete()
                .eq('id', deleteDialog.id)

            if (error) throw error

            setClients(clients.filter(client => client.id !== deleteDialog.id))
            setDeleteDialog({ isOpen: false, id: null })
        } catch (error) {
            console.error('Error deleting client:', error)
            alert('Error eliminando cliente')
            setDeleteDialog({ isOpen: false, id: null })
        }
    }

    const handleDeleteCancel = () => {
        setDeleteDialog({ isOpen: false, id: null })
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-0 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-0 flex-shrink-0">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Pipeline de Ventas</h2>
                    <p className="text-gray-400 text-sm sm:text-base">Gestiona tus leads con el tablero Kanban</p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                    {clients.length} Leads
                </div>
            </div>

            {/* Input Section */}
            <div className="flex-shrink-0">
                <GlassCard className="p-4 sm:p-6 mb-6">
                    <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                        <div className="relative flex-1 w-full">
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="url"
                                placeholder="Pegar link de Instagram"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 sm:py-3 pl-10 pr-4 text-white text-sm sm:text-base focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600 touch-manipulation"
                            />
                        </div>
                        <button
                            disabled={adding || !url}
                            className="w-full sm:w-auto bg-primary hover:bg-primary/90 active:bg-primary/80 text-white px-6 sm:px-8 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,0,255,0.3)] hover:shadow-[0_0_25px_rgba(212,0,255,0.5)] touch-manipulation min-h-[44px]"
                            type="submit"
                        >
                            {adding ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
                            {adding ? 'Guardando...' : 'Agregar'}
                        </button>
                    </form>
                </GlassCard>
            </div>

            {/* Kanban Board */}
            <div className="flex-grow min-h-0">
                {loading ? (
                    <p className="text-gray-500 text-center py-10">Cargando pipeline...</p>
                ) : (
                    <KanbanBoard
                        clients={clients}
                        onDragEnd={handleDragEnd}
                        onDelete={handleDeleteClick}
                    />
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Lead"
                message="¿Estás seguro de eliminar este lead del pipeline? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    )
}
