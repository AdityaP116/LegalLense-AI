import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { CreateCase } from '@/pages/CreateCase'
import { CaseWorkspace } from '@/pages/CaseWorkspace'
import { Login } from '@/pages/Login'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Shield } from 'lucide-react'

// PrivateRoute wrapper
const PrivateRoute = () => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <Shield className="w-12 h-12 text-blue-600 mb-4" />
          <p className="text-slate-500 font-medium">Loading LegalLens...</p>
        </div>
      </div>
    )
  }
  
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="cases" element={<div className="p-space-xl">My Cases View Placeholder</div>} />
            <Route path="settings" element={<div className="p-space-xl">Settings View Placeholder</div>} />

            {/* Case Workspace Routes */}
            <Route path="cases/new" element={<CreateCase />} />
            <Route path="case/:caseId" element={<CaseWorkspace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
