'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import {
  normalizeSavedFilters,
  userFilterPreferenceKeys,
  type FilterPreferenceScreen,
  type SavedUserFilters,
} from '../(helpers)/user-filter-preferences';

async function getUserFilterPreferences(screen: FilterPreferenceScreen): Promise<SavedUserFilters> {
  const response = await apiProxy.get(`etr/user-filter-preferences/${screen}`);
  return normalizeSavedFilters(response.data?.data?.filters);
}

async function putUserFilterPreferences(screen: FilterPreferenceScreen, filters: SavedUserFilters) {
  await apiProxy.put(`etr/user-filter-preferences/${screen}`, { filters });
}

export function useUserFilterPreferences(screen: FilterPreferenceScreen) {
  return useQuery({
    queryKey: userFilterPreferenceKeys.screen(screen),
    queryFn: () => getUserFilterPreferences(screen),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
}

export function useSaveUserFilterPreferences(screen: FilterPreferenceScreen) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filters: SavedUserFilters) => putUserFilterPreferences(screen, filters),
    onSuccess: (_data, filters) => {
      queryClient.setQueryData(
        userFilterPreferenceKeys.screen(screen),
        normalizeSavedFilters(filters),
      );
    },
  });
}
