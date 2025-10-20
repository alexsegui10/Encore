import { Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Observables globales para reactividad en toda la página (con $)
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser$ = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Signal para detectar cuando se cierra sesión
  public logoutSignal = signal<number>(0);

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService
  ) {}

  populate(): void {
    const token = this.jwtService.getToken();

    if (token) {
      this.apiService.get('/api/user', undefined, 4000, true).subscribe({
        next: (data) => {
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

    if (user?.token) {
      this.jwtService.saveToken(user.token);
    }

    // Actualizar observables globales
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);

  }

  purgeAuth(): void {
    this.jwtService.destroyToken();
    
    // Actualizar observables globales
    this.currentUserSubject.next({} as User);
    this.isAuthenticatedSubject.next(false);
    
    // Emitir signal de logout para actualizar contenido reactivamente
    this.logoutSignal.update(value => value + 1);
    
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

  getCurrentUser(): Observable<User> {
    return this.currentUser$;
  }

  update(user: Partial<User>): Observable<User> {
    return this.apiService
      .put('/api/user', { user }, 4000, true) // withAuth: true
      .pipe(
        map((data: { user: User }) => {
          // Actualizar observables globales - esto causará reactividad automática
          this.currentUserSubject.next(data.user);
          
          return data.user;
        })
      );
  }

  // Obtener perfil de cualquier usuario por username
  getProfile(username: string): Observable<{ profile: User }> {
    return this.apiService.get(`/api/profile/${username}`);
  }
}
