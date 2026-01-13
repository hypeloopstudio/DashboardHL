import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';

const COLUMNS = [
    { id: 'Sin contactar', title: 'Nuevo', color: 'bg-blue-500' },
    { id: 'Contactado', title: 'Contactado', color: 'bg-yellow-500' },
    { id: 'Concretado', title: 'Concretado', color: 'bg-green-500' },
    { id: 'Rechazado', title: 'Rechazado', color: 'bg-red-500' }
];

export const KanbanBoard = ({ clients, onDragEnd, onDelete }) => {

    // Group clients by status
    const getClientsByStatus = (status) => {
        return clients.filter(client => client.status === status);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 h-[calc(100vh-280px)] min-h-[500px]">
                {COLUMNS.map(col => (
                    <div key={col.id} className="flex-shrink-0 w-full md:w-80">
                        <KanbanColumn
                            columnId={col.id}
                            title={col.title}
                            colorClass={col.color}
                            clients={getClientsByStatus(col.id)}
                            onDelete={onDelete}
                        />
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
};
