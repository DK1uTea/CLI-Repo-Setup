# Module: user-settings

## Route

| | |
|---|---|
| Path | `/de/user-settings` |
| Sidebar label (German) | `Benutzereinstellungen` |
| Behind auth | yes |
| Permission-gated | Tabs `user-roles-access` / `manage-user-roles` and routes `invite-user` / `add-user-role` / `edit-user-role/[id]` are wildcard-admin only. `profile-management` / `security-privacy` have no permission gate. |

## Purpose

Four tabs: **Profile** (name/address/language/theme/avatar), **Security & Privacy**
(password, login history, personal-data export), **User Roles & Access** (admin: invite,
grant/revoke, resend, delete invite, change role), **Manage User Roles** (admin: list,
create, edit, duplicate, delete role).

## Data — see `src/features/user-settings/CONTEXT.md` for the full endpoint table

Already covered by existing `flow.spec.ts` / `content.spec.ts`: reaching the module, all 4
tabs render, profile tab is default + avatar section, tab selection is deep-linkable,
avatar initials from the real account, console clean.

## Behaviour — this pass (`validation.spec.ts` + `content.spec.ts`)

### Profile
- [x] Rejects a first name shorter than 2 characters and does not save
- [ ] Rejects an invalid phone format — deferred: the account's own phone field has no
  reliable known-invalid fixture value that doesn't risk being accepted by a looser
  backend rule than assumed; needs a live-confirmed invalid value first.
- [ ] Editing name and saving, switching Language/date format — all deferred, see Out of
  Scope: a real profile `PUT` (even just the name) still mutates the one shared account,
  and a language switch reloads with a different locale that would desync every other
  spec's assumption that this account's `preferredLanguage` is `de`.

### Security & Privacy
- [x] Rejects a new-password/confirmation mismatch and does not call `/change-password`
  (confirmed live: this branch's error text is the untranslated zod default "Invalid
  input", not a localized German string — a real i18n gap, asserted as observed)
- [x] Shows the paginated login history list
- [x] The personal-data export button starts a real `.zip` download (this endpoint is
  read-only — no account mutation — so it's in scope unlike the other admin actions)
- [ ] Rejects a new password that fails the shared auth policy — deferred: not yet
  confirmed live what that policy actually rejects beyond the mismatch case.

### Roles & Access — admin
- [x] Renders the access-user list with search input and role filter
- [x] Grant/Revoke and Change Role row actions are visible for this wildcard-admin account
- [x] Invite: rejects an empty email and an invalid email format, never calling
  `/invite-user`
- [ ] Resend/Delete-invite visibility — deferred: the real list only had active users, no
  pending invitation row to observe live; needs one before asserting its actions.

### Manage User Roles — admin
- [x] Renders the role list with search input, archived-roles toggle, and Add-role link
- [x] System roles (`isSystem: true`, confirmed against `use-get-list-roles.ts`'s real
  field, not the "System" text some rows happen to show in "Erstellt von") expose no
  Duplicate/Edit/Delete
- [x] Active non-system roles expose Duplicate, Edit and Delete
- [ ] Archived-roles toggle's Delete-only gating, and create-role empty-field validation —
  deferred to keep this pass to what was confirmed live; no `add-user-role` observation
  was done yet.

## Out of Scope (this pass — real, destructive side effects on the one shared account)

- **Changing the real password** — would lock every other spec's `signIn`/`authenticateViaApi`
  out of the shared account. Never automated without a disposable/secondary account.
- **Sending a real invite email**, granting/revoking/changing a real user's role, resending
  or deleting a real invitation — mutates real backend user/role state shared by the whole
  suite and by real people.
- **Creating, editing, duplicating, or deleting a real role** — same shared-state risk;
  deleting the wrong role (or one another spec depends on) cannot be undone via the UI for
  system roles and is hard to distinguish from a real admin's role.
- **Removing/replacing the real avatar image** — mutates the one shared profile's stored
  file; only additive, reversible-in-the-UI profile field edits (name) are in scope.
- Non-`de` locale full walkthrough beyond confirming the locale-switch mechanism fires.

## Open Questions

- None of the mutation-risk items above will be automated without an explicit, disposable
  test account/opt-in flag — same reasoning as `calendar-dashboard.md`'s
  `E2E_CAM_ALLOW_MUTATIONS` precedent. Recommend: **read-only / non-destructive coverage
  only** (list rendering, validation-before-submit, permission-gated visibility) for admin
  and password/avatar flows in this pass.
