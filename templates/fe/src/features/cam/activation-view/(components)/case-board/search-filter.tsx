'use client'

import { SearchFilterBar } from "@/shared/components/common/search-filter-bar";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryStates } from "nuqs";

const SearchFilter = () => {
  const t = useTranslations('activationView');
  const [filters, setFilters] = useQueryStates({
    sortBy: parseAsString.withDefault('NAME_ASC'),
  });

  return (
    <SearchFilterBar
      className="w-full"
      inputClassName="flex-1"
      placeholder={t('searchCasePlaceholder')}
      searchTestId="cam-intake-board-search"
      filters={[
        {
          name: 'sortBy',
          placeholder: t('filter.sortPlaceholder'),
          options: [
            { value: 'NAME_ASC', label: t('filter.sortCaseNameAsc') },
            { value: 'NAME_DESC', label: t('filter.sortCaseNameDesc') }
          ],
          value: filters.sortBy,
          onChange: (value) => setFilters({ sortBy: value || 'NAME_ASC' }),
          showIcon: true,
        }
      ]}
    />
  );
}

export default SearchFilter;
