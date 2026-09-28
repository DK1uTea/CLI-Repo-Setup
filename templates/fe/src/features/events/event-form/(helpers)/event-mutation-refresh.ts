import type { QueryClient } from '@tanstack/react-query';

export type EventMutationRefreshScope =
  | { type: 'catalog' }
  | { type: 'helping-hand' }
  | { type: 'product-detail'; slug: string }
  | { type: 'cart' };

export function getEventMutationRefreshScope(
  pathname: string,
  currentStep: string,
  productSlug?: string | null,
): EventMutationRefreshScope {
  if (pathname.includes('/product-detail') && productSlug) {
    return { type: 'product-detail', slug: productSlug };
  }
  if (currentStep === 'product_catalog') return { type: 'catalog' };
  if (currentStep === 'helping_hand') return { type: 'helping-hand' };
  return { type: 'cart' };
}

type RefreshOptions = {
  includeActiveOrder?: boolean;
  includeStepDetail?: boolean;
};

/**
 * Refreshes only the event queries visible to the surface that started a
 * mutation. Product lists and product detail are separate caches; invalidating
 * all of them after a cart mutation would create unrelated network traffic.
 */
export function refreshEventMutationQueries(
  queryClient: QueryClient,
  eventId: string,
  scope: EventMutationRefreshScope,
  options: RefreshOptions = {},
) {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: ['event-products-cart', eventId] }),
  ];

  if (options.includeActiveOrder) {
    invalidations.push(queryClient.invalidateQueries({ queryKey: ['event-order-active-count', eventId] }));
  }

  if (options.includeStepDetail) {
    invalidations.push(queryClient.invalidateQueries({ queryKey: ['event-step-detail', eventId] }));
  }

  if (scope.type === 'catalog') {
    invalidations.push(queryClient.invalidateQueries({ queryKey: ['products-list'] }));
  } else if (scope.type === 'helping-hand') {
    invalidations.push(queryClient.invalidateQueries({ queryKey: ['products-helping-hands-list'] }));
  } else if (scope.type === 'product-detail') {
    invalidations.push(queryClient.invalidateQueries({ queryKey: ['event-product-detail', scope.slug, eventId] }));
  }

  return Promise.all(invalidations);
}
