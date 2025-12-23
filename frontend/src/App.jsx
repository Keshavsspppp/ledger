import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import Matchmaker from './pages/Matchmaker'
import Ledger from './pages/Ledger'
import Programs from './pages/Programs'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Layout><Dashboard /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/marketplace" 
            element={
              <PrivateRoute>
                <Layout><Marketplace /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/matchmaker" 
            element={
              <PrivateRoute>
                <Layout><Matchmaker /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/ledger" 
            element={
              <PrivateRoute>
                <Layout><Ledger /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/programs" 
            element={
              <PrivateRoute>
                <Layout><Programs /></Layout>
              </PrivateRoute>
            } 
          />
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
