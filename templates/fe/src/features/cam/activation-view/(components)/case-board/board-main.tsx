import KanbanBoard from "./kanban-board";
import SearchFilter from "./search-filter";
import DetailDrawer from "@/features/cam/activation-detail/(components)/activation-detail-drawer";

const BoardMain = () => {
  return (
    <div className="flex flex-col gap-4">
      <SearchFilter />
      <KanbanBoard />
      <DetailDrawer />
    </div>
  );
}

export default BoardMain;
