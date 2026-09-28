import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ManageUserRoles } from '@/features/user-settings/user-roles/manage-user-roles'
import { apiProxy } from '@/lib/api'
import messages from '@/messages/en.json'

const { routerPush } = vi.hoisted(() => ({ routerPush: vi.fn() }))

vi.mock('@/lib/api', () => ({ apiProxy: { delete: vi.fn(), get: vi.fn(), post: vi.fn() } }))
vi.mock('@/i18n/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/i18n/navigation')>()
  return { ...actual, useRouter: () => ({ push: routerPush }) }
})

const baseRole = {
  id: 'role-1',
  name: 'Test Role',
  description: 'Test Description',
  isSystem: false,
  permissions: [],
  updatedAt: '2026-08-19T10:00:00Z',
  createdBy: 'Admin',
}

function renderComponent(roles: Array<Record<string, unknown>>, searchParams = '') {
  vi.mocked(apiProxy.get).mockResolvedValue({
    data: { data: { items: roles, pagination: { totalPages: 1 } } },
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QueryClientProvider client={queryClient}>
        <NuqsTestingAdapter searchParams={searchParams}>
          <ManageUserRoles />
        </NuqsTestingAdapter>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  )
}

describe('ManageUserRoles', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders headers including Status after Created By', async () => {
    renderComponent([baseRole])

    expect(await screen.findByText('Test Role')).toBeVisible()
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent)
    expect(headers).toEqual(['Role', 'Description', 'IP Access', 'Created By', 'Status', ''])
  })

  it('renders role IP when ip field is present and non-empty', async () => {
    renderComponent([{ ...baseRole, id: 'role-1', ip: '192.168.1.1' }])

    expect(await screen.findByText('192.168.1.1')).toBeVisible()
  })

  it('renders "All" when ip field is empty string or undefined', async () => {
    renderComponent([
      { ...baseRole, id: 'role-1', name: 'Role 1', ip: '' },
      { ...baseRole, id: 'role-2', name: 'Role 2', ip: undefined },
    ])

    expect(await screen.findByText('Role 1')).toBeVisible()
    const allCells = await screen.findAllByText('All')
    expect(allCells).toHaveLength(2)
  })

  it('renders status badges with correct variant data-variant attributes', async () => {
    renderComponent([
      { ...baseRole, id: 'role-1', name: 'Role 1', status: 'ACTIVE' },
      { ...baseRole, id: 'role-2', name: 'Role 2', status: 'INACTIVE' },
      { ...baseRole, id: 'role-3', name: 'Role 3', status: 'DRAFT' },
    ])

    expect(await screen.findByText('Role 1')).toBeVisible()

    const activeBadge = screen.getByText('Active')
    const inactiveBadge = screen.getByText('Inactive')
    const draftBadge = screen.getByText('DRAFT')

    expect(activeBadge).toHaveAttribute('data-variant', 'success')
    expect(inactiveBadge).toHaveAttribute('data-variant', 'destructive')
    expect(draftBadge).toHaveAttribute('data-variant', 'warning')
  })

  it('renders Duplicate before Edit and Delete for a non-system role', async () => {
    renderComponent([baseRole])

    expect(await screen.findByText('Test Role')).toBeVisible()

    const duplicateBtn = screen.getByRole('button', { name: 'Duplicate' })
    const editBtn = screen.getByRole('link', { name: 'Edit' })
    const deleteBtn = screen.getByRole('button', { name: 'Delete' })

    expect(duplicateBtn).toBeVisible()
    expect(editBtn).toBeVisible()
    expect(deleteBtn).toBeVisible()

    expect(duplicateBtn.compareDocumentPosition(editBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(editBtn.compareDocumentPosition(deleteBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('duplicates a non-system role after confirmation', async () => {
    vi.mocked(apiProxy.post).mockResolvedValue({
      data: {
        data: { ...baseRole, id: 'duplicated-role-id', name: 'Test Role (duplicate)' },
      },
    })
    renderComponent([baseRole])

    fireEvent.click(await screen.findByRole('button', { name: 'Duplicate' }))
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Duplicate' }))

    await waitFor(() => {
      expect(apiProxy.post).toHaveBeenCalledWith('/roles/role-1/duplicate')
      expect(routerPush).toHaveBeenCalledWith('/user-settings/edit-user-role/duplicated-role-id')
      expect(apiProxy.get).toHaveBeenCalledTimes(1)
    })
  })

  it('hides all action buttons for a system role', async () => {
    renderComponent([{ ...baseRole, isSystem: true }])

    expect(await screen.findByText('Test Role')).toBeVisible()

    expect(screen.queryByRole('button', { name: 'Duplicate' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('requests only deleted roles when Show Archived Roles is active', async () => {
    renderComponent([baseRole])

    expect(await screen.findByText('Test Role')).toBeVisible()

    const showArchivedBtn = screen.getByRole('button', { name: 'Show Archived Roles' })
    expect(showArchivedBtn).toBeVisible()

    fireEvent.click(showArchivedBtn)

    await waitFor(() => {
      expect(apiProxy.get).toHaveBeenLastCalledWith('/roles', {
        params: { search: undefined, page: 1, limit: 10, onlyDeleted: true },
      })
    })
  })

  it('hides Duplicate and Edit actions for an archived role', async () => {
    renderComponent([baseRole], '?deleted_roles=true')

    expect(await screen.findByText('Test Role')).toBeVisible()

    expect(screen.queryByRole('button', { name: 'Duplicate' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible()
  })

  it('deletes an active role without the permanent-delete suffix', async () => {
    vi.mocked(apiProxy.delete).mockResolvedValue({ data: {} })
    renderComponent([baseRole])

    expect(await screen.findByText('Test Role')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(apiProxy.delete).toHaveBeenCalledWith('/roles/role-1')
    })
  })

  it('permanently deletes an archived role after confirmation', async () => {
    vi.mocked(apiProxy.delete).mockResolvedValue({ data: {} })
    renderComponent([baseRole], '?deleted_roles=true')

    await waitFor(() => {
      expect(apiProxy.get).toHaveBeenLastCalledWith('/roles', {
        params: { search: undefined, page: 1, limit: 10, onlyDeleted: true },
      })
    })
    expect(await screen.findByText('Test Role')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(apiProxy.delete).toHaveBeenCalledWith('/roles/role-1/primary')
    })
  })

  it('cancelling the confirm dialog does not call the mutation', async () => {
    renderComponent([baseRole])

    fireEvent.click(await screen.findByRole('button', { name: 'Duplicate' }))
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(apiProxy.post).not.toHaveBeenCalled()
  })

  it('searches roles by keyword, resetting to page 1', async () => {
    renderComponent([baseRole])
    expect(await screen.findByText('Test Role')).toBeVisible()

    fireEvent.change(screen.getByPlaceholderText('Search Role...'), { target: { value: 'Admin' } })

    await waitFor(() => {
      expect(apiProxy.get).toHaveBeenLastCalledWith('/roles', {
        params: { search: 'Admin', page: 1, limit: 10 },
      })
    })
  })

  it('renders the "Add Role" link pointing to the add-role route', async () => {
    renderComponent([baseRole])

    expect(await screen.findByText('Test Role')).toBeVisible()
    expect(screen.getByRole('link', { name: /Add Role/ })).toHaveAttribute(
      'href',
      '/en/user-settings/add-user-role',
    )
  })

  it('shows the empty state when there are no roles', async () => {
    renderComponent([])

    expect(await screen.findByText('No roles found.')).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows pagination only when there is more than one page and changes page on click', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({
      data: { data: { items: [baseRole], pagination: { totalPages: 2 } } },
    })
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <QueryClientProvider client={queryClient}>
          <NuqsTestingAdapter>
            <ManageUserRoles />
          </NuqsTestingAdapter>
        </QueryClientProvider>
      </NextIntlClientProvider>,
    )

    expect(await screen.findByText('Test Role')).toBeVisible()
    expect(screen.getByRole('navigation')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: /Go to page 2/i }))

    await waitFor(() => {
      expect(apiProxy.get).toHaveBeenLastCalledWith('/roles', {
        params: { search: undefined, page: 2, limit: 10 },
      })
    })
  })
})
