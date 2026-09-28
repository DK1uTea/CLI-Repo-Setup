'use client';

import { useFormContext } from 'react-hook-form';
import { TradeFairSurveyFormDto, GroupDto } from '../(helpers)/trade-fair-survey-form-schema';
import { useTranslations } from 'next-intl';

export type LiteGroup = {
  position?: number;
  questions?: {
    field_key?: string | null;
  }[];
}

export const isLockedGroup = (group?: LiteGroup, stepPosition?: number) => {
  if (stepPosition === 0 && group?.position === 0) return true;
  return group?.questions?.some(q => !!q?.field_key) ?? false;
};

export function useGroupAction() {
  const { setValue, getValues } = useFormContext<TradeFairSurveyFormDto>();
  const t = useTranslations('reportingTool.tradeFairSurveyForm');

  const generateUUID = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2);
  };

  const addGroup = (stepPosition: number) => {
    const steps = getValues('steps') || [];
    if (stepPosition < 0 || stepPosition >= steps.length) return;

    const targetStep = steps[stepPosition];
    const groups = targetStep.groups || [];
    const nextPosition = groups.length;

    const newGroup: GroupDto = {
      id: generateUUID(),
      title: `${t('group')} ${nextPosition + 1}`,
      position: nextPosition,
      isDisable: false,
      questions: [],
    };

    const newSteps = steps.map((step, idx) => {
      if (idx === stepPosition) {
        return {
          ...step,
          groups: [...groups, newGroup],
        };
      }
      return step;
    });

    setValue('steps', newSteps, { shouldDirty: true });
  };

  const moveGroup = (stepPosition: number, fromIndex: number, direction: 'up' | 'down') => {
    const steps = getValues('steps') || [];
    if (stepPosition < 0 || stepPosition >= steps.length) return;

    const targetStep = steps[stepPosition];
    const groups = targetStep.groups || [];
    const targetIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (targetIndex < 0 || targetIndex >= groups.length) return;

    // Prevent operations involving locked groups
    if (isLockedGroup(groups[fromIndex], stepPosition) || isLockedGroup(groups[targetIndex], stepPosition)) return;

    const newGroups = [...groups];
    // Swap
    const temp = newGroups[fromIndex];
    newGroups[fromIndex] = newGroups[targetIndex];
    newGroups[targetIndex] = temp;

    // Recalculate positions
    const finalGroups = newGroups.map((group, idx) => ({
      ...group,
      position: idx,
    }));

    const newSteps = steps.map((step, idx) => {
      if (idx === stepPosition) {
        return {
          ...step,
          groups: finalGroups,
        };
      }
      return step;
    });

    setValue('steps', newSteps, { shouldDirty: true });
  };

  const duplicateGroup = (stepPosition: number, index: number) => {
    const steps = getValues('steps') || [];
    if (stepPosition < 0 || stepPosition >= steps.length) return;

    const targetStep = steps[stepPosition];
    const groups = targetStep.groups || [];
    if (index < 0 || index >= groups.length) return;

    // Prevent duplicating locked groups
    if (isLockedGroup(groups[index], stepPosition)) return;

    const duplicatedGroup = JSON.parse(JSON.stringify(groups[index])) as GroupDto & { _collapsed?: boolean };
    duplicatedGroup.id = generateUUID();
    duplicatedGroup.title = `${duplicatedGroup.title} (${t('copySuffix')})`;
    duplicatedGroup._collapsed = undefined;

    const newGroups = [...groups];
    // Insert immediately after original group
    newGroups.splice(index + 1, 0, duplicatedGroup);

    // Recalculate positions
    const finalGroups = newGroups.map((group, idx) => ({
      ...group,
      position: idx,
    }));

    const newSteps = steps.map((step, idx) => {
      if (idx === stepPosition) {
        return {
          ...step,
          groups: finalGroups,
        };
      }
      return step;
    });

    setValue('steps', newSteps, { shouldDirty: true });
  };

  const deleteGroup = (stepPosition: number, index: number) => {
    const steps = getValues('steps') || [];
    if (stepPosition < 0 || stepPosition >= steps.length) return;

    const targetStep = steps[stepPosition];
    const groups = targetStep.groups || [];
    if (index < 0 || index >= groups.length) return;

    // Prevent deleting locked groups
    if (isLockedGroup(groups[index], stepPosition)) return;

    const newGroups = groups.filter((_, idx) => idx !== index);

    // Recalculate positions
    const finalGroups = newGroups.map((group, idx) => ({
      ...group,
      position: idx,
    }));

    const newSteps = steps.map((step, idx) => {
      if (idx === stepPosition) {
        return {
          ...step,
          groups: finalGroups,
        };
      }
      return step;
    });

    setValue('steps', newSteps, { shouldDirty: true });
  };

  const dragMoveGroup = (
    fromStep: number,
    fromIndex: number,
    toStep: number,
    insertBefore: number
  ) => {
    const steps = getValues('steps') || [];
    if (fromStep < 0 || fromStep >= steps.length) return;
    if (toStep < 0 || toStep >= steps.length) return;

    const sourceStep = steps[fromStep];
    const sourceGroups = sourceStep.groups || [];
    const groupToMove = sourceGroups[fromIndex];
    if (!groupToMove) return;

    // Prevent moving locked group
    if (isLockedGroup(groupToMove, fromStep)) return;

    // ── Same step: reorder in place ──
    if (fromStep === toStep) {
      const newGroups = [...sourceGroups];

      // Remove from old index
      newGroups.splice(fromIndex, 1);

      // Calculate new index
      let targetIndex = insertBefore;
      if (fromIndex < insertBefore) {
        targetIndex = insertBefore - 1;
      }

      const targetStep = steps[toStep];
      const hasLocked = targetStep.groups?.some(g => isLockedGroup(g, toStep));
      // Never let a group land before the locked group (which is at position 0)
      if (hasLocked && targetIndex < 1) {
        targetIndex = 1;
      }

      if (targetIndex < 0) targetIndex = 0;
      if (targetIndex > newGroups.length) targetIndex = newGroups.length;

      // Insert at new index
      newGroups.splice(targetIndex, 0, groupToMove);

      // Recalculate positions
      const finalGroups = newGroups.map((group, idx) => ({
        ...group,
        position: idx,
      }));

      const newSteps = steps.map((step, idx) => {
        if (idx === fromStep) {
          return {
            ...step,
            groups: finalGroups,
          };
        }
        return step;
      });

      setValue('steps', newSteps, { shouldDirty: true });
      return;
    }

    // ── Cross step: remove from source, insert into target ──
    const targetStep = steps[toStep];
    const targetGroups = targetStep.groups || [];

    let insertAt = insertBefore;
    const targetHasLocked = targetGroups.some(g => isLockedGroup(g, toStep));
    if (targetHasLocked && insertAt < 1) {
      insertAt = 1;
    }

    if (insertAt < 0) insertAt = 0;
    if (insertAt > targetGroups.length) insertAt = targetGroups.length;

    const newSourceGroups = sourceGroups.filter((_, idx) => idx !== fromIndex).map((g, i) => ({ ...g, position: i }));
    const movedGroup = { ...groupToMove };

    const newTargetGroups = [
      ...targetGroups.slice(0, insertAt),
      movedGroup,
      ...targetGroups.slice(insertAt),
    ];
    const finalTargetGroups = newTargetGroups.map((g, i) => ({ ...g, position: i }));

    const newSteps = steps.map((step, idx) => {
      if (idx === fromStep) {
        return {
          ...step,
          groups: newSourceGroups,
        };
      }
      if (idx === toStep) {
        return {
          ...step,
          groups: finalTargetGroups,
        };
      }
      return step;
    });

    setValue('steps', newSteps, { shouldDirty: true });
  };

  return {
    addGroup,
    moveGroup,
    duplicateGroup,
    deleteGroup,
    dragMoveGroup,
  };
}
