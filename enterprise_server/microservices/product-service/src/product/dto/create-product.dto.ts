export class CreateProductDto {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  stockTotal?: number;
  stockAvailable?: number;
  image?: string;
  status?: 'draft' | 'active' | 'hidden' | 'soldout';
  categoryId?: string;
}
