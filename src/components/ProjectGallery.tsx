'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { FilterBar } from './FilterBar'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@/types'

export function ProjectGallery({ projects }: { projects: Project[] }) {
  const [activeDomains, setActiveDomains] = useState<Set<string>>(new Set())
  const [activeStages, setActiveStages] = useState<Set<string>>(new Set())
  const [activeLocation, setActiveLocation] = useState('')

  const allDomains = useMemo(() => {
    const domains = new Set<string>()
    projects.forEach(p => p.domains.forEach(d => domains.add(d)))
    return Array.from(domains).sort()
  }, [projects])

  const allStages = useMemo(() => {
    const stages = new Set<string>()
    projects.forEach(p => stages.add(p.stage))
    return Array.from(stages)
  }, [projects])

  const allLocations = useMemo(() => {
    const locs = new Set<string>()
    projects.forEach(p => { if (p.location) locs.add(p.location) })
    return Array.from(locs).sort()
  }, [projects])

  const handleDomainToggle = (domain: string) => {
    if (domain === '__all__') {
      setActiveDomains(new Set())
      return
    }
    setActiveDomains(prev => {
      const next = new Set(prev)
      if (next.has(domain)) next.delete(domain)
      else next.add(domain)
      return next
    })
  }

  const handleStageToggle = (stage: string) => {
    setActiveStages(prev => {
      const next = new Set(prev)
      if (next.has(stage)) next.delete(stage)
      else next.add(stage)
      return next
    })
  }

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const domainMatch = activeDomains.size === 0 || p.domains.some(d => activeDomains.has(d))
      const stageMatch = activeStages.size === 0 || activeStages.has(p.stage)
      const locationMatch = !activeLocation || p.location === activeLocation
      return domainMatch && stageMatch && locationMatch
    })
  }, [projects, activeDomains, activeStages, activeLocation])

  const [isTransitioning, setIsTransitioning] = useState(false)
  const filterChangeRef = useRef(false)

  useEffect(() => {
    if (!filterChangeRef.current) {
      filterChangeRef.current = true
      return
    }
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 50)
    return () => clearTimeout(timer)
  }, [activeDomains, activeStages, activeLocation])

  const liveProjects = useMemo(() => filtered.filter(p => p.source === 'supabase'), [filtered])
  const conceptProjects = useMemo(() => filtered.filter(p => p.source !== 'supabase'), [filtered])

  return (
    <>
      <FilterBar
        domains={allDomains}
        stages={allStages}
        locations={allLocations}
        activeDomains={activeDomains}
        activeStages={activeStages}
        activeLocation={activeLocation}
        onDomainToggle={handleDomainToggle}
        onStageToggle={handleStageToggle}
        onLocationChange={setActiveLocation}
      />

      {/* Live Projects */}
      {liveProjects.length > 0 && (
        <section className="container container--wide">
          <p className="section-label" style={{ marginBottom: 'var(--space-4)' }}>Live Projects</p>
          <div className={`project-grid${isTransitioning ? ' project-grid--transitioning' : ''}`}>
            {liveProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} transitionDelay={(i % 3) * 0.05} />
            ))}
          </div>
        </section>
      )}

      {/* AI Concept Projects removed — only showing live projects */}

      {liveProjects.length === 0 && (
        <section className="container container--wide">
          <p className="no-results">
            No projects match those filters right now. Try widening your selection.
          </p>
        </section>
      )}
    </>
  )
}
