'use client';

import { Separator } from "@/shared/components/ui/separator";
import { PolicyType } from "../(helpers)/policy-content-map";
import { usePolicyContent } from "../(hooks)/use-policy-content";
import ForwardButton from "./forward-button";
import PolicyCopyright from "./policy-copyright";
import { formatDate, nowUtc } from '@/lib/date-utils';
import { useDateFormat } from '@/shared/stores/use-user-store';

type Props = {
  policy: PolicyType;
}

const PolicyMain = ({ policy }: Props) => {
  const dateFormat = useDateFormat();

  const {
    title,
    excerpt,
    content,
  } = usePolicyContent(policy)

  return (
    <div className="min-h-screen flex w-full shrink-0 flex-col items-center p-4 md:py-10 justify-between gap-12">
      <div className="w-full flex flex-col items-center gap-6">
        <ForwardButton className="self-start md:hidden" />
        <div className="w-full max-w-300 flex flex-col px-5 py-10 md:p-10 bg-card rounded-4xl shadow-lg gap-7">
          <div>
            <h1 className="text-start text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
            <span className="text-start text-sm text-muted-foreground">{formatDate(nowUtc(), dateFormat)}</span>
          </div>
          <Separator />
          <p className="text-start font-medium text-foreground text-lg">{excerpt}</p>
          <div
            className="text-start text-base text-muted-foreground [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground [&_p]:text-muted-foreground [&_p]:text-justify [&_ul]:list-inside [&_ul]:list-disc [&_li]:text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-80"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
      <PolicyCopyright />
    </div >
  );
}

export default PolicyMain;
