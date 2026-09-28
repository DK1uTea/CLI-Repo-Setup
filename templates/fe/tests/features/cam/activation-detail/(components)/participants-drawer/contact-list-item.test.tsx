import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ContactListItem from '@/features/cam/activation-detail/(components)/participants-drawer/contact-list-item'

vi.mock(
  '@/features/cam/activation-detail/(components)/participants-drawer/contact-resend-button',
  () => ({ default: () => <button type="button">Resend</button> }),
)

describe('ContactListItem', () => {
  it('hides edit and delete buttons for the activation owner', () => {
    render(
      <ContactListItem
        contact={{
          id: 'contact-1',
          name: 'Store Owner',
          email: 'owner@example.com',
          tel: '+49 123',
          isOwner: true,
        }}
        activationId="activation-1"
        canManage
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Resend' })).toBeInTheDocument()
  })
})
