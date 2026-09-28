'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Pagination } from '@/shared/components/ui/pagination'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty'
import { HistoryIcon } from 'lucide-react'
import { dayjs } from '@/lib/date-utils'
import { useDateFormat } from '@/shared/stores/use-user-store'
import { useLoginHistory } from '../(hooks)/use-login-history'

export function LoginHistoryTable() {
  const t = useTranslations('settings')
  const dateFormat = useDateFormat()
  const { sessions, pagination, isLoading, page, setPage } = useLoginHistory()
  const totalPages = pagination?.totalPages ?? 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('loginSessionHistory')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <LoginHistorySkeleton />
        ) : sessions.length === 0 ? (
          <Empty>
            <EmptyMedia>
              <HistoryIcon className="size-12 text-primary opacity-40" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('noLoginHistory')}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="px-6">{t('device')}</TableHead>
                  <TableHead className="px-6">{t('browser')}</TableHead>
                  <TableHead className="px-6">{t('ipAddress')}</TableHead>
                  <TableHead className="px-6">{t('location')}</TableHead>
                  <TableHead className="px-6">{t('lastActivity')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="px-6 py-4 font-semibold text-foreground">
                      {session.device}
                      {session.isActive && (
                        <span className="ml-2 text-xs text-primary font-normal">({t('thisDevice')})</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">{session.browser ?? t('unknownBrowser')}</TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">{session.ipAddress}</TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      {session.location?.trim() || t('unknownLocation')}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      {session.lastActiveAt
                        ? dayjs.utc(session.lastActiveAt).format(`${dateFormat} HH:mm`)
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="justify-end"
          />
        )}
      </CardContent>
    </Card>
  )
}

function LoginHistorySkeleton() {
  const t = useTranslations('settings')

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            {[t('device'), t('browser'), t('ipAddress'), t('location'), t('lastActivity')].map((h) => (
              <TableHead key={h} className="px-6">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`skeleton-row-${i}`}>
              {Array.from({ length: 5 }).map((__, j) => (
                <TableCell key={`skeleton-cell-${i}-${j}`} className="px-6 py-4">
                  <Skeleton className="h-5 w-32" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
