import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface EnterpriseCategory {
  id: string;
  name: string;
  description: string | null;
  enterpriseId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnterpriseCategoryService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<EnterpriseCategory[]> {
    return this.apiService.get('/category', undefined, 5000, true)
      .pipe(map(data => data.categories));
  }

  getById(id: string): Observable<EnterpriseCategory> {
    return this.apiService.get(`/category/${id}`, undefined, 5000, true)
      .pipe(map(data => data.category));
  }

  create(category: Partial<EnterpriseCategory>): Observable<EnterpriseCategory> {
    return this.apiService.post('/category', category, 5000, true)
      .pipe(map(data => data.category));
  }

  update(id: string, category: Partial<EnterpriseCategory>): Observable<EnterpriseCategory> {
    return this.apiService.patch(`/category/${id}`, category, 5000, true)
      .pipe(map(data => data.category));
  }

  delete(id: string): Observable<void> {
    return this.apiService.delete(`/category/${id}`, 5000, true);
  }
}
