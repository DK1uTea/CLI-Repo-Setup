"use client";

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

export type TPermissionChild = {
  name: string;
  key: string;
  type?: "CHECKBOX" | "RADIO";
  children?: TPermissionChild[];
};

export type TPermission = {
  name: string;
  key: string;
  type: "CHECKBOX" | "RADIO";
  children: TPermissionChild[];
};

/**
 * Recursively collect the keys of every leaf node (a node with no children).
 * A group node's own key is never returned — only its selectable descendants.
 */
export function collectLeafKeys(node: {
  key: string;
  children?: TPermissionChild[];
}): string[] {
  if (!Array.isArray(node.children) || node.children.length === 0) {
    return [node.key];
  }
  return node.children.flatMap(collectLeafKeys);
}

type PermissionsResponse = {
  data?: { permissions?: TPermission[] };
};

async function fetchPermissions(): Promise<TPermission[]> {
  const response = await apiProxy.get<PermissionsResponse>("/permissions");
  return response.data?.data?.permissions ?? [];
}

export function useRolePermissions() {
  return useQuery({
    queryKey: ["role-permissions"],
    queryFn: fetchPermissions,
  });
}
