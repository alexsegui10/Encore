import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { JwtService } from '../services/jwt.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private router: Router
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.jwtService.getToken();

    // Clonar la solicitud y añadir el encabezado de autorización si el token existe
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Manejar la solicitud y posibles errores
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es un 401 (No autorizado)
        if (error.status === 401) {
          console.warn('Token expirado o inválido, cerrando sesión...');
          this.handleAuthError();
        }
        
        // Si el error es un 403 (Prohibido) - token expirado
        if (error.status === 403) {
          console.warn('Acceso prohibido, posible token expirado...');
          this.handleAuthError();
        }

        return throwError(() => error);
      })
    );
  }

  // Manejar la redirección y purga de autenticación cuando los tokens son inválidos
  private handleAuthError() {
    this.userService.purgeAuth(); // Purgar la autenticación
    this.router.navigate(['/']); // Redirigir al home en lugar del login
  }
}
