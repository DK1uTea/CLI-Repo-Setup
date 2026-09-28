import { NextIntlClientProvider } from 'next-intl'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import messages from '@/messages/en.json'
import ActivationItemCard from '@/features/cam/activation-view/(components)/case-board/activation-item-card'

const { push, updateStatus, toastError } = vi.hoisted(() => ({
  push: vi.fn(),
  updateStatus: vi.fn(),
  toastError: vi.fn(),
}))

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
  usePathname: () => '/customer-activation',
  useRouter: () => ({ push }),
}))

vi.mock('@/shared/stores/use-user-store', () => ({
  useUserStore: (selector: (state: { permissions: string[] }) => unknown) =>
    selector({ permissions: ['*'] }),
}))

vi.mock('@/features/cam/activation-detail/(hooks)/use-activation-detail-drawer-url', () => ({
  useActivationDetailDrawerUrl: () => ({ openDrawer: vi.fn() }),
}))

vi.mock('@/features/cam/activation-view/(hooks)/use-update-activation-status', () => ({
  useUpdateActivationStatus: () => ({ mutate: updateStatus, isPending: false }),
}))

vi.mock('@/shared/components/ui/option-menu', () => ({
  OptionMenu: ({ items }: { items: Array<{ key: string; label: string; onClick?: () => void; hidden?: boolean }> }) => (
    <>
      {items.filter((item) => !item.hidden).map((item) => (
        <button key={item.key} type="button" onClick={item.onClick}>{item.label}</button>
      ))}
    </>
  ),
}))

vi.mock('sonner', () => ({ toast: { error: toastError } }))

describe('ActivationItemCard', () => {
  beforeEach(() => {
    push.mockClear()
    updateStatus.mockClear()
    toastError.mockClear()
  })

  it('opens the scoring tab instead of approving when the score is zero', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ActivationItemCard
          item={{
            id: 'activation-1',
            name: 'Test activation',
            storeAddress: 'Berlin',
            status: 'REVIEW',
            owner: 'Test Owner',
            isOwner: true,
            fileCount: 0,
            chatCount: 0,
            evaluation: { score: 0, maxScore: 27 },
          }}
        />
      </NextIntlClientProvider>,
    )

    await userEvent.setup().click(
      screen.getByRole('button', { name: 'Move to Approved' }),
    )

    expect(updateStatus).not.toHaveBeenCalled()
    expect(toastError).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith(
      expect.stringMatching(/activation-1.*activationTab=scoring/),
    )
  })

  it('moves directly to approved when the score is greater than zero', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ActivationItemCard
          item={{
            id: 'activation-2',
            name: 'Scored activation',
            storeAddress: 'Berlin',
            status: 'REVIEW',
            owner: 'Test Owner',
            isOwner: true,
            fileCount: 0,
            chatCount: 0,
            evaluation: { score: 1, maxScore: 27 },
          }}
        />
      </NextIntlClientProvider>,
    )

    await userEvent.setup().click(
      screen.getByRole('button', { name: 'Move to Approved' }),
    )

    expect(updateStatus).toHaveBeenCalledWith({
      id: 'activation-2',
      status: 'APPROVED',
    })
    expect(toastError).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })
})
