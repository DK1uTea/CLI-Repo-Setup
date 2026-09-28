import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
  className?: string;
  href: string;
}

const ForwardButton = ({ className, href }: Props) => {
  return (
    <Button variant="outline-primary" size="icon-lg" href={href} className={cn("rounded-full", className)}>
      <ArrowLeft className="size-3.5 text-primary" />
    </Button>
  );
}

export default ForwardButton;