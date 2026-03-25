'use client'

import { FollowButton } from '@/components/FollowButton'

export function ProjectFollowWrapper({ projectId }: { projectId: string }) {
  return <FollowButton projectId={projectId} />
}
