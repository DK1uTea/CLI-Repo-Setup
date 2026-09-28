'use client';

import { Link, usePathname } from "@/i18n/navigation";
import PreviewSurveyDialog from "@/features/reporting-tool/preview-survey/(components)/preview-survey-dialog";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { Copy, Ellipsis, Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { SurveyAction } from "./survey-action-alert-dialog";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

type Props = {
  surveyId: string;
  onActionChange: (action: SurveyAction) => void;
  canEdit?: boolean;
  disabled?: boolean;
}

const SurveyActionsDropdown = ({ surveyId, onActionChange, canEdit = true, disabled = false }: Props) => {
  const [paramEventId] = useQueryState("eventId", parseAsString);
  const [paramId] = useQueryState("id", parseAsString);
  const eventId = paramEventId || paramId;
  const [previewOpen, setPreviewOpen] = useState(false);
  const t = useTranslations("reportingTool.tradeFairEventForm.survey");

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const shouldReturn = pathname === '/reporting-tool/new-event' || pathname === '/reporting-tool/update-event';

  const params = new URLSearchParams();
  params.set("id", surveyId);
  if (eventId) params.set("eventId", eventId);
  if (shouldReturn) params.set("returnTo", currentPath);

  const updateSurveyHref = `/reporting-tool/update-survey?${params.toString()}`;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            className="text-primary"
            variant="ghost"
            size="icon"
            aria-label={t("actions.menu")}
            disabled={disabled}
            onClick={(event) => event.stopPropagation()}
          >
            <Ellipsis className="size-5" data-icon="inline-start" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setPreviewOpen(true)}>
              <Eye /> {t("actions.preview")}
            </DropdownMenuItem>
            {canEdit ? (
              <DropdownMenuItem asChild>
                <Link href={updateSurveyHref} className="flex items-center gap-1.5">
                  <Pencil /> {t("actions.edit")}
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => toast.error(t("actions.cannotEditWithAnswers"))}>
                <Pencil /> {t("actions.edit")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onActionChange("duplicate")}>
              <Copy /> {t("actions.duplicate")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onActionChange("delete")}>
              <Trash2 className="text-destructive" /> {t("actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {previewOpen && (
        <PreviewSurveyDialog
          surveyId={surveyId}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </>
  );
}

export default SurveyActionsDropdown;
