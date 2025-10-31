import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface AdminUser {
  id: string;
  uid: string;
  slug: string;
  username: string;
  email: string;
  bio: string;
  image: string | null;
  isActive: boolean;
  status: 'active' | 'blocked' | 'pending';
  favouriteEvents: string[];
  followingUsers: string[];
  comentarios: string[];
  reservas: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<AdminUser[]> {
    return this.apiService.get('/api/users', undefined, 3000, true)
      .pipe(map(data => data.users));
  }

  getByUid(uid: string): Observable<AdminUser> {
    return this.apiService.get(`/api/users/${uid}`, undefined, 3000, true)
      .pipe(map(data => data.user));
  }

  create(user: Partial<AdminUser>): Observable<AdminUser> {
    return this.apiService.post('/api/users', { user }, 3000, true)
      .pipe(map(data => data.user));
  }

  update(uid: string, user: Partial<AdminUser>): Observable<AdminUser> {
    return this.apiService.put(`/api/users/${uid}`, { user }, 3000, true)
      .pipe(map(data => data.user));
  }

  delete(uid: string): Observable<void> {
    return this.apiService.delete(`/api/users/${uid}`, 3000, true);
  }
}
