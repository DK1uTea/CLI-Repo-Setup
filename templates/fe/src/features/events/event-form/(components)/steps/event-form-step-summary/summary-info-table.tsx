'use client';

import { cn } from '@/lib/utils';

export type InfoRow = {
  label: string;
  value?: string | null;
  html?: boolean;
};

type Props = {
  rows: InfoRow[];
  className?: string;
};

export function SummaryInfoTable({ rows, className }: Props) {
  if (rows.length === 0) return null;

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border text-sm', className)}>
      <table className="w-full">
        <tbody>
          {rows.map(({ label, value, html }) => (
            <tr key={label} className="border-b last:border-b-0">
              <td className="w-52 shrink-0 border-r border-border px-6 py-3 font-medium">{label}</td>
              {html && value ? (
                <td
                  className="px-6 py-3 font-light [&_a:hover]:text-primary [&_a]:underline [&_a]:underline-offset-4"
                  translate="no"
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              ) : (
                <td className="px-6 py-3 font-light" translate="no">
                  {value?.trim() || '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
