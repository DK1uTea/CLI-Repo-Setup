'use client';

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import { useDateFormat } from "@/shared/stores/use-user-store";
import { Download, Loader2 } from "lucide-react";
import { AnswerUser, AnswerStatus } from "../../(helpers)/trade-fair-answer-type";
import { Card, CardContent } from "@/shared/components/ui/card";
import { AnswerStatusBadge } from "../../(components)/answer-status-badge";
import { useTranslations } from "next-intl";
import { useAnswerExport } from "../../answers-overview/(hooks)/use-answer-export";

type Props = {
  user: AnswerUser | null;
  createdAt: string;
  status: AnswerStatus;
  eventId?: string;
  answerId?: string;
}

const UserCreateInfo = ({ user, createdAt, status, eventId, answerId }: Props) => {
  const dateFormat = useDateFormat();
  const t = useTranslations("reportingTool.answersOverview");
  const tDetail = useTranslations("reportingTool.answerDetail");
  const { exportAnswers, isExporting } = useAnswerExport({ eventId, ids: answerId });

  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName?.[0] || '';
    const l = lastName?.[0] || '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
    || user?.email
    || t("anonymous");

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user
                  ? getInitials(user.firstName, user.lastName)
                  : t("anonymous").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{tDetail("madeBy")} {fullName}</p>
                <AnswerStatusBadge status={status}>
                  {t(`status.${status}`)}
                </AnswerStatusBadge>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(createdAt, dateFormat, true)}</p>
            </div>
          </div>
          <Button
            onClick={exportAnswers}
            disabled={isExporting || !eventId}
          >
            {t("export")}
            {isExporting ? (
              <Loader2 className="animate-spin" data-icon="inline-end" />
            ) : (
              <Download data-icon="inline-end" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserCreateInfo;
