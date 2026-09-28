"use client";

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

export type TMatrixPermissionChild = {
  name: string;
  key: string;
  children?: TMatrixPermissionChild[];
};

export type TMatrixPermissionGroup = {
  name: string;
  key: string;
  children: TMatrixPermissionChild[];
};

export type TMatrixRole = {
  id: string;
  name: string;
  permissions: string[];
};

export type TRolePermissionMatrix = {
  permissions: TMatrixPermissionGroup[];
  roles: TMatrixRole[];
};

type MatrixResponse = {
  data?: TRolePermissionMatrix;
};

async function fetchRolePermissionMatrix(): Promise<TRolePermissionMatrix> {
  const response = await apiProxy.get<MatrixResponse>("/roles/matrix");
  return response.data?.data ?? { permissions: [], roles: [] };
}

export function useMatrixPermission() {
  return useQuery({
    queryKey: ["roles-matrix"],
    queryFn: fetchRolePermissionMatrix,
  });
}
