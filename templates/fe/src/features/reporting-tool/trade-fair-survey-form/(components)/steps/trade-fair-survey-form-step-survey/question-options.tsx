'use client'

import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { PlusIcon, Trash2Icon, GripVertical } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import InfoTooltip from './info-tooltip'
import { useTranslations } from 'next-intl'

type Props = {
  control: any
  errors: any
  fields: any[]
  remove: (index: number) => void
  move: (from: number, to: number) => void
  setValue: any
  handleAddOption: () => void
}

export default function QuestionOptions({ control, errors, fields, remove, move, setValue, handleAddOption }: Props) {
  const t = useTranslations('reportingTool.questionForm')

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [draggableIndex, setDraggableIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      move(dragIndex, index)
      setDragIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDraggableIndex(null)
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1.5 items-start">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-muted-foreground">{t('answerOptions')}</span>
          <InfoTooltip content={t('answerOptionsInfo')} />
        </div>
        <Button
          type="button"
          variant="outline-primary"
          size="sm"
          onClick={handleAddOption}
          className='w-full h-10'
        >
          {t('addAnswer')}
          <PlusIcon className="size-3.5" data-icon="inline-end" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {fields.map((field, idx) => (
          <Controller
            key={field.id}
            control={control}
            name={`metadata.options.${idx}.label` as any}
            render={({ field: labelField }) => (
              <div
                className={`bg-background relative transition-opacity ${dragIndex === idx ? 'opacity-30' : ''}`}
                draggable={draggableIndex === idx}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={handleDragEnd}
              >
                <div
                  className="absolute left-1.5 top-2 z-10 cursor-grab p-1 active:cursor-grabbing"
                  onMouseEnter={() => setDraggableIndex(idx)}
                  onMouseLeave={() => setDraggableIndex(null)}
                >
                  <GripVertical size={16} className="text-muted-foreground/40" />
                </div>

                <Input
                  {...labelField}
                  value={labelField.value ?? ""}
                  placeholder={`${t('answerPlaceholder')} ${idx + 1}`}
                  error={(errors.metadata as any)?.options?.[idx]?.label?.message}
                  className="pl-9 pr-9"
                  onChange={(e) => {
                    labelField.onChange(e.target.value)
                    setValue(`metadata.options.${idx}.value` as any, e.target.value.trim().toLowerCase())
                  }}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(idx)}
                  disabled={fields.length <= 1}
                  className="absolute right-1 top-1 z-10 size-8 text-destructive hover:bg-destructive/10"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            )}
          />
        ))}
      </div>
    </div>
  )
}
