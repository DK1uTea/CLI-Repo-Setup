import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  addUserDefaultValues,
  addUserSchema,
  type AddUserFormValues,
} from "@/features/reporting-tool/(helpers)/add-user-schema";

type UseAddUserFormProps = {
  onAddUser?: (values: AddUserFormValues) => void;
};

export const useAddUserForm = ({ onAddUser }: UseAddUserFormProps = {}) => {
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: addUserDefaultValues,
    mode: "onChange",
  });

  const onSubmit = (values: AddUserFormValues) => {
    onAddUser?.(values);
    form.reset();
  };

  return {
    form,
    onSubmit,
  };
};
