"use client";

import { Separator } from "@/shared/components/ui/separator";
import type { ChartConfig } from "@/shared/components/ui/chart";

type Props = {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  label?: string;
  chartConfig: ChartConfig;
};

export const EventAnalyticsTooltip = ({
  active,
  payload,
  label,
  chartConfig,
}: Props) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-background p-3 shadow-md text-xs min-w-36 flex flex-col gap-2">
        <p className="text-primary">{label}</p>
        <Separator />
        <div className="flex flex-col gap-4">
          {payload.map((item) => {
            const configItem = chartConfig[item.name];
            return (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: configItem?.color }}
                />
                <p className="text-primary leading-none">
                  {configItem?.label ?? item.name}:{" "}
                  <span className="font-bold">{item.value}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};
