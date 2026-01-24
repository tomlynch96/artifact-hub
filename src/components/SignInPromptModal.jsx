import { useEffect } from 'react'

export default function SignInPromptModal({ onClose, onSignIn, message }) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: 'clamp(32px, 5vw, 48px)',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              color: '#6B7280',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6'
              e.currentTarget.style.color = '#1A1A1A'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = '#6B7280'
            }}
          >
            ✕
          </button>

          {/* Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #2C5F2D 0%, #3A7A3B 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: '700',
            color: '#1A1A1A',
            textAlign: 'center',
            marginBottom: '12px',
            lineHeight: '1.2'
          }}>
            Join the Community!
          </h2>

          {/* Message */}
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 18px)',
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: '8px',
            lineHeight: '1.6'
          }}>
            {message || 'Sign in to engage with the community'}
          </p>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: '#9CA3AF',
            textAlign: 'center',
            marginBottom: '32px',
            lineHeight: '1.5'
          }}>
            Be part of a growing community of UK teachers sharing innovative AI-powered teaching resources.
          </p>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <button
              onClick={onSignIn}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: '#2C5F2D',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(44, 95, 45, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#234A24'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(44, 95, 45, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2C5F2D'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(44, 95, 45, 0.3)'
              }}
            >
              Sign In / Sign Up
            </button>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'transparent',
                color: '#6B7280',
                border: '2px solid #E8E1D0',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F9FAFB'
                e.currentTarget.style.borderColor = '#2C5F2D'
                e.currentTarget.style.color = '#2C5F2D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = '#E8E1D0'
                e.currentTarget.style.color = '#6B7280'
              }}
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </>
  )
}