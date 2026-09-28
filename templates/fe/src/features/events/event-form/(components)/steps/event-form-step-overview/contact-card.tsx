'use client';

import { useFormContext, useFormState, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useQueryState, parseAsString } from 'nuqs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { InputFloat } from '@/shared/components/ui/input-float';
import { SelectFloat } from '@/shared/components/ui/select-float';
import { SelectItem } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { EVENT_CONTACT_ROLES } from '../../../(helpers)/event-form-constants';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';

export function ContactCard() {
  const t = useTranslations('eventForm');
  const { register, control } = useFormContext<EventFormDto>();
  const watched = useWatch<EventFormDto>();
  const { errors } = useFormState<EventFormDto>();
  const { fields, append, remove } = useFieldArray({ control, name: 'contacts' });

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isOverviewLocked = useEventDetailStore((s) => s.isOverviewLocked);
  const isDisableField = (eventIdParam ? !canEdit : false) || isOverviewLocked;

  const contactErrors = errors.contacts as
    | { contactName?: { message?: string }; contactEmail?: { message?: string }; contactPhone?: { message?: string }; role?: { message?: string } }[]
    | undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('overview.adminTitle')}</CardTitle>
        <CardDescription>{t('overview.adminSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputFloat
            data-testid="event-admin-first-name-input"
            label={t('overview.firstName')}
            value={watched.contactFirstName ?? ''}
            error={errors.contactFirstName?.message}
            disabled={isDisableField}
            {...register('contactFirstName')}
          />
          <InputFloat
            data-testid="event-admin-last-name-input"
            label={t('overview.lastName')}
            value={watched.contactLastName ?? ''}
            error={errors.contactLastName?.message}
            disabled={isDisableField}
            {...register('contactLastName')}
          />
          <InputFloat
            data-testid="event-admin-email-input"
            label={t('overview.email')}
            type="email"
            value={watched.contactEmail ?? ''}
            error={errors.contactEmail?.message}
            disabled={isDisableField}
            {...register('contactEmail')}
          />
          <InputFloat
            data-testid="event-admin-phone-input"
            label={t('overview.phone')}
            type="tel"
            value={watched.contactPhone ?? ''}
            error={errors.contactPhone?.message}
            disabled={isDisableField}
            {...register('contactPhone')}
          />
        </div>

        <div className="space-y-3 pt-2" data-field="contacts">
          <div>
            <p className="text-sm font-medium text-foreground">{t('overview.otherContactsTitle')}</p>
            <p className="text-xs text-muted-foreground">{t('overview.otherContactsSubtitle')}</p>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Contact {index + 1}
                </p>
                <Button type="button" variant="ghost-primary" size="icon-sm" onClick={() => remove(index)} disabled={isDisableField}>
                  <Trash2Icon />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InputFloat
                  label={t('overview.contactName')}
                  value={watched.contacts?.[index]?.contactName ?? ''}
                  error={contactErrors?.[index]?.contactName?.message}
                  disabled={isDisableField}
                  {...register(`contacts.${index}.contactName`)}
                />
                <InputFloat
                  label={t('overview.phone')}
                  type="tel"
                  value={watched.contacts?.[index]?.contactPhone ?? ''}
                  error={contactErrors?.[index]?.contactPhone?.message}
                  disabled={isDisableField}
                  {...register(`contacts.${index}.contactPhone`)}
                />
                <Controller
                  name={`contacts.${index}.role`}
                  control={control}
                  render={({ field }) => (
                    <SelectFloat
                      label={t('overview.contactRole')}
                      value={field.value}
                      onValueChange={field.onChange}
                      error={contactErrors?.[index]?.role?.message}
                      disabled={isDisableField}
                    >
                      {EVENT_CONTACT_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {t(`overview.contactRoleOptions.${role}`)}
                        </SelectItem>
                      ))}
                    </SelectFloat>
                  )}
                />
                <InputFloat
                  label={t('overview.email')}
                  type="email"
                  value={watched.contacts?.[index]?.contactEmail ?? ''}
                  error={contactErrors?.[index]?.contactEmail?.message}
                  disabled={isDisableField}
                  {...register(`contacts.${index}.contactEmail`)}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline-primary"
            disabled={isDisableField}
            onClick={() =>
              append(
                { contactName: '', contactEmail: '', contactPhone: '+49', role: undefined as never },
                { shouldFocus: false },
              )
            }
          >
            {t('overview.addMoreContacts')}
            <PlusIcon className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
