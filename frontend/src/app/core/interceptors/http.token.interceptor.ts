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
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token: string | null = this.jwtService.getToken(); 

    if (req.url.includes('imgbb.com')) {
      return next.handle(req);
    }

    let authReq = req;

    if (token) {
      authReq = req.clone({
        withCredentials: true,
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Solo intentar refresh token si:
        // 1. Hay token
        // 2. Error es 401 o 403
        // 3. NO es una petición de refresh-token o logout
        // 4. NO es una petición al admin server (puerto 3000 o /api/auth/*)
        // 5. Es una petición específica de cliente (puerto 4000 explícito)
        if (token &&
          (error.status === 401 || error.status === 403) &&
          !req.url.includes('/refresh-token') &&
          !req.url.includes('/logout') &&
          !req.url.includes(':3000') &&
          !req.url.includes('/api/auth/') &&
          req.url.includes(':4000')) {
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
          return next.handle(this.addTokenHeader(request, res.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.handleAuthError();
          return throwError(() => err);
        })
      );
    } else {
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

  private handleAuthError() {
    this.userService.purgeAuth();
    this.userService.logout().subscribe();
    this.router.navigate(['/']);
  }
}

