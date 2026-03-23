'use client'
import { useState, useMemo } from 'react'
import { FilterBar } from './FilterBar'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@/types'

export function ProjectGallery({ projects }: { projects: Project[] }) {
  const [activeDomains, setActiveDomains] = useState<Set<string>>(new Set())
  const [activeStages, setActiveStages] = useState<Set<string>>(new Set())

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
      return domainMatch && stageMatch
    })
  }, [projects, activeDomains, activeStages])

  return (
    <>
      <FilterBar
        domains={allDomains}
        stages={allStages}
        activeDomains={activeDomains}
        activeStages={activeStages}
        onDomainToggle={handleDomainToggle}
        onStageToggle={handleStageToggle}
      />
      <section className="container container--wide">
        <div className="project-grid">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {filtered.length === 0 && (
            <p className="no-results">
              No projects match those filters right now. Try widening your selection.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
