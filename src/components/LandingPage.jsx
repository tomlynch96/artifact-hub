import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function LandingPage({ onSignUpClick }) {
  const [topArtifacts, setTopArtifacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [stats, setStats] = useState({
    artifactCount: 0,
    contributorCount: 0,
    voteCount: 0
  })

  useEffect(() => {
    fetchTopArtifacts()
    fetchStats()
  }, [])

  // Auto-rotate gallery every 5 seconds
  useEffect(() => {
    if (topArtifacts.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 3
        return next >= topArtifacts.length ? 0 : next
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [topArtifacts.length])

  const fetchStats = async () => {
    try {
      // Get artifact count
      const { count: artifactCount } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact', head: true })

      // Get unique contributor count
      const { data: artifacts } = await supabase
        .from('artifacts')
        .select('user_id')
      
      const uniqueContributors = new Set(artifacts?.map(a => a.user_id) || []).size

      // Get total vote count
      const { count: voteCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })

      setStats({
        artifactCount: artifactCount || 0,
        contributorCount: uniqueContributors || 0,
        voteCount: voteCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

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
        .limit(30)

      if (error) throw error

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

      // Sort by votes and take top 9 (3 sets of 3)
      const topRated = artifactsWithVotes
        .sort((a, b) => b.voteCount - a.voteCount)
        .slice(0, 9)

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

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const next = prev + 3
      return next >= topArtifacts.length ? 0 : next
    })
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => {
      const next = prev - 3
      return next < 0 ? Math.max(0, Math.floor((topArtifacts.length - 1) / 3) * 3) : next
    })
  }

  const visibleArtifacts = topArtifacts.slice(currentIndex, currentIndex + 3)

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
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        
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
          {/* Real Stats */}
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
                {stats.artifactCount}
              </div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-gray)', fontWeight: '600' }}>
                {stats.artifactCount === 1 ? 'Artifact' : 'Artifacts'}
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '100px' }}>
              <div style={{ 
                fontSize: 'clamp(32px, 5vw, 48px)', 
                fontWeight: '800', 
                color: 'var(--primary-terracotta)',
                marginBottom: 'var(--space-2)'
              }}>
                {stats.contributorCount}
              </div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-gray)', fontWeight: '600' }}>
                {stats.contributorCount === 1 ? 'Contributor' : 'Contributors'}
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '100px' }}>
              <div style={{ 
                fontSize: 'clamp(32px, 5vw, 48px)', 
                fontWeight: '800', 
                color: 'var(--primary-terracotta)',
                marginBottom: 'var(--space-2)'
              }}>
                {stats.voteCount}
              </div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-gray)', fontWeight: '600' }}>
                {stats.voteCount === 1 ? 'Upvote' : 'Upvotes'}
              </div>
            </div>
          </div>

          {/* 3-Card Gallery */}
          <div style={{ marginBottom: 'var(--space-16)' }}>
            <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
              <h2 className="section-title">Top Rated Artifacts</h2>
              <p className="section-subtitle">
                Explore our most popular teaching resources
              </p>
            </div>

            {topArtifacts.length > 0 ? (
              <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
                {/* Navigation Arrows */}
                <button
                  onClick={goToPrev}
                  style={{
                    position: 'absolute',
                    left: '-60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'white',
                    border: '2px solid var(--border-color)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '24px',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-terracotta)'
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.borderColor = 'var(--primary-terracotta)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.color = 'black'
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                  }}
                >
                  ←
                </button>
                <button
                  onClick={goToNext}
                  style={{
                    position: 'absolute',
                    right: '-60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'white',
                    border: '2px solid var(--border-color)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '24px',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-terracotta)'
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.borderColor = 'var(--primary-terracotta)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.color = 'black'
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                  }}
                >
                  →
                </button>

                {/* 3 Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 'var(--space-6)',
                  marginBottom: 'var(--space-6)'
                }}>
                  {visibleArtifacts.map((artifact) => (
                    <a
                      key={artifact.id}
                      href={artifact.artifact_url}
                      onClick={handleArtifactClick}
                      onMouseEnter={() => setHoveredCard(artifact.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        textDecoration: 'none',
                        display: 'block',
                        cursor: 'pointer'
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          borderRadius: 'var(--radius-xl)',
                          overflow: 'hidden',
                          aspectRatio: '4/3',
                          boxShadow: 'var(--shadow-md)',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                        }}
                      >
                        {/* Screenshot */}
                        <img 
                          src={artifact.screenshot_url}
                          alt={artifact.title}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                        />

                        {/* Vote badge */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '700'
                        }}>
                          ⬆️ {artifact.voteCount}
                        </div>

                        {/* Hover overlay with title */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(192, 101, 67, 0.95)',
                            padding: 'var(--space-5)',
                            transform: hoveredCard === artifact.id ? 'translateY(0)' : 'translateY(100%)',
                            transition: 'transform 0.3s ease',
                            color: 'white'
                          }}
                        >
                          <h3 style={{ 
                            fontSize: 'var(--text-lg)', 
                            fontWeight: '700',
                            lineHeight: '1.3',
                            margin: 0
                          }}>
                            {artifact.title}
                          </h3>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Dot indicators */}
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-2)',
                  justifyContent: 'center'
                }}>
                  {Array.from({ length: Math.ceil(topArtifacts.length / 3) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index * 3)}
                      style={{
                        width: currentIndex === index * 3 ? '32px' : '12px',
                        height: '12px',
                        border: 'none',
                        borderRadius: '6px',
                        background: currentIndex === index * 3 ? 'var(--primary-terracotta)' : 'var(--border-color)',
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

          {/* CTA Section - No Box */}
          <div style={{
            textAlign: 'center',
            padding: 'clamp(48px, 8vw, 80px) var(--space-6)',
            marginBottom: 'var(--space-12)'
          }}>
            <h2 style={{ 
              fontSize: 'clamp(28px, 5vw, 40px)', 
              fontWeight: '800',
              marginBottom: 'var(--space-4)',
              lineHeight: '1.2',
              color: 'var(--primary-terracotta)'
            }}>
              Ready to explore more?
            </h2>
            <p style={{ 
              fontSize: 'clamp(16px, 3vw, 20px)',
              marginBottom: 'var(--space-6)',
              maxWidth: '600px',
              margin: '0 auto var(--space-6)',
              lineHeight: '1.6',
              color: 'var(--text-dark)'
            }}>
              Join our community of educators and access hundreds of AI-powered teaching resources
            </p>
            <button 
              onClick={onSignUpClick}
              style={{
                background: 'var(--primary-terracotta)',
                color: 'white',
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
                e.currentTarget.style.background = 'var(--primary-terracotta-dark)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                e.currentTarget.style.background = 'var(--primary-terracotta)'
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