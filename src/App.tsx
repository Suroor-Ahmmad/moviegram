import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import { StoreProvider } from './store'
import Navbar from '@/components/Navbar'
import Home from '@/pages/Home'
import MovieDetailPage from '@/pages/MovieDetail'
import TvDetailPage from '@/pages/TvDetail'
import DiaryPage from '@/pages/Diary'
import WatchlistPage from '@/pages/Watchlist'
import AuthPage from '@/pages/Auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00e054] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<ProtectedRoute><StoreProvider><Navbar /><Home /></StoreProvider></ProtectedRoute>} />
      <Route path="/movie/:id" element={<ProtectedRoute><StoreProvider><Navbar /><MovieDetailPage /></StoreProvider></ProtectedRoute>} />
      <Route path="/tv/:id" element={<ProtectedRoute><StoreProvider><Navbar /><TvDetailPage /></StoreProvider></ProtectedRoute>} />
      <Route path="/diary" element={<ProtectedRoute><StoreProvider><Navbar /><DiaryPage /></StoreProvider></ProtectedRoute>} />
      <Route path="/watchlist" element={<ProtectedRoute><StoreProvider><Navbar /><WatchlistPage /></StoreProvider></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
