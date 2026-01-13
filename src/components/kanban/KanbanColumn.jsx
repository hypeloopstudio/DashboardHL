import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';

export const KanbanColumn = ({ columnId, title, colorClass, clients, onDelete }) => {
    return (
        <div className="flex flex-col h-full min-w-[280px] w-full bg-white/5 rounded-2xl p-4 border border-white/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0].replace('bg-', 'bg-') || 'bg-gray-500'}`} />
                    <h3 className="text-white font-semibold text-sm">{title}</h3>
                </div>
                <span className="text-gray-500 text-xs bg-black/20 px-2 py-1 rounded-full">
                    {clients.length}
                </span>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`
                            flex-1 transition-colors rounded-xl p-2 -mx-2
                            ${snapshot.isDraggingOver ? 'bg-white/5' : ''}
                        `}
                    >
                        {clients.map((client, index) => (
                            <KanbanCard
                                key={client.id}
                                client={client}
                                index={index}
                                onDelete={onDelete}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};
