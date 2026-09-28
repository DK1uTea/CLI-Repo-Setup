"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

type RoleItem = {
  id: string;
  name: string;
};

type RolesListPayload = {
  roles: RoleItem[];
  total: number;
};

type RolesListResponse = {
  data: RolesListPayload;
};

export type { RoleItem };

const PER_PAGE = 12;

async function fetchRolesList({ pageParam = 1, keyword = "" }) {
  const { data } = await apiProxy.get<RolesListResponse>("/role/list", {
    params: {
      page: pageParam,
      perPage: PER_PAGE,
      ...(keyword && { keyword }),
    },
  });
  return data.data;
}

export function useRolesListData(keyword = "") {
  return useInfiniteQuery({
    queryKey: ["roles-list", keyword],
    queryFn: ({ pageParam }) =>
      fetchRolesList({ pageParam: pageParam as number, keyword }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap((p) => p.roles).length;
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}
