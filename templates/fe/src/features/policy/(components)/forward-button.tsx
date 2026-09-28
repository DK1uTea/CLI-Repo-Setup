import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type Props = {
  className?: string;
}

const ForwardButton = ({ className }: Props) => {
  return (
    <Button variant="outline" size="icon-lg" href="/login" className={cn("rounded-full border-destructive", className)}>
      <ArrowLeft className="size-5 text-destructive" />
    </Button>
  );
}

export default ForwardButton;