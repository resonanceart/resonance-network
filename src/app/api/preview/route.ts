import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  if (!type || !id) {
    return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
  }

  if (!['project', 'profile'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const table = type === 'project' ? 'project_submissions' : 'collaborator_profiles'

  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
