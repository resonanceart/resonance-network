import { supabaseAdmin } from './supabase'

export type SaveReason =
  | 'manual_save'
  | 'autosave'
  | 'import'
  | 'admin_edit'
  | 'reimport'
  | 'claim_finalize'

/**
 * Append a history row capturing the profile's state BEFORE a save.
 *
 * Pairs with the `profile_history` table + prune trigger migrated in
 * 20260410000005_profile_history_table.sql. The trigger keeps only the 5
 * most recent rows per profile.
 *
 * Call this BEFORE updating the row so the snapshot represents the
 * about-to-be-replaced state. It is best-effort: any failure is logged
 * and swallowed so the main save path still completes. Single-level
 * `previous_snapshot` columns are still written by the callers, so if
 * this insert fails the old undo path remains available.
 *
 * @param profileId         user_profiles.id (always the target user, not the admin acting on them)
 * @param userProfileRow    full current row from user_profiles (nullable — first save of a new profile)
 * @param profileExtendedRow full current row from profile_extended (nullable — no extended row yet)
 * @param saveReason        matches the save_reason check constraint on the table
 * @param savedByUserId     auth.users.id of the actor (admin or owner). Optional.
 */
export async function appendProfileHistory({
  profileId,
  userProfileRow,
  profileExtendedRow,
  saveReason,
  savedByUserId,
}: {
  profileId: string
  userProfileRow: Record<string, unknown> | null
  profileExtendedRow: Record<string, unknown> | null
  saveReason: SaveReason
  savedByUserId?: string | null
}): Promise<void> {
  // If there is no current state at all, nothing to snapshot (first save
  // of a freshly-created row). Skip silently.
  if (!userProfileRow) return

  // Strip the snapshot columns themselves before storing — keeping them
  // would nest snapshots inside snapshots on every save.
  const stripSnapshotFields = (row: Record<string, unknown>) => {
    const { previous_snapshot: _ps, previous_snapshot_at: _psa, ...rest } = row
    void _ps
    void _psa
    return rest
  }

  const userSnapshot = stripSnapshotFields(userProfileRow)
  const extSnapshot = profileExtendedRow ? stripSnapshotFields(profileExtendedRow) : null

  try {
    const { error } = await supabaseAdmin.from('profile_history').insert({
      profile_id: profileId,
      user_profile_snapshot: userSnapshot,
      profile_extended_snapshot: extSnapshot,
      save_reason: saveReason,
      saved_by_user_id: savedByUserId || null,
    })
    if (error) {
      console.warn(
        '[profile-history] insert failed (non-blocking):',
        error.message,
        { profileId, saveReason }
      )
    }
  } catch (err) {
    console.warn(
      '[profile-history] insert threw (non-blocking):',
      (err as Error).message,
      { profileId, saveReason }
    )
  }
}

/**
 * Count how many history rows exist for a profile (0–5). The frontend
 * uses this to show "N undos available" on the undo button.
 */
export async function getProfileHistoryCount(profileId: string): Promise<number> {
  try {
    const { count } = await supabaseAdmin
      .from('profile_history')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profileId)
    return count || 0
  } catch {
    return 0
  }
}
