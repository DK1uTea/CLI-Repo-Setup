import EventAddressSearchFilter from "./event-address-search-filter";
import EventAddressTable from "./event-address-table";

const EventAddressMain = () => {
  return (
    <div className="flex flex-col gap-8 py-4">
      <EventAddressSearchFilter />
      <EventAddressTable />
    </div>
  );
}

export default EventAddressMain;
