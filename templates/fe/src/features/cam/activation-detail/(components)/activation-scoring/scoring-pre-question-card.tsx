import { ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Props = {
  title: string;
  question: string;
  answer: string | null;
};

const ScoringPreQuestionCard = ({ title, question, answer }: Props) => {
  const t = useTranslations('activationView');
  if (!answer) return null;

  return (
    <div className="space-y-1 rounded-2xl border border-border bg-card p-5">
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="text-sm font-normal text-muted-foreground">{question}</p>
      <div>
        <span className="mb-2 block text-sm font-medium uppercase text-muted-foreground">{t('scoring.sectionAnswer')}</span>
        <div className="rounded-xl border border-border bg-background p-3.5 text-sm font-medium text-foreground">
          <div className="flex items-start gap-2">
            <ChevronRightIcon className="mt-0.5 size-4 shrink-0" />
            <span className="flex-1">{answer}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringPreQuestionCard;
