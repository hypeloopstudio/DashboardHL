import React, { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Clock, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const UpdateLog = () => {
    const [logs, setLogs] = useState([]);
    const [newLog, setNewLog] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('UpdateLogs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLog = async (e) => {
        e.preventDefault();
        if (!newLog.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userEmail = user?.email || 'Anónimo';

            const { data, error } = await supabase
                .from('UpdateLogs')
                .insert([{
                    content: newLog,
                    user_email: userEmail
                }])
                .select();

            if (error) throw error;

            setLogs([data[0], ...logs]);
            setNewLog('');
        } catch (error) {
            console.error('Error adding log:', error);
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatUser = (email) => {
        if (!email) return 'Usuario';
        return email.split('@')[0]; // Simple display name from email
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
                Update Log
            </h2>

            <form onSubmit={handleAddLog} className="mb-4 relative">
                <input
                    type="text"
                    value={newLog}
                    onChange={(e) => setNewLog(e.target.value)}
                    placeholder="¿Qué hiciste hoy?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-white transition-colors"
                    disabled={!newLog.trim()}
                >
                    <Send size={18} />
                </button>
            </form>

            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar flex-1">
                {loading && <div className="text-white/50 text-sm">Cargando logs...</div>}

                {logs.map((log) => (
                    <div key={log.id} className="relative pl-6 border-l-2 border-white/10 pb-4 last:pb-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background-dark border-2 border-primary" />
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-semibold text-primary">{formatUser(log.user_email)}</span>
                                <span>•</span>
                                <span>{formatTime(log.created_at)}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{log.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
