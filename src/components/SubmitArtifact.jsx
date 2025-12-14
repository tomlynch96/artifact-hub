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
      // Validate Claude artifact URL
      if (!formData.artifact_url.startsWith('https://claude.ai/public/artifacts/') && 
          !formData.artifact_url.startsWith('https://claude.site/artifacts/')) {
        throw new Error('Please enter a valid Claude artifact URL (must start with https://claude.ai/public/artifacts/)')
      }

      if (!screenshot) {
        throw new Error('Please upload a screenshot')
      }

      // Upload screenshot
      const fileExt = screenshot.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('artifact-screenshots')
        .upload(fileName, screenshot)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artifact-screenshots')
        .getPublicUrl(fileName)

      // Insert artifact
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

      // Insert subjects
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

      // Insert key stages
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
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '900px', 
      margin: '0 auto' 
    }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '12px', color: '#1F2937', fontWeight: '700' }}>
          Submit Your Artifact
        </h1>
        <p style={{ fontSize: '18px', color: '#6B7280' }}>
          Share your Claude-created teaching resource with the community
        </p>
      </div>

      <div className="card" style={{ padding: '40px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '28px' }}>
            <label>Artifact Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Interactive Periodic Table Quiz"
              required
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label>Claude Artifact URL *</label>
            <input
              type="url"
              value={formData.artifact_url}
              onChange={(e) => setFormData({ ...formData, artifact_url: e.target.value })}
              placeholder="https://claude.ai/public/artifacts/..."
              required
            />
            <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px' }}>
              Paste the share link from your Claude artifact
            </p>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label>Screenshot *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files[0])}
              required
              style={{ 
                padding: '16px',
                border: '2px dashed #E5E7EB',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            />
            <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px' }}>
              Upload a preview image of your artifact
            </p>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label>How to Use in Lessons</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              placeholder="Describe how you use this artifact in your classroom, what topics it covers, and any tips for other teachers..."
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label>Original Prompt (Optional)</label>
            <textarea
              value={formData.first_prompt}
              onChange={(e) => setFormData({ ...formData, first_prompt: e.target.value })}
              rows={4}
              placeholder="Share the prompt you used to create this artifact so others can learn from it..."
            />
            <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px' }}>
              Help other teachers by sharing how you created this
            </p>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label>Subjects * (Select all that apply)</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: '12px',
              marginTop: '12px'
            }}>
              {SUBJECTS.map(subject => (
                <label 
                  key={subject} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    padding: '12px',
                    background: formData.subjects.includes(subject) ? '#F3F4F6' : 'transparent',
                    borderRadius: '8px',
                    border: formData.subjects.includes(subject) ? '2px solid #8B5CF6' : '2px solid #E5E7EB',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                    style={{ 
                      marginRight: '10px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>{subject}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label>Key Stages * (Select all that apply)</label>
            <div style={{ 
              display: 'flex', 
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '12px'
            }}>
              {KEY_STAGES.map(keyStage => (
                <label 
                  key={keyStage} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    padding: '12px 20px',
                    background: formData.keyStages.includes(keyStage) ? '#8B5CF6' : 'white',
                    color: formData.keyStages.includes(keyStage) ? 'white' : '#1F2937',
                    borderRadius: '8px',
                    border: '2px solid #8B5CF6',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    minWidth: '100px',
                    justifyContent: 'center'
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
              padding: '16px',
              background: '#FEE2E2',
              color: '#DC2626',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '15px'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || formData.subjects.length === 0 || formData.keyStages.length === 0}
            className="btn-primary"
            style={{ 
              width: '100%', 
              padding: '16px',
              fontSize: '18px'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Artifact'}
          </button>
          
          {(formData.subjects.length === 0 || formData.keyStages.length === 0) && (
            <p style={{ 
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '14px',
              color: '#6B7280'
            }}>
              Please select at least one subject and one key stage
            </p>
          )}
        </form>
      </div>
    </div>
  )
}