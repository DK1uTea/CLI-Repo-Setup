import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SecurityPrivacy } from '@/features/user-settings/security-privacy/security-privacy'

vi.mock('@/features/user-settings/security-privacy/(components)/change-password', () => ({
  ChangePassword: () => <div data-testid="change-password" />,
}))
vi.mock('@/features/user-settings/security-privacy/(components)/login-history-table', () => ({
  LoginHistoryTable: () => <div data-testid="login-history-table" />,
}))
vi.mock('@/features/user-settings/security-privacy/(components)/export-data-card', () => ({
  ExportDataCard: () => <div data-testid="export-data-card" />,
}))

describe('SecurityPrivacy', () => {
  it('composes the tab from exactly 3 sections: password, login history, export', () => {
    render(<SecurityPrivacy />)

    expect(screen.getByTestId('change-password')).toBeInTheDocument()
    expect(screen.getByTestId('login-history-table')).toBeInTheDocument()
    expect(screen.getByTestId('export-data-card')).toBeInTheDocument()
  })
})
