import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { GlassCard } from '../components/ui/GlassCard'
import { Search, Trash2, Edit2, Filter, ArrowUpDown } from 'lucide-react'

export default function Leads() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

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

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este lead? Esta acción no se puede deshacer.')) return

        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id)

            if (error) throw error
            setLeads(leads.filter(lead => lead.id !== id))
        } catch (error) {
            console.error('Error deleting lead:', error)
            alert('Error eliminando lead')
        }
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Gestión de Leads</h2>
                    <p className="text-gray-400">Administra y contacta a tus potenciales clientes</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="glass-input pl-10 w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="glass-input"
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

            <GlassCard className="overflow-x-auto p-0">
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
                                            className={`text-xs px-2 py-1 rounded border-none outline-none cursor-pointer font-medium ${lead.estado === 'nuevo' ? 'bg-blue-500/20 text-blue-400' :
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
                                            onClick={() => handleDelete(lead.id)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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
        </div>
    )
}
