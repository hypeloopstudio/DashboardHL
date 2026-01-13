import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { GlassCard } from '../components/ui/GlassCard'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Plus, Instagram, ExternalLink, RefreshCw, User, Trash2 } from 'lucide-react'

const STATUS_OPTIONS = [
    { value: 'Sin contactar', color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
    { value: 'Contactado', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' },
    { value: 'Concretado', color: 'bg-green-500/20 text-green-400 border-green-500/20' },
    { value: 'Rechazado', color: 'bg-red-500/20 text-red-400 border-red-500/20' }
]

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
        
        // Regex para extraer el username de diferentes formatos de URLs de Instagram
        // Funciona con: instagram.com/usuario, instagram.com/usuario/, instagr.am/usuario
        const match = url.match(/(?:instagram\.com|instagr\.am)\/([A-Za-z0-9_.]+)/)
        return match ? match[1] : null
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        if (!url) return

        setAdding(true)
        try {
            // Basic validation
            if (!url.includes('instagram.com') && !url.includes('instagr.am')) {
                alert('El link debe ser de Instagram')
                return
            }

            // Extraer username del link
            const username = extractUsernameFromUrl(url)
            
            if (!username) {
                alert('No se pudo extraer el nombre de usuario del link')
                return
            }

            // Insertar en Supabase con el username extraído
            const { data, error } = await supabase
                .from('PosiblesClientes')
                .insert([{ 
                    instagram_url: url, 
                    username: username,
                    status: 'Sin contactar' 
                }])
                .select()

            if (error) throw error

            // Actualizar el estado local inmediatamente
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

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('PosiblesClientes')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error

            // Actualizar el estado local inmediatamente
            setClients(clients.map(client =>
                client.id === id ? { ...client, status: newStatus } : client
            ))
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Error al actualizar estado')
        }
    }

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

            // Actualizar el estado local inmediatamente
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

    const getStatusColor = (status) => {
        const option = STATUS_OPTIONS.find(o => o.value === status)
        return option ? option.color : 'bg-gray-500/20 text-gray-400'
    }

    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in px-2 sm:px-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-0">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Posibles Clientes</h2>
                    <p className="text-gray-400 text-sm sm:text-base">Captura y seguimiento de perfiles de Instagram</p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                    {clients.length} Total
                </div>
            </div>

            {/* Input Section */}
            <GlassCard className="p-4 sm:p-6">
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

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {loading && <p className="text-gray-500 col-span-full text-center py-8 sm:py-10 text-sm sm:text-base">Cargando...</p>}

                {!loading && clients.length === 0 && (
                    <div className="col-span-full py-8 sm:py-10 text-center text-gray-500 flex flex-col items-center">
                        <Instagram size={40} className="sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-20" />
                        <p className="text-sm sm:text-base">No hay clientes agregados aún.</p>
                    </div>
                )}

                {clients.map((client) => (
                    <GlassCard key={client.id} className="group relative overflow-hidden transition-all hover:bg-white/5 border border-white/5 hover:border-white/10">
                        {/* Status Ribbon/Badge */}
                        <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                            <select
                                value={client.status || 'Sin contactar'}
                                onChange={(e) => updateStatus(client.id, e.target.value)}
                                className={`text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1.5 sm:py-1 rounded-full border cursor-pointer bg-transparent outline-none appearance-none ${getStatusColor(client.status)} touch-manipulation min-h-[36px] flex-1`}
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-gray-900 text-gray-200">
                                        {opt.value}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-1.5 sm:gap-2">
                                <a
                                    href={client.instagram_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white active:text-white p-2 sm:p-1 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                                    title="Abrir en Instagram"
                                >
                                    <ExternalLink size={18} className="sm:w-4 sm:h-4" />
                                </a>
                                <button
                                    onClick={() => handleDeleteClick(client.id)}
                                    className="text-gray-400 hover:text-red-400 active:text-red-500 p-2 sm:p-1 rounded-lg hover:bg-red-500/10 active:bg-red-500/20 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                                    title="Eliminar"
                                >
                                    <Trash2 size={18} className="sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Profile Info (Partially scraped or placeholders) */}
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="relative flex-shrink-0">
                                {client.profile_pic_url ? (
                                    <img
                                        src={client.profile_pic_url}
                                        alt="Profile"
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white/10"
                                    />
                                ) : (
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center border-2 border-white/5">
                                        <User size={20} className="sm:w-6 sm:h-6 text-gray-500" />
                                    </div>
                                )}
                                {/* Indicator for "scraped" could go here */}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold truncate text-base sm:text-lg">
                                    {client.username || extractUsernameFromUrl(client.instagram_url) || 'Usuario Desconocido'}
                                </h3>
                                <p className="text-gray-500 text-xs truncate font-mono opacity-70">
                                    @{client.username || extractUsernameFromUrl(client.instagram_url) || 'usuario'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-3 sm:pt-4 border-t border-white/5 text-xs text-gray-500 flex justify-between items-center">
                            <span className="text-xs">Agregado: {new Date(client.created_at).toLocaleDateString()}</span>
                        </div>

                        {/* Hover glow effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 pointer-events-none"></div>
                    </GlassCard>
                ))}
            </div>

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Posible Cliente"
                message="¿Estás seguro de eliminar este posible cliente? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    )
}
