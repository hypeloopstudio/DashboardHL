import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut, UserPlus, Menu, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import logo from '../../assets/logo.png'

export function Layout() {
    const location = useLocation()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const isActive = (path) => location.pathname === path

    const handleNavigate = (path) => {
        navigate(path)
        setMobileMenuOpen(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setMobileMenuOpen(false)
        window.location.reload()
    }

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
                    <Link to="/possible-clients" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/possible-clients') ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,0,255,0.1)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                        <UserPlus size={20} />
                        <span className="font-medium">Posibles Clientes</span>
                    </Link>
                    <Link to="/clients" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/clients') ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,0,255,0.1)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                        <Users size={20} />
                        <span className="font-medium">Clientes</span>
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
                <header className="md:hidden glass-panel sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center border-b border-white/10 relative">
                    <img src={logo} alt="HypeLoop" className="h-10 sm:h-12 w-auto" />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="absolute right-4 sm:right-6 p-2 text-gray-400 hover:text-white active:text-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Menú"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                        <div className="absolute right-0 top-0 h-full w-64 glass-panel border-l border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-center justify-between mb-6">
                                    <img src={logo} alt="HypeLoop" className="h-16 w-auto" />
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <nav className="p-4 space-y-2">
                                <button
                                    onClick={() => handleNavigate('/')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${isActive('/') ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,0,255,0.1)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                                >
                                    <LayoutDashboard size={20} />
                                    <span className="font-medium">Dashboard</span>
                                </button>
                                <button
                                    onClick={() => handleNavigate('/leads')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${isActive('/leads') ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,0,255,0.1)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                                >
                                    <Users size={20} />
                                    <span className="font-medium">Leads</span>
                                </button>
                                <button
                                    onClick={() => handleNavigate('/possible-clients')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${isActive('/possible-clients') ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,0,255,0.1)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                                >
                                    <UserPlus size={20} />
                                    <span className="font-medium">Posibles Clientes</span>
                                </button>
                                <button
                                    onClick={() => handleNavigate('/clients')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${isActive('/clients') ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,0,255,0.1)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                                >
                                    <Users size={20} />
                                    <span className="font-medium">Clientes</span>
                                </button>
                            </nav>

                            <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/10">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-500 text-gray-400 transition-colors touch-manipulation min-h-[44px]"
                                >
                                    <LogOut size={20} />
                                    <span className="font-medium">Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
