import RentOrdersSearchFilter from "./rental-orders-search-filter";
import RentOrdersTable from "./rental-orders-table";

const RentalOrdersMain = () => {
  return (
    <div className="py-4 flex flex-col gap-8">
      <RentOrdersSearchFilter />
      <RentOrdersTable />
    </div>
  );
}

export default RentalOrdersMain