import { GroupDto, TradeFairSurveyFormDto } from "../../../(helpers)/trade-fair-survey-form-schema";
import { useRef } from "react";
import { useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { GroupCardHeader } from "./group-card-header";
import { GroupCardContent } from "./group-card-content";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { useTranslations } from "next-intl";
import { useGroupDragStore } from "../../../(stores)/use-group-drag-store";
import { isLockedGroup } from "../../../(hooks)/use-group-action";

type Props = {
  group: GroupDto;
  stepPosition: number;
  isOpen: boolean;
}

const GroupCard = ({ group, stepPosition, isOpen }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const t = useTranslations('reportingTool.tradeFairSurveyForm');

  const watchVal = useWatch<TradeFairSurveyFormDto>();
  const steps = watchVal.steps || [];
  const currentStep = steps[stepPosition];
  const groups = currentStep?.groups || [];
  const hasLocked = groups.some((g) => isLockedGroup(g));
  const isFirstGroup = hasLocked ? group.position <= 1 : group.position === 0;
  const isLastGroup = group.position === groups.length - 1;

  const draggedGroup = useGroupDragStore((s) => s.draggedGroup);
  const isBeingDragged =
    draggedGroup?.stepPosition === stepPosition &&
    draggedGroup?.groupPosition === group.position;

  const handlePencilClick = () => {
    const input = inputRef.current;
    if (input) {
      input.focus();
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
  };

  return (
    <AccordionItem
      value={group.id || String(group.position)}
      data-group-card
      className={cn(
        "ring-1 ring-light-gray bg-card text-card-foreground shadow-sm rounded-[12px] overflow-hidden border-none transition-opacity duration-200",
        group.isDisable && "opacity-50",
        isBeingDragged && "opacity-40"
      )}
    >
      <AccordionTrigger
        tooltip={isOpen ? t('collapseGroup') : t('expandGroup')}
        className="py-3 px-5 hover:no-underline"
      >
        <GroupCardHeader
          group={group}
          stepPosition={stepPosition}
          isFirstGroup={isFirstGroup}
          isLastGroup={isLastGroup}
          inputRef={inputRef}
          handlePencilClick={handlePencilClick}
        />
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <GroupCardContent group={group} stepPosition={stepPosition} />
      </AccordionContent>
    </AccordionItem>
  );
}

export default GroupCard;