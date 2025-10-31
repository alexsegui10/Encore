import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  status: 'active' | 'hidden' | 'archived';
  eventos: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminCategoryService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<AdminCategory[]> {
    return this.apiService.get('/api/categories', undefined, 3000, true)
      .pipe(map(data => data.categories));
  }

  getBySlug(slug: string): Observable<AdminCategory> {
    return this.apiService.get(`/api/categories/${slug}`, undefined, 3000, true)
      .pipe(map(data => data.category));
  }

  create(category: Partial<AdminCategory>): Observable<AdminCategory> {
    return this.apiService.post('/api/categories', { category }, 3000, true)
      .pipe(map(data => data.category));
  }

  update(slug: string, category: Partial<AdminCategory>): Observable<AdminCategory> {
    return this.apiService.put(`/api/categories/${slug}`, { category }, 3000, true)
      .pipe(map(data => data.category));
  }

  delete(slug: string): Observable<void> {
    return this.apiService.delete(`/api/categories/${slug}`, 3000, true);
  }
}
