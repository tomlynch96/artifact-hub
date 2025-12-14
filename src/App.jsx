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
        color: '#6B7280'
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
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#8B5CF6',
              marginRight: '20px'
            }}>
              Artifact Library
            </h2>
            <button 
              onClick={() => setCurrentPage('home')}
              style={{
                fontWeight: currentPage === 'home' ? '600' : '500',
                color: currentPage === 'home' ? '#8B5CF6' : '#6B7280'
              }}
            >
              Browse
            </button>
            <button 
              onClick={() => setCurrentPage('submit')}
              className={currentPage === 'submit' ? '' : ''}
              style={{
                background: currentPage === 'submit' ? '#8B5CF6' : 'transparent',
                color: currentPage === 'submit' ? 'white' : '#6B7280',
                fontWeight: '600'
              }}
            >
              + Submit Artifact
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#6B7280', fontSize: '14px' }}>{user.email}</span>
            <button 
              onClick={signOut}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #E5E7EB',
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