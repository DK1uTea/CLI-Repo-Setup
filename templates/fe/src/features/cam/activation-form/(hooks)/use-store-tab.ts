'use client'

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'

export type StoreTabMode = 'existing' | 'new' | 'edit'

export function useStoreTab() {
  const [state, setState] = useQueryStates({
    storeTab: parseAsString.withDefault('existing'),
    editStoreId: parseAsString.withDefault(''),
    storeId: parseAsString.withDefault(''),
    step: parseAsInteger.withDefault(1),
  })

  const mode = state.storeTab as StoreTabMode

  function openExisting(storeId?: string, step?: number) {
    setState({
      storeTab: 'existing',
      editStoreId: '',
      storeId: storeId ?? null,
      ...(step === undefined ? {} : { step }),
    })
  }

  function returnToStep2() {
    setState({ storeTab: 'existing', editStoreId: '' })
  }

  function openNewStore() {
    setState({ storeTab: 'new', editStoreId: '' })
  }

  function openEditStore(id: string) {
    setState({ storeTab: 'edit', editStoreId: id })
  }

  return {
    mode,
    editStoreId: state.editStoreId,
    openExisting,
    openNewStore,
    openEditStore,
    returnToStep2,
  }
}
