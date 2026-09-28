import ForwardButton from "../../(components)/forward-button";

type Props = {
  leadName: string;
  eventId: string
}

const TradeFairLeadDetailHeader = ({ leadName, eventId }: Props) => {
  return (
    <div className="flex items-center gap-3" >
      <ForwardButton href={`/reporting-tool?eventId=${eventId}&tab=leads`} />
      < p className="font-bold text-2xl" > {leadName} </p>
    </div>
  );
}

export default TradeFairLeadDetailHeader;