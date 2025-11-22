export interface TransportRecord {
  id: string;
  person: string;
  vehicle: string;
  crop: string;
  amountTons: number;
  sourceField: string;
  destination: string;
  date: string;
}

export type TransportRecordInput = Omit<TransportRecord, 'id' | 'date'>;

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  LOG_ENTRY = 'LOG_ENTRY',
  RECORDS = 'RECORDS',
}

export interface AggregatedStats {
  person: string;
  totalTons: number;
  trips: number;
}