export type EventAnalyticStats = {
  totalLeads: number;
  totalLeadsYesterday: number;
  totalLeadsChangePercent: number;
  newLeads: number;
  newLeadsLastHour: number;
  newLeadsChangePercent: number;
  existingLeads: number;
  existingLeadsYesterday: number;
  existingLeadsChangePercent: number;
  leadsToday: number;
  leadsYesterday: number;
  leadsTodayChangePercent: number;
};

export type EventAnalyticLeadsTimelinePoint = {
  date: string;
  newLeads: number;
  existingLeads: number;
};
