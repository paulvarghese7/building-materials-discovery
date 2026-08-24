export type ProductType =
  | 'boards'
  | 'insulation'
  | 'profiles'
  | 'accessories';

// Tags describe when a fictional product is useful to discover; they are not standalone certification claims.
export type ProjectRequirement = 'acoustic' | 'fire' | 'moisture';

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  productType: ProductType;
  shortDescription: string;
  description: string;
  projectRequirements: ProjectRequirement[];
  features: string[];
  specifications: Specification[];
}
