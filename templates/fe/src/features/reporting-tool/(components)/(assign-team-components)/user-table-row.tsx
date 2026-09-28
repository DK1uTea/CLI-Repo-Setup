"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { UserEventSurvey } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import UserDeleteAlertDialog from "./user-delete-alert-dialog";

const roleOptions = [
  { value: "PROMOTER", labelKey: "promoter" },
  { value: "SALES_REP", labelKey: "salesRep" },
  { value: "ADMIN", labelKey: "admin" },
] as const;

const avatarFallbackColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500 ",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

type Props = {
  user: UserEventSurvey;
  onDelete?: () => void;
  onRoleChange?: (newRole: UserEventSurvey["role"]) => void;
};

const getUserName = (user: UserEventSurvey) => {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
};

const getUserInitials = (user: UserEventSurvey) => {
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .join("");

  return (initials || user.email.charAt(0)).slice(0, 2).toUpperCase();
};

const getAvatarFallbackColor = (user: UserEventSurvey) => {
  const value = user.id || user.email;
  const colorIndex = Array.from(value).reduce((sum, character) => (
    sum + character.charCodeAt(0)
  ), 0) % avatarFallbackColors.length;

  return avatarFallbackColors[colorIndex];
};

const UserTableRow = ({ user, onDelete, onRoleChange }: Props) => {
  const t = useTranslations("reportingTool.tradeFairEventForm.assignTeam.roles");
  const [role, setRole] = useState<UserEventSurvey["role"]>(user.role);
  const userName = getUserName(user);

  const handleRoleChange = (value: string) => {
    const newRole = value as UserEventSurvey["role"];
    setRole(newRole);
    onRoleChange?.(newRole);
  };

  return (
    <TableRow className="h-14">
      <TableCell className="px-5">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback className={`font-semibold text-card ${getAvatarFallbackColor(user)}`}>
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="font-semibold text-sm">{userName}</span>
            <span className="truncate text-muted-foreground text-sm">{user.email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-5">
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-36 text-muted-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="w-0 whitespace-nowrap px-5">
        <div className="flex justify-end">
          <UserDeleteAlertDialog userName={userName} onConfirm={onDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
