import TradeFairSurveyFormStepSurvey from "../(components)/steps/trade-fair-survey-form-step-survey/trade-fair-survey-form-step-survey";
import TradeFairSurveyFormStepAssignUsers from "../(components)/steps/trade-fair-survey-form-step-assign-users/trade-fair-survey-form-step-assign-users";
import { StepDto } from "./trade-fair-survey-form-schema";

export type TradeFairSurveyFormMode = 'create' | 'update';

export const STEP_NAMES = ["survey", "assign-users"] as const;

export type StepName = (typeof STEP_NAMES)[number];

export const STEP_COMPONENTS: Record<StepName, React.ComponentType> = {
  "survey": TradeFairSurveyFormStepSurvey,
  "assign-users": TradeFairSurveyFormStepAssignUsers
};

type SurveyFormConfig = {
  steps: readonly StepName[];
  cancelHref: string;
  submitRedirectHref: string;
};

export const TRADE_FAIR_SURVEY_FORM_CONFIG: SurveyFormConfig = {
  steps: STEP_NAMES,
  cancelHref: '/reporting-tool?tab=survey-builder',
  submitRedirectHref: '/reporting-tool?tab=survey-builder',
};

export const DEFAULT_TRADE_FAIR_SURVEY_STEPS: StepDto[] = [
  {
    title: "General Information",
    position: 0,
    groups: [
      {
        title: "Contact Information",
        position: 0,
        isDisable: false,
        questions: [
          {
            field_key: "salutation",
            content: "Anrede",
            type: "DROPDOWN",
            position: 0,
            isRequired: false,
            isDisable: false,
            placeholder: "Bitte wählen...",
            metadata: {
              options: [
                {
                  label: "Herr",
                  value: "Herr"
                },
                {
                  label: "Frau",
                  value: "Frau"
                },
                {
                  label: "Divers",
                  value: "Divers"
                }
              ]
            }
          },
          {
            field_key: "first_name",
            content: "Vorname",
            type: "SHORT_TEXT",
            position: 1,
            isRequired: true,
            isDisable: false,
            placeholder: "Max"
          },
          {
            field_key: "last_name",
            content: "Nachname",
            type: "SHORT_TEXT",
            position: 2,
            isRequired: true,
            isDisable: false,
            placeholder: "Mustermann"
          },
          {
            field_key: "company",
            content: "Firma",
            type: "SHORT_TEXT",
            position: 3,
            isRequired: false,
            isDisable: false,
            placeholder: "Mustermann GmbH..."
          },
          {
            field_key: "function",
            content: "Funktion",
            type: "DROPDOWN_ADD_ON",
            position: 4,
            isRequired: false,
            isDisable: false,
            placeholder: "Bitte wählen Sie...",
            metadata: {
              options: [
                {
                  label: "Management",
                  value: "Management"
                },
                {
                  label: "Branch Manager",
                  value: "Branch Manager"
                },
                {
                  label: "Site Manager",
                  value: "Site Manager"
                },
                {
                  label: "Employee",
                  value: "Employee"
                }
              ]
            }
          },
          {
            field_key: "street",
            content: "Straße und Hausnummer",
            type: "SHORT_TEXT",
            position: 5,
            isRequired: false,
            isDisable: false,
            placeholder: "Bahnhofstraße 12A"
          },
          {
            field_key: "zip",
            content: "Postleitzahl (PLZ)",
            type: "SHORT_TEXT",
            position: 6,
            isRequired: false,
            isDisable: false,
            placeholder: "z.B. 80331"
          },
          {
            field_key: "city",
            content: "Stadt / Ort",
            type: "SHORT_TEXT",
            position: 7,
            isRequired: false,
            isDisable: false,
            placeholder: "z.B. München"
          },
          {
            field_key: "phone",
            content: "Telefonnummer",
            type: "PHONE_NUMBER",
            position: 8,
            isRequired: false,
            isDisable: false,
            placeholder: "+49"
          },
          {
            field_key: "email",
            content: "E-Mail",
            type: "EMAIL",
            position: 9,
            isRequired: true,
            isDisable: false,
            placeholder: "z.B. max@mustermann.com"
          }
        ]
      }
    ]
  }
];
