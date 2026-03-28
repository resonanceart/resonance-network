'use client'

import { useState, useCallback } from 'react'
import { ProfileChecklist } from './ProfileChecklist'

import { AvatarEditor } from './editors/AvatarEditor'
import { CoverEditor } from './editors/CoverEditor'
import { BioEditor } from './editors/BioEditor'
import { IdentityEditor } from './editors/IdentityEditor'
import { SkillsEditor } from './editors/SkillsEditor'
import { AvailabilityEditor } from './editors/AvailabilityEditor'
import { LinksEditor } from './editors/LinksEditor'

type EditorSection = 'avatar' | 'cover' | 'bio' | 'identity' | 'skills' | 'availability' | 'links' | null

interface ProfileEditOverlayProps {
  profileId: string
  profileSlug: string
  isOwner: boolean
  children: React.ReactNode
  hasAvatar: boolean
  hasBio: boolean
  hasSkills: boolean
  hasAvailability: boolean
  hasCover: boolean
  hasWork: boolean
}

export function ProfileEditOverlay({
  profileId,
  profileSlug,
  isOwner,
  children,
  hasAvatar,
  hasBio,
  hasSkills,
  hasAvailability,
  hasCover,
  hasWork,
}: ProfileEditOverlayProps) {
  const [editMode, setEditMode] = useState(false)
  const [activeEditor, setActiveEditor] = useState<EditorSection>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEditorClose = useCallback(() => {
    setActiveEditor(null)
  }, [])

  const handleEditorSave = useCallback(() => {
    setRefreshKey((k) => k + 1)
    setActiveEditor(null)
    window.location.reload()
  }, [])

  function handleEditableClick(e: React.MouseEvent) {
    if (!editMode) return
    const target = (e.target as HTMLElement).closest('[data-editable]')
    if (target) {
      const section = target.getAttribute('data-editable') as EditorSection
      if (section) {
        e.preventDefault()
        e.stopPropagation()
        setActiveEditor(section)
      }
    }
  }

  if (!isOwner) {
    return <>{children}</>
  }

  return (
    <div
      className={editMode ? 'profile-page--edit-mode' : ''}
      onClick={editMode ? handleEditableClick : undefined}
      key={refreshKey}
    >
      <div className="profile-edit-bar">
        <div className="profile-edit-bar__inner container">
          <span className="profile-edit-bar__text">You are viewing your profile</span>
          <button
            className="btn btn--primary btn--sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Done Editing' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {children}

      <ProfileChecklist
        hasAvatar={hasAvatar}
        hasBio={hasBio}
        hasSkills={hasSkills}
        hasAvailability={hasAvailability}
        hasCover={hasCover}
        hasProject={hasWork}
        onEditSection={(section: string) => {
          setEditMode(true)
          setActiveEditor(section as EditorSection)
        }}
      />

      {activeEditor === 'avatar' && (
        <AvatarEditor profileSlug={profileSlug} onClose={handleEditorClose} onSave={handleEditorSave} />
      )}
      {activeEditor === 'cover' && (
        <CoverEditor profileSlug={profileSlug} onClose={handleEditorClose} onSave={handleEditorSave} />
      )}
      {activeEditor === 'bio' && (
        <BioEditor profileSlug={profileSlug} onClose={handleEditorClose} onSave={handleEditorSave} />
      )}
      {activeEditor === 'identity' && (
        <IdentityEditor profileSlug={profileSlug} onClose={handleEditorClose} onSave={handleEditorSave} />
      )}
      {activeEditor === 'skills' && (
        <SkillsEditor profileSlug={profileSlug} onClose={handleEditorClose} onSave={handleEditorSave} />
      )}
      {activeEditor === 'availability' && (
        <AvailabilityEditor profileSlug={profileSlug} onClose={handleEditorClose} onSave={handleEditorSave} />
      )}
      {activeEditor === 'links' && (
        <LinksEditor profileSlug={profileSlug} onClose={handleEditorClose} onSave={handleEditorSave} />
      )}
    </div>
  )
}
