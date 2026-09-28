import {
  normalizeSavedFilters,
  type SavedUserFilters,
} from './user-filter-preferences';

const SCALAR_KEYS = [
  'timeFrame',
  'onlyMine',
  'status',
  'eventTypeId',
  'userId',
  'startDate',
  'endDate',
  'limit',
  'view',
] as const;

const ARRAY_KEYS = [
  'targetAudience',
  'partnershipTypes',
  'productPartnerCategories',
] as const;

function canonicalArray(value: string[] | undefined) {
  return [...new Set(value ?? [])].sort();
}

export function areSavedFiltersEqual(
  left: SavedUserFilters,
  right: SavedUserFilters,
): boolean {
  const normalizedLeft = normalizeSavedFilters(left);
  const normalizedRight = normalizeSavedFilters(right);

  const scalarsMatch = SCALAR_KEYS.every(
    (key) => normalizedLeft[key] === normalizedRight[key],
  );
  if (!scalarsMatch) return false;

  return ARRAY_KEYS.every((key) => {
    const leftValues = canonicalArray(normalizedLeft[key]);
    const rightValues = canonicalArray(normalizedRight[key]);
    return leftValues.length === rightValues.length
      && leftValues.every((value, index) => value === rightValues[index]);
  });
}
