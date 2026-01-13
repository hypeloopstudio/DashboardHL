import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Mail, Phone, Globe, DollarSign, FileText } from 'lucide-react';

export const ClientCard = ({ client, onClick }) => {
    return (
        <GlassCard
            className="group relative overflow-hidden transition-all hover:bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer p-5"
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{client.name}</h3>
                    <p className="text-gray-400 text-sm font-mono">{client.service_type || 'Sin servicio especificado'}</p>
                </div>
                {client.amount_charged > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1">
                        <DollarSign size={12} />
                        {client.amount_charged}
                    </div>
                )}
            </div>

            <div className="space-y-2 text-sm text-gray-400">
                {client.email && (
                    <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-500" />
                        <span className="truncate">{client.email}</span>
                    </div>
                )}
                {client.phone && (
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-500" />
                        <span className="truncate">{client.phone}</span>
                    </div>
                )}
                {client.website && (
                    <div className="flex items-center gap-2">
                        <Globe size={14} className="text-gray-500" />
                        <span className="truncate">{client.website}</span>
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <FileText size={20} />
                </div>
            </div>

            {/* Hover glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all pointer-events-none" />
        </GlassCard>
    );
};
