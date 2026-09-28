'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { UseFormSetError } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { LoadingIcon } from '@/shared/components/common/icons';
import { useAddContactForm } from '../../(hooks)/use-add-contact-form';
import { useLookupContact } from '../../(hooks)/use-lookup-contact';
import type { AddContactFormValues } from '../../(helpers)/add-contact-schema';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddContactFormValues, setError: UseFormSetError<AddContactFormValues>) => void;
  isLoading?: boolean;
  isDetailLoading?: boolean;
  initialValues?: Partial<AddContactFormValues>;
  title?: string;
};

const EMPTY_VALUES: AddContactFormValues = {
  contactId: undefined,
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
};

const AddContactDialog = ({ open, onClose, onSubmit, isLoading, isDetailLoading, initialValues, title }: Props) => {
  const t = useTranslations('activationView.participants.contacts.addContactDialog');
  const isEditMode = !!initialValues;
  const [showContactFields, setShowContactFields] = useState(isEditMode);
  const [lookedUpEmail, setLookedUpEmail] = useState('');
  const { mutateAsync: lookupContact, isPending: isLookupLoading } = useLookupContact();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    trigger,
    clearErrors,
    formState: { errors },
  } = useAddContactForm(showContactFields);

  useEffect(() => {
    if (!open) return;
    if (initialValues) {
      reset({ ...EMPTY_VALUES, ...initialValues });
      setShowContactFields(true);
      setLookedUpEmail(initialValues.email ?? '');
    } else {
      reset(EMPTY_VALUES);
      setShowContactFields(false);
      setLookedUpEmail('');
    }
  }, [open, initialValues, reset]);

  const handleOpenChange = (next: boolean) => {
    if (next) return;
    reset(EMPTY_VALUES);
    setShowContactFields(isEditMode);
    setLookedUpEmail('');
    onClose();
  };

  const handleLookupEmail = async () => {
    if (isEditMode) return true;

    const isEmailValid = await trigger('email');
    const email = getValues('email').trim();
    if (!isEmailValid || !email) return false;
    if (showContactFields && lookedUpEmail === email) return true;

    const contact = await lookupContact(email);
    if (contact) {
      setValue('contactId', contact.id, { shouldDirty: true });
      setValue('firstName', contact.firstName, { shouldDirty: true });
      setValue('lastName', contact.lastName, { shouldDirty: true });
      setValue('email', contact.email || email, { shouldDirty: true });
      setValue('phone', contact.tel, { shouldDirty: true });
      setValue('address', contact.address, { shouldDirty: true });
    } else {
      setValue('contactId', undefined, { shouldDirty: true });
      setValue('firstName', '', { shouldDirty: true });
      setValue('lastName', '', { shouldDirty: true });
      setValue('email', email, { shouldDirty: true });
      setValue('phone', '', { shouldDirty: true });
      setValue('address', '', { shouldDirty: true });
    }
    clearErrors();
    setLookedUpEmail(email);
    setShowContactFields(true);
    return true;
  };

  const handleFormSubmit = async (data: AddContactFormValues) => {
    if (!showContactFields) {
      await handleLookupEmail();
      return;
    }
    onSubmit(data, setError);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>{title ?? t('title')}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {isDetailLoading ? (
              <LoadingIcon className="mx-auto size-6" />
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-email">{t('emailPlaceholder')}</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    error={errors.email?.message}
                    {...register('email', {
                      onBlur: () => { void handleLookupEmail(); },
                      onChange: (e) => {
                        if (isEditMode) return;
                        const nextEmail = e.target.value.trim();
                        if (nextEmail !== lookedUpEmail) {
                          setShowContactFields(false);
                          setValue('contactId', undefined, { shouldDirty: true });
                        }
                      },
                    })}
                  />
                </div>

                {isLookupLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <LoadingIcon className="size-4" />
                    <span>{t('lookupLoading')}</span>
                  </div>
                )}

                {showContactFields && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <Label className='mb-2' htmlFor="contact-first-name">{t('firstNamePlaceholder')}</Label>
                        <Input id="contact-first-name" placeholder={t('firstNamePlaceholder')} error={errors.firstName?.message} {...register('firstName')} />
                      </div>
                      <div className="flex flex-col">
                        <Label className='mb-2' htmlFor="contact-last-name">{t('lastNamePlaceholder')}</Label>
                        <Input id="contact-last-name" placeholder={t('lastNamePlaceholder')} error={errors.lastName?.message} {...register('lastName')} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <Label className='mb-2' htmlFor="contact-phone">{t('phonePlaceholder')}</Label>
                      <Input id="contact-phone" placeholder={t('phonePlaceholder')} error={errors.phone?.message} {...register('phone')} />
                    </div>
                    <div className="flex flex-col">
                      <Label className='mb-2' htmlFor="contact-address">{t('addressPlaceholder')}</Label>
                      <Input id="contact-address" placeholder={t('addressPlaceholder')} error={errors.address?.message} {...register('address')} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading || isDetailLoading || isLookupLoading}>
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" isLoading={isLoading || isLookupLoading} disabled={isDetailLoading}>
              {t(isEditMode ? 'save' : 'add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactDialog;
