import EventsList from "./events-list";
import SelectEventHeader from "./select-event-header";

const SelectEventMain = () => {
  return (
    <div className="flex flex-col gap-4">
      <SelectEventHeader />
      <EventsList />
    </div>
  );
}

export default SelectEventMain;