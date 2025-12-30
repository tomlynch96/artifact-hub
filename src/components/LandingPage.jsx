import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

export default function LandingPage({ onSignUpClick }) {
  const { user } = useAuth()
  const [topArtifacts, setTopArtifacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchTopArtifacts()
  }, [])

  // Auto-rotate gallery every 5 seconds
  useEffect(() => {
    if (topArtifacts.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topArtifacts.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [topArtifacts.length])

  const fetchTopArtifacts = async () => {
    try {
      const { data: artifactsData, error } = await supabase
        .from('artifacts')
        .select(`
          *,
          artifact_subjects (subject),
          artifact_key_stages (key_stage)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      // Get vote counts for each artifact
      const artifactsWithVotes = await Promise.all(
        artifactsData.map(async (artifact) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('artifact_id', artifact.id)

          return {
            ...artifact,
            voteCount: count || 0
          }
        })
      )

      // Sort by votes and take top 6
      const topRated = artifactsWithVotes
        .sort((a, b) => b.voteCount - a.voteCount)
        .slice(0, 6)

      setTopArtifacts(topRated)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching artifacts:', error)
      setLoading(false)
    }
  }

  const handleArtifactClick = (e) => {
    e.preventDefault()
    onSignUpClick()
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 20px',
        fontSize: '18px',
        color: 'var(--text-gray)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        {/* Translucent shapes */}
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        
        {/* Content */}
        <h1>Teacher Artifact Library</h1>
        <div className="hero-subtitle">
          <p>Discover and share Claude-created teaching resources for UK secondary education</p>
          <p>Save hours on lesson planning with AI-powered educational content</p>
          <p>Join a community of innovative educators using Claude AI</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-section">
        <div className="container">
          {/* Stats Section */}
          <div style={{
            display: 'flex',
            gap: 'clamp(24px, 5vw, 48px)',
            justifyContent: 'center',
            flexWrap: 'wrap',
            padding: 'var(--space-8)',
            background: 'var(--background-white)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-12)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ textAlign: 'center', minWidth: '100px' }}>
              <div style={{ 
                fontSize: 'clamp(32px, 5vw, 48px)', 
                fontWeight: '800', 
                color: 'var(--primary-terracotta)',
                marginBottom: 'var(--space-2)'
              }}>
                150+
              </div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-gray)', fontWeight: '600' }}>
                Artifacts
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '100px' }}>
              <div style={{ 
                fontSize: 'clamp(32px, 5vw, 48px)', 
                fontWeight: '800', 
                color: 'var(--primary-terracotta)',
                marginBottom: 'var(--space-2)'
              }}>
                50+
              </div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-gray)', fontWeight: '600' }}>
                Contributors
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '100px' }}>
              <div style={{ 
                fontSize: 'clamp(32px, 5vw, 48px)', 
                fontWeight: '800', 
                color: 'var(--primary-terracotta)',
                marginBottom: 'var(--space-2)'
              }}>
                500+
              </div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-gray)', fontWeight: '600' }}>
                Upvotes
              </div>
            </div>
          </div>

          {/* Top Rated Artifacts Gallery */}
          <div style={{ marginBottom: 'var(--space-16)' }}>
            <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
              <h2 className="section-title">Top Rated Artifacts</h2>
              <p className="section-subtitle">
                Explore our most popular teaching resources
              </p>
            </div>

            {topArtifacts.length > 0 ? (
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Main Gallery Display */}
                <div style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  marginBottom: 'var(--space-6)',
                  boxShadow: 'var(--shadow-xl)',
                  background: 'var(--background-white)'
                }}>
                  {/* Screenshot */}
                  <div style={{ position: 'relative', aspectRatio: '16/10' }}>
                    <img 
                      src={topArtifacts[currentIndex].screenshot_url}
                      alt={topArtifacts[currentIndex].title}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                    
                    {/* Overlay gradient */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '50%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
                    }} />

                    {/* Vote badge */}
                    <div style={{
                      position: 'absolute',
                      top: 'var(--space-4)',
                      right: 'var(--space-4)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}>
                      ⬆️ {topArtifacts[currentIndex].voteCount}
                    </div>

                    {/* Navigation arrows */}
                    <button
                      onClick={() => goToSlide((currentIndex - 1 + topArtifacts.length) % topArtifacts.length)}
                      style={{
                        position: 'absolute',
                        left: 'var(--space-4)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '24px',
                        boxShadow: 'var(--shadow-lg)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => goToSlide((currentIndex + 1) % topArtifacts.length)}
                      style={{
                        position: 'absolute',
                        right: 'var(--space-4)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '24px',
                        boxShadow: 'var(--shadow-lg)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'}
                    >
                      →
                    </button>

                    {/* Content overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: 'var(--space-6)',
                      color: 'white'
                    }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                        {topArtifacts[currentIndex].artifact_key_stages?.map((k, i) => (
                          <span key={i} className="tag key-stage" style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}>
                            {k.key_stage}
                          </span>
                        ))}
                        {topArtifacts[currentIndex].artifact_subjects?.slice(0, 2).map((s, i) => (
                          <span key={i} className="tag" style={{
                            background: 'var(--primary-terracotta)',
                            color: 'white'
                          }}>
                            {s.subject}
                          </span>
                        ))}
                      </div>

                      <h3 style={{ 
                        fontSize: 'clamp(24px, 4vw, 32px)', 
                        fontWeight: '700',
                        marginBottom: 'var(--space-2)',
                        lineHeight: '1.2'
                      }}>
                        {topArtifacts[currentIndex].title}
                      </h3>

                      {topArtifacts[currentIndex].description && (
                        <p style={{ 
                          fontSize: 'clamp(14px, 2vw, 16px)',
                          opacity: 0.95,
                          marginBottom: 'var(--space-4)',
                          lineHeight: '1.5'
                        }}>
                          {topArtifacts[currentIndex].description}
                        </p>
                      )}

                      <a
                        href={topArtifacts[currentIndex].artifact_url}
                        onClick={handleArtifactClick}
                        className="btn-primary"
                        style={{
                          display: 'inline-block',
                          textDecoration: 'none'
                        }}
                      >
                        View Artifact →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Thumbnail navigation */}
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {topArtifacts.map((artifact, index) => (
                    <button
                      key={artifact.id}
                      onClick={() => goToSlide(index)}
                      style={{
                        width: index === currentIndex ? '48px' : '12px',
                        height: '12px',
                        border: 'none',
                        borderRadius: '6px',
                        background: index === currentIndex ? 'var(--primary-terracotta)' : 'var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        padding: 0
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-gray)' }}>
                No artifacts available yet.
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div style={{
            textAlign: 'center',
            padding: 'clamp(48px, 8vw, 80px) var(--space-6)',
            background: 'linear-gradient(135deg, var(--primary-terracotta-light) 0%, var(--primary-terracotta) 100%)',
            borderRadius: 'var(--radius-2xl)',
            color: 'white',
            marginBottom: 'var(--space-12)'
          }}>
            <h2 style={{ 
              fontSize: 'clamp(28px, 5vw, 40px)', 
              fontWeight: '800',
              marginBottom: 'var(--space-4)',
              lineHeight: '1.2'
            }}>
              Ready to explore more?
            </h2>
            <p style={{ 
              fontSize: 'clamp(16px, 3vw, 20px)',
              marginBottom: 'var(--space-6)',
              maxWidth: '600px',
              margin: '0 auto var(--space-6)',
              opacity: 0.95,
              lineHeight: '1.6'
            }}>
              Join our community of educators and access hundreds of AI-powered teaching resources
            </p>
            <button 
              onClick={onSignUpClick}
              style={{
                background: 'white',
                color: 'var(--primary-terracotta)',
                border: 'none',
                padding: '16px 40px',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-lg)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              }}
            >
              Get Started Free
            </button>
          </div>

          {/* Features Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-12)'
          }}>
            <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>🎨</div>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', marginBottom: 'var(--space-2)', color: 'var(--text-dark)' }}>
                AI-Powered
              </h3>
              <p style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>
                Created with Claude AI for interactive, engaging learning experiences
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>📚</div>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', marginBottom: 'var(--space-2)', color: 'var(--text-dark)' }}>
                UK Curriculum
              </h3>
              <p style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>
                Aligned with KS2-KS5 standards for secondary education
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>👥</div>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', marginBottom: 'var(--space-2)', color: 'var(--text-dark)' }}>
                Community-Driven
              </h3>
              <p style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>
                Share your own artifacts and discover resources from fellow educators
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}