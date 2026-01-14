import React from 'react';
import { TaskBoard } from '../components/internal-ops/TaskBoard';
import { SharedAssets } from '../components/internal-ops/SharedAssets';
import { UpdateLog } from '../components/internal-ops/UpdateLog';
import { ToolsList } from '../components/internal-ops/ToolsList';

const InternalOps = () => {
    return (
        <div className="space-y-8 h-full">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    Internal Ops
                </h1>
                <p className="text-gray-400 mt-1">Gestión de socios y operaciones internas</p>
            </div>

            {/* Task Board Section */}
            <section className="h-[500px]">
                <TaskBoard />
            </section>

            {/* Bottom Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
                {/* Shared Assets */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 overflow-hidden">
                    <SharedAssets />
                </div>

                {/* Update Log */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 overflow-hidden">
                    <UpdateLog />
                </div>

                {/* Tools */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 overflow-hidden">
                    <ToolsList />
                </div>
            </section>
        </div>
    );
};

export default InternalOps;
