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
  const selectedDomain = activeDomains.size === 1 ? Array.from(activeDomains)[0] : ''
  const selectedStage = activeStages.size === 1 ? Array.from(activeStages)[0] : ''

  return (
    <div className="filter-bar" id="projects" role="search" aria-label="Filter projects">
      <div className="container">
        <div className="filters-compact">
          <select
            value={selectedDomain}
            onChange={e => {
              onDomainToggle('__all__')
              if (e.target.value) onDomainToggle(e.target.value)
            }}
            className={`filter-select${selectedDomain ? ' filter-select--active' : ''}`}
            aria-label="Filter by domain"
          >
            <option value="">All Domains</option>
            {domains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
          <select
            value={selectedStage}
            onChange={e => {
              // Clear all stages first, then set new one
              // Spread to array first to avoid mutating Set during iteration
              [...activeStages].forEach(s => onStageToggle(s))
              if (e.target.value) onStageToggle(e.target.value)
            }}
            className={`filter-select${selectedStage ? ' filter-select--active' : ''}`}
            aria-label="Filter by stage"
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
