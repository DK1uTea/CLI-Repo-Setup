'use client';

import { LockKeyhole, LockKeyholeOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';

import { useSurveyRequiredLogin } from '@/features/reporting-tool/(hooks)/(survey-hooks)/use-survey-required-login';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import { CustomSwitch } from '@/shared/components/ui/custom-switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

type Props = {
  trigger?: ReactNode;
  requiredLogin: boolean;
  eventSurveyId?: string;
  onRequiredLoginChange?: (requiredLogin: boolean) => void | Promise<void>;
};

const RequiredLoginAlertDialog = ({
  trigger,
  requiredLogin,
  eventSurveyId,
  onRequiredLoginChange,
}: Props) => {
  const t = useTranslations(
    'reportingTool.tradeFairEventForm.survey.requiredLoginDialog'
  );
  const [open, setOpen] = useState(false);
  const { updateRequiredLogin, isUpdating } =
    useSurveyRequiredLogin(eventSurveyId ?? '');
  const nextRequiredLogin = !requiredLogin;

  const handleConfirm = async () => {
    try {
      if (onRequiredLoginChange) {
        await onRequiredLoginChange(nextRequiredLogin);
      } else if (eventSurveyId) {
        await updateRequiredLogin({
          requiredLogin: nextRequiredLogin,
        });
      }
      setOpen(false);
    } catch {
      // Error feedback is handled by the API client interceptor.
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          {trigger ? (
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
          ) : (
            <Button
              type="button"
              variant="outline"
              aria-label={requiredLogin ? t('disableLabel') : t('enableLabel')}
              onClick={() => setOpen(true)}
              className="flex items-center justify-between gap-3"
            >
              {requiredLogin ? (
                <LockKeyhole data-icon="inline-start" />
              ) : (
                <LockKeyholeOpen data-icon="inline-start" />
              )}
              <CustomSwitch
                checked={!requiredLogin}
                decorative
                onCheckedChange={() => setOpen(true)}
              />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {requiredLogin ? t('privateTooltip') : t('publicTooltip')}
        </TooltipContent>
      </Tooltip>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {nextRequiredLogin ? t('enableTitle') : t('disableTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {nextRequiredLogin
              ? t('enableDescription')
              : t('disableDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isUpdating}
            isLoading={isUpdating}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RequiredLoginAlertDialog;
