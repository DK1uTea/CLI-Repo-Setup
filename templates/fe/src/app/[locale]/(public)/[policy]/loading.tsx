import { PageLoading } from '@/shared/components/common/page-loading'

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <PageLoading />
    </div>
  )
}
