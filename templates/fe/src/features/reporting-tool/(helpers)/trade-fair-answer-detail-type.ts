import { SurveyDetail } from "./survey-detail-type";
import { AnswerStatus, FormData } from "./trade-fair-answer-type";

type AnswerDetailSurvey = Omit<SurveyDetail, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Record<string, never>;
  updatedAt: string | Record<string, never>;
};

export type AnswerDetailContact = {
  salutation?: string;
  firstName: string;
  lastName: string;
  company: string;
  function?: string;
  email: string;
  phoneNumber: string;
  streetAndHouseNumber: string;
  postalCode: string;
  city: string;
};

export type AnswerDetail = {
  id: string;
  status: AnswerStatus;
  currentStep: number;
  maxCompletedStep: number;
  formData: FormData;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  contact: AnswerDetailContact;
  survey: AnswerDetailSurvey;
};