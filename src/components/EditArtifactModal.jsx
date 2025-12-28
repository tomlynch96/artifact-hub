import { useState, useEffect } from 'react'
import { supabase, SUBJECTS, KEY_STAGES } from '../supabaseClient'

export default function EditArtifactModal({ artifact, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    artifact_url: '',
    description: '',
    first_prompt: '',
    subjects: [],
    keyStages: []
  })
  const [newScreenshot, setNewScreenshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (artifact) {
      setFormData({
        title: artifact.title || '',
        artifact_url: artifact.artifact_url || '',
        description: artifact.description || '',
        first_prompt: artifact.first_prompt || '',
        subjects: artifact.artifact_subjects?.map(s => s.subject) || [],
        keyStages: artifact.artifact_key_stages?.map(k => k.key_stage) || []
      })
    }
  }, [artifact])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.artifact_url.startsWith('https://claude.ai/public/artifacts/') && 
          !formData.artifact_url.startsWith('https://claude.site/artifacts/')) {
        throw new Error('Please enter a valid Claude artifact URL')
      }

      let screenshot_url = artifact.screenshot_url

      if (newScreenshot) {
        const fileExt = newScreenshot.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('artifact-screenshots')
          .upload(fileName, newScreenshot)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('artifact-screenshots')
          .getPublicUrl(fileName)

        screenshot_url = publicUrl
      }

      const { error: updateError } = await supabase
        .from('artifacts')
        .update({
          title: formData.title,
          artifact_url: formData.artifact_url,
          description: formData.description || null,
          first_prompt: formData.first_prompt || null,
          screenshot_url
        })
        .eq('id', artifact.id)

      if (updateError) throw updateError

      await supabase
        .from('artifact_subjects')
        .delete()
        .eq('artifact_id', artifact.id)

      await supabase
        .from('artifact_key_stages')
        .delete()
        .eq('artifact_id', artifact.id)

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

      alert('Artifact updated successfully!')
      onSuccess()
    } catch (error) {
      setError(error.message)
      console.error('Error updating artifact:', error)
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--modal-overlay)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'var(--modal-bg)',
        borderRadius: '16px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 'clamp(24px, 5vw, 40px)',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: '700',
            color: 'var(--text-dark)',
            margin: 0
          }}>
            Edit Artifact
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: 'var(--text-gray)',
              padding: '0',
              lineHeight: '1'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'var(--text-dark)',
              fontSize: '14px'
            }}>
              Artifact Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Interactive Periodic Table Quiz"
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'var(--text-dark)',
              fontSize: '14px'
            }}>
              Claude Artifact URL *
            </label>
            <input
              type="url"
              value={formData.artifact_url}
              onChange={(e) => setFormData({ ...formData, artifact_url: e.target.value })}
              placeholder="https://claude.ai/public/artifacts/..."
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'var(--text-dark)',
              fontSize: '14px'
            }}>
              Screenshot {newScreenshot ? '(New)' : '(Optional - leave blank to keep current)'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewScreenshot(e.target.files[0])}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            />
            {!newScreenshot && artifact.screenshot_url && (
              <img 
                src={artifact.screenshot_url} 
                alt="Current screenshot"
                style={{
                  marginTop: '12px',
                  width: '100%',
                  maxWidth: '300px',
                  borderRadius: '8px',
                  border: '2px solid var(--border-color)'
                }}
              />
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'var(--text-dark)',
              fontSize: '14px'
            }}>
              How to Use in Lessons
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              placeholder="Describe how you use this in your classroom..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'var(--text-dark)',
              fontSize: '14px'
            }}>
              Original Prompt (Optional)
            </label>
            <textarea
              value={formData.first_prompt}
              onChange={(e) => setFormData({ ...formData, first_prompt: e.target.value })}
              rows={4}
              placeholder="Share the prompt you used..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'var(--text-dark)',
              fontSize: '14px'
            }}>
              Subjects *
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
              gap: '10px'
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
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'var(--text-dark)',
              fontSize: '14px'
            }}>
              Key Stages *
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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

          <div style={{ 
            display: 'flex', 
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button 
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'var(--btn-secondary-bg)',
                border: '2px solid var(--btn-secondary-border)',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'var(--btn-secondary-text)'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || formData.subjects.length === 0 || formData.keyStages.length === 0}
              style={{
                padding: '12px 24px',
                background: loading ? 'var(--text-light-gray)' : 'var(--btn-primary-bg)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: 'var(--btn-primary-text)'
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}