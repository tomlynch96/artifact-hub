// Add this comment at the top of your HomePage.jsx to indicate the hero has been removed

// UPDATED: Hero section removed for authenticated users - only shows on landing page

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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  useEffect(() => {
    fetchArtifacts()
  }, [])

  const fetchArtifacts = async () => {
    try {
      const { data: artifactsData, error } = await supabase
        .from('artifacts')
        .select(`
          *,
          artifact_subjects (subject),
          artifact_key_stages (key_stage)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const artifactsWithVotes = await Promise.all(
        artifactsData.map(async (artifact) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('artifact_id', artifact.id)

          let userHasVoted = false
          let userHasFavorited = false
          let favoriteCount = 0

          if (user) {
            const { data: userVote } = await supabase
              .from('votes')
              .select('id')
              .eq('artifact_id', artifact.id)
              .eq('user_id', user.id)
              .single()
            userHasVoted = !!userVote

            // Check if user favorited this artifact
            const { data: userFavorite } = await supabase
              .from('favorites')
              .select('id')
              .eq('artifact_id', artifact.id)
              .eq('user_id', user.id)
              .single()
            userHasFavorited = !!userFavorite
          }

          // Get favorite count
          const { count: favCount } = await supabase
            .from('favorites')
            .select('*', { count: 'exact', head: true })
            .eq('artifact_id', artifact.id)
          favoriteCount = favCount || 0

          return {
            ...artifact,
            voteCount: count || 0,
            userHasVoted,
            userHasFavorited,
            favoriteCount,
            isOwner: artifact.user_id === user?.id
          }
        })
      )

      setArtifacts(artifactsWithVotes)
      setFilteredArtifacts(artifactsWithVotes)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching artifacts:', error)
      setLoading(false)
    }
  }

  const handleVote = async (artifactId, currentlyVoted) => {
    if (!user) return

    try {
      if (currentlyVoted) {
        await supabase
          .from('votes')
          .delete()
          .eq('artifact_id', artifactId)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('votes')
          .insert({
            artifact_id: artifactId,
            user_id: user.id
          })
      }
      
      fetchArtifacts()
    } catch (error) {
      console.error('Error voting:', error)
      alert('Error updating vote. Please try again.')
    }
  }

  const handleFavorite = async (artifactId, currentlyFavorited) => {
    if (!user) return

    try {
      if (currentlyFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('artifact_id', artifactId)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('favorites')
          .insert({
            artifact_id: artifactId,
            user_id: user.id
          })
      }
      
      fetchArtifacts()
    } catch (error) {
      console.error('Error updating favorite:', error)
      alert('Error updating favorite. Please try again.')
    }
  }

  const handleFiltersChange = (filters) => {
    let filtered = [...artifacts]

    // Apply favorites filter first
    if (showFavoritesOnly) {
      filtered = filtered.filter(artifact => artifact.userHasFavorited)
    }

    // Apply search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      filtered = filtered.filter(artifact =>
        artifact.title.toLowerCase().includes(searchLower) ||
        artifact.description?.toLowerCase().includes(searchLower) ||
        artifact.first_prompt?.toLowerCase().includes(searchLower)
      )
    }

    // Apply subject filter
    if (filters.subjects && filters.subjects.length > 0) {
      filtered = filtered.filter(artifact =>
        artifact.artifact_subjects?.some(s =>
          filters.subjects.includes(s.subject)
        )
      )
    }

    // Apply key stage filter
    if (filters.keyStages && filters.keyStages.length > 0) {
      filtered = filtered.filter(artifact =>
        artifact.artifact_key_stages?.some(k =>
          filters.keyStages.includes(k.key_stage)
        )
      )
    }

    // Apply sorting
    if (filters.sortBy === 'most_voted') {
      filtered.sort((a, b) => b.voteCount - a.voteCount)
    } else if (filters.sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      // 'newest' - already sorted by created_at from database
    }

    setFilteredArtifacts(filtered)
  }

  // Apply initial filter on mount and when artifacts or showFavoritesOnly changes
  useEffect(() => {
    handleFiltersChange({ 
      searchText: '', 
      subjects: [], 
      keyStages: [], 
      sortBy: 'newest' 
    })
  }, [artifacts, showFavoritesOnly])

  const handleDelete = async (artifactId) => {
    if (!window.confirm(`Are you sure you want to delete this artifact? This cannot be undone.`)) {
      return
    }

    try {
      await supabase.from('artifact_subjects').delete().eq('artifact_id', artifactId)
      await supabase.from('artifact_key_stages').delete().eq('artifact_id', artifactId)
      await supabase.from('votes').delete().eq('artifact_id', artifactId)
      
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
        color: 'var(--text-gray)'
      }}>
        Loading artifacts...
      </div>
    )
  }

  return (
    <div>
      {/* HERO SECTION REMOVED - Now only on landing page for non-authenticated users */}
      
      <div className="page-section" style={{ paddingTop: 'var(--space-12)' }}>
        <div className="container">
          <SearchFilterBar 
            onFiltersChange={handleFiltersChange} 
          />

          {artifacts.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: 'var(--background-white)',
              borderRadius: '16px',
              maxWidth: '600px',
              margin: '0 auto',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px', opacity: '0.3' }}>
                📚
              </div>
              <h2 style={{ 
                fontSize: 'clamp(24px, 4vw, 32px)', 
                marginBottom: '16px', 
                color: 'var(--text-dark)', 
                fontWeight: '700' 
              }}>
                No artifacts yet
              </h2>
              <p style={{ 
                color: 'var(--text-gray)', 
                marginBottom: '32px', 
                fontSize: 'clamp(16px, 2vw, 18px)', 
                lineHeight: '1.6' 
              }}>
                Be the first to share a Claude-created teaching resource!
              </p>
            </div>
          ) : (
            <>
              <div className="section-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-8)'
              }}>
                <div>
                  <h2 className="section-title">
                    {showFavoritesOnly 
                      ? 'My Favorites'
                      : (filteredArtifacts.length === artifacts.length 
                        ? 'All Artifacts' 
                        : `${filteredArtifacts.length} ${filteredArtifacts.length === 1 ? 'Artifact' : 'Artifacts'} Found`)
                    }
                  </h2>
                  <p className="section-subtitle">
                    {showFavoritesOnly
                      ? `${filteredArtifacts.length} ${filteredArtifacts.length === 1 ? 'favorite' : 'favorites'}`
                      : (filteredArtifacts.length === artifacts.length 
                        ? `${artifacts.length} ${artifacts.length === 1 ? 'resource' : 'resources'} available`
                        : `Showing ${filteredArtifacts.length} of ${artifacts.length} total`)
                    }
                  </p>
                </div>

                {/* Favorites Toggle as Tabs - Always visible */}
                <div className="favorites-toggle">
                  <button
                    onClick={() => setShowFavoritesOnly(false)}
                    className={!showFavoritesOnly ? 'active' : ''}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setShowFavoritesOnly(true)}
                    className={showFavoritesOnly ? 'active' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>❤️</span> Favorites
                  </button>
                </div>
              </div>

              {filteredArtifacts.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  background: 'var(--background-white)',
                  borderRadius: '16px',
                  maxWidth: '600px',
                  margin: '0 auto',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px', opacity: '0.3' }}>
                    {showFavoritesOnly ? '❤️' : '🔍'}
                  </div>
                  <h2 style={{ 
                    fontSize: 'clamp(24px, 4vw, 32px)', 
                    marginBottom: '16px', 
                    color: 'var(--text-dark)', 
                    fontWeight: '700' 
                  }}>
                    {showFavoritesOnly ? 'No favorites yet' : 'No matching artifacts'}
                  </h2>
                  <p style={{ 
                    color: 'var(--text-gray)', 
                    marginBottom: '32px', 
                    fontSize: 'clamp(16px, 2vw, 18px)', 
                    lineHeight: '1.6' 
                  }}>
                    {showFavoritesOnly 
                      ? 'Click the heart icon on any artifact to add it to your favorites!'
                      : 'Try adjusting your search or filters to find what you\'re looking for.'
                    }
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))',
                  gap: 'var(--space-8)',
                  width: '100%'
                }}>
                  {filteredArtifacts.map((artifact) => (
                  <div key={artifact.id} className="card">
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%' 
                    }}>
                      {artifact.isOwner && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'var(--tag-owner-bg)',
                          color: 'var(--tag-owner-text)',
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
                        color: 'var(--text-dark)',
                        lineHeight: '1.3'
                      }}>
                        {artifact.title}
                      </h3>
                      
                      {artifact.description && (
                        <div style={{ marginBottom: '16px' }}>
                          <p style={{ 
                            fontSize: '14px', 
                            color: 'var(--text-gray)', 
                            lineHeight: '1.6',
                            flexGrow: 1,
                            marginBottom: artifact.description.length > 120 ? '8px' : '0'
                          }}>
                            {artifact.description.length > 120 
                              ? (
                                <>
                                  <span id={`desc-${artifact.id}`}>
                                    {artifact.description.substring(0, 120)}...
                                  </span>
                                  <span 
                                    id={`desc-full-${artifact.id}`}
                                    style={{ display: 'none' }}
                                  >
                                    {artifact.description}
                                  </span>
                                </>
                              )
                              : artifact.description
                            }
                          </p>
                          {artifact.description.length > 120 && (
                            <button
                              onClick={(e) => {
                                const shortDesc = document.getElementById(`desc-${artifact.id}`)
                                const fullDesc = document.getElementById(`desc-full-${artifact.id}`)
                                const button = e.currentTarget
                                
                                if (shortDesc.style.display === 'none') {
                                  // Show short version
                                  shortDesc.style.display = 'inline'
                                  fullDesc.style.display = 'none'
                                  button.textContent = 'Read more'
                                } else {
                                  // Show full version
                                  shortDesc.style.display = 'none'
                                  fullDesc.style.display = 'inline'
                                  button.textContent = 'Show less'
                                }
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-terracotta)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                padding: '0',
                                textDecoration: 'underline'
                              }}
                            >
                              Read more
                            </button>
                          )}
                        </div>
                      )}

                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        flexWrap: 'wrap',
                        marginBottom: '16px'
                      }}>
                        {artifact.artifact_key_stages?.map((k, i) => (
                          <span key={i} className="tag key-stage">
                            {k.key_stage}
                          </span>
                        ))}
                        {artifact.artifact_subjects?.map((s, i) => (
                          <span key={i} className="tag">
                            {s.subject}
                          </span>
                        ))}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        gap: '12px',
                        alignItems: 'center',
                        marginTop: 'auto'
                      }}>
                        <button
                          onClick={() => handleVote(artifact.id, artifact.userHasVoted)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: artifact.userHasVoted ? 'var(--vote-active-bg)' : 'var(--vote-default-bg)',
                            color: artifact.userHasVoted ? 'var(--vote-active-text)' : 'var(--vote-default-text)',
                            border: `2px solid ${artifact.userHasVoted ? 'var(--vote-active-border)' : 'var(--vote-default-border)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                        >
                          ⬆️ {artifact.voteCount}
                        </button>

                        <button
                          onClick={() => handleFavorite(artifact.id, artifact.userHasFavorited)}
                          title={artifact.userHasFavorited ? 'Remove from favorites' : 'Add to favorites'}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: artifact.userHasFavorited ? '#FFE5E5' : 'var(--background-white)',
                            color: artifact.userHasFavorited ? '#E63946' : 'var(--text-gray)',
                            border: `2px solid ${artifact.userHasFavorited ? '#E63946' : 'var(--border-color)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!artifact.userHasFavorited) {
                              e.currentTarget.style.borderColor = '#E63946'
                              e.currentTarget.style.color = '#E63946'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!artifact.userHasFavorited) {
                              e.currentTarget.style.borderColor = 'var(--border-color)'
                              e.currentTarget.style.color = 'var(--text-gray)'
                            }
                          }}
                        >
                          {artifact.userHasFavorited ? '❤️' : '♡'} {artifact.favoriteCount}
                        </button>

                        <a 
                          href={artifact.artifact_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{
                            textDecoration: 'none',
                            padding: '8px 16px',
                            fontSize: '14px',
                            flexGrow: 1,
                            textAlign: 'center'
                          }}
                        >
                          View Artifact
                        </a>
                      </div>

                      {artifact.first_prompt && (
                        <details style={{ marginTop: '16px' }}>
                          <summary style={{ 
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--primary-terracotta)',
                            padding: '8px 0'
                          }}>
                            Original Prompt
                          </summary>
                          <p style={{ 
                            fontSize: '13px',
                            color: 'var(--text-gray)',
                            marginTop: '8px',
                            padding: '12px',
                            background: 'var(--background-light-gray)',
                            borderRadius: '8px',
                            lineHeight: '1.6'
                          }}>
                            {artifact.first_prompt}
                          </p>
                        </details>
                      )}

                      {artifact.isOwner && (
                        <div style={{ 
                          marginTop: '16px',
                          paddingTop: '16px',
                          borderTop: '1px solid var(--border-color)',
                          display: 'flex',
                          gap: '8px'
                        }}>
                          <button
                            onClick={() => setEditingArtifact(artifact)}
                            className="btn-secondary"
                            style={{
                              fontSize: '13px',
                              padding: '6px 12px',
                              flex: 1
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(artifact.id)}
                            style={{
                              fontSize: '13px',
                              padding: '6px 12px',
                              background: 'var(--btn-delete-bg)',
                              color: 'var(--btn-delete-text)',
                              border: `2px solid var(--btn-delete-border)`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              flex: 1
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

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