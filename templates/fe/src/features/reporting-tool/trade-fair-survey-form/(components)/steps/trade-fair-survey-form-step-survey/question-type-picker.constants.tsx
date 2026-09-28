import React from 'react'
import {
  AlignLeft,
  AlignJustify,
  CircleDot,
  SquareCheck,
  ChevronDown,
  ToggleLeft,
  CalendarDays,
  Phone,
  MapPin,
  Mail,
  Star,
  Hash,
  ListChecks,
  ListPlus,
  UserSearch,
  GitFork
} from 'lucide-react'
import { QuestionType } from '@/features/reporting-tool/(helpers)/survey-detail-type'

export const TYPE_ICONS: Record<QuestionType, React.ReactNode> = {
  SHORT_TEXT: <AlignLeft size={15} />,
  LONG_TEXT: <AlignJustify size={15} />,
  SINGLE_CHOICE: <CircleDot size={15} />,
  MULTIPLE_CHOICE: <SquareCheck size={15} />,
  DROPDOWN: <ChevronDown size={15} />,
  TOGGLE: <ToggleLeft size={15} />,
  DATE: <CalendarDays size={15} />,
  PHONE_NUMBER: <Phone size={15} />,
  ADDRESS: <MapPin size={15} />,
  EMAIL: <Mail size={15} />,
  RATING: <Star size={15} />,
  INPUT_NUMBER: <Hash size={15} />,
  MULTI_SELECT_DROPDOWN: <ListChecks size={15} />,
  DROPDOWN_ADD_ON: <ListPlus size={15} />,
  CUSTOMER_LOOKUP: <UserSearch size={15} />,
  YES_NO: <GitFork size={15} />,
  CHECKBOX_GROUP: <SquareCheck size={15} /> // Legacy fallback
}

export const QUESTION_GROUPS = [
  {
    groupKey: 'most_used',
    types: [
      'SHORT_TEXT',
      'LONG_TEXT',
      'SINGLE_CHOICE',
      'MULTIPLE_CHOICE',
      'DROPDOWN',
      'TOGGLE'
    ] as QuestionType[]
  },
  {
    groupKey: 'basic',
    types: [
      'DATE',
      'PHONE_NUMBER',
      'ADDRESS',
      'EMAIL',
      'RATING',
      'INPUT_NUMBER'
    ] as QuestionType[]
  },
  {
    groupKey: 'advanced',
    types: [
      'MULTI_SELECT_DROPDOWN',
      'DROPDOWN_ADD_ON',
      'YES_NO',
      'CHECKBOX_GROUP'
    ] as QuestionType[]
  }
]
