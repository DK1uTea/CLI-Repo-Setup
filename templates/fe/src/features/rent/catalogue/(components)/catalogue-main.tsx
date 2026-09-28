import { SearchInput } from "@/shared/components/common/search-input";
import RentalCategories from "./rental-categories";
import ProductList from "./product-list";

const CatalogueMain = () => {
  return (
    <div className="py-4 flex flex-col gap-8">
      <SearchInput useDebounced className="w-full max-w-80 bg-card" />
      <RentalCategories />
      <ProductList />
    </div>
  );
}

export default CatalogueMain;
