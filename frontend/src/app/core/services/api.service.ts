import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private jwt: JwtService
  ) { }

  private formatErrors(error: any) {
    // devolvemos el body de error tal como hacías
    return throwError(error?.error ?? error);
  }

  // headers opcionales de auth, solo si withAuth === true
  private buildOptions(params?: HttpParams, withAuth: boolean = false) {
    let headers = new HttpHeaders({ 'Accept': 'application/json' });
    if (withAuth) {
      const token = this.jwt.getToken();
      if (token) {
        // Si tu backend requiere 'Token ' en vez de 'Bearer ', cambia aquí.
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return { params: params || new HttpParams(), headers };
  }

  get(path: string, params?: HttpParams, port: number = 4000, withAuth: boolean = false): Observable<any> {
    return this.http
      .get(`${environment.api_url}:${port}${path}`, this.buildOptions(params, withAuth))
      .pipe(catchError(this.formatErrors));
  }

  put(path: string, body: object = {}, port: number = 4000, withAuth: boolean = false): Observable<any> {
    const options = this.buildOptions(undefined, withAuth);
    // nos aseguramos de mandar JSON
    const headers = options.headers.set('Content-Type', 'application/json');
    return this.http
      .put(`${environment.api_url}:${port}${path}`, body, { ...options, headers })
      .pipe(catchError(this.formatErrors));
  }

  post(path: string, body: any = {}, port: number = 4000, withAuth: boolean = false): Observable<any> {
    const options = this.buildOptions(undefined, withAuth);
    return this.http
      .post(`${environment.api_url}:${port}${path}`, body, options)
      .pipe(catchError(this.formatErrors));
  }

  delete(path: string, port: number = 4000, withAuth: boolean = false): Observable<any> {
    return this.http
      .delete(`${environment.api_url}:${port}${path}`, this.buildOptions(undefined, withAuth))
      .pipe(catchError(this.formatErrors));
  }
}
