import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { GlassCard } from '../components/ui/GlassCard'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Search, Trash2, Edit2, Filter, ArrowUpDown } from 'lucide-react'

export default function Leads() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null })

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setLeads(data || [])
        } catch (error) {
            console.error('Error fetching leads:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ estado: newStatus })
                .eq('id', id)

            if (error) throw error

            setLeads(leads.map(lead =>
                lead.id === id ? { ...lead, estado: newStatus } : lead
            ))
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Error actualizando estado')
        }
    }

    const handleDeleteClick = (id) => {
        setDeleteDialog({ isOpen: true, id })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.id) return

        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', deleteDialog.id)

            if (error) throw error
            setLeads(leads.filter(lead => lead.id !== deleteDialog.id))
            setDeleteDialog({ isOpen: false, id: null })
        } catch (error) {
            console.error('Error deleting lead:', error)
            alert('Error eliminando lead')
            setDeleteDialog({ isOpen: false, id: null })
        }
    }

    const handleDeleteCancel = () => {
        setDeleteDialog({ isOpen: false, id: null })
    }

    const handleSort = (key) => {
        let direction = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const sortedLeads = [...leads].filter(lead => {
        if (filterStatus !== 'all' && lead.estado !== filterStatus) return false
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            return (
                lead.nombre_empresa?.toLowerCase().includes(searchLower) ||
                lead.whatsapp?.includes(searchLower) ||
                lead.servicio_interes?.toLowerCase().includes(searchLower)
            )
        }
        return true
    }).sort((a, b) => {
        const valA = a[sortConfig.key] || ''
        const valB = b[sortConfig.key] || ''

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
    })

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Gestión de Leads</h2>
                    <p className="text-gray-400 text-sm sm:text-base">Administra y contacta a tus potenciales clientes</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="glass-input pl-10 w-full sm:w-64 text-sm sm:text-base py-2.5 sm:py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="glass-input text-sm sm:text-base py-2.5 sm:py-2 min-h-[44px] touch-manipulation"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        <option value="nuevo">Nuevos</option>
                        <option value="contactado">Contactados</option>
                        <option value="cerrado">Cerrados</option>
                    </select>
                </div>
            </div>

            {/* Desktop Table View */}
            <GlassCard className="overflow-x-auto p-0 hidden md:block">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                            <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('created_at')}>
                                <div className="flex items-center gap-2">Fecha <ArrowUpDown size={14} /></div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('nombre_empresa')}>
                                <div className="flex items-center gap-2">Empresa <ArrowUpDown size={14} /></div>
                            </th>
                            <th className="p-4">Contacto</th>
                            <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('servicio_interes')}>
                                <div className="flex items-center gap-2">Interés <ArrowUpDown size={14} /></div>
                            </th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedLeads.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    {loading ? 'Cargando leads...' : 'No se encontraron leads'}
                                </td>
                            </tr>
                        ) : (
                            sortedLeads.map((lead) => (
                                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="p-4 text-gray-300 text-sm">
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 font-medium text-white">
                                        {lead.nombre_empresa || 'Sin nombre'}
                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{lead.mensaje}</div>
                                    </td>
                                    <td className="p-4 text-gray-300 text-sm">
                                        <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-success transition-colors flex items-center gap-1">
                                            {lead.whatsapp}
                                        </a>
                                    </td>
                                    <td className="p-4 text-gray-300 text-sm">
                                        <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                                            {lead.servicio_interes}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={lead.estado}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                            className={`text-xs px-2 py-1 rounded border-none outline-none cursor-pointer font-medium touch-manipulation min-h-[36px] ${lead.estado === 'nuevo' ? 'bg-blue-500/20 text-blue-400' :
                                                    lead.estado === 'contactado' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-green-500/20 text-green-400'
                                                }`}
                                        >
                                            <option value="nuevo" className="bg-surface-dark text-gray-300">NUEVO</option>
                                            <option value="contactado" className="bg-surface-dark text-gray-300">CONTACTADO</option>
                                            <option value="cerrado" className="bg-surface-dark text-gray-300">CERRADO</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDeleteClick(lead.id)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 active:bg-red-500/20 active:text-red-500 rounded-lg transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </GlassCard>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <GlassCard className="p-8 text-center text-gray-500">
                        Cargando leads...
                    </GlassCard>
                ) : sortedLeads.length === 0 ? (
                    <GlassCard className="p-8 text-center text-gray-500">
                        No se encontraron leads
                    </GlassCard>
                ) : (
                    sortedLeads.map((lead) => (
                        <GlassCard key={lead.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-base truncate mb-1">
                                        {lead.nombre_empresa || 'Sin nombre'}
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-2">
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteClick(lead.id)}
                                    className="text-gray-400 hover:text-red-400 active:text-red-500 p-2 rounded-lg hover:bg-red-500/10 active:bg-red-500/20 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center flex-shrink-0"
                                    title="Eliminar"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {lead.mensaje && (
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {lead.mensaje}
                                </p>
                            )}

                            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Contacto:</span>
                                    <a 
                                        href={`https://wa.me/${lead.whatsapp}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-sm text-primary hover:text-primary/80 active:text-primary/60 transition-colors truncate ml-2"
                                    >
                                        {lead.whatsapp}
                                    </a>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Servicio:</span>
                                    <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs ml-2">
                                        {lead.servicio_interes}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-xs text-gray-500">Estado:</span>
                                    <select
                                        value={lead.estado}
                                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                        className={`text-xs px-3 py-2 rounded border-none outline-none cursor-pointer font-medium touch-manipulation min-h-[36px] flex-1 max-w-[150px] ml-2 ${lead.estado === 'nuevo' ? 'bg-blue-500/20 text-blue-400' :
                                                lead.estado === 'contactado' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-green-500/20 text-green-400'
                                            }`}
                                    >
                                        <option value="nuevo" className="bg-gray-900 text-gray-200">NUEVO</option>
                                        <option value="contactado" className="bg-gray-900 text-gray-200">CONTACTADO</option>
                                        <option value="cerrado" className="bg-gray-900 text-gray-200">CERRADO</option>
                                    </select>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Lead"
                message="¿Estás seguro de eliminar este lead? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    )
}
