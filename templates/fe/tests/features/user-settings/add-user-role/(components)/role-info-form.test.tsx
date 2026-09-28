import { render, screen, waitFor } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { useEffect } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { describe, expect, it } from 'vitest'

import { RoleInfoForm } from '@/features/user-settings/add-user-role/(components)/role-info-form'
import type { AddRoleFormValues } from '@/features/user-settings/add-user-role/(helpers)/add-role-schema'
import messages from '@/messages/en.json'

function TestWrapper({ defaultValues }: { defaultValues?: Partial<AddRoleFormValues> }) {
  const methods = useForm<AddRoleFormValues>({
    defaultValues: {
      name: '',
      status: 'ACTIVE',
      description: '',
      permissions: [],
      ...defaultValues,
    },
  })

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <FormProvider {...methods}>
        <RoleInfoForm />
      </FormProvider>
    </NextIntlClientProvider>
  )
}

function ResetAfterMountWrapper() {
  const methods = useForm<AddRoleFormValues>({
    defaultValues: {
      name: '',
      status: 'ACTIVE',
      description: '',
      permissions: [],
    },
  })

  useEffect(() => {
    methods.reset({
      name: 'Sales manager',
      status: 'INACTIVE',
      description: 'Manages the sales team',
      permissions: [],
    })
  }, [methods])

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <FormProvider {...methods}>
        <RoleInfoForm />
      </FormProvider>
    </NextIntlClientProvider>
  )
}

describe('RoleInfoForm', () => {
  it('renders Status select beside role name with Active as default value', () => {
    render(<TestWrapper />)

    expect(screen.getByLabelText(/Role name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders Inactive when status is set to INACTIVE in form values', () => {
    render(<TestWrapper defaultValues={{ status: 'INACTIVE' }} />)

    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('renders text field values after the form is reset with role details', async () => {
    render(<ResetAfterMountWrapper />)

    await waitFor(() => {
      expect(screen.getByLabelText(/Role name/i)).toHaveValue('Sales manager')
      expect(screen.getByLabelText(/Description/i)).toHaveValue('Manages the sales team')
      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })
  })
})
