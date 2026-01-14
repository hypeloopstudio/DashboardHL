import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GlassCard } from '../ui/GlassCard';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const COLUMNS = [
    { id: 'todo', title: 'Por Hacer', color: 'bg-blue-500' },
    { id: 'doing', title: 'En Progreso', color: 'bg-yellow-500' },
    { id: 'done', title: 'Completado', color: 'bg-green-500' }
];

export const TaskBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [newTaskContent, setNewTaskContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('InternalTasks')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Optimistic UI update
        const newTasks = Array.from(tasks);
        const taskIndex = newTasks.findIndex(t => t.id === draggableId);
        const updatedTask = { ...newTasks[taskIndex], column_id: destination.droppableId }; // Note: column_id match DB
        newTasks[taskIndex] = updatedTask;
        setTasks(newTasks);

        // Update DB
        try {
            const { error } = await supabase
                .from('InternalTasks')
                .update({ column_id: destination.droppableId })
                .eq('id', draggableId);

            if (error) {
                console.error('Error updating task:', error);
                fetchTasks(); // Revert on error
            }
        } catch (error) {
            console.error('Error updating task:', error);
            fetchTasks();
        }
    };

    const handleAddTask = async () => {
        if (!newTaskContent.trim()) return;

        const optimisticTask = {
            id: `temp-${Date.now()}`,
            content: newTaskContent,
            column_id: 'todo',
            created_at: new Date().toISOString()
        };

        setTasks([...tasks, optimisticTask]);
        setNewTaskContent('');
        setIsAdding(false);

        try {
            const { data, error } = await supabase
                .from('InternalTasks')
                .insert([{ content: newTaskContent, column_id: 'todo' }])
                .select();

            if (error) throw error;

            // Replace temp task with real one
            setTasks(prev => prev.map(t => t.id === optimisticTask.id ? data[0] : t));
        } catch (error) {
            console.error('Error adding task:', error);
            setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
        }
    };

    const handleDeleteTask = async (taskId) => {
        // Optimistic delete
        const taskToDelete = tasks.find(t => t.id === taskId);
        setTasks(tasks.filter(t => t.id !== taskId));

        try {
            const { error } = await supabase
                .from('InternalTasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting task:', error);
            setTasks(prev => [...prev, taskToDelete]);
        }
    };

    const getTasksByColumn = (colId) => tasks.filter(t => t.column_id === colId); // Note: column_id

    if (loading) return <div className="text-white/50 text-sm">Cargando tareas...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Task Board
                </h2>
                <div className="flex gap-2">
                    {isAdding ? (
                        <div className="flex gap-2 items-center bg-white/5 rounded-lg p-1 pr-2 animate-fade-in">
                            <input
                                type="text"
                                autoFocus
                                value={newTaskContent}
                                onChange={(e) => setNewTaskContent(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                placeholder="Nueva tarea..."
                                className="bg-transparent border-none focus:outline-none text-sm px-2 text-white placeholder-gray-500 w-48"
                            />
                            <button onClick={handleAddTask} className="text-green-400 hover:text-green-300"><Plus size={16} /></button>
                            <button onClick={() => setIsAdding(false)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm transition-colors border border-primary/20"
                        >
                            <Plus size={16} />
                            Nueva Tarea
                        </button>
                    )}
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {COLUMNS.map(col => (
                        <div key={col.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${col.color}`} />
                                    <h3 className="text-white font-semibold text-sm">{col.title}</h3>
                                </div>
                                <span className="text-gray-500 text-xs bg-black/20 px-2 py-1 rounded-full">
                                    {getTasksByColumn(col.id).length}
                                </span>
                            </div>

                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 min-h-[100px] transition-colors rounded-xl p-2 -mx-2 ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                                    >
                                        {getTasksByColumn(col.id).map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{ ...provided.draggableProps.style }}
                                                        className="mb-3"
                                                    >
                                                        <GlassCard className={`p-3 group relative hover:bg-white/10 border-white/5 ${snapshot.isDragging ? 'shadow-2xl z-50 rotate-1' : ''}`}>
                                                            <div className="flex justify-between items-start gap-2">
                                                                <p className="text-gray-200 text-sm">{task.content}</p>
                                                                <button
                                                                    onClick={() => handleDeleteTask(task.id)}
                                                                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </GlassCard>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};
