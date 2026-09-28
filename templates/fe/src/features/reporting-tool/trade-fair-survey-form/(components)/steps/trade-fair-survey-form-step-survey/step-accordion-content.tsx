import { StepDto } from "../../../(helpers)/trade-fair-survey-form-schema";
import { Button } from "@/shared/components/ui/button";
import { PlusIcon } from "lucide-react";
import GroupCard from "./group-card";
import { useGroupAction, isLockedGroup } from "../../../(hooks)/use-group-action";
import { useTranslations } from "next-intl";
import { Accordion } from "@/shared/components/ui/accordion";
import { useState } from "react";
import { useGroupDragStore } from "../../../(stores)/use-group-drag-store";
import { useFormContext } from "react-hook-form";
import { TradeFairSurveyFormDto } from "../../../(helpers)/trade-fair-survey-form-schema";

type Props = {
  step: StepDto;
};

const StepAccordionContent = ({ step }: Props) => {
  const t = useTranslations('reportingTool.tradeFairSurveyForm');
  const draggedGroup = useGroupDragStore((s) => s.draggedGroup);
  const setDraggedGroup = useGroupDragStore((s) => s.setDraggedGroup);
  const { addGroup, dragMoveGroup } = useGroupAction();
  const { setValue, getValues } = useFormContext<TradeFairSurveyFormDto>();

  const openGroups = step.groups
    ?.filter(g => !g.isDisable && g._collapsed !== true)
    ?.map(g => g.id || String(g.position)) || [];
  const [dropBefore, setDropBefore] = useState<number | null>(null);

  const handleOpenGroupsChange = (newOpenValues: string[]) => {
    const steps = getValues('steps') || [];
    const currentStepIndex = step.position;
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    const newGroups = currentStep.groups?.map(group => {
      const groupValue = group.id || String(group.position);
      const isCollapsed = group.isDisable || !newOpenValues.includes(groupValue);
      return {
        ...group,
        _collapsed: isCollapsed
      };
    });

    setValue(`steps.${currentStepIndex}.groups`, newGroups, { shouldDirty: true });
  };

  const hasLocked = step.groups?.some((g) => isLockedGroup(g)) ?? false;

  const resolveInsertIndex = (index: number) => {
    // If target step has a locked group (at position 0), cannot insert before it.
    return hasLocked && index < 1 ? 1 : index;
  };

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    if (!draggedGroup) return;

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    setDropBefore(resolveInsertIndex(index));
  };

  const handleCardDrop = (e: React.DragEvent, index: number) => {
    if (!draggedGroup) return;

    e.preventDefault();
    e.stopPropagation();

    const insertIndex = resolveInsertIndex(index);
    dragMoveGroup(
      draggedGroup.stepPosition,
      draggedGroup.groupPosition,
      step.position,
      insertIndex
    );

    setDraggedGroup(null);
    setDropBefore(null);
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    if (!draggedGroup) return;

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    setDropBefore(step.groups?.length ?? 0);
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    if (!draggedGroup) return;

    e.preventDefault();
    e.stopPropagation();

    dragMoveGroup(
      draggedGroup.stepPosition,
      draggedGroup.groupPosition,
      step.position,
      step.groups?.length ?? 0
    );

    setDraggedGroup(null);
    setDropBefore(null);
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropBefore(null);
    }
  };

  const DropLine = () => (
    <div className="h-[3px] rounded-full bg-primary mx-1 my-1 transition-all" />
  );

  return (
    <div
      className="flex flex-col gap-3 min-h-[50px]"
      onDragOver={handleContainerDragOver}
      onDrop={handleContainerDrop}
      onDragLeave={handleContainerDragLeave}
    >
      {(!step.groups || step.groups.length === 0) && (
        <div className="px-4 py-2">
          <p className="text-muted-foreground/50">{t('noGroupsYet')}</p>
        </div>
      )}
      {step.groups && step.groups.length > 0 && (
        <Accordion type="multiple" value={openGroups} onValueChange={handleOpenGroupsChange}>
          {[...step.groups]
            .sort((a, b) => a.position - b.position)
            .map((group, idx) => (
              <div
                key={group.id || group.position}
                onDragOver={(e) => handleCardDragOver(e, idx)}
                onDrop={(e) => handleCardDrop(e, idx)}
              >
                {dropBefore === idx && <DropLine />}
                <GroupCard
                  group={group}
                  stepPosition={step.position}
                  isOpen={openGroups.includes(group.id || String(group.position))}
                />
              </div>
            ))}
        </Accordion>
      )}
      {dropBefore === step.groups?.length && <DropLine />}
      <Button
        variant="outline-primary"
        className="border-dashed text-sm lg:h-12"
        type="button"
        onClick={() => addGroup(step.position)}
      >
        {t('addGroupBtn')} <PlusIcon data-icon="inline-end" />
      </Button>
    </div>
  );
};

export default StepAccordionContent;
