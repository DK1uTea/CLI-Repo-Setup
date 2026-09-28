import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type Props = {
  className?: string;
}

const ForwardButton = ({ className }: Props) => {
  return (
    <Button variant="outline-primary" size="icon-lg" href="/rent?tab=rented" className={cn("rounded-full", className)}>
      <ArrowLeft className="size-3.5 text-primary" />
    </Button>
  );
}

export default ForwardButton;