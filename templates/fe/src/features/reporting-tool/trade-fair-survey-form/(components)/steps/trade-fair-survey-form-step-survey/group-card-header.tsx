import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useGroupAction, isLockedGroup } from "../../../(hooks)/use-group-action";
import { Pencil, GripVertical } from "lucide-react";
import { Controller } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import GroupActionButtons from "./group-action-buttons";
import { GroupDto, TradeFairSurveyFormDto } from "../../../(helpers)/trade-fair-survey-form-schema";
import { CustomSwitch } from "@/shared/components/ui/custom-switch";
import { useGroupDragStore } from "../../../(stores)/use-group-drag-store";
import { useState } from "react";
import DisableGroupAlertDialog from "./disable-group-alert-dialog";

type GroupCardHeaderProps = {
  group: GroupDto;
  stepPosition: number;
  isFirstGroup: boolean;
  isLastGroup: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handlePencilClick: () => void;
};

export const GroupCardHeader = ({
  group,
  stepPosition,
  isFirstGroup,
  isLastGroup,
  inputRef,
  handlePencilClick,
}: GroupCardHeaderProps) => {
  const t = useTranslations('reportingTool');
  const { control, setValue } = useFormContext<TradeFairSurveyFormDto>();
  const [isDisableAlertOpen, setIsDisableAlertOpen] = useState(false);
  const { moveGroup, duplicateGroup, deleteGroup } = useGroupAction();
  const setDraggedGroup = useGroupDragStore((s) => s.setDraggedGroup);

  const isLocked = isLockedGroup(group);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    const card = (e.currentTarget as HTMLElement).closest('[data-group-card]') as HTMLElement | null;
    if (card) {
      e.dataTransfer.setDragImage(card, 24, 24);
    }
    setDraggedGroup({ stepPosition, groupPosition: group.position });
  };

  const handleDragEnd = () => {
    setDraggedGroup(null);
  };

  return (
    <div className="flex items-center justify-between w-full mr-3">
      <div className="flex items-center gap-2 flex-1 min-w-0 mr-4">
        {!isLocked && (
          <span
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            className="shrink-0 cursor-grab active:cursor-grabbing flex items-center p-1 hover:bg-slate-100 rounded text-muted-foreground transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </span>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                handlePencilClick();
              }}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.stopPropagation();
                  handlePencilClick();
                }
              }}
              className="h-8 w-8 shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-full cursor-pointer transition-colors text-primary"
            >
              <Pencil className="h-4 w-4 text-primary shrink-0" />
            </div>
          </TooltipTrigger>
          <TooltipContent onClick={(e) => e.stopPropagation()}>
            {t('tradeFairSurveyForm.clickToEditGroupName')}
          </TooltipContent>
        </Tooltip>
        <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
          <Controller
            control={control}
            name={`steps.${stepPosition}.groups.${group.position}.title`}
            render={({ field }) => (
              <Input
                {...field}
                ref={(el) => {
                  field.ref(el);
                  inputRef.current = el;
                }}
                value={field.value ?? ""}
                className="bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto text-base! font-normal w-full"
                placeholder={t('tradeFairSurveyForm.enterGroupTitle')}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.stopPropagation();
                  }
                }}
              />
            )}
          />
        </div>
      </div>

      <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
        {isLocked ? (
          <Controller
            control={control}
            name={`steps.${stepPosition}.groups.${group.position}.isDisable`}
            render={({ field }) => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center px-2"
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <CustomSwitch
                      checked={!field.value}
                      ariaLabel={t('tradeFairSurveyForm.toggleGroup')}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setIsDisableAlertOpen(true);
                        } else {
                          field.onChange(false);
                          setValue(
                            `steps.${stepPosition}.groups.${group.position}._collapsed`,
                            false,
                            { shouldDirty: true },
                          );
                        }
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {t('tradeFairSurveyForm.hideSectionTooltip')}
                </TooltipContent>
              </Tooltip>
            )}
          />
        ) : (
          <GroupActionButtons
            stepPosition={stepPosition}
            groupPosition={group.position}
            isFirstGroup={isFirstGroup}
            isLastGroup={isLastGroup}
            moveGroup={moveGroup}
            duplicateGroup={duplicateGroup}
            deleteGroup={deleteGroup}
          />
        )}
      </div>
      {isDisableAlertOpen && (
        <DisableGroupAlertDialog
          open={isDisableAlertOpen}
          groupName={group.title}
          onClose={() => setIsDisableAlertOpen(false)}
          onConfirm={() => {
            setValue(
              `steps.${stepPosition}.groups.${group.position}.isDisable`,
              true,
              { shouldDirty: true },
            );
            setValue(
              `steps.${stepPosition}.groups.${group.position}._collapsed`,
              true,
              { shouldDirty: true },
            );
            setIsDisableAlertOpen(false);
          }}
        />
      )}
    </div>
  );
};
