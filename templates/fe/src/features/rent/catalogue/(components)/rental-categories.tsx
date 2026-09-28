'use client';

import { useState } from "react";
import { useRentalCategory } from "../(hooks)/use-rental-category";
import { Button } from "@/shared/components/ui/button";
import { useQueryState } from "nuqs";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import RentalCategoriesSkeleton from './rental-categories-skeleton'
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const RentalCategories = () => {
  const t = useTranslations("rent");
  const { data: categories, isLoading } = useRentalCategory();
  const [category, setCategory] = useQueryState("category");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const handleCategorySelect = (slug: string) => {
    setCategory((current) => (current === slug ? null : slug)).catch(() => {});
  }

  if (isLoading) {
    return <RentalCategoriesSkeleton />;
  }

  const allCategories = categories ?? [];
  const visibleCategories = allCategories.slice(0, visibleCount);
  const hasMore = visibleCount < allCategories.length;

  return (
    <div className="flex gap-4 flex-wrap">
      {visibleCategories.map((categoryItem) => {
        const isSelected = categoryItem.slug === category;

        return (
          <Button
            key={categoryItem.id}
            variant={isSelected ? "default" : "outline"}
            className={cn("text-sm font-semibold", isSelected ? "" : "bg-card")}
            onClick={() => handleCategorySelect(categoryItem.slug)}
          >
            {categoryItem.name}
          </Button>
        )
      })}
      {hasMore && (
        <Button
          variant="outline-primary"
          className="shrink-0 min-w-25"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
        >
          {t("loadMore")}
          <Plus data-icon="inline-end" />
        </Button>
      )}
    </div>
  );
}

export default RentalCategories;
