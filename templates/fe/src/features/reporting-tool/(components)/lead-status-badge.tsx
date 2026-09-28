import {
  StatusBadge,
  type StatusVariant,
} from "@/shared/components/ui/status-badge";
import type { LeadStatus } from "../(helpers)/trade-fair-lead-type";

type Props = {
  status: LeadStatus;
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
};

const statusVariants: Record<LeadStatus, StatusVariant> = {
  NEW: "active",
  EXISTED: "invited",
};

export function LeadStatusBadge({
  status,
  children,
  className,
  showDot = true,
}: Props) {
  return (
    <StatusBadge
      variant={statusVariants[status]}
      className={className}
      showDot={showDot}
    >
      {children}
    </StatusBadge>
  );
}
