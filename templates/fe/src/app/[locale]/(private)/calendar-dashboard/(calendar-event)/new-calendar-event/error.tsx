'use client'

import { ErrorPage } from '@/shared/components/common/error-page'

export default function NewCalendarEventError({ error }: { error: Error }) {
  return <ErrorPage error={error} />
}
