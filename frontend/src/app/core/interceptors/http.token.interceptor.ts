import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
    }

    // Manejar la solicitud y posibles errores
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es un 401 y el accessToken puede estar caducado
        if (error.status === 401) {
          // Verificar si el usuario está autenticado
          if (!this.userService.getCurrentUser()) {
            // Si el usuario no está autenticado, purgar la sesión y redirigir al login
            this.handleAuthError();
          }
        }
        return throwError(() => error);
      })
    );
  }

  // Manejar la redirección y purga de autenticación cuando los tokens son inválidos
  private handleAuthError() {
    this.userService.purgeAuth(); // Purgar la autenticación
    this.router.navigateByUrl('/login'); // Redirigir al login
  }
}
