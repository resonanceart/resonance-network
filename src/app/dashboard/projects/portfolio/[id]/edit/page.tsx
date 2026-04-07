'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { ProjectContentBlock } from '@/types'

const CATEGORY_SUGGESTIONS = [
  'Architecture', 'Installation', 'Sound Design', 'Fabrication',
  'Technology', 'Performance', 'Process', 'Research',
]

const BLOCK_TYPES = [
  { value: 'image', label: 'Image' },
  { value: 'image_grid', label: 'Image Grid' },
  { value: 'side_by_side', label: 'Side by Side' },
  { value: 'video', label: 'Video' },
  { value: 'rich_text', label: 'Rich Text' },
  { value: 'quote', label: 'Quote' },
  { value: 'divider', label: 'Divider' },
  { value: 'embed', label: 'Embed' },
  { value: 'audio', label: 'Audio' },
  { value: 'carousel', label: 'Carousel' },
] as const

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function uploadImage(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const fileName = `${userId}/portfolio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('profile-uploads').upload(fileName, file)
  if (error) { console.error('Upload error:', error); return null }
  const { data } = supabase.storage.from('profile-uploads').getPublicUrl(fileName)
  return data.publicUrl
}

function detectVideoSource(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('vimeo.com')) return 'vimeo'
  return 'upload'
}

interface EditableBlock {
  id?: string
  block_type: ProjectContentBlock['block_type']
  content: Record<string, unknown>
  display_order: number
}

export default function EditPortfolioProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Form state
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
  const [loading, setLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)

  // Block editor state
  const [contentBlocks, setContentBlocks] = useState<EditableBlock[]>([])
  const [savingBlocks, setSavingBlocks] = useState(false)
  const [blocksSaved, setBlocksSaved] = useState(false)
  const [showBlockPicker, setShowBlockPicker] = useState(false)

  // Load project data
  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    async function loadProject() {
      const { data: project } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('id', id)
        .single()

      if (!project) {
        router.push('/dashboard/projects/portfolio')
        return
      }

      setTitle(project.title || '')
      setTagline(project.tagline || '')
      setCategory(project.category || '')
      setTags(project.tags || [])
      setCoverImageUrl(project.cover_image_url || null)
      setCoverPreview(project.cover_image_url || null)
      setRole(project.role || '')
      setStartDate(project.start_date || '')
      setEndDate(project.end_date || '')
      setIsOngoing(!project.end_date)
      setExternalLinks(project.external_links || [])
      setToolsUsed(project.tools_used || [])
      setStatus(project.status || 'draft')

      // Load content blocks
      const { data: blocks } = await supabase
        .from('portfolio_content_blocks')
        .select('*')
        .eq('project_id', project.id)
        .order('display_order')

      setContentBlocks(blocks || [])
      setLoading(false)
    }
    loadProject()
  }, [id, user, authLoading, router])

  // Track unsaved changes
  useEffect(() => {
    if (!loading) setHasUnsavedChanges(true)
  }, [title, tagline, category, tags, coverImageUrl, role, startDate, endDate, isOngoing, externalLinks, toolsUsed, status])

  // Tag helpers
  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput('') }
  }

  function addTool() {
    const t = toolInput.trim()
    if (t && !toolsUsed.includes(t)) { setToolsUsed([...toolsUsed, t]); setToolInput('') }
  }

  // Link helpers
  function addLink() { setExternalLinks([...externalLinks, { label: '', url: '' }]) }
  function updateLink(index: number, field: 'label' | 'url', value: string) {
    const updated = [...externalLinks]; updated[index][field] = value; setExternalLinks(updated)
  }
  function removeLink(index: number) { setExternalLinks(externalLinks.filter((_, i) => i !== index)) }

  // Cover image
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    setCoverPreview(URL.createObjectURL(file))
    const url = await uploadImage(file, user?.id ?? '')
    if (url) setCoverImageUrl(url)
    setUploadingCover(false)
  }

  // Save project metadata
  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError(null)

    const projectData = {
      title,
      slug: slugify(title),
      tagline,
      category,
      tags,
      cover_image_url: coverImageUrl || '',
      role,
      start_date: startDate || null,
      end_date: isOngoing ? null : (endDate || null),
      external_links: externalLinks.filter(l => l.label && l.url),
      tools_used: toolsUsed,
      status,
    }

    const { error: updateError } = await supabase
      .from('portfolio_projects')
      .update(projectData)
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setHasUnsavedChanges(false)
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 2000)
    }
    setSaving(false)
  }

  // Block management
  function addBlock(blockType: EditableBlock['block_type']) {
    const newBlock: EditableBlock = {
      block_type: blockType,
      content: getDefaultContent(blockType),
      display_order: contentBlocks.length,
    }
    setContentBlocks([...contentBlocks, newBlock])
    setShowBlockPicker(false)
  }

  function getDefaultContent(type: EditableBlock['block_type']): Record<string, unknown> {
    switch (type) {
      case 'image': return { url: '', alt: '', caption: '' }
      case 'image_grid': return { images: [], columns: 3 }
      case 'side_by_side': return { left_type: 'image', right_type: 'image', left_content: {}, right_content: {}, ratio: '50-50' }
      case 'video': return { url: '', source: '' }
      case 'rich_text': return { html: '' }
      case 'quote': return { text: '', attribution: '' }
      case 'divider': return { style: 'line' }
      case 'embed': return { url: '' }
      case 'audio': return { url: '', title: '' }
      case 'carousel': return { images: [] }
      default: return {}
    }
  }

  function updateBlockContent(index: number, content: Record<string, unknown>) {
    const updated = [...contentBlocks]
    updated[index] = { ...updated[index], content }
    setContentBlocks(updated)
  }

  function removeBlock(index: number) {
    setContentBlocks(contentBlocks.filter((_, i) => i !== index))
  }

  function moveBlock(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === contentBlocks.length - 1) return
    const updated = [...contentBlocks]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]
    setContentBlocks(updated)
  }

  async function saveBlocks() {
    setSavingBlocks(true)
    await supabase.from('portfolio_content_blocks').delete().eq('project_id', id)

    const blocksToInsert = contentBlocks.map((block, index) => ({
      project_id: id,
      block_type: block.block_type,
      content: block.content,
      display_order: index,
    }))

    if (blocksToInsert.length > 0) {
      await supabase.from('portfolio_content_blocks').insert(blocksToInsert)
    }

    setSavingBlocks(false)
    setBlocksSaved(true)
    setTimeout(() => setBlocksSaved(false), 2000)
  }

  // Block-specific image upload handler
  async function handleBlockImageUpload(blockIndex: number, file: File, field: string = 'url') {
    const url = await uploadImage(file, user?.id ?? '')
    if (url) {
      const updated = { ...contentBlocks[blockIndex].content, [field]: url }
      updateBlockContent(blockIndex, updated)
    }
  }

  async function handleBlockMultiImageUpload(blockIndex: number, files: FileList) {
    const urls: { url: string; alt: string }[] = [...(contentBlocks[blockIndex].content.images as { url: string; alt: string }[] || [])]
    for (const file of Array.from(files)) {
      const url = await uploadImage(file, user?.id ?? '')
      if (url) urls.push({ url, alt: file.name })
    }
    updateBlockContent(blockIndex, { ...contentBlocks[blockIndex].content, images: urls })
  }

  if (authLoading || loading) {
    return <div className="portfolio-editor"><p>Loading...</p></div>
  }

  return (
    <div className="portfolio-editor">
      <div className="portfolio-editor__header">
        <div className="portfolio-editor__breadcrumb">
          <Link href="/dashboard">Dashboard</Link> / <Link href="/dashboard/projects/portfolio">Work</Link> / <span>Edit Work</span>
        </div>
        <div className="portfolio-editor__actions">
          {hasUnsavedChanges && <span className="portfolio-editor__unsaved">Unsaved changes</span>}
          {savedMessage && <span className="portfolio-editor__saved">Saved</span>}
          <Link href="/dashboard/projects/portfolio" className="portfolio-editor__btn portfolio-editor__btn--secondary">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="portfolio-editor__btn portfolio-editor__btn--primary"
          >
            {saving ? 'Saving...' : 'Save Work'}
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
            placeholder="Title"
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
            placeholder="A short description"
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
              placeholder="Add tags"
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
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="portfolio-editor__input" />
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
            <input type="date" className="portfolio-editor__input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="portfolio-editor__field">
            <label className="portfolio-editor__label">End Date</label>
            <input type="date" className="portfolio-editor__input" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isOngoing} />
            <label className="portfolio-editor__checkbox-label">
              <input type="checkbox" checked={isOngoing} onChange={(e) => setIsOngoing(e.target.checked)} />
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
                <input type="text" className="portfolio-editor__input" value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)} placeholder="Label" />
                <input type="url" className="portfolio-editor__input" value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} placeholder="https://..." />
                <button type="button" onClick={() => removeLink(i)} className="portfolio-editor__btn portfolio-editor__btn--danger">&times;</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addLink} className="portfolio-editor__btn portfolio-editor__btn--small">+ Add Link</button>
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
              <input type="radio" name="status" value="draft" checked={status === 'draft'} onChange={() => setStatus('draft')} />
              Draft
            </label>
            <label className={`portfolio-editor__status-option ${status === 'published' ? 'portfolio-editor__status-option--active' : ''}`}>
              <input type="radio" name="status" value="published" checked={status === 'published'} onChange={() => setStatus('published')} />
              Published
            </label>
          </div>
        </div>
      </form>

      {/* Content Blocks Editor */}
      <div className="portfolio-editor__blocks">
        <div className="portfolio-editor__blocks-header">
          <h2>Content</h2>
          <div className="portfolio-editor__actions">
            {blocksSaved && <span className="portfolio-editor__saved">Blocks saved</span>}
            <button onClick={saveBlocks} disabled={savingBlocks} className="portfolio-editor__btn portfolio-editor__btn--primary">
              {savingBlocks ? 'Saving...' : 'Save Blocks'}
            </button>
          </div>
        </div>

        {contentBlocks.map((block, index) => (
          <div key={index} className="portfolio-editor__block-item">
            <div className="portfolio-editor__block-controls">
              <span className="portfolio-editor__block-type-label">
                {BLOCK_TYPES.find(b => b.value === block.block_type)?.label || block.block_type}
              </span>
              <div className="portfolio-editor__block-actions">
                <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="portfolio-editor__btn portfolio-editor__btn--icon">&uarr;</button>
                <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === contentBlocks.length - 1} className="portfolio-editor__btn portfolio-editor__btn--icon">&darr;</button>
                <button type="button" onClick={() => removeBlock(index)} className="portfolio-editor__btn portfolio-editor__btn--danger">&times;</button>
              </div>
            </div>

            <div className="portfolio-editor__block-editor">
              {/* Image block */}
              {block.block_type === 'image' && (
                <>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0]; if (f) handleBlockImageUpload(index, f)
                  }} className="portfolio-editor__input" />
                  {(block.content.url as string) && <img src={block.content.url as string} alt="" className="portfolio-editor__block-preview" />}
                  <input type="text" className="portfolio-editor__input" placeholder="Alt text" value={(block.content.alt as string) || ''} onChange={(e) => updateBlockContent(index, { ...block.content, alt: e.target.value })} />
                  <input type="text" className="portfolio-editor__input" placeholder="Caption" value={(block.content.caption as string) || ''} onChange={(e) => updateBlockContent(index, { ...block.content, caption: e.target.value })} />
                </>
              )}

              {/* Image Grid block */}
              {block.block_type === 'image_grid' && (
                <>
                  <input type="file" accept="image/*" multiple onChange={(e) => {
                    if (e.target.files) handleBlockMultiImageUpload(index, e.target.files)
                  }} className="portfolio-editor__input" />
                  <div className="portfolio-editor__field">
                    <label className="portfolio-editor__label">Columns</label>
                    <select className="portfolio-editor__select" value={(block.content.columns as number) || 3} onChange={(e) => updateBlockContent(index, { ...block.content, columns: parseInt(e.target.value) })}>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>
                  <div className="portfolio-editor__block-grid-preview">
                    {(block.content.images as { url: string; alt: string }[] || []).map((img, i) => (
                      <img key={i} src={img.url} alt={img.alt} className="portfolio-editor__block-thumb" />
                    ))}
                  </div>
                </>
              )}

              {/* Rich Text block */}
              {block.block_type === 'rich_text' && (
                <textarea
                  className="portfolio-editor__textarea"
                  rows={8}
                  placeholder="Enter HTML content..."
                  value={(block.content.html as string) || ''}
                  onChange={(e) => updateBlockContent(index, { ...block.content, html: e.target.value })}
                />
              )}

              {/* Video block */}
              {block.block_type === 'video' && (
                <input
                  type="url"
                  className="portfolio-editor__input"
                  placeholder="Video URL (YouTube, Vimeo, or direct)"
                  value={(block.content.url as string) || ''}
                  onChange={(e) => updateBlockContent(index, { ...block.content, url: e.target.value, source: detectVideoSource(e.target.value) })}
                />
              )}

              {/* Quote block */}
              {block.block_type === 'quote' && (
                <>
                  <textarea
                    className="portfolio-editor__textarea"
                    rows={3}
                    placeholder="Quote text..."
                    value={(block.content.text as string) || ''}
                    onChange={(e) => updateBlockContent(index, { ...block.content, text: e.target.value })}
                  />
                  <input
                    type="text"
                    className="portfolio-editor__input"
                    placeholder="Attribution"
                    value={(block.content.attribution as string) || ''}
                    onChange={(e) => updateBlockContent(index, { ...block.content, attribution: e.target.value })}
                  />
                </>
              )}

              {/* Divider block */}
              {block.block_type === 'divider' && (
                <div className="portfolio-editor__status-toggle">
                  {['line', 'space', 'dots'].map((style) => (
                    <label key={style} className={`portfolio-editor__status-option ${(block.content.style as string) === style ? 'portfolio-editor__status-option--active' : ''}`}>
                      <input type="radio" name={`divider-${index}`} value={style} checked={(block.content.style as string) === style} onChange={() => updateBlockContent(index, { ...block.content, style })} />
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </label>
                  ))}
                </div>
              )}

              {/* Audio block */}
              {block.block_type === 'audio' && (
                <>
                  <input type="url" className="portfolio-editor__input" placeholder="Audio URL" value={(block.content.url as string) || ''} onChange={(e) => updateBlockContent(index, { ...block.content, url: e.target.value })} />
                  <input type="text" className="portfolio-editor__input" placeholder="Title" value={(block.content.title as string) || ''} onChange={(e) => updateBlockContent(index, { ...block.content, title: e.target.value })} />
                </>
              )}

              {/* Embed block */}
              {block.block_type === 'embed' && (
                <input type="url" className="portfolio-editor__input" placeholder="Embed URL" value={(block.content.url as string) || ''} onChange={(e) => updateBlockContent(index, { ...block.content, url: e.target.value })} />
              )}

              {/* Carousel block */}
              {block.block_type === 'carousel' && (
                <>
                  <input type="file" accept="image/*" multiple onChange={(e) => {
                    if (e.target.files) handleBlockMultiImageUpload(index, e.target.files)
                  }} className="portfolio-editor__input" />
                  <div className="portfolio-editor__block-grid-preview">
                    {(block.content.images as { url: string; alt: string }[] || []).map((img, i) => (
                      <img key={i} src={img.url} alt={img.alt} className="portfolio-editor__block-thumb" />
                    ))}
                  </div>
                </>
              )}

              {/* Side by Side block */}
              {block.block_type === 'side_by_side' && (
                <>
                  <div className="portfolio-editor__field portfolio-editor__field--row">
                    <div className="portfolio-editor__field">
                      <label className="portfolio-editor__label">Left Type</label>
                      <select className="portfolio-editor__select" value={(block.content.left_type as string) || 'image'} onChange={(e) => updateBlockContent(index, { ...block.content, left_type: e.target.value })}>
                        <option value="image">Image</option>
                        <option value="text">Text</option>
                      </select>
                    </div>
                    <div className="portfolio-editor__field">
                      <label className="portfolio-editor__label">Right Type</label>
                      <select className="portfolio-editor__select" value={(block.content.right_type as string) || 'image'} onChange={(e) => updateBlockContent(index, { ...block.content, right_type: e.target.value })}>
                        <option value="image">Image</option>
                        <option value="text">Text</option>
                      </select>
                    </div>
                  </div>
                  <div className="portfolio-editor__field">
                    <label className="portfolio-editor__label">Ratio</label>
                    <select className="portfolio-editor__select" value={(block.content.ratio as string) || '50-50'} onChange={(e) => updateBlockContent(index, { ...block.content, ratio: e.target.value })}>
                      <option value="50-50">50 / 50</option>
                      <option value="60-40">60 / 40</option>
                      <option value="40-60">40 / 60</option>
                      <option value="70-30">70 / 30</option>
                      <option value="30-70">30 / 70</option>
                    </select>
                  </div>
                  {(block.content.left_type as string) === 'image' ? (
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBlockImageUpload(index, f, 'left_url') }} className="portfolio-editor__input" />
                  ) : (
                    <textarea className="portfolio-editor__textarea" rows={3} placeholder="Left content..." value={(block.content.left_text as string) || ''} onChange={(e) => updateBlockContent(index, { ...block.content, left_text: e.target.value })} />
                  )}
                  {(block.content.right_type as string) === 'image' ? (
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBlockImageUpload(index, f, 'right_url') }} className="portfolio-editor__input" />
                  ) : (
                    <textarea className="portfolio-editor__textarea" rows={3} placeholder="Right content..." value={(block.content.right_text as string) || ''} onChange={(e) => updateBlockContent(index, { ...block.content, right_text: e.target.value })} />
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {/* Add Block Button */}
        <div className="portfolio-editor__block-add">
          <button
            type="button"
            onClick={() => setShowBlockPicker(!showBlockPicker)}
            className="portfolio-editor__btn portfolio-editor__btn--outline"
          >
            + Add Block
          </button>

          {showBlockPicker && (
            <div className="portfolio-editor__block-picker">
              {BLOCK_TYPES.map((bt) => (
                <button
                  key={bt.value}
                  type="button"
                  onClick={() => addBlock(bt.value as EditableBlock['block_type'])}
                  className="portfolio-editor__block-picker-option"
                >
                  {bt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
