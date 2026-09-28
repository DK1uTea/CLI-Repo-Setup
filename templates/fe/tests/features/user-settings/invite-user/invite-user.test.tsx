import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import InviteUserMain from '@/features/user-settings/invite-user/invite-user'
import { apiProxy } from '@/lib/api'
import { initFieldErrors } from '@/lib/field-error'
import messages from '@/messages/en.json'

const { routerPush, toastError, searchParams } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  toastError: vi.fn(),
  searchParams: { value: '' },
}))

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn(), post: vi.fn() } }))
vi.mock('@/i18n/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/i18n/navigation')>()
  return { ...actual, useRouter: () => ({ push: routerPush }) }
})
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>()
  return { ...actual, useSearchParams: () => new URLSearchParams(searchParams.value) }
})
vi.mock('sonner', () => ({ toast: { error: toastError, success: vi.fn() } }))

const matrix = {
  permissions: [
    { key: 'events', name: 'Events', children: [{ key: 'events.view', name: 'View Events' }] },
  ],
  roles: [
    { id: 'role-editor', name: 'Editor', permissions: ['events.view'] },
    { id: 'role-viewer', name: 'Viewer', permissions: [] },
  ],
}

function renderComponent() {
  vi.mocked(apiProxy.get).mockResolvedValue({ data: { data: matrix } })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QueryClientProvider client={queryClient}>
        <InviteUserMain />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  )
}

describe('InviteUserMain', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchParams.value = ''
    initFieldErrors((key) => (key === 'fieldErrors.email' ? 'Please enter a valid email address' : key))
  })

  it('renders the email field linked to its label and the permission matrix', async () => {
    renderComponent()

    expect(screen.getByLabelText('Email Address')).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Editor' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Viewer' })).toBeVisible()
  })

  it('defaults the back link to the profile-management tab when no referer is set', async () => {
    renderComponent()

    await screen.findByRole('button', { name: 'Editor' })
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/en/user-settings?tab=profile-management',
    )
  })

  it('points the back link and cancel button at the referer tab', async () => {
    searchParams.value = 'referer=user-roles-access'
    renderComponent()

    await screen.findByRole('button', { name: 'Editor' })
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/en/user-settings?tab=user-roles-access',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(routerPush).toHaveBeenCalledWith('/user-settings?tab=user-roles-access')
  })

  it('shows a validation error and does not submit for an invalid email', async () => {
    renderComponent()
    await screen.findByRole('button', { name: 'Editor' })

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: 'Invite User' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Please enter a valid email address')
    expect(apiProxy.post).not.toHaveBeenCalled()
  })

  it('requires a role to be selected before submitting', async () => {
    renderComponent()
    await screen.findByRole('button', { name: 'Editor' })

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'new.user@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Invite User' }))

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Please select a role.'))
    expect(apiProxy.post).not.toHaveBeenCalled()
  })

  it('invites the user with the selected role and redirects to Roles & Access', async () => {
    vi.mocked(apiProxy.post).mockResolvedValue({ data: {} })
    renderComponent()
    await screen.findByRole('button', { name: 'Editor' })

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'new.user@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Editor' }))
    fireEvent.click(screen.getByRole('button', { name: 'Invite User' }))

    await waitFor(() => {
      expect(apiProxy.post).toHaveBeenCalledWith('/user/invite-user', {
        email: 'new.user@example.com',
        roleId: 'role-editor',
      })
      expect(routerPush).toHaveBeenCalledWith('/user-settings?tab=user-roles-access')
    })
  })
})
