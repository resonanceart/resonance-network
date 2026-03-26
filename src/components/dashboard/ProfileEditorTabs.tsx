'use client'

interface ProfileEditorTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'cv', label: 'CV & Recognition' },
  { id: 'links', label: 'Links' },
]

export default function ProfileEditorTabs({ activeTab, onTabChange }: ProfileEditorTabsProps) {
  return (
    <div className="profile-editor-tabs" role="tablist">
      {TABS.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`profile-editor-tabs__tab${activeTab === tab.id ? ' profile-editor-tabs__tab--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
