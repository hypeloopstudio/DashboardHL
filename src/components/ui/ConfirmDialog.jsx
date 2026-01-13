import React from 'react'
import { X, AlertTriangle } from 'lucide-react'

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Eliminar', cancelText = 'Cancelar' }) {
    if (!isOpen) return null

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="glass-panel rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-red-500/20 rounded-full flex-shrink-0">
                        <AlertTriangle className="text-red-400" size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                        <p className="text-gray-400 text-sm sm:text-base">{message}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 sm:py-2 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors touch-manipulation min-h-[44px] sm:min-h-[40px] order-2 sm:order-1"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2.5 sm:py-2 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors touch-manipulation min-h-[44px] sm:min-h-[40px] order-1 sm:order-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
