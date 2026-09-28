import { NextIntlClientProvider } from 'next-intl'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import messages from '@/messages/en.json'
import { StoreRowActions } from '@/features/cam/activation-view/(components)/store/store-row-actions'

const mutate = vi.fn()

vi.mock('@/features/cam/activation-view/(hooks)/use-admin-store-actions', () => ({
  useToggleAdminStoreStatus: () => ({ mutate, isPending: false }),
}))

describe('StoreRowActions', () => {
  beforeEach(() => mutate.mockClear())

  it.each([
    { status: 'ACTIVE', menuAction: 'Disable store', dialogTitle: 'Disable store?' },
    { status: 'INACTIVE', menuAction: 'Enable store', dialogTitle: 'Enable store?' },
  ])('asks for confirmation before selecting $menuAction', async ({
    status,
    menuAction,
    dialogTitle,
  }) => {
    const user = userEvent.setup()
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StoreRowActions
          storeId="store-1"
          storeName="Berlin Central"
          status={status}
          onViewDetail={vi.fn()}
          onEdit={vi.fn()}
        />
      </NextIntlClientProvider>,
    )

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('menuitem', { name: menuAction }))

    expect(mutate).not.toHaveBeenCalled()
    expect(screen.getByRole('alertdialog', { name: dialogTitle })).toBeInTheDocument()
    expect(screen.getByText(/Berlin Central/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: menuAction }))

    expect(mutate).toHaveBeenCalledWith(
      { id: 'store-1', currentStatus: status },
      expect.any(Object),
    )
  })
})
