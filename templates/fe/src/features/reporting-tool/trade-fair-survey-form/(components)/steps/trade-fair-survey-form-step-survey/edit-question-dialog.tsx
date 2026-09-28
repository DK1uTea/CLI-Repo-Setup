'use client'

import { useEffect, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/shared/components/ui/dialog'
import InfoTooltip from './info-tooltip'
import { Button } from '@/shared/components/ui/button'
import QuestionForm from './question-form'
import { QuestionDto, QuestionSchema } from '../../../(helpers)/trade-fair-survey-form-schema'
import PreviewQuestionDialog, { mapQuestionDtoToQuestion } from '@/features/reporting-tool/preview-survey/preview-question/(components)/preview-question-dialog'
import type { Question } from '@/features/reporting-tool/(helpers)/survey-detail-type'

type Props = {
  open: boolean
  question: QuestionDto | null
  onClose: () => void
  onSave: (question: QuestionDto) => void
}

export default function EditQuestionDialog({ open, question, onClose, onSave }: Props) {
  const t = useTranslations('reportingTool.questionForm')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null)

  const form = useForm<QuestionDto>({
    resolver: zodResolver(QuestionSchema),
    mode: 'onChange',
    defaultValues: {
      content: '',
      type: 'SHORT_TEXT',
      isRequired: false,
      isDisable: false,
      placeholder: null,
      metadata: null,
      position: 0
    }
  })

  const { handleSubmit, reset, formState: { isValid } } = form

  useEffect(() => {
    if (open && question) {
      reset({
        ...question,
        isDisable: question.isDisable ?? false
      })
    }
  }, [open, question, reset])

  const onSubmit = (data: QuestionDto) => {
    onSave(data)
    onClose()
  }

  const handlePreview = () => {
    const values = form.getValues()
    const mapped = mapQuestionDtoToQuestion(values)
    setPreviewQuestion(mapped)
    setIsPreviewOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-2xl gap-0">
          <DialogHeader className="h-12 flex justify-center pb-4">
            <DialogTitle className="flex items-center gap-2">
              {t('editQuestionTitle')}
              <InfoTooltip content={t('editQuestionTitleInfo')} />
            </DialogTitle>
          </DialogHeader>
          <div className="h-px bg-border -mx-4" />
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
              <div className="_custom-scroll max-h-[60vh] overflow-y-auto pr-2 pl-1 -ml-1">
                <QuestionForm />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline-primary" className="sm:mr-auto" onClick={handlePreview}>
                  {t('preview')}
                </Button>
                <Button type="button" variant="outline-primary" onClick={onClose}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={!isValid}>
                  {t('save')}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {isPreviewOpen && (
        <PreviewQuestionDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          question={previewQuestion}
        />
      )}
    </>
  )
}
