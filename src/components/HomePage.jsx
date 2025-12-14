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
          artifact_key_stages(key_stage)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArtifacts(data || [])
    } catch (error) {
      console.error('Error fetching artifacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (artifactId) => {
    try {
      const { error } = await supabase
        .from('votes')
        .insert({ artifact_id: artifactId })

      if (error) throw error
      
      fetchArtifacts()
    } catch (error) {
      console.error('Error voting:', error)
      alert('You may have already voted for this artifact')
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

      <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        {artifacts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#1F2937' }}>
              No artifacts yet
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>
              Be the first to share a Claude-created teaching resource!
            </p>
            <button className="btn-primary">Submit Your First Artifact</button>
          </div>
        ) : (
          <div>
            <h2 style={{ 
              fontSize: '28px', 
              marginBottom: '30px', 
              color: '#1F2937',
              fontWeight: '700'
            }}>
              Recent Artifacts
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '24px' 
            }}>
              {artifacts.map((artifact) => (
                <div key={artifact.id} className="card">
                  {artifact.screenshot_url && (
                    <img 
                      src={artifact.screenshot_url} 
                      alt={artifact.title}
                      style={{ 
                        width: '100%', 
                        height: '200px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        marginBottom: '16px'
                      }}
                    />
                  )}
                  <h3 style={{ 
                    fontSize: '20px', 
                    marginBottom: '12px',
                    color: '#1F2937',
                    fontWeight: '600'
                  }}>
                    {artifact.title}
                  </h3>
                  
                  {artifact.description && (
                    <p style={{ 
                      color: '#6B7280', 
                      marginBottom: '16px',
                      fontSize: '15px',
                      lineHeight: '1.5'
                    }}>
                      {artifact.description}
                    </p>
                  )}
                  
                  <div style={{ marginBottom: '16px' }}>
                    {artifact.artifact_subjects?.map((s, i) => (
                      <span key={i} className="tag">
                        {s.subject}
                      </span>
                    ))}
                    {artifact.artifact_key_stages?.map((k, i) => (
                      <span key={i} className="tag key-stage">
                        {k.key_stage}
                      </span>
                    ))}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid #E5E7EB'
                  }}>
                    <a 
                      href={artifact.artifact_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '15px' }}
                    >
                      View Artifact →
                    </a>
                    <button 
                      onClick={() => handleVote(artifact.id)}
                      style={{ 
                        background: 'none',
                        border: '1px solid #E5E7EB',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ⬆️ {artifact.votes || 0}
                    </button>
                  </div>

                  {artifact.first_prompt && (
                    <details style={{ marginTop: '16px' }}>
                      <summary style={{ 
                        cursor: 'pointer',
                        color: '#8B5CF6',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        View Original Prompt
                      </summary>
                      <p style={{ 
                        marginTop: '12px',
                        padding: '12px',
                        background: '#F9FAFB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#4B5563',
                        fontStyle: 'italic',
                        lineHeight: '1.6'
                      }}>
                        {artifact.first_prompt}
                      </p>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}