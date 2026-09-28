import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UserRolesAccess } from '@/features/user-settings/roles-access/user-roles-access'
import { apiProxy } from '@/lib/api'
import messages from '@/messages/en.json'

vi.mock('@/lib/api', () => ({ apiProxy: { delete: vi.fn(), get: vi.fn(), post: vi.fn() } }))

const roles = [
  { id: 'role-admin', name: 'Administrator' },
  { id: 'role-editor', name: 'Editor' },
  { id: 'role-viewer', name: 'Viewer' },
]

const baseUser = {
  id: 'user-1',
  email: 'active@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  status: 'ACTIVE',
  role: { id: 'role-editor', name: 'Editor' },
  invitationId: 'invitation-1',
  isAllowGiveAccess: false,
  isAllowRemoveUser: false,
  isAllowRevoke: true,
  isExpired: false,
  lastLoginAt: '2026-08-01T10:00:00Z',
  createdAt: '2026-07-01T10:00:00Z',
  inviteBy: 'admin@example.com',
}

function mockApi(users: Array<Record<string, unknown>>) {
  vi.mocked(apiProxy.get).mockImplementation((url: string) => {
    if (url === '/user/access-users') {
      return Promise.resolve({ data: { data: { users, pagination: null } } }) as never
    }
    if (url === '/roles') {
      return Promise.resolve({
        data: { data: { items: roles, pagination: { hasNextPage: false, page: 1 } } },
      }) as never
    }
    return Promise.resolve({ data: { data: {} } }) as never
  })
}

function renderComponent() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QueryClientProvider client={queryClient}>
        <NuqsTestingAdapter>
          <UserRolesAccess />
        </NuqsTestingAdapter>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  )
}

async function confirm(actionLabel: string) {
  const dialog = await screen.findByRole('alertdialog')
  fireEvent.click(within(dialog).getByRole('button', { name: actionLabel }))
}

describe('UserRolesAccess actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('revokes access for an active user after confirmation', async () => {
    vi.mocked(apiProxy.post).mockResolvedValue({ data: {} })
    mockApi([baseUser])
    renderComponent()

    fireEvent.click(await screen.findByRole('button', { name: 'Revoke Access' }))
    expect(await screen.findByText('Revoke access?')).toBeVisible()
    await confirm('Revoke Access')

    await waitFor(() => {
      expect(apiProxy.post).toHaveBeenCalledWith('/user/revoke-account', { targetId: 'invitation-1' })
    })
  })

  it('grants access for a banned user after confirmation', async () => {
    vi.mocked(apiProxy.post).mockResolvedValue({ data: {} })
    mockApi([{ ...baseUser, status: 'BANNED', isAllowRevoke: false, isAllowGiveAccess: true }])
    renderComponent()

    fireEvent.click(await screen.findByRole('button', { name: 'Grant Access' }))
    expect(await screen.findByText('Grant access?')).toBeVisible()
    await confirm('Grant Access')

    await waitFor(() => {
      expect(apiProxy.post).toHaveBeenCalledWith('/user/grant-account', { targetId: 'invitation-1' })
    })
  })

  it('deletes a pending invitation after confirmation', async () => {
    vi.mocked(apiProxy.delete).mockResolvedValue({ data: {} })
    mockApi([{ ...baseUser, status: 'PENDING', isAllowRevoke: false, isAllowRemoveUser: true }])
    renderComponent()

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(await screen.findByText('Delete invitation?')).toBeVisible()
    await confirm('Delete')

    await waitFor(() => {
      expect(apiProxy.delete).toHaveBeenCalledWith('/user/invitation', { data: { id: 'invitation-1' } })
    })
  })

  it('resends a pending invitation after confirmation', async () => {
    vi.mocked(apiProxy.post).mockResolvedValue({ data: {} })
    mockApi([{ ...baseUser, status: 'PENDING', isAllowRevoke: true }])
    renderComponent()

    fireEvent.click(await screen.findByRole('button', { name: 'Resend' }))
    expect(await screen.findByText('Resend invitation?')).toBeVisible()
    await confirm('Resend')

    await waitFor(() => {
      expect(apiProxy.post).toHaveBeenCalledWith('/user/resend-invite-user', { id: 'invitation-1' })
    })
  })

  it('changes an active user\'s role, excluding their current role and Administrator', async () => {
    const user = userEvent.setup()
    vi.mocked(apiProxy.post).mockResolvedValue({ data: {} })
    mockApi([baseUser])
    renderComponent()

    fireEvent.click(await screen.findByRole('button', { name: 'Change Role' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText('Change User Role')).toBeVisible()
    expect(within(dialog).getByText('active@example.com')).toBeVisible()
    expect(within(dialog).getByText('Editor')).toBeVisible()

    await user.click(within(dialog).getByRole('combobox', { name: 'Select New Role' }))
    expect(screen.queryByRole('option', { name: 'Editor' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Administrator' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: 'Viewer' }))

    fireEvent.click(within(dialog).getByRole('button', { name: 'Change Role' }))

    await waitFor(() => {
      expect(apiProxy.post).toHaveBeenCalledWith('/user/change-role', {
        targetId: 'user-1',
        roleId: 'role-viewer',
      })
    })
  })

  it('disables the confirm action until a new role is selected', async () => {
    mockApi([baseUser])
    renderComponent()

    fireEvent.click(await screen.findByRole('button', { name: 'Change Role' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText('Change User Role')).toBeVisible()

    expect(within(dialog).getByRole('button', { name: 'Change Role' })).toBeDisabled()
  })
})
