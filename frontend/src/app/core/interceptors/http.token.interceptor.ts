import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { JwtService } from '../services/jwt.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Determinar qué token usar basado en el puerto de la URL
    let token: string | null = this.jwtService.getToken(); // Token del cliente por defecto

    // Si la petición es al puerto 3000 (admin), usar el token de admin
    if (req.url.includes(':3000')) {
      token = window.localStorage.getItem('admin_jwtToken');
      console.log('🔐 Admin request detected. Token:', token ? 'Existe' : 'NO EXISTE');
    }

  // Evitar añadir Authorization a ImgBB u otros dominios externos
    if (req.url.includes('imgbb.com')) {
      return next.handle(req);
    }

    // Solo añadir withCredentials si hay token (para enviar cookies HttpOnly)
    let authReq = req;

    if (token) {
      authReq = req.clone({
        withCredentials: true,
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ Token agregado al header:', authReq.url);
      console.log('✅ Headers:', authReq.headers.get('Authorization') ? 'Authorization presente' : 'Authorization AUSENTE');
    } else {
      console.warn('⚠️ No hay token para:', req.url);
    }

    // Manejar la solicitud y posibles errores
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es un 401 o 403 (No autorizado/Token inválido) - intentar refresh
        // EXCEPTO si viene de /refresh-token o /logout (evitar bucles infinitos)
        // Y SOLO si hay token (si no hay token, simplemente devolver el error)
        if (token &&
            (error.status === 401 || error.status === 403) &&
            !req.url.includes('/refresh-token') &&
            !req.url.includes('/logout')) {
          console.debug('Token expirado, intentando renovar...');
          return this.handle401Error(req, next);
        }

        // Si no hay token y es 401/403, devolver el error tal cual
        // para que el componente pueda manejarlo adecuadamente
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.userService.refreshToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(res.accessToken);

          console.debug('Token renovado exitosamente');

          // Re-intentar la petición original con el nuevo token
          return next.handle(this.addTokenHeader(request, res.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;

          // Si refresh falla, hacer logout y redirigir
          console.warn('Refresh token expirado o inválido, cerrando sesión...');
          this.handleAuthError();

          return throwError(() => err);
        })
      );
    } else {
      // Si ya estamos refreshing, esperar a que termine
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addTokenHeader(request, token)))
      );
    }
  }

  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    });
  }

  // Manejar la redirección y purga de autenticación cuando los tokens son inválidos
  private handleAuthError() {
    // Primero purgar localmente (esto es lo más importante)
    this.userService.purgeAuth();

    // Intentar hacer logout en el backend para limpiar la cookie (no bloqueante)
    this.userService.logout().subscribe({
  next: () => console.debug('Logout en backend exitoso'),
  error: (err) => console.warn('No se pudo hacer logout en backend:', err)
    });

    // Redirigir al home
    this.router.navigate(['/']);
  }
}

