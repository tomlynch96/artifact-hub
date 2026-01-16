import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function LandingPage({ onSignUpClick }) {
  const [topArtifacts, setTopArtifacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeAppletIndex, setActiveAppletIndex] = useState(0)
  const [stats, setStats] = useState({
    artifactCount: 0,
    contributorCount: 0,
    teacherCount: 0
  })

  // Typewriter effect state
  const [typewriterText, setTypewriterText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)

  const phrases = [
    "built by teachers",
    "designed for the future",
    "shared for you"
  ]

  useEffect(() => {
    fetchTopArtifacts()
    fetchStats()
  }, [])

  // Typewriter effect logic
  useEffect(() => {
    const handleType = () => {
      const i = loopNum % phrases.length
      const fullText = phrases[i]

      setTypewriterText(isDeleting 
        ? fullText.substring(0, typewriterText.length - 1) 
        : fullText.substring(0, typewriterText.length + 1)
      )

      setTypingSpeed(isDeleting ? 40 : 120)

      if (!isDeleting && typewriterText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000)
      } else if (isDeleting && typewriterText === '') {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      }
    }

    const timer = setTimeout(handleType, typingSpeed)
    return () => clearTimeout(timer)
  }, [typewriterText, isDeleting, loopNum])

  // Auto-rotate featured artifacts every 3.5 seconds
  useEffect(() => {
    if (topArtifacts.length === 0) return
    
    const timer = setInterval(() => {
      setActiveAppletIndex((prev) => (prev + 1) % Math.min(topArtifacts.length, 3))
    }, 3500)
    
    return () => clearInterval(timer)
  }, [topArtifacts])

  const fetchTopArtifacts = async () => {
    try {
      const { data: artifactsData, error } = await supabase
        .from('artifacts')
        .select('*, artifact_subjects(subject), artifact_key_stages(key_stage)')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error

      const artifactsWithVotes = await Promise.all(
        artifactsData.map(async (artifact) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('artifact_id', artifact.id)

          return {
            ...artifact,
            voteCount: count || 0,
            subjects: artifact.artifact_subjects?.map(s => s.subject) || [],
            keyStages: artifact.artifact_key_stages?.map(ks => ks.key_stage) || []
          }
        })
      )

      artifactsWithVotes.sort((a, b) => b.voteCount - a.voteCount)
      setTopArtifacts(artifactsWithVotes)
    } catch (error) {
      console.error('Error fetching artifacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { count: artifactCount } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact', head: true })

      // Get total number of users (signups) from auth.users
      const { count: teacherCount } = await supabase
        .from('artifacts')
        .select('user_id', { count: 'exact', head: true })
        
      // Get unique contributors for comparison
      const { data: contributors } = await supabase
        .from('artifacts')
        .select('user_id')

      const uniqueContributors = new Set(contributors?.map(a => a.user_id) || [])

      setStats({
        artifactCount: artifactCount || 0,
        contributorCount: uniqueContributors.size,
        teacherCount: uniqueContributors.size // Using contributors as proxy since we can't access auth.users directly
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const featuredArtifacts = topArtifacts.slice(0, 3)
  const activeArtifact = featuredArtifacts[activeAppletIndex] || {}

  // Get emoji or first letter for display
  const getDisplayEmoji = (artifact) => {
    // Try to extract emoji from title or use first letter
    const emojiMatch = artifact.title?.match(/[\p{Emoji}]/u)
    if (emojiMatch) return emojiMatch[0]
    return artifact.title?.charAt(0).toUpperCase() || '📚'
  }

  // Get color based on subject
  const getSubjectColor = (subjects) => {
    if (!subjects || subjects.length === 0) return 'bg-#2C5F2D'
    const subject = subjects[0]
    
    const colorMap = {
      'Physics': 'bg-blue-500',
      'Mathematics': 'bg-amber-500',
      'Biology': 'bg-emerald-500',
      'Chemistry': 'bg-purple-500',
      'English': 'bg-pink-500',
      'Computer Science': 'bg-#2C5F2D'
    }
    
    return colorMap[subject] || 'bg-#2C5F2D'
  }

  const getSubjectColorLight = (subjects) => {
    if (!subjects || subjects.length === 0) return 'bg-indigo-50/40'
    const subject = subjects[0]
    
    const colorMap = {
      'Physics': 'bg-blue-50/40',
      'Mathematics': 'bg-amber-50/40',
      'Biology': 'bg-emerald-50/40',
      'Chemistry': 'bg-purple-50/40',
      'English': 'bg-pink-50/40',
      'Computer Science': 'bg-indigo-50/40'
    }
    
    return colorMap[subject] || 'bg-indigo-50/40'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F1E8',
      color: '#1A1A1A',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
        .animate-blink { animation: blink 1s step-end infinite; }
      `}} />

      {/* Hero Section */}
      <main style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px 80px',
        position: 'relative'
      }}>
        {/* Animated background glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '800px',
          aspectRatio: '1',
          background: getSubjectColorLight(activeArtifact.subjects),
          borderRadius: '50%',
          filter: 'blur(120px)',
          zIndex: -1,
          transition: 'background 1s'
        }} />

        <div style={{
          maxWidth: '1024px',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: '#E8E1D0',
            border: '1px solid #E8E1D0',
            borderRadius: '24px',
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#6B7280',
            margin: '0 auto 16px',
            width: 'fit-content'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              background: '#2C5F2D',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
              transition: 'background 1s'
            }} />
            Curriculum-Mapped AI Resources
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: 'clamp(32px, 8vw, 96px)',
            fontWeight: 'bold',
            letterSpacing: '-0.02em',
            lineHeight: '1',
            marginBottom: '0'
          }}>
            Teaching resources <br />
            <span style={{
              color: '#2C5F2D',
              fontFamily: 'monospace',
              display: 'inline-block',
              minWidth: '300px'
            }}>
              {typewriterText}
              <span style={{
                display: 'inline-block',
                width: '3px',
                height: '0.8em',
                background: '#2C5F2D',
                marginLeft: '4px',
                verticalAlign: 'middle'
              }} className="animate-blink" />
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(16px, 3vw, 24px)',
            color: '#6B7280',
            maxWidth: '672px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '500',
            padding: '0 16px'
          }}>
            The professional workspace for teacher-coded resources. Manage, rank, and deploy curriculum-mapped AI tools in a unified interface.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            paddingTop: '24px'
          }}>
            <button 
              onClick={onSignUpClick}
              style={{
                padding: '16px 40px',
                background: 'black',
                color: 'white',
                borderRadius: '24px',
                fontWeight: 'bold',
                fontSize: 'clamp(16px, 2vw, 18px)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'black'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Browse & Search Artifacts
              <span>→</span>
            </button>
            <button 
              onClick={() => {
                document.getElementById('info-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
              style={{
                padding: '16px 40px',
                background: 'white',
                color: '#1A1A1A',
                border: '2px solid #E8E1D0',
                borderRadius: '24px',
                fontWeight: 'bold',
                fontSize: 'clamp(16px, 2vw, 18px)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F7F7F5'
                e.currentTarget.style.borderColor = '#2C5F2D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#E8E1D0'
              }}
            >
              Find Out More
            </button>
          </div>

          {/* Featured Resource Window */}
          {!loading && featuredArtifacts.length > 0 && (
            <div style={{
              marginTop: 'clamp(48px, 10vw, 80px)',
              position: 'relative',
              maxWidth: '900px',
              width: '100%',
              margin: '80px auto 0',
              padding: '0 16px'
            }}>
              {/* Desktop Window Chrome */}
              <div style={{
                position: 'relative',
                background: '#F0F0F0',
                border: '1px solid #E0E0E0',
                borderRadius: 'clamp(32px, 5vw, 80px)',
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(0,0,0,0.25), 0 10px 20px rgba(0,0,0,0.15)'
              }}>
                {/* Window Title Bar */}
                <div style={{
                  height: 'clamp(48px, 6vw, 72px)',
                  background: '#F0F0F0',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 clamp(20px, 4vw, 32px)'
                }}>
                  {/* Traffic Lights */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                      width: 'clamp(14px, 2vw, 18px)',
                      height: 'clamp(14px, 2vw, 18px)',
                      borderRadius: '50%',
                      background: '#EC6A5E',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }} />
                    <div style={{
                      width: 'clamp(14px, 2vw, 18px)',
                      height: 'clamp(14px, 2vw, 18px)',
                      borderRadius: '50%',
                      background: '#F4BF4F',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }} />
                    <div style={{
                      width: 'clamp(14px, 2vw, 18px)',
                      height: 'clamp(14px, 2vw, 18px)',
                      borderRadius: '50%',
                      background: '#61C554',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }} />
                  </div>
                </div>

                {/* Window Content with padding */}
                <div style={{
                  background: '#F5F5F5',
                  padding: 'clamp(12px, 2vw, 20px)',
                  aspectRatio: '16/9'
                }}>
                  <div style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 'clamp(8px, 1.5vw, 12px)',
                    border: '1px solid #E8E1D0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                  {featuredArtifacts.map((artifact, idx) => (
                    <div 
                      key={artifact.id}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: activeAppletIndex === idx ? 1 : 0,
                        transform: activeAppletIndex === idx ? 'scale(1)' : 'scale(0.98)',
                        transition: 'all 0.7s ease-in-out',
                        pointerEvents: activeAppletIndex === idx ? 'auto' : 'none',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Screenshot fills entire area with hazy background - CLICKABLE */}
                      <a 
                        href={artifact.artifact_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'block',
                          cursor: 'pointer',
                          textDecoration: 'none'
                        }}
                      >
                        {artifact.screenshot_url ? (
                          <>
                            {/* Blurred background layer - fills entire space */}
                            <div style={{
                              position: 'absolute',
                              inset: '-20px',
                              backgroundImage: `url(${artifact.screenshot_url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              filter: 'blur(20px) brightness(1.1)',
                              opacity: '0.4',
                              zIndex: 0,
                              transition: 'opacity 0.3s'
                            }} />
                            {/* Actual screenshot - contained within */}
                            <img 
                              src={artifact.screenshot_url} 
                              alt={artifact.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                position: 'relative',
                                zIndex: 1,
                                padding: 'clamp(12px, 2vw, 24px)',
                                transition: 'transform 0.3s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                          </>
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#F9F9F9',
                            fontSize: 'clamp(80px, 12vw, 120px)'
                          }}>
                            {getDisplayEmoji(artifact)}
                          </div>
                        )}
                      </a>

                      {/* Title bar overlay at bottom */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(10px)',
                        borderTop: '1px solid #E8E1D0',
                        padding: 'clamp(12px, 2vw, 20px) clamp(16px, 3vw, 32px)',
                        position: 'relative',
                        zIndex: 2
                      }}>
                        <h3 style={{
                          fontSize: 'clamp(16px, 2.5vw, 28px)',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          color: '#1A1A1A',
                          margin: 0,
                          lineHeight: '1.3',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          {artifact.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </div>

              {/* Floating Stats Card - Right */}
              {activeArtifact.voteCount !== undefined && (
                <div className="animate-bounce-slow" style={{
                  position: 'absolute',
                  right: 'clamp(-16px, -5vw, -48px)',
                  top: 'clamp(60px, 10vw, 100px)',
                  background: 'white',
                  border: '1px solid #E8E1D0',
                  padding: 'clamp(16px, 4vw, 28px)',
                  borderRadius: 'clamp(16px, 3vw, 24px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  minWidth: 'clamp(120px, 20vw, 180px)',
                  textAlign: 'left',
                  display: window.innerWidth < 640 ? 'none' : 'block'
                }}>
                  <div style={{
                    fontSize: 'clamp(10px, 1.5vw, 12px)',
                    fontWeight: 'black',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '6px'
                  }}>
                    Community Votes
                  </div>
                  <div style={{
                    fontSize: 'clamp(28px, 5vw, 40px)',
                    fontWeight: 'black',
                    letterSpacing: '-0.02em',
                    marginBottom: '8px'
                  }}>
                    {activeArtifact.voteCount || 0}
                  </div>
                  <div style={{
                    fontSize: 'clamp(10px, 1.5vw, 12px)',
                    fontWeight: 'bold',
                    color: '#2C5F2D',
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                  }}>
                    {activeArtifact.subjects?.[0] || 'General'}
                  </div>
                  <div style={{
                    fontSize: 'clamp(9px, 1.3vw, 11px)',
                    fontWeight: '600',
                    color: '#6B7280',
                    textTransform: 'uppercase'
                  }}>
                    {activeArtifact.keyStages?.[0] || 'Multi-level'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination Dots */}
          {featuredArtifacts.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '32px'
            }}>
              {featuredArtifacts.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveAppletIndex(idx)}
                  style={{
                    height: '6px',
                    width: activeAppletIndex === idx ? '32px' : '8px',
                    background: activeAppletIndex === idx ? 'black' : '#E8E1D0',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    transition: 'all 0.5s',
                    padding: 0
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Information Section */}
      <section id="info-section" style={{
        background: '#FFFFFF',
        padding: 'clamp(64px, 12vw, 120px) 16px',
        borderTop: '1px solid #E8E1D0'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {/* Section Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'clamp(48px, 8vw, 80px)'
          }}>
            <h2 style={{
              fontSize: 'clamp(32px, 6vw, 56px)',
              fontWeight: 'bold',
              letterSpacing: '-0.02em',
              marginBottom: '16px',
              color: '#1A1A1A'
            }}>
              The Tools Are Changing
            </h2>
            <p style={{
              fontSize: 'clamp(16px, 3vw, 20px)',
              color: '#6B7280',
              maxWidth: '800px',
              margin: '0 auto 24px',
              lineHeight: '1.7'
            }}>
              The tools at teachers' disposal are rapidly evolving. AI is enabling educators to build interactive, personalized learning experiences that were impossible just months ago.
            </p>
            <p style={{
              fontSize: 'clamp(16px, 3vw, 20px)',
              color: '#6B7280',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.7'
            }}>
              TeacherVibes is where UK secondary teachers join a growing movement—creating, sharing, and discovering interactive learning activities built by educators, for educators.
            </p>
          </div>

          {/* How It Works */}
          <div style={{
            background: '#F5F1E8',
            padding: 'clamp(40px, 7vw, 64px)',
            borderRadius: '20px',
            border: '1px solid #E8E1D0',
            marginBottom: 'clamp(64px, 10vw, 100px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 'clamp(32px, 6vw, 48px)',
              color: '#1A1A1A'
            }}>
              How TeacherVibes Works
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'clamp(32px, 5vw, 48px)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#2C5F2D',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: '0 auto 16px'
                }}>
                  1
                </div>
                <h4 style={{
                  fontSize: 'clamp(16px, 2.5vw, 18px)',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#1A1A1A'
                }}>
                  Discover
                </h4>
                <p style={{
                  fontSize: 'clamp(13px, 2vw, 15px)',
                  color: '#6B7280',
                  lineHeight: '1.5'
                }}>
                  Browse interactive learning activities created by teachers across subjects and key stages
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#2C5F2D',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: '0 auto 16px'
                }}>
                  2
                </div>
                <h4 style={{
                  fontSize: 'clamp(16px, 2.5vw, 18px)',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#1A1A1A'
                }}>
                  Try & Vote
                </h4>
                <p style={{
                  fontSize: 'clamp(13px, 2vw, 15px)',
                  color: '#6B7280',
                  lineHeight: '1.5'
                }}>
                  Test artifacts live and vote to help the community surface the most effective resources
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#2C5F2D',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: '0 auto 16px'
                }}>
                  3
                </div>
                <h4 style={{
                  fontSize: 'clamp(16px, 2.5vw, 18px)',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#1A1A1A'
                }}>
                  Build & Share
                </h4>
                <p style={{
                  fontSize: 'clamp(13px, 2vw, 15px)',
                  color: '#6B7280',
                  lineHeight: '1.5'
                }}>
                  Create your own interactive tools with AI and share them with fellow educators
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div style={{
            textAlign: 'center',
            padding: 'clamp(48px, 8vw, 72px) clamp(24px, 5vw, 48px)'
          }}>
            <h3 style={{
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#1A1A1A'
            }}>
              Join the Movement
            </h3>
            <p style={{
              fontSize: 'clamp(16px, 3vw, 20px)',
              marginBottom: '32px',
              color: '#6B7280',
              maxWidth: '600px',
              margin: '0 auto 32px',
              lineHeight: '1.6'
            }}>
              Be part of a community of teachers building the next generation of interactive learning activities.
            </p>
            <button 
              onClick={onSignUpClick}
              style={{
                padding: '18px 48px',
                background: 'black',
                color: 'white',
                borderRadius: '24px',
                fontWeight: 'bold',
                fontSize: 'clamp(16px, 2.5vw, 18px)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
              }}
            >
              Sign Up Free →
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        borderTop: '1px solid #E8E1D0',
        padding: 'clamp(48px, 8vw, 64px) 16px',
        textAlign: 'center',
        background: '#F5F1E8'
      }}>
        <div style={{
          maxWidth: '1024px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px'
        }}>
          <div>
            <div style={{
              fontSize: 'clamp(32px, 6vw, 48px)',
              fontWeight: 'black',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
              color: '#2C5F2D'
            }}>
              {stats.artifactCount}
            </div>
            <div style={{
              fontSize: 'clamp(10px, 2vw, 12px)',
              fontWeight: 'bold',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Live Artifacts
            </div>
          </div>
          <div>
            <div style={{
              fontSize: 'clamp(32px, 6vw, 48px)',
              fontWeight: 'black',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
              color: '#2C5F2D'
            }}>
              {stats.contributorCount}
            </div>
            <div style={{
              fontSize: 'clamp(10px, 2vw, 12px)',
              fontWeight: 'bold',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Teachers
            </div>
          </div>
          <div>
            <div style={{
              fontSize: 'clamp(32px, 6vw, 48px)',
              fontWeight: 'black',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
              color: '#2C5F2D'
            }}>
              {topArtifacts.reduce((sum, a) => sum + (a.voteCount || 0), 0)}
            </div>
            <div style={{
              fontSize: 'clamp(10px, 2vw, 12px)',
              fontWeight: 'bold',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Community Votes
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 16px',
        textAlign: 'center',
        borderTop: '1px solid #E8E1D0',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        background: '#FFFFFF'
      }}>
        TeacherVibes • Built by Teachers, Powered by AI • 2026
      </footer>
    </div>
  )
}