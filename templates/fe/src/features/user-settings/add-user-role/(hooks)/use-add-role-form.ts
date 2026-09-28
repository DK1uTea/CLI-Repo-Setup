"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/navigation";
import {
  addRoleSchema,
  type AddRoleFormValues,
} from "../(helpers)/add-role-schema";
import { useRolePermissions } from "./use-role-permissions";
import { useCreateRole } from "./use-create-role";
import type { TPermission, TPermissionChild } from "./use-role-permissions";

type PermissionNode = TPermissionChild & { children?: TPermissionChild[] };

function collectLeafKeys(children: PermissionNode[]): string[] {
  return children.flatMap((c) =>
    c.children?.length ? collectLeafKeys(c.children) : [c.key],
  );
}

function buildPermissionsPayload(
  selectedKeys: string[],
  tree: TPermission[],
): string[] {
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

export function useAddRoleForm() {
  const router = useRouter();
  const { data: permissionsTree = [] } = useRolePermissions();
  const createRole = useCreateRole();

  const form = useForm<AddRoleFormValues>({
    resolver: zodResolver(addRoleSchema),
    defaultValues: {
      name: "",
      status: "ACTIVE",
      description: "",
      permissions: [],
    },
  });

  async function handleSubmit(values: AddRoleFormValues) {
    const permissions = buildPermissionsPayload(values.permissions, permissionsTree);
    await createRole.mutateAsync({
      name: values.name,
      status: values.status,
      description: values.description,
      permissions,
    });
    form.reset();
    router.push("/user-settings?tab=manage-user-roles");
  }

  return {
    form,
    onSubmit: form.handleSubmit(handleSubmit),
    isPending: createRole.isPending,
  };
}
