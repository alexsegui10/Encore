import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable, map, take } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UserTypeGuard implements CanActivate {
    constructor(private userService: UserService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        // Simplificado: solo verificar autenticación
        // Tu backend no maneja tipos de usuario específicos
        return this.userService.isAuthenticated$.pipe(
            take(1),
            map(isAuthenticated => {
                if (isAuthenticated) {
                    return true;
                } else {
                    // Redirigir al home si no está autenticado
                    this.router.navigate(['/']);
                    return false;
                }
            })
        );
    }
}
