import { apiProxy } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export type FilterConfigItem = {
  value: string;
  label: string;
};

export type PartnershipTypeConfigItem = {
  value: string;
  label: string;
  categories?: FilterConfigItem[];
};

export type EventFilterConfigResponse = {
  status: FilterConfigItem[];
  timeFrame: FilterConfigItem[];
  partnershipTypes: PartnershipTypeConfigItem[];
  targetAudience: FilterConfigItem[];
  eventTypeId: FilterConfigItem[];
  createdBy: FilterConfigItem[];
};

const fetchEventFilterConfig = async (): Promise<EventFilterConfigResponse> => {
  const response = await apiProxy.get('/etr/events/filter-config');
  return response.data.data as EventFilterConfigResponse;
};

export const useEventFilterConfig = () => {
  return useQuery({
    queryKey: ['event-filter-config'],
    queryFn: fetchEventFilterConfig,
  });
};
