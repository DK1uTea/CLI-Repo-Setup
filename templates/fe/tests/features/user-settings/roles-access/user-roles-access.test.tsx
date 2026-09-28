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

function mockApi(users: Array<Record<string, unknown>>, pagination: Record<string, unknown> | null = null) {
  vi.mocked(apiProxy.get).mockImplementation((url: string) => {
    if (url === '/user/access-users') {
      return Promise.resolve({ data: { data: { users, pagination } } }) as never
    }
    if (url === '/roles') {
      return Promise.resolve({
        data: { data: { items: roles, pagination: { hasNextPage: false, page: 1 } } },
      }) as never
    }
    return Promise.resolve({ data: { data: {} } }) as never
  })
}

function renderComponent(searchParams = '') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QueryClientProvider client={queryClient}>
        <NuqsTestingAdapter searchParams={searchParams} hasMemory>
          <UserRolesAccess />
        </NuqsTestingAdapter>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  )
}

function lastAccessUsersCall() {
  return vi
    .mocked(apiProxy.get)
    .mock.calls.filter(([url]) => url === '/user/access-users')
    .at(-1)
}

describe('UserRolesAccess', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the table headers', async () => {
    mockApi([baseUser])
    renderComponent()

    expect(await screen.findByText('active@example.com')).toBeVisible()
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent?.trim())
    expect(headers).toEqual(['User', 'Name', 'Last Login', 'Status', 'Role', 'Added On', 'Invited By', ''])
  })

  it('shows "-" for name and invited by when absent', async () => {
    mockApi([{ ...baseUser, firstName: '', lastName: '', inviteBy: undefined }])
    renderComponent()

    expect(await screen.findByText('active@example.com')).toBeVisible()
    const dashes = screen.getAllByText('-')
    expect(dashes.length).toBeGreaterThanOrEqual(2)
  })

  it('renders a status badge per user status', async () => {
    mockApi([
      { ...baseUser, id: 'u1', email: 'a@example.com', status: 'ACTIVE' },
      { ...baseUser, id: 'u2', email: 'b@example.com', status: 'PENDING' },
      { ...baseUser, id: 'u3', email: 'c@example.com', status: 'BANNED' },
    ])
    renderComponent()

    expect(await screen.findByText('a@example.com')).toBeVisible()
    expect(screen.getByText('Active')).toBeVisible()
    expect(screen.getByText('Invited')).toBeVisible()
    expect(screen.getByText('Disabled')).toBeVisible()
  })

  it('shows the change-role action only for active users', async () => {
    mockApi([
      { ...baseUser, id: 'u1', email: 'active@example.com', status: 'ACTIVE' },
      { ...baseUser, id: 'u2', email: 'pending@example.com', status: 'PENDING', isAllowRemoveUser: true },
    ])
    renderComponent()

    expect(await screen.findByText('active@example.com')).toBeVisible()
    expect(screen.getAllByRole('button', { name: 'Change Role' })).toHaveLength(1)
  })

  it('hides revoke access when the user is not allowed to be revoked', async () => {
    mockApi([{ ...baseUser, isAllowRevoke: false }])
    renderComponent()

    expect(await screen.findByText('active@example.com')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Revoke Access' })).not.toBeInTheDocument()
  })

  it('shows resend and delete for a pending invite with both flags enabled', async () => {
    mockApi([{
      ...baseUser,
      status: 'PENDING',
      isAllowRevoke: true,
      isAllowRemoveUser: true,
    }])
    renderComponent()

    expect(await screen.findByText('active@example.com')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Resend' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible()
  })

  it('shows grant access and delete for a banned user with both flags enabled', async () => {
    mockApi([{
      ...baseUser,
      status: 'BANNED',
      isAllowRevoke: false,
      isAllowGiveAccess: true,
      isAllowRemoveUser: true,
    }])
    renderComponent()

    expect(await screen.findByText('active@example.com')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Grant Access' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible()
  })

  it('shows the empty state when there are no users', async () => {
    mockApi([])
    renderComponent()

    expect(await screen.findByText('No users found.')).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('sorts ascending on the first click of a header', async () => {
    const user = userEvent.setup()
    mockApi([baseUser])
    renderComponent()
    expect(await screen.findByText('active@example.com')).toBeVisible()
    const userHeader = screen.getAllByRole('columnheader')[0]

    await user.click(within(userHeader).getByRole('button'))

    await waitFor(() => {
      expect(lastAccessUsersCall()?.[1]).toMatchObject({ params: expect.objectContaining({ sort: 'email:asc' }) })
    })
  })

  it('sorts descending on the second click of an already-ascending header', async () => {
    const user = userEvent.setup()
    mockApi([baseUser])
    renderComponent('?sort=email%3A%3Aasc')
    expect(await screen.findByText('active@example.com')).toBeVisible()
    const userHeader = screen.getAllByRole('columnheader')[0]

    await user.click(within(userHeader).getByRole('button'))

    await waitFor(() => {
      expect(lastAccessUsersCall()?.[1]).toMatchObject({ params: expect.objectContaining({ sort: 'email:desc' }) })
    })
  })

  it('clears sort on the third click of an already-descending header', async () => {
    const user = userEvent.setup()
    mockApi([baseUser])
    renderComponent('?sort=email%3A%3Adesc')
    expect(await screen.findByText('active@example.com')).toBeVisible()
    const userHeader = screen.getAllByRole('columnheader')[0]

    await user.click(within(userHeader).getByRole('button'))

    await waitFor(() => {
      expect(lastAccessUsersCall()?.[1]).toMatchObject({ params: expect.objectContaining({ sort: undefined }) })
    })
  })

  it('filters by role and resets to page 1', async () => {
    const user = userEvent.setup()
    mockApi([baseUser])
    renderComponent('?page=3')
    expect(await screen.findByText('active@example.com')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'All Roles' }))
    await user.click(await screen.findByRole('button', { name: 'Editor' }))

    await waitFor(() => {
      expect(lastAccessUsersCall()?.[1]).toMatchObject({
        params: expect.objectContaining({ roleId: 'role-editor', page: 1 }),
      })
    })
  })

  it('renders pagination only when there is more than one page', async () => {
    mockApi([baseUser], { totalPages: 3, currentPage: 1 })
    renderComponent()

    expect(await screen.findByText('active@example.com')).toBeVisible()
    expect(screen.getByRole('navigation')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: /Go to page 2/i }))
    await waitFor(() => {
      expect(lastAccessUsersCall()?.[1]).toMatchObject({ params: expect.objectContaining({ page: 2 }) })
    })
  })

  it('hides pagination when there is a single page', async () => {
    mockApi([baseUser], { totalPages: 1, currentPage: 1 })
    renderComponent()

    expect(await screen.findByText('active@example.com')).toBeVisible()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
