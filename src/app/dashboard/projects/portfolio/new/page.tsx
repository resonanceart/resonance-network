'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const CATEGORY_SUGGESTIONS = [
  'Architecture', 'Installation', 'Sound Design', 'Fabrication',
  'Technology', 'Performance', 'Process', 'Research',
]

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function uploadCoverImage(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const fileName = `portfolio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('profile-media').upload(fileName, file)
  if (error) { console.error('Upload error:', error); return null }
  const { data } = supabase.storage.from('profile-media').getPublicUrl(fileName)
  return data.publicUrl
}

export default function NewPortfolioProjectPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [role, setRole] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isOngoing, setIsOngoing] = useState(false)
  const [externalLinks, setExternalLinks] = useState<{ label: string; url: string }[]>([])
  const [toolsUsed, setToolsUsed] = useState<string[]>([])
  const [toolInput, setToolInput] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (authLoading) return <div className="portfolio-editor"><p>Loading...</p></div>
  if (!user) { router.push('/login'); return null }

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  function addTool() {
    const t = toolInput.trim()
    if (t && !toolsUsed.includes(t)) {
      setToolsUsed([...toolsUsed, t])
      setToolInput('')
    }
  }

  function addLink() {
    setExternalLinks([...externalLinks, { label: '', url: '' }])
  }

  function updateLink(index: number, field: 'label' | 'url', value: string) {
    const updated = [...externalLinks]
    updated[index][field] = value
    setExternalLinks(updated)
  }

  function removeLink(index: number) {
    setExternalLinks(externalLinks.filter((_, i) => i !== index))
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    setCoverPreview(URL.createObjectURL(file))
    const url = await uploadCoverImage(file)
    if (url) setCoverImageUrl(url)
    setUploadingCover(false)
  }

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError(null)

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) { setError('Not authenticated'); setSaving(false); return }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, display_name')
      .eq('id', currentUser.id)
      .single()
    if (!profile) { setError('Profile not found'); setSaving(false); return }

    const projectData = {
      profile_id: profile.id,
      title,
      slug: slugify(title),
      tagline,
      description: '',
      cover_image_url: coverImageUrl || '',
      category,
      tags,
      role,
      start_date: startDate || null,
      end_date: isOngoing ? null : (endDate || null),
      external_links: externalLinks.filter(l => l.label && l.url),
      tools_used: toolsUsed,
      display_order: 0,
      is_featured: false,
      status,
    }

    const { data, error: insertError } = await supabase
      .from('portfolio_projects')
      .insert(projectData)
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push(`/dashboard/projects/portfolio/${data.id}/edit`)
  }

  return (
    <div className="portfolio-editor">
      <div className="portfolio-editor__header">
        <div className="portfolio-editor__breadcrumb">
          <Link href="/dashboard">Dashboard</Link> / <Link href="/dashboard/projects/portfolio">Portfolio</Link> / <span>New Project</span>
        </div>
        <div className="portfolio-editor__actions">
          <Link href="/dashboard/projects/portfolio" className="portfolio-editor__btn portfolio-editor__btn--secondary">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="portfolio-editor__btn portfolio-editor__btn--primary"
          >
            {saving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </div>

      {error && <div className="portfolio-editor__error">{error}</div>}

      <form className="portfolio-editor__form" onSubmit={(e) => e.preventDefault()}>
        {/* Title */}
        <div className="portfolio-editor__field">
          <label className="portfolio-editor__label">Title *</label>
          <input
            type="text"
            className="portfolio-editor__input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
            placeholder="Project title"
          />
        </div>

        {/* Tagline */}
        <div className="portfolio-editor__field">
          <label className="portfolio-editor__label">Tagline</label>
          <input
            type="text"
            className="portfolio-editor__input"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            maxLength={200}
            placeholder="A short description of the project"
          />
        </div>

        {/* Category */}
        <div className="portfolio-editor__field">
          <label className="portfolio-editor__label">Category</label>
          <input
            type="text"
            className="portfolio-editor__input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list="category-suggestions"
            placeholder="e.g. Architecture, Installation"
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        {/* Tags */}
        <div className="portfolio-editor__field">
          <label className="portfolio-editor__label">Tags</label>
          <div className="portfolio-editor__tag-input-row">
            <input
              type="text"
              className="portfolio-editor__input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="Add tags (comma-separated or press Enter)"
            />
            <button type="button" onClick={addTag} className="portfolio-editor__btn portfolio-editor__btn--small">Add</button>
          </div>
          {tags.length > 0 && (
            <div className="portfolio-editor__tags">
              {tags.map((tag) => (
                <span key={tag} className="portfolio-editor__tag">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cover Image */}
        <div className="portfolio-editor__field">
          <label className="portfolio-editor__label">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="portfolio-editor__input"
          />
          {uploadingCover && <p className="portfolio-editor__upload-status">Uploading...</p>}
          {coverPreview && (
            <div className="portfolio-editor__cover-preview">
              <img src={coverPreview} alt="Cover preview" />
            </div>
          )}
        </div>

        {/* Role */}
        <div className="portfolio-editor__field">
          <label className="portfolio-editor__label">Role</label>
          <input
            type="text"
            className="portfolio-editor__input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Lead Architect"
          />
        </div>

        {/* Dates */}
        <div className="portfolio-editor__field portfolio-editor__field--row">
          <div className="portfolio-editor__field">
            <label className="portfolio-editor__label">Start Date</label>
            <input
              type="date"
              className="portfolio-editor__input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="portfolio-editor__field">
            <label className="portfolio-editor__label">End Date</label>
            <input
              type="date"
              className="portfolio-editor__input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isOngoing}
            />
            <label className="portfolio-editor__checkbox-label">
              <input
                type="checkbox"
                checked={isOngoing}
                onChange={(e) => setIsOngoing(e.target.checked)}
              />
              Ongoing
            </label>
          </div>
        </div>

        {/* External Links */}
        <div className="portfolio-editor__field">
          <label className="portfolio-editor__label">External Links</label>
          <div className="portfolio-editor__links">
            {externalLinks.map((link, i) => (
              <div key={i} className="portfolio-editor__link-row">
                <input
                  type="text"
                  className="portfolio-editor__input"
                  value={link.label}
                  onChange={(e) => updateLink(i, 'label', e.target.value)}
                  placeholder="Label"
                />
                <input
                  type="url"
                  className="portfolio-editor__input"
                  value={link.url}
                  onChange={(e) => updateLink(i, 'url', e.target.value)}
                  placeholder="https://..."
                />
                <button type="button" onClick={() => removeLink(i)} className="portfolio-editor__btn portfolio-editor__btn--danger">&times;</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addLink} className="portfolio-editor__btn portfolio-editor__btn--small">
            + Add Link
          </button>
        </div>

        {/* Tools Used */}
        <div className="portfolio-editor__field">
          <label className="portfolio-editor__label">Tools Used</label>
          <div className="portfolio-editor__tag-input-row">
            <input
              type="text"
              className="portfolio-editor__input"
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTool() } }}
              placeholder="Add a tool"
            />
            <button type="button" onClick={addTool} className="portfolio-editor__btn portfolio-editor__btn--small">Add</button>
          </div>
          {toolsUsed.length > 0 && (
            <div className="portfolio-editor__tags">
              {toolsUsed.map((tool) => (
                <span key={tool} className="portfolio-editor__tag">
                  {tool}
                  <button type="button" onClick={() => setToolsUsed(toolsUsed.filter(t => t !== tool))}>&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="portfolio-editor__field">
          <label className="portfolio-editor__label">Status</label>
          <div className="portfolio-editor__status-toggle">
            <label className={`portfolio-editor__status-option ${status === 'draft' ? 'portfolio-editor__status-option--active' : ''}`}>
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === 'draft'}
                onChange={() => setStatus('draft')}
              />
              Draft
            </label>
            <label className={`portfolio-editor__status-option ${status === 'published' ? 'portfolio-editor__status-option--active' : ''}`}>
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === 'published'}
                onChange={() => setStatus('published')}
              />
              Published
            </label>
          </div>
        </div>
      </form>
    </div>
  )
}
