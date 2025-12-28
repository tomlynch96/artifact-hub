import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import SearchFilterBar from './SearchFilterBar'
import EditArtifactModal from './EditArtifactModal'

export default function HomePage() {
  const { user } = useAuth()
  const [artifacts, setArtifacts] = useState([])
  const [filteredArtifacts, setFilteredArtifacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingArtifact, setEditingArtifact] = useState(null)

  useEffect(() => {
    fetchArtifacts()
  }, [])

  const fetchArtifacts = async () => {
    try {
      // Fetch artifacts with related data
      const { data: artifactsData, error } = await supabase
        .from('artifacts')
        .select(`
          *,
          artifact_subjects (subject),
          artifact_key_stages (key_stage)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch vote counts for each artifact
      const artifactsWithVotes = await Promise.all(
        artifactsData.map(async (artifact) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('artifact_id', artifact.id)

          // Check if current user has voted
          let userHasVoted = false
          if (user) {
            const { data: userVote } = await supabase
              .from('votes')
              .select('id')
              .eq('artifact_id', artifact.id)
              .eq('user_id', user.id)
              .single()
            userHasVoted = !!userVote
          }

          return {
            ...artifact,
            voteCount: count || 0,
            userHasVoted,
            isOwner: user && artifact.user_id === user.id
          }
        })
      )

      setArtifacts(artifactsWithVotes)
      setFilteredArtifacts(artifactsWithVotes)
    } catch (error) {
      console.error('Error fetching artifacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (filters) => {
    let filtered = [...artifacts]

    // Apply text search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      filtered = filtered.filter(artifact => 
        artifact.title.toLowerCase().includes(searchLower) ||
        artifact.description?.toLowerCase().includes(searchLower) ||
        artifact.first_prompt?.toLowerCase().includes(searchLower)
      )
    }

    // Apply subject filters
    if (filters.subjects.length > 0) {
      filtered = filtered.filter(artifact => {
        const artifactSubjects = artifact.artifact_subjects?.map(s => s.subject) || []
        return filters.subjects.some(subject => artifactSubjects.includes(subject))
      })
    }

    // Apply key stage filters
    if (filters.keyStages.length > 0) {
      filtered = filtered.filter(artifact => {
        const artifactKeyStages = artifact.artifact_key_stages?.map(k => k.key_stage) || []
        return filters.keyStages.some(keyStage => artifactKeyStages.includes(keyStage))
      })
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'most_voted':
        filtered.sort((a, b) => b.voteCount - a.voteCount)
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    setFilteredArtifacts(filtered)
  }

  const handleVote = async (artifactId) => {
    if (!user) {
      alert('Please log in to vote')
      return
    }

    try {
      const artifact = artifacts.find(a => a.id === artifactId)
      
      if (artifact.userHasVoted) {
        // Remove vote
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
        // Add vote
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

  const handleDelete = async (artifactId, artifactTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${artifactTitle}"? This cannot be undone.`)) {
      return
    }

    try {
      // Delete related records first (handled by cascade in DB, but being explicit)
      await supabase.from('artifact_subjects').delete().eq('artifact_id', artifactId)
      await supabase.from('artifact_key_stages').delete().eq('artifact_id', artifactId)
      await supabase.from('votes').delete().eq('artifact_id', artifactId)
      
      // Delete the artifact
      const { error } = await supabase
        .from('artifacts')
        .delete()
        .eq('id', artifactId)

      if (error) throw error

      alert('Artifact deleted successfully')
      fetchArtifacts()
    } catch (error) {
      console.error('Error deleting artifact:', error)
      alert(`Error deleting artifact: ${error.message}`)
    }
  }

  const handleEditSuccess = () => {
    setEditingArtifact(null)
    fetchArtifacts()
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
          {/* Search and Filter Bar */}
          <SearchFilterBar onFiltersChange={handleFiltersChange} />

          {filteredArtifacts.length === 0 ? (
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
                {artifacts.length === 0 ? '📚' : '🔍'}
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', marginBottom: '16px', color: '#1F2937', fontWeight: '700' }}>
                {artifacts.length === 0 ? 'No artifacts yet' : 'No matching artifacts'}
              </h2>
              <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: '1.6' }}>
                {artifacts.length === 0 
                  ? 'Be the first to share a Claude-created teaching resource!'
                  : 'Try adjusting your search or filters to find what you\'re looking for.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="section-header">
                <h2 className="section-title">
                  {filteredArtifacts.length === artifacts.length 
                    ? 'All Artifacts' 
                    : `${filteredArtifacts.length} ${filteredArtifacts.length === 1 ? 'Artifact' : 'Artifacts'} Found`
                  }
                </h2>
                <p className="section-subtitle">
                  {filteredArtifacts.length === artifacts.length 
                    ? `${artifacts.length} ${artifacts.length === 1 ? 'resource' : 'resources'} available`
                    : `Showing ${filteredArtifacts.length} of ${artifacts.length} total`
                  }
                </p>
              </div>

              <div className="grid">
                {filteredArtifacts.map((artifact) => (
                  <div key={artifact.id} className="card">
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%' 
                    }}>
                      {/* Owner Badge */}
                      {artifact.isOwner && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: '#EA580C',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          zIndex: 1
                        }}>
                          Your Post
                        </div>
                      )}

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
                        color: '#1F2937',
                        lineHeight: '1.3'
                      }}>
                        {artifact.title}
                      </h3>
                      
                      {artifact.description && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#6B7280', 
                          marginBottom: '16px',
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

                      {/* Edit/Delete Buttons for Owner */}
                      {artifact.isOwner && (
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          marginBottom: '12px',
                          paddingBottom: '12px',
                          borderBottom: '1px solid #E5E7EB'
                        }}>
                          <button
                            onClick={() => setEditingArtifact(artifact)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              background: '#FFF7ED',
                              border: '2px solid #EA580C',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              color: '#EA580C',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(artifact.id, artifact.title)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              background: '#FEE2E2',
                              border: '2px solid #EF4444',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              color: '#DC2626',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}

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
                            background: artifact.userHasVoted ? '#FFF7ED' : '#F9FAFB',
                            border: artifact.userHasVoted ? '2px solid #EA580C' : '2px solid #E5E7EB',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                            color: artifact.userHasVoted ? '#EA580C' : '#4B5563'
                          }}
                        >
                          ⬆️ {artifact.voteCount || 0}
                        </button>
                      </div>

                      {artifact.first_prompt && (
                        <details style={{ marginTop: '16px' }}>
                          <summary style={{ 
                            cursor: 'pointer',
                            color: '#EA580C',
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
                            borderLeft: '3px solid #EA580C'
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

      {/* Edit Modal */}
      {editingArtifact && (
        <EditArtifactModal
          artifact={editingArtifact}
          onClose={() => setEditingArtifact(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}