import { formatDate, nowUtc } from '@/lib/date-utils';
import type { DateFormat } from '@/lib/date-utils';
import type { EventDetail } from '@/features/events/event-form/(hooks)/use-event-step-detail';

type Props = {
  event: EventDetail;
  dateFormat: DateFormat;
  currencySymbol: string;
  showPrice: boolean;
  printedAt: string;
  t: (key: string) => string;
};

const RED = '#F40009';

function formatDateTime(date: string | undefined, dateFormat: DateFormat) {
  return date ? formatDate(date, dateFormat, true) : '-';
}

function Divider() {
  return <div style={{ borderTop: `2px solid ${RED}` }} />;
}

type ScheduleField = { label: string; value: string };
type ScheduleRow = [ScheduleField, ScheduleField?];

function ScheduleTable({ rows }: { rows: ScheduleRow[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {rows.map(([left, right]) => (
          <tr key={left.label}>
            <td style={{ padding: '4px 12px 4px 0', width: '20%' }}>{left.label}:</td>
            <td colSpan={right ? 1 : 3} style={{ padding: '4px 24px 4px 0', width: '30%' }}>{left.value}</td>
            {right && (
              <>
                <td style={{ padding: '4px 12px 4px 0', width: '20%' }}>{right.label}:</td>
                <td style={{ padding: '4px 0', width: '30%' }}>{right.value}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function EventDetailPdfContent({ event, dateFormat, currencySymbol, showPrice, printedAt, t }: Props) {
  const overview = event.overview;
  const logistics = event.logistics;
  const products = Array.isArray(event.productCatalog) ? event.productCatalog : [];
  const costs = event.costSummary;
  const adminContact = overview?.adminContact;
  const location = overview?.location;
  const orderId = event.order?.id || '-';
  const orderStatus = event.order?.status ? event.order.status.toUpperCase() : '-';

  const costRows = showPrice && costs
    ? [
      { key: 'rentalCost', amount: costs.equipmentRental },
      { key: 'purchaseCost', amount: costs.purchasedItems },
      { key: 'services', amount: costs.services },
      { key: 'transportCosts', amount: costs.transportCosts },
      { key: 'pmCost', amount: costs.pmCost },
    ].filter((row) => row.amount > 0)
    : [];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, color: '#1a1a1a', display: 'flex', flexDirection: 'column', gap: 30, backgroundColor: '#f9fafb', padding: '35px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <img src="/images/logo_red.png" alt="Coca-Cola Europacific Partners" style={{ height: 56, width: 'auto' }} />

        <div>
          <h1 style={{ fontSize: 23, fontWeight: 700, marginBottom: 8, whiteSpace: 'nowrap' }}>
            {t('pdf.overview')}: {overview?.customEventId ?? event.general?.id}
          </h1>
          <table style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '2px 12px 2px 0' }}>{t('pdf.eventName')}:</td><td>{overview?.title ?? event.general?.name}</td></tr>
              <tr><td style={{ padding: '2px 12px 2px 0' }}>{t('pdf.printed')}:</td><td>{printedAt}</td></tr>
              <tr><td colSpan={2} style={{ padding: '2px 12px 2px 0' }}>{t('pdf.orderId')} : {orderId} - {orderStatus}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>{t('pdf.deliveryAddress')}:</p>
        <p>{overview?.title ?? event.general?.name}</p>
        {location?.name && <p>{location.name}</p>}
        <p>{[adminContact?.firstName, adminContact?.lastName].filter(Boolean).join(' ')}</p>
        <p>{location?.street}</p>
        <p>{[location?.postalCode, location?.city].filter(Boolean).join(' ')}</p>
        <p>{adminContact?.phone}</p>
      </div>

      <Divider />

      <ScheduleTable
        rows={[
          [
            { label: t('pdf.weight'), value: `${event.general?.totalWeight ?? 0} kg` },
          ],
          [
            { label: t('setupStart'), value: formatDateTime(logistics?.schedule?.setUp?.start, dateFormat) },
            { label: t('setupEnd'), value: formatDateTime(logistics?.schedule?.setUp?.end, dateFormat) },
          ],
          [
            { label: t('eventStart'), value: formatDateTime(overview?.startDate, dateFormat) },
            { label: t('eventEnd'), value: formatDateTime(overview?.endDate, dateFormat) },
          ],
          [
            { label: t('teardownStart'), value: formatDateTime(logistics?.schedule?.teardown?.start, dateFormat) },
            { label: t('teardownEnd'), value: formatDateTime(logistics?.schedule?.teardown?.end, dateFormat) },
          ],
        ]}
      />

      <Divider />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ borderBottom: `1px solid ${RED}` }}>
          <tr>
            <th style={{ textAlign: 'left', width: 100, padding: '4px 20px 4px 0' }}>{t('pdf.pos')}</th>
            <th style={{ textAlign: 'left', width: 100, padding: '4px 20px 4px 0' }}>{t('pdf.quantity')}</th>
            <th style={{ textAlign: 'left', padding: '4px 0' }}>{t('pdf.product')}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item, index) => (
            <tr key={item.id ?? index}>
              <td style={{ padding: '2px 20px 2px 8px' }}>{index + 1}</td>
              <td style={{ padding: '2px 20px 2px 8px' }}>{item.quantity}</td>
              <td style={{ padding: '2px 0' }}>{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPrice && costs && (
        <>
          <Divider />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontWeight: 700 }}>
            <tbody>
              {costRows.map((row, index) => (
                <tr key={row.key} style={index > 0 ? { borderTop: `1px solid ${RED}` } : undefined}>
                  <td style={{ padding: '4px 0' }}>{t(`pdf.${row.key}`)}:</td>
                  <td style={{ textAlign: 'right' }}>{row.amount.toFixed(2)} {currencySymbol}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `1px solid ${RED}` }}>
                <td style={{ padding: '4px 0' }}>{t('pdf.total')}:</td>
                <td style={{ textAlign: 'right' }}>{costs.totalEventCost.toFixed(2)} {currencySymbol}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export function getPrintedAt(dateFormat: DateFormat) {
  return formatDate(nowUtc(), dateFormat, true);
}
