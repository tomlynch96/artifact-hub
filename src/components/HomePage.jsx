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
      
      // Refresh artifacts to update vote count
      fetchArtifacts()
    } catch (error) {
      console.error('Error voting:', error)
      alert('You may have already voted for this artifact')
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading artifacts...</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Teacher Artifact Library</h1>
      <p>Discover and share Claude-created teaching resources</p>

      <div style={{ marginTop: '30px' }}>
        <h2>All Artifacts</h2>
        {artifacts.length === 0 ? (
          <p>No artifacts yet. Be the first to submit one!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {artifacts.map((artifact) => (
              <div key={artifact.id} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                backgroundColor: '#f9f9f9'
              }}>
                {artifact.screenshot_url && (
                  <img 
                    src={artifact.screenshot_url} 
                    alt={artifact.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                )}
                <h3>{artifact.title}</h3>
                {artifact.description && <p>{artifact.description}</p>}
                
                <div style={{ marginTop: '10px' }}>
                  {artifact.artifact_subjects?.map((s, i) => (
                    <span key={i} style={{ 
                      display: 'inline-block',
                      backgroundColor: '#e0e0e0',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginRight: '5px'
                    }}>
                      {s.subject}
                    </span>
                  ))}
                  {artifact.artifact_key_stages?.map((k, i) => (
                    <span key={i} style={{ 
                      display: 'inline-block',
                      backgroundColor: '#c0c0c0',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginRight: '5px'
                    }}>
                      {k.key_stage}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a 
                    href={artifact.artifact_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'blue', textDecoration: 'underline' }}
                  >
                    View Artifact →
                  </a>
                  <button 
                    onClick={() => handleVote(artifact.id)}
                    style={{ padding: '5px 10px' }}
                  >
                    ⬆️ {artifact.votes || 0}
                  </button>
                </div>

                {artifact.first_prompt && (
                  <details style={{ marginTop: '10px', fontSize: '14px' }}>
                    <summary style={{ cursor: 'pointer' }}>Original Prompt</summary>
                    <p style={{ marginTop: '5px', fontStyle: 'italic' }}>{artifact.first_prompt}</p>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}