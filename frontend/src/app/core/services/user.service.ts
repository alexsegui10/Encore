import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject, throwError } from 'rxjs';
import { map, distinctUntilChanged, tap, catchError } from 'rxjs/operators';

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

          if (err.status === 401 || err.status === 403) {
            console.warn('Token expirado, el interceptor intentará renovarlo...');
          } else {
            console.warn('Error al cargar usuario, limpiando sesión...', err);
            this.purgeAuth();
          }
        }
      });
    } else {
      console.debug('No hay token guardado');
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

  // Llamada para refrescar el access token usando el refresh token en cookie
  refreshToken(): Observable<any> {
    return this.apiService.post('/api/users/refresh-token', {}).pipe(
      tap((res: any) => {
        if (res.accessToken) {
          this.jwtService.saveToken(res.accessToken);
        }
      }),
      catchError(err => {
        console.warn('Refresh token expiró o es inválido');
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<any> {
    return this.apiService.post('/api/users/logout', {}).pipe(
      tap(() => {
        this.purgeAuth();
      }),
      catchError(err => {
        this.purgeAuth();
        return throwError(() => err);
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
          this.currentUserSubject.next(data.user);
          
          return data.user;
        })
      );
  }

  // Obtener perfil de cualquier usuario por username
  getProfile(username: string): Observable<{ profile: User }> {
    return this.apiService.get(`/api/profile/${username}`, undefined, 4000, true);
  }

  // Seguir a un usuario
  followUser(username: string): Observable<{ profile: User }> {
    return this.apiService.post(`/api/${username}/follow`, {}, 4000, true);
  }

  // Dejar de seguir a un usuario
  unfollowUser(username: string): Observable<{ profile: User }> {
    return this.apiService.delete(`/api/${username}/follow`, 4000, true);
  }

  // Obtener usuarios que sigue el usuario autenticado
  getFollowingUsers(): Observable<{ users: User[], usersCount: number }> {
    return this.apiService.get('/api/user/following', undefined, 4000, true);
  }
}

