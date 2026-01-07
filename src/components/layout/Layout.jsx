import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import logo from '../../assets/logo.png'

export function Layout() {
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    return (
        <div className="flex min-h-screen bg-background-dark text-white font-sans">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 glass-panel border-r border-white/10 z-20 hidden md:block">
                <div className="p-6">
                    <div className="flex items-center">
                        <img src={logo} alt="HypeLoop" className="h-24 w-auto" />
                    </div>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/') ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,0,255,0.1)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link to="/leads" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/leads') ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,0,255,0.1)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                        <Users size={20} />
                        <span className="font-medium">Leads</span>
                    </Link>
                </nav>

                <div className="absolute bottom-8 left-0 w-full px-4">
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            window.location.reload() // Force reload to clear state cleanly
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-500 text-gray-400 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 relative min-h-screen">
                {/* Mobile Header */}
                <header className="md:hidden glass-panel sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
                    <img src={logo} alt="HypeLoop" className="h-12 w-auto" />
                    <button className="p-2 text-gray-400">
                        <LayoutDashboard size={24} />
                    </button>
                </header>

                <main className="p-6 md:p-8 space-y-8 animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
