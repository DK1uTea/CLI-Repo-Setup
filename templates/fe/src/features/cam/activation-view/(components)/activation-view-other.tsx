'use client'

import { ActivationViewLayout } from './activation-view-layout'
import BoardMain from './case-board/board-main'

export function ActivationViewOther() {

  return (
    <ActivationViewLayout>
      <BoardMain />
    </ActivationViewLayout>
  )
}
