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
  const [viewingBrowse, setViewingBrowse] = useState(false)

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const handleSignInRequired = () => {
    setShowAuth(true)
  }

  if (!user) {
    // Show full-page auth if user clicked sign up
    if (showAuth) {
      return <Auth />
    }
    
    // Show browse page for non-authenticated users who clicked "Browse"
    if (viewingBrowse) {
      return (
        <div>
          <SideNavigation 
            currentPage="browse"
            onNavigate={(page) => {
              if (page === 'browse' || page === 'about') {
                // Allow these pages
                setCurrentPage(page)
              } else if (page === 'home') {
                setViewingBrowse(false)
              } else {
                // Protected pages (submit, profile, favourites) - show auth
                setShowAuth(true)
              }
            }}
            user={null}
            onSignOut={() => {}}
            onSignInClick={() => setShowAuth(true)}
            onLogoClick={() => setViewingBrowse(false)}
          />

          <main>
            <HomePage onSignInRequired={handleSignInRequired} />
          </main>
        </div>
      )
    }
    
    // Otherwise show landing page
    return (
      <LandingPage 
        onSignUpClick={() => setShowAuth(true)} 
        onBrowseClick={() => setViewingBrowse(true)}
      />
    )
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