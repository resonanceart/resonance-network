'use client'

import { useState, useEffect, useRef } from 'react'

interface ProfileTabsClientProps {
  children: React.ReactNode
  tabs: { key: string; label: string; sections: string[] }[]
  defaultTab?: string
}

export function ProfileTabsClient({ children, tabs, defaultTab }: ProfileTabsClientProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key || 'work')
  const contentRef = useRef<HTMLDivElement>(null)

  const activeSections = tabs.find(t => t.key === activeTab)?.sections || []

  useEffect(() => {
    if (!contentRef.current) return
    const sectionEls = contentRef.current.querySelectorAll('[data-section]')
    sectionEls.forEach(el => {
      const section = el.getAttribute('data-section')
      if (section && activeSections.includes(section)) {
        el.classList.remove('profile-section--hidden')
      } else {
        el.classList.add('profile-section--hidden')
      }
    })
  }, [activeTab, activeSections])

  return (
    <>
      <div className="profile-tabs">
        <div className="container">
          <nav className="profile-tabs__nav" aria-label="Profile sections">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`profile-tabs__tab${activeTab === tab.key ? ' profile-tabs__tab--active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                aria-selected={activeTab === tab.key}
                role="tab"
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="profile-tabs__content" role="tabpanel" ref={contentRef}>
        {children}
      </div>
    </>
  )
}
