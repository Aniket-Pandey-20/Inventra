export interface Batch {
  quantity: number;
  costPerUnit: number;
  purchaseDate: Date;
}

export interface Product {
  id: string;
  name: string;
  currentQuantity: number;
  totalInventoryCost: number;
  averageCostPerUnit: number;
  batches: Batch[];
}

export interface Transaction {
  id: string;
  productId: string;
  type: 'purchase' | 'sale';
  quantity: number;
  costPerUnit: number;
  totalCost: number;
  timestamp: Date;
}
