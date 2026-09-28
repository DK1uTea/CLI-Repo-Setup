'use client'

import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { useActivationStep2Form } from '../../../(hooks)/use-activation-step2-form'
import { StoreSummary } from './store-summary'
import { ActivationNameInput } from './activation-name-input'
import { ResponsibleCamInput } from './responsible-cam-input'
import { OutletsInput } from './outlets-input'
import { HtzInput } from './htz-input'
import { TargetGroupInput } from './target-group-input'
import { SalesConceptInput } from './sales-concept-input'
import { ContractSituationInput } from './contract-situation-input'
import { RevenuePotentialInput } from './revenue-potential-input'
// import { BrandFitInput } from './brand-fit-input'
// import { ProfitabilityInput } from './profitability-input'
import { AhMarketInput } from './ah-market-input'
import { HMarktInput } from './h-markt-input'
import type { ActivationStep2Data } from '../../../(helpers)/activation-step2-schema'

export const ACTIVATION_STEP2_FORM_ID = 'activation-step2-form'

type Props = {
  storeId: string
  onEditStore: () => void
  onSubmit: (data: ActivationStep2Data, form: UseFormReturn<ActivationStep2Data>) => void
  initialData?: Partial<ActivationStep2Data>
}

export function StepActivation({ storeId, onEditStore, onSubmit, initialData }: Props) {
  const { form } = useActivationStep2Form(initialData)

  return (
    <FormProvider {...form}>
      <form
        id={ACTIVATION_STEP2_FORM_ID}
        noValidate
        onSubmit={form.handleSubmit((data) => onSubmit(data, form))}
        className="space-y-4"
      >
        <StoreSummary storeId={storeId} onEdit={onEditStore} />
        <ActivationNameInput />
        <ResponsibleCamInput />
        <OutletsInput />
        <HtzInput />
        <TargetGroupInput />
        <SalesConceptInput />
        <ContractSituationInput />
        <RevenuePotentialInput />
        <AhMarketInput />
        <HMarktInput />
        {/* <BrandFitInput />
        <ProfitabilityInput /> */}
      </form>
    </FormProvider>
  )
}
