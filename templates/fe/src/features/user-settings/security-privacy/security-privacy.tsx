'use client'

import { ChangePassword } from './(components)/change-password'
import { LoginHistoryTable } from './(components)/login-history-table'
import { ExportDataCard } from './(components)/export-data-card'

export function SecurityPrivacy() {
  return (
    <div className="space-y-6">
      <ChangePassword />
      <LoginHistoryTable />
      <ExportDataCard />
    </div>
  )
}
