'use client';

import { useTranslations } from "next-intl";
import { useEventsList } from "../(hooks)/use-events-list";
import EventsListNoData from "./events-list-no-data";
import EventsListSkeleton from "./events-list-skeleton";
import TradeFairEventCard from "../../(components)/trade-fair-event-card";
import { LoadingIcon } from "@/shared/components/common/icons/icon-loading";
import { useInfiniteScroll } from "@/shared/hooks/use-infinite-scroll";

const EventsList = () => {
  const t = useTranslations("reportingTool.selectEvent");
  const {
    eventsList,
    isEventsListLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEventsList();
  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    enabled: !isFetchingNextPage,
  });

  if (isEventsListLoading) {
    return <EventsListSkeleton />;
  }

  if (eventsList.length === 0) {
    return <EventsListNoData />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {eventsList.map((event) => (
          <TradeFairEventCard key={event.id} event={event} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4" role="status">
          <span aria-hidden="true">
            <LoadingIcon className="size-6" />
          </span>
          <span className="sr-only">{t("loadingMore")}</span>
        </div>
      )}
    </div>
  );
}

export default EventsList;
