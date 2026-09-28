import { z } from "zod";

import { zEmail, zString } from "@/shared/schemas";

export const addUserSchema = z.object({
  firstName: zString(["required"]),
  lastName: zString(["required"]),
  email: zString(["required"]).pipe(zEmail()),
  role: z.enum(["PROMOTER", "SALES_REP", "ADMIN"]),
});

export type AddUserFormValues = z.infer<typeof addUserSchema>;

export const addUserDefaultValues: AddUserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  role: "PROMOTER",
};
