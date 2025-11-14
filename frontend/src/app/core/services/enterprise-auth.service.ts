import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, distinctUntilChanged, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';

export interface Enterprise {
  id: string;
  uid: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnterpriseAuthService {
  private currentEnterpriseSubject = new BehaviorSubject<Enterprise>({} as Enterprise);
  public currentEnterprise$ = this.currentEnterpriseSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService
  ) { }

  populate(): void {
    const token = this.jwtService.getToken();

    if (token) {
      this.apiService.get('/enterprise/auth/me', undefined, 5000, true).subscribe({
        next: (data) => {
          this.setAuth({ ...data.enterprise, token });
        },
        error: () => {
          this.purgeAuth();
        }
      });
    } else {
      this.purgeAuth();
    }
  }

  setAuth(enterprise: Enterprise): void {
    if (enterprise.token) {
      this.jwtService.saveToken(enterprise.token);
    }
    this.currentEnterpriseSubject.next(enterprise);
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth(): void {
    this.jwtService.destroyToken();
    this.currentEnterpriseSubject.next({} as Enterprise);
    this.isAuthenticatedSubject.next(false);
  }

  login(uid: string): Observable<Enterprise> {
    return this.apiService.post('/enterprise/auth/login', { uid }, 5000)
      .pipe(
        tap(data => {
          this.setAuth({ ...data.enterprise, token: data.token });
        }),
        map(data => data.enterprise)
      );
  }

  getCurrentEnterprise(): Enterprise {
    return this.currentEnterpriseSubject.value;
  }

  updateEnterprise(enterprise: Partial<Enterprise>): Observable<Enterprise> {
    return this.apiService.put('/enterprise/auth/me', enterprise, 5000, true)
      .pipe(
        tap(data => {
          const currentEnterprise = this.currentEnterpriseSubject.value;
          this.currentEnterpriseSubject.next({ ...currentEnterprise, ...data.enterprise });
        }),
        map(data => data.enterprise)
      );
  }

  logout(): void {
    this.purgeAuth();
  }
}
