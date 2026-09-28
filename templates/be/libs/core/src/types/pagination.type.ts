export interface PagingQuery {
  page: number;
  pageSize: number;
}

export interface KeywordPagingQuery extends PagingQuery {
  keyword?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  pagination: PaginationMeta;
}
