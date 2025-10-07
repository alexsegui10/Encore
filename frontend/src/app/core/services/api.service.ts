import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient
  ) { }

  private formatErrors(error: any) {
    return throwError(error.error);
  }

  get(path: string, params?: HttpParams, port: number = 4000): Observable<any> {
    const httpParams = params || new HttpParams();
    return this.http.get(`${environment.api_url}:${port}${path}`, { params: httpParams })
      .pipe(catchError(this.formatErrors));
  }

  put(path: string, body: Object = {}, port: number = 4000): Observable<any> {
    return this.http.put(
      `${environment.api_url}:${port}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  post(path: string, body: any = {}, port: number = 4000): Observable<any> {
    return this.http.post(`${environment.api_url}:${port}${path}`, body).pipe(catchError(this.formatErrors));
  }

  delete(path: any, port: number = 4000): Observable<any> {
    return this.http.delete(
      `${environment.api_url}:${port}${path}`
    ).pipe(catchError(this.formatErrors));
  }
}