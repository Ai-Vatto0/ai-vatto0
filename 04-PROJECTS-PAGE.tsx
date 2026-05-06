// src/app/(app)/projects/page.tsx – PROJECTS TIMELINE (Screen 5)

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { ProjectCard } from '@/components/projects/ProjectCard'
import type { GenerationJob } from '@/types'

interface ProjectsPageProps {
  searchParams: Promise<{ type?: string }>
}

type FilterType = 'all' | 'image' | 'video' | 'story'

const FILTER_TABS: { id: FilterType; label: string }[] = [
  { id: 'all',   label: 'Alle' },
  { id: 'image', label: 'Bilder' },
  { id: 'video', label: 'Videos' },
  { id: 'story', label: 'Stories' },
]

interface JobWithCharacter extends GenerationJob {
  characters: {
    name: string
    character_images?: { image_url: string; position: number }[]
  } | null
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const activeFilter = (resolvedParams.type as FilterType | undefined) ?? 'all'

  const { data: jobs } = await supabase
    .from('generation_jobs')
    .select('*, characters(name, character_images(image_url, position))')
    .eq('user_id', user.id)
    .neq('job_type', 'character_ref')
    .order('created_at', { ascending: false })
    .limit(50)

  const allJobs = (jobs ?? []) as JobWithCharacter[]

  const filteredJobs = activeFilter === 'all'
    ? allJobs
    : allJobs.filter(j => j.job_type === activeFilter)

  const counts = {
    all:   allJobs.length,
    image: allJobs.filter(j => j.job_type === 'image').length,
    video: allJobs.filter(j => j.job_type === 'video').length,
    story: allJobs.filter(j => j.job_type === 'story').length,
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-snova-text-primary">
          Projekte
        </h1>
        <p className="text-xs text-snova-text-muted mt-0.5">
          {counts.image} Bilder · {counts.video} Videos · {counts.story} Stories
        </p>
      </div>

      {/* Filter-Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <Link
            key={tab.id}
            href={tab.id === 'all' ? '/projects' : `/projects?type=${tab.id}`}
            className={[
              'flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
              activeFilter === tab.id
                ? 'border-snova-purple bg-snova-purple/20 text-snova-purple-light'
                : 'border-snova-border bg-snova-bg-tertiary text-snova-text-muted hover:text-snova-text-secondary',
            ].join(' ')}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className="ml-1.5 text-[10px] opacity-70">{counts[tab.id]}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Leerer State */}
      {filteredJobs.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-snova-purple/10 flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-snova-purple-light/50" />
          </div>
          <h2 className="font-display text-xl font-bold text-snova-text-primary mb-2">
            {activeFilter === 'all' ? 'Noch leer' : `Keine ${FILTER_TABS.find(t => t.id === activeFilter)?.label ?? ''} vorhanden`}
          </h2>
          <p className="text-sm text-snova-text-muted mb-4">
            {activeFilter === 'all'
              ? 'Starten Sie mit Create Studio – generieren Sie Bilder, Videos oder Stories'
              : 'Erstelle dein erstes Projekt'
            }
          </p>
          <Link
            href="/create-studio"
            className="btn-nova-primary"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              width: 'auto',
              textDecoration: 'none',
            }}
          >
            Zu Create Studio
          </Link>
        </div>
      )}

      {/* Project Grid */}
      {filteredJobs.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {filteredJobs.map(job => (
            <ProjectCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
