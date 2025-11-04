import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, distinctUntilChanged, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';

export interface Admin {
  id: string;
  uid: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private currentAdminSubject = new BehaviorSubject<Admin>({} as Admin);
  public currentAdmin$ = this.currentAdminSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService
  ) { }

  populate(): void {
    const token = this.jwtService.getToken();

    if (token) {
      this.apiService.get('/api/auth/me', undefined, 3000, true).subscribe({
        next: (data) => {
          this.setAuth({ ...data.admin, token });
        },
        error: () => {
          this.purgeAuth();
        }
      });
    } else {
      this.purgeAuth();
    }
  }

  setAuth(admin: Admin): void {
    if (admin.token) {
      this.jwtService.saveToken(admin.token);
    }
    this.currentAdminSubject.next(admin);
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth(): void {
    this.jwtService.destroyToken();
    this.currentAdminSubject.next({} as Admin);
    this.isAuthenticatedSubject.next(false);
  }

  login(credentials: { email: string; password: string }): Observable<Admin> {
    return this.apiService.post('/api/auth/login', { admin: credentials }, 3000)
      .pipe(
        tap(data => {
          this.setAuth({ ...data.admin, token: data.token });
        }),
        map(data => data.admin)
      );
  }

  getCurrentAdmin(): Admin {
    return this.currentAdminSubject.value;
  }

  updateAdmin(admin: Partial<Admin>): Observable<Admin> {
    return this.apiService.put('/api/auth/me', { admin }, 3000, true)
      .pipe(
        tap(data => {
          const currentAdmin = this.currentAdminSubject.value;
          this.currentAdminSubject.next({ ...currentAdmin, ...data.admin });
        }),
        map(data => data.admin)
      );
  }

  logout(): void {
    this.purgeAuth();
  }
}
