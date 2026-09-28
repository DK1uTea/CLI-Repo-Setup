'use client'

import { nowUtc } from '@/lib/date-utils'

const STORAGE_KEY = 'resendInviteCooldowns'
const COOLDOWN_SECONDS = 30

function readStore(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeStore(store: Record<string, number>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function useResendCooldown() {
  const getExpiresAt = (id: string) => readStore()[id] ?? 0

  const startCooldown = (id: string) => {
    const store = readStore()
    store[id] = nowUtc().getTime() + COOLDOWN_SECONDS * 1000
    writeStore(store)
  }

  return { getExpiresAt, startCooldown }
}
