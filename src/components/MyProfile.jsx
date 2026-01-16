import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import EditArtifactModal from './EditArtifactModal'

export default function MyProfile() {
  const { user } = useAuth()
  const [myArtifacts, setMyArtifacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingArtifact, setEditingArtifact] = useState(null)

  useEffect(() => {
    if (user) {
      fetchMyArtifacts()
    }
  }, [user])

  const fetchMyArtifacts = async () => {
    try {
      const { data: artifactsData, error } = await supabase
        .from('artifacts')
        .select(`
          *,
          artifact_subjects (subject),
          artifact_key_stages (key_stage)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

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

      setMyArtifacts(artifactsWithVotes)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching my artifacts:', error)
      setLoading(false)
    }
  }

  const handleDelete = async (artifactId) => {
    if (!window.confirm('Are you sure you want to delete this artifact? This cannot be undone.')) {
      return
    }

    try {
      // Delete associated records first
      await supabase.from('votes').delete().eq('artifact_id', artifactId)
      await supabase.from('favorites').delete().eq('artifact_id', artifactId)
      await supabase.from('artifact_subjects').delete().eq('artifact_id', artifactId)
      await supabase.from('artifact_key_stages').delete().eq('artifact_id', artifactId)
      
      // Delete the artifact
      const { error } = await supabase
        .from('artifacts')
        .delete()
        .eq('id', artifactId)

      if (error) throw error

      // Refresh the list
      fetchMyArtifacts()
    } catch (error) {
      console.error('Error deleting artifact:', error)
      alert('Error deleting artifact. Please try again.')
    }
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '60px 24px', 
        textAlign: 'center',
        color: 'var(--text-grey)'
      }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          animation: 'spin 1s linear infinite'
        }}>
          ⚙️
        </div>
        Loading your artifacts...
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: 'clamp(24px, 4vw, 48px)'
    }}>
      {/* Profile Header */}
      <div style={{
        marginBottom: '48px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-light) 100%)',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          margin: '0 auto 24px',
          boxShadow: 'var(--shadow-md)'
        }}>
          👤
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: 'var(--text-dark)'
        }}>
          My Profile
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 2.5vw, 18px)',
          color: 'var(--text-grey)',
          marginBottom: '8px'
        }}>
          {user?.email}
        </p>
        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 'bold',
              color: 'var(--primary-green)'
            }}>
              {myArtifacts.length}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-grey)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: '600'
            }}>
              Artifacts
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 'bold',
              color: 'var(--primary-green)'
            }}>
              {myArtifacts.reduce((sum, a) => sum + a.voteCount, 0)}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-grey)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: '600'
            }}>
              Total Votes
            </div>
          </div>
        </div>
      </div>

      {/* Artifacts Section */}
      <div>
        <h2 style={{
          fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: 'bold',
          marginBottom: '24px',
          color: 'var(--text-dark)'
        }}>
          Your Artifacts
        </h2>

        {myArtifacts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--background-white)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: '0.3' }}>
              📦
            </div>
            <h3 style={{
              fontSize: 'clamp(20px, 3vw, 28px)',
              marginBottom: '12px',
              color: 'var(--text-dark)'
            }}>
              No artifacts yet
            </h3>
            <p style={{
              color: 'var(--text-grey)',
              marginBottom: '24px',
              fontSize: '16px'
            }}>
              Share your first interactive learning resource with the community!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))',
            gap: 'var(--space-8)',
            width: '100%'
          }}>
            {myArtifacts.map((artifact) => (
              <div key={artifact.id} className="card">
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                  <img
                    src={artifact.screenshot_url}
                    alt={artifact.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '12px 12px 0 0',
                      marginBottom: '16px'
                    }}
                  />

                  <h3 style={{
                    fontSize: 'clamp(18px, 3vw, 22px)',
                    marginBottom: '12px',
                    fontWeight: '700',
                    color: 'var(--text-dark)',
                    lineHeight: '1.3'
                  }}>
                    {artifact.title}
                  </h3>

                  {artifact.description && (
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--text-grey)',
                      lineHeight: '1.6',
                      marginBottom: '16px'
                    }}>
                      {artifact.description.substring(0, 120)}
                      {artifact.description.length > 120 && '...'}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    {artifact.artifact_subjects?.map((s, idx) => (
                      <span key={idx} className="tag">
                        {s.subject}
                      </span>
                    ))}
                    {artifact.artifact_key_stages?.map((k, idx) => (
                      <span key={idx} className="tag key-stage">
                        {k.key_stage}
                      </span>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: 'auto',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-grey)',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      ⬆️ {artifact.voteCount}
                    </div>

                    <a
                      href={artifact.artifact_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 16px',
                        background: 'var(--background-cream)',
                        color: 'var(--text-dark)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        border: '1px solid var(--border-color)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--primary-green)'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--background-cream)'
                        e.currentTarget.style.color = 'var(--text-dark)'
                      }}
                    >
                      View
                    </a>

                    <button
                      onClick={() => setEditingArtifact(artifact)}
                      style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: 'var(--text-grey)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary-green)'
                        e.currentTarget.style.color = 'var(--primary-green)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)'
                        e.currentTarget.style.color = 'var(--text-grey)'
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(artifact.id)}
                      style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: 'var(--error-red)',
                        border: '1px solid var(--error-red)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--error-red)'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--error-red)'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingArtifact && (
        <EditArtifactModal
          artifact={editingArtifact}
          onClose={() => setEditingArtifact(null)}
          onSuccess={() => {
            setEditingArtifact(null)
            fetchMyArtifacts()
          }}
        />
      )}
    </div>
  )
}