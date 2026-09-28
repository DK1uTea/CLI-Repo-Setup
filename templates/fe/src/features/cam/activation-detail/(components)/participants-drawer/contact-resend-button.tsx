'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { useResendContact } from '../../(hooks)/use-resend-contact';

type Props = {
  contactId: string;
  activationId: string;
};

const COUNTDOWN_SECONDS = 60;

const ContactResendButton = ({ contactId, activationId }: Props) => {
  const t = useTranslations('activationView.participants.contacts');
  const { mutate, isPending } = useResendContact();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = () => {
    if (isPending || countdown > 0) return;
    mutate(
      { contactId, activationId },
      {
        onSuccess: () => {
          toast.success(t('resendSuccess'));
          setCountdown(COUNTDOWN_SECONDS);
        },
        onError: () => toast.error(t('resendFailed')),
      },
    );
  };

  return (
    <Button
      type="button"
      variant="link"
      size="xs"
      className="h-auto p-0"
      isLoading={isPending}
      disabled={countdown > 0}
      onClick={handleResend}
    >
      {countdown > 0 ? t('resendCountdown', { seconds: countdown }) : t('retrySend')}
    </Button>
  );
};

export default ContactResendButton;
