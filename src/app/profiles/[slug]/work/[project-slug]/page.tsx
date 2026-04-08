import { supabaseAdmin } from '@/lib/supabase'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProjectBlockRenderer } from '@/components/profile/ProjectBlockRenderer'
import type { PortfolioProject, ProjectContentBlock } from '@/types'

export const revalidate = 60

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

async function getPortfolioProject(profileSlug: string, projectSlug: string) {
  const { data: users } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('profile_visibility', 'published')

  const user = users?.find(u => slugify(u.display_name) === profileSlug)
  if (!user) return null

  const { data: project } = await supabaseAdmin
    .from('portfolio_projects')
    .select('*')
    .eq('profile_id', user.id)
    .eq('slug', projectSlug)
    .eq('status', 'published')
    .single()

  if (!project) return null

  const { data: blocks } = await supabaseAdmin
    .from('portfolio_content_blocks')
    .select('*')
    .eq('project_id', project.id)
    .order('display_order')

  return {
    ...project,
    content_blocks: (blocks || []) as ProjectContentBlock[],
    profile_name: user.display_name,
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; 'project-slug': string }
}): Promise<Metadata> {
  const data = await getPortfolioProject(params.slug, params['project-slug'])
  if (!data) return { title: 'Project Not Found' }
  return {
    title: `${data.title} — ${data.profile_name} | Resonance Network`,
    description: data.tagline || data.description || `Portfolio project by ${data.profile_name}`,
    openGraph: {
      title: data.title,
      description: data.tagline || '',
      images: data.cover_image_url ? [{ url: data.cover_image_url }] : [],
    },
  }
}

export default async function PortfolioProjectPage({
  params,
}: {
  params: { slug: string; 'project-slug': string }
}) {
  const data = await getPortfolioProject(params.slug, params['project-slug'])
  if (!data) notFound()

  const project = data as PortfolioProject & {
    content_blocks: ProjectContentBlock[]
    profile_name: string
  }

  const dateRange = project.start_date
    ? `${formatDate(project.start_date)} – ${project.end_date ? formatDate(project.end_date) : 'Ongoing'}`
    : null

  return (
    <main className="project-page">
      {/* Cover Image Hero */}
      {project.cover_image_url && (
        <div className="project-page__hero">
          <Image
            src={project.cover_image_url}
            alt={project.title}
            width={1600}
            height={500}
            sizes="100vw"
            priority
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Project Header */}
      <section className="project-page__header">
        <h1>{project.title}</h1>
        {project.tagline && <p className="project-page__tagline">{project.tagline}</p>}
        <div className="project-page__meta">
          {project.category && (
            <span className="project-page__category">{project.category}</span>
          )}
          {project.role && <span className="project-page__role">{project.role}</span>}
          {dateRange && <span className="project-page__dates">{dateRange}</span>}
        </div>
      </section>

      {/* Content Blocks */}
      {project.content_blocks.length > 0 && (
        <section className="project-page__content">
          {project.content_blocks.map(block => (
            <ProjectBlockRenderer key={block.id} block={block} />
          ))}
        </section>
      )}

      {/* Footer: Links, Tools, Appreciation */}
      <footer className="project-page__footer">
        {project.external_links && project.external_links.length > 0 && (
          <div className="project-page__links">
            <h3>Links</h3>
            <div className="project-page__links-list">
              {project.external_links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-page__link-button"
                >
                  {link.label}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {project.tools_used && project.tools_used.length > 0 && (
          <div className="project-page__tools">
            <h3>Tools Used</h3>
            <div className="project-page__tools-list">
              {project.tools_used.map((tool, i) => (
                <span key={i} className="project-page__tool-pill">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.appreciation_count > 0 && (
          <div className="project-page__appreciation">
            <span className="project-page__appreciation-icon" aria-hidden="true">
              ♥
            </span>
            <span>
              {project.appreciation_count}{' '}
              {project.appreciation_count === 1 ? 'appreciation' : 'appreciations'}
            </span>
          </div>
        )}
      </footer>
    </main>
  )
}
