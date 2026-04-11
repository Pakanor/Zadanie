export interface DocumentItem {
  ordinal: number;
  product: string;
  quantity: number;
  price: number;
  taxRate: number;
}

export interface Document {
  id: number;
  type: string;
  date: string;
  firstName: string;
  lastName: string;
  city: string;
  itemsCount: number;
}

export interface DocumentDetails extends Document {
  items: DocumentItem[];
}

export interface PaginationResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DocumentFilter {
  type?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDescending?: boolean;
}
