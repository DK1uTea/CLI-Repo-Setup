'use client'

import { ActivationStatsCards } from '../dashboard/activation-stats-cards'
import { ActivationCasesTable } from '../dashboard/activation-cases-table'

export function ActivationAdminDashboard() {
  return (
    <div className="space-y-5">
      <ActivationStatsCards />
      <ActivationCasesTable />
    </div>
  )
}
