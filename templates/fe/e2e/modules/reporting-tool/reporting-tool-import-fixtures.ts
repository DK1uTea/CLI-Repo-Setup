import * as XLSX from 'xlsx';

export type ImportFile = string | {
  name: string;
  mimeType: string;
  buffer: Buffer;
};

export function createImportFixtures(stamp: string) {
  const rows = [
    ['Email', 'First Name', 'Last Name', 'Role'],
    ...Array.from({ length: 10 }, (_, index) => [
      `tf.format.${stamp}.${index}@provider.net`,
      `Format${index}`,
      'E2E',
      index === 1 ? 'promoter' : index === 2 ? 'SALES_REP' : 'admin',
    ]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Users');
  const toBuffer = (bookType: 'xlsx' | 'xls') => XLSX.write(workbook, { bookType, type: 'buffer' }) as Buffer;

  return {
    xlsx: { name: 'users.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: toBuffer('xlsx') },
    xls: { name: 'users.xls', mimeType: 'application/vnd.ms-excel', buffer: toBuffer('xls') },
    csv: { name: 'users.csv', mimeType: 'text/csv', buffer: Buffer.from(XLSX.write(workbook, { bookType: 'csv', type: 'string' })) },
  } satisfies Record<'xlsx' | 'xls' | 'csv', ImportFile>;
}
