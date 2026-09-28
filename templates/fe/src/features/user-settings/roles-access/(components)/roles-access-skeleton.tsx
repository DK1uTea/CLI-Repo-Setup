import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/shared/components/ui/table'

const COLS = [180, 120, 100, 80, 120, 130, 160, 80]

export function RolesAccessSkeleton() {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="h-12 bg-muted/30">
            {COLS.map((w, i) => (
              <TableHead key={i} className={i === 0 ? 'pl-4' : i === COLS.length - 1 ? 'pr-4' : ''}>
                <div className="h-4 rounded bg-muted animate-pulse" style={{ width: w / 2 }} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i} className="h-14">
              {COLS.map((w, j) => (
                <TableCell key={j} className={j === 0 ? 'pl-4' : j === COLS.length - 1 ? 'pr-4' : ''}>
                  <div
                    className="h-4 rounded bg-muted animate-pulse"
                    style={{ width: w * (0.6 + Math.sin(i * j + 1) * 0.2) }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
