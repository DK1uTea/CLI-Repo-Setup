import { formatDate, nowUtc } from '@/lib/date-utils';
import type { DateFormat } from '@/lib/date-utils';
import { hasDisplayValue } from '../(helpers)/product-detail-display';
import type { ProductDetail } from '../(services)/product-detail-service';

type Props = {
  product: ProductDetail;
  images: string[];
  dateFormat: DateFormat;
  currencySymbol: string;
  printedAt: string;
  t: (key: string) => string;
};

const RED = '#F40009';
const Divider = () => <div style={{ borderTop: `1px solid ${RED}` }} />;
const Label = ({ children }: { children: React.ReactNode }) => (
  <td style={{ padding: '8px 0', color: '#6b7280', width: 180 }}>{children}</td>
);
const Value = ({ children }: { children: React.ReactNode }) => (
  <td style={{ padding: '8px 0', fontWeight: 700, color: '#1a1a1a' }}>{children}</td>
);

export function ProductDetailPdfContent({ product, images, currencySymbol, printedAt, t }: Props) {
  const categoryLabels = Array.isArray(product.categoryLabels) ? product.categoryLabels : [];
  const material = Array.isArray(product.material) ? product.material : [];
  const bundleItems = Array.isArray(product.children) ? product.children : [];
  const isBundle = product.productType === 'bundle' && bundleItems.length > 0;
  const details = [
    [t('category'), categoryLabels.join(', ')],
    [t('branding'), product.brand],
    [t('manufacturer'), product.manufacturer],
    [t('materialType'), material.join(', ')],
  ].filter(([, value]) => hasDisplayValue(value));
  const dimensions = [
    [t('weight'), product.weight != null ? `${product.weight} kg` : undefined],
    [t('length'), product.length != null ? `${product.length} cm` : undefined],
    [t('width'), product.width != null ? `${product.width} cm` : undefined],
    [t('height'), product.height != null ? `${product.height} cm` : undefined],
  ].filter(([, value]) => value);

  return (
    <div
      className="flex w-full flex-col gap-6 bg-white px-10 py-8 text-sm"
      style={{ boxSizing: 'border-box', fontFamily: 'Arial, Helvetica, sans-serif', color: '#1a1a1a' }}
    >
      <div className="flex items-center justify-between">
        <img src="/images/logo_red.png" alt="Coca-Cola Europacific Partners" style={{ height: 48, maxHeight: 60, width: 'auto' }} />
        <p className="text-xs text-gray-400" style={{ margin: 0 }}>{t('pdf.printed')}: {printedAt}</p>
      </div>

      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              style={{
                width: 200,
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
                border: '1px solid #f3f3f3',
                borderRadius: 6,
                padding: 8,
              }}
            >
              <img
                src={src}
                alt={`${product.name} ${index + 1}`}
                style={{ maxHeight: 140, maxWidth: 180, objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
      )}

      <Divider />
      <h3 className="text-xl font-bold" style={{ margin: 0 }}>{product.name}</h3>
      <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {product.sku && <tr><Label>{t('sku')}:</Label><Value>{product.sku}</Value></tr>}
          <tr>
            <Label>{t('price')}:</Label>
            <Value>{Number(product.price || 0).toFixed(2)} {currencySymbol}</Value>
          </tr>
        </tbody>
      </table>
      <Divider />
      <div className="flex flex-col gap-2">
        <h4 className="text-base font-bold" style={{ margin: 0 }}>{t('productDetails')}</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {details.map(([label, value]) => (
              <tr key={label}><Label>{label}:</Label><Value>{value}</Value></tr>
            ))}
          </tbody>
        </table>
        <div style={{ borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {dimensions.map(([label, value]) => (
              <tr key={label}><Label>{label}:</Label><Value>{value}</Value></tr>
            ))}
          </tbody>
        </table>
      </div>
      {isBundle && (
        <>
          <Divider />
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 700 }}>
            <span>{t('bundleProduct')}</span>
            <span aria-hidden="true" style={{ color: '#eab308', fontSize: 18 }}>⚠</span>
            <span>:</span>
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {bundleItems.map((item, index) => (
                <tr key={item.sku ?? index} style={{ borderBottom: '1px solid #f3f3f3' }}>
                  <td style={{ padding: '10px 0', color: '#6b7280' }}>{item.name}</td>
                  <td style={{ padding: '10px 0', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    X {item.requiredQty ?? 1}
                  </td>
                </tr>
              ))}
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
