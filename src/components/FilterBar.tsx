'use client'

interface Props {
  domains: string[]
  stages: string[]
  activeDomains: Set<string>
  activeStages: Set<string>
  onDomainToggle: (domain: string) => void
  onStageToggle: (stage: string) => void
}

export function FilterBar({ domains, stages, activeDomains, activeStages, onDomainToggle, onStageToggle }: Props) {
  return (
    <div className="filter-bar" id="projects">
      <div className="container">
        <span className="filter-label">Domains</span>
        <div className="filter-group">
          <button
            className={`filter-btn${activeDomains.size === 0 ? ' active' : ''}`}
            type="button"
            onClick={() => onDomainToggle('__all__')}
          >
            All
          </button>
          {domains.map(domain => (
            <button
              key={domain}
              className={`filter-btn${activeDomains.has(domain) ? ' active' : ''}`}
              type="button"
              onClick={() => onDomainToggle(domain)}
            >
              {domain}
            </button>
          ))}
        </div>
        <span className="filter-label" style={{ marginLeft: 'var(--space-4)' }}>Stage</span>
        <div className="filter-group">
          {stages.map(stage => (
            <button
              key={stage}
              className={`filter-btn${activeStages.has(stage) ? ' active' : ''}`}
              type="button"
              onClick={() => onStageToggle(stage)}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
