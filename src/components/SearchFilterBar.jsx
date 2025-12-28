import { useState } from 'react'
import { SUBJECTS, KEY_STAGES } from '../supabaseClient'

export default function SearchFilterBar({ onFiltersChange }) {
  const [searchText, setSearchText] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [selectedKeyStages, setSelectedKeyStages] = useState([])
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'most_voted', 'alphabetical'
  const [showSubjectsDropdown, setShowSubjectsDropdown] = useState(false)
  const [showKeyStagesDropdown, setShowKeyStagesDropdown] = useState(false)

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchText(value)
    applyFilters(value, selectedSubjects, selectedKeyStages, sortBy)
  }

  const handleSubjectToggle = (subject) => {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject]
    setSelectedSubjects(newSubjects)
    applyFilters(searchText, newSubjects, selectedKeyStages, sortBy)
  }

  const handleKeyStageToggle = (keyStage) => {
    const newKeyStages = selectedKeyStages.includes(keyStage)
      ? selectedKeyStages.filter(k => k !== keyStage)
      : [...selectedKeyStages, keyStage]
    setSelectedKeyStages(newKeyStages)
    applyFilters(searchText, selectedSubjects, newKeyStages, sortBy)
  }

  const handleSortChange = (e) => {
    const value = e.target.value
    setSortBy(value)
    applyFilters(searchText, selectedSubjects, selectedKeyStages, value)
  }

  const applyFilters = (search, subjects, keyStages, sort) => {
    onFiltersChange({
      searchText: search,
      subjects,
      keyStages,
      sortBy: sort
    })
  }

  const clearAllFilters = () => {
    setSearchText('')
    setSelectedSubjects([])
    setSelectedKeyStages([])
    setSortBy('newest')
    applyFilters('', [], [], 'newest')
  }

  const hasActiveFilters = searchText || selectedSubjects.length > 0 || selectedKeyStages.length > 0 || sortBy !== 'newest'

  return (
    <div style={{ 
      background: 'white', 
      padding: 'clamp(16px, 3vw, 24px)',
      borderRadius: '12px',
      marginBottom: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search artifacts by title, description, or prompt..."
          value={searchText}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: '15px',
            border: '2px solid #E5E7EB',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#EA580C'}
          onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
        />
      </div>

      {/* Filter and Sort Controls */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* Subjects Dropdown */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <button
            onClick={() => {
              setShowSubjectsDropdown(!showSubjectsDropdown)
              setShowKeyStagesDropdown(false)
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: selectedSubjects.length > 0 ? '#FFF7ED' : 'white',
              border: `2px solid ${selectedSubjects.length > 0 ? '#EA580C' : '#E5E7EB'}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: selectedSubjects.length > 0 ? '#EA580C' : '#4B5563'
            }}
          >
            <span>
              📚 Subjects {selectedSubjects.length > 0 && `(${selectedSubjects.length})`}
            </span>
            <span style={{ fontSize: '12px' }}>▼</span>
          </button>

          {showSubjectsDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: 'white',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000,
              padding: '8px'
            }}>
              {SUBJECTS.map(subject => (
                <label
                  key={subject}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: selectedSubjects.includes(subject) ? '#FFF7ED' : 'transparent',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedSubjects.includes(subject)) {
                      e.currentTarget.style.background = '#F9FAFB'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedSubjects.includes(subject)) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                    style={{ marginRight: '10px', cursor: 'pointer' }}
                  />
                  {subject}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Key Stages Dropdown */}
        <div style={{ position: 'relative', flex: '1 1 180px' }}>
          <button
            onClick={() => {
              setShowKeyStagesDropdown(!showKeyStagesDropdown)
              setShowSubjectsDropdown(false)
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: selectedKeyStages.length > 0 ? '#FFF7ED' : 'white',
              border: `2px solid ${selectedKeyStages.length > 0 ? '#EA580C' : '#E5E7EB'}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: selectedKeyStages.length > 0 ? '#EA580C' : '#4B5563'
            }}
          >
            <span>
              🎓 Key Stages {selectedKeyStages.length > 0 && `(${selectedKeyStages.length})`}
            </span>
            <span style={{ fontSize: '12px' }}>▼</span>
          </button>

          {showKeyStagesDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: 'white',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              padding: '8px'
            }}>
              {KEY_STAGES.map(keyStage => (
                <label
                  key={keyStage}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: selectedKeyStages.includes(keyStage) ? '#FFF7ED' : 'transparent',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedKeyStages.includes(keyStage)) {
                      e.currentTarget.style.background = '#F9FAFB'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedKeyStages.includes(keyStage)) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedKeyStages.includes(keyStage)}
                    onChange={() => handleKeyStageToggle(keyStage)}
                    style={{ marginRight: '10px', cursor: 'pointer' }}
                  />
                  {keyStage}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div style={{ flex: '1 1 180px' }}>
          <select
            value={sortBy}
            onChange={handleSortChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'white',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#4B5563'
            }}
          >
            <option value="newest">📅 Most Recent</option>
            <option value="most_voted">⬆️ Most Voted</option>
            <option value="alphabetical">🔤 A-Z</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              padding: '10px 16px',
              background: '#FEE2E2',
              border: '2px solid #EF4444',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#DC2626',
              whiteSpace: 'nowrap'
            }}
          >
            ✕ Clear All
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {(selectedSubjects.length > 0 || selectedKeyStages.length > 0) && (
        <div style={{ 
          marginTop: '16px', 
          paddingTop: '16px', 
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {selectedSubjects.map(subject => (
            <span
              key={subject}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#FFF7ED',
                border: '1px solid #FDBA74',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#EA580C'
              }}
            >
              {subject}
              <button
                onClick={() => handleSubjectToggle(subject)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px',
                  color: '#EA580C',
                  marginLeft: '4px'
                }}
              >
                ✕
              </button>
            </span>
          ))}
          {selectedKeyStages.map(keyStage => (
            <span
              key={keyStage}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#DBEAFE',
                border: '1px solid #93C5FD',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#1E40AF'
              }}
            >
              {keyStage}
              <button
                onClick={() => handleKeyStageToggle(keyStage)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px',
                  color: '#1E40AF',
                  marginLeft: '4px'
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showSubjectsDropdown || showKeyStagesDropdown) && (
        <div
          onClick={() => {
            setShowSubjectsDropdown(false)
            setShowKeyStagesDropdown(false)
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}
    </div>
  )
}