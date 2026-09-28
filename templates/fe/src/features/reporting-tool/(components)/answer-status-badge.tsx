import { cn } from "@/lib/utils";
import type { AnswerStatus } from "../(helpers)/trade-fair-answer-type";

type Props = {
  status: AnswerStatus;
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
};

const statusStyles: Record<AnswerStatus, string> = {
  COMPLETED: "bg-[#d6f4f8] text-[#00527C]",
  DRAFT: "bg-[#efeef0] text-[#7B7B7B]",
  IN_PROGRESS: "bg-[#fff0e1] text-[#B45309]",
};

const dotColor: Record<AnswerStatus, string> = {
  COMPLETED: "bg-[#00527C]",
  DRAFT: "bg-[#7B7B7B]",
  IN_PROGRESS: "bg-[#B45309]",
};

export function AnswerStatusBadge({
  status,
  children,
  className,
  showDot = true,
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[8px] px-2 py-0.75",
        statusStyles[status],
        className
      )}
    >
      {showDot && (
        <span className={cn("size-1.5 shrink-0 rounded-full", dotColor[status])} />
      )}
      {children}
    </span>
  );
}
