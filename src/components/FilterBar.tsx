'use client'

interface Props {
  domains: string[]
  stages: string[]
  locations: string[]
  activeDomains: Set<string>
  activeStages: Set<string>
  activeLocation: string
  onDomainToggle: (domain: string) => void
  onStageToggle: (stage: string) => void
  onLocationChange: (location: string) => void
}

export function FilterBar({ domains, stages, locations, activeDomains, activeStages, activeLocation, onDomainToggle, onStageToggle, onLocationChange }: Props) {
  const selectedDomain = activeDomains.size === 1 ? Array.from(activeDomains)[0] : ''
  const selectedStage = activeStages.size === 1 ? Array.from(activeStages)[0] : ''

  return (
    <div className="filter-bar" role="search" aria-label="Filter projects">
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
            <option value="">Domains</option>
            {domains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
          <select
            value={selectedStage}
            onChange={e => {
              Array.from(activeStages).forEach(s => onStageToggle(s))
              if (e.target.value) onStageToggle(e.target.value)
            }}
            className={`filter-select${selectedStage ? ' filter-select--active' : ''}`}
            aria-label="Filter by stage"
          >
            <option value="">Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
          {locations.length > 0 && (
            <select
              value={activeLocation}
              onChange={e => onLocationChange(e.target.value)}
              className={`filter-select${activeLocation ? ' filter-select--active' : ''}`}
              aria-label="Filter by location"
            >
              <option value="">Location</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  )
}
