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
    const token = this.jwtService.getToken();

    // ⬇️ EVITAR añadir Authorization a ImgBB u otros dominios externos
    if (req.url.includes('imgbb.com')) {
      return next.handle(req);
    }

    // Añadir withCredentials: true para enviar cookies HttpOnly
    let authReq = req.clone({
      withCredentials: true
    });

    // Clonar la solicitud y añadir el encabezado Authorization si el token existe
    if (token) {
      authReq = authReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Manejar la solicitud y posibles errores
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es un 401 o 403 (No autorizado/Token inválido) - intentar refresh
        // EXCEPTO si viene de /refresh-token o /logout (evitar bucles infinitos)
        if ((error.status === 401 || error.status === 403) && 
            !req.url.includes('/refresh-token') && 
            !req.url.includes('/logout')) {
          return this.handle401Error(req, next);
        }

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
          
          // Re-intentar la petición original con el nuevo token
          return next.handle(this.addTokenHeader(request, res.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          
          // Si refresh falla, hacer logout y redirigir
          console.warn('❌ Refresh token expirado o inválido, cerrando sesión...');
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
      next: () => console.log('✅ Logout en backend exitoso'),
      error: (err) => console.warn('⚠️ No se pudo hacer logout en backend:', err)
    });
    
    // Redirigir al home
    this.router.navigate(['/']);
  }
}

