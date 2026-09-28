'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Mail, MapPin, PhoneCall } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/components/ui/input-group';
import type { Question } from '../../../(helpers)/survey-detail-type';

type TextFieldProps = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

export function TextField({ fieldName, question, errorMsg }: TextFieldProps) {
  const { register } = useFormContext();
  const t = useTranslations('reportingTool.questionForm');
  const previewT = useTranslations('reportingTool.previewSurvey');

  const shortTextPlaceholder = question.placeholder || t('shortTextDefaultPlaceholder');
  const getDefaultLabel = () => {
    switch (question.type) {
      case 'ADDRESS':
        return previewT('defaultLabels.address');
      case 'PHONE_NUMBER':
        return previewT('defaultLabels.phoneNumber');
      case 'EMAIL':
        return previewT('defaultLabels.email');
      default:
        return t('shortTextDefaultLabel');
    }
  };
  const label = question.content || getDefaultLabel();

  const renderInput = () => {
    if (question.type === 'PHONE_NUMBER') {
      return (
        <InputGroup className="h-11 bg-background rounded-input-group! px-4">
          <InputGroupAddon className='p-0'>
            <PhoneCall className='text-primary' />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder={question.placeholder || ''}
            aria-invalid={!!errorMsg}
            {...register(fieldName)}
          />
        </InputGroup>
      );
    }

    if (question.type === 'EMAIL') {
      return (
        <InputGroup className="h-11 bg-background rounded-input-group! px-4">
          <InputGroupAddon className='p-0'>
            <Mail className='text-primary' />
          </InputGroupAddon>
          <InputGroupInput
            type="email"
            placeholder={question.placeholder || ''}
            aria-invalid={!!errorMsg}
            {...register(fieldName)}
          />
        </InputGroup>
      );
    }

    if (question.type === 'ADDRESS') {
      return (
        <InputGroup className="h-11 bg-background rounded-input-group! px-4">
          <InputGroupAddon className='p-0'>
            <MapPin className='text-primary' />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder={question.placeholder || ''}
            aria-invalid={!!errorMsg}
            {...register(fieldName)}
          />
        </InputGroup>
      );
    }

    return (
      <Input
        type="text"
        placeholder={shortTextPlaceholder}
        aria-invalid={!!errorMsg}
        {...register(fieldName)}
        className="h-11 bg-background rounded-input-group!"
      />
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground">
        {label}
        {question.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      {renderInput()}
      {errorMsg && <p className="text-xs text-destructive mt-1">{errorMsg}</p>}
    </div>
  );
}
