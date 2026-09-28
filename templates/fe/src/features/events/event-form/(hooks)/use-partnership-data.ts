type PartnershipCategory = {
  key: string;
  label: string;
};

export type PartnershipOption = {
  key: string;
  label: string;
  categories: PartnershipCategory[];
};

const PARTNERSHIP_OPTIONS: PartnershipOption[] = [
  {
    key: 'PRODUCT_PARTNER',
    label: 'Product Partner',
    categories: [
      { key: 'ARTD', label: 'ARTD' },
      { key: 'COFFEE', label: 'Coffee' },
      { key: 'ENERGY', label: 'Energy' },
      { key: 'HYDRATION', label: 'Hydration' },
      { key: 'SOFTDRINKS', label: 'Softdrinks' },
      { key: 'WATER', label: 'Water' },
    ],
  },
  { key: 'KEYNOTE_SPEAKER', label: 'Keynote Speaker', categories: [] },
  { key: 'EXHIBITION', label: 'Exhibition', categories: [] },
  { key: 'JURY_MEMBER', label: 'Jury Member', categories: [] },
  { key: 'MEDIA_PARTNER', label: 'Media Partner', categories: [] },
];

export function usePartnershipData() {
  return {
    data: PARTNERSHIP_OPTIONS,
    isLoading: false,
  };
}
