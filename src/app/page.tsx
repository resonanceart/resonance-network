import { ProjectGallery } from '@/components/ProjectGallery'
import projectsData from '../../data/projects.json'
import type { Project } from '@/types'

export default function HomePage() {
  const projects = projectsData as Project[]

  return (
    <>
      {/* Hero */}
      <section className="site-hero">
        <img
          src="https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1600&q=85&fit=crop"
          alt="Immersive light installation"
          className="site-hero__img"
        />
        <div className="site-hero__overlay"></div>
        <div className="site-hero__content">
          <h1 className="site-hero__title">A curated network for visionary projects shaping the future of art, architecture, technology, ecology, and social impact.</h1>
          <p className="site-hero__sub">Discover ambitious ideas, connect with collaborators, and help bold projects move from concept to reality.</p>
          <div className="site-hero__actions">
            <a href="#projects" className="btn btn--primary btn--large">Explore Projects</a>
            <a href="/submit" className="btn btn--outline btn--large">Submit a Project</a>
          </div>
        </div>
      </section>

      {/* Project Gallery with filtering */}
      <ProjectGallery projects={projects} />
    </>
  )
}
