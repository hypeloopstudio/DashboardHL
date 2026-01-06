import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!supabase) {
            setError('Supabase is not configured. Check your .env file.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            if (data.user) {
                navigate('/')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md glass-panel p-8 rounded-2xl z-10 relative">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tighter mb-2">
                        <span className="text-white">Hype</span>
                        <span className="text-transparent bg-clip-text bg-cyber-gradient">Loop</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Acceso Administrativo</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {(!supabase) && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm p-3 rounded-lg text-center mb-4">
                            <strong>Missing Configuration</strong><br />
                            Create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full glass-input"
                            placeholder="admin@hypeloop.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full glass-input"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-cyber-gradient text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'Iniciar Sesión'}
                    </button>

                    {/* Temporary Signup for Development */}
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-500">¿No tienes cuenta?</p>
                        <button
                            type="button"
                            onClick={async () => {
                                const email = prompt("Email para admin:");
                                const password = prompt("Contraseña:");
                                if (email && password) {
                                    const { error } = await supabase.auth.signUp({ email, password });
                                    if (error) alert(error.message);
                                    else alert("Usuario creado! Revisa tu email o logueate si desactivaste confirmación.");
                                }
                            }}
                            className="text-xs text-primary hover:underline mt-1"
                        >
                            Crear Admin (Dev Mode)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
