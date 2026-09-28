import { useQuery } from '@tanstack/react-query';
import { useQueryState, parseAsString } from 'nuqs';
import { apiProxy } from '@/lib/api';

export type EventProductDetail = {
  id: string;
  name: string;
  price: number;
  sku: string;
  productType: 'rental' | 'purchase' | 'bundle';
  images: string[];
  image_url: string;
  availableQuantity: number;
  quantity: number;
  isNew?: boolean;
  slug: string;
  category?: string;
  brand?: string;
  manufacturer?: string;
  material?: string;
  shippingMethod?: string;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
  description?: string;
  shortDescription?: string;
  startDate: string;
  endDate: string;
  setUpStartDate?: string | null;
  setUpStartTime?: string | null;
  teardownEndDate?: string | null;
  teardownEndTime?: string | null;
  startTime: string;
  endTime: string;
  children?: {
    sku: string;
    name: string;
    requiredQty: number;
  }[];
};

export type EventProductDetailResponse = {
  event: {
    startDate: string;
    endDate: string;
    setupDate: string;
    teardownDate: string;
  };
  product: {
    id: string;
    sku: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    images: string[];
    totalQuantity: number;
    availableQuantity: number;
    categoryLabels: string[];
    brand: string;
    isAvailable: boolean;
    isNew: boolean;
    weight: number;
    length: number;
    width: number;
    height: number;
    description: string;
    shortDescription: string;
    productType: 'rental' | 'purchase' | 'bundle';
    manufacturer?: string;
    material?: string[];
    shippingMethod?: string;
    children: {
      sku: string;
      name: string;
      requiredQty: number;
    }[];
  };
};

const formatDate = (isoString?: string) => {
  if (!isoString) return '';
  return isoString.split('T')[0];
};

const formatTime = (isoString?: string) => {
  if (!isoString) return '00:00';
  const parts = isoString.split('T');
  if (parts.length < 2) return '00:00';
  return parts[1].substring(0, 5);
};

const mapApiToEventProductDetail = (data: EventProductDetailResponse): EventProductDetail => {
  const event = data.event;
  const product = data.product;

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    price: product.price ?? 0,
    productType: product.productType || 'rental',
    images: product.images || [],
    image_url: product.imageUrl || '',
    availableQuantity: product.availableQuantity ?? 0,
    quantity: product.totalQuantity ?? 0,
    isNew: product.isNew ?? false,
    category: product.categoryLabels?.join(', ') || '-',
    brand: product.brand || '-',
    manufacturer: product.manufacturer || '-',
    material: product.material?.join(', ') || '-',
    shippingMethod: product.shippingMethod || '-',
    weight: product.weight ?? 0,
    height: product.height ?? 0,
    width: product.width ?? 0,
    length: product.length ?? 0,
    description: product.description || "",
    shortDescription: product.shortDescription || "",
    startDate: formatDate(event.startDate),
    startTime: formatTime(event.startDate),
    endDate: formatDate(event.endDate),
    endTime: formatTime(event.endDate),
    setUpStartDate: event.setupDate ? formatDate(event.setupDate) : null,
    setUpStartTime: event.setupDate ? formatTime(event.setupDate) : null,
    teardownEndDate: event.teardownDate ? formatDate(event.teardownDate) : null,
    teardownEndTime: event.teardownDate ? formatTime(event.teardownDate) : null,
    children: product.children || [],
  };
};

const fetchEventProductDetail = async (slug: string, eventId: string): Promise<EventProductDetailResponse> => {
  const response = await apiProxy.get(`/etr/event-products/${slug}`, {
    params: { eventId },
  });
  return response.data.data;
};

export function useEventProductDetail() {
  const [productSlug] = useQueryState('product', parseAsString);
  const [eventId] = useQueryState('eventId', parseAsString);

  const { data, isLoading, error } = useQuery({
    queryKey: ['event-product-detail', productSlug, eventId],
    queryFn: () => fetchEventProductDetail(productSlug || '', eventId || ''),
    enabled: !!productSlug && !!eventId,
  });

  const product = data ? mapApiToEventProductDetail(data) : null;

  return {
    product,
    isLoading: isLoading && !!productSlug && !!eventId,
    productSlug,
    eventId,
    error,
  };
}
