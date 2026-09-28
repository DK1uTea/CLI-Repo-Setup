import { z } from "zod";
import { s } from "@/shared/schemas";

export const profileSchema = z.object({
  firstName: s.string(["required", "min:2", "max:100"]),
  lastName: s.string(["required", "min:2", "max:100"]),
  email: s.email(),
  phone: s.phone(),
  profileImage: z.string().optional(),
  appearance: z.string().optional(),
  preferredLanguage: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  dateFormat: z.string().optional(),
  enableWelcomeMsg: z.boolean().optional(),
  enableKeyMetrics: z.boolean().optional(),
  enableActivityChart: z.boolean().optional(),
  enableSalesChart: z.boolean().optional(),
  enableQuickActions: z.boolean().optional(),
  address: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  theme: z.string().optional(),
  defaultTheme: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
