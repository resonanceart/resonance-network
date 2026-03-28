import type { ProfileTool } from '@/types'

interface ProfileToolsDisplayProps {
  tools: ProfileTool[]
}

const CATEGORY_COLORS: Record<ProfileTool['category'], string> = {
  software: 'var(--badge-engineering)',
  hardware: 'var(--badge-fabrication)',
  materials: 'var(--badge-architecture)',
  processes: 'var(--badge-production)',
}

export function ProfileToolsDisplay({ tools }: ProfileToolsDisplayProps) {
  if (!tools || tools.length === 0) return null

  // Sort all tools by display_order
  const sorted = [...tools].sort((a, b) => a.display_order - b.display_order)

  // Group by category, preserving order of first appearance
  const categoryOrder: ProfileTool['category'][] = []
  const grouped = new Map<ProfileTool['category'], ProfileTool[]>()

  for (const tool of sorted) {
    if (!grouped.has(tool.category)) {
      categoryOrder.push(tool.category)
      grouped.set(tool.category, [])
    }
    grouped.get(tool.category)!.push(tool)
  }

  return (
    <div className="profile-tools-display">
      {categoryOrder.map(category => {
        const categoryTools = grouped.get(category)!
        return (
          <div key={category} className="profile-tools-display__category">
            <span className="profile-tools-display__category-label">
              <span
                className="profile-tools-display__dot"
                style={{ backgroundColor: CATEGORY_COLORS[category] }}
              />
              {category}
            </span>
            <div className="profile-tools-display__tags">
              {categoryTools.map(tool => (
                <span key={tool.id} className="profile-tools-display__tag">
                  {tool.tool_name}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
