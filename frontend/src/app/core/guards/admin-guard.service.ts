import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable, map, take } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AdminGuard implements CanActivate {
    constructor(private userService: UserService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.userService.currentUser$.pipe(
            take(1),
            map((user) => {
                // Check if user is authenticated
                if (!user) {
                    this.router.navigate(['/auth/login']);
                    return false;
                }

                // Check if user has admin role
                if (user.role === 'admin') {
                    return true;
                } else {
                    // User is authenticated but not admin, redirect to home
                    this.router.navigate(['/']);
                    return false;
                }
            })
        );
    }
}
