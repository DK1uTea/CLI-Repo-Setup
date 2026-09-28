import { FileTextIcon } from "lucide-react";
import type { DropzoneState } from "react-dropzone";

import { cn } from "@/lib/utils";

type ImportUsersDropzoneProps = {
  dropzone: DropzoneState;
  file: File | null;
  dropText: string;
  browseText: string;
};

const ImportUsersDropzone = ({
  dropzone,
  file,
  dropText,
  browseText,
}: ImportUsersDropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = dropzone;

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 text-center transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary"
      )}
    >
      <input {...getInputProps()} />
      <FileTextIcon className="text-muted-foreground" />
      <p className="text-sm text-primary">
        {file ? file.name : dropText}
      </p>
      <p className="text-xs font-medium text-muted-foreground">{browseText}</p>
    </div>
  );
};

export default ImportUsersDropzone;
