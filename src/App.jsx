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
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div>
      <nav style={{ 
        padding: '20px', 
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <button onClick={() => setCurrentPage('home')} style={{ marginRight: '10px' }}>
            Home
          </button>
          <button onClick={() => setCurrentPage('submit')}>
            Submit Artifact
          </button>
        </div>
        <div>
          <span style={{ marginRight: '15px' }}>{user.email}</span>
          <button onClick={signOut}>Sign Out</button>
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