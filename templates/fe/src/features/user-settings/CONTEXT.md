# User settings feature context

This file is the business/API source of truth for
`src/features/user-settings`. Read it before changing profile/preferences,
security, invitations, access, or roles.

## Scope and routes

Main route: `/[locale]/user-settings`. URL tabs:

- `profile-management`
- `security-privacy`
- `user-roles-access` (admin permission)
- `manage-user-roles` (admin permission)

Related routes: `/user-settings/invite-user`,
`/user-settings/add-user-role`, `/user-settings/edit-user-role/[id]`.
Admin tabs and invite action are guarded by `ComponentGuard`; backend permission
checks remain authoritative.

`user-roles-access`, `manage-user-roles`, invite-user, add-role, and edit-role
are wildcard-admin only.

## Runtime flow

```text
SettingMain
  -> profile query
  -> reset React Hook Form
  -> edit profile/address/language/theme/avatar
  -> presign + direct upload avatar when needed
  -> PUT profile / PATCH avatar
  -> invalidate profile and ["me"]
```

```text
admin tab
  -> URL filters/page
  -> users/roles query
  -> grant/revoke/resend/change/delete mutation
  -> invalidate affected list
```

```text
add/edit role
  -> permission tree or role detail
  -> RHF + Zod
  -> POST/PUT role
  -> invalidate role list/detail
```

## Profile and security rules

- Profile response tolerates nested or top-level identity fields.
- Save escapes first/last name, allows optional phone, uppercases appearance,
  sends welcome/metrics/activity/sales/quick-setting toggles, and includes only
  complete addresses. An incomplete address is omitted rather than partially
  submitted.
- Language-region payload includes preferred language, timezone, currency, and
  date format. Success updates locale/appearance cookies. Locale changes cause a
  full reload; other saves invalidate profile and `["me"]`.
- First and last name are 2-100 characters; email and phone must be valid.
- Avatar flow is presign -> direct object upload -> attach key. Removal has its
  own DELETE endpoint.
- Password form requires current/new/confirmation; new password uses the shared
  auth policy and confirmation must match. Incorrect-current-password errors bind
  to current password; other backend errors bind to new password. Success clears
  all password fields.
- Login history is paged. Personal-data export is a downloaded blob.

## Access and role rules

- Access-user inputs are search, role ID, sort, page, and per-page. UI sort
  `field::direction` maps to API `field:direction`; search/role changes reset
  page.
- Grant/revoke send `{targetId}`; resend/delete invitation send `{id}` (delete
  uses request body); role change sends `{targetId, roleId}`.
- Invite requires valid email and a selected role, then sends
  `{email, roleId}`. `/roles/matrix` supplies the matrix.
- `/roles` and legacy `/role/list` are separate contracts.
  The manage-roles archived toggle sends `onlyDeleted: true` to `/roles` while active.
  `/role/list` supports archived filtering with status `ARCHIVED`.
- System roles expose no row actions. Active non-system roles expose Duplicate, Edit, and
  Delete; archived non-system roles expose only Delete for permanent deletion.
- Confirming Duplicate sends `POST /roles/{id}/duplicate`, marks role-list caches stale
  without immediately refetching them, and navigates to
  `/user-settings/edit-user-role/{duplicatedRoleId}` using the returned ID.
- Create/update role sends `{name, description, permissions}`. When all leaf
  permissions in a group are selected, parent/group keys are added to the
  payload; edit displays leaf permissions.
- `DELETE /api/roles/{id}` deletes an active role. In archived mode,
  `DELETE /api/roles/{id}/primary` permanently deletes the already-deleted role.

## API flow inventory

| Method | Browser path | Purpose | Source |
| --- | --- | --- | --- |
| GET | `/api/user/profile` | Profile settings | `profile-management/(hooks)/use-get-profile-setting.ts` |
| PUT | `/api/user/profile` | Save profile/address/settings | `use-submit-profile-setting.ts` |
| GET | `/api/user/presigned-upload-url` | Presign avatar | `use-presign-avatar.ts` |
| PUT | `{presignedUrl}` | Upload avatar object | same hook |
| PATCH | `/api/user/avatar` | Attach uploaded avatar | `use-upload-avatar.ts` |
| DELETE | `/api/user/remove-avatar` | Remove avatar | `use-remove-avatar.ts` |
| PATCH | `/api/user/change-password` | Change password | `security-privacy/(hooks)/use-change-password.ts` |
| GET | `/api/auth/histories` | Login history | `use-login-history.ts` |
| GET | `/api/user/export-personal-data` | Download personal data | `use-export-data.ts` |
| GET | `/api/user/access-users` | Access/invite list | `roles-access/(hooks)/*` |
| POST | `/api/user/grant-account` | Grant account | `use-grant-account.ts` |
| POST | `/api/user/revoke-account` | Revoke account | `use-revoke-account.ts` |
| POST | `/api/user/resend-invite-user` | Resend invite | `use-resend-invite.ts` |
| DELETE | `/api/user/invitation` | Delete invite; ID is body data | `use-delete-invite.ts` |
| POST | `/api/user/change-role` | Change user role | `use-change-role.ts` |
| POST | `/api/user/invite-user` | Send invitation | `invite-user/(hooks)/use-send-invite-user.ts` |
| GET | `/api/roles/matrix` | Invite permission matrix | `use-matrix-permission.ts` |
| GET | `/api/roles` | Role list/infinite list | `user-roles/(hooks)/*` |
| POST | `/api/roles` | Create role | `add-user-role/(hooks)/use-create-role.ts` |
| GET | `/api/roles/{id}` | Role detail | `edit-user-role/(hooks)/use-get-role-detail.ts` |
| PUT | `/api/roles/{id}` | Update role | `use-update-role.ts` |
| DELETE | `/api/roles/{id}` | Delete active role | `user-roles/(hooks)/use-delete-role.ts` |
| DELETE | `/api/roles/{id}/primary` | Permanently delete archived role | `user-roles/(hooks)/use-delete-role.ts` |
| POST | `/api/roles/{id}/duplicate` | Duplicate role | `user-roles/(hooks)/use-duplicate-role.ts` |
| GET | `/api/permissions` | Permission tree | `use-role-permissions.ts` |
| GET | `/api/role/list` | Legacy role options | `use-roles-list-data.ts` |

Unprefixed paths are forwarded to core by the catch-all proxy. Important query
families: `setting/profile`, `me`, `user-access-list`, `access-users`,
`roles-list`, `roles-list-infinite`, `role-detail`, `role-permissions`,
`roles-matrix`, and `session-histories`.

## Change checklist

Keep both `/roles` and `/role/list` models separate until their response
contracts are confirmed. Profile saves must invalidate both profile and `me`.
Language/theme changes must be tested after reload and locale redirect. Password
rules are shared with auth; update schema and translations together. Test admin
guard plus backend denial, not only the visible UI. Role tests must assert that
permanent deletion is limited to archived mode.
