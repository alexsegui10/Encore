import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService
  ) {}

  populate(): void {
    console.log('🔍 Verificando token guardado en localStorage...');
    const token = this.jwtService.getToken();

    if (token) {
      console.log('✅ Token encontrado, verificando con servidor...');
      this.apiService.get('/api/user', undefined, 4000, true).subscribe({
        next: (data) => {
          console.log('✅ Usuario verificado exitosamente', data);
          this.setAuth({ ...data.user, token });
        },
        error: (err) => {
          console.warn('❌ Token inválido o expirado, limpiando sesión...', err);
          this.purgeAuth();
        }
      });
    } else {
      console.log('❌ No hay token guardado');
      this.purgeAuth();
    }
  }

  setAuth(user: User): void {
    console.log('🔐 Guardando autenticación para usuario:', user.username);

    if (user?.token) {
      this.jwtService.saveToken(user.token);
      console.log('💾 Token guardado en localStorage');
    }

    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);

    console.log('✅ Usuario autenticado correctamente');
  }

  purgeAuth(): void {
    console.log('🔓 Cerrando sesión y limpiando datos...');
    this.jwtService.destroyToken();
    this.currentUserSubject.next({} as User);
    this.isAuthenticatedSubject.next(false);
    console.log('✅ Sesión cerrada correctamente');
  }

  attemptAuth(type: 'login' | 'register', credentials: Partial<User>): Observable<User> {
  const route = ('' + type === 'login') ? '/login' : '';
    return this.apiService
      .post(`/api/users${route}`, { user: credentials })
      .pipe(
        map((data: any) => {
          const user = (data?.user ?? data) as User;
          // soporta backends que no devuelven 'user.token' estándar
          const token = (user as any).token ?? (user as any).accessToken ?? (user as any).jwt;
          if (token) user.token = token;
          this.setAuth(user);
          return user;
        })
      );
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  update(user: Partial<User>): Observable<User> {
    return this.apiService
      .put('/api/user', { user }, 4000, true) // withAuth: true
      .pipe(
        map((data: { user: User }) => {
          this.currentUserSubject.next(data.user);
          return data.user;
        })
      );
  }
}
