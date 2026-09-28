'use client'

import { SearchFilterBar } from "@/shared/components/common/search-filter-bar";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";

const EventAddressSearchFilter = () => {
  const t = useTranslations("events.address");

  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault('created_at:desc'))

  const sortOptions = [
    { value: 'venue_name:asc', label: t('sortVenueNameAsc') },
    { value: 'venue_name:desc', label: t('sortVenueNameDesc') },

    { value: 'created_at:desc', label: t('sortNewest') },
    { value: 'created_at:asc', label: t('sortOldest') },

    { value: 'postal_code:asc', label: t('sortPostalCodeAsc') },
    { value: 'postal_code:desc', label: t('sortPostalCodeDesc') },

    { value: 'city:asc', label: t('sortCityAsc') },
    { value: 'city:desc', label: t('sortCityDesc') },
  ]

  return (
    <SearchFilterBar
      className="w-full max-w-120"
      placeholder={t('searchPlaceholder')}
      filters={[
        {
          name: 'sort',
          placeholder: t('sortPlaceholder'),
          options: sortOptions,
          value: sort || 'created_at:desc',
          onChange: (v) => setSort(v === 'created_at:desc' ? null : v),
        },
      ]}
    />
  );
}

export default EventAddressSearchFilter;
