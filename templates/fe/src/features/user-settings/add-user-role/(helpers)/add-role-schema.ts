import { z } from "zod";
import { zString } from "@/shared/schemas";

export const addRoleSchema = z.object({
  name: zString(["required", "min:2", "max:100"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  description: zString(["required", "min:2", "max:500"]),
  permissions: z.array(z.string()),
});

export type AddRoleFormValues = z.infer<typeof addRoleSchema>;
