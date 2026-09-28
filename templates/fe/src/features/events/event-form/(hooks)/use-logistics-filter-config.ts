import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

type LogisticsFilterConfigResponse = {
  warehouses: {
    code: string;
    name: string;
  }[];
}

const fetchLogisticsFilterConfig = async (): Promise<LogisticsFilterConfigResponse> => {
  const response = await apiProxy.get('/etr/logistics/filter-config');
  return response.data.data as LogisticsFilterConfigResponse;
}

export const useLogisticsFilterConfig = () => {
  return useQuery({
    queryKey: ['logistics-filter-config'],
    queryFn: fetchLogisticsFilterConfig,
    staleTime: Infinity,
  });
}
