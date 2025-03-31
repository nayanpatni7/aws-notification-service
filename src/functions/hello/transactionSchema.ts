export interface Transaction {
  id: string;
  amount: number;
  createdAt: Date;
  externalId?: string;
  from?: string;
  reference: string;
  status: string;
  to?: string;
  type: string;
  updatedAt: Date;
  metadata: Record<string, unknown>;
  info?: Record<string, unknown>;
}
