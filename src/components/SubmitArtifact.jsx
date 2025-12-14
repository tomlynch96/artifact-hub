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
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      <h2>Submit Your Artifact</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Claude Artifact URL *
          </label>
          <input
            type="url"
            value={formData.artifact_url}
            onChange={(e) => setFormData({ ...formData, artifact_url: e.target.value })}
            placeholder="https://claude.site/artifacts/..."
            required
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Screenshot *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files[0])}
            required
            style={{ width: '100%', padding: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            How to use in lessons
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            placeholder="Describe how you use this artifact in your classroom..."
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Original Prompt (optional)
          </label>
          <textarea
            value={formData.first_prompt}
            onChange={(e) => setFormData({ ...formData, first_prompt: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            placeholder="The prompt you used to create this artifact..."
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Subjects *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {SUBJECTS.map(subject => (
              <label key={subject} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subject)}
                  onChange={() => handleSubjectToggle(subject)}
                  style={{ marginRight: '8px' }}
                />
                {subject}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Key Stages *
          </label>
          <div style={{ display: 'flex', gap: '15px' }}>
            {KEY_STAGES.map(keyStage => (
              <label key={keyStage} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.keyStages.includes(keyStage)}
                  onChange={() => handleKeyStageToggle(keyStage)}
                  style={{ marginRight: '8px' }}
                />
                {keyStage}
              </label>
            ))}
          </div>
        </div>

        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

        <button 
          type="submit" 
          disabled={loading || formData.subjects.length === 0 || formData.keyStages.length === 0}
          style={{ 
            width: '100%', 
            padding: '15px', 
            fontSize: '18px', 
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Artifact'}
        </button>
      </form>
    </div>
  )
}