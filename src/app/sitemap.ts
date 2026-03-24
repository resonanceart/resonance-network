import type { MetadataRoute } from 'next'
import projectsData from '../../data/projects.json'
import profilesData from '../../data/profiles.json'
import type { Project, Profile } from '@/types'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://resonance.network'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date('2026-03-24'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collaborate`,
      lastModified: new Date('2026-03-24'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2026-03-24'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date('2026-03-24'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: new Date('2026-03-24'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/profiles`,
      lastModified: new Date('2026-03-24'),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  const projectRoutes: MetadataRoute.Sitemap = (projectsData as Project[])
    .filter(p => p.status === 'published')
    .map(p => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: new Date('2026-03-24'),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }))

  const profileRoutes: MetadataRoute.Sitemap = (profilesData as Profile[])
    .filter(p => p.status === 'published')
    .map(p => ({
      url: `${baseUrl}/profiles/${p.slug}`,
      lastModified: new Date('2026-03-24'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  return [...staticRoutes, ...projectRoutes, ...profileRoutes]
}
