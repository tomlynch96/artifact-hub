import { useState } from 'react'
import { supabase, SUBJECTS, KEY_STAGES } from '../supabaseClient'

export default function SubmitArtifact({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    artifact_url: '',
    description: '',
    first_prompt: '',
    subjects: [],
    keyStages: []
  })
  const [screenshot, setScreenshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.artifact_url.startsWith('https://claude.ai/public/artifacts/') && 
          !formData.artifact_url.startsWith('https://claude.site/artifacts/')) {
        throw new Error('Please enter a valid Claude artifact URL')
      }

      if (!screenshot) {
        throw new Error('Please upload a screenshot')
      }

      const fileExt = screenshot.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('artifact-screenshots')
        .upload(fileName, screenshot)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('artifact-screenshots')
        .getPublicUrl(fileName)

      const { data: artifact, error: artifactError } = await supabase
        .from('artifacts')
        .insert({
          title: formData.title,
          artifact_url: formData.artifact_url,
          description: formData.description || null,
          first_prompt: formData.first_prompt || null,
          screenshot_url: publicUrl,
          votes: 0
        })
        .select()
        .single()

      if (artifactError) throw artifactError

      if (formData.subjects.length > 0) {
        const subjectInserts = formData.subjects.map(subject => ({
          artifact_id: artifact.id,
          subject
        }))
        const { error: subjectError } = await supabase
          .from('artifact_subjects')
          .insert(subjectInserts)
        if (subjectError) throw subjectError
      }

      if (formData.keyStages.length > 0) {
        const keyStageInserts = formData.keyStages.map(keyStage => ({
          artifact_id: artifact.id,
          key_stage: keyStage
        }))
        const { error: keyStageError } = await supabase
          .from('artifact_key_stages')
          .insert(keyStageInserts)
        if (keyStageError) throw keyStageError
      }

      alert('Artifact submitted successfully!')
      onSuccess()
    } catch (error) {
      setError(error.message)
      console.error('Error submitting artifact:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

  const handleKeyStageToggle = (keyStage) => {
    setFormData(prev => ({
      ...prev,
      keyStages: prev.keyStages.includes(keyStage)
        ? prev.keyStages.filter(k => k !== keyStage)
        : [...prev.keyStages, keyStage]
    }))
  }

  return (
    <div className="page-section">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="section-header">
          <h1 className="section-title">Submit Your Artifact</h1>
          <p className="section-subtitle">
            Share your Claude-created teaching resource with the community
          </p>
        </div>

        <div className="card" style={{ padding: 'clamp(24px, 5vw, 40px)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label>Artifact Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Interactive Periodic Table Quiz"
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label>Claude Artifact URL *</label>
              <input
                type="url"
                value={formData.artifact_url}
                onChange={(e) => setFormData({ ...formData, artifact_url: e.target.value })}
                placeholder="https://claude.ai/public/artifacts/..."
                required
              />
              <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '6px' }}>
                Paste the share link from your Claude artifact
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label>Screenshot *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0])}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label>How to Use in Lessons</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                placeholder="Describe how you use this in your classroom..."
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label>Original Prompt (Optional)</label>
              <textarea
                value={formData.first_prompt}
                onChange={(e) => setFormData({ ...formData, first_prompt: e.target.value })}
                rows={4}
                placeholder="Share the prompt you used..."
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label>Subjects *</label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: '10px',
                marginTop: '12px'
              }}>
                {SUBJECTS.map(subject => (
                  <label 
                    key={subject} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      padding: '10px',
                      background: formData.subjects.includes(subject) ? 'var(--selected-bg)' : 'transparent',
                      borderRadius: '6px',
                      border: formData.subjects.includes(subject) ? '2px solid var(--border-terracotta)' : '2px solid var(--border-color)',
                      transition: 'all 0.2s',
                      fontSize: '14px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      style={{ marginRight: '8px', cursor: 'pointer' }}
                    />
                    {subject}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label>Key Stages *</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                {KEY_STAGES.map(keyStage => (
                  <label 
                    key={keyStage} 
                    style={{ 
                      cursor: 'pointer',
                      padding: '10px 18px',
                      background: formData.keyStages.includes(keyStage) ? 'var(--btn-primary-bg)' : 'var(--background-white)',
                      color: formData.keyStages.includes(keyStage) ? 'var(--btn-primary-text)' : 'var(--text-dark)',
                      borderRadius: '8px',
                      border: '2px solid var(--border-terracotta)',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      fontSize: '14px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.keyStages.includes(keyStage)}
                      onChange={() => handleKeyStageToggle(keyStage)}
                      style={{ display: 'none' }}
                    />
                    {keyStage}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ 
                padding: '14px',
                background: 'var(--error-bg)',
                color: 'var(--error-text)',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || formData.subjects.length === 0 || formData.keyStages.length === 0}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
            >
              {loading ? 'Submitting...' : 'Submit Artifact'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}