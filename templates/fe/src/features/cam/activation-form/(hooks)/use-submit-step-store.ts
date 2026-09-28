'use client'

import { useTranslations } from 'next-intl'
import { parseAsBoolean, parseAsInteger, useQueryState } from 'nuqs'
import { useCreateStore } from './use-create-store'
import { useStoreTab } from './use-store-tab'
import { useUpdateStore } from './use-update-store'
import type { StoreFormData } from '../(helpers)/activation-schema'
import type { AxiosError } from 'axios'
import type { UseFormSetError } from 'react-hook-form'

export function useSubmitStepStore() {
  const t = useTranslations('activationForm')
  const [, setStep] = useQueryState('step', parseAsInteger.withDefault(1))
  const [editFromStep2, setEditFromStep2] = useQueryState(
    'editFromStep2',
    parseAsBoolean.withDefault(false),
  )
  const { mode, editStoreId, openExisting, returnToStep2 } = useStoreTab()
  const createStore = useCreateStore()
  const updateStore = useUpdateStore()

  function handleApiError(
    error: unknown,
    setError: UseFormSetError<StoreFormData>,
  ) {
    const responseMessage =
      (error as AxiosError<{ message?: string }>)?.response?.data?.message ?? ''

    if (responseMessage.includes('PHONE_ALREADY_EXISTS')) {
      setError('contactPhone', { message: t('store.phoneAlreadyExists') })
    } else if (responseMessage.includes('EMAIL_ALREADY_EXISTS')) {
      setError('contactEmail', { message: t('store.emailAlreadyExists') })
    }
  }

  function submit(
    data: StoreFormData,
    setError: UseFormSetError<StoreFormData>,
  ) {
    if (mode === 'new') {
      createStore.mutate(data, {
        onSuccess: ({ id }) => {
          openExisting(id, 2)
        },
        onError: (error) => handleApiError(error, setError),
      })
      return
    }

    if (mode === 'edit' && editStoreId) {
      updateStore.mutate(
        { id: editStoreId, data },
        {
          onSuccess: () => {
            if (editFromStep2) {
              setEditFromStep2(null)
              returnToStep2()
              setStep(2)
            } else {
              openExisting()
            }
          },
          onError: (error) => handleApiError(error, setError),
        },
      )
    }
  }

  return {
    submit,
    isCreating: createStore.isPending,
    isUpdating: updateStore.isPending,
  }
}
