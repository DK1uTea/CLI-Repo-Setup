import { ReactNode } from 'react'
import { ActivationViewHeader } from './activation-view-header'

interface ActivationViewLayoutProps {
  children: ReactNode
}

export function ActivationViewLayout({ children }: ActivationViewLayoutProps) {
  return (
    <div className="flex flex-col gap-3">
      <ActivationViewHeader />
      {children}
    </div>
  )
}
