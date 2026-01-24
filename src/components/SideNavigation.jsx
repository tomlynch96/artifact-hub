import { useState, useEffect } from 'react'

export default function SideNavigation({ currentPage, onNavigate, user, onSignOut, onSignInClick, onLogoClick }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const handleNavClick = (page) => {
    onNavigate(page)
    closeMenu()
  }

  return (
    <>
      {/* Scroll-Responsive Top Bar */}
      <nav style={{
        background: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        padding: '16px 48px',
        borderBottom: isScrolled ? '1px solid #E8E1D0' : 'none',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '100%'
        }}>
          {/* Left - Menu Icon & TeacherVibes */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <button
              onClick={toggleMenu}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                fontSize: '22px',
                color: '#1A1A1A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </button>

            {/* TeacherVibes - clickable to go back to landing for non-auth users */}
            <span 
              onClick={onLogoClick}
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1A1A1A',
                opacity: isScrolled ? 0 : 1,
                transform: isScrolled ? 'translateX(-10px)' : 'translateX(0)',
                transition: 'all 0.3s ease',
                pointerEvents: isScrolled ? 'none' : 'auto',
                cursor: onLogoClick ? 'pointer' : 'default'
              }}
            >
              TeacherVibes
            </span>
          </div>

          {/* Right Side - User Info or Sign In */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('profile')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: currentPage === 'profile' ? '#2C5F2D' : '#6B7280',
                    fontWeight: '500',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span style={{ display: isScrolled ? 'none' : 'inline' }}>
                    Profile
                  </span>
                </button>

                <button
                  onClick={onSignOut}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#6B7280',
                    fontWeight: '500',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FEE2E2'
                    e.currentTarget.style.color = '#DC2626'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.color = '#6B7280'
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={onSignInClick}
                style={{
                  background: '#2C5F2D',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: '600',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  transition: 'all 0.15s',
                  marginRight: '24px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#234A24'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#2C5F2D'
                }}
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 998
          }}
        />
      )}

      {/* Minimal White Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : '-280px',
        width: '280px',
        height: '100vh',
        height: '100dvh',
        background: 'white',
        zIndex: 999,
        transition: 'left 0.2s ease-out',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #E8E1D0',
        overflow: 'hidden'
      }}>
        {/* Menu Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E8E1D0',
          flexShrink: 0
        }}>
          <span 
            onClick={() => {
              if (onLogoClick) {
                onLogoClick()
                closeMenu()
              }
            }}
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1A1A1A',
              cursor: onLogoClick ? 'pointer' : 'default'
            }}
          >
            TeacherVibes
          </span>
        </div>

        {/* Navigation Items - Scrollable */}
        <nav style={{ 
          flex: 1,
          padding: '8px 0',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0
        }}>
          {/* Browse Artifacts */}
          <button
            onClick={() => handleNavClick('browse')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: currentPage === 'browse' ? '#F5F1E8' : 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: currentPage === 'browse' ? '500' : '400',
              color: currentPage === 'browse' ? '#1A1A1A' : '#6B7280',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 'browse') e.currentTarget.style.background = '#FAFAFA'
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 'browse') e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Browse Artifacts
          </button>

          {/* Blog */}
          <a
            href="https://teachervibes.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '400',
              color: '#6B7280',
              transition: 'background 0.15s',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FAFAFA'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Blog
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </div>
          </a>

          {/* Tutorials - Coming Soon */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              fontSize: '15px',
              color: '#D1D5DB',
              opacity: 0.6
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <div style={{ flex: 1 }}>
              Tutorials
              <div style={{
                fontSize: '11px',
                color: '#9CA3AF',
                marginTop: '2px'
              }}>
                Coming soon
              </div>
            </div>
          </div>

          {/* About Us */}
          <button
            onClick={() => handleNavClick('about')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: currentPage === 'about' ? '#F5F1E8' : 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: currentPage === 'about' ? '500' : '400',
              color: currentPage === 'about' ? '#1A1A1A' : '#6B7280',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 'about') e.currentTarget.style.background = '#FAFAFA'
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 'about') e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            About Us
          </button>
        </nav>

        {/* Bottom Section - Submit or Sign In */}
        <div style={{
          borderTop: '1px solid #E8E1D0',
          padding: '12px',
          flexShrink: 0,
          background: 'white'
        }}>
          <button
            onClick={() => {
              if (user) {
                handleNavClick('submit')
              } else {
                onSignInClick && onSignInClick()
                closeMenu()
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: user ? 'white' : '#2C5F2D',
              border: user ? '1px solid #E8E1D0' : 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: user ? '500' : '600',
              color: user ? '#1A1A1A' : 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              if (user) {
                e.currentTarget.style.background = '#F5F1E8'
                e.currentTarget.style.borderColor = '#2C5F2D'
              } else {
                e.currentTarget.style.background = '#234A24'
              }
            }}
            onMouseLeave={(e) => {
              if (user) {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#E8E1D0'
              } else {
                e.currentTarget.style.background = '#2C5F2D'
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Artifact
          </button>
        </div>
      </div>
    </>
  )
}