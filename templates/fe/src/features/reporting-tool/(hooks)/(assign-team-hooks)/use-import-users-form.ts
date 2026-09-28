import { useState } from "react";
import { useDropzone } from "react-dropzone";

type UseImportUsersFormProps = {
  onImportUsers?: (file: File) => void;
};

const ACCEPTED_USER_IMPORT_FILES = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "text/csv": [".csv"],
};

export const useImportUsersForm = ({ onImportUsers }: UseImportUsersFormProps = {}) => {
  const [file, setFile] = useState<File | null>(null);

  const reset = () => setFile(null);

  const dropzone = useDropzone({
    accept: ACCEPTED_USER_IMPORT_FILES,
    maxFiles: 1,
    multiple: false,
    onDrop: (acceptedFiles) => {
      const [acceptedFile] = acceptedFiles;

      if (acceptedFile) {
        setFile(acceptedFile);
      }
    },
  });

  const onSubmit = () => {
    if (!file) {
      return false;
    }

    onImportUsers?.(file);
    reset();
    return true;
  };

  return {
    file,
    dropzone,
    reset,
    onSubmit,
  };
};
