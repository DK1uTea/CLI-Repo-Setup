"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  addRoleSchema,
  type AddRoleFormValues,
} from "../../add-user-role/(helpers)/add-role-schema";
import { useRolePermissions } from "../../add-user-role/(hooks)/use-role-permissions";
import type { TPermission, TPermissionChild } from "../../add-user-role/(hooks)/use-role-permissions";
import { useGetRoleDetail } from "./use-get-role-detail";
import { useUpdateRole } from "./use-update-role";

type PermissionNode = TPermissionChild & { children?: TPermissionChild[] };

function collectLeafKeys(children: PermissionNode[]): string[] {
  return children.flatMap((c) =>
    c.children?.length ? collectLeafKeys(c.children) : [c.key],
  );
}

function buildPermissionsPayload(selectedKeys: string[], tree: TPermission[]): string[] {
  const selected = new Set(selectedKeys);
  const result = new Set(selectedKeys);

  for (const group of tree) {
    if (group.type !== "CHECKBOX") continue;

    const allLeaves = collectLeafKeys(group.children as PermissionNode[]);
    if (allLeaves.length > 0 && allLeaves.every((k) => selected.has(k))) {
      result.add(group.key);
    }

    for (const child of group.children as PermissionNode[]) {
      if (child.children?.length) {
        const childLeaves = collectLeafKeys(child.children);
        if (childLeaves.every((k) => selected.has(k))) {
          result.add(child.key);
        }
      }
    }
  }

  return Array.from(result);
}

function extractLeafKeys(permissions: string[], tree: TPermission[]): string[] {
  const allLeafKeys = new Set(
    tree.flatMap((g) => collectLeafKeys(g.children as PermissionNode[])),
  );
  return permissions.filter((k) => allLeafKeys.has(k));
}

export function useEditRoleForm(id: string) {
  const router = useRouter();
  const { data: roleDetail, dataUpdatedAt } = useGetRoleDetail(id);
  const { data: permissionsTree = [] } = useRolePermissions();
  const updateRole = useUpdateRole(id);
  const hasSynced = useRef(false);

  const form = useForm<AddRoleFormValues>({
    resolver: zodResolver(addRoleSchema),
    defaultValues: { name: "", status: "ACTIVE", description: "", permissions: [] },
  });

  useEffect(() => {
    if (!roleDetail || hasSynced.current) return;

    const treeReady = permissionsTree.length > 0;
    const leafKeys = treeReady
      ? extractLeafKeys(roleDetail.permissions, permissionsTree)
      : roleDetail.permissions;

    const statusVal = (roleDetail.status === "INACTIVE" ? "INACTIVE" : "ACTIVE") as "ACTIVE" | "INACTIVE";

    form.reset({
      name: roleDetail.name,
      status: statusVal,
      description: roleDetail.description,
      permissions: leafKeys,
    });

    if (treeReady) hasSynced.current = true;
  }, [dataUpdatedAt, permissionsTree.length]);

  async function handleSubmit(values: AddRoleFormValues) {
    const permissions = buildPermissionsPayload(values.permissions, permissionsTree);
    await updateRole.mutateAsync({ id, name: values.name, status: values.status, description: values.description, permissions });
    router.push("/user-settings?tab=manage-user-roles");
  }

  return {
    form,
    onSubmit: form.handleSubmit(handleSubmit),
    isPending: updateRole.isPending,
    isLoading: !roleDetail,
  };
}
