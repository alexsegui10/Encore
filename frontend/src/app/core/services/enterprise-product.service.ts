import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface EnterpriseProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockTotal: number;
  stockAvailable: number;
  image: string | null;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EnterpriseProductService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<EnterpriseProduct[]> {
    return this.apiService.get('/product', undefined, 5000, true)
      .pipe(map(data => data.products));
  }

  getById(id: string): Observable<EnterpriseProduct> {
    return this.apiService.get(`/product/${id}`, undefined, 5000, true)
      .pipe(map(data => data.product));
  }

  create(product: Partial<EnterpriseProduct>): Observable<EnterpriseProduct> {
    return this.apiService.post('/product', product, 5000, true)
      .pipe(map(data => data.product));
  }

  update(id: string, product: Partial<EnterpriseProduct>): Observable<EnterpriseProduct> {
    return this.apiService.patch(`/product/${id}`, product, 5000, true)
      .pipe(map(data => data.product));
  }

  delete(id: string): Observable<void> {
    return this.apiService.delete(`/product/${id}`, 5000, true);
  }

  getByCategory(categoryId: string): Observable<EnterpriseProduct[]> {
    return this.apiService.get(`/product-service/products/category/${categoryId}`, undefined, 5000, true)
      .pipe(map(data => data.products));
  }

  getRandomProducts(count: number = 3): Observable<EnterpriseProduct[]> {
    return this.apiService.get(`/product/random?count=${count}`, undefined, 5000, true)
      .pipe(map(data => data.products || []));
  }

  getProductsByIds(ids: string[]): Observable<EnterpriseProduct[]> {
    if (!ids || ids.length === 0) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    
    const idsParam = ids.join(',');
    return this.apiService.get(`/product/by-ids?ids=${idsParam}`, undefined, 5000, true)
      .pipe(map(data => data.products || []));
  }
}
