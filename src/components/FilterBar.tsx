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
    <div className="filter-bar" id="projects" role="search" aria-label="Filter projects">
      <div className="container">
        <span className="filter-label" id="domain-filter-label">Domains</span>
        <div className="filter-group" role="group" aria-labelledby="domain-filter-label">
          <button
            className={`filter-btn${activeDomains.size === 0 ? ' active' : ''}`}
            type="button"
            onClick={() => onDomainToggle('__all__')}
            aria-pressed={activeDomains.size === 0}
          >
            All
          </button>
          {domains.map(domain => (
            <button
              key={domain}
              className={`filter-btn${activeDomains.has(domain) ? ' active' : ''}`}
              type="button"
              onClick={() => onDomainToggle(domain)}
              aria-pressed={activeDomains.has(domain)}
            >
              {domain}
            </button>
          ))}
        </div>
        <span className="filter-label" id="stage-filter-label" style={{ marginLeft: 'var(--space-4)' }}>Stage</span>
        <div className="filter-group" role="group" aria-labelledby="stage-filter-label">
          {stages.map(stage => (
            <button
              key={stage}
              className={`filter-btn${activeStages.has(stage) ? ' active' : ''}`}
              type="button"
              onClick={() => onStageToggle(stage)}
              aria-pressed={activeStages.has(stage)}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
