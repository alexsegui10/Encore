import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserTypeService } from '../services/user-type.service';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AdminGuard implements CanActivate {
    constructor(
        private userTypeService: UserTypeService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        const hasValidToken = this.userTypeService.updateRole();
        
        if (!hasValidToken) {
            this.router.navigate(['/admin/login']);
            return of(false);
        }
        
        if (this.userTypeService.isAdmin()) {
            return of(true);
        } else if (this.userTypeService.isAuthenticated()) {
            this.router.navigate(['/']);
            return of(false);
        } else {
            this.router.navigate(['/admin/login']);
            return of(false);
        }
    }
}
