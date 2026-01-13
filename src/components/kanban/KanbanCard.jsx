import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GlassCard } from '../ui/GlassCard';
import { ExternalLink, Trash2, User } from 'lucide-react';

export const KanbanCard = ({ client, index, onDelete, isDragDisabled }) => {

    // Stagnation logic: > 48 hours in "Sin contactar"
    const isStagnant = () => {
        if (client.status !== 'Sin contactar') return false;
        const created = new Date(client.created_at);
        const now = new Date();
        const diffHours = (now - created) / (1000 * 60 * 60);
        return diffHours > 48;
    };

    const stagnant = isStagnant();

    const extractUsernameFromUrl = (url) => {
        if (!url) return null;
        const match = url.match(/(?:instagram\.com|instagr\.am)\/([A-Za-z0-9_.]+)/);
        return match ? match[1] : null;
    };

    const displayName = client.username || extractUsernameFromUrl(client.instagram_url) || 'Usuario Desconocido';
    const displayHandle = client.username || extractUsernameFromUrl(client.instagram_url) || 'usuario';

    return (
        <Draggable draggableId={client.id.toString()} index={index} isDragDisabled={isDragDisabled}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className="mb-3"
                >
                    <GlassCard
                        className={`
                            group relative overflow-hidden transition-all 
                            ${snapshot.isDragging ? 'shadow-2xl scale-105 rotate-2 z-50' : 'hover:bg-white/5'}
                            ${stagnant ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/5'}
                        `}
                    >
                        {/* Stagnant Indicator */}
                        {stagnant && (
                            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 m-2 animate-pulse" title="Más de 48h sin contactar" />
                        )}

                        {/* Card Content */}
                        <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                {client.profile_pic_url ? (
                                    <img
                                        src={client.profile_pic_url}
                                        alt="Profile"
                                        className={`w-10 h-10 rounded-full object-cover border-2 ${stagnant ? 'border-red-500/30' : 'border-white/10'}`}
                                    />
                                ) : (
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center border-2 ${stagnant ? 'border-red-500/30' : 'border-white/5'}`}>
                                        <User size={16} className="text-gray-500" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <h4 className="text-white font-bold truncate text-sm leading-tight mb-0.5">
                                    {displayName}
                                </h4>
                                <p className="text-gray-500 text-[10px] truncate font-mono opacity-70 mb-2">
                                    @{displayHandle}
                                </p>

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-gray-600 block">
                                        {new Date(client.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>

                                    <div className="flex gap-1">
                                        <a
                                            href={client.instagram_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                                            onClick={(e) => e.stopPropagation()} // Prevent drag start if clicking link? Actually handle is on parent div so it's fine
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(client.id);
                                            }}
                                            className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </Draggable>
    );
};
