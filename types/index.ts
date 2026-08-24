export type ProductCategory =
  | 'boards'
  | 'insulation'
  | 'profiles'
  | 'accessories';

// Tags describe when a fictional product is useful to discover; they are not standalone certification claims.
export type PerformanceNeed = 'acoustic' | 'fire' | 'moisture';

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  performanceNeeds: PerformanceNeed[];
  features: string[];
  specifications: Specification[];
}
