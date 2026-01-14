import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { Layout } from './components/layout/Layout'
import Login from './pages/Login'

import Dashboard from './pages/Dashboard'

// Placeholder for protected pages
import Leads from './pages/Leads'
import PossibleClients from './pages/PossibleClients'

import Clients from './pages/Clients'
import InternalOps from './pages/InternalOps'

function PrivateRoute({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-background-dark flex items-center justify-center text-white">Cargando...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="possible-clients" element={<PossibleClients />} />
          <Route path="clients" element={<Clients />} />
          <Route path="internal-ops" element={<InternalOps />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
