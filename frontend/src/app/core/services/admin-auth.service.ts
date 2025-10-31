import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, distinctUntilChanged, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

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

  private readonly ADMIN_TOKEN_KEY = 'admin_jwtToken';

  constructor(
    private apiService: ApiService
  ) {}

  // Métodos para manejar el token del admin
  private getToken(): string | null {
    return window.localStorage.getItem(this.ADMIN_TOKEN_KEY);
  }

  private saveToken(token: string): void {
    window.localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
  }

  private destroyToken(): void {
    window.localStorage.removeItem(this.ADMIN_TOKEN_KEY);
  }

  populate(): void {
    const token = this.getToken();

    if (token) {
      this.apiService.get('/api/auth/me', undefined, 3000, true).subscribe({
        next: (data) => {
          console.log('✅ Populate exitoso, data:', data);
          this.setAuth({ ...data.admin, token });
        },
        error: (err) => {
          console.error('❌ Error al cargar admin:', {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            error: err.error,
            fullError: err
          });
          this.purgeAuth();
        }
      });
    } else {
      this.purgeAuth();
    }
  }

  setAuth(admin: Admin): void {
    if (admin.token) {
      this.saveToken(admin.token);
      console.log('🔑 Admin token guardado en localStorage');
    }
    this.currentAdminSubject.next(admin);
    this.isAuthenticatedSubject.next(true);
    console.log('✅ Admin autenticado:', admin.username);
  }

  purgeAuth(): void {
    this.destroyToken();
    this.currentAdminSubject.next({} as Admin);
    this.isAuthenticatedSubject.next(false);
    console.log('🚪 Sesión de admin cerrada');
  }

  login(credentials: { email: string; password: string }): Observable<Admin> {
    console.log('🔐 Intentando login de admin...', credentials.email);
    return this.apiService.post('/api/auth/login', { admin: credentials }, 3000)
      .pipe(
        tap(data => {
          console.log('📦 Respuesta COMPLETA del login:', data);
          console.log('📦 Token recibido:', data.token);
          console.log('📦 Admin recibido:', data.admin);

          if (!data.token) {
            console.error('❌ ERROR: No se recibió token en la respuesta!');
          }
          if (!data.admin) {
            console.error('❌ ERROR: No se recibió admin en la respuesta!');
          }

          this.setAuth({ ...data.admin, token: data.token });
        }),
        map(data => data.admin),
        catchError(error => {
          console.error('❌ Error en login:', error);
          throw error;
        })
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
