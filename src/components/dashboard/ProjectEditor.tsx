'use client'

import { useState, useRef } from 'react'

export interface ProjectItem {
  title: string
  description: string
  image?: string
  url?: string
  year?: string
  role?: string
  materials?: string[]
  outcomes?: string
  galleryImages?: { url: string; alt: string; caption?: string }[]
  isFeatured?: boolean
}

interface ProjectEditorProps {
  projects: ProjectItem[]
  onChange: (projects: ProjectItem[]) => void
}

const emptyProject: ProjectItem = {
  title: '',
  description: '',
  image: undefined,
  url: '',
  year: '',
  role: '',
  materials: [],
  outcomes: '',
  galleryImages: [],
  isFeatured: false,
}

export default function ProjectEditor({ projects, onChange }: ProjectEditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | undefined>(undefined)
  const [url, setUrl] = useState('')
  const [year, setYear] = useState('')
  const [role, setRole] = useState('')
  const [materials, setMaterials] = useState<string[]>([])
  const [materialInput, setMaterialInput] = useState('')
  const [outcomes, setOutcomes] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  function resetForm() {
    setTitle('')
    setDescription('')
    setImage(undefined)
    setUrl('')
    setYear('')
    setRole('')
    setMaterials([])
    setMaterialInput('')
    setOutcomes('')
    setIsFeatured(false)
  }

  function populateForm(project: ProjectItem) {
    setTitle(project.title)
    setDescription(project.description)
    setImage(project.image)
    setUrl(project.url || '')
    setYear(project.year || '')
    setRole(project.role || '')
    setMaterials(project.materials || [])
    setMaterialInput('')
    setOutcomes(project.outcomes || '')
    setIsFeatured(project.isFeatured || false)
  }

  function handleAdd() {
    resetForm()
    setEditingIndex(null)
    setShowForm(true)
  }

  function handleEdit(index: number) {
    populateForm(projects[index])
    setEditingIndex(index)
    setShowForm(true)
  }

  function handleDelete(index: number) {
    const updated = projects.filter((_, i) => i !== index)
    onChange(updated)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingIndex(null)
    resetForm()
  }

  function handleSave() {
    if (!title.trim()) return

    const project: ProjectItem = {
      title: title.trim(),
      description: description.trim(),
      image,
      url: url.trim() || undefined,
      year: year.trim() || undefined,
      role: role.trim() || undefined,
      materials: materials.length > 0 ? materials : undefined,
      outcomes: outcomes.trim() || undefined,
      isFeatured,
    }

    if (editingIndex !== null) {
      // Preserve galleryImages from existing project
      project.galleryImages = projects[editingIndex].galleryImages
      const updated = [...projects]
      updated[editingIndex] = project
      onChange(updated)
    } else {
      onChange([...projects, project])
    }

    setShowForm(false)
    setEditingIndex(null)
    resetForm()
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxW = 1200
      const ratio = Math.min(maxW / img.width, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setImage(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = URL.createObjectURL(file)
  }

  function addMaterial() {
    const trimmed = materialInput.trim()
    if (trimmed && !materials.includes(trimmed)) {
      setMaterials([...materials, trimmed])
    }
    setMaterialInput('')
  }

  function removeMaterial(mat: string) {
    setMaterials(materials.filter(m => m !== mat))
  }

  function handleMaterialKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addMaterial()
    }
  }

  if (showForm) {
    return (
      <div className="project-editor">
        <div className="project-editor__form">
          <h3 style={{ margin: '0 0 var(--space-3)' }}>
            {editingIndex !== null ? 'Edit Project' : 'Add Project'}
          </h3>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="project-title" className="form-label">Title *</label>
            <input
              id="project-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="form-input"
              required
              placeholder="Project title"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="project-description" className="form-label">Description</label>
            <textarea
              id="project-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="form-input"
              rows={4}
              placeholder="Describe the project..."
            />
          </div>

          {/* Year */}
          <div className="form-group">
            <label htmlFor="project-year" className="form-label">Year</label>
            <input
              id="project-year"
              type="text"
              value={year}
              onChange={e => setYear(e.target.value)}
              className="form-input"
              placeholder="2024"
            />
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="project-role" className="form-label">Role</label>
            <input
              id="project-role"
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="form-input"
              placeholder="Lead Artist"
            />
          </div>

          {/* Main Image */}
          <div className="form-group">
            <label className="form-label">Main Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? 'Change Image' : 'Upload Image'}
            </button>
            {image && (
              <div style={{ marginTop: 'var(--space-2)' }}>
                <img
                  src={image}
                  alt="Project preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '140px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>
            )}
          </div>

          {/* URL */}
          <div className="form-group">
            <label htmlFor="project-url" className="form-label">URL</label>
            <input
              id="project-url"
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="form-input"
              placeholder="https://example.com/project"
            />
          </div>

          {/* Materials */}
          <div className="form-group">
            <label htmlFor="project-materials" className="form-label">Materials</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: materials.length > 0 ? 'var(--space-2)' : 0 }}>
              {materials.map(mat => (
                <span
                  key={mat}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {mat}
                  <button
                    type="button"
                    onClick={() => removeMaterial(mat)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      padding: '0 2px',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                    aria-label={`Remove ${mat}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                id="project-materials"
                type="text"
                value={materialInput}
                onChange={e => setMaterialInput(e.target.value)}
                onKeyDown={handleMaterialKeyDown}
                placeholder="Type a material and press Enter"
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn--outline"
                onClick={addMaterial}
                style={{ flexShrink: 0 }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Outcomes */}
          <div className="form-group">
            <label htmlFor="project-outcomes" className="form-label">Outcomes</label>
            <textarea
              id="project-outcomes"
              value={outcomes}
              onChange={e => setOutcomes(e.target.value)}
              className="form-input"
              rows={3}
              placeholder="Awards, exhibitions, impact..."
            />
          </div>

          {/* Featured */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
              />
              Featured project
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSave}
              disabled={!title.trim()}
            >
              Save
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="project-editor">
      <div className="project-editor__list">
        {projects.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            No projects added yet.
          </p>
        )}
        {projects.map((project, index) => (
          <div
            key={index}
            className="project-editor__item"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              marginBottom: 'var(--space-2)',
            }}
          >
            <div>
              <strong>{project.title}</strong>
              {project.year && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginLeft: 'var(--space-2)' }}>
                  {project.year}
                </span>
              )}
              {project.role && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block', marginTop: '2px' }}>
                  {project.role}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => handleEdit(index)}
                style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-3)' }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => handleDelete(index)}
                style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-3)', color: '#c0392b' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--primary"
        onClick={handleAdd}
        style={{ marginTop: 'var(--space-3)' }}
      >
        Add Project
      </button>
    </div>
  )
}
