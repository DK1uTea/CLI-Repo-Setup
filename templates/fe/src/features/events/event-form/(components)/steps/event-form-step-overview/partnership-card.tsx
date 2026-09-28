'use client';

import { useEffect } from 'react';
import { useFormContext, useFormState, useController } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useQueryState, parseAsString } from 'nuqs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { usePartnershipData } from '../../../(hooks)/use-partnership-data';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';

export function PartnershipCard() {
  const t = useTranslations('eventForm');
  const { control, clearErrors } = useFormContext<EventFormDto>();
  const { errors } = useFormState<EventFormDto>();
  const { data: partnershipOptions = [], isLoading } = usePartnershipData();

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isOverviewLocked = useEventDetailStore((s) => s.isOverviewLocked);
  const isDisableField = (eventIdParam ? !canEdit : false) || isOverviewLocked;

  // useController (not useWatch+setValue) so these fields are properly
  // registered with react-hook-form — otherwise their defaultValues from an
  // async-loaded edit form can fail to hydrate into the UI on first render.
  const { field: partnershipTypesField } = useController({ control, name: 'partnershipTypes' });
  const { field: productPartnerCategoriesField } = useController({ control, name: 'productPartnerCategories' });
  const partnershipTypes = partnershipTypesField.value ?? [];
  const productPartnerCategories = productPartnerCategoriesField.value ?? [];

  const isProductPartnerSelected = partnershipTypes?.includes('PRODUCT_PARTNER');

  useEffect(() => {
    if (!isProductPartnerSelected && productPartnerCategories?.length > 0) {
      productPartnerCategoriesField.onChange([]);
    }
  }, [isProductPartnerSelected, productPartnerCategories]);

  const handlePartnershipChange = (key: string, checked: boolean) => {
    const current = partnershipTypes ?? [];
    const updated = checked ? [...current, key] : current.filter((p) => p !== key);
    clearErrors('partnershipTypes');
    partnershipTypesField.onChange(updated);
  };

  const handleCategoryChange = (key: string, checked: boolean) => {
    const current = productPartnerCategories ?? [];
    const updated = checked ? [...current, key] : current.filter((c) => c !== key);
    clearErrors('productPartnerCategories');
    productPartnerCategoriesField.onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('overview.partnershipTitle')}</CardTitle>
        <CardDescription>{t('overview.partnershipSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('overview.partnershipLoading')}</p>
        ) : (
          <div className="flex flex-col gap-3" data-field="partnershipTypes">
            {partnershipOptions.map((option) => {
              const isSelected = partnershipTypes?.includes(option.key);
              return (
                <div key={option.key} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={option.key}
                      data-testid={`event-partnership-checkbox-${option.key}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handlePartnershipChange(option.key, !!checked)}
                      disabled={isDisableField}
                    />
                    <Label htmlFor={option.key} className="cursor-pointer text-sm font-medium">
                      {option.label}
                    </Label>
                  </div>

                  {option.categories.length > 0 && isSelected && (
                    <div className="ml-6 flex flex-col gap-3 border-l-2 border-border pl-4" data-field="productPartnerCategories">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t('overview.partnershipSelectCategories')} <span className="text-destructive">*</span>
                      </p>
                      {option.categories.map((category) => {
                        const isCategoryChecked = productPartnerCategories?.includes(category.key);
                        return (
                          <div key={category.key} className="flex items-center gap-2">
                            <Checkbox
                              id={category.key}
                              checked={isCategoryChecked}
                              onCheckedChange={(checked) => handleCategoryChange(category.key, !!checked)}
                              disabled={isDisableField}
                            />
                            <Label htmlFor={category.key} className="cursor-pointer text-sm">
                              {category.label}
                            </Label>
                          </div>
                        );
                      })}
                      {errors.productPartnerCategories?.message && (
                        <p className="text-[13px] text-destructive">{errors.productPartnerCategories.message}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {errors.partnershipTypes?.message && (
              <p className="text-[13px] text-destructive">{errors.partnershipTypes.message}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
