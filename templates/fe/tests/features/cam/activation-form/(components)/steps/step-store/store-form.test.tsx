import { NextIntlClientProvider } from 'next-intl'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import messages from '@/messages/en.json'
import { StoreForm } from '@/features/cam/activation-form/(components)/steps/step-store/store-form'

describe('StoreForm', () => {
  it('fills the edit fields when store detail arrives after the form mounts', () => {
    const onSubmit = vi.fn()
    const view = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StoreForm formId="store-form" onSubmit={onSubmit} />
      </NextIntlClientProvider>,
    )

    view.rerender(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StoreForm
          formId="store-form"
          defaultValues={{
            storeId: 'store-1',
            storeName: 'Updated Store',
            storeAddress: 'Berlin',
            contactName: 'Jane Doe',
            contactPhone: '+49123456789',
            contactEmail: 'jane@example.com',
          }}
          onSubmit={onSubmit}
        />
      </NextIntlClientProvider>,
    )

    expect(screen.getByLabelText(/Store name/i)).toHaveValue('Updated Store')
    expect(screen.getByLabelText(/Address/i)).toHaveValue('Berlin')
    expect(screen.getByLabelText(/Contact name/i)).toHaveValue('Jane Doe')
    expect(screen.getByLabelText(/Phone/i)).toHaveValue('+49123456789')
    expect(screen.getByLabelText(/Email/i)).toHaveValue('jane@example.com')
  })
})
