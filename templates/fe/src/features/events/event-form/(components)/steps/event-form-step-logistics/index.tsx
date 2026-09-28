'use client';

import { useFormContext } from 'react-hook-form';
import { useUnsavedChanges } from '@/shared/hooks/common/use-unsaved-changes';
import { UnsavedChangesDialog } from '@/shared/components/common/unsaved-changes-dialog';
import { useSubmitStepLogistics } from '../../../(hooks)/use-submit-step-logistics';
import { LogisticsContactCard } from './logistics-contact-card';
import { LogisticsUploadCard } from './logistics-upload-card';

export function EventFormStepLogistics() {
  const methods = useFormContext();
  const { isDirty } = methods.formState;
  const { submit } = useSubmitStepLogistics();
  const { dialogProps } = useUnsavedChanges({
    isDirty,
    onDiscard: () => methods.reset(),
    onSave: async () => {
      if (!await submit()) return false;
      methods.reset(methods.getValues());
    },
  });

  return (
    <div className="space-y-4">
      <LogisticsContactCard />
      <LogisticsUploadCard />
      <UnsavedChangesDialog {...dialogProps} />
    </div>
  );
}
