import { useState } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import Auth from './components/Auth'
import HomePage from './components/HomePage'
import SubmitArtifact from './components/SubmitArtifact'
import './App.css'

function AppContent() {
  const { user, loading, signOut } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')

  if (loading) {
    return (
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: 'var(--text-gray)'
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav>
        <div className="nav-content">
          <div className="nav-left">
            <h2>Artifact Library</h2>
            <button 
              onClick={() => setCurrentPage('home')}
              style={{
                fontWeight: currentPage === 'home' ? '600' : '500',
                color: currentPage === 'home' ? 'var(--primary-terracotta)' : 'var(--text-gray)'
              }}
            >
              Browse
            </button>
            <button 
              onClick={() => setCurrentPage('submit')}
              style={{
                background: currentPage === 'submit' ? 'var(--btn-primary-bg)' : 'transparent',
                color: currentPage === 'submit' ? 'var(--btn-primary-text)' : 'var(--text-gray)',
                fontWeight: '600'
              }}
            >
              + Submit
            </button>
          </div>
          <div className="nav-right">
            <span className="user-email">{user.email}</span>
            <button 
              onClick={signOut}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'submit' && <SubmitArtifact onSuccess={() => setCurrentPage('home')} />}
      </main>
    </div>
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