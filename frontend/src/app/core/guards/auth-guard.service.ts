import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserTypeService } from '../services/user-type.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private userTypeService: UserTypeService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {
    const hasValidToken = this.userTypeService.updateRole();
    
    if (!hasValidToken) {
      this.router.navigate(['/auth/login']);
      return of(false);
    }
    
    if (this.userTypeService.isAuthenticated()) {
      return of(true);
    } else {
      this.router.navigate(['/auth/login']);
      return of(false);
    }
  }
}
