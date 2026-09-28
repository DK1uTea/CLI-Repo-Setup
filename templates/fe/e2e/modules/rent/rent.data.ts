import type { Page } from '@playwright/test';

export const COPY = {
  de: {
    catalogueTab: 'Produktkatalog', ordersTab: 'Mietbestellungen', searchPlaceholder: 'Suchen...',
    descriptionTab: 'Beschreibung', availabilityTab: 'Verfügbarkeit', productAvailability: 'Verfügbarkeit',
    documentsTab: 'Dokumente', assemblyInstructions: 'Montageanleitungen', manufacturerData: 'Herstellerdaten',
    noDocumentsAvailable: 'Keine Dokumente verfügbar', downloadDocument: '{name} herunterladen',
    price: 'Preis', shortDescription: 'Kurzbeschreibung', productDetails: 'Produktdetails', category: 'Kategorie',
    branding: 'Branding', weight: 'Gewicht', length: 'Länge', width: 'Breite', height: 'Höhe',
    bundleProduct: 'Bundle-Produkt', bundleProductInfo: 'Bundled products benötigt Komplementärprodukt(e)',
    previousImage: 'Vorheriges Bild', nextImage: 'Nächstes Bild', showProductImage: 'Produktbild anzeigen',
    quantity: 'Menge',
    month: 'Monat', downloadPdf: 'PDF herunterladen', similarProducts: 'Ähnliche Produkte',
    rentFrom: 'Mieten von', rentTo: 'Mieten bis', headerTitle: 'Flexible Mietlösungen für jedes Projekt',
    dateRange: 'Zeitraum', startDate: 'Startdatum', endDate: 'Enddatum', reset: 'Zurücksetzen', apply: 'Anwenden',
    loadMore: 'Mehr laden', clearSearch: 'Zurücksetzen', noProducts: 'Keine Produkte gefunden',
    sort: 'Sortieren', status: 'Status', pending: 'Ausstehend', sortOrderIdDescending: 'Bestell-ID absteigend',
    orderId: 'Bestell-ID', recipient: 'Empfänger', totalAmount: 'Gesamtbetrag', pagination: 'Seitennavigation',
    firstPage: 'Erste Seite', previousPage: 'Vorherige Seite', nextPage: 'Nächste Seite', lastPage: 'Letzte Seite',
    goToPage: 'Zu Seite {page}', currentPage: 'Seite {page}, aktuelle Seite', subtotal: 'Zwischensumme',
    total: 'Gesamt', orderNumberPrefix: 'Bestellung #', customerInformation: 'Kundendaten',
    invalidDateRange: 'Der Zeitraum in der URL ist ungültig. Er wurde auf den Standardzeitraum zurückgesetzt.',
    unavailableHeading: 'Dieser Bereich ist vorübergehend nicht verfügbar', unavailableDescription: 'Diese Seite konnte gerade nicht geladen werden.',
  },
  en: {
    catalogueTab: 'Catalogue', ordersTab: 'Rent Orders', searchPlaceholder: 'Search...',
    descriptionTab: 'Description', availabilityTab: 'Availability', productAvailability: 'Available', quantity: 'Quantity',
    documentsTab: 'Documents', assemblyInstructions: 'Assembly Instructions', manufacturerData: 'Manufacturer Data',
    noDocumentsAvailable: 'No documents available', downloadDocument: 'Download {name}',
    price: 'Price', shortDescription: 'Short Description', productDetails: 'Product Details', category: 'Category',
    branding: 'Branding', weight: 'Weight', length: 'Length', width: 'Width', height: 'Height',
    bundleProduct: 'Bundle Product', bundleProductInfo: 'Bundled products require complementary product(s)',
    previousImage: 'Previous image', nextImage: 'Next image', showProductImage: 'Show product image',
    month: 'Month', downloadPdf: 'Download PDF', similarProducts: 'Similar Products', rentFrom: 'Rent From',
    rentTo: 'Rent To', headerTitle: 'Flexible Rentals for Every Project', dateRange: 'Date Range',
    startDate: 'Start Date', endDate: 'End Date', reset: 'Reset', apply: 'Apply', loadMore: 'Load more',
    clearSearch: 'Clear', noProducts: 'No products found', sort: 'Sort',
    status: 'Status', pending: 'Pending', sortOrderIdDescending: 'Order ID Descending', orderId: 'Order ID',
    recipient: 'Recipient', totalAmount: 'Total Amount', pagination: 'Pagination',
    firstPage: 'First page', previousPage: 'Previous page', nextPage: 'Next page', lastPage: 'Last page',
    goToPage: 'Go to page {page}',
    currentPage: 'Page {page}, current page', subtotal: 'Subtotal', total: 'Total', orderNumberPrefix: 'Order #',
    customerInformation: 'Customer Information', invalidDateRange: 'The date range in the URL is invalid. It was reset to the default range.',
    unavailableHeading: 'This section is temporarily unavailable', unavailableDescription: "We couldn't load this page right now.",
  },
} as const;

export type RentLocale = keyof typeof COPY;
export type RentCopy = (typeof COPY)[RentLocale];

export function pageLocale(page: Page): RentLocale {
  const locale = new URL(page.url()).pathname.split('/')[1];
  if (locale !== 'de' && locale !== 'en') throw new Error(`Expected a locale-prefixed URL, got ${page.url()}`);
  return locale;
}

export function localizedRentPath(page: Page, path: string) {
  return `/${pageLocale(page)}${path.startsWith('/') ? path : `/${path}`}`;
}

export function rentSidebarLink(page: Page) {
  return page.locator('[data-slot="sidebar-menu-button"][href$="/rent"]').first();
}
