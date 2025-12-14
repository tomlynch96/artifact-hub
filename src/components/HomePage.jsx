import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function HomePage() {
  const [artifacts, setArtifacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArtifacts()
  }, [])

  const fetchArtifacts = async () => {
    try {
      const { data, error } = await supabase
        .from('artifacts')
        .select(`
          *,
          artifact_subjects(subject),
          artifact_key_stages(key_stage),
          votes(id)
        `)
        .order('created_at', { ascending: false })
  
      if (error) throw error
      
      // Count votes for each artifact
      const artifactsWithVoteCounts = data?.map(artifact => ({
        ...artifact,
        voteCount: artifact.votes?.length || 0
      })) || []
      
      setArtifacts(artifactsWithVoteCounts)
    } catch (error) {
      console.error('Error fetching artifacts:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleVote = async (artifactId) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        alert('You must be logged in to vote')
        return
      }
  
      // Check if user already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('artifact_id', artifactId)
        .eq('user_id', user.id)
        .maybeSingle()
  
      if (checkError) {
        console.error('Error checking existing vote:', checkError)
        throw checkError
      }
  
      if (existingVote) {
        // User already voted, so remove the vote (toggle behavior)
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('artifact_id', artifactId)
          .eq('user_id', user.id)
        
        if (deleteError) {
          console.error('Error deleting vote:', deleteError)
          throw deleteError
        }
      } else {
        // User hasn't voted, add a vote
        const { error: insertError } = await supabase
          .from('votes')
          .insert({ 
            artifact_id: artifactId,
            user_id: user.id
          })
  
        if (insertError) {
          console.error('Error inserting vote:', insertError)
          throw insertError
        }
      }
      
      // Refresh artifacts to update vote count
      fetchArtifacts()
    } catch (error) {
      console.error('Full error:', error)
      alert(`Error updating vote: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 20px',
        fontSize: '18px',
        color: '#6B7280'
      }}>
        Loading artifacts...
      </div>
    )
  }

  return (
    <div>
      <div className="hero">
        <h1>Teacher Artifact Library</h1>
        <p>Discover and share Claude-created teaching resources for UK secondary education</p>
      </div>

      <div className="page-section">
        <div className="container">
          {artifacts.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: 'white',
              borderRadius: '16px',
              maxWidth: '600px',
              margin: '0 auto',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px', opacity: '0.3' }}>
                📚
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', marginBottom: '16px', color: '#1F2937', fontWeight: '700' }}>
                No artifacts yet
              </h2>
              <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: '1.6' }}>
                Be the first to share a Claude-created teaching resource!
              </p>
            </div>
          ) : (
            <>
              <div className="section-header">
                <h2 className="section-title">Recent Artifacts</h2>
                <p className="section-subtitle">
                  {artifacts.length} {artifacts.length === 1 ? 'resource' : 'resources'} shared by teachers
                </p>
              </div>
              
              <div className="artifact-grid">
                {artifacts.map((artifact) => (
                  <div 
                    key={artifact.id} 
                    className="card"
                    style={{ 
                      padding: '0',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                    {artifact.screenshot_url && (
                      <div style={{ 
                        width: '100%', 
                        height: '200px',
                        overflow: 'hidden',
                        background: '#F3F4F6'
                      }}>
                        <img 
                          src={artifact.screenshot_url} 
                          alt={artifact.title}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.3s'
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ 
                        fontSize: 'clamp(18px, 3vw, 22px)', 
                        marginBottom: '12px',
                        color: '#1F2937',
                        fontWeight: '700',
                        lineHeight: '1.3'
                      }}>
                        {artifact.title}
                      </h3>
                      
                      {artifact.description && (
                        <p style={{ 
                          color: '#4B5563', 
                          marginBottom: '16px',
                          fontSize: 'clamp(14px, 2vw, 15px)',
                          lineHeight: '1.6',
                          flexGrow: 1
                        }}>
                          {artifact.description.length > 120 
                            ? artifact.description.substring(0, 120) + '...' 
                            : artifact.description}
                        </p>
                      )}
                      
                      <div style={{ marginBottom: '16px', minHeight: '30px' }}>
                        {artifact.artifact_key_stages?.map((k, i) => (
                          <span key={i} className="tag key-stage">
                            {k.key_stage}
                          </span>
                        ))}
                        {artifact.artifact_subjects?.slice(0, 2).map((s, i) => (
                          <span key={i} className="tag">
                            {s.subject}
                          </span>
                        ))}
                        {artifact.artifact_subjects?.length > 2 && (
                          <span className="tag" style={{ background: '#9CA3AF' }}>
                            +{artifact.artifact_subjects.length - 2}
                          </span>
                        )}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        paddingTop: '16px',
                        borderTop: '1px solid #E5E7EB',
                        marginTop: 'auto',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <a 
                          href={artifact.artifact_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          View Artifact →
                        </a>
                        <button 
                          onClick={() => handleVote(artifact.id)}
                          style={{ 
                            background: '#F9FAFB',
                            border: '2px solid #E5E7EB',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                        >
                          ⬆️ {artifact.voteCount || 0}
                        </button>
                      </div>

                      {artifact.first_prompt && (
                        <details style={{ marginTop: '16px' }}>
                          <summary style={{ 
                            cursor: 'pointer',
                            color: '#8B5CF6',
                            fontWeight: '600',
                            fontSize: '13px',
                            padding: '12px 0',
                            borderTop: '1px solid #E5E7EB'
                          }}>
                            💡 Original Prompt
                          </summary>
                          <p style={{ 
                            marginTop: '8px',
                            padding: '12px',
                            background: '#F9FAFB',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#4B5563',
                            fontStyle: 'italic',
                            lineHeight: '1.6',
                            borderLeft: '3px solid #8B5CF6'
                          }}>
                            "{artifact.first_prompt}"
                          </p>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}