"use client";

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

type UserAccess = {
  id: string;
  email: string;
  userId?: string;
  role: string;
  createdAt: string;
  dueDate: string;
  status: string;
  userStatus?: string;
  invitedByEmail: string;
  isExpired: boolean;
  isAllowRevoke: boolean;
  isAllowGiveAccess: boolean;
  isAllowRemoveUser: boolean;
  lastLogin?: string;
  firstName?: string;
  lastName?: string;
};

type AccessUsersPayload = {
  users: UserAccess[];
  total: number;
};

type AccessUsersResponse = {
  data: AccessUsersPayload;
};

export type { UserAccess };

const PER_PAGE = 10;

type Filters = {
  keyword?: string;
  roleId?: string;
  sort?: string;
  page?: number;
};

async function fetchAccessUsers({ keyword, roleId, sort, page }: Filters) {
  const queryParams: Record<string, string | number> = {
    ...(keyword && { keyword }),
    ...(roleId && { roleId }),
    ...(sort && { sort }),
    page: page ?? 1,
    perPage: PER_PAGE,
  };

  const { data } = await apiProxy.get<AccessUsersResponse>(
    "/user/access-users",
    {
      params: queryParams,
    },
  );

  return data.data;
}

export function useRolesAccessData({
  keyword = "",
  roleId = "",
  sort = "",
  page = 1,
}: Filters = {}) {
  const query = useQuery({
    queryKey: ["access-users", keyword, roleId, sort, page],
    queryFn: () => fetchAccessUsers({ keyword, roleId, sort, page }),
    staleTime: 0,
  });

  return {
    users: query.data?.users ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isPending,
  };
}
