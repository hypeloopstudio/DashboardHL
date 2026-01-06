import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { GlassCard } from '../components/ui/GlassCard'
import { Users, Calendar, TrendingUp } from 'lucide-react'

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        topService: 'N/A'
    })
    const [recentLeads, setRecentLeads] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            // Total Leads
            const { count: totalCount } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })

            // Leads Today
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const { count: todayCount } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString())

            // Top Service Calculation
            const { data: leads } = await supabase
                .from('leads')
                .select('servicio_interes')
                .limit(500)

            let topService = 'N/A'
            if (leads && leads.length > 0) {
                const counts = leads.reduce((acc, curr) => {
                    const service = curr.servicio_interes || 'Sin especificar'
                    acc[service] = (acc[service] || 0) + 1
                    return acc
                }, {})
                topService = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
            }

            // Recent Leads
            const { data: recent } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            setStats({
                total: totalCount || 0,
                today: todayCount || 0,
                topService
            })
            setRecentLeads(recent || [])
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Panel de Control</h2>
                <p className="text-gray-400">Resumen de actividad en tiempo real</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                <Users size={24} />
                            </div>
                            <span className="text-gray-400 text-sm font-medium uppercase">Total Leads</span>
                        </div>
                        <h3 className="text-4xl font-bold text-white">{stats.total}</h3>
                        <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                            <TrendingUp size={14} />
                            <span>Base de datos histórica</span>
                        </p>
                    </div>
                </GlassCard>

                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
                                <Calendar size={24} />
                            </div>
                            <span className="text-gray-400 text-sm font-medium uppercase">Leads Hoy</span>
                        </div>
                        <h3 className="text-4xl font-bold text-white">{stats.today}</h3>
                        <p className="text-gray-500 text-sm mt-2">Oportunidades nuevas</p>
                    </div>
                </GlassCard>

                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-gray-400 text-sm font-medium uppercase">Top Servicio</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white truncate">{stats.topService}</h3>
                        <p className="text-gray-500 text-sm mt-2">Más solicitado</p>
                    </div>
                </GlassCard>
            </div>

            {/* Recent Activity */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Actividad Reciente</h3>
                <div className="space-y-4">
                    {recentLeads.map((lead) => (
                        <GlassCard key={lead.id} className="flex items-center justify-between p-4 py-3 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                                    {lead.nombre_empresa ? lead.nombre_empresa.substring(0, 2).toUpperCase() : 'NA'}
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold">{lead.nombre_empresa || 'Sin Nombre'}</h4>
                                    <p className="text-sm text-gray-400">{lead.servicio_interes}</p>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.estado === 'nuevo' ? 'bg-blue-500/20 text-blue-400' :
                                        lead.estado === 'contactado' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-green-500/20 text-green-400'
                                    }`}>
                                    {lead.estado ? lead.estado.toUpperCase() : 'NUEVO'}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </GlassCard>
                    ))}
                    {loading && <p className="text-gray-500">Cargando...</p>}
                    {!loading && recentLeads.length === 0 && (
                        <p className="text-gray-500 text-sm">No hay actividad reciente.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
