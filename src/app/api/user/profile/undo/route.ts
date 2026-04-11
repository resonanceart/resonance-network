import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

// Resolve the undo target, mirroring the same admin_edit_as handshake
// used by /api/user/profile's resolveTargetUserId helper. Regular users
// can only undo their own row; admins may act on another user via the
// `admin_edit_as` query param or `x-admin-edit-as` header.
async function resolveTargetUserId(
  request: Request,
  authUserId: string
): Promise<{ targetId: string; isAdminOverride: boolean; error?: NextResponse }> {
  const url = new URL(request.url)
  const headerOverride = request.headers.get('x-admin-edit-as')
  const queryOverride = url.searchParams.get('admin_edit_as')
  const override = headerOverride || queryOverride

  if (!override || override === authUserId) {
    return { targetId: authUserId, isAdminOverride: false }
  }

  const { data: callerProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', authUserId)
    .maybeSingle()

  if (!callerProfile || callerProfile.role !== 'admin') {
    return {
      targetId: authUserId,
      isAdminOverride: false,
      error: NextResponse.json(
        { error: 'Forbidden: admin role required for admin_edit_as.' },
        { status: 403 }
      ),
    }
  }

  const { data: targetProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('id', override)
    .maybeSingle()

  if (!targetProfile) {
    return {
      targetId: authUserId,
      isAdminOverride: false,
      error: NextResponse.json(
        { error: 'admin_edit_as target user not found.' },
        { status: 404 }
      ),
    }
  }

  return { targetId: override, isAdminOverride: true }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolved = await resolveTargetUserId(request, user.id)
    if (resolved.error) return resolved.error
    const { targetId, isAdminOverride } = resolved

    // Read the current state of both rows. We need every column from
    // user_profiles so the "redo" snapshot we stash back is complete.
    const [{ data: currentUserRow }, { data: currentExtRow }] = await Promise.all([
      supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle(),
      supabaseAdmin
        .from('profile_extended')
        .select('*')
        .eq('id', targetId)
        .maybeSingle(),
    ])

    // ─── Primary source: profile_history table (up to 5 rows) ───
    // Pull the newest row for this profile; if present, use it as the
    // source of truth for the restore. After restoring we DELETE that
    // row so the next undo walks one step further back. This gives a
    // true multi-level undo instead of the single-level column swap.
    const { data: historyRow } = await supabaseAdmin
      .from('profile_history')
      .select('id, user_profile_snapshot, profile_extended_snapshot, created_at')
      .eq('profile_id', targetId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let userSnapshot: Record<string, unknown> | null | undefined
    let extSnapshot: Record<string, unknown> | null | undefined
    let historyRowIdToConsume: string | null = null
    let historySnapshotAt: string | null = null

    if (historyRow) {
      userSnapshot = historyRow.user_profile_snapshot as Record<string, unknown> | null
      extSnapshot = historyRow.profile_extended_snapshot as Record<string, unknown> | null
      historyRowIdToConsume = String(historyRow.id)
      historySnapshotAt = (historyRow.created_at as string) || null
    } else {
      // ─── Fallback: legacy single-level previous_snapshot columns ───
      // Used for profiles that predate the history table and for any
      // save that failed to append a history row. Behavior matches the
      // old undo code path.
      userSnapshot = (currentUserRow as Record<string, unknown> | null)?.previous_snapshot as
        | Record<string, unknown>
        | null
        | undefined
      extSnapshot = (currentExtRow as Record<string, unknown> | null)?.previous_snapshot as
        | Record<string, unknown>
        | null
        | undefined
    }

    const hasUserSnapshot = userSnapshot && typeof userSnapshot === 'object'
    const hasExtSnapshot = extSnapshot && typeof extSnapshot === 'object'

    if (!hasUserSnapshot && !hasExtSnapshot) {
      return NextResponse.json(
        {
          success: false,
          error: 'nothing_to_undo',
          message: 'No previous snapshot to restore.',
        },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    let userReverted = false
    let extReverted = false
    let revertedAt: string | null = null

    // Capture the earlier snapshot timestamps so the response can tell
    // the UI roughly when the restored state was originally saved.
    const userSnapshotAt =
      (currentUserRow as Record<string, unknown> | null)?.previous_snapshot_at as string | null | undefined
    const extSnapshotAt =
      (currentExtRow as Record<string, unknown> | null)?.previous_snapshot_at as string | null | undefined

    // user_profiles restore: set every column from the snapshot, and
    // swap previous_snapshot to the current state so "undo" can act as
    // a one-step redo.
    if (hasUserSnapshot && currentUserRow) {
      const {
        previous_snapshot: _cps,
        previous_snapshot_at: _cpsa,
        ...currentUserForRedo
      } = currentUserRow as Record<string, unknown>
      void _cps
      void _cpsa

      // Exclude immutable/identity fields that should never be rewritten
      // by an undo (id is the PK; created_at is historical).
      const { id: _id, created_at: _createdAt, ...restorable } = userSnapshot as Record<string, unknown>
      void _id
      void _createdAt

      const restorePayload: Record<string, unknown> = {
        ...restorable,
        previous_snapshot: currentUserForRedo,
        previous_snapshot_at: now,
      }

      const { error: userErr } = await supabaseAdmin
        .from('user_profiles')
        .update(restorePayload)
        .eq('id', targetId)

      if (userErr) {
        console.error('profile/undo user_profiles restore error:', userErr.message, {
          isAdminOverride,
          adminId: isAdminOverride ? user.id : undefined,
          targetId,
        })
      } else {
        userReverted = true
        if (userSnapshotAt) revertedAt = userSnapshotAt
      }
    }

    // profile_extended restore: same pattern. If the row never existed
    // (no current row) we have no snapshot to draw from anyway.
    if (hasExtSnapshot && currentExtRow) {
      const {
        previous_snapshot: _ceps,
        previous_snapshot_at: _cepsa,
        ...currentExtForRedo
      } = currentExtRow as Record<string, unknown>
      void _ceps
      void _cepsa

      const { id: _eid, created_at: _eCreatedAt, ...extRestorable } = extSnapshot as Record<string, unknown>
      void _eid
      void _eCreatedAt

      const extRestorePayload: Record<string, unknown> = {
        id: targetId,
        ...extRestorable,
        previous_snapshot: currentExtForRedo,
        previous_snapshot_at: now,
      }

      const { error: extErr } = await supabaseAdmin
        .from('profile_extended')
        .upsert(extRestorePayload, { onConflict: 'id' })

      if (extErr) {
        console.error('profile/undo profile_extended restore error:', extErr.message, {
          isAdminOverride,
          adminId: isAdminOverride ? user.id : undefined,
          targetId,
        })
      } else {
        extReverted = true
        if (!revertedAt && extSnapshotAt) revertedAt = extSnapshotAt
      }
    }

    // If the restore came from profile_history and at least one side was
    // successfully reverted, consume (delete) that history row so the
    // next undo walks further back. If the restore came from the legacy
    // column fallback, there is nothing to consume — the column swap
    // already handled redo state.
    if (historyRowIdToConsume && (userReverted || extReverted)) {
      const { error: consumeErr } = await supabaseAdmin
        .from('profile_history')
        .delete()
        .eq('id', historyRowIdToConsume)
      if (consumeErr) {
        console.warn(
          '[profile/undo] failed to delete consumed history row (non-blocking):',
          consumeErr.message,
          { historyRowIdToConsume }
        )
      }
    }

    // Prefer the history row's created_at as the "reverted from" timestamp
    // when the restore came from the table — it is more accurate than the
    // swapped previous_snapshot_at that gets written during the restore.
    if (historySnapshotAt) revertedAt = historySnapshotAt

    // Count remaining history rows so the client can show "N undos left".
    let remainingHistoryCount = 0
    try {
      const { count } = await supabaseAdmin
        .from('profile_history')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', targetId)
      remainingHistoryCount = count || 0
    } catch {
      remainingHistoryCount = 0
    }

    console.log(
      'profile/undo: user',
      targetId,
      'reverted by',
      user.id,
      'admin_override=',
      isAdminOverride,
      'source=',
      historyRowIdToConsume ? 'history' : 'legacy_column',
      'remaining=',
      remainingHistoryCount
    )

    if (!userReverted && !extReverted) {
      return NextResponse.json(
        {
          success: false,
          error: 'restore_failed',
          message: 'Unable to restore previous snapshot.',
        },
        { status: 500 }
      )
    }

    const partial = (hasUserSnapshot && !userReverted) || (hasExtSnapshot && !extReverted)

    return NextResponse.json({
      success: true,
      partial,
      user_profile_reverted: userReverted,
      profile_extended_reverted: extReverted,
      reverted_at: revertedAt,
      remaining_history: remainingHistoryCount,
      source: historyRowIdToConsume ? 'history' : 'legacy_column',
      message: partial
        ? 'Profile partially reverted to previous snapshot'
        : 'Profile reverted to previous snapshot',
    })
  } catch (e) {
    console.error('profile/undo unexpected error:', e)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
