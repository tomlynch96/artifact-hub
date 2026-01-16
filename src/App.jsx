import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useAuth, AuthProvider } from './AuthContext'
import Auth from './components/Auth'
import HomePage from './components/HomePage'
import SubmitArtifact from './components/SubmitArtifact'
import LandingPage from './components/LandingPage'
import SideNavigation from './components/SideNavigation'
import MyProfile from './components/MyProfile'
import AboutPage from './components/AboutPage'
import './App.css'

function AppContent() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState('browse')
  const [showAuth, setShowAuth] = useState(false)

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (!user) {
    // Show full-page auth if user clicked sign up
    if (showAuth) {
      return <Auth />
    }
    
    // Otherwise show landing page
    return <LandingPage onSignUpClick={() => setShowAuth(true)} />
  }

  return (
    <div>
      <SideNavigation 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onSignOut={signOut}
      />

      <main>
        {currentPage === 'browse' && <HomePage />}
        {currentPage === 'submit' && <SubmitArtifact onSuccess={() => setCurrentPage('browse')} />}
        {currentPage === 'profile' && <MyProfile />}
        {currentPage === 'about' && <AboutPage />}
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
