import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserTypeService } from '../services/user-type.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NonAdminGuard implements CanActivate {
  constructor(
    private userTypeService: UserTypeService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {
    this.userTypeService.updateRole();
    
    // Si es admin, redirigir al dashboard
    if (this.userTypeService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
      return of(false);
    }
    
    // Permitir acceso a usuarios no autenticados y clientes
    return of(true);
  }
}
