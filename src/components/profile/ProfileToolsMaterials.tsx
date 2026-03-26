import { Badge } from '@/components/ui/Badge'

export function ProfileToolsMaterials({ tools }: { tools: string[] }) {
  return (
    <div className="profile-tools-materials">
      <p className="section-label" style={{ marginBottom: 'var(--space-2)' }}>Tools &amp; Materials</p>
      <div className="profile-tools-materials__list">
        {tools.map(tool => (
          <Badge key={tool} variant="tool">{tool}</Badge>
        ))}
      </div>
    </div>
  )
}
